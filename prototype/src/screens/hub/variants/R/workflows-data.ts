/* KH-R · Workflows data (concepts/knowledge-hub/R-BRIEF.md, "Agent 2 — R-workflows"). SIMULATED: the three seed
 * workflows below are plausible content for Neukölln (refs 04–06), not real host data. Every other property starts
 * with the template gallery only (no saved workflows) until the host creates one.
 * Step text carries chip tokens (`%guest_name%`, `%action:message%`…), the same `%shortcode%` convention as the rest
 * of the prototype (ds/fieldscope.tsx withShortcodes): plain text while editing, styled chips in read views and in
 * the host-facing simulate output they resolve to real words. No "answer as {channel}" anywhere in this file. */
import { isScenarioProperty } from '../../../../data/portfolio'

/* ---------- keyword matching (same bag-of-words idea as KH-C's ask box, C.tsx `match()`) ---------- */
const STOP = new Set('a an the is are there i we my our me you your can could do does to of in on for at it and or be any what where when how which who will would with from get have has this that please'.split(' '))
export const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).map((w) => w.replace(/s$/, '')).filter((w) => w.length > 1 && !STOP.has(w))
/** Overlap of `text`'s words with `bag` (0–1): how much of what was typed shows up in the bag of words. */
export function scoreAgainst(text: string, bag: string): number {
  const ask = words(text)
  if (!ask.length) return 0
  const b = new Set(words(bag))
  return ask.filter((w) => b.has(w)).length / ask.length
}
/** The best-matching item in `items` for `text` ('' bag never matches), or undefined below the threshold. */
export function bestMatch<T>(text: string, items: T[], bagOf: (item: T) => string, threshold = 0.34, tiebreak?: (item: T) => number): { item: T; score: number } | undefined {
  let best: T | undefined; let score = 0
  for (const it of items) {
    const s = scoreAgainst(text, bagOf(it))
    if (s > score || (s === score && s > 0 && best && tiebreak && tiebreak(it) > tiebreak(best))) { best = it; score = s }
  }
  return best && score >= threshold ? { item: best, score } : undefined
}

/* ---------- chips: reservation data + the three actions a step can take ---------- */
export type ActionKind = 'message' | 'task' | 'handoff'
/** A simulated step's own kind: one of the three actions, or 'note' when the step is an internal check with no action
 *  chip (e.g. "Check whether another guest checks out that morning") — not something the guest sees. */
export type StepKind = ActionKind | 'note'
export interface ChipDef { token: string; label: string; icon: string; kind: 'data' | 'action' }
export const DATA_CHIPS: ChipDef[] = [
  { token: 'guest_name', label: 'Guest name', icon: 'user', kind: 'data' },
  { token: 'checkin_date', label: 'Check-in date', icon: 'calendar', kind: 'data' },
  { token: 'checkout_date', label: 'Checkout date', icon: 'calendar-event', kind: 'data' },
  { token: 'channel', label: 'Channel', icon: 'world', kind: 'data' },
  { token: 'property_name', label: 'Property name', icon: 'home', kind: 'data' },
]
export const ACTION_LABEL: Record<ActionKind, string> = { message: 'Send a message', task: 'Create a task', handoff: 'Hand off to host' }
export const ACTION_ICON: Record<ActionKind, string> = { message: 'send', task: 'square-check', handoff: 'user' }
export const ACTION_CHIPS: ChipDef[] = (['message', 'task', 'handoff'] as ActionKind[]).map((k) => ({ token: `action:${k}`, label: ACTION_LABEL[k], icon: ACTION_ICON[k], kind: 'action' }))
export const ALL_CHIPS: ChipDef[] = [...DATA_CHIPS, ...ACTION_CHIPS]
export const CHIP_RE = /%([a-z_:]+)%/g
export const chipToken = (t: string) => `%${t}%`
const ACTION_TOKENS: Record<string, ActionKind> = { 'action:message': 'message', 'action:task': 'task', 'action:handoff': 'handoff' }

/** A step's text with chips resolved to real words (data → sample values, action → its label, lower-cased mid-sentence)
 *  and the step's kind: the action chip it carries, or 'note' when it's an internal check with none. */
