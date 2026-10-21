/* Field scope pieces (review, 30 Sep 2026, fourth review):
 * - ChannelBadge: the channel's mark + its name, for identity spots (headers, hover rows). Not in scope captions:
 *   review dropped the logo-in-a-circle caption (30 Sep, fifth review); captions are plain text.
 * - ValueHover: hovering a field's scope shows the values behind it (the Base and the channel's own), so the host
 *   never has to switch channels to compare.
 * - Dropdown: Hostaway's real dropdown (HS-A01): bordered trigger with a chevron, a menu under it, the selected
 *   option in purple on grey. Replaces native <select> in the listing screens. Tokens only (ds/v3/fieldscope.css). */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { Icon, Mark, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

export function ChannelBadge({ channel, size = 'md' }: { channel: ChannelId; size?: 'sm' | 'md' }) {
  return (
    <span className={cx('h-chbadge', size === 'sm' && 'h-chbadge--sm')}>
      <Mark channel={channel} size={14} />
      <span className="h-chbadge__name">{CHANNELS[channel].name}</span>
    </span>
  )
}

export interface ScopeValue { who: 'base' | ChannelId; value: string; used?: boolean; note?: string }
/** Wraps the scope caption; on hover or keyboard focus shows each value behind the field. */
export function ValueHover({ children, values, title, defaultOpen }: { children: ReactNode; values: ScopeValue[]; title?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const id = useId()
  const t = useRef<number | undefined>(undefined)
  const show = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(false), 100) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  const mobile = useIsMobile()
  // already inside a bottom sheet (phones): a second sheet on top is not allowed (ds/mobile.md), so the values expand inline
  const wrap = useRef<HTMLSpanElement>(null)
  const [inSheet, setInSheet] = useState(false)
  useLayoutEffect(() => { setInSheet(!!wrap.current?.closest('.h-m-sheet')) }, [mobile])
  if (!values.length) return <>{children}</>
  const rows = values.map((v) => (
    <span key={v.who} className={cx('h-valhover__row', v.used && 'is-used')}>
      <span className="h-valhover__who">
        {v.who === 'base' ? <span className="h-valhover__base"><Icon name="layers-intersect" size={16} />Base</span> : <ChannelBadge channel={v.who} size="sm" />}
        {v.used && <span className="h-valhover__used">In use</span>}
      </span>
      <span className={cx('h-valhover__value', !v.value && 'is-empty')}>{v.value || 'Empty'}</span>
      {v.note && <span className="h-valhover__note">{v.note}</span>}
    </span>
  ))
  // phones: no hover. Tapping the caption opens the same values in a small bottom sheet; the backdrop, × or Esc close it
  if (mobile && inSheet) return (
    <span className="h-valhover h-valhover--inline" ref={wrap}>
      <button type="button" className="h-valhover__trigger h-valhover__trigger--tap" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{children}</button>
      {open && <span className="h-valhover__inline" id={id}>{rows}</span>}
    </span>
  )
  if (mobile) return (
    <span className="h-valhover" ref={wrap}>
      <button type="button" className="h-valhover__trigger h-valhover__trigger--tap" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>{children}</button>
      <BottomSheet open={open} title={title ?? 'Values'} onClose={() => setOpen(false)}>
        <span className="h-valhover__sheet">{rows}</span>
      </BottomSheet>
    </span>
  )
  return (
    <span className="h-valhover" ref={wrap} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <span className="h-valhover__trigger" tabIndex={0} aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span className="h-valhover__pop" role="tooltip" id={id} onMouseEnter={show} onMouseLeave={hide}>
          {title && <span className="h-valhover__title">{title}</span>}
          {rows}
        </span>
      )}
    </span>
  )
}

/** One option: a plain string (value = label), or a value with its own label. */
export type DropdownOption = string | { value: string; label: string }
const optValue = (o: DropdownOption) => (typeof o === 'string' ? o : o.value)
const optLabel = (o: DropdownOption) => (typeof o === 'string' ? o : o.label)

/** Hostaway's dropdown (HS-A01, review's reference 3 Oct): a bordered 16px field with a chevron; the menu opens under
 *  it, white with a soft shadow, 48px rows of 16px regular grey text with 24px on the left; hover = light grey; the
 *  selected option is purple on light grey. The one select in the prototype: native <select>s were moved onto it.
 *  Keyboard: ↑ ↓ Home End to move, a letter jumps to the next option starting with it, Enter/Space to pick, Esc to close. */
