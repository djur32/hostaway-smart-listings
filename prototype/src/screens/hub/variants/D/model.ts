/* KH-D · Overview cards → sheet: the model behind the Overview (concepts/knowledge-hub/KH-D.md).
 * Everything is derived from the prototype's field model (data/v3-kh.ts khItems(), which reads data/sl3.ts FIELDS and
 * data/v3-ch.ts PRICES / AVAILABILITY) and the store (sl3.base / sl3.custom), so a Save in a sheet updates the cards.
 * Values are (concepts/SCENARIO.md); the structure is Hostaway's Details, Pricing, Availability, Knowledge Hub. */
import { LISTING_CHANNELS, type ListingChannel } from '../../../../data/sl3'
import { isScenarioProperty, propertyById, propertyChannels } from '../../../../data/portfolio'
import { profileOf } from '../../../../data/property-seeds'
import { INSTANT_BOOK, INSTANT_DEFAULT } from '../../../../data/v3-ch'
import { POLICY_DEFAULT } from '../../../../data/policies'
import { useStore } from '../../../../store/store'
import { cancellationCards } from '../../policyCards'
import { AMENITY_CATALOG, KH_CUSTOM, type KhFact, type KhItem, type KhSectionId } from '../../../../data/v3-kh'
import { display, scopeOf, type HubDraft } from '../../model'
import { GENERIC_QUESTIONS, genericAnswer, genericSources, hubAmenities, hubCustom, hubItems, hubPid, matchGeneric } from '../../perProperty'

/* Multi-property (QA B01/B02): the channels, items, amenities, facts, sources and answers below are the active property's.
 * Neukölln (the scenario) keeps every scripted line; any other property gets values built from its own data. */
/** The scenario's channels (Neukölln is on all three). Other properties: `hubChannels()` / `useListingChannels()`. */
const SCENARIO_CHANNELS: ListingChannel[] = LISTING_CHANNELS
export const NAME: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct' }
export const names = (cs: ListingChannel[]) => { const n = cs.map((c) => NAME[c]); return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }

/* ---------- categories (tabs and cards) ---------- */
export type CatId = KhSectionId
export interface CatDef { id: CatId; label: string; icon: string; unit: [string, string]; add: string; sheet: 'fields' | 'photos' | 'amenities' | 'pa' | 'policies' | 'custom'; sub: string }
export const CATS: CatDef[] = [
  { id: 'property', label: 'Property', icon: 'home', unit: ['fact', 'facts'], add: 'Add fact', sheet: 'fields', sub: 'What kind of home this is. Every channel reads these facts.' },
  { id: 'descriptions', label: 'Descriptions', icon: 'file-text', unit: ['text', 'texts'], add: 'Add text', sheet: 'fields', sub: 'The name and texts guests read before they book' },
  { id: 'photos', label: 'Photos', icon: 'photo', unit: ['photo', 'photos'], add: 'Add photos', sheet: 'photos', sub: 'Your photo library, and what each channel shows' },
  { id: 'arrival', label: 'Arrival', icon: 'clock', unit: ['fact', 'facts'], add: 'Add fact', sheet: 'fields', sub: 'What guests need for check-in, their stay and checkout' },
  { id: 'location', label: 'Location', icon: 'map-pin', unit: ['fact', 'facts'], add: 'Add fact', sheet: 'fields', sub: 'Where the home is and how to get around' },
  { id: 'amenities', label: 'Amenities', icon: 'tools-kitchen-2', unit: ['amenity', 'amenities'], add: 'Add amenity', sheet: 'amenities', sub: 'where each one is listed' },
  { id: 'rules', label: 'House rules', icon: 'list-details', unit: ['rule', 'rules'], add: 'Add rule', sheet: 'fields', sub: 'Check-in times and the rules guests follow' },
  { id: 'pricing', label: 'Pricing', icon: 'coin', unit: ['value', 'values'], add: 'Add fee', sheet: 'pa', sub: 'Rates, fees, discounts and stay rules your channels start from' },
  { id: 'availability', label: 'Availability', icon: 'calendar-event', unit: ['value', 'values'], add: 'Add stay rule', sheet: 'pa', sub: 'Rates, fees, discounts and stay rules your channels start from' },
  { id: 'policies', label: 'Policies', icon: 'shield-check', unit: ['value', 'values'], add: 'Add policy', sheet: 'policies', sub: 'Cancellation and booking requests, per channel' },
  { id: 'custom', label: 'Custom facts', icon: 'bulb', unit: ['fact', 'facts'], add: 'Add fact', sheet: 'custom', sub: 'Things guests ask about that no listing field holds. Only your AI replies use them.' },
]
export const catById = (id: string) => CATS.find((c) => c.id === id)
export const TAB_MAIN: CatId[] = ['property', 'descriptions', 'photos', 'arrival', 'location', 'amenities', 'rules', 'pricing']
export const TAB_MORE: CatId[] = ['availability', 'policies', 'custom']

