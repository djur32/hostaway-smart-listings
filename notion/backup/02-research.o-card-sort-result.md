<page url="https://app.notion.com/p/3eee18af1645817e8eb5cc92bbfc76a3" icon="🧪">
<ancestor-path>
<parent-page url="https://app.notion.com/p/bfd6dc1a8a8b4021931c2c7890e919ac" title=""/>
<ancestor-2-page url="https://app.notion.com/p/6c96fc367cbc41dd8aacd24da3495ff0" title=""/>
<ancestor-3-page url="https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3" title="02 · Research"/>
<ancestor-4-page url="https://app.notion.com/p/bc472ebb7d814b5db36bc43950354489" title=""/>
<ancestor-5-page url="https://app.notion.com/p/a5452410536841f0868e6a65d7f42dff" title=""/>
<ancestor-6-page url="https://app.notion.com/p/3eee18af164581ada1e4ebc3d3838613" title="Hospitable · Smart Listings"/>
</ancestor-path>
<properties>
{"title":"Card sorting results"}
</properties>
<iconMetadata>{"type":"emoji","emoji":"🧪"}</iconMetadata>
<content>
<callout icon="🧪" color="gray_bg">
	**Output · Illustrative · simulated** · What an open card sort of 40 cards by 15 hosts would show. The sorts are simulated; the analysis on them is real (co-occurrence, average-linkage clustering cut at the largest gap). Not evidence about Hospitable's hosts.
</callout>
![The tree of how the 15 simulated hosts grouped 40 cards, cut into six piles. SIMULATED sorts · real analysis.](https://prod-files-secure.s3.us-west-2.amazonaws.com/8b3ff55d-72c7-4307-9089-beb3df02707e/ee02363e-aa07-4ea8-a3d2-bef2b263a409/r-dendrogram.png)
## The short version
- **Hosts group by kind, not by channel.** Six piles: arrival and stay info, status and admin, the home, rules and booking, money, and the new tools. Only 1 of 15 made a channel group, and the Airbnb-only short-stay fee sat with the ordinary cleaning fee 93% of the time.
- **AI and performance form an unsure pile of their own.** Similar homes, the history of changes and "how each change affected bookings" clustered together, mostly labelled "Not sure", with the lowest agreement (53%). Suggestions to improve the copy went with the copy.
- **"What the assistant knows" sits with arrival info.** 73% of participants filed it with Wi-Fi, check-in and trash instructions; it almost never paired with the home's facts (3%). Hosts read it as what you tell guests, not what is true about the home.
- **Copy joins the home before anything else.** Title, description and photos sit inside "the home". Family and new hosts keep them there; optimisers and portfolio managers split them out.
## Read it with this in mind
- **The sort is simulated.** A script produced the 15 sorts from persona rules taken from the simulated interviews, so the persona split partly restates those interviews. Even the one channel group was written in as a participant quirk.
- **The fit is circular.** An IA drawn from these clusters will fit them well by construction. The fit is reported for transparency, not as validation. The independent check is a tree test with real hosts.
- The findings the script did not encode, such as where the assistant card lands and which cards float, are the more informative ones. They are still simulated.
## What it means for the IA
The clusters feed <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/>. The prototype's menu is channel-first (Shared, then one group per channel), which the sort doesn't contradict: inside Shared and inside each channel, pages are grouped by kind (Listing, Pricing, Availability, Booking policies), and the channel is only where a difference is made. Smart Listings gets a place of its own (Strategy, Performance) while its tips appear in context, on the channel's pages.
## How it was made
Planned in <mention-page url="https://app.notion.com/p/3eee18af1645812ea1ebe5dec041599a"/>; 15 simulated sorts, labels standardised by two coders (75% agreement), clustering checked with and without the four forward-looking cards (same result).
---
**Builds on** <mention-page url="https://app.notion.com/p/3eee18af1645812ea1ebe5dec041599a"/> · <mention-page url="https://app.notion.com/p/3eee18af164581cda068f2d204abbe37"/>
**Feeds** <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9"/> · <mention-page url="https://app.notion.com/p/3eee18af16458180a645fc510d470034"/> · <mention-page url="https://app.notion.com/p/3eee18af1645814595defdaab694e87d"/>
**Decisions** <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde"/> · <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c"/>
**In the prototype** <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce"/> · [open the prototype](https://hospitable-case-djur32.vercel.app)
Files: `research/data/card-sort/categories.md` · `research/data/GROUNDING.md` · chart `research/charts/dendrogram.svg` {color="gray"}
</content>
</page>
