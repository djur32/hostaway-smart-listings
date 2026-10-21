<callout icon="🔭" color="gray_bg">
	**Method · Planned** · Not run. No stakeholder conversations were held for this case study. This is how I would run them, and what each would settle.
</callout>
## Why this method
Smart Listings depends on things only Hostaway's own people know: what each channel's API really accepts, whether the Knowledge Hub can take facts back from the listing, what support already sees, and what is allowed for AI-written listing content. Inventing their answers would be worse than admitting I don't know. So each question stays open, with me as its owner, and the design covers both outcomes where it must. <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
## How I'd run it
- **Format:** 30-minute one-to-ones, semi-structured. Each person gets their questions in writing a few days ahead, so the call is spent on answers, not context. The first conversation is a longer one (45 minutes) with the team that owns listing management today.
- **When:** before host research, so the interviews probe what the platform and the data allow, not what I assume.
- **After:** each answer is written back into its open question, and anything that changes a decision updates its decision record.
<table header-row="true">
	<tr>
		<td>Who</td>
		<td>What I'd ask, for Smart Listings</td>
		<td>Decisions it informs</td>
	</tr>
	<tr>
		<td>Integrations engineering lead</td>
		<td>Per field, for every channel (Airbnb, Booking.com, Vrbo, Expedia, Direct): can Hostaway write it, how fast does it go live, and what does the channel overwrite? What comes back that Hostaway can show as a receipt? Does Hostaway learn when a host edits a field on the channel? Where a channel writes its own text, as Booking.com does with its description, is that an API limit or Hostaway's choice?</td>
		<td>Field states; receipts; Undo on tips · <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page> <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a">KD-15</mention-page></td>
	</tr>
	<tr>
		<td>AI/ML lead (Knowledge Hub, messaging AI)</td>
		<td>What feeds the Hub today; can it read structured facts from the Listing base and stay in step; which model and guardrails generate text; can tips cite the exact fact they use?</td>
		<td>The Hub reading facts from the Listing base and counting guest questions; grounded tips · <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page> <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page></td>
	</tr>
	<tr>
		<td>Listing-management PM and designer</td>
		<td>Why Details and the Hub are separate; what Edit per channel was built for; past research on the four host types</td>
		<td>The Base and channels model · <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page></td>
	</tr>
	<tr>
		<td>Data & analytics lead</td>
		<td>How often Edit per channel is used, for which fields and portfolio sizes; what Review opportunities computes; which performance signals exist per channel, and how late</td>
		<td>Which tips to build first; the Performance baseline · <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page> <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page></td>
	</tr>
	<tr>
		<td>CS lead</td>
		<td>Share of tickets about listings and sync, and time to resolve; the questions new hosts ask in week one; which failures need a person</td>
		<td>Which states and messages come first; the support baseline · <mention-page url="https://app.notion.com/p/3eee18af1645812eb43fd00ba5a5cd09">KD-19</mention-page></td>
	</tr>
	<tr>
		<td>Sales lead (enterprise)</td>
		<td>What prospects ask to see about listings in demos; deals lost or delayed over listings or sync; objections to AI touching their listings</td>
		<td>Autopilot's default; what Performance must prove · <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page></td>
	</tr>
	<tr>
		<td>RevOps / Gong owner</td>
		<td>The listing themes from the 618 Gong calls, by account size and deal stage, and how they were coded</td>
		<td>Which failures to design for first</td>
	</tr>
	<tr>
		<td>Head of Product</td>
		<td>Who owns listing quality today; the planned order for "Hostaway as source of truth"; appetite for opt-in AI per property</td>
		<td>Opt-in per property · <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600">KD-05</mention-page></td>
	</tr>
	<tr>
		<td>Legal / trust</td>
		<td>AI-written listing content under each channel's partner terms; disclosure duties; liability for an invented amenity; rate limits on automated changes</td>
		<td>Guardrails in the strategy; what Autopilot may never change · <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48">KD-06</mention-page> <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page></td>
	</tr>
	<tr>
		<td>Marketing lead</td>
		<td>Where I can recruit hosts for research; which claims about AI-written listings are safe to make</td>
		<td>Recruiting for host research; the launch story</td>
	</tr>
</table>
## What I'd look for
- For every channel, fields the design promises but the channel won't accept or overwrites.
- How fast a change reaches each channel, and what Hostaway can honestly show as a receipt.
- Whether the Knowledge Hub can read its facts from the Listing base instead of keeping a copy, and see the questions guests ask in the Inbox.
- Limits on AI-written content and on automation.
## What it produces
- Answers to the open questions, each with an owner. None exists yet.
- A constraints log that updates <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>, and sharpens the <mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">User interviews</mention-page> guide and the <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.
---
**Part of**
- <mention-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8">01 · Discovery</mention-page>
