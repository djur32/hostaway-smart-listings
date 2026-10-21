# Testing and Next steps × Notion v2

Scope: `60-test.html` (tm-test, tm-measure), `70-next.html` (nx-story, nx-roadmap, cl-monday), their cover templates, `data/covers.json`. Checked against `06-test.md`, `m-test-plan.md`, `o-goals-kpis.md`, `o-premortem.md`, `07-next.md`, `o-second-order.md`, `o-roadmap.md`, KD-18, KD-19 (plus KD-01/07/08/14/15, the tree-test and concept-test method pages, and `op-goals` / `op-how` in `00-open.html`).

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| tm-test · cover | 06 · Test & measure | https://app.notion.com/p/3eee18af1645813d9675c3b09fcf3546 | The cover's Methods and Outputs mirror that page's two columns and its "all planned, none run" line. |
| tm-test | Test plan | https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe | The six-step programme on the slide is this page's study table, step for step. |
| tm-test › pop-up "probes" (and the proposed "bar" panel) | Test plan | (same) | The probes and the decision rules are both sections of this page. The proposed "sampled on earlier designs" strip could deep-link KD-18: https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c |
| tm-measure | Goals & KPIs | https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7 | The targets, guardrails and the projected chart live here. |
| tm-measure › pop-up "tree" | KD-19 | https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09 | The KPI tree is the measurement decision. Goals & KPIs also works. |
| tm-measure › proposed pop-up "How it could fail" | Pre-mortem | https://app.notion.com/p/3eee18af1645813da04df010073ed382 | The three failure stories come from here. |
| nx-story · cover | 07 · Systems & next | https://app.notion.com/p/3eee18af1645813ea2e7d6c6dbf87ddf | The cover introduces the whole part. |
| nx-story | Solution overview | https://app.notion.com/p/3eee18af164581828521eb27e3e50737 | Notion has no marketing page. Each of the three claims is a part of the solution as built, and this page holds all three. |
| nx-roadmap | Roadmap | https://app.notion.com/p/3eee18af1645818daddff9b46244175c | Now, Next, Later and the kill criteria. |
| nx-roadmap › pop-up "effects" | Second-order effects | https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9 | The pop-up is a cut of this page's effects table. |
| cl-monday | Roadmap | https://app.notion.com/p/3eee18af1645818daddff9b46244175c | Week one is the start of "Now", and the page includes "What to ask stakeholders first". Per-card alternatives: cards 1–2 → Data analysis https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12 · card 3 → Stakeholder interviews https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5 · card 4 → Test plan. |

Mechanics note: all five slides now resolve to the **old** workspace through `notion-links.json` › `pages` (`06-test-measure` and `07-systems-next` are `3eae…` URLs). None of their `data-notion` IDs (T-01, D-121, I-12, D-085, OQ-100 …) is in `ids`. cl-monday also carries `data-no-notion`, so today it shows no link.

## 2. Conflicts

**The key question: how Testing should read.**
- Notion is unambiguous on three points:
  - The tree test and the concept test are 🔭 Projected for the design as built.
  - The earlier simulated runs "can't stand in for any of this" (Test plan).
  - Their results "are not evidence and aren't reported here" (Concept testing).
- KD-18 also says "the prototype was not changed to answer invented findings".
- Antonio's deck keeps its own status words (rule 4), and `op-how` marks Tree testing and Concept testing as **Sampled**. Naming them as sampled is therefore fine.
- The problem is presenting them as results:
  - hero numbers with a count-up;
  - the claim that they "shaped the design".
- Cohesive reading: **"No host has used Smart Listings yet. I sampled two tests on earlier designs to rehearse the method. The design as built gets a real programme, benchmarked against today, with a bar set before each step."**
- What follows from that reading:
  - The programme becomes the hero.
  - The sampled tests become one quiet line each, with no numbers.
  - The 8/8 stays where it belongs, on `cn-judged` (Concept), where it is already labelled.
  - The 71% stays disclaimed on `30-ia`.

