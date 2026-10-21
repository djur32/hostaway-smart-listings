# prototype/ · Hospitable · Listing Management II

Hi-fi, interactive prototype that replicates Hospitable's UI. It uses the converged direction (`concepts/convergence/DIRECTION.md`, **D-123, Proposed pending G3**) on the recommended IA (`ia/recommendation.md`, D-110).
S09 built the scaffold (D-128). S10–S14 build the screens.
**Sample data is illustrative (`SIMULATED`)**; the footer says so once. Every page is `noindex`.

## Run

```bash
cd prototype && npm i && npm run dev
```

Opens on **http://localhost:5174**. From Claude Code, `preview_start` → `prototype` (`.claude/launch.json`).

| Script | What |
|---|---|
| `npm run dev` | Vite dev server, port 5174 (strict) |
| `npm run build` | `tsc` + production build → `dist/`. For the Vercel sub-path (S19, D-005): `PROTO_BASE=/prototype/ npm run build`, plus a rewrite `/prototype/(.*) → /prototype/index.html` |
| `npm run check` | Typecheck + **no raw colours** in `src/` (`tools/check-no-raw-colour.mjs`) |

Node: `export PATH=/opt/homebrew/bin:$PATH` on this machine.

## How it's put together

```
prototype/
  index.html               noindex · <body class="h-root">
  src/main.tsx             imports ../ds/fonts/fonts.css, ../ds/tokens.css, ../ds/components.css (never copied)
  src/routes.tsx           every route, with its owner in a comment
  src/ds/                  React ports of the DS: primitives · record (fact row, source, sync, override) · ai (question,
                           suggestion, decision card, autonomy notice, push tray) · shell (sidebar, IA-R rail, header, tabs)
  src/shell/               AppShell (sidebar + provenance footer) · PropertyLayout (rail) · Placeholder
  src/data/                types · canonical (reads ../ia/canonical-fields.csv at build) · ia (rail + where facts live) ·
                           scenario (the property, decisions, questions, suggestions, listings, photos, versions) ·
                           portfolio (12) · comps · channels · personas (D-126 defaults)
  src/store/               store.ts (Zustand, sessionStorage) · selectors.ts (needs you, queue, projection)
  src/screens/<area>/      the screens, owned per session (below)
  explorations/            S08 concept frames (C-n/), S09 refined frames (S09/): static HTML, not part of the app
```

- **One source of truth.** Colours, type, spacing, icons and fonts come from `../ds`. Components in `src/ds/` emit S02's `h-*` classes. A new pattern goes to `ds/components.css` and the gallery first (CONVENTIONS §6.3), then gets a React port here.
- **Direction-neutral plumbing (D-128).** Facts, sources, overrides, Needs-you decisions, questions, suggestions, the push queue, receipts and versions are what *any* G3 pick needs. If G3 changes the direction, replace screen files, not `data/`, `store/` or `ds/`.
- **One push model (D-129).** Edits and decisions save to the record at once. Anything that would reach a channel goes to `queue` and reaches it only through `push()` → `receipts` + a new `Version`.
- **The rail is data.** `src/data/ia.ts` is the only place IA-R is defined (rail, tabs, where each canonical group lives). OQ-111/OQ-112 label changes happen there.

## Routes

