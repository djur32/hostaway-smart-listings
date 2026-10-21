/* ============================================================================
   ENGINE · the deck as an app, in presentation mode.

   Owns: the scaled stage, the app bar, navigation and beats, the
   transitions between slides (including shared elements that travel from one
   slide to the next), the details (overlays one layer below a slide), the
   thread, the atmosphere, the clock, the command palette, the lightbox, the
   presenter window, print and QA modes.

   Slides are static HTML. The engine never creates content; if this file
   failed to load, every slide would still read in print order.

   PUBLIC API  (window.Deck, and the named exports)
     Deck.define(id, spec)    register a slide's choreography (see CONTRACT.md)
     Deck.atmos(theme, spec)  register a theme's atmosphere layer
     Deck.go(i | id), next(), prev(), current, slides, ready (Promise)
     Deck.openMore(ref), closeMore(), moreState   the detail layer (CONTRACT §16.1)
   ========================================================================= */

import { M, auto, registerEases, revertSplits, restoreText, d as dur, E, still } from './motion.js';
import { wireTouch, mountTouchChrome } from './touch.js';
import { G, stopLoops, clearColorCache, removeCanvases } from './gen.js';
import { mountThread, threadTo, defineThread } from './thread.js';
import { GLYPHS } from './glyphs.js';
import { layoutAllLinks } from './links.js';

const g = () => window.gsap;
const html = document.documentElement;
const qs = new URLSearchParams(location.search);
const MODE = { print: qs.has('print'), presenter: qs.has('presenter'), static: qs.has('static'), qa: qs.has('qa') };

/* ── registries ─────────────────────────────────────────────────────────── */
const specs = new Map();
const atmosSpecs = new Map();
export function define(id, spec) { specs.set(id, spec); }
export function atmos(theme, spec) { atmosSpecs.set(theme, spec); }

/* The tabs: the seven parts of the Hospitable story (deck/DECISIONS.md, D-070, revised 3 Oct).
   Intro (data-stage="0") is the prologue. IA folds into Research as what the research became
   (Antonio, 3 Oct); Test and Measure share one, and Systems & next holds the close.
   data-stage 8 is the appendix, which is not a tab. Set like the product's own tabs:
   sentence case, the active one underlined in raspberry (themes/hospitable.css). */
const STAGES = [
  { n: 0, name: 'Intro' },
  { n: 1, name: 'Discovery' }, { n: 2, name: 'Research' },
  { n: 3, name: 'Concept' },   { n: 4, name: 'Design' },   { n: 5, name: 'Testing' },
  { n: 6, name: 'Next steps' },
];
const stageLabel = (s) => s.name;
const LENS = { did: 'How I did it', hold: 'What I hold', now: 'How it runs with AI' };
const LENS_N = { did: 1, hold: 2, now: 3 };

let stage, deckEl, slides = [], cur = -1, active = null, busy = null, k = 1;
let allSlides = [];        // every slide in the deck; `slides` is the ones this plan keeps
let jumpBack = null;      // the slide a door jumped from, while we stand on its target
let jumpArm = null;       // set by the click that is about to jump, read by go()
let resolveReady; const ready = new Promise((r) => (resolveReady = r));

/* ════════════════════════════════════════════════════════════ BOOT ═════ */
async function boot() {
  registerPlugins();
  html.classList.add('js');
  html.dataset.theme = 'hospitable';                 // one theme (D-071); ?theme= is ignored
  html.dataset.scheme = 'light';
  if (qs.get('motion')) html.dataset.motion = qs.get('motion');
  if (MODE.static) html.dataset.motion = 'off';

  stage = document.querySelector('.stage');
  deckEl = document.querySelector('.deck');
  allSlides = [...document.querySelectorAll('.deck > .s')];
  allSlides.forEach((s) => { if (!s.id && s.dataset.id) s.id = s.dataset.id; });
  slides = allSlides;
  slides.forEach((s, i) => { s.dataset.index = i; });

  applyLogos(document);
  /* Components that build their own marks after this pass (kit/orch.js) say so, and get one. */
  document.addEventListener('deck:needs-logos', (e) => { if (e.target instanceof Element) applyLogos(e.target); });
  applyShots(document, MODE.presenter || MODE.print ? null : -9);   // on stage, go() loads each slide's shots when it is near
  prepareEmbeds(document);
  applyGlyphs(document);
  mountMoreButtons({ buttons: !MODE.print && !MODE.presenter });   // one More button per detail, opposite the headline
  prepareMore(document);                              // the doors to the details: focusable, with their quiet cue
  await prepareBadges();                              // whose story each slide tells (src/data/stories.json)

  if (MODE.presenter) return bootPresenter();
  if (MODE.print) return bootPrint();

  // Hidden slides are not rendered, so their fonts would never be requested and fonts.ready
  // would resolve too early: load all three variable families explicitly (one file each).
  try { await Promise.all(['16px "TT Norms"', '500 16px "TT Norms"', '600 16px "TT Norms"', '16px "Geist Mono"'].map((f) => document.fonts.load(f))); } catch {}
  try { await document.fonts.ready; } catch {}
  /* No personalising (Antonio, 3 Oct: "remove the personalization functionality altogether"):
     every viewer sees the whole deck, and a plan saved by an older build is ignored. */
  buildChrome();
  mountThread(stage);
  mountAtmos();
  mountTouch();
  fit(); addEventListener('resize', fit);
  addEventListener('orientationchange', () => setTimeout(fit, 120));
  // the case name is measured type, so it is fitted again whenever what was measured moves:
  // the stage's scale, and the theme, which swaps the display face (Geist for Inter)
  addEventListener('deck:fit', fitBadgeNames);
  addEventListener('deck:theme', fitBadgeNames);
  wireInput();
  wireChannel();
  addEventListener('hashchange', () => { const i = resolveHash(); if (i !== cur) go(i); });

  const start = resolveHash();
  await go(start, { instant: true });
  const beat = parseInt(qs.get('beat') || '0', 10);
  const bt = qs.has('bt') ? parseFloat(qs.get('bt')) : null;       // freeze beat N at bt seconds (QA)
  for (let b = 0; b < beat; b++) {
    if (bt !== null && b === beat - 1 && active && b < active.beats.length) { playBeat(); active.beats[b].pause(); active.beats[b].seek(bt, false); }
    else playBeat({ instant: true });
  }
  if (qs.has('t')) seekEnter(parseFloat(qs.get('t')));
  if (qs.has('t') || qs.has('bt') || MODE.static) document.querySelector('.veil')?.remove();

  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('is-booting')));
  document.querySelector('.veil')?.classList.add('is-gone');
  resolveReady(true);
}

function registerPlugins() {
  const gs = window.gsap; if (!gs) return;
  const P = ['Flip', 'SplitText', 'DrawSVGPlugin', 'MorphSVGPlugin', 'MotionPathPlugin', 'CustomEase', 'ScrambleTextPlugin'].map((n) => window[n]).filter(Boolean);
  gs.registerPlugin(...P);
  registerEases();
  gs.defaults({ ease: E.out, duration: 0.7 });
}

/* ════════════════════════════════════════════════════════ THE STAGE ═══ */
function fit() {
  /* The box the stage has to fill is .viewport, not the window: on digimal.studio the deck
     runs under the site's header and over its folio, and the viewport is inset to leave room
     for both (the original deck's web bundle; not part of this copy). It is position: fixed, so like the layout viewport it
     does not move under a pinch zoom, which innerWidth does. */
  const de = document.documentElement;
  const box = document.querySelector('.viewport');
  const vw = box?.clientWidth || de.clientWidth || innerWidth;
  const vh = box?.clientHeight || de.clientHeight || innerHeight;
  k = Math.min(vw / 1920, vh / 1080);
  stage.style.setProperty('--k', k);
  window.dispatchEvent(new CustomEvent('deck:fit', { detail: { k } }));
}

/* ── logos: <i class="logo" data-logo="santander"> gets its mark, ratio and
      optical factor. src/assets/logos/logos.json is { name: { ar, k } }; a bare
      number is still read as an aspect ratio with k = 1. `ar` gives the element
      its width, `k` turns the asked-for --logo-h into the height at which this
      particular mark reads the same size as every other one (see the note on
      .logo in kit/components.css and qa/logos/measure.mjs). ───────────────── */
let logoARp = null;
const logoInfo = (m, n) => { const v = m[n]; return typeof v === 'number' ? { ar: v, k: 1 } : v ? { ar: +v.ar || 1, k: +v.k || 1 } : null; };
async function applyLogos(scope) {
  logoARp ||= fetch(`${R}assets/logos/logos.json`).then((r) => r.json()).catch(() => ({}));
  const logoAR = await logoARp;
  scope.querySelectorAll('[data-logo]').forEach((el) => {
    const n = el.dataset.logo;
    el.style.setProperty('--logo', `url("${R}assets/logos/${n}.svg")`);
    const info = logoInfo(logoAR, n);
    if (info) { el.style.setProperty('--ar', info.ar); el.style.setProperty('--logo-k', info.k); }
    if (!el.getAttribute('aria-label') && !el.getAttribute('role')) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', n); }
  });
}

/* ── shots: <img data-shot="co__bar_default" data-pair> → the right file ── */
function shotSrc(el) {
  const base = el.dataset.shot; const pair = el.hasAttribute('data-pair');
  // a pair, or its slide, may pin its own mode; otherwise the deck-wide switch, then the theme
  const scheme = el.dataset.scheme || el.closest('.s')?.dataset.shots || html.dataset.shots || html.dataset.scheme;
  return `${R}assets/shots/${base}${pair ? '-' + scheme : ''}.webp`;
}
function applyShots(scope, around = null) {
  scope.querySelectorAll('img[data-shot], img[data-src]').forEach((img) => {
    const s = img.closest('.s'); const i = s ? +s.dataset.index : 0;
    if (around === null || MODE.print || Math.abs(i - around) <= 2) { const src = img.dataset.shot ? shotSrc(img) : img.dataset.src; if (img.getAttribute('src') !== src) img.src = src; }
    if (!img.alt) img.alt = img.dataset.alt || '';
    img.decoding = 'async';
  });
}

/* ── glyphs: <i class="glyph" data-glyph="plan"> gets its small drawing (kit/glyphs.js) ── */
function applyGlyphs(scope) {
  scope.querySelectorAll('[data-glyph]').forEach((el) => {
    if (el.querySelector('svg')) return;
    const d = GLYPHS[el.dataset.glyph];
    if (!d) { console.warn('[deck] unknown glyph', el.dataset.glyph); return; }
    el.innerHTML = `<svg viewBox="0 0 120 64" aria-hidden="true" focusable="false">${d}</svg>`;
  });
}

/* ════════════════════════════════════════════════════ THE APP CHROME ═══ */
/* One bar, no dock. Left: the digimal.studio mark alone (no wordmark), large, its left edge
   on the content's left edge; a button back to the first slide. Middle: Intro and the six
   stages. Right: the status as plain text. The three hints (Jump, Next, Keys) float at the
   bottom right of the stage, outside the bar and outside the content box: plain text, no
   container. Slides carry their own lens (eyebrow) and source lines. */
/* The way back from a jump. A door that leads to another slide is a detour off the route,
   so while you are standing on the slide it took you to, the brand mark becomes a Back
   control that returns you to the exact slide you clicked from. Moving the talk on in any
   other way puts the mark back: the detour is over. (Antonio, 2026-09-27.) */
const BACK_MARK = `<svg class="brand-mark brand-mark--back" viewBox="0 0 46 46" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M27 12 16 23l11 11"/></svg><span class="appbar__back">Back</span>`;
/* Every asset URL the engine builds is document-relative, and the deck is served from
   two places: src/pages/ here, and one opaque folder inside the site (the original deck's web bundle; not part of this copy),
   where the page and its files do not sit one level apart. A page that lives elsewhere sets
   window.__DECK_ROOT__ before the entry module runs; nothing else changes. */
const R = (typeof window !== 'undefined' && window.__DECK_ROOT__) || '../';

/* Hospitable's mark, from the design system's sprite (ds/channels/hospitable.svg, S02): the "o"
   with its tail. For identification only: the deck is a case study for Hospitable, not Hospitable's
   own (the title and the close say so). */
