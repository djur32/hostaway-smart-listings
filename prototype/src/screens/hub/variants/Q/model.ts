/* Knowledge Hub, reframed · model (plan/notion-v2/deck-review/KH-REFRAME.md).
 * The Hub keeps no copy of the listing. It reads:
 *   · facts from the Listing base (store sl3.base over the field definitions, the same values Listing details edits and
 *     every channel inherits), by reference: a fact here is a pointer to its field, never a second value;
 *   · answers the host confirmed (the `kh.*` answers from data/v3-kh.ts KH_CUSTOM, "Added by you"), the only thing the
 *     Hub itself holds, because no Listing base field covers them;
 *   · guest questions from Inbox conversations (sample data, ./data.ts), by topic, per channel, per month.
 * Answers stay faithful: a question is Answered only when a Listing base fact (or a confirmed answer) backs it. When
 * nothing does, the AI says so and asks the host, the gap becomes a tip. A gap's status is read live from the Listing
 * base: once the field holds the fact (accepted from a tip, or typed in Listing details), the question is answered. */
import { useMemo } from 'react'
import { useStore } from '../../../../store/store'
import { currentUser } from '../../../../data/users'
import { fieldByKey, TAB_FIELDS } from '../../../../data/v3-ch'
import { DETAILS_LABEL } from '../../../../data/details'
import { LISTING_TABS, type ListingChannel, type WhyPoint } from '../../../../data/sl3'
import { KH_CUSTOM } from '../../../../data/v3-kh'
import { amenitiesFor } from '../../../../data/property-listing'
import { commitAndSend, effective, unsend, type Receipt } from '../../../push/changes'
import { setAmenity } from '../../../details/amenities/model'
import { NAME, createPropertyStore, useHubPid } from '../../perProperty'
import { useHub, type Hub } from '../C/model'
import { GAPS, list, lower, type Cov, type Question } from '../C/data'
import { R_TOPICS, answerFor, hostContactOf, questionLabel, rQuestions, topicOf, type RTopicId } from '../R/data'
import {
  CONVOS, EXTRA_QUESTIONS, EXTRA_TOPIC, GAP_GUESTS, KQ_TIPS, MONTH_LONG, MONTHS, THIS_MONTH, THIS_MONTH_ASKS, asksOf, pinsOf, tipWhy, type KqTipDef, type Reply,
} from './data'

/* ---------- the tips' state, per property (only what the Listing base can't tell: dismissed, and accepted here) ---------- */
type Where = 'base' | ListingChannel
interface Accepted { where: Where; at: number; prev?: Record<string, string | null>; missing?: string[]; sent?: ListingChannel[] }
interface KqTipsState { accepted: Record<string, Accepted>; dismissed: Record<string, true> }
export const useKqTips = createPropertyStore('hostaway-kh-q-tips', (): KqTipsState => ({ accepted: {}, dismissed: {} }), (set) => ({
  accept: (id: string, a: Accepted) => set((s) => ({ accepted: { ...s.accepted, [id]: a } })),
  unaccept: (id: string) => set((s) => { const accepted = { ...s.accepted }; delete accepted[id]; return { accepted } }),
  dismiss: (id: string) => set((s) => ({ dismissed: { ...s.dismissed, [id]: true as const } })),
}))

/* ---------- facts, by reference ---------- */
export type RefKind = 'base' | 'channel' | 'confirmed' | 'document' | 'policy'
export interface FactRefView { key: string; kind: RefKind; label: string; value: string; place: string; to?: string }
/** Answer facts the Listing base holds in its own fields (the old Hub-only "floor", "size", "bedrooms" copies). */
const REMAP: Record<string, string> = { 'kh.floor': 'other', 'kh.size': 'space', 'kh.bedrooms': 'space' }
/** Base facts an answer quotes that the old question data didn't name. */
const EXTRA_REFS: Record<string, string[]> = { 's-trash': ['manual'], 's-smoke': ['smoking'] }
const MASKED = new Set(['wifi_password'])
const MASK = '••••••••••'
const tabOf = (key: string) => (Object.entries(TAB_FIELDS).find(([, ks]) => ks.includes(key))?.[0] as (typeof LISTING_TABS)[number]['id'] | undefined)
const tabLabel = (t: string) => LISTING_TABS.find((x) => x.id === t)?.label ?? t
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const KH_SOURCE = Object.fromEntries(KH_CUSTOM.map((x) => [`kh.${x.id}`, x.source]))
/** Where a field lives in the Listing base, as a link (the field's own anchor on Listing details). */
export const fieldPath = (pid: string, key: string) => { const t = tabOf(key); return t ? `/property/${pid}/details/${t}#field-${key}` : `/property/${pid}/details` }
export const fieldLabel = (key: string) => {
  if (key.startsWith('amenity:')) return key.slice(8)
  const d = fieldByKey(key)
  return (DETAILS_LABEL[key]?.label ?? d?.label ?? key).replace(/\s*\(CEST\)$/, '')
}
export const fieldPlace = (key: string) => (key.startsWith('amenity:') ? 'Listing base · Amenities' : `Listing base · ${tabLabel(tabOf(key) ?? fieldByKey(key)?.tab ?? 'essentials')}`)

