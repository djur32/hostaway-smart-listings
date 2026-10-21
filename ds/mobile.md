# Mobile · the phone-width layer

> Replicates Hostaway's **real mobile web app** (review's iPhone captures, 30 Sep 2026: `images/32–49`, 923 px wide = 390 pt, so every measurement below is ÷ 2.367) .
> **React:** `prototype/src/ds/mobile.tsx` (exported from `prototype/src/ds`). **CSS:** `ds/components.css`, section **MOBILE** (classes `h-m-*`). **Tokens:** `ds/tokens.css`, block **MOBILE** (`--m-*`). **Playground:** `/mobile/kit` (at phone width). **Viewer:** `/mobile` (desktop: a 390 × 844 device frame).
> Screens adapt **their own** layouts; this file is the contract they follow.

## 1 · Breakpoint

- **One phone breakpoint:** `@media (max-width: 767px)`. No `min-width` mobile-first rewrite, no container queries for the phone case.
- **One shell-only tablet step:** `@media (min-width: 768px) and (max-width: 1023px)` (`TABLET_QUERY`, `useIsTablet()`). Only the shell changes there (§3b); pages keep their desktop layout and never branch on it. ≥ 1024 (incl. 1024 × 768 landscape) is desktop.
- In JS: `useIsMobile()` (matchMedia on the same query, `MOBILE_QUERY`). **Prefer CSS.** Use JS only to mount portals (drawer, sheet) or to register the action bar.
- Put a screen's phone rules at the end of its own CSS block, inside the same query, scoped to its own classes.

## 2 · Fundamentals

| Rule | Value | Token |
|---|---|---|
| Side gutter (content padding) | 16 px (the tokens change at the breakpoint, so `.h-content` already has it) | `--m-gutter`, `--content-padding-x` |
| Content top padding | 24 px | `--content-padding-top` |
| Tap target, minimum | 44 × 44 (nav rows, icon buttons, "···", ×) | `--m-tap` |
| Safe areas | top `env(safe-area-inset-top)`, bottom `env(safe-area-inset-bottom)`; the tab bar and sheets add them | `--m-safe-top`, `--m-safe-bottom` |
| Horizontal page scroll | never. `.p-frame` clips, `.h-content` hides x-overflow; wide things scroll **inside** their own box |, |
| Media | `img`, `video`, `iframe` max-width 100% |, |
| Tables | `.h-table` becomes a block that scrolls sideways inside its container |, |
| Scrollbars | none on tab rails; thin elsewhere |, |

### Type (the real app sets type larger than desktop)

| Role | Size / leading / weight | Token | Real example |
|---|---|---|---|
| Page title | 30 / 38 / 500 | `--m-title-size`, `--m-title-leading` | "Pricing", "Details", "Overview" |
| Section title | 28 / 36 / 600 | `--m-section-size`, `--m-section-leading` | "Occupancy based pricing", "Essentials" |
| Section description, tabs, switcher, drawer items, Discard/Save | 18 / 28 | `--m-lead-size`, `--m-lead-leading` | "Set prices based on how many guests…" |
| Field label | 18 / 28 / 500 | `--m-lead-size` | "Guests included" |
| Field help, caption row ("ⓘ 2 channels · Edit per channel") | 16 / 24 | `--text-md` | "Included in your base fee." |
| Tab bar label | 12 / 16 / 600 | `--text-xs` | "Home", "Inbox" |

