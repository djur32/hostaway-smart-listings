/* Knowledge Hub iteration KH-A · design-system components (concepts/knowledge-hub/KH-A.md). Owned by the KH-A build.
 * The channel matrix: a grouped table whose columns are Base · Airbnb · Booking.com · Direct, its cell states
 * (uses the Base, own value, "—" not on the channel, "Set by"), a dark hover tip, a cell edit popover, citations,
 * the scrolling content-type tab bar, a drawer that slides in beside the table, and the Ask the AI pieces.
 * CSS: ds/v3/kh-a.css (tokens only). */
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CloseButton, Icon, Mark, cx } from './primitives'
import { ChannelBadge } from './fieldscope'
import { BottomSheet, useIsMobile } from './mobile'
import { TipSheet } from './tooltipSheet'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

/* ---------------- the table ---------------- */
export type KhaLayout = 'amenities' | 'text' | 'values'
/** `channels`: the property's channel columns after the Base (multi-property: one, two or three). Sets the grid's column
 *  count and, on phones, which channel each stacked cell is labelled with. */
export function KhaTable({ layout, label, channels, children }: { layout: KhaLayout; label: string; channels?: ChannelId[]; children: ReactNode }) {
  const n = channels?.length ?? 3
  return (
    <div className="kha-tablewrap">
      <div className={cx('kha-table', `kha-table--${layout}`)} role="table" aria-label={label} data-chs={channels?.join(' ')}
        style={{ '--kha-n': n, '--kha-n1': n + 1 } as CSSProperties}>{children}</div>
    </div>
  )
}
/** Column header: the channel (mark + name) or the Base, with a small count under it. */
export function KhaColHead({ col, sub }: { col: 'base' | ChannelId; sub?: ReactNode }) {
  return (
    <span className="kha-colhead">
      {col === 'base' ? <span className="kha-colhead__base"><Icon name="home" size={16} />Base</span> : <ChannelBadge channel={col} />}
      {sub != null && <span className="kha-colhead__sub">{sub}</span>}
    </span>
  )
}
export function KhaHeadRow({ first, cols }: { first: string; cols: ReactNode[] }) {
  return (
    <div className="kha-row kha-row--head" role="row">
      <div className="kha-cell kha-cell--item" role="columnheader">{first}</div>
      {cols.map((c, i) => <div key={i} className="kha-cell" role="columnheader">{c}</div>)}
    </div>
  )
}
export function KhaGroup({ title, sub }: { title: string; sub?: ReactNode }) {
  return <div className="kha-group" role="row"><span role="cell"><b>{title}</b>{sub && <span className="kha-group__sub">{sub}</span>}</span></div>
}
export function KhaRow({ tone, children, dataKey }: { tone?: 'warn' | 'add' | 'calc'; children: ReactNode; dataKey?: string }) {
  return <div className={cx('kha-row', tone && `kha-row--${tone}`)} role="row" data-kha-row={dataKey}>{children}</div>
}
export function KhaCell({ item, span, children, className }: { item?: boolean; span?: boolean; children?: ReactNode; className?: string }) {
  return <div className={cx('kha-cell', item && 'kha-cell--item', span && 'kha-cell--span', className)} role="cell">{children}</div>
}
/** A full-width line under a row: a question, a confirmation, the add row's actions. */
export function KhaStrip({ tone, icon, children, actions }: { tone?: 'warn' | 'add'; icon?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className={cx('kha-strip', tone && `kha-strip--${tone}`)} role="row">
      {icon && <Icon name={icon} />}<span className="kha-strip__text">{children}</span>
      {actions && <span className="kha-strip__actions">{actions}</span>}
    </div>
  )
}
/** The in-place "+ Add amenity" link row. */
export function KhaAddLink({ label, onClick }: { label: string; onClick: () => void }) {
  return <div className="kha-addlink" role="row"><button type="button" className="h-textlink" onClick={onClick}><Icon name="plus" size={16} />{label}</button></div>
}

