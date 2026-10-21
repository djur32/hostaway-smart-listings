/* KH-B · the document's model (concepts/knowledge-hub/KH-B.md, "What the prototype variant needs" §10).
 * One record per fact: id (the store key), section, type, the KhItem behind it (base, per-channel state and values, setBy),
 * source and updated. Built on the first Hub build's model (data/v3-kh.ts khItems, KH_CUSTOM; screens/hub/model.ts scopeOf),
 * so the document, its captions, the AI answers and the channel screens all read the same Base and channel values.
 * Two facts no listing field holds are added here (Floor and access, Checkout instructions); they live under `kh.*` keys,
 * like the first build's custom facts. Content (concepts/SCENARIO.md); structure . */
import { CHANNELS } from '../../../../data/channels'
import type { ListingChannel } from '../../../../data/sl3'
import { AMENITY_CATALOG, type KhFact, type KhItem, type KhSectionId } from '../../../../data/v3-kh'
import { isScenarioProperty, propertyChannels } from '../../../../data/portfolio'
import { profileOf } from '../../../../data/property-seeds'
import { display, scopeOf, type HubDraft, type Scope } from '../../model'
import { createPropertyStore, genericSources, hubAmenities, hubCustom, hubItems } from '../../perProperty'

export const NAME = (c: ListingChannel) => CHANNELS[c].name
export const names = (cs: ListingChannel[]) => { const n = cs.map(NAME); return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }

/* ---------- the document's sections, in order (no Overview: the document is the overview) ---------- */
export interface BSection { id: KhSectionId; label: string; desc: string; add?: string }
export const B_SECTIONS: BSection[] = [
  { id: 'property', label: 'Property', desc: 'What kind of home this is. Every channel reads these facts unless a caption says otherwise.' },
  { id: 'descriptions', label: 'Descriptions', desc: 'What guests read on each channel. A caption marks a channel with its own version.' },
  { id: 'photos', label: 'Photos', desc: 'Your photo library. Each channel shows its own selection and order.' },
  { id: 'arrival', label: 'Arrival', desc: 'What guests need to get in, settle in and check out.' },
  { id: 'location', label: 'Location', desc: 'Where it is and how to get around.' },
  { id: 'amenities', label: 'Amenities', desc: '', add: 'Add an amenity' },
  { id: 'rules', label: 'House rules', desc: 'Rules every channel shows, and the AI enforces in replies.', add: 'Add a rule' },
  { id: 'pricing', label: 'Pricing', desc: 'Your rates and fees. Channels start from the Base; a caption shows a channel’s own value.' },
  { id: 'availability', label: 'Availability', desc: 'How and when guests can book.' },
  { id: 'policies', label: 'Policies', desc: 'Cancellation and booking requests. Each channel has its own terms.' },
  { id: 'custom', label: 'Custom facts', desc: 'Things guests ask about that no listing field holds. Only your AI replies use them.' },
]
/** A property with one channel has no per-channel differences to explain: those sections read for that channel. */
const ONE_CHANNEL: Partial<Record<KhSectionId, (n: string) => string>> = {
  property: (n) => `What kind of home this is, as ${n} shows it.`,
  descriptions: (n) => `What guests read on ${n}.`,
  photos: (n) => `Your photo library, and the selection and order ${n} shows.`,
  rules: (n) => `Rules ${n} shows, and the AI enforces in replies.`,
  pricing: () => 'Your rates and fees.',
  policies: (n) => `Cancellation and booking requests, as ${n} sets them.`,
}
export const sectionDesc = (sec: BSection, chs: ListingChannel[]) => (chs.length === 1 ? ONE_CHANNEL[sec.id]?.(NAME(chs[0])) : undefined) ?? sec.desc
export const sectionLabel = (id: KhSectionId) => B_SECTIONS.find((s) => s.id === id)?.label ?? id
export const isBSection = (s?: string | null): s is KhSectionId => !!s && B_SECTIONS.some((x) => x.id === s)

/** Sub-headings inside a section. */
export const B_GROUPS: Partial<Record<KhSectionId, Array<{ id: string; title: string }>>> = {
  arrival: [{ id: 'inside', title: 'Getting inside and setup' }, { id: 'checkout', title: 'Checkout' }, { id: 'resources', title: 'Guest resources' }],
  rules: [{ id: 'times', title: 'Check-in and checkout' }, { id: 'rules', title: 'Rules' }],
  pricing: [{ id: 'base', title: 'Base price' }, { id: 'occupancy', title: 'Occupancy' }, { id: 'fees', title: 'Fees' }, { id: 'discounts', title: 'Discounts' }],
}

