# CONTRACT · how a slide in the Hospitable deck is authored

Read this before writing a slide. It is the Hospitable version of the InvestEngine deck's contract (`_origin/docs/CONTRACT.md`, which still explains the kit internals in depth: motion §5–§6, details §16.1, primitives §16.3). `STORY.md` says *what* each slide says; this file says *how*. `DECISIONS.md` says why the kit is the way it is.

---

## 0. What we are making

A ≤ 50-slide deck that walks Hospitable's leadership through the process behind **Listing Management II** (angles A + B), and is the script for a **~22-minute Loom** (Standard path). It is built as an app in presentation mode, in Hospitable's own visual language: the product's top bar and underline tabs, its white, blush and aubergine grounds, its lavender AI card. **Everything on the wall is backed by Notion**, and the deck never gets ahead of it.

## 1. Files

- `src/slides/NN-part.html` (+ optional `.css`, `.js`), one file per part, in talk order: `00-open` · `10-discovery` · `20-research` · `30-ia` · `40-concept` · `50-design` · `60-test` · `70-next` (the close is the last slide of `70-next`). Classes in a part's CSS are prefixed with the part (`op-`, `dc-`, `rs-`, `ia-`, `cn-`, `ds-`, `tm-`, `nx-`); the build fails a class defined by two parts.
- `src/kit/`: shared. `hc.css`/`hc.js` hold the Hospitable components, `themes/hospitable.css` the chrome skin, `tokens.css` the semantic tokens. Change the kit deliberately and document it in `_kit.html`.
- `src/kit/ds/` (tokens.css, components.css, sprite.js) is **generated** from `ds/` (S02). Never edit it; change the design system and rebuild.
- `src/data/notion-links.json`: where "In Notion ↗" goes. `src/data/embeds.json`: where the live prototype is.
- `src/assets/shots/*.webp`: screens (`HS-##` crops, prototype captures). `src/assets/illustrations/`: synced from `ds/illustrations/`.

## 2. Slide anatomy

```html
<section class="s" data-id="dc-two-truths"            <!-- unique, prefixed by its part -->
  data-title="Two truths, and the channels"             <!-- ⌘K, presenter window, document title -->
  data-stage="1"                                        <!-- 0 Intro · 1 Discovery · 2 Research · 3 IA · 4 Concept · 5 Design · 6 Test & measure · 7 Systems & next · 8 appendix -->
  data-part="discovery"                                 <!-- open · discovery · research · ia · concept · design · test · next · close · appendix -->
  data-path="S"                                         <!-- S Short · St Standard · E Everything (Personalise) -->
  data-angle="both"                                     <!-- A · B · both · none (the scope guard) -->
  data-min="0.6"                                        <!-- minutes, for the presenter clock -->
  data-req="R-016 R-072"                                <!-- requirements this slide evidences -->
  data-notion="I-04 D-012 01-discovery"                 <!-- Notion IDs and/or page keys, first match wins -->
  data-notion-page="01-discovery"                       <!-- fallback page for the "In Notion" link -->
  data-ground="white">                                  <!-- white · blush · aubergine -->
  <header class="s-head">
    <p class="eyebrow"><span>Discovery</span><span class="hc-prov" data-prov="product"></span></p>
    <h2 class="h2">Two truths, and the channels</h2>
    <p class="hc-msg">The one message, from STORY.md.</p>
  </header>
  <div class="s-body"> … one artefact … </div>
  <aside class="notes"><p>What I say. The number or quote to land. Budget.</p></aside>
</section>
```

- **Every attribute above is required** (the build warns when one is missing; `data-ground` defaults to white).
- The kit appends an **"In Notion ↗"** link to every slide's foot (or "Notion page pending" when there is no URL yet). Don't write it by hand.
- **A part's cover** (D-072) is a `<template class="hc-cover-tpl" data-stage="N">` holding one `<header class="hc-cover">` with the `.opener` frame and an `.hc-illo`. Write it once per part, inside that part's first slide. The engine places it on whichever slide opens the part in the current plan. Your slide's own `data-beat`s play one press later.
- **Details** (`<template class="more" data-more="id" data-title="…" data-label="…">`) are the deck's "a layer below": the deep dive that stays in the talk. At most two panels, ≤ 45 words each. The kit gives every detail its door: a **More** button on the headline's row, at the content's right edge (`data-label` renames it; default "More"). The foot's `.more-link` stays in the DOM, hidden: keep it, because `tools/build.mjs` still checks that every detail has a door. Opening throws the slide's content off to both sides and the detail rises as a card with the cover plate's geometry; closing brings everything back on the same curves. Row in §6; mechanics in `_origin/docs/CONTRACT.md` §16.1 (which still describes the old sheet).

