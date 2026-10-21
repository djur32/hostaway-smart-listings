/* Knowledge Hub iteration R · model. Wraps C's `useHub()` (the real per-property data: questions, gaps, sources, facts,
 * coverage) and groups its questions into the nine topics; adds a small property-keyed store for facts the host types
 * through the Add-fact flow (typed, scoped — these don't exist in the static FIELDS/KH_CUSTOM data). A gap's own "Add a
 * fact" still resolves through C's `useKhc` (the existing mechanism, so `hub.cov()` keeps working) rather than a third
 * parallel store — see the report for why. */
import { useMemo } from 'react'
import { LISTING_TABS, TIPS, tipsFor, type ListingChannel } from '../../../../data/sl3'
import { channelList } from '../../../../data/channels'
import { addedChannelAmenities } from '../../../../data/property-listing'
import { useStore } from '../../../../store/store'
import { NAME, createPropertyStore, useHubPid } from '../../perProperty'
import type { KhSectionId } from '../../../../data/v3-kh'
import { factKeyOf, type FactRef, type Gap, type Question, type UseWho } from '../C/data'
import { useHub, useKhc, type Hub } from '../C/model'
import { encodeContact, hostContactOf, questionLabel, rQuestions, topicOf, type RFactKind, type RTopicId, R_TOPICS } from './data'

/* ---------- facts added through R's own Add-fact flow ---------- */
export interface RScope { type: 'all' | 'some' | 'one'; channels?: ListingChannel[] }
export interface RFact {
  id: string
  topic: RTopicId
  kind: RFactKind
  label: string
  value: string
  scope: RScope
  visibility: 'guest' | 'internal'
  source: string
  /** Seeded facts (the Contact topic's demo fact) show no pencil; host-added ones do. */
  editable: boolean
  /** A fact managed somewhere else (a channel-only amenity, on that channel's Amenities tab): the pencil goes there
   *  (a path under /property/:id) instead of opening Add-fact. */
  editTo?: string
  /** Overrides the kind's icon (a channel-only amenity carries its own). */
  icon?: string
}
/** `source` (round 3, KH-NEXT-3.md): the host's own pick from `R_FACT_SOURCES` (AddFact.tsx) — no more hardcoded
 *  "Added by you", so a fact actually shows where it came from, not just that it was added. */
