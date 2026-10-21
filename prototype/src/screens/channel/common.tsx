/* WS-CH shared helpers for the channel screens (overview, listing, pricing, policies). */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Mark, SettingRow } from '../../ds'
import type { FieldState } from '../../ds'
import { DEFAULT_PLAN, isListingChannel, tipsFor, type FieldDef, type ListingChannel } from '../../data/sl3'
import { useStore, type FieldVisibility } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { useListingChannels } from '../../store/selectors'
import { seedSmartOn } from '../smart/shared'
import { commitAndSend, savedLabel } from '../push/changes'

export const CH_NAME: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct' }
/** The property's other channels (`chs`: its connected channels, useListingChannels). */
export const OTHERS = (c: ListingChannel, chs: ListingChannel[]) => chs.filter((x) => x !== c)

export function useChannel(): ListingChannel | null {
  const { channel } = useParams()
  return isListingChannel(channel) ? channel : null
}

/** Demo URL states for screenshots and the Loom (not product behaviour):
 *  ?smart=on|off   Smart Listings on or off     ?accept=<tipId>   that tip already accepted
 *  ?autopilot=1|0  this channel's strategy runs on Autopilot (editor read-only) or Suggest */
export function useChannelDemoParams(c: ListingChannel | null) {
  const [params] = useSearchParams()
  const smart = params.get('smart')
  const accept = params.get('accept')
  const auto = params.get('autopilot')
  useEffect(() => {
    if (!c || (auto !== '1' && auto !== '0')) return
    const s = useStore.getState()
    if (auto === '1' && (!s.smartListings || !s.sl3.setupDone)) seedSmartOn()
    useStore.getState().sl3Plan(c, { mode: auto === '1' ? 'autopilot' : 'suggest' })
    if (auto === '1') useStore.getState().sl3Pause(c, false)
  }, [auto, c])
  useEffect(() => {
    const s = useStore.getState()
    if (smart === 'on' && !s.smartListings) s.setSmartListings(true)
    if (smart === 'off' && s.smartListings) s.setSmartListings(false)
  }, [smart])
  useEffect(() => {
    if (!accept || !c) return
    const t = tipsFor(c).find((x) => x.id === accept) // ?accept=<id>: the active property's tips (scenario or generated)
    const s = useStore.getState()
    if (!t || s.sl3.tips[t.id] === 'accepted') return
    s.sl3Tip(t.id, 'accepted')
    if (t.to) s.sl3Custom(c, t.field, t.to)
  }, [accept, c])
}

/** True for a moment after `key` changes (a tab, channel or view loading): screens show <Loading /> meanwhile (M-18). */
export function useBriefLoading(key: string, ms = 350) {
  const [ready, setReady] = useState<string | null>(null)
  useEffect(() => { const t = setTimeout(() => setReady(key), ms); return () => clearTimeout(t) }, [key, ms])
  return ready !== key
}

/** Smart Listings for this channel: on/off, the plan, autopilot state. Selects stable slices only (Zustand v5). */
export function useChannelPlan(c: ListingChannel) {
  const on = useStore((s) => s.smartListings)
  const plan = useStore((s) => s.sl3.plans[c])
  const paused = useStore((s) => !!s.sl3.paused[c])
  const inPlan = useStore((s) => s.sl3.channels.includes(c))
  const p = plan ?? DEFAULT_PLAN
  const active = on && (inPlan || !!plan) && c !== 'direct'
  return { on, active, plan: p, paused, autopilot: active && p.mode === 'autopilot' && !paused }
}

export function ChannelLead({ c }: { c: ListingChannel }) {
  return <Mark channel={c} size={24} />
}

/* ---------- effective values: Base → channel (inherit / override), listing-wide, hub, set ---------- */
export interface FieldView { state: FieldState; orig: FieldState; value: string; base: string; changed: boolean }
export function viewOf(def: FieldDef, c: ListingChannel, custom: Record<string, string | null> | undefined, baseEdits: Record<string, string>): FieldView {
  const orig: FieldState = def.state[c] ?? 'inherit'
  const base = baseEdits[def.key] ?? def.base ?? ''
  const origValue = orig === 'override' || orig === 'only' || orig === 'channel' ? def.value?.[c] ?? def.base ?? '' : def.base ?? ''
  const cv = custom?.[def.key]
  let state = orig
  let value = origValue
  if (typeof cv === 'string') { state = orig === 'only' || orig === 'channel' ? orig : 'override'; value = cv }
  else if (cv === null) { state = orig === 'override' ? 'inherit' : orig; value = base }
  else if (orig === 'inherit' || orig === 'listing' || orig === 'hub' || orig === 'set' || orig === 'linked') value = base
  const changed = state !== orig || value !== origValue
  return { state, orig, value, base, changed }
}

