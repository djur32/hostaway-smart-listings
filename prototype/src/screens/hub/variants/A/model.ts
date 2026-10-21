/* KH-A · Channel matrix: the variant's model (concepts/knowledge-hub/KH-A.md).
 * Rows are the first Hub build's items (screens/hub/model.ts scopeOf/display over data/v3-kh.ts khItems), so the matrix
 * reads and writes the same store keys as the channel screens: FIELDS keys, `price:*`, `avail:*`, `amenity:<name>`
 * ('on'/'off' per channel, the ListingEditor's keys) and `policy:instant`. Only the amenity list is richer than
 * data/sl3.ts AMENITIES: items that exist there keep its per-channel defaults; the rest come from the Paper frame KH-A1.
 * Content is (the case study's sample property). Channel vocabularies and matches are an until
 * checked against research/market/raw/amenities-crosswalk.md. */
import { AMENITIES, type ListingChannel } from '../../../../data/sl3'
import type { KhItem } from '../../../../data/v3-kh'
import { isScenarioProperty } from '../../../../data/portfolio'
import { useStore } from '../../../../store/store'
import { display, scopeOf, type HubDraft, type Scope } from '../../model'
import {
  GENERIC_QUESTIONS, createPropertyStore, genericAnswer, genericSources, hubAmenities, hubChannels, isScenarioActive, matchGeneric,
} from '../../perProperty'
export { NAME, names } from '../../perProperty'
import { NAME } from '../../perProperty'

export type Col = 'base' | ListingChannel
/* Multi-property: the channel columns are the active property's (useListingChannels() in components, hubChannels() here). */

/* ---------------- tabs ---------------- */
export type TabId = 'property' | 'descriptions' | 'photos' | 'arrival' | 'location' | 'amenities' | 'rules' | 'pricing' | 'policies' | 'facts'
export const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'property', label: 'Property' }, { id: 'descriptions', label: 'Descriptions' }, { id: 'photos', label: 'Photos' },
  { id: 'arrival', label: 'Arrival' }, { id: 'location', label: 'Location' }, { id: 'amenities', label: 'Amenities' },
  { id: 'rules', label: 'Rules' }, { id: 'pricing', label: 'Pricing & availability' }, { id: 'policies', label: 'Policies' },
  { id: 'facts', label: 'More facts' },
]
export const isTab = (t: string | null): t is TabId => !!t && TABS.some((x) => x.id === t)

/* ---------------- item matrices: which rows each tab shows, in groups ---------------- */
export type RowDef = { kind: 'item'; key: string } | { kind: 'calc'; key: 'calc:guests'; label: string; sub: string }
export interface GroupDef { id: string; title?: string; rows: RowDef[] }
const it = (...keys: string[]): RowDef[] => keys.map((key) => ({ kind: 'item', key }))
export const TAB_GROUPS: Partial<Record<TabId, GroupDef[]>> = {
  property: [{ id: 'p', rows: it('type', 'room', 'kh.size', 'kh.bedrooms', 'kh.bathrooms', 'tags', 'languages') }],
  descriptions: [{ id: 'd', rows: it('name', 'summary', 'description', 'space', 'other') }],
  arrival: [
    { id: 'inside', title: 'Getting inside and setup', rows: it('method', 'method_details', 'wifi_name', 'wifi_password', 'manual', 'access', 'interaction', 'checkout_tasks') },
    { id: 'resources', title: 'Guest resources', rows: it('guidebook', 'rental_agreement', 'upsell') },
  ],
  location: [
    { id: 'addr', title: 'Address', rows: it('country', 'address', 'unit', 'city', 'state', 'zip') },
    { id: 'area', title: 'The area', rows: it('directions', 'neighbourhood', 'getting_around') },
  ],
  rules: [
    { id: 'times', title: 'Check-in and checkout', rows: it('checkin', 'checkin_end', 'checkout') },
    { id: 'rules', title: 'Rules', rows: it('house_rules', 'children', 'infants', 'pets', 'smoking', 'events') },
  ],
  pricing: [
    { id: 'rates', title: 'Rates', rows: [...it('price:nightly', 'price:weekend', 'price:markup'), { kind: 'calc', key: 'calc:guests', label: 'Guests see, weeknight', sub: 'Calculated' }] },
    { id: 'fees', title: 'Fees', rows: it('price:cleaning', 'price:short_clean', 'price:extra', 'price:pet') },
    { id: 'guests', title: 'Guests', rows: it('price:included', 'price:max') },
    { id: 'discounts', title: 'Discounts', rows: it('price:weekly', 'price:monthly') },
    { id: 'availability', title: 'Availability', rows: it('avail:min_stay', 'avail:max_stay', 'avail:advance', 'avail:prep', 'avail:window') },
  ],
}
/** Which tab holds a store key (for citations and "Fix a fact"). */
export function tabOfKey(key: string): TabId {
  if (key.startsWith('amenity:')) return 'amenities'
  if (key.startsWith('kh.') && !['kh.size', 'kh.bedrooms', 'kh.bathrooms'].includes(key)) return 'facts'
  if (key.startsWith('policy:')) return 'policies'
  for (const [t, gs] of Object.entries(TAB_GROUPS)) if (gs!.some((g) => g.rows.some((r) => r.key === key))) return t as TabId
  return 'property'
}

