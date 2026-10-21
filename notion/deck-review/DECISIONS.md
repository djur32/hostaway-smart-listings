# Editor's decisions for applying the reviews (4 Oct, night)

Antonio is asleep and asked me to act on everything. These are my calls on the reviews' flags. They bind every implementation agent.

## The story
Antonio, 4 Oct: "You don't have to summarise everything in Notion. Tell a compelling story of how we got to the current state and what led us there, and what we projected to measure. Just enough to justify the decisions; document visually whatever is interesting."
- Every slide's headline says what was found or decided **and why it mattered**.
- Each part ends on the decision its findings produced.
- Depth lives in Notion; every slide links there.

## Calls on the flags
1. **Interviews.** The deck keeps Antonio's "about 25 interviews with real access" everywhere: dc-plan, the Research cover and rs-method. The five sampled interviews stay as the sample. The Notion text (5–8) is not changed; this goes to Antonio as an open question.
2. **Status words.** The deck keeps Done · Sampled · Planned. The kit's mark label "Produced" becomes "Done" everywhere in the deck. Notion keeps Done · Illustrative · Projected; that is an open question for Antonio.
3. **Field model: four cases (Antonio, 4 Oct; replaces the three-case rule).** Every field on a channel page is one of:
   1. **Uses the Base**: the shared value.
   2. **Custom for a channel**, e.g. "Custom for Airbnb".
   3. **Only on one channel**, e.g. **"Check-in method · Airbnb only"**: the field exists only on that channel and is editable there (the prototype's own caption; in `prototype/src/data/sl3.ts` the check-in method is Airbnb's own). The older "Check-in method · Only on Booking.com" was wrong.
   4. **Set by the channel**: the host can't influence or change it. Booking.com writes its own description from the property's facts, photos and amenities (REAL·PUBLIC), so on Booking.com the field is read-only. The product captions it **"Booking.com only" beside a lock**, and the lock's tooltip says why it can't be changed (`sl3.tsx` `scopeOf('set')`, `sl3.ts` `BOOKING_WRITES`).
   - Never show "Uses the Base" for Booking.com's description.
   - Where the deck states it (4 Oct): op-idea detail "One field, four cases"; dc-no-channel's "So" strip; ia-structure "Four cases, every field" (one shared field, the Summary, shows three of them, as in `sl3.ts`); ds-channels (a lock callout, since a Booking.com field never sits on the Airbnb card) and its flow; the speaker notes of nx-story; flows.json flow 3, the solution map and the object model, in both the deck and the Notion variant.
4. **Simulated data shown as a finding** (dc-signals and the like). Keep it only labelled Simulated, worded as "in my sample" or "likely". Never state it as fact about Hospitable.
5. **Tests.** Following KD-18 ("plan the tests rather than fake results"), the deck shows no simulated *test results* (tree test, concept test). Tests appear as plans with a pass bar. Simulated *research* (interviews, card sort) stays, labelled Sampled or Simulated, because Antonio chose that.
6. **Import.** Remove import or setup methods and assumptions from Discovery and Research slides (rule 1). Import may appear only as a next step.
7. **Votes.** 322 everywhere, with the request's current name from `research/market/feedback-board-2026-10-03.md`.
8. **IA turn.** Tell it honestly: record-first won the scoring, then channel-first with a Shared layer was chosen in design review when Smart Listings needed a home. It is not yet tested; a tree test is planned. This justifies KD-03.
9. **Counts.** Use the Notion counts that exclude setup and import material: six insights, five jobs, eleven findings on the flow Smart Listings changes. Only do this where the deck's bigger count included import items.

## Mechanics
- Word limits: the wall ≤ 110, a detail panel ≤ 90. Run `node tools/build.mjs` from `deck/`; it lints words, raw colours, dashes and paths or IDs in footers.
- Notion links: don't edit `data/notion-links.json`. Put your chosen URL per slide and per detail in your report; I wire them centrally.
- Never touch another part's files. Re-read a file right before each edit, because other agents edit other parts tonight.
- Verify:
  - `node tools/build.mjs`, with 0 warnings;
  - `node tools/walk.mjs --motion off`;
  - `node tools/shoot.mjs <ids> --beat all --out qa/<part>` and `node tools/shoot-more.mjs --parts <NN> --out qa/<part>-more`.

  Read every PNG and fix any overlap, clipping or small text.