Desktop keeps 24/500 for the page title (review's rule); only the phone uses the real app's larger title.

## 3 · Shell anatomy (≤ 767px)

```
┌──────────────────────────────┐
│ .h-content (scrolls)          │  page head (§4) · tabs · sections
│   16 px gutters               │
│                               │
├──────────────────────────────┤  .h-m-dock, ONE of:
│ .h-m-tabbar                   │    Home · Inbox · Calendar · Properties · Menu  (58 + safe area)
│  , or, while there is        │
│ .h-m-actionbar                │    Discard | Save, a photo selection, Re-order Cancel | Save
│   something to act on         │    (12 + 48 + 12 + safe area, top border), it REPLACES the tab bar
└──────────────────────────────┘
```

- The global sidebar (`.h-sidebar`) and the property rail (`.h-proplayout__rail`) are hidden. `AppShell` renders `.h-m-dock` (display: none above the breakpoint) as the last row of `.p-frame`: the action slot, then the tab bar. Because the dock is a **grid row**, not `position: fixed`, the page's scroller ends above it: nothing ever hides behind the bar and no screen needs bottom padding for it.
- **Tab bar** (`MobileTabBar`, `.h-m-tabbar`): Home → `/home` (the Hostaway mark as its icon), Inbox → `/inbox`, Calendar → `/calendar`, **Properties** (active on every property page; replaced Metrics), **Menu** → the Menu drawer. Home, Inbox and Calendar are inert in the concept. Active = raspberry icon on a light-pink pill (`--color-m-tab-active-bg`) + raspberry label (`aria-current="page"`). No hover states.
- **Menu drawer**: Getting started (badge), Properties, Guest experience, Direct bookings, Devices, Operations, Search, Settings, then **Act as** (the account switch that lives in the sidebar footer on desktop). Getting started is hidden for Priya, who has no setup.
- **Property sections** (§3a): on any page under `/property/:id`, the **page title itself** ("Listing ⌄") opens the property's sections in a bottom sheet; once the title has scrolled away, the **compact top bar** does.
- **Discard / Save replaces the tab bar** (review, 4 Oct: "never stacked above it, never overlapping content"). The action bar shows only while there is something to act on: a dirty Discard / Save pair, or a page's own bar content (`MobileActionBar`: a photo selection "1 selected on Airbnb · Clear · Hide on Airbnb", Re-order Cancel / Save order). While it shows, the dock hides the tab bar (`.h-m-dock:has(> .h-m-actionbar:not(.is-empty)) > .h-m-tabbar`) and the bar carries the bottom safe area. A clean pair shows nothing (the tab bar stays). The dock is a grid row, so the page's scroller ends above whichever is shown and the last field is always reachable. The "Saved" / "Discarded" flash floats above the dock, it never takes a row.

### 3a · Property section navigation (review, 3 Oct: "I need a menu… to select the different sections"; reworked 4 Oct: "one name only")
The desktop rail (Overview · Shared: Listing base, Knowledge Hub, Calendar, Guest experience, Operations, Smart Listings · Channels: Airbnb / Booking.com / Direct › Listing, Pricing, Availability, Booking policies) has one phone equivalent, rendered once by `PropertyLayout`: the **Sections sheet**, opened by the page's own title.

- **Pattern:** the iOS title menu (tap the large title to jump anywhere; Linear, GitHub, Notion mobile) plus the iOS large-title → navigation-bar collapse. The section is named **once**: the grey "Airbnb › Listing · Sections ⌄" bar and the "···" are gone on phones, because they repeated the page title (review, 4 Oct: "three different ways of solving the same problem").
- **The title is the switcher** (`MobileHead`, §4): "[channel mark] Listing ⌄". The whole title is the tap target (an overlay button, so a chip inside the title, e.g. "Source of truth", stays its own button). Its accessible name reads "Listing: show all sections".
- **Compact top bar** (`.h-m-compactbar`, `PropertyLayout`): when the page head's title has scrolled under the top of the page's scroller, a 44px bar fades in over the top of the scroller (no layout shift): the page's name, centred, 17px semibold, with the channel mark and ⌄; tapping it opens the same Sections sheet. The sticky tab row moves under it (`.is-condensed .ch-tabrow { top: 44px }`). Scroll back up: it fades out. A new page starts expanded. Website phones and the app alike (the app's safe area is already on `#root`).
- **Sheet** (`BottomSheet className="h-m-navsheet" navigation`): titled "Sections" (the property selector right under the title names the property; it sits on the 16px gutter), a fixed 90dvh so expanding a group doesn't make it jump; the body scrolls. It renders the same `ChannelNav` as the desktop rail: "‹ All properties", Overview, SHARED, CHANNELS, the same accordion (the current page's group opens), the same purple tip counts. Rows are 48 tall (`--m-nav-row`), top-level labels 18 px, children 16 px. The current page carries the rail's raspberry left bar and `aria-current="page"`; on open it is scrolled into view. Following any link closes the sheet; Esc, the scrim, the × and dragging the grip down close it too.
- **Sub-pages** (a channel's Strategy, a Hub topic, All photos) keep their own "‹" in the title row (the lead), drawn as the shared 44 × 44 back box (§6, close and back). Their title opens Sections too. The "‹" is `BackLink` (`ds/backlink.tsx`): when the history entry before this one is the target it goes back (`navigate(-1)`), otherwise it replaces this entry with the target, so Back or the edge swipe never returns to the page you just left.
- **Properties from inside Sections**: the selector closes the Sections sheet, then the Properties sheet opens once it has left (`PropertiesSheet`, rendered by `PropertyLayout`). Two sheets are never on screen together (§7).
- Full-page flows outside the shell (Strategy wizard, Booking policies › Configure, Import) have no title switcher: they have their own back.

### 3b · Tablet (768–1023px): the shell steps down, pages don't
At 768 the desktop shell left main ~248px (sidebar 256 + rail 256): page heads, the switcher and the Tips panel overflowed. The tablet step keeps every page on its desktop layout and gives main **≥ 688px** (768 − 72 − scrollbar):

```
┌────┬──────────────────────────────────┐
│ ▣  │ [A] Airbnb › Listing    Sections⌄│  .h-m-sectionbar (the phone's bar, desktop type, 40 tall)
│ ▣  ├──────────────────────────────────┤
│ ▣  │ Listing  [Classic|Canvas]        │  the page, desktop layout; the title row wraps
│ ▣  │ [switcher ··············]        │
│ 72 │ …                                │
└────┴──────────────────────────────────┘
```

- **Global sidebar: icon-only** (`--sidebar-width-collapsed`, its existing collapsed state). Its expand button lays the full 256px sidebar **over** the page (scrim, Esc or any navigation closes it; `AppShell`), so expanding never squeezes main. The host's desktop collapse choice is untouched at ≥ 1024.
- **Property rail: a slide-over behind the section bar.** The `MobileSectionBar` ("where am I · Sections ⌄", the phones' bar until 4 Oct; tablet only now) opens the **desktop rail itself** (same `ChannelNav`, same rows) sliding in from the left over the page, with a scrim (Material's modal navigation drawer, iPadOS sidebar slide-over). Focus goes to the current page's row; Esc, the scrim and any navigation close it; focus returns to the bar. Phones keep the bottom sheet (§3a). `PropertyLayout`, CSS block "TABLET" in `ds/components.css`.
- **Side panels in a narrow split** (`Split`: Tips, Smartify, Hub edit panels): when the split itself is **< 720px** (tablets, and 1024 landscape beside both rails) the panel stops docking (it would leave the form < 300px: money fields ~24px, policy text one word a line) and becomes a **side sheet over the form's right edge** (shadow, no scrim, the form stays live and full width). It's a container query on `.h-split`, so it follows the column, not the viewport; at ≥ 1280 the split is ≥ 768 and docks exactly as before. Phones: a bottom sheet (§7), unchanged.
- **Narrow desktop (1024–1180, `NARROW_DESKTOP_QUERY`, `useIsNarrowDesktop()`)**: on property pages the global sidebar folds itself to the icon rail, as Canvas does (`Sidebar`; its expand button still opens it), so the page head, the tab row and the property switcher (which ellipsizes) fit beside the property rail. Classic's Tips docks there and narrows the form column (340px panel, form ≥ 300px) instead of the side sheet over the form (`ds/v3/ch.css`). At ≤ 860px tall the folded rail's footer icons sit in two columns so none are cut off.
- `.h-proplayout__main` has one `minmax(0, 1fr)` column at every width, so a wide page head can never push the page past the viewport; wide rows scroll inside themselves (`.h-tabs` already does at every width).

### Bottom room and the chat bubble
- The dock is a grid row, so scrollers end above it. The chat bubble is rendered **inside the dock** on phones (`ChatFab docked`): it always sits 16 px above the topmost dock row, the tab bar or the Discard / Save bar, and never on them.
- The bubble is **not shown on Canvas** (`?view=canvas`) on phones: the guest previews' booking cards sit on the right edge it would cover.
- Every page scroller (`.h-content`, and the editor / canvas frames under `.h-proplayout__main`) ends with `--m-fab-clearance` (80 px) of padding, so the last row can be scrolled clear of the bubble.

### The scroll container on phones
There is one vertical scroller per screen, and it sits between the page head's top and the dock (action bar + tab bar).
- Pages rendered in `PageBody` scroll it (`.h-content`).
- Pages with their own frame make that frame the scroller on phones: the listing editor (`.ch-editor`), Canvas (`.ch-canvas`), and `Split`, which becomes one column at ≤767px (`.h-split`).
- Full-page takeovers (the import flow, policy flows) scroll the page body, and their action bar is `MobileActionBar` inline + sticky.
- Never nest two vertical scrollers. Never put a page head inside a `100vh` box: the frame is `height: 100%` grids all the way down (`.p-frame` › `.h-app` › `.h-proplayout`, one `1fr` row on phones; the compact bar is absolutely positioned over the top of `.h-proplayout__main`). Wide content (tables, charts, the P3 grid) scrolls *horizontally* inside its own box.

### Action bar sizing
Buttons share the width equally by default. Add `is-hug` to a short secondary (e.g. "Clear", "Skip for now") so it keeps its content width, and `.h-m-actionbar--compact` for long labels.

## 4 · Page head, one pattern for every property page (review, 4 Oct: "homogenize all of these decisions")

```
┌──────────────────────────────┐
│ [▣ Beautiful Artist Apt… ⌄]  │  (a) property selector, ALWAYS first, full width → Properties sheet
│ [A] Listing ⌄          ✧ Tips│  (b) title = section switcher (+ lead: channel mark / back ‹) · Tips on the right
│ [Classic | Canvas]           │  (c) the page's segmented control, left, on its own row
│ Autopilot is on · Turn off…  │      any other page row (actions, filters)
│ Essentials  Arrival  Locat…  │  (d) the page's tabs, scroll sideways, no tap focus box
└──────────────────────────────┘
```

- **`MobileHead`** (`ds/shell.tsx`) is the only phone head. `PageHead` (sl3) and `PageHeader` (shell) render it at ≤ 767px; desktop and tablet keep their own heads untouched. Props map 1:1: `property` → (a), `title` + `lead` → (b), `titleEnd` → (c), `actions` → next row, `right` → next row, `sub` → under the title. Empty rows don't render.
- **(a) Property selector** (`PropertySwitcher`): full width, never truncated to half; tapping it opens a bottom sheet of the account's properties (photo, name, "area · status", a raspberry check on the current one). Picking one keeps the section you're on (as on desktop).
- **(b) Title**: 30/38/500 (`--m-title-size`). A plain-text title keeps its last word and the ⌄ together, so a long title ("Booking policies") wraps as "Booking / policies ⌄", never leaving the ⌄ alone; the lead and Tips line up with its first line. Outside a property (no shell) the title is plain text.
- **Tips**: the page renders its Tips toggle inside **`<HeadTips>`**; on phones it is portalled to the right end of the title row. It is a purple text button ("✧ Tips", `--color-ai-text`, no box, no count, `.h-m-tipsbtn`), pressed (lavender) while the Tips sheet is open; it hides when there are no tips, as before. Desktop: `HeadTips` renders the old hidden `.ch-tips-m` span, so the desktop Tips stays where it was.
- **No "···"** on phones any more (`PropertyMenuButton` is no longer rendered by any head): everything it opened is the title's Sections sheet.
- Screens with no `PageHead`/`PageHeader` (the Mobile kit only) may use `MobilePageHead`.

## 5 · Tabs

- Every `.h-tabs` scrolls sideways at ≤ 767px (CSS): no scrollbar, the last tab cut at the edge ("Security d…" in the real app), labels 18 px, the 2 px raspberry underline unchanged. A tapped tab shows no focus box (`:focus:not(:focus-visible)`); the keyboard ring stays.
- The shell scrolls the active tab (`[aria-selected="true"]`) into view after each navigation. For rails that change without a navigation, wrap them in `<ScrollTabs>` or call `useActiveTabIntoView(ref)`; `scrollActiveTab(el)` is the one-off.

## 6 · Primitives

| Component | Props | Classes | Use |
|---|---|---|---|
| `useIsMobile()` |, |, | `true` at ≤ 767px |
| `useIsTablet()` |, |, | `true` at 768–1023px; **shell only** (AppShell, PropertyLayout, §3b) |
| `OvMenu` (ds/overview.tsx) | `label, items: { label, onSelect }[]` | `h-ov-menu`, phone: `h-m-menu`, `h-ov-menu__sheetitem`, `is-danger` | every "⋯" row menu; on phones an **action sheet** (see §7) |
| `MobileTabBar` | `items: MobileTab[]` (`key, label, icon (name or node), to? / onClick?, expanded?`), `active` | `h-m-tabbar`, `__item`, `__icon`, `__label` | shell only |
| `MobileDrawer` | `open, onClose, title, label?, overTabBar = true, children` | `h-m-layer(--above-tabbar)`, `h-m-scrim`, `h-m-drawer`, `__head`, `__title`, `__body`, `h-close` (the outlined ×; `h-m-close` retired 4 Oct) | kept for flows outside the shell; the shell's navigation is in sheets now (Menu, property sections) |
| `MobileSectionBar` | `label, group?, icon?, onOpen, expanded?` | `h-m-sectionbar`, … | **tablet only** now (§3b); phones use the title (§3a, §4) |
| `MobileHead` (shell) | `title, lead?, titleEnd?, property?, actions?, right?, sub?, compactTitle?` | `h-m-head`, `__titlerow`, `__lead`, `__title(.is-switch)`, `__titlebtn`, `__text`, `__last`, `__chev`, `__tips`, `__row`, `__sub` | the one phone page head (§4); PageHead / PageHeader render it |
| `HeadTips` (shell) | `children, className?` | portal into `h-m-head__tips`; desktop `.ch-tips-m` | the page's Tips (and Hub's Test) on the title row |
| compact bar |, | `h-m-compactbar(.is-on)`, `__btn`, `__label`; `.h-proplayout__main.is-condensed` | rendered by `PropertyLayout` (§3a) |
| `useInSheet()` / `InSheetProvider` |, |, | true inside `BottomSheet` and PanelStack's phone sheet: a field row there edits in place (no sheet in a sheet) |
| `navCurrent` (sl3) | `(nav, pathname, search?)` |, | the rail's current leaf `{ group?, label, icon?, channel? }` |
| `MobilePageHead` | `title, switcher?, onMore?, moreLabel?` | `h-m-pagehead`, `__row`, `__title`, `__switcher`, `h-m-more` | page heads outside PageHead/PageHeader |
| `MobileMoreButton` / `PropertyMenuButton` | `onClick, label?, expanded?` /, | `h-m-more` | the "···" |
| `ScrollTabs` | `children, label?` | `h-tabs h-m-scrolltabs` | tab rails |
| `MobileActionBar` (alias `StickyActionBar`) | `children` | portals into `h-m-actionbar__target` | custom bar content |
| `useMobileActions` | `{ dirty, onDiscard, onSave, discardLabel?, saveLabel? } \| null` | `h-m-actionbar`, `h-m-actionbar__btn` | the standard Discard / Save |
| `MobileSaveButtons` | `dirty, onDiscard, onSave, discardLabel?, saveLabel?` | `h-btn--secondary/--primary h-m-actionbar__btn` | the pair, inside `MobileActionBar` |
| `MobileActionSlot` |, | `h-m-actionbar` (`.is-empty` hides it) | mounted by `AppShell`; a flow outside the shell may mount its own |
| `BottomSheet` | `open, title, onClose, fullScreen?, footer?, label?, className?, navigation?, pageSave?, children` (`navigation`: any link inside closes it; `pageSave`: no `footer` → the page's registered Discard / Save while dirty, either button closes the sheet) | `h-m-sheet(--full)`, `__grip`, `__head`, `__title`, `__body`, `__foot` (3+ actions wrap: the first gets its own row) | see §7 |
| `MobileSheetSaveButtons` | `className?, onDone?` | `h-m-sheet__foot` | the registered Discard / Save pair while dirty, for a sheet that covers the shell's bar (PanelStack, Canvas, the field sheet) |
| `TopToast` | `open, message, onDismiss, dismissLabel = "Dismiss"` | `h-m-toast`, `__msg`, `__dismiss` | validation the host must read ("The cleaning fee must not exceed €627.73 for Airbnb.") |
| `MobileShellProvider` / `useMobileShell()` | `{ openPropertyMenu? }` |, | `PropertyLayout` provides it; opens the property sections sheet |

**Close and back (review, 4 Oct: "same size and the same rounded corners").** Every × and ‹ icon button on phones is one box: **44 × 44, `--radius-md`**, the outlined close look (white, 1px `--color-close-border`, `--elevation-button`), a 24px glyph at 1.5px, in sheets and drawers (`h-close`), the takeover top bars (Manage photos `h-photos-takeover__btn`, the wizard `h-wz__iconbtn`) and page-head backs (`.h-m-head__lead > .h-btn-icon`). `h-close--sm` (inside chips and toasts) keeps its small box with a 44px hit area.

**Photo tiles:** the select box and the edit pencil (or drag grip) are the same 36 × 36, `--radius-md`, raised, each with a 44px hit area.

**Behaviour shared by drawer and sheet:** portal to `body`; focus moves to the panel, Tab is trapped inside, **Esc**, the backdrop and × close it, focus returns to the opener. Motion (motion.md M-01): the panel slides 24 px (drawer, from the right) or 48 px (sheet, from below) with a fade, `--dur-3` · `--ease-drawer`; exit `--dur-2` · `--ease-exit`; reduced motion keeps only the fade (`--motion-distance` → 0). The drawer stops at the tab bar (the tab bar stays live, as in images/36); sheets cover everything.

### Sticky action bar (Discard / Save)

- Real: 50/50, 48 tall, 8 apart, 18 px labels, top border. **Dirty** = Discard white with border, Save raspberry (images/32, 46). **Clean** = the bar doesn't show at all and the tab bar is back (review, 4 Oct); the disabled pair (Discard grey fill, Save grey outline) only appears where a page draws its own inline bar.
- While shown, the bar **replaces the tab bar** (§3).
- **Standard pair:** call the hook once per page, from whatever owns the dirty state:
  ```tsx
  useMobileActions({ dirty, onDiscard: discard, onSave: save })          // registers while ≤ 767px; unregisters on unmount
  ```
  On phones, hide the section's inline Discard / Save (`.h-section__actions`, `SaveActions`) with a phone rule in the screen's CSS so the pair appears once.
- **Custom content:** `<MobileActionBar><MobileSaveButtons … saveLabel="Save all" /></MobileActionBar>` (or any buttons with `.h-btn`; they get the bar's sizing).
- Several registered at once: **the last mounted wins**. One per page is the rule; if a page has several sections, register the one in view or aggregate `dirty`.
- Desktop: both render nothing, so a screen can call them unconditionally.

## 7 · Sheet, full page or drawer?

### The field sheet, every "open to edit" on phones (review, 4 Oct)
On phones a setting row is a **read-only summary**; editing happens in a bottom sheet, the Canvas field sheet's pattern:

```
┌──────────────────────────────┐
│ Property name  ✧          [×]│  title (+ the row's AI marker) and ×
│ Guests see it in search.     │  help
│ [Beautiful Artist Apt…     ] │  the live field (focused)
│ ⓘ Custom for Airbnb  Use the Base│  the scope caption with its action, live
│ Saving changes this on …     │  the row's note / links ("Edit per day")
├──────────────────────────────┤
│ [Discard changes] [Save changes]│  the page's own pair, while there are unsaved changes
└──────────────────────────────┘
```

- **Implemented once, in `SettingRow`** (sl3): every row built on it, the Listing editor's `FieldRow`, Pricing / Availability's `ScopedRow`, Pricing's `BaseRow` / `ChannelRow`, Listing base › Pricing and Availability, and (phones only) `DetailsField`, gets it. Screens add nothing.
- **Opens on:** a tap on the field (an overlay over the inert summary), or a tap on the caption action ("Customize for Airbnb", "Edit for all channels", "Use the Base"…: the action runs, then the sheet opens on its result with the opposite action in reach), or a tap on a link under the field ("Edit per day": the week opens in the sheet).
- **Footer:** the page's registered Discard / Save (`pageSave`), shown once something is unsaved; Save or Discard also closes the sheet. × / scrim / drag down closes it and keeps the draft (the dock then shows Discard / Save in place of the tab bar).
- **Not a sheet:** toggles (one tap, inline, images/40), locked rows (set by the channel, Knowledge Hub, linked), read-only rows (Autopilot, field visibility "Show": `sheet={false}`), and any row already inside a sheet (`useInSheet()`: Canvas's field sheet, the Calendar's PanelStack sheet). Never a sheet in a sheet.
- **Unsaved changes** (leaving a page with a draft): the same sheet anatomy, footer = the Discard changes | Save changes pair; Keep editing is the sheet's own ×, scrim, drag or Esc (desktop keeps its three-button dialog).


| Pattern | Use when | Examples |
|---|---|---|
| **Bottom sheet** (`BottomSheet`) | a short, focused task or reading tied to the current page; the page stays in context behind it; ≤ ~1.5 screens of content | Tips for this section, "Edit per channel" for one field, a picker with ≤ 10 options, a confirm with a note |
| **Full-screen sheet** (`BottomSheet fullScreen`) | a complex edit that needs the whole screen but still returns to where you were: several fields, its own Save | editing a channel override set, an amenity with details, a policy's configure step when it isn't already a route |
| **Full page** (a route) | the task has its own URL, several steps, or is shared/linked; Back must work | Import, Smart Listings setup, Booking policies › Configure, All photos |
| **Navigation sheet** (`BottomSheet navigation`) | lists of places to go, opened from the bottom like every other mobile panel  | Menu, property sections (§3a) |
| **Action sheet** (`OvMenu` on phones) | a "⋯" row menu: a few actions on one thing | Strategy rows, Overview channel rows, Export calendar › More options |
| **Drawer** (`MobileDrawer`) | navigation for a flow outside the shell that has no sheet |, |
| **Top toast** (`TopToast`) | a validation or a result that blocks nothing but must be read; dismissed by the host | fee limit exceeded, "Saved on 2 channels" |

**Action sheets (every "⋯" row menu, `OvMenu`).** On phones the desktop dropdown (which could open off-screen beside a left-aligned ⋯) becomes a bottom sheet: titled with what it acts on ("More actions for Airbnb" → "Airbnb"), one 52px row per action (`h-m-menu__item h-ov-menu__sheetitem`, medium weight), destructive actions (labels starting Delete / Remove) in error red (`is-danger`, `--color-text-error`), no separate Cancel (grip, scrim, × and Esc close it). Choosing a row closes the sheet first, then runs the action. iOS action sheet / Material modal bottom sheet. Desktop keeps the dropdown with ↑ ↓ Home End.

Desktop side panels (Tips, Smartify, Hub drawers, PanelStack drill-downs, docked sidebars) become **bottom sheets**; desktop modals become **full-screen sheets** unless they're a one-line confirm. Never nest a sheet in a sheet: replace the content, or go to a page.

## 8 · Screen conventions (from the real captures)

- Section: title 28/600 + description 18 muted, then stacked fields; 16 px gutters; no side-by-side columns (`.h-split`, `.p-grid-*` collapse to one column).
- Field: label 18/500, help 16 muted, control full width (44 tall), caption row "ⓘ N channels ············ Edit per channel" under it.
- Toggle rows: label + help left, toggle right; "ⓘ N channels" sits **under the toggle, right-aligned** (images/42).
- Amenity rows: bordered card (name + "All channels" + one-line detail) and a **separate** square trash button (and a pencil when editable) to its right (images/39, 40).
- Overview channel row: stacked, badge + name, then type · owner on one line (never split), the chips together on the next, then the status select full width (images/47). Setting rows (Imported iCals, Export calendar, Connected channels' Review opportunities, Sync settings…) **stack**: title, description, then the link under it (review, 4 Oct); only a toggle stays at the right of its text.
- Calendar (a property's month): 7 narrow columns, price in each cell, stays as a continuous band with the guest name truncated; tapping a night opens the price breakdown as `PanelStack`'s level 1 (M-19) in a bottom sheet (scrim, grip, 90dvh; review, 3 Oct: every sidebar interaction is a bottom sheet on phones), and drilling into Fees/Markups/etc. slides the next level in from the right inside the same sheet with "‹ {previous title}". The page's Discard / Save (`useMobileActions`) moves into the sheet's footer (`MobileSheetSaveButtons`) because the sheet covers the shell's bar. A property's own Calendar page (`PropertyCalendar`) puts its docked Pricing | Availability sidebar behind a "Pricing & availability" toolbar button that opens it as a bottom sheet; the months take the full width.
- Image numbers: files as saved (32 fee edit + keyboard · 36 property drawer · 39–40 amenities · 42 toggles · 44 Home · 45 Essentials photos · 46 error toast · 47 Overview · 48–49 Arrival).
- Link text stays black, underlined, medium (DS "Text link"); raspberry links only where the real app has them ("Details & Pricing").

## 9 · The viewer and the kit

- `/mobile` on a desktop: a 390 × 844 frame that iframes the app's real routes (same origin, so the phone layout applies inside it), a route picker (Overview, Listing › Essentials, Arrival, Booking policies, Photos, Knowledge Hub, Calendar, Smart Listings setup, Import, Mobile kit), and "Open full screen". The frame simulates the home-indicator safe area (`--m-safe-bottom: 20px` set on the iframe's document).
- `/mobile` on a phone: the same routes as a list.
- `/mobile/kit` at phone width: the action bar (hook and portal), bottom sheet, full-screen sheet and top toast working together.

## 10 · Ownership

The shell layer (AppShell, PropertyLayout, `ds/shell.tsx`, `ds/mobile.tsx`, the MOBILE CSS and tokens) belongs to the mobile layer. Each screen owner adapts their own screen with these primitives and a phone block in their own CSS; add new phone patterns here and in DS.md first.

### Review pass (4 Oct, review's screenshots 168–177 + Coordinator)
- **Sections sheet** opens with the property selector at its top (full width, the page head's control; it opens the Properties sheet). Rows 48 px, group labels 12 px medium, lighter dividers.
- **Page title** 24 / 30 on phones (`--m-title-size`). **Classic | Canvas** sits at the right of the title row, text only, 44 px tall; the compact top bar mirrors it at its top right (`CompactEndCtx`). Desktop keeps icons and 24 px.
- **Tooltips on phones** open as a bottom sheet (title, text, ×) from `TooltipLayer`; desktop hover is unchanged.
- **Fields** take the full phone width; **content** ends with 16 px under the 80 px chat clearance.
- **Knowledge Hub on phones**: Test is a full-width button on its own line under the title, Tips on its own line below it (never in the tab row). Same data and counts as desktop (`/hub/questions`: 399 questions from 312 conversations; Amenities · 10 questions · 1 needs an answer).

## App mode · the prototype as Hostaway's mobile app (3 Oct)

> review, 3 Oct: "an environment for the mobile device… it feels mobile… sliding animations… it doesn't have to be a mobile app, it could be a web version, but make sure it replicates the app experience." Two environments from one codebase: the **website** (everything above, unchanged) and the **app** (this section). Run / install: `prototype/APP-MODE.md`. Code: `prototype/src/app/**`. CSS: `ds/v3/app.css` (loaded only in app mode). Patterns are iOS UIKit's (navigation push, interactive pop, sheet detents) as the Mobbin library shows them in Airbnb, Shopify and Notion (research/references/mobile/05, 04); chrome stays the real app's (images/32–49).

**A1 · On.** Build env `VITE_APP_MODE=mobile` (the mobile Vercel project: the app at `/`), or any build at **`/app`** (the router runs under the `/app` basename, so every link stays in app mode). `<html class="is-app">`; `useIsMobile()` is always true and `useIsTablet()` false, so every screen uses its phone layout. The app's home is the property: `/` → `/property/neukolln/overview`. The document behaves like an app: `touch-action: manipulation` (no 300 ms delay), no tap highlight, no document overscroll or pull-to-refresh, each scroller contains its own overscroll with momentum, chrome (tab bar, compact bar, title row, buttons) isn't selectable.

**A2 · Device.** On a phone (coarse pointer, small screen) the app is full screen, padded by `env(safe-area-inset-*)` (`--m-safe-top` on `#root`, `--m-safe-bottom` in the tab bar and sheets). On a desktop browser the page draws a **390 × 844 iPhone** (bezel, Dynamic Island, a 9:41 status bar, home indicator) that iframes the same URL, so the phone layer runs natively at 390 px; inside it `--m-safe-top: 47px` and `--m-safe-bottom: 34px`. The address bar follows the app's route. Installable: a web app manifest (`public/pwa/app.webmanifest` for `/app`, `root.webmanifest` for the mobile build; `display: standalone`, portrait, white), PNG icons from the Hostaway mark (`tools/app-icons.mjs`), `apple-mobile-web-app-capable`, status bar `default` (white with dark text, as in the captures), `viewport-fit=cover`.

**A3 · Navigation transitions** (View Transitions API through react-router's `viewTransition`; `nav.ts` writes `<html data-nav>`):

| Move | When | Motion |
|---|---|---|
| **push** | a drill-down link (Strategy › Airbnb strategy, Hub › a topic), opening Manage photos | the new page slides in from the right **over** the old one (shadow), which drifts −30% and dims to 94% · `--dur-3` · `--ease-drawer` |
| **pop** | back: browser, swipe, `navigate(-1)`, any "‹" link, or a link up the path | the reverse: the page slides off to the right, the previous one returns from −30% |
| **fade** | the tab bar, the Sections sheet, the Menu (lateral moves) | cross-fade, `--dur-2` |
| **none** | the same page: another Listing/Details tab, Classic ↔ Canvas, a redirect | the page's own motion (M-12 underline, M-18 spinner) |

The tab bar never moves (its own transition name); the action bar cross-fades. Manage photos (an in-place takeover, `?photosOpen=1`) slides over a still page and back. Without View Transitions (older Safari, Firefox) the new page enters with a short slide-and-fade in the same direction. Reduced motion: every move is a 150 ms cross-fade.

**A4 · Swipe back.** A 16 px strip on the left edge (the content gutter, so it covers nothing tappable; a tap on it passes through). Drag right: the page follows the finger with a shadow; underneath, the previous page (a DOM snapshot taken when you left it, with its scroll positions) drifts in from −30% and brightens. Release past a third of the width or flick faster than 0.5 px/ms → it completes and goes back (no second animation); otherwise it springs back. On a takeover it closes the takeover. Hidden while a sheet is open; nothing happens when there's no back.

**A5 · Sheets.** Sheets rise from the bottom edge (100% → 0) and leave the same way. The drag is physical: dragging up resists (rubber band), the scrim lightens as the sheet goes down, a release past 30% of the sheet's height or a downward flick (> 0.5 px/ms) dismisses it from where the finger left it, anything else springs back. On touch, the body drags the sheet too once it's scrolled to the top (iOS). The website keeps the original drag (grip / head, 96 px threshold).

**A6 · Large title.** The page title stays the real app's large title and is the Sections switcher (§4). When it scrolls under the top, the phone layer's compact bar (§3a, website and app alike) fades in: the page name, centred, 17 px semibold, with the ⌄ that still opens Sections, flat with a hairline. Scroll back up and it fades out.

**A7 · Press and feedback.** Buttons, chips and the switcher scale to .97 and dim on press; tab bar icons scale to .88; rows (sections sheet, menu, action sheets) highlight grey. No hover-only affordance. Toasts sit at the top under the status bar (the real app's validation toast); the save toast and the account-switch toast stay at the bottom over the dock. Discard / Save takes the tab bar's place (§3).

**A8 · Switching account (Menu › Act as).** The switch keeps you on the property page you're on when the next account has that property (phones and app; desktop keeps each account's start page), so it never lands on Properties' Groups / Rules / Activity, those, and the Overview's Portfolio links, are out of reach on phones (the property is the feature). The confirmation is the DS toast, compact: "(M) You're now Marta" over the role line, 3 s, a tap dismisses it (toasts on phones never pause on a tap).

**Unchanged in app mode:** the tab bar (Home, Inbox, Calendar inert · Properties navigates · Menu opens a sheet), the page head (§4) and its Sections sheet, Discard / Save in place of the tab bar, the field sheet (§7), every screen's own phone layout.
