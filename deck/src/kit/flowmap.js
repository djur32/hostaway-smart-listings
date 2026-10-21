/* ============================================================================
   FLOWMAP · user flows, maps and models drawn live from JSON (4 Oct).

   Antonio, 4 Oct: "For the flows, the user flows, and any diagram you have, create
   them dynamically in web … a visual output for anything." One renderer serves the
   deck (a detail panel, the kit gallery) and the Notion renders (deck/qa/diagrams).

     <figure class="hc-flow" data-flow="turn-on"></figure>          the deck variant
     <figure class="hc-flow" data-flow="turn-on" data-variant="notion"></figure>

   DATA  src/data/flows.json → { "flows": { "<id>": { … } } }, loaded once at boot, so a
   panel cloned from its template draws at once, before its motion pass reads it.

     { "title": "…", "caption": "… (Notion only)", "w": 1720, "h": 540,
       "v": { "notion": { "h": 600 } },                       per-variant overrides
       "groups": [{ "id": "sh", "x": 20, "y": 20, "w": 420, "h": 300, "tint": "blush",
                    "t": "Shared", "s": "every fact once" }],
       "nodes":  [{ "id": "a", "kind": "start|step|screen|ai|decision|end|root",
                    "x": 150, "y": 90,                         the node's CENTRE
                    "w": 240, "h": 104,                        defaults by kind
                    "t": "Title", "s": "a sub line", "cap": "Uses the Base",
                    "capIcon": "i-lock",                       the caption's icon (default ⓘ; a lock = set by the channel)
                    "ch": ["airbnb"], "glyph": "page|wizard|panel|drawer",
                    "who": "host|system",                      decisions: raspberry is the host's
                    "rows": [{ "k": "base|custom|only|set", "t": "Uses the Base" }],
                    "only": "deck|notion",                     drawn in one variant only
                    "v": { "notion": { "t": "…" } } }],        per-variant overrides
       "edges":  [{ "from": "a", "to": "b", "l": "Yes",
                    "out": "t|r|b|l", "in": "t|r|b|l",         sides (default: facing sides)
                    "oo": 0, "io": 0,                          offsets along those sides
                    "mid": 372,                                the middle leg's x (or y)
                    "via": [[x, y], …],                        explicit corners, orthogonal
                    "lp": [x, y], "lt": 0.5,                   label at a point / along the path
                    "dash": true, "only": "deck",
                    "who": "host" }] }                         a host's choice on a line: a raspberry label
       "look": "cards"                                          every node the same card (4 Oct, Antonio on the Hub
                                                                flow: "don't make everything so round"): one radius,
                                                                white on a hairline, lavender only for the AI, the
                                                                question a plain card led by a diamond, an end led by
                                                                a check; no stadiums, no corner badges

   Edges are orthogonal with rounded corners; the arrowhead is a chevron drawn as part of
   the same stroke, so a line that draws itself ends with its head.

   MOTION  data-a="flow" (set by the renderer): one timeline per diagram. Plates wipe in,
   nodes pop in as a ladder along the edges (Dijkstra by arrival time), lines draw from
   their source, labels pop as their line passes. Nothing fades through half-transparency
   and nothing is dimmed: a node is hidden, then shown at full colour while it scales up.
   The CSS rests on the final state, so print, motion off and the Notion renders show the
   whole diagram.
   ========================================================================= */
import { definePrim, motionScale } from './motion.js';

const R = (typeof window !== 'undefined' && window.__DECK_ROOT__) || '../';
const SVGNS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const txt = (s) => esc(s).replace(/\n/g, '<br>');
const f1 = (v) => +v.toFixed(1);

