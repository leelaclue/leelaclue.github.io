"""Generate the site favicon set from assets/app_icon.png.

The raw app icon is a full-bleed square painting. Google renders SERP favicons
inside a small round chip, where a dark full-bleed square reads as a blob that
overflows the circle. So we crop to the outer gold ring, mask to a circle with a
small inset, and boost contrast/saturation so the mark survives down to 16px.

Usage:  python tools/make_favicon.py
Requires Pillow.  Re-run only when assets/app_icon.png changes.
"""

import os

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'app_icon.png')

# Outer gold ring of app_icon.png, measured on its 512x512 canvas.
CX, CY, R = 259.5, 252.0, 231.0
S = 1024                  # supersample working size
INSET = int(S * 0.025)    # keeps the disc off Google's chip border


def build_round_icon():
    src = Image.open(SRC).convert('RGB')
    art = src.crop((int(CX - R), int(CY - R), int(CX + R), int(CY + R)))
    art = art.resize((S, S), Image.LANCZOS)

    art = ImageEnhance.Color(art).enhance(1.45)
    art = ImageEnhance.Contrast(art).enhance(1.30)
    art = ImageEnhance.Brightness(art).enhance(0.94)

    mask = Image.new('L', (S * 4, S * 4), 0)
    ImageDraw.Draw(mask).ellipse(
        [INSET * 4, INSET * 4, (S - INSET) * 4 - 1, (S - INSET) * 4 - 1], fill=255)
    mask = mask.resize((S, S), Image.LANCZOS)

    icon = art.convert('RGBA')
    icon.putalpha(mask)

    # Crisp gold rim: keeps the silhouette a ring once the interior turns to mush.
    rim = Image.new('RGBA', (S * 4, S * 4), (0, 0, 0, 0))
    ImageDraw.Draw(rim).ellipse(
        [INSET * 4 + 6, INSET * 4 + 6, (S - INSET) * 4 - 7, (S - INSET) * 4 - 7],
        outline=(247, 205, 96, 255), width=26)
    return Image.alpha_composite(icon, rim.resize((S, S), Image.LANCZOS))


def scaled(icon, size):
    im = icon.resize((size, size), Image.LANCZOS)
    if size <= 48:
        im = im.filter(ImageFilter.UnsharpMask(radius=1, percent=110, threshold=2))
    return im


def main():
    icon = build_round_icon()

    # Google wants a multiple of 48px; browsers pick the .ico.
    for size in (48, 96, 192):
        scaled(icon, size).save(os.path.join(ROOT, 'assets', f'favicon-{size}.png'))

    ico = scaled(icon, 48)
    ico.save(os.path.join(ROOT, 'favicon.ico'),
             sizes=[(16, 16), (32, 32), (48, 48)])

    # iOS composites onto a white tile and rounds the corners itself, so this one
    # stays square and opaque — transparent corners would render black.
    src = Image.open(SRC).convert('RGB')
    src.resize((180, 180), Image.LANCZOS).save(
        os.path.join(ROOT, 'apple-touch-icon.png'))

    print('wrote favicon.ico, apple-touch-icon.png, assets/favicon-{48,96,192}.png')


if __name__ == '__main__':
    main()
