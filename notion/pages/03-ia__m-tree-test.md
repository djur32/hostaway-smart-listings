<callout icon="🔭" color="gray_bg">
	**Method · Planned** · Not run. This is how I would tree-test the channel-first menu with hosts.
</callout>
## Why this method
The menu was chosen in design review, not by hosts. A tree test isolates structure from screens: can a host find the right place from the labels alone? It is cheap, unmoderated and comparable across trees.
## How I'd run it
<table header-row="false" header-column="true">
	<tr>
		<td>Trees</td>
		<td>Three, between-subjects: today's property menu, the record-first IA, and the channel-first menu as built</td>
	</tr>
	<tr>
		<td>Who</td>
		<td>30 hosts per tree (90 in all), short-term rental hosts who use a PMS, screened to cover the four host types</td>
	</tr>
	<tr>
		<td>Tool</td>
		<td>Optimal Workshop Treejack, or an equivalent unmoderated tree-test tool</td>
	</tr>
	<tr>
		<td>Tasks</td>
		<td>The 10 below, in random order, the same on every tree</td>
	</tr>
	<tr>
		<td>Measures</td>
		<td>Success, directness (reached without backtracking), time per task, first click</td>
	</tr>
	<tr>
		<td>Pass bar</td>
		<td>Channel-first success no more than 5 points below the record-first tree overall, and at least 70% on the channel-specific tasks (1, 4, 10). Directness and time are reported per task; no bar is set for them yet.</td>
	</tr>
	<tr>
		<td>First-click variant</td>
		<td>40 hosts, four screens: property Overview, Listing base › Details, Airbnb › Listing, Smart Listings › Strategy. Is the first click on the right element?</td>
	</tr>
	<tr>
		<td>Incentive</td>
		<td>€20 per unmoderated session `ASSUMPTION`</td>
	</tr>
</table>
## The tasks
<table header-row="true">
	<tr>
		<td>#</td>
		<td>Task, as read to the host</td>
		<td>Correct place in the channel-first menu</td>
	</tr>
	<tr>
		<td>1</td>
		<td>Booking.com guests should pay a €35 cleaning fee. Airbnb stays at €25.</td>
		<td>Channels › Booking.com › Pricing</td>
	</tr>
	<tr>
		<td>2</td>
		<td>Your check-in time is wrong. Make it 4 PM everywhere.</td>
		<td>Shared › Listing base › Details</td>
	</tr>
	<tr>
		<td>3</td>
		<td>Update the Wi-Fi password guests receive.</td>
		<td>Shared › Listing base › Details (Knowledge Hub › Facts also counts)</td>
	</tr>
	<tr>
		<td>4</td>
		<td>Make the minimum stay longer on Airbnb than on Booking.com.</td>
		<td>Channels › Airbnb › Availability</td>
	</tr>
	<tr>
		<td>5</td>
		<td>You want to change your Booking.com description.</td>
		<td>Channels › Booking.com › Listing (set by Booking.com)</td>
	</tr>
	<tr>
		<td>6</td>
		<td>Where would you see whether your Airbnb strategy worked?</td>
		<td>Shared › Smart Listings › Performance</td>
	</tr>
	<tr>
		<td>7</td>
		<td>Where would you pause Autopilot on Airbnb?</td>
		<td>Shared › Smart Listings › Strategy</td>
	</tr>
	<tr>
		<td>8</td>
		<td>Change who your Airbnb strategy is trying to attract.</td>
		<td>Shared › Smart Listings › Strategy</td>
	</tr>
	<tr>
		<td>9</td>
		<td>Check next week's nights and prices for this property.</td>
		<td>Shared › Calendar</td>
	</tr>
	<tr>
		<td>10</td>
		<td>Make cancellation stricter on Airbnb only.</td>
		<td>Channels › Airbnb › Booking policies</td>
	</tr>
</table>
Tasks 1, 2, 5 and 9 adapt the task set shared by every study in the test plan, tasks 3 and 4 test a fact guests ask about and a stay rule on one channel, and task 7 is the question the navigation review left open. The first-click screens were adapted to the build: the plan named a Review & push screen, which became Save with receipts.
## What I'd look for
- **Do shared facts get edited in Shared?** A host who opens Airbnb for task 2 is the risk channel-first carries: shared facts edited inside one channel.
- **Do hosts expect money and stay rules under the channel?** Tasks 1, 4 and 10 test the axis the model rests on.
- **Is Smart Listings findable inside Shared?** Tasks 6–8 test a placement nobody has validated.
- Read with <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>.
## What would make me change the menu
- **Channel-first below the pass bar overall:** rework labels and grouping before the usability rounds.
- **It loses mainly on tasks 2 and 3:** keep the structure and rework Shared's labels; whether "Listing base" is the right name comes back.
- **It loses mainly on tasks 6–8:** move Smart Listings out of Shared and test it beside the channels.
- **First clicks for task 2 land on a channel:** the "All channels" label isn't doing its job, so a shared field needs a stronger signal on channel pages.
## What it produces
- A results page under this section (success, directness and first clicks per task and tree).
- A go or rework call on <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce">Sitemap</mention-page>.
- It runs alongside the benchmark of today's product in <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page>.

**Decisions**
- <mention-page url="https://app.notion.com/p/3eee18af164581f59e84e075de884cde">KD-03</mention-page>
- <mention-page url="https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c">KD-18</mention-page>
