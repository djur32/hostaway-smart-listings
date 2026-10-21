/* The 12-property portfolio (concepts/SCENARIO.md, ) — SCR-05 and the Properties list.
 * Only the scenario property (#1) is modelled in depth; the others are portfolio rows (deep: false). */
import type { ChannelHealth, ChannelId, OwnerLogEntry, PortfolioGroup, PortfolioRule, PricingStrategy, Property, PropertyDetail } from './types'
import { PROPERTY_ID, PROPERTY_NAME } from './scenario'
import type { PhotoKey } from './v3-cv'
import { currentUser } from './users'

const A: ChannelId = 'airbnb', B: ChannelId = 'booking', V: ChannelId = 'vrbo', D: ChannelId = 'direct'

export const PORTFOLIO: Property[] = [
  { id: PROPERTY_ID, name: PROPERTY_NAME, nickname: 'Artist Apt. Neukölln', area: 'Neukölln', channels: [A, B], tone: 1, deep: true, cleaningFee: 25, minStay: 2, checkIn: '15:00', status: 'needs-you', needsYou: 6 },
  { id: 'kreuzberg-loft', name: 'Kreuzberg Canal Loft', nickname: 'Canal Loft', area: 'Kreuzberg', channels: [A, B, V], tone: 2, deep: false, cleaningFee: 35, minStay: 2, checkIn: '15:00', status: 'sync-failed', needsYou: 1 },
  { id: 'friedrichshain-studio', name: 'Friedrichshain Studio', nickname: 'F-hain Studio', area: 'Friedrichshain', channels: [A], tone: 3, deep: false, cleaningFee: 20, minStay: 1, checkIn: '15:00', status: 'needs-you', needsYou: 2 },
  { id: 'mitte-courtyard', name: 'Mitte Courtyard Flat', nickname: 'Mitte Courtyard', area: 'Mitte', channels: [A, B, D], tone: 4, deep: false, cleaningFee: 40, minStay: 2, checkIn: '16:00', status: 'in-sync', needsYou: 0 },
  { id: 'prenzlauer-family', name: 'Prenzlauer Berg Family Flat', nickname: 'PBerg Family', area: 'Prenzlauer Berg', channels: [A, V], tone: 5, deep: false, cleaningFee: 45, minStay: 3, checkIn: '15:00', status: 'in-sync', needsYou: 0 },
  { id: 'wedding-garden', name: 'Wedding Garden Room', nickname: 'Garden Room', area: 'Wedding', channels: [A, B], tone: 1, deep: false, cleaningFee: 20, minStay: 2, checkIn: '15:00', status: 'needs-you', needsYou: 1 },
  { id: 'charlottenburg-classic', name: 'Charlottenburg Classic', nickname: 'Classic', area: 'Charlottenburg', channels: [B], tone: 2, deep: false, cleaningFee: 38, minStay: 2, checkIn: '16:00', status: 'in-sync', needsYou: 0 },
  { id: 'tempelhof-park', name: 'Tempelhof Park View', nickname: 'Park View', area: 'Tempelhof', channels: [A, B], tone: 3, deep: false, cleaningFee: 25, minStay: 2, checkIn: '15:00', status: 'needs-you', needsYou: 1 },
  { id: 'moabit-studio', name: 'Moabit Canal Studio', nickname: 'Moabit Studio', area: 'Moabit', channels: [A], tone: 4, deep: false, cleaningFee: 20, minStay: 1, checkIn: '15:00', status: 'in-sync', needsYou: 0 },
  { id: 'schoneberg-balcony', name: 'Schöneberg Balcony Flat', nickname: 'Balcony Flat', area: 'Schöneberg', channels: [A, B, D], tone: 5, deep: false, cleaningFee: 25, minStay: 2, checkIn: '15:00', status: 'needs-you', needsYou: 1 },
  { id: 'treptow-riverside', name: 'Treptow Riverside', nickname: 'Riverside', area: 'Treptow', channels: [A, V], tone: 1, deep: false, cleaningFee: 30, minStay: 2, checkIn: '15:00', status: 'in-sync', needsYou: 0 },
  { id: 'potsdam-lake', name: 'Potsdam Lake House', nickname: 'Lake House', area: 'Potsdam', channels: [A, B, V, D], tone: 2, deep: false, cleaningFee: 60, minStay: 3, checkIn: '16:00', status: 'in-sync', needsYou: 0 },
]

