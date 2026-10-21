/* SCR-04 · The home › Listing text — the Smart Listing studio (D-123, D-140). Editor first; the preview is a toggle
 * (D-124). Lens All = the facts in plain words (R-088) · Airbnb = voice per channel (R-100…R-110) · Booking.com =
 * facts and completeness, no description box (D-032, D-146). Nothing reaches a channel except through Review & push.
 * owner S11 · R-005 R-006 R-100 R-101 R-102 R-103 R-105 R-106 R-107 R-108 R-109 R-110 R-111 R-112 R-113 R-114 R-116
 * D-123 D-124 D-140 D-141 D-142 D-143 D-145 D-146 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AskCard, AutonomyControl, AutonomyNotice, Button, ChannelChip, Explainer, Icon, Mark, Photo, Pill, ReorderList, Segmented,
  SourceChip, SuggestionCard, Toggle,
} from '../../ds'
import { AUTONOMY_NAME } from '../../ds/studio'
import { CHANNELS } from '../../data/channels'
import { seedListings } from '../../data/scenario'
import {
  PAGE_SCORE_RAISERS, STRATEGIES, bookingWrites, scoreTitle, strategyFit, titleOptions,
} from '../../data/studio'
import type { ChannelId, Listing, StrategyId } from '../../data/types'
import { useStore } from '../../store/store'
import { Description } from './Description'
import { Insights } from './Insights'
import { AirbnbPage, PREVIEW_SECTIONS, amenityIcon, amenityLabel, photoById, type PreviewSection } from './parts'
import { TitlePanel } from './TitlePanel'

type Lens = ChannelId | 'all'

export function ListingText({ lens, propertyId }: { lens: Lens; propertyId: string }) {
  if (lens === 'booking') return <BookingStudio propertyId={propertyId} />
  if (lens === 'all') return <FactsInPlainWords propertyId={propertyId} />
  return <AirbnbStudio propertyId={propertyId} />
}

/* ---------------- All: the facts in plain words (R-088) ---------------- */
function FactsInPlainWords({ propertyId }: { propertyId: string }) {
  const s = useStore()
  const f = s.facts['copy.factual_baseline']
  const d = s.decisions.find((x) => x.id === 'baseline')
  return (
    <div className="p-grid-2 p-mt4">
      <section className="p-card">
        <div className="p-row p-sb"><div className="p-label">The facts in plain words</div>{f && <SourceChip source={f.source} />}</div>
        <p style={{ margin: '10px 0 0', lineHeight: 'var(--leading-md)' }}>{f?.value}</p>
        <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>No adjectives, no claims the home can’t back. Every channel’s text is written from this, so fixing a fact fixes every text.</p>
        {d && d.status !== 'decided' ? (
          <div className="p-row p-mt3"><Button kind="primary" onClick={() => s.decide('baseline', 'ok')}>These facts are right</Button><Link className="h-link h-small" to={`/property/${propertyId}/home/the-basics`}>Something is wrong: fix it where it lives</Link></div>
        ) : <p className="h-small p-mt3"><Icon name="circle-check" size={16} /> Confirmed by you. Nothing is sent anywhere.</p>}
      </section>
      <div className="p-col">
        {(['airbnb', 'booking'] as const).map((c) => (
          <div key={c} className="p-card">
            <div className="p-row p-sb"><ChannelChip channel={c} /><span className="h-caption h-muted">{c === 'airbnb' ? 'Adapted from the facts, in your voice' : 'Booking.com writes its own'}</span></div>
            <div className="h-small p-mt2"><b>{s.listings[c].title}</b></div>
            <p className="h-caption h-muted" style={{ margin: '4px 0 0' }}>{c === 'airbnb' ? `${s.listings.airbnb.description.slice(0, 110)}…` : 'Written by Booking.com from your facts, in 25+ languages.'}</p>
            <Link className="h-link h-caption" to={`?lens=${c}`}>Open {CHANNELS[c].name}</Link>
          </div>
        ))}
        <p className="h-caption h-muted">Direct and Vrbo aren’t connected for this property.</p>
      </div>
    </div>
  )
}

/* ---------------- Airbnb: the studio ---------------- */
const STRATEGY_PHOTO: Partial<Record<StrategyId, string>> = { remote: 'ph-02', business: 'ph-02', romantic: 'ph-07', fun: 'ph-21' }

