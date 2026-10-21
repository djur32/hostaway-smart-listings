/* ============================================================================
   THREAD · one continuous line that runs through the whole talk.

   It is the process, drawn: a single stroke that lifts into a different shape
   at each stage (a funnel for discovery, a spiral for research, three petals
   for concept, a square spiral for the system, a settling wave for test, a
   rising curve for measure) and lies down again between them. A slide asks
   for a shape with data-thread="name"; slides without one let it go.

   In studio it is an ink hairline with an amber point; in lumen a thin quiet
   line with a small sky point. Both are flat (CONTRACT §11): no bloom, no
   halo, no ring around the point.

   Shapes are generated from maths at load, in canvas coordinates (1920×1080),
   and any slide module may add its own with Thread.define(name, d).
   ========================================================================= */

import { smooth, poly, d as dur, E } from './motion.js';

const W = 1920, H = 1080;
const shapes = new Map();
const TAU = Math.PI * 2;

/* ── the generators ─────────────────────────────────────────────────────── */
const gen = {
  /** the resting line, low on the canvas */
  rest: () => poly([[128, 1000], [960, 1000], [1792, 1000]]),

  /** one sweep across the title with a single loop in it */
  title: () => {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160; const x = 128 + t * 1664;
      const loop = Math.exp(-((t - 0.64) ** 2) / 0.004);
      const y = 760 - 60 * Math.sin(t * Math.PI) - loop * 150 * Math.sin((t - 0.64) * 40);
      const xx = x - loop * 120 * Math.cos((t - 0.64) * 40) + loop * 0;
      pts.push([xx, y]);
    }
    return smooth(pts, 0.5);
  },

  /** a lemniscate: the loop the agents run, with me at both ends */
  loop: (cx = 1360, cy = 540, a = 380) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) { const t = (i / 200) * TAU; const s = Math.sin(t), c = Math.cos(t); const k = 1 + s * s; pts.push([cx + (a * c) / k, cy + (a * s * c) / k * 1.15]); }
    return smooth(pts, 0.5);
  },

  /** DISCOVERY · a funnel drawn in one stroke, each pass narrower */
  discovery: () => {
    const rows = 7, top = 230, gapY = 92, cx = 1400, w0 = 760, w1 = 150; const pts = [];
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1); const w = w0 + (w1 - w0) * Math.pow(t, 0.8); const y = top + r * gapY;
      const [a, b] = r % 2 === 0 ? [cx - w / 2, cx + w / 2] : [cx + w / 2, cx - w / 2];
      pts.push([a, y], [b, y]);
    }
    let dd = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i], q = pts[i - 1];
      if (i % 2 === 1) dd += ` L${p[0].toFixed(1)},${p[1]}`;
      else { const dir = p[0] > q[0] ? 1 : -1; const r = gapY / 2; dd += ` C${q[0] + dir * -r * 0},${q[1] + r * 0.2} ${p[0] + dir * 0},${p[1] - r * 0.2} ${p[0].toFixed(1)},${p[1]}`; }
    }
    return dd;
  },

  /** RESEARCH · an Archimedean spiral inward: listening, then going deeper */
  research: (cx = 1390, cy = 530, r0 = 390, turns = 4.6) => {
    const pts = []; const n = 260;
    for (let i = 0; i <= n; i++) { const t = i / n; const th = -Math.PI / 2 + t * turns * TAU; const r = r0 * (1 - t) ** 1.05 + 6; pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
    return smooth(pts, 0.5);
  },

  /** CONCEPT · three petals from one point: three options, one idea */
  concept: (cx = 1390, cy = 540, R = 380) => {
    const pts = []; const n = 240;
    for (let i = 0; i <= n; i++) { const th = (i / n) * Math.PI; const r = R * Math.cos(3 * th); pts.push([cx + r * Math.cos(th - Math.PI / 2), cy + r * Math.sin(th - Math.PI / 2)]); }
    return smooth(pts, 0.5, true);
  },

  /** DESIGN · a square spiral: tokens, atoms, molecules, blocks */
  design: (cx = 1390, cy = 540, s0 = 700, steps = 13) => {
    const pts = []; let x = cx - s0 / 2, y = cy - s0 / 2; let len = s0; const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    pts.push([x, y]);
    for (let i = 0; i < steps; i++) { const [dx, dy] = dirs[i % 4]; x += dx * len; y += dy * len; pts.push([x, y]); if (i % 2 === 1 || i === 0) len *= 0.78; }
    return poly(pts);
  },

  /** TEST · a damped wave that settles into a clear signal */
  test: (x0 = 1000, x1 = 1792, cy = 540, A = 230) => {
    const pts = []; const n = 220;
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + t * (x1 - x0), cy - A * Math.exp(-3.4 * t) * Math.sin(t * TAU * 5.2)]); }
    return smooth(pts, 0.5);
  },

  /** MEASURE · the ramp: a quiet start, a step, a steady run-rate */
  measure: (x0 = 1000, x1 = 1792, y0 = 860, y1 = 250) => {
    const pts = []; const n = 120;
    for (let i = 0; i <= n; i++) { const t = i / n; const s = 1 / (1 + Math.exp(-12 * (t - 0.52))); const wob = Math.sin(t * 22) * 8 * (1 - t); pts.push([x0 + t * (x1 - x0), y0 + (y1 - y0) * s + wob]); }
    return smooth(pts, 0.5);
  },

  /** CLOSE · the line lies down again, whole */
  close: () => poly([[128, 820], [960, 820], [1792, 820]]),
};

