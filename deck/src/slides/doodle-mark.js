/* ============================================================================
   doodle-mark · emphasis without dimming (3 Oct).

   Antonio: "Don't ever dim an element as a tool… a drawing where you draw the line
   and then undraw it, or maybe you make it bigger and smaller… really small."

   So a beat that moves focus never fades the rest. It draws a hand-made mark around
   (loop) or under (under) the thing in focus, in Hospitable's raspberry or purple, the
   way hospitable.com circles a word, and undraws it when focus moves on. Everything
   else stays exactly as readable as it was.

     const p = markOn(el, { shape: 'loop', tone: 'raspberry', pad: 10, seed: 4 });
     drawIn(tl, p, at)    the stroke draws along its own path (0.45 s at motion 1)
     drawOut(tl, p, at)   it erases from where it started, chasing its own tail
     markInSvg(svg, box, opts)   the same mark inside a drawn chart (box in its user units)

   Geometry is measured when the slide enters (the stage is a fixed 1920 × 1080, so it
   holds), and the path is built in real pixels so the stroke keeps one weight. Marks
   are born hidden; the beats draw them; motion off lands on the beats' end state.
   Tokens only: the stroke is a var() from ds/tokens.css.
   ========================================================================= */
import { E, motionScale, rng, smooth } from '../kit/motion.js';

const NS = 'http://www.w3.org/2000/svg';
const TONE = { raspberry: 'var(--color-primary-500)', purple: 'var(--color-secondary-500)' };
/** hidden: the dash sits just off the path, before it (draw) or after it (undraw) */
const OFF = 1.05;
const K = () => motionScale() || 1;
const bd = (n) => Math.max(n * K(), 0.002);

/** a loose loop around a w × h box: a rounded rectangle that keeps `pad` px off the box on
    every side (corners too, so it never cuts into the content), a little wobble, a little
    tilt, and an overshoot that passes its own start a few px outside, as a hand would */
export function loopPath(w, h, { pad = 10, seed = 3, over = 0.3, radius } = {}) {
  const r = rng(seed);
  const A = w / 2 + pad, B = h / 2 + pad, R = Math.min(radius ?? pad * 3, A, B);
  const pts = [];
  // a run along one side, a point every ~110 px, bowing gently outwards the way a hand does
  // (never more than 6 px, and less on a thin box, so it stays off the neighbours)
  const bowOf = (horiz) => Math.min(6, (horiz ? B : A) * 0.14) * (r() * 0.6 + 0.7);
  const side = (x0, y0, x1, y1, bow, from = 0, to = 1) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 110));
    const horiz = y0 === y1, nx = horiz ? 0 : Math.sign(x0), ny = horiz ? Math.sign(y0) : 0;
    const at = (f) => [x0 + (x1 - x0) * f + nx * bow * Math.sin(Math.PI * f), y0 + (y1 - y0) * f + ny * bow * Math.sin(Math.PI * f)];
    if (from > 0) pts.push(at(from));
    for (let i = 1; i < n; i++) { const f = i / n; if (f > from + 0.02 && f < to - 0.02) pts.push(at(f)); }
    if (to < 1) pts.push(at(to));
  };
  const arc = (cx, cy, a0) => { for (let k = 0; k <= 2; k++) { const t = a0 + (k * Math.PI) / 4; pts.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); } };
  // clockwise on screen, from the top edge a little left of centre, once round and on past the start
  const tb = bowOf(true), run = 2 * (A - R) || 1;
  const f0 = Math.max(0.05, 0.5 - (A * 0.3) / run), f1 = Math.min(0.95, f0 + ((2 * A) * over) / run);
  side(-A + R, -B, A - R, -B, tb, f0, 1);
  arc(A - R, -B + R, -Math.PI / 2);  side(A, -B + R, A, B - R, bowOf(false));
  arc(A - R, B - R, 0);              side(A - R, B, -A + R, B, bowOf(true));
  arc(-A + R, B - R, Math.PI / 2);   side(-A, B - R, -A, -B + R, bowOf(false));
  arc(-A + R, -B + R, Math.PI);      side(-A + R, -B, A - R, -B, tb, 0, f1);
  // a hand's slight tilt, never more than ~2 px at the far ends, so a wide loop stays off its neighbours
  const tilt = (r() - 0.5) * 2 * Math.min((0.6 * Math.PI) / 180, 2 / Math.max(A, B));
  const n = pts.length - 1;
  return smooth(pts.map(([x, y], i) => {
    const d = Math.hypot(x, y) || 1, grow = 5 * (i / n) + (r() - 0.5) * 2.4;   // a slow drift outwards: the end never lands on the start
    const gx = x + (x / d) * grow, gy = y + (y / d) * grow;
    return [w / 2 + gx * Math.cos(tilt) - gy * Math.sin(tilt), h / 2 + gx * Math.sin(tilt) + gy * Math.cos(tilt)];
  }), 0.5, false);
}