export function refOf(raw: string, hub: Hub, pid: string): FactRefView | null {
  const key = REMAP[raw] ?? raw
  const base = `/property/${pid}`
  const chs = hub.chs
  if (key.startsWith('amenity:')) {
    const name = key.slice(8)
    const on = chs.filter((c) => hub.amenityOn(name, c))
    return { key, kind: 'base', label: name, value: !on.length ? 'Not listed' : on.length === chs.length ? 'Listed' : `Listed on ${list(on.map(NAME))} only`, place: 'Listing base · Amenities', to: `${base}/details/amenities` }
  }
  if (key.startsWith('price:')) return { key, kind: 'base', label: hub.item(key)?.label ?? key, value: hub.r.b(key), place: 'Listing base · Pricing', to: `${base}/base/pricing` }
  if (key.startsWith('avail:')) return { key, kind: 'base', label: hub.item(key)?.label ?? key, value: hub.r.b(key), place: 'Listing base · Availability', to: `${base}/base/availability` }
  if (key === 'policy:cancel' || key === 'policy:instant') {
    return { key, kind: 'policy', label: key === 'policy:cancel' ? 'Cancellation policy' : 'Instant booking', value: '', place: 'Booking policies · each channel’s own', to: `${base}/ch/${chs[0] ?? 'airbnb'}/policies` }
  }
  if (key.startsWith('kh.')) {
    const it = hub.item(key)
    if (!it) return null
    return { key, kind: 'confirmed', label: it.label, value: hub.r.b(key), place: `Answer you confirmed · ${(KH_SOURCE[key] ?? 'Added by you').replace(/^Added by you · /, 'added ')}` }
  }
  const def = fieldByKey(key)
  if (!def) return null
  const on = chs.filter((c) => def.state[c] !== undefined)
  if (!on.length) return null
  const only = on.every((c) => def.state[c] === 'only' || def.state[c] === 'channel') ? on[0] : undefined
  const t = tabOf(key)
  if (only) return { key, kind: 'channel', label: fieldLabel(key), value: MASKED.has(key) ? MASK : hub.r.v(key, only), place: `${NAME(only)}’s listing · ${tabLabel(t ?? def.tab)}`, to: `${base}/ch/${only}/listing/${t ?? def.tab}` }
  if (!t) return null // not a field Listing details shows (e.g. the long Description)
  return { key, kind: 'base', label: fieldLabel(key), value: MASKED.has(key) ? MASK : hub.r.b(key), place: `Listing base · ${tabLabel(t)}`, to: fieldPath(pid, key) }
}

/* ---------- the faithful answer ---------- */
export interface AnswerView { lines: string[]; only?: { c: ListingChannel; text: string }; hold?: string }
/** The clauses of a text that match (a sentence split at its semicolons), each a sentence of its own. */
/** Sentences split at a stop followed by a space and a capital, so "€2.50" stays whole. */
const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z“"])/).map((x) => x.trim()).filter(Boolean)
export const clausesOf = (text: string, re: RegExp) => sentencesOf(text).flatMap((s) => s.split(/;\s*/)).map((x) => x.trim()).filter((x) => x && re.test(x))
  .map((x) => { const t = cap(x); return /[.!?]$/.test(t) ? t : `${t}.` })
