/* Smart Listing v3 · WS-CH data (channel overview, Classic editor layout, pricing, policies).
 * SIMULATED scenario values (concepts/SCENARIO.md); screen structure REAL·PRODUCT (HS-21…HS-39, HS-47, HS-L10/L11).
 * Appends to data/sl3.ts; never edits it. */
import { CHECKIN_METHODS, FIELDS, fieldOn, type FieldDef, type ListingChannel, type ListingTab, type WhyPoint } from './sl3'
import { currentUser } from './users'
import type { FieldState } from '../ds/sl3'

/* ---------- Classic editor: which fields each tab shows, in Hospitable's order ---------- */
/** Extra rows the Classic editor needs that data/sl3.ts doesn't carry (Location facts as in HS-24/25). */
export const EXTRA_FIELDS: FieldDef[] = [
  { key: 'country', tab: 'location', label: 'Country / region', help: 'Where the property is.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Germany' },
  { key: 'unit', tab: 'location', label: 'Apt / Unit', help: 'Shared with guests after booking.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: '4th floor, left' },
  { key: 'state', tab: 'location', label: 'State', help: 'Where the property is.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Berlin' },
  { key: 'zip', tab: 'location', label: 'ZIP code', help: 'Used for search and taxes.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: '12047' },
  { key: 'pin', tab: 'location', label: 'Pin location', help: 'Guests see the approximate area before booking.', kind: 'map', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Weserstraße, Neukölln' },
  { key: 'checkin_end', tab: 'rules', label: 'Check-in time ends', help: 'The latest guests can arrive.', kind: 'time', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: '10:00 PM' },
]

/** V3-SPEC §1: Essentials is complete. Neighbourhood and Getting around stay in Location, as in Hospitable today (HS-25). */
/** Fields nobody edits after the listing exists (Antonio, 3 Oct): the disabled field with a lock and this reason, on the
 *  Base and on every channel. ASSUMPTION wording. The pin keeps its own Edit (it can be nudged). */
const LOCATION_FIXED = 'The address is set when the listing is created and can’t be changed afterwards.'
export const FIXED_FIELDS: Record<string, string> = {
  type: 'Property type is set when the listing is created and can’t be changed afterwards.',
  room: 'Room type is set when the listing is created and can’t be changed afterwards.',
  country: LOCATION_FIXED, address: LOCATION_FIXED, unit: LOCATION_FIXED, city: LOCATION_FIXED, state: LOCATION_FIXED, zip: LOCATION_FIXED,
}
export const TAB_FIELDS: Record<Exclude<ListingTab, 'amenities'>, string[]> = {
  essentials: ['photos', 'name', 'summary', 'space', 'other', 'type', 'room', 'tags', 'languages'],
  // Hospitable's real Arrival order (HS-A01…A03): Getting inside and setup, then Guest resources
  arrival: ['method', 'method_details', 'wifi_name', 'wifi_password', 'manual', 'access', 'interaction', 'checkout_tasks', 'guidebook', 'rental_agreement', 'upsell'],
  location: ['country', 'address', 'unit', 'city', 'state', 'zip', 'pin', 'directions', 'neighbourhood', 'getting_around'],
  rules: ['checkin', 'checkin_end', 'checkout', 'house_rules', 'children', 'infants', 'pets', 'smoking', 'events'],
}
const ALL_FIELDS = [...FIELDS, ...EXTRA_FIELDS]
export const fieldByKey = (k: string) => ALL_FIELDS.find((f) => f.key === k)
/** The rows a tab shows; with a channel, only the fields that channel has (checkout tasks are Airbnb-only). */
export const classicFields = (tab: ListingTab, c?: ListingChannel): FieldDef[] => tab === 'amenities' ? [] : TAB_FIELDS[tab].map((k) => fieldByKey(k)!).filter((f) => !!f && (!c || fieldOn(f, c)))
/** Where a field lives in the Classic editor (tips carry their own tab; the editor's layout wins). */
export const tabOfField = (key: string): ListingTab => {
  for (const [t, keys] of Object.entries(TAB_FIELDS)) if (keys.includes(key)) return t as ListingTab
  return 'amenities'
}
/** Options for the select rows, and help lines Hospitable shows on the Rules toggles (HS-28/29). */
export const FIELD_OPTIONS: Record<string, string[]> = {
  checkin: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 'Flexible'],
  method: CHECKIN_METHODS,
  checkout: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM'],
  checkin_end: ['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', 'Flexible'],
  type: ['Apartment', 'House', 'Loft', 'Guest suite'],
  room: ['Entire place', 'Private room', 'Shared room'],
}
export const HELP: Record<string, string> = {
  pets: 'Assistance animals are always allowed.', smoking: 'Inside the flat.', events: 'Parties and gatherings.', children: 'Aged 2–12.',
}
/** Rules: which rows are the same on every channel and which are per channel (CL-08). */
export const RULES_GROUPS: Array<{ title: string; desc: string; keys: string[] }> = [
  { title: 'Same on every channel', desc: 'Changing one updates every channel.', keys: ['checkin', 'checkin_end', 'checkout', 'children', 'infants', 'smoking', 'events'] },
  { title: 'Per channel', desc: 'Each channel uses the Base unless you customize it.', keys: ['house_rules', 'pets'] },
]
export const TAB_DESC: Record<ListingTab, string> = {
  essentials: 'The essential details guests see when booking.',
  arrival: 'Add key details guests need for check-in, their stay, and checkout.',
  location: 'Your property’s location and neighbourhood details.',
  amenities: 'The amenities available to guests during their stay.',
  rules: 'The house rules guests must follow.',
}
/* Photo orders and counts live in data/photos.ts (store.photoLib); the old static PHOTO_ORDER / PHOTO_LIBRARY (18 · 14 · 21) are gone (QA B18). */

/* ---------- channel overview ---------- */
export interface ChannelMeta {
  connection: string; account: string; synced: string; live: string; liveSub: string
  /** `null`: no performance numbers for this property yet; the overview shows a neutral "—". */
  kpis: { occ: number; adr: number; stay: number; revpar: number; occDelta: string; adrDelta: string; stayDelta: string; revparDelta: string; down?: Array<'adr'> } | null
  /** Values the channel owns: shown, never editable (V3-SPEC §1). */
  owned: Array<[string, string]>
  /** What only this channel has. */
  only: Array<{ label: string; sub: string; value: string; to: 'listing' | 'pricing' | 'policies'; tab?: string }>
}
/** The scenario property's (Neukölln) channel meta. Other properties: data/property-listing.ts channelMetaFor. */
export const CHANNEL_META: Record<ListingChannel, ChannelMeta> = {
  airbnb: {
    connection: 'Connected', account: currentUser().name, synced: '12 min ago', live: 'Listed', liveSub: 'Guests can search and book',
    kpis: { occ: 71, adr: 48, stay: 4.1, revpar: 34, occDelta: '+9 pts', adrDelta: '−€4', stayDelta: '+1.5 nights', revparDelta: '+€2', down: ['adr'] },
    owned: [['Rating', '4.89 · 37 reviews'], ['Guest favourite', 'Yes, since June']],
    only: [
      { label: 'Cancellation', sub: 'Airbnb terms', value: 'Moderate · Long stays Firm', to: 'policies' },
    ],
  },
  booking: {
    connection: 'Connected', account: 'Property ID 10482213', synced: '8 min ago', live: 'Open for bookings', liveSub: 'Bookable on Booking.com',
    kpis: { occ: 64, adr: 58, stay: 2.4, revpar: 37, occDelta: '+4 pts', adrDelta: '+€3', stayDelta: '+0.2 nights', revparDelta: '+€4' },
    owned: [['Review score', '9.1 · 23 reviews'], ['Genius', 'Level 1 · 10% off']],
    only: [
      { label: 'Cancellation', sub: 'Booking.com terms', value: 'Flexible · until 1 day before', to: 'policies' },
      { label: 'Non-refundable rate', sub: 'Booking.com only', value: '10% cheaper, no refund', to: 'policies' },
    ],
  },
  direct: {
    connection: 'Your booking site', account: 'artistflat.hospitable.rentals', synced: 'Instant', live: 'Live on your site', liveSub: 'Anyone with the link can book',
    kpis: { occ: 12, adr: 51, stay: 3.0, revpar: 6, occDelta: '+2 pts', adrDelta: '+€1', stayDelta: '0', revparDelta: '+€1' },
    owned: [],
    only: [],
  },
}

/* ---------- pricing (HS-30, HS-33, HS-L10, HS-L11) ---------- */
/** How a fee is charged (Antonio, 3 Oct, from Hospitable's Fees tab): which rows let the host pick the basis ("per stay",
 *  "per guest", "per night"…) and which also pick the currency. Cleaning is always once per stay. Kept as ordinary Base
 *  keys `price:<key>@unit` / `price:<key>@cur` in the section draft, so they save with the rest. */
export const FEE_BASES: Record<string, { options: string[]; dflt: string; currency?: boolean }> = {
  linens: { options: ['per guest', 'per stay'], dflt: 'per stay' },
  resort: { options: ['per stay', 'per guest', 'per night', 'per guest per night'], dflt: 'per stay' }, // a fixed € on every fee row (Antonio, 6 Oct); the currency picker was dropped
  management: { options: ['per stay', 'per guest', 'per night', 'per guest per night'], dflt: 'per stay' },
  community: { options: ['per stay', 'per guest', 'per night', 'per guest per night'], dflt: 'per stay' },
  pet: { options: ['per stay', 'per night', 'per pet per stay', 'per pet per night'], dflt: 'per pet per stay' },
}
export const CURRENCIES = ['€', '$', '£']
export type PriceTab = 'base' | 'occupancy' | 'fees' | 'discounts'
export const PRICE_TABS: Array<{ id: PriceTab; label: string }> = [
  { id: 'base', label: 'Base price' }, { id: 'occupancy', label: 'Occupancy based' }, { id: 'fees', label: 'Fees' }, { id: 'discounts', label: 'Discounts' },
]
export interface PriceRow { key: string; label: string; help: string; unit: '€' | '%' | 'guests'; base: number; state: Partial<Record<ListingChannel, FieldState>>; value?: Partial<Record<ListingChannel, number>>; setBy?: Partial<Record<ListingChannel, string>> }
/** The scenario property's (Neukölln) Pricing rows. Every property's: data/property-listing.ts pricesFor(pid). */
export const PRICES: Record<PriceTab, PriceRow[]> = {
  base: [
    { key: 'nightly', label: 'Nightly rate', help: 'The default price for open nights.', unit: '€', base: 44, state: { airbnb: 'listing', booking: 'listing', direct: 'listing' } },
    { key: 'weekend', label: 'Weekend rate', help: 'For Friday and Saturday nights.', unit: '€', base: 55, state: { airbnb: 'listing', booking: 'listing', direct: 'listing' } },
    { key: 'markup', label: 'Channel markup', help: 'Added to your rates on this channel, so you earn the same after its fees.', unit: '%', base: 0, state: { airbnb: 'override', booking: 'override', direct: 'inherit' }, value: { airbnb: 3, booking: 15 } },
  ],
  occupancy: [
    { key: 'included', label: 'Guests included', help: 'Guests included in the nightly rate.', unit: 'guests', base: 1, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    { key: 'extra', label: 'Extra guest fee', help: 'Per extra guest, per night.', unit: '€', base: 10, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    { key: 'max', label: 'Maximum occupancy', help: 'The most guests a booking can have.', unit: 'guests', base: 2, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } }, // editable, and per channel (Antonio, 3 Oct)
  ],
  fees: [
    { key: 'cleaning', label: 'Cleaning fee', help: 'Charged once per stay to cover cleaning between guests.', unit: '€', base: 25, state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' }, value: { booking: 30 } },
    { key: 'short_clean', label: 'Airbnb short term cleaning fee', help: 'Charged on Airbnb reservations that are 1-2 nights long.', unit: '€', base: 0, state: { airbnb: 'only' }, value: { airbnb: 15 } },
    { key: 'pet', label: 'Pet fee', help: 'Charged for each pet. Does not include service animals.', unit: '€', base: 20, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    // Listing base › Pricing (base/Pricing.tsx, 1 Oct): the real product's Fees tab shows these as real editable
    // rows, not static "€0 per stay" text (concepts/smart-listing/refs/base-pricing/README.md). SIMULATED defaults.
    { key: 'linens', label: 'Linens fee', help: 'Covers fresh linens and laundry for each stay.', unit: '€', base: 0, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    { key: 'resort', label: 'Resort fee', help: 'For resort-style properties: pools, gyms and other on-site facilities.', unit: '€', base: 0, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    { key: 'management', label: 'Management fee', help: 'Covers the cost of managing the booking and the stay.', unit: '€', base: 0, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
    { key: 'community', label: 'Community fee', help: 'Charged by the building or community for shared spaces.', unit: '€', base: 0, state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' } },
  ],
  discounts: [
    // Antonio, 3 Oct: Weekly and Monthly, each a Base value that Airbnb and Direct use and that Booking.com sets for itself
    // (its own value, edited on Booking.com's page; its Genius deals aren't mentioned on the Base). Replaces the earlier
    // "monthly is Airbnb-only" and the "Booking.com sets it" lock.
    { key: 'weekly', label: 'Weekly discount', help: 'Applies for any stays of 7 nights or longer.', unit: '%', base: 5, state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' }, value: { booking: 10 } },
    { key: 'monthly', label: 'Monthly discount', help: 'Applies for any stays of 28 nights or longer.', unit: '%', base: 9, state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' }, value: { booking: 15 } },
  ],
}
/** The one money tip on Pricing (CV-07). Money always asks, even on Autopilot. */
export const PRICE_TIP = {
  id: 'p-a-weekly', channel: 'airbnb' as ListingChannel, tab: 'discounts' as PriceTab, field: 'weekly', from: 5, to: 10,
  title: 'Weekly discount 5% → 10% on Airbnb',
  example: ['A 7-night stay on weeknights', '€293', '€277'] as [string, string, string],
  why: [
    { text: 'Your strategy is Fill empty nights for remote workers: fill more nights, earn a little less per night.', source: 'strategy' },
    { text: '9 weeknights are open in October, mostly in gaps of 5 to 7 nights.', source: 'strategy' },
    { text: '9 of 24 similar homes give 10–15% for a week.', source: 'strategy' },
  ] as WhyPoint[],
}

/* ---------- policies (HS-47, HS-37/38/39) ---------- */
export interface PolicyCardDef { title: string; kicker?: string; body: string; meta?: string }
export const CANCELLATION: Record<ListingChannel, { state: FieldState; cards: PolicyCardDef[] }> = {
  airbnb: { state: 'channel', cards: [
    { title: 'Moderate', body: 'Guests can cancel at least five days before check-in for a full refund. After that, you receive 100% for each night stayed, one more night, and 50% for unspent nights.', meta: 'Non-refundable option: Not enabled' },
    { title: 'Long-term stays (28+ nights)', kicker: 'Firm', body: 'Guests must cancel at least 30 days before check-in for a full refund.' },
  ] },
  booking: { state: 'channel', cards: [
    { title: 'Flexible', body: 'Guests can cancel free of charge until 1 day before arrival. After that, they pay the first night.', meta: 'Non-refundable rate: On · 10% cheaper' },
  ] },
  direct: { state: 'inherit', cards: [
    { title: 'Moderate', body: 'Guests can cancel at least five days before check-in for a full refund. After that, they pay 50% of the stay.', meta: 'Your site uses the Base policy' },
  ] },
}
export const INSTANT_BOOK = [
  { id: 'all', label: 'Automatically accept all', line: 'Every request becomes a booking.' },
  { id: 'low', label: 'Automatically accept low risk', line: 'Guests with reviews and a verified ID book instantly.' },
  { id: 'review', label: 'Review and approve', line: 'You answer each request within 24 hours.' },
]
export const INSTANT_DEFAULT: Record<ListingChannel, string> = { airbnb: 'review', booking: 'all', direct: 'low' }
export interface AvailRow { key: string; label: string; help: string; base: string; state: Partial<Record<ListingChannel, FieldState>>; value?: Partial<Record<ListingChannel, string>>; options: string[] }
export const AVAILABILITY: AvailRow[] = [
  { key: 'min_stay', label: 'Minimum stay', help: 'The fewest nights a guest can book.', base: '3 nights', state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' }, value: { airbnb: '2 nights' }, options: ['1 night', '2 nights', '3 nights', '4 nights', '5 nights', '7 nights'] },
  { key: 'max_stay', label: 'Maximum stay', help: 'The most nights a guest can book.', base: '24 nights', state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' }, options: ['14 nights', '24 nights', '28 nights', '90 nights'] },
  { key: 'advance', label: 'Advance notice', help: 'How soon before arrival guests can book.', base: 'None', state: { airbnb: 'inherit', booking: 'inherit', direct: 'override' }, value: { direct: '1 day' }, options: ['None', 'Same day at 6:00 AM', 'Same day at 7:00 AM', 'Same day at 8:00 AM', 'Same day at 9:00 AM', 'Same day at 10:00 AM', 'Same day at 11:00 AM', 'Same day at 12:00 PM', 'Same day at 1:00 PM', 'Same day at 2:00 PM', 'Same day at 3:00 PM', 'Same day at 4:00 PM', 'Same day at 5:00 PM', 'Same day at 6:00 PM', 'Same day at 7:00 PM', 'Same day at 8:00 PM', 'Same day at 9:00 PM', 'Same day at 10:00 PM', 'Same day at 11:00 PM', '1 day', '2 days', '3 days', '7 days'] },
  { key: 'prep', label: 'Preparation time', help: 'Nights blocked before and after each stay for cleaning.', base: 'None', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, options: ['None', '1 turnover night', '2 turnover nights'] },
  { key: 'window', label: 'Availability window', help: 'How far ahead guests can book.', base: '24 months', state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' }, options: ['3 months', '6 months', '12 months', '24 months'] },
]
