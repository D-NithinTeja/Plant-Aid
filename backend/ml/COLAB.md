# Running the Groundnut Classifier Training on Google Colab

> **Tooling exception:** this document is the one sanctioned place where the project's `uv`
> standard does not apply. Colab provisions its own Python/CUDA toolchain, so the cells below
> use plain `pip install` / `python`. On a local machine, run the same scripts as
> `uv run python train.py ...` instead — see `Docs/DEVELOPMENT_PLAN.md`.

Everything needed ships as two zips (created in `Downloads/` on the project machine):

- `GroundNutDataset.zip` (~99 MB) — the raw `input_images/` set
- `plantaid_ml.zip` (~3.6 MB) — `backend/ml/` scripts **plus the `data/` split CSVs**

## 0. One-time: upload to Google Drive

Upload both zips to **MyDrive (root)** at drive.google.com. A single zip upload
beats dragging 10k loose files.

## 1. Runtime

`Runtime → Change runtime type → T4 GPU`. Verify in the first cell.

## 2. Notebook cells

**Cell 1 — mount Drive, unpack:**

```python
from google.colab import drive
drive.mount('/content/drive')

!unzip -q /content/drive/MyDrive/GroundNutDataset.zip -d /content
!unzip -q /content/drive/MyDrive/plantaid_ml.zip -d /content
%cd /content/ml
!ls   # should show: dataset.py, train.py, evaluate.py, export.py, data/, ...
```

**Cell 2 — dependencies** (Colab already ships CUDA torch; this adds timm etc.):

```python
!pip install -q -r requirements-train.txt
import torch, timm
print(torch.__version__, "| CUDA:", torch.cuda.is_available(), "| timm", timm.__version__)
```

**Cell 3 — train** (≈2 min/epoch on T4 → 50–70 min max; early stopping may end sooner):

```python
!python train.py --data-dir /content/input_images --num-workers 2
```

> Do **not** run `prepare_data.py` on Colab. The `data/*.csv` splits in the zip
> are the canonical, seed-42 splits — using them guarantees the val/test numbers
> match what was audited on the project machine.

**Cell 4 — evaluate (test set, once):**

```python
!python evaluate.py --data-dir /content/input_images --num-workers 2 --bench-cpu
```

**Cell 5 — export + calibrate + Grad-CAM smoke test:**

```python
!python export.py --data-dir /content/input_images
```

**Cell 6 — persist results (Colab disk is wiped when the session ends!):**

```python
!cp -r /content/ml/artifacts /content/drive/MyDrive/plantaid_artifacts
```

or download directly:

```python
!zip -qr /content/artifacts.zip /content/ml/artifacts
from google.colab import files
files.download('/content/artifacts.zip')
```

## Notes & gotchas

- **Keep the tab active** — free Colab disconnects on ~90 min idle and can
  reclaim long sessions. Training restarts from scratch if killed mid-run
  (best checkpoint is only written at epoch ends).
- `--num-workers 2` matches Colab's 2 vCPUs; raising it oversubscribes.
- Expected healthy run: epoch 1 val macro-F1 already > 0.85 (ImageNet-pretrained
  backbone); final test macro-F1 target ≥ 0.90 (SC-1).
- After the run, the backend handoff files are `artifacts/convnext_tiny_groundnut.ts`
  and `artifacts/labels.json`. Copy them into `backend/ml/` on the project
  machine. If committing, `git add -f backend/ml/convnext_tiny_groundnut.ts`
  (the `*.ts` ignore rule needs overriding); `labels.json` is tracked normally.
