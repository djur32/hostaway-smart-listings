/* Listing details (Property › Shared › Listing details): DS additions. CSS: ds/components.css "LISTING DETAILS".
 * The property's source of truth: a quiet banner, the desktop drawer and dialog (bottom sheets on phones), the filter
 * chips, the amenity line with square icon actions, the amenity pick row, step progress, a number stepper,
 * radio cards and a checkbox list. Screens compose these; no bespoke cards, rows or colours in screens. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button, CloseButton, Icon, Mark, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

/* ---------- source of truth ---------- */
/** A compact single-line strip under the page head: this page holds the property's facts; channel pages adapt them.
 *  Provenance colours (--prov-truth-*), quiet: no card, no shadow, one text link.
 *  Superseded in the page head by SourceOfTruthBadge below (Antonio, 1 Oct: more evident, no explainer sentence,
 *  integrated with the title rather than a separate bordered row) — kept here in case another Shared screen wants
 *  the fuller strip with its own explainer text. */
export function SourceOfTruthBanner({ children, linkLabel = 'How channels use it', onLink }: { children?: ReactNode; linkLabel?: string; onLink?: () => void }) {
  return (
    <p className="h-truth" role="note">
      <Icon name="database" size={16} />
      <span className="h-truth__text"><b>Source of truth</b><span aria-hidden="true"> · </span>{children ?? 'Every channel’s listing is built from these details. Channel pages adapt them.'}</span>
      {onLink && <button type="button" className="h-textlink h-truth__link" onClick={onLink}>{linkLabel}</button>}
    </p>
  )
}
/** The page-head version (Antonio, 1 Oct): sits right next to the "Listing details" title as a small tinted pill
 *  — same recipe as the real status chips (pill shape, light tinted fill, thin tinted border, coloured text) — no
 *  explainer sentence. The whole pill is the "How channels use it" trigger (reducing text, not adding a second
 *  element beside it); it opens the same HowChannelsUseIt dialog as before. */
export function SourceOfTruthBadge({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="h-pill h-pill--truth h-truth-badge" onClick={onClick} aria-label="Source of truth · How channels use these details">
      Source of truth
    </button>
  )
}

/** A Listing base page title with its "Source of truth" chip and the dialog it opens (Antonio, 3 Oct: the chip belongs on
 *  every Listing base page — Details, Pricing, Availability — so it's always clear this is the source of truth). */
export function TruthTitle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {children}<SourceOfTruthBadge onClick={() => setOpen(true)} />
      <DetailsDialog open={open} title="How channels use these details" size="sm" onClose={() => setOpen(false)}
        footer={<Button kind="primary" onClick={() => setOpen(false)}>Got it</Button>}>
        <ol className="h-truth-explain">
          <li>Every channel’s listing is built from the Listing base: the texts, arrival, location, amenities, rules, pricing and availability.</li>
          <li>Each channel’s own pages adapt them for that channel. A field you customize there keeps its own value.</li>
          <li>Saving here sends the change to every channel that uses it. Channels with their own value keep it.</li>
        </ol>
      </DetailsDialog>
    </>
  )
}

/* ---------- layers: presence, focus, Esc ---------- */
const EXIT_MS = 200
function usePresence(open: boolean) {
  const [shown, setShown] = useState(open)
  useEffect(() => {
    if (open) { setShown(true); return }
    const t = setTimeout(() => setShown(false), EXIT_MS)
    return () => clearTimeout(t)
  }, [open])
  return { mounted: open || shown, leaving: !open && shown }
}
function useLayer(ref: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus({ preventScroll: true }) // an autofocused field inside keeps focus
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // the innermost open layer closes first (a dialog over the drawer)
      const layers = document.querySelectorAll('.h-ld-layer:not(.is-leaving)')
      if (layers[layers.length - 1] !== ref.current?.closest('.h-ld-layer')) return
      e.stopPropagation(); close.current()
    }
    document.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('keydown', onKey, true); opener?.focus?.({ preventScroll: true }) }
  }, [open, ref])
}

/** Desktop: a right-side drawer over a dimmed page, sliding in subtly (24px + fade, --dur-drawer). Phones: a BottomSheet
 *  (`fullScreen` for longer edits; ds/mobile.md §7). Head (title + ×), a scrolling body (thin scrollbar), a footer. */
