/* WS-KH / WS-CH · channel changes: what was sent to each channel, and what is still waiting.
 *
 * Save = the commit (Antonio, 30 Sep; QA A08). Saving a section in a channel editor (Listing, Pricing, Availability,
 * Photos, a Canvas popover, accepting a tip) writes the store AND sends that channel's saved changes straight away:
 * one receipt per change (channel, field, from → to, time), "Sent" for a moment, then "Live" (or "In review" for a
 * Booking.com name or description). Nothing sits in a silent queue.
 * Still pending = changes committed somewhere that doesn't send by itself, mainly Knowledge Hub Base edits (they touch
 * every channel that uses the Base, so the host sends them per channel from /property/:id/push, "Changes sent").
 *
 * `pendingChanges` derives the waiting list from the sl3 slice (accepted tips, per-channel custom values, Base edits)
 * minus what was already sent (`sent`: the last raw value sent per `channel:field`). The receipts and that map live in
 * `usePushUi` (sessionStorage, like the main store; cleared by Reset demo). SIMULATED outcomes; REAL·PUBLIC channel rules
 * (research/market/channel-constraints.md §5, §9).
 * Multi-property (QA B01/B02): everything here is the active property's. The waiting list and receipts cover only its
 * connected channels; `usePushUi` keeps receipts, decisions and what was sent per property (the active one at the top
 * level, the others parked in `byProperty`, swapped when store.activeProperty changes), so a receipt never shows on
 * another property. Tips and the `?seed=tips` demo list are the scenario property's only. */
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { FIELDS, LISTING_TABS, activeTips, tipsFor, type ListingChannel } from '../../data/sl3'
import { instantLabel, khItem, receiptFor, sectionOfKey } from '../../data/v3-kh'
import { PHOTO_CH_NAME, captionFor, channelPhotos, type PhotoLib, type PhotoSl3 } from '../../data/photos'
import { activePropertyId, amenityDefaultOn, availabilityFor, pricesFor } from '../../data/property-listing'
import { isScenarioProperty, propertyChannels } from '../../data/portfolio'
import { PROPERTY_ID } from '../../data/scenario'
import { SL3_INITIAL, useStore, type SL3State } from '../../store/store'

/** The active property's connected listing channels (airbnb → booking → direct). */
const channelsNow = (): ListingChannel[] => propertyChannels(useStore.getState().activeProperty)

export interface PendingChange {
  key: string; channel: ListingChannel; field: string; section: string; what: string; origin: string
  from?: string; to: string; tipId?: string; kind: 'tip' | 'edit' | 'reset' | 'base'; sig: string
  /** The value as stored (before units are added), what `sent` compares with. */
  raw: string
}
type Slice = Pick<SL3State, 'tips' | 'custom' | 'base'>

/** Every key a change can carry: listing fields, plus the Hub's pricing / availability / property facts (data/v3-kh.ts). */
interface Def { label: string; tab?: string; base?: string; value?: Partial<Record<ListingChannel, string>>; state: Partial<Record<ListingChannel, string>> }
const FIELD_ONLY: Record<string, Def> = Object.fromEntries(FIELDS.map((f) => [f.key, f]))
/** A Pricing row as a Def: the active property's defaults (data/property-listing.ts pricesFor), the same shape the Hub uses. */
const priceDef = (k: string): Def | undefined => {
  const r = Object.values(pricesFor(activePropertyId())).flat().find((x) => `price:${x.key}` === k)
  return r && { label: r.label, base: String(r.base), state: r.state, value: r.value ? Object.fromEntries(Object.entries(r.value).map(([c, v]) => [c, String(v)])) : undefined }
}
/** An Availability row as a Def: the active property's defaults (data/property-listing.ts availabilityFor). `avail:min_stay`
 *  etc.; the two day-restriction rows (avail:checkin_days / checkout_days) aren't in AvailRow, so they fall through to khItem. */
