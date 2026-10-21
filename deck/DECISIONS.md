# DECISIONS · why the Hospitable deck is the way it is

The deck is a detached copy of the InvestEngine process deck (`~/Developer/process-deck`, read-only; D-002). This file says what S07 kept, dropped and adapted from it, and why. The InvestEngine deck's own decisions are parked in `_origin/docs/DECISIONS.md`. Case-level decisions also live in Notion's Decisions database with the same IDs.

S07's ID range: **D-070 to D-079**, **OQ-070 to OQ-079**.

---

## Reuse log

One line each: what, and why.

### Kept

| Piece | Where | Why |
|---|---|---|
| The 1920 × 1080 stage, scaled to the window | `kit/engine.js`, `kit/deck.css` | Every slide keeps its composition at any size. Nothing is re-laid out, so what S17 checks is what the Loom shows. |
| Beats (`data-beat`), ← lands on the finished slide | `kit/motion.js`, `kit/engine.js` | Content is revealed in the order Antonio talks through it. |
| Declarative motion (`data-a="rise · lines · grow · draw · count…"`) | `kit/motion.js` | The new chart marks carry `data-a`, so they animate with no per-slide code and land in their final state with motion off. |
| ⌘K / `O` jump palette | `kit/engine.js` | Now searches by part, title, `D-###`/`I-##` in `data-notion`, and `R-###`. |
| Personalise (`V`): Short, Standard, Everything | `kit/plan.js`, `kit/plan.css` | It maps straight onto MASTER-PLAN §7's S / St / E. It was re-keyed from the InvestEngine rows to parts × depth (D-075). |
| Presenter window (`P`): notes, next slide, a clock that tracks drift | `kit/engine.js` | This is the Loom's script. The clock budgets from each slide's `data-min`. |
| The detail layer ("a layer below the slide") | `kit/engine.js`, `kit/deck.css` | It's the natural home for "In Notion" deep dives. It stays in the talk without costing a slide against the 50 limit. |
| Primitives: rows, KPIs, rails, doors, connectors, glyphs, tags | `kit/components.css`, `kit/links.js`, `kit/glyphs.js` | They're content-agnostic and restyle through tokens. |
| Screenshot lightbox (click any screen, → through the set) | `kit/engine.js` | The 7 × 5 concept grid opens its frames with it. |
| The live-embed mechanics ("Open live", poster on the wall) | `kit/engine.js` → `kit/hc.js` `.hc-live` | They're re-pointed from Figma to the prototype (localhost:5174 locally, `/prototype` when deployed). |
| Reduced motion (`prefers-reduced-motion`, `?motion=calm|off`) | `kit/tokens.css`, `kit/motion.js` | This is accessibility, and QA shoots with motion off. |
| Responsive and touch: swipe, double-tap zoom, the turn-your-phone card | `kit/responsive.css`, `kit/touch.js` | The deck is shared as a link, and people open links on phones. |
| Lazy images (`data-shot`, `data-src`), the light `dist/` build | `kit/engine.js`, `tools/dist.mjs` | Cold open is 13 requests / 208 KB. |
| The build lint (words, dashes, missing attributes, doors, tokens, class collisions) | `tools/build.mjs` | It's extended, not replaced (see "Lint" below). |
| QA tools: `shoot`, `walk`, `smoke`, `export-pdf`, `sheet.py`, `dist`, `serve`, `audit-motion`, `shoot-more` | `tools/` | They're patched to one theme. `walk` and `smoke` run with `?qa`, so the first-visit dialog can't hold the keys. |
| The opener's fixed frame (number, name, vision, methods: one position on every opener) | `components.css .opener` | It's reused inside the part covers (D-072). |

### Dropped

