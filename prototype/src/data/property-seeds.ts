/* Light per-property seeds (QA B01/B02; Antonio: "model them lightly"). SIMULATED.
 * Neukölln (PROPERTY_ID) stays the deep, scripted scenario: its data lives in data/sl3.ts, data/v3-ch.ts, data/v3-cv.ts
 * and data/v3-kh.ts, untouched. Every other property in PORTFOLIO gets a short, factual profile here, and from it:
 *   · the imported listing (each field's Base value, plus a channel's own value where the field is per channel),
 *   · a photo library (a subset of public/photos, cover = PROPERTY_PHOTO, its own order per channel).
 *
 * How it reaches the screens: the editor, Canvas, Knowledge Hub and Review & push read the imported listing from the
 * field definitions (FIELDS / EXTRA_FIELDS `base` and `value`) and the photo order from PHOTO_ORDER. `applyPropertyData(pid)`
 * points those definitions at the active property (the store calls it whenever `activeProperty` changes, before any
 * screen renders), so a property's imported text never shows up as a pending "edit". The host's own edits stay in the
 * store, per property (store.ts `byProperty`). Neukölln's originals are captured at load and restored for it. */
import { FIELDS, type FieldDef, type ListingChannel } from './sl3'
import { EXTRA_FIELDS } from './v3-ch'
import { PHOTO_CAPTION, PHOTO_ORDER, type PhotoKey } from './v3-cv'
import { khItem } from './v3-kh'
import { isScenarioProperty, propertyById, propertyChannels, PROPERTY_PHOTO } from './portfolio'
import { seedPhotoLib, type PhotoLib, type PhotoMeta, type RoomTag } from './photos'
import type { Property } from './types'

/* ---------- profiles (SIMULATED, concepts/SCENARIO.md: 12 Berlin/Potsdam homes) ---------- */
export interface PropertyProfile {
  type: 'Apartment' | 'Loft' | 'Studio' | 'House' | 'Guest suite'
  /** "1-bedroom loft", "studio": how the summary names the place. */
  kind: string
  bedrooms: number; beds: string; baths: string; guests: number; size: number
  /** Floor and access, e.g. "3rd floor with a lift". */
  floor: string
  station: string; walk: number
  /** What sets it apart, as a noun phrase ("a view over the Landwehr Canal"). */
  feature: string
  /** Booking.com name suffix (the name is per channel there). */
  hook: string
  /** Who the Airbnb text speaks to. */
  audience: string
  landmark: string
  street: string; zip: string; city: string; state: string; unit: string
  method: 'Keypad' | 'Lockbox' | 'Smart Lock' | 'Host Greeting'
  wifi: string; wifiPassword: string
  pets: boolean; children: boolean
  tags: string; languages: string
  checkout: string
  photos: PhotoKey[]
  /** Captions that differ from the generic ones (e.g. the street photo). */
  captions?: Partial<Record<PhotoKey, string>>
}

