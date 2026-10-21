/* ============================================================================
   MOTION · the deck's shared motion grammar, on GSAP 3.13.

   Every primitive reads its timing from tokens (--dur-*, --motion-scale,
   --blur-in, --rise), so a theme changes how things move the same way it
   changes how they look, and data-motion="off" gives final states only.

   Two ways to use it:
     1. Declarative, no JS: put data-a="…" on elements (see AUTO below).
        Add data-beat="1" (2, 3…) to hold an element until that press of →.
     2. Imperative, from a slide module: import { M } and build timelines.

   Everything here is safe to call inside a gsap.context(), which the engine
   opens per slide, so leaving a slide reverts every inline style created.
   ========================================================================= */

import { orchestrate } from './orch.js';
import { drawLinks } from './links.js';

const g = () => window.gsap;
const root = document.documentElement;

/* ── tokens ─────────────────────────────────────────────────────────────── */
export const token = (name, el = root) => getComputedStyle(el).getPropertyValue(name).trim();
export const num = (name, el = root) => parseFloat(token(name, el)) || 0;
export const motionScale = () => {
  const v = token('--motion-scale');
  return v === '' ? 1 : parseFloat(v);
};
/** Timing scale for durations, staggers and offsets. Motion OFF keeps real lengths (1):
    the engine completes every timeline instantly instead. Shrinking time to ~0 broke any
    timeline that used a literal offset (e.g. `dur(4) - 0.1` went negative and never fired). */
const ms = () => { const v = motionScale(); return v === 0 ? 1 : v; };
/** duration n (1–4) from tokens, times the motion scale */
export const d = (n = 2) => (num(`--dur-${n}`) || [0, .32, .72, 1.1, 1.8][n]) * ms();
export const stag = (k = 1) => (num('--stagger') || 0.06) * k * ms();
export const still = () => motionScale() === 0;

/* ── eases, registered once ─────────────────────────────────────────────── */
let eased = false;
export function registerEases() {
  if (eased || !window.CustomEase) return;
  const CE = window.CustomEase;
  CE.create('deck.out',  '0.16,1,0.3,1');
  CE.create('deck.io',   '0.65,0,0.35,1');
  CE.create('deck.in',   '0.7,0,0.84,0');
  CE.create('deck.soft', '0.45,0.05,0.2,1');
  CE.create('deck.snap', 'M0,0 C0.25,0 0.12,1.02 1,1');
  eased = true;
}
export const E = { out: 'deck.out', io: 'deck.io', in: 'deck.in', soft: 'deck.soft', snap: 'deck.snap' };

/* ── seeded randomness: the same deck every time it is shown ────────────── */
export function rng(seed = 7) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; };
}
/** a human rhythm: stagger with a little seeded jitter, never mechanical */
export function humanStagger(n, base = 0.055, jitter = 0.5, seed = 11) {
  const r = rng(seed); let t = 0; const out = [];
  for (let i = 0; i < n; i++) { out.push(t); t += base * (1 - jitter / 2 + r() * jitter) * ms(); }
  return out;
}

/* ── splitting text (SplitText 3.13, masked lines) ──────────────────────── */
const splits = new Set();
export function split(el, type = 'lines', opts = {}) {
  const ST = window.SplitText;
  if (!ST || !el) return null;
  const s = ST.create(el, { type, mask: type.includes('lines') ? 'lines' : undefined, linesClass: 'sl', wordsClass: 'sw', charsClass: 'sc', ...opts });
  splits.add(s);
  return s;
}
export function revertSplits(scope) {
  for (const s of splits) {
    const el = s.elements?.[0];
    if (!scope || (el && scope.contains(el))) { try { s.revert(); } catch {} splits.delete(s); }
  }
}

/* ── text that primitives rewrite is remembered and restored on leave ───── */
const texts = new Map();                         // element → its original innerHTML
function pristine(el) { if (!texts.has(el)) texts.set(el, el.innerHTML); else el.innerHTML = texts.get(el); return el; }
/** put back every element a primitive rewrote (count, type, scramble, roll) */
export function restoreText(scope) {
  for (const [el, html] of texts) if (!scope || scope.contains(el)) { el.innerHTML = html; texts.delete(el); }
}

