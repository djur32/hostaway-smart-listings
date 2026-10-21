<callout icon="✅" color="gray_bg">
	**Output · Done** · The five key flows of Smart Listings, as the working prototype runs them. Each was checked by clicking through the live site or reading its code. Provenance: prototype behaviour. The sample content in it is `SIMULATED`. Flow 5, the Knowledge Hub, is a concept.
</callout>
## The short version
- **Turn on:** one toggle on the Overview, then a full-screen wizard. Tips appear on each channel's pages.
- **Work through tips:** one docked panel, one tip at a time. Accept sends the change, and Undo takes it back.
- **One field, one channel:** a field uses the Base until you customise it for a channel, and switching back never loses work. Two cases have no switch: a field only one channel has, and a field the channel sets.
- **Did it work:** Performance compares each channel with the same stretch before its strategy. Strategy is where you edit or replace it.
- **From a guest question to a better listing:** a concept, not built in full. A guest question lands in the Knowledge Hub, and Copilot answers guests only from listing details and from Facts the host wrote or confirmed. A gap becomes a tip, either a shared fact for the Listing base that every channel uses, or a better answer in one channel's listing.
## 1 · Turn on Smart Listings
![Flow 1 · Turn on Smart Listings. Prototype behaviour. Sample content SIMULATED.](file-upload://3efe18af-1645-811c-963f-00b22952bdec)
**Why this shape:** Smart Listings is opt-in because not every host wants it, and the wizard copies Hospitable's own Add-property flow, which hosts already know. Closing the wizard with answers in it asks "Discard this strategy?" and nothing changes on the listings. <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600">KD-05</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48">KD-06</mention-page>
## 2 · Work through tips on an Airbnb listing
![Flow 2 · Work through tips on an Airbnb listing. Prototype behaviour. Sample content SIMULATED.](file-upload://3efe18af-1645-81d5-8cdb-00b291be4988)
**Why this shape:** one panel and one tip at a time keep the decision next to the field it changes, with its reason in view, and nothing changes until the host accepts. Undo withdraws the change it sent. <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a">KD-15</mention-page>
## 3 · Customise one field for one channel, or use the Base
![Flow 3 · One field on a channel, in four cases: it uses the Base, is custom for that channel, exists only on that channel, or is set by the channel. Prototype behaviour. Sample content SIMULATED.](file-upload://3efe18af-1645-81c4-b93f-00b2f881c8d1)
**Why this shape:** a fact lives once and a channel holds only what differs. "Use the Base" keeps the custom text, so "Customize" brings it back. The other two cases have no switch: Airbnb's check-in method exists only on Airbnb and says "Airbnb only", and Booking⁠.com's summary is set by Booking⁠.com, so it shows "Booking⁠.com only" with a lock whose tooltip says why. Hovering the caption shows the value behind the field on each channel. <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84">KD-04</mention-page>
## 4 · Check Performance, then edit or replace a strategy
![Flow 4 · Check Performance, then edit or replace a strategy. Prototype behaviour. Sample figures SIMULATED.](file-upload://3efe18af-1645-8170-8d63-00b211c26da2)
**Why this shape:** there are no versions to learn. One built-in baseline answers "did this strategy work?", and every change to a strategy goes through the same wizard. <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48">KD-06</mention-page>
## 5 · From a guest question to a better listing
![Flow 5 · From a guest question to a better listing. A concept, not built in full: a gap becomes a tip for the Listing base or for one channel's listing. Questions and counts are demo data, SIMULATED.](file-upload://3efe18af-1645-814c-ba19-00b23ceb9aa8)
**Why this shape:** this flow is a concept, not built in full. It shows how the Knowledge Hub can feed the tips: the Hub reads facts from the Listing base and collects guests' questions, and those inform what the Listing base or a channel's listing should say. The Knowledge Hub's job is guests' questions. A question from the Inbox lands in the Hub, counted and marked answered or not. Copilot answers guests only from listing details and from Facts the host wrote or confirmed. When nothing backs an answer, it says so and asks the host, and the gap becomes a tip on the same contract as every tip. The tip goes to one of two places. A shared fact, such as "Add free parking", goes to the Listing base, so every channel and Copilot use it. A better answer for one channel, such as Airbnb's description saying where guests park, goes to that channel's listing. In the prototype the questions, counts and tips are scripted demo data. <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814fa326e55e940a5942">KD-13</mention-page>
## How it was made
Each flow was walked in the live prototype, or read from its code where a state is hard to reach by clicking. Flow 5 follows "Is there free parking?" in Knowledge Hub › Questions, from the question to its accepted tip and receipt.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce">Sitemap</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page> (the tasks a host test would run)
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600">KD-05</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48">KD-06</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844">KD-07</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2">KD-09</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a">KD-15</mention-page>
**In the prototype**
- [Overview](https://hospitable-case-web.digimal.studio/property/neukolln/overview)
- [Airbnb listing](https://hospitable-case-web.digimal.studio/property/neukolln/ch/airbnb/listing/essentials?smart=on&autopilot=0)
- [Performance](https://hospitable-case-web.digimal.studio/property/neukolln/smart/performance?smart=on)
- [Knowledge Hub › Questions](https://hospitable-case-web.digimal.studio/property/neukolln/hub/questions/ar-parking?smart=on)
