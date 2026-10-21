/* Smart Listing v3 data (concepts/smart-listing/V3-SPEC.md). SIMULATED scenario content; channel rules REAL·PUBLIC
 * (research/market/channel-constraints.md). Field lists follow Hospitable's real Details › Essentials / Arrival /
 * Location / Amenities / Rules editors (HS-21…HS-29). */
import type { ChannelId } from './types'
import type { FieldState } from '../ds/sl3'

export type ListingChannel = 'airbnb' | 'booking' | 'direct'
export const LISTING_CHANNELS: ListingChannel[] = ['airbnb', 'booking', 'direct']
export type ListingTab = 'essentials' | 'arrival' | 'location' | 'amenities' | 'rules'
export const LISTING_TABS: Array<{ id: ListingTab; label: string }> = [
  { id: 'essentials', label: 'Essentials' }, { id: 'arrival', label: 'Arrival' }, { id: 'location', label: 'Location' },
  { id: 'amenities', label: 'Amenities' }, { id: 'rules', label: 'Rules' },
]

/* ---------- setup ---------- */
export type GoalId = 'fill' | 'earn' | 'balance' | 'time'
export type AudienceId = 'remote' | 'couples' | 'families' | 'auto'
export type RunMode = 'suggest' | 'autopilot'
export interface Plan { goal: GoalId; audience: AudienceId; asks: string[]; priceMin: number; priceMax: number; mode: RunMode }
export const GOALS: Array<{ id: GoalId; label: string; line: string }> = [
  { id: 'fill', label: 'Fill empty nights', line: 'Suggested: 11 of your 13 empty nights in October are Monday to Thursday.' },
  { id: 'earn', label: 'Earn more per booking', line: 'Your weekends book 3 weeks out; similar homes charge €12 more.' },
  { id: 'balance', label: 'Balance both', line: 'More nights on weekdays, the same price on weekends.' },
  { id: 'time', label: 'Save me time', line: 'Fewer changes and questions; only what matters.' },
]
export const AUDIENCES: Array<{ id: AudienceId; label: string; icon: string; line: string; tag?: string; disabled?: string }> = [
  { id: 'remote', label: 'Remote workers', icon: 'briefcase', line: 'Week-long stays, a real desk, quiet weekdays · 8 of 24 similar homes lead with this', tag: 'Best fit' },
  { id: 'couples', label: 'City-break couples', icon: 'heart', line: 'Weekends, food, the park · 11 of 24 similar homes' },
  { id: 'families', label: 'Families', icon: 'users', line: 'Not a fit: this home sleeps 2', disabled: 'sleeps 2' },
  { id: 'auto', label: 'Let Smart Listings decide', icon: 'sparkles', line: 'Based on who books homes like yours' },
]
export const ASKS: Array<{ id: string; label: string; always?: boolean }> = [
  { id: 'price', label: 'Prices and fees', always: true },
  { id: 'rules', label: 'Minimum stay and rules', always: true },
  { id: 'policy', label: 'Cancellation policy', always: true },
  { id: 'title', label: 'Property name changes' },
  { id: 'photos', label: 'Photo order' },
]
export const DEFAULT_PLAN: Plan = { goal: 'fill', audience: 'remote', asks: ['price', 'rules', 'policy'], priceMin: 40, priceMax: 90, mode: 'suggest' }
export const goalLabel = (g: GoalId) => GOALS.find((x) => x.id === g)!.label
export const audienceLabel = (a: AudienceId) => AUDIENCES.find((x) => x.id === a)!.label

/* ---------- listing fields per tab ---------- */
export interface FieldDef {
  key: string; tab: ListingTab; label: string; help?: string
  kind: 'text' | 'textarea' | 'photos' | 'select' | 'tags' | 'toggle' | 'time' | 'map' | 'tasks' | 'url'
  /** Sub-section inside a tab (Arrival: 'inside' | 'resources'). */
  group?: string
  /** Editability per channel (V3-SPEC §1): lock only what can't be edited. */
  state: Partial<Record<ListingChannel, FieldState>>
  base?: string
  /** Channel-specific values (custom or only-on-channel). */
  value?: Partial<Record<ListingChannel, string>>
  /** Why a channel that sets the value itself ('set') won't take an edit: the lock's tooltip ("Booking.com only"). */
  why?: Partial<Record<ListingChannel, string>>
  limit?: number
  options?: string[]
}
const B = 'Beautiful Artist Apt. in Neukölln'
/** Booking.com writes the property's description itself (D-032, D-086): the reason on its lock (Antonio, 4 Oct).
 *  His line, trimmed so it fits three lines of the shared 240px tooltip (the full one ran to four). */
const BOOKING_WRITES = 'Booking.com writes this from your facts, photos and amenities, so it can’t be edited here.'
/** The reason a channel-set field can't be edited here: the field's own `why`, else a plain default. */
export const setByWhy = (def: Pick<FieldDef, 'why'>, c: ListingChannel, name: string) =>
  def.why?.[c] ?? `${name} sets this itself, so it can’t be edited here.`
