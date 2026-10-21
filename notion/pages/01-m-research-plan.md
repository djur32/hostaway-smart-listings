<callout icon="🔭" color="gray_bg">
	**Method · Planned** · Not run. This is the research plan I'd run for Smart Listings with Hospitable's teams and hosts: four stages, data first, then people. Provenance: `ASSUMPTION` (the plan itself).
</callout>
## Why this plan
I already had a direction for Smart Listings, and a direction makes it easy to go looking for agreement. So the plan is built around what would prove me wrong. Data comes first, because exports need no recruiting and they show what hosts actually do. Hosts come second, so the interviews explain a pattern instead of guessing one. Hosts can be simulated to show the method. What Hospitable's own teams know never is: those answers stay as 19 open questions, each with an owner. <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
## The four stages
<table header-row="true">
	<tr>
		<td>Stage</td>
		<td>What happens</td>
		<td>The main questions it answers</td>
	</tr>
	<tr>
		<td>**Prep** · Get ready</td>
		<td>Kick-off · Assumption mapping · Data access · Recruiting</td>
		<td>Which assumptions would sink the design if wrong?</td>
	</tr>
	<tr>
		<td>**Week 1** · Data and teams</td>
		<td>Sales call analysis (Gong) · Ticket analysis · Field override usage · Knowledge Hub usage · Stakeholder interviews</td>
		<td>For each channel, what can Hospitable write, how fast does it go live, and what does the channel overwrite? Which performance signals exist for each listing?</td>
	</tr>
	<tr>
		<td>**Weeks 2 and 3** · Hosts</td>
		<td>User interviews, about 25</td>
		<td>When do hosts trust an AI suggestion? Where do hosts expect to find listing content?</td>
	</tr>
	<tr>
		<td>**Week 4** · Synthesis</td>
		<td>Cluster analysis · Affinity mapping · The readout</td>
		<td>Which pains share a cause, and which do I design for?</td>
	</tr>
</table>
Each stage ends with a check. After prep: are the riskiest assumptions still the riskiest once engineering and CS have scored them? After week 1: a one-page data readout sharpens the interview guide. After week 2: has each persona been heard enough, or do I add sessions? Week 4 ends with the readout of insights and the problem to design for.
## Who and how many
<table header-row="true">
	<tr>
		<td>Method</td>
		<td>Sample</td>
		<td>Page</td>
	</tr>
	<tr>
		<td>Stakeholder interviews</td>
		<td>10 roles, 30 minutes each, with each role's open questions sent ahead</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page></td>
	</tr>
	<tr>
		<td>Sales calls, tickets, usage</td>
		<td>618 calls across 457 accounts `REAL·BRIEF`, a stratified 60 listened to (15 per portfolio size). 12 months of tickets: a random 300 tagged listing, sync or connection, plus 100 untagged. Field overrides and Knowledge Hub usage by portfolio size.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12">Data review</mention-page></td>
	</tr>
	<tr>
		<td>User interviews</td>
		<td>About 25 hosts across the four personas (Family host, SEO optimiser, Portfolio manager, New to a PMS) and hosts who left, recruited by behaviour with a screener</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">User interviews</mention-page></td>
	</tr>
