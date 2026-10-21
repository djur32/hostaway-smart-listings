# 📒 Decision log · KD-01…KD-18 (repo record)

Notion database: https://app.notion.com/p/bdf268a39a0b413896f5084bd66df2e6 (data source `collection://4dcc1615-04d1-4b25-9571-e24fe723cfe3`).
Each row below holds the properties written to Notion and the row body exactly as sent (Notion-flavoured Markdown).
KD-19 belongs to another writer. Checked against the live prototype () and `prototype/src`.
Notion autolinks the bare word "Booking.com" to http://Booking.com, so in Notion it is written with an invisible word joiner (U+2060) before the dot, in bodies and in KD-04's Records. This file keeps the plain spelling.

---

## KD-01 · Go deep on Smart Listings and leave import for later

- **URL:** https://app.notion.com/p/3eee18af164581b68ba5e7beaa7055ab
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-001 · narrowed: Angles A + B were planned, only B was taken deep
- **In the prototype:** 

```
**Decision.** The case goes deep on one angle: Smart Listings, the brief's Angle B (the intelligent listing). Import and first-time setup (Angle A) were planned alongside it and were not carried through. Import is the next step on the roadmap, and listing optimisation over time (Angle C) is the step after that.

**Why**
- Going deep on one angle shows more than touching several lightly, so the time went into Smart Listings.
- Import and optimisation stay as named next steps instead of disappearing, so the work still shows where it leads.

**Options considered**
- Angles A and B as one story (import creates the truth, Smart Listings puts it to work): the original plan, narrowed.
- All three angles: ruled out by the brief, which asks for one or two.
- Smart Listings only, in depth: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af164581e28fddc912dc332953">00 · Brief & scope</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818daddff9b46244175c">Roadmap</mention-page>

**Where to see it:** every live screen is Smart Listings work; Getting started, where import would begin, is inert. [Open the prototype]()
```

---

## KD-02 · Listing details live once, in the Listing base. The Knowledge Hub reads them

- **URL:** https://app.notion.com/p/3eee18af1645813ab697f55d6d253754
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-114, D-980, D-916, D-940, D-941, D-928, D-107, D-016 · supersedes D-112, D-125, D-024 (on the Base)
- **In the prototype:** 

```
**Decision.** Listing details live once, in the Listing base in Shared: the Details, Pricing and Availability every channel lists. The Knowledge Hub reads those details without copying them, adds what they don't say (the situations behind a rule, such as what a host does when X, Y or Z happens), and learns from guests' questions in the inbox. A channel inherits each value and stores only what it does differently. Each Base field says how many channels it reaches.

**Why**
- Today the Knowledge Hub keeps its own copy of the listing, generated from Details and past messages. Later edits to Details don't reach it, so the copy drifts by design ([help centre](https://help.hostaway.com/en/articles/9716792-property-knowledge-hub-page)).
- Ask the AI answers from that copy, not from the listing. On a trial listing it told a guest the apartment is wheelchair accessible, with no amenity saying so ().
- Hosts keep money and stay rules different per channel, and rarely words (), so most facts can be shared.

**Options considered**
- Keep both copies and sync them: dropped, it keeps the drift.
- Fold the Knowledge Hub into one record called "The home": dropped in design review. The Hub stays a named section, with its own job: guests' questions.
- Listing details once, in the Listing base, read by every channel and by the Knowledge Hub: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458168b8ede129bf1dc3a9">Object model</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page>

**Where to see it:** Shared › Listing base › Details, where each field shows how many channels it reaches, and Knowledge Hub › Facts, where each listing detail points back to its Listing base field. [Open the prototype]()
```

---

## KD-03 · A channel-first property menu: Shared first, then one group per channel

- **URL:** https://app.notion.com/p/3eee18af164581f59e84e075de884cde
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-114, D-920, D-933, D-123 (part) · supersedes D-110, D-111, D-918
- **In the prototype:** 

