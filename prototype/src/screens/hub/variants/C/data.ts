/* KH-C · Guest questions first (concepts/knowledge-hub/KH-C.md). The Hub organised by what guests ask.
 * scenario: 48 guest questions clustered from 312 conversations, 7 gaps. Every answer is built from the Hub's
 * facts (data/sl3.ts FIELDS, data/v3-ch.ts PRICES · AVAILABILITY, live Booking policies, data/v3-kh.ts custom facts), so a fact
 * edit changes every answer that uses it. Store keys are the Hub's: FIELDS keys · `price:` · `avail:` · `amenity:` · `kh.`. */
import type { ListingChannel } from '../../../../data/sl3'
import { hubChannels } from '../../perProperty'
import { KH_CUSTOM, type KhItem } from '../../../../data/v3-kh'
import type { PolicyCardDef } from '../../../../data/v3-ch'

export type Cov = 'a' | 'p' | 'n'
export type StageId = 'before' | 'pricing' | 'arrival' | 'stay' | 'checkout' | 'area'
export type TabId = 'overview' | StageId | 'az'

export const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'before', label: 'Before booking' },
  { id: 'pricing', label: 'Booking & pricing' },
  { id: 'arrival', label: 'Arrival' },
  { id: 'stay', label: 'During the stay' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'area', label: 'The area' },
  { id: 'az', label: 'Everything A–Z' },
]
export const STAGES = TABS.filter((t) => t.id !== 'overview' && t.id !== 'az') as Array<{ id: StageId; label: string }>
/** "7 questions guests ask about arriving". */
export const STAGE_HEAD: Record<StageId, string> = {
  before: 'guests ask before they book',
  pricing: 'guests ask about booking and prices',
  arrival: 'guests ask about arriving',
  stay: 'guests ask during the stay',
  checkout: 'guests ask about checking out',
  area: 'guests ask about the area',
}
export const isTab = (t: string | null): t is TabId => !!t && TABS.some((x) => x.id === t)

/* ---------- reading the Hub (implemented in model.ts from the store) ---------- */
export interface Reader {
  /** The value a guest on this channel gets, formatted ('' when the channel doesn't have the fact). */
  v: (key: string, c: ListingChannel) => string
  /** The value a guest on this channel gets, unformatted (checkout tasks keep their details). */
  raw: (key: string, c: ListingChannel) => string
  /** The Base value, formatted. */
  b: (key: string) => string
  /** A channel's cancellation cards, live from the Booking policies flow (store `policies`). */
  cancel: (c: ListingChannel) => PolicyCardDef[]
  /** The raw number behind a price or count. */
  n: (key: string, c: ListingChannel) => number
  /** The channel has the fact, or lists the amenity. */
  on: (key: string, c: ListingChannel) => boolean
}
export interface Answer { text: string[]; only?: { c: ListingChannel; text: string } }

/** A fact behind an answer: one or more Hub keys shown as one small row ("Check-in from · until"). */
export interface FactRef { keys: string[]; label?: string; mask?: string[]; fmt?: (v: string[]) => string }
export interface Question {
  /** How many guest conversations asked it (the scenario's message history). Absent for a property's standard questions. */
  id: string; stage: StageId; q: string; asked?: number; cov: Cov
  facts: FactRef[]
  /** Provenance: Hub groups and sources the answer used ("From: Arrival · House rules · Message history"). */
  from: string[]
  answer: (r: Reader, c: ListingChannel) => Answer
  /** The collapsed line when it differs from the answer (channel differences, or what the AI is missing). */
  line?: (r: Reader) => string
  /** Coverage that depends on the facts (the hair dryer is only partly answered while one channel lists it). */
  covFn?: (r: Reader) => Cov
  gap?: string
  /** Words a guest might use (the ask box matches on them). */
  kw?: string
}

/** The active property's channels, read at call time (Neukölln: all three, as before). */
const ALL = (): ListingChannel[] => hubChannels()
export const NAME: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'your site' }
export const f = (...keys: string[]): FactRef => ({ keys })
export const one = (text: string): Answer => ({ text: [text] })
export const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
export const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
export const tasksOf = (v: string) => v.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0])
export const sentences = (s: string) => s.match(/[^.!?]+[.!?]+/g)?.map((x) => x.trim()) ?? [s]
/** "3 nights. On Airbnb it’s 2 nights." from a Base value and each channel's own. */
export const exceptions = (r: Reader, key: string, unit = (v: string) => v) => {
  const base = r.b(key)
  const own = ALL().filter((c) => r.v(key, c) && r.v(key, c) !== base)
  const head = unit(base)
  return `${head.charAt(0).toUpperCase()}${head.slice(1)}.${own.map((c) => ` On ${NAME[c]} it’s ${unit(r.v(key, c))}.`).join('')}`
}
const floorLine = (v: string) => `The flat is on the ${v.replace(/,\s*no elevator/i, ' and there’s no elevator')}.`

