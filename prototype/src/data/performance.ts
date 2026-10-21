/* Angle C bridge (S12, D-155…D-159): what each channel lets software measure, a "90 days later" history for the scenario
 * listing, weekly series with the comps' demand as the control, sequential-test statistics, and a competitiveness read.
 * Availability is REAL·PUBLIC (research/market/channel-constraints.md §1 "Quality signal exposed") or ASSUMPTION where marked.
 * Every number below is SIMULATED ("Early access · sample data" in the UI). */
import type { ChannelId, Photo, Version } from './types'
import { COMPS } from './comps'
import type { ListingChannel as SlChannel, Plan as SlPlan } from './sl3'
import type { Mix as SlMix } from './v3-sl'

export type Avail = 'yes' | 'proxy' | 'no' | 'n/a'
export interface MetricDef { id: MetricId; label: string; unit: string; help: string }
export type MetricId = 'bookings' | 'pace' | 'adr' | 'occupancy' | 'enquiries' | 'views' | 'conversion' | 'score' | 'rank' | 'reviews'

export const METRICS: MetricDef[] = [
  { id: 'bookings', label: 'Bookings made', unit: 'per week', help: 'Reservations created that week, for any future date. Hospitable has every reservation.' },
  { id: 'pace', label: 'Booking pace vs similar listings', unit: 'index, similar = 100', help: 'Your bookings over the median of 24 similar listings, 4-week rolling. Controls for season and demand.' },
  { id: 'adr', label: 'Average nightly rate (ADR)', unit: '€', help: 'Revenue per booked night, from reservations.' },
  { id: 'occupancy', label: 'Occupancy', unit: '%', help: 'Booked nights over available nights, from the calendar.' },
  { id: 'enquiries', label: 'Enquiries', unit: 'per week', help: 'First messages from guests who hadn’t booked. From the inbox.' },
  { id: 'views', label: 'Page views & search impressions', unit: 'per week', help: 'How often guests saw the listing.' },
  { id: 'conversion', label: 'View → booking conversion', unit: '%', help: 'Bookings over page views.' },
  { id: 'score', label: 'Channel quality score', unit: '0–100', help: 'The channel’s own content score.' },
  { id: 'rank', label: 'Search position', unit: 'rank', help: 'Where the listing appears for a search.' },
  { id: 'reviews', label: 'Rating & reviews', unit: '★', help: 'Guest reviews. Not moved by copy in weeks, so not a test metric.' },
]

/** What software can see, per channel (D-156). Direct = Hospitable's own site: everything. */
export const AVAILABILITY: Record<MetricId, Partial<Record<ChannelId, { a: Avail; why: string }>>> = {
  bookings: { airbnb: { a: 'yes', why: 'Reservations sync to Hospitable' }, booking: { a: 'yes', why: 'Reservations sync to Hospitable' }, vrbo: { a: 'yes', why: 'Reservations sync' }, direct: { a: 'yes', why: 'Your site' } },
  pace: { airbnb: { a: 'proxy', why: 'Comps from market data (as Dynamic Pricing uses), not from Airbnb' }, booking: { a: 'proxy', why: 'Comps from market data' }, vrbo: { a: 'proxy', why: 'Comps from market data' }, direct: { a: 'proxy', why: 'No comps for a direct site' } },
  adr: { airbnb: { a: 'yes', why: 'From reservations' }, booking: { a: 'yes', why: 'From reservations' }, vrbo: { a: 'yes', why: 'From reservations' }, direct: { a: 'yes', why: 'Your site' } },
  occupancy: { airbnb: { a: 'yes', why: 'From the calendar' }, booking: { a: 'yes', why: 'From the calendar' }, vrbo: { a: 'yes', why: 'From the calendar' }, direct: { a: 'yes', why: 'Your site' } },
  enquiries: { airbnb: { a: 'yes', why: 'Inbox' }, booking: { a: 'yes', why: 'Inbox' }, vrbo: { a: 'yes', why: 'Inbox' }, direct: { a: 'yes', why: 'Inbox' } },
  views: { airbnb: { a: 'no', why: 'Airbnb shows views only in its own Insights; no API for software' }, booking: { a: 'no', why: 'Extranet analytics only' }, vrbo: { a: 'no', why: 'Not shown to integrated software (Vrbo docs)' }, direct: { a: 'yes', why: 'Your site: every visit' } },
  conversion: { airbnb: { a: 'no', why: 'Needs views' }, booking: { a: 'no', why: 'Needs views' }, vrbo: { a: 'no', why: 'Needs views' }, direct: { a: 'yes', why: 'Your site' } },
  score: { airbnb: { a: 'no', why: 'Airbnb exposes no numeric score' }, booking: { a: 'yes', why: 'Page Score, Property Scores API' }, vrbo: { a: 'no', why: 'Not exposed to software' }, direct: { a: 'n/a', why: '—' } },
  rank: { airbnb: { a: 'no', why: 'No channel exposes rank; we don’t scrape' }, booking: { a: 'no', why: 'Same' }, vrbo: { a: 'no', why: 'Same' }, direct: { a: 'n/a', why: '—' } },
  reviews: { airbnb: { a: 'yes', why: 'Reviews sync' }, booking: { a: 'yes', why: 'Reviews sync' }, vrbo: { a: 'yes', why: 'Reviews sync' }, direct: { a: 'n/a', why: '—' } },
}
export const avail = (m: MetricId, c: ChannelId) => AVAILABILITY[m][c] ?? { a: 'no' as Avail, why: 'Not connected' }

/* ---------------- 90 days later (a demo jump, clearly labelled) ---------------- */

export const WEEKS = 13
export const WEEK0 = new Date('2026-09-28T00:00:00')
/** Calendar arithmetic (not `+ n * 864e5`), so weeks after the 25 Oct clock change still start on a Monday. */
const dayOf = (n: number) => new Date(WEEK0.getFullYear(), WEEK0.getMonth(), WEEK0.getDate() + n)
export const weekLabel = (w: number) => dayOf(w * 7).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const at = (w: number, d = 2) => dayOf(w * 7 + d).toISOString()

