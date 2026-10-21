#!/usr/bin/env python3
"""Slide archive: every slide ever produced, grouped by concept, with a thumbnail.

    python3 tools/archive-index.py

Reads each SET below (a copy of src/ + the screenshots taken of it), makes 960px JPEG
thumbnails in slide-archive/thumbs/<set>/, and writes slide-archive/index.html. No
narrative: an index, ordered by case, then stage, then deck order. Re-run any time.
"""
import glob, html, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'slide-archive')

# (set id, label, src root, screenshot dir). A set is skipped if its folders don't exist.
SETS = [
    ('v1', 'Before v2 (26 Sep, archived)', 'archive/2026-09-26-before-v2/src', 'qa/v1-final/lumen'),
    ('v2', 'v2 (current deck)', 'src', 'qa/v2/lumen'),
]
CASES = [('owner-app', 'Owner App · Hostaway'), ('copilot', 'CoPilot AI · Hostaway'), ('inbox', 'Inbox · Hostaway'),
         ('adeslas', 'Adeslas'), ('santander', 'Santander Alternative Investments'), ('asisa', 'ASISA Vive'),
         ('hostaway', 'Hostaway (several products)'), ('general', 'General · intro, close, method')]
STAGES = {'0': 'Intro', '1': '01 Discovery', '2': '02 Research', '3': '03 Concept', '4': '04 Design',
          '5': '05 Test', '6': '06 Measure', '7': 'Close', '8': 'Appendix'}
PRODUCTS = [('owner-app', r'owner app'), ('copilot', r'co-?pilot'), ('inbox', r'\binbox\b')]


def attr(a, k):
    m = re.search(rf'data-{k}="([^"]*)"', a)
    return m.group(1) if m else ''


def case_of(a):
    c = attr(a, 'case')
    if c == 'segurcaixa':
        return 'adeslas'
    if c in ('santander', 'asisa'):
        return c
    if c == 'hostaway' or attr(a, 'product'):
        p = attr(a, 'product').split()
        if not p:
            p = [k for k, rx in PRODUCTS if re.search(rx, attr(a, 'case-name'), re.I)]
        return p[0] if len(p) == 1 else 'hostaway'
    return 'general'


def text(s):
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))).strip()

# what a detail is about: short codes in its id, full names in its title and opening words
CODES = {'owner-app': {'oa', 'owner'}, 'copilot': {'co', 'copilot'}, 'inbox': {'ib', 'inbox'},
         'adeslas': {'ad', 'adeslas', 'segurcaixa'}, 'santander': {'sa', 'santander'}, 'asisa': {'as', 'asisa'}}
NAMES = {'owner-app': r'owner app', 'copilot': r'co-?pilot', 'inbox': r'\binbox\b', 'adeslas': r'adeslas|segurcaixa',
         'santander': r'santander', 'asisa': r'\basisa\b'}


def detail_case(more, words, fallback):
    toks = set(re.split(r'[-_/]', more.lower()))
    hit = [k for k, c in CODES.items() if toks & c]
    if len(hit) != 1:
        hit = [k for k, rx in NAMES.items() if re.search(rx, words, re.I)]
    return hit[0] if len(hit) == 1 else fallback


def slides(src):
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, src, 'slides', '[0-9][0-9]*.html'))):
        body = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<section\b([^>]*\bdata-id="[^"]+"[^>]*)>(.*?)</section>', body, re.S):
            a, b = m.group(1), m.group(2)
            h = re.search(r'<h[12][^>]*>(.*?)</h[12]>', b, re.S)
            out.append(dict(id=attr(a, 'id'), stage=attr(a, 'stage'), case=case_of(a),
                            head=text(h.group(1)) if h else attr(a, 'title'), title=attr(a, 'title'),
                            mins=attr(a, 'min'), part=os.path.basename(f)))
            # overlay details (v2): <template class="more" data-more="id" data-title="…">, attributes in any order.
            # A detail is filed under the case it is about (its id, title or opening words), else its slide's case.
            for d in re.finditer(r'<template\b([^>]*)>(.*?)</template>', b, re.S):
                if not re.search(r'\bclass="[^"]*\bmore\b', d.group(1)):
                    continue
                more = attr(d.group(1), 'more') or 'detail'
                out.append(dict(id=attr(a, 'id') + ' › ' + more, slide=attr(a, 'id'), more=more, stage=attr(a, 'stage'),
                                case=detail_case(more, attr(d.group(1), 'title') + ' ' + text(d.group(2))[:240], case_of(a)),
                                head=attr(d.group(1), 'title') or 'More information', title='',
                                mins='', part=os.path.basename(f), overlay=True))
    return out


