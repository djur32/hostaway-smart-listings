/* SCR-04 (window) · Listings › [channel] · owner S11 (History → S12). The channel's listing as a whole: status and
 * receipts, a preview (Airbnb: Live now ⇄ After push, click to edit; Booking.com: what we send + what Booking.com
 * writes, approximate), what differs from the home, performance & similar. Not a second editor (IA-R rule 2, D-140).
 * R-101 R-102 R-103 R-111 R-112 R-113 R-120 · D-123 D-124 D-129 D-140 D-146 */
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button, ChannelChip, Empty, Explainer, Guide, Icon, Mark, PageHeader, Pill, Segmented, SyncBadge, Tabs, useMode } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { FIELD } from '../../data/canonical'
import { LISTING_TABS, slug } from '../../data/ia'
import { seedListings } from '../../data/scenario'
import { PAGE_SCORE_RAISERS, bookingWrites } from '../../data/studio'
import type { ChannelId, Listing as ListingT } from '../../data/types'
import { projection } from '../../store/selectors'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { Insights } from '../home/Insights'
import { AirbnbPage, PREVIEW_SECTIONS, amenityLabel, type PreviewSection } from '../home/parts'
import { ReceiptRows } from './ReviewPush'
import { History } from '../versions/History'
import { Stats } from '../versions/Stats'

export function Listing() {
  const p = useProperty()
  const { channel, tab } = useParams()
  const s = useStore()
  const mode = useMode() // S12
  if (!channel || !p.channels.includes(channel as ChannelId)) return <Navigate to={`/property/${p.id}/listing/${p.channels[0]}/status-and-receipts`} replace />
  const ch = channel as ChannelId
  if (!tab) return <Navigate to={`/property/${p.id}/listing/${ch}/status-and-receipts`} replace />
  const base = `/property/${p.id}/listing/${ch}`
  const tabs = LISTING_TABS.filter((t) => t !== 'Performance & similar' || s.smartListings) // D-127: the AI layer adds this tab
  return (
    <>
      <PageHeader title={<>Listings · {CHANNELS[ch].name}</>} property={p}
        right={<span className="h-lens">{p.channels.map((c) => (
          <Link key={c} className="h-lens__seg" aria-pressed={c === ch} to={`/property/${p.id}/listing/${c}/${tab}`} style={{ textDecoration: 'none' }}><Mark channel={c} />{CHANNELS[c].name}</Link>
        ))}</span>} />
      {/* S12 mode hooks (D-150): P4 reads "History & undo"; a one-time explainer of what this page is. */}
      <div className="p-mt4"><Tabs items={tabs.map((t) => ({ label: t === 'History' && mode.plain ? 'History & undo' : t, to: `${base}/${slug(t)}` }))} /></div>
      {tab === 'status-and-receipts' && <div className="p-mt4"><Guide id="listing-window" title={`This is your ${CHANNELS[ch].name} listing, as a whole`}
        line={`What ${CHANNELS[ch].name} shows now, what’s waiting, and what it said about the last push.`}>
        You don’t edit here: you edit facts and text in The home, then send. This page shows what {CHANNELS[ch].name} has right now, what’s waiting to be sent, and a receipt for every change it accepted or refused.
      </Guide></div>}
      {tab === 'status-and-receipts' ? <Status ch={ch} propertyId={p.id} />
        : tab === 'preview' ? (ch === 'booking' ? <BookingPreview propertyId={p.id} /> : <AirbnbPreview propertyId={p.id} />)
          : tab === 'what-differs' ? <WhatDiffers ch={ch} propertyId={p.id} />
            : tab === 'history' ? <History ch={ch} propertyId={p.id} />  /* S12 · D-155 */
              : tab === 'stats' ? <Stats ch={ch} propertyId={p.id} />       /* S12 · D-156 D-157 */
                : <Insights channel={ch} propertyId={p.id} defaultOpen />}
    </>
  )
}

