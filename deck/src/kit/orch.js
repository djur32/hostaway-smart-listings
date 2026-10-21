/* ============================================================================
   ORCH · the orchestration graph (docs/stories-v2/ai.md §2).

   "Same pieces, wired for the goal. The calls stay mine." For each goal, the
   pieces the goal needs rise from a quiet tray and wire up, so each hands its
   output to the next; the rest wait in the tray. On the next beat the same
   pieces re-wire: some glide to new places, some sink back, others rise.
   Decisions that stay human are diamonds, the only thing in colour.

   Everything is declared in HTML (CONTRACT §16.5). The kit reads the markup, draws
   the pieces and the wires, and builds the motion: the first composition on
   entry, one re-wire per beat, or (data-cycle) an ambient loop through them.

   Motion rules it keeps (CONTRACT §16.6): every re-wire settles in about 1 s,
   the entry in about 1.3 s; the deck's own eases only (out, io, in), never an
   overshoot or a bounce; wires draw only after the pieces have landed, so a
   line never chases a moving point. Motion off lands every state at once.
   ========================================================================= */
import { svgEl, wirePath, parsePairs, boxIn } from './links.js';

const gs = () => window.gsap;
const E = { out: 'deck.out', io: 'deck.io', in: 'deck.in' };
const NIR = { immediateRender: false };
const LOOP_LIFT = 34;                                 // how far a loop-back arcs past its row

/** "me 0 1, owners 1 2 above" → Map(id → { c, r, side }) */
function parsePlace(s = '') {
  const m = new Map();
  s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean).forEach((x) => {
    const [id, c, r, side] = x.split(/\s+/);
    if (id && c != null && r != null) m.set(id, { c: +c, r: +r, side: side || '' });
  });
  return m;
}

const KIND_MARK = { me: 'me', person: 'person', evidence: 'evidence', tool: 'tool', artefact: 'artefact', skill: 'skill' };

/** Build (once) the stage, the pieces and the tray marks. Idempotent across visits. */
function buildDom(el) {
  const tray = el.querySelector(':scope > .orch__tray');
  if (!tray) return null;
  const items = [...tray.children].filter((li) => li.dataset.piece);
  let stage = el.querySelector(':scope > .orch__stage');
  if (!stage) {
    stage = document.createElement('div'); stage.className = 'orch__stage'; stage.setAttribute('aria-hidden', 'true');
    svgEl('svg', { class: 'orch__wires' }, stage);
    let prevGroup = null;
    for (const li of items) {
      const kind = KIND_MARK[li.dataset.kind] || 'tool';
      const label = li.textContent.trim();
      li.dataset.kind = kind;
      if (prevGroup !== null && (li.dataset.group || '') !== prevGroup) li.classList.add('is-gap');
      prevGroup = li.dataset.group || '';
      if (!li.querySelector('.orch__t')) li.innerHTML = `<i class="orch__t" aria-hidden="true"></i><span class="orch__tl">${label}</span>`;
      const pc = document.createElement('div');
      pc.className = 'orch__pc'; pc.dataset.kind = kind; pc.dataset.piece = li.dataset.piece;
      if (li.dataset.note) pc.title = li.dataset.note;
      const logo = li.dataset.logo ? `<i class="logo" data-logo="${li.dataset.logo}" aria-hidden="true"></i>` : '';
      const inside = kind === 'me' ? '<b>Me</b>' : kind === 'artefact' || kind === 'skill' ? `<b>${label}</b>` : logo;
      const below = kind === 'me' || kind === 'artefact' || kind === 'skill' ? '' : `<span class="orch__lbl"><span>${label}</span></span>`;
      pc.innerHTML = `<span class="orch__mark">${inside}</span>${below}`;
      stage.append(pc);
    }
    el.insertBefore(stage, tray);
    /* The marks are built here, long after the engine's one pass over [data-logo] at boot,
       so nothing had set --logo on them and every branded piece drew as a plain filled box
       (close-ai, on the wall as much as in a capture). Ask the engine for a pass over what
       this component just made; it listens for this on the document. */
    el.dispatchEvent(new CustomEvent('deck:needs-logos', { bubbles: true }));
    if (!el.querySelector(':scope > .orch__legend')) {
      const lg = document.createElement('p'); lg.className = 'orch__legend'; lg.innerHTML = '<i aria-hidden="true"></i>my call';
      el.append(lg);
    }
  }
  // call labels: the words sit beside a diamond; wrap them once
  el.querySelectorAll(':scope > .orch__comp > .orch__call').forEach((c) => {
    if (!c.querySelector(':scope > .orch__call-t')) c.innerHTML = `<span class="orch__call-t"><span>${c.innerHTML}</span></span>`;
  });
  return { tray, stage, svg: stage.querySelector('.orch__wires'), items };
}

