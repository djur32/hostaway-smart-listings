<callout icon="✅" color="gray_bg">
	**Output · Done** · The same screens at phone and tablet width, plus an app mode that behaves like Hostaway's mobile app. Provenance: the phone layout follows Hostaway's real mobile web app (my phone captures); the bottom-sheet patterns follow other products (Mobbin references); values are .
</callout>
<columns>
	<column>
		![Phone · Airbnb › Listing. The title, "Listing ⌄", opens the Sections sheet, with the property selector at its top and the sections below it.](file-upload://3f0e18af-1645-8187-bc11-00b266e2ed7d)
	</column>
	<column>
		![Phone · Airbnb › Listing. Stacked fields, the scope caption and its link under each field, Hostaway's bottom tab bar.](file-upload://3f0e18af-1645-81a5-ab8b-00b20a4c7651)
	</column>
	<column>
		![Phone · the Tips panel as a bottom sheet: the tip, its why from the listing, Dismiss and Accept.](file-upload://3f0e18af-1645-81cc-86fd-00b2ed0bbc42)
	</column>
</columns>
## The short version
- On a phone the property rail disappears. The **page title** names where you are and opens the whole property menu as a **bottom sheet**. The property is chosen only there. The page itself has no property selector and no Tips button: tips open from the field's dot.
- **The view switch sits beside the title**, on the right: Classic | Canvas on Listing, Occupancy | Tasks on Calendar.
- **Most interactions are one bottom sheet.** Tooltips, Tips, Rewrite with AI, the Knowledge Hub's panels, pricing drill-downs and "···" menus all open the same sheet. See below.
- On a tablet the global sidebar shrinks to icons and the property rail slides over the page from the left.
- **App mode** runs the same code as an installable phone app with native-feeling transitions.
## One bottom sheet for most interactions
Almost everything that opens on a phone, a tooltip, a side panel, a menu or a drill-down, now opens the same bottom sheet. I built it once, so a host learns the pattern once and a fix lands everywhere.
- **Tooltips** open as a sheet fitted to their content: a title, the body, a close button, a scrim and a grip.
- **Side panels** rise from the bottom: Tips, Rewrite with AI, the Knowledge Hub's panels, and the pricing and calendar drill-downs.
- **Menus** ("···") and dropdowns open as sheets too.
- **Every drawer, dropdown and tooltip is a content-fitted sheet.** Only Manage photos and the bulk sheet are full-screen sheets.
- **Closing works the same way every time:** the close button, a tap on the scrim, or a drag on the grip.
- **Never a sheet on a sheet.** If a tooltip's trigger already sits inside an open sheet, the tooltip expands inline at the end of that sheet's body instead.
- **One exception.** Properties opens on top of Sections. Choosing a property closes only that top sheet, so Sections stays open underneath, showing the new property.
## Phone (up to 767 px)
<table header-row="true">
	<tr>
		<td>Rule</td>
		<td>As built</td>
	</tr>
	<tr>
		<td>Property menu</td>
		<td>The page's own title opens the menu. Tapping it, e.g. "Listing ⌄", opens a bottom sheet titled Sections. The sheet starts with a Property label and selector, then Overview, Shared and Channels. This is the only place the property is chosen. The picker opens on top of Sections. Choosing a property closes only that top sheet and leaves Sections open underneath, showing the new property. The current page is marked and scrolled into view, and any link closes the sheet.</td>
	</tr>
	<tr>
		<td>Page head</td>
		<td>The title, with the view switch beside it on the right (Classic | Canvas on Listing, Occupancy | Tasks on Calendar). No property selector and no Tips button on the page: tips open from the field's dot. Once the title scrolls away, a collapsed bar keeps the title, the back button when the page has one, the switch and a bottom line, and opens the same Sections sheet.</td>
	</tr>
	<tr>
		<td>Side panels</td>
		<td>Content-fitted bottom sheets with a grip that drags them closed. Manage photos and the bulk sheet are full-screen sheets. Never a sheet on a sheet.</td>
	</tr>
	<tr>
		<td>Shell</td>
		<td>Hostaway's bottom tab bar (Home, Inbox, Calendar, Properties, Menu), a sticky Discard / Save bar above it when something changed, and scrolling underline tabs.</td>
	</tr>
	<tr>
		<td>Tap targets</td>
		<td>44 × 44 px minimum. The 28 px tip icon carries a 44 px hit area.</td>
	</tr>
	<tr>
		<td>Type</td>
		<td>One scale: 24 px page title, 20 px section title, 16 px body, labels and descriptions, 14 px hints. 12 px is only for chips, counts and chart axes.</td>
	</tr>
	<tr>
		<td>Inputs</td>
		<td>Inputs and dropdowns are 48 px high with 16 px text, so iOS doesn't zoom in on focus. Switches are 52 × 32 px.</td>
	</tr>
	<tr>
		<td>Buttons and spacing</td>
		<td>A button alone on its row is full width. Pages end with 72 px of clearance above the chat button.</td>
	</tr>
	<tr>
		<td>Strategy</td>
		<td>One card per channel, and the whole card opens the strategy.</td>
	</tr>
	<tr>
		<td>Layout</td>
		<td>16 px side gutters, one column, no horizontal page scroll.</td>
	</tr>
</table>
## Tablet (768 to 1023 px)
Pages keep their desktop layout. The global sidebar shows icons only and expands over the page. The property rail opens from the same section bar as a slide-over from the left, with a scrim, so the page keeps its full width. When the split with a side panel gets too narrow, the panel floats over the form's right edge instead of squeezing it.
## App mode
The phone app at [hostaway-case-mobile.digimal.studio](), or any page under `/app` on the website. It opens on the property, uses push and pop page transitions, swipe from the left edge to go back, sheets you can drag, and a large title that condenses as you scroll. On a desktop browser it draws a phone frame around the same screens. It can be added to an iPhone's home screen.
## How it was made
Built in the prototype's mobile layer after my captures of Hostaway's mobile web app; bottom-sheet navigation was chosen from patterns in other products. Text sizes, input sizes and tap areas above were measured on the live site at 390 px.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce">Sitemap</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581e7b09fc51d1473a880">KD-17</mention-page>
**Decision records for the phone head**
- [D-202 type scale](https://app.notion.com/p/3f0e18af1645817286c7ec810c740d02) · [D-203 page head](https://app.notion.com/p/3f0e18af1645817c8e92c1127fc8687e) · [D-204 bottom sheets](https://app.notion.com/p/3f0e18af164581afa12bc37c1770c9a7) · [D-205 controls](https://app.notion.com/p/3f0e18af164581c68737f3c30dd2cf67) · [D-207 Strategy cards](https://app.notion.com/p/3f0e18af164581b68b5ad04d17f048da)
**In the prototype**
- [Phone app]()
- [App mode on the website]()
- open any website page at phone width
