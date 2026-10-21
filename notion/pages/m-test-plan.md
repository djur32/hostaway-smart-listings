<callout icon="🔭" color="gray_bg">
	**Method · Planned** · Not run. This is how I'd test it. Sample sizes and norms are from public sources; every threshold is . No result exists yet.
</callout>
![What tasks 4 and 7 look like: a tip with its why, accepted, with Undo (here on Airbnb's property name). Live prototype; sample data .](file-upload://3f0e18af-1645-811b-b1b5-00b222df92f3)
## Why this method
- **Benchmark first.** Today's Hostaway is measured with the same tasks before the new design, so "faster" has a "from".
- **One task set, reused everywhere,** from the benchmark to the product, so lab numbers and product numbers sit on one scale.
- **Each study answers one kind of question.** Think-aloud explains why. Unmoderated tests measure how much. The tree test isolates structure. The pilot shows weeks of real use. The rollout shows the business effect.
- **The riskiest change is tested hardest.** The channel-first menu is the biggest change. So the structure gets its own tree test and its own A/B.
## How I'd run it
<table header-row="true">
	<tr>
		<td>Study</td>
		<td>What it answers</td>
		<td>Who · how many</td>
		<td>Decision rule</td>
	</tr>
	<tr>
		<td>**Benchmark of today's product**</td>
		<td>How long today's tasks take, how easy they feel, and today's SUS and CSAT. Sets the index: today = 100.</td>
		<td>Existing Hostaway hosts, from 1–2 to 25+ properties. 40 unmoderated on a seeded trial account, plus 5 moderated sessions for the why.</td>
		<td>Nothing is a target until this has run. Public norms (SUS 68, ease ≈ 5.5 of 7) are reported next to it, never instead.</td>
	</tr>
	<tr>
		<td>**Moderated think-aloud, 2 rounds × 8**</td>
		<td>Why hosts succeed or fail. Can they say where a fact lives and what a change does on each channel? Do they trust a tip?</td>
		<td>2 per persona in each round, new people each round. Remote, 60 minutes, one moderator and one note-taker.</td>
		<td>After round 1, fix the top 3–5 issues by severity × frequency, always. After round 2, go to the pilot only if time to adjust is at index ≤ 75, tasks 1, 2 and 7 reach ≥ 80% success, comprehension is ≥ 4 of 5 for 80%, and ease is ≥ 5.5.</td>
	</tr>
	<tr>
		<td>**Tree test + first-click** (see <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d">Tree testing</mention-page>)</td>
		<td>Is the channel-first menu (Shared, then one group per channel) findable without screens?</td>
		<td>3 trees, 30 each: today's menu, the record-first menu recommended earlier, the menu as built. Plus 40 people on first-click across four screens.</td>
		<td>Channel-first within 5 points of record-first, and ≥ 70% on the channel-specific tasks (Booking.com cleaning fee, Airbnb minimum stay, Airbnb cancellation). Otherwise rework labels before round 1.</td>
	</tr>
	<tr>
		<td>**Structure A/B: today vs channel-first**</td>
		<td>Does Shared + channels make changes faster and less error-prone than "Edit per channel" on each field?</td>
		<td>40 per arm, unmoderated, randomised. Arm A is a click-through replica of today's screens with the same data, so only the structure differs.</td>
		<td>Ship the structure if channel-first is faster overall and no task loses more than 10 points of success. If it loses only on the Knowledge Hub or Booking.com tasks, keep it and rework the Shared labels. If it isn't faster, add record-first as a third arm. 40 per arm can detect about 29% faster; the target is 40%.</td>
	</tr>
	<tr>
		<td>**Pilot with a private Slack channel**</td>
		<td>What weeks of real use look like, and what nobody predicted.</td>
		<td>30 accounts across portfolio sizes, ≥ 2 per persona, for 6 weeks. A Slack Connect channel with design, PM, an integrations engineer and CS; short diary prompts; CSAT after each change sent. Compared with a matched holdout.</td>
		<td>Go to rollout if ≥ 80% are satisfied, ≤ 5% of accepted tips are undone, there is no data-loss incident, and no persona shows a blocker theme. Otherwise extend by two weeks with fixes, or leave a segment out.</td>
	</tr>
	<tr>
		<td>**Rollout with a holdout**</td>
		<td>Does it move time to adjust and support in real use, against hosts who don't have it?</td>
		<td>Internal → pilot → 50/50 by account → release, with 10% held out for 6 months. Sample size comes from the benchmark's spread: not set yet.</td>
		<td>Ship when time to adjust beats the holdout and no guardrail is breached. Iterate if one guardrail breaks in one segment. Roll back on any overwrite incident or silent channel rejection.</td>
	</tr>
	<tr>
		<td>**Accessibility**</td>
		<td>Can hosts using a screen reader or magnifier do the same tasks?</td>
		<td>Expert audit against WCAG 2.2 AA before round 2. 3 sessions with assistive-technology users during the pilot.</td>
		<td>Any severity-3+ issue blocks the next rollout step.</td>
	</tr>
</table>
Every study uses the same questionnaires: ease after each task (1–7), SUS once per study, CSAT at the end (and after each change in the pilot), five comprehension probes and five perceived-control statements. Recruiting goes through Hostaway's in-app research opt-in, CS for large portfolios, the community, and a panel for the unmoderated studies. No incentive depends on positive feedback.
## The tasks hosts would do
Eight tasks, five of them timed: a per-channel fee, a fact changed once, the source of the assistant's Wi-Fi answer, a tip's why, an Airbnb-only rewrite, a strategy, undoing an accepted tip, and Booking.com's own description.
Scenario for everyone: the Neukölln flat in the prototype, on Airbnb, Booking.com and Direct, sleeps 2. Smart Listings is on and Autopilot is off, so tips wait for the host. The benchmark seeds today's product with the same listing.
<details>
<summary>The tasks, one row each</summary>
	<table header-row="true">
		<tr>
			<td>No.</td>
			<td>Task, as read to the host</td>
			<td>Success</td>
			<td>Where it lives in the prototype</td>
			<td>Timed</td>
		</tr>
		<tr>
			<td>1</td>
			<td>"Booking.com guests should pay a €35 cleaning fee. Airbnb stays at €25."</td>
			<td>Booking.com is €35, Airbnb unchanged, saved</td>
			<td>Booking.com › Pricing › Customize for Booking.com</td>
			<td>●</td>
		</tr>
		<tr>
			<td>2</td>
			<td>"Your check-in time is wrong. Make it 4 PM everywhere."</td>
			<td>Changed once, right on every channel</td>
			<td>Shared › Listing base › Details</td>
			<td>●</td>
		</tr>
		<tr>
			<td>3</td>
			<td>"A guest asked about the Wi-Fi. Find what the assistant answers from, and where that came from."</td>
			<td>Finds the fact and names its source</td>
			<td>Knowledge Hub › Facts › Wifi/Internet (read from the Listing base), and Sources</td>
			<td>●</td>
		</tr>
		<tr>
			<td>4</td>
			<td>"There's a suggestion for your Airbnb property name. Decide whether to use it, and tell me why it was suggested."</td>
			<td>Explains the why in their own words; accepts or dismisses on purpose</td>
			<td>Airbnb › Listing › Tips panel</td>
			<td>No</td>
		</tr>
		<tr>
			<td>5</td>
			<td>"On Airbnb, the note about which parts of the flat guests can use sounds too formal. Make it warmer, on Airbnb only."</td>
			<td>Airbnb has its own text; Booking.com and Direct still use the Base</td>
			<td>Airbnb › Listing › Arrival › Guest access › Rewrite with AI</td>
			<td>●</td>
		</tr>
		<tr>
			<td>6</td>
			<td>"You'd like more remote workers on long stays on Airbnb. Set that up."</td>
			<td>Finishes the strategy for Airbnb with that audience</td>
			<td>Smart Listings › Strategy › wizard</td>
			<td>No</td>
		</tr>
		<tr>
			<td>7</td>
			<td>"Accept the suggestion for your Airbnb summary. Then change your mind and undo it. How do you know Airbnb has the old text back?"</td>
			<td>Accepts, undoes, and can say what Airbnb shows now</td>
			<td>Airbnb › Listing › Tips panel (Accepted · Undo), Canvas</td>
			<td>●</td>
		</tr>
		<tr>
			<td>8</td>
			<td>"You want to change your Booking.com description. Go ahead."</td>
			<td>Understands that Booking.com writes it, and that better facts are how to change it</td>
			<td>Booking.com › Listing › Summary, marked "Booking.com only" with a lock</td>
			<td>No</td>
		</tr>
	</table>
</details>
**Time to adjust** is the median time on the five timed tasks, from the prompt to success. A host who gives up is capped at 5 minutes and counted as failed. It's reported per task and as one index.
**Re-scoped from the original plan:** the import and calendar tasks are out. Three tasks follow the build: the home sleeps 2, so the audience is remote workers rather than families; Rewrite with AI shows only on a field without a tip; and Save sends each change straight away, so the undo task starts from an accepted tip.
## The probes, after the task, never during
- **Comprehension (scored 0–5):** "Where does this fact live?" · "What happens on Airbnb if you change it here?" · "If you change the Base cleaning fee now, what happens on Booking.com?" · "Who writes Booking.com's description?" · "What does Undo take back?"
- **Trust and control:** "Why was this suggested? Which channel does it change?" · "Would you let it apply this kind of change by itself? Which kinds never?" · "Tips or Autopilot: which would you pick, and for what?" · "How sure are you Booking.com wasn't changed?" · "Would you trust the assistant to answer guests from this?"
- **Open, last 10 minutes:** "What would you want this to do that it doesn't?" · "What would you still do directly on Airbnb or Booking.com?" Answers go to an unknowns log, reviewed weekly.
## What I'd look for
The riskiest assumptions from <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>, now on real screens:
- Do hosts understand "facts once, channels hold only what differs", or do they copy facts into each channel "to be safe"?
- Is the locked "Booking.com only" understood, or read as a bug?
- Where does trust break: at the tip, when the change is sent, or at the first guest message?
- Do family hosts and hosts new to a PMS want a strategy at all, or only correct facts?
Any belief that the wrong thing went to a channel is at least severity 3: it's the failure the design exists to prevent. The <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d">Tree testing</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af1645810fbe60d21eb29dd3c7">Concept testing</mention-page> plans are part of this programme. Each goal in <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page> names the assumption it tests and the study here that checks it.
## What it produces
- The numbers in <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>.
- The early signals in <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382">Pre-mortem</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924">05 · Design</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458171989df7edc178e5df">Personas</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09">KD-19</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde">KD-03</mention-page>
**In the prototype**
- [the scenario property]()