/* ---------- reading the store as a (read-only) draft, so scopeOf works on the Overview ---------- */
type Custom = Partial<Record<ListingChannel, Record<string, string | null>>>
export function liveDraft(base: Record<string, string>, custom: Custom): HubDraft {
  const no = () => {}
  return {
    dirty: false, base: (k, f) => base[k] ?? f, cv: (c, k) => custom[c]?.[k],
    setBase: no, setCustom: no, isSplit: () => false, setSplit: no, baseEdits: {}, customEdits: [], commit: no, discard: no,
  }
}
/** The value a channel's guest sees for an item (its own, the one the channel sets, or the Base). */
export function valueOn(item: KhItem, d: HubDraft, c: ListingChannel): { value: string; own: boolean } {
  const s = scopeOf(item, d)
  const o = s.own.find((x) => x.c === c)
  if (o) return { value: o.value, own: true }
  const st = s.set.find((x) => x.c === c)
  if (st) return { value: st.value, own: true }
  return { value: s.base, own: false }
}

/* ---------- amenities (the Paper frame's 17, per channel; keys `amenity:<name>` as in the channel editor) ---------- */
export interface Amenity { name: string; label?: string; on: ListingChannel[]; note?: string; disagree?: boolean }
/** Neukölln's amenities, with the scenario's import quirks. */
const ALL = SCENARIO_CHANNELS
export const AMENITY_GROUPS: Array<{ group: string; items: Amenity[] }> = [
  { group: 'Internet and office', items: [{ name: 'Wi-Fi', label: 'Wi-Fi (250 Mbps)', on: ALL }, { name: 'Dedicated workspace', on: ['airbnb', 'direct'], note: 'Booking.com calls it “Desk”' }, { name: 'Monitor 27"', on: ['airbnb'] }] },
  { group: 'Kitchen and dining', items: [{ name: 'Kitchen', on: ALL }, { name: 'Dishwasher', on: ALL }, { name: 'Coffee maker', on: ALL }, { name: 'Electric kettle', on: ['booking'] }] },
  { group: 'Bedroom and laundry', items: [{ name: 'Washer', on: ALL }, { name: 'Essentials', on: ALL }, { name: 'Hangers', on: ALL }, { name: 'Iron', on: ['airbnb'] }] },
  { group: 'Bathroom', items: [{ name: 'Hair dryer', on: ['booking'] }, { name: 'Shampoo', on: ALL }, { name: 'Walk-in shower', on: ['booking', 'direct'] }] },
  { group: 'Outdoor and building', items: [{ name: 'Balcony', on: ['booking'], disagree: true }, { name: 'Bike racks (shared)', on: ['airbnb', 'direct'] }, { name: 'Self check-in', on: ['airbnb', 'direct'] }] },
]
/** A property's amenities: Neukölln's scripted list, or the generic one from its profile (every amenity on every channel). */
export const baseAmenities = (pid: string): Array<{ group: string; items: Amenity[] }> =>
  isScenarioProperty(pid) ? AMENITY_GROUPS : hubAmenities(pid).map((g) => ({
    group: g.group,
    // hubAmenities reads "Elevator" off /lift/ in the floor, which also matches "no lift": drop it there
    items: g.items.filter((i) => !(i.name === 'Elevator' && /no lift/i.test(profileOf(pid)?.floor ?? ''))).map((i) => ({ name: i.name, on: [...i.on], note: i.note })),
  })).filter((g) => g.items.length)
