/* F-A1 steps 8–11 · Sync direction · first push · done · owner S10 (consumes S11's push/receipts, D-129).
 * Replaces "You're connected · Setup ✓ Ready" (HS-15) with something true: what Hostaway will now keep up to date,
 * what stays on each channel, the per-channel diff of the first push, then receipts.
 * R-004 R-020 R-087 R-090 R-091 · D-104 D-129 D-134 D-135 D-137 D-139 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AskCard, Button, ChannelChip, Explainer, Icon, Mark, Pill, TopToast, useIsMobile } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { PROPERTY_ID } from '../../data/scenario'
import type { ChannelId, Receipt } from '../../data/types'
import { needsYou } from '../../store/selectors'
import { useStore } from '../../store/store'
import { ConnectFrame, FlowActions, StepTrail, useDemo } from './frame'
import { plain, usePersona } from './persona'

const CH: ChannelId[] = ['airbnb', 'booking']

/** Who keeps each area up to date, per channel (object-model §3.4 host-facing copy, drafts for S14). */
function useDirection(demo: string | null) {
  const s = useStore()
  const sp = s.decisions.find((d) => d.id === 'smart-pricing')
  const hostawayPrices = sp?.choice !== 'keep'
  return [
    { area: 'Calendar & reservations', airbnb: 'Hostaway · live now', booking: 'Hostaway · live now', note: 'Started at connect, so you can’t be double-booked.' },
    { area: 'Nightly prices', airbnb: demo === 'pricing-tool' ? 'Your pricing tool' : hostawayPrices ? 'Hostaway' : 'Airbnb Smart Pricing', booking: demo === 'pricing-tool' ? 'Your pricing tool' : 'Hostaway', note: demo === 'pricing-tool' ? 'Prices come from PriceLabs. Hostaway reads them and never sends a rate.' : hostawayPrices ? '€44, weekends €55. Airbnb Smart Pricing turns off at your first push.' : 'Booking.com: €44, weekends €55. On Airbnb, Hostaway reads Smart Pricing’s price and never sends one.' },
    { area: 'Fees & stay rules', airbnb: 'Hostaway', booking: 'Hostaway', note: 'Values can differ per channel, as you decided.' },
    { area: 'Details, amenities, house rules', airbnb: 'Hostaway', booking: 'Hostaway', note: 'One record; each channel gets its own wording of the same fact.' },
    { area: 'Photos', airbnb: 'Hostaway · your order', booking: demo === 'bdc-not-writable' ? 'Booking.com Extranet' : 'Hostaway · Booking.com may reorder', note: demo === 'bdc-not-writable' ? 'This Booking.com property has several room types; photos stay managed in the Extranet for now.' : 'Channels can reorder photos themselves (smart ordering).' },
    { area: 'Title & description', airbnb: 'Hostaway', booking: 'Booking.com writes the description', note: 'Booking.com writes its own text from your facts; a new name goes through its review.' },
    // research/market/channel-constraints.md §4 "Rooms / beds / baths": Airbnb-owned (pulled, never pushed); Booking.com not synced
    { area: 'Rooms & beds', airbnb: 'Airbnb', booking: 'Booking.com Extranet', note: 'Edited on each channel. Hostaway reads Airbnb’s rooms and beds, sends them nowhere, and tells you if Booking.com’s don’t match.' },
  ]
}

