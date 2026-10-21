<page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/48cc3ac66701403aa02abd43c3127e12" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7261d150557441ca8da996f6ffbb240f" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af16458127800cde5c8b1017c8" title="01 · Discovery"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Research questions & assumptions"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done (written)** · The questions Smart Listings has to answer and the assumptions it rests on. The assumptions are **untested**: none has been checked with real hosts. Provenance: `ASSUMPTION`, each grounded in a `REAL·BRIEF`, `REAL·PRODUCT` or `REAL·PUBLIC` signal.
</callout>
## The short version
- Eight questions decide Smart Listings: trust in AI suggestions, who wants per-channel differences, where hosts look for things, what each channel accepts, what performance data exists, what "similar homes" can mean, who owns listing quality, and who must agree to one record.
- Five assumptions are the riskiest: important to the design, and backed by little evidence.
- One was refuted before research began. Booking⁠.com doesn't accept Hospitable's description, which is why its description is read-only.
## The research questions
<table header-row="true">
<tr>
<td>Question</td>
<td>Why it matters for Smart Listings</td>
<td>Answered by</td>
</tr>
<tr>
<td>When do hosts trust an AI suggestion for their listing, and what makes them stop?</td>
<td>How much each tip must show (why, sources, undo) and whether Autopilot is ever acceptable</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70"/>, <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/></td>
</tr>
<tr>
<td>How much control does each host type want over per-channel titles, descriptions, prices and rules, and how much time will they spend on it?</td>
<td>Whether per-channel differences are a choice or a default</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70"/>, <mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12"/></td>
</tr>
<tr>
<td>Where do hosts expect to find listing content, compared with pricing, availability and policies?</td>
<td>The property menu: Shared first, then one group per channel</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645812ea1ebe5dec041599a"/>, <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d"/></td>
</tr>
<tr>
<td>Which fields can Hospitable read and write on each channel, and how fast does a write go live?</td>
<td>Which fields are customisable or set by the channel; what a receipt can promise</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/>, <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9"/></td>
</tr>
<tr>
<td>Which performance signals exist per channel (views, conversion, occupancy, price), at what delay?</td>
<td>What a tip can cite, and what Performance can measure</td>
<td><mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12"/>, <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/></td>
</tr>
<tr>
<td>Can Hospitable build a reliable set of similar homes per channel, and from which data?</td>
<td>Whether "similar homes" can be a reason in a tip</td>
<td><mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12"/>, <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/></td>
</tr>
<tr>
<td>Who owns listing quality, and who is accountable when AI copy misstates an amenity or a rule?</td>
<td>What a strategy's guardrails hold, and what Autopilot may never change</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/> (Head of Product, Legal)</td>
</tr>
<tr>
<td>Which teams read property data today, and who has to agree to one record?</td>
<td>Whether the Listing base and Knowledge Hub can be one shared layer</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/> (AI/ML lead, Head of Product)</td>
</tr>
</table>
## The riskiest assumptions
Each assumption was scored by how much of the design falls if it's wrong (importance, 1–5) and how much evidence exists (1–5). Risk is importance × (6 − evidence). One person scored them, so the scores are `ASSUMPTION` too; the plan re-scores them with the PM, Integrations and CS leads.
![All 20 hypotheses on the assumptions map: importance up, evidence across. The filled chips were the first plan's riskiest five, three of them about import; the table below keeps the ones Smart Listings rests on. Provenance: ASSUMPTION.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/7aa8b8ec-85fb-4b2f-92a4-735acd7232e1/dc-assumptions-map.png)
<table header-row="true">
<tr>
<td>Assumption</td>
<td>Importance · evidence</td>
<td>How I'd test it</td>
<td>What it shaped</td>
</tr>
<tr>
<td>**Hosts accept an AI suggestion when it shows why, where it goes and how to undo it.** Without those, they reject or rewrite it.</td>
<td>5 · 1</td>
<td>Show hosts a tip with and without its why in <mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70"/>; then accept and dismiss rates in the <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/></td>
<td>Each tip carries its why and sources <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2"/></td>
</tr>
<tr>
<td>**Per-channel copy is wanted by some hosts, not all.** SEO optimisers and some portfolio managers want it; family and new-to-PMS hosts see copy as facts.</td>
<td>5 · 2</td>
<td>Interviews across the four host types; per-host groupings in the <mention-page url="https://app.notion.com/p/3eee18af1645812ea1ebe5dec041599a"/>; Edit per channel usage in the <mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12"/></td>
<td>Customising is a choice per field; tips cover money and stay rules, not only words <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef"/></td>
</tr>
<tr>
<td>**Hosts expect Autopilot never to change facts** (safety, accessibility, fees, rules) without approval, while they'd hand over wording.</td>
<td>4 · 1</td>
<td>A probe in <mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70"/>; an Autopilot task in the <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/></td>
<td>Autopilot is on or off, and suggestions always arrive as tips <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033"/></td>
</tr>
<tr>
<td>**Hosts will read the Knowledge Hub as "everything true about my home"**, not as "what makes the AI smarter".</td>
<td>4 · 1</td>
<td><mention-page url="https://app.notion.com/p/3eee18af1645812ea1ebe5dec041599a"/> and <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d"/></td>
<td>The Hub sits in Shared, and its facts are cited in tips <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0"/></td>
</tr>
<tr>
<td>**Channel-specific titles and descriptions, grounded in similar homes, lift booking conversion enough to measure per channel within 30 days.**</td>
<td>4 · 1</td>
<td>Which signals exist, in the <mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12"/>; a pilot read against the period before, in <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7"/></td>
<td>Performance compares with the period before the strategy <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844"/></td>
</tr>
</table>
<callout icon="✖️" color="red_bg">
	**Refuted before research: "Booking⁠.com accepts Hospitable's description."** The first plan assumed Hospitable could write titles, descriptions and photos to both Airbnb and Booking⁠.com. Booking⁠.com's own partner help says it generates the property description from the property's facts, and hosts can only request a fix (`REAL·PUBLIC` [partner.booking.com](https://partner.booking.com/en-us/help/property-page/general-info/changing-your-property-description-or-room-details)). Hospitable's help centre says it can't sync text fields such as Summary to Booking⁠.com (`REAL·PUBLIC` [help.hospitable.com](https://help.hospitable.com/en/articles/6141381-properties-details-page)). So the assumption became a constraint: in Smart Listings, Booking⁠.com's description is set by the channel and read-only, and a host shapes it through facts, photos and amenities. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/>
	What's still open: whether hosts accept that their "voice" on Booking⁠.com is their facts. Untested.
</callout>
## Left out: the import assumptions
Three of the first plan's riskiest five belong to Angle A: that fear of losing data blocks the switch to Hospitable, that hosts want to review an import before Hospitable takes over, and that setup trouble drives churn. They move with import to the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c"/>.
## How it was made
Questions were written across five lenses (user, business, platform, data, organisation), each naming the decision it unblocks. The thesis was broken into 20 hypotheses, each with what would disprove it, then scored. Grounded in <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf"/> and <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9"/>; the platform questions go to <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/> · <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3"/> · <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84"/> · <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c"/> · **Files** <span color="gray">`research/discovery/questions.md`</span><span color="gray">, </span><span color="gray">`hypotheses.md`</span><span color="gray">, </span><span color="gray">`research/charts/assumptions-map.png`</span>
</content>
</page>