export function useFieldCustom(c: ListingChannel) {
  const custom = useStore((s) => s.sl3.custom[c])
  const base = useStore((s) => s.sl3.base)
  return useMemo(() => ({ custom, base }), [custom, base])
}

/** Back to how it was before this session (the store's sl3Custom can only set a value or the Base). */
export function discardCustom(c: ListingChannel, keys: string[]) {
  useStore.setState((s) => {
    const cur = { ...(s.sl3.custom[c] ?? {}) }
    for (const k of keys) delete cur[k]
    return { sl3: { ...s.sl3, custom: { ...s.sl3.custom, [c]: cur } } }
  })
}

/* ---------- section draft: Hostaway's "Discard changes / Save" (DS.md "Field row") ----------
 * Every edit inside a section (typing, Customize for {channel}, Use the Base, amenity add/remove, listing-wide edits)
 * stays local until Save. Save is the commit (review, 30 Sep; QA A08): it writes the store (sl3Custom / sl3Base) and
 * sends the change to the channel right away, one receipt per change (screens/push/changes.ts); a listing-wide edit
 * goes to every channel that uses it. Discard drops it. The draft belongs to one section (channel + tab): leaving the
 * tab drops unsaved edits. No "save as draft" here. */
/** `undefined` = remove the store entry (back to how the listing was); `null` = back to the Base; string = custom value. */
type DraftVal = string | null | undefined
interface DraftState { key: string; custom: Record<string, { v: DraftVal }>; base: Record<string, string>; open: Record<string, boolean> }
export interface SectionDraft {
  c: ListingChannel
  /** Effective values = store + draft. Read these, not the store, inside a section. */
  custom: Record<string, string | null> | undefined
  base: Record<string, string>
  dirty: boolean
  /** Autopilot runs this channel: every row is read-only (DS disabled, no caption actions) until it is turned off. */
  readOnly: boolean
  /** Listing-wide rows opened for editing with "Edit for all channels". */
  isOpen: (k: string) => boolean
  setOpen: (k: string, on: boolean) => void
  setCustom: (k: string, v: DraftVal) => void
  setBase: (k: string, v: string, fallback: string) => void
  resetBase: (k: string) => void
  hasBase: (k: string) => boolean
  /** Commits and sends; returns the confirmation for SaveActions ("Saved · sent to Airbnb"). */
  save: () => string
  /** Just the unsaved changes (not merged with the store): what the Classic → Canvas switch hands over to the Canvas's
   *  own draft (screens/canvas/CanvasView.tsx handDraftToCanvas), so switching views never silently drops them. */
  pending?: () => { custom: Record<string, DraftVal>; base: Record<string, string> }
  discard: () => void
}
const empty = (key: string): DraftState => ({ key, custom: {}, base: {}, open: {} })
export function useSectionDraft(c: ListingChannel, section: string, opts: { readOnly?: boolean } = {}): SectionDraft {
  const store = useFieldCustom(c)
  const channels = useListingChannels() // a listing-wide value goes to this property's channels only
  const key = `${c}:${section}`
  const [raw, set] = useState<DraftState>(() => empty(key))
  const d = raw.key === key ? raw : empty(key)
  const update = (fn: (x: DraftState) => DraftState) => set((prev) => fn(prev.key === key ? prev : empty(key)))
  const custom = useMemo(() => {
    const ks = Object.keys(d.custom)
    if (!ks.length) return store.custom
    const n: Record<string, string | null> = { ...(store.custom ?? {}) }
    for (const k of ks) { const v = d.custom[k].v; if (v === undefined) delete n[k]; else n[k] = v }
    return n
  }, [store.custom, d.custom])
  const base = useMemo(() => (Object.keys(d.base).length ? { ...store.base, ...d.base } : store.base), [store.base, d.base])
  return {
    c, custom, base,
    readOnly: !!opts.readOnly,
    // dirty only when something REAL differs from what's saved (review, 3 Oct: Customize → Use the Base again is "no
    // change"): the `@stash` entry "Use the Base" keeps for a later Customize is bookkeeping, never a change
    dirty: Object.keys(d.custom).some((k) => !k.endsWith('@stash')) || Object.keys(d.base).length > 0,
    isOpen: (k) => !!d.open[k],
    setOpen: (k, on) => update((x) => ({ ...x, open: { ...x.open, [k]: on } })),
    setCustom: (k, v) => update((x) => {
      const n = { ...x.custom }
      if (v === useStore.getState().sl3.custom[c]?.[k]) delete n[k]; else n[k] = { v } // same as saved = not a change
      return { ...x, custom: n }
    }),
    setBase: (k, v, fallback) => update((x) => {
      const n = { ...x.base }
      if (v === (useStore.getState().sl3.base[k] ?? fallback)) delete n[k]; else n[k] = v
      return { ...x, base: n }
    }),
    resetBase: (k) => update((x) => { const n = { ...x.base }; delete n[k]; return { ...x, base: n, open: { ...x.open, [k]: false } } }),
    hasBase: (k) => k in d.base,
    save: () => {
      const own = Object.keys(d.custom), shared = Object.keys(d.base)
      const sent = [
        ...commitAndSend(() => { const s = useStore.getState(); for (const [k, { v }] of Object.entries(d.custom)) s.sl3Custom(c, k, v) }, [c], own),
        // a listing-wide value: every channel that shows it gets it
        ...commitAndSend(() => { const s = useStore.getState(); for (const [k, v] of Object.entries(d.base)) s.sl3Base(k, v) }, channels, shared),
      ]
      set(empty(key))
      return savedLabel(sent)
    },
    discard: () => set(empty(key)),
    pending: () => ({ custom: Object.fromEntries(Object.entries(d.custom).map(([k, { v }]) => [k, v])), base: { ...d.base } }),
  }
}
const DraftCtx = createContext<SectionDraft | null>(null)
export const DraftProvider = DraftCtx.Provider
/** The section draft when there is one (Classic's head), `null` elsewhere (the Photos tab, Canvas). */
export const useOptionalDraft = (): SectionDraft | null => useContext(DraftCtx)
export function useDraft(): SectionDraft {
  const d = useContext(DraftCtx)
  if (!d) throw new Error('useDraft: wrap the section in <DraftProvider value={useSectionDraft(c, tab)}>')
  return d
}