/* ---------- a week in October: 12 Oct 2026 is a Monday → 5 weeknights + Friday and Saturday ---------- */
export function weekPrice(r: Reader, c: ListingChannel) {
  const up = 1 + r.n('price:markup', c) / 100
  const night = r.n('price:nightly', c) * up
  const weekend = r.n('price:weekend', c) * up
  const off = r.n('price:weekly', c)
  const clean = r.n('price:cleaning', c)
  const total = Math.round((5 * night + 2 * weekend) * (1 - off / 100) + clean)
  return { total, night: Math.round(night), weekend: Math.round(weekend), off, clean }
}

/* ---------- the 48 questions (clustered from 312 guest conversations) ---------- */
export const QUESTIONS: Question[] = [
  // ── Before booking · 7 ──
  { id: 'b-work', stage: 'before', q: 'Is the flat good for working remotely?', asked: 22, cov: 'a', kw: 'work remote desk laptop office workspace wifi internet fast',
    facts: [f('amenity:Dedicated workspace'), f('amenity:Monitor 27"'), f('space')], from: ['Descriptions', 'Amenities', 'Message history'],
    answer: (r, c) => one(`Yes: ${r.on('amenity:Dedicated workspace', c) ? 'there’s a dedicated workspace' : 'there’s a desk'} by the window, fast Wi-Fi, and the bedroom faces the quiet courtyard.`) },
  { id: 'b-guests', stage: 'before', q: 'How many guests can stay?', asked: 17, cov: 'a', kw: 'how many people guests sleep beds capacity',
    facts: [f('price:max'), f('kh.bedrooms')], from: ['Property', 'Pricing'],
    answer: (r, c) => one(`Up to ${r.v('price:max', c)}. Where you sleep: ${r.v('kh.bedrooms', c).replace(/ · /g, ', ')}.`) },
  { id: 'b-whole', stage: 'before', q: 'Do we get the whole flat?', asked: 9, cov: 'a', kw: 'whole flat entire place private room shared',
    facts: [f('room'), f('type'), f('kh.size'), f('access')], from: ['Property', 'Arrival'],
    answer: (r, c) => one(`Yes: it’s an ${lower(r.v('room', c))} (${lower(r.v('type', c))}, ${r.b('kh.size')}). ${sentences(r.v('access', c))[0]}`) },
  { id: 'b-pets', stage: 'before', q: 'Are pets allowed?', asked: 8, cov: 'a', kw: 'pets dog cat animals',
    facts: [f('pets'), f('price:pet')], from: ['House rules', 'Pricing'],
    answer: (r, c) => one(r.v('pets', c) === 'Allowed' ? `Yes, pets are welcome. There’s a pet fee of ${r.v('price:pet', c)} per stay.` : 'Sorry, pets aren’t allowed. Assistance animals are always welcome.'),
    line: (r) => { const yes = ALL().filter((c) => r.v('pets', c) === 'Allowed'); return yes.length === ALL().length ? 'Yes, on every channel.' : yes.length ? `Only on ${list(yes.map((c) => NAME[c]))}; assistance animals are always welcome.` : 'No; assistance animals are always welcome.' } },
  { id: 'b-quiet', stage: 'before', q: 'Is it quiet at night?', asked: 7, cov: 'a', kw: 'quiet noise noisy night sleep',
    facts: [f('space'), f('house_rules')], from: ['Descriptions', 'House rules'],
    answer: () => one('Yes: the bedroom faces the quiet courtyard, and quiet hours in the building are 22:00–7:00.') },
  { id: 'b-washer', stage: 'before', q: 'Is there a washing machine?', asked: 6, cov: 'a', kw: 'washing machine washer laundry clothes',
    facts: [f('amenity:Washer')], from: ['Amenities'],
    answer: (r, c) => one(r.on('amenity:Washer', c) ? 'Yes, there’s a washing machine in the bathroom.' : 'I can’t see a washing machine in this listing, so I’ll check with your host.') },
  { id: 'b-kids', stage: 'before', q: 'Can we bring children?', asked: 4, cov: 'a', kw: 'children kids baby infant family',
    facts: [f('children'), f('infants')], from: ['House rules'],
    answer: (r, c) => one(r.v('children', c) === 'Allowed' ? `Yes, children are welcome${r.v('infants', c) === 'Allowed' ? ', and so are infants' : ''}.` : 'Sorry, the flat isn’t set up for children.') },

  // ── Booking & pricing · 9 ──
  { id: 'p-week', stage: 'pricing', q: 'How much is a week in October?', asked: 14, cov: 'a', kw: 'how much price cost week october total rate per night',
    facts: [{ keys: ['price:nightly', 'price:weekend'], label: 'Nightly rate · Weekend rate', fmt: (v) => `${v[0]} · ${v[1]} (Fri and Sat)` }, f('price:markup'), f('price:cleaning'), f('price:weekly')],
    from: ['Pricing', 'Calendar'],
    answer: (r, c) => { const p = weekPrice(r, c); return { text: [`7 nights from 12 Oct come to €${p.total}, cleaning included.`, `That’s 5 weeknights at €${p.night} and 2 weekend nights at €${p.weekend}${p.off ? `, ${p.off}% off for the week` : ''}, plus a €${p.clean} cleaning fee.`] } },
    line: (r) => `7 nights from 12 Oct: €${weekPrice(r, 'airbnb').total} on Airbnb, €${weekPrice(r, 'booking').total} on Booking.com, €${weekPrice(r, 'direct').total} on your site.` },
  { id: 'p-min', stage: 'pricing', q: 'What’s the minimum stay?', asked: 11, cov: 'a', kw: 'minimum stay nights shortest how long one night',
    facts: [f('avail:min_stay')], from: ['Availability'],
    answer: (r, c) => one(`The minimum stay is ${r.v('avail:min_stay', c)}.`), line: (r) => exceptions(r, 'avail:min_stay') },
  { id: 'p-cancel', stage: 'pricing', q: 'What’s your cancellation policy?', asked: 8, cov: 'a', kw: 'cancel cancellation refund policy',
    facts: [f('policy:cancel')], from: ['Booking policies'],
    answer: (r, c) => { const k = r.cancel(c)[0]; return one(`${k.title}: ${k.body}`) },
    line: () => 'It depends on where you booked; the AI quotes that channel’s terms.' },
  { id: 'p-clean', stage: 'pricing', q: 'How much is the cleaning fee?', asked: 7, cov: 'a', kw: 'cleaning fee extra fees charges',
    facts: [f('price:cleaning'), f('price:short_clean')], from: ['Pricing'],
    answer: (r, c) => one(`The cleaning fee is ${r.v('price:cleaning', c)} per stay${r.on('price:short_clean', c) ? `, or ${r.v('price:short_clean', c)} for stays of 1–2 nights` : ''}.`),
    line: (r) => exceptions(r, 'price:cleaning', (v) => `${v} per stay`) },
  { id: 'p-tax', stage: 'pricing', q: 'Is the Berlin city tax included in the price?', asked: 6, cov: 'n', gap: 'g-tax', kw: 'city tax tourist tax included taxes',
    facts: [f('price:nightly')], from: ['Pricing', 'Message history'],
    answer: () => one('I’m not sure whether the city tax is included, so I’ll check with your host and get back to you.'), line: () => 'The AI doesn’t know yet.' },
  { id: 'p-discount', stage: 'pricing', q: 'Is there a discount for longer stays?', asked: 5, cov: 'a', kw: 'discount longer stay weekly monthly cheaper deal',
    facts: [f('price:weekly'), f('price:monthly')], from: ['Pricing'],
    answer: (r, c) => one(`Yes: ${r.v('price:weekly', c)} off for a week or more, and ${r.v('price:monthly', c)} off for 28 nights or more.${c === 'booking' ? ' Booking.com may add its own Genius discount.' : ''}`) },
  { id: 'p-guest5', stage: 'pricing', q: 'Can we bring a 5th guest?', asked: 4, cov: 'a', kw: 'extra guest fifth 5th person more people',
    facts: [f('price:max')], from: ['Pricing'],
    answer: (r, c) => one(`The flat sleeps up to ${r.v('price:max', c)}.`) },
  { id: 'p-extra', stage: 'pricing', q: 'Is there a fee per extra guest?', asked: 3, cov: 'a', kw: 'extra guest fee per person',
    facts: [f('price:included'), f('price:extra')], from: ['Pricing'],
    answer: (r, c) => one(`The price includes ${r.v('price:included', c)}; each extra guest is ${r.v('price:extra', c)} a night.`) },
  { id: 'p-tomorrow', stage: 'pricing', q: 'Can I book for tomorrow?', asked: 3, cov: 'a', kw: 'book tomorrow today last minute same day notice',
    facts: [f('avail:advance')], from: ['Availability'],
    answer: (r, c) => one(r.v('avail:advance', c) === 'None' ? 'Yes, you can book for today or tomorrow if the dates are free.' : `Bookings need ${r.v('avail:advance', c)}’s notice.`),
    line: (r) => exceptions(r, 'avail:advance', (v) => (v === 'None' ? 'same-day bookings are fine' : `${v}’s notice`)) },

  // ── Arrival · 7 ──
  { id: 'a-instr', stage: 'arrival', q: 'Can you send me the check-in instructions?', asked: 31, cov: 'a', kw: 'check-in instructions how do i get in arrive arrival directions door',
    facts: [{ keys: ['checkin', 'checkin_end'], label: 'Check-in from · until' }, f('method'), f('method_details'), f('kh.floor'), { keys: ['wifi_name', 'wifi_password'], label: 'Wifi name · password', mask: ['wifi_password'] }, f('checkout_tasks')],
    from: ['Arrival', 'House rules', 'Message history'],
    answer: (r, c) => {
      const tasks = tasksOf(r.raw('checkout_tasks', 'airbnb')).map((t) => lower(t[0]))
      const details = r.v('method_details', c)
      const fl = r.v('kh.floor', c)
      const floor = details.toLowerCase().includes(fl.split(',')[0].trim().toLowerCase()) && /no elevator/i.test(fl) ? 'There’s no elevator.' : floorLine(fl)
      return {
        text: [`Check-in is from ${r.v('checkin', c)} until ${r.v('checkin_end', c)}, with a ${lower(r.v('method', c))}. ${details} ${floor} The Wi-Fi is ${r.v('wifi_name', c)}, and the password is in your arrival message.`],
        only: c === 'airbnb' && tasks.length ? { c: 'airbnb', text: `Before you leave: ${list(tasks)}.` } : undefined,
      }
    },
    line: (r) => `Check-in from ${r.b('checkin')}, ${lower(r.b('method'))}, 4th floor, Wi-Fi; Airbnb guests also get the checkout tasks.` },
  { id: 'a-time', stage: 'arrival', q: 'What time is check-in?', asked: 26, cov: 'a', kw: 'what time check-in arrive when',
    facts: [{ keys: ['checkin', 'checkin_end'], label: 'Check-in from · until' }], from: ['House rules'],
    answer: (r, c) => one(`Check-in is from ${r.v('checkin', c)} until ${r.v('checkin_end', c)}.`) },
  { id: 'a-wifi', stage: 'arrival', q: 'Could you send me the Wi-Fi name and password?', asked: 18, cov: 'a', kw: 'wifi wi-fi internet password network',
    facts: [{ keys: ['wifi_name', 'wifi_password'], label: 'Wifi name · password', mask: ['wifi_password'] }], from: ['Arrival'],
    answer: (r, c) => one(`The Wi-Fi is ${r.v('wifi_name', c)}; the password is in your arrival message.`) },
  { id: 'a-code', stage: 'arrival', q: 'What’s the door code?', asked: 12, cov: 'a', kw: 'door code keypad code pin key',
    facts: [f('method'), f('method_details')], from: ['Arrival'],
    answer: () => one('Your door code comes in your arrival message, 24 hours before check-in.'),
    line: () => 'Sent 24 hours before arrival, never earlier (sensitive).' },
  { id: 'a-early', stage: 'arrival', q: 'Can I check in early or leave my bags before 3 PM?', asked: 7, cov: 'p', gap: 'g-early', kw: 'early check-in bags luggage before drop',
    facts: [f('checkin'), f('kh.luggage')], from: ['House rules', 'Custom facts'],
    answer: (r, c) => one(`Check-in starts at ${r.v('checkin', c)}. ${r.v('kh.luggage', c)} I’ll ask review whether you can check in earlier.`),
    line: () => 'The AI knows bags can wait next door, but not whether early check-in is possible.' },
  { id: 'a-elevator', stage: 'arrival', q: 'Is there an elevator?', asked: 6, cov: 'a', kw: 'elevator lift stairs floor',
    facts: [f('kh.floor')], from: ['Arrival'],
    answer: (r, c) => one(`${/no elevator/i.test(r.v('kh.floor', c)) ? 'No. ' : ''}${floorLine(r.v('kh.floor', c))}`) },
  { id: 'a-late', stage: 'arrival', q: 'What if I arrive after 10 PM?', asked: 5, cov: 'a', kw: 'late arrival night after 10 midnight',
    facts: [f('checkin_end'), f('other')], from: ['House rules', 'Descriptions'],
    answer: () => one('The street door locks at 22:00; your keypad code opens it at any time.') },

  // ── During the stay · 11 ──
  { id: 's-heat', stage: 'stay', q: 'How does the hot water work?', asked: 9, cov: 'a', kw: 'hot water boiler shower heating warm',
    facts: [f('manual')], from: ['Arrival'],
    answer: (r, c) => one((r.v('manual', c).split('\n').find((l) => /boiler|hot water/i.test(l)) ?? '- The boiler switch is behind the kitchen door.').replace(/^-\s*/, '')) },
  { id: 's-trash', stage: 'stay', q: 'Where does the rubbish go?', asked: 8, cov: 'a', kw: 'rubbish trash garbage recycling bins',
    facts: [f('kh.trash')], from: ['Custom facts'], answer: (r, c) => one(r.v('kh.trash', c)) },
  { id: 's-kitchen', stage: 'stay', q: 'Is the kitchen equipped for cooking?', asked: 7, cov: 'a', kw: 'kitchen cook cooking pots stove oven',
    facts: [f('amenity:Kitchen'), f('amenity:Coffee maker'), f('description')], from: ['Amenities', 'Descriptions'],
    answer: () => one('Yes: the kitchen is fully equipped for longer stays.') },
  { id: 's-smoke', stage: 'stay', q: 'Can I smoke on the balcony?', asked: 6, cov: 'a', kw: 'smoke smoking cigarette balcony',
    facts: [f('smoking'), f('house_rules')], from: ['House rules'],
    answer: () => one('Sorry, there’s no smoking inside or on the balcony.') },
  { id: 's-contact', stage: 'stay', q: 'How can I reach you during the stay?', asked: 6, cov: 'a', kw: 'contact reach phone call emergency message host',
    facts: [f('kh.contact'), f('interaction')], from: ['Custom facts', 'Arrival'], answer: (r, c) => one(r.v('kh.contact', c)) },
  { id: 's-hair', stage: 'stay', q: 'Is there a hair dryer?', asked: 5, cov: 'p', gap: 'g-hair', kw: 'hair dryer hairdryer',
    facts: [f('amenity:Hair dryer')], from: ['Amenities', 'Message history'],
    answer: (r, c) => one(r.on('amenity:Hair dryer', c) ? 'Yes, there’s a hair dryer in the bathroom.' : 'I can’t see a hair dryer in this listing, so I’ll check with your host.'),
    covFn: (r) => (ALL().every((c) => r.on('amenity:Hair dryer', c)) ? 'a' : 'p'),
    line: (r) => { const on = ALL().filter((c) => r.on('amenity:Hair dryer', c)); return on.length === ALL().length ? 'Yes, there’s a hair dryer in the bathroom.' : `Listed on ${list(on.map((c) => NAME[c]))} only, so other guests get no answer.` } },
  { id: 's-broken', stage: 'stay', q: 'Something broke. What should I do?', asked: 5, cov: 'a', kw: 'broken broke damage repair fix',
    facts: [f('kh.damage')], from: ['Custom facts'], answer: (r, c) => one(r.v('kh.damage', c)) },
  { id: 's-friends', stage: 'stay', q: 'Can I have friends over?', asked: 4, cov: 'a', kw: 'friends visitors party guests over',
    facts: [f('events'), f('house_rules')], from: ['House rules'],
    answer: () => one('No parties or events, please, and quiet hours are 22:00–7:00.') },
  { id: 's-dish', stage: 'stay', q: 'Is there a dishwasher?', asked: 4, cov: 'a', kw: 'dishwasher dishes tablets',
    facts: [f('amenity:Dishwasher'), f('manual')], from: ['Amenities', 'Arrival'],
    answer: (r, c) => one(r.on('amenity:Dishwasher', c) ? 'Yes, and the dishwasher tablets are under the sink.' : 'I can’t see a dishwasher in this listing, so I’ll check with your host.') },
  { id: 's-clean', stage: 'stay', q: 'Can someone clean during a longer stay?', asked: 3, cov: 'n', gap: 'g-clean', kw: 'clean cleaning during stay towels linen fresh',
    facts: [f('price:cleaning')], from: ['Message history'],
    answer: () => one('I’ll check with your host about cleaning during your stay and get back to you.'), line: () => 'The AI doesn’t know yet.' },
  { id: 's-bike', stage: 'stay', q: 'Where can I leave my bike?', asked: 3, cov: 'a', kw: 'bike bicycle lock park bike',
    facts: [f('kh.bikes'), f('amenity:Bike racks (shared)')], from: ['Custom facts', 'Amenities'], answer: (r, c) => one(sentences(r.v('kh.bikes', c))[0]) },

  // ── Checkout · 5 ──
  { id: 'c-time', stage: 'checkout', q: 'What time is checkout?', asked: 19, cov: 'a', kw: 'checkout time leave when check out',
    facts: [f('checkout')], from: ['House rules'], answer: (r, c) => one(`Checkout is at ${r.v('checkout', c)}.`) },
  { id: 'c-tasks', stage: 'checkout', q: 'What should I do before I leave?', asked: 11, cov: 'a', kw: 'before leave checkout tasks towels rubbish keys',
    facts: [f('checkout_tasks'), f('checkout')], from: ['Arrival', 'House rules'],
    answer: (r, c) => {
      const tasks = tasksOf(r.raw('checkout_tasks', 'airbnb')).map((t) => (t[1] ? `${lower(t[0])} (${lower(t[1])})` : lower(t[0])))
      return { text: [`Checkout is at ${r.v('checkout', c)}.`], only: c === 'airbnb' && tasks.length ? { c: 'airbnb', text: `Before you leave: ${list(tasks)}.` } : undefined }
    },
    line: () => 'Airbnb guests get the checkout tasks; other guests get the checkout time.' },
  { id: 'c-late', stage: 'checkout', q: 'Can I check out late?', asked: 8, cov: 'a', kw: 'late checkout later stay longer',
    facts: [f('kh.late_checkout'), f('checkout')], from: ['Custom facts', 'Message history'], answer: (r, c) => one(r.v('kh.late_checkout', c)) },
  { id: 'c-keys', stage: 'checkout', q: 'Where do I leave the keys?', asked: 5, cov: 'a', kw: 'keys leave key return',
    facts: [f('method')], from: ['Arrival'],
    answer: (r, c) => one(r.v('method', c) === 'Keypad' ? 'There are no keys: the keypad code opens the door, so just pull it shut behind you.' : 'Leave the keys where you found them when you arrived.') },
  { id: 'c-bags', stage: 'checkout', q: 'Can I leave my luggage after checkout?', asked: 4, cov: 'a', kw: 'luggage bags after checkout store',
    facts: [f('kh.luggage')], from: ['Custom facts'], answer: (r, c) => one(r.v('kh.luggage', c)) },

  // ── The area · 9 ──
  { id: 'ar-airport', stage: 'area', q: 'How do I get there from the airport?', asked: 16, cov: 'a', kw: 'airport ber train how to get there directions',
    facts: [f('directions')], from: ['Location'],
    answer: (r, c) => one(sentences(r.v('directions', c)).find((s) => /BER|airport/i.test(s)) ?? r.v('directions', c)) },
  { id: 'ar-ubahn', stage: 'area', q: 'What’s the nearest U-Bahn?', asked: 12, cov: 'a', kw: 'u-bahn metro subway train station public transport',
    facts: [f('getting_around')], from: ['Location'], answer: (r, c) => one(sentences(r.v('getting_around', c))[0]) },
  { id: 'ar-parking', stage: 'area', q: 'Is there free parking?', asked: 9, cov: 'n', gap: 'g-parking', kw: 'parking park car free parking garage',
    facts: [f('getting_around')], from: ['Location', 'Message history'],
    answer: () => one('I’m not sure about parking, so I’ll check with your host and get back to you.'), line: () => 'The AI doesn’t know yet.' },
  { id: 'ar-neigh', stage: 'area', q: 'What’s the neighbourhood like?', asked: 8, cov: 'a', kw: 'neighbourhood neighborhood area like vibe',
    facts: [f('neighbourhood')], from: ['Location'], answer: (r, c) => one(r.v('neighbourhood', c)) },
  { id: 'ar-cafes', stage: 'area', q: 'Any good cafés to work from?', asked: 6, cov: 'a', kw: 'cafe cafes coffee work from',
    facts: [f('neighbourhood'), f('interaction')], from: ['Location', 'Neukölln guide.pdf'],
    answer: () => one('Weserstraße, around the corner, is full of cafés; review's Neukölln guide lists his favourite quiet ones to work from.') },
  { id: 'ar-feld', stage: 'area', q: 'How far is Tempelhofer Feld?', asked: 4, cov: 'a', kw: 'tempelhofer feld park how far',
    facts: [f('neighbourhood'), f('description')], from: ['Location', 'Descriptions'], answer: () => one('Five minutes on foot.') },
  { id: 'ar-sunday', stage: 'area', q: 'Which supermarket is open on Sunday?', asked: 4, cov: 'n', gap: 'g-sunday', kw: 'supermarket sunday shop groceries food open',
    facts: [f('neighbourhood')], from: ['Message history'],
    answer: () => one('I’m not sure what’s open on Sunday, so I’ll check with your host.'), line: () => 'The AI doesn’t know yet.' },
  { id: 'ar-late', stage: 'area', q: 'Where can we eat late in the evening?', asked: 3, cov: 'p', gap: 'g-late', kw: 'eat late dinner restaurant evening food night',
    facts: [f('neighbourhood')], from: ['Location', 'Neukölln guide.pdf'],
    answer: () => one('Weserstraße has plenty of cafés and bars, but I’m not sure what’s open late. I’ll check with your host.'),
    line: () => 'The AI knows the street, but not what’s open late.' },
  { id: 'ar-bike', stage: 'area', q: 'Can I rent a bike nearby?', asked: 3, cov: 'a', kw: 'rent bike bicycle hire nextbike',
    facts: [f('getting_around'), f('kh.bikes')], from: ['Location', 'Custom facts'],
    answer: (r, c) => one(`Yes: ${sentences(r.v('kh.bikes', c))[1] ?? 'bike share is on every corner.'}`) },
]
export const questionById = (id: string | null) => QUESTIONS.find((x) => x.id === id)

/* ---------- gaps: what guests ask that the AI can't fully answer (adding knowledge starts here) ---------- */
export type UseWho = 'ai' | ListingChannel
export interface Gap {
  id: string; question: string
  messages: Array<{ text: string; c: ListingChannel; when: string }>
  aiNow: string; draft: string; draftNote: string
  /** Where the fact goes (an Everything A–Z group) and its name. */
  group: string; fact: string; why: string
  uses: Array<{ who: UseWho; what: string; fixed?: boolean }>
  /** An amenity gap is closed by listing it on more channels (the hair dryer). */
  amenity?: string
}
export const GAPS: Gap[] = [
  { id: 'g-parking', question: 'ar-parking',
    messages: [{ text: 'We’re driving down from Hamburg. Is there somewhere to park near the flat?', c: 'airbnb', when: 'Aug' }, { text: 'Do you have a parking space, or is street parking free?', c: 'booking', when: 'Jun' }],
    aiNow: 'I’m not sure about parking, so I’ll check with your host and get back to you.',
    draft: 'There’s no private parking. Street parking around the flat is free, but it fills up in the evening; the side streets towards Sonnenallee usually have space.',
    draftNote: 'Drafted from your replies to 3 guests. Check it before adding.',
    group: 'location', fact: 'Parking', why: 'Suggested, because guests ask it while planning the trip.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: '“Getting around” + Free street parking' }, { who: 'booking', what: 'Parking: Free public parking nearby' }, { who: 'direct', what: 'Location section' }] },
  { id: 'g-early', question: 'a-early',
    messages: [{ text: 'Our flight lands at 9. Could we drop our bags or come in a bit earlier?', c: 'airbnb', when: 'Sep' }, { text: 'Is early check-in possible? We arrive around noon.', c: 'direct', when: 'Jul' }],
    aiNow: 'Check-in starts at 3:00 PM. Your bags can wait at the bakery next door; I’ll ask review whether you can check in earlier.',
    draft: 'Early check-in is possible when nobody leaves that morning: I’ll confirm the day before. Otherwise, bags can wait at the Weserstraße bakery next door from 9:00.',
    draftNote: 'Drafted from your replies to 5 guests. Check it before adding.',
    group: 'arrival', fact: 'Early check-in', why: 'Suggested, because guests ask it in the days before they arrive.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: '“Other details to note”' }, { who: 'booking', what: 'Important information' }, { who: 'direct', what: 'Arrival section' }] },
  { id: 'g-tax', question: 'p-tax',
    messages: [{ text: 'Does the price include the city tax, or do we pay it when we arrive?', c: 'booking', when: 'Aug' }, { text: 'How much is the Berlin tourist tax?', c: 'airbnb', when: 'May' }],
    aiNow: 'I’m not sure whether the city tax is included, so I’ll check with your host and get back to you.',
    draft: 'Berlin’s city tax is 7.5% of the room price and comes on top. Airbnb collects it when you book; on Booking.com and my site it’s added to the total.',
    draftNote: 'Drafted from your replies to 2 guests. Check it before adding.',
    group: 'pricing', fact: 'City tax', why: 'Suggested, because guests ask it while comparing prices.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: 'Collected by Airbnb at booking' }, { who: 'booking', what: 'Taxes: City tax 7.5%, not included' }, { who: 'direct', what: 'Price breakdown' }] },
  { id: 'g-hair', question: 's-hair', amenity: 'Hair dryer',
    messages: [{ text: 'Is there a hair dryer, or should I bring mine?', c: 'airbnb', when: 'Jul' }, { text: 'Hair dryer in the flat?', c: 'direct', when: 'Apr' }],
    aiNow: 'I can’t see a hair dryer in this listing, so I’ll check with your host.',
    draft: 'Yes, there’s a hair dryer in the bathroom cabinet.',
    draftNote: 'Booking.com lists a hair dryer; Airbnb and your site don’t. Check it before adding.',
    group: 'amenities', fact: 'Hair dryer', why: 'It’s an amenity, so every channel can list it.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: 'Amenity: Hair dryer' }, { who: 'booking', what: 'Already listed', fixed: true }, { who: 'direct', what: 'Amenity: Hair dryer' }] },
  { id: 'g-sunday', question: 'ar-sunday',
    messages: [{ text: 'Is any supermarket open on Sunday?', c: 'booking', when: 'Sep' }, { text: 'We arrive on Sunday evening. Where can we buy food?', c: 'airbnb', when: 'Mar' }],
    aiNow: 'I’m not sure what’s open on Sunday, so I’ll check with your host.',
    draft: 'Most supermarkets close on Sundays in Berlin. The shops inside the bigger train stations are open, and the Späti on the corner of Weserstraße sells the basics.',
    draftNote: 'Drafted from your replies to 2 guests. Check it before adding.',
    group: 'location', fact: 'Shops', why: 'Suggested, because guests ask it just before they arrive.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: 'Neighbourhood' }, { who: 'booking', what: 'What’s nearby' }, { who: 'direct', what: 'Location section' }] },
  { id: 'g-late', question: 'ar-late',
    messages: [{ text: 'Any places to eat after 10 pm?', c: 'airbnb', when: 'Aug' }, { text: 'Where can we have dinner late?', c: 'booking', when: 'Feb' }],
    aiNow: 'Weserstraße has plenty of cafés and bars, but I’m not sure what’s open late. I’ll check with your host.',
    draft: 'Weserstraße and Sonnenallee have restaurants open until midnight, and the falafel places on Sonnenallee stay open even later.',
    draftNote: 'Drafted from your replies to 2 guests and your Neukölln guide. Check it before adding.',
    group: 'location', fact: 'Eating out', why: 'Suggested, because guests ask it during the stay.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: 'Neighbourhood' }, { who: 'booking', what: 'What’s nearby' }, { who: 'direct', what: 'Location section' }] },
  { id: 'g-clean', question: 's-clean',
    messages: [{ text: 'We’re staying 10 nights. Is there any cleaning in between?', c: 'airbnb', when: 'Jun' }, { text: 'Could fresh towels be brought mid-stay?', c: 'booking', when: 'Jan' }],
    aiNow: 'I’ll check with your host about cleaning during your stay and get back to you.',
    draft: 'For stays of a week or more, a mid-stay clean with fresh towels and bed linen is €35. Ask me and I’ll book it.',
    draftNote: 'Drafted from your replies to 3 guests. Check it before adding.',
    group: 'custom', fact: 'Mid-stay cleaning', why: 'Suggested, because no listing field holds it; your AI replies use it.',
    uses: [{ who: 'ai', what: 'on every channel' }, { who: 'airbnb', what: 'House manual' }, { who: 'booking', what: 'Important information' }, { who: 'direct', what: 'House rules' }] },
]
export const gapById = (id: string | null) => GAPS.find((g) => g.id === id)
export const factKeyOf = (g: Gap) => `kh.c-${g.id.slice(2)}`

/* ---------- sources: where the answers come from ---------- */
export const SOURCES = [
  { id: 'details', icon: 'file-text', name: 'Property details', desc: 'Airbnb and Booking.com listings', when: 'synced 29 Sep' },
  { id: 'messages', icon: 'message-circle', name: 'Message history', desc: '312 conversations, last 12 months', when: 'updated today' },
  { id: 'rules', icon: 'shield-check', name: 'House rules', desc: 'Rules on every channel', when: 'synced 29 Sep' },
  { id: 'guide', icon: 'book-2', name: 'Neukölln guide.pdf', desc: 'Guidebook · 14 pages', when: 'added 12 Sep' },
] as const
const DETAIL_GROUPS = ['Arrival', 'Pricing', 'Calendar', 'Amenities', 'Descriptions', 'Location', 'Property', 'Booking policies', 'Availability']
/** How many answers a source feeds. The scenario's sources by default; a property's generic ones (Property details ·
 *  House rules) count the same way from its own questions. */
export function sourceCount(id: string, qs: Question[] = QUESTIONS) {
  return qs.filter((q) => id === 'messages' ? q.from.includes('Message history') : id === 'rules' ? q.from.includes('House rules')
    : id === 'guide' ? q.from.includes('Neukölln guide.pdf') : q.from.some((x) => DETAIL_GROUPS.includes(x))).length
}

/* ---------- facts only this iteration adds ---------- */
const LISTED = { airbnb: 'listing', booking: 'listing', direct: 'listing' } as const
export const C_FACTS: KhItem[] = [
  { key: 'kh.floor', section: 'arrival', label: 'Floor and access', help: 'Which floor, and how guests get up there.', kind: 'text', base: '4th floor, no elevator', state: { ...LISTED } },
  { key: 'kh.late_checkout', section: 'custom', label: 'Late checkout', kind: 'textarea', base: 'Late checkout until 1 PM is €15, when nobody arrives that day. Ask me the day before.', state: {} },
]
/** The first build's custom facts, minus parking: in this scenario free parking is still a gap. */
export const CUSTOM_FACTS: KhItem[] = KH_CUSTOM.filter((x) => x.id !== 'parking').map((x) => ({ key: `kh.${x.id}`, section: 'custom', label: x.label, kind: 'textarea', base: x.value, state: {} }))
