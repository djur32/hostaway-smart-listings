# Hostaway · design-system replica

> S02 · R-150…R-155. A small, scalable replica of Hostaway's UI plus the patterns this concept needs. Everything visual in `prototype/` and `deck/` comes from here.
> **Gallery:** `ds/components/index.html` (open from disk) · **Tokens:** `ds/tokens.css` (+ `tokens.json`) · **Components:** `ds/components.css` · **Icons:** `ds/icons/sprite.js` · **Fidelity:** `ds/fidelity/` · **Rules:** `ai-patterns.md`, `motion.md`.

## Principles

1. **Hostaway, next version.** Reuse the shell, tokens and component shapes exactly; change what's *inside* the shell. A reviewer at Hostaway should recognise every token name.
2. **Measured, not guessed.** Every colour traces to a pixel (`samples.json`, Display-P3 → sRGB) and to Hostaway's own token; every size to a measurement at 1512 px. Where we had to guess, the token says .
3. **Colour means one thing.** Raspberry = *act* (one primary per view). Green = *chosen / done / recommended*. Lavender = *the AI proposes, not yours yet*. Amber = *channels disagree*. Grey = everything else.
4. **Say where it goes.** Anything that can differ by channel shows the channel (mark, chip, lens). "1 channel · Edit per channel" becomes the actual per-channel outcome.
5. **Nothing is lost, nothing is silent.** Imports are version 0; AI changes carry why · where · confidence · diff · undo; automation runs only at a level the host chose.

## Files

