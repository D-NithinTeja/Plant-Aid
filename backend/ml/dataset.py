"""Step 2 of the training plan: Dataset and transforms for the groundnut splits."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
from PIL import Image
from torch import Tensor
from torch.utils.data import Dataset
from torchvision import transforms as T

from ml_config import CLASS_TO_IDX, IMAGENET_MEAN, IMAGENET_STD, IMG_SIZE

EVAL_TRANSFORM = T.Compose(
    [
        # Direct resize, no CenterCrop: field-style images place lesions near
        # frame edges and a center crop would amputate them (Implementation.md §4.2).
        T.Resize((IMG_SIZE, IMG_SIZE)),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ]
)

TRAIN_TRANSFORM = T.Compose(
    [
        T.Resize((256, 256)),
        T.RandomResizedCrop(IMG_SIZE, scale=(0.7, 1.0)),
        T.RandomHorizontalFlip(),
        T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ]
)


def build_transforms(split: str) -> T.Compose:
    return TRAIN_TRANSFORM if split == "train" else EVAL_TRANSFORM


class PlantDataset(Dataset):
    """Reads one of the split CSVs produced by prepare_data.py.

    `filepath` entries are relative to `data_dir`, so the same CSVs work on
    Windows and on a Colab/Linux box where the dataset is mounted elsewhere.
    """

    def __init__(
        self,
        split_csv: Path,
        data_dir: Path,
        split: str = "eval",
        class_to_idx: dict[str, int] | None = None,
    ) -> None:
        self.df = pd.read_csv(split_csv)
        self.data_dir = Path(data_dir)
        self.split = split
        self.transform = build_transforms(split)
        self.class_to_idx = class_to_idx or dict(CLASS_TO_IDX)

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, index: int) -> tuple[Tensor, int]:
        row = self.df.iloc[index]
        with Image.open(self.data_dir / row["filepath"]) as image:
            tensor = self.transform(image.convert("RGB"))
        return tensor, int(self.class_to_idx[row["label"]])
