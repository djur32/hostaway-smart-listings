/* Booking policies per channel (Hostaway's Airbnb "Booking policies" page and its Configure flow, review's screens 14–21).
 * Airbnb wording is copied from the real flow. Booking.com and Direct follow research/market/channel-constraints.md
 * (Cancellation rows): Booking.com policies live in the Extranet (read-only here); Direct is native to Hostaway.
 * Direct option wording is ours. Current values are the scenario's. */
import type { ListingChannel } from './sl3'

export interface PolicyOption { id: string; label: string; body: string }

/** Airbnb's standard policies, in the order Hostaway lists them (15.png, 16.png). Strict and Super strict are by invitation only. */
export const AIRBNB_CANCELLATION: PolicyOption[] = [
  { id: 'flexible', label: 'Flexible', body: 'Guests can cancel at least 24 hours before check-in for a full refund. If canceling after check-in, Host will receive 100% for each night the guest stays, plus one additional night.' },
  { id: 'moderate', label: 'Moderate', body: 'Guests can cancel at least five days before check-in for a full refund. If canceling after that, Host will receive 100% for each night the guest stays, plus one additional night, and 50% for all unspent nights.' },
  { id: 'firm', label: 'Firm', body: 'Guests can cancel at least 30 days before check-in for a full refund. If canceling between seven and 30 days before check-in, Host will receive 50% for all nights. If cancelled less than seven days before check-in, Host will receive 100% for all nights.' },
  { id: 'limited', label: 'Limited', body: 'Guests who cancel 7-14 days before check-in get 50% back. After that, their trip is non-refundable.' },
]

/** Airbnb's long-term policies, bookings of 28 nights or more (20.png). */
export const AIRBNB_LONG_TERM: PolicyOption[] = [
  { id: 'firm', label: 'Firm', body: 'Guests must cancel at least 30 days before check-in to receive a full refund' },
  { id: 'strict', label: 'Strict', body: 'Guests must cancel within 48 hours of booking and at least 28 days before check-in to receive a full refund' },
]

/** Direct bookings (Hostaway's own site): one policy, no add-on, no long-term variant. wording. */
export const DIRECT_CANCELLATION: PolicyOption[] = [
  { id: 'flexible', label: 'Flexible', body: 'Guests can cancel at least 24 hours before check-in for a full refund. After that, they pay for the first night.' },
  { id: 'moderate', label: 'Moderate', body: 'Guests can cancel at least five days before check-in for a full refund. After that, they pay 50% of the stay.' },
  { id: 'firm', label: 'Firm', body: 'Guests can cancel at least 30 days before check-in for a full refund. Between seven and 30 days, they pay 50% of the stay. After that, they pay the full stay.' },
  { id: 'strict', label: 'Strict', body: 'Guests can cancel within 48 hours of booking for a full refund, if check-in is at least 14 days away. After that, they pay 50% of the stay until seven days before check-in.' },
  { id: 'non_refundable', label: 'Non-refundable', body: 'Guests pay the full stay when they book and get nothing back if they cancel.' },
]

/** Booking.com: set per rate plan in the Extranet (channel-constraints: "Extranet via Hostaway"). Shown read-only. */
export const BOOKING_POLICY = {
  label: 'Flexible',
  body: 'Guests can cancel free of charge until 1 day before arrival. After that, they pay the first night.',
  nonRefundable: 'On · 10% cheaper',
}

export interface ChannelPolicy {
  cancellation: string
  nonRefundable: { enabled: boolean; pct: number }
  longTerm: string
}

/** The listing's policies before the host changes anything (14.png for Airbnb). */
export const POLICY_DEFAULT: Record<ListingChannel, ChannelPolicy> = {
  airbnb: { cancellation: 'moderate', nonRefundable: { enabled: false, pct: 10 }, longTerm: 'firm' },
  booking: { cancellation: 'flexible', nonRefundable: { enabled: true, pct: 10 }, longTerm: 'firm' },
  direct: { cancellation: 'moderate', nonRefundable: { enabled: false, pct: 0 }, longTerm: 'firm' },
}

/** Which policy model each channel has (drives the page and the flow). */
export const POLICY_MODEL: Record<ListingChannel, 'airbnb' | 'extranet' | 'direct'> = { airbnb: 'airbnb', booking: 'extranet', direct: 'direct' }

export function cancellationOptions(c: ListingChannel): PolicyOption[] {
  return c === 'direct' ? DIRECT_CANCELLATION : AIRBNB_CANCELLATION
}
export function optionById(list: PolicyOption[], id: string): PolicyOption {
  return list.find((o) => o.id === id) ?? list[0]
}
