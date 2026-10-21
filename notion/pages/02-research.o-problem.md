<callout icon="✅" color="gray_bg">
	**Output · Sampled · simulated** · The diagnosis, rewritten for Smart Listings. The product facts are real (); what hosts vary and how they treat AI comes from simulated research ().
</callout>
## The problem
> Hosts keep the real version of their listing outside Hostaway and check each channel by hand, because the Knowledge Hub repeats the listing in its own copy, which the assistant answers guests from, and the product scatters "different per channel" across about 15 fields, while what hosts actually vary per channel is money and stay rules. And there is no safe way to tune each channel: the only listing AI today is Airbnb's Opportunities, and a suggestion that explains itself gets accepted without being checked.
## Root causes
1. **The Knowledge Hub repeats the listing in its own copy, and learns nothing from guests' questions.** It is generated from Details and past messages, later edits don't reach it, and the assistant answers guests from that copy, not from the listing. The questions guests ask stay in the Inbox. 2. **"Per channel" is built field by field, around copy.** Customising a value for one channel happens one field at a time, while hosts vary fees and minimum stays far more than text. 3. **No screen shows one listing on one channel, and Save doesn't say where a change went.** Hosts can't see what a guest sees, or whether an edit arrived. 4. **AI that persuades instead of being safe by construction.** An explanation raises acceptance without raising scrutiny, so a warning can't be the safety device. ## How might we…
<table header-row="true">
	<tr>
		<td>How might we…</td>
		<td>Root cause</td>
		<td>Signal</td>
	</tr>
	<tr>
		<td>…keep one record of the home that every channel and the assistant read?</td>
		<td>1</td>
		<td>Strong</td>
	</tr>
	<tr>
		<td>…give money and stay rules one clear per-channel pattern?</td>
		<td>2</td>
		<td>Strong</td>
	</tr>
	<tr>
		<td>…offer a channel's own voice as a choice: authored for the optimiser, one adapted text for portfolios, off for hosts who see copy as a fact?</td>
		<td>2</td>
		<td>Moderate</td>
	</tr>
	<tr>
		<td>…turn Booking.com's self-written description into something hosts steer through their facts?</td>
		<td>2</td>
		<td>Strong</td>
	</tr>
	<tr>
		<td>…make where a change goes the first thing every tip and every edit says?</td>
		<td>3, 4</td>
		<td>Moderate</td>
	</tr>
	<tr>
		<td>…let the AI write only what the record can back, and turn every unknown into a question the host answers once?</td>
		<td>4</td>
		<td>Strong</td>
	</tr>
</table>
## → Became the design principles
The questions became the principles in <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page>:
- **The home, once** answers the first.
- **Money and rules vary per channel; voice is a choice** answers the second, third and fourth.
- **Say where, and whether it arrived** answers the fifth.
- **The AI says only what the home can back** answers the sixth.
## How it was made
Root causes drawn from <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page> and the product audit in <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>; questions ranked by impact and by the signal of the insights behind them.
---
**Builds on**
- <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458111b95ee068296d5bd7">Jobs to be done</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>
**Feeds**
- <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page>
**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef">KD-11</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0">KD-12</mention-page>
**In the prototype**
- <mention-page url="https://app.notion.com/p/3eee18af164581828521eb27e3e50737">Solution overview</mention-page>
- [open the prototype]()
