/* Angle B studio content · S11 (D-140…D-146). The prototype's "AI" is canned, but every output is computed from the
 * record (`facts`), so it stays grounded (D-106): a claim the home can't back becomes a question, never text.
 * All copy, comps and market numbers are ("Sample market data"); channel rules are 
 * (research/market/channel-constraints.md). The title strength is our own heuristic, not a channel score (D-142). */
import { CHANNELS } from './channels'
import { COMPS } from './comps'
import type { ChannelId, Comp, Fact, StrategyId } from './types'

type Facts = Record<string, Fact>
const val = (f: Facts, id: string) => f[id]?.value ?? ''

/* ---------------- facts the copy leans on ---------------- */

/** Wi-Fi speed, if the home knows it ("Yes · speed not stated" until the host answers the question). */
export function wifiSpeed(f: Facts): string | null {
  const m = val(f, 'amenity.wifi').match(/(\d+)\s*Mbps/i)
  return m ? `${m[1]} Mbps` : null
}
export const balconyConfirmed = (f: Facts) => /^yes/i.test(val(f, 'amenity.balcony'))

/** How a per-channel fact reads on one channel (override → observation → shared value). */
export function channelValue(f: Facts, id: string, ch: ChannelId): string {
  const fact = f[id]
  if (!fact) return ''
  return fact.overrides[ch]?.value ?? fact.observations.find((o) => o.source.kind === ch)?.value ?? fact.value ?? ''
}

/* ---------------- strategies (R-110, D-143) ---------------- */

export interface Strategy {
  id: StrategyId
  label: string
  icon: string
  /** What the strategy changes, in one line. */
  effect: string
  /** Pricing stance, linked to Pricing / Dynamic Pricing (R-114). */
  pricing: { text: string; tab: 'rates' | 'taxes-and-discounts' }
  /** Comps on Airbnb that lead with this strategy, and how booked they are. . */
  comps: { count: number; occupancy: number; adr: number }
}

export const STRATEGIES: Strategy[] = [
  { id: 'family', label: 'Family', icon: 'mood-kid', effect: 'Leads with space, beds and safety.',
    pricing: { text: 'Family comps charge per extra guest from the 3rd guest.', tab: 'rates' }, comps: { count: 3, occupancy: 0.71, adr: 92 } },
  { id: 'groups', label: 'Groups', icon: 'users', effect: 'Leads with capacity and shared spaces.',
    pricing: { text: 'Group comps set a 3-night minimum on weekends.', tab: 'rates' }, comps: { count: 2, occupancy: 0.66, adr: 118 } },
  { id: 'remote', label: 'Remote work', icon: 'device-laptop', effect: 'Leads with the desk, the Wi-Fi and quiet.',
    pricing: { text: 'Remote-work comps give 15% off a week; you give 10%.', tab: 'taxes-and-discounts' }, comps: { count: 6, occupancy: 0.83, adr: 64 } },
  { id: 'romantic', label: 'Romantic', icon: 'heart', effect: 'Leads with the art, the light and “for two”.',
    pricing: { text: 'Couples book weekends: comps charge €68 on Saturdays; you charge €55.', tab: 'rates' }, comps: { count: 5, occupancy: 0.78, adr: 70 } },
  { id: 'fun', label: 'Fun & dynamic', icon: 'confetti', effect: 'Leads with the neighbourhood, cafés and the canal.',
    pricing: { text: 'Weekend-heavy demand; Dynamic Pricing would raise Fridays.', tab: 'rates' }, comps: { count: 4, occupancy: 0.74, adr: 66 } },
  { id: 'creative', label: 'Creative', icon: 'palette', effect: 'Leads with the paintings and the light.',
    pricing: { text: 'No clear price pattern among creative comps.', tab: 'rates' }, comps: { count: 3, occupancy: 0.76, adr: 67 } },
  { id: 'pets', label: 'Pet-friendly', icon: 'paw', effect: 'Leads with pet rules and outdoor space.',
    pricing: { text: 'Pet-friendly comps add a €15 pet fee.', tab: 'rates' }, comps: { count: 2, occupancy: 0.69, adr: 71 } },
  { id: 'business', label: 'Business', icon: 'briefcase', effect: 'Leads with self check-in, the desk and transit.',
    pricing: { text: 'Business demand peaks Mon–Thu; your weekday rate is €44 vs comps €63.', tab: 'rates' }, comps: { count: 5, occupancy: 0.8, adr: 63 } },
]

