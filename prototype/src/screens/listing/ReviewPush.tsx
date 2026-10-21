/* F-B4 · Review & push (D-129, D-145) · owner S11. The one way anything reaches a channel: a diff per channel, limits
 * checked before commit, then a receipt per field (live · in review · not supported, with the reason), a new version,
 * and one-click undo. S10 and S12 route their changes here.
 * R-004 R-006 R-020 R-087 R-116 · D-129 D-145 D-146 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ChannelChip, Empty, Explainer, Icon, PageHeader } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId, QueuedChange, Receipt } from '../../data/types'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'

/** What the channel will refuse or delay, known before commit (channel-constraints §1, §9). */
function check(c: QueuedChange): { block?: string; warn?: string } {
  const limit = CHANNELS[c.channel].titleLimit
  if (c.fieldId === 'copy.title' && limit && c.after.length > limit && !c.label.startsWith('Restore') && !c.label.startsWith('Undo'))
    return { block: `${c.after.length} characters; ${CHANNELS[c.channel].name} allows ${limit}.` }
  if (c.channel === 'booking' && c.fieldId === 'copy.description') return { warn: 'Booking.com writes its own description. This won’t be sent.' }
  if (c.channel === 'booking' && c.fieldId === 'copy.title') return { warn: 'Booking.com reviews name changes (usually 48 h).' }
  if (c.channel === 'booking' && c.fieldId === 'photo.order') return { warn: 'Sticks only while smart ordering is off.' }
  return {}
}

const RECEIPT: Record<Receipt['state'], { cls: string; text: string; icon: string }> = {
  live: { cls: 'ok', text: 'Live', icon: 'circle-check' },
  'in-review': { cls: 'pending', text: 'In review', icon: 'clock' },
  rejected: { cls: 'failed', text: 'Rejected', icon: 'cloud-x' },
  'not-supported': { cls: 'failed', text: 'Not sent', icon: 'eye-off' },
}

export function ReceiptRows({ receipts }: { receipts: Receipt[] }) {
  return (
    <table className="h-table"><tbody>{receipts.map((r) => (
      <tr key={r.id}><td>{r.label}</td>
        <td><span className={`h-sync h-sync--${RECEIPT[r.state].cls}`}><Icon name={RECEIPT[r.state].icon} />{RECEIPT[r.state].text}</span></td>
        <td className="h-caption h-muted">{r.reason}</td></tr>
    ))}</tbody></table>
  )
}

export function ReviewPush() {
  const p = useProperty()
  const s = useStore()
  // Pushed this session: derived from the store (versions + receipts), so it survives reloads and navigation.
  const [since] = useState(() => Date.now() - 30 * 60 * 1000)
  const done = (['airbnb', 'booking'] as ChannelId[]).flatMap((c) => {
    const v = s.versions.filter((x) => x.channel === c && x.by === 'host' && Date.parse(x.at) >= since).sort((a, b) => b.n - a.n)[0]
    if (!v) return []
    const receipts = s.receipts.filter((r) => r.channel === c && Date.parse(r.at) >= Date.parse(v.at) - 2000)
    return [{ channel: c, receipts, version: `v${v.n}`, undone: v.note.startsWith('Undo') }]
  })
  const chans = Array.from(new Set(s.queue.map((q) => q.channel))) as ChannelId[]
  const blocked = (c: ChannelId) => s.queue.some((q) => q.channel === c && check(q).block)
  const pushOne = (c: ChannelId) => { s.push(c) }
  const undo = (c: ChannelId) => { s.undoPush(c) }
  return (
    <>
      <PageHeader title="Review & push" property={p} sub="Nothing reaches a channel until you push. Each change gets a receipt, each push a version you can undo." />
      {done.map((d) => (
        <section key={d.channel + (d.version ?? '')} className="p-card p-mt4" aria-live="polite">
          <div className="p-row p-sb">
            <div className="p-row" style={{ gap: 8 }}><ChannelChip channel={d.channel} /><b>{d.undone ? 'Undone' : 'Pushed'}</b>{d.version && <span className="h-blame"><span className="h-blame__v h-blame__v--you">{d.version}</span>version saved</span>}</div>
            <div className="p-row" style={{ gap: 8 }}>
              {!d.undone && s.studio.lastPush[d.channel] && <Button icon="arrow-back-up" onClick={() => undo(d.channel)}>Undo this push</Button>}
              <Link className="h-link h-small" to={`/property/${p.id}/listing/${d.channel}/status-and-receipts`}>See {CHANNELS[d.channel].name} status</Link>
            </div>
          </div>
          <div className="p-mt3"><ReceiptRows receipts={d.receipts} /></div>
        </section>
      ))}
      {chans.length === 0 && done.length === 0 && (
        <div className="p-mt6"><Empty title="Nothing to push" icon="send">Decisions that keep each channel’s value, and edits that only touch your home, write nothing.</Empty></div>
      )}
      {chans.length > 1 && (
        <div className="p-row p-sb p-mt4 p-strip">
          <span className="h-small"><b>{s.queue.length} changes</b> for {chans.map((c) => CHANNELS[c].name).join(' and ')}</span>
          <Button kind="primary" disabled={chans.some(blocked)} onClick={() => chans.forEach(pushOne)}>Push everything</Button>
        </div>
      )}
      {chans.map((c) => {
        const rows = s.queue.filter((q) => q.channel === c)
        return (
          <section key={c} className="p-card p-mt4" aria-label={`Changes for ${CHANNELS[c].name}`}>
            <div className="p-row p-sb">
              <div className="p-row" style={{ gap: 8 }}><ChannelChip channel={c} /><b>{rows.length} change{rows.length > 1 ? 's' : ''}</b></div>
              <Button kind="primary" disabled={blocked(c)} onClick={() => pushOne(c)}>Push to {CHANNELS[c].name}</Button>
            </div>
            <table className="h-table p-mt3">
              <thead><tr><th>What</th><th>Live now</th><th>After push</th><th>Check</th><th /></tr></thead>
              <tbody>{rows.map((q) => {
                const k = check(q)
                return (
                  <tr key={q.id}>
                    <td>{q.label}<div className="h-caption h-muted">{q.origin === 'suggestion' ? 'AI suggestion, accepted' : q.origin === 'reconcile' ? 'Decided in Needs you' : q.origin === 'question' ? 'Your answer' : 'Your edit'}</div></td>
                    <td style={{ maxWidth: 260 }}><span className="h-diff"><del>{q.before}</del></span></td>
                    <td style={{ maxWidth: 260 }}><span className="h-diff"><ins>{q.after}</ins></span></td>
                    <td className="h-caption">{k.block ? <span style={{ color: 'var(--color-error-600)' }}><Icon name="alert-circle" size={16} /> {k.block}</span> : k.warn ? <span className="h-muted">{k.warn}</span> : <span className="h-sync h-sync--ok"><span className="h-sync__dot" />OK</span>}</td>
                    <td><button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => s.unqueue(q.id)}>Remove</button></td>
                  </tr>
                )
              })}</tbody>
            </table>
            {blocked(c) && <p className="h-caption p-mt2" style={{ color: 'var(--color-error-600)' }}>Fix the marked change in The home › Listing text before pushing to {CHANNELS[c].name}.</p>}
          </section>
        )
      })}
      <div className="p-mt6"><Explainer title="Why one push step">Edits save to your home straight away. Channels only change here, so you always see what will change, where, and whether it arrived. Undo pushes the previous version back, with its own receipt.</Explainer></div>
    </>
  )
}
