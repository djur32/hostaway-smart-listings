/* Knowledge Hub, reframed (plan/notion-v2/deck-review/KH-REFRAME.md, Antonio 4 Oct) · sample Inbox data.
 * SIMULATED throughout: the scenario property's guest questions are C's 47 clusters (C/data.ts, "312 conversations,
 * last 12 months"), grouped into Hospitable's nine Knowledge Hub topics by R's map (R/data.ts topicOf). This file adds
 * what the reframe needs on top of them, and nothing else:
 *   · how each question's asks split per channel and fall over the last 12 months (seeded, deterministic),
 *   · a few guest messages behind the questions (sample wording; the gaps' own messages come from C/data.ts GAPS),
 *   · one new question this month, shaped like the real "Ask the AI" example (HS-L08, REAL·PRODUCT: wheelchair access),
 *   · the tips a gap becomes: which Listing base field the answer goes into and the words it adds. Every added sentence
 *     comes from the demo property's own data (C/data.ts GAPS drafts, data/v3-kh.ts KH_CUSTOM); none is new.
 * No provenance chrome in the UI (Antonio: "nobody cares about that"); it lives here. */
import type { ListingChannel, WhyPoint } from '../../../../data/sl3'
import { f, one, type Question } from '../C/data'
import type { RTopicId } from '../R/data'

/* ---------- time: the last 12 months (Oct 2025 – Sep 2026; "this month" = September) ---------- */
export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] as const
export const MONTH_LONG = ['October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September']
export const THIS_MONTH = 11
/** Berlin's season (more stays in summer). Sums to 1. */
const SEASON = [0.08, 0.05, 0.06, 0.04, 0.04, 0.06, 0.08, 0.10, 0.11, 0.13, 0.13, 0.12]
const monthOf = (m: string) => Math.max(0, MONTHS.indexOf(m as (typeof MONTHS)[number]))

/** Conversations per channel over the 12 months (the 312 of C/data.ts SOURCES "Message history"). */
export const CONVERSATIONS: Record<ListingChannel, number> = { airbnb: 168, booking: 104, direct: 40 }
const SHARE: Record<ListingChannel, number> = { airbnb: 0.54, booking: 0.33, direct: 0.13 }
/** The same 312 conversations whatever channels an account has connected (audit, 4 Oct: Marta read 272 next to 399
 *  questions). Split over the account's channels by CONVERSATIONS' proportions, largest remainder. */
export function conversationsOf(chs: readonly ListingChannel[]): Record<ListingChannel, number> {
  const out: Record<ListingChannel, number> = { airbnb: 0, booking: 0, direct: 0 }
  if (!chs.length) return out
  const total = CONVERSATIONS.airbnb + CONVERSATIONS.booking + CONVERSATIONS.direct
  const w = chs.reduce((a, c) => a + CONVERSATIONS[c], 0)
  const raw = chs.map((c) => ({ c, v: (total * CONVERSATIONS[c]) / w }))
  let left = total
  for (const x of raw) { out[x.c] = Math.floor(x.v); left -= out[x.c] }
  raw.sort((a, b) => (b.v % 1) - (a.v % 1))
  for (let i = 0; i < left; i++) out[raw[i % raw.length].c] += 1
  return out
}

/** Asks per channel where the clusters lean one way: [Airbnb, Booking.com, Direct]. Everything else follows SHARE. */
const SPLIT: Record<string, [number, number, number]> = {
  'b-work': [17, 2, 3], 'a-wifi': [13, 3, 2], 'a-code': [8, 2, 2], 'a-instr': [17, 10, 4], 'a-time': [13, 9, 4], 'c-time': [10, 7, 2],
  'ar-airport': [7, 7, 2], 'ar-parking': [2, 6, 1], 'p-tax': [1, 4, 1], 'b-pets': [2, 5, 1], 's-hair': [3, 0, 2], 'a-early': [4, 1, 2],
  's-clean': [2, 1, 0], 'ar-sunday': [1, 3, 0], 'ar-late': [2, 1, 0], 's-smoke': [3, 2, 1], 's-trash': [5, 2, 1], 'c-keys': [3, 1, 1],
  's-access': [1, 1, 0],
}
/** Asks pinned to this month on top of the guest messages below (the "what's new" story): the only questions that
 *  count as new or asked more than usual this month, so the seeded spread never invents a trend. */
export const THIS_MONTH_ASKS: Record<string, number> = { 'ar-parking': 3, 's-access': 2 }

