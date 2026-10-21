#!/usr/bin/env python3
"""Mark an image as part of this case study before it goes into Notion (Antonio, 4 Oct:
"all of the images … have the mark … Hospitable · Smart Listings, Antonio Silva").

The mark is a band added UNDER the image, so it never covers content:
  left   the Hospitable ring, then "Hospitable · Smart Listings"
  right  "Antonio Silva · Head of Design case study"
Colours are ds/tokens.css values (primary-500, sidebar aubergine, gray-500, gray-200); the type is TT Norms
from ds/fonts. Usage:

  python3 tools/watermark.py in.png out.png [--max-width 2400]
  python3 tools/watermark.py --dir src_dir out_dir      (every png/jpg in src_dir)
"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F500 = os.path.join(ROOT, 'ds/fonts/TTNorms-500.woff')
F700 = os.path.join(ROOT, 'ds/fonts/TTNorms-700.woff')
RASPBERRY = (0xF2, 0x41, 0x67)      # --color-primary-500
AUBERGINE = (0x1A, 0x0A, 0x33)      # --color-sidebar-bg (secondary-950)
GRAY = (0x70, 0x74, 0x7B)           # --color-gray-500
LINE = (0xE6, 0xE7, 0xEA)           # --color-gray-200
BAND_BG = (0xFF, 0xFF, 0xFF)


def mark(src, dst, max_width=2400):
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        im = bg.convert('RGB')
    else:
        im = im.convert('RGB')
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    w, h = im.size
    band = max(44, round(w * 0.034))
    fs = max(14, round(band * 0.36))
    out = Image.new('RGB', (w, h + band), BAND_BG)
    out.paste(im, (0, 0))
    d = ImageDraw.Draw(out)
    d.line([(0, h), (w, h)], fill=LINE, width=max(1, round(band / 44)))
    pad = round(band * 0.5)
    cy = h + band / 2
    # the ring mark: a raspberry ring with a short bar under it, as in the product's logo
    r = fs * 0.42
    rx = pad + r
    ry = cy - fs * 0.12
    d.ellipse([rx - r, ry - r, rx + r, ry + r], outline=RASPBERRY, width=max(2, round(fs * 0.16)))
    d.rounded_rectangle([rx - r * 0.55, ry + r * 1.18, rx + r * 0.55, ry + r * 1.18 + fs * 0.14], radius=fs * 0.07, fill=RASPBERRY)
    f_b = ImageFont.truetype(F700, fs)
    f_m = ImageFont.truetype(F500, fs)
    x = rx + r + fs * 0.55
    left_a, left_b = 'Hospitable', '  ·  Smart Listings'
    d.text((x, cy), left_a, font=f_b, fill=AUBERGINE, anchor='lm')
    x += d.textlength(left_a, font=f_b)
    d.text((x, cy), left_b, font=f_m, fill=AUBERGINE, anchor='lm')
    right = 'Antonio Silva  ·  Head of Design case study'
    d.text((w - pad, cy), right, font=f_m, fill=GRAY, anchor='rm')
    ext = os.path.splitext(dst)[1].lower()
    if ext in ('.jpg', '.jpeg'):
        out.save(dst, quality=90)
    else:
        out.save(dst, optimize=True)
    return dst


if __name__ == '__main__':
    a = sys.argv[1:]
    mw = 2400
    if '--max-width' in a:
        i = a.index('--max-width'); mw = int(a[i + 1]); del a[i:i + 2]
    if a and a[0] == '--dir':
        src_dir, out_dir = a[1], a[2]
        os.makedirs(out_dir, exist_ok=True)
        for f in sorted(glob.glob(os.path.join(src_dir, '*'))):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                print(mark(f, os.path.join(out_dir, os.path.basename(f)), mw))
    elif len(a) == 2:
        print(mark(a[0], a[1], mw))
    else:
        sys.exit(__doc__)
