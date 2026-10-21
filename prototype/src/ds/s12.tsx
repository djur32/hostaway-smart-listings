/* S12 DS ports (ds/components.css §10e, D-150…D-159): persona guidance, inheritance, the return chip, channel strength,
 * the Early access frame, a time-series chart with version markers, data availability, test confidence.
 * Shared: change only with a SESSION-LOG note (prototype/README.md ownership map). */
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CHANNELS } from '../data/channels'
import { MODES, PERSONAS } from '../data/personas'
import type { Avail } from '../data/performance'
import type { ChannelId } from '../data/types'
import { useStore } from '../store/store'
import { Icon } from './primitives'

/* ---------------- Persona modes (D-150) ---------------- */

/** The active mode: persona defaults, then the host's own changes in Settings. Guidance levels: more · fewer · none. */
export function useMode() {
  const persona = useStore((s) => s.persona)
  const o = useStore((s) => s.modeOverrides)
  const d = PERSONAS[persona]
  const spec = MODES[persona]
  return {
    persona, spec, defaults: d,
    hints: o.hints ?? spec.hints,
    density: o.density ?? spec.density,
    landing: o.landing ?? d.landing,
    plain: persona === 'P4',
  }
}

/** One wrapper for persona-dependent guidance. `more` shows the card; `fewer` shows `line` if given; `none` shows nothing.
 * Guidance never gates a capability (D-150): the thing it explains is on the page either way. */
export function Guide({ id, title, children, line, icon = 'bulb' }: { id: string; title: string; children: ReactNode; line?: ReactNode; icon?: string }) {
  const m = useMode()
  const dismissed = useStore((s) => s.guideDismissed.includes(id))
  const dismiss = useStore((s) => s.dismissGuide)
  const [why, setWhy] = useState(false)
  if (m.hints === 'none' || dismissed) return null
  if (m.hints === 'fewer') return line ? <div className="h-guide h-guide--line"><Icon name="info-circle" />{line}</div> : null
  return (
    <div className="h-guide" role="note">
      <Icon name={icon} />
      <div>
        <div className="h-guide__title">{title}</div>
        <div className="h-guide__body">{children}</div>
        <div className="h-guide__foot">
          <button onClick={() => dismiss(id)}>Got it</button>
          <button onClick={() => setWhy(!why)}>{why ? 'Hide' : 'Why am I seeing this?'}</button>
        </div>
        {why && <div className="h-guide__body" style={{ marginTop: 6 }}>You’re seeing more explanations because you’re new to managing listings in Hospitable. Change it in <Link to="/settings/guidance" style={{ color: 'inherit' }}>Settings › How Hospitable helps you</Link>.</div>}
      </div>
    </div>
  )
}

const GLOSSARY: Record<string, string> = {
  channel: 'A booking site where your home is listed: Airbnb, Booking.com, Vrbo, or your own site.',
  push: 'Send your changes to the booking sites. Nothing changes there until you do.',
  version: 'A saved copy of your listing as it was at one moment. You can always go back to one.',
  override: 'This home uses its own value instead of the one shared by all your homes.',
  markup: 'A percentage added to your price on one booking site, usually to cover its commission.',
}
/** A term explained once for P4 (dotted underline + tooltip); plain text for everyone else. */
export function Term({ k, children }: { k: keyof typeof GLOSSARY; children: ReactNode }) {
  const m = useMode()
  return m.plain ? <span className="h-term" title={GLOSSARY[k]} tabIndex={0}>{children}</span> : <>{children}</>
}

/* ---------------- Inheritance (D-154) ---------------- */

export function InheritChip({ level, from, fromValue, channel, onOverride, onReset }: {
  level: 'group' | 'property' | 'channel'; from?: string; fromValue?: ReactNode; channel?: ChannelId; onOverride?: () => void; onReset?: () => void
}) {
  return (
    <span className={`h-inherit h-inherit--${level}`}>
      <span className="h-inherit__dot" aria-hidden="true" />
      {level === 'group' && <>Inherited from <b>{from}</b>{onOverride && <> · <button className="h-inherit__act" onClick={onOverride}>Override</button></>}</>}
      {level === 'property' && <>This property{fromValue !== undefined && <> · {from}: {fromValue}</>}{onReset && <> · <button className="h-inherit__act" onClick={onReset}>Reset to {from}</button></>}</>}
      {level === 'channel' && <>{channel ? CHANNELS[channel].name : 'This channel'} only{onReset && <> · <button className="h-inherit__act" onClick={onReset}>Use the property’s</button></>}</>}
    </span>
  )
}

/* ---------------- Return chip (R-073, D-158) ---------------- */

export function ReturnChip({ to, name, where }: { to: string; name: string; where?: string }) {
  return (
    <Link className="h-return" to={to} aria-label={`Back to ${name}${where ? ` · ${where}` : ''}`}>
      <Icon name="arrow-left" /><span className="h-return__thumb" />{name}{where && <span className="h-return__where">· {where}</span>}
    </Link>
  )
}

/* ---------------- Strength, early access ---------------- */

export function Strength({ channel, value, title, bar = true }: { channel: ChannelId; value: number; title?: string; bar?: boolean }) {
  const k = value >= 75 ? '' : value >= 62 ? ' is-mid' : ' is-low'
  return (
    <span className={`h-strength${k}`} title={title ?? `${CHANNELS[channel].name}: ${channel === 'booking' ? 'Page Score' : 'strength (our estimate)'} ${value}`}>
      <span className={`h-ch h-ch--${CHANNELS[channel].letter}`}>{CHANNELS[channel].name[0]}</span>
      {bar && <span className="h-strength__bar"><i style={{ ['--value' as string]: `${value}%` }} /></span>}{value}
    </span>
  )
}

