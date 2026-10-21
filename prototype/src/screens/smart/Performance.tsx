/* Smart Listings › Performance · WS-SL. Reworked 3 Oct over several rounds of Antonio's feedback the same day. The last
 * round overrides every earlier one where they differ ("these last changes are the ones that have to override all of
 * the other ones"):
 *   · no versions: no strategy picker, no per-version pages (old URLs redirect, routes.tsx), nothing numbered;
 *   · no comparison mode: no "Compare with…" control, no previous period / last year / other strategy;
 *   · one built-in baseline only: the same number of days just BEFORE the channel's strategy started. The charts draw
 *     it in neutral grey on the same timeline, then the period since in the brand colour, with a marker where the
 *     strategy started;
 *   · KPI cards: label, value, one quiet line of context. No series colours, no "vs" values, no delta chips (a chip
 *     against the baseline was allowed; left out to keep the cards simple, as he preferred);
 *   · controls on one line: the channel on the left; the period, with its own "Period" label, flush right, same height;
 *   · one short sentence above the cards says how the channel is doing against the stretch before.
 * Earlier rounds that still hold: one channel at a time (no All), a one-line page description, no recommendations,
 * chart tooltips inside the plot, Hospitable Metrics card styling (research/current-state/antonio-2026-10-03-metrics/,
 * REAL·PRODUCT), each chart card with its own settings (Bar / Line, By day / week / month).
 * Data: data/performance.ts — SIMULATED (labelled in the case study, not on screen): scenarioSim for Neukölln, the
 * generated baselineSim for any other property. Every number, the summary sentence included, is read from it.
 * "When the strategy started" is shared.ts strategyStart (the same date Strategy › channel shows).
 * URL: ?ch=airbnb|booking|direct, ?period=since|last30|last90, ?smart=on. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Dropdown, Lens, PageFrame, PageHead, PerfCard, PerfChart, PerfField, PerfKpi, PerfKpis, PerfSettings, PerfToolbar, SlSection, SmartOffCard,
  type PerfChartKind, type PerfGrouping,
} from '../../ds'
import { chName, type ListingChannel } from '../../data/sl3'
import { SL_DAYS, baselineSim, scenarioSim, slDate, slDayOf, slFmt, slMetrics, type SlMetrics, type SlSim } from '../../data/performance'
import { PROFILES } from '../../data/property-seeds'
import { isScenarioProperty } from '../../data/portfolio'
import { useListingChannels } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { hasStrategy, strategyStart, syncVersions, useSmartDemo } from './shared'
import { daysText, eur, pct, range, relPct } from './perf'

/** Similar homes' typical lead time and rating (ASSUMPTION: market data has no per-day lead time; a constant stands in). */
const COMPS_LEAD = 21, COMPS_RATING = 4.8
/** Under a week since the strategy started there is nothing to read yet. */
const EARLY = 7

interface Win { from: number; to: number }
type PeriodId = 'since' | 'last30' | 'last90'
/** Periods all end today. "Since strategy started" is the default; the shorter ones only when the strategy has run
 *  clearly longer than them (at least a week longer, or they'd be nearly the same window under another name). */
function periodsFor(start: number): Array<{ id: PeriodId; label: string; win: Win }> {
  const run = SL_DAYS - start
  return [
    { id: 'since' as const, label: 'Since strategy started', win: { from: start, to: SL_DAYS } },
    ...(run >= 37 ? [{ id: 'last30' as const, label: 'Last 30 days', win: { from: SL_DAYS - 30, to: SL_DAYS } }] : []),
    ...(run >= 97 ? [{ id: 'last90' as const, label: 'Last 90 days', win: { from: SL_DAYS - 90, to: SL_DAYS } }] : []),
  ]
}

