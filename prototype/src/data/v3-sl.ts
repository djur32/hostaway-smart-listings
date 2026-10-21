/* Smart Listing v3 · WS-SL data (V3-SPEC §1 Setup + Strategy management). Everything here is scenario
 * content for "Beautiful Artist Apt. in Neukölln" (concepts/SCENARIO.md), except where marked. Channel rules are
 * (research/market/channel-constraints.md). The shared setup data (GOALS, AUDIENCES, ASKS, PERF) lives in
 * data/sl3.ts; this file adds the per-channel supporting lines, demo plans, strategy versions and a small UI-only store.
 * The performance dataset lives in data/performance.ts › Smart Listings › Performance. */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_PLAN, audienceLabel, goalLabel, type AudienceId, type GoalId, type ListingChannel, type Plan } from './sl3'

/* ---------- the wizard ---------- */
export type SetupStep = 'channels' | 'scope' | 'goal' | 'audience' | 'guardrails' | 'runs' | 'done'
export const CHANNEL_STEPS: SetupStep[] = ['goal', 'audience', 'guardrails', 'runs']

/** The safe default: nothing changes on its own until the host picks Autopilot. */
export const DRAFT_PLAN: Plan = { ...DEFAULT_PLAN, mode: 'suggest' }

/** Channels step: one supporting line per channel. */
export const CHANNEL_LINES: Record<ListingChannel, string> = {
  airbnb: 'Listed · guests stay 4.1 nights on average',
  booking: 'Listed · guests stay 2.4 nights on average',
  direct: '2 bookings this month · uses the Base today',
}

/** Scope step. */
export const SCOPE = {
  same: { title: 'The same strategy everywhere', line: 'One goal and one audience for every channel. The simplest start.' },
  per: { title: 'A different strategy per channel', line: 'A good fit here: Airbnb guests stay 4.1 nights, Booking.com guests 2.4.' },
}

/** Goal tiles: one line per channel, grounded in the scenario. `all` = same strategy everywhere. */
type Lines<K extends string> = Record<ListingChannel | 'all', Record<K, string>> & { suggested: Record<ListingChannel | 'all', K> }
export const GOAL_LINES: Lines<GoalId> = {
  all: {
    fill: '11 of your 13 empty nights in October are Monday to Thursday.',
    earn: 'Your weekends book 3 weeks out; similar homes charge €12 more.',
    balance: 'More weekday nights, the same price on weekends.',
    time: 'Fewer tips, only the ones that move bookings.',
  },
  airbnb: {
    fill: '8 of your 13 empty nights on Airbnb are Monday to Thursday.',
    earn: 'Your Airbnb weekends book 3 weeks out; similar homes charge €12 more.',
    balance: 'More weekday nights, the same price on weekends.',
    time: 'Fewer tips, only the ones that move bookings.',
  },
  booking: {
    fill: '5 empty weekday nights on Booking.com in October.',
    earn: 'Booking.com guests book 9 days out; similar homes charge €7 more.',
    balance: 'Keep weekends, add short weekday stays.',
    time: 'Fewer tips, only the ones that move bookings.',
  },
  direct: {
    fill: 'Your site has 2 bookings this month, both from past guests.',
    earn: 'No channel fee here: the same price earns you 15% more.',
    balance: 'Past guests first, then fill the gaps.',
    time: 'Fewer tips, only the ones that move bookings.',
  },
  suggested: { all: 'fill', airbnb: 'fill', booking: 'fill', direct: 'earn' },
}
export const AUDIENCE_LINES: Lines<AudienceId> = {
  all: {
    remote: '8 of 24 similar homes nearby lead with week-long stays and a desk.',
    couples: '11 of 24 similar homes lead with weekends, food and the park.',
    families: 'Not a fit: this home sleeps 2.',
    auto: 'Based on who books homes like yours, per channel.',
  },
  airbnb: {
    remote: '6 of your last 10 Airbnb stays were 4 nights or longer.',
    couples: '11 of 24 similar homes lead with weekends, food and the park.',
    families: 'Not a fit: this home sleeps 2.',
    auto: 'Based on who books homes like yours on Airbnb.',
  },
  booking: {
    remote: '2 of your last 10 Booking.com stays were 4 nights or longer.',
    couples: '7 of your last 10 Booking.com stays were 2–3 nights, for two.',
    families: 'Not a fit: this home sleeps 2.',
    auto: 'Based on who books homes like yours on Booking.com.',
  },
  direct: {
    remote: 'Both of this month’s direct guests came back to work from here.',
    couples: 'Past guests who came for a weekend.',
    families: 'Not a fit: this home sleeps 2.',
    auto: 'Based on your past guests.',
  },
  suggested: { all: 'remote', airbnb: 'remote', booking: 'couples', direct: 'remote' },
}

