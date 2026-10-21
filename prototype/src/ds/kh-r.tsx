/* Knowledge Hub iteration R · shared components (concepts/knowledge-hub/KH-NEXT.md). CSS: ds/v3/kh-r.css.
 * R-core: the nine-topic accordion, a typed fact row (the Add-fact flow's 8 kinds), the Sources "Add content" row, and
 * the generation progress card (refs kh-next/01–02, kept exactly: a growing list of steps, most recent on top). */
import { useRef, type ReactNode } from 'react'
import { Icon, IconButton, cx } from './primitives'
import { PageHead, Split } from './sl3'
import { BackLink } from './backlink'
import type { Property } from '../data/types'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

/* ---------- the topic accordion ---------- */
export function RAccordionItem({ id, label, count, meta, open, onToggle, children, className }: {
  id: string; label: string; count: number; open: boolean; onToggle: () => void; children?: ReactNode
  /** replaces "N facts" (e.g. "8 questions · 1 needs an answer", Knowledge Hub › Questions, ds/kh-q.tsx) */
  meta?: ReactNode; className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section className={cx('h-khr-topic', open && 'is-open', className)} ref={ref} data-topic={id}>
      <button type="button" className="h-khr-topic__head" aria-expanded={open} onClick={onToggle}>
        <span className="h-khr-topic__label">{label}</span>
        <span className="h-khr-topic__count">{meta ?? <>{count} {count === 1 ? 'fact' : 'facts'}</>}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} className="h-khr-topic__chev" />
      </button>
      {open && <div className="h-khr-topic__body">{children}</div>}
    </section>
  )
}

/* ---------- a typed fact row (seeded Contact demo fact, or one added through the Add-fact flow) ---------- */
export function RFactRow({ icon, label, value, scope, source, onEdit, action }: {
  icon: string; label: ReactNode; value: ReactNode; scope?: ReactNode; source?: ReactNode; onEdit?: () => void
  /** replaces the pencil (e.g. a ··· menu) */
  action?: ReactNode
}) {
  return (
    <div className="h-khr-fact">
      <span className="h-khr-fact__icon"><Icon name={icon} size={16} /></span>
      <span className="h-khr-fact__main">
        <span className="h-khr-fact__label">{label}</span>
        <span className="h-khr-fact__value">{value}</span>
        {source && <span className="h-khr-fact__source">{source}</span>}
      </span>
      <span className="h-khr-fact__scope">{scope}</span>
      {action ?? (onEdit && <IconButton icon="pencil" label={`Edit ${typeof label === 'string' ? label : 'fact'}`} className="h-khr-fact__edit" onClick={onEdit} />)}
    </div>
  )
}

/* ---------- generation progress (refs kh-next/01–02, keep exactly) ---------- */
export function RGenerateIcon() {
  return (
    <span className="h-khr-genicon" aria-hidden="true">
      <Icon name="book-2" size={24} /><Icon name="bulb" size={16} className="h-khr-genicon__bulb" />
    </span>
  )
}
/** A growing list: the current step on top (bold, green), earlier ones fading below it — the real product's own effect. */
export function RStepList({ steps, at }: { steps: readonly string[]; at: number }) {
  const shown = steps.slice(0, at + 1).slice().reverse()
  return (
    <ul className="h-khr-steps" aria-live="polite">
      {shown.map((s, i) => <li key={s} className={cx('h-khr-genstep', i === 0 && 'is-current')}>{s}</li>)}
    </ul>
  )
}
export function RProgressBar({ pct }: { pct: number }) {
  return <div className="h-khr-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><span style={{ width: `${pct}%` }} /></div>
}

/* ---- Workflows + Test (Agent R-workflows) ----
 * Template gallery cards, the step editor's chip pickers, the two simulate/test surfaces (a single workflow, and the
 * Hub-wide "Test" that replaces "Ask the AI", ref 07) and the drawer they both slide in from. Tokens only. No
 * "answer as {channel}" anywhere below (review, KH-NEXT.md).
 * R2 revision (1 Oct, review: "basically not rendered fine… not even how I envision this happening"): rebuilt the
 * editor closer to Intercom Fin's procedure editor (refs 05–06) — a weighted trigger box (KhrTrigger) and steps that
 * rest as flowing, chip-woven sentences (KhrStepItem) instead of a raw %token%-filled textarea shown at all times.
 * New pieces are kept in this same section; genuinely new CSS is prefixed `h-khr-wf2-` (ds/v3/kh-r.css) so it can't
 * collide with R-core's own classes above. `KhrAnswer`/`KhrAsk`/`KhrSourceRow`/`.h-khr-sim__label` below
 * are Test.tsx's (someone else's screen) — kept exactly as they were, not part of this revision. */