/** Does the home support the strategy? A strategy can't promise what the facts contradict (D-143, principle 4). */
export function strategyFit(id: StrategyId, f: Facts): { fit: 'good' | 'weak' | 'blocked'; reason: string } {
  const guests = Number(val(f, 'space.max_guests') || '2')
  if (id === 'pets' && /^no/i.test(val(f, 'rules.pets'))) return { fit: 'blocked', reason: 'Pets aren’t allowed in your house rules. Change the rule first.' }
  if (id === 'groups' && guests < 4) return { fit: 'blocked', reason: `The home sleeps ${guests}. Group comps sleep 4 or more.` }
  if (id === 'family' && guests < 3) return { fit: 'weak', reason: `The home sleeps ${guests} and is a 4th-floor walk-up. Family comps sleep 4+.` }
  if (id === 'remote' && !wifiSpeed(f)) return { fit: 'good', reason: 'Strong fit. Stating the Wi-Fi speed would make it stronger.' }
  return { fit: 'good', reason: 'The facts back it.' }
}

/* ---------------- titles (R-106…R-108, D-142) ---------------- */

export interface TitleOption {
  text: string
  strategy: StrategyId | 'balanced'
  why: string
  /** Facts the title uses (grounding). */
  uses: string[]
}
export interface ScoredTitle extends TitleOption {
  chars: number
  limit: number
  over: boolean
  /** 0–4: fits the limit · names the area · every claim backed · matches what converts on this channel. */
  strength: number
  parts: { limit: boolean; area: boolean; grounded: boolean; pattern: boolean }
}