/** Mix my own: three plain choices, inline (UI-only until the store has a place for them, see SL.md). */
export type PricePos = 'below' | 'match' | 'above'
export type MinStay = '1' | '2' | '3'
export type Policy = 'flexible' | 'moderate' | 'firm'
export interface Mix { price: PricePos; minStay: MinStay; policy: Policy }
export const DEFAULT_MIX: Mix = { price: 'match', minStay: '2', policy: 'moderate' }
export const MIX_ROWS = {
  price: { label: 'Price', line: 'Similar homes charge €38–€96 a night.', items: [{ id: 'below', label: 'Below similar homes' }, { id: 'match', label: 'Like similar homes' }, { id: 'above', label: 'Above' }] },
  minStay: { label: 'Minimum stay', line: '9 of your 13 empty nights sit between two bookings.', items: [{ id: '1', label: '1 night' }, { id: '2', label: '2 nights' }, { id: '3', label: '3 nights +' }] },
  policy: { label: 'Cancellation', line: '15 of 24 similar homes use Moderate.', items: [{ id: 'flexible', label: 'Flexible' }, { id: 'moderate', label: 'Moderate' }, { id: 'firm', label: 'Firm' }] },
} as const
/** Audience step ("if I tap on any of these, I should see what the configuration is"): the price,
 *  minimum stay and cancellation each audience starts from. defaults for the Neukölln scenario — remote
 *  workers: long stays, flexible cancel; city-break couples: 2-night weekends, priced like similar homes; Let Smart
 *  Listings decide: its recommended mix; `custom` (the host describes the guests): the neutral default. */
export const AUDIENCE_MIX: Record<AudienceId | 'custom', Mix> = {
  remote: { price: 'below', minStay: '3', policy: 'flexible' },
  couples: { price: 'match', minStay: '2', policy: 'moderate' },
  families: { price: 'match', minStay: '2', policy: 'moderate' },
  auto: { price: 'match', minStay: '2', policy: 'moderate' },
  custom: DEFAULT_MIX,
}
/** Why each audience starts there, one line. */
export const AUDIENCE_MIX_LINE: Partial<Record<AudienceId | 'custom', string>> = {
  remote: 'Week-long stays priced a little under similar homes, so the weekly total wins.',
  couples: 'Weekend stays at the going rate.',
  auto: 'What books homes like yours most often.',
  custom: 'Start from the usual set-up and change what you need.',
}
export const sameMix = (a: Mix, b: Mix) => a.price === b.price && a.minStay === b.minStay && a.policy === b.policy
/** The similar-homes range, said once on the price block (as MIX_ROWS.price.line). */
export const SIMILAR_RANGE = '€38–€96'

export const mixLabel = (m: Mix) =>
  `${MIX_ROWS.price.items.find((i) => i.id === m.price)!.label} · ${m.minStay === '3' ? '3+' : m.minStay} night${m.minStay === '1' ? '' : 's'} min · ${m.policy[0].toUpperCase()}${m.policy.slice(1)}`

/** Guardrails step: one line per ask. */
export const ASK_LINES: Record<string, string> = {
  price: 'Price tips wait for you in Pricing.',
  rules: 'Stay rules change who can book.',
  policy: 'Changing it changes what guests are promised.',
  title: 'Guests see the new name in search.',
  photos: 'Only the order changes. No photo is added or removed.',
}
/** The guardrails step repeats per channel, so its lines must hold for whichever channel's pass you are on.
 *  "Keeping your reviews" is an Airbnb guarantee (research/market/channel-constraints.md) and read as a
 *  false claim on the Booking.com and Direct passes, which showed it verbatim; every other line is channel-neutral. */
export const askLine = (id: string, c?: ListingChannel) =>
  id === 'title' && c === 'airbnb' ? 'Airbnb keeps your reviews when the name changes.' : ASK_LINES[id]
export const PRICE_LINE = 'Similar homes: €38–€96 a night · your October average is €48.'

