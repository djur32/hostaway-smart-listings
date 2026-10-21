<callout icon="✅" color="gray_bg">
	**Output · Done** · What Airbnb, Booking.com, Vrbo and Direct allow, for the fields Smart Listings touches. Expedia is mapped for amenities, policies and photos. Provenance: read on the channels' own help, partner and API pages (linked in each cell).
</callout>
## The short version
- Every channel sets its own limits, down to **who writes the listing**. **Booking.com writing its own description** is one example, not the rule. Airbnb lets software write almost everything. Direct is Hostaway's own.
- I have mapped four channels from their public documentation. Expedia is mapped for amenities, policies and photos, from its partner API documentation. What public documentation can't show is planned research, below.
- Title limits, photo rules, amenity lists and fee models are all different, so one value can't serve every channel well.
- A host edit made on Airbnb forks that field away from the PMS, so a field's source has to be visible.
- **Hostaway does the translating.** A host sets amenities once per property and Hostaway pushes them to each connected channel, showing which channels support each one. One bathtub is amenity 61 on Airbnb, room facility BATH on Booking.com, TUB on Vrbo and a shower type on Expedia. [Hostaway](https://help.hostaway.com/en/articles/11596108-listing-management-overview) · [amenities](https://help.hostaway.com/en/articles/12571062-property-amenities-overview)
## What each channel allows
<table header-row="true" header-column="true">
	<tr>
		<td></td>
		<td>Airbnb</td>
		<td>Booking.com</td>
		<td>Vrbo</td>
		<td>Expedia</td>
		<td>Direct (Hostaway's own)</td>
	</tr>
	<tr>
		<td>Title</td>
		<td>Up to 50 characters; no emojis or repeated symbols. [Airbnb](https://www.airbnb.com/resources/hosting-homes/a/guidelines-for-writing-your-listing-title-533)</td>
		<td>Property name 3–255 characters; no phone numbers, emojis or all caps; changes are reviewed. Hostaway doesn't push it today. [API](https://developers.booking.com/connectivity/docs/property-api/implementing-property-api-ga) · [Hostaway](https://help.hostaway.com/en/articles/6141381-properties-details-page)</td>
		<td>Headline 20–40 characters; bans amenity lists, "private", discounts, contact details. [Vrbo](https://help.vrbo.com/articles/What-are-the-listing-guidelines)</td>
		<td>Not public: the lodging content rules sit behind Expedia's partner login, so no limit is confirmed here. [Expedia](https://connectivityportal.expediagroup.com/documentation/expedia)</td>
		<td>No published limit; can differ per channel. [Hostaway](https://help.hostaway.com/en/articles/6141381-properties-details-page)</td>
	</tr>
	<tr>
		<td>Description, and who writes it</td>
		<td>The host, in sections: description, the space, guest access, interaction, other details, neighbourhood, getting around. [Airbnb](https://www.airbnb.com/resources/hosting-homes/a/sprucing-up-your-listing-description-13)</td>
		<td>**Booking.com writes it** from room details, facilities and location, and translates it. Hosts can only request a fix; Hostaway can't push text. [Booking.com](https://partner.booking.com/en-us/help/property-page/general-info/updating-your-property-page) · [Hostaway](https://help.hostaway.com/en/articles/6141381-properties-details-page)</td>
		<td>The host: one combined description, 400–10,000 characters. [Vrbo](https://help.vrbo.com/articles/What-are-the-listing-guidelines)</td>
		<td>Not public: behind the same partner login. Whether Expedia takes a description or who writes it is unconfirmed. [Expedia](https://connectivityportal.expediagroup.com/documentation/expedia)</td>
		<td>The host, in Airbnb-style sections.</td>
	</tr>
	<tr>
		<td>Photos and order</td>
		<td>Host sets cover and order; Airbnb's AI assigns photos to rooms for the photo tour. [Airbnb](https://www.airbnb.com/help/article/477)</td>
		<td>Smart ordering is on by default and must be turned off to reorder by hand. Hostaway pushes photos to single-room listings only. [API](https://developers.booking.com/connectivity/docs/photo-api/understanding-the-photo-api) · [Hostaway](https://help.hostaway.com/en/articles/13847107-managing-property-photos-in-hostaway)</td>
		<td>At least 6 photos at all times (fewer risks suspension); Vrbo's AI ignores the order and cover the PMS sends. [Vrbo](https://help.vrbo.com/articles/Vrbo-photo-guidelines) · [Hostaway](https://help.hostaway.com/en/articles/13847107-managing-property-photos-in-hostaway)</td>
		<td>At least 3 per property. Expedia suggests 20 or more, with 4 per room type and 1 of the bathroom. [API](http://web.archive.org/web/20250616055244/https://developers.expediagroup.com/supply/lodging/docs/property_mgmt_apis/property/reference/property_resources/)</td>
		<td>One gallery in Hostaway: per-channel visibility and cover, one order. [Hostaway](https://help.hostaway.com/en/articles/13847107-managing-property-photos-in-hostaway)</td>
	</tr>
	<tr>
		<td>Amenities</td>
		<td>Its own list at listing level (a bathtub is amenity 61).</td>
		<td>Facilities at room and property level (a bathtub is room facility 5); pets is a policy, not an amenity. [API](https://developers.booking.com/connectivity/docs/content-api-modules/facilities-api/property-room-facilities-list)</td>
		<td>Some amenities live inside a bathroom card rather than the amenity list.</td>
		<td>Amenities belong to a room type, as a code plus a detail code. A plain bathtub is a shower type (`ROOM_SHOWER_TYPE` · `BATHTUB_ONLY`), so which bathroom it's in is lost. `ROOM_WASHER` means washer and dryer. [API](http://web.archive.org/web/20251215122848/https://developers.expediagroup.com/supply/lodging/docs/property_mgmt_apis/product/reference/enumerations)</td>
		<td>Hostaway's own list, with channel logos per amenity. [Hostaway](https://help.hostaway.com/en/articles/12571062-property-amenities-overview)</td>
	</tr>
	<tr>
		<td>Fees and pricing</td>
		<td>Cleaning, pet, extra guest, short-stay cleaning; guests see a total price in search. [fees](https://www.airbnb.com/help/article/2385) · [total price](https://news.airbnb.com/total-price-display-is-now-standard-globally)</td>
		<td>Rate plans; Hostaway syncs one parent rate plan per listing and doesn't manage the pet fee. [Hostaway](https://help.hostaway.com/en/articles/10404409-managing-rate-plans-on-booking-com) · [fees](https://help.hostaway.com/en/articles/11596133-listing-management-manage-fees-for-airbnb-booking-com-and-direct)</td>
		<td>Cleaning, pet, extra guest and custom fees. Whether Hostaway pushes them: its own articles disagree.</td>
		<td>Not public: fee rules are behind the same partner login, so which fees Hostaway can push is unconfirmed. [Expedia](https://connectivityportal.expediagroup.com/documentation/expedia)</td>
		<td>Hostaway's own: nightly price, fees, discounts.</td>
	</tr>
	<tr>
		<td>Policies and rules</td>
		<td>Cancellation tiers from Flexible to Firm (Strict by invitation); structured house rules plus free-text additional rules. [Airbnb](https://www.airbnb.com/help/article/475) · [rules](https://www.airbnb.com/help/article/472)</td>
		<td>Structured house rules only, no free text through the API; cancellation set per rate plan in the Extranet. [API](https://developers.booking.com/connectivity/docs/set-house-rules) · [Hostaway](https://help.hostaway.com/en/articles/10404409-managing-rate-plans-on-booking-com)</td>
		<td>Structured rules plus up to 3 custom rules of 50 characters. [Vrbo](https://help.vrbo.com/articles/Add-or-edit-house-rules)</td>
		<td>Coded policies, such as `SMOKING_POLICY` · `SMOKE_FREE_PROPERTY` or `EVENTS_OR_PARTIES_NOT_ALLOWED`. The documented codes have no free-text house rules. To be confirmed. [API](http://web.archive.org/web/20240830093457/https://developers.expediagroup.com/supply/lodging/docs/property_mgmt_apis/property/reference/enumerations)</td>
		<td>Hostaway's own, including a required cancellation policy.</td>
	</tr>
	<tr>
		<td>What Hostaway can push</td>
		<td>Almost everything. A field the host edits on Airbnb stops syncing until it's unlocked. [Airbnb](https://www.airbnb.com/help/article/2973) · [Hostaway](https://help.hostaway.com/en/articles/12673567-property-details-locked-fields)</td>
		<td>Facts, facilities, photos (single-room), fees except pets, prices and availability. Not the description, not free-text rules, not (today) the name.</td>
		<td>Under the Partner connection Vrbo expects the PMS to write all content. Exactly which fields Hostaway writes is unclear. [Vrbo](https://help.vrbo.com/articles/About-Vrbo-integration)</td>
		<td>Not public: behind the same partner login, so which fields Hostaway can write is unconfirmed. [Expedia](https://connectivityportal.expediagroup.com/documentation/expedia)</td>
		<td>Everything: Hostaway owns it.</td>
	</tr>
</table>
<span color="gray">Vrbo is researched here but not built in the prototype, whose channels are Airbnb, Booking.com and Direct. Expedia's amenities, policies and photos come from its partner API documentation, now behind a login and read in the Internet Archive. Its other cells are part of the planned research. Full sources for every cell, with short quotes, are in the repo files below.</span>
## Three implications for the design
1. **Some fields are set by the channel.** Booking.com's description is one example. Booking.com writes it, so in Smart Listings that field is read-only, labelled "Booking.com only" with a lock whose tooltip says why. A host shapes it through facts, photos and amenities instead. No text box that goes nowhere. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
2. **Every field has to say whose value it is.** Because channels differ and Airbnb forks fields edited on Airbnb, each field on a channel page says which of four cases it is: "Uses the Base", "Custom for Airbnb", "Airbnb only" for a field one channel has, or "Booking.com only" with a lock for a field the channel sets. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
3. **Tips must be written per channel, and not only for copy.** Limits, photo floors, fee models and policies differ by channel, so each tip belongs to one channel and can be about money and stay rules as much as words. <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page>
![The prototype's Booking.com Listing page: the property name and photos are customised for Booking.com, and the Summary is set by Booking.com. It is read-only, marked "Booking.com only" with a lock whose tooltip says why. Prototype screen. The listing content is demo data.](file-upload://3f0e18af-1645-8188-8ce6-00b2e3b51bd0)
<span color="gray">One difference from the sources: the research found Hostaway doesn't push the Booking.com name today, though Booking.com's API accepts one. The prototype lets the host customise it for Booking.com, assuming that path is switched on.</span>
## Planned research
<span color="gray">Planned · not run.</span> Booking.com is one example of a limit. Each channel has its own, and public documentation only shows part of them. So I'd map every channel (Airbnb, Booking.com, Vrbo, Expedia and Direct) with Hostaway's integrations team, field by field.
<table header-row="true">
	<tr>
		<td>What I'd map, per channel</td>
		<td>What it decides in the product</td>
	</tr>
	<tr>
		<td>What Hostaway can write</td>
		<td>Whether a field uses the Base, is customised, exists only on that channel, or is set by the channel and locked.</td>
	</tr>
	<tr>
		<td>How fast a change goes live</td>
		<td>What the receipt after Save promises, and when Performance starts counting.</td>
	</tr>
	<tr>
		<td>What the channel overwrites</td>
		<td>Where the product warns before a change is lost, as when Airbnb forks a field edited there.</td>
	</tr>
	<tr>
		<td>How it becomes channel rules</td>
		<td>Each channel's limits live in one set of rules. Field states, tips, Rewrite with AI and receipts all read them, so a limit is explained once, in the same words, wherever it applies.</td>
	</tr>
</table>
The answers update this page. The questions go to the integrations lead in <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page>, in week 1 of the <mention-page url="https://app.notion.com/p/3efe18af1645814192a0fa0c2f22f757">Research plan</mention-page>.
## How it was made
From the channels' own documentation. See <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Desk research</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Desk research</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page>
**In the prototype**
- [website]() › a property › Channels › Booking.com › Listing