function airbnbTitles(strategy: StrategyId | null, f: Facts): TitleOption[] {
  const speed = wifiSpeed(f)
  const balanced: TitleOption[] = [
    { text: 'Artist’s Flat by Tempelhofer Feld · Neukölln', strategy: 'balanced', uses: ['location.area_highlights', 'photo.caption'],
      why: '17 of 24 similar Airbnb listings nearby name the neighbourhood and a landmark. Tempelhofer Feld is 5 min on foot.' },
    { text: 'Sunny Art-Filled Flat · Neukölln', strategy: 'balanced', uses: ['photo.caption'], why: 'Short and specific: the paintings are in your photos.' },
    { text: 'Neukölln Art Flat with Workspace', strategy: 'remote', uses: ['amenity.workspace'], why: '4 of your last 6 guests travelled for work.' },
    { text: 'Painter’s Flat, 3 min to Rathaus Neukölln U-Bahn', strategy: 'business', uses: ['custom.nearest_transit', 'photo.caption'],
      why: 'Transit in the title is common among top business comps.' },
    { text: 'Art-Filled Flat for Two · Neukölln', strategy: 'romantic', uses: ['space.max_guests', 'photo.caption'], why: '“For two” sets expectations: the home sleeps 2.' },
  ]
  const byStrategy: Partial<Record<StrategyId, TitleOption[]>> = {
    remote: [
      speed
        ? { text: `Neukölln Art Flat · Desk & ${speed} Wi-Fi`, strategy: 'remote', uses: ['amenity.workspace', 'amenity.wifi'], why: 'Remote-work comps that state the Wi-Fi speed book 9% more weeknights.' }
        : { text: 'Neukölln Art Flat with a Proper Desk', strategy: 'remote', uses: ['amenity.workspace'], why: 'Leads with the desk. Add your Wi-Fi speed to mention it too.' },
      { text: 'Work-Ready Flat by Tempelhofer Feld', strategy: 'remote', uses: ['amenity.workspace', 'location.area_highlights'], why: 'Pairs the desk with the landmark.' },
      { text: 'Quiet Desk Flat · Neukölln · Self Check-in', strategy: 'remote', uses: ['amenity.workspace', 'amenity.self_checkin'], why: 'Late arrivals: self check-in matters to remote workers.' },
    ],
    romantic: [
      { text: 'Art-Filled Flat for Two · Neukölln', strategy: 'romantic', uses: ['space.max_guests', 'photo.caption'], why: '“For two” is the top phrase among couples’ comps.' },
      { text: 'Painter’s Hideaway by Tempelhofer Feld', strategy: 'romantic', uses: ['photo.caption', 'location.area_highlights'], why: 'Evocative, and still names the landmark.' },
    ],
    creative: [
      { text: 'Painter’s Flat by Tempelhofer Feld · Neukölln', strategy: 'creative', uses: ['photo.caption', 'location.area_highlights'], why: 'Leads with the art that’s in your photos.' },
      { text: 'Art-Lined Flat in Neukölln', strategy: 'creative', uses: ['photo.caption'], why: 'Short, visual, true.' },
    ],
    business: [
      { text: 'Neukölln Flat · Workspace & Self Check-in', strategy: 'business', uses: ['amenity.workspace', 'amenity.self_checkin'], why: 'The two things business guests filter for.' },
      { text: 'Painter’s Flat, 3 min to Rathaus Neukölln U-Bahn', strategy: 'business', uses: ['custom.nearest_transit'], why: 'Transit in the title.' },
    ],
    fun: [
      { text: 'Neukölln Art Flat · Cafés & Canal Nearby', strategy: 'fun', uses: ['copy.neighbourhood', 'photo.caption'], why: 'Leads with the neighbourhood you describe.' },
    ],
    family: [
      { text: 'Quiet Neukölln Flat · Crib on Request', strategy: 'family', uses: ['amenity.crib'], why: 'The only family fact the home backs. The home sleeps 2.' },
    ],
  }
  const head = (strategy && byStrategy[strategy]) || []
  const seen = new Set<string>()
  return [...head, ...balanced].filter((t) => (seen.has(t.text) ? false : (seen.add(t.text), true)))
}

function bookingTitles(f: Facts): TitleOption[] {
  return [
    { text: 'Neukölln Artist Apartment with Workspace', strategy: 'remote', uses: ['amenity.workspace'], why: 'Booking.com shows the name next to the property type; the workspace is a searchable facility (DESK).' },
    { text: 'Artist Apartment by Tempelhofer Feld', strategy: 'balanced', uses: ['location.area_highlights'], why: 'Names the landmark; Booking.com adds the area itself.' },
    ...(balconyConfirmed(f) ? [{ text: 'Artist Apartment Neukölln · Balcony', strategy: 'balanced' as const, uses: ['amenity.balcony'], why: 'The balcony is confirmed.' }] : []),
  ]
}

export function titleOptions(channel: ChannelId, strategy: StrategyId | null, f: Facts): ScoredTitle[] {
  const raw = channel === 'booking' ? bookingTitles(f) : airbnbTitles(strategy, f)
  return raw.map((t) => scoreTitle(t, channel, strategy))
}

export function scoreTitle(t: TitleOption, channel: ChannelId, strategy?: StrategyId | null): ScoredTitle {
  const limit = CHANNELS[channel].titleLimit ?? 300
  const chars = t.text.length
  const parts = {
    limit: chars <= limit,
    area: /Neuk(ö|oe)lln|Tempelhof/i.test(t.text),
    grounded: t.uses.length > 0 && !/fast|best|luxury|stunning/i.test(t.text),
    // What converts here: 17 of 24 comps name a landmark or transit; with a strategy on, leaning into it counts too.
    pattern: strategy ? t.strategy === strategy : /Tempelhof|U-Bahn|Feld|Canal|Hermannplatz/i.test(t.text),
  }
  return { ...t, chars, limit, over: !parts.limit, parts, strength: Object.values(parts).filter(Boolean).length }
}

