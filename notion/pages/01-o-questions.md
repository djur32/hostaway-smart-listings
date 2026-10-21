<callout icon="✅" color="gray_bg">
	**Output · Done** · The questions Smart Listings has to answer and the assumptions it rests on. The assumptions are **untested**: none has been checked with real hosts. Provenance: each grounded in a or signal.
</callout>
## The short version
- Eight questions decide Smart Listings: trust in AI suggestions, who wants per-channel differences, where hosts look for things, what each channel accepts, what performance data exists, what "similar homes" can mean, who owns listing quality, and who must agree to one record.
- Seventeen hypotheses test the thesis for Smart Listings. Each has a risk score, and the five riskiest are H-09, H-04, H-15, H-20 and H-17.
- One was refuted before research began (H-05). Booking.com doesn't accept Hostaway's description, which is why its description is read-only.
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
		<td><mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">Host interviews</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page></td>
	</tr>
	<tr>
		<td>How much control does each host type want over per-channel titles, descriptions, prices and rules, and how much time will they spend on it?</td>
		<td>Whether per-channel differences are a choice or a default</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">Host interviews</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12">Data review</mention-page></td>
	</tr>
	<tr>
		<td>Where do hosts expect to find listing content, compared with pricing, availability and policies?</td>
		<td>The property menu: Shared first, then one group per channel</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d">Tree test</mention-page></td>
	</tr>
	<tr>
		<td>Which fields can Hostaway read and write on each channel, and how fast does a write go live?</td>
		<td>Which fields are customisable or set by the channel; what a receipt can promise</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Market & channel scan</mention-page></td>
	</tr>
	<tr>
		<td>Which performance signals exist per channel (views, conversion, occupancy, price), at what delay?</td>
		<td>What a tip can cite, and what Performance can measure</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12">Data review</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page></td>
	</tr>
	<tr>
		<td>Can Hostaway build a reliable set of similar homes per channel, and from which data?</td>
		<td>Whether "similar homes" can be a reason in a tip</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af16458150add8ef7c753dbd12">Data review</mention-page>, <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page></td>
	</tr>
	<tr>
		<td>Who owns listing quality, and who is accountable when AI copy misstates an amenity or a rule?</td>
		<td>What a strategy's guardrails hold, and what Autopilot may never change</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page> (Head of Product, Legal)</td>
	</tr>
	<tr>
		<td>Which teams read property data today, and who has to agree to one record?</td>
		<td>Whether the Listing base and Knowledge Hub can be one shared layer</td>
		<td><mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page> (AI/ML lead, Head of Product)</td>
	</tr>
</table>
## The thesis, and what it rests on
The design rests on one thesis, in three parts:
- **Facts once.** Every fact about the home lives once, in Shared, and each channel inherits it.
- **Voice per channel.** What guests read can differ per channel, but money and stay rules vary far more than words, so a channel's own voice is a choice, not a default.
- **Host in the loop.** AI proposes and the host decides. Each suggestion shows why, where it goes and how to undo it.

Each hypothesis tests one of these parts, or the business case behind them. Importance is how much of the design falls if the hypothesis is wrong (1–5). Evidence is how much is already known (1–5). Risk = importance × (6 − evidence). Ties go to higher importance, then to decisions that are hard to undo. One person scored them, so the scores are too. The plan re-scores them with the PM, Integrations and CS leads.

## Which assumptions matter most
**The five riskiest**, in rank order:
- **1 · H-09 · Hosts accept an AI suggestion when it shows why, where it goes and how to undo it.** Risk 25. Tested by showing tips with and without their why in the user interviews, and by accept and dismiss rates in the test plan. Shaped each tip carrying its why and sources (<mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>).
- **2 · H-04 · Per-channel copy is wanted by some hosts, not all.** Risk 20, importance 5. Tested in interviews across the four host types, and in Edit per channel usage. Shaped customising as a choice per field, and tips that cover money and stay rules (<mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page>).
- **3 · H-15 · Hosts expect Autopilot never to change facts** (safety, accessibility, fees, rules) without approval. Risk 20. Tested by a probe in the user interviews and an Autopilot task in the test plan. Shaped Autopilot as on or off, with suggestions always arriving as tips (<mention-page url="https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033">KD-08</mention-page>).
- **4 · H-20 · On Booking⁠.com, hosts accept that their voice is the facts Booking⁠.com writes from.** Risk 20. Tested with SEO optimisers in user interviews and against the channel constraints. Shaped Booking⁠.com's description as read-only (<mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>).
- **5 · H-17 · Hosts read the Knowledge Hub as "everything true about my home".** Risk 20. Tested in tree testing. Shaped the Hub sitting in Shared, with its facts cited in tips (<mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>).

