/* Smart Listings › strategy wizard (full screen) · WS-SL, 3 Oct · replaces Setup (screens/smart/Setup.tsx, deleted).
 * SCR: Smart Listings strategy wizard · R-072 / R-075 (decision record pending: Setup folded into Strategy, full-screen wizard).
 * Antonio, 3 Oct: "Maybe we remove Setup … and then we have everything in Strategy … editing takes you to the full-screen
 * wizard", styled after Hospitable's own Add-property wizard (research/current-state/antonio-2026-10-03-add-property/
 * 01–06, REAL·PRODUCT): top bar with square back / ×, progress line, one question per screen in a centred column,
 * radio cards, Back / Continue in a footer, a generating modal on save. No live preview card (Antonio, 3 Oct: "I don't
 * want to see the preview"). Every step is sized to fit one view at 1440×900 (grids where options are many).
 *
 * URL: /property/:id/smart/wizard?entry=first|add|edit|replace&ch=airbnb&from=overview|strategy|detail
 *   first    Overview's Smart Listings toggle, first use: intro, every connected channel pre-selected
 *   add      Strategy › Add strategy (no ch) or a channel row's Add a strategy (ch pre-selected)
 *   edit     a channel's current answers pre-filled; saving updates the strategy (no versions in the UI — Antonio, 3 Oct)
 *   replace  a fresh strategy for one channel that has one; it takes the current one's place
 * The full spectrum (Antonio: "the same strategy for several channels … different strategies for different channels"):
 * with 2+ channels, one strategy for all, one each, or (3+) some channels share one — two strategies, each channel
 * assigned to one. The answers are a draft in sessionStorage until Save, so a reload keeps them; × asks first. */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button, Marks, NumberField, OvDialog, Pill, Segmented, Wizard, WizardChoice, WizardChoices, WizardFoot, WizardGenerating,
  WizardConfig, WizardConfigItem, WizardIntro, WizardLocked, WizardQuestion, WizardSummary, WizardSummaryGrid, WizardVoiceField,
} from '../../ds'
import { ASKS, AUDIENCES, GOALS, audienceLabel, chName, goalLabel, isListingChannel, type ListingChannel, type Plan } from '../../data/sl3'
import {
  AUDIENCE_LINES, AUDIENCE_MIX, AUDIENCE_MIX_LINE, AUTOPILOT_CHOICES, CHANNEL_LINES, DRAFT_PLAN, GOAL_LINES, PRICE_LINE,
  SCOPE_CHOICES, SIMILAR_RANGE, VOICE_SAMPLE, WIZARD_INTRO, askLine, mixLabel, priceOf, sameMix, useSlLocal, type Mix,
} from '../../data/v3-sl'
import { propertyById, propertyChannels } from '../../data/portfolio'
import { PROPERTY_ID } from '../../data/scenario'
import { useStore } from '../../store/store'
import { currentVersion, hasStrategy, mixOf, saveStrategies, sharedWith, strategyText, useSmartDemo, type StrategyDraft } from './shared'

type Entry = 'first' | 'add' | 'edit' | 'replace'
type Scope = 'same' | 'each' | 'group'
type QKind = 'goal' | 'audience' | 'guardrails' | 'autopilot'
type Step = { kind: 'intro' | 'channels' | 'scope' | 'apply' | 'notes' | 'review' } | { kind: QKind; g: number }
/** `mix` null = the audience's default set-up (AUDIENCE_MIX); `custom` = the host described the guests (`who`). */
interface Answers { plan: Plan; mix: Mix | null; custom?: boolean; who?: string }
interface Draft {
  channels: ListingChannel[]
  scope: Scope
  /** "some share one": which of the two strategies each channel follows */
  assign: Partial<Record<ListingChannel, 0 | 1>>
  /** edit of a shared strategy: change it for every channel sharing it, or only this one */
  applyShared: boolean
  answers: Record<string, Answers>
  brief: string
}
interface Saved { draft: Draft; at: number; seen: number; back: number | null; dirty: boolean }

