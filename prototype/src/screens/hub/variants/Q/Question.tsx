/* Knowledge Hub, reframed · one question (list → detail). How the AI answers it, faithfully: the reply guests get, and
 * every fact it read, by reference (a link to the Listing base field, never a copy) -; when nothing backs it, the note
 * that the AI said it would check and asked you, with the tip that fixes it; how often guests asked, per channel and
 * per month; and the conversations behind it. */
import { Link, Navigate } from 'react-router-dom'
import { KhcStatePill, KhrAnswer, KqConversation, KqFactRef, KqHold, KqReceipt, PerfCard, PerfChart, PerfKpi, PerfKpis } from '../../../../ds'
import { channelList } from '../../../../data/channels'
import { NAME } from '../../perProperty'
import { topicLabel } from '../R/data'
import { MONTHS, THIS_MONTH } from './data'
import { fieldLabel, fieldPath, fieldPlace, monthName, replyText, useKQ } from './model'
import { HubFrame, useTipsParam } from './frame'
import { TipButton } from './Tips'

export function QuestionPage({ id }: { id: string }) {
  const kq = useKQ()
  const tp = useTipsParam()
  const x = kq.question(id)
  const base = `/property/${kq.pid}`
  if (!x) return <Navigate replace to={`${base}/hub/questions`} />
  const tip = x.tip
  const lines = [...x.answer.lines, ...(x.answer.hold ? [x.answer.hold] : [])]
  const s = x.stat
  const where = tip?.status === 'accepted' && !tip.def.amenity ? (tip.where === 'base' || !tip.where ? `${fieldPlace(tip.def.field)} › ${fieldLabel(tip.def.field)}` : `${NAME(tip.where)}’s listing › ${fieldLabel(tip.def.field)}`) : 'Listing base · Amenities'
  return (
    <HubFrame kq={kq} title={x.label} back={{ to: `${base}/hub/questions?topic=${x.topic}${tp.keep().replace('?', '&')}`, label: `Back to ${topicLabel(x.topic)}` }}>
      <p className="h-kq-qhead"><KhcStatePill state={x.state} /><span>{topicLabel(x.topic)}</span>{s.total > 0 && <span>Asked {s.total} {s.total === 1 ? 'time' : 'times'} in the last 12 months</span>}</p>

      <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">How the AI answers</h2></div>
      <div className="h-kq-card">
        <div className="h-kq-card__body">
          <div className="h-kq-answer"><KhrAnswer lines={lines} only={x.answer.only ? { channel: x.answer.only.c, text: x.answer.only.text } : undefined} /></div>
          {x.state !== 'a' && (
            <KqHold action={tip?.status === 'open' ? <TipButton onClick={() => (tp.focusId === tip.def.id ? tp.close() : tp.openTip(tip.def.id))} /> : undefined}>
              {tip ? tip.def.missing : 'Nothing in the Listing base backs the whole answer.'} So the AI tells guests it’ll check, and asks you{tip?.status === 'open' ? '. A tip adds the answer to the Listing base.' : '.'}
            </KqHold>
          )}
          {tip?.status === 'accepted' && (
            <KqReceipt to={tip.def.amenity ? `${base}/details/amenities` : tip.where === 'base' ? fieldPath(kq.pid, tip.def.field) : undefined} linkLabel="Open field">
              Answered from {where}{tip.sent?.length ? `, sent to ${channelList(tip.sent)}` : ''}.
            </KqReceipt>
          )}
        </div>
        <div className="h-kq-card__refs">
          <p className="h-kq-card__label">What the AI reads</p>
          {x.refs.length ? x.refs.map((r) => <KqFactRef key={r.key} kind={r.kind} label={r.label} value={r.value} place={r.place} to={r.to} />)
            : <p className="h-kq-empty h-kq-card__none">Nothing in the Listing base answers it yet.</p>}
        </div>
      </div>

      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">{s.total ? `Asked ${s.total} ${s.total === 1 ? 'time' : 'times'}` : 'Not asked yet'}</h2>
        {s.total > 0 && <span className="h-khr2-sechead__aside">Last 12 months</span>}
      </div>
      {s.total ? (
        <div className="h-kq-stack">
          <PerfKpis label="Asks per channel">
            {kq.chs.map((c) => <PerfKpi key={c} label={NAME(c)} value={String(s.by[c])} foot={`${Math.round((s.by[c] / s.total) * 100)}% of asks`} muted={!s.by[c]} />)}
          </PerfKpis>
          <PerfCard title="Over time" definition={s.isNew ? `First asked in ${monthName(THIS_MONTH)}.` : s.rising ? `${s.thisMonth} asks in ${monthName(THIS_MONTH)}, more than usual.` : 'Asks per month.'}>
            <PerfChart kind="bar" labels={[...MONTHS]} values={s.months} split={0} afterName="Asks" fmt={(v) => (Number.isInteger(v) ? String(v) : "")} aria={`Asks per month for “${x.label}”`} />
          </PerfCard>
        </div>
      ) : <p className="h-kq-empty">Guests usually ask this. Counts and conversations appear once they message you.</p>}

      {x.convos.length > 0 && (
        <>
          <div className="h-khr2-sechead">
            <h2 className="h-khr2-sechead__title">Conversations</h2>
            <Link className="h-textlink h-khr2-sechead__right" to="/inbox">Open Inbox</Link>
          </div>
          <div className="h-khr2-table">
            {x.convos.map((c, i) => <KqConversation key={i} guest={c.guest} channel={NAME(c.c)} when={monthName(c.month)} text={c.text} reply={replyText(c.reply, kq.host)} />)}
          </div>
          {s.total > x.convos.length && <p className="h-khr2-pfield__help h-kq-more">And {s.total - x.convos.length} more {s.total - x.convos.length === 1 ? 'conversation' : 'conversations'} in your Inbox.</p>}
        </>
      )}
    </HubFrame>
  )
}
