<callout icon="✅" color="gray_bg">
	**Output · Done** · How one property's listing is shared by every channel, and how each channel keeps only what differs. Provenance: screens replicate Hospitable (`REAL·PRODUCT`); listing values are `SIMULATED`.
</callout>
![Airbnb › Listing › Essentials in the live prototype. Photos and Summary are Custom for Airbnb; Property name uses the Base. Values SIMULATED.](file-upload://3eee18af-1645-8134-bc50-00b21bbedb56)
## The short version
- The **Listing base**, in Shared, holds what every channel lists: Details, Pricing and Availability.
- Each **channel** (Airbnb, Booking.com, Direct) has four pages: Listing, Pricing, Availability and Booking policies. They hold only that channel.
- On a channel page, every field **uses the Base**, is **custom for that channel**, exists **only on that channel**, or is **set by the channel** and can't be changed. The caption under the field says which; for the first two, one link switches it.
- Switching back to the Base never throws away the custom value.
- Every edit is a draft until Save: one bar, one Save, and the confirmation names the channels the change reached.
## Two layers
<columns>
	<column>
		### Listing base (Shared)
		Details · Pricing · Availability
		- Details keeps Hospitable's five tabs (Essentials, Arrival, Location, Amenities, Rules) and its field order.
		- A "Source of truth" chip by the title explains how channels use these values.
		- Under a field, "ⓘ 2 channels" says how many channels take this value; hovering names them. It is information only, with no "Edit per channel".
		- Saving sends the change to every channel that uses the Base. A channel with its own value keeps it.
	</column>
	<column>
		### A channel's pages
		Listing · Pricing · Availability · Booking policies
		- Each page speaks about one channel and never shows another channel's values.
		- A field that only one channel has lives only there. Airbnb's Check-in method and Guest checkout tasks are on Airbnb › Listing, not on the Base or the other channels.
		- Values every channel shares, like Wi-Fi or the nightly rate, read "ⓘ All channels · Edit for all channels". Saving one changes every channel, and a note under the field says so.
	</column>
</columns>
## Four cases for a field
<table header-row="true">
	<tr>
		<td>Case</td>
		<td>How the field looks</td>
		<td>Caption · link</td>
		<td>Example in the prototype</td>
	</tr>
	<tr>
		<td>**Uses the Base**</td>
		<td>The input's disabled look, showing the Base value</td>
		<td>"ⓘ Uses the Base" · **Customize for Airbnb**</td>
		<td>Airbnb › Property name</td>
	</tr>
	<tr>
		<td>**Custom for the channel**</td>
		<td>A normal, editable input</td>
		<td>"ⓘ Custom for Airbnb" · **Use the Base**</td>
		<td>Airbnb › Summary, Photos</td>
	</tr>
	<tr>
		<td>**Only on that channel**</td>
		<td>A normal, editable input, on that channel's page alone</td>
		<td>"ⓘ Airbnb only" · no link</td>
		<td>Airbnb › Check-in method, Guest checkout tasks</td>
	</tr>
	<tr>
		<td>**Set by the channel**</td>
		<td>Read-only, with a lock whose tooltip says why</td>
		<td>"Booking.com only" with the lock · no link</td>
		<td>Booking.com › Summary: Booking.com writes its own description</td>
	</tr>
</table>
Hovering the caption shows the Base value and each channel's own value side by side. "Use the Base" keeps the custom text in the draft, so "Customize for Airbnb" brings it back; a round trip with no real change leaves nothing to save.
<columns>
	<column>
		![Listing base › Details. The "Source of truth" chip and the informational "ⓘ N channels" captions. Values SIMULATED.](file-upload://3eee18af-1645-81ef-ae83-00b24124c596)
	</column>
	<column>
		![Booking.com › Listing. Photos and Property name are custom for Booking.com. Summary is set by Booking.com, read-only with a lock. Values SIMULATED.](file-upload://3eee18af-1645-8139-a1c0-00b222b2cf63)
	</column>
</columns>
## What never varies, and what one channel owns
- **Locked:** Property type, Room type and the address (country, street, unit, city, state, ZIP) are fixed once the listing exists. On the Base they show a lock with the reason in a tooltip; on channel pages they don't appear at all. The map pin keeps its Edit. The reason's wording is an `ASSUMPTION`.
- **Channel-only:** fields a single channel has, and the channel markup on Pricing, live on that channel's page.
- **Photos:** one set, on the Base. A channel either uses the Base set and order, or shows and hides photos and reorders them for itself. New photos are added on the Base only. Manage photos opens a full-screen view locked to that channel.
## One draft, one Save
Typing, Customize, Use the Base and photo changes all stay in a draft, and so do tips accepted on Pricing and Availability. An **Unsaved changes** bar appears only once something differs from what is saved, pinned to the bottom of the area being edited. Leaving with unsaved changes asks: Keep editing, Discard changes or Save changes. After Save, a quiet line says where it went, e.g. "Saved · sent to Airbnb and Booking.com". Accepting a tip on a channel's Listing is the one change sent at once, with Undo.
**Open:** research says Booking.com authors its own title and description and Hospitable can't write them (<mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>). The prototype sets the description by Booking.com but still lets the property name be customised there.
## Why it works this way
- Hosts change money and stay rules per channel far more than words (`SIMULATED` research, <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>). So Pricing, Availability and Booking policies get the same per-channel treatment as the listing text.
- Channels have different fields and rules, and Booking.com writes its own description (`REAL·PUBLIC`, <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>). Hence two more cases besides the Base and custom: fields that exist on one channel only, and fields the channel sets.
- Today "Edit per channel" is scattered across about 15 fields, and opening it alone marks the form as changed (`REAL·PRODUCT`, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>).
## How it was made
Built in the prototype's code on Hospitable's real Details, Pricing and Availability screens, then reviewed screen by screen. The model it implements is in <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce">Sitemap</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5">Canvas preview</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a">KD-15</mention-page>
**In the prototype**
- [Listing base › Details](https://hospitable-case-web.digimal.studio/property/neukolln/details/essentials)
- [Airbnb › Listing](https://hospitable-case-web.digimal.studio/property/neukolln/ch/airbnb/listing/essentials)
- [Booking.com › Listing](https://hospitable-case-web.digimal.studio/property/neukolln/ch/booking/listing/essentials)
