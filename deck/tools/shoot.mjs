#!/usr/bin/env node
/* ============================================================================
   SHOOT · visual QA that any number of agents can run at the same time.

   Every run starts its OWN static server on a free port and its OWN headless
   Chrome, so parallel runs never share a browser or a port.

     node tools/shoot.mjs <id|index>[,<id>…] [options]
     node tools/shoot.mjs --all                   every slide, final state

   options
     --theme hospitable          the only theme (kept so old commands still run)
     --beat N | --beat all       press → N times (all = every beat) before the shot
     --t 0.6[,1.2,…]             instead of the final state, freeze the entry
                                 animation at these seconds (to judge motion)
     --bt 0.4[,0.9,…]            with --beat N: freeze beat N itself at these seconds
     --out qa/<dir>              default qa/
     --scale 0.5                 device scale factor (0.5 = quicker, smaller)
     --parts 10,20               build ONLY these slide files (by filename prefix)
                                 into a private page for this run. Default: all.
     --kit                       shoot the component gallery (src/slides/_*.html)

   Writes <out>/<theme>/<NN>-<id>[-bN][-tX].png and prints page errors, which
   are the first thing to read.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (k, dflt) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : dflt; };
const flag = (k) => args.includes('--' + k);
const VALUED = new Set(['--theme', '--beat', '--t', '--bt', '--out', '--scale', '--parts']);
const bare = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
const targets = flag('all') || !bare.length ? null : bare.join(',').split(',').filter(Boolean);
const themes = ['hospitable'];                       // one theme (D-071); --theme is accepted and ignored
const beatOpt = opt('beat', '0');
const btimes = opt('bt', '') ? opt('bt').split(',').map(Number) : null;
const times = btimes ? btimes.map((v) => ({ bt: v })) : opt('t', '') ? opt('t').split(',').map(Number) : [null];
const outDir = path.resolve(ROOT, opt('out', 'qa'));
const dsf = parseFloat(opt('scale', '1'));

// a private build for this run: parallel agents never read each other's half-written pages
const suffix = `_q${process.pid}`;
const built = build({ suffix, quiet: true, kit: flag('kit'), parts: opt('parts', null)?.split(',') ?? null });
if (built.warnings.length) console.log(`lint:\n${built.warnings.join('\n')}\n`);
const server = await serveSite(ROOT);
const chrome = await launchChrome();
const errors = [];
let navN = 0;
try {
  for (const theme of themes) {
    fs.mkdirSync(path.join(outDir, theme), { recursive: true });
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable');
    page.on('Runtime.exceptionThrown', (p) => errors.push(`[${theme}] ${p.exceptionDetails?.exception?.description?.split('\n')[0] || p.exceptionDetails?.text}`));
    page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error' || p.type === 'warning') errors.push(`[${theme}] console.${p.type}: ${p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300)}`); });
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: dsf, mobile: false });

    // discover slides once
    const base = `${server.origin}/src/pages/${built.files[theme]}`;
    await page.send('Page.navigate', { url: `${base}?static` });
    await page.once('Page.loadEventFired', 20000);
    await page.eval('window.Deck && window.Deck.ready', 20000);
    const list = await page.eval(`window.Deck.slides.map((s,i)=>({i, id:s.dataset.id, beats: 0}))`);
    const pick = targets ? list.filter((s) => targets.includes(s.id) || targets.includes(String(s.i + 1))) : list;
    if (targets && !pick.length) console.log(`no slide matched ${targets.join(',')}. ids: ${list.map((s) => s.id).join(', ')}`);

    for (const s of pick) {
      for (const t of times) {
        const params = new URLSearchParams();
        const isBt = t !== null && typeof t === 'object';
        if (t === null) params.set('static', '');
        params.set('theme', theme);
        if (beatOpt !== '0' && beatOpt !== 'all') params.set('beat', beatOpt);
        if (beatOpt === 'all') params.set('beat', '99');
        if (isBt) params.set('bt', String(t.bt)); else if (t !== null) params.set('t', String(t));
        params.set('n', String(++navN));            // always a real load, never a same-document hash change
        const url = `${base}?${params.toString().replace(/=(&|$)/g, '$1')}#${s.id}`;
        await page.send('Page.navigate', { url });
        await page.once('Page.loadEventFired', 20000);
        await page.eval('window.Deck.ready', 20000);
        await page.eval('document.fonts.ready.then(()=>true)');
        // let images decode and any canvas draw a frame
        // decode(), not complete: complete goes true when the bytes land, but the
        // frame can still be undecoded when the screenshot fires — which shot three
        // of the six phones on appx-co-grammar as empty black frames.
        await page.eval(`Promise.all([...document.querySelectorAll('.s.is-current img')].map(i=>i.decode ? i.decode().catch(()=>0) : (i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))))`, 15000);
        await sleep(t === null ? 900 : 120);
        const { data } = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        const name = `${String(s.i + 1).padStart(2, '0')}-${s.id}${beatOpt !== '0' ? `-b${beatOpt}` : ''}${isBt ? `-bt${t.bt}` : t !== null ? `-t${t}` : ''}.png`;
        fs.writeFileSync(path.join(outDir, theme, name), Buffer.from(data, 'base64'));
        console.log(`${theme}/${name}`);
      }
    }
    await chrome.closePage(page);
  }
} finally {
  await chrome.close(); await server.close();
  for (const f of Object.values(built.files)) { try { fs.unlinkSync(path.join(ROOT, 'src/pages', f)); } catch {} }
}
if (errors.length) { console.log(`\n${errors.length} page message(s):`); console.log([...new Set(errors)].join('\n')); }
else console.log('\nno page errors');
