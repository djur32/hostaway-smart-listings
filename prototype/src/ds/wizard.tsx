/* Full-screen wizard (Hostaway "Add property" replica) · WS-SL, 3 Oct. CSS: ds/v3/wizard.css (tokens only).
 * Source: research/current-state/review-2026-10-03-add-property/01–06. Generic parts — shell, step,
 * choice card, intro rows, voice field, config row, review summary, generating modal — so any create/edit flow can
 * use them; Smart Listings › Strategy's wizard is the first (screens/smart/StrategyWizard.tsx).
 * No live preview card ("I don't want to see the preview") — the column is centred on its own and the
 * answers show on the Review step. Sized to fit one view at 1440×900 ("way too big … fit everything in
 * one screen, without having to scroll"). */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ChannelId } from '../data/types'
import { Button, CloseButton, Icon, IconSprite, Mark } from './primitives'

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

/** The takeover: top bar (back · title · ×), progress line, scrolling body with one centred column, footer. */
export function Wizard({ title, progress, onBack, onClose, backDisabled, children, foot, overlay }: {
  title: string
  /** 0–1 */
  progress: number
  onBack: () => void; onClose: () => void; backDisabled?: boolean
  children: ReactNode; foot: ReactNode
  /** Above everything (WizardGenerating, a discard confirmation). */
  overlay?: ReactNode
}) {
  const body = useRef<HTMLDivElement>(null)
  // every step starts at the top. Keyed on the step (progress moves with it), not on `children`: a new children element
  // comes with every answer, and on a phone (where steps scroll) that threw the host back to the top mid-step — e.g.
  // typing in "Describe your guests" under the audience cards
  useEffect(() => { body.current?.scrollTo({ top: 0 }) }, [progress])
  return (
    <div className="h-wz" role="dialog" aria-modal="true" aria-label={title}>
      <IconSprite />
      <header className="h-wz__bar">
        <button type="button" className="h-wz__iconbtn" onClick={onBack} disabled={backDisabled} aria-label="Back"><Icon name="chevron-left" /></button>
        <h1 className="h-wz__title">{title}</h1>
        <CloseButton size="lg" onClick={onClose} />
      </header>
      <div className="h-wz__progress" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <span style={{ width: `${Math.max(2, Math.min(100, progress * 100))}%` }} />
      </div>
      <div className="h-wz__main">
        <div className="h-wz__body" ref={body}><div className="h-wz__col">{children}</div></div>
      </div>
      <footer className="h-wz__foot"><div className="h-wz__col">{foot}</div></footer>
      {overlay}
    </div>
  )
}

/** One question per screen: optional eyebrow (whose answer this is), H1, at most one line under it, the answers. */
export function WizardQuestion({ eyebrow, title, titleIcon, sub, children }: { eyebrow?: ReactNode; title: ReactNode; titleIcon?: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <>
      {eyebrow && <p className="h-wz__eyebrow">{eyebrow}</p>}
      <h2 className="h-wz__h1">{title}{titleIcon && <Icon name={titleIcon} size={24} />}</h2>
      {sub && <p className="h-wz__sub">{sub}</p>}
      {children && <div className="h-wz__content">{children}</div>}
    </>
  )
}

/** Footer: Back (secondary) left, the primary action right — the same two buttons on every step, the same width
 *  ("the Back and Continue buttons have to be the same size, the same width"). */
export function WizardFoot({ onBack, backLabel = 'Back', onNext, nextLabel = 'Continue', nextDisabled, hint }: {
  onBack?: () => void; backLabel?: string; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; hint?: ReactNode
}) {
  return (
    <>
      {onBack ? <Button size="lg" className="h-wz__foot-btn" onClick={onBack}>{backLabel}</Button> : null}
      <span className="h-wz__foot-gap" />
      {hint && <span className="h-wz__foot-hint" role="status">{hint}</span>}
      <Button kind="primary" size="lg" className="h-wz__foot-btn" onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
    </>
  )
}

/** A group of choice cards; the legend is the step's question (read by screen readers, hidden visually).
 *  `cols` lays many options out as a grid (one column on phones); `dense` = slim rows (secondary checklists). */
export function WizardChoices({ label, children, cols = 1, dense }: { label: string; children: ReactNode; cols?: 1 | 2 | 3; dense?: boolean }) {
  return <fieldset className={cx('h-wz-cards', cols > 1 && `h-wz-cards--${cols}`, dense && 'h-wz-cards--dense')}><legend className="h-sr-only">{label}</legend>{children}</fieldset>
}

/** A slim always-on row (a rule the host can't switch off): lock, what it covers, why. */
export function WizardLocked({ title, line }: { title: ReactNode; line?: ReactNode }) {
  return <p className="h-wz-locked"><Icon name="lock" size={16} /><span><strong>{title}</strong>{line && <> · {line}</>}</span></p>
}

/** The selected option's settings as one horizontal row of small value blocks (label above value). Read-only first;
 *  clicking a value turns that block into its control. `onReset` shows "Reset to default" once anything differs
 *  ("you will see the default, and then you can reset if you make any changes"). */
export function WizardConfig({ title, tag, onReset, top, children }: { title: ReactNode; tag?: ReactNode; onReset?: () => void; top?: ReactNode; children: ReactNode }) {
  return (
    <section className="h-wz-config" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="h-wz-config__head">
        <p className="h-wz-config__title">{title}{tag}</p>
        {onReset && <button type="button" className="h-wz-config__reset" onClick={onReset}>Reset to default</button>}
      </div>
      {top}
      <div className="h-wz-config__row">{children}</div>
    </section>
  )
}
export function WizardConfigItem({ label, value, hint, control, changed }: {
  label: string; value: ReactNode; hint?: ReactNode; control: ReactNode; changed?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cx('h-wz-config__item', changed && 'is-changed')}>
      <span className="h-wz-config__label">{label}</span>
      {open ? <span className="h-wz-config__control">{control}</span>
        : <button type="button" className="h-wz-config__value" onClick={() => setOpen(true)} aria-label={`${label}: ${typeof value === 'string' ? value : ''}. Change`}>
          {value}<Icon name="pencil" size={16} /></button>}
      {hint && <span className="h-wz-config__hint">{hint}</span>}
    </div>
  )
}

