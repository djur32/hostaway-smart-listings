/* Smart Listing v3 · WS-CV design-system additions (CSS in ds/v3/cv.css). Screens import from '../../ds'.
 * The Canvas puts the channel's real guest page inside Smart Listing (CV-00…CV-09).
 * review, 3 Oct: nothing is edited ON the page any more — "the solution has to be in the sidebar". The replica stays
 * fully readable (no dimming, no inline inputs, no floating prompts); each part of it is a CvArea that only carries an
 * outline and one small marker, in the colour of the one AI affordance it has:
 *   tip     — purple (the field has a tip waiting; the marker is the same 22px TipDot as Classic's field label)
 *   refine  — orange (editable here, no tip: the same round Rewrite-with-AI trigger as Classic's field label)
 *   none    — read-only (owned elsewhere): no colour, only a neutral hover outline.
 * Tapping an area selects it (solid outline in its colour) and opens the field panel in the one right-hand slot
 * (CvEditPanel here; the content — Classic's own FieldRow, the tip card, the Rewrite composer — is composed by
 * screens/canvas/FieldPanel.tsx). Photos and locked parts use the same panel with CvPhotoPop / CvLockPop inside. */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button, CloseButton, Icon, Segmented, cx } from './primitives'
import { Diff } from './sl3'
import { BottomSheet, useIsMobile } from './mobile'

/* ---------- the browser frame around a channel page ---------- */
export function CvFrame({ url, note, live, children }: { url: string; note?: ReactNode; live?: boolean; children: ReactNode }) {
  return (
    <div className={cx('cv-frame', live && 'is-live')}>
      <div className="cv-frame__chrome">
        <span className="cv-frame__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="cv-frame__url"><Icon name="lock" />{url}</span>
        {note && <span className="cv-frame__note">{note}</span>}
      </div>
      {children}
    </div>
  )
}

/* ---------- the canvas bar: Your edits | Live now · Keep this version ----------
 * "Show editable areas" is gone (3 Oct): editable areas are always outlined now, in their marker colour. */
export type CvCompare = 'edits' | 'live'
export function CvBar({ compare, onCompare, edits, onKeep, left }: {
  compare: CvCompare; onCompare: (v: CvCompare) => void; edits: number; onKeep: () => void; left?: ReactNode
}) {
  return (
    <div className="cv-bar">
      {left}
      <span className="cv-bar__spacer" />
      {compare === 'live' && edits > 0 && <Button icon="history" onClick={onKeep}>Keep this version</Button>}
      <Segmented<CvCompare> label="Compare" value={compare} onChange={onCompare}
        items={[{ id: 'edits', label: 'Your edits' }, { id: 'live', label: 'Live now' }]} />
    </div>
  )
}

/* ---------- an area of the page ---------- */
export type CvTone = 'tip' | 'refine' | 'none'
export interface CvAreaProps {
  id: string
  /** tip = purple (a tip waits), refine = orange (editable, no tip), none = read-only (no colour). */
  tone: CvTone
  /** Accessible name, e.g. "Property name · 1 tip". */
  label: string
  children: ReactNode
  /** Open in the field panel: solid outline in its colour. */
  selected?: boolean
  /** The tip open in the Tips panel lands here (solid purple outline); `preview` shows its suggested value in place. */
  focus?: boolean
  preview?: boolean
  /** Tips waiting on this area's field (the number in the purple marker when more than one). */
  tips?: number
  onSelect?: () => void
  inline?: boolean
  className?: string
  style?: CSSProperties
  /** Counter-zoom for the marker, so it keeps Classic's 22px size when the page is scaled. */
  unzoom?: number
  /** "Live now": the page is read-only, no outlines, markers or selection. */
  disabled?: boolean
}
export function CvArea(p: CvAreaProps) {
  const Tag = p.inline ? 'span' : 'div'
  const z = p.unzoom && p.unzoom !== 1 ? { zoom: p.unzoom } : undefined
  const on = !p.disabled
  return (
    <Tag
      data-cv-area={p.id} data-cv-tone={on ? p.tone : undefined}
      className={cx('cv-area', `cv-area--${p.tone}`, p.selected && 'is-selected', p.focus && 'is-focus', p.preview && 'is-preview', p.disabled && 'is-disabled', p.inline && 'cv-area--inline', p.className)}
      style={p.style}
      role={on ? 'button' : undefined} tabIndex={on ? 0 : undefined} aria-label={on ? p.label : undefined} aria-pressed={on ? !!p.selected : undefined}
      onClick={on ? (e) => { e.stopPropagation(); e.preventDefault(); p.onSelect?.() } : undefined}
      onKeyDown={on ? (e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); p.onSelect?.() } } : undefined}
    >
      {/* the same look as Classic's field-label indicators (.h-tipdot / .sy-trigger--label), but not a second button:
          the whole area is the control, so the marker is decoration and a click on it selects the area */}
      {on && p.tone !== 'none' && (
        <span className="cv-area__mark" style={z} aria-hidden="true">
          {p.tone === 'tip'
            ? <span className={cx('h-tipdot', (p.selected || p.focus) && 'is-active')}><Icon name="sparkles" />{p.tips && p.tips > 1 ? p.tips : null}</span>
            : <span className={cx('sy-trigger', 'sy-trigger--label', p.selected && 'is-open')}><Icon name="sparkles" size={16} /></span>}
        </span>
      )}
      {p.children}
    </Tag>
  )
}

