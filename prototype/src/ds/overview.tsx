/* Property › Overview, the real replica (screenshots 22–27) · WS-SL.
 * CSS: ds/components.css "OVERVIEW (real replica)". Tokens only. Screens: screens/smart/PropertyOverview.tsx. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button, CloseButton, Icon, IconButton, Mark, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import type { ChannelId } from '../data/types'

/* ---------- chips + tooltip ---------- */
export type ChipTone = 'lead' | 'managed' | 'managed-full' | 'restricted' | 'grey'
/** The dark tooltip on hover and keyboard focus (screenshot 25). Put a focusable element inside `children`. */
export function Tip({ text, children }: { text: ReactNode; children: ReactNode }) {
  const id = useId()
  return (
    <span className="h-tooltip-anchor">
      {children}
      <span role="tooltip" id={id} className="h-tooltip">{text}</span>
    </span>
  )
}
/** Status chip: Lead listing (green), Partially / Fully managed (purple), Calendar / Sync restricted (orange), grey. */
export function Chip({ tone, tip, children }: { tone: ChipTone; tip?: ReactNode; children: ReactNode }) {
  const id = useId()
  if (!tip) return <span className={`h-chip h-chip--${tone}`}>{children}</span>
  return (
    <span className="h-tooltip-anchor">
      <span className={`h-chip h-chip--${tone}`} tabIndex={0} aria-describedby={id}>{children}</span>
      <span role="tooltip" id={id} className="h-tooltip">{tip}</span>
    </span>
  )
}

/* ---------- sections ---------- */
/** A setting row: title 16/500 + description 14/20 on the left, the action on the right. `field` gives the action the page's
 *  field column (--ov-field, the same width as the channel rows' status selects). */
export function OvSection({ title, desc, action, children, field, id }: {
  title: ReactNode; desc?: ReactNode; action?: ReactNode; children?: ReactNode; field?: boolean; id?: string
}) {
  return (
    <section className={cx('h-ov-sec', field && 'h-ov-sec--field')} id={id}>
      <div><h2 className="h-ov-sec__title">{title}</h2>{desc && <p className="h-ov-sec__desc">{desc}</p>}</div>
      {action && <div className="h-ov-sec__action">{action}</div>}
      {children && <div className="h-ov-sec__body">{children}</div>}
    </section>
  )
}

/** Quiet copy feedback: the link reads "Copied" with a check for a moment. */
export function useCopy(): [string | null, (key: string, text: string) => void] {
  const [done, setDone] = useState<string | null>(null)
  const t = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(t.current), [])
  const copy = (key: string, text: string) => {
    const ok = () => { setDone(key); window.clearTimeout(t.current); t.current = window.setTimeout(() => setDone(null), 1800) }
    try { navigator.clipboard.writeText(text).then(ok, ok) } catch { ok() }
  }
  return [done, copy]
}
/** A black underlined action link ("Copy ID", "Copy iCal link") that confirms quietly. */
export function CopyLink({ label, done, onCopy }: { label: string; done: boolean; onCopy: () => void }) {
  return (
    <button type="button" className={cx('h-textlink', done && 'is-done')} onClick={onCopy} aria-live="polite">
      {done ? <><Icon name="check" size={16} />Copied</> : label}
    </button>
  )
}