```
**Decision.** The property menu reads Overview, then Shared (Listing base, Knowledge Hub, Calendar, Guest experience, Operations, and Smart Listings when it is on), then Channels. Airbnb, Booking.com and Direct each have Listing, Pricing, Availability and Booking policies, with a tip count on each page. Channels have no Overview page; Performance covers that.

**Why**
- Today no screen shows one listing as a whole on one channel, and "Edit per channel" is scattered across about 15 fields ().
- Hosts group content by kind, but what they change per channel is money and stay rules (). Kind inside each group, with the channel as the group, serves both.
- On the concept frames, channel-first took the fewest clicks across five tasks ().

**Options considered**
- A menu grouped by kind, with a read-only window per channel: the recommended IA, dropped in design review.
- One Listing hub with Base and per-channel scopes: dropped.
- An assistant drawer on today's menu: dropped.
- Channel-first with a Shared group: chosen. Not yet tested with hosts.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af16458180a645fc510d470034">Navigation options</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581d6b4e2c132983137ce">Sitemap</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page>

**Where to see it:** the property menu on any page. [Open the prototype]()
```

---

## KD-04 · Each field uses the Base, is customised for the channel, exists only on that channel, or is set by the channel

- **URL:** https://app.notion.com/p/3eee18af16458164b971f07e49e0fa84
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-923, D-919 (part), D-933, D-934, D-940, D-960, D-971, D-031, D-032, D-049, D-086, D-149, D-154 · supersedes D-024 (on the Base), D-140, D-146 and an earlier build's editable Booking.com description
- **In the prototype:** 

```
**Decision.** On a channel's pages every field is one of four cases. It **uses the Base**: "Uses the Base" shows the Base value, disabled. It is **customised for the channel**: "Custom for Booking.com" is editable. It exists **only on that channel**: Airbnb's check-in method says "Airbnb only" and appears only there. Or it is **set by the channel**, and the host can't change it: Booking.com writes its own description from the property's facts, so the summary is read-only and shows "Booking.com only" with a lock whose tooltip says why. Listing-wide fields such as tags say "All channels" and change every channel at once. Going back to the Base keeps the custom value.

**Why**
- Booking.com writes its own description from the facts it is given, and Hostaway can't sync text to it (: [Booking.com Partner Help](https://partner.booking.com/en-us/help/property-page/general-info/changing-your-property-description-or-room-details), [Hostaway Help](https://help.hostaway.com/en/articles/6141381-properties-details-page)).
- Today "Edit per channel" splits a field inline on the shared form, and Airbnb has no page of its own ().

**Options considered**
- Today's inline "Edit per channel": dropped.
- A master grid with inherit or override per cell: dropped for overwhelm.
- A Booking.com description editable per channel, as in an earlier build: dropped, the text goes nowhere.
- Four cases per field, on the channel's page: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581178debffa0628f4703">Listing base & channels</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>

**Where to see it:** Booking.com › Listing: a custom name, inherited texts, and a locked summary that Booking.com writes. [Open the prototype]()
```

---

## KD-05 · Smart Listings is opt-in, switched on per property

- **URL:** https://app.notion.com/p/3eee18af1645819d96d4cff8530e1600
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-127, D-935, D-946, D-150 · updates D-127 (what appears when it is on)
- **In the prototype:** 

```
**Decision.** Smart Listings is off by default. One toggle on the property Overview turns it on, and the first time it opens the strategy wizard. Turning it off asks first and says nothing is lost. Turning it back on restores the same strategies. While it is off there are no tips and no Strategy or Performance pages, and Shared and Channels look exactly the same.

**Why**
- Not every host wants AI working on their listing (my design review). In the simulated interviews, two of the four host types treat listing copy as a fact about the home, not a voice ().
- One place for every listing detail fixes a structural problem, so every host gets it. Only the AI layer is optional. Trust and status are never a premium feature.

**Options considered**
- AI on for every host: dropped.
- A toggle that switches the whole structure: dropped, it would make two products.
- A per-property toggle for the AI layer only: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af16458171989df7edc178e5df">Personas</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>

**Where to see it:** the property Overview with Smart Listings off. [Open the prototype]()
```

---

## KD-06 · One strategy per channel, made in a full-screen wizard

- **URL:** https://app.notion.com/p/3eee18af164581028d64c3d0ff9f7d48
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-917 (part), D-938, D-964, D-965 · supersedes D-143, D-921, D-950 (its strategy history)
- **In the prototype:** 

