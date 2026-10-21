# AI patterns · interaction rules

> S02 · R-154. How AI shows up in Hostaway, next version. Components: `ds/components/index.html#ai-panel` onward. Thesis this serves: *host in the loop* (MASTER-PLAN §2.3, §6.4).

## 1 · Extend the language Hostaway already has

Hostaway already speaks "AI" in four places (): the lavender **Dynamic Pricing · New** card (HS-30), the **sparkle** glyph in the sidebar footer (HS-22), **Ask the AI** in the Knowledge Hub (HS-42) and the **Onboarding assistant** button (HS-48). We extend that; we don't import another product's AI look (D-020).

**The assistant is the assistant (KD-20).** Hostaway's own AI assistant is **The assistant**: it answers hosts' business questions across the portfolio, writes smart replies and shows what's working (hostaway.com, captured in `research/references/hostaway-marketing/02-…` and `06-…`). It is marked with the **sparkle**, purple on lavender, the same glyph as the sidebar footer. Smart Listings doesn't add a second assistant; it expands the assistant into the listing. So every AI surface in this system uses the assistant's sparkle (`Icon name="sparkles"`) and its purple-on-lavender roles below: the Tips button, each field's tip marker, the Tips panel and the Smart Listings nav item. Rewrite with AI keeps the same sparkle in Hostaway orange, because the host starts it (D-939). Never give the listing AI its own name, mascot or icon.

