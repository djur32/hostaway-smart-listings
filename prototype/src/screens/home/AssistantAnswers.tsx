/* Arrival & stay › What the assistant answers — "Ask the AI" and "Sources" keep working, reading the same facts as the
 * listings (one truth, many readers). Replaces "Generate Knowledge Hub" (D-125). SCR-03 · owner S11 · R-081 R-082 · D-125 D-111 */
import { useState } from 'react'
import { AskCard, Explainer, Icon } from '../../ds'
import { ASSISTANT_QA } from '../../data/studio'
import { useStore } from '../../store/store'
import { useCiteRows } from './parts'

const READERS = ['Airbnb listing', 'Booking.com listing', 'Direct site', 'Guest assistant (messages)', 'Guidebook']

export function AssistantAnswers() {
  const s = useStore()
  const rows = useCiteRows()
  const [i, setI] = useState(0)
  const [custom, setCustom] = useState('')
  const qa = ASSISTANT_QA[i]
  const a = qa.answer(s.facts)
  const q = a.askId ? s.questions.find((x) => x.id === a.askId) : undefined
  return (
    <div className="p-grid-2 p-mt4">
      <div className="p-col">
        <Explainer title="One home, many readers">The assistant answers guests from the same facts your listings use. There’s nothing to generate: when a fact changes, the answer changes. When a fact is missing, it asks you instead of guessing.</Explainer>
        <section className="p-card">
          <div className="p-label">Ask the AI what it would tell a guest</div>
          <div className="h-chips p-mt2">
            {ASSISTANT_QA.map((x, n) => <button key={x.q} className="h-chip" aria-pressed={n === i} onClick={() => setI(n)}>{x.q}</button>)}
          </div>
          <form className="h-refine p-mt3" onSubmit={(e) => { e.preventDefault(); const n = ASSISTANT_QA.findIndex((x) => x.q.toLowerCase().includes(custom.toLowerCase().slice(0, 8))); if (n >= 0) setI(n); setCustom('') }}>
            <input placeholder="Type a guest question…" aria-label="Guest question" value={custom} onChange={(e) => setCustom(e.target.value)} />
            <button className="h-btn-icon" aria-label="Ask" type="submit"><Icon name="send" /></button>
          </form>
          <div className="h-thread p-mt4">
            <div className="h-msg h-msg--me">{qa.q}</div>
            <div className="h-msg h-msg--ai">{a.text}<span className="h-msg__meta">{a.uses.length ? `From ${a.uses.length} fact${a.uses.length > 1 ? 's' : ''} in your home` : 'Not in your home yet'}</span></div>
          </div>
          {a.uses.length > 0 && (
            <div className="p-mt3">
              <div className="p-label">Sources</div>
              {rows(a.uses).map((r) => (
                <div key={r.id} className="p-row p-sb h-small" style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-divider)' }}><span><b>{r.label}</b> · {r.value}</span>{r.source}</div>
              ))}
            </div>
          )}
          {q && q.status === 'open' && <div className="p-mt3"><AskCard q={q} onAnswer={(v) => s.answerQuestion(q.id, v)} onLater={() => s.deferQuestion(q.id)} /></div>}
        </section>
      </div>
      <div className="p-col">
        <section className="p-card">
          <div className="p-label">Who reads your home</div>
          {READERS.map((r) => <div key={r} className="p-row h-small p-mt2" style={{ gap: 8 }}><Icon name="circle-check" size={16} />{r}</div>)}
        </section>
        <p className="h-caption h-muted">Canned responses and custom codes stay in Guest experience, which links here. The old “Generate Knowledge Hub” step is gone: its facts moved to their homes (D-125).</p>
      </div>
    </div>
  )
}
