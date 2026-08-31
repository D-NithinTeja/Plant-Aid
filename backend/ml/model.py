"""Step 3 of the training plan: backbone builders, param groups, Grad-CAM targets."""

from __future__ import annotations

import torch


def build_model(arch: str = "convnext_tiny", num_classes: int = 6, pretrained: bool = True) -> torch.nn.Module:
    """Create a timm backbone with a fresh classification head.

    Imported lazily so scripts that never build a model (prepare_data.py) do
    not need timm installed.
    """
    import timm

    return timm.create_model(arch, pretrained=pretrained, num_classes=num_classes)


def split_param_groups(model: torch.nn.Module) -> tuple[list, list]:
    """Return ``(head_params, backbone_params)`` — heads take the higher learning rate."""
    head_keys = ("head", "classifier", "fc")
    head: list = []
    backbone: list = []
    for name, param in model.named_parameters():
        (head if any(key in name for key in head_keys) else backbone).append(param)
    return head, backbone


def gradcam_target_layers(model: torch.nn.Module, arch: str) -> list[torch.nn.Module]:
    """Final conv feature map for Grad-CAM: ``stages[-1]`` on ConvNeXt,
    ``conv_head`` on EfficientNetV2 (Implementation.md §4.2 step 5)."""
    if "convnext" in arch:
        return [model.stages[-1]]
    if "efficientnet" in arch:
        return [model.conv_head]
    raise ValueError(f"No Grad-CAM target layer defined for arch {arch!r}")
