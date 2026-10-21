/* KH-E · Base and channel lens: data the lens needs that the shared data files don't carry (concepts/knowledge-hub/KH-E.md).
 * sample content (the Neukölln scenario); channel rules (Airbnb checkout instructions:
 * airbnb.com/help/article/1926; Booking.com Genius). Everything else is read from data/v3-kh.ts (khItems), so the
 * lens shows the same Base and channel values the channel editors use. Store keys: FIELDS keys · `price:` · `avail:` ·
 * `amenity:<key>` ('on'/'off' per channel, the channel editor's key) · `kh.<id>` · `kh.x.<tab>.<slug>` (items added here,
 * value = "Label\nValue"). */
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import { isScenarioProperty } from '../../../../data/portfolio'
import { genericSources } from '../../perProperty'

export type Lens = 'base' | ListingChannel
export const LENSES: Lens[] = ['base', 'airbnb', 'booking', 'direct']
export const isLens = (v: string | null): v is Lens => !!v && (LENSES as string[]).includes(v)

/** The tab bar (Paper KH-E): nine content types on the bar, the rest under More. */
export const MAIN_TABS: KhSectionId[] = ['property', 'descriptions', 'photos', 'arrival', 'location', 'amenities', 'rules', 'pricing', 'availability']
export const MORE_TABS: KhSectionId[] = ['policies', 'custom']
export const TAB_LABEL: Record<KhSectionId, string> = {
  property: 'Property', descriptions: 'Descriptions', photos: 'Photos', arrival: 'Arrival', location: 'Location', amenities: 'Amenities',
  rules: 'House rules', pricing: 'Pricing', availability: 'Availability', policies: 'Policies', custom: 'Custom facts',
}
export const isTab = (v: string | null): v is KhSectionId => !!v && ([...MAIN_TABS, ...MORE_TABS] as string[]).includes(v)

/** Section head per tab under the Base lens (Arrival follows Hostaway's "Getting inside and setup" head). */
export const TAB_HEAD: Record<KhSectionId, { title: string; desc: string }> = {
  property: { title: 'The property', desc: 'What kind of home this is. Edit here once; channels use it unless they have their own.' },
  descriptions: { title: 'Descriptions', desc: 'The name and texts guests read before they book. Edit here once; channels use them unless they have their own.' },
  photos: { title: 'Photos', desc: 'Your photo library. Each channel picks its own selection and order from it.' },
  arrival: { title: 'Getting inside and setup', desc: 'How guests get in and settle in. Edit here once; channels use it unless they have their own.' },
  location: { title: 'Location', desc: 'Where the home is and what’s around it. Edit here once; channels use it unless they have their own.' },
  amenities: { title: 'Amenities', desc: 'Everything the home offers. Each channel lists what its own amenity list has room for.' },
  rules: { title: 'House rules', desc: 'Times and rules guests agree to. Edit here once; channels use them unless they have their own.' },
  pricing: { title: 'Pricing', desc: 'Default rates, fees and discounts. The calendar and Dynamic Pricing set prices for single dates.' },
  availability: { title: 'Availability', desc: 'How long guests can stay and how far ahead they can book.' },
  policies: { title: 'Booking policies', desc: 'Cancellation terms and how booking requests are handled.' },
  custom: { title: 'Custom facts', desc: 'Things guests ask about that no listing field holds. Your AI replies use them on every channel.' },
}

/** Extra words on a caption (after "Used by all channels" / "Only on Airbnb"). */
export const CAPTION_NOTE: Record<string, string> = {
  wifi_password: 'sent after booking',
  address: 'sent after booking',
  unit: 'sent after booking',
  checkout_tasks: 'Airbnb shows them as checkout instructions',
  'price:short_clean': 'for stays of 1–2 nights',
}
/** Why a channel owns a value ("Set by Booking.com · …") and what its locked control shows. */
export const SET_BY: Record<string, { why: string; shows?: string }> = {
  'price:weekly': { why: 'it runs its own deals', shows: 'Genius deals' },
  'price:monthly': { why: 'it runs its own deals', shows: 'Genius deals' },
  city: { why: 'locked once the listing is live' },
  country: { why: 'locked once the listing is live' },
  state: { why: 'locked once the listing is live' },
}