const availDef = (k: string): Def | undefined => {
  const r = availabilityFor(activePropertyId()).find((x) => `avail:${x.key}` === k)
  return r && { label: r.label, base: r.base, state: r.state, value: r.value }
}
const def = (k: string): Def | undefined => FIELD_ONLY[k] ?? (k.startsWith('price:') ? priceDef(k) : undefined) ?? (k.startsWith('avail:') ? availDef(k) : undefined) ?? (() => { const i = khItem(k); return i ? { label: i.label, base: i.base, value: i.value, state: i.state } : undefined })()
const tabLabel = (t: string) => LISTING_TABS.find((x) => x.id === t)?.label ?? t
export const sectionFor = (key: string) => (FIELD_ONLY[key]?.tab ? tabLabel(FIELD_ONLY[key].tab!) : sectionOfKey(key))
const unitOf = (key: string, v: string) => { const i = khItem(key); return !i || !v ? v : i.kind === 'money' ? `€${v}` : i.kind === 'percent' ? `${v}%` : i.kind === 'guests' ? `${v} guests` : v }
const current = (ch: ListingChannel, key: string) => def(key)?.value?.[ch] ?? def(key)?.base ?? ''

const photoLabel = (p: string) => { const [what, pos] = p.split(' '); return pos?.startsWith('#') ? `${what[0].toUpperCase()}${what.slice(1)} photo at ${pos}` : `Cover: ${p}` }

/** Every change waiting for a channel, in a stable order (channel, then field order in FIELDS).
 *  `pushed` (legacy signatures) and `sent` (last raw value sent per `channel:field`) drop what the channel already has. */
export function pendingChanges(s: Slice, pushed: Record<string, true> = {}, sent: Record<string, string> = {}): PendingChange[] {
  const out: PendingChange[] = []
  const add = (c: Omit<PendingChange, 'key' | 'sig' | 'section' | 'what' | 'raw'> & { what?: string }) => {
    const f = def(c.field)
    const key = `${c.channel}:${c.field}`
    const sig = `${key}=${c.to}`
    if (pushed[sig] || sent[key] === c.to || out.some((o) => o.key === key) || (c.kind === 'edit' && c.to === (c.from ?? ''))) return
    out.push({ ...c, raw: c.to, from: c.from ? unitOf(c.field, c.from) : c.from, to: unitOf(c.field, c.to), key, sig, section: sectionFor(c.field), what: c.what ?? f?.label ?? c.field })
  }
  for (const ch of channelsNow()) {
    // 1 · accepted tips (with the value the host picked, if any)
    for (const t of tipsFor(ch).filter((x) => s.tips[x.id] === 'accepted')) {
      const v = s.custom[ch]?.[t.field]
      if (t.photos) add({ channel: ch, field: t.field, origin: `Tip · ${t.title}`, from: photoLabel(t.photos.now), to: photoLabel(t.photos.next), tipId: t.id, kind: 'tip', what: 'Photo order' })
      // an amenity tip (data/sl3.ts, field "amenity:<name>") reads like the host's own amenity edits below
      else if (t.field.startsWith('amenity:')) add({ channel: ch, field: t.field, origin: `Tip · ${t.title}`, from: t.from, to: v === 'off' ? 'Removed' : 'Added', tipId: t.id, kind: 'tip', what: t.field.slice(8) })
      else add({ channel: ch, field: t.field, origin: `Tip · ${t.title}`, from: t.from ?? (current(ch, t.field) || undefined), to: typeof v === 'string' ? v : t.to ?? '', tipId: t.id, kind: 'tip' })
    }
    // 2 · the host's own per-channel edits (a value, or back to the Base)
    for (const [field, v] of Object.entries(s.custom[ch] ?? {})) {
      if (field === 'policy:instant') { if (typeof v === 'string') add({ channel: ch, field, origin: 'Your edit', to: instantLabel(v), kind: 'edit', what: 'Instant book' }); continue }
      if (field.startsWith('amenity:') && (v === 'on' || v === 'off')) { add({ channel: ch, field, origin: 'Your edit', to: v === 'on' ? 'Added' : 'Removed', kind: 'edit', what: field.slice(8) }); continue }
      const f = def(field)
      if (!f) continue
      if (typeof v === 'string') add({ channel: ch, field, origin: 'Your edit', from: current(ch, field) || undefined, to: v, kind: 'edit' })
      else if (v === null && f.state[ch] === 'override') add({ channel: ch, field, origin: 'Your edit · Use the Base', from: f.value?.[ch], to: s.base[field] ?? f.base ?? '', kind: 'reset' })
    }
    // 3 · Base edits from the Knowledge Hub, for channels that use the Base
    for (const [field, v] of Object.entries(s.base)) {
      const f = def(field)
      if (!f || v === (f.base ?? '')) continue
      const st = f.state[ch]
      const own = typeof s.custom[ch]?.[field] === 'string' || (s.custom[ch]?.[field] === undefined && st === 'override')
      if (!st || st === 'set' || st === 'only' || own) continue
      add({ channel: ch, field, origin: 'Knowledge Hub · the Base', from: f.base || undefined, to: v, kind: 'base' })
    }
  }
  return out
}

