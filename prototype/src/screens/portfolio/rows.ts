/* SCR-05 · the Grid's row model · owner S12 · R-115 R-133 · D-151 D-154
 * Joins the 12 portfolio rows (data/portfolio.ts) with what the store knows: group strategies and property overrides
 * (pricing inheritance), bulk results (cleared, marks), and — for the scenario property — the live record itself. */
import { DETAIL, GROUPS, MY_PORTFOLIO as PORTFOLIO, syntheticPortfolio } from '../../data/portfolio' // the account's own (D-160)
import { PROPERTY_ID } from '../../data/scenario'
import type { ChannelHealth, ChannelId, PortfolioGroup, PricingStrategy, Property, PropertyDetail } from '../../data/types'
import { needsYou } from '../../store/selectors'
import type { State } from '../../store/store'

export type Level = 'group' | 'property' | 'channel'
export interface Resolved<T> { value: T; level: Level; groupValue: T }

export interface Row {
  p: Property
  d: PropertyDetail
  group: PortfolioGroup
  channels: ChannelId[]
  health: Partial<Record<ChannelId, ChannelHealth>>
  pending: { conflicts: number; suggestions: number; questions: number }
  lastPushDays: number | null
  alert: { kind: 'failed' | 'drifted'; text: string; channel: ChannelId } | null
  base: number
  get: <K extends keyof PricingStrategy>(k: K) => Resolved<PricingStrategy[K]>
  /** Cleaning fee per channel, with where each value comes from. */
  fee: (c: ChannelId) => Resolved<number>
  marks: string[]
}

const euros = (v: string | undefined) => (v ? Number(v.replace(/[^0-9.]/g, '')) || 0 : 0)

let synth: ReturnType<typeof syntheticPortfolio> | null = null

export function buildRows(s: State): Row[] {
  const base = PORTFOLIO.map((p) => ({ p, d: DETAIL[p.id] }))
  const extra = s.portfolio.scale200 ? (synth ??= syntheticPortfolio()) : []
  const groups = s.portfolio.groups.length ? s.portfolio.groups : GROUPS
  const ny = needsYou(s)
  return [...base, ...extra].map(({ p, d }) => {
    const group = groups.find((g) => g.id === d.groupId) ?? groups[0]
    const own = { ...d.overrides } as Partial<PricingStrategy>
    for (const [k, v] of Object.entries(s.portfolio.overrides[p.id] ?? {})) {
      if (v === null) delete (own as Record<string, unknown>)[k]
      else (own as Record<string, unknown>)[k] = v
    }
    const get = <K extends keyof PricingStrategy>(k: K): Resolved<PricingStrategy[K]> =>
      k in own && own[k] !== undefined ? { value: own[k] as PricingStrategy[K], level: 'property', groupValue: group.pricing[k] } : { value: group.pricing[k], level: 'group', groupValue: group.pricing[k] }
    const cleared = s.portfolio.cleared[p.id] ?? {}
    const deep = p.id === PROPERTY_ID
    const factFee = s.facts['fee.cleaning']
    const fee = (c: ChannelId): Resolved<number> => {
      const store = s.portfolio.channelFees[p.id]?.[c]
      if (store !== undefined) return { value: store, level: 'channel', groupValue: group.pricing.cleaningFee }
      if (deep && factFee) {
        const o = factFee.overrides[c]?.value ?? factFee.observations.find((x) => x.source.kind === c)?.value
        if (o) return { value: euros(o), level: 'channel', groupValue: group.pricing.cleaningFee }
        if (factFee.value && factFee.value !== 'Per channel') return { value: euros(factFee.value), level: 'property', groupValue: group.pricing.cleaningFee }
      }
      if (d.channelFees?.[c] !== undefined) return { value: d.channelFees[c]!, level: 'channel', groupValue: group.pricing.cleaningFee }
      const r = get('cleaningFee')
      return r
    }
    const health: Row['health'] = {}
    for (const c of p.channels) {
      const h = d.health[c]
      if (!h) continue
      let status = h.status
      if (cleared.failed && status === 'failed') status = 'in-sync'
      if (cleared.drift && status === 'drifted') status = 'in-sync'
      if (deep) status = s.setup.live ? (ny.open.length ? 'needs-you' : 'in-sync') : 'needs-you' // QA B06: open decisions only
      health[c] = { ...h, status }
    }
    const pending = deep
      ? { conflicts: ny.open.length, suggestions: ny.suggestions.length, questions: ny.questions.length }
      : { conflicts: cleared.conflicts ? 0 : d.pending.conflicts, suggestions: cleared.suggestions ? 0 : d.pending.suggestions, questions: d.pending.questions }
    const alerts = p.channels.flatMap((c): NonNullable<Row["alert"]>[] => {
      const h = health[c]
      if (h?.status === 'failed') return [{ kind: 'failed' as const, text: h.failed ?? 'Sync failed', channel: c }]
      if (h?.status === 'drifted') return [{ kind: 'drifted' as const, text: h.drift ?? 'Changed on the channel', channel: c }]
      return []
    })
    const pushes = p.channels.map((c) => d.health[c]?.lastPushDays).filter((x): x is number => x !== null && x !== undefined)
    const deepPush = deep && (s.listings.airbnb.lastPush || s.listings.booking.lastPush) ? 0 : null
    return {
      p, d, group, channels: p.channels, health, pending, lastPushDays: deep ? deepPush : pushes.length ? Math.min(...pushes) : null,
      alert: alerts[0] ?? null, base: d.base, get, fee, marks: s.portfolio.marks[p.id] ?? [],
    }
  })
}

export const ago = (days: number | null) => (days === null ? 'Never' : days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`)

/** Saved views = Hostaway's Properties segments and tags (HS-16), plus the ones a portfolio needs. */
export const VIEWS: Array<{ id: string; label: string; test: (r: Row) => boolean; group?: string }> = [
  { id: 'all', label: 'All properties', test: () => true },
  { id: 'needs-you', label: 'Needs you', test: (r) => r.pending.conflicts + r.pending.suggestions + r.pending.questions > 0 || !!r.alert },
  { id: 'sync', label: 'Sync issues', test: (r) => !!r.alert },
  { id: 'weak', label: 'Weak listings (< 65)', test: (r) => Object.values(r.health).some((h) => h && h.strength < 65) },
  { id: 'stale', label: 'Text untouched 12+ months', test: (r) => r.d.descriptionAgeMonths >= 12 },
  { id: 'g-berlin', label: 'Berlin', group: 'Groups', test: (r) => r.group.id === 'berlin' },
  { id: 'g-potsdam', label: 'Potsdam & lakes', group: 'Groups', test: (r) => r.group.id === 'potsdam' },
  { id: 'o-weber', label: 'Owner: Weber', group: 'Tags', test: (r) => r.d.tags.includes('Owner: Weber') },
  { id: 'o-lindqvist', label: 'Owner: Lindqvist', group: 'Tags', test: (r) => r.d.tags.includes('Owner: Lindqvist') },
  { id: 'o-okafor', label: 'Owner: Okafor', group: 'Tags', test: (r) => r.d.tags.includes('Owner: Okafor') },
]
