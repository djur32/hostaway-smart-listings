/* Knowledge Hub iteration R · the Add-fact flow (R-BRIEF.md "Adding a fact — the flow"; restructured round 3,
 * KH-NEXT-3.md, review: "The text of the type is really massive when you add a fact — simplify. Maybe describe
 * loosely and use AI to refine it: 'I have AC', and it transforms that into an actual fact with the other elements
 * filled in"). The host's own "+ Add a fact" now opens on one plain text box ("Describe the fact"); "Continue" runs a
 * simulated AI pass (`guessFact` below — canned keyword rules, not a real model, the same convention as
 * workflows-data.ts's `bestMatch`/`simulateWorkflow`) that structures it into a type, label, value, category and
 * source, then hands the host the same Category → Type → Value → Applies to → Guest-visible/internal controls as
 * before to confirm or adjust — a confirmation step now, not the first thing the host sees. Editing a previously added
 * fact skips straight to that confirm step (there's no loose description to re-derive it from). A gap's inline "Add a
 * fact" ("Add the answer") is unaffected: it was already a single text box tied to one specific question, which is
 * the simplification this round asks for — it resolves through C's `useKhc` as before (model.ts), not through this
 * flow's new AI step.
 *
 * Round 4 (review, voice 3 Oct): two ways in on the first step — describe the fact (type it, or "Use voice", a
 * simulated dictation that fills the box with a canned sentence for the topic after ~1.5 s), or "I prefer to fill in
 * the form instead", which skips to the blank form. "Continue" still structures the description into the full,
 * prefilled form. The Type picker is a plain DS Dropdown now (the icon tiles were "really, really big"), and so is
 * "Applies to" (was radio cards). Not a recommendation, so no sparkles / AI-purple anywhere in this flow. Classes
 * new to this round are `.h-khaf-*` in ds/v3/kh-addfact.css. */
import { useEffect, useId, useRef, useState } from 'react'
import {
  Button, DetailsDrawer, Dropdown, NumberField, ChipGroup, Toggle, Icon, MapBox, cx,
} from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { NAME, useListingChannels } from '../../perProperty'
import type { Gap } from '../C/data'
import {
  R_FACT_KINDS, R_FACT_SOURCES, R_TIME_OPTIONS, R_TOPICS, decodeContact, decodeNumber, encodeContact, encodeNumber, kindOf, topicLabel,
  type RFactKind, type RTopicId,
} from './data'
import type { RFact, RFactInput, RScope } from './model'
import { bestMatch } from './workflows-data'

export interface AddFactPrefill {
  topic: RTopicId
  /** Locked when opened from inside a topic (R-BRIEF.md: a dropdown only when opened from the Overview level). */
  lockTopic?: boolean
  /** Opened from a gap's "Add a fact": fixed to the Text type, starts from the gap's own drafted answer. */
  gap?: Gap
  /** Opened to edit a previously added fact. */
  editing?: RFact
}

const emptyScope: RScope = { type: 'all' }

/* ---------- the simulated "AI" pass: a loose description → a guessed type, label and value (canned keyword rules,
 * deterministic, not a real model — see the file header). Each kind only fills the field(s) it owns; the host can
 * always switch the type on the confirm step, which blanks back to that kind's own (empty) fields, same as before. ---------- */
function guessKind(text: string): RFactKind {
  const t = text.toLowerCase()
  if (/https?:\/\/|www\./.test(t)) return 'link'
  if (/@/.test(text) && /\d{3,}|phone|call|contact/.test(t)) return 'contact'
  if (/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/.test(t)) return 'time'
  if (/^\s*(yes|no)\b/.test(t) || /\b(is there|do you have|does it have|is it)\b.*\?/.test(t)) return 'yesno'
  if (text.trim().split('\n').filter((l) => l.trim()).length > 1) return 'steps'
  if (/\b(street|st\.|road|rd\.|avenue|ave\.|square|platz|strasse|straße)\b/i.test(t)) return 'place'
  if (/\d+(\.\d+)?\s?(€|eur|minutes?|mins?|hours?|hrs?|nights?|days?|guests?|people|km|m\b|%)/.test(t)) return 'number'
  return 'text'
}
function guessLabel(text: string): string {
  let t = text.trim().replace(/^(i have|we have|there is|there's|we've got|i've got|it's|its)\s+/i, '')
  t = t.replace(/[.!?]+$/, '')
  if (t.length > 48) t = `${t.slice(0, 45)}…`
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'New fact'
}
function guessTopic(text: string, fallback: RTopicId): RTopicId {
  return bestMatch(text, R_TOPICS, (t) => `${t.label} ${t.desc}`, 0.1)?.item.id ?? fallback
}