/* ---------- the guests' messages behind a question (sample wording) ---------- */
export type Reply = 'ai' | 'you'
export interface ConvoDef { guest: string; c: ListingChannel; when: (typeof MONTHS)[number]; text: string; reply: Reply }
export const CONVOS: Record<string, ConvoDef[]> = {
  'a-instr': [
    { guest: 'Jonas K.', c: 'airbnb', when: 'Sep', text: 'Could you send the check-in instructions? We land tomorrow afternoon.', reply: 'ai' },
    { guest: 'Maya P.', c: 'booking', when: 'Aug', text: 'How do we get into the flat when we arrive?', reply: 'ai' },
  ],
  'a-time': [
    { guest: 'Lena M.', c: 'airbnb', when: 'Aug', text: 'Hi! What time can we check in on Friday?', reply: 'ai' },
    { guest: 'Tom H.', c: 'booking', when: 'Jul', text: 'What time is check-in? Our train gets in around 2.', reply: 'ai' },
    { guest: 'Sofia R.', c: 'direct', when: 'May', text: 'Hello, from what time can we arrive?', reply: 'ai' },
  ],
  'a-wifi': [
    { guest: 'Daniel W.', c: 'airbnb', when: 'Sep', text: 'What’s the Wi-Fi password? I have a call at 9.', reply: 'ai' },
    { guest: 'Chloé B.', c: 'airbnb', when: 'Jun', text: 'Could you send me the Wi-Fi details?', reply: 'ai' },
  ],
  'a-code': [{ guest: 'Marco T.', c: 'airbnb', when: 'Aug', text: 'We’re outside, what’s the code for the street door?', reply: 'ai' }],
  'c-keys': [{ guest: 'Ana G.', c: 'booking', when: 'Jul', text: 'Where should we leave the keys when we go?', reply: 'ai' }],
  's-smoke': [
    { guest: 'Ben S.', c: 'booking', when: 'Aug', text: 'Is it ok to smoke on the balcony?', reply: 'ai' },
    { guest: 'Yuki N.', c: 'airbnb', when: 'May', text: 'Can I smoke outside on the balcony?', reply: 'ai' },
  ],
  's-trash': [
    { guest: 'Priya D.', c: 'airbnb', when: 'Sep', text: 'Where do we put the recycling? Is there a bin for paper?', reply: 'ai' },
    { guest: 'Lukas F.', c: 'direct', when: 'Jul', text: 'Where are the bins?', reply: 'ai' },
  ],
  'b-work': [{ guest: 'Hannah L.', c: 'airbnb', when: 'Sep', text: 'Is the desk good for a full work week? I’m on calls most days.', reply: 'ai' }],
  'c-time': [{ guest: 'Elif Y.', c: 'booking', when: 'Aug', text: 'What time do we need to check out?', reply: 'ai' }],
  'ar-airport': [{ guest: 'Sam O.', c: 'booking', when: 'Sep', text: 'How do we get to the flat from BER?', reply: 'ai' }],
  // the gaps: C/data.ts GAPS messages (the AI held, you replied by hand), plus this month's parking ask
  'ar-parking': [{ guest: 'Nina V.', c: 'booking', when: 'Sep', text: 'Can we park in front of the building during the day?', reply: 'you' }],
  's-access': [
    { guest: 'Ruth A.', c: 'booking', when: 'Sep', text: 'Is the flat wheelchair accessible? My father uses a wheelchair.', reply: 'ai' },
    { guest: 'Paul E.', c: 'airbnb', when: 'Sep', text: 'Is there step-free access to the apartment?', reply: 'ai' },
  ],
}
/** Names for the gaps' own messages (C/data.ts GAPS has the text, channel and month, not who wrote it). */
export const GAP_GUESTS = ['Felix R.', 'Clara S.', 'Omar B.', 'Ines T.', 'Jakob H.', 'Lucía M.', 'Noah P.', 'Emma W.', 'Mateo C.', 'Zoe K.', 'Leon D.', 'Mia J.', 'Theo G.', 'Sara L.']

/* ---------- one new question this month (shaped like Hospitable's own "Ask the AI" example, HS-L08) ----------
 * The answer quotes only the Listing base ("Other details to note": a 4th-floor walk-up with no elevator). It never says
 * more than that field does. */
export const EXTRA_QUESTIONS: Question[] = [
  { id: 's-access', stage: 'stay', q: 'Is the flat wheelchair accessible?', asked: 2, cov: 'a', kw: 'wheelchair accessible accessibility step-free stairs disabled mobility lift',
    facts: [f('other')], from: ['Descriptions'],
    answer: (r, c) => { const s = r.v('other', c).match(/[^.]*(?:walk-up|elevator)[^.]*\./i)?.[0]?.trim(); return one(s ? `It’s ${s.charAt(0).toLowerCase()}${s.slice(1)}` : 'I’m not sure, so I’ve asked your host.') } },
]
/** Topics for the new question, and where parking reads best (Transportation, not Arrival). */
export const EXTRA_TOPIC: Record<string, RTopicId> = { 's-access': 'amenities', 'ar-parking': 'transport' }

