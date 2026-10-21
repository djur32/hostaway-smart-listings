/* Listing details (Property › Shared › Listing details): the property's source of truth, edited as the Base every channel
 * inherits. Field order, labels and copy: Hospitable's real Details editor (REAL·PRODUCT, concepts/smart-listing/refs/
 * listing-details/01–11). Amenity catalog: Airbnb's public amenity list, grouped in Hospitable's 14 categories (REAL·PUBLIC
 * airbnb.com/help/article/1307 for the names; per-channel support is an ASSUMPTION modelled on research/market/
 * channel-constraints.md). Parking details: Hospitable's "Update Free parking on premise" (REAL·PRODUCT refs 09–11).
 * The fields themselves are the shared definitions (data/sl3.ts FIELDS + data/v3-ch.ts TAB_FIELDS), patched per property by
 * data/property-seeds.ts; the property's amenity list is data/property-listing.ts amenitiesFor(pid). */
import { LISTING_TABS, type ListingChannel, type ListingTab } from './sl3'

export const DETAILS_TABS = LISTING_TABS

/** Each tab's description, the real product's copy. */
export const DETAILS_DESC: Record<ListingTab, string> = {
  essentials: 'Add the essential details guests see when booking.',
  arrival: 'Add key details guests need for check-in, their stay, and checkout.',
  location: 'Add your property’s location and neighborhood details.',
  amenities: 'Select the amenities available to guests during their stay.',
  rules: 'Set the house rules guests must follow.',
}

/** Labels and help that differ from the channel editor's (the real Details screen's wording). Keys are FIELDS keys. */
export const DETAILS_LABEL: Record<string, { label?: string; help?: string }> = {
  space: { label: 'Spaces / Good to know', help: 'What should guests know about your space?' },
  type: { help: undefined },
  room: { help: undefined },
  city: { label: 'City / town', help: undefined },
  zip: { label: 'ZIP', help: undefined },
  checkin: { label: 'Check-in time starts (CEST)', help: undefined },
  checkin_end: { label: 'Check-in time ends (CEST)', help: undefined },
  checkout: { label: 'Checkout time (CEST)', help: undefined },
  house_rules: { help: 'Add any extra rules or restrictions.' },
}

