/* Channels › {channel} › Pricing (V3-SPEC §3). Owner WS-CH.
 * Hostaway's Pricing screens (HS-30 Base price, HS-L10 Occupancy based, HS-33 Fees, HS-L11 Discounts) for one channel:
 * every row says whether it is shared by all channels, uses the Base, is custom here or is set by the channel.
 * Money never changes on its own: with Autopilot on, a price tip still waits for Accept (CV-07).
 * URL states: ?tab=base|occupancy|fees|discounts · ?smart=on|off · ?tip=p-a-weekly
 * Multi-property (QA B01/B02): the rows' defaults are the active property's (data/property-listing.ts pricesFor); the
 * money tip is the scenario property's only. */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import {
  Button, Diff, HeadTips, Icon, Locked, Note, NumberField, PageHead, PanelLink, PanelStack, Pill, PriceExample, QueryTabs, SaveActions, SectionHead, Split, TopToast, UnsavedBar, type StackPanel,
} from '../../ds'
import type { ListingChannel } from '../../data/sl3'
import { CURRENCIES, FEE_BASES, PRICE_TABS, PRICE_TIP, type PriceRow, type PriceTab } from '../../data/v3-ch'
import { pricesFor } from '../../data/property-listing'
import { useListingChannels } from '../../store/selectors'
import { isScenarioProperty } from '../../data/portfolio'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { CH_NAME, ChannelLead, DraftProvider, ScopedRow, useChannel, useChannelDemoParams, useChannelPlan, useSectionDraft, useSharedVisibility } from './common'
import { commitAndSend, savedLabel } from '../push/changes'
import { buildRows, type Row } from '../portfolio/rows'
import {
  DepositPanel, DynamicPanel, FieldPanel, TITLE as PANEL_TITLE, sub as subId, usePriceView, type Editor, type Night,
} from '../pricing/PricingPanels'
import { SHARED_TIP_NOTE, screenTipId, tipEditable, useScreenTips, useTipsGate, visibilityOf, type ScreenTipDef } from './screenTips'

const DESC: Record<PriceTab, string> = {
  base: 'The default nightly rate for open dates that don’t have a price set by hand or by Dynamic Pricing.',
  occupancy: 'Set prices based on how many guests are staying. You can charge for extra guests beyond your included count and define a maximum occupancy.',
  fees: 'One-time charges that apply per stay.',
  discounts: 'Offer lower prices for longer stays.',
}

/** The channel's own ceiling on a fee. Save is blocked above it and the host reads why in a top toast (and inline).
 *  Airbnb cleaning fee ≤ €627.73: Hostaway's mobile web app (review's capture, images/45, 30 Sep 2026). */
const FEE_LIMITS: Partial<Record<ListingChannel, Record<string, { max: number; what: string }>>> = {
  airbnb: { cleaning: { max: 627.73, what: 'cleaning fee' } },
}
const eur = (n: number) => `€${n.toFixed(2)}`

/* ---------- the property-wide panels (Dynamic Pricing, Security deposit, "Edit per channel") ---------- *
 * D-927 (review, 1 Oct): Hostaway's own drill-downs replace the whole screen; ours slide in instead and keep what you
 * came from in view (ds/panels.tsx). Reuses the Calendar's panel content (screens/pricing/PricingPanels.tsx) rather than
 * re-deriving it, since it already reads/writes the same price:* keys this page does. This page's own inline Customize
 * (ScopedRow, above) is unaffected — the panel is a second, independent draft that commits on its own Save, the same way
 * the Hub, this page and Calendar already all write the same store fields without stepping on each other. */
type Open = { kind: 'dynamic' } | { kind: 'deposit' } | { kind: 'field'; tab: PriceTab; key: string } | null
type DVal = { v: string | null | undefined }
interface PDraft { key: string; base: Record<string, string>; custom: Partial<Record<ListingChannel, Record<string, DVal>>> }
const emptyPDraft = (key: string): PDraft => ({ key, base: {}, custom: {} })

