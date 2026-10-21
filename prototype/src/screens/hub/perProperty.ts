/* Knowledge Hub · multi-property (QA B01/B02, review: "each property has its own separate data, modelled lightly, the
 * same on mobile and desktop"). Every Hub iteration (A–E, S) reads the active property through this file:
 *   · its listing channels (store/selectors useListingChannels; `hubChannels()` for code outside a component),
 *   · its items (`hubItems(pid)`: data/v3-kh khItems(), read at call time so S10's patched FIELDS show, with the
 *     property's own prices, stay rules and channels laid over for every property but the scenario one),
 *   · its amenities, custom facts, tips, discrepancies, sources and Ask the AI answers: Neukölln (the deep, scripted
 *     scenario) keeps its scripted ones; every other property gets a generic set built from its own values,
 *   · its Hub-only UI state (`createPropertyStore`: facts added, flags resolved…), keyed by property id.
 * values (concepts/SCENARIO.md, data/portfolio.ts, data/property-seeds.ts). Generic wording is an . */
import { useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CHANNELS } from '../../data/channels'
import { AMENITIES, type ListingChannel } from '../../data/sl3'
import { KH_ASK, KH_CUSTOM, KH_DISCREPANCIES, KH_FROM_TIPS, khItems, type KhDiscrepancy, type KhFact, type KhItem } from '../../data/v3-kh'
import { detailOf, groupById, isScenarioProperty, propertyById, propertyChannels, resolve } from '../../data/portfolio'
import { availabilityFor } from '../../data/property-listing'
import { profileOf } from '../../data/property-seeds'
import { PROPERTY_ID } from '../../data/scenario'
import { SL3_INITIAL, useStore } from '../../store/store'
import { useIsScenario, useListingChannels } from '../../store/selectors'
import { channelList } from '../../data/channels'

export { useIsScenario, useListingChannels }

/* ---------------- the active property ---------------- */
export const useHubPid = () => useStore((s) => s.activeProperty)
/** The active property's id, outside a component. The Hub remounts on a property switch (shell PropertyScope), so a
 *  value read at render is the one on screen. */
export const hubPid = () => useStore.getState().activeProperty
/** The active property's listing channels (airbnb → booking → direct), outside a component. */
export const hubChannels = (): ListingChannel[] => propertyChannels(hubPid())
export const isScenarioActive = () => isScenarioProperty(hubPid())

export const NAME = (c: ListingChannel) => CHANNELS[c].name
/** "Airbnb", "Airbnb and Booking.com", "Airbnb, Booking.com and Direct" (data/channels.ts, shared with Listing details). */
export const names = channelList
/** Every channel of the property: "Used by all channels" only means something when there is more than one. */
export const usedByText = (uses: ListingChannel[], all: ListingChannel[]) =>
  !uses.length ? 'No channel uses it right now' : uses.length === all.length && all.length > 1 ? 'Used by all channels' : `Used by ${names(uses)}`

/* ---------------- items: khItems() for the property ---------------- */
const pick = <T,>(o: Partial<Record<ListingChannel, T>> | undefined, chs: ListingChannel[]) =>
  o ? (Object.fromEntries(Object.entries(o).filter(([c]) => chs.includes(c as ListingChannel))) as Partial<Record<ListingChannel, T>>) : undefined
/** A non-scenario property's prices and stay rules (data/portfolio DETAIL + group strategy, data/property-seeds profile).
 *  Keyed by Hub item key; `state`/`value` replace the scenario's per-channel set-up where given. */
