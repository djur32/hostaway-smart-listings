/* Knowledge Hub, reframed · its new patterns, added to the design
 * system before any screen uses them. CSS: ds/v3/kh-q.css. Tokens only. Built from patterns the prototype already has:
 *   · KqQuestionRow — the Sources/Questions table row (KhrSourceItem's shape): the coverage icon, the question, one meta
 *     line with how often guests asked and on which channel, a trailing tip indicator (TipDot) and a chevron. The whole
 *     row opens the question (list → detail).
 *   · KqFactRef — a fact shown BY REFERENCE: its label and value, then where it lives ("Listing base · Location") as a
 *     text link to that field. Read-only: there is no pencil, the field is edited where it lives.
 *   · KqConversation — one guest message behind a question: who, channel, month, the words, and who replied.
 *   · KqHold — the faithful-answer note: nothing backs (part of) the answer, so the AI tells the guest it'll check and
 *     asks the host. Warning tone, the product's own `.h-khr-gapnote` family.
 *   · KqReceipt — the line a tip leaves once accepted: where the fact went and which channels it was sent to.
 *   · KqInsight — one insight in a list: an icon, a sentence, a quiet line, an action at the end.
 *   · KqWhere — the tip's destination choice (the Listing base, or one channel's description), the tip card's own
 *     radio rows (`.h-tip__alt`), so it reads as part of the same container. */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, cx } from './primitives'
import { KhcStateIcon, type KhcState } from './kh-c'

/* ---------- a question in a list ---------- */
export function KqQuestionRow({ state, question, meta, badge, tip, active, onOpen }: {
  state: KhcState; question: string; meta: ReactNode
  /** e.g. a "New" pill or "3 this month", after the meta line */
  badge?: ReactNode
  /** the tip indicator (TipDot), when a tip answers this question */
  tip?: ReactNode
  active?: boolean; onOpen: () => void
}) {
  return (
    <div className={cx('h-kq-qrow', active && 'is-active')} role="link" tabIndex={0} aria-label={`Open question: ${question}`}
      onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <span className="h-kq-qrow__icon"><KhcStateIcon state={state} /></span>
      <span className="h-kq-qrow__text">
        <span className="h-kq-qrow__q">{question}</span>
        <span className="h-kq-qrow__meta">{meta}{badge && <span className="h-kq-qrow__badge">{badge}</span>}</span>
      </span>
      <span className="h-kq-qrow__end" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>{tip}</span>
      <Icon name="chevron-right" size={18} className="h-kq-qrow__chev" />
    </div>
  )
}

/** "Asked 9 times · Airbnb 2 · Booking.com 6 · Direct 1" — counts in plain words, never logos in circles. */
export function KqCounts({ total, parts }: { total: number; parts: Array<{ label: string; n: number }> }) {
  if (!total) return <span className="h-kq-counts">Not asked yet</span>
  return (
    <span className="h-kq-counts">
      Asked {total} {total === 1 ? 'time' : 'times'}
      {parts.filter((p) => p.n > 0).map((p) => <span key={p.label} className="h-kq-counts__part"> · {p.label} {p.n}</span>)}
    </span>
  )
}

/* ---------- a fact, by reference ---------- */
export type KqRefKind = 'base' | 'channel' | 'confirmed' | 'document' | 'policy'
const REF_ICON: Record<KqRefKind, string> = { base: 'file-text', channel: 'file-text', confirmed: 'message-circle', document: 'book-2', policy: 'shield-check' }
export function KqFactRef({ kind, label, value, place, to, linkLabel = 'Open', meta }: {
  kind: KqRefKind; label: string; value?: ReactNode
  /** where it lives: "Listing base · Location", "Airbnb’s listing · Arrival", "Answer you confirmed · 12 Sep" */
  place: string
  /** the field it points at; none for an answer the host confirmed or a document */
  to?: string; linkLabel?: string
  /** a trailing quiet note, e.g. "Used in 3 answers" */
  meta?: ReactNode
}) {
  return (
    <div className={cx('h-kq-ref', `h-kq-ref--${kind}`)}>
      <Icon name={REF_ICON[kind]} size={16} className="h-kq-ref__icon" />
      <span className="h-kq-ref__main">
        <span className="h-kq-ref__label">{label}</span>
        {value !== undefined && value !== '' && <span className="h-kq-ref__value">{value}</span>}
        <span className="h-kq-ref__place">
          {to ? <Link className="h-kq-ref__link" to={to} aria-label={`${linkLabel}: ${label}, ${place}`}>{place}</Link> : place}
          {meta && <span className="h-kq-ref__meta"> · {meta}</span>}
        </span>
      </span>
    </div>
  )
}

/* ---------- a guest message behind a question ---------- */
export function KqConversation({ guest, channel, when, text, reply }: { guest: string; channel: string; when: string; text: string; reply: string }) {
  return (
    <div className="h-kq-convo">
      <span className="h-kq-convo__avatar" aria-hidden="true">{guest.charAt(0)}</span>
      <span className="h-kq-convo__main">
        <span className="h-kq-convo__who"><b>{guest}</b> · {channel} · {when}</span>
        <span className="h-kq-convo__text">“{text}”</span>
        <span className="h-kq-convo__reply">{reply}</span>
      </span>
    </div>
  )
}

/* ---------- the faithful-answer note ---------- */
export function KqHold({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="h-kq-hold" role="note">
      <Icon name="alert-circle" size={16} />
      <span className="h-kq-hold__text">{children}</span>
      {action && <span className="h-kq-hold__action">{action}</span>}
    </div>
  )
}

/* ---------- the receipt a tip leaves ---------- */
export function KqReceipt({ children, to, linkLabel = 'Open' }: { children: ReactNode; to?: string; linkLabel?: string }) {
  return (
    <p className="h-kq-receipt" role="status">
      <Icon name="circle-check" size={16} />
      <span>{children}</span>
      {to && <Link className="h-textlink" to={to}>{linkLabel}</Link>}
    </p>
  )
}

/* ---------- one insight ---------- */
export function KqInsight({ icon, title, line, action }: { icon: string; title: ReactNode; line?: ReactNode; action?: ReactNode }) {
  return (
    <div className="h-kq-insight">
      <Icon name={icon} size={18} className="h-kq-insight__icon" />
      <span className="h-kq-insight__main">
        <span className="h-kq-insight__title">{title}</span>
        {line && <span className="h-kq-insight__line">{line}</span>}
      </span>
      {action && <span className="h-kq-insight__action">{action}</span>}
    </div>
  )
}

/* ---------- the tip's destination ---------- */
export function KqWhere<T extends string>({ value, options, onChange, label = 'Where it goes' }: {
  value: T; options: Array<{ id: T; title: string; line: string }>; onChange: (v: T) => void; label?: string
}) {
  return (
    <fieldset className="h-kq-where">
      <legend className="h-kq-where__legend">{label}</legend>
      <div className="h-tip__alts">
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={cx('h-tip__alt', 'h-kq-where__opt', value === o.id && 'is-picked')} onClick={() => onChange(o.id)}>
            <span className="h-tile__box h-tile__box--radio" />
            <span className="h-kq-where__text"><b>{o.title}</b><small>{o.line}</small></span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
