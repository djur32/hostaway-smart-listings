/* The prototype store (Zustand) · S09 scaffold, D-128 / D-129.
 * One session of the scenario: facts, decisions, questions, suggestions, the push queue, receipts, versions, persona.
 * Persisted to sessionStorage so a reload keeps the demo where it was (try/catch: private windows still work).
 *
 * CONTRACT (S10, S11, S12, S13 share it): add state and actions freely; don't rename or change the meaning of
 * existing ones without a note in plan/SESSION-LOG.md. Screens read through the selectors in ./selectors.ts. */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { FIELD } from '../data/canonical'
import { PERSONAS } from '../data/personas'
import {
  seedDecisions, seedFacts, seedListings, seedPhotos, seedQuestions, seedSuggestions, seedVersions,
} from '../data/scenario'
import type {
  ChannelId, Decision, Fact, Listing, PersonaId, Photo, QueuedChange, Question, Receipt, ReceiptState, SetupState, Suggestion, Version,
} from '../data/types'
import type { Autonomy, CanonicalField, CustomFactInput, StrategyId, StudioSection, StudioState } from '../data/types'
import type { ListingTest, ModeOverrides, OwnerLogEntry, PortfolioGroup, PortfolioRule, PricingStrategy } from '../data/types'
import { GROUPS, SEED_LOG, SEED_RULES, isScenarioProperty, setConnectedReader, smartListingsDefaultOn } from '../data/portfolio'
import { currentUser, smartDefaultFor } from '../data/users'
import { PROPERTY_ID } from '../data/scenario'
import { applyPropertyData, seedPhotoLibFor, smartChannelsFor, NO_KNOWLEDGE_BASE } from '../data/property-seeds'
import { historyVersions } from '../data/performance'
import { DEFAULT_PLAN, type ListingChannel, type Plan } from '../data/sl3'
import { DEMO_PLANS, type StrategyVersion } from '../data/v3-sl'
import { deleteLib, editLib, hideLib, reorderLib, seedPhotoLib, syncPhotos, type PhotoEdit, type PhotoLib } from '../data/photos'
import type { ChannelPolicy } from '../data/policies'

export interface Prefs {
  previewOn: boolean
  needsYouMode: 'list' | 'one-by-one'
  compsOpen: boolean
  voiceMode: boolean
}

export interface State {
  persona: PersonaId
  smartListings: boolean
  prefs: Prefs
  facts: Record<string, Fact>
  decisions: Decision[]
  questions: Question[]
  suggestions: Suggestion[]
  listings: Record<'airbnb' | 'booking', Listing>
  photos: Photo[]
  queue: QueuedChange[]
  receipts: Receipt[]
  versions: Version[]
  /** Where "Back" / return chips go (the Calendar back path, R-073, S12). */
  returnTo: string | null
  /** First-time setup progress (S10). */
  setup: SetupState
  /** Angle B studio: strategy, global instructions, autonomy per section, last push for undo (S11). */
  studio: StudioState
  /** Facts the host added that the canonical map doesn't have (S11, R-083). Their values live in `facts`. */
  customFields: CanonicalField[]
  /** S12 · portfolio: group strategies, property overrides, rules, the owner log, bulk results (SCR-05, D-151…D-154). */
  portfolio: PortfolioState
  /** S12 · "90 days later" demo jump applied (versions, series, a running test). */
  history: boolean
  /** S12 · listing tests (D-157). */
  tests: ListingTest[]
  /** S12 · the host's own changes to their mode's defaults (Settings › How Hostaway helps you, D-150). */
  modeOverrides: ModeOverrides
  /** S12 · guidance the host dismissed ("Got it"). */
  guideDismissed: string[]
  /** Smart Listing v3 (V3-SPEC): setup, per-channel plans, tip states, knowledge-base pushes, autopilot pause, custom values. */
  sl3: SL3State
  /** Photos (Hostaway replica, per channel): library order, per-channel visibility / order / cover, captions, room tags. data/photos.ts */
  photoLib: PhotoLib
  /** Booking policies (additive): what the host confirmed in a channel's Configure flow. Missing = POLICY_DEFAULT (data/policies.ts). */
  policies: Partial<Record<ListingChannel, ChannelPolicy>>
  /** Property › Overview settings per property id (additive, QA B15): listing status per channel, nickname, Sync, Mute. Missing = the default. */
  overview?: Record<string, OverviewSettings>
  /** Smart Listings has a performance history to compare (additive, QA B17): true for the ?smart=on demo, false after a first setup. */
  smartHistory?: boolean
  /** Knowledge Hub state for this property (review, 1 Oct): 'none' = never generated (a few properties start here),
   *  'generating' = the creation process is running, 'ready' (or missing) = the Hub exists. */
  kb?: KbState
  /** Multi-property (QA B01/B02): the property whose slices (PROPERTY_SLICES) sit at the top level of this state. */
  activeProperty: string
  /** Every other visited property's slices, by property id. The active one lives at the top level, not here. */
  byProperty: Record<string, PropertySnapshot>
}

/** The state that belongs to one property. S10's import/setup data (facts, decisions, questions, queue, receipts,
 *  versions, setup, listings, photos, suggestions) stays global: only the scenario property has an import story. */
export const PROPERTY_SLICES = ['smartListings', 'smartHistory', 'studio', 'customFields', 'sl3', 'photoLib', 'policies', 'overview', 'kb'] as const
export type KbState = 'none' | 'generating' | 'ready'
export type PropertySnapshot = Pick<State, typeof PROPERTY_SLICES[number]>

