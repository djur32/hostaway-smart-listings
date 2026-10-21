# Channel marks

Identification only (CONVENTIONS §6.6). Drawn to match how Hostaway renders platform glyphs in lists (HS-48 "Platforms" column, HS-06 connect buttons).

| File | Mark | Source | Colour |
|---|---|---|---|
| hostaway.svg | Hostaway "o" (Direct) | redrawn from HS-22 logo | `--color-channel-direct` #ed3c6a |
| airbnb.svg | Airbnb Bélo | Simple Icons (CC0) path | #ff5a5f (sampled #ff5a5e) |
| booking.svg | Booking.com "B." | redrawn from HS-48 | #273b7d + dot #499fdd (sampled) |
| vrbo.svg | Vrbo hatched V | redrawn from HS-48 (simplified) | #0885f2 (sampled) |
| agoda.svg | Agoda "a" + dots | redrawn from HS-48 (Hostaway shows it greyed when not connected) | #cdcdcd + pastel dots (sampled) |
| expedia.svg | Expedia mark (square and arrow) | Simple Icons (CC0) path; hex from brandfolder.com/portals/brand-expedia | #191e3b |
| google.svg | Google "G" | Simple Icons (CC0) path, mono | gray-400 — (not seen as a glyph in the screenshots; "List properties on Google" is a help link, HS-16) |

States: **connected** = full colour · **not connected / unlisted** = `opacity: var(--color-channel-inactive-opacity)` (HS-16 faded glyphs) · **muted row** = row at `--opacity-row-inactive`.

## Badge marks (React `Mark`, review 30 Sep)

`glyph/*.svg` are the same marks redrawn in `currentColor` and inset for a badge; `ds/tools/build_icons.py` turns them into `#chg-NAME` symbols. `Mark` (prototype/src/ds/primitives.tsx) draws a rounded square (rx 5.5 of 24, ~23%) filled with the channel token (`--color-channel-airbnb | -booking | -vrbo | -direct | -google`) and the glyph in white (`--color-text-white`). Booking.com: white "B" and white dot. Not connected (`inactive`): the badge turns `--color-gray-300`, glyph still white. The full-colour `#ch-*` symbols stay for the static gallery and fidelity frames.
