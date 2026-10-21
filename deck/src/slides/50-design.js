/* ============================================================================
   50 · DESIGN · the product, shown the way it is spoken (3 Oct).

   Every design slide is a .ds-scene (an .hc-scene that this module owns): real
   prototype captures that float in, then build up beat by beat, in the order the
   notes speak. The markup says what lands when, so the HTML stays the score:

     data-st="N"     on a scene item: 0 arrives with the entry, N with the Nth press
     data-lift       on a crop (.hc-scr--crop): it lifts out of the screen that holds
                     the same data-shot, from exactly the region it shows, toward the
                     viewer (computed from --x --y --sw --z --cx --cy --ar)
     data-in="fan"   on a phone: it slides out from behind the scene's [data-hub] phone
     .ds-ui          live product UI (Hospitable's own h-* components, ds-ui layer) placed on
                     the scene like a screen. Inside it, a nested data-st="N" part rises in on
                     the Nth press, and data-swap="N" crossfades its [data-was] child out and
                     the rest in (a receipt's Sent → Live). .ds-wk bars grow as their card lands.
                     The parts can be clicked (accept, undo, customise, choose): see wire() below.

   Screens enter with a short rise; a later screen slides over the one before it, like
   a walkthrough; callouts land last, one by one. The left column reveals itself with
   the kit's declarative data-a / data-beat, so it stays in sync with the same presses.

   Motion: deck eases only, no bounce, no 3D, no glow. Every tween is a fromTo that
   ends at the CSS position, so motion off, an early →, and print all land on the
   complete final state. The scene's gentle float is the kit's own (CSS, ambient),
   moved here onto the `translate` property so it never fights these transforms.
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { E, motionScale } from '../kit/motion.js';

const gs = () => window.gsap;
const K = () => motionScale() || 1;
/** a beat's duration, never exactly zero: zero-duration tweens render when they are built */
const bd = (n) => Math.max(n * K(), 0.002);

const px = (el, v, d = 0) => { const s = el.style.getPropertyValue(v).trim(); return s ? parseFloat(s) : d; };
const ratio = (el, v, d) => {
  const s = el.style.getPropertyValue(v).trim(); if (!s) return d;
  const [a, b] = s.split('/').map(parseFloat); return b ? a / b : a;
};
const box = (el) => ({ x: px(el, '--x'), y: px(el, '--y'), w: px(el, '--sw') });
const isCrop = (el) => el.classList.contains('hc-scr--crop');
const isCallout = (el) => el.classList.contains('hc-callout');
const step = (el) => parseInt(el.dataset.st || '0', 10);
/* every desktop capture is 1440 × 900 (tools/capture-proto.mjs); a loaded image says so itself */
const aspect = (fig) => { const i = fig.querySelector('img'); return i && i.naturalWidth ? i.naturalWidth / i.naturalHeight : 1.6; };

/** where a crop's view sits on its source screen, in scene px, as a from-state for the lift */
function liftFrom(crop, items) {
  const shot = crop.querySelector('img')?.dataset.shot;
  const src = items.find((f) => f !== crop && !isCrop(f) && f.querySelector(`img[data-shot="${shot}"]`));
  if (!src) return null;
  const c = box(crop), s = box(src);
  const z = px(crop, '--z', 1), fx = -px(crop, '--cx') / 100, fy = -px(crop, '--cy') / 100;
  return { x: s.x + fx * s.w - c.x, y: s.y + fy * (s.w / aspect(src)) - c.y, scale: s.w / z / c.w, src };
}

