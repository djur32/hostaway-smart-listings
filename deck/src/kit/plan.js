/* ============================================================================
   PLAN · how much of the deck you want to see.

   The Hospitable deck is at most 50 slides and every slide carries a path
   (MASTER-PLAN §7): S (Short, ~18 slides), St (Standard, ~32, the ~22-minute
   Loom) or E (Everything). This dialog, reused from the InvestEngine deck
   (deck/DECISIONS.md, reuse log), asks once how much to show and keeps the
   answer. Each part of the story can be set to its own depth, so a viewer can
   take the Standard run but go deep on Research, say.

   Nothing here decides what a slide means. Every slide carries, next to its
   data-id in src/slides/*.html:
     data-part   open · discovery · research · ia · concept · design · test · next · close · appendix
     data-path   S · St · E
   A part at depth "St" shows its S and St slides; at "E", all of them.
   Always in, whatever the plan: stage openers (.s--opener), the close, and a
   slide with no data-path (the safe default: a new slide shows up rather than
   disappearing without anyone noticing).

   PUBLIC API
     readPlan()                the stored plan, or null
     shown(section, plan)      is this slide in?
     countPlan(all, plan)      { slides, min } for a plan
     mountPlan(host, opts)     builds the dialog; returns { open, close }
   ========================================================================= */

import { d as dur, E, still } from './motion.js';

const KEY = 'hc:plan:v1';
const g = () => window.gsap;

const DEPTHS = ['S', 'St', 'E'];
const RANK = { S: 0, St: 1, E: 2 };
const DEPTH_NAME = { S: 'Short', St: 'Standard', E: 'All' };

/* The rows, in talk order. `k` is the plan key and the data-part it governs. */
export const ROWS = [
  { k: 'open',      nm: 'Opening',           note: 'Why listings are a burden, Smart Listings, the goals, the process.' },
  { k: 'discovery', nm: 'Discovery',         note: 'Today\'s product, the two truths, the signals, the questions.' },
  { k: 'research',  nm: 'Research',          note: 'Hosts, their words, insights, jobs, channel limits, and the structure it all led to.' },
  { k: 'concept',   nm: 'Concept',           note: 'Seven directions through the same listing screens, and how two became one.' },
  { k: 'design',    nm: 'Design',            note: 'Smart Listings in the running prototype: Base, Hub, channels, strategy, tips, receipts, performance.' },
  { k: 'test',      nm: 'Testing',    note: 'What the test changed, and how we would know it works.' },
  { k: 'next',      nm: 'Next steps',    note: 'What else this touches, what comes after, the story to tell.' },
];

const all3 = (d) => Object.fromEntries(ROWS.map(({ k }) => [k, d]));
export const PRESETS = { short: all3('S'), standard: all3('St'), all: all3('E') };
const DEFAULT = PRESETS.standard;

