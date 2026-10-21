<page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9" icon="🔭">
<ancestor-path>
<parent-page url="https://app.notion.com/p/077a29bbf7bd42e68b9f534a71add09e" title=""/>
<ancestor-2-page url="https://app.notion.com/p/2681821ee55647018413ef6be659e4e4" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645813ea2e7d6c6dbf87ddf" title="07 · Systems & next"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Second-order effects"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"🔭"}</iconMetadata>
<content>
<callout icon="🔭" color="gray_bg">
	**Output · Projected** · What Smart Listings sets off elsewhere in Hospitable, and what I'd do about it. Every effect is `ASSUMPTION`: the product isn't shipped, so none is observed.
</callout>
![How the property record flows through Hospitable. Shared is written once and read by every surface; dashed arrows are new or changed by this proposal. Import, on the left, is the next step on the Roadmap. Today's flows REAL·PRODUCT / REAL·PUBLIC; proposed flows ASSUMPTION.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/faf5bd7a-e233-4db2-a4d0-44cc80ccd53c/product-map-sl.png)
## The short version
- **Shared becomes the record the whole product reads.** Guest replies, pricing, operations and owner statements read the same facts the listings show.
- **That's the upside and the risk.** A right fact reaches everywhere; so does a wrong one.
- **Autopilot changes the relationship with the channels.** More writes than "configured once", so rate limits and terms matter.
- **New words and new patterns** spread to support, sales and the design system, and need an owner.
- Three effects go to leadership first: blast radius, channel terms, and the comps dataset.
## The effects
<table header-row="true">
<tr>
<td>What changes elsewhere</td>
<td>Risk</td>
<td>Mitigation</td>
<td>Signal to watch</td>
</tr>
<tr>
<td>**Guest messaging.** Replies read the same facts as the listings, so a reply can't contradict a listing.</td>
<td>Blast radius: one wrong fact now reaches every channel and every guest reply at once.</td>
<td>Every fact shows its source and how many channels use it. Tips on shared fields say "Applies to every channel". The Knowledge Hub's Test lets the host ask the assistant before guests do.</td>
<td>Undo rate; overwrite incidents</td>
</tr>
<tr>
<td>**Pricing.** One strategy goal (fill nights, a higher price) now moves words and prices together.</td>
<td>Copy and Dynamic Pricing pull in different directions.</td>
<td>The strategy is the one place the goal is set. Dynamic Pricing reads the same goal and guardrails. Money always asks, even on Autopilot.</td>
<td>Occupancy and revenue per channel; price changes outside guardrails</td>
</tr>
<tr>
<td>**Support.** Fewer "where do I edit?" and "why did my listing change?"; new "why did Autopilot do this?" and "why does this tip say that?".</td>
<td>A new class of tickets replaces the old one.</td>
<td>Every change shows its why and its source. CS sees the same view as the host, with macros per tip type. Autopilot stays narrow: text and photo order.</td>
<td>Tickets per 100 properties, by category; CSAT</td>
</tr>
<tr>
<td>**Sales.** One source of truth and a log of what changed answer security and operations questions in a demo.</td>
<td>Mostly upside, if Sales can show it.</td>
<td>An exportable change log with who changed what (host, team member, Autopilot). A three-minute demo path for Sales.</td>
<td>Sales calls where listing issues block a 25+ deal</td>
</tr>
<tr>
<td>**Channel partners.** Autopilot writes more often than a listing that's "configured once".</td>
<td>Rate limits, rejections, or terms against automated content.</td>
<td>One batch per channel. At most one text change per channel per week until tested `ASSUMPTION`. Back off on rate limits. Pause Autopilot on a channel at any policy notice.</td>
<td>Fields rejected per field sent</td>
</tr>
<tr>
<td>**Legal and trust.** AI writes public copy, per channel.</td>
<td>An invented amenity is a liability, and the EU AI Act asks for transparency.</td>
<td>Tips use only confirmed facts and cite them. Autopilot never writes money or rules. Booking⁠.com's text is never written. Disclosure wording agreed with Legal before launch.</td>
<td>AI copy reverted or complained about</td>
</tr>
<tr>
<td>**Comps.** Similar homes frame strategies and tips.</td>
<td>A moat and a privacy question at once. Listings may also start to sound alike.</td>
<td>Aggregates only, with a minimum group size `ASSUMPTION`. Never another host's text verbatim. Tips are written from the host's own facts and audience, with alternatives.</td>
<td>Tip acceptance vs AI copy reverted; comp groups under the minimum (no measure yet)</td>
</tr>
<tr>
<td>**Design system and language.** Six patterns go product-wide (Fact, Source, Inheritance, Tip, Receipt, Autonomy), plus new words: Base, customise, set by the channel, tip, Autopilot.</td>
<td>Each team builds its own version, and hosts learn four.</td>
<td>The design system owns the six patterns. A content designer owns one glossary, used in the UI, the help centre and CS macros.</td>
<td>Comprehension score; help-centre searches for the new words</td>
</tr>
</table>
## The three to bring to leadership first
1. **Blast radius** is the honest cost of "facts once". If every fact can't show its source and its reach, one store is more dangerous than two.
2. **Channel terms** could switch Autopilot off on a channel overnight. Know the answer before marketing Autopilot.
3. **The comps dataset** is the strategic upside, and it needs Legal on day one, not at launch.
## How it was made
Desk work on the prototype: each surface that reads the property record was traced, and each effect was given a mitigation and a measure from <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7"/>. The open questions go to the people in <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5"/>.
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632"/> · <mention-page url="https://app.notion.com/p/3eee18af1645813da04df010073ed382"/> · **Feeds** <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c"/> · **Decisions** <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754"/> · <mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033"/> · <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0"/> · **In the prototype** [Knowledge Hub › Sources](https://hospitable-case-djur32.vercel.app/property/neukolln/hub/sources)
<span color="gray">Files:</span> `research/systems/second-order.md` · `research/systems/product-map.md` · `research/systems/ds-forward.md` · `plan/notion-v2/img/product-map-sl.svg`
</content>
</page>
