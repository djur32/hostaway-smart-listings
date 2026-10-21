/* Smart Listing v3 · WS-CH design-system additions (CSS in ds/v3/ch.css). Screens import from '../../ds'.
 * Channel pages + Classic editor: query-preserving tabs, section Save/Discard actions, the inline "all channels" note,
 * photo strip, status strip, summary cards, channel-specific rows, amenity rows, policy cards, price example. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { Button, CloseButton, Icon, Pill, cx } from './primitives'
import { type FieldState } from './sl3'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'
import { Dropdown } from './fieldscope'
import { scrollActiveTab } from './mobile'
import { useUnsavedChanges } from './unsaved'

/** Underline tabs (Hospitable's h-tabs) whose links carry their own query (e.g. keep `?tips=1` open across tabs).
 *  Listing's 5 tabs and ChannelPricing's 4 always fit the content column, but a longer row — Listing base › Pricing's
 *  6 (base/Pricing.tsx, 1 Oct) — can genuinely overflow it at normal (not just phone) desktop widths, where `.h-tabs`'s
 *  own `overflow-x: auto` already lets the row scroll but gives no visual sign there's more to it, and nothing
 *  scrolled a newly-active tab into view (confirmed: navigating straight to a hidden tab's `?tab=` rendered its
 *  content correctly but left the tab itself scrolled out of sight — not actually reachable by clicking through).
 *  Fixed generically here, for every QueryTabs caller, not just Pricing: `scrollActiveTab` (ds/mobile.tsx, already
 *  used by the phone-only ScrollTabs) scrolls the newly-active tab into view, but only when `active` itself changes
 *  — NOT on every render (unlike ds/mobile.tsx's own `useActiveTabIntoView`, which re-runs its layout effect on
 *  every render with no dependency array; wired to this component that fights a manual scroll attempt, since the
 *  effect reruns on the scroll-tracking state update below and yanks the row back to the still-active tab before a
 *  reader can ever drag/swipe to a hidden one). A small edge mask-fade (ds/components.css, `.h-tabs.is-faded-*`)
 *  shows there's more to scroll to; both are no-ops the moment a row doesn't overflow, so Listing/ChannelPricing
 *  look exactly as before. */
export function QueryTabs({ items, active }: { items: Array<{ id: string; label: ReactNode; to: string; count?: number }>; active: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { scrollActiveTab(ref.current) }, [active])
  const [fade, setFade] = useState<{ start: boolean; end: boolean }>({ start: false, end: false })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const overflowing = el.scrollWidth > el.clientWidth + 1
      setFade({ start: overflowing && el.scrollLeft > 1, end: overflowing && el.scrollLeft < el.scrollWidth - el.clientWidth - 1 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); ro.disconnect() }
  }, [items.length])
  return (
    <div ref={ref} className={cx('h-tabs', fade.start && 'is-faded-start', fade.end && 'is-faded-end')} role="tablist">
      {items.map((t) => (
        <Link key={t.id} to={t.to} replace className="h-tab ch-tab" role="tab" aria-selected={t.id === active}>
          {t.label}{t.count ? <span className="ch-tab__count">{t.count}</span> : null}
        </Link>
      ))}
    </div>
  )
}

/** Hospitable's section actions (HS-22) — now delegated to the shared unsaved-changes bar (ds/unsaved.tsx,
 *  concepts/smart-listing/UNSAVED-PATTERN.md, Antonio 1 Oct: "I don't want to see Discard changes or Save unless
 *  there are changes"). Nothing renders here while clean; once dirty, the sticky top strip (mounted once in
 *  AppShell) carries Discard/Save for every dirty section at once, and navigating away is guarded. This still
 *  registers the draft (`useUnsavedChanges`); the confirmation is the shared save toast (ds/unsaved.tsx, 4 Oct), with
 *  Undo: `onSave` may return its text ("Saved · sent to Airbnb", the toast's fallback summary), or false when
 *  validation blocks the save (the edit stays, no toast, and the bar keeps the draft dirty). One change here updates every caller
 *  (Listing, Pricing, Availability, Policies, …) at once. */
