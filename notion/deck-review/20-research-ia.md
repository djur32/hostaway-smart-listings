# Deck × Notion v2 · Research (incl. "What it became" IA)

Scope: `20-research.html` (rs-method … rs-diagnosis), `30-ia.html` (ia-objects … ia-structure), the Research cover template (inside rs-method), `deck/src/data/covers.json`.
Compared with: 02 · Research and every child, 03 · Information architecture and every child, the Discovery outputs these slides reuse (Desk research, Channel constraints, Competitive analysis), KD-02/03/04/05/07/08/11/15/18. Conflicts were settled against `research/`, `ia/` and `prototype/src` where the two sides disagreed.

Note for the link phase: every slide's `data-notion-page` ("02-research", "03-ia") still resolves through `notion-links.json` to the **v1** workspace (`3eae…`). All URLs below are v2 (`3eee…`), from `map.json`.

---

## 1. Links

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|
| Research cover (rs-method template) | 02 · Research | https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3 | Section opener: methods, outputs, status of each |
| rs-method | KD-18 · Label what is simulated; plan the tests rather than fake results | https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c | The slide's whole message ("a labelled sample, standing in for the research I'd run"). Alt: User interviews https://app.notion.com/p/3eee18af1645819096ffef972af24f70 |
| rs-hosts | Personas | https://app.notion.com/p/3eee18af16458171989df7edc178e5df | Marta, Dana, Callum, Priya; where truth lives; Rob as a lens |
| rs-quotes | Interview synthesis | https://app.notion.com/p/3eee18af164581cda068f2d204abbe37 | Holds "In their words" and the five sessions |
| rs-pains | Insights | https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd | Each insight's "In the design" line is the slide's "My answer" (insights 4, 5, 6) |
| rs-insights | Insights | https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd | Same page: the signal table and the 2-of-5 finding |
| rs-jobs | Jobs to be done | https://app.notion.com/p/3eee18af16458111b95ee068296d5bd7 | Job 1 "Change once" is quoted verbatim on the slide |
| rs-cardsort | Card sorting results | https://app.notion.com/p/3eee18af1645817e8eb5cc92bbfc76a3 | Six piles, 1 of 15, the dendrogram, and the circularity caveat |
| rs-channels (+ pop-up "The limits") | Channel constraints | https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e | The per-channel table the pop-up abridges; same page for both |
| rs-market | Competitive analysis | https://app.notion.com/p/3eee18af164581a68ccdf6e48d114553 | 36 products, Pimcore and Akeneo, the gap |
| rs-diagnosis (+ pop-up "Four root causes") | Problem statement | https://app.notion.com/p/3eee18af1645814c9da9f6fce430fb5c | Root causes and How-might-we; same page for both |
| ia-objects | Object model | https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9 | The model; pop-up "The whole model" also here, for its "What changed on the way" |
| ia-bathtub | Channel constraints | https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e | Amenities row: the bathtub on each channel. Alt: KD-02 https://app.notion.com/p/3eee18af1645813ab697f55d6d253754 |
| ia-bathtub pop-up "What one bathtub forces" | Desk research | https://app.notion.com/p/3eee18af164581459cf4cb6d1a03f1d9 | Where the 89 field concepts and 32 amenities were cross-mapped |
| ia-options (+ pop-up "The seven options") | Navigation options | https://app.notion.com/p/3eee18af16458180a645fc510d470034 | Only v2 page that tells record-first, then channel-first |
| ia-structure | Sitemap | https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce | The property menu exactly as the prototype builds it |
| ia-structure pop-up "Why channel-first, and what that cost" | KD-03 · A channel-first property menu | https://app.notion.com/p/3eee18af164581f59e84e075de884cde | Options considered, "not yet tested with hosts". Alt: Tree testing https://app.notion.com/p/3eee18af1645814595defdaab694e87d |

---

## 2. Conflicts

Rule-4 items first (flag only), then the rest.

