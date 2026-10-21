/* Knowledge Hub, reframed · Insights (KH-REFRAME §4): what guests ask most, what's new this month, and what one
 * channel's guests ask more than another's — so Hostaway, and the host, learn from the Inbox. Built on Smart Listings ›
 * Performance's own pieces (PerfKpis, PerfCard, PerfChart, BarMultiple), one chart per card. An insight a tip can act on
 * carries that tip. */
import { Link } from 'react-router-dom'
import { BarMultiple, Button, KqInsight, PerfCard, PerfChart, PerfKpi, PerfKpis } from '../../../../ds'
import { channelList } from '../../../../data/channels'
import { useKbState } from '../../../../store/selectors'
import { useProperty } from '../../../../shell/PropertyLayout'
import { NAME } from '../../perProperty'
import { KbEmpty } from '../R/Empty'
import { conversationsOf, MONTHS, THIS_MONTH } from './data'
import { channelDiffs, monthName, useKQ, type KQ, type QView } from './model'
import { HubFrame, useTipsParam } from './frame'

export function InsightsPage() {
  const kq = useKQ()
  const p = useProperty()
  const kb = useKbState()
  const desc = 'What guests ask, what’s new and how each channel’s guests differ, from your Inbox.'
  if (kb !== 'ready') return <HubFrame kq={kq} title="Insights" tips={false}><KbEmpty propertyName={p.name} /></HubFrame>
  return (
    <HubFrame kq={kq} title="Insights" desc={desc} tips={false}>
      {kq.total ? <Body kq={kq} /> : <p className="h-kq-empty">Insights appear once guests ask questions in your Inbox. Until then, Questions lists the ones guests usually ask.</p>}
    </HubFrame>
  )
}