/* ---------- sources (the strip under the header) ---------- */
export interface BSource { id: string; name: string; meta: string; icon: string; updated: string }
/** Neukölln's sources (message history and guidebook are the scenario's). */
export const B_SOURCES: BSource[] = [
  { id: 'details', name: 'Property details', meta: '2 listings', icon: 'file-text', updated: 'Updated 29 Sep' },
  { id: 'messages', name: 'Message history', meta: '312 conversations', icon: 'message-circle', updated: 'Updated today' },
  { id: 'rules', name: 'House rules', meta: 'On every channel', icon: 'shield-check', updated: 'Updated 29 Sep' },
  { id: 'guidebook', name: 'Guidebook', meta: 'PDF · 14 pages', icon: 'book-2', updated: 'Added 12 Sep' },
]
/** A property's sources: Neukölln's scripted strip, or the generic one (its listings and house rules, no message history
 *  and no guidebook until the host adds them). */
export function bSources(pid: string): BSource[] {
  if (isScenarioProperty(pid)) return B_SOURCES
  const chs = propertyChannels(pid)
  const listings = chs.filter((c) => c !== 'direct').length
  return genericSources(pid).map((s) => ({
    id: s.id, name: s.title, icon: s.icon, updated: 'Updated 29 Sep',
    meta: s.id === 'details' ? (listings ? `${listings} ${listings === 1 ? 'listing' : 'listings'}` : 'Your booking site') : chs.length > 1 ? 'On every channel' : `On ${chs.map(NAME).join('')}`,
  }))
}

/* ---------- one fact ---------- */
export interface BFact {
  /** The store key (FIELDS key, price:*, avail:*, kh.*). */
  id: string
  section: KhSectionId
  group?: string
  /** The kind of fact, as the add form names it (Fee, Rule, Instruction…). */
  type: string
  label: string
  item: KhItem
  /** Long values take the full width; short ones sit two to a row. */
  wide: boolean
  /** Merged into another fact in read mode (Check-in time ends reads with Check-in). */
  hideRead?: boolean
  source: string
  updated: string
}
/** Facts no listing field holds (values). Neukölln: its scripted Floor and access and Checkout instructions.
 *  Any other property: Floor and access from its own profile (data/property-seeds), no checkout instructions. */
function extraFacts(pid: string): KhItem[] {
  const chs = propertyChannels(pid)
  const everywhere = Object.fromEntries(chs.map((c) => [c, 'listing'])) as KhItem['state']
  if (isScenarioProperty(pid)) return [
    { key: 'kh.floor', section: 'property', label: 'Floor and access', help: 'What guests climb, and how.', kind: 'text', base: '4th floor, no elevator', state: { ...everywhere } },
    { key: 'kh.checkout_instructions', section: 'arrival', group: 'checkout', label: 'Checkout instructions', help: 'Where the keys go and how to lock up.', kind: 'textarea',
      base: 'Leave the flat key on the kitchen table and pull the door shut until it clicks. The street-door code stops working at 14:00.', state: { ...everywhere } },
  ]
  const floor = profileOf(pid)?.floor
  return floor ? [{ key: 'kh.floor', section: 'property', label: 'Floor and access', help: 'What guests climb, and how.', kind: 'text', base: floor.charAt(0).toUpperCase() + floor.slice(1), state: { ...everywhere } }] : []
}
const TYPE: Record<KhSectionId, string> = {
  property: 'Detail', descriptions: 'Text', photos: 'Photo', arrival: 'Instruction', location: 'Place', amenities: 'Amenity', rules: 'Rule',
  pricing: 'Fee', availability: 'Stay rule', policies: 'Policy', custom: 'Fact',
}
const SOURCE: Partial<Record<KhSectionId, string>> = { rules: 'House rules' }
const isWide = (i: KhItem) => i.kind === 'textarea' || i.kind === 'tasks' || i.kind === 'url'