export const PROFILES: Record<string, PropertyProfile> = {
  'kreuzberg-loft': {
    type: 'Loft', kind: '1-bedroom loft', bedrooms: 1, beds: '1 queen bed (160 × 200) · 1 sofa bed', baths: '1 bathroom · rain shower', guests: 4, size: 72,
    floor: '3rd floor with a lift', station: 'Kottbusser Tor (U1, U8)', walk: 6, feature: 'a view over the Landwehr Canal', hook: 'Canal View & Lift',
    audience: 'couples and small groups', landmark: 'the Landwehr Canal and Maybachufer market', street: 'Paul-Lincke-Ufer 2x', zip: '10999', city: 'Berlin', state: 'Berlin', unit: '3rd floor, right',
    method: 'Lockbox', wifi: 'CanalLoft-5G', wifiPassword: 'ufer-2024', pets: false, children: true, tags: 'City · Canal · Loft', languages: 'English · German', checkout: '11:00 AM',
    photos: ['living2', 'bedroom', 'kitchen', 'balcony', 'bathroom', 'living1', 'building', 'street'], captions: { street: 'Paul-Lincke-Ufer' },
  },
  'friedrichshain-studio': {
    type: 'Studio', kind: 'studio', bedrooms: 0, beds: '1 double bed (140 × 200)', baths: '1 shower room', guests: 2, size: 30,
    floor: '2nd floor, no lift', station: 'Warschauer Straße (U1, S-Bahn)', walk: 5, feature: 'a proper desk and a compact kitchen', hook: 'Desk & Fast Wi-Fi',
    audience: 'solo travellers and remote workers', landmark: 'Simon-Dach-Straße’s bars and the East Side Gallery', street: 'Simon-Dach-Straße 1x', zip: '10245', city: 'Berlin', state: 'Berlin', unit: '2nd floor, left',
    method: 'Smart Lock', wifi: 'FhainStudio', wifiPassword: 'boxhagener-42', pets: false, children: false, tags: 'City · Workspace · Nightlife', languages: 'English · German', checkout: '11:00 AM',
    photos: ['desk', 'living1', 'kitchen', 'bathroom', 'street', 'building'], captions: { street: 'Simon-Dach-Straße' },
  },
  'mitte-courtyard': {
    type: 'Apartment', kind: '2-bedroom flat', bedrooms: 2, beds: '1 double bed · 2 single beds', baths: '1 bathroom · bathtub', guests: 4, size: 65,
    floor: 'ground floor, onto the courtyard', station: 'Rosenthaler Platz (U8)', walk: 4, feature: 'a quiet green courtyard', hook: 'Quiet Courtyard',
    audience: 'families and friends visiting Mitte', landmark: 'Hackescher Markt and the galleries on Auguststraße', street: 'Torstraße 1x', zip: '10119', city: 'Berlin', state: 'Berlin', unit: 'Garden house, ground floor',
    method: 'Keypad', wifi: 'Courtyard-Guest', wifiPassword: 'hinterhof-19', pets: false, children: true, tags: 'City · Courtyard · Family', languages: 'English · German · Swedish', checkout: '10:00 AM',
    photos: ['building', 'living1', 'bedroom', 'kitchen', 'bathroom', 'extra2', 'street'], captions: { street: 'Torstraße', extra2: 'Hallway' },
  },
  'prenzlauer-family': {
    type: 'Apartment', kind: '3-bedroom family flat', bedrooms: 3, beds: '1 double bed · 2 single beds · 1 cot', baths: '1 bathroom · bathtub · 1 guest WC', guests: 6, size: 95,
    floor: '2nd floor with a lift', station: 'Eberswalder Straße (U2)', walk: 5, feature: 'a cot, a high chair and a box of toys', hook: 'Cot & High Chair',
    audience: 'families with small children', landmark: 'Mauerpark and the playgrounds on Kollwitzplatz', street: 'Kastanienallee 1x', zip: '10435', city: 'Berlin', state: 'Berlin', unit: '2nd floor',
    method: 'Host Greeting', wifi: 'PBerg-Family', wifiPassword: 'mauerpark-7', pets: false, children: true, tags: 'Family · City · Parks', languages: 'English · German · Swedish', checkout: '10:00 AM',
    photos: ['kitchen', 'living2', 'bedroom', 'bathroom', 'balcony', 'extra1', 'building'], captions: { extra1: 'Kids’ corner' },
  },
  'wedding-garden': {
    type: 'Guest suite', kind: 'garden room', bedrooms: 1, beds: '1 double bed (160 × 200)', baths: '1 shower room', guests: 2, size: 28,
    floor: 'ground floor with its own garden door', station: 'Leopoldplatz (U6, U9)', walk: 6, feature: 'a small private garden', hook: 'Private Garden',
    audience: 'couples who like a quiet base', landmark: 'Volkspark Rehberge and the cafés on Malplaquetstraße', street: 'Malplaquetstraße 1x', zip: '13347', city: 'Berlin', state: 'Berlin', unit: 'Garden flat',
    method: 'Keypad', wifi: 'GardenRoom', wifiPassword: 'rehberge-11', pets: true, children: false, tags: 'Garden · Quiet · Couples', languages: 'English · German', checkout: '11:00 AM',
    photos: ['extra2', 'bedroom', 'bathroom', 'kitchen', 'street'], captions: { extra2: 'Garden door', street: 'Malplaquetstraße' },
  },
  'charlottenburg-classic': {
    type: 'Apartment', kind: '2-bedroom Altbau flat', bedrooms: 2, beds: '2 double beds', baths: '1 bathroom · bathtub', guests: 4, size: 85,
    floor: '1st floor, wide staircase', station: 'Savignyplatz (S-Bahn)', walk: 4, feature: 'high ceilings and original stucco', hook: 'Altbau near Ku’damm',
    audience: 'city-break couples', landmark: 'Savignyplatz and the Kurfürstendamm', street: 'Knesebeckstraße 1x', zip: '10623', city: 'Berlin', state: 'Berlin', unit: '1st floor',
    method: 'Lockbox', wifi: 'Classic-Guest', wifiPassword: 'savigny-88', pets: false, children: true, tags: 'Classic · City · Shopping', languages: 'English · German', checkout: '11:00 AM',
    photos: ['extra1', 'living1', 'bedroom', 'kitchen', 'bathroom', 'building', 'street'], captions: { extra1: 'Living room, stucco ceiling', street: 'Knesebeckstraße' },
  },
  'tempelhof-park': {
    type: 'Apartment', kind: '1-bedroom flat', bedrooms: 1, beds: '1 double bed · 1 sofa bed', baths: '1 bathroom · walk-in shower', guests: 3, size: 55,
    floor: '5th floor with a lift', station: 'Paradestraße (U6)', walk: 4, feature: 'a view over Tempelhofer Feld', hook: 'Park View & Lift',
    audience: 'runners, cyclists and couples', landmark: 'Tempelhofer Feld, the old airfield turned park', street: 'Manfred-von-Richthofen-Straße 1x', zip: '12101', city: 'Berlin', state: 'Berlin', unit: '5th floor',
    method: 'Smart Lock', wifi: 'ParkView', wifiPassword: 'airfield-48', pets: false, children: true, tags: 'Park · Views · Quiet', languages: 'English · German', checkout: '11:00 AM',
    photos: ['street', 'living1', 'bedroom', 'kitchen', 'balcony', 'bathroom'], captions: { street: 'View towards Tempelhofer Feld' },
  },
  'moabit-studio': {
    type: 'Studio', kind: 'renovated studio', bedrooms: 0, beds: '1 double bed (160 × 200)', baths: '1 shower room', guests: 2, size: 32,
    floor: '1st floor, no lift', station: 'Turmstraße (U9)', walk: 5, feature: 'a newly renovated kitchen and bathroom', hook: 'Just Renovated',
    audience: 'business travellers', landmark: 'the Spree riverside and Arminius market hall', street: 'Alt-Moabit 1x', zip: '10559', city: 'Berlin', state: 'Berlin', unit: '1st floor, right',
    method: 'Keypad', wifi: 'MoabitStudio', wifiPassword: 'spree-2026', pets: false, children: false, tags: 'City · Renovated · Business', languages: 'English · German', checkout: '11:00 AM',
    photos: ['bedroom', 'desk', 'kitchen', 'bathroom', 'street'], captions: { street: 'Alt-Moabit' },
  },
  'schoneberg-balcony': {
    type: 'Apartment', kind: '1-bedroom flat', bedrooms: 1, beds: '1 double bed', baths: '1 bathroom · walk-in shower', guests: 3, size: 58,
    floor: '3rd floor, no lift', station: 'Nollendorfplatz (U1–U4)', walk: 3, feature: 'a south-facing balcony', hook: 'Sunny Balcony',
    audience: 'couples and friends', landmark: 'the Winterfeldtplatz market and Akazienkiez', street: 'Goltzstraße 1x', zip: '10781', city: 'Berlin', state: 'Berlin', unit: '3rd floor, left',
    method: 'Lockbox', wifi: 'Balcony-Guest', wifiPassword: 'winterfeldt-3', pets: false, children: true, tags: 'Balcony · City · Markets', languages: 'English · German · Swedish', checkout: '11:00 AM',
    photos: ['balcony', 'living2', 'bedroom', 'kitchen', 'bathroom', 'building'],
  },
  'treptow-riverside': {
    type: 'Apartment', kind: '2-bedroom flat', bedrooms: 2, beds: '1 double bed · 2 single beds', baths: '1 bathroom · bathtub', guests: 4, size: 70,
    floor: '4th floor with a lift', station: 'Treptower Park (S-Bahn)', walk: 5, feature: 'a view over the Spree', hook: 'River View',
    audience: 'families and friends', landmark: 'Treptower Park and the boats on the Spree', street: 'Puschkinallee 1x', zip: '12435', city: 'Berlin', state: 'Berlin', unit: '4th floor',
    method: 'Keypad', wifi: 'Riverside', wifiPassword: 'spreeufer-5', pets: false, children: true, tags: 'River · Park · Family', languages: 'English · German', checkout: '10:00 AM',
    photos: ['bathroom', 'living1', 'bedroom', 'kitchen', 'balcony', 'street'], captions: { street: 'Puschkinallee' },
  },
  'potsdam-lake': {
    type: 'House', kind: '3-bedroom lake house', bedrooms: 3, beds: '2 double beds · 2 single beds · 1 sofa bed', baths: '2 bathrooms · 1 bathtub', guests: 7, size: 140,
    floor: 'two floors and a garden', station: 'Griebnitzsee (S7)', walk: 10, feature: 'a garden that runs down to the lake', hook: 'Lake Garden & BBQ',
    audience: 'families and groups', landmark: 'Griebnitzsee and Babelsberg Park', street: 'Stahnsdorfer Straße 1x', zip: '14482', city: 'Potsdam', state: 'Brandenburg', unit: 'Whole house',
    method: 'Lockbox', wifi: 'LakeHouse', wifiPassword: 'griebnitz-140', pets: true, children: true, tags: 'Lake · Family · Garden', languages: 'English · German · Swedish', checkout: '10:00 AM',
    photos: ['building', 'living1', 'living2', 'bedroom', 'kitchen', 'balcony', 'bathroom', 'extra1', 'street'], captions: { extra1: 'Living room, fireplace', street: 'The lake path' },
  },
}
export const profileOf = (pid: string): PropertyProfile | undefined => PROFILES[pid]

