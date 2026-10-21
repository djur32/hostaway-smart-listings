/* Data model for the prototype · S09 scaffold (D-128).
 * Mirrors ia/object-model.md (S06a): Fact · Source · Projection · Override · Copy · Photo · Suggestion · Version · Sync state.
 * Direction-neutral on purpose: any G3 pick needs these objects (D-123 "If G3 picks differently").
 * All sample content is (concepts/SCENARIO.md); the footer says so once. */

export type ChannelId = 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'google'

/** IA-R kind sections (ia/recommendation.md §3). */
export type SectionId = 'home' | 'arrival' | 'rules' | 'pricing'

export type Visibility = 'public' | 'guest-only' | 'team-only' | 'hub-only'

export type ConflictPolicy =
  | 'must agree'
  | 'unify by default'
  | 'keep per channel by default'
  | 'always per channel'
  | 'merge (union)'
  | 'hub only'

/** Write reach per channel, from canonical-fields.csv `writable_to_channel`: Y yes · A adapter/partial · F feed · N no ·, not applicable. */
export type Reach = 'Y' | 'A' | 'F' | 'N' | '-'

/** One row of ia/canonical-fields.csv, plus where it lives in IA-R. */
export interface CanonicalField {
  id: string
  label: string
  group: string
  scope: 'property' | 'unit' | 'room' | 'listing'
  type: string
  unit: string
  visibility: Visibility
  /** What each channel calls it (the "one bathtub, four names" row). */
  names: Partial<Record<ChannelId, string>>
  overrideAllowed: string
  reach: Partial<Record<ChannelId, Reach>>
  conflictPolicy: ConflictPolicy
  importPriority: string
  notes: string
  /** IA-R home of the fact (rule 2: one home per fact). */
  section: SectionId
  /** Tab inside the section, e.g. "Amenities & safety". */
  tab: string
}

export type SourceKind =
  | 'airbnb'
  | 'booking'
  | 'vrbo'
  | 'host'
  | 'ai'
  | 'portfolio'
  | 'guidebook'
  | 'team'
  | 'device'

export interface Source {
  kind: SourceKind
  /** ISO date-time. */
  at: string
  /** Human detail: "photo 7", "your Airbnb description", "3 reviews". */
  detail?: string
}

/** Object model §1.18 + S14 states. */
export type SyncState =
  | 'in-sync'
  | 'pending'
  | 'in-review'
  | 'failed'
  | 'drifted'
  | 'channel-managed'
  | 'not-published'

export type FactStatus = 'confirmed' | 'unconfirmed' | 'conflict' | 'gap' | 'only-one'

export interface Observation {
  source: Source
  value: string
}

export interface Override {
  value: string
  reason: 'kept at import' | 'set by host' | 'required by channel' | 'strategy'
  at: string
}

/** A resolved fact about the scenario property (object model §1.8). `value` is display-ready text. */
export interface Fact {
  fieldId: string
  value: string | null
  source: Source
  observations: Observation[]
  overrides: Partial<Record<ChannelId, Override>>
  sync: Partial<Record<ChannelId, SyncState>>
  status: FactStatus
}

export type DecisionGroup = 'setup' | 'money' | 'rules' | 'arrival' | 'photos' | 'copy'

export interface DecisionOption {
  id: string
  label: string
  /** The consequence, in one sentence (C4, I-10). */
  consequence: string
  /** Changes this option would queue, per channel (D-129). Empty = writes nothing. */
  queues?: Array<{ channel: ChannelId; label: string; before: string; after: string; /** Field written, when not the decision's own. */ fieldId?: string }>
}

/** A Needs-you item that asks the host to choose (C4 decision card; object model §1.19 Conflict). */
export interface Decision {
  id: string
  kind: 'merge' | 'conflict' | 'consequence' | 'opt-in' | 'baseline'
  group: DecisionGroup
  fieldId?: string
  title: string
  meta: string
  channels: ChannelId[]
  /** Where the item resolves (IA-R rule 6): a route under /property/:id/… */
  home: string
  options: DecisionOption[]
  recommended?: string
  status: 'open' | 'decided' | 'later'
  choice?: string
  /** "Apply this to future …" (rules from decisions, C4). */
  rule?: boolean
  ruleLabel?: string
}

/** An item that was *not* sent to Needs you: queued, shown, never written (C4 refined, D-123). */
export interface QueuedReview {
  id: string
  label: string
  channels: ChannelId[]
  why: string
}

export interface Suggestion {
  id: string
  channel: ChannelId
  target: 'title' | 'description' | 'photo-order' | 'highlighted-amenities' | 'fact'
  fieldId: string
  current: string
  proposed: string
  why: string
  /** Facts the proposal uses (grounding, D-106). */
  uses: string[]
  confidence: 'High' | 'Medium' | 'Low'
  status: 'proposed' | 'accepted' | 'dismissed' | 'auto-applied' | 'reverted'
  alternatives?: string[]
}