export const amenityKey = (name: string) => `amenity:${name}`
/** Is it listed on the channel? An `amenity:<name>` entry of 'on' / 'off' overrides how the listing came in. */
export const listedOn = (a: Amenity, c: ListingChannel, cv: (c: ListingChannel, k: string) => string | null | undefined) => {
  const v = cv(c, amenityKey(a.name))
  return v === 'on' ? true : v === 'off' ? false : a.on.includes(c)
}
const groupOf = (name: string) => Object.entries(AMENITY_CATALOG).find(([, xs]) => xs.includes(name))?.[0]
/** Amenities the host added (keys in the store or the draft that aren't in the list), filed under the catalog's group. */
export function amenityGroups(keys: string[], pid = hubPid()): Array<{ group: string; items: Amenity[] }> {
  const start = baseAmenities(pid)
  const known = new Set(start.flatMap((g) => g.items.map((i) => i.name)))
  const added = [...new Set(keys.filter((k) => k.startsWith('amenity:')).map((k) => k.slice(8)).filter((n) => !known.has(n)))]
  const out = start.map((g) => ({ group: g.group, items: [...g.items] }))
  for (const n of added) {
    const g = groupOf(n) ?? 'Added by you'
    let slot = out.find((x) => x.group === g)
    if (!slot) { slot = { group: g, items: [] }; out.push(slot) }
    slot.items.push({ name: n, on: [] })
  }
  return out
}
export const AMENITY_SUGGESTIONS = Object.values(AMENITY_CATALOG).flat()

/* ---------- policies (cancellation is set on each channel; booking requests per channel) ---------- */
export const BASE_CANCELLATION = 'Moderate'
export const BASE_INSTANT = 'review'
export const instantLabel = (id: string) => INSTANT_BOOK.find((o) => o.id === id)?.label ?? id
export const instantOn = (c: ListingChannel, custom: Custom) => (custom[c]?.['policy:instant'] ?? INSTANT_DEFAULT[c]) as string
/** Live from the Booking policies flow (store `policies`), not a static list. */
export const cancellationOn = (c: ListingChannel) => cancellationCards(c, useStore.getState().policies?.[c] ?? POLICY_DEFAULT[c])[0].title

/* ---------- sources, suggested questions ---------- */
export interface Source { icon: string; name: string; detail: string; when: string }
/** Neukölln's sources (message history and guidebook). */
export const SOURCES: Source[] = [
  { icon: 'file-text', name: 'Property details', detail: 'From Airbnb and Booking.com', when: 'Updated 29 Sep' },
  { icon: 'message-circle', name: 'Message history', detail: '312 conversations, last 12 months', when: 'Updated today' },
  { icon: 'list-details', name: 'House rules', detail: 'Rules on every channel', when: 'Updated 29 Sep' },
  { icon: 'book-2', name: 'Guidebook (PDF)', detail: 'Neukölln guide.pdf · 14 pages', when: 'Added 12 Sep' },
]
export const SUGGESTED = ['What time is check-in?', 'Is there free parking?', 'Can I book just 2 nights?']
/** Any other property: its listings and house rules (perProperty genericSources), no message history or guidebook. */
export const sourcesFor = (pid: string): Source[] =>
  isScenarioProperty(pid) ? SOURCES : genericSources(pid).map((s) => ({ icon: s.icon, name: s.title, detail: s.sub, when: s.meta }))
const GENERIC_SUGGESTED = ['checkin', 'minstay', 'pets'].map((id) => GENERIC_QUESTIONS.find((g) => g.id === id)!.q)
export const suggestedFor = (pid: string) => (isScenarioProperty(pid) ? SUGGESTED : GENERIC_SUGGESTED)

