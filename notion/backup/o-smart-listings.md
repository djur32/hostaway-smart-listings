<page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Strategy & performance"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · How a host switches Smart Listings on, sets a strategy per channel, manages it and sees whether it worked. Provenance: prototype screens; the strategies and every performance figure are `SIMULATED`.
</callout>
![Smart Listings › Strategy: one row per channel with its status, strategy, price range and Autopilot, and Open / Edit / ⋯. Prototype · sample strategies `SIMULATED`](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/6b63bd14-67f5-4b33-a351-211387db00f9/p-strategy.png)
## The short version
- **Opt-in per property.** One toggle on the property Overview. Turning it off asks first and loses nothing.
- **A strategy per channel**, made in a full-screen wizard that copies Hospitable's Add-property flow: one question per screen. One strategy can cover several channels, or each gets its own.
- **Strategy** lists one row per channel. Edit, pause, replace or remove from there; a detail page shows every answer.
- **Performance** shows one channel at a time against the same number of days before its strategy started: a one-line summary, eight KPI cards and four charts.
- **No versions, no compare mode.** Both were built and removed in design review.
## Opt-in on the property Overview
The Smart Listings row is a title, one line ("A strategy for each channel, and tips to improve every part of the listing") and a toggle, nothing else. Off is the default. The first time, the toggle opens the wizard; after that it switches straight back on, with the same strategies. Turning it off opens a dialog: strategies and tips are kept, nothing changes on the listings, and turning it back on picks up where you left off. While it is off, the Smart Listings group leaves the property menu and no tip counts show. Once it is on, the Overview also offers Field visibility for shared fields, covered in <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/>.
![The confirmation when a host turns Smart Listings off: strategies and tips are kept, nothing changes on the listings. Prototype](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/b2c5e771-7703-451a-bf5d-ab7caf64d3ce/da-off-dialog.png)
## The strategy wizard
A full-screen takeover with Hospitable's Add-property layout: square back and × buttons, a progress line, one question per screen in a centred column, radio or checkbox cards, and Back / Continue at the bottom. There is no preview card. Each strategy's questions carry an eyebrow such as "Airbnb · Strategy 1 of 3".
<table fit-page-width="true" header-row="true">
<colgroup>
<col>
<col width="528">
</colgroup>
<tr>
<td>Step</td>
<td>What the host answers</td>
</tr>
<tr>
<td>Intro (first time only)</td>
<td>"It's easy to set up a strategy": a goal, the guests, guardrails, then tips.</td>
</tr>
<tr>
<td>Channels</td>
<td>Which channels Smart Listings works on. A channel that already has a strategy says "Will replace the current one".</td>
</tr>
<tr>
<td>Sharing (2+ channels)</td>
<td>One strategy for all, a different strategy for each (the default), or, with three channels, some share one.</td>
</tr>
<tr>
<td>Goal</td>
<td>Fill empty nights · Earn more per booking · Balance both · Save me time. One is marked Suggested, with a line of evidence from the channel.</td>
</tr>
<tr>
<td>Who it's for</td>
<td>An audience, "Let Smart Listings decide", or "Someone else" in the host's own words. Each comes with a default set-up (price against similar homes, minimum stay, cancellation) the host can change. An audience that doesn't fit the home isn't offered.</td>
</tr>
<tr>
<td>Guardrails</td>
<td>A nightly price range. "Always ask me first": prices and fees, minimum stay and rules, and the cancellation policy are locked on; property name changes and photo order can be added.</td>
</tr>
<tr>
<td>Autopilot</td>
<td>Off (the default): tips wait for you. On: text and photo-order tips apply on their own, inside the guardrails.</td>
</tr>
<tr>
<td>Notes (optional)</td>
<td>Anything the strategy should know, typed or dictated.</td>
</tr>
<tr>
<td>Review</td>
<td>Every answer with Edit. Save runs a short "Saving your strategy" step, then lands on Strategy with a confirmation.</td>
</tr>
</table>
![Wizard › Guardrails: a nightly price range and what always asks first; prices, stay rules and cancellation can't be turned off. Prototype · sample figures `SIMULATED`](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/7f69a3fd-9ec5-4c02-b091-86195c24bbc3/wz-guardrails.png)
## Strategy, and each channel's detail
Strategy has one full-width row per connected channel: the channel and its status (Live, Paused or No strategy), the strategy ("Fill empty nights · Remote workers"), then the price range, Autopilot on or off, and who it is shared with. Actions: **Open**, **Edit** and **⋯** (Pause or Resume, Replace with a new strategy, Remove). A channel without one says "Smart Listings isn't working on Direct" with Add strategy. Pause and Remove confirm in a dialog that says the listing stays as it is, and both can be undone from the confirmation line. Edit and Replace open the wizard. Strategy and Performance never show tip counts.
**Open** shows the channel's current strategy as a list: goal, who it's for, price range, what always asks first, Autopilot, shared with, and what it should know. It has Edit, Pause and a "See how it's doing" link to Performance.
## Performance
One channel at a time, picked with the channel switch. **Period** is "Since strategy started" by default, plus the last 30 or 90 days once the strategy has run clearly longer than that.
- **Main metrics:** one sentence on occupancy and revenue against the same stretch before, then eight cards: Occupancy, Nightly rate (ADR), RevPAR, Revenue, Next 30 nights booked, Lead time, Views → bookings and Average rating. Each card has one quiet line of context, such as the similar-homes figure. Airbnb and Booking⁠.com don't share page views, so that card says "Not shared" there.
- **How it changed:** four chart cards (Occupancy, Revenue, Nightly rate, Booking lead time). The stretch before the strategy is grey and the stretch since is in the brand colour, on one timeline with a marker where the strategy started. Each chart has its own Bar or Line and day, week or month setting, in Hospitable's Metrics card style.
- A strategy younger than a week says its results show after its first week.
![Performance for Airbnb since the strategy started: the summary, eight KPI cards and the first two charts. Prototype · all figures `SIMULATED`](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/14e26210-633a-4d0e-8e71-93117849900b/perf-airbnb.png)
## What was removed, and why
Strategy versions, a history to restore from, and a compare mode with recommendations were built, then removed in design review: versions were a concept to learn before any payoff, and one baseline answers "did this strategy work?" with no setup.
## How it was made
Coded in the prototype and reviewed screen by screen. The wizard copies my screenshots of Hospitable's Add-property flow, and the charts copy Hospitable's Metrics cards (`REAL·PRODUCT`).
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd"/> · <mention-page url="https://app.notion.com/p/3eee18af16458111b95ee068296d5bd7"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d"/> (flows 1 and 4)
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600"/> · <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48"/> · <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844"/> · <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033"/>
**In the prototype** · [Overview](https://hospitable-case-djur32.vercel.app/property/neukolln/overview?smart=on) · [Wizard](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/wizard?entry=add&from=strategy&smart=on) · [Strategy](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/strategy?smart=on) · [Airbnb strategy](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/strategy/airbnb?smart=on) · [Performance](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/performance?smart=on)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/smart/`</span><span color="gray"> (PropertyOverview, StrategyWizard, Strategy, StrategyChannel, strategyActions, Performance) · </span><span color="gray">`prototype/src/data/v3-sl.ts`</span><span color="gray"> · </span><span color="gray">`prototype/src/data/performance.ts`</span>
</content>
</page>