/* ---------- the KPI cards: label · value · one quiet line ---------- */
function kpis(ch: ListingChannel, sim: SlSim, m: SlMetrics): Array<{ label: string; value: string; foot: string; muted?: boolean }> {
  const conv = sim.channels.includes('direct') && ch === 'direct'
  return [
    { label: 'Occupancy', value: pct(m.occ), foot: `Similar homes ${pct(m.compsOcc)}` },
    { label: 'Nightly rate (ADR)', value: m.nights ? eur(m.adr) : '—', foot: `Similar homes ${eur(m.compsAdr)}` },
    { label: 'RevPAR', value: m.revpar >= 100 ? eur(m.revpar) : `€${m.revpar.toFixed(1)}`, foot: 'Revenue per available night' },
    { label: 'Revenue', value: eur(m.revenue), foot: `${m.bookings} booking${m.bookings === 1 ? '' : 's'} · ${daysText(m.days)}` },
    { label: 'Next 30 nights booked', value: pct(m.pace), foot: `Similar homes ${pct(m.compsPace)}` },
    { label: 'Lead time', value: m.bookings ? `${Math.round(m.lead)} days` : '—', foot: `Similar homes ${COMPS_LEAD} days` },
    conv
      ? { label: 'Views → bookings', value: m.conversion !== null ? `${(m.conversion * 100).toFixed(1)}%` : '—', foot: `${m.views ?? 0} visits to your site` }
      : { label: 'Views → bookings', value: 'Not shared', foot: `${chName(ch)} keeps page views`, muted: true },
    { label: 'Average rating', value: m.rating !== null ? `${m.rating.toFixed(1)} ★` : '—', foot: `${m.reviews} review${m.reviews === 1 ? '' : 's'} · similar homes ${COMPS_RATING}` },
  ]
}

/** The one-line summary: occupancy and revenue for the period against the same number of days before the strategy.
 *  SIMULATED (both figures read from the dataset). */
function summary(period: PeriodId, len: number, startLabel: string, a: SlMetrics, b: SlMetrics): string {
  const lead = period === 'since' ? `Since the strategy started on ${startLabel}` : `Over the last ${len} days`
  const than = period === 'since' ? 'the same stretch before' : `the ${len} days before the strategy started on ${startLabel}`
  const pts = Math.round((a.occ - b.occ) * 100)
  const occ = pts === 0 ? 'occupancy is about the same' : `occupancy is ${pts > 0 ? 'up' : 'down'} ${Math.abs(pts)} point${Math.abs(pts) === 1 ? '' : 's'}`
  if (!a.revenue && !b.revenue) return `${lead}, ${occ} as ${than}, with no bookings in either.`
  if (!b.revenue) return `${lead}, ${occ} and revenue is ${eur(a.revenue)}, against none in ${than}.`
  const r = relPct(a.revenue, b.revenue) * 100
  const rev = Math.abs(r) < 0.5 ? 'revenue about the same' : `revenue ${r > 0 ? 'up' : 'down'} ${Math.abs(r).toFixed(1)}%`
  return `${lead}, ${occ} and ${rev} on ${than}.`
}

