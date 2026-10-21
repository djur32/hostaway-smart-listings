#!/usr/bin/env node
/* ============================================================================
   AUDIT-MOTION · the motion rules of CONTRACT §16.6, measured on the live page.

     node tools/audit-motion.mjs [--parts 10,20] [--ids a,b] [--kit]
                                 [--early 300] [--budget 2]

   For every slide it measures two things.

   1 · When the entry reads as settled. From the moment the slide is entered, it
       watches every GSAP tween that belongs to the slide. A tween still easing
       below 95% of its travel is "moving"; the entry is settled once nothing is.
       Ambient loops (api.ambient, data-cycle, anything repeat: -1 that the kit
       started after the entry) never count. Reported: over the budget (2 s), and
       "never settles" when a finite tween is still moving after 8 s, and "infinite
       entry" when the entry timeline itself contains an infinite loop.

   2 · Whether pressing → early, or coming back, ever loses anything. The slide is
       played at normal pace through every beat (A); then left, re-entered, with →
       pressed `--early` ms into its entry and every other beat pressed as quickly
       (B). Anything visible in A (effective opacity, every ancestor multiplied)
       that is not visible in B is a bug. This is the 26 Sep audit, kept.

   Prints one line per slide with a problem, and a summary. Particles that a loop
   fades in and out along a path (api.loop) can show as "lost" in B only because
   they are at another point of their cycle: check such lines by eye.
   ========================================================================= */
import path from 'node:path';
import fs from 'node:fs';
import { serveSite, launchChrome, sleep } from './lib/cdp.mjs';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const themes = ['hostaway'];                       // one theme (D-071)
const ids = opt('ids', '') ? opt('ids').split(',') : null;
const early = +opt('early', '300');
const budget = +opt('budget', '2');
const built = build({ suffix: `_am${process.pid}`, quiet: true, kit: args.includes('--kit'), parts: opt('parts', null)?.split(',') ?? null });
const server = await serveSite(ROOT);
const chrome = await launchChrome();
const report = [];
let slow = 0, lost = 0, never = 0;

/* runs in the page: is anything that belongs to the current slide still visibly moving? */
const PROBE = `(() => {
  const D = window.Deck, a = D.active, s = a.slide, g = window.gsap;
  const ambient = (t) => { for (let p = t; p; p = p.parent) if (p.data === 'ambient' || p.repeat?.() === -1) return true; return false; };
  const finite = (t) => !ambient(t) && t.totalDuration() < 1e5 && t.duration() > 0;
  // the entry's own tweens: one that has not started yet (ratio 0) is still to come, so it counts
  const entry = a.enter.getChildren(true, true, false).filter(finite);
  const held = new Set(a.beats.flatMap((b) => b.getChildren(true, true, false)));
  const mine = new Set(entry);
  const inSlide = (t) => (t.targets?.() || []).some((x) => x instanceof Element && s.contains(x));
  const other = g.globalTimeline.getChildren(true, true, false).filter((t) => !mine.has(t) && !held.has(t) && finite(t) && t.isActive() && inSlide(t));
  // how far along its eased travel a tween is (GSAP's own ratio runs backwards for from() tweens)
  const eased = (t) => { const p = t.progress(); try { return t._ease ? t._ease(p) : p; } catch { return p; } };
  // a finished tween is still; a repeating one (a yoyo pulse) is judged on its whole run
  const moving = [...entry, ...other].filter((t) => t.totalProgress() < 1 && (t.repeat() ? t.totalProgress() < 0.95 : eased(t) < 0.95));
  const name = (x) => (x instanceof Element ? (x.getAttribute('class') || x.tagName).split(' ')[0] : typeof x);
  return { moving: moving.length, started: a.enter.progress() > 0 || !a.enter.duration(), infinite: a.enter.totalDuration() > 1e5,
    first: moving.sort((x, y) => (y.endTime?.() ?? 0) - (x.endTime?.() ?? 0)).slice(0, 3).map((t) => (t.targets?.() || []).slice(0, 2).map(name).join(' ').slice(0, 40) + ' (' + t.duration().toFixed(2) + ' s)') };
})()`;
const SNAP = `(() => { const s = document.querySelector('.s.is-current'); const r = {};
  const eff = (el) => { let o = 1; for (let e = el; e && e !== s.parentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= +cs.opacity; } return o; };
  [...s.querySelectorAll('*')].forEach((el, i) => { if (el.closest('.notes, script, template, .more-cue, [data-cycle]')) return; const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return;
    r[i] = { o: +eff(el).toFixed(2), tag: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''), t: el.children.length ? '' : el.textContent.trim().slice(0, 24) }; });
  return r; })()`;