| Route | What | Owner |
|---|---|---|
| `/` | Properties › List (tabs: List · Grid view · Groups · Rules · Activity) | S09 (list) → **S12** |
| `/import/:step?` | F-A1 Connect & import: a full-page takeover, **outside the AppShell** (steps: connect · importing · second-channel · connect-booking · match · found · go-live · done) | **S10** (done) |
| `/property/:id/overview/needs-you` | Overview › Needs you (import landing, SCR-01/02). S09 starter works | **S10** |
| `/property/:id/overview/{channels,ids}` | Channels · Nickname & IDs | **S10** |
| `/property/:id/home/:tab` (`/hub` redirects here) | The home (SCR-03). *Listing text* = the studio (SCR-04) | **S11** |
| `/property/:id/arrival/:tab` · `/rules/:tab` | Arrival & stay · Rules & booking | **S11** |
| `/property/:id/pricing/:tab` | Pricing: who sets the price per channel, group → property → channel inheritance, Rates · Fees & deposit (S10's fee decision inline) · Taxes & discounts · Channel markups. Works for every portfolio property (`src/screens/pricing/`) | **S12** (done) |
| `/property/:id/listing/:channel/:tab` | Listings › [channel] (status & receipts, preview, what differs, **history** and **stats** (S12, `src/screens/versions/`), performance & similar) | **S11** · history + stats **S12** |
| `/property/:id/push` | Review & push (F-B4). S09 starter works | **S11** |
| `/portfolio` · `/portfolio/groups` · `/portfolio/rules` · `/portfolio/activity` | SCR-05: Grid view + bulk sheet (F-P1) · Groups (portfolio pricing) · Rules (sentence builder) · Activity (owner log) | **S12** (done) |
| `/home/*` | Home › Needs you · all properties (grouped by kind, each opens the bulk sheet) | **S12** (done) |
| `/calendar?property=&from=` | Calendar, filtered, with the return chip to the exact page (R-073, D-158) | **S12** (done) |
| `/settings/guidance` | Settings › How Hospitable helps you: the persona preset, its signals, every default, changeable (D-150) | **S12** (done) |
| `/mobile/*` | Mobile & voice in a 390 × 844 device frame | **S13** |
| `/inbox`, `/metrics`, `/direct`, `/devices`, `/operations`, `/guest-experience` | Unchanged, out of scope | — |

## Ownership map: who edits what

| Path | Owner | Others may |
|---|---|---|
| `src/screens/import/**`, `src/screens/property/**` | **S10** | read |
| `src/screens/home/**` (The home, Arrival & stay, Rules & booking, Listing text studio), `src/screens/listing/**` | **S11** | S12 adds mode hooks (note in SESSION-LOG) |
| `src/screens/properties/**`, `src/screens/portfolio/**`, `src/screens/global/**`, `src/screens/home/KindSection.tsx` for Pricing only | **S12** | — |
| `src/screens/mobile/**` | **S13** | — |
| States, copy, motion, a11y across all screens | **S14** | edit any screen, with a SESSION-LOG note |
| `src/ds/**` (shared components) | **shared**, via `ds/` first | change only with a **SESSION-LOG note** ("src/ds: added X / changed Y") |
| `src/store/**` | **shared** | add state and actions freely; **don't rename or change existing ones** without a SESSION-LOG note |
| `src/data/**` | **shared**, seeded by S09 | S10 adds import-time data, S11 adds `comps.ts` detail, S12 adds portfolio detail. Don't fork `scenario.ts` values: SCENARIO.md is the source |
| `src/routes.tsx` | **shared** | add routes in your area; keep existing paths |
| `src/data/ia.ts` | S11 (labels), with S09's IA-R | changes need a D-### (IA is decided, D-110) |
| `explorations/` | S08, S09 | not part of the app |

Screen files start with a comment header: `SCR-## · owner · R-### · D-###` (`tools/audit.mjs` reads it).

## Demo URL params (S10, `src/shell/demoParams.ts`)

For screenshots, the Loom and reviewers. They aren't product behaviour.

| Param | What it does |
|---|---|
| `?persona=P1…P4` | View as a persona |
| `?seed=decided` | Resolve every Needs-you decision with its recommendation |
| `?seed=live` | The same, then push, so receipts exist |
| `?demo=<id>` | A failure/edge state (`screens/import/frame.tsx` `DEMO_STATES`) |
| `?item=<decisionId>` | Open that item in Needs you |
| `?instant=1` | Show import rows at once, instead of ticking them in |
| `?history=1` | S12: jump 90 days ahead (versions v1…v3, weekly series, a running switchback test) |
| `?scale=200` | S12: show the Grid at 200 properties (188 synthetic rows) |

`prototype/explorations/S10/shots.sh` renders the 26 F-A1 frames from the running server.

## Accounts · act as Dana, Callum, Marta or Priya (3 Oct · D-160…D-163)

Click the sidebar **avatar** (phones: **Menu › Act as**) to switch between the research's four hosts. **Dana is today's prototype, kept as built.** Callum has all 12 properties, Marta the one flat (Airbnb + Booking.com), and Priya joins with nothing and sets up first. Each account keeps its **own saved state**: `src/app/account.ts` parks every `hospitable…` storage key under the account you leave, restores the next one's, and reloads into its start page. `?as=<account>` on any URL does the same (handled in `src/entry.ts`, before any store loads). Model: `src/data/users.ts`; hook: `src/shell/useAccount.ts`; menu: `src/ds/account.tsx` (DS §10f). Stories and click paths: `explorations/S12/ACCOUNTS.md`.

## Persona switcher

The sidebar footer has "Demo · viewing as P1–P4" (R-130). `setPersona` applies the D-126 defaults (preview, Needs-you mode, comps, voice, studio autonomy) and clears the host's own tweaks. **S12 (D-150):** the column cross-fades (M-10), a toast lists what changed and offers the persona's start page, and screens read `useMode()` (`src/ds/s12.tsx`): `hints` (more · fewer · none) drive `Guide`, `plain` drives `Term` (P4 vocabulary), `density` sets `data-density`, `landing` is the start page. Settings › How Hospitable helps you (`/settings/guidance`) is where a host sees and changes these. **Rule: modes change defaults and guidance, never capability.** The full table is in `explorations/S12/README.md` §1.

## Data, and where it comes from

| File | Source | Provenance |
|---|---|---|
| `canonical.ts` | `ia/canonical-fields.csv` (100 rows, S06a), parsed at build | `REAL·PUBLIC` channel names / `ASSUMPTION` where marked |
| `scenario.ts` | `concepts/SCENARIO.md` (D-082, D-086): Airbnb values from the trial, a simulated Booking.com twin, 142-field arithmetic | `REAL·PRODUCT` (HS-28, HS-30, HS-33, HS-42) + `SIMULATED` |
| `portfolio.ts` | SCENARIO.md, 12 properties | `SIMULATED` |
| `comps.ts` | SCENARIO.md market context | `SIMULATED` ("Sample market data") |
| `channels.ts` | `research/market/channel-constraints.md` | `REAL·PUBLIC` rules |
| `personas.ts` | D-126 + `MODES` (S12, D-150) | `ASSUMPTION` (tested in S15) |
| `portfolio.ts` (S12 part) | Groups, per-property detail (group, owner, price owner, overrides, health per channel), seeded rules and owner log, 188 synthetic rows for scale | `SIMULATED` |
| `performance.ts` | What each channel shares (`REAL·PUBLIC` rules / `ASSUMPTION`), the 90-days-later history and weekly series, switchback statistics, minimum detectable difference, competitiveness heuristic | `SIMULATED` · `ASSUMPTION` |

Photos are DS gradient placeholders (`h-photo--1…5`): no real people, no stock images.