export function GoLive() {
  const nav = useNavigate()
  const mobile = useIsMobile()
  const demo = useDemo()
  const p = usePersona()
  const s = useStore()
  const ny = needsYou(s)
  const rows = useDirection(demo)
  const byCh = (c: ChannelId) => s.queue.filter((q) => q.channel === c)
  const goLive = () => { for (const c of CH) if (byCh(c).length) s.push(c); s.markLive(); nav('/import/done') }
  const push = <Button kind="primary" size="lg" onClick={goLive}>{s.queue.length ? `${p.id === 'P4' ? 'Send' : 'Push'} ${s.queue.length} ${s.queue.length === 1 ? 'change' : 'changes'}${mobile ? '' : ' now'}` : 'Go live'}</Button>
  const notYet = <Button size="lg" className="p-flow__secondary" onClick={() => nav(`/property/${PROPERTY_ID}/overview/needs-you`)}>Not yet</Button>
  return (
    <ConnectFrame channel="both" progress={0.88} wide>
      <StepTrail current="go-live" />
      <h1 className="h-h1">Before anything is sent</h1>
      <p className="h-intro">From the first time you {plain(p, 'push')}, this is who keeps each part of your listing up to date. Then, exactly what will change on each {plain(p, 'channel')}.</p>
      {ny.open.length > 0 && (
        <div className="p-mt4"><Explainer title={`${ny.open.length} still open`} icon="alert-circle">
          They stay exactly as they are on each {plain(p, 'channel')} until you decide. You can go live now and decide later.
          <div className="p-row p-mt3"><Button size="md" onClick={() => nav(`/property/${PROPERTY_ID}/overview/needs-you`)}>Back to First-time setup</Button></div>
        </Explainer></div>
      )}

      <h2 className="h-h4 p-mt6">Who keeps what up to date</h2>
      <table className="h-table p-stack p-mt2">
        <thead><tr><th>Area</th><th><Mark channel="airbnb" /> Airbnb</th><th><Mark channel="booking" /> Booking.com</th><th>What it means</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.area}><td className="h-table__name">{r.area}</td><td data-label="Airbnb">{r.airbnb}</td><td data-label="Booking.com">{r.booking}</td><td className="h-small h-muted p-stack__full">{r.note}</td></tr>
        ))}</tbody>
      </table>
      <div className="p-mt3"><Explainer title="If you edit on Airbnb or Booking.com directly" icon="refresh">We notice. The field shows “Changed on Airbnb · Review”, and you choose which one to keep. Nothing is overwritten silently, in either direction.</Explainer></div>

      <h2 className="h-h4 p-mt6">What will change when you {plain(p, 'push')}</h2>
      <div className="p-grid-2c p-mt2">
        {CH.map((c) => {
          const list = byCh(c)
          return (
            <div key={c} className="p-card">
              <div className="p-row p-sb"><ChannelChip channel={c} /><span className="h-small"><b>{list.length}</b> {list.length === 1 ? 'change' : 'changes'}</span></div>
              {list.length === 0 ? <p className="h-small h-muted" style={{ margin: '10px 0 0' }}>Nothing changes on {CHANNELS[c].name}. Everything you kept per channel stays exactly as it is.</p> : (
                <table className="h-table p-stack p-stack--flat p-mt2"><tbody>{list.map((q) => (
                  <tr key={q.id}><td className="p-stack__full">{q.label}</td><td><span className="h-diff"><del>{q.before}</del></span></td><td><span className="h-diff"><ins>{q.after}</ins></span></td></tr>
                ))}</tbody></table>
              )}
              {c === 'booking' && demo === 'bdc-not-writable' && <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}><Icon name="lock" size={16} /> Photos can’t be sent to this property type. <a className="h-link" href="#extranet">Edit in the Extranet ↗</a></p>}
            </div>
          )
        })}
      </div>
      {p.id === 'P3' && <div className="p-strip p-mt4"><span className="h-small"><b>Staged rollout:</b> push to Batch 1 (5 properties) now; the other 7 wait for your review.</span><Pill kind="neutral">Batch 1 of 3</Pill></div>}

      <FlowActions note="Only the changes listed above are sent. Everything else stays as it is on each channel." mobile={<>{notYet}{push}</>}>
        {push}{notYet}
      </FlowActions>
    </ConnectFrame>
  )
}

function receiptLabel(r: Receipt, rejected: boolean, resent: boolean) {
  if (rejected) return <span className="h-sync h-sync--failed"><Icon name="cloud-x" />Rejected by Airbnb</span>
  if (resent) return <span className="h-sync h-sync--pending"><Icon name="clock" />Sent again · in Airbnb review</span>
  if (r.state === 'live') return <span className="h-sync h-sync--ok"><span className="h-sync__dot" />Live on {CHANNELS[r.channel].name}</span>
  if (r.state === 'in-review') return <span className="h-sync h-sync--pending"><Icon name="clock" />In {CHANNELS[r.channel].name} review</span>
  return <span className="h-sync h-sync--failed"><Icon name="eye-off" />Not sent: {r.reason}</span>
}