/* ── primitives: each returns a tween or timeline ───────────────────────── */
export const M = {
  d, stag, E, rng, still,

  rise(t, o = {}) {
    // colour arrives early: opacity is full within the first third of the move, so a tinted tile never
    // lingers half-transparent (review, 3 Oct: "no animation that dims the colour and shows it lighter")
    const dur = o.duration ?? d(2), st = o.stagger ?? stag(1.4);
    return g().timeline({ delay: o.delay || 0 })
      .from(t, { y: o.y ?? num('--rise'), duration: dur, ease: o.ease ?? E.out, stagger: st }, 0)
      .from(t, { autoAlpha: 0, duration: dur * 0.3, ease: 'power1.out', stagger: st }, 0);
  },
  fade(t, o = {}) {
    return g().from(t, { autoAlpha: 0, duration: o.duration ?? d(2), ease: o.ease ?? E.io, stagger: o.stagger ?? 0, delay: o.delay || 0 });
  },
  /** a soft focus pull: blurred and slightly large, settling sharp */
  focus(t, o = {}) {
    const b = o.blur ?? num('--blur-in');
    return g().from(t, { autoAlpha: 0, filter: `blur(${b}px)`, scale: o.scale ?? 1.04, duration: o.duration ?? d(3), ease: o.ease ?? E.out, stagger: o.stagger ?? stag(2), clearProps: 'filter' });
  },
  /** clip wipe; from = left | right | up | down */
  mask(t, o = {}) {
    const from = o.from || 'left';
    const start = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', up: 'inset(100% 0 0 0)', down: 'inset(0 0 100% 0)' }[from];
    return g().fromTo(t, { clipPath: start, webkitClipPath: start }, { clipPath: 'inset(0 0% 0 0%)', webkitClipPath: 'inset(0 0% 0 0%)', duration: o.duration ?? d(3), ease: o.ease ?? E.io, stagger: o.stagger ?? stag(2), clearProps: 'clipPath,webkitClipPath' });
  },
  /** lines rise out of their own masks */
  lines(el, o = {}) {
    const s = split(el, 'lines');
    if (!s) return M.rise(el, o);
    return g().from(s.lines, { yPercent: 108, duration: o.duration ?? d(3), ease: o.ease ?? E.out, stagger: o.stagger ?? stag(1.6), delay: o.delay || 0 });
  },
  /** words come alive at a human rhythm: blur, lift, land (CoPilot's own motion) */
  words(el, o = {}) {
    const s = split(el, 'words');
    if (!s) return M.focus(el, o);
    const offs = humanStagger(s.words.length, o.base ?? 0.045, o.jitter ?? 0.7, o.seed ?? 3);
    const tl = g().timeline();
    s.words.forEach((w, i) => tl.from(w, { autoAlpha: 0, y: 10, filter: `blur(${o.blur ?? num('--blur-in')}px)`, duration: d(2), ease: E.out, clearProps: 'filter' }, offs[i]));
    return tl;
  },
  chars(el, o = {}) {
    const s = split(el, 'chars');
    if (!s) return M.rise(el, o);
    return g().from(s.chars, { yPercent: o.y ?? 100, autoAlpha: 0, duration: o.duration ?? d(2), ease: o.ease ?? E.out, stagger: o.stagger ?? stag(0.6) });
  },
  /** a hairline drawing itself */
  rule(t, o = {}) {
    return g().from(t, { scaleX: 0, transformOrigin: o.origin || 'left center', duration: o.duration ?? d(3), ease: o.ease ?? E.io, stagger: o.stagger ?? stag(2) });
  },
  grow(t, o = {}) {
    const ax = o.axis === 'y' ? 'scaleY' : 'scaleX';
    return g().from(t, { [ax]: 0, transformOrigin: o.axis === 'y' ? 'center bottom' : 'left center', duration: o.duration ?? d(3), ease: o.ease ?? E.out, stagger: o.stagger ?? stag(1.5) });
  },
  /** SVG strokes drawing in (DrawSVGPlugin) */
  draw(t, o = {}) {
    if (!window.DrawSVGPlugin) return M.fade(t, o);
    return g().from(t, { drawSVG: o.from ?? '0%', duration: o.duration ?? d(4), ease: o.ease ?? E.io, stagger: o.stagger ?? stag(2) });
  },
  /** count a number up, keeping the element's own formatting (1,284 · 37% · −75<small>%</small>).
      Only the text node that holds the number is rewritten; sibling markup is left alone. */
  count(el, o = {}) {
    pristine(el);
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.data)) || null;
    const text = (o.text ?? (node ? node.data : el.textContent)).trim();
    const m = text.match(/-?[\d.,]+/);
    if (!m) return M.rise(el, o);
    const raw = m[0]; const decimals = (raw.split('.')[1] || '').length; const comma = raw.includes(',');
    const to = parseFloat(raw.replace(/,/g, '')); const from = o.from ?? 0;
    const pre = text.slice(0, m.index), post = text.slice(m.index + raw.length);
    const fmt = (v) => { let s = v.toFixed(decimals); if (comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals }); return pre + s + post; };
    const write = (s) => { if (node) node.data = s; else el.textContent = s; };
    const original = node ? node.data : null;
    const p = { v: from }; write(fmt(from));
    return g().to(p, { v: to, duration: o.duration ?? d(4), ease: o.ease ?? E.out, delay: o.delay || 0, onUpdate: () => write(fmt(p.v)), onComplete: () => write(o.text != null ? text : node ? original : text) });   // an explicit target wins
  },
  /** machine-readable text resolving: labels, file names, skill names */
  scramble(el, o = {}) {
    pristine(el);
    const text = o.text ?? el.textContent;
    if (!window.ScrambleTextPlugin || still()) return g().set(el, { textContent: text });
    return g().fromTo(el, { textContent: '' }, { duration: o.duration ?? d(3), ease: 'none', scrambleText: { text, chars: o.chars ?? '01/·—<>:', revealDelay: 0.25, speed: 0.6 } });
  },
  /** type a line out, character by character, at a slightly uneven rhythm */
  type(el, o = {}) {
    pristine(el);
    const full = el.textContent; const r = rng(o.seed ?? full.length);
    const tl = g().timeline(); el.textContent = '';
    const n = full.length; let t = 0;
    for (let i = 1; i <= n; i++) { t += (o.cps ? 1 / o.cps : 0.018) * (0.5 + r()) * ms(); const s = full.slice(0, i); tl.call(() => { el.textContent = s; }, null, t); }
    tl.call(() => { el.textContent = full; }, null, t + 0.001);
    return tl;
  },
  /** run an agent terminal: the command types, each step prints, the result lands.
      Every line is an explicit fromTo, so no line can end up animating hidden → hidden.
      o.speed (data-speed) runs the whole thing faster: the lines land in the same order
      and stay just as readable, the wait before you can talk over it is shorter. */
  term(term, o = {}) {
    const lines = [...term.querySelectorAll('.term__l')];
    const tl = g().timeline();
    const caret = document.createElement('span'); caret.className = 'term__caret';
    lines.forEach((l, i) => {
      const k = l.dataset.k;
      const at = i === 0 ? 0 : `>+${(k === 'ok' ? 0.18 : 0.12 + (i % 3) * 0.09) * ms()}`;
      if (k === 'cmd') { tl.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: d(1) * 0.3, immediateRender: true }, at); tl.add(M.type(l, { cps: 48 }), '<'); }
      else if (k === 'ok') { tl.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: d(1) * 0.3, immediateRender: true }, at); tl.add(M.scramble(l, { duration: d(2) }), '<'); }
      else tl.fromTo(l, { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: d(1), ease: E.out, immediateRender: true }, at);
    });
    // the caret blinks in CSS (components.css, .term__caret): an infinite loop inside this
    // timeline would make the whole entry infinite, so it would never read as settled and a
    // press of → would freeze it wherever it was (CONTRACT §16.6)
    tl.call(() => lines.at(-1)?.append(caret), null, '>');
    return o.speed > 0 ? tl.timeScale(o.speed) : tl;
  },
  /** stack of numbers rolling like an odometer; the previous values ghost above */
  roll(el, o = {}) {
    pristine(el);
    const values = (o.values || el.dataset.values || '').split('|').filter(Boolean);
    if (!values.length) return M.count(el, o);
    el.innerHTML = values.map((v, i) => `<span class="roll__v" style="--i:${i}">${v}</span>`).join('');
    const vs = [...el.children];
    const tl = g().timeline();
    vs.forEach((v, i) => {
      tl.from(v, { yPercent: 100, autoAlpha: 0, duration: d(2), ease: E.out }, i * 0.28 * ms());
      if (i < vs.length - 1) tl.to(v, { yPercent: -92 * (vs.length - 1 - i) / (vs.length - 1) , opacity: 0.18 + 0.25 * i / vs.length, duration: d(2), ease: E.io }, (i + 1) * 0.28 * ms());
    });
    return tl;
  },
  /** ELSEWHERE · the .els component (kit/components.css): the same move, in
      other projects. One column is revealed in the order it is written, so a
      column may put its figure above its line (the consequence last) or add
      story lines (.els__line): the client mark, a label, the words that were
      there and the strike through them, the words I put in their place, the
      figure. Parts that are not in the markup are skipped.

      Pass the `.els` to run every column in sequence (data-a="elsewhere"), or
      one `.els__c` to run that project alone (data-a="elsewhere" data-beat="2"
      on each column: one project per press of →). */
  elsewhere(el, o = {}) {
    if (!el) return g().timeline();
    if (el.matches('.els')) {
      const tl = g().timeline();
      // 0.28 s between columns (was 0.5): three columns then read as settled inside the 2 s entry rule
      [...el.querySelectorAll('.els__c')].forEach((c, i) => tl.add(M.elsewhere(c, o), i * (o.gap ?? 0.28) * ms()));
      return tl;
    }
    const tl = g().timeline();
    const parts = [...el.children].filter((c) => !c.matches('.more-cue, .notes, script, template'));
    let t = 0;
    for (const part of parts) {
      if (part.matches('.els__before')) {
        tl.add(M.rise(part), t * ms()); t += 0.32;
        const strike = part.querySelector('.els__strike');
        if (strike) {
          tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: o.duration ?? d(2), ease: E.io, transformOrigin: 'left center' }, t * ms());
          tl.to(part.firstElementChild || part, { opacity: 0.55, duration: d(2), ease: E.io }, (t + 0.18) * ms());
          t += 0.42;
        }
      } else if (part.matches('.els__after')) {
        tl.fromTo(part,
          { autoAlpha: 0, y: num('--rise'), filter: `blur(${num('--blur-in')}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: d(3), ease: E.out, clearProps: 'filter' }, t * ms());
        t += 0.22;
      } else {
        tl.add(M.rise(part), t * ms());
        t += part.matches('.els__logo, .els__who, .els__k') ? 0.09 : part.matches('.els__line') ? 0.14 : 0.22;
      }
    }
    return tl;
  },

  /** GSAP Flip: capture, change the layout, animate the difference */
  flip(targets, change, o = {}) {
    const F = window.Flip; if (!F || motionScale() === 0) { change(); return g().timeline(); }   // motion off: land in the new layout
    const state = F.getState(targets, { props: o.props || 'opacity,backgroundColor,color' });
    change();
    return F.from(state, { duration: o.duration ?? d(3), ease: o.ease ?? E.io, stagger: o.stagger ?? 0, absolute: o.absolute ?? false, nested: true, scale: o.scale ?? false, onEnter: o.onEnter, onLeave: o.onLeave });
  },
};

/* ── geometry helpers for charts and generative pieces ──────────────────── */
/** Catmull-Rom through points → a smooth cubic Bézier path string */
export function smooth(pts, tension = 0.5, closed = false) {
  if (pts.length < 2) return '';
  const P = closed ? [pts.at(-1), ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts.at(-1)];
  let dStr = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const t = tension / 3;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    dStr += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? dStr + 'Z' : dStr;
}
export const poly = (pts) => 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const map = (v, a, b, c, e) => c + ((v - a) / (b - a)) * (e - c);

/* ── WCAG contrast, computed live from the deck's own tokens ────────────── */
export function contrast(a, b) {
  const L = (c) => {
    const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const [r, gg, bb] = ctx.getImageData(0, 0, 1, 1).data;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(bb);
  };
  const [x, y] = [L(a), L(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** resolve any CSS colour expression (incl. var() and color-mix) to rgb() */
export function resolveColor(expr, el = root) {
  const probe = document.createElement('i'); probe.style.color = expr; probe.style.display = 'none';
  el.appendChild(probe); const c = getComputedStyle(probe).color; probe.remove(); return c;
}

/* ══════════════════════════════════════════════════════════════════════════
   AUTO · declarative choreography from data-a attributes

     data-a="rise | fade | focus | lines | words | chars | mask | mask-up |
             rule | grow | grow-y | draw | count | scramble | roll | stagger |
             term | pop | elsewhere | links | orch"
     data-at="0.4"        absolute start (s) within its beat, else sequenced
     data-beat="2"        wait for the 2nd press of → (0/omitted = on enter)
     data-d="3"           duration step override (1–4)

   Returns { enter: Timeline, beats: Timeline[], ambient }. Timelines are built paused
   and in full at entry, so every held element is already hidden.
   ════════════════════════════════════════════════════════════════════════ */
const PRIM = {
  rise: (el) => M.rise(el), fade: (el) => M.fade(el), focus: (el) => M.focus(el),
  // openers carry the most lines and chips of any slide: they run tighter so the entry settles inside 2 s
  lines: (el) => M.lines(el, { ...(el.matches('.opener__vision') ? { stagger: stag(1) } : {}), ...(el.dataset.d ? { duration: d(+el.dataset.d) } : {}) }), words: (el) => M.words(el), chars: (el) => M.chars(el),
  mask: (el) => M.mask(el, { from: 'left' }), 'mask-up': (el) => M.mask(el, { from: 'up' }),
  rule: (el) => M.rule(el), grow: (el) => M.grow(el), 'grow-y': (el) => M.grow(el, { axis: 'y' }),
  draw: (el) => M.draw(el.matches('path,line,polyline,circle,rect,ellipse') ? el : el.querySelectorAll('path,line,polyline,circle,rect,ellipse'),
    el.dataset.d ? { duration: d(+el.dataset.d) } : {}),
  count: (el) => M.count(el), scramble: (el) => M.scramble(el), roll: (el) => M.roll(el),
  stagger: (el) => M.rise(el.children, { stagger: stag(+el.dataset.s || (el.matches('.opener__methods') ? 0.8 : 1.6)) }),
  term: (el) => M.term(el, { speed: +el.dataset.speed || 1 }), elsewhere: (el) => M.elsewhere(el),
  pop: (el) => g().from(el, { scale: 0.86, autoAlpha: 0, duration: d(2), ease: E.out, transformOrigin: 'center' }),
  links: (el) => drawLinks(el, { each: 0.36 * ms(), gap: 0.12 * ms() }),
};
/** A kit module can add a primitive of its own before boot (kit/flowmap.js adds "flow", which
    choreographs a whole diagram as one timeline). It never replaces a built-in. */
export function definePrim(name, fn) { if (!PRIM[name]) PRIM[name] = fn; }

/**
 * auto(root) → { enter, beats, ambient }
 * root is a slide, or an overlay panel (the engine runs the same pass on a detail).
 * `ambient` lists functions that start ambient loops: the engine calls them once the
 * entry has finished, never inside it (CONTRACT §16.6).
 */
export function auto(root) {
  const els = [...root.querySelectorAll('[data-a]')].filter((el) => !el.closest('[data-own]'));
  const groups = new Map();
  const ambient = [];
  const push = (b, item) => { if (!groups.has(b)) groups.set(b, []); groups.get(b).push(item); };
  for (const el of els) {
    const b = parseInt(el.dataset.beat || '0', 10);
    if (el.dataset.a === 'orch') {                    // one element, one entry and a re-wire per beat
      const o = orchestrate(el, { T: (s) => s * ms() });
      push(b, { el, fn: () => o.enter });
      o.beats.forEach(([n, tl]) => push(n, { el, fn: () => tl, at: 0, still: true }));
      if (o.ambient) ambient.push(o.ambient);
      continue;
    }
    push(b, { el, fn: PRIM[el.dataset.a] });
  }
  /* held: a group that waits for a press. The element itself is hidden until then, not only
     the things inside it, so a rule or a frame of its own cannot paint before its beat. */
  const build = (list, held = false) => {
    const tl = g().timeline({ paused: true });
    let cursor = 0;
    for (const { el, fn, at: fixed, still: keep } of list) {
      const kind = el.dataset.a;
      if (!fn) { console.warn('[motion] unknown data-a', kind, el); continue; }
      const at = fixed != null ? fixed : el.dataset.at != null ? parseFloat(el.dataset.at) * ms() : cursor;
      // held: hidden by a class, not by a tween. A `from` tween reads the element's current
      // state as its END state, so hiding it with autoAlpha here would make it end invisible.
      if (held) { el.classList.add('is-held'); tl.call(() => el.classList.remove('is-held'), null, at); }
      tl.add(fn(el), at);
      if (!keep) cursor = at + (kind === 'words' || kind === 'lines' ? 0.18 : 0.1) * ms();
    }
    return tl;
  };
  const beatsN = Math.max(0, ...groups.keys());
  const enter = build(groups.get(0) || []);
  const beats = [];
  for (let b = 1; b <= beatsN; b++) beats.push(build(groups.get(b) || [], true));
  return { enter, beats, ambient };
}
