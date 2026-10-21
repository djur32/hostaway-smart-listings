/* F-A1 step 5 · "What we found" (SCR-01 summary) · owner S10.
 * The import summary AND the preview of how the data is organized (R-090): the host's real facts, already in the
 * recommended IA (Knowledge Hub · Arrival & stay · Rules & booking · Pricing · Listings), with sources. Exceptions only (I-11).
 * R-002 R-003 R-090 R-081 R-089 · D-104 D-110 D-130 D-132 D-136 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Explainer, Icon, Mark, Marks, Pill, SourceChip } from '../../ds'
import { FIELD } from '../../data/canonical'
import { PORTFOLIO } from '../../data/portfolio'
import { IMPORT_COUNTS, PROPERTY_ID } from '../../data/scenario'
import { needsYou } from '../../store/selectors'
import { useStore } from '../../store/store'
import { ConnectFrame, FlowActions, StepTrail, useDemo } from './frame'
import { plain, usePersona } from './persona'

const SEGMENTS = [
  { n: IMPORT_COUNTS.identical, cls: 'p-seg--same', label: 'match on both' },
  { n: IMPORT_COUNTS.perChannelByDesign, cls: 'p-seg--design', label: 'different on purpose (the name)' },
  { n: IMPORT_COUNTS.toDecide, cls: 'p-seg--decide', label: 'differ: you decide' },
  { n: IMPORT_COUNTS.channelOwned, cls: 'p-seg--owned', label: 'Booking.com uses the Airbnb text (the description)' }, // v3: the Base feeds it until you write one (QA B19)
  { n: IMPORT_COUNTS.onlyOne, cls: 'p-seg--one', label: 'only on one channel' },
  { n: IMPORT_COUNTS.empty, cls: 'p-seg--empty', label: 'empty on both' },
]

/** The recommended IA with the host's own facts in it (R-090). Each section shows three real facts, each one the same
 *  value the live Listing base shows (audit GS-2, 3 Oct: pets is per channel there, so events stands in). */
const PREVIEW: Array<{ title: string; icon: string; facts: string[]; more: string }> = [
  { title: 'Knowledge Hub', icon: 'home-heart', facts: ['identity.property_type', 'space.beds', 'amenity.dishwasher'], more: '58 facts · {photos} photos · listing text' },
  { title: 'Arrival & stay', icon: 'clock', facts: ['arrival.checkout_time', 'arrival.checkin_method', 'arrival.checkout_tasks'], more: '12 facts · what the assistant answers' },
  { title: 'Rules & booking', icon: 'shield-check', facts: ['rules.events', 'rules.smoking', 'avail.max_stay'], more: '24 facts · cancellation per channel' },
  // imported facts only: price.base_nightly is the host's own once setup is done, so it doesn't belong in "what we found"
  { title: 'Pricing', icon: 'coin', facts: ['price.weekly_discount', 'fee.extra_guest', 'deposit.amount'], more: '26 facts · fees per channel' },
]

/** What differs between the two channels (the table under the summary). `decide` = a Needs-you item; `p2` = shown to P2 only. */
const DIFFS: Array<{ what: string; airbnb?: string; booking?: string; both?: string; decide?: boolean; then?: string; p2?: boolean }> = [
  { what: 'Cleaning fee', airbnb: '€25', booking: '€30', decide: true, then: 'money' },
  { what: 'Minimum stay', airbnb: '2 nights', booking: '3 nights', decide: true, then: 'stay rule' },
  { what: 'Check-in', airbnb: 'from 3:00 PM', booking: 'from 16:00', decide: true, then: 'we suggest 3:00 PM on both' },
  { what: 'Photos', airbnb: '18 · living-room cover', booking: '14 · bedroom cover', decide: true, then: 'all kept in one photo library' },
  { what: 'Pets', airbnb: 'Not allowed', booking: 'Allowed', then: 'Kept per channel, as on each channel today' },
  { what: 'Weekly · monthly discount', airbnb: '5% · 9%', booking: '10% · 15%', then: 'Kept per channel' },
  { what: 'Amenities', airbnb: '24', booking: '19', then: 'Merged: 17 on both, each keeps its extras' },
  { what: 'Title', airbnb: 'Beautiful Artist Apt…', booking: 'Artist Apartment Neukölln…', then: 'Different on purpose: kept per channel' },
  { what: 'Description', airbnb: '1,020 characters, yours', booking: 'Uses the Airbnb text', then: 'Becomes the Base description; write one for Booking.com any time' }, // v3: editable per channel (QA B19)
  { what: 'Photo order', airbnb: 'tested order, 18', booking: 'smart ordering by Booking.com', then: 'Kept per channel; Booking.com may reorder', p2: true },
  { what: 'Highlighted amenities', airbnb: 'Workspace 6th', booking: '—', then: 'Airbnb only', p2: true },
  { what: 'Empty on both', both: 'Wi-Fi speed, quiet hours, first aid kit, registration number… (11)', then: 'Asked as questions; answer now or later' },
]