export function Dropdown({ value, options, onChange, placeholder, label, disabled, buttonRef, className, style }: {
  value?: string; options: DropdownOption[]; onChange?: (v: string) => void; placeholder?: string; label: string; disabled?: boolean; buttonRef?: Ref<HTMLButtonElement>
  /** Sizing only (width on the wrapper); the look stays the DS's. */
  className?: string; style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const wrap = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const id = useId()
  const mobile = useIsMobile() // phones (review, 4 Oct): every dropdown opens as a bottom sheet
  const known = options.some((o) => optValue(o) === value)
  const opts: DropdownOption[] = value && !known ? [value, ...options] : options
  const current = opts.find((o) => optValue(o) === value)
  useEffect(() => {
    if (!open || mobile) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open, mobile])
  useEffect(() => {
    if (open && hi >= 0) (list.current?.children[hi] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' })
  }, [open, hi])
  const pick = (o: DropdownOption) => { onChange?.(optValue(o)); setOpen(false) }
  const openMenu = () => { if (disabled) return; setHi(Math.max(0, opts.findIndex((o) => optValue(o) === value))); setOpen(true) }
  const typeAhead = (ch: string) => {
    const from = hi < 0 ? 0 : hi + 1
    const order = [...opts.slice(from), ...opts.slice(0, from)]
    const hit = order.find((o) => optLabel(o).toLowerCase().startsWith(ch.toLowerCase()))
    if (hit) setHi(opts.indexOf(hit))
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openMenu(); return }
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(opts.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setHi(0) }
    else if (e.key === 'End') { e.preventDefault(); setHi(opts.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hi >= 0) pick(opts[hi]) }
    else if (e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); typeAhead(e.key) }
  }
  return (
    <div className={cx('h-dropdown', open && 'is-open', disabled && 'is-disabled', className)} style={style} ref={wrap}>
      <button ref={buttonRef} type="button" className={cx('h-dropdown__trigger', !current && 'is-placeholder')} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={id} aria-label={label} disabled={disabled} onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={onKey}>
        <span className="h-dropdown__value">{current ? optLabel(current) : placeholder || label}</span>
        <Icon name="chevron-down" />
      </button>
      {open && !mobile && (
        <ul className="h-dropdown__menu" role="listbox" id={id} ref={list} aria-label={label}>
          {opts.map((o, i) => (
            <li key={optValue(o)} role="option" aria-selected={optValue(o) === value} className={cx('h-dropdown__option', i === hi && 'is-hi')}
              onMouseEnter={() => setHi(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>{optLabel(o)}</li>
          ))}
        </ul>
      )}
      {mobile && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={label} className="h-m-optsheet">
          <ul className="h-m-optsheet__list" role="listbox" aria-label={label}>
            {opts.map((o) => (
              <li key={optValue(o)} role="option" aria-selected={optValue(o) === value}>
                <button type="button" className="h-m-optsheet__row" onClick={() => pick(o)}>
                  <span>{optLabel(o)}</span>{optValue(o) === value && <Icon name="check" className="h-m-optsheet__check" />}
                </button>
              </li>
            ))}
          </ul>
        </BottomSheet>
      )}
    </div>
  )
}

/** Hostaway's Guest checkout tasks (HS-A02/A03): task name, optional details, trash. "+ Add task" sits below the tasks;
 *  with no tasks yet it moves to the right of the field's title row (review, 3 Oct), via .h-tasks--empty.
 *  Value = one task per line, "Task | details". Airbnb's presets (Checkout instructions): airbnb.com/help/article/1926. */
export const CHECKOUT_PRESETS = ['Gather used towels', 'Throw rubbish away', 'Turn things off', 'Lock up', 'Return keys']
export function TaskList({ value, onChange, disabled }: { value: string; onChange?: (v: string) => void; disabled?: boolean }) {
  const tasks = value.split('\n').filter(Boolean).map((l) => { const [n, ...d] = l.split(' | '); return { name: n.trim(), details: d.join(' | ').trim() } })
  const out = (ts: typeof tasks) => onChange?.(ts.map((x) => (x.details ? `${x.name} | ${x.details}` : x.name)).join('\n'))
  const next = CHECKOUT_PRESETS.find((p) => !tasks.some((x) => x.name === p))
  return (
    <div className={cx('h-tasks', tasks.length === 0 && 'h-tasks--empty', disabled && 'is-disabled')}>
      {tasks.map((x, i) => (
        <div key={x.name + i} className="h-tasks__row">
          <span className="h-tasks__name">{x.name}</span>
          <input className="h-input" value={x.details} placeholder="Add optional task details..." disabled={disabled} aria-label={`${x.name} details`}
            onChange={(e) => out(tasks.map((y, k) => (k === i ? { ...y, details: e.target.value } : y)))} />
          {!disabled && <button type="button" className="h-tasks__del" aria-label={`Remove ${x.name}`} onClick={() => out(tasks.filter((_, k) => k !== i))}><Icon name="trash" /></button>}
        </div>
      ))}
      {!disabled && next && <button type="button" className="h-textlink h-tasks__add" onClick={() => out([...tasks, { name: next, details: '' }])}><Icon name="plus" size={16} />Add task</button>}
    </div>
  )
}

/** A Guest resources link (Guidebook, Rental Agreement, Upsell — Hostaway's %shortcode% URLs). review, 3 Oct: once a
 *  URL is in, it isn't shown as a raw input any more but as an item — the link, with Copy, Edit and Remove. Empty, or
 *  being edited, it's the input (placeholder "Your guidebook URL", as in the product). Read-only (Uses the Base / Show
 *  visibility / Autopilot): the item with Copy only. Edits write through `onChange` like typing (the section's draft). */
export function LinkField({ value, onChange, disabled, label, placeholder, inputRef }: {
  value: string; onChange?: (v: string) => void; disabled?: boolean; label: string; placeholder?: string; inputRef?: Ref<HTMLInputElement>
}) {
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const start = useRef(value)
  const own = useRef<HTMLInputElement | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => { if (editing) own.current?.focus() }, [editing])
  const setRef = (el: HTMLInputElement | null) => {
    own.current = el
    if (typeof inputRef === 'function') inputRef(el); else if (inputRef) (inputRef as { current: HTMLInputElement | null }).current = el
  }
  const url = value.trim()
  if (!url || (editing && !disabled)) return (
    <input ref={setRef} className="h-input" type="url" value={value} placeholder={placeholder} disabled={disabled} aria-label={label}
      onFocus={() => { start.current = value; setEditing(true) }}
      onBlur={() => setEditing(false)}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() }
        else if (e.key === 'Escape') { e.preventDefault(); onChange?.(start.current); setEditing(false) }
      }} />
  )
  const pretty = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const href = /^https?:\/\//.test(url) ? url : `https://${url}`
  const copy = () => {
    const ok = () => { setCopied(true); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setCopied(false), 1800) }
    try { navigator.clipboard.writeText(url).then(ok, ok) } catch { ok() }
  }
  return (
    <div className={cx('h-linkitem', disabled && 'is-disabled')}>
      <Icon name="link" className="h-linkitem__icon" />
      {/* sample guest-resource addresses don't exist: the link shows, but opens nothing (audit, 4 Oct) */}
      <a className="h-linkitem__url" href={href} onClick={(e) => e.preventDefault()} title={url}>{pretty}</a>
      <span className="h-linkitem__actions">
        <span className="h-tooltip-anchor">
          <button type="button" className="h-linkitem__btn" aria-label={copied ? 'Copied' : `Copy ${label} link`} onClick={copy}><Icon name={copied ? 'check' : 'copy'} /></button>
          <span role="tooltip" className="h-tooltip">{copied ? 'Copied' : 'Copy link'}</span>
        </span>
        {!disabled && <>
          <span className="h-tooltip-anchor">
            <button type="button" className="h-linkitem__btn" aria-label={`Edit ${label} link`} onClick={() => { start.current = value; setEditing(true) }}><Icon name="pencil" /></button>
            <span role="tooltip" className="h-tooltip">Edit</span>
          </span>
          <span className="h-tooltip-anchor">
            <button type="button" className="h-linkitem__btn" aria-label={`Remove ${label} link`} onClick={() => onChange?.('')}><Icon name="trash" /></button>
            <span role="tooltip" className="h-tooltip">Remove</span>
          </span>
        </>}
      </span>
    </div>
  )
}

/** Help text with Hostaway's shortcodes (%guidebook%) in the brand text colour. */
export function withShortcodes(text?: string): ReactNode {
  if (!text || !text.includes('%')) return text
  return text.split(/(%[a-z_]+%)/g).map((p, i) => (/^%[a-z_]+%$/.test(p) ? <span key={i} className="h-shortcode">{p}</span> : p))
}