/** Properties whose Knowledge Hub has never been generated (Antonio, 1 Oct: "3 or 4 of the existing properties should
 *  have no knowledge base"). Their Hub opens on the real empty state and runs the creation process (refs kh-next/01–02). */
export const NO_KNOWLEDGE_BASE: readonly string[] = ['charlottenburg-classic', 'moabit-studio', 'treptow-riverside', 'potsdam-lake']

/** The real generation steps, in order (REAL·PRODUCT, concepts/knowledge-hub/refs/kh-next/01–02). */
export const KB_GENERATION_STEPS = [
  'Researching property details…', 'Scanning past conversations…', 'Inspecting house rules & policies…',
  'Compiling knowledge…', 'Aggregating knowledge items…', 'Finishing up…',
] as const

/* ---------- the imported listing per property ---------- */
const am = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
/** "a"/"an" for a kind string ("studio" → "a", "apartment" → "an"); exported for data/property-listing.ts's tips. */
export const a = (s: string) => (/^[aeiou]/i.test(s) && !/^1-/.test(s) ? 'an' : 'a')

export interface FieldSeed { base: string; value?: Partial<Record<ListingChannel, string>> }

/** Field key → the property's imported Base value and, for per-channel fields, the channel's own value. */
export function listingSeed(p: Property, f: PropertyProfile): Record<string, FieldSeed> {
  const typeLower = f.type === 'Guest suite' ? 'garden room' : f.type.toLowerCase()
  const sleeps = f.bedrooms === 0 ? `One room with ${f.beds.replace(/^1 /, 'a ')}` : `${f.bedrooms === 1 ? 'One bedroom' : `${cap(numWord(f.bedrooms))} bedrooms`} (${f.beds})`
  const summary = `${cap(a(f.kind))} ${f.kind} in ${p.area}, ${f.walk} minutes on foot from ${f.station}. ${cap(f.feature)}, fast Wi-Fi and room for ${f.guests} guests.`
  const space = `${f.size} m² on the ${f.floor}. ${sleeps}. ${cap(f.baths.replace(' · ', ' with '))}.`
  const site = `https://${slug(p.nickname)}.hospitable.rentals`
  const methodText: Record<PropertyProfile['method'], string> = {
    Keypad: 'Enter the code on the keypad by the front door; the same code opens the flat. You get it 24 hours before arrival.',
    Lockbox: 'The keys are in the lockbox next to the front door. You get the lockbox code 24 hours before arrival.',
    'Smart Lock': 'The door has a smart lock. Your personal code arrives 24 hours before check-in and works from check-in time.',
    'Host Greeting': 'I meet you at the door with the keys and show you around. Send me your arrival time a day ahead.',
  }
  return {
    photos: { base: `${f.photos.length} photos in the Knowledge Hub` },
    name: { base: p.name, value: { booking: clip(`${p.name} · ${f.hook}`, 50) } },
    summary: { base: summary, value: { airbnb: `Made for ${f.audience}: ${f.feature}, fast Wi-Fi and ${f.station} ${f.walk} minutes away.` } },
    description: { base: `${summary} ${space} ${cap(f.landmark)} ${f.walk <= 6 ? 'are close by' : 'are a short walk away'}.` },
    space: { base: space, value: { airbnb: `${space} The highlight: ${f.feature}.` } },
    other: { base: `${cap(f.floor)}. Quiet hours in the building are 22:00–7:00.` },
    type: { base: f.type },
    room: { base: 'Entire place' },
    tags: { base: f.tags },
    languages: { base: f.languages },
    method: { base: f.method },
    method_details: { base: methodText[f.method] },
    wifi_name: { base: f.wifi },
    wifi_password: { base: f.wifiPassword },
    manual: {
      base: `- Please take your shoes off inside.\n- Recycling: yellow bin for plastic, blue for paper.\n- Spare towels and bed linen are in the hallway cupboard.`,
      value: { airbnb: `- Please take your shoes off inside.\n- Wi-Fi: ${f.wifi} (password on the fridge).\n- Recycling: yellow bin for plastic, blue for paper.\n- Spare towels and bed linen are in the hallway cupboard.` },
    },
    access: { base: `The whole ${typeLower} is yours${/garden/.test(f.feature) ? ', garden included' : ''}. Storage rooms and the cellar are off limits.` },
    interaction: {
      base: 'Check-in is self-service. I reply to messages within an hour between 8:00 and 22:00.',
      value: { airbnb: 'Arrive whenever suits you after check-in time. I reply within an hour from 8:00 to 22:00 and I’m happy to share tips for the area.' },
    },
    checkout_tasks: { base: '', value: { airbnb: 'Gather used towels | Leave them in the bathroom\nThrow rubbish away | Bins are by the front door\nTurn things off | Heating down, lights off\nLock up | Pull the door until it clicks' } },
    guidebook: { base: `${site}/guidebook` },
    rental_agreement: { base: `${site}/rental-agreement` },
    upsell: { base: `${site}/extras` },
    address: { base: `${f.street}, ${f.zip} ${f.city}` },
    city: { base: f.city },
    neighbourhood: { base: `${p.area}: ${f.landmark} within easy reach, and everyday shops around the corner.`, value: { airbnb: `${p.area}, ${f.walk} minutes from ${f.station}.` } },
    getting_around: { base: `${f.station} is ${f.walk} minutes on foot. Bike share and buses nearby; street parking is paid during the day.` },
    directions: { base: `From ${f.station}, walk ${f.walk} minutes to ${f.street.replace(/ \d.*$/, '')}.`, value: { booking: `From ${f.station}, walk ${f.walk} minutes to ${f.street.replace(/ \d.*$/, '')}. The entrance is the door with the Hospitable keypad sign.` } },
    checkin: { base: am(p.checkIn) },
    checkout: { base: f.checkout },
    house_rules: {
      base: `No parties or events. Quiet hours 22:00–7:00. No smoking inside. Maximum ${f.guests} guests.`,
      value: { airbnb: `Quiet after 22:00 · no parties · no smoking · up to ${f.guests} guests.` },
    },
    children: { base: f.children ? 'Yes' : 'No' },
    infants: { base: f.children ? 'Yes' : 'No' },
    pets: { base: f.pets ? 'Yes' : 'No', value: { booking: f.pets ? 'Yes' : 'No' } },
    smoking: { base: 'No' },
    events: { base: 'No' },
    // EXTRA_FIELDS (data/v3-ch.ts)
    country: { base: 'Germany' },
    unit: { base: f.unit },
    state: { base: f.state },
    zip: { base: f.zip },
    pin: { base: `${f.street.replace(/ \d.*$/, '')}, ${p.area}` },
    checkin_end: { base: '10:00 PM' },
    // Knowledge Hub property facts (data/v3-kh.ts PROPERTY_FACTS)
    'kh.size': { base: `${f.size} m²` },
    'kh.bedrooms': { base: f.bedrooms === 0 ? `Studio · ${f.beds}` : `${f.bedrooms} bedroom${f.bedrooms > 1 ? 's' : ''} · ${f.beds}` },
    'kh.bathrooms': { base: f.baths },
  }
}
function numWord(n: number) { return ['zero', 'one', 'two', 'three', 'four', 'five'][n] ?? String(n) }
/** Clips to `n` chars with an ellipsis; exported for data/property-listing.ts's tips (e.g. a name suggestion). */
export function clip(s: string, n: number) { return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…' }

/* ---------- photos per property ---------- */
const TAG: Record<PhotoKey, RoomTag> = {
  living1: 'living', living2: 'living', bedroom: 'bedroom', desk: 'workspace', kitchen: 'kitchen', bathroom: 'bathroom',
  balcony: 'balcony', building: 'building', street: 'neighbourhood', extra1: 'living', extra2: 'other',
}
/** Captions for a property: the generic ones, with Neukölln-only wording replaced. */
function captionsFor(pid: string): Record<PhotoKey, string> {
  const f = PROFILES[pid]
  const p = propertyById(pid)
  return { ...ORIGINAL.captions, street: `${p?.area ?? 'The'} street`, extra1: 'Living room detail', ...(f?.captions ?? {}) }
}
/** Imported order per channel: Airbnb and Direct follow the library; Booking.com leads with the second photo. */
function photoOrderFor(pid: string): Record<ListingChannel, PhotoKey[]> {
  const ks = PROFILES[pid]?.photos ?? [PROPERTY_PHOTO[pid] ?? 'living1']
  const booking = ks.length > 1 ? [ks[1], ks[0], ...ks.slice(2)] : [...ks]
  return { airbnb: [...ks], booking, direct: [...ks] }
}
/** The property's photo library (store.photoLib). Booking.com hides the detail shots, as it does for Neukölln. */
export function seedPhotoLibFor(pid: string): PhotoLib {
  if (isScenarioProperty(pid) || !PROFILES[pid]) return seedPhotoLib()
  const ks = PROFILES[pid].photos
  const caps = captionsFor(pid)
  const meta: Record<string, PhotoMeta> = {}
  for (const k of ks) meta[k] = { description: caps[k], tag: TAG[k] }
  return { base: [...ks], meta, hidden: { airbnb: [], booking: ks.filter((k) => (k === 'extra1' || k === 'extra2') && k !== ks[0]), direct: [] }, order: {}, deleted: [], mirror: {} }
}

/** Channels a property's Smart Listings setup starts with (its connected channels, without Direct). */
export const smartChannelsFor = (pid: string): ListingChannel[] => propertyChannels(pid).filter((c) => c !== 'direct')

/* ---------- apply: point the shared listing definitions at the active property ---------- */
type DefLike = { key: string; base?: string; value?: Partial<Record<ListingChannel, string>>; state?: Partial<Record<ListingChannel, string>> }
const DEFS: DefLike[] = [...FIELDS, ...EXTRA_FIELDS] as FieldDef[]
const khFacts = (): DefLike[] => ['kh.size', 'kh.bedrooms', 'kh.bathrooms'].map((k) => khItem(k)).filter((x): x is NonNullable<typeof x> => !!x) as DefLike[]
/** Neukölln's data, captured before anything is patched. */
const ORIGINAL = {
  defs: new Map(DEFS.map((d) => [d.key, { base: d.base, value: d.value ? { ...d.value } : undefined, state: d.state ? { ...d.state } : undefined }])),
  kh: new Map(khFacts().map((d) => [d.key, { base: d.base, value: d.value ? { ...d.value } : undefined }])),
  order: { airbnb: [...PHOTO_ORDER.airbnb], booking: [...PHOTO_ORDER.booking], direct: [...PHOTO_ORDER.direct] } as Record<ListingChannel, PhotoKey[]>,
  captions: { ...PHOTO_CAPTION },
}
let appliedFor: string | null = null
/** The property whose imported listing the shared definitions currently describe. */
export const appliedProperty = () => appliedFor

/** Makes FIELDS / EXTRA_FIELDS / the Hub's property facts / PHOTO_ORDER / PHOTO_CAPTION describe `pid`'s imported listing.
 *  Idempotent; unknown ids and the scenario property get Neukölln's originals. */
export function applyPropertyData(pid: string) {
  if (appliedFor === pid) return
  appliedFor = pid
  const p = propertyById(pid)
  const prof = PROFILES[pid]
  const seed = p && prof && !isScenarioProperty(pid) ? listingSeed(p, prof) : null
  // one channel only (e.g. friedrichshain-studio, Airbnb): nothing to differ from, so only the Base is seeded and the
  // fields that are custom per channel elsewhere use the Base there ("Uses the Base", not "Custom for Airbnb")
  const single = !!seed && propertyChannels(pid).length === 1
  const patch = (d: DefLike, orig: { base?: string; value?: Partial<Record<ListingChannel, string>>; state?: Partial<Record<ListingChannel, string>> } | undefined) => {
    if (!orig) return
    if (orig.state) d.state = { ...orig.state }
    const s = seed?.[d.key]
    if (!s) { d.base = orig.base; d.value = orig.value ? { ...orig.value } : undefined; return }
    d.base = s.base
    // keep the same channels per-channel (the field's states don't change); missing variants fall back to the Base
    d.value = orig.value ? Object.fromEntries(Object.keys(orig.value).map((c) => [c, s.value?.[c as ListingChannel] ?? s.base])) : undefined
    if (single && orig.state && d.state) for (const [c, st] of Object.entries(orig.state)) {
      if (st !== 'override') continue
      d.state[c as ListingChannel] = 'inherit'
      if (d.value) delete d.value[c as ListingChannel]
    }
  }
  for (const d of DEFS) patch(d, ORIGINAL.defs.get(d.key))
  for (const d of khFacts()) patch(d, ORIGINAL.kh.get(d.key))
  // photos: the "photos" field's channel lines, the imported orders and captions
  const order = seed ? photoOrderFor(pid) : ORIGINAL.order
  for (const ch of ['airbnb', 'booking', 'direct'] as ListingChannel[]) PHOTO_ORDER[ch].splice(0, PHOTO_ORDER[ch].length, ...order[ch])
  Object.assign(PHOTO_CAPTION, seed ? captionsFor(pid) : ORIGINAL.captions)
  if (seed) {
    const photos = DEFS.find((d) => d.key === 'photos')
    const caps = captionsFor(pid)
    const lib = seedPhotoLibFor(pid)
    if (photos?.value) for (const ch of Object.keys(photos.value) as ListingChannel[]) {
      const shown = order[ch].filter((k) => !lib.hidden[ch].includes(k))
      photos.value[ch] = `${shown.length} photos · cover: ${caps[shown[0]]}`
    }
  }
}