export const STRENGTH_LABEL = ['Weak', 'Weak', 'Fair', 'Good', 'Strong']

/** Free-text refine (R-107). Canned: 6 instruction families produce real results; anything else says so honestly. */
export function refineTitle(base: string, instruction: string, f: Facts): { text?: string; askId?: string; note: string } {
  const i = instruction.toLowerCase()
  if (/short/.test(i)) {
    const parts = base.split(' · ')
    const text = parts.length > 1 ? parts[0] : base.replace(/ by Tempelhofer Feld| in Neukölln|, 3 min to .*/, '')
    return { text, note: 'Shorter: kept the strongest part.' }
  }
  if (/balcon/.test(i)) {
    if (!balconyConfirmed(f)) return { askId: 'balcony', note: 'Booking.com lists a balcony but Airbnb doesn’t. I won’t mention it until you confirm.' }
    return { text: base.length + 10 <= 50 ? `${base} · Balcony` : 'Art Flat with Balcony · Neukölln', note: 'Added the balcony (confirmed by you).' }
  }
  if (/wi-?fi|fast|internet/.test(i)) {
    const speed = wifiSpeed(f)
    if (!speed) return { askId: 'wifi-speed', note: 'I can say “fast” only if the home says how fast.' }
    return { text: `Neukölln Art Flat · Desk & ${speed} Wi-Fi`, note: `Added the speed you gave (${speed}).` }
  }
  if (/formal|casual|friendl|warm/.test(i)) return { text: 'Your Art-Filled Place by Tempelhofer Feld', note: 'Less formal, same facts.' }
  if (/desk|work/.test(i)) return { text: 'Neukölln Art Flat with Workspace', note: 'Leads with the workspace.' }
  if (/u-?bahn|transit|metro|station/.test(i)) return { text: 'Art Flat, 3 min to Rathaus Neukölln U-Bahn', note: 'Added the U-Bahn (from “Nearest transit”).' }
  return { note: 'This prototype understands: shorter · mention the workspace · less formal · mention the balcony · mention the Wi-Fi · mention the U-Bahn.' }
}

/* ---------------- description (R-109, D-141) ---------------- */

export interface Sentence { id: string; text: string; uses: string[] }
export type SentenceAction = 'rewrite' | 'shorten' | 'factual' | 'warmer' | 'remove'
export const SENTENCE_ACTIONS: Array<{ id: SentenceAction; label: string; icon?: string }> = [
  { id: 'rewrite', label: 'Rewrite', icon: 'wand' }, { id: 'shorten', label: 'Shorten' }, { id: 'factual', label: 'More factual' },
  { id: 'warmer', label: 'Warmer' }, { id: 'remove', label: 'Remove', icon: 'trash' },
]

