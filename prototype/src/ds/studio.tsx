/* Angle B studio patterns (S11, D-148): grounded sentence (h-cite), reorder list (h-reorder), market band (h-band),
 * autonomy control (h-autonomy, ds/ai-patterns.md §4). CSS lives in ds/components.css §10d / §10, never copied here. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useIsMobile } from './mobile'
import { TipSheet } from './tooltipSheet'
import type { Autonomy } from '../data/types'
import { Icon } from './primitives'

/** A sentence that cites the facts it uses (D-141). Click selects it (smart editing); hover/focus shows its sources. */
export function Cite({ children, facts, selected, changed, onSelect }: {
  children: ReactNode
  /** Rendered rows: label, value, source chip. */
  facts: Array<{ id: string; label: ReactNode; value: ReactNode; source?: ReactNode }>
  selected?: boolean
  changed?: boolean
  onSelect?: () => void
}) {
  const [open, setOpen] = useState(false)
  const mobile = useIsMobile()
  const root = useRef<HTMLSpanElement>(null)
  // phones: a tap selects the sentence as before and opens its facts in the shared bottom sheet (no hover, no floating card)
  if (mobile) return (
    <span ref={root}
      className={`h-cite${selected ? ' is-selected' : ''}${changed ? ' is-changed' : ''}${open ? ' is-active' : ''}`}
      tabIndex={0} role="button" aria-pressed={!!selected} aria-haspopup="dialog"
      onClick={(e) => { if (!e.currentTarget.contains(e.target as Node)) return; onSelect?.(); if (facts.length) setOpen(true) }}>
      {children}<span className="h-cite__n" aria-hidden="true">{facts.length}</span>
      <TipSheet open={open} title={`Written from ${facts.length} fact${facts.length === 1 ? '' : 's'} in your home`} onClose={() => setOpen(false)} host={root}>
        {facts.map((f) => <span key={f.id} className="h-cite__fact"><span><b>{f.label}</b> · {f.value}</span>{f.source}</span>)}
      </TipSheet>
      {' '}
    </span>
  )
  return (
    <span
      className={`h-cite${selected ? ' is-selected' : ''}${changed ? ' is-changed' : ''}${open ? ' is-active' : ''}`}
      tabIndex={0} role="button" aria-pressed={!!selected}
      title={`Uses ${facts.length} fact${facts.length === 1 ? '' : 's'} from your home. Click to edit.`}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onClick={onSelect} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.() } }}
    >
      {children}<span className="h-cite__n" aria-hidden="true">{facts.length}</span>
      {open && facts.length > 0 && (
        <span className="h-cite__pop" role="tooltip">
          <span className="h-cite__head"><Icon name="sparkles" />Written from {facts.length} fact{facts.length === 1 ? '' : 's'} in your home</span>
          {facts.map((f) => (
            <span key={f.id} className="h-cite__fact"><span><b>{f.label}</b> · {f.value}</span>{f.source}</span>
          ))}
        </span>
      )}
      {' '}
    </span>
  )
}