export function SaveActions(props: { dirty: boolean; onDiscard: () => void; onSave: () => void | boolean | string; saveLabel?: string; savedLabel?: string; discardLabel?: string; label?: string }) {
  const { dirty, onDiscard, onSave, label } = props
  // the confirmation is the shared save toast now (ds/unsaved.tsx, 4 Oct): onSave's text ("Saved · sent to Airbnb")
  // is its fallback summary; false = validation blocked the save (the edit stays, no toast)
  useUnsavedChanges({ dirty, onDiscard, onSave, label })
  return null
}

/** A tab or view loading (M-18): a small raspberry spinner centred in the content area. */
export function Loading({ label = 'Loading' }: { label?: string }) {
  return <div className="h-loading" role="status" aria-label={label}><span className="h-spinner" /></div>
}

/** Inline note under a listing-wide field: the change reaches every channel. With confirm/cancel it asks inline;
 *  without them it only warns, and the section's Save commits. */
export function ScopeConfirm({ text, confirmLabel, onConfirm, onCancel }: { text: ReactNode; confirmLabel?: string; onConfirm?: () => void; onCancel?: () => void }) {
  return (
    <div className="ch-confirm" role="status">
      <Icon name="layers-intersect" /><span className="ch-confirm__text">{text}</span>
      {onCancel && <Button kind="ghost" onClick={onCancel}>Cancel</Button>}{onConfirm && <Button kind="primary" onClick={onConfirm}>{confirmLabel}</Button>}
    </div>
  )
}

/* PhotoStrip was replaced by the real Photos row (PhotosRow, ./photos.tsx) and the All photos page (screens/channel/Photos.tsx). */

/** Hospitable's select (native, styled by .h-select). */
/** Hospitable's dropdown (HS-A01), not a native select: see Dropdown in ./fieldscope. */
export function SelectBox({ value, options, placeholder, onChange, label, disabled, selectRef }: { value?: string; options: string[]; placeholder?: string; onChange?: (v: string) => void; label: string; disabled?: boolean; selectRef?: Ref<HTMLButtonElement> }) {
  return <Dropdown buttonRef={selectRef} value={value} options={options} placeholder={placeholder} label={label} disabled={disabled} onChange={onChange} />
}

/** Tags as chips with "Add tag" (HS-22 Essentials › Tags). */
export function TagBox({ tags, onAdd, onRemove, addLabel = 'Add tag', disabled }: { tags: string[]; onAdd?: () => void; onRemove?: (t: string) => void; addLabel?: string; disabled?: boolean }) {
  return (
    <div className={cx('ch-tagbox', disabled && 'is-disabled')} aria-disabled={disabled || undefined}>
      {tags.map((t) => (
        <span key={t} className="ch-tagbox__tag">{t}{!disabled && onRemove && <CloseButton size="sm" className="ch-tagbox__x" label={`Remove ${t}`} onClick={() => onRemove(t)} />}</span>
      ))}
      {!disabled && <button type="button" className="ch-tagbox__add" onClick={onAdd}><Icon name="plus" />{addLabel}</button>}
    </div>
  )
}

/** A map placeholder with the pin (HS-25 "Pin location"). */
/** The pin map. Unlike the address (locked), the pin can be nudged: an "Edit" button on the map (Antonio, 3 Oct, as on
 *  Hospitable's own map); editing the pin itself isn't modelled in the prototype. */
export function MapBox({ label, disabled, onEdit }: { label: string; disabled?: boolean; onEdit?: () => void }) {
  return (
    <div className={cx('ch-map', disabled && 'is-disabled')} role="img" aria-label={`Map: ${label}`}>
      <span className="ch-map__pin"><Icon name="map-pin" /></span><span className="ch-map__label">{label}</span>
      {!disabled && <button type="button" className="ch-map__edit" onClick={onEdit}>Edit</button>}
    </div>
  )
}

