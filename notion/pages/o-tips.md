<callout icon="✅" color="gray_bg">
	**Output · Done** · How Smart Listings suggestions reach the host: tips in one docked panel, and Rewrite with AI where there is no tip. Provenance: prototype screens; every tip, count, inquiry and similar-homes figure is .
</callout>
![A tip on Airbnb › The space: the added words in green, then Why with three sources (a Knowledge Hub fact, guest inquiries, similar homes). Autopilot is on, so the form is read-only. Prototype · sample tip ](file-upload://3eee18af-1645-8164-9723-00b2a87c8a80)
## The short version
- **This is the assistant, expanded.** Tips and Rewrite are Hostaway's existing the assistant working on the listing: the same sparkle, and purple on lavender for what it proposes. Rewrite keeps the sparkle in Hostaway orange, because the host starts it. <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
- **One panel, one tip at a time.** The Tips button at the end of the tab bar, or a field's purple dot, opens a docked panel beside the form. It never drops a card into the page.
- **Every tip says why**, in one to three bullets, each with its source: the strategy and similar homes, guest questions from the Inbox, or a Listing base fact as the Knowledge Hub shows it.
- **Not only copy.** Tips also cover Pricing, Availability and Booking policies, with a count on each tab and on each page in the rail.
- **Written for one channel.** Accepting a tip on a Base field creates that channel's own value; a tip on a shared field says it applies to every channel.
- **One AI affordance per field:** a tip if it has one, otherwise Rewrite with AI if the field can be edited now, otherwise none. Rewrite doesn't need Smart Listings: it works with Smart Listings off too.
## The tip card
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Part</td>
		<td>What it shows</td>
	</tr>
	<tr>
		<td>Head</td>
		<td>The field's name ("THE SPACE") and "x of n", with previous and next. Stepping to a tip on another tab switches tab and scrolls the form to the field.</td>
	</tr>
	<tr>
		<td>Title</td>
		<td>An active verb: "Say how fast the Wi-Fi is", "List self check-in on Booking⁠.com".</td>
	</tr>
	<tr>
		<td>The change</td>
		<td>Short values as before → after; an edit as the text with the added words in green; a rewrite as the new text only.</td>
	</tr>
	<tr>
		<td>Scope line</td>
		<td>On a Base field: "Creates Airbnb's own value. The Base stays as it is." On a shared field: "Applies to every channel. This field is shared, so saving changes it everywhere."</td>
	</tr>
	<tr>
		<td>Generate alternatives</td>
		<td>Where a tip has them, five more options at a time under the suggestion, each with its character count against the channel's limit. Pick one, then Accept.</td>
	</tr>
	<tr>
		<td>Why</td>
		<td>Bullets with a source icon and a tooltip: Strategy (the goal, similar homes), Inbox (guest inquiries and reviews), Knowledge Hub (a listing detail it reads from the Listing base, or a situation the host wrote; the Hub never keeps its own copy of a listing detail).</td>
	</tr>
	<tr>
		<td>Actions</td>
		<td>Dismiss and Accept. Once accepted, the card reads "Accepted" with Undo and Next, and the counts drop.</td>
	</tr>
</table>
![The same panel after Accept: the field is now custom for Airbnb, the card reads Accepted with Undo and Next, and the Listing count drops from 11 to 10. Prototype · sample tip ](file-upload://3eee18af-1645-81e5-ac96-00b2d7faedc2)
## Where tips appear
- **Listing:** every tab (Essentials, Arrival, Location, Amenities, Rules), including photo order and amenities a channel is missing.
- **Pricing:** weekend rate, guests included, cleaning fee, weekly discount. **Availability:** minimum stay, preparation time. **Booking policies:** cancellation and long-term stays.
- **Counts:** on each tab, and in the rail on each page of an open channel; a closed channel shows its total. The sample Airbnb listing has 11 on Listing, 4 on Pricing, 2 on Availability and 2 on Booking policies ().
- **Money waits for Save.** Accepting a price or stay-rule tip fills the field's unsaved edit; it counts as accepted only when the host saves, so a discarded edit doesn't use the tip up. The weekly-discount tip is the exception: Accept sends it at once. Policy tips are illustrative: Accept marks them done, and the policy itself changes through Configure.
- Listing-level tips only. The Listing base's Pricing and Availability pages carry no tips.
![A tip on Airbnb › Pricing on a field shared by every channel: the card says saving changes it everywhere, and each tab shows its count. Prototype · sample figures ](file-upload://3eee18af-1645-817e-98ed-00b2295d7d91)
## Rewrite with AI
An orange sparkle sits beside the label of a free-text field (every long text, and the property name) when that field has no tip and can be edited now: not while it uses the Base, and not under Autopilot. It opens the same docked panel on a composer: type a change, or pick a quick action (Shorten, Summarize, More formal, Warmer, More detail). The result is the same card in orange: the original against the new text, the character count, "Keep refining" follow-ups and Try again, then Dismiss or Accept. Accept puts the text in the field as an unsaved edit; the section's Save sends it.
Rewrite with AI is independent of tips and of Smart Listings. It works on any field the host can type into, even with Smart Listings off and no strategy set. When Smart Listings is on and a field has a tip, the field shows the tip instead, so it still has one AI affordance.
![Rewrite with AI on Booking⁠.com › Property name after "Shorten": the same card in orange, with Keep refining and Accept. The Summary below is set by Booking⁠.com, so it has no AI affordance. Prototype · sample text ](file-upload://3eee18af-1645-819a-858c-00b23b9c1803)
## Autopilot
Chosen per strategy in the wizard, and off by default. With it on, text and photo-order tips apply on their own, inside the guardrails, while prices, stay rules and policies still ask first. In the prototype a channel on Autopilot shows "Autopilot is on · Turn off to edit" on its Listing, with every row read-only, and "Autopilot is on · prices always ask you first" on Pricing. The automatic applying itself is not simulated; the panel still lists the tips.
## The research behind it
Sampled research suggested that explaining a suggestion raises acceptance, that "where it goes" earns the most trust, and that hosts vary money and stay rules per channel much more than words (<mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>). Today the only listing AI in Hostaway is Airbnb's Opportunities (<mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>).
## How it was made
Built in the prototype and reviewed until every tip, on every page, used the one panel and the one card. Tips and Rewrite share the card; only the accent differs, purple for tips and orange for Rewrite.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page> (tip acceptance)
- <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581e7844fc2de20912029">KD-10</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>
**In the prototype**
- [Airbnb › Listing with Tips]()
- [Airbnb › Pricing with Tips]()
- [Booking⁠.com › Listing (Rewrite on Property name)]()
