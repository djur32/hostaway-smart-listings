/* SCR-03 · The home / Arrival & stay / Rules & booking (+ Pricing, rendered the same way until S12 replaces it).
 * One fact-row pattern, one lens (IA-R rules 1–3). Every fact: canonical label, value, source, sync state, and with the
 * lens on All, what each channel calls it ("one bathtub, four names"). Needs-you items resolve here, inline (rule 6).
 * Listing text = the studio (SCR-04). What the assistant answers = Ask the AI + Sources (D-125).
 * Owners: The home, Arrival & stay, Rules & booking → S11 · Pricing → S12.
 * R-072 R-074 R-081 R-082 R-083 R-084 R-089 R-100 R-101 · D-110 D-123 D-125 D-140 D-147 */
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AskCard, Button, DecisionCard, FactRow, Guide, Icon, Lens, OverridePin, PageHeader, PushTray, Tabs, Term, Toast, Toggle,
} from '../../ds'
import { fieldsIn } from '../../data/canonical'
import { PROPERTY_RAIL, slug } from '../../data/ia'
import type { ChannelId, SectionId } from '../../data/types'
import { needsYou, projection, queueByChannel } from '../../store/selectors'
import { useStore } from '../../store/store'
import { Placeholder } from '../../shell/Placeholder'
import { useProperty } from '../../shell/PropertyLayout'
import { AddFact } from './AddFact'
import { AssistantAnswers } from './AssistantAnswers'
import { ListingText } from './ListingText'

const CHANNELS_HERE: ChannelId[] = ['airbnb', 'booking']

