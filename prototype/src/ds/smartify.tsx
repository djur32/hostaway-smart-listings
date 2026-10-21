/* Smartify — the yellow, user-initiated "refine what's already there" primitive (CLAUDE.md "Design established
 * patterns"; review relayed, round 2: "tips and recommendations will always appear with a purple thing...
 * customizations/refinements will be in yellow... same icon, but the functionality is a little different").
 *
 * Distinct from Tips (ds/sl3.tsx TipsToggle/TipCard/TipDot — purple, the system proactively pushes a suggestion the
 * host accepts or dismisses): Smartify is host-initiated. The host clicks the orange sparkle next to a free-text
 * field's LABEL and the docked right-hand panel (the Tips slot) opens straight on a composer: type an instruction
 * ("mention the desk") or pick a quick action (Shorten, Summarize, More formal…). The canned rewrite then shows
 * there as a RESULT CARD. Nothing changes in the field until the host clicks Accept, which writes the text as a normal draft
 * (it then waits for the section's own Discard/Save, ds/unsaved.tsx, like typing it by hand). Below the comparison,
 * quick follow-ups (Shorter, Warmer, More detail, Try again, or a typed instruction) each add a new version; versions
 * stay navigable with the card's x-of-n stepper. ("instead of just making the change altogether, there
 * is a card that appears where the tips appear that allows you to see the original versus the new one".)
 *
 * The result card IS the Tip card (ds/sl3.tsx TipCard, tone="refine") inside the same panel (TipsPanel, tone="refine")
 * — same container, head, title, before/after Diff and footer; only the accent is yellow ("the same
 * style for the recommendations for the tips as we're using for the change").
 *
 * Shared DS primitive (CONVENTIONS §6.3). Consumed by screens/channel/ListingEditor.tsx's Classic free-text fields
 * (Property name, Summary, Description, The space, Other details to note), and by the Canvas's field panel
 * (screens/canvas/FieldPanel.tsx, `embedded`), which shows the same composer and result card under the field.
 *
 * Tokens: ds/tokens.css --color-ai-refine-* (a dedicated yellow scale, distinct from the AI/grape tokens Tips uses).
 * CSS: ds/v3/smartify.css. */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon, cx } from './primitives'
import { Diff, TipCard, TipsPanel } from './sl3'

/** One-line definition in the trigger's tooltip — parallel to the purple dot's (sl3.tsx TIP_DOT_HINT). */
export const SMARTIFY_HINT = 'Rewrite with AI: describe a change, or pick a quick action'

/** The quick actions offered in the composer ("options… for example summarize, shorten, make more
 *  formal… quick actions"), and again as follow-ups under a result. */
export const SMARTIFY_QUICK: Array<{ label: string; instruction: string }> = [
  { label: 'Shorten', instruction: 'make it shorter' },
  { label: 'Summarize', instruction: 'summarize it' },
  { label: 'More formal', instruction: 'make it more formal' },
  { label: 'Warmer', instruction: 'make it warmer' },
  { label: 'More detail', instruction: 'add more detail' },
]

export interface SmartifyTriggerProps {
  /** Accessible name, e.g. "Rewrite the summary with AI". */
  label: string
  /** Opens (or, when `active`, closes) this field's composer in the docked panel. */
  onOpen: () => void
  /** Hides the trigger entirely — e.g. the field is still on the Base, or Autopilot has the section read-only. */
  disabled?: boolean
  /** This field's composer / result is open in the panel: the trigger stays filled, like an active tip dot. */
  active?: boolean
  className?: string
}

/** The orange sparkle beside a field's label. no floating prompt — clicking opens the side panel
 *  straight into the composer (type a change, or pick a quick action). Inline elements only, so it can sit in the
 *  label's <p>. */
export function SmartifyTrigger({ label, onOpen, disabled, active, className }: SmartifyTriggerProps) {
  const id = useId()
  if (disabled) return null
  return (
    <span className={cx('sy-wrap', 'sy-wrap--label', className)}>
      <span className="h-tooltip-anchor sy-tipanchor">
        <button type="button" className={cx('sy-trigger', 'sy-trigger--label', active && 'is-open')} aria-pressed={!!active}
          aria-label={label} aria-describedby={`${id}-hint`} onClick={onOpen}>
          <Icon name="sparkles" size={16} />
        </button>
        <span role="tooltip" id={`${id}-hint`} className="h-tooltip">{SMARTIFY_HINT}</span>
      </span>
    </span>
  )
}

/* ---------- the panel: composer first, then the result card ---------- */
export interface SmartifyVersion { instruction: string; text: string }

