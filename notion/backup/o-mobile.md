<page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Mobile & tablet"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · The same screens at phone and tablet width, plus an app mode that behaves like Hospitable's mobile app. Provenance: the phone layout follows Hospitable's real mobile web app (`REAL·PRODUCT`, my phone captures); the bottom-sheet patterns follow other products (`REAL·PUBLIC`, Mobbin references); values are `SIMULATED`.
</callout>
<columns>
	<column>
		![Phone · the section bar ("Airbnb › Listing · Sections") opens the whole property menu as a bottom sheet, with the same groups and tip counts as the desktop rail.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/6f200f96-9d46-43a4-bc85-a22d299df214/m-sections-sheet.png)
	</column>
	<column>
		![Phone · Airbnb › Listing. Stacked fields, the scope caption and its link under each field, Hospitable's bottom tab bar.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/656a329d-25b9-423a-8611-9ea6c4feb781/m-airbnb-listing.png)
	</column>
	<column>
		![Phone · the Tips panel as a bottom sheet: the tip, its why with a Knowledge Hub fact, Dismiss and Accept.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/9a2318ee-83ed-45a0-bccb-3d17a48fc224/m-tips-sheet.png)
	</column>
</columns>
## The short version
- On a phone the property rail disappears. A **section bar** at the top names where you are and opens the whole property menu as a **bottom sheet**.
- **Every side panel becomes a bottom sheet**: Tips, Rewrite with AI, Knowledge Hub drawers, pricing drill-downs and "···" menus.
- On a tablet the global sidebar shrinks to icons and the property rail slides over the page from the left.
- **App mode** runs the same code as an installable phone app with native-feeling transitions.
## Phone (up to 767 px)
<table header-row="true">
<colgroup>
<col>
<col width="590">
</colgroup>
<tr>
<td>Rule</td>
<td>As built</td>
</tr>
<tr>
<td>Property menu</td>
<td>A section bar, e.g. "Airbnb › Listing · Sections", opens a bottom sheet titled with the property, with All properties, Overview, Shared and Channels. The current page is marked and scrolled into view; any link closes the sheet.</td>
</tr>
<tr>
<td>Side panels</td>
<td>Bottom sheets with a grip that drags them closed. Longer edits use a full-screen sheet. Never a sheet on a sheet.</td>
</tr>
<tr>
<td>Shell</td>
<td>Hospitable's bottom tab bar (Home, Inbox, Calendar, Properties, Menu), a sticky Discard / Save bar above it when something changed, and scrolling underline tabs.</td>
</tr>
<tr>
<td>Tap targets</td>
<td>44 × 44 px minimum. The 28 px tip icon carries a 44 px hit area.</td>
</tr>
<tr>
<td>Type</td>
<td>At least 14 px everywhere except the tab bar's labels, which keep the real app's 12 px. Field labels are 18 px, help and captions 16 px.</td>
</tr>
<tr>
<td>Inputs</td>
<td>16 px text, so iOS doesn't zoom in on focus.</td>
</tr>
<tr>
<td>Layout</td>
<td>16 px side gutters, one column, no horizontal page scroll.</td>
</tr>
</table>
## Tablet (768 to 1023 px)
Pages keep their desktop layout. The global sidebar shows icons only and expands over the page. The property rail opens from the same section bar as a slide-over from the left, with a scrim, so the page keeps its full width. When the split with a side panel gets too narrow, the panel floats over the form's right edge instead of squeezing it.
## App mode
The phone app at [hospitable-case-mobile-djur32.vercel.app](https://hospitable-case-mobile-djur32.vercel.app), or any page under `/app` on the website. It opens on the property, uses push and pop page transitions, swipe from the left edge to go back, sheets you can drag, and a large title that condenses as you scroll. On a desktop browser it draws a phone frame around the same screens. It can be added to an iPhone's home screen.
## How it was made
Built in the prototype's mobile layer after my captures of Hospitable's mobile web app; bottom-sheet navigation was chosen from patterns in other products. Text sizes, input sizes and tap areas above were measured on the live site at 390 px.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af164581e7b09fc51d1473a880"/>
**In the prototype** · [Phone app](https://hospitable-case-mobile-djur32.vercel.app) · [App mode on the website](https://hospitable-case-djur32.vercel.app/app) · open any website page at phone width
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`prototype/src/ds/mobile.tsx`</span><span color="gray"> · </span><span color="gray">`prototype/src/shell/PropertyLayout.tsx`</span><span color="gray"> · </span><span color="gray">`prototype/src/app/`</span><span color="gray"> · </span><span color="gray">`ds/mobile.md`</span>
</content>
</page>