/** Reorder with drag or with the move buttons (keyboard alternative, motion.md M-06). `fold` = how many guests see first. */
export function ReorderList<T extends { id: string }>({ items, render, onChange, fold, foldLabel, label }: {
  items: T[]; render: (item: T) => ReactNode; onChange: (ids: string[]) => void; fold?: number; foldLabel?: string; label: string
}) {
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [moved, setMoved] = useState<string | null>(null)
  const ids = items.map((i) => i.id)
  const move = (id: string, to: number) => {
    const from = ids.indexOf(id)
    if (from < 0 || to < 0 || to >= ids.length || from === to) return
    const next = ids.slice(); next.splice(from, 1); next.splice(to, 0, id)
    onChange(next); setMoved(id)
  }
  useEffect(() => { if (!moved) return; const t = setTimeout(() => setMoved(null), 900); return () => clearTimeout(t) }, [moved])
  return (
    <ol className="h-reorder" aria-label={label}>
      {items.map((item, i) => (
        <li key={item.id}>
          {fold !== undefined && i === fold && <div className="h-reorder__fold">{foldLabel ?? `Guests see the first ${fold}`}</div>}
          <div
            className={`h-reorder__item${drag === item.id ? ' is-dragging h-drag-lift' : ''}${over === item.id && drag !== item.id ? ' is-over' : ''}${moved === item.id ? ' is-moved' : ''}${fold !== undefined && i >= fold ? ' is-folded' : ''}`}
            draggable onDragStart={() => setDrag(item.id)} onDragEnd={() => { setDrag(null); setOver(null) }}
            onDragOver={(e) => { e.preventDefault(); setOver(item.id) }}
            onDrop={(e) => { e.preventDefault(); if (drag) move(drag, i); setDrag(null); setOver(null) }}
          >
            <span aria-hidden="true"><Icon name="grip-vertical" className="h-reorder__grip" /></span>
            <span className="h-reorder__pos">{i + 1}</span>
            <span className="h-reorder__label">{render(item)}</span>
            <span className="h-reorder__moves">
              <button className="h-btn-icon" aria-label={`Move up (now ${i + 1})`} disabled={i === 0} onClick={() => move(item.id, i - 1)}><Icon name="chevron-up" size={16} /></button>
              <button className="h-btn-icon" aria-label={`Move down (now ${i + 1})`} disabled={i === items.length - 1} onClick={() => move(item.id, i + 1)}><Icon name="chevron-down" size={16} /></button>
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Where this listing sits against its comps (R-113). Values in the metric's unit; `format` renders the tag. */
export function Band({ min, max, median, you, from, to, format = String, label }: {
  min: number; max: number; median: number; you: number; from: number; to: number; format?: (n: number) => string; label: string
}) {
  const lo = Math.min(min, you), hi = Math.max(max, you)
  const pct = (n: number) => `${((n - lo) / (hi - lo || 1)) * 100}%`
  const style = { '--from': pct(from), '--to': pct(to), '--median': pct(median), '--at': pct(you) } as CSSProperties
  return (
    <div role="img" aria-label={`${label}: you ${format(you)}; comps ${format(from)}–${format(to)}, median ${format(median)}`}>
      <div className="h-band" style={style}>
        <span className="h-band__track" /><span className="h-band__range" /><span className="h-band__median" />
        <span className="h-band__you" /><span className="h-band__tag">You {format(you)}</span>
      </div>
      <div className="h-band__scale"><span>{format(lo)}</span><span>median {format(median)}</span><span>{format(hi)}</span></div>
    </div>
  )
}

const LEVELS: Array<{ id: Autonomy; name: string; desc: string }> = [
  { id: 'suggest', name: 'Tips you review', desc: 'The AI proposes. Nothing changes until you accept.' },
  { id: 'auto-review', name: 'Autopilot, with review', desc: 'Applies after 24 h unless you say no. Undo any time.' },
  { id: 'autopilot', name: 'Autopilot', desc: 'Applies straight away. Weekly digest of changes.' },
]
export const AUTONOMY_NAME: Record<Autonomy, string> = { suggest: 'Tips you review', 'auto-review': 'Autopilot, with review', autopilot: 'Autopilot' }

/** The autonomy dial for one section on one channel (D-145): a chip that opens the h-autonomy dial. Copy only. */
export function AutonomyControl({ value, onChange, scope }: { value: Autonomy; onChange: (v: Autonomy) => void; scope: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  const level = LEVELS.findIndex((l) => l.id === value)
  return (
    <span ref={ref} style={{ position: 'relative' }}>
      <button className="h-refine-chip" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="sparkles" />AI: {AUTONOMY_NAME[value]}<Icon name="chevron-down" />
      </button>
      {open && (
        <div className="h-autonomy" role="dialog" aria-label={`How much the AI can do: ${scope}`}
          style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 460, zIndex: 40, background: 'var(--color-surface-primary)', boxShadow: 'var(--elevation-floating)', '--level': level } as CSSProperties}>
          <div className="h-autonomy__track" role="radiogroup" aria-label="Autonomy">
            {LEVELS.map((l, i) => (
              <button key={l.id} className={`h-autonomy__stop${i <= level ? ' is-reached' : ''}`} role="radio" aria-checked={l.id === value}
                onClick={() => { onChange(l.id); setOpen(false) }}>
                <span className="h-autonomy__dot" /><span className="h-autonomy__name">{l.name}</span><span className="h-autonomy__desc">{l.desc}</span>
              </button>
            ))}
          </div>
          <div className="h-autonomy__scope"><Icon name="adjustments-horizontal" size={16} />Applies to: {scope}. Facts, money and rules never change on their own.</div>
        </div>
      )}
    </span>
  )
}
