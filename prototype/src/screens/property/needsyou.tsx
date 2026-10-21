/* SCR-02 · Reconcile = Overview › Needs you · owner S10. The import lands here (X-5), not on a checklist.
 * Exceptions only, money and stay rules first (I-01, I-11), where first (I-08), consequence per option (C4),
 * "Queued for review · written: nothing" instead of "decided for you" (principle 1), List / One by one (C3's pace).
 * Every item names its real home and can be opened there (IA rule 6); S11 renders the same card inline in its tabs.
 * R-002 R-003 R-004 R-084 R-086 R-087 R-088 R-091 · D-104 D-123 D-127 D-131 D-132 D-133 D-136 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AskCard, BottomSheet, Button, ChannelChip, DecisionCard, Explainer, FactRow, Icon, Mark, Marks, MobileActionBar, Photo, Pill, PushTray, Segmented, SourceChip, useIsMobile } from '../../ds'
import { FIELD } from '../../data/canonical'
import { CHANNELS } from '../../data/channels'
import { PROPERTY_RAIL, slug } from '../../data/ia'
import { PROPERTY_ID, QUEUED_REVIEW } from '../../data/scenario'
import type { ChannelId, Decision, Fact } from '../../data/types'
import { GROUP_LABEL, decisionsByGroup, needsYou, queueByChannel } from '../../store/selectors'
import { useStore } from '../../store/store'
import { useDemo } from '../import/frame'
import { plain, usePersona } from '../import/persona'

export function NeedsYou() {
  const s = useStore()
  const nav = useNavigate()
  const p = usePersona()
  const ny = needsYou(s)
  const [q] = useSearchParams()
  const [sel, setSel] = useState<string | null>(q.get('item'))
  const one = s.prefs.needsYouMode === 'one-by-one'
  const open = ny.open
  const currentId = sel ?? open[0]?.id ?? (ny.questions[0] ? `q:${ny.questions[0].id}` : null)
  const current = s.decisions.find((d) => d.id === currentId)
  const question = currentId?.startsWith('q:') ? s.questions.find((q) => `q:${q.id}` === currentId) : undefined
  const decided = s.decisions.filter((d) => d.status === 'decided').length
  const idx = open.findIndex((d) => d.id === currentId)
  const next = () => setSel(open[(idx + 1) % Math.max(open.length, 1)]?.id ?? null)
  // Phones (ds/mobile.md §7): List = cards; a tap opens the decision in a full-screen sheet.
  // One by one = one card per screen, Skip + Confirm in the sticky bar (Confirm presses the card's own Confirm).
  const mobile = useIsMobile()
  const demo = useDemo()
  const [sheet, setSheet] = useState(false)
  const pick = (id: string) => { setSel(id); if (mobile) setSheet(true) }
  const done = () => { setSheet(false); setSel(null) }
  const detailRef = useRef<HTMLElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [canConfirm, setCanConfirm] = useState(false)
  const [sheetConfirm, setSheetConfirm] = useState(false)
  useLayoutEffect(() => {
    setCanConfirm(!!detailRef.current?.querySelector(CONFIRM))
    setSheetConfirm(!!sheetRef.current?.querySelector(CONFIRM))
  })
  const confirm = () => detailRef.current?.querySelector<HTMLButtonElement>(CONFIRM)?.click()
  const press = (sel: string) => sheetRef.current?.querySelector<HTMLButtonElement>(sel)?.click()
  const detail = current ? <Detail key={current.id} d={current} onDone={done} />
    : question ? <AskCard key={question.id} q={question} onAnswer={(a) => { s.answerQuestion(question.id, a); done() }} onLater={() => { s.deferQuestion(question.id); done() }} />
    : <Explainer title="Nothing left to decide">Everything else was imported as it is, and nothing has been written. Review what will change on each channel, then go live.</Explainer>
  const listSheet = mobile && !one

  return (
    <div className={`p-mt4 p-nyroot${one ? ' is-one' : ''}`}>
      <SetupBanner decided={decided} total={s.decisions.length} />
      {p.id === 'P4' && decided === 0 && (
        <div className="h-coach p-mt3" role="note" style={{ position: 'static', maxWidth: 640 }}>
          <div className="h-coach__title">Why is Hostaway asking you this?</div>
          Your Airbnb and Booking.com {plain(p, 'channels')} don’t agree on a few things. Hostaway won’t guess: you choose, once. Money comes first. Nothing changes on Airbnb until you say so.
        </div>
      )}
      <div className={one ? 'p-one p-mt4' : 'p-ny p-mt4'}>
        {!one && (
          <nav aria-label="Needs you">
            <div className="p-row p-sb"><span className="p-label">Needs you · {decided} of {s.decisions.length} decided</span><ModeSwitch /></div>
            {decisionsByGroup(ny.decisions).map(([g, list]) => (
              <div key={g + list[0].id}>
                <div className="p-label p-mt4">{list[0].kind === 'opt-in' ? 'Last step' : GROUP_LABEL[g]}</div>
                {list.map((d) => (
                  <button key={d.id} className="p-card p-card--pick p-mt2" aria-current={!listSheet && d.id === currentId} aria-haspopup={listSheet ? 'dialog' : undefined} onClick={() => pick(d.id)}>
                    <div className="p-row p-sb h-small" style={{ fontWeight: 600, flexWrap: 'nowrap' }}>
                      <span>{d.status === 'decided' ? <Icon name="circle-check" size={16} className="p-ok" /> : null} {d.title}</span>
                      {d.channels.length > 0 && <Marks channels={d.channels} />}
                    </div>
                    <div className="h-caption h-muted">{d.status === 'later' ? 'Later · ' : d.status === 'decided' ? `${optionLabel(d)} · ` : ''}{d.meta}</div>
                  </button>
                ))}
              </div>
            ))}
            {ny.questions.length > 0 && <>
              <div className="p-label p-mt4">Missing on both · {ny.questions.length}</div>
              {ny.questions.map((q) => (
                <button key={q.id} className="p-card p-card--pick p-mt2" aria-current={!listSheet && `q:${q.id}` === currentId} aria-haspopup={listSheet ? 'dialog' : undefined} onClick={() => pick(`q:${q.id}`)}>
                  <div className="h-small" style={{ fontWeight: 600 }}>{q.question}</div>
                  <div className="h-caption h-muted">{FIELD[q.fieldId]?.label} · asked, never guessed</div>
                </button>
              ))}
            </>}
          </nav>
        )}
        <section aria-label="Decision" className="p-col" ref={detailRef}>
          {one && (
            <div className="p-row p-sb">
              <span className="p-label">{open.length ? `${Math.max(idx + 1, 1)} of ${open.length} · ${open.length} left · money and rules first` : 'All decided'}</span>
              <div className="p-row"><ModeSwitch />{!mobile && open.length > 1 && <Button size="md" onClick={next}>Skip for now</Button>}</div>
            </div>
          )}
          {!listSheet && detail}
          <div className="p-card"><PushTray counts={queueByChannel(s)} channels={['airbnb', 'booking']} onReview={() => nav('/import/go-live')} /></div>
          {!one && <Context />}
        </section>
      </div>
      {one && <div className="p-mt6" style={{ maxWidth: 760, marginInline: 'auto' }}><Context /></div>}
      {/* the card's own Confirm / Decide later move to the sheet's pinned footer */}
      {listSheet && <BottomSheet open={sheet} fullScreen title={current?.title ?? question?.question ?? 'Needs you'} onClose={() => setSheet(false)}
        footer={sheetConfirm ? <>
          {current?.kind !== 'consequence' || demo !== 'pricing-tool' ? <Button size="lg" onClick={() => press(LATER)}>Decide later</Button> : null}
          <Button kind="primary" size="lg" onClick={() => press(CONFIRM)}>Confirm</Button></> : undefined}>
        <div ref={sheetRef} className={`p-col p-nysheet${sheetConfirm ? ' has-foot' : ''}`}>{detail}</div>
      </BottomSheet>}
      {mobile && one && (open.length > 1 || canConfirm) && (
        <MobileActionBar>
          {open.length > 1 && <Button size="lg" onClick={next}>Skip for now</Button>}
          {canConfirm && <Button kind="primary" size="lg" onClick={confirm}>Confirm</Button>}
        </MobileActionBar>
      )}
    </div>
  )
}