export interface OverviewSettings {
  listed?: Partial<Record<ListingChannel, boolean>>; nickname?: string; sync?: boolean; muted?: boolean
  /** Smart Listings on: what a non-channel-specific field (today Languages, Tags — data/sl3.ts FIELDS keys; review,
   *  1 Oct third round: "not just languages and tags... pricing, availability...", so this isn't closed to two
   *  fields — see OvFieldKey) does on every connected channel's page. 'show' (default, missing = 'show') is today's
   *  one value everywhere, unchanged, no chrome; 'edit' opens the per-channel override UI the channel editor already
   *  has for Tags (ds/v3-ch.tsx TagBox), for this field too; 'hidden' removes the field from the channel's page
   *  entirely — a different axis from show/edit (appears at all, not read-only vs editable).
   *  UI-only here (screens/smart/PropertyOverview.tsx FieldVisibilitySection): the channel Listing editor is the
   *  peer session's file and isn't wired to read this yet. */
  fieldVisibility?: Partial<Record<OvFieldKey, FieldVisibility>>
}
/** A field key from any fields ledger that isn't inherently channel-specific — today data/sl3.ts FIELDS' 'languages'
 *  and 'tags'. Kept as a plain string (not a closed two-value union): review, 1 Oct third round, this setting isn't
 *  just for Languages/Tags — it can apply to pricing, availability and other global fields later. Which fields
 *  actually show the control today is FIELD_VIS_KEYS (screens/smart/PropertyOverview.tsx), a plain array — adding a
 *  field there (e.g. a future base/Pricing.tsx key) is a one-line change, not a type change here. */
export type OvFieldKey = string
export type FieldVisibility = 'show' | 'edit' | 'hidden'

export interface SL3State {
  setupDone: boolean
  sameForAll: boolean
  channels: ListingChannel[]
  plans: Partial<Record<ListingChannel, Plan>>
  tips: Record<string, 'accepted' | 'dismissed'>
  kb: Record<string, boolean>
  /** Extra alternatives generated per tip (5 per click). */
  altsShown: Record<string, number>
  paused: Partial<Record<ListingChannel, boolean>>
  /** Per-channel custom values the host wrote (field key → value); `null` = back to the Base. */
  custom: Partial<Record<ListingChannel, Record<string, string | null>>>
  /** Base values the host edited (listing-wide / Base). */
  base: Record<string, string>
  /** Strategy versions per channel, oldest first (additive, WS-SL 1 Oct; data/v3-sl.ts › StrategyVersion). Missing = none yet. */
  versions?: Partial<Record<ListingChannel, StrategyVersion[]>>
  /** Performance › suggestions and recommendations the host acted on (id → state). Missing = open. */
  recs?: Record<string, 'accepted' | 'dismissed' | 'test'>
  /** Channels that share one strategy (the wizard's "one for all" / "some share one"), each list 2+ channels. A channel
   *  in no list runs its own. Missing = none shared (WS-SL strategy wizard, 3 Oct; screens/smart/shared.ts). */
  groups?: ListingChannel[][]
}
export const SL3_INITIAL: SL3State = { setupDone: false, sameForAll: true, channels: ['airbnb', 'booking'], plans: {}, tips: {}, kb: {}, altsShown: {}, paused: {}, custom: {}, base: {} }

export interface PortfolioState {
  groups: PortfolioGroup[]
  /** Property-level overrides of the group strategy, on top of data/portfolio.ts DETAIL. `null` = reset to the group. */
  overrides: Record<string, Partial<Record<keyof PricingStrategy, PricingStrategy[keyof PricingStrategy] | null>>>
  /** Channel-level fee values per property (lens rule 3). */
  channelFees: Record<string, Partial<Record<ChannelId, number>>>
  rules: PortfolioRule[]
  log: OwnerLogEntry[]
  /** Pending items resolved by bulk actions, per property (the Grid's "pending" column goes down). */
  cleared: Record<string, { suggestions?: boolean; conflicts?: boolean; failed?: boolean; drift?: boolean }>
  /** What bulk actions changed per property, for the Grid cells ("New · Remote work"). */
  marks: Record<string, string[]>
  /** Reviewer toggle: show the Grid at 200 properties (synthetic rows). */
  scale200: boolean
}