| Path | What |
|---|---|
| `tokens.css` | RAW (Hostaway's palette, verbatim, ) + ROLES (what each colour does, traced to samples; NEW roles marked) + type, space, radius, motion, elevation, z |
| `tokens.json` | generated from tokens.css with `var()` resolved, for charts and scripts (`python3 ds/tools/tokens_json.py`) |
| `components.css` | every component, tokens only, prefix `h-`, **the single entry point** for deck, concepts (S08) and prototype |
| `fonts/fonts.css` | TT Norms @font-face: Regular 400 · Medium 500 · Bold for 600–700 (review's licensed files, D-093) |
| `icons/` | Tabler outline SVGs (MIT) + `sprite.svg` / `sprite.js` (`python3 ds/tools/build_icons.py`) |
| `channels/` | Hostaway, Airbnb, Booking.com, Vrbo, Agoda, Google marks + README |
| `components/index.html` | the gallery (G1 review surface); `components/shell.js` renders sidebar + sub-nav |
| `illustrations/` | 5 new SVGs + a style study (`python3 ds/tools/illustrations.py`) |
| `fidelity/` | 8 frames rebuilt at 1512 × 862, side-by-sides, `NOTES.md` |
| `tools/` | `sample.py` (colour sampling), `hostaway-root-vars.json` (their public CSS vars), `font_compare.py`, `render.py`, `build_frames.py`, `fidelity.py` |

## Using it

```html
<link rel="stylesheet" href="ds/fonts/fonts.css">   <!-- TT Norms, local woff files -->
<link rel="stylesheet" href="ds/tokens.css">
<link rel="stylesheet" href="ds/components.css">
<script src="ds/icons/sprite.js"></script>           <!-- then <svg class="h-icon"><use href="#i-home"/></svg> -->
<body class="h-root">…</body>
```

- Icons: `<svg class="h-icon"><use href="#i-NAME"/></svg>` (20 px; `h-icon--16/18/24`). Channel marks: `<svg class="h-mark"><use href="#ch-airbnb"/></svg>`; faded with `is-inactive`.
- Shell: `<aside data-shell="sidebar" data-active="properties" [data-persona] [data-collapsed]>` + `<nav data-shell="subnav" data-active="details">` inside `<div class="h-app h-app--viewport">` (needs `components/shell.js`).
- States: `is-*` classes or ARIA (`aria-current`, `aria-selected`, `aria-pressed`, `aria-checked`, `disabled`, `aria-invalid`).
- **No raw colours** in `prototype/`, `deck/`, `concepts/`: use role tokens, or raw scale steps (`--color-gray-300`) when no role fits. If you need a new role, add it to `tokens.css` first.

## Token naming

- **Raw**, Hostaway's names: `--color-{gray|primary|secondary|success|error|warning|blue|orange}-{25…950}`, named hues (`--color-grape`, `--color-raspberry-darker`, `--color-grass-darker`, `--color-smoke`, `--color-night`…), and their semantic set (`--color-text-primary`, `--color-bg-brand-solid`, `--color-border-primary`…).
- **Roles**, `--color-{area}-{thing}[-state]`: `--color-sidebar-bg`, `--color-action-primary`, `--color-ai-surface`, `--color-channel-airbnb`, `--color-sync-drifted`, `--pill-recommended-bg`, `--prov-simulated-text`.
- **Scales**, `--text-{xs…3xl}` + `--leading-*`, `--space-{0-5…16}` (×4 px), `--radius-{xs…2xl|full}`, `--dur-{1…4}`, `--ease-{standard|enter|exit|emphasized|drawer|spring}`, `--elevation-{card|switcher|floating|modal|dropdown}`, `--z-*`.
- **Layout**, `--sidebar-width`, `--subnav-width`, `--content-padding-x`, `--control-width`, `--field-height`, `--field-row-gap`…

## Inventory

| Status | Component | Class | Source |
|---|---|---|---|
| Existing | App shell · sidebar (expanded, collapsed*) | `h-app`, `h-sidebar` | HS-22 |
| Existing | Property sub-nav · segment sub-nav | `h-subnav`, `h-segnav` | HS-22, HS-16 |
| Existing | Page header · property switcher | `h-page-header`, `h-switcher` | HS-22 |
| Existing | Underline tabs | `h-tabs`, `h-tab` | HS-22 |
| Existing | Section header + Discard/Save | `h-section` | HS-22, 35 |
| Existing | Field row + "ⓘ N channel · Edit per channel" | `h-field-row`, `h-field-hint` | HS-22, 33 |
| Existing | Input, select, time select, textarea, affix group, search, weekday picker | `h-input`, `h-select`, `h-input-group`, `h-days` | HS-22, 28, 30, 33, 38 |
| Existing | Toggle, checkbox, radio, radio card + Recommended | `h-toggle`, `h-checkbox`, `h-radio-card` | HS-28, 16, 35 |
| Existing | Per-channel matrix (Instant book) | `h-matrix` | HS-39 |
| Existing | Buttons: primary, secondary, legacy raspberry, large, text-green, link, icon | `h-btn--*`, `h-action-green`, `h-link` | HS-22, 35, 48, 01 |
| Existing | **Close (×), outlined**, the one control for every close / dismiss / remove × (review, 4 Oct: "every X … the X with an outline … homogenize it everywhere"). Measured on the Update amenity dialog (2× capture): **32 × 32**, `--radius-sm` 4px, `--color-close-bg` white, 1px `--color-close-border` #e6e7ea, `--elevation-button` (0 1px 2px + inset 0 −1px 0, both rgba(10,13,18,.05): the same pixels as the dialog's secondary Cancel), **20px Tabler x drawn at 1px** (`stroke-width: 1.2`; the glyph spans ≈ 11px) in `--color-close-icon` #191b1f. Hover: `--color-close-hover-bg` #f8f7f9 + `--color-close-hover-border` #d3d6da (= h-btn--secondary:hover; not captured). Press: 1px down. Focus: `--shadow-focus-neutral` (2px white gap, 2px gray-300 ring). `--lg` **40 × 40 / 24px x at 1.5px** (takeover top bars: wizard, Manage photos, import flow; the real Add property bar); `--sm` **20 × 20 / 12px x at stroke 2**, `--radius-xs`, no shadow (inside a chip, tag or toast); `--on-dark` (transparent, gray-500 border, white x). Phones ≤ 767px: default and `--lg` **44 × 44 with a 24px x at 1.5px**; `--sm` 28 × 28 with an invisible 44px hit area. Replaces `h-ld-close(--boxed)`, `h-m-close`, `kha-pop__x`'s and `ch-tagbox__x`'s own looks and every `h-btn-icon` ×; the wizard's and Manage photos' back ‹ wear the same box. React: `CloseButton` (`label`, `size`, `onDark`); `IconButton icon="x"` routes to it | `h-close`, `h-close--lg/--sm/--on-dark`; tokens `--color-close-*`, `--elevation-button`; `CloseButton` | concepts/smart-listing/refs/listing-details/09–11, research/current-state/review-2026-10-03-add-property/01–06 |
| Existing | Pills & badges: Recommended, Lead listing, Fully managed, New, Unlisted, Scoped, All | `h-pill--*`, `h-badge-*` | HS-16, 21, 30, 35, 48 |
| Existing | Filter chip, active filter row, list toolbar | `h-filter-chip`, `h-filter-row`, `h-toolbar` | HS-48 |
| Existing | Table · property row · selection bar | `h-table`, `h-prop-row`, `h-selection-bar` | HS-48, 16 |
| Existing | Empty state (ribbons) · progress ×3 · skeleton | `h-empty`, `h-progress`, `h-skeleton` | HS-49, 01, 15, 41, 17 |
| Existing | Modal · dropdown · accordion · KH rows · toast · tooltip | `h-modal`, `h-menu`, `h-accordion`, `h-kh-row` | HS-57, 42 |
| Existing | AI promo card · trial card · chat bubble | `h-ai-card`, `h-trial`, `h-chat-fab` | HS-30, 22 |
| Existing | Calendar day cell | `h-cal` | HS-32 |
| Existing | Onboarding split · stats · testimonial · choice tile · connect header/status | `h-onboarding`, `h-choice-tile`, `h-connect-*` | HS-01…15 |
| New | Channel chip · letter chip · channel lens | `h-channel-chip`, `h-ch`, `h-lens` | D-023 |
| New | Source chip · fact row · projections · provenance line | `h-source`, `h-fact`, `h-provline` | D-024 · *projections on the shared record superseded by D-940 (the Base shows shared values only); kept in the gallery as history* |
| New | Conflict card · conflict hatch · override pin | `h-conflict`, `h-hatch`, `h-override` | D-024 · *override pin not used in the channel-first build (D-933: inherited values read-only on channel pages)* |
| New | Import summary | `h-import` |, |
| New | AI suggestion panel · suggestion · strength · refine input | `h-ai-panel`, `h-suggestion`, `h-strength`, `h-refine` | D-020 |
| New | AI suggestion card · confidence | `h-ai-suggest`, `h-confidence` | D-020 |
| New | AI states (generating, ready, low confidence, failed) | `h-ai-state`, `h-skeleton` | D-020 |
| New | Selection toolbar (smart editing) | `h-seltool` | D-029 |
| New | Strategy chips | `h-chip` |, |
| New | Autonomy dial · autonomy notice | `h-autonomy`, `h-autonomy-notice` | D-025 |
| New | Diff inline / split / card · version timeline · blame marker | `h-diff*`, `h-versions`, `h-blame` |, |
| New | Comps card · insight card | `h-comp`, `h-insight` |, |
| New | Health meter | `h-health` |, |
| New | Coach mark · hotspot · explainer | `h-coach`, `h-hotspot`, `h-explainer` |, |
| New | Persona switcher (demo only) | `h-persona` |, |
| New | Voice sheet | `h-voice` |, |
| New | Sync state | `h-sync` |, |
| New | Bulk action bar | `h-bulkbar` | D-029 |
| New | Provenance chip | `h-prov` | CONVENTIONS §2 |
| New | Question card, grounding (default, free answer, blocking, answered, inline) | `h-ask` | D-090, D-106 |
| New | Guest-page preview + editable target (hover, selected, changed, loading; mobile) | `h-guest`, `h-guest__target` | D-092 |
| New | Photo placeholder (5 tones, square/wide, cover badge, selected, excluded, empty) · mosaic · photo grid | `h-photo`, `h-mosaic`, `h-photo-grid` | D-092 |
| New | Conversation: thread, AI / host / system bubbles, typing | `h-thread`, `h-msg`, `h-thread-pane` | D-092 |
| New | Stepper (to decide, current, done, to do, skipped) | `h-steps`, `h-step` | D-092 |
| New | Grounded sentence: cite count, facts popover, selected / changed (S11) | `h-cite` | D-141, D-148 |
| New | Reorder list: grip, position, move buttons, fold line; dragging / drop target / moved (S11) | `h-reorder` | D-146, D-148 |
| New | Market band: comps' range, median, "You" marker (S11) | `h-band` | D-144, D-148 |
| Fix | Page header title never wraps (S11) | `.h-page-header > .h-h1` | D-148 |
| New | Inheritance chip: group (hollow) · property (raspberry) · channel (amber); Override / Reset (S12) | `h-inherit` | D-154 |
| New | Return chip: the property page you left, in a global page's header (S12) | `h-return` | R-073, D-158 |
| New | Portfolio grid: sticky header + first column, compact, selected / excluded rows; channel strength cell (S12) | `h-grid`, `h-strength` | D-151, D-159 |
| New | Bulk sheet (drawer): steps · per-unit diff · receipt (S12) | `h-sheet`, `h-steps-inline` | D-151 |
| New | Review queue sample: to check · looks right · hard stop (S12) | `h-sample` | D-152 |
| New | Rule sentence with select slots; rule rows (S12) | `h-rule`, `h-rule-row` | D-153 |
| New | Time-series chart: line, comps baseline, version markers, switchback bands, crosshair tooltip, legend (S12) | `h-chart` | D-156 |
| New | Data availability cell + unavailable panel (S12) | `h-avail`, `h-unavail` | D-156 |
| New | Test certainty meter (bar set before the test) + switchback strip (S12) | `h-certainty`, `h-switchback` | D-157 |
| New | Early access tag (Angle C area) (S12) | `h-early` | D-156 |
| New | Guide: persona guidance (card · line · none) and glossary term (S12) | `h-guide`, `h-term` | D-150 |
| New | Persona switch cross-fade (M-10) + mode toast (S12) | `h-mode-enter`, `h-mode-toast` | D-150 |
| Token | Chart roles `--color-chart-1…3/comps/grid/axis/marker/unavailable`; inheritance roles `--color-inherit-*` (S12) | tokens.css | D-156, D-154 |
| Changed | **Phone layer, one head + field sheets (review, 4 Oct):** `MobileHead`, property selector full width (opens a Properties sheet) · title = Sections switcher (title ⌄, overlay button) + `HeadTips` purple text "Tips" on the right · the page's own rows · tabs; the grey section bar and "···" retired on phones; a 44px compact bar once the title scrolls away. `SettingRow` on phones = read-only summary + the **field sheet** (title, help, live field, scope caption with its action, the page's Discard / Save). Discard / Save (and photo bulk / Re-order bars) replace the tab bar. Close / back icon buttons 44 × 44 `--radius-md`; photo tile select + pencil one size. Spec: `mobile.md` §3, §4, §6, §7 | `h-m-head*`, `h-m-tipsbtn`, `h-m-compactbar*`, `h-m-propsheet*`, `h-m-fieldsheet*`, `h-field-row__summary`, `h-field-row__open`; `MobileHead`, `HeadTips`, `useInSheet`, `BottomSheet pageSave` | review review 4 Oct |
| New | Account menu: avatar (identity colours), who you are, "Act as" list with what each account holds, settings (S12 follow-up) | `h-account`, `h-avatar--account`, `h-avatar--<user>` | D-160, D-161 |
| Token | Account identity roles `--color-account-dana/callum/marta/priya` (S12 follow-up) | tokens.css | D-160 |
| Changed | Setting row (`SettingRow`, channel listing editor, Pricing, Policies): **stacked only**, label (medium 500) + help, control full width (≤ `--form-column-width` 640px), caption row. **Uses the Base** or an all-channels value not opened yet → the control in the DS **disabled** state (value in muted text, not placeholder grey); **Custom for {channel}** → a normal control. Caption mirrors "ⓘ 2 channels ···· Edit per channel": neutral ⓘ scope left, black underlined action right ("Customize for {channel}" / "Use the Base" / "Edit for all channels"). No "Changed" tag (`ChangedTag`, `ch-changed` removed): unsaved edits show on the section head's **Discard changes / Save** (`SaveActions`: both disabled until something changes, then secondary + primary); edits are a draft until Save, which commits them to the store and queues them for Review (30 Sep) | `h-field-row--stacked`, `h-field-hint__action`, `SaveActions` | HS-22 |
| Changed | Listing editor frame + Tips side panel (30 Sep, the team): page head, Classic \| Canvas row and tabs stay **fixed**; below them the form column (the only thing that scrolls) and the Tips panel sit side by side. `Split` always has two tracks (`1fr 0px` / `1fr 420px`); the main column snaps (no width animation, nothing inside rescales), the sheet fades in from 6px over `--dur-1` and stays mounted for its fade-out (motion M-17). Tab / channel / view switches show a brief raspberry `h-spinner` (M-18). Focused inputs, textareas and select triggers: grey border kept + `--shadow-focus-neutral` (2px white gap, 2px gray-300 ring), never a brand or AI glow. The Photos row keeps its thumbnail size and wraps (max two rows, last tile "+n more"). Thin scrollbars on the form column and the panel. **Tips** toggle sits at the far right of the view row (`aria-pressed` while open). No "Review N changes" in the editor head: the section's Discard changes / Save is the commit, and Save shows a quiet **"Saved"** that fades (`h-saved`) | `ch-editor`, `h-split__panel`, `h-split__sheet`, `h-scroll-thin`, `h-btn--ai[aria-pressed]`, `h-saved`, `h-spinner`, `h-loading`, `--shadow-focus-neutral`, `TipsToggle`, `SaveActions`, `Loading` | HS-22 |
| New | **Strategy line** (`PlanLine`): one quiet line in the editor's view row, "Strategy: {goal · audience} · Change", or "Autopilot is on · {strategy} · Turn off Autopilot to edit". While Autopilot runs, every row is read-only (DS disabled, no caption actions, no Save), Canvas parts explain why. Replaces the strategy banner card in the Listing editor | `h-planline` | D: review 30 Sep |
| Changed | **Text link** for every action under or beside a control (caption actions, amenity Remove / Add for {channel}, policy Customize / Configure): near-black, underlined, medium 500, no chrome or icon. The listing-wide "Saving changes this on every channel" note is plain muted text under the caption, not a box. The field label is a flex row so the tip icon centres on the label's text line. No change markers anywhere (no counters, tags or colour for edited values) | `h-textlink`, `h-field-hint__action`, `h-field-note`, `h-field-row__label` |, |
| Replica + New | **Photos (Hostaway replica, per channel)**, section "PHOTOS (Hostaway replica)" at the end of components.css; React `prototype/src/ds/photos.tsx`. Photos row (title + bordered count, "Manage photos" black link, 5 square thumbs + "+n more"); All photos page (warning banner, "n photos" + channel filter `All photos · Airbnb · Booking.com · Direct bookings`, 5-col grid); tile with select checkbox, edit pencil / drag handle, **"Cover for [marks]"** pill (replaces the old "Cover" badge) and neutral **"Hidden on [mark]"** label on dimmed tiles; Re-order mode (drag + arrow keys on the handle); large Edit photo modal (centred title, divider, photo + expand, **checkbox cards** per channel, per-platform captions with a "not available on Booking.com" row, standardised **Room or area** tag with what each channel does with it, Delete · Cancel · Apply) (30 Sep) | `h-photos-row`, `h-photos-count`, `h-photo-thumb`, `h-banner`, `h-photos-page`, `h-photos-filter`, `h-photos-grid`, `h-photo-tile`, `h-photo-cover`, `h-photo-hidden`, `h-modal--sheet`, `h-modal__head`, `h-check-card(s)`, `h-per-platform`, `h-tag-use(s)`, `h-btn--danger`, `h-btn-text`, `h-sr-only`; icon `arrows-diagonal` | screenshots 3, 8, 9, 10, 11 |
| Replica + New | **Property Overview (real replica, one property)**, section "OVERVIEW (real replica)" at the end of components.css; React `prototype/src/ds/overview.tsx`. Setting rows (title 18/500, description 16/24 muted, action right: black underlined `h-textlink`, 400px field, or toggle); **status chips** as `h-chip` modifiers, 20px pills with a 10% currentColor border, 14/500: `--lead` green ("Lead listing"), `--managed` light purple ("Partially managed"), `--managed-full` solid purple ("Fully managed"), `--restricted` orange ("Calendar / Sync restricted"), `--grey`; **tooltip** restyled to the product's dark grey (`--color-bg-inverted`, white 14/20, 4px radius) and anchored with `h-tooltip-anchor` (hover + keyboard focus, 250ms delay), replacing the grape-darker 12px tooltip; **connected channel row** (40px photo, channel mark, listing name 18/500, kind · host · chips, 400px status select); **status select** (`h-dropdown` + visibility icon: green eye "Listed - Guests can search and book" / red eye-off "Unlisted - Guests can’t search or book"; the menu holds the one action, Unlist / Publish listing); **opportunities accordion** (bordered 12px card, "N opportunities available" 18/500 + chevron; open: mark, title, description, green "Outcome → Outcome", Set up, ×; "See more opportunities"); Sync / Smart Listings toggles in the product's lighter green (success-400); Smart Listings per-channel lines when on; copy links confirm quietly ("✓ Copied" for 1.8 s). Stacks under 720px of content width (container query) (30 Sep) | `h-ov`, `h-ov-sec(--field)`, `h-ov-divider`, `h-ov-foot`, `h-ov-listing(s)`, `h-ov-host`, `h-ov-status`, `h-opps`, `h-opp`, `h-ov-smart`, `h-chip--lead/--managed/--managed-full/--restricted/--grey`, `h-tooltip`, `h-tooltip-anchor`; `Chip`, `Tip`, `OvSection`, `StatusSelect`, `ListingRow`, `HostLine`, `Opportunities`, `CopyLink`, `useCopy` | screenshots 22–27 |
| Replica + New | **Booking policies (Hostaway replica of the Airbnb Configure flow, 30 Sep)**, section "BOOKING POLICIES" at the end of components.css; React `prototype/src/ds/policy.tsx`. Channel header (`h-policy-channel`) · policy summary card with Configure on the right, optional heading, facts list, read-only variant (`h-policy-card`) · full-page step flow: context head, 3px progress, one 720px column, sticky foot Back \| Cancel · Continue/Confirm (`h-stepflow`) · option card with the radio on the right, selected = light-blue fill + blue border + green radio (`h-radio-card--choice`) · grey settings/review card with chip, toggle row, divider, field (`h-review-card`, `h-pct-field`) · info box, help note, blue help link (`h-info-box`, `h-help-note`, `h-helplink`). New tokens `--color-option-selected-bg/-border`, `--color-info-surface/-text`, `--color-link-info`, `--color-chip-neutral-bg` | `h-policy-*`, `h-stepflow`, `h-radio-card--choice`, `h-review-card`, `h-info-box` **3 Oct:** the Configure flow (PolicyFlow.tsx) now runs on the shared full-screen wizard (`ds/v3/wizard.css`: `Wizard`, `WizardChoices`, `WizardSummary`) to match the Strategy wizard; `StepFlow` / `ChoiceCards` / `ReviewCard` are no longer used by it. | review's screens 14–21 |
| Replica + New | **Mobile layer (≤ 767px, Hostaway's real mobile web app, 30 Sep)**, spec `ds/mobile.md`; section "MOBILE" at the end of components.css; tokens `--m-*`; React `prototype/src/ds/mobile.tsx`. One breakpoint `(max-width: 767px)`, `useIsMobile()`. Bottom tab bar (`h-m-tabbar`), Menu as a bottom sheet, **property section bar + sections sheet** (`MobileSectionBar`, `h-m-sectionbar`, `h-m-navsheet`: the rail's phone equivalent, "Airbnb › Listing · Sections ⌄" opening the whole rail in a sheet, mobile.md §3a, 3 Oct), chat bubble docked above the dock (`ChatFab docked`), page head with "···" and the switcher under the title (PageHead / PageHeader via CSS; `MobilePageHead`), scrolling tabs (`ScrollTabs`), sticky Discard / Save above the tab bar (`MobileActionBar`, `useMobileActions`, `h-m-actionbar`), bottom sheet + full-screen sheet (`BottomSheet`, `h-m-sheet`), yellow top toast (`TopToast`, `h-m-toast`), "⋯" row menus as action sheets (`OvMenu`, 52px rows, destructive red, mobile.md §7). **Tablet shell step (768–1023, mobile.md §3b, 3 Oct):** `useIsTablet()` / `TABLET_QUERY`; icon-only sidebar that expands as an overlay (`h-app__scrim`), the property rail as a left slide-over behind the same section bar (`h-proplayout__scrim`, `.is-rail-open`), and `Split` panels as a side sheet over the form when the split is < 720px (container query `h-split`); pages keep their desktop layout | `h-m-*` | images/32–49 |
| New | **App mode (3 Oct)**, the phone layer as an installable app: `VITE_APP_MODE=mobile` or `/app`; spec `ds/mobile.md` § App mode, run/install `prototype/APP-MODE.md`; CSS `ds/v3/app.css` (app mode only, `html.is-app`), code `prototype/src/app/**`. Push / pop / fade page transitions (View Transitions, `html[data-nav]`), iOS edge swipe back (`.app-edge`, `.app-underlay`), physical sheet drag (rubber band, velocity; `BottomSheet` when `APP_MODE`), large title → compact section bar (`html[data-condensed]`), press states, top toasts, a 390 × 844 device frame on desktop (`app-stage`, `app-device`), manifest + icons in `prototype/public/pwa/` | `app-*` | images/32–49, Mobbin 04/05 |
| New | **Listing details (the property's source of truth, 1 Oct)**, section "LISTING DETAILS" at the end of components.css; React `prototype/src/ds/details.tsx`; screen `prototype/src/screens/details/`. **Source-of-truth banner**: one quiet line under the page head (database icon, "Source of truth · Every channel’s listing is built from these details. Channel pages adapt them.", black text link "How channels use it"), provenance colours `--prov-truth-bg/-text/-border` (success-25/700/100), no card, no shadow. **Desktop drawer** (right, 440px, scrim, slides 24px + fade over `--dur-drawer`, exit `--dur-2`) and **dialog** (centred, title 24/600, outlined × `h-close`, footer with a left slot; `tall` keeps one height across steps); both become `BottomSheet` on phones (`fullScreen` / `phoneFull` for long edits), never a sheet on a sheet. **Filter chips** (multi-select, selected = green fill + border + check) and **Filters** button with a dark count. **Amenity line**: bordered card (name, an exception label only when a channel lacks it, "Not on Booking.com"; never "All channels") + separate 52px square icon buttons (pencil for amenities with details, trash) at every width. **Amenity pick** row (Add amenity drawer, as the real one, refs 07, 12, a tap toggles and saves at once): a bordered card, the name in medium with its **scope caption** right beside it (`h-ld-pick__scope`: the words "All channels" when every connected channel has a field for it, otherwise the `Mark` of each channel that does), and the state at the right end; whole row is the button; not added = white row with a plain "+" (36px target, 44px on phones); added = check on a grey row; saving = the icon becomes a turning sync glyph (`is-busy`, `aria-busy`) and the footer reads "Updating…" until every save settles, then "Done"; closing never commits anything. Base fields on Listing details carry **no channel caption** (`h-ld-field`: same for every channel, 1 Oct). **Step progress** ("Step 1 of 3 · Parking type" + 3px raspberry bar), **radio cards** (`h-radio-card` with the option's channel mark), **number stepper** (– [n] +), **checkbox list** | `h-truth`, `h-ld-layer`, `h-ld-drawer`, `h-ld-dialog(--sm/--tall)`, `h-close` (was `h-ld-close(--boxed)`), `h-ld-chips`, `h-ld-chip`, `h-ld-filters`, `h-ld-group`, `h-ld-list`, `h-ld-amenity`, `h-ld-flag`, `h-ld-square(--sm)`, `h-ld-pick`, `h-ld-pick__scope`, `h-ld-steps`, `h-ld-radio`, `h-ld-stepper`, `h-ld-checks`, `h-ld-field`; `SourceOfTruthBanner`, `DetailsDrawer`, `DetailsDialog`, `ChipGroup`, `FiltersButton`, `AmenityLine`, `AmenityPick`, `StepProgress`, `RadioCards`, `NumberStepper`, `CheckList`; icons `database`, `filter-2`, `minus` | concepts/smart-listing/refs/listing-details/01–15 |
| New | **Panel stack (`PanelStack`, D-927, 1 Oct)**, drill-downs that slide in beside where you came from, never replacing it (review: the real Calendar/pricing drill-downs swap the whole panel behind "‹ Back", HS-C02…C12, and "it doesn't allow you to stay within your own section"). API: `main` + `panels: {id, title, content, footer?}[]` (level 0 first, last = active), `onBack(toIndex)`, `onClose()`, `label`, `rootTitle`. Desktop: each level is a column; opening one slides it in from the right while the previous level compresses to a 44px grey **spine** (chevron + vertical title, a button back to that level) and the main content narrows in sync, never rescaling; back / close plays it in reverse (motion M-19). Panel width 384px; header = "‹ {previous title}" black underlined text link, title 20/500, ×; body scrolls (thin); optional sticky footer (Discard / Save, 50/50, as HS-C04). When the content area is narrower than 860px the rail floats over the main column's right edge instead of narrowing it. Keyboard: Esc goes back one level (closes at level 1); focus moves to the new level's title and returns to the opener on back; levels are labelled regions, spines say "Back to {title}", a polite live region announces the level. Phones (3 Oct): a bottom sheet (scrim over everything, grip that drags it closed, 90dvh, `h-pstack-m__frame`) rises from the bottom; each further level slides over the previous one from the right inside it with "‹ {previous title}" on top (level 0: no back link, × and the scrim close it); the page's registered Discard / Save shows in the sheet's footer (`MobileSheetSaveButtons`). `PanelLink` is the row that opens the next level (title, one-line summary, chevron; HS-C01's pricing rows). Content helpers: `h-pstack-sec`, `-desc`, `-lines`/`-line`, `-price`, `-box`, `-radio`, `-legend`, `-note`. First use: Calendar › a night (screens/pricing/PricingPanels.tsx) | `h-pstack`, `h-pstack__main`, `__rail`, `__level[data-state=active\|spine\|leaving]`, `__sheet`, `__spine`, `__head`, `__back`, `__title`, `__body`, `__foot`, `h-pstack-m`, `h-pstack-m__sheet[data-state=covered]`, `h-pstack-link`, `h-pstack-host`; `PanelStack`, `PanelLink`, `StackPanel` | research/current-state/review-2026-10-01 HS-C01…C15 (the pattern it corrects) |
| Existing | Disabled API for every button variant | `disabled` · `aria-disabled="true"` · `.is-disabled` | D-091 |

\* collapsed sidebar is an (not captured).

## From S08's mid-fi helpers to DS components

S08's concept frames (`prototype/explorations/`) arranged patterns with `midfi.css` helpers. The ones a product screen needs are now DS components. Swap the classes below; the remaining `mf-*` helpers (`mf-row`, `mf-grid-*`, `mf-card`, `mf-cap`…) are frame layout, not product UI, and don't need promoting.

| S08 (`midfi.css`) | DS (`components.css`) | Notes |
|---|---|---|
| `mf-ask` (+ inner `mf-row`/`mf-label`/`b`/`h-caption`) | `h-ask` › `h-ask__head` (icon + `h-ask__label` + optional `h-channel-chip`) › `h-ask__q` › `h-ask__why` › `h-ask__answers` (+ `h-ask__later`) | Modifiers `--blocking` (+ `h-ask__blocks`), `--inline`; states `is-answered` (+ `h-ask__answer`), `is-later`. Rules: ai-patterns.md §8 |
| `mf-guest` › `mf-guest__chrome` › `mf-guest__body` | `h-guest` › `h-guest__chrome` (+ `h-guest__label`) › `h-guest__body` | `--mobile`; state `is-loading` |
| `mf-sel` on an element inside the preview | `h-guest__target is-selected` (or `aria-current="true"`) | Also hover, and `is-changed` with `data-change="2 changes"` |
| `mf-photo`, `mf-photo--1…5` | `h-photo`, `h-photo--1…5` | + `--square`, `--wide`, `--empty`; `h-photo__badge`; `is-selected`, `is-excluded` |
| `mf-mosaic` | `h-mosaic` | same grid; `h-photo-grid` for reorderable sets |
| `mf-thread` | `h-thread` | |
| `mf-msg`, `mf-msg--ai`, `mf-msg--me` | `h-msg`, `h-msg--ai`, `h-msg--me` | + `h-msg--system`, `h-msg--typing`, `h-msg__meta`, `is-entering` |
| `mf-pane` (conversation side pane) | `h-thread-pane` | |
| `nav.h-subnav` + inline-styled `h-subnav__item` used as a walk-through | `ol.h-steps` › `a.h-step` (`--decide` / `--done` / `--todo` / `--skipped`, `aria-current="step"`) › `h-step__title` + `h-step__meta`; optional `h-steps__count` | No inline styles needed |
| `h-btn … disabled` | keep `disabled` (the API); `aria-disabled="true"` for links; `.is-disabled` alias | D-091, works on every variant now |
| `mf-bend` (declared IA bend on the rail, D-083) |, (stays in concepts) | A concept annotation, not product UI |

## Usage rules

- **One primary per view.** Raspberry primary (`h-btn--primary`, primary-600) for the main action. `h-btn--legacy` (raspberry-darker) only when replicating an existing screen (D-027).
- **Field row vs fact row.** Existing screens use `h-field-row`. New record views use `h-fact` so each value shows its source and per-channel projections. Don't mix both in one section.
- **Channel is always visible** when a value can differ by channel: mark in lists, chip in panels, lens for whole-record views, override pin when one channel departs from the shared value, hatch when channels disagree and nobody has decided.
- **Selection is green, not raspberry** (radio, checkbox, toggle, chosen conflict option).
- **Dark surfaces are grape-darker** and reserved for "acting on many / acting on a selection": selection toolbar, bulk bar, coach mark (D-029). The tooltip follows the product: dark grey `--color-bg-inverted` (30 Sep).
- **Cards are bordered, not shadowed.** Shadows are for things that float (switcher, dropdown, selection bar, toast, modal).
- **Illustrations** only on empty, success and first-run moments; one per screen; never behind data.
- **An unknown is a question, not a warning** (D-090, D-106): use `h-ask`, never an amber note, when the AI lacks a fact. Amber is reserved for channels that disagree.
- **Disabled** = the `disabled` attribute on buttons; prefer keeping a primary enabled and explaining what's missing (question card, inline error) over a silent disabled state.

## Do / don't for AI patterns

See `ai-patterns.md` §7. The short version: every AI surface is the assistant (its sparkle, purple on lavender; `ai-patterns.md` §1, KD-20), never a new assistant; lavender until accepted, raspberry Accept, diff against live, channel on every suggestion, version 0 kept forever, no Autopilot by default.

## Accessibility notes

| Pair | Ratio | Verdict |
|---|---|---|
| Raspberry primary-600 #e1295a on white (links, tab underline) | 4.50:1 | AA for normal text, just. Don't use lighter primary-500 #f24167 for small text (3.67:1): Hostaway's inline links do; we keep it in the replica, flag it (OQ-090). |
| White on primary-600 (Save) | 4.50:1 | AA |
| White on raspberry-darker #ed3c6a (legacy CTA) | 3.85:1 | AA large only, another reason to converge on primary-600 |
| grass-darker #47c693 text on white ("+ Filter", help links) | 2.15:1 | **Fails.** Replicated; new work uses success-600 #188668 (4.52:1) for text actions that matter |
| White on grass-darker (Scoped badge) | 2.15:1 | **Fails** for 12 px text. Replicated only |
| AI body grape #9571c3 on lavender #f6f0ff | 3.47:1 | **Fails.** New work: `--color-ai-text` secondary-700 → 6.45:1 |
| AI title grape-darker on lavender | 15.75:1 | AAA |
| Muted text #53575b on white | 7.29:1 | AAA |
| Placeholder gray-400 on white | 2.48:1 | Placeholder only; never for values or labels |
| Table header night-lighter #b3afbb on white | 2.15:1 | **Fails.** Replicated; new tables use `--color-text-muted` |
| Grape icons on sidebar #1a0a33 | 4.78:1 | OK for non-text |

Focus: every interactive element shows `--shadow-focus-brand` (4 px raspberry halo at 16%) on `:focus-visible`; selection controls use `--shadow-focus-success`. Keyboard: tabs, lens, chips, autonomy dial are buttons/radios with ARIA state; drag-reorder always has a keyboard alternative (motion.md M-06). Motion: `prefers-reduced-motion` handled in tokens + components. Colour is never the only signal: conflicts carry an icon and text, sync states carry a label, the override pin says which channel.
