# tools/

Run from the repo root. Node lives at `/opt/homebrew/bin/node` — if `node` isn't found, `export PATH=/opt/homebrew/bin:$PATH` first.

| Command | What it does |
|---|---|
| `node tools/audit.mjs` | Requirements coverage + guardrails → `plan/audit/AUDIT-<date>.md`. Exit 1 on errors. Run by S18 daily and at the end of S00, S07, S17, S19. |
| `node tools/manifest.mjs <dir> [--out file]` | Fingerprints a folder (sha1, size, path). S00 used it on `~/Developer/process-deck`; `audit.mjs` re-checks the newest manifest so we can prove the original deck was never touched. |

What the audit checks: ledger format and statuses · Done rows have evidence · Open rows whose owner sessions are Done · deck slide count ≤ 50 · slides missing `data-req`/`data-notion` · Standard-path A/B share ≥ 70% (slides carry `data-path="S|St|E"` and `data-angle="A|B|both|none"`) · R-/SCR- references in the prototype · `process-deck` unchanged · no path from `deck/` to process-deck or the website.