/** The Confirm of the decision on screen: DecisionCard's own, or the demo PricingTool's. */
const CONFIRM = '.h-conflict__foot .h-btn--primary, .p-ny-confirm'
const LATER = '.h-conflict__foot .h-btn--secondary'

function ModeSwitch() {
  const s = useStore()
  return <Segmented label="How to go through them" value={s.prefs.needsYouMode} onChange={(v) => s.setPref('needsYouMode', v)}
    items={[{ id: 'list', label: 'List' }, { id: 'one-by-one', label: 'One by one' }]} />
}

const optionLabel = (d: Decision) => d.options.find((o) => o.id === d.choice)?.label ?? ''

function SetupBanner({ decided, total }: { decided: number; total: number }) {
  const s = useStore()
  const nav = useNavigate()
  if (s.setup.live) {
    const live = s.receipts.filter((r) => r.state === 'live').length
    return (
      <div className="p-strip"><span className="h-small"><Icon name="circle-check" size={16} className="p-ok" /> <b>Live.</b> {live} {live === 1 ? 'change' : 'changes'} confirmed by the channels. Calendar and messages are running.</span>
        <Button size="md" onClick={() => nav(`/property/${PROPERTY_ID}/overview/channels`)}>See receipts</Button></div>
    )
  }
  const all = decided === total
  return (
    <div className="p-strip">
      <span className="h-small"><b>First-time setup</b> · {decided} of {total} decided · <b>nothing written to Airbnb or Booking.com yet</b></span>
      <div className="p-row">
        <Button size="md" onClick={() => nav('/import/found')}>What we found</Button>
        <Button kind={all ? 'primary' : 'secondary'} size="md" onClick={() => nav('/import/go-live')}>Review changes &amp; go live</Button>
      </div>
    </div>
  )
}

