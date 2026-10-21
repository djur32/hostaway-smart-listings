/* ============================================================================
   GEN · a small generative toolkit, Processing-style, no dependencies.

   What it gives a slide:
     G.canvas(host)          a crisp <canvas> sized in canvas px, DPR + stage-scale aware
     G.loop(fn)              a frame loop tied to the slide: stops when it leaves
     G.noise2 / noise3       simplex noise, seeded
     G.field(...)            a flow field sampled from noise
     G.particles(...)        a particle system with a simple integrator
     G.dots(...)             a halftone dot matrix driven by any function
     G.color(token, a)       a theme token as an rgba() string, for canvas
     G.palette()             the theme's four colours as {c1..c4} rgb arrays
     G.glowLine(ctx, …)      a flat stroke (the name is historical: no bloom)
     G.light(ctx, …)         retired: draws nothing (a halo behind a point)

   Every piece reads colour from tokens, so the same code draws paper-and-ink
   in studio and the dark ground in lumen. Pieces must redraw on the engine's
   "theme" event and stop when their slide leaves.

   FLAT (CONTRACT §11, both variants): nothing here draws a glow. glowLine
   strokes once, light() draws nothing, and a canvas made with G.canvas()
   ignores shadowBlur. A shape may fill with a gradient inside its own edge;
   nothing bleeds outside it. Emphasis comes from colour, size and motion.
   ========================================================================= */

import { rng, resolveColor, still } from './motion.js';

/* ── simplex noise (Gustavson), seeded ──────────────────────────────────── */
function buildPerm(seed) {
  const r = rng(seed); const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512); for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}
const G3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
export function makeNoise(seed = 1) {
  const perm = buildPerm(seed);
  const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
  function n2(x, y) {
    const s = (x + y) * F2; const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2; const x0 = x - (i - t), y0 = y - (j - t);
    const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255; let n = 0;
    const c = (xx, yy, gi) => { let tt = 0.5 - xx * xx - yy * yy; if (tt < 0) return 0; tt *= tt; const g = G3[gi % 12]; return tt * tt * (g[0] * xx + g[1] * yy); };
    n += c(x0, y0, perm[ii + perm[jj]]); n += c(x1, y1, perm[ii + i1 + perm[jj + j1]]); n += c(x2, y2, perm[ii + 1 + perm[jj + 1]]);
    return 70 * n;
  }
  function n3(x, y, z) {
    const F3 = 1 / 3, G3c = 1 / 6; const s = (x + y + z) * F3;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s); const t = (i + j + k) * G3c;
    const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) { if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; } else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; } else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; } }
    else { if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; } else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; } else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; } }
    const x1 = x0 - i1 + G3c, y1 = y0 - j1 + G3c, z1 = z0 - k1 + G3c, x2 = x0 - i2 + 2*G3c, y2 = y0 - j2 + 2*G3c, z2 = z0 - k2 + 2*G3c, x3 = x0 - 1 + 3*G3c, y3 = y0 - 1 + 3*G3c, z3 = z0 - 1 + 3*G3c;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    const c = (xx, yy, zz, gi) => { let tt = 0.6 - xx*xx - yy*yy - zz*zz; if (tt < 0) return 0; tt *= tt; const g = G3[gi % 12]; return tt * tt * (g[0]*xx + g[1]*yy + g[2]*zz); };
    return 32 * (c(x0,y0,z0,perm[ii+perm[jj+perm[kk]]]) + c(x1,y1,z1,perm[ii+i1+perm[jj+j1+perm[kk+k1]]]) + c(x2,y2,z2,perm[ii+i2+perm[jj+j2+perm[kk+k2]]]) + c(x3,y3,z3,perm[ii+1+perm[jj+1+perm[kk+1]]]));
  }
  return { n2, n3 };
}
const shared = makeNoise(1729);
export const noise2 = shared.n2;
export const noise3 = shared.n3;

/* ── colour from tokens ─────────────────────────────────────────────────── */
const cache = new Map();
// A computed color-mix() serialises as color(srgb 0.41 0.39 0.35) or oklab(…), not rgb():
// let a canvas convert whatever the browser returns into 0–255 sRGB.
let probeCtx = null;
export function rgb(expr) {
  const key = document.documentElement.dataset.theme + '|' + expr;
  if (!cache.has(key)) {
    const c = resolveColor(expr);
    probeCtx ||= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    probeCtx.clearRect(0, 0, 1, 1); probeCtx.fillStyle = '#000'; probeCtx.fillStyle = c; probeCtx.fillRect(0, 0, 1, 1);
    const [r, gg, b] = probeCtx.getImageData(0, 0, 1, 1).data;
    cache.set(key, [r, gg, b]);
  }
  return cache.get(key);
}
export const clearColorCache = () => cache.clear();
export function color(expr, a = 1) { const [r, g, b] = rgb(expr.startsWith('--') ? `var(${expr})` : expr); return `rgba(${r},${g},${b},${a})`; }
export function palette() { return { c1: rgb('var(--c1)'), c2: rgb('var(--c2)'), c3: rgb('var(--c3)'), c4: rgb('var(--c4)') }; }
export const isLumen = () => document.documentElement.dataset.theme === 'lumen';

