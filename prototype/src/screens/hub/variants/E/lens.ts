/* KH-E · the lens model. One Base plus per-channel overrides (screens/hub/model.ts scopeOf); the lens only decides whose
 * values a row shows and which action it offers. Nothing is copied per channel.
 *   Base lens    → base (the master value, editable) · only (a channel-only field, edits that channel's value)
 *   Channel lens → own (its own value, editable, "Use the Base") · only ("Only on X") · inherit (disabled, "Customize for X")
 *                  · shared (same on every channel, disabled, "Edit in the Base") · set (locked, "Set by X") · absent (folded) */
import type { ListingChannel } from '../../../../data/sl3'
import type { KhItem, KhSectionId } from '../../../../data/v3-kh'
import { CHANNELS } from '../../../../data/channels'
import { scopeOf, type HubDraft, type Scope } from '../../model'
import { forChannels, hubAmenities, hubChannels, hubCustom, hubItems, hubPid } from '../../perProperty'
import { isScenarioProperty } from '../../../../data/portfolio'
import { E_AMENITIES, type EAmenity, type Lens } from './data'
import { AMENITY_CATALOG } from '../../../../data/v3-kh'

export const NAME = (c: ListingChannel) => CHANNELS[c].name
export const names = (cs: ListingChannel[]) => { const n = cs.map(NAME); return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }
export const article = (c: ListingChannel) => (c === 'airbnb' ? 'An' : 'A')

export type RowKind = 'base' | 'only' | 'own' | 'inherit' | 'shared' | 'set' | 'absent'
export interface LensRow { item: KhItem; s: Scope; kind: RowKind; value: string; differs: boolean; channel?: ListingChannel }

export function rowFor(item: KhItem, lens: Lens, d: HubDraft): LensRow {
  const s = scopeOf(item, d)
  if (lens === 'base') {
    if (s.only) return { item, s, kind: 'only', value: s.own[0]?.value ?? '', differs: true, channel: s.only }
    return { item, s, kind: 'base', value: s.base, differs: s.own.length > 0 || s.set.length > 0 || s.on.length < hubChannels().length }
  }
  const c = lens
  if (!s.on.includes(c)) return { item, s, kind: 'absent', value: '', differs: false, channel: c }
  const own = s.own.find((o) => o.c === c)
  if (own) return { item, s, kind: own.orig === 'only' || own.orig === 'channel' ? 'only' : 'own', value: own.value, differs: true, channel: c }
  const set = s.set.find((x) => x.c === c)
  if (set) return { item, s, kind: 'set', value: set.value, differs: true, channel: c }
  const orig = item.state[c]
  return { item, s, kind: orig === 'inherit' || orig === 'override' ? 'inherit' : 'shared', value: s.base, differs: false, channel: c }
}

/* ---------- items per tab: the shared Hub items, custom facts, and items added here (`kh.x.<tab>.<label>`) ---------- */
/** The active property's Hub items (perProperty hubItems: Neukölln = khItems() as it is). Cached for the property on
 *  screen only: a switch rebuilds them, after S10 has patched the listing fields for the new property. */
let ALL: { pid: string; items: KhItem[] } | null = null
export const allItems = (): KhItem[] => {
  const pid = hubPid()
  if (ALL?.pid !== pid) ALL = { pid, items: hubItems(pid) }
  return ALL.items
}
/** Every channel of the active property inherits the Base. */
const allOn = (): KhItem['state'] => Object.fromEntries(hubChannels().map((c) => [c, 'inherit']))
/** Custom facts (perProperty hubCustom: Neukölln's scripted KH_CUSTOM; none for any other property until the host adds one). */
export const factItems = (): KhItem[] => hubCustom(hubPid()).map((f) => forChannels({ key: `kh.${f.id}`, section: 'custom', label: f.label, help: f.source, kind: 'textarea', base: f.value, state: allOn() }, hubChannels()))