export const propertyById = (id: string | undefined) => PORTFOLIO.find((p) => p.id === id)

/** The signed-in account's properties, in portfolio order (D-160: Dana 5, Callum 12, Marta 1, Priya 1 once connected).
 *  Accounts switch with a reload (app/account.ts), so a module-level read is current. */
export const MY_PORTFOLIO: Property[] = PORTFOLIO.filter((p) => currentUser().properties.includes(p.id))

/** Cover photo per property (sample photos in public/photos, CREDITS.md): the switcher avatar and its menu.
 *  11 photos for 12 homes, so the Potsdam house shares the building shot with Mitte (far apart in the list). */
export const PROPERTY_PHOTO: Record<string, PhotoKey> = {
  [PROPERTY_ID]: 'living1', 'kreuzberg-loft': 'living2', 'friedrichshain-studio': 'desk', 'mitte-courtyard': 'building',
  'prenzlauer-family': 'kitchen', 'wedding-garden': 'extra2', 'charlottenburg-classic': 'extra1', 'tempelhof-park': 'street',
  'moabit-studio': 'bedroom', 'schoneberg-balcony': 'balcony', 'treptow-riverside': 'bathroom', 'potsdam-lake': 'building',
}

/* ---------------- S12 · groups, pricing inheritance, health per channel, rules, owner log ----------------
 * Grounded in: SCENARIO.md (12 Berlin/Potsdam units), P3 (INT-3: owners, VAs, "a dry run"), Gong themes (sync, pricing),
 * channel-constraints.md (Page Score via API on Booking.com; no numeric score on Airbnb). */

export const GROUPS: PortfolioGroup[] = [
  { id: 'berlin', name: 'Berlin', note: 'City flats, 1–2 bedrooms, mostly couples and remote workers',
    pricing: { stance: 'balanced', dynamic: true, weekendPct: 25, min: 40, max: 160, markups: { airbnb: 0, booking: 15, vrbo: 8, direct: -5 },
      weeklyDiscount: 5, monthlyDiscount: 9, channelDiscounts: {}, cleaningFee: 30, minStay: 2 } },
  { id: 'potsdam', name: 'Potsdam & lakes', note: 'Houses for families and groups; weekends and summer',
    pricing: { stance: 'rate', dynamic: true, weekendPct: 35, min: 90, max: 320, markups: { airbnb: 0, booking: 15, vrbo: 10, direct: -5 },
      weeklyDiscount: 12, monthlyDiscount: 20, channelDiscounts: {}, cleaningFee: 60, minStay: 3 } },
]
export const groupById = (id: string) => GROUPS.find((g) => g.id === id) ?? GROUPS[0]

const h = (status: ChannelHealth['status'], strength: number, lastPushDays: number | null, extra: Partial<ChannelHealth> = {}): ChannelHealth => ({ status, strength, lastPushDays, ...extra })