function priceSeed(pid: string): Record<string, Partial<KhItem>> {
  const p = propertyById(pid)
  const d = detailOf(pid)
  const g = groupById(d.groupId).pricing
  const prof = profileOf(pid)
  const chs = propertyChannels(pid)
  const fee = Number(resolve(pid, 'cleaningFee').value ?? p?.cleaningFee ?? 0)
  const own = (vals: Partial<Record<ListingChannel, number | undefined>>, base: number) => {
    const state: Partial<Record<ListingChannel, 'inherit' | 'override'>> = {}
    const value: Partial<Record<ListingChannel, string>> = {}
    for (const c of chs) {
      const v = vals[c]
      if (v !== undefined && v !== base) { state[c] = 'override'; value[c] = String(v) } else state[c] = 'inherit'
    }
    return { state, value: Object.keys(value).length ? value : undefined }
  }
  const markup = own({ airbnb: g.markups.airbnb, booking: g.markups.booking, direct: g.markups.direct }, 0)
  const cleaning = own({ airbnb: d.channelFees?.airbnb, booking: d.channelFees?.booking, direct: d.channelFees?.direct }, fee)
  const direct = g.channelDiscounts.direct
  const disc = (k: 'weekly' | 'monthly', base: number) => {
    const state: KhItem['state'] = {}
    const value: Partial<Record<ListingChannel, string>> = {}
    for (const c of chs) {
      if (c === 'booking') state[c] = 'set'
      else if (c === 'direct' && direct?.[k] !== undefined && direct[k] !== base) { state[c] = 'override'; value[c] = String(direct[k]) }
      else state[c] = 'inherit'
    }
    return { base: String(base), state, value: Object.keys(value).length ? value : undefined }
  }
  return {
    'price:nightly': { base: String(d.base) },
    'price:weekend': { base: String(Math.round(d.base * (1 + g.weekendPct / 100))) },
    'price:markup': { base: '0', ...markup },
    'price:max': { base: String(prof?.guests ?? 2) },
    'price:cleaning': { base: String(fee), ...cleaning },
    'price:pet': { base: prof?.pets ? '15' : '0' },
    'price:weekly': disc('weekly', g.weeklyDiscount),
    'price:monthly': disc('monthly', g.monthlyDiscount),
    // the property's own stay rules (data/property-listing.ts availabilityFor), so Hub Availability agrees with the channel page
    ...Object.fromEntries(availabilityFor(pid).map((r) => [`avail:${r.key}`, { base: r.base, state: r.state, value: r.value }])),
  }
}
/** Scenario-only rows: the Airbnb short-stay fee is Neukölln's own set-up. */
const SCENARIO_ONLY = new Set(['price:short_clean'])

/** Every Hub item for a property. Neukölln: khItems() as it is. Any other property: its own prices and stay rules, and only
 *  its channels (a field none of its channels has is left out; `kh.*` facts stay, for the AI). Call it at render. */
export function hubItems(pid: string): KhItem[] {
  const items = khItems()
  if (isScenarioProperty(pid)) return items
  const chs = propertyChannels(pid)
  const seed = priceSeed(pid)
  const out: KhItem[] = []
  for (const it of items) {
    if (SCENARIO_ONLY.has(it.key)) continue
    const s = seed[it.key]
    const merged: KhItem = s ? { ...it, ...s, state: s.state ?? it.state, value: 'value' in s ? s.value : it.value } : { ...it }
    const had = Object.keys(merged.state).length > 0
    merged.state = pick(merged.state, chs) ?? {}
    merged.value = pick(merged.value, chs)
    merged.setBy = pick(merged.setBy, chs)
    if (had && !Object.keys(merged.state).length && !merged.key.startsWith('kh.')) continue
    out.push(merged)
  }
  return out
}
/** The active property's items, memoised per property. */
export function useHubItems(): KhItem[] {
  const pid = useHubPid()
  return useMemo(() => hubItems(pid), [pid])
}
/** Keep only the property's channels on an item the Hub builds itself (B's extra facts, C's facts, E's fact items). */
export function forChannels(item: KhItem, chs: ListingChannel[]): KhItem {
  return { ...item, state: pick(item.state, chs) ?? {}, value: pick(item.value, chs), setBy: pick(item.setBy, chs) }
}

/* ---------------- amenities ---------------- */
export type AmenityGroup = { group: string; items: Array<{ name: string; on: ListingChannel[]; note?: string }> }
/** A property's amenities, in data/sl3 AMENITIES' shape and vocabulary (store key `amenity:<name>`). Neukölln: AMENITIES.
 *  Others: a plain list from the property's profile, listed on every one of its channels (no import disagreements). */
export function hubAmenities(pid: string): AmenityGroup[] {
  if (isScenarioProperty(pid)) return AMENITIES
  const f = profileOf(pid)
  const on = propertyChannels(pid)
  const photos = f?.photos ?? []
  const has = (re: RegExp, s?: string) => !!s && re.test(s)
  const g = (group: string, names: Array<string | false>) => ({ group, items: names.filter((n): n is string => !!n).map((name) => ({ name, on: [...on] })) })
  return [
    g('Internet and office', ['Wi-Fi', (photos.includes('desk') || has(/desk|workspace/i, f?.feature)) && 'Dedicated workspace']),
    g('Kitchen and dining', ['Kitchen', 'Coffee maker', (f?.size ?? 0) >= 55 && 'Dishwasher', 'Electric kettle']),
    g('Bedroom and laundry', ['Washer', 'Essentials', 'Hangers', has(/cot/i, f?.beds) && 'Crib', has(/high chair/i, f?.feature) && 'High chair']),
    g('Bathroom', ['Hair dryer', 'Shampoo', has(/bathtub/i, f?.baths) && 'Bathtub', has(/walk-in shower/i, f?.baths) && 'Walk-in shower']),
    g('Heating and cooling', ['Heating']),
    g('Parking and facilities', [
      f?.method !== 'Host Greeting' && 'Self check-in', has(/with a lift/i, f?.floor) && 'Elevator',
      photos.includes('balcony') && 'Balcony', has(/garden/i, f?.feature) && 'Garden', !!f?.pets && 'Pets allowed',
    ]),
  ].filter((x) => x.items.length > 0)
}
export const useHubAmenities = () => { const pid = useHubPid(); return useMemo(() => hubAmenities(pid), [pid]) }
export const amenityNames = (pid: string) => hubAmenities(pid).flatMap((g) => g.items.map((i) => i.name))

