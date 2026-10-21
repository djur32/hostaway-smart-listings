/* ============================================================================
   40 · CONCEPT · the part's motion (4 Oct, rebuilt: seven models, twelve patterns, one model).

     cn-principles  the list card rises, its rows stagger in; beat 1 pops the pills; beat 2 wipes in row 3
                    (declarative); beat 2 lifts number 3 out as the spine: it grows a touch
                    (1.025) and rises, its tint and number take the accent, a raspberry
                    underline draws under it, its reason opens. The other six stay as they are
     cn-grid        a timed ladder: the seven plates scale up one after another, left to right,
                    each with its name and metaphor; beat 1 loops the two finalists in raspberry
                    (doodle-mark.js) and their questions scale in under them. Nothing is dimmed
     cn-judged      the same ladder for twelve plates, row by row; beat 1 pops the checks on
                    what survived (the two at the core first, then the four parts) and draws
                    an underline under the core two's names; the legend rises with them (declarative)
     cn-converge    round one and round two arrive row by row; on the beat each row's line
                    draws from its last chip to the card, and the part of Smart Listings it became scales in, top to bottom

   At load, each converge chip borrows the drawing of its direction from cn-grid or cn-judged
   (data-g → data-gk), so the three slides share one picture per idea.

   Rules kept (CONTRACT §5, §16.6): tokens only, deck eases, nothing overshoots, entries
   settle inside 2 s, coloured plates never fade through half-transparency (they scale in,
   shown at once), beat tweens are fromTo with immediateRender: false, and the HTML is the
   final state.
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { E, motionScale, resolveColor } from '../kit/motion.js';
import { markOn, drawIn } from './doodle-mark.js';

const gs = () => window.gsap;
const K = () => motionScale() || 1;
const beatTl = (api) => api.tl({ defaults: { immediateRender: false } });

/* one picture per idea: a converge chip shows its direction's drawing, cloned from the slide that
   draws it (and its plate's tint with it). Runs once at load, so print and motion off have it too. */
function borrowDrawings() {
  document.querySelectorAll('.cn-chip__g[data-g]').forEach((slot) => {
    if (slot.firstElementChild) return;
    const src = document.querySelector(`[data-gk="${slot.dataset.g}"]`);
    const svg = src?.querySelector('svg.cn-g'); if (!svg) return;
    slot.dataset.tint = src.dataset.tint || '';
    slot.append(svg.cloneNode(true));
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', borrowDrawings, { once: true });
  else borrowDrawings();
}

/* a plate arrives by scale, shown at once (no half-transparent colour), its words rise after it */
function ladder(tl, api, items, { plate, words, at0 = 0.2, step = 0.08 }) {
  const k = K();
  items.forEach((it, i) => {
    const at = (at0 + i * step) * k;
    const p = it.querySelector(plate);
    tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, at);
    tl.fromTo(p, { scale: 0.86, y: 14 }, { scale: 1, y: 0, duration: api.dur(2), ease: E.out, transformOrigin: '50% 70%' }, at);
    const w = it.querySelectorAll(words);
    if (w.length) tl.from(w, { autoAlpha: 0, y: 10, duration: api.dur(2), ease: E.out, stagger: 0.05 * k }, at + 0.08 * k);
  });
  return tl;
}
/* something small that appears on a beat: shown at once, scaling up from its centre */
function popIn(tl, api, el, at) {
  if (!el) return tl;
  tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, at);
  tl.fromTo(el, { scale: 0.4 }, { scale: 1, duration: api.dur(2), ease: E.out, transformOrigin: '50% 50%' }, at);
  return tl;
}

/* ── cn-principles ──────────────────────────────────────────────────────── */
Deck.define('cn-principles', {
  enter(api) {
    // number 3 waits, unmarked, for its own beat: the blush row is wound back to its left edge
    gs().set(api.q('.cn-pr__hl'), { scaleX: 0 });
    return null;
  },
  beats: [
    () => null,                                             // beat 1 is declarative: the Rewritten / New pills pop on
    (api) => {
      const tl = beatTl(api); const k = K();
      const key = api.q('.cn-pr__list > .is-key');
      // the product's highlighted row wipes in left to right; the tile answers with a small scale
      tl.fromTo(api.q('.cn-pr__hl'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: api.dur(3), ease: E.out }, 0);
      tl.fromTo(key.querySelector('.h-listitem__icon'), { scale: 0.82 }, { scale: 1, transformOrigin: '50% 50%', duration: api.dur(2), ease: E.out }, 0.1 * k);
      return tl;
    },
  ],
});