function baseSentences(f: Facts, strategy: StrategyId | null, instructions: string[]): Sentence[] {
  const speed = wifiSpeed(f)
  const checkin = channelValue(f, 'arrival.checkin_from', 'airbnb').replace(/^from /, '') || '3:00 PM'
  const noStairsNegative = instructions.some((x) => /stairs/i.test(x))
  const s: Record<string, Sentence> = {
    open: { id: 'open', uses: ['identity.property_type', 'space.size', 'photo.caption'], text: 'A sunny 48 m² two-room flat in Neukölln, with original paintings on the walls.' },
    area: { id: 'area', uses: ['location.area_highlights', 'custom.nearest_transit'], text: 'Tempelhofer Feld is 5 minutes on foot, and Rathaus Neukölln U-Bahn is 3 minutes away.' },
    sleep: { id: 'sleep', uses: ['space.beds', 'space.bathrooms_full', 'space.max_guests'], text: 'The bedroom has a double bed and the bathroom a shower; the flat sleeps two.' },
    work: { id: 'work', uses: ['amenity.workspace', 'amenity.wifi'], text: speed ? `Work at a proper desk by the window, on ${speed} Wi-Fi.` : 'Work at a proper desk by the window, with Wi-Fi throughout.' },
    kitchen: { id: 'kitchen', uses: ['amenity.kitchen', 'amenity.dishwasher', 'amenity.washer'], text: 'The kitchen has a dishwasher, and there’s a washer for longer stays.' },
    arrive: { id: 'arrive', uses: ['amenity.self_checkin', 'arrival.checkin_from', 'arrival.checkout_time'], text: `Let yourself in with the keypad from ${checkin}; checkout is by 2:00 PM.` },
    stairs: { id: 'stairs', uses: ['space.floor_and_access', 'custom.stairs'],
      text: noStairsNegative ? 'It’s on the 4th floor, up a quiet stairwell (there’s no elevator), above the street noise.' : 'It’s a 4th-floor walk-up with no elevator.' },
  }
  const order: Record<string, string[]> = {
    remote: ['work', 'open', 'area', 'arrive', 'kitchen', 'sleep', 'stairs'],
    business: ['arrive', 'work', 'area', 'open', 'sleep', 'kitchen', 'stairs'],
    romantic: ['open', 'sleep', 'area', 'kitchen', 'arrive', 'work', 'stairs'],
    creative: ['open', 'area', 'work', 'sleep', 'kitchen', 'arrive', 'stairs'],
    fun: ['area', 'open', 'sleep', 'kitchen', 'arrive', 'work', 'stairs'],
  }
  if (strategy === 'remote') s.work = { ...s.work, text: speed ? `Made for working away: a proper desk by the window and ${speed} Wi-Fi.` : 'Made for working away: a proper desk by the window, with Wi-Fi throughout.' }
  if (strategy === 'romantic') s.open = { ...s.open, text: 'A quiet, art-filled flat for two in Neukölln, with the afternoon sun on the paintings.' }
  if (strategy === 'fun') s.area = { ...s.area, text: 'Step out to Neukölln’s cafés and the canal; Tempelhofer Feld is 5 minutes on foot.', uses: ['copy.neighbourhood', 'location.area_highlights'] }
  if (strategy === 'business') s.arrive = { ...s.arrive, text: `Arrive any time after ${checkin} with the keypad; Rathaus Neukölln U-Bahn is 3 minutes away.`, uses: ['amenity.self_checkin', 'arrival.checkin_from', 'custom.nearest_transit'] }
  const ids = (strategy && order[strategy]) || ['open', 'area', 'sleep', 'work', 'kitchen', 'arrive', 'stairs']
  return ids.map((id) => s[id])
}

