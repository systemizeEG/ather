"""Remove the cream backdrop from the Ather fingerprint logo."""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path(
    r"C:\Users\nourm\.cursor\projects\d-project-ather\assets"
    r"\c__Users_nourm_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"379117f4128688d0614f33098b24c419_images_"
    r"c872514c-e619-4fb6-9b42-324b8fa6992a-b9167ef9-c51e-4774-aa1b-171cadc8ead3.jpg"
)
OUT_LOGO = Path(r"D:\project\ather\public\logo.png")
OUT_ICON = Path(r"D:\project\ather\src\app\icon.png")
PREVIEW_DARK = Path(r"D:\project\ather\scripts\logo-preview-dark.png")
PREVIEW_PEARL = Path(r"D:\project\ather\scripts\logo-preview-pearl.png")


def crop_letterbox(rgb: np.ndarray) -> np.ndarray:
    luma = rgb.mean(axis=2)
    rows = np.where(luma.mean(axis=1) > 80)[0]
    cols = np.where(luma.mean(axis=0) > 80)[0]
    return rgb[rows[0] : rows[-1] + 1, cols[0] : cols[-1] + 1]


def flood_background(cand: np.ndarray) -> np.ndarray:
    h, w = cand.shape
    is_bg = np.zeros((h, w), dtype=bool)
    vis = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_push(y: int, x: int) -> None:
        if cand[y, x] and not vis[y, x]:
            vis[y, x] = True
            q.append((y, x))

    for x in range(w):
        try_push(0, x)
        try_push(h - 1, x)
    for y in range(h):
        try_push(y, 0)
        try_push(y, w - 1)

    while q:
        y, x = q.popleft()
        is_bg[y, x] = True
        if y > 0:
            try_push(y - 1, x)
        if y + 1 < h:
            try_push(y + 1, x)
        if x > 0:
            try_push(y, x - 1)
        if x + 1 < w:
            try_push(y, x + 1)
    return is_bg


def erode(mask: np.ndarray) -> np.ndarray:
    m = mask.astype(np.uint8)
    out = np.zeros_like(mask, dtype=bool)
    out[1:-1, 1:-1] = (
        m[1:-1, 1:-1]
        & m[:-2, 1:-1]
        & m[2:, 1:-1]
        & m[1:-1, :-2]
        & m[1:-1, 2:]
        & m[:-2, :-2]
        & m[:-2, 2:]
        & m[2:, :-2]
        & m[2:, 2:]
    ).astype(bool)
    return out


def dilate(mask: np.ndarray) -> np.ndarray:
    m = mask.astype(np.uint8)
    out = mask.copy()
    out[1:-1, 1:-1] = (
        m[1:-1, 1:-1]
        | m[:-2, 1:-1]
        | m[2:, 1:-1]
        | m[1:-1, :-2]
        | m[1:-1, 2:]
    ).astype(bool)
    return out


def main() -> None:
    rgb = crop_letterbox(np.array(Image.open(SRC).convert("RGB")))
    pix = rgb.astype(np.float32)
    r, g, b = pix[:, :, 0], pix[:, :, 1], pix[:, :, 2]
    luma = 0.299 * r + 0.587 * g + 0.114 * b
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    yb = r - b

    # Tight crop around the gold/silver mark so JPEG dirt is excluded.
    seed = (chroma > 22) & (yb > 24)
    ys, xs = np.where(seed)
    pad = 36
    y0, y1 = max(0, int(ys.min()) - pad), min(rgb.shape[0], int(ys.max()) + pad + 1)
    x0, x1 = max(0, int(xs.min()) - pad), min(rgb.shape[1], int(xs.max()) + pad + 1)
    rgb = rgb[y0:y1, x0:x1]
    pix = pix[y0:y1, x0:x1]
    luma = luma[y0:y1, x0:x1]
    chroma = chroma[y0:y1, x0:x1]
    yb = yb[y0:y1, x0:x1]
    h, w, _ = rgb.shape

    corners = np.concatenate(
        [
            pix[:16, :16].reshape(-1, 3),
            pix[:16, -16:].reshape(-1, 3),
            pix[-16:, :16].reshape(-1, 3),
            pix[-16:, -16:].reshape(-1, 3),
        ]
    )
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((pix - bg) ** 2).sum(axis=2))

    is_metal = (chroma > 28) | ((yb > 26) & (chroma > 20))
    is_ridge = (luma < 198) & (dist > 28) & (chroma > 10)
    keep = is_metal | is_ridge

    fg = pix.copy()
    # Knock residual cream out of pale bevels that remain after dilate.
    pale = keep & (chroma < 26) & (luma > 210)
    cov = np.clip(dist / 28.0, 0.2, 1.0)
    unmixed = np.clip((pix - bg * (1.0 - cov[..., None])) / np.maximum(cov[..., None], 0.2), 0, 255)
    fg = np.where(pale[..., None], unmixed, fg)

    alpha = np.where(keep, 255, 0).astype(np.uint8)

    out = Image.fromarray(np.dstack([fg.astype(np.uint8), alpha]), "RGBA")

    a = np.array(out)[:, :, 3]
    ys, xs = np.where(a > 20)
    pad = 16
    out = out.crop(
        (
            max(0, int(xs.min()) - pad),
            max(0, int(ys.min()) - pad),
            min(w, int(xs.max()) + pad + 1),
            min(h, int(ys.max()) + pad + 1),
        )
    )

    OUT_LOGO.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_LOGO, "PNG", optimize=True)
    out.save(OUT_ICON, "PNG", optimize=True)

    for path, color in ((PREVIEW_DARK, (58, 36, 28)), (PREVIEW_PEARL, (239, 234, 220))):
        canvas = Image.new("RGBA", out.size, color + (255,))
        canvas.alpha_composite(out)
        canvas.convert("RGB").save(path, "PNG")

    print(f"bg sample {bg}")
    print(f"saved {OUT_LOGO} size={out.size} opaque={(np.array(out)[:, :, 3] > 16).mean():.3f}")


if __name__ == "__main__":
    main()