/* ---------- gaps become tips: where the answer goes in the Listing base, and the words it adds ---------- */
export interface KqTipDef {
  id: string
  /** The question it answers. */
  question: string
  /** The Listing base field it adds to; `amenity:<name>` lists an amenity on every channel. */
  field: string
  title: string
  /** The sentence(s) added to the end of the field. */
  add?: string
  amenity?: string
  /** A phrase only the added words have: when the Listing base holds it, the question is answered. */
  marker?: string
  /** The clauses of the field the AI quotes for this question. */
  quote: RegExp
  /** What the AI tells guests while nothing backs the answer (it says so and asks the host; it never guesses). */
  hold: string
  /** What the Listing base (or an answer the host confirmed) already says on it: a partly answered question. */
  known?: Array<{ key: string; line: (v: string) => string | undefined }>
  /** Why the AI can't answer it today, in one line (a Knowledge Hub reason). */
  missing: string
  /** Where the words came from. */
  drafted?: string
}
export const KQ_TIPS: KqTipDef[] = [
  { id: 'kq-parking', question: 'ar-parking', field: 'getting_around', title: 'Say where guests can park during the day',
    add: ' There’s no private parking. During the day, the Karstadt garage on Hermannplatz (€2.50 an hour) is a 6-minute walk; street parking is also free on Sundays.',
    marker: 'Karstadt garage', quote: /park|garage/i,
    known: [{ key: 'getting_around', line: (v) => v.split(/[.;]\s*/).map((x) => x.trim()).find((x) => /parking/i.test(x))?.replace(/^./, (m) => m.toUpperCase()).concat('.') }],
    hold: 'Nothing in the listing says where to park during the day, so I’ve asked {host} and will get back to you.',
    missing: 'The Listing base only says street parking is free after 20:00, so the AI can’t say where to park during the day.',
    drafted: 'Written from your replies to 3 guests.' },
  { id: 'kq-early', question: 'a-early', field: 'other', title: 'Say whether guests can check in early',
    add: ' Early check-in is possible when nobody leaves that morning; I confirm it the day before.',
    marker: 'Early check-in is possible', quote: /early check-in/i,
    hold: 'Nothing in the listing says whether you can check in earlier, so I’ve asked {host}.',
    known: [{ key: 'checkin', line: (v) => (v ? `Check-in starts at ${v}.` : undefined) }, { key: 'kh.luggage', line: (v) => v || undefined }],
    missing: 'The Listing base has the check-in time, but nothing on checking in earlier.',
    drafted: 'Written from your replies to 5 guests.' },
  { id: 'kq-tax', question: 'p-tax', field: 'other', title: 'Say how the city tax works',
    add: ' Berlin’s city tax is 7.5% of the room price and comes on top: Airbnb collects it when you book; on Booking.com and my site it’s added to the total.',
    marker: 'city tax', quote: /city tax/i,
    hold: 'I’m not sure whether the city tax is included, so I’ve asked {host} and will get back to you.',
    missing: 'No Listing base field mentions the city tax.',
    drafted: 'Written from your replies to 2 guests.' },
  { id: 'kq-hair', question: 's-hair', field: 'amenity:Hair dryer', amenity: 'Hair dryer', title: 'List the hair dryer on every channel',
    quote: /hair dryer/i,
    hold: 'I can’t see a hair dryer in this listing, so I’ll check with {host}.',
    missing: 'Only Booking.com lists a hair dryer, so the AI can confirm it to Booking.com guests only.' },
  { id: 'kq-sunday', question: 'ar-sunday', field: 'neighbourhood', title: 'Say what’s open on Sundays',
    add: ' Most supermarkets close on Sundays; the shops in the bigger train stations stay open, and the Späti on the corner of Weserstraße sells the basics.',
    marker: 'Späti', quote: /sunday|späti|supermarket/i,
    hold: 'I’m not sure what’s open on Sunday, so I’ve asked {host}.',
    missing: 'The Listing base describes the area, not what’s open on Sundays.',
    drafted: 'Written from your replies to 2 guests.' },
  { id: 'kq-late', question: 'ar-late', field: 'neighbourhood', title: 'Say where to eat late',
    add: ' Weserstraße and Sonnenallee have restaurants open until midnight, and the falafel places on Sonnenallee stay open even later.',
    marker: 'open until midnight', quote: /midnight|late/i,
    hold: 'I’m not sure what’s open late, so I’ve asked {host}.',
    known: [{ key: 'neighbourhood', line: (v) => (/cafés and bakeries on Weserstraße/i.test(v) ? 'There are cafés and bakeries on Weserstraße, around the corner.' : undefined) }],
    missing: 'The Listing base mentions the cafés on Weserstraße, not what’s open late.',
    drafted: 'Written from your replies to 2 guests and your Neukölln guide.' },
  { id: 'kq-clean', question: 's-clean', field: 'other', title: 'Say whether you clean during longer stays',
    add: ' For stays of a week or more, a mid-stay clean with fresh towels and bed linen is €35; ask me and I’ll book it.',
    marker: 'mid-stay clean', quote: /mid-stay/i,
    hold: 'I’ll check with {host} about cleaning during your stay and get back to you.',
    missing: 'Nothing in the Listing base covers cleaning during a stay.',
    drafted: 'Written from your replies to 3 guests.' },
]
export const tipForQuestion = (qid: string) => KQ_TIPS.find((t) => t.question === qid)