const EDITS: Record<string, Partial<Record<Exclude<SentenceAction, 'remove'>, string>>> = {
  open: { rewrite: 'Original paintings fill this bright two-room flat in Neukölln (48 m²).', shorten: 'A sunny two-room flat full of paintings.', factual: 'Two-room apartment, 48 m², in Neukölln. Paintings on the walls.', warmer: 'Welcome to a sunny, art-filled two-room flat in the heart of Neukölln.' },
  area: { rewrite: 'You’re 5 minutes from Tempelhofer Feld and 3 from Rathaus Neukölln U-Bahn.', shorten: 'Tempelhofer Feld: 5 min. U-Bahn: 3 min.', factual: 'Tempelhofer Feld: 5 min on foot. Rathaus Neukölln U-Bahn: 3 min on foot.', warmer: 'Tempelhofer Feld, Berlin’s giant park, is a 5-minute stroll away.' },
  sleep: { rewrite: 'One bedroom with a double bed, one shower room: made for two.', shorten: 'Double bed, shower, sleeps two.', factual: '1 bedroom (double bed), 1 bathroom (shower). Max 2 guests.', warmer: 'A cosy double bedroom and a bright shower room, just right for two.' },
  work: { rewrite: 'There’s a real desk by the window for working days.', shorten: 'A desk by the window.', factual: 'Dedicated workspace with a desk. Wi-Fi.', warmer: 'Working? Settle in at the desk by the window.' },
  kitchen: { rewrite: 'Cook in a kitchen with a dishwasher; a washer handles longer stays.', shorten: 'Kitchen with dishwasher; washer.', factual: 'Kitchen with dishwasher. Washing machine.', warmer: 'Cook at home in the kitchen, and leave the dishes to the dishwasher.' },
  arrive: { rewrite: 'Self check-in with a keypad; checkout by 2:00 PM.', shorten: 'Keypad self check-in.', factual: 'Self check-in (keypad). Check-out: 2:00 PM.', warmer: 'Arrive when it suits you: the keypad lets you in.' },
  stairs: { rewrite: 'The flat is on the 4th floor, and there’s no elevator.', shorten: '4th floor, no elevator.', factual: '4th floor. No elevator.', warmer: 'It’s four flights up, with no elevator, and quiet at the top.' },
}

/** Apply the host's per-sentence edits (text, or null = removed). */
export function draftDescription(f: Facts, strategy: StrategyId | null, instructions: string[], edits: Record<string, string | null>): Sentence[] {
  return baseSentences(f, strategy, instructions)
    .filter((x) => edits[x.id] !== null)
    .map((x) => (edits[x.id] ? { ...x, text: edits[x.id]! } : x))
}

export function editSentence(id: string, action: SentenceAction): string | null {
  if (action === 'remove') return null
  return EDITS[id]?.[action] ?? null
}

/** Free-text instruction on a selected sentence (R-109). Unbacked asks become questions, never text (D-106). */
export function instructSentence(s: Sentence, instruction: string, f: Facts): { text?: string; askId?: string; note: string } {
  const i = instruction.toLowerCase()
  if (/balcon/.test(i)) return balconyConfirmed(f) ? { text: `${s.text.replace(/\.$/, '')}, with a balcony.`, note: 'Added the balcony (confirmed).' } : { askId: 'balcony', note: 'I won’t mention a balcony until you confirm there is one.' }
  if (/fast|speed|wi-?fi/.test(i)) return wifiSpeed(f) ? { text: `Work at a proper desk by the window, on ${wifiSpeed(f)} Wi-Fi.`, note: 'Added the speed.' } : { askId: 'wifi-speed', note: 'I can say “fast” only if the home says how fast.' }
  if (/bike/.test(i)) return { text: `${s.text.replace(/\.$/, '')}; bikes can go in the courtyard storage.`, note: 'Added bike storage (from your facts).' }
  if (/short/.test(i)) return { text: EDITS[s.id]?.shorten ?? s.text, note: 'Shorter.' }
  if (/warm|friendl/.test(i)) return { text: EDITS[s.id]?.warmer ?? s.text, note: 'Warmer.' }
  return { note: 'This prototype understands: shorter · warmer · mention the balcony · mention the Wi-Fi speed · mention bike storage.' }
}

/** Claims in today's live text that the home can't back (D-106). Shown as questions, removed from the draft. */
export function unbackedClaims(live: string, f: Facts): Array<{ claim: string; questionId: string }> {
  const out: Array<{ claim: string; questionId: string }> = []
  if (/fast wi-?fi/i.test(live) && !wifiSpeed(f)) out.push({ claim: 'fast Wi-Fi', questionId: 'wifi-speed' })
  if (/balcony/i.test(live) && !balconyConfirmed(f)) out.push({ claim: 'balcony', questionId: 'balcony' })
  return out
}

export const PRESET_INSTRUCTIONS = [
  'Never mention the stairs as a negative',
  'Always say the U-Bahn is 3 minutes away',
  'No exclamation marks',
]

/* ---------------- Booking.com: facts and completeness (D-032, D-146, I-06) ---------------- */

