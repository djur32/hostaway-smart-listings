/* Per-property content for the channel screens (QA B01/B02; "each property has its own separate data, modelled
 * lightly", the same on mobile and desktop). .
 * Neukölln (the scenario property) keeps its scripted constants: data/sl3.ts (amenities, tips), data/v3-ch.ts
 * (CHANNEL_META, PRICES) and data/v3-cv.ts (the replica pages' reviews, scores, prices). Every other property gets plain
 * values derived from its portfolio row (data/portfolio.ts PORTFOLIO + DETAIL) and its light profile
 * (data/property-seeds.ts PROFILES): amenities on all its channels, channel overview meta, default prices, the
 * content of its Airbnb / Booking.com / Direct pages in Canvas, and its own generated
 * Smart Listings tips for every property that defaults to Smart Listings on.
 * Also registers both tips rules (data/sl3.ts setTipScope / setExtraTips): the scenario's scripted TIPS while it's
 * active, this file's own propertyTipsFor() for every other property, none for the three "off" ones
 * (data/portfolio.ts SMART_LISTINGS_OFF). */
import { AMENITIES, TIPS, setExtraTips, setTipScope, type ListingChannel, type TipDef } from './sl3'
import { currentUser } from './users'
import { AVAILABILITY, CHANNEL_META, PRICES, type AvailRow, type ChannelMeta, type PriceRow, type PriceTab } from './v3-ch'
import {
  AIRBNB_AMENITIES, AIRBNB_HIGHLIGHTS, AIRBNB_SCORES, BOOKING_FACILITIES, BOOKING_RULES, BOOKING_SCORES, PHOTO_TIP_ORDER, PRICE, REVIEWS, STAY,
  type CvArea, type CvLock, type PhotoKey,
} from './v3-cv'
import { detailOf, groupById, isScenarioProperty, propertyById, propertyChannels, smartListingsDefaultOn } from './portfolio'
import { a, appliedProperty, clip, listingSeed, profileOf, smartChannelsFor, type FieldSeed, type PropertyProfile } from './property-seeds'
import { PROPERTY_ID } from './scenario'
import type { Property } from './types'

/* The active property for data-level helpers: the one the shared listing definitions describe (the store keeps it in
 * step with activeProperty, before any screen renders). */
export const activePropertyId = () => appliedProperty() ?? PROPERTY_ID
setTipScope(() => isScenarioProperty(activePropertyId()))
setExtraTips(() => propertyTipsFor(activePropertyId()))

/* ---------- small helpers ---------- */
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** A stable number per property id (ids, review counts): FNV-1a. */
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
const memo = <T,>(fn: (pid: string) => T) => { const m = new Map<string, T>(); return (pid: string) => { if (!m.has(pid)) m.set(pid, fn(pid)); return m.get(pid)! } }
/** "Simon-Dach-Straße 1x" → "Simon-Dach-Straße"; "Warschauer Straße (U1, S-Bahn)" → "Warschauer Straße". */
const streetName = (s: string) => s.replace(/ \d.*$/, '')
const stationName = (s: string) => s.replace(/\s*\(.*\)$/, '')
/** Beds in the profile line ("1 double bed · 2 single beds · 1 cot" → 3; cots don't count). */
const bedCount = (f: PropertyProfile) => f.beds.split(' · ').filter((b) => !/cot/.test(b)).reduce((n, b) => n + (Number(b.match(/^(\d+)/)?.[1]) || 1), 0)
const bathCount = (f: PropertyProfile) => Number(f.baths.match(/^(\d+) bathrooms?/)?.[1]) || 1
const firstBed = (f: PropertyProfile) => f.beds.split(' · ')[0].replace(/\s*\(.*\)$/, '')
const noLift = (f: PropertyProfile) => !/lift/.test(f.floor) || /no lift/.test(f.floor)
/** An upper-floor flat without a lift (guests climb stairs). */
const climbs = (f: PropertyProfile) => f.type !== 'House' && noLift(f) && /floor/.test(f.floor) && !/ground/.test(f.floor)

/* ---------- tips: generated per property (Smart Listings should default to on, with real
 * suggestions, for every property except the last three in the switcher) ---------- */
/** "n of total" evidence numbers, varied per property/channel so tips don't all read as the same copy (-
 *  the scenario's own "17 of 24 similar homes" style lines, data/sl3.ts TIPS, aren't touched). */
function nOf(seed: number, lo: number, hi: number, totalLo: number, totalHi: number) {
  const n = lo + (seed % (hi - lo))
  const total = totalLo + ((seed >>> 4) % (totalHi - totalLo))
  return { n, total }
}
const CH_LABEL: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct' }
/** A photo tip's proposed order goes where Canvas and the photo model read it (data/v3-cv PHOTO_TIP_ORDER, keyed by
 *  tip id): the scenario's own photo tips (data/sl3.ts TIPS) at load, generated ones when they're first built. */
const registerPhotoOrders = (tips: TipDef[]) => { for (const t of tips) if (t.photos?.order && !PHOTO_TIP_ORDER[t.id]) PHOTO_TIP_ORDER[t.id] = t.photos.order as PhotoKey[] }
registerPhotoOrders(TIPS)

/** Hand-written photo tips ("how it would look when we have recommendations for the photos"), one per
 *  channel on a few properties. Each one only re-orders photos the property already has (data/property-seeds.ts
 *  PROFILES photos), starting from the order it imported on that channel (Airbnb follows the library; Booking.com
 *  leads with the second photo). Labels follow TipDef.photos: "bedroom #3" = moved to 3rd, otherwise the new cover.
 *  counts and guest questions. */
