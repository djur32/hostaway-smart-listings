# Concept scores · which numbers Notion shows (4 Oct)

**Antonio's call** (OPEN-QUESTIONS #12, "homogenize and do what's best"): show the round-one scores as they were **before** the simulated rehearsal. They are my design judgement (`ASSUMPTION`), not host evidence. The rehearsal is told once, on Testing, as plan → simulated run (labelled `SIMULATED`) → insight → decision.

**Source.** `concepts/convergence/evaluate.py` has the hand-scored matrix `S` and a list of four rehearsal edits, `ADJUSTMENTS`. The pre-rehearsal set is `S` as written, without `apply_adjustments()`. The repo's outputs (`evaluation.md`, `per-screen.csv`, `results.json`, `heatmap.*`, `criteria-heatmap.*`, `DECISIONS.md`) all hold the **post**-rehearsal numbers, and I didn't change them. Don't run `main()` to get these numbers: it applies the edits and overwrites the outputs. Import the module and call `screen_score` / `overall` instead.

## The set the deck now shows (cn-grid › Frames and scores › Scores)

These are weighted scores out of 5, on the three listing screens. Chip: `ASSUMPTION`. Caption: "made before any concept test, not host evidence".

| Direction | Knowledge Hub (SCR-03) | Listing studio (SCR-04) | Portfolio (SCR-05) |
|---|---|---|---|
| Channel Canvas (C1) | 2.60 | **3.54** best | 2.40 |
| Decision Inbox (C4) | 3.04 | **3.12** (was 3.20) | **3.89** best |
| Golden Record (C2) | 3.14 | 2.83 | 3.25 |
| Copilot (C3) | 2.46 | 3.31 | 2.71 |
| Merge & Versions (C5) | 2.87 | 3.19 | 2.91 |
| Fact Blocks (C7) | **3.26** best | 2.76 | 2.90 |
| Home Tour (C8) | 2.85 | 3.02 | 2.69 |

Only one cell differs from the repo's post-rehearsal set: Decision Inbox × Listing studio, **3.12 before → 3.20 after**. The rehearsal raised the P2 (SEO optimizer) fit on that screen from 1 to 2. The winner of each screen, the pair and the ranking don't change.

## What Notion should show

- **Concept directions** (`04-concepts__o-directions`). It shows no score numbers today, only "the pair rests on my weighted scores (ASSUMPTION), not host evidence". That matches the deck, so no change is needed. If a scores table is added, use the table above, chip `ASSUMPTION`, and never 3.20.
- **Final concept** (`04-concepts__o-converged`). It has no scores. No change.
- **Concept testing** (`04-concepts__m-concept-test`), if it is rewritten to tell the rehearsal (Antonio's answer #5). Say it moved **four cells in all**. Only **one** of them is on a listing screen the deck shows: Decision Inbox, Listing studio, P2 fit 1 → 2, screen score **3.12 → 3.20**. The other three are on Connect and Reconcile, which is first-time setup and out of scope: Canvas · Connect · P4 4 → 3, Canvas · Reconcile · control 4 → 3, Copilot · Reconcile · P1 5 → 4. The rehearsal changed no ranking, no screen winner and not the pair. Label it `SIMULATED`. Tell it here or on Testing, not on the Concept pages.
- **Any decision row that quotes the evaluation** (D-120 / D-122 in the older workspace, KD rows). Use the pre-rehearsal headline numbers below, or say "after the simulated rehearsal" next to the post numbers:

| Number | Before (design judgement, show this) | After the rehearsal (repo today) |
|---|---|---|
| Decision Inbox, overall (5 screens) | 3.70 | 3.72 |
| Channel Canvas, overall | 2.95 | 2.91 |
| Copilot, overall | 3.05 | 3.04 |
| Ranking | C4 > C2 > C3 > C1 > C5 > C7 > C8 | same |
| Canvas + Inbox, hybrid potential | 3.80 | 3.80 |
| Canvas + Inbox, persona floor | **3.66** | 3.44 |
| Canvas + Inbox best pair, weighting scenarios | 8 of 11 | 8 of 11 |
| Decision Inbox wins, random weightings | 92.4% | 94.0% |
| Canvas + Inbox best pair, random weightings | 48.5% (next: Copilot + Inbox 15.6%) | 47.0% (next: Inbox + Fact Blocks 16.9%) |
| Decision Inbox wins under ±1 noise | 100% | 100% |
| Persona fit that moves | Canvas P4 3.7 · Inbox P2 1.8 · Copilot P1 4.2 | 3.4 · 2.0 · 3.9 |

**Not in Notion, and it shouldn't be.** The two connect-and-reconcile columns (SCR-01, SCR-02) are first-time setup, which is out of scope, so neither the deck nor Notion shows them. If they are ever needed, the pre-rehearsal values are: Canvas 2.84 / 3.13, Golden Record 3.20 / 3.41, Copilot 3.22 / 3.38, Inbox 4.12 / 4.35, Merge & Versions 2.85 / 2.68, Fact Blocks 2.62 / 2.76, Home Tour 2.86 / 2.70.

**Heatmap images.** The deck draws its heatmap inline (a `matrix` chart), so no image was regenerated. `concepts/convergence/heatmap.png` and `criteria-heatmap.png` still show the post-rehearsal numbers. Don't upload them to Notion as they are.