/** Answers C wrote with words no Listing base field holds, rewritten to say only what the fields say. */
const FAITHFUL: Record<string, (hub: Hub, c: ListingChannel) => AnswerView> = {
  'a-elevator': (hub, c) => ({ lines: clausesOf(hub.r.v('other', c), /elevator|walk-up|floor/i).map((s) => `It’s ${lower(s)}`) }),
  's-kitchen': (hub, c) => { const on = ['Kitchen', 'Coffee maker', 'Dishwasher'].filter((n) => hub.amenityOn(n, c)).map(lower); return { lines: [on.length ? `Yes: the flat has a ${list(on)}.` : 'I’m not sure, so I’ve asked your host.'] } },
}

/* ---------- a question, with everything the Hub knows about it ---------- */
export interface ConvoView { guest: string; c: ListingChannel; month: number; text: string; reply: Reply }
export interface QStat { total: number; by: Record<ListingChannel, number>; months: number[]; thisMonth: number; rising: boolean; isNew: boolean }
export interface TipView {
  def: KqTipDef; qid: string; qlabel: string
  /** open: waiting · accepted: accepted here (Accepted → Undo / Next) · done: the Listing base already holds it · dismissed */
  status: 'open' | 'accepted' | 'done' | 'dismissed'
  where?: Where
  /** the channels the accepted fact was sent to (its receipts) */
  sent?: ListingChannel[]
  /** offer "say it in this channel's description" when most asks come from it */
  lean?: ListingChannel
  why: WhyPoint[]
}
export interface QView {
  q: Question; id: string; label: string; topic: RTopicId; stat: QStat; state: Cov
  answer: AnswerView; refs: FactRefView[]; convos: ConvoView[]; tip?: TipView
}
export interface TopicView { id: RTopicId; label: string; questions: QView[]; asks: number; open: number }
export interface KQ {
  hub: Hub; pid: string; scenario: boolean; chs: ListingChannel[]; host: string
  questions: QView[]; topics: TopicView[]; tips: TipView[]
  /** every ask over the 12 months, per month and per channel */
  months: number[]; byChannel: Record<ListingChannel, number>; total: number
  question: (id: string) => QView | undefined
}

const zero = (): Record<ListingChannel, number> => ({ airbnb: 0, booking: 0, direct: 0 })

