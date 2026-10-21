/* Knowledge Hub iteration KH-D · "Overview cards → sheet" · design-system components (concepts/knowledge-hub/KH-D.md).
 * CSS: ds/v3/kh-d.css (tokens only). Owned by the KH-D build.
 *
 * - KhdTabs: Hospitable's underline tabs, one line, with a "More ▾" overflow using Hospitable's dropdown menu.
 * - KhdCoverage / KhdLegend: a channel's Mark + ✓ (uses the Base) or the number of its own values; hover lists them.
 * - KhdCard: one category on the Overview (header, two key values, coverage, caption, what's missing, "+ Add …").
 * - KhdAddAnyCard: the dashed 12th card.
 * - KhdTopCard: the slim Sources / Ask the AI cards above the grid.
 * - KhdSheet: the right side sheet (slides in from the right like a drawer; scrim over the page; Esc closes).
 * - KhdCaption: the plain-text scope caption under a control ("ⓘ 3 channels · Edit per channel").
 * - KhdSplit / KhdSplitRow: "Edit per channel", one control per channel, "Set one value".
 * - KhdAddBox: search-or-add in one box ("Add amenity, e.g. Air conditioning · Adds to all channels").
 * - KhdFlag: "Channels disagree: Balcony" with two plain answers.
 * - KhdAmenityRow: an amenity, where it's listed (All channels / Marks + names), expandable into "Listed on" checkboxes.
 * Rules (Antonio, 30 Sep): captions are plain text (no channel logo); Marks only in identity spots. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { CloseButton, Icon, Mark, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import { ValueHover, type ScopeValue } from './fieldscope'
import { CheckCard } from './photos'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

/* ---------- tabs with overflow ---------- */
export interface KhdTab { id: string; label: string }
export function KhdTabs({ items, more, active, onSelect }: { items: KhdTab[]; more: KhdTab[]; active: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const mobile = useIsMobile()
  useEffect(() => {
    if (!open || mobile) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open, mobile])
  const inMore = more.some((m) => m.id === active)
  return (
    <div className="h-tabs h-khd-tabs" role="tablist" aria-label="Knowledge Hub">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" className="h-tab" aria-selected={t.id === active} onClick={() => onSelect(t.id)}>{t.label}</button>
      ))}
      <div className="h-khd-tabs__more" ref={wrap}>
        <button type="button" role="tab" className="h-tab h-khd-tabs__morebtn" aria-selected={inMore} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
          {inMore ? more.find((m) => m.id === active)!.label : 'More'}<Icon name="chevron-down" size={16} />
        </button>
        {/* phones: the tab rail scrolls (and would clip a dropdown), so More opens a short bottom-sheet picker */}
        {mobile && (
          <BottomSheet open={open} title="More" onClose={() => setOpen(false)}>
            <ul className="h-khd-morelist" role="menu" id={menuId}>
              {more.map((m) => (
                <li key={m.id} role="none"><button type="button" role="menuitem" className="h-khd-morelist__item" aria-current={m.id === active ? 'page' : undefined}
                  onClick={() => { setOpen(false); onSelect(m.id) }}>{m.label}{m.id === active && <Icon name="check" size={18} />}</button></li>
              ))}
            </ul>
          </BottomSheet>
        )}
        {open && !mobile && (
          <ul className="h-dropdown__menu h-khd-tabs__menu" role="menu" id={menuId}>
            {more.map((m) => (
              <li key={m.id} role="menuitem" tabIndex={0} aria-selected={m.id === active} className="h-dropdown__option"
                onClick={() => { setOpen(false); onSelect(m.id) }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(false); onSelect(m.id) } }}>{m.label}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ---------- coverage ---------- */
/** A channel's Mark with ✓ (same as the Base) or the number of its own values. Hovering lists them. */
export function KhdCoverage({ channel, count, title, detail }: { channel: ChannelId; count: number; title?: string; detail?: string }) {
  const chip = (
    <span className="h-khd-cov" aria-label={`${CHANNELS[channel].name}: ${count ? `${count} of its own` : 'same as the Base'}`}>
      <Mark channel={channel} size={14} />
      {count ? <b className="h-khd-cov__n">{count}</b> : <Icon name="check" className="h-khd-cov__ok" />}
    </span>
  )
  if (!detail) return chip
  const values: ScopeValue[] = [{ who: channel, value: detail, used: true }]
  return <ValueHover title={title} values={values}>{chip}</ValueHover>
}
/** `channel`: the Mark the legend shows (the property's first channel, so a Booking.com-only home never shows Airbnb's). */
export function KhdLegend({ channel = 'airbnb' }: { channel?: ChannelId }) {
  return (
    <span className="h-khd-legend" aria-label="Legend">
      <span className="h-khd-legend__item"><span className="h-khd-cov h-khd-cov--bare"><Mark channel={channel} size={14} /><Icon name="check" className="h-khd-cov__ok" /></span>same as the Base</span>
      <span className="h-khd-legend__item"><span className="h-khd-cov h-khd-cov--bare"><Mark channel={channel} size={14} /><b className="h-khd-cov__n">2</b></span>its own values</span>
    </span>
  )
}

/* ---------- cards ---------- */
export function KhdTile({ icon, ai, size = 'md' }: { icon: string; ai?: boolean; size?: 'sm' | 'md' }) {
  return <span className={cx('h-khd-tile', ai && 'h-khd-tile--ai', size === 'sm' && 'h-khd-tile--sm')}><Icon name={icon} /></span>
}
export function KhdCard({ icon, title, count, onOpen, children, coverage, caption, missing, addLabel, onAdd, active }: {
  icon: string; title: string; count: string; onOpen: () => void; children: ReactNode
  coverage: ReactNode; caption: ReactNode; missing?: ReactNode[]; addLabel: string; onAdd: () => void; active?: boolean
}) {
  return (
    <article className={cx('h-khd-card', active && 'is-active')}>
      <button type="button" className="h-khd-card__head" onClick={onOpen} aria-label={`Open ${title}`}>
        <KhdTile icon={icon} /><span className="h-khd-card__title">{title}</span><span className="h-khd-card__count">{count}</span><Icon name="chevron-right" size={16} />
      </button>
      <div className="h-khd-card__values" onClick={onOpen}>{children}</div>
      <div className="h-khd-card__cov">{coverage}</div>
      <p className="h-khd-card__caption">{caption}</p>
      {missing?.map((m, i) => <p key={i} className="h-khd-card__missing"><Icon name="alert-circle" size={16} /><span>{m}</span></p>)}
      <div className="h-khd-card__foot"><button type="button" className="h-textlink h-khd-add" onClick={onAdd}><Icon name="plus" size={16} />{addLabel}</button></div>
    </article>
  )
}
export function KhdAddAnyCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="h-khd-anycard" onClick={onClick}>
      <KhdTile icon="plus" />
      <span className="h-khd-anycard__title">Add anything</span>
      <span className="h-khd-anycard__text">Type or paste a fact. It’s filed in the right category, and you confirm where before it’s saved.</span>
    </button>
  )
}
export function KhdTopCard({ icon, ai, title, count, sub, onOpen, children, className }: {
  icon: string; ai?: boolean; title: string; count?: number; sub?: ReactNode; onOpen?: () => void; children?: ReactNode; className?: string
}) {
  return (
    <section className={cx('h-khd-top', className)}>
      <div className="h-khd-top__head">
        <KhdTile icon={icon} ai={ai} size="sm" />
        <h2 className="h-khd-top__title">{title}</h2>
        {count !== undefined && <span className="h-khd-top__count">{count}</span>}
        {sub && <span className="h-khd-top__sub">{sub}</span>}
        {onOpen && <button type="button" className="h-btn-icon h-khd-top__open" aria-label={`Open ${title}`} onClick={onOpen}><Icon name="chevron-right" size={16} /></button>}
      </div>
      {children}
    </section>
  )
}

/* ---------- side sheet ---------- */
/** Right side sheet over the dimmed Overview. Slides in from the right like a drawer; closing slides it back out. */
export function KhdSheet({ icon, ai, title, sub, onClose, children, foot, bodyRef, phone = 'full' }: {
  icon: string; ai?: boolean; title: string; sub?: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; bodyRef?: React.Ref<HTMLDivElement>
  /** Phones (≤ 767px): a full-screen bottom sheet for a category's edit form (default) or a regular one (Ask, Sources). */
  phone?: 'full' | 'sheet'
}) {
  const mobile = useIsMobile()
  const [closing, setClosing] = useState(false)
  const done = useRef(onClose)
  done.current = onClose
  const close = () => setClosing(true)
  useEffect(() => { if (!closing) return; const t = setTimeout(() => done.current(), 180); return () => clearTimeout(t) }, [closing])
  useEffect(() => {
    if (mobile) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.h-dropdown.is-open')) setClosing(true) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [mobile])
  if (mobile) return (
    <BottomSheet open={!closing} title={title} onClose={close} footer={foot} fullScreen={phone === 'full'} label={title}>
      <div className="h-khd-sheet__body h-khd-sheet__body--phone" ref={bodyRef}>
        {sub && <p className="h-khd-sheet__sub">{sub}</p>}
        {children}
      </div>
    </BottomSheet>
  )
  return (
    <>
      <div className={cx('h-khd-scrim', closing && 'is-closing')} onClick={close} />
      <aside className={cx('h-khd-sheet', closing && 'is-closing')} role="dialog" aria-modal="true" aria-label={title}>
        <header className="h-khd-sheet__head">
          <KhdTile icon={icon} ai={ai} />
          <div className="h-khd-sheet__titles"><h2 className="h-khd-sheet__title">{title}</h2>{sub && <p className="h-khd-sheet__sub">{sub}</p>}</div>
          <CloseButton onClick={close} />
        </header>
        <div className="h-khd-sheet__body" ref={bodyRef}>{children}</div>
        {foot && <footer className="h-khd-sheet__foot">{foot}</footer>}
      </aside>
    </>
  )
}
export function KhdGroup({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }) {
  return <section className="h-khd-group" id={id}><h3 className="h-khd-group__title">{title}</h3>{children}</section>
}

/* ---------- field pieces ---------- */
/** A stacked field: label (medium) + help, the control, the caption row. */
export function KhdField({ label, help, children, caption, dataKey }: { label: ReactNode; help?: ReactNode; children: ReactNode; caption?: ReactNode; dataKey?: string }) {
  return (
    <div className="h-khd-field" data-kh-key={dataKey}>
      <div className="h-khd-field__head"><p className="h-khd-field__label">{label}</p>{help && <p className="h-khd-field__help">{help}</p>}</div>
      {children}
      {caption}
    </div>
  )
}
/** "ⓘ 3 channels · Edit per channel" / "ⓘ Booking.com has its own · €30" / "🔒 Booking.com runs its own deals". Plain text. */
export function KhdCaption({ text, lock, values, title, action }: { text: ReactNode; lock?: boolean; values?: ScopeValue[]; title?: string; action?: ReactNode }) {
  const body = <span className="h-khd-caption__text"><Icon name={lock ? 'lock' : 'info-circle'} />{text}</span>
  return (
    <div className="h-field-hint h-khd-caption">
      {values?.length ? <ValueHover title={title} values={values}>{body}</ValueHover> : body}
      {action}
    </div>
  )
}
export function KhdSplit({ children, onSetOne }: { children: ReactNode; onSetOne?: () => void }) {
  return (
    <div className="h-khd-split">
      {children}
      {onSetOne && <div className="h-khd-split__foot"><button type="button" className="h-field-hint__action" onClick={onSetOne}>Set one value</button></div>}
    </div>
  )
}
export function KhdSplitRow({ channel, children, note, stacked }: { channel: ChannelId; children?: ReactNode; note?: ReactNode; stacked?: boolean }) {
  return (
    <div className={cx('h-khd-split__row', stacked && 'is-stacked')}>
      <span className="h-khd-split__ch"><Mark channel={channel} />{CHANNELS[channel].name}</span>
      <div className="h-khd-split__ctl">{children}{note && <p className="h-khd-split__note">{note}</p>}</div>
    </div>
  )
}

/* ---------- add box: search or add in one step ---------- */
export function KhdAddBox({ placeholder, hint, value, onChange, onAdd, suggestions = [], autoFocus, addVerb = 'Add' }: {
  placeholder: string; hint?: string; value: string; onChange: (v: string) => void; onAdd: (v: string) => void
  suggestions?: string[]; autoFocus?: boolean; addVerb?: string
}) {
  const [focus, setFocus] = useState(false)
  const [hi, setHi] = useState(0)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (autoFocus) setTimeout(() => ref.current?.focus(), 260) }, [autoFocus])
  const q = value.trim()
  const matches = suggestions.filter((s) => !q || s.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  const exact = matches.some((s) => s.toLowerCase() === q.toLowerCase())
  const opts = [...matches, ...(q && !exact ? [`${addVerb} “${q}”`] : [])]
  const pick = (i: number) => { const o = opts[i]; if (!o) return; onAdd(i < matches.length ? matches[i] : q); onChange('') }
  const open = focus && opts.length > 0 && (q.length > 0 || suggestions.length > 0)
  return (
    <div className={cx('h-khd-addbox', open && 'is-open')}>
      <Icon name="plus" />
      <input ref={ref} className="h-khd-addbox__input" value={value} placeholder={placeholder} aria-label={placeholder}
        onChange={(e) => { onChange(e.target.value); setHi(0) }} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(opts.length - 1, h + 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
          else if (e.key === 'Enter') { e.preventDefault(); pick(hi) }
        }} />
      {hint && <span className="h-khd-addbox__hint">{hint}</span>}
      {open && (
        <ul className="h-dropdown__menu h-khd-addbox__menu" role="listbox">
          {opts.map((o, i) => (
            <li key={o} role="option" aria-selected={false} className={cx('h-dropdown__option', i === hi && 'is-hi', i >= matches.length && 'h-khd-addbox__new')}
              onMouseEnter={() => setHi(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(i)}>{o}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- flag: channels disagree ---------- */
export function KhdFlag({ title, children, options, chosen, onUndo }: {
  title: ReactNode; children: ReactNode; options: Array<{ label: string; onPick: () => void }>; chosen?: ReactNode; onUndo?: () => void
}) {
  return (
    <div className={cx('h-khd-flag', !!chosen && 'is-chosen')} role="status">
      <Icon name={chosen ? 'circle-check' : 'alert-triangle'} />
      <div className="h-khd-flag__text">
        <b>{title}</b>
        <span>{chosen ?? children}</span>
        {chosen
          ? onUndo && <span><button type="button" className="h-textlink" onClick={onUndo}>Undo</button></span>
          : <span className="h-khd-flag__options">{options.map((o) => <button key={o.label} type="button" className="h-btn h-btn--secondary h-khd-flag__opt" onClick={o.onPick}>{o.label}</button>)}</span>}
      </div>
    </div>
  )
}

/* ---------- amenity row ---------- */
const chName = (c: ChannelId) => CHANNELS[c].name
export function KhdWhere({ on, all }: { on: ChannelId[]; all: ChannelId[] }) {
  if (on.length === all.length && all.length > 1) return <span className="h-khd-where h-khd-where--all">All channels</span>
  if (!on.length) return <span className="h-khd-where h-khd-where--all">Not listed</span>
  return (
    <span className="h-khd-where">
      <span className="h-khd-where__marks">{on.map((c) => <Mark key={c} channel={c} size={14} />)}</span>
      {on.length === 1 ? (all.length === 1 ? `Listed on ${chName(on[0])}` : `${chName(on[0])} only`) : on.map(chName).join(', ')}
    </span>
  )
}
export function KhdAmenityRow({ name, note, warn, on, all, open, onToggle, listed, onListed, onRemove }: {
  name: string; note?: ReactNode; warn?: boolean; on: ChannelId[]; all: ChannelId[]; open: boolean; onToggle: () => void
  listed: (c: ChannelId) => boolean; onListed: (c: ChannelId, v: boolean) => void; onRemove?: () => void
}) {
  const [menu, setMenu] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!menu) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setMenu(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [menu])
  if (open) return (
    <div className="h-khd-amen is-open">
      <button type="button" className="h-khd-amen__openhead" aria-expanded onClick={onToggle}><span>{name}</span><Icon name="chevron-up" size={16} /></button>
      <p className="h-khd-amen__label">Listed on</p>
      <div className="h-check-cards">{all.map((c) => <CheckCard key={c} channel={c} label={chName(c)} checked={listed(c)} onChange={(v) => onListed(c, v)} />)}</div>
      <p className="h-khd-amen__hint"><Icon name="info-circle" size={16} />Untick a channel to hide it there. The fact stays in the Hub.</p>
    </div>
  )
  return (
    <div className="h-khd-amen">
      <button type="button" className="h-khd-amen__main" aria-expanded={false} onClick={onToggle}>
        <span className="h-khd-amen__name">{name}{warn && <Icon name="alert-triangle" size={16} className="h-khd-amen__warn" />}</span>
        {note && <span className="h-khd-amen__note">{note}</span>}
      </button>
      <KhdWhere on={on} all={all} />
      <span className="h-khd-amen__more" ref={wrap}>
        <button type="button" className="h-btn-icon" aria-label={`More for ${name}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name="dots" /></button>
        {menu && (
          <ul className="h-dropdown__menu h-khd-amen__menu" role="menu">
            <li role="menuitem" className="h-dropdown__option" onClick={() => { setMenu(false); onToggle() }}>Choose where it’s listed</li>
            {onRemove && <li role="menuitem" className="h-dropdown__option" onClick={() => { setMenu(false); onRemove() }}>Remove from every channel</li>}
          </ul>
        )}
      </span>
    </div>
  )
}
