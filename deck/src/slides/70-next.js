/* ============================================================================
   70 · SYSTEMS AND HANDOFF · the service map.

   The service map: a visual that shows how this design affects other areas and the product at large.

     nx-roadmap   Smart Listings and Shared at the centre, the product areas on three
                  rings around them: Core (in the prototype), Extends, Reach. Each wire says
                  what flows (facts, tips, goals, results, receipts) and is drawn in its
                  status: solid, dashed raspberry, dotted. The four lines of work the build
                  implies but doesn't do sit on the Extends ring with a dashed raspberry outline.

   The words live in the HTML (70-next.html): nodes are .nx-n[data-node] with data-ring and
   data-y (and data-w), wires are .nx-e[data-e="from>to"] whose text is the wire's label.
   This module only places them: a node's x is read off its ring (an ellipse around the hub),
   and every wire is computed from the boxes. It runs at import, before the engine boots, so
   the geometry is part of the HTML the engine snapshots, and motion off, print and the static
   render (qa/svcmap/render.mjs) all show the finished map.

   Motion (enter): the hub pops, then each ring as a ladder: its band draws, its wires draw from
   their source, a node pops (at full colour, from a little smaller) as its wire reaches it, and
   the labels pop as the wire passes. Nothing fades and nothing is dimmed. Settles in about 2 s.
   Source: research/systems/product-map.md (flows 1 to 18).
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { motionScale } from '../kit/motion.js';

const K = () => motionScale() || 1;
const NS = 'http://www.w3.org/2000/svg';
const f1 = (v) => +v.toFixed(1);

/* ── geometry ──────────────────────────────────────────────────────────── */
const GEO = {
  dx: 56,                                   // the drawing sits in the middle of its 1728 px canvas
  C: [150, 299],                            // the rings' centre: the hub's middle
  ring: { 1: [560, 422], 2: [990, 616], 3: [1370, 880] },   // ellipse radii [a, b]
  h: { 1: 52, 2: 52, 3: 48 },               // node heights per ring
  hub: {                                    // the hub's parts, as boxes [x, y, w, h] (before dx)
    sl: [0, 132, 300, 104], shared: [0, 252, 300, 212], lb: [16, 296, 268, 68], hub: [16, 380, 268, 68],   // one 16px inset inside Shared, the cards as tall as they are wide allows
  },
};
const ringX = (r, y) => { const [a, b] = GEO.ring[r]; const d = (y - GEO.C[1]) / b; return GEO.C[0] + a * Math.sqrt(Math.max(0, 1 - d * d)); };

function boxes(fig) {
  const B = new Map();
  for (const [id, [x, y, w, h]] of Object.entries(GEO.hub)) B.set(id, { x: x + GEO.dx, y, w, h, ring: 0 });
  fig.querySelectorAll('.nx-n[data-ring]').forEach((el) => {
    const r = +el.dataset.ring, y = +el.dataset.y, w = +el.dataset.w || 260, h = GEO.h[r];
    B.set(el.dataset.node, { x: ringX(r, y) + GEO.dx - w / 2, y: y - h / 2, w, h, ring: r });
  });
  return B;
}
const cx = (b) => b.x + b.w / 2, cy = (b) => b.y + b.h / 2;

/* a wire: a cubic between facing sides, horizontal at both ends; or, with data-via="x,y", a straight
   run to the corner, a rounded turn and a straight drop into the target's top (or bottom) */
