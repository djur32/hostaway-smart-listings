<page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/43dd066c0a454fd591bc7d13c3fe1154" title=""/>
<ancestor-2-page url="https://app.notion.com/p/12fc87bb04244940b48993636dbb0249" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af164581329bede8618280f79b" title="03 · Information architecture"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Sitemap"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · The property menu exactly as the prototype builds it, with one line on what each page holds. Provenance: `REAL·PRODUCT` (the live prototype and its code).
</callout>
## The short version
- The property menu has three parts: **Overview**, **Shared** (what every channel reads) and **Channels** (one group per connected channel).
- Every channel group has the same four pages, each with its count of open tips.
- **Smart Listings** (Strategy, Performance) appears in Shared only when it's on.
- Two flows run full screen, outside the menu: the **strategy wizard** and the **Booking-policy flow**.
- The global sidebar is Hospitable's own. Only Properties navigates.
## The property menu
<columns>
	<column ratio="25">
		![The property menu in the prototype, Airbnb open: Overview, then Shared, then Channels, with open tips counted per page. Sample data SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/90c5170a-e5f2-4b75-879b-e4e322cd6920/ia-rail.png)
	</column>
	<column ratio="75">
		- **Overview** · Hospitable's property page: connected channels, calendars, sync, the Smart Listings switch and Field visibility.
		- **Shared**
			- **Listing base** › Details · Pricing · Availability · the values every channel uses. Each field says how many channels use it.
			- **Knowledge Hub** › Content · Workflows · Sources · the nine topics the guest assistant knows, example workflows, and what it reads. Labelled a concept in the build.
			- **Calendar** · nights and prices, kept inside the property.
			- **Guest experience** · placeholder, out of scope.
			- **Operations** · placeholder, out of scope.
			- **Smart Listings** › Strategy · Performance · shown when it's on. Strategy lists each channel's strategy; Performance compares each channel with the same stretch before its strategy started.
		- **Channels** · only the connected ones
			- **Airbnb · Booking⁠.com · Direct**, each › Listing · Pricing · Availability · Booking policies · the channel's own version of each page. Every field shows its state: uses the Base, custom, or set by the channel.
	</column>
</columns>
A channel's Listing has two views, Classic and Canvas, and Hospitable's five tabs: Essentials, Arrival, Location, Amenities, Rules.
## Outside the menu
<table header-row="true">
<tr>
<td>Flow</td>
<td>Opens from</td>
<td>What it holds</td>
</tr>
<tr>
<td>**Strategy wizard** (full screen)</td>
<td>The Overview's Smart Listings switch, the first time; Strategy › Add, Edit or Replace</td>
<td>Channels → one strategy or one each → goal → who to attract → guardrails → Autopilot → anything else the strategy should know. The questions repeat for each strategy.</td>
</tr>
<tr>
<td>**Booking-policy flow** (full screen)</td>
<td>Channels › Airbnb or Direct › Booking policies › Configure</td>
<td>Cancellation policy → non-refundable option (Airbnb) → review; Airbnb's long-term stays → review. Booking⁠.com sets cancellation in its Extranet, so its page is read-only.</td>
</tr>
</table>
Links from earlier builds redirect: the old Setup page opens the strategy wizard, and old version pages open Performance.
## The global sidebar
Hospitable's own, replicated: Search, Getting started, Home, Inbox, Properties, Calendar, Guest experience, Metrics, Direct bookings, Devices, Operations. Only **Properties** navigates, straight to the property. The rest is shown but inert, because the case doesn't rebuild those areas. On phones the property menu becomes a section bar that opens the whole menu in a bottom sheet. → <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e"/>
## How it was made
Read from the prototype's code (the property layout and its routes) and checked against the live site. Why the menu has this shape: <mention-page url="https://app.notion.com/p/3eee18af16458180a645fc510d470034"/>.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af16458180a645fc510d470034"/> · <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d"/> · <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde"/> · <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600"/> · <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48"/> · <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008"/>
**In the prototype** · [Property Overview](https://hospitable-case-djur32.vercel.app/property/neukolln/overview) · [Strategy wizard](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/wizard) · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/>
**Files** · `prototype/src/shell/PropertyLayout.tsx` · `prototype/src/ds/sl3.tsx` (the menu) · `prototype/src/routes.tsx`
</content>
</page>
