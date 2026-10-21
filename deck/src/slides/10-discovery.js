/* ============================================================================
   10 · DISCOVERY · the bespoke choreography (3 Oct).

     dc-two-truths   the two screens settle into the scene, one after the other
     dc-no-channel   the hunt (4 Oct): the question on entry, then the route across five
                     sections (counted), the seven controls, and Instant book lit up
     dc-today        how property management is structured today (4 Oct), one step per
                     press, below the other modules: the property builds its ten sections as
                     the cover lifts, then the listing's rows on Overview, then the sections
                     that hold channel settings. The full map is live HTML in its detail,
                     drawn below from the JSON it carries (research/current-state/ia-current.md)
     dc-risks        the assumptions map is live HTML (drawn below from hypotheses.csv);
                     press 1 marks H-05 partly refuted, press 2 fills the riskiest three

   Everything else on these slides is declarative (data-a, data-beat).
   Floating screens (.hc-scr) carry the kit's CSS float, which owns transform, so
   they rise by their own --y instead of a y tween. Every beat tween is an explicit
   fromTo with immediateRender: false, and every piece ends in its final state with
   motion off (the engine completes the timelines).
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { M, E, d, motionScale } from '../kit/motion.js';

const g = () => window.gsap;
const T = (s) => s * (motionScale() || 1);

/** a floating screen settles into place, rising by its own --y */
function settle(el, held = false) {
  const y = parseFloat(el.style.getPropertyValue('--y')) || 0;
  return g().fromTo(el, { '--y': `${y + 36}px`, autoAlpha: 0 },
    { '--y': `${y}px`, autoAlpha: 1, duration: d(3), ease: E.out, immediateRender: !held });
}
/** entry: the scene's screens without data-in-beat, in document order */
function sceneIn(api, at = 0.24, step = 0.16) {
  const tl = api.tl();
  const held = api.qa('.hc-scene [data-in-beat]');
  if (held.length) g().set(held, { autoAlpha: 0 });
  api.qa('.hc-scene > .hc-scr, .hc-scene > .hc-device').filter((f) => !f.dataset.inBeat)
    .forEach((f, i) => tl.add(settle(f), T(at + i * step)));
  return tl;
}
/** beat n: the screens marked data-in-beat="n" */
function sceneBeat(api, n, step = 0.16) {
  const tl = api.tl();
  api.qa(`.hc-scene [data-in-beat="${n}"]`).forEach((f, i) => tl.add(settle(f, true), T(i * step)));
  return tl;
}
/** count a number without trusting text a half-finished run left behind */
function count(el, o = {}) {
  el.dataset.text ??= el.textContent.trim();
  return M.count(el, { ...o, text: el.dataset.text });
}
/** a bar chart held until a press: it rises, its bars grow in order, its values count */
function holdChart(api, sel) {
  const f = api.q(sel); if (!f) return;
  g().set(f, { autoAlpha: 0 });
  g().set(f.querySelectorAll('.m-bar'), { scaleX: 0, transformOrigin: 'left center' });   // a bar waiting for its turn is empty, not full
}
function buildBars(api, sel, { from = 'start', each = 0.08 } = {}) {
  const tl = api.tl(); const fig = api.q(sel); if (!fig) return tl;
  const bars = [...fig.querySelectorAll('.m-bar')], vals = [...fig.querySelectorAll('.t-value')];
  const n = bars.length, order = (i) => (from === 'end' ? n - 1 - i : i);
  tl.fromTo(fig, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: d(2), ease: E.out, immediateRender: false }, 0);
  bars.forEach((b, i) => tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: d(3), ease: E.out, immediateRender: false }, T(0.1 + order(i) * each)));
  vals.forEach((v, i) => tl.add(count(v, { duration: d(3) }), T(0.1 + order(i) * each)));
  return tl;
}

/* ── live diagrams: drawn once, at load, from the JSON each figure carries ───────────────
   They are drawn into the page and into every detail template before the engine boots, so
   the entry, the beats, motion off and print all see the same, finished markup. */
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
    try { fn(el, JSON.parse(j.textContent)); el.dataset.drawn = '1'; } catch (e) { console.error('[dc] draw failed', sel, e); }
  });
}