/** Connection · last sync · listing status (channel overview). */
export function StatusStrip({ items }: { items: Array<{ label: string; value: ReactNode; sub?: ReactNode; ok?: boolean }> }) {
  return (
    <div className="ch-status">
      {items.map((i) => (
        <div key={i.label} className="ch-status__item">
          <span className="ch-status__label">{i.label}</span>
          <span className="ch-status__value">{i.ok && <span className="ch-status__dot" />}{i.value}</span>
          {i.sub && <span className="ch-status__sub">{i.sub}</span>}
        </div>
      ))}
    </div>
  )
}

/** NV-4a's summary card: eyebrow, a headline, a line, a link. */
export function SummaryCard({ eyebrow, title, children, foot }: { eyebrow: ReactNode; title?: ReactNode; children?: ReactNode; foot?: ReactNode }) {
  return (
    <section className="ch-card">
      <div className="ch-card__eyebrow">{eyebrow}</div>
      {title && <div className="ch-card__title">{title}</div>}
      {children && <div className="ch-card__body">{children}</div>}
      {foot && <div className="ch-card__foot">{foot}</div>}
    </section>
  )
}

/** Plain-text scope captions (Antonio 30 Sep: neutral text, no colours, icons or change markers). */
const SCOPE_TEXT: Partial<Record<FieldState, (ch: string) => string>> = {
  override: (ch) => `Custom for ${ch}`, only: (ch) => `${ch} only`, channel: (ch) => `Only on ${ch}`, inherit: () => 'Uses the Base',
  listing: () => 'All channels', set: (ch) => `Set by ${ch}`, hub: () => 'Knowledge Hub', linked: () => 'From another section',
}
/** One row of "What is specific to {channel}": label + where it comes from, value (clamped to two lines), a neutral
 *  scope caption and a black text link. */
export function SpecificRow({ label, sub, value, state, channel, to, toLabel = 'Edit' }: { label: ReactNode; sub?: ReactNode; value: ReactNode; state: FieldState; channel?: ChannelId; to?: string; toLabel?: string }) {
  const ch = channel ? CHANNELS[channel].name : 'this channel'
  return (
    <div className="ch-spec">
      <div className="ch-spec__label"><b>{label}</b>{sub && <span>{sub}</span>}</div>
      <div className="ch-spec__value">{value}</div>
      <div className="ch-spec__state"><span className="ch-spec__scope">{SCOPE_TEXT[state]?.(ch) ?? ''}</span>{to && <Link className="h-textlink" to={to}>{toLabel}</Link>}</div>
    </div>
  )
}

/** One change sent to a channel (Save = commit, QA A08): what, where, from → to, the channel's answer, when.
 *  Status copies Hospitable's chips: Sent (grey) → Live (green), or In review (orange). */
export function ChangeReceipt({ what, section, origin, from, to, status, note, time }: {
  what: ReactNode; section?: ReactNode; origin?: ReactNode; from?: string; to: string; status: 'sent' | 'live' | 'review'; note?: ReactNode; time: ReactNode
}) {
  return (
    <div className="ch-rcpt">
      <div className="ch-rcpt__main">
        <span className="ch-rcpt__what"><b>{what}</b>{(section || origin) && <span>{[section, origin].filter(Boolean).map((x, i) => <span key={i}>{i ? ' · ' : ''}{x}</span>)}</span>}</span>
        <span className="ch-rcpt__diff">
          {from && <><span className="ch-rcpt__from" title={from}>{from}</span><Icon name="arrow-right" size={16} /></>}
          <span className="ch-rcpt__to" title={to}>{to || 'Empty'}</span>
        </span>
      </div>
      <div className="ch-rcpt__status">
        {status === 'live' ? <Pill kind="recommended">Live</Pill> : status === 'review' ? <Pill kind="warning">In review</Pill> : <Pill>Sent</Pill>}
        {note && status !== 'sent' && <small>{note}</small>}
      </div>
      <span className="ch-rcpt__time">{time}</span>
    </div>
  )
}
export function SpecificList({ children }: { children: ReactNode }) {
  return <div className="ch-speclist">{children}</div>
}