## 3. Legibility (non-negotiable)

- **One idea per slide.** Two ideas make two slides. And the deck is capped at 50, so the second idea usually becomes a detail.
- **≤ 45 visible words** (the build warns above 70). Notes and covers don't count.
- Minimum sizes on the 1920 × 1080 canvas: running text ≥ 22px (`--t-body` 24), secondary lines 20px, labels 15px, IDs 13px. Never smaller.
- **Contrast.** Use only tokens. Raspberry as small text is `--accent-ink` (primary-700), and AI copy is `--ai-ink` (AA on lavender). The raw `--accent` is for fills, lines and large type.
- Nothing crosses text. The body centres in what's left under the head. If a component is taller than that, it rides up into the headline: make it smaller, don't let it overlap.
- Reveal in the order you speak: `data-a` for entry, `data-beat` for "and then…".

## 4. Words

- "I", not "we", where it's true. Credit the team where it was theirs. Hospitable people are roles ("the CS lead"), not names.
- **No em dashes, anywhere**, notes included (the build warns). No en dashes in visible text. Use a full stop, a comma, a colon or a middle dot `·`.
- **Headlines are claims**, and the one-line message says why they matter.
- **Numbers over adjectives, and every number has a provenance chip.** Every quote, number and chart carries an `.hc-prov`. SIMULATED always reads **"Illustrative"**. Slide 4 says once, plainly, what is simulated. The chips say it everywhere else.
- Their words, not ours: quotes are short and attributed (persona, `INT-#`, timestamp).
- No hype words ("revolutionary", "seamless", "delightful"). Leadership voice: plain, specific, explicit about what isn't known.

## 5. Motion

- It must feel like the product, not like a show: quiet rises, lines that draw, bars that grow. One hero motion per slide at most.
- An entry reads as settled in under ~2 s. Ambient loops go through `api.ambient()`, never in the entry.
- Every animation ends in a correct final state (QA shoots with motion off and after all beats).
- No CSS `transition` on a property a slide module animates (`opacity`, `transform`, `visibility`).
- Micro-interactions shown *inside* a screen (accept, regenerate, sync) follow `ds/motion.md`. The deck's own transitions use `kit/motion.js`.

## 6. APIs and components

**Declarative motion:** `data-a="rise | fade | lines | words | grow | draw | count | stagger | …"`, `data-at="0.3"`, `data-beat="1"`. Full list in `_origin/docs/CONTRACT.md` §6.

**Hospitable components** (`kit/hc.css`, `kit/hc.js`; every one has a template in `src/slides/_kit.html`, built with `node tools/build.mjs --kit`):