/** Every fact in document order, for property `pid` (its own items, read at call time). `added` = facts the host added (useHubUi). */
export function bFacts(added: KhFact[], pid: string): BFact[] {
  const items = [...hubItems(pid), ...extraFacts(pid)]
  const by = (k: string) => items.find((i) => i.key === k)
  const out: BFact[] = []
  const push = (key: string, section: KhSectionId, o: Partial<BFact> & { label?: string } = {}) => {
    const it = by(key)
    if (!it) return
    const item = o.label ? { ...it, label: o.label } : it
    out.push({ id: key, section, group: o.group ?? (section === 'pricing' ? it.group : undefined), type: o.type ?? (section === 'pricing' ? (it.group === 'discounts' ? 'Discount' : 'Fee') : TYPE[section]),
      label: item.label, item, wide: o.wide ?? isWide(item), hideRead: o.hideRead, source: SOURCE[section] ?? 'Property details', updated: '29 Sep' })
  }
  // Property (Maximum guests is a fact about the home: the Pricing screens read it from here)
  for (const k of ['type', 'room', 'kh.size', 'kh.floor', 'kh.bedrooms', 'kh.bathrooms']) push(k, 'property')
  push('price:max', 'property', { label: 'Maximum guests', type: 'Detail' })
  for (const k of ['tags', 'languages']) push(k, 'property')
  // Descriptions
  for (const k of ['name', 'summary', 'description', 'space', 'other']) push(k, 'descriptions', { wide: true })
  // Arrival: getting in, checkout, resources
  for (const k of ['method', 'wifi_name', 'wifi_password', 'method_details', 'access', 'interaction', 'manual']) push(k, 'arrival', { group: 'inside' })
  for (const k of ['checkout_tasks', 'kh.checkout_instructions']) push(k, 'arrival', { group: 'checkout' })
  for (const k of ['guidebook', 'rental_agreement', 'upsell']) push(k, 'arrival', { group: 'resources' })
  // Location
  for (const k of ['address', 'unit', 'zip', 'city', 'state', 'country', 'pin', 'getting_around', 'directions', 'neighbourhood']) push(k, 'location')
  // House rules
  push('checkin', 'rules', { group: 'times', label: 'Check-in' })
  push('checkin_end', 'rules', { group: 'times', hideRead: true })
  push('checkout', 'rules', { group: 'times', label: 'Checkout' })
  for (const k of ['children', 'infants', 'pets', 'smoking', 'events', 'house_rules']) push(k, 'rules', { group: 'rules' })
  // Pricing (all but Maximum guests), Availability
  for (const i of items.filter((x) => x.section === 'pricing' && x.key !== 'price:max')) push(i.key, 'pricing')
  for (const i of items.filter((x) => x.section === 'availability')) push(i.key, 'availability', { wide: false })
  // Custom facts: yours, then ones added in the Hub that don't belong to a section
  for (const f of [...hubCustom(pid), ...added.filter((a) => !a.id.startsWith('b.'))]) out.push(customFact(f, 'custom'))
  // Facts added inline in a section ("+ Add a fact to Pricing"): id = b.<section>.<time>.<destinations>
  for (const a of added.filter((x) => x.id.startsWith('b.'))) {
    const sec = a.id.split('.')[1]
    if (isBSection(sec) && sec !== 'amenities') out.push(customFact(a, sec))
  }
  return out
}
function customFact(f: KhFact, section: KhSectionId): BFact {
  const key = `kh.${f.id}`
  const item: KhItem = { key, section, label: f.label, kind: 'textarea', base: f.value, state: {} }
  return { id: key, section, type: section === 'custom' ? 'Fact' : TYPE[section], label: f.label, item, wide: true, source: f.source.split(' · ')[0], updated: f.source.split(' · ')[1] ?? '' }
}
/** Where an added fact goes: parsed from its id (b.<section>.<time>.<ai+airbnb+booking+direct>). */
export function addedDests(id: string): string[] { return id.startsWith('kh.b.') ? (id.split('.')[4] ?? '').split('+').filter(Boolean) : [] }

