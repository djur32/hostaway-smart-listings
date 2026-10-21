# prototype/ · Hostaway Smart Listings

A hi-fi, interactive prototype of an independent design concept for Hostaway: Smart Listings, a per-channel listing strategy with tips, a canvas of the real guest page, experimentation and measurement.
It is a design concept, not a Hostaway product. All hosts, properties, guests and numbers are sample data. Every page is `noindex`.

## Run

```bash
cd prototype && npm i && npm run dev
```

Opens on **http://localhost:5174**.

| Script | What |
|---|---|
| `npm run dev` | Vite dev server, port 5174 (strict) |
| `npm run build` | `tsc` + production build into `dist/`. For a sub-path deploy: `PROTO_BASE=/prototype/ npm run build`, plus a rewrite `/prototype/(.*)` to `/prototype/index.html` |
| `npm run check` | Typecheck and no raw colours in `src/` (`tools/check-no-raw-colour.mjs`) |

Deploy: a Vercel project with root directory `prototype/` picks up `vercel.json` (framework Vite, output `dist`, SPA rewrite to `/index.html`).

## How it's put together

```
prototype/
  index.html               noindex, <body class="h-root">
  src/main.tsx             imports ../ds/fonts/fonts.css, ../ds/tokens.css, ../ds/components.css (never copied)
  src/routes.tsx           every route
  src/ds/                  React ports of the design system: primitives, record patterns, AI patterns, shell, charts
  src/shell/               AppShell (sidebar and footer), PropertyLayout (rail), Placeholder
  src/data/                types, canonical fields, IA, the sample property, portfolio, comps, channels, personas
  src/store/               Zustand store (sessionStorage) and selectors
  src/screens/<area>/      the screens
```

- **One source of truth.** Colours, type, spacing, icons and fonts come from `../ds`. Components in `src/ds/` emit the shared `h-*` classes. A new pattern goes to `ds/components.css` first, then gets a React port here.
- **One push model.** Edits and decisions save to the record at once. Anything that would reach a channel goes to the queue and reaches it only through `push()`, which writes receipts.
- **The rail is data.** `src/data/ia.ts` is the only place the navigation rail, the tabs and the home of each field group are defined.

## Routes

| Route | What |
|---|---|
| `/` | The property Overview (the signed-in account's start page) |
| `/import/:step?` | Connect and import: a full-page flow outside the AppShell |
| `/property/:id/overview/*` | Overview: Needs you, Channels, Nickname and IDs |
| `/property/:id/home/:tab` | The home and the listing text studio |
| `/property/:id/arrival/:tab` and `/rules/:tab` | Arrival and stay, Rules and booking |
| `/property/:id/pricing/:tab` | Pricing: who sets the price per channel, rates, fees, taxes, discounts, markups |
| `/property/:id/listing/:channel/:tab` | A channel's listing, receipts, history and stats |
| `/property/:id/push` | Review and push |
| `/portfolio/*` | Grid view with the bulk sheet, Groups, Rules, Activity |
| `/calendar` | Calendar, filtered, with a return chip to the exact page |
| `/settings/guidance` | How Hostaway helps you: the persona preset and every default |
| `/mobile/*` | Mobile and voice in a 390 by 844 device frame |

Smart Listings (Strategy, Performance, the wizard) and the Canvas live under each property's rail.

## Demo URL params (`src/shell/demoParams.ts`)

For screenshots and demos. They aren't product behaviour.

| Param | What it does |
|---|---|
| `?persona=P1…P4` | View as a persona |
| `?seed=decided` | Resolve every Needs-you decision with its recommendation |
| `?seed=live` | The same, then push, so receipts exist |
| `?demo=<id>` | A failure or edge state (`screens/import/frame.tsx` `DEMO_STATES`) |
| `?item=<decisionId>` | Open that item in Needs you |
| `?instant=1` | Show import rows at once, instead of ticking them in |
| `?history=1` | Jump 90 days ahead (versions, weekly series, a running switchback test) |
| `?scale=200` | Show the Grid at 200 properties (188 synthetic rows) |

## Accounts

Click the sidebar avatar (phones: Menu, then Act as) to switch between four sample hosts: Dana, Callum, Marta and Priya. Dana is the default. Callum has all 12 properties, Marta the one flat (Airbnb and Booking.com), and Priya joins with nothing and sets up first. Each account keeps its own saved state: `src/app/account.ts` parks every `hostaway…` storage key under the account you leave and restores the next one's. `?as=<account>` on any URL does the same. Model: `src/data/users.ts`.

## Persona switcher

With `?demo=1` the sidebar footer shows "Demo · viewing as P1–P4". `setPersona` applies each persona's defaults (preview, Needs-you mode, comps, voice, studio autonomy) and clears the host's own tweaks. Screens read `useMode()` (`src/ds/s12.tsx`): `hints` (more, fewer, none) drive `Guide`, `plain` drives `Term`, `density` sets `data-density`, `landing` is the start page. Rule: modes change defaults and guidance, never capability.

## Data

All data is sample data. Photos are design-system gradient placeholders (`h-photo--1…5`): no real people, no stock images.

| File | What |
|---|---|
| `canonical.ts` | The canonical field list and where each is marked per channel |
| `scenario.ts` | The sample property, its decisions, questions, suggestions, listings, photos and versions |
| `portfolio.ts` | 12 sample properties, groups, per-property detail, seeded rules and owner log |
| `comps.ts` | Sample market context |
| `channels.ts` | Channel constraints and rules |
| `personas.ts` | The persona defaults |
| `performance.ts` | What each channel shares, the 90-day history and weekly series, switchback statistics, minimum detectable difference, a competitiveness heuristic |
