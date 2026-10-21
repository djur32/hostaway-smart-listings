/* WS-CV · Canvas data (V3-SPEC §1 "Listing editor", frames CV-00…CV-09).
 * What each part of the channel's guest page is, who owns it and where it is changed: research in CV-00
 * (research/market/channel-constraints.md), except where V3-SPEC §1 overrides it (the Booking.com description is
 * editable per channel). Every value on the replicas is . */
import type { FieldState } from '../ds/sl3'
import { FIELDS, tipsFor, type ListingChannel, type ListingTab } from './sl3'

/* ---------- areas: the parts of a channel page ---------- */
export interface CvLock { title: string; text: string; link?: { label: string; to: (pid: string, ch: ListingChannel) => string } }
export interface CvArea {
  id: string
  /** Short name used in labels ("Title", "Photos", "Price"). */
  name: string
  tab: ListingTab
  /** Editable areas point at a listing field (data/sl3 FIELDS) or at the photo order. */
  field?: string
  /** Locked areas say who owns them and where to change them. */
  state?: FieldState
  lock?: CvLock
  /** The area edits a long text (textarea) rather than one line. */
  long?: boolean
}

const pricing = (pid: string, ch: ListingChannel) => `/property/${pid}/ch/${ch}/pricing`
const policies = (pid: string, ch: ListingChannel) => `/property/${pid}/ch/${ch}/policies`
const hub = (tab: string) => (pid: string) => `/property/${pid}/hub/${tab}`
const classic = (tab: ListingTab) => (pid: string, ch: ListingChannel) => `/property/${pid}/ch/${ch}/listing/${tab}`

