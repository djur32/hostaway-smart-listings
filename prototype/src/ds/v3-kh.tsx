/* Smart Listing v3 · WS-KH design-system additions (CSS in ds/v3/kh.css). Screens import from '../../ds'.
 * Knowledge Hub (KH2: one place for everything about the property): KhNav, KhField, KhScopeText, KhSplit/KhSplitRow
 * (Hospitable's "Edit per channel" inline split, HS-L03), KhTasks (checkout tasks, HS-A03), KhHelp (%shortcode% help,
 * HS-A03), KhAmenity, KhChannelLine, KhFlag, KhFromTip, KhConfirmItem, KhDialog, KhSheet, KhSec.
 * Review & push: KhPushGroup, KhKeep, KhReceipt, KhPushBar, KhToast. Tokens only, no one-off styles. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CloseButton, Icon, Segmented, Mark, cx } from './primitives'
import { ChannelBadge, Dropdown } from './fieldscope'
import { BottomSheet, useIsMobile } from './mobile'
import { Toast } from './toast'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

const names = (cs: ChannelId[]) => {
  const n = cs.map((c) => CHANNELS[c].name)
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}

/* ---------- section list ---------- */
export function KhNav({ items, active, onSelect }: { items: Array<{ id: string; label: string; count?: number }>; active: string; onSelect: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null)
  // phones: the list is a sideways row (kh.css); keep the current section's pill in view without scrolling the page
  useEffect(() => {
    const rail = ref.current, cur = rail?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!rail || !cur || rail.scrollWidth <= rail.clientWidth) return
    const r = rail.getBoundingClientRect(), t = cur.getBoundingClientRect()
    if (t.left < r.left) rail.scrollLeft += t.left - r.left - 16
    else if (t.right > r.right) rail.scrollLeft += t.right - r.right + 16
  }, [active])
  return (
    <nav className="h-khnav" aria-label="Knowledge Hub sections" ref={ref}>
      {items.map((i) => (
        <button key={i.id} type="button" className="h-khnav__item" aria-current={i.id === active ? 'page' : undefined} onClick={() => onSelect(i.id)}>
          <span className="h-khnav__label">{i.label}</span>
          {i.count !== undefined && <span className="h-khnav__count">{i.count}</span>}
        </button>
      ))}
    </nav>
  )
}

/* ---------- one stacked field (same anatomy as SettingRow: label + help, control, caption row) ---------- */
export function KhField({ label, marker, help, children, caption, action, below, dataKey }: {
  label: ReactNode; marker?: ReactNode; help?: ReactNode; children: ReactNode
  /** Left of the caption row: where the value goes (usually <ValueHover><KhScopeText/></ValueHover>). */
  caption?: ReactNode
  /** Right of the caption row: one black, underlined, medium text link or button. */
  action?: ReactNode
  below?: ReactNode; dataKey?: string
}) {
  return (
    <div className="h-field-row h-field-row--stacked h-khfield" data-kh-key={dataKey}>
      <div className="h-field-row__head">
        <p className="h-field-row__label">{label}{marker}</p>
        {help && <p className="h-field-row__help">{help}</p>}
      </div>
      <div className="h-field-row__control">
        {children}
        {(caption || action) && (
          <div className="h-field-hint">
            <span className="h-field-hint__channels h-khscope">{caption}</span>
            {action}
          </div>
        )}
        {below}
      </div>
    </div>
  )
}

/** "ⓘ Used by all channels" · "ⓘ Used by Booking.com and Direct · (●) Airbnb has its own" · "ⓘ (●) Airbnb only" ·
 *  "ⓘ Used by Airbnb and Direct · Set by Booking.com" · "ⓘ Only your AI replies use this". */
