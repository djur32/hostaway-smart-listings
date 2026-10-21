# 40 · Concept · deck × Notion v2

Scope: `deck/src/slides/40-concept.html` (cn-principles with the Concept cover template, cn-grid, cn-judged, cn-converge; their pop-ups and notes), `40-concept.js` where an edit touches it, `deck/src/data/covers.json`. Compared with Notion `04 · Concepts`, its four pages, and KD-04/05/06/07/08/09/10/14/16/18. Numbers checked against `concepts/convergence/` (every score, pair, sensitivity and test count on the slides matches the repo).

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| Concept cover (drawn on cn-principles) | 04 · Concepts | https://app.notion.com/p/3eee18af164581b690aecaa695cf08a7 | The cover is the part's Methods and Outputs; the section page holds the same two columns and the "In one line". |
| cn-principles | Design principles | https://app.notion.com/p/3eee18af164581cfb862c44df572735c | Same seven principles, the draft vs research table, the three floors. |
| cn-principles › pop-up "Where each rewrite came from" | Insights | https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd | The pop-up's "Why" column is the insight behind each rewrite. |
| cn-grid | Concept directions | https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d | "Round one · seven directions × five screens", the bar, Health & Missions cut, the pair of finalists. |
| cn-grid › pop-up "The bar" | Concept directions | https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d | Same section ("if two are the same screen with the panel on the other side…"). |
| cn-judged (as is) | Concept directions | https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d | Only v2 page that names the weighted evaluation and the finalists. |
| cn-judged (after edit E14) | Concept testing | https://app.notion.com/p/3eee18af1645810fbe60d21eb29dd3c7 | The planted consequence becomes the planned test; secondary: KD-18 https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c |
| cn-judged › pop-up "Every direction on every screen" | Concept directions | https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d | No v2 page holds the matrix; this one cites the weighted evaluation (repo: `concepts/convergence/evaluation.md`). |
| cn-converge | Final concept | https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4 | How the directions became one Smart Listing model, then code. |
| cn-converge › pop-up "What every direction left behind" | Concept directions | https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d | Its round-two table has the "What survived in the build" column. |

How the link resolves today: all four slides open the **v1** workspace. `slideUrl()` (kit/hc.js) matches the `04-concepts` token in `data-notion` against `notion-links.json` `pages["04-concepts"]` = `3eae18…6de044` (old workspace). Changing only `data-notion-page` won't help while that token sits in `data-notion`. Fix: add v2 keys to `pages` (e.g. `v2-04-principles`, `v2-04-directions`, `v2-04-concept-test`, `v2-04-final`, `v2-04-concepts`) and put the right key first in each slide's `data-notion`.

## 2. Conflicts

