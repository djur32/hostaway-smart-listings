<callout icon="✅" color="gray_bg">
	**Output · Planned** · Where Smart Listings falls short: four lines of work the build implies but doesn't finish, and how I'd run each. Nothing here is built or measured. Provenance: "exists now" is the prototype, its figures `SIMULATED`; today's product `REAL·PRODUCT`; every step, owner and effect `ASSUMPTION`; targets `PROJECTED`.
</callout>
![Where Smart Listings falls short, on one page: the four lines of work, each with what exists now, what is missing, how I'd run it, who is involved and the measure that says it worked. A sketch of planned work: the Performance chart has no data and the tips are sketches. Plans ASSUMPTION, targets PROJECTED.](file-upload://3efe18af-1645-817f-bc1a-00b2b2ab4ca7)
## The short version
- **Comps.** Similar homes already shape the wizard, a tip's why and Performance, but only as sample data. Where comps come from, what "similar" means on each channel and how they stay private are all undecided.
- **Knowledge Hub.** Questions, Insights, Facts and Sources are built, as a concept on demo data. Real Inbox questions, answers that stay faithful to the Listing base, and facts that know which messages, tasks and workflows use them are still ahead.
- **Performance** is the deepest gap. It compares a channel with the stretch before its strategy, but doesn't yet say whether that comparison is fair, what moved the number, or which lever to pull.
- **Tips beyond the listing.** Only channel pages raise tips. Raised by Inbox, Calendar and other areas through one contract, tips become a system instead of a one-off.
- Where each line sits in time is on the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>; how the areas connect is in <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hospitable</mention-page>.
## At a glance
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Line of work</td>
		<td>Exists now</td>
		<td>Biggest gap</td>
		<td>Owners to involve</td>
		<td>It worked when</td>
	</tr>
	<tr>
		<td>**Comps per channel**</td>
		<td>One sample set of similar homes `SIMULATED`, read by the wizard, tips and Performance</td>
		<td>A real, private, per-channel dataset the host can inspect</td>
		<td>Data · ML · Legal · Integrations</td>
		<td>Tips backed by similar homes are accepted and kept</td>
	</tr>
	<tr>
		<td>**A deeper Knowledge Hub**</td>
		<td>Questions, Insights, Facts and Sources, as a concept on demo data</td>
		<td>Real Inbox questions, faithful answers only, a Hub that knows its workflows</td>
		<td>AI/ML · Integrations · Messaging and Operations PMs · Support</td>
		<td>More guest questions answered from confirmed facts; zero unsupported claims</td>
	</tr>
	<tr>
		<td>**Performance, done thoroughly**</td>
		<td>Before vs since, eight cards, four charts `SIMULATED`</td>
		<td>A fair reading, what changed when, and the lever behind each number</td>
		<td>Data · Integrations · ML · Research · Support</td>
		<td>Hosts read the verdict right; bookings and requests rise against each listing's own weeks before</td>
	</tr>
	<tr>
		<td>**Tips across Hospitable**</td>
		<td>Tips on channel pages; a Hub question shows the tips that use its facts</td>
		<td>One tip contract any area can raise</td>
		<td>Design system · area PMs · ML · Support · Legal</td>
		<td>Tips accepted in each area, with Undo flat</td>
	</tr>
</table>
## 1 · Comps: similar homes, per channel
**Exists now.** Similar homes are the quiet engine of the build. The strategy wizard quotes their price range and how many use each cancellation policy; a tip's "Strategy" bullet cites them ("8 of 24 similar homes state the speed in The space"); five Performance cards carry a "Similar homes" line, two of them a fixed stand-in. All of it reads one sample: 24 homes within 1.5 km with 2 guests and 1 bedroom, the host's own units excluded `SIMULATED`. No screen shows the host which homes those are.
**What's missing.**
- **A data basis.** Comps live in point tools such as AirDNA and PriceLabs today, outside the PMS (`REAL·PUBLIC`, <mention-page url="https://app.notion.com/p/3eee18af164581a68ccdf6e48d114553">Competitive analysis</mention-page>). Whether Hospitable may use what it sees across listings is a Legal question first.
- **"Similar" per channel.** Each channel shares different signals, so one comp set can't serve Airbnb, Booking⁠.com and Direct alike.
- **Privacy by design:** aggregates only, a minimum group size, never another host's text.
- **A comp set the host can see and challenge** ("that home isn't like mine"), with its date range, because comps move with the season.
- **A distinctiveness check,** so tips framed by comps don't make every listing in a neighbourhood sound alike (<mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page>).
<table header-row="true" fit-page-width="true">
	<tr>
		<td>How I'd run it</td>
		<td>Who</td>
		<td>What it produces</td>
	</tr>
	<tr>
		<td>1. Agree the data basis and the privacy rules: aggregates only, a minimum group size, an opt-out</td>
		<td>Legal · Data</td>
		<td>A one-page data policy, before any design</td>
	</tr>
	<tr>
		<td>2. Define "similar" per channel (size, guests, distance, amenities, audience) and the measures each channel shares</td>
		<td>Data · ML · Integrations</td>
		<td>A similarity model and a measure list per channel</td>
	</tr>
	<tr>
		<td>3. Show hosts their comp set and ask whether these are homes like theirs</td>
		<td>Research, in the planned think-aloud rounds</td>
		<td>Evidence that the set is credible, or how to fix it</td>
	</tr>
	<tr>
		<td>4. Make "Similar homes" an inspectable source: the bullet in a tip's why opens the group's definition and dates</td>
		<td>Design system · Engineering</td>
		<td>A Source pattern any area can reuse</td>
	</tr>
	<tr>
		<td>5. Check distinctiveness before a comps-framed tip is offered</td>
		<td>ML · Content design</td>
		<td>A guardrail in the tip pipeline</td>
	</tr>
	<tr>
		<td>6. Feed the same dataset to Performance as a market line</td>
		<td>Data</td>
		<td>The fair reading in section 3</td>
	</tr>
</table>
**It worked when** tips backed by similar homes are accepted and kept (tip acceptance next to AI copy reverted), hosts agree the comp set looks like their home, and no comp group falls under the minimum size. The last two have no measure yet.
## 2 · Knowledge Hub: from guests' questions to a better listing
**Exists now** (Done, as a concept). The Hub's job is guests' questions. It has Questions, Insights, Facts and Sources (<mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page>). Questions are grouped by Hospitable's nine topics (`REAL·PRODUCT`), counted per channel and marked answered or not. Facts are read from the Listing base, never copied. Copilot answers guests only from what backs an answer, otherwise it asks the host, and a gap becomes a tip whose accepted answer goes into the Listing base. Questions, counts and answers are scripted demo data (`SIMULATED`), and adding a document on Sources is a preview. The stakes are real: today the Hub keeps its own copy of the listing, which later edits don't reach, and on a trial listing Ask the AI said the flat is wheelchair accessible with nothing behind it (`REAL·PRODUCT`, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>).
**What's missing** (Planned). It is marked Concept in the prototype for a reason: there are many ways to evolve it. Three directions matter most.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Direction</td>
		<td>What it means for the host</td>
		<td>What it needs underneath</td>
	</tr>
	<tr>
		<td>**Real Inbox questions**</td>
		<td>Every guest question from the Inbox is collected, grouped by topic, counted per channel and over time, and marked answered or not. Built today on scripted questions. Next: read real conversations, and let a frequent or unanswered question raise a tip, with the questions as its why.</td>
		<td>Inbox as a source; Legal on using past conversations; the tip contract in section 4</td>
	</tr>
	<tr>
		<td>**Faithful answers only**</td>
		<td>Copilot answers guests only from listing details and from Facts the host wrote or confirmed. When nothing backs an answer, it says so and asks the host, and the host's answer is saved where it belongs: a listing detail in the Base, a situation in the Hub. A guidebook or other document comes in as candidate facts the host confirms, never trusted unseen. Each fact shows when it was last confirmed.</td>
		<td>A typed-fact model the Hub reads from the Base; a named owner for the amenity list; an offline evaluation set for unsupported claims</td>
	</tr>
	<tr>
		<td>**Knows its workflows**</td>
		<td>Each fact knows which automated messages, tasks and workflows use it. Changing check-out time shows, before Save, the messages and cleaning tasks it changes. Workflows become working flows that read facts, not a gallery.</td>
		<td>Messaging, Operations and the Hub agreeing on one fact reference</td>
	</tr>
</table>
<table header-row="true" fit-page-width="true">
	<tr>
		<td>How I'd run it</td>
		<td>Who</td>
		<td>What it produces</td>
	</tr>
	<tr>
		<td>1. Audit real Hubs on a sample of properties: fact types, conflicts with Details, unanswered questions, stale facts</td>
		<td>Data · AI/ML</td>
		<td>The baseline</td>
	</tr>
	<tr>
		<td>2. Define the typed-fact model and its link to the Base; name the amenity list's owner</td>
		<td>AI/ML · Integrations · Head of Product</td>
		<td>One fact model for the Hub, the Base and the channels</td>
	</tr>
	<tr>
		<td>3. Map which messages, tasks and workflows read which facts</td>
		<td>Messaging and Operations PMs · Engineering</td>
		<td>The index behind "what else changes"</td>
	</tr>
	<tr>
		<td>4. Design freshness, conflicts and "what else changes"; test them with hosts</td>
		<td>Design · Research</td>
		<td>Tested flows</td>
	</tr>
	<tr>
		<td>5. Build the gap-to-tip loop, grounded only in confirmed facts</td>
		<td>AI/ML · Content design</td>
		<td>Hub tips in the same card and panel</td>
	</tr>
	<tr>
		<td>6. Version the Knowledge Hub API; keep today's sentence view for one release</td>
		<td>AI/ML · Integrations</td>
		<td>No partner or agent broken by typed facts</td>
	</tr>
	<tr>
		<td>7. Brief Support; migrate existing hosts with a reconcile step, opt-in per property</td>
		<td>Support · Head of Product</td>
		<td>The Hub's own copy is retired without a silent merge</td>
	</tr>
</table>
**It worked when** more guest questions are answered from confirmed facts (the Hub already marks each one answered, partly answered or not; no baseline yet), unsupported claims stay at zero in the offline evaluation set, and a change touches fewer places. Guardrails: Undo rate, overwrite incidents.
## 3 · Performance: what to measure, and how to show it over time
**Exists now** (prototype, figures `SIMULATED`, <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>):
- One channel at a time, against the same number of days before its strategy started (<mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>). Period: since the strategy started, or the last 30 or 90 days once it has run longer.
- A one-line summary, eight cards (occupancy, nightly rate, RevPAR, revenue, next 30 nights booked, lead time, views → bookings, average rating) and four charts with the stretch before in grey and one marker where the strategy started.
- Under a week, results are held back. Airbnb and Booking⁠.com don't share page views, so that card says "Not shared".
- No recommendations on the page, by choice: Performance reports, tips act.
**What's missing.**
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Gap</td>
		<td>Why it matters</td>
		<td>What I'd add</td>
	</tr>
	<tr>
		<td>**A fair reading**</td>
		<td>Before vs since mixes the strategy with season and the market, so a host can read noise as proof</td>
		<td>A fair-comparison rule and a minimum run per measure, agreed with Data. A verdict in words: Better than before · About the same · Not enough data yet</td>
	</tr>
	<tr>
		<td>**The goal on the page**</td>
		<td>The first goal is bookings and booking requests against the listing's own weeks before, but no card shows it, and requests don't appear at all</td>
		<td>A first card for bookings and requests, read against the weeks before</td>
	</tr>
	<tr>
		<td>**The market**</td>
		<td>Without similar homes on the same weeks, "occupancy up" can't separate the host's change from the market's</td>
		<td>A market line on every chart, from the comps dataset (section 1)</td>
	</tr>
	<tr>
		<td>**What changed, when**</td>
		<td>One marker for the strategy start, none for the changes after it</td>
		<td>A tick for every saved change and accepted tip, read from the receipts; each tick opens its receipt</td>
	</tr>
	<tr>
		<td>**Leading before lagging**</td>
		<td>Occupancy and revenue arrive a lead time after the change that caused them</td>
		<td>Order measures by how soon they can move: next 30 nights booked and views → bookings first, rating last</td>
	</tr>
	<tr>
		<td>**From number to lever**</td>
		<td>A host sees a drop and doesn't know which page to open</td>
		<td>Each measure names its lever and links to the channel page whose tips pull it. Copilot answers "why did Airbnb bookings drop?" and opens the tip (Roadmap, next)</td>
	</tr>
	<tr>
		<td>**Strategy periods**</td>
		<td>Only "since the strategy started" can be read</td>
		<td>Each strategy change starts a period; equal periods compared on one channel</td>
	</tr>
	<tr>
		<td>**Cause, told honestly**</td>
		<td>One property can't prove what one tip did</td>
		<td>Sequential tests per tip type across many properties (switchbacks, a held-out group). Hosts see what changed, never a claimed cause</td>
	</tr>
	<tr>
		<td>**Data per channel**</td>
		<td>Which measures each channel shares isn't confirmed</td>
		<td>An inventory with Integrations; a measure a channel keeps says so, as views already do</td>
	</tr>
</table>
**Measures a host can act on.** A measure earns a place when it points at something the host can change.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Measure</td>
		<td>What it tells the host</td>
		<td>The lever</td>
		<td>Where the lever lives</td>
		<td>How soon it can move</td>
	</tr>
	<tr>
		<td>Next 30 nights booked</td>
		<td>Demand ahead of the calendar</td>
		<td>Price, minimum stay, title and photos</td>
		<td>Channel › Pricing, Availability, Listing</td>
		<td>First</td>
	</tr>
	<tr>
		<td>Views → bookings, where shared</td>
		<td>Whether the page turns visits into bookings</td>
		<td>Title, photos, description, the price shown</td>
		<td>Channel › Listing</td>
		<td>Early</td>
	</tr>
	<tr>
		<td>Nightly rate vs similar homes</td>
		<td>Price position on that channel</td>
		<td>Nightly price inside the guardrails; money always asks</td>
		<td>Channel › Pricing</td>
		<td>Once new bookings land</td>
	</tr>
	<tr>
		<td>Lead time</td>
		<td>How far ahead guests commit</td>
		<td>Minimum stay, gap rules, last-minute price</td>
		<td>Channel › Availability, Pricing</td>
		<td>Once new bookings land</td>
	</tr>
	<tr>
		<td>Occupancy</td>
		<td>Nights sold</td>
		<td>Price and stay rules</td>
		<td>Channel › Pricing, Availability</td>
		<td>Once stays happen</td>
	</tr>
	<tr>
		<td>Bookings and requests</td>
		<td>The first goal, against the listing's own weeks before</td>
		<td>The strategy's goal, and the tips it raises</td>
		<td>Smart Listings › Strategy</td>
		<td>Over a full strategy period</td>
	</tr>
	<tr>
		<td>Average rating</td>
		<td>Whether the stay matches what was promised</td>
		<td>Accurate facts and listing</td>
		<td>Listing base · Channel › Listing</td>
		<td>Last, after reviews</td>
	</tr>
	<tr>
		<td>Revenue, RevPAR</td>
		<td>Reported, not targeted: season moves them (<mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>)</td>
		<td>Not targeted</td>
		<td></td>
		<td></td>
	</tr>
</table>
**How I'd show it over time** `ASSUMPTION`:
1. One timeline per channel, with strategy periods as bands: the stretch before in grey and the period since in the brand colour, as built.
2. A market line: similar homes over the same weeks.
3. A tick for every saved change and accepted tip, each opening its receipt.
4. A verdict sentence on top that says "Not enough data yet" until the minimum run is met.
5. Leading measures first, lagging ones after.
6. Later, for portfolios: one row per property, each against its own weeks before.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>How I'd run it</td>
		<td>Who</td>
		<td>What it produces</td>
	</tr>
	<tr>
		<td>1. Agree the fair-comparison rule and the minimum run per measure</td>
		<td>Data & analytics lead</td>
		<td>The rule behind the verdict</td>
	</tr>
	<tr>
		<td>2. Inventory what each channel shares: views, conversion, ratings</td>
		<td>Integrations lead</td>
		<td>A measure list per channel</td>
	</tr>
	<tr>
		<td>3. Log every receipt and tip event with its time, field and channel</td>
		<td>Engineering</td>
		<td>The ticks, and the data for everything else (Roadmap, now)</td>
	</tr>
	<tr>
		<td>4. Add the market line</td>
		<td>Data · ML</td>
		<td>Depends on comps (section 1)</td>
	</tr>
	<tr>
		<td>5. Prototype the timeline, verdict and levers; test whether hosts read the verdict right</td>
		<td>Design · Research</td>
		<td>Comprehension, in the rounds of the <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page></td>
	</tr>
	<tr>
		<td>6. Run sequential tests per tip type across portfolios</td>
		<td>Data · ML</td>
		<td>Which tip types help, and where Autopilot may widen (<mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>)</td>
	</tr>
	<tr>
		<td>7. Brief Support on "why did my numbers drop?"</td>
		<td>Support</td>
		<td>One macro, and the same view the host sees</td>
	</tr>
</table>
**It worked when** hosts read the verdict right in testing (comprehension of at least 4 of 5 for 80% of hosts, the bar in Goals & KPIs `PROJECTED`) and bookings and booking requests rise against each listing's own weeks before (the first goal: +5% at 30 days, +7% at 90, `PROJECTED`). Guardrail: no host reads noise as proof, so "Not enough data yet" shows until the rule is met.
## 4 · Tips beyond the listing: one contract, any area
**Exists now.** Tips appear on each channel's Listing, Pricing, Availability and Booking policies, in one panel, one at a time (<mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>). Each why cites the strategy and similar homes, guest questions in the Knowledge Hub, or a Listing base fact (`SIMULATED` content), and a Hub question lists the tips that use its facts. Everything comes from AI Copilot (<mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>). No area outside the listing raises a tip.
**What's missing.** The tip already behaves like a contract: where it lands, the change, its scope, its why with sources, whether money is involved, and Accept, Dismiss, Undo with a receipt. It isn't written down as one, so a second area would build its own card. Also missing: routing (a tip raised in Inbox should open on the field it changes), one tip per change when two areas notice the same thing, a budget so tips don't turn into noise, and Autopilot per tip type. The contract and the areas are drawn in <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hospitable</mention-page>.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>How I'd run it</td>
		<td>Who</td>
		<td>What it produces</td>
	</tr>
	<tr>
		<td>1. Write the tip contract as a design-system pattern and a service other teams call</td>
		<td>Design system · Engineering</td>
		<td>One card, one panel, one API</td>
	</tr>
	<tr>
		<td>2. With each area's PM, list candidate tips: the signal, the change, where it lands</td>
		<td>Inbox, Calendar, Operations PMs · me</td>
		<td>A ranked list per area</td>
	</tr>
	<tr>
		<td>3. Pilot one area outside the listing: Inbox, since guest questions already feed tips</td>
		<td>Inbox PM · AI/ML</td>
		<td>The first tips raised outside the listing</td>
	</tr>
	<tr>
		<td>4. Rank and merge across areas: one change, one tip, all its sources</td>
		<td>ML</td>
		<td>One queue per property</td>
	</tr>
	<tr>
		<td>5. Macros per tip type; AI disclosure wording agreed</td>
		<td>Support · Legal</td>
		<td>Ready before each area launches</td>
	</tr>
	<tr>
		<td>6. Widen Autopilot per tip type only where tests show it helps</td>
		<td>Data · Product</td>
		<td>Autopilot by evidence, money last</td>
	</tr>
</table>
**It worked when** tips are accepted in each new area at about the rate they are on the listing, while Undo and AI copy reverted stay flat and tickets per 100 properties don't rise. Tips dismissed as noise have no measure yet.
## How it was made
Desk work. I traced each capability the prototype implies to the code and sample data behind it, then gave each gap its owners and a measure from <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>. The open questions go to the people in <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hospitable</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
**In the prototype**
- [Performance](https://hospitable-case-web.digimal.studio/property/neukolln/smart/performance?smart=on)
- [Strategy wizard](https://hospitable-case-web.digimal.studio/property/neukolln/smart/wizard?entry=add&from=strategy&smart=on)
- [Knowledge Hub › Questions](https://hospitable-case-web.digimal.studio/property/neukolln/hub/questions)