/* `useRef`/`ReactNode` (react) and `Icon`/`cx` (./primitives) are already imported above by Agent 1 — reused as-is,
 * not re-imported (TS would flag the duplicate identifiers). Only the names below are new to this file. */
import { useEffect, useState } from 'react'
import { Button } from './primitives'
import { ACTION_CHIPS, CHIP_RE, DATA_CHIPS, type ChipDef } from '../screens/hub/variants/R/workflows-data'

/* ---------- chip text: %token% rendered as an inline bold-underlined mention (refs 05/06 — "People.signed_up",
 * "Handoff to team: X" woven into the sentence), read views only; editing shows the raw %token% text instead. ---------- */
const CHIP_LOOKUP = new Map<string, ChipDef>([...DATA_CHIPS, ...ACTION_CHIPS].map((c) => [c.token, c]))
export function KhrChipText({ text }: { text: string }) {
  if (!text.includes('%')) return <>{text}</>
  const parts = text.split(CHIP_RE)
  // String.split with a capturing group alternates plain text and the captured token
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p || null
        const chip = CHIP_LOOKUP.get(p)
        if (!chip) return `%${p}%`
        return <span key={i} className={cx('h-khr-chip', chip.kind === 'action' && 'h-khr-chip--action')}><Icon name={chip.icon} size={16} />{chip.label}</span>
      })}
    </>
  )
}

