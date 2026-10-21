/* KH-R · Test, replaces "Ask the AI" (ref 07, concepts/knowledge-hub/R-BRIEF.md "Agent 2 — R-workflows"). Type a guest
 * question → one listing-wide answer (never "answer as {channel}": resolved silently through the property's primary
 * channel, chs[0]) → the facts it used, quoted ("Referenced sources") → a few it didn't need ("Other sources searched
 * over") → "Edit knowledge". Matching is the same bag-of-words idea as KH-C's old ask box (C.tsx `match()`), reused via
 * `bestMatch` (./workflows-data) — canned, not a real model (R-BRIEF: "the point is the UI pattern").
 * Mounted/unmounted by someone else's R.tsx; this file owns its own drawer (DetailsDrawer), so it works wherever
 * it's dropped. Available from Overview and every category page per the brief — the trigger button lives in R.tsx. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DetailsDrawer, Empty, KhrAnswer, KhrAsk, KhrSourceRow } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { useProperty } from '../../../../shell/PropertyLayout'
import { useListingChannels } from '../../perProperty'
import { answerOf, useHub, type Hub } from '../C/model'
import type { FactRef } from '../C/data'
import { bestMatch } from './workflows-data'
import { topicOf } from './data'

const MASK = '••••••••••'

/** "Edit knowledge" for the matched question's fact: its topic's accordion section when the question maps to one
 *  (R/data.ts's QUESTION_TOPIC, the same map the Overview's gaps use), else the Hub's Overview. */
function factEditPath(pid: string, qid?: string): string {
  const topic = qid ? topicOf(qid) : undefined
  return topic ? `/property/${pid}/hub/${topic}` : `/property/${pid}/hub`
}

function factLabel(key: string, hub: Hub): string {
  if (key.startsWith('amenity:')) return key.slice(8)
  if (key === 'policy:cancel') return 'Cancellation policy'
  if (key === 'policy:instant') return 'Instant booking'
  return hub.item(key)?.label ?? key
}
function factValue(key: string, hub: Hub, c: ListingChannel, masked?: boolean): string | undefined {
  if (masked) return MASK
  if (key.startsWith('amenity:')) return hub.r.on(key, c) ? 'Listed' : 'Not listed'
  if (key.startsWith('policy:')) return undefined
  return hub.r.v(key, c) || undefined
}
function factRow(fr: FactRef, hub: Hub, c: ListingChannel): { key: string; label: string; quote?: string } {
  const label = fr.label ?? factLabel(fr.keys[0], hub)
  const vals = fr.keys.map((k) => factValue(k, hub, c, fr.mask?.includes(k)))
  const text = fr.fmt ? fr.fmt(vals.map((v) => v ?? '')) : vals.filter(Boolean).join(' · ')
  return { key: fr.keys[0], label, quote: text || undefined }
}

function useTest() {
  const p = useProperty()
  const navigate = useNavigate()
  const hub = useHub()
  const chs = useListingChannels()
  const primary: ListingChannel = chs[0] ?? 'airbnb'
  const [query, setQuery] = useState('')
  const [asked, setAsked] = useState('')
  const ask = () => setAsked(query.trim())
  const reset = () => { setQuery(''); setAsked('') }
  const matched = useMemo(() => (asked ? bestMatch(asked, hub.questions, (q) => `${q.q} ${q.kw ?? ''}`, 0.34, (q) => q.asked ?? 0)?.item : undefined), [asked, hub.questions])
  // a.text is every channel's answer; a.only is a sentence just one channel's guests get (e.g. Airbnb's checkout
  // tasks) — shown labelled, not folded into the plain lines, so it never reads as the general answer (1 Oct).
  const answer = useMemo(() => (matched ? answerOf(matched, hub, primary) : undefined), [matched, hub, primary])
  const lines = answer?.text ?? []
  const only = answer?.only && answer.only.c === primary ? { channel: answer.only.c, text: answer.only.text } : undefined
  const referenced = useMemo(() => (matched ? hub.facts(matched).map((fr) => factRow(fr, hub, primary)) : []), [matched, hub, primary])
  const others = useMemo(() => {
    if (!matched || !referenced.length) return []
    const used = new Set(referenced.map((f) => f.key))
    const section = hub.item(referenced[0].key)?.section
    return section ? hub.items.filter((i) => i.section === section && !used.has(i.key)).slice(0, 3) : []
  }, [matched, referenced, hub])
  const edit = () => navigate(factEditPath(p.id, matched?.id))
  return { query, setQuery, asked, ask, reset, matched, lines, only, referenced, others, edit }
}

function TestContent({ t, plain }: { t: ReturnType<typeof useTest>; plain?: boolean }) {
  const { query, setQuery, asked, ask, matched, lines, only, referenced, others } = t
  return (
    <>
      <p className="h-khc-panel__intro">Ask a question the way a guest might. The answer is built from this listing’s Knowledge Hub. One answer, not one per channel.</p>
      <KhrAsk value={query} onChange={setQuery} onSubmit={ask} placeholder="Ask anything a guest might" plain={plain} autoFocus={plain} />
      {asked && (matched ? (
        <>
          <div><p className="h-khr-sim__label">Response</p><KhrAnswer lines={lines} only={only} /></div>
          {referenced.length > 0 && (
            <div>
              <p className="h-khr-sim__label">Referenced sources</p>
              {referenced.map((f) => <KhrSourceRow key={f.key} icon="file-text" label={f.label} quote={f.quote} />)}
            </div>
          )}
          {others.length > 0 && (
            <div>
              <p className="h-khr-sim__label">Other sources searched over</p>
              {others.map((f) => <KhrSourceRow key={f.key} icon="file-text" label={f.label} />)}
            </div>
          )}
        </>
      ) : (
        <Empty title="Nothing in the Hub answers this yet" icon="search">
          <p>Try different words, or add it as a fact so the AI can answer it next time.</p>
        </Empty>
      ))}
    </>
  )
}

/** Test, from a topic page's tab bar (Antonio, 3 Oct: "instead of Ask a question, just say Test", in a drawer like
 *  Add question / Add a fact, available from Questions and Facts; no sparkles, no purple). "Ask another question"
 *  clears the box and the answer so the host can try a different one. */
export function TestDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTest()
  return (
    <DetailsDrawer open={open} title="Test" onClose={onClose}
      footer={<>
        <Button className="h-khr2-foot-left" disabled={!t.asked && !t.query} onClick={t.reset}>Ask another question</Button>
        <Button kind="primary" disabled={!t.matched} onClick={() => { t.edit(); onClose() }}>Edit knowledge</Button>
      </>}>
      <div className="h-khr2-drawer h-khr2-test">
        <TestContent t={t} plain />
      </div>
    </DetailsDrawer>
  )
}
