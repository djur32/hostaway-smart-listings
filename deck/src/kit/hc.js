/* ============================================================================
   HC · behaviour for the Hostaway case's components (styles: kit/hc.css,
   templates: src/slides/_kit.html). Loaded by the build's entry with the slide
   modules, before boot(), so everything it builds is in place when the engine's
   declarative motion pass (data-a) reads the slides.

   What it does, once, at load:
     · every slide gets an "In Notion ↗" link in its foot (resolved below)
     · .hc-id tags become links when Notion knows the ID
     · .hc-prov chips, .hc-mark output marks and .hc-signal meters get their words and bars
     · .hc-chart[data-chart] draws its chart from JSON (inline or data-src)
     · .hc-browser / .hc-phone get their chrome; .hc-live gets "Open live"
     · .hc-illo loads its illustration, or shows the quiet placeholder
   and it answers N (open this slide in Notion; the engine dispatches deck:notion).

   NOTION LINKS (src/data/notion-links.json; S17 fills "ids" from plan/NOTION.md)
     a slide:  the first of its data-notion IDs that has a URL in "ids", else the first
               page key in data-notion ("02-research"), else its data-notion-page, else
               its part's page ("parts").
     an ID:    "ids"[ID], else the database its prefix lives in ("prefixes").
     nothing:  "Notion page pending", dashed, not a link.

   CHARTS  <figure class="hc-chart" data-chart="bar|funnel|matrix|journey|line|svg">
             <script type="application/json">{…}</script>   (or data-src="charts/x.json",
           relative to src/data/). Shapes of the JSON are documented at each drawer
           below and in deck/CONTRACT.md §6. Marks carry data-a, so they animate
           with the slide (and land in their final state with motion off).
   ========================================================================= */

import { flows, flowsReady } from './flowmap.js';   // flows, maps and models drawn live from data/flows.json (4 Oct)

const R = (typeof window !== 'undefined' && window.__DECK_ROOT__) || '../';
if (typeof window !== 'undefined') window.__hcSprite = !!document.querySelector('script[src*="kit/ds/sprite.js"]');   // the marks will be there
const SVGNS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);

/* ── provenance words (CONVENTIONS §2) ────────────────────────────────────── */
export const PROV = {
  brief:      { label: 'From the brief',   full: 'stated in Hostaway\'s brief' },
  product:    { label: 'Hostaway today', full: 'observed in the product' },
  public:     { label: 'Public source',    full: 'a public source' },
  simulated:  { label: 'Simulated',        full: 'generated to show the method, grounded in real signals' },
  projected:  { label: 'Projected',        full: 'a forecast or target' },
  assumption: { label: 'Assumption',       full: 'a belief to validate' },
};
/* what became of an output (the covers' Outputs, D-072): made here, made from a simulated sample,
   or what I'd make with real access. Colours: produced = real, sampled = simulated, planned = gray. */
export const MARK = {
  produced: { label: 'Done',     full: 'Done in this case, on real sources' },   // the deck's words: Done · Sampled · Planned (4 Oct)
  sampled:  { label: 'Sampled',  full: 'Made from a simulated sample, standing in for real research' },
  planned:  { label: 'Planned',  full: 'What I would produce with real access; not produced under the case\'s constraints' },
};
const STRENGTH = { strong: 'Strong', moderate: 'Moderate', weak: 'Weak', hypothesis: 'Hypothesis' };

/* ═══════════════════════════════════════════════════════════════ NOTION ══ */
let LINKS = { slides: {}, lists: {}, details: {}, panels: {}, covers: {}, chips: {}, pages: {}, databases: {}, parts: {}, prefixes: {}, ids: {} };
export function idUrl(id) {
  if (LINKS.ids?.[id]) return LINKS.ids[id];
  const pre = (id.match(/^([A-Z]+)-?\d/) || [])[1];
  const db = pre && LINKS.prefixes?.[pre];
  return (db && LINKS.databases?.[db]?.url) || '';
}
export function slideUrl(s) {
  /* the condensed workspace first (review, 4 Oct: "link every slide to something related in here"):
     data/notion-links.json "slides" maps a slide id to its page in Hostaway · Smart Listings */
  const own = LINKS.slides?.[s.dataset?.id];
  if (own?.url) return { url: own.url, what: own.title || s.dataset.id };
  const ids = (s.dataset.notion || '').split(/[\s,]+/).filter(Boolean);
  for (const id of ids) if (LINKS.ids?.[id]) return { url: LINKS.ids[id], what: id };
  for (const id of ids) if (LINKS.pages?.[id]) return { url: LINKS.pages[id], what: id };   // a page key: "02-research"
  const page = s.dataset.notionPage || LINKS.parts?.[s.dataset.part] || '';
  if (page && LINKS.pages?.[page]) return { url: LINKS.pages[page], what: page };
  return { url: '', what: page || ids[0] || '' };
}
function notionFoot(s) {
  if (s.querySelector(':scope > .s-foot .hc-notion, :scope .hc-notion[data-auto]')) return;
  if (s.hasAttribute('data-no-notion')) return;
  const { url, what } = slideUrl(s);
  const a = document.createElement(url ? 'a' : 'span');
  a.className = 'hc-notion' + (url ? '' : ' is-pending'); a.dataset.auto = '';
  if (!url) return;                                  // no page for this slide: no link (3 Oct, "remove where it doesn't apply")
  a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.title = `Open ${what} in Notion (N)`; a.textContent = 'Notion';
  let foot = s.querySelector(':scope > .s-foot');
  if (!foot) {
    foot = document.createElement('div'); foot.className = 's-foot hc-foot';
    s.insertBefore(foot, s.querySelector(':scope > aside.notes'));        // before the notes, else last
  }
  foot.append(a);
}
/* A foot that shows nothing (only the Notion link, now in the hint row, or a detail's hidden
   build marker) gives its height back: hidden, so the body centres in the whole space
   (review, 3 Oct: "we have more available space at the bottom … centred to that space"). */
