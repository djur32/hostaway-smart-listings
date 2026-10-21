#!/usr/bin/env node
/* ============================================================================
   SMOKE · open a page cold, the way a laptop on venue wifi would, and report
   what it cost: requests, bytes, time to ready, and any error.

     node tools/smoke.mjs            → dist/pages/hostaway.html (run tools/dist.mjs first)
     node tools/smoke.mjs --src      → the source pages (run tools/build.mjs first)
   ========================================================================= */
import path from 'node:path';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = process.argv.includes('--src') ? 'src/pages' : 'dist/pages';
const server = await serveSite(ROOT);
const chrome = await launchChrome();
let bad = 0;
try {
  for (const theme of ['hostaway']) {
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable'); await page.send('Network.enable');
    await page.send('Network.setCacheDisabled', { cacheDisabled: true });
    const errs = []; const reqs = new Map();
    page.on('Runtime.exceptionThrown', (p) => errs.push(p.exceptionDetails?.exception?.description?.split('\n')[0] || p.exceptionDetails?.text));
    page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errs.push('console.error ' + p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)); });
    page.on('Network.loadingFinished', (p) => reqs.set(p.requestId, p.encodedDataLength));
    page.on('Network.loadingFailed', (p) => { if (!p.canceled) errs.push('request failed ' + p.errorText); });
    page.on('Network.responseReceived', (p) => { if (p.response.status >= 400) errs.push(`${p.response.status} ${p.response.url.replace(server.origin, '')}`); });
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    const t0 = Date.now();
    await page.send('Page.navigate', { url: `${server.origin}/${DIR}/${theme}.html?qa` });   // qa: the first-visit Personalise dialog would hold the keys
    await page.once('Page.loadEventFired', 30000);
    await page.eval('window.Deck.ready', 30000);
    const ready = Date.now() - t0;
    await sleep(1500);
    // the cold open is the number that matters on venue wifi; the click-through total
    // below is a different thing (it pulls in every screenshot the deck can show)
    const cold = { n: reqs.size, kb: [...reqs.values()].reduce((a, b) => a + b, 0) / 1024 };
    const n = await page.eval('window.Deck.slides.length');
    for (const i of [1, 2, Math.floor(n / 2), n - 1]) { await page.eval(`window.Deck.go(${i}), true`); await sleep(900); }
    // clicks: a stage tab, every in-slide jump, a palette row, the logo (mouse, not keys)
    const clicks = await page.eval(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const D = window.Deck; const bad = [];
      const at = () => D.slides[D.current];
      document.querySelector('.stagetab[data-go-stage="4"]').click(); await wait(400);
      if (+at().dataset.stage !== 4) bad.push('stage tab 4 went to ' + at().dataset.id);
      const jumps = [...document.querySelectorAll('.deck > .s [data-goto]')].filter((j) => !/^\\d+$/.test(j.dataset.goto));
      for (const j of jumps) {
        const from = j.closest('.s'); D.go(+from.dataset.index); await wait(250);
        j.dispatchEvent(new MouseEvent('click', { bubbles: true })); await wait(250);
        if (at().dataset.id !== j.dataset.goto) bad.push(from.dataset.id + ' → ' + j.dataset.goto + ' went to ' + at().dataset.id);
      }
      dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true })); await wait(200);
      const row = document.querySelector('.palette__it:nth-child(3)'); const want = row && +row.dataset.i;
      row?.click(); await wait(300);
      if (!row || D.current !== want) bad.push('palette row click did not jump');
      // the Hostaway lockup, top left, goes back to the first slide
      D.go(Math.min(12, D.slides.length - 1)); await wait(300);
      const brand = document.querySelector('.appbar__brand');
      brand?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })); await wait(300);
      if (!brand || D.current !== 0) bad.push('brand logo click went to ' + (brand ? at().dataset.id : 'nothing: no .appbar__brand'));
      // every slide carries its way into Notion (kit/hc.js), a link or an honest "pending"
      const noLink = D.slides.filter((s) => !s.querySelector('.hc-notion')).map((s) => s.dataset.id);
      if (noLink.length) bad.push('no "In Notion" link on ' + noLink.slice(0, 5).join(', ') + (noLink.length > 5 ? '…' : ''));
      // a part opens under its cover (D-072), on aubergine, and → lifts it
      const first = D.slides.findIndex((s) => s.dataset.stage === '1');
      if (first >= 0) {
        D.go(first); await wait(1200);
        const cv = D.slides[first].querySelector(':scope > .hc-cover');
        const stageEl = document.querySelector('.stage');
        if (!cv) bad.push('no cover on ' + D.slides[first].dataset.id);
        else if (stageEl.dataset.ground !== 'aubergine') bad.push('cover up but the chrome is on ' + stageEl.dataset.ground);
        else { D.next(); await wait(1400); const r = cv.getBoundingClientRect(); if (r.bottom > stageEl.getBoundingClientRect().top + 2 && getComputedStyle(cv).visibility !== 'hidden') bad.push('cover did not lift on ' + D.slides[first].dataset.id);
          if (D.current !== first) bad.push('lifting the cover moved the deck to ' + at().dataset.id); }
      }
      return { n: jumps.length, bad };
    })()`, 120000);
    if (clicks.bad.length) errs.push(...clicks.bad.map((b) => 'click: ' + b));
    // the stage must sit centred and whole at laptop and projector sizes, not only at 1920×1080
    // laptop, projector, tablet and phone in landscape: the deck is presented wide everywhere
    for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [2560, 1440], [1180, 820], [844, 390]]) {
      await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
      await sleep(300);
      const r = await page.eval(`(() => { const r = document.querySelector('.stage').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`);
      const k = Math.min(w / 1920, h / 1080), ex = (w - 1920 * k) / 2, ey = (h - 1080 * k) / 2;
      if (Math.abs(r[0] - ex) > 1 || Math.abs(r[1] - ey) > 1 || Math.abs(r[2] - 1920 * k) > 1) errs.push(`stage at ${w}×${h} is at ${r.map(Math.round).join(',')}, expected ${Math.round(ex)},${Math.round(ey)},${Math.round(1920 * k)}`);
    }
    // a phone held upright asks for the turn instead of showing a deck nobody could read
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(400);
    const gate = await page.eval(`(() => { const r = document.querySelector('.rotate'); return r ? getComputedStyle(r).display : 'missing'; })()`);
    if (gate !== 'grid') errs.push(`portrait 390×844: the orientation gate is "${gate}", expected it shown`);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

    const kb = [...reqs.values()].reduce((a, b) => a + b, 0) / 1024;
    console.log(`${theme.padEnd(7)} ready in ${ready} ms · ${n} slides · cold open ${cold.n} requests / ${cold.kb.toFixed(0)} KB · after ${clicks.n + 3} clicks ${reqs.size} / ${kb.toFixed(0)} KB${errs.length ? ` · ${errs.length} error(s)` : ' · no errors'}`);
    for (const e of errs) console.log('   ' + e);
    bad += errs.length;
    await chrome.closePage(page);
  }
} finally { await chrome.close(); await server.close(); }
process.exitCode = bad ? 1 : 0;
