/* Calendar › a night › the property's pricing, as a PanelStack (D-927, review 1 Oct). Owner: this session (Calendar).
 * Mirrors the real Calendar's night detail (HS-C11/C12) and its pricing drill-downs (HS-C01 rail; HS-C02…C10, C13–C15),
 * but every drill-down slides in beside the one you came from instead of replacing it (ds/panels.tsx).
 *   level 1  the night: date, price and where it comes from, prices with markup per channel, stays, rule set, sections
 *   level 2  Base price · Dynamic Pricing · Listing markups · Security deposit · Occupancy based pricing · Fees · Discounts
 *            — each row is the Base value, then one row per connected channel, Listing's own two-state pattern
 *            ("Uses the Base" / "Customize for {channel}", D-927 revised 1 Oct): no "Edit per channel" drill-down
 *   level 3  a single channel-only field with nothing to fall back to (e.g. Airbnb's short-term cleaning fee)
 * Values: the active property's Pricing rows (data/property-listing.ts pricesFor, = data/v3-ch.ts PRICES for Neukölln)
 * and stay rules (availabilityFor), with the host's saved edits from the sl3 slice: the same `price:*` keys, states and
 * store actions as Channels › Pricing (ChannelPricing.tsx), read through viewOf. Save commits and sends straight away
 * (commitAndSend, one receipt per channel that changed). Security deposit and Dynamic Pricing have no store: read-only,
 * with "Open in Pricing". The edits of a section are one draft (Discard / Save on its level 2 and level 3); leaving the
 * section drops it. Sample values are except where the HS-C captures show review's real listing. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon, Locked, Mark, NumberField, PanelLink, Pill, SettingRow, UnsavedBar, cx, type FieldState, type StackPanel } from '../../ds'
import type { FieldDef, ListingChannel } from '../../data/sl3'
import { availabilityFor, pricesFor } from '../../data/property-listing'
import { propertyChannels } from '../../data/portfolio'
import { CURRENCIES, FEE_BASES, type PriceRow, type PriceTab } from '../../data/v3-ch'
import { useStore } from '../../store/store'
import { CH_NAME, stashKey, viewOf } from '../channel/common'
import { commitAndSend, savedLabel } from '../push/changes'
import type { Row } from '../portfolio/rows'

/* ---------- the section draft (Discard / Save) ---------- */
type DVal = { v: string | null | undefined }
interface Draft { key: string; base: Record<string, string>; custom: Partial<Record<ListingChannel, Record<string, DVal>>> }
const emptyDraft = (key: string): Draft => ({ key, base: {}, custom: {} })

export type Section = 'base' | 'dynamic' | 'markups' | 'deposit' | 'occupancy' | 'fees' | 'discounts'
export const TITLE: Record<Section, string> = {
  base: 'Base price', dynamic: 'Dynamic Pricing', markups: 'Listing markups', deposit: 'Security deposit',
  occupancy: 'Occupancy based pricing', fees: 'Fees', discounts: 'Discounts',
}
/** Where each section's tab lives on Channels › Pricing ("Open in Pricing"). */
const PRICING_TAB: Record<Section, PriceTab> = { base: 'base', dynamic: 'base', markups: 'base', deposit: 'fees', occupancy: 'occupancy', fees: 'fees', discounts: 'discounts' }
/** A level-3 id is "<tab>:<key>", e.g. "fees:cleaning". */
export const sub = (tab: PriceTab, key: string) => `${tab}:${key}`