/** Amenity row (HS-26/27 + CL-07): name, scope, optional note and tag, one trailing action.
 *  `info` is a homogenisation note — a decision taken to reconcile the channels, e.g. Booking.com calling a dedicated
 *  workspace a "Desk" (Antonio, 1 Oct round 4: "any decisions that have been made to homogenize the content put in an
 *  i icon with a tooltip for texts like this"). It is the product's shared tooltip (.h-tooltip-anchor + .h-tooltip),
 *  the same anchor the Tips panel's WHY sources use, never a second tooltip style.
 *  `side` is the phone form of the action (ds/mobile.md §8, images/38–39): a separate square icon button to the right of
 *  the bordered card. Desktop keeps the text link inside the card; the wrapper is `display: contents` there. */
export function AmenityRow({ name, scope, info, note, tag, tone = 'base', action, side }: { name: string; scope: ReactNode; info?: string; note?: ReactNode; tag?: ReactNode; tone?: 'base' | 'custom' | 'off'; action?: ReactNode; side?: { icon: string; label: string; onClick: () => void } }) {
  return (
    <div className="ch-amenity-line">
      <div className={cx('ch-amenity', `ch-amenity--${tone}`)}>
        <div className="ch-amenity__main">
          <div className="ch-amenity__head">
            <b>{name}</b>
            {info && (
              <span className="h-tooltip-anchor ch-amenity__info" tabIndex={0} role="note" aria-label={`Why this differs: ${info}`}>
                <Icon name="info-circle" size={16} />
                <span role="tooltip" className="h-tooltip">{info}</span>
              </span>
            )}
            <span className="ch-amenity__scope">{scope}</span>{tag && <span className="ch-amenity__tag">{tag}</span>}
          </div>
          {note && <div className="ch-amenity__note">{note}</div>}
        </div>
        {action && <div className="ch-amenity__action">{action}</div>}
      </div>
      {side && <button type="button" className="ch-amenity-side" aria-label={side.label} onClick={side.onClick}><Icon name={side.icon} size={18} /></button>}
    </div>
  )
}

/** A row in a channel's "Add amenities" drawer (Antonio, 1 Oct round 4, reference screenshots): the amenity's name, its
 *  scope on the right — a channel mark when the amenity belongs to one channel, or the words when it is shared — and one
 *  trailing state icon. Not added = white row with a "+"; added = grey-filled row with a "✓". The whole row is the
 *  toggle (≥ 44px). `opens` marks an amenity that cannot be a one-tap yes because the channel wants structured
 *  sub-attributes with it (Airbnb's parking type / parking access): the row opens a small form instead of toggling, so
 *  it reads as a chevron, not a "+".
 *  Deliberately its own row, not ds/details' AmenityPick: that one is the Listing-details drawer (adds to the Base list,
 *  for every channel) and says "added. Remove" — a channel page never offers to remove anything. */
export function ChAmenityPick({ name, scope, added, opens, onToggle }: { name: string; scope?: ReactNode; added: boolean; opens?: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={cx('ch-pick', added && 'is-added')} aria-pressed={added}
      aria-label={added ? `${name}, on this channel. Undo` : opens ? `Add ${name}, choose details` : `Add ${name}`} onClick={onToggle}>
      <span className="ch-pick__name"><b>{name}</b>{scope && <span className="ch-pick__scope">{scope}</span>}</span>
      <span className="ch-pick__icon" aria-hidden="true"><Icon name={added ? 'check' : opens ? 'chevron-right' : 'plus'} /></span>
    </button>
  )
}

/** Cancellation policy card (HS-47), with the true scope underneath. */
export function PolicyCard({ title, kicker, body, meta, action }: { title: string; kicker?: string; body: string; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ch-policy">
      <div className="ch-policy__main">
        <b className="ch-policy__title">{title}</b>{kicker && <b className="ch-policy__kicker">{kicker}</b>}
        <p className="ch-policy__body">{body}</p>{meta && <p className="ch-policy__meta">{meta}</p>}
      </div>
      {action}
    </div>
  )
}