function quietFoot(s) {
  const f = s.querySelector(':scope > .s-foot'); if (!f) return;
  const doors = new Set([...s.querySelectorAll('template[data-more]')].map((t) => t.dataset.more));
  const c = f.cloneNode(true); c.querySelectorAll('.hc-notion, .more-link').forEach((n) => { if (n.matches('.hc-notion') || doors.has(n.dataset.more)) n.remove(); });
  if (!c.textContent.trim() && !c.querySelector('img, svg, video, canvas')) f.hidden = true;
}
function idLinks(scope) {
  scope.querySelectorAll('span.hc-id').forEach((el) => {
    const id = el.textContent.trim(), url = idUrl(id); if (!url) return;
    const a = document.createElement('a');
    a.className = el.className; a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.title = `${id} in Notion`; a.textContent = id;
    el.replaceWith(a);
  });
}
let MORE_OPEN = null, MORE_PANEL = '';   // "slide-id/detail-id" and the panel's title while a detail is open (notionHint)
/* while a part's cover is up (the first beat of its first slide), N goes to the part's section page */
const coverUp = (s) => !!s?.querySelector?.(':scope > .hc-cover') && !(+s.dataset.beat > 0);
function hereUrl(s) {
  const detail = MORE_OPEN && (LINKS.panels?.[MORE_PANEL] || LINKS.details?.[MORE_OPEN] || LINKS.details?.[MORE_OPEN.replace(/\/[^/]*$/, '/*')]);
  if (detail?.url) return { url: detail.url, what: detail.title || '' };
  const cov = coverUp(s) && LINKS.covers?.[s.dataset.part];
  if (cov?.url) return { url: cov.url, what: cov.title || '' };
  return slideUrl(s);
}
/* every page worth opening from here: a detail's or a cover's own page, else the slide's list
   (data/notion-links.json "lists", at most four), else its one page */
function hereLinks(s) {
  const one = hereUrl(s);
  const detail = MORE_OPEN && (LINKS.panels?.[MORE_PANEL] || LINKS.details?.[MORE_OPEN] || LINKS.details?.[MORE_OPEN.replace(/\/[^/]*$/, '/*')]);
  if (detail?.url || (coverUp(s) && LINKS.covers?.[s.dataset.part]?.url)) return one.url ? [{ url: one.url, label: one.what }] : [];
  const list = LINKS.lists?.[s?.dataset?.id];
  if (list?.length) return list.slice(0, 4).map((x) => ({ url: x.url, label: x.label || x.title, kind: x.kind || '' }));
  return one.url ? [{ url: one.url, label: one.what }] : [];
}
function openNotion(s) {
  const here = s || document.querySelector('.s.is-current') || document.body;
  const links = hereLinks(here);
  if (links.length > 1) { const w = document.querySelector('.hint-wrap--notion'); if (w) { w.classList.remove('is-shut'); w.classList.toggle('is-open'); } return; }
  const url = links[0]?.url;
  if (url) window.open(url, '_blank', 'noopener');
}