/** a quick underline for a w-wide run of text, sitting `gap` px below its box (height h) */
export function underPath(w, h, { gap = 6, seed = 5 } = {}) {
  const r = rng(seed);
  const y0 = h + gap, N = 6, pts = [];
  for (let i = 0; i <= N; i++) {
    const x = -6 + ((w + 14) * i) / N;
    const y = y0 + Math.sin((i / N) * Math.PI) * 2.5 - (i / N) * 3 + (r() - 0.5) * 1.6;
    pts.push([x, y]);
  }
  return smooth(pts, 0.5, false);
}

function pathEl(d, tone, width) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('pathLength', '1');
  p.setAttribute('class', 'mk__p');
  p.style.cssText = `fill: none; stroke: ${TONE[tone] || TONE.raspberry}; stroke-width: ${width}px; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 2; stroke-dashoffset: ${OFF}`;
  return p;
}

/** a mark on an HTML element: an SVG laid over it (overflow visible, never takes a click).
    Re-entering the slide rebuilds it, so it always matches the element's current box. */
export function markOn(el, { shape = 'loop', tone = 'raspberry', width = 4.5, pad, seed, gap, radius } = {}) {
  if (!el) return null;
  el.querySelector(':scope > svg.mk')?.remove();
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const w = el.offsetWidth, h = el.offsetHeight;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mk');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText = `position: absolute; left: 0; top: 0; width: ${w}px; height: ${h}px; overflow: visible; pointer-events: none; z-index: 2`;
  const d = shape === 'under' ? underPath(w, h, { gap, seed }) : loopPath(w, h, { pad, seed, radius });
  const p = pathEl(d, tone, width);
  svg.append(p);
  el.append(svg);
  return p;
}

/** a mark inside an SVG (a drawn chart): box = { x, y, width, height } in its user units */
export function markInSvg(svg, box, { shape = 'loop', tone = 'raspberry', width = 4.5, pad, seed, gap } = {}) {
  if (!svg || !box) return null;
  let g = svg.querySelector(':scope > g.mk');
  if (!g) { g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'mk'); g.setAttribute('aria-hidden', 'true'); svg.append(g); }
  const d = shape === 'under' ? underPath(box.width, box.height, { gap, seed }) : loopPath(box.width, box.height, { pad, seed });
  const p = pathEl(d, tone, width);
  p.setAttribute('transform', `translate(${box.x} ${box.y})`);
  g.append(p);
  return p;
}

/** draw a mark in along its path */
export function drawIn(tl, p, at = 0, dur = 0.5) {
  if (p) tl.fromTo(p, { strokeDashoffset: OFF }, { strokeDashoffset: 0, duration: bd(dur), ease: E.io, immediateRender: false }, at);
  return tl;
}
/** undraw it: it erases from where it began, following the hand that drew it */
export function drawOut(tl, p, at = 0, dur = 0.4) {
  if (p) tl.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -OFF, duration: bd(dur), ease: E.io, immediateRender: false }, at);
  return tl;
}