```
**Decision.** Each channel has one strategy: a goal, an audience, guardrails, and Autopilot on or off. It is made and edited in a full-screen wizard copied from Hostaway's Add-property flow, one question per screen. The host can give every channel the same strategy, give each its own, or let some share one. The Strategy page shows one row per channel with Open, Edit, Pause, Replace and Remove. There is no separate Setup page.

**Why**
- Guests differ by channel, and the wizard's options cite similar homes, such as "8 of 24 similar homes lead with this" ().
- Reusing Add-property means hosts meet a flow they already know ().
- In design review, the first multi-step strategy screens were too complex and the first wizard too thin; one question per screen sits between them.

**Options considered**
- Eight strategy chips on a listing studio: dropped.
- A Setup page with a wizard embedded in the content area: dropped, Setup and Strategy looked alike.
- Strategy as the one hub, edited in a full-screen wizard: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d">User flows</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3">UI changes</mention-page>

**Where to see it:** Smart Listings › Strategy, then Edit on a row. [Open the prototype]()
```

---

## KD-07 · No versions: Performance compares with the period before the strategy

- **URL:** https://app.notion.com/p/3eee18af1645812290f5e2113a9a0844
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-962, D-963 · supersedes D-917 (versions), D-950, D-951, D-952 (colours), D-148, D-155, D-156, D-157, D-159 · see D-977
- **In the prototype:** 

```
**Decision.** A channel has one current strategy, with no versions or history to manage. Performance shows one channel at a time against one built-in baseline: the same number of days just before its strategy started, drawn in grey on the same timeline. Plain KPI cards (occupancy, nightly rate, RevPAR, revenue and more) each carry one line of context, such as similar homes, under a labelled Period control and a one-sentence summary.

**Why**
- Versions were a concept to learn before any payoff (my design review).
- One baseline answers "did this strategy work?" with no setup.
- The cards copy Hostaway's Metrics cards, so the page feels native (). Every figure is demo data ().

**Options considered**
- Every pushed setup as a measured version that can be compared and restored: dropped.
- A compare mode against another strategy, the previous period or last year: dropped.
- One baseline, the stretch before the strategy: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645813d9391e336e308e3d7">Goals & KPIs</mention-page>

**Where to see it:** Smart Listings › Performance. [Open the prototype]()
```

---

## KD-08 · Autopilot is on or off, and suggestions always arrive as tips

- **URL:** https://app.notion.com/p/3eee18af16458160a7c1c703fcb2a033
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-917 (part), D-025, D-126 · replaces D-025's three-level dial and D-126's autonomy table; "Suggest or Autopilot" in D-917 and D-980 now reads Autopilot off or on
- **In the prototype:** 

```
**Decision.** Each channel's strategy runs with Autopilot off or on, and it is off by default. Off, tips wait and nothing changes until the host accepts one. On, text and photo-order tips apply by themselves inside the guardrails, and the channel's Listing and Availability turn read-only, with "Turn off to edit". Prices and fees, minimum stay and rules, and the cancellation policy always ask, so they still arrive as tips.

**Why**
- Hosts fear losing settings, money and status more than copy (), so money and rules never change on their own.
- One switch is simpler than a dial per content type, and "Suggest" as a mode name was dropped (my design review).

**Options considered**
- A three-level dial per field group (Suggest, Auto-apply with review, Autopilot): dropped.
- Autonomy defaults per host type, content type and channel: replaced by the one switch.
- Autopilot on or off, with guardrails that can't be turned off: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581cfb862c44df572735c">Design principles</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645816c86aee6acef674975">Strategy & performance</mention-page>

**Where to see it:** in the demo, Airbnb runs on Autopilot: its Listing is read-only and its tips still wait. [Open the prototype]()
```

---

## KD-09 · Tips live in one docked panel, one at a time, each with its why

- **URL:** https://app.notion.com/p/3eee18af164581319e3afd8d876c7cb2
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-922, D-931, D-939, D-959, D-020 · supersedes D-144 and the inline Pricing tip card
- **In the prototype:** 