export interface Actions {
  setPersona: (p: PersonaId) => void
  setPref: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void
  setSmartListings: (on: boolean) => void
  /** Property › Overview settings (QA B15). */
  setOverview: (propertyId: string, patch: OverviewSettings) => void
  setSmartHistory: (on: boolean) => void
  /** The active property's Knowledge Hub state (the Hub's empty state calls 'generating', then 'ready' when the steps finish). */
  setKb: (kb: KbState) => void
  /** Resolve a Needs-you item (C4). Queues what the option says it queues; writes nothing to a channel (D-129). */
  decide: (decisionId: string, optionId: string, makeRule?: boolean) => void
  deferDecision: (decisionId: string) => void
  reopenDecision: (decisionId: string) => void
  answerQuestion: (questionId: string, answer: string) => void
  deferQuestion: (questionId: string) => void
  acceptSuggestion: (suggestionId: string, text?: string) => void
  dismissSuggestion: (suggestionId: string) => void
  /** A host edit to a fact (saved to the record now; channel writes wait for push). */
  setFact: (fieldId: string, value: string) => void
  setOverride: (fieldId: string, channel: ChannelId, value: string | null) => void
  setListingField: (channel: 'airbnb' | 'booking', key: 'title' | 'description', value: string) => void
  reorder: (channel: 'airbnb' | 'booking', kind: 'photoOrder' | 'highlightedAmenities', ids: string[]) => void
  queueChange: (c: Omit<QueuedChange, 'id' | 'at'>) => void
  unqueue: (changeId: string) => void
  /** Review & push (D-129): the queue becomes receipts and a new version per channel. */
  push: (channel?: ChannelId) => Receipt[]
  restoreVersion: (versionId: string) => void
  setReturnTo: (path: string | null) => void
  reset: () => void
  /** Multi-property: park the active property's slices in `byProperty`, then load `pid`'s (seeded on its first visit). */
  setActiveProperty: (pid: string) => void
  /* ---- S10 · import & setup (additive) ---- */
  connectChannel: (c: ChannelId) => void
  setMatch: (m: SetupState['match']) => void
  markLive: () => void
  setDemo: (id: string | null) => void
  /* ---- S11 · studio (additive) ---- */
  setStrategy: (channel: ChannelId, id: StrategyId | null) => void
  setInstructions: (list: string[]) => void
  setAutonomy: (channel: ChannelId, section: StudioSection, level: Autonomy) => void
  /** Adds a host fact. Mapped to a channel field → queued for that channel; hub-only → read by the assistant only. */
  addCustomFact: (input: CustomFactInput) => string
  /** One-click undo (D-145): pushes the version before the last push back to the channel, with its own receipt. */
  undoPush: (channel: ChannelId) => Receipt[]
  /* ---- S12 · portfolio, pricing, versions, tests, modes (additive) ---- */
  setGroupPricing: <K extends keyof PricingStrategy>(groupId: string, key: K, value: PricingStrategy[K]) => void
  /** Property override of a group value (R-115). `null` resets it to the group's. */
  setPropertyOverride: <K extends keyof PricingStrategy>(propertyId: string, key: K, value: PricingStrategy[K] | null) => void
  setChannelFee: (propertyId: string, channel: ChannelId, value: number | null) => void
  addRule: (r: Omit<PortfolioRule, 'id' | 'at'>) => string
  toggleRule: (id: string) => void
  logOwner: (e: Omit<OwnerLogEntry, 'id' | 'at'>) => void
  clearPending: (propertyIds: string[], what: 'suggestions' | 'conflicts' | 'failed' | 'drift') => void
  markProperties: (propertyIds: string[], mark: string) => void
  setScale200: (on: boolean) => void
  /** Demo: jump 90 days ahead — versions v1…v3, series, a running switchback test (D-155…D-157). */
  jumpAhead: () => void
  startTest: (t: Omit<ListingTest, 'id'>) => void
  stopTest: (id: string) => void
  setModeOverride: (o: ModeOverrides) => void
  dismissGuide: (id: string) => void
  // Smart Listing v3
  sl3Setup: (p: Partial<Pick<SL3State, 'sameForAll' | 'channels' | 'setupDone'>>) => void
  sl3Plan: (ch: ListingChannel | 'all', p: Partial<Plan>) => void
  sl3Tip: (id: string, state: 'accepted' | 'dismissed' | null) => void
  sl3Kb: (id: string, on: boolean) => void
  sl3MoreAlts: (id: string) => void
  sl3Pause: (ch: ListingChannel, paused: boolean) => void
  /** `null` = back to the Base; `undefined` = forget the edit (the channel's own value shows again). */
  sl3Custom: (ch: ListingChannel, key: string, value: string | null | undefined) => void
  sl3Base: (key: string, value: string) => void
  /* ---- Strategy versions (additive, WS-SL) ---- */
  /** Replace a channel's whole history (demo seed, ?smart=off clears with []). */
  sl3SetVersions: (ch: ListingChannel, list: StrategyVersion[]) => void
  /** Append a version; `n` is the next number on that channel. */
  sl3AddVersion: (ch: ListingChannel, v: Omit<StrategyVersion, 'n'>) => void
  /** Drop version n (Undo of the action that created it). */
  sl3DropVersion: (ch: ListingChannel, n: number) => void
  sl3Rec: (id: string, state: 'accepted' | 'dismissed' | 'test' | null) => void
  /* ---- Photos (additive): each commit mirrors the change into sl3.custom (Canvas order + Review line) ---- */
  photoReorder: (scope: ListingChannel | 'base', keys: string[]) => void
  photoEdit: (key: string, edit: PhotoEdit) => void
  photoHide: (keys: string[], ch: ListingChannel, hide: boolean) => void
  photoDelete: (keys: string[]) => void
  /* ---- Booking policies (additive) ---- */
  setChannelPolicy: (ch: ListingChannel, p: ChannelPolicy) => void
  /** A channel uses the Base photos (set + order) or its own; switching keeps its own customisation. */
  photoUseBase: (ch: ListingChannel, on: boolean) => void
}

const STUDIO_SECTIONS: StudioSection[] = ['title', 'description', 'photos', 'highlights']
/** Autonomy defaults per persona (D-126): copy only; facts, money and rules are never AI-applied. */
function autonomyFor(p: PersonaId): Record<string, Autonomy> {
  const out: Record<string, Autonomy> = {}
  for (const ch of ['airbnb', 'booking', 'vrbo', 'direct'] as ChannelId[])
    for (const sec of STUDIO_SECTIONS) out[`${ch}.${sec}`] = PERSONAS[p].copyAutonomy[ch] ?? 'suggest'
  return out
}

/** Photos: save the library and mirror it into sl3.custom (photos.order for Canvas, photos for Review & push). */
function commitPhotos(s: State, lib: PhotoLib): Pick<State, 'photoLib' | 'sl3'> {
  const r = syncPhotos(lib, s.sl3)
  return { photoLib: r.lib, sl3: { ...s.sl3, custom: r.custom } }
}

const now = () => new Date().toISOString()
let seq = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

function initial(persona: PersonaId = 'P1'): State {
  const d = PERSONAS[persona]
  return {
    persona,
    smartListings: false, // opt-in for every persona (review, 30 Sep): the Overview toggle turns it on; ?smart=on for demos
    prefs: { previewOn: d.previewOn, needsYouMode: d.needsYouMode, compsOpen: d.compsOpen, voiceMode: d.voiceMode },
    facts: seedFacts(),
    decisions: seedDecisions(),
    questions: seedQuestions(),
    suggestions: seedSuggestions(),
    listings: seedListings(),
    photos: seedPhotos(),
    queue: [],
    receipts: [],
    versions: seedVersions(),
    returnTo: null,
    setup: { connected: [], match: 'pending', live: false, demo: null },
    studio: { strategy: {}, instructions: [], autonomy: autonomyFor(persona), lastPush: {} },
    customFields: [],
    portfolio: { groups: GROUPS, overrides: {}, channelFees: {}, rules: SEED_RULES, log: SEED_LOG, cleared: {}, marks: {}, scale200: false },
    history: false,
    tests: [],
    modeOverrides: {},
    guideDismissed: [],
    sl3: SL3_INITIAL,
    photoLib: seedPhotoLib(),
    policies: {},
    activeProperty: PROPERTY_ID,
    byProperty: {},
  }
}

