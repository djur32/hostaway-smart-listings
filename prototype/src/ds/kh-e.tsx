/* Knowledge Hub iteration KH-E · design-system components (concepts/knowledge-hub/KH-E.md). Owned by the KH-E build.
 * CSS: ds/v3/kh-e.css (tokens only). The lens is a comparison over one shared Base, never navigation: these pieces only
 * show whose values you are looking at and where a value comes from.
 * Rules: captions are plain text (no logo circles); the channel Mark sits on the lens segments and in
 * headers; action links are black, underlined, medium; no change markers; the drawer slides in from the right while the
 * form column narrows in step (no separator line). */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Button, CloseButton, Icon, Mark, Toggle, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

type LensId = 'base' | ChannelId

/* ---------- lens: Base · Airbnb · Booking.com · Direct ---------- */
/** The segmented lens (Hostaway's segmented control). Base carries the stack icon; each channel its Mark. */
export function LensControl({ value, channels, onChange }: { value: LensId; channels: ChannelId[]; onChange: (v: LensId) => void }) {
  return (
    <span className="h-lens khe-lens" role="group" aria-label="Look at the values of">
      <button type="button" className="h-lens__seg" aria-pressed={value === 'base'} onClick={() => onChange('base')}><Icon name="stack-2" size={16} />Base</button>
      {channels.map((c) => (
        <button key={c} type="button" className="h-lens__seg" aria-pressed={value === c} onClick={() => onChange(c)}><Mark channel={c} />{CHANNELS[c].name}</button>
      ))}
    </span>
  )
}
/** "Show only differences" next to the lens, with the count when on. */
export function DiffToggle({ on, onChange, count }: { on: boolean; onChange: (v: boolean) => void; count?: ReactNode }) {
  return (
    <span className="khe-diff">
      <Toggle checked={on} onChange={onChange} label="Show only differences" />
      <span className="khe-diff__label" onClick={() => onChange(!on)}>Show only differences</span>
      {on && count ? <span className="khe-diff__count">{count}</span> : null}
    </span>
  )
}