def thumb(shots, sid, set_id, r=None):
    if r and r.get('overlay'):   # details: panel 1, shot by tools/shoot-more.mjs into <shots>/../more/<theme>/
        hits = glob.glob(os.path.join(ROOT, os.path.dirname(shots), 'more', os.path.basename(shots), f"{r['slide']}--{r['more']}-p1.png"))
        sid = f"{r['slide']}--{r['more']}"
    else:
        hits = glob.glob(os.path.join(ROOT, shots, f'[0-9]*-{sid}-ball.png')) or glob.glob(os.path.join(ROOT, shots, f'[0-9]*-{sid}.png'))
    if not hits:
        return ''
    rel = f'thumbs/{set_id}/{sid}.jpg'
    dst = os.path.join(OUT, rel)
    if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(hits[0]):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        # macOS's own image tool: no Python imaging library needed
        subprocess.run(['sips', '-Z', '960', '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', hits[0], '--out', dst],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return rel


def main():
    items, sets = [], []
    for set_id, label, src, shots in SETS:
        if not os.path.isdir(os.path.join(ROOT, src, 'slides')) or not os.path.isdir(os.path.join(ROOT, shots)):
            continue
        rows = slides(src)
        current = set_id == SETS[-1][0]
        for i, r in enumerate(rows):
            r.update(set=set_id, order=i, thumb=thumb(shots, r['id'], set_id, r))
            items.append(r)
        sets.append((set_id, label, len(rows)))
    v2_ids = {r['id'] for r in items if r['set'] == 'v2'}
    for r in items:
        r['kept'] = r['set'] == 'v1' and r['id'] in v2_ids

    by_case = {k: [] for k, _ in CASES}
    for r in items:
        by_case.setdefault(r['case'], []).append(r)
    for k in by_case:
        by_case[k].sort(key=lambda r: (r['set'] != 'v2', int(r['stage'] or 0), r['order']))

    esc = html.escape
    nav = ''.join(f'<a href="#{k}">{esc(n)} <b>{len(by_case[k])}</b></a>' for k, n in CASES if by_case[k])
    legend = ' · '.join(f'<b>{s}</b> {esc(l)}: {n} slides' for s, l, n in sets)
    parts = []
    for k, name in CASES:
        rows = by_case[k]
        if not rows:
            continue
        cards = []
        for r in rows:
            tag = 'overlay' if r.get('overlay') else r['set']
            note = ' · also in v2' if r['kept'] else ''
            img = f'<a href="{r["thumb"]}" target="_blank"><img loading="lazy" src="{r["thumb"]}" alt=""></a>' if r['thumb'] else '<div class="nothumb">no screenshot</div>'
            cards.append(f'<li class="c {tag}">{img}<p class="m"><span class="t">{tag}</span> {esc(STAGES.get(r["stage"], "?"))}{note}</p>'
                         f'<p class="h">{esc(r["head"] or r["title"])}</p><p class="i">{esc(r["id"])} · {esc(r["part"])}</p></li>')
        parts.append(f'<section id="{k}"><h2>{esc(name)} <small>{len(rows)}</small></h2><ul>{"".join(cards)}</ul></section>')

    page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Slide archive</title><style>
:root{{--bg:#f7f5ef;--ink:#16140f;--mute:#6d685d;--line:#dcd7cb;--card:#fff;--v2:#2a78d6;--v1:#8a8374;--ov:#c98a1f}}
@media (prefers-color-scheme:dark){{:root{{--bg:#0b0d12;--ink:#e8e6e1;--mute:#8d93a0;--line:#232833;--card:#12151c}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Inter",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:14px 16px;z-index:1}}
h1{{margin:0 0 6px;font-size:18px}} .legend{{color:var(--mute);margin:0 0 8px}}
nav{{display:flex;flex-wrap:wrap;gap:6px 14px}} nav a{{color:var(--ink);text-decoration:none}} nav b{{color:var(--mute);font-weight:500}}
section{{padding:18px 16px 4px}} h2{{font-size:16px;margin:0 0 10px}} h2 small{{color:var(--mute);font-weight:400}}
ul{{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}}
.c{{background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden}}
.c img,.nothumb{{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--line)}}
.nothumb{{display:grid;place-items:center;color:var(--mute)}}
.c p{{margin:0;padding:0 10px}} .m{{padding-top:8px!important;color:var(--mute);font-size:12px}}
.h{{padding-top:4px!important;font-weight:500}} .i{{padding:4px 10px 10px!important;color:var(--mute);font:11px ui-monospace,Menlo,monospace;word-break:break-all}}
.t{{display:inline-block;padding:0 6px;border-radius:3px;color:#fff;font-size:11px;background:var(--v1)}}
.v2 .t{{background:var(--v2)}} .overlay .t{{background:var(--ov)}}
</style></head><body><header><h1>Slide archive</h1><p class="legend">{legend}. Grouped by concept, then stage. Click a thumbnail to enlarge.</p><nav>{nav}</nav></header>
{"".join(parts)}</body></html>'''
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
    print(f'slide-archive/index.html · {len(items)} entries · ' + ', '.join(f'{s}: {n}' for s, _, n in sets))


if __name__ == '__main__':
    main()
