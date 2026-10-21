<page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Canvas preview"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · The Canvas: each channel's listing shown as its guests see it, used to find and open the field behind any part of the page. Provenance: prototype screens; the Airbnb and Booking⁠.com replicas follow the channels' real pages (`REAL·PUBLIC`), Direct is a plain direct-booking site, and the listing in all three is `SIMULATED`.
</callout>
![Canvas on Airbnb with the Tips panel open: the title the tip is about is outlined in purple and shows the suggested name in place. Prototype · sample listing `SIMULATED`](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/ed6b6bb6-a3f0-435c-bc0c-3c45d3f48886/cv-airbnb.png)
## The short version
- **Classic \| Canvas** sits in every channel Listing's header. Canvas shows the channel's guest page in a browser frame: "The page as Airbnb guests see it".
- **Replicas of the real Airbnb and Booking⁠.com pages**, plus a direct-booking site for Direct, filled from the listing's current settings: title, photos, descriptions, price lines, cancellation.
- **Colour says what you can do:** purple where a tip waits, orange where you can edit here, no colour where the value is owned elsewhere.
- **Tapping a part opens its field or its tip in the side panel.** Nothing is edited on the page itself, and the page is never dimmed.
- **Show only editable sections** hides everything you can't change here.
## What tapping does
<table fit-page-width="true" header-row="true">
<colgroup>
<col>
<col>
<col width="342">
</colgroup>
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
<td>Owned elsewhere: a Knowledge Hub fact, Pricing, Booking policies, the calendar, or the channel itself</td>
<td>A short note on where it comes from, with a link there ("Price comes from Pricing · Set in Pricing").</td>
</tr>
</table>
Photos open the full-screen Manage photos for that channel. The booking card's nightly price and cleaning fee open Pricing's rows. Edits wait for the one Discard / Save bar, as in Classic, and **Your edits \| Live now** switches between the draft and what guests see today. With Autopilot on, nothing is orange.
![Canvas on Booking⁠.com after tapping the title: the property name opens in the side panel with its "Custom for Booking⁠.com" caption and Use the Base. Prototype · sample listing `SIMULATED`](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/aa14e148-a3c2-460b-a5e0-4e1b0dcd686d/da-cv-select.png)
## Why it works this way
- **Hosts recognise their own listing.** Today no screen in Hospitable shows one listing as it appears on one channel (`REAL·PRODUCT`, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/>). The replicas follow each channel's real page, including the parts the channel writes itself (<mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e"/>).
- **One field, one editor.** The Canvas opens the same field Classic shows, so it is a way to find a field rather than a second editor. Inline editing on the page was built and dropped in design review.
- **It never contradicts the settings.** The replicas read the live values, so what the Canvas shows is what the channel pages hold.
## How it was made
Each replica copies a real Airbnb or Booking⁠.com listing page section by section, from full-page screenshots I captured (`REAL·PUBLIC`), and was reviewed against them. Channel colours appear only inside the replica; the Hospitable chrome around it uses Hospitable's tokens.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/> · <mention-page url="https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d"/> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af1645819e9675db2668610c2b"/> · <mention-page url="https://app.notion.com/p/3eee18af164581e7844fc2de20912029"/>
**In the prototype** · [Airbnb Canvas with Tips](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/airbnb/listing/essentials?smart=on&view=canvas&tip=t-a-name) · [Booking⁠.com Canvas](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/booking/listing/essentials?smart=on&view=canvas) · [Direct Canvas](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/direct/listing/essentials?smart=on&view=canvas)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/canvas/`</span><span color="gray"> (CanvasView, AirbnbPage, BookingPage, DirectPage, FieldPanel, PricePanel) · </span><span color="gray">`prototype/src/data/v3-cv.ts`</span><span color="gray"> · </span><span color="gray">`prototype/src/ds/v3-cv.tsx`</span>
</content>
</page>
