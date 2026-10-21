/* WS-SL shared helpers: URL demo states, plan reading and strategy versions. */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ASKS, FIELDS, LISTING_CHANNELS, audienceLabel, goalLabel, tipsFor, type ListingChannel, type Plan } from '../../data/sl3'
import {
  DEMO_MIX, DEMO_PLANS, DRAFT_PLAN, mixLabel, planChanges, useSlLocal, type Mix, type StrategyVersion, type VersionBy,
} from '../../data/v3-sl'
import { SL_DAYS, SL_SEED, propertyHistory, slDayOf, slIso } from '../../data/performance'
import { useStore, type SL3State } from '../../store/store'
import { PROFILES, smartChannelsFor } from '../../data/property-seeds'
import { isScenarioProperty, propertyChannels, smartListingsDefaultOn } from '../../data/portfolio'

/** Apply the whole demo state in one go: setup done, per-channel plans, the flag on, and the strategy history.
 *  The scenario property gets every connected channel (Direct included) and ~29 weeks of versions (data/performance.ts
 *  › SL_SEED); any other property gets Airbnb and Booking.com where connected, each at v1 since today (QA B01, B17). */
export function seedSmartOn() {
  const s = useStore.getState()
  const pid = s.activeProperty
  const scenario = isScenarioProperty(pid)
  const channels: ListingChannel[] = scenario ? propertyChannels(pid) : smartChannelsFor(pid)
  s.sl3Setup({ setupDone: true, sameForAll: false, channels })
  for (const c of channels) {
    const demo = DEMO_PLANS[c]
    if (!demo || useStore.getState().sl3.plans[c]) continue
    useStore.getState().sl3Plan(c, demo)
    if (scenario) useSlLocal.getState().setMix(c, DEMO_MIX[c] ?? null)
  }
  useStore.getState().setSmartListings(true)
  // the demo strategies have run for a while: Performance has versions to compare (the scenario property's only, QA B01)
  useStore.getState().setSmartHistory(scenario)
  // a property that isn't the scenario listing gets its own generated history here too, BEFORE the fallback below
  // records a single version starting today — otherwise ?smart=on would undo it and every row would read
  // "Still measuring" again
  seedPropertyHistory(pid, channels)
  for (const c of channels) {
    const st = useStore.getState()
    if (st.sl3.versions?.[c]?.length || !st.sl3.plans[c]) continue
    const seed = scenario ? SL_SEED[c] : undefined
    if (seed?.length) {
      const list: StrategyVersion[] = seed.map((v, i) => ({
        n: v.n, start: slIso(v.from), plan: v.plan, mix: v.mix ?? null, by: v.by, note: v.note,
        changes: i ? planChanges(seed[i - 1], v) : [], seed: true,
      }))
      st.sl3SetVersions(c, list)
      commitVersion(c, 'you') // the host already changed this channel in this session: that is the next version
    } else commitVersion(c, 'setup')
  }
}

/* ---------- the other properties' history (1 Oct · "I want to pretend that all of the different
 * channels have been running on Smart Listings for a long time") ----------
 * data/performance.ts generates a per-property history (propertyVersionSeed) and baselineSim simulates against it.
 * This is the other half: writing those versions into the store, so Strategy's cards and Performance's Versions table
 * read the same history the numbers come from, and flipping smartHistory on so Performance shows its full page (with
 * its period control) instead of the just-set-up branch. The live plan is set to the LAST version's plan, so
 * syncVersions/commitVersion below don't immediately record a spurious fifth version starting today — which would
 * show as "Still measuring", the very thing this fixes.
 * Only properties seeded with Smart Listings already on get a history (data/portfolio.ts smartListingsDefaultOn).
 * A host who has just been through Setup themselves — the three deliberately-off properties — genuinely has none, and
 * Performance says so rather than inventing months of results. */
export function seedPropertyHistory(pid: string, channels: ListingChannel[]) {
  if (isScenarioProperty(pid) || !smartListingsDefaultOn(pid) || !channels.length) return
  const { seed } = propertyHistory(pid, channels, PROFILES[pid]?.guests)
  for (const c of channels) {
    const st = useStore.getState()
    const list = seed[c]
    if (!list?.length || st.sl3.versions?.[c]?.length || !st.sl3.plans[c]) continue
    st.sl3SetVersions(c, list.map((v, i) => ({
      n: v.n, start: slIso(v.from), plan: v.plan, mix: null, by: v.by, note: v.note,
      changes: i ? planChanges({ plan: list[i - 1].plan, mix: null }, { plan: v.plan, mix: null }) : [],
    })))
    useStore.getState().sl3Plan(c, { ...list[list.length - 1].plan })
    useSlLocal.getState().setMix(c, null)
  }
  // Read the result rather than remembering whether this call did the writing: seedSmartOn (?smart=on) sets
  // smartHistory false and React runs that effect twice in development, so a "did I just write?" flag loses the race
  // and Performance drops back to its just-set-up branch on a property that plainly has months of versions.
  // More than one version per channel = a real history; exactly one = a host who has only just finished Setup.
  const st = useStore.getState()
  const seeded = channels.every((c) => (st.sl3.versions?.[c]?.length ?? 0) > 1)
  if (seeded && !st.smartHistory) st.setSmartHistory(true)
}

