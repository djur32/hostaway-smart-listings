/* AI and decision patterns (ds/ai-patterns.md, D-020, D-090, D-106): question card, suggestion card, conflict card,
 * autonomy notice, push tray (D-129). S10/S11 extend these; new variants go to ds/ first (CONVENTIONS §6.3). */
import { useState, type ReactNode } from 'react'
import { CHANNELS } from '../data/channels'
import type { ChannelId, Decision, Question, Suggestion } from '../data/types'
import { Button, ChannelChip, Icon, Mark, Pill, cx } from './primitives'

/** The lavender "<title> · New" upsell row (ds/components.css "AI promo card", HS-30). ChannelPricing's own Dynamic
 *  Pricing card (screens/channel/ChannelPricing.tsx) hand-rolls the same h-ai-card markup as a clickable <a> that
 *  opens a panel; pass `onClick` to get that same clickable form (an <a>, trailing chevron, real "Learn more" link)
 * , Listing base › Pricing's own Dynamic Pricing card (screens/base/Pricing.tsx) does this, opening DynamicPanel in
 *  a PanelStack. Without `onClick` this stays the non-interactive teaser, a plain <div>, cursor forced back to
 *  default (is-static, ds/components.css), for call sites with nowhere to send the click. */
/** no sparkle on the left and no "Learn more", the whole card is the link; its chevron takes the
 *  body text's purple. `learnMore` is kept for older callers and ignored. */
export function AiPromoCard({ title, body, onClick }: { title: ReactNode; body: ReactNode; learnMore?: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <div className="h-ai-card__main">
        <div className="h-ai-card__title">{title} <Pill kind="new">New</Pill></div>
        <div className="h-ai-card__body h-ai-card__body--aa">
          {body}
        </div>
      </div>
      {onClick && <Icon name="chevron-right" className="h-ai-card__chev" />}
    </>
  )
  if (onClick) {
    return <a className="h-ai-card" href="#" onClick={(e) => { e.preventDefault(); onClick() }}>{inner}</a>
  }
  return <div className={cx('h-ai-card', 'is-static')}>{inner}</div>
}

/** An unknown is a question, never a warning (D-090). */
export function AskCard({ q, onAnswer, onLater, blocking }: { q: Question; onAnswer: (a: string) => void; onLater: () => void; blocking?: string }) {
  const [text, setText] = useState('')
  if (q.status === 'answered') {
    return (
      <div className="h-ask is-answered">
        <div className="h-ask__head"><Icon name="circle-check" /><span className="h-ask__label">Added by you</span>{q.channel && <ChannelChip channel={q.channel} />}</div>
        <div className="h-ask__q">{q.question}</div>
        <div className="h-ask__answer">{q.answer}{q.unit ? ` ${q.unit}` : ''}</div>
      </div>
    )
  }
  return (
    <div className={`h-ask${blocking ? ' h-ask--blocking' : ''}`}>
      <div className="h-ask__head"><Icon name="help-circle" /><span className="h-ask__label">Question from the AI</span>{q.channel && <ChannelChip channel={q.channel} />}</div>
      <div className="h-ask__q">{q.question}</div>
      <div className="h-ask__why">{q.why}</div>
      {blocking && <div className="h-ask__blocks"><Icon name="lock" />{blocking}</div>}
      <div className="h-ask__answers">
        {q.quick?.length ? q.quick.map((a) => <Button key={a} size="md" onClick={() => onAnswer(a)}>{a}</Button>) : (
          <>
            <span className="h-input-group" style={{ width: q.unit ? 190 : 260 }}>
              <input className="h-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={q.unit ? 'e.g. 100' : 'Type the answer'} aria-label={q.question} />
              {q.unit && <span className="h-affix h-affix--end">{q.unit}</span>}
            </span>
            <Button size="md" disabled={!text.trim()} onClick={() => onAnswer(text.trim())}>Add to the Knowledge Hub</Button>
          </>
        )}
        <button className="h-ask__later" onClick={onLater}>Ask me later</button>
      </div>
    </div>
  )
}