/** An approximation of what Booking.com writes from the facts we send. Labelled "Approximate" in the UI. */
export function bookingWrites(f: Facts): string {
  const speed = wifiSpeed(f)
  return `Located in Berlin, 1.2 km from Hermannplatz underground station, Artist Apartment Neukölln offers accommodation with ${speed ? `free WiFi (${speed})` : 'free WiFi'}. `
    + 'The apartment features 1 bedroom, a kitchen with a dishwasher, a washing machine and 1 bathroom with a shower. '
    + `Tempelhofer Feld is 5 minutes on foot.${balconyConfirmed(f) ? ' Guests can relax on the balcony.' : ''}`
}

export interface ScoreRaiser { id: string; label: string; points: number; questionId?: string; to?: string }
export const PAGE_SCORE_RAISERS: ScoreRaiser[] = [
  { id: 'wifi', label: 'Wi-Fi speed', points: 6, questionId: 'wifi-speed' },
  { id: 'photos', label: '4 more room photos (kitchen, bathroom)', points: 5, to: 'home/photos' },
  { id: 'licence', label: 'Registration number', points: 3, questionId: 'licence' },
  { id: 'quiet', label: 'Quiet hours', points: 2, questionId: 'quiet-hours' },
]

/* ---------------- comps, similarity, market (R-108, R-111…R-113, D-144) ---------------- */

/** How similarity is weighted (D-144). Shown in the UI so "similar" is never a black box. */
export const SIMILARITY_WEIGHTS: Array<{ id: keyof Breakdown; label: string; weight: number }> = [
  { id: 'photos', label: 'Photos look alike', weight: 0.25 },
  { id: 'amenities', label: 'Amenities', weight: 0.2 },
  { id: 'facilities', label: 'Building & facilities', weight: 0.15 },
  { id: 'conditions', label: 'Conditions (rules, check-in, fees)', weight: 0.15 },
  { id: 'size', label: 'Size & location', weight: 0.25 },
]
export interface Breakdown { photos: number; amenities: number; facilities: number; conditions: number; size: number }

const BREAKDOWN: Record<string, Breakdown> = {
  'c-a1': { photos: 0.95, amenities: 0.9, facilities: 0.85, conditions: 0.88, size: 0.93 },
  'c-a2': { photos: 0.8, amenities: 0.95, facilities: 0.9, conditions: 0.85, size: 0.87 },
  'c-a3': { photos: 0.85, amenities: 0.82, facilities: 0.8, conditions: 0.9, size: 0.9 },
  'c-a4': { photos: 0.78, amenities: 0.88, facilities: 0.82, conditions: 0.8, size: 0.85 },
  'c-a5': { photos: 0.7, amenities: 0.9, facilities: 0.75, conditions: 0.82, size: 0.8 },
  'c-b1': { photos: 0.82, amenities: 0.9, facilities: 0.92, conditions: 0.85, size: 0.86 },
  'c-b2': { photos: 0.72, amenities: 0.84, facilities: 0.8, conditions: 0.86, size: 0.83 },
  'c-b3': { photos: 0.9, amenities: 0.7, facilities: 0.72, conditions: 0.8, size: 0.78 },
}
export const breakdownOf = (c: Comp): Breakdown => BREAKDOWN[c.id] ?? { photos: c.similarity, amenities: c.similarity, facilities: c.similarity, conditions: c.similarity, size: c.similarity }

/** Which strategy each comp leads with (for "comps using this strategy"). . */
export const COMP_STRATEGY: Record<string, StrategyId[]> = {
  'c-a1': ['creative', 'romantic'], 'c-a2': ['remote', 'business'], 'c-a3': ['fun'], 'c-a4': ['romantic'], 'c-a5': ['remote'],
  'c-b1': ['business'], 'c-b2': ['business', 'remote'], 'c-b3': ['creative'],
}