| Component | Markup | Notes |
|---|---|---|
| Provenance chip | `<span class="hc-prov" data-prov="brief|product|public|simulated|projected|assumption"></span>` | The words fill themselves. `hc-prov--sm` for inside charts and tiles. |
| Provenance colours | `--prov-real` / `--prov-real-bg` (green: brief, product, public) · `--prov-sim` / `--prov-sim-bg` (orange; never purple, which means AI) · `--prov-proj` / `--prov-proj-bg` (blue) · `--prov-assume` / `--prov-assume-bg` (gray) | One colour per kind everywhere (kit/hc.css, from ds tokens). `.hc-prov` takes them by itself; any legend of the kinds uses the same tokens. `ds/marketing-patterns.md` §11. |
| Output mark | `<span class="hc-mark" data-mark="produced|sampled|planned"></span>` | The word fills itself. produced = real colours, sampled = simulated colours, planned = dashed gray outline. Used in the covers' Outputs. |
| ID tag | `<span class="hc-id">D-012</span>` | Becomes a link when `notion-links.json` knows the ID (or its database). |
| In Notion | automatic in every slide's foot; `N` opens it | Resolution below. `data-no-notion` on a slide opts out. |
| Quote card | `figure.hc-quote > blockquote + figcaption(.hc-avatar[data-persona=P1] .hc-quote__who .hc-id .hc-quote__t .hc-prov)` | `.hc-quotes` lays out two or three; `.hc-quote--lg` for one. |
| Chart | `<figure class="hc-chart" data-chart="bar|funnel|matrix|journey|line|svg">` + `<script type="application/json">` or `data-src="charts/x.json"` (from `src/data/`) | JSON shapes are below. Add `<figcaption class="hc-chart__cap">` with the source and a chip. The caption reads as the source line (`.hc-src`: 15 px, chip first, bottom left). In a detail, `engine.js liftLegend` moves every caption, flow source and source line of a panel into ONE `.hc-src` at the card's bottom left (4 Oct). |
| KPI tile | `.hc-kpi > .hc-kpi__l .hc-kpi__v .hc-kpi__d(.is-down/.is-flat) .hc-kpi__f` | `.hc-kpis` with `--n`. |
| KPI card (4 Oct) | `.hc-stats(--stack)` (`--n: 1…4`) `> .hc-stat(.is-key) >` optional `p.hc-stat__k`, `p.hc-stat__v` (`<small>` for a unit or "of 28"), optional `p.hc-stat__l` | Every number on a slide. Exactly the product's KPI card (Smart Listings › Performance, Metrics: `ds/v3/perf.css .sl-perf-kpi`) at wall size: white, the gray hairline, 16 px corners, no shadow, no icon; the label on top (20 px, medium, secondary ink), the value (50 px semibold, `--stat-v`), one quiet muted foot line (20 px), feet aligned across a row. `.is-key` puts the value in brand ink (`--color-primary-700`, `data-tint` changes it, never lavender); the card stays white. A `.hc-stat__i` left in old markup is not drawn. `data-a="count"` on `__v` counts its first text node. Old markup (`__v` then `__l`) still reads right. The card takes its width from its column. Template: `kit-stats` in `_kit.html`. |
| Signal meter | `<span class="hc-signal" data-strength="strong|moderate|weak|hypothesis"></span>` | CONVENTIONS §2 rules. |
| Browser frame | `<figure class="hc-browser" data-url="my.hospitable.com/…" data-tab="…" style="--w: 900px"><div class="hc-browser__view"><img data-shot="hs-30" alt="…"></div></figure>` | The frame is drawn in tokens. The screen is a `data-shot` (lazy, zoomable). |
| Phone | `<figure class="hc-phone" style="--w: 240px"><img data-shot="…"></figure>` | |
| Live prototype | `<figure class="hc-live" data-route="/studio">` + an `.hc-browser` poster | "Open live" loads `embeds.json` → `prototype.local` (localhost) or `.deployed`. Unloaded when the slide leaves. |
| Concept grid | `.hc-grid` with `--cols: 5; --cell-w: 92px`: `span` corner, `.hc-grid__h` headers, per row `.hc-grid__r` + five `.hc-grid__c` | A cell holds an `img data-shot` (click to zoom, → through the set) or shows `data-label` while empty. `.is-pick` marks a finalist, `.is-dim` quietens a cell. |
| Decision card | `article.hc-decision` (`__head` with `.hc-id .hc-status .hc-signal`, `__call`, options `ul.hc-decision__opts > li.is-chosen`, `__why`) | Mirrors the Notion Decisions DB fields. |
| Problem → response | `.hc-prs > .hc-pr` (`__p`, `__arrow`, `__r`, `__s`) | The problem (Gong theme or `I-##` + chip) → the move (`D-###`) → the screen. |
| Channel chip | `<span class="hc-ch" data-ch="airbnb|booking|vrbo|direct|google">Airbnb</span>` | Identification only. |
| AI card | `.hc-ai(.hc-ai--sparkle) > .hc-ai__t(+ .hc-new) .hc-ai__b` | The product's "Dynamic Pricing · New" card. Lavender means AI, only. |
| Illustration | `<div class="hc-illo" data-illo="one-fact-many-channels"></div>` | Names are listed in `assets/illustrations/index.json`. A missing one shows quiet clouds. |
| Product UI (S02) | `<div class="h-root hc-ui" style="--ui-zoom: 1.7">` + markup from `ds/components/index.html` | One real component (AI suggestion, conflict card, field row) at wall size. Icons: `<svg class="h-icon"><use href="#i-sparkles"/></svg>`, marks `#ch-airbnb`. Screens stay screenshots. |
| Placeholder | `.hc-ph` (`__k`, `__d`, `__from`), or `.hc-ph--split` with `__text` + `__demo` | Remove it when the real content lands. |
| Floating scene (3 Oct) | `.hc-scene` (`--w --h`) > `.hc-scene__bg` + `figure.hc-scr` (`--x --y --sw`, `.is-back`, `.is-float`, `.is-float-2`) + `p.hc-callout` (`--x --y`, `--ai`, `--ok`) | Flat, floating product captures, never 3D. A zoomed detail is `.hc-scr--crop` with `--ar --z --cx --cy` (region of the capture). The scene zooms itself to fit the slide body (hc.js `fitScenes`), so draw it at its natural size. Captures come from the live prototype: `tools/capture-proto.mjs tools/proto-shots.json`. |
| Device capture | `figure.hc-device` (`--x --y --sw`) > `img data-shot="app-…-phone"` | A capture that carries its own bezel (transparent around it): no card, no shadow. |
| Open the real thing | `data-proto="https://…/exact/route?query"` on the section | The kit (hc.js `protoHint`) puts a solid dark "Website" or "Mobile ↗" chip in the hint row, left of Notion, on that slide only. The URL is the screen the slide shows (route and query, from `tools/proto-shots.json`); a `-mobile-` host reads "Mobile". `p.hc-open` pills are retired from slides. |
| Statements, stats, steps | `.hc-points(--quiet)`, `.hc-stats > .hc-stat` (the KPI card, above), `.hc-steps(--v) > .hc-step(.is-key) > __t __d`, `.hc-vs(--stack)`, `.hc-pillars > .hc-pillar`, `.hc-panel(--ai)`, `.hc-table`, `.hc-two` (`--l --r`, `--top`) | The selling kit. One idea per element. |
| Source line | `.s-foot > p.hc-src` with `.hc-prov` chips and words | Provenance is quiet text with a glyph (D-077), in its kind's colour (`--prov-*`). Not counted as wall words. A `.more-link` left in it is hidden, and a line it leaves empty goes too. |
| Detail: More and the card (3 Oct) | `<template class="more" data-more="id" data-title="Card title" data-label="Short label">` + `.more__panel[data-title]` × 1–2, anywhere in the slide | The kit (engine.js `mountMoreButtons`) adds a More button per detail, opposite the headline on its first line: the product's outlined button (8 px corners, gray hairline, no fill, a plus). Click, Enter or `M` opens; `Esc`, `M`, the × or a click outside closes; → ← page the panels and → past the last closes. Opening fades an aubergine scrim over the whole stage (bar and foot row included), throws the slide's blocks out to the nearer side on a curve over it (ease-in, a small arc and turn, top to bottom), and pops the card up at the cover plate's geometry (40 px sides, 20 px under the bar, 76 px over the foot row, 48 px corners) on gray-50 with a gray-200 hairline: kicker and title near the card's top, the panels as the product's segmented control on the title's row, the product's × (no tooltip) in the card's top right corner. Closing reverses the throw. A panel's `data-beat` groups play by themselves as a timed ladder; a panel with no `data-a` has its blocks staggered in. Motion off: an instant swap. The body is about 1728 × 640 px. Print: each panel a page after its slide, as the card. |
| Cover "With AI" | automatic: `data/agentified.json` by stage | One line per part on how agents took part (D-079). |
| Cover as a feature (3 Oct) | the template's words (`.opener__name`, `__vision`, `__methods`, `__out` with `.opener__outrow` rows led by an `.hc-mark`) + `.hc-illo`; `kit/hc.js covers()` builds the tinted plate, the big drawing cropped by the plate and the doodles | No part number, no "With AI" line. Methods: standard method names only. Outputs: left column, marked produced / sampled / planned. Drawing and tint per part in `data/covers.json` (keyed by `data-part`). Recipe: `ds/marketing-patterns.md` §2. |
| Tint | `data-tint="blush|lavender|butter|mint"` on any container | Sets `--tint-plate --tint-halo --tint-soft --tint-ink --tint-line --tint-title --tint-body`. Lavender means AI. |
| Pill badge | `<span class="hc-badge">One Base</span>` | Filled `--tint-ink`, white text; centred on a feature plate. |
| Floating chip | `<span class="hc-chip(--q|--ai|--ok) (is-at) (is-drift)"><svg class="hc-chip__i"><use href="#i-…"/></svg>…</span>` | Copilot's chips. `.is-at` + `--x --y` on a scene; `.hc-chips` + `data-a="stagger"` to stagger in. |
| Feature card | `article.hc-feature[data-tint] > .hc-feature__plate(> .hc-badge + .hc-feature__halo > UI) + .hc-feature__body(> __t __d)`; `.hc-features` with `--n` | `--stat` holds one `__v` number; `.hc-mini` rows for a mini-UI; `.h-root.hc-ui` for a real component on the halo. |
| Comparison table | `.hc-compare` (`--n`, `--label-w`) > `__h`, then per row `__l` + `__c` cells; `.is-hi` cells form the highlighted column (`.is-end` on its last); marks `i.hc-check`, `i.hc-x` | Give the `.is-hi` cells `data-beat` to fill the column in on a press. |
| Doodle | `<span class="hc-doodle" data-doodle="ring|strokes|squiggle|swoosh" data-tone="raspberry|purple|yellow|mint" style="--size: 140px" data-a="draw">` | Drawn by `hc.js`. Never with a dasharray. |
| Brand plate (4 Oct) | `.art.art--full.hc-brand > .hc-brand__plate >` `.hc-brand__band` + `.hc-brand__at` marks (`.hc-doodle`, `.hc-blob`, `.hc-dot[data-tone]`, `--x --y` in plate coordinates, 1840 × 904); words `.hc-brand__k` `.hc-brand__t` `.hc-brand__d` and the lockup `p.hc-lockup` (`#ch-hospitable` + "hospitable") | The talk's bookends only (op-cover, cl-thanks), from Hospitable's own panels (`research/references/hospitable-marketing/brand-*`): aubergine plate with the cover plate's geometry, white words, marks cropped at its edges. The rings and strokes draw (`data-a="draw"`), the blob and dots scale in from the slide's module; the CSS rests on the final state. A bookend carries `data-bookend` and is not counted against the 50 (R-185; build and audit print it apart). Template: `kit-brand`. |
| Tiles | `.hc-pillars--tiles` (wide pastel plates) or the default 104 px tiles in `.hc-pillar__i` | Tints rotate blush, butter, mint; `--ai` lavender. |
| Tree | `.hc-tree > .hc-tree__root[data-tint] + .hc-tree__row(--n) > .hc-tree__node[data-tint] (> __k, ul)` | The KPI tree in HTML. |
| Idle motion | `.hc-idle`, `.hc-idle-2`, `.is-drift(-2|-3)` | 5 px, rests at 0 with motion off. Put it on an inner element, never on one a `data-a` tween moves. |
| Flow diagram (4 Oct) | `<figure class="hc-flow" data-flow="turn-on"></figure>` (+ `data-variant="notion"`); data in `src/data/flows.json` | `kit/flowmap.js` draws a flow, a map or a model from JSON: cards (start · step · screen with a UI glyph · ai · decision, raspberry when `who: "host"` · end · root), tinted plates, orthogonal lines with labels, channel marks. Cards grow to fit their words, the drawing centres and zooms to its figure (in a detail it takes the height left under the words). The renderer sets `data-a="flow"`: plates wipe in, cards pop at full colour as a ladder along the lines, lines draw, labels pop; nothing fades or dims, and motion off shows it whole. `"only": "deck"|"notion"` keeps a node or branch to one variant. `"look": "cards"` on a flow draws every node as the same white card at one radius (lavender and a sparkle only for the AI, a diamond lead for a question, a check lead for an outcome, no stadiums or corner badges), and `"who": "host"` on an edge paints its label raspberry (first used by `hub-to-tips`). Notion PNGs: `node qa/diagrams/render.mjs` (local, `qa/` is git-ignored). Template in `_kit.html`; recipe in `ds/marketing-patterns.md` §13. |

