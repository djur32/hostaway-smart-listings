# Deck × Notion v2 review · Intro (`deck/src/slides/00-open.html`)

Slides: op-title · op-burden · op-brief · op-hypothesis · op-idea · op-shift · op-goals · op-how.
Word counts (before → after each edit set, checked by applying the edits to a copy) use the deck's own lint (`tools/build.mjs`: words with a letter; footers, captions, notes and pop-ups excluded from the slide). Today: op-title 65 · op-burden 101 · op-brief 108 · op-hypothesis 47 · op-idea 104 (pop-up 84) · op-shift 108 · op-goals 105 (pop-up 88) · op-how 39.

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| op-title | Hospitable · Smart Listings (hub) | https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613 | The cover's five-step story is the hub's "solution in one paragraph" and hero shot. Alternative: Solution overview. The slide carries `data-no-notion`, so no link shows unless Antonio drops it. |
| op-burden | Problem statement | https://app.notion.com/p/3eee18af1645814c9da9f6fce430fb5c | "Hosts … check each channel by hand" is the part-time job. It ties the three beats together (channels, hosts, today) and links on to Channel constraints and Current-state map. |
| op-brief | 00 · Brief & scope | https://app.notion.com/p/3eee18af164581e28fddc912dc332953 | Holds the brief verbatim (the quote) and "What I chose: Angle B, built as Smart Listings" (the spin). |
| op-hypothesis | Research questions & assumptions | https://app.notion.com/p/3eee18af1645819282b2f11c14720c03 | "The thesis was broken into 20 hypotheses, each with what would disprove it." The "It's true when" chips are KD-19's measures (alternative: https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09). |
| op-idea | Solution overview | https://app.notion.com/p/3eee18af164581828521eb27e3e50737 | The five pillars are the solution paragraph and the model diagram. |
| op-idea › pop-up "One field, three cases" | Listing base & channels | https://app.notion.com/p/3eee18af164581178debffa0628f4703 | Its "Three states for a field" table and the channel-only fields (Airbnb's Check-in method). |
| op-shift | Current-state map | https://app.notion.com/p/3eee18af16458163b059f704859d3a6a | The "Today" column and the footer ("Product audit") are this page: seven per-channel patterns, no channel view, Airbnb's Opportunities as the only listing AI. |
| op-goals | Goals & KPIs | https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7 | The goals and targets page. The pop-up fits the same page (its "How it was made" holds the projection assumptions and the two-month ticket lag). KD-19 is the decision behind it. |
| op-how | KD-18 · Label what is simulated; plan the tests rather than fake results | https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c | The slide's line "I ran what I could reach, sampled what needed hosts, and planned the rest" is KD-18, and KD-18's Records hold the slide's own D-003 and D-043. Alternative: the hub's "How to read this" (sections and status legend). Part 2 ("How I'd agentify it") has no Notion counterpart. |

Wiring notes:
- `hc.js` reads `src/data/notion-links.json › slides[<id>]` first, and that map is empty today. The slides' `data-notion-page` keys (`hub`, `00-brief`, `06-test-measure`, `99-process`) resolve to the **old** workspace (3eae… URLs), so the rows above go into `slides`.
- Old IDs map to KD rows as follows: D-001 → KD-01 · D-980 → KD-02 · D-104 → KD-15 · D-990/D-991 → KD-19 · D-003/D-043 → KD-18.

## 2. Conflicts