/** "A 7-night stay · €293 → €277" inside a money tip (CV-07). */
export function PriceExample({ label, from, to, unit = 'guest total before fees' }: { label: string; from: string; to: string; unit?: string }) {
  return <div className="ch-example"><span>{label}</span><span className="ch-example__nums"><del>{from}</del><ins>{to}</ins><small>{unit}</small></span></div>
}


/** Section title + description + right-hand actions (Hospitable's "Arrival · Discard changes / Save" head). */
export function SectionHead({ title, desc, actions }: { title: ReactNode; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="ch-sechead">
      <div><h2 className="ch-sechead__title">{title}</h2>{desc && <p className="ch-sechead__desc">{desc}</p>}</div>
      {actions && <div className="ch-sechead__actions">{actions}</div>}
    </div>
  )
}

/* ---------------- NumberField: the one numeric control, product-wide ---------------- */
/** Antonio, 1 Oct: "when you have these numbers, you always have this type of selector that allows you to go up and
 *  down with the keyboard — make sure that this is available in all of the items that are numbers."
 *  Antonio, 3 Oct, with two crops of Hospitable's real money input: "All the money values should have the currency
 *  before, then the up and down arrows small, not taking up the whole thing, styled exactly the same. The ones that are
 *  not money but are numbers: the up and down arrows work the same and sit at the same place."
 *
 *  Anatomy (CSS `.h-numfield` in ds/components.css, next to the affix group it extends):
 *    [€ grey box]  value ………… [unit word] [▴▾]  [per-stay grey box]
 *  - `currency` (money): Hospitable's grey start affix, € in semibold — HS-L10 "Extra guest fee", HS-33 "Cleaning fee".
 *    A `unit` of "€"/"$"/"£" is read as a currency too, so every caller gets the currency on the left.
 *  - `unit` (non-money: %, guests, nights): a plain word inside the white field at the right, NOT a grey box —
 *    Hospitable's own treatment ("1 guest", "5 %", "4 guests": HS-L10, HS-C06, HS-C10).
 *  - The stepper: two tiny stacked arrows (16px column, light grey, 2px radius) inset 4px from the right edge of the
 *    white field, so it sits in the same spot on every numeric field; like the native spinner in the reference it is
 *    hidden at rest and shows on hover / focus, and is always shown (with bigger targets) on touch screens.
 *  - `per` ("per stay"): Hospitable's grey end affix (HS-33), after the field — the stepper stays inside the white part.
 *
 *  Deliberately a *string* value with numeric `min`/`max`/`step`: each screen keeps its own parsing, clamping and
 *  storage format (Availability stores "2 nights", Pricing stores a bare decimal), so the control changes no screen's
 *  validation or draft behaviour — the stepper and the Up/Down keys are only more ways to reach the same `onChange`. */