export function useKQ(): KQ {
  const hub = useHub()
  const pid = useHubPid()
  const base = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const tipsUi = useKqTips()
  return useMemo(() => {
    const chs = hub.chs
    const primary = chs[0] ?? 'airbnb'
    const host = hostContactOf(pid).name
    const scenario = hub.scenario
    const all = [...rQuestions(hub.questions), ...(scenario ? EXTRA_QUESTIONS : [])]
    const baseVal = (key: string) => base[key] ?? fieldByKey(key)?.base ?? ''
    const hasOn = (t: KqTipDef) => {
      if (t.amenity) { const on = chs.filter((c) => hub.amenityOn(t.amenity!, c)); return { base: on.length === chs.length, channels: on } }
      const m = t.marker!.toLowerCase()
      return { base: baseVal(t.field).toLowerCase().includes(m), channels: chs.filter((c) => (effective(c, t.field, { base, custom }) ?? '').toLowerCase().includes(m)) }
    }
    const questions: QView[] = all.map((q) => {
      const id = q.id
      const topic = (EXTRA_TOPIC[id] ?? topicOf(id))!
      const label = questionLabel(q)
      // ---- how often, where, when (sample Inbox data; the scenario property only, the others have no history yet)
      const gap = scenario ? GAPS.find((g) => g.question === id) : undefined
      const authored = scenario ? (CONVOS[id] ?? []) : []
      const n = scenario ? q.asked ?? 0 : 0
      const asks = n ? asksOf(id, n, chs, pinsOf([...(gap?.messages ?? []), ...authored])) : []
      const by = zero()
      const months = MONTHS.map(() => 0)
      for (const a of asks) { by[a.c] += 1; months[a.month] += 1 }
      const thisMonth = months[THIS_MONTH]
      const before = (months[8] + months[9] + months[10]) / 3
      const isNew = n > 0 && months.slice(0, THIS_MONTH).every((x) => x === 0)
      const stat: QStat = { total: n, by, months, thisMonth, isNew, rising: !isNew && id in THIS_MONTH_ASKS && thisMonth >= 2 && thisMonth >= 2 * before }
      // ---- the answer, faithful: Listing base facts and confirmed answers only
      const tdef = scenario ? KQ_TIPS.find((t) => t.question === id) : undefined
      let state: Cov
      let answer: AnswerView
      let refs: FactRefView[] = []
      if (tdef) {
        const has = hasOn(tdef)
        const field = refOf(tdef.field, hub, pid)
        if (has.base) {
          state = 'a'
          answer = { lines: tdef.amenity ? [`Yes, there’s a ${lower(tdef.amenity)}.`] : clausesOf(baseVal(tdef.field), tdef.quote) }
          // the part of the field the answer quotes, not the whole text (the field link opens the rest)
          refs = field ? [tdef.amenity ? field : { ...field, value: `…${answer.lines.join(' ')}` }] : []
        } else {
          const known = (tdef.known ?? []).map((k) => ({ k, line: k.line(k.key.startsWith('kh.') ? hub.r.b(k.key) : baseVal(k.key)) })).filter((x) => !!x.line)
          const ch = has.channels[0]
          const only = ch ? { c: ch, text: tdef.amenity ? `Yes, there’s a ${lower(tdef.amenity)}.` : clausesOf(effective(ch, tdef.field, { base, custom }) ?? '', tdef.quote).join(' ') } : undefined
          state = known.length || ch ? 'p' : 'n'
          answer = { lines: known.map((x) => x.line!), only, hold: tdef.hold.replace('{host}', host) }
          refs = [...known.map((x) => refOf(x.k.key, hub, pid)), ...(ch && field ? [{ ...field, kind: 'channel' as const, value: tdef.amenity ? `Listed on ${list(has.channels.map(NAME))} only` : effective(ch, tdef.field, { base, custom }) ?? '', place: tdef.amenity ? field.place : `${NAME(ch)}’s listing · ${field.place.replace('Listing base · ', '')}`, to: tdef.amenity ? field.to : `/property/${pid}/ch/${ch}/listing/${tabOf(tdef.field) ?? 'essentials'}` }] : [])].filter((x): x is FactRefView => !!x)
        }
      } else {
        state = q.covFn ? q.covFn(hub.r) : q.cov
        const a = FAITHFUL[id]?.(hub, primary) ?? (() => { const x = answerFor(q, hub.r, primary); return { lines: x.text, only: x.only } })()
        answer = a
        const keys = [...new Set([...q.facts.flatMap((fr) => fr.keys), ...(EXTRA_REFS[id] ?? [])].map((k) => REMAP[k] ?? k))]
        refs = keys.map((k) => refOf(k, hub, pid)).filter((x): x is FactRefView => !!x)
        if (q.from.includes('Neukölln guide.pdf')) refs.push({ key: 'doc:guide', kind: 'document', label: 'Neukölln guide.pdf', value: '', place: 'Document · added 12 Sep' })
        if (state !== 'a' && !/check|not sure|asked/i.test(answer.lines.join(' '))) answer = { ...answer, hold: `I’m not sure, so I’ve asked ${host}.` }
      }
      // ---- the guests' messages behind it
      const convos: ConvoView[] = [
        ...(gap?.messages ?? []).map((m, i) => ({ guest: GAP_GUESTS[(i + id.length) % GAP_GUESTS.length], c: m.c, month: MONTHS.indexOf(m.when as (typeof MONTHS)[number]), text: m.text, reply: 'you' as Reply })),
        ...authored.map((m) => ({ guest: m.guest, c: m.c, month: MONTHS.indexOf(m.when), text: m.text, reply: m.reply })),
      ].filter((c) => chs.includes(c.c)).sort((a, b) => b.month - a.month)
      if (!convos.length && asks.length) {
        const last = [...asks].sort((a, b) => b.month - a.month)[0]
        convos.push({ guest: GAP_GUESTS[(id.length * 7) % GAP_GUESTS.length], c: last.c, month: last.month, text: label, reply: state === 'a' ? 'ai' : 'you' })
      }
      return { q, id, label, topic, stat, state, answer, refs: dedupe(refs), convos }
    })
    // ---- tips: a gap that asks for a fact becomes a tip (the scenario's scripted gaps)
    const byId = new Map(questions.map((x) => [x.id, x]))
    const tips: TipView[] = []
    for (const t of scenario ? KQ_TIPS : []) {
      const qv = byId.get(t.question)
      if (!qv) continue
      const acc = tipsUi.accepted[t.id]
      const has = hasOn(t)
      const held = has.base || (acc && acc.where !== 'base' && has.channels.includes(acc.where))
      const status: TipView['status'] = tipsUi.dismissed[t.id] ? 'dismissed' : acc && held ? 'accepted' : has.base ? 'done' : 'open'
      const top = [...chs].sort((a, b) => qv.stat.by[b] - qv.stat.by[a])[0]
      const lean = !t.amenity && top && qv.stat.total >= 3 && qv.stat.by[top] / qv.stat.total >= 0.6 ? top : undefined
      const tv: TipView = { def: t, qid: qv.id, qlabel: qv.label, status, where: acc?.where, sent: acc?.sent, lean, why: tipWhy(t, { label: qv.label, total: qv.stat.total, by: qv.stat.by }, chs, NAME) }
      if (status === 'open' || status === 'accepted') qv.tip = tv
      tips.push(tv)
    }
    tips.sort((a, b) => (byId.get(b.qid)!.stat.total - byId.get(a.qid)!.stat.total))
    const topics: TopicView[] = R_TOPICS.map((t) => {
      const qs = questions.filter((x) => x.topic === t.id).sort((a, b) => b.stat.total - a.stat.total || a.label.localeCompare(b.label))
      return { id: t.id, label: t.label, questions: qs, asks: qs.reduce((s, x) => s + x.stat.total, 0), open: qs.filter((x) => x.state !== 'a').length }
    })
    const months = MONTHS.map((_, i) => questions.reduce((s, x) => s + x.stat.months[i], 0))
    const byChannel = zero()
    for (const x of questions) for (const c of chs) byChannel[c] += x.stat.by[c]
    const total = questions.reduce((s, x) => s + x.stat.total, 0)
    return { hub, pid, scenario, chs, host, questions, topics, tips, months, byChannel, total, question: (id: string) => byId.get(id) }
  }, [hub, pid, base, custom, tipsUi])
}
const dedupe = (refs: FactRefView[]) => { const seen = new Set<string>(); return refs.filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true))) }

