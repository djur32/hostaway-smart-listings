/* Knowledge Hub iteration KH-B · design-system components (concepts/knowledge-hub/KH-B.md). Owned by the KH-B build.
 * One calm document with a sticky anchor bar (scroll-spy), read-mode facts with plain-text scope captions, a channel
 * hover card (Base vs the channel's own value, with "Use the Base" / "Edit X's version"), amenity chips, the sources strip,
 * the inline "Add a fact" card with "Where will this be used?" previews, and the "Test your AI" drawer and its answer.
 * CSS: ds/v3/kh-b.css (tokens only). Rules (Antonio, 30 Sep): captions are plain text, no channel logo in a circle;
 * the channel Mark only in identity spots (chips, card heads); panels slide in like a drawer; no provenance footers. */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { CloseButton, Icon, Mark, cx } from './primitives'
import { ChannelBadge } from './fieldscope'
import { BottomSheet, useIsMobile } from './mobile'
import type { ChannelId } from '../data/types'

/* ---------------- layout: the document column + the drawer on the right ---------------- */
const DRAWER_MS = 260 // the drawer's width/transform transition (kh-b.css) plus a frame
/** The main column scrolls (thin scrollbar); the drawer slides in from the right and the column narrows in sync. */
export function KhbLayout({ main, drawer, mainRef, sheetTitle = 'Test your AI', onClose, minimized, onRestore }: {
  main: ReactNode; drawer?: ReactNode; mainRef?: Ref<HTMLDivElement>
  /** Phones: the drawer is a full-height bottom sheet; `minimized` hides it behind a pill (after a citation tap) that `onRestore` reopens. */
  sheetTitle?: string; onClose?: () => void; minimized?: boolean; onRestore?: () => void
}) {
  const mobile = useIsMobile()
  const open = drawer != null && drawer !== false
  const last = useRef<ReactNode>(drawer)
  if (open) last.current = drawer
  const [leaving, setLeaving] = useState(false)
  const [prev, setPrev] = useState(open)
  if (prev !== open) { setPrev(open); setLeaving(!open) }
  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setLeaving(false), DRAWER_MS)
    return () => clearTimeout(t)
  }, [leaving])
  const content = open ? drawer : leaving ? last.current : null
  if (mobile) return (
    <div className="khb khb--phone">
      <div className="khb__main" ref={mainRef}>{main}</div>
      <BottomSheet open={open && !minimized} title={sheetTitle} onClose={() => onClose?.()} fullScreen><div className="khb-sheetrail">{content}</div></BottomSheet>
      {open && minimized && (
        <button type="button" className="khb-peek" onClick={onRestore}><Icon name="sparkles" size={16} /><span>Back to the answer</span><Icon name="chevron-up" size={16} /></button>
      )}
    </div>
  )
  return (
    <div className="khb">
      <div className="khb__main h-scroll-thin" ref={mainRef}>{main}</div>
      <div className={cx('khb__drawer', open && 'is-open')} aria-hidden={!open}>
        <div className="khb__sheet h-scroll-thin">{content}</div>
      </div>
    </div>
  )
}

