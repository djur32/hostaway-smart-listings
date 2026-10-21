/* KH-C model: reads the Hub's facts from the store (the same Base and channel values every channel screen reads), the
 * iteration's own UI state (gaps answered or dismissed, facts added to an answer), and coverage computed from both. */
import { useMemo } from 'react'
import type { ListingChannel } from '../../../../data/sl3'
import { KH_SECTIONS, khItems, type KhItem, type KhSectionId } from '../../../../data/v3-kh'
import { isScenarioProperty, propertyChannels } from '../../../../data/portfolio'
import { useStore } from '../../../../store/store'
import { display, scopeOf, type HubDraft, type Scope } from '../../model'
import { cancellationCards } from '../../policyCards'
import { POLICY_DEFAULT } from '../../../../data/policies'
import { createPropertyStore, genericSources, hubAmenities, hubItems, useHubPid, type AmenityGroup } from '../../perProperty'
import { C_FACTS, CUSTOM_FACTS, GAPS, QUESTIONS, SOURCES, factKeyOf, sourceCount, type Cov, type Gap, type Question, type Reader, type StageId, type UseWho } from './data'
import { genericQuestions } from './generic'

/* ---------- this iteration's UI state, per property (localStorage; "Reset demo" clears every property) ---------- */
export interface Filled { text: string; group: KhSectionId; fact: string; uses: UseWho[] }
interface KhcState {
  filled: Record<string, Filled>
  dismissed: Record<string, true>
  /** Facts added from "Add a fact to this answer": question id → fact keys. */
  added: Record<string, Array<{ key: string; label: string }>>
}
/** Same persist name as the un-keyed store it replaces: data saved before multi-property migrates to Neukölln. */
export const useKhc = createPropertyStore('hospitable-kh-c', (): KhcState => ({ filled: {}, dismissed: {}, added: {} }), (set) => ({
  fill: (id: string, f: Filled) => set((s) => ({ filled: { ...s.filled, [id]: f } })),
  dismiss: (id: string) => set((s) => ({ dismissed: { ...s.dismissed, [id]: true as const } })),
  addFact: (qid: string, key: string, label: string) => set((s) => ({ added: { ...s.added, [qid]: [...(s.added[qid] ?? []), { key, label }] } })),
}))

/* ---------- every fact the Hub holds, by key: per property, read at render (S10 patches FIELDS per property) ---------- */
/** The property's own items. Neukölln: the Hub's items plus this iteration's scripted facts (floor, late checkout, custom
 *  facts). Any other property: its own items (perProperty hubItems), no scripted facts. */
function baseItems(pid: string): KhItem[] {
  return isScenarioProperty(pid) ? [...khItems(), ...C_FACTS, ...CUSTOM_FACTS] : hubItems(pid)
}
export const amenityGroupOf = (name: string, amenities: AmenityGroup[]) => amenities.find((g) => g.items.some((i) => i.name === name))?.group

/** A source in the Sources panel: the scenario's four (with message history and the guidebook), or the property's
 *  generic two (Property details · House rules). */
export interface KhcSourceDef { id: string; icon: string; name: string; desc: string; when: string }

/** Facts created in this session: a gap's answer, or a fact added to an answer. */
function extraItems(filled: Record<string, Filled>, added: KhcState['added']): KhItem[] {
  const out: KhItem[] = []
  for (const [id, f] of Object.entries(filled)) {
    const g = GAPS.find((x) => x.id === id)
    if (!g || g.amenity) continue
    const state = Object.fromEntries(f.uses.filter((u): u is ListingChannel => u !== 'ai').map((c) => [c, 'listing']))
    out.push({ key: factKeyOf(g), section: f.group, label: f.fact, kind: 'textarea', base: f.text, state })
  }
  for (const list of Object.values(added)) for (const a of list) out.push({ key: a.key, section: 'custom', label: a.label, kind: 'textarea', base: '', state: {} })
  return out
}

export interface Hub {
  /** The scenario property (Neukölln): scripted questions, gaps and sources. */
  scenario: boolean
  /** The property's listing channels. */
  chs: ListingChannel[]
  /** The property's guest questions: Neukölln's 48 from its conversations, or the standard set for any other property. */
  questions: Question[]
  question: (id: string | null) => Question | undefined
  amenities: AmenityGroup[]
  sources: KhcSourceDef[]
  sourceCount: (id: string) => number
  r: Reader
  item: (key: string) => KhItem | undefined
  scope: (key: string) => Scope | undefined
  items: KhItem[]
  amenityOn: (name: string, c: ListingChannel) => boolean
  /** Coverage now: answered once its gap is filled (or its facts changed, like the hair dryer). */
  cov: (q: Question) => Cov
  facts: (q: Question) => Question['facts']
  /** Open gaps, most asked first (not answered, not dismissed). */
  gaps: Gap[]
  usedIn: (key: string) => Question[]
  filled: Record<string, Filled>
}