export const monthName = (i: number) => MONTH_LONG[i]
export const shortMonth = (i: number) => MONTHS[i]
export const replyText = (r: Reply, host: string) => (r === 'ai' ? 'Answered by the AI' : `The AI said it would check · ${host === currentUser().name ? 'you' : host} replied`)

/* ---------- accepting a tip: the fact goes into the Listing base (or one channel's description), with receipts ---------- */
const baseNow = (key: string) => useStore.getState().sl3.base[key] ?? fieldByKey(key)?.base ?? ''
export function acceptTip(t: KqTipDef, where: Where, chs: ListingChannel[]): Receipt[] {
  const st = useStore.getState()
  const origin = `Knowledge Hub · ${t.title}`
  if (t.amenity) {
    const key = `amenity:${t.amenity}`
    const prev: Record<string, string | null> = {}
    const missing: string[] = []
    for (const c of chs) { const v = st.sl3.custom[c]?.[key]; if (v === undefined) missing.push(c); else prev[c] = v }
    const bv = st.sl3.base[key]
    if (bv === undefined) missing.push('base'); else prev.base = bv
    const known = new Map(amenitiesFor(st.activeProperty).flatMap((g) => g.items.map((i) => [i.name, i.on] as const)))
    const receipts = setAmenity(t.amenity, true, chs, (c, name) => !!known.get(name)?.includes(c))
    useKqTips.getState().accept(t.id, { where: 'base', at: Date.now(), prev, missing, sent: receipts.map((r) => r.channel) })
    return receipts
  }
  if (where === 'base') {
    const cur = baseNow(t.field)
    const receipts = commitAndSend(() => useStore.getState().sl3Base(t.field, `${cur.trimEnd()}${t.add}`), chs, [t.field], origin)
    useKqTips.getState().accept(t.id, { where, at: Date.now(), sent: receipts.map((r) => r.channel) })
    return receipts
  }
  const prevCustom = st.sl3.custom[where]?.[t.field]
  const cur = effective(where, t.field, st.sl3) ?? ''
  const receipts = commitAndSend(() => useStore.getState().sl3Custom(where, t.field, `${cur.trimEnd()}${t.add}`), [where], [t.field], origin)
  useKqTips.getState().accept(t.id, { where, at: Date.now(), prev: prevCustom === undefined ? {} : { [where]: prevCustom }, missing: prevCustom === undefined ? [where] : [], sent: receipts.map((r) => r.channel) })
  return receipts
}
/** Undo, right after: the words come out of the field again (or the amenity goes back to how it was), receipts withdrawn. */
export function undoTip(t: KqTipDef, chs: ListingChannel[]) {
  const acc = useKqTips.getState().accepted[t.id]
  if (!acc) return
  const st = useStore.getState()
  if (t.amenity) {
    const key = `amenity:${t.amenity}`
    for (const c of chs) st.sl3Custom(c, key, acc.missing?.includes(c) ? undefined : acc.prev?.[c] ?? undefined)
    if (!acc.missing?.includes('base') && acc.prev?.base) st.sl3Base(key, acc.prev.base)
    for (const c of chs) unsend(c, key)
  } else if (acc.where === 'base') {
    st.sl3Base(t.field, baseNow(t.field).replace(t.add!, ''))
    for (const c of chs) unsend(c, t.field)
  } else {
    const c = acc.where
    st.sl3Custom(c, t.field, acc.missing?.includes(c) ? undefined : acc.prev?.[c] ?? null)
    unsend(c, t.field)
  }
  useKqTips.getState().unaccept(t.id)
}