/** what one step brings: screens slide or rise in, crops lift, phones fan out, callouts land */
function play(api, tl, list, items, at, entry, S, s) {
  const k = K();
  const frames = list.filter((el) => !isCallout(el) && !(isCrop(el) && el.hasAttribute('data-lift')));
  const lifts = list.filter((el) => isCrop(el) && el.hasAttribute('data-lift'));
  const calls = list.filter(isCallout);
  const ir = { immediateRender: false };
  let t = at;
  frames.forEach((el, i) => {
    const when = t + i * 0.14 * k;
    if (el.dataset.in === 'fan') {
      const hub = items.find((x) => x.hasAttribute('data-hub'));
      const h = hub ? box(hub) : box(el), b = box(el);
      tl.fromTo(el, { autoAlpha: 0, x: h.x + (h.w - b.w) / 2 - b.x, scale: 0.94 }, { autoAlpha: 1, x: 0, scale: 1, duration: bd(0.7), ease: E.io, ...ir }, when);
    } else if (entry) {
      tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: bd(0.75), ease: E.out, ...ir }, when);
    } else {
      // a later screen slides over the one before it, like the next step of a walkthrough
      tl.fromTo(el, { autoAlpha: 0, x: 64, y: 18 }, { autoAlpha: 1, x: 0, y: 0, duration: bd(0.6), ease: E.out, ...ir }, when);
    }
  });
  // a weekly chart's bars grow from the baseline once its card has landed, before then since
  frames.forEach((el, i) => {
    const bars = el.querySelectorAll('.ds-wk__bar');
    if (bars.length) tl.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: bd(0.5), ease: E.out, stagger: 0.035 * k, ...ir }, t + i * 0.14 * k + 0.35 * k);
  });
  if (frames.length) t += (entry ? 0.45 : 0.3) * k + (frames.length - 1) * 0.14 * k;
  // the parts of a live component that this press brings: one by one, in reading order
  const parts = S ? S.inner(s) : [];
  parts.forEach((el, i) => {
    tl.fromTo(el, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: bd(0.45), ease: E.out, ...ir }, t + i * 0.14 * k);
  });
  if (parts.length) t += 0.3 * k + (parts.length - 1) * 0.14 * k;
  // a status that changes on this press (Sent → Live): the old one leaves as the new one arrives
  (S ? S.swaps(s) : []).forEach((el, i) => {
    const was = el.querySelectorAll(':scope > [data-was]'), now = el.querySelectorAll(':scope > :not([data-was])');
    const when = t + i * 0.32 * k;
    tl.fromTo(was, { autoAlpha: 1 }, { autoAlpha: 0, duration: bd(0.25), ease: E.io, ...ir }, when);
    tl.fromTo(now, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: bd(0.35), ease: E.out, ...ir }, when + 0.12 * k);
  });
  lifts.forEach((el, i) => {
    const f = liftFrom(el, items);
    const when = t + i * 0.16 * k;
    if (!f) { tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: bd(0.6), ease: E.out, ...ir }, when); return; }
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: bd(0.18), ease: 'none', ...ir }, when);
    tl.fromTo(el, { x: f.x, y: f.y, scale: f.scale, transformOrigin: '0 0' },
      { x: 0, y: 0, scale: 1, duration: bd(0.72), ease: E.io, ...ir }, when);
  });
  if (lifts.length) t += 0.5 * k + (lifts.length - 1) * 0.16 * k;
  calls.forEach((el, i) => {
    tl.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: bd(0.4), ease: E.out, ...ir }, t + i * 0.12 * k);
  });
  return tl;
}

function scene(api) {
  const sc = api.q('.ds-scene');
  const items = sc ? [...sc.children].filter((el) => !el.classList.contains('hc-scene__bg')) : [];
  const nested = sc ? [...sc.querySelectorAll('[data-st]')].filter((el) => el.parentElement !== sc) : [];
  const swaps = sc ? [...sc.querySelectorAll('[data-swap]')] : [];
  const swapStep = (el) => parseInt(el.dataset.swap || '0', 10);
  const n = Math.max(0, ...items.map(step), ...nested.map(step), ...swaps.map(swapStep));
  return { sc, items, n, at: (s) => items.filter((el) => step(el) === s), inner: (s) => nested.filter((el) => step(el) === s),
    swaps: (s) => swaps.filter((el) => swapStep(el) === s) };
}