type PhotoTipSpec = { title: string; now: string; next: string; nowKey: PhotoKey; nextKey: PhotoKey; order: PhotoKey[]; why: TipDef['why'] }
const PHOTO_TIPS: Record<string, Partial<Record<ListingChannel, PhotoTipSpec>>> = {
  'kreuzberg-loft': {
    airbnb: { title: 'Open with the canal view', now: 'living room', next: 'balcony', nowKey: 'living2', nextKey: 'balcony',
      order: ['balcony', 'living2', 'bedroom', 'kitchen', 'bathroom', 'living1', 'building', 'street'],
      why: [{ text: 'Your summary sells the view over the Landwehr Canal, but the cover is the sofa: 9 of 16 similar canal-side homes open on the view.', source: 'strategy' }, { text: '3 Airbnb guests asked whether the balcony looks onto the canal.', source: 'inbox' }] },
    booking: { title: 'Lead with the loft, not the bed', now: 'bedroom', next: 'living room', nowKey: 'bedroom', nextKey: 'living2',
      order: ['living2', 'bedroom', 'kitchen', 'balcony', 'bathroom', 'living1', 'building', 'street'],
      why: [{ text: 'Booking.com shows three photos in search and yours open on the bed, which reads as a hotel room: 12 of 20 similar lofts lead with the living space.', source: 'strategy' }, { text: '2 Booking.com guests asked how big the loft really is.', source: 'inbox' }] },
  },
  'mitte-courtyard': {
    airbnb: { title: 'Put a bedroom second', now: 'bedroom #3', next: 'bedroom #2', nowKey: 'bedroom', nextKey: 'bedroom',
      order: ['building', 'bedroom', 'living1', 'kitchen', 'bathroom', 'extra2', 'street'],
      why: [{ text: '4 Airbnb inquiries asked how the beds are split between the two bedrooms.', source: 'inbox' }, { text: 'Families check where everyone sleeps first: 10 of 15 similar 2-bedroom homes show a bedroom by photo 2.', source: 'strategy' }] },
  },
  'prenzlauer-family': {
    airbnb: { title: 'Open on the kids’ corner, not the kitchen', now: 'kitchen', next: 'kids’ corner', nowKey: 'kitchen', nextKey: 'extra1',
      order: ['extra1', 'kitchen', 'living2', 'bedroom', 'bathroom', 'balcony', 'building'],
      why: [{ text: '5 of 14 Airbnb inquiries asked about the cot and the high chair.', source: 'inbox' }, { text: 'Families with small children are who this flat is for, but the kids’ corner is photo 6.', source: 'strategy' }] },
  },
  'wedding-garden': {
    booking: { title: 'Lead with the garden', now: 'bedroom', next: 'garden door', nowKey: 'bedroom', nextKey: 'extra2',
      order: ['extra2', 'bedroom', 'bathroom', 'kitchen', 'street'],
      why: [{ text: 'Your Booking.com name says “Private Garden”, but the first photo is the bed; Airbnb opens on the garden door.', source: 'strategy' }, { text: '3 Booking.com guests asked whether the garden is shared.', source: 'inbox' }] },
  },
  'tempelhof-park': {
    booking: { title: 'Open on the view over the Feld', now: 'living room', next: 'park view', nowKey: 'living1', nextKey: 'street',
      order: ['street', 'living1', 'bedroom', 'kitchen', 'balcony', 'bathroom'],
      why: [{ text: 'Your Booking.com name sells the park view, but it’s photo 2 there; your Airbnb cover is the view.', source: 'strategy' }, { text: '2 Booking.com guests asked which rooms face the park.', source: 'inbox' }] },
  },
  'charlottenburg-classic': {
    booking: { title: 'Lead with the stucco ceiling', now: 'living room', next: 'stucco ceiling', nowKey: 'living1', nextKey: 'extra1',
      order: ['extra1', 'living1', 'bedroom', 'kitchen', 'bathroom', 'building', 'street'],
      why: [{ text: 'Your name says Altbau; the stucco ceiling is the proof, and it’s photo 2.', source: 'strategy' }, { text: '8 of 13 similar Altbau flats nearby open on a ceiling or a period detail.', source: 'strategy' }] },
  },
  'moabit-studio': {
    airbnb: { title: 'Lead with the desk for business trips', now: 'bedroom', next: 'desk', nowKey: 'bedroom', nextKey: 'desk',
      order: ['desk', 'bedroom', 'kitchen', 'bathroom', 'street'],
      why: [{ text: 'Business travellers look for a workspace first; your cover is the bed and the desk is photo 2.', source: 'strategy' }, { text: '3 Airbnb inquiries asked whether the desk is big enough to work at all day.', source: 'inbox' }] },
  },
}

/** Tips for one connected channel, grounded in the property's own profile and imported listing text
 *  (data/property-seeds.ts listingSeed). Mirrors the scenario's own TIPS shapes (data/sl3.ts) at a lighter density:
 *  Airbnb, name, summary, (photos), check-in details, getting around, (an amenity), house rules; Booking.com -
 *  description, (photos), interaction, directions, (an amenity), house rules. Every tab gets some, and each keeps
 *  long-text fields without a tip. Several land on fields that use the Base (check-in details, getting around,
 *  interaction, Booking.com house rules). */