function usePricingPanel(pid: string) {
  const [open, setOpen] = useState<Open>(null)
  const key = open ? JSON.stringify(open) : ''
  const [raw, setRaw] = useState<PDraft>(() => emptyPDraft(key))
  const draft = raw.key === key ? raw : emptyPDraft(key) // switching what's open drops the unsaved draft
  const update = (fn: (d: PDraft) => PDraft) => setRaw((prev) => fn(prev.key === key ? prev : emptyPDraft(key)))
  const [saved, setSaved] = useState<{ at: number; text: string } | null>(null)
  useEffect(() => { if (!saved) return; const t = setTimeout(() => setSaved(null), 4000); return () => clearTimeout(t) }, [saved])
  useEffect(() => { setSaved(null) }, [key])
  const pv = usePriceView(pid, draft)
  const dirty = Object.keys(draft.base).length + Object.values(draft.custom).reduce((n, x) => n + Object.keys(x ?? {}).length, 0) > 0
  const ed: Editor = {
    pv, pid,
    setBase: (k, v) => update((d) => {
      const b = { ...d.base }
      const r = Object.values(pv.rows).flat().find((x) => `price:${x.key}` === k)
      if (v === (useStore.getState().sl3.base[k] ?? String(r?.base ?? ''))) delete b[k]; else b[k] = v
      return { ...d, base: b }
    }),
    setCustom: (c, k, v) => update((d) => {
      const cur = { ...(d.custom[c] ?? {}) }
      if (v === useStore.getState().sl3.custom[c]?.[k]) delete cur[k]; else cur[k] = { v }
      return { ...d, custom: { ...d.custom, [c]: cur } }
    }),
    open: () => {}, // this page only ever opens one level from a row or card; no deeper level from inside a panel
  }
  const save = () => {
    const s = useStore.getState()
    const chans = (Object.keys(draft.custom) as ListingChannel[]).filter((c) => Object.keys(draft.custom[c] ?? {}).length)
    const customKeys = [...new Set(chans.flatMap((c) => Object.keys(draft.custom[c]!)))]
    const sent = [
      ...commitAndSend(() => { for (const c of chans) for (const [k, { v }] of Object.entries(draft.custom[c]!)) s.sl3Custom(c, k, v) }, chans, customKeys),
      ...commitAndSend(() => { for (const [k, v] of Object.entries(draft.base)) s.sl3Base(k, v) }, pv.channels, Object.keys(draft.base)),
    ]
    setRaw(emptyPDraft(key))
    setSaved({ at: Date.now(), text: savedLabel(sent) })
  }
  const discard = () => setRaw(emptyPDraft(key))
  const foot = (
    <>
      {saved && !dirty && <span key={saved.at} className="h-saved h-saved--sent" role="status"><Icon name="circle-check" />{saved.text}</span>}
      <Button onClick={discard} disabled={!dirty}>Discard</Button>
      <Button kind="primary" disabled={!dirty} onClick={save}>Save</Button>
    </>
  )
  return { open, setOpen, ed, foot }
}

/** Today, as the representative night for a Dynamic Pricing preview opened outside the Calendar (no specific date to anchor to). */
const TODAY: Night = { i: 0, date: new Date(), daysAhead: 0 }
function panelsFor(open: Open, ed: Editor, prow: Row | undefined, PRICES: Record<PriceTab, PriceRow[]>, foot: ReactNode): StackPanel[] {
  if (!open) return []
  if (open.kind === 'dynamic') return prow ? [{ id: 'dynamic', title: PANEL_TITLE.dynamic, content: <DynamicPanel ed={ed} row={prow} night={TODAY} /> }] : []
  if (open.kind === 'deposit') return [{ id: 'deposit', title: PANEL_TITLE.deposit, content: <DepositPanel ed={ed} /> }]
  const r = PRICES[open.tab].find((x) => x.key === open.key)
  return r ? [{ id: subId(open.tab, open.key), title: r.label, content: <FieldPanel ed={ed} tab={open.tab} r={r} />, footer: foot }] : []
}

