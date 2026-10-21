/* F-A1 steps 1–4 · SCR-01 Connect & import · owner S10.
 * connect (before you connect) → importing, with the lights on → second channel → match listings into one property.
 * R-080 R-085 R-004 R-020 · D-104 D-130 D-131 D-139 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Explainer, Icon, Mark, Photo, Pill, TopToast, useIsMobile } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId } from '../../data/types'
import { useStore } from '../../store/store'
import { ConnectFrame, FlowActions, StepTrail, useClearDemo, useDemo } from './frame'
import { plain, usePersona } from './persona'

/* ---------------- 1 · Before you connect (redesign of HS-07) ---------------- */
export function Connect({ channel = 'airbnb' }: { channel?: ChannelId }) {
  const nav = useNavigate()
  const connect = useStore((s) => s.connectChannel)
  const p = usePersona()
  const next = channel === 'airbnb' ? '/import/importing' : '/import/importing?second=1'
  return (
    <ConnectFrame channel={channel} progress={0.1}>
      <StepTrail current="connect" />
      <h1 className="h-h1">Connect {CHANNELS[channel].name}</h1>
      <p className="h-intro">
        {p.id === 'P4'
          ? <>Hospitable will read your {CHANNELS[channel].name} listing so it can answer guests and keep your calendar right. <b>It won’t change anything on {CHANNELS[channel].name} until you’ve seen exactly what, and said yes.</b></>
          : <>We’ll read everything on your {CHANNELS[channel].name} {channel === 'booking' ? 'property' : 'listings'} first. <b>Nothing is written to {CHANNELS[channel].name} until you’ve reviewed what will change.</b></>}
      </p>
      <div className="p-grid-2c p-mt6">
        <div className="p-card">
          <div className="p-label">Straight away</div>
          <ul className="p-list">
            <li><Icon name="calendar" size={18} /><span><b>Reservations and your calendar</b> start syncing, so you can’t get double-booked.</span></li>
            <li><Icon name="message-circle" size={18} /><span><b>Guest messages</b> start arriving in your Inbox.</span></li>
            <li><Icon name="eye" size={18} /><span><b>Everything else is read, not written</b>: titles, descriptions, photos, amenities, rules, fees and prices.</span></li>
          </ul>
        </div>
        <div className="p-card">
          <div className="p-label">Only after you review it</div>
          <ul className="p-list">
            <li><Icon name="coin" size={18} /><span><b>Prices.</b> If Hospitable sets your nightly rate, {channel === 'airbnb' ? 'Airbnb Smart Pricing turns off' : 'Booking.com rates come from Hospitable'}. You’ll choose.</span></li>
            <li><Icon name="send" size={18} /><span><b>Any change to your listing</b> is shown as a before and after, per {plain(p, 'channel')}, before it’s sent.</span></li>
            <li><Icon name="history" size={18} /><span><b>Nothing changes on your listing</b> until you review and send it. We keep a copy of what we imported.</span></li>
          </ul>
        </div>
      </div>
      {channel === 'airbnb' && (
        <p className="h-small h-muted p-mt4"><Icon name="info-circle" size={16} /> Airbnb’s service fee may change from split fee to host-only fee. Already connected to other software? Airbnb gives it limited access while Hospitable is connected.{/* REAL·PRODUCT HS-07 */}</p>
      )}
      {/* phones: Cancel is the head's × */}
      <FlowActions note={<>You’ll sign in on {CHANNELS[channel].name} and come back here.</>}
        mobile={<Button kind="primary" size="lg" onClick={() => { connect(channel); nav(next) }}>Continue to {CHANNELS[channel].name}</Button>}>
        <Button kind="primary" size="lg" onClick={() => { connect(channel); nav(next) }}>Continue to {CHANNELS[channel].name}</Button>
        <Button size="lg" onClick={() => nav('/')}>Cancel</Button>
      </FlowActions>
    </ConnectFrame>
  )
}