| # | slide | deck says | Notion says (page) | who is right | type |
|---|---|---|---|---|---|
| 1 | cover, rs-method | "with real access I'd run about 25"; "25 real host interviews" | "5–8 hosts" (User interviews) | Deck, rule 4 | **flag** |
| 2 | cover, rs-method | Produced / Sampled / Planned; "Simulated" vs "Real" | Done / Illustrative / Projected | Deck, rule 4. Side note: `hc.js` renders the mark as "Produced", while rule 4 names it "Done" (kit, outside this part) | **flag** |
| 3 | ia-structure | Field visual: Summary · Booking.com "Uses the Base". Notes: "Booking.com writes its own so we show it read-only". Label "One field, three behaviours" shows only two | Booking.com › Summary is "set by the channel" (Object model, KD-04); prototype `sl3.ts` summary `booking: 'set'` | Rule 4 removes "Set by Booking.com", but the visual now states something false about Booking.com and contradicts rs-channels ("Booking.com writes it"). The notes contradict the visual | **flag** + must (internal contradiction). See edit ia-structure-1 |
| 4 | rs-channels | Notes: "the design shows Booking.com's description as set by the channel, read-only" | Same as notes (Channel constraints, KD-04) | Notion and prototype agree with the notes; rule 4 says the deck's field model drops this case | **flag** |
| 5 | (ds-channels, nx-story; not this part) | Rule-4 example "Check-in method · Only on Booking.com" | Check-in method is **Airbnb only** (Object model, KD-04); prototype `sl3.ts`: "Booking.com has no check-in method field" | Prototype, for the channel; the three-case model stays per rule 4 | **flag** (my edits use "Short-stay cleaning fee · Only on Airbnb", true in both) |
| 6 | rs-hosts | "Four hosts, four places where 'the real one' lives" | Priya's truth lives on Airbnb, same as Marta (Interview synthesis). Source quote: "The real one is Airbnb. You're the messages." | Notion. Three places, not four | **fix** |
| 7 | rs-hosts | Footer `REAL·BRIEF` "The four personas"; notes "The brief named four hosts, and I kept them exactly as named" | "The brief's four host types are real… names, details and quotes are projected" (Personas) | Notion. The brief names types, not Marta/Dana/Callum/Priya | **fix** |
| 8 | rs-pains, rs-jobs | "321 votes" | 322 votes, renamed "Ability to update all listing content from Hospitable" (Insights, JTBD, Desk research) | Notion: re-checked 3 Oct (`feedback-board-2026-10-03.md`) | **fix** |
| 9 | rs-pains | Answer 4 "A receipt per channel, and undo" | Undo exists on an accepted tip, not on a saved change (KD-15, title changed for this) | Notion / prototype | **fix** |
| 10 | rs-pains | Answer 3 "Tips with a why, reviewed before anything is sent" | With Autopilot on, text and photo-order tips apply by themselves (KD-08) | Notion; rule 4 also says the host chooses the autonomy | **fix** |
| 11 | rs-cardsort | "content grouped by what it is, never by channel" | "Only 1 of 15 made a channel group" (Card sorting results); the same slide shows "1 of 15" | Notion | **fix** |
| 12 | rs-cardsort | Notes: "The card sort settled the structural question" | "The fit is circular… reported for transparency, not as validation. The independent check is a tree test" (Card sorting results) | Notion (honesty) | **fix** |
| 13 | rs-cardsort, ia-structure | "no text field passes 4.1%"; stat "4.1% at most, any text field" | Chart caption: "Titles, descriptions and photos are not in this data" (Insights) | Notion; `ANALYSIS.md` confirms. The claim covers only the 13 fields Edit per channel offers today | **fix** |
| 14 | rs-insights, cover | "Fifteen insights, eleven strong" (+3 Moderate, 1 Weak); cover "15 insights", "13 jobs" | Six insights (5 Strong, 1 Moderate); five jobs (Insights, JTBD) | Notion. The 15 and 13 include setup/import items (I-01, I-02, I-11, I-12; J-01…J-03), which rule 1 keeps out | **fix** (should) |
| 15 | rs-insights | Card "Trust breaks when they can't see whether each channel is OK right now" | Not among the six; it is I-13, "status, not setup" (import) | Notion | **fix** (should) |
| 16 | rs-quotes, rs-insights | "Hosts want to see changes before they happen"; Callum's dry-run quote | "The research found this about connecting a channel; applying it to every edit is an `ASSUMPTION`" (Insights #4) | Notion. No chip (rule 3); say it in the notes | **fix** (should) |
| 17 | rs-method | "Strong means three sources or more, and one of them real" | "three independent sources of two types, at least one real" (Insights) | Notion | **fix** (could) |
| 18 | rs-market | Headline "Nobody uses them for the listing"; chip "Comps for the listing: none"; notes "never for the listing itself" | "Comps inform price, almost never content"; AirDNA's Comparable Amenities is a listed pattern (Competitive analysis) | Notion; `competitors.md`: "Only AirDNA's Comparable Amenities and Rankbreeze's keywords point comps at listing content" | **fix** |
| 19 | rs-market | Notes: "36 products: eleven rental platforms, six market tools and eighteen analogues" | 36 = Hospitable + 11 + 6 + 18 (`competitors.md`) | Repo; the notes add up to 35 | **fix** |
| 20 | rs-market | "9 of 11 treat listings as plumbing" | "six of eleven platforms… send one description everywhere" (Competitive analysis) | Both are true in the repo (`SUMMARY.md`); a different measure from the one on the linked page | **flag** (cohesion, could) |
| 21 | rs-diagnosis | Five How-might-wes; no "voice as a choice" | Six; includes "offer a channel's own voice as a choice" (Problem statement) | Notion. Its sixth HMW (Booking.com steered through facts) clashes with rule 4, so leave that one out | **fix** (should) |
| 22 | ia-objects | Notes: "The names on screen changed later; the objects didn't." | "What changed on the way": versions dropped, Hub not merged, Booking.com set by the channel (Object model; KD-07, KD-02) | Notion / prototype | **fix** |
| 23 | ia-objects | "Version · Every change, with a receipt"; pop-up "Every change is a Version", "v0 = as imported", "Push", "Strategy: Family · Groups…" | No versions (KD-07); Save with a receipt replaced Review & push (KD-15); strategy chips dropped (KD-06) | Notion. The pop-up is the first model; label it as such. "As imported" breaks rule 1 | **fix** (should) |
| 24 | ia-objects pop-up | "Guests read Copy, written per Listing" | A channel uses the Base text unless the host or a tip gives it its own (KD-11, Insights #2) | Notion | **fix** (should) |
| 25 | ia-options, ia-structure | Record-first wins 9/9; the next slide is a channel-first menu. "I kept channels" never says what was dropped | Record-first was recommended, then dropped in design review. Five navigation models were drawn; the review recommended one listing hub; I chose channel-first (Navigation options, KD-03, Signal Weak) | Notion. The deck skips the turn | **flag** (narrative) + should |
| 26 | ia-structure | Notes: "Smart Listings sitting between the two layers"; it is drawn outside the Shared tag | "Smart Listings sits in Shared… only when it's on" (Sitemap, KD-03); prototype `sl3.tsx` comment says the same | Notion / prototype | **fix** (could) |
| 27 | ia-structure | Notes: "so we show it read-only" | Voice rule: first person "I" | Rule 2 | **fix** |
| 28 | ia-options pop-up | Option trees list "Connections & import", "Import review", "Imports (v0)" | Smart Listings only (SPEC §4.1) | Rule 1 | **fix** (should) |
| 29 | covers.json | `"ia": { "illo": "one-fact-many-channels" }` | IA folds into Research (rule 4); no slide has `data-part="ia"`, so this entry is never read | Rule 4 | **fix** (could, tidy) |

Checked and consistent: Marta's and Rob's quotes; the hours per persona (`personas.md`); the rituals on rs-jobs (`INT-*`); 2 of 5 and the balcony; 36% / 30% / 4.1%; the six piles; 73% for the assistant card; 115 / 89 / 36; 618 calls (`REAL·BRIEF`); 60 tickets and 40 CRM accounts (simulated sets in `research/data`, labelled); 3.64, 9/9 and 0.15 (`ia/evaluation.md`); 71% vs 31% (simulated, labelled, and said not to carry over); the sitemap. Every simulated number in this part carries a simulated chip or footer.

---

## 3. Missing story (top five, by value)

1. **"A channel's own voice is a choice, not a default"** (Insights #2, KD-05, KD-11, half of hub step 3). Only the optimiser wanted different words per channel. That is why a channel field uses the Base until customised, and why Smart Listings is opt-in. No slide in this part says it, and ia-objects implies the opposite ("Copy, written per Listing"). **Fold into** rs-insights (replace the I-13 card) and rs-diagnosis (HMW 3).
2. **The record-first → channel-first turn** (Navigation options, KD-03). After scoring, a second round drew five navigation models on Hospitable's chrome. The review recommended one listing hub; I chose channel-first with a Shared layer (fewest clicks on my frames), designed out its risk, and it is still untested. This is honest and shows judgement. **Fold into** the ia-options notes and the ia-structure pop-up.
3. **Real evidence that hosts want both** (Desk research). Besides the 322 "edit once" votes, 25 board posts ask to keep minimum stay, markups, check-in times, discounts, photos or fees different per channel on purpose (`REAL·PUBLIC`). Today the per-channel axis rests only on simulated data. **Fold into** the rs-jobs notes (the footer is already public).
4. **The tree test that would check the menu** (Tree testing). Three trees, 30 hosts each; it passes if channel-first lands within 5 points of record-first and reaches 70% on the channel tasks; it names what would change the menu. **Fold into** the ia-structure pop-up ("The first test I'd run") and the cover's Planned row.
5. **What the card sort found that the script didn't encode** (Card sorting results). Hosts file "what the assistant knows" with arrival info (73%), almost never with the home (3%), so the Knowledge Hub sits in Shared next to the Listing base. AI and performance cards float in a "Not sure" pile (53% agreement), so Smart Listings gets a place of its own. Add the circularity caveat. **Fold into** the rs-cardsort notes.

---

## 4. Proposed edits

Visible text has no em or en dashes (the build warns). Notes are in the first person. By a rough count (footers included), rs-insights, rs-jobs, ia-objects and ia-structure already run past 110 words. Each edit here keeps its slide's length the same or shorter, except the added channel-only row on ia-structure (+6 words). Run the build's word check after applying.

### Research cover (template in rs-method)
- **should** · Sampled row: `4 personas · 15 insights · 13 jobs · Card sort results` → `4 personas · 6 insights · 5 jobs · Card sort results`
- **should** · Planned row: `25 real host interviews · Card sort with 15 real hosts` → `25 real host interviews · Card sort with 15 real hosts · Tree test with 90 hosts`
- **could** · Produced row: `Information architecture` → `Property menu`

### rs-method
- **could** · Chip: "Strong means three sources or more, and one of them real" → "Strong means three sources of two kinds, one of them real"

### rs-hosts
- **must** · h2: "Four hosts, four places where "the real one" lives" → "Four hosts, and “the real one” never lives in Hospitable"
- **should** · Footer: `REAL·BRIEF` "The four personas" → "The four host types"
- **should** · Notes, first sentence: "The brief named four hosts, and I kept them exactly as named, adding behaviour rather than demographics." → "The brief named four host types. I kept them, gave each a name, and added behaviour rather than demographics."

### rs-quotes
- **should** · Notes, after the Callum sentence, add: "He said it about connecting his units. I'm extending it to every edit, and that's the first thing I'd test."

### rs-pains
- **must** · Answer 4: "A receipt per channel, and undo" → "A receipt for every save, undo on a tip"
- **should** · Answer 3: "Tips with a why, reviewed before anything is sent" → "Tips with a why, on the host's terms"
- **must** · Footer: "A 321-vote request on Hospitable's feedback board" → "A 322-vote request on Hospitable's feedback board"
- **must** · Notes: "tips with a why that the host reviews before anything is sent, and a receipt per channel with undo" → "tips with a why that the host accepts, or lets Autopilot apply inside guardrails, and a receipt for every save, with undo on an accepted tip"

### rs-insights
- **should** · h2: "Fifteen insights, eleven strong, each traced to its evidence" → "Six insights shaped Smart Listings, each traced to its evidence"
- **should** · Meter: "Fifteen insights, by signal" → "Six insights, by signal"; 6 cells (5 strong, 1 `is-mod`); legend "5 Strong · 1 Moderate" (drop Weak)
- **should** · Card "**Hosts group content by kind,** and vary money per channel" → "**Per channel means money and stay rules,** not words"
- **should** · Card "**Trust breaks** when they can't see whether each channel is OK right now" → "**Only the optimiser wants** different words per channel" (signal `moderate`)
- **should** · Card "**They want to see a change** before it's written, not a backup after" → "**They want to see a change** before it's written, and proof after"
- **should** · Notes, first paragraph → "I clustered the sampled interviews, data and card sort with what I could see for real. Six insights shaped Smart Listings: five Strong, one Moderate. Per channel means money and stay rules, not words. Only the optimiser wants different words per channel, so a channel's own voice is a choice, not a default. Hosts want to see a change before it's written, and proof after. And the two stores of facts disagree, with the assistant reading the one no channel sees."

### rs-jobs
- **must** · Stat: "321" → "322"; notes "with 321 votes" → "with 322 votes, still In Progress"
- **should** · Notes, append: "The same board has 25 posts asking to keep minimum stays, markups, fees or photos different per channel on purpose. Hosts want both."
- **could** · Message: "Every host was doing the same job by hand" → "Every sampled host was doing the same job by hand"

### rs-cardsort
- **must** · Message: "content grouped by what it is, never by channel" → "content grouped by what it is, almost never by channel"
- **should** · Chart caption: "Multi-channel properties that customise the field per channel" → "Multi-channel properties that customise the field, among those Edit per channel covers today"
- **should** · Notes → "The sampled card sort pointed at the structure. Fifteen simulated hosts sorted forty cards; only one made a group by channel, and the rest sorted by kind into six piles. The override data adds the second axis: the cleaning fee differs per channel on 36 percent of properties and the minimum stay on 30, while no text field it covers passes 4.1. Two findings the script didn't encode: hosts file what the assistant knows with arrival info, so the Knowledge Hub sits in Shared beside the Listing base, and AI and performance cards float, so Smart Listings gets its own place. The sort can't validate itself; a tree test with real hosts will."

### rs-channels
- **flag (Antonio)** · Notes: "That's why the design shows Booking.com's description as set by the channel, read-only, never a text box that goes nowhere." If rule 4 stands → "That's why, on Booking.com, a host shapes the description through facts, photos and amenities, never a text box that goes nowhere."
- **could** · Notes, append: "Vrbo and Google are researched here; the prototype builds Airbnb, Booking.com and Direct."
- **could** · Pop-up source: "The channels' own documentation, accessed 29 Sep" → "The channels' own documentation"

### rs-market
- **must** · h2: "Competitors use comps for price. Nobody uses them for the listing." → "Competitors use comps for price. Almost nobody uses them for the listing."
- **must** · Chip: "Comps for the listing: none" → "Comps for the listing: rare"
- **must** · Notes: "the market tools build comp sets only for price, never for the listing itself" → "the market tools build comp sets for price, almost never for the listing; AirDNA's comparable amenities is the exception"
- **must** · Notes: "I reviewed 36 products: eleven rental platforms" → "I reviewed 36 products: Hospitable, eleven rental platforms"

### rs-diagnosis
- **should** · HMW 3: "give money and stay rules **one per-channel pattern** instead of seven" → "give money and stay rules **one per-channel pattern**, and make a channel's voice a choice"
- **should** · Notes: "one pattern for the money and stay rules hosts do vary per channel" → "one pattern for the money and stay rules hosts do vary per channel, with a channel's own voice as a choice"; append "These became the principles I judged every concept by."

### ia-objects
- **must** · Notes: "Four of twenty-two. The names on screen changed later; the objects didn't." → "Four of twenty-two. The build kept the idea and simplified it: versions became a receipt on every save, a channel uses the Base's copy unless it has its own, and the Knowledge Hub stayed its own section in Shared."
- **should** · Pop-up panel title "22 entities" → "The first model, 22 entities"; in its data, "Immutable snapshot; v0 = as imported" → "Immutable snapshot of a change"
- **should** · Pop-up lead: "Guests read **Copy**, written per Listing and grounded in Facts. Every change is a **Version**." → "Guests read the Base's **Copy** unless a Listing has its own, always grounded in Facts. Every change goes out with a receipt."
- **could** · Node "Version · Every change, with a receipt." → "Receipt · Every change, confirmed per channel." (keeps "4 of 22")

### ia-bathtub
- **could** · Pop-up caption: "…documentation, accessed 29 Sep" → "…documentation"

### ia-options
- **should** · Notes, second paragraph → "[Press] Record-first won, 3.64 out of 5, under all nine weightings I could argue for. It was never built. When Smart Listings needed a home, I drew five menus on Hospitable's own chrome. The review favoured one listing hub; I chose channel-first with a Shared layer, and kept this slide's lesson."
- **should** · Pop-up option trees: "Connections & import" → "Connections"; remove "Import review" and "Imports (v0)"

### ia-structure
- **must + flag** (conflict 3) · Field visual, rule-4-safe and true to the prototype: label "One field, three behaviours" → "Three cases, every field". Base "Summary · "A sunny two-room flat…"" → "Property name · "Beautiful Artist Apt. in Neukölln"". Rows: Airbnb "Uses the Base", Booking.com "Custom for Booking.com" (accent), Direct "Uses the Base". Add one row: "Short-stay cleaning fee · Only on Airbnb"
- **must** · Notes: "Take one field, the summary: Airbnb has a custom one, Booking.com writes its own so we show it read-only, and Direct simply uses the base." → "Take one field, the property name: Airbnb and Direct use the Base, Booking.com has its own. And a few fields exist on one channel only, like Airbnb's short-stay cleaning fee."
- **could** · Notes: "with Smart Listings sitting between the two layers" → "with Smart Listings at the foot of Shared, shown only when it's on"
- **should** · Stat label: "at most, any text field" → "at most, any text field measured"
- **should** · Pop-up (keeps it ≤ 90 words):
  - Lead "Pure channel-first scored worst, because it copies facts per channel." → "Record-first won my scoring. When Smart Listings needed a home, I drew five menus and chose channel-first: fewest clicks on my frames."
  - "The first test I'd run" body "Tree-test this menu with real hosts. The 71% vs 31% tree test ran on the earlier record-first menu, so it doesn't carry over." → "Tree-test it against today's menu and record-first, 30 hosts each. It passes within 5 points of record-first, and at 70% on channel tasks." Drop the simulated chip; the notes already say the old test doesn't carry over.

### covers.json
- **could** · Remove the unused `"ia"` entry, or note in `_note` that IA folds into `research`.

---

## 5. Narrative note

The part matches two of Notion's six steps. Steps 3 and 4 are there (money and stay rules vary per channel; facts once, channels hold only what differs), and so is the grounding half of the Research "In one line" (2 of 5, a rule rather than a warning). It misses the other half: a channel's own voice is a choice, and that choice drives the defaults and opt-in. Step 2 also arrives late. rs-channels and rs-market are Discovery outputs in Notion but sit after the card sort here; that is fine for links, and optional to reorder. The IA story differs most from Notion's "In one line" ("record-first, then channel-first, chosen in design review and not yet tested"). The deck shows record-first winning, then a channel-first menu, with no turn between them. It also tells viewers the first model's objects never changed, while KD-07 dropped versions. **The one change:** retell the IA turn honestly across ia-objects → ia-options → ia-structure. Record-first won the scoring and was never built. When Smart Listings needed a home, I chose channel-first with a Shared layer and designed out its risk. The tree test would check it, and that is what the deck should promise.
