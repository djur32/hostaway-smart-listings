/* ============================================================================
   LINKS · connectors between things on a slide, and the geometry the
   orchestration graph shares with them.

     <div class="links-host">                        any container; the kit makes it position: relative
       <div data-node="call">…</div>
       <div data-node="digest">…</div>
       <div data-node="pm">…</div>
       <svg class="links" data-links="call>digest, digest>pm, pm>call:back" data-a="links"></svg>
     </div>

   data-links is a list of "from>to" pairs naming [data-node] elements inside the
   same container. Flags after a colon:
     :back    a loop back, an arc over the top (":under" arcs below instead)
     :accent  the wire in the accent (use it for the one that carries the call)
     :dash    a quiet dashed wire (something that did not happen, or not yet)
   The wire leaves the side of its node that faces the other node and arrives on
   the facing side of the next, with horizontal (or vertical) tangents, so a row
   of nodes reads as a flow and a column as a chain. The geometry is measured
   from layout (offsets, never transforms), when the slide activates. Nodes are
   HTML elements (a card, a dot, a label), not shapes inside another SVG.

   data-a="links" draws them in the order they are listed; without it they are
   simply there.
   ========================================================================= */

const NS = 'http://www.w3.org/2000/svg';
export const svgEl = (tag, attrs = {}, parent) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
};

/** an element's layout box inside `host`, immune to transforms */
export function boxIn(el, host) {
  let x = 0, y = 0, e = el;
  while (e && e !== host) {
    const op = e.offsetParent;
    if (!op || (op !== host && !host.contains(op))) {
      // the host is not on the offset chain (it is not positioned): fall back to the screen
      // boxes, unscaled by the stage's own transform (layout boxes are what we want)
      const hr = host.getBoundingClientRect(), er = el.getBoundingClientRect();
      const k = hr.width && host.offsetWidth ? hr.width / host.offsetWidth : 1;
      return { x: (er.left - hr.left) / k, y: (er.top - hr.top) / k, w: el.offsetWidth, h: el.offsetHeight };
    }
    x += e.offsetLeft; y += e.offsetTop;
    e = op;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const f = (v) => +v.toFixed(1);

/** a wire between two boxes {x, y (centre), hw, hh (half sizes)}: a cubic with
    tangents along the dominant axis, from facing side to facing side. */
export function wirePath(a, b, o = {}) {
  const dx = b.x - a.x, dy = b.y - a.y;
  let p0, p1, c1, c2;
  if (o.loop) {                                    // an arc over (or under) the row
    const s = o.loop === 'under' ? 1 : -1;
    p0 = [a.x, a.y + s * a.hh]; p1 = [b.x, b.y + s * b.hh];
    const lift = (o.lift ?? 54) + Math.abs(dx) * (o.rise ?? 0.08);
    const top = s < 0 ? Math.min(p0[1], p1[1]) - lift : Math.max(p0[1], p1[1]) + lift;
    c1 = [p0[0] + (dx === 0 ? 40 : 0), top]; c2 = [p1[0], top];
  } else if (Math.abs(dx) >= Math.abs(dy) * 0.9) { // horizontal
    const s = Math.sign(dx) || 1;
    p0 = [a.x + s * a.hw, a.y]; p1 = [b.x - s * b.hw, b.y];
    const k = Math.max(24, Math.abs(p1[0] - p0[0]) * 0.5);
    c1 = [p0[0] + s * k, p0[1]]; c2 = [p1[0] - s * k, p1[1]];
  } else {                                         // vertical
    const s = Math.sign(dy) || 1;
    p0 = [a.x, a.y + s * a.hh]; p1 = [b.x, b.y - s * b.hh];
    const k = Math.max(20, Math.abs(p1[1] - p0[1]) * 0.5);
    c1 = [p0[0], p0[1] + s * k]; c2 = [p1[0], p1[1] - s * k];
  }
  const d = `M${f(p0[0])},${f(p0[1])} C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p1[0])},${f(p1[1])}`;
  const at = (t) => {                              // a point on the curve
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
            u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]];
  };
  // the arrowhead: a small flat triangle along the end tangent
  let tx = p1[0] - c2[0], ty = p1[1] - c2[1];
  if (Math.hypot(tx, ty) < 0.01) { tx = p1[0] - p0[0]; ty = p1[1] - p0[1]; }
  const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
  const len = o.head ?? 9, wid = (o.head ?? 9) * 0.62;
  const bx = p1[0] - tx * len, by = p1[1] - ty * len;
  const arrow = `M${f(p1[0])},${f(p1[1])} L${f(bx - ty * wid)},${f(by + tx * wid)} L${f(bx + ty * wid)},${f(by - tx * wid)} Z`;
  return { d, arrow, at, p0, p1 };
}

