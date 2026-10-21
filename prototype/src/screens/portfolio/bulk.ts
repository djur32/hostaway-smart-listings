/* F-P1 · bulk actions: what each one proposes per unit, and why a unit is an exception · owner S12 · R-133 · D-151 D-152 D-153
 * Proposals are SIMULATED and deterministic. Exceptions are the point (I-15): they show BEFORE apply, unticked, with the reason. */
import { CHANNELS } from '../../data/channels'
import { STRATEGIES } from '../../data/studio'
import type { ChannelId, PortfolioRule, StrategyId } from '../../data/types'
import { PROPERTY_ID } from '../../data/scenario'
import type { Row } from './rows'

export type BulkKind = 'strategy' | 'titles' | 'accept' | 'fee' | 'conflict' | 'push'

export const BULK_ACTIONS: Array<{ kind: BulkKind; label: string; icon: string; ai?: boolean }> = [
  { kind: 'strategy', label: 'Apply a strategy', icon: 'target', ai: true },
  { kind: 'titles', label: 'Regenerate titles', icon: 'sparkles', ai: true },
  { kind: 'accept', label: 'Accept suggestions', icon: 'circle-check', ai: true },
  { kind: 'fee', label: 'Set a fee', icon: 'coin' },
  { kind: 'conflict', label: 'Resolve a conflict', icon: 'git-merge' },
  { kind: 'push', label: 'Push', icon: 'send' },
]

export interface BulkSetup {
  channel: ChannelId
  strategy: StrategyId
  feeMode: 'set' | 'add'
  feeValue: number
  resolution: 'keep' | 'airbnb' | 'booking' | 'group'
  pushChannels: ChannelId[]
}
export const DEFAULT_SETUP: BulkSetup = { channel: 'booking', strategy: 'remote', feeMode: 'set', feeValue: 32, resolution: 'keep', pushChannels: ['airbnb', 'booking', 'vrbo', 'direct'] }

export interface UnitLine {
  row: Row
  channel: ChannelId | null
  now: string
  next: string
  /** Included by default? Exceptions start unticked. */
  include: boolean
  /** Hard stop: can't be included at all (a rule or the channel says no). */
  blocked?: string
  /** Why this unit is an exception (shown next to the unticked box). */
  why?: string
  /** For AI output: how sure the draft is, and a one-line why. */
  confidence?: 'High' | 'Medium' | 'Low'
  reason?: string
  /** Receipt the channel would give (D-129 outcome). */
  outcome?: 'queued' | 'in review' | 'live' | 'rejected'
}

/** A feature per unit, for AI drafts (what the unit's record says is special). */
const FEATURE: Record<string, [string, string]> = {
  [PROPERTY_ID]: ['Artist Flat', 'Art, Balcony & Desk'], 'kreuzberg-loft': ['Canal Loft', 'Canal View & Balcony'], 'friedrichshain-studio': ['Studio', 'Desk & Fast Wi-Fi'],
  'mitte-courtyard': ['Courtyard Flat', 'Quiet Courtyard'], 'prenzlauer-family': ['Family Flat', '3 Bedrooms & Cot'], 'wedding-garden': ['Garden Room', 'Private Garden'],
  'charlottenburg-classic': ['Classic Apartment', 'High Ceilings & Parquet'], 'tempelhof-park': ['Park View Flat', 'Views of Tempelhofer Feld'], 'moabit-studio': ['Canal Studio', 'Newly Renovated'],
  'schoneberg-balcony': ['Balcony Flat', 'Sunny Balcony'], 'treptow-riverside': ['Riverside Flat', 'River Walks'], 'potsdam-lake': ['Lake House', 'Best Views in Potsdam!'],
}
const feature = (r: Row) => FEATURE[r.p.id] ?? [r.p.nickname.replace(/\s\d+$/, ''), 'Fast Wi-Fi']

const clip = (t: string, n: number) => (t.length <= n ? t : t.slice(0, n - 1).trimEnd() + '…')