/* ---------------- 2 · Importing, with the lights on (replaces HS-11/12) ---------------- */
type Row = { label: string; n: number; unit: string; note?: string }
const AIRBNB_ROWS: Row[] = [
  { label: 'Listings', n: 1, unit: '', note: '+ 1 incomplete draft, not imported' },
  { label: 'Photos', n: 18, unit: '' }, { label: 'Amenities', n: 24, unit: '' },
  { label: 'Fees & prices', n: 9, unit: '' }, { label: 'Rules & stay rules', n: 17, unit: '' },
  { label: 'Reservations', n: 3, unit: 'upcoming', note: 'calendar syncing now' }, { label: 'Reviews', n: 47, unit: '', note: 'stay on Airbnb, untouched' },
]
const BOOKING_ROWS: Row[] = [
  { label: 'Property', n: 1, unit: '', note: '1 room type' }, { label: 'Photos', n: 14, unit: '' }, { label: 'Facilities', n: 19, unit: '' },
  { label: 'Fees & prices', n: 8, unit: '' }, { label: 'Policies & stay rules', n: 15, unit: '' },
  { label: 'Reservations', n: 2, unit: 'upcoming', note: 'calendar syncing now' }, { label: 'Page Score', n: 72, unit: '/ 100' },
]

function useTicker(total: number, ms = 280, alreadyRead = false) {
  // ?instant=1 (screenshots): show every row at once instead of ticking them in (M-11).
  // alreadyRead: a channel read in an earlier step shows as done, not read again.
  const instant = alreadyRead || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('instant'))
  const [i, setI] = useState(instant ? total : 0)
  useEffect(() => {
    if (i >= total) return
    const t = setTimeout(() => setI(i + 1), ms)
    return () => clearTimeout(t)
  }, [i, total, ms])
  return i
}

function ChannelImport({ channel, rows, demo, alreadyRead }: { channel: ChannelId; rows: Row[]; demo: string | null; alreadyRead?: boolean }) {
  const nav = useNavigate()
  const clearDemo = useClearDemo()
  const shown = useTicker(rows.length, 280, alreadyRead)
  const failed = channel === 'booking' && demo === 'auth-expired'
  const partial = channel === 'booking' && demo === 'partial-photos'
  const done = shown >= rows.length
  const mobile = useIsMobile()
  const [toast, setToast] = useState(true)
  const status = failed ? <span className="h-import__status"><Icon name="cloud-x" />Stopped</span>
    : done && partial ? <span className="h-import__status p-warn"><Icon name="alert-triangle" />Read, 3 photos missing</span>
    : done ? <span className="h-import__status is-done"><Icon name="circle-check" />Read</span>
    : <span className="h-import__status is-busy"><Icon name="loader-2" />Reading…</span>
  return (
    <div className="p-card" style={{ padding: 0 }}>
      <div className="h-import__row"><Mark channel={channel} size={24} /><div><div className="h-import__name">{CHANNELS[channel].name}</div>
        <div className="h-import__counts">{failed ? 'Authorization expired after 4 of 7 steps' : done ? 'Everything read. Nothing written.' : 'Reading your listing…'}</div></div><span />{status}</div>
      {rows.slice(0, failed ? 4 : shown).map((r, i) => (
        <div key={r.label} className="h-import__row is-entering" style={{ ['--i' as string]: i }}>
          <span />
          <div className="h-small"><b>{r.label}</b>{r.note && <span className="h-muted"> · {r.note}</span>}{partial && r.label === 'Photos' && <span className="h-muted"> · 3 couldn’t be downloaded (timeout)</span>}</div>
          <span className="h-small p-num">{partial && r.label === 'Photos' ? 11 : r.n}{r.unit ? ` ${r.unit}` : ''}</span>
          <Icon name={partial && r.label === 'Photos' ? 'alert-triangle' : 'check'} size={16} className={partial && r.label === 'Photos' ? 'p-warn' : 'p-ok'} />
        </div>
      ))}
      {/* phones: the error is also pinned to the top until dismissed (images/45) */}
      {mobile && failed && <TopToast open={toast} message="Booking.com signed Hospitable out. Nothing was changed on either channel." onDismiss={() => setToast(false)} />}
      {failed && (
        <div className="p-pad"><Explainer title="Booking.com signed Hospitable out" icon="cloud-x">
          Your Booking.com connection expired while we were reading it. Nothing was changed on Booking.com, and what we read from Airbnb is safe.
          <div className="p-row p-mt3">
            <Button kind="primary" size="md" onClick={clearDemo}>Reconnect Booking.com</Button>
            <Button size="md" onClick={() => { clearDemo(); nav('/import/found?single=1') }}>Continue with Airbnb only</Button>
          </div>
        </Explainer></div>
      )}
      {partial && done && (
        <div className="p-pad"><Explainer title="3 photos didn’t come through" icon="photo">
          They’re still on Booking.com, untouched. We’ll try again in the background; you can also retry now.
          <div className="p-row p-mt3"><Button size="md" icon="refresh" onClick={clearDemo}>Retry now</Button></div>
        </Explainer></div>
      )}
    </div>
  )
}

