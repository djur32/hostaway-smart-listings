<callout icon="✅" color="gray_bg">
	**Output · Done** · 70 real screens from Mobbin, studied for the phone and tablet layouts: forms, overrides, AI suggestions, sheets, navigation, photos, wizards, dashboards, feedback and calendars. Third-party UI (), saved as local copies because Mobbin image links expire. Each screen links to its Mobbin page, which needs a Mobbin login. Internal reference: keep this page private.
</callout>
What came of them is on <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e">Mobile & tablet</mention-page>.
Each group opens below: the screen, then what I borrowed from it.
### Listing editor forms, sticky Save, unsaved changes (8) {toggle="true"}
	<columns>
		<column>
			![Airbnb (iOS): Settings page as label/value rows, each with a trailing Edit or Add link; empty values read "Not provided"](file-upload://3efe18af-1645-81a2-8058-00b20ebc8e21)
			**Airbnb (iOS)** · Read-only summary rows that open one field at a time; "Not provided" as the empty state instead of blank inputs · [Open on Mobbin](https://mobbin.com/screens/45f2625c-6e4e-4385-8e7a-faa4381f0db7) {color="gray"}
		</column>
		<column>
			![Shopify (iOS): Whole product editor as one scroll of grouped sections, with Cancel / status dropdown ("Active") / Save pinned in the nav bar; each…](file-upload://3efe18af-1645-81db-981a-00b2f514b6e6)
			**Shopify (iOS)** · Keep Save/Cancel pinned while the host scrolls a long listing; long text fields collapse to one-line previews with a chevron · [Open on Mobbin](https://mobbin.com/screens/95013585-e749-4e74-894b-8d2f79ded7c6) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Squarespace (iOS): Leaving the page editor raises a "Confirm Changes" sheet with three rows: Save, Continue editing, Discard (in red)](file-upload://3efe18af-1645-816f-8135-00b21d214cd5)
			**Squarespace (iOS)** · The three-way leave guard for the listing editor: Save / Keep editing / Discard, destructive last and red · [Open on Mobbin](https://mobbin.com/screens/b325be38-bc54-42a8-b20b-862493a67c32) {color="gray"}
		</column>
		<column>
			![Givingli (iOS): Native iOS action sheet on Back: "If you go back now, your card will be discarded" with Save Draft / Discard / Cancel](file-upload://3efe18af-1645-8142-8978-00b2fbfe182e)
			**Givingli (iOS)** · Use the native action sheet for the unsaved-changes guard; it is the most familiar form on iOS · [Open on Mobbin](https://mobbin.com/screens/f3e0489d-a8d3-4459-9e67-9f5c3a30df1d) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Reddit (iOS): Bottom sheet "Save Draft · Save your changes and come back later" with Discard (secondary) and Save (primary) side by side](file-upload://3efe18af-1645-8110-bc51-00b28e7985a9)
			**Reddit (iOS)** · Offer "save as draft" when the host leaves mid-edit, so an unfinished listing change is never lost · [Open on Mobbin](https://mobbin.com/screens/546daefb-c788-4fad-9d35-4a9615ff8218) {color="gray"}
		</column>
		<column>
			![Jobber (iOS): B2B service-business settings: floating-label stacked inputs grouped under section labels, full-width Save pinned to the bottom](file-upload://3efe18af-1645-8119-ac7a-00b21cdb2411)
			**Jobber (iOS)** · The plainest stacked-field pattern for a pro tool: floating labels, section headers, one pinned Save · [Open on Mobbin](https://mobbin.com/screens/305f8ea0-9f75-44f0-9074-541c0f70836a) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Airbnb (hosting mode) (iOS): The real Airbnb "Listing editor": Your space / Arrival guide segmented control, each section a tappable card showing its…](file-upload://3efe18af-1645-814c-ae73-00b2499d63e2)
			**Airbnb (hosting mode) (iOS)** · The mental model hosts already have: listing = stack of section cards showing current values; tap a card to edit; preview is one floating button · [Open on Mobbin](https://mobbin.com/screens/1ee8df61-ff1a-49ca-8bd4-e05c1249bdc8) {color="gray"}
		</column>
		<column>
			![Airbnb (hosting mode) (iOS): Further down the same editor: House rules ("+ 2 more"), Guest safety with "not reported" states, Cancellation policy…](file-upload://3efe18af-1645-81e7-807f-00b2d8ed631b)
			**Airbnb (hosting mode) (iOS)** · Summaries that truncate ("+ 2 more") and say "not reported" / "Add details" for gaps, so completeness is visible without a score · [Open on Mobbin](https://mobbin.com/screens/cbac9dc6-627f-4aeb-bbb9-888f58b67a69) {color="gray"}
		</column>
	</columns>
### Per-channel / per-context overrides (7) {toggle="true"}
	<columns>
		<column>
			![Shopify (iOS): "Sales channels · 3 channels · 1 issue" section with a filled dot per live channel and a hollow amber dot for the one with an issue…](file-upload://3efe18af-1645-8125-b32d-00b230c73655)
			**Shopify (iOS)** · A compact channel-status block inside the editor: count, issue count, one dot per channel · [Open on Mobbin](https://mobbin.com/screens/e9662f1b-81b7-4cac-a1e3-f3aa1cb6f1b4) {color="gray"}
		</column>
		<column>
			![TikTok (iOS): Light / Dark choice with a "Use device settings" toggle underneath; while on, the value follows the parent (device) setting](file-upload://3efe18af-1645-81d1-95a4-00b2874cbc6b)
			**TikTok (iOS)** · The "Use default" toggle: on = inherit the property-level value, off = customise for this channel · [Open on Mobbin](https://mobbin.com/screens/f7add56f-ec78-459d-8905-fbf0d5e18254) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![MD Vinyl (iOS): Grouped options where Theme and Vinyl selects show "Follow App" as their value, i.e. inheriting from the app-level setting](file-upload://3efe18af-1645-8195-874d-00b249177cfa)
			**MD Vinyl (iOS)** · Put the inheritance in the value itself: a channel field reads "Same as Hostaway" until the host picks something else · [Open on Mobbin](https://mobbin.com/screens/84600193-f2da-441e-8612-ed385d7c1191) {color="gray"}
		</column>
		<column>
			![Shopify (iOS): Price sheet (Cancel / Save) with base price fields, derived Margin and Profit tiles, and an "International pricing" link below as the…](file-upload://3efe18af-1645-81e5-b38a-00b24cc2c041)
			**Shopify (iOS)** · Base value first, the per-context override as a secondary link beneath it rather than a parallel form · [Open on Mobbin](https://mobbin.com/screens/a480d0bf-c7e7-45d1-b6da-637762ff6767) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Shopify (iOS): Add rate sheet: rate type and rate selects, price with a "Free" hint, "Add conditional pricing" link, and a live "Checkout preview" of…](file-upload://3efe18af-1645-811b-b6c6-00b28f949182)
			**Shopify (iOS)** · Show a live guest-facing preview under the field being overridden ("Airbnb guests will see…") · [Open on Mobbin](https://mobbin.com/screens/a4ac28b7-c686-4db8-b495-fc33ba246c91) {color="gray"}
		</column>
		<column>
			![Tabby (iOS): "Payments" row shows a locked "On" pill (not editable) while "Deals & offers" has four editable per-channel toggles (SMS, WhatsApp…](file-upload://3efe18af-1645-81f4-a5fd-00b2af700db8)
			**Tabby (iOS)** · Mark non-editable values with a lock pill instead of a disabled toggle; editable ones keep real controls · [Open on Mobbin](https://mobbin.com/screens/9a6c728b-eb31-441d-8f57-23bc238a2d36) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![ShopBack (iOS): Grouped cards per topic, each with one row per channel (Push, Email, SMS & WhatsApp) and a toggle](file-upload://3efe18af-1645-814b-9123-00b268c6f39d)
			**ShopBack (iOS)** · A channel matrix as grouped cards, one row per channel, readable at phone width without a table · [Open on Mobbin](https://mobbin.com/screens/6a098eac-1291-4f22-909b-93933254b938) {color="gray"}
		</column>
		<column>
			<empty-block/>
		</column>
	</columns>
### AI suggestions and tips on mobile (7) {toggle="true"}
	<columns>
		<column>
			![Grab (merchant) (iOS): "Rewrite this for me" bottom sheet: the original quoted, three alternatives as radio rows, refine chips (Proofread, Puns…](file-upload://3efe18af-1645-81f7-9302-00b278b8c46c)
			**Grab (merchant) (iOS)** · Quote the original, offer a few picks as radios, refine chips, and Apply only once chosen; nothing is written until Apply · [Open on Mobbin](https://mobbin.com/screens/a5456765-a7ec-4ec5-be32-895793924700) {color="gray"}
		</column>
		<column>
			![Jobber (iOS): Field-level "Rewrite" button inside the Client message field opens a short sheet of tones (Cheerful, Casual, Professional, Shorter)](file-upload://3efe18af-1645-8144-8277-00b2088b8e98)
			**Jobber (iOS)** · AI starts from the field, not a separate screen: a Rewrite chip inside each text field with 3-4 intents · [Open on Mobbin](https://mobbin.com/screens/6fc94ee3-af3e-4503-82f4-8c2b3477d08c) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![GoFundMe (iOS): "My suggestions" sheet: "I read your story and made some changes for you to review", a segmented Enhanced / Spell check only control…](file-upload://3efe18af-1645-8111-a3bb-00b2fe8a64ed)
			**GoFundMe (iOS)** · Explain what changed (legend chips by type) and offer a lighter alternative, before a single accept button · [Open on Mobbin](https://mobbin.com/screens/ee4b5ef1-a4b8-4497-a9d2-5985d893abe1) {color="gray"}
		</column>
		<column>
			![Speak (iOS): Stacked "Correction" cards, each with the original line (orange), the suggested line (green) and a one-paragraph reason, plus Retry](file-upload://3efe18af-1645-81e0-8f0c-00b288502035)
			**Speak (iOS)** · Before/after as two stacked lines with the reason under them; stacks readably at 375px where side-by-side does not · [Open on Mobbin](https://mobbin.com/screens/c7abdc8b-c155-424c-b22c-ac79535784e0) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Duolingo (iOS): "Replaced: son → petit" with the old word struck through, a short why, examples and thumbs up/down](file-upload://3efe18af-1645-81cb-ab93-00b214f5ae03)
			**Duolingo (iOS)** · Minimal inline diff (strikethrough → new) plus a why line and thumbs feedback on each AI change · [Open on Mobbin](https://mobbin.com/screens/26c5c998-56b0-410b-9f81-326fdb66dcaa) {color="gray"}
		</column>
		<column>
			![Noom (iOS): One card per recommendation with neighbours peeking at the edges, page dots, and a "4 / 5" counter between prev / next arrows](file-upload://3efe18af-1645-81bb-bf75-00b26040848a)
			**Noom (iOS)** · The "x of n" tips walker: one tip per card, peeking neighbours, explicit counter and arrow buttons (not swipe-only) · [Open on Mobbin](https://mobbin.com/screens/0ed8d446-96e7-4450-a74d-1c930557ac5e) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Amazon Alexa (iOS): Profile page topped by a banner: "Confirm your recommendations · Alexa learned some new interests from your activity. Want to…](file-upload://3efe18af-1645-8120-a2cc-00b2e32ae88e)
			**Amazon Alexa (iOS)** · Say what the system inferred and ask the host to confirm, as one banner above the entity's details · [Open on Mobbin](https://mobbin.com/screens/3e917ad1-567f-4442-95cf-6055b12bdb97) {color="gray"}
		</column>
		<column>
			<empty-block/>
		</column>
	</columns>
### Bottom sheets and pickers (5) {toggle="true"}
	<columns>
		<column>
			![Airbnb (iOS): Full-height modal sheet (close X) with a horizontal category chooser, title + body fields and a disabled sticky "Add to guidebook"…](file-upload://3efe18af-1645-814b-baaf-00b2e2ba5671)
			**Airbnb (iOS)** · Full-screen sheet for a complex edit (e.g. a house-rule or photo caption) with one sticky primary action · [Open on Mobbin](https://mobbin.com/screens/a074131f-bee1-4623-92a4-a67c3ddb5fd4) {color="gray"}
		</column>
		<column>
			![Shopify (iOS): Long-text field opened as a stacked sheet with Cancel / title + subtitle / Save, and a formatting bar whose first button is the AI…](file-upload://3efe18af-1645-81f9-b2cf-00b2db637f23)
			**Shopify (iOS)** · Edit long text (description, house rules) in its own sheet, with the AI entry point sitting in the keyboard toolbar · [Open on Mobbin](https://mobbin.com/screens/a62a4165-8321-41c6-b53e-38ee73b03b30) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Notion (iOS): Half sheet single-select: each option has an icon, title and one-line description; checkmark on the selected one, which also carries a…](file-upload://3efe18af-1645-8194-98fe-00b28bfee360)
			**Notion (iOS)** · Select sheet with a description per option and a "Default" tag on the inherited choice (doubles as an override cue) · [Open on Mobbin](https://mobbin.com/screens/0cb59457-00da-4154-b7c0-5bb2a4831ba2) {color="gray"}
		</column>
		<column>
			![Monzo (iOS): Tall multi-select sheet: back, "Categories", Clear; icon + label + checkbox rows; floating Done button](file-upload://3efe18af-1645-813d-b072-00b2d184b5da)
			**Monzo (iOS)** · Multi-select sheet (amenities, channels) with Clear in the header and one floating Done · [Open on Mobbin](https://mobbin.com/screens/8f40fe4e-497a-4ee0-adba-a73ed66895e3) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Brick (iOS): Checklist sheet with a search field floating above the footer; footer "1 selected · Up to 50 allowed" with Continue](file-upload://3efe18af-1645-8166-9993-00b2b1f08dcf)
			**Brick (iOS)** · Show the selection count and limit in the sticky footer next to the primary action · [Open on Mobbin](https://mobbin.com/screens/c3dbb8c3-3204-416b-b5af-f0c3c2a2614b) {color="gray"}
		</column>
		<column>
			<empty-block/>
		</column>
	</columns>
### Navigation: tab bar, entity switcher, section menu, tabs (7) {toggle="true"}
	<columns>
		<column>
			![Airbnb (hosting mode) (iOS): Host tab bar Today / Calendar / Listings / Messages / Menu; the Menu tab is a grouped list (Hosting: Reservations…](file-upload://3efe18af-1645-8180-95fd-00b2a75d8a67)
			**Airbnb (hosting mode) (iOS)** · The closest domain analogue for Hostaway's shell: 4 core tabs + a Menu tab that holds everything else as a grouped list · [Open on Mobbin](https://mobbin.com/screens/ec965d5f-a216-49db-b44b-7ee988a9d7d7) {color="gray"}
		</column>
		<column>
			![Airbnb (hosting mode) (iOS): Listings tab: "Your listing" with a big photo card, a "Listed" status pill with a green dot, name and location; + to add](file-upload://3efe18af-1645-811a-a271-00b2e1297b31)
			**Airbnb (hosting mode) (iOS)** · The property list as photo cards with a status pill; one tap opens the property's own section menu/editor · [Open on Mobbin](https://mobbin.com/screens/2ca943b9-7b0e-4fe8-a2a7-bc0d6fea69de) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Slack (iOS): Left side drawer listing workspaces (logo, name, domain, unread badge, ••• on the current one), with Add a workspace / Preferences /…](file-upload://3efe18af-1645-8131-ae85-00b244efe4e9)
			**Slack (iOS)** · A side drawer as the entity switcher when there are many properties; per-entity badge for things needing attention · [Open on Mobbin](https://mobbin.com/screens/e4fa504c-e639-497e-a270-f34b305dc437) {color="gray"}
		</column>
		<column>
			![Craft (iOS): Space settings page: space avatar + name dropdown as the switcher, a list of the space's sections (Templates, Published Content…](file-upload://3efe18af-1645-816a-afe0-00b25e5079ed)
			**Craft (iOS)** · The property page pattern: property name as a dropdown switcher on top, the property's sections as a plain list below · [Open on Mobbin](https://mobbin.com/screens/a09a1b00-f7eb-4b89-828a-f53853c2f514) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Notion (iOS): Bottom sheet "Accounts": workspaces with plan subtitle, badge, checkmark on current, New workspace, then Add another account / Log out](file-upload://3efe18af-1645-8189-ba1e-00b273fbd609)
			**Notion (iOS)** · The switcher as a bottom sheet with subtitle per entity (e.g. "3 channels · 1 issue") and a check on the current one · [Open on Mobbin](https://mobbin.com/screens/fd81a99c-88ed-4274-a3cd-dfb4c04ad275) {color="gray"}
		</column>
		<column>
			![Careem (iOS): "Useful bits" page with anchor tabs About / Amenities / House rules that track one long scroll; amenities as icon + label rows](file-upload://3efe18af-1645-81d6-8569-00b21fa8b833)
			**Careem (iOS)** · Scroll-spy tabs for the listing editor sections (one scroll, tabs jump and highlight); amenities as icon rows · [Open on Mobbin](https://mobbin.com/screens/ac42b598-fedc-4091-b90e-2e614773c3f6) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Grab (iOS): Venue page: photo header, name, address, open status, rating, then Deals / Menu / Reviews / Photos tabs, with a sticky two-button footer](file-upload://3efe18af-1645-8155-9389-00b2ca256a09)
			**Grab (iOS)** · An entity header (photo, name, status line) above section tabs; the tabs stick once the header scrolls away · [Open on Mobbin](https://mobbin.com/screens/60a0123d-0257-4e6f-8603-966cb8ec0a2e) {color="gray"}
		</column>
		<column>
			<empty-block/>
		</column>
	</columns>
### Photo management on mobile (8) {toggle="true"}
	<columns>
		<column>
			![Shopify (iOS): Media strip at the top of the editor: thumbnail, add tile, "Uploading file 1 of 1. 52%" bar and View all](file-upload://3efe18af-1645-8173-adc7-00b26f9e2eb3)
			**Shopify (iOS)** · Photos as the first block of the listing editor, with inline upload progress and a View all drill-in to the full grid · [Open on Mobbin](https://mobbin.com/screens/fcf26f79-4747-4ae4-9eca-a72aef95f941) {color="gray"}
		</column>
		<column>
			![AllTrails (iOS): Edit sheet: activity-type chips, photo row with a "Cover" badge on the first photo and an x on each, notes, privacy select, red…](file-upload://3efe18af-1645-814c-9921-00b21062dc3a)
			**AllTrails (iOS)** · A "Cover" badge on the lead photo and a per-item visibility select, all in one sheet with a sticky Save · [Open on Mobbin](https://mobbin.com/screens/6d3bc537-fef1-4a8f-af6a-9dd668936a3a) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Airbnb (iOS): Guest-facing Photo tour: horizontal row of room thumbnails (Shared exterior, Additional photos), then one section per room (Living…](file-upload://3efe18af-1645-81fc-b92d-00b21caec0e1)
			**Airbnb (iOS)** · Group photos by room in the manager too; the host sees the same structure guests see on Airbnb · [Open on Mobbin](https://mobbin.com/screens/32308fc2-1dc4-49df-ac43-32fc7207a4e3) {color="gray"}
		</column>
		<column>
			![Airbnb (iOS): Listing photo step: "Drag to reorder" hint, a large first tile labelled "Cover photo", a ••• menu on every photo, + to add, dashed add…](file-upload://3efe18af-1645-8163-ae04-00b2d2864c1d)
			**Airbnb (iOS)** · Hosts' own mental model: first = cover (bigger tile, label), drag to reorder, per-photo ••• for everything else · [Open on Mobbin](https://mobbin.com/screens/0701edf9-3ec2-4c5a-8b92-50c341d40d98) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Turo (host) (iOS): Host "Car photos": large lead photo + small grid, select circles on each, "Drag To Reorder" pill, Delete bar (disabled until…](file-upload://3efe18af-1645-81b7-af2b-00b2385a199f)
			**Turo (host) (iOS)** · Separate select mode (circles + one bulk action bar) from reorder; destructive action disabled until something is selected · [Open on Mobbin](https://mobbin.com/screens/17abb927-6daa-4335-a4c8-b48d47620cca) {color="gray"}
		</column>
		<column>
			![Behance (iOS): Native iOS reorder list: red minus to delete, thumbnail, grip handle on the right; Cancel / Reorder / Save](file-upload://3efe18af-1645-8126-a35e-00b2b9dc63d5)
			**Behance (iOS)** · An accessible alternative to grid drag: a reorder list with explicit handles and Save/Cancel · [Open on Mobbin](https://mobbin.com/screens/4756e1b1-0d0b-48e6-9303-541669b92562) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Pinterest (iOS): "Organize · Select or reorder" mode: grip icon on each tile, Select all, floating bottom bar with Move to / Section / Delete](file-upload://3efe18af-1645-8173-b94c-00b2d7475b47)
			**Pinterest (iOS)** · A floating bulk-action bar (Move to room, Hide on channel, Delete) for multi-select in the photo grid · [Open on Mobbin](https://mobbin.com/screens/4d6ceeea-df06-4247-ab64-2d8feb597b72) {color="gray"}
		</column>
		<column>
			![Tripadvisor (iOS): "Add caption" sheet for one photo: the photo, a "Room/Suite" category select, a caption textarea, Save](file-upload://3efe18af-1645-8141-a646-00b262fb0358)
			**Tripadvisor (iOS)** · The per-photo edit sheet: photo on top, room select, caption, then (for Hostaway) per-channel visibility and Delete · [Open on Mobbin](https://mobbin.com/screens/28425944-849f-4d9f-8666-76d27be98a53) {color="gray"}
		</column>
	</columns>
### Multi-step flows and wizards (8) {toggle="true"}
	<columns>
		<column>
			![Airbnb (iOS): Radio cards (title, one-line description, icon), selected card with a heavier border; segmented progress bar above a Back / Next footer](file-upload://3efe18af-1645-8167-ad8d-00b25cd5f767)
			**Airbnb (iOS)** · Radio cards with a one-line consequence for each booking policy; the segmented progress + sticky Back/Next footer · [Open on Mobbin](https://mobbin.com/screens/602422da-e72d-4e16-a4a7-2d91d1b31447) {color="gray"}
		</column>
		<column>
			![Airbnb (iOS): One-decision step: big price, "Guest price before taxes" disclosure, slider with a "Tip: Try 0%" hint; Save & exit top-left](file-upload://3efe18af-1645-8164-b3a3-00b2f264a2b7)
			**Airbnb (iOS)** · A single number per step with an inline tip under the control, and Save & exit always visible · [Open on Mobbin](https://mobbin.com/screens/79940bbb-c8ce-42c5-bd46-4ca3c77955b5) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Klarna (iOS): "Popular plans": three radio cards (name, validity line, price), the middle one tinted with a "Recommended" pill, then "See all…](file-upload://3efe18af-1645-81c1-a0d9-00b2fa792fca)
			**Klarna (iOS)** · Show the 3 common booking policies with one "Recommended" pill and a "See all policies" link, instead of all options at once · [Open on Mobbin](https://mobbin.com/screens/2913d96b-f3bc-4491-ba77-06871c3c6469) {color="gray"}
		</column>
		<column>
			![Airbnb (iOS): "It's easy to get started": the whole flow as three numbered steps with a one-line promise each and an illustration, one Get started…](file-upload://3efe18af-1645-810d-939f-00b2d7f23307)
			**Airbnb (iOS)** · Open onboarding/import with a 3-step map of what will happen, so the host knows the length before starting · [Open on Mobbin](https://mobbin.com/screens/a9d0b169-e1ea-4611-b273-35401129a917) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Airbnb (iOS): Checkbox cards with an editable % value, a title and one-line condition each; footnote "Only one discount will be applied per stay"…](file-upload://3efe18af-1645-8172-a763-00b2b1dd5ecc)
			**Airbnb (iOS)** · Pre-checked recommended defaults the host can untick, with the rule that governs them stated once underneath · [Open on Mobbin](https://mobbin.com/screens/f8e40672-eb5e-44fe-bef9-827075ba9221) {color="gray"}
		</column>
		<column>
			![Deel (iOS): Review step as a sheet: "Edits summary (2)", each change shows the new value in colour with "Previous: Not specified" under it and a…](file-upload://3efe18af-1645-8104-b307-00b2e5506c76)
			**Deel (iOS)** · The review-and-confirm step for booking policies: new value, the previous value under it, remove-one, and the step count next to the confirm button · [Open on Mobbin](https://mobbin.com/screens/24e6701c-9308-4db6-81b8-fa1fc94c65f2) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Wise (business) (iOS): "Confirm trading address": plain explainer, a learn-more link, the captured values as label/value pairs with one Edit link per…](file-upload://3efe18af-1645-81fa-934a-00b2ac343060)
			**Wise (business) (iOS)** · A read-back of imported data with an Edit per block, used when the host confirms what Hostaway imported · [Open on Mobbin](https://mobbin.com/screens/21bae757-6c53-4604-9b8a-973c5937c5a2) {color="gray"}
		</column>
		<column>
			![Affirm (iOS): Payment plan radio cards, each with a tag naming its trade-off ("0% APR", "Lowest monthly payment") and a consequence line ("\$2.89…](file-upload://3efe18af-1645-81c6-b778-00b2843d0e9b)
			**Affirm (iOS)** · Tag each policy card with its trade-off in plain words ("Most bookings", "Most protection") plus its consequence line · [Open on Mobbin](https://mobbin.com/screens/a4eedac4-26d5-41f3-a571-c179c7d84358) {color="gray"}
		</column>
	</columns>
### Overview / status dashboard of one entity (8) {toggle="true"}
	<columns>
		<column>
			![Instagram (iOS): "1 of 7 steps complete ⌄" under the account switcher, plus a dismissible horizontal row of suggestion cards](file-upload://3efe18af-1645-81b7-80a3-00b2cdff1d86)
			**Instagram (iOS)** · A collapsed setup-progress line under the entity name that expands into the checklist, instead of a big banner · [Open on Mobbin](https://mobbin.com/screens/7b7b7c39-39a7-4ba6-bf3a-45c009a4769d) {color="gray"}
		</column>
		<column>
			![Airbnb (iOS): Host "Insights" with tabs Opportunities / Stats / Superhost; stats as label-under-number pairs, a "View listing issues" link, and an…](file-upload://3efe18af-1645-8166-a2ce-00b23444099a)
			**Airbnb (iOS)** · Separate "Opportunities" from "Stats"; give the tips area an explicit all-clear state · [Open on Mobbin](https://mobbin.com/screens/ec1e902b-2557-4657-913c-9d29c531a542) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Airbnb (hosting mode) (iOS): Today tab for a new host: "Account info is needed · Required to get paid" card, then "Your next steps" horizontal cards…](file-upload://3efe18af-1645-81f8-925e-00b27a1c44da)
			**Airbnb (hosting mode) (iOS)** · Blocking issue as a card on top, then a paged row of next-step cards; each card is one setting decision · [Open on Mobbin](https://mobbin.com/screens/b9a3879c-efe9-47bc-a020-4d47df1d4bff) {color="gray"}
		</column>
		<column>
			![Airbnb (hosting mode) (iOS): Calendar empty state plus a persistent bottom card above the tab bar: "Confirm a few key details · Required to publish"](file-upload://3efe18af-1645-810d-b8e3-00b2c72fb84b)
			**Airbnb (hosting mode) (iOS)** · A persistent "required to publish" card docked above the tab bar, visible on every tab until done · [Open on Mobbin](https://mobbin.com/screens/a543558e-7f77-455b-9a4c-47509519582f) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Shopify (iOS): Store home: store avatar (switcher) + name + bell, "Go to…" search, "Get ready to sell · 0 / 6 completed" checklist card with…](file-upload://3efe18af-1645-810b-866b-00b2884fd498)
			**Shopify (iOS)** · The property overview's top card: a counted setup checklist with dashed circles for todo, each row a deep link · [Open on Mobbin](https://mobbin.com/screens/f809ab03-95f1-4fe6-91ae-2a9cef12973b) {color="gray"}
		</column>
		<column>
			![Shopify (iOS): Setup guide with collapsible groups (Set up Point of Sale / Store settings / Get ready…); the active task expands inline with…](file-upload://3efe18af-1645-8193-abe7-00b22ea12a9f)
			**Shopify (iOS)** · Collapsible recommendation groups where only the current task is expanded with its one action; per-group progress bar · [Open on Mobbin](https://mobbin.com/screens/28560dd9-d750-4f52-8d17-7cef0b915805) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Lloyds Bank (iOS): "Current connections": one card per provider with a status chip (Active, Reconfirm), Manage connection link, the linked accounts…](file-upload://3efe18af-1645-81a7-8326-00b28aa143ad)
			**Lloyds Bank (iOS)** · Channel connection cards: status chip, last-synced timestamp, one Manage link; "Reconfirm" as a distinct needs-action state · [Open on Mobbin](https://mobbin.com/screens/c0a6d47a-dc78-4b5c-8933-a7faae2a7611) {color="gray"}
		</column>
		<column>
			![Mesh (iOS): Integrations page split into Connected integrations and All integrations (+ to add); a connected row's menu shows "Synced 3 days ago"…](file-upload://3efe18af-1645-8132-b71d-00b23fba7982)
			**Mesh (iOS)** · Connected channels first, available ones below; last sync time and "Sync again" live in the row's menu · [Open on Mobbin](https://mobbin.com/screens/bdbb9c4b-d4cd-464f-85c4-df1c9ed52fa0) {color="gray"}
		</column>
	</columns>
### Toasts, inline errors, undo (6) {toggle="true"}
	<columns>
		<column>
			![Shopify (iOS): Dark "Changes saved" pill toast with a check icon floating above the tab bar](file-upload://3efe18af-1645-8192-990c-00b2d9e97834)
			**Shopify (iOS)** · Small, bottom-anchored, auto-dismissing confirmation that does not cover the Save button · [Open on Mobbin](https://mobbin.com/screens/daa15833-4ce9-43d8-83a3-24d45f57fc41) {color="gray"}
		</column>
		<column>
			![Spark Mail (iOS): Dark toast after AI edited a template: "Spark inserted the template with some text alterations by +AI", a link to use the original…](file-upload://3efe18af-1645-81d1-a116-00b266346373)
			**Spark Mail (iOS)** · After an AI change is applied, a toast that says what AI did, with Undo and a way back to the original · [Open on Mobbin](https://mobbin.com/screens/776c7236-d0fb-456c-9bea-b089ca3bdb5c) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Booking⁠.com (iOS): Guest details form: red border + (!) icon + specific message "Add your first name" under the empty field, green check on a valid…](file-upload://3efe18af-1645-8199-ae21-00b20eadf193)
			**Booking⁠.com (iOS)** · Error text that tells the fix ("Add a check-in time"), not "Invalid"; a quiet check on valid fields; Booking⁠.com's own idiom · [Open on Mobbin](https://mobbin.com/screens/43375562-8f74-4d40-8283-0041c755c727) {color="gray"}
		</column>
		<column>
			![Alan (iOS): "\* Required fields" legend at the top; the missing field gets a pink-tinted band, red border and "Required"; optional fields labelled…](file-upload://3efe18af-1645-815b-9236-00b28914eb3c)
			**Alan (iOS)** · Tint the whole field band on error so it is findable while scrolling a long editor; mark optional, not required · [Open on Mobbin](https://mobbin.com/screens/170f991d-f756-4358-8dbb-ec2a7e98b93d) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![inDrive (iOS): Every field shows "Required field" and two dark toasts stack over the form ("To proceed further, correct the non-correct fields")](file-upload://3efe18af-1645-81b7-a611-00b2f2b7cf47)
			**inDrive (iOS)** · Counter-example: toasts that repeat inline errors and cover the fields. Use inline errors + scroll to the first one instead · [Open on Mobbin](https://mobbin.com/screens/853b177e-0f35-4bbc-aa25-b96a60431ada) {color="gray"}
		</column>
		<column>
			![Google Photos (iOS): Photo viewer: dark snackbar "Unstacked all 2 photos · Undo" sitting just above the Share / Edit / Add to / Trash action bar](file-upload://3efe18af-1645-81a7-aeef-00b2ad3759a8)
			**Google Photos (iOS)** · Undo for photo actions (hide on a channel, delete, change cover), placed above the photo action bar so it never covers it · [Open on Mobbin](https://mobbin.com/screens/271108af-b336-489e-bac3-7b4639152cb4) {color="gray"}
		</column>
	</columns>
### Single-property calendar on mobile (6) {toggle="true"}
	<columns>
		<column>
			![Turo (host) (iOS): Host calendar for one vehicle: entity thumbnail + name in the header, a continuous vertical month scroll, a price in each cell…](file-upload://3efe18af-1645-8143-bc95-00b28aada494)
			**Turo (host) (iOS)** · Single-property calendar: property chip in the header, vertical month scroll, price in the cell, one floating AI entry point · [Open on Mobbin](https://mobbin.com/screens/cde72f1e-26a7-42e4-ae54-a22df4c392c4) {color="gray"}
		</column>
		<column>
			![Marriott Bonvoy (iOS): Nightly-price month grid with a range selected, filter chips (rate, rooms, currency) above, and a sticky footer "Jun 4–6 (2…](file-upload://3efe18af-1645-8100-ad5a-00b2850773d7)
			**Marriott Bonvoy (iOS)** · Sticky footer summarising the selection (dates, nights, price) with one action; filter chips above the grid · [Open on Mobbin](https://mobbin.com/screens/9cf1395d-f83e-4374-9397-6b2433a5d85c) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![CRED (iOS): Stay calendar: struck-through "sold" days, "check out" label in the range, price under every date, "(Min. 2 nights)" in the subtitle](file-upload://3efe18af-1645-8120-a32b-00b28e1a91f3)
			**CRED (iOS)** · Label day states in the cell in words (sold, check out) and state the min-stay rule next to the property name · [Open on Mobbin](https://mobbin.com/screens/4ea5f3ab-7acd-4150-b778-64e8c4134375) {color="gray"}
		</column>
		<column>
			![Airbnb (hosting mode) (iOS): Host Calendar tab: listing thumbnail + name as a switcher in the header, calendar/settings icons, vertical month scroll…](file-upload://3efe18af-1645-8161-a218-00b22c9c62cf)
			**Airbnb (hosting mode) (iOS)** · The baseline Hostaway hosts already know: entity switcher in the header, price in every cell, per-month promo link · [Open on Mobbin](https://mobbin.com/screens/9a897daa-8e70-4e8c-adef-072c9f8aba9c) {color="gray"}
		</column>
	</columns>
	<columns>
		<column>
			![Airbnb (hosting mode) (iOS): Selecting Jan 1–4 raises a half sheet: Open / Block nights segmented control, big "\$100 – 150" with an edit pencil…](file-upload://3efe18af-1645-815e-9ba4-00b294854b8a)
			**Airbnb (hosting mode) (iOS)** · Range select then a half-height sheet with availability toggle, one big editable price, and derived guest-total and comps chips · [Open on Mobbin](https://mobbin.com/screens/da24cd73-ad16-4e7f-9fb4-3e21900971fa) {color="gray"}
		</column>
		<column>
			![Airbnb (hosting mode) (iOS): Same sheet after switching to Blocked: the selected dates are struck through in the grid](file-upload://3efe18af-1645-814a-a60e-00b251c6e0bd)
			**Airbnb (hosting mode) (iOS)** · Blocked days keep their price but strike the date; the state change is visible in the grid behind the sheet · [Open on Mobbin](https://mobbin.com/screens/b1c167f3-165a-4560-b70f-c12a6824158b) {color="gray"}
		</column>
	</columns>
---
**Part of**
- <mention-page url="https://app.notion.com/p/3efe18af164581dc88e7ceb2c86bb63e">Design references</mention-page>
