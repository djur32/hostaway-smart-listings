#!/usr/bin/env node
/* ============================================================================
   EXPORT-PDF · the same slides as a PDF, every slide in its final state.

     node tools/export-pdf.mjs                → export/listing-management-ii.pdf
     node tools/export-pdf.mjs --kit          → the component gallery (export/kit-<theme>.pdf), to check
                                                how details print

   The brief asks for a presentation format (Keynote, PowerPoint, Google Slides or
   PDF). The live deck is the primary; this is the fallback if a browser can't be
   shared, and the leave-behind if they ask for one.

   Chrome's headless PDF printer stalls on some multi-slide jobs (seen with the
   Design, Test and appendix parts: any one slide prints in ~0.3 s, certain pairs
   never finish). So slides are printed in groups of CHUNK (the rest hidden); a
   group that stalls is split in half until it prints, and the pieces are joined
   with pdfunite (poppler), or macOS PDFKit when poppler is missing. Still vector. Fewer jobs keep the file small, because
   each job embeds its own copy of the fonts.

   Details (the overlays, CONTRACT §16.1) print after their slide, one page per
   panel: the print boot adds them as .more-page sections carrying their slide's
   data-index, so a job that holds a slide holds its details too.
   ========================================================================= */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const i = args.indexOf('--theme');
const themes = ['hospitable'];                       // one theme (D-071)
const out = path.join(ROOT, 'export');
fs.mkdirSync(out, { recursive: true });

const suffix = `_pdf${process.pid}`;
const KIT = args.includes('--kit');
const built = build({ suffix, quiet: true, kit: KIT });
const server = await serveSite(ROOT);
const chrome = await launchChrome();
// join with poppler's pdfunite when it is installed, else with macOS's own PDFKit (tools/lib/pdf-join.js)
const PDFUNITE = ['/opt/homebrew/bin/pdfunite', '/usr/local/bin/pdfunite', '/usr/bin/pdfunite'].find((p) => fs.existsSync(p));
const join = (files, file) => PDFUNITE ? execFileSync(PDFUNITE, [...files, file])
  : execFileSync('/usr/bin/osascript', ['-l', 'JavaScript', path.join(ROOT, 'tools/lib/pdf-join.js'), file, ...files]);
const tmp = fs.mkdtempSync(path.join(out, '.pages-'));
const CHUNK = 12, STALL = 20000;
try {
  for (const theme of themes) {
    const url = `${server.origin}/src/pages/${built.files[theme]}?print&theme=${theme}`;
    const parts = []; let n = 0; let jobs = 0; let details = 0;
    // print slides [a, b) as one job in a fresh page; if Chrome stalls, split the range in two
    const printRange = async (a, b) => {
      const page = await chrome.newPage();
      try {
        await page.send('Page.enable'); await page.send('Runtime.enable');
        await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
        await page.send('Page.navigate', { url });
        await page.once('Page.loadEventFired', 30000);
        await page.eval('window.Deck.ready', 60000);
        // a slide and its detail pages share one data-index: they print (or hide) together
        await page.eval(`(() => { const s = document.createElement('style'); s.textContent = [...Array(${n}).keys()].filter((k) => k < ${a} || k >= ${b}).map((k) => '.deck > [data-index="' + k + '"]').join(',') + '{ display: none !important; }'; document.head.append(s); return true; })()`);
        await page.eval(`Promise.all([...document.images].filter((i) => i.offsetParent).map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))`, 60000);
        await sleep(800);
        jobs++;
        const { data } = await page.send('Page.printToPDF', {
          printBackground: true, preferCSSPageSize: true, paperWidth: 20, paperHeight: 11.25,
          marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
        }, STALL + (b - a) * 1000);
        const part = path.join(tmp, `${theme}-${String(a).padStart(3, '0')}.pdf`);
        fs.writeFileSync(part, Buffer.from(data, 'base64')); parts.push([a, part]);
        process.stdout.write(`\r${theme}: ${parts.reduce((m, [x]) => m, 0) || ''}${b}/${n} `);
      } catch (e) {
        if (b - a === 1) throw new Error(`slide ${a + 1} will not print: ${e.message}`);
        await chrome.closePage(page).catch(() => {});
        const mid = Math.ceil((a + b) / 2);
        await printRange(a, mid); await printRange(mid, b);
        return;
      }
      await chrome.closePage(page);
    };
    { // count the slides once
      const page = await chrome.newPage(); await page.send('Page.enable'); await page.send('Runtime.enable');
      await page.send('Page.navigate', { url }); await page.once('Page.loadEventFired', 30000); await page.eval('window.Deck.ready', 60000);
      n = await page.eval('window.Deck.slides.length'); details = await page.eval("document.querySelectorAll('.deck > .more-page').length"); await chrome.closePage(page);
    }
    for (let a = 0; a < n; a += CHUNK) await printRange(a, Math.min(a + CHUNK, n));
    const file = path.join(out, KIT ? `kit-${theme}.pdf` : `listing-management-ii.pdf`);
    join(parts.sort((x, y) => x[0] - y[0]).map(([, f]) => f), file);
    console.log(`\r${file} · ${n + details} pages (${n} slides, ${details} detail pages) in ${parts.length} jobs (${jobs - parts.length} stalled and split) · ${(fs.statSync(file).size / 1e6).toFixed(1)} MB`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  await chrome.close(); await server.close();
  for (const f of Object.values(built.files)) { try { fs.unlinkSync(path.join(ROOT, 'src/pages', f)); } catch {} }
}
