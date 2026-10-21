/* The scenario property: Beautiful Artist Apt. in Neukölln (concepts/SCENARIO.md, D-082 / D-086).
 * values where the trial has them (check-in 3:00 PM and checkout 2:00 PM HS-28, cleaning €25 HS-33,
 * €44 / €55 HS-30, Knowledge Hub items HS-42). The Booking.com twin and everything else are .
 * Import arithmetic (SCENARIO.md): 142 fields read → 116 identical · 1 per channel by design · 4 to decide ·
 * 1 channel-owned · 9 only on one · 11 empty. S10 and S11 read these seeds through the store; don't fork them. */
import { FIELD } from './canonical'
import type {
  ChannelId, Decision, Fact, FactStatus, Listing, Photo, QueuedReview, Question, Source, SourceKind, Suggestion, Version,
} from './types'

export const PROPERTY_ID = 'neukolln'
export const PROPERTY_NAME = 'Beautiful Artist Apt. in Neukölln'

const AIRBNB_AT = '2026-09-29T13:44:00+02:00'
const BOOKING_AT = '2026-09-29T13:46:00+02:00'
const HOST_AT = '2026-09-12T10:20:00+02:00'
const at = (k: SourceKind) => (k === 'booking' ? BOOKING_AT : k === 'airbnb' ? AIRBNB_AT : HOST_AT)
const S = (kind: SourceKind, detail?: string): Source => ({ kind, at: at(kind), detail })

type Seed = [fieldId: string, value: string | null, source: SourceKind, status?: FactStatus, extra?: Partial<Fact>]