function tipsForChannel(p: Property, f: PropertyProfile, seed: Record<string, FieldSeed>, ch: ListingChannel): TipDef[] {
  const h = hash(p.id)
  const station = stationName(f.station)
  const single = propertyChannels(p.id).length === 1 // one channel: its per-channel fields use the Base (property-seeds applyPropertyData)
  const out: TipDef[] = []
  const photo = PHOTO_TIPS[p.id]?.[ch]
  if (photo) out.push({ id: `t-${p.id}-${ch[0]}-photos`, channel: ch, tab: 'essentials', field: 'photos', type: 'Photos', section: 'Essentials', title: photo.title,
    photos: { now: photo.now, next: photo.next, nowKey: photo.nowKey, nextKey: photo.nextKey, order: photo.order }, why: photo.why })
  // an amenity the property's list has on another channel but not this one (amenitiesFor's per-channel exceptions)
  const missing = amenitiesFor(p.id).flatMap((g) => g.items).find((i) => !i.on.includes(ch) && i.on.length > 0)
  const amenity = (): TipDef[] => {
    if (!missing) return []
    const shown = missing.name === 'Dedicated workspace' && ch === 'booking' ? 'Desk' : missing.name
    const asked = nOf(h >>> 9, 2, 6, 10, 20)
    return [{ id: `t-${p.id}-${ch[0]}-amenity`, channel: ch, tab: 'amenities', field: `amenity:${missing.name}`, type: 'Amenities', section: 'Amenities',
      title: `List the ${shown.toLowerCase()} on ${CH_LABEL[ch]}`, from: `Not listed on ${CH_LABEL[ch]}`, to: 'on',
      why: [
        { text: `It’s on your ${missing.on.map((c) => CH_LABEL[c]).join(' and ')} listing, so the place has one; ${CH_LABEL[ch]} guests who filter for it don’t see your home.`, source: 'strategy' },
        { text: `${asked.n} ${CH_LABEL[ch]} guests asked whether there’s ${a(shown)} ${shown.toLowerCase()}.`, source: 'inbox' },
      ] }]
  }
  // check-in and checkout times in the house rules (a field that uses the Base on Booking.com and on one-channel homes)
  const times = (): TipDef => {
    const asked = nOf(h >>> 11, 3, 9, 14, 28)
    return { id: `t-${p.id}-${ch[0]}-rules`, channel: ch, tab: 'rules', field: 'house_rules', type: 'House rules', section: 'Rules',
      title: 'Put check-in and checkout times in the rules', from: seed.house_rules.base,
      to: `${seed.house_rules.base} Check-in from ${seed.checkin.base}; checkout by ${f.checkout}.`,
      why: [
        { text: `${asked.n} of ${asked.total} ${CH_LABEL[ch]} threads asked for an early check-in or a late checkout.`, source: 'inbox' },
        { text: 'Guests read the house rules on the booking page; the times are only in your policies today.', source: 'strategy' },
      ] }
  }
  if (ch === 'airbnb') {
    const name = nOf(h, 4, 16, 18, 32)
    const sum = nOf(h >>> 2, 2, 9, 10, 20)
    const door = nOf(h >>> 6, 3, 8, 12, 26)
    const air = nOf(h >>> 8, 4, 10, 18, 30)
    const quiet = nOf(h >>> 10, 2, 5, 8, 16)
    const doorLine = /garden door/.test(f.floor) ? 'It has its own garden door, so you don’t need the building’s main entrance.'
      : `Your door: ${f.unit}${climbs(f) ? ', and there’s no lift, so pack light' : ''}.`
    out.unshift(
      { id: `t-${p.id}-a-name`, channel: 'airbnb', tab: 'essentials', field: 'name', type: 'Property name', section: 'Essentials',
        title: 'Name a landmark guests search for', from: p.name, to: clip(`${p.nickname} near ${station}`, 50), kb: true,
        why: [
          { text: `Guests search by area first: ${name.n} of ${name.total} similar ${p.area} homes name the neighbourhood or a landmark.`, source: 'strategy' },
          { text: `${cap(f.landmark)} is ${f.walk} minutes on foot.`, source: 'strategy' },
        ] },
      { id: `t-${p.id}-a-summary`, channel: 'airbnb', tab: 'essentials', field: 'summary', type: 'Summary', section: 'Essentials',
        title: 'Lead with what makes it yours', from: seed.summary.value?.airbnb ?? seed.summary.base,
        to: `${cap(f.feature)}, fast Wi-Fi and room for ${f.guests}: ${f.kind} in ${p.area}, ${f.walk} minutes from ${station}.`,
        why: [
          { text: 'Airbnb shows about the first 100 characters in search; yours spends them on where it is before what makes it good.', source: 'strategy' },
          { text: `${sum.n} of ${sum.total} similar homes nearby lead with the feature guests book for.`, source: 'strategy' },
        ] },
    )
    out.push(
      { id: `t-${p.id}-a-method`, channel: 'airbnb', tab: 'arrival', field: 'method_details', type: 'Check-in method details', section: 'Arrival',
        title: 'Say which door is theirs', from: seed.method_details.base, to: `${seed.method_details.base} ${doorLine}`, kb: true,
        why: [{ text: `${door.n} of ${door.total} Airbnb guests messaged on arrival day asking which door is theirs.`, source: 'inbox' }] },
      ...(f.city === 'Berlin' ? [{ id: `t-${p.id}-a-getting`, channel: 'airbnb' as const, tab: 'location' as const, field: 'getting_around', type: 'Getting around', section: 'Location',
        title: 'Add the trip from BER airport', from: seed.getting_around.base,
        to: `${seed.getting_around.base} From BER airport, about ${35 + (h % 4) * 5} minutes by train to ${station}.`, kb: true,
        why: [{ text: `${air.n} of ${air.total} Airbnb threads before arrival asked how to get here from the airport.`, source: 'inbox' as const }] }] : []),
      ...amenity(),
      single ? times() : { id: `t-${p.id}-a-rules`, channel: 'airbnb', tab: 'rules', field: 'house_rules', type: 'House rules', section: 'Rules',
        title: 'Say when quiet hours end', from: seed.house_rules.value?.airbnb ?? seed.house_rules.base,
        to: `Quiet hours 22:00–7:00 · no parties · no smoking · up to ${f.guests} guests.`,
        why: [
          { text: `${quiet.n} Airbnb guests asked about noise or coming back late in the last 90 days.`, source: 'inbox' },
          { text: 'Your Airbnb rules say “quiet after 22:00” but not when it ends; the Base says 7:00.', source: 'strategy' },
        ] },
    )
    return out
  }
  if (ch === 'booking') {
    const dir = nOf(h >>> 5, 3, 13, 20, 34)
    const late = nOf(h >>> 7, 4, 11, 18, 32)
    const code = f.method === 'Lockbox' ? 'lockbox code' : f.method === 'Smart Lock' ? 'smart-lock code' : 'keypad code'
    // no Booking.com description tip: Booking.com writes its own description from the facts (D-032 / D-086)
    if (f.method !== 'Host Greeting') out.push({ id: `t-${p.id}-b-interaction`, channel: 'booking', tab: 'arrival', field: 'interaction', type: 'Interaction preferences', section: 'Arrival',
      title: 'Tell late arrivals they don’t need to wait for you', from: seed.interaction.base,
      to: `Check-in is self-service, so arrive whenever suits you: your ${code} works at any hour from ${seed.checkin.base}. I reply to messages within an hour between 8:00 and 22:00.`,
      why: [{ text: `${late.n} of ${late.total} Booking.com threads asked whether someone has to be there for a late check-in.`, source: 'inbox' }] })
    out.push(
      { id: `t-${p.id}-b-directions`, channel: 'booking', tab: 'location', field: 'directions', type: 'Directions', section: 'Location',
        title: 'Add walking directions from the station', from: seed.directions.base, to: seed.directions.value?.booking ?? seed.directions.base, kb: true,
        why: [{ text: `${dir.n} of ${dir.total} Booking.com threads in the last 90 days asked how to find the place.`, source: 'inbox' }] },
      ...amenity(),
      times(),
    )
    return out
  }
  return out
}
/** Every tip a property has, across its Smart Listings channels (data/property-seeds.ts smartChannelsFor). The
 *  scenario property's own scripted TIPS (data/sl3.ts) are untouched; this only covers the other properties Smart
 *  Listings defaults to on for (data/portfolio.ts smartListingsDefaultOn), none for the three "off" ones. . */
export const propertyTipsFor = memo((pid: string): TipDef[] => {
  const p = propertyById(pid)
  const f = profileOf(pid)
  if (isScenarioProperty(pid) || !p || !f || !smartListingsDefaultOn(pid)) return []
  const seed = listingSeed(p, f)
  const tips = smartChannelsFor(pid).flatMap((ch) => tipsForChannel(p, f, seed, ch))
  registerPhotoOrders(tips)
  return tips
})

/* ---------- amenities: one list, on every channel the property has ---------- */
export type AmenityGroups = typeof AMENITIES
/** The editor's amenity list for a property. Neukölln: data/sl3 AMENITIES (with its per-channel differences). Others: a
 *  plain list from the profile, each amenity on all the property's channels. */