/** A property's slices on its first visit. The scenario property starts as before (initial()); the others get their
 *  light seed (data/property-seeds.ts): own photo library, default policies, and — per data/portfolio.ts
 *  smartListingsDefaultOn (review, 1 Oct voice note) — Smart Listings already on, past setup, with a strategy per
 *  channel and real tips waiting, EXCEPT the three properties that deliberately stay off (the "before you turn this
 *  on" demonstration). Past setup (not just switched on): setupDone true and a Plan per channel, the same shape
 *  Setup.tsx's finish() would leave behind, so Overview/Strategy/Performance don't redirect to Setup or show a
 *  fresh-setup state. */
function seedProperty(pid: string, persona: PersonaId): PropertySnapshot {
  const studio: StudioState = { strategy: {}, instructions: [], autonomy: autonomyFor(persona), lastPush: {} }
  if (isScenarioProperty(pid)) return { smartListings: false, smartHistory: undefined, studio, customFields: [], sl3: { ...SL3_INITIAL }, photoLib: seedPhotoLib(), policies: {}, overview: undefined }
  const channels = smartChannelsFor(pid)
  const on = smartDefaultFor(currentUser(), smartListingsDefaultOn(pid)) // per account (D-162): Marta and Priya start off
  const plans: Partial<Record<ListingChannel, Plan>> = {}
  if (on) for (const c of channels) if (DEMO_PLANS[c]) plans[c] = { ...DEMO_PLANS[c]! }
  return {
    smartListings: on, smartHistory: false, studio, customFields: [],
    sl3: on ? { ...SL3_INITIAL, setupDone: true, sameForAll: false, channels, plans } : { ...SL3_INITIAL, channels },
    photoLib: seedPhotoLibFor(pid), policies: {}, overview: undefined,
    kb: NO_KNOWLEDGE_BASE.includes(pid) ? 'none' : 'ready',
  }
}
const pickSlices = (s: State): PropertySnapshot => Object.fromEntries(PROPERTY_SLICES.map((k) => [k, s[k]])) as PropertySnapshot
/** Never hand back the SL3_INITIAL object itself: screens/push/changes.ts reads `sl3 === SL3_INITIAL` as "Reset demo". */
const revive = (snap: PropertySnapshot): PropertySnapshot => (snap.sl3 === SL3_INITIAL ? { ...snap, sl3: { ...SL3_INITIAL } } : snap)