```
**Decision.** Tips open in one panel docked on the right; the form narrows beside it and the page header stays put. The panel steps through tips one at a time ("4 of 11"), and a dot by a field opens that field's tip. Every tip uses the same card: what changes, alternatives where they help, a short Why with each reason's source, then Dismiss or Accept, and after accepting, Undo or Next. Classic and Canvas share the panel. A tip never appears inline under its field.

**Why**
- Today the only listing AI is Airbnb's Opportunities, on a separate page away from the fields ().
- Advice sits next to what it changes, without covering the form.
- One container for titles, text, photos and prices means one thing to learn.

**Options considered**
- A separate page of suggestions, like today's Opportunities: dropped.
- Tip cards inline under each field: dropped in design review.
- One docked panel, one tip at a time: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581a68ccdf6e48d114553">Competitive analysis</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>

**Where to see it:** Airbnb › Listing with Tips open. [Open the prototype]()
```

---

## KD-10 · One AI affordance per field: a tip, otherwise Rewrite with AI

- **URL:** https://app.notion.com/p/3eee18af164581e7844fc2de20912029
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-949, D-939 · supersedes D-932, D-141, D-142 · see D-977
- **In the prototype:** 

```
**Decision.** A field shows at most one AI marker. If it has a tip, it shows the tip's dot, even on a field that uses the Base. Otherwise it offers Rewrite with AI, but only if the host can type into it right now: fields that use the Base, are locked, are set by the channel or are under Autopilot get none. Rewrite opens in the same panel as a composer: describe a change or pick a quick action, refine with follow-ups, preview, then accept.

**Why**
- Less to take in, and never an affordance that can't act.
- Tips and Rewrite share one card language, so the host learns AI once.
- Today Hostaway has AI for messaging and the Knowledge Hub, and none on listing fields ().

**Options considered**
- A rewrite prompt open under every field: dropped.
- A toolbar on selected sentences (rewrite, shorten, remove): dropped.
- A title panel with four alternatives and a strength meter: dropped; alternatives moved into the tip card.
- One affordance per field, opening the shared panel: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>

**Where to see it:** Airbnb › Listing with Autopilot off. [Open the prototype]()
```

---

## KD-11 · Tips are channel-specific and cover money and stay rules, not only copy

- **URL:** https://app.notion.com/p/3eee18af16458172b17ac84a5abb32ef
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-947, D-948, D-981, D-105, D-085, D-974 (part) · D-981 reconciles D-105 with D-948
- **In the prototype:** 

```
**Decision.** Tips appear on all four of a channel's pages (Listing, Pricing, Availability and Booking policies), counted on each tab and in the menu. Every tip is about the channel it sits on. On a field that uses the Base, accepting creates that channel's own value and leaves the Base alone. On a listing-wide field, the tip says it applies to every channel. Pricing and Availability tips commit only on Save. A channel keeps the Base text unless the host, or a tip from its strategy, gives it its own.

**Why**
- Hosts keep cleaning fees (36%) and minimum stays (30%) different per channel far more often than text (4.1% or less) ().
- Fees, commission and rate plans differ by channel ().
- A tip about a channel it can't change is noise (my design review).

**Options considered**
- AI for copy only: dropped.
- Per-channel voice on by default for every host: dropped; in the simulated research only one host type writes copy per channel.
- Channel-specific tips on every page, with voice as a choice: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645818094e8d80d9ddf2acd">Insights</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818c859bcd3115fce28e">Channel constraints</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814c9da9f6fce430fb5c">Problem statement</mention-page>

**Where to see it:** Airbnb › Pricing with Tips open. [Open the prototype]()
```

---

## KD-12 · Guest questions in the Knowledge Hub become tips, and every tip cites its sources

- **URL:** https://app.notion.com/p/3eee18af164581b19c66d8d053ea6ab0
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-968, D-106, D-922 (part)
- **In the prototype:** 