/* ---------------- one detail per kind ---------------- */
function Detail({ d, onDone }: { d: Decision; onDone: () => void }) {
  const s = useStore()
  const nav = useNavigate()
  const p = usePersona()
  const demo = useDemo()
  // The opt-in's recommendation follows the persona default (D-127): ticked for P2/P3, unticked for P1/P4.
  const dd: Decision = d.kind === 'opt-in' ? { ...d, recommended: p.smartListingsDefault ? 'on' : 'off' } : d
  const decide = (o: string, rule: boolean) => { s.decide(d.id, o, rule); onDone() }
  const later = () => { s.deferDecision(d.id); onDone() }
  if (d.status === 'decided') {
    return (
      <div className="p-card">
        <div className="p-row p-sb"><b>{d.title}</b><Pill kind="recommended">Decided</Pill></div>
        <p className="h-small" style={{ margin: '8px 0 0' }}>{optionLabel(d)}. {d.options.find((o) => o.id === d.choice)?.consequence}</p>
        {d.rule && <p className="h-caption h-muted" style={{ margin: '6px 0 0' }}>Saved as a rule for next time.</p>}
        <div className="p-row p-mt3"><Button size="md" onClick={() => s.reopenDecision(d.id)}>Change</Button><HomeLink d={d} /></div>
      </div>
    )
  }
  const card = <DecisionCard d={dd} onDecide={decide} onLater={later} />
  return (
    <>
      {d.kind === 'merge' && <MergeEvidence />}
      {d.kind === 'consequence' && demo === 'pricing-tool' ? <PricingTool onDone={onDone} /> : <>
        {d.group === 'photos' ? <PhotoLibrary /> : null}
        {d.kind === 'baseline' && <Baseline />}
        {d.kind === 'opt-in' && <OptInWhat />}
        {card}
      </>}
      {d.kind === 'conflict' && d.fieldId && <Originals fact={s.facts[d.fieldId]} />}
      {d.kind === 'conflict' && d.fieldId && <AfterPreview fieldId={d.fieldId} />}
      <div className="p-row"><HomeLink d={d} />{p.id === 'P3' && d.kind === 'conflict' && <Button size="md" icon="stack-2" onClick={() => nav('/')}>Decide for all 12 properties</Button>}</div>
    </>
  )
}