export const addedPrefix = (tab: KhSectionId) => `kh.x.${tab}.`
/** Items added with "+ Add": in the Base (every channel inherits) or for one channel only. */
export function addedItems(tab: KhSectionId, d: HubDraft, storeBase: Record<string, string>, storeCustom: Partial<Record<ListingChannel, Record<string, string | null>>>): KhItem[] {
  const pre = addedPrefix(tab)
  const keys = new Set<string>()
  for (const k of [...Object.keys(storeBase), ...Object.keys(d.baseEdits)]) if (k.startsWith(pre)) keys.add(k)
  const chs = hubChannels()
  for (const c of chs) for (const k of Object.keys(storeCustom[c] ?? {})) if (k.startsWith(pre)) keys.add(k)
  for (const e of d.customEdits) if (e.k.startsWith(pre)) keys.add(e.k)
  const out: KhItem[] = []
  for (const key of keys) {
    const base = d.base(key, '')
    const own = chs.filter((c) => typeof d.cv(c, key) === 'string')
    if (!base && !own.length) continue
    const sample = base || (d.cv(own[0], key) as string)
    const kind: KhItem['kind'] = /^https?:\/\//.test(sample) ? 'url' : sample.length < 48 && !sample.includes('\n') ? 'text' : 'textarea'
    const group = tab === 'arrival' ? (kind === 'url' ? 'resources' : 'inside') : tab === 'pricing' ? 'fees' : tab === 'rules' ? 'rules' : undefined
    out.push(base
      ? { key, section: tab, group, label: key.slice(pre.length), kind, base, state: allOn() }
      : { key, section: tab, group, label: key.slice(pre.length), kind, base: '', state: Object.fromEntries(own.map((c) => [c, 'only'])) as KhItem['state'], value: Object.fromEntries(own.map((c) => [c, d.cv(c, key) as string])) })
  }
  return out
}

/** The value a channel's guest gets, and where it comes from (for Ask and its cited facts). */
export function resolve(key: string, c: ListingChannel, d: HubDraft): { value: string; origin: string; item: KhItem; kind: RowKind } | undefined {
  const item = allItems().find((i) => i.key === key) ?? factItems().find((i) => i.key === key)
  if (!item) return undefined
  const r = rowFor(item, c, d)
  if (r.kind === 'absent') return undefined
  const origin = r.kind === 'own' ? `${NAME(c)}’s own` : r.kind === 'only' ? `Only on ${NAME(c)}` : r.kind === 'set' ? `Set by ${NAME(c)}` : 'Uses the Base'
  return { value: r.value, origin, item, kind: r.kind }
}

/* ---------- amenities: per-channel availability (`amenity:<key>` 'on' / 'off' per channel) ---------- */
export const amenityKey = (a: EAmenity) => `amenity:${a.key}`
export function amenityOn(a: EAmenity, c: ListingChannel, d: HubDraft): boolean {
  const v = d.cv(c, amenityKey(a))
  return v === 'on' ? true : v === 'off' ? false : a.on.includes(c)
}
/** Set one channel; back to the listing's own value drops the entry (as the channel editor does). */
export function setAmenity(a: EAmenity, c: ListingChannel, on: boolean, d: HubDraft) {
  d.setCustom(c, amenityKey(a), on === a.on.includes(c) ? undefined : on ? 'on' : 'off')
}
/** The property's own amenity list. Neukölln: the scripted sample (E_AMENITIES, with its per-channel quirks). Any other
 *  property: perProperty hubAmenities, every amenity on each of its channels (store key `amenity:<name>`). */
export function baseAmenities(pid = hubPid()): Array<{ group: string; items: EAmenity[] }> {
  if (isScenarioProperty(pid)) return E_AMENITIES
  return hubAmenities(pid).map((g) => ({ group: g.group, items: g.items.map((i) => ({ key: i.name, name: i.name, on: [...i.on] })) }))
}
/** The Hub's amenity list: the property's list plus anything added from the channels' catalogues. */
export function amenityGroups(d: HubDraft): Array<{ group: string; items: EAmenity[] }> {
  const groups = baseAmenities().map((g) => ({ group: g.group, items: [...g.items] }))
  const chs = hubChannels()
  for (const [group, names] of Object.entries(AMENITY_CATALOG)) {
    for (const n of names) {
      const a: EAmenity = { key: n, name: n, on: [] }
      if (!chs.some((c) => d.cv(c, amenityKey(a)) === 'on')) continue
      let g = groups.find((x) => x.group === group)
      if (!g) { g = { group, items: [] }; groups.push(g) }
      if (!g.items.some((x) => x.key === n || x.name === n)) g.items.push(a)
    }
  }
  return groups
}
/** The channels (of the property) that list an amenity. */
export const amenityChannels = (a: EAmenity, d: HubDraft, chs = hubChannels()) => chs.filter((c) => amenityOn(a, c, d))
/** What differs under a lens. Base: not on every channel. A channel: missing there, or only there (when there's more
 *  than one channel to compare with). */
export function amenityDiffers(a: EAmenity, lens: Lens, d: HubDraft, chs = hubChannels()): boolean {
  const on = amenityChannels(a, d, chs)
  if (lens === 'base') return on.length !== chs.length
  return !on.includes(lens) || (chs.length > 1 && on.length === 1 && on[0] === lens)
}
export const catalogLeft = (d: HubDraft) => {
  const have = new Set(amenityGroups(d).flatMap((g) => g.items.map((i) => i.key)))
  return Object.entries(AMENITY_CATALOG).flatMap(([group, ns]) => ns.filter((n) => !have.has(n)).map((n) => ({ group, name: n })))
}