/* ── cn-grid · seven mental models ──────────────────────────────────────── */
Deck.define('cn-grid', {
  enter(api) {
    gs().set(api.qa('.cn-model__q'), { autoAlpha: 0 });
    // the finalists' loops, born hidden; a wide radius so the loop rounds the plate's own corners
    api._mk = api.qa('.cn-model.is-pick').map((li, i) => markOn(li, { tone: 'raspberry', pad: 9, radius: 30, seed: 5 + i * 9 }));
    return ladder(api.tl(), api, api.qa('.cn-model'), { plate: '.cn-model__plate', words: '.cn-model__n, .cn-model__m', at0: 0.22, step: 0.09 });
  },
  beats: [
    (api) => {
      const tl = beatTl(api); const k = K();
      (api._mk || []).forEach((p, i) => drawIn(tl, p, (0.05 + i * 0.22) * k, 0.6));
      api.qa('.cn-model__q').forEach((q, i) => popIn(tl, api, q, (0.3 + i * 0.22) * k));
      return tl;
    },
  ],
});

/* ── cn-judged · twelve patterns ────────────────────────────────────────── */
Deck.define('cn-judged', {
  enter(api) {
    gs().set(api.qa('.cn-pat__plate > .cn-k'), { autoAlpha: 0 });
    // the two at the core get a hand-drawn underline under their names (a loop would fight the checks)
    api._mk = api.qa('.cn-pat.is-core .cn-pat__n > span').map((s, i) => markOn(s, { shape: 'under', tone: 'raspberry', width: 3.5, gap: 1, seed: 4 + i * 6 }));
    return ladder(api.tl(), api, api.qa('.cn-pat'), { plate: '.cn-pat__plate', words: '.cn-pat__n, .cn-pat__f', at0: 0.2, step: 0.06 });
  },
  beats: [
    (api) => {
      const tl = beatTl(api); const k = K();
      const core = api.qa('.cn-pat.is-core > .cn-pat__plate > .cn-k');
      const part = api.qa('.cn-pat.is-part > .cn-pat__plate > .cn-k');
      core.forEach((m, i) => popIn(tl, api, m, (0.05 + i * 0.12) * k));
      (api._mk || []).forEach((p, i) => drawIn(tl, p, (0.15 + i * 0.18) * k, 0.45));
      part.forEach((m, i) => popIn(tl, api, m, (0.6 + i * 0.1) * k));
      return tl;
    },
  ],
});

/* ── cn-converge · what came from where ─────────────────────────────────── */
Deck.define('cn-converge', {
  enter(api) {
    const g = gs(); const k = K();
    g.set(api.qa('.cn-from__to'), { autoAlpha: 0 });
    g.set(api.qa('.cn-from__sh'), { scaleX: 0, transformOrigin: '0% 50%' });
    g.set(api.qa('.cn-from__hd path'), { drawSVG: '0% 0%' });
    const tl = api.tl();
    tl.from(api.qa('.cn-from__h'), { autoAlpha: 0, y: 8, duration: api.dur(2), ease: E.out, stagger: 0.06 * k }, 0.18 * k);
    // the chips, row by row: round one, then round two
    api.qa('.cn-from > .cn-from__c, .cn-from__mid > .cn-from__c').forEach((ul, i) => {
      const chips = ul.querySelectorAll('.cn-chip'); if (!chips.length) return;
      const at = (0.3 + Math.floor(i / 2) * 0.16 + (i % 2) * 0.07) * k;
      chips.forEach((c, j) => {
        tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, at + j * 0.05 * k);
        tl.fromTo(c, { scale: 0.88, y: 10 }, { scale: 1, y: 0, duration: api.dur(2), ease: E.out, transformOrigin: '0% 50%' }, at + j * 0.05 * k);
      });
    });
    return tl;
  },
  beats: [
    (api) => {
      const tl = beatTl(api); const k = K();
      const arrows = api.qa('.cn-from__ln'); const cards = api.qa('.cn-from__to');
      arrows.forEach((a, i) => {
        const at = (0.05 + i * 0.2) * k;
        // the line draws from the last chip to the card, then its head
        tl.fromTo(a.querySelector('.cn-from__sh'), { scaleX: 0 }, { scaleX: 1, duration: api.dur(2), ease: E.io, transformOrigin: '0% 50%' }, at);
        tl.fromTo(a.querySelector('.cn-from__hd path'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: api.dur(1), ease: E.out }, at + 0.22 * k);
        const c = cards[i]; if (!c) return;
        tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, at + 0.24 * k);
        tl.fromTo(c, { scale: 0.92, x: -14 }, { scale: 1, x: 0, duration: api.dur(2), ease: E.out, transformOrigin: '0% 50%' }, at + 0.24 * k);
      });
      return tl;
    },
  ],
});