export interface SmartifyPanelProps {
  /** The field's name, e.g. "Summary". */
  fieldLabel: string
  /** The field's text when the panel opened — the "before" of every version. */
  original: string
  /** Empty = the composer is showing (nothing asked yet). */
  versions: SmartifyVersion[]
  /** 0-based index of the version on show. */
  idx: number
  onStep: (idx: number) => void
  /** A version is being written. */
  busy?: boolean
  /** The channel's character limit for this field (shown as a count under the new text). */
  limit?: number | null
  /** A typed instruction or a quick action; null = try the current instruction again. With no versions yet, this is
   *  the first request (on the original text). */
  onFollowUp: (instruction: string | null) => void
  onAccept: () => void
  onDismiss: () => void
  /** Additive (3 Oct, Canvas): render only the card — no TipsPanel wrapper — for a host that already supplies the
   *  panel and puts the field itself first (screens/canvas/FieldPanel.tsx, opened from its title-row trigger, so the
   *  composer takes focus there too). Classic leaves it unset. */
  embedded?: boolean
}

function Composer({ onSend, busy, placeholder, autoFocus }: { onSend: (t: string) => void; busy?: boolean; placeholder: string; autoFocus?: boolean }) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (autoFocus) ref.current?.focus({ preventScroll: true }) }, [autoFocus])
  const send = () => { const t = text.trim(); if (!t || busy) return; onSend(t); setText('') }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  return (
    <div className="sy-composer">
      <textarea ref={ref} className="sy-composer__input" rows={2} value={text} placeholder={placeholder} aria-label="Describe the change you want"
        onChange={(e) => setText(e.target.value)} onKeyDown={onKey} disabled={busy} />
      {/* the send arrow appears only once something is typed — hidden (not just disabled) when empty. */}
      {text.trim() && (
        <button type="button" className="sy-pop__go" aria-label="Rewrite" onClick={send} disabled={busy}>
          <Icon name="arrow-right" size={16} />
        </button>
      )}
    </div>
  )
}

function QuickActions({ onPick, busy, retry, label }: { onPick: (instruction: string | null) => void; busy?: boolean; retry?: boolean; label: string }) {
  return (
    <div className="sy-follow">
      <span className="sy-follow__label">{label}</span>
      <div className="sy-follow__chips">
        {SMARTIFY_QUICK.map((f) => <button key={f.label} type="button" className="sy-chip" disabled={busy} onClick={() => onPick(f.instruction)}>{f.label}</button>)}
        {retry && <button type="button" className="sy-chip" disabled={busy} onClick={() => onPick(null)}><Icon name="refresh" size={16} />Try again</button>}
      </div>
    </div>
  )
}

/** The docked panel for one field's rewrite. Opens on the composer — the cursor already in it, quick actions below
 *  ("when you click on that, you already are in the composer and you can type"). Once there is a
 *  version, it becomes the result card (TipCard, tone="refine"): the change, Accept / Dismiss, versions x of n, and
 *  the same quick actions plus a composer to keep refining. Nothing writes the field until Accept. */
export function SmartifyPanel(p: SmartifyPanelProps) {
  const v = p.versions[p.idx]
  const many = p.versions.length > 1
  const writing = <div className="sy-writing" role="status"><span className="sy-spin sy-spin--dark" aria-hidden="true" />Writing a new version…</div>
  const wrap = (card: ReactNode) => (p.embedded ? card : <TipsPanel title="Rewrite with AI" tone="refine" onClose={p.onDismiss}>{card}</TipsPanel>)
  if (!v) return wrap(
      <article className="h-tip h-tip--refine sy-compose" aria-label={`Rewrite ${p.fieldLabel}`} aria-busy={p.busy || undefined}>
        <div className="h-tip__head"><span className="h-tip__type">{p.fieldLabel}</span></div>
        <div className="h-tip__body">
          <div className="h-tip__main">
            <h3 className="h-tip__title">Describe the change you want</h3>
            {p.busy ? writing : <Composer autoFocus onSend={(t) => p.onFollowUp(t)} placeholder={'e.g. “mention the desk” or “make it warmer”'} />}
          </div>
          <QuickActions label="Quick actions" busy={p.busy} onPick={p.onFollowUp} />
          <p className="sy-prompt__note">You’ll see a preview first. Nothing changes until you accept it.</p>
        </div>
      </article>
  )
  const extra = (
    <>
      <QuickActions label="Keep refining" busy={p.busy} retry onPick={p.onFollowUp} />
      <Composer busy={p.busy} onSend={(t) => p.onFollowUp(t)} placeholder="Or describe another change" />
    </>
  )
  const main = (
    <>
      {p.busy ? writing : <Diff from={p.original || undefined} to={v.text} />}
      {!p.busy && <span className="sy-count">{v.text.length}{p.limit ? ` / ${p.limit}` : ''} characters · was {p.original.length}</span>}
    </>
  )
  return wrap(
      <TipCard
        tone="refine" type={p.fieldLabel} navNoun="version"
        idx={p.idx + 1} total={p.versions.length}
        onPrev={many ? () => p.onStep(Math.max(0, p.idx - 1)) : undefined}
        onNext={many ? () => p.onStep(Math.min(p.versions.length - 1, p.idx + 1)) : undefined}
        title={`“${v.instruction.charAt(0).toUpperCase()}${v.instruction.slice(1)}”`}
        main={main} why={[]} extra={extra} busy={p.busy}
        onAccept={p.onAccept} onDismiss={p.onDismiss}
      />
  )
}