/* ---------- facts: custom facts, and facts the host filed into a category (Add anything / + Add fact) ---------- */
/** Parking is the gap this direction surfaces ("guests ask about it"), so it isn't in the starting facts. */
export const START_FACTS: KhFact[] = KH_CUSTOM.filter((f) => f.id !== 'parking')
/** The custom facts a property starts with: Neukölln's scripted ones; none anywhere else until the host adds them. */
export const startFacts = (pid: string): KhFact[] => (isScenarioProperty(pid) ? START_FACTS : hubCustom(pid))
/** Facts added here are kept in the Hub's UI store with the id `khd.<category>.<n>`. */
export const factCat = (f: KhFact): CatId | null => { const m = /^khd\.([a-z]+)\./.exec(f.id); return m ? (m[1] as CatId) : null }

/** Where a typed fact probably belongs, and a short label for it. The host confirms before it's saved. */
const FILE_RULES: Array<[RegExp, CatId, string?]> = [
  [/park|garage|\bcar\b/i, 'location', 'Parking'],
  [/wi-?fi|router|internet/i, 'arrival', 'Wi-Fi'],
  [/luggage|bags?\b/i, 'arrival', 'Luggage'],
  [/check-?in|keys?\b|door|lockbox/i, 'arrival', 'Getting in'],
  [/€|price|fee|discount|deposit/i, 'pricing'],
  [/cancel|refund/i, 'policies'],
  [/minimum stay|nights? minimum|advance notice/i, 'availability'],
  [/\bpets?\b|dogs?|smok|part(y|ies)|quiet|noise|shoes/i, 'rules'],
  [/towel|coffee|iron|hair ?dryer|oven|microwave|\btv\b|crib|fan|air con|kettle|toaster/i, 'amenities'],
  [/u-?bahn|s-?bahn|\bbus\b|train|airport|supermarket|caf[eé]|bakery|walk|neighbou?rhood|restaurant/i, 'location'],
  [/trash|recycl|bins?\b|emergency|contact/i, 'custom'],
]
export function fileFact(text: string): { cat: CatId; label: string } {
  const t = text.trim()
  for (const [re, cat, label] of FILE_RULES) if (re.test(t)) return { cat, label: label ?? firstWords(t) }
  return { cat: 'custom', label: firstWords(t) }
}
const firstWords = (t: string) => { const w = t.replace(/[.:!?].*$/s, '').split(/\s+/).slice(0, 4).join(' '); return w ? w[0].toUpperCase() + w.slice(1) : 'New fact' }