| # | slide | deck says | Notion says (page) | who's right, why | type |
|---|---|---|---|---|---|
| 1 | cn-converge pop-up | "19 · more directions in a wider round" | "twelve AI-guided Smart Listing directions" (04 · Concepts, Concept directions) | Notion. 19 = 12 Smart Listing + 7 import directions (`concepts/wizard/README.md`); counting import breaks rule 1 | **Fix** |
| 2 | cn-converge h2, msg, notes | "Inbox as the spine, canvas as the surface: Smart Listings"; "My two finalists became one product" | "Chosen: B2's live canvas and B3's copilot, merged into one Smart Listing model, with the strategy taken from B6 … and B7"; round one only seeded it: "what needs you became tips" (Final concept) | Notion. The prototype has no inbox in the property menu (Needs you survives only as first-time setup, `/overview/needs-you`). The deck skips the round that produced the model | **Fix** |
| 3 | cn-converge image `c4r-scr-02` | "Spine: only what needs you, money first" over the round-one **Reconcile** frame (cleaning fee €25 vs €30, "Needs you · 3 of 6"), strip shows "S09", "T-02", "D-061" | "The first two columns (connect and reconcile) cover first-time setup, which this case leaves out" (Concept directions) | Notion and rule 1: this is import/setup shown as the spine of the solution; the strip also shows session codes and IDs | **Fix** |
| 4 | cn-converge image `c1r-scr-04` | Booking.com preview with "WRITTEN BY BOOKING.COM · Approximate"; strip with "D-032", "OQ-081", "T-02" | KD-04, Design principles row 3: "Booking.com's description is set by Booking.com" | Rule 4: Antonio removed "Set by Booking.com" from the deck's field model, so the deck wins; Notion agrees with the image | **Flag** |
| 5 | cn-converge pop-up, C4 and C3 rows | C4 "The spine: exceptions, money first"; C3 "A question card when a fact is missing, one at a time" | "what needs you became tips" (Final concept); B3 copilot → "The docked Tips panel and Rewrite with AI; the chat copilot wasn't built" (Concept directions); money and stay rules always ask (KD-08) | Notion (as built) | **Fix** |
| 6 | cn-judged footer | "Simulated · Concept test with eight hosts" | "Not run with hosts … a simulated rehearsal … with eight synthetic hosts … Its results are not evidence and aren't reported here" (Concept testing); "Not tested with hosts" (04 · Concepts) | Notion: "eight hosts" reads as eight people, chip or not | **Fix** |
| 7 | cn-judged dots, h2, msg, notes, Robustness | 8/8 vs 4/8; "the inbox catches the money"; "planted a price change to see who caught it"; "a rule I still design by"; "moved four cells" | Concept testing is 🔭 Projected and withholds the rehearsal's numbers; KD-18: "the prototype was not changed to answer invented findings". But KD-14's Why cites the same rehearsal | Notion's method page and KD-18 on honesty. Notion is split with itself (KD-14), so Antonio decides. Detail in 2a | **Flag** |
| 8 | Cover | Outputs "Sampled · Concept test results"; op-how and the Test cover also say sampled | "Concept testing 🔭 Projected · how I'd compare directions with eight hosts" (04 · Concepts) | Rule 4 vocabulary, plus a real status gap: Notion says not run at all. Antonio's own sampled set is "five interviews and a card sort" | **Flag** |
| 9 | Cover | Outputs "7 directions, 21 frames" | "Seven directions, then twelve, and what survived" (04 · Concepts) | Notion; round two is missing | **Fix** (omission) |
| 10 | Cover | Methods "Wireframing · Weighted scoring matrix · Sensitivity analysis" | Round two "each built on established patterns from best-in-class products"; the deck's own op-how lists "Pattern references" for Concept | Notion and op-how | **Fix** (cohesion) |
| 11 | cn-principles list, pop-up, notes | "The home, once"; "Defaults for one, power for many" | "Facts once (written as 'the home, once')"; "One product for four hosts (written as 'defaults for one, power for many')" (Design principles) | Notion. "The home" was dropped as a name (KD-02 options); the build says Shared | **Fix** (cohesion) |
| 12 | cn-grid notes | "The brief asks for radically different directions" | The bar is my own (Concept directions); `plan/BRIEF.md` has no such ask | The brief. Never attribute a demand to it that it doesn't make | **Fix** |
| 13 | cn-judged Robustness | "94% of random weightings won by the Decision Inbox"; "Every run still won by the Inbox" | Not in Notion. Repo: the Inbox wins overall because it wins connect and reconcile (4.12, 4.35) | Accurate, but it celebrates the Inbox on first-time-setup screens (rule 1). The pair claim survives without them: on the three listing screens alone Canvas + Inbox is still the best pair (checked from `per-screen.csv`) | **Flag** |
| 14 | cn-judged pop-up "Mirror images" | Canvas row: P2 Optimiser only | `evaluation.md` §4: Canvas strong for P2 **and P4** (3.9, 3.4) | Repo | **Fix** (minor) |
| 15 | cn-principles notes | "Booking.com writes the description itself" | Same as Notion (principle 3 row) | Only a conflict if Antonio wants Booking.com's read-only text out of the deck entirely (rule 4) | **Flag** (low) |
| 16 | all four | "Notion" link → v1 workspace | v2 URLs (map.json) | v2 | **Fix** |
| 17 | cn-judged notes | "across our four hosts" | Voice rule: "I", never "our" (SPEC §4) | Voice | **Fix** (minor) |

Notion-side inconsistency, for Antonio: **KD-14**'s Why ("In the simulated concept test, hosts missed a price change inside a preview walk-through") uses rehearsal results that the **Concept testing** page refuses to report and that **KD-18** says didn't change the prototype. Cross-part: **tm-test** (Test) repeats the same 8/8 vs 4/8. Tell it once, or not at all.

