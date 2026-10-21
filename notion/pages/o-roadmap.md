<callout icon="✅" color="gray_bg">
	**Output · Planned** · What comes after the prototype, in three horizons. Each item names the goal and the measure it should move; an item that moves none isn't on the list. Nothing here is scheduled or measured. Targets baselines .
</callout>
## The short version
- **Now:** test and harden Smart Listings, and build the measurement it needs.
- **Next:** Angle A, import and first-time setup, built on the same Listing base and channel model. It gets its own north star: confirmed-live rate in 7 days.
- **Later:** Angle C, optimisation over time. Strategy periods first, then fair sequential tests, then Autopilot widening only where tests show it helps.
- **Four lines of work the build implies but doesn't finish** are placed below: Performance done thoroughly starts now; similar homes per channel, a deeper Knowledge Hub and tips raised from Inbox, reviews and Calendar come next; tips from Devices, Operations and portfolios come later. How each would run: <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>. How the areas connect: <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hostaway</mention-page>.
- Five kill criteria are written now, so no decision is made after the result is known.
- No revenue uplift is claimed: the first goal is more bookings and booking requests per listing against its own weeks before (+5% at 30 days, +7% at 90), not revenue. The only forward numbers are the projections in <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>.
## Now · test and harden Smart Listings
<table header-row="true">
	<tr>
		<td>Item</td>
		<td>Goal</td>
		<td>Measure it should move</td>
		<td>Guardrail</td>
	</tr>
	<tr>
		<td>Run the programme in <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>: benchmark, two think-aloud rounds, tree test, structure A/B, pilot</td>
		<td>Change once · Trust</td>
		<td>Time to adjust; comprehension</td>
		<td>Accessibility</td>
	</tr>
	<tr>
		<td>Build the measurement first: a confirmation per field and channel, tip and undo events, flags, a 10% holdout</td>
		<td>All</td>
		<td>Makes time to adjust measurable in the product</td>
		<td>None</td>
	</tr>
	<tr>
		<td>Harden the AI: an offline evaluation set with zero unsupported claims; Autopilot switchable per channel and per tip type</td>
		<td>Trust</td>
		<td>Tip acceptance</td>
		<td>AI copy reverted; unsupported claims</td>
	</tr>
	<tr>
		<td>Harden the model: fix what the rounds find in Shared and the channel pages (uses the Base, customised, only on one channel, set by the channel)</td>
		<td>Change once</td>
		<td>Time to adjust; wrong-channel edits</td>
		<td>Facts copied "to be safe"</td>
	</tr>
	<tr>
		<td>**Performance, done thoroughly, first part:** a fair-comparison rule and minimum run agreed with Data, a "Not enough data yet" verdict, bookings and requests (the first goal) on the page, and every receipt and tip event logged. See <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page></td>
		<td>Trust</td>
		<td>Hosts read the verdict right (comprehension)</td>
		<td>No host reads noise as proof</td>
	</tr>