/** the full map (dc-today's detail): where the property sits, then its ten sections as cards, each with its
    pages. A section that holds channel settings carries the slide's per-channel mark, named once in the key.
    It shows whole: the detail brings its blocks in, nothing on it fades in by itself. */
const PC_ICON = '<svg aria-hidden="true"><use href="#i-adjustments-horizontal"/></svg>';
function pcMark() { const m = h('span', { class: 'dc-ia__ch', 'aria-hidden': 'true' }); m.innerHTML = PC_ICON; return m; }
function drawIa(fig, d) {
  fig.append(
    h('p', { class: 'dc-ia__top' },
      h('span', { class: 'dc-ia__crumb' }, d.crumb.map((c, i) => [i ? h('i', {}, '›') : null, i === d.crumb.length - 1 ? h('b', {}, c) : h('span', {}, c)]), h('em', {}, d.count)),
      h('span', { class: 'dc-ia__key' }, pcMark(), 'Holds settings per channel')),
    h('div', { class: 'dc-ia__grid' }, d.rows.map((r) => h('div', { class: 'dc-ia__sec' },
      h('p', { class: 'dc-ia__head' }, h('span', { class: 'dc-ia__n' }, r.n), r.ch ? pcMark() : null),
      r.t ? h('ul', { class: 'dc-ia__pages' }, r.t.map(([t, m]) => h('li', { class: 'dc-ia__p' + (m === 'L' ? ' is-listing' : '') }, t))) : null,
      r.note ? h('p', { class: 'dc-ia__note' }, r.note) : null))),
  );
}

/** the assumptions map: importance (rows, 5 on top) × evidence (columns), one chip per hypothesis */
function drawAm(fig, d) {
  const zone = (i, e) => d.zones.find(([zi, ze]) => zi === i && ze === e)?.[2];
  // the importance axis: an upright label beside a full-height arrow, both in plain layout (no rotation)
  fig.append(h('div', { class: 'dc-am__axis-y' },
    h('i', { class: 'dc-am__arrow', 'aria-hidden': 'true' }),
    h('span', { class: 'dc-am__axis-t' }, 'Importance to the thesis')));
  for (let i = 5; i >= 1; i--) {
    const row = 6 - i;
    fig.append(h('p', { class: 'dc-am__yl', style: `grid-row: ${row}` }, d.imp[i - 1]));
    for (let e = 1; e <= 5; e++) {
      const test = i >= 4 && e <= 2, build = i >= 4 && e >= 4;
      const c = h('div', { class: `dc-am__c is-r${i}` + (test ? ' is-test' : '') + (build ? ' is-build' : '') + (e === 5 ? ' is-last' : '') + (i === 1 ? ' is-bottom' : ''), style: `grid-row: ${row}; grid-column: ${e + 2}` });
      const z = zone(i, e); if (z) c.append(h('span', { class: 'dc-am__zone' }, z));
      d.h.filter((x) => x.imp === i && x.ev === e).forEach((x) => {
        // hover or focus a hypothesis to read it (Antonio, 4 Oct: "get a sense of what they refer to")
        const cat = (d.tags.find(([t]) => t === x.cat) || [x.cat, x.cat])[1];   // sentence case, the tag's own name
        c.append(h('span', { class: 'dc-am__h' + (x.rank ? ' is-risk' : '') + (x.refuted ? ' is-refuted' : '') + (e >= 4 ? ' is-tip-left' : ''), 'data-h': x.id, tabindex: '0' },
          x.id, h('small', {}, x.cat), x.rank ? h('span', { class: 'dc-am__rank' }, x.rank) : null,
          x.t ? h('span', { class: 'dc-am__tip', role: 'tooltip' },
            h('span', { class: 'dc-am__tip-k' }, `${x.id} · ${cat}`, x.rank ? ` · test ${x.rank}` : '', x.refuted ? ' · partly refuted' : ''),
            h('span', { class: 'dc-am__tip-t' }, x.t)) : null));
        if (x.refuted) c.append(h('span', { class: 'dc-am__ref' }, 'Partly refuted as written'));
      });
      fig.append(c);
    }
  }
  d.ev.forEach((l, j) => fig.append(h('p', { class: 'dc-am__xl', style: `grid-column: ${j + 3}` }, l)));
  fig.append(h('p', { class: 'dc-am__axis-x' }, h('i', { class: 'dc-am__rule', 'aria-hidden': 'true' }), h('span', {}, 'Evidence I already had')));
  fig.append(h('p', { class: 'dc-am__key' }, h('span', {}, 'Numbered: test first, in order')));
}

