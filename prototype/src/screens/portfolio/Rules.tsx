/* SCR-05 · Properties › Rules · owner S12 · R-116 R-133 · D-153
 * A rule is a sentence with slots. It does three things: the AI drafts inside it, push checks it (hard stop or warning),
 * and it sets the autonomy Hostaway has inside its bounds (portfolio-level autonomy). Where a channel doesn't take the
 * field, the builder says so and offers what does work (Booking.com's description was the example until v3 made it editable). */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUTONOMY_NAME, Button, Explainer, Guide, Icon, Mark, Pill, Toggle } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { Autonomy, ChannelId, PortfolioRule } from '../../data/types'
import { useStore } from '../../store/store'

type Field = PortfolioRule['field']
const FIELD_LABEL: Record<Field, string> = { title: 'titles', description: 'descriptions', photos: 'photos', highlights: 'highlighted amenities', 'cleaning-fee': 'the cleaning fee', 'min-stay': 'the minimum stay' }
interface Con { id: string; text: string; n?: number; pre?: string; post?: string }
const CONSTRAINTS: Record<Field, Con[]> = {
  description: [{ id: 'under', text: '', n: 1000, pre: 'stay under', post: 'characters' }, { id: 'transport', text: 'lead with transport' }, { id: 'no-party', text: 'never mention parties or events' }],
  title: [{ id: 'superlatives', text: 'never use superlatives (“best”, “perfect”)' }, { id: 'area', text: 'name the neighbourhood' }, { id: 'under', text: '', n: 40, pre: 'stay under', post: 'characters' }],
  photos: [{ id: 'cover', text: 'start with the living room' }, { id: 'every-room', text: 'show every room in the first 8' }],
  highlights: [{ id: 'workspace', text: 'lead with the workspace' }],
  'cleaning-fee': [{ id: 'owner', text: 'never change without the owner’s approval' }, { id: 'band', text: '', n: 40, pre: 'stay between €20 and €', post: '' }],
  'min-stay': [{ id: 'floor', text: '', n: 2, pre: 'never go below', post: 'nights' }],
}
const conText = (c: Con, n?: number) => (c.pre !== undefined ? `${c.pre}${c.pre.endsWith('€') ? '' : ' '}${(n ?? c.n ?? 0).toLocaleString('en')}${c.post ? ` ${c.post}` : ''}` : c.text)
const SCOPES = ['All properties', 'Berlin', 'Potsdam & lakes', 'Owner: Weber', 'Owner: Lindqvist', 'Owner: Okafor']
const ruleText = (r: PortfolioRule) => `For ${r.channel === 'all' ? 'all' : CHANNELS[r.channel].name} listings in ${r.scope}, ${FIELD_LABEL[r.field]} must ${r.constraint}.`

function Slot<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: Array<{ id: T; label: string }>; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <select className="h-rule__slot" aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <svg className="h-icon h-rule__caret" aria-hidden="true"><use href="#i-chevron-down" /></svg>
    </span>
  )
}