const V3_WHERE: Record<string, string> = {
  home: 'Knowledge Hub', arrival: 'Airbnb › Listing › Arrival', rules: 'Airbnb › Listing › Rules', pricing: 'Airbnb › Pricing', listing: 'Airbnb',
}
function HomeLink({ d }: { d: Decision }) {
  const nav = useNavigate()
  const [, , , section, tab] = d.home.split('/')
  const rail = PROPERTY_RAIL.find((r) => r.path === section)
  // v3 names for the old IA-R paths (routes.tsx redirects them): the label says where the link really lands (QA B30)
  const where = V3_WHERE[section] ?? [rail?.label ?? section, rail?.tabs?.find((t) => slug(t) === tab)].filter(Boolean).join(' › ')
  if (section === 'overview') return null // it lives here (merge, opt-in): no link to the page you're on
  return <button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => nav(d.home)}>Open where this lives: {where} →</button>
}

function MergeEvidence() {
  return (
    <div className="p-card">
      <div className="p-row p-sb"><b>Why we think it’s one place</b><span className="h-confidence">High confidence</span></div>
      <ul className="p-list">
        <li><Icon name="check" size={16} className="p-ok" /><span>Same street address</span></li>
        <li><Icon name="check" size={16} className="p-ok" /><span>11 of Booking.com’s 14 photos are the same images as on Airbnb</span></li>
        <li><Icon name="check" size={16} className="p-ok" /><span>Same capacity: 2 guests, 1 bedroom</span></li>
      </ul>
    </div>
  )
}

/** v0: each channel's value as imported — kept, visible, restorable (R-004, R-087). */
function Originals({ fact }: { fact?: Fact }) {
  if (!fact) return null
  return (
    <div className="p-card">
      <div className="p-label">As imported</div>
      <div className="p-grid-2c p-mt2">
        {fact.observations.map((o) => (
          <div key={o.source.kind} className="p-col" style={{ gap: 4 }}>
            <span className="h-small"><b>{o.value}</b></span>
            <SourceChip source={o.source} />
          </div>
        ))}
      </div>
      <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Whatever you choose, we keep a copy of what was imported.</p>
    </div>
  )
}

/** "After you confirm, this is the fee": one fact, per-channel values (R-084). */
function AfterPreview({ fieldId }: { fieldId: string }) {
  const s = useStore()
  const f = s.facts[fieldId]
  const field = FIELD[fieldId]
  if (!f || !field) return null
  const preview: Fact = f.status === 'conflict' && f.observations.length === 2
    ? { ...f, value: 'Per channel', status: 'confirmed', source: { kind: 'host', at: new Date().toISOString(), detail: 'Decided: keep per channel' },
        overrides: { airbnb: { value: f.observations[0].value, reason: 'kept at import', at: '' }, booking: { value: f.observations[1].value, reason: 'kept at import', at: '' } } }
    : f
  return (
    <div className="p-card">
      <div className="p-label">{f.status === 'conflict' ? 'If you keep it per channel, it reads' : 'Now it reads'}</div>
      <FactRow field={field} fact={preview} lens="all" channels={['airbnb', 'booking']} />
    </div>
  )
}