/* ---------------- one cell of an item row ---------------- */
/** inherit = uses the Base and can have its own · fixed = same on every channel (listing-wide) · own · na · set */
export type CellState = 'inherit' | 'fixed' | 'own' | 'na' | 'set'
export interface CellView { state: CellState; text: string; why?: string; editable: boolean }
export function cellOf(item: KhItem, s: Scope, c: ListingChannel): CellView {
  if (!s.on.includes(c)) return { state: 'na', text: '—', editable: false }
  const set = s.set.find((x) => x.c === c)
  if (set) return { state: 'set', text: display(item, set.value), why: set.why, editable: false }
  const own = s.own.find((x) => x.c === c)
  if (own) return { state: 'own', text: display(item, own.value), editable: own.orig !== 'channel' }
  const st = item.state[c]
  return { state: st === 'inherit' || st === 'override' ? 'inherit' : 'fixed', text: display(item, s.base), editable: st === 'inherit' || st === 'override' }
}
export const cellId = (key: string, col: Col) => `${key}:${col}`
export function parseCell(id: string | null): { key: string; col: Col } | null {
  if (!id) return null
  const i = id.lastIndexOf(':')
  const col = id.slice(i + 1) as Col
  return i > 0 && (col === 'base' || hubChannels().includes(col as ListingChannel)) ? { key: id.slice(0, i), col } : null
}
/** "Guests see" on a weeknight: the nightly rate plus the channel markup (arithmetic, rounded). */
export function guestsSee(items: KhItem[], d: HubDraft, c: Col): string {
  const n = items.find((i) => i.key === 'price:nightly')!
  const m = items.find((i) => i.key === 'price:markup')!
  const nightly = Number(scopeOf(n, d).base)
  if (c === 'base') return `€${nightly}`
  const ms = scopeOf(m, d)
  const own = ms.own.find((o) => o.c === c)
  const pct = Number(own ? own.value : ms.base) || 0
  return `€${Math.round(nightly * (1 + pct / 100))}`
}

/* ---------------- amenities: one tick matrix ---------------- */
export type Tri = 'yes' | 'no' | 'unsure'
export interface AmenityDef {
  /** Store key suffix: `amenity:<key>` (the channel editor's key when the amenity exists in data/sl3.ts AMENITIES). */
  key: string
  label: string
  group: string
  base: Tri
  /** Default per channel: listed, not listed, or 'na' (the channel has no such amenity). */
  on: Record<ListingChannel, boolean | 'na'>
  alias?: Partial<Record<ListingChannel, string>>
}
const inData = (name: string) => AMENITIES.flatMap((g) => g.items).find((i) => i.name === name)
/** [store name, label, base, Airbnb, Booking.com, Direct, aliases]; 1 listed · 0 not · '-' channel has none. Paper KH-A1. */
type Raw = [string, string, Tri, 1 | 0 | '-', 1 | 0 | '-', 1 | 0 | '-', Partial<Record<ListingChannel, string>>?]
const RAW: Array<[string, Raw[]]> = [
  ['Internet and office', [['Wi-Fi', 'Wi-Fi (250 Mbps)', 'yes', 1, 1, 1], ['Dedicated workspace', 'Dedicated workspace', 'yes', 1, 1, 1, { booking: 'Desk' }], ['Monitor 27"', 'Monitor 27"', 'yes', 1, '-', 0]]],
  ['Kitchen and dining', [['Kitchen', 'Kitchen', 'yes', 1, 1, 1], ['Dishwasher', 'Dishwasher', 'yes', 1, 1, 1], ['Coffee maker', 'Coffee maker', 'yes', 1, 1, 0, { booking: 'Coffee machine' }], ['Electric kettle', 'Electric kettle', 'yes', 0, 1, 0]]],
  ['Bedroom and laundry', [['Washer', 'Washer', 'yes', 1, 1, 1, { booking: 'Washing machine' }], ['Essentials', 'Essentials (towels, sheets)', 'yes', 1, 1, 1], ['Hangers', 'Hangers', 'yes', 1, 1, 1], ['Iron', 'Iron', 'yes', 1, 0, 1]]],
  ['Bathroom', [['Hair dryer', 'Hair dryer', 'yes', 0, 1, 0], ['Shampoo', 'Shampoo', 'yes', 1, 1, 1], ['Walk-in shower', 'Walk-in shower', 'yes', '-', 1, 1]]],
  ['Heating and cooling', [['Heating', 'Heating', 'yes', 1, 1, 1]]],
  ['Outdoor and building', [['Balcony', 'Balcony', 'unsure', 0, 1, 0], ['Bike racks (shared)', 'Bike racks (shared)', 'yes', 1, '-', 1], ['Self check-in', 'Self check-in', 'yes', 1, 1, 1, { booking: 'Express check-in' }]]],
]
const SCENARIO_GROUPS: string[] = RAW.map(([g]) => g)
/** The default list. Where data/sl3.ts AMENITIES has the amenity, its channels win (the channel editor reads them). */
const SCENARIO_DEFS: AmenityDef[] = RAW.flatMap(([group, rows]) => rows.map(([key, label, base, a, b, d, alias]) => {
  const data = inData(key)
  const one = (c: ListingChannel, v: 1 | 0 | '-'): boolean | 'na' => (v === '-' ? 'na' : data ? data.on.includes(c) : v === 1)
  return { key, label, group, base, alias, on: { airbnb: one('airbnb', a), booking: one('booking', b), direct: one('direct', d) } }
}))
/** What Booking.com calls an amenity when its name differs (channel vocabularies, simplified; the same table
 *  the add row matches against). Used for the generic list of every property but the scenario one. */
