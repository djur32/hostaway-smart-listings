/* Knowledge Hub, reframed · Questions (KH-REFRAME "The Hub's new job" §2): every guest question from the Inbox, grouped
 * by Hostaway's nine Knowledge Hub topics (the real product's accordion, HS-42), counted per channel and over the last
 * 12 months, each marked Answered, Partly answered or Not answered. A row opens the question (list → detail); a
 * question a tip can answer carries the tip indicator, which opens the Tips panel on that tip.
 * review, 4 Oct: the topics are cards (as on Facts); a card opens the topic (`?topic=<id>`), and only there do the
 * All · Needs an answer · Answered tabs show. */
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KqCounts, KqQuestionRow, Pill, QueryTabs, TIP_DOT_HINT, TipDot } from '../../../../ds'
import { useKbState } from '../../../../store/selectors'
import { NAME } from '../../perProperty'
import { useProperty } from '../../../../shell/PropertyLayout'
import { KbEmpty } from '../R/Empty'
import { ROverviewTopicCard, ROverviewTopicGrid } from '../../../../ds/kh-r'
import { topicDesc, topicIcon } from '../R/data'
import { useKQ, type KQ, type QView, type TopicView } from './model'
import { HubFrame, useTipsParam } from './frame'
import { AddQuestionButton, useAddedQs } from './add'

type Show = 'all' | 'open' | 'answered'

export function QuestionsPage() {
  const p = useProperty()
  const kq = useKQ()
  const kb = useKbState()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const added = useAddedQs()
  if (kb !== 'ready') return <HubFrame kq={kq} title="Questions" tips={false}><KbEmpty propertyName={p.name} /></HubFrame>
  const addedIn = (id: string) => added.filter((x) => x.topic === id)
  const active = kq.topics.find((t) => t.id === params.get('topic') && (t.questions.length || addedIn(t.id).length))
  if (active) return <TopicQuestions kq={kq} topic={active} added={addedIn(active.id)} />
  const shown = kq.topics.filter((t) => t.questions.length || addedIn(t.id).length)
  // one count, the sum of the cards below (review, 4 Oct): no conversations, no period
  const total = shown.reduce((s, t) => s + t.questions.length + addedIn(t.id).length, 0)
  return (
    <HubFrame kq={kq} title="Questions" test lead={`${total} ${total === 1 ? 'question' : 'questions'}`} add={<AddQuestionButton />}>
      <ROverviewTopicGrid>
        {shown.map((t) => {
          const n = t.questions.length + addedIn(t.id).length
          const need = t.questions.filter((x) => x.state !== 'a').length + addedIn(t.id).filter((x) => !x.answered).length
          return (
            <ROverviewTopicCard key={t.id} icon={topicIcon(t.id)} label={t.label} count={n} desc={topicDesc(t.id)}
              meta={<>{n} {n === 1 ? 'question' : 'questions'}</>}
              chip={need ? <Pill kind="warning">{need} {need === 1 ? 'needs' : 'need'} an answer</Pill> : undefined}
              onClick={() => nav(`/property/${kq.pid}/hub/questions?topic=${t.id}`)} />
          )
        })}
      </ROverviewTopicGrid>
    </HubFrame>
  )
}

function TopicQuestions({ kq, topic, added }: { kq: KQ; topic: TopicView; added: ReturnType<typeof useAddedQs> }) {
  const nav = useNavigate()
  const tp = useTipsParam()
  const [params] = useSearchParams()
  const show: Show = params.get('show') === 'open' ? 'open' : params.get('show') === 'answered' ? 'answered' : 'all'
  const q$ = (v: Show) => { const n = new URLSearchParams(params); if (v === 'all') n.delete('show'); else n.set('show', v); return `?${n}` }
  const all = topic.questions.length + added.length
  const open = topic.questions.filter((x) => x.state !== 'a').length + added.filter((x) => !x.answered).length
  const tabs = (
    <QueryTabs active={show} items={[
      { id: 'all', label: 'All', to: q$('all'), count: all },
      { id: 'open', label: 'Needs an answer', to: q$('open'), count: open },
      { id: 'answered', label: 'Answered', to: q$('answered'), count: all - open },
    ]} />
  )
  const keep = (x: QView) => (show === 'all' ? true : show === 'open' ? x.state !== 'a' : x.state === 'a')
  const shown = topic.questions.filter(keep)
  const mine = added.filter((x) => (show === 'all' ? true : show === 'open' ? !x.answered : x.answered))
  return (
    <HubFrame kq={kq} title={topic.label} desc={topicDesc(topic.id)} tabs={tabs} test add={<AddQuestionButton topic={topic.id} />} back={{ to: `/property/${kq.pid}/hub/questions${tp.keep()}`, label: 'Back to Questions' }}>
      {!shown.length && !mine.length ? <p className="h-kq-empty h-kq-topicbody">{show === 'open' ? 'Every question here has an answer the AI can back.' : 'Nothing here yet.'}</p> : (
        <div className="h-khr2-table h-kq-qtable">
          {shown.map((x) => {
            const tipId = x.tip?.status === 'open' ? x.tip.def.id : undefined
            return (
              <KqQuestionRow key={x.id} state={x.state} question={x.label}
                meta={<KqCounts total={x.stat.total} parts={kq.chs.map((c) => ({ label: NAME(c), n: x.stat.by[c] }))} />}
                badge={x.stat.isNew ? <Pill kind="new">New this month</Pill> : x.stat.rising ? <Pill>{x.stat.thisMonth} this month</Pill> : undefined}
                tip={tipId ? <TipDot active={tp.focusId === tipId} hint={TIP_DOT_HINT} onClick={() => (tp.focusId === tipId ? tp.close() : tp.openTip(tipId))} /> : undefined}
                active={!!tipId && tp.focusId === tipId}
                onOpen={() => nav(`/property/${kq.pid}/hub/questions/${x.id}${tp.keep()}`)} />
            )
          })}
          {mine.map((x) => (
            <KqQuestionRow key={x.id} state={x.answered ? 'a' : 'n'} question={x.q} meta="Added by you"
              onOpen={() => undefined} />
          ))}
        </div>
      )}
    </HubFrame>
  )
}