export function Rules() {
  const s = useStore()
  const [q] = useSearchParams()
  const from = q.get('from')
  const pre: { channel: ChannelId | 'all'; field: Field; scope: string; picked: string[] } =
    from === 'fee' ? { channel: (q.get('channel') as ChannelId) ?? 'booking', field: 'cleaning-fee', scope: 'Berlin', picked: ['band'] }
      : from === 'titles' ? { channel: (q.get('channel') as ChannelId) ?? 'booking', field: 'title', scope: 'All properties', picked: ['superlatives', 'area'] }
        : from === 'strategy' ? { channel: 'airbnb', field: 'description', scope: 'Berlin', picked: ['transport'] }
          : { channel: 'booking', field: 'description', scope: 'Berlin', picked: ['under', 'transport'] } // review's example, verbatim
  const [channel, setChannel] = useState<ChannelId | 'all'>(pre.channel)
  const [scope, setScope] = useState(pre.scope)
  const [field, setField] = useState<Field>(pre.field)
  const [picked, setPicked] = useState<string[]>(pre.picked)
  const [nums, setNums] = useState<Record<string, number>>({})
  const [enforcement, setEnforcement] = useState<PortfolioRule['enforcement']>('hard-stop')
  const [autonomy, setAutonomy] = useState<Autonomy>('auto-review')
  const [saved, setSaved] = useState<string | null>(null)
  const [asked, setAsked] = useState(false)
  // v3 (concepts/smart-listing/V3-SPEC.md): Booking.com's description is editable per channel, fed by the Base, so a rule on
  // it applies like any other (this supersedes D-032's "Booking.com writes its own", QA B19). The explainer below is kept off.
  const bdcDescription = false as boolean
  const cons = CONSTRAINTS[field]
  const text = cons.filter((c) => picked.includes(c.id)).map((c) => conText(c, nums[c.id])).join(' and ')
  const affects = field === 'description' ? (scope === 'Berlin' ? 11 : 12) : 12
  const failToday = field === 'description' && picked.includes('under') ? ['Friedrichshain Studio · 1,240 characters'] : field === 'description' && picked.includes('transport') ? ['Wedding Garden Room · opens with the garden'] : []

  const save = () => {
    const id = s.addRule({ channel, scope, field, constraint: text, enforcement, autonomy, on: true, by: 'You',
      caveat: undefined })
    setSaved(id)
  }

  return (
    <div className="p-grid-2 p-mt4">
      <div>
        <Guide id="rules" title="Rules are how you let Hostaway do more, safely" line="A rule bounds the AI, is checked before every push, and sets how much Hostaway may do inside it.">
          Write the rule once. The AI drafts inside it, a change that breaks it is stopped before it reaches a guest, and inside it you can let Hostaway apply changes without asking each time.
        </Guide>
        <div className="p-label p-mt4">New rule</div>
        <div className="h-rule p-mt2" aria-label="Rule sentence">
          For
          <Slot label="Channel" value={channel} onChange={(v) => { setChannel(v); setSaved(null) }} options={[{ id: 'all', label: 'all' }, ...(['airbnb', 'booking', 'vrbo', 'direct'] as ChannelId[]).map((c) => ({ id: c, label: CHANNELS[c].name }))]} />
          listings in
          <Slot label="Scope" value={scope} onChange={(v) => { setScope(v); setSaved(null) }} options={SCOPES.map((x) => ({ id: x, label: x }))} />
          ,
          <Slot label="Field" value={field} onChange={(v) => { setField(v); setPicked([CONSTRAINTS[v][0].id]); setSaved(null) }} options={(Object.keys(FIELD_LABEL) as Field[]).map((f) => ({ id: f, label: FIELD_LABEL[f] }))} />
          must
          {cons.map((c) => (
            <label key={c.id} className="h-chip" aria-pressed={picked.includes(c.id)} style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={picked.includes(c.id)} style={{ display: 'none' }} onChange={() => setPicked(picked.includes(c.id) ? picked.filter((x) => x !== c.id) : [...picked, c.id])} />
              {c.pre !== undefined && picked.includes(c.id)
                ? <>{c.pre} <input className="h-rule__input" type="number" value={nums[c.id] ?? c.n} onClick={(e) => e.preventDefault()} onChange={(e) => setNums({ ...nums, [c.id]: Number(e.target.value) })} aria-label="Limit" style={{ width: 72 }} /> {c.post}</>
                : conText(c, nums[c.id])}
            </label>
          ))}
        </div>

        {bdcDescription && (
          <div className="p-mt3">
            <Explainer title="Booking.com doesn’t take a description from us" icon="alert-triangle">
              Booking.com writes its own description from your facts, in 25+ languages. A rule on the text can’t reach it. Two things that do:
              <div className="p-row p-mt2">
                <Button size="md" onClick={() => setChannel('all')}>Apply it to Airbnb, Vrbo and Direct instead</Button>
                <Button size="md" kind="ai" icon="sparkles" onClick={() => { setAsked(true); s.logOwner({ who: 'You', what: 'Asked the team for “Nearest transit”', scope: '7 Berlin properties', applied: 7, skipped: 0, details: [{ property: '7 Berlin properties without it', result: 'applied', note: 'Question sent to Jonas (listing coordinator)' }] }) }}>
                  Give Booking.com the transport facts
                </Button>
              </div>
              <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>
                {asked ? <><Icon name="circle-check" size={16} /> Asked your team for the nearest station on the 7 Berlin properties that don’t have it. Booking.com leads with location when it has it.</>
                  : <>“Nearest transit” is set on 4 of 11 Berlin properties. Booking.com uses location facts near the top of what it writes.</>}{/* OQ-081 */}
              </p>
            </Explainer>
          </div>
        )}

        <div className="p-card p-mt3">
          <div className="p-row p-sb">
            <span className="h-small">If a change breaks it:</span>
            <span className="h-lens" role="group" aria-label="Enforcement">
              <button className="h-lens__seg" aria-pressed={enforcement === 'hard-stop'} onClick={() => setEnforcement('hard-stop')}>Hard stop</button>
              <button className="h-lens__seg" aria-pressed={enforcement === 'warn'} onClick={() => setEnforcement('warn')}>Warn</button>
            </span>
          </div>
          <div className="p-row p-sb p-mt3">
            <span className="h-small">Inside this rule, Hostaway may:</span>
            <span className="h-lens" role="group" aria-label="Autonomy inside the rule">
              {(['suggest', 'auto-review', 'autopilot'] as Autonomy[]).map((a) => <button key={a} className="h-lens__seg" aria-pressed={autonomy === a} onClick={() => setAutonomy(a)}>{AUTONOMY_NAME[a]}</button>)}
            </span>
          </div>
          <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>
            {autonomy === 'suggest' ? 'Every change waits for you.' : autonomy === 'auto-review' ? 'Changes that pass the rule push after 24 h unless someone stops them. Everything is logged.' : 'Changes that pass the rule push at once. You get a daily summary.'}
            {' '}Facts, prices and stay rules are never AI-applied, whatever the rule says.{/* D-126 */}
          </p>
        </div>

        <div className="p-row p-sb p-mt3">
          <span className="h-small">
            {bdcDescription ? <span className="p-warn">Wouldn’t apply anywhere as written.</span>
              : <>Affects <b>{affects}</b> {channel === 'all' ? '' : CHANNELS[channel].name} listings{failToday.length > 0 && <> · <b>{failToday.length}</b> would fail today: {failToday.join(', ')}</>}</>}
          </span>
          <Button kind="primary" icon="shield-check" disabled={bdcDescription || !text || !!saved} onClick={save}>{saved ? `Saved as ${saved}` : 'Save rule'}</Button>
        </div>
      </div>

      <div className="p-col">
        <div className="p-label">Your rules · {s.portfolio.rules.length}</div>
        {s.portfolio.rules.map((r) => (
          <div key={r.id} className={`h-rule-row${r.on ? '' : ' is-off'}`} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
            <div>
              <div className="p-row" style={{ gap: 6 }}><b>{r.id}</b>{r.channel !== 'all' && <Mark channel={r.channel} />}<Pill kind={r.enforcement === 'hard-stop' ? 'error' : 'warning'}>{r.enforcement === 'hard-stop' ? 'Hard stop' : 'Warn'}</Pill><Pill kind="ai">{AUTONOMY_NAME[r.autonomy]}</Pill></div>
              <div className="p-mt2">{ruleText(r)}</div>
              {r.caveat && <div className="h-caption h-muted">{r.caveat}</div>}
              <div className="h-caption h-muted">By {r.by} · {r.at} · checked before every push</div>
            </div>
            <Toggle checked={r.on} onChange={() => s.toggleRule(r.id)} label={`Rule ${r.id} on`} />
          </div>
        ))}
      </div>
    </div>
  )
}