let DATA = null;
/** resolves once src/data/flows.json is in (hc.js waits for it before its first prepare) */
export const flowsReady = fetch(`${R}data/flows.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((d) => { DATA = d; return d; });
export const flowData = () => DATA;

/* ── geometry ──────────────────────────────────────────────────────────── */
const SIZE = { step: [240, 104], screen: [240, 104], ai: [240, 104], decision: [220, 76], start: [250, 104], end: [230, 96], root: [190, 76] };
const merge = (o, v) => (o?.v?.[v] ? { ...o, ...o.v[v] } : o);
const inVariant = (o, v) => !o.only || o.only === v;

function resolve(spec, variant) {
  const s = merge(spec, variant);
  const groups = (s.groups || []).filter((g) => inVariant(g, variant)).map((g) => merge(g, variant));
  const nodes = (s.nodes || []).filter((n) => inVariant(n, variant)).map((n) => {
    const m = merge(n, variant); const k = m.kind || 'step'; const [w, h] = SIZE[k] || SIZE.step;
    return { ...m, kind: k, w: m.w ?? w, h: m.h ?? h };
  });
  const byId = new Map([...nodes, ...groups.map((g) => ({ ...g, kind: 'group', x: g.x + g.w / 2, y: g.y + g.h / 2 }))].map((n) => [n.id, n]));
  const edges = (s.edges || []).filter((e) => inVariant(e, variant)).map((e) => merge(e, variant)).filter((e) => byId.has(e.from) && byId.has(e.to));
  return { ...s, W: s.w || 1720, H: s.h || 540, groups, nodes, byId, edges };
}

const isH = (side) => side === 'l' || side === 'r';
function port(n, side, off = 0) {
  if (side === 't') return [n.x + off, n.y - n.h / 2];
  if (side === 'b') return [n.x + off, n.y + n.h / 2];
  if (side === 'l') return [n.x - n.w / 2, n.y + off];
  return [n.x + n.w / 2, n.y + off];
}
function facing(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ['r', 'l'] : ['l', 'r'];
  return dy >= 0 ? ['b', 't'] : ['t', 'b'];
}
/** the corners of an orthogonal route from side s0 of p0 to side s1 of p1 */
function corners(p0, s0, p1, s1, e) {
  if (e.via) return [p0, ...e.via, p1];
  const [x0, y0] = p0, [x1, y1] = p1;
  if (isH(s0) && isH(s1)) {
    if (Math.abs(y0 - y1) < 0.5 && s0 !== s1) return [p0, p1];
    const X = e.mid ?? (s0 === s1 ? (s0 === 'r' ? Math.max(x0, x1) + 44 : Math.min(x0, x1) - 44) : (x0 + x1) / 2);
    return [p0, [X, y0], [X, y1], p1];
  }
  if (!isH(s0) && !isH(s1)) {
    if (Math.abs(x0 - x1) < 0.5 && s0 !== s1) return [p0, p1];
    const Y = e.mid ?? (s0 === s1 ? (s0 === 'b' ? Math.max(y0, y1) + 40 : Math.min(y0, y1) - 40) : (y0 + y1) / 2);
    return [p0, [x0, Y], [x1, Y], p1];
  }
  return isH(s0) ? [p0, [x1, y0], p1] : [p0, [x0, y1], p1];
}
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const toward = (a, b, k) => { const L = dist(a, b) || 1; return [a[0] + ((b[0] - a[0]) * k) / L, a[1] + ((b[1] - a[1]) * k) / L]; };
const P = (p) => `${f1(p[0])},${f1(p[1])}`;
/** a polyline with rounded corners, ending in a chevron drawn in the same stroke */
function edgeGeometry(pts, { r = 18, gap = 5, hl = 11 } = {}) {
  const q = pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.5);
  const last = q.length - 1;
  q[last] = toward(q[last], q[last - 1], gap);                     // stop short of the node's edge
  let d = `M${P(q[0])}`;
  for (let i = 1; i < last; i++) {
    const a = q[i - 1], b = q[i], c = q[i + 1];
    const k = Math.min(r, dist(a, b) / 2, dist(b, c) / 2);
    d += ` L${P(toward(b, a, k))} Q${P(b)} ${P(toward(b, c, k))}`;
  }
  d += ` L${P(q[last])}`;
  const tip = q[last], from = q[last - 1];
  const L = dist(from, tip) || 1, ux = (tip[0] - from[0]) / L, uy = (tip[1] - from[1]) / L;
  const bx = tip[0] - ux * hl, by = tip[1] - uy * hl, wx = -uy * hl * 0.62, wy = ux * hl * 0.62;
  const head = ` M${P([bx + wx, by + wy])} L${P(tip)} L${P([bx - wx, by - wy])}`;
  let len = 0; for (let i = 1; i < q.length; i++) len += dist(q[i - 1], q[i]);
  return { d: d + head, line: d, head: head.trim(), pts: q, len };
}
function pointAt(pts, t) {
  let total = 0; for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
  let goal = total * t;
  for (let i = 1; i < pts.length; i++) {
    const s = dist(pts[i - 1], pts[i]);
    if (goal <= s) return toward(pts[i - 1], pts[i], goal);
    goal -= s;
  }
  return pts[pts.length - 1];
}
function longestMid(pts) {
  let best = 0, at = pts[0];
  for (let i = 1; i < pts.length; i++) { const s = dist(pts[i - 1], pts[i]); if (s > best) { best = s; at = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; } }
  return at;
}

/* ── pieces ────────────────────────────────────────────────────────────── */
const MARK = { airbnb: 'airbnb', booking: 'booking', vrbo: 'vrbo', direct: 'hospitable', hospitable: 'hospitable', google: 'google' };
const CH_NAME = { airbnb: 'Airbnb', booking: 'Booking.com', vrbo: 'Vrbo', direct: 'Direct', hospitable: 'Direct', google: 'Google' };
const markSvg = (c) => { const m = MARK[c] || c; return `<svg class="h-mark h-mark--badge h-mark--${m}" viewBox="0 0 24 24" role="img" aria-label="${esc(CH_NAME[c] || c)}"><rect class="h-mark__bg" width="24" height="24" rx="5.5"/><use class="h-mark__glyph" href="#chg-${m}" width="24" height="24"/></svg>`; };
const icon = (id, cls = 'hc-flow__i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;
/* a tiny UI glyph: the product's frame, its aubergine rail and what the screen holds */
const GLYPH = {
  page:   '<rect class="g-frame" x="1" y="1" width="46" height="34" rx="5"/><rect class="g-rail" x="1" y="1" width="11" height="34" rx="5"/><rect class="g-rail" x="7" y="1" width="5" height="34"/><rect class="g-line" x="17" y="8" width="18" height="3" rx="1.5"/><rect class="g-line" x="17" y="15" width="24" height="3" rx="1.5"/><rect class="g-line" x="17" y="22" width="14" height="3" rx="1.5"/>',
  wizard: '<rect class="g-frame" x="1" y="1" width="46" height="34" rx="5"/><rect class="g-bar" x="1" y="8" width="17" height="2"/><rect class="g-line" x="14" y="15" width="20" height="3" rx="1.5"/><rect class="g-card" x="14" y="21" width="20" height="8" rx="2"/>',
  panel:  '<rect class="g-frame" x="1" y="1" width="46" height="34" rx="5"/><rect class="g-rail" x="1" y="1" width="9" height="34" rx="5"/><rect class="g-rail" x="5" y="1" width="5" height="34"/><rect class="g-line" x="14" y="9" width="12" height="3" rx="1.5"/><rect class="g-line" x="14" y="16" width="14" height="3" rx="1.5"/><rect class="g-ai" x="31" y="5" width="13" height="26" rx="2.5"/>',
  drawer: '<rect class="g-frame" x="1" y="1" width="46" height="34" rx="5"/><rect class="g-rail" x="1" y="1" width="9" height="34" rx="5"/><rect class="g-rail" x="5" y="1" width="5" height="34"/><rect class="g-line" x="14" y="9" width="10" height="3" rx="1.5"/><rect class="g-drawer" x="27" y="1" width="20" height="34"/><rect class="g-line" x="31" y="8" width="11" height="3" rx="1.5"/><rect class="g-line" x="31" y="15" width="13" height="3" rx="1.5"/>',
};
const glyph = (k) => (GLYPH[k] ? `<svg class="hc-flow__g" viewBox="0 0 48 36" aria-hidden="true">${GLYPH[k]}</svg>` : '');
const ROW_ICON = { base: 'i-info-circle', custom: 'i-pencil', only: 'i-map-pin', set: 'i-lock', all: 'i-world' };

function nodeHtml(n, look) {
  const cards = look === 'cards';
  const cls = ['hc-flow__n', `hc-flow__n--${n.kind}`];
  if (n.kind === 'decision') cls.push(n.who === 'host' ? 'is-host' : 'is-system');
  if (n.rows) cls.push('has-rows');
  // "cards": the meaning sits in the lead, inside the card, so every card keeps one shape
  const lead = n.kind === 'decision' ? `<span class="hc-flow__q" aria-hidden="true">${cards ? '<span>?</span>' : '?'}</span>`
    : n.glyph ? glyph(n.glyph) : n.icon ? icon(n.icon)
    : cards && n.kind === 'ai' ? icon('i-sparkles', 'hc-flow__i hc-flow__lead') : cards && n.kind === 'end' ? icon('i-circle-check', 'hc-flow__i hc-flow__lead') : '';
  // a badge on the corner, so it never takes the words' width: a sparkle for the AI, a check for an end
  const badge = cards ? '' : n.kind === 'ai' ? `<span class="hc-flow__badge hc-flow__badge--ai" aria-label="AI">${icon('i-sparkles', 'hc-flow__i')}</span>`
    : n.kind === 'end' ? `<span class="hc-flow__badge hc-flow__badge--end" aria-label="End">${icon('i-check', 'hc-flow__i')}</span>` : '';
  const marks = (n.ch || []).length ? `<span class="hc-flow__marks">${n.ch.map(markSvg).join('')}</span>` : '';
  const cap = n.cap ? `<span class="hc-flow__cap">${icon(n.capIcon || 'i-info-circle', 'hc-flow__i')}${txt(n.cap)}</span>` : '';
  const rows = n.rows ? `<ul class="hc-flow__rows">${n.rows.map((r) => `<li data-k="${esc(r.k || 'base')}">${icon(ROW_ICON[r.k] || ROW_ICON.base, 'hc-flow__i')}<span>${txt(r.t)}</span></li>`).join('')}</ul>` : '';
  const body = `<span class="hc-flow__tx">${cap}${marks || n.t ? `<span class="hc-flow__t">${marks}${n.t ? `<span>${txt(n.t)}</span>` : ''}</span>` : ''}${n.s ? `<span class="hc-flow__s">${txt(n.s)}</span>` : ''}${rows}</span>`;
  return `<div class="${cls.join(' ')}" data-node="${esc(n.id)}" style="left:${n.x - n.w / 2}px;top:${n.y - n.h / 2}px;width:${n.w}px;height:${n.h}px">${lead}${body}${badge}</div>`;
}

/* ── timing: the ladder ────────────────────────────────────────────────── */
const POP = 0.46, LEAD = 0.12, LIMIT = 2.2, BASE = 0.04;   // BASE: nothing sits at 0, where a set() would render early
const lineDur = (len) => Math.min(0.5, Math.max(0.22, 0.14 + len / 1700));
function schedule(F) {
  const T = new Map(), out = new Map();
  F.edges.forEach((e) => { if (!out.has(e.from)) out.set(e.from, []); out.get(e.from).push(e); });
  const into = new Set(F.edges.map((e) => e.to));
  const g0 = BASE + (F.groups.length ? 0.22 : 0);
  F.groups.forEach((g, i) => T.set(g.id, BASE + i * 0.08));
  let firsts = F.nodes.filter((n) => n.kind === 'start' || n.kind === 'root' || n.first);
  if (!firsts.length) firsts = F.nodes.filter((n) => !into.has(n.id));
  if (!firsts.length && F.nodes[0]) firsts = [F.nodes[0]];
  const queue = firsts.map((n, i) => [g0 + i * 0.1, n.id]);
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [t, id] = queue.shift();
    if (T.has(id)) continue;
    T.set(id, t);
    for (const e of out.get(id) || []) {
      if (e.t0 != null) continue;
      e.t0 = t + LEAD; e.dur = lineDur(e.len);
      if (!T.has(e.to)) queue.push([e.t0 + e.dur * 0.86, e.to]);
    }
  }
  F.nodes.forEach((n) => { if (!T.has(n.id)) T.set(n.id, g0); });
  F.edges.forEach((e) => { if (e.t0 == null) { e.t0 = Math.max(T.get(e.from) ?? 0, T.get(e.to) ?? 0) + LEAD; e.dur = lineDur(e.len); } });
  // the whole ladder settles inside LIMIT seconds: a long flow climbs faster
  const end = Math.max(...F.nodes.map((n) => T.get(n.id) + POP), ...F.edges.map((e) => e.t0 + e.dur), 0.01);
  const k = end > LIMIT ? Math.max(0.42, LIMIT / end) : 1;
  return { T: (id) => (T.get(id) ?? 0) * k, k };
}

/* ── render ────────────────────────────────────────────────────────────── */
let uid = 0;
export function renderFlow(fig, spec, variant = fig.dataset.variant || 'deck') {
  const F = resolve(spec, variant);
  const id = `hcf${++uid}`;
  const canvas = document.createElement('div');
  canvas.className = `hc-flow__canvas${F.look === 'cards' ? ' is-cards' : ''}`;
  canvas.style.width = `${F.W}px`; canvas.style.height = `${F.H}px`;
  canvas.dataset.w = F.W; canvas.dataset.h = F.H;
  // 1 · the plates and the cards
  let html = '';
  for (const g of F.groups) html += `<div class="hc-flow__grp" data-tint="${esc(g.tint || 'blush')}" data-grp="${esc(g.id)}" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px"><p class="hc-flow__gt">${txt(g.t)}${g.s ? `<span>${txt(g.s)}</span>` : ''}</p></div>`;
  for (const n of F.nodes) html += nodeHtml(n, F.look);
  canvas.innerHTML = html;
  fig.replaceChildren(canvas);
  // 2 · a card whose words need more room grows around its centre (measured when laid out, so a
  //     card is never cut, whatever the font did); the lines are routed from the measured boxes
  if (canvas.offsetWidth) {
    for (const n of F.nodes) {
      const el = canvas.querySelector(`[data-node="${CSS.escape(n.id)}"]`), tx = el?.querySelector('.hc-flow__tx'); if (!tx) continue;
      const cs = getComputedStyle(el);
      const need = Math.ceil(tx.scrollHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth));
      if (need > n.h) { n.h = need; el.style.top = `${n.y - n.h / 2}px`; el.style.height = `${n.h}px`; }
    }
  }
  // 3 · the lines (the ladder needs their lengths), then the timing
  for (const e of F.edges) {
    const a = F.byId.get(e.from), b = F.byId.get(e.to);
    const [fs, ts] = facing(a, b);
    const s0 = e.out || fs, s1 = e.in || ts;
    const g = edgeGeometry(corners(port(a, s0, e.oo || 0), s0, port(b, s1, e.io || 0), s1, e));
    Object.assign(e, { geo: g, len: g.len, t0: null });
  }
  const { T, k } = schedule(F);
  const host = new Set(F.nodes.filter((n) => n.kind === 'decision' && n.who === 'host').map((n) => n.id));
  const byHost = (e) => host.has(e.from) || e.who === 'host';
  canvas.querySelectorAll('[data-grp]').forEach((el) => { el.dataset.ft = f1(T(el.dataset.grp)); });
  canvas.querySelectorAll('[data-node]').forEach((el) => { el.dataset.ft = f1(T(el.dataset.node)); });
  let wires = `<svg class="hc-flow__wires" viewBox="0 0 ${F.W} ${F.H}" aria-hidden="true"><defs>`;
  F.edges.forEach((e, i) => { if (e.dash) wires += `<mask id="${id}m${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${F.W}" height="${F.H}"><path class="hc-flow__reveal" d="${e.geo.d}" data-ft="${f1(e.t0 * k)}" data-fd="${f1(e.dur * k)}"/></mask>`; });
  wires += '</defs>';
  F.edges.forEach((e, i) => {
    const cls = `hc-flow__e${e.dash ? ' is-dash' : ''}${byHost(e) ? ' is-host' : ''}`;
    // a dotted line keeps a solid head; both are revealed by the mask that draws
    wires += e.dash ? `<g mask="url(#${id}m${i})"><path class="${cls}" d="${e.geo.line}"/><path class="${cls} is-head" d="${e.geo.head}"/></g>`
      : `<path class="${cls}" d="${e.geo.d}" data-ft="${f1(e.t0 * k)}" data-fd="${f1(e.dur * k)}"/>`;
  });
  wires += '</svg>';
  let labels = '';
  for (const e of F.edges) {
    if (!e.l) continue;
    const at = e.lp || (e.lt != null ? pointAt(e.geo.pts, e.lt) : longestMid(e.geo.pts));
    labels += `<span class="hc-flow__lbl${byHost(e) ? ' is-host' : ''}${e.dash ? ' is-dash' : ''}" data-ft="${f1((e.t0 + e.dur * 0.5) * k)}" style="left:${f1(at[0])}px;top:${f1(at[1])}px"><span>${txt(e.l)}</span></span>`;
  }
  // under the cards: the lines; over everything: the labels
  canvas.querySelector('.hc-flow__n')?.insertAdjacentHTML('beforebegin', wires);
  canvas.insertAdjacentHTML('beforeend', labels);
  // 4 · the drawing sits in the middle of its canvas, whatever the coordinates left over
  if (fig.dataset.center !== 'off') centre(canvas, F);
  fig.dataset.rendered = variant;
  if (!fig.hasAttribute('role')) fig.setAttribute('role', 'img');
  if (!fig.getAttribute('aria-label')) fig.setAttribute('aria-label', `${F.title || 'Diagram'}: ${F.nodes.map((n) => [n.t, n.s].filter(Boolean).join(', ')).join(' → ')}`);
  if (fig.dataset.a == null && fig.dataset.still == null) fig.dataset.a = 'flow';
  fit(fig); watch(fig);
  return fig;
}

