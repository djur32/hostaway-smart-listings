# Plan: Hostaway Smart Listings (project)

Rules: plan/RULES.md is superseded where the task brief differs (TEXT RULES and FRAMING in the brief win).
Branch main only. Source repo is read-only, cloned outside this repo. One commit per phase, one push at the end.

## Phases
1. Setup (me, script). Sources already imported. Rename packages and titles, `npm ci` in deck/ and prototype/. Commit.
2. Brand (one sonnet agent). Hostaway palette and wordmark from hostaway.com into plan/BRAND.md, ds/tokens.css, deck and prototype themes, favicon, app icon. Build both once.
3. Website (sonnet agent, after 2). 3a TEXT RULES on prototype/src plus build. 3b capture screens with deck/tools/capture-proto.mjs to scratch. 3c vercel.json root prototype/.
4. Deck (sonnet agents, after 3). Text rules, chips removed, image recolour script (PIL + numpy), four new slides, thin slides expanded, vercel.json. Build to 0 warnings.
5. Notion (6 parallel sonnet agents, parallel with 3 and 4). Only under hub 400e18af164580aeb1c1f0393d084a85. Adds 08 Experimentation. Image swaps wait for Phase 4 recolours.
6. Review gate (me). Term search, builds, headless renders of cover, 4 new slides, 3 website screens. Then push.

## Order
1 -> 2 -> (3 || 5 text) -> 4 -> 5 image swaps -> 6 -> push.

## Done criteria
- Deck: 0 build warnings, wall-text lint passes. Prototype: `npm run build` passes.
- Banned-term search clean (hospitable, head of design, antonio, loom, take-home, simulated, projected, real·, assumption, copilot, digimal.studio). README and licence authorship allowed.
- Every example-number table or chart carries the caption "Sample data".
- No vercel project created, nothing deployed.