/* ---------- the scenario property's past strategies, on every path ("I don't have the possibility to
 * choose which other strategy I'm using… fill this up at least for Beautiful Artist Apt. in Neukölln") ----------
 * . ?smart=on wrote SL_SEED (data/performance.ts) as the History, but the first-use wizard saved v1 with
 * nothing under it, so History was empty and "Replace with a previous strategy" offered nothing. This puts the seeded
 * past strategies under whatever the host has saved, on any path: a fresh wizard save, a session that already has a
 * lone "v1 since 1 Oct", or "Use this strategy". The host's own versions keep their order and go on top (renumbered
 * after the seed); a channel the host has never saved anything for is left alone, so first use is unchanged until the
 * first save, which calls this before it writes. The sim (scenarioSim) runs on the same SL_SEED, so Performance's
 * numbers for these versions are the ones History lists. Idempotent: a list that already holds seeded or older
 * versions is not touched. */
const SEEDED_CHANNELS: ListingChannel[] = ['airbnb', 'booking', 'direct']
export function seededVersions(c: ListingChannel): StrategyVersion[] {
  const seed = SL_SEED[c] ?? []
  return seed.map((v, i) => ({
    n: v.n, start: slIso(v.from), plan: v.plan, mix: v.mix ?? null, by: v.by, note: v.note,
    changes: i ? planChanges(seed[i - 1], v) : [], seed: true,
  }))
}
export function ensureScenarioHistory(only?: ListingChannel[], opts: { evenIfEmpty?: boolean } = {}) {
  const pid = useStore.getState().activeProperty
  if (!isScenarioProperty(pid)) return
  const connected = propertyChannels(pid)
  for (const c of SEEDED_CHANNELS) {
    if (!connected.includes(c) || (only && !only.includes(c))) continue
    const st = useStore.getState()
    const list = versionsOf(st.sl3, c)
    if (!list.length && !opts.evenIfEmpty) continue
    const seed = seededVersions(c)
    if (!seed.length || list.some((v) => v.seed)) continue
    // a list that already starts inside the seeded run (an older ?smart=on session) is a full history already
    if (list.length && list[0].start <= seed[seed.length - 1].start) continue
    const past = list.length ? seed.filter((v) => v.start < list[0].start) : seed
    if (!past.length) continue
    const k = past[past.length - 1].n
    const mine = list.map((v, i) => ({
      ...v, n: v.n + k,
      // the seed's v1 was the first setup; the host's first save is now a later version
      by: i === 0 && v.by === 'setup' ? ('you' as VersionBy) : v.by,
      changes: i === 0 && !v.changes.length ? planChanges(past[past.length - 1], v) : v.changes,
    }))
    st.sl3SetVersions(c, [...past, ...mine])
  }
  // Performance reads the scenario's full dataset once there is a history to compare (not the just-set-up branch)
  const st = useStore.getState()
  if (!st.smartHistory && SEEDED_CHANNELS.some((c) => versionsOf(st.sl3, c).some((v) => v.seed))) st.setSmartHistory(true)
}

/**
 * URL states for screenshots and demos (headless profiles start empty):
 *   ?smart=on   Smart Listings on with the demo strategies (Airbnb on Autopilot, Booking.com and Direct with tips only)
 *   ?smart=off  Smart Listings off, setup and versions cleared (the Overview toggle is off)
 * Without a param nothing is seeded: Smart Listings is off for every host until they turn it on (Overview toggle → Setup).
 */
export function useSmartDemo() {
  const [q] = useSearchParams()
  const smart = q.get('smart')
  const pid = useStore((s) => s.activeProperty)
  // a session that saved before the seeded history existed (a lone "v1 since 1 Oct") gets it on its next visit
  useEffect(() => { if (smart !== 'off') ensureScenarioHistory() }, [pid, smart])
  useEffect(() => {
    const s = useStore.getState()
    if (smart === 'on') seedSmartOn()
    else if (smart === 'off') {
      s.setSmartListings(false); s.sl3Setup({ setupDone: false }); s.setSmartHistory(false)
      useStore.setState((st) => ({ sl3: { ...st.sl3, versions: {}, recs: {} } }))
    }
  }, [smart])
}