export function DetailsDrawer({ open, title, onClose, children, footer, label, fullScreen }: {
  open: boolean; title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; label?: string; fullScreen?: boolean
}) {
  const mobile = useIsMobile()
  const { mounted, leaving } = usePresence(open && !mobile)
  const ref = useRef<HTMLDivElement>(null)
  useLayer(ref, open && !mobile, onClose)
  if (mobile) return <BottomSheet open={open} title={title} onClose={onClose} footer={footer} label={label} fullScreen={fullScreen}>{children}</BottomSheet>
  if (!mounted) return null
  return createPortal(
    <div className={cx('h-ld-layer', leaving && 'is-leaving')}>
      <div className="h-ld-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="h-ld-drawer" role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)} tabIndex={-1}>
        <div className="h-ld-drawer__head">
          <h2 className="h-ld-drawer__title">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        <div className="h-ld-drawer__body h-scroll-thin">{children}</div>
        {footer && <div className="h-ld-drawer__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Desktop: a centred dialog (Filters, Update amenity). Phones: a BottomSheet, `phoneFull` for multi-step edits.
 *  `footStart` sits left in the footer ("Remove filters"). */
export function DetailsDialog({ open, title, onClose, children, footer, footStart, label, phoneFull, size = 'md', top, tall }: {
  open: boolean; title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; footStart?: ReactNode; label?: string
  phoneFull?: boolean; size?: 'sm' | 'md'
  /** Multi-step: a fixed height, so the dialog doesn't jump between steps. */
  tall?: boolean
  /** Under the title, above the scrolling body (e.g. the step progress). */
  top?: ReactNode
}) {
  const mobile = useIsMobile()
  const { mounted, leaving } = usePresence(open && !mobile)
  const ref = useRef<HTMLDivElement>(null)
  useLayer(ref, open && !mobile, onClose)
  const foot = footer || footStart ? <div className="h-ld-dialog__foot">{footStart && <div className="h-ld-dialog__foot-start">{footStart}</div>}{footer}</div> : undefined
  if (mobile) return <BottomSheet open={open} title={title} onClose={onClose} footer={foot} label={label} fullScreen={phoneFull}>{top}{children}</BottomSheet>
  if (!mounted) return null
  return createPortal(
    <div className={cx('h-ld-layer', 'h-ld-layer--center', leaving && 'is-leaving')}>
      <div className="h-ld-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={cx('h-ld-dialog', `h-ld-dialog--${size}`, tall && 'h-ld-dialog--tall')} role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)} tabIndex={-1}>
        <div className="h-ld-dialog__head">
          <h2 className="h-ld-dialog__title">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        {top && <div className="h-ld-dialog__top">{top}</div>}
        <div className="h-ld-dialog__body h-scroll-thin">{children}</div>
        {foot}
      </div>
    </div>,
    document.body,
  )
}

/* ---------- filters ---------- */
/** A labelled group of multi-select chips. Selected = green fill + check (DS: selection is green). */
export function ChipGroup<T extends string>({ label, items, value, onChange }: { label: string; items: Array<{ id: T; label: ReactNode }>; value: T[]; onChange: (v: T[]) => void }) {
  const id = useId()
  return (
    <fieldset className="h-ld-chips" aria-labelledby={id}>
      <legend className="h-ld-chips__label" id={id}>{label}</legend>
      <div className="h-ld-chips__list">
        {items.map((i) => {
          const on = value.includes(i.id)
          return (
            <button key={i.id} type="button" className="h-ld-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== i.id) : [...value, i.id])}>
              {on && <Icon name="check" size={16} />}{i.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
/** "Filters" with the number of active filters. */
export function FiltersButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button type="button" className="h-btn h-btn--secondary h-ld-filters" onClick={onClick} aria-label={count ? `Filters, ${count} active` : 'Filters'}>
      <Icon name="filter-2" size={18} />Filters{count > 0 && <span className="h-ld-filters__count" aria-hidden="true">{count}</span>}
    </button>
  )
}

/* ---------- amenities ---------- */
/** An amenity on the property: bordered card (name, an exception label only when it isn't on every channel, a detail
 *  line) and separate square icon buttons to its right: pencil (details) and trash. Same at every width. */
export function AmenityLine({ name, flag, note, onEdit, onRemove, channels }: { name: string; flag?: ReactNode; note?: ReactNode; onEdit?: () => void; onRemove?: () => void
  /** Only when it isn't on every channel: the marks of the channels that list it, right after the name (Antonio, 3 Oct:
   *  "show the ones that are specific to a certain channel by adding the logo next to the name — just the main thing"). */
  channels?: ChannelId[] }) {
  return (
    <div className="h-ld-amenity">
      <div className="h-ld-amenity__card">
        <div className="h-ld-amenity__head"><b>{name}</b>{channels?.length ? <span className="h-ld-amenity__marks" aria-label={`On ${channels.map((c) => CHANNELS[c].name).join(', ')} only`}>{channels.map((c) => <Mark key={c} channel={c} />)}</span> : null}{flag && <span className="h-ld-flag">{flag}</span>}</div>
        {note && <div className="h-ld-amenity__note">{note}</div>}
      </div>
      {onEdit && <button type="button" className="h-ld-square" aria-label={`Edit ${name} details`} onClick={onEdit}><Icon name="pencil" /></button>}
      {onRemove && <button type="button" className="h-ld-square" aria-label={`Remove ${name}`} onClick={onRemove}><Icon name="trash" /></button>}
    </div>
  )
}
/** The scope caption a pick row carries: 'all' (every connected channel has a field for it) or the channels that do.
 *  Unlike the amenity *list*, which labels exceptions only, every row in the picker says what adding it will cover
 *  (REAL·PRODUCT refs 07, 12) — you are choosing, so the reach is part of the choice. */
export type AmenityScope = ChannelId[] | 'all'
const scopeLabel = (scope: AmenityScope) =>
  scope === 'all' ? 'All channels' : scope.map((c) => CHANNELS[c].name).join(', ')

/** A row in the Add amenity drawer (the real one): a tap toggles and saves. A bordered card with the amenity's name,
 *  its scope caption right beside it ("All channels", or the mark of each channel that carries it), and the state at
 *  the right end: not added = white row with a "+", added = grey row with a check. `busy` = saving: the icon turns
 *  (sync glyph) and the row ignores taps. The whole row is the button (≥ 44px tall). */
export function AmenityPick({ name, scope, added, busy, onToggle }: { name: string; scope: AmenityScope; added: boolean; busy?: boolean; onToggle: () => void }) {
  const marks = scope === 'all' ? null : scope
  return (
    <button type="button" className={cx('h-ld-pick', added && 'is-added', busy && 'is-busy')} aria-pressed={added} aria-busy={busy || undefined}
      aria-label={`${name}, ${scopeLabel(scope)}. ${busy ? 'Updating' : added ? 'Added. Remove' : 'Add'}`} onClick={() => { if (!busy) onToggle() }}>
      <span className="h-ld-pick__name">
        <b>{name}</b>
        {marks
          ? marks.length > 0 && <span className="h-ld-pick__scope" aria-hidden="true">{marks.map((c) => <Mark key={c} channel={c} size={14} />)}</span>
          : <span className="h-ld-pick__scope" aria-hidden="true">All channels</span>}
      </span>
      <span className="h-ld-pick__icon" aria-hidden="true"><Icon name={busy ? 'refresh' : added ? 'check' : 'plus'} size={24} /></span>
    </button>
  )
}

/* ---------- multi-step edit ---------- */
/** "Step 1 of 3 · Parking type" and a thin progress bar. */
export function StepProgress({ step, total, label }: { step: number; total: number; label?: string }) {
  return (
    <div className="h-ld-steps">
      <span className="h-ld-steps__text">Step {step} of {total}{label ? <> · <b>{label}</b></> : null}</span>
      <span className="h-ld-steps__bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Step ${step} of ${total}`}>
        <span style={{ width: `${Math.round((step / total) * 100)}%` }} />
      </span>
    </div>
  )
}
/** Radio cards (Hospitable's option cards): one choice; an optional trailing node (a channel mark). */
export function RadioCards({ legend, name, options, value, onChange }: { legend: string; name: string; options: Array<{ value: string; label: string; trail?: ReactNode }>; value?: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="h-ld-fieldset">
      <legend className="h-ld-legend">{legend}</legend>
      <div className="h-radio-cards h-ld-radios">
        {options.map((o) => (
          <label key={o.value} className="h-radio-card h-ld-radio">
            <input className="h-radio" type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="h-ld-radio__label">{o.label}{o.trail}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
/** "Number of spaces  [–] [ 2 ] [+]". Empty = not set. */
export function NumberStepper({ label, value, onChange, step = 1, min = 0, max = 999 }: { label: string; value?: number; onChange: (v: number | undefined) => void; step?: number; min?: number; max?: number }) {
  const id = useId()
  const round = (n: number) => Math.round(n * 10) / 10
  const set = (n: number) => onChange(round(Math.min(max, Math.max(min, n))))
  return (
    <div className="h-ld-stepper">
      <label className="h-ld-stepper__label" htmlFor={id}>{label}</label>
      <div className="h-ld-stepper__ctrl">
        <button type="button" className="h-ld-square h-ld-square--sm" aria-label={`Decrease ${label}`} disabled={value === undefined || value <= min} onClick={() => set((value ?? min) - step)}><Icon name="minus" /></button>
        <input id={id} className="h-input h-ld-stepper__input" inputMode="decimal" value={value ?? ''}
          onChange={(e) => { const t = e.target.value.replace(',', '.').replace(/[^\d.]/g, ''); onChange(t === '' ? undefined : Math.min(max, Number(t) || 0)) }} />
        <button type="button" className="h-ld-square h-ld-square--sm" aria-label={`Increase ${label}`} disabled={value !== undefined && value >= max} onClick={() => set(value === undefined ? Math.max(min, step) : value + step)}><Icon name="plus" /></button>
      </div>
    </div>
  )
}
/** A list of checkboxes under a question. */
export function CheckList({ legend, options, value, onChange }: { legend: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset className="h-ld-fieldset">
      <legend className="h-ld-legend">{legend}</legend>
      <div className="h-ld-checks">
        {options.map((o) => (
          <label key={o} className="h-ld-check">
            <input type="checkbox" className="h-checkbox" checked={value.includes(o)} onChange={(e) => onChange(e.target.checked ? [...value, o] : value.filter((x) => x !== o))} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