/** Where "Use the Base" keeps a channel's own value so "Customize for X" can bring it back. Not a field: Review, Canvas and viewOf ignore it. */
export const stashKey = (k: string) => `${k}@stash`

/* ---------- one scoped field: state, value, editability and the caption action ---------- */
type AnyInput = HTMLInputElement & HTMLTextAreaElement
export interface ScopedField {
  v: FieldView
  /** The value the control shows (Base value when inheriting). */
  shown: string
  /** Hub / set-by-channel: a locked value with the reason, never an input. */
  locked: boolean
  /** Uses the Base, or a listing-wide row not opened yet: the control is in the DS disabled state. */
  disabled: boolean
  write: (val: string) => void
  actionLabel?: string
  onAction?: () => void
  inputRef: RefObject<AnyInput | null>
  selectRef: RefObject<HTMLButtonElement | null>
  /** A listing-wide value edited in this draft: Save changes every channel. */
  everywhere: boolean
}
export function useScopedField(def: FieldDef, c: ListingChannel, opts: { customizeLabel?: string; customizeFrom?: string; onHub?: () => void } = {}): ScopedField {
  const d = useDraft()
  const v = viewOf(def, c, d.custom, d.base)
  const savedCustom = useStore((st) => st.sl3.custom[c])
  const inputRef = useRef<AnyInput | null>(null)
  const selectRef = useRef<HTMLButtonElement | null>(null)
  const name = CH_NAME[c]
  const focus = () => setTimeout(() => {
    const el = inputRef.current ?? selectRef.current
    if (!el) return
    el.focus()
    if ('setSelectionRange' in el && el.tagName !== 'SELECT') { const n = el.value.length; try { (el as AnyInput).setSelectionRange(n, n) } catch { /* number inputs */ } }
  }, 0)
  const origin = def.state[c] ?? 'inherit'
  let actionLabel: string | undefined
  let onAction: (() => void) | undefined
  let disabled = false
  switch (v.state) {
    case 'inherit':
      disabled = true
      actionLabel = opts.customizeLabel ?? `Customize for ${name}`
      // Customize brings back the channel's own text if it had one (kept under `<key>@stash` by "Use the Base")
      // (a kept value that is empty is never brought back: a field never opens empty — review, 3 Oct)
      onAction = () => {
        const kept = d.custom?.[stashKey(def.key)]
        const next = typeof kept === 'string' && kept.trim() !== '' ? kept : opts.customizeFrom ?? v.value
        // Use the Base → Customize on a row that started custom brings back exactly what is saved: drop the draft entry
        // (and a fee's own basis/currency) rather than writing a value equal to it, so the round trip is no change and
        // leaves no Unsaved bar (audit B-1). `savedCustom[k]` is what the store holds: a string, or undefined when the
        // custom value is the row's own seed (def.value) — setCustom treats "same as the store" as no entry.
        const saved = viewOf(def, c, savedCustom, d.base)
        if (saved.state !== 'inherit' && saved.value === next) {
          d.setCustom(def.key, savedCustom?.[def.key])
          if (def.key.startsWith('price:')) for (const sfx of ['@unit', '@cur']) {
            const k = def.key + sfx
            if (k in (d.pending?.().custom ?? {})) d.setCustom(k, savedCustom?.[k])
          }
        } else d.setCustom(def.key, next)
        focus()
      }
      break
    case 'override':
      actionLabel = 'Use the Base'
      // review 30 Sep: switching to the Base never loses the custom text. It is kept (stash) so Customize restores it.
      // A row that started custom goes back with `null`; one customized since goes back by dropping the entry.
      onAction = () => {
        if (v.value.trim() !== '') d.setCustom(stashKey(def.key), v.value); d.setCustom(def.key, origin === 'override' ? null : undefined)
        // a fee goes back to the Base whole: its own basis / currency (`price:<key>@unit|@cur`) go too, not just the amount
        // (saved → null, removed on Save; only in this draft → just dropped, so the round trip leaves no unsaved bar)
        if (def.key.startsWith('price:')) for (const sfx of ['@unit', '@cur']) {
          const k = def.key + sfx
          if (typeof d.custom?.[k] === 'string') d.setCustom(k, typeof savedCustom?.[k] === 'string' ? null : undefined)
        }
      }
      break
    case 'listing':
      if (d.isOpen(def.key)) { actionLabel = 'Cancel'; onAction = () => d.resetBase(def.key) }
      else { disabled = true; actionLabel = 'Edit for all channels'; onAction = () => { d.setOpen(def.key, true); focus() } }
      break
    case 'hub': actionLabel = 'Edit in Knowledge Hub'; onAction = opts.onHub; break
    case 'linked': disabled = true; break
    default: break
  }
  if (d.readOnly) { disabled = true; actionLabel = undefined; onAction = undefined }
  const write = (val: string) => {
    if (disabled) return
    if (v.state === 'listing') d.setBase(def.key, val, def.base ?? '')
    else d.setCustom(def.key, val)
  }
  return {
    v, shown: v.value, locked: v.state === 'hub' || v.state === 'set', disabled, write, actionLabel, onAction, inputRef, selectRef,
    everywhere: v.state === 'listing' && d.hasBase(def.key),
  }
}

