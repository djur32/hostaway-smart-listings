<callout icon="✅" color="gray_bg">
	**Output · Done** · The design system behind the prototype: Hospitable's own tokens as the base, plus the few patterns Smart Listings needed. Provenance: the base tokens are Hospitable's public CSS (`REAL·PUBLIC`, [their stylesheet](https://my.hospitable.com/static/styles-K7T6MMZ5.css)); colour roles are traced to the product's screenshots (`REAL·PRODUCT`).
</callout>
![The design-system gallery: Hospitable's raw colour scales under Hospitable's own names, used verbatim. REAL·PUBLIC.](file-upload://3eee18af-1645-8111-8bad-00b20b3b1c16)
## The short version
- The base is Hospitable's own: **244 root CSS variables** captured from the app's public stylesheet and used as they are, under their own names.
- On top sits a role layer that says what each colour does, matched to pixels in the screenshots. The prototype and the deck use these tokens only, never a raw colour.
- Ten patterns were added for Smart Listings. Each was added to the system first, then used on screens.
- I also challenged some of Hospitable's own patterns, such as where Save changes appears. These reach far beyond listings, so I'd weigh them with each product team and test them before they spread.
## The base
- **Raw layer:** Hospitable's palette (gray, primary, secondary, success, error, warning…) and semantic names, copied verbatim, so an engineer there recognises every token.
- **Role layer:** sidebar, actions, pills, AI, channels, type, space, radius, motion, elevation. Most roles match a Hospitable token exactly; anything guessed is marked `ASSUMPTION`.
- **Colour means one thing:** raspberry to act (one primary per view), purple for what the AI proposes (tips), orange for Rewrite with AI, which the host starts, green for chosen or done.
- **Type and icons:** TT Norms, from my licensed files, and Tabler outline icons.
- **The AI speaks AI Copilot's language:** the sparkle icon and purple on lavender are the ones Hospitable uses for AI Copilot (`REAL·PUBLIC`, hospitable.com) and in the product's sidebar footer (`REAL·PRODUCT`). Tips, the Tips panel and Rewrite reuse them, so every AI surface reads as the same assistant. <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
## What I added
<table header-row="true">
	<tr>
		<td>Pattern</td>
		<td>What it is</td>
		<td>Where it's used</td>
	</tr>
	<tr>
		<td>**Tip card and Tips panel**</td>
		<td>One card for every suggestion: the field in purple caps, x of n, the change, a short Why with its sources, Dismiss and Accept. One docked panel, opened from the Tips button or a field's purple icon</td>
		<td>Each channel's Listing, Pricing, Availability and Booking policies; Canvas</td>
	</tr>
	<tr>
		<td>**Scope caption**</td>
		<td>The line under a field: "ⓘ Uses the Base", "Custom for Airbnb", "Airbnb only", "Booking.com only" with a lock, or "N channels" on the left, one text link on the right. Hovering shows the values behind it</td>
		<td>Every field on the Listing base and channel pages</td>
	</tr>
	<tr>
		<td>**Lock with a reason**</td>
		<td>A disabled field with a lock where the chevron was, and the reason in Hospitable's dark tooltip</td>
		<td>Property type, Room type and the address on the Base. Booking.com's Summary shows the lock with "Booking.com only", and its tooltip says why</td>
	</tr>
	<tr>
		<td>**Rewrite composer**</td>
		<td>Describe a change or pick Shorten, Summarize, More formal, Warmer or More detail. The result shows in the tip card's shape, original against new; nothing changes until Accept</td>
		<td>Long text fields and Property name, in Classic and in Canvas's field panel</td>
	</tr>
	<tr>
		<td>**Panel stack**</td>
		<td>Drill-downs slide in beside the page; the previous level folds into a thin spine; going back plays it in reverse</td>
		<td>Pricing (Dynamic Pricing, Security deposit) and Calendar › a night</td>
	</tr>
	<tr>
		<td>**Unsaved changes bar and toasts**</td>
		<td>The bar shows only when something changed and guards leaving with Keep editing, Discard changes, Save changes. Toasts sit at the bottom of the content column, fade after 5 s, pause on hover and can carry Undo</td>
		<td>Every editing screen</td>
	</tr>
	<tr>
		<td>**Full-screen wizard**</td>
		<td>Hospitable's Add-property flow made reusable: top bar, progress line, one question per screen, Back and Continue</td>
		<td>Smart Listings strategy; Booking policies › Configure</td>
	</tr>
	<tr>
		<td>**KPI and chart cards**</td>
		<td>From Hospitable's Metrics: compact KPI cards and widget cards with a Bar or Line setting, showing the period before the strategy and the period since</td>
		<td>Smart Listings › Performance</td>
	</tr>
	<tr>
		<td>**Bottom sheet**</td>
		<td>The phone form of every side panel, with a grip to drag it closed and a full-screen variant for long edits</td>
		<td>All screens at phone width</td>
	</tr>
	<tr>
		<td>**Drawer motion**</td>
		<td>Side panels slide in from the right while the form narrows in step, in 160 ms with one shared curve. Content never rescales</td>
		<td>Tips, Rewrite, Hub drawers, panel stack, the unsaved bar</td>
	</tr>
</table>
![Rewrite with AI in the docked panel: the orange composer and quick actions, beside fields with their scope captions. Live prototype, values SIMULATED.](file-upload://3eee18af-1645-815b-9e6f-00b21009a9ac)
## Patterns I challenged and introduced
Smart Listings didn't only add to Hospitable's system. Some of its own patterns I questioned and changed, and I would consolidate those changes elsewhere in the platform rather than keep two versions. Each row below exists in the prototype's code. Four matter most, as in the deck: drill-down navigation, counts that move, stacked fields, and a Save that shows only when something changed.
<table header-row="true">
	<tr>
		<td>Hospitable pattern I challenged</td>
		<td>Today</td>
		<td>What I did</td>
	</tr>
	<tr>
		<td>**Drill-down navigation**</td>
		<td>Only the main menu opens to sub-pages. A property's sections are flat links (`REAL·PRODUCT`)</td>
		<td>Each section opens to its pages in the side menu: Listing base to Details, Pricing and Availability, each channel to its own pages</td>
	</tr>
	<tr>
		<td>**Counts in the menu**</td>
		<td>No counts on the property menu (`REAL·PRODUCT`)</td>
		<td>Counts that move: the total sits on the parent while it's closed, and each page shows its own once it's open</td>
	</tr>
	<tr>
		<td>**Inline fields**</td>
		<td>Label on the left, input on the right (`REAL·PRODUCT`)</td>
		<td>Stacked fields: the label sits above the input, so Tips or Canvas fit as a second column</td>
	</tr>
	<tr>
		<td>**Where Save changes appears**</td>
		<td>Discard and Save sit on each section's header, always visible, disabled until something changes (`REAL·PRODUCT`)</td>
		<td>A bar at the bottom of the area being edited, only when something changed. Leaving asks first: Keep editing, Discard changes, Save changes. Then a toast: "Changes saved", the channels it reached, and Undo</td>
	</tr>
	<tr>
		<td>**Close ×**</td>
		<td>The outlined × of Hospitable's dialogs</td>
		<td>The same outlined ×, in three sizes, for every close, dismiss and remove</td>
	</tr>
	<tr>
		<td>**Locked fields**</td>
		<td>Disabled, with a chevron and no reason (`REAL·PRODUCT`)</td>
		<td>A lock, and the reason in Hospitable's dark tooltip</td>
	</tr>
</table>
And these are new, each added to the system before any screen used it:
- **Tips side drawer**, a bottom sheet on phones: one docked panel on a channel's pages.
- **Tip card contract**: the field, the change, a short why with its sources, Dismiss and Accept, Undo after.
- **Access to improvements**: Tips · n on the page, the purple marker beside a field's label, and tip counts on the menu.
- **Rewrite with AI**: the orange sparkle beside a text field, the host's own request, shown in the tip card's shape.
- **Reach caption** under every field: "Uses the Base · Customize for Airbnb", "Airbnb only", "Booking.com only" with a lock.
- **Channel badges**: each channel's mark as a coloured square.
- **Canvas preview**: the Classic | Canvas switch, and Your edits | Live now on the guest page.
- **Section tabs with tip counts**: Essentials 5, Arrival 2, Location 2, so a host sees where the improvements are.
- **Performance**: KPI and chart cards that compare the period since the strategy with the one before.
- **AI Copilot's sparkle, purple on lavender**, now on every AI surface in the listing. <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
## Impact on the rest of Hospitable
None of these stays inside listings. This is my reading of where each would land, to check with each product team (`ASSUMPTION`).
<table header-row="true">
	<tr>
		<td>Pattern</td>
		<td>Inbox</td>
		<td>Calendar</td>
		<td>Pricing</td>
		<td>Operations</td>
		<td>Guest experience</td>
		<td>Metrics</td>
		<td>Mobile app</td>
	</tr>
	<tr>
		<td>Save bar and toast (challenged)</td>
		<td></td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
	</tr>
	<tr>
		<td>Drill-down navigation (challenged)</td>
		<td></td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
		<td></td>
		<td>●</td>
	</tr>
	<tr>
		<td>Counts in the menu and stacked fields (challenged)</td>
		<td></td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
		<td>●</td>
	</tr>
	<tr>
		<td>Outlined close (challenged)</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
	</tr>
	<tr>
		<td>Tips drawer and card</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
		<td>●</td>
	</tr>
	<tr>
		<td>Tip markers and counts</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td></td>
		<td></td>
		<td>●</td>
	</tr>
	<tr>
		<td>Rewrite with AI</td>
		<td>●</td>
		<td></td>
		<td></td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
	</tr>
	<tr>
		<td>Reach caption and badges</td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
		<td></td>
		<td>●</td>
		<td>●</td>
		<td>●</td>
	</tr>
	<tr>
		<td>Canvas preview</td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td>●</td>
		<td></td>
		<td>●</td>
	</tr>
	<tr>
		<td>Section tabs with tip counts</td>
		<td>●</td>
		<td></td>
		<td></td>
		<td></td>
		<td>●</td>
		<td></td>
		<td>●</td>
	</tr>
</table>
The biggest questions: a Save that appears only when something changed would have to behave the same on every settings screen, or hosts learn two rules. A tip drawer beside AI Copilot's smart replies in the Inbox would need one shared panel, not two. And tip counts in the menu would meet the other counts the product shows, so they must not compete.
## How I'd evaluate and test them
**Planned.** Not run. Each test puts the alternatives side by side before a pattern spreads.
<table header-row="true">
	<tr>
		<td>Step</td>
		<td>How</td>
		<td>What I'd look for</td>
	</tr>
	<tr>
		<td>**Evaluate the impact**</td>
		<td>One review per product team (Inbox, Calendar and Pricing, Operations, Guest experience, Metrics, mobile), with the table above</td>
		<td>Where each pattern lands, what it replaces, who owns it, and which differences are worth keeping</td>
	</tr>
	<tr>
		<td>**Save placement**</td>
		<td>A first-click and preference test: Discard and Save on the header, against the bar that appears when something changed</td>
		<td>Do hosts find Save first time, and do they notice unsaved changes before leaving?</td>
	</tr>
	<tr>
		<td>**Tips: drawer or inline**</td>
		<td>Moderated usability tests on both versions of a channel's Listing page, on desktop and phone</td>
		<td>Do hosts find a tip, read its why, and trust Accept? Does the drawer feel like part of the page?</td>
	</tr>
	<tr>
		<td>**Clear and established**</td>
		<td>Comprehension checks on the reach caption, channel badges and the Classic | Canvas switch, then the same captions placed in Pricing</td>
		<td>Can hosts say what "Uses the Base" means, and does each pattern read the same in another product area?</td>
	</tr>
</table>
## How it was made
Hospitable's public stylesheet was captured, and colours were sampled from the screenshots and converted from Display-P3 to sRGB before matching. Components live in one stylesheet and a gallery. The gallery also keeps patterns from earlier rounds, such as the channel lens and conflict card, that the converged build no longer uses. The drawer timing was first 240 ms; I made it quicker, and 160 ms is what ships.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3">UI changes</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page>
**Used by** · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e">Mobile & tablet</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008">KD-16</mention-page>
**In the prototype**
- [Airbnb › Listing](https://hospitable-case-web.digimal.studio/property/neukolln/ch/airbnb/listing/essentials)
- [Smart Listings › Performance](https://hospitable-case-web.digimal.studio/property/neukolln/smart/performance)