/** One line per canonical field (CSV order). `null` = empty on both channels (a gap, asked as a question). */
const SEEDS: Seed[] = [
  ['identity.nickname', 'Artist Apt. Neukölln', 'host'],
  ['identity.property_type', 'Apartment', 'airbnb'],
  ['identity.place_type', 'Entire place', 'airbnb'],
  ['location.address', '12047 Berlin-Neukölln · street shown to guests after booking', 'airbnb'],
  ['location.coordinates', 'Pin set in Neukölln', 'airbnb'],
  ['location.area_highlights', 'Tempelhofer Feld 5 min on foot · Hermannplatz U-Bahn 1.2 km', 'booking'],
  ['location.licence_number', null, 'host', 'gap'],
  ['space.max_guests', '2', 'airbnb'],
  ['space.bedrooms', '1', 'airbnb', 'confirmed', { sync: { airbnb: 'channel-managed' } }],
  ['space.beds', '1 double bed', 'airbnb', 'confirmed', { sync: { airbnb: 'channel-managed' } }],
  ['space.bathrooms_full', '1 · shower', 'airbnb', 'confirmed', { sync: { airbnb: 'channel-managed' } }],
  ['space.bathrooms_half', '0', 'booking', 'only-one'],
  ['space.size', '48 m²', 'booking', 'only-one'],
  ['space.floor_and_access', '4th floor · no elevator', 'booking', 'only-one'],
  ['amenity.bathtub', 'No · shower only', 'airbnb'],
  ['amenity.wifi', 'Yes · speed not stated', 'airbnb'],
  ['amenity.kitchen', 'Yes', 'airbnb'],
  ['amenity.dishwasher', 'Yes', 'airbnb'],
  ['amenity.washer', 'Yes', 'airbnb'],
  ['amenity.dryer', 'No', 'airbnb'],
  ['amenity.air_conditioning', 'No', 'airbnb'],
  ['amenity.heating', 'Yes', 'airbnb'],
  ['amenity.pool', 'No', 'airbnb'],
  ['amenity.hot_tub', 'No', 'airbnb'],
  ['amenity.parking', 'Street parking', 'booking'],
  ['amenity.ev_charger', 'No', 'airbnb'],
  ['amenity.crib', 'On request', 'booking', 'only-one'],
  ['amenity.workspace', 'Yes · desk by the window', 'airbnb', 'only-one'],
  ['amenity.essentials', 'Yes', 'airbnb'],
  ['amenity.balcony', null, 'booking', 'unconfirmed', {
    observations: [{ source: S('booking'), value: 'Balcony' }, { source: S('airbnb'), value: 'not listed' }],
  }],
  ['amenity.self_checkin', 'Yes · keypad', 'airbnb'],
  ['safety.smoke_alarm', 'Yes', 'airbnb'],
  ['safety.co_alarm', 'Yes', 'airbnb'],
  ['safety.fire_extinguisher', 'Yes', 'airbnb'],
  ['safety.first_aid_kit', null, 'host', 'gap'],
  ['safety.cameras_disclosure', 'None', 'airbnb'],
  ['arrival.checkin_from', null, 'airbnb', 'conflict', {
    observations: [{ source: S('airbnb'), value: 'from 3:00 PM' }, { source: S('booking'), value: 'from 16:00' }],
  }],
  ['arrival.checkin_until', '22:00', 'booking', 'only-one'],
  ['arrival.checkout_time', '2:00 PM', 'airbnb'],
  ['arrival.checkin_method', 'Keypad', 'airbnb'],
  ['arrival.checkin_instructions', null, 'host', 'gap'],
  ['arrival.door_code', '•••• (guests get it 24 h before arrival)', 'host'],
  ['arrival.wifi_details', 'Network and password set', 'host'],
  ['arrival.directions', null, 'host', 'gap'],
  ['arrival.checkout_tasks', 'Strip the bed · take out the trash', 'airbnb'],
  ['rules.pets', 'Per channel', 'airbnb', 'confirmed', { // = Rules: pets allowed on Booking.com only (data/sl3.ts)
    overrides: {
      airbnb: { value: 'No', reason: 'kept at import', at: AIRBNB_AT },
      booking: { value: 'Yes', reason: 'kept at import', at: BOOKING_AT },
    },
  }],
  ['rules.smoking', 'No', 'airbnb'],
  ['rules.events', 'No', 'airbnb'],
  ['rules.quiet_hours', null, 'host', 'gap'],
  ['rules.children', 'Yes', 'booking', 'only-one'],
  ['rules.additional', 'Remove shoes indoors', 'airbnb'],
  ['policy.cancellation', 'Per channel', 'airbnb', 'confirmed', {
    overrides: {
      airbnb: { value: 'Moderate', reason: 'kept at import', at: AIRBNB_AT },
      booking: { value: 'Free cancellation until 5 days before', reason: 'kept at import', at: BOOKING_AT },
    },
  }],
  ['policy.cancellation_long_stay', 'Strict (28+ nights)', 'airbnb', 'only-one'],
  ['booking.instant_book', 'Instant on both', 'airbnb'],
  ['avail.min_stay', null, 'airbnb', 'conflict', {
    observations: [{ source: S('airbnb'), value: '2 nights' }, { source: S('booking'), value: '3 nights' }],
  }],
  ['avail.max_stay', '24 nights', 'airbnb'], // = Availability's Base (data/v3-ch.ts), QA B19
  ['avail.booking_window', '12 months', 'airbnb'],
  ['avail.advance_notice', 'Same day, until 18:00', 'airbnb'],
  ['avail.preparation_time', 'None', 'airbnb'],
  ['avail.restricted_days', 'None', 'airbnb'],
  ['price.base_nightly', '€44', 'host'],
  ['price.weekend', '€55', 'host'],
  ['price.dynamic_pricing', 'Off in Hostaway · Airbnb Smart Pricing on', 'airbnb'],
  ['price.min_max', null, 'host', 'gap'],
  ['price.channel_markup', '0% on both', 'host'],
  ['price.weekly_discount', '5% · 10% on Booking.com', 'airbnb'], // = Pricing: Base 5%, Booking.com 10% (data/v3-ch.ts)
  ['price.monthly_discount', '9% · 15% on Booking.com', 'airbnb'], // = Pricing: Base 9%, Booking.com 15% (data/v3-ch.ts)
  ['price.guests_included', '1', 'airbnb'], // = Pricing › Occupancy based
  ['fee.cleaning', null, 'airbnb', 'conflict', {
    observations: [{ source: S('airbnb'), value: '€25' }, { source: S('booking'), value: '€30' }],
  }],
  ['fee.cleaning_short_stay', '€15 · stays of 1–2 nights', 'airbnb', 'only-one', {
    sync: { booking: 'not-published' },
  }],
  ['fee.pet', 'Not charged', 'airbnb'],
  ['fee.extra_guest', '€10 per night after 1 guest', 'airbnb'], // = Pricing › Occupancy based (data/v3-ch.ts), audit GS-2
  ['fee.linens', 'Included', 'airbnb'],
  ['fee.resort_management_community', 'None', 'airbnb'],
  // = Pricing › Security deposit ("Leave my booking unsecured", screens/pricing/PricingPanels.tsx DepositPanel), audit GS-2
  ['deposit.collection', 'Not collected', 'airbnb'],
  ['deposit.amount', 'None · bookings are unsecured', 'airbnb'],
  ['tax.local', 'Berlin City Tax 7.5%', 'booking'],
  ['photo.library', '21 photos · 18 on Airbnb · 14 on Booking.com · 11 on both', 'airbnb'],
  ['photo.order', null, 'airbnb', 'conflict', {
    observations: [{ source: S('airbnb'), value: 'Cover: living room · painting wall' }, { source: S('booking'), value: 'Cover: bedroom' }],
  }],
  ['photo.caption', 'Captions on 6 Airbnb photos', 'airbnb'],
  ['photo.room', 'Assigned by Airbnb', 'airbnb', 'confirmed', { sync: { airbnb: 'channel-managed' } }],
  ['copy.title', 'Per channel', 'airbnb', 'confirmed', {
    overrides: {
      airbnb: { value: 'Beautiful Artist Apt. in Neukölln', reason: 'kept at import', at: AIRBNB_AT },
      booking: { value: 'Artist Apartment Neukölln · Balcony & Fast Wi-Fi', reason: 'kept at import', at: BOOKING_AT },
    },
  }],
  ['copy.description', 'Per channel', 'airbnb', 'confirmed', { sync: { booking: 'channel-managed' } }],
  ['copy.the_space', 'Airbnb section · 3 paragraphs', 'airbnb', 'only-one'],
  ['copy.guest_access', 'Airbnb section · the whole flat', 'airbnb', 'only-one'],
  ['copy.interaction', 'Airbnb section · “I live nearby and answer fast”', 'airbnb', 'only-one'],
  ['copy.neighbourhood', 'Airbnb section · Neukölln cafés and the canal', 'airbnb', 'only-one'],
  ['copy.getting_around', 'Airbnb section · U-Bahn and bikes', 'airbnb', 'only-one'],
  ['copy.other_notes', null, 'host', 'gap'],
  ['copy.highlighted_amenities', 'Wifi · Kitchen · Washer · Dishwasher · Heating · Dedicated workspace', 'airbnb'],
  ['copy.factual_baseline',
    'Two-room apartment of 48 m² on the 4th floor, no elevator, in Neukölln, Berlin. One bedroom with a double bed and one bathroom with a shower; sleeps 2. Kitchen with dishwasher, washer, heating, Wi-Fi and a dedicated workspace. Self check-in with a keypad; checkout by 2:00 PM. No pets, no smoking, no events. Tempelhofer Feld is 5 minutes on foot; Hermannplatz U-Bahn is 1.2 km away.',
    'ai', 'unconfirmed'],
  ['knowledge.house_manual', 'Heating, washer and dishwasher: how they work', 'host'],
  ['knowledge.trash_recycling', null, 'host', 'gap'],
  ['knowledge.host_contact', 'Phone and emergency contact set', 'host'],
  ['knowledge.guidebook', null, 'host', 'gap'],
  ['custom.stairs', '4th floor walk-up, no elevator', 'host'],
  ['custom.nearest_transit', 'U-Bahn Rathaus Neukölln, 3 min walk', 'host'],
  ['custom.shoes_off', 'Remove shoes indoors', 'host'],
  ['custom.bike_storage', 'Bike storage in the courtyard', 'host'],
]

