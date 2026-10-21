/* Smart Listings charts (WS-SL, 1 Oct) · hand-written SVG, no chart library. CSS: ds/v3/sl.css › "charts (.slc-)".
 * Method: the dataviz skill. Thin marks (columns ≤ 24px, 4px rounded data-end, square at the baseline; 2px lines;
 * 2px surface gaps between stacked segments; dots ≥ 8px with a 2px surface ring), hairline solid grid, a legend for every
 * chart with two or more series, selective direct labels, text in text tokens (never the series colour), one tooltip per
 * position listing every series (hover and keyboard focus: ← →), and a table view for every chart.
 * Channel colours (validated, all pairs, light surface: worst CVD ΔE 11.8): Airbnb orange-600, Booking.com blue-600,
 * Direct secondary-700, via --slc-* tokens. One axis per chart, always. */
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from './primitives'

export interface ChartKey { key: string; label: string; color: string; kind?: 'rect' | 'line' | 'band' | 'dot' }
export function ChartLegend({ keys }: { keys: ChartKey[] }) {
  return (
    <div className="slc-legend">{keys.map((k) => (
      <span key={k.key} className="slc-legend__key"><i className={`slc-legend__swatch slc-legend__swatch--${k.kind ?? 'rect'}`} style={{ ['--c' as string]: k.color }} />{k.label}</span>
    ))}</div>
  )
}

/** "Show table" under a chart: the chart's table view (every value without hovering). */
export function ChartTable({ caption, head, rows }: { caption: string; head: string[]; rows: Array<Array<ReactNode>> }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="slc-tablewrap">
      <button type="button" className="h-link h-link--neutral slc-tabletoggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? 'Hide table' : 'Show table'}</button>
      {open && (
        <div className="slc-table" id={id}>
          <table className="h-table"><caption className="h-sr-only">{caption}</caption>
            <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** Keyboard + pointer index for one-position-at-a-time charts. */
function useCursor(n: number) {
  const [i, setI] = useState<number | null>(null)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setI((x) => Math.min(n - 1, (x ?? -1) + 1)) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setI((x) => Math.max(0, (x ?? n) - 1)) }
    else if (e.key === 'Escape') setI(null)
  }
  return { i, setI, focusProps: { tabIndex: 0, onKeyDown: onKey, onFocus: () => setI((x) => x ?? n - 1), onBlur: () => setI(null) } }
}
/** Columns: rounded data-end (top), square at the baseline. */
const colPath = (x: number, y: number, w: number, h: number, r: number) => {
  if (h <= 0) return ''
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}
const niceMax = (v: number) => {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const m = [1, 1.2, 2, 4, 6, 8, 10].find((k) => k * p >= v) ?? 10 // quarters stay round (0.3, 0.5, 1, 1.5, 2…)
  return m * p
}

/** The hover tooltip tracks the cursor horizontally but never overflows the chart's own box (Antonio, 1 Oct): measure
 *  the tip's real rendered width against its plot container and clamp its centre, in pixels, so a long tooltip near
 *  either edge slides in rather than spilling past the card. Re-measures on every position/content change. */
function Tip({ x, w, children }: { x: number; w: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const plot = el?.parentElement
    if (!el || !plot) return
    const pw = plot.clientWidth
    const half = el.offsetWidth / 2
    const centerPx = (x / w) * pw
    setLeft(Math.min(pw - half, Math.max(half, centerPx)))
  }, [x, w, children])
  const style: CSSProperties = left === null ? { left: `${(x / w) * 100}%`, visibility: 'hidden' } : { left: `${left}px` }
  return <div ref={ref} className="slc-tip" style={style} role="status">{children}</div>
}
export function TipRow({ color, kind = 'line', label, value }: { color?: string; kind?: 'line' | 'rect'; label: ReactNode; value: ReactNode }) {
  return <div className="slc-tip__row">{color && <i className={`slc-tip__key slc-tip__key--${kind}`} style={{ ['--c' as string]: color }} />}<span className="slc-tip__label">{label}</span><b>{value}</b></div>
}

