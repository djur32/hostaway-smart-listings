/* Channels › {channel} › Availability (Hospitable replica of Property › Availability, HS-37 General and HS-38 Booking rules).
 * The five stay rules that already exist are REUSED from data/v3-ch.ts AVAILABILITY (keys `avail:min_stay`, `avail:max_stay`,
 * `avail:advance`, `avail:prep`, `avail:window`), so the Knowledge Hub, the channel Overview and Review & push read the same
 * values from sl3.custom / sl3.base. Only the check-in / checkout day restrictions are new here.
 * Labels and help text on this page are the real product's wording (HS-37/38); the data rows keep their own short labels.
 * Scope per field: research/current-state/field-inventory.csv (real "Edit per channel" links) and ia/canonical-fields.csv
 * (`avail.*`): min stay, max stay and advance notice can differ per channel; availability window, preparation time and the
 * day restrictions are one value for every channel (v3-ch.ts / canonical "unify by default"). */
import type { ListingChannel } from './sl3'
import { AVAILABILITY, type AvailRow } from './v3-ch'

export type AvailTab = 'general' | 'rules' | 'instant-book'
export const AVAIL_TABS: Array<{ id: AvailTab; label: string; desc: string }> = [
  { id: 'general', label: 'General', desc: 'Set the core rules for when your property can be booked.' },
  { id: 'rules', label: 'Booking rules', desc: 'Set booking rules to control when and how your property can be booked.' },
  { id: 'instant-book', label: 'Instant book', desc: 'Choose how booking requests are handled: automatically accept all, automatically accept low-risk only, or send requests for manual review.' },
]

/** New rules (not in v3-ch.ts): days guests can't arrive / leave. Stored as "None" or "Fri, Sat" (Sunday first). */
export const AVAIL_DAYS: AvailRow[] = [
  { key: 'checkin_days', label: 'Restricted check-in', help: 'Guests can’t start stays on these days.', base: 'None', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, options: [] },
  { key: 'checkout_days', label: 'Restricted checkout', help: 'Guests can’t end stays on these days.', base: 'None', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, options: [] },
]

export type AvailControl = 'nights' | 'select' | 'days'
export interface AvailField {
  /** Row key without the `avail:` prefix. */
  key: string
  /** The real product's label and help (HS-37/38). */
  label: string
  help: string
  control: AvailControl
  row: AvailRow
  /** Plain text under the caption, for channels where the rule behaves differently. */
  note?: Partial<Record<ListingChannel, string>>
  /** "Edit per day" (HS-37): the per-date override lives in the Calendar. */
  perDay?: boolean
}

const row = (k: string): AvailRow => {
  const r = AVAILABILITY.find((x) => x.key === k) ?? AVAIL_DAYS.find((x) => x.key === k)
  if (!r) throw new Error(`availability: no row ${k}`)
  return r
}

export const AVAIL_FIELDS: Record<Exclude<AvailTab, 'instant-book'>, AvailField[]> = {
  general: [
    { key: 'min_stay', label: 'Minimum stay length', help: 'The shortest stay guests can book.', control: 'nights', row: row('min_stay'), perDay: true,
      // help.hospitable.com/15600605 + /9857547: pushed to Booking.com's "Minimum stay from arrival" on the parent rate plan only
      note: { booking: 'Booking.com gets this as the minimum stay from arrival on your standard rate plan. Rate plans you add in the Extranet keep their own.' } },
    { key: 'max_stay', label: 'Maximum stay length', help: 'The longest stay guests can book.', control: 'nights', row: row('max_stay') },
    { key: 'window', label: 'Availability window', help: 'How far in advance guests can book.', control: 'select', row: row('window') },
  ],
  rules: [
    { key: 'checkin_days', label: 'Restricted check-in', help: 'Guests can’t start stays on these days.', control: 'days', row: row('checkin_days') },
    { key: 'checkout_days', label: 'Restricted checkout', help: 'Guests can’t end stays on these days.', control: 'days', row: row('checkout_days') },
    { key: 'prep', label: 'Preparation time', help: 'Turnover nights blocked before and after each stay.', control: 'select', row: row('prep') },
    { key: 'advance', label: 'Advance notice', help: 'Minimum time between booking and check-in.', control: 'select', row: row('advance') },
  ],
}

/** Hospitable's limit for stay lengths (help.hospitable.com/9857547: maximum stay up to 1,125 nights). */
export const MAX_NIGHTS = 1125
export const nightsOf = (v: string): string => (v.match(/\d+/)?.[0] ?? '')
export const nightsText = (n: string): string => (n === '' ? '' : `${n} ${n === '1' ? 'night' : 'nights'}`)

/* ---------- Instant book (HS-39): the real matrix, one row for this channel ----------
 * Saved per channel under `policy:instant` (the key Booking policies used), with ids from data/v3-ch.ts INSTANT_BOOK,
 * so the Hub and Review & push keep reading it. Column wording is the real screen's. */
export const INSTANT_KEY = 'policy:instant'
export const INSTANT_QUESTION = 'How should booking requests be handled?'
export const INSTANT_COLUMNS = [
  { id: 'all', label: 'Automatically accept all', sub: 'Accept all guests' },
  { id: 'low', label: 'Automatically accept low risk', sub: 'Accept low-risk guests' },
  { id: 'review', label: 'Review and approve', sub: 'Manually review all booking requests' },
]
/** Booking.com has two booking modes (instant or request): no "low risk" (help.hospitable.com/15600605, /9857547). */
export const INSTANT_UNAVAILABLE: Partial<Record<ListingChannel, string[]>> = { booking: ['low'] }
export const INSTANT_NOTE: Partial<Record<ListingChannel, string>> = {
  booking: 'Booking.com offers instant booking or requests to book. Requests are only for apartments, holiday homes and villas, and a listing created on Booking.com before you connected may stay on instant booking.',
}
