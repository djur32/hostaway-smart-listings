#!/usr/bin/env python3
"""Apply plan/notion-v2/deck-links.json (slide → page key) to deck/src/data/notion-links.json,
resolving keys through plan/notion-v2/map.json. Run from anywhere: python3 deck/tools/notion-links.py"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = json.load(open(os.path.join(ROOT, 'plan/notion-v2/map.json')))
L = json.load(open(os.path.join(ROOT, 'plan/notion-v2/deck-links.json')))
OUT = os.path.join(ROOT, 'deck/src/data/notion-links.json')
import re, glob
NAMES = {}   # page URL → its title, read from the <page url="…">Title</page> tags of the local page copies
for f in glob.glob(os.path.join(ROOT, 'plan/notion-v2/pages/*.md')):
    for u, t in re.findall(r'<page url="(https://app\.notion\.com/p/[0-9a-f]+)">([^<]+)</page>', open(f).read()):
        NAMES.setdefault(u, t.strip())
for u, t in re.findall(r'<page url="(https://app\.notion\.com/p/[0-9a-f]+)">([^<]+)</page>', open(os.path.join(ROOT, 'plan/notion-v2/pages/hub.md')).read()):
    NAMES[u] = re.sub(r'^\d\d · ', '', t.strip()) if False else t.strip()
def resolve(key):
    if key == 'hub': return M['hub'], 'Hospitable · Smart Listings'
    if key == 'decision_log_db': return M['decision_log_db'], 'Decision log'
    if key.startswith('KD-'): u, t = M['decisions'][key]; return u, f'{key} · {t}'
    if '/' in key:
        sec, slug = key.split('/', 1); return M['pages'][sec][slug], None
    return M['sections'][key], None
SHORT = {  # streamlined labels for the hint's list (Antonio, 4 Oct)
    'KD-01': 'Why Smart Listings only', 'KD-02': 'Facts live once, in Shared', 'KD-03': 'Why a channel-first menu',
    'KD-04': 'Four cases for every field', 'KD-05': 'Opt-in per property', 'KD-06': 'One strategy per channel',
    'KD-07': 'No versions: before and after', 'KD-08': 'Autopilot on or off', 'KD-09': 'Tips in one docked panel',
    'KD-10': 'One AI action per field', 'KD-11': 'Tips cover money too', 'KD-12': 'Hub facts feed tips',
    'KD-13': 'How the Hub is organised', 'KD-14': "The Canvas, the guests' page", 'KD-15': 'Save sends, with receipts',
    'KD-16': "Replicate Hospitable's UI", 'KD-17': 'Bottom sheets on phones', 'KD-18': 'Label the sample, plan the tests',
    'KD-19': 'The north star, kept honest'}
def kind_of(key):
    if key.startswith('KD-'): return 'Decision'
    if key in ('hub',): return 'Workspace'
    slug = key.split('/')[-1]
    if slug.startswith('m-'): return 'Method'
    if slug.startswith('o-'): return 'Output'
    return 'Section'
def titled(key):
    u, t = resolve(key)
    if t is None:
        t = NAMES.get(u) or key.split('/')[-1]
    label = SHORT.get(key) or t.split(' · ', 1)[-1] if key.startswith('KD-') else (SHORT.get(key) or t)
    return {'url': u, 'title': t, 'key': key, 'label': label, 'kind': kind_of(key)}
out = json.load(open(OUT))
bad = []
for group in ('slides', 'details', 'panels', 'covers'):
    out[group] = {}
    for k, key in (L.get(group) or {}).items():
        try: out[group][k] = titled(key)
        except Exception as e: bad.append((group, k, key, str(e)))
out['lists'] = {}
for k, keys in (L.get('lists') or {}).items():
    try: out['lists'][k] = [titled(x) for x in keys[:4]]
    except Exception as e: bad.append(('lists', k, keys, str(e)))
out['chips'] = {}
for part, m in (L.get('chips') or {}).items():
    out['chips'][part] = {}
    for text, key in m.items():
        try: out['chips'][part][text] = titled(key)
        except Exception as e: bad.append(('chips', part, text, str(e)))
out['_note'] = out.get('_note', '') .split(' Since 4 Oct')[0] + ' Since 4 Oct: "slides", "details" (slide-id/detail-id or slide-id/*), "panels" (by panel title) and "covers" (by data-part) point into the condensed workspace and win over the older keys; edit plan/notion-v2/deck-links.json and run deck/tools/notion-links.py.'
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=2)
print(f"slides {len(out['slides'])} · lists {len(out['lists'])} · details {len(out['details'])} · panels {len(out['panels'])} · covers {len(out['covers'])} · chips {sum(len(v) for v in out['chips'].values())}")
for b in bad: print('UNRESOLVED', *b)
if bad: sys.exit(1)