export const eur = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`
const unitText = (r: PriceRow, v: number | string) => (r.unit === '€' ? eur(Number(v)) : r.unit === '%' ? `${v}%` : `${v} ${Number(v) === 1 ? 'guest' : 'guests'}`)
const names = (cs: ListingChannel[]) => cs.length <= 1 ? cs.map((c) => CH_NAME[c]).join('') : `${cs.slice(0, -1).map((c) => CH_NAME[c]).join(', ')} and ${CH_NAME[cs[cs.length - 1]]}`

/* ---------- reading prices: the store (+ an optional draft), as the channel editors read them ---------- */
export function usePriceView(pid: string, draft?: Draft) {
  const sl3 = useStore((s) => s.sl3)
  const rows = pricesFor(pid)
  const channels = propertyChannels(pid) as ListingChannel[]
  const base: Record<string, string> = draft && Object.keys(draft.base).length ? { ...sl3.base, ...draft.base } : sl3.base
  const custom = (c: ListingChannel) => {
    const d = draft?.custom[c]
    if (!d || !Object.keys(d).length) return sl3.custom[c]
    const n: Record<string, string | null> = { ...(sl3.custom[c] ?? {}) }
    for (const [k, { v }] of Object.entries(d)) { if (v === undefined) delete n[k]; else n[k] = v }
    return n
  }
  const row = (tab: PriceTab, key: string) => rows[tab].find((r) => r.key === key)
  const def = (r: PriceRow): FieldDef => ({
    key: `price:${r.key}`, tab: 'essentials', label: r.label, kind: 'text', state: r.state, base: String(r.base),
    value: r.value ? Object.fromEntries(Object.entries(r.value).map(([c, v]) => [c, String(v)])) : undefined,
  })
  /** One channel's view of a row (state, value), or null when the channel has no such field. */
  const view = (c: ListingChannel, tab: PriceTab, key: string) => {
    const r = row(tab, key)
    return r && r.state[c] ? viewOf(def(r), c, custom(c), base) : null
  }
  const num = (c: ListingChannel, tab: PriceTab, key: string) => Number(view(c, tab, key)?.value ?? 0) || 0
  const baseStr = (tab: PriceTab, key: string) => { const r = row(tab, key); return r ? base[`price:${r.key}`] ?? String(r.base) : '' }
  const baseOf = (tab: PriceTab, key: string) => Number(baseStr(tab, key)) || 0
  /** a non-numeric Base setting (a fee's basis or currency): the draft/saved text, else the default */
  const baseText = (k: string, dflt: string) => base[k] ?? dflt
  /** A stay rule (min stay…) per channel: availabilityFor + saved edits under `avail:<key>`. */
  const avail = (c: ListingChannel, key: string) => {
    const r = availabilityFor(pid).find((x) => x.key === key)
    if (!r || !r.state[c]) return null
    return viewOf({ key: `avail:${r.key}`, tab: 'essentials', label: r.label, kind: 'text', state: r.state, base: r.base, value: r.value }, c, custom(c), base)
  }
  return { rows, channels, row, view, num, baseOf, baseStr, baseText, avail, sl3 }
}
type PV = ReturnType<typeof usePriceView>

/** The nightly and weekend rates the calendar shows (the Base, before markups), with the host's saved edits. */
export function useRates(pid: string) {
  const pv = usePriceView(pid)
  return { nightly: pv.baseOf('base', 'nightly'), weekend: pv.baseOf('base', 'weekend') }
}
export const isWeekendNight = (d: Date) => d.getDay() === 5 || d.getDay() === 6

/* ---------- the stack: night → section → field ---------- */
export interface Night { i: number; date: Date; daysAhead: number }

/** A section's draft/editor: Base + per-channel edits, dirty/save/discard, a quiet post-save note. Pulled out of
 *  usePricingPanels (below) so Listing base › Pricing (screens/base/Pricing.tsx, flat tabs, no PanelStack) can get
 *  the same Base/Customize editing the Calendar's night drill-down and usePricingPanels use, without the stack-only
 *  `path`/`setPath`/`night` plumbing. `section` keys the draft (switching it drops any unsaved edit, same as
 *  before: leaving a Calendar section or switching Pricing tabs both start a fresh draft). `ed.open` is a no-op here
 *  — usePricingPanels overrides it with its own `setPath`-based navigation; a flat page has nothing to navigate to. */
export function usePriceEditor({ pid, section }: { pid: string; section: string }) {
  const [raw, setRaw] = useState<Draft>(() => emptyDraft(section))
  const draft = raw.key === section ? raw : emptyDraft(section) // switching section drops its draft
  const update = (fn: (d: Draft) => Draft) => setRaw((prev) => fn(prev.key === section ? prev : emptyDraft(section)))
  const [saved, setSaved] = useState<{ at: number; text: string } | null>(null)
  useEffect(() => { if (!saved) return; const t = setTimeout(() => setSaved(null), 4000); return () => clearTimeout(t) }, [saved])
  useEffect(() => { setSaved(null) }, [section])
  const pv = usePriceView(pid, draft)
  const dirty = Object.keys(draft.base).length + Object.values(draft.custom).reduce((n, x) => n + Object.keys(x ?? {}).length, 0) > 0

  const ed: Editor = {
    pv,
    setBase: (k, v) => update((d) => {
      const b = { ...d.base }
      const r = Object.values(pv.rows).flat().find((x) => `price:${x.key}` === k)
      // a fee's basis / currency (`price:<key>@unit|@cur`): the default is "no change"
      const at = k.match(/^price:(.+)@(unit|cur)$/)
      const dflt = at ? (at[2] === 'cur' ? '€' : FEE_BASES[at[1]]?.dflt ?? '') : String(r?.base ?? '')
      if (v === (useStore.getState().sl3.base[k] ?? dflt)) delete b[k]; else b[k] = v
      return { ...d, base: b }
    }),
    setCustom: (c, k, v) => update((d) => {
      const cur = { ...(d.custom[c] ?? {}) }
      if (v === useStore.getState().sl3.custom[c]?.[k]) delete cur[k]; else cur[k] = { v }
      return { ...d, custom: { ...d.custom, [c]: cur } }
    }),
    open: () => {},
    pid,
  }
  const save = () => {
    const s = useStore.getState()
    const chans = (Object.keys(draft.custom) as ListingChannel[]).filter((c) => Object.keys(draft.custom[c] ?? {}).length)
    const customKeys = [...new Set(chans.flatMap((c) => Object.keys(draft.custom[c]!)))]
    const sent = [
      ...commitAndSend(() => { for (const c of chans) for (const [k, { v }] of Object.entries(draft.custom[c]!)) s.sl3Custom(c, k, v) }, chans, customKeys),
      // a Base value goes to every channel that uses it
      ...commitAndSend(() => { for (const [k, v] of Object.entries(draft.base)) s.sl3Base(k, v) }, pv.channels, Object.keys(draft.base)),
    ]
    setRaw(emptyDraft(section))
    setSaved({ at: Date.now(), text: savedLabel(sent) })
  }
  const discard = () => setRaw(emptyDraft(section))
  return { ed, pv, dirty, save, discard, saved }
}

export function usePricingPanels({ pid, row, night, path, setPath, onDraft }: {
  pid: string; row: Row; night: Night | null; path: string[]; setPath: (p: string[]) => void
  /** Reports the open section's live dirty/save/discard every render (review, 1 Oct: no permanent Discard/Save —
   *  a host page wires this into the shared `useUnsavedChanges` top bar instead of this hook's own footer). */
  onDraft?: (d: { dirty: boolean; save: () => void; discard: () => void }) => void
}): StackPanel[] {
  const section = path[0] as Section | undefined
  const { ed: baseEd, pv, dirty, save, discard, saved } = usePriceEditor({ pid, section: section ?? '' })
  const ed: Editor = { ...baseEd, open: (id) => setPath([path[0], id]) } // this hook's own navigation, stack-only
  const stored = usePriceView(pid)
  onDraft?.({ dirty, save, discard })
  // The shared bar (useUnsavedChanges) is the only Discard/Save now; a clean panel just shows its own "saved" note.
  // ds/unsaved.tsx, 1 Oct evening rework: the bar itself is no longer mounted globally — since this draft only ever
  // exists while a section/field panel is open, <UnsavedBar/> renders in THAT panel's own footer slot
  // (.h-pstack__foot, already "pinned under the scrolling body"), not in the Calendar's month column behind it.
  const foot = dirty ? <UnsavedBar /> : saved ? <span key={saved.at} className="h-saved h-saved--sent" role="status"><Icon name="circle-check" />{saved.text}</span> : null

  if (!night) return []
  const panels: StackPanel[] = [{
    id: 'night',
    title: night.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    content: <NightPanel key={night.i} pv={stored} row={row} night={night} open={(s) => setPath([s])} current={section} />,
  }]
  if (section && TITLE[section]) {
    const editable = section !== 'deposit' && section !== 'dynamic'
    const leaf = path[1]
    // the footer (and its live <UnsavedBar/> when dirty) goes on whichever panel is actually deepest/active — never
    // both at once, since a level that's merely a narrowed "spine" behind the active one stays mounted (ds/panels.tsx)
    // and a second live bar/nav-guard instance there would double up the blocker and the beforeunload handler.
    const leafRow = leaf ? (() => { const [tab, key] = leaf.split(':') as [PriceTab, string]; const r = pv.row(tab, key); return r ? { tab, key, r } : null })() : null
    panels.push({ id: section, title: TITLE[section], content: <SectionPanel s={section} ed={ed} row={row} night={night} />, footer: editable && !leafRow ? foot : undefined })
    if (leafRow) panels.push({ id: leaf, title: leafRow.r.label, content: <FieldPanel ed={ed} tab={leafRow.tab} r={leafRow.r} />, footer: foot })
  }
  return panels
}

export interface Editor {
  pv: PV; pid: string
  setBase: (k: string, v: string) => void
  setCustom: (c: ListingChannel, k: string, v: string | null | undefined) => void
  open: (subId: string) => void
}

/* ---------- small pieces ---------- */
const clean = (v: string) => v.replace(',', '.').replace(/[^0-9.]/g, '')
export function Amount({ r, value, onChange, disabled, label, per, basis }: { r: PriceRow; value: string; onChange?: (v: string) => void; disabled?: boolean; label: string; per?: string
  /** a fee's basis and currency as dropdowns ("per stay ⌄", "€ ⌄"), kept as `price:<key>@unit` / `@cur` Base keys */
  basis?: { unit: string; onUnit: (v: string) => void; cur: string; onCur: (v: string) => void } }) {
  // NumberField (ds/v3-ch.tsx), review 3 Oct: € in the grey box before the value, %/guests as Hostaway's plain
  // unit word, "per stay" as the grey end box, and the shared small arrows. Same clean() and onChange as before.
  const money = r.unit === '€'
  return (
    <NumberField label={label} value={value} disabled={disabled || !onChange} onChange={(v) => onChange?.(clean(v))}
      currency={money ? (basis ? basis.cur : '€') : undefined} per={basis ? undefined : per}
      perSelect={basis ? { value: basis.unit, options: FEE_BASES[r.key].options, onChange: basis.onUnit } : undefined}
      currencySelect={basis && FEE_BASES[r.key].currency ? { value: basis.cur, options: CURRENCIES, onChange: basis.onCur } : undefined} inputMode="decimal" decimals={money ? 2 : 0} max={r.unit === '%' ? 100 : 99999}
      unit={r.unit === '%' ? '%' : r.unit === 'guests' ? (Number(value) === 1 ? 'guest' : 'guests') : undefined} />
  )
}
export function Desc({ children }: { children: ReactNode }) { return <p className="h-pstack-desc">{children}</p> }
function Sec({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return <section className="h-pstack-sec">{title && <h3 className="h-pstack-sec__title">{title}</h3>}{children}</section>
}
function Line({ label, value, total }: { label: ReactNode; value: ReactNode; total?: boolean }) {
  return <div className={cx('h-pstack-line', total && 'h-pstack-line--total')}><dt>{label}</dt><dd>{value}</dd></div>
}
function OpenInPricing({ pid, s, c }: { pid: string; s: Section; c: ListingChannel }) {
  const { pathname } = useLocation()
  // the deposit is property-wide: it lives on Listing base › Pricing › Security deposits, never on a channel's Pricing
  // (which has no deposit tab). Already there (the Base tab renders this same panel): no link to itself.
  if (s === 'deposit') {
    if (pathname.endsWith('/base/pricing')) return null
    return <Link className="h-textlink" to={`/property/${pid}/base/pricing?tab=deposit`}>Open in Listing base › Pricing</Link>
  }
  return <Link className="h-textlink" to={`/property/${pid}/ch/${c}/pricing?tab=${PRICING_TAB[s]}`}>Open in Pricing</Link>
}

/** "ⓘ 3 channels" or "ⓘ 2 of 3 channels · Booking.com has its own": who uses the Base value of a row. */
function scopeText(pv: PV, tab: PriceTab, key: string) {
  const chans = pv.channels.filter((c) => pv.view(c, tab, key))
  const own = chans.filter((c) => { const st = pv.view(c, tab, key)!.state; return st === 'override' || st === 'only' || st === 'set' })
  const n = chans.length
  if (!own.length) return `${n} channel${n === 1 ? '' : 's'}`
  const set = own.filter((c) => pv.view(c, tab, key)!.state === 'set')
  const custom = own.filter((c) => !set.includes(c))
  return [`${n - own.length} of ${n} channels`, custom.length ? `${names(custom)} custom` : '', set.length ? `${names(set)} decides` : ''].filter(Boolean).join(' · ')
}

/* ---------- level 1 · the night (HS-C11 / HS-C12) ---------- */
function NightPanel({ pv, row, night, open, current }: { pv: PV; row: Row; night: Night; open: (s: Section) => void; current?: Section }) {
  const weekend = isWeekendNight(night.date)
  const rate = pv.baseOf('base', weekend ? 'weekend' : 'nightly')
  const dyn = row.get('dynamic').value
  const smart = row.d.priceOwner.airbnb === 'channel' && pv.channels.includes('airbnb')
  const c0 = pv.channels[0]
  const markups = pv.channels.map((c) => [c, pv.num(c, 'base', 'markup')] as const)
  const v = (tab: PriceTab, key: string) => { const r = pv.row(tab, key); return r ? unitText(r, pv.baseOf(tab, key)) : '—' }
  const minStay = pv.channels.map((c) => [c, pv.avail(c, 'min_stay')?.value] as const).filter(([, x]) => x)
  const sameMin = new Set(minStay.map(([, x]) => x)).size === 1
  return (
    <div className="h-crossfade-enter">
      <Sec title="Price">
        <p className="h-pstack-price">{eur(rate)}</p>
        <dl className="h-pstack-lines" style={{ marginTop: 'var(--space-3)' }}>
          <Line label={weekend ? 'Weekend rate (Friday and Saturday)' : 'Nightly rate'} value={eur(rate)} />
          <Line label="Rule set" value="None" />
          <Line label="Dynamic Pricing" value={dyn ? 'On' : 'Off'} />
        </dl>
        {smart && <p className="h-pstack-note">Airbnb Smart Pricing sets Airbnb’s price for this night, so Hostaway doesn’t send one.</p>}
      </Sec>
      <Sec title="Prices including markup">
        <div className="h-pstack-box">
          <dl className="h-pstack-lines">
            {markups.map(([c, mk]) => <Line key={c} label={<><Mark channel={c} />{CH_NAME[c]}<span>{mk ? `+${mk}%` : 'no markup'}</span></>} value={eur(Math.round(rate * (1 + mk / 100)))} />)}
          </dl>
          <div className="h-pstack-box__foot"><button type="button" className="h-textlink" onClick={() => open('markups')}>Adjust markup</button></div>
        </div>
      </Sec>
      <Sec title="Availability">
        <dl className="h-pstack-lines">
          <Line label="Status" value="Available" />
          <Line label="Check-in" value="Allowed" />
          <Line label="Checkout" value="Allowed" />
          {sameMin ? <Line label="Minimum stay" value={minStay[0]?.[1] ?? '—'} />
            : minStay.map(([c, x]) => <Line key={c} label={<>Minimum stay<Mark channel={c} /></>} value={x} />)}
        </dl>
        <p className="h-pstack-note"><Link className="h-textlink" to={`/property/${row.p.id}/ch/${c0}/availability`}>Open in Availability</Link></p>
      </Sec>
      <Sec title="Property pricing">
        <div className="h-pstack-links">
          <PanelLink title="Base price" summary={`Nightly rate ${v('base', 'nightly')}, weekend rate ${v('base', 'weekend')}`} onClick={() => open('base')} current={current === 'base'} />
          <PanelLink title="Dynamic Pricing" summary={dyn ? `On, between €${row.get('min').value} and €${row.get('max').value}` : 'Off · preview what it would charge'} onClick={() => open('dynamic')} current={current === 'dynamic'} />
          <PanelLink title="Listing markups" summary={markups.map(([c, mk]) => `${CH_NAME[c]} ${mk}%`).join(', ')} onClick={() => open('markups')} current={current === 'markups'} />
          <PanelLink title="Security deposit" summary={pv.channels.map((c) => `${CH_NAME[c]} €0`).join(', ')} onClick={() => open('deposit')} current={current === 'deposit'} />
          <PanelLink title="Occupancy based" summary={`Extra guest fee ${v('occupancy', 'extra')}, ${v('occupancy', 'included')} included`} onClick={() => open('occupancy')} current={current === 'occupancy'} />
          <PanelLink title="Fees" summary={`Cleaning fee ${v('fees', 'cleaning')}, pet fee ${v('fees', 'pet')}`} onClick={() => open('fees')} current={current === 'fees'} />
          <PanelLink title="Discounts" summary={`Weekly discount ${v('discounts', 'weekly')}${pv.view('airbnb', 'discounts', 'monthly') ? `, Airbnb monthly discount ${pv.num('airbnb', 'discounts', 'monthly')}%` : ''}`} onClick={() => open('discounts')} current={current === 'discounts'} />
        </div>
      </Sec>
    </div>
  )
}

/* ---------- level 2 · the sections ---------- */
function SectionPanel({ s, ed, row, night }: { s: Section; ed: Editor; row: Row; night: Night }) {
  switch (s) {
    case 'base': return <BasePanel ed={ed} />
    case 'markups': return <MarkupsPanel ed={ed} night={night} />
    case 'deposit': return <DepositPanel ed={ed} />
    case 'occupancy': return <RowsPanel ed={ed} tab="occupancy" desc="Set prices based on how many guests are staying. You can charge for extra guests beyond your included count and define a maximum occupancy." />
    case 'fees': return <FeesPanel ed={ed} />
    case 'discounts': return <RowsPanel ed={ed} tab="discounts" desc="Offer lower prices for longer stays. Each discount uses the Base on every channel that offers it." />
    case 'dynamic': return <DynamicPanel ed={ed} row={row} night={night} />
  }
}

/** A price row, Listing's exact two-state pattern (review, 1 Oct: "either use the Base, which you cannot edit, or
 *  you change it for Airbnb specifically... it has to be literally the same"): the Base value (editable here, reaches
 *  every channel that uses it unless it has its own), then one row per connected channel — "Uses the Base" (disabled)
 *  with "Customize for {channel}", or a channel's own editable value with "Use the Base" to revert. Stacked, one
 *  channel at a time, never a multi-column comparison. No "Edit per channel": every channel's row is just here. */
export function BaseRow({ ed, tab, r, label, help, per, baseOnly }: {
  ed: Editor; tab: PriceTab; r: PriceRow; label?: ReactNode; help?: ReactNode; per?: string
  /** Listing base › Pricing (screens/base/Pricing.tsx, review 3 Oct: "We have the base, and off of the base others
   *  can act dissimilarly, but I don't need to see that here"): just the Base input and the informational "ⓘ N
   *  channels" caption (N = the channels that use the Base; its tooltip names them). No per-channel rows, no channel
   *  marks, no actions or links; a row only some channels have isn't shown at all. The Calendar's drill-down keeps
   *  its per-channel rows (omit this). */
  baseOnly?: boolean
}) {
  const { pv } = ed
  const nav = useNavigate()
  const k = `price:${r.key}`
  if (pv.channels.every((c) => pv.view(c, tab, r.key)?.state === 'hub')) {
    if (baseOnly) {
      return (
        <SettingRow label={label ?? r.label} help={help ?? r.help} state="hub" hint={false}>
          <Locked>{unitText(r, pv.baseOf(tab, r.key))}</Locked>
        </SettingRow>
      )
    }
    return (
      <SettingRow label={label ?? r.label} help={help ?? r.help} state="hub" scope={`${pv.channels.length} channels`} actionLabel="Edit in Knowledge Hub" onAction={() => nav(`/property/${ed.pid}/hub`)}>
        <Locked>{unitText(r, pv.baseOf(tab, r.key))}</Locked>
      </SettingRow>
    )
  }
  const chans = pv.channels.filter((c) => pv.view(c, tab, r.key))
  // a field only one channel has at all (e.g. an Airbnb-only fee): no Base to fall back to, just that channel's row
  const onlyOne = chans.length > 0 && chans.every((c) => pv.view(c, tab, r.key)!.orig === 'only')
  if (baseOnly) {
    if (onlyOne) return null // a channel's own field (e.g. Airbnb's monthly discount): not on the Base at all
    const users = chans.filter((c) => { const st = pv.view(c, tab, r.key)!.state; return st === 'inherit' || st === 'listing' })
    // "N channels" only where a channel can differ (review, 3 Oct); a value the same everywhere by nature says nothing new
    const varies = chans.some((c) => { const o = pv.view(c, tab, r.key)!.orig; return o === 'inherit' || o === 'override' })
    return (
      <SettingRow label={label ?? r.label} help={help ?? r.help} state="listing" scopeChannels={varies ? users : undefined} hint={varies}>
        <Amount r={r} label={typeof label === 'string' ? label : r.label} value={pv.baseStr(tab, r.key)} onChange={(v) => ed.setBase(k, v)} per={per}
          basis={FEE_BASES[r.key] ? { unit: pv.baseText(`${k}@unit`, FEE_BASES[r.key].dflt), onUnit: (v) => ed.setBase(`${k}@unit`, v),
            cur: pv.baseText(`${k}@cur`, '€'), onCur: (v) => ed.setBase(`${k}@cur`, v) } : undefined} />
      </SettingRow>
    )
  }
  // Calendar: a field only one channel has is that channel's own (review, 3 Oct: Airbnb's monthly discount is edited
  // on Channels › Airbnb › Pricing only, "don't allow it elsewhere"): shown read-only, with Open in Pricing
  if (onlyOne) {
    return <>{chans.map((c) => (
      <SettingRow key={c} label={<span className="h-pstack-chlabel"><Mark channel={c} />{label ?? r.label}</span>} help={help ?? r.help} state="only" channel={c}
        actionLabel="Open in Pricing" onAction={() => nav(`/property/${ed.pid}/ch/${c}/pricing?tab=${tab}`)}>
        <Locked>{unitText(r, pv.num(c, tab, r.key))}</Locked>
      </SettingRow>
    ))}</>
  }
  return (
    <>
      {!onlyOne && (
        <SettingRow label={label ?? r.label} help={help ?? r.help} state="listing" scope={`${pv.channels.length} channel${pv.channels.length === 1 ? '' : 's'}`}>
          <Amount r={r} label={typeof label === 'string' ? label : r.label} value={pv.baseStr(tab, r.key)} onChange={(v) => ed.setBase(k, v)} per={per} />
        </SettingRow>
      )}
      {chans.map((c) => <ChannelRow key={c} ed={ed} tab={tab} r={r} c={c} />)}
    </>
  )
}

/** One channel's value of a row: Uses the Base (disabled) / Custom for {channel} / {channel} only / set by the channel. */
function ChannelRow({ ed, tab, r, c, help }: { ed: Editor; tab: PriceTab; r: PriceRow; c: ListingChannel; help?: ReactNode }) {
  const { pv } = ed
  const v = pv.view(c, tab, r.key)
  if (!v) return null
  const k = `price:${r.key}`
  const st = v.state as FieldState
  const label = <span className="h-pstack-chlabel"><Mark channel={c} />{CH_NAME[c]}</span>
  if (st === 'set' || st === 'hub') {
    return <SettingRow label={label} help={help} state={st} channel={c} lockTip={st === 'set' ? r.setBy?.[c] : undefined}><Locked fixed={st === 'set'}>{st === 'set' ? `Set on ${CH_NAME[c]}` : unitText(r, v.value)}</Locked></SettingRow>
  }
  let actionLabel: string | undefined, onAction: (() => void) | undefined
  if (st === 'inherit') {
    actionLabel = `Customize for ${CH_NAME[c]}`
    // brings back the channel's own value if "Use the Base" kept one (review 30 Sep: switching never loses work)
    onAction = () => { const kept = pv.sl3.custom[c]?.[stashKey(k)]; ed.setCustom(c, k, typeof kept === 'string' ? kept : v.value) }
  } else if (st === 'override') {
    actionLabel = 'Use the Base'
    onAction = () => { ed.setCustom(c, stashKey(k), v.value); ed.setCustom(c, k, v.orig === 'override' ? null : undefined) }
  }
  return (
    <SettingRow label={label} help={help} state={st} channel={c} actionLabel={actionLabel} onAction={onAction}>
      <Amount r={r} label={`${r.label} on ${CH_NAME[c]}`} value={v.value} disabled={st === 'inherit'} onChange={st === 'inherit' ? undefined : (x) => ed.setCustom(c, k, x)} />
    </SettingRow>
  )
}

function BasePanel({ ed }: { ed: Editor }) {
  const { pv } = ed
  return (
    <>
      <Desc>The default nightly rate for open dates that don’t have a price set by hand, by a rule set or by Dynamic Pricing. Every channel starts from it, plus its markup.</Desc>
      {(['nightly', 'weekend'] as const).map((k) => {
        const r = pv.row('base', k)!
        return (
          <SettingRow key={k} label={r.label} help={r.help} state="listing" scope={`${pv.channels.length} channels`}>
            <Amount r={r} label={r.label} value={pv.baseStr('base', k)} onChange={(v) => ed.setBase(`price:${k}`, v)} />
          </SettingRow>
        )
      })}
    </>
  )
}

function MarkupsPanel({ ed, night }: { ed: Editor; night: Night }) {
  const { pv } = ed
  const rate = pv.baseOf('base', isWeekendNight(night.date) ? 'weekend' : 'nightly')
  // review, 1 Oct evening: "pricing markup — make it specific, remove Custom for Airbnb / Use the Base, that's
  // obviously not necessary." A markup only ever exists per channel (there's no shared Base value to inherit), so
  // this one field skips SettingRow's Base/Customize chrome entirely: a plain label+help+input per channel.
  return (
    <>
      <Desc>Set the percentage to add to your nightly rate when updating prices, so you earn the same amount across channels after platform fees.</Desc>
      {pv.channels.map((c) => {
        const k = 'price:markup'
        const v = pv.num(c, 'base', 'markup')
        return (
          <div key={c} className="h-field-row h-field-row--stacked">
            <div className="h-field-row__head">
              <p className="h-field-row__label"><span className="h-pstack-chlabel"><Mark channel={c} />{CH_NAME[c]}</span></p>
              <p className="h-field-row__help">{eur(rate)} becomes {eur(Math.round(rate * (1 + v / 100)))} on {CH_NAME[c]}.</p>
            </div>
            <div className="h-field-row__control">
              <Amount r={{ key: 'markup', label: 'Markup', unit: '%' } as PriceRow} label={`Markup on ${CH_NAME[c]}`} value={String(v)} onChange={(x) => ed.setCustom(c, k, x)} />
            </div>
          </div>
        )
      })}
    </>
  )
}

export function DepositPanel({ ed }: { ed: Editor }) {
  const opts = [
    { v: 'hostaway', title: 'Hostaway collects and refunds it', rec: true, desc: 'We’ll automatically charge the guest 2 days before check-in and refund them 2 days after checkout. A 2% fee applies.' },
    { v: 'host', title: 'Host collects it manually', desc: 'You handle payment and refund off-platform.' },
    { v: 'none', title: 'Leave my booking unsecured' },
  ]
  return (
    <>
      <Desc>Set up a deposit to protect your property from guest damage.</Desc>
      <fieldset className="h-ld-fieldset">
        <legend className="h-ld-legend">Who collects the deposit from guests?</legend>
        <div className="h-radio-cards">
          {opts.map((o) => (
            <label key={o.v} className="h-radio-card h-pstack-radio is-readonly">
              <input className="h-radio" type="radio" name="deposit" checked={o.v === 'none'} readOnly disabled />
              <span><span className="h-radio-card__title">{o.title}{o.rec && <Pill kind="recommended">Recommended</Pill>}</span>{o.desc && <span className="h-radio-card__desc">{o.desc}</span>}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="h-pstack-note">Bookings on {names(ed.pv.channels)} are unsecured today. <OpenInPricing pid={ed.pid} s="deposit" c={ed.pv.channels[0]} /></p>
    </>
  )
}

export function RowsPanel({ ed, tab, desc, baseOnly }: { ed: Editor; tab: PriceTab; desc: string; baseOnly?: boolean }) {
  const { pv } = ed
  return (
    <>
      <Desc>{desc}</Desc>
      {pv.rows[tab].map((r) => <BaseRow key={r.key} ed={ed} tab={tab} r={r} baseOnly={baseOnly} />)}
      {tab === 'discounts' && pv.channels.includes('booking') && <p className="h-pstack-note">Booking.com runs its own deals, like Genius. Manage them in the Booking.com extranet.</p>}
    </>
  )
}

function FeesPanel({ ed }: { ed: Editor }) {
  const { pv } = ed
  const cleaning = pv.row('fees', 'cleaning')!, pet = pv.row('fees', 'pet')!, short = pv.row('fees', 'short_clean')!
  const shortV = pv.view('airbnb', 'fees', 'short_clean')
  return (
    <>
      <Desc>Add one-time charges that apply per stay, like cleaning, resort or pet fees. These are added on top of your nightly rate.</Desc>
      <BaseRow ed={ed} tab="fees" r={cleaning} per="per stay" />
      {shortV && (
        <div className="h-field-row h-field-row--stacked">
          <div className="h-field-row__head">
            <p className="h-field-row__label"><Mark channel="airbnb" />Airbnb short-term cleaning fee</p>
            <p className="h-field-row__help">Charged on Airbnb reservations that are 1–2 nights long. Now {eur(Number(shortV.value) || 0)}.</p>
          </div>
          <div className="h-field-row__control"><button type="button" className="h-textlink" onClick={() => ed.open(sub('fees', short.key))}>Set short-term cleaning fee</button></div>
        </div>
      )}
      <Sec title="Other fees">
        <dl className="h-pstack-lines">
          {['Linens fee', 'Resort fee', 'Management fee', 'Community fee'].map((x) => <Line key={x} label={x} value="€0 per stay" />)}
        </dl>
        <p className="h-pstack-note"><OpenInPricing pid={ed.pid} s="fees" c={pv.channels[0]} /></p>
      </Sec>
      <BaseRow ed={ed} tab="fees" r={pet} per="per stay" />
    </>
  )
}

/* Dynamic Pricing (HS-C13 intro, HS-C15 the night's calculation). Read-only: the preference only previews. */
const PREFS = [{ id: 'conservative', label: 'More conservative', pct: -10 }, { id: 'recommended', label: 'Recommended', pct: 0 }, { id: 'aggressive', label: 'More aggressive', pct: 10 }] as const
export function DynamicPanel({ ed, row, night }: { ed: Editor; row: Row; night: Night }) {
  const { pv } = ed
  const [pref, setPref] = useState<(typeof PREFS)[number]['id']>('recommended')
  const weekend = isWeekendNight(night.date)
  const current = pv.baseOf('base', weekend ? 'weekend' : 'nightly')
  // market model: a market base for the home, then booking window, local demand and seasonality
  const p = PREFS.find((x) => x.id === pref)!.pct
  const market = Math.round(pv.baseOf('base', 'nightly') * 1.5 * (1 + p / 100))
  const windowAdj = Math.round(market * (night.daysAhead < 7 ? -0.15 : night.daysAhead < 21 ? -0.06 : 0))
  const demand = Math.round(market * (weekend ? 0.12 : 0.03))
  const season = Math.round(market * -0.03)
  const min = row.get('min').value, max = row.get('max').value
  const raw = market + windowAdj + demand + season
  const dyn = Math.min(max, Math.max(min, raw))
  const sign = (n: number) => (n > 0 ? `+€${n}` : n < 0 ? `−€${-n}` : '€0')
  const on = row.get('dynamic').value
  return (
    <>
      <Desc>{on ? `Dynamic Pricing is on for this home. It sets a price per night from demand, between your minimum €${min} and maximum €${max}.` : 'Dynamic Pricing reacts to market demand to raise revenue and fill more nights. It’s off for this home: here is what it would do.'}</Desc>
      <fieldset className="h-ld-fieldset">
        <legend className="h-ld-legend">Base price preference</legend>
        <div className="h-radio-cards">
          {PREFS.map((o) => (
            <label key={o.id} className="h-radio-card h-pstack-radio">
              <input className="h-radio" type="radio" name="dyn-pref" checked={pref === o.id} onChange={() => setPref(o.id)} />
              <span className="h-radio-card__title">{o.label}<span className="h-pstack-radio__trail">{o.pct ? `${o.pct > 0 ? '+' : ''}${o.pct}%` : ''}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <Sec title={`This night, ${night.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`}>
        <div className="h-pstack-box">
          <dl className="h-pstack-lines">
            <Line label="Your current price" value={eur(current)} />
            <Line label="Base price" value={eur(market)} />
            <Line label="Booking window" value={sign(windowAdj)} />
            <Line label="Local demand" value={sign(demand)} />
            <Line label="Seasonality" value={sign(season)} />
            {raw !== dyn && <Line label={raw > max ? 'Capped at your maximum' : 'Raised to your minimum'} value={eur(dyn)} />}
            <Line total label="Dynamic price" value={eur(dyn)} />
          </dl>
        </div>
      </Sec>
      <Sec title="What the colours mean">
        <ul className="h-pstack-legend">
          <li><Icon name="currency-dollar" className="h-pstack-legend--up" />You could earn more by raising your price.</li>
          <li><Icon name="currency-dollar" />Your price looks good, it matches the recommendation.</li>
          <li><Icon name="currency-dollar" className="h-pstack-legend--down" />You could get more bookings by lowering your price.</li>
        </ul>
      </Sec>
      <p className="h-pstack-note"><OpenInPricing pid={ed.pid} s="dynamic" c={pv.channels[0]} /></p>
    </>
  )
}

/* ---------- level 3 · one value per channel ---------- */
export function FieldPanel({ ed, tab, r }: { ed: Editor; tab: PriceTab; r: PriceRow }) {
  const { pv } = ed
  const chans = pv.channels.filter((c) => pv.view(c, tab, r.key))
  const onlyOne = chans.every((c) => pv.view(c, tab, r.key)!.orig === 'only')
  return (
    <>
      <Desc>{onlyOne ? `${r.help} ${names(chans)} only: the other channels have no such field.` : `${r.help} Channels that use the Base get its value; a channel can have its own.`}</Desc>
      {!onlyOne && (
        <SettingRow label="Base" help="The value every channel uses unless it has its own." state="listing" scope={scopeText(pv, tab, r.key)}>
          <Amount r={r} label={`${r.label}, Base`} value={pv.baseStr(tab, r.key)} onChange={(v) => ed.setBase(`price:${r.key}`, v)} />
        </SettingRow>
      )}
      {chans.map((c) => <ChannelRow key={c} ed={ed} tab={tab} r={r} c={c} />)}
    </>
  )
}
