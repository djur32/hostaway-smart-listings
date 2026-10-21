/* ============================================================================
   00 · OPEN · the bespoke choreography (3 Oct, night).

     op-how   one slide that plays as two (review: "rewire it and make it more dynamic").
              Both parts are live HTML, drawn once at load from the JSON their figures carry.
              entry   the six stage plates wipe up, nothing under them yet
              → 1     the methods wipe in under each stage, row by row, and their marks grow
              → 2     part 1 slides up and out of the stage's mask as part 2 slides up into it;
                      eyebrow, headline and message roll to "How I'd agentify it"; the column
                      heads and Me arrive, the raspberry line draws down, Discovery and Research run
              → 3     Concept and Design run          → 4   Testing and Systems run
              A row runs: the stage name wipes in, what goes in wipes in, the wires draw to the
              skill, the skill pops, the wire draws to my gate, the gate pops on the raspberry
              line with its question, and the last wire draws to what comes out.

   Nothing fades on a coloured shape: wipes (clip-path), scale and lines that draw. The CSS rests
   on the final state (part 2 complete), so motion off and print show the whole flow; enter()
   sets the entry state, and every beat tween is a fromTo with immediateRender: false.
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { E, d, motionScale } from '../kit/motion.js';

const g = () => window.gsap;
const T = (s) => s * (motionScale() || 1);
const SVGNS = 'http://www.w3.org/2000/svg';

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'style') n.style.cssText = v; else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return n;
}
function icon(id) {
  const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('aria-hidden', 'true');
  const u = document.createElementNS(SVGNS, 'use'); u.setAttribute('href', `#${id}`); s.append(u);
  return s;
}

/** part 1: the six plates in row one, each stage's methods under it (chips carry their row and column) */
function drawProcess(fig, data) {
  const st = data.stages;
  const heads = st.map((s) => h('div', { class: 'op-proc__h', 'data-tint': 'blush' }, h('span', { class: 'op-proc__i' }, icon(s.icon)), h('b', {}, s.name)));
  const lists = st.map((s, c) => h('ul', { class: 'op-proc__ms', 'aria-label': `${s.name} methods` },
    s.methods.map(([name, mark], r) => h('li', { class: 'op-m', 'data-mark': mark, 'data-r': r, 'data-c': c },
      h('span', {}, name)))));
  fig.append(...heads, ...lists);
}

/* part 2: the flow, at fixed coordinates on a 1728 x 618 stage (00-open.css sizes it). Each stage's two
   inputs are 36 px chips 6 px apart, and the stages 18 px apart, so they read as six groups (review, 3 Oct) */
