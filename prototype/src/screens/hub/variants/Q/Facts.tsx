/* Knowledge Hub, reframed · Facts (KH-REFRAME §1, "Facts are read, not copied"): what the AI can read to answer guests,
 * by Hostaway's nine topics, each one a reference to where it lives ("Listing base · Location", a link to that field),
 * never a second copy and never edited here. Answers the host confirmed (no Listing base field holds them) say so.
 * the topics are clustered as cards (iteration R's topic grid); a card opens that topic's full view.
 * `?topic=<id>` (old /hub/<topic> links, Canvas's "Open in Knowledge Hub") opens that topic directly. */
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KqFactRef, Pill } from '../../../../ds'
import { ROverviewTopicCard, ROverviewTopicGrid } from '../../../../ds/kh-r'
import { topicDesc, topicIcon } from '../R/data'
import { factsByTopic, useKQ, type KQ } from './model'
import { HubFrame } from './frame'
import { AddFactButton, AddedFactRow, useAddedFacts } from './add'

/** open tips that answer a question in this topic: the topic card's chip */
const tipsIn = (kq: KQ, id: string) => new Set(kq.topics.find((t) => t.id === id)?.questions.flatMap((x) => (x.tip?.status === 'open' ? [x.tip.def.id] : [])) ?? []).size

export function FactsPage() {
  const kq = useKQ()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const added = useAddedFacts()
  const addedIn = (id: string) => added.filter((f) => f.topic === id)
  const topics = factsByTopic(kq).filter((t) => t.refs.length || addedIn(t.id).length)
  const active = topics.find((t) => t.id === params.get('topic'))
  if (active) {
    const mine = addedIn(active.id)
    const n = active.refs.length + mine.length
    return (
      <HubFrame kq={kq} title={active.label} test back={{ to: `/property/${kq.pid}/hub/facts`, label: 'Back to Facts' }}
        desc={topicDesc(active.id)} add={<AddFactButton topic={active.id} />}>
        <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">{n} {n === 1 ? 'fact' : 'facts'}</h2></div>
        <div className="h-khr2-table">
          {active.refs.map((r) => (
            <KqFactRef key={r.key} kind={r.kind} label={r.label} value={r.value} place={r.place} to={r.to}
              meta={r.used ? `used in ${r.used} ${r.used === 1 ? 'answer' : 'answers'}` : undefined} />
          ))}
          {mine.map((f) => <AddedFactRow key={f.id} label={f.label} kind={f.kind} value={f.value} />)}
        </div>
      </HubFrame>
    )
  }
  const base = topics.reduce((s, t) => s + t.refs.filter((r) => r.kind === 'base').length, 0)
  const confirmed = new Set(topics.flatMap((t) => t.refs.filter((r) => r.kind === 'confirmed').map((r) => r.key))).size
  return (
    <HubFrame kq={kq} title="Facts" test add={<AddFactButton />}
      desc="What the AI reads to answer guests. Listing details live once, in the Listing base.">
      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">{base} facts from the Listing base{confirmed ? `, ${confirmed} answers you confirmed` : ''}{added.length ? `, ${added.length} you added` : ''}</h2>
      </div>
      <ROverviewTopicGrid>
        {topics.map((t) => (
          <ROverviewTopicCard key={t.id} icon={topicIcon(t.id)} label={t.label} count={t.refs.length + addedIn(t.id).length} desc={topicDesc(t.id)}
            chip={tipsIn(kq, t.id) ? <Pill kind="ai">{tipsIn(kq, t.id)} {tipsIn(kq, t.id) === 1 ? 'tip' : 'tips'}</Pill> : undefined}
            onClick={() => nav(`/property/${kq.pid}/hub/facts?topic=${t.id}`)} />
        ))}
      </ROverviewTopicGrid>
    </HubFrame>
  )
}