/* ── a crisp canvas inside a scaled stage ───────────────────────────────── */
const canvases = new Set();
/** remove every canvas G.canvas created inside scope (the engine calls this on leave) */
export function removeCanvases(scope) {
  for (const cv of [...canvases]) if (!scope || !cv.isConnected || scope.contains(cv)) { cv.remove(); canvases.delete(cv); }
}
/* flat: on a canvas made here, a blurred shadow (a glow, a soft coloured shadow) is refused */
const SHADOW_BLUR = typeof CanvasRenderingContext2D !== 'undefined' ? Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur') : null;
function flatShadows(ctx) {
  if (!SHADOW_BLUR?.set || !ctx) return;
  try {
    Object.defineProperty(ctx, 'shadowBlur', { configurable: true,
      get() { return SHADOW_BLUR.get.call(ctx); },
      set() { SHADOW_BLUR.set.call(ctx, 0); } });
  } catch { /* a context that can't be wrapped keeps its own shadows */ }
}
/** host: an element with a size in canvas px. Returns { cv, ctx, w, h, resize() } */
export function canvas(host, o = {}) {
  const cv = document.createElement('canvas');
  cv.className = o.className || 'gen';
  canvases.add(cv);                                   // removed when its slide leaves (removeCanvases)
  Object.assign(cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
  host.appendChild(cv);
  const ctx = cv.getContext('2d', { alpha: true });
  flatShadows(ctx);
  const api = { cv, ctx, w: 0, h: 0, dpr: 1 };
  api.resize = () => {
    const k = parseFloat(getComputedStyle(document.querySelector('.stage')).getPropertyValue('--k')) || 1;
    const dpr = Math.min(2.5, (window.devicePixelRatio || 1) * Math.max(k, 0.5)) * (o.quality || 1);
    const w = host.clientWidth, h = host.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    Object.assign(api, { w, h, dpr });
  };
  api.resize();
  return api;
}

/* ── frame loops that belong to a slide ─────────────────────────────────── */
const loops = new Set();
/** fn(t, dt) runs every frame until the returned stop() or the slide leaves. */
export function loop(fn, owner) {
  const gs = window.gsap; let t0 = null;
  const tick = (time, dt) => { if (t0 === null) t0 = time; fn(time - t0, dt / 1000); };
  const entry = { tick, owner };
  loops.add(entry);
  if (still()) { fn(1e3, 0); return () => loops.delete(entry); }   // one final frame, no motion
  gs.ticker.add(tick);
  return () => { gs.ticker.remove(tick); loops.delete(entry); };
}
export function stopLoops(owner) {
  for (const e of [...loops]) if (!owner || e.owner === owner) { window.gsap.ticker.remove(e.tick); loops.delete(e); }
}

/* ── flow field ─────────────────────────────────────────────────────────── */
export function field({ scale = 0.0018, time = 0, twist = 2.2, seed = 0 } = {}) {
  return (x, y, t = time) => noise3(x * scale + seed, y * scale - seed, t) * Math.PI * twist;
}

/* ── particles ──────────────────────────────────────────────────────────── */
/** A tiny particle system. spawn(i) → {x,y,vx,vy,life}; step(p, dt) mutates. */
export function particles(n, spawn) {
  const ps = Array.from({ length: n }, (_, i) => ({ i, age: 0, ...spawn(i) }));
  return {
    ps,
    step(dt, fn) { for (const p of ps) { p.age += dt; fn ? fn(p, dt) : (p.x += p.vx * dt, p.y += p.vy * dt); } },
    respawn(p) { Object.assign(p, { age: 0, ...spawn(p.i) }); },
  };
}

/* ── halftone dot matrix ────────────────────────────────────────────────── */
/** Draws a grid of dots whose radius is f(x, y, t) in 0..1. */
export function dots(ctx, { w, h, step = 14, rmax = 3.2, t = 0, f, fill = color('--accent'), alphaOf }) {
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const v = f(x, y, t); if (v <= 0.02) continue;
      ctx.globalAlpha = alphaOf ? alphaOf(v, x, y) : Math.min(1, 0.25 + v);
      ctx.fillStyle = fill;
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.3, v * rmax), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/* ── a line: one flat stroke, in both themes ───────────────────────────── */
/** glowLine(ctx, path2d, { width, core }): strokes the path once in `core`. `halo` and `bloom`
    are still accepted (old callers pass them) and ignored: lumen is flat light (CONTRACT §11). */
export function glowLine(ctx, path2d, { width = 2, core = color('--c4') } = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = 1; ctx.strokeStyle = core; ctx.lineWidth = width; ctx.stroke(path2d);
  ctx.restore();
}

/** retired: draws nothing. A radial falloff around a point is a halo, and the deck has none in
    either variant (CONTRACT §11). The signature stays so old callers don't break; draw the point
    itself, flat (a gradient inside its own edge is fine). */
export function light(ctx, x, y, r, opts) { /* flat: nothing to draw */ }

/** sample a text string into points, for particles that assemble into words */
export function textPoints(text, { font = '600 220px Geist', w = 1600, h = 400, step = 6, align = 'center' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.fillStyle = '#000'; x.font = font; x.textAlign = align; x.textBaseline = 'middle';
  x.fillText(text, align === 'center' ? w / 2 : 0, h / 2);
  const d = x.getImageData(0, 0, w, h).data; const pts = [];
  for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) if (d[(yy * w + xx) * 4 + 3] > 128) pts.push([xx, yy]);
  return pts;
}

export const G = { makeNoise, noise2, noise3, rgb, color, palette, isLumen, canvas, loop, stopLoops, field, particles, dots, glowLine, light, textPoints, clearColorCache };