```
**Decision.** A frequent or unanswered guest question in the Knowledge Hub becomes a tip. It uses the same tips panel and the same contract as every tip: the field, the change, why, its sources, Accept or Dismiss, then a receipt and Undo. Its why is the questions behind it. Accepting writes the answer into the Listing base, so every channel and the assistant use it. When most asks come from one channel, the tip also offers that channel's description only. On the channel pages, a tip's why can cite a Listing base fact or guest messages, and a question page lists the open tips that use its facts.

**Why**
- Today guest questions stay in the Inbox, and nothing turns them into knowledge or into improvements to the listing ().
- AI should never state a fact the home's record doesn't hold. In the simulated interviews only 2 of 5 hosts caught a planted false claim unprompted (). Citing the questions and facts behind a tip makes it checkable.
- One tip contract lets tips reach other areas of Hostaway. The Hub is the first.

**Options considered**
- Keep the Hub for guest messaging only, as today: dropped.
- An inline "Add the answer" box on an unanswered question, from an earlier iteration: replaced, so a gap follows the same contract and receipt as every other suggestion.
- A warning line when a claim isn't found in the facts: dropped. In the simulated interviews hosts misread or missed it.
- Gaps become tips, and every tip cites its sources: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645811a82c4e772997ac875">Tips & AI rewrite</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581cda068f2d204abbe37">Interview synthesis</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page>

**Where to see it:** Knowledge Hub › Questions › "Is there free parking?", whose tip "Say where guests can park during the day" cites the nine guests who asked. [Open the prototype]()
```

---

## KD-13 · The Knowledge Hub is Questions, Insights, Facts and Sources, and reads the listing details from the Listing base instead of copying them

- **URL:** https://app.notion.com/p/3eee18af1645814fa326e55e940a5942
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-928, D-966, D-967, D-107 (naming) · supersedes D-924
- **In the prototype:** 

```
**Decision.** The Knowledge Hub's job is guests' questions. It has four sections. **Questions:** every Inbox question by topic, counted per channel and over time, answered or not. **Insights:** what guests ask most, what's new this month, and how each channel's guests differ. **Facts:** what the AI reads: each listing detail as a reference to its Listing base field, never a copy, plus what the listing doesn't say, such as the situations behind a rule, and answers the host confirmed. **Sources:** the Listing base, Inbox conversations, the host and documents. The assistant answers guests only from listing details and from Facts the host wrote or confirmed. When nothing backs an answer, it says so and asks the host. Every Hub page is labelled Concept.

**Why**
- Today the Hub repeats the listing in its own copy, which later edits don't reach (), and Ask the AI answers from that copy (on a trial listing).
- Nobody sees what guests ask, so Hostaway learns nothing from it ().
- A Hub that keeps no copy of the listing details can't drift from them, and one that counts questions has a job no other page does (my design review).

**Options considered**
- Dissolve the Hub into one home record: dropped.
- Content, Workflows and Sources, with facts added by describing them: built first, then replaced. The Hub still held its own facts and repeated the listing.
- Questions, Insights, Facts (listing details read from the Listing base, plus the host's own situations), and Sources: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645811f8fcfcbffc7cbb69d">Knowledge Hub</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645813ab697f55d6d253754">KD-02</mention-page>

**Where to see it:** Shared › Knowledge Hub › Questions. [Open the prototype]()
```

---

## KD-14 · Canvas previews each channel's real guest page, and tapping opens the field

- **URL:** https://app.notion.com/p/3eee18af1645819e9675db2668610c2b
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-925, D-903, D-953, D-972, D-907 (part), D-124 · supersedes D-930, D-904
- **In the prototype:** 

```
**Decision.** Each channel's Listing has two views, Classic and Canvas. Canvas replicates that channel's real guest page (Airbnb, Booking.com or Direct), reads the live settings and is never dimmed. Nothing is edited on the page itself. Areas with a tip are outlined purple and editable areas orange; tapping one opens its tip, or its field, in the same right-hand panel Classic uses. Photos open the photo manager. A toggle shows only the editable sections, and edits wait for the same Save bar.

**Why**
- Today "Publish listing" is one click with no preview ().
- Hosts recognise their own listing in its real layout (my design review).
- One field, one editor: a friendly preview invites "looks right, approve", so the preview finds the field and the field decides (my design review). The concept test checks it with real hosts, with one consequence planted in each direction (until it runs).

**Test planned:** <mention-page url="https://app.notion.com/p/3eee18af1645810fbe60d21eb29dd3c7">Concept testing</mention-page>, eight hosts, a pricing change hidden in each direction.

**Options considered**
- A preview pinned beside the form: dropped.
- Editing inline on the page: built, then dropped in design review.
- Canvas as a way to find a field, opening it in the panel: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af16458187b60ec60bb6c3c5c5">Canvas preview</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645815aa317e53bdcf8435d">Concept directions</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581bdb0f8dd25c3d311a4">Final concept</mention-page>

**Where to see it:** Airbnb › Listing › Canvas. [Open the prototype]()
```