</table>
**Known bias.** Tickets, sales calls and CS referrals over-represent hosts who had problems, and larger accounts. So interviews also recruit in-app, to hear hosts for whom it just worked.
**Recruiting.** An in-app banner on Properties for new accounts, CS referrals (capped, so problem cases don't dominate), the churned list from the CS lead, Sales introductions for enterprise evaluators, Hospitable's host community channels, and a recruiting panel as the fallback. Incentives are proposed, not confirmed: a gift card or subscription credit for an hour-long interview,  `ASSUMPTION` until Marketing confirms the policy.
## The 19 open questions
What only Hospitable's teams can answer. None is answered, and none is simulated. Each would go out in prep or week 1, to the owner named here. Two belong to import, which is on the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>, and are kept here so they aren't lost.
<table header-row="true">
	<tr>
		<td>Question</td>
		<td>What I'd ask</td>
		<td>Owner</td>
	</tr>
	<tr>
		<td>Listing text: API limit or Hospitable's choice?</td>
		<td>Some text is never pushed, and a channel can write its own description. Is that an API limit or a Hospitable choice, for every property type? Which structured fields feed its description, so better facts give better copy?</td>
		<td>Integrations engineering lead</td>
	</tr>
	<tr>
		<td>Field write limits for partners</td>
		<td>For every channel (Airbnb, Booking.com, Vrbo, Expedia, Direct), which listing fields are read-only or restricted for API partners (title, description sections, photo order, amenities, house rules), how long does a write take to go live, and what does the channel overwrite?</td>
		<td>Integrations engineering lead</td>
	</tr>
	<tr>
		<td>Drift detection</td>
		<td>When a host edits a listing directly on a channel, does Hospitable get a webhook or poll? Per field or per listing? With what lag?</td>
		<td>Integrations engineering lead</td>
	</tr>
	<tr>
		<td>Share of listing and sync tickets</td>
		<td>What share of tickets in the last 12 months are about listings, sync or connections? Median time to resolve, and how many reach engineering?</td>
		<td>CS lead</td>
	</tr>
	<tr>
		<td>Ticket export and tags</td>
		<td>Can CS export a redacted 400 tickets (300 tagged, 100 untagged) with their current tags? What tag set exists today?</td>
		<td>CS lead</td>
	</tr>
	<tr>
		<td>Gong themes by segment and stage</td>
		<td>Can I get the 618-call theme export with account segment and deal stage, and how were the four listing themes coded?</td>
		<td>RevOps / Gong owner</td>
	</tr>
	<tr>
		<td>Churn and loss reason codes</td>
		<td>Do closed-lost and churn records have a "listings / sync" reason code, or only free text?</td>
		<td>RevOps / Gong owner</td>
	</tr>
	<tr>
		<td>Listing instrumentation</td>
		<td>Which listing steps are tracked as events today (first edit, first push, connecting a second channel)? The import steps belong to import on the Roadmap.</td>
		<td>Data & analytics lead</td>
	</tr>
	<tr>
		<td>Field override usage</td>
		<td>How often do hosts override a field's value, for which fields, and at which portfolio sizes?</td>
		<td>Data & analytics lead</td>
	</tr>
	<tr>
		<td>What feeds the Knowledge Hub</td>
		<td>What share of properties have a Knowledge Hub, what are its sources today, and can it read structured facts back from Details?</td>
		<td>AI/ML lead</td>
	</tr>
	<tr>
		<td>Legal position on AI listing copy</td>
		<td>Disclosure to guests, liability for an amenity the AI invents, EU AI Act transparency duties.</td>
		<td>Legal / trust</td>
	</tr>
	<tr>
		<td>Channel terms on automated content</td>
		<td>Do any channel's partner terms restrict automated or AI-written content changes, or rate-limit content updates?</td>
		<td>Legal / trust · Integrations engineering lead</td>
	</tr>
	<tr>
		<td>Who owns listing quality</td>
		<td>Which PM and team own Details, Pricing and the Knowledge Hub, and is there an agreed definition of "source of truth"?</td>
		<td>Head of Product · Listing-management PM and designer</td>
	</tr>
	<tr>
		<td>Source-of-truth roadmap</td>
		<td>Pricing already overwrites a channel's value once edited. Which fields are next, and are migrations in flight?</td>
		<td>Head of Product · Listing-management PM and designer</td>
	</tr>
	<tr>
		<td>Property matching at import</td>
		<td>How does import match listings to properties, and how often do hosts merge, unmerge or mute afterwards? Belongs to import on the Roadmap.</td>
		<td>Integrations engineering lead · Data & analytics lead</td>
	</tr>
	<tr>
		<td>Recruiting channels and incentives</td>
		<td>Which host community channels can I recruit in, can I run an in-app intercept, and what is the incentive policy?</td>
		<td>Marketing lead</td>
	</tr>
	<tr>
		<td>Listings in enterprise demos</td>
		<td>What do enterprise prospects ask to see about listings in demos, and which recent deals were lost or delayed over listings or sync?</td>
		<td>Sales lead (enterprise)</td>
	</tr>
	<tr>
		<td>The story Hospitable can tell</td>
		<td>Would Marketing position listing management as a differentiator, and which claims about AI-written listings are safe to make?</td>
		<td>Marketing lead · Legal / trust</td>
	</tr>
	<tr>
		<td>What "opportunities" compute</td>
		<td>What do the opportunity counts in the product compute today? Is there an existing listing-quality score?</td>
		<td>Data & analytics lead · Head of Product</td>
	</tr>
</table>
## What it produces
- Answers to the open questions, written back into <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>.
- The host research in 02 · Research: <mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">User interviews</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12">Data review</mention-page>, each with a sampled example of its output.
---
**Part of**
- <mention-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8">01 · Discovery</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
