#!/usr/bin/env node
/* ============================================================================
   CAPTURE-PROTO · real screens from the running prototype, for the deck's mockups.

     node tools/capture-proto.mjs tools/proto-shots.json [name …]

   Reads a list of shots and writes each to src/assets/shots/<name>.webp (lazy-loaded
   by the deck through img[data-shot]). The prototype must be running (localhost:5174,
   `preview_start prototype` or `npm run dev` in prototype/). Nothing here touches the
   prototype's code: it only opens pages, clicks what a host would click, and screenshots.

   A shot: { "name": "sl-tips-airbnb", "path": "/property/neukolln/ch/airbnb/listing/essentials",
             "w": 1512, "h": 945, "scale": 1.5,
             "steps": [ { "click": "Tips" }, { "wait": 600 }, { "eval": "…js…" } ],
             "clip": { "x": 0, "y": 0, "w": 1512, "h": 945 } }
   A click step finds a button / link / [role=tab] / [role=button] whose visible text is exactly
   (then, failing that, starts with) the given words; { "css": "selector" } clicks a selector.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { launchChrome, sleep } from './lib/cdp.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/assets/shots');
const BASE = process.env.PROTO || 'http://localhost:5174';

const [listFile, ...only] = process.argv.slice(2);
if (!listFile) { console.error('usage: node tools/capture-proto.mjs <shots.json> [name …]'); process.exit(1); }
const shots = JSON.parse(fs.readFileSync(path.resolve(listFile), 'utf8')).filter((s) => !only.length || only.includes(s.name));

const CLICK = (text) => `(() => {
  const want = ${JSON.stringify(text)}.trim().toLowerCase();
  const els = [...document.querySelectorAll('button, a, [role=tab], [role=button], [role=menuitem], label, summary')]
    .filter((e) => e.offsetParent !== null);
  const txt = (e) => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').toLowerCase();
  const el = els.find((e) => txt(e) === want) || els.find((e) => txt(e).startsWith(want)) || els.find((e) => (e.getAttribute('aria-label') || '').toLowerCase() === want);
  if (!el) return 'missing: ' + want;
  el.scrollIntoView({ block: 'center' }); el.click(); return 'ok';
})()`;

const chrome = await launchChrome();
let bad = 0;
try {
  for (const s of shots) {
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable');
    const w = s.w || 1512, h = s.h || 945, scale = s.scale || 1.5;
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile: !!s.mobile });
    await page.send('Page.navigate', { url: BASE + s.path });
    await page.once('Page.loadEventFired', 20000);
    await sleep(s.settle ?? 900);
    for (const st of s.steps || []) {
      if (st.wait) await sleep(st.wait);
      if (st.click) { const r = await page.eval(CLICK(st.click)); if (r !== 'ok') { console.log(`  ${s.name}: ${r}`); bad++; } await sleep(st.after ?? 500); }
      if (st.css) { const r = await page.eval(`(() => { const el = document.querySelector(${JSON.stringify(st.css)}); if (!el) return 'missing ' + ${JSON.stringify(st.css)}; el.scrollIntoView({block:'center'}); el.click(); return 'ok'; })()`); if (r !== 'ok') { console.log(`  ${s.name}: ${r}`); bad++; } await sleep(st.after ?? 500); }
      if (st.eval) { await page.eval(st.eval); await sleep(st.after ?? 300); }
      if (st.scroll != null) { await page.eval(`window.scrollTo(0, ${st.scroll}); document.querySelectorAll('main, [data-scroll], .h-content').forEach((m) => { if (m.scrollHeight > m.clientHeight) m.scrollTop = ${st.scroll}; }); true`); await sleep(400); }
    }
    await page.eval('document.fonts.ready.then(() => true)');
    await sleep(300);
    const c = s.clip ? { x: s.clip.x, y: s.clip.y, width: s.clip.w, height: s.clip.h, scale: 1 } : undefined;
    const { data } = await page.send('Page.captureScreenshot', { format: 'webp', quality: 88, ...(c ? { clip: c } : {}) });
    fs.writeFileSync(path.join(OUT, `${s.name}.webp`), Buffer.from(data, 'base64'));
    console.log(`${s.name}.webp  ← ${s.path}`);
    await chrome.closePage(page);
  }
} finally { await chrome.close(); }
process.exitCode = bad ? 1 : 0;