export function ChannelPricing() {
  const p = useProperty()
  const c = useChannel()
  useChannelDemoParams(c)
  if (!c) return <Navigate to={`/property/${p.id}/ch/airbnb/pricing`} replace />
  return <Pricing c={c} />
}

function Pricing({ c }: { c: ListingChannel }) {
  const p = useProperty()
  const [params, setParams] = useSearchParams()
  const tab = (PRICE_TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'base') as PriceTab
  const name = CH_NAME[c]
  const { active, plan, paused } = useChannelPlan(c)
  const draft = useSectionDraft(c, tab) // edits wait for Save (Discard changes / Save)
  const [hideShort, setHideShort] = useState(false) // Airbnb's short-stay cleaning fee row can be hidden (session only)
  const { custom, base } = draft
  const PRICES = pricesFor(p.id)
  const channels = useListingChannels()
  const hasAirbnb = channels.includes('airbnb')
  // the property-wide panels (Dynamic Pricing, Security deposit, "Edit per channel"): a second, independent draft (above)
  const { open, setOpen, ed, foot } = usePricingPanel(p.id)
  const s = useStore()
  const prow = buildRows(s).find((r) => r.p.id === p.id)
  const panels = panelsFor(open, ed, prow, PRICES, foot)
  const q = (patch: Record<string, string | null>) => { const n = new URLSearchParams(params); for (const [k, v] of Object.entries(patch)) (v === null ? n.delete(k) : n.set(k, v)); return `?${n}` }

  // what a guest sees on this channel (base rates + this channel's markup)
  const num = (k: string, row: PriceRow) => Number(custom?.[`price:${k}`] ?? base[`price:${k}`] ?? row.value?.[c] ?? row.base)
  const [nightly, weekend, markup] = PRICES.base.map((r) => num(r.key, r))
  const withMarkup = (x: number) => Math.round(x * (1 + markup / 100))

  // channel limits: checked on Save; the edit stays, the Save is refused, and the toast says why (images/45)
  const limits = FEE_LIMITS[c] ?? {}
  const overLimit = (key: string) => {
    const l = limits[key]; const r = PRICES[tab].find((x) => x.key === key)
    return !!l && !!r && !!r.state[c] && num(key, r) > l.max
  }
  const [limitErr, setLimitErr] = useState<string | null>(null) // the field key whose limit blocked the last Save
  const [toast, setToast] = useState(false) // the toast goes on Dismiss; the inline error stays until the value fits
  useEffect(() => { setLimitErr(null); setToast(false) }, [c, tab])
  const save = () => {
    const bad = Object.keys(limits).find(overLimit)
    if (bad) { setLimitErr(bad); setToast(true); return false }
    setLimitErr(null); setToast(false); commitDrafted() // a tip accepted into this draft is accepted now, not before (T-1)
    return draft.save() // "Saved · sent to Airbnb"
  }
  const discard = () => { setLimitErr(null); setToast(false); draft.discard() }
  const limitMsg = limitErr ? `The ${limits[limitErr].what} must not exceed ${eur(limits[limitErr].max)} for ${name}.` : ''

  // Field visibility (Property › Overview's Show / Edit / Don't show, common.tsx useSharedVisibility): the same read
  // ScopedRow makes for each row, here for the two shared rates so the guest-price note and the weekend tip follow it.
  // 'hidden' = the row isn't on this page, so neither is anything about it; 'show' = read-only, so no tip either
  // (ScopedRow already drops the dot in that state).
  const rowOf = (t: PriceTab, k: string) => PRICES[t].find((r) => r.key === k)
  const visNightly = useSharedVisibility('price:nightly', rowOf('base', 'nightly')?.state[c] ?? 'inherit')
  const visWeekend = useSharedVisibility('price:weekend', rowOf('base', 'weekend')?.state[c] ?? 'inherit')
  const showNightly = visNightly !== 'hidden'
  const showWeekend = visWeekend !== 'hidden'

  // Tips: usePricingTips (below) builds the list; Accept hands its number to the row's real control here — the value
  // goes into this section's unsaved draft, the input is focused, and nothing changes or is sent until Save (CV-07).
  const propose = (t: PriceTab, key: string, value: string) => {
    const r = rowOf(t, key); const st = r?.state[c]
    if (t !== tab || !r || !st || st === 'hub' || st === 'set') return
    const k = `price:${key}`
    if (st === 'listing') { draft.setOpen(k, true); draft.setBase(k, value, String(r.base)) } // Save sends it to every channel (EverywhereNote says so)
    else draft.setCustom(k, value) // "Custom for {channel}", with "Use the Base" to go back
    setTimeout(() => document.getElementById(`row-${key}`)?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 0)
  }
  // stable per URL (not a fresh arrow each render), so the Tips hook's travel effect doesn't re-run while you type
  const goToTab = useCallback((t: string) => setParams((prev) => { const n = new URLSearchParams(prev); n.set('tab', t); n.delete('tip'); return n }, { replace: true }), [setParams])
  const tipDefs = usePricingTips(p.id, c, propose)
  const { chip: tipsChip, panel: tipsPanel, rowTip, tabCount, commitDrafted } = useScreenTips(c, tipDefs, { current: tab, onGoTo: goToTab }, { key: `${c}:${tab}`, dirty: draft.dirty })

  const row = (r: PriceRow) => {
    const st = r.state[c]
    if (!st) return null
    const invalid = limitErr === r.key && overLimit(r.key)
    // a fee's basis ("per stay ⌄") and currency: the Base's, a dropdown here once this channel has its own value
    const fb = FEE_BASES[r.key]
    const uKey = `price:${r.key}@unit`, cKey = `price:${r.key}@cur`
    const unitNow = (typeof draft.custom?.[uKey] === 'string' ? draft.custom[uKey] as string : undefined) ?? s.sl3.base[uKey] ?? fb?.dflt ?? ''
    const curNow = (typeof draft.custom?.[cKey] === 'string' ? draft.custom[cKey] as string : undefined) ?? s.sl3.base[cKey] ?? '€'
    // Airbnb's own short-stay cleaning fee: a note under it (what is pushed) and a way to hide the row
    if (r.key === 'short_clean' && hideShort) return null
    return (
      <div key={r.key} id={`row-${r.key}`}>
      <ScopedRow c={c} k={`price:${r.key}`} label={r.label} help={r.help} orig={st} baseValue={String(r.base)} {...rowTip(`row-${r.key}`)}
        chValue={r.value?.[c] !== undefined ? String(r.value[c]) : undefined} setBy={r.setBy?.[c]} hubTo={`/property/${p.id}/hub`}
        after={invalid ? <p className="h-error-text" id={`err-${r.key}`}><Icon name="alert-circle" size={16} />{limitMsg}</p>
          : r.key === 'short_clean' ? <><p className="h-field-note">Price pushed to Airbnb: €{r.value?.airbnb ?? r.base}</p><p className="h-field-note"><button type="button" className="h-textlink" onClick={() => setHideShort(true)}>Hide short term cleaning fee</button></p></> : undefined}
        control={(v, write, locked, disabled, refs) => locked ? <Locked fixed={!!r.setBy?.[c]}>{r.setBy?.[c] ? 'Set on Booking.com' : `${v} ${r.unit === 'guests' ? 'guests' : r.unit}`}</Locked> : (
          /* NumberField (ds/v3-ch.tsx): the same input + unit as before, now with the shared up/down spinner and
             Up/Down key support (review, 1 Oct). The sanitising below is unchanged, so the draft/validation path
             and the over-limit error are exactly what they were. Money steps by 1, percentages and guests by 1 too. */
          <NumberField label={r.label} value={v} disabled={disabled} invalid={invalid}
            describedBy={invalid ? `err-${r.key}` : undefined} inputRef={refs.input}
            inputMode="decimal" decimals={r.unit === '%' || r.unit === 'guests' ? 0 : 2} max={r.unit === '%' ? 100 : 99999}
            unit={fb ? undefined : r.unit === 'guests' ? (Number(v) === 1 ? 'guest' : 'guests') : r.unit}
            currency={fb ? curNow : r.key === 'short_clean' ? '€' : undefined}
            per={r.key === 'short_clean' || r.key === 'cleaning' ? 'per stay' : undefined}
            perSelect={fb ? { value: unitNow, options: fb.options, onChange: (u) => draft.setCustom(uKey, u) } : undefined}
            currencySelect={fb?.currency ? { value: curNow, options: CURRENCIES, onChange: (cu) => draft.setCustom(cKey, cu) } : undefined}
            onChange={(next) => write(next.replace(/[^0-9.]/g, ''))} />
        )}
      />
      </div>
    )
  }

  return (
    // task 2/4 (same chrome as Listing/Policies, third-round fix): the whole head — title, property switcher and
    // Tips chip, plus the tab row — stays pinned together in one .ch-editor__head block (sticky), while the
    // PanelStack's main content (section head, rows, Dynamic Pricing/Security deposit entry points) scrolls beneath
    // it as a sibling inside Split. Only this outer wrapper moved; the panel-slot mechanism below is unchanged.
    <div className="ch-editor">
      <div className="ch-editor__head">
        <div className="ch-page">
          {/* strategy / Autopilot as one short line (review 30 Sep), never a banner; prices always ask, even on Autopilot */}
          <PageHead lead={<ChannelLead c={c} />} title="Pricing" property={p}
            actions={<>
              {active && plan.mode === 'autopilot' && !paused && <span className="ch-autoline" role="status"><Icon name="rocket" size={16} />Autopilot is on · prices always ask you first</span>}
              {/* phones: the tab row hides its own Tips chip (ds/v3/ch.css), so it shows here instead, as in the Listing editor */}
              <HeadTips>{tipsChip}</HeadTips>
            </>} />
        </div>
        <div className="ch-tabrow">
          <QueryTabs active={tab} items={PRICE_TABS.map((t) => ({ id: t.id, label: t.label, to: q({ tab: t.id, tip: null }), count: tabCount(t.id) || undefined }))} />
          {tipsChip}
        </div>
      </div>
      <Split main={
        <DraftProvider value={draft}>
        <PanelStack label="Pricing details" rootTitle="Pricing" panels={panels} onBack={() => setOpen(null)} onClose={() => setOpen(null)} main={
        <div className="ch-page">
          <SectionHead title={PRICE_TABS.find((t) => t.id === tab)!.label} desc={DESC[tab]}
            actions={<SaveActions dirty={draft.dirty} onDiscard={discard} onSave={save} />} />
          <TopToast open={toast && !!limitErr} message={limitMsg} onDismiss={() => setToast(false)} />

          {PRICES[tab].map(row)}

          {tab === 'base' && (
            <>
              {/* only the rates this page actually shows: a hidden rate (Field visibility) isn't quoted here either */}
              {(showNightly || showWeekend) && (
                <div className="ch-mt">
                  <Note icon="coin">
                    On {name}, guests see {showNightly && <><b>€{withMarkup(nightly)}</b> a night</>}{showNightly && showWeekend && ' and '}
                    {showWeekend && <><b>€{withMarkup(weekend)}</b> {showNightly ? 'on weekends' : 'a night on weekends'}</>}
                    {markup ? <> (your {showNightly && showWeekend ? 'rates' : 'rate'} + {markup}% {name} markup)</> : <> (your {showNightly && showWeekend ? 'rates' : 'rate'}, no markup)</>}.
                  </Note>
                </div>
              )}
              <a className="h-ai-card ch-mt" href="#dynamic" onClick={(e) => { e.preventDefault(); setOpen({ kind: 'dynamic' }) }}>
                <Icon name="sparkles" />
                <div className="h-ai-card__main"><div className="h-ai-card__title">Dynamic Pricing <Pill kind="new">New</Pill></div>
                  <div className="h-ai-card__body h-ai-card__body--aa">Smarter pricing that adapts to booking trends, inside your guardrails{active ? ` (€${plan.priceMin}–${plan.priceMax})` : ''}.</div></div>
                <Icon name="chevron-right" />
              </a>
              {/* Security deposit has no Base tab of its own here (D-927, S10 QA): a plain entry into the read-only panel. */}
              <div className="ch-mt">
                <PanelLink title="Security deposit" summary="Protect your property from guest damage" onClick={() => setOpen({ kind: 'deposit' })} />
              </div>
            </>
          )}
          {tab === 'discounts' && c === 'booking' && <div className="ch-mt"><Note icon="info-circle">Booking.com runs its own deals, like Genius. Manage them in the Booking.com extranet; they show here once they sync.</Note></div>}
          {tab === 'fees' && c !== 'airbnb' && hasAirbnb && <div className="ch-mt"><Note icon="info-circle">The short-stay cleaning fee exists only on Airbnb.</Note></div>}
          <UnsavedBar />
        </div>
        } />
        </DraftProvider>
      } panel={tipsPanel} />
    </div>
  )
}

