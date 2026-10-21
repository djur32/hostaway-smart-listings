# 50 · Design · deck × Notion v2 review

Scope: `deck/src/slides/50-design.html` (13 slides, their pop-ups and notes), the Design cover template (inside `ds-solution`) and `deck/src/data/covers.json`. Checked against Notion `05 · Design`, its ten output pages, KD-02…KD-17 and, where the two disagree, `prototype/src`.

**Plumbing note.** Every Design slide has `data-notion-page="05-design"`, and `deck/src/data/notion-links.json` maps that key to the **old** workspace (`3eae18af…d3a8f2f53e29cef166`). Today every "In Notion" link in this part opens the old 05 Design page. The URLs below are all from `plan/notion-v2/map.json`.

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| Design cover (template in `ds-solution`) | 05 · Design | https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924 | It is the part opener. The section's "In one line", Methods and Outputs mirror the cover. |
| ds-solution | Solution overview | https://app.notion.com/p/3eee18af164581828521eb27e3e50737 | Same hero (the Airbnb tip "Name a landmark…"), the solution in one paragraph, and the model diagram. |
| ↳ proposed pop-up "What I removed" | 05 · Design | https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924 | "What came out of it" lists what was built and then removed in design review. |
| ds-shared | KD-02 · Every fact lives once, in Shared | https://app.notion.com/p/3eee18af1645813ab697f55d6d253754 | This is the slide's decision. "14 of 28" is its first *why*, and "N channels" is its last line. |
| ds-hub | Knowledge Hub | https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d | Topics, Questions and Facts, describe-then-confirm, and how the Hub feeds tips. KD-13 is the fallback. |
| ds-channels | Listing base & channels | https://app.notion.com/p/3eee18af164581178debffa0628f4703 | Field states and channel-only fields. I'd avoid KD-04 here, because its title names "set by the channel", which the deck removed. |
| ds-strategy | KD-06 · One strategy per channel, full-screen wizard | https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48 | The wizard copied from Add-property, with one question per screen. |
| ↳ pop-up "The result: three strategies" | Strategy & performance | https://app.notion.com/p/3eee18af1645816c86aee6acef674975 | Its lead image is the Strategy page: one row per channel. |
| ds-tips | Tips & AI rewrite | https://app.notion.com/p/3eee18af1645811a82c4e772997ac875 | Covers the tip card's anatomy, the Why sources and "4 of 11". |
| ↳ pop-up "Alternatives and shared fields" | KD-11 · Tips are channel-specific… | https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef | "On a listing-wide field, the tip says it applies to every channel." |
| ds-canvas | Canvas preview | https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5 | The outline colours and what tapping opens. KD-14 is the fallback. |
| ds-push | KD-15 · Save is the commit; each saved change goes out with a receipt | https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a | Receipts go Sent → Live, or In review for a Booking.com name. |
| ↳ pop-up "Why receipts" | Design principles | https://app.notion.com/p/3eee18af164581cfb862c44df572735c | The pop-up cites "Principles 1 and 7", which is that page's table. |
| ds-performance | Strategy & performance | https://app.notion.com/p/3eee18af1645816c86aee6acef674975 | Its Performance section covers the baseline, the KPI cards and "Not shared". |
| ↳ pop-up "When a strategy isn't working" | KD-07 · No versions… | https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844 | The pop-up's first two bullets are KD-07. |
| ds-autopilot (and pop-up) | KD-08 · Autopilot is on or off… | https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033 | This is the slide's decision, almost word for word. |
| ds-mobile | Mobile & tablet | https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e | Bottom sheets, 44/16 px, app mode. KD-17 is the fallback. |
| ds-personas | Personas (02 · Research) | https://app.notion.com/p/3eee18af16458171989df7edc178e5df | Its "In the prototype" section describes this exact screen (Settings › How Hospitable helps you). No Design page covers presets. |
| ds-system | Design system | https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632 | The 244 root variables, the colour roles and the patterns that were added. |
| ↳ proposed pop-up "Where I departed" | UI changes | https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3 | Ten departures, with before and after. |

## 2. Conflicts

