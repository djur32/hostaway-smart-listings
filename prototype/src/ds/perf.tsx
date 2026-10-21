/* Smart Listings › Performance (WS-SL, 3 Oct). Card styling from Hostaway's Metrics, research/current-state/
 * review-2026-10-03-metrics/: 08 equal-height bordered filter controls, 07 the widget card (a meta row
 * with small settings buttons, a divider, title + one-line definition, then the chart), 01/05/06 bars with rounded tops,
 * grey axis labels and light gridlines. CSS: ds/v3/perf.css (tokens only).
 * 3 Oct, later (review, overriding earlier rounds): no comparison mode and no versions. Cards carry no series colours
 * and no "vs" values. Charts carry exactly two series on one timeline: the stretch BEFORE the strategy started (neutral
 * grey, dashed when drawn as a line) and the period since (the brand colour), with a marker where the strategy started.
 *   PerfToolbar   the controls row: the channel on the left, the labelled period control flush right, one height
 *   PerfField     a control with its own small label on its left ("Period")
 *   PerfKpis / PerfKpi   condensed KPI cards (label · value · one quiet line), equal heights
 *   PerfSwatch    a series' colour key (Since strategy / Before)
 *   PerfCard      Metrics widget card: meta row (+ actions) and divider, title 18/600, a one-line definition, the body
 *   PerfSettings  a card's settings: chart type (Bar / Line) and grouping (day / week / month)
 *   PerfChart     bars or a line over Before + Since; zero is drawn as zero; the tooltip stays INSIDE the plot (ref 00) */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, Segmented } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export function PerfToolbar({ children, label = 'Filters' }: { children: ReactNode; label?: string }) {
  return <div className="sl-perf-bar" role="group" aria-label={label}>{children}</div>
}
/** A control with its own small label to its left, on the control's line (review, 3 Oct: "the period needs a title"). */
export function PerfField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="sl-perf-field"><span className="sl-perf-field__label" aria-hidden="true">{label}</span>{children}</div>
}

/** The colour key of a series: the brand colour for the period since the strategy started, grey for before it. */
export function PerfSwatch({ before }: { before?: boolean }) {
  return <i className={cx('sl-perf-swatch', before && 'is-before')} aria-hidden="true" />
}

export function PerfKpis({ children, label }: { children: ReactNode; label: string }) {
  return <div className="sl-perf-kpis" role="list" aria-label={label}>{children}</div>
}
/** A condensed KPI: label, the value, one quiet line of context ("Similar homes 63%"). Nothing else. */
export function PerfKpi({ label, value, foot, muted }: { label: string; value: string; foot?: ReactNode; muted?: boolean }) {
  return (
    <div className={cx('sl-perf-kpi', muted && 'is-muted')} role="listitem">
      <span className="sl-perf-kpi__label">{label}</span>
      <span className="sl-perf-kpi__value">{value}</span>
      {foot && <span className="sl-perf-kpi__foot">{foot}</span>}
    </div>
  )
}

export function PerfCard({ meta, actions, title, definition, children, className }: {
  meta?: ReactNode; actions?: ReactNode; title: ReactNode; definition?: ReactNode; children: ReactNode; className?: string
}) {
  return (
    <section className={cx('sl-perf-card', className)}>
      {(meta || actions) && <div className="sl-perf-card__meta"><span className="sl-perf-card__metatext">{meta}</span>{actions && <span className="sl-perf-card__actions">{actions}</span>}</div>}
      <div className="sl-perf-card__body">
        <div className="sl-perf-card__titles"><h3 className="sl-perf-card__title">{title}</h3>{definition && <p className="sl-perf-card__def">{definition}</p>}</div>
        {children}
      </div>
    </section>
  )
}

