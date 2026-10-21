<callout icon="✅" color="gray_bg">
	**Output · Planned** · What Smart Listings is trying to move, how I'd measure it, and the bar for calling it a success. Baselines are `SIMULATED` or not measured yet. Every target is `PROJECTED`.
</callout>
![Two Smart Listings measures over the first 12 months after go: time to adjust in the product (index, expected 55) with its goal of 60 or less, and tip acceptance (goal 30% at 30 days and 40% at 90 days, expected 50% at full effect), each with a pessimistic–optimistic band. PROJECTED; values from the projection model.](file-upload://3f0e18af-1645-81b9-95b5-00b20f674e91)
## The short version
- **Five goals**, the ones the deck uses, are the outcomes the north star drives, each with a target at 30 and 90 days: more bookings and requests (+5%, +7%), hosts adopt it (10%, 25%), hosts keep refining (60%, 50%), tips earn their place (30%, 40%), and fewer losses, less support (−5%, −10% tickets). The setup goal, setting up with confidence, belongs to import, so it moved to the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>.
- **North star: time to adjust.** How long a host takes to make a real change correctly, from opening the field to the change reaching the channel.
- Trust is read next to it: tip acceptance beside AI copy reverted, satisfaction, and perceived control.
- Four guardrails stop the north star being bought with mistakes or untrue AI copy.
- **Each goal tests a bet.** Every goal names the riskiest assumption it puts on the line and the study that checks it: trust in AI tips (H-09) under tips accepted and refining, a voice per channel (H-04) under adoption, what Autopilot may touch (H-15) under losses, copy per channel (H-10) under bookings.
- No number here is a finding. The benchmark of today's product replaces the indexed baselines first.
## Five goals the north star drives
<table header-row="true">
	<tr>
		<td>Goal</td>
		<td>What I'd measure</td>
		<td>Baseline</td>
		<td>30 days after launch</td>
		<td>90 days after launch</td>
	</tr>
	<tr>
		<td>**More bookings and requests**</td>
		<td>Bookings and booking requests per listing, against its own weeks before</td>
		<td>Each listing's own weeks before, from the bookings Hospitable already has</td>
		<td>+5% `PROJECTED`</td>
		<td>+7% `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Hosts adopt it**</td>
		<td>Eligible properties with a strategy on at least one channel</td>
		<td>New</td>
		<td>10% `PROJECTED`</td>
		<td>25% `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Hosts keep refining**</td>
		<td>Adopters who act on a tip in the month</td>
		<td>New</td>
		<td>60% `PROJECTED`</td>
		<td>50% `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Tips earn their place**</td>
		<td>Tips accepted, out of tips shown</td>
		<td>New</td>
		<td>30% `PROJECTED`</td>
		<td>40% `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Fewer losses, less support**</td>
		<td>Listing and sync tickets per 100 properties</td>
		<td>Today's rate, once the benchmark normalises it</td>
		<td>−5% `PROJECTED`</td>
		<td>−10% `PROJECTED`</td>
	</tr>
</table>
Time to adjust is the one number for the experience; these five are what it should move. The first goal counts bookings and booking requests, which Hospitable already has for every listing, against the listing's own weeks before. Season moves revenue, so revenue, occupancy and views are reported, not targeted. The 30- and 90-day numbers are steps: adoption toward 35% at six months and tickets toward 25% fewer at twelve months, since they lag use by about two months. The pilot sets the real targets.
## The KPI tree: each goal, its bet and its test
![KPI tree: the north star (time to adjust ≤ 60), then each goal with its KPI and 30- and 90-day targets, the assumption it tests (H-10, H-04, H-09, H-15) and the study that checks it, with its bar. Guardrails below. Targets PROJECTED; bets ASSUMPTION; no study has run.](file-upload://3f0e18af-1645-8156-81b8-00b2dc14c1d6)
- **Trust in AI tips (H-09), my riskiest bet,** sits under two goals: tips earn their place and hosts keep refining. The usability rounds check it first (can a host tell a tip's why?), the pilot over six weeks.
- **Who wants a voice per channel (H-04)** sits under adoption. The pilot reads adoption per host type, so a type that never wants a strategy shows up as a segment, not a failure.
- **What Autopilot may touch (H-15)** sits under fewer losses. Overwrites and undo in the pilot, then tickets against the holdout.
- **Copy per channel lifts bookings (H-10)** sits under bookings, read only in the rollout against the 10% held out, because season moves bookings more than any feature.
- The north star is checked by the benchmark of today's product, then the structure A/B (<mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09">KD-19</mention-page>). The bets come from <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>; the studies from <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.
## Measures in detail
<table header-row="true">
	<tr>
		<td>Goal</td>
		<td>In the host's words</td>
		<td>Primary measure</td>
		<td>Baseline</td>
		<td>Target</td>
	</tr>
	<tr>
		<td>**Change it once, quickly, in the right place**</td>
		<td>"When something changes, I change it once and every channel is right."</td>
		<td>**Time to adjust**, in the lab (five timed tasks) and in the product (field opened → change confirmed on the channel). Ease per task, 1–7.</td>
		<td>Not measured yet. Today = index 100 once the benchmark runs. Ease: public norm ≈ 5.5 `REAL·PUBLIC`</td>
		<td>Lab index ≤ 60 (band 50–75). Product index 55 (band 45–75). Ease ≥ 5.5 on every task. `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Know what goes out, and trust it**</td>
		<td>"I understand what the system suggests, why, and I can always undo it."</td>
		<td>**Satisfaction** (CSAT, % 4–5). Tip acceptance. Undo rate. Comprehension (0–5). Perceived control (1–7).</td>
		<td>Not measured. Proxy: listing-ticket CSAT ≈ 3.2 of 5 `SIMULATED`. Tips are new, so no baseline.</td>
		<td>≥ 80% satisfied in the pilot. Acceptance 30% or more in the first 30 days, no channel under 15%. Undo ≤ 5% of accepted tips. Comprehension ≥ 4 of 5 for 80%. Control ≥ 5.5. `PROJECTED`</td>
	</tr>
	<tr>
		<td>**Business: fewer losses, faster deals, less support**</td>
		<td>"Fewer listing tickets, and fewer deals held up by listings."</td>
		<td>**Listing, sync and connection tickets** per 100 properties. Share of sales calls where listing issues block a 25+ deal.</td>
		<td>Tickets: index 100, not normalised yet; 35% of listing tickets are the categories the design targets (where do I edit, per-channel mismatch, content overwritten). Blockers: 30% at 25+. `SIMULATED`</td>
		<td>Tickets index 75 (band 60–90). Blockers 20% at 25+. Churn is read against the 6-month holdout. `PROJECTED`</td>
	</tr>
</table>
## North star · time to adjust
- **It's the model's promise in one number.** Facts live once, each channel holds only what differs, tips sit in context. If that works, a change takes less time and lands in the right place. It's also the measure I named.
- **It's measured twice.** In the lab against today's product, which compares structures fairly; in the product against a holdout, which shows whether it holds in real use.
- **It counts for every host,** including those who keep Smart Listings off. Tip acceptance only counts hosts who opted in, and it can rise while copy gets worse, so it's always read next to AI copy reverted.
- **What it needs.** Today's Hospitable shows no result after Save `REAL·PRODUCT`, so there's nothing to time against. The first engineering ask is a confirmation event per field and channel.
- **What would make it wrong.** Listings are configured once, so real edits per host are rare. The product number is read across all hosts. If the product lags the lab by more than 20 index points `ASSUMPTION`, I'd review the field-level funnel before general release.
**Not chosen as the north star** (tip acceptance and adoption still count, as goals above): tip acceptance (only opted-in hosts; easy to inflate) · Smart Listings opt-in (adoption, not value; some hosts rightly never turn it on) · undo rate (a guardrail) · satisfaction (slow and sparse; it leads the trust goal instead) · confirmed-live rate in 7 days (the north star for import, on the Roadmap).
## Guardrails · what must not get worse
<table header-row="true">
	<tr>
		<td>Guardrail</td>
		<td>Threshold</td>
		<td>If it's breached</td>
	</tr>
	<tr>
		<td>**No unsupported AI claims**</td>
		<td>Zero unsupported claims in an offline set of about 200 real listings × tip types, before the pilot `ASSUMPTION`. AI copy reverted or complained about ≤ 10% of accepted.</td>
		<td>Turn that tip type off for that channel. Any channel strike traced to AI copy pauses Autopilot for every host.</td>
	</tr>
	<tr>
		<td>**Undo rate**</td>
		<td>≤ 5% of accepted tips undone within 7 days</td>
		<td>Pause Autopilot defaults; review the tips with the most undos.</td>
	</tr>
	<tr>
		<td>**Wrong-channel edits, and facts copied "to be safe"**</td>
		<td>≤ 10% of lab attempts edit the wrong scope. ≤ 5% of channel overrides equal the Base.</td>
		<td>Rework the scope caption ("Uses the Base" · "Customize for Booking.com") and the way back to the Base.</td>
	</tr>
	<tr>
		<td>**Channel rejections**</td>
		<td>≤ 2% of fields sent, and never silent</td>
		<td>Fix the field mapping and show it to the host. Withdraw Autopilot on a channel whose terms forbid it.</td>
	</tr>
</table>
Accessibility (no severity-3+ issue) gates every rollout step; see <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.
## Where the numbers would come from
- **Lab:** the benchmark, the think-aloud rounds and the structure A/B give time to adjust, success, wrong-channel edits, ease, SUS, comprehension and control.
- **Product:** events added for this work: field edit started, change saved, change confirmed by the channel, undo, and tip shown, accepted, dismissed or edited. Each carries the channel and whether the field uses the Base.
- **Support and sales:** tickets tagged listing, sync or connection per 100 properties; sales calls coded for listing blockers.
## How it was made
Goals written from the brief's business case and the pains found in research, then re-scoped to Smart Listings. The projection assumes the pilot shows 60% of the effect, the full effect arrives by month 9, and tickets lag use by two months. How each number would be gathered is in <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953">00 · Brief & scope</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645814c9da9f6fce430fb5c">Problem statement</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924">05 · Design</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382">Pre-mortem</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09">KD-19</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
**In the prototype**
- [Smart Listings › Performance](https://hospitable-case-web.digimal.studio/property/neukolln/smart/performance?smart=on)