/** Detail per portfolio row. The scenario property mirrors scenario.ts: €44 base, €25 / €30 cleaning, Airbnb Smart Pricing on. */
export const DETAIL: Record<string, PropertyDetail> = {
  [PROPERTY_ID]: { id: PROPERTY_ID, groupId: 'berlin', owner: 'You', tags: ['Self-managed'], base: 44,
    priceOwner: { airbnb: 'channel', booking: 'hostaway-fixed' }, overrides: { dynamic: false }, channelFees: { airbnb: 25, booking: 30 },
    health: { airbnb: h('needs-you', 64, null), booking: h('needs-you', 72, null) }, pending: { conflicts: 4, suggestions: 3, questions: 5 }, descriptionAgeMonths: 14, wifiSpeedKnown: false },
  'kreuzberg-loft': { id: 'kreuzberg-loft', groupId: 'berlin', owner: 'Weber', tags: ['Owner: Weber', 'Canal'], base: 72,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic', vrbo: 'hostaway-dynamic' }, overrides: { cleaningFee: 35 },
    health: { airbnb: h('in-sync', 81, 3), booking: h('failed', 77, 3, { failed: 'Photo 4 rejected: under 1,280 px wide' }), vrbo: h('in-sync', 70, 3) }, pending: { conflicts: 0, suggestions: 1, questions: 0 }, descriptionAgeMonths: 4, wifiSpeedKnown: true },
  'friedrichshain-studio': { id: 'friedrichshain-studio', groupId: 'berlin', owner: 'Weber', tags: ['Owner: Weber', 'Studio'], base: 49,
    priceOwner: { airbnb: 'hostaway-dynamic' }, overrides: { cleaningFee: 20, minStay: 1 },
    health: { airbnb: h('needs-you', 58, 40) }, pending: { conflicts: 0, suggestions: 2, questions: 1 }, descriptionAgeMonths: 13, wifiSpeedKnown: false },
  'mitte-courtyard': { id: 'mitte-courtyard', groupId: 'berlin', owner: 'Lindqvist', tags: ['Owner: Lindqvist'], base: 88,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic', direct: 'hostaway-dynamic' }, overrides: { cleaningFee: 40 },
    health: { airbnb: h('in-sync', 86, 6), booking: h('in-sync', 91, 6), direct: h('in-sync', 78, 6) }, pending: { conflicts: 0, suggestions: 0, questions: 0 }, descriptionAgeMonths: 2, wifiSpeedKnown: true },
  'prenzlauer-family': { id: 'prenzlauer-family', groupId: 'berlin', owner: 'Lindqvist', tags: ['Owner: Lindqvist', 'Family'], base: 96,
    priceOwner: { airbnb: 'tool', vrbo: 'tool' }, overrides: { cleaningFee: 45, minStay: 3 },
    health: { airbnb: h('in-sync', 79, 12), vrbo: h('drifted', 66, 12, { drift: 'Title changed on Vrbo 2 days ago' }) }, pending: { conflicts: 1, suggestions: 0, questions: 1 }, descriptionAgeMonths: 7, wifiSpeedKnown: false },
  'wedding-garden': { id: 'wedding-garden', groupId: 'berlin', owner: 'Okafor', tags: ['Owner: Okafor', 'Garden'], base: 52,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic' }, overrides: { cleaningFee: 20 }, channelFees: { airbnb: 20, booking: 26 },
    health: { airbnb: h('in-sync', 71, 21), booking: h('needs-you', 63, 21) }, pending: { conflicts: 1, suggestions: 1, questions: 1 }, descriptionAgeMonths: 16, wifiSpeedKnown: false },
  'charlottenburg-classic': { id: 'charlottenburg-classic', groupId: 'berlin', owner: 'Okafor', tags: ['Owner: Okafor'], base: 81,
    priceOwner: { booking: 'manual' }, overrides: { cleaningFee: 38, minStay: 2 },
    health: { booking: h('in-sync', 88, 9) }, pending: { conflicts: 0, suggestions: 0, questions: 0 }, descriptionAgeMonths: 5, wifiSpeedKnown: true },
  'tempelhof-park': { id: 'tempelhof-park', groupId: 'berlin', owner: 'You', tags: ['Self-managed'], base: 58,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic' }, overrides: { cleaningFee: 25 }, channelFees: { airbnb: 25, booking: 25 },
    health: { airbnb: h('in-sync', 74, 15), booking: h('needs-you', 69, 15) }, pending: { conflicts: 1, suggestions: 0, questions: 1 }, descriptionAgeMonths: 9, wifiSpeedKnown: false },
  'moabit-studio': { id: 'moabit-studio', groupId: 'berlin', owner: 'Weber', tags: ['Owner: Weber', 'Studio', 'Just renovated'], base: 47,
    priceOwner: { airbnb: 'hostaway-dynamic' }, overrides: { cleaningFee: 20, minStay: 1 },
    health: { airbnb: h('in-sync', 83, 2) }, pending: { conflicts: 0, suggestions: 0, questions: 1 }, descriptionAgeMonths: 1, wifiSpeedKnown: false },
  'schoneberg-balcony': { id: 'schoneberg-balcony', groupId: 'berlin', owner: 'Lindqvist', tags: ['Owner: Lindqvist', 'Balcony'], base: 63,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic', direct: 'hostaway-dynamic' }, overrides: { cleaningFee: 25 },
    health: { airbnb: h('in-sync', 76, 8), booking: h('in-sync', 80, 8), direct: h('needs-you', 61, 8) }, pending: { conflicts: 0, suggestions: 1, questions: 1 }, descriptionAgeMonths: 13, wifiSpeedKnown: false },
  'treptow-riverside': { id: 'treptow-riverside', groupId: 'berlin', owner: 'Okafor', tags: ['Owner: Okafor', 'River'], base: 66,
    priceOwner: { airbnb: 'hostaway-dynamic', vrbo: 'hostaway-dynamic' }, overrides: {},
    health: { airbnb: h('in-sync', 72, 30), vrbo: h('in-sync', 68, 30) }, pending: { conflicts: 0, suggestions: 1, questions: 1 }, descriptionAgeMonths: 11, wifiSpeedKnown: false },
  'potsdam-lake': { id: 'potsdam-lake', groupId: 'potsdam', owner: 'Lindqvist', tags: ['Owner: Lindqvist', 'Family', 'House'], base: 189,
    priceOwner: { airbnb: 'hostaway-dynamic', booking: 'hostaway-dynamic', vrbo: 'hostaway-dynamic', direct: 'hostaway-dynamic' }, overrides: {},
    health: { airbnb: h('in-sync', 84, 5), booking: h('in-sync', 82, 5), vrbo: h('in-sync', 75, 5), direct: h('in-sync', 70, 5) }, pending: { conflicts: 0, suggestions: 2, questions: 1 }, descriptionAgeMonths: 6, wifiSpeedKnown: true },
}
export const detailOf = (id: string) => DETAIL[id] ?? DETAIL[PROPERTY_ID]

