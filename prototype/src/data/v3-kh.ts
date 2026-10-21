/* Smart Listing v3 · WS-KH data: the Knowledge Hub as the one place that holds everything about the property (KH2,
 * Antonio's review 30 Sep: "centralize all of the information in here", pricing and availability included), and
 * Review & push. SIMULATED scenario content (concepts/SCENARIO.md); screen structure REAL·PRODUCT (HS-21…HS-47,
 * HS-A01…A03, HS-L01…L11); channel rules REAL·PUBLIC (research/market/channel-constraints.md).
 *
 * Nothing here copies a listing value: every Hub item is built from data/sl3.ts FIELDS, data/v3-ch.ts EXTRA_FIELDS,
 * PRICES and AVAILABILITY, so the Hub and the channel screens read the same Base and the same channel values.
 * Store keys: FIELDS keys as-is · `price:<key>` · `avail:<key>` · `amenity:<name>` (per channel 'on'/'off') ·
 * `policy:instant` (per channel) · `kh.<id>` (facts only the Hub and AI replies use). */
import { AMENITIES, LISTING_CHANNELS, type FieldDef, type ListingChannel } from './sl3'
import { AVAILABILITY, CANCELLATION, FIELD_OPTIONS, HELP, INSTANT_BOOK, INSTANT_DEFAULT, PRICES, TAB_FIELDS, fieldByKey, type PriceTab } from './v3-ch'
import type { FieldState } from '../ds/sl3'
import { AVAIL_DAYS } from './availability'

export const LISTING_ALL: ListingChannel[] = LISTING_CHANNELS

/* ---------- sections (Hospitable's names and order where they exist: Details tabs, Pricing, Availability, Booking policies) ---------- */
export type KhSectionId = 'property' | 'descriptions' | 'photos' | 'arrival' | 'location' | 'amenities' | 'rules' | 'pricing' | 'availability' | 'policies' | 'custom'
export const KH_SECTIONS: Array<{ id: KhSectionId; label: string; desc: string }> = [
  { id: 'property', label: 'The property', desc: 'What kind of home this is. Every channel reads these facts.' },
  { id: 'descriptions', label: 'Descriptions', desc: 'The name and texts guests read before they book.' },
  { id: 'photos', label: 'Photos', desc: 'Your photo library. Each channel shows its own selection and order.' },
  { id: 'arrival', label: 'Arrival', desc: 'Add key details guests need for check-in, their stay, and checkout.' },
  { id: 'location', label: 'Location', desc: 'Your property’s location and neighbourhood details.' },
  { id: 'amenities', label: 'Amenities', desc: 'The amenities available to guests during their stay.' },
  { id: 'rules', label: 'House rules', desc: 'The house rules guests must follow.' },
  { id: 'pricing', label: 'Pricing', desc: 'The default rates, fees and discounts. The calendar and Dynamic Pricing set prices for single dates.' },
  { id: 'availability', label: 'Availability', desc: 'How long guests can stay and how far ahead they can book.' },
  { id: 'policies', label: 'Booking policies', desc: 'Cancellation terms and how booking requests are handled, per channel.' },
  { id: 'custom', label: 'Custom facts', desc: 'Things guests ask about that no listing field holds. Only your AI replies use them.' },
]
export const isKhSection = (t?: string): t is KhSectionId => !!t && KH_SECTIONS.some((s) => s.id === t)

/* ---------- one Hub item = one field, with its Base and where it goes ---------- */
export type KhKind = FieldDef['kind'] | 'money' | 'percent' | 'guests' | 'dropdown'
/** Where "Open in … " goes for a channel: its Listing tab, Pricing tab or Policies tab. */
export interface KhOpen { area: 'listing' | 'pricing' | 'policies' | 'availability'; tab?: string }
export interface KhItem {
  key: string
  section: KhSectionId
  /** Sub-heading inside a section (Arrival's "Getting inside and setup", Pricing's "Fees"…). */
  group?: string
  label: string
  help?: string
  kind: KhKind
  base: string
  options?: string[]
  unit?: string
  limit?: number
  state: Partial<Record<ListingChannel, FieldState>>
  value?: Partial<Record<ListingChannel, string>>
  /** Why a channel owns the value ('set'), e.g. "Booking.com runs its own deals (Genius)". */
  setBy?: Partial<Record<ListingChannel, string>>
  open?: KhOpen
}
export interface KhGroupDef { id: string; title: string; desc?: string }

