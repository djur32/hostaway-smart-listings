/* Channels › {channel} › Booking policies (Hospitable replica of the Airbnb page, Antonio's screen 14.png). Owner WS-CH.
 * Same frame as Listing / Pricing / Availability (Antonio, 3 Oct: "the Listing should be the reference point for
 * everything"): title + switcher, the tab row with Tips at its right end (its border is the divider), an h2 with one
 * line, then the content in the 640px form column. One tab, "Cancellation policies" — Hospitable's own (REAL·PRODUCT,
 * HS-47 `Screenshot 2026-09-29 at 13.54.55.png`): a single tab holding the cancellation card and, on Airbnb, the
 * "Long-term stays (28+ nights)" card. No invented sections.
 * One card per policy with its own Configure, which opens a full-page step flow (policies/PolicyFlow.tsx).
 * Airbnb: cancellation (+ non-refundable option) and long-term stays. Booking.com: cancellation is set per rate plan in the
 * Extranet, shown read-only (research/market/channel-constraints.md). Direct: one policy, native to Hospitable.
 * Availability rules and Instant book (HS-37/38/39) moved to their own page, Channels › {channel} › Availability:
 * ?tab=availability (old links from Overview and the Hub) redirects there, ?tab=instant-book to its Instant book tab. */
import { useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Diff, HeadTips, Icon, PageHead, QueryTabs, SectionHead, Split } from '../../ds'
import type { ListingChannel } from '../../data/sl3'
import { AIRBNB_LONG_TERM, BOOKING_POLICY, POLICY_MODEL, cancellationOptions, optionById } from '../../data/policies'
import { useProperty } from '../../shell/PropertyLayout'
import { CH_NAME, ChannelLead, useChannel, useChannelDemoParams, useChannelPlan } from './common'
import { useChannelPolicy } from './policies/PolicyFlow'
import { PolicyCard } from './policies/PolicyCard'
import { screenTipId, useScreenTips, useTipsGate, type ScreenTipDef } from './screenTips'

export function Policies() {
  const p = useProperty()
  const c = useChannel()
  const [params] = useSearchParams()
  useChannelDemoParams(c)
  if (!c) return <Navigate to={`/property/${p.id}/ch/airbnb/policies`} replace />
  if (params.get('tab') === 'availability') return <Navigate to={`/property/${p.id}/ch/${c}/availability`} replace />
  if (params.get('tab') === 'instant-book') return <Navigate to={`/property/${p.id}/ch/${c}/availability?tab=instant-book`} replace />
  return <PolicyPage key={c} c={c} />
}

/** The DS small button (`.h-btn` default = --button-height-sm, 32px; there is no `--sm` modifier), as on Hospitable's
 *  page — not the 40px `--md` the cards used to carry (Antonio, 3 Oct: "the small buttons are 32 pixels high"). */
function Configure({ to, what }: { to: string; what: string }) {
  return <Link to={to} className="h-btn h-btn--primary" aria-label={`Configure ${what}`}>Configure</Link>
}

/** DOM ids of the two cards: each tip's `field`, so its TipDot sits after that card's title and opening it scrolls there. */
const CARD = { cancel: 'pol-card-cancel', longTerm: 'pol-card-longterm' }

/** The page's one tab (Hospitable's own) and its one-line description per channel's policy model. */
const TAB = { id: 'cancellation', label: 'Cancellation policies' }
const TAB_DESC: Record<'airbnb' | 'direct' | 'extranet', string> = {
  airbnb: 'What guests get back if they cancel, for regular and long-term stays.',
  direct: 'What guests get back if they cancel a booking on your direct booking site.',
  extranet: 'Booking.com sets cancellation per rate plan in its Extranet. This is what it syncs.',
}

