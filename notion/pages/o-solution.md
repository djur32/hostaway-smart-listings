<callout icon="✅" color="gray_bg">
	**Output · Done** · Smart Listings as built, on one page: what it is, how a host uses it and what it answers. The working prototype is the source of truth. Provenance: the UI replicates Hostaway (); the sample listing, tips and numbers in it are .
</callout>
![Airbnb › Listing with the Tips panel open: the field's name, 1 of 11, before → after, a note that it creates Airbnb's own value, Why, Dismiss / Accept. Prototype · sample listing ](file-upload://3efe18af-1645-8120-a557-00b2538a74e3)
## The solution in one paragraph
Smart Listings makes Hostaway's listing management per channel without repeating work. Listing details live once, in the **Listing base** (the Details, Pricing and Availability every channel lists). The **Knowledge Hub** reads those details without copying them, adds what they don't say (the situations behind a rule, such as what a host does when X, Y or Z happens), and learns from guests' questions in the inbox. Each **channel** (Airbnb, Booking⁠.com, Direct) has its own Listing, Pricing, Availability and Booking policies pages. On them a field **uses the Base**, is **customised for that channel**, exists **only on that channel** (Airbnb's check-in method), or is **set by the channel** and can't be changed: Booking⁠.com writes its own description from the property's facts, so it is read-only, marked "Booking⁠.com only" with a lock that says why. **Smart Listings** is opt-in per property. A **strategy per channel** (goal, guests, guardrails, Autopilot on or off), made in a full-screen wizard, produces **tips** in one docked panel on that channel's pages. Each tip carries its *why* and its sources: similar homes, guest inquiries, facts from the Listing base. The host accepts or dismisses each one, or uses **Rewrite with AI** on a field that has no tip. A **Canvas** shows each channel's real guest page and opens the field you tap. **Performance** shows whether the strategy worked, against the same number of days before it started. Save is the commit: each change goes to its channel, and an accepted tip can be undone.
## The model
![Solution map · Every fact once in Shared, a page per channel where each field is one of four cases, and a strategy per channel whose tips the host reviews. Prototype as built; sample content .](file-upload://3efe18af-1645-8115-aabc-00b28ed947ce)
<span color="gray">Diagram of the model as built in the prototype. Source: `prototype/src/shell/PropertyLayout.tsx`, `data/sl3.ts`, `shell/ChannelTips.tsx`.</span>
## Built on the assistant, not a new AI
Hostaway already has an assistant hosts know: **The assistant**, marked with a sparkle, purple on lavender ([hostaway.com](https://hostaway.com); the same sparkle sits in the product's sidebar footer, ). Smart Listings doesn't add a second one. It expands the assistant from answering questions to working on the listing.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>The assistant today</td>
		<td>What Smart Listings adds</td>
	</tr>
	<tr>
		<td>Answers business questions in a chat</td>
		<td>Answers on the listing itself: a tip on the field it's about, with its why and sources</td>
	</tr>
	<tr>
		<td>Writes smart replies to guests</td>
		<td>Writes listing text per channel: Rewrite with AI on any editable field</td>
	</tr>
	<tr>
		<td>Knows the business: check-ins, occupancy, revenue</td>
		<td>Also knows the home: Listing base facts and guest questions, cited as a tip's sources</td>
	</tr>
	<tr>
		<td>A sparkle, purple on lavender</td>
		<td>The same sparkle on the Tips button, each field's tip marker and the Tips panel; purple on lavender for what it proposes</td>
	</tr>
</table>
Why: hosts already trust the assistant, so the listing AI needs no new name, icon or place to learn, and one assistant keeps growing across the product (<mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>). <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
## How a host uses it
1. **Turn it on.** On the property Overview, the Smart Listings toggle opens a full-screen strategy wizard. Turning it off later asks first and keeps everything. See <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>.
2. **Set a strategy per channel.** A goal, the guests to attract, guardrails (a price range and what always asks first) and Autopilot on or off. One strategy can cover several channels, or each channel gets its own. Same page.
3. **Work through the tips.** Each channel's pages show how many tips wait. Tips opens one docked panel, one tip at a time, with its why. Accept, Dismiss or Generate alternatives; on a field without a tip, Rewrite with AI. See <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>.
4. **Change a fact once, or for one channel.** Every field says whether it uses the Base, is custom for this channel, exists only on this channel or is set by the channel, with one link to switch between the Base and custom. To answer guests, the assistant reads the same listing details through the Knowledge Hub, plus the host's own situations, and they show up as tip sources. See <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>.
5. **See it as guests do, and see if it worked.** Canvas shows each channel's page as its guests see it, and opens the field you tap. Performance compares each channel with the stretch before its strategy. See <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5">Canvas preview</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d">User flows</mention-page>.
## What it answers from research
<table header-row="true" fit-page-width="true">
	<tr>
		<td>What I learned</td>
		<td>Source</td>
		<td>Design answer</td>
	</tr>
	<tr>
		<td>The Knowledge Hub repeats the listing in a copy that drifts, and no screen shows one listing on one channel.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page></td>
		<td>Facts live once, in Shared. Each channel holds only what differs, behind a channel-first menu, and Canvas shows the channel's real guest page.</td>
	</tr>
	<tr>
		<td>Hosts keep money and stay rules different per channel, much more than words.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page></td>
		<td>Tips cover Pricing, Availability and Booking policies, not only copy. Per-channel text is a choice ("Customize for Airbnb"), not a default.</td>
	</tr>
	<tr>
		<td>Booking⁠.com writes its own description; there, a host's voice is how complete their facts are.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page></td>
		<td>Booking⁠.com's description is set by the channel and read-only. Booking⁠.com tips add facts instead, such as directions and self check-in.</td>
	</tr>
	<tr>
		<td>Explaining a suggestion makes hosts accept it, and "where it goes" earns the most trust.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page></td>
		<td>Every tip shows its why, each reason with its source, and its scope ("Creates Airbnb's own value", "Applies to every channel"). Every field shows a scope caption.</td>
	</tr>
	<tr>
		<td>Hosts new to this kind of tool risk trusting the AI too much.</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page></td>
		<td>Guardrails: prices, stay rules and cancellation always ask first. Autopilot is off by default. An accepted tip can be undone.</td>
	</tr>
</table>
<span color="gray">Research rows marked come from sampled research, not from real hosts. They are hypotheses for</span> <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page><span color="gray">.</span>
## Try it
- **Website:** [hostaway-case-web.digimal.studio](). It opens on the sample property's Overview.
- **Phone app:** [hostaway-case-mobile.digimal.studio](). The same prototype at phone size; see <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e">Mobile & tablet</mention-page>.
- The sample property is "Beautiful Artist Apt. in Neukölln" on Airbnb, Booking⁠.com and Direct. Its listing, tips, inquiries and performance figures are .
## How it was made
Built in code on Hostaway's own design tokens, replicating its UI and departing only where the model needs it. Shaped through rounds of my own design review. See <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3">UI changes</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde">KD-03</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600">KD-05</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008">KD-16</mention-page>
**In the prototype**
- [Airbnb listing with Tips]()
