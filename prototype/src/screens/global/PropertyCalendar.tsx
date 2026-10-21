/* Property › Calendar (rail › Calendar, /property/:id/calendar) · review, 3 Oct, replicating HS-C01 / HS-32.
 * Rendered inside the property shell (PropertyLayout's rail stays, Calendar stays marked), in the same frame as every
 * other property page: a fixed head — PageHead (title + property switcher), the page description, then the toolbar
 * (Preview dynamic pricing · Layers · Occupancy | Tasks) — and below it two columns that scroll on their own: the
 * months (Sun–Sat, "Oct 2026" then "Nov 2026"…) and the docked sidebar with Pricing | Availability tabs.
 * Look only, by request ("don't add any functionality, just show what it looks like"): the tabs switch (?panel=), the
 * rest is inert. Prices and the per-night minimum stay are the property's own Base values (usePriceView, saved edits
 * included). The global /calendar keeps its own view (Calendar.tsx PropertyMonth). */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BottomSheet, Button, Icon, NumberField, PageHead, PanelLink, QueryTabs, SectionHead, Segmented, cx, useIsMobile } from '../../ds'
import { AVAIL_TABS, nightsOf } from '../../data/availability'
import type { Property } from '../../data/types'
import { CH_NAME } from '../channel/common'
import { isWeekendNight, usePriceView } from '../pricing/PricingPanels'
import { STAYS_PROPERTY, TODAY_DATE, stayEnd, stayOn, stayStart } from './calendarSeed'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_SHOWN = 4

type Panel = 'pricing' | 'availability'

export function PropertyCalendar({ p }: { p: Property }) {
  const [params] = useSearchParams()
  const panel: Panel = params.get('panel') === 'availability' ? 'availability' : 'pricing'
  const q = (id: Panel) => { const n = new URLSearchParams(params); n.set('panel', id); return `?${n}` }
  const [layer, setLayer] = useState<'occupancy' | 'tasks'>('occupancy')
  // phones: the docked sidebar becomes a bottom sheet opened from the toolbar; the months take the full width
  // (ds/mobile.md §7 — review, 3 Oct: "anything … in the form of a sidebar … on mobile has to be a bottom sheet")
  const mobile = useIsMobile()
  const [sheet, setSheet] = useState(false)
  const pv = usePriceView(p.id)
  const nightly = pv.baseOf('base', 'nightly')
  const weekend = pv.baseOf('base', 'weekend')
  const c0 = pv.channels[0]
  const minStay = (c0 && nightsOf(pv.avail(c0, 'min_stay')?.value ?? '')) || '1'

  // the scenario's today (Tue 29 Sep 2026) and its seeded stays, shared with the global /calendar (calendarSeed.ts, H-08)
  const today = TODAY_DATE
  const stays = p.id === STAYS_PROPERTY
  const months = Array.from({ length: MONTHS_SHOWN }, (_, k) => new Date(today.getFullYear(), today.getMonth() + k, 1))

  const side = (
    <>
      <QueryTabs active={panel} items={[{ id: 'pricing', label: 'Pricing', to: q('pricing') }, { id: 'availability', label: 'Availability', to: q('availability') }]} />
      {panel === 'pricing' ? <PricingSide pv={pv} nightly={nightly} weekend={weekend} /> : <AvailabilitySide />}
    </>
  )

  return (
    <div className="ch-editor">
      <div className="ch-editor__head">
        {/* phones: Occupancy | Tasks sits beside the title, like Classic | Canvas on Listing (review, 4 Oct) */}
        <div className="ch-page"><PageHead title="Calendar" property={p}
          titleEnd={mobile ? <Segmented label="Show" value={layer} onChange={setLayer} items={[{ id: 'occupancy', label: 'Occupancy' }, { id: 'tasks', label: 'Tasks' }]} /> : undefined} desc={mobile
          ? 'Each night’s price and minimum stay.'
          : 'Each night’s price and minimum stay. The property’s pricing and availability settings are on the right.'} /></div>
        <div className="h-calp__bar" role="toolbar" aria-label="Calendar view">
          {/* Occupancy | Tasks on the left, Preview and Layers pushed to the far right (review, 3 Oct) */}
          {!mobile && <Segmented label="Show" value={layer} onChange={setLayer} items={[{ id: 'occupancy', label: 'Occupancy' }, { id: 'tasks', label: 'Tasks' }]} />}
          <span className="h-calp__bar-spacer" />
          {/* look only (no handler): drawn without hover or a pointer, so they don't read as broken (cal.css .h-calp__inert).
            * Desktop: the pair sits in a group exactly as wide as the sidebar's content, so Preview's left edge is the
            * sidebar's left edge (review, 4 Oct). Phones keep them as direct toolbar children (their own order rules). */}
          {!mobile && (() => {
            const tools = <>
              <Button kind="ai" icon="eye" className="h-calp__inert" tabIndex={-1}>Preview dynamic pricing</Button>
              <Button icon="stack-2" className="h-calp__inert" tabIndex={-1}>Layers <span className="h-calp__count">2</span></Button>
            </>
            return <div className="h-calp__tools">{tools}</div>
          })()}
          {mobile && <Button icon="adjustments-horizontal" onClick={() => setSheet(true)}>Pricing &amp; availability</Button>}
        </div>
      </div>
      <div className="h-calp__body">
        <div className="h-calp__months">
          {months.map((m) => <Month key={m.getMonth()} first={m} today={today} nightly={nightly} weekend={weekend} minStay={minStay} stays={stays} />)}
        </div>
        {!mobile && <aside className="h-calp__side" aria-label="Property settings">{side}</aside>}
      </div>
      {mobile && <BottomSheet open={sheet} title="Pricing & availability" onClose={() => setSheet(false)}><div className="h-calp__side h-calp__side--sheet">
        {/* phones: Preview and Layers live with the settings they belong to, not in the page head (review, 4 Oct: too much info) */}
        <div className="h-calp__sheettools">
          <Button kind="ai" icon="eye" className="h-calp__inert" tabIndex={-1}>Preview dynamic pricing</Button>
          <Button icon="stack-2" className="h-calp__inert" tabIndex={-1}>Layers <span className="h-calp__count">2</span></Button>
        </div>{side}</div></BottomSheet>}
    </div>
  )
}

