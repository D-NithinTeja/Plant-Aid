"""Step 4 of the training plan: fine-tune a pretrained backbone on the
groundnut splits (Docs/plan.md §4 Step 4).

Local CPU smoke test (2-3 min, validates the full loop):
    uv run python train.py --epochs 1 --batch-size 8 --limit-steps 5 --num-workers 0

Full GPU run (e.g. Colab T4; see ml/COLAB.md for the sanctioned non-uv workflow):
    uv run python train.py --data-dir <path/to/input_images> --num-workers 8
"""

from __future__ import annotations

import argparse
import csv
import math
import random
import time
from pathlib import Path

import torch
from sklearn.metrics import confusion_matrix, f1_score
from torch.utils.data import DataLoader
from tqdm import tqdm

from dataset import PlantDataset
from ml_config import CLASS_ALLOWLIST, DEFAULT_DATA_DIR, IMG_SIZE, SEED
from model import build_model, split_param_groups

ML_DIR = Path(__file__).resolve().parent


def seed_everything(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def make_lr_lambda(warmup_steps: int, total_steps: int):
    """Linear warmup to 1.0, then cosine decay to ~0.0; stepped per optimizer step."""

    def lr_lambda(step: int) -> float:
        if step < warmup_steps:
            return (step + 1) / max(1, warmup_steps)
        progress = (step - warmup_steps) / max(1, total_steps - warmup_steps)
        return 0.5 * (1.0 + math.cos(math.pi * min(1.0, progress)))

    return lr_lambda


@torch.inference_mode()
def run_eval(model, loader, device, criterion):
    """Return (mean_loss, accuracy, macro_f1, preds, targets) over a loader."""
    model.eval()
    total_loss, correct, seen = 0.0, 0, 0
    all_preds: list[int] = []
    all_targets: list[int] = []
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        with torch.autocast(device.type, enabled=device.type == "cuda"):
            logits = model(images)
            loss = criterion(logits, targets)
        total_loss += loss.item() * images.size(0)
        preds = logits.argmax(dim=1)
        correct += (preds == targets).sum().item()
        seen += images.size(0)
        all_preds.extend(preds.cpu().tolist())
        all_targets.extend(targets.cpu().tolist())
    accuracy = correct / max(1, seen)
    macro_f1 = f1_score(all_targets, all_preds, average="macro", zero_division=0)
    return total_loss / max(1, seen), accuracy, macro_f1, all_preds, all_targets


def plot_confusion(preds, targets, out_path: Path, title: str = "Confusion matrix") -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    matrix = confusion_matrix(targets, preds, labels=list(range(len(CLASS_ALLOWLIST))))
    fig, ax = plt.subplots(figsize=(7.5, 6.5))
    image = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks(range(len(CLASS_ALLOWLIST)), CLASS_ALLOWLIST, rotation=30, ha="right")
    ax.set_yticks(range(len(CLASS_ALLOWLIST)), CLASS_ALLOWLIST)
    for i in range(matrix.shape[0]):
        for j in range(matrix.shape[1]):
            value = matrix[i, j]
            ax.text(
                j, i, str(value), ha="center", va="center",
                color="white" if value > matrix.max() / 2 else "black",
            )
    fig.colorbar(image)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title(title)
    fig.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR, help="directory holding the raw images")
    parser.add_argument("--manifest-dir", type=Path, default=ML_DIR / "data", help="dir with train/val/test split CSVs")
    parser.add_argument("--out-dir", type=Path, default=ML_DIR / "artifacts")
    parser.add_argument("--arch", default="convnext_tiny")
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--head-lr", type=float, default=1e-3)
    parser.add_argument("--backbone-lr", type=float, default=4e-5)
    parser.add_argument("--weight-decay", type=float, default=0.05)
    parser.add_argument("--label-smoothing", type=float, default=0.1)
    parser.add_argument("--warmup-epochs", type=float, default=3.0)
    parser.add_argument("--patience", type=int, default=5)
    parser.add_argument("--num-workers", type=int, default=0, help="raise to 8 on Linux/Colab")
    parser.add_argument("--seed", type=int, default=SEED)
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--weighted-loss", action="store_true", help="inverse-frequency CE weights (Step 6 ablation)")
    parser.add_argument("--limit-steps", type=int, default=0, help=">0 truncates each train epoch to N steps (smoke test)")
    parser.add_argument("--no-pretrained", action="store_true")
    args = parser.parse_args()

    seed_everything(args.seed)
    torch.backends.cudnn.benchmark = True
    device = torch.device(args.device)
    args.out_dir.mkdir(parents=True, exist_ok=True)

    class_to_idx = {name: idx for idx, name in enumerate(CLASS_ALLOWLIST)}
    train_ds = PlantDataset(args.manifest_dir / "train_split.csv", args.data_dir, "train", class_to_idx)
    val_ds = PlantDataset(args.manifest_dir / "val_split.csv", args.data_dir, "eval", class_to_idx)
    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size, shuffle=True,
        num_workers=args.num_workers, pin_memory=device.type == "cuda", drop_last=True,
    )
    val_loader = DataLoader(
        val_ds, batch_size=args.batch_size, shuffle=False,
        num_workers=args.num_workers, pin_memory=device.type == "cuda",
    )

    model = build_model(args.arch, num_classes=len(CLASS_ALLOWLIST), pretrained=not args.no_pretrained).to(device)

    if args.weighted_loss:
        counts = train_ds.df["label"].map(class_to_idx).value_counts().reindex(range(len(CLASS_ALLOWLIST)), fill_value=1)
        weights = torch.tensor([len(train_ds) / count for count in counts], dtype=torch.float32, device=device)
        weights *= len(CLASS_ALLOWLIST) / weights.sum()
        criterion = torch.nn.CrossEntropyLoss(weight=weights, label_smoothing=args.label_smoothing)
    else:
        criterion = torch.nn.CrossEntropyLoss(label_smoothing=args.label_smoothing)

    head_params, backbone_params = split_param_groups(model)
    optimizer = torch.optim.AdamW(
        [
            {"params": head_params, "lr": args.head_lr},
            {"params": backbone_params, "lr": args.backbone_lr},
        ],
        weight_decay=args.weight_decay,
    )
    steps_per_epoch = len(train_loader) if args.limit_steps <= 0 else min(args.limit_steps, len(train_loader))
    total_steps = steps_per_epoch * args.epochs
    scheduler = torch.optim.lr_scheduler.LambdaLR(
        optimizer, make_lr_lambda(int(args.warmup_epochs * steps_per_epoch), total_steps)
    )
    scaler = torch.amp.GradScaler("cuda", enabled=device.type == "cuda")

    log_path = args.out_dir / f"train_log_{args.arch}.csv"
    best_path = args.out_dir / f"{args.arch}_best.pt"
    best_f1, epochs_since_best = -1.0, 0
    print(f"device={device} arch={args.arch} train={len(train_ds)} val={len(val_ds)} steps/epoch={steps_per_epoch}")

    with log_path.open("w", newline="") as log_file:
        logger = csv.writer(log_file)
        logger.writerow(["epoch", "lr_head", "lr_backbone", "train_loss", "val_loss", "val_acc", "val_macro_f1", "seconds"])
        for epoch in range(1, args.epochs + 1):
            model.train()
            running, steps, started = 0.0, 0, time.time()
            progress = tqdm(train_loader, desc=f"epoch {epoch}/{args.epochs}", leave=False)
            for step, (images, targets) in enumerate(progress, start=1):
                images = images.to(device, non_blocking=True)
                targets = targets.to(device, non_blocking=True)
                optimizer.zero_grad(set_to_none=True)
                with torch.autocast(device.type, enabled=device.type == "cuda"):
                    loss = criterion(model(images), targets)
                scaler.scale(loss).backward()
                scaler.unscale_(optimizer)
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                scaler.step(optimizer)
                scaler.update()
                scheduler.step()
                running += loss.item()
                steps += 1
                progress.set_postfix(loss=f"{running / steps:.4f}")
                if args.limit_steps and step >= args.limit_steps:
                    break

            val_loss, val_acc, val_f1, val_preds, val_targets = run_eval(model, val_loader, device, criterion)
            lr_head, lr_backbone = (group["lr"] for group in optimizer.param_groups)
            logger.writerow([
                epoch, f"{lr_head:.2e}", f"{lr_backbone:.2e}",
                f"{running / max(1, steps):.4f}", f"{val_loss:.4f}",
                f"{val_acc:.4f}", f"{val_f1:.4f}", f"{time.time() - started:.1f}",
            ])
            log_file.flush()
            print(
                f"epoch {epoch:3d} | train {running / max(1, steps):.4f} | "
                f"val loss {val_loss:.4f} acc {val_acc:.4f} macro-F1 {val_f1:.4f}"
            )

            if val_f1 > best_f1:
                best_f1, epochs_since_best = val_f1, 0
                torch.save(
                    {
                        "arch": args.arch,
                        "state_dict": model.state_dict(),
                        "class_to_idx": class_to_idx,
                        "img_size": IMG_SIZE,
                        "epoch": epoch,
                        "val_macro_f1": val_f1,
                    },
                    best_path,
                )
                plot_confusion(val_preds, val_targets, args.out_dir / f"val_confusion_{args.arch}.png",
                               title=f"Val confusion — {args.arch} (epoch {epoch})")
            else:
                epochs_since_best += 1
                if epochs_since_best >= args.patience:
                    print(f"early stop: no val macro-F1 improvement in {args.patience} epochs (best {best_f1:.4f})")
                    break

    print(f"best val macro-F1 {best_f1:.4f} -> {best_path}")


if __name__ == "__main__":
    main()