function wire(a, b, e) {
  const y0 = e.dataset.y0 != null ? +e.dataset.y0 : cy(a), y1 = e.dataset.y1 != null ? +e.dataset.y1 : cy(b);
  const right = cx(b) > cx(a);
  const p0 = [right ? a.x + a.w : a.x, y0];
  if (e.dataset.via) {
    const [vx0, vy] = e.dataset.via.split(',').map(Number), vx = vx0 + GEO.dx;
    const down = cy(b) > vy, p1 = [vx, down ? b.y : b.y + b.h], r = 22, s = right ? -1 : 1;
    const pts = [p0, [vx + s * r, vy], [vx, vy + (down ? r : -r)], p1];
    const d = `M${p0.map(f1)} L${f1(vx + s * r)},${f1(vy)} Q${f1(vx)},${f1(vy)} ${f1(vx)},${f1(vy + (down ? r : -r))} L${f1(p1[0])},${f1(p1[1] - (down ? 5 : -5))}`;
    return { d, pts, end: [p1[0], p1[1] - (down ? 5 : -5)], dir: [0, down ? 1 : -1] };
  }
  const p1 = [right ? b.x - 5 : b.x + b.w + 5, y1];                 // stop short of the card
  const k = Math.abs(p1[0] - p0[0]) * 0.5, s = right ? 1 : -1;
  const c1 = [p0[0] + s * k, p0[1]], c2 = [p1[0] - s * k, p1[1]];
  const pts = []; for (let i = 0; i <= 48; i++) { const t = i / 48, u = 1 - t;
    pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]]); }
  return { d: `M${p0.map(f1)} C${c1.map(f1)} ${c2.map(f1)} ${p1.map(f1)}`, pts, end: p1, dir: [s, 0] };
}
const dist = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
function pointAt(pts, t) {
  let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
  let g = L * t;
  for (let i = 1; i < pts.length; i++) { const s = dist(pts[i - 1], pts[i]); if (g <= s) { const k = s ? g / s : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; } g -= s; }
  return pts[pts.length - 1];
}
/** the chevron at a wire's end, drawn in the same stroke */
function head([x, y], [ux, uy], hl = 11) {
  const bx = x - ux * hl, by = y - uy * hl, wx = -uy * hl * 0.62, wy = ux * hl * 0.62;
  return `M${f1(bx + wx)},${f1(by + wy)} L${f1(x)},${f1(y)} L${f1(bx - wx)},${f1(by - wy)}`;
}
const svg = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };

let uid = 0;
export function drawMap(fig) {
  if (!fig || fig.dataset.drawn) return;
  const id = `nxm${++uid}`;
  const W = +fig.dataset.w || 1728, H = +fig.dataset.h || 596;
  const B = boxes(fig);
  // the hub's parts and the ring nodes, placed
  fig.querySelectorAll('[data-node]').forEach((el) => {
    const b = B.get(el.dataset.node); if (!b) return;
    Object.assign(el.style, { left: `${f1(b.x)}px`, top: `${f1(b.y)}px`, width: `${b.w}px`, height: `${b.h}px` });
  });
  // the rings: a soft band each, and its name at its foot
  const bands = svg('svg', { class: 'nx-map__bands', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
  for (const r of [1, 2, 3]) {
    const [a, b] = GEO.ring[r];
    // a band runs from just above its ring's first card to just under its name, so it reads as a track
    const ys = [...fig.querySelectorAll(`.nx-n[data-ring="${r}"]`)].map((n) => +n.dataset.y);
    const y0 = Math.max(0, Math.min(...ys) - GEO.h[r] / 2 - 26), y1 = Math.min(H, (+fig.querySelector(`.nx-ring[data-ring="${r}"]`)?.dataset.y || H - 18) + 18);
    const top = [ringX(r, y0) + GEO.dx, y0], bot = [ringX(r, y1) + GEO.dx, y1];
    bands.append(svg('path', { class: 'nx-band', 'data-ring': r, d: `M${top.map(f1)} A${a},${b} 0 0 1 ${bot.map(f1)}` }));
  }
  fig.prepend(bands);
  fig.querySelectorAll('.nx-ring[data-ring]').forEach((el) => {
    const r = +el.dataset.ring, y = +el.dataset.y || H - 26;
    Object.assign(el.style, { left: `${f1(ringX(r, y) + GEO.dx)}px`, top: `${y}px` });
  });
  // the wires, under the cards; their labels over everything
  const wires = svg('svg', { class: 'nx-map__wires', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
  const defs = svg('defs'); wires.append(defs);
  fig.querySelectorAll('.nx-e[data-e]').forEach((e, i) => {
    const [from, to] = e.dataset.e.split('>'); const a = B.get(from), b = B.get(to);
    if (!a || !b) { console.warn('[nx-map] no node for', e.dataset.e); return; }
    const g = wire(a, b, e), st = e.dataset.st || 'built';
    const d = `${g.d} ${head(g.end, g.dir)}`;
    const ring = Math.max(a.ring, b.ring);
    const grp = svg('g', { class: `nx-w is-${st}`, 'data-e': e.dataset.e, 'data-ring': ring });
    if (st === 'built') grp.append(svg('path', { class: 'nx-w__p', d }));
    else {                                   // a dashed or dotted wire is revealed by a solid mask that draws;
      const m = svg('mask', { id: `${id}m${i}`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H });   // its head sits outside the mask
      m.append(svg('path', { class: 'nx-w__reveal', d: g.d })); defs.append(m);
      const line = svg('g', { mask: `url(#${id}m${i})` }); line.append(svg('path', { class: 'nx-w__p', d: g.d }));
      grp.append(line, svg('path', { class: 'nx-w__p is-head', d: head(g.end, g.dir) }));
    }
    wires.append(grp);
    if (e.textContent.trim()) {
      const at = e.dataset.lx ? [+e.dataset.lx + GEO.dx, +e.dataset.ly] : pointAt(g.pts, e.dataset.t != null ? +e.dataset.t : 0.5);
      Object.assign(e.style, { left: `${f1(at[0])}px`, top: `${f1(at[1])}px` });
    } else e.hidden = true;
    e.dataset.ring = ring;
  });
  fig.querySelector('.nx-map__bands').after(wires);
  fig.dataset.drawn = '1';
}

/** layout QA (qa/svcmap): a wire through a card, a label on a card or on another label */
export function mapIssues(fig) {
  const out = [], B = boxes(fig);
  const lab = [...fig.querySelectorAll('.nx-e:not([hidden]) > span')].map((s) => { const p = s.parentElement; const x = parseFloat(p.style.left), y = parseFloat(p.style.top); return { t: s.textContent, l: x - s.offsetWidth / 2, r: x + s.offsetWidth / 2, t0: y - s.offsetHeight / 2, b: y + s.offsetHeight / 2 }; });
  const cards = [...B.entries()].filter(([k]) => k !== 'shared').map(([k, b]) => ({ k, l: b.x, r: b.x + b.w, t0: b.y, b: b.y + b.h }));
  const hit = (p, q, m = 0) => p.l < q.r - m && q.l < p.r - m && p.t0 < q.b - m && q.t0 < p.b - m;
  cards.forEach((p, i) => cards.slice(i + 1).forEach((q) => { if (hit(p, q, -8)) out.push(`cards ${p.k} and ${q.k} closer than 8px`); }));
  lab.forEach((p) => cards.forEach((q) => { if (hit(p, q, -4)) out.push(`label "${p.t}" touches ${q.k}`); }));
  lab.forEach((p, i) => lab.slice(i + 1).forEach((q) => { if (hit(p, q, -4)) out.push(`labels "${p.t}" and "${q.t}" touch`); }));
  fig.querySelectorAll('.nx-w').forEach((g) => {
    const p = g.querySelector('.nx-w__p'); const L = p.getTotalLength(); const [f, t] = g.dataset.e.split('>');
    const seen = new Set();
    for (let s = 6; s < L - 6; s += 4) {
      const q = p.getPointAtLength(s);
      for (const c of cards) { if (c.k === f || c.k === t || seen.has(c.k)) continue; if (q.x > c.l - 6 && q.x < c.r + 6 && q.y > c.t0 - 6 && q.y < c.b + 6) { seen.add(c.k); out.push(`wire ${g.dataset.e} passes within 6px of ${c.k}`); } }
    }
  });
  return out;
}

document.querySelectorAll('.nx-map').forEach((fig) => drawMap(fig));
window.__nxMap = { drawMap, mapIssues };

/* ── motion ────────────────────────────────────────────────────────────── */
const RING_AT = { 1: 0.42, 2: 0.95, 3: 1.42 };
Deck.define('nx-roadmap', {
  enter(api) {
    const fig = api.q('.nx-map'); if (!fig) return null;
    const G = window.gsap, k = K(), tl = api.tl(), draw = !!window.DrawSVGPlugin;
    const pop = (el, at, o = 0.62) => {
      if (!el) return;
      G.set(el, { visibility: 'hidden' });
      tl.set(el, { visibility: 'visible' }, at);
      tl.fromTo(el, { scale: o }, { scale: 1, duration: 0.46 * k, ease: 'back.out(1.6)', immediateRender: false }, at);
    };
    const line = (path, at, dd) => {
      if (draw) tl.fromTo(path, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: dd, ease: 'power1.inOut', immediateRender: true }, at);
      else { G.set(path, { visibility: 'hidden' }); tl.set(path, { visibility: 'visible' }, at + dd); }
    };
    // the centre first
    ['shared', 'sl', 'lb', 'hub'].forEach((n, i) => pop(fig.querySelector(`[data-node="${n}"]`), (0.16 + i * 0.07) * k, n === 'shared' || n === 'sl' ? 0.86 : 0.7));
    // then each ring as a ladder, top to bottom
    const shown = new Set(['sl', 'shared', 'lb', 'hub']);
    for (const r of [1, 2, 3]) {
      const t0 = RING_AT[r] * k;
      fig.querySelectorAll(`.nx-band[data-ring="${r}"]`).forEach((b) => line(b, t0 - 0.1 * k, 0.55 * k));
      pop(fig.querySelector(`.nx-ring[data-ring="${r}"]`), t0, 0.7);
      const ws = [...fig.querySelectorAll(`.nx-w[data-ring="${r}"]`)]
        .map((g) => { const [f, t] = g.dataset.e.split('>'); const out = shown.has(f); const n = out ? t : f; const el = fig.querySelector(`[data-node="${n}"]`); return { g, n, el, out, y: el ? parseFloat(el.style.top) : 0 }; })
        .sort((p, q) => p.y - q.y);
      ws.forEach((w, i) => {
        const at = t0 + i * 0.065 * k, dd = 0.34 * k;
        const mk = w.g.querySelector('g[mask]');
        const path = mk ? w.g.ownerSVGElement.querySelector(`${mk.getAttribute('mask').slice(4, -1)} .nx-w__reveal`) : w.g.querySelector('.nx-w__p');
        const hd = mk ? w.g.querySelector('.is-head') : null;
        const lbl = fig.querySelector(`.nx-e[data-e="${w.g.dataset.e}"]:not([hidden])`);
        const go = w.out ? at : at + 0.12 * k;
        if (w.out) {                           // from the centre (or an inner ring) out to the node
          if (!shown.has(w.n)) { pop(w.el, at + dd * 0.82); shown.add(w.n); }
        } else if (!shown.has(w.n)) { pop(w.el, at); shown.add(w.n); }   // the node first, then what it sends inwards
        line(path, go, dd);
        if (hd) { G.set(hd, { visibility: 'hidden' }); tl.set(hd, { visibility: 'visible' }, go + dd * 0.96); }
        if (lbl) pop(lbl, at + dd * 0.55, 0.7);
      });
    }
    return tl;
  },
});

/* ── cl-thanks: the close on the brand plate. The plate settles (a slight scale), the words rise out of their
   mask, the lockup scales in, the blob and the dots scale in from nothing; the rings and strokes draw themselves
   (data-a="draw"). Nothing fades. The CSS rests on the final state, so motion off and print show the finished plate. */
Deck.define('cl-thanks', {
  enter(api) {
    const plate = api.q('.hc-brand__plate'); if (!plate) return null;
    const k = K();
    // The close is the cover in reverse. It starts as the windowed plate (the same inset as every
    // plate under the bar), grows to full screen, and then the chrome leaves (deck.css, data-chrome-late).
    const py = parseFloat(getComputedStyle(plate).getPropertyValue('--plate-y')) || 76;
    return api.tl()
      .fromTo(plate, { left: 40, right: 40, top: py, bottom: py, borderRadius: 48 }, { left: 0, right: 0, top: 0, bottom: 0, borderRadius: 0, duration: 1 * k, ease: 'expo.inOut' }, 0)
      .fromTo(api.qa('.cl-thanks__ln > span'), { yPercent: 120 }, { yPercent: 0, duration: 1 * k, ease: 'expo.out' }, 0.14 * k)
      .fromTo(api.qa('.cl-thanks__lockup'), { scale: 0 }, { scale: 1, duration: 0.6 * k, ease: 'back.out(1.7)' }, 0.6 * k)
      .fromTo(api.qa('.cl-thanks__art .hc-blob'), { scale: 0 }, { scale: 1, duration: 0.9 * k, ease: 'back.out(1.4)' }, 0.35 * k)
      .fromTo(api.qa('.cl-thanks__art .hc-dot'), { scale: 0 }, { scale: 1, duration: 0.5 * k, ease: 'back.out(2)', stagger: 0.08 * k }, 0.7 * k);
  },
});