const BOOKING_ALIAS: Record<string, string> = {
  'Dedicated workspace': 'Desk', 'Coffee maker': 'Coffee machine', Washer: 'Washing machine', 'Self check-in': 'Express check-in',
  Elevator: 'Lift', Crib: 'Cot', Bathtub: 'Bath',
}
/** A property's amenity rows. Neukölln: the scripted Paper KH-A1 list. Others: their own list (perProperty hubAmenities),
 *  sure and listed on each of their channels. */
export function amenityDefs(pid: string): AmenityDef[] {
  if (isScenarioProperty(pid)) return SCENARIO_DEFS
  return hubAmenities(pid).flatMap((g) => g.items.map((i): AmenityDef => ({
    key: i.name, label: i.name, group: g.group, base: 'yes',
    on: { airbnb: i.on.includes('airbnb'), booking: i.on.includes('booking'), direct: i.on.includes('direct') },
    alias: BOOKING_ALIAS[i.name] && i.on.includes('booking') ? { booking: BOOKING_ALIAS[i.name] } : undefined,
  })))
}
export const amenityGroups = (pid: string): string[] => (isScenarioProperty(pid) ? SCENARIO_GROUPS : hubAmenities(pid).map((g) => g.group))
export const amenityKey = (a: { key: string }) => `amenity:${a.key}`

/** Amenities the host added here (the rows; their ticks and Base go through the store), per property. Cleared by Reset demo. */
export const useKhaAdded = createPropertyStore('hostaway-kh-a', (): { added: AmenityDef[] } => ({ added: [] }), (set) => ({
  add: (a: AmenityDef) => set((s) => ({ added: [...s.added, a] })),
}))

/** Live state of one amenity row. */
export interface AmenityView { def: AmenityDef; base: Tri; on: Record<ListingChannel, boolean | 'na'> }
export function amenityView(def: AmenityDef, base: Record<string, string>, custom: Partial<Record<ListingChannel, Record<string, string | null>>>): AmenityView {
  const k = amenityKey(def)
  const b = base[k]
  const on = { ...def.on }
  for (const c of hubChannels()) {
    if (on[c] === 'na') continue
    const v = custom[c]?.[k]
    if (v === 'on') on[c] = true
    else if (v === 'off') on[c] = false
  }
  return { def, base: b === 'yes' || b === 'no' || b === 'unsure' ? b : def.base, on }
}
/** Tick or untick a channel. Back to the default drops the entry, as the channel editor does. */
export function setAmenity(def: AmenityDef, c: ListingChannel, on: boolean) {
  useStore.getState().sl3Custom(c, amenityKey(def), on === def.on[c] ? undefined : on ? 'on' : 'off')
}