/** "a>b, b>c:back:accent" → [{ from, to, flags }] */
export function parsePairs(s = '') {
  return s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean).map((x) => {
    const [pair, ...flags] = x.split(':').map((y) => y.trim());
    const [from, to] = pair.split('>').map((y) => y.trim());
    return { from, to, flags: new Set(flags) };
  }).filter((w) => w.from && w.to);
}

/** Lay out one svg.links: measure its nodes, write one path and one arrowhead per pair.
    Returns [{ path, arrow }] in the order the pairs were listed. Safe to call again: it
    rebuilds from scratch. */
export function layoutLinks(svg) {
  const host = svg.parentElement; if (!host) return [];
  const W = host.clientWidth, H = host.clientHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.querySelectorAll('.links__w').forEach((g) => g.remove());
  const node = (id) => host.querySelector(`[data-node="${CSS.escape(id)}"]`);
  const out = [];
  for (const w of parsePairs(svg.dataset.links)) {
    const A = node(w.from), B = node(w.to);
    if (!A || !B) { console.warn('[links] no node', !A ? w.from : w.to, 'in', host); continue; }
    const a = boxIn(A, host), b = boxIn(B, host);
    const pad = +(svg.dataset.gap ?? 10);
    const geo = wirePath({ x: a.x + a.w / 2, y: a.y + a.h / 2, hw: a.w / 2 + pad, hh: a.h / 2 + pad },
                         { x: b.x + b.w / 2, y: b.y + b.h / 2, hw: b.w / 2 + pad, hh: b.h / 2 + pad },
                         { loop: w.flags.has('back') ? 'over' : w.flags.has('under') ? 'under' : null });
    const g = svgEl('g', { class: `links__w${w.flags.has('accent') ? ' is-accent' : ''}${w.flags.has('dash') ? ' is-dash' : ''}${w.flags.has('back') || w.flags.has('under') ? ' is-back' : ''}` }, svg);
    const path = svgEl('path', { class: 'links__p', d: geo.d }, g);
    const arrow = svgEl('path', { class: 'links__a', d: geo.arrow }, g);
    out.push({ path, arrow, geo });
  }
  return out;
}

/** draw the wires of one svg.links in order (a timeline; motion off lands on the end) */
export function drawLinks(svg, o = {}) {
  const gs = window.gsap; const tl = gs.timeline();
  const items = svg.__links || layoutLinks(svg);
  const each = o.each ?? 0.36, gap = o.gap ?? 0.12;
  items.forEach(({ path, arrow }, i) => {
    const dashed = path.parentNode.classList.contains('is-dash');
    const at = i * gap;
    if (dashed || !window.DrawSVGPlugin) tl.from(path, { autoAlpha: 0, duration: each, ease: 'deck.io' }, at);
    else tl.from(path, { drawSVG: '0% 0%', duration: each, ease: 'deck.io' }, at);
    tl.from(arrow, { autoAlpha: 0, duration: 0.16, ease: 'deck.out' }, at + each * 0.85);
  });
  return tl;
}

/** every svg.links under root, laid out now (the engine calls this when a slide activates) */
export function layoutAllLinks(root) {
  root.querySelectorAll('svg.links[data-links]').forEach((svg) => { svg.__links = layoutLinks(svg); });
}
