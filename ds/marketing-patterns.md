# Marketing patterns · Hostaway's site language, for the deck

Added 3 Oct (evening) so the deck "embodies the design and the flair of Hostaway" (Antonio). Borrowed from hostaway.com: references in `research/references/hostaway-marketing/` (README lists what each image lends). These are **presentation patterns**, not product UI: they live in `deck/src/kit/hc.css` (styles) and `deck/src/kit/hc.js` (behaviour). The product's own components stay in `ds/components.css` (`h-*`) and are used on slides through `.h-root.hc-ui`.

Rules that hold for every pattern below:

- **Tokens only.** Every colour is a `ds/tokens.css` variable (the build fails on a raw colour).
- **Colour lives in plates, tiles, covers and accents.** Content slides stay mostly white.
- **Lavender means AI.** A lavender tile, panel or pill marks something AI does; other topics rotate blush, butter, mint.
- **Motion is subtle and ends at rest.** Entry through the deck's `data-a` pass; idle loops are CSS keyframes whose 0% and 100% are the rest state (motion off, print and `prefers-reduced-motion` land there). No idle drift stronger than 6 px or 4°.
- **TT Norms everywhere**, including chart text, chips and IDs (`--font-code` now points at the sans).
- No glow (no `drop-shadow`, no text-shadow); soft box shadows tinted with `--color-sidebar-bg` only.

## 1 · Tints

`data-tint="blush|lavender|butter|mint"` (or `.hc-tint--…`) on any container sets the roles its children read.

| Role | blush | lavender | butter | mint | Used for |
|---|---|---|---|---|---|
| `--tint-plate` | primary-100 | secondary-100 | warning-100 | success-100 | a feature plate, a tile |
| `--tint-halo` | primary-200 | secondary-200 | warning-200 | success-200 | the halo around UI; **cover plates** (bolder) |
| `--tint-soft` | primary-50 | secondary-50 | warning-50 | success-50 | a lighter wash (tree nodes) |
| `--tint-ink` | primary-700 | secondary-700 | orange-700 | success-700 | the badge fill, small accent text (AA on white text) |
| `--tint-line` | primary-600 | secondary-600 | orange-600 | success-600 | one line icon on a tile |
| `--tint-title` / `--tint-body` | sidebar-bg / ink-2 | secondary-900 / secondary-800 | sidebar-bg / ink-2 | sidebar-bg / ink-2 | headline and copy on the plate (aubergine on lavender, reference 06) |

## 2 · Part covers as features (`.hc-cover`)

References 06, 08, 10. Written once per part as `<template class="hc-cover-tpl">` with the words only (`.opener__name`, `__vision`, `__methods`, `__out`) and an `.hc-illo`. `hc.js covers()` builds the rest when the engine places the cover. review, 3 Oct (late): no "Part N of 6" badge (any `.opener__n` is dropped by `covers()` and hidden by CSS), no "With AI" line (`data/agentified.json` stays for other slides; the covers no longer read it).

- `.hc-cover__plate`: a 48 px-radius panel in the part's `--tint-halo`, inset 40 px from the slide edges, under the top bar. The chrome sits on the same 40 px inset (`--chrome-x` in the theme), so the plate never runs wider than the brand and the status.
- **Left column, all the words** in aubergine: the part name at 128 px, the question at 34 px, then at the foot the **Methods** as white chips and the **Outputs**.
- **Methods** use standard method names only (Heuristic evaluation, Information architecture audit, Content inventory, Desk research, Assumption mapping, Stakeholder mapping, User interviews, Card sorting, Competitor analysis, Affinity mapping, Personas, Jobs to be done, Object modelling, Design principles, Divergent ideation, Wireframing, Weighted scoring matrix, Sensitivity analysis, Concept testing, High-fidelity prototyping, Interaction design, Content design, Design systems, Responsive design, Tree testing, Usability testing, Benchmarking, A/B testing, KPI tree, Value proposition, Messaging framework, Systems mapping, Roadmapping), and only those the part's slides actually show.
- **Outputs** are what the part produces, one row per mark, the mark first, then the outputs as words separated by commas:
  ```html
  <div class="opener__out"><p class="opener__k">Outputs</p>
    <p class="opener__outrow"><span class="hc-mark" data-mark="produced"></span><span class="opener__outs"><span>Object model</span><span>Information architecture</span></span></p>
    <p class="opener__outrow"><span class="hc-mark" data-mark="sampled"></span><span class="opener__outs"><span>4 personas</span></span></p>
    <p class="opener__outrow"><span class="hc-mark" data-mark="planned"></span><span class="opener__outs"><span>25 real host interviews</span></span></p>
  </div>
  ```
  `produced` made in this case · `sampled` made from a simulated sample (personas and insights from five sampled interviews, a simulated card sort or test) · `planned` what would be produced with real access, not produced under the case's constraints. See §11.