function AirbnbStudio({ propertyId }: { propertyId: string }) {
  const s = useStore()
  const nav = useNavigate()
  const listing = s.listings.airbnb
  const strategy = s.studio.strategy.airbnb ?? null
  const [params] = useSearchParams()
  const initialFocus = params.get('focus') as PreviewSection | null
  const [panel, setPanel] = useState(initialFocus === 'title')
  const [focus, setFocus] = useState<PreviewSection | null>(initialFocus)
  useEffect(() => {
    if (initialFocus && initialFocus !== 'title') document.getElementById(`studio-${initialFocus === 'amenities' ? 'highlights' : initialFocus}`)?.scrollIntoView({ block: 'start' })
  }, [initialFocus])
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState(listing.title)
  const [pv, setPv] = useState<'live' | 'next'>('next')
  const [show, setShow] = useState<Record<PreviewSection, boolean>>({ title: true, photos: true, highlights: true, description: true, amenities: false })
  useEffect(() => setDraftTitle(listing.title), [listing.title])

  const limit = CHANNELS.airbnb.titleLimit ?? 50
  const options = titleOptions('airbnb', strategy, s.facts)
  const rec = options[0]
  // One unsolicited suggestion per screen (ai-patterns §2): once the host has chosen a title, the recommendation steps back.
  const titleQueued = s.queue.some((q) => q.channel === 'airbnb' && q.fieldId === 'copy.title')
  const showRec = s.smartListings && rec && rec.text !== listing.title && dismissed !== rec.text && !titleQueued
  const titleLevel = s.studio.autonomy['airbnb.title'] ?? 'suggest'
  const over = draftTitle.length > limit
  const commitTitle = () => { if (!over && draftTitle.trim() && draftTitle !== listing.title) s.setListingField('airbnb', 'title', draftTitle.trim()) }

  // Live now = the last pushed version (v0 = as imported); "After push" = the record with queued changes + suggestions.
  const lastV = s.versions.filter((v) => v.channel === 'airbnb').sort((a, b) => b.n - a.n)[0]
  const seed = seedListings().airbnb
  const live: Listing = { ...listing, title: lastV?.title ?? seed.title, description: lastV?.description ?? seed.description, photoOrder: lastV?.photoOrder ?? seed.photoOrder, highlightedAmenities: lastV?.highlightedAmenities ?? seed.highlightedAmenities }
  const next: Listing = showRec ? { ...listing, title: rec.text } : listing
  const shown = pv === 'live' ? live : next
  const changed: Partial<Record<PreviewSection, string>> = pv === 'live' ? {} : {
    ...(next.title !== live.title ? { title: showRec ? 'Suggested' : 'Queued' } : {}),
    ...(next.description !== live.description ? { description: 'Queued' } : {}),
    ...(next.photoOrder.join() !== live.photoOrder.join() ? { photos: 'Queued' } : {}),
    ...(next.highlightedAmenities.join() !== live.highlightedAmenities.join() ? { highlights: 'Queued' } : {}),
  }
  const pick = (sec: PreviewSection) => {
    setFocus(sec)
    if (sec === 'title') setPanel(true)
    else document.getElementById(`studio-${sec === 'amenities' ? 'highlights' : sec}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const hlSug = s.smartListings ? s.suggestions.find((g) => g.id === 'highlights-airbnb' && g.status === 'proposed') : undefined
  const photos = listing.photoOrder.map((id) => photoById(s.photos, id)).filter(Boolean).map((p) => p!)
  const hl = listing.highlightedAmenities.map((id) => ({ id }))

  return (
    <>
      {!s.smartListings && (
        <div className="p-mt4"><Explainer title="Smart Listings is off">You can write and reorder everything here. Turn Smart Listings on to get suggestions grounded in your facts and similar listings (D-127). <button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => s.setSmartListings(true)}>Turn on</button></Explainer></div>
      )}

      {/* Strategies (R-110, D-143): lenses that propose, never apply */}
      <section className="p-mt4" aria-labelledby="strat-h">
        <div className="p-row p-sb"><span className="p-label" id="strat-h">Try a strategy</span><span className="h-caption h-muted">Suggestions only: nothing changes until you accept</span></div>
        <div className="h-chips p-mt2" role="group" aria-label="Strategy">
          {STRATEGIES.map((st) => {
            const fit = strategyFit(st.id, s.facts)
            return (
              <button key={st.id} className="h-chip" aria-pressed={strategy === st.id} disabled={fit.fit === 'blocked'} title={fit.reason}
                style={fit.fit === 'blocked' ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                onClick={() => s.setStrategy('airbnb', strategy === st.id ? null : st.id)}>
                <Icon name={st.icon} />{st.label}{fit.fit === 'weak' && <span className="h-caption"> · weak fit</span>}
              </button>
            )
          })}
        </div>
        {strategy && (() => {
          const st = STRATEGIES.find((x) => x.id === strategy)!
          const fit = strategyFit(strategy, s.facts)
          return (
            <div className="h-insight p-mt3"><Icon name="bulb" /><div>
              <div className="h-insight__text"><b>{st.label}:</b> {st.effect} {fit.reason}</div>
              <div className="h-caption h-muted" style={{ marginTop: 4 }}>{st.comps.count} similar listings lead with it · {Math.round(st.comps.occupancy * 100)}% booked · ADR €{st.comps.adr} · Sample market data</div>
              <div className="h-insight__foot">
                <span className="h-caption">Price: {st.pricing.text}</span>
                <Link className="h-link h-caption" to={`/property/${propertyId}/pricing/${st.pricing.tab}`}>Open Pricing</Link>
              </div>
            </div></div>
          )
        })()}
      </section>

      <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: s.prefs.previewOn || panel ? 'minmax(0, 1fr) 420px' : 'minmax(0, 1fr)' }}>
        <div className="p-col" style={{ gap: 16 }}>
          {/* Title (F-B1) */}
          <section className="p-card" id="studio-title" style={focus === 'title' ? { outline: '2px solid var(--color-action-primary)' } : undefined}>
            <div className="p-row p-sb">
              <div className="p-label">Title · Airbnb</div>
              <div className="p-row" style={{ gap: 8 }}>
                <SourceChip source={listing.title === seed.title ? { kind: 'airbnb', at: '', detail: 'v0' } : { kind: 'host', at: '' }} />
                <AutonomyControl value={titleLevel} onChange={(v) => s.setAutonomy('airbnb', 'title', v)} scope="titles on Airbnb, this property" />
              </div>
            </div>
            <div className="p-row p-mt2" style={{ flexWrap: 'nowrap' }}>
              <input className="h-input" aria-label="Airbnb title" aria-invalid={over} value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitle} onKeyDown={(e) => { if (e.key === 'Enter') commitTitle() }} style={{ flex: 1 }} />
              <span className={`h-caption${over ? '' : ' h-muted'}`} style={over ? { color: 'var(--color-error-600)', fontWeight: 600 } : undefined}>{draftTitle.length} / {limit}</span>
            </div>
            {over && <p className="h-caption" style={{ color: 'var(--color-error-600)', margin: '6px 0 0' }}>Airbnb titles can be 50 characters at most. This one can’t be saved until it fits.</p>}
            {showRec && (
              <div className="p-mt3">
                {titleLevel === 'suggest' ? (
                  <SuggestionCard
                    s={{ id: 'rec', channel: 'airbnb', target: 'title', fieldId: 'copy.title', current: listing.title, proposed: rec.text, why: rec.why, uses: rec.uses, confidence: rec.strength >= 4 ? 'High' : 'Medium', status: 'proposed' }}
                    onAccept={() => s.setListingField('airbnb', 'title', rec.text)} onDismiss={() => setDismissed(rec.text)}
                    extra={<Button onClick={() => setPanel(true)}>See {options.length - 1} alternatives</Button>} />
                ) : (
                  <AutonomyNotice onChange={() => s.setAutonomy('airbnb', 'title', 'suggest')}>
                    “{rec.text}” applies to Airbnb under <b>{AUTONOMY_NAME[titleLevel]}</b>{titleLevel === 'auto-review' ? ' in 24 h unless you stop it' : ' at the next push'}.
                    {' '}<button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => s.setListingField('airbnb', 'title', rec.text)}>Apply now</button>
                    {' · '}<button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => setDismissed(rec.text)}>Stop</button>
                  </AutonomyNotice>
                )}
              </div>
            )}
            {!showRec && s.smartListings && <div className="p-row p-mt3"><Button icon="sparkles" onClick={() => setPanel(true)}>Suggest titles</Button><span className="h-caption h-muted">Strength of the current title: {['weak', 'weak', 'fair', 'good', 'strong'][scoreTitle({ text: listing.title, strategy: 'balanced', why: '', uses: ['x'] }, 'airbnb').strength]}</span></div>}
          </section>

          <Description strategy={strategy} />

          {/* Photos (R-105, F-B6 for Airbnb) */}
          <section className="p-card" id="studio-photos">
            <div className="p-row p-sb">
              <div className="p-label">Photo order · Airbnb</div>
              <div className="p-row" style={{ gap: 8 }}>
                {strategy && STRATEGY_PHOTO[strategy] && (
                  <Button size="md" icon="sparkles" onClick={() => {
                    const id = STRATEGY_PHOTO[strategy]!
                    const ids = listing.photoOrder.filter((x) => x !== id)
                    ids.splice(1, 0, id); s.reorder('airbnb', 'photoOrder', ids)
                  }}>Try the {STRATEGIES.find((x) => x.id === strategy)?.label} order</Button>
                )}
                <AutonomyControl value={s.studio.autonomy['airbnb.photos'] ?? 'suggest'} onChange={(v) => s.setAutonomy('airbnb', 'photos', v)} scope="photo order on Airbnb" />
              </div>
            </div>
            <p className="h-caption h-muted" style={{ margin: '6px 0 8px' }}>You set the cover and the order. Airbnb’s own AI groups its photo tour by room.</p>
            <ReorderList label="Airbnb photo order" items={photos} fold={5} foldLabel="Guests see these 5 first in search and at the top of the page"
              onChange={(ids) => s.reorder('airbnb', 'photoOrder', ids)}
              render={(p) => (<><Photo tone={p.tone} style={{ width: 56, height: 38, minHeight: 0, padding: 0 }} /><span className="h-small">{p.caption}</span>{p.id === listing.photoOrder[0] && <Pill kind="lead">Cover</Pill>}{!p.channels.includes('booking') && <span className="h-caption h-muted">Airbnb only</span>}</>)} />
          </section>

          {/* Highlighted amenities (R-105) */}
          <section className="p-card" id="studio-highlights">
            <div className="p-row p-sb">
              <div className="p-label">Highlights · Airbnb</div>
              <AutonomyControl value={s.studio.autonomy['airbnb.highlights'] ?? 'suggest'} onChange={(v) => s.setAutonomy('airbnb', 'highlights', v)} scope="highlights on Airbnb" />
            </div>
            <p className="h-caption h-muted" style={{ margin: '6px 0 8px' }}>The amenities your listing leads with. Airbnb orders its full amenities page itself. <span title="OQ-140">Assumption: the lead order is honoured</span>.</p>
            {hlSug && (
              <div className="p-mt2" style={{ marginBottom: 10 }}>
                <SuggestionCard s={hlSug} onDismiss={() => s.dismissSuggestion(hlSug.id)} onAccept={() => {
                  const ids = listing.highlightedAmenities.filter((x) => x !== 'amenity.workspace'); ids.splice(1, 0, 'amenity.workspace')
                  s.reorder('airbnb', 'highlightedAmenities', ids)
                  useStore.setState((st) => ({ suggestions: st.suggestions.map((g) => (g.id === hlSug.id ? { ...g, status: 'accepted' } : g)) }))
                }} />
              </div>
            )}
            <ReorderList label="Airbnb highlights" items={hl} fold={3} foldLabel="Guests see these 3 first"
              onChange={(ids) => s.reorder('airbnb', 'highlightedAmenities', ids)}
              render={(a) => (<><Icon name={amenityIcon(a.id)} /><span className="h-small">{amenityLabel(a.id)}</span></>)} />
          </section>
        </div>

        {(panel || s.prefs.previewOn) && (
          <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
            {panel ? <TitlePanel channel="airbnb" strategy={strategy} onClose={() => { setPanel(false); setFocus(null) }} /> : (
              <section className="p-card" aria-label="Preview">
                <div className="p-row p-sb"><span className="p-label">Preview · Airbnb</span>
                  <Segmented label="Preview state" value={pv} onChange={setPv} items={[{ id: 'live', label: 'Live now' }, { id: 'next', label: 'After push' }]} />
                </div>
                <div className="h-chips p-mt2" role="group" aria-label="Sections to show">
                  {PREVIEW_SECTIONS.map((x) => (
                    <button key={x.id} className="h-chip" style={{ height: 28 }} aria-pressed={show[x.id]} onClick={() => setShow({ ...show, [x.id]: !show[x.id] })}>{x.label}</button>
                  ))}
                </div>
                <div className="p-mt3"><AirbnbPage listing={shown} photos={s.photos} show={show} changed={changed} selected={focus} onPick={pick} /></div>
                <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Simplified. Click anything to edit it. {pv === 'next' ? 'Marked parts reach Airbnb when you push.' : 'This is what guests see today.'}</p>
              </section>
            )}
          </div>
        )}
      </div>

      <Insights channel="airbnb" strategy={strategy} propertyId={propertyId} defaultOpen={s.prefs.compsOpen} />

      <div className="p-mt4">
        <AutonomyNotice onChange={() => nav(`/property/${propertyId}/home/listing-text`)}>
          Airbnb · titles <b>{AUTONOMY_NAME[titleLevel]}</b> · descriptions <b>{AUTONOMY_NAME[s.studio.autonomy['airbnb.description'] ?? 'suggest']}</b>. Facts, money and rules never change on their own. Nothing reaches Airbnb until you push.
        </AutonomyNotice>
      </div>
    </>
  )
}

/* ---------------- Booking.com: facts and completeness (D-032, D-146, I-06) ---------------- */
function BookingStudio({ propertyId }: { propertyId: string }) {
  const s = useStore()
  const listing = s.listings.booking
  const [smart, setSmart] = useState(true)
  const names = titleOptions('booking', null, s.facts)
  const answered = (qid?: string) => !!qid && s.questions.find((q) => q.id === qid)?.status === 'answered'
  const score = (listing.pageScore ?? 72) + PAGE_SCORE_RAISERS.filter((r) => answered(r.questionId)).reduce((n, r) => n + r.points, 0)
  const coverSug = s.smartListings ? s.suggestions.find((g) => g.id === 'cover-booking' && g.status === 'proposed') : undefined
  const photos = listing.photoOrder.map((id) => photoById(s.photos, id)).filter(Boolean).map((p) => p!)
  const facilities = ['amenity.wifi', 'amenity.kitchen', 'amenity.dishwasher', 'amenity.washer', 'amenity.heating', 'amenity.workspace', 'amenity.balcony', 'amenity.parking', 'amenity.crib']
  return (
    <>
      <div className="p-mt4"><Explainer title="On Booking.com, your voice is your facts">Booking.com writes the description itself from what we send, in 25+ languages. There’s no description box here on purpose. What you control: the name, the facts, the photos, and completeness.</Explainer></div>
      <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 400px' }}>
        <div className="p-col" style={{ gap: 16 }}>
          <section className="p-card">
            <div className="p-row p-sb"><div className="p-label">Property name · Booking.com</div><SourceChip source={{ kind: 'booking', at: '', detail: 'v0' }} /></div>
            <div className="h-small p-mt2"><b>{listing.title}</b> <span className="h-caption h-muted">{listing.title.length} / 255</span></div>
            <p className="h-caption h-muted" style={{ margin: '6px 0 8px' }}>Booking.com reviews name changes (usually 48 h). Hostaway doesn’t send names to Booking.com today; this assumes Integrations turns it on (OQ-082).</p>
            {s.smartListings && names.filter((n) => n.text !== listing.title).slice(0, 2).map((n) => (
              <div key={n.text} className="h-suggestion p-mt2" onClick={() => s.setListingField('booking', 'title', n.text)} role="button" tabIndex={0}>
                <div className="h-suggestion__text">{n.text}</div>
                <div className="h-suggestion__meta"><span>{n.chars} / 255</span><span className="h-strength" data-level={n.strength}><i /><i /><i /><i /></span><span>{n.why}</span></div>
              </div>
            ))}
          </section>

          <section className="p-card" id="studio-photos">
            <div className="p-row p-sb"><div className="p-label">Photo order · Booking.com</div>
              <label className="p-row h-small" style={{ gap: 8 }}><Toggle checked={!smart} onChange={(v) => { setSmart(!v); if (v) s.queueChange({ channel: 'booking', fieldId: 'photo.order', label: 'Smart photo ordering', before: 'On (Booking.com orders)', after: 'Off (your order)', origin: 'studio' }) }} label="Use my order" />Use my order</label>
            </div>
            {smart ? (
              <p className="h-small" style={{ margin: '8px 0 0' }}>Booking.com’s smart ordering is on: it picks the order from what converts. To set your own order, turn it off. Your order then sticks until you turn it back on.</p>
            ) : (
              <>
                {coverSug && <div className="p-mt2" style={{ marginBottom: 10 }}><SuggestionCard s={coverSug} onDismiss={() => s.dismissSuggestion(coverSug.id)} onAccept={() => {
                  const ids = ['ph-01', ...listing.photoOrder.filter((x) => x !== 'ph-01')]; s.reorder('booking', 'photoOrder', ids)
                  useStore.setState((st) => ({ suggestions: st.suggestions.map((g) => (g.id === coverSug.id ? { ...g, status: 'accepted' } : g)) }))
                }} /></div>}
                <ReorderList label="Booking.com photo order" items={photos} fold={5} foldLabel="Guests see these first"
                  onChange={(ids) => s.reorder('booking', 'photoOrder', ids)}
                  render={(p) => (<><Photo tone={p.tone} style={{ width: 56, height: 38, minHeight: 0, padding: 0 }} /><span className="h-small">{p.caption}</span>{p.id === listing.photoOrder[0] && <Pill kind="lead">Main photo</Pill>}</>)} />
              </>
            )}
          </section>

          <section className="p-card">
            <div className="p-label">Facilities · Booking.com</div>
            <p className="h-caption h-muted" style={{ margin: '6px 0 8px' }}>Booking.com decides which facilities it shows first. There’s no order to set, so we don’t pretend there is (D-146). What you decide is which ones are true.</p>
            <div className="p-row" style={{ gap: 6 }}>
              {facilities.map((id) => {
                const v = s.facts[id]?.value ?? ''
                const on = /^yes|on request|street/i.test(v)
                return <span key={id} className="h-chip" aria-pressed={on} style={{ cursor: 'default', height: 28 }}><Icon name={on ? 'check' : 'help-circle'} />{amenityLabel(id)}{!on && v === '' ? ' · ?' : ''}</span>
              })}
            </div>
          </section>
        </div>

        <div className="p-col" style={{ gap: 16 }}>
          <section className="p-card">
            <div className="h-health" style={{ gridTemplateColumns: '20px 90px minmax(0, 1fr) 40px' }}><Mark channel="booking" /><span><b>Page Score</b></span>
              <span className={`h-health__bar${score < 80 ? ' is-mid' : ''}`}><i style={{ ['--value' as string]: `${score}%` }} /></span><span className="h-health__score">{score}</span></div>
            <p className="h-caption h-muted" style={{ margin: '4px 0 8px' }}>Booking.com’s own completeness score (Property Scores API). At 100%, Booking.com reports up to 18% more bookings.</p>
            <div className="p-label">What would raise it</div>
            <div className="p-col p-mt2" style={{ gap: 10 }}>
              {PAGE_SCORE_RAISERS.map((r) => {
                const q = r.questionId ? s.questions.find((x) => x.id === r.questionId) : undefined
                if (q && q.status === 'open') return <AskCard key={r.id} q={{ ...q, why: `+${r.points} Page Score. ${q.why}` }} onAnswer={(a) => s.answerQuestion(q.id, a)} onLater={() => s.deferQuestion(q.id)} />
                return (
                  <div key={r.id} className="p-row p-sb h-small">
                    <span>{answered(r.questionId) ? <><Icon name="circle-check" size={16} /> {r.label}</> : r.label}</span>
                    {r.to ? <Link className="h-link h-caption" to={`/property/${propertyId}/${r.to}`}>+{r.points} · add photos</Link> : <span className="h-caption h-muted">+{r.points}</span>}
                  </div>
                )
              })}
            </div>
          </section>
          <div className="h-guest">
            <div className="h-guest__chrome"><Mark channel="booking" />booking.com/hotel/de/…<span className="h-guest__label"><Icon name="alert-circle" />Written by Booking.com · Approximate</span></div>
            <div className="h-guest__body">
              <div className="h-small"><b>{listing.title}</b></div>
              <p className="h-small" style={{ margin: '8px 0 0' }}>{bookingWrites(s.facts)}</p>
              <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>An approximation from the facts we send. Booking.com writes and translates the real text.</p>
            </div>
          </div>
        </div>
      </div>
      <Insights channel="booking" propertyId={propertyId} defaultOpen={s.prefs.compsOpen} />
    </>
  )
}