| # | slide | deck says | Notion says (page) | right side, why | type |
|---|---|---|---|---|---|
| 1 | tm-test | h2 "Simulated tests shaped the design"; msg "Two simulated tests changed key decisions" | "The only tree test so far … tested the earlier record-first IA, so its result doesn't carry over" (Tree testing). "Simulate test rounds and change the design from them: dropped" (KD-18). | **Notion.** The channel-first menu was chosen in design review (KD-03), not by the tree test. The deck's own `30-ia` says the 71% "doesn't carry over". Only the concept test fed a rule, which KD-14 cites as `SIMULATED`. | **fix** |
| 2 | tm-test | Two hero stat cards: "71% vs 31% on today's menu", "8 / 8 vs 4 / 8 in a preview" | Not reported. "Its results are not evidence and aren't reported here" (Concept testing). The Test plan says the earlier runs "were simulated and can't stand in for any of this". | Labelled sampled numbers don't break Antonio's rules. As heroes on the Testing slide, though, they read as evidence for the design as built. They also duplicate `cn-judged` and `30-ia`. | **flag** (narrative choice) |
| 3 | tm-test notes | "They proved the method and changed real decisions" | The rehearsal "shaped the planted-consequence design" (Concept testing). | **Notion.** A simulated run rehearses a method; it can't prove one. | **fix** |
| 4 | tm-test footer | "A tree test and a concept test with eight hosts" | The concept test used "eight synthetic hosts". The tree test had 30 simulated participants (`ia/tree-test.md`). | **Notion.** "With eight hosts" reads as real people, and the count is wrong for the tree test. | **fix** |
| 5 | tm-test cover | Methods include "Concept testing". Sampled output: "Tree test and concept test results". | The concept test belongs to 04 · Concepts. The tree test of the menu as built is 🔭. | **Notion**, and the deck's own `op-how`, which puts Concept testing under Concept. The Concept cover already lists "Concept test results". | **fix** |
| 6 | tm-measure | "Four numbers": time to adjust, trust, tips kept, each channel before vs after | KD-19: **time to adjust is the north star**, with trust read beside it and four guardrails. The Intro's `op-goals` has five goals (earns more, adoption, refining, tips accepted, tickets) and no time to adjust. | **Rule 4:** `op-goals` wins in the deck. tm-measure matches neither. D-076 says op-goals was added "so Part 6 closes the loop against goals set at the start", and tm-measure doesn't close it. | **flag** (KD-19 vs op-goals). Aligning tm-measure to op-goals is a **should**. |
| 7 | tm-measure | "Each channel" as a measured goal. In `op-goals`: a 40% → 60% target on channels beating their own revenue per available night. | "Occupancy, revenue and views are reported, never targeted". "No revenue uplift is claimed" (Roadmap). KD-19 lists opt-in as "Not chosen … adoption, not value". | Rule 4: the deck wins. Op-goals frames it as a share of channels beating their own baseline, not a lift. Still a direct contradiction with Notion. | **flag** |
| 8 | tm-measure | Trust card: "≥ 80% · Agree 'I know what will change'". The tree says "Satisfaction ≥ 80%". | "≥ 80% satisfied in the pilot … Control ≥ 5.5" (Goals & KPIs). Perceived control is a 1–7 scale. | **Notion.** The card pairs satisfaction's 80% with perceived control's wording (an older `goals.md` K-15 line). The slide also disagrees with its own pop-up. | **fix** |
| 9 | tm-measure | Guardrail "Undo ≤ 5% of sends". Notes: "past 5 percent of sends". | "≤ 5% of accepted tips undone within 7 days" (Goals & KPIs). KD-15: "Undo exists on an accepted tip; a saved section has a receipt but no Undo". | **Notion** (the build). | **fix** |
| 10 | tm-measure | Guardrails: undo · AI copy reverted · no content overwritten · rejections | Four guardrails: **no unsupported AI claims** (reverted ≤ 10% is part of it) · undo · **wrong-channel edits** (≤ 10%; overrides equal to the Base ≤ 5%) · rejections "never silent". Overwrites are a rollout stop rule. | **Notion.** Wrong-channel edits is the guardrail that tests the model itself. | **should** |
| 11 | tm-measure | "Tips kept 30 to 45%" | Goals & KPIs: 30–45%. Op-goals: 20% at 30 days, 30% at 90. Op-goals pop-up: 38% after a year. | Both right on different clocks. Shown side by side, they read as two targets. | **should** (state the horizon) |
| 12 | tm-measure pop-up | Business node: "K-21 Trial to paid 22.7 to 25.7%" | Trial → paid is an import (setup) measure on the Roadmap's Next. Smart Listings' business result is tickets plus sales blockers at 25+. | Notion re-scoped it. Op-goals' pop-up also cites trial to paid, so this is rule-4-adjacent. | **flag** |
| 13 | tm-measure pop-up | Projected chart: tickets flat to M3, −15% only at M4 | Op-goals: "−5%" at 30 days, "−15%" at 90 days after a host turns it on. | Different clocks: months since launch vs days since a host turns it on. Unlabelled, they contradict. | **should** (caption) |
| 14 | tm-measure pop-up | K-06, K-13, K-17 … on screen | SPEC §4.3: few IDs; plain names. | Notion style. Lint only bans IDs in source lines. | **could** |
| 15 | nx-roadmap | Now: "Close one decision": "The menu", "Shared or per channel", "Presets", all "To decide" | The menu is decided: channel-first (KD-03), to be tree-tested. Shared vs per channel is decided (KD-02, KD-04). Presets don't exist: KD-08 replaced "autonomy defaults per host type" with one switch. Roadmap Now: "test and harden Smart Listings, and build the measurement it needs". | **Notion** (the build). These are stale open questions. | **fix** |
| 16 | nx-roadmap | Next: "Validate it for real": usability, channel-first tree test, "Hold and confirm each send" | In Notion these are **Now**. Next is "import and first-time setup … on the same Listing base", plus migrating existing hosts, drift, more tip sources and an amenity list with an owner. "Hold" implies the review queue the build dropped (KD-15: "Save is the commit"). | **Notion.** "Hold" is a plain error. Adding import is allowed by rule 1 as a future step, but it's Antonio's call. | **fix** ("hold") + **flag** (import as Next) |
| 17 | nx-roadmap | Patterns: "Fact · Source · Projection · Suggestion · Autonomy" | "Six patterns … Fact, Source, Inheritance, Tip, Receipt, Autonomy" (Second-order effects). `ds-forward.md`: Inheritance replaces "Projection" (superseded); Tip replaces "Suggestion". | **Notion** (the build). | **fix** |
| 18 | nx-roadmap notes | "the Knowledge Hub … with Smart Listings it feeds every channel too" | The Listing base feeds the channels. Hub facts are cited as tip sources (KD-12), and replies read the same facts as listings. | **Notion.** | **fix** (minor) |
| 19 | nx-roadmap pop-up | Effects: support, amenity taxonomy, terms of service, similar homes | "Three to bring to leadership first: **blast radius**, channel terms, comps dataset". Blast radius is "the honest cost of 'facts once'". | **Notion.** The deck omits the most important effect. | **should** |
| 20 | nx-story | "Locks that can't be turned off" | "Guardrails that can't be turned off": prices and fees, minimum stay and rules, and cancellation "always ask" (KD-08). | **Notion** on substance. On the same slide a lock icon means "Only on Booking.com", so "locks" reads as field locks. | **should** |
| 21 | nx-story | Field states "Uses the Base · Custom for Airbnb · Only on Booking.com" | KD-04: "uses the Base, is customised, or is set by the channel". Test plan task 8 and the probe "Who writes Booking.com's description?" rest on that third case. | **Rule 4: the deck wins.** No edit. Don't import task 8 or that probe into tm-test. | **flag** (no change) |
| 22 | cl-monday | "Stakeholder interviews: Five, 30 minutes each: Integrations, CS, RevOps, Data, AI and ML" | Ten roles in 30-minute one-to-ones (Stakeholder interviews). Roadmap: ask Integrations, AI/ML and Data first. `research/systems/roadmap.md`: "10 × 30 min". | **Notion** and the repo. | **should** |
| 23 | cl-monday | Week one: calls, data, stakeholders, usability round 1. Notes: "By Friday we'd know which parts … are right". | "Benchmark first … Nothing is a target until this has run" (Test plan). The first engineering ask is "a confirmation event per field and channel" (Goals & KPIs). The repo roadmap runs usability in week 2. | **Notion.** The benchmark is missing, and "by Friday" over-promises. | **should** |
| 24 | cl-monday | `data-no-notion` | Every slide gets a link (brief). | Brief. | **fix** |
| 25 | covers | Testing: "Test plan · KPI tree · Targets and guardrails" as Produced. Next: "Second-order effects · Roadmap" as Produced. | 🔭 Projected on all of these. | Rule 4: the deck's words win, and the mapping holds (the plan was produced; its runs are planned). But `op-how` marks "Roadmapping", "Second-order effects" and "Kill criteria" as **planned**, against the Next cover's Produced. The deck contradicts itself. | **flag** (cross-part: op-how) |

