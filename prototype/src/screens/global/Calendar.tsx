/* Calendar (global) with the property back path · owner S12 · R-073 · D-158 · IA-R §4 rule 8
 * Opened from a property, it is filtered to that property and carries a return chip to the exact page, tab and query
 * you left ("← Beautiful Artist Apt. · Pricing · Rates"). The URL carries it (?property=&from=), so browser Back and a
 * reload both work. The sidebar highlights Calendar, because that's where you are; the chip says where you came from.
 * Tapping a night opens a PanelStack (ds/panels.tsx, D-927): the night's price and where it comes from, then the
 * property's pricing sections and their per-channel values, each sliding in beside the level you came from while the
 * month stays visible and live (screens/pricing/PricingPanels.tsx). Same keys and store actions as Channels › Pricing. */
import { useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, CloseButton, Dropdown, Icon, PageHeader, PanelStack, ReturnChip, cx, useUnsavedChanges } from '../../ds'
import { PROPERTY_RAIL } from '../../data/ia'
import { MY_PORTFOLIO as PORTFOLIO, propertyById } from '../../data/portfolio' // the account's own (D-160)
import type { Property } from '../../data/types'
import { useStore } from '../../store/store'
import { Page } from '../../shell/AppShell'
import { PropertyScope } from '../../shell/PropertyLayout'
import { buildRows, type Row } from '../portfolio/rows'
import { isWeekendNight, usePricingPanels, useRates } from '../pricing/PricingPanels'
import { PropertyCalendar } from './PropertyCalendar'
import { STAYS, STAYS_PROPERTY, TODAY, calDay } from './calendarSeed'

// the grid starts Mon 28 Sep 2026; "today" is 29 Sep. Shared with the property's Calendar page (calendarSeed.ts, H-08)
const day = calDay

/** "/property/neukolln/pricing/rates?lens=all" → "Pricing · Rates". */
function whereOf(from: string) {
  const [path] = from.split('?')
  const [, , , section, tab] = path.split('/')
  const r = PROPERTY_RAIL.find((x) => x.path === section)
  if (!r) return undefined
  const t = r.tabs?.find((x) => x.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === tab)
  return t ? `${r.label} · ${t}` : r.label
}

/** `inProperty`: the property rail's Calendar (/property/:id/calendar, review 30 Sep: a normal link, not an external jump).
 *  Same calendar, scoped to that property, inside the property layout: no return chip and no property picker. */
