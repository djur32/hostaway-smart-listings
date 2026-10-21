#!/usr/bin/env python3
"""Render HTML pages to PNG with headless Chrome (2x, like the screenshots).
- Resolves `<!--#include file-->` into a sibling `.rendered.html` first (tiny SSI so frames
  share one <head>), renders it, then deletes it.
Usage: python3 ds/tools/render.py <page.html> <out.png> [width height]
"""
import os, re, subprocess, sys
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

def render(page, out, w=1512, h=862, scale=2):
    page = os.path.abspath(page); d = os.path.dirname(page)
    src = open(page).read()
    src = re.sub(r'<!--#include (\S+)-->', lambda m: open(os.path.join(d, m.group(1))).read(), src)
    tmp = page.replace('.html', '.rendered.html'); open(tmp, 'w').write(src)
    try:
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                        f'--window-size={w},{h}', f'--force-device-scale-factor={scale}', '--virtual-time-budget=2500',
                        f'--screenshot={os.path.abspath(out)}', 'file://' + tmp],
                       check=True, capture_output=True, timeout=60)
    finally:
        os.remove(tmp)
    return out

if __name__ == '__main__':
    a = sys.argv[1:]
    render(a[0], a[1], *(int(x) for x in a[2:4]))
    print(a[1])