function Status({ ch, propertyId }: { ch: ChannelId; propertyId: string }) {
  const s = useStore()
  const nav = useNavigate()
  const listing = ch === 'airbnb' || ch === 'booking' ? s.listings[ch] : undefined
  const receipts = s.receipts.filter((r) => r.channel === ch).slice().reverse()
  const versions = s.versions.filter((v) => v.channel === ch).slice().sort((a, b) => b.n - a.n)
  const queued = s.queue.filter((q) => q.channel === ch)
  return (
    <div className="p-grid-2 p-mt4">
      <div>
        <section className="p-card">
          <div className="p-row p-sb"><b>{listing?.title ?? '—'}</b><Pill kind="managed">{listing?.status ?? 'listed'}</Pill></div>
          <div className="p-row p-mt2" style={{ gap: 16 }}>
            <span className="h-small">{listing?.lastPush ? <>Last push {new Date(listing.lastPush).toLocaleString()}</> : 'Not pushed from Hostaway yet'}</span>
            {listing?.pageScore !== undefined && <span className="h-small">Page Score <b>{listing.pageScore}</b> / 100</span>}
            <span className="h-small">{queued.length} change{queued.length === 1 ? '' : 's'} waiting</span>
          </div>
          <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>{CHANNELS[ch].note}</p>
          <div className="p-row p-mt3">
            <Button kind={queued.length ? 'primary' : 'secondary'} disabled={!queued.length} onClick={() => nav(`/property/${propertyId}/push`)}>Review {queued.length} change{queued.length === 1 ? '' : 's'}</Button>
            {s.studio.lastPush[ch] && <Button icon="arrow-back-up" onClick={() => s.undoPush(ch)}>Undo the last push</Button>}
            <Link className="h-link h-small" to={`/property/${propertyId}/home/listing-text?lens=${ch}`}>Edit in Listing text</Link>
          </div>
        </section>
        <div className="p-label p-mt6">Receipts</div>
        {receipts.length === 0 ? <p className="h-small h-muted">Nothing pushed yet.</p> : <div className="p-mt2"><ReceiptRows receipts={receipts} /></div>}
      </div>
      <section className="p-card">
        <div className="p-label">Versions</div>
        <ol className="h-versions p-mt3">
          {versions.map((v) => (
            <li key={v.id} className="h-version">
              <span className={`h-version__dot${v.by === 'host' ? ' h-version__dot--you' : ''}`}>{v.by === 'import' ? <Mark channel={ch} /> : <Icon name="pencil" />}</span>
              <div><div className="h-version__title">v{v.n} · {v.note}{v === versions[0] && <Pill kind="lead">Live</Pill>}</div><div className="h-version__meta">{new Date(v.at).toLocaleString()}</div></div>
            </li>
          ))}
        </ol>
        <Link className="h-link h-small" to={`/property/${propertyId}/listing/${ch}/history`}>Compare and restore (History)</Link>
      </section>
    </div>
  )
}