## 3. Missing story (ranked)

1. **Kill criteria, written before any result.**
   - Source: the five rows in Roadmap.
   - Today: `op-how` promises "Kill criteria", but no slide shows them. This is the strongest Head-of-Design honesty point in Notion's part.
   - Where: second panel in nx-roadmap's pop-up, and add "Kill criteria" to the Next cover's outputs.
2. **Blast radius, the honest cost of "facts once".**
   - Source: Second-order effects, the first of "the three to bring to leadership first".
   - Today: missing from the effects pop-up.
   - Where: nx-roadmap pop-up (replace "Amenity taxonomy") and one sentence in its notes.
3. **A bar for each step, set before it runs; benchmark first.**
   - Source: Test plan decision rules, such as "go to the pilot only if time to adjust is at index ≤ 75…" and "Nothing is a target until this has run".
   - Today: the slide shows the steps but not the gates. This is also where KD-19's time to adjust can live in the deck without competing with `op-goals`.
   - Where: second panel in tm-test's pop-up.
4. **Pre-mortem.**
   - Source: Pre-mortem, seven failure stories, each with an early signal and what I'd do.
   - Today: not in the deck at all, though Notion's 06 names it as one of three outputs.
   - Where: a new one-panel pop-up on tm-measure, "How it could fail" (tm-measure already has two panels, the lint maximum). Add "Pre-mortem" to the Testing cover.
