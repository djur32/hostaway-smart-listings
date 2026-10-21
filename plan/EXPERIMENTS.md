# Experimentation spec (shared by deck slides and Notion "08 · Experimentation")

This is the concept's own measurement design. Nothing here ran. Example numbers always carry "Sample data".

## Framework (every experiment follows it)
- Hypothesis written as: "If we [change], then [metric] moves by at least [MDE] for [audience], because [reason]."
- One primary metric, 2 to 4 guardrails, one decision rule written before launch.
- Unit of randomisation: the host account (listings of one host share tips, so listing-level randomisation leaks). Stratify by number of listings and by channel mix.
- Minimum detectable effect (MDE): set from the smallest change worth shipping, not from what the sample can detect. Sample size comes from a two-sided test, alpha 0.05, power 0.80, using the baseline from the previous 8 weeks. Ratio metrics use the delta method, so the unit stays the host.
- Run-length rule: whole weeks only (so weekday mix is balanced), at least 2 weeks, stop when the pre-computed sample is reached. No stopping on a good-looking interim. Guardrails alone are monitored daily with a sequential bound and can stop a run early.
- Ramp: 1% (checks the plumbing, no decision) -> 5% -> 25% -> 50%. A permanent 5% holdout stays on the old behaviour for 90 days after full rollout.
- Kill criteria: any guardrail past its bound for 2 days in a row, a revert (undo) rate above 15% of applied tips, or any channel-rule violation shipped to a live listing.
- Owners: design owns hypothesis and variants, data owns the analysis plan and readout, engineering owns flags and the kill switch, support owns the ticket guardrail.

## Metric tree
North star: listings with a strategy-aligned field on every active channel.
- Adoption: hosts who set a strategy, tips shown, tips accepted (acceptance rate).
- Quality: fields customised for a channel, channel-rule violations per 100 applied tips, undo rate.
- Outcome: per-channel booking conversion (listing view to booking request), time to finish a listing edit.
- Guardrails: undo rate, support tickets per 1,000 hosts, weekly active editors, listing views (no drop), page load time.

## Experiment portfolio (7)
| # | Name | Hypothesis (short) | Primary | Guardrails | Audience | Variants | Decision rule |
|---|------|--------------------|---------|------------|----------|----------|---------------|
| E1 | Strategy per channel | Setting a strategy per channel raises tailored fields | Share of active listings with a channel-tailored field after 4 weeks | Undo rate, tickets, listing views | Hosts with 2+ channels | A: today. B: strategy per channel | Ship if lift >= MDE (+8 pts) and no guardrail breach |
| E2 | Tips with a why | Showing the why behind a tip raises acceptance | Tip acceptance rate | Undo rate, rule violations | Hosts with strategy on | A: tip only. B: tip + why + sources | Ship if +5 pts acceptance and undo not higher |
| E3 | Rewrite per channel | Per-channel rewrite cuts edit time | Median time to finish a channel description | Edit-after-accept rate, violations | Hosts editing descriptions | A: manual. B: assistant rewrite with diff | Ship if time down 25% and edit-after-accept under 40% |
| E4 | Canvas preview | Seeing the real guest page before accepting lifts confidence | Share of tips accepted after preview vs without | Undo rate, time to decide | Hosts with tips pending | A: list only. B: list + canvas | Ship if acceptance +4 pts and undo flat or lower |
| E5 | Performance view | Seeing results per strategy brings hosts back | Weekly active editors (4-week) | Tickets, load time | Hosts with a strategy | A: no view. B: Performance tab | Iterate if lift between 0 and MDE, ship if above |
| E6 | Autopilot setting | Auto-applying low-risk tips (with undo) saves effort without harm | Tips applied per host per week | Undo rate, violations, tickets | Hosts who accepted 10+ tips | A: suggest only. B: autopilot on low-risk fields | Ship only if undo under 8% and zero violations |
| E7 | Channel-first menu | Channel-first menu makes per-channel edits easier to find | Task success on "edit the Airbnb title" (unmoderated task and live click path) | Time on task, tickets | Hosts opening listing settings | A: current menu. B: Shared first, then one group per channel | Ship if success +10 pts and time not worse |

## Readout layout (Reading a result)
Header with experiment, dates, sample. Primary metric with effect and 95% interval. Guardrail table (metric, change, bound, status). Segment checks (channel, listing count) labelled exploratory. Decision: ship / iterate / stop, with the rule that applied. Sample data example: E2 acceptance 31.0% control vs 36.4% treatment, +5.4 pts, 95% interval +3.1 to +7.7, n = 4,200 hosts per arm. Undo rate 6.1% vs 6.4% (bound 8%). Decision: ship. Caption "Sample data".

## Rollout stages
Stage 0 internal and plumbing (1%). Stage 1 experiment (5% to 50%). Stage 2 full rollout with 5% holdout for 90 days. Stage 3 holdout read, then retire flags. Each stage has an owner, a go criterion and the kill criteria above.