/** A value's level in the inheritance chain (D-154). */
export type Level = 'group' | 'property' | 'channel'

/** Resolve a strategy key for a property: property override wins over the group. */
export function resolve<K extends keyof PricingStrategy>(propertyId: string, key: K, propertyOverrides?: Partial<PricingStrategy>, groups = GROUPS) {
  const d = detailOf(propertyId)
  const g = groups.find((x) => x.id === d.groupId) ?? groups[0]
  const own = { ...d.overrides, ...propertyOverrides }
  if (key in own && own[key] !== undefined) return { value: own[key] as PricingStrategy[K], level: 'property' as Level, group: g }
  return { value: g.pricing[key], level: 'group' as Level, group: g }
}

/** Seeded portfolio rules (D-153). R-1 is the P3 quote made a rule; R-3 shows the honest Booking.com caveat. */
export const SEED_RULES: PortfolioRule[] = [
  { id: 'R-1', channel: 'all', scope: 'All properties', field: 'title', constraint: 'never use superlatives (“best”, “perfect”, “amazing”)', enforcement: 'hard-stop', autonomy: 'auto-review', on: true, by: 'You', at: '2026-09-12' },
  { id: 'R-2', channel: 'vrbo', scope: 'All properties', field: 'title', constraint: 'stay under 40 characters and lead with beds and space', enforcement: 'hard-stop', autonomy: 'autopilot', on: true, by: 'Jonas (listing coordinator)', at: '2026-09-15' },
  { id: 'R-3', channel: 'airbnb', scope: 'Owner: Weber', field: 'cleaning-fee', constraint: 'never change without the owner’s approval', enforcement: 'hard-stop', autonomy: 'suggest', on: true, by: 'You', at: '2026-09-20' },
]

