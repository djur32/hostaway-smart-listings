<callout icon="✅" color="gray_bg">
	**Output · Done** · The 26 findings on the listing-management screens Smart Listings redesigns, each with the heuristic it breaks and what the design does about it. Provenance: ; severities are (one evaluator).
</callout>
## The short version
- The worst problems are structural: a Knowledge Hub that repeats the listing in a copy that drifts, no view of one listing on one channel, and an AI that tells guests things the listing doesn't say.
- Per-channel control exists, but in seven forms, and its label never says which channels.
- Changes of ownership happen silently, and saving says nothing about what reached each channel.
- The Calendar takes the host out of the property.
## Method
One evaluator walked the listing-management screens (the supplied screenshots plus the read-only trial pass) against Nielsen's 10 heuristics and six for listings: source-of-truth clarity, sync-direction visibility, per-channel awareness, reversibility, AI transparency and bulk. Severity uses Nielsen's 0–4 scale, where 4 means wrong information reaches guests, money is lost, or the job is blocked. With one evaluator the severities are . 26 findings: 14 main ones (some rows combine two) and 12 smaller ones.
## Main findings (14, in 11 rows)
| Finding | Heuristic | Where | Sev | What the design does about it |
|---|---|---|---|---|
| **The Knowledge Hub repeats the listing in its own copy.** It is generated from Details and past messages and never told when Details changes, so the copy drifts by design. On a trial listing the same facts read differently in each. | L1 Source-of-truth clarity · L5 AI transparency | Details › Rules vs Knowledge Hub · HS-28, HS-44 | 4 | Listing details live once, in the Listing base. The Knowledge Hub reads them, keeps no copy, and adds the situations behind them. → Listing base & channels · Knowledge Hub |
| **The AI states what the listing doesn't.** Ask the AI tells a guest the flat is wheelchair accessible; no amenity says so, and the answer shows no source. | L5 AI transparency | Knowledge Hub › Ask the AI · HS-43, trial pass | 4 | the assistant answers guests only from listing details and from Facts the host wrote or confirmed. When nothing backs an answer, it says so and asks the host. Every tip shows what it rests on. → Tips & AI rewrite |
| **No view of one listing on one channel.** To see what Airbnb shows, the host checks about 15 fields across five tabs. | L3 Per-channel awareness | All property tabs · HS-21 to HS-39 | 4 | Each channel has its own Listing, Pricing, Availability and Booking policies pages, and Canvas shows that channel's guest page. → Canvas preview |
| **Ownership flips silently on the first edit.** Editing the base price "will overwrite the price on Airbnb", said once in a paragraph. Photos get a one-time banner. Other fields say nothing. | L2 Sync-direction visibility · L4 Reversibility | Pricing › Base price · HS-30; photo manager, trial pass | 4 | Every field states whose value it is: uses the Base, customised for the channel, only on that channel, or set by the channel. → KD-04 |
| **Seven patterns for one idea.** "Different on this channel" appears as a label plus link, a label alone, "All channels", a one-channel field, a row per listing, a grid and a page. The label says how many channels, not which. | N4 Consistency and standards · L3 Per-channel awareness | Details, Pricing, Availability, Booking policies · HS-26, HS-33, HS-35, HS-39, HS-47 | 3 | One rule on every field, and hovering a field's label shows the Base value next to each channel's own. → Listing base & channels |
| **Looking creates overrides.** Opening Edit per channel marks the form as changed with no edit made; a host who looks and then saves has split the field. | L2 Sync-direction visibility · L4 Reversibility | Details › Essentials · trial pass | 3 | On a channel page a Base value is shown read-only. Customising is an explicit "Customize for Airbnb", undone with "Use the Base". → Listing base & channels |
| **Save says nothing about the channels.** No "sent to Airbnb", no last-synced time, no per-channel error, no history and no undo. | N1 Visibility of system status · L2 Sync-direction visibility · L4 Reversibility | Discard / Save on every tab · HS-28, HS-33 | 3 | Save is the commit; each saved change goes out with a receipt, and an accepted tip can be undone. → KD-15 · UI changes |
| **Publishing has no preview.** "Publish listing" is the one option in the Overview status menu; nothing shows what guests will see. | L4 Reversibility | Overview › status · trial pass | 3 | Canvas renders each channel's guest page from the same data, and tapping a part opens its field. → Canvas preview |
| **The Calendar leaves the property.** The menu's Calendar opens the global Calendar; the property menu disappears and there's no way back. | N3 User control and freedom | Calendar · HS-32 | 3 | Calendar stays inside the property, under Shared. → UI changes |
| **Per-channel money has two editors that disagree.** Pricing and the Calendar side panel both edit fees and deposits, and list different channels. | L3 Per-channel awareness · N4 Consistency and standards | Pricing › Security deposits vs Calendar panel · HS-35, HS-32 | 2 | The Base price lives in Listing base › Pricing; what a channel does differently lives on that channel's Pricing page. → Listing base & channels |
| **Recommendations are Airbnb's alone.** Review opportunities opens Airbnb's own list, behind a link, and it was empty for this listing. Nothing covers Booking.com or Direct. | L3 Per-channel awareness | Overview · HS-21, trial pass | Not rated | Smart Listings gives every channel tips on its own pages, on money and stay rules as well as copy. → Strategy & performance |

