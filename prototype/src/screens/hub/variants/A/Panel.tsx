/* KH-A · the side panel: Ask the AI (channel-aware test answers with citations that tint the cells they used) and Sources. */
import { useState } from 'react'
import {
  CloseButton, Icon, KhaAnswer, KhaBubble, KhaChannelSelect, KhaFactRow, KhaPanel, KhaSource, KhaSourceChip, Segmented, cx,
} from '../../../../ds'
import type { ChannelId } from '../../../../data/types'
import type { ListingChannel } from '../../../../data/sl3'
import { NAME, matchQuestion, questionsFor, sourcesFor, type Answer, type Fact } from './model'
import { useHubPid, useListingChannels } from '../../perProperty'

export type PanelTab = 'ask' | 'sources'
interface Props {
  tab: PanelTab
  setTab: (t: PanelTab) => void
  onClose: () => void
  ch: ListingChannel
  setCh: (c: ListingChannel) => void
  qid: string | null
  setQid: (q: string | null) => void
  ans: Answer | null
  onFact: (f: Fact) => void
  onFix: (f: Fact) => void
}

export function HubAPanel({ tab, setTab, onClose, ch, setCh, qid, setQid, ans, onFact, onFix }: Props) {
  const pid = useHubPid()
  const CHS = useListingChannels()
  const SOURCES = sourcesFor(pid)
  const QUESTIONS = questionsFor(pid)
  const [text, setText] = useState('')
  const [miss, setMiss] = useState<string | null>(null)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const ask = (t: string) => { const id = matchQuestion(t); setVote(null); if (id) { setQid(id); setMiss(null) } else { setQid(null); setMiss(t) } setText('') }
  const others = QUESTIONS.filter((x) => x.id !== qid)
  const head = (
    <>
      <Segmented label="Panel" value={tab} onChange={setTab} items={[
        { id: 'ask', label: <><Icon name="sparkles" size={16} />Ask the AI</> },
        { id: 'sources', label: <><Icon name="stack-2" size={16} />Sources · {SOURCES.length}</> },
      ]} />
      <CloseButton className="kha-pop__x" label="Close panel" onClick={onClose} />
    </>
  )
  if (tab === 'sources') return (
    <KhaPanel head={head}>
      <p className="kha-panel__lead">What the Hub was built from. Your AI reads the Hub first, then these.</p>
      <div className="kha-sources">{SOURCES.map((s) => <KhaSource key={s.title} icon={s.icon} title={s.title} sub={s.sub} meta={<>{s.meta}<br />{s.facts} facts</>} />)}</div>
      <button type="button" className="h-textlink kha-panel__add"><Icon name="plus" size={16} />Add a source</button>
    </KhaPanel>
  )
  return (
    <KhaPanel head={head} foot={
      <>
        <form className="kha-askinput" onSubmit={(e) => { e.preventDefault(); if (text.trim()) ask(text) }}>
          <input className="h-input" placeholder="Ask what a guest might ask…" aria-label="Ask what a guest might ask" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="kha-askinput__send" aria-label="Ask"><Icon name="send" /></button>
        </form>
      </>
    }>
      <p className="kha-panel__lead">Test how the AI answers a guest, using this Hub.</p>
      <div className="kha-askch"><span>Guest books on</span><KhaChannelSelect label="Guest books on" value={ch} options={CHS} onChange={(c: ChannelId) => setCh(c as ListingChannel)} /></div>
      {miss && (
        <>
          <KhaBubble>{miss}</KhaBubble>
          <div className="kha-answer"><span className="kha-answer__title"><Icon name="sparkles" size={16} />Answer</span><p className="kha-answer__line"><span>I couldn’t find this in the Hub, so I’d ask you before replying. Add it in More facts and I’ll use it.</span></p></div>
        </>
      )}
      {ans && (
        <>
          <KhaBubble>{ans.q}</KhaBubble>
          <KhaAnswer sentences={ans.sentences} />
          <div className="kha-facts">
            <span className="kha-facts__label">Facts used · {ans.facts.length}</span>
            {ans.facts.map((f) => (
              <KhaFactRow key={f.n} n={f.n} label={f.label} onClick={() => onFact(f)}
                value={f.state === 'amenity' ? `${NAME(f.col)} ${f.src === 'listed' ? 'lists it' : 'doesn’t list it'}` : `${f.value} · ${f.src === 'own' ? `${NAME(f.col)} has its own` : f.src === 'set' ? `set by ${NAME(f.col)}` : f.src === 'listed' ? `listed on ${NAME(f.col)}` : f.src === 'unlisted' ? `not listed on ${NAME(f.col)}` : `${NAME(f.col)} uses the Base`}`}
                chip={<KhaSourceChip kind={f.src} channel={f.col} />} />
            ))}
          </div>
          {ans.note && <p className="kha-note"><Icon name="info-circle" size={16} />{ans.note}</p>}
          <div className="kha-vote">
            <button type="button" className={cx('kha-vote__btn', vote === 'up' && 'is-on')} aria-pressed={vote === 'up'} aria-label="Good answer" onClick={() => setVote(vote === 'up' ? null : 'up')}><Icon name="thumb-up" /></button>
            <button type="button" className={cx('kha-vote__btn', vote === 'down' && 'is-on')} aria-pressed={vote === 'down'} aria-label="Bad answer" onClick={() => setVote(vote === 'down' ? null : 'down')}><Icon name="thumb-down" /></button>
            <span className="kha-vote__spacer" />
            <button type="button" className="h-textlink" onClick={() => onFix(ans.facts[0])}>Fix a fact</button>
          </div>
        </>
      )}
      <div className="kha-suggest" aria-label="Try another question">
        <span className="kha-facts__label">Try another question</span>
        {others.map((x) => <button key={x.id} type="button" className="kha-suggest__q" onClick={() => ask(x.q)}>{x.q}</button>)}
      </div>
    </KhaPanel>
  )
}