/** Runs step. */
export const RUNS = {
  tips: { title: 'Tips', icon: 'sparkles', line: 'Autopilot off: tips wait for you in each listing. Nothing changes until you accept one.' },
  autopilot: { title: 'Autopilot', icon: 'rocket', line: 'Applies text and photo-order tips on its own, inside your guardrails.' },
}
export const AUTOPILOT_DEFINITION =
  'Autopilot changes text and photo order only. Anything you keep asking for, prices and rules included, still waits for you. Every change shows in Strategy, and you can undo it.'

/** Tips waiting per channel after setup (matches data/sl3.ts TIPS). */
export const FIRST_TIPS: Record<ListingChannel, number> = { airbnb: 6, booking: 3, direct: 1 }

/* ---------- demo seed (?smart=on, or a persona that starts with Smart Listings on) ----------
 * Three genuinely different strategies: each channel has its own goal, audience, price range and
 * Autopilot setting. They are the live versions of the history in data/performance.ts › SL_SEED. */
export const DEMO_PLANS: Partial<Record<ListingChannel, Plan>> = {
  airbnb: { goal: 'fill', audience: 'remote', asks: ['price', 'rules', 'policy'], priceMin: 40, priceMax: 90, mode: 'suggest' }, // Autopilot is off by default everywhere: fields stay editable
  booking: { goal: 'earn', audience: 'couples', asks: ['price', 'rules', 'policy', 'title'], priceMin: 55, priceMax: 130, mode: 'suggest' },
  direct: { goal: 'balance', audience: 'auto', asks: ['price', 'rules', 'policy'], priceMin: 42, priceMax: 85, mode: 'suggest' },
}
/** Direct's audience is the host's own mix: past guests, a lower price, flexible cancellation (its latest version, v4, data/performance.ts › SL_SEED). */
export const DEMO_MIX: Partial<Record<ListingChannel, Mix>> = { direct: { price: 'below', minStay: '1', policy: 'flexible' } }

/* ---------- strategy: what autopilot applied (before → after for AUTOPILOT_LOG rows, same order) ---------- */
export const LOG_DIFFS: Array<{ section: string; from?: string; to: string }> = [
  { section: 'Essentials', from: 'Beautiful Artist Apt. in Neukölln', to: "Artist's Flat by Tempelhofer Feld · Neukölln" },
  { section: 'Photos', from: 'Desk photo 9th', to: 'Desk photo 3rd' },
  { section: 'Essentials', to: 'A sunny 48 m² flat with original paintings and a real desk by the window.' },
]

/* ---------- strategy versions (Strategy › Versions; stored in the store's sl3.versions, per property) ----------
 * Every saved change to a channel's strategy is a version: Setup, Edit, the Autopilot switch, Restore, and acting on a
 * recommendation in Performance. Versions are additive; Restore and Undo-of-a-recommendation create or drop the last one. */
