/* ============================================================================
   30 · INFORMATION ARCHITECTURE · the part's motion (3 Oct, dynamic pass).

     ia-objects    the brief's two objects, a dashed gap between them; on the beat the
                   four new objects land in the gap and around it, and the wires draw
                   (4 Oct: the reading sentence and the "New" key line rise on the same beat,
                   declaratively; blush means new, on the wall and in the detail)
     ia-bathtub    declarative only: the fact card, then one wire per channel, each row
                   arriving as its wire does (30-ia.html)
     ia-options    declarative only (4 Oct): five model cards rise; the press rings Channel-first,
                   pops "My pick" and raises the "So" line (30-ia.html)
     ia-structure  the property menu (the design system's h-chnav, live HTML) assembles:
                   Shared on entry; beat 1 closes the Listing base, brings in Smart Listings
                   and Channels, opens Airbnb; beat 2 wipes in what each channel takes from
                   the Base (Antonio, 4 Oct: the sitemap's point, no percentages); beat 3
                   raises the field control that switches it

   Rules kept (CONTRACT §5, §16.6): tokens only, deck eases, nothing overshoots, entries
   settle inside 2 s, every beat tween is fromTo with immediateRender: false, and the HTML
   is the final state, so motion off and print land exactly there.
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { E, motionScale } from '../kit/motion.js';
import { drawLinks } from '../kit/links.js';

const gs = () => window.gsap;
const K = () => motionScale() || 1;
/** a beat's timeline: nothing in it may render before its press */
const beatTl = (api) => api.tl({ defaults: { immediateRender: false } });

/* ── the details, as live HTML: drawn once, at load, from the JSON each figure carries ──
   ia-objects › the whole model   ia/object-model.md (the 22 entities of ia/diagrams/build.py)
   ia-bathtub › five facts        ia/canonical-fields.md §2, §6 and canonical-fields.csv
   Drawn into the detail templates before the engine boots, so each panel opens finished;
   its rows rise through the panel's own declarative pass (data-a). */
function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'style') n.style.cssText = v; else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return n;
}
function drawEach(root, sel, fn) {
  root.querySelectorAll(sel).forEach((el) => {
    if (el.dataset.drawn) return;
    const j = el.querySelector(':scope > script[type="application/json"]'); if (!j) return;
    try { fn(el, JSON.parse(j.textContent)); el.dataset.drawn = '1'; } catch (e) { console.error('[ia] draw failed', sel, e); }
  });
}
function drawModel(fig, d) {
  d.bands.forEach(([r, label]) => fig.append(h('div', { class: 'ia-om__band', 'data-r': r, 'data-a': 'stagger', 'data-s': '0.6' },
    h('p', { class: 'ia-om__bl' }, label),
    d.e.filter((e) => e.r === r).map((e) => h('div', { class: 'ia-om__e' + (e.new ? ' is-new' : ''), style: `grid-column: ${e.c + 2}` },
      h('p', { class: 'ia-om__n' }, e.n, e.new ? h('i', {}, 'New') : null),
      h('p', { class: 'ia-om__is' }, e.is),
      h('p', { class: 'ia-om__sees' }, `Host sees: ${e.sees}`))))));
}
/* the platform's own channel mark: the square badge (ds .h-mark--badge), never the round pill chip */
function chMark(name) {
  const ch = name.toLowerCase().replace('.com', '');
  const s = document.createElement('span'); s.className = 'ia-proj__mk';
  s.innerHTML = `<svg class="h-mark h-mark--badge h-mark--${ch}" viewBox="0 0 24 24" aria-hidden="true"><rect class="h-mark__bg" width="24" height="24" rx="5.5"/><use class="h-mark__glyph" href="#chg-${ch}" width="24" height="24"/></svg>`;
  return s;
}
function drawProj(fig, d) {
  const t = h('div', { class: 'ia-proj__t', role: 'table' },
    h('div', { class: 'ia-proj__hd', role: 'columnheader' }),
    d.chs.map((c) => h('div', { class: 'ia-proj__hd', role: 'columnheader' }, chMark(c), h('span', {}, c))));
  d.rows.forEach((r) => {
    t.append(h('div', { class: 'ia-proj__f' + (r.hi ? ' is-hi' : ''), role: 'rowheader' }, h('b', {}, r.f), h('span', {}, `Stated once, for ${r.scope}`)));
    r.c.forEach(([v, k]) => t.append(h('div', { class: 'ia-proj__c' + (r.hi ? ' is-hi' : '') + (k === 'no' ? ' is-none' : ''), role: 'cell' },
      h('b', {}, v), h('span', { class: 'ia-proj__s', 'data-s': k }, d.keys[k]))));
  });
  fig.prepend(t);
}
for (const root of [document, ...[...document.querySelectorAll('template')].map((t) => t.content)]) {
  drawEach(root, '.ia-om', drawModel);
  drawEach(root, '.ia-proj', drawProj);
}

/* ── ia-objects ─────────────────────────────────────────────────────────── */
Deck.define('ia-objects', {
  enter(api) {
    gs().set(api.qa('.ia-node.is-new'), { autoAlpha: 0 });
    return null;
  },
  beats: [
    (api) => {
      const tl = beatTl(api); const k = K();
      // the open question goes: the gap and its dashed wire make way for the objects that fill it
      tl.fromTo([api.q('.ia-map__was'), api.q('.ia-gap')], { autoAlpha: 1 }, { autoAlpha: 0, duration: api.dur(1), ease: E.io }, 0);
      const order = ['projection', 'source', 'copy', 'version'].map((n) => api.q(`.ia-node[data-node="${n}"]`));
      tl.fromTo(order, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: api.dur(2), ease: E.out, stagger: 0.09 * k }, 0.08 * k);
      tl.add(drawLinks(api.q('.ia-map__is'), { each: 0.3 * k, gap: 0.08 * k }), 0.3 * k);
      return tl;
    },
  ],
});