/* ---------------- cell contents ---------------- */
export const KhaQuiet = ({ children = 'Uses the Base' }: { children?: ReactNode }) => <span className="kha-quiet">{children}</span>
export const KhaNone = () => <span className="kha-none" aria-label="Not on this channel">—</span>
export function KhaSetBy({ channel }: { channel: ChannelId }) {
  return <span className="kha-setby"><Icon name="lock" size={16} /><span>Set by</span><span className="kha-setby__ch">{CHANNELS[channel].name}</span></span>
}
export function KhaCite({ n }: { n: number }) { return <span className="kha-cite" aria-label={`Citation ${n}`}>{n}</span> }
export function KhaAlias({ children }: { children: ReactNode }) { return <span className="kha-alias">as “{children}”</span> }
export function KhaCheck({ checked, label, onChange, disabled }: { checked: boolean; label: string; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return <input type="checkbox" className="h-checkbox kha-check" checked={checked} aria-label={label} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
}

/** A clickable, editable cell. Selected = the popover is open on it (grey ring). Cited = an AI answer used it. */
export function KhaCellButton({ selected, cited, flash, onClick, label, cellId, children }: {
  selected?: boolean; cited?: number; flash?: boolean; onClick: () => void; label: string; cellId: string; children: ReactNode
}) {
  return (
    <button type="button" className={cx('kha-cellbtn', selected && 'is-selected', !!cited && 'is-cited', flash && 'is-flash')} aria-label={label}
      aria-expanded={selected} data-kha-cell={cellId} onClick={onClick}>
      <span className="kha-cellbtn__text">{children}</span>
      {cited ? <KhaCite n={cited} /> : null}
    </button>
  )
}
/** A cell that isn't editable here but can still be cited (tinted) by an answer. */
export function KhaCellStatic({ cited, flash, cellId, children }: { cited?: number; flash?: boolean; cellId: string; children: ReactNode }) {
  return <span className={cx('kha-cellstatic', !!cited && 'is-cited', flash && 'is-flash')} data-kha-cell={cellId}><span className="kha-cellbtn__text">{children}</span>{cited ? <KhaCite n={cited} /> : null}</span>
}

/** Dark hover tip (e.g. "Not on Airbnb · Airbnb has no amenity for this…"). */
export function KhaTip({ title, text, children, defaultOpen }: { title: string; text?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const t = useRef<number | undefined>(undefined)
  const id = useId()
  const show = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(false), 80) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  const mobile = useIsMobile()
  const root = useRef<HTMLSpanElement>(null)
  // phones: a tap opens the shared bottom sheet (tooltipSheet.tsx), not the dark bubble
  if (mobile) return (
    <span className="kha-tip" ref={root}>
      <span className="kha-tip__trigger" tabIndex={0} role="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{children}</span>
      <TipSheet open={open} title={title} onClose={() => setOpen(false)} host={root}>{text ? <span>{text}</span> : <span />}</TipSheet>
    </span>
  )
  return (
    <span className="kha-tip" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={() => { window.clearTimeout(t.current); setOpen(true) }}>
      <span className="kha-tip__trigger" tabIndex={0} aria-describedby={open ? id : undefined}>{children}</span>
      {open && <span className="kha-tip__pop" role="tooltip" id={id}><b>{title}</b>{text && <span>{text}</span>}</span>}
    </span>
  )
}

/** The cell edit popover, anchored under its cell and kept inside the table's width. One at a time.
 *  Phones (≤ 767px): a bottom sheet with the actions in its footer (ds/mobile.md §7: one cell's editor). */
export function KhaPopover(props: { title: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; boundary?: string }) {
  const mobile = useIsMobile()
  if (!mobile) return <KhaPopoverDesk {...props} />
  return (
    <BottomSheet open title={props.title} onClose={props.onClose} footer={props.foot} label={typeof props.title === 'string' ? props.title : 'Edit'}>
      <div className="kha-pop__body kha-pop__body--sheet">{props.children}</div>
    </BottomSheet>
  )
}
function KhaPopoverDesk({ title, onClose, children, foot, boundary }: { title: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; boundary?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dx, setDx] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.closest(boundary ?? '.kha-tablewrap')?.getBoundingClientRect()
    if (!el || !box) return
    const r = el.getBoundingClientRect()
    const left = r.left - dx
    const want = Math.min(0, box.right - (left + r.width)) + Math.max(0, box.left - left)
    if (want !== dx) setDx(want)
  })
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const down = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement
      if (ref.current?.contains(tgt) || tgt.closest('.kha-cellbtn.is-selected') || tgt.closest('.h-dropdown__menu')) return
      onClose()
    }
    document.addEventListener('keydown', key)
    document.addEventListener('mousedown', down)
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', down) }
  }, [onClose])
  return (
    <div className="kha-pop" ref={ref} role="dialog" aria-label={typeof title === 'string' ? title : 'Edit'} style={{ translate: `${dx}px 0` }}>
      <div className="kha-pop__head"><h3>{title}</h3><CloseButton className="kha-pop__x" onClick={onClose} /></div>
      <div className="kha-pop__body">{children}</div>
      {foot && <div className="kha-pop__foot">{foot}</div>}
    </div>
  )
}
/** A labelled block inside the popover: "Base · Used by Booking.com and Direct" + control + caption. */
export function KhaPopField({ label, note, caption, children }: { label: ReactNode; note?: ReactNode; caption?: ReactNode; children: ReactNode }) {
  return (
    <div className="kha-popfield">
      <div className="kha-popfield__label"><span>{label}</span>{note && <span className="kha-popfield__note">{note}</span>}</div>
      {children}
      {caption && <div className="kha-popfield__caption">{caption}</div>}
    </div>
  )
}
/** "ⓘ Custom for Airbnb · 171 / 500 · Use the Base": plain text, the action a black underlined link. */
export function KhaScope({ text, count, action }: { text: ReactNode; count?: ReactNode; action?: ReactNode }) {
  return <><span className="kha-scope"><Icon name="info-circle" size={16} />{text}</span><span className="kha-scope__end">{count && <span className="kha-scope__count">{count}</span>}{action}</span></>
}