/* ---------- Pricing tips (shared by this screen and the property rail's per-page count) ----------
 * review, 3 Oct: "recommendations not only in the Listing page, but also in Pricing… the tips should appear next to
 * whatever it is that the tip is for": one per tab, each tied to the row it would change (`field` = that row's id),
 * with the purple dot after the row's label (SettingRow tips/onTip via screenTips rowTip) and a count on its tab.
 * every number is derived from this channel's own saved rows; the reasoning is strategy, not measured data.
 * Gated like every channel tip (screenTips useTipsGate); a hidden or read-only row (Field visibility) has no tip.
 * `propose` is the screen's own Accept for the three draft tips (the rail passes none: it only counts). The money tip
 * (CV-07, Weekly discount) is the scenario property's Airbnb only, unchanged: its Accept is the reviewed commit through
 * commitAndSend that the rest of the case — Canvas, push receipts — already reads. */
export function usePricingTips(pid: string, c: ListingChannel, propose?: (t: PriceTab, key: string, value: string) => void): ScreenTipDef[] {
  const gate = useTipsGate(c)
  const PRICES = pricesFor(pid)
  const custom = useStore((s) => s.sl3.custom[c]) // stable references (Zustand v5); derived below
  const base = useStore((s) => s.sl3.base)
  const fv = useStore((s) => s.overview?.[pid]?.fieldVisibility)
  return useMemo(() => {
    if (!gate) return []
    const rowOf = (t: PriceTab, k: string) => PRICES[t].find((r) => r.key === k)
    const has = (t: PriceTab, k: string) => !!rowOf(t, k)?.state[c]
    const editable = (t: PriceTab, k: string) => tipEditable(visibilityOf(fv, `price:${k}`, rowOf(t, k)?.state[c] ?? 'inherit'))
    // what is saved (never the live draft): Accept only fills the draft, so the card doesn't move under you
    const at = (t: PriceTab, k: string) => { const r = rowOf(t, k); return r ? Number(custom?.[`price:${k}`] ?? base[`price:${k}`] ?? r.value?.[c] ?? r.base) : 0 }
    const [tNightly, tWeekend] = [at('base', 'nightly'), at('base', 'weekend')]
    const bump = Math.round(tWeekend * 1.12)
    const [included, extra, maxGuests] = [at('occupancy', 'included'), at('occupancy', 'extra'), at('occupancy', 'max')]
    const cleaning = at('fees', 'cleaning')
    const cleanTo = Math.round(cleaning * 0.8)
    const accept = (t: PriceTab, k: string, v: string) => (propose ? () => propose(t, k, v) : undefined)
    // a listing-wide row ("Edit for all channels") has no value of its own on this channel: the tip changes every channel
    const shared = (t: PriceTab, k: string) => rowOf(t, k)?.state[c] === 'listing' && typeof custom?.[`price:${k}`] !== 'string' ? SHARED_TIP_NOTE : undefined
    const money: ScreenTipDef[] = isScenarioProperty(pid) && c === PRICE_TIP.channel ? [{
      id: PRICE_TIP.id, type: 'Weekly discount', section: 'Discounts', title: PRICE_TIP.title, field: `row-${PRICE_TIP.field}`, tab: PRICE_TIP.tab,
      main: <><Diff from={`${PRICE_TIP.from}%`} to={`${PRICE_TIP.to}% for stays of 7 nights or more`} /><PriceExample label={PRICE_TIP.example[0]} from={PRICE_TIP.example[1]} to={PRICE_TIP.example[2]} /></>,
      why: PRICE_TIP.why,
      onAccept: () => commitAndSend(() => {
        const s = useStore.getState()
        s.sl3Tip(PRICE_TIP.id, 'accepted')
        s.sl3Custom(c, `price:${PRICE_TIP.field}`, String(PRICE_TIP.to))
      }, [c], [`price:${PRICE_TIP.field}`], `Tip · ${PRICE_TIP.title}`),
    }] : []
    return [
      // Base price · Weekend rate — gone when the weekend rate is hidden (or read-only) for this property
      ...(has('base', 'weekend') && editable('base', 'weekend') && bump > tWeekend ? [{
        id: screenTipId(c, 'pt-weekend'), type: 'Weekend rate', section: 'Base price', title: 'Raise your weekend rate', field: 'row-weekend', tab: 'base',
        main: <Diff from={`€${tWeekend} a night`} to={`€${bump} on Fridays and Saturdays`} note={shared('base', 'weekend')} />,
        why: [
          { text: 'Friday and Saturday nights book out first in your area. A higher weekend rate rarely costs you a booking.', source: 'strategy' },
          { text: `Right now your weekend rate is only €${Math.max(0, tWeekend - tNightly)} above a weeknight.`, source: 'strategy' },
        ],
        onAccept: accept('base', 'weekend', String(bump)), drafted: true,
      } satisfies ScreenTipDef] : []),
      // Occupancy based · Guests included
      ...(has('occupancy', 'included') && editable('occupancy', 'included') && included < 2 && maxGuests >= 2 && extra > 0 ? [{
        id: screenTipId(c, 'pt-included'), type: 'Guests included', section: 'Occupancy based', title: 'Include 2 guests in your nightly rate', field: 'row-included', tab: 'occupancy',
        main: <Diff from={`${included} guest`} to="2 guests" note={shared('occupancy', 'included')} />,
        why: [
          { text: `A couple pays €${extra} a night more than the rate they first see, because only ${included} guest is included.`, source: 'strategy' },
          { text: 'Guests compare the total for their party, so the price a pair sees first should be the price they pay.', source: 'strategy' },
        ],
        onAccept: accept('occupancy', 'included', '2'), drafted: true,
      } satisfies ScreenTipDef] : []),
      // Fees · Cleaning fee
      ...(has('fees', 'cleaning') && editable('fees', 'cleaning') && cleaning >= 10 && tNightly > 0 ? [{
        id: screenTipId(c, 'pt-cleaning'), type: 'Cleaning fee', section: 'Fees', title: 'Lower your cleaning fee', field: 'row-cleaning', tab: 'fees',
        main: <Diff from={`€${cleaning} per stay`} to={`€${cleanTo} per stay`} note={shared('fees', 'cleaning')} />,
        why: [
          { text: `On a one-night stay, your €${cleaning} cleaning fee adds ${Math.round((cleaning / tNightly) * 100)}% to your €${tNightly} nightly rate.`, source: 'strategy' },
          { text: 'A lighter fee makes short stays look cheaper where guests compare totals, without touching your nightly rate.', source: 'strategy' },
        ],
        onAccept: accept('fees', 'cleaning', String(cleanTo)), drafted: true,
      } satisfies ScreenTipDef] : []),
      // Discounts · Weekly discount
      ...money,
    ]
  }, [gate, PRICES, custom, base, fv, pid, c, propose])
}
