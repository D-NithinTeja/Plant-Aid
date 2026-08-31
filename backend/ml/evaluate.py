"""Step 5 of the training plan: single-shot test-set evaluation, error review,
and latency benchmark (Docs/plan.md §4 Step 5).

Usage:
    python evaluate.py --checkpoint artifacts/convnext_tiny_best.pt \
        --data-dir <path/to/input_images> [--split test] [--bench-cpu]
"""

from __future__ import annotations

import argparse
import json
import shutil
import statistics
import time
from pathlib import Path

import torch
import torch.nn.functional as F
from sklearn.metrics import accuracy_score, classification_report, f1_score
from torch.utils.data import DataLoader

from dataset import PlantDataset
from ml_config import CLASS_ALLOWLIST, DEFAULT_DATA_DIR, IMG_SIZE
from model import build_model
from train import plot_confusion

ML_DIR = Path(__file__).resolve().parent


@torch.inference_mode()
def collect_predictions(model, loader, device):
    """Per-sample predictions, max-softmax probabilities, losses and targets."""
    model.eval()
    all_probs, all_losses, all_preds, all_targets = [], [], [], []
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        logits = model(images)
        all_probs.append(F.softmax(logits.float(), dim=1).cpu())
        all_losses.append(F.cross_entropy(logits.float(), targets, reduction="none").cpu())
        all_preds.extend(logits.argmax(dim=1).cpu().tolist())
        all_targets.extend(targets.cpu().tolist())
    return torch.cat(all_probs), torch.cat(all_losses), all_preds, all_targets


@torch.inference_mode()
def benchmark_latency(model, device, img_size: int, warmup: int = 10, runs: int = 100) -> float:
    """Median single-image latency in milliseconds."""
    example = torch.randn(1, 3, img_size, img_size, device=device)
    for _ in range(warmup):
        model(example)
    if device.type == "cuda":
        torch.cuda.synchronize()
    timings = []
    for _ in range(runs):
        started = time.perf_counter()
        model(example)
        if device.type == "cuda":
            torch.cuda.synchronize()
        timings.append((time.perf_counter() - started) * 1000.0)
    return statistics.median(timings)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkpoint", type=Path, default=ML_DIR / "artifacts" / "convnext_tiny_best.pt")
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--manifest-dir", type=Path, default=ML_DIR / "data")
    parser.add_argument("--out-dir", type=Path, default=ML_DIR / "artifacts")
    parser.add_argument("--split", choices=["test", "val"], default="test")
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--bench-cpu", action="store_true", help="also benchmark CPU latency")
    parser.add_argument("--top-k-errors", type=int, default=30)
    args = parser.parse_args()

    checkpoint = torch.load(args.checkpoint, map_location="cpu", weights_only=False)
    arch: str = checkpoint["arch"]
    class_to_idx: dict[str, int] = checkpoint["class_to_idx"]
    idx_to_class = {idx: name for name, idx in class_to_idx.items()}
    device = torch.device(args.device)

    model = build_model(arch, num_classes=len(CLASS_ALLOWLIST), pretrained=False)
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)

    split_csv = args.manifest_dir / f"{args.split}_split.csv"
    dataset = PlantDataset(split_csv, args.data_dir, "eval", class_to_idx)
    loader = DataLoader(dataset, batch_size=args.batch_size, num_workers=args.num_workers)

    probs, losses, preds, targets = collect_predictions(model, loader, device)

    report = classification_report(
        targets, preds, target_names=CLASS_ALLOWLIST, digits=4, zero_division=0
    )
    metrics = {
        "checkpoint": str(args.checkpoint),
        "split": args.split,
        "n": len(targets),
        "arch": arch,
        "epoch": checkpoint.get("epoch"),
        "accuracy": accuracy_score(targets, preds),
        "macro_f1": f1_score(targets, preds, average="macro", zero_division=0),
        "weighted_f1": f1_score(targets, preds, average="weighted", zero_division=0),
        "per_class": classification_report(
            targets, preds, target_names=CLASS_ALLOWLIST, digits=4, zero_division=0, output_dict=True
        ),
    }

    print(f"\n=== {arch} on {args.split} (n={len(targets)}) ===")
    print(report)
    print(f"accuracy {metrics['accuracy']:.4f} | macro-F1 {metrics['macro_f1']:.4f} | weighted-F1 {metrics['weighted_f1']:.4f}")

    plot_confusion(preds, targets, args.out_dir / f"{args.split}_confusion_{arch}.png",
                   title=f"{args.split} confusion — {arch}")

    # Error review: copy the highest-loss misclassifications for manual inspection.
    review_dir = args.out_dir / "review" / f"top{args.top_k_errors}_errors_{args.split}"
    review_dir.mkdir(parents=True, exist_ok=True)
    split_df = dataset.df.reset_index(drop=True)
    error_rows = [
        i for i in range(len(targets)) if preds[i] != targets[i]
    ]
    error_rows.sort(key=lambda i: losses[i].item(), reverse=True)
    for rank, i in enumerate(error_rows[: args.top_k_errors], start=1):
        source = args.data_dir / split_df.iloc[i]["filepath"]
        name = (
            f"rank{rank:02d}_true_{idx_to_class[targets[i]]}_pred_{idx_to_class[preds[i]]}"
            f"_loss{losses[i].item():.2f}_{split_df.iloc[i]['filepath']}"
        )
        shutil.copy2(source, review_dir / name)
    print(f"error review: {min(len(error_rows), args.top_k_errors)} images -> {review_dir}")

    # Latency (SC-3: <=100 ms GPU / <=400 ms CPU for a single 224x224 frame).
    metrics["latency_ms"] = {"gpu_median" if device.type == "cuda" else "device_median": benchmark_latency(model, device, IMG_SIZE)}
    if args.bench_cpu and device.type != "cpu":
        cpu_model = build_model(arch, num_classes=len(CLASS_ALLOWLIST), pretrained=False)
        cpu_model.load_state_dict(checkpoint["state_dict"])
        cpu_model.eval()
        metrics["latency_ms"]["cpu_median"] = benchmark_latency(cpu_model, torch.device("cpu"), IMG_SIZE, runs=50)
    print("latency ms:", metrics["latency_ms"])

    # SC-2 watch item: recall of each class.
    per_class_recall = {name: metrics["per_class"][name]["recall"] for name in CLASS_ALLOWLIST}
    metrics["min_class_recall"] = min(per_class_recall.values())
    metrics["min_class_recall_name"] = min(per_class_recall, key=per_class_recall.get)
    print("min class recall:", metrics["min_class_recall_name"], f"{metrics['min_class_recall']:.4f}")

    out_path = args.out_dir / f"metrics_{arch}.json"
    out_path.write_text(json.dumps(metrics, indent=2))
    print(f"metrics -> {out_path}")


if __name__ == "__main__":
    main()