const BOTH: ChannelId[] = ['airbnb', 'booking']

export function seedFacts(): Record<string, Fact> {
  const out: Record<string, Fact> = {}
  for (const [fieldId, value, kind, status = 'confirmed', extra = {}] of SEEDS) {
    const f = FIELD[fieldId]
    if (!f) continue // a renamed canonical row shouldn't crash the app; audit.mjs will flag the gap
    const sync: Fact['sync'] = {}
    for (const c of BOTH) {
      const r = f.reach[c]
      sync[c] = f.visibility !== 'public' || !r || r === '-' || r === 'N' ? 'not-published' : 'in-sync'
    }
    out[fieldId] = {
      fieldId,
      value,
      source: S(kind),
      observations: value ? [{ source: S(kind), value }] : [],
      overrides: {},
      status,
      ...extra,
      sync: { ...sync, ...(extra.sync ?? {}) },
    }
  }
  return out
}

/* ---------------- Needs you: what the system can't safely decide (C4 refined, D-123) ---------------- */
export function seedDecisions(): Decision[] {
  const p = `/property/${PROPERTY_ID}`
  return [
    {
      id: 'merge', kind: 'merge', group: 'setup', title: 'Merge into one property', meta: 'Same address · 11 of 14 photos match · same capacity',
      channels: BOTH, home: `${p}/overview`, recommended: 'yes', status: 'open',
      options: [
        { id: 'yes', label: 'Yes: one property, two listings', consequence: 'Calendar and prices are shared. Content stays as it is on each channel until you decide the differences.' },
        { id: 'no', label: 'No: keep them as two properties', consequence: 'Two calendars, two sets of facts. You can merge later.' },
      ],
    },
    {
      id: 'smart-pricing', kind: 'consequence', group: 'money', fieldId: 'price.dynamic_pricing', title: 'Smart Pricing turns off on Airbnb',
      meta: 'If Hostaway sets your nightly rate', channels: ['airbnb'], home: `${p}/pricing/rates`, status: 'open',
      options: [
        { id: 'hostaway', label: 'Hostaway sets €44 / €55 on both channels',
          consequence: 'Airbnb Smart Pricing turns off. Airbnb guests see €44 on weeknights from your first push.',
          queues: [{ channel: 'airbnb', label: 'Nightly rate', before: 'Smart Pricing', after: '€44 · weekends €55', fieldId: 'price.base_nightly' }] },
        { id: 'keep', label: 'Keep Airbnb Smart Pricing',
          consequence: 'Hostaway reads Airbnb’s price and won’t send one. Booking.com gets €44 / €55 from Hostaway.' },
      ],
    },
    {
      id: 'fee-cleaning', kind: 'conflict', group: 'money', fieldId: 'fee.cleaning', title: 'Cleaning fee differs',
      meta: '€25 Airbnb · €30 Booking.com', channels: BOTH, home: `${p}/pricing/fees-and-deposit`, recommended: 'keep', status: 'open',
      ruleLabel: 'Next time a fee differs like this, keep it per channel',
      options: [
        { id: 'a', label: '€25 on both', consequence: 'Booking.com guests pay €5 less per stay.',
          queues: [{ channel: 'booking', label: 'Cleaning fee', before: '€30', after: '€25' }] },
        { id: 'b', label: '€30 on both', consequence: 'Airbnb guests pay €5 more per stay.',
          queues: [{ channel: 'airbnb', label: 'Cleaning fee', before: '€25', after: '€30' }] },
        { id: 'keep', label: 'Keep per channel', consequence: 'Nothing changes on either channel. Common when pricing in Booking.com’s commission.' },
      ],
    },
    {
      id: 'min-stay', kind: 'conflict', group: 'rules', fieldId: 'avail.min_stay', title: 'Minimum stay differs',
      meta: '2 nights Airbnb · 3 nights Booking.com', channels: BOTH, home: `${p}/rules/stay-rules`, recommended: 'keep', status: 'open',
      ruleLabel: 'Next time a stay rule differs, keep it per channel',
      options: [
        { id: 'a', label: '2 nights on both', consequence: 'Booking.com accepts 2-night stays; more turnovers.',
          queues: [{ channel: 'booking', label: 'Minimum stay', before: '3 nights', after: '2 nights' }] },
        { id: 'b', label: '3 nights on both', consequence: 'Airbnb stops accepting 2-night stays.',
          queues: [{ channel: 'airbnb', label: 'Minimum stay', before: '2 nights', after: '3 nights' }] },
        { id: 'keep', label: 'Keep per channel', consequence: 'Nothing changes on either channel.' },
      ],
    },
    {
      id: 'checkin', kind: 'conflict', group: 'arrival', fieldId: 'arrival.checkin_from', title: 'Check-in differs',
      meta: 'from 3:00 PM Airbnb · from 16:00 Booking.com', channels: BOTH, home: `${p}/arrival/check-in-and-check-out`,
      recommended: 'a', status: 'open',
      options: [
        { id: 'a', label: 'From 3:00 PM on both', consequence: 'Booking.com guests can arrive an hour earlier. Your keypad makes that free.',
          queues: [{ channel: 'booking', label: 'Check-in from', before: '16:00', after: '15:00' }] },
        { id: 'b', label: 'From 4:00 PM on both', consequence: 'Airbnb guests arrive an hour later than today.',
          queues: [{ channel: 'airbnb', label: 'Check-in from', before: '3:00 PM', after: '4:00 PM' }] },
        { id: 'keep', label: 'Keep per channel', consequence: 'Nothing changes. Your assistant will answer per channel.' },
      ],
    },
    {
      id: 'photos', kind: 'conflict', group: 'photos', fieldId: 'photo.order', title: 'Covers differ · 3 photos only on Booking.com',
      meta: '18 Airbnb · 14 Booking.com · 11 on both', channels: BOTH, home: `${p}/home/photos`, recommended: 'keep', status: 'open',
      options: [
        { id: 'keep', label: 'Keep each channel’s order and cover', consequence: 'Nothing changes. All 21 photos are in one library.' },
        { id: 'cover', label: 'Use the living-room cover on both', consequence: 'Booking.com’s cover changes. Booking.com may still reorder (smart ordering).',
          queues: [{ channel: 'booking', label: 'Cover photo', before: 'Bedroom', after: 'Living room · painting wall' }] },
        { id: 'add', label: 'Add the 3 Booking.com-only photos to Airbnb', consequence: 'Airbnb shows 21 photos. Airbnb’s AI places them in rooms.',
          queues: [{ channel: 'airbnb', label: 'Photos', before: '18 photos', after: '21 photos', fieldId: 'photo.library' }] },
      ],
    },
    {
      id: 'baseline', kind: 'baseline', group: 'copy', fieldId: 'copy.factual_baseline', title: 'Check the facts in plain words',
      meta: 'Written from your facts, no adjectives · the base for every channel’s text', channels: [], home: `${p}/home/listing-text`,
      recommended: 'ok', status: 'open',
      options: [
        { id: 'ok', label: 'These facts are right', consequence: 'Nothing is sent anywhere. Channel text can now be written from it.' },
        { id: 'edit', label: 'Something is wrong', consequence: 'Fix the fact where it lives; the text updates.' },
      ],
    },
    {
      id: 'smart-listings', kind: 'opt-in', group: 'setup', title: 'Smart Listings',
      meta: 'Let Hostaway suggest titles, descriptions and photo order per channel', channels: BOTH, home: `${p}/overview`, status: 'open',
      options: [
        { id: 'on', label: 'Turn on Smart Listings', consequence: 'Suggestions appear in Listing text and Needs you. Nothing changes without you. Turn off any time.' },
        { id: 'off', label: 'Not now', consequence: 'Everything else works the same: the home, Listings, receipts.' },
      ],
    },
  ]
}