/** Does a rule stop this change? (D-153: rules are checked before apply, not after.) */
export function ruleStop(rules: PortfolioRule[], r: Row, channel: ChannelId, field: PortfolioRule['field'], next: string): PortfolioRule | undefined {
  return rules.find((rule) => {
    if (!rule.on || rule.enforcement !== 'hard-stop' || rule.field !== field) return false
    if (rule.channel !== 'all' && rule.channel !== channel) return false
    if (rule.scope.startsWith('Owner:') && !r.d.tags.includes(rule.scope)) return false
    if (rule.scope === 'Berlin' && r.group.id !== 'berlin') return false
    if (field === 'title' && /superlative/.test(rule.constraint)) return /\b(best|perfect|amazing)\b/i.test(next)
    if (field === 'title' && /under 40/.test(rule.constraint)) return next.length > 40
    if (field === 'cleaning-fee' && /owner/.test(rule.constraint)) return true
    return false
  })
}

export function propose(kind: BulkKind, rows: Row[], setup: BulkSetup, rules: PortfolioRule[]): UnitLine[] {
  const ch = setup.channel
  const on = (r: Row, c: ChannelId) => r.channels.includes(c)
  switch (kind) {
    case 'fee':
      return rows.map((r) => {
        if (!on(r, ch)) return { row: r, channel: null, now: '—', next: '—', include: false, blocked: `Not on ${CHANNELS[ch].name}` }
        const cur = r.fee(ch)
        const next = setup.feeMode === 'set' ? setup.feeValue : cur.value + setup.feeValue
        const stop = ruleStop(rules, r, ch, 'cleaning-fee', String(next))
        const own = cur.level !== 'group' && cur.value !== cur.groupValue
        const jump = cur.value > 0 ? (next - cur.value) / cur.value : 0
        const big = Math.abs(jump) > 0.3
        return {
          row: r, channel: ch, now: `€${cur.value}`, next: `€${next}`, include: !stop && !own && !big && cur.value !== next,
          blocked: stop ? `Rule ${stop.id}: ${stop.constraint}` : undefined,
          why: cur.value === next ? 'Already this value' : big ? `A big change (${jump > 0 ? '+' : ''}${Math.round(jump * 100)}%) for a ${r.group.name} home: sure?` : own ? `Has its own value (${cur.level === 'channel' ? `${CHANNELS[ch].name} only` : 'this property'}): keep it?` : r.alert ? 'Sync issue: fix first?' : undefined,
          outcome: 'live',
        }
      })
    case 'conflict': {
      return rows.map((r) => {
        const a = r.fee('airbnb'), b = r.fee('booking')
        if (!on(r, 'airbnb') || !on(r, 'booking')) return { row: r, channel: null, now: '—', next: '—', include: false, blocked: 'Not on both Airbnb and Booking.com' }
        if (a.value === b.value) return { row: r, channel: null, now: `€${a.value} on both`, next: 'No conflict', include: false, why: 'Already the same' }
        const next = setup.resolution === 'keep' ? `Keep €${a.value} · €${b.value}` : setup.resolution === 'airbnb' ? `€${a.value} on both` : setup.resolution === 'booking' ? `€${b.value} on both` : `€${r.group.pricing.cleaningFee} (group) on both`
        const stop = setup.resolution !== 'keep' ? ruleStop(rules, r, 'airbnb', 'cleaning-fee', next) : undefined
        return { row: r, channel: null, now: `€${a.value} Airbnb · €${b.value} Booking.com`, next, include: !stop, blocked: stop ? `Rule ${stop.id}: ${stop.constraint}` : undefined, outcome: 'live' }
      })
    }
    case 'titles':
      return rows.map((r, i) => {
        if (!on(r, ch)) return { row: r, channel: null, now: '—', next: '—', include: false, blocked: `Not on ${CHANNELS[ch].name}` }
        const [name, feat] = feature(r)
        const limit = CHANNELS[ch].titleLimit ?? 50
        const raw = ch === 'vrbo' ? `${name} · ${r.p.area}` : ch === 'booking' ? `${r.p.area} ${name} · ${feat}` : `${name} in ${r.p.area} · ${feat}`
        const next = ch === 'booking' ? raw : clip(raw, limit)
        const stop = ruleStop(rules, r, ch, 'title', next)
        const conf: UnitLine['confidence'] = stop ? 'Low' : /Renovated|Views of/.test(feat) ? 'Medium' : i % 5 === 3 ? 'Medium' : 'High'
        return {
          row: r, channel: ch, now: r.p.name, next, include: !stop && !r.alert, confidence: conf,
          blocked: stop ? `Rule ${stop.id}: ${stop.constraint}` : undefined,
          why: r.alert ? `${r.alert.text}: fix first?` : r.d.tags.includes('Just renovated') ? '“Newly renovated”: is that on the record? (asked your team)' : undefined,
          reason: `Names the area and the unit’s strongest fact (${feat.replace('!', '')})`,
          outcome: 'queued', // Booking.com then reviews names (~48 h) after the push
        }
      })
    case 'strategy': {
      const st = STRATEGIES.find((x) => x.id === setup.strategy)!
      return rows.map((r) => {
        if (!on(r, ch)) return { row: r, channel: null, now: '—', next: '—', include: false, blocked: `Not on ${CHANNELS[ch].name}` }
        const family = r.d.tags.includes('Family') || r.d.tags.includes('House')
        const low = (setup.strategy === 'remote' || setup.strategy === 'business') && family
        const [name] = feature(r)
        return {
          row: r, channel: ch, now: 'No strategy', next: `${st.label}: title, opening, first photos`, include: !low && !r.alert,
          confidence: low ? 'Low' : 'High', why: low ? `Weak fit: ${name} sleeps 6; comps here book families` : r.alert ? 'Sync issue: fix first?' : undefined,
          reason: st.effect, outcome: 'queued',
        }
      })
    }
    case 'accept':
      return rows.filter((r) => r.pending.suggestions > 0).map((r, i) => ({
        row: r, channel: r.channels[0], now: `${r.pending.suggestions} suggestion${r.pending.suggestions === 1 ? '' : 's'}`,
        next: i % 3 === 0 ? 'Title + photo order' : i % 3 === 1 ? 'Highlights: workspace first' : 'Wi-Fi speed in the description',
        include: !r.alert, confidence: i % 4 === 2 ? 'Medium' : 'High', why: r.alert ? 'Sync issue: fix first?' : undefined,
        reason: 'Suggested from the record and similar listings', outcome: 'queued',
      }))
    case 'push':
      return rows.flatMap((r) => r.channels.filter((c) => setup.pushChannels.includes(c)).map((c) => {
        const h = r.health[c]
        const rejected = h?.status === 'failed'
        return { row: r, channel: c, now: rejected ? 'Rejected last time' : `${r.marks.length || (r.p.id === PROPERTY_ID ? 1 : 0)} change(s) waiting`, next: rejected ? 'Will be rejected again' : c === 'booking' ? 'Name: in review' : 'Live',
          include: !rejected && (r.marks.length > 0 || r.p.id === PROPERTY_ID), why: rejected ? `${h?.failed}: fix first` : r.marks.length || r.p.id === PROPERTY_ID ? undefined : 'Nothing waiting',
          outcome: rejected ? 'rejected' : c === 'booking' ? 'in review' : 'live' } as UnitLine
      }))
  }
}

/** Which lines the host must look at before approving the rest (D-152): the lowest-confidence ones first, then one at random. */
export function sample(lines: UnitLine[]): UnitLine[] {
  const pool = lines.filter((l) => l.include || l.blocked?.startsWith('Rule'))
  const rank = { Low: 0, Medium: 1, High: 2 } as const
  const sorted = [...pool].sort((a, b) => rank[a.confidence ?? 'High'] - rank[b.confidence ?? 'High'])
  const picked = sorted.slice(0, 2)
  const rest = sorted.slice(2)
  if (rest.length) picked.push(rest[Math.floor(rest.length / 2)])
  return picked
}

export const TITLE: Record<BulkKind, (s: BulkSetup) => string> = {
  strategy: (s) => `Apply the ${STRATEGIES.find((x) => x.id === s.strategy)?.label} strategy on ${CHANNELS[s.channel].name}`,
  titles: (s) => `Regenerate titles for ${CHANNELS[s.channel].name}`,
  accept: () => 'Accept pending suggestions',
  fee: (s) => `Set the cleaning fee on ${CHANNELS[s.channel].name}`,
  conflict: () => 'Resolve “Cleaning fee differs” everywhere',
  push: () => 'Push waiting changes',
}
