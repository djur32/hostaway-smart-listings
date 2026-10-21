/* KH-C · the standard guest questions for a property that isn't the scenario one (multi-property, QA B01/B02).
 * Neukölln keeps its 48 questions clustered from 312 conversations (data.ts, SIMULATED). Every other property has no message
 * history yet, so its questions are the standard ones every host gets (ASSUMPTION), spread over the journey stages. Each
 * answer is built from the property's own Hub facts per channel (perProperty genericAnswer where it fits), and its coverage
 * is computed from them: answered when every channel has the facts, partly when some do, not answered when none do.
 * No "asked N times" counts, no gaps (they come from guest messages), no message history or guidebook. */
import type { ListingChannel } from '../../../../data/sl3'
import type { KhItem } from '../../../../data/v3-kh'
import { genericAnswer } from '../../perProperty'
import { NAME, f, list, lower, one, sentences, tasksOf, type Answer, type Cov, type FactRef, type Question, type Reader } from './data'

/** What the AI says when the property's facts don't answer it on this channel. The AI writes as the host. */
const HOLD = 'I’m not sure, so I’ll check and get back to you.'
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const text = (id: string, r: Reader, c: ListingChannel) => genericAnswer(id, (k) => r.raw(k, c)).map((x) => x.text)

/** The parking clause of "Getting around", when it has one ("Street parking is paid during the day."). */
export function parkingOf(v: string): string {
  const s = sentences(v).find((x) => /parking/i.test(x))
  if (!s) return ''
  const part = s.split(/;\s*/).find((x) => /parking/i.test(x)) ?? s
  const t = cap(part.trim())
  return /[.!?]$/.test(t) ? t : `${t}.`
}

/** A value that differs per channel, as one line ("€60 per stay on Booking.com; €65 per stay on Airbnb"). */
function perChannel(r: Reader, key: string, chs: ListingChannel[], unit = (v: string) => v): string | undefined {
  const vals = chs.map((c) => ({ c, v: r.v(key, c) })).filter((x) => x.v)
  const distinct = [...new Set(vals.map((x) => x.v))]
  if (distinct.length <= 1) return undefined
  return distinct.map((v) => `${unit(v)} on ${list(vals.filter((x) => x.v === v).map((x) => NAME[x.c]))}`).join('; ').replace(/^./, (m) => m.toUpperCase()) + '.'
}

