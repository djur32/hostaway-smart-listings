# Motion · system-level micro-interactions

> S02 · R-155. Tokens live in `ds/tokens.css` (§ MOTION). Screens use these specs; they don't invent motion. Demos: `ds/components/index.html#motion`.

## Principles

1. **Motion explains a change of state, nothing else.** Something moved, arrived, was accepted, or synced — the animation says which. No decorative loops except "the AI is working" and "listening".
2. **Borrow Hostaway's timing.** Their CSS already uses 150 ms `cubic-bezier(.4,0,.2,1)` for almost every transition, plus an expo-out `(.16,1,.3,1)`, a drawer curve `(.32,.72,0,1)` and a spring `(.34,1.56,.64,1)` (public stylesheet). We name them; we don't add new ones.
3. **Fast in, faster out.** Entrances use `--ease-enter`/`--ease-emphasized`; exits use `--ease-exit` at one step shorter.
4. **The host's changes feel instant; the AI's feel considered.** Host edits: `--dur-1`. AI results: `--dur-3` so a new value is noticed.
5. **Reduced motion keeps the information, drops the travel.** Under `prefers-reduced-motion: reduce` every `--dur-*` collapses to `--dur-1` (150 ms), `--motion-distance` becomes 0 and loops stop; each pattern below lists what replaces it.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--dur-1` | 150 ms | hover, press, toggle, chip flip, tab colour |
| `--dur-2` | 200 ms | dropdowns, tooltips, cross-fades, value morph (small) |
| `--dur-3` | 300 ms | panels, drawers, conflict collapse, accepted value, toast |
| `--dur-4` | 500 ms | sequences (import cascade step), sync pulse half-cycle |
| `--stagger` | 40 ms | delay between items in a list entrance |
| `--motion-distance` | 8 px | how far things rise/slide (0 under reduced motion) |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | default for state changes |
| `--ease-enter` | `cubic-bezier(0,0,.2,1)` | things appearing |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | things leaving |
| `--ease-emphasized` | `cubic-bezier(.16,1,.3,1)` | AI results landing, tab underline, autonomy track |
| `--ease-drawer` | `cubic-bezier(.22,.72,0,1)` | side panels, bottom sheets, the unsaved-changes bar |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | checkmarks, radio dot, autonomy stop — small objects only |

## Specs

| # | Interaction | What moves | Duration · easing | Reduced motion |
|---|---|---|---|---|
| M-01 | **Panel slide-in** (AI panel, comps drawer) | panel translates 24 px → 0 and fades in; content column does not reflow until the panel settles | `--dur-3` · drawer; exit `--dur-2` · exit | fade only, `--dur-1` |
| M-17 | **Side panel in a split** (Tips beside the listing form / canvas) | barely there: the sheet, pinned right, fades in from 6 px (¾ `--motion-distance`); the main column snaps to its new width with no animation, and nothing inside it rescales (photo thumbs wrap, the canvas keeps its zoom). Close: the sheet fades out, then the column snaps back. The page head never moves (review 30 Sep: the first version was "kind of extreme") | `--dur-1` · enter; exit `--dur-1` · exit | fade only |
| M-18 | **Tab / view loading** (listing editor tabs, channels, Classic ↔ Canvas) | a 24 px raspberry ring spinner (`h-spinner`) centred in the content area for ~350 ms; the header stays | spin `.7s` linear | same (a loading indicator is essential motion) |
| M-19 | **Panel stack** (`PanelStack`: Calendar › a night › a pricing section › one value per channel; D-927) | the opened level's column grows 0 → 384px from the right edge, its sheet pinned to the column's left edge at full width, so it **slides in from the right**; at the same time the previous level's column shrinks to a 44px spine (its sheet fades out, the spine and its vertical title fade in) and the main content narrows in step. Nothing inside any column rescales. Back (spine, "‹", Esc) and close are the exact reverse: the top level slides out to the right while the previous one opens from its spine; levels that leave stay mounted for one slide. Entering uses `@starting-style` (width 0). Phones: full-screen sheets translate 100% → 0 over the previous one, which drifts −32px (4 × `--motion-distance`); back reverses. Subtle on purpose (review rejected a big slide-and-resize as "extreme" and a fade-and-snap as "clunky") | `--dur-drawer` (160 ms) · `--ease-drawer`, both ways | widths snap, only the sheet/spine fade (`--dur-1`); phones fade the sheet, no travel |
| M-20 | **Unsaved-changes bar** (`UnsavedBar`: pins to the top the moment any registered draft is dirty) | the strip fades in and rises 4 px (½ `--motion-distance`) from the very top of the viewport — "quick, not gradual" (review, 1 Oct), so it mostly just *appears*; no bounce, no width change, the page underneath keeps scrolling normally. Clean again (saved or discarded): reverse, one step shorter | `--dur-drawer` (160 ms) · `--ease-drawer`; exit `--dur-1` | fade only, no travel |
| M-02 | **Suggestion accept** | the field's value cross-fades + rises `--motion-distance` with a 2 px blur clearing (`h-value-in`); source chip flips "AI suggestion" → "✓ Accepted" (green) with a cross-fade; Accept button pops 1.04 | value `--dur-3` · emphasized; chip `--dur-2` · enter; pop `--dur-2` · spring | instant value swap; chip colour change only |
| M-03 | **Regenerate** | suggestions are replaced by a lavender shimmer skeleton (`h-skeleton`, 1.4 s loop) while the sparkle glyph breathes (`h-sparkle-spin`); new options cross-fade in, staggered | shimmer loop; entrance `--dur-2` · enter + `--stagger` | static lavender skeleton + "Generating…" text; no stagger |
| M-04 | **Conflict resolved** | the conflict card fades, lifts `--motion-distance` and collapses its height to 0 (`.h-conflict.is-resolved`); the fact row below gets the M-02 value landing | `--dur-3` · standard | card removed; row value swaps; a polite live-region message announces "Cleaning fee set to €25 on all channels" |
| M-05 | **Sync pulse** | the green sync dot emits one ring that scales ×2.2 and fades (`h-ping`), **once**, when a change is confirmed on a channel | 2 × `--dur-4` · standard | dot turns green; no ring |
| M-06 | **Reorder drag** (photos, facts) | on grab: scale 1.02, −0.5° tilt, floating shadow; neighbours slide to make room; on drop: settle to 1.0 | lift `--dur-1` · standard; neighbours `--dur-2` · standard | no scale/tilt; shadow only; keyboard reordering (↑/↓ with Space to grab) always available |
| M-07 | **Toast** | rises `--motion-distance` + fades in bottom-left; stays 5 s (10 s if it has Undo); exits by fading | enter `--dur-3` · emphasized; exit `--dur-2` · exit | fade only |
| M-08 | **Skeleton shimmer** | gradient sweeps left→right; neutral grey for data, lavender for AI | 1.4 s loop · standard | static block |
| M-09 | **Voice waveform** | 28 bars oscillate height with offset delays (`h-wave`), amplitude from mic level; transcript words fade from faint to strong as they finalise | 1 s loop; words `--dur-2` | static bars at mid height; transcript still updates |
| M-10 | **Persona switch** (demo) | content cross-fades; layout changes (e.g. P3 table vs P1 single card) use a FLIP transition so blocks glide to new positions | `--dur-3` · emphasized | cross-fade only |
| M-11 | **Import progress** | per-channel rows arrive one by one (`h-row-in`, rise + fade) as each channel finishes; counts tick up; status spinner → green check with spring | rows `--dur-3` · emphasized + `--stagger`; check `--dur-2` · spring | rows appear without travel; spinner replaced by "Importing…" text |
| M-12 | **Tabs** | raspberry underline scales in from the label's centre | `--dur-2` · emphasized | colour change only |
| M-13 | **Autonomy dial** | the accent track fills to the chosen stop; the stop's dot springs to 1.1 | track `--dur-3` · emphasized; dot `--dur-2` · spring | instant fill |
| M-14 | **Toggle / checkbox / radio** | thumb slides 12 px; check and dot spring in | `--dur-2` · emphasized; `--dur-1` · spring | instant |
| M-15 | **Modal / dropdown** | scrim fades; modal rises + scales .98 → 1; dropdown drops 4 px | modal `--dur-3` · emphasized; menu `--dur-2` · enter | fade only |
| M-16 | **Coach mark hotspot** | ring pings every 1.6 s until the coach mark is opened or dismissed (max 3 cycles per session) | 1.6 s · standard | static accent dot |

## Rules

- **Never animate layout of the content column while the host is typing.** Suggestions and syncs arrive around the field, not inside it, until the host accepts.
- **One animation per moment.** If a value lands (M-02), the sync pulse (M-05) waits until the channel confirms — they never play together.
- **Loops are for waiting only** (M-03, M-08, M-09, M-16) and stop the moment the wait ends.
- **Undo is the reverse animation** at `--dur-2`, never a new effect.
- Implemented as CSS classes in `ds/components.css` §11 (`h-panel-enter`, `h-crossfade-enter`, `h-drag-lift`, `is-updated`, `is-resolved`, `is-entering`, `is-pulse`) so the prototype (S09) toggles classes rather than writing keyframes; S14 extends this file for edge-case states.