export function Early({ children = 'Early access' }: { children?: ReactNode }) {
  return <span className="h-early"><Icon name="rocket" />{children}</span>
}

export function AvailCell({ a, why }: { a: Avail; why: string }) {
  const icon = a === 'yes' ? 'circle-check' : a === 'proxy' ? 'adjustments-horizontal' : a === 'n/a' ? 'circle-dashed' : 'x'
  const label = a === 'yes' ? 'Yes' : a === 'proxy' ? 'Estimated' : a === 'n/a' ? '—' : 'Not shared'
  return <span className={`h-avail h-avail--${a === 'n/a' ? 'no' : a}`} title={why}><Icon name={icon} />{label}</span>
}

/* ---------------- Time-series chart (D-156) ---------------- */

export interface ChartSeries { key: string; label: string; values: Array<number | null>; tone: 1 | 2 | 3 }
export function LineChart({ labels, series, comps, markers = [], bands = [], fmt = (v) => String(v), height = 220, yMax }: {
  labels: string[]; series: ChartSeries[]; comps?: { label: string; values: number[] }
  markers?: Array<{ i: number; label: string }>
  /** Shaded spans, e.g. which version was live (switchback weeks). */
  bands?: Array<{ from: number; to: number; tone: 1 | 2 | 3 }>
  fmt?: (v: number) => string; height?: number; yMax?: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 720, H = height, L = 40, R = 12, T = 22, B = 26
  const all = [...series.flatMap((s) => s.values.filter((v): v is number => v !== null)), ...(comps?.values ?? [])]
  const max = yMax ?? Math.max(1, Math.ceil((Math.max(...all) * 1.15) / 5) * 5)
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, labels.length - 1)
  const y = (v: number) => T + (H - T - B) * (1 - v / max)
  const path = (vals: Array<number | null>) => vals.map((v, i) => (v === null ? '' : `${i === 0 || vals[i - 1] === null ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join('')
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))
  const step = (W - L - R) / Math.max(1, labels.length - 1)
  return (
    <div className="h-chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${series.map((s) => s.label).join(', ')} over ${labels.length} weeks`}>
        {bands.map((b, k) => <rect key={k} className={`h-chart__band h-chart__band--${b.tone}`} x={x(b.from) - step / 2} y={T} width={step * (b.to - b.from + 1)} height={H - T - B} />)}
        {ticks.map((t) => (
          <g key={t}><line className="h-chart__grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text className="h-chart__axis" x={L - 8} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>
        ))}
        {labels.map((l, i) => (i % 2 === 0 ? <text key={i} className="h-chart__axis" x={x(i)} y={H - 6} textAnchor="middle">{l}</text> : null))}
        {comps && <path className="h-chart__comps" d={path(comps.values)} />}
        {markers.map((m) => (
          <g key={m.i + m.label}>
            <line className="h-chart__marker" x1={x(m.i)} x2={x(m.i)} y1={T - 4} y2={H - B} />
            <rect className="h-chart__marker-bg" x={x(m.i) - 12} y={2} width={24} height={16} rx={4} />
            <text className="h-chart__marker-label" x={x(m.i)} y={14} textAnchor="middle">{m.label}</text>
          </g>
        ))}
        {series.map((s) => <path key={s.key} className={`h-chart__line h-chart__line--${s.tone}`} d={path(s.values)} />)}
        {hover !== null && (
          <g>
            <line className="h-chart__cross" x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} />
            {series.map((s) => s.values[hover] !== null && (
              <circle key={s.key} className={`h-chart__dot`} cx={x(hover)} cy={y(s.values[hover] as number)} r={4} style={{ fill: `var(--color-chart-${s.tone})` }} />
            ))}
          </g>
        )}
        {labels.map((_, i) => (
          <rect key={i} x={x(i) - step / 2} y={T} width={step} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1} />
        ))}
      </svg>
      {hover !== null && (
        <div className="h-chart__tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(T / H) * 100}%` }}>
          <b>Week of {labels[hover]}</b>
          {series.map((s) => <div key={s.key}>{s.label}: <b>{s.values[hover] === null ? '—' : fmt(s.values[hover] as number)}</b></div>)}
          {comps && <div>{comps.label}: <b>{fmt(comps.values[hover])}</b></div>}
          {markers.filter((m) => m.i === hover).map((m) => <div key={m.label}>{m.label} went live</div>)}
        </div>
      )}
      <div className="h-chart__legend">
        {series.map((s) => <span key={s.key} className="h-chart__key"><i style={{ background: `var(--color-chart-${s.tone})` }} />{s.label}</span>)}
        {comps && <span className="h-chart__key h-chart__key--comps"><i />{comps.label}</span>}
        {markers.length > 0 && <span className="h-chart__key h-chart__key--marker"><i />A new version went live</span>}
      </div>
    </div>
  )
}

/** How sure we are, against the bar set before the test started (D-157). */
export function Confidence({ p, bar = 0.9, met }: { p: number; bar?: number; met: boolean }) {
  return (
    <div className={`h-certainty${met ? ' is-met' : ''}`} role="meter" aria-valuemin={50} aria-valuemax={100} aria-valuenow={Math.round(p * 100)} aria-label="Confidence">
      <div className="h-certainty__fill" style={{ ['--value' as string]: `${Math.round(((p - 0.5) / 0.5) * 100)}%` }} />
      <div className="h-certainty__bar" data-label={`Decide at ${Math.round(bar * 100)}%`} style={{ ['--bar' as string]: `${((bar - 0.5) / 0.5) * 100}%` }} />
    </div>
  )
}