/* ---------- values ---------- */
/** The value a channel's guests get (own, set by the channel, or the Base). '' when the channel doesn't have the field. */
export function valueFor(_f: BFact, s: Scope, c: ListingChannel): string {
  const own = s.own.find((o) => o.c === c)
  if (own) return own.value
  const set = s.set.find((x) => x.c === c)
  if (set) return set.value
  if (s.on.length && !s.on.includes(c)) return ''
  return s.base
}
export const scopeFor = (f: BFact, d: HubDraft) => scopeOf(f.item, d)
/** How a value reads in the document. */
export function readValue(f: BFact, v: string, d?: HubDraft): string {
  if (f.id === 'checkin' && d) return `${v} – ${d.base('checkin_end', '10:00 PM')}`
  if (f.id === 'price:max') return v
  if (f.item.kind === 'toggle') return v === 'Yes' ? 'Allowed' : 'Not allowed'
  return display(f.item, v)
}
/** Short channel values read inline in the caption ("Airbnb 3%"); long ones say "has its own" and open on hover. */
export const isShort = (f: BFact, v: string) => !f.wide && v.length <= 36

/* ---------- amenities: the model's list, per-channel on/off from the store, plus amenities the host added ---------- */
export interface BAmenity { name: string; group: string; on: ListingChannel[]; orig: ListingChannel[]; note?: string; key: string }
export function bAmenities(custom: Partial<Record<ListingChannel, Record<string, string | null>>>, pid: string): Array<{ group: string; items: BAmenity[] }> {
  const ALL = propertyChannels(pid)
  const list = hubAmenities(pid)
  const groups: Array<{ group: string; items: BAmenity[] }> = list.map((g) => ({ group: g.group, items: g.items.map((i): BAmenity => {
    const key = `amenity:${i.name}`
    const on = ALL.filter((c) => { const v = custom[c]?.[key]; return v === 'on' ? true : v === 'off' ? false : i.on.includes(c) })
    return { name: i.name, group: g.group, on, orig: i.on, note: i.note, key }
  }) }))
  // added amenities: store keys amenity:<name> the model doesn't list
  const known = new Set(list.flatMap((g) => g.items.map((i) => i.name)))
  const extra = new Set<string>()
  for (const c of ALL) for (const [k, v] of Object.entries(custom[c] ?? {})) if (k.startsWith('amenity:') && v === 'on' && !known.has(k.slice(8))) extra.add(k.slice(8))
  for (const name of extra) {
    const group = amenityGroup(name)
    const key = `amenity:${name}`
    const on = ALL.filter((c) => custom[c]?.[key] === 'on')
    const item: BAmenity = { name, group, on, orig: [], key }
    const g = groups.find((x) => x.group === group)
    if (g) g.items.push(item); else groups.push({ group, items: [item] })
  }
  return groups
}
/** Categories the host picked for amenities they added (kept in this browser per property; the model's catalog covers the
 *  rest). The first build kept one plain `{ name: group }` map under this key: it is wrapped as the store's un-keyed
 *  version 0 here, so createPropertyStore hands it to Neukölln, where it was made. "Reset demo" clears every property. */
const GROUPS_KEY = 'hostaway-khb-amenity-groups'
try {
  const raw: unknown = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? 'null')
  if (raw && typeof raw === 'object' && !('state' in raw)) localStorage.setItem(GROUPS_KEY, JSON.stringify({ state: { groups: raw }, version: 0 }))
} catch { /* private mode */ }
const useAmenityGroups = createPropertyStore(GROUPS_KEY, () => ({ groups: {} as Record<string, string> }), (set) => ({
  remember: (name: string, group: string) => set((s) => ({ groups: { ...s.groups, [name]: group } })),
}))
export function rememberAmenityGroup(name: string, group: string) { useAmenityGroups.getState().remember(name, group) }
export const amenityGroup = (name: string) => useAmenityGroups.getState().groups[name] ?? Object.entries(AMENITY_CATALOG).find(([, xs]) => xs.includes(name))?.[0] ?? 'Other'
/** The categories an added amenity can go in: the property's own, the catalog's, Other. */
export const amenityGroupsFor = (pid: string) => [...new Set([...hubAmenities(pid).map((g) => g.group), ...Object.keys(AMENITY_CATALOG), 'Other'])]
export const AMENITY_SUGGEST = Object.values(AMENITY_CATALOG).flat()
/** "On every channel" only means something when the property has more than one. */
export const onText = (on: ListingChannel[], all: ListingChannel[]) => (on.length === all.length && all.length > 1 ? 'On every channel' : `On ${names(on)}`)
