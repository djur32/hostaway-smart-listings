/* Knowledge Hub, reframed · Tips: a frequent or unanswered question becomes a tip, in the one tips container (TipsPanel
 * + TipCard, the same contract as every channel page: the field it's about, the change, why — with the questions behind
 * it as sources —, Accept or Dismiss, then Accepted → Undo or Next, and a receipt).
 * Accept writes the fact into the Listing base (Listing details), so every channel that uses the field and the guest AI
 * answer with it; when most asks come from one channel, the tip also offers saying it only in that channel's
 * description. Receipts go through the same commit path as every edit (screens/push/changes.ts). */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Diff, Icon, KqReceipt, KqWhere, TipCard, TipsPanel, Toast } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { useStore } from '../../../../store/store'
import { effective } from '../../../push/changes'
import { channelList } from '../../../../data/channels'
import { fieldByKey } from '../../../../data/v3-ch'
import { NAME } from '../../perProperty'
import { acceptTip, fieldLabel, fieldPath, fieldPlace, undoTip, useKqTips, type KQ, type TipView } from './model'

type Where = 'base' | ListingChannel

export function HubTips({ kq, focusId, onClose }: { kq: KQ; focusId: string | null; onClose: () => void }) {
  const shown = kq.tips.filter((t) => t.status === 'open' || t.status === 'accepted')
  const [i, setI] = useState(() => Math.max(0, shown.findIndex((t) => t.def.id === focusId)))
  useEffect(() => { if (focusId) { const k = shown.findIndex((t) => t.def.id === focusId); if (k >= 0) setI(k) } }, [focusId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [pick, setPick] = useState<Record<string, Where>>({})
  const [toast, setToast] = useState<{ key: number; text: string; tip: TipView } | null>(null)
  const idx = Math.min(i, Math.max(shown.length - 1, 0))
  const t = shown[idx]
  const toastEl = toast && (
    <Toast key={toast.key} onClose={() => setToast(null)} onUndo={() => { undoTip(toast.tip.def, kq.chs); setToast(null) }}>{toast.text}</Toast>
  )
  if (!t) return (
    <>
      <TipsPanel onClose={onClose} empty={<><Icon name="circle-check" /><b>No tips right now</b><span className="h-small h-muted">Every question guests ask has an answer the AI can back. A new tip appears when guests ask something the Listing base doesn’t cover.</span></>} />
      {toastEl}
    </>
  )
  const where: Where = t.status === 'accepted' ? t.where ?? 'base' : pick[t.def.id] ?? 'base'
  return (
    <>
      <TipsPanel onClose={onClose}>
        <TipCard
          type={t.def.amenity ? 'Amenities' : fieldLabel(t.def.field)} idx={idx + 1} total={shown.length}
          onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(shown.length - 1, idx + 1))}
          title={t.def.title} main={<TipMain kq={kq} t={t} where={where} />} why={t.why}
          accepted={t.status === 'accepted'}
          extra={t.lean ? (
            <KqWhere<Where> value={where} onChange={(w) => setPick({ ...pick, [t.def.id]: w })} options={[
              { id: 'base', title: 'The Listing base', line: 'Every channel that uses it, and the guest AI, answer with it.' },
              { id: t.lean, title: `${NAME(t.lean)}’s description only`, line: `Most asks come from ${NAME(t.lean)} guests. The Listing base stays as it is.` },
            ]} />
          ) : undefined}
          onAccept={() => {
            const receipts = acceptTip(t.def, where, kq.chs)
            const sent = receipts.map((r) => r.channel)
            const into = t.def.amenity ? 'Listed on every channel' : where === 'base' ? 'Added to the Listing base' : `Added to ${NAME(where)}’s description`
            setToast({ key: Date.now(), tip: t, text: sent.length ? `${into} · sent to ${channelList(sent)}` : into })
          }}
          onDismiss={() => useKqTips.getState().dismiss(t.def.id)}
          onUndo={() => { undoTip(t.def, kq.chs); setToast(null) }}
        />
      </TipsPanel>
      {toastEl}
    </>
  )
}

/** The change, then (once accepted) where it went: the tip's receipt. */
function TipMain({ kq, t, where }: { kq: KQ; t: TipView; where: Where }) {
  const sl3 = useStore((s) => s.sl3)
  const base = `/property/${kq.pid}`
  const q = <p className="h-kq-tipq">Guests ask <Link className="h-textlink" to={`${base}/hub/questions/${t.qid}${t.status === 'open' ? `?tip=${t.def.id}` : ''}`}>“{t.qlabel}”</Link></p>
  if (t.def.amenity) {
    const name = t.def.amenity
    const on = kq.chs.filter((c) => kq.hub.amenityOn(name, c))
    const before = t.status === 'accepted' ? kq.chs.filter((c) => !(t.sent ?? []).includes(c) && on.includes(c)) : on
    return (
      <>
        {q}
        <Diff from={before.length ? `Listed on ${channelList(before)}` : 'Not listed'} to={`Listed on ${channelList(kq.chs)}`} note="Adds it to the Listing base’s amenities, so every channel lists it and the guest AI can say so." />
        {t.status === 'accepted' && <KqReceipt to={`${base}/details/amenities`} linkLabel="Open Amenities">In the Listing base · Amenities{t.sent?.length ? `. Sent to ${channelList(t.sent)}.` : '.'}</KqReceipt>}
      </>
    )
  }
  const f = t.def.field
  const add = t.def.add ?? ''
  const baseVal = sl3.base[f] ?? fieldByKey(f)?.base ?? ''
  const cur = where === 'base' ? baseVal : effective(where, f, sl3) ?? ''
  const from = t.status === 'accepted' ? cur.replace(add, '') : cur
  const to = t.status === 'accepted' ? cur : `${cur.trimEnd()}${add}`
  // which channels read the Listing base for this field (the others keep their own text)
  const users = kq.chs.filter((c) => (effective(c, f, sl3) ?? '') === baseVal)
  const own = kq.chs.filter((c) => !users.includes(c) && fieldByKey(f)?.state[c] !== undefined)
  const note = where === 'base'
    ? own.length ? `Adds to the Listing base: ${channelList(users)} and the guest AI use it; ${channelList(own)} keeps its own text.` : 'Adds to the Listing base: every channel and the guest AI use it.'
    : `Only ${NAME(where)}’s ${fieldLabel(f)}: ${NAME(where)} guests, and the AI’s replies to them, get it.`
  const place = where === 'base' ? `${fieldPlace(f)} › ${fieldLabel(f)}` : `${NAME(where)}’s listing › ${fieldLabel(f)}`
  const to$ = where === 'base' ? fieldPath(kq.pid, f) : `${base}/ch/${where}/listing/${fieldPlace(f).replace('Listing base · ', '').toLowerCase()}`
  return (
    <>
      {q}
      <Diff from={from} to={to} note={note} />
      {t.status === 'accepted' && <KqReceipt to={to$} linkLabel="Open field">In {place}{t.sent?.length ? `. Sent to ${channelList(t.sent)}.` : '.'}</KqReceipt>}
    </>
  )
}

export function TipButton({ onClick }: { onClick: () => void }) {
  return <Button kind="ai" icon="sparkles" onClick={onClick}>See tip</Button>
}