export function readPlan() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw || typeof raw !== 'object') return null;
    const p = { ...DEFAULT };
    for (const { k } of ROWS) if (DEPTHS.includes(raw[k])) p[k] = raw[k];
    return p;
  } catch { return null; }
}
export function savePlan(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

/** Is this slide in, under this plan? Openers, the close and anything unlabelled are. */
export function shown(s, p) {
  if (s.classList.contains('s--opener')) return true;
  const part = s.dataset.part, path = s.dataset.path;
  if (!path || !(path in RANK) || part === 'close') return true;
  if (part === 'appendix') return p.next === 'E';
  if (!(part in p)) return true;
  return RANK[path] <= RANK[p[part]];
}

/** How long a plan is, in slides and in minutes (each slide's own data-min). */
export function countPlan(all, p) {
  let n = 0, min = 0;
  for (const s of all) if (shown(s, p)) { n++; min += +(s.dataset.min || 0); }
  return { slides: n, min: Math.round(min) };
}
const samePlan = (a, b) => ROWS.every(({ k }) => a[k] === b[k]);

/* ══════════════════════════════════════════════════════════ THE DIALOG ══ */
/**
 * @param {HTMLElement} host   where the dialog lives (document.body)
 * @param {object} o
 * @param {() => Element[]} o.all      every slide, in deck order
 * @param {(p: object) => void} o.apply  called with the chosen plan
 */
export function mountPlan(host, { all, apply }) {
  let plan = { ...(readPlan() || DEFAULT) };
  let lastFocus = null;

  const el = document.createElement('div');
  el.className = 'plan'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'plan-title');
  el.innerHTML = `
    <div class="plan__scrim" data-plan-close></div>
    <section class="plan__box">
      <header class="plan__head">
        <p class="plan__eyebrow">Before we start</p>
        <h2 id="plan-title">How much of this do you want to see?</h2>
        <p class="plan__sub">Standard is the ~22-minute walk-through. Set any part deeper or lighter on its own.</p>
      </header>
      <div class="plan__presets" role="group" aria-label="A length to start from">
        ${[['short', 'Short'], ['standard', 'Standard'], ['all', 'Everything']].map(([k, nm]) => `
          <button type="button" class="plan__preset" data-preset="${k}">${nm}<em class="num"></em></button>`).join('')}
      </div>
      <ul class="plan__rows">
        ${ROWS.map((r) => `
          <li>
            <button type="button" class="plan__row" data-k="${r.k}">
              <span class="plan__nm">${r.nm}</span>
              <span class="plan__note">${r.note}</span>
              <span class="plan__n num" data-n></span>
              <span class="plan__two">${DEPTHS.map((d) => `<em data-v="${d}">${DEPTH_NAME[d]}</em>`).join('')}</span>
            </button>
          </li>`).join('')}
      </ul>
      <footer class="plan__foot">
        <div class="plan__meter" aria-hidden="true"></div>
        <p class="plan__count"><b class="num" data-count>0</b> of ${all().length} slides<span class="plan__dot">·</span><span class="num" data-mins>0</span> min</p>
        <button type="button" class="plan__go" data-plan-go>Start</button>
      </footer>
    </section>`;
  host.append(el);

  const box = el.querySelector('.plan__box');
  const meter = el.querySelector('.plan__meter');
  meter.innerHTML = all().map(() => '<i></i>').join('');
  const ticks = [...meter.children];

  /* Hovering a row lights exactly the slides it is worth, in the meter below: the count
     says how many, the meter says where in the talk they fall. */
  function hi(part) { const list = all(); ticks.forEach((t, i) => t.classList.toggle('is-hi', !!part && (list[i]?.dataset.part || 'open') === part)); }

  /* ── paint ─────────────────────────────────────────────────────────── */
  function paint(animate = false) {
    for (const r of ROWS) {
      const b = el.querySelector(`.plan__row[data-k="${r.k}"]`);
      b.classList.toggle('is-on', true);
      b.setAttribute('aria-label', `${r.nm}: ${DEPTH_NAME[plan[r.k]]}`);
      b.querySelectorAll('.plan__two em').forEach((e2) => e2.classList.toggle('is-on', e2.dataset.v === plan[r.k]));
      // what this part shows, as it stands, out of what it has
      const mine = all().filter((s) => s.dataset.part === r.k);
      b.querySelector('[data-n]').textContent = `${mine.filter((s) => shown(s, plan)).length}/${mine.length}`;
    }
    for (const [k, p] of Object.entries(PRESETS)) {
      const b = el.querySelector(`.plan__preset[data-preset="${k}"]`);
      b.querySelector('em').textContent = countPlan(all(), p).slides;
      b.classList.toggle('is-on', samePlan(plan, p));
    }
    const { slides: n, min } = countPlan(all(), plan);
    el.querySelector('[data-count]').textContent = n;
    el.querySelector('[data-mins]').textContent = min;
    paintMeter(animate);
  }

  function paintMeter(animate) {
    const list = all();
    const changed = [];
    list.forEach((s, i) => {
      const on = shown(s, plan), t = ticks[i]; if (!t) return;
      if (t.classList.contains('is-on') !== on) changed.push(t);
      t.classList.toggle('is-on', on);
    });
    // the ticks that changed do so in a quick run left to right, so the change is seen, not just found
    const step = changed.length ? Math.min(9, 190 / changed.length) : 0;
    ticks.forEach((t) => { t.style.transitionDelay = ''; });
    if (animate && !still()) changed.forEach((t, i) => { t.style.transitionDelay = `${Math.round(i * step)}ms`; });
    el.querySelector('.plan__rows')?.classList.toggle('is-scroll', rowsOverflow());
  }
  const rowsOverflow = () => { const r = el.querySelector('.plan__rows'); return !!r && r.scrollHeight - r.clientHeight > 2; };

  /* ── open and close ────────────────────────────────────────────────── */
  function open() {
    if (!el.hidden) return;
    lastFocus = document.activeElement;
    el.hidden = false; hi(null); paint(false);
    el.querySelector('.plan__go').focus({ preventScroll: true });
    if (still() || !g()) return;
    const gs = g();
    gs.killTweensOf([el.querySelector('.plan__scrim'), box]);
    gs.fromTo(el.querySelector('.plan__scrim'), { opacity: 0 }, { opacity: 1, duration: dur(1), ease: E.io });
    gs.fromTo(box, { opacity: 0, y: 16, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: dur(2), ease: E.out });
    gs.fromTo(box.querySelectorAll('.plan__preset, .plan__rows li, .plan__foot'),
      { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur(1), ease: E.out, stagger: 0.026, delay: 0.05 });
  }

  function close(commit) {
    if (el.hidden) return;
    const done = () => {
      el.hidden = true;
      if (commit) { savePlan(plan); apply({ ...plan }); }
      lastFocus?.focus?.({ preventScroll: true });
    };
    if (still() || !g()) return done();
    const gs = g();
    gs.killTweensOf([el.querySelector('.plan__scrim'), box]);
    gs.to(box, { opacity: 0, y: -8, scale: 0.99, duration: dur(1) * 0.9, ease: E.in });
    gs.to(el.querySelector('.plan__scrim'), { opacity: 0, duration: dur(1), ease: E.io, onComplete: done });
  }

  /* ── input ─────────────────────────────────────────────────────────── */
  el.addEventListener('click', (e) => {
    const t = e.target; if (!(t instanceof Element)) return;
    if (t.closest('[data-plan-go]')) return close(true);
    if (t.closest('[data-plan-close]')) return close(true);      // dismissing keeps what is on screen
    const pre = t.closest('[data-preset]');
    if (pre) { plan = { ...PRESETS[pre.dataset.preset] }; paint(true); return; }
    const row = t.closest('.plan__row');
    if (row) {
      const r = ROWS.find((x) => x.k === row.dataset.k); if (!r) return;
      const pick = t.closest('.plan__two em');       // a depth named directly, or the next one round
      plan[r.k] = pick ? pick.dataset.v : DEPTHS[(RANK[plan[r.k]] + 1) % DEPTHS.length];
      paint(true);
    }
  });
  el.querySelectorAll('.plan__row').forEach((b) => {
    const r = ROWS.find((x) => x.k === b.dataset.k);
    const on = () => hi(r?.k), off = () => hi(null);
    b.addEventListener('pointerenter', on); b.addEventListener('pointerleave', off);
    b.addEventListener('focus', on); b.addEventListener('blur', off);
  });

  el.querySelector('.plan__rows').addEventListener('pointerleave', () => hi(null));

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(true); }
  });

  paint(false);
  return { open, close: () => close(true), isOpen: () => !el.hidden, plan: () => ({ ...plan }) };
}
