<callout icon="📌" color="gray_bg">
	**In one line:** Hostaway asked for the next generation of listing management. This case study takes one of its angles, the intelligent listing, and builds it in depth as **Smart Listings**. Provenance: .
</callout>
## What Hostaway asked
Hostaway is a property management system that connects to Airbnb, Booking.com, Vrbo and its own Direct booking sites. Listing management is where hosts set what guests see on each of them: titles, descriptions, photos, amenities, fees, house rules and booking modes. The core tension: Hostaway is becoming the source of truth for listing data, but it grew outward from its channel integrations, so the switch is incomplete and the sync direction isn't clear in the UI. <columns>
	<column>
		**Four host types, one product surface** - **Family-property host:** one home, doesn't think in "listings", wants it to work.
		- **SEO optimiser:** treats titles and descriptions as an edge, wants per-platform control.
		- **Portfolio manager:** 20+ properties, wants bulk, never wants to touch a single field again.
		- **New-to-PMS host:** used to editing on Airbnb or Booking.com, unsure why a PMS is involved at all.
	</column>
	<column>
		**Three suggested angles** - **A · First-time setup:** connect Airbnb and Booking.com, reconcile what differs, lose nothing.
		- **B · Intelligent listing:** AI-assisted titles, descriptions and strategies per platform, with the right level of control and transparency.
		- **C · Listing optimisation:** nudge listings that are set up once and rarely touched into better configurations.
	</column>