export function CalendarPage({ inProperty }: { inProperty?: boolean } = {}) {
  const [q] = useSearchParams()
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStore()
  const p = propertyById((inProperty ? id : q.get('property')) ?? undefined)
  const from = inProperty ? null : q.get('from')
  const showChip = !!(p && from && from.startsWith(`/property/${p.id}`))
  const rows = buildRows(s)
  // review, 3 Oct: the property's Calendar is its own page in the property frame (HS-C01: months + docked sidebar)
  if (inProperty && p) return <PropertyCalendar p={p} />
  const row = p ? rows.find((r) => r.p.id === p.id) : undefined
  const price = (i: number, r: Row) => {
    const d = day(i).getDay()
    const weekend = d === 5 || d === 6
    return Math.round(r.base * (weekend ? 1 + r.get('weekendPct').value / 100 : 1))
  }
  const setProperty = (id: string) => nav(id ? `/calendar?property=${id}${from && from.startsWith(`/property/${id}`) ? `&from=${encodeURIComponent(from)}` : ''}` : '/calendar')

  const header = (
    <>
      <PageHeader title="Calendar" property={inProperty ? p : undefined} right={showChip && p ? <ReturnChip to={from!} name={p.name} where={whereOf(from!)} /> : undefined} />
      {!inProperty && <div className="p-row p-mt4 h-calfilters">
        {p ? (
          <span className="h-filter-chip"><Icon name="building" />Property: {p.name}
            <CloseButton size="sm" className="h-calfilters__clear" label="Clear the property filter" onClick={() => nav('/calendar')} /></span>
        ) : <span className="h-filter-chip"><Icon name="building" />All properties · {PORTFOLIO.length}</span>}
        <Dropdown className="h-calfilters__select" label="Show property" value={p?.id ?? ''} onChange={setProperty}
          options={[{ value: '', label: 'All properties' }, ...PORTFOLIO.map((x) => ({ value: x.id, label: x.name }))]} />
        {showChip && <span className="h-caption h-muted">Opened from {p!.name}. Back (or the chip) returns to {whereOf(from!) ?? 'where you were'}.</span>}
      </div>}
    </>
  )
  const footer = p && !showChip && !inProperty
    ? <p className="p-mt3"><Button size="md" kind="ghost" onClick={() => nav(`/property/${p.id}/overview`)}>Open {p.name}</Button></p>
    : null

  // one property: its month beside the night's panels (the page's own frame: the month column scrolls, panels stay put)
  if (p && row) {
    const month = <PropertyMonth key={p.id} p={p} row={row} header={header} footer={footer} />
    return <main className="h-content h-pstack-host">{inProperty ? month : <PropertyScope id={p.id}>{month}</PropertyScope>}</main>
  }

  return (
    <Page wide>
      {header}
      <div className="h-grid-wrap h-calgrid p-mt4">
        <table className="h-grid h-grid--compact">
          <thead><tr><th>Property</th>{Array.from({ length: 14 }, (_, i) => <th key={i} style={{ textAlign: 'center' }}>{day(i + TODAY).toLocaleDateString('en-GB', { weekday: 'short' })} {day(i + TODAY).getDate()}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, 12).map((r) => (
              <tr key={r.p.id}>
                <td><Link className="h-link h-link--neutral" to={`/calendar?property=${r.p.id}`}>{r.p.name}</Link></td>
                {Array.from({ length: 14 }, (_, i) => <td key={i} className="h-grid__num" style={{ textAlign: 'center' }}>€{price(i + TODAY, r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  )
}

/** One property's month (HS-C01's grid) + the PanelStack. Tapping a night opens level 1; tapping another night while
 *  panels are open resets the stack to that night. Prices are the Base rates the host set (Pricing, saved edits). */
function PropertyMonth({ p, row, header, footer }: { p: Property; row: Row; header: ReactNode; footer: ReactNode }) {
  const [pick, setPick] = useState<number | null>(null)
  const [path, setPath] = useState<string[]>([])
  const rates = useRates(p.id)
  const price = (i: number) => (isWeekendNight(day(i)) ? rates.weekend : rates.nightly)
  const night = pick === null ? null : { i: pick, date: day(pick), daysAhead: pick - TODAY }
  const draftRef = useRef<{ dirty: boolean; save: () => void; discard: () => void }>({ dirty: false, save: () => {}, discard: () => {} })
  const panels = usePricingPanels({ pid: p.id, row, night, path, setPath, onDraft: (d) => { draftRef.current = d } })
  useUnsavedChanges({ dirty: draftRef.current.dirty, onDiscard: () => draftRef.current.discard(), onSave: () => draftRef.current.save() })
  const open = (i: number) => { setPick(i); setPath([]) }
  const month = (
    <div className="h-calmonth p-mt4">
      <p className="h-calmonth__hint">Tap a night to see its price, where it comes from and what each channel charges.</p>
      <div className="h-cal" role="grid" aria-label={`${p.name}, 28 Sep – 1 Nov 2026`}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="h-cal__dow">{d}</div>)}
        {Array.from({ length: 35 }, (_, i) => {
          const stay = p.id === STAYS_PROPERTY ? STAYS.find((x) => i >= x.from && i < x.to) : undefined
          const first = stay && (i === stay.from || day(i).getDay() === 1)
          const end = stay && (i === stay.to - 1 || day(i).getDay() === 0)
          const barStyle = stay ? { background: `var(--color-channel-${stay.channel})` } : undefined
          return (
            <div key={i} className={`h-cal__day${i < TODAY ? ' is-past' : ''}${i === TODAY ? ' is-today' : ''}`} role="gridcell">
              <span className="h-cal__num">{day(i).getDate()}</span>
              {stay && (first
                ? <span className={cx('h-cal__bar', end && 'h-cal__bar--end')} style={barStyle}>{stay.guest}</span>
                : <span className={cx('h-cal__bar h-cal__bar--cont', end && 'h-cal__bar--end')} style={barStyle} aria-hidden="true" />)}
              {!stay && i >= TODAY && (
                <button type="button" className={cx('h-cal__prices h-cal__pick', pick === i && 'is-on')} onClick={() => open(i)}
                  aria-label={`${day(i).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, €${price(i)}`} aria-pressed={pick === i}>
                  <span className="h-cal__price">€{price(i)}</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
  return (
    <PanelStack label="Night details" rootTitle="Calendar" panels={panels}
      onBack={(i) => setPath(path.slice(0, i))} onClose={() => { setPick(null); setPath([]) }}
      main={<>{header}{month}{footer}</>} />
  )
}
