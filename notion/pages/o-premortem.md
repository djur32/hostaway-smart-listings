<callout icon="✅" color="gray_bg">
	**Output · Planned** · Imagine it shipped and failed. Seven ways Smart Listings could fail, the early signal for each, the test that catches it, and what I'd do. Every row is `PROJECTED` or `ASSUMPTION`; nothing has shipped.
</callout>
## The short version
- **The premise:** twelve months after launch, Smart Listings didn't work. Hosts didn't trust it, didn't use it, or it broke something. Why?
- The stories are ordered by how badly each would hurt the business result: churn, enterprise deals and support.
- Most are caught by a study already in the <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.
- Three need something built first: an offline check of AI output, a confirmation event per field and channel, and drift detection when a host edits on the channel.
- Thresholds are written now, before any data arrives.
## The failure stories
<table header-row="true">
	<tr>
		<td>What went wrong</td>
		<td>Early signal</td>
		<td>Test that catches it</td>
		<td>What I'd do</td>
	</tr>
	<tr>
		<td>**1 · Smart Listings overwrote something the host cared about.** An Autopilot change replaced a value the host had tuned on Airbnb, and nobody noticed until a guest did.</td>
		<td>Overwrite incidents; undo rate, and how soon after a change</td>
		<td>Pilot rule: no data-loss incident. An event check before the pilot.</td>
		<td>Any incident stops the rollout step. Build drift detection, which doesn't exist. Decide whether support gets a restore beyond Undo.</td>
	</tr>
	<tr>
		<td>**2 · Hosts don't understand channel-first.** They can't say where a fact lives or what a change does on Airbnb. They copy facts into every channel "to be safe", or read the locked "Booking.com only" as a bug.</td>
		<td>Comprehension score; wrong-channel edits; channel values equal to the Base; tickets about the locked description</td>
		<td>Tree test (3 trees), structure A/B, think-aloud probes</td>
		<td>Rework labels. If comprehension still fails after two rounds, mostly for family hosts and hosts new to a PMS, revisit the channel-first menu and test a record-first variant. Check the replica of today's product against real screenshots first, or the A/B leans toward the redesign.</td>
	</tr>
	<tr>
		<td>**3 · The AI says something untrue in public.** A tip or an Autopilot rewrite claims an amenity the home doesn't have, as today's "Ask the AI" did with wheelchair access `REAL·PRODUCT`.</td>
		<td>AI copy reverted or complained about; dismissals by element</td>
		<td>Nothing today. Needed: an offline set of about 200 real listings × tip types, scored for unsupported claims, channel limits and tone. Gate: zero unsupported claims before the pilot `ASSUMPTION`.</td>
		<td>Above 10% reverted, turn that tip type off for that channel. Any channel strike pauses Autopilot for every host.</td>
	</tr>
	<tr>
		<td>**4 · The channels won't take what Hospitable sends.** Rejections, rate limits, or terms against automated content updates.</td>
		<td>Fields rejected per field sent: ≤ 2%, never silent</td>
		<td>Event check on channel sandboxes in the internal rollout step</td>
		<td>Withdraw Autopilot on that channel; tips stay. The confirmation event per field and channel doesn't exist today, so it's the first engineering ask.</td>
	</tr>
	<tr>
		<td>**5 · Smart Listings is ignored.** Some hosts never turn it on; those who do dismiss most tips.</td>
		<td>Opt-in (35% of eligible properties at 6 months `PROJECTED`); acceptance by channel, element and source</td>
		<td>Trust probes in the think-aloud; the pilot</td>
		<td>Stop investing in Autopilot and keep tips light. Report opt-in only for the personas it's on by default for (SEO optimizers and portfolio managers).</td>
	</tr>
	<tr>
		<td>**6 · Lab wins don't survive real use.** Faster in the A/B, no faster in the product.</td>
		<td>Time to adjust in the lab vs in the product, on the same index</td>
		<td>Pilot against a matched holdout</td>
		<td>If the product lags the lab by more than 20 index points `ASSUMPTION`, review the field-level funnel before general release.</td>
	</tr>
	<tr>
		<td>**7 · Hospitable can't learn after launch.** Performance compares a strategy with the stretch before it, and season and price confound that.</td>
		<td>Strategy periods too short to compare; wide ranges on occupancy and revenue</td>
		<td>No test catches it; the screen has to say it</td>
		<td>Give Performance a "not enough data yet" verdict before any host reads a change as proof. The build only holds results back in a strategy's first week. It has no minimum-run rule after that. Saved versions come back only if periods prove unusable.</td>
	</tr>
</table>
## What to build before the first test
1. **Events before features.** A confirmation per field and channel when a change lands, then the tip and undo events. Check each one in the internal step.
2. **A real baseline.** The benchmark of today's product replaces every simulated baseline.
3. **A faithful replica** of today's listing screens for the structure A/B.
4. **An offline AI evaluation set** with the zero-unsupported-claims gate. The one new instrument this page adds.
5. **Override and drift data.** "Edit per channel" usage per field today, and drift detection when a host edits on the channel.
6. **Flags and a holdout.** Per-account flags, a 10% long-term holdout, and Autopilot switchable per channel and per tip type, so each "turn it off" is one switch, not a release.
7. **Legal and channel terms cleared** before Autopilot leaves the pilot: AI copy liability and disclosure, comps under GDPR, channel terms on automated content.
## How a signal becomes a change
- **Weekly:** the dashboard and the unknowns log. Each red guardrail gets an owner; each surprise becomes a probe, an open question, or is closed with a reason.
- **Each test round:** issues by severity, measured against the benchmark. Each change is recorded as a decision and ships behind a flag to the pilot first.
- **Each rollout step:** the decision rules decide ship, iterate or roll back, written down with the numbers that decided it.
- **Each quarter:** time to adjust and tickets against the holdout, and the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>'s kill criteria: keep, change direction, or stop.
## How it was made
A project pre-mortem: assume the launch failed, list why, then give each failure an early signal and a test before it can happen (`REAL·PUBLIC`, [Klein, "Performing a project premortem", HBR](https://hbr.org/2007/09/performing-a-project-premortem)). The original list also covered setup; those stories moved to the Roadmap with the import work.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09">KD-19</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>
**In the prototype**
- [Airbnb listing with Autopilot on](https://hospitable-case-web.digimal.studio/property/neukolln/ch/airbnb/listing?smart=on)