export function KindSection({ section }: { section: SectionId }) {
  const p = useProperty()
  const { tab } = useParams()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const rail = PROPERTY_RAIL.find((r) => r.key === section)!
  const tabs = rail.tabs ?? []
  const current = tabs.find((t) => slug(t) === tab)
  const s = useStore()
  const [adding, setAdding] = useState(false)
  const [note, setNote] = useState('')
  if (!current) return <Navigate to={`/property/${p.id}/${rail.path}/${slug(tabs[0])}`} replace />
  const isStudio = section === 'home' && current === 'Listing text'
  const isAssistant = section === 'arrival' && current === 'What the assistant answers'
  const lens = (params.get('lens') as ChannelId | 'all' | null) ?? (isStudio ? 'airbnb' : 'all')
  const setLens = (l: ChannelId | 'all') => { const n = new URLSearchParams(params); n.set('lens', l); n.delete('focus'); setParams(n, { replace: true }) }
  const base = `/property/${p.id}/${rail.path}`
  const ny = needsYou(s)
  const custom = s.customFields.filter((f) => f.section === section && f.tab === current)
  const fields = [...fieldsIn(section, current), ...custom]
  const inTab = new Set(fields.map((f) => f.id))
  const openHere = ny.open.filter((d) => d.fieldId && inTab.has(d.fieldId))
  const qs = ny.questions.filter((q) => inTab.has(q.fieldId))
  const sectionCount = ny.open.filter((d) => d.home.startsWith(base)).length + ny.questions.filter((q) => fields.some((f) => f.id === q.fieldId) || (isStudio && ['wifi-speed', 'balcony'].includes(q.id))).length
    + (isStudio ? ny.suggestions.length : 0)
  const counts = queueByChannel(s)

  return (
    <>
      <PageHeader title={rail.label} property={p} right={
        <>
          <Lens channels={p.channels.filter((c) => CHANNELS_HERE.includes(c))} value={lens} onChange={setLens} />
          {isStudio && lens === 'airbnb' && (
            <label className="p-row h-small" style={{ gap: 6, whiteSpace: 'nowrap', flexWrap: 'nowrap' }}><Toggle checked={s.prefs.previewOn} onChange={(v) => s.setPref('previewOn', v)} label="Preview" />Preview</label>
          )}
        </>
      } />
      <div className="p-mt4"><Tabs items={tabs.map((t) => ({ label: t, to: `${base}/${slug(t)}` }))} /></div>
      {/* S12 mode hooks (D-150): guidance only; nothing below changes by persona. */}
      {p.deep && isStudio && <div className="p-mt4"><Guide id="studio-why" title="Why does Hospitable touch your listing text?"
        line={<>Suggestions only: nothing reaches a <Term k="channel">booking site</Term> until you review and push.</>}>
        Your Airbnb text stays exactly as it is until you choose. Hospitable can suggest improvements written only from your home’s facts and from similar homes nearby, and adapt one text for Booking.com. Nothing is sent until you press Review &amp; push, and every earlier version is kept.
      </Guide></div>}
      {p.deep && !isStudio && section === 'home' && <div className="p-mt4"><Guide id="home-facts" title="This is everything true about your home"
        line="Edit a fact once here; every booking site and the guest assistant get it at the next push.">
        Hospitable keeps one copy of each fact (beds, Wi-Fi, check-in…) and shows where it came from. Airbnb, Booking.com and the guest assistant all read from here, so you only ever change it once.
      </Guide></div>}
      {p.deep && (
        <div className="p-strip p-mt4">
          <span className="h-small p-row" style={{ gap: 6 }}>
            <Icon name="alert-circle" size={16} /><b>Needs you · {sectionCount}</b>
            <span className="h-muted">{isStudio ? `${ny.questions.length} questions · ${ny.suggestions.length} suggestions` : `${openHere.length} to decide · ${qs.length} questions in this tab`}</span>
            {!isStudio && <Link className="h-link h-caption" to={`/property/${p.id}/overview/needs-you`}>All ({ny.count})</Link>}
          </span>
          <span className="p-row" style={{ gap: 12 }}>
            <Link className="h-link h-caption" to={`/property/${p.id}/listing/airbnb/history`}><Icon name="history" size={16} /> History</Link>
            <PushTray counts={counts} channels={CHANNELS_HERE} onReview={() => nav(`/property/${p.id}/push`)} />
          </span>
        </div>
      )}

      {!p.deep ? <Placeholder scr="SCR-03" owner="S12" title="Portfolio property">Only the scenario property is modelled in depth.</Placeholder>
        : isStudio ? <ListingText lens={lens} propertyId={p.id} />
          : isAssistant ? <AssistantAnswers />
            : (
              <div className="p-grid-2 p-mt4">
                <div>
                  <div className="p-row p-sb" style={{ marginBottom: 4 }}>
                    <span className="h-caption h-muted">
                      {lens === 'all' ? 'Shared values, and what each channel calls them.' : `How this reads on ${lens === 'airbnb' ? 'Airbnb' : 'Booking.com'}. Dimmed: the channel has no field for it.`}
                    </span>
                    {section !== 'pricing' && !adding && <Button size="md" icon="plus" onClick={() => { setAdding(true); setNote('') }}>Add a fact</Button>}
                  </div>
                  {adding && <div className="p-mt2" style={{ marginBottom: 12 }}><AddFact section={section} tab={current} onDone={(m) => { setAdding(false); setNote(m) }} /></div>}
                  {note && <Toast key={note} onClose={() => setNote('')}>{note}</Toast>}
                  {fields.map((f) => {
                    const stored = s.facts[f.id]
                    if (!stored) return null
                    // Custom facts from the canonical map are statements: label = value. Show the statement once.
                    const fact = stored.value === f.label ? { ...stored, value: 'Yes' } : stored
                    const dec = openHere.find((d) => d.fieldId === f.id)
                    const proj = lens === 'all' ? null : projection(fact, lens)
                    return (
                      <FactRow key={f.id} field={f} fact={fact} lens={lens} channels={CHANNELS_HERE} names
                        side={proj?.kind === 'override' && lens !== 'all' ? <OverridePin channel={lens} value={proj.text} /> : undefined}>
                        {dec && lens === 'all' && (
                          <div className="p-mt2"><DecisionCard d={dec} onDecide={(o, rule) => s.decide(dec.id, o, rule)} onLater={() => s.deferDecision(dec.id)} /></div>
                        )}
                      </FactRow>
                    )
                  })}
                </div>
                <div className="p-col">
                  {qs.map((q) => <AskCard key={q.id} q={q} onAnswer={(a) => s.answerQuestion(q.id, a)} onLater={() => s.deferQuestion(q.id)} />)}
                  <section className="p-card">
                    <div className="p-label">Who reads these facts</div>
                    <p className="h-small" style={{ margin: '6px 0 0' }}>Airbnb · Booking.com · your Direct site · the guest assistant · the guidebook. One home per fact: edit it here and every reader updates at the next push.</p>
                    {section === 'arrival' && <Link className="h-link h-small" to={`/property/${p.id}/arrival/what-the-assistant-answers`}>Ask the AI what it tells guests</Link>}
                  </section>
                  <p className="h-caption h-muted">Sources on every row. Values that differ per channel show one fact with each channel’s value, never two fields.</p>
                </div>
              </div>
            )}
    </>
  )
}