/* ---------------- legend and toolbar ---------------- */
export function KhaLegend({ items }: { items: Array<{ sample: ReactNode; label: string }> }) {
  return <span className="kha-legend">{items.map((i) => <span key={i.label} className="kha-legend__item">{i.sample}<span>{i.label}</span></span>)}</span>
}
export function KhaToolbar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return <div className="kha-toolbar"><div className="kha-toolbar__left">{left}</div>{right}</div>
}

/* ---------------- the content-type tab bar: one line, scrolls (with edge fades) when it doesn't fit ---------------- */
export function KhaTabs<T extends string>({ items, active, onSelect }: { items: Array<{ id: T; label: string }>; active: T; onSelect: (id: T) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ l: false, r: false })
  const measure = () => { const el = ref.current; if (el) setEdge({ l: el.scrollLeft > 2, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 }) }
  useEffect(() => {
    measure()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => { ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }, [active])
  const page = (dir: 1 | -1) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' }) }
  return (
    <div className={cx('kha-tabs', edge.l && 'fade-l', edge.r && 'fade-r')}>
      <div className="kha-tabs__scroll h-tabs" role="tablist" ref={ref} onScroll={measure}>
        {items.map((t) => <button key={t.id} type="button" role="tab" className="h-tab kha-tab" aria-selected={t.id === active} onClick={() => onSelect(t.id)}>{t.label}</button>)}
      </div>
      {/* overflow affordance (QA A03): chevrons at the cut edge, as in B's tab bar; phones swipe instead (kh-a.css) */}
      {edge.l && <button type="button" className="kha-tabs__chev kha-tabs__chev--l" aria-label="Scroll tabs left" onClick={() => page(-1)}><Icon name="chevron-left" size={16} /></button>}
      {edge.r && <button type="button" className="kha-tabs__chev kha-tabs__chev--r" aria-label="Scroll tabs right" onClick={() => page(1)}><Icon name="chevron-right" size={16} /></button>}
    </div>
  )
}

