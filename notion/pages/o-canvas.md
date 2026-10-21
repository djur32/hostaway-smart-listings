<callout icon="✅" color="gray_bg">
	**Output · Done** · The Canvas: each channel's listing shown as its guests see it, used to find and open the field behind any part of the page. Provenance: prototype screens; the Airbnb and Booking⁠.com replicas follow the channels' real pages (), Direct is a plain direct-booking site, and the listing in all three is .
</callout>
![Canvas on Airbnb with the Tips panel open: the title the tip is about is outlined in purple and shows the suggested name in place. Prototype · sample listing ](file-upload://3eee18af-1645-81ac-a9aa-00b28a41844a)
## The short version
- **Classic \| Canvas** sits in every channel Listing's header. Canvas shows the channel's guest page in a browser frame: "The page as Airbnb guests see it".
- **Replicas of the real Airbnb and Booking⁠.com pages**, plus a direct-booking site for Direct, filled from the listing's current settings: title, photos, descriptions, price lines, cancellation.
- **Colour says what you can do:** purple where a tip waits, orange where you can edit here, no colour where the value is owned elsewhere.
- **Tapping a part opens its field or its tip in the side panel.** Nothing is edited on the page itself, and the page is never dimmed.
- **Show only editable sections** hides everything you can't change here.
## What tapping does
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Outline</td>
		<td>Means</td>
		<td>Tapping it opens</td>
	</tr>
	<tr>
		<td>Purple</td>
		<td>A tip waits on this part</td>
		<td>That tip, alone in the panel. While the Tips panel is open, each tip lights up its part and shows its suggestion in place.</td>
	</tr>
	<tr>
		<td>Orange</td>
		<td>Editable here</td>
		<td>The same field as Classic, with its scope caption, Customize or Use the Base, and Rewrite with AI behind the orange icon.</td>
	</tr>
	<tr>
		<td>None</td>
		<td>Owned elsewhere: a Listing base fact, Pricing, Booking policies, the calendar, or the channel itself</td>
		<td>A short note on where it comes from, with a link there ("Price comes from Pricing · Set in Pricing").</td>
	</tr>
</table>
Photos open the full-screen Manage photos for that channel. The booking card's nightly price and cleaning fee open Pricing's rows. Edits wait for the one Discard / Save bar, as in Classic, and **Your edits \| Live now** switches between the draft and what guests see today. With Autopilot on, nothing is orange.
![Canvas on Booking⁠.com after tapping the title: the property name opens in the side panel with its "Custom for Booking⁠.com" caption and Use the Base. Prototype · sample listing ](file-upload://3eee18af-1645-8136-a208-00b2adc0e89e)
## Why it works this way
- **Hosts recognise their own listing.** Today no screen in Hostaway shows one listing as it appears on one channel (<mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>). The replicas follow each channel's real page, including the parts the channel writes itself (<mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>).
- **One field, one editor.** The Canvas opens the same field Classic shows, so it is a way to find a field rather than a second editor. Inline editing on the page was built and dropped in design review.
- **It never contradicts the settings.** The replicas read the live values, so what the Canvas shows is what the channel pages hold.
## How it was made
Each replica copies a real Airbnb or Booking⁠.com listing page section by section, from full-page screenshots I captured (), and was reviewed against them. Channel colours appear only inside the replica; the Hostaway chrome around it uses Hostaway's tokens.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d">Concept directions</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645819e9675db2668610c2b">KD-14</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581e7844fc2de20912029">KD-10</mention-page>
**In the prototype**
- [Airbnb Canvas with Tips]()
- [Booking⁠.com Canvas]()
- [Direct Canvas]()