5. **Import as the next step, on the same Base, then optimisation over time.**
   - Source: hub step 6, KD-01, Roadmap Next. Rule 1 allows import as a future step.
   - Where: nx-roadmap's Next column. Flag for Antonio; an alternative Next without import is given below.

Just below the cut:
- Accessibility as a rollout gate: a WCAG 2.2 AA audit, and severity 3+ blocks the next step. One line in tm-test's notes.
- "Events before features", the first engineering ask. One line in cl-monday's notes.

## 4. Proposed edits

Word counts follow `tools/build.mjs`: number-only tokens don't count; the wall is ≤ 110 words; at most two panels per pop-up, each ≤ 90 words; no en or em dashes anywhere.

### tm-test · cover template
- **must** · Sampled row: "Tree test and concept test results" → "Tree test of the earlier menu"
- **should** · Methods: "Tree testing · Concept testing · Usability testing · Benchmarking · A/B testing · KPI tree" → "Benchmarking · Usability testing · Tree testing · A/B testing · Pilot · KPI tree · Pre-mortem"
- **should** · Produced: "Test plan · KPI tree · Targets and guardrails" → "Test plan · KPI tree · Targets and guardrails · Pre-mortem"
- **should** · Planned: "Benchmark of today · Usability rounds with real hosts · A/B test and pilot" → "Benchmark of today · Usability rounds with real hosts · Tree test of the menu as built · A/B test and pilot"
- **could** · Vision: "And how would we know it is working?" → "And how would I know it works?"
- `covers.json`: no change. `test-measuring` (the megaphone, "put it in front of hosts") fits the new story.