/** What the simulated dictation "hears", per topic — sample host speech, not real data. */
const VOICE_SAMPLES: Record<RTopicId, string> = {
  amenities: 'We have a dishwasher, the tablets are under the kitchen sink.',
  arrival: 'Check-in is from 3 pm, the key box is to the left of the front door.',
  cleaning: 'If something breaks, message us and our cleaner Ana can usually come the same day.',
  contact: 'For anything urgent call Jörg, the building manager, on +49 30 1234 5678.',
  departure: 'Check-out is at 11 am, just leave the keys on the kitchen table.',
  rules: 'No parties, and please keep it quiet after 10 pm, the neighbours have small kids.',
  transport: 'The nearest U-Bahn station is a five minute walk, turn left out of the building.',
  trash: 'The bins are in the courtyard, paper goes in the blue one and plastic in the yellow one.',
  wifi: 'The wifi name and password are on the card stuck to the fridge.',
}

export function AddFact({ prefill, onAdd, onResolveGap, onClose }: {
  prefill: AddFactPrefill
  onAdd: (f: RFactInput) => void
  onResolveGap?: (text: string, scope: RScope) => void
  onClose: () => void
}) {
  const chs = useListingChannels()
  const { gap, editing } = prefill
  // the gap flow is a single screen, unaffected by the describe/confirm split below (see file header)
  const [step, setStep] = useState<'describe' | 'confirm'>(gap || editing ? 'confirm' : 'describe')
  const [desc, setDesc] = useState('')
  const [topic, setTopic] = useState<RTopicId>(prefill.topic)
  const [kind, setKind] = useState<RFactKind>(gap ? 'text' : editing?.kind ?? 'text')
  const [label, setLabel] = useState(gap ? gap.fact : editing?.label ?? '')
  const [scope, setScope] = useState<RScope>(editing?.scope ?? emptyScope)
  const [visibility, setVisibility] = useState<'guest' | 'internal'>(editing?.visibility ?? 'guest')
  const [source, setSource] = useState<string>(editing?.source ?? R_FACT_SOURCES[0])

  // one field per kind, so switching the type never loses the others
  const [yn, setYn] = useState(editing?.kind === 'yesno' ? editing.value === 'yes' : true)
  const [text, setText] = useState(gap ? gap.draft : editing?.kind === 'text' ? editing.value : '')
  const num0 = editing?.kind === 'number' ? decodeNumber(editing.value) : { n: '', unit: '' }
  const [numN, setNumN] = useState(num0.n)
  const [numUnit, setNumUnit] = useState(num0.unit)
  const [time, setTime] = useState(editing?.kind === 'time' ? editing.value : R_TIME_OPTIONS[0])
  const [steps, setSteps] = useState(editing?.kind === 'steps' ? editing.value : '')
  const c0 = editing?.kind === 'contact' ? decodeContact(editing.value) : { name: '', phone: '', email: '' }
  const [cName, setCName] = useState(c0.name)
  const [cPhone, setCPhone] = useState(c0.phone)
  const [cEmail, setCEmail] = useState(c0.email)
  const [place, setPlace] = useState(editing?.kind === 'place' ? editing.value : '')
  const [link, setLink] = useState(editing?.kind === 'link' ? editing.value : '')

  /* Simulated voice input (no real speech recognition): "Use voice" → "Listening…" for ~1.5 s → a plausible sentence
   * for the current topic lands in the box. Pressing again while listening stops it without filling anything. */
  const descId = useId()
  const [listening, setListening] = useState(false)
  const voiceTimer = useRef<number | undefined>(undefined)
  const stopVoice = () => { window.clearTimeout(voiceTimer.current); setListening(false) }
  const toggleVoice = () => {
    if (listening) { stopVoice(); return }
    setListening(true)
    voiceTimer.current = window.setTimeout(() => {
      const said = VOICE_SAMPLES[topic]
      setDesc((d) => (d.trim() ? `${d.trim()} ${said}` : said))
      setListening(false)
    }, 1500)
  }
  useEffect(() => () => window.clearTimeout(voiceTimer.current), [])

  /** "Continue": the simulated AI pass — guesses a type, label (and category, when it isn't locked) from the loose
   *  description, fills that kind's own value field as best it can, and moves to the confirm step. */
  const runAi = () => {
    const d = desc.trim()
    if (!d) return
    const k = guessKind(d)
    setKind(k)
    setLabel(guessLabel(d))
    if (!prefill.lockTopic) setTopic(guessTopic(d, topic))
    switch (k) {
      case 'yesno': setYn(!/^\s*no\b/i.test(d)); break
      case 'text': setText(d); break
      case 'number': { const m = d.match(/(\d+(?:\.\d+)?)\s*([€%a-zA-Z]+)?/); setNumN(m?.[1] ?? ''); setNumUnit(m?.[2] ?? ''); break }
      case 'time': {
        // "11 am" / "3pm" / "10:30 pm" → the matching "11:00 AM"-style option
        const m = d.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/i)
        const norm = m ? `${Number(m[1])}:${m[2] ?? '00'} ${m[3].toUpperCase()}` : ''
        const hit = R_TIME_OPTIONS.find((o) => o === norm || d.toLowerCase().includes(o.toLowerCase()))
        setTime(hit ?? R_TIME_OPTIONS[0]); break
      }
      case 'steps': setSteps(d.split('\n').map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean).join('\n')); break
      case 'contact': {
        const email = d.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? ''
        const phone = d.match(/\+?\d[\d \-()]{6,}\d/)?.[0] ?? ''
        setCName(d.replace(email, '').replace(phone, '').trim() || guessLabel(d))
        setCPhone(phone); setCEmail(email)
        break
      }
      case 'place': setPlace(d); break
      case 'link': { const url = d.match(/https?:\/\/\S+|www\.\S+/)?.[0] ?? ''; setLink(url); break }
    }
    setStep('confirm')
  }

  const valueOf = (): string => {
    switch (kind) {
      case 'yesno': return yn ? 'yes' : 'no'
      case 'text': return text
      case 'number': return encodeNumber(numN, numUnit)
      case 'time': return time
      case 'steps': return steps
      case 'contact': return encodeContact({ name: cName, phone: cPhone, email: cEmail })
      case 'place': return place
      case 'link': return link
    }
  }
  const valid = gap ? text.trim().length > 0 : (() => {
    if (!label.trim()) return false
    switch (kind) {
      case 'yesno': return true
      case 'text': return text.trim().length > 0
      case 'number': return numN.trim().length > 0
      case 'time': return !!time
      case 'steps': return steps.split('\n').some((s) => s.trim())
      case 'contact': return cName.trim().length > 0
      case 'place': return place.trim().length > 0
      case 'link': return link.trim().length > 0
    }
  })()

  const submit = () => {
    if (!valid) return
    if (gap) { onResolveGap?.(text.trim(), scope); onClose(); return }
    onAdd({ topic, kind, label: label.trim(), value: valueOf(), scope, visibility, source })
    onClose()
  }

  /** "I prefer to fill in the form instead": the second way in — straight to the blank form, no description. */
  const skipToForm = () => {
    stopVoice(); setDesc('')
    // blank, even after a Back from an earlier "Continue" that prefilled the form
    setTopic(prefill.topic); setKind('text'); setLabel('')
    setYn(true); setText(''); setNumN(''); setNumUnit(''); setTime(R_TIME_OPTIONS[0]); setSteps('')
    setCName(''); setCPhone(''); setCEmail(''); setPlace(''); setLink('')
    setStep('confirm')
  }

  const title = gap ? 'Add a fact' : editing ? 'Edit fact' : 'Add a fact'
  const footer = gap || step === 'confirm'
    ? (
      <>
        <Button onClick={() => (!gap && !editing && step === 'confirm' ? setStep('describe') : onClose())}>{!gap && !editing ? 'Back' : 'Cancel'}</Button>
        <Button kind="primary" disabled={!valid} onClick={submit}>{editing ? 'Save' : 'Add'}</Button>
      </>
    )
    : (
      <>
        <Button onClick={() => { stopVoice(); onClose() }}>Cancel</Button>
        <Button kind="primary" disabled={!desc.trim() || listening} onClick={runAi}>Continue</Button>
      </>
    )

  const scopeLabel = { all: 'Entire property', some: 'Some channels', one: 'One channel' } as const

  return (
    <DetailsDrawer open title={title} onClose={() => { stopVoice(); onClose() }} label={title} footer={footer}>
      {!gap && step === 'describe' ? (
        <div className="h-khr-addfact">
          <div className="h-khr-addfact__field">
            <div className="h-khaf-head">
              <label className="h-khr-addfact__label" htmlFor={descId}>Describe the fact</label>
              <Button type="button" className={cx('h-khaf-voice', listening && 'is-listening')} icon="microphone" aria-pressed={listening}
                onClick={toggleVoice}>{listening ? 'Stop' : 'Use voice'}</Button>
            </div>
            <textarea id={descId} className="h-textarea" rows={4} autoFocus readOnly={listening}
              placeholder={listening ? 'Listening…' : 'e.g. “I have AC”, “Check-out is at 11, but ask us for a late check-out”, “The building manager is called Jörg, he’s in the courtyard most mornings”…'}
              value={desc} onChange={(e) => setDesc(e.target.value)} />
            {listening
              ? <span className="h-khaf-listening" role="status"><span className="h-khaf-listening__dot" aria-hidden="true" />Listening… speak naturally, then press Stop.</span>
              : <span className="h-khr-addfact__hint">Write or say it the way you’d tell a guest. It’s turned into a fact you can check and adjust before it’s added.</span>}
          </div>
          <button type="button" className="h-textlink h-khaf-skip" onClick={skipToForm}>I prefer to fill in the form instead</button>
        </div>
      ) : (
        <div className="h-khr-addfact">
          <div className="h-khr-addfact__field">
            <span className="h-khr-addfact__label">Category</span>
            {prefill.lockTopic || !!gap || !!editing
              ? <p className="h-khr-addfact__locked">{topicLabel(topic)}</p>
              : <Dropdown label="Category" value={topicLabel(topic)} options={R_TOPICS.map((t) => t.label)} onChange={(l) => setTopic(R_TOPICS.find((t) => t.label === l)!.id)} />}
          </div>

          {!gap && (
            <div className="h-khr-addfact__field">
              <span className="h-khr-addfact__label">Type</span>
              <Dropdown label="Type" value={kind} options={R_FACT_KINDS.map((k) => ({ value: k.id, label: k.label }))} onChange={(v) => setKind(v as RFactKind)} />
            </div>
          )}

          {!gap && (
            <label className="h-khr-addfact__field">
              <span className="h-khr-addfact__label">What’s this about?</span>
              <input className="h-input" placeholder="e.g. Parking, Building manager, Bin collection day" value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
          )}

          <div className="h-khr-addfact__field">
            <span className="h-khr-addfact__label">{gap ? 'Your answer' : kindOf(kind).label}</span>
            <ValueField kind={kind}
              yn={yn} onYn={setYn} text={text} onText={setText} numN={numN} onNumN={setNumN} numUnit={numUnit} onNumUnit={setNumUnit}
              time={time} onTime={setTime} steps={steps} onSteps={setSteps}
              cName={cName} onCName={setCName} cPhone={cPhone} onCPhone={setCPhone} cEmail={cEmail} onCEmail={setCEmail}
              place={place} onPlace={setPlace} link={link} onLink={setLink} />
          </div>

          {!gap && (
            <div className="h-khr-addfact__field">
              <span className="h-khr-addfact__label">Where this comes from</span>
              <Dropdown label="Where this comes from" value={source} options={[...R_FACT_SOURCES]} onChange={setSource} />
            </div>
          )}

          <div className="h-khr-addfact__field">
            <span className="h-khr-addfact__label">Applies to</span>
            <Dropdown label="Applies to" value={scope.type} options={(['all', 'some', 'one'] as const).map((v) => ({ value: v, label: scopeLabel[v] }))}
              onChange={(v) => setScope(v === 'all' ? { type: 'all' } : { type: v as 'some' | 'one', channels: v === 'one' ? [chs[0]] : chs })} />
            {scope.type === 'some' && (
              <ChipGroup label="Which channels" items={chs.map((c) => ({ id: c, label: NAME(c) }))}
                value={scope.channels ?? []} onChange={(v) => setScope({ type: 'some', channels: v as ListingChannel[] })} />
            )}
            {scope.type === 'one' && (
              <Dropdown label="Which channel" value={NAME(scope.channels?.[0] ?? chs[0])} options={chs.map(NAME)}
                onChange={(l) => setScope({ type: 'one', channels: [chs.find((c) => NAME(c) === l) ?? chs[0]] })} />
            )}
          </div>

          {!gap && (
            <label className="h-khr-addfact__toggle">
              <Toggle checked={visibility === 'guest'} onChange={(v) => setVisibility(v ? 'guest' : 'internal')} label="Guest-visible" />
              <span>{visibility === 'guest' ? 'Guest-visible: it can be shared with guests.' : 'Internal only: for your own records, never shared with guests.'}</span>
            </label>
          )}
        </div>
      )}
    </DetailsDrawer>
  )
}

