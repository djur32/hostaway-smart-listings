/* Accounts you can act as (S12 follow-up, 3 Oct · D-160…D-163). The four hosts are the research's own (personas.md,
 * INT-1…INT-4 pseudonyms: Marta, Dana, Callum, Priya; SIMULATED people, REAL·BRIEF persona types). No surnames, emails
 * or photos are made up: first name, the persona, and what their account holds.
 *
 * Dana is today's account, kept exactly as built (Antonio, 3 Oct: "the current one is the default"). Each account keeps
 * its own saved prototype state (app/account.ts), so switching never loses anyone's work. Accounts change WHAT you own
 * and the DEFAULTS and GUIDANCE you get (D-150), never what the product can do. */
import type { PersonaId } from './types'
import { PROPERTY_ID } from './scenario'

export type UserId = 'dana' | 'callum' | 'marta' | 'priya'

export interface UserDef {
  id: UserId
  name: string
  initials: string
  persona: PersonaId
  /** Role line in the account menu, the host's own words, not a label we stick on them. */
  role: string
  /** The properties this account manages. Priya has none until she connects Airbnb (see propertiesOf). */
  properties: string[]
  /** One line on what this account is for, from the persona's context (personas.md). */
  context: string
  /** Avatar colour role (tokens.css --color-account-*). */
  tone: 'dana' | 'callum' | 'marta' | 'priya'
  /** The channels this account uses on the demo flat, when narrower than the flat's three (Marta: Airbnb + Booking.com,
   *  personas.md P1). Priya's come from what she connects (data/portfolio.ts propertyChannels). */
  channels?: Array<'airbnb' | 'booking' | 'direct'>
}

const ALL = [
  PROPERTY_ID, 'kreuzberg-loft', 'friedrichshain-studio', 'mitte-courtyard', 'prenzlauer-family', 'wedding-garden',
  'charlottenburg-classic', 'tempelhof-park', 'moabit-studio', 'schoneberg-balcony', 'treptow-riverside', 'potsdam-lake',
]

export const USERS: Record<UserId, UserDef> = {
  dana: { id: 'dana', name: 'Dana', initials: 'D', persona: 'P2', role: 'Writes and tests every listing',
    properties: [PROPERTY_ID, 'kreuzberg-loft', 'mitte-courtyard', 'tempelhof-park', 'friedrichshain-studio'],
    context: 'A few homes on Airbnb, Booking.com and her own site. Tunes titles, photos and strategy per channel.', tone: 'dana' },
  callum: { id: 'callum', name: 'Callum', initials: 'C', persona: 'P3', role: 'Runs a portfolio for owners',
    properties: ALL,
    context: 'Many homes, many owners, a small team. Wants bulk changes with the exceptions shown first.', tone: 'callum' },
  marta: { id: 'marta', name: 'Marta', initials: 'M', persona: 'P1', role: 'Rents out the family flat',
    properties: [PROPERTY_ID],
    context: 'One home on Airbnb and Booking.com. Wants it to just work, and to hear only when something differs.', tone: 'marta',
    channels: ['airbnb', 'booking'] },
  priya: { id: 'priya', name: 'Priya', initials: 'P', persona: 'P4', role: 'Just joined Hospitable',
    properties: [PROPERTY_ID],
    // Antonio, 4 Oct: Priya is a new host on one listing already — no first-time setup anywhere (web or app)
    context: 'Just joined from Hostaway with one listing on Airbnb. It is already here, with no setup.', tone: 'priya',
    channels: ['airbnb'] },
}

export const USER_ORDER: UserId[] = ['dana', 'callum', 'marta', 'priya']
export const DEFAULT_USER: UserId = 'dana'
export const userForPersona = (p: PersonaId): UserId => USER_ORDER.find((u) => USERS[u].persona === p) ?? DEFAULT_USER

/* ---------- the current account (per browser tab, like the rest of the prototype's state) ---------- */
export const USER_KEY = 'hospitable-proto:user'
export function currentUserId(): UserId {
  try {
    const v = sessionStorage.getItem(USER_KEY) as UserId | null
    return v && v in USERS ? v : DEFAULT_USER
  } catch { return DEFAULT_USER }
}
export const currentUser = (): UserDef => USERS[currentUserId()]

/** What an account owns right now. Priya already has her one listing (Antonio, 4 Oct: no setup). */
export function propertiesOf(u: UserDef, _setupConnected: readonly string[]): string[] {
  return u.properties
}

/** Smart Listings' seeded default for a property in this account. Marta and Priya start with it off everywhere (it's
 *  opt-in, and Priya can't turn it on before first-time setup); Dana and Callum keep the data's per-property default. */
export const smartDefaultFor = (u: UserDef, dataDefault: boolean) => (u.id === 'marta' || u.id === 'priya' ? false : dataDefault)