/** Airbnb and Booking.com versions after 90 days. v0 comes from the store's seed; these continue it. */
export function historyVersions(v0: { airbnb: Version; booking: Version }, photos: Photo[]): Version[] {
  const ids = (rooms: string[]) => {
    const pool = [...v0.airbnb.photoOrder!]
    const first: string[] = []
    for (const r of rooms) { const i = pool.findIndex((id) => photos.find((p) => p.id === id)?.room === r); if (i >= 0) first.push(pool.splice(i, 1)[0]) }
    return [...first, ...pool]
  }
  const hl = (first: string[]) => [...first, ...v0.airbnb.highlightedAmenities!.filter((x) => !first.includes(x))]
  return [
    { id: 'v1-airbnb', channel: 'airbnb', n: 1, at: at(0, 4), by: 'host', author: 'AI draft · Remote work strategy · accepted by you', strategy: 'remote', note: 'First push after import',
      changed: ['Title', 'Description', 'Photo order', 'Highlights'],
      title: 'Neukölln Artist Flat · Desk & Fast Wi-Fi',
      description: 'A bright two-room flat in Neukölln with a real desk by the window and 250 Mbps Wi-Fi. Original paintings on every wall, a quiet courtyard bedroom and U-Bahn Rathaus Neukölln 3 minutes away. Self check-in, a full kitchen and a washer for longer stays.',
      photoOrder: ids(['living', 'bedroom', 'kitchen']), highlightedAmenities: hl(['amenity.workspace', 'amenity.wifi', 'amenity.self_checkin']) },
    { id: 'v2-airbnb', channel: 'airbnb', n: 2, at: at(4, 3), by: 'host', author: 'You edited', note: 'Balcony confirmed (question answered); shorter opening',
      changed: ['Title', 'Description'],
      title: 'Neukölln Artist Flat · Balcony, Desk & Fast Wi-Fi',
      description: 'Paintings, a canal-view balcony and a real desk. Two bright rooms in Neukölln with 250 Mbps Wi-Fi and a quiet courtyard bedroom. U-Bahn Rathaus Neukölln is 3 minutes away. Self check-in, full kitchen, washer.',
      photoOrder: ids(['living', 'balcony', 'bedroom', 'kitchen']), highlightedAmenities: hl(['amenity.workspace', 'amenity.wifi', 'amenity.self_checkin']) },
    { id: 'v3-airbnb', channel: 'airbnb', n: 3, at: at(8, 4), by: 'host', author: 'AI draft · Creative strategy · accepted by you', strategy: 'creative', note: 'Started a test against v2',
      changed: ['Title', 'Description', 'Photo order'],
      title: 'Painter’s Flat in Neukölln · Art, Balcony & Desk',
      description: 'Stay in a painter’s home: original canvases in every room, morning light on a canal-view balcony and a desk for the days you work. Two quiet rooms in Neukölln, 250 Mbps Wi-Fi, U-Bahn 3 minutes away. Self check-in.',
      photoOrder: ids(['living', 'balcony', 'bedroom']), highlightedAmenities: hl(['amenity.workspace', 'amenity.wifi', 'amenity.self_checkin']) },
    { id: 'v1-booking', channel: 'booking', n: 1, at: at(0, 4), by: 'host', author: 'You · name change', note: 'Property name updated', review: 'Reviewed by Booking.com · live 2 days later',
      changed: ['Name'], title: 'Artist Apartment Neukölln · Balcony, Desk & Fast Wi-Fi', description: v0.booking.description, photoOrder: v0.booking.photoOrder, highlightedAmenities: [] },
    { id: 'v2-booking', channel: 'booking', n: 2, at: at(6, 1), by: 'host', author: 'You · photo order', note: 'Living room first; smart photo ordering off',
      changed: ['Photo order'], title: 'Artist Apartment Neukölln · Balcony, Desk & Fast Wi-Fi', description: v0.booking.description,
      photoOrder: ids(['living', 'bedroom', 'balcony']).filter((id) => v0.booking.photoOrder!.includes(id)), highlightedAmenities: [] },
  ]
}

/** Which version was live on the channel in week w. Weeks 9–12 on Airbnb alternate v3/v2 (the switchback test). */
export function liveVersionAt(channel: ChannelId, w: number): number {
  if (channel === 'booking') return w < 1 ? 0 : w < 6 ? 1 : 2
  if (w < 1) return 0
  if (w < 5) return 1
  if (w < 9) return 2
  return (w - 9) % 2 === 0 ? 3 : 2
}

// Similar listings' median bookings made per listing per week: October strong, November low, December holidays (SIMULATED).
const COMPS_WEEKLY = [2.3, 2.4, 2.2, 2.0, 1.8, 1.6, 1.5, 1.4, 1.4, 1.6, 1.8, 2.1, 2.3]
const EFFECT: Record<string, number[]> = { airbnb: [0.8, 1.05, 1.1, 1.38], booking: [0.7, 0.78, 0.84] }
const noise = (i: number) => [1.04, 0.93, 1.08, 0.97, 1.02, 0.9, 1.1, 0.96, 1.05, 0.95, 1.07, 0.98, 1.0][i % 13]

export interface WeekPoint { w: number; label: string; version: number; bookings: number; comps: number; pace: number; adr: number; occupancy: number; enquiries: number; views: number | null; score: number | null }

export function series(channel: ChannelId): WeekPoint[] {
  const eff = EFFECT[channel] ?? [1]
  const raw = COMPS_WEEKLY.map((c, w) => {
    const v = liveVersionAt(channel, w)
    const b = Math.max(0, Math.round(c * eff[Math.min(v, eff.length - 1)] * noise(w + (channel === 'booking' ? 3 : 0)) * (channel === 'booking' ? 0.9 : 1)))
    return { w, v, b, c }
  })
  return raw.map(({ w, v, b, c }, i) => {
    const win = raw.slice(Math.max(0, i - 3), i + 1)
    const pace = Math.round((win.reduce((s, x) => s + x.b, 0) / win.reduce((s, x) => s + x.c, 0)) * 100)
    return {
      w, label: weekLabel(w), version: v, bookings: b, comps: c, pace,
      adr: Math.round((channel === 'booking' ? 58 : 61) + v * 2 + (w >= 11 ? 9 : 0) - (w >= 5 && w <= 9 ? 4 : 0)),
      occupancy: Math.min(97, Math.round(58 + b * 7 + (w >= 11 ? 8 : 0))),
      enquiries: Math.round(b * 1.6 + (w % 3)),
      views: null,
      score: channel === 'booking' ? (v === 0 ? 72 : v === 1 ? 79 : 84) : null,
    }
  })
}

/* ---------------- Sequential test statistics (D-157) ---------------- */