export function KhScopeText({ uses, own = [], setBy = [], only, on, aiOnly, text }: {
  uses: ChannelId[]; own?: ChannelId[]; setBy?: ChannelId[]; only?: ChannelId; on: ChannelId[]; aiOnly?: boolean; text?: ReactNode
}) {
  let body: ReactNode
  if (text) body = text
  else if (aiOnly) body = 'Only your AI replies use this'
  else if (only) body = <><ChannelBadge channel={only} size="sm" /> only</>
  else {
    const parts: ReactNode[] = []
    if (uses.length) parts.push(<span key="u">{uses.length === on.length && on.length >= 3 ? 'Used by all channels' : `Used by ${names(uses)}`}</span>)
    if (own.length) parts.push(<span key="o" className="h-khscope__own">{own.map((c) => <ChannelBadge key={c} channel={c} size="sm" />)}{own.length === 1 ? ' has its own' : ' have their own'}</span>)
    if (setBy.length) parts.push(<span key="s">{`Set by ${names(setBy)}`}</span>)
    body = parts.flatMap((p, i) => (i ? [<span key={`d${i}`} className="h-khscope__dot">·</span>, p] : [p]))
  }
  return <span className="h-khscope__text"><Icon name="info-circle" />{body}</span>
}

/* ---------- "Edit per channel": the field splits inline into one control per channel (HS-L03) ---------- */
export function KhSplit({ children }: { children: ReactNode }) {
  return <div className="h-khsplit">{children}</div>
}
export function KhSplitRow({ channel, base, note, action, children }: {
  channel?: ChannelId; base?: boolean; note?: ReactNode; action?: ReactNode; children?: ReactNode
}) {
  return (
    <div className={cx('h-khsplit__row', !children && 'is-collapsed')}>
      <div className="h-khsplit__head">
        {base ? <span className="h-khsplit__base"><span className="h-khsplit__basecircle"><Icon name="layers-intersect" /></span>Base</span> : channel ? <ChannelBadge channel={channel} /> : null}
        {note && <span className="h-khsplit__note">{note}</span>}
        {action && <span className="h-khsplit__action">{action}</span>}
      </div>
      {children}
    </div>
  )
}

/* ---------- help text with Hospitable's highlighted %shortcode% ---------- */
export function KhHelp({ text }: { text?: string }) {
  if (!text) return null
  const parts = text.split(/(%[a-z_]+%)/g)
  return <>{parts.map((p, i) => (/^%[a-z_]+%$/.test(p) ? <span key={i} className="h-khshortcode">{p}</span> : p))}</>
}

