#!/usr/bin/env python3
"""
Sample named colours from the Hostaway screenshots and match each to the nearest
real Hostaway token.

Why this exists (S02 · design system): every colour in ds/tokens.css must be traceable
to a pixel in the product and, where possible, to Hostaway's own
public CSS custom properties (see hostaway-root-vars.json).

Method
- Screenshots are macOS captures tagged with the "Display" (Display P3) ICC profile.
  Raw pixel values are NOT sRGB: raspberry reads #cf3d5c raw but #e1295a in sRGB.
  Every sample is converted through the embedded profile to sRGB before matching.
- Screenshots are 2x (3024 px wide for a 1512 CSS-px viewport). Coordinates below are
  full-resolution pixels; divide by 2 for CSS px.
- mode "fill": median of a 5x5 patch (avoids anti-aliasing on flat fills).
- mode "ink":  inside a box, the pixel furthest from the box's median colour (used for
  text and thin glyphs, where a patch average would blend ink with background).
- Each sample is matched to the nearest token in hostaway-root-vars.json by
  CIE76 ΔE in Lab. ΔE < 2.3 ≈ a just-noticeable difference.

Usage: python3 ds/tools/sample.py            → prints a table, writes ds/tools/samples.json
"""
import io, json, math, os, sys
from PIL import Image, ImageCms

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOTS = os.path.join(ROOT, 'Hostaway Screenshots')
FILES = sorted(f for f in os.listdir(SHOTS) if f.endswith('.png'))  # HS-01..HS-59, filename order


def hs_file(hs):
    return FILES[int(hs.split('-')[1]) - 1]


