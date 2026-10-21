<page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"UI changes"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · Where the prototype departs from Hospitable's current UI, and why. Everything else is copied. Provenance: "Hospitable today" is `REAL·PRODUCT` (screenshots and the trial account, cited by HS number); the reasons are design judgement (`ASSUMPTION`) unless marked.
</callout>
## The short version
- I replicate Hospitable and change only what the Smart Listings model needs: per-channel editing, saving, AI and the Knowledge Hub.
- Ten departures matter most. Each one below is checked against the live prototype.
- The rest of the product, from the shell to the dropdowns, is copied as it is.
## Ten departures
<table header-row="true">
<tr>
<td>Area</td>
<td>Hospitable today</td>
<td>What I do</td>
<td>Why</td>
</tr>
<tr>
<td>**Per-channel editing**</td>
<td>Shared fields carry "ⓘ N channels · Edit per channel", which splits a field inline into one box per channel. Opening it alone marks the form as changed (HS-L01, HS-L03)</td>
<td>The Listing base only says "ⓘ N channels". Channel versions are made on each channel's own pages: Uses the Base or Custom for that channel</td>
<td>The Base stays one shared layer, and looking never creates a change</td>
</tr>
<tr>
<td>**Channel-only fields**</td>
<td>Check-in method and Guest checkout tasks, marked "1 channel", sit among the shared Arrival fields (HS-23, HS-L05)</td>
<td>They appear only on the Airbnb page</td>
<td>The Base holds only what every channel shares</td>
</tr>
<tr>
<td>**Saving**</td>
<td>Discard / Save on each tab; Amenities has no Save (HS-22, HS-26)</td>
<td>Every edit is a draft. One Unsaved changes bar appears only when something changed, leaving asks first, and Save names the channels it reached</td>
<td>One draft, one Save, nothing sent by surprise</td>
</tr>
<tr>
<td>**Locked fields**</td>
<td>Property type and Room type are disabled, keep a chevron and give no reason (HS-L02)</td>
<td>A lock with the reason in a tooltip on the Base; hidden on channel pages. The address is locked the same way</td>
<td>It reads as deliberate rather than broken</td>
</tr>
<tr>
<td>**Recommendations**</td>
<td>The only listing advice is Airbnb's Opportunities, behind "Review opportunities" (HS-21, HS-L14)</td>
<td>Tips per channel on Listing, Pricing, Availability and Booking policies, counted on tabs and the rail, one at a time in a docked panel with their why</td>
<td>Advice sits next to what it changes, on the channel it's for</td>
</tr>
<tr>
<td>**AI on listing fields**</td>
<td>AI exists for messaging and the Knowledge Hub, not for listing fields (HS-40, HS-48)</td>
<td>At most one AI affordance per field: its tip, or else Rewrite with AI on an editable text field</td>
<td>Per-channel AI is the brief's Angle B (`REAL·BRIEF`); one affordance keeps it calm</td>
</tr>
<tr>
<td>**Preview**</td>
<td>"Publish listing" is one click in a status menu, with no preview (HS-L13)</td>
<td>Canvas shows each channel's guest page; tapping an area opens its field</td>
<td>The host sees what guests will see</td>
</tr>
<tr>
<td>**Photos**</td>
<td>One modal with an All / Airbnb / Direct switcher, Add, and a separate Re-order mode (HS-L04)</td>
<td>A full-screen view locked to one channel, or to the Base. A channel can only show, hide and reorder, by dragging in place. Photos are added on the Base</td>
<td>You always know whose order you are editing</td>
</tr>
<tr>
<td>**Drill-downs**</td>
<td>Pricing and Calendar drill-downs replace the panel behind "‹ Back" (HS-32, HS-C11)</td>
<td>They slide in beside the page as a stack of panels, and slide back out</td>
<td>You keep your place</td>
</tr>
<tr>
<td>**Knowledge Hub**</td>
<td>One generated list with "Ask the AI" and "Sources (1)". New knowledge is free text under a topic, and the Hub feeds messaging only (HS-42, HS-57)</td>
<td>Content, Workflows and Sources; topic pages with Questions and Facts; facts added by describing them; facts cited on listing tips. Labelled Concept</td>
<td>Facts become typed, manageable and visible where they matter</td>
</tr>
</table>
## Before and after
<columns>
	<column>
		![Today · Details › Arrival. Guest checkout tasks ("1 channel") sits among shared fields, and each text field offers "Edit per channel". REAL·PRODUCT, HS-23.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/7681d9f6-9b81-41b4-b289-d3ed3ed28f88/today-hs23-arrival.png)
	</column>
	<column>
		![Prototype · Airbnb › Listing › Arrival. Each field uses the Base or is custom for Airbnb, and Guest checkout tasks lives only on Airbnb. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/2b13b79b-5b4a-4c1a-adc4-23c5ea31cb6a/proto-airbnb-arrival.png)
	</column>
</columns>
<columns>
	<column>
		![Today · Knowledge Hub. One generated list under "Ask the AI" and "Sources (1)". REAL·PRODUCT, HS-42.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/055a3a4f-1ea0-4b5d-82b5-d0de7a50689f/today-hs42-hub.png)
	</column>
	<column>
		![Prototype · Knowledge Hub › Content. Hospitable's nine topics as cards, each opening Questions and Facts. Labelled Concept. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/fde62b80-428b-4e3d-85b0-62f2fffb3273/proto-hub-content.png)
	</column>
</columns>
## Where I deliberately copied Hospitable
The global shell and property switcher, Details' five tabs and field order, the field row and its "ⓘ N channels" caption, Summary as the guest-facing text, dropdowns and chips, the Metrics chart cards behind Performance, and the Add-property wizard, reused for strategies and booking policies. In the global sidebar only Properties navigates; Getting started and the rest are shown but inert.
## How it was made
Each "today" cell comes from the <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf"/> and the <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212"/>. About twenty departures were logged while building (full list in the repo); these ten shape Smart Listings, and each was checked against the prototype’s code and live site.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/> · <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212"/> · <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632"/> · <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737"/>
**See also** · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008"/>
**In the prototype** · [Airbnb › Listing › Arrival](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/airbnb/listing/arrival) · [Knowledge Hub › Content](https://hospitable-case-djur32.vercel.app/property/neukolln/hub/content)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`plan/DECISIONS-UX-SUMMARY.md`</span><span color="gray"> (the full list) · </span><span color="gray">`research/current-state/INDEX.md`</span><span color="gray"> (HS numbers) · </span><span color="gray">`Hospitable Screenshots/`</span>
</content>
</page>