export type VersionBy = 'setup' | 'you' | 'autopilot' | 'recommendation'
export const BY_LABEL: Record<VersionBy, string> = { setup: 'You · first setup', you: 'You', autopilot: 'Autopilot', recommendation: 'From a recommendation' }
export interface StrategyVersion {
  n: number
  /** The day it went live (yyyy-mm-dd). The version runs until the next one starts. */
  start: string
  plan: Plan
  mix?: Mix | null
  by: VersionBy
  /** Plain-language differences with the version before ("Price range €40–80 → €40–90"). */
  changes: string[]
  note?: string
  /** Run as a test: alternates with version `against` by week ("half the dates") for `weeks` weeks. */
  test?: { against: number; weeks: number }
  /** What the host told the strategy in the wizard's free-text step ("Anything the strategy should know?"). */
  brief?: string
  /** one of the scenario property's seeded past strategies (data/performance.ts › SL_SEED), written under
   *  whatever the host saves (screens/smart/shared.ts ensureScenarioHistory). Never shown as a label on screen. */
  seed?: boolean
}
export const audienceOf = (p: Plan, mix?: Mix | null) => (mix ? `Your own mix: ${mixLabel(mix).toLowerCase()}` : audienceLabel(p.audience))
export const priceOf = (p: Plan) => `€${p.priceMin}–${p.priceMax}`
/** One line for a strategy: "Fill empty nights · Remote workers · €40–90". */
export const strategyLine = (p: Plan, mix?: Mix | null) => `${goalLabel(p.goal)} · ${mix ? 'Your own mix' : audienceLabel(p.audience)} · ${priceOf(p)}`
const askName = (id: string) => ({ title: 'name changes', photos: 'photo order', price: 'prices', rules: 'stay rules', policy: 'cancellation policy' } as Record<string, string>)[id] ?? id
/** What changed between two strategies, in plain language. */
export function planChanges(a: { plan: Plan; mix?: Mix | null }, b: { plan: Plan; mix?: Mix | null }): string[] {
  const out: string[] = []
  if (a.plan.goal !== b.plan.goal) out.push(`Goal: ${goalLabel(a.plan.goal)} → ${goalLabel(b.plan.goal)}`)
  const aa = audienceOf(a.plan, a.mix), ba = audienceOf(b.plan, b.mix)
  if (aa !== ba) out.push(`Audience: ${a.mix ? 'Your own mix' : audienceLabel(a.plan.audience)} → ${b.mix ? 'Your own mix' : audienceLabel(b.plan.audience)}`)
  if (a.plan.priceMin !== b.plan.priceMin || a.plan.priceMax !== b.plan.priceMax) out.push(`Price range ${priceOf(a.plan)} → ${priceOf(b.plan)}`)
  if (a.plan.mode !== b.plan.mode) out.push(`Autopilot: ${a.plan.mode === 'autopilot' ? 'On → Off' : 'Off → On'}`)
  const added = b.plan.asks.filter((x) => !a.plan.asks.includes(x)), removed = a.plan.asks.filter((x) => !b.plan.asks.includes(x))
  if (added.length) out.push(`Now asks you before ${added.map(askName).join(' and ')}`)
  if (removed.length) out.push(`No longer asks before ${removed.map(askName).join(' and ')}`)
  return out
}
export const samePlan = (a: { plan: Plan; mix?: Mix | null }, b: { plan: Plan; mix?: Mix | null }) => planChanges(a, b).length === 0

/* ---------- UI-only state (kept here until the sl3 slice has a home for it; see SL.md › foundation requests) ---------- */
interface SlLocal {
  mix: Partial<Record<ListingChannel | 'all', Mix | null>>
  undone: Record<number, boolean>
  setMix: (k: ListingChannel | 'all', m: Mix | null) => void
  setUndone: (i: number, v: boolean) => void
}
export const useSlLocal = create<SlLocal>()(persist((set) => ({
  mix: {},
  undone: {},
  setMix: (k, m) => set((s) => ({ mix: { ...s.mix, [k]: m } })),
  setUndone: (i, v) => set((s) => ({ undone: { ...s.undone, [i]: v } })),
}), {
  name: 'hostaway-proto-v3-sl',
  storage: createJSONStorage(() => {
    try { return sessionStorage } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} } }
  }),
}))

/* ---------- the strategy wizard (screens/smart/StrategyWizard.tsx, 3 Oct) ----------
 * Full-screen, Hostaway's Add-property layout. Copy is short on purpose: one line under a question at most, and never
 * a reference to another page. */
export const WIZARD_INTRO = [
  { icon: 'target', title: 'Pick a goal for each channel', line: 'Fill empty nights, earn more per night, or a balance.' },
  { icon: 'users', title: 'Choose who it’s for', line: 'The guests you want to attract on each channel.' },
  { icon: 'shield-check', title: 'Set your guardrails', line: 'A price range, and what always asks you first.' },
  { icon: 'sparkles', title: 'Tips every step of the way', line: 'Smart Listings suggests changes. You review, tweak and accept.', ai: true },
]
export const SCOPE_CHOICES = {
  same: { title: 'One strategy for all of them', line: 'The same goal, guests and guardrails everywhere.' },
  each: { title: 'A different strategy for each', line: 'Guests on each channel often want different things.' },
  group: { title: 'Some channels share one', line: 'Choose which channels share a strategy.' },
}
export const AUTOPILOT_CHOICES = {
  suggest: { title: 'Autopilot off', line: 'Tips wait for you. Nothing changes until you accept one.' },
  autopilot: { title: 'Autopilot on', line: 'Text and photo-order tips apply on their own, inside your guardrails.' },
}
/** "Use voice" stand-in transcript (grounded in the scenario: a 2-guest Neukölln flat with a desk). */
export const VOICE_SAMPLE = 'The desk by the window is the best thing about the flat. Keep the name short, and don’t promise late check-in.'