const spec = {
  enter(api) {
    const S = scene(api); const tl = api.tl(); const k = K();
    if (!S.sc) return tl;
    S.sc.querySelectorAll('.ds-ui').forEach(reset);                 // every visit starts from the product's first state
    // everything a press brings waits hidden; the entry's own tweens hide theirs as they are built
    for (let s = 1; s <= S.n; s++) {
      const wait = [...S.at(s), ...S.inner(s)]; if (wait.length) gs().set(wait, { autoAlpha: 0 });
      S.swaps(s).forEach((el) => {
        gs().set(el.querySelectorAll(':scope > [data-was]'), { autoAlpha: 1 });
        gs().set(el.querySelectorAll(':scope > :not([data-was])'), { autoAlpha: 0 });
      });
    }
    const bg = S.sc.querySelector('.hc-scene__bg');
    if (bg) tl.fromTo(bg, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: bd(0.7), ease: E.out }, 0.12 * k);
    const first = S.at(0);
    if (first.length) gs().set(first, { autoAlpha: 0 });
    play(api, tl, first, S.items, 0.24 * k, true, S, 0);
    return tl;
  },
  beats(api) {
    const S = scene(api); const out = [];
    for (let s = 1; s <= S.n; s++) out.push(play(api, api.tl(), S.at(s), S.items, 0, false, S, s));
    return out;
  },
};

/* ── the live components can be used, like the product (simple and safe: nothing leaves the slide) ──
     data-act="accept" | "dismiss" | "undo"   on a tip card (.h-tip): its foot turns to Accepted (or Dismissed) + Undo
     data-act="scope"                          on a field row's action: Uses the Base ⇄ Custom for <channel>
     a wizard's choice cards are native radios
   reset() puts every one back to its authored state when the slide is entered again. */
function setTip(tip, state) {
  tip.classList.toggle('is-accepted', state === 'accepted');
  tip.classList.toggle('ds-is-dismissed', state === 'dismissed');
  const ask = tip.querySelector('.ds-tip__ask'), done = tip.querySelector('.ds-tip__done');
  if (ask) ask.hidden = !!state;
  if (done) {
    done.hidden = !state;
    const label = done.querySelector('.ds-tip__label'); if (label) label.textContent = state === 'dismissed' ? 'Dismissed' : 'Accepted';
    done.querySelector('.ds-done')?.classList.toggle('is-quiet', state === 'dismissed');
  }
}
function setScope(row, custom) {
  row.dataset.state = custom ? 'override' : 'inherit';
  const ch = row.dataset.ch || 'this channel';
  const cap = row.querySelector('.ds-scope'), act = row.querySelector('[data-act="scope"]'), input = row.querySelector('.h-input, .h-textarea');
  if (cap) cap.textContent = custom ? `Custom for ${ch}` : 'Uses the Base';
  if (act) act.textContent = custom ? 'Use the Base' : `Customize for ${ch}`;
  if (input) {
    input.disabled = !custom;
    if (input.dataset.base) input.value = custom ? input.dataset.custom : input.dataset.base;   // the Base's value, or the channel's own
  }
}
function reset(root) {
  root.querySelectorAll('.h-tip[data-tip]').forEach((t) => setTip(t, t.dataset.tip === 'accepted' ? 'accepted' : null));
  root.querySelectorAll('.h-field-row[data-start]').forEach((r) => setScope(r, r.dataset.start === 'override'));
  root.querySelectorAll('input[type=radio], input[type=checkbox]').forEach((r) => { r.checked = r.defaultChecked; });
  root.querySelectorAll('input.ds-num').forEach((i) => { i.value = i.defaultValue; });
}
function wire() {
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target.closest('.ds-ui [data-act]') : null; if (!t) return;
    const act = t.dataset.act;
    if (act === 'accept' || act === 'dismiss' || act === 'undo') {
      const tip = t.closest('.h-tip'); if (!tip) return;
      setTip(tip, act === 'undo' ? null : act === 'accept' ? 'accepted' : 'dismissed');
      if (!e.detail) tip.querySelector(act === 'undo' ? '[data-act="accept"]' : '[data-act="undo"]')?.focus({ preventScroll: true });   // keyboard: focus follows
    } else if (act === 'scope') {
      const row = t.closest('.h-field-row'); if (row) setScope(row, row.dataset.state !== 'override');
    }
    if (e.detail) t.blur?.();                                     // a mouse click leaves no focus ring, and keys go back to the deck
  });
}
wire();

for (const id of ['ds-solution', 'ds-shared', 'ds-hub', 'ds-channels', 'ds-strategy', 'ds-tips',
  'ds-canvas', 'ds-performance', 'ds-autopilot', 'ds-mobile', 'ds-system']) Deck.define(id, spec);
