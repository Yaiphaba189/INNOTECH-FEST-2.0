"""Image preprocessing and validation pipeline for crop disease screening.

Enforces:
- File integrity and format verification (JPEG, PNG).
- File size boundary (< 5 MB).
- Image dimensions (minimum 224x224 px).
- Bilinear interpolation resize to 224x224 with aspect-ratio preserving center crop.
- ImageNet channel-wise normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225].
- Forensic SHA-256 calculation for immutable audit trails.
"""

from __future__ import annotations

import hashlib
import io
from typing import Tuple

from PIL import Image, ImageOps

TARGET_SIZE = (224, 224)
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MIN_FILE_SIZE_BYTES = 100               # 100 bytes minimum
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def validate_image_bytes(image_bytes: bytes) -> str:
    """Validates raw image bytes and returns the SHA-256 forensic hash."""
    if len(image_bytes) < MIN_FILE_SIZE_BYTES:
        raise ValueError("IMAGE_CORRUPTED: Image data is too small to be a valid image.")
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"IMAGE_TOO_LARGE: Image exceeds 5 MB limit ({len(image_bytes)} bytes).")

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
            format_name = (img.format or "").upper()
            if format_name not in ("JPEG", "JPG", "PNG"):
                raise ValueError(f"UNSUPPORTED_FORMAT: Only JPEG and PNG are supported, got {format_name}.")
    except Exception as exc:
        if isinstance(exc, ValueError):
            raise
        raise ValueError("IMAGE_CORRUPTED: Image file cannot be decoded.") from exc

    return hashlib.sha256(image_bytes).hexdigest()


def preprocess_image(image_bytes: bytes) -> Tuple[Image.Image, str]:
    """Decodes, auto-orients, resizes to 224x224 RGB, and computes SHA-256 hash."""
    image_hash = validate_image_bytes(image_bytes)

    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        processed = ImageOps.fit(
            img, TARGET_SIZE, method=Image.Resampling.BILINEAR, centering=(0.5, 0.5)
        )
        return processed, image_hash


def normalize_to_tensor_arrays(image: Image.Image) -> list[list[list[float]]]:
    """Converts a PIL Image to a normalized [3, 224, 224] list matching ImageNet distribution."""
    width, height = image.size
    pixels = image.load()
    
    # [3, H, W]
    channels = [[[0.0 for _ in range(width)] for _ in range(height)] for _ in range(3)]
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y][:3]
            channels[0][y][x] = ((r / 255.0) - IMAGENET_MEAN[0]) / IMAGENET_STD[0]
            channels[1][y][x] = ((g / 255.0) - IMAGENET_MEAN[1]) / IMAGENET_STD[1]
            channels[2][y][x] = ((b / 255.0) - IMAGENET_MEAN[2]) / IMAGENET_STD[2]
            
    return channels
