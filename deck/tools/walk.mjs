#!/usr/bin/env node
/* ============================================================================
   WALK · drive the deck the way a presenter does, and prove nothing goes blank.

     node tools/walk.mjs [--parts 00,10] [--motion full|off]

   For every slide: arrive, press → through every beat, then ←, then →, then R
   (replay). After each move it waits for the motion to settle and checks that
   the current slide's content is actually visible (no top-level block left at
   opacity 0 / visibility hidden), that the slide is the one we expect, and
   that no page error was thrown. Prints one line per problem.
   ========================================================================= */
import path from 'node:path';
import fs from 'node:fs';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (k, dflt) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : dflt; };
const themes = ['hostaway'];                       // one theme (D-071)
const motion = opt('motion', 'full');
const settle = motion === 'off' ? 250 : 2600;

// --dist walks the production pages (dist/pages/*.html, run tools/dist.mjs first)
const DISTMODE = args.includes('--dist');
const suffix = `_walk${process.pid}`;
const built = DISTMODE ? { files: { hostaway: 'hostaway.html' } } : build({ suffix, quiet: true, parts: opt('parts', null)?.split(',') ?? null });
const PAGES = DISTMODE ? 'dist/pages' : 'src/pages';
const server = await serveSite(ROOT);
const chrome = await launchChrome();
const problems = [];
try {
  for (const theme of themes) {
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable');
    const errs = [];
    page.on('Runtime.exceptionThrown', (p) => errs.push(p.exceptionDetails?.exception?.description?.split('\n')[0] || p.exceptionDetails?.text));
    page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errs.push('console.error ' + p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)); });
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 0.5, mobile: false });
    await page.send('Page.navigate', { url: `${server.origin}/${PAGES}/${built.files[theme]}?qa&theme=${theme}&motion=${motion}#1` });
    await page.once('Page.loadEventFired', 30000);
    await page.eval('window.Deck.ready', 30000);
    const n = await page.eval('window.Deck.slides.length');
    const blank = `(() => {
      const s = document.querySelector('.s.is-current'); if (!s) return 'no current slide';
      // an element still waiting for its press (.is-held) is meant to be invisible; once its
      // beat has played the class is gone, so a missing element is still caught
      const kids = [...s.children].filter((c) => !c.matches('.notes, script, .art, style, .is-held') && c.getBoundingClientRect().height > 4);
      const bad = kids.filter((c) => { const cs = getComputedStyle(c); return +cs.opacity < 0.5 || cs.visibility === 'hidden'; });
      return bad.length ? 'invisible: ' + bad.map((c) => c.className || c.tagName).join(', ') : '';
    })()`;
    const key = async (k) => page.eval(`dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)} })), true`);
    const check = async (label, expect) => {
      await sleep(settle);
      const at = await page.eval('window.Deck.current');
      const id = await page.eval('window.Deck.slides[window.Deck.current].dataset.id');
      if (expect != null && at !== expect) problems.push(`[${theme}] ${label}: expected slide ${expect + 1}, at ${at + 1} (${id})`);
      const b = await page.eval(blank);
      if (b) problems.push(`[${theme}] ${id} after ${label}: ${b}`);
      while (errs.length) problems.push(`[${theme}] ${id} after ${label}: ${errs.shift()}`);
      return id;
    };
    for (let i = 0; i < n; i++) {
      await page.eval(`window.Deck.go(${i}), true`);
      const id = await check('arrive', i);
      const beats = await page.eval('window.Deck.active.beats.length');
      for (let b = 0; b < beats; b++) { await key('ArrowRight'); await check(`beat ${b + 1}`, i); }
      if (i > 0) { await key('ArrowLeft'); await check('←', i - 1); await key('ArrowRight'); await check('→ back', i); }
      await key('r'); await check('replay', i);
      process.stdout.write(`\r[${theme}] ${i + 1}/${n} ${id.padEnd(34)}`);
    }
    process.stdout.write('\n');
    await chrome.closePage(page);
  }
} finally {
  await chrome.close(); await server.close();
  if (!DISTMODE) for (const f of Object.values(built.files)) { try { fs.unlinkSync(path.join(ROOT, 'src/pages', f)); } catch {} }
}
console.log(problems.length ? `${problems.length} problem(s):\n${problems.join('\n')}` : 'walk clean: every slide, every beat, back, forward and replay stayed visible with no errors');
process.exitCode = problems.length ? 1 : 0;