H-10 (channel copy lifts booking conversion) is also risk 20, at importance 4. It ranks sixth, below H-17, because H-17 can be tested in the tree test before anything is built, and H-10 can only be measured after launch.

All seventeen are in the table below, ranked.

![All 20 hypotheses on the assumptions map (research/charts/assumptions-map.png). Provenance: .](../../research/charts/assumptions-map.png)

| Rank | ID | Hypothesis | Thesis part | Importance | Evidence | Risk | How I'd test it |
|---|---|---|---|---|---|---|---|
| 1 | H-09 | Hosts accept AI suggestions that show why, where and how to undo | Host in the loop | 5 | 1 | 25 | User interviews (tips with and without their why); test plan (accept rates) |
| 2 | H-04 | Per-channel copy is wanted by some hosts, not all | Voice per channel | 5 | 2 | 20 | User interviews across the four types; product analytics (Edit per channel) |
| 3 | H-15 | Autopilot never changes facts without approval | Host in the loop | 4 | 1 | 20 | User interviews (probe); test plan (Autopilot task) |
| 4 | H-20 | On Booking.com, voice is the facts Booking.com writes from | Voice per channel | 4 | 1 | 20 | User interviews (SEO optimisers); channel constraints |
| 5 | H-17 | Hosts read the Knowledge Hub as "everything true about my home" | Facts once | 4 | 1 | 20 | Tree testing |
| 6 | H-10 | Channel-specific copy lifts booking conversion, measurable per channel | Voice per channel | 4 | 1 | 20 | Product analytics; stakeholder interviews; pilot after launch |
| 7 | H-06 | Direct edits on a channel can be detected per field within an hour | Facts once | 4 | 2 | 16 | Stakeholder interviews; channel constraints |
| 8 | H-08 | Listing and sync issues are a top-three cause of support tickets | Business case | 4 | 2 | 16 | Support ticket review |
| 9 | H-11 | Portfolio managers accept "apply to all, with exceptions" | Facts once | 4 | 2 | 16 | User interviews; support ticket review |
| 10 | H-13 | New-to-PMS hosts resist Hostaway editing their listing content | Host in the loop | 4 | 2 | 16 | User interviews |
| 11 | H-14 | AI copy is allowed by channel terms and law without disclosure | Voice per channel | 4 | 2 | 16 | Stakeholder interviews; channel constraints |
| 12 | H-05 | Titles, descriptions and photos can be written back to channels. Refuted for Booking.com text | Voice per channel | 5 | 3 | 15 | Channel constraints |
| 13 | H-03 | Hosts think of "my home", not "my listings" | Facts once | 4 | 3 | 12 | User interviews |
| 14 | H-19 | Details and the Knowledge Hub drift apart on most properties | Facts once | 4 | 3 | 12 | Product analytics; user interviews |
| 15 | H-12 | The onboarding questionnaire sets a sensible persona and autonomy default | Host in the loop | 3 | 2 | 12 | Product analytics; user interviews |
| 16 | H-16 | One canonical facts list maps to each channel with under 5% unmappable | Facts once | 3 | 2 | 12 | Stakeholder interviews; channel constraints |
| 17 | H-18 | Listing and sync reliability decides deals for 25+ property accounts | Business case | 3 | 2 | 12 | Gong call analysis; CRM review |

<callout icon="✖️" color="red_bg">
	**Refuted before research: "Booking.com accepts Hostaway's description."** The first plan assumed Hostaway could write titles, descriptions and photos to both Airbnb and Booking.com. Booking.com's own partner help says it generates the property description from the property's facts, and hosts can only request a fix ([partner.booking.com](https://partner.booking.com/en-us/help/property-page/general-info/changing-your-property-description-or-room-details)). Hostaway's help centre says it can't sync text fields such as Summary to Booking.com ([help.hostaway.com](https://help.hostaway.com/en/articles/6141381-properties-details-page)). So the assumption became a constraint: in Smart Listings, Booking.com's description is set by the channel and read-only, and a host shapes it through facts, photos and amenities. <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
	What's still open: whether hosts accept that their "voice" on Booking.com is their facts. Untested.
</callout>
## Left out: the import assumptions
Three hypotheses belong to Angle A, first-time setup, and are out of scope: H-01 (hosts review an import before Hostaway takes over), H-02 (fear of losing data blocks the switch) and H-07 (setup trouble drives churn). They move with import to the <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>.
## How it was made
Questions were written across five lenses (user, business, platform, data, organisation), each naming the decision it unblocks. The thesis was broken into 20 hypotheses, each with what would disprove it, then scored. Grounded in <mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page> and <mention-page url="https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9">Desk research</mention-page>; the platform questions go to <mention-page url="https://app.notion.com/p/3eee18af1645814eb37ee21fc7bf4eb5">Stakeholder interviews</mention-page>.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3">02 · Research</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