| # | slide | deck says | Notion says (page) | who's right, why | type |
|---|---|---|---|---|---|
| 1 | op-goals | Five goals, 30/90-day targets, led by "Each channel earns more" (40% → 60% of channels beat their own revenue per available night). No time to adjust. | **North star: time to adjust**; trust read beside it; four guardrails; 12-month projections (Goals & KPIs, KD-19). "No revenue uplift is claimed"; occupancy and revenue "reported, never targeted" (Roadmap). | Deck wins in the deck (rule 4). But the Notion link from this slide lands on a different frame. | **Flag** (rule 4) |
| 2 | op-goals | "Hosts adopt it", 10% → 25% | Opt-in is "Not chosen: adoption, not value; some hosts rightly never turn it on" (Goals & KPIs). 35% at 6 months survives only as a kill threshold (Roadmap). | Deck (rule 4). The pop-up's "The plan sets 35%" is consistent with the Roadmap. | **Flag** |
| 3 | op-goals | "Hosts keep refining · act on a tip in the month · 60% → **50%**" | No such measure anywhere in Notion. | Deck (rule 4). The target falls from 30 to 90 days: confirm that's intended (novelty decay) and say so in the pop-up, or it reads as a typo. | **Flag** |
| 4 | op-goals pop-up | "with trial to paid from 22.7% to 25.7%" | Trial → paid is a **set-up** measure under "Next · import" on the Roadmap. 22.7% is `SIMULATED`. | Notion. It is an import metric (rule 1) and an unlabelled simulated number (rule 5). | **Fix** |
| 5 | op-goals | "…30 and 90 days **after a host turns it on**" | The projections run in months "after go" (Goals & KPIs chart). | Notion's frame. Adoption can't be measured after a host turns it on (it's circular), and tickets per 100 properties are fleet-wide. "After launch" fits all five. | **Fix** |
| 6 | op-goals | "What **we** measure"; notes "**We** don't have Hospitable's data" | First person "I" (SPEC §4.5; deck rule 2) | Rule 2. | **Fix** |
| 7 | op-hypothesis notes | "Those four come back as the goals in a moment." | Not a Notion item; internal. | op-goals shows five *different* goals. Time and trust come back only on tm-measure. | **Fix** |
| 8 | op-hypothesis | "Each channel beats its own baseline" as proof | Performance compares with the days before (KD-07), but revenue is never a target (Roadmap). | Deck (rule 4: tracked before and as it evolves). | **Flag** |
| 9 | op-idea | "Choose how independently it runs, **from tips to review to Autopilot**, and what it may touch" | Autopilot is **on or off**; the three-level dial (Suggest / Auto-apply with review / Autopilot) was dropped (KD-08). | Notion and the prototype. "Tips to review to Autopilot" reads as three levels. | **Fix** |
| 10 | op-idea pop-up | Three cases: uses the Base · custom · channel-only field | Three states: uses the Base · customised · **set by the channel** ("Booking.com decides", read-only) (KD-04, Listing base & channels) | Deck (rule 4). The prototype still shows the fourth state, so the Notion link will show it. | **Flag** |
| 11 | op-idea pop-up | Channel-only example "**Arrival checklist** · Airbnb only" | Airbnb's **Check-in method** and Guest checkout tasks are the Airbnb-only fields (Listing base & channels; `prototype/src/data/sl3.ts`, `state: { airbnb: 'only' }`). | Prototype. No "Arrival checklist" field exists. Also note: BRIEF rule 4's example says "Check-in method · Only on **Booking.com**", but the build has it on **Airbnb** only. | **Fix**, plus a **flag** on the example |
| 12 | op-idea pop-up | "All edited in Hospitable. **Switched on per property.**" | Only the AI layer is opt-in; "Shared and Channels look exactly the same" with it off (KD-05). | Notion. Next to the field model, the line implies the model itself is opt-in. (Field visibility does need Smart Listings on, per `PropertyOverview.tsx`.) | **Fix** |
| 13 | op-idea pop-up | "Field visibility · Show / Edit / Don't show" | Missing from Notion. | Deck (the prototype has it on Overview once Smart Listings is on). It's a Notion gap, not a deck change. | **Flag** (Notion) |
| 14 | op-idea | "Listings that **manage themselves**." | Autopilot off by default; tips wait for the host (KD-08, KD-05). | A narrative choice: launch voice against the as-built default. | **Flag** |
| 15 | op-shift | Today · Strategy: "**Same content everywhere**" | "Different per channel" is done **seven ways** across about 15 fields (Current-state map, `REAL·PRODUCT`). | Notion. The footer cites the product audit, which says otherwise. The notes already say "unless they edit field by field". | **Fix** |
| 16 | op-shift | Today · Recommendations: "Improving it is guesswork" | "The only listing recommendations are **Airbnb's Opportunities**" (Current-state map; KD-09) | Notion. More precise, and real. | **Fix** (should) |
| 17 | op-burden | "Guests look for: **Vibe and photos** · Facts: it writes the text · **Space for families**" | Channels differ in **rules and who writes the listing** (Channel constraints, `REAL·PUBLIC`). The vibe/families lines come from the simulated SEO-optimiser persona (`research/synthesis/personas.md`). | Notion. Unlabelled simulated claims (rule 5). Vrbo is "researched, not built". | **Fix** |
| 18 | op-burden | Message "in **one crowded place**" against the chip "Listing **spread across screens**" | Hub step 1: "Today the facts live twice"; no screen shows one listing on one channel. | Internal contradiction. Notion's lead finding (two stores, 14 of 28 facts match) is absent. | **Fix** (should) |
| 19 | op-burden | P4 "New to a PMS · **Sets it once**"; notes "sets the listing once and doesn't know it could be refined" | "Used to editing on Airbnb or Booking.com, unsure why a PMS is involved at all" (00 · Brief, `REAL·BRIEF`); Priya: "Why would I? It's on Airbnb." (Personas) | Notion and the brief. | **Fix** (should) |
| 20 | op-burden | No source line | Brief (hosts), product audit (chips), channel docs (lanes) | Rule 3: the slide shows research data. | **Fix** (should) |
| 21 | op-brief | Spin 1 "**From copy to strategy.** A view and a goal for every channel, not just words." | The brief's Angle B already asks for "platform-specific titles, descriptions, **and strategies**" (00 · Brief). | Notion and the brief. The spin should be what the strategy drives, not the word itself. | **Fix** (should) |
| 22 | op-brief | The spin never answers the quoted question ("one field to rule them all") | Notion's first "What I chose" bullet: every fact lives once; each channel keeps only what differs (00 · Brief; KD-02, KD-04) | Notion. This is the most direct answer to the quote. | **Should** |
| 23 | op-brief, op-idea, op-shift | "Tracked over time, before and as it evolves" | One baseline, the same days before the strategy; **no versions**. Strategy periods are "Later" (KD-07, Roadmap). | Deck (rule 4). | **Flag** |
| 24 | op-title, op-burden | "**Earn more** on every channel"; "the listing drives revenue" | "No revenue uplift is claimed" (Roadmap) | Narrative choice (launch voice). | **Flag** |
| 25 | op-title | Chip "Saved · **Live on every channel**"; notes "it is live everywhere" | Receipt "Saved · sent to Booking.com", Sent → Live, or In review for a Booking.com name (KD-15). Booking.com writes its own description. | Prototype. | **Fix** (should) |
| 26 | op-title | Steps "1 **Set up the base** · 2 **Connect any channel**" | How a host uses it starts with "Turn it on" (Solution overview). Connecting and setup are import, a future step (KD-01). | Notion and rule 1. These steps read as onboarding. | **Fix** (should) |
| 27 | op-how · Discovery | "CS tickets review · Sampled" | Tickets sit in **02 · Research › Data analysis** 🔭, with illustrative results, alongside Gong calls, "Edit per channel" usage, Hub usage and the board. | Notion's place and name. Sampled is right in deck words (KD-18 lists the data review as simulated). | **Fix** (should) |
| 28 | op-how · Discovery | "Competitor analysis"; **Product audit** absent | Methods are Product audit ✅ · **Desk research** ✅ (channels, 36 competitors, 115 reviews, board) · Stakeholder interviews 🔭 | Notion. Product audit is the lead Done method, and op-shift's footer cites it. | **Fix** (should) |
| 29 | op-how · Research | "Desk research · Done" | A **01 · Discovery** method | Notion's placement. But op-how mirrors the deck's own parts (dc-signals in Discovery; rs-channels and rs-market in Research), so placement follows whatever the Discovery and Research reviews decide. The names should follow Notion either way (see the variant in §4). | **Should** (depends on other parts) |
| 30 | op-how · Design | "**Failure states** · Done" | No Notion page. STATUS.md lists S14 (states) as "Not started". The failure states that were built (auth expired, partial photos, go-live error) are in the **import** flow (SESSION-LOG, S10 follow-up). | Notion, plus rule 1: this presents import work as done. | **Fix** |
| 31 | op-how · Design | No design reviews | "Shaped through my own design reviews… versions, a compare mode, a Setup page and inline editing on the Canvas were built and then removed" (05 · Design) | Notion. This is the stage's actual method. | **Should** |
| 32 | op-how · Testing | "KPI tree · **Done**" | Goals & KPIs 🔭 Projected. Roadmap and Second-order effects are 🔭 too, and the deck itself marks those two Planned. | Notion. The deck is inconsistent with itself: three projected write-ups, two marks. | **Flag** (a mark Antonio set) |
| 33 | op-how · Testing | "Tree testing · **Sampled**" | Tree testing 🔭: "the only tree test so far was simulated and tested the earlier record-first IA, so its result doesn't carry over to this menu" | Notion. "Sampled" implies the menu as built was tree-tested. Coordinate with tm-test, which quotes 71% vs 31%. | **Fix** (should) |
| 34 | op-how · Concept | "Concept testing · Sampled" | Method 🔭. A simulated rehearsal exists, but "its results are not evidence and aren't reported here", even though KD-14 cites it as `SIMULATED`. | Deck word is fine (KD-18 lists the concept test as simulated). Notion contradicts itself. | **Flag** |
| 35 | op-how notes | "I sampled five interviews **in Notion** … and the concept and design were built on those" | The simulated interviews live in the repo, and Notion shows an illustrative synthesis. The design also rests on the real audit and channel docs (Solution overview, "What it answers from research"). | Notion. | **Fix** (should) |

## 3. Missing story (ranked, strongest five)

1. **Today the facts live twice; Smart Listings keeps them once** (hub steps 1 and 4; KD-02; Current-state map, `REAL·PRODUCT`). This is the case's strongest real finding and the direct answer to the brief's "one field" quote, and the intro never connects the two. *Fold in:* the op-burden chip "Facts kept twice", and op-brief spin 1. dc-two-truths keeps the 14-of-28 number.
2. **What I didn't do, and why** (00 · Brief "What I didn't do"; KD-01, KD-18): no research ran with real hosts, and import comes next on the same model. This is a depth-over-breadth honesty point. *Fold in:* one sentence in the op-brief notes, with import only as a future step (rule 1).
3. **Time to adjust as the measure of the hypothesis** (KD-19: "the model's promise in one number", timed against today's product). op-hypothesis already says "Changes take less time" but never says how it's measured. *Fold in:* the op-hypothesis notes. Whether op-goals carries it is Antonio's call (conflict 1).
4. **Opt-in per property; only the AI layer is optional** (KD-05; Personas: off by default for Marta and Priya). This is the first level of the brief's "level of control" question, before Autopilot. *Fold in:* the op-idea pillar "You stay in control" (edit below).
5. **Money and stay rules vary per channel far more than words** (hub step 3; KD-11; `SIMULATED`). This is *why* tips cover pricing, availability and policies, and op-brief and op-idea state it without the reason. *Fold in:* the op-brief notes, labelled as the sampled research.

No new slide is needed.

## 4. Proposed edits

### op-title
- **should** · Caption 1 "Set up the base" → **"One base of facts"** · Caption 2 "Connect any channel" → **"Every channel reads it"** (rule 1; Solution overview). The animation stays the same.
- **should** · Chip "Saved · Live on every channel" → **"Saved · Sent to every channel"** (KD-15 receipt copy).
- **should** · Notes: "You save once, and it is live everywhere." → "You save once, and it goes out to every channel, with a receipt." · "You set it up once: every fact about the home goes into one base. [Press] Any channel you sell on connects to it." → "Every fact about the home lives once, in one base. [Press] Every channel you sell on reads from it."
- **flag** · "Earn more on every channel" (conflict 24) and "Set it once": Antonio's launch line. Keep, knowing Notion claims no uplift.
- Words: 65 → 66.

### op-burden
- **must** · Lanes label "Guests look for" → **"Each channel's rules"**. Items: Airbnb "Vibe and photos" → **"Titles up to 50 characters"** · Booking.com "Facts: it writes the text" → **"Writes its own description"** · Vrbo "Space for families" → **"Headlines of 20 to 40 characters"** (all `REAL·PUBLIC`, Channel constraints). *If Antonio keeps the guest lines,* label them: footer `Simulated` + "What sampled hosts say guests want".
- **should** · Chip "Listing spread across screens" → **"Facts kept twice"** (removes the clash with "one crowded place"; hub step 1).
- **should** · P4 subtitle "Sets it once" → **"Unsure why a PMS is involved"** (`REAL·BRIEF`).
- **should** · Add a source line: `<p class="hc-src"><span class="hc-prov" data-prov="brief"></span><span>The brief's four hosts</span><span class="hc-prov" data-prov="public"></span><span>Channel documentation</span><span class="hc-prov" data-prov="product"></span><span>Product audit</span></p>`
- **should** · Notes: "Guests behave differently on each one: different goals, different references, different competition; Booking.com even writes its own description." → "Each one has its own guests, competition and rules: different title limits, different fees, and Booking.com even writes its own description." · "the newcomer, busy with everything else, who sets the listing once and doesn't know it could be refined" → "the newcomer, used to editing on Airbnb, who isn't sure why Hospitable is involved at all" · "the listing is spread across screens" → "the same facts live twice, in Details and the Knowledge Hub, and disagree".
- Words: 101 → 104.

### op-brief
- **should** · Spin 1 "**From copy to strategy.** A view and a goal for every channel, not just words." → "**From one field to a strategy per channel.** Facts live once; each channel keeps only what differs." (It answers the quote; the brief already says "strategies".)
- **could** · Spin 2 "built on data" → "each with its why".
- **should** · Notes, after "in four ways. [Press]": "First, from one field to a strategy per channel: every fact lives once, each channel keeps only what differs, and each gets its own goal and audience, not just new words. Second, from the text to the whole listing: in my sampled research, hosts vary money and stay rules per channel far more than words, so the recommendations cover pricing, availability and booking policies too…" At the end, add: "I went deep on this one question. I didn't run research with real hosts, and import comes next, on the same model."
- Words: 108 → 110, which is at the limit, so skip the "could" or trim the lead line.

### op-hypothesis
- **must** · Notes: "Those four come back as the goals in a moment." → "I come back to these four when I show how I'd measure it."
- **should** · Notes, after "changes take less time": add "which I'd time against today's product, on the same tasks".
- **could** · Notes, first line: "Hospitable's own thesis is that listing management done well is a competitive advantage. Here is how I'd prove it." (brief §3.5).

### op-idea
- **must** · Pillar "You stay in control" description "Choose how independently it runs, from tips to review to Autopilot, and what it may touch. Money always asks first." → **"Off until you switch it on. Tips wait for you, or Autopilot works inside your guardrails. Money always asks first."** (KD-08, KD-05).
- **must** · Pop-up, source card: "Arrival checklist" → **"Check-in method"**; its label "Airbnb only" → **"Only on Airbnb"** (the prototype caption).
- **should** · Pop-up note "All edited in Hospitable. Switched on per property." → **"All edited in Hospitable, for every host. Visibility comes with Smart Listings."**
- **should** · Notes: "from tips they review to an Autopilot inside their guardrails" → "from tips that wait for them to an Autopilot inside their guardrails, and only once they switch Smart Listings on for that property".
- **flag** · Headline "Listings that manage themselves." (conflict 14). If Antonio wants it closer to the build: "Listings that keep improving. Hosts who stay in charge."
- Words: 104 → 104 · pop-up 84 → 88.

### op-shift
- **must** · Strategy · Today "Same content everywhere" → **"Field-by-field tweaks, no goal"**.
- **should** · Recommendations · Today "Improving it is guesswork" → **"Only Airbnb's own suggestions"**.
- **could** · With Smart Listings: "AI in every tip, for listing, pricing and policies, with its reason" → "…for listing, pricing, availability and policies…" (KD-11; 110 words).
- **should** · Notes: "improving the listing is guesswork" → "the only suggestions are Airbnb's own, on a separate page".
- Words: 108 → 109.

### op-goals
- **must** · Message "…30 and 90 days after a host turns it on." → "…30 and 90 days after launch."
- **must** · Pop-up, Support: "Tickets lag about two months; the twelve-month target is 25% fewer, with trial to paid from 22.7% to 25.7%." → **"Tickets lag about two months; the twelve-month target is 25% fewer, against a holdout."**
- **should** · Header cell "What we measure" → **"What I'd measure"** · Notes "We don't have Hospitable's data" → "I don't have Hospitable's data".
- **should** · Pop-up, Refining and tips: "…so 20% and 30% are the early steps." → "…so 20% and 30% are early steps, read beside AI copy reverted." (KD-19: acceptance is never read alone).
- **could** · Add `<span class="hc-prov" data-prov="projected"></span><span>Targets</span>` to the source line, as on tm-measure.
- **flag** · Conflicts 1 to 3: time to adjust absent, revenue targeted, adoption chosen, and refining at 60% → 50%. If Antonio wants one bridge without breaking his five, add to the notes: "The north star I'd use in testing is time to adjust; these are the outcomes it should lead to."
- Words: 105 → 101 · pop-up 88 → 89.

### op-how
- **should** · Replace the stages JSON with this list, which matches Notion's section pages. Mapping: ✅ → Done; 🧪 → Sampled; 🔭 → Planned; KD-18's five simulated methods → Sampled.

| Stage | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Discovery | Product audit · Done | Heuristic evaluation · Done | Desk research · Done | Assumption mapping · Done | Stakeholder interviews · Planned |
| Research (IA folded in) | User interviews · Sampled | Data analysis · Sampled | Card sorting · Sampled | Personas · Sampled | Object model · Done |
| Concept | Design principles · Done | Divergent ideation · Done | Pattern references · Done | Weighted scoring · Done | Concept testing · Sampled |
| Design | Prototyping in code · Done | Design reviews · Done | Design system · Done | Mobile and tablet · Done | Accessibility review · Planned |
| Testing | Goals and KPIs · Planned | Benchmark test · Planned | Tree testing · Planned | Usability testing · Planned | A/B testing · Planned |
| Next steps | Pilot cohort · Planned | Rollout with holdout · Planned | Second-order effects · Planned | Roadmapping · Planned | Kill criteria · Planned |

```json
"stages": [
  { "name": "Discovery", "icon": "i-search", "methods": [["Product audit", "produced"], ["Heuristic evaluation", "produced"], ["Desk research", "produced"], ["Assumption mapping", "produced"], ["Stakeholder interviews", "planned"]] },
  { "name": "Research", "icon": "i-users", "methods": [["User interviews", "sampled"], ["Data analysis", "sampled"], ["Card sorting", "sampled"], ["Personas", "sampled"], ["Object model", "produced"]] },
  { "name": "Concept", "icon": "i-bulb", "methods": [["Design principles", "produced"], ["Divergent ideation", "produced"], ["Pattern references", "produced"], ["Weighted scoring", "produced"], ["Concept testing", "sampled"]] },
  { "name": "Design", "icon": "i-palette", "methods": [["Prototyping in code", "produced"], ["Design reviews", "produced"], ["Design system", "produced"], ["Mobile and tablet", "produced"], ["Accessibility review", "planned"]] },
  { "name": "Testing", "icon": "i-clipboard-check", "methods": [["Goals and KPIs", "planned"], ["Benchmark test", "planned"], ["Tree testing", "planned"], ["Usability testing", "planned"], ["A/B testing", "planned"]] },
  { "name": "Next steps", "icon": "i-rocket", "methods": [["Pilot cohort", "planned"], ["Rollout with holdout", "planned"], ["Second-order effects", "planned"], ["Roadmapping", "planned"], ["Kill criteria", "planned"]] }
]
```

Changes, each a must only where marked:
- CS tickets review → Data analysis (moved to Research).
- Competitor analysis → Desk research.
- Desk research → Product audit (in Discovery).
- **must:** Failure states → Design reviews.
- KPI tree Done → Goals and KPIs Planned (**flag**).
- Tree testing Sampled → Planned.
- Staged rollout → Rollout with holdout (could).

Notion places these elsewhere, and keeping them where they are is fine:
- Accessibility sits in the Test plan.
- Pilot and rollout sit in the Test plan.
- Object model sits in 03 · IA.

If tm-test keeps quoting the simulated tree test, it should say that test was of the earlier menu.

Dependency on other parts: today's op-how placement mirrors the deck's own parts, which Notion has the other way round. The data signals are told in Discovery (dc-signals), and the channels and competitors in Research (rs-channels, rs-market, and the Research cover's "Desk research, Competitor analysis"). If those slides stay where they are, use this variant instead, which keeps Notion's names with the deck's placement:
- Discovery: Product audit · Done | Heuristic evaluation · Done | Data analysis · Sampled | Assumption mapping · Done | Stakeholder interviews · Planned
- Research: User interviews · Sampled | Card sorting · Sampled | Desk research · Done | Personas · Sampled | Object model · Done

- **should** · Notes: "Done is what I did here: the heuristic evaluation, competitors, seven directions on a weighted matrix, the prototype in code and the design system. Sampled is a stand in: I didn't interview hosts, I sampled five interviews in Notion to see what the main issues might be, and the concept and design were built on those. Planned is what I'd run with real access, and every next step is planned." → "Done is what I did here: the product audit and heuristic evaluation, desk research on channels and competitors, seven directions on a weighted matrix, the prototype in code, reviewed round after round, and the design system. Sampled is a labelled stand-in: I had no access to hosts, so I sampled five interviews, a card sort and the support data to see what the main issues might be. The concept rests on those and on what I could see for real. Planned is what I'd run with real access: every test of the design, and every next step."

## 5. Narrative note

Notion tells the story in six steps:
1. Facts live twice.
2. Channels have their own rules.
3. Hosts vary money more than words.
4. Facts once, with each channel holding only what differs.
5. A strategy becomes tips with a why.
6. Test, measure, then import.

The intro tells a launch version that jumps from "channels and hosts differ" straight to steps 5 and 6 (strategy, tips, Autopilot, results), so steps 1, 3 and 4 are missing until Discovery. That matches the "In one line" of 00 · Brief & scope ("the intelligent listing… built in depth as Smart Listings"), but not the evidence chain the Notion links lead into.

The two real tensions are the goals frame (revenue and adoption against KD-19's time to adjust) and the process marks (Failure states, KPI tree, tree test), and both are fixable in place.

The one change that would make the intro read best: **let op-brief's first spin answer the brief's own quote with the model** ("From one field to a strategy per channel. Facts live once; each channel keeps only what differs."), backed by op-burden's "Facts kept twice". Then the intro runs problem → model → strategy → tips → measure, step for step with the hub.