/** the drawing's bounding box (cards, plates, lines, labels as laid out), moved to the middle of
    the canvas: every piece is moved by the same whole-pixel offset, so nothing changes shape */
function centre(canvas, F) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  const add = (x0, y0, x1, y1) => { l = Math.min(l, x0); t = Math.min(t, y0); r = Math.max(r, x1); b = Math.max(b, y1); };
  const badges = F.look !== 'cards';
  F.nodes.forEach((n) => add(n.x - n.w / 2, n.y - n.h / 2 - (badges && (n.kind === 'ai' || n.kind === 'end') ? 15 : 0), n.x + n.w / 2 + (badges && n.kind === 'ai' ? 13 : 0), n.y + n.h / 2));
  F.groups.forEach((g) => add(g.x, g.y, g.x + g.w, g.y + g.h));
  F.edges.forEach((e) => e.geo.pts.forEach(([x, y]) => add(x - 8, y - 8, x + 8, y + 8)));
  if (canvas.offsetWidth) canvas.querySelectorAll('.hc-flow__lbl > span').forEach((sp) => {
    const at = sp.parentElement, x = parseFloat(at.style.left), y = parseFloat(at.style.top);
    add(x - sp.offsetWidth / 2, y - sp.offsetHeight / 2, x + sp.offsetWidth / 2, y + sp.offsetHeight / 2);
  });
  if (!Number.isFinite(l)) return;
  const dx = Math.round((F.W - (r - l)) / 2 - l), dy = Math.round((F.H - (b - t)) / 2 - t);
  if (!dx && !dy) return;
  for (const el of canvas.children) {
    if (el.matches('svg')) { el.style.left = `${dx}px`; el.style.top = `${dy}px`; continue; }
    el.style.left = `${parseFloat(el.style.left) + dx}px`; el.style.top = `${parseFloat(el.style.top) + dy}px`;
  }
}