/* ---------- tab bar: content types on one line (scrolls sideways), More, and one "+ Add" at the right ---------- */
export function KheTabBar({ tabs, active, onSelect, more, moreLabel = 'More', right }: {
  tabs: Array<{ id: string; label: string }>; active: string; onSelect: (id: string) => void
  more?: Array<{ id: string; label: string }>; moreLabel?: string; right?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  useOutside(wrap, open && !mobile, () => setOpen(false))
  const inMore = more?.find((m) => m.id === active)
  return (
    <div className="khe-tabbar">
      <div className="khe-tabbar__scroll h-scroll-thin" role="tablist" aria-label="Content types">
        {tabs.map((t) => <button key={t.id} type="button" role="tab" className="h-tab" aria-selected={t.id === active} onClick={() => onSelect(t.id)}>{t.label}</button>)}
      </div>
      {more && more.length > 0 && (
        <div className="khe-more" ref={wrap}>
          <button type="button" className="h-tab khe-more__trigger" aria-selected={!!inMore} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {inMore ? inMore.label : moreLabel}<Icon name="chevron-down" size={16} />
          </button>
          {open && !mobile && (
            <div className="khe-menu khe-more__menu" role="menu">
              {more.map((m) => <button key={m.id} type="button" role="menuitemradio" aria-checked={m.id === active} className="khe-menu__item khe-menu__item--plain" onClick={() => { setOpen(false); onSelect(m.id) }}>{m.label}</button>)}
            </div>
          )}
          {mobile && (
            <BottomSheet open={open} title={moreLabel} onClose={() => setOpen(false)}>
              <div className="khe-menu khe-menu--sheet" role="menu">
                {more.map((m) => <button key={m.id} type="button" role="menuitemradio" aria-checked={m.id === active} className="khe-menu__item khe-menu__item--plain" onClick={() => { setOpen(false); onSelect(m.id) }}>{m.label}{m.id === active && <Icon name="check" size={18} />}</button>)}
              </div>
            </BottomSheet>
          )}
        </div>
      )}
      {right && <div className="khe-tabbar__right">{right}</div>}
    </div>
  )
}

/* ---------- one field: label + help, control, caption row (scope left, one action right) ---------- */
export function KheField({ dataKey, label, help, children, caption, action, below, raised }: {
  dataKey?: string; label?: ReactNode; help?: ReactNode; children: ReactNode; caption?: ReactNode; action?: ReactNode; below?: ReactNode
  /** A hover card is open inside: lift the row above its neighbours. */
  raised?: boolean
}) {
  return (
    <div className={cx('khe-field', raised && 'is-raised')} data-khe-key={dataKey}>
      {(label || help) && <div className="khe-field__head">{label && <p className="khe-field__label">{label}</p>}{help && <p className="khe-field__help">{help}</p>}</div>}
      <div className="khe-field__control">{children}</div>
      {(caption || action) && <div className="khe-caption">{caption && <span className="khe-caption__scope">{caption}</span>}{action && <span className="khe-caption__action">{action}</span>}</div>}
      {below}
    </div>
  )
}
/** The caption's text: an icon (ⓘ, or a lock for values the channel owns) and plain-text parts. */
export function KheScope({ lock, children }: { lock?: boolean; children: ReactNode }) {
  return <span className="khe-scope"><Icon name={lock ? 'lock' : 'info-circle'} />{children}</span>
}
export const Dot = () => <span className="khe-scope__dot" aria-hidden="true">·</span>
/** Two fields on one row (Wifi name · Wifi password). */
export function KhePair({ children }: { children: ReactNode }) {
  return <div className="khe-pair">{children}</div>
}

/* ---------- the hover card: the Base and the channel's own value side by side ---------- */
export interface LensHoverBlock { who: LensId; sub?: ReactNode; value: ReactNode; used?: boolean }
/** Wraps a caption part ("Airbnb has its own"); hover or focus opens the card. One card open at a time (the row lifts). */
export function LensHover({ children, title, meta, blocks, actions, defaultOpen, onOpenChange }: {
  children: ReactNode; title: ReactNode; meta?: ReactNode; blocks: LensHoverBlock[]; actions?: ReactNode; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpenState] = useState(!!defaultOpen)
  const setOpen = (v: boolean) => { setOpenState(v); onOpenChange?.(v) }
  const id = useId()
  const t = useRef<number | undefined>(undefined)
  const show = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(false), 120) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  const mobile = useIsMobile()
  /* phones: no hover; tapping the caption opens the same card as a bottom sheet (ds/mobile.md §7) */
  if (mobile) return (
    <span className="khe-hover">
      <button type="button" className={cx('khe-hover__trigger khe-hover__trigger--tap', open && 'is-open')} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>{children}</button>
      <BottomSheet open={open} title={title} onClose={() => setOpen(false)}>
        <span className="khe-hover__card khe-hover__card--sheet">
          {meta && <span className="khe-hover__meta">{meta}</span>}
          {blocks.map((b) => (
            <span key={b.who} className={cx('khe-hover__block', b.who === 'base' ? 'is-base' : 'is-channel')}>
              <span className="khe-hover__who">
                {b.who === 'base' ? <><Icon name="stack-2" size={16} /><b>Base</b></> : <><Mark channel={b.who} /><b>{CHANNELS[b.who].name}</b></>}
                {b.sub && <span className="khe-hover__sub">· {b.sub}</span>}
              </span>
              <span className="khe-hover__value">{b.value}</span>
            </span>
          ))}
          {actions && <span className="khe-hover__actions" onClick={() => setOpen(false)}>{actions}</span>}
        </span>
      </BottomSheet>
    </span>
  )
  return (
    <span className="khe-hover" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <span className={cx('khe-hover__trigger', open && 'is-open')} tabIndex={0} aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span className="khe-hover__card" role="tooltip" id={id}>
          <span className="khe-hover__head"><span className="khe-hover__title">{title}</span>{meta && <span className="khe-hover__meta">{meta}</span>}</span>
          {blocks.map((b) => (
            <span key={b.who} className={cx('khe-hover__block', b.who === 'base' ? 'is-base' : 'is-channel')}>
              <span className="khe-hover__who">
                {b.who === 'base' ? <><Icon name="stack-2" size={16} /><b>Base</b></> : <><Mark channel={b.who} /><b>{CHANNELS[b.who].name}</b></>}
                {b.sub && <span className="khe-hover__sub">· {b.sub}</span>}
              </span>
              <span className="khe-hover__value">{b.value}</span>
            </span>
          ))}
          {actions && <span className="khe-hover__actions">{actions}</span>}
        </span>
      )}
    </span>
  )
}

