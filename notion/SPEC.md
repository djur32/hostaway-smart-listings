# Notion v2 · the condensed workspace (spec, binding for every writer)

review's ask, in short: the first Notion workspace is too big to read (19 databases, hundreds of rows, one decision card per D-###, whole stages crammed into one page). Build an **entirely new, parallel workspace** that someone joining the project can read from the page tree alone. Less content, clear outputs, methods separated from outputs, each output on its own page, done vs projected obvious, everything cross-referenced, **Smart Listings only**. The old workspace stays untouched.

**Source of truth: the live prototype** (https://hostaway-case-djur32.vercel.app, code in `prototype/src`). When a research, IA or concept file disagrees with the prototype, the prototype wins. Say in one line what changed and why, never re-argue it.

---

## 1 · The tree

```
✨ Hostaway · Smart Listings                 hub: the story in six steps, the solution in one picture, how to read, links
├── 📌 00 · Brief & scope                      one page, no children
├── 🔍 01 · Discovery
│     Methods:  Product audit ✅ · Desk research ✅ · Stakeholder interviews 🔭
│     Outputs:  Current-state map ✅ · Heuristic evaluation ✅ · Channel constraints ✅ · Competitive analysis ✅ · Design references ✅ · Research questions & assumptions ✅
│               Design references › Concept direction references · Final design references · Knowledge Hub references · Mobile references (197 Mobbin screens, private)
├── 🧪 02 · Research
│     Methods:  User interviews 🔭 · Data analysis 🔭 · Card sorting 🔭
│     Outputs:  Interview synthesis 🧪 · Card sorting results 🧪 · Insights 🧪 · Personas 🧪 · Jobs to be done 🧪 · Problem statement 🧪
├── 🗺️ 03 · Information architecture
│     Methods:  Tree testing 🔭
│     Outputs:  Object model ✅ · Navigation options ✅ · Sitemap ✅
├── 💡 04 · Concepts
│     Methods:  Concept testing 🔭
│     Outputs:  Design principles ✅ · Concept directions ✅ · Final concept ✅
├── 🎨 05 · Design
│     Outputs:  Solution overview · User flows · Strategy & performance · Tips & AI rewrite · Listing base & channels ·
│               Canvas preview · Knowledge Hub · Mobile & tablet · UI changes · Design system (all ✅)
├── 📏 06 · Test & measure
│     Methods:  Test plan 🔭
│     Outputs:  Goals & KPIs 🔭 · Pre-mortem 🔭
├── 🧭 07 · Systems & next
│     Outputs:  Second-order effects 🔭 · Roadmap 🔭
└── 📒 Decision log                            one small database, 20 key decisions (KD-01…KD-20)
```

**Naming.** Page titles are plain, standard method or output names ("Heuristic evaluation", "Card sorting", "Personas"), with no "Method ·" / "Output ·" prefix. On every section page the two columns are titled exactly **Methods** and **Outputs**.

Page URLs: `plan/notion-v2/map.json` (slug → URL). Use them for every cross-reference.

## 2 · Icons and status

**Icons mark the type of page:** 🔭 every method, ✅ every output (page icon and the icon of its top callout). Section pages keep their own emoji.

**Status lives in the first line of each page**, as words:

| Status | Means |
|---|---|
| **Done** | Real work on real sources: the brief, the product (screenshots, trial account), public docs, the prototype. |
| **Sampled** | A labelled sample standing in for research I'd run with real hosts; not evidence. |
| **Planned** | Not run. The page says how I'd run it and what I'd look for. No results. |

Provenance labels (+ URL · ) still go on every chart, quote and number (CONVENTIONS §2).

**Honesty rule.** Interviews, the card sort, the data review, the tree test and the concept test **were not run with real hosts**. Their method pages say so in the first line. User interviews are planned with about 25 hosts; the five simulated interviews are the sample, not the plan. Where a simulated rehearsal taught something (tree test, concept test), it is told under a callout labelled "Sampled · simulated rehearsal, not evidence": the plan with real hosts → what the simulated run showed → the insight → the decision it led to. Sampled outputs say "Sampled · simulated" in the callout and never present a simulated number as a finding about Hostaway. Never invent a new number, quote, reference or persona detail that isn't already in the repo (memory: only use inputs review supplied). If a page needs something that doesn't exist, write "Not recorded" rather than filling it.

## 3 · Page templates

Every page is short: an output reads in about two minutes (≈ 250–550 words plus tables/images); a method page ≈ 200–400 words. Prefer tables, columns and one good image over paragraphs. Detail only where it matters.

### Section page (01 … 07)

```
<callout icon="<section emoji>" color="gray_bg">
	**In one line:** what this stage found and how it shaped Smart Listings.
</callout>
## What came out of it        ← 3–5 bullets, plain sentences, the thread to the solution
<columns>
	<column>  ### Methods   ← the method child pages, each with its status icon
	<column>  ### Outputs ← the output child pages
</columns>
## Decisions made here        ← 2–4 mentions of KD rows, one line each
---
Builds on ← previous section · Feeds → next section       (mention-page)
```
The child pages are placed **inside the columns** (move their `<page url>` blocks there with `replace_content`, keeping every existing child `<page>` tag so nothing is deleted).

### Output page

```
<callout icon="✅|🧪|🔭" color="gray_bg">
	**Output · Done** (or Sampled / Planned) · one line on what this is. Provenance: .
</callout>
![snapshot](…)                ← the output itself, if there is a picture of it
## The short version          ← 3–5 bullets
## …body…                     ← tables, columns, images; only what a reader needs
## How it was made            ← 1–3 lines + mention of the method page
---
**Builds on** · **Feeds** · **Decisions** (KD mentions) · **In the prototype** (link, Design pages) · **Files** (repo paths, gray)
```

### Method page

```
<callout icon="✅|🔭" color="gray_bg">
	**Method · Planned** · Not run. This is how we would run it.   (or **Method · Done** · what was actually done)
</callout>
## Why this method
## How we'd run it            ← who, how many, how, instruments (a table works well). No calendar dates.
## What we'd look for         ← the questions it answers, tied to the riskiest assumptions
## What it produces           ← mention of the output page(s)
```

## 4 · Writing rules

1. **Smart Listings only.** Angle A (import / first-time setup) was planned and not done. It appears only in 00 · Brief & scope ("not done, and why") and in 07 · Roadmap (as a next step). Leave out import-only material (import funnel, micro-survey at import, reconcile screens, go-live, "As imported" originals). Keep research only where it informs Smart Listings, the Listing base vs channels model, or the Knowledge Hub.
2. **No dates.** No "30 Sep", "3 Oct", no "third review", no timelines with dates, no session codes (S05, S11), no "G3 pending". Write "in design review" or "review chose" instead.
3. **Few IDs.** Don't fill pages with D-###, E-###, I-##, HE-##, H-##, Q-##, K-## codes. Use plain names and Notion mentions. Original D-### codes appear only in a decision row's *Records* property. A short code is fine where it labels a row in a table the reader scans (e.g. KPI names), never as the explanation.
4. **Cross-reference** with `<mention-page url="…">` to the pages in `map.json`, and to decision rows (`KD-##`). Each page links back to what it builds on and forward to what it feeds, including across sections (a Design page cites the research insight and the IA model it rests on).
5. **Voice:** first person singular. This is review's own concept and there is no team: write "I", "my", "me", never "we", "our" or "us", and never "Antonio" in the third person. Where "we" would mean the company, name Hostaway. Exceptions: Hostaway's verbatim brief, quoted host speech, product copy, and the method name "How might we". A design presenting to leadership. Plain, specific, confident about what is known, explicit about what isn't. No hype words ("seamless", "delightful", "revolutionary"). Short sentences. Sentence-case headings.
6. **Images:** upload real snapshots of the output (prototype screens from `plan/notion-v2/shots/`, charts from `research/charts/`, concept frames from `concepts/**/png`, current-state screenshots from `Hostaway Screenshots/` via `research/current-state/INDEX.md`). Caption each with what it shows and its provenance. One to four images per page; no galleries of twenty.
7. **Notion syntax:** read `notion://docs/enhanced-markdown-spec` once (via the Notion fetch tool) before writing. Tabs for indentation inside callouts/columns/toggles. Escape special characters outside code.
8. **Keep a copy:** save the final Notion-flavoured markdown of every page you write to `plan/notion-v2/pages/<slug>.md` (image tags may reference the upload's markdown). This is the repo record.
9. **Write only your own pages.** Don't edit other writers' pages or the hub.

## 5 · How to upload an image (verified)

1. Load the tool: `ToolSearch` → `select:mcp__73122543-3084-4efc-8882-d8126c9984a2__notion-create-file-upload`.
2. Call it with `{ "filename": "name.png" }`. It returns `file_upload_id`, `upload_url` and `upload_headers` (one `authorization` header).
3. POST the file: `curl -s -X POST "<upload_url>" -H "authorization: <value>" -F "file=@/abs/path/name.png"`. The response says `"status":"uploaded"`. Uploads expire after about an hour if unused, so upload just before writing the page.
4. In the page content write `![Caption with provenance](file-upload://<file_upload_id>)`. One upload per image use (don't reuse an id on two pages). PNG/JPG; convert `.webp` with `sips -s format png in.webp --out out.png`. ≤ 20 MiB.
5. **Never round-trip image URLs.** A fetched page shows images as expiring S3 links. Write each page in one `replace_content` with all its images as `file-upload://` sources. To change a page that already has images, use `update_content` on text only, or re-upload every image and replace the whole page.
6. Notion rate limits: if a call fails with a rate-limit or 429-style error, wait 30–60 s and retry; don't hammer.

## 6 · The solution as built (reflect this everywhere)

**One paragraph.** Smart Listings makes Hostaway's listing management per channel without repeating work. Listing details live once, in the **Listing base** (the Details, Pricing and Availability every channel lists). The **Knowledge Hub** reads those details without copying them, adds what they don't say (the situations behind a rule, such as what a host does when X, Y or Z happens), and learns from guests' questions in the inbox. Each **channel** (Airbnb, Booking.com, Direct) has its own pages (Listing, Pricing, Availability, Booking policies) where a field is one of four cases: it **uses the Base**; it is **customised for that channel**; it exists **only on that channel** (e.g. Check-in method, "Airbnb only"); or it is **set by the channel**, something the host can't change (Booking.com writes its own description from the property's facts, so it is read-only, shown as "Booking.com only" with a lock whose tooltip says why). **Smart Listings** is opt-in per property: a **strategy per channel** (goal, audience, guardrails, Autopilot on or off), made in a full-screen wizard, produces **tips** in one docked panel on the channel's pages, each with its *why* and sources (similar homes, Knowledge Hub facts); the host accepts or dismisses them, or uses **Rewrite with AI** on a field without a tip. A **Canvas** shows each channel's real guest page and opens the field you tap. **Performance** shows whether the strategy worked against the same period before it started. Save is the commit, and each saved change goes out with a receipt (an accepted tip can be undone).

**Built on the assistant (KD-20).** Smart Listings' AI is not a new assistant: it is Hostaway's existing **The assistant** (sparkle, purple on lavender; hostaway.com, sidebar footer), expanded from answering questions to working on the listing. Say so wherever the AI appears; never give the listing AI its own name or icon.

**The story in six steps** (the hub tells it; each section page connects to its step):
1. **Today** (): the Knowledge Hub keeps its own copy of the listing, repeats it, and answers guests from that copy, while no one sees what guests ask (KH-REFRAME.md). No screen shows one listing on one channel; "Edit per channel" is scattered across about 15 fields; the only listing AI is Airbnb's Opportunities.
2. **Channels differ** (): each has its own limits and rules; Booking.com writes its own description.
3. **What hosts vary per channel** (illustrative research): money and stay rules much more than words. So tips must cover pricing, availability and policies, and per-channel voice is a choice, not a default.
4. **The model**: facts once, in Shared; each channel holds only what differs (channel-first menu: Shared first, then one group per channel).
5. **Smart Listings**: a strategy per channel turns into tips, with their why, in context, accepted or dismissed by the host; Canvas to see it as guests do; Performance to see if it worked.
6. **Next**: test with hosts, measure, then import (Angle A) and optimisation over time (Angle C).

**Property menu (as built, `prototype/src/shell/PropertyLayout.tsx`):** Overview · **Shared** (Listing base › Details, Pricing, Availability · Knowledge Hub › Questions, Insights, Facts, Sources · Calendar · Guest experience · Operations · Smart Listings › Strategy, Performance, shown when it's on) · **Channels** (Airbnb · Booking.com · Direct, each › Listing, Pricing, Availability, Booking policies, with a tip count per page). Guest experience and Operations are out of scope placeholders. The global sidebar is Hostaway's; only Properties navigates (Getting started and the rest are shown but inert).

## 7 · The decision log (KD-01…KD-20)

One database, `📒 Decision log`, under the hub. Properties: `Name` (title, "KD-## · decision in a sentence") · `Area` · `Stage` · `Status` (Decided / Proposed / Open) · `Signal` (Strong / Moderate / Weak / Hypothesis, CONVENTIONS §2) · `Provenance` · `Records` (the original D-### it condenses, text) · `In the prototype` (URL). Body, ≤ 200 words: **Decision** · **Why** (2–3 bullets) · **Options considered** · **Rests on** (mentions) · **Where to see it**.

Rows are listed in `map.json` under `decisions`. Section pages cite 2–4 of them; output pages cite the ones they embody.
