# Deck × Notion v2 review · shared brief (read-only phase)

Antonio's ask (4 Oct): "For the content from Discovery to Testing, follow the new Notion workspace (Hospitable · Smart Listings) and link every slide to somewhere in it, related to the slide's content. Go through all of it thoroughly and see whether the narrative should change, what to tell, and which elements to change. The presentation mechanics are right; this is about the narrative of how everything was done. Make everything cohesive."

This phase is **read-only**. You write one report file and nothing else. No edits to `deck/`, `prototype/`, Notion or the plan. No git.

## Sources
- **Notion v2, local copies** (identical to live as of 3 Oct 22:24 UTC): `plan/notion-v2/pages/*.md`.
  - Page URLs: `plan/notion-v2/map.json`, with keys `sections`, `pages` (by section, then `m-` for methods and `o-` for outputs), and `decisions` (KD-01…KD-19).
  - Its writing spec: `plan/notion-v2/SPEC.md`. Read §2 (status legend), §4 (writing rules) and §6 (the solution as built).
  - The Decision log rows are in `plan/notion-v2/pages/decisions.md` and `kd-19.md`.
- **The deck:** `deck/src/slides/NN-*.html`.
  - Each `<section class="s" data-id="…">` is one slide.
  - Inside a slide, `<template class="more">` holds a detail pop-up, and `<aside class="notes">` holds the speaker notes.
  - Part CSS and JS sit next to the HTML. Read the HTML, the templates and the notes.
- Optional context: `research/`, `ia/`, `concepts/`, `plan/REQUIREMENTS.md`. Use them only to settle a conflict.

## Antonio's standing rules for the deck (binding; do not propose anything that breaks them)
1. **Smart Listings only (Angle B taken further).**
   - Never present onboarding, setup or import as his work.
   - Never write "Angle A/B/C" on a slide.
   - Import may appear only as a future step.
2. **Marketing voice, first person "I".** It is a feature launch, tangible and concise. Slides hold ≤ 110 words; detail pop-ups ≤ 90.
3. **Provenance only where a slide shows research data.** No "Assumption" chips. Footers are plain words, never file paths or IDs.
4. **Things Antonio set explicitly in the deck, which win over Notion unless he says otherwise. Flag the conflict; don't "fix" it:**
   - The research was *sampled*, not run: five sampled interviews and a card sort. With real access he'd run **about 25 interviews**.
   - The deck's status words are Done / Sampled / Planned. Notion's are Done / Illustrative / Projected.
   - The field model in the deck is three cases: **uses the Base · custom for one channel · a channel-only field** (for example "Check-in method · Only on Booking.com"). He removed "Set by Booking.com" from the deck's field model. Notion and the prototype still say "set by the channel (Booking.com writes its own description, read-only)".
   - The Intro goals slide (`op-goals`) has five goals: each channel earns more (baselined on bookings Hospitable already has), adoption, hosts keep refining, tips accepted out of shown, and fewer listing and sync tickets, each with 30 and 90 day targets. Notion KD-19 makes "time to adjust" the north star.
   - IA is not its own section in the deck. It folds into Research as "What it became".
   - Autopilot is optional; the host chooses the autonomy. Each strategy is tracked over time, before and as it evolves.
5. **Honesty.** Never invent a number, quote, reference or persona detail. Anything simulated must be labelled. Notion KD-18 says "plan the tests rather than fake results".

## What to produce
One file: `plan/notion-v2/deck-review/<your-part>.md`, with these sections.

### 1. Links
A table with one row per slide in your part:

| slide id | best Notion page (title) | URL | why this page |
|---|---|---|---|

- Prefer the **most specific** page: an output, method or KD row over a section page.
- Every slide gets a link, including title and closing slides. Use the hub or `00 · Brief & scope` where nothing narrower fits.
- Take URLs only from `map.json`. Never invent one.
- Also give each slide's **detail pop-up** a link if a different page fits it better.

### 2. Conflicts
Every place the slide (or its notes or pop-up) says something different from Notion: numbers, claims, status, names, method counts, the field model, test results, KPI framing.

For each conflict give:
- the slide id;
- the slide's wording, quoted short;
- Notion's wording, with the page;
- which side is right, and why (the prototype is Notion's source of truth; Antonio's explicit deck rules win in the deck);
- whether this is a **flag for Antonio** (a rule-4 item, or a narrative choice) or a **fix** (a plain error).

### 3. Missing story
Content in Notion that the deck doesn't tell and that would strengthen the narrative of how the work was done. For example:
- a method or output the deck never shows;
- a decision (KD) with no slide;
- a "what I didn't do" honesty point.

Rank them by value and keep to the strongest five. For each, say which slide it belongs on, or whether it needs a new slide. Prefer folding into existing slides; the deck is capped at 50 slides and is full.

### 4. Proposed edits
Concrete, ready-to-apply wording changes per slide: headline, message, bullets, footer, notes and pop-up. Respect the word limits and the voice.
- Mark each edit **must** (it fixes a conflict that is a plain error), **should** (cohesion with Notion) or **could**.
- Quote the current text and give the replacement.

### 5. Narrative note
Three to six sentences on whether your part's story matches Notion's "story in six steps" (`hub.md`) and the section page's "In one line". Say what one change would make it read best.

Keep the report tight and scannable. Quote short. No preamble.