/** The property's standard questions, built for its items and channels. `has(key)` = the Hub holds that fact. */
export function genericQuestions(items: KhItem[], chs: ListingChannel[]): Question[] {
  const has = (k: string) => items.some((i) => i.key === k)
  const keep = (refs: FactRef[]) => refs.filter((x) => x.keys.every((k) => k.startsWith('policy:') || k.startsWith('amenity:') || has(k)))
  /** Answered on every channel that has all `need` facts; partly when some do; not when none do. */
  const covOf = (need: string[]) => (r: Reader): Cov => {
    const n = chs.filter((c) => need.every((k) => (k.startsWith('amenity:') ? r.on(k, c) : r.raw(k, c) !== ''))).length
    return n === chs.length ? 'a' : n ? 'p' : 'n'
  }
  /** The answer, or the holding reply when this channel lacks a needed fact. */
  const guard = (need: string[], build: (r: Reader, c: ListingChannel) => Answer) => (r: Reader, c: ListingChannel): Answer =>
    need.every((k) => r.raw(k, c) !== '') ? build(r, c) : one(HOLD)
  const q = (x: Omit<Question, 'cov' | 'covFn' | 'answer'> & { need: string[]; answer: (r: Reader, c: ListingChannel) => Answer }): Question => {
    const { need, answer, ...rest } = x
    return { ...rest, facts: keep(rest.facts), cov: 'a', covFn: covOf(need), answer: guard(need, answer) }
  }
  const getting = items.find((i) => i.key === 'getting_around')
  const parking = !!getting && (!!parkingOf(getting.base) || Object.values(getting.value ?? {}).some((v) => !!parkingOf(v ?? '')))
  const tasksOn = (r: Reader) => (chs.includes('airbnb') && has('checkout_tasks') ? tasksOf(r.raw('checkout_tasks', 'airbnb')) : [])

  const out: Question[] = [
    // ── Before booking ──
    q({ id: 'b-guests', stage: 'before', q: 'How many guests can stay?', kw: 'how many people guests sleep beds capacity bedrooms',
      facts: [f('price:max'), f('kh.bedrooms')], from: ['Property', 'Pricing'], need: ['price:max'],
      answer: (r, c) => one(`Up to ${r.v('price:max', c)}.${r.v('kh.bedrooms', c) ? ` Where you sleep: ${r.v('kh.bedrooms', c).replace(/ · /g, ', ')}.` : ''}`) }),
    q({ id: 'b-pets', stage: 'before', q: 'Are pets allowed?', kw: 'pets dog cat animals bring my dog',
      facts: [f('pets'), f('price:pet')], from: ['House rules', 'Pricing'], need: ['pets'],
      answer: (r, c) => ({ text: text('pets', r, c) }),
      line: chs.length > 1 ? (r) => { const yes = chs.filter((c) => r.raw('pets', c) === 'Yes'); return yes.length === chs.length ? 'Yes, on every channel.' : yes.length ? `Only on ${list(yes.map((c) => NAME[c]))}; assistance animals are always welcome.` : 'No; assistance animals are always welcome.' } : undefined }),
    q({ id: 'b-kids', stage: 'before', q: 'Can we bring children?', kw: 'children kids baby infant family',
      facts: [f('children'), f('infants')], from: ['House rules'], need: ['children'],
      answer: (r, c) => one(r.raw('children', c) === 'Yes' ? `Yes, children are welcome${r.raw('infants', c) === 'Yes' ? ', and so are infants' : ''}.` : 'Sorry, the place isn’t set up for children.') }),

    // ── Booking & pricing ──
    q({ id: 'p-min', stage: 'pricing', q: 'What’s the minimum stay?', kw: 'minimum stay nights shortest how long one night',
      facts: [f('avail:min_stay')], from: ['Availability'], need: ['avail:min_stay'],
      answer: (r, c) => ({ text: text('minstay', r, c) }), line: (r) => perChannel(r, 'avail:min_stay', chs) ?? `The minimum stay is ${r.v('avail:min_stay', chs[0] ?? 'airbnb')}.` }),
    q({ id: 'p-clean', stage: 'pricing', q: 'Is there a cleaning fee?', kw: 'cleaning fee extra fees charges cost',
      facts: [f('price:cleaning')], from: ['Pricing'], need: ['price:cleaning'],
      answer: (r, c) => ({ text: text('cleaning', r, c) }), line: (r) => perChannel(r, 'price:cleaning', chs, (v) => `${v} per stay`) ?? text('cleaning', r, chs[0] ?? 'airbnb').join(' ') }),
    q({ id: 'p-cancel', stage: 'pricing', q: 'What’s your cancellation policy?', kw: 'cancel cancellation refund policy',
      facts: [f('policy:cancel')], from: ['Booking policies'], need: [],
      answer: (r, c) => { const k = r.cancel(c)[0]; return one(k ? `${k.title}: ${k.body}` : HOLD) },
      line: chs.length > 1 ? () => 'It depends on where you booked; the AI quotes that channel’s terms.' : undefined }),

    // ── Arrival ──
    q({ id: 'a-time', stage: 'arrival', q: 'What time is check-in?', kw: 'what time check-in check in arrive arrival when',
      facts: [{ keys: ['checkin', 'checkin_end'], label: 'Check-in from · until' }], from: ['House rules'], need: ['checkin'],
      answer: (r, c) => one(`Check-in is from ${r.v('checkin', c)} until ${r.v('checkin_end', c) || '10:00 PM'}.`) }),
    q({ id: 'a-in', stage: 'arrival', q: 'How do I get in?', kw: 'get in door code keys keypad lockbox smart lock self check-in access instructions',
      facts: [f('method'), f('method_details')], from: ['Arrival'], need: ['method'],
      answer: (r, c) => one(r.v('method_details', c) || text('checkin', r, c).slice(1).join(' ') || `Check-in is with a ${lower(r.v('method', c))}.`) }),
    q({ id: 'a-wifi', stage: 'arrival', q: 'Could you send me the Wi-Fi name and password?', kw: 'wifi wi-fi internet password network',
      facts: [{ keys: ['wifi_name', 'wifi_password'], label: 'Wifi name · password', mask: ['wifi_password'] }], from: ['Arrival'], need: ['wifi_name'],
      answer: (r, c) => one(`The Wi-Fi is ${r.v('wifi_name', c)}; the password is in your arrival message.`) }),
    q({ id: 'a-address', stage: 'arrival', q: 'What’s the address?', kw: 'address where located directions find how to get there',
      facts: [f('address'), f('directions')], from: ['Location'], need: ['address'],
      answer: (r, c) => ({ text: text('address', r, c) }) }),

    // ── During the stay ──
    q({ id: 's-rules', stage: 'stay', q: 'What are the house rules?', kw: 'house rules smoke smoking party parties friends visitors quiet noise',
      facts: [f('house_rules'), f('smoking'), f('events')], from: ['House rules'], need: ['house_rules'],
      answer: (r, c) => one(r.v('house_rules', c)) }),

    // ── Checkout ──
    q({ id: 'c-time', stage: 'checkout', q: 'What time is checkout?', kw: 'checkout time leave when check out',
      facts: [f('checkout')], from: ['House rules'], need: ['checkout'], answer: (r, c) => one(`Checkout is at ${r.v('checkout', c)}.`) }),
    q({ id: 'c-tasks', stage: 'checkout', q: 'What should I do before I leave?', kw: 'before leave checkout tasks towels rubbish keys',
      facts: [f('checkout_tasks'), f('checkout')], from: ['Arrival', 'House rules'], need: ['checkout'],
      answer: (r, c) => {
        const tasks = tasksOn(r).map((t) => (t[1] ? `${lower(t[0])} (${lower(t[1])})` : lower(t[0])))
        return { text: [`Checkout is at ${r.v('checkout', c)}.`], only: c === 'airbnb' && tasks.length ? { c: 'airbnb', text: `Before you leave: ${list(tasks)}.` } : undefined }
      },
      line: chs.length > 1 ? (r) => (tasksOn(r).length ? 'Airbnb guests get the checkout tasks; other guests get the checkout time.' : `Checkout is at ${r.b('checkout')}.`) : undefined }),

    // ── The area ──
    q({ id: 'ar-around', stage: 'area', q: 'How do I get around?', kw: 'nearest station u-bahn s-bahn metro subway train bus public transport get around',
      facts: [f('getting_around')], from: ['Location'], need: ['getting_around'], answer: (r, c) => one(sentences(r.v('getting_around', c))[0]) }),
  ]
  if (parking) {
    const p = q({ id: 'ar-parking', stage: 'area', q: 'Is there parking?', kw: 'parking park car garage',
      facts: [f('getting_around')], from: ['Location'], need: ['getting_around'],
      answer: (r, c) => one(parkingOf(r.v('getting_around', c)) || HOLD) })
    // answered where "Getting around" still says something about parking
    p.covFn = (r) => { const n = chs.filter((c) => !!parkingOf(r.v('getting_around', c))).length; return n === chs.length ? 'a' : n ? 'p' : 'n' }
    out.push(p)
  }
  return out
}