export const SEED_LOG: OwnerLogEntry[] = [
  { id: 'L-3', at: '2026-09-27T16:40:00', who: 'Autopilot · rule R-2', what: 'Shortened Vrbo titles to under 40 characters', scope: '4 properties on Vrbo', applied: 3, skipped: 1, rule: 'R-2',
    details: [{ property: 'Kreuzberg Canal Loft', result: 'applied' }, { property: 'Prenzlauer Berg Family Flat', result: 'skipped', note: 'Title changed on Vrbo 2 days ago: yours to decide' }, { property: 'Treptow Riverside', result: 'applied' }, { property: 'Potsdam Lake House', result: 'applied' }] },
  { id: 'L-2', at: '2026-09-24T10:05:00', who: 'Jonas (listing coordinator)', what: 'Check-in from 15:00 to 16:00', scope: 'Owner: Lindqvist · 4 properties', applied: 3, skipped: 1,
    details: [{ property: 'Mitte Courtyard Flat', result: 'applied' }, { property: 'Prenzlauer Berg Family Flat', result: 'applied' }, { property: 'Schöneberg Balcony Flat', result: 'applied' }, { property: 'Potsdam Lake House', result: 'skipped', note: 'Already 16:00' }] },
  { id: 'L-1', at: '2026-09-20T09:12:00', who: 'You', what: 'Booking.com markup 12% → 15% (Berlin group)', scope: 'Berlin · 8 properties on Booking.com', applied: 8, skipped: 0,
    details: [{ property: 'All 8 Berlin properties on Booking.com', result: 'applied' }] },
]

/* ---- Scale demo: 188 more rows so the Grid can be judged at 200 (a reviewer toggle, clearly labelled) ---- */
const AREAS = ['Neukölln', 'Kreuzberg', 'Mitte', 'Friedrichshain', 'Prenzlauer Berg', 'Wedding', 'Schöneberg', 'Moabit', 'Treptow', 'Charlottenburg', 'Potsdam']
const KINDS = ['Studio', 'Loft', 'Flat', 'Courtyard Flat', 'Balcony Flat', 'Garden Room', 'Family Flat']
const OWNERS = ['Weber', 'Lindqvist', 'Okafor', 'Novak', 'Haddad', 'You']
function rng(seed: number) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647 }
export function syntheticPortfolio(n = 188): Array<{ p: typeof PORTFOLIO[number]; d: PropertyDetail }> {
  const r = rng(42)
  const out: Array<{ p: typeof PORTFOLIO[number]; d: PropertyDetail }> = []
  for (let i = 0; i < n; i++) {
    const area = AREAS[Math.floor(r() * AREAS.length)]
    const kind = KINDS[Math.floor(r() * KINDS.length)]
    const chans = (['airbnb', 'booking', 'vrbo', 'direct'] as const).filter((_, j) => j === 0 || r() > (j === 1 ? 0.35 : 0.7)) as Array<'airbnb' | 'booking' | 'vrbo' | 'direct'>
    const id = `unit-${i + 13}`
    const group = area === 'Potsdam' ? 'potsdam' : 'berlin'
    const failed = r() > 0.96, needs = r() > 0.8
    const health: PropertyDetail['health'] = {}
    for (const c of chans) {
      const s = Math.round(55 + r() * 40)
      health[c] = h(failed && c === 'booking' ? 'failed' : needs && c === chans[0] ? 'needs-you' : r() > 0.95 ? 'drifted' : 'in-sync', s, Math.floor(r() * 60),
        failed && c === 'booking' ? { failed: 'Photo rejected' } : {})
    }
    const owner = OWNERS[Math.floor(r() * OWNERS.length)]
    out.push({
      p: { id, name: `${area} ${kind} ${i + 13}`, nickname: `${kind} ${i + 13}`, area, channels: chans, tone: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5, deep: false,
        cleaningFee: group === 'potsdam' ? 60 : 20 + Math.floor(r() * 5) * 5, minStay: 1 + Math.floor(r() * 3), checkIn: r() > 0.7 ? '16:00' : '15:00',
        status: failed ? 'sync-failed' : needs ? 'needs-you' : 'in-sync', needsYou: needs ? 1 + Math.floor(r() * 3) : 0 },
      d: { id, groupId: group, owner, tags: [`Owner: ${owner}`], base: 45 + Math.floor(r() * 90), priceOwner: {}, overrides: r() > 0.7 ? { cleaningFee: 20 + Math.floor(r() * 5) * 5 } : {},
        health, pending: { conflicts: needs ? 1 : 0, suggestions: Math.floor(r() * 3), questions: Math.floor(r() * 2) }, descriptionAgeMonths: Math.floor(r() * 20), wifiSpeedKnown: r() > 0.5 },
    })
  }
  return out
}