/** The Canvas's side panel (Split's one right-hand slot, shared with Tips — D-927): a head with the part's name and ×,
 *  then its content (FieldPanel, CvPhotoPop, CvLockPop). The content's own heads are hidden inside it (ds/v3/cv.css). */
export function CvEditPanel({ title, onClose, children, className }: { title: ReactNode; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <aside className={cx('cv-panel h-scroll-thin', className)} aria-label={typeof title === 'string' ? title : 'Edit'}>
      <div className="cv-panel__head">
        <h2 className="cv-panel__title">{title}</h2>
        <CloseButton className="cv-panel__close" onClick={onClose} />
      </div>
      <div className="cv-panel__body">{children}</div>
    </aside>
  )
}

/** Locked area (CV-06): who owns it, where to change it, and a link there. */
export function CvLockPop({ title, text, link, note }: { title: string; text: string; link?: { label: string; to: string }; note?: ReactNode }) {
  return (
    <div className="cv-lockpop">
      <p className="cv-lockpop__title"><Icon name="lock" />{title}</p>
      <p className="cv-lockpop__text">{text}</p>
      {link && <Link className="cv-lockpop__link" to={link.to}>{link.label}<Icon name="arrow-right" size={16} /></Link>}
      {note && <div className="cv-lockpop__note"><Icon name="sparkles" />{note}</div>}
    </div>
  )
}