</columns>
## What I chose: Angle B, built as Smart Listings
I chose depth over breadth. So this work takes Angle B and goes deep on it, as a working prototype inside a faithful copy of Hostaway's UI.
- **Listing details live once, in the Listing base:** Details, Pricing and Availability. The Knowledge Hub reads those details without copying them, adds what they don't say (the situations behind a rule), and learns from guests' questions in the inbox.
- **Each channel has its own pages:** Listing, Pricing, Availability and Booking policies. A field uses the Base, is customised for that channel, exists only on that channel (Airbnb's check-in method), or is set by the channel. Booking.com writes its own description from the property's facts, so that field is read-only: it shows "Booking.com only" with a lock whose tooltip says why.
- **Smart Listings is opt-in per property.** A strategy per channel produces tips, each with its why and its sources. The host accepts or dismisses them, or uses Rewrite with AI on a field without a tip.
- **Built on the assistant, not a new AI.** The tips and Rewrite are Hostaway's existing the assistant, expanded from answering business questions to working on the listing. Same sparkle, same purple on lavender, the assistant hosts already know. See <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>.
- **Canvas** shows each channel's guest page, **Performance** shows whether the strategy worked, and **Save** sends each change with a receipt. An accepted tip can be undone.
![The prototype: Airbnb's Listing page. Each field says whether it uses the Base or is customised for Airbnb, and 11 tips are waiting. Prototype screen; the listing content is demo data.](file-upload://3eee18af-1645-8123-b3b8-00b25b91712a)
Start with <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737">Solution overview</mention-page>, or open the prototype below.
## What I didn't do, and why
- **Angle A, first-time setup and import, was planned and not done.** I chose one angle explored thoroughly over several touched lightly, so the time went into Smart Listings. Import is the first next step on the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>. See <mention-page url="https://app.notion.com/p/3eee18af164581b68ba5e7beaa7055ab">KD-01</mention-page>.
- **Angle C, optimisation over time, is the next thing after that.** Performance already shows whether a strategy worked. Optimising continuously builds on it.
- **Not in the prototype:** Vrbo (researched, not built), Guest experience and Operations (placeholders), and the calendar sync engine.
## Deliverables
<table header-row="true">
	<tr>
		<td>Deliverable</td>
		<td>Where</td>
		<td>Status</td>
	</tr>
	<tr>
		<td>Prototype · website</td>
		<td>[hostaway-case-web.digimal.studio]()</td>
		<td>✅ Live. The source of truth for what was built.</td>
	</tr>
	<tr>
		<td>Prototype · mobile app</td>
		<td>[hostaway-case-mobile.digimal.studio]()</td>
		<td>✅ Live. Open it on a phone.</td>
	</tr>
	<tr>
		<td>This Notion workspace</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613">Hostaway · Smart Listings</mention-page></td>
		<td>✅ Methods and outputs per stage, with a decision log</td>
	</tr>
	<tr>
		<td>Deck</td>
		<td>Not yet linked</td>
		<td>—</td>
	</tr>
	<tr>
		<td>Loom</td>
		<td>Not linked yet</td>
		<td>Not recorded yet</td>
	</tr>
</table>
## Where the brief's six lenses are answered
<table header-row="true">
	<tr>
		<td>The brief looks for</td>
		<td>Where to see it</td>
	</tr>
	<tr>
		<td>Depth over breadth</td>
		<td>This page, <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737">Solution overview</mention-page></td>
	</tr>
	<tr>
		<td>Systems thinking</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page></td>
	</tr>
	<tr>
		<td>Comfort with ambiguity</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382">Pre-mortem</mention-page></td>
	</tr>
	<tr>
		<td>Articulation of reasoning</td>
		<td><mention-database url="https://app.notion.com/p/bdf268a39a0b413896f5084bd66df2e6">Decision log</mention-database>, <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page></td>
	</tr>
	<tr>
		<td>Awareness of real-world constraints</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page></td>
	</tr>
	<tr>
		<td>There is always a next thing</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page></td>
	</tr>
</table>
## How to read a page
🔭 marks a method and ✅ an output. The first line of every page gives its status:
<table header-row="true">
	<tr>
		<td>Seen on</td>
		<td>Status</td>
		<td>Means</td>
	</tr>
	<tr>
		<td>Methods and outputs</td>
		<td>**Done**</td>
		<td>Real work on real sources: the brief, the product (screenshots, trial account), public docs, the prototype.</td>
	</tr>
	<tr>
		<td>Research outputs</td>
		<td>**Sampled**</td>
		<td>A labelled sample standing in for research I'd run with real hosts. It is not evidence.</td>
	</tr>
	<tr>
		<td>Methods not run, plus the test and roadmap outputs</td>
		<td>**Planned**</td>
		<td>Not run. The page says how I'd run it and what I'd look for. No results.</td>
	</tr>
</table>
Every chart, quote and number also carries its provenance: (with a URL) · . Interviews, the data review, the tree test and the concept test were not run with real hosts.
<details>
<summary>**The brief, verbatim (sections 1–6)**</summary>
	### 1. Introduction
	Welcome, and thank you for investing time in this exercise. This case study is designed to mirror a real, high-stakes design challenge you would face as Head of Design at Hostaway. There is no single correct answer — we're evaluating how you think, how deeply you can go on a subject, what angles you choose and why, and how you communicate your reasoning.
	Hostaway is a property management system (PMS) for short-term rental hosts. We connect to major booking platforms — Airbnb, Vrbo, Booking.com, and Direct — our own direct booking website product — and act as the central hub for managing properties, calendars, pricing, messaging, and listings.
	Listing management is the area where hosts configure what guests see on each booking platform: titles, descriptions, photos, amenities, fees, house rules, booking modes, and more. It is also one of the most complex and tension-filled areas of our product.
	### 2. Context: What Hostaway Is and Where It Came From
	Hostaway started as a messaging automation tool (originally called Smartbnb) and evolved into a full PMS. Unlike competitors who built listing management first and added channel connectivity later, Hostaway built outward from OTA integrations. This means:
	- We have deep, native connections to Airbnb, Booking.com, Vrbo, and our own Direct booking product.
	- Our users' property profiles are already optimized for major platforms.
	- But our listing management layer was built on top of these integrations, not as a standalone source of truth from day one.
	This origin story creates a fundamental design tension: Hostaway is becoming the source of truth for listing data, but it wasn't always, and the transition is incomplete.
	#### Key architectural concepts
	- **Property** = a container representing a single physical property. It groups one or more platform-specific listings.
	- **Listing** = a platform-specific representation of a property (e.g., one Airbnb listing + one Booking.com listing + one Direct site = one property with three listings).
	Hostaway currently pulls listing details from connected platforms on import, then aims to push changes back as the central source of truth — but this sync direction is not yet fully established or communicated in the UI.
	### 3. The Problem Space
	Listing management at Hostaway sits at the intersection of several compounding tensions. Your case study should engage with as many of these as you find productive.
	#### 3.3 Users have wildly different mental models
	User research (conducted internally) revealed a wide spectrum of hosts:
	- **The family-property host:** Manages one property, doesn't think in terms of "listings" vs "properties," just wants things to work.
	- **The SEO optimizer:** Obsesses over titles and descriptions, wants per-platform control, treats listing copy as a competitive advantage.
	- **The portfolio manager:** Has 20+ properties, wants bulk operations, doesn't want to touch individual fields ever again.
	- **The new-to-PMS host:** Previously managed everything directly on Airbnb/BdC, doesn't understand why Hostaway needs to be involved in listing details at all.
	These users have fundamentally different expectations of what "listing management" means, and they all land on the same product surface.
	#### 3.4 Listings are configured once — but the UX still matters enormously
	Internally, there's a tension around investment in listing management UX:
	- Listings are typically set up once and rarely changed. This makes it hard to justify heavy UX investment based on traffic metrics alone.
	- But the initial setup experience is where hosts form their impression of Hostaway's competence and completeness. A confusing or incomplete listing management experience drives churn, delays enterprise deals, and creates support burden.
	Sales data (from Gong analysis across 618 calls and 457 accounts) shows listing management issues are a top theme in sales conversations, including: systemic data synchronization failures, calendar sync lags causing double bookings, connection errors preventing listings from going live, and pricing not syncing as expected.
	#### 3.5 Competitive context
	Many competitors treat channel management as a "cost center" — a necessary evil that doesn't differentiate. Hostaway's internal thesis is the opposite: that listing management done well is a competitive advantage, especially as AI opens new possibilities for per-platform optimization.
	### 4. Your Brief
	As a Staff Product Designer at Hostaway, you've been asked to lead the design vision for the next generation of listing management. Choose one or two of the following angles (or propose your own) and go deep.
	#### Suggested angles
	**Angle A — The First-Time Setup Experience**
	A host just connected their Airbnb and Booking.com accounts. They have different descriptions, different photos, and different cleaning fees on each. Design the onboarding experience that establishes Hostaway as the source of truth without overwhelming the user or losing data they care about.
	**Angle B — The "Intelligent Listing" Vision**
	If we remove the constraint of "one field to rule them all" and instead imagine AI-assisted, per-platform listing optimization — what does that product look like? How does a host interact with a system that generates platform-specific titles, descriptions, and strategies? What level of control and transparency is needed?
	**Angle C — The "Listing optimization" Vision**
	Listings are typically set up once and rarely changed. How can we challenge that to nudge listings into more performant configurations?
	#### What we're looking for
	- **Depth over breadth.** We'd rather see one angle explored thoroughly than all five touched superficially. We want to see how obsessive you can be about a particular problem.
	- **Systems thinking.** How does your proposal connect to the broader product? What are the second-order effects?
	- **Comfort with ambiguity.** There is no single right answer. We want to see how you navigate trade-offs and make decisions with incomplete information.
	- **Articulation of reasoning.** We care as much about *why* you made a choice as *what* you chose.
	- **Awareness of real-world constraints.** Platform restrictions are real. Users are diverse. The product has history. Show that you can design within a complex system, not in a vacuum.
	- **There is always a next thing.** We value designers who, after solving a problem, immediately see the next opportunity or question. Show us where your thinking leads.
	### 5. Deliverables
	- A **Loom recording** (recommended 25 minutes, ≤ 45 minutes) presenting your thinking, process, and proposals. Walk us through your reasoning as if presenting to the leadership team (de facto: you would be).
	- **Supporting artifacts (in Notion)** — whatever best communicates your thinking: wireframes, flows, diagrams, written rationale, research synthesis. Fidelity is your choice; clarity is what matters.
	### 6. Resources
	You have access to the following to inform your work:
	- Screenshots from the current product
	- This brief and all the context within it.
	- Hostaway product — sign up for a free trial at hostaway.com and explore the listing management experience firsthand. You may need to create a listing on Airbnb if you don't have one already — or create it from Hostaway!
	- Public Help Center articles on listing management (available at help.hostaway.com).
	- Airbnb, Booking.com, and Vrbo public documentation on how they handle listing data.
	You do not need to solve every problem. You do need to show us how you think about one of them with the depth, rigor, and taste that a Staff Product Designer brings to the table.
	*Note: the original's numbering jumps from 3 to 3.3; nothing is missing.* {color="gray"}
</details>
---
**Feeds**
- → <mention-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8">01 · Discovery</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581b68ba5e7beaa7055ab">KD-01</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
