/* KH-B · "Test your AI": canned answers per question and channel, each sentence citing the facts it used.
 * Answers are built from the live fact values (store Base + channel values), so editing a fact changes the answer.
 * Neukölln (the scenario): suggested questions ranked by how often guests asked them in message history (SIMULATED counts
 * and wording). Every other property: the standard guest questions (perProperty GENERIC_QUESTIONS), no counts, answered
 * from its own values (ASSUMPTION wording). */
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import { GENERIC_QUESTIONS, genericAnswer, matchGeneric } from '../../perProperty'

export interface Sentence { text: string; cites: string[] }
export interface Answer { covered: boolean; sentences: Sentence[]; section?: KhSectionId; prefill?: string }
/** Reads a fact for the channel the guest booked on: the raw value ('' if the channel doesn't have it). */
export type Get = (key: string) => string
export interface Ctx { scenario: boolean; get: Get; ch: ListingChannel; amenityOn: (re: RegExp) => string | null; added: Array<{ key: string; label: string; value: string }> }

export interface Question { id: string; q: string; asked?: number }
export const QUESTIONS: Question[] = [
  { id: 'checkin', q: 'What time is check-in?', asked: 41 },
  { id: 'keys', q: 'Where should I leave the keys when I check out?', asked: 35 },
  { id: 'parking', q: 'Is there free parking?', asked: 27 },
  { id: 'wifi', q: 'Could you send me the Wi-Fi?', asked: 22 },
  { id: 'smoke', q: 'Where can I smoke?', asked: 9 },
  { id: 'pets', q: 'Can I bring my dog?', asked: 7 },
  { id: 'cot', q: 'Do you have a baby cot?', asked: 3 },
]
const KEYWORDS: Array<[string, RegExp]> = [
  ['keys', /\bkeys?\b|leave.*(check ?out|go)/i], ['checkin', /check.?in|arriv/i], ['parking', /park|car\b/i], ['wifi', /wi.?fi|internet|password/i],
  ['smoke', /smok|cigar/i], ['pets', /\b(dog|cat|pet)s?\b/i], ['cot', /\b(cot|crib|baby)\b/i],
]
const GUESS: Array<[KhSectionId, RegExp]> = [
  ['pricing', /price|fee|cost|pay|€|late check|early check|discount/i], ['arrival', /key|door|code|check.?in|check.?out|towel|luggage/i],
  ['location', /bus|train|metro|u-?bahn|airport|walk|near|restaurant|shop/i], ['rules', /pet|smok|party|noise|quiet|guest/i],
  ['amenities', /have|towel|iron|hair|kitchen|washer|dryer|tv|cot|crib|balcony|air/i], ['availability', /night|stay|book|minimum/i],
]

const first = (t: string) => (t.match(/^[^.!?]+[.!?]/)?.[0] ?? t).trim()
const sentences = (t: string) => t.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [t]
const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

/** The suggested questions: Neukölln's, ranked by message history, or the standard ones (no counts). */
export const questionsFor = (scenario: boolean): Question[] => (scenario ? QUESTIONS : GENERIC_QUESTIONS.map((g) => ({ id: g.id, q: g.q })))
export const questionText = (ask: string, scenario = true) => questionsFor(scenario).find((q) => q.id === ask)?.q ?? ask