/** "Queued for your review · written: nothing" (replaces C4's "Decided for you", D-123). */
export const QUEUED_REVIEW: QueuedReview[] = [
  { id: 'q-amen-a', label: '7 Airbnb-only amenities stay on Airbnb', channels: ['airbnb'], why: 'Amenities merge; each channel keeps what it lists' },
  { id: 'q-amen-b', label: '2 Booking.com-only facilities stay on Booking.com', channels: ['booking'], why: 'Amenities merge; each channel keeps what it lists' },
  { id: 'q-name', label: 'Name kept per channel', channels: BOTH, why: 'Titles are per channel by design' },
  { id: 'q-desc', label: 'Description: Booking.com uses the Airbnb text', channels: ['booking'], why: 'It becomes the Base; write one for Booking.com any time' }, // v3 supersedes D-032 (QA B09 / B19)
  { id: 'q-identical', label: '116 facts identical on both', channels: BOTH, why: 'Nothing to decide' },
]

export function seedQuestions(): Question[] {
  return [
    { id: 'wifi-speed', fieldId: 'amenity.wifi', question: 'How fast is your Wi-Fi?', unit: 'Mbps', status: 'open',
      why: 'Your Airbnb description says “fast Wi-Fi”. I can keep that only if the home says how fast. Booking.com shows the speed too.' },
    { id: 'balcony', fieldId: 'amenity.balcony', channel: 'booking', question: 'Is there a balcony?', quick: ['Yes', 'No'], status: 'open',
      why: 'Booking.com lists one; Airbnb doesn’t. I won’t mention it anywhere until you confirm.' },
    { id: 'licence', fieldId: 'location.licence_number', question: 'What’s your Berlin registration number?', status: 'open',
      why: 'Berlin requires it on every listing. Airbnb and Booking.com both ask for it.' },
    { id: 'quiet-hours', fieldId: 'rules.quiet_hours', question: 'Do you have quiet hours?', quick: ['22:00–07:00', '23:00–08:00', 'No'], status: 'open',
      why: 'Guests ask. The assistant answers from this, and both channels show it.' },
    { id: 'first-aid', fieldId: 'safety.first_aid_kit', question: 'Is there a first aid kit?', quick: ['Yes', 'No'], status: 'open',
      why: 'A safety item both channels show. It’s empty on both today.' },
  ]
}