export const compsFor = (channel: ChannelId, strategy?: StrategyId | null) =>
  COMPS.filter((c) => c.channel === channel && (!strategy || (COMP_STRATEGY[c.id] ?? []).includes(strategy)))
    .sort((a, b) => b.similarity - a.similarity)

/** Structure patterns among the top comps per channel (R-111). . */
export const PATTERNS: Partial<Record<ChannelId, Array<{ text: string; you: string }>>> = {
  airbnb: [
    { text: '17 of 24 name the neighbourhood and a landmark in the title', you: 'Yours names the neighbourhood only' },
    { text: '8 of the top 10 lead the description with the space, not the rules', you: 'Yours does' },
    { text: 'Top comps show 22–30 photos, one or more per room', you: 'You show 18; the bathroom has 1' },
    { text: '6 of 10 state the Wi-Fi speed', you: 'Yours says “fast” without a number' },
  ],
  booking: [
    { text: 'The top 5 by Page Score all state the Wi-Fi speed', you: 'Not stated' },
    { text: 'Comps with a Page Score over 85 have 4+ photos per room', you: 'Kitchen 3, bathroom 2' },
    { text: 'Most comps list quiet hours in house rules', you: 'Not set' },
  ],
}

/** Market snapshot per channel (R-113). ; the "you" values are (HS-30). */
export const MARKET_SNAPSHOT: Partial<Record<ChannelId, { demand: string; adr: { min: number; max: number; median: number; you: number }; occupancy: { min: number; max: number; median: number; you: number } }>> = {
  airbnb: { demand: 'High on weekdays through November (trade fairs), softer in January.', adr: { min: 52, max: 84, median: 66, you: 44 }, occupancy: { min: 58, max: 88, median: 77, you: 81 } },
  booking: { demand: 'Weekend-led; lead time is 2 weeks shorter than on Airbnb.', adr: { min: 58, max: 90, median: 71, you: 44 }, occupancy: { min: 55, max: 84, median: 73, you: 69 } },
}

/* ---------------- the assistant reads the same record (D-125, R-081) ---------------- */

export const ASSISTANT_QA: Array<{ q: string; answer: (f: Facts) => { text: string; uses: string[]; askId?: string } }> = [
  { q: 'What time can I check in?', answer: (f) => ({ text: `From ${channelValue(f, 'arrival.checkin_from', 'airbnb').replace(/^from /, '') || '3:00 PM'} on Airbnb; Booking.com guests see ${channelValue(f, 'arrival.checkin_from', 'booking').replace(/^from /, '') || '16:00'}. The keypad code arrives 24 h before.`, uses: ['arrival.checkin_from', 'arrival.door_code'] }) },
  { q: 'How fast is the Wi-Fi?', answer: (f) => (wifiSpeed(f) ? { text: `${wifiSpeed(f)}, all over the flat.`, uses: ['amenity.wifi'] } : { text: 'I don’t know yet, so I tell guests “I’ll check with your host.”', uses: [], askId: 'wifi-speed' }) },
  { q: 'Is there a balcony?', answer: (f) => (balconyConfirmed(f) ? { text: 'Yes.', uses: ['amenity.balcony'] } : { text: 'Booking.com says yes and Airbnb says no, so I don’t answer until you confirm.', uses: [], askId: 'balcony' }) },
  { q: 'Can I store a bike?', answer: () => ({ text: 'Yes, in the courtyard bike storage.', uses: ['custom.bike_storage'] }) },
  // Today's Ask the AI answered "Yes, the apartment is wheelchair accessible" with nothing in the listing to back it
  // (HS-L08, HE-39, E-046, severity 4). Grounded, it says only what the home backs (D-106, D-141).
  { q: 'Is it wheelchair accessible?', answer: () => ({ text: 'It’s on the 4th floor with no elevator, so it isn’t step-free. Your home says nothing else about accessibility, so I don’t claim more.', uses: ['space.floor_and_access', 'custom.stairs'] }) },
]