# name, HS, mode, box (x0, y0, x1, y1) full-res px — for "fill" the box centre is used
POINTS = [
    # ── App shell · sidebar
    ('sidebar.bg',                    'HS-22', 'fill', (20, 1400, 40, 1420)),
    ('sidebar.getting-started.bg',    'HS-22', 'fill', (260, 470, 280, 490)),
    ('sidebar.item-active.bg',        'HS-22', 'fill', (400, 795, 420, 815)),
    ('sidebar.text',                  'HS-22', 'ink',  (100, 600, 200, 640)),
    ('sidebar.icon',                  'HS-22', 'ink',  (38, 600, 80, 645)),
    ('sidebar.badge',                 'HS-22', 'fill', (78, 480, 82, 484)),
    ('sidebar.collapse-icon',         'HS-22', 'ink',  (420, 290, 470, 330)),
    ('sidebar.trial-card.bg',         'HS-22', 'fill', (60, 1580, 80, 1600)),
    ('sidebar.trial-card.cta',        'HS-22', 'fill', (80, 1745, 100, 1760)),
    ('sidebar.footer-divider',        'HS-22', 'ink',  (200, 1815, 202, 1850)),
    # ── Property sub-nav rail
    ('subnav.bg',                     'HS-22', 'fill', (800, 1500, 820, 1520)),
    ('subnav.text',                   'HS-22', 'ink',  (630, 405, 720, 440)),
    ('subnav.text-active',            'HS-22', 'ink',  (630, 495, 720, 525)),
    ('subnav.icon',                   'HS-22', 'ink',  (575, 580, 615, 615)),
    ('subnav.back',                   'HS-22', 'ink',  (620, 325, 700, 350)),
    ('subnav.divider',                'HS-22', 'ink',  (1015, 1500, 1030, 1502)),
    # ── Content · type & structure
    ('content.bg',                    'HS-22', 'fill', (1500, 1500, 1520, 1520)),
    ('text.primary',                  'HS-22', 'ink',  (1104, 360, 1240, 410)),
    ('text.secondary (description)',  'HS-22', 'ink',  (1104, 710, 1400, 740)),
    ('text.tab-inactive',             'HS-22', 'ink',  (1104, 470, 1210, 510)),
    ('tab.underline',                 'HS-22', 'fill', (1330, 561, 1350, 562)),
    ('tab.divider',                   'HS-22', 'ink',  (1500, 556, 1502, 572)),
    ('input.border',                  'HS-22', 'ink',  (2500, 1000, 2502, 1012)),
    ('input.placeholder',             'HS-22', 'ink',  (2220, 1030, 2420, 1060)),
    ('input.chevron',                 'HS-22', 'ink',  (2860, 1030, 2910, 1060)),
    ('field.channels-hint',           'HS-22', 'ink',  (2200, 1110, 2340, 1140)),
    ('button.disabled.bg',            'HS-22', 'fill', (2800, 640, 2810, 650)),
    ('button.disabled.text',          'HS-22', 'ink',  (2840, 650, 2930, 680)),
    ('button.disabled.border',        'HS-22', 'ink',  (2825, 660, 2838, 662)),
    # ── Buttons & links (enabled)
    ('button.primary.bg',             'HS-35', 'fill', (2840, 640, 2845, 650)),
    ('button.secondary.border',       'HS-35', 'ink',  (2548, 660, 2564, 662)),
    ('link.brand',                    'HS-35', 'ink',  (1290, 780, 1500, 815)),
    ('floating-chat.bg',              'HS-35', 'fill', (2890, 1830, 2900, 1840)),
    ('floating-chat.dot',             'HS-35', 'fill', (2974, 1844, 2978, 1848)),
    # ── Radio card · Recommended pill
    ('radio.selected',                'HS-35', 'ink',  (1150, 1235, 1185, 1265)),
    ('radio.card.border',             'HS-35', 'ink',  (2024, 984, 2026, 1000)),
    ('pill.recommended.bg',           'HS-35', 'fill', (1734, 1053, 1738, 1057)),
    ('pill.recommended.text',         'HS-35', 'ink',  (1740, 1040, 1900, 1070)),
    ('radio.description',             'HS-35', 'ink',  (1220, 1085, 1500, 1110)),
    # ── Currency suffix/prefix
    ('input.affix.bg',                'HS-30', 'fill', (2876, 876, 2882, 882)),
    # ── AI promo card (Dynamic Pricing · New)
    ('ai-card.bg',                    'HS-30', 'fill', (1300, 1225, 1320, 1235)),
    ('ai-card.border',                'HS-30', 'ink',  (2024, 1096, 2026, 1112)),
    ('ai-card.title',                 'HS-30', 'ink',  (1130, 1130, 1360, 1160)),
    ('ai-card.body',                  'HS-30', 'ink',  (1130, 1180, 1700, 1210)),
    ('ai-card.new-pill.bg',           'HS-30', 'fill', (1418, 1146, 1420, 1148)),
    ('ai-card.new-pill.text',         'HS-30', 'ink',  (1425, 1135, 1470, 1160)),
    # ── Overview pills
    ('pill.lead-listing.bg',          'HS-21', 'fill', (1636, 714, 1640, 718)),
    ('pill.lead-listing.text',        'HS-21', 'ink',  (1680, 705, 1760, 730)),
    ('pill.fully-managed.bg',         'HS-21', 'fill', (1810, 710, 1816, 716)),
    ('link.underlined (neutral)',     'HS-21', 'ink',  (2680, 510, 2940, 540)),
    # ── Properties list
    ('link.green (help links)',       'HS-16', 'ink',  (1140, 560, 1440, 590)),
    ('filter.add (green)',            'HS-16', 'ink',  (1130, 690, 1220, 715)),
    ('pill.unlisted.bg',              'HS-16', 'fill', (1790, 978, 1794, 982)),
    ('pill.unlisted.text',            'HS-16', 'ink',  (1800, 965, 1880, 990)),
    ('checkbox.checked',              'HS-16', 'fill', (1134, 982, 1138, 986)),
    ('list-row.title (faded)',        'HS-16', 'ink',  (1310, 960, 1700, 990)),
    ('selection-bar.bg',              'HS-16', 'fill', (1300, 1800, 1310, 1810)),
    ('search.icon',                   'HS-16', 'ink',  (1130, 815, 1180, 865)),
    # ── Table · rules
    ('pill.scoped.bg',                'HS-48', 'fill', (1128, 933, 1132, 937)),
    ('pill.all.bg',                   'HS-48', 'fill', (2226, 945, 2230, 949)),
    ('button.onboarding-assistant.bg','HS-48', 'fill', (2640, 660, 2650, 670)),
    ('filter-chip.bg',                'HS-48', 'fill', (1500, 660, 1510, 670)),
    ('filter-chip.text',              'HS-48', 'ink',  (1190, 650, 1700, 680)),
    ('filter.active (green)',         'HS-48', 'ink',  (1190, 740, 1330, 765)),
    ('table.header',                  'HS-48', 'ink',  (1120, 840, 1200, 870)),
    ('table.divider',                 'HS-48', 'ink',  (2024, 996, 2026, 1016)),
    ('channel.direct',                'HS-48', 'ink',  (2770, 935, 2800, 965)),
    ('channel.airbnb',                'HS-48', 'ink',  (2805, 935, 2835, 965)),
    ('channel.vrbo',                  'HS-48', 'ink',  (2838, 935, 2862, 965)),
    ('channel.booking',               'HS-48', 'ink',  (2862, 935, 2900, 965)),
    ('channel.google (faded)',        'HS-48', 'ink',  (2905, 935, 2935, 965)),
    # ── Onboarding
    ('onboarding.bg (blush)',         'HS-01', 'fill', (200, 1100, 220, 1120)),
    ('onboarding.progress',           'HS-01', 'fill', (700, 1732, 704, 1733)),
    ('onboarding.progress-track',     'HS-01', 'ink',  (1800, 1728, 1802, 1742)),
    ('onboarding.tile.border',        'HS-01', 'ink',  (1500, 618, 1502, 634)),
    ('onboarding.stat-icon',          'HS-01', 'ink',  (60, 590, 130, 650)),
    ('onboarding.continue.bg',        'HS-01', 'fill', (2300, 1810, 2310, 1815)),
    # ── Import / connect flow
    ('import.progress (green)',       'HS-15', 'fill', (1300, 892, 1304, 896)),
    ('import.success-check',          'HS-15', 'ink',  (1460, 450, 1570, 570)),
    ('import.row-highlight.bg',       'HS-12', 'fill', (1100, 903, 1110, 908)),
    ('connect.header-rule',           'HS-15', 'fill', (1500, 323, 1510, 324)),
    # ── Empty state & illustration
    ('illustration.figure',           'HS-06', 'fill', (1780, 780, 1790, 790)),
    ('illustration.cloud',            'HS-06', 'fill', (1700, 630, 1706, 636)),
    ('illustration.outline',          'HS-06', 'ink',  (1705, 820, 1840, 850)),
    ('card.border (empty state)',     'HS-06', 'ink',  (2850, 1200, 2870, 1202)),
    ('illustration.dynamic-pricing',  'HS-31', 'fill', (2012, 1093, 2020, 1101)),
    # ── Knowledge Hub & modal
    ('kh.progress (green)',           'HS-41', 'fill', (1300, 1404, 1304, 1407)),
    ('kh.researching-text',           'HS-41', 'ink',  (1800, 1450, 2250, 1480)),
    ('accordion.border',              'HS-42', 'ink',  (2400, 954, 2402, 968)),
    ('modal.scrim-over-white',        'HS-57', 'fill', (2600, 1300, 2610, 1310)),
    ('modal.scrim-over-sidebar',      'HS-57', 'fill', (20, 1400, 30, 1410)),
    ('modal.add-topic (green)',       'HS-57', 'ink',  (1410, 920, 1570, 950)),
    ('dropdown.option-active.text',   'HS-57', 'ink',  (790, 1030, 950, 1060)),
    ('dropdown.option-active.bg',     'HS-57', 'fill', (1200, 1040, 1210, 1050)),
    # ── Calendar
    ('calendar.day.price-muted',      'HS-32', 'ink',  (1290, 1470, 1360, 1500)),
]