const CURRENCY = new Set(['€', '$', '£'])
export function NumberField({
  value, onChange, currency, currencySelect, unit, per, perSelect, label, disabled, invalid, describedBy, inputRef, autoFocus,
  min = 0, max = 9999, step = 1, decimals = 0, inputMode = 'numeric',
}: {
  value: string
  onChange: (next: string) => void
  /** money: the currency symbol, shown in the grey box before the value */
  currency?: string
  /** non-money unit word ("%", "nights", "guests"), shown plain inside the field, before the stepper */
  unit?: ReactNode
  /** a grey end box after the field ("per stay", HS-33) */
  per?: ReactNode
  /** the end box as a dropdown (Hospitable's Fees: "per stay ⌄", Antonio 3 Oct) / the currency box as a dropdown ("€ ⌄") */
  perSelect?: { value: string; options: string[]; onChange: (v: string) => void }
  currencySelect?: { value: string; options: string[]; onChange: (v: string) => void }
  label: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>
  autoFocus?: boolean
  min?: number
  max?: number
  step?: number
  decimals?: number
  inputMode?: 'numeric' | 'decimal'
}) {
  const cur = currency ?? (typeof unit === 'string' && CURRENCY.has(unit) ? unit : undefined)
  const word = cur && unit === cur ? undefined : unit
  const own = useRef<HTMLInputElement | null>(null)
  const setRef = useCallback((el: HTMLInputElement | null) => {
    own.current = el
    if (typeof inputRef === 'function') inputRef(el)
    else if (inputRef) (inputRef as { current: HTMLInputElement | null }).current = el
  }, [inputRef])
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const fmt = (n: number) => (decimals > 0 ? String(Number(n.toFixed(decimals))) : String(Math.round(n)))
  /** An empty field steps from `min`, so the first press on a blank input gives a usable value rather than NaN. */
  const bump = (delta: number) => {
    if (disabled) return
    const now = value.trim() === '' ? NaN : Number(value)
    onChange(fmt(clamp(Number.isNaN(now) ? min + (delta > 0 ? step : 0) : now + delta)))
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const d = e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step
      : e.key === 'PageUp' ? step * 10 : e.key === 'PageDown' ? -step * 10 : 0
    if (!d) return
    e.preventDefault() // keep the caret put and the page still; the field owns these keys
    bump(d)
  }
  /** Pressing an arrow keeps the caret in the field (as the native spinner does), so the focus ring and the
   *  stepper stay up between clicks and the next key press still steps. */
  const press = (e: { preventDefault: () => void }) => { e.preventDefault(); own.current?.focus() }
  const num = value.trim() === '' ? NaN : Number(value)
  // phones: a unit dropdown with a long option ("per guest per night") will not share a 343px row with the amount, so it drops to its own full-width row
  const stack = !!perSelect && perSelect.options.some((o) => o.length > 12)
  return (
    <div className={cx('h-input-group', 'h-numfield', (currencySelect || perSelect) && 'has-dd', stack && 'h-numfield--stack', disabled && 'is-disabled', invalid && 'is-error')}>
      {currencySelect
        ? <span className="h-affix h-affix--start h-affix--dd"><Dropdown value={currencySelect.value} options={currencySelect.options} onChange={currencySelect.onChange} label="Currency" disabled={disabled} /></span>
        : cur && <span className="h-affix h-affix--start">{cur}</span>}
      <input ref={setRef} className="h-input" inputMode={inputMode} value={value} aria-label={label} disabled={disabled} autoFocus={autoFocus}
        aria-invalid={invalid || undefined} aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
        // a number field is never left empty (Antonio, 3 Oct: "if it's zero, put zero"): leaving it blank sets the minimum
        onBlur={() => { if (!disabled && value.trim() === '') onChange(fmt(clamp(min))) }} />
      {word != null && <span className="h-numfield__unit">{word}</span>}
      {/* aria-hidden + tabIndex -1: the input already takes Up/Down, so these are a pointer affordance only and would
          otherwise add two redundant tab stops to every numeric row. No stepper at all on a disabled field. */}
      {!disabled && (
        <span className="h-numfield__spin" aria-hidden="true">
          <button type="button" tabIndex={-1} className="h-numfield__btn h-numfield__btn--up" disabled={!Number.isNaN(num) && num >= max} onMouseDown={press} onClick={() => bump(step)} />
          <button type="button" tabIndex={-1} className="h-numfield__btn h-numfield__btn--down" disabled={!Number.isNaN(num) && num <= min} onMouseDown={press} onClick={() => bump(-step)} />
        </span>
      )}
      {perSelect
        ? <span className="h-affix h-affix--end h-affix--dd"><Dropdown value={perSelect.value} options={perSelect.options} onChange={perSelect.onChange} label="Charged" disabled={disabled} /></span>
        : per != null && <span className="h-affix h-affix--end">{per}</span>}
    </div>
  )
}