function PolicyPage({ c }: { c: ListingChannel }) {
  const p = useProperty()
  const name = CH_NAME[c]
  const here = `/property/${p.id}/ch/${c}/policies`
  const { active, autopilot } = useChannelPlan(c)
  const policy = useChannelPolicy(c)
  const model = POLICY_MODEL[c]
  const std = optionById(cancellationOptions(c), policy.cancellation)
  const longTerm = optionById(AIRBNB_LONG_TERM, policy.longTerm)

  const tipDefs = usePolicyTips(c)
  const { chip: tipsChip, panel: tipsPanel, dotFor } = useScreenTips(c, tipDefs)

  return (
    // The same chrome as ListingEditor / ChannelPricing / Availability: the whole head (title, switcher, tab row with the
    // Tips chip at its right end) stays pinned in .ch-editor__head; the tab row's own bottom border is the divider.
    <div className="ch-editor">
      <div className="ch-editor__head">
        <div className="ch-page">
          {/* phones: the tab row hides its own Tips chip (ds/v3/ch.css), so it shows here instead, as on the other screens */}
          {/* Autopilot as the same one short line Listing / Pricing / Availability carry (same head height on every screen):
              like prices, a policy is never changed on its own, so the line says that instead of the note below */}
          <PageHead lead={<ChannelLead c={c} />} title="Booking policies" property={p}
            actions={<>
              {autopilot && <span className="ch-autoline" role="status"><Icon name="rocket" size={16} />Autopilot is on · policies always ask you first</span>}
              <HeadTips>{tipsChip}</HeadTips>
            </>} />
        </div>
        <div className="ch-tabrow">
          <QueryTabs active={TAB.id} items={[{ id: TAB.id, label: TAB.label, to: `?tab=${TAB.id}` }]} />
          {tipsChip}
        </div>
      </div>
      <Split main={
        <div className="ch-page">
          <SectionHead title={TAB.label} desc={TAB_DESC[model]} />
          <div className="ch-polcards">
            {model === 'airbnb' && <>
              <PolicyCard id={CARD.cancel} title={std.label} dot={dotFor(CARD.cancel)} body={std.body}
                meta={<><b>Non-refundable option:</b> {policy.nonRefundable.enabled ? `Enabled with ${policy.nonRefundable.pct}% discount` : 'Not enabled'}</>}
                action={<Configure to={`${here}/configure/policy`} what="cancellation policy" />} />
              <PolicyCard id={CARD.longTerm} eyebrow="Long-term stays (28+ nights)" title={longTerm.label} dot={dotFor(CARD.longTerm)} body={longTerm.body}
                action={<Configure to={`${here}/long-term/policy`} what="long-term stay policy" />} />
            </>}
            {model === 'direct' && (
              <PolicyCard id={CARD.cancel} title={std.label} dot={dotFor(CARD.cancel)} body={std.body} meta="Applies to every booking on your direct booking site."
                action={<Configure to={`${here}/configure/policy`} what="cancellation policy" />} />
            )}
            {model === 'extranet' && (
              <PolicyCard id={CARD.cancel} readOnly title={BOOKING_POLICY.label} body={BOOKING_POLICY.body}
                meta={<><b>Non-refundable rate:</b> {BOOKING_POLICY.nonRefundable}</>}
                action={<a className="h-btn h-btn--secondary" href="https://admin.booking.com" target="_blank" rel="noreferrer">Open Extranet</a>} />
            )}
          </div>
          {/* a quiet line under the cards, like Photos' "add" note — not the lilac AI box it used to be (Antonio, 3 Oct) */}
          {active && !autopilot && <p className="ch-polcards__note"><Icon name="info-circle" size={16} />Smart Listings never changes your {name} policies on its own. It can suggest a change, and you decide.</p>}
        </div>
      } panel={tipsPanel} />
    </div>
  )
}

/* ---------- Booking policies tips (shared by this screen and the property rail's per-page count) ----------
 * Antonio, relayed: "reasonable recommendations" at the booking-policy level, the same chip/panel/card the Listing
 * editor already has (screenTips.tsx) — SIMULATED, grounded in this channel's own policy model. Booking.com (model
 * 'extranet') owns none of these in Hospitable, so it gets none here either — the panel shows its honest empty state
 * rather than a suggestion with nowhere to apply it. At most two, one per card, each with its card's id as `field` so
 * its TipDot sits right after that card's title (Antonio, 3 Oct: the tip icon goes "next to the thing that there is a
 * tip for", as on the Listing editor). The old "Offer a non-refundable rate" tip was dropped to keep the page to one
 * suggestion per card. Gated like every channel tip (screenTips useTipsGate). Accept only marks the tip: a policy is
 * changed through its own Configure flow, never by a tip. */
export function usePolicyTips(c: ListingChannel): ScreenTipDef[] {
  const gate = useTipsGate(c)
  const policy = useChannelPolicy(c)
  return useMemo(() => {
    if (!gate) return []
    const model = POLICY_MODEL[c]
    const std = optionById(cancellationOptions(c), policy.cancellation)
    const longTerm = optionById(AIRBNB_LONG_TERM, policy.longTerm)
    const cancelList = model === 'extranet' ? [] : cancellationOptions(c)
    const cancelIdx = cancelList.findIndex((o) => o.id === policy.cancellation)
    const stricter = cancelIdx >= 0 ? cancelList[cancelIdx + 1] : undefined
    return [
      ...(stricter ? [{
        id: screenTipId(c, 'pol-cancel'), type: 'Cancellation policy', section: 'Cancellation', field: CARD.cancel, title: 'Make cancellations a bit stricter',
        main: <Diff from={std.label} to={stricter.label} />,
        why: [
          { text: `${stricter.label} still reads as guest-friendly, but gives you more protection against late cancellations than ${std.label}.`, source: 'strategy' },
          { text: 'A stricter policy rarely costs bookings once it’s clearly stated up front.', source: 'strategy' },
        ],
      } satisfies ScreenTipDef] : []),
      ...(model === 'airbnb' && policy.longTerm !== 'strict' ? [{
        id: screenTipId(c, 'pol-longterm'), type: 'Long-term stays (28+ nights)', section: 'Long-term stays', field: CARD.longTerm, title: 'Tighten your long-term stay policy',
        main: <Diff from={longTerm.label} to={optionById(AIRBNB_LONG_TERM, 'strict').label} />,
        why: [
          { text: 'Stays of 28+ nights tie up your calendar for a long stretch. A stricter policy protects you if a long-term guest cancels early.', source: 'strategy' },
          { text: 'Guests booking a month or more rarely need Airbnb’s most flexible terms.', source: 'strategy' },
        ],
      } satisfies ScreenTipDef] : []),
    ]
  }, [gate, policy, c])
}
