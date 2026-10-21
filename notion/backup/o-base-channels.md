<page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Listing base & channels"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · How one property's listing is shared by every channel, and how each channel keeps only what differs. Provenance: screens replicate Hospitable (`REAL·PRODUCT`); listing values are `SIMULATED`.
</callout>
![Airbnb › Listing › Essentials in the live prototype. Photos and Summary are Custom for Airbnb; Property name uses the Base. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/e30b7938-1f22-4624-afa1-93b5443e19be/bc-airbnb-captions.png)
## The short version
- The **Listing base**, in Shared, holds what every channel lists: Details, Pricing and Availability.
- Each **channel** (Airbnb, Booking⁠.com, Direct) has four pages: Listing, Pricing, Availability and Booking policies. They hold only that channel.
- On a channel page, every field **uses the Base**, is **custom for that channel**, or is **set by the channel**. The caption under the field says which, and one link switches it.
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
		- Values every channel shares, like Wi-Fi or the nightly rate, read "ⓘ 3 channels · Edit for all channels". Saving one changes every channel, and a note under the field says so.
	</column>
</columns>
## Three states for a field
<table header-row="true">
<tr>
<td>State</td>
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
<td>**Set by the channel**</td>
<td>Read-only, with a lock</td>
<td>"ⓘ Booking⁠.com decides" · no link</td>
<td>Booking⁠.com › Summary: Booking⁠.com writes its own description</td>
</tr>
</table>
Hovering the caption shows the Base value and each channel's own value side by side. "Use the Base" keeps the custom text in the draft, so "Customize for Airbnb" brings it back; a round trip with no real change leaves nothing to save.
<columns>
	<column>
		![Listing base › Details. The "Source of truth" chip and the informational "ⓘ N channels" captions. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/76c74d34-724d-4cb9-8cbe-5a9c91433b91/bc-base-details.png)
	</column>
	<column>
		![[Booking.com](http://Booking.com) › Listing. Photos and Property name are custom for [Booking.com](http://Booking.com); Summary is set by [Booking.com](http://Booking.com), read-only with a lock. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/d4898690-2f89-4e1a-b3ac-7f6d81408cee/bc-booking-listing.png)
	</column>
</columns>
## What never varies, and what one channel owns
- **Locked:** Property type, Room type and the address (country, street, unit, city, state, ZIP) are fixed once the listing exists. On the Base they show a lock with the reason in a tooltip; on channel pages they don't appear at all. The map pin keeps its Edit. The reason's wording is an `ASSUMPTION`.
- **Channel-only:** fields a single channel has, and the channel markup on Pricing, live on that channel's page.
- **Photos:** one set, on the Base. A channel either uses the Base set and order, or shows and hides photos and reorders them for itself. New photos are added on the Base only. Manage photos opens a full-screen view locked to that channel.
## One draft, one Save
Typing, Customize, Use the Base and photo changes all stay in a draft, and so do tips accepted on Pricing and Availability. An **Unsaved changes** bar appears only once something differs from what is saved, pinned to the bottom of the area being edited. Leaving with unsaved changes asks: Keep editing, Discard changes or Save changes. After Save, a quiet line says where it went, e.g. "Saved · sent to Airbnb and Booking⁠.com". Accepting a tip on a channel's Listing is the one change sent at once, with Undo.
**Open:** research says Booking⁠.com authors its own title and description and Hospitable can't write them (<mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e"/>). The prototype sets the description by Booking⁠.com but still lets the property name be customised there.
## Why it works this way
- Hosts change money and stay rules per channel far more than words (`SIMULATED` research, <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd"/>). So Pricing, Availability and Booking policies get the same per-channel treatment as the listing text.
- Channels have different fields and rules, and Booking⁠.com writes its own description (`REAL·PUBLIC`, <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e"/>). Hence a third state, set by the channel, and fields that exist on one channel only.
- Today "Edit per channel" is scattered across about 15 fields, and opening it alone marks the form as changed (`REAL·PRODUCT`, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/>).
## How it was made
Built in the prototype's code on Hospitable's real Details, Pricing and Availability screens, then reviewed screen by screen. The model it implements is in <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> and <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce"/>.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e"/> · <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754"/> · <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/> · <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a"/>
**In the prototype** · [Listing base › Details](https://hospitable-case-djur32.vercel.app/property/neukolln/details/essentials) · [Airbnb › Listing](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/airbnb/listing/essentials) · [Booking.com › Listing](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/booking/listing/essentials)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/details/`</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/base/`</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/channel/FieldRow.tsx`</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/channel/common.tsx`</span><span color="gray"> · </span><span color="gray">`prototype/src/ds/unsaved.tsx`</span>
</content>
</page>