/** Suggestion anatomy: where → proposal (diff) → why → confidence → Accept / Edit / Dismiss (principle 4, I-08). */
export function SuggestionCard({ s, onAccept, onDismiss, extra }: { s: Suggestion; onAccept: (text?: string) => void; onDismiss: () => void; extra?: React.ReactNode }) {
  return (
    <div className={`h-ai-suggest${s.status === 'accepted' ? ' is-accepted' : ''}`}>
      <div className="h-ai-suggest__why"><Icon name="sparkles" />{s.why}</div>
      <div className="h-ai-suggest__body">
        <div className="h-ai-suggest__proposal"><span className="h-diff"><del>{s.current}</del> <ins>{s.proposed}</ins></span></div>
        <div className="h-ai-suggest__meta">
          <ChannelChip channel={s.channel} />
          <span className={`h-confidence${s.confidence === 'Medium' ? ' h-confidence--medium' : s.confidence === 'Low' ? ' h-confidence--low' : ''}`}>{s.confidence} confidence</span>
        </div>
      </div>
      <div className="h-ai-suggest__foot">
        {s.status === 'proposed' ? (
          <>
            <Button kind="primary" onClick={() => onAccept()}>Accept</Button>
            {extra}
            <Button kind="ghost" onClick={onDismiss}>Dismiss</Button>
          </>
        ) : <span className="h-small h-muted">{s.status === 'accepted' ? `Queued for ${CHANNELS[s.channel].name}` : 'Dismissed'}</span>}
      </div>
    </div>
  )
}

/** A Needs-you decision (C4 refined): the consequence of each option, a recommendation with a reason, "apply as a rule". */
export function DecisionCard({ d, onDecide, onLater }: { d: Decision; onDecide: (optionId: string, rule: boolean) => void; onLater: () => void }) {
  const [choice, setChoice] = useState(d.choice ?? d.recommended ?? d.options[0].id)
  const [rule, setRule] = useState(true)
  const name = `dec-${d.id}`
  return (
    <div className="h-conflict">
      <div className="h-conflict__head">
        <Icon name={d.kind === 'conflict' ? 'alert-triangle' : 'alert-circle'} />{d.title}
        <small>{d.meta}</small>
      </div>
      <div className="h-conflict__options" style={{ gridTemplateColumns: d.options.length > 2 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr' }}>
        {d.options.map((o) => (
          <label key={o.id} className="h-conflict__opt">
            <input className="h-radio" type="radio" name={name} checked={choice === o.id} onChange={() => setChoice(o.id)} />
            <div>
              <div className="h-conflict__val">{o.label} {d.recommended === o.id && <Pill kind="recommended">Recommended</Pill>}</div>
              <div className="h-conflict__meta">{o.consequence}</div>
              {o.queues?.map((q) => (
                <div key={q.channel + q.label} className="h-caption h-muted" style={{ marginTop: 4 }}>
                  <Mark channel={q.channel} size={14} /> {q.label}: {q.before} → {q.after} (after you push)
                </div>
              ))}
            </div>
          </label>
        ))}
      </div>
      {d.ruleLabel && (
        <label className="h-small" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 16px 12px' }}>
          <input className="h-checkbox" type="checkbox" checked={rule} onChange={(e) => setRule(e.target.checked)} />{d.ruleLabel}
        </label>
      )}
      <div className="h-conflict__foot">
        <Button kind="primary" onClick={() => onDecide(choice, !!d.ruleLabel && rule)}>Confirm</Button>
        <Button onClick={onLater}>Decide later</Button>
      </div>
    </div>
  )
}

export function AutonomyNotice({ children, onChange }: { children: React.ReactNode; onChange?: () => void }) {
  return (
    <div className="h-autonomy-notice"><Icon name="sparkles" /><span>{children}</span>
      {onChange && <button className="h-action-green" onClick={onChange} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}>Change</button>}
    </div>
  )
}

/** The one push model (D-129): every change waits here with its channel. S11 owns the full Review & push flow. */
export function PushTray({ counts, channels, onReview }: { counts: Partial<Record<ChannelId, number>>; channels: ChannelId[]; onReview: () => void }) {
  const total = channels.reduce((n, c) => n + (counts[c] ?? 0), 0)
  return (
    <div className="h-small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon name="send" size={16} /><b>To push</b>
      {channels.map((c) => <span key={c} className="h-channel-chip"><Mark channel={c} />{counts[c] ?? 0}</span>)}
      <Button kind={total ? 'primary' : 'secondary'} size="md" onClick={onReview} disabled={!total}>Review</Button>
    </div>
  )
}
