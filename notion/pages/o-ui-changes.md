<callout icon="✅" color="gray_bg">
	**Output · Done** · Where the prototype departs from Hostaway's current UI, and why. Everything else is copied. Provenance: "Hostaway today" is (screenshots and the trial account, cited by HS number); the reasons are design judgement () unless marked.
</callout>
## The short version
- I replicate Hostaway and change only what the Smart Listings model needs: per-channel editing, saving, AI and the Knowledge Hub.
- Ten departures matter most. Each one below is checked against the live prototype.
- The rest of the product, from the shell to the dropdowns, is copied as it is.
## Ten departures
<table header-row="true">
	<tr>
		<td>Area</td>
		<td>Hostaway today</td>
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
		<td>Per-channel AI is the brief's Angle B (); one affordance keeps it calm</td>
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
		<td>Questions, Insights, Facts and Sources. Listing details are read from the Listing base, the assistant answers guests only from them and from Facts the host wrote or confirmed, and gaps become tips. Labelled Concept</td>
		<td>Listing details live once, and guests' questions become improvements to the listing</td>
	</tr>
</table>
## Before and after
<columns>
	<column>
		![Today · Details › Arrival. Guest checkout tasks ("1 channel") sits among shared fields, and each text field offers "Edit per channel". HS-23.](file-upload://3efe18af-1645-819f-aa05-00b266f039a7)
	</column>
	<column>
		![Prototype · Airbnb › Listing › Arrival. Each field uses the Base or is custom for Airbnb, and Guest checkout tasks lives only on Airbnb. Values .](file-upload://3efe18af-1645-81e9-b6bd-00b24cb7e578)
	</column>
</columns>
<columns>
	<column>
		![Today · Knowledge Hub. One generated list under "Ask the AI" and "Sources (1)". HS-42.](file-upload://3efe18af-1645-81b0-9227-00b22d975f4b)
	</column>
	<column>
		![Prototype · Knowledge Hub › Questions: what guests ask, by topic, counted per channel and marked answered or not. Labelled Concept. Values .](file-upload://3efe18af-1645-81a2-afe8-00b24b47a9d9)
	</column>
</columns>
## Where I deliberately copied Hostaway
The global shell and property switcher, Details' five tabs and field order, the field row and its "ⓘ N channels" caption, Summary as the guest-facing text, dropdowns and chips, the Metrics chart cards behind Performance, and the Add-property wizard, reused for strategies and booking policies. In the global sidebar only Properties navigates; Getting started and the rest are shown but inert.
## How it was made
Each "today" cell comes from the <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page> and the <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page>. About twenty departures were logged while building (full list in the repo); these ten shape Smart Listings, and each was checked against the prototype’s code and live site.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737">Solution overview</mention-page>
**See also**
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5">Canvas preview</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008">KD-16</mention-page>
**In the prototype**
- [Airbnb › Listing › Arrival]()
- [Knowledge Hub › Questions]()