### 2a. Every concept-test claim vs KD-18 ("label what is simulated; plan the tests rather than fake results")

| claim | where | labelled? | verdict |
|---|---|---|---|
| "Sampled · Concept test results" | cover | yes (Sampled) | KD-18 allows labelled simulated research, but Notion files the concept test as Projected. Flag (#8). |
| "then planted a price change to see who caught it" | cn-judged msg | no | Reads as a run test. Breaks "label what is simulated". |
| "the inbox catches the money" | cn-judged h2 | no | Headline rests on a simulated result, unlabelled. |
| Inbox 8/8, Canvas preview 4/8 | cn-judged dots | chip | Labelled and traceable (`concept-test.csv`, SIMULATED), but shown as a result chart it reads as evidence; Notion withholds it. Flag. |
| "Concept test with eight hosts" | cn-judged footer | chip only | Words imply real hosts. Fix. |
| "The concept test moved four cells and changed no ranking" | cn-judged pop-up | chip | Scores were changed from simulated findings. KD-18 dropped "simulate test rounds and change the design from them". Drop. |
| "All eight hosts caught it … both hosts new to property management missed it" | notes | later in the same para | Say "simulated hosts". |
| "That gave me a rule I still design by: a preview is never where you decide money" | notes | no | Contradicts KD-18's Why; agrees with KD-14's. Ground the rule on real evidence instead: Hospitable's own Smart Pricing warning (`REAL·PRODUCT`), "Publish listing" with no preview (KD-14), principle 5. |
| "The test is simulated, so it shapes the next test; it doesn't replace it." | notes | yes | Consistent with KD-18 and Concept testing ("shaped the planted-consequence design"). Keep the idea. |
| Mirror images, 3.80, 47 %, heatmap | cn-judged | n/a | My weighted scores (design judgement), not test results. Fine. |

## 3. Missing story (ranked)

1. **Round two: twelve Smart Listing directions on proven patterns, and what survived.** B1 to B12 in Paper, each a pattern board plus eight frames over the same flow. Kept: B2 live canvas → Canvas view, B3 copilot → tips panel and Rewrite with AI, B6 → "Who do you want to attract?", B7 → goal, guardrails, Autopilot, B8 → the tip's diff and why, B10 → similar homes in every why. This is where Smart Listings actually came from; the deck hides it in a wrong "19". **Belongs on cn-converge** (E17 to E19). Notion: Concept directions, Final concept.
2. **The review loop that set the model, then code.** My 43 comments on B2 set the model (per property, a strategy per channel, one tip container, Classic and Canvas, Performance). The four-step strategy was "really complex", so it became a one-question wizard on Hospitable's own pattern (KD-06). Then: "Do it on the real thing", so the work moved off Paper. A Head-of-Design judgement story. **cn-converge notes and message** (E17, E20).
3. **What I cut, and why it made the product smaller.** Versions and compare (KD-07), the listing studio (KD-10), a separate setup page (KD-06), the chat copilot, the three-level autonomy dial, now Autopilot on or off (KD-08). **cn-converge pop-up, round-two panel**, one closing line (E19), plus one line on cn-principles (E7).
4. **The concept test as a plan, not a result (KD-18).** Eight hosts, two per type, three or four directions, counterbalanced paired comparison. Every direction hides the same consequence (Hospitable's own Smart Pricing warning, `REAL·PRODUCT`). Measures: catch rate, comprehension, trust. Watch for over-trust in the Canvas, whether the why is read before Accept, and whether the strategy feels like the host's own. **Replaces the dots on cn-judged** (E14).
5. **Principles checked against the build.** Notion maps each principle to where it shows in the prototype, and says the build simplified two: versions dropped, so receipts plus Undo are the net, and the dial became Autopilot on or off. This proves the principles weren't decoration. **cn-principles pop-up**, Floors panel (E7).

## 4. Proposed edits

**Links**
- **E0 · must** · `notion-links.json` + each slide's `data-notion`: add the v2 keys from §1 and put the right one first (see §1 note).

**Cover (template in cn-principles) and covers.json**
- **E1 · should** · Methods. "Design principles · Divergent ideation · Wireframing · Weighted scoring matrix · Sensitivity analysis · Concept testing" → "Design principles · Divergent ideation · Pattern references · Weighted scoring · Design reviews · Concept testing"
- **E2 · should** · Outputs, Produced row. "7 design principles · 7 directions, 21 frames · Weighted evaluation · Smart Listings direction" → "7 design principles · 7 directions, then 12 · Weighted evaluation · One Smart Listing model"
- **E3 · should, Antonio decides (#8)** · Outputs, row `data-mark="sampled"` "Concept test results" → row `data-mark="planned"` "Concept test with eight hosts". If yes, also op-how's Concept stage `["Concept testing", "sampled"]` → `"planned"`, and the Test cover.
- **E4 · could** · template `data-illo="ai-writing-per-channel"` → `"concept-directions"` (covers.json already picks it; the fallback is Design's drawing). covers.json: the `"ia"` entry is unused (no slide has `data-part="ia"`); remove it or leave it. No other covers.json change.

**cn-principles**
- **E5 · should** · Rename everywhere (list, Evidence row 2, Floors list, notes). "The home, once" → "Facts once". "Defaults for one, power for many" → "One product for four hosts". Notes: "and one was added: the home, once." → "and one was added: facts once."
- **E6 · could** · footer "Override rates from the simulated research" → "From the simulated research" (no rate is on the wall).
- **E7 · could** · Floors panel, add last: "The build made two simpler: no versions, so receipts and Undo are the safety net, and the autonomy dial became Autopilot on or off." (panel stays ≤ 90)
- **E8 · could, only on Antonio's word (#15)** · notes: delete "On Booking.com the host's voice is simply the quality of their facts, because Booking.com writes the description itself."

**cn-grid**
- **E9 · must** · notes: "The brief asks for radically different directions, so I held myself to a hard bar." → "I wanted directions that were truly different, so I held myself to a hard bar."
- **E10 · should** · eyebrow "Divergence" → "Round one". h2 "Seven directions through the same listing screens" → "Round one: seven mental models, the same listing screens"

**cn-judged**
- **E11 · must** (if the dots stay) · footer "Concept test with eight hosts" → "Simulated rehearsal, eight synthetic hosts, not evidence"
- **E12 · must** · notes: "All eight hosts caught it in the inbox." → "All eight simulated hosts caught it in the inbox." · "mirror images across our four hosts" → "mirror images across the four host types"
- **E13 · should** · Mirror: Canvas row add `<span class="cn-mirror__p"><span class="hc-avatar" data-persona="P4">P4</span>New host</span>`
- **E14 · should, Antonio decides (#7, KD-18)** · turn the planted change into the planned test:
  - h2 "The canvas wins the listing studio; the inbox catches the money" → "The canvas wins the listing studio; the inbox makes the best pair"
  - msg "I scored all seven so I couldn't fall for a favourite, then planted a price change to see who caught it." → "I scored all seven so I couldn't fall for a favourite. The test that could prove me wrong is planned, not faked."
  - `.cn-caught` block → a planned card: kicker "The test I'd run" with `hc-mark data-mark="planned"`; three lines: "Eight hosts, two per host type, compare the directions" · "Each hides the same consequence: Hospitable's own warning that Airbnb Smart Pricing turns off" · "I note who catches it unprompted, and how far they trust it"
  - footer "Simulated · Concept test with eight hosts" → "My scores against fifteen weighted criteria" (no chip: no research data left on the wall)
  - Robustness: "94% of random weightings won by the Decision Inbox" → "8 of 11 weighting scenarios with Inbox plus Canvas as the best pair" · "Every run" / "still won by the Inbox, with noise on a fifth of the scores" → "3.44" / "the lowest any host type scores the pair, the highest floor" · delete "The concept test moved four cells and changed no ranking" (all three numbers are in `evaluation.md`)
  - notes, para 3 → "The test that could prove me wrong is planned, not faked. Eight hosts, two per type, compare the directions, and every one hides the same consequence: Hospitable's own warning that Airbnb Smart Pricing turns off. I watch who catches it unprompted, and who over-trusts the friendly preview. A simulated rehearsal shaped that design. Its numbers aren't evidence, so I don't show them. About 50 seconds."
  - `40-concept.js`: cn-judged `enter()` and beat 2 animate `.cn-caught` / `.cn-dots`; point beat 2 at the new card or drop it. Beat 1 matches the bar label "C4 Decision Inbox"; keep that label.

**cn-converge**
- **E15 · must** · pop-up last item "19 · more directions in a wider round, converged after 43 review comments" → "12 · Smart Listing directions in a second round; 43 review comments set the model"
- **E16 · must** · image `c4r-scr-02` (setup reconcile) → `c4-scr04` (Decision Inbox as the listing studio, already in shots), alt "Decision Inbox: only what needs you". Crop off the annotation strip (it carries a file path). Flag (#4): `c1r-scr-04` → `c1-scr04`, cropped the same way.
- **E17 · must** · h2 "Inbox as the spine, canvas as the surface: Smart Listings" → "Two rounds of directions, one model: Smart Listings" · msg "My two finalists became one product: facts once, a page per channel, tips with a why, and nothing reaching a channel unseen." → "Round one set the structure. A second round of twelve directions gave the model: a strategy per channel, tips with a why, on the channel's real page." · callouts "Spine: only what needs you, money first" → "Round one: what needs you" · "Surface: the channel's real page" → "Round one: what guests see"
- **E18 · should** · scene: add four round-two frames between the pair and the hero, from `concepts/wizard/png/WB/` ("B2 · 1 · The pages", "B3 · 2 · Details summary", "B6 · 1 · Who is it for", "B7 · 2 · Guardrails"), cropped above their annotation strips (they carry IDs). Callout: "Round two: twelve on proven patterns, four kept". Hero `sl-hero` → `cv-airbnb` (Canvas with the tips panel: canvas and copilot in one frame, as on Notion's Final concept).
- **E19 · should** · pop-up → two panels:
  - "Round one": C4 Decision Inbox "What needs you, now tips one at a time" · C1 Channel Canvas "The channel's real page, now the Canvas view" · C2 Golden Record "Uses the Base or custom, per field" · C3 Copilot "One decision at a time" · C5 Merge and Versions "Performance over time" · C7 Fact Blocks "A line under each fact saying how far it reaches" · C8 Home Tour "Rooms organise photos"
  - "Round two": B2 Live canvas "The Canvas view" · B3 Copilot on every screen "The docked tips panel and Rewrite with AI" · B6 Strategy picker "Who do you want to attract?" · B7 Goals and guardrails "The wizard's goal, guardrails and Autopilot" · B8 Suggesting mode "The tip's change and its why" · B10 You vs similar homes "Similar homes in every why" · closing line "Cut on the way: versions, the listing studio, the chat copilot and the autonomy dial."
- **E20 · should** · notes → "Round one gave me the structure: the inbox's 'what needs you' became tips, and the canvas became a view of each channel's real page. [Press] Then I ran a second round: twelve directions for the listing itself, built in Paper, each on an established pattern from a best-in-class product. The live canvas answered the brief's question about control and transparency most directly, so I reviewed it frame by frame, 43 comments, and merged it with the copilot and two strategy directions. When the strategy grew to four steps, I cut it to one question per screen, on Hospitable's own wizard. I cut versions and the autonomy dial too; each cut made the product smaller. Then I said: build it on the real thing. From here on, everything I show is running code. About 55 seconds."
  - Note: Notion says "AI-guided" directions. If Antonio means agent-built (as on op-how), say "agents built them in Paper; I reviewed and chose".

## 5. Narrative note

Notion's 04 line is "seven principles and two rounds of divergence converged on one model, a strategy per channel that turns into tips, seen on the channel's real page", which is step 5 of the hub's story. The deck tells principles, round one and the scoring well, then jumps from the round-one pair straight to Smart Listings. On the way it shows a first-time-setup screen as the "spine" and counts import directions in its "19". The strategy per channel, the heart of step 5, never reaches a Concept wall, and the one "result" the part shows is a simulated test that Notion chooses not to report. The one change that fixes most of this: rebuild cn-converge as "two rounds, one model" (E15 to E20), with the round-two picks visible, the review story in the notes, and the cuts in the pop-up. Then turn cn-judged's dots into the planned test (E14), so the part ends on running code with the evidence still to earn.