/** Why the Needs-you count is more than the differences: the choices only the host can make (short names for the intro). */
const CHOICE_NAME: Record<string, string> = {
  merge: 'whether they’re one place', 'smart-pricing': 'who sets your prices', baseline: 'the facts in plain words', 'smart-listings': 'Smart Listings',
}

export function Found() {
  const nav = useNavigate()
  const [q] = useSearchParams()
  const single = q.get('single') === '1'
  const demo = useDemo()
  const p = usePersona()
  const s = useStore()
  const ny = needsYou(s)
  const total = SEGMENTS.reduce((a, b) => a + b.n, 0)
  const differ = ny.open.filter((d) => d.kind === 'conflict').length
  const choices = ny.open.filter((d) => d.kind !== 'conflict').map((d) => CHOICE_NAME[d.id] ?? d.title.toLowerCase())
  const toNeedsYou = () => nav(`/property/${PROPERTY_ID}/overview/needs-you`) // First-time setup (SetupPage)
  // QA B06: the count is needsYou(s).open everywhere ("N to decide"); questions are optional and counted apart
  const reviewLabel = ny.open.length ? `Review ${ny.open.length} to decide` : 'Review your setup'
  return (
    <ConnectFrame channel={single ? 'airbnb' : 'both'} progress={0.7} wide>
      <StepTrail current="found" />
      <div className="p-row p-sb" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1 className="h-h1">Here’s your place in Hostaway</h1>
          <p className="h-intro" style={{ marginTop: 6 }}>
            {single ? <>We read <b>142</b> things from your Airbnb listing and put each one in its place.</>
              : <>We read <b>{IMPORT_COUNTS.read}</b> things from your 2 listings. <b>{IMPORT_COUNTS.identical} match.</b> {ny.open.length} need you: {differ} {differ === 1 ? 'difference' : 'differences'}{choices.length > 0 && <>, and {choices.length === 1 ? 'one choice' : `${choices.length} choices`} only you can make ({choices.join(', ')})</>}.</>}
            {' '}<b>Nothing has been written to {single ? 'Airbnb' : `either ${plain(p, 'channel')}`}.</b>
          </p>
        </div>
        <Button kind="primary" size="lg" className="p-flow__top-cta" onClick={toNeedsYou}>{reviewLabel}</Button>
      </div>

      {demo === 'snoozed' && <div className="p-mt4"><Explainer title="Your Airbnb listing is snoozed on Airbnb" icon="eye-off">We imported it as it is. <b>It stays snoozed:</b> Hostaway never changes a listing’s status without asking. Unsnooze it here or on Airbnb when you’re ready.</Explainer></div>}
      {demo === 'drift' && <div className="p-mt4"><Explainer title="Your Airbnb title changed 2 minutes ago, on Airbnb" icon="alert-triangle">We read the new title (“Artist Apt. · Neukölln · Near Tempelhof”). The one we read first is in the copy of what we imported, so nothing is lost. From now on, an edit on Airbnb shows up as “Changed on Airbnb · Review”.</Explainer></div>}

      {!single && (
        <div className="p-card p-mt6">
          <div className="p-bar" role="img" aria-label="What we read, by outcome">
            {SEGMENTS.map((g) => <span key={g.label} className={`p-seg ${g.cls}`} style={{ flex: g.n }} title={`${g.n} ${g.label}`} />)}
          </div>
          <div className="p-row p-mt3" style={{ gap: 16 }}>
            {SEGMENTS.map((g) => <span key={g.label} className="p-legend h-caption"><span className={`p-dot ${g.cls}`} /><b>{g.n}</b> {g.label}</span>)}
          </div>
          <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>{total} things read</p>
        </div>
      )}

      {p.id === 'P3' ? <Migration /> : (
        <>
          <h2 className="h-h4 p-mt6">How your place is organized now</h2>
          <p className="h-small h-muted" style={{ margin: '2px 0 0' }}>One record, by kind. Airbnb, Booking.com, your guest assistant and the guidebook all read from it. Each fact says where it came from.</p>
          <div className="p-grid-5 p-rail p-mt3">
            {PREVIEW.map((sec) => (
              <div key={sec.title} className="p-card">
                <div className="p-row" style={{ gap: 8 }}><Icon name={sec.icon} size={18} /><b>{sec.title}</b></div>
                {sec.facts.map((id) => s.facts[id] && (
                  <div key={id} className="p-mt3">
                    <div className="h-caption h-muted">{FIELD[id]?.label}</div>
                    <div className="h-small" style={{ fontWeight: 600 }}>{s.facts[id].value}</div>
                    <SourceChip source={s.facts[id].source} />
                  </div>
                ))}
                {/* photo count from the library (QA B18 follow-up), not a fixed number */}
                <div className="h-caption h-muted p-mt3">{sec.more.replace('{photos}', String(s.photoLib.base.length))}</div>
              </div>
            ))}
            <div className="p-card">
              <div className="p-row" style={{ gap: 8 }}><Icon name="stack-2" size={18} /><b>Listings</b></div>
              <p className="h-caption h-muted" style={{ margin: '6px 0 0' }}>One window per channel for what’s different by nature</p>
              {(single ? ['airbnb'] as const : ['airbnb', 'booking'] as const).map((c) => (
                <div key={c} className="p-mt3">
                  <div className="p-row" style={{ gap: 6 }}><Mark channel={c} /><b className="h-small">{c === 'airbnb' ? 'Airbnb' : 'Booking.com'}</b></div>
                  <div className="h-caption">{c === 'airbnb' ? 'Title, description, photo order: yours' : 'Title: yours · description: the Base, until you write one'}</div>
                </div>
              ))}
              <div className="h-caption h-muted p-mt3">We keep a copy of what was imported</div>
            </div>
          </div>
        </>
      )}

      {!single && (
        <>
          <h2 className="h-h4 p-mt6">{p.id === 'P2' ? 'Every difference between the two' : 'What’s different between Airbnb and Booking.com'}</h2>
          {/* phones: each row becomes a card (p-stack): the two values side by side, what happens underneath */}
          <table className="h-table p-stack p-mt2">
            <thead><tr><th>What</th><th><Mark channel="airbnb" /> Airbnb</th><th><Mark channel="booking" /> Booking.com</th><th>What happens</th></tr></thead>
            <tbody>
              {DIFFS.filter((d) => !d.p2 || p.id === 'P2').map((d) => (
                <tr key={d.what}>
                  <td className="h-table__name">{d.what}</td>
                  {d.both ? <td colSpan={2} className="p-stack__full" data-label="Both">{d.both}</td> : <>
                    <td data-label="Airbnb">{d.airbnb}</td><td data-label="Booking.com">{d.booking}</td></>}
                  {d.decide ? <td className="p-stack__full"><Pill kind="warning">You decide</Pill>{d.then && <> <span className="h-caption h-muted">{d.then}</span></>}</td>
                    : <td className="h-small p-stack__full">{d.then}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {p.id === 'P2' && <div className="p-m-only p-mt4"><Button size="lg" block onClick={() => nav(`/property/${PROPERTY_ID}/listing/airbnb/preview`)}>Open Listings › Airbnb</Button></div>}
      <FlowActions note={p.id === 'P1' || p.id === 'P4' ? 'About 3 minutes. One at a time.' : 'Skipping is safe: nothing is written until you review the changes.'}
        mobile={<Button kind="primary" size="lg" onClick={toNeedsYou}>{reviewLabel}</Button>}>
        <Button kind="primary" size="lg" onClick={toNeedsYou}>{reviewLabel}</Button>
        {p.id === 'P2' && <Button size="lg" onClick={() => nav(`/property/${PROPERTY_ID}/listing/airbnb/preview`)}>Open Listings › Airbnb</Button>}
      </FlowActions>
    </ConnectFrame>
  )
}

/** P3 migration mode: every listing found, matched into properties, in batches (I-15, D-136). */
/* Portfolio rules (P3, R-085 bulk): each maps to the scenario decision it settles. Other rows are counts. */
const RULES: Array<{ decision: string; option: string }> = [
  { decision: 'fee-cleaning', option: 'keep' }, { decision: 'min-stay', option: 'keep' }, { decision: 'checkin', option: 'a' },
]
const OTHERS_BEFORE = [2, 1, 3, 0, 2, 1, 4, 1, 3, 1, 2]
const OTHERS_AFTER = [0, 1, 1, 0, 2, 0, 1, 0, 1, 0, 0]

function Migration() {
  const nav = useNavigate()
  const s = useStore()
  const [applied, setApplied] = useState(false)
  const open = needsYou(s).open.length
  const counts = [open, ...(applied ? OTHERS_AFTER : OTHERS_BEFORE)]
  const exceptions = counts.filter((n) => n > 0).length
  const apply = () => {
    for (const r of RULES) if (s.decisions.find((d) => d.id === r.decision)?.status !== 'decided') s.decide(r.decision, r.option, true)
    setApplied(true)
  }
  return (
    <>
      <h2 className="h-h4 p-mt6">Migration mode · 12 properties from 21 listings</h2>
      <p className="h-small h-muted" style={{ margin: '2px 0 0' }}>We matched listings across channels into properties. Decide by rule across all of them, then go live in batches. Nothing is written until each batch is reviewed.</p>
      <div className="p-strip p-mt3">
        {applied
          ? <span className="h-small"><Icon name="circle-check" size={16} className="p-ok" /> <b>3 rules applied</b>, saved for properties you add later. <b>{exceptions} of 12 properties</b> still need you, listed first: what the rules didn’t cover.</span>
          : <span className="h-small"><b>Rules that would settle most decisions:</b> keep fees per channel (9 of 12) · keep minimum stays per channel (7) · check-in from Airbnb (11)</span>}
        {applied ? <Button size="md" onClick={() => nav(`/property/${PROPERTY_ID}/overview/needs-you`)}>Open the first exception</Button>
          : <Button size="md" onClick={apply}>Apply rules, show exceptions</Button>}
      </div>
      <table className="h-table p-mt3">
        <thead><tr><th>Batch 1</th><th>Property</th><th>Channels</th><th>Match</th><th>Needs you</th></tr></thead>
        <tbody>
          {PORTFOLIO.map((pp, i) => ({ pp, i }))
            .sort((a, b) => (applied ? Number(counts[b.i] > 0) - Number(counts[a.i] > 0) : 0))
            .map(({ pp, i }) => (
            <tr key={pp.id}>
              <td><input className="h-checkbox" type="checkbox" defaultChecked={i < 5} aria-label={`Batch 1: ${pp.name}`} /></td>
              <td className="h-table__name">{pp.name}</td>
              <td><Marks channels={pp.channels} /></td>
              <td>{pp.channels.length < 2 ? <span className="h-caption h-muted">one channel</span> : i === 5 ? <Pill kind="warning">Check: 2 possible</Pill> : <span className="h-sync h-sync--ok"><span className="h-sync__dot" />High</span>}</td>
              <td>{applied && counts[i] > 0 ? <Pill kind="warning">{counts[i]} left</Pill> : counts[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-row p-mt3"><Button onClick={() => nav('/')}>Open Properties</Button></div>
    </>
  )
}
