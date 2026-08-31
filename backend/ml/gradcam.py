"""Self-contained Grad-CAM (Selvaraju et al., 2017).

Replaces the external ``pytorch-grad-cam`` package, which has no Python 3.13
distribution. Hooks the target conv layer, runs one backward pass on the
winning class score, and returns class-discriminative heatmaps in [0, 1]
upsampled to the input spatial size (Implementation.md §4.2 step 5, Layer 2).
"""

from __future__ import annotations

import torch
import torch.nn.functional as F


class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layers: list[torch.nn.Module]) -> None:
        if len(target_layers) != 1:
            raise ValueError("GradCAM supports exactly one target layer")
        self.model = model
        self.activations: torch.Tensor | None = None
        self.gradients: torch.Tensor | None = None
        self._forward_hook = target_layers[0].register_forward_hook(self._save_activation)
        self._backward_hook = target_layers[0].register_full_backward_hook(self._save_gradient)

    def _save_activation(self, _module, _inputs, output) -> None:
        self.activations = output.detach()

    def _save_gradient(self, _module, _grad_input, grad_output) -> None:
        self.gradients = grad_output[0].detach()

    def __call__(self, input_tensor: torch.Tensor) -> torch.Tensor:
        """Return an (N, H, W) tensor of CAMs normalized to [0, 1].

        Must NOT be called under ``torch.inference_mode()`` — it needs a
        backward pass.
        """
        self.model.zero_grad(set_to_none=True)
        logits = self.model(input_tensor)
        scores = logits.gather(1, logits.argmax(dim=1, keepdim=True)).sum()
        scores.backward()

        weights = self.gradients.mean(dim=(2, 3), keepdim=True)               # GAP of gradients
        cam = F.relu((weights * self.activations).sum(dim=1, keepdim=True))   # weighted sum, ReLU
        cam = F.interpolate(cam, size=input_tensor.shape[2:], mode="bilinear", align_corners=False)
        cam = cam.squeeze(1).flatten(1)
        mins = cam.min(dim=1).values[:, None]
        maxs = cam.max(dim=1).values[:, None]
        return ((cam - mins) / (maxs - mins + 1e-12)).reshape(-1, *input_tensor.shape[2:])

    def close(self) -> None:
        self._forward_hook.remove()
        self._backward_hook.remove()


def overlay_cam(rgb_chw: torch.Tensor, cam_hw: torch.Tensor, alpha: float = 0.5) -> np.ndarray:
    """Blend a CAM heatmap over a CHW RGB image tensor (values in [0, 1])."""
    import matplotlib

    matplotlib.use("Agg")
    from matplotlib import colormaps

    import numpy as np

    heatmap = colormaps["jet"](cam_hw.numpy())[..., :3]  # H, W, 3
    rgb = rgb_chw.permute(1, 2, 0).numpy()
    blended = (1 - alpha) * rgb + alpha * heatmap
    return (blended.clip(0, 1) * 255).astype(np.uint8)