const Q_KINDS: QKind[] = ['goal', 'audience', 'guardrails', 'autopilot']
const keyOf = (g: ListingChannel[]) => g.join('+')
const names = (cs: ListingChannel[]) => cs.length <= 1 ? cs.map(chName).join('') : `${cs.slice(0, -1).map(chName).join(', ')} and ${chName(cs[cs.length - 1])}`
const readSaved = (k: string): Saved | null => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) as Saved : null } catch { return null } }
const writeSaved = (k: string, v: Saved | null) => { try { if (v) sessionStorage.setItem(k, JSON.stringify(v)); else sessionStorage.removeItem(k) } catch { /* memory only */ } }

export function StrategyWizard() {
  useSmartDemo()
  const { id } = useParams()
  const p = propertyById(id) ?? propertyById(PROPERTY_ID)!
  const [q] = useSearchParams()
  const qc = q.get('ch')
  const ch = isListingChannel(qc ?? undefined) ? (qc as ListingChannel) : null
  const sl3 = useStore((s) => s.sl3)
  const raw = q.get('entry')
  const entry: Entry | null = raw === 'first' || raw === 'add' || raw === 'edit' || raw === 'replace' ? raw : null
  const props = propertyChannels(p.id)
  const base = `/property/${p.id}`
  // a bad or stale link (edit of a channel without a strategy) starts the right flow instead of a broken one
  if (!entry || ((entry === 'edit' || entry === 'replace') && (!ch || !props.includes(ch)))) return <Navigate to={`${base}/smart/wizard?entry=${sl3.setupDone ? 'add' : 'first'}`} replace />
  if (entry === 'edit' && !hasStrategy(sl3, ch!)) return <Navigate to={`${base}/smart/wizard?entry=add&ch=${ch}`} replace />
  return <Flow key={`${p.id}:${entry}:${ch ?? ''}`} pid={p.id} entry={entry} ch={ch} from={q.get('from')} />
}

