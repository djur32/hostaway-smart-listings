# Status handoff (work in progress, stopped to continue in the cloud)

Done and committed or in the working tree:
- Phase 1: sources imported and renamed to Hostaway, mechanical text pass (tools/clean_text.py), npm ci works.
- Phase 3a: prototype/src text pass done by agent. `npm run build` was blocked by a missing `ia/canonical-fields.csv`, now copied into ia/ (re-run the text cleaner on it, then build).
- Phase 4 text: all slide parts 00 to 70 have had the semantic text pass. Deck chrome done (Notion/proto chips, Keys/Notes hints, byline, R-186 removed, cap 56, part `experiments` registered in build.mjs PARTS and kit/plan.js). Deck builds with 0 warnings before the new slides.
- Phase 5 Notion: DONE for hub, 00, Appendix, 01, 02, 03, 04, 05, and the new 08 · Experimentation tree (E1 to E7, Readout template, Rollout and guardrails, KD-21 to KD-24). STOPPED part way: 06, 07 and the Decisions database text pass (agent killed). Redo those, plus: hub line "Twenty key decisions" -> 24, links to help.hospitable.com / feedback.hospitable.com in 01, "Hostaway (today)" competitor row check, Notion images swap.

NOT done:
- Phase 2 brand: agent was killed part way. plan/BRAND.md may not exist. Hostaway palette from hostaway.com, tokens in ds/tokens.css, ds/tokens.json, ds/components.css, deck/src/kit/tokens.css, deck/src/kit/themes/hostaway.css, atmos, hc.css, slides css, prototype styles, logos, favicon, app icons. Check `git diff` for what was already replaced and finish.
- Phase 3b: capture screens (deck/tools/capture-proto.mjs, PROTO=local preview URL) and map to deck asset names. 3c vercel.json check.
- Phase 4: new slides in deck/src/slides/65-experiments.{html,css,js} (placeholder only: ex-method, ex-portfolio, ex-readout, ex-rollout per plan/EXPERIMENTS.md), image recolour script (PIL + numpy) for deck/src/assets and notion/img, data-mark removal check on part covers, visual check of cn-principles.
- Phase 6: banned-term search, builds, headless renders, then `git push origin main`.