for (const [k, f] of Object.entries(gen)) shapes.set(k, { d: f(), o: 1 });

/* ── the live element ───────────────────────────────────────────────────── */
let svg, line, ghost, dot, current = null;

export function mountThread(stage) {
  const NS = 'http://www.w3.org/2000/svg';
  svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'thread'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs>
      <linearGradient id="thread-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" class="thread__stop-a"/><stop offset=".55" class="thread__stop-b"/><stop offset="1" class="thread__stop-c"/>
      </linearGradient>
    </defs>
    <path class="thread__ghost" d=""/>
    <path class="thread__line" d="${shapes.get('rest').d}"/>
    <circle class="thread__dot" r="6" cx="-99" cy="-99"/>`;
  stage.insertBefore(svg, stage.firstChild.nextSibling);
  line = svg.querySelector('.thread__line'); ghost = svg.querySelector('.thread__ghost');
  dot = svg.querySelector('.thread__dot');
  window.gsap.set([line, dot], { autoAlpha: 0 });
  return svg;
}

export function defineThread(name, d, o = 1) { shapes.set(name, { d: typeof d === 'function' ? d() : d, o }); }
export const threadShapes = () => [...shapes.keys()];

/** Move the line to a named shape (or away with null). Returns a timeline. */
export function threadTo(name, { opacity } = {}) {
  const g = window.gsap; const tl = g.timeline();
  if (!line) return tl;
  const target = name ? shapes.get(name) : null;
  if (name && !target) console.warn('[thread] unknown shape', name);
  const o = opacity ?? target?.o ?? 1;

  if (!target) {                                  // let it go
    if (current) {
      tl.to(line, { autoAlpha: 0, duration: dur(1) * 0.7, ease: E.in }, 0)
        .to(line, { drawSVG: '100% 100%', duration: dur(1), ease: E.in }, 0)
        .to(dot, { autoAlpha: 0, duration: dur(1) * 0.7 }, 0);
    }
    current = null; return tl;
  }
  if (!current) {                                 // arrive: draw in from nothing
    line.setAttribute('d', target.d);             // set before DrawSVG measures the length
    tl.fromTo(line, { autoAlpha: o, drawSVG: '0% 0%' }, { autoAlpha: o, drawSVG: '0% 100%', duration: dur(4) * 1.2, ease: E.io, immediateRender: true });
  } else if (current !== name) {                  // travel: morph shape to shape
    tl.to(line, { morphSVG: { shape: target.d, type: 'rotational' }, autoAlpha: o, drawSVG: '0% 100%', duration: dur(4), ease: E.io });
  }
  // the point rides the finished line to its end
  if (window.MotionPathPlugin) {
    tl.set(dot, { autoAlpha: 1, attr: { cx: 0, cy: 0 } }, '>-0.4')
      .fromTo(dot, { motionPath: { path: target.d, start: 0, end: 0 } }, { motionPath: { path: target.d, start: 0, end: 1 }, duration: dur(4), ease: E.soft }, '<');
  }
  current = name; return tl;
}
export const threadNow = () => current;