/* ---------- channel names on this screen ---------- */
/** The names the real Filters dialog uses ("Direct bookings", ref 08). */
export const DETAILS_CH_NAME: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct bookings' }
/** "Booking.com", "Airbnb or Direct bookings", "Airbnb, Booking.com or Direct bookings". */
export const orList = (chs: ListingChannel[]) => {
  const n = chs.map((c) => DETAILS_CH_NAME[c])
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} or ${n[n.length - 1]}`
}

/* ---------- amenities ---------- */
/** Hospitable's amenity categories, in the Filters dialog's order (REAL·PRODUCT ref 08). */
export const AMENITY_CATEGORIES = [
  'Bathroom', 'Bedroom and laundry', 'Entertainment', 'Family', 'Heating and cooling', 'Home safety', 'Internet and office',
  'Kitchen and dining', 'Location features', 'Luxury amenities', 'Outdoor', 'Parking and facilities', 'Property views', 'Services',
] as const
export type AmenityCategory = typeof AMENITY_CATEGORIES[number]

/** An amenity guests can be offered. `on`: the channels that have a field for it (default: every channel). */
export interface CatalogAmenity { name: string; on?: ListingChannel[]; desc?: string; details?: DetailKind }
const NO_BOOKING: ListingChannel[] = ['airbnb', 'direct']
const NO_AIRBNB: ListingChannel[] = ['booking', 'direct']
export const AMENITY_CATALOG: Record<AmenityCategory, CatalogAmenity[]> = {
  'Bathroom': [
    { name: 'Bathtub' }, { name: 'Cleaning products' }, { name: 'Hair dryer' }, { name: 'Hot water' }, { name: 'Shampoo' }, { name: 'Bidet' },
    { name: 'Body soap' }, { name: 'Conditioner' }, { name: 'Shower gel' }, { name: 'Walk-in shower', on: NO_AIRBNB },
  ],
  'Bedroom and laundry': [
    { name: 'Essentials', desc: 'Towels, bed sheets, soap, toilet paper, and pillows' }, { name: 'Hangers' }, { name: 'Iron' },
    { name: 'Washer', details: 'laundry' }, { name: 'Dryer', details: 'laundry' }, { name: 'Safe' }, { name: 'Bed linens' },
    { name: 'Extra pillows and blankets' }, { name: 'Room-darkening shades', on: NO_BOOKING }, { name: 'Clothes storage' },
  ],
  'Entertainment': [{ name: 'TV' }, { name: 'Sound system' }, { name: 'Books and reading material' }, { name: 'Board games', on: NO_BOOKING }, { name: 'Game console' }, { name: 'Exercise equipment' }],
  'Family': [{ name: 'Crib' }, { name: 'High chair' }, { name: 'Children’s books and toys', on: NO_BOOKING }, { name: 'Baby bath', on: NO_BOOKING }, { name: 'Baby safety gates' }, { name: 'Changing table', on: NO_BOOKING }],
  'Heating and cooling': [{ name: 'Heating' }, { name: 'Air conditioning' }, { name: 'Ceiling fan' }, { name: 'Portable fans' }, { name: 'Indoor fireplace' }],
  'Home safety': [{ name: 'Smoke alarm' }, { name: 'Carbon monoxide alarm' }, { name: 'Fire extinguisher' }, { name: 'First aid kit' }],
  'Internet and office': [{ name: 'Wi-Fi' }, { name: 'Dedicated workspace', on: NO_BOOKING }, { name: 'Ethernet connection' }, { name: 'Printer', on: NO_BOOKING }, { name: 'Monitor 27"', on: ['airbnb'] }],
  'Kitchen and dining': [
    { name: 'Kitchen' }, { name: 'Refrigerator' }, { name: 'Microwave' }, { name: 'Cooking basics', desc: 'Pots and pans, oil, salt and pepper' }, { name: 'Dishes and silverware' },
    { name: 'Dishwasher' }, { name: 'Oven' }, { name: 'Stove' }, { name: 'Coffee maker' }, { name: 'Electric kettle', on: NO_AIRBNB }, { name: 'Toaster' }, { name: 'Wine glasses' }, { name: 'Dining table' },
  ],
  'Location features': [{ name: 'Private entrance' }, { name: 'Lake access' }, { name: 'Waterfront' }, { name: 'Beach access' }, { name: 'Laundromat nearby', on: NO_BOOKING }],
  'Luxury amenities': [{ name: 'Hot tub', details: 'shared' }, { name: 'Pool', details: 'shared' }, { name: 'Sauna' }, { name: 'Gym' }],
  'Outdoor': [{ name: 'Patio' }, { name: 'Backyard' }, { name: 'BBQ grill' }, { name: 'Outdoor furniture' }, { name: 'Outdoor dining area' }],
  'Parking and facilities': [
    { name: 'Free parking on premises', details: 'parking' }, { name: 'Paid parking on premises', details: 'parking' }, { name: 'Free street parking' },
    { name: 'Elevator' }, { name: 'EV charger' }, { name: 'Self check-in', on: NO_BOOKING }, { name: 'Bike racks (shared)', on: NO_BOOKING },
    { name: 'Luggage drop-off allowed', on: NO_BOOKING }, { name: 'Balcony' }, { name: 'Garden' },
  ],
  'Property views': [{ name: 'City skyline view' }, { name: 'Courtyard view' }, { name: 'Garden view' }, { name: 'Lake view' }, { name: 'Park view' }, { name: 'River view' }],
  'Services': [{ name: 'Breakfast', on: NO_AIRBNB }, { name: 'Cleaning available during stay' }, { name: 'Long-term stays allowed', on: NO_BOOKING }, { name: 'Host greets you', on: NO_BOOKING }],
}
const CATALOG_BY_NAME = new Map(Object.values(AMENITY_CATALOG).flat().map((a) => [a.name, a]))
export const catalogAmenity = (name: string) => CATALOG_BY_NAME.get(name)
/** Channels that can list this amenity (of the property's connected channels). */
export const amenityChannels = (name: string, connected: ListingChannel[]) => {
  const on = catalogAmenity(name)?.on
  return on ? connected.filter((c) => on.includes(c)) : connected
}

/* ---------- amenity details (the pencil) ---------- */
export type DetailKind = 'laundry' | 'shared' | 'parking'
export const detailsKind = (name: string): DetailKind | undefined => catalogAmenity(name)?.details
/** The Base key that holds an amenity's details (JSON). Not a listing field: Review and Canvas ignore it. */
export const detailsKey = (name: string) => `amenity-details:${name}`

/** One-question details (Washer, Dryer: where; Hot tub, Pool: private or shared). */
export const DETAIL_CHOICES: Record<Exclude<DetailKind, 'parking'>, { question: string; options: string[]; fallback: string }> = {
  laundry: { question: 'Where is it?', options: ['In unit', 'In building'], fallback: 'In unit' },
  shared: { question: 'Is it private or shared?', options: ['Private', 'Shared'], fallback: 'Private' },
}

/** Hospitable's parking details (REAL·PRODUCT refs 09–11). The type is an Airbnb field (the mark beside each option). */
export const PARKING = {
  types: ['Parking Garage', 'Carport', 'Driveway', 'Residential Garage', 'Unknown Parking Type'],
  typeChannel: 'airbnb' as ListingChannel,
  access: ['Only Guests', 'General Public'],
  reservation: ['Needed', 'Not Needed', 'Not Possible'],
  options: ['Has gated parking', 'Has security cameras', 'Has onsite staff', 'Has ev charging', 'Has accessible parking spots'],
}
export const PARKING_STEPS = ['Parking type', 'Access', 'Spaces and options'] as const
export interface ParkingDetails { type?: string; access?: string; reservation?: string; spaces?: number; height?: number; options: string[] }
export const EMPTY_PARKING: ParkingDetails = { options: [] }

export function parseParking(v: string | undefined): ParkingDetails {
  if (!v) return { ...EMPTY_PARKING }
  try { const p = JSON.parse(v) as ParkingDetails; return { ...EMPTY_PARKING, ...p, options: p.options ?? [] } } catch { return { ...EMPTY_PARKING } }
}
/** The line under the amenity's name: "Driveway · Only guests · 2 spaces". */
export function detailsSummary(kind: DetailKind, v: string | undefined): string | undefined {
  if (kind !== 'parking') return v || undefined
  const p = parseParking(v)
  const parts = [p.type, p.access && (p.access === 'Only Guests' ? 'Only guests' : 'Open to the public'),
    p.spaces ? `${p.spaces} ${p.spaces === 1 ? 'space' : 'spaces'}` : undefined, p.height ? `max ${p.height} m high` : undefined,
    p.reservation === 'Needed' ? 'Reservation needed' : undefined]
  const s = parts.filter(Boolean).join(' · ')
  return s || undefined
}
/** Neukölln's washer is in the flat's bathroom (data/sl3.ts "The space"); other homes default to the same. */
export const detailsDefault = (name: string): string | undefined => {
  const k = detailsKind(name)
  return k && k !== 'parking' ? DETAIL_CHOICES[k].fallback : undefined
}