/** Dismiss = this channel goes back to what it shows today. */
export function revert(c: PendingChange) {
  const st = useStore.getState()
  const f = def(c.field)
  const original = f?.state[c.channel] === 'override' ? (f.value?.[c.channel] ?? null) : null
  if (c.tipId) { st.sl3Tip(c.tipId, 'dismissed'); if (c.what !== 'Photo order') st.sl3Custom(c.channel, c.field, original) }
  else if (c.kind === 'base' || c.kind === 'reset') st.sl3Custom(c.channel, c.field, c.from ?? '')
  else st.sl3Custom(c.channel, c.field, original)
}

export const byChannel = <T extends { channel: ListingChannel }>(list: T[]) =>
  channelsNow().map((c) => ({ channel: c, items: list.filter((x) => x.channel === c) })).filter((g) => g.items.length > 0)

/* ---------- receipts ---------- */
/** One change sent to one channel. Status is derived from the time: "Sent" for a moment, then "Live" / "In review". */
export interface Receipt {
  id: string; channel: ListingChannel; field: string; section: string; what: string; origin: string
  from?: string; to: string
  /** The value as stored, for "Live now" in Canvas and the pending list. */
  raw: string
  sentAt: number
  review: boolean
  note: string
}
export type ReceiptStatus = 'sent' | 'live' | 'review'
/** How long a receipt says "Sent" before the channel confirms (SIMULATED). */
export const SENT_MS = 4000
export const receiptStatus = (r: Receipt, now = Date.now()): ReceiptStatus => (now - r.sentAt < SENT_MS ? 'sent' : r.review ? 'review' : 'live')

