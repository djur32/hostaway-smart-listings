/* Knowledge Hub, reframed · Test: the "Ask the AI" preview, made faithful (KH-REFRAME §3). Ask the way a guest would, or
 * pick one of the questions guests ask most (the real product lists typical questions the same way, HS-L08); the answer
 * is the one guests get, built only from Listing base facts and answers the host confirmed, with each fact it used
 * shown by reference. When nothing backs (part of) the answer, the preview says so: the AI tells the guest it'll check,
 * and asks the host. It never guesses. Matching is the same bag-of-words as before (R/workflows-data bestMatch) -
 * canned, not a real model. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DetailsDrawer, Icon, KhrAnswer, KhrAsk, KqFactRef, KqHold } from '../../../../ds'
import { bestMatch } from '../R/workflows-data'
import type { KQ, QView } from './model'

/** The typical questions offered first: Hostaway's own "Ask the AI" set (check-in, checkout, keys, parking, access,
 *  Wi-Fi, smoking, recycling, damage), where this property's guests asked them. */
const TYPICAL = ['a-time', 'c-time', 'c-keys', 'ar-parking', 's-access', 'a-wifi', 's-smoke', 's-trash', 's-broken', 'a-in', 'a-address', 's-rules', 'ar-around']

export function TestDrawer({ kq, open, onClose }: { kq: KQ; open: boolean; onClose: () => void }) {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [asked, setAsked] = useState('')
  const match = useMemo(() => (asked ? bestMatch(asked, kq.questions, (x) => `${x.label} ${x.q.kw ?? ''}`, 0.34, (x) => x.stat.total)?.item : undefined), [asked, kq.questions])
  const typical = TYPICAL.map((id) => kq.question(id)).filter((x): x is QView => !!x).slice(0, 8)
  const reset = () => { setQuery(''); setAsked('') }
  const run = (text: string) => { setQuery(text); setAsked(text.trim()) }
  return (
    <DetailsDrawer open={open} title="Test" onClose={() => { reset(); onClose() }}
      footer={<>
        <Button className="h-khr2-foot-left" disabled={!asked && !query} onClick={reset}>Ask another question</Button>
        <Button kind="primary" disabled={!match} onClick={() => { if (match) { nav(`/property/${kq.pid}/hub/questions/${match.id}`); reset(); onClose() } }}>Open question</Button>
      </>}>
      <div className="h-khr2-drawer h-kq-test">
        <p className="h-khc-panel__intro">Ask a question the way a guest would. The AI answers only from the Listing base and the answers you confirmed. When nothing backs an answer, it says so and asks you.</p>
        <KhrAsk value={query} onChange={setQuery} onSubmit={() => setAsked(query.trim())} placeholder="Ask anything a guest might" plain autoFocus />
        {!asked && typical.length > 0 && (
          <div>
            <p className="h-khr-sim__label">Questions guests ask</p>
            <div className="h-kq-test__examples">
              {typical.map((x) => <button key={x.id} type="button" className="h-kq-test__example" onClick={() => run(x.label)}><Icon name="message-circle" size={16} />{x.label}</button>)}
            </div>
          </div>
        )}
        {asked && (match ? <Result kq={kq} x={match} /> : (
          <>
            <div><p className="h-khr-sim__label">The AI’s reply</p><div className="h-kq-answer"><KhrAnswer lines={[`I’m not sure, so I’ve asked ${kq.host} and will get back to you.`]} /></div></div>
            <KqHold>Nothing in the Listing base or your confirmed answers covers this, so the AI doesn’t guess: it tells the guest it’ll check, and asks you. Once guests ask it, it shows in Questions as not answered.</KqHold>
          </>
        ))}
      </div>
    </DetailsDrawer>
  )
}

function Result({ kq, x }: { kq: KQ; x: QView }) {
  const lines = [...x.answer.lines, ...(x.answer.hold ? [x.answer.hold] : [])]
  return (
    <>
      <div>
        <p className="h-khr-sim__label">The AI’s reply</p>
        <div className="h-kq-answer"><KhrAnswer lines={lines} only={x.answer.only ? { channel: x.answer.only.c, text: x.answer.only.text } : undefined} /></div>
      </div>
      {x.state !== 'a' && <KqHold>{x.tip ? x.tip.def.missing : 'Nothing in the Listing base backs the whole answer.'} So the AI says it’ll check and asks you.</KqHold>}
      <div>
        <p className="h-khr-sim__label">{x.refs.length ? 'What it read' : 'What it read: nothing yet'}</p>
        {x.refs.length > 0 && (
          <div className="h-kq-test__refs">
            {x.refs.map((r) => <KqFactRef key={r.key} kind={r.kind} label={r.label} value={r.value} place={r.place} to={r.to} />)}
          </div>
        )}
      </div>
      {kq.scenario && <p className="h-khr2-pfield__help">Matched to “{x.label}”{x.stat.total ? `, asked ${x.stat.total} times` : ''}.</p>}
    </>
  )
}