**Chart JSON**

```jsonc
// bar: horizontal, sorted largest first unless "sort": false; "hi": true paints raspberry
{ "items": [{ "label": "Sync failures", "value": 34, "hi": true }], "unit": "%", "max": 100, "w": 1500, "labelW": 380, "row": 58 }
// funnel: each step, and the tint of what it lost
{ "steps": [{ "label": "Connected", "value": 1000 }, { "label": "Published", "value": 610 }], "w": 1500 }
// matrix / heatmap: value over max sets each cell's strength; "show": false hides the numbers
{ "rows": ["P1 …"], "cols": ["Titles", …], "values": [[1, 4, …]], "max": 5, "cell": 64, "w": 1500 }
// journey: scores −2 (pain) to +2 (delight); "note" labels a point
{ "steps": [{ "label": "Connect", "score": 1, "note": "fast" }], "w": 1600, "h": 460 }
// line: a dotted "before" and drawn series, named at their ends
{ "x": ["M0", …], "series": [{ "name": "Today", "values": [..], "kind": "before" }, { "name": "Projected", "values": [..], "hi": true }], "unit": "%", "min": 0, "max": 100 }
// svg: <figure class="hc-chart" data-chart="svg" data-svg="assets/charts/card-sort-dendrogram.svg">, restyled into the deck's inks
```

