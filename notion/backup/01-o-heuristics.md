<page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/48cc3ac66701403aa02abd43c3127e12" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7261d150557441ca8da996f6ffbb240f" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8" title="01 · Discovery"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Heuristic evaluation"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · Eleven findings on the listing-editing flow that Smart Listings redesigns, each with what the design does about it. Provenance: `REAL·PRODUCT`; severities are `ASSUMPTION` (one evaluator).
</callout>
## The short version
- The worst problems are structural: two stores of facts, no view of one listing on one channel, and an AI that tells guests things the listing doesn't say.
- Per-channel control exists, but in seven forms, and its label never says which channels.
- Changes of ownership happen silently, and saving says nothing about what reached each channel.
- The Calendar takes the host out of the property.
## Method
One evaluator walked the listing-editing screens (the supplied screenshots plus the read-only trial pass) against Nielsen's 10 heuristics and six for listings: source-of-truth clarity, sync-direction visibility, per-channel awareness, reversibility, AI transparency and bulk. Severity uses Nielsen's 0–4 scale, where 4 means wrong information reaches guests, money is lost, or the job is blocked. With one evaluator the severities are `ASSUMPTION`. The full review has 41 findings; this page keeps only those on the flow Smart Listings changes.
## Findings
<table header-row="true">
<colgroup>
<col width="342.75">
<col width="208.75">
<col width="62.75">
<col width="256.75">
</colgroup>
<tr>
<td>Finding</td>
<td>Where</td>
<td>Sev</td>
<td>What the design does about it</td>
</tr>
<tr>
<td>**Two stores of facts disagree.** Details and the Knowledge Hub hold the same facts separately; 14 of 28 match. The Hub is generated once and never told when Details changes.</td>
<td>Details › Rules vs Knowledge Hub · HS-28, HS-44</td>
<td>4</td>
<td>Every fact lives once, in Shared: the Listing base and the Knowledge Hub side by side. <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d"/></td>
</tr>
<tr>
<td>**The AI states what the listing doesn't.** Ask the AI tells a guest the flat is wheelchair accessible; no amenity says so, and the answer shows no source.</td>
<td>Knowledge Hub › Ask the AI · HS-43, trial pass</td>
<td>4</td>
<td>Hub facts live next to the Listing base, and every tip shows the facts and data it rests on. <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/></td>
</tr>
<tr>
<td>**No view of one listing on one channel.** To see what Airbnb shows, the host checks about 15 fields across five tabs.</td>
<td>All property tabs · HS-21 to HS-39</td>
<td>4</td>
<td>Each channel has its own Listing, Pricing, Availability and Booking policies pages, and Canvas shows that channel's guest page. <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5"/></td>
</tr>
<tr>
<td>**Ownership flips silently on the first edit.** Editing the base price "will overwrite the price on Airbnb", said once in a paragraph. Photos get a one-time banner. Other fields say nothing.</td>
<td>Pricing › Base price · HS-30; photo manager, trial pass</td>
<td>4</td>
<td>Every field states whose value it is: uses the Base, customised for the channel, or set by the channel. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/></td>
</tr>
<tr>
<td>**Seven patterns for one idea.** "Different on this channel" appears as a label plus link, a label alone, "All channels", a one-channel field, a row per listing, a grid and a page. The label says how many channels, not which.</td>
<td>Details, Pricing, Availability, Booking policies · HS-26, HS-33, HS-35, HS-39, HS-47</td>
<td>3</td>
<td>One rule on every field, and hovering a field's label shows the Base value next to each channel's own. <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/></td>
</tr>
<tr>
<td>**Looking creates overrides.** Opening Edit per channel marks the form as changed with no edit made; a host who looks and then saves has split the field.</td>
<td>Details › Essentials · trial pass</td>
<td>3</td>
<td>On a channel page a Base value is shown read-only. Customising is an explicit "Customize for Airbnb", undone with "Use the Base". <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/></td>
</tr>
<tr>
<td>**Save says nothing about the channels.** No "sent to Airbnb", no last-synced time, no per-channel error, no history and no undo.</td>
<td>Discard / Save on every tab · HS-28, HS-33</td>
<td>3</td>
<td>Save is the commit; each saved change goes out with a receipt, and an accepted tip can be undone. <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3"/></td>
</tr>
<tr>
<td>**Publishing has no preview.** "Publish listing" is the one option in the Overview status menu; nothing shows what guests will see.</td>
<td>Overview › status · trial pass</td>
<td>3</td>
<td>Canvas renders each channel's guest page from the same data, and tapping a part opens its field. <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5"/></td>
</tr>
<tr>
<td>**The Calendar leaves the property.** The menu's Calendar opens the global Calendar; the property menu disappears and there's no way back.</td>
<td>Calendar · HS-32</td>
<td>3</td>
<td>Calendar stays inside the property, under Shared. <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3"/></td>
</tr>
<tr>
<td>**Per-channel money has two editors that disagree.** Pricing and the Calendar side panel both edit fees and deposits, and list different channels.</td>
<td>Pricing › Security deposits vs Calendar panel · HS-35, HS-32</td>
<td>2</td>
<td>The Base price lives in Listing base › Pricing; what a channel does differently lives on that channel's Pricing page. <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/></td>
</tr>
<tr>
<td>**Recommendations are Airbnb's alone.** Review opportunities opens Airbnb's own list, behind a link, and it was empty for this listing. Nothing covers Booking⁠.com or Direct.</td>
<td>Overview · HS-21, trial pass</td>
<td>Not rated</td>
<td>Smart Listings gives every channel tips on its own pages, on money and stay rules as well as copy. <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975"/></td>
</tr>
</table>
<span color="gray">"Not rated": the original review didn't score this observation, so no severity is given here.</span>
## The worst ones, on screen
<columns>
	<column>
		![Details › Rules: House rules is empty and labelled "1 channel · Edit per channel", while the Knowledge Hub holds six house rules. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/a92e5a92-84d6-4210-b873-946745e4ee99/dc-hs-28.png)
	</column>
	<column>
		![Pricing › Base price: the one-way door is a paragraph above the field. Editing the nightly rate overwrites Airbnb's price and stops pulling it. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/e98add29-dbc0-45ab-86b8-a00d08373c3a/dc-hs-30.png)
	</column>
</columns>
![The property menu's Calendar opens the global Calendar (note the address and the sidebar highlight). Its side panel edits the same prices, fees and deposits as Pricing, listing three channels where Pricing shows one. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/b22b8ea7-abc5-4b36-b41f-a891a4185204/dc-hs32-calendar-exit.png)
## What I left out
Findings on connecting and importing a listing, onboarding, portfolio-wide rules shown inside a property, and the Dynamic Pricing activation error. They're real, but they're not on the flow Smart Listings changes. Import findings move with Angle A to the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c"/>.
## How it was made
Part of <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3"/> · <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754"/> · <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/> · <mention-page url="https://app.notion.com/p/3eee18af1645819e9675db2668610c2b"/> · <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a"/> · **Files** <span color="gray">`research/current-state/heuristics.md`</span><span color="gray"> (all 41 findings)</span>
</content>
</page>