export type Decision = 'keep' | 'dismiss'
/** One property's changes: what was sent, the receipts, and the Keep / Dismiss choices on its waiting list. */
interface PushData {
  decisions: Record<string, Decision>
  /** Legacy: signatures of changes pushed from the old Review & push flow. */
  pushed: Record<string, true>
  /** Last raw value sent per `channel:field`. */
  sent: Record<string, string>
  receipts: Receipt[]
}
interface PushUi extends PushData {
  /** The property the top-level values belong to (follows store.activeProperty). */
  pid: string
  /** The other properties' changes, parked while they aren't active. */
  byProperty: Record<string, PushData>
  decide: (key: string, d: Decision) => void
}
const emptyPush = (): PushData => ({ decisions: {}, pushed: {}, sent: {}, receipts: [] })
const pickPush = (s: PushData): PushData => ({ decisions: s.decisions, pushed: s.pushed, sent: s.sent, receipts: s.receipts })
export const usePushUi = create<PushUi>()(persist((set) => ({
  ...emptyPush(), pid: PROPERTY_ID, byProperty: {},
  decide: (key, d) => set((s) => ({ decisions: { ...s.decisions, [key]: d } })),
}), {
  name: 'hospitable-v3-changes', version: 2,
  partialize: (s) => ({ ...pickPush(s), pid: s.pid, byProperty: s.byProperty }),
  // v1 kept one un-keyed list: it was the scenario property's (Neukölln), so it stays Neukölln's
  migrate: (persisted, version) => {
    const old = (persisted ?? {}) as Partial<PushUi>
    return (version < 2 ? { ...emptyPush(), ...pickPush({ ...emptyPush(), ...old }), pid: PROPERTY_ID, byProperty: {} } : old) as PushUi
  },
  storage: createJSONStorage(() => { try { return sessionStorage } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} } } }),
}))
/** Park the active property's changes and bring `pid`'s to the top level (empty on its first visit). */
function showPushFor(pid: string) {
  const ui = usePushUi.getState()
  if (ui.pid === pid) return
  const byProperty = { ...ui.byProperty, [ui.pid]: pickPush(ui) }
  const next = byProperty[pid] ?? emptyPush()
  delete byProperty[pid]
  usePushUi.setState({ ...next, pid, byProperty })
}
showPushFor(useStore.getState().activeProperty)
useStore.subscribe((s, prev) => {
  // "Reset demo" (store.reset → sl3 back to SL3_INITIAL) clears every property's receipts too
  if (s.sl3 === SL3_INITIAL && prev.sl3 !== SL3_INITIAL) { usePushUi.setState({ ...emptyPush(), pid: s.activeProperty, byProperty: {} }); return }
  if (s.activeProperty !== prev.activeProperty) showPushFor(s.activeProperty)
})

let seq = 0
export type ReceiptInput = Omit<Receipt, 'id' | 'sentAt' | 'review' | 'note' | 'section' | 'what'> & { section?: string; what?: string }
/** Records receipts and marks what they carry as sent. Call after the store holds the new values. */
export function sendReceipts(items: ReceiptInput[]): Receipt[] {
  if (!items.length) return []
  const at = Date.now()
  const out: Receipt[] = items.map((i) => ({
    ...i, id: `rcp-${at.toString(36)}-${(seq++).toString(36)}`, sentAt: at,
    section: i.section ?? sectionFor(i.field), what: i.what ?? def(i.field)?.label ?? (i.field.startsWith('amenity:') ? i.field.slice(8) : i.field),
    ...(() => { const r = receiptFor(i.channel, i.field); return { review: r.state === 'review', note: r.note } })(),
  }))
  const ui = usePushUi.getState()
  const keys = new Set(out.map((r) => `${r.channel}:${r.field}`))
  const sent = { ...ui.sent }
  // whatever the waiting list shows for these keys is what the channel now has
  for (const p of pendingChanges(useStore.getState().sl3, ui.pushed, ui.sent)) if (keys.has(p.key)) sent[p.key] = p.raw
  for (const r of out) if (!(`${r.channel}:${r.field}` in sent)) sent[`${r.channel}:${r.field}`] = r.raw
  usePushUi.setState({ receipts: [...out, ...ui.receipts].slice(0, 200), sent })
  return out
}
/** Undo right after a commit (a tip's Undo): the last receipt for that change is withdrawn. */
export function unsend(channel: ListingChannel, field: string) {
  const ui = usePushUi.getState()
  const i = ui.receipts.findIndex((r) => r.channel === channel && r.field === field)
  const sent = { ...ui.sent }
  delete sent[`${channel}:${field}`]
  usePushUi.setState({ receipts: i < 0 ? ui.receipts : ui.receipts.filter((_, k) => k !== i), sent })
}
/** "Airbnb", "Airbnb and Booking.com", "Airbnb, Booking.com and Direct". */
export const channelList = (chs: ListingChannel[]) => {
  const n = [...new Set(chs)].map((c) => (PHOTO_CH_NAME[c] === 'Direct bookings' ? 'Direct' : PHOTO_CH_NAME[c]))
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}
/** The confirmation next to Save: "Saved · sent to Airbnb", or just "Saved" when nothing reached a channel. */
export const savedLabel = (rs: Receipt[]) => (rs.length ? `Saved · sent to ${channelList(rs.map((r) => r.channel))}` : 'Saved')