| Piece | Why |
|---|---|
| Studio and Lumen, the two four-colour themes, and the `Y` switch | There's one look, Hospitable's (D-071). The skins are parked in `_origin/kit/themes/`. |
| Atmospheres (studio ink mesh, lumen fields), film grain, the thread | The product is flat. The atmosphere now only paints the window's ground (`atmos/hospitable.js`). The atmospheres are parked in `_origin/kit/atmos/`. |
| The digimal.studio mark and the "The six stages" titles | They're replaced by the Hospitable lockup and "Listing Management II · case study". |
| The case badge (`stories.json`, client logos) | This deck has one case. `data/stories.json` is left empty so the engine code stays untouched. |
| Job Atlas and market-signal pieces, the three-lens grammar (did / hold / now), the "me" strip | They belonged to a portfolio talk, not to a case study. The CSS stays in `components.css` (unused) so nothing old breaks. |
| InvestEngine, Adeslas, Santander, ASISA and Hostaway screens, videos, art and client logos | Moved to `_origin/assets/`. Hostaway's logo is kept, because it's a competitor (CMP). |
| The light/dark screen switch (`L` still works; nothing in this deck has pairs) | Hospitable's product screens exist in one mode. |
| Paths to the website | S00 deleted `web-bundle.mjs` and cut the gate key. `tools/audit.mjs` checks that nothing in `deck/` points at process-deck or digimal.studio. |

### Adapted