/* ---------- the per-channel and per-month counts (seeded, deterministic) ---------- */
const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h }
const frac = (s: string) => (hash(s) % 1000) / 1000

/** Largest-remainder split of `n` over `chs` by SHARE. */
function splitOf(id: string, n: number, chs: ListingChannel[]): Record<ListingChannel, number> {
  const out: Record<ListingChannel, number> = { airbnb: 0, booking: 0, direct: 0 }
  const fixed = SPLIT[id]
  if (fixed && chs.length === 3) { out.airbnb = fixed[0]; out.booking = fixed[1]; out.direct = fixed[2]; return out }
  const w = chs.reduce((a, c) => a + SHARE[c], 0)
  const raw = chs.map((c) => ({ c, v: (n * SHARE[c]) / w }))
  let left = n
  for (const x of raw) { out[x.c] = Math.floor(x.v); left -= out[x.c] }
  raw.sort((a, b) => (b.v % 1) - (a.v % 1) || frac(id + a.c) - frac(id + b.c))
  for (let i = 0; i < left; i++) out[raw[i % raw.length].c] += 1
  return out
}
const CUM = SEASON.reduce<number[]>((acc, w) => [...acc, (acc[acc.length - 1] ?? 0) + w], [])
/** One ask per item: its channel and month. Systematic sampling over the season, then the pinned months win. */
export interface Ask { c: ListingChannel; month: number }
export function asksOf(id: string, n: number, chs: ListingChannel[], pinned: Array<{ c: ListingChannel; month: number }>): Ask[] {
  if (!chs.length) return [] // an account with no channel connected has no Inbox history to split
  const by = splitOf(id, n, chs)
  const asks: Ask[] = []
  for (const c of chs) {
    const k = by[c]
    const seed = frac(`${id}:${c}`)
    for (let i = 0; i < k; i++) {
      const u = Math.min(0.999, (i + seed) / Math.max(1, k))
      asks.push({ c, month: CUM.findIndex((x) => x >= u) })
    }
  }
  // the guests' messages and this month's asks sit in their own months (on an ask of their channel)
  const used = new Set<number>()
  for (const p of pinned) {
    const i = asks.findIndex((a, k) => !used.has(k) && a.c === p.c)
    const j = i >= 0 ? i : asks.findIndex((_, k) => !used.has(k))
    if (j < 0) continue
    asks[j] = { c: asks[j].c, month: p.month }
    used.add(j)
  }
  const extra = THIS_MONTH_ASKS[id] ?? 0
  const already = asks.filter((a, k) => used.has(k) && a.month === THIS_MONTH).length
  for (let k = 0, need = extra - already; k < asks.length && need > 0; k++) {
    if (used.has(k)) continue
    asks[k] = { ...asks[k], month: THIS_MONTH }; used.add(k); need--
  }
  return asks
}
export const pinsOf = (msgs: Array<{ c: ListingChannel; when: string }>) => msgs.map((m) => ({ c: m.c, month: monthOf(m.when) }))
export { monthOf }

/* ---------- the tip's "why", from the questions behind it (Inbox) and the Listing base (Knowledge Hub) ---------- */
export function tipWhy(t: KqTipDef, q: { label: string; total: number; by: Record<ListingChannel, number> }, chs: ListingChannel[], name: (c: ListingChannel) => string): WhyPoint[] {
  const top = [...chs].sort((a, b) => q.by[b] - q.by[a])[0]
  const lean = top && q.total >= 3 && q.by[top] / q.total >= 0.6 ? `, ${q.by[top]} of them on ${name(top)}` : ''
  const out: WhyPoint[] = [{ text: `${q.total} guests asked “${q.label}” in the last 12 months${lean}.`, source: 'inbox' }, { text: t.missing, source: 'hub' }]
  if (t.drafted) out.push({ text: t.drafted, source: 'inbox' })
  return out
}
