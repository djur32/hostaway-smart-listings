#!/usr/bin/env python3
"""Rebrand an old concept screenshot to Hostaway: the dark purple sidebar becomes sand with dark text, raspberry
accents become Hostaway orange, and the old ring mark (sidebar, header, chat button) becomes the H icon.
Usage: sanitize_shot.py IN OUT [--debug]"""
import sys, colorsys
import numpy as np
from PIL import Image

ICON = Image.open('prototype/public/pwa/icon-192.png').convert('RGBA')
SAND = np.array([244, 239, 227], float); INK = np.array([29, 27, 22], float)
ORANGE_HUE = 22 / 360

def hsv(a):
    r, g, b = [a[..., i] / 255 for i in range(3)]
    mx = np.max(a / 255, axis=-1); mn = np.min(a / 255, axis=-1); d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, d / (mx + 1e-9), 0)
    return h, s, mx

def run(src, dst):
    im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(float); H, W = a.shape[:2]
    h, s, v = hsv(a)
    lum = a @ [0.299, 0.587, 0.114]
    # 1 · raspberry (hue 325..352°) → Hostaway orange, keeping saturation and value
    rasp = (h > 318 / 360) & (h < 356 / 360) & (s > 0.18) & (v > 0.3)
    if rasp.any():
        import colorsys as cs
        idx = np.where(rasp)
        for y, x in zip(*idx):
            r, g, b = cs.hsv_to_rgb(ORANGE_HUE, min(1, s[y, x] * 1.05), v[y, x] * 0.98)
            a[y, x] = (r * 255, g * 255, b * 255)
    # 2 · dark purple sidebar → sand, light content on it → ink
    band = a[int(H * 0.25):int(H * 0.75)]
    def purple_col(x):
        c = band[:, x]; L = c @ [0.299, 0.587, 0.114]
        return np.mean((c[:, 2] > c[:, 1] + 8) & (L < 90)) > 0.6
    w = 0
    while w < W // 3 and purple_col(w): w += 1
    if w > 30:
        side = a[:, :w]; L = side @ [0.299, 0.587, 0.114]
        base = np.median(L)
        t = np.clip((L - base) / (235 - base), 0, 1)[..., None]
        hs, ss, vs = hsv(side)
        keep = (np.abs(hs - ORANGE_HUE) < 0.06) & (ss > 0.45) & (vs > 0.5)   # orange badges stay coloured
        new = SAND + (INK - SAND) * t
        a[:, :w] = np.where(keep[..., None], side, new)
    h2, s2, v2 = hsv(a)
    dark = (h2 > 250 / 360) & (h2 < 300 / 360) & (v2 < 0.42) & (s2 > 0.3)
    if dark.any():
        L2 = (a @ [0.299, 0.587, 0.114])[..., None]
        a = np.where(dark[..., None], np.clip(L2 * np.array([1.0, 0.97, 0.9]) * 0.85, 0, 255), a)
    out = Image.fromarray(a.clip(0, 255).astype('uint8'))
    # 3 · marks: the ring logo at the top of the sidebar or header, and the chat button bottom-right
    def paste(x, y, size, clear=None, fill=(255, 255, 255)):
        if clear: out.paste(Image.new('RGB', (clear[2] - clear[0], clear[3] - clear[1]), fill), clear[:2])
        out.paste(ICON.resize((size, size), Image.LANCZOS), (x, y), ICON.resize((size, size), Image.LANCZOS))
    sc = W / 1200
    if w > 30:
        fill = tuple(int(c) for c in SAND)
        if w > 120:   # wide sidebar: ring + wordmark at top-left
            paste(int(18 * sc), int(14 * sc), int(28 * sc), (int(8 * sc), int(6 * sc), int(150 * sc), int(52 * sc)), fill)
        else:         # collapsed rail: the ring alone
            paste(int((w - 28 * sc) / 2), int(10 * sc), int(28 * sc), (0, 0, w, int(46 * sc)), fill)
    else:
        # header variant: an orange (ex-raspberry) ring in the top band, followed by the wordmark
        top = np.asarray(out)[: int(60 * sc)].astype(float); th, ts, tv = hsv(top)
        m = (np.abs(th - ORANGE_HUE) < 0.05) & (ts > 0.5) & (tv > 0.5)
        xs = np.where(m.any(axis=0))[0]
        if xs.size:
            x0 = xs.min(); ys = np.where(m.any(axis=1))[0]
            bg = tuple(int(c) for c in np.asarray(out)[2, max(0, x0 - 20)])
            paste(int(x0 - 2 * sc), int(ys.min() - 2 * sc), int(26 * sc), (int(x0 - 4 * sc), int(ys.min() - 4 * sc), int(x0 + 112 * sc), int(ys.max() + 6 * sc)), bg)
    # chat button: a saturated orange disc in the bottom-right corner
    br = np.asarray(out)[int(H * 0.82):, int(W * 0.86):].astype(float); bh, bs, bv = hsv(br)
    m = (np.abs(bh - ORANGE_HUE) < 0.06) & (bs > 0.5) & (bv > 0.5)
    if 200 * sc * sc < m.sum() < 5000 * sc * sc:
        ys, xs = np.where(m); cy, cx = int(ys.mean() + H * 0.82), int(xs.mean() + W * 0.86); r = min(int(max(np.ptp(ys), np.ptp(xs)) / 2) + 2, int(27 * sc))
        disc = ICON.resize((2 * r, 2 * r), Image.LANCZOS)
        mask = Image.new('L', (2 * r, 2 * r), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(mask).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255)
        out.paste(disc.convert('RGB'), (cx - r, cy - r), mask)
    out.save(dst)

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