| Piece | From → to | Decision |
|---|---|---|
| The spine | Six stages → Intro + seven parts as tabs | D-070 |
| Stage openers (separate slides) | → a **cover** that is the first beat of a part's first slide | D-072 |
| Provenance chips (record / recon / plan) | → the six CONVENTIONS §2 labels, S02's `--prov-*` tokens | D-073 |
| The orchestration graph (`kit/orch.js`) | Kept, unused. It could show *how this case was made with AI sessions* in the appendix (S17's call). | none |
| The coverage list and "elsewhere" blocks | Kept in the kit, unused. The problem → response row (`.hc-pr`) does their job here. | none |

---

## D-070 · Eight tabs: Intro and seven parts (2026-09-29, S07)

**Decision.** The top bar shows Intro · Discovery · Research · IA · Concept · Design · Test & measure · Systems & next (`data-stage` 0 to 7; 8 is the appendix, which is not a tab). The close ("What I'd do on Monday") sits under Systems & next.
**Options.** (a) Keep six stages and fold IA into Research→Concept and Systems into the close, as CONVENTIONS §7 sketches. (b) Eight parts, one per MASTER-PLAN §5 stage. (c) Eight tabs as here, with Test and Measure merged.
**Why (c).** The IA work (object model, one fact under four names, seven structures) is the argument of angles A and B. Folding it into Research would hide the structural thinking the panel rewards ("systems thinking"). Test and Measure are four slides between them, and one tab is enough. Eight labels fit the bar at wall size.
**Evidence and strength.** MASTER-PLAN §5 and §7, the brief's lens (plan/CONVENTIONS.md §1). Moderate: it's a judgement about emphasis.
**Serves.** R-182, R-187. **Reversible:** two-way door (`STAGES` in `kit/engine.js` and the part files).
**Revised 2026-10-03 (Antonio):** "information architecture is the tangible decision of the research, so it should not have its own section; it's what the research translates into." IA folds into Research: seven tabs, Intro · Discovery · Research · Concept · Design · Test & measure · Systems & next (`data-stage` 0 to 6). The IA slides close the Research part under "What it became". Option (a) of this record, for a different reason than CONVENTIONS gave.
**Note.** CONVENTIONS §7 still says "six-stage spine". OQ-072 asks S-plan to update it.

## D-071 · One theme, taken from ds/tokens.css through one door (2026-09-29, S07)

**Decision.** `data-theme="hospitable"` only. `kit/tokens.css` is the deck's semantic layer (`--bg`, `--ink`, `--accent`, `--dark`, `--ai-*`, `--ch-*`…). Every value in it is a `var()` into S02's **role** tokens (`--color-sidebar-bg`, `--color-action-primary`, `--color-ai-surface`, `--prov-*`…). The design system arrives through a single copy step: `tools/sync-ds.mjs` copies `ds/tokens.css` to `src/kit/ds/tokens.css` (and `ds/illustrations/*.svg` to `src/assets/illustrations/`) on every build, and `kit/tokens.css` imports it into the lowest cascade layer (`@layer ds`), so a name clash can't move the deck. The deck holds no raw colour, and the build fails if one appears.
**Options.** (a) Copy S02's values into the deck. (b) Link `../../ds/tokens.css` directly, which breaks for `dist/` and a deck-only deploy. (c) One sync step and a layered import.
**Why (c).** The values are never hand-copied, and the deployed deck still has them.
**History.** S02 was still in progress when S07 started, so S07 began on a provisional file of colours it sampled from the screenshots (HS-01, HS-30, HS-40, HS-48). S02's tokens landed the same afternoon and replaced it. Lesson: S07's samples were off (raspberry `#DA4C6C` against S02's `#E1295A`) because the screenshots are Display-P3 and S07 didn't convert to sRGB. S02 did. The provisional file is deleted.
**Also synced** once S02 finished: `ds/components.css` (S02's `h-*` components, in the `ds-ui` cascade layer, above the deck's `base` reset so their buttons keep their look) and `ds/icons/sprite.js` (Tabler icons and the channel marks). The top bar's mark is S02's `#ch-hospitable`, and channel chips carry the real marks. A slide shows one real product component with `.h-root.hc-ui` (zoomed), never hand-rebuilt UI.
**Serves.** R-181, R-150. **Strength:** strong (REAL·PUBLIC CSS + REAL·PRODUCT samples, via S02).

## D-072 · A part opens under a cover, not on an extra slide (2026-09-29, S07)

**Decision.** Each part's cover (the part's name, its question from MASTER-PLAN §5, its methods and outputs, and S02's illustration on a blush disc, all on the sidebar's aubergine) is the **first beat** of the part's first slide. → lifts it into the top bar, and the chrome turns from aubergine to white. The cover is written once per part as `<template class="hc-cover-tpl" data-stage="N">`. The engine places it on whichever slide opens that part *in the current plan*, so Personalise can never cut a part's cover.
**Options.** (a) Seven opener slides, which would make 56 slides, over R-185's 50. (b) No openers. (c) Covers as a beat.
**Why (c).** It keeps the chapter moment that makes a 22-minute Loom navigable, at zero slide cost. ← and motion-off land past it, and so does print (the PDF shows slides, not covers).
**Serves.** R-185, R-181, R-188. **Strength:** moderate. **Reversible:** two-way.

## D-073 · Guardrails on the wall (2026-09-29, S07)

`<meta name="robots" content="noindex, nofollow">` sits on every page. The title and the close carry the line *"Concept work by Antonio Silva for Hospitable's Head of Design case study. Product UI © Hospitable."* Hospitable's mark is redrawn for identification only. Provenance chips use CONVENTIONS §2's six labels, and SIMULATED reads **"Illustrative"** on the wall (its dot is hollow). Stand-in numbers in placeholders say "Layout only".
**Serves.** R-189 (guardrails), D-003. **Strength:** strong (the brief and CONVENTIONS).

## D-074 · Placeholders are wireframes of the intended component (2026-09-29, S07)

Each of the 49 slides carries its title, its one-sentence message (`.hc-msg`) and a dashed placeholder. Where the component is known, the placeholder shows that component (browser frame, chart, quote cards, decision card, grid) with neutral stand-ins, the words on the left and the wireframe on the right. It names the source S17 fills it from. So the deck already reads as the story, and S17 swaps content in place rather than designing layouts.
**Serves.** R-188, R-187.

## D-075 · Personalise is parts × depth (2026-09-29, S07)

The InvestEngine rows (approach, main case, second case…) are gone. Each part is a row set to Short, Standard or All; the presets set every row at once. A slide shows when its `data-path` is within its part's depth. Covers, the close and slides with no `data-path` are always in. Counts today are **Short 21 · Standard 41 (21.3 min) · Everything 49 (25.3 min)**, straight from MASTER-PLAN §7. The plan's targets are ≈18 and ≈32: see OQ-070.
**Serves.** R-185, R-014.

## D-076 · The deck sells Smart Listings; the process is the proof (2026-10-03, S07 follow-up at Antonio's request)

Antonio: "it has to be more of a selling tool than just a pure presentation." The story is now his concept, **Smart Listings** (one base of facts, a strategy per channel, tips with a why, nothing written unseen, every strategy measured), with discovery to measurement told as the proof. Every slide holds real content from the repo; nothing is invented. The title reads "Head of Design case study", not "Listing Management II" (Antonio, 3 Oct). The intro is written in a marketing voice: claims, not descriptions. S15 added `op-goals` (D-990) so Part 6 closes the loop against goals set at the start. 50 slides.
**Serves.** R-180 to R-189, R-116. **Strength:** Antonio's direction.

**Correction, same day (Antonio):** he worked on **Angle B only** (the intelligent listing) and took it further into Smart Listings with his own spin; he did not work on Angle A (first-time setup). The deck no longer says "A and B as one story": op-brief states the choice and the spin, the import slide is gone, rs-journey is reframed as "where trust breaks" (Everything path), and op-goals and tm-measure lead with Smart Listings metrics, not the setup north star.

## D-077 · One ground, quiet provenance, swift motion (2026-10-03)

The coloured-to-white ground switch read as "tacky" (Antonio); every slide and every cover is white now. Provenance stays on every claim but as quiet text with a glyph (filled: real; hollow: simulated; half: projected; diamond: assumption) in one source line at the foot, not as chips on the wall. Slide changes are a short fade (no lift, no blur), so the deck moves swiftly. The variable TT Norms is loaded first.
**Serves.** R-189, R-183.

## D-078 · Mockups are the running prototype, floating flat (2026-10-03)

Design slides show real captures of the prototype (`tools/capture-proto.mjs`, `?smart=on` demo), composed as flat floating frames with zoomed details and callouts, never 3D. Scenes fit the slide body automatically. Two links open the deployed website and mobile app live. The wall-word warning moved to 110, with footnotes and captions excluded, because Antonio asked for depth; detail layers carry the rest.
**Serves.** R-101, R-140, R-184.

## D-079 · AI in the process is shown end to end, briefly (2026-10-03)

Antonio: mention how the work was agentified, "don't talk too much about this but… make sure it is covered end to end." The method slide shows the orchestration (sessions in waves, connected tools, his five gates), and each part's cover carries one "With AI" line (data/agentified.json) on what agents did in that stage and what he decided. Facts come from plan/STATUS.md.
**Serves.** R-035, R-037.

---

## Lint (tools/build.mjs), added by S07

| Rule | Level |
|---|---|
| More than **50** slides in the deck | **error** (exit 1) |
| A raw colour (`#hex`, `rgb()`, `hsl()`, `oklch()`) in a slide or in any kit stylesheet (only `src/kit/ds/*` may hold one) | **error** |
| A slide without `data-notion` | warning |
| A slide without `data-part`, `data-path`, `data-angle` or `data-req`, or with a value outside the allowed set | warning |
| A `--color-*`, `--font-*` or `--radius-*` the deck asks for that the synced ds/tokens.css doesn't define | warning |

## Open questions raised

- **OQ-070** (for S17, Antonio). MASTER-PLAN §7's paths give Short 21 and Standard 41, against the plan's ≈18 and ≈32. At the current `data-min` budgets Standard runs 21.3 min, so the Loom target holds, but the slide count doesn't. Candidates to move from St to E: 8 (research questions), 13 (evidence → insight), 18 (others + PIM), 21 (bathtub), 24 (principles), 26 (how we judged), 33 or 34 (titles or description), 46 (systems).
- **OQ-071** (for S02). There are five illustrations for seven covers, so Design reuses *listings together* and Test reuses *conflict resolved*. Two more scenes (a research scene, a test or measure scene) would give every part its own.
- **OQ-073** (for the plan and S15, Antonio). Antonio's case is Angle B only (3 Oct). CLAUDE.md, MASTER-PLAN and D-001 still say "Angles A and B, gone deep", and S15 chose a setup metric as the programme's north star (K-01, D-991). The deck now leads with B metrics (K-06, K-13/K-15, K-17, K-23) and keeps K-01 in a detail. Update the plan's framing, and decide whether Smart Listings needs its own north star.
- **OQ-072** (for S-plan). CONVENTIONS §7 says "six-stage spine with IA folded into Research→Concept". The deck has eight tabs (D-070). Update CONVENTIONS §7, or overrule D-070.