/* ---------------- sources strip ---------------- */
export function KhbSources({ count, note, children }: { count: number; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="khb-sources" aria-label="Sources">
      <div className="khb-sources__head"><h2 className="khb-sources__title">Sources</h2><span className="khb-sources__count">{count}</span>{note && <span className="khb-sources__note">{note}</span>}</div>
      <div className="khb-sources__row">{children}</div>
    </section>
  )
}
export function KhbSourceCard({ name, meta, icon, updated, menu }: { name: string; meta: string; icon: string; updated: string; menu?: Array<{ label: string; onClick: () => void }> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const phone = useIsMobile()
  useEffect(() => {
    if (!open || phone) return
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open, phone])
  return (
    <div className="khb-src" ref={ref}>
      <div className="khb-src__top">
        <span className="khb-src__icon"><Icon name={icon} size={18} /></span>
        <span className="khb-src__text"><b>{name}</b><small>{meta}</small></span>
      </div>
      <div className="khb-src__foot">
        <span>{updated}</span>
        {menu && <button type="button" className="h-btn-icon khb-src__more" aria-label={`${name}: more`} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="dots" size={16} /></button>}
      </div>
      {open && menu && phone && (
        <BottomSheet open title={name} onClose={() => setOpen(false)}>
          <ul className="h-m-menu" role="menu">
            {menu.map((m) => <li key={m.label}><button type="button" role="menuitem" className="h-m-menu__item" onClick={() => { setOpen(false); m.onClick() }}>{m.label}</button></li>)}
          </ul>
        </BottomSheet>
      )}
      {open && menu && !phone && (
        <ul className="khb-menu" role="menu">
          {menu.map((m) => <li key={m.label}><button type="button" role="menuitem" onClick={() => { setOpen(false); m.onClick() }}>{m.label}</button></li>)}
        </ul>
      )}
    </div>
  )
}
export function KhbAddSource({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="khb-src khb-src--add" onClick={onClick}>
      <span className="khb-src__icon khb-src__icon--add"><Icon name="plus" size={18} /></span>
      <span className="khb-src__text"><b>Add source</b><small>PDF, link or text</small></span>
    </button>
  )
}

/* ---------------- the sticky anchor bar (scroll-spy), one line, chevrons when it overflows ---------------- */
export interface KhbAnchor { id: string; label: string; cites?: number[] }
export function KhbAnchorBar({ items, active, onSelect, tools, stuck, barRef }: {
  items: KhbAnchor[]; active: string; onSelect: (id: string) => void; tools?: ReactNode; stuck?: boolean; barRef?: Ref<HTMLDivElement>
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ left: false, right: false })
  const read = () => {
    const el = scroller.current
    if (!el) return
    setEdge({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
  }
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(read)
    ro.observe(el); read()
    return () => ro.disconnect()
  }, [])
  // keep the active anchor in view inside the bar (never scrolls the page)
  useEffect(() => {
    const el = scroller.current
    const a = el?.querySelector<HTMLElement>(`[data-anchor="${active}"]`)
    if (!el || !a) return
    const pad = 40
    if (a.offsetLeft < el.scrollLeft + pad) el.scrollTo({ left: Math.max(0, a.offsetLeft - pad), behavior: 'smooth' })
    else if (a.offsetLeft + a.offsetWidth > el.scrollLeft + el.clientWidth - pad) el.scrollTo({ left: a.offsetLeft + a.offsetWidth - el.clientWidth + pad, behavior: 'smooth' })
  }, [active])
  const nudge = (d: 1 | -1) => scroller.current?.scrollBy({ left: d * Math.max(160, (scroller.current?.clientWidth ?? 400) * 0.6), behavior: 'smooth' })
  return (
    <div className={cx('khb-bar', stuck && 'is-stuck')} ref={barRef}>
      <div className="khb-bar__tabs">
        {edge.left && <button type="button" className="khb-bar__chev khb-bar__chev--left" aria-label="Scroll sections left" onClick={() => nudge(-1)}><Icon name="chevron-left" size={16} /></button>}
        <div className="khb-bar__scroller" ref={scroller} onScroll={read} role="tablist" aria-label="Sections">
          {items.map((i) => (
            <button key={i.id} type="button" role="tab" data-anchor={i.id} className="khb-bar__tab" aria-selected={i.id === active} onClick={() => onSelect(i.id)}>
              {i.label}
              {i.cites?.map((n) => <KhbCite key={n} n={n} size="sm" />)}
            </button>
          ))}
        </div>
        {edge.right && <button type="button" className="khb-bar__chev khb-bar__chev--right" aria-label="Scroll sections right" onClick={() => nudge(1)}><Icon name="chevron-right" size={16} /></button>}
      </div>
      {tools && <div className="khb-bar__tools">{tools}</div>}
    </div>
  )
}

/** Search in the bar: an icon button that opens a small finder over the document; picking a result jumps to the fact. */
export function KhbSearch({ open, onToggle, value, onChange, results, onPick }: {
  open: boolean; onToggle: (v: boolean) => void; value: string; onChange: (v: string) => void
  results: Array<{ id: string; where: string; label: string; value: string }>; onPick: (id: string) => void
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const phone = useIsMobile()
  useEffect(() => {
    if (!open || phone) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) onToggle(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onToggle(false) }
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open, onToggle, phone])
  const body = (
    <>
      <label className="h-input-wrap"><Icon name="search" /><input className="h-input" autoFocus value={value} placeholder="Search every fact…" aria-label="Search every fact" onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) onPick(results[0].id) }} /></label>
      {value.trim() && (results.length ? (
        <ul className="khb-search__list">
          {results.map((r) => (
            <li key={r.id}><button type="button" onClick={() => onPick(r.id)}><small>{r.where}</small><b>{r.label}</b><span>{r.value}</span></button></li>
          ))}
        </ul>
      ) : <p className="khb-search__none">Nothing matches “{value.trim()}”. Add it as a fact in the right section.</p>)}
    </>
  )
  return (
    <div className="khb-search" ref={wrap}>
      <button type="button" className={cx('khb-iconbtn', open && 'is-on')} aria-label="Search the Knowledge Hub" aria-expanded={open} onClick={() => onToggle(!open)}><Icon name="search" size={18} /></button>
      {open && phone && <BottomSheet open title="Search the Knowledge Hub" onClose={() => onToggle(false)} className="khb-search-sheet">{body}</BottomSheet>}
      {open && !phone && <div className="khb-search__pop" role="dialog" aria-label="Search the Knowledge Hub">{body}</div>}
    </div>
  )
}