export function Importing({ second }: { second: boolean }) {
  const nav = useNavigate()
  const demo = useDemo()
  const p = usePersona()
  const chans: ChannelId[] = second ? ['airbnb', 'booking'] : ['airbnb']
  const stopped = second && demo === 'auth-expired'
  return (
    <ConnectFrame channel={second ? 'both' : 'airbnb'} progress={second ? 0.45 : 0.3}>
      {/* the second read belongs to "Another channel": the trail doesn't step backwards */}
      <StepTrail current={second ? 'second-channel' : 'importing'} />
      <h1 className="h-h1">{stopped ? 'Booking.com stopped part-way' : second ? 'Reading Booking.com' : 'Reading your Airbnb listing'}</h1>
      <p className="h-intro">{stopped ? 'Nothing is lost, and nothing was written. Reconnect to finish reading, or carry on with Airbnb alone.' : <>About a minute. You can close this: we’ll let you know when it’s ready. <b>Nothing is being written to {second ? 'either channel' : 'Airbnb'}.</b></>}</p>
      <div className="p-col p-mt6">
        {/* keyed by demo so "Reconnect" / "Retry now" read the channel again */}
        {chans.map((c) => <ChannelImport key={`${c}:${demo ?? ''}`} channel={c} rows={c === 'airbnb' ? AIRBNB_ROWS : BOOKING_ROWS} demo={demo} alreadyRead={second && c === 'airbnb'} />)}
      </div>
      {p.id === 'P3' && (
        <Explainer title="Migration mode" icon="stack-2">Bringing a portfolio? After this first property, you’ll see every listing we found in a table, and you can go live in batches (five units first is a good start). Nothing is written until each batch is reviewed.</Explainer>
      )}
      {!stopped && (
        <FlowActions>
          <Button kind="primary" size="lg" onClick={() => nav(second ? '/import/match' : '/import/second-channel')}>Continue</Button>
        </FlowActions>
      )}
    </ConnectFrame>
  )
}

/* ---------------- 3 · Second channel ---------------- */
export function SecondChannel() {
  const nav = useNavigate()
  const p = usePersona()
  // Booking.com preselected from the sign-up answer (HS-02); the others are opt-in. They connect one at a time, same steps.
  const [picked, setPicked] = useState<ChannelId[]>(['booking'])
  const toggle = (c: ChannelId) => setPicked((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]))
  const order = (['booking', 'vrbo', 'direct'] as ChannelId[]).filter((c) => picked.includes(c))
  const first = order[0]
  const primary = first
    ? <Button kind="primary" size="lg" disabled={first !== 'booking'} onClick={() => nav('/import/connect-booking')}>Connect {CHANNELS[first].name}</Button>
    : <Button kind="primary" size="lg" onClick={() => nav('/import/found?single=1')}>Continue with Airbnb only</Button>
  const skip = first && <Button size="lg" className="p-flow__secondary" onClick={() => nav('/import/found?single=1')}>Skip for now</Button>
  return (
    <ConnectFrame channel="airbnb" progress={0.38}>
      <StepTrail current="second-channel" />
      <h1 className="h-h1">Do you also take bookings on Booking.com, Vrbo or Direct?</h1>
      <p className="h-intro">
        {p.id === 'P4'
          ? <>If you add Booking.com now, Hospitable fills it from what you already have on Airbnb, <b>without you typing it all again</b>, and shows you anything that doesn’t match.</>
          : <>Connect them now and we’ll read both and line them up with Airbnb in one go. You told us you’re on Airbnb and Booking.com.{/* REAL·PRODUCT HS-02: the sign-up asks which channels you use */}</>}
      </p>
      <div className="h-choice-tiles h-choice-tiles--grid p-mt6">
        {(['booking', 'vrbo', 'direct'] as ChannelId[]).map((c) => (
          <button key={c} className="h-choice-tile" aria-pressed={picked.includes(c)} onClick={() => toggle(c)}>
            <Mark channel={c} size={24} /><span>{CHANNELS[c].name}</span>{c === 'booking' && <Pill kind="recommended">You said you’re here</Pill>}
          </button>
        ))}
      </div>
      <FlowActions note={first && first !== 'booking'
          ? <>Start with Booking.com, where you said you are. {CHANNELS[first].name} connects the same way after it.{/* only the Booking.com path is built */}</>
          : order.length > 1 ? <>Then {order.slice(1).map((c) => CHANNELS[c].name).join(' and ')}, the same way, one at a time.</> : undefined}
        mobile={<>{skip}{primary}</>}>
        {primary}{skip}
      </FlowActions>
    </ConnectFrame>
  )
}