export function Done() {
  const nav = useNavigate()
  const demo = useDemo()
  const p = usePersona()
  const s = useStore()
  const ny = needsYou(s)
  const licence = s.questions.find((q) => q.id === 'licence')
  // go-live-error: Airbnb rejects until the registration number is answered, then the change goes back for review
  const failedPush = demo === 'go-live-error'
  const rejected = failedPush && licence?.status !== 'answered'
  const resent = failedPush && !rejected
  const sent = s.receipts.length
  const sentTo = (c: ChannelId) => s.receipts.filter((r) => r.channel === c).length
  const decided = s.decisions.filter((d) => d.status === 'decided').length
  const mobile = useIsMobile()
  const [toast, setToast] = useState(true)
  const primary = p.id === 'P2' ? <Button kind="primary" size={mobile ? 'lg' : undefined} onClick={() => nav(`/property/${PROPERTY_ID}/listing/airbnb/preview`)}>Open Listings › Airbnb</Button>
    : p.id === 'P3' ? <Button kind="primary" size={mobile ? 'lg' : undefined} onClick={() => nav('/')}>Review Batch 2</Button>
    : <Button kind="primary" size={mobile ? 'lg' : undefined} onClick={() => nav(`/property/${PROPERTY_ID}/home`)}>See your place in Hostaway</Button>
  // what's still in Needs you, named honestly: questions and suggestions aren't unfinished setup
  const waiting = [
    ny.open.length && `${ny.open.length} to decide`,
    ny.questions.length && `${ny.questions.length} optional ${ny.questions.length === 1 ? 'question' : 'questions'}`,
    ny.suggestions.length && `${ny.suggestions.length} ${ny.suggestions.length === 1 ? 'suggestion' : 'suggestions'}`,
  ].filter(Boolean)
  return (
    <ConnectFrame channel="both" progress={1} wide>
      <StepTrail current="done" />
      <h1 className="h-h1">{rejected ? 'Almost live: Airbnb needs one thing' : resent ? 'Live on Booking.com. Airbnb is checking yours' : sent ? 'You’re live, and here’s the proof' : 'Set up. Nothing sent yet'}</h1>
      <p className="h-intro">{rejected ? 'Booking.com took its change. Airbnb sent one back and said why. Your Airbnb listing stays live as it was.'
        : resent ? 'Your registration number went to Airbnb with the change. Until Airbnb accepts it, your Airbnb listing stays live as it was.'
        : sent ? 'Each change came back with a receipt from the channel.' : 'You kept everything as it is on both channels. Your calendar and messages are already running.'}</p>

      <div className="p-card p-mt6">
        <div className="p-label">What just happened</div>
        <ul className="p-list">
          <li><Icon name="circle-check" size={16} className="p-ok" /><span>You decided <b>{decided} of {s.decisions.length}</b> things.{decided < s.decisions.length && <> The rest stay as they are on each {plain(p, 'channel')} until you do.</>}</span></li>
          <li><Icon name="send" size={16} /><span>{sent ? <><b>{sent} {sent === 1 ? 'change' : 'changes'} sent</b>: {sentTo('airbnb')} to Airbnb, {sentTo('booking')} to Booking.com. Nothing else was touched.</> : <>Nothing was sent. Both listings are exactly as they were.</>}</span></li>
          <li><Icon name="calendar" size={16} /><span>Calendar and reservations have been up to date since you connected.</span></li>
          <li><Icon name="history" size={16} /><span>We keep a copy of each listing as it was imported.</span></li>
        </ul>
      </div>

      <div className="p-grid-2c p-mt4">
        {CH.map((c) => {
          const rs = s.receipts.filter((r) => r.channel === c)
          return (
            <div key={c} className="p-card">
              <ChannelChip channel={c} />
              <div className="p-col p-mt3" style={{ gap: 8 }}>
                <div className="h-small"><span className="h-sync h-sync--ok"><span className="h-sync__dot" />Calendar &amp; reservations up to date</span></div>
                {rs.length === 0 && <div className="h-small h-muted">No changes sent. Listing as it was.</div>}
                {rs.map((r) => <div key={r.id} className="p-row p-sb h-small"><span>{r.label}</span>{receiptLabel(r, rejected && c === 'airbnb', resent && c === 'airbnb')}</div>)}
                              </div>
            </div>
          )
        })}
      </div>
      {rejected && licence && (
        <div className="p-mt4" style={{ maxWidth: 640 }}>
          <AskCard q={licence} onAnswer={(a) => s.answerQuestion('licence', a)} onLater={() => s.deferQuestion('licence')}
            blocking="Airbnb won’t publish the change until the listing has a registration number. Your listing is still live as it was." />
        </div>
      )}
      <h2 className="h-h4 p-mt6">What’s next</h2>
      {/* phones: the main next step goes to the sticky bar; the others stay here, full width */}
      <div className="p-row p-mt2 p-flow__next">
        {!mobile && primary}
        {waiting.length > 0 && <Button onClick={() => nav(`/property/${PROPERTY_ID}/overview/needs-you`)}>First-time setup: {waiting.join(' · ')}</Button>}
        {p.id === 'P4' && <Button onClick={() => nav(`/property/${PROPERTY_ID}/listing/airbnb/preview`)}>Check your Airbnb page once</Button>}
      </div>
      {mobile && <FlowActions>{primary}</FlowActions>}
      {mobile && rejected && <TopToast open={toast} message="Airbnb sent the change back: the listing needs a registration number." onDismiss={() => setToast(false)} />}
    </ConnectFrame>
  )
}
