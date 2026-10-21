/* Knowledge Hub, reframed · the two primary actions (Antonio, 4 Oct): Add question and Add a fact. They reuse iteration
 * R's drawers and stores (R/Overview.tsx AddQuestionDrawer + useAddedQuestions, R/AddFact.tsx + useRFacts), so what a
 * host adds here also shows in R. Opened from a topic, the topic is fixed; from the overview, it's a dropdown. */
import { useState } from 'react'
import { Button, Dropdown, KqFactRef } from '../../../../ds'
import { AddFact } from '../R/AddFact'
import { AddQuestionDrawer, useAddedQuestions, useQuestionEdits } from '../R/Overview'
import { R_TOPICS, displayRFactValue, topicLabel, type RTopicId } from '../R/data'
import { useRFacts } from '../R/model'

export function AddQuestionButton({ topic }: { topic?: RTopicId }) {
  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState<RTopicId>(topic ?? 'amenities')
  return (
    <>
      <Button kind="primary" icon="plus" onClick={() => setOpen(true)}>Add question</Button>
      {open && (
        <AddQuestionDrawer topic={topicLabel(pick)} onClose={() => setOpen(false)}
          pick={topic ? undefined : (
            <div className="h-khr2-pfield">
              <span className="h-khr2-pfield__label">Topic</span>
              <Dropdown label="Topic" value={pick} options={R_TOPICS.map((t) => ({ value: t.id, label: t.label }))} onChange={(v) => setPick(v as RTopicId)} />
            </div>
          )}
          onAdd={(q, answer) => {
            const id = `added-${Date.now()}`
            useAddedQuestions.getState().add({ id, topic: pick, q })
            if (answer) useQuestionEdits.getState().save(id, { q, answer })
            setOpen(false)
          }} />
      )}
    </>
  )
}

export function AddFactButton({ topic }: { topic?: RTopicId }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button kind="primary" icon="plus" onClick={() => setOpen(true)}>Add a fact</Button>
      {open && <AddFact prefill={{ topic: topic ?? 'amenities', lockTopic: !!topic }} onClose={() => setOpen(false)} onAdd={(f) => useRFacts.getState().add(f)} />}
    </>
  )
}

/** The questions a host added, per topic (answered when they gave an answer). */
export function useAddedQs() {
  const items = useAddedQuestions((s) => s.items)
  const edits = useQuestionEdits((s) => s.items)
  return items.map((x) => ({ ...x, answered: !!edits[x.id]?.answer }))
}

/** The facts a host added, per topic, as rows like the Listing base's. */
export function useAddedFacts() {
  const facts = useRFacts((s) => s.facts)
  return Object.values(facts)
}
export function AddedFactRow({ label, kind, value }: { label: string; kind: Parameters<typeof displayRFactValue>[0]; value: string }) {
  return <KqFactRef kind="confirmed" label={label} value={displayRFactValue(kind, value)} place="Added by you" />
}