/** What a channel does with a pushed change (channel-constraints §5, §9). outcomes, rules. */
function outcome(c: QueuedChange): { state: ReceiptState; reason?: string } {
  if (c.channel === 'booking' && c.fieldId === 'copy.description')
    return { state: 'not-supported', reason: 'Booking.com writes its own description from your facts.' }
  if (c.channel === 'booking' && c.fieldId === 'copy.title')
    return { state: 'in-review', reason: 'Booking.com reviews name changes (usually within 48 h).' }
  const f = FIELD[c.fieldId]
  const r = f?.reach[c.channel]
  if (r === 'N' || r === '—') return { state: 'not-supported', reason: `${c.label} can’t be sent to this channel.` }
  return { state: 'live' }
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(currentUser().persona), // the signed-in account's persona (data/users.ts, D-160)

      setPersona: (p) => {
        const d = PERSONAS[p]
        set((s) => ({
          persona: p, prefs: { previewOn: d.previewOn, needsYouMode: d.needsYouMode, compsOpen: d.compsOpen, voiceMode: d.voiceMode },
          studio: { ...s.studio, autonomy: autonomyFor(p) }, // S11: D-126 autonomy defaults follow the persona
          // …on every property, not only the active one
          byProperty: Object.fromEntries(Object.entries(s.byProperty).map(([id, snap]) => [id, { ...snap, studio: { ...snap.studio, autonomy: autonomyFor(p) } }])),
          modeOverrides: {}, // S12: the demo switch shows the persona's defaults, not the last host tweak (D-150)
        }))
      },
      setPref: (k, v) => set((s) => ({ prefs: { ...s.prefs, [k]: v } })),
      setSmartListings: (on) => set({ smartListings: on }),
      setOverview: (id, patch) => set((s) => {
        const cur = s.overview?.[id] ?? {}
        return { overview: { ...s.overview, [id]: { ...cur, ...patch, listed: { ...cur.listed, ...patch.listed }, fieldVisibility: { ...cur.fieldVisibility, ...patch.fieldVisibility } } } }
      }),
      setSmartHistory: (on) => set({ smartHistory: on }),
      setKb: (kb) => set({ kb }),

      decide: (decisionId, optionId, makeRule) => {
        const s = get()
        const d = s.decisions.find((x) => x.id === decisionId)
        const opt = d?.options.find((o) => o.id === optionId)
        if (!d || !opt) return
        const facts = { ...s.facts }
        const f = d.fieldId ? facts[d.fieldId] : undefined
        if (f && d.kind === 'conflict') {
          const [a, b] = f.observations
          if (optionId === 'keep' && a && b) {
            facts[f.fieldId] = {
              ...f, value: 'Per channel', status: 'confirmed', source: { kind: 'host', at: now(), detail: 'Decided: keep per channel' },
              overrides: {
                airbnb: { value: a.value, reason: 'kept at import', at: now() },
                booking: { value: b.value, reason: 'kept at import', at: now() },
              },
            }
          } else if ((optionId === 'a' || optionId === 'b') && a && b) {
            const v = optionId === 'a' ? a.value : b.value
            facts[f.fieldId] = { ...f, value: v, status: 'confirmed', overrides: {}, source: { kind: 'host', at: now(), detail: `Decided: ${opt.label}` } }
          } else {
            facts[f.fieldId] = { ...f, status: 'confirmed', source: { kind: 'host', at: now(), detail: `Decided: ${opt.label}` } }
          }
        }
        if (f && d.kind !== 'conflict') {
          facts[f.fieldId] = { ...f, status: 'confirmed', source: { kind: 'host', at: now(), detail: `Decided: ${opt.label}` } }
        }
        const queued: QueuedChange[] = (opt.queues ?? []).map((q) => ({
          id: uid('chg'), channel: q.channel, fieldId: q.fieldId ?? d.fieldId ?? d.id, label: q.label, before: q.before, after: q.after, origin: 'reconcile', decisionId: d.id, at: now(),
        }))
        set({
          facts,
          decisions: s.decisions.map((x) => (x.id === decisionId ? { ...x, status: 'decided', choice: optionId, rule: !!makeRule } : x)),
          queue: [...s.queue.filter((q) => q.decisionId !== d.id), ...queued],
          smartListings: d.kind === 'opt-in' ? optionId === 'on' : s.smartListings,
        })
      },
      deferDecision: (id) => set((s) => ({ decisions: s.decisions.map((x) => (x.id === id ? { ...x, status: 'later' } : x)) })),
      reopenDecision: (id) => set((s) => ({ decisions: s.decisions.map((x) => (x.id === id ? { ...x, status: 'open', choice: undefined } : x)) })),

      answerQuestion: (id, answer) => {
        const s = get()
        const q = s.questions.find((x) => x.id === id)
        if (!q) return
        const f = s.facts[q.fieldId]
        const value = q.unit ? `${answer} ${q.unit}` : answer
        const field = FIELD[q.fieldId]
        const toPush: QueuedChange[] = field?.visibility === 'public'
          ? (['airbnb', 'booking'] as ChannelId[])
              .filter((c) => field.reach[c] === 'Y' || field.reach[c] === 'A')
              .map((c) => ({ id: uid('chg'), channel: c, fieldId: q.fieldId, label: field.label, before: f?.value ?? '—', after: value, origin: 'question' as const, at: now() }))
          : []
        set({
          questions: s.questions.map((x) => (x.id === id ? { ...x, status: 'answered', answer } : x)),
          facts: f ? { ...s.facts, [q.fieldId]: { ...f, value, status: 'confirmed', source: { kind: 'host', at: now(), detail: 'Answered a question' } } } : s.facts,
          queue: [...s.queue, ...toPush],
        })
      },
      deferQuestion: (id) => set((s) => ({ questions: s.questions.map((x) => (x.id === id ? { ...x, status: 'later' } : x)) })),

      acceptSuggestion: (id, text) => {
        const s = get()
        const g = s.suggestions.find((x) => x.id === id)
        if (!g) return
        const after = text ?? g.proposed
        const listings = { ...s.listings }
        if ((g.target === 'title' || g.target === 'description') && (g.channel === 'airbnb' || g.channel === 'booking')) {
          listings[g.channel] = { ...listings[g.channel], [g.target]: after }
        }
        set({
          listings,
          suggestions: s.suggestions.map((x) => (x.id === id ? { ...x, status: 'accepted', proposed: after } : x)),
          queue: [...s.queue, { id: uid('chg'), channel: g.channel, fieldId: g.fieldId, label: FIELD[g.fieldId]?.label ?? g.target, before: g.current, after, origin: 'suggestion', at: now() }],
        })
      },
      dismissSuggestion: (id) => set((s) => ({ suggestions: s.suggestions.map((x) => (x.id === id ? { ...x, status: 'dismissed' } : x)) })),

      setFact: (fieldId, value) => {
        const s = get()
        const f = s.facts[fieldId]
        const field = FIELD[fieldId]
        if (!f || !field) return
        const chans = (['airbnb', 'booking'] as ChannelId[]).filter((c) => field.visibility === 'public' && (field.reach[c] === 'Y' || field.reach[c] === 'A') && !f.overrides[c])
        set({
          facts: { ...s.facts, [fieldId]: { ...f, value, status: 'confirmed', source: { kind: 'host', at: now() } } },
          queue: [...s.queue.filter((q) => !(q.fieldId === fieldId && q.origin === 'studio')),
            ...chans.map((c) => ({ id: uid('chg'), channel: c, fieldId, label: field.label, before: f.value ?? '—', after: value, origin: 'studio' as const, at: now() }))],
        })
      },
      setOverride: (fieldId, channel, value) => {
        const s = get()
        const f = s.facts[fieldId]
        if (!f) return
        const overrides = { ...f.overrides }
        if (value === null) delete overrides[channel]
        else overrides[channel] = { value, reason: 'set by host', at: now() }
        set({
          facts: { ...s.facts, [fieldId]: { ...f, overrides } },
          queue: [...s.queue, { id: uid('chg'), channel, fieldId, label: FIELD[fieldId]?.label ?? fieldId, before: f.overrides[channel]?.value ?? f.value ?? '—', after: value ?? (f.value ?? '—'), origin: 'studio', at: now() }],
        })
      },
      setListingField: (channel, key, value) => {
        const s = get()
        const before = s.listings[channel][key]
        const fieldId = key === 'title' ? 'copy.title' : 'copy.description'
        set({
          listings: { ...s.listings, [channel]: { ...s.listings[channel], [key]: value } },
          queue: [...s.queue.filter((q) => !(q.channel === channel && q.fieldId === fieldId && q.origin === 'studio')),
            { id: uid('chg'), channel, fieldId, label: key === 'title' ? 'Title' : 'Description', before, after: value, origin: 'studio', at: now() }],
        })
      },
      reorder: (channel, kind, ids) => {
        const s = get()
        const fieldId = kind === 'photoOrder' ? 'photo.order' : 'copy.highlighted_amenities'
        // S11: show the actual order (first 4) instead of "previous order → new order".
        const name = (id: string) => (kind === 'photoOrder' ? s.photos.find((p) => p.id === id)?.caption : FIELD[id]?.label) ?? id
        const fmt = (list: string[]) => list.slice(0, 4).map((id, i) => `${i + 1}. ${name(id)}`).join(' · ')
        const prevQueued = s.queue.find((q) => q.channel === channel && q.fieldId === fieldId && q.origin === 'studio')
        set({
          listings: { ...s.listings, [channel]: { ...s.listings[channel], [kind]: ids } },
          queue: [...s.queue.filter((q) => !(q.channel === channel && q.fieldId === fieldId && q.origin === 'studio')),
            { id: uid('chg'), channel, fieldId, label: kind === 'photoOrder' ? 'Photo order' : 'Highlighted amenities', before: prevQueued?.before ?? fmt(s.listings[channel][kind]), after: fmt(ids), origin: 'studio', at: now() }],
        })
      },
      queueChange: (c) => set((s) => ({ queue: [...s.queue, { ...c, id: uid('chg'), at: now() }] })),
      unqueue: (changeId) => set((s) => ({ queue: s.queue.filter((q) => q.id !== changeId) })),

      push: (channel) => {
        const s = get()
        const going = s.queue.filter((q) => !channel || q.channel === channel)
        if (!going.length) return []
        const receipts: Receipt[] = going.map((c) => ({ id: uid('rcp'), channel: c.channel, changeId: c.id, label: c.label, ...outcome(c), at: now() }))
        const byChannel = new Set(going.map((c) => c.channel))
        const versions = [...s.versions]
        const lastPush = { ...s.studio.lastPush }
        for (const ch of byChannel) {
          if (ch !== 'airbnb' && ch !== 'booking') continue
          const prev = versions.filter((v) => v.channel === ch).sort((a, b) => b.n - a.n)[0]
          const n = (prev?.n ?? 0) + 1
          const l = s.listings[ch]
          versions.push({ id: `v${n}-${ch}`, channel: ch, n, at: now(), by: 'host', note: `${going.filter((c) => c.channel === ch).length} change(s) pushed`, title: l.title, description: l.description, photoOrder: l.photoOrder, highlightedAmenities: l.highlightedAmenities })
          if (prev) lastPush[ch] = { versionId: `v${n}-${ch}`, prevVersionId: prev.id } // S11: one-click undo (D-145)
        }
        const listings = { ...s.listings }
        for (const ch of byChannel) if (ch === 'airbnb' || ch === 'booking') listings[ch] = { ...listings[ch], lastPush: now() }
        set({ queue: s.queue.filter((q) => !going.includes(q)), receipts: [...s.receipts, ...receipts], versions, listings, studio: { ...s.studio, lastPush } })
        return receipts
      },
      restoreVersion: (versionId) => {
        const s = get()
        const v = s.versions.find((x) => x.id === versionId)
        if (!v || (v.channel !== 'airbnb' && v.channel !== 'booking')) return
        const ch = v.channel
        const l = s.listings[ch]
        // S12: a restore brings back the whole version (title, description, photo order, highlights), queued for push.
        const extra: QueuedChange[] = []
        if (v.photoOrder && v.photoOrder.join() !== l.photoOrder.join())
          extra.push({ id: uid('chg'), channel: ch, fieldId: 'photo.order', label: `Restore v${v.n} · photo order`, before: 'current order', after: `order of v${v.n}`, origin: 'studio', at: now() })
        if (ch === 'airbnb' && v.description !== l.description)
          extra.push({ id: uid('chg'), channel: ch, fieldId: 'copy.description', label: `Restore v${v.n} · description`, before: l.description.slice(0, 60) + '…', after: v.description.slice(0, 60) + '…', origin: 'studio', at: now() })
        set({
          listings: { ...s.listings, [ch]: { ...l, title: v.title, description: v.description, photoOrder: v.photoOrder ?? l.photoOrder, highlightedAmenities: v.highlightedAmenities ?? l.highlightedAmenities } },
          queue: [...s.queue.filter((q) => !q.label.startsWith('Restore v') || q.channel !== ch),
            { id: uid('chg'), channel: ch, fieldId: 'copy.title', label: `Restore v${v.n}`, before: l.title, after: v.title, origin: 'studio', at: now() }, ...extra],
        })
      },
      setReturnTo: (path) => set({ returnTo: path }),
      connectChannel: (c) => set((s) => ({ setup: { ...s.setup, connected: s.setup.connected.includes(c) ? s.setup.connected : [...s.setup.connected, c] } })),
      setMatch: (m) => set((s) => ({ setup: { ...s.setup, match: m } })),
      markLive: () => set((s) => ({ setup: { ...s.setup, live: true } })),
      setDemo: (id) => set((s) => ({ setup: { ...s.setup, demo: id } })),

      /* ---- S11 · studio ---- */
      setStrategy: (channel, id) => set((s) => ({ studio: { ...s.studio, strategy: { ...s.studio.strategy, [channel]: id } } })),
      setInstructions: (list) => set((s) => ({ studio: { ...s.studio, instructions: list } })),
      setAutonomy: (channel, section, level) =>
        set((s) => ({ studio: { ...s.studio, autonomy: { ...s.studio.autonomy, [`${channel}.${section}`]: level } } })),
      addCustomFact: (input) => {
        const s = get()
        // ids count every property's custom facts (their values share `facts`), so two properties never collide
        const id = `custom.host_${Object.keys(s.facts).filter((k) => k.startsWith('custom.host_')).length + 1}`
        const hubOnly = input.mapping.kind === 'hub-only'
        const field: CanonicalField = {
          id, label: input.label, group: 'Custom facts', scope: 'property', type: 'text', unit: '',
          visibility: hubOnly ? 'hub-only' : 'public',
          names: input.mapping.kind === 'channel' ? { [input.mapping.channel]: input.mapping.field } : {},
          overrideAllowed: 'yes',
          reach: input.mapping.kind === 'channel' ? { [input.mapping.channel]: 'Y' } : {},
          conflictPolicy: 'hub only', importPriority: 'host', notes: 'Added by the host (R-083)', section: input.section, tab: input.tab,
        }
        const fact: Fact = {
          fieldId: id, value: input.value, source: { kind: 'host', at: now(), detail: 'Added a fact' }, observations: [], overrides: {},
          sync: input.mapping.kind === 'channel' ? { [input.mapping.channel]: 'pending' } : { airbnb: 'not-published', booking: 'not-published' },
          status: 'confirmed',
        }
        const queued: QueuedChange[] = input.mapping.kind === 'channel'
          ? [{ id: uid('chg'), channel: input.mapping.channel, fieldId: id, label: `${input.mapping.field}: ${input.label}`, before: '—', after: input.value, origin: 'studio', at: now() }]
          : []
        set({ customFields: [...s.customFields, field], facts: { ...s.facts, [id]: fact }, queue: [...s.queue, ...queued] })
        return id
      },
      undoPush: (channel) => {
        const s = get()
        const lp = s.studio.lastPush[channel]
        if (!lp || (channel !== 'airbnb' && channel !== 'booking')) return []
        const prev = s.versions.find((v) => v.id === lp.prevVersionId)
        if (!prev) return []
        const l = s.listings[channel]
        const listing = { ...l, title: prev.title, description: prev.description, photoOrder: prev.photoOrder ?? l.photoOrder, highlightedAmenities: prev.highlightedAmenities ?? l.highlightedAmenities }
        const change: QueuedChange = { id: uid('chg'), channel, fieldId: 'copy.title', label: `Undo · back to v${prev.n}`, before: `v${prev.n + 1}`, after: `v${prev.n}`, origin: 'studio', at: now() }
        const receipt: Receipt = { id: uid('rcp'), channel, changeId: change.id, label: change.label, state: 'live', at: now(),
          reason: channel === 'booking' ? 'Name changes still go through Booking.com review.' : undefined }
        const n = Math.max(...s.versions.filter((v) => v.channel === channel).map((v) => v.n)) + 1
        const v: Version = { id: `v${n}-${channel}`, channel, n, at: now(), by: 'host', note: `Undo · restored v${prev.n}`, title: listing.title, description: listing.description, photoOrder: listing.photoOrder, highlightedAmenities: listing.highlightedAmenities }
        const lastPush = { ...s.studio.lastPush }
        delete lastPush[channel]
        set({ listings: { ...s.listings, [channel]: { ...listing, lastPush: now() } }, receipts: [...s.receipts, receipt], versions: [...s.versions, v], studio: { ...s.studio, lastPush } })
        return [receipt]
      },
      /* ---- S12 ---- */
      setGroupPricing: (groupId, key, value) => set((s) => ({ portfolio: { ...s.portfolio,
        groups: s.portfolio.groups.map((g) => (g.id === groupId ? { ...g, pricing: { ...g.pricing, [key]: value } } : g)) } })),
      setPropertyOverride: (propertyId, key, value) => set((s) => ({ portfolio: { ...s.portfolio,
        overrides: { ...s.portfolio.overrides, [propertyId]: { ...s.portfolio.overrides[propertyId], [key]: value } } } })),
      setChannelFee: (propertyId, channel, value) => set((s) => {
        const cur = { ...s.portfolio.channelFees[propertyId] }
        if (value === null) delete cur[channel]; else cur[channel] = value
        return { portfolio: { ...s.portfolio, channelFees: { ...s.portfolio.channelFees, [propertyId]: cur } } }
      }),
      addRule: (r) => {
        const id = `R-${get().portfolio.rules.length + 1}`
        set((s) => ({ portfolio: { ...s.portfolio, rules: [...s.portfolio.rules, { ...r, id, at: now().slice(0, 10) }] } }))
        return id
      },
      toggleRule: (id) => set((s) => ({ portfolio: { ...s.portfolio, rules: s.portfolio.rules.map((r) => (r.id === id ? { ...r, on: !r.on } : r)) } })),
      logOwner: (e) => set((s) => ({ portfolio: { ...s.portfolio, log: [{ ...e, id: `L-${s.portfolio.log.length + 1}`, at: now() }, ...s.portfolio.log] } })),
      clearPending: (ids, what) => set((s) => {
        const cleared = { ...s.portfolio.cleared }
        for (const id of ids) cleared[id] = { ...cleared[id], [what]: true }
        return { portfolio: { ...s.portfolio, cleared } }
      }),
      markProperties: (ids, mark) => set((s) => {
        const marks = { ...s.portfolio.marks }
        for (const id of ids) marks[id] = [...(marks[id] ?? []).filter((m) => m !== mark), mark]
        return { portfolio: { ...s.portfolio, marks } }
      }),
      setScale200: (on) => set((s) => ({ portfolio: { ...s.portfolio, scale200: on } })),
      jumpAhead: () => {
        const s = get()
        const v0a = s.versions.find((v) => v.id === 'v0-airbnb')!, v0b = s.versions.find((v) => v.id === 'v0-booking')!
        const hist = historyVersions({ airbnb: v0a, booking: v0b }, s.photos)
        const va = hist.find((v) => v.id === 'v3-airbnb')!, vb = hist.find((v) => v.id === 'v2-booking')!
        set({
          history: true,
          versions: [v0a, v0b, ...hist],
          listings: {
            airbnb: { ...s.listings.airbnb, title: va.title, description: va.description, photoOrder: va.photoOrder!, highlightedAmenities: va.highlightedAmenities!, lastPush: va.at },
            booking: { ...s.listings.booking, title: vb.title, photoOrder: vb.photoOrder!, lastPush: vb.at, pageScore: 84 },
          },
          tests: [{ id: 'T-L1', channel: 'airbnb', variants: ['v2-airbnb', 'v3-airbnb'], design: 'switchback', blockDays: 7, minWeeks: 6, minBookingsPerVariant: 20,
            controls: ['Price rules held', 'Similar listings’ demand as the baseline', 'Whole weeks only (same weekdays)'], startedWeek: 9, status: 'running', metric: 'booking-pace' }],
          studio: { ...s.studio, lastPush: {} },
        })
      },
      startTest: (t) => set((s) => ({ tests: [...s.tests.filter((x) => !(x.channel === t.channel && x.status === 'running')), { ...t, id: `T-L${s.tests.length + 1}` }] })),
      stopTest: (id) => set((s) => ({ tests: s.tests.map((t) => (t.id === id ? { ...t, status: 'stopped' } : t)) })),
      setModeOverride: (o) => set((s) => ({ modeOverrides: { ...s.modeOverrides, ...o } })),
      dismissGuide: (id) => set((s) => ({ guideDismissed: [...s.guideDismissed, id] })),
      sl3Setup: (p) => set((s) => ({ sl3: { ...s.sl3, ...p } })),
      sl3Plan: (ch, p) => set((s) => {
        const plans = { ...s.sl3.plans }
        const targets: ListingChannel[] = ch === 'all' ? s.sl3.channels : [ch]
        for (const c of targets) plans[c] = { ...DEFAULT_PLAN, ...plans[c], ...p }
        return { sl3: { ...s.sl3, plans } }
      }),
      sl3Tip: (id, st) => set((s) => { const tips = { ...s.sl3.tips }; if (st) tips[id] = st; else delete tips[id]; return { sl3: { ...s.sl3, tips } } }),
      sl3Kb: (id, on) => set((s) => ({ sl3: { ...s.sl3, kb: { ...s.sl3.kb, [id]: on } } })),
      sl3MoreAlts: (id) => set((s) => ({ sl3: { ...s.sl3, altsShown: { ...s.sl3.altsShown, [id]: (s.sl3.altsShown[id] ?? 0) + 5 } } })),
      sl3Pause: (ch, paused) => set((s) => ({ sl3: { ...s.sl3, paused: { ...s.sl3.paused, [ch]: paused } } })),
      sl3Custom: (ch, key, value) => set((s) => {
        const next = { ...(s.sl3.custom[ch] ?? {}), [key]: value }
        if (value === undefined) delete next[key]
        return { sl3: { ...s.sl3, custom: { ...s.sl3.custom, [ch]: next as Record<string, string | null> } } }
      }),
      sl3Base: (key, value) => set((s) => ({ sl3: { ...s.sl3, base: { ...s.sl3.base, [key]: value } } })),
      sl3SetVersions: (ch, list) => set((s) => ({ sl3: { ...s.sl3, versions: { ...(s.sl3.versions ?? {}), [ch]: list } } })),
      sl3AddVersion: (ch, v) => set((s) => {
        const list = s.sl3.versions?.[ch] ?? []
        return { sl3: { ...s.sl3, versions: { ...(s.sl3.versions ?? {}), [ch]: [...list, { ...v, n: (list[list.length - 1]?.n ?? 0) + 1 }] } } }
      }),
      sl3DropVersion: (ch, n) => set((s) => ({ sl3: { ...s.sl3, versions: { ...(s.sl3.versions ?? {}), [ch]: (s.sl3.versions?.[ch] ?? []).filter((v) => v.n !== n) } } })),
      sl3Rec: (id, st) => set((s) => { const recs = { ...(s.sl3.recs ?? {}) }; if (st) recs[id] = st; else delete recs[id]; return { sl3: { ...s.sl3, recs } } }),
      photoReorder: (scope, keys) => set((s) => commitPhotos(s, reorderLib(s.photoLib, s.sl3, scope, keys))),
      photoEdit: (key, edit) => set((s) => commitPhotos(s, editLib(s.photoLib, s.sl3, key, edit))),
      photoHide: (keys, ch, hide) => set((s) => commitPhotos(s, hideLib(s.photoLib, keys, ch, hide))),
      photoDelete: (keys) => set((s) => commitPhotos(s, deleteLib(s.photoLib, keys))),
      setChannelPolicy: (ch, p) => set((s) => ({ policies: { ...s.policies, [ch]: p } })),
      photoUseBase: (ch, on) => set((s) => commitPhotos(s, { ...s.photoLib, useBase: { ...(s.photoLib.useBase ?? {}), [ch]: on } })),
      // every property back to its seed; PropertyLayout re-activates the property on screen
      reset: () => set(initial(currentUser().persona)), // resets this account only (its saved world, app/account.ts)
      setActiveProperty: (pid) => {
        const s = get()
        if (s.activeProperty === pid) return
        const byProperty = { ...s.byProperty, [s.activeProperty]: pickSlices(s) }
        const next = byProperty[pid] ? revive(byProperty[pid]) : seedProperty(pid, s.persona)
        delete byProperty[pid]
        set({ ...next, activeProperty: pid, byProperty })
      },
    }),
    {
      name: 'hostaway-proto-v1',
      version: 4,
      // v1 → v2 (S10): add `setup`. Older sessions are reset to the seed rather than migrated field by field.
      // v3 → v4 (multi-property): the top-level slices were Neukölln's (plus anything that leaked from other properties):
      // keep them as Neukölln's, start every other property from its seed.
      migrate: (persisted, version) => (version === 3 && persisted && typeof persisted === 'object'
        ? { ...(persisted as object), activeProperty: PROPERTY_ID, byProperty: {} }
        : initial(currentUser().persona)) as unknown as State & Actions,
      storage: createJSONStorage(() => {
        try { return sessionStorage } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} } }
      }),
    },
  ),
)