/* ---- Multi-property (QA B01/B02, "model them lightly"): which property is the deep scenario, and each one's listing channels ---- */
/** Listing channels a property page can show (data/sl3 ListingChannel), in rail order. Vrbo has no editor in the prototype. */
type PropertyListingChannel = 'airbnb' | 'booking' | 'direct'
const LISTING_ORDER: PropertyListingChannel[] = ['airbnb', 'booking', 'direct']
/** True only for the deep, scripted property (Neukölln): import story, tips, comps, Hub facts. */
export const isScenarioProperty = (id: string | undefined | null) => id === PROPERTY_ID

/** Properties that keep Smart Listings OFF by default: the last three in the switcher
 *  dropdown, deliberately left as "before you turn this on" — no setup, no tips. Every other non-scenario property
 *  seeds with Smart Listings already on, past setup, with its own per-channel tips (store.ts seedProperty,
 *  data/property-listing.ts propertyTipsFor). . */
export const SMART_LISTINGS_OFF: readonly string[] = ['schoneberg-balcony', 'treptow-riverside', 'potsdam-lake']
/** Smart Listings' seeded default for a property: on (past setup, with tips) for every property except the scenario
 *  one (it has its own richer import story) and the three named above. */
export const smartListingsDefaultOn = (id: string) => !isScenarioProperty(id) && !SMART_LISTINGS_OFF.includes(id)

const channelCache = new Map<string, PropertyListingChannel[]>()
/** A property's connected listing channels (airbnb → booking → direct), from PORTFOLIO. Stable array per id.
 *  The scenario property keeps all three (its Direct booking site is part of the deep scenario); unknown ids get none. */
/** Accounts (D-163): a newcomer's property shows only the channels she actually connected in Getting started. The store
 *  registers the reader (store.ts), so this data module never imports the store. */
/** Kept for the store's call. Since 4 Oct every account's channels come from data/users.ts (Priya has no setup). */
export const setConnectedReader = (_fn: () => readonly string[]) => { /* no-op */ }

export function propertyChannels(id: string | undefined | null): PropertyListingChannel[] {
  const u = currentUser()
  const own = !isScenarioProperty(id) ? null
    : u.channels ?? null
  const key = own ? `${id}|${own.join(',')}` : id ?? ''
  if (own) {
    const hit = channelCache.get(key)
    if (hit) return hit
    const out = LISTING_ORDER.filter((c) => own.includes(c))
    channelCache.set(key, out)
    return out
  }
  const hit = channelCache.get(key)
  if (hit) return hit
  const p = propertyById(key)
  const out = !p ? [] : isScenarioProperty(key) ? [...LISTING_ORDER] : LISTING_ORDER.filter((c) => p.channels.includes(c))
  channelCache.set(key, out)
  return out
}
