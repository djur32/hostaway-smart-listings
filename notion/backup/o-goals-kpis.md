<page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7" icon="🔭">
<ancestor-path>
<parent-page url="https://app.notion.com/p/45c0a98858f74354ac81b2c2805caf28" title=""/>
<ancestor-2-page url="https://app.notion.com/p/6f59dbf699e54679831c06173a138d0b" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645813d9675c3b09fcf3546" title="06 · Test & measure"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Goals & KPIs"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"🔭"}</iconMetadata>
<content>
<callout icon="🔭" color="gray_bg">
	**Output · Projected** · What Smart Listings is trying to move, how I'd measure it, and the bar for calling it a success. Baselines are `SIMULATED` or not measured yet. Every target is `PROJECTED`.
</callout>
![Two Smart Listings measures over the first 12 months after go: time to adjust in the product (index, expected 55) and tip acceptance (expected 38%), each with a pessimistic–optimistic band. PROJECTED; values from research/testing/projections.json, unchanged.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/a3d0c053-e574-462d-aecd-18dc6e84d8c1/sl-projected.png)
## The short version
- Two product goals and the business result. The third original goal, setting up with confidence, belongs to import, so it moved to the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c"/>.
- **North star: time to adjust.** How long a host takes to make a real change correctly, from opening the field to the change reaching the channel.
- Trust is read next to it: tip acceptance beside AI copy reverted, satisfaction, and perceived control.
- Four guardrails stop the north star being bought with mistakes or untrue AI copy.
- No number here is a finding. The benchmark of today's product replaces the indexed baselines first.
## Goals
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
<td>≥ 80% satisfied in the pilot. Acceptance 30–45%, no channel under 15%. Undo ≤ 5% of accepted tips. Comprehension ≥ 4 of 5 for 80%. Control ≥ 5.5. `PROJECTED`</td>
</tr>
<tr>
<td>**Business: fewer losses, faster deals, less support**</td>
<td>The brief: a confusing listing experience "drives churn, delays enterprise deals, and creates support burden." `REAL·BRIEF`</td>
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
- **What would make it wrong.** Listings are configured once (the brief), so real edits per host are rare. The product number is read across all hosts. If the product lags the lab by more than 20 index points `ASSUMPTION`, I'd review the field-level funnel before general release.
**Not chosen:** tip acceptance (only opted-in hosts; easy to inflate) · Smart Listings opt-in (adoption, not value; some hosts rightly never turn it on) · undo rate (a guardrail) · satisfaction (slow and sparse; it leads the trust goal instead) · confirmed-live rate in 7 days (the north star for import, on the Roadmap).
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
<td>Rework the scope caption ("Uses the Base" · "Customize for Booking⁠.com") and the way back to the Base.</td>
</tr>
<tr>
<td>**Channel rejections**</td>
<td>≤ 2% of fields sent, and never silent</td>
<td>Fix the field mapping and show it to the host. Withdraw Autopilot on a channel whose terms forbid it.</td>
</tr>
</table>
Accessibility (no severity-3+ issue) gates every rollout step; see <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/>.
## Where the numbers would come from
- **Lab:** the benchmark, the think-aloud rounds and the structure A/B give time to adjust, success, wrong-channel edits, ease, SUS, comprehension and control.
- **Product:** events added for this work: field edit started, change saved, change confirmed by the channel, undo, and tip shown, accepted, dismissed or edited. Each carries the channel and whether the field uses the Base.
- **Support and sales:** tickets tagged listing, sync or connection per 100 properties; sales calls coded for listing blockers.
## How it was made
Goals written from the brief's business case and the pains found in research, then re-scoped to Smart Listings. The projection assumes the pilot shows 60% of the effect, the full effect arrives by month 9, and tickets lag use by two months. How each number would be gathered is in <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953"/> · <mention-page url="https://app.notion.com/p/3eee18af1645814c9da9f6fce430fb5c"/> · <mention-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09"/> · <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754"/> · **In the prototype** [Smart Listings › Performance](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/performance?smart=on)
<span color="gray">Files:</span> `research/testing/goals.md` · `research/testing/measurement-plan.md` · `research/testing/projections.json` · `plan/notion-v2/img/sl-projected.svg`
</content>
</page>