try {
  for (const theme of themes) {
    const page = await chrome.newPage();
    await page.send('Page.enable'); await page.send('Runtime.enable');
    const errs = [];
    page.on('Runtime.exceptionThrown', (p) => errs.push(p.exceptionDetails?.exception?.description?.split('\n')[0]));
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 0.5, mobile: false });
    await page.send('Page.navigate', { url: `${server.origin}/src/pages/${built.files[theme]}?theme=${theme}#1` });
    await page.once('Page.loadEventFired', 30000);
    await page.eval('new Promise((r) => { const t = () => window.Deck ? r(window.Deck.ready) : setTimeout(t, 50); t(); })', 30000);
    const all = await page.eval('window.Deck.slides.map((s) => s.dataset.id)');
    const key = (k) => page.eval(`dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)} })), true`);
    for (const id of ids || all) {
      const i = all.indexOf(id); if (i < 0) { console.log(`no slide ${id}`); continue; }
      const problems = [];
      // ── 1 · settle time, arriving from the previous slide as the talk does
      await page.eval(`window.Deck.go(${Math.max(0, i - 1)}, { complete: true }), true`); await sleep(500);
      const t0 = Date.now();
      await page.eval(`window.Deck.go(${i}), true`);
      let settled = null, last = null, still = 0, tail = [];
      while (Date.now() - t0 < 8000) {
        await sleep(100);
        last = await page.eval(PROBE);
        if (last.moving) tail = last.first;
        if (last.started && last.moving === 0) { if (++still >= 2) { settled = (Date.now() - t0 - 100) / 1000; break; } } else still = 0;
      }
      if (last.infinite) problems.push('infinite entry (an endless loop inside the entry: make it an ambient, api.ambient)');
      if (settled === null) { problems.push(`never settles (still moving at 8 s: ${last.first.join(' | ')})`); never++; }
      else if (settled > budget) { problems.push(`settles in ${settled.toFixed(1)} s (budget ${budget} s; last to land: ${tail.join(' | ')})`); slow++; }
      // ── 2 · normal path (A) versus revisit with an early → (B)
      const nb = await page.eval('window.Deck.active.beats.length');
      for (let b = 0; b < nb; b++) { await key('ArrowRight'); await sleep(2600); }
      await sleep(settled === null ? 200 : 600);
      const A = await page.eval(SNAP);
      await page.eval(`window.Deck.go(${Math.max(0, i - 1)}, { complete: true }), true`); await sleep(500);
      await page.eval(`window.Deck.go(${i}), true`); await sleep(early);
      for (let b = 0; b < nb; b++) { await key('ArrowRight'); await sleep(b === nb - 1 ? 0 : early); }
      await sleep(Math.max(3200, (settled ?? 8) * 1000 + 800));
      const B = await page.eval(SNAP);
      const gone = Object.keys(A).filter((k) => A[k].o > 0.5 && (!B[k] || B[k].o < 0.5)).map((k) => `${A[k].tag}${A[k].t ? ` "${A[k].t}"` : ''}`);
      if (gone.length) { problems.push(`lost after an early → on revisit: ${gone.slice(0, 5).join(' | ')}${gone.length > 5 ? ` (+${gone.length - 5})` : ''}`); lost++; }
      while (errs.length) problems.push('page error: ' + errs.shift());
      const line = `[${theme}] ${id.padEnd(30)} ${settled === null ? '  >8 s' : `${settled.toFixed(1).padStart(4)} s`}${nb ? ` · ${nb} beat${nb > 1 ? 's' : ''}` : ''}${problems.length ? '  ✗ ' + problems.join(' · ') : ''}`;
      console.log(line); if (problems.length) report.push(line);
    }
    await chrome.closePage(page);
  }
} finally {
  await chrome.close(); await server.close();
  for (const f of Object.values(built.files)) { try { fs.unlinkSync(path.join(ROOT, 'src/pages', f)); } catch {} }
}
console.log(`\n${report.length ? `${report.length} slide(s) with a problem: ${slow} slow, ${never} never settle, ${lost} lose content` : 'motion clean: every entry settles within budget, nothing is lost to an early → or a revisit'}`);
process.exitCode = report.length ? 1 : 0;