### tm-test · slide (wall ≈ 95 words)
- **should** · Eyebrow: "Evidence" → "The plan"
- **must** · h2: "Simulated tests shaped the design; real hosts come next" → "Real hosts test it next, against today's product"
- **must** · msg: "Two simulated tests changed key decisions. Next, a programme that measures the goals against a benchmark of today." → "No host has used it yet. I sampled two tests on earlier designs; the design as built gets a real programme."
- **should** (flag #2) · Replace `.tm-res`, the two stat cards with count-ups, with a two-row strip that has no numbers. Label it "Sampled, on earlier designs" with the sampled mark.
  - "**Tree test** · on the earlier menu, so this one gets its own"
  - "**Concept test** · why money is never decided in a preview"
- **should** · Programme label: "Next: a programme, benchmarked against today" → "The programme, benchmarked against today"
- **could** · Last step: "50/50, then a 10% holdout" → "50/50, with 10% held out"
- **must** · Footer: "A tree test and a concept test with eight hosts" → "Two tests on earlier designs". Keep "My test plan". Change the door text "The probes" → "The probes and the bar".

### tm-test · pop-up (add a second panel, `data-title="The bar"`, ≈ 68 words)
> Every step has a bar, written before it runs.
> Tree test: channel-first within 5 points of the earlier menu, and 70% on the channel tasks.
> After round 2: time to adjust at 75 or less of today's 100, and 80% success on the key tasks.
> A/B: faster overall, and no task down more than 10 points.
> Pilot: 80% satisfied, under 5% of accepted tips undone, no lost data.

The "Probes" panel stays as it is.

### tm-test · notes (**must**)
> I want to be precise about evidence. No host has used Smart Listings yet. I sampled a tree test and a concept test on earlier designs to rehearse the method. The tree test ran on an earlier menu, so it doesn't carry over; the concept test is why a host never decides money inside a preview. Neither can tell me whether a real host understands this screen.
>
> [Press] So I planned the tests rather than fake results. It starts with today's product: the same tasks on Hospitable as it is, so better means better than today. Then a tree test of three menus, two rounds of think-aloud with two hosts per persona, an A/B of today's structure against channel-first, a six-week pilot with a private Slack channel, and a rollout with a holdout. Every step has its bar written down before it runs, and accessibility gates each one. About 50 seconds.

### tm-measure · slide (wall ≈ 90 words)

Whatever Antonio decides on flag #6, three **must** fixes apply:
- "Undo ≤ 5% of sends" → "Undo ≤ 5% of accepted tips" (in the chip, and in the notes "of sends" → "of accepted tips").
- The Trust card's "Agree 'I know what will change'" → "Hosts satisfied, in the pilot".
- In the tree, "K-23 Undo ≤ 5%" → "Undo ≤ 5% of accepted tips".

The full version (**should**, recommended) closes the loop on `op-goals`:
- h2: "Four numbers, and guardrails against gaming them" → "Back to the five goals, and how I'd keep them honest"
- msg: "I'd measure the work Smart Listings saves, the trust it earns and the tips hosts keep, each against today." → "Each goal from the start, at 90 days. Two checks keep the wins real; four guardrails stop me gaming them."
- Cards: five (`--n: 5`), values from op-goals at 90 days.

  | value | title | descriptor |
  |---|---|---|
  | 60% | Each channel earns more | vs its own weeks before |
  | 25% | Hosts adopt it | of eligible properties |
  | 50% | Hosts keep refining | act on a tip monthly |
  | 30% | Tips earn their place | accepted, out of shown |
  | −15% | Fewer tickets | vs hosts held out |

- New "Checks" row, styled like the guardrails: "Checks · Time to adjust ≤ 60 of today · Satisfied ≥ 80%"
- Guardrails: "Undo ≤ 5% of sends · AI copy reverted ≤ 10% · No content overwritten · Channel rejections ≤ 2%" → "No unsupported AI claims · Undo ≤ 5% of accepted tips · Wrong-channel edits ≤ 10% · Rejections ≤ 2%, never silent"
- Footer: "[simulated] Baselines · [projected] Targets" → "[projected] Targets". Doors: "The KPI tree" and "How it could fail".

### tm-measure · pop-up "tree" (**should**, ≈ 55 words; drop the K-codes)
- **Goals at 90 days:**
  - Each channel earns more 60%
  - Adoption 25%, 35% at six months
  - Refining 50%
  - Tips accepted 30%, 30 to 45% at a year
  - Tickets −15%, −25% at a year
- **Checks:** Time to adjust ≤ 60 · Satisfaction ≥ 80% · Comprehension 4 of 5 for 80%
- **Guardrails:** No unsupported AI claims · Undo ≤ 5% of accepted tips · Wrong-channel edits ≤ 10% · Rejections ≤ 2%, never silent
- Trial to paid is dropped (flag #12).
- **should** · Projected panel caption: "Index, today = 100, lower is better, expected case" → "Months after launch, today = 100, lower is better, expected case"

### tm-measure · new pop-up `data-more="fail"`, "How it could fail" (**should**, one panel, ≈ 63 words)
> Imagine it shipped and failed. The three stories I'd watch first:
> It overwrote something a host had tuned. Signal: undo and overwrite incidents. Any one stops the rollout.
> Hosts don't get channel-first and copy facts into every channel "to be safe". Signal: comprehension and wrong-channel edits.
> The AI says something untrue in public. Signal: AI copy reverted. Above 10%, that tip type turns off.

### tm-measure · notes (**should**; minimum **must**: "of sends" → "of accepted tips")
> Here is how I'd know it works, against the five goals I set at the start: each channel beating its own weeks before the strategy, adoption, hosts who keep refining, tips accepted, and fewer listing and sync tickets. Two checks keep those wins honest: time to adjust, the same tasks as today's benchmark, at 60 or less, and at least 80 percent of hosts satisfied. Four guardrails stop me gaming them: no unsupported AI claims, undo under 5 percent of accepted tips, few wrong-channel edits, and no silent rejections. If one breaks, I slow down. The KPI tree, the projected curves and how it could fail are one click away. About 45 seconds.

### nx-story · cover template
- **should** · Produced: "Marketing story · Second-order effects · Roadmap: now, next, later · First-week plan" → "Marketing story · Second-order effects · Roadmap: now, next, later · Kill criteria · First-week plan"
- **could** · Vision: "How do we tell it, what else does it change, and what comes after it?" → "How I'd tell it, what else it changes, and what comes after it."
- `covers.json`: no change.

### nx-story · slide
- **should** · Card 3 description: "Locks that can't be turned off, a receipt for every change" → "Money and rules always ask; a receipt for every change"
- **could** · Card 2 title: "Written for every site" → "Written for every channel"
- **should** · Notes: "And every change leaves a receipt." → "Money and rules always ask, even on Autopilot, and every change leaves a receipt."
- The field model stays as is (rule 4).

### nx-roadmap · slide (wall ≈ 107, same as today)
- **should** · msg: "The Base and tips become product-wide patterns. Next comes real validation, then testing strategies against each other." → "Shared becomes the record every product reads. Now I test and harden it, then import, then optimise."
- **must** · Now card:
  - Title: "Close one decision" → "Test and harden it"
  - Description: "On the structure as built" → "With hosts and Integrations"
  - Mini rows: "The menu · To decide" / "Shared or per channel · To decide" / "Presets · To decide" → "Benchmark today · Hosts" / "Usability, tree test · Hosts" / "Confirm every change · Integrations"
- **should + flag** · Next card:
  - Title: "Validate it for real" → "Import, on the same Base"
  - Description: "With hosts and Integrations" → "Set up once, confirmed live"
  - Mini rows: "Import fills the Base · Once" / "Existing hosts move · Opt-in" / "Edits on Airbnb · Shown"
  - If Antonio keeps import off the deck: "Grow the tips" · "More sources, fewer surprises" · "Inbox and reviews · Sources" / "Edits on Airbnb · Shown" / "One amenity list · An owner"
- **could** · Later card description: "Against each other, each one measured" → "Each one measured; Autopilot widens where it helps"
- **must** · Pattern chips: "Fact · Source · Projection · Suggestion · Autonomy" → "Fact · Source · Inheritance · Tip · Receipt · Autonomy"

### nx-roadmap · pop-up (**should**)
- Title: "Second-order effects to plan for" → "What it sets off, and when I'd stop"
- Footer door: "Second-order effects" → "Effects and kill criteria"
- Panel 1, "Effects" (≈ 56 words):
  - Replace "Amenity taxonomy · Becomes a product with an owner" with "**Blast radius** · One wrong fact reaches every channel and reply, so every fact shows its source and reach".
  - Replace "Terms of service · Exposure for AI-written copy" with "**Channel terms** · Could switch Autopilot off on a channel overnight".
  - Keep Support and Similar homes.
  - Note: "Not shown yet: no real host has used the menu or the prototype." → "None observed yet: nothing has shipped."
- Panel 2, "Kill criteria" (≈ 69 words):
  > Written down before any result.
  > Hosts can't say where a fact lives after two rounds: revisit the menu.
  > Hosts vary text per channel as often as money: per-channel text becomes the default.
  > Opt-in or tip acceptance well under target for two quarters: stop investing in Autopilot.
  > AI copy reverted above 10%, or a channel strike: pause Autopilot for everyone.
  > A channel's terms forbid automated updates: Autopilot off there; tips stay.

### nx-roadmap · notes (**must**: drop "hold back" and the closed decisions)
> Here is the order I'd go in. Now: test and harden what's built. Benchmark today's product, put the design in front of real hosts with usability rounds and a tree test of the channel-first menu, and agree with Integrations how every change is confirmed on each channel. Next: import, on the same Base, so a new host sets up once and every channel is confirmed live. Later: strategies tracked and tested over time, with Autopilot widening only where tests show it helps.
>
> And this changes more than a listing page. Shared becomes the record the whole product reads: guest replies, pricing, operations and owner statements. That's the upside, and the honest cost: one wrong fact now reaches everywhere, so every fact shows its source and its reach. The effects, and the five criteria that would make me stop, are in the detail. About 50 seconds.

### cl-monday
- **should** · Card 3 description: "Five, 30 minutes each: Integrations, CS, RevOps, Data, AI and ML" → "Ten, 30 minutes each, starting with Integrations, AI and ML, and Data"
- **should** · Card 4:
  - Title: "Usability testing, round 1" → "Benchmark, then usability"
  - Description: "Booked, with all four host types" → "Today's product first; round 1 booked with all four host types"
- **could** · Card 2 description: "Support tickets, 300 tagged and 100 untagged, and listing data" → "Support tickets, 300 tagged and 100 untagged, and per-channel edits"
- **should** · Notes:
  - Replace "five short stakeholder interviews, starting with Integrations, to confirm what each channel lets us hold back and confirm" with "ten short stakeholder interviews, starting with Integrations, to confirm what Hospitable can write on each channel and how every change gets confirmed".
  - Replace "And four: in parallel, I'd book the first round of usability testing across all four host types. By Friday we'd know which parts of Smart Listings are right, and which ones the hosts will teach us to change." with "And four: benchmark today's product, and book the first round of usability testing across all four host types. A week later, the hosts start telling me which parts of Smart Listings are right, and which ones to change."
- **fix** · Remove `data-no-notion` and link the Roadmap.

## 5. Narrative note

Notion tells step 6 as one move. Nothing about the design as built has met a host, so here is how I'd find out, what I'd measure, what it sets off, and the order: test and harden, then import, then optimisation over time.

The deck's part has the right shape but sends three mixed signals:
- tm-test opens on two sampled numbers under "Simulated tests shaped the design". That reads as evidence, and it contradicts both KD-18 and the deck's own IA slide.
- tm-measure measures four numbers that are neither the Intro's five goals nor KD-19's frame.
- nx-roadmap's "Now" reopens decisions the build has already closed, and leaves out the kill criteria and blast radius, Notion's most candid points.

The one change that would make the part read best is to open Testing with "no host has used it yet; here is the programme and the bar for each step". tm-measure then closes the loop on the Intro's five goals, kept honest by time to adjust and four guardrails. After that:
- nx-roadmap can follow Notion's order, with the kill criteria in its detail.
- nx-story stays the pitch.
- cl-monday becomes literally the first week of "Now".
