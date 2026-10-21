<callout icon="✅" color="gray_bg">
	**Output · Done** · Eight products that already solve part of "one record, many channels, with AI help", and the pattern Smart Listings borrows from each; then every product reviewed, with its source. Provenance: `REAL·PUBLIC`, from each product's public help pages and docs.
</callout>
## The short version
- Inside short-term rental software, **per-channel copy is rare**: six of eleven platforms reviewed send one description everywhere. The sharper patterns come from product-information tools and e-commerce.
- **AI listing copy is shallow and local to one field.** No one I found generates per-channel versions from one set of facts and shows which fact each suggestion came from.
- **Comps inform price, almost never content.**
- So the opening (my reading, `ASSUMPTION`): no PMS combines a fact record with per-channel versions, grounded AI suggestions with sources, and comps that inform content.
## Eight products, eight patterns
<table header-row="true">
	<tr>
		<td>Product</td>
		<td>What it does</td>
		<td>Pattern I borrow</td>
		<td>Where it shows in Smart Listings</td>
	</tr>
	<tr>
		<td>[Guesty](https://help.guesty.com/hc/en-gb/articles/18116100002333-Setting-a-property-s-title-and-description)</td>
		<td>Named description sets per channel; deleting one falls back to the default. AI writes three drafts with tone and length.</td>
		<td>Per-channel copy that falls back to a default</td>
		<td>A channel field uses the Base until it's customised</td>
	</tr>
	<tr>
		<td>[OwnerRez](https://www.ownerrez.com/support/articles/property-descriptions)</td>
		<td>Default descriptions plus an override tab per channel; fields inherit until replaced; per-channel limits in tooltips.</td>
		<td>Inherit until overridden, field by field</td>
		<td>"Uses the Base" / "Custom for Airbnb" on every field</td>
	</tr>
	<tr>
		<td>[Pimcore](https://docs.pimcore.com/platform/next/Pimcore/Objects/Object_Classes/Additional_Class_Settings/Data_Inheritance/)</td>
		<td>Product information tool. Inherited values show grey with a marker that links to their source.</td>
		<td>Inherited vs changed, visible on every field</td>
		<td>Base values render read-only on channel pages; hovering shows the Base and each channel's value</td>
	</tr>
	<tr>
		<td>[Akeneo](https://help.akeneo.com/serenity-your-first-steps-with-akeneo/serenity-understand-product-completeness)</td>
		<td>Product information tool where a channel is a scope; completeness per channel, with a jump to each missing field.</td>
		<td>Per-channel status that links to the field</td>
		<td>Tip counts on each channel page in the menu, and on each tab of the page</td>
	</tr>
	<tr>
		<td>[Shopify Markets](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/store-contextualization/understanding-markets-and-overrides)</td>
		<td>Store defaults with overrides per market, and a "View as" preview of each.</td>
		<td>Default → override, plus see it as the customer does</td>
		<td>Canvas: each channel's guest page, built from the same data</td>
	</tr>
	<tr>
		<td>[Rankbreeze](https://support.rankbreeze.com/en/articles/15282318-create-a-high-converting-airbnb-listing-with-rankbreeze-s-ai-listing-writer)</td>
		<td>Airbnb listing writer that only uses features already in the listing; three title drafts; delivered by copy and paste.</td>
		<td>Grounded generation: no invented features</td>
		<td>Tips cite the Listing base facts and guest questions they rest on</td>
	</tr>
	<tr>
		<td>[AirDNA](https://help.airdna.co/en/articles/10559022-rentalizer-revenue-calculator)</td>
		<td>Market data. Builds comp sets and rates their strength; "Comparable Amenities" splits must-haves from advantages.</td>
		<td>Comps that inform content, not only price</td>
		<td>"Similar homes" as a reason in a tip's why</td>
	</tr>
	<tr>
		<td>[GitHub suggested changes](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request)</td>
		<td>A reviewer's change shown as a small diff, applied with one click or dismissed.</td>
		<td>A suggestion is a visible diff you accept or dismiss</td>
		<td>A tip shows the change as a diff, with Accept and Dismiss</td>
	</tr>
</table>
<columns>
	<column>
		![Pimcore: inherited values render grey with a green marker; a changed field renders solid. Provenance: REAL·PUBLIC, docs.pimcore.com.](file-upload://3eee18af-1645-8102-aa67-00b24862953c)
	</column>
	<column>
		![Guesty: description sets, each tied to the channels it applies to. Provenance: REAL·PUBLIC, help.guesty.com.](file-upload://3eee18af-1645-8158-ad0f-00b2044aa372)
	</column>
</columns>
## What I designed against
Each of these is documented by the vendor itself or in public host complaints.
- **One ownership switch per listing** ("sync everything" or not) instead of a state per field.
- **AI that rewrites guest-facing text without the host seeing it.** The few public AI-copy complaints are about exactly this.
- **Bulk copy that overwrites with no history.**
- **A Booking.com description box that goes nowhere,** because Booking.com writes its own.
## Every product reviewed
All through their public help pages, docs and product pages (`REAL·PUBLIC`). The competitor scan covered 36 products; the Knowledge Hub and Smart Listings explorations then studied more tools for specific patterns. Each group opens below.
<details>
<summary>**Short-term rental software: PMS, channel managers and host tools (15)**</summary>
	<table header-row="true">
		<tr>
			<td>Product</td>
			<td>What I looked at</td>
			<td>Source</td>
		</tr>
		<tr>
			<td>**Hospitable** (today)</td>
			<td>The baseline. "Edit per channel" on a few fields, for Airbnb and Direct only; no Booking⁠.com text; AI for guest messaging, not listings.</td>
			<td>[Help centre](https://help.hospitable.com/en/articles/11596108-listing-management-overview)</td>
		</tr>
		<tr>
			<td>**Guesty**</td>
			<td>Full vs limited sync; named description sets per channel; AI drafts with tone, length and audience.</td>
			<td>[Help centre](https://help.guesty.com/hc/en-gb/articles/18116100002333-Setting-a-property-s-title-and-description)</td>
		</tr>
		<tr>
			<td>**Hostaway**</td>
			<td>Import from Airbnb; a Channel Specific tab; an "improve" button; listing facts feed its AI replies.</td>
			<td>[Help centre](https://support.hostaway.com/hc/en-us/articles/360016537733-Listings-Content-Fields-Exported-to-Channels)</td>
		</tr>
		<tr>
			<td>**Hostfully**</td>
			<td>One checkbox for a separate Booking⁠.com description.</td>
			<td>[Help centre](https://help.hostfully.com/en/articles/8017235-update-your-property-s-description)</td>
		</tr>
		<tr>
			<td>**Lodgify**</td>
			<td>"Sync everything" vs limited, per channel; per-channel fees and mark-up.</td>
			<td>[Help centre](https://help.lodgify.com/hc/en-us/articles/360010559439-Edit-channel-configurations-for-Airbnb-API)</td>
		</tr>
		<tr>
			<td>**OwnerRez**</td>
			<td>A default plus an override tab per channel; fields inherit until replaced.</td>
			<td>[Help centre](https://www.ownerrez.com/support/articles/property-descriptions)</td>
		</tr>
		<tr>
			<td>**Smoobu**</td>
			<td>Content stays on each channel; Smoobu owns price and availability only.</td>
			<td>[Help centre](https://support.smoobu.com/hc/en-us/articles/12204140260754-After-connecting-where-do-I-change-prices-and-settings-Smoobu-or-the-channel)</td>
		</tr>
		<tr>
			<td>**Uplisting**</td>
			<td>A one-way push at publish, behind a pre-publish checklist.</td>
			<td>[Help centre](https://support.uplisting.io/en/article/how-to-connect-to-bookingcom-m0ns68/)</td>
		</tr>
		<tr>
			<td>**iGMS**</td>
			<td>A separate editor per channel.</td>
			<td>[Help centre](https://help.igms.com/en/articles/9927954-airbnb-listing-editor-overview)</td>
		</tr>
		<tr>
			<td>**Avantio**</td>
			<td>Distributes property details to 50+ portals, with per-portal rules.</td>
			<td>[Product page](https://www.avantio.com/vacation-rental-channel-manager/)</td>
		</tr>
		<tr>
			<td>**Beds24**</td>
			<td>Specific content for Airbnb; "View content" before switching to full sync.</td>
			<td>[Wiki](https://wiki.beds24.com/index.php/Specific_content_for_Airbnb)</td>
		</tr>
		<tr>
			<td>**Tokeet**</td>
			<td>Full sync locks the Airbnb dashboard; imports a replica of the listing.</td>
			<td>[Help centre](https://www.tokeet.com/help/article/airbnb-api-new-faq)</td>
		</tr>
		<tr>
			<td>**Breezeway**</td>
			<td>Its AI concierge names the fact each answer used, and learns from staff replies.</td>
			<td>[Product page](https://www.breezeway.io/concierge)</td>
		</tr>
		<tr>
			<td>**HostAI** (Conduit)</td>
			<td>Daily suggested knowledge tunings the host accepts or skips.</td>
			<td>[Blog](https://conduit.ai/blog/elevate-your-short-term-rentals-with-host-ais-knowledge-tuning)</td>
		</tr>
		<tr>
			<td>**Enso Connect**</td>
			<td>A knowledge base where one entry applies to a listing, a group or a tag.</td>
			<td>[Product page](https://ensoconnect.com/features/enso-ai)</td>
		</tr>
	</table>
</details>
<details>
<summary>**AI and market tools (6)**</summary>
	<table header-row="true">
		<tr>
			<td>Product</td>
			<td>What I looked at</td>
			<td>Source</td>
		</tr>
		<tr>
			<td>**Airbnb** (host AI)</td>
			<td>AI photo tour that keeps the host's manual edits when it re-sorts.</td>
			<td>[Newsroom](https://news.airbnb.com/airbnb-2025-summer-release)</td>
		</tr>
		<tr>
			<td>**Rankbreeze**</td>
			<td>A listing writer that uses only features already in the listing; three title drafts; copy and paste, no push.</td>
			<td>[Help centre](https://support.rankbreeze.com/en/articles/15282318-create-a-high-converting-airbnb-listing-with-rankbreeze-s-ai-listing-writer)</td>
		</tr>
		<tr>
			<td>**AirDNA**</td>
			<td>Comp sets with a strength rating; comparable amenities split into must-haves and advantages.</td>
			<td>[Help centre](https://help.airdna.co/en/articles/10559022-rentalizer-revenue-calculator)</td>
		</tr>
		<tr>
			<td>**PriceLabs**</td>
			<td>Market dashboards with percentile price bands; one comp set reused across pricing and pacing.</td>
			<td>[Product page](https://hello.pricelabs.co/market-dashboards/)</td>
		</tr>
		<tr>
			<td>**Beyond**</td>
			<td>Comp sets that show what is included or excluded, and why.</td>
			<td>[Product page](https://www.beyondpricing.com/products/insights-pro)</td>
		</tr>
		<tr>
			<td>**Wheelhouse**</td>
			<td>Comp sets built on how guests decide, with thresholds that adapt to density.</td>
			<td>[Research page](https://usewheelhouse.com/research-comp-sets)</td>
		</tr>
	</table>
</details>
<details>
<summary>**Analogues outside short-term rentals (18)**</summary>
	<table header-row="true">
		<tr>
			<td>Product</td>
			<td>What I looked at</td>
			<td>Source</td>
		</tr>
		<tr>
			<td>**Akeneo PIM**</td>
			<td>A channel as a scope; completeness per channel with a jump to the missing field.</td>
			<td>[Help centre](https://help.akeneo.com/serenity-your-first-steps-with-akeneo/serenity-understand-product-completeness)</td>
		</tr>
		<tr>
			<td>**Salsify**</td>
			<td>Readiness per retailer, and a grade for what actually went live.</td>
			<td>[Help centre](https://getstarted.salsify.com/help/configuring-a-readiness-report)</td>
		</tr>
		<tr>
			<td>**Pimcore**</td>
			<td>Child objects inherit empty fields; inherited values show grey with a link to their source.</td>
			<td>[Docs](https://docs.pimcore.com/platform/next/Pimcore/Objects/Object_Classes/Additional_Class_Settings/Data_Inheritance/)</td>
		</tr>
		<tr>
			<td>**Shopify** (channels and Markets)</td>
			<td>Defaults with overrides per market, and "View as" each one.</td>
			<td>[Help centre](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/store-contextualization/understanding-markets-and-overrides)</td>
		</tr>
		<tr>
			<td>**Contentful**</td>
			<td>Field-level locales; an empty field falls back along a chain.</td>
			<td>[Help centre](https://www.contentful.com/help/localization/field-and-entry-localization/)</td>
		</tr>
		<tr>
			<td>**Sanity**</td>
			<td>Field-level and document-level translation in one model: facts per field, voice per document.</td>
			<td>[Docs](https://www.sanity.io/docs/studio/localization)</td>
		</tr>
		<tr>
			<td>**Figma variables**</td>
			<td>One variable, one value per mode: rows are facts, columns are channels.</td>
			<td>[Help centre](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)</td>
		</tr>
		<tr>
			<td>**Google Ads** (responsive search ads)</td>
			<td>A pool of headlines, pinning, a live strength rating and "Added by Google AI".</td>
			<td>[Help centre](https://support.google.com/google-ads/answer/7684791)</td>
		</tr>
		<tr>
			<td>**Google Merchant Center**</td>
			<td>Issues per destination, warning vs disapproval, with suggested fixes.</td>
			<td>[Help centre](https://support.google.com/merchants/answer/12153802?hl=en)</td>
		</tr>
		<tr>
			<td>**Notion AI**</td>
			<td>Select, edit with AI, then Accept, Discard or Try again.</td>
			<td>[Guide](https://www.notion.com/help/guides/notion-ai-for-docs)</td>
		</tr>
		<tr>
			<td>**Grammarly**</td>
			<td>Brand tones set by picking examples; a tone chip on drafts.</td>
			<td>[Help centre](https://support.grammarly.com/hc/en-us/articles/4403544890253-Set-brand-tones)</td>
		</tr>
		<tr>
			<td>**Canva**</td>
			<td>Brand voice, extracted from an existing site or document.</td>
			<td>[Help centre](https://www.canva.com/help/brand-voice/)</td>
		</tr>
		<tr>
			<td>**GitHub** (pull requests)</td>
			<td>A suggested change as a small diff, committed alone or in a batch.</td>
			<td>[Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request)</td>
		</tr>
		<tr>
			<td>**Figma** (branching)</td>
			<td>Review changes side by side; resolve each conflict by picking a side.</td>
			<td>[Help centre](https://help.figma.com/hc/en-us/articles/5693123873687-Review-branch-changes)</td>
		</tr>
		<tr>
			<td>**Airtable**</td>
			<td>Bulk actions whose button says how many records it will change.</td>
			<td>[Help centre](https://support.airtable.com/articles/3799201176-updating-multiple-fields-with-bulk-field-actions)</td>
		</tr>
		<tr>
			<td>**Linear**</td>
			<td>Filter, select all, then one command on the selection.</td>
			<td>[Docs](https://linear.app/docs/select-issues)</td>
		</tr>
		<tr>
			<td>**App store experiments** (Apple, Google Play)</td>
			<td>Treatments against a baseline, with plain verdicts and "apply treatment".</td>
			<td>[Apple](https://developer.apple.com/app-store/product-page-optimization/) · [Google Play](https://support.google.com/googleplay/android-developer/answer/12053285?hl=en)</td>
		</tr>
		<tr>
			<td>**Email A/B testing** (Klaviyo, Mailchimp)</td>
			<td>AI writes a variation along a named axis; the winner is picked by significance.</td>
			<td>[Klaviyo](https://help.klaviyo.com/hc/en-us/articles/115005228148) · [Mailchimp](https://mailchimp.com/help/create-ab-tests/)</td>
		</tr>
	</table>
</details>
<details>
<summary>**AI support tools studied for the Knowledge Hub (3)**</summary>
	<table header-row="true">
		<tr>
			<td>Product</td>
			<td>What I looked at</td>
			<td>Source</td>
		</tr>
		<tr>
			<td>**Intercom Fin**</td>
			<td>Content gaps ranked by impact, shown with the conversations behind them; answers list the content they used.</td>
			<td>[Help centre](https://www.intercom.com/help/en/articles/11394959-use-ai-powered-content-suggestions-to-improve-fin)</td>
		</tr>
		<tr>
			<td>**Chatbase**</td>
			<td>Sources added by type in a side sheet; several phrasings of a question mapped to one answer.</td>
			<td>[Docs](https://www.chatbase.co/docs/user-guides/chatbot/data-sources)</td>
		</tr>
		<tr>
			<td>**Ada, Crisp, Zendesk**</td>
			<td>Knowledge switched on or off per item; Test next to Publish.</td>
			<td>[Ada docs](https://docs.ada.cx/docs/generative/set-up-your-ai-agent-s-knowledge-and-behavior/manage-your-knowledge-content/)</td>
		</tr>
	</table>
</details>
<details>
<summary>**Pattern references behind the Smart Listings directions**</summary>
	<table header-row="true">
		<tr>
			<td>Direction</td>
			<td>Products studied</td>
		</tr>
		<tr>
			<td>Voice kit</td>
			<td>[Grammarly brand tones](https://support.grammarly.com/hc/en-us/articles/4403544890253-Set-brand-tones) · [Canva brand voice](https://www.canva.com/help/brand-voice/)</td>
		</tr>
		<tr>
			<td>Live canvas</td>
			<td>[Framer on-page editing](https://www.framer.com/help/articles/on-page-editing/) · [Notion AI](https://www.notion.com/help/guides/notion-ai-for-docs) · [Canva Magic Design](https://www.canva.com/help/use-magic-design/)</td>
		</tr>
		<tr>
			<td>Listing score</td>
			<td>[Google Ads optimisation score](https://support.google.com/google-ads/answer/9061546?hl=en) · [Google Ads Ad Strength](https://support.google.com/google-ads/answer/9921843?hl=en) · [Yoast SEO](https://yoast.com/yoast-seo-traffic-lights/)</td>
		</tr>
		<tr>
			<td>Goals, guardrails and experiments</td>
			<td>[Google Performance Max](https://support.google.com/google-ads/answer/10724817?hl=en) · [Meta Advantage+ creative](https://www.facebook.com/business/help/297506218282224) · [Optimizely results](https://support.optimizely.com/hc/en-us/articles/38994840559501-Optimizely-Experiment-Results-page)</td>
		</tr>
		<tr>
			<td>Multi-channel composer</td>
			<td>[Buffer](https://support.buffer.com/article/644-how-do-i-schedule-posts-for-multiple-social-channels-at-the-same-time) · [Hootsuite Composer](https://help.hootsuite.com/hc/en-us/articles/115010088387-Overview-Create-and-publish-posts)</td>
		</tr>
		<tr>
			<td>This-or-that</td>
			<td>[Midjourney personalisation](https://docs.midjourney.com/hc/en-us/articles/32433330574221-Personalization) · [Spotify taste profile](https://newsroom.spotify.com/2026-03-13/taste-profile-beta-announcement/)</td>
		</tr>
		<tr>
			<td>Co-writer</td>
			<td>[ChatGPT Canvas](https://openai.com/index/introducing-canvas/) · [Claude Artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them) · [Notion suggested edits](https://www.notion.com/help/suggested-edits)</td>
		</tr>
	</table>
	Each direction was also checked against real screens on Mobbin (Grammarly, Squarespace, Wix, Semrush, Klaviyo, Buffer, Hootsuite, ChatGPT, Mistral, PandaDoc, HubSpot, Airtable and others). All 197 screens, with what I borrowed from each and a link to its Mobbin page, are on <mention-page url="https://app.notion.com/p/3efe18af164581dc88e7ceb2c86bb63e">Design references</mention-page>. See <mention-page url="https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d">Concept directions</mention-page>. {color="gray"}
</details>
## How it was made
From 36 products in the competitor scan, plus the tools studied later for the Knowledge Hub and the Smart Listings directions, all through their public pages (every one is listed above). See <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Desk research</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Desk research</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d">Concept directions</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5">Canvas preview</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645819e9675db2668610c2b">KD-14</mention-page>