function AirbnbPreview({ propertyId }: { propertyId: string }) {
  const s = useStore()
  const nav = useNavigate()
  const [pv, setPv] = useState<'live' | 'next'>('next')
  const [show, setShow] = useState<Record<PreviewSection, boolean>>({ title: true, photos: true, highlights: true, description: true, amenities: true })
  const listing = s.listings.airbnb
  const lastV = s.versions.filter((v) => v.channel === 'airbnb').sort((a, b) => b.n - a.n)[0]
  const seed = seedListings().airbnb
  const live: ListingT = { ...listing, title: lastV?.title ?? seed.title, description: lastV?.description ?? seed.description, photoOrder: lastV?.photoOrder ?? seed.photoOrder, highlightedAmenities: lastV?.highlightedAmenities ?? seed.highlightedAmenities }
  const shown = pv === 'live' ? live : listing
  const changed: Partial<Record<PreviewSection, string>> = pv === 'live' ? {} : {
    ...(listing.title !== live.title ? { title: 'Changed' } : {}), ...(listing.description !== live.description ? { description: 'Changed' } : {}),
    ...(listing.photoOrder.join() !== live.photoOrder.join() ? { photos: 'Reordered' } : {}), ...(listing.highlightedAmenities.join() !== live.highlightedAmenities.join() ? { highlights: 'Reordered' } : {}),
  }
  const count = Object.keys(changed).length
  return (
    <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
      <AirbnbPage listing={shown} photos={s.photos} show={show} changed={changed}
        onPick={(sec) => nav(`/property/${propertyId}/home/listing-text?lens=airbnb&focus=${sec}`)}
        badge={pv === 'live' ? 'Live now · as guests see it' : 'After push · preview'} />
      <div className="p-col">
        <Segmented label="Which version" value={pv} onChange={setPv} items={[{ id: 'live', label: 'Live now' }, { id: 'next', label: `After push${count ? ` · ${count}` : ''}` }]} />
        <section className="p-card">
          <div className="p-label">Show</div>
          <div className="h-chips p-mt2">{PREVIEW_SECTIONS.map((x) => (
            <button key={x.id} className="h-chip" style={{ height: 28 }} aria-pressed={show[x.id]} onClick={() => setShow({ ...show, [x.id]: !show[x.id] })}>{x.label}</button>
          ))}</div>
        </section>
        <Explainer title="A check, not the editor">Click any part to edit it in Listing text. Money, rules and check-in are decided in Needs you and The home, never here (D-124).</Explainer>
        {count > 0 && pv === 'next' && <Button kind="primary" onClick={() => nav(`/property/${propertyId}/push`)}>Review & push {count} change{count > 1 ? 's' : ''}</Button>}
      </div>
    </div>
  )
}

function BookingPreview({ propertyId }: { propertyId: string }) {
  const s = useStore()
  const l = s.listings.booking
  const f = s.facts
  const answered = (q?: string) => !!q && s.questions.find((x) => x.id === q)?.status === 'answered'
  const score = (l.pageScore ?? 72) + PAGE_SCORE_RAISERS.filter((r) => answered(r.questionId)).reduce((n, r) => n + r.points, 0)
  const send: Array<[string, string]> = [
    ['Name', `${l.title}${s.queue.some((q) => q.channel === 'booking' && q.fieldId === 'copy.title') ? ' (change waiting; goes to review)' : ''}`],
    ['Photos', `${l.photoOrder.length} · main photo: ${s.photos.find((p) => p.id === l.photoOrder[0])?.caption ?? '—'} · smart ordering decides the rest`],
    ['Facilities', ['amenity.wifi', 'amenity.kitchen', 'amenity.dishwasher', 'amenity.washer', 'amenity.heating'].map(amenityLabel).join(' · ')],
    ['Check-in', projection(f['arrival.checkin_from'], 'booking').text],
    ['Minimum stay', projection(f['avail.min_stay'], 'booking').text],
    ['Cancellation', projection(f['policy.cancellation'], 'booking').text],
    ['Cleaning fee', projection(f['fee.cleaning'], 'booking').text],
  ]
  return (
    <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px' }}>
      <div className="p-col">
        <section className="p-card">
          <div className="p-row p-sb"><div className="p-label">What we send · exact</div><ChannelChip channel="booking" /></div>
          <table className="h-table p-mt2"><tbody>{send.map(([k, v]) => <tr key={k}><td style={{ width: 140 }} className="h-muted">{k}</td><td>{v === 'Channels disagree' || v === '—' ? <span className="h-muted">Decide in Needs you</span> : v}</td></tr>)}</tbody></table>
        </section>
        <div className="h-guest">
          <div className="h-guest__chrome"><Mark channel="booking" />booking.com/hotel/de/…<span className="h-guest__label"><Icon name="alert-circle" />Written by Booking.com · Approximate</span></div>
          <div className="h-guest__body"><div className="h-small"><b>{l.title}</b></div><p className="h-small" style={{ margin: '8px 0 0' }}>{bookingWrites(f)}</p></div>
        </div>
      </div>
      <div className="p-col">
        <section className="p-card">
          <div className="h-health" style={{ gridTemplateColumns: '20px 90px minmax(0, 1fr) 40px' }}><Mark channel="booking" /><span><b>Page Score</b></span>
            <span className={`h-health__bar${score < 80 ? ' is-mid' : ''}`}><i style={{ ['--value' as string]: `${score}%` }} /></span><span className="h-health__score">{score}</span></div>
          {PAGE_SCORE_RAISERS.map((r) => (
            <div key={r.id} className="p-row p-sb h-small p-mt2"><span>{answered(r.questionId) ? '✓ ' : ''}{r.label}</span><span className="h-caption h-muted">+{r.points}</span></div>
          ))}
          <Link className="h-link h-small p-mt3" style={{ display: 'inline-block' }} to={`/property/${propertyId}/home/listing-text?lens=booking`}>Raise it in Listing text</Link>
        </section>
        <Explainer title="Why not a faithful preview">Booking.com writes and translates its own text. We show exactly what we send, and an approximation of the rest, labelled as such.</Explainer>
      </div>
    </div>
  )
}