/* ---------------- scripted content: the scenario property's only ---------------- */
export const hubCustom = (pid: string): KhFact[] => (isScenarioProperty(pid) ? KH_CUSTOM : [])
export const hubFromTips = (pid: string): Record<string, { label: string; value: string }> => (isScenarioProperty(pid) ? KH_FROM_TIPS : {})
export const hubDiscrepancies = (pid: string): KhDiscrepancy[] => (isScenarioProperty(pid) ? KH_DISCREPANCIES : [])

/* ---------------- sources ---------------- */
export interface HubSource { id: string; title: string; sub: string; icon: string; meta: string; facts: number }
/** Neukölln's sources are each iteration's own (scripted); this is the generic list for every other property:
 *  its listings and its house rules, no message history and no guidebook until the host adds them. */
export function genericSources(pid: string, items = hubItems(pid)): HubSource[] {
  const chs = propertyChannels(pid)
  const rules = items.filter((i) => i.section === 'rules').length
  return [
    { id: 'details', title: 'Property details', sub: `From your ${chs.length === 1 ? 'listing' : 'listings'} · ${chs.filter((c) => c !== 'direct').map(NAME).join(', ') || 'your site'}`, icon: 'file-text', meta: 'Imported when you connected', facts: items.length - rules },
    { id: 'rules', title: 'House rules', sub: chs.length > 1 ? 'Rules on every channel' : `Rules on ${NAME(chs[0] ?? 'airbnb')}`, icon: 'shield-check', meta: 'Imported when you connected', facts: rules },
  ]
}

/* ---------------- Ask the AI: generic questions answered from the property's own values ---------------- */
export interface GenericQuestion { id: string; q: string; keys: string[]; words: string[] }
export const GENERIC_QUESTIONS: GenericQuestion[] = [
  { id: 'checkin', q: 'What time can I check in?', keys: ['checkin', 'checkin_end', 'method'], words: ['check in', 'check-in', 'checkin', 'arrive', 'arrival'] },
  { id: 'wifi', q: 'Could you send me the Wi-Fi name and password?', keys: ['wifi_name', 'wifi_password'], words: ['wifi', 'wi-fi', 'internet', 'password'] },
  { id: 'address', q: 'What’s the address?', keys: ['address', 'directions'], words: ['address', 'where is', 'located', 'directions', 'find'] },
  { id: 'minstay', q: 'What’s the minimum stay?', keys: ['avail:min_stay'], words: ['minimum', 'min stay', 'how many nights', 'one night', 'nights'] },
  { id: 'cleaning', q: 'Is there a cleaning fee?', keys: ['price:cleaning'], words: ['cleaning', 'fee', 'extra cost', 'charges'] },
  { id: 'pets', q: 'Can I bring my dog?', keys: ['pets', 'price:pet'], words: ['dog', 'pet', 'cat', 'animal'] },
]
export const matchGeneric = (text: string) => { const t = text.toLowerCase(); return GENERIC_QUESTIONS.find((x) => x.words.some((w) => t.includes(w))) ?? null }
export interface GenericSentence { text: string; cites: string[] }
const firstSentence = (t: string) => (t.match(/^[^.!?]+[.!?]/)?.[0] ?? t).trim()
/** An answer built from the values a guest on one channel gets. `get(key)` = the raw value ('' when the channel lacks it). */
export function genericAnswer(id: string, get: (key: string) => string): GenericSentence[] {
  const s: GenericSentence[] = []
  switch (id) {
    case 'checkin': {
      s.push({ text: `Check-in is from ${get('checkin')} to ${get('checkin_end') || '10:00 PM'}.`, cites: ['checkin', 'checkin_end'] })
      const m = get('method')
      if (m) s.push({ text: m === 'Host Greeting' ? 'I’ll meet you at the door with the keys and show you around.' : `It’s self check-in with a ${m.toLowerCase()}: the details arrive 24 hours before you do.`, cites: ['method'] })
      break
    }
    case 'wifi': s.push({ text: `Of course! The network is ${get('wifi_name')} and the password is ${get('wifi_password')}.`, cites: ['wifi_name', 'wifi_password'] }); break
    case 'address': {
      s.push({ text: `The address is ${get('address')}.`, cites: ['address'] })
      const dir = get('directions')
      if (dir) s.push({ text: firstSentence(dir), cites: ['directions'] })
      break
    }
    case 'minstay': s.push({ text: `The minimum stay is ${get('avail:min_stay')}.`, cites: ['avail:min_stay'] }); break
    case 'cleaning': {
      const fee = Number(get('price:cleaning')) || 0
      s.push(fee ? { text: `Yes, a one-time cleaning fee of €${fee} is added to every stay.`, cites: ['price:cleaning'] } : { text: 'No, there’s no cleaning fee.', cites: ['price:cleaning'] })
      break
    }
    case 'pets': {
      if (get('pets') === 'Yes') {
        s.push({ text: 'Yes, pets are welcome.', cites: ['pets'] })
        const fee = Number(get('price:pet')) || 0
        if (fee) s.push({ text: `A pet fee of €${fee} per stay applies.`, cites: ['price:pet'] })
      } else s.push({ text: 'Sorry, pets aren’t allowed. Assistance animals are always welcome.', cites: ['pets'] })
      break
    }
  }
  return s
}
/** The scenario's scripted "Ask the AI" list (S iteration), or the generic one answered for the property's first channel. */
export function hubAsk(pid: string, get: (key: string, c: ListingChannel) => string, label: (key: string) => string): Array<{ q: string; a: string; items: string[]; note?: string }> {
  if (isScenarioProperty(pid)) return KH_ASK
  const chs = propertyChannels(pid)
  return GENERIC_QUESTIONS.map((g) => {
    const per = chs.map((c) => ({ c, s: genericAnswer(g.id, (k) => get(k, c)) }))
    const first = per[0]
    const text = (x: GenericSentence[]) => x.map((y) => y.text).join(' ')
    const other = per.find((x) => text(x.s) !== text(first?.s ?? []))
    const keys = [...new Set((first?.s ?? []).flatMap((x) => x.cites))]
    return {
      q: g.q, a: text(first?.s ?? []), items: keys.map(label),
      note: other && first ? `Asked on ${NAME(other.c)}: ${text(other.s)}` : undefined,
    }
  })
}