/** What each channel calls an amenity the host types (the add row). channel vocabularies, simplified. */
const MATCH: Array<[string[], Partial<Record<ListingChannel, string | null>>]> = [
  [['smart tv', 'tv', 'television', 'flat-screen tv'], { airbnb: 'TV', booking: 'Flat-screen TV' }],
  [['coffee machine', 'espresso machine', 'nespresso'], { airbnb: 'Coffee maker', booking: 'Coffee machine' }],
  [['microwave'], { airbnb: 'Microwave', booking: 'Microwave' }],
  [['toaster'], { airbnb: 'Toaster', booking: 'Toaster' }],
  [['oven'], { airbnb: 'Oven', booking: 'Oven' }],
  [['dryer', 'tumble dryer'], { airbnb: 'Dryer', booking: 'Tumble dryer' }],
  [['elevator', 'lift'], { airbnb: 'Elevator', booking: 'Lift' }],
  [['air conditioning', 'ac', 'aircon'], { airbnb: 'Air conditioning', booking: 'Air conditioning' }],
  [['fan', 'fans', 'portable fan'], { airbnb: 'Portable fans', booking: 'Fan' }],
  [['bathtub', 'bath', 'tub'], { airbnb: 'Bathtub', booking: 'Bath' }],
  [['crib', 'cot', 'baby cot'], { airbnb: 'Crib', booking: 'Cot' }],
  [['ethernet', 'ethernet connection', 'lan'], { airbnb: 'Ethernet connection', booking: null }],
  [['printer'], { airbnb: null, booking: null }],
]
/** Each channel's own name for a typed amenity; null = the channel has no such amenity. */
export function matchAmenity(typed: string): Record<ListingChannel, string | null> {
  const t = typed.trim().toLowerCase()
  const hit = MATCH.find(([ks]) => ks.includes(t))?.[1]
  const name = typed.trim()
  return { airbnb: hit?.airbnb === undefined ? name : hit.airbnb, booking: hit?.booking === undefined ? name : hit.booking, direct: name }
}

/* ---------------- sources and Ask the AI ---------------- */
/** (Paper kit SOURCES). The scenario property's; others get perProperty genericSources (no message history). */
const SCENARIO_SOURCES: Array<{ title: string; sub: string; icon: string; meta: string; facts: number }> = [
  { title: 'Property details', sub: 'From your listings · Airbnb, Booking.com', icon: 'file-text', meta: 'Updated 29 Sep', facts: 64 },
  { title: 'Message history', sub: '312 conversations, last 12 months', icon: 'message-circle', meta: 'Updated today', facts: 9 },
  { title: 'House rules', sub: 'Rules on every channel', icon: 'shield-check', meta: 'Updated 29 Sep', facts: 9 },
  { title: 'Guidebook (PDF)', sub: 'Neukölln guide.pdf · 14 pages', icon: 'book-2', meta: 'Added 12 Sep', facts: 12 },
]

export const sourcesFor = (pid: string) => (isScenarioProperty(pid) ? SCENARIO_SOURCES : genericSources(pid))

export type Src = 'base' | 'own' | 'set' | 'listed' | 'unlisted'
export interface Fact { n: number; key: string; col: ListingChannel; label: string; value: string; src: Src; state: CellState | 'amenity' }
export interface Answer { q: string; sentences: Array<{ text: string; cites: number[] }>; facts: Fact[]; note?: string }
/** Reads the live value of a key as a guest on a channel sees it. */
export type Lookup = (key: string, c: ListingChannel) => { label: string; text: string; state: CellState | 'amenity'; on?: boolean; why?: string; raw?: string }

const SCENARIO_QUESTIONS: Array<{ id: string; q: string; words: string[] }> = [
  { id: 'week', q: 'Do you have a discount if I stay a whole week?', words: ['week', 'discount', 'weekly', 'deal', 'cheaper'] },
  { id: 'checkin', q: 'What time can I check in?', words: ['check in', 'check-in', 'checkin', 'arrive', 'arrival'] },
  { id: 'pets', q: 'Can I bring my dog?', words: ['dog', 'pet', 'cat', 'animal'] },
  { id: 'balcony', q: 'Is there a balcony?', words: ['balcony', 'terrace', 'outside'] },
  { id: 'wifi', q: 'Could you send me the Wi-Fi name and password?', words: ['wifi', 'wi-fi', 'internet', 'password'] },
]
/** The suggested questions: the scenario's scripted five, or the standard guest questions for any other property. */
export const questionsFor = (pid: string): Array<{ id: string; q: string; words: string[] }> => (isScenarioProperty(pid) ? SCENARIO_QUESTIONS : GENERIC_QUESTIONS)
export const firstQuestion = (pid: string) => questionsFor(pid)[0].id
export const matchQuestion = (text: string) => {
  if (!isScenarioActive()) return matchGeneric(text)?.id ?? null
  const t = text.toLowerCase(); return SCENARIO_QUESTIONS.find((x) => x.words.some((w) => t.includes(w)))?.id ?? null
}