const F = { st: 0, in: 200, inW: 248, sk: 530, skW: 300, gate: 950, out: 1470, head: 24, top: 99, pitch: 96, half: 26, inH: 36, inGap: 6, h: 618 };
const IN_OFF = (F.inGap + F.inH) / 2;   // each input's centre, above and below the stage's line
const cy = (i) => F.top + i * F.pitch;
function drawFlow(fig, data) {
  const at = (x, y) => `--x: ${x}px; --y: ${y}px`;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'op-flow__svg'); svg.setAttribute('viewBox', `0 0 1728 ${F.h}`); svg.setAttribute('aria-hidden', 'true');
  const path = (dd, attrs) => { const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', dd); p.setAttribute('pathLength', '1'); for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v); svg.append(p); };
  const [hIn, hSk, hMe, hOut] = data.heads;
  const nodes = [
    h('p', { class: 'op-flow__hd', style: at(F.in, F.head) }, hIn),
    h('p', { class: 'op-flow__hd', style: at(F.sk, F.head) }, hSk),
    h('p', { class: 'op-flow__me', style: at(F.gate, F.head) }, hMe),
    h('p', { class: 'op-flow__hd', style: at(F.out, F.head) }, hOut),
  ];
  // the raspberry line: from Me down through every gate, two stages a beat
  const segs = [[F.head + 26, cy(1)], [cy(1), cy(3)], [cy(3), cy(5)]];
  segs.forEach(([a, b], k) => path(`M${F.gate},${a} L${F.gate},${b}`, { class: 'is-me', 'data-seg': k }));
  data.rows.forEach((r, i) => {
    const y = cy(i);
    const inR = F.in + F.inW;
    r.in.forEach((_, k) => { const yy = y + (k ? IN_OFF : -IN_OFF); path(`M${inR},${yy} C${inR + 46},${yy} ${F.sk - 46},${y} ${F.sk},${y}`, { 'data-row': i, 'data-k': 'in' }); });
    path(`M${F.sk + F.skW},${y} L${F.gate - F.half},${y}`, { 'data-row': i, 'data-k': 'sk' });
    path(`M${F.gate + F.half},${y} L${F.out},${y}`, { 'data-row': i, 'data-k': 'out' });
    nodes.push(
      h('p', { class: 'op-flow__st', 'data-row': i, style: at(F.st, y) }, r.stage),
      ...r.in.map((t, k) => h('p', { class: 'op-flow__in', 'data-row': i, style: at(F.in, y + (k ? F.inGap / 2 : -F.inGap / 2 - F.inH)) }, t)),
      h('p', { class: 'op-flow__sk', 'data-row': i, style: at(F.sk, y) }, icon('i-sparkles'), h('b', {}, '/'), r.skill),
      h('p', { class: 'op-flow__gate', 'data-row': i, style: at(F.gate, y), 'aria-hidden': 'true' }),
      h('p', { class: 'op-flow__ask', 'data-row': i, style: at((F.gate + F.half + F.out) / 2, y) }, r.ask),
      h('p', { class: 'op-flow__out', 'data-row': i, style: at(F.out, y) }, r.out),
    );
  });
  fig.append(svg, ...nodes);
}
for (const root of [document, ...[...document.querySelectorAll('template')].map((t) => t.content)]) {
  for (const [sel, fn] of [['.op-proc', drawProcess], ['.op-flow', drawFlow]]) {
    root.querySelectorAll(sel).forEach((fig) => {
      if (fig.dataset.drawn) return;
      const j = fig.querySelector(':scope > script[type="application/json"]'); if (!j) return;
      try { fn(fig, JSON.parse(j.textContent)); fig.dataset.drawn = '1'; } catch (e) { console.error('[op] draw failed', sel, e); }
    });
  }
}

/* wipes: a clip-path inset that opens from one side (the shapes never fade) */
const SHUT = { up: 'inset(100% 0% 0% 0% round 22px)', right: 'inset(0% 100% 0% 0% round 16px)', text: 'inset(0% 100% 0% 0%)' };
const OPEN = { up: 'inset(0% 0% 0% 0% round 22px)', right: 'inset(0% 0% 0% 0% round 16px)', text: 'inset(0% 0% 0% 0%)' };
const RISE = { yPercent: 0, y: 0 };