const phi = (z: number) => { // standard normal CDF (Abramowitz–Stegun 7.1.26)
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

/** Switchback read: bookings per unit of comps' demand in each variant's weeks. Poisson, log rate ratio, normal approx. */
export function switchbackRead(points: WeekPoint[], a: number, b: number, fromWeek: number, bar = 0.9, minPerVariant = 20) {
  const wk = points.filter((p) => p.w >= fromWeek)
  const A = wk.filter((p) => p.version === a), B = wk.filter((p) => p.version === b)
  const na = A.reduce((s, p) => s + p.bookings, 0), nb = B.reduce((s, p) => s + p.bookings, 0)
  const ea = A.reduce((s, p) => s + p.comps, 0), eb = B.reduce((s, p) => s + p.comps, 0)
  const ra = (na + 0.5) / ea, rb = (nb + 0.5) / eb
  const se = Math.sqrt(1 / (na + 0.5) + 1 / (nb + 0.5))
  const lift = ra / rb - 1
  const pBbeatsA = phi(Math.log(rb / ra) / se)
  const leader = pBbeatsA >= 0.5 ? b : a
  const p = Math.max(pBbeatsA, 1 - pBbeatsA)
  // Weeks until the bar is likely reached at this effect size (se shrinks with √n).
  const zNeed = 1.2816 // Φ⁻¹(0.9)
  const zNow = Math.abs(Math.log(rb / ra)) / se
  const weeksSoFar = A.length + B.length
  const weeksNeeded = zNow > 0 ? Math.ceil(weeksSoFar * (zNeed / zNow) ** 2) : Infinity
  return { na, nb, weeksA: A.length, weeksB: B.length, lift: leader === b ? rb / ra - 1 : ra / rb - 1, rawLift: lift, p, leader, met: p >= bar && na >= minPerVariant && nb >= minPerVariant,
    moreWeeks: Math.max(0, weeksNeeded - weeksSoFar), enoughBookings: na >= minPerVariant && nb >= minPerVariant }
}

/* ---------------- Competitiveness vs comps (D-159) — a heuristic, labelled ASSUMPTION ---------------- */

const NEIGHBOURHOOD = /neuk(ö|oe|o)lln|reuterkiez|tempelhof|hermannplatz/i
const COMPS_FEATURES = /desk|workspace|wi-?fi|balcony|art|paint|canal|self check/i
/** Amenities most similar listings put first (comps.ts reasons + Insights patterns). */
const COMPS_TOP_HIGHLIGHTS = ['amenity.workspace', 'amenity.wifi', 'amenity.self_checkin', 'amenity.kitchen']

export interface Lever { id: string; label: string; score: number; note: string; editable: boolean }

export function competitiveness(listing: { title: string; description: string; photoOrder?: string[]; highlightedAmenities?: string[] }, channel: ChannelId, photos: Photo[], limit: number) {
  const t = listing.title
  const title = (NEIGHBOURHOOD.test(t) ? 40 : 0) + (COMPS_FEATURES.test(t) ? 30 : 0) + Math.round(30 * Math.min(1, t.length / (limit * 0.8)))
  const first5 = (listing.photoOrder ?? []).slice(0, 5).map((id) => photos.find((p) => p.id === id)?.room)
  const photoScore = Math.round((new Set(first5.filter(Boolean)).size / 5) * 100)
  const hl = listing.highlightedAmenities ?? []
  const hlScore = channel === 'booking' ? null : Math.round((hl.slice(0, 3).filter((x) => COMPS_TOP_HIGHLIGHTS.includes(x)).length / 3) * 100)
  const d = listing.description
  const descScore = channel === 'booking' ? null
    : Math.min(100, (d.length > 180 ? 40 : 20) + (/u-bahn|transit|metro|station/i.test(d) ? 20 : 0) + (/desk|workspace/i.test(d) ? 20 : 0) + (/check-in|self check/i.test(d) ? 20 : 0))
  const levers: Lever[] = [
    { id: 'title', label: channel === 'booking' ? 'Name' : 'Title', score: Math.min(100, title), editable: true,
      note: `${NEIGHBOURHOOD.test(t) ? 'Names the neighbourhood (71% of similar listings do)' : 'Doesn’t name the neighbourhood (71% of similar listings do)'} · ${t.length}/${limit} characters` },
    { id: 'photos', label: 'First 5 photos', score: photoScore, editable: true, note: `${new Set(first5.filter(Boolean)).size} different rooms in the first five (similar listings: 4)` },
    ...(hlScore === null ? [] : [{ id: 'highlights', label: 'Highlighted amenities', score: hlScore, editable: true, note: 'Top 3 vs what similar listings lead with: workspace, Wi-Fi, self check-in' }]),
    ...(descScore === null ? [{ id: 'desc', label: 'Description', score: 0, editable: false, note: 'Booking.com writes it from your facts: raise it through facts, not text' }]
      : [{ id: 'desc', label: 'Description', score: descScore, editable: true, note: 'Covers transport, workspace and arrival, like the best-booked similar listings' }]),
    { id: 'price', label: 'Price position', score: 0, editable: false, note: '€44 sits below 90% of similar listings: a pricing choice, shown, not scored' },
    { id: 'reviews', label: 'Reviews', score: 0, editable: false, note: '4.9 ★: not a copy lever, shown, not scored' },
  ]
  const scored = levers.filter((l) => l.editable)
  const score = Math.round(scored.reduce((s, l) => s + l.score, 0) / scored.length)
  const compScores = COMPS.filter((c) => c.channel === channel).length ? [52, 58, 61, 63, 64, 66, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 80, 81, 83, 85, 86, 88, 91] : []
  const ahead = compScores.filter((x) => x < score).length
  return { score, levers, ahead, of: compScores.length }
}

/** Smallest difference a test can prove at 90% (one-sided), given bookings per week across all variants and weeks run.
 * Poisson counts, log rate ratio: MDE = exp(z·√(2/n)) − 1 with n bookings per variant. The honest planning number. */
export function minDetectable(bookingsPerWeek: number, weeks: number, variants = 2) {
  const n = (bookingsPerWeek * weeks) / variants
  return n <= 0 ? Infinity : Math.exp(1.2816 * Math.sqrt(2 / n)) - 1
}

/* =====================================================================================================================
 * Smart Listings › Performance (WS-SL, 1 Oct · Antonio's "much more development" review). Everything below is SIMULATED.
 *
 * A reservation-level dataset for the scenario listing (Beautiful Artist Apt. in Neukölln, sleeps 2), so every number on
 * Performance and Strategy › Versions derives from the same bookings and can't disagree: occupancy, ADR, RevPAR, revenue,
 * lead time, cancellations, length of stay, day of week, the channel mix and the on-the-books pace.
 *
 *  · 400 days of history (≈ 57 weeks) ending yesterday; day SL_DAYS is today. Smart Listings went live on day SL_START
 *    (≈ 29 weeks ago), so "since Smart Listings started" has an equal ≈ 29-week baseline before it. Extended from
 *    196/98 on 1 Oct (Antonio: "I want to pretend that all of the different channels have been running on Smart
 *    Listings for a long time… I want to see different timelines, time ranges, that I can choose among"), so Last 30 /
 *    Last 90 / Since Smart Listings started are genuinely different windows, and so every channel has four versions
 *    that each ran 30 days or more — the minimum Strategy › Versions needs before it will compare a version at all
 *    ("you need to run this for thirty days at least"). SL_START stays exactly SL_DAYS / 2: periodRange('all') in
 *    screens/smart/perf.ts derives the "equal baseline before" window as 2·SL_START − SL_DAYS, so breaking that
 *    symmetry would silently clamp the comparison window and make its label wrong.
 *  · One calendar shared by three channels: a night is booked through Airbnb, Booking.com or Direct, never twice.
 *  · Similar homes (24 within 1.5 km, comps.ts) are a smooth demand curve: median occupancy and ADR per day, with the
 *    25th–75th percentiles around them. Later windows are quieter than earlier ones, so raw comparisons understate later
 *    strategies; "vs similar homes" (RevPAR ÷ the comps' RevPAR in the same days) adjusts for it.
 *  · Each strategy version (SL_SEED) sets the listing's behaviour while it is live: pull (how often it is picked),
 *    stay length, rate, weekend premium, lead time and cancellation rate, clamped to the strategy's price range.
 *  · Error-diffusion booking starts (not coin flips) keep a one-unit listing's results close to the model, so the story
 *    holds; SL_SEEDS holds one tuned seed per weekday so day-of-week pricing matches the real calendar on any day.
 *    Seeds were re-checked against all seven weekday seeds after the 1 Oct extension: since-start RevPAR above the
 *    equal window before it, and Airbnb's live version the best of its four, on every seed. (3 Oct: Airbnb's and Booking.com's v1–v3
 *    were made genuinely different strategies; re-checked on Saturday's seed only: Airbnb's live v4 still the best of its
 *    four against similar homes, Booking.com's v2 ahead of its live v4, since-start RevPAR still above the window before.) Earlier versions are not
 *    strictly ordered any more — an early experiment sometimes beats another early one, which is what the "replace
 *    current with this version" action in Strategy › Versions is for.
 *  · Direct is deliberately low-volume (pull 0.2 against 1.0 / 1.3), as a single property's own booking site is: it
 *    takes roughly one booking every seven or eight weeks, so some 30-day windows hold very few or none. That is real,
 *    not a gap to paper over — Strategy › Versions says so instead of inventing numbers.
 *  · Views and view → booking conversion exist only for Direct (Hospitable's own site), as AVAILABILITY above says.
 * ===================================================================================================================== */

export const SL_DAYS = 400
export const SL_START = 200
const SL_AHEAD = 60
const SL_CHS: SlChannel[] = ['airbnb', 'booking', 'direct']
/** One tuned seed per weekday of "today" (Mon = 0), so the simulated weekends fall on real Fridays and Saturdays. */
const SL_SEEDS = [1187, 737, 1177, 752, 1299, 693, 244]
const SL_K = 0.2

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const TODAY = midnight(new Date())
const TODAY_DOW = (TODAY.getDay() + 6) % 7
/** Calendar date of simulated day d (day SL_DAYS = today). Calendar arithmetic, safe across clock changes. */
export const slDate = (d: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - (SL_DAYS - d))
export const slIso = (d: number) => { const x = slDate(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
/** The simulated day of an ISO date (yyyy-mm-dd). Today = SL_DAYS. */
export const slDayOf = (iso: string) => { const [y, m, dd] = iso.split('-').map(Number); return SL_DAYS - Math.round((TODAY.getTime() - new Date(y, m - 1, dd).getTime()) / 864e5) }
export const slFmt = (d: number) => slDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
/** 0 = Monday. */
export const slDow = (d: number) => (((d + TODAY_DOW - SL_DAYS) % 7) + 7) % 7

const slRng = (seed: number) => {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const season = (d: number) => Math.sin((2 * Math.PI * (d + 10)) / 220)
/** Similar homes, per day: median occupancy (0–1) and ADR (€), with the 25th and 75th percentiles. */
export const compsOccAt = (d: number) => 0.66 + 0.06 * season(d)
export const compsAdrAt = (d: number) => 56 + 4 * season(d)
export const compsOccBand = (d: number) => ({ p25: compsOccAt(d) - 0.13, p50: compsOccAt(d), p75: compsOccAt(d) + 0.1 })
export const compsAdrBand = (d: number) => ({ p25: compsAdrAt(d) * 0.84, p50: compsAdrAt(d), p75: compsAdrAt(d) * 1.2 })
/** Peak dates (events, fairs): demand and rates jump. */
const peak = (d: number) => d % 23 === 5 || d % 23 === 6 || d % 31 === 12
export const slIsPeak = peak

/** The demo history: Smart Listings started SL_START; each channel's versions since (v0 = before, implicit). */
export interface SlSeedVersion { n: number; from: number; plan: SlPlan; mix?: SlMix | null; by: 'setup' | 'you' | 'autopilot' | 'recommendation'; note?: string }
const plan = (goal: SlPlan['goal'], audience: SlPlan['audience'], priceMin: number, priceMax: number, mode: SlPlan['mode'] = 'suggest', asks = ['price', 'rules', 'policy']): SlPlan => ({ goal, audience, asks, priceMin, priceMax, mode })
export const SL_SEED: Record<SlChannel, SlSeedVersion[]> = {
  /* Airbnb and Booking.com: four genuinely different strategies each (Antonio, 3 Oct: "maybe three previous strategies
   * for Airbnb and Booking.com, so I have more options to choose from") — every pair differs in goal or audience, price
   * range and/or Autopilot, and every one carries a short note. v4 is the live demo plan (data/v3-sl.ts DEMO_PLANS) and
   * is unchanged. SIMULATED. Strategy › History shows these under whatever the host saves on top
   * (screens/smart/shared.ts ensureScenarioHistory). */
  airbnb: [
    { n: 1, from: 200, plan: plan('balance', 'couples', 38, 70), by: 'setup', note: 'First setup: weekend city breaks at the price the flat already had' },
    { n: 2, from: 250, plan: plan('earn', 'couples', 45, 85), by: 'you', note: 'Pushed weekend prices after the summer fairs sold out' },
    { n: 3, from: 300, plan: plan('balance', 'remote', 40, 80, 'autopilot'), by: 'recommendation', note: '6 of the last 10 Airbnb stays were 4 nights or longer' },
    { n: 4, from: 350, plan: plan('fill', 'remote', 40, 90, 'suggest'), by: 'you', note: 'Weekdays kept sitting empty: switched the goal to filling them and Autopilot off' },
  ],
  booking: [
    { n: 1, from: 200, plan: plan('fill', 'couples', 45, 80, 'suggest', ['price', 'rules', 'policy', 'title']), by: 'setup', note: 'First setup: short city breaks to fill the weekdays' },
    { n: 2, from: 260, plan: plan('balance', 'remote', 48, 95, 'autopilot', ['price', 'rules', 'policy', 'title']), by: 'you', note: 'Tried longer weekday stays, with Autopilot on the text' },
    { n: 3, from: 320, plan: plan('earn', 'auto', 52, 115, 'suggest', ['price', 'rules', 'policy', 'title']), by: 'recommendation', note: 'Weekends kept selling out: let Smart Listings pick the guests' },
    { n: 4, from: 360, plan: plan('earn', 'couples', 55, 130, 'suggest', ['price', 'rules', 'policy', 'title']), by: 'you', note: 'Raised the price ceiling after strong weekend demand' },
  ],
  direct: [
    { n: 1, from: 200, plan: plan('fill', 'remote', 38, 65), by: 'setup' },
    { n: 2, from: 250, plan: plan('fill', 'remote', 40, 80), by: 'you', note: 'Opened the ceiling a little after the first direct bookings' },
    { n: 3, from: 300, plan: plan('balance', 'auto', 42, 85), mix: { price: 'below', minStay: '2', policy: 'flexible' }, by: 'you', note: 'For past guests: a lower price and no channel fee' },
    { n: 4, from: 340, plan: plan('balance', 'auto', 42, 85), mix: { price: 'below', minStay: '1', policy: 'flexible' }, by: 'you', note: 'Allowed 1-night stays for returning guests in quiet weeks' },
  ],
}

interface Span { n: number; from: number; plan: SlPlan | null; mix?: SlMix | null }
type Timeline = Partial<Record<SlChannel, Span[]>>
const spanAt = (tl: Span[], d: number) => { let s = tl[0]; for (const x of tl) if (x.from <= d) s = x; return s }
const BASE: Record<SlChannel, { pull: number; stay: number; rate: number; lead: number; cancel: number; minStay: number }> = {
  airbnb: { pull: 1, stay: 3.2, rate: 46, lead: 24, cancel: 0.05, minStay: 2 },
  booking: { pull: 1.3, stay: 2.3, rate: 50, lead: 12, cancel: 0.14, minStay: 3 },
  direct: { pull: 0.2, stay: 4.2, rate: 44, lead: 30, cancel: 0.03, minStay: 2 },
}
/** How a strategy changes the listing's behaviour on a channel (the model behind every simulated number). */
function behaviour(ch: SlChannel, s: Span, scale: number) {
  const b = BASE[ch]
  const out = { pull: b.pull * 0.82, stay: b.stay, minStay: b.minStay, rate: b.rate * scale, wkndPrem: 1.2, lead: b.lead, cancel: b.cancel, min: 38 * scale, max: 95 * scale, weekdayBoost: 1 }
  const p = s.plan
  if (!p) return out
  out.pull = b.pull; out.min = p.priceMin; out.max = p.priceMax
  if (p.goal === 'fill') { out.pull *= 1.22; out.rate *= 0.95; out.weekdayBoost = 1.35; out.minStay = Math.min(out.minStay, 2) }
  if (p.goal === 'earn') { out.pull *= 0.84; out.rate *= 1.15; out.wkndPrem = 1.32; out.weekdayBoost = 0.85 }
  if (p.goal === 'balance') { out.pull *= 1.06; out.rate *= 1.03; out.wkndPrem = 1.26; out.weekdayBoost = 1.1 }
  if (p.audience === 'remote') { out.stay = ch === 'booking' ? 3 : 4.6; out.weekdayBoost *= 1.15; out.lead *= 1.2 }
  if (p.audience === 'couples') { out.stay = Math.min(out.stay, 2.6); out.weekdayBoost *= 0.9 }
  if (s.mix) {
    out.rate *= s.mix.price === 'below' ? 0.9 : s.mix.price === 'above' ? 1.1 : 1
    out.pull *= s.mix.price === 'below' ? 1.05 : 1
    out.minStay = Number(s.mix.minStay)
    out.cancel *= s.mix.policy === 'flexible' ? 1.6 : 1
    out.stay = 3.4
  }
  if (p.mode === 'autopilot') out.pull *= 1.12
  return out
}

export interface SlReservation { ch: SlChannel; n: number; d: number; nights: number; booked: number; revenue: number; cancelled: boolean; rating: number | null }
export interface SlSim { res: SlReservation[]; own: Array<{ ch: SlChannel; rate: number } | null>; views: number[]; channels: SlChannel[]; timeline: Timeline }

/** `cutoff`: bookings made on or after this day are left out (the default: today, so the future holds only what is
 *  already on the books). The last-year dataset passes Infinity: last year's "future" days have all happened. */
function simulate(tl: Timeline, seed: number, chs: SlChannel[], scale = 1, cutoff = SL_DAYS): SlSim {
  const r = slRng(seed)
  const res: SlReservation[] = []
  const own: SlSim['own'] = new Array(SL_DAYS + SL_AHEAD).fill(null)
  let acc = 0.4
  const chAcc: Record<SlChannel, number> = { airbnb: 0, booking: 0, direct: 0 }
  for (let d = 0; d < SL_DAYS + SL_AHEAD; d++) {
    if (own[d]) continue
    const dow = slDow(d)
    const wknd = dow === 4 || dow === 5
    const bs = chs.map((c) => ({ c, s: spanAt(tl[c]!, d), b: behaviour(c, spanAt(tl[c]!, d), scale) }))
    const w = bs.map((x) => x.b.pull * (wknd ? 1.25 : x.b.weekdayBoost))
    const tot = w.reduce((a, b) => a + b, 0)
    acc += Math.min(0.95, compsOccAt(d) * tot * SL_K * (peak(d) ? 1.6 : 1)) * (0.95 + r() * 0.1)
    if (acc < 1) continue
    acc -= 1
    bs.forEach((x, i) => { chAcc[x.c] += w[i] / tot })
    const i = bs.reduce((best, x, k) => (chAcc[x.c] > chAcc[bs[best].c] ? k : best), 0)
    const { c, s, b } = bs[i]
    chAcc[c] -= 1
    let nights = Math.max(b.minStay, Math.round(b.stay * (0.6 + r() * 0.8)))
    const lead = Math.max(1, Math.round(b.lead * (0.4 + r() * 1.2)))
    const booked = d - lead
    if (booked >= cutoff) continue
    if (r() < b.cancel) res.push({ ch: c, n: s.n, d, nights, booked, revenue: 0, cancelled: true, rating: null })
    let revenue = 0
    for (let j = 0; j < nights && d + j < own.length; j++) {
      if (own[d + j]) { nights = j; break }
      const dw = slDow(d + j)
      const sAdr = compsAdrAt(d + j) / 56
      const rate = Math.round(Math.min(b.max, Math.max(b.min, b.rate * sAdr * (dw === 4 || dw === 5 ? b.wkndPrem : 1) * (peak(d + j) ? 1.8 : 1) * (0.95 + r() * 0.1))))
      own[d + j] = { ch: c, rate }
      revenue += rate
    }
    const rating = d + nights < SL_DAYS && r() < (c === 'airbnb' ? 0.72 : c === 'booking' ? 0.5 : 0.3) ? (r() < 0.82 ? 5 : 4) : null
    res.push({ ch: c, n: s.n, d, nights, booked, revenue, cancelled: false, rating })
  }
  // Direct site visits (Hospitable's own site: the only channel that shares views), own stream so bookings don't move.
  const rv = slRng(seed + 99)
  const views = Array.from({ length: SL_DAYS }, (_, d) => Math.round((3.4 + 1.2 * season(d)) * (0.7 + rv() * 0.6) * (d >= SL_START ? 1.25 : 1)))
  return { res, own, views, channels: chs, timeline: tl }
}


/* ---------- a Smart Listings history for every OTHER property (1 Oct · Antonio, repeated: "I want to pretend that all
 * of the different channels have been running on Smart Listings for a long time") ----------
 * Until now only the scenario listing had versions. Every other property ran `simulate` with an empty timeline, so
 * Strategy › Versions showed one row, "v1 · live since today · Still measuring · 4 weeks more needed", and Performance
 * fell into its just-set-up branch with no period control at all. Each property now gets its own generated history:
 *   · Smart Listings starts on day SL_START for every property — the same day periodRange('all'), the "Smart Listings
 *     on" chart marker and the equal baseline before it already assume, so none of that has to move;
 *   · three or four versions per channel, every span ≥ MIN_SPAN days, so no row can read "Still measuring";
 *   · goal, audience, price range, who made the change and the notes all vary with the property id, so twelve homes
 *     don't read as twelve copies of Neukölln;
 *   · only the channels the property actually has (`chs` comes from data/portfolio.ts propertyChannels);
 *   · prices scale with how many guests it sleeps, as the rest of baselineSim already does.
 * The simulation seed is then SEARCHED, not fixed (SL_SEEDS does the same for the scenario listing): the first
 * candidate whose run satisfies the invariants — since-start RevPAR above the equal window before it, and every
 * version window with at least one booked night — is the one kept, so the numbers are plausible on every property
 * and on any weekday the demo is opened. Everything here is SIMULATED. */
const MIN_SPAN = 36
const hashOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
/** How a channel's goal moved over the history. Each property picks one ladder per channel. "Earn more per booking"
 *  appears early and in the middle but never in the last two slots (a history can be 3 or 4 versions long, so both
 *  count as "the one running now"): the model prices an earn strategy above the comps' median, which on a home that
 *  sleeps more than two pushes occupancy down far enough that the live version would read as the worst of its own
 *  history on every seed. It stays in the history, where a strategy that was tried and replaced belongs. */
const GOAL_LADDERS: Record<SlChannel, Array<SlPlan['goal'][]>> = {
  airbnb: [['balance', 'earn', 'fill', 'fill'], ['fill', 'earn', 'balance', 'balance'], ['earn', 'earn', 'fill', 'balance'], ['balance', 'balance', 'fill', 'fill']],
  booking: [['fill', 'earn', 'balance', 'balance'], ['earn', 'earn', 'balance', 'fill'], ['balance', 'earn', 'fill', 'fill'], ['fill', 'fill', 'balance', 'balance']],
  direct: [['fill', 'fill', 'balance', 'balance'], ['balance', 'balance', 'fill', 'fill'], ['fill', 'balance', 'balance', 'fill'], ['balance', 'fill', 'fill', 'balance']],
}
const AUDIENCE_LADDERS: Record<SlChannel, Array<SlPlan['audience'][]>> = {
  airbnb: [['couples', 'couples', 'remote', 'remote'], ['remote', 'remote', 'remote', 'couples'], ['families', 'families', 'couples', 'couples'], ['couples', 'remote', 'remote', 'remote']],
  booking: [['couples', 'couples', 'couples', 'couples'], ['couples', 'couples', 'families', 'families'], ['remote', 'remote', 'couples', 'couples'], ['families', 'families', 'families', 'couples']],
  direct: [['remote', 'remote', 'couples', 'couples'], ['couples', 'couples', 'remote', 'remote'], ['remote', 'couples', 'couples', 'couples'], ['couples', 'remote', 'remote', 'remote']],
}
/** Why the host changed the strategy, in their own words (one per step, picked by the property). */
const STEP_NOTES = [
  'Raised the ceiling once the first weeks filled',
  'Opened the price range after weekends kept selling out',
  'Moved to longer stays after three 5-night bookings in a row',
  'Tightened the range again: the top end never sold',
  'Switched the audience after reading the length-of-stay breakdown',
  'Let Autopilot handle text and photo order from here',
  'Lifted the ceiling for the fair weeks',
  'Went back to filling nights after a quiet month',
]
const STEP_BY: Array<SlSeedVersion['by']> = ['you', 'recommendation', 'you', 'autopilot']
const ASKS_BASE = ['price', 'rules', 'policy']

/** The generated history for one property: the same shape SL_SEED has for the scenario listing. */
export function propertyVersionSeed(pid: string, chs: SlChannel[], guests = 2, variant = 0): Partial<Record<SlChannel, SlSeedVersion[]>> {
  const scale = 1 + Math.max(0, guests - 2) * 0.18
  const out: Partial<Record<SlChannel, SlSeedVersion[]>> = {}
  chs.forEach((c) => {
    const r = slRng(hashOf(`${pid}:${c}`))
    const count = r() < 0.45 ? 3 : 4
    // spans: an even split of SL_START…SL_DAYS, jittered, every one kept at or above MIN_SPAN
    const total = SL_DAYS - SL_START
    const raw = Array.from({ length: count }, () => 0.8 + r() * 0.4)
    const sum = raw.reduce((a, b) => a + b, 0)
    let spans = raw.map((x) => Math.max(MIN_SPAN, Math.round((x / sum) * total)))
    let over = spans.reduce((a, b) => a + b, 0) - total
    for (let i = spans.length - 1; i >= 0 && over > 0; i--) { const give = Math.min(over, spans[i] - MIN_SPAN); spans[i] -= give; over -= give }
    if (over !== 0) spans = spans.map((s, i) => (i === spans.length - 1 ? s - over : s)) // the last span absorbs the rest
    const goals = GOAL_LADDERS[c][(Math.floor(r() * 4) + variant) % 4]
    const auds = AUDIENCE_LADDERS[c][(Math.floor(r() * 4) + variant) % 4]
    const floor = Math.round(((c === 'booking' ? 42 : 36) + r() * 8) * scale)
    const ceiling0 = Math.round(((c === 'booking' ? 82 : 74) + r() * 14) * scale)
    const asks = c === 'booking' ? [...ASKS_BASE, 'title'] : ASKS_BASE
    // the last version is the one the host runs now; only it may be on Autopilot, and only on one channel per property
    let from = SL_START
    const list: SlSeedVersion[] = []
    for (let n = 0; n < count; n++) {
      const step = n === 0 ? 0 : n
      const priceMin = floor // the floor stays put across versions; hosts raise the ceiling, not the bottom
      const priceMax = ceiling0 + Math.round(n * (c === 'booking' ? 7 : 5) * scale)
      list.push({
        n: n + 1, from,
        plan: { goal: goals[n], audience: auds[n], asks, priceMin, priceMax, mode: 'suggest' },
        mix: null,
        by: n === 0 ? 'setup' : STEP_BY[step % STEP_BY.length],
        note: n === 0 ? undefined : STEP_NOTES[(hashOf(`${pid}:${c}:${n}`) + n) % STEP_NOTES.length],
      })
      from += spans[n]
    }
    out[c] = list
  })
  return out
}

/** Does this run tell the story honestly, and the same story the scenario listing tells?
 *   · since-start RevPAR above the equal window before it (the headline invariant),
 *   · every version's own window, and its trailing 30 days, with at least one booked night on its channel, so no row
 *     has to fall back to "No bookings in this window",
 *   · the live version the best read on its channel and better than the run before Smart Listings — a host who has
 *     been tuning a strategy for months should be running their best one, and it is the row the table bolds.
 *  Earlier versions are deliberately NOT ordered: an early experiment beating a later one is what "Replace current
 *  with this version" exists for. */
function baselineOk(sim: SlSim, seed: Partial<Record<SlChannel, SlSeedVersion[]>>, chs: SlChannel[]) {
  const before = slMetrics(sim, 2 * SL_START - SL_DAYS, SL_START, 'all')
  const since = slMetrics(sim, SL_START, SL_DAYS, 'all')
  if (since.revpar <= before.revpar * 1.06) return false
  for (const c of chs) {
    const list = seed[c] ?? []
    if (!list.length) return false
    const b0 = slMetrics(sim, Math.max(0, SL_START - 30), SL_START, c)
    if (b0.nights === 0) return false
    const ms = list.map((v, i) => {
      const end = i + 1 < list.length ? list[i + 1].from : SL_DAYS
      return { whole: slMetrics(sim, v.from, end, c), trailing: slMetrics(sim, Math.max(v.from, end - 30), end, c) }
    })
    if (ms.some((x) => x.whole.nights === 0 || x.trailing.nights === 0)) return false
    const live = ms[ms.length - 1].whole
    if (live.index <= b0.index * 1.05) return false
    if (ms.some((x, i) => i < ms.length - 1 && x.whole.index >= live.index)) return false
  }
  return true
}

const toTimeline = (seed: Partial<Record<SlChannel, SlSeedVersion[]>>, chs: SlChannel[]): Timeline =>
  Object.fromEntries(chs.map((c) => [c, [{ n: 0, from: 0, plan: null }, ...(seed[c] ?? []).map((v) => ({ n: v.n, from: v.from, plan: v.plan, mix: v.mix }))]]))
const cache = new Map<string, SlSim>()
const memo = (key: string, make: () => SlSim) => { const hit = cache.get(key); if (hit) return hit; const s = make(); cache.set(key, s); return s }
/** The scenario listing with its Smart Listings history. */
export const scenarioSim = () => memo('scenario', () => simulate(toTimeline(SL_SEED, SL_CHS), SL_SEEDS[TODAY_DOW], SL_CHS))
/** Same period last year (3 Oct, Antonio: compare a strategy "against something", e.g. last year). SIMULATED: a second,
 *  deterministic run of the same calendar with no strategy on any channel (Smart Listings didn't exist a year ago), its
 *  own seed, and rates 6% lower. Day d of this dataset stands for day d one year earlier (364 days, so weekdays line
 *  up); similar homes' demand curve is the same, so the "vs similar homes" adjustment still holds. Every day is complete
 *  (no on-the-books cut-off). */
export const lastYearSim = (sim: SlSim) => memo(`ly:${sim.channels.join()}`, () =>
  simulate(toTimeline({}, sim.channels), SL_SEEDS[(TODAY_DOW + 3) % 7] + 17, sim.channels, 0.94, Infinity))
/** What-if: the scenario history with one channel running `p` from Smart Listings' start (an estimate, labelled as one). */
export const altSim = (ch: SlChannel, p: SlPlan, mix?: SlMix | null) =>
  memo(`alt:${ch}:${JSON.stringify(p)}:${JSON.stringify(mix ?? null)}`, () => simulate({ ...toTimeline(SL_SEED, SL_CHS), [ch]: [{ n: 0, from: 0, plan: null }, { n: 9, from: SL_START, plan: p, mix }] }, SL_SEEDS[TODAY_DOW], SL_CHS))
export interface PropertyHistory { seed: Partial<Record<SlChannel, SlSeedVersion[]>>; sim: SlSim; channels: SlChannel[] }
const histCache = new Map<string, PropertyHistory>()
/** Any other property's Smart Listings history AND the calendar that ran under it, together — screens/smart/shared.ts
 *  writes the versions into the store and the screens read the numbers from the simulation, and the two must be the
 *  same history. Both the ladder variant and the simulation seed are searched (not fixed) until baselineOk holds, so
 *  the invariants survive whatever weekday the demo is opened on; if nothing satisfies them the first run is still
 *  returned, so a property always has a history rather than falling back to "live since today". */
export function propertyHistory(pid: string, chs: SlChannel[], guests = 2): PropertyHistory {
  const list: SlChannel[] = chs.length ? chs : ['airbnb']
  const key = `${pid}:${list.join()}:${guests}`
  const hit = histCache.get(key)
  if (hit) return hit
  const scale = 1 + Math.max(0, guests - 2) * 0.18
  const h = hashOf(pid)
  let first: PropertyHistory | null = null
  for (let v = 0; v < 4; v++) {
    const seed = propertyVersionSeed(pid, list, guests, v)
    const tl = toTimeline(seed, list)
    for (let i = 0; i < 48; i++) {
      const sim = simulate(tl, (h + v * 104729 + i * 7919) >>> 0, list, scale)
      const out: PropertyHistory = { seed, sim, channels: list }
      if (!first) first = out
      if (baselineOk(sim, seed, list)) { histCache.set(key, out); return out }
    }
  }
  histCache.set(key, first!)
  return first!
}
/** Any other property's calendar: the simulation that ran under its generated history. */
export const baselineSim = (pid: string, chs: SlChannel[], guests = 2) => propertyHistory(pid, chs, guests).sim

/* ---------- reading the dataset ---------- */
export type SlScope = SlChannel | 'all'
export interface SlMetrics {
  from: number; to: number; days: number
  nights: number; occ: number; revenue: number; adr: number; revpar: number
  bookings: number; lead: number; los: number; cancels: number; cancelRate: number
  compsOcc: number; compsAdr: number; compsRevpar: number
  /** RevPAR as a share of similar homes' RevPAR over the same days (1 = the same). The seasonal adjustment. */
  index: number
  /** Share of the next 30 nights already booked at the end of the window, and the comps' typical share. */
  pace: number; compsPace: number
  views: number | null; conversion: number | null
  rating: number | null; reviews: number
}
const inScope = (c: SlChannel, ch: SlScope) => ch === 'all' || c === ch
/** `ahead`: read past today into nights already on the books (reservations booked before today). Used only for a
 *  strategy younger than a week, so Performance can still compare its first days (3 Oct). */
export function slMetrics(sim: SlSim, from: number, to: number, ch: SlScope, opts: { ahead?: boolean } = {}): SlMetrics {
  from = Math.max(0, from); to = Math.min(opts.ahead ? SL_DAYS + SL_AHEAD : SL_DAYS, to)
  const days = Math.max(1, to - from)
  let nights = 0, revenue = 0, cOcc = 0, cAdr = 0
  for (let d = from; d < to; d++) {
    const o = sim.own[d]; cOcc += compsOccAt(d); cAdr += compsAdrAt(d)
    if (o && inScope(o.ch, ch)) { nights++; revenue += o.rate }
  }
  const stays = sim.res.filter((x) => x.d >= from && x.d < to && inScope(x.ch, ch))
  const bk = stays.filter((x) => !x.cancelled)
  const cx = stays.filter((x) => x.cancelled)
  let ahead = 0, cAhead = 0
  for (let d = to; d < to + 30; d++) {
    const o = sim.own[d]
    const r = o && sim.res.find((x) => !x.cancelled && x.ch === o.ch && x.d <= d && x.d + x.nights > d)
    if (o && r && r.booked < to && inScope(o.ch, ch)) ahead++
    cAhead += compsOccAt(d) * 0.62
  }
  const rated = bk.filter((x) => x.rating !== null)
  const views = ch === 'all' || ch === 'direct' ? sim.views.slice(from, to).reduce((a, b) => a + b, 0) : null
  const direct = bk.filter((x) => x.ch === 'direct').length
  const compsRevpar = (cOcc / days) * (cAdr / days)
  return {
    from, to, days, nights, occ: nights / days, revenue, adr: nights ? revenue / nights : 0, revpar: revenue / days,
    bookings: bk.length, lead: bk.length ? bk.reduce((a, x) => a + (x.d - x.booked), 0) / bk.length : 0,
    los: bk.length ? bk.reduce((a, x) => a + x.nights, 0) / bk.length : 0,
    cancels: cx.length, cancelRate: stays.length ? cx.length / stays.length : 0,
    compsOcc: cOcc / days, compsAdr: cAdr / days, compsRevpar, index: compsRevpar ? revenue / days / compsRevpar : 0,
    pace: ahead / 30, compsPace: cAhead / 30,
    views: sim.channels.includes('direct') ? views : null, conversion: sim.channels.includes('direct') && views ? direct / views : null,
    rating: rated.length ? rated.reduce((a, x) => a + (x.rating ?? 0), 0) / rated.length : null, reviews: rated.length,
  }
}

/** Buckets for the evolution and comps charts (days or weeks). Values per channel so the chart can stack them. */
export interface SlBucket {
  from: number; to: number; label: string
  nights: Record<SlChannel, number>; revenue: Record<SlChannel, number>; days: number
  compsOcc: number; occP25: number; occP75: number; compsAdr: number; adrP25: number; adrP75: number; compsRevpar: number
}
export function slBuckets(sim: SlSim, from: number, to: number, size: number): SlBucket[] {
  const out: SlBucket[] = []
  for (let a = from; a < to; a += size) {
    const b = Math.min(to, a + size)
    const k: SlBucket = { from: a, to: b, label: slFmt(a), days: b - a, nights: { airbnb: 0, booking: 0, direct: 0 }, revenue: { airbnb: 0, booking: 0, direct: 0 }, compsOcc: 0, occP25: 0, occP75: 0, compsAdr: 0, adrP25: 0, adrP75: 0, compsRevpar: 0 }
    for (let d = a; d < b; d++) {
      const o = sim.own[d]
      if (o) { k.nights[o.ch]++; k.revenue[o.ch] += o.rate }
      const ob = compsOccBand(d), ab = compsAdrBand(d)
      k.compsOcc += ob.p50; k.occP25 += ob.p25; k.occP75 += ob.p75; k.compsAdr += ab.p50; k.adrP25 += ab.p25; k.adrP75 += ab.p75
      k.compsRevpar += ob.p50 * ab.p50
    }
    const n = b - a
    for (const f of ['compsOcc', 'occP25', 'occP75', 'compsAdr', 'adrP25', 'adrP75', 'compsRevpar'] as const) k[f] = k[f] / n
    out.push(k)
  }
  return out
}
/** Booked share of each weekday's nights (Mon … Sun). */
export function slByWeekday(sim: SlSim, from: number, to: number, ch: SlScope) {
  const tot = new Array(7).fill(0), got = new Array(7).fill(0)
  for (let d = Math.max(0, from); d < Math.min(SL_DAYS, to); d++) { const w = slDow(d); tot[w]++; const o = sim.own[d]; if (o && inScope(o.ch, ch)) got[w]++ }
  return tot.map((t, i) => (t ? got[i] / t : 0))
}
export const LOS_BUCKETS = ['1 night', '2', '3', '4–6', '7+'] as const
/** Stays by length (share of bookings that checked in within the window). */
export function slByLength(sim: SlSim, from: number, to: number, ch: SlScope) {
  const n = [0, 0, 0, 0, 0]
  const bk = sim.res.filter((x) => !x.cancelled && x.d >= from && x.d < to && inScope(x.ch, ch))
  for (const x of bk) n[x.nights >= 7 ? 4 : x.nights >= 4 ? 3 : x.nights - 1]++
  return { counts: n, total: bk.length }
}
/** Where a value sits among similar homes (0–1), read off the 25th / 50th / 75th percentiles (linear between them). */
export function slPercentile(v: number, p25: number, p50: number, p75: number) {
  if (v <= p25) return Math.max(0.02, 0.25 - ((p25 - v) / Math.max(1e-6, p50 - p25)) * 0.25)
  if (v <= p50) return 0.25 + ((v - p25) / Math.max(1e-6, p50 - p25)) * 0.25
  if (v <= p75) return 0.5 + ((v - p50) / Math.max(1e-6, p75 - p50)) * 0.25
  return Math.min(0.98, 0.75 + ((v - p75) / Math.max(1e-6, p75 - p50)) * 0.25)
}