/* ---------------- 4 · Match listings into properties (the step HS-14 hides) ---------------- */
export function Match() {
  const nav = useNavigate()
  const demo = useDemo()
  const setMatch = useStore((s) => s.setMatch)
  const decide = useStore((s) => s.decide)
  const [choice, setChoice] = useState<'merged' | 'split'>('merged')
  const rooms = demo === 'room-types'
  return (
    <ConnectFrame channel="both" progress={0.55}>
      <StepTrail current="match" />
      <h1 className="h-h1">These look like the same place</h1>
      <p className="h-intro">Hospitable keeps one record per place, with a listing on each channel. Nothing changes on either channel when you confirm.</p>
      <div className="p-grid-2c p-mt6">
        {(['airbnb', 'booking'] as ChannelId[]).map((c) => (
          <div key={c} className="p-card">
            <div className="p-row p-sb"><span className="h-channel-chip"><Mark channel={c} />{CHANNELS[c].name}</span><span className="h-caption h-muted">as imported · 29 Sep</span></div>
            <div className="p-mosaic p-mt3">{[1, 2, 3].map((t) => <Photo key={t} tone={(c === 'airbnb' ? t : t + 1) as 1 | 2 | 3 | 4} style={{ height: 70 }} />)}</div>
            <div className="h-small p-mt3"><b>{c === 'airbnb' ? 'Beautiful Artist Apt. in Neukölln' : 'Artist Apartment Neukölln · Balcony & Fast Wi-Fi'}</b></div>
            <div className="h-caption h-muted">12047 Berlin-Neukölln · 2 guests · 1 bedroom{c === 'booking' && rooms ? ' · 2 room types' : ''}</div>
          </div>
        ))}
      </div>
      <div className="p-card p-mt4">
        <div className="p-row p-sb"><b>Why we think it’s one place</b><span className="h-confidence">High confidence</span></div>
        <ul className="p-list p-mt2">
          <li><Icon name="check" size={16} className="p-ok" /><span>Same street address</span></li>
          <li><Icon name="check" size={16} className="p-ok" /><span>11 of Booking.com’s 14 photos are the same images as on Airbnb</span></li>
          <li><Icon name="check" size={16} className="p-ok" /><span>Same capacity: 2 guests, 1 bedroom, 1 bathroom</span></li>
        </ul>
      </div>
      {rooms && (
        <div className="p-mt4"><Explainer title="Booking.com lists 2 room types here" icon="building">
          “Apartment” and “Apartment with Balcony” are both on this Booking.com property. Which one is this Airbnb listing? The other becomes its own unit, and we’ll match it with another listing if you have one.
          <div className="h-radio-cards p-mt3">
            <label className="h-radio-card" aria-checked="true"><input className="h-radio" type="radio" defaultChecked name="rt" /><div><div className="h-radio-card__title">Apartment</div><div className="h-radio-card__desc">2 guests · 11 shared photos</div></div></label>
            <label className="h-radio-card"><input className="h-radio" type="radio" name="rt" /><div><div className="h-radio-card__title">Apartment with Balcony</div><div className="h-radio-card__desc">3 guests · 2 shared photos</div></div></label>
          </div>
        </Explainer></div>
      )}
      <div className="h-radio-cards p-mt4">
        <label className="h-radio-card" aria-checked={choice === 'merged'}><input className="h-radio" type="radio" checked={choice === 'merged'} onChange={() => setChoice('merged')} name="m" />
          <div><div className="h-radio-card__title">Yes: one place, two listings <Pill kind="recommended">Recommended</Pill></div>
            <div className="h-radio-card__desc">One calendar and one set of facts. Each channel keeps its own title, photos order and fees until you decide otherwise.</div></div></label>
        <label className="h-radio-card" aria-checked={choice === 'split'}><input className="h-radio" type="radio" checked={choice === 'split'} onChange={() => setChoice('split')} name="m" />
          <div><div className="h-radio-card__title">No: they’re two different places</div><div className="h-radio-card__desc">Two records, two calendars. You can merge them later.</div></div></label>
      </div>
      <FlowActions note="Portfolios: we match every listing the same way and show the ones we’re unsure about first.">
        <Button kind="primary" size="lg" onClick={() => { setMatch(choice); decide('merge', choice === 'merged' ? 'yes' : 'no'); nav('/import/found') }}>Confirm</Button>
      </FlowActions>
    </ConnectFrame>
  )
}