/* ---------- Insights: what guests ask most, what's new, and the differences per channel ---------- */
export interface ChannelDiff { q: QView; hi: ListingChannel; lo: ListingChannel; ratio: number; zero: ListingChannel[] }
export function channelDiffs(kq: KQ, conversations: Record<ListingChannel, number>): ChannelDiff[] {
  if (kq.chs.length < 2) return []
  const out: ChannelDiff[] = []
  for (const x of kq.questions) {
    if (x.stat.total < 5) continue
    const rate = (c: ListingChannel) => x.stat.by[c] / conversations[c]
    const sorted = [...kq.chs].sort((a, b) => rate(b) - rate(a))
    const hi = sorted[0], lo = sorted[sorted.length - 1]
    const all = kq.chs.reduce((n, c) => n + conversations[c], 0)
    // a channel with no asks only counts when it would have expected some (not a small channel's natural zero)
    const zeroes = kq.chs.filter((c) => x.stat.by[c] === 0 && (x.stat.total * conversations[c]) / all >= 1.5)
    if (!zeroes.length && x.stat.by[hi] < 3) continue
    if (zeroes.length) { out.push({ q: x, hi, lo, ratio: Infinity, zero: zeroes }); continue }
    const ratio = rate(lo) > 0 ? rate(hi) / rate(lo) : Infinity
    if (ratio >= 2.5) out.push({ q: x, hi, lo, ratio, zero: zeroes })
  }
  return out.sort((a, b) => (b.zero.length - a.zero.length) || (b.ratio - a.ratio)).slice(0, 5)
}

/* ---------- Facts: what the AI can read, per topic, by reference ---------- */
/** Listing base fields each topic always shows (whether or not a question cites them yet). */
const TOPIC_KEYS: Record<RTopicId, string[]> = {
  amenities: [], arrival: ['checkin', 'checkin_end', 'access', 'other', 'method', 'method_details'], cleaning: ['price:cleaning'], contact: ['interaction'],
  departure: ['checkout', 'checkout_tasks'], rules: ['house_rules', 'children', 'infants', 'pets', 'smoking', 'events'],
  transport: ['address', 'directions', 'neighbourhood', 'getting_around'], trash: ['manual'], wifi: ['wifi_name', 'wifi_password'],
}
export interface TopicFacts { id: RTopicId; label: string; refs: Array<FactRefView & { used: number }> }
export function factsByTopic(kq: KQ): TopicFacts[] {
  const used = (key: string) => kq.questions.filter((x) => x.refs.some((r) => r.key === key)).length
  return kq.topics.map((t) => {
    const fromQs = t.questions.flatMap((x) => x.refs)
    const fixed = TOPIC_KEYS[t.id].map((k) => refOf(k, kq.hub, kq.pid)).filter((x): x is FactRefView => !!x)
    const amen = t.id === 'amenities' ? kq.hub.amenities.flatMap((g) => g.items.map((i) => i.name)).filter((n) => kq.chs.some((c) => kq.hub.amenityOn(n, c))).map((n) => refOf(`amenity:${n}`, kq.hub, kq.pid)).filter((x): x is FactRefView => !!x) : []
    // the fixed fields first, so a field keeps its Listing base row even when a question quotes one channel's own text
    const refs = dedupe([...fixed, ...fromQs, ...amen])
      .filter((r) => r.kind !== 'document')
      .map((r) => ({ ...r, used: used(r.key) }))
    return { id: t.id, label: t.label, refs }
  })
}
