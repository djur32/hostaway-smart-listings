# STORY · the Hostaway deck, slide by slide

> The narrative spine for S17. Each slide says **one thing**; this file is where that thing is written first. S17 sharpens a message here when the evidence says something better, then changes the slide. Outline from MASTER-PLAN §7 (S17 owns the final version). Slides live in `src/slides/NN-part.html`.

**The story in three lines.** Hostaway already has two truths about every property (Details and the Knowledge Hub) and a silent moment after "You're connected". *A creates the truth*: import, reconcile, and a Knowledge Hub where every fact shows its source. *B puts it to work*: a Smart Listing studio that writes each channel's voice from those facts, with the host in the loop. The process (discovery, research, IA, concept, design, test, measure) is the spine. The tension is the problem.

**Paths** (Personalise, `V`): **S** Short · **St** Standard (the ~22-minute Loom) · **E** Everything. Today: Short 21, Standard 41 (21.3 min), Everything 49 (25.3 min). The plan's targets are ≈18 and ≈32 (OQ-070).
**Angle** (`data-angle`): A · B · both · none. Scope guard: ≥ 70% of Standard slides are A, B or both. Today it's 36 of 41 (88%).
**Notion**: every slide's "In Notion ↗" resolves through `src/data/notion-links.json` (CONTRACT.md §6). "Page" below is the key in its `pages`.
**Cover**: the first slide of each part opens under that part's cover (D-072); its question is quoted with the part.


## Intro · `00-open.html`

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `op-title` | Listing Management II | Facts once. Voice per channel. The host stays in the loop. | S | none | 00-brief | title | R-180 R-181 R-189 | deck |
| 2 | `op-brief` | The brief in one breath | Two angles, taken as one story: A creates the truth, B puts it to work. | S | both | 00-brief | brief | R-001 R-008 | plan/BRIEF.md · D-001 |
| 3 | `op-thesis` | Facts once, voice per channel, host in the loop | The thesis this work set out to test, and what would have proved it wrong. | S | both | 00-brief | thesis | R-001 R-016 R-011 | MASTER-PLAN §2 |
| 4 | `op-how` | How I worked | Eight stages, AI sessions for the legwork, and a label on everything that is not real. | St | none | 00-brief | how | R-035 R-010 R-037 | 99 · Process |

## Discovery · `10-discovery.html`

*Cover question:* What is really going on, and what do we need to learn before designing anything?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 5 | `dc-today` | Today's product, mapped | The property is spread across eleven sections, and listing content lives in three of them. | S | both | 01-discovery | browser | R-066 R-067 R-022 | S01 · research/current-state/ia-current.md |
| 6 | `dc-two-truths` | Two truths, and the channels | Details and the Knowledge Hub hold the same facts twice, and neither says which channel said so. | S | both | 01-discovery | twotruths | R-016 R-072 | S01 · HS-22, HS-40, HS-45 |
| 7 | `dc-signals` | Signals from Gong, tickets and CRM | Sync and trust dominate what hosts complain about, before copy ever does. | S | A | 01-discovery | bar | R-020 R-054 R-055 | S05 · research/data/gong-themes.csv |
| 8 | `dc-questions` | Research questions and riskiest assumptions | Five assumptions could sink the thesis; research went after those first. | St | both | 01-discovery | matrix | R-051 R-050 | S04 · Q-## and H-## |
| 9 | `dc-plan` | Discovery plan and who we talk to | Who knows what: hosts, CS, integrations, RevOps, each with a question only they can answer. | E | none | 01-discovery | plan | R-050 R-043 | S04 · Stakeholders DB |

## Research · `20-research.html`

