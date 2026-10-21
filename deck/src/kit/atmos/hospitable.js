/* ============================================================================
   HOSPITABLE ATMOSPHERE · the ground, and nothing else.

   The product is flat: white content, a blush onboarding rail, an aubergine
   sidebar. So the deck's "atmosphere" is only the colour of the window behind
   the 1920 × 1080 stage, which follows the slide's data-ground:
     white      content slides
     blush      the title, the close, quieter slides
     aubergine  a part's cover (the sidebar's ground)
   On a window that isn't 16:9 the band beside the stage is the same colour as
   the slide, so the picture never reads as a card on a wrong background.
   No mesh, no ink, no grain (D-071). Motion: a plain cross-fade of the colour,
   instant with motion off.
   ========================================================================= */
import { Deck } from '../engine.js';
import { still, d as dur } from '../motion.js';

const GROUND = { white: '--bg', blush: '--bg-2', aubergine: '--dark' };

function mount(host) {
  host.classList.add('hc-atmos');
  return { host };
}

function slide(S, { slide: el, instant }) {
  // a part's first slide under its cover (.hc-cover, before the first beat) stands on aubergine
  const key = GROUND.white;                         // one ground for the whole talk (3 Oct)
  S.host.style.transition = instant || still() ? 'none' : `background-color ${dur(2)}s cubic-bezier(0.65, 0, 0.35, 1)`;
  S.host.style.backgroundColor = `var(${key})`;
}

function unmount(S) { S.host.classList.remove('hc-atmos'); S.host.style.backgroundColor = ''; }

Deck.atmos('hospitable', { mount, slide, unmount });