export function Performance() {
  useSmartDemo()
  const p = useProperty()
  const nav = useNavigate()
  const [q, setQ] = useSearchParams()
  const on = useStore((s) => s.smartListings)
  const setSmart = useStore((s) => s.setSmartListings)
  const history = useStore((s) => !!s.smartHistory)
  const sl3 = useStore((s) => s.sl3)
  const LISTING = useListingChannels()
  const base = `/property/${p.id}`
  // only channels running a strategy (a paused one still has one); "No strategy" channels are left out
  const chans = LISTING.filter((c) => hasStrategy(sl3, c))
  /* scenarioSim() is Neukölln's scripted dataset and ONLY Neukölln's; any other property reads its own generated one. */
  const sim = useMemo(() => (history && isScenarioProperty(p.id) ? scenarioSim() : baselineSim(p.id, chans, PROFILES[p.id]?.guests)), [history, p.id, chans.join()]) // eslint-disable-line react-hooks/exhaustive-deps
  const ready = on && sl3.setupDone
  useEffect(() => { if (ready) syncVersions(chans) }, [ready, chans.join(), sl3.plans]) // eslint-disable-line react-hooks/exhaustive-deps

  const qch = q.get('ch') as ListingChannel | null
  const ch: ListingChannel | null = qch && chans.includes(qch) ? qch : chans[0] ?? null
  const head = <PageHead title="Performance" property={p} desc="How each channel is doing since its strategy started, against the same stretch before it." />

  if (!on || !sl3.setupDone) return (
    <PageFrame head={head}>
      <div>{sl3.setupDone
        ? <SmartOffCard title="Smart Listings is off" cta="Turn on Smart Listings" onStart={() => setSmart(true)} foot="Your strategies are kept as you left them"
            line="Performance shows how each channel is doing since its strategy started. Turn Smart Listings back on to keep measuring." />
        : <SmartOffCard title="Nothing to show yet" cta="Set up Smart Listings" onStart={() => nav(`${base}/smart/wizard?entry=first&from=performance`)}
            line="Once a channel runs a strategy, its results show here, against the same stretch before it started." foot={null} />}</div>
    </PageFrame>
  )
  if (!ch) return (
    <PageFrame head={head}>
      <div><SmartOffCard title="No channel runs a strategy" cta="Go to Strategy" onStart={() => nav(`${base}/smart/strategy`)} foot={null}
        line="Add a strategy to a channel, and its results show here, against the same stretch before it started." /></div>
    </PageFrame>
  )

  const set = (patch: Record<string, string | null>) => setQ((prev) => {
    const n = new URLSearchParams(prev)
    for (const [k, v] of Object.entries(patch)) { if (v === null) n.delete(k); else n.set(k, v) }
    return n
  }, { replace: true })

  /* ---------- the period (A) and the stretch before the strategy (B, the same number of days) ---------- */
  const startIso = strategyStart(sl3, ch)
  const start = Math.max(0, Math.min(SL_DAYS, startIso ? slDayOf(startIso) : SL_DAYS))
  const startLabel = slFmt(start)
  const periods = periodsFor(start)
  const period = periods.find((x) => x.id === q.get('period')) ?? periods[0]
  const A = period.win
  const len = A.to - A.from
  const B: Win = { from: Math.max(0, start - len), to: start }
  const young = SL_DAYS - start < EARLY
  const mA = slMetrics(sim, A.from, A.to, ch)
  const mB = slMetrics(sim, B.from, B.to, ch)

  return (
    <PageFrame head={head}>
      <div className="sl-page">
        <PerfToolbar label="Channel and period">
          <Lens channels={chans} value={ch} all={false} size="lg" label="Channel" onChange={(v) => set({ ch: v, period: null })} />
          <PerfField label="Period">
            <Dropdown label="Period" value={period.id} options={periods.map((x) => ({ value: x.id, label: x.label }))} onChange={(v) => set({ period: v === 'since' ? null : v })} />
          </PerfField>
        </PerfToolbar>

        {young
          ? <p className="sl-headline">The {chName(ch)} strategy started on {startLabel}. Its results show here after its first week.</p>
          : <>
              <SlSection title="Main metrics">
                <p className="sl-headline">{summary(period.id, len, startLabel, mA, mB)}</p>
                <PerfKpis label={`${chName(ch)}, ${period.label.toLowerCase()}`}>
                  {kpis(ch, sim, mA).map((r) => <PerfKpi key={r.label} label={r.label} value={r.value} foot={r.foot} muted={r.muted} />)}
                </PerfKpis>
              </SlSection>

              <SlSection title="How it changed" line={`The ${daysText(B.to - B.from)} before the strategy started in grey, then ${period.id === 'since' ? `${STEP[defaultGrouping(len)]} since` : `the ${period.label.toLowerCase()}, ${GROUPED[defaultGrouping(len)]}`}.`}>
                <div className="sl-perf-charts">
                  {CHARTS.map((c) => <ChartCard key={`${c.id}:${ch}:${period.id}`} spec={c} sim={sim} ch={ch} a={A} b={B} startLabel={startLabel} />)}
                </div>
              </SlSection>
            </>}
      </div>
    </PageFrame>
  )
}

