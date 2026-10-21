<callout icon="✅" color="gray_bg">
	**Output · Planned** · The service map: where Smart Listings sits in Hostaway, what flows between it and each product area, and how far each connection has got. Provenance: "today" is / ; "Built" means built in the prototype, its figures ; "Next" and "Later" are .
</callout>
![The service map. Smart Listings and Shared sit at the centre; each product area sits on a ring by when it is reached: Built (in the prototype, sample data ), Next and Later (my plan, ). Wires say what flows; dashed outlines are the four lines of work the build implies but doesn't do. Flows from the product map.](file-upload://3efe18af-1645-81e5-adbc-00b207cf7cc1)
## The short version
- **Shared is the record.** Listing details live once, in the Listing base. The Knowledge Hub reads them, adds the situations behind them, and learns from guests' questions. Smart Listings reads them, writes through Save, and learns from results.
- **18 flows connect it to the rest of Hostaway.** 9 are built in the prototype (similar homes only on sample data), 2 are next and 7 are later.
- **Three built flows make the listing smart:** similar homes into the strategy, Listing base facts and guest questions as a tip's why, and results per strategy period. All three run on sample data so far.
- **Tips become a system** when any area can raise one through the same contract: Inbox, reviews and Calendar next; Devices, Operations and portfolios later.
- **Two choices are platform decisions, not screens:** the Knowledge Hub API contract, and moving existing hosts onto one record.
## The 18 flows
Numbered as in the product map. Status: **Built** in the prototype · **Next** · **Later**, using the horizons of the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>#</td>
		<td>From → to</td>
		<td>What flows</td>
		<td>Status</td>
	</tr>
	<tr color="gray_bg">
		<td></td>
		<td>**Into Smart Listings**</td>
		<td></td>
		<td></td>
	</tr>
	<tr>
		<td>2</td>
		<td>Host → Shared</td>
		<td>Edits on web or phone; a fact described in words or by voice, confirmed as a typed fact</td>
		<td>**Built** · voice and structuring simulated</td>
	</tr>
	<tr>
		<td>3</td>
		<td>Similar homes → Smart Listings</td>
		<td>Price and positioning, as the strategy's framing and a tip's why. Today comps live in point tools, outside the PMS </td>
		<td>**Built** on sample data · a real dataset is next</td>
	</tr>
	<tr>
		<td>4</td>
		<td>Knowledge Hub → Smart Listings</td>
		<td>Guest questions, grouped and counted, cited as a tip's why; an unanswered or frequent question becomes a tip. Today the Hub feeds guest messaging only, and no one sees what guests ask </td>
		<td>**Built** as a concept on demo data · real Inbox questions next</td>
	</tr>
	<tr>
		<td>16</td>
		<td>Metrics → Smart Listings</td>
		<td>Bookings and occupancy per channel, against the stretch before the strategy</td>
		<td>**Built** as Performance · strategy periods next</td>
	</tr>
	<tr>
		<td>1</td>
		<td>Import → Shared</td>
		<td>Airbnb and Booking⁠.com content, with differences decided once</td>
		<td>**Next** · Angle A</td>
	</tr>
	<tr color="gray_bg">
		<td></td>
		<td>**Out to the channels**</td>
		<td></td>
		<td></td>
	</tr>
	<tr>
		<td>5</td>
		<td>Smart Listings → Save</td>
		<td>Accepted tips; Autopilot's changes to text and photo order</td>
		<td>**Built** · Autopilot's own applying not simulated</td>
	</tr>
	<tr>
		<td>6</td>
		<td>Shared → Save → channels</td>
		<td>The Base for every field a channel uses; one send per change, a receipt per channel, Undo. Today Save shows no result </td>
		<td>**Built**</td>
	</tr>
	<tr>
		<td>7</td>
		<td>→ Airbnb</td>
		<td>Text, photo order, fees, rules, check-in method</td>
		<td>**Built** · write rules to confirm with Integrations</td>
	</tr>
	<tr>
		<td>8</td>
		<td>→ Booking⁠.com</td>
		<td>Facts, money and stay rules. Booking⁠.com writes its own description so it is shown read-only</td>
		<td>**Built**</td>
	</tr>
	<tr>
		<td>9</td>
		<td>→ Direct</td>
		<td>Base text and a Direct strategy</td>
		<td>**Built**</td>
	</tr>
	<tr>
		<td>10</td>
		<td>→ Google Vacation Rentals</td>
		<td>A feed of facts, price and availability</td>
		<td>**Later**</td>
	</tr>
	<tr color="gray_bg">
		<td></td>
		<td>**Read by the rest of Hostaway**</td>
		<td></td>
		<td></td>
	</tr>
	<tr>
		<td>11</td>
		<td>Shared → the assistant's guest messages</td>
		<td>Facts for replies, read from the Listing base through the Hub, so the AI answers only what a fact backs. Today the AI reads the Hub's own copy of the listing </td>
		<td>**Next**</td>
	</tr>
	<tr>
		<td>13</td>
		<td>Smart Listings + Shared → Dynamic Pricing & Calendar</td>
		<td>The strategy's goal and price guardrails, so words and prices pull the same way. Calendar inside the property is built, look-only</td>
		<td>**Later** · money moves last</td>
	</tr>
	<tr>
		<td>18</td>
		<td>Shared ↔ MCP and public API</td>
		<td>Typed facts from the Listing base, and the Hub's questions and answers. Today the Hub is open to agents as sentences </td>
		<td>**Later** · versioning the API comes next, so nothing breaks</td>
	</tr>
	<tr>
		<td>12</td>
		<td>Shared → Guidebook</td>
		<td>One house manual, in the Base</td>
		<td>**Later**</td>
	</tr>
	<tr>
		<td>14</td>
		<td>Shared → Operations</td>
		<td>Check-in and check-out times; beds, linens and max guests as facts that tasks read</td>
		<td>**Later**</td>
	</tr>
	<tr>
		<td>15</td>
		<td>Shared ↔ Devices</td>
		<td>A smart lock as a fact that sets the check-in method guests see</td>
		<td>**Later**</td>
	</tr>
	<tr>
		<td>17</td>
		<td>Save → Owner statements</td>
		<td>Receipts: what changed, when and by whom (host, team member, Autopilot)</td>
		<td>**Later**</td>
	</tr>
</table>
## How tips become a system
Today only channel pages raise tips. But a tip is already a contract, and any area that can fill it in can raise one. The host then sees it in the same panel, on the page where the change lands.
<table header-row="true" fit-page-width="true">
	<tr>
		<td>The contract</td>
		<td>What it carries</td>
		<td>In the prototype today</td>
	</tr>
	<tr>
		<td>Where</td>
		<td>The area, the object and the field it changes</td>
		<td>Channel, page, tab and field</td>
	</tr>
	<tr>
		<td>The change</td>
		<td>Before → after, or a set of alternatives</td>
		<td>Built, with five more options at a time</td>
	</tr>
	<tr>
		<td>Scope</td>
		<td>Who it affects: one channel, every channel, later a portfolio</td>
		<td>"Creates Airbnb's own value" or "Applies to every channel"</td>
	</tr>
	<tr>
		<td>Why</td>
		<td>One to three bullets, each with its source</td>
		<td>Strategy and similar homes · guest questions in the Knowledge Hub · Listing base facts</td>
	</tr>
	<tr>
		<td>Risk</td>
		<td>Money and rules always ask, even on Autopilot</td>
		<td>Built (<mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>)</td>
	</tr>
	<tr>
		<td>Actions</td>
		<td>Accept, Dismiss, Undo; Save sends it; a receipt records it</td>
		<td>Built (<mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a">KD-15</mention-page>)</td>
	</tr>
</table>
Areas that could raise tips. Every example is illustrative .
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Area</td>
		<td>What it notices</td>
		<td>An example tip</td>
		<td>Where the change lands</td>
		<td>Status</td>
	</tr>
	<tr>
		<td>Channels</td>
		<td>The strategy, similar homes, guest questions, Listing base facts</td>
		<td>"Say how fast the Wi-Fi is"</td>
		<td>The channel's field</td>
		<td>**Built**</td>
	</tr>
	<tr>
		<td>Knowledge Hub</td>
		<td>Questions it can't answer, or that guests ask often</td>
		<td>"Add a fact about parking: guests keep asking"</td>
		<td>The Listing base, so every channel and the assistant use the fact</td>
		<td>**Built** as a concept (the parking question raises a tip) · real questions next</td>
	</tr>
	<tr>
		<td>Inbox</td>
		<td>Questions guests repeat before arrival</td>
		<td>"Give the airport route in Arrival on Airbnb"</td>
		<td>A channel field, or a fact in the Listing base</td>
		<td>**Next** · inquiries already feed tips</td>
	</tr>
	<tr>
		<td>Reviews</td>
		<td>What guests praise, or say was missing</td>
		<td>A listing tip citing the reviews</td>
		<td>Channel › Listing</td>
		<td>**Next**</td>
	</tr>
	<tr>
		<td>Calendar</td>
		<td>Short gaps between bookings that stay empty</td>
		<td>"Allow shorter stays in gaps", which always asks</td>
		<td>Channel › Availability</td>
		<td>**Next** · the tip always asks; Dynamic Pricing reading the same goal comes later (flow 13)</td>
	</tr>
	<tr>
		<td>Performance, through the assistant</td>
		<td>A measure moving against the stretch before</td>
		<td>The assistant answers "why did Airbnb bookings drop?" and opens the matching tip</td>
		<td>The tip's own page</td>
		<td>**Next**</td>
	</tr>
	<tr>
		<td>Devices</td>
		<td>A connected smart lock</td>
		<td>"Show self check-in on every channel"</td>
		<td>Channel › Listing › Arrival</td>
		<td>**Later**</td>
	</tr>
	<tr>
		<td>Operations</td>
		<td>A Base change that tasks depend on</td>
		<td>"Max guests changed: update the linen task"</td>
		<td>Operations › tasks</td>
		<td>**Later**</td>
	</tr>
	<tr>
		<td>Portfolio</td>
		<td>The same pattern on several properties</td>
		<td>One tip, applied to each property with one receipt each</td>
		<td>Each property's page</td>
		<td>**Later**</td>
	</tr>
</table>
**The rules that make it one system:**
- **One voice.** Every tip is the assistant's (<mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>). No area invents its own assistant, card or colour.
- **A tip lands where the change lives.** Raised in Inbox, it opens on the field or fact it changes, so nothing is edited in two places (<mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>).
- **One change, one tip.** When two areas notice the same thing, the host gets one tip with both sources.
- **One tip at a time per page,** in the docked panel (<mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>), and a budget per area, set with Data, so tips don't become noise.
- **Every accepted tip leaves a receipt,** so Performance, owner statements and Support read the same history.
## What it needs underneath
<table header-row="true" fit-page-width="true">
	<tr>
		<td>Shared service</td>
		<td>Used by</td>
		<td>Owner to involve</td>
	</tr>
	<tr>
		<td>Shared: the Listing base and the Knowledge Hub</td>
		<td>Every area</td>
		<td>AI/ML lead · Head of Product</td>
	</tr>
	<tr>
		<td>The tip service: the contract, ranking, merging</td>
		<td>Any area that raises tips</td>
		<td>Design system · ML</td>
	</tr>
	<tr>
		<td>The receipt log</td>
		<td>Performance, owner statements, Support, Sales</td>
		<td>Engineering</td>
	</tr>
	<tr>
		<td>The similar-homes dataset</td>
		<td>Strategy, tips, Performance</td>
		<td>Data · Legal</td>
	</tr>
	<tr>
		<td>Measures per strategy period</td>
		<td>Performance, the assistant</td>
		<td>Data & analytics lead</td>
	</tr>
	<tr>
		<td>One amenity list, with an owner</td>
		<td>Channels, Google, the API</td>
		<td>Integrations · Head of Product</td>
	</tr>
</table>
## How it was made
Desk work. I traced the product map's 18 flows against the prototype and placed each as built, next or later, using the Roadmap's horizons. The tip contract is read from the prototype's tip card and its data. What each line of work still lacks, and how I'd run it, is in <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645815caf9bc8e55ee265e9">Second-order effects</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>
**In the prototype**
- [Airbnb › Listing with Tips]()
- [Knowledge Hub › Questions › Parking]()
- [Performance]()