/** The listing name a channel shows: the host's custom value, else the channel's own value, else the Base. */
export function listingName(c: ListingChannel, sl3: SL3State) {
  const f = FIELDS.find((x) => x.key === 'name')
  const base = sl3.base.name ?? f?.base ?? ''
  const custom = sl3.custom[c]?.name
  if (custom !== undefined) return custom ?? base // null = back to the Base
  return f?.value?.[c] ?? base
}

export const planOf = (plans: Partial<Record<ListingChannel, Plan>>, c: ListingChannel): Plan => plans[c] ?? DRAFT_PLAN
export const openTips = (c: ListingChannel, states: Record<string, 'accepted' | 'dismissed'>) => tipsFor(c).filter((t) => !states[t.id]).length
export const asksText = (p: Plan) => {
  const names = ASKS.filter((a) => p.asks.includes(a.id)).map((a) => a.label.replace(' and fees', '').replace('Minimum stay and rules', 'stay rules').replace('Cancellation policy', 'policy').replace('Property name changes', 'name changes').replace('Photo order', 'photo order'))
  const l = names.map((n, i) => (i === 0 ? n : n.toLowerCase()))
  return l.length > 1 ? `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}` : l.join('')
}
export const audienceText = (p: Plan, mix?: Mix | null) => (mix ? `Your own mix · ${mixLabel(mix)}` : audienceLabel(p.audience))
export const strategyText = (p: Plan, mix?: Mix | null) => `${goalLabel(p.goal)} · ${mix ? 'Your own mix' : audienceLabel(p.audience)}`
export const useMix = (k: ListingChannel | 'all') => useSlLocal((s) => s.mix[k] ?? null)

/* ---------- strategy versions ---------- */
const mixKey = (sl3: SL3State, c: ListingChannel): ListingChannel | 'all' => (sl3.sameForAll ? 'all' : c)
export const versionsOf = (sl3: SL3State, c: ListingChannel): StrategyVersion[] => sl3.versions?.[c] ?? []
export const currentVersion = (sl3: SL3State, c: ListingChannel): StrategyVersion | undefined => versionsOf(sl3, c).slice(-1)[0]
/** The channel's live mix: the current version's (per property), else the session's. */
export const mixOf = (sl3: SL3State, c: ListingChannel, local: Partial<Record<ListingChannel | 'all', Mix | null>>) => {
  const v = currentVersion(sl3, c)
  return v ? v.mix ?? null : local[mixKey(sl3, c)] ?? null
}

/** Record the channel's live plan as a new version when it differs from the latest one (or there is none yet).
 *  Returns the new version number, or null when nothing changed. */
export function commitVersion(c: ListingChannel, by: VersionBy, opts: { note?: string; test?: StrategyVersion['test']; force?: boolean; brief?: string } = {}): number | null {
  if (!useStore.getState().sl3.plans[c]) return null
  ensureScenarioHistory([c], { evenIfEmpty: true })
  const s = useStore.getState()
  const plan = s.sl3.plans[c]!
  const mix = useSlLocal.getState().mix[mixKey(s.sl3, c)] ?? null
  const list = versionsOf(s.sl3, c)
  const last = list[list.length - 1]
  const changes = last ? planChanges(last, { plan, mix }) : []
  // the wizard's free text travels with the strategy: a changed brief alone is a new version too (3 Oct)
  const brief = opts.brief !== undefined ? (opts.brief.trim() || undefined) : last?.brief
  if (last && !changes.length && brief === last.brief && !opts.force) return null
  if (last && brief !== last.brief && !changes.length) changes.push(brief ? 'Updated what the strategy should know' : 'Removed the note for the strategy')
  s.sl3AddVersion(c, { start: slIso(SL_DAYS), plan: { ...plan }, mix, by: by === 'setup' && last ? 'you' : by, changes, note: opts.note, test: opts.test, brief })
  return (last?.n ?? 0) + 1
}
/** Live plans that drifted from their latest version (e.g. an edit left half-way) become a version, so "live = latest".
 *  Runs the property's generated history first, so a channel that has never been on this screen starts from months of
 *  versions rather than one that began today. */
export function syncVersions(channels: ListingChannel[] = LISTING_CHANNELS) {
  ensureScenarioHistory(channels)
  seedPropertyHistory(useStore.getState().activeProperty, channels.filter((c) => useStore.getState().sl3.channels.includes(c)))
  const s = useStore.getState()
  for (const c of channels) if (s.sl3.plans[c] && s.sl3.channels.includes(c)) commitVersion(c, versionsOf(s.sl3, c).length ? 'you' : 'setup')
}

/* ---------- Strategy management (3 Oct: Setup removed; Strategy lists, the full-screen wizard creates and edits) ----------
 * A channel "has a strategy" when it has a plan and is in sl3.channels. One current strategy per channel, edited or
 * replaced through the wizard. Saves are still recorded internally as versions (they drive the sample numbers), but
 * nothing in the UI lists, numbers or restores them. Remove takes the channel out of sl3.channels and
 * drops its live plan. */