/* ---------- diffs: what a commit changed, per channel ---------- */
const amenityOn = (ch: ListingChannel, name: string, custom: Record<string, string | null> | undefined) => {
  const v = custom?.[`amenity:${name}`]
  if (v === 'on') return true
  if (v === 'off') return false
  return amenityDefaultOn(activePropertyId(), ch, name) // the active property's list (data/property-listing.ts)
}
/** The value a channel shows for a key, given the slice (same rules as the editors' viewOf). */
export function effective(ch: ListingChannel, key: string, s: Pick<SL3State, 'custom' | 'base'>): string | undefined {
  const custom = s.custom[ch] ?? undefined
  if (key.startsWith('amenity:')) return amenityOn(ch, key.slice(8), custom) ? 'Listed' : 'Not listed'
  if (key === 'policy:instant') { const v = custom?.[key]; return typeof v === 'string' ? instantLabel(v) : undefined }
  const f = def(key)
  const cv = custom?.[key]
  if (!f) return typeof cv === 'string' ? cv : undefined
  const orig = f.state[ch]
  if (!orig) return undefined // the channel doesn't have this field
  const base = s.base[key] ?? f.base ?? ''
  if (typeof cv === 'string') return cv
  if (cv === null) return base
  return orig === 'override' || orig === 'only' || orig === 'channel' ? f.value?.[ch] ?? f.base ?? '' : base
}
/** Receipts for `keys` on `channels`: every place where the value guests see changed between two slices. */
export function diffReceipts(before: Pick<SL3State, 'custom' | 'base'>, after: Pick<SL3State, 'custom' | 'base'>, channels: ListingChannel[], keys: string[], origin = 'Your edit'): ReceiptInput[] {
  const out: ReceiptInput[] = []
  for (const ch of channels) for (const key of keys) {
    if (key.includes('@') || key === 'photos' || key === 'photos.order') continue // stash keys; photos have their own diff
    const a = effective(ch, key, before), b = effective(ch, key, after)
    if (b === undefined || a === b) continue
    out.push({ channel: ch, field: key, origin, from: a ? unitOf(key, a) : undefined, to: unitOf(key, b), raw: b })
  }
  return out
}
/** Commit through the store, then send what changed on the given channels / keys. Returns the receipts. */
export function commitAndSend(fn: () => void, channels: ListingChannel[], keys: string[], origin?: string): Receipt[] {
  const before = useStore.getState().sl3
  fn()
  return sendReceipts(diffReceipts(before, useStore.getState().sl3, channels, keys, origin))
}