/** zoom the canvas to its figure: never larger than drawn, never wider or taller than the room
    the figure is given (a detail panel gives it the height left under its title) */
export function fit(fig) {
  const c = fig.querySelector(':scope > .hc-flow__canvas'); if (!c) return;
  const W = +c.dataset.w, H = +c.dataset.h;
  c.style.zoom = '';
  const cw = fig.clientWidth, ch = fig.clientHeight;
  if (!cw) return;
  const k = Math.min(+(fig.dataset.zoomMax || 1), cw / W, ch && ch < H ? ch / H : 1);
  if (k < 0.999 || k > 1.001) c.style.zoom = String(+k.toFixed(4));
}
// refit on the next frame: a zoom set inside the observer's callback would resize what it observes
const RO = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((list) => requestAnimationFrame(() => list.forEach((x) => fit(x.target)))) : null;
const watch = (fig) => RO?.observe(fig);

/** every .hc-flow[data-flow] under scope that is not drawn yet (hc.js prepare calls this) */
export function flows(scope = document) {
  if (!DATA?.flows) return;
  for (const fig of scope.querySelectorAll('.hc-flow[data-flow]')) {
    if (fig.closest('template') || fig.querySelector(':scope > .hc-flow__canvas')) continue;
    const spec = DATA.flows[fig.dataset.flow];
    if (!spec) { console.warn('[flowmap] no flow', fig.dataset.flow); fig.classList.add('is-empty'); continue; }
    renderFlow(fig, spec);
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (fig.isConnected && !fig.closest('.s.is-current')) renderFlow(fig, spec); });
  }
}