/** The plain note under a listing-wide row with an unsaved edit (text only: not a change marker). */
export function EverywhereNote({ c }: { c: ListingChannel }) {
  const others = OTHERS(c, useListingChannels()).map((x) => CH_NAME[x])
  const where = others.length ? `${CH_NAME[c]}, ${others.join(' and ')} too` : CH_NAME[c]
  return <p className="h-field-note">Saving changes this on {where}. Stays already booked keep what they were told.</p>
}

/* ---------- Field visibility on Pricing / Availability (Property › Overview's one Show / Edit / Don't show control) ----------
 * The control (screens/smart/PropertyOverview.tsx FieldVisibilitySection) writes the same value to every shared key —
 * the Listing tabs' keys AND the shared Pricing (`price:*`) and Availability (`avail:*`) rows — in
 * store.overview[pid].fieldVisibility. One source of truth, per key, so the Listing editor's FieldRow reads exactly what
 * it read before. A shared row here reads its own key; if that key was never written (a session that set the control
 * before Pricing/Availability were covered, 3 Oct) it falls back to the value every written key agrees on — the
 * control's value. Unset everywhere = undefined = today's normal behaviour: unset never locks anything. */
const uniformVisibility = (m: Partial<Record<string, FieldVisibility>> | undefined): FieldVisibility | undefined => {
  if (!m) return undefined
  let out: FieldVisibility | undefined
  for (const v of Object.values(m)) { if (!v) continue; if (out && v !== out) return undefined; out = v }
  return out
}
/** What the Overview control says for one shared row (`orig` = this row's state on this channel). Channel-specific rows
 *  (Uses the Base, Custom for {channel}, set by the channel, only here) are never shared fields: always undefined.
 *  Channel pages only (a `:channel` route): Listing base › Availability (screens/base/Availability.tsx) reuses ScopedRow
 *  with every row forced to 'listing' — it is where shared values are set, so the control never hides or locks it. */