/* ═════════════════════════════════════════════════════════ SMALL PIECES ══ */
function chips(scope) {
  scope.querySelectorAll('.hc-prov').forEach((el) => {
    const p = PROV[el.dataset.prov]; if (!p) { console.warn('[hc] unknown data-prov', el.dataset.prov, el); return; }
    if (!el.textContent.trim()) el.textContent = p.label;
    el.title ||= p.full; el.setAttribute('aria-label', p.full);
  });
  scope.querySelectorAll('.hc-mark[data-mark]').forEach((el) => {
    const m = MARK[el.dataset.mark]; if (!m) { console.warn('[hc] unknown data-mark', el.dataset.mark, el); return; }
    if (!el.textContent.trim()) el.textContent = m.label;
    el.title ||= m.full;
  });
  // channel chips carry the design system's marks (sprite: #ch-airbnb …); the dot stays as the fallback
  scope.querySelectorAll('.hc-ch[data-ch]').forEach((el) => {
    const mark = el.dataset.ch === 'direct' ? 'hostaway' : el.dataset.ch;         // Direct is Hostaway's own "o"
    if (el.querySelector('svg') || !document.getElementById(`ch-${mark}`) && !window.__hcSprite) return;
    el.insertAdjacentHTML('afterbegin', `<svg class="hc-ch__mark" viewBox="0 0 24 24" aria-hidden="true"><use href="#ch-${mark}"/></svg>`);
    el.classList.add('has-mark');
  });
  scope.querySelectorAll('.hc-signal').forEach((el) => {
    if (el.querySelector('.hc-signal__bars')) return;
    const k = el.dataset.strength || 'hypothesis';
    el.insertAdjacentHTML('afterbegin', '<span class="hc-signal__bars" aria-hidden="true"><i></i><i></i><i></i></span>');
    if (!el.querySelector('.hc-signal__l')) el.insertAdjacentHTML('beforeend', `<span class="hc-signal__l">${STRENGTH[k] || k}</span>`);
    el.title ||= `Signal strength: ${STRENGTH[k] || k} (CONVENTIONS §2)`;
  });
}
/* a browser around a product screen: my.hostaway.com, one tab, no menu bar */
function frames(scope) {
  scope.querySelectorAll('.hc-browser').forEach((f) => {
    if (f.querySelector('.hc-browser__bar')) return;
    const url = f.dataset.url || 'my.hostaway.com';
    const [host, ...rest] = url.split('/');
    const view = f.querySelector('.hc-browser__view') || (() => {
      const v = document.createElement('div'); v.className = 'hc-browser__view';
      [...f.childNodes].filter((n) => !(n.nodeType === 1 && n.tagName === 'FIGCAPTION')).forEach((n) => v.append(n));
      f.prepend(v); return v;
    })();
    view.insertAdjacentHTML('beforebegin', `<div class="hc-browser__bar" aria-hidden="true"><span class="hc-browser__dots"><i></i><i></i><i></i></span><span class="hc-browser__tab">${esc(f.dataset.tab || 'Hostaway')}</span></div><div class="hc-browser__url" aria-hidden="true"><span><b>${esc(host)}</b>${rest.length ? '/' + esc(rest.join('/')) : ''}</span></div>`);
  });
  scope.querySelectorAll('.hc-phone').forEach((f) => {
    if (f.querySelector('.hc-phone__screen')) return;
    const v = document.createElement('div'); v.className = 'hc-phone__screen';
    [...f.childNodes].filter((n) => !(n.nodeType === 1 && n.tagName === 'FIGCAPTION')).forEach((n) => v.append(n));
    f.prepend(v);
  });
  scope.querySelectorAll('.hc-grid__c').forEach((c) => { if (c.querySelector('img')) c.setAttribute('data-zoom', ''); });
}
/* the live prototype. src/data/embeds.json: { "prototype": { "local": "http://localhost:5174",
   "deployed": "/prototype" } }. On localhost the local dev server, elsewhere the deployed path.
   An empty base leaves the poster only (clean on the wall). */
let EMBEDS = {};
function protoBase() {
  const p = EMBEDS.prototype || {};
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  return (local ? p.local : p.deployed) || '';
}
function lives(scope) {
  scope.querySelectorAll('.hc-live').forEach((f) => {
    const base = protoBase(); if (!base || f.querySelector('.hc-live__go')) return;
    f.insertAdjacentHTML('beforeend', `<button type="button" class="hc-live__go">Open live</button>`);
  });
}
function goLive(f) {
  const base = protoBase(); if (!base || f.classList.contains('is-live')) return;
  const view = f.querySelector('.hc-browser__view') || f;
  const ifr = document.createElement('iframe');
  ifr.className = 'hc-live__iframe'; ifr.src = base.replace(/\/$/, '') + (f.dataset.route || '/'); ifr.title = f.dataset.tab || 'Prototype';
  view.append(ifr); f.classList.add('is-live');
}
let ILLOS = [];                                      // assets/illustrations/index.json (tools/sync-ds.mjs)
function illos(scope) {
  scope.querySelectorAll('.hc-illo[data-illo]').forEach((f) => {
    if (f.querySelector('img') || f.classList.contains('is-missing')) return;
    if (!ILLOS.includes(f.dataset.illo)) { f.classList.add('is-missing'); return; }   // not drawn yet: the quiet clouds
    if (f.closest('.hc-cover')) { inlineIllo(f); return; }
    const img = new Image(); img.alt = ''; img.decoding = 'async';
    img.onerror = () => { img.remove(); f.classList.add('is-missing'); };
    img.src = `${R}assets/illustrations/${f.dataset.illo}.svg`;
    f.append(img);
  });
}

/* On a cover the drawing is inlined, so its own little "///" strokes (a straight round-capped
   segment, three in a row, drawn in the illustration's yellow) can take the cover's stroke tone:
   yellow on blush, lavender or mint clashes (review, 3 Oct). The mascot itself is untouched. */
const IS_STROKE = /^M\s*[\d.]+[ ,][\d.]+\s*l\s*-?[\d.]+[ ,]-?[\d.]+\s*$/;
function inlineIllo(f) {
  f.classList.add('is-inline');
  fetch(`${R}assets/illustrations/${f.dataset.illo}.svg`).then((r) => (r.ok ? r.text() : '')).catch(() => '').then((txt) => {
    if (!txt || f.querySelector('svg')) { if (!txt) f.classList.add('is-missing'); return; }
    const box = document.createElement('div'); box.innerHTML = txt;
    const svg = box.querySelector('svg'); if (!svg) { f.classList.add('is-missing'); return; }
    svg.querySelectorAll('script').forEach((x) => x.remove());
    svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('aria-hidden', 'true');
    svg.querySelectorAll('path[fill="none"][stroke]').forEach((p) => { if (IS_STROKE.test(p.getAttribute('d') || '')) p.classList.add('hc-illo__stroke'); });
    f.append(svg);
  });
}

/* ═══════════════════════════════════════════ HOSTAWAY'S MARKETING TOUCH ══ */
/* Doodles: hand-drawn rings and strokes (reference 11), drawn here so they stay in tokens
   (hc.css colours the stroke). <span class="hc-doodle" data-doodle="ring"></span>. */