for (const root of [document, ...[...document.querySelectorAll('template')].map((t) => t.content)]) {
  drawEach(root, '.dc-ia', drawIa);
  drawEach(root, '.dc-am', drawAm);
}

Deck.define('dc-two-truths', { enter: (api) => sceneIn(api) });

/* ── dc-no-channel · the hunt for one channel's listing (4 Oct, Antonio: "something more visual"). One paused
   timeline with a label per step, like dc-today's, so a press forced to its end lands exactly on its step:
     s0  the host's question pops in, and its words rise
     s1  the empty frame at the route's end pops; the route draws across the five sections, each stop pops as
         the line reaches it, its dots land one by one and the frame's count climbs to ~15; the line arrives at an
         empty frame: "No page shows the answer" rises, then its heuristic
     s2  "7 ways": the line rises, the seven controls pop in a row as the count climbs to 7, then Sev 3
     s3  Instant book: the blush highlight and its ring wipe up under the tile, its line rises
   The So strip is declarative (data-beat="4"). Nothing fades or dims. The CSS is the last state. */
const ncStories = new WeakMap();
function ncStory(api) {
  const tl = g().timeline({ paused: true });
  const at = (s) => T(s);
  const pop = (els, s, o = {}) => {
    const list = [].concat(els).filter(Boolean); if (!list.length) return;
    tl.fromTo(list, { scale: 0 }, { scale: 1, duration: T(o.d ?? 0.5), ease: o.ease ?? 'back.out(1.6)', stagger: T(o.st ?? 0), transformOrigin: o.origin ?? '50% 50%', immediateRender: false }, at(s));
  };
  const rise = (els, s) => { const list = [].concat(els).filter(Boolean); if (list.length) tl.fromTo(list, { yPercent: 115 }, { yPercent: 0, duration: T(0.6), ease: E.out, immediateRender: false }, at(s)); };
  /* a counter that follows the pieces as they land: k pieces, each at its own time */
  const tally = (el, times, s, show = (k) => String(k)) => {
    if (!el || !times.length) return;
    const px = { t: 0 }, span = times[times.length - 1] + 0.01;
    tl.fromTo(px, { t: 0 }, { t: span, duration: T(span), ease: 'none', immediateRender: false,
      onUpdate: () => { el.textContent = show(times.filter((x) => x <= px.t + 1e-6).length); } }, at(s));
  };

  const ask = api.q('.dc-nc__ask'), askT = api.qa('.dc-nc__ask-t > span');
  const path = api.q('.dc-nc__path path'), stops = api.qa('.dc-nc__stop');
  const end = api.q('.dc-nc__end'), endHe = api.qa('.dc-nc__end .dc-he');
  const kT = api.qa('.dc-nc__k-t > span'), kHe = api.qa('.dc-nc__k .dc-he'), tiles = api.qa('.dc-nc__t');
  const hi = api.q('.dc-nc__hi'), only = api.qa('.dc-nc__only > span'), none = api.qa('.dc-nc__none > span');
  const nEl = api.q('.dc-nc [data-count="fields"]'), pEl = api.q('.dc-nc [data-count="patterns"]');

  // the first frame: an empty card on the plate; every piece waits at nothing, below its mask or undrawn
  g().set([ask, ...stops, ...api.qa('.dc-nc__dots i'), end, ...endHe, ...kHe, ...tiles].filter(Boolean), { scale: 0 });
  g().set([...askT, ...kT, ...only, ...none], { yPercent: 115 });
  if (path) g().set(path, { drawSVG: '0% 0%' });
  if (hi) g().set(hi, { clipPath: 'inset(100% 0% 0% 0%)' });

  // 0 · the question
  pop(ask, 0, { d: 0.55, origin: '0% 100%' });
  rise(askT, 0.12);
  tl.addLabel('s0', at(0.9));

  // 1 · the route: the line draws left to right; a stop pops as the line reaches its centre (10, 30 … 90 %)
  let b = 0.9; const draw = 2.2;
  if (path) tl.fromTo(path, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: T(draw), ease: 'none', immediateRender: false }, at(b));
  const times = [];
  stops.forEach((st, i) => {
    const s = b + draw * (0.1 + i * 0.2) - 0.12;
    pop(st, s, { d: 0.45 });
    const dots = [...st.querySelectorAll('.dc-nc__dots i')];
    dots.forEach((dt, j) => times.push(s - b + 0.22 + j * 0.07));
    pop(dots, s + 0.22, { d: 0.35, st: 0.07, ease: 'back.out(2.2)' });
  });
  // the frame at the end is there from the start, counting as the dots land; when the line reaches it, it is still empty
  pop(end, b, { d: 0.5, origin: '0% 50%' });
  tally(nEl, times, b);
  rise(none, b + draw + 0.05);
  pop(endHe, b + draw + 0.35, { d: 0.45, origin: '0% 50%' });
  tl.addLabel('s1', at(b += draw + 0.9));

  // 2 · seven ways: the line, then the seven controls, counted as they land
  rise(kT, b);
  const each = 0.11, t0 = 0.3;
  pop(tiles, b + t0, { d: 0.45, st: each, ease: 'back.out(1.4)' });
  tally(pEl, tiles.map((_, i) => t0 + i * each), b);
  pop(kHe, b + t0 + each * tiles.length + 0.15, { d: 0.45, origin: '0% 50%' });
  tl.addLabel('s2', at(b += t0 + each * tiles.length + 0.75));

  // 3 · the exception: Instant book's tile lights up
  if (hi) tl.fromTo(hi, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T(0.55), ease: E.out, immediateRender: false }, at(b + 0.05));
  rise(only, b + 0.35);
  tl.addLabel('s3', at(b += 1.05));
  return tl;
}