/** An unknown the AI won't assert (h-ask, D-090 / D-106). */
export interface Question {
  id: string
  fieldId: string
  channel?: ChannelId
  question: string
  why: string
  answer?: string
  status: 'open' | 'answered' | 'later'
  /** Suggested quick answers; free text when empty. */
  quick?: string[]
  unit?: string
}

/** One change waiting for Review & push (D-129). */
export interface QueuedChange {
  id: string
  channel: ChannelId
  fieldId: string
  label: string
  before: string
  after: string
  origin: 'reconcile' | 'studio' | 'suggestion' | 'bulk' | 'voice' | 'question'
  /** The Needs-you decision that queued it (re-deciding replaces these). */
  decisionId?: string
  at: string
}

export type ReceiptState = 'live' | 'in-review' | 'rejected' | 'not-supported'

export interface Receipt {
  id: string
  channel: ChannelId
  changeId: string
  label: string
  state: ReceiptState
  reason?: string
  at: string
}

export interface Version {
  id: string
  channel: ChannelId
  n: number
  at: string
  by: 'import' | 'host' | 'autopilot' | 'drift'
  note: string
  title: string
  description: string
  /** Snapshot of the order-type fields, so undo restores them too (S11, additive). */
  photoOrder?: string[]
  highlightedAmenities?: string[]
  /** S12 (additive): who wrote it, in words ("AI draft · Remote work strategy · accepted by you"). */
  author?: string
  /** S12: the strategy the AI wrote under, if any. */
  strategy?: StrategyId
  /** S12: what changed vs the previous version, for the timeline. */
  changed?: string[]
  /** S12: a channel review before it went live (Booking.com names). */
  review?: string
}

export interface Photo {
  id: string
  /** DS photo tone 1–5 (h-photo--n): gradient placeholders, no real people or places. */
  tone: 1 | 2 | 3 | 4 | 5
  room: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'building'
  caption: string
  channels: ChannelId[]
  width: number
  height: number
}

export interface Listing {
  channel: ChannelId
  externalId: string
  status: 'listed' | 'unlisted' | 'snoozed'
  title: string
  description: string
  photoOrder: string[]
  highlightedAmenities: string[]
  /** Booking.com Page Score (Property Scores API), value. */
  pageScore?: number
  lastPush?: string
  /** Booking.com writes its own description (D-032, I-06). */
  descriptionOwnedByChannel?: boolean
}

export interface Comp {
  id: string
  channel: ChannelId
  title: string
  similarity: number
  /** Why similar (R-112): photos, facilities, amenities, conditions, size, location. */
  reasons: string[]
  occupancy: number
  adr: number
  rating: number
  distanceKm: number
}

export interface Property {
  id: string
  name: string
  nickname: string
  area: string
  channels: ChannelId[]
  tone: 1 | 2 | 3 | 4 | 5
  /** Only the scenario property is modelled in depth; the rest are portfolio rows (SCR-05). */
  deep: boolean
  cleaningFee: number
  minStay: number
  checkIn: string
  status: 'in-sync' | 'needs-you' | 'sync-failed'
  needsYou: number
}

export type PersonaId = 'P1' | 'P2' | 'P3' | 'P4'
export type Autonomy = 'suggest' | 'auto-review' | 'autopilot'

/** Import / first-time setup progress (S10, F-A1). Added by S10; additive. */
export interface SetupState {
  /** Channels connected in this demo run, in order. The scenario's data is pre-imported either way. */
  connected: ChannelId[]
  /** Airbnb ↔ Booking.com listing match (D-131). */
  match: 'pending' | 'merged' | 'split'
  /** The first push happened (go-live, D-135). */
  live: boolean
  /** Demo failure/edge state to render (S10 §3; S14 owns the full matrix). null = happy path. */
  demo: string | null
}

/* ---------------- Angle B studio (S11, additive) ---------------- */

/** Listing strategies (R-110): lenses that *propose*, never apply on their own (D-143). */
export type StrategyId = 'family' | 'groups' | 'remote' | 'romantic' | 'fun' | 'creative' | 'pets' | 'business'

/** Studio sections that carry an autonomy level, keyed `${channel}.${section}` in StudioState.autonomy (D-145). */
export type StudioSection = 'title' | 'description' | 'photos' | 'highlights'

