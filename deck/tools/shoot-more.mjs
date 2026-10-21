#!/usr/bin/env node
/* ============================================================================
   SHOOT-MORE · open every detail (overlay) in the deck and shoot its panels.

     node tools/shoot-more.mjs [--parts 10,20] [--first] [--out qa/more]

   Writes <out>/<theme>/<slide-id>--<detail-id>-p<N>.png. --first shoots panel 1 only
   (what the slide archive uses as the detail's thumbnail). Prints page errors last.
   ========================================================================= */
import path from 'node:path';
import fs from 'node:fs';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';
import { build } from './build.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const parts = opt('parts', null)?.split(',') ?? null;
const out = path.join(ROOT, opt('out', 'qa/v2/more'));
const themes = ['hospitable'];                       // one theme (D-071)
const FIRST = args.includes('--first');
const built = build({ suffix: `_ms${process.pid}`, quiet: true, parts });
const server = await serveSite(ROOT);
const chrome = await launchChrome();
const errors = [];
try {
  for (const theme of themes) {
    fs.mkdirSync(path.join(out, theme), { recursive: true });
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable');
    page.on('Runtime.exceptionThrown', (p) => errors.push(`[${theme}] ${p.exceptionDetails?.exception?.description?.split('\n')[0]}`));
    page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error' || p.type === 'warning') errors.push(`[${theme}] ${p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)}`); });
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 0.5, mobile: false });
    const base = `${server.origin}/src/pages/${built.files[theme]}`;
    let n = 0;
    await page.send('Page.navigate', { url: `${base}?static&theme=${theme}` });
    await page.once('Page.loadEventFired', 20000);
    await page.eval('window.Deck.ready', 20000);
    const list = await page.eval(`window.Deck.slides.map((s)=>({id:s.dataset.id, more:[...s.querySelectorAll('template.more')].map(t=>t.dataset.more)})).filter(s=>s.more.length)`);
    for (const s of list) {
      for (const m of s.more) {
        await page.send('Page.navigate', { url: `${base}?static&theme=${theme}&beat=99&n=${++n}#${s.id}` });
        await page.once('Page.loadEventFired', 20000);
        await page.eval('window.Deck.ready', 20000);
        await page.eval('document.fonts.ready.then(()=>true)');
        await sleep(500);
        const ok = await page.eval(`window.Deck.openMore(${JSON.stringify(m)})`);
        if (!ok) { errors.push(`[${theme}] could not open ${s.id}/${m}`); continue; }
        const count = FIRST ? 1 : await page.eval('window.Deck.moreState?.count || 0');
        for (let k = 0; k < count; k++) {
          await sleep(900);
          await page.eval(`Promise.all([...document.querySelectorAll('.more-sheet img')].map(i=>i.decode ? i.decode().catch(()=>0) : 0))`, 10000);
          await sleep(200);
          const { data } = await page.send('Page.captureScreenshot', { format: 'png' });
          const name = `${s.id}--${m}-p${k + 1}.png`;
          fs.writeFileSync(path.join(out, theme, name), Buffer.from(data, 'base64'));
          console.log(`${theme}/${name}`);
          if (k < count - 1) await page.eval(`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}))`);
        }
      }
    }
    await chrome.closePage(page);
  }
} finally {
  await chrome.close(); await server.close();
  for (const f of Object.values(built.files)) { try { fs.unlinkSync(path.join(ROOT, 'src/pages', f)); } catch {} }
}
console.log(errors.length ? errors.join('\n') : 'no page errors');