## Calls on the Design flags (from 50-design.md)
10. **ds-channels card.** Redraw it as **Airbnb · Listing**:
    - Property name: Custom for Airbnb.
    - Neighbourhood description: Uses the Base.
    - Check-in method: **Only on Airbnb**, editable, as in the prototype; it is not a locked box.
    - Use "≤4.1%". Fix the footer so it doesn't mix the card sort's 15 hosts with the override data.
11. **Absolute claims vs Autopilot (KD-08).** "Every change reviewed", "nothing reaches a channel unseen" and "Accept stays the host's call" must allow for Autopilot. Use "every change gets a receipt", "money and stay rules always ask" and "you choose how much runs on its own".
12. **Canvas and receipts work for every host**, not only with Smart Listings on. Fix those eyebrows.
13. **ds-system.** Replace "47 new patterns" with the real count from Notion's Design system page (ten new patterns, or whatever that page states). Swap the import-era conflict card and the "channels disagree" fact row for Smart Listings components: the tip card, the scope caption, Rewrite with AI and the Canvas outline. Add the Rewrite with AI colour if the slide lists colours.
14. **ds-push** leads with the brief's real 618 sales calls. The simulated 11 of 60 is labelled or dropped.
15. **ds-canvas.** Use the correct colours: orange means editable, per `CanvasView.tsx`. Remove "money is never decided in the preview" (`PricePanel.tsx` edits price from Canvas). Remove the simulated concept-test result.
16. **ds-personas.** "New to a PMS" and "SEO optimiser". P1 starts with Smart Listings off.
17. **Missing story, folded in.**
    - A "What I built, then removed" pop-up panel on ds-solution covers versions, compare mode, the Setup page, inline Canvas editing and the three-level autonomy dial. It is evidence of judgement.
    - KD-10 (one AI affordance per field: a tip, otherwise Rewrite with AI) goes on ds-tips.
    - KD-05 (opt-in per property) goes on ds-strategy.
18. **Kit.** The cover mark label "Produced" becomes "Done" (`deck/src/kit/hc.js` MARK). Applied centrally.

## Calls on the Testing and Next flags (from 60-test-next.md)
19. **tm-test** opens honestly: no host has used Smart Listings yet. The 71% and 8/8 stat cards go (§5). The slide becomes the programme, benchmark first, with a **pass bar set before each step**. The footer must not read as real people. Concept testing belongs to Concept, not to the Testing cover.
20. **tm-measure closes the loop on the Intro's five goals**, Antonio's latest framing: each channel earns more · adoption · hosts keep refining · tips accepted out of shown · fewer listing and sync tickets.
    - It shows their 90-day bars and how each is read.
    - Time to adjust and satisfaction are trust checks beside them.
    - Guardrails are Notion's four: no unsupported AI claims, undo rate on accepted tips, wrong-channel edits and channel rejections. Write "Undo ≤ 5% of accepted tips".
    - A pre-mortem pop-up panel goes on tm-measure, drawn from Notion's Pre-mortem.
    - Notion's KD-19 (time to adjust as north star) and "revenue reported, never targeted" go to Antonio as open questions; the deck keeps his goals.