/** A citation number (the rail's answer, the anchor bar, a cited fact). */
export function KhbCite({ n, size = 'md', onClick, label }: { n: number; size?: 'sm' | 'md'; onClick?: () => void; label?: string }) {
  if (onClick) return <button type="button" className={cx('khb-cite', `khb-cite--${size}`)} onClick={onClick} aria-label={label ?? `Source ${n}`}>{n}</button>
  return <span className={cx('khb-cite', `khb-cite--${size}`)} aria-label={label ?? `Cited as ${n}`}>{n}</span>
}

/* ---------------- a section of the document ---------------- */
export function KhbSection({ id, title, desc, action, children, foot, editing }: {
  id: string; title: ReactNode; desc?: ReactNode; action?: ReactNode; children: ReactNode; foot?: ReactNode; editing?: boolean
}) {
  return (
    <section className={cx('khb-sec', editing && 'is-editing')} data-khb-section={id} aria-labelledby={`khb-${id}`}>
      <div className="khb-sec__head">
        <div className="khb-sec__titles"><h2 className="khb-sec__title" id={`khb-${id}`}>{title}</h2>{desc && <p className="khb-sec__desc">{desc}</p>}</div>
        {action && <div className="khb-sec__action">{action}</div>}
      </div>
      <div className="khb-sec__body">{children}</div>
      {foot}
    </section>
  )
}
export function KhbGroup({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return <div className="khb-group">{title && <h3 className="khb-group__title">{title}</h3>}{children}</div>
}
/** Two facts to a row; one column when the document is narrow (the drawer is open). */
export function KhbGrid({ children }: { children: ReactNode }) {
  return <div className="khb-grid">{children}</div>
}
/** A fact in read mode: label (medium), value, and a caption only when channels differ. */
export function KhbFact({ id, label, value, caption, wide, cite, flash }: {
  id: string; label: ReactNode; value: ReactNode; caption?: ReactNode; wide?: boolean; cite?: number; flash?: boolean
}) {
  const body = (
    <>
      <p className="khb-fact__label">{label}</p>
      <div className="khb-fact__value">{value}</div>
      {caption && <div className="khb-fact__caption">{caption}</div>}
    </>
  )
  return (
    <div className={cx('khb-fact', wide && 'is-wide', !!cite && 'is-cited', flash && 'is-flash')} data-khb-fact={id}>
      {cite ? <div className="khb-fact__cited"><KhbCite n={cite} /><div className="khb-fact__inner">{body}</div></div> : body}
    </div>
  )
}
/** The caption row under a value: ⓘ + plain text (channel names in words, no logo circles). */
export function KhbCaption({ children, icon = 'info-circle' }: { children: ReactNode; icon?: string }) {
  return <span className="khb-cap"><Icon name={icon} />{children}</span>
}
export const KhbDot = () => <span className="khb-cap__dot" aria-hidden="true">·</span>
/** The inline add link at the end of a section. */
export function KhbAddLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <p className="khb-addlink"><button type="button" className="h-textlink" onClick={onClick}><Icon name="plus" size={16} />{children}</button></p>
}