export type StrategyState = 'live' | 'paused' | 'none'
export const hasStrategy = (sl3: SL3State, c: ListingChannel) => !!sl3.plans[c] && sl3.channels.includes(c)
export const strategyState = (sl3: SL3State, c: ListingChannel): StrategyState => (!hasStrategy(sl3, c) ? 'none' : sl3.paused[c] ? 'paused' : 'live')
/** The other channels running the same shared strategy as `c` (sl3.groups), only those that still have one. */
export function sharedWith(sl3: SL3State, c: ListingChannel): ListingChannel[] {
  const g = (sl3.groups ?? []).find((x) => x.includes(c))
  return g ? g.filter((x) => x !== c && hasStrategy(sl3, x)) : []
}
/** Take channels out of whatever group they were in (a group left with one channel is no longer a group). */
function ungroup(groups: ListingChannel[][] | undefined, chans: ListingChannel[]): ListingChannel[][] {
  return (groups ?? []).map((g) => g.filter((c) => !chans.includes(c))).filter((g) => g.length > 1)
}
const writeGroups = (groups: ListingChannel[][]) => useStore.setState((st) => ({ sl3: { ...st.sl3, groups } }))

export interface StrategyDraft { channels: ListingChannel[]; plan: Plan; mix: Mix | null; brief: string }
/** Save the wizard: every strategy onto its channels, each channel a new version (unchanged ones are skipped), the
 *  sharing recorded, Smart Listings on. Returns, per channel, the version now live and whether it is new. */
export function saveStrategies(drafts: StrategyDraft[], by: VersionBy, opts: { resume?: boolean } = {}): Array<{ c: ListingChannel; n: number | null; created: boolean }> {
  const s0 = useStore.getState()
  const all = drafts.flatMap((d) => d.channels)
  const props = propertyChannels(s0.activeProperty)
  // per channel from here on: the old "same for all" flag would make every channel read one shared mix
  // only channels that end up with a strategy (the store's first-visit default lists Airbnb and Booking.com regardless)
  s0.sl3Setup({ setupDone: true, sameForAll: false, channels: props.filter((c) => hasStrategy(s0.sl3, c) || all.includes(c)) })
  const out: Array<{ c: ListingChannel; n: number | null; created: boolean }> = []
  ensureScenarioHistory(all, { evenIfEmpty: true }) // the scenario's past strategies go under this save
  for (const d of drafts) for (const c of d.channels) {
    const st = useStore.getState()
    st.sl3Plan(c, { ...d.plan, asks: [...d.plan.asks] })
    useSlLocal.getState().setMix(c, d.mix)
    // a new or replacement strategy goes live; an edit keeps a paused channel paused
    if (opts.resume && st.sl3.paused[c]) st.sl3Pause(c, false)
    const first = !versionsOf(useStore.getState().sl3, c).length
    const n = commitVersion(c, first ? 'setup' : by, { brief: d.brief })
    out.push({ c, n: n ?? currentVersion(useStore.getState().sl3, c)?.n ?? null, created: n !== null })
  }
  writeGroups([...ungroup(useStore.getState().sl3.groups, all), ...drafts.filter((d) => d.channels.length > 1).map((d) => [...d.channels])])
  useStore.getState().setSmartListings(true)
  return out
}
/** Pause / resume one channel's strategy: Autopilot stops and the strategy is kept exactly as it is. */
export const pauseStrategy = (c: ListingChannel, paused: boolean) => useStore.getState().sl3Pause(c, paused)
/** Remove one channel's strategy. Adding one again goes through the wizard. */
export function removeStrategy(c: ListingChannel) {
  useStore.setState((st) => {
    const plans = { ...st.sl3.plans }; delete plans[c]
    return { sl3: { ...st.sl3, plans, channels: st.sl3.channels.filter((x) => x !== c), paused: { ...st.sl3.paused, [c]: false }, groups: ungroup(st.sl3.groups, [c]) } }
  })
}
/** When the channel's current strategy started (ISO date). Versions stay internal ("remove the versions
 *  from the concept of the strategy"): a channel has one strategy, and an edit is still that strategy. So this is the
 *  start of the latest saved version that has run for at least two weeks, which keeps an edit made today from resetting
 *  "since your strategy started" to an empty window (the data can't tell an edit from a replacement). A
 *  channel with nothing that old reads from its first saved version. Strategy ("Live since …") and Performance ("Strategy
 *  started …") both read this, so the two pages agree. */
export function strategyStart(sl3: SL3State, c: ListingChannel): string | undefined {
  const list = versionsOf(sl3, c)
  const today = slIso(SL_DAYS)
  const settled = list.filter((v) => SL_DAYS - slDayOf(v.start) >= 14 && v.start <= today).pop()
  return (settled ?? list[0])?.start
}