/* ── ia-structure ───────────────────────────────────────────────────────── */
Deck.define('ia-structure', {
  enter(api) {
    const g = gs(); const k = K();
    const C = {
      rail: api.q('.ia-rail'), later: api.q('.ia-later'),
      a: api.qa('.ia-r--a'), c: api.qa('.ia-r--c'),
      kidsBase: api.q('.ia-kids--base'), kidsAb: api.q('.ia-kids--ab'),
      chevBase: api.q('.ia-chev--base'), chevAb: api.q('.ia-chev--ab'),
      grpS: api.q('.ia-grp--shared'), grpC: api.q('.ia-grp--ch'),
      tagS: api.q('.ia-grp--shared .ia-grp__tag'), tagC: api.q('.ia-grp--ch .ia-grp__tag'), sl: api.q('.ia-sl-tag'),
      reach: api.q('.ia-reach'), key: api.qa('.ia-reach__key li'), chs: api.qa('.ia-reach__ch'), segs: api.qa('.ia-reach__bar i'),
      ctl: api.q('.ia-ctl'), fields: api.qa('.ia-ctl__f'),
    };
    api._st = C;
    // what later beats bring is held; the entry's state of the menu: Listing base open, Airbnb closed
    g.set([...C.c, C.tagC, C.sl, C.reach, C.ctl].filter(Boolean), { autoAlpha: 0 });
    g.set(C.grpC, { '--ia-brs': 0 });
    g.set(C.later, { height: 0, overflow: 'hidden' });   // the card holds only Shared until the channels come
    g.set(C.kidsAb, { height: 0 });
    g.set(C.chevAb, { rotation: -90 });
    g.set(C.kidsBase, { height: 'auto' });
    g.set(C.chevBase, { rotation: 0 });
    const tl = api.tl();
    tl.fromTo(C.rail, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: api.dur(2), ease: E.out }, 0.2 * k);
    tl.from(C.a, { autoAlpha: 0, y: 8, duration: api.dur(2), ease: E.out, stagger: 0.06 * k }, 0.32 * k);
    tl.from(C.kidsBase.querySelectorAll('.h-chnav__child'), { autoAlpha: 0, x: -6, duration: api.dur(1), ease: E.out, stagger: 0.05 * k }, 0.5 * k);
    tl.fromTo(C.grpS, { '--ia-brs': 0 }, { '--ia-brs': 1, duration: api.dur(2), ease: E.io }, 0.55 * k);
    tl.from(C.tagS, { autoAlpha: 0, x: -10, duration: api.dur(2), ease: E.out }, 0.7 * k);
    return tl;
  },
  beats: [
    // a page group per channel: Listing base closes, Smart Listings and Channels arrive, Airbnb opens
    (api) => {
      const C = api._st; const tl = beatTl(api); const k = K();
      tl.fromTo(C.kidsBase, { height: 'auto' }, { height: 0, duration: api.dur(2), ease: E.io }, 0);
      tl.fromTo(C.chevBase, { rotation: 0 }, { rotation: -90, duration: api.dur(2), ease: E.io }, 0);
      tl.fromTo(C.kidsAb, { height: 0 }, { height: 'auto', duration: 0.001 }, 0);   // Airbnb opens as part of the card's growth
      tl.fromTo(C.later, { height: 0 }, { height: 'auto', duration: api.dur(2), ease: E.io }, 0.04 * k);
      tl.set(C.later, { height: 'auto', overflow: 'visible' }, 0.04 * k + api.dur(2));
      tl.fromTo(C.c, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: api.dur(2), ease: E.out, stagger: 0.05 * k }, 0.1 * k);
      tl.fromTo(C.chevAb, { rotation: -90 }, { rotation: 0, duration: api.dur(2), ease: E.io }, 0.3 * k);
      tl.fromTo(C.grpC, { '--ia-brs': 0 }, { '--ia-brs': 1, duration: api.dur(2), ease: E.io }, 0.45 * k);
      tl.fromTo([C.tagC, C.sl], { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: api.dur(2), ease: E.out, stagger: 0.08 * k }, 0.04 * k + api.dur(2));
      return tl;
    },
    // what each channel takes from the Base: the key rises, each channel's bar wipes in segment by segment
    (api) => {
      const C = api._st; const tl = beatTl(api); const k = K();
      tl.fromTo(C.reach, { autoAlpha: 0 }, { autoAlpha: 1, duration: api.dur(1), ease: E.io }, 0);
      tl.fromTo(C.key, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: api.dur(2), ease: E.out, stagger: 0.05 * k }, 0.05 * k);
      tl.fromTo(C.chs, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: api.dur(2), ease: E.out, stagger: 0.12 * k }, 0.15 * k);
      tl.fromTo(C.segs, { scaleX: 0 }, { scaleX: 1, duration: api.dur(2), ease: E.io, stagger: 0.07 * k }, 0.25 * k);
      return tl;
    },
    // the control on every field: the custom one and the inherited one, each with its one switch
    (api) => {
      const C = api._st; const tl = beatTl(api); const k = K();
      tl.fromTo(C.ctl, { autoAlpha: 0 }, { autoAlpha: 1, duration: api.dur(1), ease: E.io }, 0);
      tl.fromTo(C.fields, { autoAlpha: 0, y: 14, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: api.dur(2), ease: E.out, stagger: 0.12 * k }, 0.05 * k);
      return tl;
    },
  ],
});