export type PerfChartKind = 'bar' | 'line'
export type PerfGrouping = 'day' | 'week' | 'month'
/** A card's settings (ref 07's filter button): chart type and grouping, in a small popover. */
export function PerfSettings({ title, kind, onKind, group, onGroup, groups }: {
  title: string; kind: PerfChartKind; onKind: (k: PerfChartKind) => void; group: PerfGrouping; onGroup: (g: PerfGrouping) => void; groups: PerfGrouping[]
}) {
  const [open, setOpen] = useState(false)
  const phone = useIsMobile()
  const wrap = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open || phone) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open, phone])
  const G: Record<PerfGrouping, string> = { day: 'By day', week: 'By week', month: 'By month' }
  return (
    <span className="sl-perf-settings" ref={wrap}>
      <button type="button" className={cx('h-btn-icon sl-perf-settings__btn', open && 'is-open')} aria-label={`${title} chart settings`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="adjustments-horizontal" />
      </button>
      {open && phone && (
        <BottomSheet open title={`${title} chart`} onClose={() => setOpen(false)} className="sl-perf-sheet">
          <div className="sl-perf-sheet__grid">
            <span className="sl-perf-settings__label">Chart</span>
            <Segmented label="Chart type" value={kind} onChange={onKind} items={[{ id: 'bar', label: 'Bar' }, { id: 'line', label: 'Line' }]} />
            <span className="sl-perf-settings__label">Group</span>
            <Segmented label="Grouping" value={group} onChange={onGroup} items={groups.map((g) => ({ id: g, label: G[g] }))} />
          </div>
        </BottomSheet>
      )}
      {open && !phone && (
        <div className="sl-perf-settings__pop" role="dialog" aria-label={`${title} chart settings`}>
          <span className="sl-perf-settings__label">Chart</span>
          <Segmented label="Chart type" value={kind} onChange={onKind} items={[{ id: 'bar', label: 'Bar' }, { id: 'line', label: 'Line' }]} />
          <span className="sl-perf-settings__label">Group</span>
          <Segmented label="Grouping" value={group} onChange={onGroup} items={groups.map((g) => ({ id: g, label: G[g] }))} />
        </div>
      )}
    </span>
  )
}

/** One timeline: the first `split` buckets are the stretch before the strategy started (grey; a dashed line), the rest
 *  the selected period since (brand colour). `marker` labels the boundary ("Strategy started 12 Sep"); `gap` says the two
 *  stretches aren't back to back (a "Last 30 days" period well after the start), so the line doesn't join them. Zero is
 *  drawn as nothing at all, never a sliver. The tooltip lives inside the plot and is clamped to it. */