Deck.define('dc-no-channel', {
  enter(api) {
    const story = ncStory(api); ncStories.set(api, story);
    return api.tl().add(story.tweenFromTo(0, 's0'), T(0.25));
  },
  beats: [0, 1, 2].map((n) => (api) => ncStories.get(api)?.tweenFromTo(`s${n}`, `s${n + 1}`)),
});

/* the riskiest (numbered in hypotheses.md) fill on press 2; H-05 turns refuted on press 1 (the HTML is the end state) */
Deck.define('dc-risks', {
  enter(api) {
    g().set(api.qa('.dc-am__h.is-risk'), { '--on': 0 });
    g().set(api.qa('.dc-am__rank'), { autoAlpha: 0, scale: 0.6 });
    g().set(api.qa('.dc-am__h.is-refuted'), { '--ref': 0 });
    g().set(api.qa('.dc-am__ref'), { autoAlpha: 0 });
    return api.tl();
  },
  beats: [
    (api) => api.tl()
      .fromTo(api.qa('.dc-am__h.is-refuted'), { '--ref': 0 }, { '--ref': 1, duration: d(2), ease: E.io, immediateRender: false }, T(0.1))
      .fromTo(api.qa('.dc-am__ref'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: d(2), ease: E.out, immediateRender: false }, T(0.2)),
    (api) => {
      const tl = api.tl();
      const order = [...api.qa('.dc-am__h.is-risk')].sort((a, b) => +a.querySelector('.dc-am__rank').textContent - +b.querySelector('.dc-am__rank').textContent);
      order.forEach((el, i) => {
        tl.fromTo(el, { '--on': 0 }, { '--on': 1, duration: d(2), ease: E.io, immediateRender: false }, T(0.1 + i * 0.1));
        tl.fromTo(el.querySelector('.dc-am__rank'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: d(2), ease: E.out, immediateRender: false }, T(0.18 + i * 0.1));
      });
      return tl;
    },
  ],
});

/* ── dc-today · how property management is structured today (4 Oct). One paused timeline, like op-title's;
   each press plays it from one label to the next, so a press forced to its end lands exactly on its step:
     s1  the property builds: its name, then its ten sections pop in menu order; "Everything hangs off the
         property" and "Ten sections, in the product's menu order". It plays as the part's cover lifts (the
         cover is the slide's first press), so the build is seen; without a cover (print, presenter) it is the entry.
     s2  "Each listing is a row in Overview, not a page": Overview is highlighted and a row per channel lands in it
     s3  "Channel settings live inside the sections": a "Per channel" pill pops on each section that holds them
   The So strip is declarative (data-beat="3"). Nothing fades or dims: tiles, blocks, rows and pills scale, the
   highlight wipes up, words rise out of their masks. The CSS is the last state. */