export function seedSuggestions(): Suggestion[] {
  return [
    {
      id: 'title-airbnb', channel: 'airbnb', target: 'title', fieldId: 'copy.title', status: 'proposed', confidence: 'High',
      current: 'Beautiful Artist Apt. in Neukölln', proposed: 'Artist’s Flat by Tempelhofer Feld · Neukölln',
      alternatives: ['Sunny Art-Filled Flat · Neukölln', 'Neukölln Art Flat with Workspace', 'Artist’s Flat near Tempelhofer Feld'],
      why: '17 of 24 similar Airbnb listings nearby name the neighbourhood and a landmark. Tempelhofer Feld is 5 minutes away.',
      uses: ['location.area_highlights', 'amenity.workspace'],
    },
    {
      id: 'highlights-airbnb', channel: 'airbnb', target: 'highlighted-amenities', fieldId: 'copy.highlighted_amenities',
      status: 'proposed', confidence: 'High', current: 'Dedicated workspace is 6th', proposed: 'Dedicated workspace moves to 2nd',
      why: '4 of your last 6 guests travelled for work; 2 of the top 5 comps lead with a desk.', uses: ['amenity.workspace'],
    },
    {
      id: 'cover-booking', channel: 'booking', target: 'photo-order', fieldId: 'photo.order', status: 'proposed', confidence: 'Medium',
      current: 'Cover: bedroom', proposed: 'Cover: living room · painting wall',
      why: 'The living-room cover beats bedroom covers on comps’ click-through. Booking.com may still reorder.', uses: ['photo.library'],
    },
  ]
}