export function PerfChart({ kind = 'bar', labels, values, split, gap, marker, beforeName = 'Before', afterName = 'Since strategy', fmt, max, aria }: {
  kind?: PerfChartKind; labels: string[]; values: number[]; split: number; gap?: boolean; marker?: string
  beforeName?: string; afterName?: string; fmt: (v: number) => string; max?: number; aria: string
}) {
  const [hi, setHi] = useState<number | null>(null)
  const top = niceMax(max ?? Math.max(1e-9, ...values))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top)
  const n = labels.length
  const pc = (v: number) => Math.max(0, Math.min(1, v / top)) * 100
  // the tooltip is centred on its column, then clamped to the plot's edges (measured, so a wide tooltip never spills out)
  const plotRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [tipLeft, setTipLeft] = useState(0)
  useLayoutEffect(() => {
    if (hi === null || !plotRef.current || !tipRef.current) return
    const pw = plotRef.current.clientWidth, tw = tipRef.current.offsetWidth
    setTipLeft(Math.max(0, Math.min(pw - tw, ((hi + 0.5) / n) * pw - tw / 2)))
  }, [hi, n])
  // a card is ~400px wide: five labels at most, counted from the strategy's start so its first day is always labelled.
  // Phones (mobile pass, 3 Oct): a column is never narrower than 8px; a longer timeline (By day) scrolls sideways inside
  // the card with the y axis pinned, opens on the latest days, and gets one label per ~64px instead of five in all.
  const mobile = useIsMobile()
  const every = Math.max(1, Math.ceil(n / (mobile ? Math.max(5, Math.floor((n * 8) / 64)) : 5)))
  // more columns than a phone-width card fits at 8px each (By day): this chart scrolls sideways on phones (CSS)
  const dense = n > 28
  const scrollRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (mobile && dense && el) el.scrollLeft = el.scrollWidth
  }, [mobile, dense])
  // a split late in the timeline puts the marker's label on the rule's left on phones (CSS), so it never runs off the card
  const late = split / n > 0.5
  const x = (i: number) => ((i + 0.5) / n) * 100
  const path = (from: number, to: number) => values.slice(from, to).map((y, k) => `${k ? 'L' : 'M'}${x(from + k)},${100 - pc(y)}`).join(' ')
  const isBefore = (i: number) => i < split
  return (
    <figure className={cx('sl-perf-chart', `is-${kind}`, late && 'is-late', dense && 'is-dense')} aria-label={aria} style={{ ['--perf-n' as string]: n }}>
      <div className="sl-perf-chart__scroll" ref={scrollRef}>
      <div className="sl-perf-chart__frame">
        <div className="sl-perf-chart__y" aria-hidden="true">
          {ticks.map((t) => <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>{fmt(t)}</span>)}
        </div>
        <div className="sl-perf-chart__plot" ref={plotRef} onMouseLeave={() => setHi(null)}>
          {ticks.map((t) => <i key={t} className="sl-perf-chart__grid" style={{ bottom: `${(t / top) * 100}%` }} aria-hidden="true" />)}
          {split > 0 && split < n && (
            <div className={cx('sl-perf-chart__marker', gap && 'is-gap')} style={{ left: `${(split / n) * 100}%` }} aria-hidden="true">
              {marker && <span className="sl-perf-chart__markerlabel">{marker}</span>}
            </div>
          )}
          {kind === 'line' && (
            <svg className="sl-perf-chart__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {split > 0 && <path className="sl-perf-chart__line is-before" d={path(0, split)} />}
              {split < n && <path className="sl-perf-chart__line" d={path(gap || split === 0 ? split : split - 1, n)} />}
            </svg>
          )}
          <div className="sl-perf-chart__groups">
            {labels.map((l, i) => (
              <div key={`${l}-${i}`} className="sl-perf-chart__group" tabIndex={0} role="img"
                aria-label={`${l}, ${isBefore(i) ? beforeName.toLowerCase() : afterName.toLowerCase()}: ${fmt(values[i])}`}
                onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(null)}>
                {kind === 'bar'
                  ? <span className={cx('sl-perf-chart__bar', isBefore(i) && 'is-before')} style={{ height: `${pc(values[i])}%` }} />
                  : <span className={cx('sl-perf-chart__dot', isBefore(i) && 'is-before')} style={{ bottom: `${pc(values[i])}%` }} />}
              </div>
            ))}
          </div>
          {hi !== null && (
            <div className="sl-perf-chart__tip" ref={tipRef} style={{ left: tipLeft }} role="presentation">
              <b>{labels[hi]}</b>
              <span className="sl-perf-chart__tiprow"><PerfSwatch before={isBefore(hi)} />{isBefore(hi) ? beforeName : afterName}<em>{fmt(values[hi])}</em></span>
            </div>
          )}
        </div>
      </div>
      <div className="sl-perf-chart__x" aria-hidden="true">{labels.map((l, i) => <span key={`${l}-${i}`}>{(((i - split) % every) + every) % every === 0 ? l : ''}</span>)}</div>
      </div>
      <figcaption className="sl-perf-legend">
        {split > 0 && <span><PerfSwatch before />{beforeName}</span>}
        <span><PerfSwatch />{afterName}</span>
      </figcaption>
    </figure>
  )
}
function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 1.2, 2, 4, 6, 8, 10]) if (m * p >= v) return m * p // each divides into four round ticks
  return 10 * p
}