*Cover question:* What do hosts need, per persona? What do others do? What will the channels allow?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 10 | `rs-method` | Method and sample | Five hosts, one card sort, public reviews and the channels' own docs, each with its label. | E | none | 02-research | method | R-052 R-053 | S05 · Interviews DB |
| 11 | `rs-hosts` | Four hosts, four mental models | Each persona reads "my listing" differently: a home, a funnel, a portfolio, a form. | S | both | 02-research | personas | R-018 R-065 | S05 · Personas DB |
| 12 | `rs-quotes` | In their words | Hosts do not want more fields; they want to stop checking three tabs to trust one fact. | S | both | 02-research | quotes | R-183 R-052 | S05 · INT-1 to INT-5 |
| 13 | `rs-insights` | From evidence to insight | Every insight shows how many sources hold it up, and how strong they are. | St | both | 02-research | insights | R-044 R-057 | S05 · Insights DB |
| 14 | `rs-jobs` | Jobs to be done | The job is not "edit a listing"; it is "be found and trusted on every channel without redoing work". | St | both | 02-research | jobs | R-061 | S05 · JTBD DB |
| 15 | `rs-journey` | First-time setup, today | The low point is the silent moment after "You're connected". | S | A | 02-research | journey | R-063 R-060 | S05 · research/synthesis/journeys.md |
| 16 | `rs-cardsort` | How hosts group listing content | Hosts sort by who reads it (guests, the AI, the team), not by the product's tabs. | St | both | 02-research | dendro | R-056 R-045 | S05 · research/data/card-sort/ |
| 17 | `rs-channels` | What the channels allow | Each channel names, limits and accepts the same fact differently, and some refuse free text. | St | B | 02-research | channels | R-059 R-012 R-023 | S03 · research/market/channel-constraints.md |
| 18 | `rs-others` | What others do, and the PIM analogy | Competitors sync fields; retail solved "one product, many storefronts" years ago. | St | both | 02-research | others | R-058 R-021 | S03 · Competitors DB |
| 19 | `rs-diagnosis` | The diagnosis | The problem is not missing features: the product has no single place where a fact is true. | S | both | 02-research | diagnosis | R-062 R-057 | S05 · research/synthesis/diagnosis.md |

## Information architecture · `30-ia.html`

*Cover question:* How should everything we know about a property be organised?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 20 | `ia-bathtub` | One bathtub, four names | One canonical fact, mapped to what each channel calls it and accepts. | St | both | 03-ia | bathtub | R-082 R-059 | S06a · ia/canonical-fields.csv |
| 21 | `ia-objects` | The object model | Property, listing, fact, projection, source, version: six objects and how they relate. | S | both | 03-ia | objects | R-017 R-070 | S06a · ia/object-model.md |
| 22 | `ia-options` | Seven ways to organise it | Seven structures from seven mindsets, from channel-first to portfolio-first. | St | both | 03-ia | iaoptions | R-071 R-046 | S06a · ia/options/ |
| 23 | `ia-recommend` | The recommended IA, tested | Record-first won the tree test; the calendar keeps its way back. | S | both | 03-ia | iarec | R-070 R-073 R-075 | S06b · ia/recommendation.md |

## Concept · `40-concept.html`

*Cover question:* What are the radically different ways to solve it?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 24 | `cn-principles` | Principles | Five rules every direction had to obey, starting with "nothing is lost". | St | both | 04-concepts | principles | R-011 R-116 | S08 · 04 Concepts |
| 25 | `cn-grid` | Seven directions, five screens | Thirty-five frames: each direction taken through the same five moments. | S | both | 04-concepts | grid | R-160 R-161 R-162 | S08 · Paper frames |
| 26 | `cn-judged` | How we judged them | Scored against the insights, the personas and the channels' limits, in the open. | St | both | 04-concepts | eval | R-163 | S08 · evaluation matrix |
| 27 | `cn-converge` | Two finalists, one hybrid | The record of one direction and the inbox of another, with preview as a toggle. | S | both | 04-concepts | decision | R-164 R-104 R-103 | S09 · convergence D |

## Design · `50-design.html`