| # | slide | deck says | Notion says (page) | who's right, why | type |
|---|---|---|---|---|---|
| 1 | ds-channels | Third case: "Check-in method · Only on Booking.com", drawn as a **locked** box | "Fields only one channel has, like **Airbnb's** check-in method, appear only there" (KD-04, Listing base & channels). Third state = "set by the channel" | The field model is a rule-4 item, so the deck's three cases win. The *example* is still untrue: `prototype/src/data/sl3.ts` has `method: state { airbnb: 'only' }`, and the caption is "Airbnb only" with a pencil icon (editable, `ds/sl3.tsx`). No Booking.com-only field exists. | **Flag** (rule 4, but the example contradicts the build) |
| 2 | ds-channels | Footer "Override rates, **15 hosts**" | "36% **of multi-channel properties**" (Insights). 15 hosts is the card sort. | Notion is right, and so are the deck's own 20-research and 30-ia slides. | **Fix** |
| 3 | ds-channels | "**≤4%** any text field" | "no text field passes **4.1%**" (Insights, KD-11) | Notion is right, and 20-research and 30-ia already say 4.1%. | **Fix** |
| 4 | ds-canvas | "**Raspberry**: editable here" | "purple where a tip waits, **orange** where you can edit here" (Canvas preview) | Notion is right. `CanvasView.tsx`: "purple = a tip waits, orange = editable here (Rewrite with AI)". | **Fix** |
| 5 | ds-canvas | "Money is never decided in the preview"; notes say "nothing that changes money is decided here" | "The booking card's nightly price and cleaning fee open Pricing's rows" (Canvas preview). "The preview finds the field and the field decides" (KD-14). | Notion is right. `PricePanel.tsx` edits the nightly price and cleaning fee from the Canvas side panel, using the same Save. The principle holds; the wording doesn't. | **Fix** |
| 6 | ds-canvas | Footer "Concept test with eight hosts" (simulated). Notes: "the test told me…", "copywriters want the page beside the text", "new hosts stop reading" | Concept testing is 🔭 **Projected**: "A simulated rehearsal… Its results are not evidence and aren't reported here" (Concept testing). KD-14 still cites it. | This is a narrative choice. It matches the deck's 40-concept and 60-test slides, but not Notion's method page, and rule 4 lists only "five sampled interviews and a card sort". | **Flag** |
| 7 | ds-system | "**47** new patterns, added first" | "**Ten** patterns were added for Smart Listings" (Design system) | Notion is right. I found no source for 47 anywhere in `ds/`, `deck/` or `plan/` (rule 5). | **Fix** |
| 8 | ds-system | Swatch "Amber: channels disagree". Live **conflict card** ("Cleaning fee differs… Use €25 for all / Keep per channel") and a **fact row with channel projection** ("Booking.com: Listed · Airbnb: Not listed"). Notes: "New patterns like the fact row…" | Colours are "raspberry to act, purple… tips, **orange for Rewrite with AI**, green… done". "The gallery also keeps patterns from earlier rounds, such as the channel lens and **conflict card, that the converged build no longer uses**" (Design system). | Notion is right. `DecisionCard` and `FactRow` are only used in `screens/home/KindSection.tsx` (an earlier round) and `screens/property/needsyou.tsx`, whose route is commented "first-time setup (reconcile)". The slide shows import patterns, which risks rule 1. | **Fix** |
| 9 | ds-personas | "P4 **New to hosting**" | "Priya · **new to a PMS**". She has two units on Airbnb (Personas). | Notion is right, and so are the deck's own 20-research notes ("Priya is new to a PMS"). | **Fix** |
| 10 | ds-personas (notes) | "A family host **starts with tips to review**" | Marta: "Smart Listings… **off by default**" (Personas) | Notion is right. `data/personas.ts` P1 has `smartListingsDefault: false`, so there are no tips. | **Fix** |
| 11 | ds-personas | "P2 Optimiser" | "Dana · **SEO** optimiser" | Notion is right, and the label matches the prototype's persona. | Fix (minor) |
| 12 | ds-personas | `guidance-p2` shot shows "Channels connected: Airbnb, Booking.com, **Vrbo**, Direct" | "there is no Vrbo" (Personas). Vrbo is "researched, not built" (Brief & scope). | Notion is right about the build. The Settings screen is a leftover from an earlier session. | **Flag** (re-crop or recapture) |
| 13 | ds-push (pop-up) | Avatar "**P2** · Rob, churned host" | Rob is "the churned host (a **lens**), not a fifth persona". P2 is Dana (Personas). | Notion is right. The quote itself is accurate (INT-5 [10:20]). | **Fix** |
| 14 | ds-push | Key stat "11 of 60 support tickets are sync failures" (simulated) | KD-15's why: "Sync failures are a top theme in **618 sales calls** (`REAL·BRIEF`)" | Neither is wrong. Notion leads with the real brief data, and the deck leads with a sampled number. | Flag (cohesion) |
| 15 | ds-hub (notes) | "it **once told a guest** the flat is wheelchair accessible" | "**Ask the AI** answers a guest: 'Yes, the apartment is wheelchair accessible'" (Current-state map, KD-02, KD-12) | Notion is right. It is the product's test answer, not a recorded incident, so the deck's wording invents an event. | **Fix** |
| 16 | ds-hub | "the gaps in plain view"; notes say "the unanswered ones in plain view" | "Gaps should sit quieter than the content". "A dense Overview that leads with gaps: dropped" (KD-13) | Notion and the build are right. Questions carry an answered or not-answered status; there is no gaps-first view. | Flag (cohesion) |
| 17 | ds-hub | No mention that the Hub is a concept | "**Done, as a concept**… every Knowledge Hub page… carries a 'Concept' chip… the AI behind it is simulated" (Knowledge Hub) | Notion is right. This is an honesty gap. | Flag (cohesion) |
| 18 | ds-mobile | "Voice: **designed, not built yet**" | "voice and the structuring step are **simulated with canned rules**" (Knowledge Hub). The wizard's Notes step also has "Use voice". | Notion and the build are right: `ds/wizard.tsx` and `hub/variants/R/AddFact.tsx` include a stand-in "Use voice" button. The deck's own ds-hub says "describing it or saying it". | **Fix** |
| 19 | ds-solution, ds-push, ds-tips | "every change reviewed" · "Nothing reaches a channel unseen" · "Accept stays the host's call" | KD-08: with Autopilot on, "text and photo-order tips apply by themselves". Principle 1: "Autopilot is the host's explicit exception". | Notion is right. The deck's own ds-autopilot says the same thing, so the absolutes contradict it. | Flag (cohesion) |
| 20 | ds-solution | "Open the website" goes to `…?smart=on&tips=1` | Solution overview links `…?smart=on&autopilot=0&tip=t-a-name`. KD-08: "in the demo, Airbnb runs on Autopilot: its Listing is read-only". | Notion is right. Live, the slide's link opens a read-only form ("Autopilot is on · Turn off to edit") under a tip that waits for Accept. | Fix |
| 21 | ds-canvas, ds-push | Eyebrow "Smart Listings" | KD-05: off, "Shared and Channels look exactly the same… Trust and status are never a premium feature". Canvas and receipts work with Smart Listings off (the `ListingEditor` view switch is unconditional). | Notion and the build are right. These two slides sell structural features as part of the AI layer. | Flag (cohesion) |
| 22 | ds-performance (notes) | "**every number** sits beside similar homes" | "Each card has one quiet line of context, **such as** the similar-homes figure" (Strategy & performance) | Notion is right. On the slide itself, RevPAR and Revenue have no similar-homes line. | **Fix** |
| 23 | ds-autopilot (notes) | Text and photo tips apply "inside **the price range** the host set" | "inside the guardrails" (KD-08) | Notion is right. The price range doesn't bound text tips. | Fix (minor) |
| 24 | ds-channels | "its source and **exactly one** action" | The prototype's `only` and `set` states have no action (`scopeOf`), and the slide's own third row has none. | The prototype is right. | Fix (minor) |
| 25 | Cover | Status mark "**Produced**" (kit label, `kit/hc.js`) | Rule 4 sets the deck's words as Done / Sampled / Planned. | It's a kit-wide label, not specific to Design. | Flag |
| 26 | Cover (`covers.json`) | `design.illo: "ai-writing-per-channel"` ("AI writes a version per channel", per the illustrations README) | Story step 3: "a channel's own voice is a choice, not a default". KD-11: tips cover money and stay rules first. | Notion is right on emphasis. The `ia` cover's "one-fact-many-channels" is unused now that IA folds into Research. | Flag (narrative) |