**How to add a chart.** (1) Export the data from `research/charts/` (or the Notion page) as JSON, either inline in the figure or as `src/data/charts/<name>.json` with `data-src="charts/<name>.json"`. (2) Pick the type above. (3) Add the figcaption with the source line and the chip. (4) `node tools/shoot.mjs <slide-id> --beat all` and look. A new chart *type* is a new drawer in `kit/hc.js` (`DRAW`) plus a template in `_kit.html`.

**How Notion links resolve** (`kit/hc.js`, `src/data/notion-links.json`):
1. The first ID in `data-notion` that has a URL in `ids` (S17 fills `ids` as rows are written: `"D-012": "https://app.notion.com/p/…"`).
2. Else the first page key in `data-notion` (`"02-research"`) found in `pages`.
3. Else `data-notion-page`, else the part's default page (`parts`).
4. Else "Notion page pending". An `.hc-id` without its own URL links to its database (`prefixes` → `databases`).
`pages` and `databases` are seeded from `plan/NOTION.md`. Take URLs from there or from the Notion row, never from memory.

**Slide modules**, when a slide needs bespoke motion: `Deck.define('id', { enter(api){…}, beats: [(api)=>…] })` in `src/slides/NN-part.js`. See `_origin/docs/CONTRACT.md` §6.