- `.hc-cover__art` inside the plate: the part's drawing **oversized** (review, 3 Oct: "overblown", references 08 and 10): 1480 px wide, about 1.15 times the plate's height, anchored past the plate's right and bottom edges (`right: -420px; bottom: -110px`) so the plate crops it and it dominates the slide, starting just after the words' column. No disc behind it. It is inlined (`hc.js inlineIllo`) so its own "///" strokes take the cover's stroke tone. Nothing in the kit depends on the drawing's head or pose, only its 320 × 220 frame, so redrawn mascots drop in under the same file names.
- One doodle of the cover's own: a ring in the gap between the part name and the drawing. More would fight the oversized drawing; nothing floats over the art.
- **Doodle tones per plate** (`hc.js DOODLE_TONES`: the ring · the strokes, which the drawing's own "///" strokes take): blush purple · aubergine; lavender raspberry · aubergine; butter purple · raspberry; mint purple · raspberry. Never yellow on blush, lavender or mint. The mascots keep their own colours.
- **Config:** `deck/src/data/covers.json`, keyed by `data-part` (`discovery`, `research`, `concept`, `design`, `test`, `next`): `{ "illo": "<name>", "tint": "<tint>", "flip": true? }`. `flip` mirrors a drawing whose figure stands at its right edge (research), so the figure lands next to the words and its props run off the plate. A drawing not yet in `assets/illustrations/index.json` falls back to the template's own `data-illo`.
- **Entry** (set as `data-a`, so motion off and `?t=` freezes work): plate fade 0 s · name 0.1 · mascot rise 0.12 · question 0.18 · methods stagger 0.28 · ring draws 0.34 · outputs 0.4. Settled in about 1 s.
- **Idle:** the drawing bobs 6 px and 0.6° over 6.5 s (its own SVG animations run too); the ring sways 4° over 9 s.

## 3 · Pill badge (`.hc-badge`)

"Hostaway exclusive" (references 01, 02). 40 px tall, `--r-pill`, fill `--tint-ink`, white 18 px semibold text. Sits centred on top of a feature plate, or leads a card (`op-brief` "My spin").

## 4 · Floating chips (`.hc-chip`)

The assistant's question chips (references 02, 06, 07). White, `--r-pill`, 19 px medium, a 1 px aubergine-7% ring and a soft aubergine-45% shadow below. Optional leading icon `.hc-chip__i` (sprite `<use>`) stroked in `--tint-line`.

- `--q` a question: 16 px radius, roomier, wraps. `--ai` lavender text and icon. `--ok` a receipt: success icon.
- On a scene: `.is-at` with `--x --y`. Groups: `.hc-chips` (flex, 12 px gap), staggered in with `data-a="stagger"`.
- Idle: `.is-drift`, `.is-drift-2`, `.is-drift-3` (5 px, 6 to 8.5 s, out of phase).

## 5 · Feature card (`.hc-feature`)

References 01, 02, mockup 11. A 32 px-radius card: `.hc-feature__plate` in `--tint-plate` (min 340 px; `--plate-h`), an optional `.hc-badge` centred on top, one UI element on `.hc-feature__halo` (14 px ring of `--tint-halo` mixed into the plate, 30 px radius), then `.hc-feature__body` on white with `__t` (30 px semibold) and `__d` (21 px, ink-3). `.hc-features` lays out `--n` of them.

- `--stat`: a short plate (190 px) holding one big number `.hc-feature__v` (76 px, `--tint-ink`). Used on `tm-measure`.
- `.hc-mini`: a white mini-UI for the halo, rows of a label and a state (`.hc-mini__s` with an icon; `.is-ai`, `.is-ok`, `.is-lock`). Used on `nx-story` with the product's own strings ("Uses the Base", "Custom for Airbnb", "Set by Booking.com"; the Autopilot log).
- A product component on a halo: `.h-root.hc-ui` + `ds/components.css` markup (the tip card, `.h-tip`).

## 6 · Comparison table (`.hc-compare`)

Reference 05. A grid: a label column (`--label-w`) and `--n` columns. The highlighted column's cells carry `.is-hi` (blush `primary-50`, the header rounded on top, the last cell `.is-end` rounded below), so it can fill in on a beat with its cells. Marks: `.hc-check` (36 px filled `primary-700` disc, white tick drawn in CSS), `.hc-x` (30 px hairline circle, ink-4 ×). Used on `op-shift` (Today against With Smart Listings; the Smart Listings column arrives on beat 1).

## 7 · Doodles (`.hc-doodle`)

Reference 11. `<span class="hc-doodle" data-doodle="ring|strokes|squiggle|swoosh" data-tone="raspberry|purple|aubergine|yellow|mint" style="--size: 140px">`. `hc.js` draws a 100×100 SVG of round-capped paths; the stroke is `--doodle` (primary-500, secondary-500, secondary-800, yellow-300, success-400) at 11 units. Pairings that hold: on blush purple and aubergine; on lavender raspberry and aubergine; on butter and mint raspberry and purple; yellow only on white or aubergine. `data-a="draw"` draws it in. Don't combine with `stroke-dasharray`: DrawSVG owns the dash. Rings sway; strokes drift.

## 8 · Pillar tiles (`.hc-pillar__i`)

Reference 12. A 104 px, 28 px-radius pastel tile with one 46 px line icon in `--tint-line` (stroke 1.8). Tints rotate per pillar blush, butter, mint; `--ai` is lavender. `.hc-pillars--tiles` makes the tile a wide 16:11 plate with a 64 px icon (`op-idea`). The icon sways 4° slowly, out of phase per pillar; a hover lifts the tile 3 px.

## 9 · Lists and panels

- `.hc-points--ai`: the assistant's lavender arrow bullets (reference 07): a 40 px secondary-100 disc with a secondary-600 →. Other lists keep the raspberry dot.
- `.hc-panel`: 28 px radius; `data-tint` paints it with `--tint-plate`; `--ai` is lavender with a secondary-700 key.

## 10 · Tree (`.hc-tree`)

The KPI tree in HTML (replaces the old PNG): a tinted root, then `.hc-tree__row` of `--n` nodes on `--tint-soft`, joined by 2 px `--line-2` connectors drawn in CSS. Used in `tm-measure`'s detail.

## 11 · Provenance colours (`--prov-*`, `.hc-prov`, `.hc-mark`)

One colour per kind, the same on every slide (review, 3 Oct: the kinds were coloured on one slide and grey on the others). Kit tokens in `deck/src/kit/hc.css`, built from ds tokens:

| Kind | Ink | Background | Family | `data-prov` |
|---|---|---|---|---|
| Real | `--prov-real` (success-700) | `--prov-real-bg` (success-50) | green | `brief`, `product`, `public` |
| Simulated | `--prov-sim` (orange-700) | `--prov-sim-bg` (orange-50) | orange (never purple: lavender/purple means AI in Hostaway's language) | `simulated` |
| Projected | `--prov-proj` (blue-700) | `--prov-proj-bg` (blue-50) | blue | `projected` |
| Assumption | `--prov-assume` (gray-700) | `--prov-assume-bg` (gray-50) | gray, a design call not yet tested | `assumption` |
| (Planned output) | `--prov-plan` (gray-600) | white, `--prov-plan-line` (gray-400) dashed | neutral | n/a |

- `.hc-prov` (the footer chips on every slide, in charts and quotes): glyph and label in the kind's ink, no fill, readable on white. The glyph still tells the kind without colour: ● real · ○ simulated · ◐ projected · ◇ assumption. On an aubergine ground the chips fall back to `--on-dark-2`.
- `.hc-mark[data-mark="produced|sampled|planned"]` (the covers' Outputs): a 30 px pill, the word fills itself. produced = the real colours (filled dot), sampled = the simulated colours (hollow dot), planned = a dashed gray outline on white (hollow dot).
- Any slide-level legend of the kinds uses the same tokens; never a new colour for a kind.

## 12 · More and the detail card (`.more-btn`, `.more-sheet`)

review, 3 Oct: pop-ups "anywhere" read as pop-ups; the detail should be "available from the top right of the content area, opposite the headline", and opening it should "dispel all of the content away from the slide, like a boomerang". Engine: `deck/src/kit/engine.js` (DETAILS); styles: `deck/src/kit/components.css` (the button) and `deck/src/kit/deck.css` (the card, the throw).

- **The door.** One `.more-btn` per `<template class="more">`, added by the kit on the headline's first line at the content's right edge. The product's outlined button at wall size: 48 px tall, `--r-1` (8 px) corners, a 1 px `--color-gray-300` outline, no fill, no shadow, `--ink-2` words and a plus; under the pointer the outline and words darken. Label: the template's `data-label`, else "More". It sits under a part's cover, so it never shows through one.
- **The throw.** The slide's blocks (the head's lines, the body's blocks or, where a block paints nothing of its own, its items, the foot's parts) leave by the nearer side of the canvas: across with an ease-in, a small early arc (up a little, spread from the middle), a turn of 3–6° the way they go, top to bottom about 0.03 s apart, about 0.55 s in all. They ride `translate`/`rotate` (registered `--fx --fy --fr`), never the transforms the slide animates. No fade on the wall: a piece is hidden only once it is off the canvas.
- **The scrim.** An aubergine wash (`--color-sidebar-bg` at 38%) fades in over the whole stage, the bar and the foot row included, so the card reads as something on top (review, 3 Oct: "a pop-up with a fade-in colour change for the background"); it fades out on close, and a click on it closes. The thrown content flies over the scrim and the rising card (the deck is lifted above the layer while it is thrown, on a transparent ground), so the card is never seen through. Without the throw (tried, `MORE_THROW`), the slide showed through the card while it faded up, so the throw stays.
- **The card.** Pops up on the scrim (opaque within 0.16 s, settling from scale 0.955 and 26 px lower) at the cover plate's geometry: 40 px from the sides, 20 px under the bar, 76 px over the foot row, 48 px corners, on `--color-gray-50` with a 1 px `--color-gray-200` outline. The part's cover tint was tried and dropped: lavender means AI, and a tinted ground fought the panels' own colour. Inside: a kicker ("More · slide title") and the title 40 px from the card's top, two panels as the product's segmented control on the title's row (outline rail, active segment `--accent-soft` with `--accent-ink`), and the product's × icon button (`.h-btn-icon`) in the card's top right corner, 24 px in, with no tooltip. Its words come up after the card, so text never crosses text.
- **Inside.** A panel never waits for a press: its `data-beat` groups play as a timed ladder, and a panel without `data-a` staggers its blocks in.
- **Closing.** The card's words go at once, the card shrinks away, and the content flies back along the same curves (the throw reversed, last out first home). Motion off and `prefers-reduced-motion`: an instant swap. Print: each panel is a page after its slide, drawn as the card.

## 13 · Flows, maps and models (`.hc-flow`, `kit/flowmap.js`)

review, 4 Oct: "For the flows, the user flows, and any diagram you have, create them dynamically in web … a visual output for anything." One renderer draws every user flow, the solution map and the object model, in the deck (detail panels, the kit gallery) and as the Notion pictures. Data: `deck/src/data/flows.json`, node centres on a 1720 px canvas.

- **Cards are the product's.** A step is a white card on a gray-200 hairline with 16 px corners and the aubergine-tinted shadow; title 22 px semibold, sub line 20 px ink-3. A screen adds a tiny UI glyph of the product's frame (page with the aubergine rail · the full-screen wizard · the docked tips panel in lavender · a drawer).
- **Start, end, decisions.** The start is an aubergine stadium (the product's rail colour), white words. An end is a mint card with a green check badge on its corner. A decision is a stadium led by a "?" disc: raspberry (primary-50 plate, primary-300 ring, filled raspberry "?", `--accent-ink` words) when the host decides, quiet gray when the product branches on its own.
- **Lavender means AI, only.** An AI step is a secondary-50 card with a sparkle badge on its corner; nothing else in a diagram is lavender except the Smart Listings plate.
- **Plates.** A group of objects sits on a 28 px-radius plate in its tint (`--tint-plate`), named on its corner in `--tint-ink`: Shared blush, channels butter, Smart Listings lavender.
- **Lines.** Gray-400, 2.5 px, orthogonal with 18 px rounded corners, a chevron head drawn in the same stroke. Dotted for a reference (facts cited as sources), with a solid head. A branch's label is a white pill on its line, in `--accent-ink` when it leaves the host's decision. Channel marks are the product's badges (`#chg-*`).
- **Fit.** A card grows to fit its words around its centre; the drawing centres itself in the canvas and zooms to its figure, never above 1, so node words never drop under 20 px on the wall.
- **Motion** (`data-a="flow"`, set by the renderer): plates wipe in from the left, cards pop in at full colour (hidden, then shown while they scale from 0.62 with a soft overshoot) as a ladder along the lines, lines draw from their source, labels pop as their line passes. Nothing fades through half-transparency, nothing dims, and the whole ladder settles in about 2 s. The CSS rests on the final state, so print, motion off and the Notion pictures show it whole.
- **Two variants.** `"only": "deck"|"notion"` keeps a card or a branch to one variant. In the deck a channel field has three cases (uses the Base · custom for one channel · only on that channel; review, 4 Oct); the Notion variant documents the prototype as its pages do, Set by the channel included.
- **Notion pictures.** `node qa/diagrams/render.mjs` (run from `deck/`; a local QA script, `deck/qa/` is git-ignored) draws the Notion variant of every diagram on white with a small title and a one-line caption that ends with its provenance, at 2×, into `plan/notion-v2/renders/`, and reports any card whose words overflow, any label on a card and any line through a card.

## Slide-level pieces (not reusable, prefixed by their part)

- `op-loop` (`op-title`): the product loop told in live HTML on a blush plate: the Base card → three channel cards with their strategy pills → the tip card (`.h-tip`) → the receipt chip → the result. About 4 s of choreography by `data-at`, then still.
- `op-hours`, `op-today` (`op-burden`): hours a month as rows of butter blocks, one per hour.
- `op-strip`, `op-flow`, `op-dots`, `op-legend` (`op-how`): what was real, sampled and projected, with the 5-of-25 interview dot matrix.