/* ---------- stacked columns over time, with strategy lanes ---------- */
export interface LaneSeg { from: number; to: number; label: string; title?: string; current?: boolean; before?: boolean }
export interface Lane { key: string; label: string; segs: LaneSeg[] }
export function StackedColumns({ labels, series, values, fmt, line, lanes = [], marker, aria, tip, height = 240, axisEvery, yMax, grouped }: {
  labels: string[]
  series: ChartKey[]
  /** values[i][s] for bucket i, series s */
  values: number[][]
  fmt: (v: number) => string
  /** A reference line (similar homes' median), same unit and axis. */
  line?: { label: string; values: number[]; color?: string }
  lanes?: Lane[]
  marker?: { i: number; label: string }
  aria: string
  /** Extra tooltip rows for bucket i. */
  tip?: (i: number) => ReactNode
  height?: number
  axisEvery?: number
  yMax?: number
  /** Side-by-side columns per series instead of stacked (the Bar option of a two-way comparison: nothing should sum). */
  grouped?: boolean
}) {
  const n = labels.length
  const { i: hi, setI, focusProps } = useCursor(n)
  const W = 760, L = lanes.length ? 88 : 48, R = 12, T = 16, PB = 22, LANE = 22
  const plotB = height - PB
  const H = height + lanes.length * LANE + (lanes.length ? 8 : 0)
  const totals = values.map((v) => v.reduce((a, b) => a + b, 0))
  const max = yMax ?? niceMax(Math.max(...(grouped ? values.flat() : totals), ...(line?.values ?? [0])) * 1.05)
  const step = (W - L - R) / n
  const cw = Math.max(3, Math.min(24, step * 0.66))
  const x = (i: number) => L + step * i + step / 2
  const y = (v: number) => T + (plotB - T) * (1 - v / max)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f)
  const every = axisEvery ?? Math.max(1, Math.ceil(n / 9))
  const laneY = (k: number) => height + 8 + k * LANE
  const gcw = grouped ? Math.max(2, (cw - (series.length - 1) * 2) / series.length) : cw
  return (
    <div className="slc">
      <div className="slc-plot" onMouseLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} {...focusProps} className="slc-svg">
          {ticks.map((t) => <g key={t}><line className="slc-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text className="slc-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
          {labels.map((l, i) => (i % every === 0 || i === n - 1) && (i === n - 1 || n - 1 - i >= every * 0.8) ? <text key={i} className="slc-axis" x={x(i)} y={plotB + 16} textAnchor="middle">{l}</text> : null)}
          {marker && <g><line className="slc-marker" x1={L + step * marker.i} x2={L + step * marker.i} y1={T - 6} y2={plotB} /><text className="slc-marker__label" x={L + step * marker.i + 6} y={T + 4}>{marker.label}</text></g>}
          {grouped ? values.map((v, i) => (
            <g key={i} className={cx('slc-col', hi !== null && hi !== i && 'is-dim')}>
              {v.map((val, s) => val > 0 ? <path key={s} d={colPath(x(i) - cw / 2 + s * (gcw + 2), y(val), gcw, y(0) - y(val), 3)} style={{ fill: series[s].color }} /> : null)}
            </g>
          )) : values.map((v, i) => {
            let acc = 0
            const segs = v.map((val, s) => ({ val, s })).filter((d) => d.val > 0)
            return (
              <g key={i} className={cx('slc-col', hi !== null && hi !== i && 'is-dim')}>
                {segs.map((d, k) => {
                  const y0 = y(acc), y1 = y(acc + d.val)
                  acc += d.val
                  const top = k === segs.length - 1
                  const h = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0)) // 2px surface gap between stacked segments
                  return top
                    ? <path key={d.s} d={colPath(x(i) - cw / 2, y1, cw, h, 4)} style={{ fill: series[d.s].color }} />
                    : <rect key={d.s} x={x(i) - cw / 2} y={y1} width={cw} height={h} style={{ fill: series[d.s].color }} />
                })}
              </g>
            )
          })}
          {line && <path className="slc-refline" style={{ stroke: line.color }} d={line.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')} />}
          {lanes.map((ln, k) => (
            <g key={ln.key} className="slc-lane">
              <text className="slc-lane__name" x={L - 8} y={laneY(k) + 13} textAnchor="end">{ln.label}</text>
              {ln.segs.map((sg) => {
                const x0 = L + step * sg.from + 1, w = step * (sg.to - sg.from + 1) - 2
                const fits = w > sg.label.length * 6.4 + 10
                return (
                  <g key={sg.label + sg.from}>
                    <rect className={cx('slc-lane__seg', sg.current && 'is-current', sg.before && 'is-before')} x={x0} y={laneY(k)} width={Math.max(2, w)} height={18} rx={4}><title>{sg.title ?? sg.label}</title></rect>
                    {fits && <text className={cx('slc-lane__label', sg.current && 'is-current')} x={x0 + 8} y={laneY(k) + 13}>{sg.label}</text>}
                  </g>
                )
              })}
            </g>
          ))}
          {hi !== null && <line className="slc-cross" x1={x(hi)} x2={x(hi)} y1={T} y2={plotB} />}
          {labels.map((_, i) => <rect key={i} x={L + step * i} y={T} width={step} height={H - T} fill="transparent" onMouseEnter={() => setI(i)} />)}
        </svg>
        {hi !== null && (
          <Tip x={x(hi)} w={W}>
            <b className="slc-tip__title">{labels[hi]}</b>
            {series.map((s, k) => values[hi][k] > 0 ? <TipRow key={s.key} color={s.color} kind="rect" label={s.label} value={fmt(values[hi][k])} /> : null)}
            {!grouped && series.length > 1 && <TipRow label="Total" value={fmt(totals[hi])} />}
            {line && <TipRow color={line.color} label={line.label} value={fmt(line.values[hi])} />}
            {tip?.(hi)}
          </Tip>
        )}
      </div>
    </div>
  )
}

