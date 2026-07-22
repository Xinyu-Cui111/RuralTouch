#!/usr/bin/env python3
"""Compress originals under assets-source/ into static/lite/ for the mini program."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets-source" / "originals"
LITE = ROOT / "static" / "lite"


def save_jpg(src: Path, dest: Path, max_w: int, quality: int = 76) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{dest.relative_to(ROOT)}: {dest.stat().st_size / 1024:.1f}KB {im.size}")


def compress_dir(src_dir: Path, dest_dir: Path, max_w: int, quality: int) -> None:
    if not src_dir.exists():
        return
    for src in src_dir.iterdir():
        if src.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        save_jpg(src, dest_dir / f"{src.stem}.jpg", max_w, quality)


def main() -> None:
    LITE.mkdir(parents=True, exist_ok=True)
    mapping = [
        (SRC / "banner.png", LITE / "hero-village.jpg", 900, 76),
        (SRC / "profit.png", LITE / "hero-profit.jpg", 900, 76),
        (SRC / "law.jpg", LITE / "hero-law.jpg", 900, 74),
    ]
    for src, dest, max_w, q in mapping:
        if src.exists():
            save_jpg(src, dest, max_w, q)

    logo = SRC / "TouMinglogo.png"
    if logo.exists():
        im = Image.open(logo).convert("RGBA")
        im = im.resize((128, 131), Image.Resampling.LANCZOS)
        bg = Image.new("RGBA", im.size, (246, 240, 228, 255))
        bg.alpha_composite(im)
        out = LITE / "logo.jpg"
        bg.convert("RGB").save(out, "JPEG", quality=82, optimize=True)
        print(f"{out.relative_to(ROOT)}: {out.stat().st_size / 1024:.1f}KB")

    avatar = SRC / "village-icons" / "touxiang.jpg"
    if avatar.exists():
        save_jpg(avatar, LITE / "avatar.jpg", 160, 75)

    compress_dir(SRC / "products", LITE / "products", 640, 72)
    compress_dir(SRC / "group-icons", LITE / "group", 320, 70)

    print("optimize-assets done → static/lite/")


if __name__ == "__main__":
    main()