/** Photos: one receipt per channel whose set, order, cover, captions or room tags changed. */
const photoLine = (ks: string[], lib: PhotoLib) => `${ks.length} photos · cover: ${lib.meta[ks[0] ?? '']?.description ?? '—'}`
export function photoReceipts(before: { lib: PhotoLib; sl3: PhotoSl3 }, after: { lib: PhotoLib; sl3: PhotoSl3 }, channels: ListingChannel[] = channelsNow(), origin = 'Your edit'): ReceiptInput[] {
  const out: ReceiptInput[] = []
  for (const ch of channels) {
    const a = channelPhotos(ch, before.lib, before.sl3).shown, b = channelPhotos(ch, after.lib, after.sl3).shown
    const parts: string[] = []
    const same = b.filter((k) => a.includes(k))
    if (a[0] === b[0] && a.filter((k) => b.includes(k)).join() !== same.join()) parts.push('new order')
    const caps = b.filter((k) => a.includes(k) && captionFor(k, ch, before.lib) !== captionFor(k, ch, after.lib)).length
    if (caps) parts.push(`${caps} caption${caps > 1 ? 's' : ''}`)
    const tags = b.filter((k) => (before.lib.meta[k]?.tag ?? null) !== (after.lib.meta[k]?.tag ?? null)).length
    if (tags) parts.push(`${tags} room tag${tags > 1 ? 's' : ''}`)
    const from = photoLine(a, before.lib), to = photoLine(b, after.lib)
    if (from === to && !parts.length) continue
    out.push({ channel: ch, field: 'photos', what: 'Photos', section: 'Essentials', origin, from, to: [to, ...parts].join(' · '), raw: after.sl3.custom[ch]?.photos ?? b.join(',') })
  }
  return out
}
export function commitPhotosAndSend(fn: () => void, channels?: ListingChannel[], origin?: string): Receipt[] {
  const snap = () => { const s = useStore.getState(); return { lib: s.photoLib, sl3: { tips: s.sl3.tips, custom: s.sl3.custom } } }
  const before = snap()
  fn()
  return sendReceipts(photoReceipts(before, snap(), channels, origin))
}

/* ---------- time ---------- */
/** Re-renders every second while mounted (receipts move from Sent to Live, "just now" ages). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t) }, [ms])
  return now
}
export const ago = (t: number, now = Date.now()) => {
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const d = new Date(t)
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
export const clockTime = (t: number) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

/* ---------- demo seed (?seed=tips): a realistic waiting list for screenshots and the Loom. SIMULATED. ----------
 * The scenario property's (Neukölln) only: its tips and its Direct name. Other properties ignore ?seed=tips. */
export const SEED_BASE: Record<string, string> = { checkout: '10:00 AM' }
export const SEED_TIPS: Array<{ id: string; kb?: boolean }> = [{ id: 't-a-name', kb: true }, { id: 't-a-photos' }, { id: 't-a-summary' }, { id: 't-b-directions', kb: true }, { id: 't-b-photos' }, { id: 't-a-neigh', kb: true }]
export const SEED_CUSTOM: Array<[ListingChannel, string, string]> = [['direct', 'name', 'The Artist’s Flat · Neukölln']]
export function seedSlice(): Slice {
  const tips: Slice['tips'] = {}
  const custom: Slice['custom'] = {}
  if (!isScenarioProperty(activePropertyId())) return { tips, custom, base: {} }
  for (const { id } of SEED_TIPS) {
    const t = activeTips().find((x) => x.id === id)
    if (!t) continue
    tips[id] = 'accepted'
    if (t.to) custom[t.channel] = { ...(custom[t.channel] ?? {}), [t.field]: t.to }
  }
  for (const [ch, k, v] of SEED_CUSTOM) custom[ch] = { ...(custom[ch] ?? {}), [k]: v }
  return { tips, custom, base: { ...SEED_BASE } }
}
/** Applies the seed through the store's own actions, once, if nothing was accepted yet. */
export function useDemoSeed() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('seed') !== 'tips') return
    const st = useStore.getState()
    if (!isScenarioProperty(st.activeProperty) || Object.keys(st.sl3.tips).length > 0) return
    for (const { id, kb } of SEED_TIPS) {
      const t = activeTips().find((x) => x.id === id)
      if (!t) continue
      st.sl3Tip(id, 'accepted')
      if (kb) st.sl3Kb(id, true)
      if (t.to) st.sl3Custom(t.channel, t.field, t.to)
    }
    for (const [ch, k, v] of SEED_CUSTOM) st.sl3Custom(ch, k, v)
    for (const [k, v] of Object.entries(SEED_BASE)) st.sl3Base(k, v)
  }, [])
}
