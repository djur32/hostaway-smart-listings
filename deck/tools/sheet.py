#!/usr/bin/env python3
"""Contact sheet: python3 tools/sheet.py <dir-with-pngs> [out.png] [cols]"""
import sys, glob, os
from PIL import Image, ImageDraw
d = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(d, '_sheet.png'); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
files = sorted(f for f in glob.glob(os.path.join(d, '*.png')) if not os.path.basename(f).startswith('_'))
if not files: sys.exit('no pngs')
tw = 640; th = 360; pad = 22
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + pad)), (40, 40, 40))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB'); im.thumbnail((tw, th))
    x = (i % cols) * tw; y = (i // cols) * (th + pad)
    sheet.paste(im, (x, y + pad)); dr.text((x + 6, y + 5), os.path.basename(f), fill=(230, 230, 230))
sheet.save(out); print(out, sheet.size)