const DOODLES = {
  ring:     ['M54 13C76 12 91 30 89 52C87 74 68 90 46 88C24 86 10 68 12 47C14 27 31 12 57 15'],
  strokes:  ['M18 58L42 30', 'M26 84L62 40', 'M52 94L84 56'],
  squiggle: ['M6 54C16 34 28 72 40 52S62 32 74 52S90 72 96 50'],
  swoosh:   ['M6 66C30 48 64 40 96 44'],
};
function doodleSvg(kind) {
  const d = DOODLES[kind] || DOODLES.ring;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${d.map((p) => `<path d="${p}"/>`).join('')}</svg>`;
}
function doodles(scope) {
  scope.querySelectorAll('.hc-doodle[data-doodle]').forEach((el) => { if (!el.querySelector('svg')) el.innerHTML = doodleSvg(el.dataset.doodle); });
}
/* Covers as features (3 Oct): data/covers.json says, per part, which drawing and which tint.
   The template keeps only the words (name, question, methods, outputs) and an .hc-illo; this
   builds the tinted plate, the mascot and the doodles, and sets the entry so the engine's motion
   pass (data-a) choreographs it: the plate, the mascot, the words, the doodles drawing in. Under
   ~1 s; with motion off everything is simply there.
   review, 3 Oct (late): no "Part N of 6" badge (any .opener__n is dropped here, so old markup
   can't bring it back), no "With AI" line, and the outputs stay in the left column as words,
   each row led by its mark (.hc-mark: produced · sampled · planned). */
let COVERS = {};
/* the doodles' tones per plate: the ring · the strokes (the drawing's own "///" strokes take the
   second). Only pairs that hold on the plate: no yellow on blush, lavender or mint (it washes
   out or clashes); purple and aubergine on blush, raspberry and aubergine on lavender, purple and
   raspberry on butter and mint. Since the drawings went oversized (3 Oct, late) a cover carries
   one ring of its own, in the gap between the name and the drawing; more would fight the drawing. */
const DOODLE_TONES = {
  blush:    ['purple', 'aubergine'],
  lavender: ['raspberry', 'aubergine'],
  butter:   ['purple', 'raspberry'],
  mint:     ['purple', 'raspberry'],
};
function covers(scope) {
  const list = scope.matches?.('.hc-cover') ? [scope] : [...scope.querySelectorAll('.hc-cover')];
  for (const c of list) {
    if (c.querySelector(':scope > .hc-cover__plate')) continue;
    c.querySelectorAll('.opener__n').forEach((n) => n.remove());
    const s = c.closest('.s');
    const part = s?.dataset.part, st = s?.dataset.stage;
    const cfg = COVERS.parts?.[part] || COVERS.stages?.[st] || {};
    const order = Object.keys(COVERS.parts || {}).indexOf(part);
    const tint = cfg.tint || ['blush', 'lavender', 'butter', 'mint'][Math.max(0, order) % 4];
    c.dataset.tint = tint;
    const [ring, strokes] = DOODLE_TONES[tint] || DOODLE_TONES.blush;
    c.dataset.strokes = strokes;                        // the drawing's own "///" strokes take this tone too (inlineIllo)
    const illo = c.querySelector('.hc-illo');
    if (illo && cfg.illo && ILLOS.includes(cfg.illo)) illo.dataset.illo = cfg.illo;   // not drawn yet: the template's own
    /* the plate is the part's colour; the drawing stands on it, large, cropped by its bottom edge
       (review, 3 Oct: "much bigger… they don't need the colour background like the circle") */
    c.insertAdjacentHTML('afterbegin', '<div class="hc-cover__plate" data-a="fade" data-d="1"></div>');
    const plate = c.firstElementChild;
    const art = document.createElement('div');
    art.className = 'hc-cover__art';
    /* a drawing whose figure stands at its right edge can be mirrored (covers.json "flip"), so the
       figure lands next to the words and its props run off the plate's right edge */
    art.innerHTML = `<div class="hc-cover__mascot${cfg.flip ? ' is-flip' : ''}" data-a="rise" data-at="0.12"></div>
      <span class="hc-doodle hc-doodle--a" data-doodle="ring" data-tone="${ring}" data-a="draw" data-d="2" data-at="0.34"></span>`;
    if (illo) art.querySelector('.hc-cover__mascot').append(illo);
    plate.append(art);
    // the words' entry
    const set = (sel, a, at) => { const e = c.querySelector(sel); if (e && !e.dataset.a) { e.dataset.a = a; e.dataset.at = at; } };
    set('.opener__name', 'rise', '0.1'); set('.opener__vision', 'rise', '0.18');
    set('.opener__methods', 'stagger', '0.28'); set('.opener__out', 'rise', '0.4');
    const m = c.querySelector('.opener__methods'); if (m) m.dataset.s = '0.5';
    /* every method and output opens its own Notion page (review, 4 Oct; data/notion-links.json "chips") */
    const map = LINKS.chips?.[part] || {};
    c.querySelectorAll('.opener__methods > span:not(.opener__k), .opener__outs > span').forEach((sp) => {
      const hit = map[sp.textContent.trim()]; if (!hit?.url) return;
      const a = document.createElement('a');
      for (const at of sp.attributes) a.setAttribute(at.name, at.value);
      a.classList.add('is-link'); a.href = hit.url; a.target = '_blank'; a.rel = 'noopener';
      a.title = `${hit.label || hit.title} in Notion`;
      a.append(...sp.childNodes); sp.replaceWith(a);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════ CHARTS ══ */
const el = (tag, attrs = {}, text) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
};
const fmt = (v, d = {}) => {
  const n = typeof v === 'number' ? v : +v;
  const s = Number.isFinite(n) ? n.toLocaleString('en-GB', { maximumFractionDigits: d.decimals ?? 1, minimumFractionDigits: d.decimals ?? 0 }) : String(v);
  return `${d.prefix || ''}${s}${d.unit || ''}`;
};
const svgFor = (w, h, label) => el('svg', { class: 'hc-chart__svg', viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label || 'chart' });

/* bar · horizontal, sorted (largest first unless "sort": false)
   { "items": [{ "label": "Sync failures", "value": 142, "hi": true }], "unit": "", "max": 200,
     "w": 1200, "labelW": 380, "row": 58 }                                          */
function drawBar(d) {
  const items = [...(d.items || [])]; if (d.sort !== false) items.sort((a, b) => b.value - a.value);
  const W = d.w || 1200, LW = d.labelW || 380, ROW = d.row || 58, VW = 110, H = items.length * ROW;
  const max = d.max || Math.max(...items.map((i) => i.value), 1), bw = W - LW - VW;
  const svg = svgFor(W, H, d.title);
  items.forEach((it, i) => {
    const y = i * ROW, h = Math.min(30, ROW - 20), by = y + (ROW - h) / 2;
    svg.append(el('text', { x: 0, y: y + ROW / 2, 'dominant-baseline': 'middle', class: 't-label' + (it.hi ? ' t-strong' : '') }, it.label));
    svg.append(el('rect', { x: LW, y: by, width: bw, height: h, rx: 3, class: 'm-track' }));
    svg.append(el('rect', { x: LW, y: by, width: Math.max(2, (bw * it.value) / max), height: h, rx: 3, class: 'm-bar' + (it.hi ? ' is-hi' : ''), 'data-a': 'grow' }));
    svg.append(el('text', { x: LW + bw + 14, y: y + ROW / 2, 'dominant-baseline': 'middle', class: 't-value' }, fmt(it.value, d)));
  });
  return svg;
}
/* funnel · each step's bar, the part lost since the previous step in the soft tint
   { "steps": [{ "label": "Connected a channel", "value": 1000 }, …], "unit": "", "w": 1200 } */
function drawFunnel(d) {
  const st = d.steps || []; const W = d.w || 1200, LW = d.labelW || 360, ROW = d.row || 70, VW = 190, H = st.length * ROW;
  const max = st[0]?.value || 1, bw = W - LW - VW;
  const svg = svgFor(W, H, d.title);
  st.forEach((s, i) => {
    const y = i * ROW, h = ROW - 22, by = y + 11, prev = i ? st[i - 1].value : s.value;
    svg.append(el('text', { x: 0, y: y + ROW / 2, 'dominant-baseline': 'middle', class: 't-label' }, s.label));
    if (i) svg.append(el('rect', { x: LW, y: by, width: (bw * prev) / max, height: h, rx: 3, class: 'm-funnel is-lost' }));
    svg.append(el('rect', { x: LW, y: by, width: Math.max(2, (bw * s.value) / max), height: h, rx: 3, class: 'm-funnel', 'data-a': 'grow' }));
    const pct = Math.round((s.value / max) * 100);
    svg.append(el('text', { x: LW + bw + 14, y: y + ROW / 2 - 9, 'dominant-baseline': 'middle', class: 't-value' }, fmt(s.value, d)));
    svg.append(el('text', { x: LW + bw + 14, y: y + ROW / 2 + 14, 'dominant-baseline': 'middle', class: 't-axis' }, i ? `${pct}% of first · −${Math.round(((prev - s.value) / prev) * 100)}%` : '100%'));
  });
  return svg;
}
/* matrix · a heatmap; a cell's strength is its value over max
   { "rows": ["P1 Family host", …], "cols": ["Titles", …], "values": [[3, 0, …], …], "max": 5,
     "show": true, "w": 1400, "labelW": 300, "cell": 64 }                            */
function drawMatrix(d) {
  const rows = d.rows || [], cols = d.cols || [], v = d.values || [];
  const LW = d.labelW || 300, HH = d.headH || 70, W = d.w || 1400, cw = (W - LW) / Math.max(1, cols.length), ch = d.cell || 64;
  const max = d.max || Math.max(1, ...v.flat()), H = HH + rows.length * ch;
  const svg = svgFor(W, H, d.title);
  cols.forEach((c, j) => svg.append(el('text', { x: LW + j * cw + cw / 2, y: HH - 16, 'text-anchor': 'middle', class: 't-axis' }, c)));
  rows.forEach((r, i) => {
    const y = HH + i * ch;
    svg.append(el('text', { x: 0, y: y + ch / 2, 'dominant-baseline': 'middle', class: 't-label' }, r));
    cols.forEach((_, j) => {
      const val = v[i]?.[j] ?? 0, a = val / max;
      const x = LW + j * cw + 3, w = cw - 6, h = ch - 6;
      svg.append(el('rect', { x, y: y + 3, width: w, height: h, rx: 4, class: val ? 'm-cell' : 'm-cell-empty', 'fill-opacity': val ? (0.12 + 0.88 * a).toFixed(3) : null, 'data-a': 'fade' }));
      if (d.show !== false && val) svg.append(el('text', { x: x + w / 2, y: y + ch / 2 + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'm-cell-text' + (a > 0.55 ? ' is-on-dark' : '') }, fmt(val, d)));
    });
  });
  return svg;
}
/* journey · an emotion curve across steps, scored −2 (pain) to +2 (delight)
   { "steps": [{ "label": "Connect", "score": 1, "note": "Fast" }, …], "w": 1600, "h": 460 } */
function drawJourney(d) {
  const st = d.steps || []; const W = d.w || 1600, H = d.h || 460, PT = 70, PB = 90, PX = 60;
  const x = (i) => PX + (st.length < 2 ? 0 : (i * (W - 2 * PX)) / (st.length - 1));
  const y = (s) => PT + ((2 - s) / 4) * (H - PT - PB);
  const svg = svgFor(W, H, d.title);
  svg.append(el('line', { x1: PX, x2: W - PX, y1: y(0), y2: y(0), class: 'm-zero' }));
  svg.append(el('text', { x: 0, y: y(2), 'dominant-baseline': 'middle', class: 't-axis' }, '+'));
  svg.append(el('text', { x: 0, y: y(-2), 'dominant-baseline': 'middle', class: 't-axis' }, '−'));
  // a smooth path through the points (Catmull-Rom → Bézier)
  const P = st.map((s, i) => [x(i), y(s.score)]);
  let dPath = P.length ? `M${P[0][0]},${P[0][1]}` : '';
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    dPath += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  svg.append(el('path', { d: dPath, class: 'm-line', 'data-a': 'draw' }));
  st.forEach((s, i) => {
    svg.append(el('circle', { cx: x(i), cy: y(s.score), r: 9, class: 'm-dot' + (s.score <= -1 ? ' is-low' : s.score >= 1 ? ' is-high' : ''), 'data-a': 'fade' }));
    svg.append(el('text', { x: x(i), y: H - PB + 44, 'text-anchor': 'middle', class: 't-label' }, s.label));
    if (s.note) svg.append(el('text', { x: x(i), y: y(s.score) + (s.score < 0 ? 38 : -24), 'text-anchor': 'middle', class: 't-axis' }, s.note));
  });
  return svg;
}
/* line · before and after (or any two series) over the same x
   { "x": ["W1", …], "series": [{ "name": "Today", "values": [..], "kind": "before" },
     { "name": "With the studio", "values": [..], "hi": true }], "unit": "%", "min": 0, "max": 100, "w": 1400, "h": 520 } */
function drawLine(d) {
  const X = d.x || [], S = d.series || []; const W = d.w || 1400, H = d.h || 520, PL = 70, PR = 200, PT = 20, PB = 60;
  const all = S.flatMap((s) => s.values); const min = d.min ?? Math.min(0, ...all), max = d.max ?? Math.max(...all, 1);
  const x = (i) => PL + (X.length < 2 ? 0 : (i * (W - PL - PR)) / (X.length - 1));
  const y = (v) => PT + ((max - v) / (max - min || 1)) * (H - PT - PB);
  const svg = svgFor(W, H, d.title);
  const ticks = d.ticks || 4;
  for (let k = 0; k <= ticks; k++) {
    const v = min + ((max - min) * k) / ticks;
    svg.append(el('line', { x1: PL, x2: W - PR, y1: y(v), y2: y(v), class: 'm-grid' }));
    svg.append(el('text', { x: PL - 14, y: y(v), 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 't-axis' }, fmt(v, d)));
  }
  X.forEach((l, i) => svg.append(el('text', { x: x(i), y: H - 20, 'text-anchor': 'middle', class: 't-axis' }, l)));
  S.forEach((s) => {
    const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    svg.append(el('polyline', { points: pts, class: 'm-line' + (s.kind === 'before' ? ' is-before' : '') + (s.hi ? ' is-hi' : ''), 'data-a': s.kind === 'before' ? 'fade' : 'draw' }));
    const last = s.values.length - 1;
    svg.append(el('text', { x: x(last) + 16, y: y(s.values[last]), 'dominant-baseline': 'middle', class: 't-label' + (s.hi ? ' t-strong' : '') }, s.name));
  });
  return svg;
}
async function drawSvg(fig) {
  const src = fig.dataset.svg; if (!src) return null;
  const txt = await fetch(src.startsWith('.') || src.startsWith('/') ? src : `${R}${src}`).then((r) => (r.ok ? r.text() : '')).catch(() => '');
  if (!txt) return null;
  const box = document.createElement('div'); box.innerHTML = txt;
  const svg = box.querySelector('svg'); if (!svg) return null;
  svg.querySelectorAll('script').forEach((s) => s.remove());
  svg.classList.add('hc-chart__svg'); fig.classList.add('hc-chart--svg');
  return svg;
}
const DRAW = { bar: drawBar, funnel: drawFunnel, matrix: drawMatrix, heatmap: drawMatrix, journey: drawJourney, line: drawLine };
/* Inline JSON draws at once (so a detail panel, cloned from its template when it opens, has
   its chart before the panel's motion pass runs); data-src and svg charts are fetched. */
function place(fig, svg) {
  if (!svg) { fig.classList.add('is-empty'); return; }
  fig.insertBefore(svg, fig.querySelector(':scope > .hc-chart__cap') || null);
}
function charts(scope) {
  const later = [];
  for (const fig of scope.querySelectorAll('.hc-chart[data-chart]')) {
    if (fig.querySelector('.hc-chart__svg')) continue;
    const kind = fig.dataset.chart;
    const inline = fig.querySelector(':scope > script[type="application/json"]');
    try {
      if (kind === 'svg') later.push(drawSvg(fig).then((svg) => place(fig, svg)));
      else if (inline) place(fig, DRAW[kind]?.(JSON.parse(inline.textContent)) || null);
      else if (fig.dataset.src) later.push(json(`${R}data/${fig.dataset.src}`).then((d) => place(fig, d && DRAW[kind] ? DRAW[kind](d) : null)));
      else place(fig, null);
    } catch (e) { console.warn('[hc] chart failed', kind, e); place(fig, null); }
  }
  return Promise.all(later);
}

/* ═══════════════════════════════════════════════════ SCENES FIT THE BODY ══ */
/* A .hc-scene is drawn at its own size (--w × --h, absolute frames inside). When the slide's head
   leaves less room than that, the whole scene zooms down to fit the body (and its column), so the
   floating mockups never run into the message or the footer. Measured per slide, as it is shown. */
function fitScenes(scope) {
  for (const sc of scope.querySelectorAll('.hc-scene')) {
    if (sc.closest('template')) continue;
    const body = sc.closest('.s-body'); if (!body) continue;
    sc.style.zoom = '';
    const availH = body.clientHeight, cell = sc.parentElement;
    if (!availH) continue;                                   // not laid out (a hidden slide): fit it when shown
    const w = sc.offsetWidth, h = sc.offsetHeight;
    const k = Math.min(1, (availH - 24) / h, cell === body ? 1 : cell.clientWidth / w);
    if (k < 0.999) sc.style.zoom = String(Math.max(0.5, k));
  }
}
/* A slide whose content fills little of its body sits nearer the headline instead of floating in the
   middle (review, 4 Oct: "where there is not a lot of content, bring it closer to the top, so it feels
   connected"); a full slide stays centred. Measured on the final layout, after the scenes fit. */
function balance(scope) {
  const list = scope.matches?.('.s') ? [scope] : [...scope.querySelectorAll('.deck > .s')];
  for (const s of list) {
    if (s.dataset.balance === 'off' || s.dataset.id === 'op-title') continue;   // the title slide is composed as a whole
    const body = s.querySelector(':scope > .s-body'); if (!body || body.classList.contains('s-body--top')) continue;
    body.classList.remove('is-sparse'); body.style.removeProperty('--sparse-gap');
    const H = body.clientHeight, box = body.getBoundingClientRect(); if (!H || !box.height) continue;
    const k = box.height / H;                                    // the stage's scale
    let top = Infinity, bot = -Infinity;
    for (const c of body.children) {
      if (c.matches('template, script, style, .notes')) continue;
      const cs = getComputedStyle(c); if (cs.display === 'none' || cs.position === 'absolute' || cs.position === 'fixed') continue;
      const r = c.getBoundingClientRect(); if (!r.height) continue;
      top = Math.min(top, r.top); bot = Math.max(bot, r.bottom);
    }
    if (!isFinite(top)) continue;
    const content = (bot - top) / k, free = H - content;
    if (content / H < 0.8 && free > 110) {
      body.classList.add('is-sparse');
      body.style.setProperty('--sparse-gap', `${Math.round(Math.min(80, Math.max(32, free * 0.2)))}px`);
    }
  }
}
window.addEventListener('deck:slide', (e) => { const s = e.detail?.slide; if (s) requestAnimationFrame(() => { fitScenes(s); balance(s); }); });
window.addEventListener('deck:fit', () => { fitScenes(document); });

/* ═════════════════════════════════════════════════════════════════ BOOT ══ */
export function prepare(scope = document) {
  covers(scope); doodles(scope); chips(scope); frames(scope); lives(scope); illos(scope); idLinks(scope); flows(scope);
  return charts(scope);
}
/* the engine calls this on a detail panel as it opens (engine.js mountPanel) */
window.__hcPrepare = (p) => { prepare(p); };

[LINKS, EMBEDS, ILLOS, COVERS] = await Promise.all([json(`${R}data/notion-links.json`).then((x) => x || LINKS), json(`${R}data/embeds.json`).then((x) => x || {}),
  json(`${R}assets/illustrations/index.json`).then((x) => (Array.isArray(x) ? x : [])), json(`${R}data/covers.json`).then((x) => x || {})]);
await flowsReady;                                    // a detail draws its diagram the moment it opens
await prepare(document);
/* A "So →" conclusion strip belongs at the slide's foot, right above its source line, or at the very
   bottom when there is none (review, 4 Oct: "closer to the bottom … they should always be there") */
function soToFoot(s) {
  const so = s.querySelector(':scope > .s-body .dc-so, :scope > .s-body .hc-so'); if (!so) return;
  let foot = s.querySelector(':scope > .s-foot');
  if (!foot) { foot = document.createElement('div'); foot.className = 's-foot hc-foot'; s.insertBefore(foot, s.querySelector(':scope > aside.notes')); }
  foot.classList.add('has-so'); foot.prepend(so);
}
/* no sentence starts at the end of a line (review, 4 Oct: "prevent this sort of widow… just put it in the next
   sentence"): in a slide's message and other running text, a sentence's first word is bound to its second with a
   no-break space, so it always wraps with its own sentence */
function bindSentenceStarts(s) {
  s.querySelectorAll('.hc-msg, .lead, .s-head p:not(.eyebrow)').forEach((el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeValue = n.nodeValue.replace(/([.?!:]) (\S+) /g, '$1 $2\u00a0');
  });
}
document.querySelectorAll('.deck > .s').forEach((s) => { bindSentenceStarts(s); soToFoot(s); notionFoot(s); quietFoot(s); });
/* Notion lives in the hint row, next to Jump (review, 3 Oct): one link that follows the current slide,
   hidden where a slide has no page. The per-slide foot links stay in the DOM (N and print read them), hidden. */
(function notionHint() {
  let a = null, wrap = null, pop = null;
  const ensure = () => {
    if (a?.isConnected) return a;
    const hints = document.querySelector('.hints'); if (!hints) return null;
    wrap = document.createElement('span'); wrap.className = 'hint-wrap hint-wrap--notion'; wrap.hidden = true;
    a = document.createElement('a');
    a.className = 'hint hint--notion'; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<kbd>N</kbd>Notion';                 // no arrow (review, 4 Oct)
    pop = document.createElement('div'); pop.className = 'hint-pop npop'; pop.setAttribute('role', 'menu'); pop.setAttribute('aria-label', 'Open in Notion');
    wrap.append(a, pop); hints.prepend(wrap);
    /* with several pages the hint is only the door to its list: a click closes, never navigates */
    a.addEventListener('click', (e) => { if (wrap.classList.contains('has-many')) e.preventDefault(); });
    wrap.addEventListener('mouseleave', () => wrap.classList.remove('is-shut'));
    return a;
  };
  const esc = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sync = (slide) => {
    const el = ensure(); if (!el) return;
    let links = slide ? hereLinks(slide) : [];
    if (!links.length) { const f = slide?.querySelector('.hc-notion[data-auto]'); if (f?.href) links = [{ url: f.href, label: f.title }]; }
    wrap.hidden = !links.length; wrap.classList.remove('is-open');
    if (!links.length) { el.removeAttribute('href'); return; }
    el.href = links[0].url;
    const many = links.length > 1;
    wrap.classList.toggle('has-many', many);
    el.title = many ? '' : (links[0].label ? `Open ${links[0].label} in Notion (N)` : 'Open in Notion (N)');
    pop.innerHTML = many ? links.map((l) => `<a class="npop__it" role="menuitem" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="npop__t">${esc(l.label)}</span><span class="npop__k">${esc(l.kind)}</span></a>`).join('') : '';
  };
  window.addEventListener('deck:beat', () => sync(document.querySelector('.deck > .s.is-current')));
  window.addEventListener('deck:slide', (e) => sync(e.detail?.slide));
  /* an open detail can point somewhere narrower ("details": "slide-id/detail-id" → page) */
  window.addEventListener('deck:more', (e) => {
    const d = e.detail || {}; if (d.print) return;
    const slide = d.slide instanceof Element ? d.slide : document.querySelector('.deck > .s.is-current');
    MORE_OPEN = d.open ? `${slide?.dataset.id}/${d.id}` : null;
    MORE_PANEL = (d.open && (d.panel?.dataset?.title || d.panel?.getAttribute?.('data-title'))) || '';
    sync(slide);
  });
  const first = () => sync(document.querySelector('.deck > .s.is-current') || null);
  // the hint row is built by boot(), after this module has run: wait for it
  let tries = 0;
  const wait = () => { if (document.querySelector('.hints')) { first(); return; } if (tries++ < 60) setTimeout(wait, 100); };
  wait();
})();
/* The prototype lives in the hint row too, left of Notion (review, 4 Oct): a solid dark chip, "Website" or "Mobile"
   by the deployed project it opens, on slides whose data-proto names the exact screen they show (route and query).
   It replaces the white "Open the website" pill that sat in the foot and pushed the source line right. */
(function protoHint() {
  let a = null;
  const ensure = () => {
    if (a?.isConnected) return a;
    const hints = document.querySelector('.hints'); if (!hints) return null;
    a = document.createElement('a'); a.className = 'hint hint--proto'; a.target = '_blank'; a.rel = 'noopener'; a.hidden = true;
    hints.prepend(a);
    return a;
  };
  const sync = (slide) => {
    const el = ensure(); if (!el) return;
    const url = slide?.dataset?.proto || '';
    el.hidden = !url || coverUp(slide);
    if (!url) { el.removeAttribute('href'); return; }
    const mobile = /-mobile(\.|-)/.test(new URL(url, location.href).hostname);
    el.href = url; el.textContent = mobile ? 'Mobile' : 'Website';
    el.title = mobile ? 'Open this screen on the mobile site' : 'Open this screen on the website';
  };
  window.addEventListener('deck:beat', () => sync(document.querySelector('.deck > .s.is-current')));
  window.addEventListener('deck:slide', (e) => sync(e.detail?.slide));
  let tries = 0;
  const wait = () => { if (document.querySelector('.hints')) { sync(document.querySelector('.deck > .s.is-current')); return; } if (tries++ < 60) setTimeout(wait, 100); };
  wait();
})();
document.fonts.ready.then(() => {
  /* lay every slide out once (hidden slides skip layout), so each fits and balances before it is shown */
  document.documentElement.classList.add('is-measuring');
  fitScenes(document); balance(document);
  document.documentElement.classList.remove('is-measuring');
});

addEventListener('deck:notion', (e) => openNotion(e.detail?.slide));
document.addEventListener('click', (e) => {
  const go = e.target instanceof Element && e.target.closest('.hc-live__go');
  if (go) { e.stopPropagation(); goLive(go.closest('.hc-live')); }
}, true);
/* a live frame is dropped when its slide leaves, so a prototype never runs off screen */
addEventListener('deck:slide', () => document.querySelectorAll('.hc-live.is-live').forEach((f) => {
  if (f.closest('.s.is-current')) return;
  f.querySelector('.hc-live__iframe')?.remove(); f.classList.remove('is-live');
}));
