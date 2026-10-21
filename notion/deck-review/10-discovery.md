# Deck × Notion v2 · 10 · Discovery

Scope: `deck/src/slides/10-discovery.html` (dc-today, dc-two-truths, dc-no-channel, dc-signals, dc-risks, dc-plan), the cover template, `10-discovery.js` (visible labels only), `deck/src/data/covers.json`. Compared with Notion `01 · Discovery`, its 3 methods and 5 outputs, `02 · Research › Data analysis` and `User interviews` (the slides lean on them), and KD-01, 02, 04, 15, 18.

Note on `covers.json`: for Discovery it holds only `{"illo": "listings-together", "tint": "blush"}`. The cover's methods and outputs live in the `hc-cover-tpl` template on dc-today.

---

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| dc-today | Product audit | https://app.notion.com/p/3eee18af16458140b622c2f52f500edf | The slide's stats (59 screenshots, 14 live screens, 135 fields, 41 findings, help centre) are this page's "What I did" table, and its IA-map pass is the figure. Alternative: Current-state map, whose hero image is the same map. |
| dc-today · cover (`hc-cover-tpl`) | 01 · Discovery | https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8 | The cover lists the part's methods and outputs, which are the section page's two columns. The engine gives a cover no link of its own, so this only applies if one is added. Otherwise the dc-today link shows. |
| dc-two-truths | Current-state map | https://app.notion.com/p/3eee18af16458163b059f704859d3a6a | Its "Two truths" section has the same 14 / 3 / 5 / 1 / 2 / 3 verdicts, the house rules stored three times, and the wheelchair answer with its screenshot. |
| dc-two-truths · pop-up `why` | Current-state map (same) | https://app.notion.com/p/3eee18af16458163b059f704859d3a6a | The "generated on request… drift by design" paragraph and the 28-fact table are the pop-up. No narrower page exists. |
| dc-no-channel | Heuristic evaluation | https://app.notion.com/p/3eee18af1645817899d8edd811bf9212 | The slide's three points are all findings on this page: no view of one listing on one channel (sev 4), seven patterns (sev 3), and "Looking creates overrides" (sev 3, the trap in the notes). |
| dc-signals | Data analysis | https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12 | The page holds the 618 calls / 457 accounts (`REAL·BRIEF`), the ticket pull, and the slide's own question: does listing trouble rise with portfolio size? It sits in 02 · Research and is Projected (see C6). |
| dc-risks | Research questions & assumptions | https://app.notion.com/p/3eee18af1645819282b2f11c14720c03 | It has the assumptions-map image, the importance × evidence scoring, the riskiest table and the "Refuted before research" callout on Booking.com. Not KD-04: that page's title carries "set by the channel", which Antonio removed from the deck's field model. |
| dc-plan | Stakeholder interviews | https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5 | It covers "before host research", the day-one asks (e.g. Booking.com text: API limit or Hospitable's choice) and the rule that answers are never simulated. No Notion page holds the three-week plan. If the link should land on the host methods instead, use 02 · Research: https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3 |
| dc-plan · pop-up `who` | Stakeholder interviews (same) | https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5 | The same ten roles, each with what I'd ask and the decision it informs. |

**Today every Discovery slide links to the old workspace.** None of the IDs in `data-notion` (D-010, E-014, HE-02…) has a URL. So each slide falls through to `pages["01-discovery"]` in `deck/src/data/notion-links.json`, which is `3eae18af…`, the v1 workspace. To fix it, add a `"slides"` map (`{"dc-today": {"url": …, "title": "Product audit"}, …}`) and a `"details"` map (`"dc-two-truths/why"`, `"dc-plan/who"`) to that file. `hc.js` `slideUrl()` already reads `slides` first, and `openNotion()` reads `details`.

---

## 2. Conflicts

| # | slide | deck says | Notion says (page) | who's right, and why | type |
|---|---|---|---|---|---|
| C1 | dc-risks | Panel "Test these first": "**H-02** fear of losing channel content" first; the map ranks H-02 as 1. Notes: "whether fear of losing channel content holds hosts back" | H-02's idea, that "fear of losing data blocks the switch to Hospitable", is one of three import assumptions moved to the Roadmap. The Smart Listings riskiest are trust in AI suggestions (5·1), per-channel copy wanted by some (5·2), Autopilot never changes facts (4·1), Knowledge Hub as "everything true" (4·1) and conversion lift (4·1) (Research questions & assumptions). The section page names "trust in AI tips, who wants per-channel copy, what Autopilot may touch". | **Notion.** In `hypotheses.csv`, H-02 is about Hospitable becoming the source of truth, with a "version 0" restore: that is import. Rule 1. | **fix** |
| C2 | dc-plan | Week 1: "CRM analysis · Funnel analysis · … · Survey". Week 2: "Contextual inquiry, 3" | Data analysis pulls tickets, Gong, "Edit per channel" usage, Knowledge Hub usage and the feedback board. SPEC §4.1 leaves out "import funnel, micro-survey at import". | **Notion.** In `discovery-plan.md`, Funnel = M4 onboarding funnel, Survey = M10 micro-survey at import, Contextual inquiry = M7 "connects a second channel", CRM = M3 churn and setup reasons (H-07, the case for import). Rule 1. | **fix** |
| C3 | dc-signals | "71% of 'content overwritten' tickets escalate, after 58 hours" | Not in Notion. The source (`research/data/ANALYSIS.md`) says "a median 58 h to resolve, with 71% escalated", from n = 7 simulated tickets. | **Source.** 58 h is the time to resolve, not the time before escalation. | **fix** |
| C4 | dc-today | "46 help-centre articles read" | "42 articles, 4 changelog posts" (Product audit) | **Notion.** `help-center.md` rows 43–46 are posts from the Community changelog. | **fix** |
| C5 | dc-plan | "User interviews, 5 to 8" | "5–8 in all" (User interviews) | Notion and the slide agree, but Antonio's deck rule is "about 25 with real access". The Research cover already plans "25 real host interviews", and rs-method says "about 25", so the deck contradicts itself. The deck rule wins in the deck. Also, 25 sessions don't fit in one week: the Hosts block likely needs two. | **flag** (rule 4) |
| C6 | dc-signals + cover | Sampled sales and support signals shown as a Discovery finding. Headline: "Listing trouble grows with portfolio size, and loses deals"; message: "large accounts walk away over it". Cover: "Data analysis" method, "Sales and support signals" marked Sampled | Data analysis is 🔭 Projected, in 02 · Research, and its question is "Does listing trouble rise with portfolio size…?". Its only illustrative output is the "Edit per channel" chart on Insights. The Gong breakdowns, closed-lost 58% vs 36% and the ticket figures appear nowhere in Notion. | Status words: rule 4, the deck's "Sampled" wins. Placement is a narrative choice; "data first" is the deck's plan. But the headline and message state a simulated shape as fact, which is rule 5 and KD-18. Soften the wording (edits below). The analysis behind the chart was written for the import business case (`ANALYSIS.md` §1: "points Angle A's business case at the large end"), and the slide carries `data-angle="A"` metadata. Keep the slide's frame on Smart Listings: writes without a receipt. | **flag** + should |
| C7 | dc-today | "41 heuristic findings, 5 at the highest severity" | "41 findings, of which 11 sit on the flow Smart Listings redesigns", 4 of them at severity 4 (Product audit, Heuristic evaluation) | **Notion's framing.** One of the five severity-4 findings, HE-03 "at connect…", is about connecting and import. The number is true but counts import. | should |
| C8 | dc-no-channel | "a host hovers about fifteen info icons across six sections" | "checks about 15 fields across five tabs" (Heuristic evaluation); "checks about 15 places" (Current-state map) | **Neither count is sourced.** `ia-current.md` says "~15 leaves" and gives no number of sections. Not every one of the 15 is an info icon: Instant book is a grid, and Cancellation is a section. Drop the section count. Notion's "five tabs" has the same problem; tell its owner. | should |
| C9 | cover | Methods include "Desk research", but its outputs aren't on this cover. The deck tells Channel constraints and Competitive analysis in Research (rs-channels, rs-market), whose cover lists "Desk research" again | Desk research ✅ and both its outputs ✅ are Discovery. Hub step 2, "Each channel plays by its own rules", links to Channel constraints, a Discovery page. | **Narrative choice.** The deck lists Desk research on two covers. Intro `op-how` gives a third version of Discovery's methods: "CS tickets review", "Competitor analysis". | **flag** |
| C10 | dc-today (map key) | Six pattern letters: a, c, d, e, f, g | Seven patterns. b = "the label alone, no way to differ" (check-in method, Wi-Fi, address, times) (Current-state map). dc-no-channel itself says "7". | **Notion.** The map leaves out one pattern that the next slide counts. | could |
| C11 | dc-risks (field model) | The slides never state the field model; the notes say "a host's voice is the quality of their facts" | The section page, Channel constraints and KD-04 say "set by the channel… 'Booking.com decides', read-only" | **Deck (rule 4).** No slide clashes, but don't link a Discovery slide to KD-04 or Channel constraints, which state the model Antonio removed. | **flag** (awareness) |
| C12 | dc-two-truths | "Two truths about every property, and they disagree" | "On the trial property, 14 of 28 filled facts match"; the stores "drift by design" (Current-state map) | **Notion's scope.** Two stores on every property, drifting by design, is sourced from the help centre. Disagreement was measured on one listing. | could |
| C13 | cover, dc-risks (JS), dc-plan | "what must **we** learn"; "Evidence **we** already have →"; "an API limit, or **our** choice?"; "How do **we** detect drift" | First person "I"; name Hospitable where "we" means the company (SPEC §4.5) | **Notion + rule 2.** | could |
| C14 | dc-risks | Panels lead with IDs: "**H-05**, write-back to Booking.com, was my number two"; "**H-02** … **H-09** … **H-04**" | Codes only as labels in a scanned table, "never as the explanation" (SPEC §4.3) | **Notion.** Keep the IDs on the map chips and drop them from the prose. | should |

Outside my part, for the coordinator: rs-jobs notes say "321 votes", but the feedback board had **322** on 3 Oct (`research/market/feedback-board-2026-10-03.md`, Notion Desk research).

---

## 3. Missing story (top five, by value)

1. **Where AI is today: the only listing advice is Airbnb's.** Hospitable's AI answers guests from the Knowledge Hub. "Review opportunities" on Overview opens Airbnb's own list, and for this listing it was empty. Nothing helps the listing on Booking.com or Direct (Current-state map › Where AI exists today; Heuristic evaluation, last row). This is Notion Discovery's fourth bullet and the last clause of hub step 1. It sets up "tips on every channel", and the deck's Discovery never says it. **Fold into dc-today:** one tag on the map and two sentences in the notes.
2. **Real product evidence for "Hospitable writes without showing".** "Ownership flips silently on the first edit": editing the base price "will overwrite the price on Airbnb", and the product says so once, in a paragraph. "Save says nothing about the channels": no sent-to, no last-synced time, no undo (Heuristic evaluation, sev 4 and 3, `REAL·PRODUCT`). Today dc-signals backs this claim only with simulated tickets. **Fold into dc-signals:** message and notes.
3. **Public demand, which is real data.** "Ability to update all listing content from Hospitable" has 322 votes and is In Progress. 25 posts ask for per-channel differences on purpose. Almost nobody asks for AI listing copy in public, so demand for it is an assumption (Desk research › What it found, `REAL·PUBLIC`). **Fold into dc-signals** as the one real stat beside the brief's 618 calls (could). Put the AI-copy line in the dc-risks notes.
4. **Each finding's "so".** Notion's section page pairs every finding with its decision: two truths → every fact lives once, in Shared (KD-02); no channel view → a page group per channel (KD-03); unseen writes → a receipt for every saved change (KD-15). The deck's Discovery slides stop at the problem, apart from dc-risks. **Fold into the notes** of dc-two-truths, dc-no-channel and dc-signals.
5. **What I left out.** Three of the first plan's riskiest five were about import, and they move to the roadmap (Research questions & assumptions › Left out; KD-01). The heuristic review also set aside its import and onboarding findings. This is honest about scope and shows import only as a next step. **Fold into the dc-risks notes** (could). It also explains why the C1 fix removes H-02.

---

## 4. Proposed edits

### dc-today
- **must** · stat label: "help-centre articles read" → "help-centre articles and changelog posts read"
- **should** · stat label: "heuristic findings, 5 at the highest severity" → "heuristic findings, 11 on the flow I redesign"
- **should** · map JSON, Overview row: `"t": [["Connected channels › a row per listing", "L"], ["Nickname"]]` → `"t": [["Connected channels › a row per listing", "L"], ["Nickname"], ["Review opportunities › Airbnb's own"]]`
- **should** · notes: "135 fields, 41 heuristic findings and 46 help-centre articles." → "135 fields, 41 heuristic findings, 11 of them on the flow I redesign, and 46 help-centre pages." Add at the end: "And the only listing advice in the product today is Airbnb's own Opportunities, one link on Overview. For this listing it was empty. Hospitable's AI answers guests; nothing helps the listing on Booking.com or Direct."
- **could** · map key: add `["b", "Label only, can't differ"]` and mark one tab with it (Arrival holds check-in method, Wi-Fi and times). Or say "six of the seven patterns" in the notes.

### dc-today · cover
- **flag** (C9) · Choose one:
  - **(A, Notion's order):** move rs-channels and rs-market to follow dc-no-channel. Add outputs "Channel constraints · Competitive analysis" to this cover, and drop them, with "Desk research", from Research's cover.
  - **(B, keep slides where they are):** drop "Desk research" from this cover's methods.
- **could** · "IA map of today" → "Current-state map" (the Notion title the link opens).
- **could** · "and what must we learn before designing anything?" → "and what must I learn before designing anything?"

### dc-two-truths
- **should** · notes, end: "…the product is built to drift, and the detail shows why." → "…the product is built to drift, and the detail shows why. So in Smart Listings every fact lives once, in Shared, where the channels and the guest AI read the same one."
- **could** · headline: "Two truths about every property, and they disagree" → "Two truths about every property, and they drift apart"
- Pop-up: no change; it matches the Current-state map exactly.

### dc-no-channel
- **should** · message: "…a host hovers about fifteen info icons across six sections." → "…a host checks about fifteen fields, one info icon at a time."
- **should** · stat label: "info icons to read one channel's listing" → "fields to check to read one channel's listing"
- **should** · notes, end: "That's why a real channel view became a requirement." → "That's why each channel gets its own pages in Smart Listings, where every field says whether it uses the Base, is custom for that channel, or exists only there."

### dc-signals
- **must** · stat label: "of "content overwritten" tickets escalate, after 58 hours" → "of "content overwritten" tickets escalate; median 58 hours to close"
- **should** · headline: "Listing trouble grows with portfolio size, and loses deals" → "Listing trouble likely grows with portfolio size, and costs deals"
- **should** · message: "The costliest moments are when Hospitable writes to a channel without showing it, and large accounts walk away over it." → "In my sample, the costliest moments are when Hospitable writes to a channel without showing it. The product agrees: Save never says what reached each channel." (Slide ≈ 91 words with the other edits here.)
- **should** · footer, simulated item: "Breakdowns, tickets and CRM records" → "Call breakdowns and support tickets" (the CRM churn claim leaves with the message edit).
- **should** · notes, after "…without showing the host.": "The product confirms that part for real: editing the base price "will overwrite the price on Airbnb", said once in a paragraph, and Save never says what reached each channel. So in Smart Listings every saved change goes out with a receipt."
- **could** · replace the 71% stat with real demand: value "322", label "votes for "Ability to update all listing content from Hospitable", In Progress". Add the public provenance "Hospitable's feedback board" to the footer.

### dc-risks
- **must** · panel "Test these first": "**H-02** fear of losing channel content · **H-09** trust in AI copy · **H-04** who wants a voice per channel" → "Trust in AI tips · who wants a voice per channel · what Autopilot may touch"
- **must** · map JSON: delete `{"id": "H-02", "cat": "USE", "imp": 5, "ev": 1, "rank": 1}`. Set H-09 `"rank": 1` and H-04 `"rank": 2`, and change H-15 to `{"id": "H-15", "cat": "ETH", "imp": 4, "ev": 1, "rank": 3}`.
- **must** · notes: "These are the fourteen that decide Smart Listings" → "These are the thirteen that decide Smart Listings". "[Press] What I test first: whether fear of losing channel content holds hosts back, whether why, where and undo earn trust in AI copy, and who actually wants a different voice on each channel." → "[Press] What I test first: whether a why, a source and an undo earn trust in AI tips, who actually wants a different voice on each channel, and what hosts will let Autopilot touch."
- **should** · panel "Refuted, then turned into a rule": "**H-05**, write-back to Booking.com, was my number two." → "Writing back to Booking.com was my number two bet."
- **could** · notes, before "The plan reacted to evidence.": "Almost nobody asks for AI listing copy in public, so demand for it is a bet too. And three of my first riskiest five were about import; they wait for the next release."
- **could** · `10-discovery.js`: "Evidence we already have →" → "Evidence I already have →". Notes: "how much we already know" → "how much I already knew".

### dc-plan
- **must** · message: "Twelve methods over three weeks." → "Ten methods over three weeks."
- **must** · Week 1 list: "Call analysis · Ticket analysis · CRM analysis · Funnel analysis · Stakeholder interviews · Survey" → "Call analysis · Ticket analysis · "Edit per channel" usage · Knowledge Hub usage · Stakeholder interviews"
- **must** · Week 2: delete "Contextual inquiry, 3".
- **flag → should** (C5) · Week 2: "User interviews, 5 to 8" → "User interviews, about 25". If kept at one week, consider relabelling the block "Weeks 2–3".
- **must** · notes: "call analysis on Gong, ticket, CRM and funnel analysis, and a short survey, alongside ten stakeholder interviews" → "call and ticket analysis, and how hosts use Edit per channel and the Knowledge Hub today, alongside ten stakeholder interviews". "five to eight user interviews, three contextual inquiries and card sorting with fifteen hosts" → "about twenty-five user interviews and card sorting with fifteen hosts".
- **could** · chips: "Booking.com text: an API limit, or our choice?" → "Booking.com text: an API limit, or Hospitable's choice?"; "How do we detect drift on a channel?" → "How can Hospitable detect drift on a channel?"
- Pop-up `who`: no change. Its ten roles match Notion's Stakeholder interviews one for one, and "None of their answers is simulated" matches KD-18.

The count after the edits is 5 + 2 + 3 = 10, with the readout counted as before. The slide stays under 110 words (about 109).

---

## 5. Narrative note

The deck's Discovery tells hub step 1 in Notion's order: the listing isn't a place (dc-today), two truths (dc-two-truths), no channel view (dc-no-channel). It drops the last clause of step 1, that the only listing AI is Airbnb's Opportunities. It tells step 2, that channels differ in who writes the listing, in Research instead.

It adds two things Notion keeps elsewhere or doesn't have: sampled sales and support signals (Projected Data analysis in Research in Notion), and a three-week plan that, as written, still carries import methods and an import assumption at rank 1.

Notion's "In one line" ends with a "so": one shared record, a page group per channel, tips that respect each channel. The deck's Discovery ends on process and leaves most of its "so"s unsaid.

**The one change:** close dc-two-truths, dc-no-channel and dc-signals on the decision each finding produced (facts once in Shared; a page group per channel; a receipt for every saved change). Discovery then reads as the same thread as Notion's section page, not as a list of problems. If Antonio is open to moving slides, placing "What the channels allow" right after dc-no-channel would complete step 2 inside Discovery.
