<page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/48cc3ac66701403aa02abd43c3127e12" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7261d150557441ca8da996f6ffbb240f" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8" title="01 · Discovery"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Current-state map"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · How a host manages a listing in Hospitable today, limited to what Smart Listings changes. Provenance: `REAL·PRODUCT` (trial account, one Airbnb listing in Berlin), plus the help centre where marked `REAL·PUBLIC`.
</callout>
![Today's listing management, mapped: the global sidebar, the properties list, a property's menu and the global Calendar. Red letters mark the seven per-channel patterns; red arrows mark where navigation leaves the property. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/bd05bbe0-5c6b-48bb-91e0-7608f08f7b7e/dc-ia-today.png)
## The short version
- The **property** is what the menu is built around. The **listing**, the thing a guest reads on Airbnb, isn't a place anywhere in it.
- The facts about a home live in **two stores that disagree**, Details and the Knowledge Hub. On the trial property, 14 of 28 filled facts match.
- "Different per channel" is done **seven different ways**, field by field. No screen shows one listing on one channel.
- **AI** today answers guests, from the Knowledge Hub. The only listing recommendations are **Airbnb's Opportunities**.
## The property menu today
<table header-row="true">
<colgroup>
<col>
<col width="489">
</colgroup>
<tr>
<td>Menu item</td>
<td>What it holds for a listing</td>
</tr>
<tr>
<td>Overview</td>
<td>Each connected channel as a row, with its status ("Unlisted"), "Lead listing" and "Fully managed" pills; a Review opportunities link</td>
</tr>
<tr>
<td>Details</td>
<td>Essentials · Arrival · Location · Amenities · Rules. Every field carries an "ⓘ N channels" label; many have Edit per channel</td>
</tr>
<tr>
<td>Pricing · Availability</td>
<td>Base price, occupancy, fees, deposits, discounts, taxes · minimum stay, booking rules, Instant book</td>
</tr>
<tr>
<td>Calendar</td>
<td>Leaves the property for the global Calendar, whose side panel edits the same prices and fees a second time</td>
</tr>
<tr>
<td>Knowledge Hub</td>
<td>Facts written as sentences under nine topics, for the guest AI</td>
</tr>
<tr>
<td>Booking policies</td>
<td>Cancellation policies, one section per channel</td>
</tr>
<tr>
<td>Guest experience · Operations</td>
<td>Portfolio-wide rules, filtered to this property</td>
</tr>
<tr>
<td>Direct</td>
<td>A page of its own: sites, bank account, cancellation policy, promo codes</td>
</tr>
</table>
## Two truths: Details vs the Knowledge Hub
Details holds typed fields that Hospitable pushes to the channels. The Knowledge Hub holds sentences under topics, read by the messaging AI. The Hub is generated on request from Details and past messages, and later edits to Details don't reach it (`REAL·PUBLIC` [help.hospitable.com · Knowledge Hub page](https://help.hospitable.com/en/articles/9716792-property-knowledge-hub-page)). So the copies drift by design.
<table header-row="true">
<tr>
<td>Verdict, fact by fact</td>
<td>Facts</td>
</tr>
<tr>
<td>Same fact, same meaning</td>
<td>14</td>
</tr>
<tr>
<td>Same fact, different words ("Washer" vs "Washing machine")</td>
<td>3</td>
</tr>
<tr>
<td>Same fact, different place and shape (house rules, parking, Wi-Fi)</td>
<td>5</td>
</tr>
<tr>
<td>Partly carried over (checkout instructions)</td>
<td>1</td>
</tr>
<tr>
<td>Only in the Knowledge Hub (wheelchair access, host contact)</td>
<td>2</td>
</tr>
<tr>
<td>Only in Details (prices and fees, cancellation, children and events)</td>
<td>3</td>
</tr>
</table>
<span color="gray">28 facts with a value in at least one store, out of 34 compared. Provenance: </span><span color="gray">`REAL·PRODUCT`</span><span color="gray">.</span>
Two examples carry the argument:
- **The house rules exist three times:** as a paragraph in Arrival › House manual, as an empty Rules › House rules field, and as six Knowledge Hub sentences.
- **"Wheelchair accessible" is a Knowledge Hub fact with nothing behind it.** No amenity or house-manual line says so, yet Ask the AI answers a guest: "Yes, the apartment is wheelchair accessible."
![Knowledge Hub › Amenities: "Washing machine" (Details says "Washer") and "Wheelchair accessible" (not in Details at all), each dated and with one composite source. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/50483ee1-314a-4735-9925-a724234aa63a/dc-hs-43.png)
## How "different per channel" works today
Seven patterns for one idea. The letters match the map above.
<table header-row="true">
<tr>
<td></td>
<td>Pattern</td>
<td>Where</td>
</tr>
<tr>
<td>a</td>
<td>"ⓘ N channels" plus an Edit per channel link</td>
<td>Free-text fields, the pets toggle, every fee, max stay, advance notice</td>
</tr>
<tr>
<td>b</td>
<td>The label alone, no way to differ</td>
<td>Check-in method, Wi-Fi, address, check-in and checkout times</td>
</tr>
<tr>
<td>c</td>
<td>"All channels"</td>
<td>Amenities</td>
</tr>
<tr>
<td>d</td>
<td>A field for one channel only</td>
<td>Airbnb short-term cleaning fee, Airbnb deposit</td>
</tr>
<tr>
<td>e</td>
<td>One row per listing</td>
<td>Listing markups</td>
</tr>
<tr>
<td>f</td>
<td>A channel × option grid</td>
<td>Instant book</td>
</tr>
<tr>
<td>g</td>
<td>The channel as a section or a page</td>
<td>Cancellation policies, Direct</td>
</tr>
</table>
Edit per channel splits a field in place into one box per channel ("Airbnb summary", "Direct bookings summary"), with "Set one value" to merge it back. The label says how many channels a field reaches, never which ones. To answer "what does Airbnb show right now?", a host checks about 15 places.
![Pricing › Fees: the cleaning fee reads "ⓘ 1 channels · Edit per channel", and an Airbnb-only fee sits inline among the property's fees. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/a31c2dd1-a16a-4b84-8527-9339d0251db1/dc-hs-33.png)
## Where AI exists today
<table header-row="true">
<tr>
<td></td>
<td>What it does</td>
<td>For whom</td>
</tr>
<tr>
<td>Knowledge Hub</td>
<td>Generated by hand ("makes your AI smarter"). Facts per topic, "Sources (1)", and Ask the AI with ten test questions</td>
<td>The messaging AI that drafts guest replies. Nothing flows back to the listing</td>
</tr>
<tr>
<td>Airbnb Opportunities</td>
<td>Review opportunities on Overview opens Airbnb's own recommendations, which apply on Airbnb</td>
<td>Airbnb listings only. For the trial listing: "No opportunities found"</td>
</tr>
</table>
![Overview: the listing as one row, with "Lead listing", "Fully managed" and the Review opportunities link. Provenance: REAL·PRODUCT.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/d5e3272b-1ce4-4fa6-9cef-8792ea0626e4/dc-hs-21.png)
## What this means for Smart Listings
- One place for the facts, read by the channels and the guest AI alike → the Listing base and the Knowledge Hub together in Shared.
- One rule for per-channel values, and a page per channel → every field uses the Base, is customised, or is set by the channel.
- Recommendations on every channel, grounded in the home's facts → tips with their why and sources.
## How it was made
From the screenshots, a read-only pass through the trial account and the help centre. See <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212"/> · <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754"/> · <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde"/> · <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/> · **In the prototype** <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3"/> · **Files** <span color="gray">`research/current-state/ia-current.md`</span><span color="gray"> · </span><span color="gray">`two-truths.md`</span><span color="gray"> · </span><span color="gray">`INDEX.md`</span>
</content>
</page>