"Not rated": seen on the trial account and never given a severity.
## Smaller findings (12)
Severity 1–2: consistency, labels and copy on the same screens.
| Finding | Heuristic | Where | Sev | What the design does about it |
|---|---|---|---|---|
| **Address fields are disabled with no reason.** Country, City and State are greyed out. | L2 Sync-direction visibility | Details › Location · HS-24 | 2 | Fixed: a lock with a reason ("set when the listing is created"); the pin stays editable. |
| **Channels aren't one kind of thing.** Direct has its own menu item; Airbnb's settings are spread across every tab. | N4 Consistency and standards | Property menu · HS-47, HS-55 | 2 | Fixed: every channel has the same page group (Listing, Pricing, Availability, Booking policies). |
| **One scope, two labels.** "All channels" on Amenities, "ⓘ 1 channel" everywhere else. | N4 Consistency and standards | Details › Amenities vs other tabs · HS-22, HS-26 | 1 | Fixed: one "ⓘ N channels" caption on every Base field, with a tooltip naming the channels. |
| **Currency on some fees, not others.** Resort and management fees have a currency selector; cleaning and pet fees don't. | N4 Consistency and standards | Pricing › Fees · HS-33 | 1 | Fixed: every money field shows its currency in the same box on the left. |
| **"Ask the AI" overlaps the facts.** The sticky bar covers rows while scrolling. | N8 Aesthetic and minimalist design | Knowledge Hub · HS-43–46 | 1 | Fixed: the Hub is rebuilt as Questions, Insights, Facts and Sources, with Test beside Questions and Facts. |
| **Copy defects.** "dont", "1 channels", three fees sharing one helper text. | N10 Help and documentation | Pricing · HS-30, HS-33, HS-34 | 1 | Fixed: the copy is rewritten. |
| **Amenities has no Save**, unlike every other tab. | N4 Consistency and standards | Details › Amenities · HS-22, HS-26 | 2 | Partly: one Save bar for every draft, but the Add amenity drawer still saves when it closes, as in the real product. |
| **"Lead listing" and "Fully managed" aren't explained.** | L1 Source-of-truth clarity | Overview · HS-21 | 2 | Partly: each pill has a tooltip, and "Fully managed" says what Hostaway manages; "Lead listing" still isn't explained. |
| **A shared fact names one channel.** "Contact the host via the Airbnb messaging system." | L1 Source-of-truth clarity | Knowledge Hub · HS-44 | 2 | Partly: Hub answers are written for the listing, never for one channel. |
| **Arrival is split.** Check-in method sits under Arrival, check-in time under Rules. | N6 Recognition rather than recall | Details › Arrival vs Rules · HS-22, HS-28 | 2 | Not fixed: the prototype keeps Hostaway's tabs. |
| **The Wi-Fi password is shown in plain text** in Details and in the Knowledge Hub. | N5 Error prevention (security) | Details › Arrival, Knowledge Hub · HS-22, HS-46 | 2 | Not fixed: still plain text in the prototype. |
| **Hub generation shows a green progress bar**, where progress elsewhere is raspberry. | N1 Visibility of system status | Knowledge Hub › Generate · HS-41 | 1 | Not in the prototype: Hub generation isn't rebuilt. |
## The worst ones, on screen
Three screenshots (): Details › Rules (`img/dc-hs-28.png`), Pricing › Base price (`img/dc-hs-30.png`), the Calendar leaving the property (`img/dc-hs32-calendar-exit.png`).
## How it was made
Part of Product audit.

(Repo record of the Notion page https://app.notion.com/p/3eee18af1645817899d8edd811bf9212, written in plain markdown tables; the live page uses Notion tables, mentions and uploaded images.)