export const amenitiesFor = memo((pid: string): AmenityGroups => {
  const f = profileOf(pid)
  if (isScenarioProperty(pid) || !f) return AMENITIES
  const on = propertyChannels(pid)
  const items = (...xs: Array<string | false>) => xs.filter((x): x is string => !!x).map((name) => ({ name, on: [...on], note: undefined as string | undefined }))
  const groups = [
    { group: 'Internet and office', items: items('Wi-Fi', (f.photos.includes('desk') || /desk/.test(f.feature)) && 'Dedicated workspace') },
    { group: 'Kitchen and dining', items: items('Kitchen', f.size >= 50 && 'Dishwasher', 'Coffee maker', 'Electric kettle') },
    { group: 'Bedroom and laundry', items: items('Washer', 'Essentials', 'Hangers', 'Iron', /cot/.test(f.beds) && 'Crib') },
    { group: 'Bathroom', items: items('Hair dryer', 'Shampoo', /walk-in/.test(f.baths) && 'Walk-in shower', /bathtub/.test(f.baths) && 'Bathtub') },
    { group: 'Heating and cooling', items: items('Heating') },
    { group: 'Parking and facilities', items: items(f.method !== 'Host Greeting' && 'Self check-in', !noLift(f) && 'Elevator', f.photos.includes('balcony') && 'Balcony', /garden/.test(f.feature) && 'Garden') },
  ].filter((g) => g.items.length > 0)
  // 1–2 plausible per-channel exceptions on a multi-channel property (mirrors Neukölln's own real ones), so "Not on X"
  // has something to show on Listing details · Amenities. Deterministic per property, so a reload doesn't reshuffle it.
  if (on.length > 1) {
    const off = (name: string, ch: ListingChannel, note?: string) => {
      for (const g of groups) for (const i of g.items) if (i.name === name && i.on.includes(ch)) { i.on = i.on.filter((c) => c !== ch); if (note) i.note = note }
    }
    if (on.includes('booking')) off('Dedicated workspace', 'booking', 'Booking.com calls it “Desk”')
    if (on.includes('airbnb') && hash(pid) % 2 === 0) off('Electric kettle', 'airbnb')
  }
  return groups
})
/** Is this amenity on this channel, before any edit? */
export const amenityDefaultOn = (pid: string, ch: ListingChannel, name: string) =>
  !!amenitiesFor(pid).flatMap((g) => g.items).find((i) => i.name === name)?.on.includes(ch)

/* ---------- channel-only amenities: each channel's own catalogue ----------
 * (round 4): "you could also have 'add amenities' but add only Airbnb-specific amenities, which are not
 * exactly the same as the ones for booking or Hostaway (base)… add only the ones that are specific to Airbnb here",
 * and "come up with a few for each channel".
 * The Base list (the Knowledge Hub's one list, AMENITIES / amenitiesFor above, and the shared catalogue every channel
 * can satisfy, data/details.ts AMENITY_CATALOG) already covers everything the channels have in common. What is left per
 * channel is the vocabulary only that channel has a field for, so that, and only that, is what a channel's "Add
 * amenities" offers. Deliberately disjoint from AMENITY_CATALOG: a name in there is shared, so it belongs to the Base.
 * Vocabulary is each channel's real wording (Airbnb's amenity list, Booking.com's facility list); which ones this
 * property has is like every other sample value in this prototype.
 * Some amenities are not a one-tap yes: the channel wants structured sub-attributes (Airbnb's parking type and parking
 * access; Booking.com's shuttle charge and arrangement). Those open a small form of grouped single choices. An option
 * carries the channel's mark when the wording is that channel's own enum, and reads "All channels" when it is the
 * generic fallback every channel understands ("Unknown Parking Type"). */
export interface ChOptionGroup { legend: string; options: Array<{ value: string; own?: boolean }> }
export interface ChOnlyAmenity {
  name: string
  /** Which group of the property's amenity list it joins once added. */
  group: string
  /** Grouped single choices the channel asks for before it will take the amenity. */
  options?: ChOptionGroup[]
  /** Its line icon on the channel's guest page (Canvas) and in the Knowledge Hub, from the Tabler sprite we ship. */
  icon?: string
}
const CHANNEL_ONLY: Record<ListingChannel, ChOnlyAmenity[]> = {
  // Airbnb's own wording, guest-experience framing. "Paid parking off premises" carries Airbnb's parking enums.
  airbnb: [
    { name: 'Paid parking off premises', group: 'Parking and facilities', icon: 'map-pin', options: [
      { legend: 'Parking type', options: [{ value: 'Parking Garage', own: true }, { value: 'Street Parking', own: true }, { value: 'Valet Parking', own: true }, { value: 'Unknown Parking Type' }] },
      { legend: 'Parking access', options: [{ value: 'Only Guests', own: true }, { value: 'Shared With Others', own: true }, { value: 'Unknown Parking Access' }] },
    ] },
    { name: 'Record player', group: 'Entertainment', icon: 'player-play' },
    { name: 'Drying rack for clothing', group: 'Bedroom and laundry', icon: 'home' },
    { name: 'Baking sheet', group: 'Kitchen and dining', icon: 'tools-kitchen-2' },
    { name: 'Window guards', group: 'Home safety', icon: 'shield-check' },
  ],
  // Booking.com's facility language, hotel-shaped, and it wants the detail with it.
  booking: [
    { name: 'Airport shuttle', group: 'Services', icon: 'world', options: [
      { legend: 'Shuttle charge', options: [{ value: 'Free of charge', own: true }, { value: 'Additional charge', own: true }, { value: 'Not specified' }] },
      { legend: 'Arrangement', options: [{ value: 'Must be arranged in advance', own: true }, { value: 'Available on request', own: true }, { value: 'No arrangement needed' }] },
    ] },
    { name: 'Soundproof rooms', group: 'Bedroom and laundry', icon: 'bed' },
    { name: 'Designated smoking area', group: 'Parking and facilities', icon: 'map-pin' },
    { name: 'Wake-up service', group: 'Services', icon: 'clock' },
    { name: 'Invoice provided', group: 'Services', icon: 'file-text' },
  ],
  // Direct bookings is the host's own site: there is no external catalogue to satisfy, so it gets the fewest, and what
  // it gets is what a host might choose to advertise there. Its sub-options carry no channel mark for the same reason -
  // the wording is the host's, not a channel enum to match.
  direct: [
    { name: 'Welcome basket', group: 'Services', icon: 'heart-handshake', options: [
      { legend: 'What the basket includes', options: [{ value: 'Local coffee and milk' }, { value: 'Bakery breakfast box' }, { value: 'Bottle of Berlin wine' }] },
    ] },
    { name: 'Digital guidebook', group: 'Services', icon: 'book' },
    { name: 'Bike loan for your stay', group: 'Parking and facilities', icon: 'map-pin' },
  ],
}
/** This channel's own extras, minus anything already on this property's Base list (nothing is offered twice). */
export const channelOnlyAmenities = (pid: string, c: ListingChannel): ChOnlyAmenity[] => {
  const base = new Set(amenitiesFor(pid).flatMap((g) => g.items.map((i) => i.name)))
  return (CHANNEL_ONLY[c] ?? []).filter((a) => !base.has(a.name))
}
export const channelOnlyAmenity = (pid: string, c: ListingChannel, name: string) =>
  channelOnlyAmenities(pid, c).find((a) => a.name === name)