/* ---------- Guest checkout tasks (HS-A03): task name, optional details, trash; "+ Add task" ---------- */
export interface KhTask { name: string; details: string }
export const parseTasks = (v: string): KhTask[] => v.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [n, d = ''] = l.split('|'); return { name: n.trim(), details: d.trim() } })
export const formatTasks = (t: KhTask[]) => t.map((x) => (x.details ? `${x.name} | ${x.details}` : x.name)).join('\n')
export function KhTasks({ tasks, catalog, onChange }: { tasks: KhTask[]; catalog: string[]; onChange: (t: KhTask[]) => void }) {
  const [adding, setAdding] = useState(false)
  const left = catalog.filter((c) => !tasks.some((t) => t.name === c))
  return (
    <div className="h-khtasks">
      {tasks.map((t, i) => (
        <div key={t.name} className="h-khtasks__row">
          <span className="h-khtasks__name">{t.name}</span>
          <input className="h-input" value={t.details} placeholder="Add optional task details…" aria-label={`${t.name}: details`}
            onChange={(e) => onChange(tasks.map((x, j) => (j === i ? { ...x, details: e.target.value } : x)))} />
          <button type="button" className="h-btn-icon h-khtasks__trash" aria-label={`Remove ${t.name}`} onClick={() => onChange(tasks.filter((_, j) => j !== i))}><Icon name="trash" /></button>
        </div>
      ))}
      {adding && left.length > 0 && (
        <div className="h-khtasks__row h-khtasks__row--add">
          <Dropdown label="Choose a task" placeholder="Choose a task" options={left} onChange={(v) => { onChange([...tasks, { name: v, details: '' }]); setAdding(false) }} />
          <button type="button" className="h-textlink" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
      {!adding && left.length > 0 && <button type="button" className="h-textlink h-khtasks__add" onClick={() => setAdding(true)}><Icon name="plus" />Add task</button>}
    </div>
  )
}

/* ---------- amenity: included (Base), where it shows, per-channel exceptions ---------- */
export function KhAmenity({ name, state, onToggle, scope, note, action, split }: {
  name: string; state: 'all' | 'some' | 'none'; onToggle: () => void; scope: ReactNode; note?: ReactNode; action?: ReactNode; split?: ReactNode
}) {
  return (
    <div className="h-khamenity">
      <div className="h-khamenity__row">
        <label className="h-khamenity__name">
          <input type="checkbox" className="h-checkbox" checked={state !== 'none'} onChange={onToggle} />
          <span>{name}</span>
        </label>
        <span className="h-khamenity__scope">{scope}</span>
        {action}
      </div>
      {note && <p className="h-khamenity__note">{note}</p>}
      {split}
    </div>
  )
}
export function KhChannelCheck({ channel, on, onChange }: { channel: ChannelId; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="h-khchcheck"><input type="checkbox" className="h-checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} /><ChannelBadge channel={channel} size="sm" /></label>
  )
}

/** One channel's line in a list (photos per channel, cancellation terms): badge, facts, right-hand link. */
export function KhChannelLine({ channel, children, action }: { channel: ChannelId; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="h-khchline">
      <div className="h-khchline__head"><ChannelBadge channel={channel} />{action && <span className="h-khchline__action">{action}</span>}</div>
      {children && <div className="h-khchline__body">{children}</div>}
    </div>
  )
}

/* ---------- flags and markers ---------- */
export function KhFlag({ title, sub, action, done }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; done?: boolean }) {
  return (
    <div className={cx('h-khflag', done && 'is-done')} role="status">
      <Icon name={done ? 'circle-check' : 'alert-triangle'} />
      <div className="h-khflag__text"><b>{title}</b>{sub && <span>{sub}</span>}</div>
      {action}
    </div>
  )
}
export function KhFromTip() {
  return <span className="h-fromtip" title="Added when you accepted a tip with “Push to knowledge base”"><Icon name="sparkles" />From a tip</span>
}

/* ---------- the one save confirmation: what updates, what keeps its own ---------- */
export function KhConfirmItem({ label, from, to, updates, own }: {
  label: string; from: string; to: string; updates: ChannelId[]
  own: Array<{ channel: ChannelId; toBase: boolean; onToggle: () => void }>
}) {
  return (
    <div className="h-khconfirm">
      <b className="h-khconfirm__label">{label}</b>
      <div className="h-khconfirm__diff"><del>{from}</del><ins>{to}</ins></div>
      {updates.length > 0 && <p className="h-khconfirm__line"><Icon name="check" />{names(updates)} {updates.length === 1 ? 'updates' : 'update'}</p>}
      {own.map((o) => (
        <p key={o.channel} className="h-khconfirm__line">
          <ChannelBadge channel={o.channel} size="sm" />{o.toBase ? 'will use the Base' : 'keeps its own'}
          <span className="h-khscope__dot">·</span>
          <button type="button" className="h-textlink" onClick={o.onToggle}>{o.toBase ? 'Keep its own' : 'Use the Base instead'}</button>
        </p>
      ))}
    </div>
  )
}

/* ---------- overlays ---------- */
function useEsc(onClose: () => void, on = true) {
  useEffect(() => {
    if (!on) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, on])
}
/** Centred dialog. Phones (≤ 767px): a bottom sheet with the actions in its footer (ds/mobile.md §7). */
export function KhDialog({ title, onClose, children, foot }: { title: string; onClose: () => void; children: ReactNode; foot: ReactNode }) {
  const mobile = useIsMobile()
  useEsc(onClose, !mobile)
  if (mobile) return <BottomSheet open title={title} onClose={onClose} footer={foot}><div className="h-khdialog__body">{children}</div></BottomSheet>
  return (
    <div className="h-scrim h-khscrim" onClick={onClose}>
      <div className="h-modal h-khdialog" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2 className="h-modal__title">{title}</h2>
        <CloseButton className="h-modal__close" onClick={onClose} />
        <div className="h-khdialog__body">{children}</div>
        <div className="h-modal__foot">{foot}</div>
      </div>
    </div>
  )
}
/** Right side sheet. Phones: a full-screen bottom sheet (`phone="full"`, complex edits) or a regular one (`"sheet"`). */
export function KhSheet({ title, sub, onClose, children, foot, phone = 'full' }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; phone?: 'full' | 'sheet' }) {
  const mobile = useIsMobile()
  useEsc(onClose, !mobile)
  if (mobile) return (
    <BottomSheet open title={title} onClose={onClose} footer={foot} fullScreen={phone === 'full'} label={typeof title === 'string' ? title : undefined}>
      {sub && <p className="h-khsheet__sub h-khsheet__sub--phone">{sub}</p>}
      <div className="h-khsheet__phonebody">{children}</div>
    </BottomSheet>
  )
  return (
    <>
      <div className="h-sheet-scrim" onClick={onClose} />
      <aside className="h-sheet h-khsheet" role="dialog" aria-modal="true">
        <div className="h-sheet__head"><div><h2 className="h-sheet__title">{title}</h2>{sub && <p className="h-khsheet__sub">{sub}</p>}</div><CloseButton onClick={onClose} /></div>
        <div className="h-sheet__body">{children}</div>
        {foot && <div className="h-sheet__foot">{foot}</div>}
      </aside>
    </>
  )
}
export function KhSec({ title, children }: { title: string; children: ReactNode }) {
  return <section className="h-khsec"><h3>{title}</h3>{children}</section>
}