| Element | Token | Rule |
|---|---|---|
| AI surface | `--color-ai-surface` (grape-lighter #f6f0ff) | anything the AI *wrote or proposes* sits on lavender until the host accepts it |
| AI title | `--color-ai-title` (grape-darker) | headings on AI surfaces |
| AI body | `--color-ai-text` (secondary-700) | 6.45:1 on lavender; Hostaway's own #9571c3 (3.47:1) stays only in the replica of the existing card |
| AI glyph | `--color-ai-sparkle` / `--color-ai-accent` | sparkle icon, strength meter, autonomy track |
| The decision | `--color-action-primary` (raspberry) | **Accept** is always the ordinary primary button — accepting AI is a normal host action, not an AI action |
| After accept | success green | the lavender goes away; the source chip becomes "✓ Accepted" |

Lavender means "not yours yet". Once accepted, the content is the host's and looks like the rest of the page.

## 2 · When the AI speaks

- **On request** — the host clicks "Suggest titles", selects text (selection toolbar), speaks (voice sheet), or opens the AI panel.
- **At natural checkpoints** — after import (reconcile), when a fact changes (projections need rewriting), or when a comps signal crosses a threshold (insight card). Maximum one unsolicited suggestion per screen; the rest go to a digest.
- **Never** mid-typing, never as a modal, never with a sound, never on a screen the host opened to do something else unless it blocks that task (e.g. a channel will reject the title).

## 3 · Every AI output carries five things

| | What | Component |
|---|---|---|
| **Why** | the reason, in one line, with its evidence: facts used, comps, a rule of the channel | `h-ai-suggest__why`, `h-ai-panel__why`, comps block |
| **Where** | which channel(s) it will change | `h-channel-chip` on every suggestion |
| **Confidence** | high / medium / low, with the cause of low confidence stated ("only 3 comparable listings on Vrbo") | `h-confidence`, `h-strength`, `h-ai-state--low` |
| **What changed** | a diff against the current live value, never just the new text | `h-diff`, `h-diff-card`, `h-diff-split` |
| **Undo** | one click back to the previous version; every channel's import is version 0 and is never deleted | toast Undo, `h-versions`, `h-blame` |

If any of the five can't be shown, the suggestion isn't shown.

## 4 · Nothing publishes without a level the host chose

- Autonomy is a **dial per field group** (titles & descriptions · photos order · amenities highlights · pricing), not a global switch: **Suggest** → **Auto-apply with review** (24 h window) → **Autopilot** (D-025).
- Default is **Suggest** for everyone. Persona modes may *propose* a higher level (P3 portfolio: Auto-apply with review for descriptions), shown as a recommendation the host confirms — never silently set.
- **Autopilot is never a default** and is never offered for facts (rules, fees, check-in times, amenities). Facts come from the host or an import; AI may *derive* a fact ("AI-derived" chip) but it stays unconfirmed until the host confirms it.
- Every auto-applied change raises an **autonomy notice** ("AI updated the Vrbo description under Auto-apply with review · goes live in 23 h · Review · Undo") and appears in the version timeline with the AI as author.
- Channel constraints are enforced *before* a suggestion is shown (length limits, banned words, fields a channel doesn't accept — S03's channel-constraints table). A suggestion that a channel would reject is marked "too long for Airbnb", never offered as the recommendation.

## 5 · States

| State | Looks like | Copy pattern |
|---|---|---|
| Generating | lavender skeleton + breathing sparkle | "Reading 12 similar listings…" (say what it's doing) |
| Ready | recommended option first, alternatives below, each with chars/limit + strength | — |
| Low confidence | amber note above the options | "Only 3 comparable listings on Vrbo nearby. Treat these as a starting point." |
| Failed | red note, nothing changed | "Couldn't generate suggestions. Your listing hasn't changed. Try again" |
| Accepted | green "✓ Accepted" chip, sync state pending → in sync | "Live on Booking.com in ~2 min" |
| Rejected / dismissed | card leaves; the dismissal is remembered for that field + channel | — (no confirmation dialogs) |

## 6 · Disclosure language

- Name the actor plainly: **"AI draft"**, **"AI-derived"**, **"AI updated…"**. Not "magic", "smart assistant", or a persona name.
- Say what it used: "Based on your facts and 12 similar Airbnb listings in Neukölln."
- Say what it didn't do: "Nothing changes until you accept." / "Your listing hasn't changed."
- Guests are never told a description was AI-written unless a channel's policy requires it; the host is always told (version timeline author = AI).
- Prototype sample data (listing copy, comps, market numbers) is and says so in the footer (CONVENTIONS §2).

## 7 · Do / don't

| Do | Don't |
|---|---|
| Put AI output on lavender until accepted | Tint accepted content lavender forever |
| Use the raspberry primary for Accept | Make a purple "AI Accept" button |
| Show the diff against what's live | Show only the new text |
| Show the channel on every suggestion | Offer "apply to all channels" as the default for voice/copy |
| Let hosts refine in their words (chips, input, voice) | Force a regenerate to change one word |
| Keep version 0 of every channel forever | Overwrite imported originals |
| Explain low confidence with its cause | Hide low-confidence suggestions without saying why |
| Offer one unsolicited suggestion per screen | Stack multiple AI promo cards on one page |

## 8 · Ask, don't assert — the question card (D-090, D-106)

When the AI would need a fact the home's record doesn't hold (Wi-Fi speed, a balcony one channel lists and another doesn't, a licence number), it **asks** instead of writing around it or guessing. This is the grounding rule of principle 4, "The AI says only what the home can back" (`concepts/PRINCIPLES.md`, D-085), made concrete.

| | Rule |
|---|---|
| **When** | The AI's draft would state or imply a fact with no source; channels disagree on a yes/no fact nobody has confirmed; a channel requires a field that's empty. |
| **Look** | `h-ask` on the AI's lavender (`--color-ai-surface-subtle`), sparkle-family help icon, label "Question from the AI". Never amber or red: a missing fact is not an error. |
| **Copy** | One question, in the host's words ("Is there a balcony?"). One line of why, including where it matters ("Booking.com lists one; Airbnb doesn't"). Say what the AI won't do meanwhile ("I won't mention it anywhere until you confirm"). |
| **Answers** | One-tap answers for yes/no and known options; a short input for values; always a way out ("Ask me later" / "I don't know" / "Leave it out"), which keeps the fact absent and the copy silent about it. |
| **Blocking** | Only when a channel *requires* the field to publish (`h-ask--blocking` + `h-ask__blocks`: "Vrbo won't accept the listing without it. Nothing else is held up."). Scope the block to that channel. |
| **After** | The answer becomes a fact with source "Added by you" (`is-answered`), updates every projection that uses it, and the card collapses into the record (motion M-02). "Ask me later" moves it to the digest; it never re-asks in the same session. |
| **Where** | Inline in the fact row, inside the AI panel above the suggestions it affects, in a conversation bubble (`h-msg--ai`), or in a portfolio batch ("3 homes don't say whether pets are allowed"). |
| **Don't** | Show a suggestion that asserts the unknown fact with a warning attached; ask more than one question at a time on a screen; ask what an import already answered. |
