"""Steps 0-1 of the training plan: audit the raw dataset, build the master
manifest, and write stratified train/val/test splits.

Also renders the Decision-Gate D-1 sample grid (`early_rust` vs `rust`) and a
six-class overview grid into `review/`, for the training report.

Usage:
    uv run python prepare_data.py --data-dir <path/to/input_images> --out-dir ./data
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import pandas as pd
from PIL import Image, ImageDraw
from sklearn.model_selection import train_test_split

from ml_config import CLASS_ALLOWLIST, DEFAULT_DATA_DIR, SEED

FILENAME_RE = re.compile(r"^(?P<label>.+)_(?P<idx>\d+)\.(jpg|jpeg|png)$", re.IGNORECASE)


def parse_label(filename: str) -> str | None:
    """Strip the trailing ``_<number>.<ext>`` and return the class prefix, or None."""
    match = FILENAME_RE.match(filename)
    if not match:
        return None
    label = match.group("label").lower()
    return label if label in CLASS_ALLOWLIST else None


def md5_of(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def audit(data_dir: Path) -> tuple[pd.DataFrame, dict]:
    """Verify every image, drop corrupt files and exact duplicates (first wins)."""
    rows: list[dict] = []
    skipped_unparseable: list[str] = []
    skipped_corrupt: list[dict] = []
    duplicates: list[dict] = []
    seen_md5: dict[str, str] = {}

    for path in sorted(data_dir.iterdir()):
        if not path.is_file():
            continue
        label = parse_label(path.name)
        if label is None:
            skipped_unparseable.append(path.name)
            continue
        try:
            with Image.open(path) as image:
                image.verify()  # header / truncation check
            with Image.open(path) as image:
                image.load()  # full decode; catches truncated scan data
                width, height = image.size
                mode = image.mode
        except Exception as exc:  # noqa: BLE001 - any decode failure disqualifies the file
            skipped_corrupt.append({"file": path.name, "error": str(exc)})
            continue

        digest = md5_of(path)
        if digest in seen_md5:
            duplicates.append({"file": path.name, "duplicate_of": seen_md5[digest]})
            continue
        seen_md5[digest] = path.name

        rows.append(
            {
                # Relative to data_dir so the same CSVs work on Colab/Linux.
                "filepath": path.name,
                "label": label,
                "md5": digest,
                "width": width,
                "height": height,
                "mode": mode,
            }
        )

    manifest = pd.DataFrame(rows)
    summary = {
        "data_dir": str(data_dir),
        "files_seen": sum(1 for p in data_dir.iterdir() if p.is_file()),
        "kept": len(manifest),
        "skipped_unparseable": skipped_unparseable,
        "skipped_corrupt": skipped_corrupt,
        "duplicates_removed": duplicates,
        "class_counts": manifest["label"].value_counts().to_dict(),
        "distinct_sizes": sorted({(int(w), int(h)) for w, h in zip(manifest["width"], manifest["height"])})[:20],
    }
    return manifest, summary


def sample_grid(
    manifest: pd.DataFrame,
    data_dir: Path,
    labels: list[str],
    per_class: int,
    out_path: Path,
    seed: int,
    thumb: int = 192,
) -> None:
    """Render one row of thumbnails per class, filenames printed underneath."""
    cell_w, cell_h = thumb, thumb + 18
    canvas = Image.new("RGB", (per_class * cell_w, len(labels) * cell_h), "white")
    draw = ImageDraw.Draw(canvas)
    for row_index, label in enumerate(labels):
        subset = manifest[manifest["label"] == label]
        picks = subset.sample(n=min(per_class, len(subset)), random_state=seed)
        for col_index, (_, row) in enumerate(picks.iterrows()):
            with Image.open(data_dir / row["filepath"]) as image:
                image = image.convert("RGB").resize((thumb, thumb))
            x, y = col_index * cell_w, row_index * cell_h
            canvas.paste(image, (x, y))
            draw.text((x + 4, y + thumb + 3), row["filepath"], fill="black")
    canvas.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR, help="directory holding the raw images")
    parser.add_argument("--out-dir", type=Path, default=Path(__file__).resolve().parent / "data")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()

    if not args.data_dir.is_dir():
        raise SystemExit(f"data dir not found: {args.data_dir}")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    review_dir = args.out_dir / "review"
    review_dir.mkdir(exist_ok=True)

    print(f"auditing {args.data_dir} ...")
    manifest, summary = audit(args.data_dir)
    manifest.to_csv(args.out_dir / "dataset_manifest.csv", index=False)

    # Stratified 80/10/10 (plan.md Step 1). The test split is evaluated once,
    # at Step 5; everything else tunes on val.
    train_df, holdout_df = train_test_split(
        manifest, test_size=0.2, stratify=manifest["label"], random_state=args.seed
    )
    val_df, test_df = train_test_split(
        holdout_df, test_size=0.5, stratify=holdout_df["label"], random_state=args.seed
    )
    train_df.to_csv(args.out_dir / "train_split.csv", index=False)
    val_df.to_csv(args.out_dir / "val_split.csv", index=False)
    test_df.to_csv(args.out_dir / "test_split.csv", index=False)

    # Decision Gate D-1 evidence + per-class overview for the report.
    sample_grid(manifest, args.data_dir, ["early_rust", "rust"], 8, review_dir / "d1_early_rust_vs_rust.png", args.seed)
    sample_grid(manifest, args.data_dir, CLASS_ALLOWLIST, 6, review_dir / "class_overview.png", args.seed)

    summary["splits"] = {"train": len(train_df), "val": len(val_df), "test": len(test_df)}
    (args.out_dir / "audit_summary.json").write_text(json.dumps(summary, indent=2))

    print(f"kept {summary['kept']} / {summary['files_seen']} files")
    print(f"corrupt: {len(summary['skipped_corrupt'])}, unparseable: {len(summary['skipped_unparseable'])}, duplicates: {len(summary['duplicates_removed'])}")
    print("class counts:", summary["class_counts"])
    print(f"splits: train={len(train_df)} val={len(val_df)} test={len(test_df)}")
    print(f"outputs in {args.out_dir} (grids in {review_dir})")


if __name__ == "__main__":
    main()