function Month({ first, today, nightly, weekend, minStay, stays }: { first: Date; today: Date; nightly: number; weekend: number; minStay: string; stays: boolean }) {
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = first.getDay() // Sunday-first: blank cells before day 1
  const cells = Math.ceil((lead + days) / 7) * 7
  const title = first.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  return (
    <section className="h-calp__month" aria-label={first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}>
      <h2 className="h-calp__title">{title}</h2>
      <div className="h-calp__dows" aria-hidden="true">{DOW.map((d) => <span key={d} className="h-calp__dow">{d}</span>)}</div>
      <div className="h-calp__grid" role="grid">
        {Array.from({ length: cells }, (_, i) => {
          const n = i - lead + 1
          if (n < 1 || n > days) return <div key={i} className="h-calp__day is-blank" role="gridcell" />
          const date = new Date(first.getFullYear(), first.getMonth(), n)
          const t = date.getTime()
          const price = isWeekendNight(date) ? weekend : nightly
          const label = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
          // a reserved night: the stay's band, continuous across the week (Sun–Sat rows), guest name truncated (ds/mobile.md §8).
          // Look only, like the rest of this page: the band is not a control.
          const stay = stays ? stayOn(date) : undefined
          const head = stay && (t === stayStart(stay).getTime() || date.getDay() === 0 || n === 1)
          const end = stay && (t === stayEnd(stay).getTime() || date.getDay() === 6 || n === days)
          return (
            <div key={i} role="gridcell" className={cx('h-calp__day', t < today.getTime() && 'is-past', t === today.getTime() && 'is-today', stay && 'is-booked')}
              aria-label={stay ? `${label}, booked: ${stay.guest}` : `${label}, €${price}, minimum stay ${minStay}`}>
              <span className="h-calp__num">{n}</span>
              {stay ? (
                <span className={cx('h-cal__bar', !head && 'h-cal__bar--cont', end && 'h-cal__bar--end')} style={{ background: `var(--color-channel-${stay.channel})` }}
                  aria-hidden={head ? undefined : true}>{head ? stay.guest : null}</span>
              ) : (
                <span className="h-calp__meta">
                  <span className="h-calp__min"><Icon name="moon" />{minStay}</span>
                  <span className="h-calp__price">€{price}</span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Look only (review, 3 Oct): the Base rates are shown read-only, in Hostaway's own field, with where to change them;
 *  the drill-down rows are the real stack's rows without the drill-down (no pointer or hover, cal.css). */
function PricingSide({ pv, nightly, weekend }: { pv: ReturnType<typeof usePriceView>; nightly: number; weekend: number }) {
  const b = (tab: Parameters<typeof pv.baseOf>[0], key: string) => pv.baseOf(tab, key)
  const guests = b('occupancy', 'included')
  return (
    <>
      <SectionHead title={<>Base price <Icon name="info-circle" className="h-calp__info" /></>} />
      <div className="h-calp__field">
        <span className="h-field-row__label">Nightly rate</span>
        <NumberField label="Nightly rate" currency="€" value={String(nightly)} onChange={noop} disabled />
      </div>
      <div className="h-calp__field">
        <span className="h-field-row__label">Weekend rate</span>
        <NumberField label="Weekend rate" currency="€" value={String(weekend)} onChange={noop} disabled />
      </div>
      <p className="h-calp__note">Set in Listing base › Pricing</p>
      <div className="h-pstack-links h-calp__inert-links">
        <PanelLink ai title="Dynamic Pricing" summary="Included with Host, Pro and Mogul plans" />
        <PanelLink title="Listing markups" />
        <PanelLink title="Security deposit" summary={pv.channels.map((c) => `${CH_NAME[c]} 0`).join(', ')} />
        <PanelLink title="Occupancy based" summary={`Extra guest fee €${b('occupancy', 'extra')}, ${guests} ${guests === 1 ? 'guest' : 'guests'} included`} />
        <PanelLink title="Fees" summary={`Cleaning fee ${b('fees', 'cleaning')}`} />
        <PanelLink title="Discounts" summary={`Weekly discount ${b('discounts', 'weekly')}, Monthly discount ${b('discounts', 'monthly')}`} />
      </div>
    </>
  )
}

function AvailabilitySide() {
  return (
    <div className="h-pstack-links h-calp__inert-links">
      {AVAIL_TABS.map((t) => <PanelLink key={t.id} title={t.label} summary={t.desc} />)}
    </div>
  )
}

const noop = () => {}
