/* WS-CV · the facts a replica page states that have a setting elsewhere (audit 3 Oct, C-1/C-2/C-3): house rules
 * (check-in/out times, children, pets, smoking, events), maximum guests, the cancellation policy and the price lines.
 * Every one is read from the same place its settings page reads it, as this channel's effective value, the Rules
 * fields through the Canvas's own `text()` (Base › this channel's value › your edit), Policies through
 * useChannelPolicy / BOOKING_POLICY, Pricing through the same `price:<key>` rows (with this channel's markup), so the
 * page can never contradict its settings. Wording follows each channel's real page (layout, values). */
import { AIRBNB_CANCELLATION, AIRBNB_LONG_TERM, BOOKING_POLICY, DIRECT_CANCELLATION, optionById, type ChannelPolicy } from '../../data/policies'
import { pricesFor, type PriceLine } from '../../data/property-listing'
import type { ListingChannel } from '../../data/sl3'
import { fieldByKey, type PriceTab } from '../../data/v3-ch'
import { STAY } from '../../data/v3-cv'
import type { SL3State } from '../../store/store'

type Custom = Record<string, string | null> | undefined

/** A Pricing row's value on this channel, read exactly as channel Pricing reads it: your edit › the channel's own value
 *  (custom rows) › the Base edit › the property's default. 0 when the channel doesn't have the row. */
export function priceNum(pid: string, ch: ListingChannel, s: SL3State, tab: PriceTab, key: string): number {
  const r = pricesFor(pid)[tab].find((x) => x.key === key)
  if (!r || !r.state[ch]) return 0
  const cv = (s.custom[ch] as Custom)?.[`price:${key}`]
  if (typeof cv === 'string') return Number(cv) || 0
  const own = (r.state[ch] === 'override' || r.state[ch] === 'only') && cv !== null ? r.value?.[ch] : undefined
  return Number(own ?? s.base[`price:${key}`] ?? r.base) || 0
}

/** What a guest pays on this channel's page: Pricing's rates plus this channel's markup, its cleaning fee, and Airbnb's
 *  guest service fee (14%, ). The same for every property, the scenario one included. */
export function canvasPriceLine(pid: string, ch: ListingChannel, s: SL3State): PriceLine {
  const markup = priceNum(pid, ch, s, 'base', 'markup')
  const up = (x: number) => Math.round(x * (1 + markup / 100))
  const night = up(priceNum(pid, ch, s, 'base', 'nightly')), weekend = up(priceNum(pid, ch, s, 'base', 'weekend'))
  const cleaning = priceNum(pid, ch, s, 'fees', 'cleaning')
  const service = ch === 'airbnb' ? Math.round((night * STAY.nights + cleaning) * 0.14) : 0
  return { night, weekend, cleaning, service }
}

/** The most guests a booking can have on this channel (Pricing › Occupancy based › Maximum occupancy). */
export const maxGuests = (pid: string, ch: ListingChannel, s: SL3State) => priceNum(pid, ch, s, 'occupancy', 'max')

/* ---------- house rules ---------- */
type Text = (key: string) => string
/** A Rules field's value as the page shows it; a listing-wide field the store has never touched reads its default. */
export const ruleValue = (text: Text, key: string) => text(key) || fieldByKey(key)?.base || ''
const yes = (text: Text, key: string) => ruleValue(text, key) === 'Yes'
/** "3:00 PM" → "15:00" (Booking.com writes times on the 24-hour clock). */
export const to24 = (t: string) => {
  const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!m) return t
  let h = Number(m[1]) % 12
  if (/pm/i.test(m[3])) h += 12
  return `${String(h).padStart(2, '0')}:${m[2]}`
}
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

/** Airbnb › Things to know › House rules: the summary lines (check-in, checkout, maximum guests). */
export function airbnbRuleLines(text: Text, guests: number): string[] {
  return [`Check-in after ${ruleValue(text, 'checkin')}`, `Checkout before ${ruleValue(text, 'checkout')}`, `${plural(guests, 'guest')} maximum`]
}
/** Direct: one line of times. */
export const directRuleLine = (text: Text) =>
  `Check-in ${ruleValue(text, 'checkin')} – ${ruleValue(text, 'checkin_end')} · Checkout ${ruleValue(text, 'checkout')}`