export type RFactInput = Pick<RFact, 'topic' | 'kind' | 'label' | 'value' | 'scope' | 'visibility' | 'source'>
interface RFactsState { facts: Record<string, RFact> }
const newId = () => `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
export const useRFacts = createPropertyStore('hostaway-kh-r-facts', (): RFactsState => ({ facts: {} }), (set) => ({
  add: (f: RFactInput) => { const id = newId(); set((s) => ({ facts: { ...s.facts, [id]: { ...f, id, editable: true } } })) },
  update: (id: string, patch: RFactInput) => set((s) => (s.facts[id] ? { facts: { ...s.facts, [id]: { ...s.facts[id], ...patch } } } : {})),
}))

/** Only when the scope isn't the entire property (the exception-based rule, same as Listing details). */
export function rScopeLabel(scope: RScope, chs: ListingChannel[]): string | null {
  if (scope.type === 'all' || !scope.channels?.length) return null
  if (scope.type === 'one') return `Only on ${NAME(scope.channels[0])}`
  const included = scope.channels
  const missing = chs.filter((c) => !included.includes(c))
  if (missing.length && missing.length <= included.length) return `Not on ${channelList(missing)}`
  return channelList(included)
}

/* ---------- resolving a gap from "Add a fact" (reuses C's useKhc — the existing gap-fill mechanism) ---------- */
export function resolveGapFact(g: Gap, text: string, scope: RScope) {
  const st = useStore.getState()
  const uses: UseWho[] = scope.type === 'all' ? g.uses.map((u) => u.who) : (['ai', ...(scope.channels ?? [])] as UseWho[])
  if (g.amenity) for (const c of uses) if (c !== 'ai') st.sl3Custom(c as ListingChannel, `amenity:${g.amenity}`, 'on')
  st.sl3Base(factKeyOf(g), text.trim())
  useKhc.getState().fill(g.id, { text: text.trim(), group: g.group as KhSectionId, fact: g.fact, uses })
}
export const dismissGap = (id: string) => useKhc.getState().dismiss(id)

/* ---------- cross-referencing a gap to an AI suggestion elsewhere (Agent R-overview2, KH-NEXT-2.md "Overview, rebuilt")
 * "this has to be related to suggestions, where you're adding facts from the Knowledge Hub, and that's how we justify
 * tackling this [the gap]". A gap is matched to a Smart Listings tip only when they genuinely share the same
 * missing fact: the tip's own `field` (data/sl3.ts TipDef.field, e.g. "neighbourhood") has to be one of the exact fact
 * keys the gap's question already cites (`hub.facts(q)`, the same FactRef keys C's FactRow reads/writes). Tips also
 * need `kb: true` (TIPS flags it relevant to/grounded in the Knowledge Hub). This is deliberately strict — most gaps
 * (parking, early check-in, city tax, the hair dryer, mid-stay cleaning) cite fields no tip touches, so they get no
 * cross-reference and render exactly as before; only "Which supermarket is open on Sunday?" and "Where can we eat late
 * in the evening?" share the `neighbourhood` field with the airbnb tip "Lead with the Feld and the canal" (t-a-neigh). */
const KB_TIPS = TIPS.filter((t) => t.kb)
export interface GapTip { title: string; where: string; hrefSuffix: string }
export function tipForGap(hub: Hub, g: Gap): GapTip | undefined {
  const q = hub.question(g.question)
  if (!q) return undefined
  const keys = new Set(hub.facts(q).flatMap((f) => f.keys))
  const tip = KB_TIPS.find((t) => keys.has(t.field))
  if (!tip) return undefined
  const tabLabel = LISTING_TABS.find((x) => x.id === tip.tab)?.label ?? tip.tab
  return { title: tip.title, where: `${NAME(tip.channel)} listing · ${tabLabel}`, hrefSuffix: `/ch/${tip.channel}/listing/${tip.tab}?tip=${tip.id}` }
}

/* ---------- grouping into the nine topics ---------- */
export interface RTopicView {
  id: RTopicId
  label: string
  factRefs: Array<{ key: string; ref: FactRef }>
  addedFacts: RFact[]
  questions: Question[]
  gaps: Gap[]
  count: number
}
export interface R {
  hub: Hub
  questions: Question[]
  topics: RTopicView[]
  coverage: { a: number; p: number; n: number; total: number }
  addFact: (f: RFactInput) => void
  updateFact: (id: string, f: RFactInput) => void
}

export function useR(): R {
  const hub = useHub()
  const rf = useRFacts()
  const pid = useHubPid()
  const custom = useStore((s) => s.sl3.custom) // saved per-channel exceptions: the channel-only amenities below
  return useMemo(() => {
    const questions = rQuestions(hub.questions)
    const byTopic = new Map<RTopicId, Question[]>(R_TOPICS.map((t) => [t.id, []]))
    for (const q of questions) byTopic.get(topicOf(q.id)!)!.push(q)
    const gapsByTopic = new Map<RTopicId, Gap[]>(R_TOPICS.map((t) => [t.id, []]))
    for (const g of hub.gaps) { const q = hub.question(g.question); const t = q && topicOf(q.id); if (t) gapsByTopic.get(t)!.push(g) }
    const contactSeed: RFact = {
      id: `seed-contact-${pid}`, topic: 'contact', kind: 'contact', label: 'Property contact', value: encodeContact(hostContactOf(pid)),
      scope: { type: 'all' }, visibility: 'guest', source: 'From Listing details', editable: false,
    }
    /* Channel-only amenities (data/property-listing.ts CHANNEL_ONLY): an amenity added on ONE channel's Amenities tab,
       from that channel's own catalogue ("Record player" on Airbnb). It's a real fact about the property, so the Hub —
       the one place that holds every fact with where it's used — lists it under Amenities, scoped to that channel
       ("Only on Airbnb", the same exception caption every scoped fact here uses) and pointing back to where it's
       managed. Never a Base amenity row: no per-channel toggles, since no other channel has a field for it. Saved state
       only — an unsaved add on the channel page isn't a fact yet. */
    const channelAmenities: RFact[] = hub.chs.flatMap((c) => addedChannelAmenities(pid, c, custom[c]).map((a): RFact => ({
      id: `chonly-${c}-${a.name}`, topic: 'amenities', kind: 'text', label: a.name, value: a.picks.length ? a.picks.join(' · ') : 'Listed',
      scope: { type: 'one', channels: [c] }, visibility: 'guest', source: `Added on ${NAME(c)} · from its own amenity list`, editable: false,
      editTo: `/ch/${c}/listing/amenities`, icon: a.icon,
    })))
    const topics: RTopicView[] = R_TOPICS.map((t) => {
      const qs = [...(byTopic.get(t.id) ?? [])].sort((a, b) => (b.asked ?? 0) - (a.asked ?? 0))
      // every fact-ref used by the topic's questions, in first-seen order — but drop a single-key ref (e.g. f('checkin')
      // in a-early) once a richer ref already covers that key (the a-instr/a-time pair "Check-in from · until"), so the
      // same field doesn't show twice under one topic
      const seen: FactRef[] = []
      for (const q of qs) for (const f of hub.facts(q)) seen.push(f)
      const byRichness = [...seen].sort((a, b) => b.keys.length - a.keys.length)
      const covered = new Set<string>()
      const keep = new Set<FactRef>()
      for (const f of byRichness) {
        if (f.keys.every((k) => covered.has(k))) continue
        keep.add(f)
        for (const k of f.keys) covered.add(k)
      }
      const dedup = new Set<string>()
      const factRefs: Array<{ key: string; ref: FactRef }> = []
      for (const f of seen) {
        const key = f.keys.join('+')
        if (!keep.has(f) || dedup.has(key)) continue
        dedup.add(key); factRefs.push({ key, ref: f })
      }
      const added = Object.values(rf.facts).filter((f) => f.topic === t.id)
      const addedFacts = t.id === 'contact' ? [contactSeed, ...added] : t.id === 'amenities' ? [...channelAmenities, ...added] : added
      return { id: t.id, label: t.label, factRefs, addedFacts, questions: qs, gaps: gapsByTopic.get(t.id) ?? [], count: factRefs.length + addedFacts.length }
    })
    const cov = questions.map((q) => hub.cov(q))
    const coverage = { a: cov.filter((x) => x === 'a').length, p: cov.filter((x) => x === 'p').length, n: cov.filter((x) => x === 'n').length, total: questions.length }
    return { hub, questions, topics, coverage, addFact: rf.add, updateFact: rf.update }
  }, [hub, rf, pid, custom])
}

export { questionLabel }

/** The Smart Listing tips that touch the facts a question's answer uses (editing a question shows "how
 *  that is related" to the recommendations). Looser than tipForGap: any listing tip whose `field` is one of the
 *  question's fact keys, not only the `kb` ones; at most three. Only tips still waiting for the host:
 *  the active property's tips (tipsFor), for channels whose Tips panel is open (the same gate as the rail's counts,
 *  screens/channel/screenTips.tsx useTipsGate), neither accepted nor dismissed. Open lands on that tip (`?tip=<id>`). */
export interface TipGate { tips: Record<string, 'accepted' | 'dismissed'>; open: (c: ListingChannel) => boolean }
export function tipsForQuestion(hub: Hub, q: Question, gate: TipGate): GapTip[] {
  const keys = new Set(hub.facts(q).flatMap((f) => f.keys))
  return hub.chs.filter(gate.open).flatMap((c) => tipsFor(c))
    .filter((t) => keys.has(t.field) && !gate.tips[t.id] && LISTING_TABS.some((x) => x.id === t.tab)).slice(0, 3).map((tip) => {
    const tabLabel = LISTING_TABS.find((x) => x.id === tip.tab)?.label ?? tip.tab
    return { title: tip.title, where: `${NAME(tip.channel)} listing · ${tabLabel}`, hrefSuffix: `/ch/${tip.channel}/listing/${tip.tab}?tip=${tip.id}` }
  })
}
