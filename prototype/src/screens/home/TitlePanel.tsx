/* Title panel (F-B1): one recommended title + alternatives, refine, similar listings' titles.
 * SCR-04 · owner S11 · R-106 R-107 R-108 R-141 (voice hook) · D-142 D-106 */
import { useEffect, useState } from 'react'
import { AskCard, Button, ChannelChip, CloseButton, Icon, IconButton, Pill } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { STRATEGIES, STRENGTH_LABEL, compsFor, refineTitle, scoreTitle, titleOptions, type ScoredTitle } from '../../data/studio'
import type { ChannelId, StrategyId } from '../../data/types'
import { useStore } from '../../store/store'
import { similarityOf } from './Insights'

const CHIPS = ['Shorter', 'Mention the workspace', 'Less formal', 'Mention the balcony']

export function TitlePanel({ channel, strategy, onClose }: { channel: ChannelId; strategy: StrategyId | null; onClose: () => void }) {
  const s = useStore()
  const base = titleOptions(channel, strategy, s.facts)
  const [extra, setExtra] = useState<ScoredTitle[]>([])
  const options = [...extra, ...base].slice(0, 5)
  const [picked, setPicked] = useState(0)
  const [text, setText] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [askId, setAskId] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [compsOpen, setCompsOpen] = useState(s.prefs.compsOpen)
  const listing = channel === 'airbnb' || channel === 'booking' ? s.listings[channel] : undefined
  const current = options[picked] ?? options[0]

  useEffect(() => { setPicked(0); setExtra([]) }, [strategy, channel])
  // Voice hook (R-141): S13 designs the full voice mode; on desktop the mic fills the refine box.
  useEffect(() => {
    if (!listening) return
    const t = setTimeout(() => { setListening(false); setText('mention the workspace') }, 1400)
    return () => clearTimeout(t)
  }, [listening])

  const refine = (instruction: string, from = current) => {
    const r = refineTitle(from.text, instruction, s.facts)
    setNote(r.note); setAskId(r.askId ?? null)
    if (r.text) {
      const t = scoreTitle({ text: r.text, strategy: from.strategy, why: `Refined: “${instruction}”. ${from.why}`, uses: from.uses }, channel, strategy)
      setExtra([t, ...extra.filter((x) => x.text !== t.text)]); setPicked(0)
    }
  }
  const q = askId ? s.questions.find((x) => x.id === askId) : undefined
  const comps = compsFor(channel)
  const use = () => { if (!current.over && listing) { s.setListingField(channel as 'airbnb' | 'booking', 'title', current.text); onClose() } }

  return (
    <aside className="h-ai-panel" style={{ width: '100%' }} aria-label={`Title suggestions for ${CHANNELS[channel].name}`}>
      <div className="h-ai-panel__head">
        <Icon name="sparkles" /><span className="h-ai-panel__title">Title</span><ChannelChip channel={channel} />
        <CloseButton label="Close the title panel" onClick={onClose} />
      </div>
      <div className="h-ai-panel__body" style={{ maxHeight: 620, overflowY: 'auto' }}>
        <div className="h-ai-panel__why"><Icon name="info-circle" size={16} />From your facts and {comps.length ? 24 : 0} similar {CHANNELS[channel].name} listings nearby (your own units excluded).{strategy && ` Leaning ${STRATEGIES.find((x) => x.id === strategy)?.label}.`}</div>
        {options.map((o, i) => (
          <div key={o.text} className={`h-suggestion${i === 0 && !extra.length ? ' is-recommended' : ''}`} aria-selected={i === picked}
            role="option" tabIndex={0} onClick={() => setPicked(i)} onKeyDown={(e) => { if (e.key === 'Enter') setPicked(i) }}>
            {i === 0 && !extra.length && <Pill kind="recommended">Recommended</Pill>}
            {i === 0 && extra.length > 0 && <Pill kind="ai">Refined</Pill>}
            <div className="h-suggestion__text" style={{ marginTop: i === 0 ? 8 : 0 }}>{o.text}</div>
            <div className="h-suggestion__meta">
              <span className={o.over ? 'is-over' : ''}>{o.chars} / {o.limit}{o.over ? ` · too long for ${CHANNELS[channel].name}` : ''}</span>
              <span className="h-strength" data-level={o.strength} title={`Fits the limit ${o.parts.limit ? '✓' : '✗'} · names the area ${o.parts.area ? '✓' : '✗'} · every claim backed ${o.parts.grounded ? '✓' : '✗'} · ${strategy ? 'leans into the strategy' : 'names a landmark or transit, like 17 of 24 comps'} ${o.parts.pattern ? '✓' : '✗'}`}><i /><i /><i /><i /></span>
              <span>{STRENGTH_LABEL[o.strength]}</span>
              {o.strategy !== 'balanced' && <span>· {STRATEGIES.find((x) => x.id === o.strategy)?.label}</span>}
            </div>
            {i === picked && (
              <>
                <p className="h-caption" style={{ margin: '8px 0 0', color: 'var(--color-ai-text)' }}>{o.why}</p>
                <div className="h-suggestion__refine">
                  {CHIPS.map((c) => <button key={c} className="h-refine-chip" onClick={(e) => { e.stopPropagation(); refine(c, o) }}><Icon name="wand" />{c}</button>)}
                </div>
                {/* The answer to a refine sits under the option it refines, not below the list (seen in S11 review). */}
                <div onClick={(e) => e.stopPropagation()}>
                  {note && <div className="h-ai-state h-ai-state--generating p-mt2"><Icon name="sparkles" /><div>{note}</div></div>}
                  {q && q.status !== 'answered' && <div className="p-mt2"><AskCard q={q} onAnswer={(a) => { s.answerQuestion(q.id, a); setAskId(null); setNote('Added to your home. Try the instruction again.') }} onLater={() => { s.deferQuestion(q.id); setAskId(null) }} /></div>}
                </div>
              </>
            )}
          </div>
        ))}
        <div>
          <button className="h-accordion__head" style={{ width: '100%', padding: '8px 0' }} aria-expanded={compsOpen} onClick={() => setCompsOpen(!compsOpen)}>
            <Icon name="users" />How similar places phrase theirs ({comps.length})<Icon name={compsOpen ? 'chevron-up' : 'chevron-down'} />
          </button>
          {compsOpen && (
            <div className="p-col" style={{ gap: 6 }}>
              {comps.map((c) => (
                <div key={c.id} className="p-row p-sb h-small" style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-divider)' }}>
                  <span>{c.title}</span>
                  <span className="h-caption h-muted">{Math.round(similarityOf(c) * 100)}% similar · {Math.round(c.occupancy * 100)}% booked</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-ai-panel__foot">
        <form className="h-refine" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { refine(text.trim()); setText('') } }}>
          <input placeholder={listening ? 'Listening…' : 'Tell the AI what to change…'} aria-label="Refine the title" value={text} onChange={(e) => setText(e.target.value)} />
          <IconButton icon="microphone" label={listening ? 'Listening' : 'Speak an instruction'} type="button" onClick={() => setListening(true)}
            style={listening ? { color: 'var(--color-action-primary)' } : undefined} />
          <IconButton icon="send" label="Send" type="submit" />
        </form>
        <div className="p-row" style={{ justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button kind="primary" onClick={use} disabled={!current || current.over}>Use for {CHANNELS[channel].name}</Button>
        </div>
        <span className="h-caption h-muted">Nothing changes on {CHANNELS[channel].name} until you push.</span>
      </div>
    </aside>
  )
}
