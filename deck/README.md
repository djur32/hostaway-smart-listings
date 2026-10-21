# Listing Management II · the Hostaway case-study deck

review Silva's Head of Design case study for Hostaway (angles A and B), as a code-built deck of at most 50 slides, in Hostaway's visual language. It's the script for a ~22-minute Loom.

This is a **detached copy** of the InvestEngine process deck (`~/Developer/process-deck`), made by S00 on 2026-09-29 and rebranded by S07. The original and the digimal.studio site are **never** edited, built or deployed from here (`tools/audit.mjs` checks). The InvestEngine content is parked in `_origin/`.

| Read | For |
|---|---|
| `STORY.md` | what each of the 49 slides says (the one message, path, angle, Notion page) |
| `CONTRACT.md` | how a slide is authored: anatomy, legibility, words, motion, components, QA |
| `DECISIONS.md` | what was kept, dropped and adapted from the InvestEngine deck, and why (D-070 to D-075) |
| `src/slides/_kit.html` | every component as a template (`node tools/build.mjs --kit`) |

## Present

```bash
export PATH=/opt/homebrew/bin:$PATH
cd ~/Developer/hostaway-case/deck && npm i        # once, on a fresh checkout
node tools/dist.mjs && node tools/serve.mjs 8793
```

Open `http://127.0.0.1:8793/dist/pages/hostaway.html` (or `index.html`, which forwards). Press `F` for full screen and `P` for the presenter window (notes, next slide, a clock against the plan). The editing build, with no bundle step, is `…/src/pages/hostaway.html` after `node tools/build.mjs`.

| Key | Does |
|---|---|
| `→` `Space` `PageDown` | Next beat (a part's cover lifts on the first), then the next slide |
| `←` `PageUp` | Previous slide, in its finished state |
| `⇧→` | Skip the remaining beats |
| `0`–`7` | Jump to Intro or a part |
| `⌘K` / `O` | Jump anywhere: a part, a title, an ID (`D-012`), a number |
| `V` | Personalise: Short, Standard or Everything, per part |
| `N` | Open this slide's page in Notion |
| `Home` | Back to the first slide (or click the Hostaway mark) |
| `R` · `C` / `T` · `P` · `F` · `?` | Replay · clock · presenter · full screen · all keys |

`?motion=calm` or `?motion=off` forces reduced motion (QA and print use `off`). `?qa` skips the first-visit Personalise dialog. `#dc-two-truths` opens on a slide.

## The look

One theme, `hostaway`. `src/kit/tokens.css` maps the deck's semantic tokens onto S02's design-system role tokens, and holds no raw colour. `tools/sync-ds.mjs` copies `../ds/tokens.css`, `components.css`, `icons/sprite.js` and `illustrations/` into the deck on every build. Change the design system, rebuild, and the deck follows. The chrome (the product's header, underline tabs, aubergine covers) lives in `src/kit/themes/hostaway.css`; the case's components (provenance chips, IDs, Notion links, quote cards, charts, screen frames, the concept grid, decision cards, problem → response rows) live in `src/kit/hc.css` + `hc.js`.

## Build and QA

```bash
node tools/build.mjs                                   # lint; exit 1 above 50 slides or on a raw colour
node tools/shoot.mjs --all --scale 0.5 --beat all --out qa/all
python3 tools/sheet.py qa/all/hostaway               # contact sheet
node tools/walk.mjs --motion off                       # every slide, beat, back, forward, replay: nothing goes blank
node tools/dist.mjs && node tools/smoke.mjs            # light build: cold open, clicks, Notion links, covers, window sizes
node tools/export-pdf.mjs                              # export/listing-management-ii.pdf (needs pdfunite; print fonts: tools/print-fonts.py)
cd .. && node tools/audit.mjs                          # requirements, slide count, scope guard, process-deck untouched
```

## On the web

This deck deploys to its own new Vercel project (S19, only with review's yes). It has no connection to digimal.studio. Every page carries `noindex, nofollow`, and the title and the close say it's concept work, with the product UI © Hostaway.

## Layout

```
src/kit/        tokens · base · deck · components · hc (Hostaway components) · plan · responsive · engine.js · hc.js · motion · …
src/kit/ds/     tokens.css · components.css · sprite.js, GENERATED from ../ds/ (never edit)
src/kit/themes/ hostaway.css (the chrome skin)       src/kit/atmos/ hostaway.js (the window's ground)
src/slides/     00-open · 10-discovery · 20-research · 30-ia · 40-concept · 50-design · 60-test · 70-next · _kit (templates)
src/data/       notion-links.json · embeds.json (the live prototype) · stories.json (empty; the engine reads it)
src/assets/     shots/ (hs-## crops, prototype captures) · illustrations/ (synced from ds/) · logos/
tools/          build · sync-ds · dist · shoot · walk · smoke · export-pdf · serve · sheet · audit-motion · shoot-more
_origin/        the InvestEngine deck's slides, docs, themes, atmospheres and assets, parked (not built)
```
