<page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Design system"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done** · The design system behind the prototype: Hospitable's own tokens as the base, plus the few patterns Smart Listings needed. Provenance: the base tokens are Hospitable's public CSS (`REAL·PUBLIC`, [their stylesheet](https://my.hospitable.com/static/styles-K7T6MMZ5.css)); colour roles are traced to the product's screenshots (`REAL·PRODUCT`).
</callout>
![The design-system gallery: Hospitable's raw colour scales under Hospitable's own names, used verbatim. REAL·PUBLIC.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/71e6bb88-748a-4cfb-9ff4-a59c3e12122e/ds-colour-scales.png)
## The short version
- The base is Hospitable's own: **244 root CSS variables** captured from the app's public stylesheet and used as they are, under their own names.
- On top sits a role layer that says what each colour does, matched to pixels in the screenshots. The prototype and the deck use these tokens only, never a raw colour.
- Ten patterns were added for Smart Listings. Each was added to the system first, then used on screens.
## The base
- **Raw layer:** Hospitable's palette (gray, primary, secondary, success, error, warning…) and semantic names, copied verbatim, so an engineer there recognises every token.
- **Role layer:** sidebar, actions, pills, AI, channels, type, space, radius, motion, elevation. Most roles match a Hospitable token exactly; anything guessed is marked `ASSUMPTION`.
- **Colour means one thing:** raspberry to act (one primary per view), purple for what the AI proposes (tips), orange for Rewrite with AI, which the host starts, green for chosen or done.
- **Type and icons:** TT Norms, from my licensed files, and Tabler outline icons.
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
<td>The line under a field: "ⓘ Uses the Base", "Custom for Airbnb", "Booking⁠.com decides" or "N channels" on the left, one text link on the right. Hovering shows the values behind it</td>
<td>Every field on the Listing base and channel pages</td>
</tr>
<tr>
<td>**Lock with a reason**</td>
<td>A disabled field with a lock where the chevron was, and the reason in Hospitable's dark tooltip</td>
<td>Property type, Room type and the address on the Base. Booking⁠.com's Summary shows the lock with its caption instead of a tooltip</td>
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
![Rewrite with AI in the docked panel: the orange composer and quick actions, beside fields with their scope captions. Live prototype, values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/481383a3-f8e8-4450-bd42-12680fd596d0/ds-rewrite-composer.png)
## How it was made
Hospitable's public stylesheet was captured, and colours were sampled from the screenshots and converted from Display-P3 to sRGB before matching. Components live in one stylesheet and a gallery. The gallery also keeps patterns from earlier rounds, such as the channel lens and conflict card, that the converged build no longer uses. The drawer timing was first 240 ms; I made it quicker, and 160 ms is what ships.
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3"/> · <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c"/>
**Used by** · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/> · <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975"/> · <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008"/>
**In the prototype** · [Airbnb › Listing](https://hospitable-case-djur32.vercel.app/property/neukolln/ch/airbnb/listing/essentials) · [Smart Listings › Performance](https://hospitable-case-djur32.vercel.app/property/neukolln/smart/performance)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`ds/tokens.css`</span><span color="gray"> · </span><span color="gray">`ds/tools/hospitable-root-vars.json`</span><span color="gray"> · </span><span color="gray">`ds/components.css`</span><span color="gray"> · </span><span color="gray">`ds/components/index.html`</span><span color="gray"> · </span><span color="gray">`prototype/src/ds/`</span><span color="gray"> (sl3, smartify, panels, unsaved, toast, wizard, perf, mobile)</span>
</content>
</page>