const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ch-hospitable"/></svg>`;
const BRAND = `${BRAND_MARK}<span class="brand-word">hospitable</span>`;   // what this is moved to the byline (Antonio, 3 Oct)
function buildChrome() {
  const bar = document.createElement('header');
  bar.className = 'appbar';
  bar.innerHTML = `
    <button type="button" class="appbar__brand" data-go-home aria-label="Back to the start" title="Back to the start">${BRAND}</button>
    <nav class="appbar__stages" aria-label="Stages">${STAGES.map((s) => `
      <button type="button" class="stagetab" data-go-stage="${s.n}"><span class="stagetab__bar"><i></i></span><span class="stagetab__l" data-l="${stageLabel(s)}">${stageLabel(s)}</span></button>`).join('')}
    </nav>
    <div class="appbar__meta">
      <button type="button" class="appbar__shots" data-hint="shots" hidden><svg class="appbar__shots-i" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path class="is-moon" d="M13.2 10.1A5.6 5.6 0 0 1 5.9 2.8a5.6 5.6 0 1 0 7.3 7.3Z"/><g class="is-sun"><circle cx="8" cy="8" r="3.1"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/></g></svg></button>
      <span class="live"><i></i><span class="live__t">Presenting</span><span class="appbar__clock num">0:00</span><span class="appbar__folio num"></span></span>
    </div>`;                                           // C swaps "Presenting" for the clock, in the same place
  // the hints float at the bottom right, over the content, in their own element
  const hints = document.createElement('div');
  hints.className = 'hints';
  hints.innerHTML = `<button type="button" class="hint" data-hint="jump"><kbd><span class="hint__cmd">⌘</span>K</kbd>Jump</button><button type="button" class="hint" data-hint="next"><kbd>→</kbd>Next</button>`;
  /* Keys (and Notion, kit/hc.js) open on hover, right above their own hint; ? pins Keys open; any
     click closes both, and a closed pop stays shut until the pointer leaves (Antonio, 4 Oct) */
  const shut = () => hints.querySelectorAll('.hint-wrap').forEach((w) => { w.classList.remove('is-open'); if (w.matches(':hover')) w.classList.add('is-shut'); });
  document.addEventListener('click', shut, true);
  hints.addEventListener('mouseleave', (e) => { const w = e.target.closest?.('.hint-wrap'); w?.classList.remove('is-shut'); }, true);
  hints.querySelectorAll('.hint-wrap').forEach((w) => w.addEventListener('mouseleave', () => w.classList.remove('is-shut')));
  // the byline holds the bottom left corner for the whole talk. On the cover it is set large,
  // as the slide's own; from the second slide on it scales down in place and stays there.
  const who = document.createElement('p');
  who.className = 'byline'; who.innerHTML = '<b class="byline__name">Antonio Silva</b><span class="byline__role">Head of Design <i>·</i> Case Study</span>';
  const badge = document.createElement('aside');
  badge.className = 'casebadge';                     // whose story this is: filled by paintBadge()
  stage.classList.add('is-booting');                 // first chrome state lands without a transition
  const layer = document.createElement('div');
  layer.className = 'more-layer'; layer.hidden = true;
  layer.innerHTML = `<div class="more-layer__scrim"></div><section class="more-sheet" role="dialog" aria-modal="true" aria-labelledby="more-title" tabindex="-1">${SHEET_INNER}</section>`;
  layer.querySelector('.more-sheet__title').id = 'more-title';
  stage.append(bar, hints, who, badge, layer);

  /* The atmosphere belongs to the window, not to the stage. The stage is 1920x1080 and a
     window of another shape leaves a band beside or under it; with the ground inside the
     stage those bands were flat colour against a graded picture, and read as stripes
     (Antonio, 2026-09-27). In .viewport it runs to the edge of the window whatever the
     shape, and the stage sits on it, transparent. */
  const atm = document.createElement('div'); atm.className = 'atmos'; atm.setAttribute('aria-hidden', 'true');
  const vp = stage.parentElement || document.body;
  vp.insertBefore(atm, vp.firstChild);

  // palette, lightbox, keys: outside the stage, at screen size
  document.body.insertAdjacentHTML('beforeend', `
    <div class="palette" hidden role="dialog" aria-label="Jump to a slide">
      <div class="palette__box">
        <input class="palette__q" placeholder="Jump to…  a part, an ID (D-012, I-04), a number" autocomplete="off" spellcheck="false">
        <div class="palette__list"></div>
      </div>
    </div>
    <div class="lightbox" hidden tabindex="-1" role="dialog" aria-label="Screenshot, full view">
      <img alt="">
      <button type="button" class="lightbox__nav lightbox__nav--prev" data-lb-step="-1" aria-label="Previous screenshot" hidden></button>
      <button type="button" class="lightbox__nav lightbox__nav--next" data-lb-step="1" aria-label="Next screenshot" hidden></button>
      <p class="lightbox__n num" aria-live="polite" hidden></p>
      <p class="lightbox__cap"></p>
    </div>
`);
  buildPalette();
}

/* Screens that exist in both modes (data-pair) can be flipped, the way the case studies let you
   flip them, so light and dark can be compared without changing the deck's own theme. One switch
   does all of them: the choice lives on the document, so it holds as you walk between cases
   (Antonio, 27 Sep, who wanted one button rather than one per screen). A slide that sets its own
   data-shots still wins over the switch, because that pinning is deliberate. */
/* a paired screen that pins its own variant (the two halves of a light/dark wipe) is not
   switchable, so it never raises the switch (Antonio, 2026-09-28: "it doesn't work") */
const PAIR_FREE = 'img[data-pair]:not([data-scheme])';
function shotsMode(s) { return s?.dataset.shots || html.dataset.shots || html.dataset.scheme; }
/** The brand mark, or the way back out of a jump. */
function paintBrand() {
  const b = stage?.querySelector('.appbar__brand'); if (!b) return;
  const back = jumpBack != null;
  if (b.classList.contains('is-back') === back) return;
  b.classList.toggle('is-back', back);
  if (back) { b.removeAttribute('data-go-home'); b.setAttribute('data-go-back', ''); }
  else { b.removeAttribute('data-go-back'); b.setAttribute('data-go-home', ''); }
  const label = back ? 'Back to where you clicked' : 'Back to the start';
  b.setAttribute('aria-label', label); b.setAttribute('title', label);
  b.innerHTML = back ? BACK_MARK : BRAND;
}

/* ── touch: a bar at thumb size and the orientation gate, both outside the stage.
      Nothing mounts on a fine pointer, so the presenting laptop is untouched. ── */
let TOUCH = null;
function mountTouch() {
  /* mounted on every device: whether the bar and the orientation gate show is a CSS
     question (kit/responsive.css), not a boot-time one. A window resized into a phone
     shape after boot must still get them. */
  const vp = document.querySelector('.viewport'); if (!vp) return;
  mountTouchChrome(Deck, vp, BRAND_MARK);
  TOUCH = wireTouch(Deck, stage, vp);
  document.addEventListener('click', (e) => {
    const b = e.target instanceof Element && e.target.closest('[data-touch]'); if (!b) return;
    ({ prev, next, jump: openPalette, zoom: () => TOUCH?.toggle() })[b.dataset.touch]?.();
  });
}

/* ── the screens are not there to be taken ───────────────────────────────
   Every product screenshot in here is client work, most of it under NDA. A browser will
   always let a determined person get at a file it has downloaded, so this is a fence and
   not a lock: it turns off the long-press save sheet, the drag-to-desktop and the
   right-click menu on the artwork, which is how an image actually leaves a page by
   accident (Antonio, 2026-09-29: "prevent the images from being copied on web and mobile").
   The lightbox still opens a screenshot full size, because that is the deck's own door. */
const OWN_ART = 'img, .shot, .device, .frame, figure, svg';
for (const ev of ['contextmenu', 'dragstart']) {
  document.addEventListener(ev, (e) => {
    if (e.target instanceof Element && e.target.closest(OWN_ART)) e.preventDefault();
  });
}

/* ── a screen that is not in the assets yet leaves no hole ────────────────
   A shot can be missing while it is being re-exported. Rather than a broken image in
   front of a room, the frame around it takes itself out of the layout until the file
   lands (Antonio, 2026-09-27, about the Adeslas screens). The nearest of these
   wrappers goes; if a shot sits in none of them, only the image itself is hidden. */
const MISSING_SHOT = '.device, .t5-card__thumb, .tb__screens li, .shot, .frame';
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.shot) return;
  const frame = img.closest(MISSING_SHOT) || img;
  // a frame that is one item of a list takes its caption with it, or the caption is orphaned
  const li = frame.parentElement && frame.parentElement.tagName === 'LI' ? frame.parentElement : null;
  (li || frame).style.display = 'none';
}, true);

/* The switch lives in two places: the appbar, and the detail sheet's own chrome. A detail
   is where the mock-ups are largest, and while one is open the appbar is behind it, so the
   screens could not be flipped there (Antonio, 2026-09-28: "add the same icon for light dark
   mode that you have on the website because I want to be able to see it and make the change").
   Both paint from the same state and both call the same toggle. */
function paintShot(btn, host, s) {
  if (!btn) return;
  const has = !!host?.querySelector(PAIR_FREE);
  btn.hidden = !has;
  if (!has) return;
  const dark = shotsMode(s) === 'dark';
  btn.dataset.mode = dark ? 'dark' : 'light';           // the icon says which mode the screens are in
  btn.title = `${dark ? 'Dark' : 'Light'} screens (L)`;
  btn.setAttribute('aria-label', `Screens: ${dark ? 'dark' : 'light'}. Press to switch.`);
}
function paintShotsHint(s) {
  paintShot(stage.querySelector('.appbar__shots'), s, s);
  paintMoreShots();
}
function paintMoreShots() {
  const btn = stage.querySelector('.more-sheet__shots');
  if (!btn) return;
  if (!more?.panel) { btn.hidden = true; return; }
  paintShot(btn, more.panel, slides[cur]);
}
function toggleShots() {
  const s = slides[cur];
  const host = more?.panel?.querySelector(PAIR_FREE) ? more.panel : s;
  if (!s || !host?.querySelector(PAIR_FREE)) return;
  /* One button for every screenshot in the deck, not one per slide: the choice is written on
     the document, so walking to the next case keeps the screens in the mode you left them in.
     A slide that pins its own data-shots still wins, because that pinning is deliberate. */
  html.dataset.shots = shotsMode(s) === 'dark' ? 'light' : 'dark';
  applyShots(document, null);
  paintShotsHint(s);
}

/* The ground the slide stands on: the chrome inverts on aubergine (themes/hospitable.css). A slide
   whose cover is still down stands on the cover's aubergine. */
const groundOf = () => 'white';                     // one ground for the whole talk (3 Oct)
function paintGround(s, instant = false) {
  if (!s || !stage) return;
  const gr = groundOf(s);
  if (stage.dataset.ground === gr) return;
  stage.dataset.ground = gr; html.dataset.ground = gr;
  atmosSlide(s, instant);
}
function paintChrome() {
  const s = slides[cur]; if (!s) return;
  const st = +(s.dataset.stage || 0);
  const chrome = s.dataset.chrome || 'full';
  stage.dataset.chrome = chrome;
  stage.dataset.chromeLate = s.dataset.chromeLate || '';   // the bar leaves only after the slide's own entrance (cl-thanks)
  stage.dataset.cover = s.dataset.cover || '';
  paintGround(s);
  paintShotsHint(s);
  // hidden chrome takes no focus (the hints are their own element now, so they need it too)
  const bar = stage.querySelector('.appbar'); if (bar) bar.inert = chrome === 'none';
  const hintsEl = stage.querySelector('.hints'); if (hintsEl) hintsEl.inert = chrome !== 'full';
  stage.dataset.stage = st;
  stage.dataset.lens = s.dataset.lens || '';
  // story-style segments: each stage fills as its slides pass
  STAGES.forEach(({ n }) => {
    const idx = slides.map((x, i) => (+x.dataset.stage === n ? i : -1)).filter((i) => i >= 0);
    const tab = stage.querySelector(`.stagetab[data-go-stage="${n}"]`); if (!tab) return;
    let p = 0;
    if (idx.length) { if (cur > idx.at(-1)) p = 1; else if (cur >= idx[0]) p = (idx.indexOf(cur) + 1) / idx.length; }
    tab.style.setProperty('--p', p.toFixed(3));
    tab.classList.toggle('is-on', st === n); tab.classList.toggle('is-done', p === 1 && st !== n);
  });
  stage.querySelector('.appbar__folio').textContent = `${String(cur + 1).padStart(2, '0')} / ${slides.length}`;
  document.title = `${s.dataset.title || 'Slide'} · Smart Listings · Head of Design Case Study`;
  document.querySelectorAll('.palette__it').forEach((b) => b.classList.toggle('is-on', +b.dataset.i === cur));
}

/* ═════════════════════════════════════════════════════ THE CASE BADGE ══ */
/* Top right, opposite the title: whose story a slide tells (src/data/stories.json). The mark
   and the case name, nothing else. A slide's case is its data-case (a client) or, for
   Hostaway, the product: data-product="owner-app|copilot|inbox" if the slide sets it, else the
   product named in data-case-name. The box is sized by its content, not to a fixed width.
   One persistent element: it stays still while the case holds, swaps inside its box when the
   case changes, arrives and leaves with it. In print each case slide gets a static copy.
   The stage's lead/second/third role is still read here (the presenter window shows it in
   Antonio's own notes) but is no longer drawn on the wall: see DECISIONS §23 and its note. */
let STORIES = { cases: {}, stages: {} }, LOGO_AR = {};
const ROLE_FALLBACK = { lead: 'Main story', second: 'Second story', third: 'Third story' };
const roleName = (r) => (STORIES.roles || ROLE_FALLBACK)[r] || ROLE_FALLBACK[r] || '';   // presenter window only now
const PRODUCTS = [['owner-app', /owner app/i], ['copilot', /co-?pilot/i], ['inbox', /\binbox\b/i]];
/* One optical size for every badge: the per-mark factor in logos.json does the rest
   (it replaced the equal-area guess and its two hand-written exceptions here). */
const BADGE_LOGO_H = 34;
const BADGE_LOGO_W = 228;        // the badge's widest content: a long wordmark is capped, never clipped
                                 // (= --badge-max in deck.css less the box's own side padding)
async function prepareBadges() {
  try { STORIES = await fetch(`${R}data/stories.json`).then((r) => r.json()); } catch { STORIES = { cases: {}, stages: {} }; }
  try { LOGO_AR = await (logoARp || {}); } catch {}
  slides.forEach((s) => { const c = caseOf(s); if (c) s.dataset.badge = c.keys.join(' '); else delete s.dataset.badge; });
}
function caseOf(s) {
  const c = (s?.dataset.case || '').trim(); if (!c || !STORIES.cases) return null;
  let keys = s.dataset.product ? s.dataset.product.split(/[\s,]+/)
    : c === 'hostaway' ? PRODUCTS.filter(([, re]) => re.test(s.dataset.caseName || '')).map(([p]) => p) : [c];
  keys = keys.filter((p) => STORIES.cases[p]);
  if (!keys.length) return null;
  const st = STORIES.stages?.[s.dataset.stage] || {};
  const list = st.cases || [];
  // a slide naming two products is on the wall, but it is not one of the stage's named stories
  const i = keys.length > 1 ? -1 : list.findIndex((x) => x.key === keys[0]);
  const role = i < 0 ? '' : list[i].role;
  const n = list.length;                                   // how many dots the indicator draws
  // the identity is exactly what the badge draws (the mark and the name), so a case that
  // carries a different role in the next stage does not trigger a swap that changes nothing
  return { keys, role, i, n, logo: STORIES.cases[keys[0]].logo, name: keys.map((p) => STORIES.cases[p].name).join(' · '),
    id: keys.join('+') };
}
function badgeInner(c) {
  const { ar, k } = logoInfo(LOGO_AR, c.logo) || { ar: 4, k: 1 };
  let h = BADGE_LOGO_H; if (h * k * ar > BADGE_LOGO_W) h = BADGE_LOGO_W / (k * ar);
  const el = document.createElement('div'); el.className = 'casebadge__in';
  // data-logo carries the mark's name into CSS: the optical factor is written inline here, so a
  // per-badge correction in deck.css needs the attribute to hang on (and an !important to win)
  el.innerHTML = `<span class="casebadge__mark"><i class="logo casebadge__logo" data-logo="${c.logo}" role="img" aria-label="${c.logo}" style="--logo: url(&quot;${R}assets/logos/${c.logo}.svg&quot;); --ar: ${ar}; --logo-k: ${k}; --logo-h: ${h.toFixed(1)}px"></i></span>`
    + `<span class="casebadge__name">${c.name}</span>`;
  return el;
}
/* The case name used to be fitted to the mark above it, so every badge got a different size:
   "CoPilot AI" landed on the 22px ceiling and "ASISA Vive design system" on the 14px floor.
   Antonio asked for one size across the case studies (27 Sep), so the fit is gone and the size
   is a constant in deck.css. A long name now makes a wider badge rather than smaller type,
   which is the trade he chose. */