function PhotoLibrary() {
  const s = useStore()
  const strip = (c: ChannelId) => {
    const order = s.listings[c as 'airbnb' | 'booking'].photoOrder.slice(0, 8)
    return (
      <div className="p-mt2">
        <div className="p-row p-sb"><ChannelChip channel={c} /><span className="h-caption h-muted">{s.listings[c as 'airbnb' | 'booking'].photoOrder.length} photos · cover first</span></div>
        <div className="p-photos p-mt2">
          {order.map((id, i) => {
            const ph = s.photos.find((x) => x.id === id)!
            const only = ph.channels.length === 1
            return <Photo key={id} tone={ph.tone} badge={i === 0 ? 'Cover' : only ? 'Only here' : undefined} style={{ height: 56 }} />
          })}
        </div>
      </div>
    )
  }
  return (
    <div className="p-card">
      <div className="p-label">One library · 21 photos</div>
      {strip('airbnb')}{strip('booking')}
      <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Duplicates matched by image (11 on both). Each channel keeps its own order and cover unless you change it.</p>
    </div>
  )
}

/** The factual baseline (R-088): no adjectives, every sentence linked to the facts it uses (D-133). */
const BASELINE: Array<{ text: string; uses: string[] }> = [
  { text: 'Two-room apartment of 48 m² on the 4th floor, no elevator, in Neukölln, Berlin.', uses: ['space.size', 'space.floor_and_access', 'location.address'] },
  { text: 'One bedroom with a double bed and one bathroom with a shower; sleeps 2.', uses: ['space.beds', 'space.bathrooms_full', 'space.max_guests'] },
  { text: 'Kitchen with dishwasher, washer, heating, Wi-Fi and a dedicated workspace.', uses: ['amenity.kitchen', 'amenity.dishwasher', 'amenity.washer', 'amenity.wifi', 'amenity.workspace'] },
  { text: 'Self check-in with a keypad; checkout by 2:00 PM.', uses: ['arrival.checkin_method', 'arrival.checkout_time'] },
  { text: 'No smoking, no events; pets on Booking.com only.', uses: ['rules.pets', 'rules.smoking', 'rules.events'] },
  { text: 'Tempelhofer Feld is 5 minutes on foot; Hermannplatz U-Bahn is 1.2 km away.', uses: ['location.area_highlights'] },
]