/** Bordered card with the control at the left, title + one line (refs 05, 06). Native input inside a label, so Tab,
 *  Space and the arrow keys (radios) work. `more` shows under the selected card (e.g. a custom mix). */
export function WizardChoice({ type = 'radio', name, checked, onChange, title, desc, channel, tag, disabled, more }: {
  type?: 'radio' | 'checkbox'; name: string; checked: boolean; onChange: (v: boolean) => void
  title: ReactNode; desc?: ReactNode; channel?: ChannelId; tag?: ReactNode; disabled?: boolean; more?: ReactNode
}) {
  return (
    <label className={cx('h-wz-card', !desc && 'h-wz-card--plain', checked && 'is-on', disabled && 'is-disabled')}>
      <input type={type} className={type === 'radio' ? 'h-radio' : 'h-checkbox'} name={name} checked={checked} disabled={disabled}
        onChange={(e) => onChange(type === 'radio' ? true : e.target.checked)} />
      <span className="h-wz-card__main">
        <span className="h-wz-card__title">{channel && <Mark channel={channel} />}{title}{tag && <span className="h-wz-card__tag">{tag}</span>}</span>
        {desc && <span className="h-wz-card__desc">{desc}</span>}
        {checked && more && <span className="h-wz-card__more" onClick={(e) => e.preventDefault()}>{more}</span>}
      </span>
    </label>
  )
}

/** Intro rows (ref 01): icon, title, one line; `ai` = the purple row. */
export function WizardIntro({ rows }: { rows: Array<{ icon: string; title: string; line: string; ai?: boolean }> }) {
  return (
    <div className="h-wz-intro">
      {rows.map((r) => (
        <div key={r.title} className={cx('h-wz-intro__row', r.ai && 'h-wz-intro__row--ai')}>
          <Icon name={r.icon} size={24} />
          <div><p className="h-wz-intro__title">{r.title}</p><p className="h-wz-intro__line">{r.line}</p></div>
        </div>
      ))}
    </div>
  )
}

/** Free text with "Use voice" (ref 02). The voice button is a prototype stand-in: it listens for a moment and appends
 *  `voiceSample` (the caller's transcript). */
export function WizardVoiceField({ id, label, value, onChange, placeholder, voiceSample }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; voiceSample?: string
}) {
  const [listening, setListening] = useState(false)
  useEffect(() => {
    if (!listening) return
    const t = setTimeout(() => {
      setListening(false)
      if (voiceSample) onChange(value.trim() ? `${value.trim()} ${voiceSample}` : voiceSample)
    }, 1600)
    return () => clearTimeout(t)
  }, [listening]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="h-wz-field">
      <div className="h-wz-field__head">
        <label className="h-wz-field__label" htmlFor={id}>{label}</label>
        <Button className={cx('h-wz-field__voice', listening && 'is-listening')} icon="microphone" aria-pressed={listening}
          onClick={() => setListening(!listening)}>{listening ? 'Listening…' : 'Use voice'}</Button>
      </div>
      <textarea id={id} className="h-wz-textarea" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

/** Review: one card per strategy, every answer with an Edit that goes back to its step. */
export function WizardSummary({ channels, title, rows }: {
  channels: ChannelId[]; title: ReactNode; rows: Array<{ label: string; value: ReactNode; onEdit?: () => void; editLabel?: string }>
}) {
  return (
    <section className="h-wz-sum">
      <div className="h-wz-sum__head">{channels.map((c) => <Mark key={c} channel={c} />)}{title}</div>
      <dl className="h-wz-sum__rows">
        {rows.map((r) => (
          <div key={r.label} className="h-wz-sum__row">
            <dt>{r.label}</dt><dd>{r.value}</dd>
            {r.onEdit ? <button type="button" className="h-wz-sum__edit" onClick={r.onEdit} aria-label={r.editLabel ?? `Edit ${r.label.toLowerCase()}`}>Edit</button> : <span />}
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Several strategies side by side (2–3 columns, label above value) so a multi-strategy review fits one view; a child
 *  with `wide` spans the row (the notes card). One column on phones. */
export function WizardSummaryGrid({ count, children }: { count: number; children: ReactNode }) {
  return <div className={cx('h-wz-sums', count > 1 && `h-wz-sums--${Math.min(3, count)}`)}>{children}</div>
}

/** Ref 03: a modal over the dimmed wizard listing what is happening — done (check), now (spinner), next (ring). */
export function WizardGenerating({ items, label = 'Saving' }: { items: Array<{ label: string; state: 'done' | 'active' | 'pending' }>; label?: string }) {
  return (
    <div className="h-wz-gen" role="alertdialog" aria-modal="true" aria-label={label} aria-busy={items.some((i) => i.state !== 'done')}>
      <div className="h-wz-gen__modal">
        <ul className="h-wz-gen__box">
          {items.map((i) => (
            <li key={i.label} className={cx('h-wz-gen__item', `is-${i.state}`)}>
              <span className="h-wz-gen__icon">{i.state === 'done' ? <Icon name="circle-check" size={24} /> : i.state === 'active' ? <span className="h-wz-spin" /> : <span className="h-wz-gen__dot" />}</span>
              {i.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