/* ---------- folded lines, empty state, confirm ---------- */
/** "5 fields use the Base on Airbnb: … · Show them" / "1 field doesn't exist on Booking.com: …". */
export function FoldedLine({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="khe-fold"><Icon name="circle-dashed" /><span className="khe-fold__text">{children}</span>{action && <span className="khe-fold__action">{action}</span>}</div>
}
/** Nothing differs under this lens: say so, with the values in one line and where others differ. */
export function NoDiff({ title, summary, elsewhere, action }: { title: ReactNode; summary?: ReactNode; elsewhere?: ReactNode; action?: ReactNode }) {
  return (
    <section className="khe-nodiff" role="status">
      <Icon name="circle-check" size={24} />
      <h3 className="khe-nodiff__title">{title}</h3>
      {summary && <p className="khe-nodiff__summary">{summary}</p>}
      {elsewhere && <p className="khe-nodiff__elsewhere">{elsewhere}</p>}
      {action && <p className="khe-nodiff__action">{action}</p>}
    </section>
  )
}
/** Going back to the Base when the texts differ: one inline question under the caption. */
export function KheConfirm({ text, confirmLabel, onConfirm, onCancel }: { text: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="khe-confirm" role="alertdialog" aria-label={confirmLabel}>
      <span className="khe-confirm__text">{text}</span>
      <Button onClick={onCancel}>Cancel</Button><Button kind="primary" onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  )
}

/* ---------- amenities under a lens ---------- */
/** One amenity: listed (tick), missing (struck out, "Add for X"), renamed, no equivalent, only on X. */
export function KheAmenityRow({ name, has, sub, right }: { name: string; has: boolean; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className={cx('khe-amenity', !has && 'is-missing')}>
      <span className="khe-amenity__icon">{has ? <Icon name="check" size={18} /> : <Icon name="x" size={16} />}</span>
      <span className="khe-amenity__main"><span className="khe-amenity__name">{has ? name : <del>{name}</del>}</span>{sub && <span className="khe-amenity__sub">{sub}</span>}</span>
      {right && <span className="khe-amenity__right">{right}</span>}
    </div>
  )
}
export function KheSummary({ children }: { children: ReactNode }) {
  return <p className="khe-summary"><Icon name="info-circle" />{children}</p>
}

/* ---------- Guest checkout tasks (Hostaway HS-A02/A03, Paper KH-E1): a bordered list, drag grip, edit, "+ Add task" ---------- */
export interface KheTask { name: string; details: string }
export function KheTaskList({ tasks, disabled, onChange, presets = [] }: { tasks: KheTask[]; disabled?: boolean; onChange?: (t: KheTask[]) => void; presets?: string[] }) {
  const [editing, setEditing] = useState<number | null>(null)
  const next = presets.find((p) => !tasks.some((x) => x.name === p))
  const set = (i: number, patch: Partial<KheTask>) => onChange?.(tasks.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  return (
    <div className={cx('khe-tasks', disabled && 'is-disabled')}>
      {tasks.map((x, i) => (
        <div key={i} className="khe-tasks__row">
          <Icon name="grip-vertical" size={16} className="khe-tasks__grip" />
          {editing === i && !disabled ? (
            <span className="khe-tasks__edit">
              <input className="h-input" value={x.name} aria-label="Task" onChange={(e) => set(i, { name: e.target.value })} />
              <input className="h-input" value={x.details} placeholder="Add optional task details..." aria-label={`${x.name} details`} onChange={(e) => set(i, { details: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(null) }} />
            </span>
          ) : (
            <span className="khe-tasks__text"><b>{x.name}</b>{x.details && <span>{x.details}</span>}</span>
          )}
          {!disabled && (
            <span className="khe-tasks__acts">
              {editing === i
                ? <button type="button" className="h-btn-icon" aria-label={`Remove ${x.name}`} onClick={() => { setEditing(null); onChange?.(tasks.filter((_, k) => k !== i)) }}><Icon name="trash" size={16} /></button>
                : null}
              <button type="button" className="h-btn-icon" aria-label={editing === i ? 'Done' : `Edit ${x.name}`} onClick={() => setEditing(editing === i ? null : i)}><Icon name={editing === i ? 'check' : 'pencil'} size={16} /></button>
            </span>
          )}
        </div>
      ))}
      {!disabled && (
        <div className="khe-tasks__add">
          <button type="button" className="h-textlink" onClick={() => { onChange?.([...tasks, { name: next ?? 'New task', details: '' }]); setEditing(tasks.length) }}><Icon name="plus" size={16} />Add task</button>
        </div>
      )}
    </div>
  )
}

/** A password field: masked, with the eye to show it (fixes HS-46's plain-text password). */
export function SecretInput({ value, disabled, onChange, label }: { value: string; disabled?: boolean; onChange?: (v: string) => void; label: string }) {
  const [shown, setShown] = useState(false)
  return (
    <span className={cx('khe-secret', disabled && 'is-disabled')}>
      <input className="h-input" type={shown ? 'text' : 'password'} value={value} disabled={disabled} aria-label={label} onChange={(e) => onChange?.(e.target.value)} />
      <button type="button" className="h-btn-icon khe-secret__eye" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown(!shown)}><Icon name={shown ? 'eye-off' : 'eye'} size={18} /></button>
    </span>
  )
}

/* ---------- "+ Add": one menu, pre-scoped to the tab and the lens ---------- */
export interface AddMenuItem { id: string; icon: string; label: string; sub?: ReactNode; channel?: ChannelId }
export function AddMenu({ groups, footer, onPick, defaultOpen }: {
  groups: Array<{ title: string; items: AddMenuItem[] }>; footer?: ReactNode; onPick: (id: string) => void; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [hi, setHi] = useState<string | null>(groups[0]?.items[0]?.id ?? null)
  const wrap = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  useOutside(wrap, open && !mobile, () => setOpen(false))
  useEffect(() => { if (defaultOpen) setOpen(true) }, [defaultOpen])
  /* phones: the menu is a bottom sheet (types for this tab first, the scope line at the end) */
  if (mobile) return (
    <div className="khe-add" ref={wrap}>
      <Button icon="plus" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>Add</Button>
      <BottomSheet open={open} title="Add" onClose={() => setOpen(false)}>
        <div className="khe-menu khe-menu--sheet" role="menu">
          {groups.filter((g) => g.items.length).map((g, gi) => (
            <div key={g.title} className={cx('khe-menu__group', gi > 0 && 'has-rule')}>
              {groups.filter((x) => x.items.length).length > 1 && <p className="khe-menu__title">{g.title}</p>}
              {g.items.map((i) => (
                <button key={i.id} type="button" role="menuitem" className="khe-menu__item" onClick={() => { setOpen(false); onPick(i.id) }}>
                  <Icon name={i.icon} size={18} />
                  <span className="khe-menu__text"><span>{i.label}</span>{i.sub && <small>{i.sub}</small>}</span>
                  {i.channel && <Mark channel={i.channel} />}
                </button>
              ))}
            </div>
          ))}
          {footer && <div className="khe-menu__foot">{footer}</div>}
        </div>
      </BottomSheet>
    </div>
  )
  return (
    <div className="khe-add" ref={wrap}>
      <Button icon="plus" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
        Add<Icon name="chevron-down" size={16} />
      </Button>
      {open && (
        <div className="khe-menu khe-add__menu" role="menu">
          {groups.filter((g) => g.items.length).map((g, gi) => (
            <div key={g.title} className={cx('khe-menu__group', gi > 0 && 'has-rule')}>
              <p className="khe-menu__title">{g.title}</p>
              {g.items.map((i) => (
                <button key={i.id} type="button" role="menuitem" className={cx('khe-menu__item', hi === i.id && 'is-hi')} onMouseEnter={() => setHi(i.id)}
                  onClick={() => { setOpen(false); onPick(i.id) }}>
                  <Icon name={i.icon} size={18} />
                  <span className="khe-menu__text"><span>{i.label}</span>{i.sub && <small>{i.sub}</small>}</span>
                  {i.channel && <Mark channel={i.channel} />}
                </button>
              ))}
            </div>
          ))}
          {footer && <div className="khe-menu__foot">{footer}</div>}
        </div>
      )}
    </div>
  )
}
/** The new item, inline at the top of the form: its fields, the scope it adds for, Cancel / Add. */
export function AddComposer({ title, scope, children, onCancel, onAdd, addDisabled }: {
  title: ReactNode; scope: ReactNode; children: ReactNode; onCancel: () => void; onAdd: () => void; addDisabled?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => { ref.current?.scrollIntoView({ block: 'nearest' }); ref.current?.querySelector<HTMLElement>('input, textarea, button.h-dropdown__trigger')?.focus() }, [])
  return (
    <section className="khe-composer" ref={ref} aria-label={typeof title === 'string' ? title : 'New item'}>
      <h3 className="khe-composer__title">{title}</h3>
      <div className="khe-composer__body">{children}</div>
      <div className="khe-composer__foot"><span className="khe-composer__scope">{scope}</span><Button onClick={onCancel}>Cancel</Button><Button kind="primary" disabled={addDisabled} onClick={onAdd}>Add</Button></div>
    </section>
  )
}

/* ---------- the drawer (Ask · Sources): slides in from the right; the form column narrows in step ---------- */
const DRAWER_MS = 240 // --dur-drawer
export function KheBody({ main, drawer, sheetTitle = 'Ask the AI', onClose }: {
  main: ReactNode; drawer?: ReactNode
  /** Phones: the drawer is a bottom sheet with this title; `onClose` is its × and scrim. */
  sheetTitle?: string; onClose?: () => void
}) {
  const mobile = useIsMobile()
  const open = !!drawer
  const last = useRef<ReactNode>(drawer)
  if (drawer) last.current = drawer
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(open)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(r)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), DRAWER_MS)
    return () => clearTimeout(t)
  }, [open])
  if (mobile) return (
    <div className="khe-body khe-body--phone">
      <div className="khe-body__main">{main}</div>
      <BottomSheet open={open} title={sheetTitle} onClose={() => onClose?.()}><div className="khe-sheetdrawer">{open ? drawer : last.current}</div></BottomSheet>
    </div>
  )
  return (
    <div className={cx('khe-body', shown && 'is-open')}>
      <div className="khe-body__main h-scroll-thin">{main}</div>
      <div className="khe-body__side" aria-hidden={!open}>{mounted ? <div className="khe-body__drawer h-scroll-thin">{open ? drawer : last.current}</div> : null}</div>
    </div>
  )
}
export type DrawerTab = 'ask' | 'sources'
export function KheDrawer({ tab, onTab, onClose, children }: { tab: DrawerTab; onTab: (t: DrawerTab) => void; onClose: () => void; children: ReactNode }) {
  return (
    <aside className="khe-drawer" aria-label={tab === 'ask' ? 'Ask the AI' : 'Sources'}>
      <div className="khe-drawer__head">
        <span className="h-lens khe-drawer__tabs" role="tablist" aria-label="Ask or Sources">
          <button type="button" role="tab" className="h-lens__seg" aria-pressed={tab === 'ask'} aria-selected={tab === 'ask'} onClick={() => onTab('ask')}>Ask</button>
          <button type="button" role="tab" className="h-lens__seg" aria-pressed={tab === 'sources'} aria-selected={tab === 'sources'} onClick={() => onTab('sources')}>Sources</button>
        </span>
        <CloseButton onClick={onClose} />
      </div>
      <div className="khe-drawer__body">{children}</div>
    </aside>
  )
}
export function DrawerLead({ children }: { children: ReactNode }) {
  return <p className="khe-drawer__lead">{children}</p>
}

