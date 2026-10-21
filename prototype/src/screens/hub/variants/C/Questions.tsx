/* KH-C · one journey stage: the questions guests ask, most asked first. Each shows the answer the AI gives now, its
 * coverage and provenance; expanding one shows the facts behind it as small editable rows. */
import { useState } from 'react'
import {
  Button, Icon, KhcAnswer, KhcFacts, KhcLabel, KhcProv, KhcQuestion, KhcQuestions, Segmented, type KhcState,
} from '../../../../ds'
import { CHANNELS } from '../../../../data/channels'
import type { ListingChannel } from '../../../../data/sl3'
import { useStore } from '../../../../store/store'
import { STAGE_HEAD, type Question, type StageId } from './data'
import { FactRow } from './Facts'
import { answerOf, lineOf, useKhc, type Hub } from './model'

export type Filter = 'all' | 'answered' | 'gaps'
export const asGuest = (c: ListingChannel) => (c === 'direct' ? 'As a guest on your site sees it' : `As ${c === 'airbnb' ? 'an' : 'a'} ${CHANNELS[c].name} guest sees it`)

export function StageQuestions({ hub, stage, open, onOpen, channel, filter, onFilter, onGap, base, edit, onEdit }: {
  hub: Hub; stage: StageId; open: string | null; onOpen: (id: string | null) => void; channel: ListingChannel
  filter: Filter; onFilter: (f: Filter) => void; onGap: (gapId: string) => void; base: string
  edit: string | null; onEdit: (k: string | null) => void
}) {
  const all = hub.questions.filter((q) => q.stage === stage).sort((a, b) => (b.asked ?? 0) - (a.asked ?? 0))
  const answered = all.filter((q) => hub.cov(q) === 'a')
  const gaps = all.filter((q) => hub.cov(q) !== 'a')
  const shown = filter === 'answered' ? answered : filter === 'gaps' ? gaps : all
  return (
    <>
      <div className="h-khc-listhead">
        <h2>{all.length} questions {STAGE_HEAD[stage]}</h2>
        <span className="h-khc-listhead__sort">{hub.scenario ? 'Most asked first' : 'Standard guest questions'}</span>
        <Segmented label="Show" value={filter} onChange={onFilter}
          items={[{ id: 'all', label: `All · ${all.length}` }, { id: 'answered', label: `Answered · ${answered.length}` }, { id: 'gaps', label: `Gaps · ${gaps.length}` }]} />
      </div>
      <KhcQuestions>
        {shown.length === 0 && <p className="h-khc-empty">{filter === 'gaps' ? 'No gaps here: every question in this stage has a full answer.' : 'Nothing here yet.'}</p>}
        {shown.map((q) => (
          <QuestionRow key={q.id} hub={hub} q={q} open={open === q.id} onToggle={() => onOpen(open === q.id ? null : q.id)} channel={channel} onGap={onGap} base={base} edit={edit} onEdit={onEdit} />
        ))}
      </KhcQuestions>
    </>
  )
}

export function QuestionRow({ hub, q, open, onToggle, channel, onGap, base, edit, onEdit }: {
  hub: Hub; q: Question; open: boolean; onToggle: () => void; channel: ListingChannel; onGap: (gapId: string) => void; base: string
  edit: string | null; onEdit: (k: string | null) => void
}) {
  const state: KhcState = hub.cov(q)
  const gapOpen = q.gap && hub.gaps.some((g) => g.id === q.gap)
  return (
    <KhcQuestion id={q.id} state={state} question={q.q} asked={q.asked} line={lineOf(q, hub, channel)} open={open} onToggle={onToggle}>
      {open && <QuestionBody hub={hub} q={q} state={state} channel={channel} gapOpen={!!gapOpen} onGap={onGap} base={base} edit={edit} onEdit={onEdit} />}
    </KhcQuestion>
  )
}

function QuestionBody({ hub, q, state, channel, gapOpen, onGap, base, edit, onEdit }: {
  hub: Hub; q: Question; state: KhcState; channel: ListingChannel; gapOpen: boolean; onGap: (gapId: string) => void; base: string
  edit: string | null; onEdit: (k: string | null) => void
}) {
  const a = answerOf(q, hub, channel)
  const facts = hub.facts(q)
  const [adding, setAdding] = useState(false)
  const from = hub.filled[q.gap ?? ''] ? [...q.from.filter((x) => x !== 'Message history'), 'Your answer'] : q.from
  return (
    <>
      <div className="h-khc-q__block">
        <KhcLabel right={asGuest(channel)}>The answer the AI gives now</KhcLabel>
        <KhcAnswer text={a.text} only={a.only ? { channel: a.only.c, text: a.only.text } : undefined} />
        <KhcProv items={from} />
      </div>
      {state !== 'a' && q.gap && gapOpen && (
        <p className="h-khc-q__gapnote">
          <span>{state === 'n' ? 'Nothing in the Hub answers this yet, so guests get a holding reply.' : 'The answer misses part of what guests ask.'}</span>
          <button type="button" className="h-textlink" onClick={() => onGap(q.gap!)}>{state === 'n' ? 'Add the answer' : 'Complete the answer'}</button>
        </p>
      )}
      <div className="h-khc-q__block h-khc-q__block--facts">
        <KhcLabel right="Edit a fact and the answer follows">{state === 'n' ? 'Related facts' : 'Facts behind this answer'} · {facts.length}</KhcLabel>
        <KhcFacts>
          {facts.map((f, i) => {
            const id = `${q.id}:${f.keys[0]}`
            const others = hub.usedIn(f.keys[0]).filter((x) => x.id !== q.id).length
            return (
              <FactRow key={f.keys.join('+') + i} hub={hub} fact={f} base={base} editing={edit === id} onEdit={(v) => onEdit(v ? id : null)}
                note={others ? `Also used in ${others} other ${others === 1 ? 'answer' : 'answers'}; ${others === 1 ? 'it follows' : 'they all follow'}.` : 'Only this answer uses it.'} />
            )
          })}
          {adding && <AddFact qid={q.id} onDone={() => setAdding(false)} />}
        </KhcFacts>
        {!adding && <p className="h-khc-q__more"><Icon name="plus" /><button type="button" className="h-textlink" onClick={() => setAdding(true)}>Add a fact to this answer</button></p>}
      </div>
    </>
  )
}

/** A fact only this Hub holds (AI replies use it), added right where it's needed. */
function AddFact({ qid, onDone }: { qid: string; onDone: () => void }) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const ok = label.trim() && value.trim()
  const add = () => {
    const key = `kh.c-added-${Date.now()}`
    useStore.getState().sl3Base(key, value.trim())
    useKhc.getState().addFact(qid, key, label.trim())
    onDone()
  }
  return (
    <div className="h-khc-addfact">
      <label className="h-khc-edit__field"><span>What it’s about</span><input className="h-input" autoFocus placeholder="e.g. Buzzer" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
      <label className="h-khc-edit__field"><span>The fact</span><input className="h-input" placeholder="e.g. The buzzer says Silva, top right." value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && ok) add() }} /></label>
      <div className="h-khc-edit__foot"><span className="h-khc-edit__note">Your AI replies use it right away; it’s also listed in Everything A–Z › Custom facts.</span><Button onClick={onDone}>Cancel</Button><Button kind="primary" disabled={!ok} onClick={add}>Add fact</Button></div>
    </div>
  )
}