21. **nx-roadmap.**
    - Now: test and harden Smart Listings.
    - Next: import and first-time setup on the same Base, with its own north star. This is allowed as a future step.
    - Later: optimisation over time, building on strategy periods, not versions.
    - Pattern chips: Fact · Source · Inheritance · Tip · Receipt · Autonomy.
    - Add a **kill criteria** pop-up panel (Notion's five).
    - The effects pop-up leads with **blast radius** and says "channel terms".
22. **cl-monday.** Ten stakeholder interviews, and the benchmark of today's product first. No "by Friday" overpromise.
23. **op-how (Intro).**
    - Roadmapping, Second-order effects and Kill criteria are written, so they are **Done**.
    - Pilot cohort and Staged rollout stay Planned.
    - Tree testing and Concept testing are **Planned** (§5): the deck no longer shows their simulated results.
    - User interviews, Card sorting, Personas and CS tickets review stay Sampled.

## Calls on the Intro flags (from 00-intro.md)
Antonio wrote and approved most of the Intro line by line, so it changes **lightly**: plain errors only, plus the process slide.
24. **Fix:**
    - op-hypothesis notes: the four "it's true when" chips are not the goals.
    - op-idea "You stay in control": Autopilot is on or off (review every tip, or turn on Autopilot inside your guardrails).
    - op-idea pop-up: "Arrival checklist" becomes **"Check-in method · Airbnb only"**.
    - op-shift: replace "Same content everywhere" with something true to the audit, for example "One copy, overrides scattered".
    - op-goals message: "after launch" instead of "after a host turns it on".
    - op-goals pop-up: drop the trial-to-paid numbers, which are simulated and belong to import.
25. **Keep as Antonio wrote them:**
    - op-brief's four spin items and op-burden's "Guests look for" lanes;
    - op-goals' five goals and targets;
    - the launch voice ("Earn more", "Listings that manage themselves").

    The conflicts with Notion go to Antonio as open questions.
26. **op-how.** Use the reviewer's stage-by-stage list as adjusted by §23:
    - Written desk outputs are **Done**: Goals and KPIs, Roadmapping, Second-order effects, Kill criteria.
    - Tree testing and Concept testing are **Planned**.
    - "Failure states" becomes **"Design reviews · Done"**.
    - "CS tickets review" becomes **"Data analysis · Sampled"**.
    - Add Product audit and Desk research where the reviewer places them.
    - Five methods per stage at most.

## Antonio's call on the tests (4 Oct)
27. **Rehearsals, told honestly.** Antonio, 4 Oct: "I would like to be honest about it. Share what the plan is, or what the plan would have been, but then show how the simulated results would have allowed us to gain which insights, which we then turned into decisions for the product. Be honest about what you are showing, simulated versus real." This **replaces §5 and §19** for tests. Simulated test results may appear again, but only as **plan → simulated run (labelled Simulated) → insight → product decision**, and only on Testing.
    - **tm-test.** The message reads "Nothing is tested with real hosts yet. Two simulated rehearsals shaped decisions; six real steps follow, each with a bar set first." The six-step programme stays as it was. A strip in the simulated colours, "I rehearsed two tests on simulated hosts: what they taught me", opens a new detail, **Rehearsals** (its own More button, placed first; the probes detail keeps its two panels). The wall didn't have room for the two rows within 110 words. The footer adds "Two rehearsals on simulated hosts, run on earlier designs".
    - **The Rehearsals panel.** Two rows; each reads: with real hosts → simulated run → insight → in the product.
      - Tree test: three menus, the one I built included, 30 hosts each → **71% vs 31%**, on the earlier record-first menu against today's (`ia/tree-test.md`, 30 simulated participants × 10 tasks) → hosts looked for one fact in two places, and a door to one home fixed it (D-111: T8 53% → 93%) → **one home per fact** is kept, and channel pages show the Base read-only (D-114, D-933). The score doesn't carry over to the menu as built, and the panel says "my earlier menu".
      - Concept test: eight hosts, four directions, one hidden price change → **8/8** caught it on a card (Decision Inbox), **4/8** inside a preview walk-through (Channel Canvas) (`concepts/convergence/concept-test.md`, `concept-test.csv`) → "the friendlier the page, the less of it gets read" (finding 1) → **Canvas finds the field and the field decides; prices open Pricing's own fields** (KD-14, `prototype/src/screens/canvas/PricePanel.tsx`). This rewords §15's dropped line "money is never decided in the preview", which was wrong because the panel does edit price; what's true is that nothing is edited on the page itself.
      - The caption reads: simulated hosts, grounded in my sampled research, on earlier designs; only real hosts can show it works.
      - The rehearsal's score effect (four cells; on a listing screen only Decision Inbox × Listing studio, 3.12 → 3.20, `scores-note.md`) isn't cited in the deck.
    - **Testing cover.** Outputs add a Sampled row: "Simulated rehearsals: tree test and concept test".
    - **ia-structure.** The trade-off detail adds one labelled line under the tree-test plan: "Rehearsed on record-first: 71%, against 31% today."
    - **Concept.** Checked: there's no unlabelled result on the wall, in a detail or in the notes. The 8/8 stays off the Concept wall; tm-test carries it.
    - **op-how is not changed here.** Tree testing and Concept testing stay Planned (§23, §26). They are still not run with real hosts. Whether the Intro should mark them Sampled now is for Antonio.
28. **tm-measure: time to adjust is the north star (KD-19, kept by Antonio).**
    - The headline is "One north star, and the five goals it drives".
    - The message reads "Time to adjust: how long a real change takes, done right. If it falls, the goals I set at the start should follow, 90 days after launch."
    - A north-star row leads: "Time to adjust ≤ 60 · today = 100", with "Satisfied ≥ 80%" beside it as the trust check. Then come the five goals, unchanged at their 90-day values. The four guardrails follow on the press.
    - In the KPI tree, the root is the north star, and the trust node is satisfaction plus comprehension.
    - The notes follow the same order.