/* ---------- Sources ---------- */
export function SourceCard({ icon, name, sub, when, facts, menu }: { icon: string; name: string; sub: ReactNode; when: string; facts: string; menu?: Array<{ label: string; onClick: () => void }> }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useOutside(wrap, open, () => setOpen(false))
  return (
    <div className="khe-source">
      <span className="khe-source__icon"><Icon name={icon} size={18} /></span>
      <span className="khe-source__main">
        <b>{name}</b><span>{sub}</span>
        <span className="khe-source__meta">{when}<span aria-hidden="true">·</span>{facts}</span>
      </span>
      {menu && (
        <div className="khe-source__more" ref={wrap}>
          <button type="button" className="h-btn-icon" aria-label={`More for ${name}`} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="dots" /></button>
          {open && <div className="khe-menu khe-source__menu" role="menu">{menu.map((m) => <button key={m.label} type="button" role="menuitem" className="khe-menu__item khe-menu__item--plain" onClick={() => { setOpen(false); m.onClick() }}>{m.label}</button>)}</div>}
        </div>
      )}
    </div>
  )
}

/* ---------- Ask ---------- */
/** Hostaway's dropdown (bordered trigger, menu below) whose options carry the channel Mark: "Answer as (●) Booking.com guest". */
export function ChannelSelect({ value, channels, onChange, suffix, label }: { value: ChannelId; channels: ChannelId[]; onChange: (c: ChannelId) => void; suffix?: string; label: string }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useOutside(wrap, open, () => setOpen(false))
  const item = (c: ChannelId) => <><Mark channel={c} /><span className="khe-chsel__name">{CHANNELS[c].name}</span>{suffix && <span className="khe-chsel__suffix">{suffix}</span>}</>
  return (
    <div className={cx('h-dropdown', open && 'is-open')} ref={wrap}>
      <button type="button" className="h-dropdown__trigger khe-chsel" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
        <span className="h-dropdown__value khe-chsel__value">{item(value)}</span><Icon name="chevron-down" />
      </button>
      {open && (
        <ul className="h-dropdown__menu" role="listbox" aria-label={label}>
          {channels.map((c) => (
            <li key={c} role="option" aria-selected={c === value} className="h-dropdown__option khe-chsel__option" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(c); setOpen(false) }}>{item(c)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
export function AskBubble({ children }: { children: ReactNode }) {
  return <p className="khe-bubble">{children}</p>
}
/** The AI's reply, as a guest of one channel: the answer, the facts it used, and how another channel's guest would hear it. */
export function AskReply({ channel, children, facts, compare }: { channel: ChannelId; children: ReactNode; facts: Array<{ label: ReactNode; origin: ReactNode }>; compare?: ReactNode }) {
  return (
    <section className="khe-reply" aria-live="polite">
      <p className="khe-reply__who"><Icon name="sparkles" size={16} />AI reply · as {channel === 'airbnb' ? 'an' : 'a'} {CHANNELS[channel].name} guest</p>
      <p className="khe-reply__text">{children}</p>
      {facts.length > 0 && (
        <div className="khe-reply__facts">
          <p className="khe-reply__factstitle">Used {facts.length} {facts.length === 1 ? 'fact' : 'facts'}</p>
          {facts.map((f, i) => <span key={i} className="khe-reply__fact"><Icon name="file-text" size={16} /><b>{f.label}</b><span>{f.origin}</span></span>)}
        </div>
      )}
      {compare && <div className="khe-reply__compare">{compare}</div>}
    </section>
  )
}
export function AskList({ title, items, onPick }: { title: string; items: Array<{ id: string; q: string }>; onPick: (id: string) => void }) {
  return (
    <div className="khe-often">
      <p className="khe-often__title">{title}</p>
      {items.map((i) => <button key={i.id} type="button" className="khe-often__q" onClick={() => onPick(i.id)}>{i.q}<Icon name="arrow-right" size={16} /></button>)}
    </div>
  )
}
export function AskInput({ onAsk }: { onAsk: (q: string) => void }) {
  const [v, setV] = useState('')
  const send = () => { if (v.trim()) { onAsk(v.trim()); setV('') } }
  return (
    <span className="khe-askin">
      <input className="h-input" value={v} placeholder="Ask a question a guest might ask…" aria-label="Ask a question a guest might ask" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
      <button type="button" className="h-btn-icon" aria-label="Ask" onClick={send}><Icon name="send" size={18} /></button>
    </span>
  )
}

function useOutside(ref: React.RefObject<HTMLElement | null>, active: boolean, close: () => void) {
  useEffect(() => {
    if (!active) return
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps
}