/** Where a chosen sub-option lives, per channel. The `@` keeps it out of the receipts diff, like every other
 *  non-field key (screens/push/changes.ts diffReceipts skips keys with `@`); `amenity:<name>` itself stays 'on'/'off'. */
export const chOptionKey = (name: string, legend: string) => `amenity:${name}@opt:${legend}`

/** A channel-only amenity the host has added on one channel (`amenity:<name>` = 'on' in that channel's custom store),
 *  with the sub-options it carries. `picks` are what the channel's guest page prints: a group's generic fallback
 *  ("Unknown Parking Type", "Not specified") is dropped when the group also has the channel's own wording, because the
 *  channel prints nothing for it. Read by the Canvas (screens/canvas, the replica pages) and the Knowledge Hub (R). */
export interface AddedChAmenity extends ChOnlyAmenity { picks: string[] }
export function addedChannelAmenities(pid: string, c: ListingChannel, custom: Record<string, string | null | undefined> | undefined): AddedChAmenity[] {
  if (!custom) return []
  return channelOnlyAmenities(pid, c).filter((a) => custom[`amenity:${a.name}`] === 'on').map((a) => ({
    ...a,
    picks: (a.options ?? []).flatMap((g) => {
      const v = custom[chOptionKey(a.name, g.legend)]
      if (typeof v !== 'string' || !v) return []
      const generic = g.options.some((o) => o.own) && !g.options.find((o) => o.value === v)?.own
      return generic ? [] : [v]
    }),
  }))
}
/** How the channel's own guest page words an added amenity with its sub-options, each page's real pattern:
 *  Airbnb (and the host's own site) put the detail after an en dash ("Fast wifi – 245 Mbps"); Booking.com puts it in
 *  brackets after the facility ("Airport shuttle (free)"). No picks: just the name. */
export function chAmenityLine(c: ListingChannel, a: AddedChAmenity): string {
  if (!a.picks.length) return a.name
  const lower = a.picks.map((v) => v.toLowerCase())
  if (c === 'booking') return `${a.name} (${lower.join(', ')})`
  const detail = lower.join(', ')
  return `${a.name} – ${detail[0].toUpperCase()}${detail.slice(1)}`
}

/* ---------- reviews and scores (plain) ---------- */
export interface ReviewStats { rating: number; count: number; score: number; location: number }
export const reviewStats = memo((pid: string): ReviewStats => {
  if (isScenarioProperty(pid)) return { rating: 4.89, count: 27, score: 9.1, location: 9.6 }
  const d = detailOf(pid)
  const strength = d.health.airbnb?.strength ?? d.health.booking?.strength ?? 70
  const rating = Math.min(4.97, Math.round((4.6 + (strength - 50) / 120) * 100) / 100)
  const count = 6 + (hash(pid) % 44)
  const score = Math.min(9.7, Math.round((rating * 2 - 0.5) * 10) / 10)
  return { rating, count, score, location: Math.min(9.8, Math.round((score + 0.3) * 10) / 10) }
})

/* ---------- channel overview (data/v3-ch CHANNEL_META for Neukölln) ---------- */
const HOST = currentUser().name // the signed-in account manages every property it holds (D-160)
const daysAgo = (n: number | null | undefined) => (n == null ? '-' : n === 0 ? 'Today' : `${plural(n, 'day')} ago`)
export function channelMetaFor(pid: string, c: ListingChannel): ChannelMeta {
  if (isScenarioProperty(pid)) return CHANNEL_META[c]
  const p = propertyById(pid)
  const d = detailOf(pid)
  const st = reviewStats(pid)
  const synced = daysAgo(d.health[c]?.lastPushDays)
  if (c === 'airbnb') return {
    connection: 'Connected', account: HOST, synced, live: 'Listed', liveSub: 'Guests can search and book', kpis: null,
    owned: [['Rating', `${st.rating.toFixed(2)} · ${plural(st.count, 'review')}`]], only: CHANNEL_META.airbnb.only,
  }
  if (c === 'booking') return {
    connection: 'Connected', account: `Property ID ${10000000 + (hash(`${pid}:booking`) % 89999999)}`, synced, live: 'Open for bookings', liveSub: 'Bookable on Booking.com', kpis: null,
    owned: [['Review score', `${st.score.toFixed(1)} · ${plural(st.count, 'review')}`]], only: CHANNEL_META.booking.only,
  }
  return {
    connection: 'Your booking site', account: `${slug(p?.nickname ?? pid)}.hostaway.rentals`, synced: 'Instant', live: 'Live on your site', liveSub: 'Anyone with the link can book', kpis: null,
    owned: [], only: [],
  }
}

/* ---------- pricing defaults (data/v3-ch PRICES for Neukölln) ---------- */
/** A property's Pricing rows: its own nightly rate (DETAIL.base), the group's weekend uplift, markups and discounts, its
 *  cleaning fee (and a channel's own, where it differs), and its maximum occupancy. Same rows and states as PRICES. */