function fitBadgeName() {}
const fitBadgeNames = () => stage?.querySelectorAll('.casebadge__in:not(.is-out)').forEach(fitBadgeName);
/* How much measure the head's headline gives up to the badge, and how wide. The badge and
   the head both start at --pad-top, so the badge reaches past the eyebrow row by its own
   height less that row (46px to 50px on every badge slide, both themes; the smaller value is
   the safe one, since a slightly tall spacer only wraps a line that was already beside the
   badge). The box is now sized by its content, so its width is measured here too and written
   to --badge-w for the headline's float: never assume it. Only the headline floats around
   the badge: every line below it keeps the full measure. */
const HEAD_EYEBROW = 46;
let badgePadY = null, badgeW = 0;
function setBadgeCut(slide, box, inn) {
  if (!inn) { slide.style.removeProperty('--badge-cut'); slide.style.removeProperty('--badge-w'); return; }
  if (badgePadY === null) { const s = getComputedStyle(box); badgePadY = (parseFloat(s.paddingTop) || 0) + (parseFloat(s.paddingBottom) || 0); }
  const cut = Math.max(0, Math.round(inn.offsetHeight + badgePadY - HEAD_EYEBROW));
  slide.style.setProperty('--badge-cut', cut + 'px');
  // an inline width means a swap is mid-tween: that width is a frame of the animation, not the
  // layout. Only a clean box is measured; the cached figure is the one the headline wraps to.
  if (!box.style.width) badgeW = Math.round(box.offsetWidth);
  if (badgeW > 0) slide.style.setProperty('--badge-w', badgeW + 'px');
}
let badgeId = null;
/* Called before the slide is activated: the spacer must be in place before SplitText
   measures the headline's lines, or the split would hold the un-wrapped measure. The
   measuring is immediate; `at` holds the MOTION until the wall changes hands, so a new
   story is never named over the slide that is still leaving (go → arrive). A badge that
   only leaves goes with its own content, at 0. */
function paintBadge(slide, instant, at = 0) {
  const box = stage.querySelector('.casebadge'); if (!box) return;
  const c = (slide.dataset.chrome || 'full') === 'none' ? null : caseOf(slide);
  const id = c?.id || null;
  const G = g(), quick = instant || still();
  if (id === badgeId) {                                         // the same story: the badge stays perfectly still
    box.querySelectorAll('.casebadge__in.is-out').forEach((x) => { if (!G.isTweening(x)) x.remove(); });
    setBadgeCut(slide, box, box.querySelector('.casebadge__in:not(.is-out)'));
    return;
  }
  const was = badgeId; badgeId = id;
  box.querySelectorAll('.casebadge__in').forEach((x) => G.killTweensOf(x));
  G.killTweensOf(box); box.style.height = ''; box.style.width = '';   // back to content size before measuring
  box.querySelectorAll('.casebadge__in.is-out').forEach((x) => x.remove());   // a swap cut short
  const old = box.querySelector('.casebadge__in');
  box.setAttribute('aria-label', c ? c.name : '');            // the badge names the case, and only the case
  setBadgeCut(slide, box, null);
  if (!c) {                                                     // no case: it leaves
    if (quick || !old) { old?.remove(); G.set(box, { autoAlpha: 0, y: 0 }); return; }
    G.to(box, { autoAlpha: 0, y: -10, duration: dur(1), ease: E.in, onComplete: () => { old.remove(); G.set(box, { y: 0 }); } });
    return;
  }
  const inn = badgeInner(c);
  if (!old || !was) {                                           // from no badge: it arrives
    old?.remove(); box.append(inn);
    fitBadgeName(inn);
    setBadgeCut(slide, box, inn);
    if (quick) { G.set(box, { autoAlpha: 1, y: 0 }); return; }
    G.fromTo(box, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: dur(2), ease: E.out, delay: at + 0.15 });
    return;
  }
  // another story: like a ticker, the new one pushes the old one up and out of the box. They
  // travel together, a box's height apart, so the two never overlap. The box is sized by its
  // content now, so its width is part of the move: it eases instead of jumping.
  const h0 = box.offsetHeight, w0 = box.offsetWidth;
  old.classList.add('is-out');
  // layout first, written directly (it must hold before the heights are read, whatever GSAP's clock is doing)
  Object.assign(old.style, { position: 'absolute', left: old.offsetLeft + 'px', top: old.offsetTop + 'px', width: old.offsetWidth + 'px' });
  box.append(inn);
  fitBadgeName(inn);
  setBadgeCut(slide, box, inn);
  G.set(box, { autoAlpha: 1, y: 0 });
  if (quick) { old.remove(); return; }
  const h1 = box.offsetHeight, w1 = box.offsetWidth;
  const tl = G.timeline({ delay: at });            // the old story holds while its slide leaves, then both travel
  const T = dur(2) * 0.9, dy = Math.max(h0, h1);
  tl.to(old, { y: -dy, autoAlpha: 0.2, duration: T, ease: E.io, onComplete: () => old.remove() }, 0);
  tl.fromTo(inn, { y: dy, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: T, ease: E.io }, 0);
  if (Math.abs(h1 - h0) > 1) tl.fromTo(box, { height: h0 }, { height: h1, duration: T, ease: E.io, clearProps: 'height' }, 0);
  if (Math.abs(w1 - w0) > 1) tl.fromTo(box, { width: w0 }, { width: w1, duration: T, ease: E.io, clearProps: 'width' }, 0);
}

/* ════════════════════════════════════════════════════════ NAVIGATION ═══ */
function resolveHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return 0;
  if (/^\d+$/.test(h)) return Math.max(0, Math.min(slides.length - 1, +h - 1));
  const i = slides.findIndex((s) => s.dataset.id === h);
  return i < 0 ? 0 : i;
}

function apiFor(slide) {
  const cleanups = [], ambients = [];
  const data = (() => { const j = slide.querySelector('script[type="application/json"]'); try { return j ? JSON.parse(j.textContent) : {}; } catch (e) { console.warn('[deck] bad JSON in', slide.dataset.id, e); return {}; } })();
  return {
    el: slide, data, M, G, E, dur, still,
    q: (sel) => slide.querySelector(sel), qa: (sel) => [...slide.querySelectorAll(sel)],
    tl: (o) => g().timeline(o),
    theme: () => html.dataset.theme,
    lumen: () => html.dataset.theme === 'lumen',
    loop: (fn) => { const stop = G.loop(fn, slide); cleanups.push(stop); return stop; },
    on: (ev, fn) => { const h = (e) => fn(e.detail); window.addEventListener('deck:' + ev, h); cleanups.push(() => window.removeEventListener('deck:' + ev, h)); },
    onLeave: (fn) => cleanups.push(fn),
    /** an ambient loop: fn(api) runs once the entry has finished (never inside it) and
        returns a tween or timeline, usually repeat: -1. It stops when the slide leaves.
        Motion off and print never start it. (CONTRACT §16.6) */
    ambient: (fn) => ambients.push(fn),
    _cleanups: cleanups, _ambients: ambients,
  };
}

/* Every inline style in a slide, as the HTML left it, before anything animates. A slide that
   is left and later revisited must start from exactly this: GSAP's context revert undoes the
   tweens, but not what other code wrote. Flip.fit, for one, registers a cleanup that puts back
   the styles it saw when the beat was BUILT, which is while the entry still holds its elements
   hidden, so on 26 Sep `concept-then-now` came back with its options at visibility: hidden.
   restoreStyles() makes that whole class of bug impossible. (CONTRACT §16.6) */
function snapStyles(slide) { const m = new Map(); slide.querySelectorAll('*').forEach((el) => m.set(el, el.getAttribute('style'))); return m; }
function restoreStyles(m) {
  for (const [el, st] of m) {
    if (!el.isConnected || el.getAttribute('style') === st) continue;
    if (st === null) el.removeAttribute('style'); else el.setAttribute('style', st);
  }
}

/* ── a legend is a filter ───────────────────────────────────────────────────
   "Hovering over one item of the legend dims the opacity of the other ones in the
   chart" (Antonio, 2026-09-27), everywhere there is a legend. A legend opts in with
   data-legend="<selector for its chart's marks>"; each entry carries data-k with the
   class (or the mark's own data-k) it keys. An empty data-k is the residual entry:
   it keys every mark none of the other entries claim, which is how a legend whose
   base mark has no modifier class still works. Pure DOM, so it survives motion off,
   and every listener is undone when the slide leaves. */
/* A figure and the line beside it: one line of label sits on the figure's middle, two or
   more start at its top, because a tall number beside a two-line label reads as a step
   down when it is centred (Antonio, 2026-09-28). CSS cannot count lines, so the label's
   height is measured against its own line box once per slide, and again whenever the
   stage is refitted. */
function fitFigs(root = document) {
  root.querySelectorAll('.els__fig').forEach((fig) => {
    const label = [...fig.children].find((c) => !c.classList.contains('els__n'));
    if (!label) return;
    const lh = parseFloat(getComputedStyle(label).lineHeight) || 0;
    const one = lh > 0 && label.getBoundingClientRect().height <= lh * 1.4;
    fig.dataset.lines = one ? '1' : 'many';
  });
}
addEventListener('deck:fit', () => fitFigs());

function wireLegends(slide, cleanups) {
  slide.querySelectorAll('[data-legend]').forEach((leg) => {
    /* the marks are read on every hover, not once: several charts build their own dots
       in enter(), which runs after this, so a list captured now would be empty. */
    const marksOf = () => [...slide.querySelectorAll(leg.dataset.legend)].filter((m) => !leg.contains(m));
    const items = [...leg.children].filter((el) => el.hasAttribute('data-k'));
    if (!items.length) return;
    const named = items.map((it) => it.dataset.k).filter(Boolean);
    const is = (m, k) => m.classList.contains(k) || m.dataset?.k === k;
    const hit = (m, k) => (k ? is(m, k) : !named.some((o) => is(m, o)));
    const clear = () => { marksOf().forEach((m) => m.classList.remove('is-mute')); items.forEach((o) => o.classList.remove('is-mute')); };
    items.forEach((it) => {
      const k = it.dataset.k;
      const over = () => {
        marksOf().forEach((m) => m.classList.toggle('is-mute', !hit(m, k)));
        items.forEach((o) => o.classList.toggle('is-mute', o !== it));
      };
      for (const [ev, fn] of [['pointerenter', over], ['focusin', over], ['pointerleave', clear], ['focusout', clear]]) {
        it.addEventListener(ev, fn);
        cleanups.push(() => it.removeEventListener(ev, fn));
      }
    });
    leg.classList.add('is-live');
    cleanups.push(clear);
  });
}

/* A part's cover (D-072) is written once per part, as <template class="hc-cover-tpl"> inside any
   of its slides, and lands on whichever slide opens that part in the current plan: Personalise
   can cut a part's first slide, and the cover must not go with it. Never on the close. */
function placeCover(slide, i) {
  slide.querySelectorAll(':scope > .hc-cover[data-injected]').forEach((c) => c.remove());
  if (MODE.print || MODE.presenter || slide.dataset.part === 'close') return;
  const st = slide.dataset.stage;
  if (!st || st === '0' || slides.findIndex((x) => x.dataset.stage === st) !== i) return;
  const tpl = document.querySelector(`template.hc-cover-tpl[data-stage="${st}"]`); if (!tpl) return;
  const c = tpl.content.firstElementChild?.cloneNode(true); if (!c) return;
  c.dataset.injected = ''; slide.prepend(c);
  window.__hcPrepare?.(c);
}
function activate(i) {
  const slide = slides[i]; const id = slide.dataset.id; const spec = specs.get(id);
  placeCover(slide, i);
  const styles = snapStyles(slide);
  const api = apiFor(slide);
  let enter, beats = [];
  layoutAllLinks(slide);                              // connectors are measured before anything moves
  wireLegends(slide, api._cleanups);                  // every legend filters its own chart
  fitFigs(slide);                                     // a one-line label centres on its figure
  const ctx = g().context(() => {
    const a = spec?.auto === false ? { enter: g().timeline({ paused: true }), beats: [], ambient: [] } : auto(slide);
    enter = a.enter; beats = a.beats;
    (a.ambient || []).forEach((fn) => api._ambients.push(() => fn()));
    if (spec?.enter) {
      try { const t = spec.enter(api); if (t) enter.add(t, spec.enterAt ?? 0); } catch (e) { console.error('[deck] enter failed', id, e); }
    }
    let sb = [];
    try { sb = typeof spec?.beats === 'function' ? spec.beats(api) : (spec?.beats || []).map((f) => f(api)); } catch (e) { console.error('[deck] beats failed', id, e); }
    sb.forEach((t, n) => { if (!beats[n]) beats[n] = g().timeline({ paused: true }); if (t) beats[n].add(t, 0); });
    /* A part's first slide may open under a cover (.hc-cover, deck/DECISIONS.md D-072): the part's
       name, its question and its methods on aubergine. The cover is the slide's first beat: → lifts
       it into the top bar, and every beat the slide had moves one press later. Coming back (←),
       motion off and print all land past it, on the slide itself. */
    const cover = slide.querySelector(':scope > .hc-cover');
    if (cover) {
      const lift = g().timeline({ paused: true });
      lift.to(cover, { autoAlpha: 0, y: -12, duration: dur(2), ease: E.io });   // a quick fade into the slide (3 Oct)
      lift.set(cover, { display: 'none' });           // gone, not merely transparent: nothing under it is blocked
      beats.unshift(lift);
    }
    beats.forEach((b) => b.paused(true));
  }, slide);
  delete slide.dataset.beat;                          // a fresh entry starts before its first beat (the cover reads this)
  // ambient loops start when the entry has finished (or → forced it to), inside the slide's
  // context so leaving reverts them; motion off and print never start them
  let ambientOn = false;
  const startAmbient = () => {
    if (ambientOn || still() || MODE.print || MODE.static || !api._ambients.length) return;
    ambientOn = true;
    ctx.add(() => api._ambients.forEach((fn) => {
      try { const t = fn(api); if (t && typeof t === 'object' && 'data' in t) t.data = 'ambient'; } catch (e) { console.error('[deck] ambient failed', id, e); }
    }));
  };
  enter.eventCallback('onComplete', startAmbient);
  return { i, slide, id, spec, api, ctx, enter, beats, beat: 0, styles, startAmbient };
}