/**
 * orchestrate(el, { T }) → { enter, beats: [[n, tl]], ambient: fn | null }
 * T(s) scales a time in seconds by the deck's motion scale.
 */
export function orchestrate(el, { T = (s) => s } = {}) {
  const G = gs();
  const dom = buildDom(el); if (!dom) return { enter: G.timeline(), beats: [], ambient: null };
  const { stage, svg, items } = dom;
  const pcs = new Map([...stage.querySelectorAll(':scope > .orch__pc')].map((p) => [p.dataset.piece, p]));
  const lis = new Map(items.map((li) => [li.dataset.piece, li]));
  const comps = [...el.querySelectorAll(':scope > .orch__comp')];

  /* ── layout, measured now (the slide is laid out when it activates) ── */
  const W = stage.clientWidth, H = stage.clientHeight;
  const st = boxIn(stage, el);
  const places = comps.map((c) => parsePlace(c.dataset.place));
  const maxC = Math.max(1, ...places.flatMap((m) => [...m.values()].map((v) => v.c)), ...comps.flatMap((c) => [...c.querySelectorAll('.orch__call[data-at]')].map((x) => +x.dataset.at.split(/\s+/)[0])));
  const maxR = Math.max(1, ...places.flatMap((m) => [...m.values()].map((v) => v.r)), ...comps.flatMap((c) => [...c.querySelectorAll('.orch__call[data-at]')].map((x) => +x.dataset.at.split(/\s+/)[1])));
  const cols = +el.dataset.cols || maxC + 1, rows = +el.dataset.rows || maxR + 1;
  // loop-backs arc over the top row or under the bottom one: give them room there, and only there
  const loopsAll = comps.flatMap((c, k) => parsePairs(c.dataset.loops).map((w) => ({ ...w, k })));
  const rowOf = (w) => [w.from, w.to].map((id) => places[w.k].get(id)?.r).filter((r) => r != null);
  const overTop = loopsAll.some((w) => !w.flags.has('under') && rowOf(w).includes(0));
  const underBottom = loopsAll.some((w) => w.flags.has('under') && rowOf(w).includes(rows - 1));
  const size = new Map([...pcs].map(([id, p]) => { const m = p.querySelector('.orch__mark'); return [id, { hw: m.offsetWidth / 2, hh: m.offsetHeight / 2 }]; }));
  // a label that reads outward from the first or last column needs that much room at the edge
  const lblW = new Map([...pcs].map(([id, p]) => [id, p.querySelector('.orch__lbl > span')?.offsetWidth || 0]));
  let padL = +(el.dataset.padX || Math.min(96, W * 0.06)), padR = padL;
  places.forEach((pl) => pl.forEach((v, id) => {
    const need = (size.get(id)?.hw || 23) + 14 + (lblW.get(id) || 0) + 6;
    if (v.side === 'right' && v.c === (+el.dataset.cols || maxC + 1) - 1) padR = Math.max(padR, need);
    if (v.side === 'left' && v.c === 0) padL = Math.max(padL, need);
  }));
  const pad0 = +(el.dataset.padY || Math.min(46, H * 0.1)), loopRoom = LOOP_LIFT + 30;
  const padT = pad0 + (overTop ? loopRoom : 0), padB = pad0 + (underBottom ? loopRoom : 0);
  const X = (c) => (cols < 2 ? W / 2 : padL + (c * (W - padL - padR)) / (cols - 1));
  const Y = (r) => (rows < 2 ? (padT + H - padB) / 2 : padT + (r * (H - padT - padB)) / (rows - 1));
  const tray = new Map([...lis].map(([id, li]) => { const b = boxIn(li.querySelector('.orch__t') || li, el); return [id, { x: b.x + b.w / 2 - st.x, y: b.y + b.h / 2 - st.y, s: Math.max(0.28, Math.min(0.7, (b.w || 20) / Math.max(1, size.get(id)?.hw * 2 || 44))) }]; }));

  const head = parseFloat(getComputedStyle(el).getPropertyValue('--orch-head')) || 10;
  const gapW = head * 0.7;                                 // air between a wire's end and its piece
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.querySelectorAll(':scope > g').forEach((g) => g.remove());

  const C = comps.map((comp, k) => {
    const place = places[k];
    const pos = new Map();
    for (const [id, v] of place) {
      if (!pcs.has(id)) { console.warn('[orch] no piece', id, 'in', el); continue; }
      pos.set(id, { x: X(v.c), y: Y(v.r), c: v.c, side: v.side });
    }
    // diamonds that are nodes (a decision with its own exits)
    const nodes = new Map();
    const calls = [...comp.querySelectorAll(':scope > .orch__call')];
    calls.forEach((cl) => {
      if (cl.dataset.at) { const [c, r] = cl.dataset.at.split(/\s+/).map(Number); nodes.set(cl.dataset.node || `@${c},${r}`, { x: X(c), y: Y(r), c, el: cl }); }
    });
    const boxOf = (id) => {
      if (pos.has(id)) { const p = pos.get(id), s = size.get(id); return { x: p.x, y: p.y, hw: s.hw + gapW, hh: s.hh + gapW, c: p.c }; }
      if (nodes.has(id)) { const n = nodes.get(id); return { x: n.x, y: n.y, hw: 10 + gapW, hh: 10 + gapW, c: n.c }; }
      return null;
    };
    const g = svgEl('g', { class: 'orch__w', 'data-comp': k }, svg);
    const mk = (w, loop) => {
      const a = boxOf(w.from), b = boxOf(w.to);
      if (!a || !b) { console.warn('[orch] wire', `${w.from}>${w.to}`, 'names a piece not placed in composition', k); return null; }
      const geo = wirePath(a, b, { loop: loop ? (w.flags.has('under') ? 'under' : 'over') : null, lift: LOOP_LIFT, rise: 0.02, head });
      const frame = w.from === 'me';
      const gg = svgEl('g', { class: `orch__wire${frame ? ' is-frame' : ''}${loop ? ' is-loop' : ''}` }, g);
      const path = svgEl('path', { class: 'orch__p', d: geo.d }, gg);
      const arrow = svgEl('path', { class: 'orch__a', d: geo.arrow }, gg);
      return { ...w, loop, path, arrow, geo, c: a.c };
    };
    const wires = parsePairs(comp.dataset.wires).map((w) => mk(w, false)).filter(Boolean)
      .sort((p, q) => p.c - q.c);                                  // dependency order: left to right
    const loops = parsePairs(comp.dataset.loops).map((w) => mk(w, true)).filter(Boolean);
    // place every diamond: on its wire (data-on), or at its own grid point (data-at)
    const callAt = [];
    calls.forEach((cl) => {
      let x, y, wire = null;
      if (cl.dataset.at) { const n = [...nodes.values()].find((v) => v.el === cl); x = n.x; y = n.y; }
      else if (cl.dataset.on) {
        const [f, t] = cl.dataset.on.split('>').map((s) => s.trim());
        wire = [...wires, ...loops].find((w) => w.from === f && w.to === t);
        if (!wire) { console.warn('[orch] call on a wire that is not in composition', k, cl.dataset.on); return; }
        [x, y] = wire.geo.at(0.5);
      } else return;
      cl.style.left = `${(st.x + x).toFixed(1)}px`; cl.style.top = `${(st.y + y).toFixed(1)}px`;
      callAt.push({ el: cl, wire, node: !!cl.dataset.at, id: cl.dataset.node });
    });
    const text = ['.orch__goal', '.orch__result', '.orch__then'].map((s) => comp.querySelector(`:scope > ${s}`));
    return { k, pos, wires, loops, calls: callAt, text, beat: comp.dataset.beat != null ? +comp.dataset.beat : null };
  });

  /* ── the initial state: every piece in its tray mark, nothing drawn ── */
  const marks = (id) => pcs.get(id).querySelector('.orch__mark');
  const lbls = (id) => pcs.get(id).querySelector('.orch__lbl');
  const rest = (id) => tray.get(id) || { x: W / 2, y: H + 40, s: 0.4 };
  for (const [id, p] of pcs) {
    const t = rest(id);
    G.set(p, { x: t.x, y: t.y, autoAlpha: 0 });
    G.set(marks(id), { scale: t.s });
    const l = lbls(id); if (l) G.set(l, { autoAlpha: 0 });
  }
  for (const c of C) {
    [...c.wires, ...c.loops].forEach((w) => { G.set(w.path, { drawSVG: '0% 0%' }); G.set(w.arrow, { autoAlpha: 0 }); });
    c.calls.forEach((cl) => G.set(cl.el, { autoAlpha: 0 }));
    c.text.forEach((t) => t && G.set(t, { autoAlpha: 0 }));
  }
  lis.forEach((li) => { li.dataset.out = 'off'; });

  /* ── one transition, from composition a (−1: nothing) to b ── */
  function transition(a, b, { entry = false } = {}) {
    const tl = G.timeline();
    const A = a >= 0 ? C[a] : null, B = C[b];
    // 1 · the old wiring leaves: wires undraw from their arrow ends, the words go
    if (A) {
      [...A.wires, ...A.loops].forEach((w) => {
        tl.fromTo(w.arrow, { autoAlpha: 1 }, { autoAlpha: 0, duration: T(0.1), ease: E.in, ...NIR }, 0);
        tl.fromTo(w.path, { drawSVG: '0% 100%' }, { drawSVG: '0% 0%', duration: T(0.2), ease: E.in, ...NIR }, 0);
      });
      A.calls.forEach((cl) => tl.fromTo(cl.el, { autoAlpha: 1 }, { autoAlpha: 0, duration: T(0.16), ease: E.in, ...NIR }, 0));
      A.text.forEach((t) => t && tl.fromTo(t, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -6, duration: T(0.18), ease: E.in, ...NIR }, 0));
    }
    // 2 · the pieces: stay and glide, sink back, or rise
    const move = entry ? T(0.52) : T(0.44), ease = entry ? E.out : E.io;
    const t0 = entry ? T(0.04) : T(0.1);
    const ids = new Set([...(A ? A.pos.keys() : []), ...B.pos.keys()]);
    for (const id of ids) {
      const p = pcs.get(id), m = marks(id), l = lbls(id), t = rest(id), li = lis.get(id);
      const pa = A?.pos.get(id), pb = B.pos.get(id);
      const col = (pb || pa).c;
      if (pa && pb) {
        if (Math.abs(pa.x - pb.x) + Math.abs(pa.y - pb.y) > 0.5) tl.fromTo(p, { x: pa.x, y: pa.y }, { x: pb.x, y: pb.y, duration: move, ease, ...NIR }, t0);
        if (l && (pa.side || 'below') !== (pb.side || 'below')) {
          tl.fromTo(l, { autoAlpha: 1 }, { autoAlpha: 0, duration: T(0.12), ...NIR }, t0);
          tl.set(p, { attr: { 'data-side': pb.side || 'below' }, ...NIR }, t0 + T(0.13));
          tl.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: T(0.2), ...NIR }, t0 + move * 0.7);
        }
      } else if (pa) {                                   // back to the tray
        tl.fromTo(p, { x: pa.x, y: pa.y, autoAlpha: 1 }, { x: t.x, y: t.y, autoAlpha: 0, duration: T(0.38), ease: E.io, ...NIR }, T(0.06));
        tl.fromTo(m, { scale: 1 }, { scale: t.s, duration: T(0.38), ease: E.io, ...NIR }, T(0.06));
        if (l) tl.fromTo(l, { autoAlpha: 1 }, { autoAlpha: 0, duration: T(0.12), ...NIR }, T(0.08));
        tl.set(li, { attr: { 'data-out': 'off' }, ...NIR }, T(0.36));
      } else {                                           // up from the tray
        const at = t0 + col * T(entry ? 0.04 : 0.025);
        tl.set(p, { attr: { 'data-side': pb.side || 'below' }, ...NIR }, at);
        tl.fromTo(p, { x: t.x, y: t.y, autoAlpha: 0 }, { x: pb.x, y: pb.y, autoAlpha: 1, duration: move, ease, ...NIR }, at);
        tl.fromTo(m, { scale: t.s }, { scale: 1, duration: move, ease, ...NIR }, at);
        if (l) tl.fromTo(l, { autoAlpha: 0 }, { autoAlpha: 1, duration: T(0.26), ease: E.out, ...NIR }, at + move * 0.62);
        tl.set(li, { attr: { 'data-out': 'on' }, ...NIR }, at);
      }
    }
    // 3 · the goal, then the wires in order once the pieces have landed, the calls as their wire passes
    const goal = B.text[0];
    if (goal) tl.fromTo(goal, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: T(entry ? 0.36 : 0.28), ease: E.out, ...NIR }, entry ? 0 : T(0.22));
    const w0 = entry ? T(0.44) : T(0.44);
    const each = entry ? T(0.26) : T(0.2);
    const list = [...B.wires, ...B.loops];
    const gap = list.length > 1 ? Math.min(entry ? T(0.06) : T(0.045), (entry ? T(0.34) : T(0.24)) / (list.length - 1)) : 0;
    const when = new Map();
    list.forEach((w, i) => {
      const at = w0 + i * gap;
      when.set(w, at);
      tl.fromTo(w.path, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: each, ease: E.io, ...NIR }, at);
      tl.fromTo(w.arrow, { autoAlpha: 0 }, { autoAlpha: 1, duration: T(0.1), ease: E.out, ...NIR }, at + each * 0.9);
    });
    const wiresEnd = list.length ? w0 + (list.length - 1) * gap + each : w0;
    B.calls.forEach((cl) => {
      let at = wiresEnd;
      if (cl.wire) at = when.get(cl.wire) + each * 0.5;
      else if (cl.node) { const into = list.find((w) => w.to === cl.id); at = into ? when.get(into) + each : w0; }
      tl.fromTo(cl.el, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: T(0.22), ease: E.out, ...NIR }, at);
    });
    // 4 · what it produced, then what I did with it: the consequence is the last thing drawn
    const [, res, then] = B.text;
    if (res) tl.fromTo(res, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: T(0.28), ease: E.out, ...NIR }, Math.max(wiresEnd - T(0.2), T(0.6)));
    if (then) tl.fromTo(then, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: T(0.28), ease: E.out, ...NIR }, Math.max(wiresEnd - T(0.12), T(0.66)));
    return tl;
  }

  const enter = transition(-1, 0, { entry: true });
  const baseBeat = +(el.dataset.beat || 0);
  // each composition after the first re-wires on its beat; a cycling graph has no composition beats
  const beats = el.dataset.cycle ? [] : C.slice(1).map((c) => [c.beat != null ? c.beat : baseBeat + c.k, transition(c.k - 1, c.k)]);

  // the moment the diamonds take the colour (the thesis: ink before beat 1, the accent from it)
  if (el.dataset.callsBeat) {
    el.dataset.calls = 'ink';
    const n = +el.dataset.callsBeat;
    const tl = G.timeline(); tl.set(el, { attr: { 'data-calls': 'on' }, ...NIR }, 0.001);
    beats.push([n, tl]);
  }

  // an ambient cycle through the compositions (the thesis): starts after the entry, loops until leave
  let ambient = null;
  if (el.dataset.cycle && C.length > 1) {
    const hold = Math.max(1.2, +el.dataset.cycle);
    ambient = () => {
      const tl = G.timeline({ repeat: -1 });
      for (let k = 0; k < C.length; k++) { tl.add(transition(k, (k + 1) % C.length), `+=${hold}`); }
      return tl;
    };
  }
  return { enter, beats, ambient };
}