/* ---------- amenities with per-channel availability (Paper KH-E3; kit AMENITIES) ---------- */
export interface EAmenity {
  /** Store key suffix: `amenity:<key>` (the channel editor uses the same key for the names it shares). */
  key: string
  name: string
  on: ListingChannel[]
  /** The channel's own name for it ("Desk" on Booking.com): "Add as 'Desk'". */
  renamedAs?: Partial<Record<ListingChannel, string>>
  /** The channel has no such amenity to tick. */
  noEquivalent?: ListingChannel[]
  note?: Partial<Record<ListingChannel, string>>
}
export const E_AMENITIES: Array<{ group: string; items: EAmenity[] }> = [
  { group: 'Internet and office', items: [
    { key: 'Wi-Fi', name: 'Wi-Fi (250 Mbps)', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Dedicated workspace', name: 'Dedicated workspace', on: ['airbnb', 'direct'], renamedAs: { booking: 'Desk' } },
    { key: 'Monitor 27"', name: 'Monitor 27"', on: ['airbnb'], noEquivalent: ['booking'] },
  ] },
  { group: 'Kitchen and dining', items: [
    { key: 'Kitchen', name: 'Kitchen', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Dishwasher', name: 'Dishwasher', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Coffee maker', name: 'Coffee maker', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Electric kettle', name: 'Electric kettle', on: ['booking'] },
  ] },
  { group: 'Bedroom and laundry', items: [
    { key: 'Washer', name: 'Washer', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Essentials', name: 'Essentials', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Hangers', name: 'Hangers', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Iron', name: 'Iron', on: ['airbnb'] },
  ] },
  { group: 'Bathroom', items: [
    { key: 'Hair dryer', name: 'Hair dryer', on: ['booking'] },
    { key: 'Shampoo', name: 'Shampoo', on: ['airbnb', 'booking', 'direct'] },
    { key: 'Walk-in shower', name: 'Walk-in shower', on: ['booking', 'direct'] },
  ] },
  { group: 'Outdoor and building', items: [
    { key: 'Balcony', name: 'Balcony', on: ['booking'], note: { booking: 'Airbnb says there’s none', airbnb: 'Booking.com lists one', direct: 'Booking.com lists one' } },
    { key: 'Bike racks (shared)', name: 'Bike racks (shared)', on: ['airbnb', 'direct'] },
    { key: 'Self check-in', name: 'Self check-in', on: ['airbnb', 'direct'] },
  ] },
]

/* ---------- Sources (the drawer's second tab) ---------- */
export interface ESource { id: string; name: string; sub: string; icon: string; when: string; facts: string }
export const E_SOURCES: ESource[] = [
  { id: 'details', name: 'Property details', sub: 'From your listings · Airbnb, Booking.com', icon: 'file-text', when: 'Updated 29 Sep', facts: 'Gave 58 facts' },
  { id: 'messages', name: 'Message history', sub: '312 conversations, last 12 months', icon: 'message-circle', when: 'Updated today', facts: 'Gave 14 facts' },
  { id: 'rules', name: 'House rules', sub: 'Rules on every channel', icon: 'shield-check', when: 'Updated 29 Sep', facts: 'Gave 6 facts' },
  { id: 'guide', name: 'Guidebook (PDF)', sub: 'Neukölln guide.pdf · 14 pages', icon: 'book-2', when: 'Added 12 Sep', facts: 'Gave 21 facts' },
]
/** A property's sources: Neukölln's scripted four; any other property its listings and house rules (perProperty
 *  genericSources: no message history, no guidebook until the host adds one). */
export const sourcesFor = (pid: string): ESource[] => (isScenarioProperty(pid) ? E_SOURCES
  : genericSources(pid).map((x) => ({ id: x.id, name: x.title, sub: x.sub, icon: x.icon, when: x.meta, facts: `Gave ${x.facts} ${x.facts === 1 ? 'fact' : 'facts'}` })))
export const NEW_SOURCES: Array<{ id: string; label: string; icon: string; card: Omit<ESource, 'id'> }> = [
  { id: 'pdf', label: 'Upload a PDF', icon: 'file-text', card: { name: 'Welcome letter (PDF)', sub: 'welcome-letter.pdf · 3 pages', icon: 'file-text', when: 'Added just now', facts: 'Reading…' } },
  { id: 'link', label: 'Add a link', icon: 'link', card: { name: 'Your booking site', sub: 'artistflat.hostaway.rentals', icon: 'link', when: 'Added just now', facts: 'Reading…' } },
  { id: 'touchstay', label: 'Connect TouchStay', icon: 'book-2', card: { name: 'TouchStay guidebook', sub: 'Connected guidebook · 9 sections', icon: 'book-2', when: 'Added just now', facts: 'Reading…' } },
]

/** "Add source" for a property: the scripted cards for Neukölln; another property's booking site is its own. . */
export const newSourcesFor = (pid: string) => (isScenarioProperty(pid) ? NEW_SOURCES
  : NEW_SOURCES.map((n) => (n.id === 'link' ? { ...n, card: { ...n.card, sub: `${pid.replace(/-/g, '')}.hostaway.rentals` } } : n)))

/* ---------- "+ Add": the types, pre-scoped to the tab (Paper KH-E2) ---------- */
export type AddTypeId = 'task' | 'arrival' | 'resource' | 'amenity' | 'rule' | 'fee' | 'property' | 'place' | 'fact'
export interface AddType { id: AddTypeId; label: string; sub: string; icon: string; tab: KhSectionId; only?: ListingChannel; goes: string }
export const ADD_TYPES: AddType[] = [
  { id: 'task', label: 'Checkout task', sub: 'Before guests leave', icon: 'square-check', tab: 'arrival', only: 'airbnb', goes: 'Goes to Arrival' },
  { id: 'arrival', label: 'Arrival fact', sub: 'What guests need to get in', icon: 'file-text', tab: 'arrival', goes: 'Goes to Arrival' },
  { id: 'resource', label: 'Guest resource link', sub: 'Shared with %shortcodes%', icon: 'link', tab: 'arrival', goes: 'Goes to Arrival' },
  { id: 'property', label: 'Property fact', sub: 'Size, beds, anything guests ask', icon: 'home-2', tab: 'property', goes: 'Goes to Property' },
  { id: 'place', label: 'Place nearby', sub: 'A café, shop or stop guests ask about', icon: 'map-pin', tab: 'location', goes: 'Goes to Location' },
  { id: 'amenity', label: 'Amenity', sub: 'From the channels’ amenity lists', icon: 'wifi', tab: 'amenities', goes: 'Goes to Amenities' },
  { id: 'rule', label: 'House rule', sub: 'Added to your house rules', icon: 'shield-check', tab: 'rules', goes: 'Goes to House rules' },
  { id: 'fee', label: 'Fee or discount', sub: 'A charge or a deal', icon: 'coin', tab: 'pricing', goes: 'Goes to Pricing' },
  { id: 'fact', label: 'Custom fact', sub: 'Only your AI replies use it', icon: 'message-circle', tab: 'custom', goes: 'Goes to Custom facts' },
]
/** What "Elsewhere" offers (Paper: Amenity, House rule, Fee or discount), plus Custom fact. */
export const ELSEWHERE: AddTypeId[] = ['amenity', 'rule', 'fee', 'fact']

/* ---------- Ask: canned guest questions, answered from the chosen channel's values ---------- */
export type QuestionId = 'clean' | 'checkin' | 'keys' | 'parking' | 'wifi'
export const QUESTIONS: Array<{ id: QuestionId; q: string; match: RegExp }> = [
  { id: 'clean', q: 'How much is cleaning, and is there a discount for a week?', match: /clean|discount|week|fee/i },
  { id: 'checkin', q: 'What time is check-in?', match: /check.?in|arriv/i },
  { id: 'keys', q: 'Where should I leave the keys when I check out?', match: /key|check.?out|leave/i },
  { id: 'parking', q: 'Is there free parking?', match: /park|car/i },
  { id: 'wifi', q: 'Could you send me the Wi-Fi name and password?', match: /wi.?fi|internet|password/i },
]
/** "Guests often ask" (Paper: the first three). */
export const OFTEN: QuestionId[] = ['checkin', 'keys', 'parking']