export function useHub(): Hub {
  const pid = useHubPid()
  const base = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const filled = useKhc((s) => s.filled)
  const dismissed = useKhc((s) => s.dismissed)
  const added = useKhc((s) => s.added)
  const policies = useStore((s) => s.policies)
  // per property, memoised on its id (never captured at import time)
  const fixed = useMemo(() => {
    const scenario = isScenarioProperty(pid)
    const chs = propertyChannels(pid)
    const own = baseItems(pid)
    const amenities = hubAmenities(pid)
    const questions = scenario ? QUESTIONS : genericQuestions(own, chs)
    const sources: KhcSourceDef[] = scenario ? SOURCES.map((x) => ({ ...x })) : genericSources(pid, own).map((x) => ({ id: x.id, icon: x.icon, name: x.title, desc: x.sub, when: x.meta.toLowerCase() }))
    const defaultOn = new Map(amenities.flatMap((g) => g.items.map((i) => [i.name, i.on] as const)))
    return { scenario, chs, own, amenities, questions, sources, defaultOn, gapList: scenario ? GAPS : [] }
  }, [pid])
  return useMemo(() => {
    const { scenario, chs, own, amenities, questions, sources, defaultOn, gapList } = fixed
    const items = [...own, ...extraItems(filled, added)]
    const byKey = new Map(items.map((i) => [i.key, i]))
    const view = { base: (k: string, fb: string) => base[k] ?? fb, cv: (c: ListingChannel, k: string) => custom[c]?.[k] } as unknown as HubDraft
    const scopes = new Map<string, Scope>()
    const scope = (key: string) => {
      const it = byKey.get(key)
      if (!it) return undefined
      if (!scopes.has(key)) scopes.set(key, scopeOf(it, view, chs))
      return scopes.get(key)
    }
    const amenityOn = (name: string, c: ListingChannel) => { const v = custom[c]?.[`amenity:${name}`]; return v === 'on' ? true : v === 'off' ? false : (defaultOn.get(name) ?? []).includes(c) }
    const raw = (key: string, c: ListingChannel): string | undefined => {
      const it = byKey.get(key); const s = scope(key)
      if (!it || !s) return undefined
      if (s.only) return s.only === c ? s.own[0]?.value : undefined
      const own = s.own.find((o) => o.c === c); if (own) return own.value
      const set = s.set.find((x) => x.c === c); if (set) return set.value
      return s.base
    }
    const r: Reader = {
      v: (key, c) => { const it = byKey.get(key); const v = raw(key, c); return it && v !== undefined ? display(it, v) : '' },
      raw: (key, c) => raw(key, c) ?? '',
      cancel: (c) => cancellationCards(c, policies?.[c] ?? POLICY_DEFAULT[c]),
      b: (key) => { const it = byKey.get(key); const s = scope(key); return it && s ? display(it, s.base) : '' },
      n: (key, c) => Number(raw(key, c) ?? 0) || 0,
      on: (key, c) => (key.startsWith('amenity:') ? amenityOn(key.slice(8), c) : raw(key, c) !== undefined && raw(key, c) !== ''),
    }
    const question = (id: string | null) => questions.find((x) => x.id === id)
    const cov = (q: Question): Cov => (q.gap && filled[q.gap] ? 'a' : q.covFn ? q.covFn(r) : q.cov)
    const facts = (q: Question) => {
      const out = [...q.facts]
      const g = q.gap ? gapList.find((x) => x.id === q.gap) : undefined
      if (g && filled[g.id] && !g.amenity) out.push({ keys: [factKeyOf(g)] })
      for (const a of added[q.id] ?? []) out.push({ keys: [a.key] })
      return out
    }
    const gaps = gapList.filter((g) => !dismissed[g.id] && cov(question(g.question)!) !== 'a')
      .sort((a, b) => (question(b.question)!.asked ?? 0) - (question(a.question)!.asked ?? 0))
    const usedIn = (key: string) => questions.filter((q) => facts(q).some((f) => f.keys.includes(key)))
    return {
      scenario, chs, questions, question, amenities, sources, sourceCount: (id: string) => sourceCount(id, questions),
      r, item: (k) => byKey.get(k), scope, items, amenityOn, cov, facts, gaps, usedIn, filled,
    }
  }, [fixed, base, custom, filled, dismissed, added, policies])
}

/** The answer a question gives now: a filled gap's text replaces the AI's non-answer. */
export function answerOf(q: Question, hub: Hub, c: ListingChannel) {
  const f = q.gap ? hub.filled[q.gap] : undefined
  if (f && !GAPS.find((g) => g.id === q.gap)?.amenity) return { text: [f.text] }
  return q.answer(hub.r, c)
}
export const lineOf = (q: Question, hub: Hub, c: ListingChannel) => {
  const f = q.gap ? hub.filled[q.gap] : undefined
  if (f && !GAPS.find((g) => g.id === q.gap)?.amenity) return f.text
  return q.line ? q.line(hub.r) : q.answer(hub.r, c).text.join(' ')
}

export function stageStats(hub: Hub, stage: StageId) {
  const qs = hub.questions.filter((q) => q.stage === stage)
  const answered = qs.filter((q) => hub.cov(q) === 'a').length
  return { total: qs.length, answered, gaps: hub.gaps.filter((g) => hub.question(g.question)!.stage === stage).length }
}

/* ---------- Everything A–Z: the Hub's groups (the first build's section list) ---------- */
export const AZ_GROUPS = KH_SECTIONS
export function groupItems(hub: Hub, id: KhSectionId): string[] {
  if (id === 'amenities') return hub.amenities.flatMap((g) => g.items.map((i) => `amenity:${i.name}`))
  if (id === 'policies') return ['policy:cancel', 'policy:instant']
  if (id === 'photos') return []
  return hub.items.filter((i) => i.section === id).map((i) => i.key)
}