</table>
## Next · Angle A, import and first-time setup
Planned and not done in this case study (see <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953">00 · Brief & scope</mention-page>). It builds on the same model: import fills the Listing base once, each channel keeps only what differs, and go-live ends with every channel confirmed. **Goal: set up with confidence.** "I can see what Hostaway took from my channels, fix what's different, and know it's live."
<table header-row="true">
	<tr>
		<td>Set-up measure</td>
		<td>Baseline</td>
		<td>Target</td>
	</tr>
	<tr>
		<td>**Confirmed-live rate in 7 days** (north star of this release): new properties where every connected channel was reviewed and sent with a confirmation, or confirmed unchanged, within 7 days</td>
		<td>17% ever send a first change to a channel; "confirmed" can't be measured today </td>
		<td>45% (band 30–55%) </td>
	</tr>
	<tr>
		<td>Import reviewed within 24 hours</td>
		<td>29% </td>
		<td>65% </td>
	</tr>
	<tr>
		<td>"Did Hostaway get your listing right?" = Yes</td>
		<td>56% overall, 21% at 25+ </td>
		<td>75% overall, 55% at 25+ </td>
	</tr>
	<tr>
		<td>Trial → paid</td>
		<td>22.7% </td>
		<td>25.7% </td>
	</tr>
</table>
Why it's the north star there, and not now: setup is where hosts judge Hostaway's competence (), and it can't be gamed by sending without reviewing. Guardrails: setup time ≤ 15 minutes median; overwrite incidents → 0.
Also next:
- **One the assistant across the product:** ask the assistant about a listing ("why did Airbnb bookings drop?") and it answers from Performance and opens the tip that fixes it, citing the same Listing base facts and guest questions as the tips. Measure: tip acceptance; guardrail: unsupported claims. <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
- **Migrate existing hosts** with the same flow, opt-in per property, never a silent merge. Today the Knowledge Hub keeps its own copy of the listing, which drifts from Details by design, so its copy is retired, not merged .
- **Drift:** show when a host has edited on Airbnb directly. Measure: changes confirmed on the channel; guardrail: overwrite incidents.
- **More tip sources** (Inbox questions, reviews), and Booking.com's "what your facts will produce". Measure: tip acceptance, completeness per channel.
- **A canonical amenity list with an owner,** and a versioned Knowledge Hub API. Measure: places touched per change; guardrail: rejections.
- **Similar homes per channel:** a real dataset per channel, aggregates only with a minimum group size, that the host can inspect. Legal and Data from the first day. Measure: acceptance of tips backed by similar homes; guardrail: AI copy reverted. <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
- **A deeper Knowledge Hub:** real guest questions from the Inbox, counted per channel and over time; answers only from listing details and Facts the host wrote or confirmed, never a guess; facts that know which messages, tasks and workflows use them; frequent or unanswered questions arriving as tips. Measure: guest questions answered from confirmed facts; guardrail: unsupported claims. <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
- **Performance over time:** strategy periods as bands, a tick for every saved change and accepted tip, a market line from similar homes, and each measure tied to the page where its lever lives. Measure: bookings and requests against each listing's own weeks before; guardrail: no host reads noise as proof. <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
- **One tip contract across Hostaway:** the tip card written down as a design-system pattern and a service, piloted in Inbox, then reviews and Calendar. Measure: tip acceptance per area; guardrail: Undo rate. <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hostaway</mention-page>
## Later · Angle C, optimisation over time
1. **Already in the prototype:** Performance compares a channel's strategy with the same number of days before it started.
2. **Strategy periods:** each strategy change starts a new period in the change log, and Performance compares equal periods on one channel. Bookings and booking requests against the listing's own weeks before is the first goal (<mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>); absolute occupancy, revenue and views are reported, not targeted.
3. **Sequential tests:** switchbacks on one property, or a held-out group across a portfolio, with a minimum run and a "not enough data yet" verdict. Quality check: tip acceptance next to AI copy reverted.
4. **Autopilot widens per section** only where tests show it helps: text and photo order today, stay rules next, money last, always inside guardrails.
Also later: strategies and rules for whole portfolios; typed facts feeding Google, Operations, Devices and the API; tips raised by Devices, Operations and portfolios on the same tip contract, and Dynamic Pricing reading the strategy's goal (<mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hostaway</mention-page>); the six design-system patterns reused outside listings.
**Why no versions.** Versions were removed because they were a concept to learn before any payoff. A strategy period is what a host already says ("since I changed the strategy"). Saved versions come back only if periods prove too short for hosts who edit every week.
## Kill and change criteria
<table header-row="true">
	<tr>
		<td>Signal</td>
		<td>Threshold</td>
		<td>What I'd do</td>
	</tr>
	<tr>
		<td>Hosts can't say where a fact lives or what a change does on Airbnb</td>
		<td>Comprehension under 4 of 5 for 80% after two rounds, mostly family hosts and hosts new to a PMS</td>
		<td>Revisit the channel-first menu; test a record-first variant in the A/B</td>
	</tr>
	<tr>
		<td>Hosts keep text different per channel as often as money</td>
		<td>Text overrides at about the rate of fee and stay-rule overrides, in real "Edit per channel" data</td>
		<td>"A channel's own voice is a choice" is wrong; per-channel text becomes the default</td>
	</tr>
	<tr>
		<td>Smart Listings isn't used, or tips aren't trusted</td>
		<td>Well under the targets (35% opt-in at 6 months; 40% acceptance at 90 days) for two quarters</td>
		<td>Stop investing in Autopilot; keep tips as a light aid</td>
	</tr>
	<tr>
		<td>AI copy is reverted, or a channel strikes a listing</td>
		<td>Reverted above 10% of accepted, or any strike traced to AI copy</td>
		<td>Pause Autopilot for every host until the guardrail is fixed</td>
	</tr>
	<tr>
		<td>Channel terms forbid automated content updates</td>
		<td>Any channel</td>
		<td>Withdraw Autopilot on that channel; tips stay</td>
	</tr>
</table>
## What to ask stakeholders first
- **Which fields can Hostaway write on each channel, and do its terms allow automated content updates?** (Integrations engineering lead) This decides import and how far Autopilot can go.
- **Can the Knowledge Hub read typed facts from the Base instead of keeping its own copy?** (AI/ML lead) This decides whether "facts once" holds beyond the prototype.
- **How is "Edit per channel" used per field, and what is the minimum period for a fair comparison?** (Data & analytics lead) This decides the text-versus-money kill criterion and when strategy periods can be read.
The full plan, with who and what I'd ask each: <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page>
## How it was made
Desk work on the prototype, the test plan and the second-order effects. Every item names a measure from <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>; thresholds are written before any data.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ca9ab6d4324a44d082">Smart Listings across Hostaway</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382">Pre-mortem</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>
**Feeds**
- <mention-database url="https://app.notion.com/p/bdf268a39a0b413896f5084bd66df2e6">Decision log</mention-database>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581b68ba5e7beaa7055ab">KD-01</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>
**In the prototype**
- [Smart Listings › Performance]()
