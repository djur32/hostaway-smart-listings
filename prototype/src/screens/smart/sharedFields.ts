/* Property › Overview's Field visibility: which fields are shared by every connected channel (moved out of
 * PropertyOverview.tsx so the account defaults can write them too, screens/smart/accountDefaults.ts). */
import type { FieldState } from '../../ds'
import { LISTING_TABS, type ListingChannel } from '../../data/sl3'
import { classicFields, PRICE_TABS } from '../../data/v3-ch'
import { pricesFor, availabilityFor } from '../../data/property-listing'
import { AVAIL_FIELDS } from '../../data/availability'
import { fieldChannels } from '../details/shared'

/** Every field that is genuinely shared across channels today — no per-channel customization, Base/Customize-for-
 *  {channel} pattern (`inherit`/`override`), or Knowledge Hub governance (`hub`): just the one uniform value, the
 *  same on every *connected* channel (`state: 'listing'` on each, V3-SPEC §1). "still
 *  seeing tags and languages as opposed to a general toggle for everything that is shared across channels" — this
 *  isn't a fixed list of examples, it's derived from the same field enumeration the Classic editor uses
 *  (`classicFields`, data/v3-ch.ts — Hostaway's own order, tab by tab, EXTRA_FIELDS included), so a field that
 *  moves to/from `listing` elsewhere in the data model moves to/from this section automatically. Scoped to the
 *  property's actual connected channels (`chs`), not a hardcoded 3-channel assumption — same spirit as
 *  PricingPanels.tsx's scopeText.
 *  3 Oct: every channel screen, not just Listing. The
 *  shared rows of Pricing (`price:<key>`, data/property-listing.ts pricesFor) and Availability (`avail:<key>`,
 *  availabilityFor + AVAIL_FIELDS) are enumerated the same way, by the real keys those screens' ScopedRow reads
 *  (screens/channel/common.tsx useSharedVisibility). Booking policies has none: every policy is the channel's own
 *  (data/v3-ch.ts CANCELLATION, data/policies.ts POLICY_MODEL), so the control rightly never touches it. */
const isShared = (state: Partial<Record<ListingChannel, FieldState>>, chs: ListingChannel[]) => {
  const on = chs.filter((c) => state[c])
  // 'hub' facts (Property type, Room type, Maximum occupancy) follow Show / Don't show too but stay
  // locked under Edit: FieldRow / ScopedRow render a hub-governed field locked whatever this control says.
  return on.length > 0 && on.every((c) => state[c] === 'listing' || state[c] === 'hub')
}
export function sharedFieldKeys(pid: string, chs: ListingChannel[]): string[] {
  const out: string[] = []
  for (const { id: tab } of LISTING_TABS) {
    for (const def of classicFields(tab)) {
      const on = fieldChannels(def, chs)
      if (on.length > 0 && on.every((c) => def.state[c] === 'listing' || def.state[c] === 'hub')) out.push(def.key)
    }
  }
  const prices = pricesFor(pid)
  for (const { id: tab } of PRICE_TABS) for (const r of prices[tab]) if (isShared(r.state, chs)) out.push(`price:${r.key}`)
  const avail = availabilityFor(pid)
  for (const f of [...AVAIL_FIELDS.general, ...AVAIL_FIELDS.rules]) {
    const r = avail.find((x) => x.key === f.key) ?? f.row // same lookup as screens/channel/Availability.tsx rowOf
    if (isShared(r.state, chs)) out.push(`avail:${f.key}`)
  }
  return out
}