/* ---------- lines over time (the Line view of an evolution chart: one line per series, not stacked) ---------- */

/* ---------- percentile band over time (similar homes) with this home's line ---------- */
export function BandChart({ labels, p25, p50, p75, you, fmt, yMin = 0, yMax, highlight, marker, aria, youLabel = 'This home', tip, height = 200 }: {
  labels: string[]; p25: number[]; p50: number[]; p75: number[]; you: number[]
  fmt: (v: number) => string; yMin?: number; yMax?: number
  highlight?: { from: number; to: number; label: string }
  marker?: { i: number; label: string }
  aria: string; youLabel?: string; tip?: (i: number) => ReactNode; height?: number
}) {
  const n = labels.length
  const { i: hi, setI, focusProps } = useCursor(n)
  const W = 420, L = 40, R = 48, T = 14, B = 24
  const max = yMax ?? niceMax(Math.max(...p75, ...you) * 1.08)
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, n - 1)
  const y = (v: number) => T + (height - T - B) * (1 - (v - yMin) / (max - yMin))
  const ticks = [0, 0.5, 1].map((f) => yMin + (max - yMin) * f)
  const path = (vs: number[]) => vs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const area = `${path(p75)}${p25.map((_, i) => `L${x(n - 1 - i).toFixed(1)},${y(p25[n - 1 - i]).toFixed(1)}`).join('')}Z`
  const every = Math.max(1, Math.ceil(n / 4))
  const step = (W - L - R) / Math.max(1, n - 1)
  return (
    <div className="slc">
      <div className="slc-plot" onMouseLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={aria} {...focusProps} className="slc-svg">
          {highlight && <rect className="slc-highlight" x={x(highlight.from) - step / 2} y={T} width={x(highlight.to) - x(highlight.from) + step} height={height - T - B} />}
          {ticks.map((t) => <g key={t}><line className="slc-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text className="slc-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
          {labels.map((l, i) => (i % every === 0 && n - 1 - i >= every * 0.8) || i === n - 1 ? <text key={i} className="slc-axis" x={x(i)} y={height - 6} textAnchor="middle">{l}</text> : null)}
          {marker && <line className="slc-marker" x1={x(marker.i)} x2={x(marker.i)} y1={T} y2={height - B} />}
          <path className="slc-band" d={area} />
          <path className="slc-median" d={path(p50)} />
          <path className="slc-you" d={path(you)} />
          <circle className="slc-dot" cx={x(n - 1)} cy={y(you[n - 1])} r={4} />
          <text className="slc-endlabel" x={x(n - 1) + 8} y={y(you[n - 1]) + 4}>{fmt(you[n - 1])}</text>
          {hi !== null && <><line className="slc-cross" x1={x(hi)} x2={x(hi)} y1={T} y2={height - B} /><circle className="slc-dot" cx={x(hi)} cy={y(you[hi])} r={4} /></>}
          {labels.map((_, i) => <rect key={i} x={x(i) - step / 2} y={T} width={step} height={height - T - B} fill="transparent" onMouseEnter={() => setI(i)} />)}
        </svg>
        {hi !== null && (
          <Tip x={x(hi)} w={W}>
            <b className="slc-tip__title">{labels[hi]}</b>
            <TipRow color="var(--slc-ink)" label={youLabel} value={fmt(you[hi])} />
            <TipRow color="var(--slc-median)" label="Similar homes, median" value={fmt(p50[hi])} />
            <TipRow label="Middle half of similar homes" value={`${fmt(p25[hi])}–${fmt(p75[hi])}`} />
            {tip?.(hi)}
          </Tip>
        )}
      </div>
      <ChartLegend keys={[{ key: 'you', label: youLabel, color: 'var(--slc-ink)', kind: 'line' }, { key: 'med', label: 'Similar homes, median', color: 'var(--slc-median)', kind: 'line' }, { key: 'band', label: 'Middle half of similar homes', color: 'var(--slc-band)', kind: 'band' }]} />
    </div>
  )
}

/* ---------- grouped columns (this period vs the one before) ---------- */
export function GroupedColumns({ categories, series, values, fmt, aria, height = 190, yMax, tip }: {
  categories: string[]; series: ChartKey[]; values: number[][]; fmt: (v: number) => string; aria: string; height?: number; yMax?: number
  tip?: (i: number) => ReactNode
}) {
  const n = categories.length
  const { i: hi, setI, focusProps } = useCursor(n)
  const W = 420, L = 36, R = 8, T = 18, B = 24
  const max = yMax ?? niceMax(Math.max(...values.flat()) * 1.1)
  const step = (W - L - R) / n
  const cw = Math.min(20, (step - 10) / series.length - 2)
  const x = (i: number, s: number) => L + step * i + step / 2 - (series.length * (cw + 2)) / 2 + s * (cw + 2) + 1
  const y = (v: number) => T + (height - T - B) * (1 - v / max)
  const ticks = [0, 0.5, 1].map((f) => max * f)
  return (
    <div className="slc">
      <div className="slc-plot" onMouseLeave={() => setI(null)}>
        <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={aria} {...focusProps} className="slc-svg">
          {ticks.map((t) => <g key={t}><line className="slc-grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text className="slc-axis" x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
          {categories.map((c, i) => <text key={c} className="slc-axis" x={L + step * i + step / 2} y={height - 6} textAnchor="middle">{c}</text>)}
          {values.map((v, i) => (
            <g key={i} className={cx('slc-col', hi !== null && hi !== i && 'is-dim')}>
              {v.map((val, s) => <path key={s} d={colPath(x(i, s), y(val), cw, y(0) - y(val), 4)} style={{ fill: series[s].color }} />)}
            </g>
          ))}
          {/* direct label: the current series' highest value only (selective labels) */}
          {(() => { const v0 = values.map((v) => v[0]); const k = v0.indexOf(Math.max(...v0)); return v0[k] > 0 ? <text className="slc-endlabel" x={x(k, 0) + cw / 2} y={y(v0[k]) - 6} textAnchor="middle">{fmt(v0[k])}</text> : null })()}
          {categories.map((_, i) => <rect key={i} x={L + step * i} y={T} width={step} height={height - T - B} fill="transparent" onMouseEnter={() => setI(i)} />)}
        </svg>
        {hi !== null && (
          <Tip x={L + step * hi + step / 2} w={W}>
            <b className="slc-tip__title">{categories[hi]}</b>
            {series.map((s, k) => <TipRow key={s.key} color={s.color} kind="rect" label={s.label} value={fmt(values[hi][k])} />)}
            {tip?.(hi)}
          </Tip>
        )}
      </div>
      <ChartLegend keys={series} />
    </div>
  )
}

/* ---------- small multiples: one metric, one bar per strategy version ---------- */
export interface BarRow { key: string; label: ReactNode; value: number; display: string; tone: 'current' | 'past' | 'estimate'; color?: string; title?: string }
export function BarMultiple({ title, rows, max }: { title: string; rows: BarRow[]; max?: number }) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1e-6)
  return (
    <figure className="slc-multi">
      <figcaption className="slc-multi__title">{title}</figcaption>
      <ul className="slc-multi__rows">{rows.map((r) => (
        <li key={r.key} className="slc-multi__row" title={r.title}>
          <span className="slc-multi__label">{r.label}</span>
          <span className="slc-multi__track"><span className={cx('slc-multi__bar', `is-${r.tone}`)} style={{ width: `${Math.max(1.5, (r.value / m) * 100)}%`, ['--c' as string]: r.color }} /></span>
          <span className="slc-multi__value">{r.display}</span>
        </li>
      ))}</ul>
    </figure>
  )
}
