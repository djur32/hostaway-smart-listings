/* KH-E · Ask: canned replies, written from the chosen channel's resolved values (never from another channel's), each
 * citing the facts it used. SIMULATED answers; the values are the Hub's own (lens.ts resolve). Neukölln keeps its
 * scripted questions (`answer`); every other property gets the generic set (perProperty GENERIC_QUESTIONS,
 * `genericReply`), built from its own values. */
import type { ListingChannel } from '../../../../data/sl3'
import { display, type HubDraft } from '../../model'
import { genericAnswer, hubChannels } from '../../perProperty'
import { NAME, article, resolve } from './lens'
import type { QuestionId } from './data'

export interface Answer { text: string; facts: Array<{ label: string; origin: string }>; compare?: { c: ListingChannel; text: string } }

const eur = (v?: string) => `€${v ?? '0'}`
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const tasksOf = (v: string) => v.split('\n').map((l) => l.split('|')[0].trim()).filter(Boolean)

export function answer(q: QuestionId, c: ListingChannel, d: HubDraft): Answer {
  const r = (k: string) => resolve(k, c, d)
  switch (q) {
    case 'clean': {
      const clean = r('price:cleaning')
      const short = r('price:short_clean')
      const weekly = r('price:weekly')
      const facts = [{ label: `Cleaning fee · ${eur(clean?.value)}`, origin: clean?.origin ?? '' }]
      let text = `Cleaning is ${eur(clean?.value)}, charged once per stay.`
      if (short) { text += ` For stays of 1–2 nights it’s ${eur(short.value)}.`; facts.push({ label: `Short-stay cleaning fee · ${eur(short.value)}`, origin: short.origin }) }
      if (weekly?.kind === 'set') { text += ` Discounts for longer stays are set by ${NAME(c)}, so any deal shows on the booking page before you pay.`; facts.push({ label: 'Weekly discount', origin: weekly.origin }) }
      else if (weekly) { text += ` Stays of 7 nights or more get ${weekly.value}% off.`; facts.push({ label: `Weekly discount · ${weekly.value}%`, origin: weekly.origin }) }
      const other = hubChannels().find((x) => x !== c && resolve('price:cleaning', x, d)?.value !== clean?.value)
      return { text, facts, compare: other ? { c: other, text: `${article(other)} ${NAME(other)} guest would hear ${eur(resolve('price:cleaning', other, d)?.value)}.` } : undefined }
    }
    case 'checkin': {
      const from = r('checkin'), to = r('checkin_end'), method = r('method')
      const self = method && /keypad|lock|secret/i.test(method.value)
      const text = `Check-in is from ${from?.value ?? '3:00 PM'} to ${to?.value ?? '10:00 PM'}.${self ? ` It’s self check-in with a ${lc(method!.value)}: the code arrives 24 hours before you do.` : method ? ` Check-in method: ${lc(method.value)}.` : ''}`
      return { text, facts: [from && { label: `Check-in from · ${from.value}`, origin: from.origin }, to && { label: `Check-in time ends · ${to.value}`, origin: to.origin }, method && { label: `Check-in method · ${method.value}`, origin: method.origin }].filter(Boolean) as Answer['facts'] }
    }
    case 'keys': {
      const method = r('method'), out = r('checkout'), tasks = r('checkout_tasks')
      const keyless = method && /keypad|smart lock/i.test(method.value)
      let text = keyless ? `There are no keys: the flat opens with a keypad code, so just pull the door until it clicks.` : `Please leave the keys as described in your check-in details.`
      if (out) text += ` Checkout is by ${out.value}.`
      if (tasks?.value) text += ` Before you go: ${tasksOf(tasks.value).map(lc).join(', ')}.`
      const facts = [method && { label: `Check-in method · ${method.value}`, origin: method.origin }, out && { label: `Checkout time · ${out.value}`, origin: out.origin }, tasks?.value && { label: 'Guest checkout tasks', origin: tasks.origin }].filter(Boolean) as Answer['facts']
      const chs = hubChannels()
      const other = !tasks?.value ? chs.find((x) => resolve('checkout_tasks', x, d)?.value) : chs.find((x) => x !== c && !resolve('checkout_tasks', x, d)?.value)
      return { text, facts, compare: other ? { c: other, text: tasks?.value ? `${article(other)} ${NAME(other)} guest won’t get the checkout tasks.` : `${article(other)} ${NAME(other)} guest also gets your checkout tasks.` } : undefined }
    }
    case 'parking': {
      const p = r('kh.parking')
      return { text: p?.value ?? 'Street parking is free after 20:00 and on Sundays.', facts: p ? [{ label: 'Parking', origin: `Custom fact · ${p.origin}` }] : [] }
    }
    case 'wifi': {
      const name = r('wifi_name')
      return { text: `The network is ${name?.value ?? 'in your booking confirmation'}. The password comes with your check-in details once your booking is confirmed.`, facts: [name && { label: `Wifi name · ${name.value}`, origin: name.origin }, { label: 'Wifi password', origin: 'Sent after booking' }].filter(Boolean) as Answer['facts'] }
    }
  }
}

/** A generic question (perProperty GENERIC_QUESTIONS) answered from the values a guest on channel `c` gets, citing the
 *  facts it used; when another of the property's channels would hear something different, say what. */
export function genericReply(id: string, c: ListingChannel, d: HubDraft): Answer {
  const get = (x: ListingChannel) => (k: string) => resolve(k, x, d)?.value ?? ''
  const sentences = genericAnswer(id, get(c))
  const text = sentences.map((x) => x.text).join(' ')
  const cites = [...new Set(sentences.flatMap((x) => x.cites))]
  const facts = cites.flatMap((k) => {
    const r = resolve(k, c, d)
    if (!r) return []
    const v = k === 'wifi_password' ? '' : display(r.item, r.value)
    return [{ label: v ? `${r.item.label} · ${v}` : r.item.label, origin: r.origin }]
  })
  const other = hubChannels().find((x) => x !== c && genericAnswer(id, get(x)).map((y) => y.text).join(' ') !== text)
  let compare: Answer['compare']
  if (other) {
    const k = cites.find((key) => get(other)(key) !== get(c)(key))
    const r = k ? resolve(k, other, d) : undefined
    compare = { c: other, text: r ? `${article(other)} ${NAME(other)} guest would hear ${display(r.item, r.value) || 'nothing'} for the ${lc(r.item.label)}.` : `${article(other)} ${NAME(other)} guest would get a different answer.` }
  }
  return { text, facts, compare }
}