/** The answer to a suggested question (by id) or a typed one. */
export function answer(ask: string, c: Ctx): Answer {
  if (!c.scenario) {
    // a suggested question, else a typed one: the host's own facts first, then the standard questions
    const gid = GENERIC_QUESTIONS.some((q) => q.id === ask) ? ask : addedHit(ask, c) ? undefined : matchGeneric(ask)?.id
    // Check-in time ends reads with Check-in on the page, so the answer cites Check-in for both
    if (gid) return { covered: true, sentences: genericAnswer(gid, c.get).map((x) => ({ text: x.text, cites: [...new Set(x.cites.map((k) => (k === 'checkin_end' ? 'checkin' : k)))] })) }
    return fromAdded(ask, c)
  }
  const id = QUESTIONS.some((q) => q.id === ask) ? ask : KEYWORDS.find(([, re]) => re.test(ask))?.[0]
  const { get } = c
  switch (id) {
    case 'keys': return { covered: true, sentences: [
      { text: `Please ${lc(first(get('kh.checkout_instructions')))}`, cites: ['kh.checkout_instructions'] },
      { text: `Checkout is at ${get('checkout')}; the street-door code stops working then.`, cites: ['checkout'] },
      { text: 'Thanks for staying, and safe travels!', cites: [] },
    ] }
    case 'checkin': {
      const d = sentences(get('method_details'))
      return { covered: true, sentences: [
        { text: `Check-in is from ${get('checkin')} to ${get('checkin_end')}.`, cites: ['checkin'] },
        { text: d[0], cites: ['method_details'] },
        ...(d.length > 2 ? [{ text: d[d.length - 1], cites: ['method_details'] }] : []),
      ] }
    }
    case 'parking': {
      const p = sentences(get('kh.parking'))
      return { covered: true, sentences: p.map((s) => ({ text: s, cites: ['kh.parking'] })) }
    }
    case 'wifi': return { covered: true, sentences: [
      { text: `Of course! The network is ${get('wifi_name')} and the password is ${get('wifi_password')}.`, cites: ['wifi_name', 'wifi_password'] },
      { text: 'Enjoy your stay!', cites: [] },
    ] }
    case 'smoke': {
      const rules = get('house_rules')
      const rule = rules.split(/(?<=[.])\s+|\s·\s/).find((x) => /smok/i.test(x))
      return { covered: true, sentences: [
        { text: get('smoking') === 'Yes' ? 'Smoking is allowed in the flat.' : 'Smoking isn’t allowed in the flat.', cites: ['smoking'] },
        ...(rule ? [{ text: `The house rules say: “${rule.replace(/\.$/, '').replace(/^./, (x) => x.toUpperCase())}.”`, cites: ['house_rules'] }] : []),
        { text: 'Thanks for understanding!', cites: [] },
      ] }
    }
    case 'pets': {
      const yes = get('pets') === 'Yes'
      return { covered: true, sentences: yes ? [
        { text: 'Yes, your dog is welcome!', cites: ['pets'] },
        { text: `There’s a pet fee of €${get('price:pet')} per stay.`, cites: ['price:pet'] },
      ] : [
        { text: 'Sorry, pets aren’t allowed in the flat.', cites: ['pets'] },
        { text: 'Assistance animals are always welcome.', cites: [] },
      ] }
    }
    case 'cot': {
      const key = c.amenityOn(/cot|crib/i)
      if (key) return { covered: true, sentences: [
        { text: `Yes, there’s a ${lc(key.slice(8))} you can use.`, cites: [key] },
        { text: 'Just let me know and I’ll have it set up before you arrive.', cites: [] },
      ] }
      return { covered: false, sentences: [], section: 'amenities', prefill: 'Baby cot' }
    }
  }
  return fromAdded(ask, c)
}
/** A typed question: look in the facts the host added; otherwise say so and point at the likeliest section. */
function addedHit(ask: string, c: Ctx) {
  const words = ask.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3)
  const score = (f: { label: string; value: string }) => words.reduce((n, w) => n + (f.label.toLowerCase().includes(w) ? 2 : f.value.toLowerCase().includes(w) ? 1 : 0), 0)
  return c.added.map((f) => ({ f, n: score(f) })).sort((a, b) => b.n - a.n).find((x) => x.n >= 2)?.f
}
function fromAdded(ask: string, c: Ctx): Answer {
  const hit = addedHit(ask, c)
  if (hit) return { covered: true, sentences: [...sentences(hit.value).map((s) => ({ text: s, cites: [hit.key] }))] }
  return { covered: false, sentences: [], section: GUESS.find(([, re]) => re.test(ask))?.[0] ?? 'custom' }
}

/** Citation numbers: each fact gets the number of its first appearance. */
export function citeNumbers(a: Answer): Array<[string, number]> {
  const out: Array<[string, number]> = []
  for (const s of a.sentences) for (const k of s.cites) if (!out.some(([x]) => x === k)) out.push([k, out.length + 1])
  return out
}