/* ── motion: data-a="flow" ─────────────────────────────────────────────── */
definePrim('flow', (fig) => {
  const G = window.gsap; const tl = G.timeline();
  if (!fig.querySelector('.hc-flow__canvas')) { const spec = DATA?.flows?.[fig.dataset.flow]; if (spec) renderFlow(fig, spec); }
  const ms = motionScale() || 1;
  const draw = !!window.DrawSVGPlugin;
  fig.querySelectorAll('[data-ft]').forEach((el) => {
    const t = +el.dataset.ft * ms;
    if (el.matches('.hc-flow__grp')) {           // a plate: wiped in from the left, at full colour
      tl.fromTo(el, { clipPath: 'inset(0% 100% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 0.55 * ms, ease: 'power2.inOut', immediateRender: true, clearProps: 'clipPath' }, t);
    } else if (el.matches('path')) {             // a line (or the mask that reveals a dotted one) draws from its source
      const dd = (+el.dataset.fd || 0.3) * ms;
      if (draw) tl.fromTo(el, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: dd, ease: 'power1.inOut', immediateRender: true }, t);
      else { G.set(el, { visibility: 'hidden' }); tl.set(el, { visibility: 'visible' }, t + dd); }
    } else {                                     // a node or a label: hidden, then popped in at full colour
      const lbl = el.matches('.hc-flow__lbl');
      G.set(el, { visibility: 'hidden' });
      tl.set(el, { visibility: 'visible' }, t);
      tl.fromTo(el, { scale: lbl ? 0.7 : 0.62 }, { scale: 1, duration: POP * ms, ease: 'back.out(1.7)', transformOrigin: lbl ? '0px 0px' : '50% 50%', immediateRender: true }, t);
    }
  });
  return tl;
});