/* ---------- status select ---------- */
/** Listed / Unlisted select (screenshots 22–23): the menu holds the one action, "Publish listing" or "Unlist listing". */
export function StatusSelect({ listed, onChange, label }: { listed: boolean; onChange: (listed: boolean) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const mobile = useIsMobile()
  const [hi, setHi] = useState(false) // the one row is highlighted on hover or from the keyboard (the Dropdown's rows)
  const wrap = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open || mobile) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open, mobile])
  const act = () => { onChange(!listed); setOpen(false) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false) }
    else if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setHi(true); setOpen(true) }
    else if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setHi(true) }
    else if (open && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); act() }
    else if (e.key === 'Tab') setOpen(false)
  }
  return (
    <div className={cx('h-dropdown h-ov-status', open && 'is-open', !listed && 'is-unlisted')} ref={wrap}>
      <button type="button" className="h-dropdown__trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-label={`${label}: ${listed ? 'Listed' : 'Unlisted'}`}
        onClick={() => { setHi(false); setOpen(!open) }} onKeyDown={onKey}>
        <Icon name={listed ? 'eye' : 'eye-off'} />
        {/* the hint drops when the select is narrower than the full sentence (container query in components.css) */}
        <span className="h-dropdown__value">{listed ? 'Listed' : 'Unlisted'}<span className="h-ov-status__hint">{listed ? ' - Guests can search and book' : ' - Guests can’t search or book'}</span></span>
        <Icon name="chevron-down" />
      </button>
      {open && mobile && (
        <BottomSheet open title={label} onClose={() => setOpen(false)} className="h-m-optsheet">
          <ul className="h-m-optsheet__list" role="listbox" aria-label={label}>
            <li role="option" aria-selected={false}><button type="button" className="h-m-optsheet__row" onClick={act}><span>{listed ? 'Unlist listing' : 'Publish listing'}</span></button></li>
          </ul>
        </BottomSheet>
      )}
      {open && !mobile && (
        <ul className="h-dropdown__menu" role="listbox" id={id} aria-label={label}>
          <li role="option" aria-selected={false} className={cx('h-dropdown__option', hi && 'is-hi')} onMouseEnter={() => setHi(true)} onMouseLeave={() => setHi(false)} onMouseDown={(e) => e.preventDefault()} onClick={act}>
            {listed ? 'Unlist listing' : 'Publish listing'}
          </li>
        </ul>
      )}
    </div>
  )
}

/* ---------- connected channel row ---------- */
export function ListingRow({ channel, photo, title, meta, chips, status }: {
  channel: ChannelId; photo: string; title: string; meta: ReactNode; chips?: ReactNode; status: ReactNode
}) {
  return (
    <div className="h-ov-listing">
      <img className="h-ov-listing__thumb" src={photo} alt="" />
      <div className="h-ov-listing__main">
        <div className="h-ov-listing__title"><Mark channel={channel} /><span>{title}</span></div>
        <div className="h-ov-listing__meta">{meta}{chips}</div>
      </div>
      {status}
    </div>
  )
}
/** Host line in a listing row: a small avatar with initials (in the account's own colour when `tone` is given), then the name. */
export function HostLine({ name, tone }: { name: string; tone?: 'dana' | 'callum' | 'marta' | 'priya' }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('')
  return <span className="h-ov-host"><span className={cx('h-avatar', tone && `h-avatar--account h-avatar--${tone}`)} aria-hidden="true">{initials}</span>{name}</span>
}

/* ---------- opportunities accordion ---------- */
export interface Opportunity { id: string; channel: ChannelId; title: string; desc: ReactNode; outcome: [string, string]; onSetUp: () => void }
/** "N opportunities available" (screenshots 26–27): collapsed = one row; open = each opportunity with Set up and ×. */
export function Opportunities({ items, open, onToggle, onDismiss, shown = 2 }: {
  items: Opportunity[]; open: boolean; onToggle: () => void; onDismiss: (id: string) => void; shown?: number
}) {
  const [all, setAll] = useState(false)
  const id = useId()
  if (!items.length) return null
  const list = all ? items : items.slice(0, shown)
  return (
    <section className={cx('h-opps', open && 'is-open')} id="opportunities" aria-label="Opportunities">
      <button type="button" className="h-opps__head" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        {items.length} {items.length === 1 ? 'opportunity' : 'opportunities'} available<Icon name="chevron-down" />
      </button>
      {open && (
        <div className="h-opps__body" id={id}>
          {list.map((o) => (
            <div key={o.id} className="h-opp">
              <Mark channel={o.channel} />
              <div>
                <h3 className="h-opp__title">{o.title}</h3>
                <p className="h-opp__desc">{o.desc}</p>
              </div>
              <div className="h-opp__side">
                <span className="h-opp__outcome">{o.outcome[0]} → {o.outcome[1]}</span>
                <Button onClick={o.onSetUp}>Set up</Button>
                <CloseButton label={`Dismiss ${o.title}`} onClick={() => onDismiss(o.id)} />
              </div>
            </div>
          ))}
          {items.length > shown && !all && (
            <div className="h-opps__foot"><button type="button" className="h-textlink" onClick={() => setAll(true)}>See more opportunities</button></div>
          )}
        </div>
      )}
    </section>
  )
}