*Cover question:* What exactly do we build, and how does it behave?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 28 | `ds-import` | Import: what we found | After connecting, the host sees what came from where before anything changes. | S | A | 05-design | pr | R-080 R-081 R-085 R-090 | S10 · SCR-01 |
| 29 | `ds-reconcile` | Reconcile: unify or keep per channel | Differences become decisions, one at a time, and the original is always kept. | S | A | 05-design | browser | R-086 R-084 R-087 R-004 | S10 · SCR-02 |
| 30 | `ds-solution` | The solution in one screen | Everything true lives once; every channel gets its own voice; nothing ships without the host. | S | both | 05-design | live | R-166 R-100 | S09 · prototype |
| 31 | `ds-hub` | The Knowledge Hub, with a channel lens | Every fact shows its source and how it reads on each channel. | S | both | 05-design | browser | R-072 R-089 R-081 R-088 | S11 · SCR-03 |
| 32 | `ds-studio` | The Smart Listing studio | Titles and photos per channel, written by AI within each channel's rules. Booking.com writes its own description from your facts. | S | B | 05-design | live | R-005 R-100 R-101 R-102 R-103 | S11 · SCR-04 |
| 33 | `ds-titles` | Titles: options, refine, comps | A recommended title, alternatives with their reasons, and how similar listings phrase it. | St | B | 05-design | browser | R-106 R-107 R-108 | S11 · SCR-04 |
| 34 | `ds-description` | Description: one draft, smart editing | One factual draft, rewritten by selection, steered by a strategy. | St | B | 05-design | browser | R-109 R-110 R-088 | S11 · SCR-04 |
| 35 | `ds-comps` | Grounded in comps | Recommendations cite the similar listings they learned from, and how those book. | St | B | 05-design | comps | R-111 R-112 R-113 | S11 · comps data |
| 36 | `ds-control` | Control and transparency | Autonomy is a dial per field group, and every suggestion says why, where and how to undo. | S | B | 05-design | decision | R-006 R-116 | S11 · ds/ai-patterns.md |
| 37 | `ds-personas` | One product, four hosts | The same screen adapts: hints for the new host, bulk for the portfolio, stats for the optimizer. | St | both | 05-design | personamodes | R-130 R-131 R-132 R-133 R-134 R-135 | S12 · persona modes |
| 38 | `ds-portfolio` | Portfolio: bulk, and pricing at two levels | Strategy set once for the portfolio, overridden per property where it matters. | E | B | 05-design | browser | R-115 R-114 R-133 | S12 · SCR-05 |
| 39 | `ds-mobile` | Mobile and voice | On the phone, the host approves and steers by voice rather than editing fields. | St | both | 05-design | mobile | R-140 R-141 R-076 | S13 · /mobile |
| 40 | `ds-states` | States and edge cases | Sync failed, a channel refused, a fact drifted: every state has a screen and a way out. | E | both | 05-design | states | R-064 R-165 R-020 | S14 · States DB |
| 41 | `ds-system` | The design system, extended | New patterns join Hostaway's system first, then the screens use them. | E | none | 05-design | dsys | R-150 R-151 R-153 R-154 R-155 | S02 · ds/ |

## Test & measure · `60-test.html`

*Cover question:* Do people understand it and trust it? And how would we know it is working?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 42 | `tm-usability` | Usability test: plan and findings | Hosts understood the hub; two in six hesitated before letting AI publish. | St | both | 06-test-measure | kpis | R-170 R-173 | S15 · Tests DB |
| 43 | `tm-iteration` | v1 to v2 | What the test changed, screen by screen. | E | both | 06-test-measure | pr | R-163 R-170 | S15 · iteration log |
| 44 | `tm-kpis` | KPI tree and guardrails | One north star, the levers under it, and the guardrails that stop us gaming it. | St | both | 06-test-measure | kpitree | R-171 R-019 | S15 · Metrics DB |
| 45 | `tm-projected` | Projected evolution | What we expect to move, by when, and on what assumption. | E | both | 06-test-measure | line | R-172 | S15 · projections |

## Systems & next · `70-next.html`

*Cover question:* What else does this change, and what comes after it?

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 46 | `nx-systems` | What else this changes | Once facts are clean, messaging AI, Direct and the guidebook read from the same record. | St | none | 07-systems-next | systems | R-009 R-034 R-156 | S16 · product map |
| 47 | `nx-angle-c` | Versions, performance, testing | Angle C is the next thing: every version measured, the better one kept. | St | none | 07-systems-next | rail | R-120 R-121 R-122 R-123 R-013 | S16 · roadmap |
| 48 | `nx-story` | Smartifying: the story to tell | Decisions made for you, with you in the loop: the line Marketing can take out. | E | B | 07-systems-next | story | R-190 R-021 | S16 · narrative |

## Close · `70-next.html`

| # | id | Slide | The one message | Path | Angle | Page | Component (placeholder) | Requirements | Fills from |
|---|---|---|---|---|---|---|---|---|---|
| 49 | `cl-monday` | What I'd do on Monday | Five first-week actions, and who I would talk to first. | S | none | 07-systems-next | close | R-191 R-013 R-189 | S16 |


## What S17 changes here

- A message that the evidence contradicts gets rewritten here first, then on the slide (`.hc-msg`) and in the speaker notes.
- A new slide takes a row here first. Then check the count: the build fails above 50.
- The numbers in `data-min` are budgets for the presenter clock; Standard should total about 22.