---

## KD-15 · Save is the commit, and each saved change goes out with a receipt

*(Title changed from "…each change is sent with a receipt and Undo": the build offers Undo on an accepted tip, not on a saved section.)*

- **URL:** https://app.notion.com/p/3eee18af164581a693f6c6cc544b8c1a
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-929, D-956, D-104, D-145 · supersedes D-129 (one queue, Review & push), D-919 (review per channel)
- **In the prototype:** 

```
**Decision.** Every edit is a draft until the host presses Save on one Discard and Save bar, shared by the form, photos and Canvas. Save sends the change to the channel straight away, with a receipt ("Saved · sent to Booking.com") that moves from Sent to Live, or to In review for a Booking.com name. An accepted tip commits one change and offers Undo. A Base edit reaches every channel that uses it.

**Why**
- Hosts fear losing what they have; the remedy is "nothing written until seen", which a draft and one Save give ().
- Today Save sits on each tab, Amenities has none, and "Edit per channel" marks a form changed with no edit made ().
- Sync failures are a top theme in 618 sales calls (), so every change gets a visible receipt.

**Options considered**
- Today's Save per tab: dropped.
- One queue that waits for Review and push, with versions: dropped in design review.
- Save as the commit, with receipts: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af16458163b059f704859d3a6a">Current-state map</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645818496f9d13c2481a86d">User flows</mention-page>

**Where to see it:** change a field on Booking.com › Listing and Save. [Open the prototype]()
```

---

## KD-16 · Replicate Hostaway's UI and depart only where the model needs it

- **URL:** https://app.notion.com/p/3eee18af164581ca9016ce7928ea3008
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-002, D-005, D-023, D-093, D-926, D-927, D-936, D-937, D-942, D-943, D-944, D-945, D-954, D-955, D-956, D-957, D-958, D-961, D-969, D-970, D-974 · D-969 updated: Getting started is inert too
- **In the prototype:** 

```
**Decision.** The prototype copies Hostaway: its own stylesheet variables as tokens, its typeface, the global sidebar, dropdowns, toggles, segmented controls, chips, Metrics cards and the Add-property wizard. New patterns such as tips, Canvas and field scope enter the design system before any screen uses them. Each departure from today's UI is listed with the screenshot behind it, about twenty, such as drill-downs that slide in as a stack, one Save bar, and Calendar inside the property. In the global sidebar only Properties works; everything else is shown but inert.

**Why**
- Hostaway's product has history, so I designed within it.
- Every departure answers a problem seen in the product (), and the tokens come from Hostaway's public stylesheet ().

**Options considered**
- A new visual language: ruled out by the project's rules from the start.
- Today's UI with no departures: not taken; each listed departure says why it differs.
- A faithful replica with recorded departures: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af1645811087cecfef47d6bfe3">UI changes</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645817899d8edd811bf9212">Heuristic evaluation</mention-page>

**Where to see it:** Listing base › Pricing, where drill-downs slide in as a stack. [Open the prototype]()
```

---

## KD-17 · On phones, every side panel becomes a bottom sheet

- **URL:** https://app.notion.com/p/3eee18af164581e7b09fc51d1473a880
- **Status:** Decided · **Signal:** Weak · **Provenance:** 
- **Records:** D-973
- **In the prototype:** 

```
**Decision.** On phones the property menu hides behind a section bar that names where you are ("Airbnb › Listing") and opens the whole menu in a bottom sheet, with the same groups and tip counts. Tips, Rewrite, field panels and Hub drawers become bottom sheets; complex edits get a full-screen sheet; multi-step flows such as the strategy wizard stay full pages. Tap targets are at least 44 px and inputs 16 px. On tablets an icon sidebar stays and the menu slides over. The same build also runs as an installable phone app.

**Why**
- Side panels on a phone "have to be a bottom sheet" (my design review).
- The earlier right-hand drawer sat behind an unlabelled "···", and nobody found it (my design review).
- Tapping where you are to jump anywhere is familiar from Linear, GitHub and Notion on mobile (), and the shell follows Hostaway's own mobile web app ().

**Options considered**
- Desktop side panels, and a right-hand drawer for the menu: dropped.
- A section bar and bottom sheets everywhere: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af164581daa8b7f210cb1c6f4e">Mobile & tablet</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645814fbc15f0a668dc4632">Design system</mention-page>

**Where to see it:** the app view, drawn in a phone frame on a desktop. [Open the prototype]()
```

