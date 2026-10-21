/* ============================================================================
   20 · RESEARCH · the bespoke choreography (3 Oct).

     rs-insights   the first press lifts the insight that changed the design most
                   (explaining a suggestion): it grows a touch and a ring draws round it
     rs-channels   the first press lifts Booking.com the same way (never dim the rest)

   Everything else on these slides is declarative (data-a, data-beat): rs-market's two
   panels rise, the comps' middle half grows, the AI tip pops on the second press.
   Beat tweens are explicit fromTo with immediateRender: false, and every piece ends
   in its final state with motion off.
   ========================================================================= */
import { Deck } from '../kit/engine.js';
import { E, d } from '../kit/motion.js';

const g = () => window.gsap;

/** the press lands on one card: it grows a touch while its hand-drawn ring draws (the ring is
    declarative, data-a="draw" on .rs-ring). Nothing else changes: Antonio, 3 Oct, never dim. */
function lift(api, sel) {
  const el = api.q(sel); if (!el) return api.tl();
  return api.tl().fromTo(el, { scale: 1 }, { scale: 1.04, duration: d(2), ease: E.out, immediateRender: false }, 0);
}

Deck.define('rs-insights', { beats: [(api) => lift(api, '.rs-in[data-focus]')] });

Deck.define('rs-channels', { beats: [(api) => lift(api, '.rs-chc[data-focus]')] });

/* ── rs-jobs · choose a job to show its journey map; the others are hidden, not dimmed ── */
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.rs-jm__chip'); if (!chip) return;
  const root = chip.closest('.rs-jm'); const key = chip.dataset.job;
  root.querySelectorAll('.rs-jm__chip').forEach((b) => b.classList.toggle('is-on', b === chip));
  root.querySelectorAll('.rs-jm__fig').forEach((f) => f.classList.toggle('is-off', f.dataset.job !== key));
});