/* ---------- the Overview's per-category summary ---------- */
export interface CatSummary {
  cat: CatDef; count: number; v1?: string; v2?: string; photos?: string[]; morePhotos?: number
  own: Record<ListingChannel, string[]>; caption: string; missing: string[]; hoverTitle: string
}
export interface SummaryInput {
  live: HubDraft; custom: Custom
  /** `perChannel`: what each of the property's channels shows (data/photos channelPhotos), for its coverage chips. */
  photos: { keys: string[]; urls: string[]; deskOnAirbnb: number; perChannel?: Partial<Record<ListingChannel, { shown: string[]; cover: string }>> }
  facts: KhFact[]; resolved: Record<string, string>
  /** The active property (defaults to the store's). */
  pid?: string
}
const short = (t: string) => t.replace(':00', '')
const nights = (v: string) => v.replace(/\D.*$/, '')
const firstSentence = (t: string) => (t.match(/^[^.!?]+[.!?]/)?.[0] ?? t).trim()
const ownRecord = (chs: ListingChannel[]) => Object.fromEntries(chs.map((c) => [c, [] as string[]])) as Record<ListingChannel, string[]>
export function summarise(inp: SummaryInput): CatSummary[] {
  const pid = inp.pid ?? hubPid()
  const scenario = isScenarioProperty(pid)
  const chs = propertyChannels(pid)
  const items = hubItems(pid)
  const prof = profileOf(pid)
  const { live } = inp
  const b = (k: string, f = '') => live.base(k, items.find((i) => i.key === k)?.base ?? f)
  const has = (k: string) => items.some((i) => i.key === k)
  const facts = (cat: CatId) => inp.facts.filter((f) => factCat(f) === cat)
  return CATS.map((cat) => {
    const own = ownRecord(chs)
    const secItems = items.filter((i) => i.section === cat.id)
    for (const it of secItems) {
      const s = scopeOf(it, live, chs)
      for (const o of s.own) if (o.orig === 'override' || o.orig === 'inherit') own[o.c].push(it.label)
    }
    const missing: string[] = []
    const base: Omit<CatSummary, 'caption'> = { cat, count: secItems.length + facts(cat.id).length, own, missing, hoverTitle: `${cat.label}: its own values` }
    let caption: string | undefined
    switch (cat.id) {
      case 'property':
        base.v1 = `${b('type')} · ${b('room')}`
        base.v2 = scenario ? `${b('kh.size')} · 4th floor · sleeps ${b('price:max', '2')}` : [b('kh.size'), prof?.floor, `sleeps ${b('price:max', String(prof?.guests ?? 2))}`].filter(Boolean).join(' · ')
        break
      case 'descriptions': base.v1 = b('name'); base.v2 = 'Summary, The space, Other details'; break
      case 'photos': {
        base.count = inp.photos.keys.length
        base.photos = inp.photos.urls.slice(0, 3); base.morePhotos = Math.max(0, inp.photos.keys.length - 3)
        base.hoverTitle = 'Photos: what the channel shows'
        if (scenario) {
          own.airbnb = ['Its own order: 18 photos, cover living room']; own.booking = ['Its own order and cover: 14 photos, cover bedroom']
          caption = '2 channels have their own order'
          if (inp.photos.deskOnAirbnb > 4) missing.push(`Airbnb shows the desk ${ordinal(inp.photos.deskOnAirbnb + 1)} · guests look for it first`)
        } else {
          // a channel "has its own" when the order or the photos it shows differ from the library
          for (const c of chs) {
            const pc = inp.photos.perChannel?.[c]
            if (!pc || pc.shown.join() === inp.photos.keys.join()) continue
            const coverOwn = pc.shown[0] !== inp.photos.keys[0]
            own[c] = [`Its own order${coverOwn ? ' and cover' : ''}: ${pc.shown.length} photos, cover ${pc.cover.toLowerCase()}`]
          }
          const n = chs.filter((c) => own[c].length).length
          caption = n === 0 ? (chs.length > 1 ? 'Same order on every channel' : `${NAME[chs[0]] ?? 'Your listing'} shows your library order`)
            : n === 1 ? `${NAME[chs.find((c) => own[c].length)!]} has its own order` : `${n} channels have their own order`
        }
        break
      }
      case 'arrival':
        base.v1 = `${b('method')} · from ${b('checkin')}`
        base.v2 = scenario ? 'Wi-Fi, house manual, checkout tasks' : `Wi-Fi, house manual${has('checkout_tasks') ? ', checkout tasks' : ''}`
        break
      case 'location':
        if (scenario) {
          base.v1 = `North Neukölln, ${b('city')}`; base.v2 = '5 min walk to Tempelhofer Feld'
          if (!facts('location').some((f) => /park/i.test(`${f.label} ${f.value}`))) missing.push('Parking isn’t answered · guests ask about it')
        } else {
          const area = propertyById(pid)?.area
          base.v1 = [area, b('city')].filter(Boolean).join(', ')
          base.v2 = firstSentence(b('getting_around'))
        }
        break
      case 'amenities': {
        const groups = amenityGroups(chs.flatMap((c) => Object.keys(inp.custom[c] ?? {})), pid)
        const list = groups.flatMap((g) => g.items)
        const on = (a: Amenity, c: ListingChannel) => listedOn(a, c, (ch, k) => inp.custom[ch]?.[k])
        for (const c of chs) own[c] = list.filter((a) => !on(a, c) && chs.some((x) => on(a, x))).map((a) => a.label ?? a.name)
        base.count = list.length
        base.hoverTitle = 'Amenities: not listed there'
        const notAll = list.filter((a) => chs.some((c) => !on(a, c))).length
        if (scenario) {
          base.v1 = 'Wi-Fi, workspace, washer'; base.v2 = 'Dishwasher, coffee maker, bike racks'
          caption = notAll ? `${notAll} aren’t on every channel` : 'Every amenity is on every channel'
          if (!inp.resolved['d-balcony']) missing.push('Channels disagree: Balcony')
        } else {
          const listed = list.filter((a) => chs.some((c) => on(a, c))).map((a) => a.label ?? a.name)
          base.v1 = listed.slice(0, 3).join(', ') || 'No amenities yet'
          base.v2 = listed.slice(3, 6).join(', ')
          caption = chs.length === 1 ? (notAll ? `${notAll} not listed on ${NAME[chs[0]]}` : `Every amenity is listed on ${NAME[chs[0]]}`)
            : notAll ? `${notAll} aren’t on every channel` : 'Every amenity is on every channel'
        }
        break
      }
      case 'rules': {
        const no = (k: string) => b(k) === 'No'
        base.v1 = [no('events') ? 'No parties' : 'Parties allowed', no('smoking') ? 'No smoking inside' : 'Smoking allowed'].join(' · ')
        if (scenario) {
          base.v2 = [no('pets') ? 'No pets' : 'Pets allowed', 'Shoes off inside'].join(' · ')
          if (!inp.resolved['d-checkin']) missing.push('Channels disagree: Check-in from')
        } else base.v2 = [no('pets') ? 'No pets' : 'Pets allowed', no('children') ? 'No children' : 'Children welcome'].join(' · ')
        break
      }
      case 'pricing': base.v1 = `€${b('price:nightly')} a night · €${b('price:weekend')} at weekends`; base.v2 = `Cleaning €${b('price:cleaning')} · weekly −${b('price:weekly')}%`; break
      case 'availability': {
        const adv = b('avail:advance'); const prep = b('avail:prep')
        base.v1 = `${nights(b('avail:min_stay'))}–${b('avail:max_stay')}`
        base.v2 = `${adv === 'None' ? 'Same-day booking' : `${adv} notice`} · ${prep === 'None' ? 'no prep time' : prep.toLowerCase()}`
        break
      }
      case 'policies': {
        base.count = 2
        for (const c of chs) {
          if (cancellationOn(c) !== BASE_CANCELLATION) own[c].push(`Cancellation: ${cancellationOn(c)}`)
          if (instantOn(c, inp.custom) !== BASE_INSTANT) own[c].push(`Booking requests: ${instantLabel(instantOn(c, inp.custom))}`)
        }
        base.v1 = `${BASE_CANCELLATION} cancellation`
        const ci = short(b('checkin')); const ce = short(b('checkin_end', '10:00 PM'))
        const same = ci.slice(-2) === ce.slice(-2)
        base.v2 = `Check-in ${same ? ci.slice(0, -3) : ci}–${ce} · checkout ${short(b('checkout'))}`
        break
      }
      case 'custom': {
        const fs = [...startFacts(pid), ...facts('custom')]
        base.count = fs.length
        caption = 'Only your AI replies use these'
        if (!scenario && !fs.length) { base.v1 = 'No custom facts yet'; base.v2 = 'Add what guests ask about that no listing field holds'; break }
        base.v1 = fs.length > 1 ? `${fs[0].label}, ${fs[1].label.toLowerCase()}` : fs[0]?.label
        const learned = fs.filter((f) => /messages/i.test(f.source)).length
        base.v2 = learned ? `${learned} learned from guest messages` : 'Added by you'
        break
      }
    }
    if (!caption) {
      const withOwn = chs.filter((c) => own[c].length)
      caption = !withOwn.length ? (chs.length > 1 || scenario ? 'Same on every channel' : `${NAME[chs[0]] ?? 'Your listing'} uses the Base`)
        : withOwn.length === 1 ? `${NAME[withOwn[0]]} has its own · ${own[withOwn[0]].length}` : `${withOwn.length} channels have their own`
    }
    return { ...base, caption }
  })
}
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`

/* ---------- Ask the AI (canned, but read from the Hub as each channel's guest sees it) ---------- */
export interface UsedFact { cat: CatId; label: string; value: string; scope: string }
export interface Answer { text: string; facts: UsedFact[]; differs?: { c: ListingChannel; text: string }; gap?: boolean; edit?: CatId }
export function answer(q: string, c: ListingChannel, d: HubDraft, facts: KhFact[], pid = hubPid()): Answer {
  if (!isScenarioProperty(pid)) return genericAnswerFor(q, c, d, facts, pid)
  const ALL = propertyChannels(pid)
  const items = hubItems(pid)
  const it = (k: string) => items.find((i) => i.key === k)!
  const on = (k: string, ch = c) => { const i = it(k); const v = valueOn(i, d, ch); return { v: display(i, v.value), own: v.own, i } }
  const used = (cat: CatId, k: string): UsedFact => { const x = on(k); return { cat, label: x.i.label, value: x.v, scope: x.own ? `${NAME[c]}’s own` : 'Base' } }
  const t = q.toLowerCase()
  if (/park|\bcar\b|garage/.test(t)) {
    const f = facts.find((x) => factCat(x) === 'location' && /park/i.test(`${x.label} ${x.value}`))
    if (f) return { text: f.value, facts: [{ cat: 'location', label: f.label, value: f.value, scope: 'Every channel' }], edit: 'location' }
    return { text: 'Street parking is free after 20:00. The Hub says nothing more about parking, so your AI would check with you before it answers.', facts: [used('location', 'getting_around')], gap: true, edit: 'location' }
  }
  if (/night|stay|book/.test(t)) {
    const n = Number(/(\d+)/.exec(t)?.[1] ?? 2)
    const min = on('avail:min_stay'); const max = on('avail:max_stay'); const adv = on('avail:advance')
    const m = Number(nights(min.v))
    const tail = `Stays of up to ${max.v} are fine${adv.v === 'None' ? ', and same-day bookings are open' : `, booked at least ${adv.v.toLowerCase()} ahead`}.`
    const text = n >= m ? `Yes, ${n} nights works: the minimum stay is ${min.v}. ${tail}` : `The minimum stay is ${min.v}, so ${n} nights won’t go through. ${tail}`
    const other = ALL.filter((x) => x !== c).find((x) => on('avail:min_stay', x).v !== min.v)
    return {
      text, facts: [used('availability', 'avail:min_stay'), used('availability', 'avail:max_stay')], edit: 'availability',
      differs: other ? { c: other, text: `guests get a different answer: ${on('avail:min_stay', other).v}` } : undefined,
    }
  }
  if (/wi-?fi|internet|password/.test(t)) {
    return { text: `The Wi-Fi is “${on('wifi_name').v}” and the password is “${on('wifi_password').v}”. It’s 250 Mbps fibre, fine for video calls.`, facts: [used('arrival', 'wifi_name'), used('arrival', 'wifi_password')], edit: 'arrival' }
  }
  if (/\bpets?\b|dog|cat\b/.test(t)) {
    const p = on('pets'); const other = ALL.filter((x) => x !== c).find((x) => on('pets', x).v !== p.v)
    return {
      text: p.v === 'Allowed' ? 'Yes, pets are welcome. There’s a €20 pet fee per stay.' : 'Sorry, pets aren’t allowed. Assistance animals are always welcome.',
      facts: [used('rules', 'pets')], edit: 'rules', differs: other ? { c: other, text: `guests get a different answer: pets ${on('pets', other).v.toLowerCase()}` } : undefined,
    }
  }
  if (/check.?in|arriv|what time/.test(t)) {
    const ci = on('checkin'); const ce = on('checkin_end'); const m = on('method')
    return { text: `Check-in is from ${ci.v} to ${ce.v}.${m.v === 'Keypad' ? ' It’s a keypad, and the code arrives 24 hours before you do.' : ''}`, facts: [used('rules', 'checkin'), used('rules', 'checkin_end'), used('arrival', 'method')], edit: 'rules' }
  }
  const f = facts.find((x) => t.split(/\W+/).filter((w) => w.length > 3).some((w) => `${x.label} ${x.value}`.toLowerCase().includes(w)))
  if (f) return { text: f.value, facts: [{ cat: factCat(f) ?? 'custom', label: f.label, value: f.value, scope: 'Every channel' }], edit: factCat(f) ?? 'custom' }
  return { text: 'The Hub doesn’t answer this yet, so your AI would check with you before replying.', facts: [], gap: true }
}

/** Any property but the scenario: answers built from its own values (perProperty GENERIC_QUESTIONS / genericAnswer), with
 *  the facts used and, where a channel's guest would hear something else, that channel's answer. No scripted lines. */
function genericAnswerFor(q: string, c: ListingChannel, d: HubDraft, facts: KhFact[], pid: string): Answer {
  const chs = propertyChannels(pid)
  const items = hubItems(pid)
  const find = (k: string) => items.find((i) => i.key === k)
  const raw = (k: string, ch = c) => { const i = find(k); return i ? valueOn(i, d, ch).value : '' }
  const used = (k: string): UsedFact[] => {
    const i = find(k); if (!i) return []
    const v = valueOn(i, d, c)
    return [{ cat: i.section as CatId, label: i.label, value: display(i, v.value), scope: v.own ? `${NAME[c]}’s own` : 'Base' }]
  }
  const t = q.toLowerCase()
  const factHit = (re: RegExp) => facts.find((x) => re.test(`${x.label} ${x.value}`))
  const fromFact = (f: KhFact): Answer => ({ text: f.value, facts: [{ cat: factCat(f) ?? 'custom', label: f.label, value: f.value, scope: chs.length > 1 ? 'Every channel' : NAME[c] }], edit: factCat(f) ?? 'custom' })
  if (/park|\bcar\b|garage/.test(t)) {
    const f = factHit(/park/i)
    if (f) return fromFact(f)
    const clause = raw('getting_around').split(/[.;]\s*/).find((x) => /park/i.test(x))?.trim()
    const said = clause ? `${clause[0].toUpperCase()}${clause.slice(1)}. ` : ''
    return { text: `${said}The Hub says ${said ? 'nothing more' : 'nothing'} about parking, so your AI would check with you before it answers.`, facts: said ? used('getting_around') : [], gap: true, edit: 'location' }
  }
  const n = /(\d+)\s*nights?/.exec(t)
  if (n) {
    const val = (k: string, ch = c) => { const i = find(k); return i ? display(i, valueOn(i, d, ch).value) : '' }
    const min = val('avail:min_stay'); const max = val('avail:max_stay'); const adv = val('avail:advance')
    const want = Number(n[1]); const m = Number(nights(min))
    const tail = max ? ` Stays of up to ${max} are fine${!adv ? '' : adv === 'None' ? ', and same-day bookings are open' : `, booked at least ${adv.toLowerCase()} ahead`}.` : ''
    const text = want >= m ? `Yes, ${want} nights works: the minimum stay is ${min}.${tail}` : `The minimum stay is ${min}, so ${want} nights won’t go through.${tail}`
    const other = chs.filter((x) => x !== c).find((x) => val('avail:min_stay', x) !== min)
    return {
      text, facts: [...used('avail:min_stay'), ...used('avail:max_stay')], edit: 'availability',
      differs: other ? { c: other, text: `guests get a different answer: ${val('avail:min_stay', other)}` } : undefined,
    }
  }
  const g = matchGeneric(t)
  if (g) {
    const say = (ch: ListingChannel) => genericAnswer(g.id, (k) => raw(k, ch))
    const mine = say(c)
    const text = mine.map((x) => x.text).join(' ')
    const keys = [...new Set(mine.flatMap((x) => x.cites))]
    const other = chs.filter((x) => x !== c).map((x) => ({ x, text: say(x).map((y) => y.text).join(' ') })).find((o) => o.text !== text)
    return {
      text, facts: keys.flatMap(used), edit: (find(keys[0] ?? '')?.section as CatId | undefined),
      differs: other ? { c: other.x, text: `guests get a different answer: “${other.text}”` } : undefined,
    }
  }
  const f = facts.find((x) => t.split(/\W+/).filter((w) => w.length > 3).some((w) => `${x.label} ${x.value}`.toLowerCase().includes(w)))
  if (f) return fromFact(f)
  return { text: 'The Hub doesn’t answer this yet, so your AI would check with you before replying.', facts: [], gap: true }
}