/** The "+" menu beside a step: pick a reservation-data chip or an action chip to insert. Closes on an outside click. */
export function KhrChipMenu({ onPick }: { onPick: (token: string) => void }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open])
  return (
    <div className="h-khr-chipmenu" ref={wrap}>
      <button type="button" className="h-btn-icon" aria-haspopup="menu" aria-expanded={open} aria-label="Insert a chip" onClick={() => setOpen((v) => !v)}><Icon name="plus" /></button>
      {open && (
        <div className="h-khr-chipmenu__pop" role="menu">
          <p className="h-khr-chipmenu__head">Reservation data</p>
          {DATA_CHIPS.map((c) => (
            <button key={c.token} type="button" role="menuitem" className="h-khr-chipmenu__item" onClick={() => { onPick(c.token); setOpen(false) }}><Icon name={c.icon} size={16} />{c.label}</button>
          ))}
          <p className="h-khr-chipmenu__head">Actions</p>
          {ACTION_CHIPS.map((c) => (
            <button key={c.token} type="button" role="menuitem" className="h-khr-chipmenu__item" onClick={() => { onPick(c.token); setOpen(false) }}><Icon name={c.icon} size={16} />{c.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- the trigger box: "When to use this workflow" (refs 05/06 — a labeled, bordered card at the top of the
 * editor, not an afterthought textarea sitting loose among the steps). ---------- */
export function KhrTrigger({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="h-khr-wf2-trigger">
      <div className="h-khr-wf2-trigger__head"><Icon name="target" size={18} /><span>When to use this workflow</span></div>
      <textarea className="h-textarea h-khr-wf2-trigger__input" rows={2} value={value} placeholder={placeholder} aria-label="When to use this workflow" onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

/* ---------- a workflow step: rests as a numbered, flowing sentence with its tokens woven in as inline chip
 * mentions (refs 05/06) — never raw %token% syntax at rest. Click the sentence (or its pencil) to edit: a plain
 * textarea reappears, with the same "+" chip menu to insert a token at the cursor, closed again with Done or Esc.
 * A brand-new, empty step opens straight into edit mode — there's nothing to render as a sentence yet. ---------- */
export function KhrStepItem({ index, value, onChange, onRemove }: { index: number; value: string; onChange: (v: string) => void; onRemove?: () => void }) {
  const [editing, setEditing] = useState(!value.trim())
  const ref = useRef<HTMLTextAreaElement>(null)
  const insert = (token: string) => {
    const el = ref.current
    const at = el?.selectionStart ?? value.length
    const before = value.slice(0, at)
    const after = value.slice(at)
    const pad = before && !before.endsWith(' ') ? ' ' : ''
    onChange(`${before}${pad}%${token}%${after}`)
    const pos = before.length + pad.length + token.length + 2
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(pos, pos) })
  }
  return (
    <div className={cx('h-khr-wf2-step', editing && 'is-editing')}>
      <span className="h-khr-wf2-step__num">{index + 1}</span>
      {editing ? (
        <div className="h-khr-wf2-step__edit">
          <textarea ref={ref} className="h-textarea h-khr-wf2-step__input" rows={2} autoFocus value={value}
            aria-label={`Step ${index + 1}`} placeholder="Write this step as an instruction. Use “+” to weave in reservation data or an action."
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setEditing(false) } }} />
          <div className="h-khr-wf2-step__editbar">
            <KhrChipMenu onPick={insert} />
            <Button onClick={() => setEditing(false)}>Done</Button>
          </div>
        </div>
      ) : (
        <button type="button" className="h-khr-wf2-step__sentence" onClick={() => setEditing(true)}>
          {value.trim() ? <KhrChipText text={value} /> : <span className="h-khr-wf2-step__placeholder">Click to write this step…</span>}
        </button>
      )}
      <span className="h-khr-wf2-step__tools">
        {!editing && <IconButton icon="pencil" label={`Edit step ${index + 1}`} onClick={() => setEditing(true)} />}
        {onRemove && <IconButton icon="trash" label={`Remove step ${index + 1}`} onClick={onRemove} />}
      </span>
    </div>
  )
}

/* ---------- simulate / test result pieces, shared by a workflow's own Test and the Hub-wide Test (ref 06, ref 07) ---------- */
/** `only`: a sentence just one channel's guests get (e.g. Airbnb's checkout tasks) — labelled, never folded silently
 *  into the plain-answer lines (review, 1 Oct: channel-specific content must say so, the same way KhcAnswer already
 *  does on a topic page). Reuses KhcAnswer's own classes so the two read identically. */
export function KhrAnswer({ lines, only }: { lines: string[]; only?: { channel: ChannelId; text: string } }) {
  return (
    <div className="h-khr-answer">
      {lines.map((l, i) => <p key={i}>{l}</p>)}
      {only && <p className="h-khc-answer__only"><span>{only.text}</span><span className="h-khc-answer__scope">{CHANNELS[only.channel].name} only</span></p>}
    </div>
  )
}
export function KhrSourceRow({ icon, label, quote, onEdit }: { icon: string; label: string; quote?: string; onEdit?: () => void }) {
  return (
    <div className="h-khr-sourcerow">
      <Icon name={icon} size={16} />
      <div className="h-khr-sourcerow__text">
        <p className="h-khr-sourcerow__label">{label}</p>
        {quote && <p className="h-khr-sourcerow__quote">“{quote}”</p>}
      </div>
      {onEdit && <button type="button" className="h-btn-icon" aria-label={`Edit ${label}`} onClick={onEdit}><Icon name="pencil" /></button>}
    </div>
  )
}
/** The plain ask input (no channel picker — one answer, listing-wide). */
export function KhrAsk({ value, onChange, onSubmit, placeholder, plain, autoFocus }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; placeholder: string
  /** no sparkles (review, 3 Oct: testing the Hub isn't a recommendation) */
  plain?: boolean; autoFocus?: boolean
}) {
  return (
    <form className={cx('h-khr-ask', plain && 'h-khr-ask--plain')} role="search" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      {!plain && <Icon name="sparkles" className="h-khr-ask__spark" />}
      <input className="h-khr-ask__input" value={value} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      <button type="submit" className="h-btn-icon" aria-label="Ask"><Icon name="chevron-right" /></button>
    </form>
  )
}

/* ---- Overview, rebuilt + a calmer topic page (Agent R-overview2, concepts/knowledge-hub/KH-NEXT-2.md) ----
 * The nine topics as template-style cards (visually in `.h-khr-tplcard`'s family, ref 04, extended here — not
 * renamed), the gap→suggestion cross-reference line, and a compact fact-citation chip row for a question's answer
 * (replacing C's full editable fact list under every question — "busy", "a lot of content", Antonio). CSS classes
 * below are all prefixed `h-khr-ov2-` so they can't collide with the Workflows agent's own additions to this file. */

/** One topic, as a clickable card (icon, name, fact count, a one-line description). Built on `.h-khr-tplcard`'s shape
 *  so it reads as the same family as Workflows' template cards, with its own class for the whole-card button reset. */
/** A topic card (review, 4 Oct): the icon, then the topic's name with its count under it ("10 questions"), then an
 *  optional small chip after the count ("1 needs an answer" in yellow, "2 tips" in AI purple); the description below.
 *  `meta` replaces the "N facts" count. */
export function ROverviewTopicCard({ icon, label, count, desc, meta, chip, onClick }: { icon: string; label: string; count: number; desc: string; meta?: ReactNode; chip?: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="h-khr-tplcard h-khr-ov2-topiccard" onClick={onClick}>
      <span className="h-khr-ov2-topiccard__head">
        <Icon name={icon} />
        <span className="h-khr-ov2-topiccard__name">
          <span className="h-khr-tplcard__title">{label}</span>
          <span className="h-khr-ov2-topiccard__sub">
            <span className="h-khr-ov2-topiccard__count">{meta ?? <>{count} {count === 1 ? 'fact' : 'facts'}</>}</span>
            {chip}
          </span>
        </span>
      </span>
      <p className="h-khr-tplcard__desc">{desc}</p>
    </button>
  )
}
export function ROverviewTopicGrid({ children }: { children: ReactNode }) {
  return <div className="h-khr-tplgrid h-khr-ov2-topicgrid">{children}</div>
}

/* ---------- the Knowledge Hub page frame (review, 3 Oct) ----------
 * Every Knowledge Hub page is a CONCEPT — where the facts behind Smart Listing tips come from, not a developed feature —
 * so its title carries the "Concept" chip. The frame is the channel template's: the sticky head (title + property
 * switcher, then an optional tab row) and a Split body whose right column is the side panel (Test). A sub-page (a topic)
 * gets the Strategy channel page's back chevron before its title instead of a "‹ Overview" link under it. */
export function ConceptChip() {
  return <span className="h-pill h-pill--neutral h-concept-chip">Concept</span>
}
export function KhrFrame({ title, property, back, desc, descAction, tabs, panel, children, titleEnd, right }: {
  title: ReactNode; property: Property; back?: { to: string; label: string }; desc?: ReactNode
  /** an action (e.g. Tips) at the right of the description's line, in the sticky head (review, 4 Oct) */
  descAction?: ReactNode
  /** the tab row, `.ch-tabrow` (QueryTabs + an optional chip at its right end, like Tips) */
  tabs?: ReactNode; panel?: ReactNode; children: ReactNode
  /** PageHead's own slots: next to the title (phones: the page's Tips, `.ch-tips-m`) and before the property switcher */
  titleEnd?: ReactNode; right?: ReactNode
}) {
  const lead = back ? <BackLink to={back.to} label={back.label}><Icon name="chevron-left" /></BackLink> : undefined
  return (
    <div className="ch-editor h-khr2">
      <div className="ch-editor__head">
        {/* the description (and its Tips) is part of the sticky head, like every property page's (review, 4 Oct) */}
        <div className="ch-page"><PageHead lead={lead} compactTitle={typeof title === 'string' ? title : undefined} title={<>{title}<ConceptChip /></>} titleEnd={titleEnd} right={right} property={property} desc={desc} descAction={descAction} /></div>
        {tabs}
      </div>
      <Split main={<div className="ch-page h-khr2__page">{children}</div>} panel={panel} />
    </div>
  )
}

/* ---------- Sources, rewired (review, 3 Oct): one row shape for both the Sources table and the Add-a-source table —
 * icon, name, then ONE line "{desc} · {meta}", equal top/bottom padding, the trailing status/actions centred. An add
 * option is the same row as a whole-row button, with a trailing "Add" button look (a span: no nested buttons). ---------- */
export function KhrSourceItem({ icon, name, desc, meta, action }: { icon: string; name: string; desc: string; meta?: string; action?: ReactNode }) {
  return (
    <div className="h-khr2-src-row">
      <Icon name={icon} size={18} className="h-khr2-src-row__icon" />
      <span className="h-khr2-src-row__text">
        <span className="h-khr2-src-row__name">{name}</span>
        <span className="h-khr2-src-row__line">{desc}{meta && <span className="h-khr2-src-row__meta"> · {meta}</span>}</span>
      </span>
      {action && <span className="h-khr2-src-row__action">{action}</span>}
    </div>
  )
}
export function KhrSourceAddItem({ icon, name, desc, onClick }: { icon: string; name: string; desc: string; onClick: () => void }) {
  return (
    <button type="button" className="h-khr2-src-row h-khr2-src-row--add" onClick={onClick}>
      <Icon name={icon} size={18} className="h-khr2-src-row__icon" />
      <span className="h-khr2-src-row__text">
        <span className="h-khr2-src-row__name">{name}</span>
        <span className="h-khr2-src-row__line">{desc}</span>
      </span>
      <span className="h-khr2-src-row__action"><span className="h-btn h-btn--secondary h-khr2-src-row__add" aria-hidden="true"><Icon name="plus" size={16} />Add</span></span>
    </button>
  )
}

/* ---------- Workflows, rewired (review, 3 Oct): a static concept gallery — the Content page's topic card, exactly
 * (`.h-khr-tplcard .h-khr-ov2-topiccard` in `.h-khr-tplgrid`), but an <article>: no hover, no pointer, not focusable. ---------- */
export function KhrWorkflowConceptCard({ icon, meta, title, desc }: { icon: string; meta: string; title: string; desc: string }) {
  return (
    <article className="h-khr-tplcard h-khr-ov2-topiccard h-khr2-wf-card">
      <span className="h-khr-tplcard__head"><Icon name={icon} /><span className="h-khr-ov2-topiccard__count">{meta}</span></span>
      <h3 className="h-khr-tplcard__title">{title}</h3>
      <p className="h-khr-tplcard__desc">{desc}</p>
    </article>
  )
}