export function useSharedVisibility(k: string, orig: FieldState): FieldVisibility | undefined {
  const pid = useProperty().id
  const onChannel = useChannel() !== null
  const own = useStore((s) => s.overview?.[pid]?.fieldVisibility?.[k]) // primitives only (Zustand v5)
  const all = useStore((s) => uniformVisibility(s.overview?.[pid]?.fieldVisibility))
  if (!onChannel || (orig !== 'listing' && orig !== 'hub')) return undefined
  return own ?? all
}

/* ---------- a scoped setting row for Pricing and Availability (same states and actions as the Listing editor) ---------- */
export function ScopedRow({ c, k, label, help, orig, baseValue, chValue, setBy, control, tips, tipActive, onTip, after, hintAction, hubTo }: {
  c: ListingChannel; k: string; label: string; help?: string; orig: FieldState; baseValue: string; chValue?: string; setBy?: string
  control: (value: string, write: (v: string) => void, locked: boolean, disabled: boolean, refs: { input: RefObject<AnyInput | null>; select: RefObject<HTMLButtonElement | null> }) => ReactNode
  tips?: number; tipActive?: boolean; onTip?: () => void; after?: ReactNode; hubTo?: string
  /** an action at the right of the caption line (the per-day switch) */
  hintAction?: ReactNode
}) {
  const nav = useNavigate()
  const channels = useListingChannels() // 'listing'/'hub' captions name only the channels this property actually has
  const def: FieldDef = { key: k, tab: 'essentials', label, kind: 'text', state: { [c]: orig }, base: baseValue, value: chValue !== undefined ? { [c]: chValue } : undefined }
  const f = useScopedField(def, c, { onHub: hubTo ? () => nav(hubTo) : undefined })
  // Field visibility, exactly as the Listing editor's FieldRow: 'hidden' = not rendered; 'show' = the value, read-only,
  // no caption, no action (no "Edit for all channels", no "Edit in Knowledge Hub"), no tip; 'edit' / unset = as before.
  const vis = useSharedVisibility(k, orig)
  if (vis === 'hidden') return null
  const show = vis === 'show'
  const noop = () => {}
  return (
    <SettingRow label={label} help={help} state={f.v.state} channel={c}
      tips={show ? undefined : tips} tipActive={!show && tipActive} onTip={show ? undefined : onTip}
      actionLabel={show ? undefined : f.actionLabel} onAction={show ? undefined : f.onAction} hint={!show}
      lockTip={f.v.state === 'set' ? setBy : undefined} /* "🔒 {channel} only", the reason in the lock's tooltip (review, 4 Oct) */
      below={f.everywhere || after ? <>{f.everywhere && <EverywhereNote c={c} />}{after}</> : undefined} hintAction={show ? undefined : hintAction}
      scopeChannels={channels} hubTo={hubTo} sheet={!show && !(f.disabled && !f.onAction)}>
      {control(f.shown, show ? noop : f.write, f.locked, f.disabled || show, { input: f.inputRef, select: f.selectRef })}
    </SettingRow>
  )
}
