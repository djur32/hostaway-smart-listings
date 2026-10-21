<callout icon="✅" color="gray_bg">
	**Output · Done** · How a host manages a listing in Hostaway today, limited to what Smart Listings changes. Provenance: (trial account, one Airbnb listing in Berlin), plus the help centre where marked .
</callout>
![Today's listing management, mapped: the global sidebar, the properties list, a property's menu and the global Calendar. Red letters mark the seven per-channel patterns; red arrows mark where navigation leaves the property. Provenance: .](file-upload://3efe18af-1645-8178-93e3-00b2aebadb0f)
## The short version
- The **property** is what the menu is built around. The **listing**, the thing a guest reads on Airbnb, isn't a place anywhere in it.
- The **Knowledge Hub repeats the listing and has no job of its own.** It keeps its own copy, later edits don't reach it, the assistant answers guests from it, and nobody sees what guests ask.
- "Different per channel" is done **seven different ways**, field by field. No screen shows one listing on one channel.
- **AI** today: **The assistant** answers hosts' business questions, writes replies and answers guests from the Knowledge Hub. None of it works on the listing. The only listing recommendations are **Airbnb's Opportunities**.
## The property menu today
<table header-row="true">
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
		<td>Facts written as sentences under nine topics, for the assistant's answers to guests</td>
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
## How the Knowledge Hub works today
Details holds typed fields that Hostaway pushes to the channels. Next to it, the Knowledge Hub holds sentences under nine topics, for the assistant's answers to guests. This is how it works for any host:
1. **The Hub keeps its own copy of the listing.** It is generated on request, when the host presses Generate, from Details and past messages. Later edits to Details don't reach it, so the copy drifts by design. [help.hostaway.com · Knowledge Hub page](https://help.hostaway.com/en/articles/9716792-property-knowledge-hub-page)
2. **It repeats the listing.** It restates amenities, rules and check-in as its own sentences, beside the fields that already hold them. On a trial listing, Details says "Washer" where the Hub says "Washing machine", and the house rules exist three times: a paragraph in Arrival › House manual, an empty Rules › House rules field, and six Hub sentences. observed on a trial listing
3. **"Ask the AI" answers from that copy, not from the listing.** So it can state what nothing backs. On a trial listing it told a guest "Yes, the apartment is wheelchair accessible", with no amenity or house-manual line saying so. observed on a trial listing
4. **No one sees what guests ask.** Guest questions live in the Inbox, and nothing turns them into knowledge or into improvements to the listing. from the <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page>
So the Hub has no job of its own. The design gives it one: it reads the listing details from the Listing base, adds the situations behind them, and learns from guests' questions (<mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>).
![Knowledge Hub › Amenities on a trial listing: "Washing machine" (Details says "Washer") and "Wheelchair accessible" (not in Details at all), each dated and with one composite source. Provenance: .](file-upload://3efe18af-1645-8171-a71b-00b2ca50d90d)
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
![Pricing › Fees: the cleaning fee reads "ⓘ 1 channels · Edit per channel", and an Airbnb-only fee sits inline among the property's fees. Provenance: .](file-upload://3efe18af-1645-81d6-afad-00b2c3d2da0a)
## Where AI exists today
**The assistant** is Hostaway's assistant for hosts. It answers natural-language business questions across the portfolio, writes smart replies, and shows what's working and what isn't ([hostaway.com](https://hostaway.com)). It is marked with a sparkle, purple on lavender, and the same sparkle sits in the product's sidebar footer (). Like the two surfaces below, it doesn't work on listing fields.
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
![Overview: the listing as one row, with "Lead listing", "Fully managed" and the Review opportunities link. Provenance: .](file-upload://3efe18af-1645-81eb-ad50-00b21b032f01)
## What this means for Smart Listings
- the assistant already has hosts' trust and its own look → Smart Listings expands the assistant into the listing instead of adding a new AI. <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
- One place for the facts, read by the channels and the assistant alike → the Listing base in Shared, which the Knowledge Hub reads instead of copying. The Hub's own job becomes the situations behind the listing and guests' questions.
- One rule for per-channel values, and a page per channel → every field uses the Base, is customised, exists only on that channel, or is set by the channel.
- Recommendations on every channel, grounded in the home's facts → tips with their why and sources.
## How it was made
From the screenshots, a read-only pass through the trial account and the help centre. See <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953">00 · Brief & scope</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde">KD-03</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
**In the prototype**
- <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3">UI changes</mention-page>
