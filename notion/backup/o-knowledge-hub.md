<page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d" icon="✅">
<ancestor-path>
<parent-page url="https://app.notion.com/p/af20483c998e4cf99cf5f2aa29ae8e82" title=""/>
<ancestor-2-page url="https://app.notion.com/p/7296cc60b4414f1a9870e5a92405299e" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af1645810bb3b3c9d7bf2ab924" title="05 · Design"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Knowledge Hub"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"✅"}</iconMetadata>
<content>
<callout icon="✅" color="gray_bg">
	**Output · Done, as a concept** · What the guest assistant knows about the property, and how hosts add to it. Every Knowledge Hub page in the prototype carries a "Concept" chip: the structure is built and clickable, the AI behind it is simulated. Provenance: the nine topics are Hospitable's own (`REAL·PRODUCT`); facts, questions and counts are `SIMULATED`.
</callout>
![Knowledge Hub › Content › Arrival in the live prototype: a topic page with Questions and Facts, each question's status, and Test. Values SIMULATED.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/f58ec920-08a3-4237-bdf5-0d0ad3de31cb/kh-topic-arrival.png)
## The short version
- The Knowledge Hub sits in Shared, next to the Listing base, with three pages: **Content**, **Workflows** and **Sources**.
- Content keeps Hospitable's nine real topics. Each topic has two tabs: the **Questions** guests ask and the **Facts** that answer them.
- A host adds a fact by **describing it**, typed or by voice. A step structures it into a typed fact, which the host checks and adds.
- Facts about the listing read the same values as the Listing base, so the two can't disagree. Facts a host adds live in the Hub. Tips cite Hub facts as their reason.
## Why it changes
Today Hospitable keeps facts about the home in two places that already disagree on this property (`REAL·PRODUCT`, <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/>). Details lists a "Washer" where the Hub says "Washing machine", and "Wheelchair accessible" exists only in the Hub. A fact added through "New knowledge" is free text under a topic, with no type and no link to the listing, so it never reaches a channel.
## Three pages
<table header-row="true">
<tr>
<td>Page</td>
<td>What it holds</td>
<td>In the prototype</td>
</tr>
<tr>
<td>**Content**</td>
<td>The nine topics as cards, each with its fact count: Amenities, Arrival, Cleaning & Maintenance, Contact Details, Departure, Rules & Regulations, Transportation to/from property, Trash & Recycling, Wifi/Internet</td>
<td>Built. The Hub opens here</td>
</tr>
<tr>
<td>**Workflows**</td>
<td>What the AI could do when a guest needs a process, not a fact: early check-in, a lost key, something broken</td>
<td>Static gallery of examples, nothing clickable</td>
</tr>
<tr>
<td>**Sources**</td>
<td>What the AI reads: Listing details (the source of truth), past guest conversations, Reviews (not enabled), plus ways to add more (guidebook, document, snippet, PMS, CRM)</td>
<td>Listed; adding a source is a preview only</td>
</tr>
</table>
## A topic page
- **Questions** lists what guests ask, with how often and whether it is answered, partly answered or not answered. Opening one shows the answer, the facts it uses, "Add a fact" when it isn't answered, and the Smart Listing tips that use the same facts.
- **Facts** lists every fact in the topic, including the ones a question cites. A row opens a drawer to edit or delete it.
- **Test** opens a panel where you ask a question and see the answer and the facts it quoted. Answers are about the listing, never "as Airbnb".
## Adding a fact by describing it
<columns>
	<column>
		![Step 1 · Describe the fact, typed or with Use voice. "I prefer to fill in the form instead" skips to the form. Live prototype.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/5c2ea521-ef8d-4559-9955-d4cb988fdeda/kh-addfact-describe.png)
	</column>
	<column>
		![Step 2 · The description turned into a typed fact: category, type, what it's about, value, source, which channels it applies to, guest-visible or internal. The host adjusts, then Add. Live prototype.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/7b9311f6-b873-450a-9824-cc40b525c13b/kh-addfact-confirm.png)
	</column>
</columns>
There are eight fact types: Yes / No, Text, Number + unit, Time, Steps, Contact, Place / address, and Link or document. A fact applies to the entire property, some channels or one channel. In the prototype, voice and the structuring step are simulated with canned rules, not a model. The flow uses no AI styling, because it records the host's own input rather than a suggestion.
## How it feeds Smart Listings
Tips cite Hub facts in their "Why", marked with a book icon, e.g. "From your Knowledge Hub · Wifi/Internet: 250 Mbps fibre". A question's drawer lists the open tips that rely on its facts. See <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> and <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0"/>.
## How it was made
Built in the prototype over several iterations: a matrix, a single document, question-first, overview cards and a channel lens, before this structure. The earlier iterations stay reachable by URL only. The topic list was copied from Hospitable's own Knowledge Hub (<mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf"/>).
---
**Builds on** · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a"/> · <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703"/>
**Feeds** · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875"/> · <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975"/>
**Decisions** · <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942"/> · <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0"/>
**In the prototype** · [Knowledge Hub › Content](https://hospitable-case-djur32.vercel.app/property/neukolln/hub/content) · [Arrival topic](https://hospitable-case-djur32.vercel.app/property/neukolln/hub/arrival) · [Sources](https://hospitable-case-djur32.vercel.app/property/neukolln/hub/sources)
<span color="gray">**Files**</span><span color="gray"> · </span><span color="gray">`prototype/src/screens/hub/variants/R/`</span><span color="gray"> · </span><span color="gray">`prototype/src/ds/kh-r.tsx`</span><span color="gray"> · </span><span color="gray">`concepts/knowledge-hub/`</span>
</content>
</page>