export function resolveStepText(text: string, data: Record<string, string>): { text: string; action: StepKind } {
  let action: StepKind = 'note'
  const out = text.replace(CHIP_RE, (m, token: string, offset: number) => {
    if (token in ACTION_TOKENS) {
      action = ACTION_TOKENS[token]
      const label = ACTION_LABEL[action]
      return offset === 0 ? label : label.charAt(0).toLowerCase() + label.slice(1)
    }
    return data[token] ?? m
  }).replace(/\s{2,}/g, ' ').trim()
  return { text: out, action }
}

/* ---------- a sample reservation (SIMULATED: invented for the Test panel, not a real guest) ---------- */
export const SAMPLE_GUEST: Record<string, string> = { guest_name: 'Priya Shah', checkin_date: 'Fri, 10 Oct', checkout_date: 'Mon, 13 Oct' }

/* ---------- workflows ---------- */
export interface WfStep { id: string; text: string }
export interface Workflow { id: string; title: string; icon: string; trigger: string; steps: WfStep[] }
export interface WfTemplate { id: string; title: string; icon: string; category: string; desc: string; trigger: string; steps: string[] }

const sid = (i: number) => `s${i}`
const newId = () => `wf-${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8)}`

export const WORKFLOW_TEMPLATES: WfTemplate[] = [
  { id: 't-early', title: 'Early check-in', icon: 'clock', category: 'Arrival', desc: 'When a guest asks to check in, or drop bags, before the standard time.',
    trigger: 'Guests ask to check in early or drop bags before the standard check-in time.',
    steps: [
      'Check whether another guest checks out the morning %guest_name% arrives (%checkin_date%). Early check-in only works when nobody leaves that day.',
      '%action:message% %guest_name% to confirm, or offer somewhere bags can wait until the standard time.',
      '%action:task% for housekeeping to finish the room earlier, when it is possible.',
    ] },
  { id: 't-late', title: 'Late checkout', icon: 'clock', category: 'Departure', desc: 'When a guest asks to stay past the standard checkout time.',
    trigger: 'Guests ask to check out later than the standard checkout time.',
    steps: [
      'Check whether the next guest arrives on %checkout_date%. Late checkout only works when the room isn’t needed that day.',
      '%action:message% %guest_name% to confirm, or suggest a luggage-storage option nearby.',
      '%action:task% for housekeeping to shift the clean later.',
    ] },
  { id: 't-broken', title: 'Something is broken', icon: 'alert-triangle', category: 'Maintenance', desc: 'When a guest reports something broken, damaged or not working.',
    trigger: 'Guests report something broken, damaged or not working in the flat.',
    steps: [
      'Ask %guest_name% what’s broken, and for a photo if they can send one.',
      '%action:task% for a repair, tagged to this property.',
      '%action:message% confirming someone will look into it, usually the same day.',
    ] },
  { id: 't-lostkey', title: 'Lost key', icon: 'lock', category: 'Access', desc: 'When a guest says they’re locked out or lost the door code.',
    trigger: 'Guests say they’re locked out, lost the door code, or the keypad isn’t working.',
    steps: [
      'Ask %guest_name% whether they’re locked out, or the code itself isn’t working.',
      '%action:message% with the door code again.',
      'If %guest_name% is still locked out, %action:handoff% immediately. This can’t wait.',
    ] },
  { id: 't-extra', title: 'Extra guest', icon: 'users', category: 'Booking', desc: 'When a guest asks to add someone beyond the number booked.',
    trigger: 'Guests ask to add a guest beyond the number on the booking.',
    steps: [
      'Check the listing’s maximum guest count against %guest_name%’s booking.',
      '%action:message% %guest_name% confirming whether it’s possible, and any extra-guest fee.',
      '%action:task% to update the reservation’s guest count once confirmed.',
    ] },
  { id: 't-pet', title: 'Pet request', icon: 'paw', category: 'Rules', desc: 'When a guest asks to bring a pet that wasn’t on the original booking.',
    trigger: 'Guests ask to bring a pet that wasn’t on the original booking.',
    steps: [
      'Check whether pets are allowed on %channel% for this listing.',
      '%action:message% %guest_name% confirming the pet policy and any pet fee.',
      'If the request needs a judgement call (breed, number of pets), %action:handoff%.',
    ] },
]