function ValueField({ kind, yn, onYn, text, onText, numN, onNumN, numUnit, onNumUnit, time, onTime, steps, onSteps, cName, onCName, cPhone, onCPhone, cEmail, onCEmail, place, onPlace, link, onLink }: {
  kind: RFactKind
  yn: boolean; onYn: (v: boolean) => void
  text: string; onText: (v: string) => void
  numN: string; onNumN: (v: string) => void; numUnit: string; onNumUnit: (v: string) => void
  time: string; onTime: (v: string) => void
  steps: string; onSteps: (v: string) => void
  cName: string; onCName: (v: string) => void; cPhone: string; onCPhone: (v: string) => void; cEmail: string; onCEmail: (v: string) => void
  place: string; onPlace: (v: string) => void
  link: string; onLink: (v: string) => void
}) {
  switch (kind) {
    case 'yesno': return <Toggle checked={yn} onChange={onYn} label={yn ? 'Yes' : 'No'} />
    case 'text': return <textarea className="h-textarea" rows={4} placeholder="Write the fact as you’d want a guest to read it." value={text} onChange={(e) => onText(e.target.value)} />
    case 'number': return (
      <div className="h-khr-addfact__number">
        {/* NumberField (ds/v3-ch.tsx), the product-wide numeric control: ▲/▼ spinner + Up/Down keys (review, 1 Oct) —
            replaces the −/+ NumberStepper, which had no keyboard stepping. Same string value as before. */}
        <NumberField label="Amount" value={numN} onChange={(v) => onNumN(v.replace(',', '.').replace(/[^\d.]/g, ''))} inputMode="decimal" decimals={1} max={99999} />
        <input className="h-input" placeholder="Unit (e.g. nights, minutes, €)" value={numUnit} onChange={(e) => onNumUnit(e.target.value)} />
      </div>
    )
    case 'time': return <Dropdown label="Time" value={time} options={R_TIME_OPTIONS} onChange={onTime} />
    case 'steps': return <StepsEditor value={steps} onChange={onSteps} />
    case 'contact': return (
      <div className="h-khr-addfact__contact">
        <input className="h-input" placeholder="Name" value={cName} onChange={(e) => onCName(e.target.value)} />
        <input className="h-input" placeholder="Phone" value={cPhone} onChange={(e) => onCPhone(e.target.value)} />
        <input className="h-input" placeholder="Email" value={cEmail} onChange={(e) => onCEmail(e.target.value)} />
      </div>
    )
    case 'place': return (
      <div className="h-khr-addfact__place">
        <input className="h-input" placeholder="Address or place name" value={place} onChange={(e) => onPlace(e.target.value)} />
        {place.trim() && <MapBox label={place.trim()} />}
      </div>
    )
    case 'link': return <input className="h-input" type="url" placeholder="https://…" value={link} onChange={(e) => onLink(e.target.value)} />
  }
}

/** A simple ordered list: one step per line, add/remove rows (same convention as the checkout `TaskList`, without its
 *  fixed presets — these steps are the host's own words). */
function StepsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = value.split('\n')
  const set = (next: string[]) => onChange(next.join('\n'))
  return (
    <div className="h-khr-steps-edit">
      {items.map((s, i) => (
        <div key={i} className="h-khr-steps-edit__row">
          <span className="h-khr-steps-edit__num">{i + 1}</span>
          <input className="h-input" value={s} placeholder={`Step ${i + 1}`} onChange={(e) => set(items.map((x, k) => (k === i ? e.target.value : x)))} />
          {items.length > 1 && <button type="button" className="h-tasks__del" aria-label={`Remove step ${i + 1}`} onClick={() => set(items.filter((_, k) => k !== i))}><Icon name="trash" /></button>}
        </div>
      ))}
      <button type="button" className={cx('h-textlink', 'h-khr-steps-edit__add')} onClick={() => set([...items, ''])}><Icon name="plus" size={16} />Add step</button>
    </div>
  )
}