## 7. QA (every time, before saying done)

```bash
export PATH=/opt/homebrew/bin:$PATH                      # node isn't on the default PATH here
node tools/build.mjs                                     # lint; exits 1 on an error (>50 slides, raw colour)
node tools/shoot.mjs --all --scale 0.5 --out qa/all      # entry state (covers down)
node tools/shoot.mjs --all --scale 0.5 --beat all --out qa/all-final
python3 tools/sheet.py qa/all-final/hospitable           # contact sheet: read every slide
node tools/walk.mjs --motion off                         # nothing goes blank: every slide, beat, back, forward, replay
node tools/dist.mjs && node tools/smoke.mjs              # the light build: cold open, clicks, Notion links, covers, sizes
node tools/build.mjs --kit && node tools/shoot.mjs --kit --scale 0.5 --out qa/kit
cd .. && node tools/audit.mjs                            # slide count, coverage, scope guard, process-deck untouched
```

Serve with `node tools/serve.mjs 8793` (it moves to the next free port if 8793 is taken), or with the `hospitable-deck` launch configuration. Read every PNG: legible, one idea, a chip on every number and quote, nothing crossing, the Notion link present.

## 8. Done means

- Every slide: one message (matching STORY.md), its evidence, provenance chips, a Notion link that resolves, speaker notes in Antonio's voice with a time budget, and all the data attributes.
- ≤ 50 slides; Standard ≈ 22 min on the presenter clock; ≥ 70% of Standard slides tagged A, B or both.
- `build` has 0 warnings, and `walk` and `smoke` are clean.
- `tools/audit.mjs` is clean, and process-deck is unchanged.