const srcOf = (st: CellState | 'amenity', on?: boolean): Src => (st === 'amenity' ? (on ? 'listed' : 'unlisted') : st === 'own' ? 'own' : st === 'set' ? 'set' : 'base')
/** Scripted, channel-aware answers built from live values (wording). */
export function answer(id: string, c: ListingChannel, look: Lookup): Answer | null {
  const facts: Fact[] = []
  const cite = (key: string) => {
    const v = look(key, c)
    const n = facts.length + 1
    facts.push({ n, key, col: c, label: v.label, value: v.text, src: srcOf(v.state, v.on), state: v.state })
    return { n, v }
  }
  const sentences: Answer['sentences'] = []
  const say = (text: string, ...cites: number[]) => sentences.push({ text, cites })
  const generic = !isScenarioActive()
  const q = (generic ? GENERIC_QUESTIONS : SCENARIO_QUESTIONS).find((x) => x.id === id)
  if (!q) return null
  if (generic) {
    // every other property: the standard answer, built from the values a guest on this channel gets
    const seen = new Map<string, number>()
    const citeOnce = (key: string) => { if (!seen.has(key)) seen.set(key, cite(key).n); return seen.get(key)! }
    for (const x of genericAnswer(id, (k) => look(k, c).raw ?? '')) say(x.text, ...x.cites.map(citeOnce))
  } else if (id === 'week') {
    const w = cite('price:weekly')
    if (w.v.state === 'set') say(`${NAME(c)} sets its own weekly deals, so the price you see already includes any discount.`, w.n)
    else if (parseFloat(w.v.text) > 0) say(`Yes! Stays of 7 nights or more get ${w.v.text} off the nightly rate.`, w.n)
    else say('There’s no weekly discount at the moment.', w.n)
    const m = cite('avail:min_stay'); say(`The minimum stay is ${m.v.text}.`, m.n)
    const f = cite('price:cleaning'); say(`A one-time cleaning fee of ${f.v.text} is added to every stay.`, f.n)
  } else if (id === 'checkin') {
    const a = cite('checkin'); const b = cite('checkin_end'); say(`Check-in is from ${a.v.text} to ${b.v.text}.`, a.n, b.n)
    const m = cite('method'); say(`It’s self check-in with a ${m.v.text.toLowerCase()}: the code arrives 24 hours before you do.`, m.n)
  } else if (id === 'pets') {
    const p = cite('pets')
    if (p.v.text === 'Allowed') { say('Yes, pets are welcome.', p.n); const f = cite('price:pet'); say(`A pet fee of ${f.v.text} per stay applies.`, f.n) }
    else say('Sorry, pets aren’t allowed. Assistance animals are always welcome.', p.n)
  } else if (id === 'balcony') {
    const b = cite('amenity:Balcony')
    say(b.v.on ? 'Yes, the flat has a balcony.' : 'The listing doesn’t mention a balcony, so I can’t promise one.', b.n)
  } else if (id === 'wifi') {
    const w = cite('amenity:Wi-Fi'); say(w.v.on ? 'Yes, there’s fast Wi-Fi (250 Mbps).' : 'The listing doesn’t mention Wi-Fi.', w.n)
    const a = cite('wifi_name'); const b = cite('wifi_password'); say(`The network is ${a.v.text} and the password is ${b.v.text}.`, a.n, b.n)
  }
  // does the answer change on another channel?
  let note: string | undefined
  for (const o of hubChannels().filter((x) => x !== c)) {
    const diff = facts.find((f) => { const v = look(f.key, o); return v.text !== f.value || v.state !== f.state || v.on !== look(f.key, c).on })
    if (!diff) continue
    const v = look(diff.key, o)
    note = v.state === 'set' ? `Asked on ${NAME(o)}, the answer changes: ${NAME(o)} sets its own ${diff.label.toLowerCase().replace(/ discount$/, ' deals')}.`
      : v.state === 'amenity' ? `Asked on ${NAME(o)}, the answer changes: ${NAME(o)} ${v.on ? 'lists' : 'doesn’t list'} it.`
      : `Asked on ${NAME(o)}, the answer changes: ${diff.label.toLowerCase()} is ${v.text} there.`
    break
  }
  if (!generic && id === 'balcony' && look('amenity:Balcony', c).why === 'unsure') note = 'Your Hub isn’t sure the home has a balcony. Answer it in Amenities and every reply follows.'
  return { q: q.q, sentences, facts, note }
}