/* Multi-property: the shared listing definitions (data/property-seeds.ts) follow the active property, synchronously,
 * so the first render after a switch, a reload or a reset already reads that property's imported listing. */
applyPropertyData(useStore.getState().activeProperty)

/* Accounts (D-160): the persona follows the signed-in account. A saved world from before accounts existed (today's
 * prototype, now Dana's) gets Dana's persona; `?persona=` (demoParams) can still override it for one load. */
if (useStore.getState().persona !== currentUser().persona) useStore.getState().setPersona(currentUser().persona)
// D-163: what the newcomer connected decides which channels her property shows (data/portfolio.ts propertyChannels)
setConnectedReader(() => useStore.getState().setup.connected)
useStore.subscribe((s, prev) => { if (s.activeProperty !== prev.activeProperty) applyPropertyData(s.activeProperty) })


/* Autopilot is off by default everywhere (review, 5 Oct): a saved session that still has it on is switched to tips-only
 * once, so its fields are editable. Applies to the active property and every parked one. */
try {
  const KEY = 'hostaway-autopilot-off'
  if (!sessionStorage.getItem(KEY)) {
    const off = (sl3: SL3State): SL3State => ({ ...sl3, plans: Object.fromEntries(Object.entries(sl3.plans).map(([c, pl]) => [c, pl && pl.mode === 'autopilot' ? { ...pl, mode: 'suggest' as const } : pl])) as SL3State['plans'] })
    useStore.setState((s) => ({
      sl3: off(s.sl3),
      byProperty: Object.fromEntries(Object.entries(s.byProperty).map(([k, v]) => [k, v && v.sl3 ? { ...v, sl3: off(v.sl3) } : v])),
    }))
    sessionStorage.setItem(KEY, '1')
  }
} catch { /* storage blocked: nothing to migrate */ }
