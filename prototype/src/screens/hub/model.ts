/* WS-KH · Knowledge Hub model: the section draft (Hospitable's Discard changes / Save) and where each value goes.
 * Base edits → sl3Base(key). A channel's own value → sl3Custom(c, key, value); `null` = back to the Base; `undefined` =
 * drop the entry (back to how the listing was). Everything waits for the section's Save. */
import { useMemo, useState } from 'react'
import type { FieldState } from '../../ds'
import type { ListingChannel } from '../../data/sl3'
import type { KhItem } from '../../data/v3-kh'
import { useStore } from '../../store/store'
import { hubChannels } from './perProperty'

type Val = string | null | undefined
const ck = (c: ListingChannel, k: string) => `${c}|${k}`

export interface HubDraft {
  dirty: boolean
  base: (k: string, fallback: string) => string
  cv: (c: ListingChannel, k: string) => Val
  setBase: (k: string, v: string, fallback: string) => void
  setCustom: (c: ListingChannel, k: string, v: Val) => void
  /** "Edit per channel" open (a view state only: opening it is not a change, unlike HS-L03). */
  isSplit: (k: string) => boolean
  setSplit: (k: string, on: boolean) => void
  baseEdits: Record<string, string>
  customEdits: Array<{ c: ListingChannel; k: string; v: Val }>
  commit: (toBase?: Array<{ c: ListingChannel; k: string }>) => void
  discard: () => void
}
interface Raw { id: string; base: Record<string, string>; custom: Record<string, { c: ListingChannel; k: string; v: Val }>; split: Record<string, boolean> }
const empty = (id: string, split: Record<string, boolean> = {}): Raw => ({ id, base: {}, custom: {}, split })

/** One draft per view (a section, or the search results): leaving it drops unsaved edits, as in the channel editor. */
export function useHubDraft(id: string, initialSplit?: string | null): HubDraft {
  const storeBase = useStore((s) => s.sl3.base)
  const storeCustom = useStore((s) => s.sl3.custom)
  const [raw, set] = useState<Raw>(() => empty(id, initialSplit ? { [initialSplit]: true } : {}))
  const d = raw.id === id ? raw : empty(id)
  const update = (fn: (x: Raw) => Raw) => set((prev) => fn(prev.id === id ? prev : empty(id)))
  return useMemo(() => ({
    dirty: Object.keys(d.base).length + Object.keys(d.custom).length > 0,
    base: (k, fallback) => d.base[k] ?? storeBase[k] ?? fallback,
    cv: (c, k) => { const e = d.custom[ck(c, k)]; return e ? e.v : storeCustom[c]?.[k] },
    setBase: (k, v, fallback) => update((x) => {
      const n = { ...x.base }
      if (v === (useStore.getState().sl3.base[k] ?? fallback)) delete n[k]; else n[k] = v
      return { ...x, base: n }
    }),
    setCustom: (c, k, v) => update((x) => {
      const n = { ...x.custom }
      if (v === useStore.getState().sl3.custom[c]?.[k]) delete n[ck(c, k)]; else n[ck(c, k)] = { c, k, v }
      return { ...x, custom: n }
    }),
    isSplit: (k) => !!d.split[k],
    setSplit: (k, on) => update((x) => ({ ...x, split: { ...x.split, [k]: on } })),
    baseEdits: d.base,
    customEdits: Object.values(d.custom),
    commit: (toBase = []) => {
      const s = useStore.getState()
      for (const e of Object.values(d.custom)) s.sl3Custom(e.c, e.k, e.v)
      for (const [k, v] of Object.entries(d.base)) s.sl3Base(k, v)
      for (const t of toBase) s.sl3Custom(t.c, t.k, null)
      set(empty(id, d.split))
    },
    discard: () => set(empty(id, d.split)),
  }), [d, storeBase, storeCustom]) // eslint-disable-line react-hooks/exhaustive-deps
}

/* ---------- where a value goes ---------- */
export interface Own { c: ListingChannel; value: string; orig: FieldState }
export interface Scope {
  base: string
  /** Channels that have this field at all (checkout tasks: Airbnb only). */
  on: ListingChannel[]
  uses: ListingChannel[]
  own: Own[]
  set: Array<{ c: ListingChannel; value: string; why: string }>
  only?: ListingChannel
  /** Some channel can be customised here (inherit / override): "Edit per channel". */
  perChannel: boolean
}
/** Only the active property's channels count (multi-property): a field a channel of another property has never shows here. */
export function scopeOf(item: KhItem, d: HubDraft, channels: ListingChannel[] = hubChannels()): Scope {
  const base = d.base(item.key, item.base)
  const s: Scope = { base, on: [], uses: [], own: [], set: [], perChannel: false }
  const chs = channels.filter((c) => item.state[c] !== undefined)
  if (chs.length === 1 && item.state[chs[0]] === 'only') s.only = chs[0]
  for (const c of chs) {
    const orig = item.state[c]!
    s.on.push(c)
    const cv = d.cv(c, item.key)
    const chVal = item.value?.[c]
    switch (orig) {
      case 'only': case 'channel':
        s.own.push({ c, orig, value: typeof cv === 'string' ? cv : chVal ?? base }); break
      case 'override':
        s.perChannel = true
        if (cv === null) s.uses.push(c); else s.own.push({ c, orig, value: typeof cv === 'string' ? cv : chVal ?? base }); break
      case 'inherit':
        s.perChannel = true
        if (typeof cv === 'string') s.own.push({ c, orig, value: cv }); else s.uses.push(c); break
      case 'set':
        s.set.push({ c, value: chVal ?? base, why: item.setBy?.[c] ?? `Set by ${c === 'airbnb' ? 'Airbnb' : c === 'booking' ? 'Booking.com' : 'Direct'}` }); break
      default: s.uses.push(c)
    }
  }
  return s
}
/** Going back to the Base for a channel: `null` for a value that started custom, drop the entry for one customised since. */
export const backToBase = (o: Own): Val => (o.orig === 'override' ? null : undefined)

/** How a value reads in the hover and the confirmation. */
export function display(item: KhItem, v: string): string {
  if (!v) return ''
  switch (item.kind) {
    case 'money': return `€${v}`
    case 'percent': return `${v}%`
    case 'guests': return `${v} ${v === '1' ? 'guest' : 'guests'}`
    case 'toggle': return v === 'Yes' ? 'Allowed' : 'Not allowed'
    case 'tasks': return v.split('\n').map((l) => l.split('|')[0].trim()).filter(Boolean).join(' · ')
    default: return v
  }
}
