"""Step 7 of the training plan: export TorchScript, write labels.json, calibrate
the confidence threshold, and run the Grad-CAM smoke test (Docs/plan.md §4 Step 7).

Usage:
    python export.py --checkpoint artifacts/convnext_tiny_best.pt \
        --data-dir <path/to/input_images>
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import DataLoader
from torchvision import transforms as T

from dataset import EVAL_TRANSFORM, PlantDataset
from ml_config import CLASS_ALLOWLIST, CLASS_DISPLAY, DEFAULT_DATA_DIR, HEALTHY_CLASS, IMG_SIZE
from model import build_model, gradcam_target_layers
from train import ML_DIR

TAU_START = 0.55  # plan default; superseded by the calibration sweep below


def load_model(checkpoint_path: Path, device: torch.device):
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    arch: str = checkpoint["arch"]
    class_to_idx: dict[str, int] = checkpoint["class_to_idx"]
    if sorted(class_to_idx, key=class_to_idx.get) != CLASS_ALLOWLIST:
        raise SystemExit("checkpoint class order does not match ml_config.CLASS_ALLOWLIST")
    model = build_model(arch, num_classes=len(CLASS_ALLOWLIST), pretrained=False)
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device).eval()
    return model, checkpoint, class_to_idx


@torch.inference_mode()
def collect_val_probs(model, loader, device):
    """Max-softmax probability, predicted and true index for every val image."""
    max_probs, preds, targets = [], [], []
    for images, batch_targets in loader:
        images = images.to(device)
        probs = F.softmax(model(images).float(), dim=1).cpu()
        max_probs.extend(probs.max(dim=1).values.tolist())
        preds.extend(probs.argmax(dim=1).tolist())
        targets.extend(batch_targets.tolist())
    return np.array(max_probs), np.array(preds), np.array(targets)


def calibrate_threshold(max_probs, preds, targets, healthy_idx: int,
                        precision_target: float, tau_start: float) -> tuple[float, dict]:
    """Smallest tau in [0.50, 0.95] where alert precision >= target; else tau_start.

    An "alert" is a frame the backend would report as a disease (predicted
    non-healthy with confidence >= tau). Alert precision = fraction of alerts
    where the predicted class is the true class (which implies truly diseased).
    """
    healthy_pred = preds == healthy_idx
    sweep = []
    chosen = None
    for tau in np.arange(0.50, 0.9501, 0.01):
        alerts = (max_probs >= tau) & ~healthy_pred
        if alerts.sum() == 0:
            continue
        precision = float((preds[alerts] == targets[alerts]).mean())
        coverage = float(alerts.mean())
        sweep.append({"tau": round(float(tau), 2), "alert_precision": round(precision, 4), "alert_coverage": round(coverage, 4)})
        if chosen is None and precision >= precision_target and tau >= tau_start - 1e-9:
            chosen = round(float(tau), 2)
    if chosen is None:
        print(f"WARNING: no tau reached precision {precision_target:.2f}; falling back to tau_start={tau_start}")
        chosen = tau_start
    return chosen, sweep


def export_torchscript(model, arch: str, out_dir: Path) -> Path:
    """Script the model (trace fallback), then verify the artifact reproduces logits."""
    example = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    try:
        scripted = torch.jit.script(model.cpu())
    except Exception as exc:  # noqa: BLE001 - trace fallback per plan Step 7.1
        print(f"torch.jit.script failed ({exc}); falling back to trace")
        scripted = torch.jit.trace(model.cpu(), example)
    out_path = out_dir / f"{arch}_groundnut.ts"
    scripted.save(str(out_path))

    with torch.inference_mode():
        expected = model(example)
        reloaded = torch.jit.load(str(out_path))
        actual = reloaded(example)
    if not torch.allclose(expected, actual, atol=1e-4):
        raise SystemExit("TorchScript artifact diverged from eager model")
    return out_path


def gradcam_smoke_test(model, device: torch.device, arch: str, dataset, samples: int, out_dir: Path) -> None:
    """Render Grad-CAM overlays for N val images (plan Step 7.4)."""
    if samples <= 0:
        return
    from gradcam import GradCAM, overlay_cam

    cam = GradCAM(model=model, target_layers=gradcam_target_layers(model, arch))
    cam_dir = out_dir / "gradcam_samples"
    cam_dir.mkdir(parents=True, exist_ok=True)

    to_rgb = T.Compose([T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor()])
    count = min(samples, len(dataset))
    for i in range(count):
        row = dataset.df.iloc[i]
        with Image.open(dataset.data_dir / row["filepath"]) as image:
            rgb_image = image.convert("RGB")
            rgb = to_rgb(rgb_image)
            input_tensor = EVAL_TRANSFORM(rgb_image).unsqueeze(0).to(device)
        grayscale = cam(input_tensor)[0].cpu()
        Image.fromarray(overlay_cam(rgb, grayscale)).save(cam_dir / f"cam_{i:02d}_{row['label']}.png")
    cam.close()
    print(f"Grad-CAM smoke test: {count} overlays -> {cam_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkpoint", type=Path, default=ML_DIR / "artifacts" / "convnext_tiny_best.pt")
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--manifest-dir", type=Path, default=ML_DIR / "data")
    parser.add_argument("--out-dir", type=Path, default=ML_DIR / "artifacts")
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--precision-target", type=float, default=0.90)
    parser.add_argument("--tau-start", type=float, default=TAU_START)
    parser.add_argument("--gradcam-samples", type=int, default=20)
    args = parser.parse_args()

    device = torch.device(args.device)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    model, checkpoint, class_to_idx = load_model(args.checkpoint, device)
    arch = checkpoint["arch"]

    # labels.json — consumed by backend/app/services/ml_engine.py. disease_id
    # values must match the D2 seed rows (ml_config.CLASS_DISPLAY).
    labels = {
        "arch": arch,
        "input_size": IMG_SIZE,
        "confidence_threshold": None,  # filled below
        "classes": [
            {
                "index": idx,
                "class_key": name,
                "disease_id": CLASS_DISPLAY[name]["disease_id"],
                "disease_name": CLASS_DISPLAY[name]["disease_name"],
                "is_healthy": CLASS_DISPLAY[name]["is_healthy"],
            }
            for name, idx in class_to_idx.items()
        ],
    }

    # Threshold calibration on val (plan Step 7.3).
    val_ds = PlantDataset(args.manifest_dir / "val_split.csv", args.data_dir, "eval", class_to_idx)
    val_loader = DataLoader(val_ds, batch_size=64, num_workers=0)
    max_probs, preds, targets = collect_val_probs(model, val_loader, device)
    healthy_idx = class_to_idx[HEALTHY_CLASS]
    tau, sweep = calibrate_threshold(max_probs, preds, targets, healthy_idx, args.precision_target, args.tau_start)
    labels["confidence_threshold"] = tau
    print(f"calibrated confidence_threshold = {tau} (target precision {args.precision_target:.2f}, {len(sweep)} taus swept)")

    ts_path = export_torchscript(model, arch, args.out_dir)
    print(f"TorchScript artifact -> {ts_path}")
    model.to(device)  # export_torchscript moves the eager model to CPU for scripting

    gradcam_smoke_test(model, device, arch, val_ds, args.gradcam_samples, args.out_dir)

    labels_path = args.out_dir / "labels.json"
    labels_path.write_text(json.dumps(labels, indent=2))
    (args.out_dir / "tau_sweep.json").write_text(json.dumps(sweep, indent=2))
    print(f"labels.json -> {labels_path}")
    print("\nbackend handoff: copy", ts_path.name, "and labels.json into backend/ml/")


if __name__ == "__main__":
    main()