/* ---------- the charts: one card per measure, each with its own chart type and grouping ---------- */
type ChartId = 'occ' | 'revenue' | 'adr' | 'lead'
const CHARTS: Array<{ id: ChartId; title: string; def: (ch: string) => string; fmt: (v: number) => string; max?: number }> = [
  { id: 'occ', title: 'Occupancy', def: (c) => `Share of nights booked through ${c}.`, fmt: pct, max: 1 },
  { id: 'revenue', title: 'Revenue', def: (c) => `What ${c} bookings earned for the nights in each bar, before fees.`, fmt: eur },
  { id: 'adr', title: 'Nightly rate (ADR)', def: () => 'Revenue divided by the nights booked.', fmt: eur },
  { id: 'lead', title: 'Booking lead time', def: () => 'Days between booking and check-in, on average.', fmt: (v) => `${Math.round(v)} days` },
]
/** One window cut into buckets: absolute days [from, to), and the bucket's label. */
interface Bucket { from: number; to: number; label: string }
function bucketsFor(w: Win, g: PerfGrouping): Bucket[] {
  const len = w.to - w.from
  const out: Array<{ o0: number; o1: number }> = []
  if (g === 'month') {
    let o0 = 0
    for (let o = 1; o <= len; o++) if (o === len || slDate(w.from + o).getDate() === 1) { out.push({ o0, o1: o }); o0 = o }
    // a month of only a few days at the end ("1–2 Oct") would read as a drop: it joins the month before
    const last = out[out.length - 1]
    if (out.length > 1 && last.o1 - last.o0 < 4) { out.pop(); out[out.length - 1].o1 = len }
  } else {
    const step = g === 'day' ? 1 : 7
    for (let o = 0; o < len; o += step) out.push({ o0: o, o1: Math.min(len, o + step) })
    // a stub of a few days at the end would read as a drop: it joins the week before
    const last = out[out.length - 1]
    if (g === 'week' && out.length > 1 && last.o1 - last.o0 < 4) { out.pop(); out[out.length - 1].o1 = len }
  }
  return out.map((b) => ({
    from: w.from + b.o0, to: w.from + b.o1,
    label: g === 'month' ? slDate(w.from + b.o0).toLocaleDateString('en-GB', { month: 'short' }) : slFmt(w.from + b.o0),
  }))
}
/** One measure over days [from, to) on one channel. */
function measure(sim: SlSim, ch: ListingChannel, from: number, to: number, id: ChartId): number {
  let nights = 0, rev = 0
  for (let d = Math.max(0, from); d < to && d < sim.own.length; d++) {
    const o = sim.own[d]
    if (!o || o.ch !== ch) continue
    nights++; rev += o.rate
  }
  if (id === 'occ') return nights / Math.max(1, to - from)
  if (id === 'revenue') return rev
  if (id === 'adr') return nights ? rev / nights : 0
  const bk = sim.res.filter((x) => !x.cancelled && x.ch === ch && x.d >= from && x.d < to)
  return bk.length ? bk.reduce((a, x) => a + (x.d - x.booked), 0) / bk.length : 0
}
/** The section line's words for the charts' default grouping (S-1: the copy follows the bars, not "every day"). */
const STEP: Record<PerfGrouping, string> = { day: 'day by day', week: 'week by week', month: 'month by month' }
const GROUPED: Record<PerfGrouping, string> = { day: 'one bar a day', week: 'one bar a week', month: 'one bar a month' }
/** By day up to ~10 days a side, by week up to ~3 months, by month beyond (Antonio: a month or so groups by week). */
const defaultGrouping = (len: number): PerfGrouping => (len <= 10 ? 'day' : len <= 92 ? 'week' : 'month')
const groupingsFor = (len: number): PerfGrouping[] => [...(len <= 92 ? ['day' as const] : []), ...(len >= 8 ? ['week' as const] : []), ...(len >= 45 ? ['month' as const] : [])]

function ChartCard({ spec, sim, ch, a, b, startLabel }: {
  spec: (typeof CHARTS)[number]; sim: SlSim; ch: ListingChannel; a: Win; b: Win; startLabel: string
}) {
  const len = a.to - a.from
  const [kind, setKind] = useState<PerfChartKind>('bar')
  const [pick, setPick] = useState<PerfGrouping | null>(null)
  const groups = groupingsFor(len)
  const group = pick && groups.includes(pick) ? pick : defaultGrouping(len)
  const before = b.to > b.from ? bucketsFor(b, group) : []
  const since = bucketsFor(a, group)
  const all = [...before, ...since]
  const gap = b.to < a.from // a "Last 30 days" period well after the start: the two stretches aren't back to back
  const G = { day: 'By day', week: 'By week', month: 'By month' }[group]
  return (
    <PerfCard className="sl-perf-chart-card"
      meta={<>{gap ? `${range(b.from, b.to, true)} and ${range(a.from, a.to)}` : range(b.from, a.to)}<span aria-hidden="true">·</span>{G}</>}
      actions={<PerfSettings title={spec.title} kind={kind} onKind={setKind} group={group} onGroup={setPick} groups={groups} />}
      title={spec.title} definition={spec.def(chName(ch))}>
      <PerfChart kind={kind} labels={all.map((x) => x.label)} values={all.map((x) => measure(sim, ch, x.from, x.to, spec.id))}
        split={before.length} gap={gap} marker={`Strategy started ${startLabel}`} fmt={spec.fmt} max={spec.max}
        aria={`${spec.title} ${G.toLowerCase()} on ${chName(ch)}: before the strategy started on ${startLabel}, then ${range(a.from, a.to)}`} />
    </PerfCard>
  )
}