export const pricesFor = memo((pid: string): Record<PriceTab, PriceRow[]> => {
  const p = propertyById(pid)
  const f = profileOf(pid)
  if (isScenarioProperty(pid) || !p || !f) return PRICES
  const d = detailOf(pid)
  const g = groupById(d.groupId).pricing
  const fee = d.overrides.cleaningFee ?? p.cleaningFee
  const bkFee = d.channelFees?.booking
  const patch: Record<string, Partial<PriceRow>> = {
    nightly: { base: d.base },
    weekend: { base: Math.round(d.base * (1 + g.weekendPct / 100)) },
    // a channel with no markup simply uses the Base (0%); one with a markup is custom there
    markup: {
      state: { airbnb: g.markups.airbnb ? 'override' : 'inherit', booking: g.markups.booking ? 'override' : 'inherit', direct: 'inherit' },
      value: Object.fromEntries((['airbnb', 'booking'] as const).filter((c) => g.markups[c]).map((c) => [c, g.markups[c]!])),
    },
    max: { base: f.guests },
    cleaning: bkFee !== undefined && bkFee !== fee
      ? { base: fee, value: { booking: bkFee } }
      : { base: fee, value: undefined, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    weekly: { base: d.overrides.weeklyDiscount ?? g.weeklyDiscount },
    monthly: { base: d.overrides.monthlyDiscount ?? g.monthlyDiscount },
  }
  return Object.fromEntries(Object.entries(PRICES).map(([tab, rows]) => [tab, rows.map((r) => ({ ...r, ...patch[r.key] }))])) as Record<PriceTab, PriceRow[]>
})
/** The store slice a price reads (sl3 custom / base), structural to avoid a store import. */
interface PriceSlice { custom: Partial<Record<ListingChannel, Record<string, string | null>>>; base: Record<string, string> }
export interface PriceLine { night: number; weekend: number; cleaning: number; service: number }
/** What a guest pays on this channel's page: Neukölln's scripted PRICE; others from Pricing (your saved values over the
 *  property's defaults, with the channel's markup), so Canvas matches the Pricing screen. */
export function channelPrice(pid: string, ch: ListingChannel, s: PriceSlice): PriceLine {
  if (isScenarioProperty(pid)) return { ...PRICE[ch], weekend: 55 }
  const rows = pricesFor(pid)
  const num = (tab: PriceTab, key: string) => {
    const r = rows[tab].find((x) => x.key === key)
    if (!r || !r.state[ch]) return 0
    const cv = s.custom[ch]?.[`price:${key}`]
    if (typeof cv === 'string') return Number(cv) || 0
    const st = r.state[ch]
    const own = (st === 'override' || st === 'only') && cv !== null ? r.value?.[ch] : undefined
    return Number(own ?? s.base[`price:${key}`] ?? r.base) || 0
  }
  const markup = num('base', 'markup')
  const up = (x: number) => Math.round(x * (1 + markup / 100))
  const night = up(num('base', 'nightly')), weekend = up(num('base', 'weekend')), cleaning = num('fees', 'cleaning')
  const service = ch === 'airbnb' ? Math.round((night * STAY.nights + cleaning) * 0.14) : 0
  return { night, weekend, cleaning, service }
}
export const priceTotal = (l: PriceLine) => l.night * STAY.nights + l.cleaning + l.service

/* ---------- the replica pages (Canvas) ---------- */
type IconLine = [icon: string, title: string, line: string]
export interface CvContent {
  scenario: boolean
  area: string; city: string
  /** "Neukölln, Berlin"; just the city when the area is the city (Potsdam). */
  place: string
  url: Record<ListingChannel, string>
  stayGuests: number
  /** Airbnb rating ("4.89"), review count, Booking.com score and its location score. */
  rating: string; reviewCount: number; bkScore: number; bkLocation: number
  /** Airbnb's Guest favourite badge (homes rated 4.8 and up, rule). */
  favourite: boolean
  /* Airbnb */
  typeLine: string; facts: string
  sleep: { photo: PhotoKey; title: string; sub: string }
  highlights: IconLine[]
  amenities: Array<[icon: string, name: string, off?: boolean]>; amenityTotal: number
  scores: Array<[string, string, string]>
  reviews: Array<{ name: string; from: string; when: string; text: string }>
  /** Things to know › House rules (field values: check-in, checkout). */
  rules: (text: (k: string) => string) => string[]
  safety: string[]
  map: { park?: string; streets: [string, string]; area: string }
  /* Booking.com */
  bkType: string
  bkAddress: (text: (k: string) => string) => string
  bkLoved: { quote: string; initial: string; who: string }
  bkGenerated: (name: string) => [string, string, string]
  bkFacilities: Array<[icon: string, name: string]>
  bkHighlights: Array<[icon: string, text: string]>
  bkUnit: { name: string; beds: string; line: string }
  bkScores: Array<[string, number]>
  bkRules: Array<[icon: string, label: string, text: string]>
  /* Direct */
  brand: string; navFirst: string; aboutTitle: string
  directFacts: Array<[icon: string, text: string]>
  directRules: (text: (k: string) => string) => string
}

const SCENARIO_CONTENT: CvContent = {
  scenario: true, area: 'Neukölln', city: 'Berlin', place: 'Neukölln, Berlin',
  url: { airbnb: 'airbnb.com/rooms/9876543210', booking: 'booking.com/hotel/de/artist-apartment-neukolln.en-gb.html', direct: 'artist-apt-neukolln.hostaway.rentals' },
  stayGuests: STAY.guests,
  rating: '4.89', reviewCount: 27, bkScore: 9.1, bkLocation: 9.6, favourite: true,
  typeLine: 'Entire rental unit in Neukölln, Germany', facts: '2 guests · 1 bedroom · 1 bed · 1 bath',
  sleep: { photo: 'bedroom', title: 'Bedroom', sub: '1 double bed' },
  highlights: AIRBNB_HIGHLIGHTS, amenities: AIRBNB_AMENITIES, amenityTotal: 24, scores: AIRBNB_SCORES, reviews: REVIEWS,
  rules: () => ['Check-in after 3:00 PM', 'Checkout before 2:00 PM', '2 guests maximum'],
  safety: ['Carbon monoxide alarm', 'Smoke alarm', 'Must climb stairs'],
  map: { park: 'Tempelhofer Feld', streets: ['Weserstraße', 'Karl-Marx-Straße'], area: 'NEUKÖLLN' },
  bkType: 'Apartment',
  bkAddress: () => 'Weserstraße 1x, Neukölln, 12047 Berlin, Germany',
  bkLoved: { quote: 'The art on the walls, the quiet desk and the park five minutes away. Would stay again.', initial: 'L', who: 'Lena · Germany' },
  bkGenerated: (name) => [
    `${name} is situated in Berlin, 1.2 km from Hermannplatz and 2.4 km from Tempelhofer Feld, and features free WiFi throughout the property.`,
    'This apartment has 1 bedroom, a flat-screen TV, an equipped kitchen with a dishwasher, and 1 bathroom with a shower. Towels and bed linen are provided.',
    'Couples in particular like the location. They rated it 9.6 for a two-person trip.',
  ],
  bkFacilities: BOOKING_FACILITIES,
  bkHighlights: [['map-pin', 'Top location: Highly rated by recent guests (9.6)'], ['wifi', 'Free WiFi'], ['home-2', 'Balcony · City view']],
  bkUnit: { name: 'One-Bedroom Apartment', beds: '1 double bed', line: '48 m² · Balcony · Kitchen · Free WiFi' },
  bkScores: BOOKING_SCORES, bkRules: BOOKING_RULES,
  brand: 'Artist Apt. Neukölln', navFirst: 'The flat', aboutTitle: 'About the flat',
  directFacts: [['users', '2 guests'], ['bed', '1 bedroom · 1 double bed'], ['bath', '1 bath'], ['home', '48 m²']],
  directRules: () => 'Check-in 3:00 PM – 10:00 PM · Checkout 2:00 PM',
}

/** Airbnb's icon for an amenity name (Tabler set in ds/icons). */
const AMENITY_ICON: Record<string, string> = {
  'Wi-Fi': 'wifi', 'Dedicated workspace': 'briefcase', Kitchen: 'tools-kitchen-2', Dishwasher: 'tools-kitchen-2', 'Coffee maker': 'tools-kitchen-2',
  'Electric kettle': 'tools-kitchen-2', Washer: 'home', Iron: 'home', Crib: 'mood-kid', 'Hair dryer': 'bath', 'Walk-in shower': 'bath', Bathtub: 'bath',
  Heating: 'home-heart', 'Self check-in': 'lock', Elevator: 'building', Balcony: 'home-2', Garden: 'home-2',
}
const to24 = (t: string) => { const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i); if (!m) return t; let h = Number(m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return `${String(h).padStart(2, '0')}:${m[2]}` }
const pick = <T,>(xs: T[], seed: number) => xs[seed % xs.length]
const GUESTS = [['Sophie', 'Lyon, France'], ['Jonas', 'Munich, Germany'], ['Emma', 'Copenhagen, Denmark'], ['Daniel', 'Vienna, Austria'], ['Clara', 'Barcelona, Spain'], ['Noah', 'Amsterdam, Netherlands']] as const
const METHOD_LINE: Record<PropertyProfile['method'], string> = { Keypad: 'the keypad', Lockbox: 'the lockbox', 'Smart Lock': 'the smart lock', 'Host Greeting': '' }

function buildContent(p: Property, f: PropertyProfile): CvContent {
  const st = reviewStats(p.id)
  const h = hash(p.id)
  const beds = bedCount(f), baths = bathCount(f)
  const rooms = f.bedrooms === 0 ? 'Studio' : plural(f.bedrooms, 'bedroom')
  const kind = f.type === 'House' ? 'home' : f.type === 'Guest suite' ? 'guest suite' : f.type === 'Loft' ? 'loft' : 'rental unit'
  const names = amenitiesFor(p.id).flatMap((g) => g.items.map((i) => i.name))
  const has = (n: string) => names.includes(n)
  const station = stationName(f.station)
  const [g1, g2] = [pick([...GUESTS], h), pick([...GUESTS], h + 3)]
  const reviews = [
    { name: g1[0], from: g1[1], when: 'September 2026', text: `Clean, well equipped and ${f.walk} minutes on foot from ${station}. ${cap(f.feature)} made the stay.` },
    { name: g2[0], from: g2[1], when: 'August 2026', text: f.method === 'Host Greeting' ? 'A warm welcome at the door and quick replies to every message. Would stay again.' : `Easy check-in with ${METHOD_LINE[f.method]} and quick replies to every message. Would stay again.` },
  ]
  const sc = (d: number) => Math.max(4, Math.min(5, Math.round((st.rating + d) * 10) / 10)).toFixed(1)
  const bk = (d: number) => Math.max(7, Math.min(10, Math.round((st.score + d) * 10) / 10))
  const airbnbList: Array<[string, string, boolean?]> = [
    ...names.filter((n) => AMENITY_ICON[n]).slice(0, 8).map((n): [string, string] => [AMENITY_ICON[n], n === 'Wi-Fi' ? 'Wifi' : n]),
    ['alert-triangle', 'Smoke alarm'], ['alert-circle', 'Carbon monoxide alarm'],
  ]
  if (climbs(f) && airbnbList.length < 11) airbnbList.splice(Math.min(6, airbnbList.length), 0, ['building', 'Elevator', true])
  const special: [string, string] | null = has('Garden') ? ['home-2', 'Garden'] : has('Balcony') ? ['home-2', 'Balcony'] : has('Elevator') ? ['building', 'Lift'] : has('Crib') ? ['mood-kid', 'Family rooms'] : null
  const facilities: Array<[string, string]> = [['wifi', 'Free WiFi'], ['circle-check', 'Non-smoking rooms'], ['tools-kitchen-2', 'Kitchen'], ...(special ? [special] : []), ['home', 'Washing machine']]
  const bedroomWord = f.bedrooms === 0 ? 'Studio' : `${['', 'One', 'Two', 'Three', 'Four'][f.bedrooms] ?? f.bedrooms}-Bedroom`
  const bkKind = f.type === 'House' ? 'Holiday Home' : 'Apartment'
  return {
    scenario: false, area: p.area, city: f.city, place: p.area === f.city ? f.city : `${p.area}, ${f.city}`,
    url: {
      airbnb: `airbnb.com/rooms/${1000000000 + (h % 8999999999)}`,
      booking: `booking.com/hotel/de/${slug(p.name)}.en-gb.html`,
      direct: `${slug(p.nickname)}.hostaway.rentals`,
    },
    stayGuests: Math.min(2, f.guests),
    rating: st.rating.toFixed(2), reviewCount: st.count, bkScore: st.score, bkLocation: st.location, favourite: st.rating >= 4.8,
    typeLine: `Entire ${kind} in ${p.area}, Germany`,
    facts: `${plural(f.guests, 'guest')} · ${rooms} · ${plural(beds, 'bed')} · ${plural(baths, 'bath')}`,
    sleep: { photo: f.photos.includes('bedroom') ? 'bedroom' : f.photos[0], title: f.bedrooms === 0 ? 'Studio' : 'Bedroom 1', sub: firstBed(f) },
    highlights: [
      f.method === 'Host Greeting' ? ['heart-handshake', 'A personal welcome', 'Your host meets you at the door.'] : ['lock', 'Self check-in', `Check yourself in with ${METHOD_LINE[f.method]}.`],
      ['home-heart', f.hook, `${cap(f.feature)}.`],
      ['map-pin', 'Walkable area', `${station} is ${f.walk} minutes on foot.`],
    ],
    amenities: airbnbList, amenityTotal: names.length + 2,
    scores: [['Cleanliness', sc(0.05), 'sparkles'], ['Accuracy', sc(0.03), 'circle-check'], ['Check-in', sc(0.08), 'lock'], ['Communication', sc(0.1), 'message-circle'], ['Location', sc(0.06), 'map-pin'], ['Value', sc(-0.05), 'tag']],
    reviews,
    rules: (t) => [`Check-in after ${t('checkin')}`, `Checkout before ${t('checkout')}`, `${plural(f.guests, 'guest')} maximum`],
    safety: ['Carbon monoxide alarm', 'Smoke alarm', ...(climbs(f) ? ['Must climb stairs'] : [])],
    map: { streets: [streetName(f.street), station], area: p.area.toUpperCase() },
    bkType: bkKind,
    bkAddress: (t) => { const [street, ...rest] = t('address').split(', '); return [street, p.area === f.city ? '' : p.area, ...rest, 'Germany'].filter(Boolean).join(', ') },
    bkLoved: { quote: `${cap(f.feature)}, and ${station} ${f.walk} minutes away. Would stay again.`, initial: g1[0][0], who: `${g1[0]} · ${g1[1].split(', ').pop()}` },
    bkGenerated: (name) => [
      `${name} is situated in ${f.city}, ${f.walk} minutes on foot from ${station}, and features free WiFi throughout the property.`,
      `This ${bkKind.toLowerCase()} has ${f.bedrooms === 0 ? 'one room' : plural(f.bedrooms, 'bedroom')}, an equipped kitchen and ${f.baths.split(' · ')[0]}. Towels and bed linen are provided.`,
      `Guests like ${f.landmark} nearby.`,
    ],
    bkFacilities: facilities,
    bkHighlights: [['map-pin', `Top location: Highly rated by recent guests (${bk(0.3).toFixed(1)})`], ['wifi', 'Free WiFi'], ...(special ? [[special[0], special[1]] as [string, string]] : [])],
    bkUnit: { name: `${bedroomWord} ${bkKind}`, beds: firstBed(f), line: [`${f.size} m²`, special?.[1], 'Kitchen', 'Free WiFi'].filter(Boolean).join(' · ') },
    bkScores: [['Staff', bk(0.4)], ['Facilities', bk(-0.3)], ['Cleanliness', bk(0.2)], ['Comfort', bk(0)], ['Value for money', bk(-0.2)], ['Location', bk(0.3)], ['Free WiFi', bk(-0.4)]],
    bkRules: [
      ['clock', 'Check-in', `From ${p.checkIn} to 22:00`],
      ['clock', 'Check-out', `Until ${to24(f.checkout)}`],
      ['info-circle', 'Cancellation/ prepayment', 'Cancellation and prepayment policies vary according to accommodation type.'],
      ['mood-kid', 'Children and beds', f.children ? `Children of any age are welcome.${/cot/.test(f.beds) ? ' A cot is available on request.' : ''}` : 'Children are not allowed.'],
      ['user', 'No age restriction', 'There is no age requirement for check-in.'],
      ['paw', 'Pets', f.pets ? 'Pets are allowed on request.' : 'Pets are not allowed.'],
      ['alert-circle', 'Smoking', 'Smoking is not allowed.'],
      ['confetti', 'Parties', 'Parties/events are not allowed.'],
    ],
    brand: p.nickname, navFirst: 'The place', aboutTitle: 'About the place',
    directFacts: [['users', plural(f.guests, 'guest')], ['bed', f.bedrooms === 0 ? `Studio · ${firstBed(f)}` : `${rooms} · ${f.beds.split(' · ')[0].replace(/\s*\(.*\)$/, '')}`], ['bath', plural(baths, 'bath')], ['home', `${f.size} m²`]],
    directRules: (t) => `Check-in ${t('checkin')} – ${t('checkin_end') || '10:00 PM'} · Checkout ${t('checkout')}`,
  }
}
/** The replica pages' content for a property: Neukölln's scripted page, or a plain one built from the property's data. */
export const cvContentFor = memo((pid: string): CvContent => {
  const p = propertyById(pid)
  const f = profileOf(pid)
  return isScenarioProperty(pid) || !p || !f ? SCENARIO_CONTENT : buildContent(p, f)
})

/** A locked part's explanation on this property's page: Neukölln's scripted text; for the others the parts that quote
 *  facts or prices (type, rooms, price lines) say this property's values. */
export function cvLockFor(pid: string, ch: ListingChannel, a: CvArea, price: PriceLine): CvLock | undefined {
  const f = profileOf(pid)
  if (!a.lock || isScenarioProperty(pid) || !f) return a.lock
  const beds = bedCount(f), baths = bathCount(f)
  const rooms = f.bedrooms === 0 ? 'a studio' : plural(f.bedrooms, 'bedroom')
  const text: Record<string, string> = {
    type: `${cvContentFor(pid).typeLine.replace(/ in .*$/, '')}, ${plural(f.guests, 'guest')}, ${rooms}, ${plural(beds, 'bed')} and ${plural(baths, 'bath')} live in the Knowledge Hub and apply to every channel.`,
    sleep: `${f.bedrooms === 0 ? 'One room' : cap(rooms)} with ${f.beds.replace(/\s*\([^)]*\)/g, '')}. Change rooms and beds once; every channel gets them.`,
    price: ch === 'booking'
      ? `€${price.night} weeknights + €${price.cleaning} cleaning on Booking.com, from Pricing and the calendar.`
      : ch === 'direct' ? `€${price.night} weeknights · €${price.weekend} weekends on your site, no service fee.`
        : `€${price.night} weeknights · €${price.weekend} weekends, from Pricing and the calendar. You can't change it on the page.`,
    nightly: `€${price.night} × ${STAY.nights} weeknights. Weekend nights are €${price.weekend}. Change rates, discounts and minimum stays in Pricing.`,
    cleaning: `€${price.cleaning} per stay on ${ch === 'booking' ? 'Booking.com' : ch === 'direct' ? 'your site' : 'Airbnb'}.`,
  }
  return text[a.id] ? { ...a.lock, text: text[a.id] } : a.lock
}

/* ---------- availability defaults (data/v3-ch AVAILABILITY for Neukölln) ---------- */
/** A property's stay rules: the same rows, keys and options as AVAILABILITY, with base values from its profile (bigger
 *  homes ask for longer minimum stays and a turnover night; a greeted check-in needs a day's notice). One value for every
 *  channel: the per-channel differences (Airbnb's 2-night minimum, Direct's 1-day notice) are Neukölln's own history. */
export const availabilityFor = memo((pid: string): AvailRow[] => {
  const f = profileOf(pid)
  if (isScenarioProperty(pid) || !f) return AVAILABILITY
  const big = f.guests >= 6 || f.type === 'House'
  const base: Record<string, string> = {
    min_stay: big ? '3 nights' : f.size < 35 ? '1 night' : '2 nights',
    max_stay: big ? '14 nights' : '28 nights',
    advance: f.method === 'Host Greeting' ? '1 day' : 'None',
    prep: big ? '1 turnover night' : 'None',
    window: '12 months',
  }
  return AVAILABILITY.map((r) => ({
    ...r, base: base[r.key] ?? r.base, value: undefined,
    // states that were per channel only because of Neukölln's own values go back to the Base
    state: Object.fromEntries(Object.entries(r.state).map(([c, s]) => [c, s === 'override' ? 'inherit' : s])) as AvailRow['state'],
  }))
})