/** Booking.com's House rules table: the property's own rows, with every row that has a setting re-read from it. */
export function bookingRuleRows(rows: Array<[icon: string, label: string, text: string]>, text: Text, cancel: string): Array<[string, string, string]> {
  return rows.map(([icon, label, line]): [string, string, string] => {
    switch (label) {
      case 'Check-in': {
        const end = ruleValue(text, 'checkin_end')
        return [icon, label, /flexible/i.test(end) ? `From ${to24(ruleValue(text, 'checkin'))}` : `From ${to24(ruleValue(text, 'checkin'))} to ${to24(end)}`]
      }
      case 'Check-out': return [icon, label, `Until ${to24(ruleValue(text, 'checkout'))}`]
      case 'Cancellation/ prepayment': return [icon, label, cancel]
      case 'Children and beds': return [icon, label, yes(text, 'children') ? (/welcome/.test(line) ? line : 'Children of any age are welcome.') : 'Children are not allowed.']
      case 'Pets': return [icon, label, yes(text, 'pets') ? 'Pets are allowed on request. Charges may be applicable.' : 'Pets are not allowed.']
      case 'Smoking': return [icon, label, yes(text, 'smoking') ? 'Smoking is allowed.' : 'Smoking is not allowed.']
      case 'Parties': return [icon, label, yes(text, 'events') ? 'Parties/events are allowed.' : 'Parties/events are not allowed.']
      default: return [icon, label, line]
    }
  })
}

/* ---------- cancellation ---------- */
const DAY = 86_400_000
const ARRIVAL = (() => { const [d, mon, y] = STAY.from.split(' '); return new Date(`${mon} ${d}, ${y} 12:00`) })()
const before = (days: number) => {
  const d = new Date(ARRIVAL.getTime() - days * DAY)
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`
}
/** Days before arrival a guest can still cancel for a full refund, per policy id (data/policies.ts wording). */
const FREE_DAYS: Record<string, number | undefined> = { flexible: 1, moderate: 5, firm: 30, strict: 14 }

export interface CancelFacts {
  /** The policy's name in Policies ("Moderate"). */
  label: string
  /** The line the channel's page prints. */
  line: string
  /** The read-only explanation in the Canvas panel. */
  lock: string
}
export function cancelFacts(ch: ListingChannel, policy: ChannelPolicy): CancelFacts {
  if (ch === 'booking') {
    return {
      label: BOOKING_POLICY.label,
      line: `Free cancellation before ${before(1)} ${ARRIVAL.getFullYear()}`,
      lock: `${BOOKING_POLICY.label}: ${BOOKING_POLICY.body.charAt(0).toLowerCase()}${BOOKING_POLICY.body.slice(1)} Non-refundable rate: ${BOOKING_POLICY.nonRefundable}. Booking.com sets it per rate plan in its Extranet.`,
    }
  }
  if (ch === 'direct') {
    const o = optionById(DIRECT_CANCELLATION, policy.cancellation)
    return { label: o.label, line: `${o.label}: ${o.body}`, lock: `${o.label} on your site. ${o.body}` }
  }
  const o = optionById(AIRBNB_CANCELLATION, policy.cancellation)
  const lt = optionById(AIRBNB_LONG_TERM, policy.longTerm)
  const days = FREE_DAYS[o.id]
  const arrive = before(0)
  const line = o.id === 'limited' ? `Cancel before ${before(7)} for a partial refund. After that, this reservation is non-refundable.`
    : o.id === 'firm' ? `Cancel before ${before(7)} for a partial refund. After that, this reservation is non-refundable.`
      : `Free cancellation before ${before(days ?? 1)}. Cancel before check-in on ${arrive} for a partial refund.`
  return { label: o.label, line, lock: `${o.label} on Airbnb; long-term stays (28+ nights) ${lt.label}. Booking policies are set per channel.` }
}
