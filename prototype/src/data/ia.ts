/* IA-R (ia/recommendation.md §3, D-110): the property rail, the tabs inside each section, and where each canonical
 * group lives. The ONE place the rail is defined, a G3 or OQ-111 change edits this file, not the screens (D-128). */
import type { SectionId } from './types'

export interface RailItem {
  key: string
  label: string
  icon: string
  /** Path under /property/:id/ (or a global path when `global`). */
  path: string
  global?: boolean
  tabs?: string[]
}

export const PROPERTY_RAIL: RailItem[] = [
  { key: 'overview', label: 'Overview', icon: 'home', path: 'overview', tabs: ['Needs you', 'Channels', 'Nickname & IDs'] },
  { key: 'home', label: 'The home', icon: 'home-heart', path: 'home',
    tabs: ['The basics', 'Rooms', 'Amenities & safety', 'Location & area', 'Photos', 'Listing text'] },
  { key: 'arrival', label: 'Arrival & stay', icon: 'clock', path: 'arrival',
    tabs: ['Check-in & check-out', 'Getting there & in', 'Wi-Fi & house manual', 'Before leaving', 'What the assistant answers'] },
  { key: 'rules', label: 'Rules & booking', icon: 'shield-check', path: 'rules',
    tabs: ['House rules & regulations', 'Stay rules', 'Booking mode', 'Cancellation'] },
  { key: 'pricing', label: 'Pricing', icon: 'coin', path: 'pricing',
    tabs: ['Rates', 'Fees & deposit', 'Taxes & discounts', 'Channel markups'] },
  { key: 'listings', label: 'Listings', icon: 'stack-2', path: 'listing' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar', path: '/calendar', global: true },
  { key: 'guest', label: 'Guest experience', icon: 'heart', path: 'guest' },
  { key: 'operations', label: 'Operations', icon: 'square-check', path: 'operations' },
]

/** Tabs of a channel's Listings page (rule 5). */
/** S12 adds Stats (D-156): performance over time, versions compared, tests. S11's "Performance & similar" keeps comps & market. */
export const LISTING_TABS = ['Status & receipts', 'Preview', 'What differs', 'History', 'Stats', 'Performance & similar'] as const

/** Global sidebar (unchanged from today, ia/recommendation.md §3). */
export const SIDEBAR = [
  { key: 'home', label: 'Home', icon: 'home', path: '/home' },
  { key: 'inbox', label: 'Inbox', icon: 'mail', path: '/inbox' },
  { key: 'properties', label: 'Properties', icon: 'building', path: '/' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar', path: '/calendar' },
  { key: 'guest', label: 'Guest experience', icon: 'heart', path: '/guest-experience', chevron: true },
  { key: 'metrics', label: 'Metrics', icon: 'chart-line', path: '/metrics' },
  { key: 'direct', label: 'Direct bookings', icon: 'send', path: '/direct' },
  { key: 'devices', label: 'Devices', icon: 'wifi', path: '/devices', chevron: true },
  { key: 'operations', label: 'Operations', icon: 'square-check', path: '/operations', chevron: true },
] as const

export const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/** canonical-fields.csv `group` → IA-R section + tab. Overrides per field below (placements.csv column IA-R). */
const GROUP_HOME: Record<string, [SectionId, string]> = {
  'Identity & location': ['home', 'Location & area'],
  'Space & capacity': ['home', 'The basics'],
  Amenities: ['home', 'Amenities & safety'],
  Safety: ['home', 'Amenities & safety'],
  Photos: ['home', 'Photos'],
  'Listing text': ['home', 'Listing text'],
  'Arrival & departure': ['arrival', 'Check-in & check-out'],
  'Guest knowledge': ['arrival', 'Wi-Fi & house manual'],
  'Rules & regulations': ['rules', 'House rules & regulations'],
  'Booking & policies': ['rules', 'Stay rules'],
  Pricing: ['pricing', 'Rates'],
  'Fees & deposits': ['pricing', 'Fees & deposit'],
  'Custom facts': ['home', 'The basics'],
}

const FIELD_HOME: Record<string, [SectionId, string]> = {
  'identity.property_type': ['home', 'The basics'],
  'identity.place_type': ['home', 'The basics'],
  'identity.nickname': ['home', 'The basics'],
  'location.licence_number': ['rules', 'House rules & regulations'],
  'space.bedrooms': ['home', 'Rooms'],
  'space.beds': ['home', 'Rooms'],
  'space.bathrooms_full': ['home', 'Rooms'],
  'space.bathrooms_half': ['home', 'Rooms'],
  'arrival.checkin_method': ['arrival', 'Getting there & in'],
  'arrival.checkin_instructions': ['arrival', 'Getting there & in'],
  'arrival.door_code': ['arrival', 'Getting there & in'],
  'arrival.directions': ['arrival', 'Getting there & in'],
  'arrival.wifi_details': ['arrival', 'Wi-Fi & house manual'],
  'arrival.checkout_tasks': ['arrival', 'Before leaving'],
  'policy.cancellation': ['rules', 'Cancellation'],
  'policy.cancellation_long_stay': ['rules', 'Cancellation'],
  'booking.instant_book': ['rules', 'Booking mode'],
  'price.channel_markup': ['pricing', 'Channel markups'],
  'price.weekly_discount': ['pricing', 'Taxes & discounts'],
  'price.monthly_discount': ['pricing', 'Taxes & discounts'],
  'tax.local': ['pricing', 'Taxes & discounts'],
  'custom.nearest_transit': ['home', 'Location & area'],
  'custom.canal_view': ['home', 'Amenities & safety'],
  'custom.bike_storage': ['home', 'Amenities & safety'],
  'custom.shoes_off': ['rules', 'House rules & regulations'],
}

export function homeOf(fieldId: string, group: string): [SectionId, string] {
  return FIELD_HOME[fieldId] ?? GROUP_HOME[group] ?? ['home', 'The basics']
}