const todayStories = new WeakMap();
function todayStory(api) {
  const tl = g().timeline({ paused: true });
  const at = (s) => T(s);
  const inStep = (n, sel) => api.qa(`.dc-say[data-step="${n}"]`).flatMap((li) => [...li.querySelectorAll(sel)]);
  const pop = (els, s, o = {}) => {
    const list = [].concat(els).filter(Boolean); if (!list.length) return;
    tl.fromTo(list, { scale: 0 }, { scale: 1, duration: T(o.d ?? 0.5), ease: o.ease ?? 'back.out(1.6)', stagger: T(o.st ?? 0), transformOrigin: o.origin ?? '50% 50%', immediateRender: false }, at(s));
  };
  const rise = (els, s, st = 0.06) => { const list = [].concat(els).filter(Boolean); if (list.length) tl.fromTo(list, { yPercent: 115 }, { yPercent: 0, duration: T(0.6), ease: E.out, stagger: T(st), immediateRender: false }, at(s)); };
  const wipe = (els, s) => tl.fromTo(els, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T(0.55), ease: E.out, immediateRender: false }, at(s));
  const say = (n, s) => { pop(inStep(n, '.dc-say__i'), s, { d: 0.45, st: 0.16 }); rise(inStep(n, '.dc-say__t > span'), s + 0.08, 0.16); };

  const secs = api.qa('.dc-sec'), rows = api.qa('.dc-row'), pills = api.qa('.dc-pc');

  // the first frame: an empty card on the plate; every piece waits at nothing or below its mask
  g().set([api.q('.dc-prop__tile'), ...secs, ...rows, ...pills, ...api.qa('.dc-say__i')].filter(Boolean), { scale: 0 });
  g().set(api.qa('.dc-say__t > span, .dc-prop__t > span, .dc-prop__n > span'), { yPercent: 115 });
  g().set(api.qa('.dc-sec__hi'), { clipPath: 'inset(100% 0% 0% 0%)' });

  // 1 · everything hangs off the property, ten sections in menu order
  let b = 0;
  pop(api.q('.dc-prop__tile'), b, { d: 0.5 });
  rise(api.qa('.dc-prop__t > span, .dc-prop__n > span'), b + 0.05, 0.1);
  pop(secs, b + 0.2, { d: 0.5, st: 0.055, ease: 'back.out(1.4)' });
  say(1, b + 0.5);
  tl.addLabel('s1', at(b += 1.45));

  // 2 · each listing is a row on Overview, and nowhere a page
  say(2, b);
  wipe(api.qa('.dc-sec--ov .dc-sec__hi'), b + 0.1);
  pop(rows, b + 0.35, { d: 0.45, st: 0.12, origin: '0% 50%' });
  tl.addLabel('s2', at(b += 1.05));

  // 3 · channel settings live inside the sections: a pill on each section that holds them, in menu order
  say(3, b);
  pop(pills, b + 0.3, { d: 0.45, st: 0.09, origin: '0% 50%', ease: 'back.out(1.8)' });
  tl.addLabel('s3', at(b += 0.3 + 0.09 * pills.length + 0.5));
  return tl;
}

Deck.define('dc-today', {
  enter(api) {
    const story = todayStory(api); todayStories.set(api, story);
    const cover = api.el.querySelector(':scope > .hc-cover');
    if (!cover || api.still()) return api.tl().add(story.tweenFromTo(0, 's1'), T(0.25));
    /* Under the part's cover the entry plays unseen, and the cover's lift is the slide's first press
       (engine.js activate). The engine builds that lift right after this module's beats, so on the
       next microtask the property's build joins it: it builds as the cover goes, and a lift forced
       to its end (→ pressed mid-way, ←, ?beat) lands on the built property too. */
    queueMicrotask(() => {
      const lift = g().getTweensOf(cover).map((t) => t.parent).find((p) => p && p !== g().globalTimeline && p.paused());
      if (lift) lift.add(story.tweenFromTo(0, 's1'), T(0.3));
      else story.seek('s1');
    });
    return api.tl();
  },
  beats: [1, 2].map((n) => (api) => todayStories.get(api)?.tweenFromTo(`s${n}`, `s${n + 1}`)),
});
