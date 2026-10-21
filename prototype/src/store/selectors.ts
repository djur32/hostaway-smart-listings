/* Derived views of the store. Screens read these instead of re-deriving (keeps S10/S11/S12 consistent). */
import { FIELD } from '../data/canonical'
import type { ChannelId, Decision, DecisionGroup, Fact } from '../data/types'
import { isScenarioProperty, propertyChannels } from '../data/portfolio'
import type { ListingChannel } from '../data/sl3'
import { PROPERTY_SLICES, useStore, type PropertySnapshot, type State } from './store'

/** Needs-you ordering: setup first (merge), then money & stay rules (I-01), arrival, photos, copy. */
const GROUP_ORDER: DecisionGroup[] = ['setup', 'money', 'rules', 'arrival', 'photos', 'copy']
export const GROUP_LABEL: Record<DecisionGroup, string> = {
  setup: 'Setup', money: 'Money', rules: 'Stay rules', arrival: 'Arrival', photos: 'Photos', copy: 'Listing text',
}

/** The Smart Listings opt-in is always the last card (D-127): offered once the facts are settled. */
const rank = (d: Decision) => (d.kind === 'opt-in' ? 99 : GROUP_ORDER.indexOf(d.group))

/** The one Needs-you definition (QA B06). `open` = the first-time-setup decisions not yet decided (incl. "later"):
 *  every count of what needs the host is `open.length`, labelled "N to decide" (Properties list, Grid, Home, the import,
 *  the Overview's "First-time setup" strip). Questions are optional and always counted and labelled apart ("N questions");
 *  `count` (decisions + questions + suggestions) is not shown as a headline number. */
export function needsYou(s: State) {
  const decisions = s.decisions
    .filter((d) => d.kind !== 'opt-in' || d.status !== 'decided')
    .slice()
    .sort((a, b) => rank(a) - rank(b))
  const open = decisions.filter((d) => d.status !== 'decided')
  const questions = s.questions.filter((q) => q.status === 'open')
  const suggestions = s.smartListings ? s.suggestions.filter((g) => g.status === 'proposed') : []
  return { decisions, open, questions, suggestions, count: open.length + questions.length + suggestions.length }
}

export const decisionsByGroup = (ds: Decision[]) =>
  GROUP_ORDER.map((g) => [g, ds.filter((d) => d.group === g && d.kind !== 'opt-in')] as const)
    .concat([['setup', ds.filter((d) => d.kind === 'opt-in')] as const])
    .filter(([, list]) => list.length > 0)

export function queueByChannel(s: State): Partial<Record<ChannelId, number>> {
  const out: Partial<Record<ChannelId, number>> = {}
  for (const q of s.queue) out[q.channel] = (out[q.channel] ?? 0) + 1
  return out
}

/** How a fact reads on one channel: override → projection → "not on this channel" (the lens, IA-R rule 3). */
export function projection(f: Fact, channel: ChannelId): { text: string; kind: 'shared' | 'override' | 'unsupported' | 'channel-owned' } {
  const field = FIELD[f.fieldId]
  if (f.overrides[channel]) return { text: f.overrides[channel]!.value, kind: 'override' }
  if (f.sync[channel] === 'channel-managed') return { text: `Managed on ${channel === 'airbnb' ? 'Airbnb' : 'Booking.com'}`, kind: 'channel-owned' }
  const r = field?.reach[channel]
  if (!r || r === '—' || r === 'N') return { text: 'Not on this channel', kind: 'unsupported' }
  return { text: f.value ?? '—', kind: 'shared' }
}

export const factsList = (s: State, ids: string[]) => ids.map((id) => s.facts[id]).filter(Boolean)

/* ---------- multi-property (QA B01/B02) ---------- */
/** True when the active property is the deep, scripted one (Neukölln): tips, comps, Hub facts, the import story. */
export const useIsScenario = () => useStore((s) => isScenarioProperty(s.activeProperty))
/** The active property's connected listing channels (airbnb → booking → direct). Stable array per property. */
export const useListingChannels = (): ListingChannel[] => propertyChannels(useStore((s) => s.activeProperty))
/** One property's slices: the top level when it is active, else its parked snapshot (undefined = never visited, still the seed). */
export function propertySlices(s: State, pid: string): PropertySnapshot | undefined {
  if (s.activeProperty === pid) return Object.fromEntries(PROPERTY_SLICES.map((k) => [k, s[k]])) as PropertySnapshot
  return s.byProperty[pid]
}

/** The active property's Knowledge Hub state (missing = 'ready'). Set it with the store's `setKb`. */
export const useKbState = () => useStore((s) => s.kb ?? 'ready')