/* ---------------- the table + side panel: the panel slides in from the right, the table narrows in step ---------------- */
export function KhaSplit({ main, panel, open, onClosed, sheetTitle, onClose }: {
  main: ReactNode; panel: ReactNode; open: boolean; onClosed?: () => void
  /** Phones: the panel opens as a bottom sheet with this title; `onClose` is its × and scrim. */
  sheetTitle?: string; onClose?: () => void
}) {
  const mobile = useIsMobile()
  if (mobile) return (
    <div className="kha-split kha-split--phone">
      <div className="kha-split__main">{main}</div>
      <BottomSheet open={open} title={sheetTitle ?? 'Panel'} onClose={() => onClose?.()}><div className="kha-sheetpanel">{panel}</div></BottomSheet>
    </div>
  )
  return (
    <div className={cx('kha-split', open && 'is-open')}>
      <div className="kha-split__main h-scroll-thin">{main}</div>
      <div className="kha-split__panel" aria-hidden={!open} inert={!open || undefined} onTransitionEnd={(e) => { if (!open && e.target === e.currentTarget.firstChild) onClosed?.() }}>
        <div className="kha-split__sheet">{panel}</div>
      </div>
    </div>
  )
}
export function KhaPanel({ head, children, foot }: { head: ReactNode; children: ReactNode; foot?: ReactNode }) {
  return (
    <section className="kha-panel">
      <div className="kha-panel__head">{head}</div>
      <div className="kha-panel__body h-scroll-thin">{children}</div>
      {foot && <div className="kha-panel__foot">{foot}</div>}
    </section>
  )
}

/** "Guest books on [Airbnb ▾]": Hospitable's dropdown, with the channel mark in the trigger and options. */
export function KhaChannelSelect({ value, options, onChange, label }: { value: ChannelId; options: ChannelId[]; onChange: (c: ChannelId) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open])
  return (
    <div className={cx('h-dropdown kha-chselect', open && 'is-open')} ref={wrap}>
      <button type="button" className="h-dropdown__trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
        <span className="h-dropdown__value kha-chselect__value"><Mark channel={value} size={14} />{CHANNELS[value].name}</span><Icon name="chevron-down" />
      </button>
      {open && (
        <ul className="h-dropdown__menu" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o} role="option" aria-selected={o === value} className="h-dropdown__option kha-chselect__option" onClick={() => { onChange(o); setOpen(false) }}>
              <Mark channel={o} size={14} />{CHANNELS[o].name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------------- Ask the AI ---------------- */
export function KhaBubble({ children }: { children: ReactNode }) { return <p className="kha-bubble">{children}</p> }
export function KhaAnswer({ sentences }: { sentences: Array<{ text: string; cites: number[] }> }) {
  return (
    <div className="kha-answer">
      <span className="kha-answer__title"><Icon name="sparkles" size={16} />Answer</span>
      {sentences.map((s, i) => <p key={i} className="kha-answer__line"><span>{s.text}</span><span className="kha-answer__cites">{s.cites.map((n) => <KhaCite key={n} n={n} />)}</span></p>)}
    </div>
  )
}
/** Where a cited value comes from: the Base, a channel's own value, a channel-set value, or a tick. */
export function KhaSourceChip({ kind, channel }: { kind: 'base' | 'own' | 'set' | 'listed' | 'unlisted'; channel: ChannelId }) {
  const name = CHANNELS[channel].name
  if (kind === 'base') return <span className="kha-srcchip"><Icon name="home" size={16} />Base</span>
  if (kind === 'set') return <span className="kha-srcchip"><Icon name="lock" size={16} />Set by {name}</span>
  return <span className="kha-srcchip"><Mark channel={channel} size={14} />{kind === 'own' ? `${name}’s own` : `${name}’s list`}</span>
}
export function KhaFactRow({ n, label, value, chip, onClick }: { n: number; label: string; value: ReactNode; chip: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="kha-fact" onClick={onClick}>
      <KhaCite n={n} /><span className="kha-fact__text"><b>{label}</b><span>{value}</span></span>{chip}
    </button>
  )
}
export function KhaSource({ icon, title, sub, meta }: { icon: string; title: string; sub: string; meta: ReactNode }) {
  return (
    <div className="kha-source">
      <span className="kha-source__icon"><Icon name={icon} /></span>
      <span className="kha-source__text"><b>{title}</b><span>{sub}</span></span>
      <span className="kha-source__meta">{meta}</span>
    </div>
  )
}