---

## KD-18 · Label what is simulated, and plan the tests rather than fake results

- **URL:** https://app.notion.com/p/3eee18af164581339fabf0591e5d7f9c
- **Status:** Decided · **Signal:** Moderate · **Provenance:** 
- **Records:** D-003, D-043, D-101, D-108, D-121, D-976, D-998 · test plan: D-041, D-042, D-992, D-994, D-995, D-996 · D-976 replaced the prototype's provenance footer
- **In the prototype:** 

```
**Decision.** No research was run with real hosts. The interviews and data review were simulated to show the method, written to a published spec and always labelled . Every test (tree test, concept test, usability, A/B, pilot) is planned, not run, and no result is shown for any of them. Stakeholder answers are never simulated. They stay open questions. The prototype carries no provenance labels. Provenance lives in this workspace, the deck and the repo.

**Why**
- Simulated research shows the method, and it is legitimate only when it is labelled (project rule).
- A simulated test can't show whether a host understands a screen, so the prototype was not changed to answer invented findings. I chose to project the tests I would run instead.
- Provenance belongs in the case study, not on screen, so the prototype carries no simulated label.

**Options considered**
- Simulate test rounds and change the design from them: dropped.
- Plan only, with no simulated research at all: dropped, because the method wouldn't show.
- Simulate early research, label it, and plan the real tests: chosen.

**Rests on:** <mention-page url="https://app.notion.com/p/3eee18af164581e3a9faf5f1f8e138f3">02 · Research</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645819096ffef972af24f70">User interviews</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af164581b1958cc8edfcf3dcfe">Test plan</mention-page> · <mention-page url="https://app.notion.com/p/3eee18af1645819282b2f11c14720c03">Research questions & assumptions</mention-page>

**Where to see it:** nowhere on screen, by design. [Open the prototype]()
```

---

## Where a record and the build disagreed (the build wins)

| Record or spec | What the build does | Row |
|---|---|---|
| D-129, D-919, NARRATIVE: one queue, Review & push, review per channel | Save is the commit and sends with a receipt | KD-15 |
| notion-v2 SPEC §6: "each change is sent with a receipt and Undo" | Undo exists on an accepted tip; a saved section has a receipt but no Undo (Discard works before Save) | KD-15 (title changed) |
| D-917, D-980, NARRATIVE: "Suggest or Autopilot", autonomy dial (D-025, D-126) | Autopilot off or on per channel; prices, rules and policies always ask | KD-08 |
| V3-SPEC (round 3): Booking.com description editable per channel | Booking.com summary/description read-only, "Booking.com decides" | KD-04 |
| D-950, memory rule: strategy history, "Replace with a previous strategy" | No versions; Replace starts a new strategy (D-962) | KD-06, KD-07 |
| D-951/D-952: compare mode, PriceLabs/Wheelhouse pattern | One baseline before the strategy; no compare, no public refs left in Performance.tsx | KD-07 |
| D-949: "Base and locked fields show none" | A tip dot can show on a field that uses the Base; Rewrite never does | KD-10 |
| D-969 and SPEC §6: Properties and Getting started live | Only Properties navigates; Getting started is inert | KD-16 |
| D-127: when on, a Suggestions group in Needs you and an AI panel in The home | When on, the rail gains Smart Listings › Strategy, Performance and channel pages get tips | KD-05 |
| Demo seed | Airbnb runs on Autopilot by default, so its Listing is read-only; KD-10 links with `&autopilot=0` | KD-08, KD-10 |
| Brief/SPEC: Angle A "planned, not done" | Earlier import and first-time-setup screens are still in the code (`/import`, and a first-time account's Overview); Getting started is inert, so the default walkthrough never reaches them | KD-01 |
