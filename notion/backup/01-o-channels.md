<page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/48cc3ac66701403aa02abd43c3127e12" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7261d150557441ca8da996f6ffbb240f" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8" title="01 · Discovery"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Channel constraints"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · What Airbnb, Booking⁠.com, Vrbo and Direct allow, for the fields Smart Listings touches. Provenance: `REAL·PUBLIC`, read on the channels' own help, partner and API pages (linked in each cell).
</callout>
## The short version
- The channels differ in **who writes the listing**, not only in limits. Airbnb lets software write almost everything; **Booking⁠.com writes its own description** from the facts it's given; Direct is Hospitable's own.
- Title limits, photo rules, amenity lists and fee models are all different, so one value can't serve every channel well.
- A host edit made on Airbnb forks that field away from the PMS, so a field's source has to be visible.
## What each channel allows
<table header-row="true" header-column="true">
<tr>
<td></td>
<td>Airbnb</td>
<td>Booking⁠.com</td>
<td>Vrbo</td>
<td>Direct (Hospitable's own)</td>
</tr>
<tr>
<td>Title</td>
<td>Up to 50 characters; no emojis or repeated symbols. [Airbnb](https://www.airbnb.com/resources/hosting-homes/a/guidelines-for-writing-your-listing-title-533)</td>
<td>Property name 3–255 characters; no phone numbers, emojis or all caps; changes are reviewed. Hospitable doesn't push it today. [API](https://developers.booking.com/connectivity/docs/property-api/implementing-property-api-ga) · [Hospitable](https://help.hospitable.com/en/articles/6141381-properties-details-page)</td>
<td>Headline 20–40 characters; bans amenity lists, "private", discounts, contact details. [Vrbo](https://help.vrbo.com/articles/What-are-the-listing-guidelines)</td>
<td>No published limit; can differ per channel. [Hospitable](https://help.hospitable.com/en/articles/6141381-properties-details-page)</td>
</tr>
<tr>
<td>Description, and who writes it</td>
<td>The host, in sections: description, the space, guest access, interaction, other details, neighbourhood, getting around. [Airbnb](https://www.airbnb.com/resources/hosting-homes/a/sprucing-up-your-listing-description-13)</td>
<td>**Booking⁠.com writes it** from room details, facilities and location, and translates it. Hosts can only request a fix; Hospitable can't push text. [Booking.com](https://partner.booking.com/en-us/help/property-page/general-info/updating-your-property-page) · [Hospitable](https://help.hospitable.com/en/articles/6141381-properties-details-page)</td>
<td>The host: one combined description, 400–10,000 characters. [Vrbo](https://help.vrbo.com/articles/What-are-the-listing-guidelines)</td>
<td>The host, in Airbnb-style sections.</td>
</tr>
<tr>
<td>Photos and order</td>
<td>Host sets cover and order; Airbnb's AI assigns photos to rooms for the photo tour. [Airbnb](https://www.airbnb.com/help/article/477)</td>
<td>Smart ordering is on by default and must be turned off to reorder by hand. Hospitable pushes photos to single-room listings only. [API](https://developers.booking.com/connectivity/docs/photo-api/understanding-the-photo-api) · [Hospitable](https://help.hospitable.com/en/articles/13847107-managing-property-photos-in-hospitable)</td>
<td>At least 6 photos at all times (fewer risks suspension); Vrbo's AI ignores the order and cover the PMS sends. [Vrbo](https://help.vrbo.com/articles/Vrbo-photo-guidelines) · [Hospitable](https://help.hospitable.com/en/articles/13847107-managing-property-photos-in-hospitable)</td>
<td>One gallery in Hospitable: per-channel visibility and cover, one order. [Hospitable](https://help.hospitable.com/en/articles/13847107-managing-property-photos-in-hospitable)</td>
</tr>
<tr>
<td>Amenities</td>
<td>Its own list at listing level (a bathtub is amenity 61).</td>
<td>Facilities at room and property level (a bathtub is room facility 5); pets is a policy, not an amenity. [API](https://developers.booking.com/connectivity/docs/content-api-modules/facilities-api/property-room-facilities-list)</td>
<td>Some amenities live inside a bathroom card rather than the amenity list.</td>
<td>Hospitable's own list, with channel logos per amenity. [Hospitable](https://help.hospitable.com/en/articles/12571062-property-amenities-overview)</td>
</tr>
<tr>
<td>Fees and pricing</td>
<td>Cleaning, pet, extra guest, short-stay cleaning; guests see a total price in search. [fees](https://www.airbnb.com/help/article/2385) · [total price](https://news.airbnb.com/total-price-display-is-now-standard-globally)</td>
<td>Rate plans; Hospitable syncs one parent rate plan per listing and doesn't manage the pet fee. [Hospitable](https://help.hospitable.com/en/articles/10404409-managing-rate-plans-on-booking-com) · [fees](https://help.hospitable.com/en/articles/11596133-listing-management-manage-fees-for-airbnb-booking-com-and-direct)</td>
<td>Cleaning, pet, extra guest and custom fees. Whether Hospitable pushes them: its own articles disagree.</td>
<td>Hospitable's own: nightly price, fees, discounts.</td>
</tr>
<tr>
<td>Policies and rules</td>
<td>Cancellation tiers from Flexible to Firm (Strict by invitation); structured house rules plus free-text additional rules. [Airbnb](https://www.airbnb.com/help/article/475) · [rules](https://www.airbnb.com/help/article/472)</td>
<td>Structured house rules only, no free text through the API; cancellation set per rate plan in the Extranet. [API](https://developers.booking.com/connectivity/docs/set-house-rules) · [Hospitable](https://help.hospitable.com/en/articles/10404409-managing-rate-plans-on-booking-com)</td>
<td>Structured rules plus up to 3 custom rules of 50 characters. [Vrbo](https://help.vrbo.com/articles/Add-or-edit-house-rules)</td>
<td>Hospitable's own, including a required cancellation policy.</td>
</tr>
<tr>
<td>What Hospitable can push</td>
<td>Almost everything. A field the host edits on Airbnb stops syncing until it's unlocked. [Airbnb](https://www.airbnb.com/help/article/2973) · [Hospitable](https://help.hospitable.com/en/articles/12673567-property-details-locked-fields)</td>
<td>Facts, facilities, photos (single-room), fees except pets, prices and availability. Not the description, not free-text rules, not (today) the name.</td>
<td>Under the Partner connection Vrbo expects the PMS to write all content. Exactly which fields Hospitable writes is unclear. [Vrbo](https://help.vrbo.com/articles/About-Vrbo-integration)</td>
<td>Everything: Hospitable owns it.</td>
</tr>
</table>
<span color="gray">Vrbo is researched here but not built in the prototype, whose channels are Airbnb, Booking⁠.com and Direct. Full sources for every cell, with short quotes, are in the repo files below.</span>
## Three implications for the design
1. **Some fields are set by the channel.** Booking⁠.com writes its own description, so in Smart Listings that field is read-only and labelled "Booking⁠.com decides". A host shapes it through facts, photos and amenities instead. No text box that goes nowhere. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/>
2. **Every field has to say whose value it is.** Because channels differ and Airbnb forks fields edited on Airbnb, each field on a channel page reads "Uses the Base", "Custom for Airbnb", or "Booking⁠.com decides". <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/>
3. **Tips must be written per channel, and not only for copy.** Limits, photo floors, fee models and policies differ by channel, so each tip belongs to one channel and can be about money and stay rules as much as words. <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef"/>
![The prototype's [Booking.com](http://Booking.com) Listing page: the property name and photos are customised for [Booking.com](http://Booking.com), and the Summary is locked with "[Booking.com](http://Booking.com) decides". Prototype screen; listing content is demo data (SIMULATED).](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/1d882773-2179-4122-beae-e0438bcb8fc3/dc-proto-booking-listing.png)
<span color="gray">One difference from the sources: the research found Hospitable doesn't push the Booking⁠.com name today, though Booking⁠.com's API accepts one. The prototype lets the host customise it for Booking⁠.com, assuming that path is switched on.</span>
## How it was made
From the channels' own documentation. See <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/> · <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef"/> · **In the prototype** [website](https://hospitable-case-djur32.vercel.app) › a property › Channels › Booking⁠.com › Listing · **Files** <span color="gray">`research/market/channel-constraints.md`</span><span color="gray">, </span><span color="gray">`channel-fields.csv`</span><span color="gray">, </span><span color="gray">`raw/`</span>
</content>
</page>
