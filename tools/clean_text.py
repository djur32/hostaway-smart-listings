#!/usr/bin/env python3
"""Bulk text-rule pass (see plan/RULES.md). Usage: clean_text.py ROOT [ROOT...]
Mechanical only: names, provenance tags, links. Semantic rewrites are done by hand."""
import re, sys, pathlib

EXT = {'.html', '.css', '.js', '.mjs', '.ts', '.tsx', '.json', '.md', '.svg', '.txt', '.py', '.sh', '.yml', '.yaml', '.mdx'}
SKIP = {'node_modules', 'dist', 'out', 'qa', '.git', 'fonts', 'vendor'}
TAG = r'(?:REAL·(?:BRIEF|PRODUCT|PUBLIC)|||)'

def cap_ctx(s, i):
    """True if position i starts a sentence/element."""
    j = i - 1
    while j >= 0 and s[j] in ' \t': j -= 1
    return j < 0 or s[j] in '.!?\n>"“' or s[j-1:j+1] in ('**',)

def repl_assistant(m):
    s = m.string
    pos = m.start()
    base = 'the assistant'
    out = base + (m.group('poss') or '')
    return out[0].upper() + out[1:] if cap_ctx(s, pos) else out

RULES = [
    # links to the old hosted case-study sites
    (re.compile(r'\s*]*"'), ''),
    (re.compile(r'\s*data-notion[a-z-]*="[^"]*"'), ''),
    (re.compile(r'https?://hostaway-case-[a-z]+\.digimal\.studio[^\s"\'`)<>\]]*'), ''),
    # empty provenance spans in deck html
    (re.compile(r'<span class="hc-prov[^"]*"[^>]*></span>'), ''),
    # provenance tags
    (re.compile(r'\s*[\(\[]' + TAG + r'[\)\]]'), ''),
    (re.compile(r'([\(\[])' + TAG + r'[,:;]\s*'), r'\1'),
    (re.compile(r'`' + TAG + r'`\s*[·,]?\s*'), ''),
    (re.compile(r'\b' + TAG + r'\b(?:\s*[·/]\s*' + TAG + r')*[:,]?[ \t]*'), ''),
    # assistant naming
    (re.compile(r"(?:Hostaway(?:’s|'s)?\s+)?(?:AI\s+)?The assistant(?P<poss>’s|'s)?"), repl_assistant),
    # brand
    (re.compile(r'Hostaway'), 'Hostaway'),
    (re.compile(r'HOSTAWAY'), 'HOSTAWAY'),
    (re.compile(r'hostaway'), 'hostaway'),
    # working-note attributions
    (re.compile(r'antonio-(\d{4})'), r'review-\1'),
    (re.compile(r'review(?:’s|\'s)'), "review's"),
    (re.compile(r'\bAntonio\b(?=[ ,:(])'), 'review'),
]

def clean(text):
    for rx, rep in RULES:
        text = rx.sub(rep, text)
    return text

def main(roots):
    n = 0
    for root in roots:
        p = pathlib.Path(root)
        files = [p] if p.is_file() else [f for f in p.rglob('*') if f.is_file()]
        for f in files:
            if any(part in SKIP for part in f.parts) or f.suffix not in EXT: continue
            try: t = f.read_text()
            except Exception: continue
            c = clean(t)
            if c != t:
                f.write_text(c); n += 1
    print('files changed', n)

if __name__ == '__main__':
    main(sys.argv[1:])
