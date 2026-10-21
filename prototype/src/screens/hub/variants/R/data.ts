/* Knowledge Hub iteration R · data (concepts/knowledge-hub/KH-NEXT.md, "Revision · 1 Oct").
 * The nine topics are Hostaway's real Knowledge Hub categories (ref 08); the fact-type taxonomy and the
 * question→topic remap are this iteration's own, built on top of C's 48 scripted questions (C/data.ts) and
 * the generic question set (C/generic.ts) so every answer and every fact is reused, never re-authored. */
import type { ListingChannel } from '../../../../data/sl3'
import { detailOf } from '../../../../data/portfolio'
import { currentUser } from '../../../../data/users'
import type { Answer, Question, Reader } from '../C/data'

/* ---------- the nine topics (ref 08-hostaway-kh-topics.png) ----------
 * `icon` and `desc` (Agent R-overview2, second revision): the Overview's topic cards need an icon and a one-line
 * description per topic; both are this iteration's own words, the icons picked from the sprite we already
 * ship (ds/icons/sprite.svg) rather than inventing new art. */
export type RTopicId = 'amenities' | 'arrival' | 'cleaning' | 'contact' | 'departure' | 'rules' | 'transport' | 'trash' | 'wifi'
export const R_TOPICS: Array<{ id: RTopicId; label: string; icon: string; desc: string }> = [
  { id: 'amenities', label: 'Amenities', icon: 'tools-kitchen-2', desc: 'Every amenity and appliance guests ask about, and how they work.' },
  { id: 'arrival', label: 'Arrival', icon: 'home-2', desc: 'Check-in times, access and directions for getting inside.' },
  { id: 'cleaning', label: 'Cleaning & Maintenance', icon: 'brush', desc: 'Housekeeping, fixes and what to do if something breaks.' },
  { id: 'contact', label: 'Contact Details', icon: 'mail', desc: 'How guests reach you, and who to contact during the stay.' },
  { id: 'departure', label: 'Departure', icon: 'arrow-bar-to-right', desc: 'Check-out time, tasks and what to do with the keys.' },
  { id: 'rules', label: 'Rules & Regulations', icon: 'clipboard-check', desc: 'House rules: pets, guests, smoking, parties and more.' },
  { id: 'transport', label: 'Transportation to/from property', icon: 'world', desc: 'Getting here and getting around: transport, parking and directions.' },
  { id: 'trash', label: 'Trash & Recycling', icon: 'trash', desc: 'Where the bins are and how collection works.' },
  { id: 'wifi', label: 'Wifi/Internet', icon: 'wifi', desc: 'The network name, password and how to connect.' },
]
export const isRTopic = (t?: string | null): t is RTopicId => !!t && R_TOPICS.some((x) => x.id === t)
export const topicLabel = (id: RTopicId) => R_TOPICS.find((t) => t.id === id)!.label
export const topicIcon = (id: RTopicId) => R_TOPICS.find((t) => t.id === id)!.icon
export const topicDesc = (id: RTopicId) => R_TOPICS.find((t) => t.id === id)!.desc

/* ---------- the fact-type taxonomy ---------- */
export type RFactKind = 'yesno' | 'text' | 'number' | 'time' | 'steps' | 'contact' | 'place' | 'link'
export const R_FACT_KINDS: Array<{ id: RFactKind; label: string; icon: string }> = [
  { id: 'yesno', label: 'Yes / No', icon: 'circle-check' },
  { id: 'text', label: 'Text', icon: 'file-text' },
  { id: 'number', label: 'Number + unit', icon: 'tag' },
  { id: 'time', label: 'Time', icon: 'clock' },
  { id: 'steps', label: 'Steps', icon: 'list-details' },
  { id: 'contact', label: 'Contact', icon: 'user' },
  { id: 'place', label: 'Place / address', icon: 'map-pin' },
  { id: 'link', label: 'Link or document', icon: 'link' },
]
export const kindOf = (id: RFactKind) => R_FACT_KINDS.find((k) => k.id === id)!

/* ---------- where an added fact comes from (KH-NEXT-3.md, "if you add a fact and it comes from somewhere,
 * make sure you can choose that, and you should be able to see where something comes from") — a short fixed list, the
 * same vocabulary Sources.tsx already uses for what the AI reads ("Listing details", "Past guest conversations"), not
 * a new subsystem. The host picks one in the Add-fact flow; every fact (seeded or added) shows it via `RFactRow`'s
 * existing `source` prop. ---------- */
export const R_FACT_SOURCES = ['Told by the host', 'From a past guest conversation', 'From the listing', 'From a guidebook or document'] as const
export type RFactSource = typeof R_FACT_SOURCES[number]

/** A plain time list for the "Time" fact type (half-hour steps; no native time input, the rule). */
export const R_TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 6; h <= 23; h++) for (const m of [0, 30]) {
    const hh = ((h + 11) % 12) + 1
    out.push(`${hh}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`)
  }
  out.push('Flexible')
  return out
})()

/* ---------- question → topic remap (C/data.ts QUESTIONS + C/generic.ts genericQuestions ids) ----------
 * Suggested by R-BRIEF.md, adjusted where the content reads better elsewhere (noted inline). "Every question belongs to
 * exactly one topic". `p-week` is dropped outright (date-specific); `p-tomorrow` is reworded and re-answered
 * below, not dropped. */