function deactivate(a) {
  if (!a) return;
  try { a.spec?.leave?.(a.api); } catch {}
  a.api._cleanups.forEach((f) => { try { f(); } catch {} });
  stopLoops(a.slide);
  removeCanvases(a.slide);
  unloadEmbeds(a.slide);
  revertSplits(a.slide);
  a.ctx.revert();
  restoreText(a.slide);
  a.slide.querySelectorAll('.term__caret').forEach((c) => c.remove());
  restoreStyles(a.styles);                            // back to the HTML's own inline styles, whatever ran
}

/** go to slide i. opts: { instant, complete } */
async function go(i, opts = {}) {
  i = typeof i === 'string' ? slides.findIndex((s) => s.dataset.id === i) : i;
  if (i < 0 || i >= slides.length) return;
  if (more) closeMore({ instant: true });            // a detail never outlives its slide
  moreClosing?.();                                   // nor does one still on its way home
  if (busy) busy.progress(1);
  let from = active; const to = slides[i];
  if (from && from.slide === to) { deactivate(from); active = null; from = null; }   // replay: start clean
  const fromEl = from?.slide;

  applyShots(document, i);
  const armed = jumpArm; jumpArm = null;                  // a door's click, if one led here
  const cameFrom = armed && performance.now() - armed.t < 1200 ? armed.i : null;
  jumpBack = cameFrom != null && cameFrom !== i ? cameFrom : null;
  paintBrand();
  cur = i;
  media(i);
  history.replaceState(null, '', `${location.search}#${to.dataset.id || i + 1}`);

  // shared elements: data-key on both slides travel instead of re-entering
  const keyed = [];
  if (fromEl && !opts.instant && window.Flip) {
    to.querySelectorAll('[data-key]').forEach((el) => {
      const src = fromEl.querySelector(`[data-key="${el.dataset.key}"]`);
      if (src) { el.dataset.flipId = el.dataset.key; src.dataset.flipId = el.dataset.key; keyed.push([src, el]); }
    });
  }
  const flipState = keyed.length ? window.Flip.getState(keyed.map(([s]) => s)) : null;

  /* A crossing has a slide to clear off the wall first; a boot, a jump with the motion off
     and a replay do not, and land at once. */
  const crossing = !!fromEl && !opts.instant && !still();

  to.classList.add('is-entering');                   // laid out BEFORE its timelines measure it (SplitText, Flip), and held unpainted (deck.css)
  paintBadge(to, opts.instant, crossing ? EXIT_T() : 0);   // sets the head's spacer BEFORE its lines are split; its motion waits for the hand-off
  const next = activate(i);
  /* Leaving a full-screen bookend (the cover), the bar and the ground wait until the bookend has gone, so
     the chrome never lands on top of it (Antonio, 4 Oct: "the elements are still superposed"). */
  const chromeLate = crossing && fromEl.dataset.chrome === 'none';
  // Going back into it (to.dataset.chrome none, not a late bookend), the bar goes at once, before the bookend lands.
  const chromeSnap = crossing && to.dataset.chrome === 'none' && !to.dataset.chromeLate;
  if (chromeSnap) { stage.classList.add('is-chrome-snap'); requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('is-chrome-snap'))); }
  if (!chromeLate) paintChrome();
  window.dispatchEvent(new CustomEvent('deck:slide', { detail: { i, id: next.id, slide: to, stage: +(to.dataset.stage || 0) } }));

  const master = g().timeline({ onComplete: () => { busy = null; } });
  busy = master;
  active = next;

  /* ── one slide at a time ──────────────────────────────────────────────────
     The outgoing content leaves first; only when it has gone does the next slide
     take the wall. Both were painted from the first frame until 26 Sep, and the
     entry merely started a little later, so the two were readable on top of each
     other for the whole exit. Going back it was worse: ← arrives with the slide
     already built (complete), so a finished page was printed over the one still
     leaving. The ground (data-mood) still starts with the exit, so the change of
     light leads the change of words instead of trailing it. */
  let hand = 0;                                      // when the wall changes hands
  if (crossing) {
    fromEl.classList.add('is-leaving'); fromEl.classList.remove('is-current');
    // built inside the leaving slide's context, so its revert on deactivate undoes the exit too:
    // a slide you come back to is never left with its content at opacity 0
    let out = null;
    try { from.ctx.add(() => { out = from.spec?.exit ? from.spec.exit(from.api) : defaultExit(fromEl); }); }
    catch (e) { console.error('[deck] exit failed', from.id, e); }         // a broken exit hands over at once: the wall is never left empty
    if (out?.totalDuration()) { master.add(out, 0); hand = Math.min(out.totalDuration(), HAND_MAX); }
    master.call(() => { fromEl.classList.remove('is-leaving'); deactivate(from); }, null, hand);
    if (chromeLate) master.call(paintChrome, null, hand);
  } else if (from) { fromEl.classList.remove('is-current', 'is-leaving'); deactivate(from); }

  /** the hand-off: the wall is free, so this slide is painted and arrives */
  const arrive = () => {
    to.classList.add('is-current'); to.classList.remove('is-entering');
    if (crossing) media(i);                          // a video on the slide starts when the slide lands, not behind the exit
    if (flipState) {                                 // shared elements travel to their new places
      keyed.forEach(([, el]) => g().set(el, { autoAlpha: 1 }));
      if (!still()) window.Flip.from(flipState, { targets: keyed.map(([, el]) => el), duration: dur(3), ease: E.io, scale: true, absolute: true, nested: true });
    }
    if (opts.complete) {                             // ← : the slide comes back as you left it, built, and fades up as one page
      next.enter.progress(1);
      while (next.beat < next.beats.length) playBeat({ instant: true });
      // inside the slide's own context, so leaving again reverts it whenever it lands
      if (crossing) next.ctx.add(() => g().fromTo(to, { opacity: 0 }, { opacity: 1, duration: dur(1) * 1.2, ease: E.out, clearProps: 'opacity' }));
    } else {
      next.enter.play();                             // play(), not play(0): play(0) suppresses callbacks at 0
      if (!next.enter.duration()) next.startAmbient();
    }
    post({ type: 'at', i, beat: next.beat });
  };
  if (crossing && hand > 0) master.call(arrive, null, hand); else arrive();   // nothing to wait for: the slide is on the wall at once

  // the thread and the atmosphere follow the slide
  master.add(threadTo(to.dataset.thread || null), 0);
  atmosSlide(to, opts.instant);

  if (opts.instant || still()) master.progress(1);
  if (still()) next.enter.progress(1);                 // motion off: every state final at once
  post({ type: 'at', i, beat: next.beat });
  return master;
}

/* The wall is never empty for longer than this, whatever a slide's own exit does. */
const HAND_MAX = 0.6;
/* How long a slide takes to leave: three quarters of the kit's shortest duration. It is
   set so that the next slide starts no later than it used to when the two overlapped (the
   entry began at a flat 0.28 s then), in either theme: 0.24 s in studio, 0.28 s in lumen,
   which runs 15% slower. Nothing in the talk got slower to gain the hand-off. */
const EXIT_T = () => dur(1) * 0.75;
/* Quick and decisive: the whole page lifts a little, blurs and goes, together and in one
   short move, so the next slide can take the wall as soon as this one is off it. The old
   staggered exit made the wall wait on its slowest block for no gain: by the time the last
   one had gone the next slide should already have been reading. (go → arrive) */
function defaultExit(el) {
  const kids = [...el.children].filter((c) => !c.classList.contains('notes') && c.tagName !== 'SCRIPT' && !c.dataset.key);
  return g().to(kids, { autoAlpha: 0, duration: EXIT_T(), ease: E.io });          // Hospitable deck: a quick fade, no lift or blur
}

function playBeat({ instant = false } = {}) {
  const a = active; if (!a || a.beat >= a.beats.length) return false;
  if (a.enter.progress() < 1) a.enter.progress(1);
  a.beats.forEach((b, n) => { if (n < a.beat) b.progress(1); });
  const b = a.beats[a.beat++];
  if (instant || still()) b.progress(1); else b.play();          // a fresh beat: play() keeps callbacks at 0
  a.slide.dataset.beat = a.beat;
  paintGround(a.slide, instant || still());
  window.dispatchEvent(new CustomEvent('deck:beat', { detail: { i: cur, beat: a.beat } }));
  post({ type: 'at', i: cur, beat: a.beat });
  return true;
}

/* With a detail open, → and ← page through its panels and never move the deck: past the last
   panel → closes it, before the first ← closes it. The next → then continues the talk. */
function next() { if (more) return moreStep(1); if (!playBeat()) go(cur + 1); }
function skip() { if (more) return closeMore(); go(cur + 1); }
function prev() { if (more) return moreStep(-1); go(cur - 1, { complete: true }); }
function replay() { if (more) return; go(cur, { instant: false }); }
function seekEnter(t) { if (!active) return; active.enter.pause(); active.enter.seek(t, false); busy?.pause(); }

/* ════════════════════════════════════════════════════════ ATMOSPHERE ══ */
let atmosLive = null;
function mountAtmos() {
  const host = document.querySelector('.atmos');
  if (atmosLive) { try { atmosLive.spec.unmount?.(atmosLive.state); } catch {} host.innerHTML = ''; }
  const spec = atmosSpecs.get(html.dataset.theme);
  atmosLive = spec ? { spec, state: spec.mount?.(host, { G, M }) } : null;
}
function atmosSlide(slide, instant) {
  try { atmosLive?.spec.slide?.(atmosLive.state, { slide, stage: +(slide.dataset.stage || 0), mood: slide.dataset.mood || '', instant }); } catch (e) { console.warn('[atmos]', e); }
}

function setTheme(t) {
  html.dataset.theme = t;
  html.dataset.scheme = t === 'lumen' ? 'dark' : 'light';
  clearColorCache(); applyShots(document, cur);
  if (more?.panel) applyShots(more.panel, null);      // an open detail's screens follow the variant too
  mountAtmos(); atmosSlide(slides[cur], true);
  window.dispatchEvent(new CustomEvent('deck:theme', { detail: { theme: t } }));
  const u = new URL(location.href); u.searchParams.set('theme', t); history.replaceState(null, '', u);
}

/* ══════════════════════════════════════════════ EMBEDS AND VIDEOS ══ */
/* Figma: <figure class="embed" data-embed="key"> with a poster image inside
   .embed__frame. The key's link lives in src/data/embeds.json; an empty link
   leaves the poster alone. "Open live" swaps in the real Figma embed; leaving
   the slide unloads it. Videos: <video data-video="sa__v_onboard"> loads when
   its slide is near, plays while it is current, pauses when it leaves. */