const fromField = (section: KhSectionId, f: FieldDef, group?: string): KhItem => ({
  key: f.key, section, group, label: f.label, help: f.help ?? HELP[f.key], kind: f.kind, base: f.base ?? '', limit: f.limit,
  options: FIELD_OPTIONS[f.key], state: f.state, value: f.value, open: { area: 'listing', tab: f.tab },
})
const fieldsOf = (keys: string[]) => keys.map((k) => fieldByKey(k)).filter((f): f is FieldDef => !!f)

/** Property facts no listing tab holds (REAL·PRODUCT: Airbnb "Where you'll sleep", Booking.com "Unit size"). SIMULATED values. */
const PROPERTY_FACTS: KhItem[] = [
  { key: 'kh.size', section: 'property', label: 'Size', help: 'Booking.com and your site show it; Airbnb doesn’t ask for it.', kind: 'text', base: '48 m²', state: { booking: 'listing', direct: 'listing' } },
  { key: 'kh.bedrooms', section: 'property', label: 'Bedrooms and beds', help: 'Where guests sleep.', kind: 'text', base: '1 bedroom · 1 double bed (160 × 200)', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' } },
  { key: 'kh.bathrooms', section: 'property', label: 'Bathrooms', help: 'Full bathrooms and what’s in them.', kind: 'text', base: '1 bathroom · walk-in shower, no bathtub', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' } },
]

const PRICE_GROUPS: Array<{ id: PriceTab; title: string; desc: string }> = [
  { id: 'base', title: 'Base price', desc: 'The default nightly rate for open dates that don’t have a price set by hand or by Dynamic Pricing.' },
  { id: 'occupancy', title: 'Occupancy based', desc: 'Prices based on how many guests are staying.' },
  { id: 'fees', title: 'Fees', desc: 'One-time charges that apply per stay.' },
  { id: 'discounts', title: 'Discounts', desc: 'Lower prices for longer stays.' },
]
const priceKind = (u: string): KhKind => (u === '€' ? 'money' : u === '%' ? 'percent' : 'guests')

/** Every item, in section order. Built on each call so edits to the data files show up. */
export function khItems(): KhItem[] {
  const out: KhItem[] = []
  // The property
  for (const f of fieldsOf(['type', 'room'])) out.push(fromField('property', f))
  out.push(...PROPERTY_FACTS)
  for (const f of fieldsOf(['tags', 'languages'])) out.push(fromField('property', f))
  // Descriptions (Essentials texts)
  for (const f of fieldsOf(['name', 'summary', 'description', 'space', 'other'])) out.push(fromField('descriptions', f))
  // Arrival · Location · House rules, in the Classic editor's order
  for (const f of fieldsOf(TAB_FIELDS.arrival)) out.push(fromField('arrival', f, f.group ?? 'inside'))
  for (const f of fieldsOf(TAB_FIELDS.location)) out.push(fromField('location', f))
  for (const f of fieldsOf(TAB_FIELDS.rules)) out.push(fromField('rules', f, ['checkin', 'checkin_end', 'checkout'].includes(f.key) ? 'times' : 'rules'))
  // Pricing (PRICES) — channel markups and Booking.com's own deals come in as per-channel values
  for (const g of PRICE_GROUPS) for (const r of PRICES[g.id]) {
    out.push({
      key: `price:${r.key}`, section: 'pricing', group: g.id, label: r.label, help: r.help, kind: priceKind(r.unit), unit: r.unit === 'guests' ? 'guests' : r.unit,
      base: String(r.base), state: r.state, setBy: r.setBy, open: { area: 'pricing', tab: g.id },
      value: r.value ? Object.fromEntries(Object.entries(r.value).map(([c, v]) => [c, String(v)])) : undefined,
    })
  }
  // Availability (AVAILABILITY)
  // the channel Availability page (/ch/:c/availability): General rules + the day restrictions (data/availability.ts)
  for (const r of [...AVAILABILITY, ...AVAIL_DAYS]) out.push({ key: `avail:${r.key}`, section: 'availability', label: r.label, help: r.help, kind: 'dropdown', base: r.base, options: r.options, state: r.state, value: r.value, open: { area: 'availability', tab: AVAIL_DAYS.includes(r) ? 'rules' : 'general' } })
  return out
}
export const KH_GROUPS: Partial<Record<KhSectionId, KhGroupDef[]>> = {
  arrival: [
    { id: 'inside', title: 'Getting inside and setup' },
    { id: 'resources', title: 'Guest resources', desc: 'Add links that can be shared automatically in messages using shortcodes.' },
  ],
  rules: [
    { id: 'times', title: 'Check-in and checkout' },
    { id: 'rules', title: 'Rules' },
  ],
  pricing: PRICE_GROUPS.map((g) => ({ id: g.id, title: g.title, desc: g.desc })),
}
export const khItem = (key: string) => khItems().find((i) => i.key === key)

/* ---------- amenities: one Base list, per-channel exceptions (`amenity:<name>` 'on'/'off' in sl3.custom) ---------- */
export const khAmenities = () => AMENITIES
/** Amenities a host can add, per group (REAL·PUBLIC Airbnb / Booking.com amenity names). */
export const AMENITY_CATALOG: Record<string, string[]> = {
  'Internet and office': ['Ethernet connection', 'Printer'],
  'Kitchen and dining': ['Coffee maker', 'Microwave', 'Oven', 'Toaster', 'Wine glasses'],
  'Bedroom and laundry': ['Bed linens', 'Extra pillows and blankets', 'Dryer'],
  'Bathroom': ['Body soap', 'Hot water', 'Towels'],
  'Heating and cooling': ['Portable fans', 'Air conditioning'],
  'Parking and facilities': ['Free street parking', 'Elevator', 'Luggage drop-off allowed'],
}

/* ---------- booking policies ---------- */
export const KH_CANCELLATION = CANCELLATION
export const KH_INSTANT = { options: INSTANT_BOOK, defaults: INSTANT_DEFAULT }

/* ---------- custom facts: only the Hub and AI replies use them (HS-L06 topics with no listing field) ---------- */
export interface KhFact { id: string; label: string; value: string; source: string; fromTip?: string }
export const KH_CUSTOM: KhFact[] = [
  { id: 'parking', label: 'Parking', value: 'Street parking is free after 20:00 and on Sundays. During the day, the Karstadt garage on Hermannplatz (€2.50 an hour) is a 6-minute walk.', source: 'Added by you · 12 Sep' },
  { id: 'trash', label: 'Trash and recycling', value: 'Courtyard bins: yellow for plastic and cans, blue for paper, brown for food waste, black for everything else. Glass goes to the containers at the corner of Weserstraße.', source: 'Added by you · 12 Sep' },
  { id: 'damage', label: 'If something breaks', value: 'Tell me in the app with a photo and I’ll arrange the repair, usually the same day. Nothing is charged for normal wear.', source: 'Added by you · 12 Sep' },
  { id: 'bikes', label: 'Bikes', value: 'Bikes can be locked in the courtyard racks. A Nextbike dock is at the corner of Weserstraße and Weichselstraße.', source: 'Added by you · 12 Sep' },
  { id: 'contact', label: 'Contact during the stay', value: 'Message me through the channel you booked on; I reply within an hour from 8:00 to 22:00. For emergencies, call the number in your booking confirmation.', source: 'Added by you · 12 Sep' },
  { id: 'luggage', label: 'Luggage before check-in', value: 'Bags can wait at the Weserstraße bakery next door from 9:00 (€5 per bag, cash).', source: 'From your messages · 29 Sep' },
]
/** What a tip adds to Custom facts when "Push to knowledge base" was ticked and the tip accepted (sl3.kb). */
export const KH_FROM_TIPS: Record<string, { label: string; value: string }> = {
  't-a-name': { label: 'Nearby landmark', value: 'Tempelhofer Feld is a 5-minute walk.' },
  't-a-neigh': { label: 'Breaks nearby', value: 'The canal and the cafés on Weserstraße are around the corner.' },
  't-b-directions': { label: 'Walking from the U-Bahn', value: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes to the green door next to the bakery.' },
  't-a-summary': { label: 'In one sentence', value: 'A sunny 48 m² flat with original paintings and a real desk by the window.' },
  't-b-desc': { label: 'For city breaks', value: 'Tempelhofer Feld is a 5-minute walk; Rathaus Neukölln U7 is 3 minutes away.' },
}

/* ---------- import discrepancies: at most one banner, resolved in one sheet ---------- */
export interface KhDiscrepancy {
  id: string; key: string; section: KhSectionId; label: string; question: string
  options: Array<{ channel: ListingChannel; value: string }>
}
export const KH_DISCREPANCIES: KhDiscrepancy[] = [
  { id: 'd-checkin', key: 'checkin', section: 'rules', label: 'Check-in from', question: 'When can guests check in?', options: [{ channel: 'airbnb', value: '3:00 PM' }, { channel: 'booking', value: '4:00 PM' }] },
  { id: 'd-balcony', key: 'amenity:Balcony', section: 'amenities', label: 'Balcony', question: 'Does the home have a balcony?', options: [{ channel: 'booking', value: 'Yes, a balcony' }, { channel: 'airbnb', value: 'No balcony' }] },
  { id: 'd-address', key: 'address', section: 'location', label: 'Street address', question: 'Which spelling should every channel use?', options: [{ channel: 'airbnb', value: 'Weserstraße 1x, 12047 Berlin' }, { channel: 'booking', value: 'Weserstr. 1x, 12047 Berlin' }] },
]

/** "Ask the AI" (HS-L08, kept light): guest questions and the Hub items that answer them. SIMULATED answers. */
export const KH_ASK: Array<{ q: string; a: string; items: string[] }> = [
  { q: 'When can I check in?', a: 'Check-in is from 3:00 PM to 10:00 PM. The keypad code arrives 24 hours before you do.', items: ['Check-in from', 'Check-in time ends', 'Check-in method details'] },
  { q: 'Is there an elevator?', a: 'No, the flat is on the 4th floor and there is no elevator.', items: ['Other details to note'] },
  { q: 'Where can I park?', a: 'Street parking is free after 20:00 and on Sundays; during the day the Hermannplatz garage is a 6-minute walk.', items: ['Parking'] },
  { q: 'Where does the recycling go?', a: 'In the courtyard bins: yellow for plastic, blue for paper, brown for food waste, black for the rest.', items: ['Trash and recycling'] },
]

/* ---------- Review & push ---------- */
/** What each channel does with a pushed change. SIMULATED outcomes; REAL·PUBLIC rules (channel-constraints §5, §9). */
export function receiptFor(ch: ListingChannel, field: string): { state: 'live' | 'review' | 'sending'; note: string } {
  if (ch === 'booking' && (field === 'name' || field === 'description')) return { state: 'review', note: 'Booking.com reviews this, usually within 48 h' }
  if (ch === 'booking' && field === 'photos') return { state: 'sending', note: 'Photos can take up to an hour' }
  if (ch === 'direct') return { state: 'live', note: 'On your site' }
  return { state: 'live', note: ch === 'airbnb' ? 'Confirmed by Airbnb' : 'Confirmed by Booking.com' }
}
export function paceFor(ch: ListingChannel, fields: string[]): string {
  if (ch === 'direct') return 'Live on your site right away.'
  if (ch === 'booking' && fields.some((f) => f === 'name' || f === 'description')) return 'Usually live within minutes. Booking.com reviews names and descriptions (up to 48 h).'
  if (fields.includes('photos')) return 'Usually live within minutes; photos can take up to an hour.'
  return 'Usually live within minutes.'
}
/** Section label for a store key (Review & push). */
export function sectionOfKey(key: string): string {
  if (key.startsWith('price:')) return 'Pricing'
  if (key.startsWith('avail:')) return 'Availability'
  if (key.startsWith('policy:')) return 'Policies'
  if (key.startsWith('amenity:')) return 'Amenities'
  const i = khItem(key)
  return i ? KH_SECTIONS.find((s) => s.id === i.section)!.label : 'Listing'
}
export const instantLabel = (id: string) => INSTANT_BOOK.find((o) => o.id === id)?.label ?? id
