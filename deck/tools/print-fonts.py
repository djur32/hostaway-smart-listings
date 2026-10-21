#!/usr/bin/env python3
"""
PRINT-FONTS · static instances of the variable fonts, for the PDF only.

    python3 tools/print-fonts.py      → src/kit/fonts/print/<Family>-<weight>.woff

Chrome's PDF backend cannot embed a variable font: it draws every glyph as a
Type 3 outline, per page, which made the PDFs 27 MB and 54 MB. In print mode
(`?print`, used by tools/export-pdf.mjs) the deck switches to these static cuts,
which embed as ordinary TrueType subsets. The screen deck never loads them.

Needs fontTools. Reading .woff2 needs brotli; when the Python module is missing,
Node's built-in zlib.brotliDecompressSync stands in for it.
"""
import os, sys, subprocess, tempfile, types

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src/kit/fonts')
OUT = os.path.join(SRC, 'print')
FAMILIES = {'GeistMono': 'GeistMono-Variable.woff2'}  # TT Norms ships as static cuts already (S02 D-093)
# every weight the deck's CSS asks for (grep font-weight / --w-* in src/kit and src/slides)
WEIGHTS = [400, 500, 600, 700]

try:
    import brotli  # noqa: F401
except ImportError:
    shim = types.ModuleType('brotli')
    def decompress(data):
        js = 'process.stdout.write(require("zlib").brotliDecompressSync(require("fs").readFileSync(0)))'
        return subprocess.run(['node', '-e', js], input=data, capture_output=True, check=True).stdout
    shim.decompress = decompress
    sys.modules['brotli'] = shim

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

os.makedirs(OUT, exist_ok=True)
for fam, file in FAMILIES.items():
    base = TTFont(os.path.join(SRC, file))
    axes = {a.axisTag: a for a in base['fvar'].axes}
    for w in WEIGHTS:
        f = TTFont(os.path.join(SRC, file))
        pins = {tag: (w if tag == 'wght' else a.defaultValue) for tag, a in axes.items()}
        pins['wght'] = max(axes['wght'].minValue, min(axes['wght'].maxValue, w))
        inst = instantiateVariableFont(f, pins, updateFontNames=False)
        inst.flavor = 'woff'
        dest = os.path.join(OUT, f'{fam}-{w}.woff')
        inst.save(dest)
        print(f'{fam:10} {w:4} → {os.path.relpath(dest, ROOT)} ({os.path.getsize(dest) // 1024} KB)')