let embedsP = null;
const embeds = () => (embedsP ||= fetch(`${R}data/embeds.json`).then((r) => r.json()).catch(() => ({})));
const figmaSrc = (url) => `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
async function prepareEmbeds(scope) {
  const reg = await embeds();
  scope.querySelectorAll('[data-embed]').forEach((fig) => {
    const e = reg[fig.dataset.embed] || {};
    fig.classList.toggle('has-link', !!e.url);
    if (e.url && !fig.querySelector('.embed__bar')) {
      fig.insertAdjacentHTML('beforeend', `<div class="embed__bar"><button class="embed__go" type="button"><i></i>Open live</button><a class="embed__out" href="${e.url}" target="_blank" rel="noopener">Figma ↗</a><span class="embed__hint">Click outside the frame to return to the slides</span></div>`);
    }
    if (e.title && !fig.dataset.title) fig.dataset.title = e.title;
  });
}
async function goLive(fig) {
  const reg = await embeds(); const e = reg[fig.dataset.embed]; if (!e?.url || fig.classList.contains('is-live')) return;
  const frame = fig.querySelector('.embed__frame') || fig;
  const ifr = document.createElement('iframe');
  ifr.className = 'embed__iframe'; ifr.src = figmaSrc(e.url); ifr.title = e.title || 'Figma';
  ifr.allow = 'fullscreen; clipboard-write'; ifr.setAttribute('allowfullscreen', ''); ifr.loading = 'eager';
  frame.appendChild(ifr); fig.classList.add('is-live');
}
function unloadEmbeds(slide) {
  slide.querySelectorAll('.embed.is-live').forEach((fig) => { fig.querySelector('.embed__iframe')?.remove(); fig.classList.remove('is-live'); });
}
function media(i) {
  document.querySelectorAll('video[data-video]').forEach((v) => {
    const s = v.closest('.s'); const j = s ? +s.dataset.index : -1;
    if ((Math.abs(j - i) <= 1 || MODE.print) && !v.getAttribute('src')) { v.src = `${R}assets/video/${v.dataset.video}.mp4`; v.preload = 'auto'; }
    v.muted = true; v.playsInline = true;
    if (j === i && !still()) { try { v.currentTime = 0; } catch {} v.play().catch(() => {}); }
    else { v.pause(); if (still() && v.dataset.still) { try { v.currentTime = +v.dataset.still; } catch {} } }
  });
  const s = slides[i]; if (s?.querySelector('[data-embed][data-embed-autoload]')) s.querySelectorAll('[data-embed][data-embed-autoload]').forEach(goLive);
}

/* ═══════════════════════════════════════════════ DETAILS (a layer deeper) ══
   "Make things clickable on demand to show more information; if you enter the
   more-info screen, allow to close it; it should not be at the presentation level,
   it's like a layer deeper; but don't go crazy." (Antonio, 2026-09-26)

   A slide holds its details as templates, one or two panels each:
     <template class="more" data-more="ID" data-title="Short title">
       <div class="more__panel" data-title="Panel name">…</div>
       <div class="more__panel" data-title="Panel name">…</div>
     </template>
   and any element of the slide with data-more="ID" is a door to it (click or Enter).
   data-more="slide-id/ID" opens a detail that another slide holds.

   It never changes the slide number, the folio or the hash; → and ← page its panels, and
   → past the last one (or Esc, M, the Close button, a click outside it) closes it. One layer
   only: nothing inside a detail opens another. Focus is held inside the card and goes back
   to the door. Print: every panel prints after its slide as a page of its own (bootPrint).

   The door and the card (Antonio, 3 Oct): "I don't like how pop-ups work anywhere. I'd like
   them to be available from the top right of the content area, opposite the headline. When
   you click on it, dispel all of the content away from the slide, like a boomerang: you throw
   it and everything moves away to the sides, on a tangent; and when you close it, it comes
   back." So the kit puts one More button per detail on the headline's row, at the content's
   right edge (mountMoreButtons; the footer's old .more-link words stay in the DOM, hidden).
   Opening throws the slide's content out to both sides on curved paths (fling), and the
   detail rises in as a card with the cover plate's geometry (hc.css .hc-cover__plate):
   its title where the headline was, Close where More was. Closing plays the same throw
   backwards, so everything comes home along the curve it left on. Reduced motion: a swap. */
const MORE_SEL = '[data-more]:not(template)';
const ICON_PLUS = '<svg class="more-btn__i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const ICON_X = '<svg class="more-sheet__x" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const SHEET_INNER = `
  <header class="more-sheet__head">
    <p class="more-sheet__k"><span class="more-sheet__tag">More</span><span class="more-sheet__from"></span></p>
    <h2 class="more-sheet__title"></h2>
    <div class="more-sheet__ctl"><nav class="more-sheet__pager" aria-label="Panels"></nav><button type="button" class="appbar__shots more-sheet__shots" data-hint="shots" hidden><svg class="appbar__shots-i" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path class="is-moon" d="M13.2 10.1A5.6 5.6 0 0 1 5.9 2.8a5.6 5.6 0 1 0 7.3 7.3Z"/><g class="is-sun"><circle cx="8" cy="8" r="3.1"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/></g></svg></button><span class="more-sheet__n num"></span></div>
  </header>
  <button type="button" class="more-sheet__close" data-more-close aria-label="Close (Esc)">${ICON_X}</button>
  <div class="more-sheet__body"></div>`;
let more = null;                                     // { slide, id, title, panels, i, panel, ctx, opener, key, fling }
let moreTl = null, moreClosing = null;               // moreClosing: finishes a close that is still fading

/** the panels of a detail, as template nodes (never live: each showing clones them) */
function morePanels(tpl) {
  const kids = [...tpl.content.children];
  const panels = kids.filter((c) => c.classList.contains('more__panel'));
  if (panels.length) return panels.map(liftLegend);
  const d = document.createElement('div'); d.className = 'more__panel';       // no panel markup: one panel
  kids.forEach((k) => d.append(k.cloneNode(true)));
  return [liftLegend(d)];
}
/* A detail's legend (Antonio, 4 Oct: "legends in details… bottom left, exactly the same text size as the
   source line"). Every chart caption, flow source and source line a panel holds becomes ONE line, the
   slide foot's .hc-src exactly (15 px, chips first, then the words), a direct child of the panel, which
   deck.css pins to the card's bottom left. Done once per template panel; idempotent. */
const LEGEND = '.hc-src, .hc-chart__cap, .hc-flow__src, p[class$="-src"], [data-legend]';
function liftLegend(panel) {
  if (panel.dataset.lifted) return panel;
  panel.dataset.lifted = '1';
  const found = [...panel.querySelectorAll(LEGEND)].filter((el) => !el.parentElement.closest(LEGEND) && !el.closest('.h-root, .hc-ui'));
  if (!found.length) return panel;
  const line = document.createElement('p'); line.className = 'hc-src';
  const tail = [];
  const keep = found.find((el) => el.parentElement === panel && el.classList.contains('hc-src'));
  if (keep) for (const a of keep.attributes) if (a.name.startsWith('data-a') || a.name === 'data-at' || a.name === 'data-beat') line.setAttribute(a.name, a.value);
  for (const el of found) {
    const chips = [...el.querySelectorAll('.hc-prov')];
    chips.forEach((c) => c.classList.remove('hc-prov--sm'));
    if (el.matches('.hc-src, p[class$="-src"]') && el.querySelector(':scope > span')) {
      // already a source line: chip, words, chip, words. Keep its order
      [...el.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.textContent.trim()) return; line.append(n.nodeType === 3 ? Object.assign(document.createElement('span'), { textContent: n.textContent.trim() }) : n); });
    } else {
      // a caption: its chips lead, then its words, as one span
      chips.forEach((c) => c.remove());
      const words = el.textContent.replace(/\s+/g, ' ').trim();
      chips.forEach((c) => line.append(c));
      const w = words && Object.assign(document.createElement('span'), { textContent: words });
      if (w) (chips.length ? line.append(w) : tail.push(w));     // a caption with no chip of its own follows the chipped words
    }
    el.remove();
  }
  tail.forEach((w) => line.append(w));
  panel.append(line);
  return panel;
}
/** "ID" → the template in `from`'s slide; "slide-id/ID" → the one another slide holds */
function findMore(ref, from) {
  let slide = from, id = ref || '';
  const k = id.indexOf('/');
  if (k > 0) { slide = slides.find((x) => x.dataset.id === id.slice(0, k)); id = id.slice(k + 1); }
  return slide?.querySelector(`template.more[data-more="${CSS.escape(id)}"]`) || null;
}
/** every door gets focus, a role, and the kit's one quiet cue (unless it brought its own) */
function prepareMore(scope) {
  scope.querySelectorAll(MORE_SEL).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;       // an SVG shape can be a door, but carries no cue
    if (!el.matches('button, a[href], input, select, textarea')) {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      if (!el.getAttribute('role')) el.setAttribute('role', 'button');
    }
    el.setAttribute('aria-haspopup', 'dialog');
    el.classList.add('has-more');
    if (el.dataset.cue === 'none') return;
    let cue = el.querySelector('.more-cue');       // a slot the author placed (it flows), or the kit's own (a corner)
    if (!cue) { cue = document.createElement('span'); cue.className = 'more-cue more-cue--auto'; el.append(cue); }
    if (el.dataset.cue === 'inline') cue.classList.add('more-cue--inline');
    if (!cue.firstChild) cue.innerHTML = '<i></i><span class="more-cue__t">More</span>';
    cue.setAttribute('aria-hidden', 'true');
  });
}
const moreLayer = () => stage.querySelector('.more-layer');
const moreSheet = () => stage.querySelector('.more-sheet');

/* ── the door: one More button per detail, opposite the headline ──────────────
   Built once at boot, before prepareMore, so each button is an ordinary door (data-more,
   focus, Enter). The label is the template's data-label, else "More"; a slide with two
   details names each button after its footer words, so the two can be told apart. The
   button lives in the slide, so it enters, leaves and is thrown with the slide; under a
   part's cover it is simply covered (the cover sits above it). */
function mountMoreButtons({ buttons = true } = {}) {
  for (const s of slides) {
    const tpls = [...s.querySelectorAll('template.more')].filter((t) => t.closest('.s') === s && t.dataset.more);
    if (!tpls.length || s.querySelector(':scope > .more-btns')) continue;
    // the old door in words now lives in the button: kept in the DOM for anything that still
    // looks it up, never shown (components.css hides it, and an emptied source line with it;
    // on paper too, where the detail's own pages follow the slide)
    s.querySelectorAll('.more-link').forEach((l) => { if (tpls.some((t) => t.dataset.more === l.dataset.more)) l.classList.add('is-kit-door'); });
    if (!buttons) continue;
    const box = document.createElement('div');
    box.className = 'more-btns'; box.dataset.n = tpls.length;
    for (const t of tpls) {
      const id = t.dataset.more;
      const words = [...s.querySelectorAll('.more-link')].find((l) => l.dataset.more === id)?.textContent.trim();
      const label = t.dataset.label || (tpls.length > 1 && words) || 'More';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'more-btn'; b.dataset.more = id; b.dataset.cue = 'none';
      // no title: a native tooltip lands on the content (Antonio, 3 Oct); the name says where it goes
      b.setAttribute('aria-label', `${label}: ${t.dataset.title || 'detail'}`);
      b.innerHTML = `${ICON_PLUS}<span class="more-btn__t"></span>`;
      b.querySelector('.more-btn__t').textContent = label;
      box.append(b);
    }
    s.append(box);
  }
}
/** Sit the buttons on the headline's first line, at the content's right edge. offsetTop, not
    the bounding box, so an entry that is still rising the headline does not move the button. */
function placeMoreButtons(s) {
  const box = s?.querySelector(':scope > .more-btns'); if (!box) return;
  const h = s.querySelector(':scope > .s-head > :is(h1, h2, h3)') || s.querySelector(':scope > .s-head');
  if (!h) return;
  let top = 0, el = h;
  while (el && el !== s) { top += el.offsetTop; el = el.offsetParent; }
  if (el !== s) return;                              // not laid out yet (or not inside a positioned slide)
  const lh = parseFloat(getComputedStyle(h).lineHeight) || h.offsetHeight;
  const bh = box.offsetHeight || 48;
  box.style.top = `${Math.round(top + (Math.min(lh, h.offsetHeight || lh) - bh) / 2)}px`;
}
// placed when the slide is laid out for its entry (and again once the webfonts are in)
window.addEventListener('deck:slide', (e) => placeMoreButtons(e.detail?.slide));
document.fonts?.ready.then(() => placeMoreButtons(slides[cur]));
/** M: the current slide's More (its first, if it has two), unless the part's cover is still down */
function openSlideMore() {
  const s = slides[cur]; if (!s) return;
  const cover = s.querySelector(':scope > .hc-cover');
  if (cover && getComputedStyle(cover).display !== 'none' && getComputedStyle(cover).visibility !== 'hidden') return;
  const b = s.querySelector(':scope > .more-btns .more-btn'); if (b) openMore(b);
}

/* ── the boomerang ────────────────────────────────────────────────────────────
   The slide's content is cut into pieces, at most FLING_MAX (the head's lines, the body's
   blocks and, where a block is a plain row or grid that paints nothing of its own, its items;
   the foot's parts), largest blocks split first, and each piece is
   thrown out of the nearer side of the canvas on a curve: across fast and late (ease in), up
   or down a little and early, with a slight turn the way it is going. Top to bottom, a few
   hundredths apart. The pieces move on the individual translate/rotate properties, driven by
   registered custom properties (deck.css @property --fx --fy --fr), so they never touch the
   transforms the slide's own entry, beats and modules animate. The stage clips them; once
   past the edge a piece is also hidden, so nothing half-thrown is left in view. Closing
   reverses the very same timeline. */
const FLING_NOT = 'template, script, style, link, .notes, .hc-cover, .more-layer';
const FLING_SOLID = 'svg, img, video, canvas, iframe, table, p, h1, h2, h3, h4, h5, h6, li, a, button, label, figure:has(> :is(img, picture, svg, video, canvas)), .h-root, .hc-ui, .hc-scr, .hc-device, .hc-phone, .shot, .device, .frame, .embed, .hc-live';
const FLING_MAX = 28;
/* the throw can be switched off, leaving the content to dim under the scrim. Both were tried on
   3 Oct: without the throw the slide shows through the card while it fades up (text over text),
   so the throw stays, and the thrown content flies OVER the scrim and the rising card (the deck
   is lifted above the layer while it is thrown), so nothing is ever seen through the card. */
const MORE_THROW = true;
function flingPieces(slide) {
  const sr = stage.getBoundingClientRect();
  const k = sr.width / (stage.offsetWidth || 1920) || 1;
  const W = stage.offsetWidth || 1920;
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { l: (r.left - sr.left) / k, r: (r.right - sr.left) / k, t: (r.top - sr.top) / k, b: (r.bottom - sr.top) / k, w: r.width / k, h: r.height / k };
  };
  const shown = (el) => {
    if (!(el instanceof Element) || el.matches(FLING_NOT)) return false;
    if (getComputedStyle(el).display === 'none') return false;
    const r = rectOf(el); return r.w > 1 && r.h > 1;
  };
  const kids = (el) => [...el.children].filter(shown);
  // a block that paints something of its own (a fill, a border, a shadow, a drawn ::before) stays
  // whole: split into its items, its own paint would be left standing on the slide
  const clear = (c) => !c || c === 'transparent' || /^rgba\(.*,\s*0\)$/.test(c);
  const paints = (el) => {
    const cs = getComputedStyle(el);
    if (!clear(cs.backgroundColor) || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none') return true;
    if (['Top', 'Right', 'Bottom', 'Left'].some((side) => cs[`border${side}Style`] !== 'none' && parseFloat(cs[`border${side}Width`]) > 0)) return true;
    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) return true;
    return ['::before', '::after'].some((pe) => { const c = getComputedStyle(el, pe).content; return c && c !== 'none' && c !== 'normal'; });
  };
  // a block may be split into its items only when nothing in it would be torn: it does not clip,
  // its items are blocks (not words in a line), none of them already rides on translate/rotate,
  // and it is a wrapper, a repeating set (a row of cards, a list, a grid of like cells) or a wide
  // row of a few columns. A card made of unlike parts (a tile, a title, a line) stays one piece.
  const sig = (c) => `${c.tagName}.${c.classList[0] || ''}`;
  const splittable = (el) => {
    if (!(el instanceof HTMLElement) || el.matches(FLING_SOLID) || paints(el)) return false;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || cs.clipPath !== 'none' || /paint|strict|content/.test(cs.contain)) return false;
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
    const ks = kids(el);
    if (!ks.length || ks.length > 24) return false;
    const loose = ks.every((c) => {
      const s = getComputedStyle(c);
      return s.display !== 'inline' && s.translate === 'none' && s.rotate === 'none' && s.scale === 'none';
    });
    if (!loose) return false;
    const repeating = ks.length > 1 && new Set(ks.map(sig)).size <= Math.floor(ks.length / 2);
    const wideRow = rectOf(el).w > W * 0.45 && ks.length <= 4;
    return ks.length === 1 || repeating || wideRow;
  };
  let list = [];
  for (const c of slide.children) {
    if (!shown(c)) continue;
    if (c.matches('.s-head, .s-foot') && !paints(c)) list.push(...kids(c));   // the head's lines and the foot's parts go their own ways
    else list.push(c);
  }
  // split the largest blocks first, until the slide is a dozen or so pieces
  for (let guard = 0; guard < 24; guard++) {
    const area = (el) => { const r = rectOf(el); return r.w * r.h; };
    const cand = list.filter(splittable).sort((a, b) => area(b) - area(a))[0];
    if (!cand) break;
    const ks = kids(cand);
    if (list.length - 1 + ks.length > FLING_MAX) break;
    list.splice(list.indexOf(cand), 1, ...ks);
  }
  const mid = W / 2, cy = (slide.offsetHeight || 1080) / 2;
  const out = list.map((el) => {
    const r = rectOf(el);
    const dir = (r.l + r.r) / 2 < mid ? -1 : 1;
    // how far, in the piece's own units (a scene that zooms itself to fit scales its children)
    const local = el instanceof HTMLElement && el.offsetWidth ? r.w / el.offsetWidth : 1;
    const need = dir < 0 ? r.r + 160 : W - r.l + 160;
    const yc = (r.t + r.b) / 2;
    const dy = Math.max(-60, Math.min(60, (yc - cy) * 0.14)) - 22;   // a small arc: up a little, spread from the middle
    return { el, dir, need, dy, local: local || 1, top: r.t };
  });
  // each side travels as one: every piece on it goes as far as the innermost one needs, so a
  // row parts like a pair of curtains and no piece overtakes its neighbour on the way out
  const far = { [-1]: 0, [1]: 0 };
  out.forEach((p) => { far[p.dir] = Math.max(far[p.dir], p.need); });
  return out.map((p) => ({ el: p.el, dir: p.dir, dx: (p.dir * far[p.dir]) / p.local, dy: p.dy / p.local, top: p.top }));
}
function fling(slide) {
  const G = g(), D = dur(2), SPREAD = dur(1) * 0.7;
  const pieces = flingPieces(slide).sort((a, b) => a.top - b.top);
  const tl = G.timeline({ paused: true });
  const n = pieces.length;
  pieces.forEach((p, j) => {
    const at = n > 1 ? (j / (n - 1)) * SPREAD : 0;
    const turn = p.dir * (3 + (j % 3) * 1.6);
    p.el.classList.add('is-flung');
    tl.fromTo(p.el, { '--fx': '0px' }, { '--fx': `${p.dx.toFixed(1)}px`, duration: D, ease: 'power2.in' }, at)
      .fromTo(p.el, { '--fy': '0px' }, { '--fy': `${p.dy.toFixed(1)}px`, duration: D, ease: 'sine.out' }, at)
      .fromTo(p.el, { '--fr': '0deg' }, { '--fr': `${turn.toFixed(2)}deg`, duration: D, ease: 'power1.in' }, at);
  });
  // off the canvas: hidden too, so nothing that overhangs its box (a callout, a shadow) lingers
  tl.call(() => pieces.forEach((p) => p.el.classList.toggle('is-flung-off', !tl.reversed())), null, D + SPREAD);
  const clear = () => {
    tl.kill();
    pieces.forEach(({ el }) => {
      el.classList.remove('is-flung', 'is-flung-off');
      ['--fx', '--fy', '--fr'].forEach((v) => el.style.removeProperty(v));
    });
  };
  // back on the canvas (about to come home): visible again, so the door can take focus at once
  const unhide = () => pieces.forEach(({ el }) => el.classList.remove('is-flung-off'));
  return { tl, clear, unhide, slide };
}

/** fill a detail panel: logos, shots, glyphs, connectors, videos, then its own declarative
    motion. → belongs to the panels, so a panel never waits for a press: its data-beat groups
    play by themselves, one rung after another (Antonio, 3 Oct: "content that reveals should
    come in on its own as a timed ladder"), and a panel with no data-a of its own has its
    blocks staggered in. Motion off and print land everything at once. */
function mountPanel(p, { still: quiet = false, print = false } = {}) {
  window.__hcPrepare?.(p);                           // the Hospitable components (kit/hc.js): charts, chips, frames
  applyLogos(p); applyShots(p, null); applyGlyphs(p); prepareEmbeds(p);
  p.querySelectorAll('video[data-video]').forEach((v) => { v.src = `${R}assets/video/${v.dataset.video}.mp4`; v.muted = true; v.playsInline = true; if (!quiet && !print) v.play().catch(() => {}); });
  layoutAllLinks(p);
  const a = auto(p);
  if (quiet || print) { a.beats.forEach((b) => b.progress(1)); a.enter.progress(1); return a.enter; }
  if (!p.querySelector('[data-a]')) {                // nothing authored: the panel's blocks come in one after another
    let blocks = [...p.children].filter((c) => !c.matches('.notes, script, style, template'));
    if (blocks.length === 1 && blocks[0].children.length > 1 && blocks[0].children.length <= 8) blocks = [...blocks[0].children];
    if (blocks.length) a.enter.add(g().from(blocks, { autoAlpha: 0, y: 16, duration: dur(2), ease: E.out, stagger: dur(1) * 0.45 }), 0);
  }
  let t = Math.max(a.enter.duration(), dur(1));
  a.beats.forEach((b) => { a.enter.add(b.paused(false), t); t += Math.max(b.duration(), dur(1)) + dur(2); });   // a rung, then a breath
  return a.enter;                                    // paused: the caller places it in its own timeline
}
function unmountPanel(p, ctx) {
  if (!p) return;
  p.querySelectorAll('video').forEach((v) => v.pause());
  revertSplits(p); try { ctx?.revert(); } catch {} restoreText(p);
  p.remove();
}
/** the panels as tabs: the product's segmented control, in the card's head beside Close */
function paintPager(sheet, panels, on = 0) {
  const nav = sheet.querySelector('.more-sheet__pager');
  nav.replaceChildren(...(panels.length > 1 ? panels.map((pt, k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'more-sheet__seg'; b.dataset.moreGo = k;
    b.textContent = pt.dataset.title || `Part ${k + 1}`;
    b.classList.toggle('is-on', k === on); b.setAttribute('aria-current', k === on ? 'step' : 'false');
    return b;
  }) : []));
  nav.hidden = panels.length < 2;
}
function paintMoreChrome() {
  const sheet = moreSheet(), n = more.panels.length, i = more.i;
  sheet.querySelector('.more-sheet__n').textContent = n > 1 ? `${i + 1} / ${n}` : '';
  sheet.querySelectorAll('.more-sheet__seg').forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-done', k < i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
  const pn = more.panels[i];
  post({ type: 'more', open: true, title: more.title, i, n, name: pn.dataset.title || '', notes: pn.querySelector('.notes')?.innerHTML || '' });
  paintMoreShots();
}
/* the card's timing: it rises beneath the content as the throw begins (the layer sits under the
   slide while a detail is open, so the content flies over it and nothing shows through a card
   that is still fading in) */
const CARD_AT = () => dur(1) * 0.5;
const CARD_D = () => dur(3) * 0.9;
function showPanel(i, { dir = 1, first = false } = {}) {
  if (!more || i < 0 || i >= more.panels.length) return;
  const G = g(), quiet = still();
  const body = moreSheet().querySelector('.more-sheet__body');
  const old = more.panel, oldCtx = more.ctx;
  moreTl?.progress(1);
  const tl = G.timeline(); moreTl = tl;
  if (old) {
    if (quiet) unmountPanel(old, oldCtx);
    else tl.to(old, { autoAlpha: 0, x: -20 * dir, duration: dur(1) * 0.55, ease: E.in, onComplete: () => unmountPanel(old, oldCtx) }, 0);
  }
  const p = more.panels[i].cloneNode(true);
  body.append(p);
  more.i = i; more.panel = p;
  more.ctx = G.context(() => {
    const at = old && !quiet ? dur(1) * 0.4 : first ? dur(2) + dur(1) * 0.5 : 0;
    G.set(p, { autoAlpha: 0 });
    const inner = mountPanel(p, { still: quiet });
    tl.fromTo(p, { autoAlpha: 0, x: first ? 0 : 20 * dir, y: first ? 14 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: dur(2) * 0.8, ease: E.out }, at);
    if (!quiet) tl.add(inner.paused(false), at);
    window.dispatchEvent(new CustomEvent('deck:more', { detail: { open: true, id: more.id, slide: more.slide, panel: p, index: i, count: more.panels.length } }));
  }, p);
  if (quiet) tl.progress(1);
  paintMoreChrome();
}
function moreStep(d) {
  if (!more) return;
  const j = more.i + d;
  if (j < 0 || j >= more.panels.length) closeMore(); else showPanel(j, { dir: d });
}
function openMore(opener, { key = false } = {}) {
  if (more || !opener) return false;
  if (opener.closest('.more-layer')) return false;                  // one layer only
  moreClosing?.();                                                  // a detail still closing lands first
  const from = opener.closest('.s') || slides[cur];
  const tpl = findMore(opener.dataset.more, from);
  if (!tpl) { console.warn('[deck] no detail', opener.dataset.more); return false; }
  const layer = moreLayer(), sheet = moreSheet(), G = g(), s = slides[cur];
  closePalette(); closeLightbox();
  const panels = morePanels(tpl);
  more = { slide: s, id: tpl.dataset.more, title: tpl.dataset.title || '', panels, i: -1, panel: null, ctx: null, opener, key, fling: null };
  sheet.querySelector('.more-sheet__title').textContent = more.title;
  sheet.querySelector('.more-sheet__from').textContent = s.dataset.title || '';
  sheet.dataset.panels = panels.length;
  paintPager(sheet, panels, 0);
  layer.hidden = false; stage.classList.add('is-more', 'is-dim');
  opener.setAttribute('aria-expanded', 'true');
  moreTl?.kill();
  const scrim = layer.querySelector('.more-layer__scrim');
  // the boomerang: the slide's content is thrown to the sides, then the card rises into the room
  // it left. Opacity, not autoAlpha, on the card: it must stay focusable from its first frame.
  const fl = MORE_THROW ? fling(s) : null; more.fling = fl;
  stage.classList.toggle('is-more-throw', !!fl);     // the thrown content flies over the card (deck.css)
  const head = sheet.querySelector('.more-sheet__head');
  G.killTweensOf([sheet, head, scrim]);
  if (still()) { fl?.tl.progress(1); G.set(scrim, { opacity: 1 }); G.set(sheet, { opacity: 1, y: 0, scale: 1 }); G.set(head, { opacity: 1 }); }
  else {
    fl?.tl.play(0);
    // the room dims (Antonio, 3 Oct: "a pop-up with a fade-in colour change for the background"),
    // and the card pops up on it: opaque within a beat, then settling from a little smaller
    G.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: dur(2) * 0.75, ease: E.io });
    G.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: dur(1) * 0.8, ease: E.out, delay: CARD_AT() });
    G.fromTo(sheet, { y: 26, scale: 0.955 }, { y: 0, scale: 1, duration: CARD_D(), ease: E.out, delay: CARD_AT() });
    // the card's words wait until the slide's head has flown past them: never text over text
    G.fromTo(head, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur(2) * 0.8, ease: E.out, delay: dur(2) + dur(1) * 0.15 });
  }
  sheet.focus({ preventScroll: true });
  showPanel(0, { first: true });
  return true;
}
function closeMore({ instant = false } = {}) {
  if (!more) return;
  const m = more; more = null;
  stage.classList.remove('is-dim');                  // the window's bands undim with the scrim (deck.css)
  const layer = moreLayer(), sheet = moreSheet(), G = g(), fl = m.fling, scrim = layer.querySelector('.more-layer__scrim');
  moreTl?.progress(1); moreTl = null;
  // closed now, whatever the animation does: the presenter window, the modules and the keys all
  // know at once; only the card's exit and the content's return are deferred (and a timer
  // finishes them if frames are paused, as they are in a hidden window)
  window.dispatchEvent(new CustomEvent('deck:more', { detail: { open: false, id: m.id, slide: m.slide } }));
  post({ type: 'more', open: false });
  let cardGone = false, home = false;
  const head = sheet.querySelector('.more-sheet__head'), body = sheet.querySelector('.more-sheet__body');
  const cardOut = () => {                            // the card is off the wall: the layer stops catching clicks
    if (cardGone) return; cardGone = true;
    G.killTweensOf([sheet, head, body, scrim]);
    unmountPanel(m.panel, m.ctx);
    if (!more) { layer.hidden = true; stage.classList.remove('is-more'); G.set([sheet, head, body, scrim], { clearProps: 'opacity,visibility,transform' }); }
  };
  const done = () => {                               // and the content is home
    if (home) return; home = true; if (moreClosing === done) moreClosing = null;
    cardOut(); fl?.clear();
    if (!more) stage.classList.remove('is-more-throw');
  };
  m.opener.setAttribute('aria-expanded', 'false');
  fl?.unhide();
  // focus goes back to the door. Opened with the mouse, it goes back without a ring: on the
  // wall a focus ring around a card reads as a mistake (and Space still advances the talk).
  if (m.opener.isConnected) {
    if (!m.key) m.opener.classList.add('is-quiet-focus');
    m.opener.focus({ preventScroll: true });
    if (!m.key) m.opener.addEventListener('blur', () => m.opener.classList.remove('is-quiet-focus'), { once: true });
  }
  if (instant || still()) { done(); return; }
  moreClosing = done;
  // the card's words go at once, so the returning content never crosses them; the card shrinks
  // away; the content comes back over it on its own curves, last out first home
  G.killTweensOf([sheet, head, body, scrim]);
  G.to([head, body], { opacity: 0, duration: dur(1) * 0.6, ease: E.in });
  G.to(sheet, { opacity: 0, y: 14, scale: 0.97, duration: dur(1) * 1.3, ease: E.in, delay: dur(1) * 0.3 });
  G.to(scrim, { opacity: 0, duration: dur(2) * 0.9, ease: E.io, delay: dur(1) * 0.3, onComplete: fl ? cardOut : done });
  const back = dur(1) * 0.45, speed = 1.15;
  if (fl) {
    fl.tl.eventCallback('onReverseComplete', done);
    G.delayedCall(back, () => { if (!home) fl.tl.timeScale(speed).reverse(); });
  }
  setTimeout(done, (back + (fl ? fl.tl.duration() / speed : dur(2))) * 1000 + 700);
}
/** Tab and ⇧Tab stay inside the sheet, or inside whatever layer is asked for (the lightbox) */
function trapTab(e, sheet = moreSheet()) {
  const f = [...sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null && !x.closest('[hidden]') && !x.disabled);
  e.preventDefault();
  if (!f.length) { sheet.focus({ preventScroll: true }); return; }
  const k = f.indexOf(document.activeElement);
  const nx = e.shiftKey ? (k <= 0 ? f.length - 1 : k - 1) : (k < 0 || k >= f.length - 1 ? 0 : k + 1);
  f[nx].focus({ preventScroll: true });
}
/** keys while a detail is open; returns true when the key was the detail's */
function moreKey(e) {
  const key = e.key;
  const lb = document.querySelector('.lightbox');
  if (lb && !lb.hidden) { if (key === 'Escape') { e.preventDefault(); closeLightbox(); } return true; }
  if (key === 'Escape' || key === 'm' || key === 'M') { e.preventDefault(); closeMore(); return true; }
  if (key === 'Tab') { trapTab(e); return true; }
  const onButton = e.target instanceof Element && e.target.closest('.more-sheet button');
  if (key === 'ArrowRight' || key === 'PageDown' || (key === ' ' && !onButton)) { e.preventDefault(); moreStep(1); return true; }
  if (key === 'ArrowLeft' || key === 'PageUp') { e.preventDefault(); moreStep(-1); return true; }
  if (key === 'Enter' || key === ' ') return true;                   // a focused control inside the sheet takes it
  if (/^[nNfFcCtT?]$/.test(key)) return false;                       // Notion, full screen, clock, keys: still yours
  e.preventDefault(); return true;                                   // nothing else moves the deck under a detail
}

/* ════════════════════════════════════════════════════════════ CLOCK ═══ */
let clockStart = null, clockAcc = 0, clockShown = false;
const budget = () => slides.map((s) => +(s.dataset.min || 0));
function clockTick() {
  const el = stage?.querySelector('.appbar__clock'); if (!el) return;
  const secs = (clockAcc + (clockStart ? Date.now() - clockStart : 0)) / 1000;
  const b = budget(); const due = b.slice(0, cur + 1).reduce((x, y) => x + y, 0) * 60;
  const mm = (v) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
  el.textContent = clockStart || clockAcc ? mm(secs) : `${Math.round(b.reduce((x, y) => x + y, 0))} min`;
  el.dataset.drift = secs - due > 240 ? 'late' : secs - due > 90 ? 'warn' : '';
  stage.classList.toggle('clock-on', clockShown);
  post({ type: 'clock', secs, due, total: b.reduce((x, y) => x + y, 0) * 60 });
}
setInterval(clockTick, 1000);
function toggleClock() { if (clockStart) { clockAcc += Date.now() - clockStart; clockStart = null; } else clockStart = Date.now(); clockShown = true; clockTick(); }

/* The deck just got longer or shorter, and the folio is where that shows: so it says so. */
function flashFolio() {
  const el = stage?.querySelector('.appbar__folio');
  if (!el || still() || !g()) return;
  g().fromTo(el, { opacity: 0.15, y: -5 }, { opacity: 1, y: 0, duration: dur(2), ease: E.out });
}

/* ═════════════════════════════════════════════════════════ PALETTE ════ */
function buildPalette() {
  const list = document.querySelector('.palette__list');
  // the same groups as the tabs, in the same words, so "intro" finds the opening slides
  const groups = [...STAGES.map((s) => [s.n, s.name]), [8, 'Appendix']];
  list.innerHTML = groups.map(([n, name]) => {
    const items = slides.map((s, i) => [s, i]).filter(([s]) => +(s.dataset.stage || 0) === n);
    if (!items.length) return '';
    return `<section class="palette__g"><h3>${name}</h3>${items.map(([s, i]) => `
      <button class="palette__it" data-i="${i}" data-search="${(s.dataset.title + ' ' + (s.dataset.notion || '') + ' ' + (s.dataset.req || '') + ' ' + name).toLowerCase()}">
        <span class="num">${String(i + 1).padStart(2, '0')}</span><span>${s.dataset.title || s.dataset.id}</span>${s.dataset.path ? `<em class="palette__path" data-path="${s.dataset.path}">${s.dataset.path}</em>` : ''}
      </button>`).join('')}</section>`;
  }).join('');
}
function openPalette() {
  const p = document.querySelector('.palette'); p.hidden = false;
  const q = p.querySelector('.palette__q'); q.value = ''; filterPalette(''); q.focus();
  p.querySelectorAll('.palette__it').forEach((b) => b.classList.toggle('is-on', +b.dataset.i === cur));
  p.querySelector('.palette__it.is-on')?.scrollIntoView({ block: 'center' });
}
function closePalette() { const p = document.querySelector('.palette'); if (p) p.hidden = true; }
function filterPalette(v) {
  v = v.trim().toLowerCase();
  document.querySelectorAll('.palette__it').forEach((b) => { b.hidden = v && !(b.dataset.search.includes(v) || b.dataset.i === String(+v - 1)); });
  document.querySelectorAll('.palette__g').forEach((s) => { s.hidden = ![...s.querySelectorAll('.palette__it')].some((b) => !b.hidden); });
}

/* ═════════════════════════════════════════════════════════ LIGHTBOX ═══ */
/* Every screenshot opens full size, not only the ones an author thought to mark
   (Antonio, 27 Sep: "every screenshot opens full view, and you can flick through them").
   A screenshot is img[data-shot]; data-zoom stays for anything else that wants the same door. */
const ZOOM_SEL = 'img[data-shot], [data-zoom] img, img[data-zoom]';
let lbSet = [], lbAt = 0, lbSwiped = false;        // lbSwiped: a flick just moved the set, so the click it ends with is not a close

/* The set you can flick through is the one the eye already groups: the screenshots of the open
   detail panel when a detail is up, otherwise the ones on the slide you are standing on. Document
   order, so → walks them the way they are laid out. */
function lbGroup(img) {
  const scope = img.closest('.more__panel') || img.closest('.more-sheet__body') || img.closest('.s') || document;
  const all = [...scope.querySelectorAll(ZOOM_SEL)].filter((el) => el === img || el.offsetParent !== null);
  return all.length ? all : [img];
}
function openLightbox(img) {
  const lb = document.querySelector('.lightbox'); if (!lb) return;
  lbSet = lbGroup(img); lbAt = Math.max(0, lbSet.indexOf(img));
  lb.hidden = false;
  paintLightbox(true);
  // focus lands on the frame, not on a control: a ring drawn around a button on the wall reads as
  // a mistake (the same reasoning as the detail's quiet focus), and Tab from here reaches Previous.
  lb.focus({ preventScroll: true });
}
/** the shown image, its caption, its place in the set, and what the two controls may do */
function paintLightbox(first = false) {
  const lb = document.querySelector('.lightbox'); if (!lb) return;
  const src = lbSet[lbAt]; if (!src) return;
  const shown = lb.querySelector('img'), many = lbSet.length > 1;
  shown.src = src.currentSrc || src.src; shown.alt = src.alt;
  // the radius is copied off the clicked image, so a phone zooms with a phone's corners and a
  // landscape capture keeps its own; hard-coding one radius got both of them wrong
  shown.style.borderRadius = getComputedStyle(src).borderRadius;
  lb.querySelector('.lightbox__cap').textContent = src.alt || '';        // the caption is the alt, always
  const n = lb.querySelector('.lightbox__n');
  n.textContent = `${lbAt + 1} / ${lbSet.length}`; n.hidden = !many;
  lb.querySelectorAll('[data-lb-step]').forEach((b) => {
    b.hidden = !many;
    b.disabled = +b.dataset.lbStep < 0 ? lbAt === 0 : lbAt === lbSet.length - 1;   // the ends hold
  });
  // the first image arrives the way it always has; a step is a quieter cross-fade, so flicking
  // through a set does not restage the whole picture each time
  if (first) g().fromTo(shown, { scale: 0.94, autoAlpha: 0, filter: 'blur(8px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: dur(2), ease: E.out });
  else g().fromTo(shown, { autoAlpha: 0.3 }, { autoAlpha: 1, duration: dur(1) * 0.6, ease: E.out });
}
/** move inside the open set; false only when there is no set, so the caller may fall back to the deck */
function lbStep(d) {
  if (lbSet.length < 2) return false;
  const j = lbAt + d;
  if (j >= 0 && j < lbSet.length) { lbAt = j; paintLightbox(); }
  return true;                                       // at an end, still the lightbox's key: the deck stays put
}
const lbOpen = () => { const lb = document.querySelector('.lightbox'); return lb && !lb.hidden ? lb : null; };
/** keys while the lightbox is up; returns true when the key was the lightbox's */
function lbKey(e) {
  const lb = lbOpen(); if (!lb) return false;
  if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return true; }
  if (e.key === 'Tab') { trapTab(e, lb); return true; }
  // With a set, ← and → walk it and never move the deck underneath. With a single image they are
  // not the lightbox's keys at all, so a one-screenshot slide behaves exactly as it did before.
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && lbStep(e.key === 'ArrowRight' ? 1 : -1)) { e.preventDefault(); return true; }
  return false;
}
const closeLightbox = () => { const lb = document.querySelector('.lightbox'); if (lb) lb.hidden = true; lbSet = []; lbAt = 0; };
const toggleKeys = () => { const w = stage?.querySelector('.hint-wrap--keys'); if (w) { w.classList.remove('is-shut'); w.classList.toggle('is-open'); } };

/* ════════════════════════════════════════════════════════════ INPUT ═══ */
function wireInput() {
  addEventListener('keydown', (e) => {
    const pal = document.querySelector('.palette');
    if (!pal.hidden) {
      if (e.key === 'Escape') { closePalette(); return; }
      if (e.key === 'Enter') { const b = [...pal.querySelectorAll('.palette__it')].find((x) => !x.hidden); if (b) { closePalette(); go(+b.dataset.i); } }
      return;
    }
    if (e.target instanceof Element && e.target.closest('input, textarea, [contenteditable]')) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // the lightbox is the topmost layer, so it gets first refusal: Esc, Tab, and ← → when it holds
    // a set. Anything it does not take falls through to the detail and then to the deck, unchanged.
    if (lbKey(e)) return;
    if (more && moreKey(e)) return;
    const key = e.key;
    // a door (data-more) takes Enter; Space goes on advancing the talk and never re-opens it
    if (e.target instanceof Element && e.target.closest(MORE_SEL)) {
      const op = e.target.closest(MORE_SEL);
      if (key === 'Enter' && op.closest('.s.is-current')) { e.preventDefault(); openMore(op, { key: true }); return; }
      if (key === ' ') e.target.blur();
    }
    // a chrome control reached with Tab (the logo, a stage, a hint) takes its own Enter and Space
    if ((key === 'Enter' || key === ' ') && e.target instanceof Element && e.target.closest('.appbar button, .hints button')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(key)) { e.preventDefault(); closeLightbox(); e.shiftKey ? skip() : next(); }
    else if (['ArrowLeft', 'PageUp'].includes(key)) { e.preventDefault(); closeLightbox(); prev(); }
    else if (key === 'Home') go(0);
    else if (key === 'End') go(slides.length - 1);
    else if (/^[0-7]$/.test(key)) { const i = slides.findIndex((s) => +(s.dataset.stage || 0) === +key); if (i >= 0) go(i); }   // 0 is Intro
    else if (key === 'o' || key === 'O' || key === 'g') openPalette();
    else if (key === 'n' || key === 'N') window.dispatchEvent(new CustomEvent('deck:notion', { detail: { slide: slides[cur] } }));   // kit/hc.js opens it
    else if (key === 'l' || key === 'L') toggleShots();
    else if (key === 'm' || key === 'M') openSlideMore();
    else if (key === 'c' || key === 'C') { clockShown = !clockShown; clockTick(); }
    else if (key === 't' || key === 'T') toggleClock();
    else if (key === 'r' || key === 'R') replay();
    else if (key === 'f' || key === 'F') { document.fullscreenElement ? document.exitFullscreen() : html.requestFullscreen?.(); }
    else if (key === 'Escape') { closeLightbox(); stage?.querySelectorAll('.hint-wrap.is-open').forEach((w) => w.classList.remove('is-open')); }
  });
  document.addEventListener('focusin', (e) => {           // focus never wanders out from under a detail
    if (!more) return;
    const sheet = moreSheet(), t = e.target;
    if (t instanceof Node && !sheet.contains(t) && !t.closest?.('.palette, .lightbox')) sheet.focus({ preventScroll: true });
  });
  /* A door that leads to another slide arms the way back, in the capture phase: some
     slides handle their own door clicks (02-thesis) and would otherwise never arm it.
     go() consumes the arm, and an arm that no navigation followed goes stale. */
  const arm = (e) => { const t = e.target; if (t instanceof Element && t.closest('[data-goto]')) jumpArm = { i: cur, t: performance.now() }; };
  document.addEventListener('click', arm, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') arm(e); }, true);
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null; if (!t) return;
    if (more && !t.closest('.palette, .lightbox, .keys')) {
      const sheet = moreSheet();
      if (!sheet.contains(t)) { closeMore(); return; }                // a click outside the sheet
      if (t.closest('[data-more-close]')) { closeMore(); return; }
      // the screens switch from inside the detail too: its own chrome carries the control
      if (t.closest('[data-hint="shots"]')) { toggleShots(); return; }
      const seg = t.closest('[data-more-go]');
      if (seg) { if (e.detail) seg.blur(); const k = +seg.dataset.moreGo; if (k !== more.i) showPanel(k, { dir: Math.sign(k - more.i) }); return; }
      const img = t.closest(ZOOM_SEL); if (img) { openLightbox(img); return; }
      const gotoEl = t.closest('[data-goto]'); if (gotoEl) { closeMore({ instant: true }); go(gotoEl.dataset.goto); return; }
      if (e.detail && t.closest('.more-sheet button')) t.closest('button').blur();
      return;                                                         // one layer: nothing inside opens another
    }
    const door = t.closest(MORE_SEL);
    if (door && door.closest('.s.is-current') && !t.closest('.palette, .lightbox')) { if (openMore(door)) return; }
    // a mouse click never leaves focus on a chrome control: Space must go on advancing the talk
    const ctl = t.closest('.appbar button, .hints button'); if (ctl && e.detail) ctl.blur();
    if (t.closest('[data-go-back]')) { const to = jumpBack; jumpBack = null; go(to); return; }
    if (t.closest('[data-go-home]')) { go(0); return; }
    const hint = t.closest('[data-hint]'); if (hint) { ({ jump: openPalette, next, shots: toggleShots })[hint.dataset.hint]?.(); return; }
    const tab = t.closest('[data-go-stage]'); if (tab) { const i = slides.findIndex((s) => +s.dataset.stage === +tab.dataset.goStage); if (i >= 0) go(i); return; }
    const it = t.closest('.palette__it'); if (it) { closePalette(); go(+it.dataset.i); return; }
    if (t.classList.contains('palette')) { closePalette(); return; }
    const live = t.closest('.embed__go'); if (live) { goLive(live.closest('[data-embed]')); return; }
    if (t.closest('.embed.is-live')) return;                         // clicks inside a live embed belong to Figma
    const img = t.closest(ZOOM_SEL); if (img) { openLightbox(img); return; }
    const step = t.closest('[data-lb-step]');
    // a mouse click leaves no focus on the control, the way the chrome's buttons behave
    if (step) { if (e.detail) step.blur(); lbStep(+step.dataset.lbStep); return; }
    if (t.closest('.lightbox')) { if (lbSwiped) { lbSwiped = false; return; } closeLightbox(); }
    const gotoEl = t.closest('[data-goto]'); if (gotoEl) go(gotoEl.dataset.goto);
    // the cover has no controls of its own: a click anywhere on it starts the talk, like →
    else if (t.closest('.s.is-current[data-cover]') && !t.closest('a, button, input, [data-hint], .palette, .lightbox, .keys')) next();
  });
  document.querySelector('.palette__q').addEventListener('input', (e) => filterPalette(e.target.value));
  /* A flick across the picture moves the set too. Pointer events cover a trackpad drag and a
     touch swipe alike, and the flag stops the click that follows the release from closing it. */
  const lb = document.querySelector('.lightbox');
  let from = null;
  lb.addEventListener('pointerdown', (e) => { from = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    const dx = from === null ? 0 : e.clientX - from; from = null;
    if (Math.abs(dx) < 60) return;
    lbSwiped = lbStep(dx < 0 ? 1 : -1);
  });
}

/* ═════════════════════════════════════════════ PRESENTER (2nd window) ══ */
let chan = null;
function post(m) { try { chan?.postMessage(m); } catch {} }
function wireChannel() {
  if (!('BroadcastChannel' in window)) return;
  chan = new BroadcastChannel('hospitable-deck');
  chan.onmessage = (e) => {
    const m = e.data || {};
    if (m.type === 'cmd') ({ next, prev, skip, replay, clock: toggleClock })[m.cmd]?.();
    if (m.type === 'hello') post({ type: 'at', i: cur, beat: active?.beat || 0 });
  };
}
/* The presenter window (P). A browser may block the pop-up, or open it in another space when the deck is full
   screen, so the window is focused, and when it is blocked the deck offers a link: a real click always opens it
   (Antonio, 4 Oct: "nothing happens when I press P"). */
document.addEventListener('click', (e) => { const a = e.target.closest?.('a[data-hint="notes"]'); if (a) a.href = presenterUrl(); }, true);
function presenterUrl() { return `${location.pathname}?presenter&theme=${html.dataset.theme}`; }
function openPresenter() {
  let w = null;
  try { w = window.open(presenterUrl(), 'presenter', 'width=1100,height=760'); } catch {}
  if (w) {
    try { w.focus(); } catch {}
    // some browsers hand back a window and close it at once; if it is gone, say so
    setTimeout(() => { if (w.closed) showPresenterLink(); }, 500);
    return;
  }
  showPresenterLink();
}
function showPresenterLink() {
  let tip = document.querySelector('.pv-open');
  if (!tip) {
    tip = document.createElement('div'); tip.className = 'pv-open'; tip.setAttribute('role', 'status');
    tip.innerHTML = `<span>The browser blocked the notes window.</span><a href="${presenterUrl()}" target="presenter" rel="opener">Open presenter notes</a><button type="button" aria-label="Close">×</button>`;
    tip.querySelector('a').addEventListener('click', () => setTimeout(() => tip.remove(), 50));
    tip.querySelector('button').addEventListener('click', () => tip.remove());
    document.body.append(tip);
  }
  tip.querySelector('a').focus();
}
function bootPresenter() {
  html.classList.add('is-presenter');
  document.body.innerHTML = `
    <main class="pv">
      <header class="pv__top"><span class="pv__clock num">0:00</span><span class="pv__due num"></span><span class="pv__folio num"></span><span class="pv__case"></span>
        <span class="pv__btns"><button data-cmd="prev">← Prev</button><button data-cmd="next">Next →</button><button data-cmd="clock">Start / pause clock</button></span></header>
      <section class="pv__now"><p class="pv__k">Now</p><h1 class="pv__title"></h1><p class="pv__meta"></p><div class="pv__more" hidden></div><div class="pv__notes"></div></section>
      <aside class="pv__next"><p class="pv__k">Next</p><h2 class="pv__ntitle"></h2></aside>
    </main>`;
  const chanP = new BroadcastChannel('hospitable-deck');
  const paint = (i, beat) => {
    const s = slides[i]; const n = slides[i + 1]; if (!s) return;
    document.querySelector('.pv__title').textContent = s.dataset.title || s.dataset.id;
    document.querySelector('.pv__meta').textContent = `${s.dataset.stage > 0 && s.dataset.stage < 7 ? '0' + s.dataset.stage + ' · ' : ''}${LENS[s.dataset.lens] || ''} · ${s.dataset.min || 0} min · beat ${beat}`;
    document.querySelector('.pv__notes').innerHTML = s.querySelector('.notes')?.innerHTML || '<p>No notes.</p>';
    document.querySelector('.pv__ntitle').textContent = n ? n.dataset.title : 'End';
    document.querySelector('.pv__folio').textContent = `${i + 1} / ${slides.length}`;
    const c = caseOf(s); const pc = document.querySelector('.pv__case');       // the case badge, in words
    pc.textContent = c ? `${c.name}${c.role ? ' · ' + roleName(c.role) : ''}` : ''; pc.dataset.role = c?.role || '';
  };
  chanP.onmessage = (e) => {
    const m = e.data || {};
    if (m.type === 'at') paint(m.i, m.beat);
    if (m.type === 'more') {                                        // a detail is open on the wall
      const box = document.querySelector('.pv__more');
      box.hidden = !m.open;
      box.innerHTML = m.open ? `<p class="pv__k">Detail open · ${m.title}${m.n > 1 ? ` · panel ${m.i + 1} of ${m.n}${m.name ? ': ' + m.name : ''}` : ''}</p>${m.notes || ''}` : '';
    }
    if (m.type === 'clock') {
      const mm = (v) => `${Math.floor(v / 60)}:${String(Math.floor(Math.abs(v) % 60)).padStart(2, '0')}`;
      document.querySelector('.pv__clock').textContent = mm(m.secs);
      const drift = m.secs - m.due; document.querySelector('.pv__due').textContent = `${drift >= 0 ? '+' : '−'}${mm(Math.abs(drift))} vs plan · ${Math.round(m.total / 60)} min total`;
      document.querySelector('.pv__due').dataset.drift = drift > 240 ? 'late' : drift > 90 ? 'warn' : '';
    }
  };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-cmd]'); if (b) chanP.postMessage({ type: 'cmd', cmd: b.dataset.cmd }); });
  addEventListener('keydown', (e) => { if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) chanP.postMessage({ type: 'cmd', cmd: 'next' }); if (['ArrowLeft', 'PageUp'].includes(e.key)) chanP.postMessage({ type: 'cmd', cmd: 'prev' }); if (e.key === 't') chanP.postMessage({ type: 'cmd', cmd: 'clock' }); });
  chanP.postMessage({ type: 'hello' });
  resolveReady(true);
}

/* ═══════════════════════════════════════════════════════════ PRINT ════ */
async function bootPrint() {
  html.classList.add('is-print'); html.dataset.motion = 'off';
  // the static print cuts: request every family at every weight in use, then wait. This runs
  // BEFORE the badges are built, because both the badge's width and the measure it takes from
  // the headline are measured from laid-out type: with the fallback fonts still in place the
  // box came out up to 11px narrow and the headline wrapped to the wrong width on paper.
  const W = [...new Set([...document.querySelectorAll('.deck *')].map((e) => getComputedStyle(e).fontWeight))];
  try { await Promise.all(['Geist Print', 'Geist Mono Print', 'Inter Print'].flatMap((f) => W.map((w) => document.fonts.load(`${w} 16px "${f}"`)))); await document.fonts.ready; } catch {}
  // no persistent chrome on paper: each case slide carries its own still copy of the badge
  slides.forEach((s) => { const c = caseOf(s); if (!c || (s.dataset.chrome || 'full') === 'none') return;
    const b = document.createElement('aside'); b.className = 'casebadge casebadge--static';
    const inn = badgeInner(c);
    b.setAttribute('aria-label', c.name); b.append(inn); s.append(b);
    fitBadgeName(inn);
    setBadgeCut(s, b, inn); });                      // on paper the head wraps around it too
  stage = document.querySelector('.stage');
  // every slide in its final state: enter and all beats complete
  for (let i = 0; i < slides.length; i++) { const a = activate(i); a.enter.progress(1); a.beats.forEach((b) => b.progress(1)); }
  // every detail prints after its slide, one page per panel, as the sheet looks on the wall. A
  // page carries its slide's data-index, so a print job that holds the slide holds its details.
  for (const s of slides) {
    let after = s;
    for (const tpl of s.querySelectorAll('template.more')) {
      const panels = morePanels(tpl);
      panels.forEach((pt, k) => {
        const page = document.createElement('section');
        page.className = 'more-page'; page.dataset.index = s.dataset.index; page.dataset.moreOf = s.dataset.id; page.dataset.more = tpl.dataset.more;
        page.innerHTML = `<div class="more-layer__scrim"></div><div class="more-sheet" data-panels="${panels.length}">${SHEET_INNER}</div>`;
        page.querySelector('.more-sheet__title').textContent = tpl.dataset.title || '';
        page.querySelector('.more-sheet__from').textContent = `${String(+s.dataset.index + 1).padStart(2, '0')} · ${s.dataset.title || ''}`;
        page.querySelector('.more-sheet__n').textContent = panels.length > 1 ? `${k + 1} / ${panels.length}` : '';
        paintPager(page.querySelector('.more-sheet'), panels, k);
        page.querySelector('.more-sheet__close').remove();
        const p = pt.cloneNode(true);
        page.querySelector('.more-sheet__body').append(p);
        after.after(page); after = page;
        g().context(() => {
          mountPanel(p, { print: true });
          window.dispatchEvent(new CustomEvent('deck:more', { detail: { open: true, print: true, id: tpl.dataset.more, slide: s, panel: p, index: k, count: panels.length } }));
        }, p);
      });
    }
  }
  document.querySelector('.veil')?.classList.add('is-gone');
  resolveReady(true);
}

/* ═════════════════════════════════════════════════════════ EXPORTS ═══ */
const Deck = {
  boot, define, atmos, defineThread, go, next, prev, skip, replay, setTheme, playBeat, seekEnter, ready,
  get current() { return cur; }, get slides() { return slides; }, get active() { return active; },
  /** open a detail of the current slide by its id ("slide-id/ID" for another slide's), as a door would */
  openMore(ref) {
    const s = slides[cur]; if (!s) return false;
    const doors = [...s.querySelectorAll(MORE_SEL)].filter((d) => d.dataset.more === ref);
    const door = doors.find((d) => d.classList.contains('more-btn')) || doors.find((d) => !d.classList.contains('is-kit-door')) || doors[0];
    if (door) return openMore(door);
    const tpl = findMore(ref, s); if (!tpl) return false;
    const ghost = document.createElement('span'); ghost.dataset.more = ref; s.append(ghost);
    const ok = openMore(ghost); ghost.remove(); return ok;
  },
  closeMore: () => closeMore(),
  get moreState() { return more ? { id: more.id, title: more.title, panel: more.i, count: more.panels.length } : null; },
};
window.Deck = Deck;
export { Deck, boot, go, next, prev, ready, defineThread, shotSrc };
/* boot() is called by the page's entry module AFTER it has statically imported
   every slide and atmosphere module, so all registrations exist first. */

/* How to move: on the first load, over the cover, a small pill shows → and ← pressing for a couple of seconds, then
   leaves (Antonio, 5 Oct). Any key, click or slide change takes it away at once. Not shown in print or presenter. */
(function navHint() {
  if (MODE.print || MODE.presenter || MODE.qa || MODE.static) return;
  let el = null, t1 = 0, t2 = 0;
  const off = () => { clearTimeout(t1); clearTimeout(t2); if (!el) return; const e = el; el = null; e.classList.add('is-out'); setTimeout(() => e.remove(), 500); };
  const show = () => {
    if (!document.querySelector('.deck > .s.is-current[data-cover]')) return;
    el = document.createElement('div'); el.className = 'navhint'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="navhint__keys"><kbd>←</kbd><kbd class="is-press">→</kbd></span><span>Use the arrow keys to move through the slides</span>';
    document.body.appendChild(el);
    t2 = setTimeout(off, 3200);
  };
  t1 = setTimeout(show, 2200);   // after the cover has settled
  ['keydown', 'pointerdown'].forEach((ev) => window.addEventListener(ev, off, true));
  window.addEventListener('deck:slide', (e) => { if (!e.detail?.slide?.matches('[data-cover]')) off(); });
})();