/** Photos (CV-04): the order for this channel, now and after. Click a photo to make it the cover, or describe the change. */
export function CvPhotoPop({ title, scope, saves, order, src, caption, suggest, onAccept, onClose, start, ai = true, askHint = 'e.g. put the desk photo in the first five' }: {
  title: string; scope: ReactNode; saves: ReactNode; order: string[]; src: (k: string) => string; caption: (k: string) => string
  suggest: (ask: string) => { order: string[]; why: string }; onAccept: (order: string[]) => void; onClose: () => void; start?: string
  /** "Describe the change" (simulated AI). `false`: pick the cover by hand only. */
  ai?: boolean
  askHint?: string
}) {
  const [draft, setDraft] = useState(order)
  const [ask, setAsk] = useState(start ?? '')
  const [result, setResult] = useState<{ order: string[]; why: string } | null>(start ? suggest(start) : null)
  /** Opt-in, like every other refine control on the Canvas: collapsed to a chip until asked for (`start` is the
   *  screenshot URL state, which opens straight on the result anyway). */
  const [aiOpen, setAiOpen] = useState(!!start)
  const strip = (o: string[], hi?: string[]) => (
    <div className="cv-strip">{o.slice(0, 6).map((k, i) => (
      <button key={k} type="button" className={cx('cv-strip__ph', hi && hi[i] !== k && 'is-moved')} title={caption(k)} onClick={() => !hi && setDraft([k, ...draft.filter((x) => x !== k)])}>
        <img src={src(k)} alt={caption(k)} /><span>{i + 1}</span>
      </button>))}
      {o.length > 6 && <span className="cv-strip__more">+{o.length - 6}</span>}
    </div>
  )
  return (
    <div className="cv-edit">
      <div className="cv-edit__head"><Icon name="photo" /><b>{title}</b><span className="cv-edit__scope">{scope}</span>
        <CloseButton className="cv-edit__x" onClick={onClose} /></div>
      <div className="cv-edit__body">
        {result ? (<>
          <p className="cv-edit__label"><Icon name="sparkles" />From your note: <q>{ask}</q></p>
          <div className="cv-strip__row"><span>Now</span>{strip(order)}</div>
          <div className="cv-strip__row"><span>After</span>{strip(result.order, order)}</div>
          <p className="cv-edit__saves">{result.why}</p>
          <div className="cv-edit__foot"><span className="cv-edit__spacer" /><Button onClick={() => setResult(null)}>Back</Button><Button kind="primary" onClick={() => onAccept(result.order)}>Accept</Button></div>
        </>) : (<>
          <p className="cv-edit__hint">Click a photo to make it the cover. The library stays in the Knowledge Hub.</p>
          {strip(draft)}
          <div className="cv-edit__meta"><span>{saves}</span><span>{order.length} photos</span></div>
          {/* review, 1 Oct: the refine input is a compact, opt-in chip — never a large box standing open under the
              content. Collapsed it's a single small trigger; opened it's one line. */}
          {ai && (aiOpen ? (
            <div className="cv-edit__askrow cv-edit__askrow--solo">
              <input className="h-input" autoFocus value={ask} placeholder={askHint} aria-label="Describe the change"
                onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && ask.trim()) setResult(suggest(ask.trim())); if (e.key === 'Escape') setAiOpen(false) }} />
              <Button kind="ai" icon="sparkles" onClick={() => setResult(suggest(ask.trim() || 'Put the desk photo in the first five'))}>Suggest</Button>
            </div>
          ) : (
            <button type="button" className="cv-askchip" onClick={() => setAiOpen(true)}>
              <Icon name="sparkles" size={16} />Describe the change
            </button>
          ))}
          <div className="cv-edit__foot"><span className="cv-edit__spacer" /><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={draft.join() === order.join()} onClick={() => onAccept(draft)}>Save</Button></div>
        </>)}
      </div>
    </div>
  )
}

/* ---------- Keep this version (CV-08) ----------
 * "Your edits" that aren't live yet (waiting to be sent, or in review): keeping the live version dismisses them.
 * No "save as draft" in the channel editors (Save = commit, QA A08). */
export interface CvChange { section: string; what: string; from: string; to: string }
export function CvKeepDialog({ channelName, changes, onCancel, onDismiss }: { channelName: string; changes: CvChange[]; onCancel: () => void; onDismiss: () => void }) {
  const mobile = useIsMobile()
  const n = changes.length
  const lead = <p className="cv-keep__lead">{n === 1 ? '1 change for' : `${n} changes for`} {channelName} {n === 1 ? 'isn’t' : 'aren’t'} live yet. Keeping the live version dismisses {n === 1 ? 'it' : `all ${n}`}. Nothing on {channelName} changes.</p>
  const list = <div className="cv-keep__list">{changes.map((c) => (
    <div key={c.section + c.what} className="cv-keep__row">
      <span className="h-pill h-pill--neutral">{c.section}</span><b>{c.what}</b>
      <Diff from={c.from || '(empty)'} to={c.to || '(empty)'} />
    </div>))}
  </div>
  const actions = <>
    <Button onClick={onCancel}>Cancel</Button>
    <Button kind="primary" onClick={onDismiss}>Dismiss {n} {n === 1 ? 'change' : 'changes'}</Button>
  </>
  // phones: a bottom sheet with the two actions in its footer (ds/mobile.md §7)
  if (mobile) return <BottomSheet open title="Keep the live version?" onClose={onCancel} footer={actions}><div className="cv-keep cv-keep--sheet">{lead}{list}</div></BottomSheet>
  return (
    <div className="h-scrim cv-scrim" onClick={onCancel}>
      <div className="h-modal cv-keep" role="dialog" aria-modal="true" aria-labelledby="cv-keep-title" onClick={(e) => e.stopPropagation()}>
        <h2 className="h-modal__title" id="cv-keep-title">Keep the live version?</h2>
        <CloseButton className="h-modal__close" onClick={onCancel} />
        {lead}{list}
        <div className="h-modal__foot">{actions}</div>
      </div>
    </div>
  )
}