/** Neukölln's three seeded, filled-in workflows (refs 04–06, SIMULATED content); every other property starts empty. */
export function seedWorkflowsFor(pid: string): Workflow[] {
  if (!isScenarioProperty(pid)) return []
  const from = (id: string, icon: string, title: string, trigger: string, steps: string[]): Workflow => ({ id, icon, title, trigger, steps: steps.map((text, i) => ({ id: `${id}-${sid(i)}`, text })) })
  return [
    from('wf-early', 'clock', 'Early check-in', 'Guests ask to check in early or drop bags before 3:00 PM.', [
      'Check whether another guest checks out the morning %guest_name% arrives (%checkin_date%). Early check-in only works when nobody leaves that day.',
      '%action:message% %guest_name% to confirm, or that bags can wait at the Weserstraße bakery next door from 9:00.',
      '%action:task% for housekeeping to finish the room before the earlier time, when it’s possible.',
      'If it isn’t possible this time, %action:handoff% to offer %guest_name% an alternative.',
    ]),
    from('wf-lostkey', 'lock', 'Lost key', 'Guests say they’re locked out, lost the door code, or the keypad isn’t working.', [
      'Ask %guest_name% whether they’re locked out, or the code itself isn’t working.',
      '%action:message% with the door code again. It’s keypad entry, so there’s no physical key to lose.',
      'If %guest_name% is still locked out, %action:handoff% immediately; this can’t wait.',
    ]),
    from('wf-broken', 'alert-triangle', 'Something is broken', 'Guests report something broken, damaged or not working in the flat.', [
      'Ask %guest_name% what’s broken, and for a photo if they can send one.',
      '%action:task% for a repair, tagged to this property.',
      '%action:message% confirming someone will look into it, usually the same day.',
      'If it affects safety, or %guest_name% can’t use the flat as booked, %action:handoff% right away.',
    ]),
  ]
}

export function templateToWorkflow(tpl: WfTemplate): Workflow {
  return { id: newId(), icon: tpl.icon, title: tpl.title, trigger: tpl.trigger, steps: tpl.steps.map((text, i) => ({ id: sid(i), text })) }
}
export function blankWorkflow(): Workflow {
  return { id: newId(), icon: 'sparkles', title: 'Untitled workflow', trigger: '', steps: [{ id: sid(0), text: '' }] }
}
/** The property's workflows: Neukölln's seeded three (host edits override by id), plus any the host created, in order. */
export function workflowList(pid: string, items: Record<string, Workflow>): Workflow[] {
  const seeds = seedWorkflowsFor(pid)
  const seedIds = new Set(seeds.map((s) => s.id))
  const merged = seeds.map((s) => items[s.id] ?? s)
  const customs = Object.keys(items).filter((id) => !seedIds.has(id)).map((id) => items[id])
  return [...merged, ...customs]
}

/* ---------- simulate: canned, keyword-matched (brief: "doesn't need real AI; the point is the UI pattern") ---------- */
export interface SimStep { action: StepKind; text: string }
export interface SimResult { matched: boolean; steps: SimStep[] }
const URGENT = new Set(['now', 'urgent', 'asap', 'immediately', 'emergency', 'right away'])
/** Runs `wf`'s own steps against a simulated opening message: resolves every step's chips with `data`, and notes
 *  (but doesn't block on) whether the message actually sounds like what the workflow is meant to catch. */
export function simulateWorkflow(wf: Workflow, message: string, data: Record<string, string>): SimResult {
  const relevance = scoreAgainst(message, `${wf.title} ${wf.trigger}`)
  const urgent = words(message).some((w) => URGENT.has(w))
  const steps = wf.steps.filter((s) => s.text.trim()).map((s) => resolveStepText(s.text, data))
  if (urgent && steps.length) steps[0] = { ...steps[0], text: `${steps[0].text} (flagged urgent: run this first)` }
  return { matched: relevance >= 0.15 || !message.trim(), steps }
}