function Flow({ pid, entry, ch, from }: { pid: string; entry: Entry; ch: ListingChannel | null; from: string | null }) {
  const nav = useNavigate()
  const sl3 = useStore((s) => s.sl3)
  const mixes = useSlLocal((s) => s.mix)
  const props = propertyChannels(pid)
  const base = `/property/${pid}`
  const storeKey = `hospitable-proto:sl-wizard:${pid}:${entry}:${ch ?? ''}`
  const shared = ch ? sharedWith(sl3, ch) : []
  const editing = entry === 'edit'

  /** Where × and the confirmation land. */
  const leaveTo = from === 'overview' ? `${base}/overview`
    : from === 'detail' && ch ? `${base}/smart/strategy/${ch}`
    : `${base}/smart/strategy`

  const initial = (): Saved => {
    const stored = readSaved(storeKey)
    if (stored) return stored
    const channels: ListingChannel[] = ch ? [ch] : entry === 'first' ? props : props.filter((c) => !hasStrategy(sl3, c))
    return {
      draft: { channels, scope: 'each', assign: {}, applyShared: true, answers: {}, brief: editing && ch ? currentVersion(sl3, ch)?.brief ?? '' : '' },
      at: 0, seen: 0, back: null, dirty: false,
    }
  }
  const [st, setSt] = useState<Saved>(initial)
  // which channels had a strategy when the wizard opened (the review's "Replaces…" line must not flip while saving)
  const [had] = useState(() => props.filter((c) => hasStrategy(sl3, c)))
  const { draft, at } = st
  useEffect(() => { writeSaved(storeKey, st) }, [st, storeKey])

  /* ---------- the strategies this run produces ---------- */
  const chans = props.filter((c) => draft.channels.includes(c))
  const groups: ListingChannel[][] = useMemo(() => {
    if (entry === 'edit') return [[ch!, ...(draft.applyShared ? shared : [])]]
    if (entry === 'replace') return [[ch!]]
    if (!chans.length) return []
    if (chans.length === 1 || draft.scope === 'same') return [chans]
    if (draft.scope === 'each') return chans.map((c) => [c])
    return [0, 1].map((i) => chans.filter((c) => (draft.assign[c] ?? 0) === i)).filter((g) => g.length)
  }, [entry, ch, draft.applyShared, shared.join(), chans.join(), draft.scope, JSON.stringify(draft.assign)]) // eslint-disable-line react-hooks/exhaustive-deps

  /** A strategy's answers: the host's, else the channel's current ones (edit), else a suggested default. */
  const answersOf = (g: ListingChannel[]): Answers => {
    const got = draft.answers[keyOf(g)]
    if (got) return got
    if (editing && ch) {
      const mix = mixOf(sl3, ch, mixes)
      // a saved own mix (audience "auto" with its own set-up) reopens as "Someone else"
      const custom = !!mix && sl3.plans[ch]!.audience === 'auto' && !sameMix(mix, AUDIENCE_MIX.auto)
      return { plan: { ...sl3.plans[ch]!, asks: [...sl3.plans[ch]!.asks] }, mix, custom }
    }
    const k = g.length === 1 ? g[0] : 'all'
    return { plan: { ...DRAFT_PLAN, asks: [...DRAFT_PLAN.asks], goal: GOAL_LINES.suggested[k], audience: AUDIENCE_LINES.suggested[k] }, mix: null }
  }

  /* ---------- the sequence ---------- */
  const seq: Step[] = [
    ...(entry === 'first' ? [{ kind: 'intro' } as Step] : []),
    ...(entry === 'first' || entry === 'add' ? [{ kind: 'channels' } as Step] : []),
    ...((entry === 'first' || entry === 'add') && chans.length > 1 ? [{ kind: 'scope' } as Step] : []),
    ...(editing && shared.length ? [{ kind: 'apply' } as Step] : []),
    ...groups.flatMap((_, g) => Q_KINDS.map((kind) => ({ kind, g }) as Step)),
    { kind: 'notes' }, { kind: 'review' },
  ]
  const idx = Math.min(at, seq.length - 1)
  const step = seq[idx]
  const isQ = 'g' in step
  const g: ListingChannel[] = (isQ ? groups[step.g] : undefined) ?? groups[0] ?? []
  const ans = answersOf(g)

  const patch = (d: Partial<Draft>) => setSt((s) => ({ ...s, dirty: true, draft: { ...s.draft, ...d } }))
  const setAns = (a: Partial<Answers>) => setSt((s) => ({ ...s, dirty: true, draft: { ...s.draft, answers: { ...s.draft.answers, [keyOf(g)]: { ...ans, ...a } } } }))
  const setPlan = (pl: Partial<Plan>) => setAns({ plan: { ...ans.plan, ...pl } })
  const go = (i: number, back: number | null = st.back) => setSt((s) => ({ ...s, at: i, seen: Math.max(s.seen, i), back }))

  /* ---------- leaving, saving ---------- */
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [gen, setGen] = useState<number | null>(null) // generating: how many items are done
  const leave = () => { writeSaved(storeKey, null); nav(leaveTo) }
  const close = () => (st.dirty ? setConfirmLeave(true) : leave())
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !confirmLeave && gen === null) close() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const replaced = (entry === 'add' || entry === 'first') ? chans.filter((c) => had.includes(c)) : entry === 'replace' ? [ch!] : []
  const genItems = editing
    ? [`Saving your ${names(groups[0])} strategy`, 'Updating your tips']
    : [...groups.flat().map((c) => `Applying your strategy to ${chName(c)}`), 'Preparing your tips']
  const save = () => {
    const drafts: StrategyDraft[] = groups.map((gr) => {
      const a = answersOf(gr)
      const who = a.custom ? a.who?.trim() : ''
      const line = who ? `Who it’s for: ${who}.` : ''
      // "Someone else" saves as the host's own mix; their description goes into the notes Smart Listings reads
      return { channels: gr, plan: a.plan, mix: a.custom ? a.mix ?? AUDIENCE_MIX.custom : a.mix,
        brief: line && !draft.brief.includes(line) ? [line, draft.brief].filter(Boolean).join('\n') : draft.brief }
    })
    const res = saveStrategies(drafts, 'you', { resume: !editing })
    writeSaved(storeKey, null)
    setGen(0)
    const made = res.map((r) => r.c)
    const text = editing
      ? (res.some((r) => r.created) ? `${names(made)} strategy saved.` : 'No changes to save. The strategy is as it was.')
      : replaced.length ? `Saved. ${names(made)} ${made.length > 1 ? 'follow' : 'follows'} the new ${groups.length > 1 ? 'strategies' : 'strategy'}.`
      : `Saved. Smart Listings now works on ${names(made)}.`
    pendingFlash = text
  }
  // the generating modal steps through its items, then lands on Strategy with a confirmation
  useEffect(() => {
    if (gen === null) return
    const t = setTimeout(() => {
      if (gen < genItems.length) setGen(gen + 1)
      else nav(entry === 'first' || from !== 'detail' ? `${base}/smart/strategy` : leaveTo, { state: { saved: pendingFlash } })
    }, gen < genItems.length ? 650 : 350)
    return () => clearTimeout(t)
  }, [gen]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- per-step content ---------- */
  const multi = groups.length > 1
  const eyebrow = isQ ? <><Marks channels={g} />{names(g)}{multi ? ` · Strategy ${step.g + 1} of ${groups.length}` : ''}</> : null
  const suggestedKey = (gr: ListingChannel[]) => (gr.length === 1 ? gr[0] : 'all') as ListingChannel | 'all'
  const suggested = <Pill kind="ai">Suggested</Pill>
  let title: ReactNode = ''
  let titleIcon: string | undefined
  let sub: ReactNode = null
  let body: ReactNode = null
  let blocked: string | null = null
  let inlineError = false

  if (step.kind === 'intro') {
    title = 'It’s easy to set up a strategy'
    body = <WizardIntro rows={WIZARD_INTRO} />
  } else if (step.kind === 'channels') {
    title = 'Which channels should Smart Listings work on?'
    sub = 'Pick one or more.'
    if (!chans.length) blocked = 'Pick at least one channel'
    const toggle = (c: ListingChannel, v: boolean) => patch({ channels: props.filter((x) => (x === c ? v : draft.channels.includes(x))) })
    body = <WizardChoices label="Channels">{props.map((c) => (
      <WizardChoice key={c} type="checkbox" name="channels" channel={c} title={chName(c)} checked={draft.channels.includes(c)} onChange={(v) => toggle(c, v)}
        desc={had.includes(c) && sl3.plans[c] ? `Now: ${strategyText(sl3.plans[c]!, mixOf(sl3, c, mixes))}` : CHANNEL_LINES[c]}
        tag={had.includes(c) ? <Pill kind="warning">Will replace the current one</Pill> : undefined} />
    ))}</WizardChoices>
  } else if (step.kind === 'scope') {
    title = `Should ${chans.length > 2 ? 'they' : 'both'} share one strategy?`
    sub = 'You can change this later.'
    const groupOk = [0, 1].every((i) => chans.some((c) => (draft.assign[c] ?? 0) === i))
    if (draft.scope === 'group' && !groupOk) blocked = 'Put at least one channel in each strategy'
    body = <WizardChoices label="Scope">
      <WizardChoice name="scope" title={chans.length === 2 ? 'One strategy for both' : SCOPE_CHOICES.same.title} desc={SCOPE_CHOICES.same.line} checked={draft.scope === 'same'} onChange={() => patch({ scope: 'same' })} />
      <WizardChoice name="scope" title={SCOPE_CHOICES.each.title} desc={SCOPE_CHOICES.each.line} checked={draft.scope === 'each'} onChange={() => patch({ scope: 'each' })} tag={<Pill kind="neutral">Default</Pill>} />
      {chans.length > 2 && (
        <WizardChoice name="scope" title={SCOPE_CHOICES.group.title} desc={SCOPE_CHOICES.group.line} checked={draft.scope === 'group'}
          onChange={() => patch({ scope: 'group', assign: Object.keys(draft.assign).length ? draft.assign : Object.fromEntries(chans.map((c, i) => [c, i === chans.length - 1 ? 1 : 0])) })}
          more={chans.map((c) => (
            <span key={c} className="h-wz-row">
              <span className="h-wz-row__label"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}><Marks channels={[c]} />{chName(c)}</span></span>
              <Segmented label={`${chName(c)} follows`} value={String(draft.assign[c] ?? 0)} onChange={(v) => patch({ assign: { ...draft.assign, [c]: Number(v) as 0 | 1 } })}
                items={[{ id: '0', label: 'Strategy 1' }, { id: '1', label: 'Strategy 2' }]} />
            </span>
          ))} />
      )}
    </WizardChoices>
  } else if (step.kind === 'apply') {
    title = 'Change it for which channels?'
    sub = `${chName(ch!)} shares this strategy with ${names(shared)}.`
    body = <WizardChoices label="Apply to">
      <WizardChoice name="apply" title={names([ch!, ...shared])} desc="They keep sharing one strategy." checked={draft.applyShared} onChange={() => patch({ applyShared: true })} />
      <WizardChoice name="apply" title={`Only ${chName(ch!)}`} desc={`${names(shared)} ${shared.length > 1 ? 'keep' : 'keeps'} the current one.`} checked={!draft.applyShared} onChange={() => patch({ applyShared: false })} />
    </WizardChoices>
  } else if (step.kind === 'goal') {
    title = 'What should this strategy aim for?'
    const lines = GOAL_LINES[suggestedKey(g)]
    body = <WizardChoices label="Goal" cols={2}>{GOALS.map((x) => (
      <WizardChoice key={x.id} name="goal" title={x.label} desc={lines[x.id]} checked={ans.plan.goal === x.id} onChange={() => setPlan({ goal: x.id })}
        tag={!editing && GOAL_LINES.suggested[suggestedKey(g)] === x.id ? suggested : undefined} />
    ))}</WizardChoices>
  } else if (step.kind === 'audience') {
    title = 'Who do you want to attract?'
    const lines = AUDIENCE_LINES[suggestedKey(g)]
    // a greyed-out audience (Families: this home sleeps 2) isn't offered at all (Antonio, 3 Oct)
    const offered = AUDIENCES.filter((a) => !a.disabled)
    const sel = ans.custom ? 'custom' : ans.plan.audience
    const def = AUDIENCE_MIX[sel]
    const m = ans.mix ?? def
    const setM = (x: Partial<Mix>) => { const nx = { ...m, ...x }; setAns({ mix: sameMix(nx, def) ? null : nx }) }
    const pick = (id: typeof sel) => setAns({ custom: id === 'custom', mix: null, plan: { ...ans.plan, audience: id === 'custom' ? 'auto' : id } })
    if (sel === 'custom' && !ans.who?.trim()) blocked = 'Describe your guests'
    const selLabel = sel === 'custom' ? 'Your guests' : audienceLabel(sel)
    body = <>
      <WizardChoices label="Audience" cols={2}>
        {offered.map((a) => (
          <WizardChoice key={a.id} name="audience" title={a.label} desc={lines[a.id]}
            checked={sel === a.id} onChange={() => pick(a.id)}
            tag={!editing && AUDIENCE_LINES.suggested[suggestedKey(g)] === a.id ? suggested : undefined} />
        ))}
        <WizardChoice name="audience" title="Someone else" desc="Describe your guests in your own words." checked={sel === 'custom'} onChange={() => pick('custom')} />
      </WizardChoices>
      <WizardConfig key={sel} title={<>{selLabel}: {ans.mix ? 'your set-up' : 'the default set-up'}</>}
        tag={sel === 'auto' && !ans.mix ? <Pill kind="recommended">Recommended</Pill> : undefined}
        onReset={ans.mix ? () => setAns({ mix: null }) : undefined}
        top={<>
          {AUDIENCE_MIX_LINE[sel] && <p className="h-wz-config__line">{AUDIENCE_MIX_LINE[sel]}</p>}
          {sel === 'custom' && (
            <label className="h-wz-config__who">
              <span className="h-wz-config__label">Describe your guests</span>
              <input className="h-input" value={ans.who ?? ''} autoFocus placeholder="For example: musicians in town for a gig, 3–4 nights"
                onChange={(e) => setAns({ who: e.target.value })} />
            </label>
          )}
        </>}>
        <WizardConfigItem label="Price" value={PRICE_POS[m.price]} hint={`Similar homes: ${SIMILAR_RANGE}`} changed={m.price !== def.price}
          control={<Segmented label="Price" value={m.price} onChange={(v) => setM({ price: v })} items={(['below', 'match', 'above'] as const).map((id) => ({ id, label: PRICE_POS[id] }))} />} />
        <WizardConfigItem label="Minimum stay" value={STAY[m.minStay]} changed={m.minStay !== def.minStay}
          control={<Segmented label="Minimum stay" value={m.minStay} onChange={(v) => setM({ minStay: v })} items={(['1', '2', '3'] as const).map((id) => ({ id, label: STAY[id] }))} />} />
        <WizardConfigItem label="Cancellation" value={POLICY[m.policy]} changed={m.policy !== def.policy}
          control={<Segmented label="Cancellation" value={m.policy} onChange={(v) => setM({ policy: v })} items={(['flexible', 'moderate', 'firm'] as const).map((id) => ({ id, label: POLICY[id] }))} />} />
      </WizardConfig>
    </>
  } else if (step.kind === 'guardrails') {
    title = 'Set your guardrails'
    sub = 'Smart Listings never goes outside them.'
    const { priceMin: lo, priceMax: hi } = ans.plan
    const bad = !(lo >= 1) || !(hi >= 1) ? 'Enter both prices' : lo > hi ? 'The lowest price can’t be above the highest' : null
    if (bad) { blocked = bad; inlineError = true }
    const num = (v: string) => (v === '' ? 0 : Math.max(0, Math.round(Number(v)) || 0))
    const locked = ASKS.filter((a) => a.always)
    const setAsk = (aid: string, v: boolean) => setPlan({ asks: v ? [...ans.plan.asks.filter((x) => x !== aid), aid] : ans.plan.asks.filter((x) => x !== aid) })
    body = <>
      <div className="h-wz-group">
        <p className="h-wz-label" id="wz-price">Keep my nightly price between</p>
        <div className="h-wz-range" aria-labelledby="wz-price">
          <NumberField label="Lowest nightly price" unit="€" value={lo ? String(lo) : ''} onChange={(v) => setPlan({ priceMin: num(v) })} invalid={!!bad} describedBy="wz-price-hint" />
          <span className="h-wz-range__dash">–</span>
          <NumberField label="Highest nightly price" unit="€" value={hi ? String(hi) : ''} onChange={(v) => setPlan({ priceMax: num(v) })} invalid={!!bad} describedBy="wz-price-hint" />
        </div>
        {bad ? <p className="h-wz__error" id="wz-price-hint" role="alert">{bad}</p> : <p className="h-wz-hint" id="wz-price-hint">{PRICE_LINE}</p>}
      </div>
      <div className="h-wz-group">
        <p className="h-wz-label">Always ask me first</p>
        <WizardLocked title={locked.map((a) => a.label).join(', ')} line="Always asks you. This can’t be turned off." />
        <WizardChoices label="Always ask me first" cols={2} dense>
          {ASKS.filter((a) => !a.always).map((a) => (
            <WizardChoice key={a.id} type="checkbox" name="asks" title={a.label} desc={askLine(a.id, g.length === 1 ? g[0] : undefined)}
              checked={ans.plan.asks.includes(a.id)} onChange={(v) => setAsk(a.id, v)} />
          ))}
        </WizardChoices>
      </div>
    </>
  } else if (step.kind === 'autopilot') {
    title = 'Should Autopilot apply tips for you?'
    sub = 'You can switch it any time.'
    body = <WizardChoices label="Autopilot">
      <WizardChoice name="mode" title={AUTOPILOT_CHOICES.suggest.title} desc={AUTOPILOT_CHOICES.suggest.line} checked={ans.plan.mode !== 'autopilot'} onChange={() => setPlan({ mode: 'suggest' })} tag={!editing ? <Pill kind="neutral">Default</Pill> : undefined} />
      <WizardChoice name="mode" title={AUTOPILOT_CHOICES.autopilot.title} desc={AUTOPILOT_CHOICES.autopilot.line} checked={ans.plan.mode === 'autopilot'} onChange={() => setPlan({ mode: 'autopilot' })} />
    </WizardChoices>
  } else if (step.kind === 'notes') {
    title = 'Anything the strategy should know?'
    titleIcon = 'sparkles'
    sub = 'Optional. Smart Listings reads this before every tip.'
    body = <WizardVoiceField id="wz-brief" label="Guide Smart Listings" value={draft.brief} onChange={(v) => patch({ brief: v })} voiceSample={VOICE_SAMPLE}
      placeholder="For example: guests love the desk by the window. Don’t promise late check-in." />
  } else {
    title = groups.length > 1 ? 'Review your strategies' : 'Review your strategy'
    sub = replaced.length ? `Replaces the current strategy on ${names(replaced)}.` : null
    const jump = (kind: Step['kind'], gi?: number) => go(seq.findIndex((s) => s.kind === kind && (gi === undefined || ('g' in s && s.g === gi))), idx)
    // 2–3 strategies sit side by side so the whole review fits one view
    body = <WizardSummaryGrid count={groups.length}>
      {groups.map((gr, gi) => {
        const a = answersOf(gr)
        return <WizardSummary key={keyOf(gr)} channels={gr} title={<>{names(gr)}{gr.length > 1 && <Pill kind="neutral">Shared</Pill>}</>} rows={[
          { label: 'Goal', value: goalLabel(a.plan.goal), onEdit: () => jump('goal', gi) },
          { label: 'Who it’s for', value: whoOf(a), onEdit: () => jump('audience', gi) },
          { label: 'Price range', value: `${priceOf(a.plan)} a night`, onEdit: () => jump('guardrails', gi) },
          { label: 'Always asks first', value: askNames(a.plan), onEdit: () => jump('guardrails', gi) },
          { label: 'Autopilot', value: a.plan.mode === 'autopilot' ? 'On · inside your guardrails' : 'Off · tips wait for you', onEdit: () => jump('autopilot', gi) },
        ]} />
      })}
      <WizardSummary channels={[]} title="Notes for the strategy" rows={[
        { label: 'What it should know', value: draft.brief.trim() || <span style={{ color: 'var(--color-text-faint)' }}>Nothing added</span>, onEdit: () => jump('notes') },
      ]} />
 
    </WizardSummaryGrid>
  }

  /* ---------- footer ---------- */
  const last = idx === seq.length - 1
  const returning = st.back !== null && !last
  const next = () => {
    if (blocked) return
    if (last) return save()
    if (returning) return go(st.back!, null)
    go(idx + 1)
  }
  const back = () => (idx === 0 ? close() : go(idx - 1, null))
  const nextLabel = last ? (groups.length > 1 ? 'Save strategies' : 'Save strategy') : returning ? 'Back to review' : 'Continue'

  // no side preview card (Antonio, 3 Oct: the channel-logo card with Goal / For / Price / Autopilot dashes "doesn't
  // make sense") — the answers show on the Review step instead.
  const wizardTitle = entry === 'edit' ? `Edit ${names(groups[0])} strategy` : entry === 'replace' ? `Replace ${chName(ch!)} strategy` : 'Set up a strategy'
  return (
    <Wizard title={wizardTitle} progress={(idx + 1) / seq.length} onBack={back} onClose={close}
      foot={<WizardFoot onBack={back} onNext={next} nextLabel={nextLabel} nextDisabled={!!blocked} hint={inlineError ? undefined : blocked} />}
      overlay={<>
        {gen !== null && <WizardGenerating label="Saving your strategy" items={genItems.map((label, i) => ({ label, state: i < gen ? 'done' : i === gen ? 'active' : 'pending' }))} />}
        {confirmLeave && (
          <OvDialog title={editing ? 'Discard your changes?' : 'Discard this strategy?'} onClose={() => setConfirmLeave(false)}
            foot={<><Button onClick={() => setConfirmLeave(false)}>Keep editing</Button><Button kind="primary" onClick={leave}>Discard</Button></>}>
            <p className="sl-dialog-lines">{editing ? 'Your answers are lost. The current strategy stays as it is.' : 'Your answers are lost. Nothing changes on your listings.'}</p>
          </OvDialog>
        )}
      </>}>
      <WizardQuestion eyebrow={eyebrow} title={title} titleIcon={titleIcon} sub={sub}>{body}</WizardQuestion>
    </Wizard>
  )

}

