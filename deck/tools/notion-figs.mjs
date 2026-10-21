#!/usr/bin/env node
/* NOTION-FIGS · the diagrams in the Notion project guide, drawn from src/data/flows.json in the Notion variant,
   on a white card with the Hostaway footer. Writes ../notion/img-new/fig-<flow>.png.
     node tools/notion-figs.mjs [flow …]                         default: every flow */
import fs from 'node:fs';
import path from 'node:path';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.resolve(ROOT, '../notion/img-new');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/flows.json'), 'utf8')).flows;
const only = process.argv.slice(2);
const names = Object.keys(data).filter((k) => !only.length || only.includes(k));

const site = await serveSite(path.join(ROOT, 'src'));
const chrome = await launchChrome();
try {
  const page = await chrome.newPage();
  await page.send('Page.enable'); await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 2, mobile: false });
  await page.send('Page.navigate', { url: `${site.origin}/pages/hostaway.html` });
  await page.once('Page.loadEventFired', 30000);
  await sleep(2500);
  for (const k of names) {
    const r = await page.eval(`(async () => {
      const { renderFlow, flowsReady } = await import('../kit/flowmap.js');
      const d = await flowsReady; const spec = d.flows[${JSON.stringify(k)}];
      document.getElementById('nf')?.remove();
      const wrap = document.createElement('div'); wrap.id = 'nf';
      wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#eef0f2;display:flex;align-items:flex-start;justify-content:center;padding:40px;overflow:auto';
      wrap.innerHTML = '<div id="nf-card" style="width:1480px;background:#fff;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:44px 48px 0;font-family:var(--font-sans)">'
        + '<h2 style="margin:0 0 8px;font:600 34px/1.15 var(--font-sans);color:#1d1b16;letter-spacing:-0.01em"></h2>'
        + '<p style="margin:0 0 28px;max-width:1150px;font:400 19px/1.45 var(--font-sans);color:#53575b"></p>'
        + '<figure class="hc-flow" data-variant="notion" style="margin:0"></figure>'
        + '<footer style="display:flex;align-items:center;gap:12px;margin:32px -48px 0;padding:18px 48px;border-top:1px solid #e6e7ea;font:600 18px/1 var(--font-sans);color:#1d1b16">'
        + '<img src="../assets/icon-192.png" width="26" height="26" style="border-radius:6px">Hostaway <span style="font-weight:400;color:#70747b">· Smart Listings</span>'
        + '<span style="margin-left:auto;font-weight:400;color:#70747b">Project guide</span></footer></div>';
      document.body.append(wrap);
      wrap.querySelector('h2').textContent = spec.title || '';
      wrap.querySelector('p').textContent = (spec.caption || '').replace(/REAL·[A-Z]+|SIMULATED|PROJECTED|ASSUMPTION/g, '').replace(/\\s+([.,;])/g, '$1').trim();
      const fig = wrap.querySelector('figure'); renderFlow(fig, spec, 'notion');
      await document.fonts.ready; await new Promise((res) => setTimeout(res, 600));
      const b = document.getElementById('nf-card').getBoundingClientRect();
      return JSON.stringify({ x: b.x, y: b.y, w: b.width, h: b.height });
    })()`);
    const b = JSON.parse(r);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: Math.ceil(b.h + 80), deviceScaleFactor: 2, mobile: false });
    await sleep(400);
    const shot = await page.send('Page.captureScreenshot', { format: 'png', clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
    fs.writeFileSync(path.join(OUT, `fig-${k}.png`), Buffer.from(shot.data, 'base64'));
    console.log(`fig-${k}.png  ${Math.round(b.w)}x${Math.round(b.h)}`);
  }
} finally { await chrome.close(); site.close(); }
