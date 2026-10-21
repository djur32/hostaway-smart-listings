<callout icon="✅" color="gray_bg">
	**Output · Done** · A concept: the structure is built and clickable, the AI behind it is simulated. The Knowledge Hub's new job: it learns from the questions guests ask. It reads the listing details from the Listing base and keeps no copy, adds the situations behind them, answers only from what backs an answer, and turns gaps into tips. The Hub is a concept, not built in full. It shows how the Hub can feed the recommendations: it adds the situations behind the listing details and collects guests' questions, and those inform content in the Listing base or in a channel's listing, such as the description, which tips rely on to improve it. Every Hub page in the prototype carries a "Concept" chip. Provenance: the nine topics are Hostaway's own (). Questions, counts and insights are demo data, .
</callout>
![Knowledge Hub › Questions in the live prototype: what guests ask in the Inbox, as Hostaway's nine topics. Each card shows its question count and a yellow chip where some still need an answer, and opens the topic. A concept. Questions and counts are demo data, .](file-upload://3efe18af-1645-81d3-9e75-00b267da3aef)
## The short version
- **Today the Hub repeats the listing and has no job of its own.** It keeps its own copy, generated from Details and past messages. Later edits don't reach it, and "Ask the AI" answers from that copy. Meanwhile nobody sees what guests ask.
- **The new job: the Hub learns from guests' questions.** It has four tabs, in this order: **Insights · Questions · Facts (listing details from the Listing base, plus the host's own situations) · Sources**.
- **Facts are read, not copied.** Amenities, rules, check-in and Wi-Fi live once, in the Listing base. The Hub shows them by reference and never keeps a second version. What the Hub adds is what they don't say: the situations behind a rule, and what the host does in each one.
- **Answers stay faithful.** The assistant answers guests only from listing details and from Facts the host wrote or confirmed. When nothing backs an answer, it says so and asks the host. It never guesses.
- **Gaps become tips.** A frequent or unanswered question becomes a tip on the same contract as every other tip. The host's answer is saved where it belongs: a listing detail in the Listing base, so every channel and the assistant use it, a better answer in one channel's listing, such as its description, or a situation in the Hub. <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page>
## Why it changes
How the Hub works today, for any host (<mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>):
1. **It keeps its own copy of the listing.** It is generated on request from Details and past messages, and later edits to Details don't reach it. So the copy drifts by design ([help centre](https://help.hostaway.com/en/articles/9716792-property-knowledge-hub-page)).
2. **It repeats the listing.** It restates amenities, rules and check-in as its own sentences, beside the fields that already hold them. On a trial listing, Details says "Washer" where the Hub says "Washing machine" ().
3. **"Ask the AI" answers from that copy, not from the listing.** On a trial listing it told a guest "Yes, the apartment is wheelchair accessible", with no amenity saying so ().
4. **No one sees what guests ask.** Guest questions live in the Inbox, and nothing turns them into knowledge or into improvements to the listing (<mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page>).
## The loop
![Flow 5 · From a guest question to a better listing: a guest asks in the Inbox, the question lands in the Hub, and the assistant answers the guest only when a fact in the Listing base backs it. Otherwise it says so and asks the host, and the gap becomes a tip: a shared fact for the Listing base, or a better answer in one channel's listing such as Airbnb's description. Accepted, a fact reaches every channel and the assistant. A concept, not built in full. Questions and counts are demo data, .](file-upload://3efe18af-1645-812c-a262-00b2e55386a1)
## Four sections
<table header-row="true">
	<tr>
		<td>Section</td>
		<td>What it does</td>
		<td>In the prototype</td>
	</tr>
	<tr>
		<td>**Insights**</td>
		<td>What guests ask most, what's new this month, and what one channel's guests ask more than another's, each linked to its question and, where there is one, its tip. It has no Tips button</td>
		<td>[Insights]()</td>
	</tr>
	<tr>
		<td>**Questions**</td>
		<td>Every guest question from the Inbox, as a grid of Hostaway's nine topics. Each card shows the topic's question count and, where some are open, a yellow "needs an answer" chip. A card opens the topic's full view, with All, Needs an answer and Answered tabs. A question page shows how the AI answers, what it read (a reference to the Listing base field) and the conversations behind it</td>
		<td>[Questions]() · [Is there free parking?]()</td>
	</tr>
	<tr>
		<td>**Facts**</td>
		<td>What the AI reads to answer guests, by topic. Each listing detail is a reference to where it lives ("Listing base · Location"), never a second copy and never edited here. Situations the host writes, and answers the host confirmed, are marked as the host's</td>
		<td>[Facts]()</td>
	</tr>
	<tr>
		<td>**Sources**</td>
		<td>Where the Hub learns from: the Listing base (read), Inbox conversations (questions and answers), the host (confirmed answers), and documents such as a guidebook</td>
		<td>[Sources](). Adding a document is a preview</td>
	</tr>
</table>
Questions and Facts share one layout: a topic card grid, and a topic's full view when a card is opened. The heading count is the sum of the cards. **Test**, Tips and the primary action (Add question, Add a fact) sit on the description line, never in the tab row. On phones, Test and the Add button are full width. Test previews "Ask the AI" with the same rule: an answer quotes the facts it used, or says nothing backs it.
## A gap becomes a tip
<columns>
	<column>
		![The question page for "Is there free parking?": the AI says what the Listing base backs and asks the host about the rest. The tip beside it, "Say where guests can park during the day", says where it goes and why. A concept. Demo data, .](file-upload://3efe18af-1645-811e-b6a5-00b225670f4a)
	</column>
	<column>
		![After Accept: the question reads Answered, the answer comes from Listing base · Location › Getting around, and a receipt says it was sent to Airbnb, Booking⁠.com and Direct, with Undo. A concept. Demo data, .](file-upload://3efe18af-1645-8116-8740-00b2eab389a9)
	</column>
</columns>
- The tip uses the **same contract as every tip**: the field, the change, why, its sources, Accept or Dismiss, then a receipt and Undo. Its why is the questions behind it.
- **Where it goes, two destinations:** a shared fact goes to the Listing base ("Add free parking"), so every channel and the assistant use it. A better answer for one channel goes to that channel's listing, for example Airbnb's description saying what its guests keep asking. When most asks come from one channel, the tip offers that channel's listing.
- So tips also live in the Hub. It is the first step in bringing tips to areas beyond the channel pages (<mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>).
## Insights
![Knowledge Hub › Insights: questions asked, new this month, answered by the AI and still needing an answer, questions over time, what guests ask most, new this month, and how each channel's guests differ. A concept. Every number is demo data, .](file-upload://3efe18af-1645-815d-aca3-00b207c49496)
Insights is how Hostaway learns from guests. Every number on it is demo data in the prototype. With real Inbox data, the measure would be fewer questions left open .
## How it feeds Smart Listings
Tips on the channel pages can cite a fact from the Listing base or a guest question as their why. A question page lists the open tips that use its facts. The Hub grounds the assistant's tips with the same facts that back its answers to guests, so what guests are told and what the host is advised agree. See <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page> · <mention-page url="https://app.notion.com/p/3efe18af164581ceabafdfe5275589dd">KD-20</mention-page>.
## Where it goes next
**Planned, not built** :
- **Real Inbox questions.** Count questions from real conversations, answer only from the Listing base, and turn gaps into tips. Worked if fewer questions are left open.
- **Documents read in as candidate answers** the host confirms, never trusted unseen.
- **Workflow-aware facts.** Each fact knows which messages, tasks and workflows use it, so a change shows what else changes before Save.
How I'd run each, who is involved and the measure: <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>.
## How it was made
Built in the prototype over several iterations: a matrix, a single document, question-first, overview cards, a channel lens, then Content · Workflows · Sources with facts added by describing them. In design review I gave the Hub its own job: guests' questions, with listing details read from the Listing base. The earlier iterations stay reachable by URL only. The topic list was copied from Hostaway's own Knowledge Hub (<mention-page url="https://app.notion.com/p/3eee18af16458140b622c2f52f500edf">Product audit</mention-page>).
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page>
- <mention-page url="https://app.notion.com/p/3efe18af164581ea8da9ebb89ab9b22f">Where it falls short</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
**Decision record for the tabs and layout**
- [D-206 tab order, topic card grids, actions on the description line](https://app.notion.com/p/3f0e18af1645815d914af75aae58335a)
**In the prototype**
- [Questions]()
- [A question and its tip]()
- [Insights]()
- [Facts]()
- [Sources]()