/* ---------- dialog + small menu (QA B15, B25) ---------- */
/** Centred dialog for a consequential setting (Unlist listing, Add External iCal, Turn off Smart Listings). Esc and the scrim close it.
 *  Phones (≤ 767px): a bottom sheet with the actions in its footer (ds/mobile.md §7). */
export function OvDialog({ title, onClose, children, foot }: { title: string; onClose: () => void; children: ReactNode; foot: ReactNode }) {
  const mobile = useIsMobile()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (mobile) return
    ref.current?.querySelector<HTMLElement>('input, select, textarea, .h-modal__foot .h-btn')?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [mobile, onClose])
  if (mobile) return <BottomSheet open title={title} onClose={onClose} footer={foot}><div className="h-ov-dialog__body">{children}</div></BottomSheet>
  return (
    <div className="h-scrim h-scrim--fixed" onClick={onClose}>
      <div className="h-modal h-ov-dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref} onClick={(e) => e.stopPropagation()}>
        <h2 className="h-modal__title">{title}</h2>
        <CloseButton className="h-modal__close" onClick={onClose} />
        <div className="h-ov-dialog__body">{children}</div>
        <div className="h-modal__foot">{foot}</div>
      </div>
    </div>
  )
}

/** "···" button with a short menu of actions under it (Export calendar › More options). */
/** Phones (ds/mobile.md §7, mobile pass 3 Oct): the same actions as an action sheet from the bottom (iOS / Material
 *  pattern), not a dropdown that can open off-screen beside a left-aligned ⋯ (Strategy rows). Title = what the
 *  menu acts on ("More actions for Airbnb" → "Airbnb"); Delete / Remove read as destructive. */
export function OvMenu({ label, items }: { label: string; items: Array<{ label: string; onSelect: () => void }> }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  useEffect(() => {
    if (!open || mobile) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open, mobile])
  // ↑ ↓ Home End move between the actions; ↓ on the closed trigger opens on the first (Esc closes, above)
  const moveFocus = (e: React.KeyboardEvent) => {
    const items = [...(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    if (!items.length) return
    const at = items.indexOf(document.activeElement as HTMLElement)
    const to = e.key === 'ArrowDown' ? (at + 1) % items.length : e.key === 'ArrowUp' ? (at <= 0 ? items.length - 1 : at - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -1
    if (to < 0) return
    e.preventDefault()
    items[to].focus()
  }
  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' || open) return
    e.preventDefault(); setOpen(true)
    requestAnimationFrame(() => wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus())
  }
  return (
    <div className="h-ov-menu" ref={wrap} onKeyDown={(e) => { if (open) moveFocus(e) }}>
      <IconButton icon="dots" label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={onTriggerKey} />
      {mobile ? (
        // React events bubble out of the portal through this wrapper: stop them so a row's own onClick doesn't fire
        <span className="h-ov-menu__sheet" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <BottomSheet open={open} title={label.replace(/^More (actions )?for /, '')} label={label} onClose={() => setOpen(false)}>
            <ul className="h-m-menu" role="menu" aria-label={label}>
              {items.map((i) => (
                <li key={i.label} role="none"><button type="button" role="menuitem" className={cx('h-m-menu__item h-ov-menu__sheetitem', /^(Delete|Remove)\b/.test(i.label) && 'is-danger')}
                  onClick={() => { setOpen(false); i.onSelect() }}>{i.label}</button></li>
              ))}
            </ul>
          </BottomSheet>
        </span>
      ) : open && (
        <ul className="h-menu h-ov-menu__list" role="menu" aria-label={label}>
          {items.map((i) => (
            <li key={i.label} role="none"><button type="button" role="menuitem" className="h-menu__item h-ov-menu__item" onClick={() => { setOpen(false); i.onSelect() }}>{i.label}</button></li>
          ))}
        </ul>
      )}
    </div>
  )
}