/* ---------- Review & push ---------- */
export function KhPushGroup({ channel, meta, right, note, children }: { channel: ChannelId; meta?: ReactNode; right?: ReactNode; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="h-pushgroup" aria-label={CHANNELS[channel].name}>
      <div className="h-pushgroup__head"><Mark channel={channel} /><h2 className="h-pushgroup__title">{CHANNELS[channel].name}</h2>{meta && <span className="h-pushgroup__meta">· {meta}</span>}{right && <span className="h-pushgroup__right">{right}</span>}</div>
      <div className="h-pushgroup__body">{children}</div>
      {note && <div className="h-pushgroup__note"><Icon name="clock" />{note}</div>}
    </section>
  )
}
export type KeepState = 'keep' | 'dismiss'
export function KhKeep({ value, onChange }: { value: KeepState; onChange: (v: KeepState) => void }) {
  return <span className="h-keep"><Segmented label="Keep or dismiss" value={value} onChange={onChange} items={[{ id: 'keep', label: 'Keep' }, { id: 'dismiss', label: 'Dismiss' }]} /></span>
}
export function KhReceipt({ section, what, origin, diff, state, note, time }: { section: string; what: string; origin?: string; diff?: ReactNode; state: 'live' | 'review' | 'sending'; note: string; time: string }) {
  const label = { live: 'Live', review: 'In review', sending: 'Sending' }[state]
  return (
    <div className="h-receipt">
      <span className="h-pill h-pill--neutral">{section}</span>
      <span className="h-receipt__what"><b>{what}</b>{origin && <span className="h-small h-muted">{origin}</span>}{diff}</span>
      <span className="h-receipt__status"><span className={cx('h-receipt__state', `h-receipt__state--${state}`)}>{label}</span><small>{note}</small></span>
      <span className="h-receipt__time">{time}</span>
    </div>
  )
}
export function KhPushBar({ text, children }: { text?: ReactNode; children: ReactNode }) {
  return <div className="h-pushbar"><span className="h-pushbar__text">{text}</span>{children}</div>
}
/** The shared Toast (./toast); `onDone` runs once it has faded away. */
export function KhToast({ children, onDone }: { children: ReactNode; onDone: () => void }) {
  return <Toast onClose={onDone}>{children}</Toast>
}