export interface StudioState {
  /** The strategy being tried per channel (null = none). */
  strategy: Partial<Record<ChannelId, StrategyId | null>>
  /** Global writing instructions the AI follows on every draft (R-109). */
  instructions: string[]
  /** Autonomy per channel × section, e.g. { 'airbnb.title': 'suggest' }. Facts are never AI-applied (D-126). */
  autonomy: Record<string, Autonomy>
  /** The last push per channel, for one-click undo (D-145). */
  lastPush: Partial<Record<ChannelId, { versionId: string; prevVersionId: string }>>
}

/** A fact the host added that the canonical map doesn't have (R-083). */
export interface CustomFactInput {
  label: string
  value: string
  section: SectionId
  tab: string
  /** Where it goes: a named channel field, or nowhere ("hub only": the assistant and guidebook read it). */
  mapping: { kind: 'hub-only' } | { kind: 'channel'; channel: ChannelId; field: string }
}

/* ---------------- Portfolio, pricing, versions, stats, persona modes (S12, additive) ---------------- */

/** Who sets the nightly price on a channel (D-154). "Pricing not syncing as expected" is mostly this being unclear. */
export type PriceOwner = 'hostaway-dynamic' | 'hostaway-fixed' | 'channel' | 'tool' | 'manual'

/** A pricing strategy: set on a group (portfolio level), inherited by each property, overridable per property (R-115). */
export interface PricingStrategy {
  /** Dynamic Pricing stance. */
  stance: 'balanced' | 'fill' | 'rate'
  dynamic: boolean
  /** Weekend uplift over the base rate, %. */
  weekendPct: number
  min: number
  max: number
  /** Listing markups per channel, % (today's feature: applied before the price is sent). */
  markups: Partial<Record<ChannelId, number>>
  weeklyDiscount: number
  monthlyDiscount: number
  /** Per-channel discount overrides (e.g. Direct Discounts, live trial HS-L). */
  channelDiscounts: Partial<Record<ChannelId, { weekly: number; monthly: number }>>
  cleaningFee: number
  minStay: number
}
export type StrategyKey = keyof PricingStrategy

export interface PortfolioGroup {
  id: string
  name: string
  /** What the group is, in the host's words. */
  note: string
  pricing: PricingStrategy
}

/** Per property, per channel: what the Grid shows. */
export interface ChannelHealth {
  status: 'in-sync' | 'needs-you' | 'failed' | 'drifted' | 'unlisted'
  /** Listing strength: Booking.com Page Score where it exists, our heuristic elsewhere (D-159). */
  strength: number
  lastPushDays: number | null
  drift?: string
  failed?: string
}

export interface PropertyDetail {
  id: string
  groupId: string
  owner: string
  tags: string[]
  base: number
  priceOwner: Partial<Record<ChannelId, PriceOwner>>
  /** Property-level overrides of the group strategy (R-115). */
  overrides: Partial<PricingStrategy>
  /** Channel-level overrides for money that differs per channel (lens rule 3). */
  channelFees?: Partial<Record<ChannelId, number>>
  health: Partial<Record<ChannelId, ChannelHealth>>
  pending: { conflicts: number; suggestions: number; questions: number }
  descriptionAgeMonths: number
  wifiSpeedKnown: boolean
}

/** A portfolio rule (D-153): a sentence that constrains the AI and is checked at push. */
export interface PortfolioRule {
  id: string
  channel: ChannelId | 'all'
  scope: string
  field: 'title' | 'description' | 'photos' | 'highlights' | 'cleaning-fee' | 'min-stay'
  constraint: string
  enforcement: 'hard-stop' | 'warn'
  /** The autonomy this rule unlocks inside its bounds (portfolio-level autonomy, R-116). */
  autonomy: Autonomy
  on: boolean
  by: string
  at: string
  /** Why it can't fully apply, when a channel doesn't take that field (e.g. Booking.com descriptions). */
  caveat?: string
}

/** One entry in the owner audit log (J-12, I-15). */
export interface OwnerLogEntry {
  id: string
  at: string
  who: string
  what: string
  scope: string
  applied: number
  skipped: number
  inReview?: number
  details: Array<{ property: string; result: 'applied' | 'skipped' | 'in review' | 'rejected'; note?: string }>
  rule?: string
}

/** A sequential (switchback) or split test between listing versions (D-157). */
export interface ListingTest {
  id: string
  channel: ChannelId
  variants: string[]
  design: 'switchback' | 'split' | 'across-properties'
  blockDays: number
  minWeeks: number
  minBookingsPerVariant: number
  controls: string[]
  startedWeek: number
  status: 'running' | 'decided' | 'stopped'
  metric: 'booking-pace' | 'conversion'
}

/** How each persona mode changes defaults and guidance, never capability (D-150). */
export interface ModeOverrides {
  hints?: 'more' | 'fewer' | 'none'
  density?: 'comfortable' | 'compact'
  landing?: string
}