/* ---------------- the channel hover card: Base vs the channel's own value ---------------- */
export function KhbChannelHover({ channel, label, base, own, onUseBase, onEdit, defaultOpen }: {
  channel: ChannelId; label: ReactNode
  base: { value: string; note: string }
  own: { value: string; note: string }
  onUseBase?: () => void; onEdit?: () => void; defaultOpen?: boolean
}) {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(!!defaultOpen)
  const [right, setRight] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const id = useId()
  const t = useRef<number | undefined>(undefined)
  const show = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(false), 120) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  useLayoutEffect(() => {
    if (!open || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    const host = wrap.current.closest('.khb__main')?.getBoundingClientRect()
    setRight(!!host && r.left + 460 > host.right - 8)
  }, [open])
  useEffect(() => {
    if (!open || mobile) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open, mobile])
  /* phones: no hover; a tap opens the same card as a bottom sheet (ds/mobile.md §7) */
  if (mobile) return (
    <span className="khb-hover" ref={wrap}>
      <button type="button" className={cx('khb-hover__trigger', open && 'is-open')} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(true)}>{label}</button>
      <BottomSheet open={open} title={`${labelOf(channel)} and the Base`} onClose={() => setOpen(false)}>
        <span className="khb-hover__sheet">
          <span className="khb-hover__block">
            <span className="khb-hover__who"><b>Base</b><span className="khb-hover__note">· {base.note}</span></span>
            <span className="khb-hover__value">{base.value || 'Empty'}</span>
          </span>
          <span className="khb-hover__block">
            <span className="khb-hover__who"><ChannelBadge channel={channel} size="sm" /><span className="khb-hover__note">· {own.note}</span></span>
            <span className="khb-hover__value">{own.value || 'Empty'}</span>
          </span>
          {(onUseBase || onEdit) && (
            <span className="khb-hover__foot">
              {onUseBase && <button type="button" className="h-textlink" onClick={() => { setOpen(false); onUseBase() }}>Use the Base on {labelOf(channel)}</button>}
              {onEdit && <button type="button" className="h-textlink" onClick={() => { setOpen(false); onEdit() }}>Edit {labelOf(channel)}’s version</button>}
            </span>
          )}
        </span>
      </BottomSheet>
    </span>
  )
  return (
    <span className="khb-hover" ref={wrap} onMouseEnter={show} onMouseLeave={hide}>
      <button type="button" className={cx('khb-hover__trigger', open && 'is-open')} aria-expanded={open} aria-controls={id} onFocus={show} onClick={() => setOpen(!open)}>{label}</button>
      {open && (
        <span className={cx('khb-hover__pop', right && 'is-right')} id={id} role="dialog" aria-label="Base and channel values" onMouseEnter={show} onMouseLeave={hide}>
          <span className="khb-hover__block">
            <span className="khb-hover__who"><b>Base</b><span className="khb-hover__note">· {base.note}</span></span>
            <span className="khb-hover__value">{base.value || 'Empty'}</span>
          </span>
          <span className="khb-hover__block">
            <span className="khb-hover__who"><ChannelBadge channel={channel} size="sm" /><span className="khb-hover__note">· {own.note}</span></span>
            <span className="khb-hover__value">{own.value || 'Empty'}</span>
          </span>
          {(onUseBase || onEdit) && (
            <span className="khb-hover__foot">
              {onUseBase && <button type="button" className="h-textlink" onClick={() => { setOpen(false); onUseBase() }}>Use the Base on {labelOf(channel)}</button>}
              {onEdit && <button type="button" className="h-textlink" onClick={() => { setOpen(false); onEdit() }}>Edit {labelOf(channel)}’s version</button>}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
const labelOf = (c: ChannelId) => ({ airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct', vrbo: 'Vrbo', google: 'Google' } as Record<ChannelId, string>)[c]

/* ---------------- amenities ---------------- */
/** A chip per amenity: plain when it's on every channel; with the channels' marks when it's only on some. */
export function KhbChip({ name, on, note, cite, id, title }: { name: string; on?: ChannelId[]; note?: string; cite?: number; id?: string; title?: string }) {
  return (
    <span className={cx('khb-chip', on && on.length > 0 && 'is-some', !!cite && 'is-cited')} data-khb-fact={id} title={title}>
      {cite && <KhbCite n={cite} size="sm" />}
      <span>{name}</span>
      {on && on.length > 0 && <span className="khb-chip__marks">{on.map((c) => <Mark key={c} channel={c} size={14} />)}</span>}
      {note && <span className="khb-chip__note" title={note}><Icon name="info-circle" /></span>}
    </span>
  )
}
export function KhbChips({ children }: { children: ReactNode }) {
  return <div className="khb-chips">{children}</div>
}

/* ---------------- inline add ---------------- */
export function KhbAddCard({ title, onClose, children, foot }: { title: ReactNode; onClose: () => void; children: ReactNode; foot: ReactNode }) {
  return (
    <div className="khb-add" role="group" aria-label={typeof title === 'string' ? title : 'New fact'}>
      <div className="khb-add__head"><h3 className="khb-add__title">{title}</h3><CloseButton onClick={onClose} /></div>
      <div className="khb-add__body">{children}</div>
      <div className="khb-add__foot">{foot}</div>
    </div>
  )
}
export function KhbTypePicker({ types, value, onChange }: { types: Array<{ id: string; icon: string }>; value: string; onChange: (id: string) => void }) {
  return (
    <div className="khb-types" role="radiogroup" aria-label="What kind of fact?">
      {types.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={t.id === value} className="khb-type" onClick={() => onChange(t.id)}><Icon name={t.icon} size={16} />{t.id}</button>
      ))}
    </div>
  )
}
export function KhbLabeled({ label, children, width }: { label: ReactNode; children: ReactNode; width?: 'sm' | 'md' }) {
  return <label className={cx('khb-labeled', width && `khb-labeled--${width}`)}><span className="khb-labeled__label">{label}</span>{children}</label>
}
/** One destination in "Where will this be used?": a checkbox, where it lands, and the text as it will read there. */
export function KhbDest({ head, where, preview, checked, onChange, lead }: { head: ReactNode; where?: ReactNode; preview: ReactNode; checked: boolean; onChange: (v: boolean) => void; lead?: ReactNode }) {
  return (
    <label className={cx('khb-dest', !checked && 'is-off')}>
      <span className="khb-dest__head"><input type="checkbox" className="h-checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{head}</span>
      {where && <span className="khb-dest__where">{where}</span>}
      {lead && <span className="khb-dest__where">{lead}</span>}
      <span className="khb-dest__preview">{preview}</span>
    </label>
  )
}

/* ---------------- Test your AI ---------------- */
export function KhbRail({ onClose, head, children, input }: { onClose: () => void; head: ReactNode; children: ReactNode; input: ReactNode }) {
  return (
    <aside className="khb-rail" aria-label="Test your AI">
      <div className="khb-rail__top">
        <div className="khb-rail__titlerow"><h2 className="khb-rail__title">Test your AI</h2><CloseButton label="Close Test your AI" onClick={onClose} /></div>
        {head}
      </div>
      <div className="khb-rail__body h-scroll-thin">{children}</div>
      <div className="khb-rail__input">{input}</div>
    </aside>
  )
}
/** `asked` = how often guests asked it (message history); left out for the standard questions of a property without one. */
export function KhbQuestionChips({ items, onPick }: { items: Array<{ id: string; q: string; asked?: number }>; onPick: (id: string) => void }) {
  return (
    <div className="khb-qchips">
      {items.map((i) => <button key={i.id} type="button" className="khb-qchip" title={i.asked !== undefined ? `Asked ${i.asked} times in the last 12 months` : 'A question guests usually ask'} onClick={() => onPick(i.id)}>{i.q}</button>)}
    </div>
  )
}
export function KhbBubble({ children }: { children: ReactNode }) {
  return <div className="khb-bubble">{children}</div>
}
export function KhbThinking() {
  return <div className="khb-answer khb-answer--thinking" role="status" aria-label="Writing a reply"><span className="h-msg--typing khb-typing"><i /><i /><i /></span></div>
}
export function KhbAnswer({ channel, covered, children, facts, foot }: { channel: string; covered: boolean; children: ReactNode; facts?: ReactNode; foot?: ReactNode }) {
  return (
    <div className="khb-answer">
      <div className="khb-answer__head">
        <Icon name="sparkles" size={16} />
        <span className="khb-answer__who">AI reply · as sent on {channel}</span>
        {covered ? <span className="h-pill h-pill--recommended khb-answer__pill"><Icon name="check" />Covered</span> : <span className="h-pill h-pill--warning khb-answer__pill">Not covered</span>}
      </div>
      <div className="khb-answer__text">{children}</div>
      {facts}
      {foot && <div className="khb-answer__foot">{foot}</div>}
    </div>
  )
}
export function KhbSentence({ children, cites }: { children: ReactNode; cites?: ReactNode }) {
  return <p className="khb-sentence"><span>{children}</span>{cites && <span className="khb-sentence__cites">{cites}</span>}</p>
}
export function KhbFactsUsed({ count, children }: { count: number; children: ReactNode }) {
  return <div className="khb-used"><p className="khb-used__title">Facts used · {count}</p>{children}</div>
}
export function KhbUsedRow({ n, where, what, onClick, title }: { n: number; where: string; what: string; onClick: () => void; title?: string }) {
  return (
    <button type="button" className="khb-used__row" onClick={onClick} title={title}>
      <KhbCite n={n} size="sm" />
      <span className="khb-used__text"><b>{where}</b><span>{what}</span></span>
      <Icon name="arrow-right" size={16} />
    </button>
  )
}
export function KhbAskInput({ value, onChange, onAsk }: { value: string; onChange: (v: string) => void; onAsk: () => void }) {
  return (
    <form className="khb-ask" onSubmit={(e) => { e.preventDefault(); if (value.trim()) onAsk() }}>
      <input className="khb-ask__input" value={value} placeholder="Ask what a guest would ask…" aria-label="Ask what a guest would ask" onChange={(e) => onChange(e.target.value)} />
      <button type="submit" className="h-btn h-btn--primary khb-ask__btn" disabled={!value.trim()}>Ask</button>
    </form>
  )
}