/** one stage of the flow, added to tl at `at` */
function addRow(tl, api, i, at) {
  const q = (c) => api.qa(`.op-flow ${c}[data-row="${i}"]`);
  const s = (n) => at + T(n);
  tl.fromTo(q('.op-flow__st'), { clipPath: SHUT.text }, { clipPath: OPEN.text, duration: d(2), ease: E.out, immediateRender: false }, s(0))
    .fromTo(q('.op-flow__in'), { clipPath: SHUT.text }, { clipPath: OPEN.text, duration: d(2), ease: E.out, stagger: T(0.08), immediateRender: false }, s(0.08))
    .fromTo(q('path[data-k="in"]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: T(0.4), ease: E.io, immediateRender: false }, s(0.32))
    .fromTo(q('.op-flow__sk'), { scale: 0 }, { scale: 1, duration: d(2), ease: E.out, transformOrigin: '0% 50%', immediateRender: false }, s(0.62))
    .fromTo(q('path[data-k="sk"]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: T(0.24), ease: E.io, immediateRender: false }, s(0.86))
    .fromTo(q('.op-flow__gate'), { scale: 0 }, { scale: 1, duration: d(1), ease: E.out, immediateRender: false }, s(1.06))
    .fromTo(q('.op-flow__ask'), { clipPath: SHUT.text }, { clipPath: OPEN.text, duration: d(2), ease: E.out, immediateRender: false }, s(1.14))
    .fromTo(q('path[data-k="out"]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: T(0.42), ease: E.io, immediateRender: false }, s(1.14))
    .fromTo(q('.op-flow__out'), { scale: 0 }, { scale: 1, duration: d(2), ease: E.out, transformOrigin: '0% 50%', immediateRender: false }, s(1.5));
}
/** two stages a beat; the raspberry line draws down so it reaches each gate as it pops */
function runRows(tl, api, k, at) {
  tl.fromTo(api.qa(`.op-flow path[data-seg="${k}"]`), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: T(k ? 1.45 : 1.6), ease: 'none', immediateRender: false }, at);
  addRow(tl, api, 2 * k, at);
  addRow(tl, api, 2 * k + 1, at + T(0.55));
  return tl;
}

Deck.define('op-how', {
  enter(api) {
    // part 1 in place, part 2 below the mask, the headline on its first words
    g().set(api.qa('.op-roll__a'), { ...RISE });
    g().set(api.qa('.op-roll__b'), { yPercent: 115, y: 0 });
    g().set(api.q('.op-proc'), { ...RISE });
    g().set(api.q('.op-flow'), { yPercent: 105, y: 0 });
    g().set(api.qa('.op-m'), { clipPath: SHUT.right, '--on': 0 });
    g().set(api.qa('.op-flow path'), { strokeDashoffset: 1 });
    g().set(api.qa('.op-flow__hd, .op-flow__st, .op-flow__ask'), { clipPath: SHUT.text });
    g().set(api.qa('.op-flow__in'), { clipPath: SHUT.text });
    g().set(api.qa('.op-flow__me, .op-flow__sk, .op-flow__gate, .op-flow__out'), { scale: 0 });
    return api.tl()
      .fromTo(api.qa('.op-proc__h'), { clipPath: SHUT.up, y: 34 }, { clipPath: OPEN.up, y: 0, duration: d(2), ease: E.out, stagger: T(0.07) }, T(0.22));
  },
  beats: [
    // 1 · the methods, row by row across the six stages, each mark growing as its chip lands
    (api) => {
      const at = (i, el) => T(+el.dataset.r * 0.12 + +el.dataset.c * 0.035);
      return api.tl()
        .fromTo(api.qa('.op-m'), { clipPath: SHUT.right }, { clipPath: OPEN.right, duration: d(2), ease: E.out, stagger: at, immediateRender: false }, 0)
        .fromTo(api.qa('.op-m'), { '--on': 0 }, { '--on': 1, duration: d(1), ease: E.out, stagger: at, immediateRender: false }, T(0.3));
    },
    // 2 · part 1 slides up and away, part 2 slides up into the mask, the words roll; then Me and the first two stages
    (api) => {
      const tl = api.tl()
        .fromTo(api.q('.op-proc'), { ...RISE }, { yPercent: -105, y: 0, duration: d(3), ease: E.io, immediateRender: false }, 0)
        .fromTo(api.q('.op-flow'), { yPercent: 105, y: 0 }, { ...RISE, duration: d(3), ease: E.io, immediateRender: false }, 0)
        .fromTo(api.qa('.op-roll__a'), { ...RISE }, { yPercent: -115, y: 0, duration: d(2), ease: E.io, stagger: T(0.06), immediateRender: false }, T(0.05))
        .fromTo(api.qa('.op-roll__b'), { yPercent: 115, y: 0 }, { ...RISE, duration: d(2), ease: E.io, stagger: T(0.06), immediateRender: false }, T(0.05))
        .fromTo(api.qa('.op-flow__hd'), { clipPath: SHUT.text }, { clipPath: OPEN.text, duration: d(2), ease: E.out, stagger: T(0.08), immediateRender: false }, T(0.75))
        .fromTo(api.q('.op-flow__me'), { scale: 0 }, { scale: 1, duration: d(2), ease: E.out, immediateRender: false }, T(0.8));
      return runRows(tl, api, 0, T(1.05));
    },
    // 3 · Concept and Design
    (api) => runRows(api.tl(), api, 1, 0),
    // 4 · Testing and Systems
    (api) => runRows(api.tl(), api, 2, 0),
  ],
});

/* ============================================================================
   op-title · the launch (3 Oct, night; reworked with review's notes the same night). One story
   timeline on the blush plate, played one step per press of →, about a second a step:
     entry   the badge pops, the name, the promise and the context rise out of their masks,
             then 1 · edit each channel on its own (review, 4 Oct: say what's new first, not
             onboarding): one card of the home's facts pops in, its lines draw
     → 2     under the same caption, the base slides left, four wires draw to four generic listings
     → 3     a strategy per channel: the wires undraw, the base scales away, the listings
             slide in and each takes a goal
     → 4     accept what helps: a lavender recommendation lands on each, then turns into a check
     → 5     save once, then earn more: the rows fold into one receipt
     → end   the receipt goes and what it earns arrives, abstract (review, 3 Oct): a calendar
             whose days fill one by one, a line graph that draws upward over a soft area and lands
             on a dot, and a small mascot rising beside them, cheering. No numbers, no chips.
   Nothing fades (review, 3 Oct): pieces scale from nothing, slide, draw or rise out of a mask,
   and leave by scaling down or sliding out. Every story piece rests hidden in the CSS and the
   ending rests in place, so motion off, print and ?static land on the words and
   the ending. Each beat tweens the story's playhead from one label to the next, so a beat forced
   to its end (→ pressed mid-step, ←, print) lands exactly on its step.

   The mascot is inlined (so its own idle animations run and its "///" strokes can take the plate's
   tone): mascot-earn when assets/illustrations/index.json lists it, else test-measuring. Its loops
   keep their motion and lose their fades, and its viewBox is written onto it for the framing.
   ========================================================================= */
const R = (typeof window !== 'undefined' && window.__DECK_ROOT__) || '../';
const MASCOTS = ['mascot-earn', 'test-measuring', 'listings-together'];
const IS_STROKE = /^M\s*[\d.]+[ ,][\d.]+\s*l\s*-?[\d.]+[ ,]-?[\d.]+\s*$/;     // a "///" stroke, as kit/hc.js reads it
const getText = (u) => fetch(u).then((r) => (r.ok ? r.text() : '')).catch(() => '');

async function inlineMascot() {
  const boxes = [...document.querySelectorAll('.op-launch__mascot')].filter((b) => !b.querySelector('svg'));
  if (!boxes.length) return;
  let list = [];
  try { list = JSON.parse((await getText(`${R}assets/illustrations/index.json`)) || '[]'); } catch {}
  const name = MASCOTS.find((n) => list.includes(n)) || MASCOTS[1];
  const txt = await getText(`${R}assets/illustrations/${name}.svg`);
  if (!txt) return;
  boxes.forEach((box) => {
    if (box.querySelector('svg')) return;
    const tmp = document.createElement('div'); tmp.innerHTML = txt;
    const svg = tmp.querySelector('svg'); if (!svg) return;
    svg.querySelectorAll('script').forEach((x) => x.remove());
    // nothing on this slide dims and comes back: the idle loops keep their motion, not their fades
    svg.querySelectorAll('style').forEach((st) => { st.textContent = st.textContent.replace(/([{;])opacity:[\d.]+;?/g, '$1'); });
    const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      svg.setAttribute('width', vb[2]); svg.setAttribute('height', vb[3]);
      // the framing reads the drawing's frame and where the figure stands in it (its feet, and the
      // scale it is drawn at), so 00-open.css keeps the same figure on the plate whatever the drawing
      // does around it. On the drawing itself, not the box: the box's style is restored on leaving.
      const fig = (svg.querySelector('.earn-legs [transform], .earn-mascot [transform]')?.getAttribute('transform') || '')
        .match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)\s*scale\(\s*([-\d.]+)/);
      const v = { '--vx': vb[0], '--vy': vb[1], '--vw': vb[2], '--vh': vb[3] };
      if (fig) Object.assign(v, { '--ax': +fig[1], '--ay': +fig[2], '--as': +fig[3] });
      Object.entries(v).forEach(([k, x]) => svg.style.setProperty(k, x));
    }
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.querySelectorAll('path[fill="none"][stroke]').forEach((p) => { if (IS_STROKE.test(p.getAttribute('d') || '')) p.classList.add('op-launch__stroke'); });
    box.dataset.illo = name;
    (box.querySelector('.op-launch__bob') || box).append(svg);
  });
}
inlineMascot();

const PLATE_MID = 448;          // the plate's vertical middle, where the rows fold
const BASE_SHIFT = -235;        // step 2: the base slides from the column's middle to its left edge (00-open.css)
const ROW_IN = 500;             // the listings wait at the column's right edge: 790 - 290
const MASCOT_DOWN = 980;        // below the plate's edge, whatever the framing
const stories = new WeakMap();  // api → its story, so the beats can play what the entry built

/** the story, paused: labels s1…s6 mark the end of each step */
function buildStory(api) {
  const tl = g().timeline({ paused: true });
  const caps = api.qa('.op-cap'), rows = api.qa('.op-row'), base = api.q('.op-base');
  const wires = api.q('.op-wires'), paths = api.qa('.op-wires path'), receipt = api.q('.op-receipt');
  const mascot = api.q('.op-launch__mascot'), cal = api.q('.op-cal'), graph = api.q('.op-graph');
  const days = api.qa('.op-cal__g b'), line = api.q('.op-graph__line'), wipe = api.q('.op-graph__wipe'), dot = api.q('.op-graph__dot');
  const wipeW = +(wipe?.getAttribute('width') || 440);
  const at = (s) => T(s);
  const show = (els, s) => tl.set(els, { autoAlpha: 1 }, at(s));
  const hide = (els, s) => tl.set(els, { autoAlpha: 0 }, at(s));
  /** in: scale up from nothing, a little overshoot */
  const pop = (els, s, o = {}) => {
    show(els, s);
    tl.fromTo(els, { scale: 0 }, { scale: 1, duration: T(o.d ?? 0.55), ease: o.ease ?? 'back.out(1.5)', stagger: T(o.st ?? 0), immediateRender: false }, at(s));
  };
  /** out: scale down to nothing, then gone */
  const away = (els, s, o = {}) => {
    const list = [].concat(els); const dd = o.d ?? 0.4; const st = o.st ?? 0;
    tl.to(list, { scale: 0, duration: T(dd), ease: 'power2.in', stagger: T(st), ...(o.to || {}) }, at(s));
    hide(list, s + dd + st * (list.length - 1));
  };
  /** the caption: the last one rolls up and out of its mask, the next one rolls up into it */
  const cap = (n, s) => {
    const lead = n > 0 ? 0.22 : 0;
    if (n > 0) { tl.to(caps[n - 1], { yPercent: -110, duration: T(0.35), ease: 'power2.in' }, at(s)); hide(caps[n - 1], s + 0.35); }
    if (n < caps.length) { show(caps[n], s + lead); tl.fromTo(caps[n], { yPercent: 110 }, { yPercent: 0, duration: T(0.6), ease: E.out, immediateRender: false }, at(s + lead)); }
  };

  // the first frame: the plate holds nothing yet, the ending waits below its edge
  g().set(caps, { autoAlpha: 0 });
  g().set(rows, { x: ROW_IN });
  g().set(mascot, { y: MASCOT_DOWN });
  g().set([cal, graph, line], { autoAlpha: 0 });
  g().set(days, { scale: 0 });
  g().set(wipe, { attr: { width: 0 } });
  g().set(dot, { scale: 0, transformOrigin: '50% 50%' });

  // 1 · edit each channel on its own: the base, whose channels fan out on the next press
  let b = 0;
  show(api.q('.op-caps'), b); cap(0, b);
  pop(base, b + 0.1, { d: 0.7, ease: 'back.out(1.4)' });
  tl.fromTo(api.qa('.op-base__facts i'), { scaleX: 0 }, { scaleX: 1, duration: T(0.6), ease: E.out, stagger: T(0.08), immediateRender: false }, at(b + 0.45));
  tl.addLabel('s1', at(b += 1.3));

  // 2 · the channels fan out of the base, under the same caption
  tl.to(base, { x: BASE_SHIFT, duration: T(0.75), ease: E.io }, at(b));
  show(wires, b + 0.35);
  tl.fromTo(paths, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: T(0.6), ease: E.io, stagger: T(0.06), immediateRender: false }, at(b + 0.35));
  pop(rows, b + 0.55, { st: 0.08 });
  tl.addLabel('s2', at(b += 1.35));

  // 3 · a strategy per channel
  cap(1, b);
  tl.to(paths, { drawSVG: '100% 100%', duration: T(0.45), ease: E.io, stagger: T(0.04) }, at(b));
  hide(wires, b + 0.6);
  away(base, b + 0.05, { d: 0.45 });
  tl.to(rows, { x: 0, duration: T(0.75), ease: E.io, stagger: T(0.05) }, at(b + 0.25));
  pop(api.qa('.op-goal'), b + 0.6, { d: 0.5, st: 0.08 });
  tl.addLabel('s3', at(b += 1.35));

  // 4 · accept what helps: each recommendation lands, then turns into a check
  cap(2, b);
  pop(api.qa('.op-rec'), b + 0.1, { d: 0.45, st: 0.07 });
  away(api.qa('.op-rec'), b + 0.72, { d: 0.24, st: 0.07 });
  pop(api.qa('.op-ok'), b + 0.8, { d: 0.45, st: 0.07, ease: 'back.out(2)' });
  tl.addLabel('s4', at(b += 1.45));

  // 5 · save once, then earn more: the rows fold into one receipt
  cap(3, b);
  rows.forEach((r, i) => {
    const mid = (parseFloat(r.style.getPropertyValue('--y')) || 0) + 46;
    away(r, b + 0.05 + i * 0.05, { d: 0.5, to: { y: PLATE_MID - mid } });
  });
  pop(receipt, b + 0.55, { d: 0.6, ease: 'back.out(1.6)' });
  tl.addLabel('s5', at(b += 1.2));

  // the ending: the receipt goes; the calendar fills day by day, the graph's line draws upward over
  // its soft area (a wipe, never a fade) and lands on its dot; the mascot rises beside them
  cap(4, b); hide(api.q('.op-caps'), b + 0.4);
  away(receipt, b, { d: 0.4, to: { y: 60 } });
  pop(cal, b + 0.2, { d: 0.6, ease: 'back.out(1.4)' });
  tl.fromTo(days, { scale: 0 }, { scale: 1, duration: T(0.35), ease: 'back.out(2)', stagger: T(0.05), immediateRender: false }, at(b + 0.55));
  pop(graph, b + 0.4, { d: 0.6, ease: 'back.out(1.4)' });
  show(line, b + 0.75);
  tl.fromTo(line, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: T(0.95), ease: E.io, immediateRender: false }, at(b + 0.75));
  tl.fromTo(wipe, { attr: { width: 0 } }, { attr: { width: wipeW }, duration: T(0.95), ease: E.io, immediateRender: false }, at(b + 0.75));
  tl.fromTo(dot, { scale: 0 }, { scale: 1, transformOrigin: '50% 50%', duration: T(0.4), ease: 'back.out(2.2)', immediateRender: false }, at(b + 1.6));
  tl.fromTo(mascot, { y: MASCOT_DOWN }, { y: 0, duration: T(1), ease: E.out, immediateRender: false }, at(b + 0.5));
  tl.addLabel('s6', at(b += 2));
  return tl;
}

/* ── op-hypothesis: the plate settles in (a slight scale, nothing else), then its words rise (review, 4 Oct:
   "create something super simple") */
Deck.define('op-hypothesis', {
  enter(api) {
    const bg = api.q('.op-hyp__bg'); if (!bg) return null;
    return api.tl().fromTo(bg, { scale: 0.96 }, { scale: 1, duration: T(0.9), ease: 'expo.out' }, 0);
  },
});

Deck.define('op-title', {
  enter(api) {
    const story = buildStory(api); stories.set(api, story);
    return api.tl()
      .fromTo(api.q('.op-title__new .hc-badge'), { scale: 0 }, { scale: 1, duration: T(0.6), ease: 'back.out(1.7)' }, T(0.1))
      .fromTo(api.qa('.op-title .op-ln > span'), { yPercent: 120 }, { yPercent: 0, duration: T(1), ease: E.out, stagger: T(0.1) }, T(0.16))
      .add(story.tweenFromTo(0, 's1'), T(0.8));
  },
  // one step per press: each beat plays the story from the end of one step to the end of the next
  beats: [1, 2, 3, 4, 5].map((n) => (api) => stories.get(api)?.tweenFromTo(`s${n}`, `s${n + 1}`)),
});


/* ── op-burden: the hosts' requests roll slowly upwards, fading out at both ends (review, 3 Oct).
   The list is doubled once so the loop is seamless; the copies are plain (no data-a), so only the
   first set counts up when the column arrives. Motion off, reduced motion and print: a still list. */
(function rollAsks() {
  const list = document.querySelector('.s[data-id="op-burden"] .op-asks__l');
  if (!list || list.dataset.rolled) return;
  list.dataset.rolled = '1';
  const items = [...list.children];
  for (const li of items) {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('[data-a],[data-beat],[data-at]').forEach((el) => { el.removeAttribute('data-a'); el.removeAttribute('data-beat'); el.removeAttribute('data-at'); });
    list.append(c);
  }
  const still = document.documentElement.classList.contains('is-print') || /[?&](motion=off|static)/.test(location.search);
  const measure = () => {
    const first = list.children[0], copy = list.children[items.length];
    if (!first || !copy || !copy.offsetTop) return requestAnimationFrame(measure);
    list.style.setProperty('--roll-h', `${copy.offsetTop - first.offsetTop}px`);
    list.style.setProperty('--roll-t', `${Math.max(12, items.length * 4)}s`);
    if (!still) list.classList.add('is-rolling');
  };
  requestAnimationFrame(measure);
})();

/* ── op-cover: the opening on the brand plate (4 Oct). The plate settles (a slight scale), the lines rise out of
   their masks, the blob and the dots scale in from nothing; the rings and strokes draw themselves (data-a="draw").
   Nothing fades. Everything rests at its final state in the CSS, so motion off and print show the finished plate. */
Deck.define('op-cover', {
  enter(api) {
    const plate = api.q('.hc-brand__plate'); if (!plate) return null;
    return api.tl()
      .fromTo(plate, { scale: 0.96 }, { scale: 1, duration: T(0.9), ease: 'expo.out' }, 0)
      .fromTo(api.qa('.op-cover .op-ln > span'), { yPercent: 120 }, { yPercent: 0, duration: T(1), ease: E.out, stagger: T(0.1) }, T(0.12))
      .fromTo(api.qa('.op-cover__lockup'), { scale: 0 }, { scale: 1, duration: T(0.6), ease: 'back.out(1.7)', transformOrigin: '0% 50%' }, T(0.6))
      .fromTo(api.qa('.op-cover__art .hc-blob'), { scale: 0 }, { scale: 1, duration: T(0.9), ease: 'back.out(1.4)' }, T(0.35))
      .fromTo(api.qa('.op-cover__art .hc-dot'), { scale: 0 }, { scale: 1, duration: T(0.5), ease: 'back.out(2)', stagger: T(0.08) }, T(0.7));
  },
});