/** Handed from save() to the landing page (module scope: survives the generating modal's re-renders). */
let pendingFlash = ''

/** Audience step: short value labels (the similar-homes range is said once, on the price block). */
const PRICE_POS: Record<Mix['price'], string> = { below: 'Below', match: 'In line', above: 'Above' }
const STAY: Record<Mix['minStay'], string> = { 1: '1 night', 2: '2 nights', 3: '3+ nights' }
const POLICY: Record<Mix['policy'], string> = { flexible: 'Flexible', moderate: 'Moderate', firm: 'Firm' }
const whoOf = (a: Answers) => {
  if (a.custom) return `${a.who?.trim() || 'Your own guests'} · ${mixLabel(a.mix ?? AUDIENCE_MIX.custom)}`
  return a.mix ? `${audienceLabel(a.plan.audience)} · ${mixLabel(a.mix)}` : `${audienceLabel(a.plan.audience)} · ${mixLabel(AUDIENCE_MIX[a.plan.audience])}`
}

const askNames = (pl: Plan) => ASKS.filter((a) => pl.asks.includes(a.id)).map((a) => a.label).join(', ')

/** Old /smart/setup/* links (rail, Performance, ChannelOverview, the mobile index) land in the wizard; ?ch=&edit=1 = Edit. */
export function SetupRedirect() {
  const { id } = useParams()
  const [q] = useSearchParams()
  const sl3 = useStore((s) => s.sl3)
  const ch = q.get('ch')
  const keep = new URLSearchParams(q); keep.delete('ch'); keep.delete('edit'); keep.delete('mix'); keep.delete('mode')
  const rest = keep.toString() ? `&${keep.toString()}` : ''
  const target = q.get('edit') === '1' && isListingChannel(ch ?? undefined) ? `edit&ch=${ch}&from=strategy`
    : sl3.setupDone && Object.keys(sl3.plans).length ? 'add&from=strategy' : 'first&from=overview'
  return <Navigate to={`/property/${id}/smart/wizard?entry=${target}${rest}`} replace />
}
