/* Cancellation as the Hub shows it, read live from the Booking policies flow (store `policies`, useChannelPolicy), so a
 * change made in Channels › {channel} › Booking policies shows here at once. Every Hub iteration uses this, not a static list. */
import { useStore } from '../../store/store'
import { AIRBNB_LONG_TERM, BOOKING_POLICY, POLICY_DEFAULT, cancellationOptions, optionById, type ChannelPolicy } from '../../data/policies'
import { LISTING_CHANNELS, type ListingChannel } from '../../data/sl3'
import type { PolicyCardDef } from '../../data/v3-ch'

export function cancellationCards(c: ListingChannel, p: ChannelPolicy): PolicyCardDef[] {
  if (c === 'booking') return [{ title: BOOKING_POLICY.label, body: BOOKING_POLICY.body, meta: `Non-refundable rate: ${p.nonRefundable.enabled ? `On · ${p.nonRefundable.pct}% cheaper` : 'Off'}` }]
  const opt = optionById(cancellationOptions(c), p.cancellation)
  if (c === 'direct') return [{ title: opt.label, body: opt.body }]
  const lt = optionById(AIRBNB_LONG_TERM, p.longTerm)
  return [
    { title: opt.label, body: opt.body, meta: `Non-refundable option: ${p.nonRefundable.enabled ? `On · ${p.nonRefundable.pct}% off` : 'Not enabled'}` },
    { title: 'Long-term stays (28+ nights)', kicker: lt.label, body: lt.body },
  ]
}
/** One channel's cancellation cards, live. */
export function useCancellationCards(c: ListingChannel): PolicyCardDef[] {
  const saved = useStore((s) => s.policies?.[c])
  return cancellationCards(c, saved ?? POLICY_DEFAULT[c])
}
/** Every channel's cancellation cards, live (selects the stable `policies` object only; Zustand v5). */
export function useAllCancellationCards(): Record<ListingChannel, PolicyCardDef[]> {
  const all = useStore((s) => s.policies)
  return Object.fromEntries(LISTING_CHANNELS.map((c) => [c, cancellationCards(c, all?.[c] ?? POLICY_DEFAULT[c])])) as Record<ListingChannel, PolicyCardDef[]>
}