Outside my part, for the owners: `30-ia.html` (`ia-one__lead`) says "Every change is a **Version**", which contradicts KD-07 (no versions).

## 3. Missing story (top five, by value)

1. **Built, then removed: the design-review thread.** This is the strongest "how I did it" proof, and the deck doesn't tell it. 05 · Design: "versions, a compare mode, a Setup page and inline editing on the Canvas were built and then removed". Also: tip cards inline under fields were dropped (KD-09), the three-level autonomy dial became one switch (KD-08), and the Hub was not folded into "The home" (KD-02). → Put it in a new pop-up on **ds-solution**, plus one clause each in the notes for ds-performance, ds-autopilot and ds-canvas.
2. **KD-10: one AI affordance per field, and Rewrite with AI.** This KD has no slide; the only trace is the word "rewrite" in ds-canvas. It also fixes the colour story (orange for what the host asks for, purple for what the AI suggests). → Add a third panel to the **ds-tips** pop-up (shot: `plan/notion-v2/shots/d5-rewrite.png`), and an orange swatch on **ds-system**.
3. **KD-05: opt-in per property, and nothing lost when it's off.** The deck never says Smart Listings is a toggle, or that structure, Canvas and receipts serve every host. → Put it in the **ds-strategy** message and notes, and change the eyebrows on ds-canvas and ds-push.
4. **Honesty: what the prototype simulates.** Notion says it plainly. The Hub is a Concept; voice and fact structuring are canned rules; Autopilot's applying isn't simulated; tips are scripted (a new fact doesn't create a tip); policy tips are illustrative; and nothing has been tested with hosts. → One line each in the **ds-hub**, **ds-autopilot** and **ds-solution** notes.
5. **KD-16 and UI changes: replicate, and depart only where the model needs it.** About twenty departures were logged, each with its screenshot, and the ten that matter have before and after. → Add a new pop-up on **ds-system** with four before → after rows.

Also worth a clause, at lower value. **KD-06 sharing:** one strategy can cover several channels. **Hub ↔ Base:** "Facts about the listing read the same values as the Listing base, so the two can't disagree" (Knowledge Hub). That is the direct answer to ds-shared's "14 of 28".

## 4. Proposed edits

**Cover template (in ds-solution)**
- *could* · Methods: "High-fidelity prototyping · Interaction design · Content design · Design systems · Responsive design" → "Prototyping in code · Design reviews · Interaction design · Content design · Design systems · Responsive design"
- *could* · `covers.json` `design.illo`: "ai-writing-per-channel" → "one-fact-many-channels". The `ia` cover is unused, and the drawing tells the model rather than per-channel copy. This is Antonio's call.

**ds-solution**
- *should* · Message: "I made one system: each fact once, a page per channel, every change reviewed." → "I made one system: each fact once, a page per channel, and nothing changes without the host's say."
- *should* · Link: `…/listing/essentials?smart=on&amp;tips=1` → `…/listing/essentials?smart=on&amp;autopilot=0&amp;tip=t-a-name`
- *should* · Notes, append: "The tips, their reasons and every number are demo data, and none of this has been tested with hosts yet; that comes next."
- *should* · New pop-up "What I removed" (link: 05 · Design), 58 words: "I designed in code and reviewed the running build; each review changed it. I built, then removed: strategy versions and a compare mode, a concept to learn before any payoff; a Setup page that looked like Strategy; editing inline on the Canvas, a second editor for one field; tip cards under every field; and a three-level autonomy dial, now one switch." Footer more-link: "What I removed".

**ds-shared**
- *should* · Notes, replace the last sentence ("Where I challenge today's product: …") with: "And the Knowledge Hub's facts about the listing read these same values, so the two stores can't drift apart again. Where I challenge today's product: channel-only fields sit among shared ones, and Edit per channel turns every tab into a per-channel editor."

**ds-hub**
- *should* · Message: "…the questions guests really ask, the gaps in plain view, feeding AI replies and listing tips." → "…the questions guests really ask and whether each is answered, feeding AI replies and listing tips."
- *must* · Notes: "and it once told a guest the flat is wheelchair accessible when nothing backs that." → "and its Ask the AI tells a guest the flat is wheelchair accessible, with nothing in the listing to back it."
- *should* · Notes: "with the unanswered ones in plain view." → "each marked answered or not, so a gap becomes a question for the host." Append: "It is three pages, Content, Workflows and Sources, and it's labelled Concept: the structure is built, the AI behind it is simulated."

**ds-channels**
- *must* · Stat: "≤4%" → "≤4.1%"
- *must* · Footer: "Override rates, 15 hosts" → "Per-channel overrides, sampled data"
- *should* · Message: "…its source and exactly one action." → "…its source and at most one action."
- *flag → recommended* · Make the third case true to the build, and keep the deck's three-case model. Option A switches the live card to **Airbnb · Listing**: Property name "Uses the Base · Customize for Airbnb"; Neighbourhood description "Custom for Airbnb · Use the Base" (value "Quiet street in north Neukölln, Tempelhofer Feld 5 minutes on foot."); Check-in method, editable "Keypad", caption "Airbnb only". The back shot changes to `p-airbnb`. In the notes: "The name here uses the Base, so the action is Customize for Airbnb. The neighbourhood is Airbnb's own, so the action is Use the Base." and "…like the check-in method, which only Airbnb asks for." Option B keeps Booking.com and drops the lock: render the row editable with caption "Booking.com only". That only works if Antonio accepts an example the prototype doesn't have.

**ds-strategy**
- *should* · Message: "I reused Hospitable’s own wizard; every suggested answer carries its reason." → "Smart Listings is opt-in per property. I reused Hospitable’s own wizard; every suggested answer carries its reason."
- *should* · Notes: "One strategy per channel, so Airbnb and Booking.com can chase different guests." → "One strategy per channel, or one shared by several, so Airbnb and Booking.com can chase different guests. And it's off until the host turns it on; turning it off keeps everything."

**ds-tips**
- *should* · Add a 4th point: "Not only words: prices and stay rules too" (KD-11). The slide stays well under 110 words.
- *could* · Notes: "Accept is the ordinary red button" → "Accept is Hospitable's ordinary raspberry button"
- *should* · New third pop-up panel, "Rewrite with AI" (link: KD-10 https://app.notion.com/p/3eee18af164581e7844fc2de20912029), 40 words. Lead: "No tip on a field? Rewrite with AI opens in the same panel. Each field shows one AI affordance at most: its tip, or Rewrite where the host can type right now." Chips: "Shorten" · "Warmer" · "More detail" · "Orange: you ask · Purple: it suggests". Figure: `d5-rewrite.png` (add it to `proto-shots.json` first).

**ds-canvas**
- *must* · "<b>Raspberry</b>: editable here" → "<b>Orange</b>: editable here"
- *should* · "<b>Lavender</b>: a tip waits here" → "<b>Purple</b>: a tip waits here"
- *must* · "Money is never decided in the preview" → "Prices open Pricing’s own fields, never the page"
- *must* · Notes: "so nothing that changes money is decided here. Canvas is a way to find a field…" → "so nothing is edited on the page itself: tap the price and Pricing's own fields open beside it. Canvas is a way to find a field…" Also add: "I built inline editing on the page, then removed it."
- *should* · Eyebrow "Smart Listings" → "Channels"
- *flag* · If Antonio follows Notion on the concept test: footer "Concept test with eight hosts" → "Design review"; notes "and the test told me where it shines and where it is dangerous" → "and design review showed me where it shines and where it could mislead; a planted price change is the first thing I'd test with hosts". "copywriters want the page beside the text" → "hosts who write their own copy want the page beside the text".

**ds-push**
- *should* · Headline: "Nothing reaches a channel unseen; every change gets a receipt" → "Nothing reaches a channel without your say; every change gets a receipt"
- *should* · Eyebrow "Smart Listings" → "Every change"
- *should* · Stat, using the real brief data: value "618", label "sales calls where listing issues, sync failures among them, are a top theme". Footer: `brief` chip "Hospitable’s sales calls" + `simulated` chip "Receipts, demo data". Notes: "Sync failures are the largest ticket category, eleven of sixty." → "Hospitable's own sales calls, all 618, put sync failures among the top listing issues."
- *must* · Pop-up: `<span class="hc-avatar" data-persona="P2">P2</span>` → no persona tag; who: "<b>Rob</b>, churned host, a lens rather than a persona"

**ds-performance**
- *must* · Notes: "and every number sits beside similar homes" → "and each card carries one line of context, like similar homes"
- *could* · Notes, append: "Versions and a compare mode were built and removed; one baseline answers the question." Also: the live demo's dates move with today's date (`performance.ts` dates from `TODAY`), so "14 Aug" on the slide won't match a live click.

**ds-autopilot**
- *should* · Notes: "inside the price range the host set" → "inside the host's guardrails"
- *should* · Notes, append: "It replaced a three-level dial I had designed first. In the prototype, Autopilot's own applying isn't simulated; the tips still wait in the panel."
- *could* · Move this slide to right after ds-strategy. Autopilot is the strategy's fourth answer (KD-06, KD-08), and the run then reads strategy → tips → Canvas → receipts → Performance.

**ds-mobile**
- *must* · "Voice: designed, not built yet" → "Voice input: a stand-in, no speech model yet"
- *must* · Notes: "Voice is the one piece I haven't built yet, and I say so." → "Voice input is a stand-in: it shows the flow, with no speech model behind it, and I say so."

**ds-personas**
- *must* · "P4 New to hosting" → "P4 New to a PMS"
- *should* · "P2 Optimiser" → "P2 SEO optimiser"
- *must* · Notes: "A family host starts with tips to review and plain words; an optimiser starts with per-channel voice and Performance open." → "A family host starts with Smart Listings off and one text for every channel; an optimiser starts with it on, per-channel voice and Performance open."
- *should* · Re-crop `guidance-p2` to the preset dropdown and the "Why presets" box, so "Vrbo" isn't on screen.

**ds-system**
- *must* · Stat: "47" "new patterns, added first" → "10" "new patterns, added first"
- *must* · Swatches: "<b>Amber</b>: channels disagree" → "<b>Orange</b>: you ask the AI". *should*: "<b>Lavender</b>: the AI proposes" → "<b>Purple</b>: the AI proposes"
- *must* · Live demo: replace the conflict card and the fact-row card with patterns the build uses. Option 1 is a stacked field row with its scope caption ("Uses the Base · Customize for Airbnb", reusing the `h-field-row` markup already on ds-channels). Option 2 is a Rewrite with AI card in orange.
- *must* · Notes: "…amber channels disagree. Here a tip the host accepted, in lavender and green, and a cleaning fee the channels disagree on, in amber, with the raspberry button to settle it." → "…purple the AI proposes, orange the host asks the AI. Here a tip the host accepted, in purple and green, and the caption every field carries." And: "New patterns like the fact row, which says where each fact came from and how each channel shows it, went into the system first" → "New patterns like the scope caption under every field, which says where its value comes from, went into the system first"
- *should* · New pop-up "Where I departed" (link: UI changes), 57 words: "I replicated Hospitable and changed only what the model needs. Edit per channel on a shared form → each channel's own pages. Save on every tab → one Save that names its channels. Opportunities on a separate page → tips beside the field. Publish with no preview → Canvas. About twenty departures in all, each with the screenshot behind it."

## 5. Narrative note

The Design part follows Notion's steps 4 and 5 and the section's "In one line" closely: Shared (Base, Hub), then a page set per channel, then Smart Listings on top (strategy, tips, Canvas, Performance), all on Hospitable's own UI. Where it drifts, it drifts in emphasis. It labels receipts and Canvas as Smart Listings features, although Notion makes them structural for every host (KD-05). It never says Smart Listings is opt-in, and it demos two patterns (the conflict card and the channel lens) that the build dropped, along with one stat that has no source. It also reads as a feature tour, while Notion's Design page tells *how* the work was done: designed in code, reviewed on the running build, and pruned (versions, compare mode, the Setup page, inline Canvas editing). The one change that would make it read best is to put that design-review thread in. A "What I removed" pop-up on ds-solution, plus one clause in the notes where each removal happened, turns the tour into evidence of judgement without adding a slide.