def load(hs, cache={}):
    if hs not in cache:
        im = Image.open(os.path.join(SHOTS, hs_file(hs)))
        icc = im.info.get('icc_profile')
        rgb = im.convert('RGB')
        if icc:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            dst = ImageCms.createProfile('sRGB')
            rgb = ImageCms.profileToProfile(rgb, src, dst, renderingIntent=0, outputMode='RGB')
        cache[hs] = rgb
    return cache[hs]


def hex_(c):
    return '#%02x%02x%02x' % tuple(int(round(v)) for v in c)


def lab(c):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in c)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z)))


def de(a, b):
    return math.dist(lab(a), lab(b))


def parse_hex(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(ch * 2 for ch in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def sample(im, mode, box):
    x0, y0, x1, y1 = box
    if mode == 'fill':
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        px = [im.getpixel((x, y)) for x in range(cx - 2, cx + 3) for y in range(cy - 2, cy + 3)]
        return tuple(sorted(p[k] for p in px)[len(px) // 2] for k in range(3))
    px = [im.getpixel((x, y)) for x in range(x0, x1) for y in range(y0, y1)]
    bg = tuple(sorted(p[k] for p in px)[len(px) // 2] for k in range(3))
    return max(px, key=lambda p: de(p, bg))


def main():
    tokens = json.load(open(os.path.join(os.path.dirname(__file__), 'hostaway-root-vars.json')))
    palette = {k: parse_hex(v) for k, v in tokens.items()
               if k.startswith('--color') and v.startswith('#') and len(v) in (4, 7)}
    out = []
    for name, hs, mode, box in POINTS:
        c = sample(load(hs), mode, box)
        near = sorted(palette.items(), key=lambda kv: de(c, kv[1]))[:3]
        row = {
            'name': name, 'hs': hs, 'file': hs_file(hs), 'mode': mode,
            'box_px_2x': box, 'hex_srgb': hex_(c),
            'nearest_token': near[0][0], 'token_hex': hex_(near[0][1]),
            'delta_e': round(de(c, near[0][1]), 2),
            'alternatives': [f'{k} {hex_(v)} ΔE{de(c, v):.1f}' for k, v in near[1:]],
            'provenance': '(+ token match)',
        }
        out.append(row)
        flag = '' if row['delta_e'] < 2.3 else ('  ~' if row['delta_e'] < 6 else '  ✗ no token match')
        print(f"{name:34s} {hs}  {row['hex_srgb']}  → {near[0][0]:38s} {row['token_hex']}  ΔE {row['delta_e']:5.2f}{flag}")
    json.dump({
        'method': 'Display-P3 → sRGB via embedded ICC; fill = 5x5 median; ink = furthest-from-median pixel in box; '
                  'nearest Hostaway token by CIE76 ΔE (hostaway-root-vars.json, captured from '
                  'https://my.hostaway.com/static/styles-K7T6MMZ5.css on 2026-09-29).',
        'samples': out,
    }, open(os.path.join(os.path.dirname(__file__), 'samples.json'), 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
