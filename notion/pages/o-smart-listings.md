<callout icon="✅" color="gray_bg">
	**Output · Done** · How a host switches Smart Listings on, sets a strategy per channel, manages it and sees whether it worked. Provenance: prototype screens; the strategies and every performance figure are .
</callout>
![Smart Listings › Strategy: one row per channel with its status, strategy, price range and Autopilot, and Open / Edit / ⋯. Prototype · sample strategies ](file-upload://3eee18af-1645-814e-9877-00b2f182e5c5)
## The short version
- **Opt-in per property.** One toggle on the property Overview. Turning it off asks first and loses nothing.
- **A strategy per channel**, made in a full-screen wizard that copies Hostaway's Add-property flow: one question per screen. One strategy can cover several channels, or each gets its own.
- **Strategy** lists one row per channel. Edit, pause, replace or remove from there; a detail page shows every answer.
- **Performance** shows one channel at a time against the same number of days before its strategy started: a one-line summary, eight KPI cards and four charts.
- **No versions, no compare mode.** Both were built and removed in design review.
## Opt-in on the property Overview
The Smart Listings row is a title, one line ("A strategy for each channel, and tips to improve every part of the listing") and a toggle, nothing else. Off is the default. The first time, the toggle opens the wizard; after that it switches straight back on, with the same strategies. Turning it off opens a dialog: strategies and tips are kept, nothing changes on the listings, and turning it back on picks up where you left off. While it is off, the Smart Listings group leaves the property menu and no tip counts show. Once it is on, the Overview also offers Field visibility for shared fields, covered in <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>.
![The confirmation when a host turns Smart Listings off: strategies and tips are kept, nothing changes on the listings. Prototype](file-upload://3eee18af-1645-815b-88c7-00b2e00af842)
## The strategy wizard
A full-screen takeover with Hostaway's Add-property layout: square back and × buttons, a progress line, one question per screen in a centred column, radio or checkbox cards, and Back / Continue at the bottom. There is no preview card. Each strategy's questions carry an eyebrow such as "Airbnb · Strategy 1 of 3".
<table header-row="true" fit-page-width="true">
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
![Wizard › Guardrails: a nightly price range and what always asks first; prices, stay rules and cancellation can't be turned off. Prototype · sample figures ](file-upload://3eee18af-1645-81e7-92bc-00b2fa78c2c9)
## Strategy, and each channel's detail
Strategy has one full-width row per connected channel: the channel and its status (Live, Paused or No strategy), the strategy ("Fill empty nights · Remote workers"), then the price range, Autopilot on or off, and who it is shared with. Actions: **Open**, **Edit** and **⋯** (Pause or Resume, Replace with a new strategy, Remove). A channel without one says "Smart Listings isn't working on Direct" with Add strategy. Pause and Remove confirm in a dialog that says the listing stays as it is, and both can be undone from the confirmation line. Edit and Replace open the wizard. Strategy and Performance never show tip counts.
**Open** shows the channel's current strategy as a list: goal, who it's for, price range, what always asks first, Autopilot, shared with, and what it should know. It has Edit, Pause and a "See how it's doing" link to Performance.
## Performance
One channel at a time, picked with the channel switch. **Period** is "Since strategy started" by default, plus the last 30 or 90 days once the strategy has run clearly longer than that.
- **Main metrics:** one sentence on occupancy and revenue against the same stretch before, then eight cards: Occupancy, Nightly rate (ADR), RevPAR, Revenue, Next 30 nights booked, Lead time, Views → bookings and Average rating. Each card has one quiet line of context, such as the similar-homes figure. Airbnb and Booking⁠.com don't share page views, so that card says "Not shared" there.
- **How it changed:** four chart cards (Occupancy, Revenue, Nightly rate, Booking lead time). The stretch before the strategy is grey and the stretch since is in the brand colour, on one timeline with a marker where the strategy started. Each chart has its own Bar or Line and day, week or month setting, in Hostaway's Metrics card style.
- A strategy younger than a week says its results show after its first week.
![Performance for Airbnb since the strategy started: the summary, eight KPI cards and the first two charts. Prototype · all figures ](file-upload://3eee18af-1645-81a3-b7ce-00b244f07fa8)
## What was removed, and why
Strategy versions, a history to restore from, and a compare mode with recommendations were built, then removed in design review: versions were a concept to learn before any payoff, and one baseline answers "did this strategy work?" with no setup.
## How it was made
Coded in the prototype and reviewed screen by screen. The wizard copies my screenshots of Hostaway's Add-property flow, and the charts copy Hostaway's Metrics cards ().
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458111b95ee068296d5bd7">Jobs to be done</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d">User flows</mention-page> (flows 1 and 4)
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600">KD-05</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48">KD-06</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>
**In the prototype**
- [Overview]()
- [Wizard]()
- [Strategy]()
- [Airbnb strategy]()
- [Performance]()