/* ---------------- Hub-only UI state, keyed by property ---------------- */
type Setter<S> = (fn: (s: S) => Partial<S>) => void
export interface PropertyStore<S, A> {
  <T = S & A>(sel?: (s: S & A) => T): T
  getState: () => S & A
  setState: (patch: Partial<S>) => void
  /** Every property back to empty ("Reset demo"). */
  resetAll: () => void
}
/** A small persisted store whose state is kept per property id (the active one is read and written). Data saved by the
 *  un-keyed version (persist version 0) is migrated to Neukölln, where it was made. "Reset demo" clears every property. */
export function createPropertyStore<S extends object, A extends object>(
  name: string, empty: () => S, actions: (set: Setter<S>, get: () => S) => A,
  storage: 'local' | 'session' = 'local',
): PropertyStore<S, A> {
  interface Root { byProp: Record<string, S> }
  const EMPTY = empty()
  const root = create<Root>()(persist(() => ({ byProp: {} }), {
    name, version: 1,
    storage: createJSONStorage(() => (storage === 'local' ? localStorage : sessionStorage)),
    migrate: (persisted, version) => {
      if (version === 0 && persisted && typeof persisted === 'object' && !('byProp' in persisted)) return { byProp: { [PROPERTY_ID]: { ...EMPTY, ...(persisted as Partial<S>) } } }
      return (persisted as Root) ?? { byProp: {} }
    },
  }))
  const sliceOf = (r: Root, id: string) => r.byProp[id] ?? EMPTY
  const set: Setter<S> = (fn) => root.setState((r) => {
    const id = hubPid()
    const cur = sliceOf(r, id)
    return { byProp: { ...r.byProp, [id]: { ...cur, ...fn(cur) } } }
  })
  const acts = actions(set, () => sliceOf(root.getState(), hubPid()))
  function use<T = S & A>(sel?: (s: S & A) => T): T {
    const id = useHubPid()
    const slice = root((r) => r.byProp[id] ?? EMPTY)
    const full = useMemo(() => ({ ...slice, ...acts }), [slice])
    return (sel ? sel(full) : full) as T
  }
  const api = use as PropertyStore<S, A>
  api.getState = () => ({ ...sliceOf(root.getState(), hubPid()), ...acts })
  api.setState = (patch) => set(() => patch)
  api.resetAll = () => root.setState({ byProp: {} })
  // "Reset demo" (store.reset → sl3 back to SL3_INITIAL) clears every property's Hub state.
  useStore.subscribe((s, prev) => { if (s.sl3 === SL3_INITIAL && prev.sl3 !== SL3_INITIAL) api.resetAll() })
  return api
}