const AIRBNB: CvArea[] = [
  { id: 'title', name: 'Title', tab: 'essentials', field: 'name' },
  { id: 'photos', name: 'Photos and order', tab: 'essentials', field: 'photos' },
  { id: 'type', name: 'Property type and rooms', tab: 'essentials', state: 'hub', lock: { title: 'Property type and rooms are facts', text: 'Entire rental unit, 2 guests, 1 bedroom, 1 bed and 1 bath live in the Knowledge Hub and apply to every channel.', link: { label: 'Open in Knowledge Hub', to: hub('property') } } },
  { id: 'rating', name: 'Guest favourite and rating', tab: 'essentials', state: 'set', lock: { title: 'Set by Airbnb and your guests', text: 'Guests write the rating; Airbnb awards the Guest favourite badge. You can reply to reviews on Airbnb.' } },
  { id: 'host', name: 'Host', tab: 'essentials', state: 'set', lock: { title: 'Your Airbnb profile', text: 'Your name, photo and Superhost status come from your Airbnb profile, not from this listing.' } },
  { id: 'highlights', name: 'Highlights', tab: 'essentials', state: 'set', lock: { title: 'Airbnb picks the highlights', text: 'Airbnb chooses these three lines from your amenities and reviews. Better amenities and check-in details change them.', link: { label: 'Open Amenities', to: classic('amenities') } } },
  { id: 'summary', name: 'Listing description', tab: 'essentials', field: 'summary', long: true },
  { id: 'space', name: 'The space', tab: 'essentials', field: 'space', long: true },
  { id: 'access', name: 'Guest access', tab: 'essentials', field: 'access', long: true },
  { id: 'interaction', name: 'During your stay', tab: 'essentials', field: 'interaction', long: true },
  { id: 'other', name: 'Other things to note', tab: 'essentials', field: 'other', long: true },
  { id: 'sleep', name: 'Where you\'ll sleep', tab: 'essentials', state: 'hub', lock: { title: 'Rooms and beds come from the Knowledge Hub', text: 'One bedroom with a double bed. Change rooms and beds once; every channel gets them.', link: { label: 'Open Rooms & beds', to: hub('property') } } },
  { id: 'amenities', name: 'Amenities', tab: 'amenities', state: 'listing', lock: { title: 'Amenities are shared by all channels', text: 'Add or remove an amenity once, in the Knowledge Hub; Airbnb, Booking.com and your site all get it.', link: { label: 'Open Amenities', to: classic('amenities') } } },
  { id: 'calendar', name: 'Availability', tab: 'essentials', state: 'linked', lock: { title: 'Availability comes from your calendar', text: 'Open and blocked nights are the same on every channel. Change them in the Calendar.', link: { label: 'Open Calendar', to: (pid) => `/property/${pid}/calendar` } } },
  { id: 'rarefind', name: '"Rare find"', tab: 'essentials', state: 'set', lock: { title: 'Set by Airbnb', text: 'Airbnb shows this when your dates are usually booked. You can\'t change it.' } },
  { id: 'price', name: 'Price', tab: 'essentials', state: 'linked', lock: { title: 'Price comes from Pricing', text: '€44 weeknights · €55 weekends, from Pricing and the calendar. You can\'t change it on the page.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'nightly', name: 'Nightly rate', tab: 'essentials', state: 'linked', lock: { title: 'Nightly rates come from Pricing', text: '€44 × 3 weeknights. Weekend nights are €55. Change rates, discounts and minimum stays in Pricing.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'cleaning', name: 'Cleaning fee', tab: 'essentials', state: 'linked', lock: { title: 'Cleaning fee comes from Pricing › Fees', text: '€25 per stay on Airbnb.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'service', name: 'Service fee', tab: 'essentials', state: 'set', lock: { title: 'Set by Airbnb', text: 'Airbnb adds its guest service fee. You can\'t change it.' } },
  { id: 'reviews', name: 'Reviews', tab: 'essentials', state: 'set', lock: { title: 'Written by guests', text: 'Reviews and category scores can\'t be edited. You can reply to a review on Airbnb.' } },
  { id: 'map', name: 'Map', tab: 'location', state: 'hub', lock: { title: 'The address is fixed after creation', text: 'The pin comes from the address in the Knowledge Hub. Guests see the exact spot after booking.', link: { label: 'Open Location', to: hub('location') } } },
  { id: 'neighbourhood', name: 'The neighbourhood', tab: 'location', field: 'neighbourhood', long: true },
  { id: 'getting_around', name: 'Getting around', tab: 'location', field: 'getting_around', long: true },
  { id: 'meet', name: 'Meet your host', tab: 'essentials', state: 'set', lock: { title: 'Your Airbnb profile', text: 'Host details, response rate and response time come from Airbnb.' } },
  { id: 'rules', name: 'House rules', tab: 'rules', field: 'house_rules', long: true },
  { id: 'safety', name: 'Safety & property', tab: 'rules', state: 'hub', lock: { title: 'Safety devices are facts', text: 'Smoke and carbon monoxide alarms are kept in the Knowledge Hub for every channel.', link: { label: 'Open in Knowledge Hub', to: hub('amenities') } } },
  { id: 'cancellation', name: 'Cancellation policy', tab: 'rules', state: 'linked', lock: { title: 'Cancellation comes from Policies', text: 'Moderate on Airbnb. Booking policies are set per channel.', link: { label: 'Open Policies', to: policies } } },
]

const BOOKING: CvArea[] = [
  { id: 'title', name: 'Property name', tab: 'essentials', field: 'name' },
  { id: 'address', name: 'Address', tab: 'location', state: 'hub', lock: { title: 'The address is fixed after creation', text: 'Booking.com shows the street address from the Knowledge Hub. Changing it needs Booking.com support.', link: { label: 'Open Location', to: hub('location') } } },
  { id: 'photos', name: 'Photos and order', tab: 'essentials', field: 'photos' },
  { id: 'score', name: 'Review score', tab: 'essentials', state: 'set', lock: { title: 'Set by guests', text: 'Booking.com computes the score from verified guest reviews.' } },
  { id: 'map', name: 'Map', tab: 'location', state: 'hub', lock: { title: 'The pin comes from your address', text: 'Sent to Booking.com when the listing was created.', link: { label: 'Open Location', to: hub('location') } } },
  { id: 'description', name: 'Summary', tab: 'essentials', field: 'summary', long: true },
  { id: 'generated', name: 'Booking.com\'s own lines', tab: 'essentials', state: 'set', lock: { title: 'Written by Booking.com', text: 'Booking.com adds distances and review quotes to your description, in 25+ languages. Better facts change them.' } },
  { id: 'highlights', name: 'Property highlights', tab: 'essentials', state: 'set', lock: { title: 'Generated by Booking.com', text: 'Booking.com builds this box from reviews and facilities.' } },
  { id: 'facilities', name: 'Facilities', tab: 'amenities', state: 'listing', lock: { title: 'Facilities are shared by all channels', text: 'Booking.com picks the most popular five from the amenities you keep in the Knowledge Hub.', link: { label: 'Open Amenities', to: classic('amenities') } } },
  { id: 'unit', name: 'Unit name', tab: 'essentials', state: 'set', lock: { title: 'Booking.com standard name', text: 'Unit names come from Booking.com\'s standard list. A custom name shows only in the Extranet.' } },
  { id: 'price', name: 'Price', tab: 'essentials', state: 'linked', lock: { title: 'Price comes from Pricing', text: '€44 weeknights + €30 cleaning on Booking.com, from Pricing and the calendar.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'policy', name: 'Cancellation and prepayment', tab: 'rules', state: 'linked', lock: { title: 'Comes from Policies', text: 'Free cancellation until 3 days before, no prepayment: set in Booking policies for Booking.com.', link: { label: 'Open Policies', to: policies } } },
  { id: 'reviews', name: 'Guest reviews', tab: 'essentials', state: 'set', lock: { title: 'Written by guests', text: 'Scores and reviews can\'t be edited. You can reply in the Extranet.' } },
  { id: 'rules', name: 'House rules', tab: 'rules', state: 'listing', lock: { title: 'House rules are shared by all channels', text: 'Booking.com takes structured rules only (times, pets, smoking, parties). Change them once in Rules.', link: { label: 'Open Rules', to: classic('rules') } } },
  { id: 'fineprint', name: 'The fine print', tab: 'rules', field: 'house_rules', long: true },
]

const DIRECT: CvArea[] = [
  { id: 'title', name: 'Property name', tab: 'essentials', field: 'name' },
  { id: 'photos', name: 'Photos and order', tab: 'essentials', field: 'photos' },
  { id: 'type', name: 'Property type and rooms', tab: 'essentials', state: 'hub', lock: AIRBNB.find((a) => a.id === 'type')!.lock },
  { id: 'description', name: 'Summary', tab: 'essentials', field: 'summary', long: true },
  { id: 'access', name: 'Guest access', tab: 'essentials', field: 'access', long: true },
  { id: 'amenities', name: 'Amenities', tab: 'amenities', state: 'listing', lock: AIRBNB.find((a) => a.id === 'amenities')!.lock },
  { id: 'price', name: 'Price', tab: 'essentials', state: 'linked', lock: { title: 'Price comes from Pricing', text: '€44 weeknights · €55 weekends on your site, no service fee.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'cleaning', name: 'Cleaning fee', tab: 'essentials', state: 'linked', lock: { title: 'Cleaning fee comes from Pricing › Fees', text: '€25 per stay on your site.', link: { label: 'Set in Pricing', to: pricing } } },
  { id: 'neighbourhood', name: 'The neighbourhood', tab: 'location', field: 'neighbourhood', long: true },
  { id: 'map', name: 'Map', tab: 'location', state: 'hub', lock: AIRBNB.find((a) => a.id === 'map')!.lock },
  { id: 'rules', name: 'House rules', tab: 'rules', field: 'house_rules', long: true },
  { id: 'cancellation', name: 'Cancellation policy', tab: 'rules', state: 'linked', lock: { title: 'Cancellation comes from Policies', text: 'Flexible on your site.', link: { label: 'Open Policies', to: policies } } },
]

export const CV_AREAS: Record<ListingChannel, CvArea[]> = { airbnb: AIRBNB, booking: BOOKING, direct: DIRECT }
export const cvArea = (ch: ListingChannel, id: string) => CV_AREAS[ch].find((a) => a.id === id)
/** Which area a listing field lands in on this channel's page (for tips and the Classic tab). */
export const areaForField = (ch: ListingChannel, field: string) => CV_AREAS[ch].find((a) => a.field === field)
/** First area to scroll to when the Canvas opens on a Details tab. */
export const TAB_ANCHOR: Record<ListingChannel, Partial<Record<ListingTab, string>>> = {
  airbnb: { essentials: 'title', arrival: 'rules', location: 'map', amenities: 'amenities', rules: 'rules' },
  booking: { essentials: 'title', arrival: 'fineprint', location: 'address', amenities: 'facilities', rules: 'rules' },
  direct: { essentials: 'title', arrival: 'rules', location: 'map', amenities: 'amenities', rules: 'rules' },
}

/** The field's state on this channel (data/sl3 FIELDS), for areas that point at a field. */
export const fieldState = (ch: ListingChannel, field: string): FieldState => {
  if (field === 'photos') return FIELDS.find((f) => f.key === 'photos')?.state[ch] ?? 'channel'
  return FIELDS.find((f) => f.key === field)?.state[ch] ?? 'channel'
}

/* ---------- photos (order per channel; the library lives in the Knowledge Hub) ---------- */
export type PhotoKey = 'living1' | 'living2' | 'bedroom' | 'desk' | 'kitchen' | 'bathroom' | 'balcony' | 'building' | 'street' | 'extra1' | 'extra2'
export const PHOTO_CAPTION: Record<PhotoKey, string> = {
  living1: 'Living room', living2: 'Living room, sofa', bedroom: 'Bedroom', desk: 'Desk by the window', kitchen: 'Kitchen',
  bathroom: 'Bathroom', balcony: 'Balcony', building: 'The building', street: 'Weserstraße', extra1: 'Paintings', extra2: 'Hallway',
}
export const photoUrl = (k: string) => `${import.meta.env.BASE_URL}photos/${k}.jpg`
/** Live order today. Airbnb: the desk is 9th; Booking.com: the bedroom is the cover. */
export const PHOTO_ORDER: Record<ListingChannel, PhotoKey[]> = {
  airbnb: ['living1', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'living2', 'building', 'street', 'desk', 'extra1', 'extra2'],
  booking: ['bedroom', 'living1', 'kitchen', 'bathroom', 'desk', 'balcony', 'building', 'street', 'living2', 'extra1', 'extra2'],
  direct: ['living1', 'desk', 'bedroom', 'kitchen', 'balcony', 'bathroom', 'living2', 'building', 'street', 'extra1', 'extra2'],
}
/** The order a photo tip proposes (data/sl3 TIPS t-a-photos, t-b-photos). */
export const PHOTO_TIP_ORDER: Record<string, PhotoKey[]> = {
  't-a-photos': ['living1', 'bedroom', 'desk', 'kitchen', 'balcony', 'bathroom', 'living2', 'building', 'street', 'extra1', 'extra2'],
  't-b-photos': ['living1', 'bedroom', 'kitchen', 'bathroom', 'desk', 'balcony', 'building', 'street', 'living2', 'extra1', 'extra2'],
}
/** Custom key for the photo order in sl3.custom (comma list), so it doesn't collide with the Classic "photos" summary. */
export const PHOTO_KEY = 'photos.order'
export const photoTipFor = (ch: ListingChannel) => tipsFor(ch).find((t) => t.field === 'photos')

/* ---------- "Describe the change" (canned AI: canned, deterministic rewrites) ---------- */
export const QUICK_ASKS = ['Shorter', 'Warmer', 'More factual', 'Rewrite'] as const
export interface CvRewrite { text: string; flag?: string }
/** Rewrites per field; "Try again" walks the list. Each one uses only Knowledge Hub facts unless flagged.
 *  The scenario property's only: other properties have no rewrites (Canvas offers direct edits there). */
export const REWRITES: Record<string, CvRewrite[]> = {
  name: [
    { text: "Artist's Flat with a Desk · Neukölln" },
    { text: 'Sunny Art Flat by Tempelhofer Feld' },
    { text: 'Neukölln Art Flat, 3 min to the U7' },
  ],
  summary: [
    { text: 'A sunny 48 m² flat with original paintings and a real desk by the window, five minutes from Tempelhofer Feld.' },
    { text: 'Two bright rooms full of original art, a desk that faces the window and fast Wi-Fi, a short walk from Tempelhofer Feld.' },
  ],
  description: [
    { text: 'Sunny two-room flat full of original paintings, five minutes from Tempelhofer Feld. Two rooms: a living room with a desk that faces the window, and a bright bedroom that looks onto the quiet courtyard.', flag: '"quiet" isn\'t a fact in your Knowledge Hub yet. Accepting asks you to confirm it or drops the word.' },
    { text: 'Sunny two-room flat full of original paintings, five minutes from Tempelhofer Feld, with a real desk by the window, fast Wi-Fi and a bright bedroom onto the courtyard.' },
  ],
  space: [
    { text: 'Two rooms: a bright living room with the desk by the window and the kitchen, and a bedroom onto the courtyard.' },
    { text: 'The living room holds the desk, the sofa and the kitchen; the bedroom looks onto the courtyard. 48 m² in all.' },
  ],
  access: [
    { text: 'The whole flat is yours. Let yourself in with the keypad from 3:00 PM; the courtyard is shared with the neighbours.' },
    { text: 'You have the whole flat. The courtyard is shared.' },
  ],
  interaction: [
    { text: 'I live nearby and answer messages within the hour. Ask me for café tips.' },
  ],
  other: [
    { text: 'A 4th-floor walk-up with no elevator; the light up here is worth every step.' },
    { text: 'The flat is on the 4th floor and there is no elevator.' },
  ],
  neighbourhood: [
    { text: 'A quiet street in north Neukölln: Tempelhofer Feld 5 minutes on foot, the canal and Weserstraße\'s cafés around the corner.' },
    { text: 'North Neukölln, between Tempelhofer Feld and the canal. Cafés on Weserstraße, a Saturday market on Maybachufer.' },
  ],
  getting_around: [
    { text: 'Rathaus Neukölln (U7) is 3 minutes on foot; bus M41 stops outside; bike share on every corner.' },
  ],
  house_rules: [
    { text: 'Shoes off inside, please. Quiet after 22:00: the neighbours have small children.' },
    { text: 'Shoes off inside · quiet after 22:00 · no parties.' },
  ],
  method_details: [
    { text: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes. The green door next to the bakery is ours; enter the keypad code and take the stairs to the 4th floor.' },
  ],
}
/** A generic answer when a field has no canned rewrite. */
export const fallbackRewrite = (value: string, ask: string): string => {
  const a = ask.toLowerCase()
  if (a.includes('short')) return value.split(/(?<=\.)\s/)[0] ?? value
  if (a.includes('warm')) return `${value.replace(/\.$/, '')}, and we'd love to host you.`
  return value
}

/* ---------- replica content ----------
 * The scenario property's (Neukölln). Other properties' pages: data/property-listing.ts cvContentFor / channelPrice. */
export const STAY = { from: '12 Oct 2026', to: '15 Oct 2026', fromShort: 'Mon 12 Oct', toShort: 'Thu 15 Oct', nights: 3, guests: 2 }
export const PRICE: Record<ListingChannel, { night: number; cleaning: number; service: number }> = {
  airbnb: { night: 44, cleaning: 25, service: 22 },
  booking: { night: 44, cleaning: 30, service: 0 },
  direct: { night: 44, cleaning: 25, service: 0 },
}
export const total = (ch: ListingChannel) => PRICE[ch].night * STAY.nights + PRICE[ch].cleaning + PRICE[ch].service

export const AIRBNB_HIGHLIGHTS: Array<[icon: string, title: string, line: string]> = [
  ['lock', 'Self check-in', 'Check yourself in with the keypad.'],
  ['briefcase', 'Dedicated workspace', 'A room with wifi that\'s well-suited for working.'],
  ['map-pin', 'Walkable area', 'Tempelhofer Feld is 5 minutes on foot.'],
]
export const AIRBNB_AMENITIES: Array<[icon: string, name: string, off?: boolean]> = [
  ['tools-kitchen-2', 'Kitchen'], ['wifi', 'Wifi'], ['briefcase', 'Dedicated workspace'], ['home', 'Washer'],
  ['lock', 'Self check-in'], ['clock', 'Long-term stays allowed'], ['building', 'Elevator', true], ['alert-triangle', 'Smoke alarm'],
  ['alert-circle', 'Carbon monoxide alarm'], ['bath', 'Hair dryer', true],
]
export const AIRBNB_SCORES: Array<[string, string, string]> = [
  ['Cleanliness', '4.9', 'sparkles'], ['Accuracy', '4.9', 'circle-check'], ['Check-in', '5.0', 'lock'],
  ['Communication', '5.0', 'message-circle'], ['Location', '4.8', 'map-pin'], ['Value', '4.7', 'tag'],
]
export const REVIEWS: Array<{ name: string; from: string; when: string; text: string }> = [
  { name: 'Lena', from: 'Hamburg, Germany', when: 'October 2026', text: 'The paintings are even better in person, and Tempelhofer Feld at sunset was the highlight. Keypad check-in was easy.' },
  { name: 'Marco', from: 'Milan, Italy', when: 'September 2026', text: 'Perfect for working remotely: a real desk by the window and quiet evenings. The stairs are a workout, but worth it.' },
  { name: 'Aisha', from: 'London, UK', when: 'September 2026', text: 'Bright, spotless and full of character. The host answered every question within minutes.' },
  { name: 'Tomás', from: 'Madrid, Spain', when: 'August 2026', text: 'Great base for Neukölln: cafés on Weserstraße and the U7 three minutes away. Would stay again.' },
]
export const BOOKING_FACILITIES: Array<[icon: string, name: string]> = [
  ['wifi', 'Free WiFi'], ['circle-check', 'Non-smoking rooms'], ['tools-kitchen-2', 'Kitchen'], ['home-2', 'Balcony'], ['home', 'Washing machine'],
]
export const BOOKING_SCORES: Array<[string, number]> = [
  ['Staff', 9.6], ['Facilities', 8.8], ['Cleanliness', 9.3], ['Comfort', 9.0], ['Value for money', 8.9], ['Location', 9.6], ['Free WiFi', 8.7],
]
export const BOOKING_RULES: Array<[icon: string, label: string, text: string]> = [
  ['clock', 'Check-in', 'From 15:00 to 22:00'],
  ['clock', 'Check-out', 'Until 14:00'],
  ['info-circle', 'Cancellation/ prepayment', 'Cancellation and prepayment policies vary according to accommodation type.'],
  ['mood-kid', 'Children and beds', 'Children of any age are welcome. There are no cots or extra beds available.'],
  ['user', 'No age restriction', 'There is no age requirement for check-in.'],
  ['paw', 'Pets', 'Pets are not allowed.'],
  ['alert-circle', 'Smoking', 'Smoking is not allowed.'],
  ['confetti', 'Parties', 'Parties/events are not allowed.'],
]
