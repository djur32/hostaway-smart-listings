#!/usr/bin/env python3
"""Fidelity check: render a frame at the screenshot's viewport and compare with the source.
- full side-by-side: ds/fidelity/<name>--full.png (screenshot left, ours right, 1x)
- component crops:   ds/fidelity/<name>--<part>.png for each named region (2x, CSS-px boxes)
Usage: python3 ds/tools/fidelity.py            (all frames in FRAMES)
       python3 ds/tools/fidelity.py details-arrival
"""
import os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sample, render

DS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FID = os.path.join(DS, 'fidelity')
TOP = 240   # browser content starts at y=240 (2x) in the 3024x1964 captures

# frame → (HS, {part: (x0, y0, x1, y1) in CSS px of the 1512x862 viewport})
FRAMES = {
    'details-arrival': ('HS-22', {
        'shell': (0, 0, 520, 862),
        'tabs-header': (512, 30, 1512, 170),
        'field-row': (540, 290, 1512, 480),
    }),
    'pricing-base': ('HS-30', {
        'ai-card': (540, 420, 1512, 520),
        'affix-inputs': (540, 280, 1512, 420),
    }),
    'security-deposit': ('HS-35', {
        'buttons': (1240, 180, 1500, 240),
        'radio-cards': (540, 330, 1512, 580),
    }),
    'messaging-rules': ('HS-48', {
        'table': (540, 280, 1512, 720),
        'filters': (540, 180, 1512, 280),
    }),
    'properties-all': ('HS-16', {
        'list-row': (540, 330, 1512, 440),
        'selection-bar': (560, 760, 900, 862),
    }),
    'onboarding-count': ('HS-01', {
        'onboarding': (0, 0, 1512, 862),
    }),
    'knowledge-modal': ('HS-57', {
        'modal': (350, 300, 1200, 800),
    }),
    'empty-review-rules': ('HS-49', {
        'empty-state': (540, 180, 1512, 460),
    }),
}


def label(im, text):
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 8 + 7 * len(text), 18), fill=(35, 11, 65))
    d.text((4, 3), text, fill=(255, 255, 255))
    return im


def run(name):
    hs, parts = FRAMES[name]
    page = os.path.join(FID, 'frames', name + '.html')
    tmp = os.path.join(FID, f'.{name}.ours.png')
    render.render(page, tmp)
    ours = Image.open(tmp).convert('RGB')
    ref = sample.load(hs).crop((0, TOP, 3024, TOP + 1724))
    full = Image.new('RGB', (1512 * 2 + 12, 862), 'white')
    full.paste(label(ref.resize((1512, 862)), f'{hs} · Hospitable (REAL·PRODUCT)'), (0, 0))
    full.paste(label(ours.resize((1512, 862)), 'DS replica (ours)'), (1524, 0))
    full.save(os.path.join(FID, f'{name}--full.png'))
    for part, (x0, y0, x1, y1) in parts.items():
        b = (x0 * 2, y0 * 2, x1 * 2, y1 * 2)
        a, o = ref.crop(b), ours.crop(b)
        w, h = a.size
        sbs = Image.new('RGB', (w * 2 + 16, h), 'white')
        sbs.paste(label(a, f'{hs} · Hospitable'), (0, 0)); sbs.paste(label(o, 'DS replica'), (w + 16, 0))
        sbs.save(os.path.join(FID, f'{name}--{part}.png'))
    os.remove(tmp)
    print(name, 'ok', list(parts))


if __name__ == '__main__':
    for n in (sys.argv[1:] or FRAMES):
        if os.path.exists(os.path.join(FID, 'frames', n + '.html')):
            run(n)
        else:
            print(n, 'frame missing')
