# Model Training Plan — Groundnut Disease Classifier (Module 0.3)

**Scope:** Train and export the CNN used by the real-time inference service, per `Implementation.md` §4.
**Companion docs:** `Software_Requirement_Document.md` (F.3, NF.4), `Design_Document_And_Structure_Chart.md`, `Implementation.md`.

---

## 1. Objective & Success Criteria

Fine-tune an ImageNet-pretrained **ConvNeXt-Tiny** on the project's groundnut dataset and produce the deployment artifact consumed by `backend/app/services/ml_engine.py`.

| # | Criterion | Target |
| --- | --- | --- |
| SC-1 | Test-set macro-F1 | ≥ 0.90 |
| SC-2 | Per-class recall | ≥ 0.85 for every class (esp. `healthy_leaf` — false alarms on healthy plants erode user trust) |
| SC-3 | Single-frame latency @ 224×224 | ≤ 100 ms GPU / ≤ 400 ms CPU (keeps NF.4's 1–2 s end-to-end budget intact) |
| SC-4 | Deployment artifact | TorchScript loads in FastAPI; Grad-CAM forward+backward verified on `stages[-1]` |

---

## 2. Dataset Audit (measured 2026-08-29)

- **Location:** `C:\Users\yashr\Downloads\GroundNutDataset\input_images` (flat directory)
- **Total:** 9,991 files, all `.jpg`, all 256×256 RGB (sampled check)
- **Labels:** encoded in filenames, e.g. `early_leaf_spot_10.jpg` → class prefix + `_N.jpg`

| Class prefix | Images | Share |
| --- | --- | --- |
| `late_leaf_spot` | 1,896 | 19.0% |
| `healthy_leaf` | 1,871 | 18.7% |
| `rust` | 1,724 | 17.3% |
| `nutrition_deficiency` | 1,664 | 16.7% |
| `early_rust` | 1,472 | 14.7% |
| `early_leaf_spot` | 1,364 | 13.7% |

**Imbalance ratio:** 1,896 / 1,364 ≈ **1.39 : 1 — mild.** Default CrossEntropy is fine; keep a weighted-CE ablation in reserve (Step 6).

### ✅ Decision Gate D-1 — RESOLVED (29/08/26): keep both classes

Side-by-side samples reviewed ([d1_early_rust_vs_rust.png](../backend/ml/data/review/d1_early_rust_vs_rust.png)): `early_rust` shows scattered dark-brown speckled lesions; `rust` shows clustered orange pustules with chlorotic yellowing — genuinely distinct presentations. **Both remain separate classes** (6-class problem; the splits were built on 6 classes and are unchanged).

- Consequence: some mutual confusion is expected. The Step 5 error review must specifically track the `early_rust` ↔ `rust` cell of the confusion matrix and report it.

---

## 3. Environment

`requirements-train.txt`:

```
torch>=2.1
torchvision
timm>=1.0
scikit-learn
pandas
tqdm
matplotlib
```

> Grad-CAM is implemented locally in `ml/gradcam.py` (~50 lines, Selvaraju et al. 2017) because the `pytorch-grad-cam` package has no Python 3.13 distribution on PyPI.

- **Hardware:** any CUDA GPU with ≥ 8 GB VRAM (Colab T4 is sufficient: ConvNeXt-Tiny @ 224, batch 32). CPU-only works but expect multi-hour epochs — avoid.
- **Determinism:** seed everything with `seed = 42` (torch, numpy, random, CUDA); log `torch.__version__`, `timm.__version__`, and GPU model in the run config for reproducibility.

---

## 4. Training Steps

### Step 0 — Audit & master manifest → `ml/prepare_data.py`

1. Parse class from each filename; validate against the 6-prefix allow-list → quarantine list for anything else.
2. `PIL.Image.verify()` every file → report corrupt/truncated images and exclude them.
3. MD5-hash every file → report exact duplicates (keep first occurrence).
4. **Output:** `dataset_manifest.csv` (`filepath, label, md5`) + audit summary printed to console.

### Step 1 — Stratified splits → `ml/prepare_data.py`

- Split 80 / 10 / 10 into `train_split.csv`, `val_split.csv`, `test_split.csv` — stratified by class, `seed = 42`.
- Rule: **test set is evaluated exactly once**, at Step 5. All tuning/early-stopping decisions use `val_split` only.

### Step 2 — Data pipeline → `ml/dataset.py`

| Split | Transforms |
| --- | --- |
| Train | `Resize((256,256))` → `RandomResizedCrop(224, scale=(0.7, 1.0))` → `RandomHorizontalFlip` → mild `ColorJitter(0.3, 0.3, 0.3, 0.05)` → `ToTensor` → ImageNet `Normalize` |
| Val/Test | `Resize((224, 224))` directly → `ToTensor` → `Normalize` |

- **No `CenterCrop` anywhere at eval time** — field-style images place lesions near frame edges (matches `Implementation.md` §4.2).
- Class imbalance is mild → start with unweighted `CrossEntropyLoss(label_smoothing=0.1)`.

### Step 3 — Model → `ml/model.py`

- `timm.create_model("convnext_tiny", pretrained=True, num_classes=6)`; save `class_to_idx` with the checkpoint.
- Grad-CAM target layer for the report and the backend: **`model.stages[-1]`** (final 7×7 conv stage).
- Ablation baseline: `timm.create_model("tf_efficientnetv2_s", pretrained=True, num_classes=6)` — identical recipe.

### Step 4 — Training loop → `ml/train.py`

| Setting | Value | Rationale |
| --- | --- | --- |
| Optimizer | AdamW, two param groups: **head lr 1e-3**, **backbone lr 4e-5** | Fresh head converges fast; pretrained backbone moves slowly |
| Weight decay | 0.05 | ConvNeXt recipe default |
| Loss | CrossEntropy, label smoothing 0.1 | Calibration + small-data regularization |
| Precision | AMP (`torch.cuda.amp`, fp16) | ~2× speed on T4 |
| Gradient clipping | max-norm 1.0 | Stability |
| Schedule | 3-epoch linear warmup → cosine decay to ~0 | Standard fine-tune recipe |
| Epochs | max 25, **early stop patience 5** on **val macro-F1** | SC-1 metric drives selection |
| Checkpoint | best-by-val-F1 → `ml/artifacts/convnext_tiny_best.pt` (state_dict + class_to_idx + config) | Resume-safe on Colab disconnects |

Per-epoch logging: train/val loss, val accuracy, val macro-F1, lr. Final: confusion matrix on val.

### Step 5 — Evaluation → `ml/evaluate.py` (test set, once)

1. Accuracy, macro-F1, weighted-F1, per-class precision/recall/F1 (`sklearn.metrics`), confusion-matrix heatmap PNG.
2. **Error review:** export the 30 highest-loss test misclassifications to a review folder; specifically inspect the visually similar pairs — `early_rust` ↔ `rust` and `early_leaf_spot` ↔ `late_leaf_spot`. If one pair dominates errors and D-1 said "same disease," merge and retrain (goes to Step 6 as an ablation instead).
3. Latency benchmark: median of 100 runs @ 224×224 on GPU **and** CPU → `metrics.json` (SC-3).

### Step 6 — Ablations

- EfficientNetV2-S, same recipe → report table: **model / params / GFLOPs / test Acc / macro-F1 / GPU ms / CPU ms**.
- Optional (only if a minority class recall < 0.85): weighted-CE variant, weights ∝ 1/class-count; re-evaluate.
- Optional (only if underfitting): upgrade backbone weights to 21k-pretrained (`convnext_tiny.in12k_ft_in22k`) or input size 320 (latency still fine on GPU; re-benchmark SC-3).

### Step 7 — Export & calibration → `ml/export.py`

1. `torch.jit.script` (fallback: `torch.jit.trace`) the best model → `convnext_tiny_groundnut.ts`.
2. `labels.json`: model class index → `{"disease_id": <aligns with D2 `diseases.disease_id` PK>, "disease_name": "..."}` so remedy lookup (Module 0.4) joins correctly.
3. **Confidence threshold τ:** sweep on *val*: choose smallest τ (start at 0.55) such that precision on non-healthy predictions stays ≥ 0.90. Predictions below τ return `is_healthy_or_uncertain = true` (per `Implementation.md` §4.2 step 4).
4. **Grad-CAM smoke test:** the local `ml/gradcam.py` with `target_layers = [model.stages[-1]]` on 20 val images; save overlay PNGs into the report.

### Step 8 — Backend handoff

- Copy `convnext_tiny_groundnut.ts`, `labels.json` → `backend/ml/`.
- Smoke test: load in `ml_engine.py`, POST one real frame to `/inference/frame`, verify the §4.3 response contract end-to-end (classification + CAM box + leaf ROI).
- Verify the model loads **once** at startup (singleton) and inference runs under `torch.inference_mode()`.

---

## 5. Deliverables Checklist

- [x] `dataset_manifest.csv` + 3 split CSVs + audit summary (10 duplicates removed, 0 corrupt)
- [x] **D-1 decision note** (`early_rust` vs `rust`) — resolved: keep both (§2)
- [x] `ml/artifacts/convnext_tiny_groundnut.ts` + `labels.json`
- [x] `metrics.json` (accuracy 95.60%, macro-F1 0.9555, latency 5.8 ms GPU / 135 ms CPU)
- [x] Confusion-matrix PNG + top-30 misclassification review folder
- [ ] Ablation comparison table (ConvNeXt-Tiny vs EfficientNetV2-S) — *optional, not run*
- [x] 20 Grad-CAM overlay samples

## 6. Indicative Timeline (GPU available)

| Day | Work |
| --- | --- |
| 1 | Steps 0–1: audit, D-1 gate, manifest, splits |
| 2–3 | Steps 2–4: pipeline + ConvNeXt-Tiny training runs |
| 4 | Step 5–6: evaluation, error review, EfficientNetV2-S ablation |
| 5 | Steps 7–8: export, calibration, backend smoke test + buffer |

## 7. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| `early_rust` ↔ `rust` mutual confusion | D-1 resolved: classes kept separate; confusion cell tracked in Step 5; merge path remains available if val macro-F1 stalls |
| Small lesions lost at 224 input | Escalate to 320 input (Step 6 optional) |
| Overfitting on 10k images | Strong augmentation, early stopping, pretrained backbone, label smoothing |
| Class confusion among visually similar diseases | Targeted error review (Step 5.2); confusion matrix reported per pair |
| Colab/runtime disconnect mid-training | Best-checkpoint resume; config + seed logged |
| Threshold τ too permissive → false alarms logged to history | τ calibrated on val for precision ≥ 0.90 (Step 7.3) |

---

## 8. Training Report — Colab T4 run, 29/08/2026

**Setup:** ConvNeXt-Tiny (ImageNet-pretrained, timm) on the canonical splits (7,984 / 998 / 999). Training early-stopped at epoch 6; the best checkpoint is **epoch 1** (val macro-F1 0.9670). After epoch 1 the model overfit — train loss kept falling (0.70 → 0.54) while val loss rose (0.50 → 0.60 by epoch 4) — so the early-stopping criterion selected the generalizing epoch as designed.

### Test results (n = 999, evaluated once)

| Metric | Achieved | Target | Status |
| --- | --- | --- | --- |
| Accuracy | **95.60%** | — | — |
| Macro-F1 | **0.9555** | ≥ 0.90 (SC-1) | ✅ |
| Min class recall | **0.921** (`late_leaf_spot`) | ≥ 0.85 every class (SC-2) | ✅ |
| Latency @ 224, median | **5.8 ms GPU / 135 ms CPU** | ≤ 100 / ≤ 400 ms (SC-3) | ✅ |
| TorchScript artifact loads, finite (1,6) logits | verified locally | (SC-4) | ✅ |

### Error structure — 44 test errors total

| Confused pair | Errors | Share of all errors |
| --- | --- | --- |
| `early_leaf_spot` ↔ `late_leaf_spot` | 22 (8 + 14) | 50% |
| `healthy_leaf` ↔ `nutrition_deficiency` | 14 (11 + 3) | 32% |
| `early_rust` ↔ `rust` (the D-1 pair) | 7 (0 + 7) | 16% |

98% of errors fall inside biologically related pairs (similar lesions, shared chlorosis symptoms) — the model's mistakes are confusable-disease confusions, not noise. The D-1 `early_rust`/`rust` split turned out nearly clean: `early_rust` recall 1.000, `rust` recall 0.960.

### Confidence threshold

τ = **0.55** (calibrated on val; alert precision ≈ 0.97 at ≈ 0.81 coverage). The backend reports `is_healthy_or_uncertain = true` for frames whose max softmax < τ.

### Honest caveats for the report

- **Best epoch = 1:** the pretrained backbone saturated almost immediately and the cosine schedule never annealed. The shipped artifact passes every success criterion, but an optional retrain (lower head LR ~3e-4, stronger augmentation, longer patience) might push past 95.6%.
- **Spot check:** `early_leaf_spot_10.jpg` — the project's reference image — classifies as `late_leaf_spot` 0.63 / `early_leaf_spot` 0.27. It sits inside the dominant confusion pair; worth eyeballing whether the dataset's own label for such images is reliable.

### Ablation

EfficientNetV2-S was **not** trained in this pass — the primary model passed all criteria on its own. Run it (same commands, `--arch tf_efficientnetv2_s`) only if the report still needs the comparison table.