/* ---------------- listings, photos, versions ---------------- */
const ROOMS: Array<[Photo['room'], number, string]> = [
  ['living', 6, 'Living room'], ['bedroom', 5, 'Bedroom'], ['kitchen', 4, 'Kitchen'], ['bathroom', 3, 'Bathroom'],
  ['balcony', 2, 'Balcony'], ['building', 1, 'Building & street'],
]

export function seedPhotos(): Photo[] {
  const out: Photo[] = []
  let i = 0
  for (const [room, n, label] of ROOMS) {
    for (let k = 1; k <= n; k++) {
      // 11 shared · 7 Airbnb-only · 3 Booking.com-only = 21 unique (SCENARIO.md)
      const channels: ChannelId[] = i < 11 ? ['airbnb', 'booking'] : i < 18 ? ['airbnb'] : ['booking']
      out.push({ id: `ph-${String(i + 1).padStart(2, '0')}`, tone: ((i % 5) + 1) as Photo['tone'], room,
        caption: k === 1 && room === 'living' ? 'Living room · painting wall' : `${label} ${k}`, channels,
        width: i === 20 ? 1024 : 2048, height: i === 20 ? 680 : 1365 })
      i++
    }
  }
  return out
}

export function seedListings(): Record<'airbnb' | 'booking', Listing> {
  const photos = seedPhotos()
  const on = (c: ChannelId) => photos.filter((p) => p.channels.includes(c)).map((p) => p.id)
  const bdc = on('booking')
  return {
    airbnb: {
      channel: 'airbnb', externalId: '9876543210', status: 'listed', title: 'Beautiful Artist Apt. in Neukölln',
      description: 'Sunny two-room flat full of original paintings, five minutes from Tempelhofer Feld. A dedicated workspace with fast Wi-Fi and a bright bedroom that looks onto the courtyard…',
      photoOrder: on('airbnb'), highlightedAmenities: ['amenity.wifi', 'amenity.kitchen', 'amenity.washer', 'amenity.dishwasher', 'amenity.heating', 'amenity.workspace'],
      lastPush: undefined,
    },
    booking: {
      channel: 'booking', externalId: '12345678', status: 'listed', title: 'Artist Apartment Neukölln · Balcony & Fast Wi-Fi',
      description: 'Free Wi-Fi. Non-smoking. 1.2 km from Hermannplatz U-Bahn…', descriptionOwnedByChannel: true,
      photoOrder: [bdc[5], ...bdc.filter((_, j) => j !== 5)], highlightedAmenities: [], pageScore: 72,
    },
  }
}

export function seedVersions(): Version[] {
  const l = seedListings()
  return [
    { id: 'v0-airbnb', channel: 'airbnb', n: 0, at: AIRBNB_AT, by: 'import', note: 'As imported from Airbnb', title: l.airbnb.title, description: l.airbnb.description, photoOrder: l.airbnb.photoOrder, highlightedAmenities: l.airbnb.highlightedAmenities },
    { id: 'v0-booking', channel: 'booking', n: 0, at: BOOKING_AT, by: 'import', note: 'As imported from Booking.com', title: l.booking.title, description: l.booking.description, photoOrder: l.booking.photoOrder, highlightedAmenities: l.booking.highlightedAmenities },
  ]
}

/** Import arithmetic (SCENARIO.md), for S10's "what we found". */
export const IMPORT_COUNTS = { read: 142, identical: 116, perChannelByDesign: 1, toDecide: 4, channelOwned: 1, onlyOne: 9, empty: 11 }