function WhatDiffers({ ch, propertyId }: { ch: ChannelId; propertyId: string }) {
  const s = useStore()
  const rows = Object.values(s.facts).filter((f) => {
    const field = FIELD[f.fieldId]
    if (!field || field.visibility !== 'public') return false
    return !!f.overrides[ch] || f.status === 'conflict' || (f.status === 'only-one' && f.source.kind !== ch && (f.source.kind === 'airbnb' || f.source.kind === 'booking'))
  })
  const queued = s.queue.filter((q) => q.channel === ch)
  return (
    <div className="p-grid-2 p-mt4">
      <div>
        <p className="h-small h-muted" style={{ margin: 0 }}>Values {CHANNELS[ch].name} shows that aren’t the shared value in your home.</p>
        {rows.length === 0 ? <Empty title="Nothing differs" icon="circle-check">{CHANNELS[ch].name} shows exactly what’s in your home.</Empty> : (
          <table className="h-table p-mt3"><thead><tr><th>Fact</th><th>Your home</th><th>On {CHANNELS[ch].name}</th><th /></tr></thead><tbody>
            {rows.map((f) => {
              const field = FIELD[f.fieldId]!
              const onCh = projection(f, ch)
              return (
                <tr key={f.fieldId}>
                  <td>{field.label}</td>
                  <td>{f.status === 'conflict' ? <span className="h-hatch h-hatch--cell">Channels disagree</span> : f.value ?? '—'}</td>
                  <td>{f.status === 'conflict' ? f.observations.find((o) => o.source.kind === ch)?.value ?? '—' : onCh.text}{f.overrides[ch] && <span className="h-caption h-muted"> · kept per channel</span>}</td>
                  <td>{f.status === 'conflict' ? <Link className="h-link h-caption" to={`/property/${propertyId}/overview/needs-you`}>Decide</Link> : f.sync[ch] ? <SyncBadge state={f.sync[ch]!} channel={ch} /> : null}</td>
                </tr>
              )
            })}
          </tbody></table>
        )}
      </div>
      <section className="p-card">
        <div className="p-label">Waiting to push</div>
        {queued.length === 0 ? <p className="h-small h-muted">Nothing.</p> : queued.map((q) => (
          <div key={q.id} className="h-small p-mt2">{q.label}: <span className="h-diff"><del>{q.before}</del> <ins>{q.after}</ins></span></div>
        ))}
        <p className="h-caption h-muted p-mt3">Changed on the channel directly? It shows here as “Changed on {CHANNELS[ch].name} · Review”, never overwritten silently (S14 designs the drift states).</p>
      </section>
    </div>
  )
}