const QUESTION_TOPIC: Record<string, RTopicId> = {
  // amenities
  'b-work': 'amenities', 'b-washer': 'amenities', 's-heat': 'amenities', 's-kitchen': 'amenities', 's-hair': 'amenities', 's-dish': 'amenities', 's-bike': 'amenities',
  'b-guests': 'amenities', 'b-whole': 'amenities', // leftover (property-general): closest to "what the place offers"
  // arrival
  'a-instr': 'arrival', 'a-time': 'arrival', 'a-code': 'arrival', 'a-early': 'arrival', 'a-late': 'arrival', 'a-elevator': 'arrival', 'ar-parking': 'arrival',
  'a-in': 'arrival', 'a-address': 'arrival', // generic.ts ids (non-scenario properties)
  // cleaning & maintenance
  's-clean': 'cleaning', 's-broken': 'cleaning',
  // contact details
  's-contact': 'contact',
  // departure
  'c-time': 'departure', 'c-tasks': 'departure', 'c-late': 'departure', 'c-keys': 'departure', 'c-bags': 'departure',
  // rules & regulations
  'b-pets': 'rules', 'b-kids': 'rules', 'p-min': 'rules', 'p-cancel': 'rules', 'p-clean': 'rules', 'p-tax': 'rules',
  'p-discount': 'rules', 'p-guest5': 'rules', 'p-extra': 'rules', 's-smoke': 'rules', 's-friends': 'rules', 'p-tomorrow': 'rules',
  'b-quiet': 'rules', // leftover: quiet hours is a house rule
  's-rules': 'rules', // generic.ts
  // transportation to/from property
  'ar-airport': 'transport', 'ar-ubahn': 'transport', 'ar-bike': 'transport',
  'ar-neigh': 'transport', 'ar-cafes': 'transport', 'ar-feld': 'transport', 'ar-sunday': 'transport', 'ar-late': 'transport', // leftover (area/local)
  'ar-around': 'transport', // generic.ts
  // trash & recycling
  's-trash': 'trash', // not named in R-BRIEF's table, but it obviously belongs here and already has a backing fact (kh.trash)
  // wifi/internet
  'a-wifi': 'wifi',
}
/** Dropped outright ("don't talk about specific weeks"). */
export const DROPPED_QUESTIONS = new Set(['p-week'])
/** Reworded away from a relative-to-today phrasing ("book for tomorrow" depends on when you ask). */
export const REWORDED_TEXT: Record<string, string> = { 'p-tomorrow': 'How much notice do you need before a booking?' }
/** Re-answered to match the reworded question (drops "today or tomorrow"). */
const ANSWER_OVERRIDE: Record<string, (r: Reader, c: ListingChannel) => Answer> = {
  'p-tomorrow': (r, c) => ({ text: [r.v('avail:advance', c) === 'None' ? 'No notice needed. Same-day bookings are fine if the dates are free.' : `Bookings need ${r.v('avail:advance', c)}’s notice.`] }),
}

export const topicOf = (qid: string): RTopicId | undefined => QUESTION_TOPIC[qid]
export const questionLabel = (q: Question) => REWORDED_TEXT[q.id] ?? q.q
export const answerFor = (q: Question, r: Reader, c: ListingChannel): Answer => (ANSWER_OVERRIDE[q.id] ? ANSWER_OVERRIDE[q.id](r, c) : q.answer(r, c))
/** Every question R shows: has a topic, isn't dropped. */
export const rQuestions = (qs: Question[]) => qs.filter((q) => !DROPPED_QUESTIONS.has(q.id) && topicOf(q.id))

/* ---------- the Contact topic's seed fact ----------
 * No phone/email field exists anywhere in the data model (deterministic per property, not randomised, so it
 * reads the same every time). The name is real data (data/portfolio.ts detailOf().owner). */
export function hostContactOf(pid: string): { name: string; phone: string; email: string } {
  const owner = detailOf(pid).owner
  const name = owner === 'You' ? currentUser().name : owner // the signed-in host
  let seed = 0
  for (const ch of pid) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const digits = String(2_000_000 + (seed % 7_999_999)).padStart(7, '0')
  const phone = `+49 30 ${digits.slice(0, 3)} ${digits.slice(3)}`
  const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}@${pid.split('-')[0]}.stay`
  return { name, phone, email }
}
/** Pipe-encoding for composite fact values, consistent across the Contact type: "name|phone|email". */
export const encodeContact = (c: { name: string; phone: string; email: string }) => [c.name, c.phone, c.email].join('|')
export const decodeContact = (v: string): { name: string; phone: string; email: string } => {
  const [name = '', phone = '', email = ''] = v.split('|')
  return { name, phone, email }
}
/** "2|nights" for the Number + unit type. */
export const encodeNumber = (n: string, unit: string) => `${n}|${unit}`
export const decodeNumber = (v: string): { n: string; unit: string } => { const [n = '', unit = ''] = v.split('|'); return { n, unit } }

/** How a typed fact's value reads in the facts list, by kind. */
export function displayRFactValue(kind: RFactKind, value: string): string {
  switch (kind) {
    case 'yesno': return value === 'yes' ? 'Yes' : 'No'
    case 'number': { const { n, unit } = decodeNumber(value); return unit ? `${n} ${unit}` : n }
    case 'steps': return value.split('\n').filter((s) => s.trim()).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')
    case 'contact': { const c = decodeContact(value); return [c.name, c.phone, c.email].filter(Boolean).join(' · ') }
    default: return value
  }
}