function Baseline() {
  const s = useStore()
  const [hover, setHover] = useState<number | null>(null)
  const chips = useMemo(() => (hover === null ? [] : BASELINE[hover].uses), [hover])
  // stacked, not side by side: the baseline is the thing to read; the originals are the comparison under it
  return (
    <div className="p-col">
      <div className="p-card">
        <div className="p-row p-sb"><b>The facts, in plain words</b><Pill kind="ai">Written from your facts</Pill></div>
        <p className="h-small" style={{ lineHeight: 1.7, margin: '8px 0 0' }}>
          {BASELINE.map((b, i) => (
            <span key={i} className={`p-cite${hover === i ? ' is-on' : ''}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}>{b.text} </span>
          ))}
        </p>
        <div className="p-row p-mt3" style={{ gap: 6, minHeight: 28 }}>
          {hover === null ? <span className="h-caption h-muted">Point at a sentence to see the facts it uses.</span>
            : chips.map((id) => <span key={id} className="h-source" title={s.facts[id]?.value ?? ''}><Icon name="list-details" />{FIELD[id]?.label}</span>)}
        </div>
        <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>No adjectives, no selling. It’s never sent anywhere. Each channel’s text is written from it.</p>
      </div>
      <div className="p-grid-2c">
        <div className="p-card"><ChannelChip channel="airbnb" /><p className="h-small h-muted" style={{ margin: '6px 0 0' }}>“{s.listings.airbnb.description.slice(0, 150)}…”</p><div className="h-caption h-muted">Your Airbnb description stays as it is.</div></div>
        <div className="p-card"><ChannelChip channel="booking" /><p className="h-small h-muted" style={{ margin: '6px 0 0' }}>“{s.listings.booking.description}”</p><div className="h-caption h-muted">Booking.com writes this itself, from your facts.</div></div>
      </div>
    </div>
  )
}

function OptInWhat() {
  return (
    <div className="p-card">
      <div className="p-label">What Smart Listings changes</div>
      <ul className="p-list">
        <li><Icon name="sparkles" size={16} /><span>Suggested titles, descriptions and photo order for each channel appear as tips in each channel’s <b>Listing</b> page.</span></li>
        <li><Icon name="chart-line" size={16} /><span><b>Performance</b> compares each version with similar listings nearby.</span></li>
        <li><Icon name="shield-check" size={16} /><span>Nothing changes without you. The AI only says what your facts back, and asks when it doesn’t know.</span></li>
        <li><Icon name="home" size={16} /><span>Everything else works the same either way: the Knowledge Hub, each channel’s listing, receipts. Turn it off any time.</span></li>
      </ul>
    </div>
  )
}

/** Demo: prices owned by a third-party tool (Gong: "pricing not syncing as expected"). */
function PricingTool({ onDone }: { onDone: () => void }) {
  const s = useStore()
  return (
    <div className="p-card">
      <div className="p-row p-sb"><b>Your prices come from PriceLabs</b><ChannelChip channel="airbnb" /></div>
      <p className="h-small" style={{ margin: '8px 0 0' }}>PriceLabs sets your nightly rates on Airbnb and Booking.com today. Only one tool can. Until you change it, <b>Hostaway reads your prices and never sends a rate.</b></p>
      <div className="h-radio-cards p-mt3">
        <label className="h-radio-card" aria-checked="true"><input className="h-radio" type="radio" defaultChecked name="pt" /><div><div className="h-radio-card__title">Keep PriceLabs in charge <Pill kind="recommended">Recommended</Pill></div><div className="h-radio-card__desc">Fees, minimum stays and rules still come from Hostaway.</div></div></label>
        <label className="h-radio-card"><input className="h-radio" type="radio" name="pt" /><div><div className="h-radio-card__title">Let Hostaway set prices</div><div className="h-radio-card__desc">Disconnect PriceLabs first, or it will overwrite Hostaway’s rates.</div></div></label>
      </div>
      <div className="p-row p-mt3"><Button kind="primary" className="p-ny-confirm" onClick={() => { s.decide('smart-pricing', 'keep'); onDone() }}>Confirm</Button></div>
    </div>
  )
}

function Context() {
  const nav = useNavigate()
  return (
    <aside className="p-context" aria-label="Context">
      <div className="p-card">
        <div className="p-label">Queued for review · {QUEUED_REVIEW.length}</div>
        <div className="h-caption h-muted">Written: nothing</div>
        {QUEUED_REVIEW.map((r) => (
          <div key={r.id} className="p-row p-sb h-small p-mt2" style={{ flexWrap: 'nowrap' }} title={r.why}><span>{r.label}</span><Marks channels={r.channels} /></div>
        ))}
      </div>
      <Explainer title="Why these need you">They change money or rules, or the two channels disagree on something that must match. Anything else is queued, not written.</Explainer>
      <div className="p-card">
        <div className="p-label">See them as guests do</div>
        {(['airbnb', 'booking'] as ChannelId[]).map((c) => (
          <button key={c} className="h-link p-row p-mt2" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => nav(`/property/${PROPERTY_ID}/listing/${c}/preview`)}>
            <Mark channel={c} />{CHANNELS[c].name} listing
          </button>
        ))}
      </div>
    </aside>
  )
}