function Body({ kq }: { kq: KQ }) {
  const tp = useTipsParam()
  const base = `/property/${kq.pid}`
  const qLink = (x: QView) => `${base}/hub/questions/${x.id}${tp.keep()}`
  const conv = conversationsOf(kq.chs)
  const conversations = kq.chs.reduce((s, c) => s + conv[c], 0)
  const answeredAsks = kq.questions.filter((x) => x.state === 'a').reduce((s, x) => s + x.stat.total, 0)
  const open = kq.questions.filter((x) => x.state !== 'a')
  const openAsks = open.reduce((s, x) => s + x.stat.total, 0)
  const pendingTips = kq.tips.filter((t) => t.status === 'open').length
  const now = kq.months[THIS_MONTH], last = kq.months[THIS_MONTH - 1]
  const topics = [...kq.topics].filter((t) => t.asks > 0).sort((a, b) => b.asks - a.asks)
  const fresh = kq.questions.filter((x) => x.stat.isNew || x.stat.rising).sort((a, b) => Number(b.stat.isNew) - Number(a.stat.isNew) || b.stat.thisMonth - a.stat.thisMonth)
  const diffs = channelDiffs(kq, conv)
  const top = [...kq.questions].sort((a, b) => b.stat.total - a.stat.total).slice(0, 5)
  const tipAction = (x: QView) => (x.tip?.status === 'open' ? <Button kind="ai" icon="sparkles" onClick={() => tp.openTip(x.tip!.def.id)}>See tip</Button> : null)
  const seeQ = (x: QView) => <Link className="h-textlink" to={qLink(x)}>See question</Link>
  return (
    <>
      <PerfKpis label="Questions, last 12 months">
        <PerfKpi label="Questions asked" value={String(kq.total)} foot={`From ${conversations} conversations`} />
        <PerfKpi label={`In ${monthName(THIS_MONTH)}`} value={String(now)} foot={`${last} in ${monthName(THIS_MONTH - 1)}`} />
        <PerfKpi label="Answered by the AI" value={`${Math.round((answeredAsks / kq.total) * 100)}%`} foot="Of every question asked" />
        <PerfKpi label="Need an answer" value={String(open.length)} foot={`${openAsks} asks${pendingTips ? ` · ${pendingTips} ${pendingTips === 1 ? 'tip' : 'tips'}` : ''}`} />
      </PerfKpis>

      <div className="h-kq-grid h-kq-gap">
        <PerfCard title="Questions over time" definition="Every question guests asked, per month.">
          <PerfChart kind="bar" labels={[...MONTHS]} values={kq.months} split={0} afterName="Questions" fmt={(v) => String(Math.round(v))} aria="Questions guests asked per month, last 12 months" />
        </PerfCard>
        <PerfCard title="What guests ask most" definition="Questions per topic, last 12 months.">
          <div className="h-kq-bars">
            <BarMultiple title="Asks per topic" rows={topics.map((t) => ({ key: t.id, label: t.label, value: t.asks, display: String(t.asks), tone: 'current' as const, title: `${t.label}: ${t.asks} asks` }))} />
          </div>
        </PerfCard>
      </div>

      {fresh.length > 0 && (
        <>
          <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">New in {monthName(THIS_MONTH)}</h2></div>
          <div className="h-khr2-table">
            {fresh.map((x) => (
              <KqInsight key={x.id} icon={x.stat.isNew ? 'sparkles' : 'trending-up'}
                title={x.stat.isNew ? <>“{x.label}” is new: {x.stat.thisMonth} guests asked it this month</> : <>“{x.label}”: {x.stat.thisMonth} asks this month, about {Math.max(1, Math.round((x.stat.months[8] + x.stat.months[9] + x.stat.months[10]) / 3))} a month before</>}
                line={x.state === 'a' ? `Answered from ${x.refs.filter((r) => r.kind === 'base').map((r) => r.label).join(', ') || 'your confirmed answers'}.` : x.tip ? x.tip.def.missing : 'Not answered yet.'}
                action={<>{tipAction(x)}{seeQ(x)}</>} />
            ))}
          </div>
        </>
      )}

      {diffs.length > 0 && (
        <>
          <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">By channel</h2><span className="h-khr2-sechead__aside">Per conversation on each channel</span></div>
          <div className="h-khr2-table">
            {diffs.map((d) => {
              const asking = kq.chs.filter((c) => d.q.stat.by[c] > 0)
              const title = d.zero.length
                ? <>Only {channelList(asking)} guests ask “{d.q.label}”</>
                : <>{NAME(d.hi)} guests ask “{d.q.label}” {Math.round(d.ratio)}× as often as {NAME(d.lo)} guests</>
              const amenityHint = d.zero.length && d.q.tip?.def.amenity && d.zero.every((c) => kq.hub.amenityOn(d.q.tip!.def.amenity!, c)) ? ` ${channelList(d.zero)} already lists it.` : ''
              const line = `${kq.chs.map((c) => `${NAME(c)} ${d.q.stat.by[c]} of ${conv[c]}`).join(' · ')} conversations.${amenityHint}`
              return <KqInsight key={d.q.id} icon="arrows-diff" title={title} line={line} action={<>{tipAction(d.q)}{seeQ(d.q)}</>} />
            })}
          </div>
        </>
      )}

      <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">Most asked</h2><Link className="h-textlink h-khr2-sechead__right" to={`${base}/hub/questions${tp.keep()}`}>All questions</Link></div>
      <div className="h-khr2-table">
        {top.map((x) => (
          <KqInsight key={x.id} icon="message-circle" title={<>“{x.label}”</>}
            line={`${x.stat.total} asks · ${kq.chs.filter((c) => x.stat.by[c]).map((c) => `${NAME(c)} ${x.stat.by[c]}`).join(' · ')} · ${x.state === 'a' ? 'Answered' : x.state === 'p' ? 'Partly answered' : 'Not answered'}`}
            action={<>{tipAction(x)}{seeQ(x)}</>} />
        ))}
      </div>
    </>
  )
}
