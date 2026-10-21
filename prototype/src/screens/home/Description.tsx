/* Description (F-B2): ONE draft, written from the facts in plain words + strategy + the channel's rules. Every
 * sentence cites its facts (hover); select a sentence to rewrite · shorten · more factual · warmer · remove, or
 * instruct. Global instructions apply to every draft. A claim the home can't back is a question, not text.
 * SCR-04 · owner S11 · R-109 R-088 R-006 · D-141 D-106 D-090 */
import { useState } from 'react'
import { AskCard, AutonomyControl, AutonomyNotice, Button, Cite, Icon, SourceChip } from '../../ds'
import { AUTONOMY_NAME } from '../../ds/studio'
import {
  PRESET_INSTRUCTIONS, SENTENCE_ACTIONS, draftDescription, editSentence, instructSentence, unbackedClaims,
} from '../../data/studio'
import type { StrategyId } from '../../data/types'
import { useStore } from '../../store/store'
import { useCiteRows } from './parts'

export function Description({ strategy }: { strategy: StrategyId | null }) {
  const s = useStore()
  const rows = useCiteRows()
  const [edits, setEdits] = useState<Record<string, string | null>>({})
  const [changed, setChanged] = useState<Set<string>>(new Set())
  const [sel, setSel] = useState<string | null>(null)
  const [instr, setInstr] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [askId, setAskId] = useState<string | null>(null)
  const [compare, setCompare] = useState(false)
  const [newGlobal, setNewGlobal] = useState('')
  const live = s.listings.airbnb.description
  const draft = draftDescription(s.facts, strategy, s.studio.instructions, edits)
  const text = draft.map((x) => x.text).join(' ')
  const claims = unbackedClaims(live, s.facts)
  const selected = draft.find((x) => x.id === sel)
  const level = s.studio.autonomy['airbnb.description'] ?? 'suggest'
  const inDraft = live === text

  const apply = (id: string, next: string | null, why: string) => {
    setEdits({ ...edits, [id]: next }); setChanged(new Set(changed).add(id)); setNote(why)
    if (next === null) setSel(null)
  }
  const toggleGlobal = (g: string) => {
    const list = s.studio.instructions.includes(g) ? s.studio.instructions.filter((x) => x !== g) : [...s.studio.instructions, g]
    s.setInstructions(list); setNote(s.studio.instructions.includes(g) ? `Stopped following “${g}”.` : `Every draft now follows “${g}”.`)
  }
  const q = askId ? s.questions.find((x) => x.id === askId) : undefined

  return (
    <section className="p-card" id="studio-description" aria-labelledby="desc-h">
      <div className="p-row p-sb">
        <div className="p-label" id="desc-h">Description · Airbnb</div>
        <div className="p-row" style={{ gap: 8 }}>
          {inDraft ? <span className="h-source h-source--you"><Icon name="user" />Edited by you · not pushed</span> : <SourceChip source={{ kind: 'airbnb', at: '', detail: 'Imported · v0' }} />}
          <AutonomyControl value={level} onChange={(v) => s.setAutonomy('airbnb', 'description', v)} scope="descriptions on Airbnb, this property" />
        </div>
      </div>
      <p className="h-caption h-muted" style={{ margin: '6px 0 0' }}>
        One draft, written from <b>the facts in plain words</b>{strategy ? ' and the strategy you’re trying' : ''}. Hover a sentence to see its facts; click one to edit it.
      </p>

      {selected && (
        <div className="h-seltool p-mt3" role="toolbar" aria-label="Edit the selected sentence" style={{ flexWrap: 'wrap' }}>
          {SENTENCE_ACTIONS.map((a) => (
            <button key={a.id} className="h-seltool__btn" onClick={() => {
              const next = editSentence(selected.id, a.id)
              apply(selected.id, next, a.id === 'remove' ? 'Removed from the draft. The facts stay in your home.' : `${a.label}: same facts, new words.`)
            }}>{a.icon && <Icon name={a.icon} />}{a.label}</button>
          ))}
          <span className="h-seltool__sep" />
          <form style={{ display: 'contents' }} onSubmit={(e) => {
            e.preventDefault()
            if (!instr.trim()) return
            const r = instructSentence(selected, instr, s.facts)
            setAskId(r.askId ?? null); setNote(r.note)
            if (r.text) apply(selected.id, r.text, r.note)
            setInstr('')
          }}>
            <input className="h-seltool__input" placeholder="Tell AI what to change…" aria-label="Instruction for this sentence" value={instr} onChange={(e) => setInstr(e.target.value)} />
          </form>
        </div>
      )}

      {!compare ? (
        <p className="p-mt3" style={{ lineHeight: 'var(--leading-md)', margin: '12px 0 0' }}>
          {draft.map((x) => (
            <Cite key={x.id} facts={rows(x.uses)} selected={sel === x.id} changed={changed.has(x.id)} onSelect={() => setSel(sel === x.id ? null : x.id)}>{x.text}</Cite>
          ))}
        </p>
      ) : (
        <div className="h-diff-split p-mt3">
          <div><div className="h-diff-split__label"><span className="h-blame__v h-blame__v--import">v0</span>Live on Airbnb now</div><span className="h-diff"><del>{live}</del></span></div>
          <div><div className="h-diff-split__label"><span className="h-blame__v h-blame__v--ai">draft</span>This draft</div><span className="h-diff"><ins>{text}</ins></span></div>
        </div>
      )}
      <div className="p-row p-mt3" style={{ gap: 8 }}>
        <Icon name="list-details" size={16} />
        <span className="h-caption h-muted">{draft.length} sentences · {new Set(draft.flatMap((x) => x.uses)).size} facts · {text.length} characters · Airbnb shows about 400 in search</span>
      </div>
      {note && <div className="h-ai-state h-ai-state--generating p-mt2"><Icon name="sparkles" /><div>{note}</div></div>}

      {claims.map((c) => {
        const cq = s.questions.find((x) => x.id === c.questionId)
        return cq && cq.status === 'open' ? (
          <div key={c.claim} className="p-mt3">
            <AskCard q={cq.why.includes(c.claim) ? cq : { ...cq, why: `Your live Airbnb text says “${c.claim}”. ${cq.why}` }} onAnswer={(a) => s.answerQuestion(cq.id, a)} onLater={() => s.deferQuestion(cq.id)} />
          </div>
        ) : null
      })}
      {q && q.status === 'open' && !claims.some((c) => c.questionId === q.id) && (
        <div className="p-mt3"><AskCard q={q} onAnswer={(a) => { s.answerQuestion(q.id, a); setAskId(null) }} onLater={() => { s.deferQuestion(q.id); setAskId(null) }} /></div>
      )}

      <div className="p-mt4" style={{ borderTop: '1px solid var(--color-border-divider)', paddingTop: 12 }}>
        <div className="p-label">Instructions for every draft</div>
        <div className="h-chips p-mt2">
          {PRESET_INSTRUCTIONS.map((g) => (
            <button key={g} className="h-chip" aria-pressed={s.studio.instructions.includes(g)} onClick={() => toggleGlobal(g)}>
              <Icon name={s.studio.instructions.includes(g) ? 'check' : 'plus'} />{g}
            </button>
          ))}
          {s.studio.instructions.filter((g) => !PRESET_INSTRUCTIONS.includes(g)).map((g) => (
            <button key={g} className="h-chip" aria-pressed="true" onClick={() => toggleGlobal(g)}><Icon name="check" />{g}</button>
          ))}
        </div>
        <form className="h-refine p-mt2" onSubmit={(e) => { e.preventDefault(); if (newGlobal.trim()) { s.setInstructions([...s.studio.instructions, newGlobal.trim()]); setNote(`Every draft now follows “${newGlobal.trim()}”.`); setNewGlobal('') } }}>
          <input placeholder="Add an instruction, e.g. “always mention the courtyard”" aria-label="Add an instruction for every draft" value={newGlobal} onChange={(e) => setNewGlobal(e.target.value)} />
          <button className="h-btn-icon" aria-label="Add instruction" type="submit"><Icon name="plus" /></button>
        </form>
      </div>

      <div className="p-row p-mt4" style={{ gap: 8 }}>
        {level === 'suggest' ? (
          <Button kind="primary" disabled={inDraft} onClick={() => s.setListingField('airbnb', 'description', text)}>{inDraft ? 'Queued for Airbnb' : 'Use this draft for Airbnb'}</Button>
        ) : (
          <AutonomyNotice>This draft applies to Airbnb under <b>{AUTONOMY_NAME[level]}</b>{level === 'auto-review' ? ' in 24 h unless you stop it' : ' at the next push'}.</AutonomyNotice>
        )}
        <Button onClick={() => setCompare(!compare)}>{compare ? 'Back to the draft' : 'Compare with live'}</Button>
        {Object.keys(edits).length > 0 && <Button kind="ghost" onClick={() => { setEdits({}); setChanged(new Set()); setNote('Back to the AI draft.') }}>Reset edits</Button>}
      </div>
    </section>
  )
}