export const FIELDS: FieldDef[] = [
  // Essentials (Hospitable Details › Essentials, HS-L01/L02). Every field carries a full Base value (Antonio, 30 Sep: "a value for everything").
  { key: 'photos', tab: 'essentials', label: 'Photos', help: 'Order and cover for this channel. The photo library lives in the Knowledge Hub.', kind: 'photos',
    state: { airbnb: 'override', booking: 'override', direct: 'inherit' }, // the seed library (data/photos.ts): 11 photos; Airbnb shows all 11, Booking.com 9. Screens derive counts from store.photoLib (QA B18)
    base: '11 photos in the Knowledge Hub', value: { airbnb: '11 photos · cover: Living room', booking: '9 photos · cover: Bedroom' } },
  { key: 'name', tab: 'essentials', label: 'Property name', help: 'Guests see it in search.', kind: 'text', limit: 50,
    state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' }, base: B, value: { booking: 'Artist Apartment Neukölln · Balcony & Fast Wi-Fi' } },
  // Booking.com writes its own description from the property's facts — never an editable per-channel text there
  // (D-032, D-086; Antonio 3 Oct via the deck session): 'set' = shown read-only. Antonio, 4 Oct: the caption reads
  // "Booking.com only" beside a lock, and the lock's tooltip says why it can't be changed (`why`)
  { key: 'summary', tab: 'essentials', label: 'Summary', help: 'The property description guests see.', kind: 'textarea', limit: 500,
    state: { airbnb: 'override', booking: 'set', direct: 'inherit' }, why: { booking: BOOKING_WRITES },
    base: 'A sunny two-room flat full of original paintings, five minutes from Tempelhofer Feld in north Neukölln. Fast Wi-Fi, a proper desk and a quiet bedroom onto the courtyard.',
    value: { airbnb: 'Your quiet base for working remotely in Berlin: a real desk by the window, 250 Mbps Wi-Fi, and Tempelhofer Feld five minutes away for a lunch-break walk.' } },
  { key: 'description', tab: 'essentials', label: 'Description', help: 'The longer text about your place.', kind: 'textarea',
    state: { airbnb: 'inherit', booking: 'set', direct: 'inherit' }, why: { booking: BOOKING_WRITES },
    base: 'Sunny two-room flat full of original paintings, five minutes from Tempelhofer Feld. A dedicated workspace with fast Wi-Fi and a bright bedroom that looks onto the courtyard. The kitchen is fully equipped for longer stays, and Weserstraße’s cafés and bakeries are around the corner.' },
  { key: 'space', tab: 'essentials', label: 'The space', help: 'What should guests know about your space?', kind: 'textarea',
    state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' },
    base: 'Two rooms on the 4th floor, 48 m². The living room has the paintings, a sofa, the dining table and an open kitchen. The bedroom has a double bed (160 × 200) and faces the quiet courtyard. Bathroom with a walk-in shower and a washing machine.',
    value: { airbnb: 'Two rooms, 48 m², on the 4th floor. The living room has a real desk by the window with an ergonomic chair and a 27" monitor, plus the paintings, a sofa and an open kitchen. The bedroom faces the quiet courtyard, so calls and sleep stay undisturbed.' } },
  { key: 'other', tab: 'essentials', label: 'Other details to note', help: 'Additional information guests should know before booking.', kind: 'textarea',
    state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' },
    base: 'A 4th-floor walk-up with no elevator. The street door locks at 22:00; your keypad code opens it at any time. Quiet hours in the building are 22:00–7:00.' },
  { key: 'type', tab: 'essentials', label: 'Property type', help: 'A fact about your home, kept in the Knowledge Hub.', kind: 'select', state: { airbnb: 'hub', booking: 'hub', direct: 'hub' }, base: 'Apartment' },
  { key: 'room', tab: 'essentials', label: 'Room type', help: 'What guests book.', kind: 'select', state: { airbnb: 'hub', booking: 'hub', direct: 'hub' }, base: 'Entire place' },
  { key: 'tags', tab: 'essentials', label: 'Tags', help: 'Add tags to describe your property (e.g., Log cabin, Beach, City)', kind: 'tags', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'City · Art · Workspace' },
  { key: 'languages', tab: 'essentials', label: 'Languages', help: 'Languages your property supports', kind: 'tags', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'English · German · Spanish' },
  // Arrival · Getting inside and setup (REAL·PRODUCT: Antonio's Arrival screenshots, research/current-state/antonio-2026-09-30/)
  // Check-in method and its details are Airbnb's own (Antonio, 3 Oct: the other channels have no field for them, so they
  // aren't on the Listing base either — the real Hospitable shows them as "1 channel")
  { key: 'method', tab: 'arrival', group: 'inside', label: 'Check-in method', kind: 'select', state: { airbnb: 'only' }, base: 'Keypad', value: { airbnb: 'Keypad' } },
  { key: 'method_details', tab: 'arrival', group: 'inside', label: 'Check-in method details', help: 'Any important details for getting inside your place.', kind: 'textarea',
    state: { airbnb: 'only' }, base: 'Enter the code on the keypad by the green street door, then take the stairs to the 4th floor. The flat is the door on the left; the same code opens it. You get the code 24 hours before arrival.', value: { airbnb: 'Enter the code on the keypad by the green street door, then take the stairs to the 4th floor. The flat is the door on the left; the same code opens it. You get the code 24 hours before arrival.' } },
  { key: 'wifi_name', tab: 'arrival', group: 'inside', label: 'Wifi name', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'ArtistFlat-5G' },
  { key: 'wifi_password', tab: 'arrival', group: 'inside', label: 'Wifi password', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'paintings&coffee' },
  { key: 'manual', tab: 'arrival', group: 'inside', label: 'House manual', help: 'Give guests tips about your space, like how to use the TV or dishwasher.', kind: 'textarea',
    state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' },
    base: '- Please take your shoes off inside.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.\n- The dishwasher tablets are under the sink.',
    value: { airbnb: '- Please take your shoes off inside.\n- The desk: USB-C and HDMI cables for the monitor are in the top drawer; the lamp dims with the dial.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.' } },
  { key: 'access', tab: 'arrival', group: 'inside', label: 'Guest access', help: 'Let guests know which areas they can use and which are off limits.', kind: 'textarea',
    state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' }, base: 'The whole flat is yours: living room, bedroom, kitchen and bathroom. The courtyard and the bike racks are shared with the neighbours. The cellar is off limits.' },
  { key: 'interaction', tab: 'arrival', group: 'inside', label: 'Interaction preferences', help: 'Let guests know your preference for interacting with them.', kind: 'textarea',
    state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' },
    base: 'Check-in is self-service, but I live nearby and I’m happy to meet you. I reply to messages within an hour between 8:00 and 22:00.',
    value: { airbnb: 'Self check-in, so arrive whenever suits you. I reply within an hour from 8:00 to 22:00, and I’m happy to share my favourite quiet cafés to work from.' } },
  { key: 'checkout_tasks', tab: 'arrival', group: 'inside', label: 'Guest checkout tasks', help: 'List any tasks guests should complete before leaving.', kind: 'tasks',
    // Airbnb only (REAL·PUBLIC https://www.airbnb.com/help/article/1926 · Airbnb 2023 Summer Release "Checkout instructions"; Hospitable shows "1 channel")
    state: { airbnb: 'only' }, base: '', value: { airbnb: 'Gather used towels | Leave them in the bathtub\nThrow rubbish away | Recycling bins are in the courtyard\nTurn things off | Heating to 1, lights off\nLock up | Pull the door until it clicks' } },
  // Arrival · Guest resources (shortcodes used in messaging rules)
  { key: 'guidebook', tab: 'arrival', group: 'resources', label: 'Guidebook', help: 'A link to your property guidebook, which will be populated anytime the %guidebook% short code is used in your messaging rules.', kind: 'url',
    state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'https://artistflat.hospitable.rentals/guidebook' },
  { key: 'rental_agreement', tab: 'arrival', group: 'resources', label: 'Rental Agreement', help: 'A link to your property rental agreement, which will be populated anytime the %rental_agreement% short code is used in your messaging rules.', kind: 'url',
    state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'https://artistflat.hospitable.rentals/rental-agreement' },
  { key: 'upsell', tab: 'arrival', group: 'resources', label: 'Upsell', help: 'A link to your property’s upsell or add-on storefront, which will be populated anytime the %upsell% short code is used in your messaging rules.', kind: 'url',
    state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'https://artistflat.hospitable.rentals/extras' },
  // Location (HS-24/25)
  { key: 'address', tab: 'location', label: 'Street address', help: 'Guests get the exact address after booking.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Weserstraße 1x, 12047 Berlin' },
  { key: 'city', tab: 'location', label: 'City', help: 'Where the property is.', kind: 'text', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Berlin' },
  { key: 'neighbourhood', tab: 'location', label: 'Neighbourhood description', help: 'What makes the area special.', kind: 'textarea', state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' },
    base: 'North Neukölln, one of Berlin’s liveliest corners: cafés and bakeries on Weserstraße, the Landwehr canal a short walk away and Tempelhofer Feld five minutes on foot.',
    value: { airbnb: 'Quiet street in north Neukölln, Tempelhofer Feld 5 minutes on foot.' } },
  { key: 'getting_around', tab: 'location', label: 'Getting around', help: 'Public transport, parking, walkability.', kind: 'textarea', state: { airbnb: 'inherit', booking: 'inherit', direct: 'inherit' },
    base: 'U7 at Rathaus Neukölln is 3 minutes on foot (Alexanderplatz in 15 minutes). Bus M41 to the main station. Bike share on every corner. Street parking is free after 20:00.' },
  { key: 'directions', tab: 'location', label: 'Directions', help: 'How to get to your place.', kind: 'textarea', state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' },
    base: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes. From BER airport, the FEX to Ostkreuz then S-Bahn to Neukölln (45 minutes).',
    value: { booking: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes: the green door next to the bakery. From BER airport, 45 minutes by train (FEX, then S-Bahn to Neukölln).' } },
  // Rules (HS-28/29)
  { key: 'checkin', tab: 'rules', label: 'Check-in from', help: 'The earliest guests can arrive.', kind: 'time', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: '3:00 PM' },
  { key: 'checkout', tab: 'rules', label: 'Checkout time', help: 'When guests leave.', kind: 'time', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: '2:00 PM' },
  { key: 'house_rules', tab: 'rules', label: 'House rules', help: 'Your own rules, in your words.', kind: 'textarea', state: { airbnb: 'override', booking: 'inherit', direct: 'inherit' },
    base: 'No parties or events. Quiet hours 22:00–7:00. Please don’t smoke inside or on the balcony. Maximum 2 guests.', value: { airbnb: 'Shoes off inside · quiet after 22:00 · no parties · no smoking, balcony included.' } },
  // Toggles: only Pets offers Edit per channel in Hospitable today (HS-29); the others are listing-wide.
  { key: 'children', tab: 'rules', label: 'Allow children', help: 'Aged 2 - 12', kind: 'toggle', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Yes' },
  { key: 'infants', tab: 'rules', label: 'Allow infants', help: 'Under 2', kind: 'toggle', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'Yes' },
  { key: 'pets', tab: 'rules', label: 'Allow pets', kind: 'toggle', state: { airbnb: 'inherit', booking: 'override', direct: 'inherit' }, base: 'No', value: { booking: 'Yes' } },
  { key: 'smoking', tab: 'rules', label: 'Allow smoking', kind: 'toggle', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'No' },
  { key: 'events', tab: 'rules', label: 'Allow events', kind: 'toggle', state: { airbnb: 'listing', booking: 'listing', direct: 'listing' }, base: 'No' },
]
/** Arrival sub-sections, as in Hospitable today. */
export const ARRIVAL_GROUPS: Array<{ id: 'inside' | 'resources'; title: string; desc?: string }> = [
  { id: 'inside', title: 'Getting inside and setup' },
  { id: 'resources', title: 'Guest resources', desc: 'Add links that can be shared automatically in messages using shortcodes.' },
]
/** Hospitable's check-in methods (REAL·PRODUCT dropdown, HS-A01; the last two are below the fold there: ASSUMPTION). */
export const CHECKIN_METHODS = ['Reception', 'Host Greeting', 'Keypad', 'Lockbox', 'Smart Lock', 'Key in Secret Spot', 'Building Staff', 'Other']
/** Does this channel have the field at all? (e.g. checkout tasks exist only on Airbnb). */
export const fieldOn = (f: FieldDef, c: ListingChannel) => f.state[c] !== undefined
export const fieldsFor = (tab: ListingTab) => FIELDS.filter((f) => f.tab === tab)
export const AMENITIES: Array<{ group: string; items: Array<{ name: string; on: ListingChannel[]; note?: string }> }> = [
  { group: 'Internet and office', items: [{ name: 'Wi-Fi', on: ['airbnb', 'booking', 'direct'] }, { name: 'Dedicated workspace', on: ['airbnb', 'direct'], note: 'Booking.com calls it "Desk"' }, { name: 'Monitor 27"', on: ['airbnb'] }] },
  { group: 'Kitchen and dining', items: [{ name: 'Kitchen', on: ['airbnb', 'booking', 'direct'] }, { name: 'Dishwasher', on: ['airbnb', 'booking', 'direct'] }, { name: 'Coffee maker', on: ['airbnb', 'booking', 'direct'] }, { name: 'Electric kettle', on: ['booking'] }] },
  { group: 'Bedroom and laundry', items: [{ name: 'Washer', on: ['airbnb', 'booking', 'direct'] }, { name: 'Essentials', on: ['airbnb', 'booking', 'direct'] }, { name: 'Hangers', on: ['airbnb', 'booking', 'direct'] }, { name: 'Iron', on: ['airbnb'] }] },
  { group: 'Bathroom', items: [{ name: 'Hair dryer', on: ['booking'] }, { name: 'Shampoo', on: ['airbnb', 'booking', 'direct'] }, { name: 'Walk-in shower', on: ['booking', 'direct'] }] },
  { group: 'Heating and cooling', items: [{ name: 'Heating', on: ['airbnb', 'booking', 'direct'] }] },
  { group: 'Parking and facilities', items: [{ name: 'Self check-in', on: ['airbnb', 'direct'] }, { name: 'Bike racks (shared)', on: ['airbnb', 'direct'] }, { name: 'Balcony', on: ['booking'], note: 'Channels disagree' }] },
]

/* ---------- tips (renamed from recommendations) ---------- */
/** Where a WHY bullet's reasoning actually comes from (Antonio, live review, reference image: a target icon + small
 *  "Strategy" pill for market/strategy reasoning, a speech-bubble icon + "Inbox" pill for reasoning grounded in real
 *  guest messages/inquiries) — so a tip never reads as an arbitrary, unsourced AI claim. Classified honestly per
 *  bullet by its actual wording, not alternated. */
/** 'hub': the reason is a fact from the property's Knowledge Hub (Antonio, 3 Oct: tips should show facts the Hub holds) */
export type WhySource = 'strategy' | 'inbox' | 'hub' | 'listing' // listing: a Listing base detail (Wi-Fi is an amenity, audit 4 Oct)
export interface WhyPoint { text: string; source: WhySource }
export interface TipDef {
  id: string; channel: ListingChannel; tab: ListingTab; field: string; type: string; section: string
  title: string; from?: string; to?: string
  /** A photo tip. `now`/`next` are labels: "bedroom" = that photo as the cover, "desk #3" = that photo at position 3
   *  (Review & push reads them the same way). `nowKey`/`nextKey` pin them to library keys (data/v3-cv PhotoKey) when a
   *  label alone is ambiguous; `order` is the channel's photo order on Accept, registered into data/v3-cv
   *  PHOTO_TIP_ORDER by data/property-listing.ts (Canvas and the photo model read it there). One photo tip per channel:
   *  the photo model applies the first accepted one. */
  photos?: { now: string; next: string; nowKey?: string; nextKey?: string; order?: string[] }
  alts?: string[]; why: WhyPoint[]; kb?: boolean; money?: boolean
}
export const TIPS: TipDef[] = [
  { id: 't-a-name', channel: 'airbnb', tab: 'essentials', field: 'name', type: 'Property name', section: 'Essentials', title: 'Name a landmark guests search for',
    from: B, to: "Artist's Flat by Tempelhofer Feld · Neukölln", kb: true,
    alts: ['Sunny Art-Filled Flat · Neukölln', 'Neukölln Art Flat with Workspace', "Painter's Flat, 3 min to the U-Bahn", 'Art Flat for Two by Tempelhofer Feld', 'Quiet Artist Flat with Desk · Neukölln', 'Bright Flat with Paintings near the Feld', 'Workspace Flat by Tempelhofer Feld', 'Art-Filled Two-Room Flat · Neukölln', 'Calm Neukölln Flat for Remote Work', 'Gallery Flat, 5 min to Tempelhofer Feld'],
    why: [{ text: 'Remote workers search by area first: 17 of 24 similar Airbnb homes nearby name the neighbourhood and a landmark.', source: 'strategy' }, { text: 'Tempelhofer Feld is 5 minutes on foot.', source: 'strategy' }] },
  { id: 't-a-photos', channel: 'airbnb', tab: 'essentials', field: 'photos', type: 'Photos', section: 'Essentials', title: 'Put the desk in the first five',
    photos: { now: 'desk #9', next: 'desk #3' }, why: [{ text: 'Guests staying 4+ nights look for a workspace first.', source: 'strategy' }, { text: 'Only 1 of your first 5 photos shows the desk. 9 of 14 similar homes show it by photo 3.', source: 'strategy' }] },
  { id: 't-a-summary', channel: 'airbnb', tab: 'essentials', field: 'summary', type: 'Summary', section: 'Essentials', title: 'Name the workspace in the first line',
    from: 'Your quiet base for working remotely in Berlin: a real desk by the window, 250 Mbps Wi-Fi, and Tempelhofer Feld five minutes away for a lunch-break walk.',
    to: 'A real desk by the window, 250 Mbps Wi-Fi and a quiet bedroom: a 48 m² art-filled flat in Neukölln, five minutes from Tempelhofer Feld.', kb: false,
    why: [{ text: 'Airbnb shows about the first 100 characters in search. Yours spend them on "your quiet base". The desk and Wi-Fi come later.', source: 'strategy' }, { text: 'Written only from your listing details and your Knowledge Hub.', source: 'strategy' }] },
  { id: 't-a-space', channel: 'airbnb', tab: 'essentials', field: 'space', type: 'The space', section: 'Essentials', title: 'Say how fast the Wi-Fi is',
    from: 'Two rooms, 48 m², on the 4th floor. The living room has a real desk by the window with an ergonomic chair and a 27" monitor, plus the paintings, a sofa and an open kitchen. The bedroom faces the quiet courtyard, so calls and sleep stay undisturbed.',
    to: 'Two rooms, 48 m², on the 4th floor. The living room has a real desk by the window with an ergonomic chair, a 27" monitor and 250 Mbps fibre Wi-Fi (tested on 12 Sep), plus the paintings, a sofa and an open kitchen. The bedroom faces the quiet courtyard, so calls and sleep stay undisturbed.',
    why: [{ text: 'From your Listing base · Amenities: Wi-Fi, 250 Mbps fibre, tested on 12 Sep.', source: 'listing' }, { text: '5 of your last 12 Airbnb inquiries asked about the Wi-Fi speed.', source: 'inbox' }, { text: '8 of 24 similar homes state the speed in The space.', source: 'strategy' }] },
  { id: 't-a-other', channel: 'airbnb', tab: 'essentials', field: 'other', type: 'Other details', section: 'Essentials', title: 'Say it\'s a 4th-floor walk-up, warmly',
    from: 'A 4th-floor walk-up with no elevator. The street door locks at 22:00; your keypad code opens it at any time. Quiet hours in the building are 22:00–7:00.', to: 'A 4th-floor walk-up with no elevator (the light up here is worth every step). The street door locks at 22:00; your keypad code opens it at any time. Quiet hours in the building are 22:00–7:00.', why: [{ text: '2 guests mentioned the stairs in reviews. Saying it up front avoids surprises.', source: 'inbox' }] },
  { id: 't-a-neigh', channel: 'airbnb', tab: 'location', field: 'neighbourhood', type: 'Neighbourhood', section: 'Location', title: 'Lead with the Feld and the canal',
    from: 'Quiet street in north Neukölln, Tempelhofer Feld 5 minutes on foot.', to: 'A quiet street in north Neukölln: Tempelhofer Feld 5 minutes on foot, the canal and Weserstraße\'s cafés around the corner.', kb: true, why: [{ text: 'From your Knowledge Hub · Transportation: Tempelhofer Feld is 5 minutes on foot, the canal and Weserstraße around the corner.', source: 'hub' }, { text: 'Remote workers ask where to take a break: 6 inbox questions in 90 days.', source: 'inbox' }] },
  { id: 't-b-photos', channel: 'booking', tab: 'essentials', field: 'photos', type: 'Photos', section: 'Essentials', title: 'Lead with the living room and its paintings',
    photos: { now: 'bedroom', next: 'living room' }, why: [{ text: 'City-break couples respond to the art: similar homes that open with the living room get 11% more clicks.', source: 'strategy' }, { text: '4 Booking.com guests asked if the paintings are in the flat.', source: 'inbox' }] },
  { id: 't-b-directions', channel: 'booking', tab: 'location', field: 'directions', type: 'Directions', section: 'Location', title: 'Say how to get in once you’re at the door',
    from: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes: the green door next to the bakery. From BER airport, 45 minutes by train (FEX, then S-Bahn to Neukölln).',
    to: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes: the green door next to the bakery. Enter your keypad code and take the stairs to the 4th floor. From BER airport, 45 minutes by train (FEX, then S-Bahn to Neukölln).', kb: true,
    why: [{ text: 'From your Knowledge Hub · Arrival: the green door next to the bakery; the keypad code works at any hour.', source: 'hub' }, { text: 'Booking.com guests asked for directions 3× more than Airbnb guests in the last 90 days (12 of 31 threads).', source: 'inbox' }, { text: 'Booking.com has no check-in method field, so its directions are where guests learn how to get in.', source: 'strategy' }] },
  { id: 't-d-name', channel: 'direct', tab: 'essentials', field: 'name', type: 'Property name', section: 'Essentials', title: 'Use your own brand on your site',
    from: B, to: 'The Artist\'s Flat · Neukölln', why: [{ text: 'On your own site there is no 50-character search limit and no competing listings.', source: 'strategy' }] },
  /* Coverage across every Listing tab, per channel (Antonio, 3 Oct: "several recommendations across all of the different
   * categories" and "how it would look when we have recommendations for the photos"). SIMULATED: every count, inbox
   * question and comparable-listing figure below is invented; every fact in a suggestion comes from this property's
   * own FIELDS / AMENITIES above (U7 Rathaus Neukölln, the green street door, the 22:00 door lock, Booking.com pets…).
   * Each tab keeps some long-text fields without a tip, so the Smartify icon still shows beside the tip markers.
   * Amenity tips use the field "amenity:<name>" (the Amenities editor's per-channel key) and write "on". */
  // Airbnb · remote workers
  // On a field that uses the Base: the tip is an Airbnb version, written for how Airbnb guests read it (in the app, at
  // the door, often late) — not a general fix that belongs on the Base (Antonio, 3 Oct: "just a replacement… more
  // customized for Airbnb"). The card shows only the new text and says it creates an Airbnb-only version.
  { id: 't-a-method', channel: 'airbnb', tab: 'arrival', field: 'method_details', type: 'Check-in method details', section: 'Arrival', title: 'Write Airbnb’s own check-in steps',
    from: 'Enter the code on the keypad by the green street door, then take the stairs to the 4th floor. The flat is the door on the left; the same code opens it. You get the code 24 hours before arrival.',
    to: 'Your code arrives in your Airbnb messages 24 hours before check-in. 1. Type it on the keypad by the green street door: it works at any hour, even after the door locks at 22:00. 2. Take the stairs to the 4th floor. 3. The same code opens the flat, door on the left.', kb: true,
    why: [{ text: 'From your Knowledge Hub · Arrival: a keypad on the street door, the code sent 24 hours before check-in.', source: 'hub' }, { text: '4 Airbnb guests on late flights asked whether the street door would be locked when they arrived.', source: 'inbox' }, { text: 'Airbnb guests open these steps in the app at the door, so where the code is and the 22:00 lock come first, step by step.', source: 'strategy' }] },
  { id: 't-a-manual', channel: 'airbnb', tab: 'arrival', field: 'manual', type: 'House manual', section: 'Arrival', title: 'Add where the dishwasher tablets are',
    from: '- Please take your shoes off inside.\n- The desk: USB-C and HDMI cables for the monitor are in the top drawer; the lamp dims with the dial.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.',
    to: '- Please take your shoes off inside.\n- The desk: USB-C and HDMI cables for the monitor are in the top drawer; the lamp dims with the dial.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.\n- The dishwasher tablets are under the sink.',
    why: [{ text: 'From your Knowledge Hub · Amenities: the dishwasher tablets are under the sink.', source: 'hub' }, { text: '3 Airbnb guests on week-long stays asked where the dishwasher tablets are.', source: 'inbox' }, { text: 'Your Base manual has the line; Airbnb’s own manual lost it when the desk was added.', source: 'strategy' }] },
  { id: 't-a-getting', channel: 'airbnb', tab: 'location', field: 'getting_around', type: 'Getting around', section: 'Location', title: 'Add the trip from BER airport',
    from: 'U7 at Rathaus Neukölln is 3 minutes on foot (Alexanderplatz in 15 minutes). Bus M41 to the main station. Bike share on every corner; street parking is free after 20:00.',
    to: 'U7 at Rathaus Neukölln is 3 minutes on foot (Alexanderplatz in 15 minutes). Bus M41 to the main station. From BER airport, 45 minutes by train: the FEX to Ostkreuz, then the S-Bahn to Neukölln. Bike share on every corner; street parking is free after 20:00.', kb: true,
    why: [{ text: 'From your Knowledge Hub · Transportation: from BER, the FEX to Ostkreuz, then the S-Bahn, about 45 minutes.', source: 'hub' }, { text: '7 of 26 Airbnb threads before arrival asked how to get here from the airport.', source: 'inbox' }, { text: 'Remote workers staying 4+ nights mostly fly in: 11 of 24 similar homes give the airport route.', source: 'strategy' }] },
  { id: 't-a-hairdryer', channel: 'airbnb', tab: 'amenities', field: 'amenity:Hair dryer', type: 'Amenities', section: 'Amenities', title: 'List the hair dryer on Airbnb',
    from: 'Not listed on Airbnb', to: 'on',
    why: [{ text: 'From your Knowledge Hub · Amenities: a hair dryer is in the bathroom cabinet.', source: 'hub' }, { text: '3 Airbnb guests asked whether there is a hair dryer.', source: 'inbox' }, { text: 'Booking.com already lists it, so the flat has one; Airbnb guests who filter for it don’t see your home.', source: 'strategy' }] },
  { id: 't-a-rules', channel: 'airbnb', tab: 'rules', field: 'house_rules', type: 'House rules', section: 'Rules', title: 'Say when quiet hours end, and the guest limit',
    from: 'Shoes off inside · quiet after 22:00 · no parties · no smoking, balcony included.', to: 'Shoes off inside · quiet hours 22:00–7:00 · no parties · no smoking, balcony included · up to 2 guests.',
    why: [{ text: '2 Airbnb guests asked if friends could come over in the evening, and until when.', source: 'inbox' }, { text: 'Your Base rules have the 7:00 end and the 2-guest limit; Airbnb’s own rules dropped both.', source: 'strategy' }] },
  // Booking.com · city-break couples
  { id: 't-b-interaction', channel: 'booking', tab: 'arrival', field: 'interaction', type: 'Interaction preferences', section: 'Arrival', title: 'Tell late arrivals they don’t need to wait for you',
    from: 'Check-in is self-service, but I live nearby and I’m happy to meet you. I reply to messages within an hour between 8:00 and 22:00.',
    to: 'Check-in is self-service, but I live nearby and I’m happy to meet you. Arriving after 22:00? No need to message ahead: your keypad code opens the street door at any hour. I reply to messages within an hour between 8:00 and 22:00.',
    why: [{ text: '9 of 31 Booking.com threads asked whether someone has to be there for a late check-in.', source: 'inbox' }, { text: 'City-break guests land on evening flights: 2 in 5 of your Booking.com arrivals are after 20:00.', source: 'strategy' }] },
  { id: 't-b-neigh', channel: 'booking', tab: 'location', field: 'neighbourhood', type: 'Neighbourhood', section: 'Location', title: 'Say how close the centre is',
    from: 'North Neukölln, one of Berlin’s liveliest corners: cafés and bakeries on Weserstraße, the Landwehr canal a short walk away and Tempelhofer Feld five minutes on foot.',
    to: 'North Neukölln, one of Berlin’s liveliest corners: cafés and bakeries on Weserstraße, the Landwehr canal a short walk away and Tempelhofer Feld five minutes on foot. Alexanderplatz is 15 minutes on the U7 from Rathaus Neukölln, 3 minutes from the door.', kb: true,
    why: [{ text: 'Booking.com city-break guests compare distance to the centre first: 11 of 18 similar homes nearby state it.', source: 'strategy' }, { text: '5 Booking.com guests asked how long it takes to get to the centre.', source: 'inbox' }] },
  { id: 't-b-selfcheckin', channel: 'booking', tab: 'amenities', field: 'amenity:Self check-in', type: 'Amenities', section: 'Amenities', title: 'List self check-in on Booking.com',
    from: 'Not listed on Booking.com', to: 'on',
    why: [{ text: 'From your Knowledge Hub · Arrival: guests let themselves in with the keypad; no one needs to meet them.', source: 'hub' }, { text: '7 of 31 Booking.com threads asked how late they can arrive.', source: 'inbox' }, { text: 'The keypad works the same for every guest, but only Airbnb and your site say so.', source: 'strategy' }] },
  { id: 't-b-rules', channel: 'booking', tab: 'rules', field: 'house_rules', type: 'House rules', section: 'Rules', title: 'Say pets are welcome, and where they can’t go',
    from: 'No parties or events. Quiet hours 22:00–7:00. Please don’t smoke inside or on the balcony. Maximum 2 guests.',
    to: 'No parties or events. Quiet hours 22:00–7:00. Please don’t smoke inside or on the balcony. Maximum 2 guests. Pets are welcome; please keep them off the bed and the sofa.',
    why: [{ text: '4 Booking.com guests asked before booking whether they could bring their dog.', source: 'inbox' }, { text: 'Pets are allowed on Booking.com only, but the rules guests read there don’t mention them.', source: 'strategy' }] },
  // Direct · your own site
  { id: 't-d-photos', channel: 'direct', tab: 'essentials', field: 'photos', type: 'Photos', section: 'Essentials', title: 'Open your site with the paintings',
    photos: { now: 'living room', next: 'paintings', nowKey: 'living1', nextKey: 'extra1',
      order: ['extra1', 'living1', 'desk', 'bedroom', 'kitchen', 'balcony', 'bathroom', 'living2', 'building', 'street', 'extra2'] },
    why: [{ text: 'Your site has no search grid to win: the cover can show what no other flat has.', source: 'strategy' }, { text: '4 Booking.com guests asked if the paintings are really in the flat; today they’re photo 10 here.', source: 'inbox' }] },
  { id: 't-d-manual', channel: 'direct', tab: 'arrival', field: 'manual', type: 'House manual', section: 'Arrival', title: 'Explain the desk on your site too',
    from: '- Please take your shoes off inside.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.\n- The dishwasher tablets are under the sink.',
    to: '- Please take your shoes off inside.\n- The desk: USB-C and HDMI cables for the monitor are in the top drawer; the lamp dims with the dial.\n- Recycling is in the courtyard: yellow bin for plastic, blue for paper.\n- The boiler switch is behind the kitchen door; hot water takes 2 minutes.\n- The dishwasher tablets are under the sink.', kb: true,
    why: [{ text: '2 guests asked how to connect a laptop to the monitor.', source: 'inbox' }, { text: 'Your Airbnb manual explains the desk; the Base, which your site uses, doesn’t.', source: 'strategy' }] },
  { id: 't-d-directions', channel: 'direct', tab: 'location', field: 'directions', type: 'Directions', section: 'Location', title: 'Name the green door next to the bakery',
    from: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes. From BER airport, the FEX to Ostkreuz then S-Bahn to Neukölln (45 minutes).',
    to: 'From Rathaus Neukölln (U7), take the Karl-Marx-Straße exit and walk 3 minutes: the green door next to the bakery. From BER airport, 45 minutes by train (FEX, then S-Bahn to Neukölln).',
    why: [{ text: 'From your Knowledge Hub · Arrival: the green door next to the bakery, 3 minutes from Rathaus Neukölln (U7).', source: 'hub' }, { text: 'Guests who booked direct asked “which door is it?” twice in 90 days.', source: 'inbox' }, { text: 'Your Booking.com directions already name the green door; your site still uses the shorter Base text.', source: 'strategy' }] },
  { id: 't-d-balcony', channel: 'direct', tab: 'amenities', field: 'amenity:Balcony', type: 'Amenities', section: 'Amenities', title: 'List the balcony on your site',
    from: 'Not listed on Direct', to: 'on',
    why: [{ text: 'Your house rules mention the balcony and Booking.com lists it, but your site doesn’t.', source: 'strategy' }, { text: '3 guests asked whether the balcony is big enough to sit out on.', source: 'inbox' }] },
  { id: 't-d-rules', channel: 'direct', tab: 'rules', field: 'house_rules', type: 'House rules', section: 'Rules', title: 'Point to the rental agreement',
    from: 'No parties or events. Quiet hours 22:00–7:00. Please don’t smoke inside or on the balcony. Maximum 2 guests.',
    to: 'No parties or events. Quiet hours 22:00–7:00. Please don’t smoke inside or on the balcony. Maximum 2 guests. Booking here means you accept the rental agreement, sent with your confirmation.',
    why: [{ text: 'No Airbnb or Booking.com terms sit behind a direct booking: your rules and agreement are the terms.', source: 'strategy' }, { text: '1 direct guest asked what happens if something breaks during the stay.', source: 'inbox' }] },
]
/* Tips were the scenario property's only at first (QA B01/B02); extended (Antonio, 1 Oct voice note) so every property
 * Smart Listings defaults to on for also has its own, generated SIMULATED tips (data/property-listing.ts
 * propertyTipsFor, grounded in that property's own seed data). The three "off" properties (data/portfolio.ts
 * SMART_LISTINGS_OFF) still get none, so their Tips panel shows the empty state and their tip dots and counts are 0.
 * data/property-listing.ts registers both rules, reading the property the shared listing definitions describe
 * (data/property-seeds.ts appliedProperty), so every caller of tipsFor (editor, Canvas, Tips panel, Review & push,
 * Smart Listings) follows the active property without knowing which kind of tips it's getting. */
let tipsInScope: () => boolean = () => true
let extraTips: () => TipDef[] = () => []
export const setTipScope = (fn: () => boolean) => { tipsInScope = fn }
/** Registers the active property's own generated tips (data/property-listing.ts), read whenever the scenario's fixed
 *  TIPS don't apply. */
export const setExtraTips = (fn: () => TipDef[]) => { extraTips = fn }
/** Tab order (Essentials → Rules), stable within a tab, so the Tips panel walks the editor's tabs once in order. */
const tabIdx = (t: TipDef) => LISTING_TABS.findIndex((x) => x.id === t.tab)
export const tipsFor = (ch: ListingChannel) => (tipsInScope() ? TIPS : extraTips()).filter((t) => t.channel === ch).sort((a, b) => tabIdx(a) - tabIdx(b))
/** Every tip the active property has (all channels): TIPS for the scenario property, its own generated set for every
 *  other property Smart Listings is on for, none for the three "off" ones. */
export const activeTips = () => (tipsInScope() ? TIPS : extraTips())

/* ---------- channel overview + smart listings ---------- */
/* CHANNEL_STATUS (static "18 photos" / "14 photos" lines) removed: the Channel overview derives what is specific to a channel (QA B18). */
export const AUTOPILOT_LOG: Array<{ channel: ListingChannel; icon: string; what: string; where: string; when: string; state: 'applied' | 'queued' }> = [
  { channel: 'airbnb', icon: 'file-text', what: 'Property name updated', where: 'Listing · Essentials', when: '2 Oct', state: 'applied' },
  { channel: 'airbnb', icon: 'photo', what: 'Desk photo moved to 3rd', where: 'Listing · Photos', when: '3 Oct', state: 'applied' },
  { channel: 'airbnb', icon: 'file-text', what: 'Summary rewritten', where: 'Listing · Essentials', when: 'in 23 h', state: 'queued' },
]
export const PERF: Record<'airbnb' | 'booking', { versions: Array<{ id: string; name: string; live: string; occ: number; adr: number; stay: number; revpar: number; current?: boolean }> }> = {
  airbnb: { versions: [
    { id: 'v2', name: 'Fill empty nights · Remote workers', live: '1 Oct – now', occ: 71, adr: 48, stay: 4.1, revpar: 34, current: true },
    { id: 'v1', name: 'Balance both · City-break couples', live: '1–30 Sep', occ: 62, adr: 52, stay: 2.6, revpar: 32 },
    { id: 'v0', name: 'Before Smart Listings', live: 'Aug', occ: 55, adr: 50, stay: 2.3, revpar: 28 },
  ] },
  booking: { versions: [
    { id: 'v1', name: 'Fill empty nights · City-break couples', live: '1 Oct – now', occ: 64, adr: 58, stay: 2.4, revpar: 37, current: true },
    { id: 'v0', name: 'Before Smart Listings', live: 'Sep', occ: 60, adr: 55, stay: 2.2, revpar: 33 },
  ] },
}
export const isListingChannel = (c: string | undefined): c is ListingChannel => c === 'airbnb' || c === 'booking' || c === 'direct'
export const chName = (c: ChannelId) => ({ airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct', vrbo: 'Vrbo', google: 'Google' } as Record<ChannelId, string>)[c]
