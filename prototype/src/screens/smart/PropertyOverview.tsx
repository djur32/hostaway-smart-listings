/* Property › Overview (V3-SPEC §1 IA) · WS-SL.
 * One property's own page, replicated from Hostaway (screenshots 22–27): opportunities accordion,
 * Connected channels (a row per listing with status chips, tooltips and the Listed / Unlisted select), Imported iCals,
 * Export calendar, Property nickname, Sync, then the Smart Listings opt-in (off by default; turning it on leads into
 * Setup when no strategy exists; turning it off confirms that nothing is lost), and Mute Property · Copy ID · Copy UUID.
 * URL: ?smart=on|off (demo states), ?opps=open (accordion open). */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button, Chip, CopyLink, HostLine, ListingRow, OvDialog, OvMenu, OvSection, PageFrame, PageHead, UnsavedBar,
  Segmented, StatusSelect, Toggle, useCopy, useIsMobile,
  type ChipTone, type Opportunity,
} from '../../ds'
import { chName, type ListingChannel } from '../../data/sl3'
import { sharedFieldKeys } from './sharedFields'
import { photoUrl } from '../../data/v3-cv'
import { channelPhotos } from '../../data/photos'
import { PROPERTY_PHOTO, detailOf, groupById, isScenarioProperty } from '../../data/portfolio'
import { currentUser } from '../../data/users'
import { useAccount } from '../../shell/useAccount'
import { needsYou } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { useListingChannels } from '../../store/selectors'
import { useStore, type FieldVisibility, type OvFieldKey } from '../../store/store'
import { listingName, useSmartDemo } from './shared'

/** One Show / Edit / Don't-show control for the whole category of shared fields (sharedFieldKeys), after seeing a per-field row for all 19: "nonsense… I just want to basically be able to toggle
 *  whether I want non-channel-specific fields to appear to be editable… it should be the same for all, either we
 *  see all of these, none of this, or we could edit them." One control, one value, applied to every qualifying
 *  field at once, no per-field or per-tab breakdown. The store stays per-field (`fieldVisibility:
 *  Partial<Record<OvFieldKey, FieldVisibility>>`, store/store.ts), this control writes the same value to every key on
 *  each change, so the Listing editor's `FieldRow` and Pricing/Availability's `ScopedRow` each read one key.
 *  Reading the current value (3 Oct): the value every written key agrees on; nothing written yet reads as **Edit**,
 *  because that is what unset does on every channel page (normal behaviour, unset never locks anything). It used to
 *  read "Show" while every field stayed editable, which is the mismatch review hit. */
function FieldVisibilitySection({ keys, value, onChange }: {
  keys: string[]
  value: Partial<Record<OvFieldKey, FieldVisibility>>
  onChange: (v: FieldVisibility) => void
}) {
  if (!keys.length) return null
  const set = keys.map((k) => value[k]).filter((v): v is FieldVisibility => !!v)
  const current: FieldVisibility = set.length && set.every((v) => v === set[0]) ? set[0] : 'edit'
  return (
    <OvSection title="Field visibility"
      desc="How fields shared by every channel appear on each channel's Listing, Pricing and Availability pages."
      action={<Segmented label="Field visibility" value={current} onChange={onChange} items={[
        { id: 'show', label: 'Show' }, { id: 'edit', label: 'Edit' }, { id: 'hidden', label: "Don't show" },
      ]} />} />
  )
}

const HOST = currentUser().name // the signed-in account (D-160); accounts switch with a reload
/** What each connection is in Hostaway today (kind of place, management level). */
const CONNECTION: Record<ListingChannel, { kind: string; chips: Array<{ tone: ChipTone; label: string; tip: string }> }> = {
  airbnb: { kind: 'Entire Home', chips: [
    { tone: 'lead', label: 'Lead listing', tip: 'This listing is a lead listing.' },
    { tone: 'managed-full', label: 'Fully managed', tip: 'Hostaway manages this listing’s content, calendar, prices and messages.' },
  ] },
  booking: { kind: 'Entire apartment', chips: [
    { tone: 'managed', label: 'Partially managed', tip: 'Hostaway manages this listing’s content, calendar and prices. A few settings stay in the Booking.com extranet.' },
  ] },
  direct: { kind: 'Entire Home', chips: [
    { tone: 'managed-full', label: 'Fully managed', tip: 'Your own booking site. Hostaway manages everything on it.' },
  ] },
}
const SCENARIO_IDS = { id: '1428357', uuid: '9d5c1f0a-6b2e-4c71-8f3d-2a7e4b90c615' }
/** Stable, made-up IDs per property (the scenario keeps its own). */
function idsFor(pid: string) {
  if (isScenarioProperty(pid)) return SCENARIO_IDS
  let h = 2166136261
  for (const ch of pid) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  let x = h
  const hex = (n: number) => Array.from({ length: n }, () => ((x = (Math.imul(x, 1103515245) + 12345) >>> 0) >>> 28).toString(16)).join('')
  return { id: String(1400000 + (h % 90000)), uuid: `${hex(8)}-${hex(4)}-4${hex(3)}-8${hex(3)}-${hex(12)}` }
}

export function PropertyOverview() {
  useSmartDemo()
  const p = useProperty()
  const nav = useNavigate()
  const on = useStore((s) => s.smartListings)
  const setSmart = useStore((s) => s.setSmartListings)
  const sl3 = useStore((s) => s.sl3)
  const base = `/property/${p.id}`

  // QA B15: the settings live in the store (per property), so they survive leaving the page and a reload
  const ov = useStore((s) => s.overview?.[p.id])
  const setOv = useStore((s) => s.setOverview)
  const listed = (c: ListingChannel) => ov?.listed?.[c] ?? true
  const nickname = ov?.nickname ?? p.nickname
  const sync = ov?.sync ?? true
  const muted = ov?.muted ?? false
  // Field visibility (every shared field, derived, sharedFields): only once Smart Listings is on and set up, same gate Strategy.tsx uses.
  const smartReady = on && sl3.setupDone
  const fieldVis = ov?.fieldVisibility ?? {}
  // One control sets every qualifying field's key to the same value (Task: collapse to one control, 1 Oct third round).
  const setFieldVis = (v: FieldVisibility) => {
    const patch: Partial<Record<OvFieldKey, FieldVisibility>> = {}
    for (const k of sharedFieldKeys(p.id, connected)) patch[k] = v
    setOv(p.id, { fieldVisibility: patch })
  }
  const [unlist, setUnlist] = useState<ListingChannel | null>(null) // "Unlist listing" asks first: guests can't book
  const [addIcal, setAddIcal] = useState(false)
  const [icalName, setIcalName] = useState('')
  const [icalLink, setIcalLink] = useState('')
  const [icals, setIcals] = useState<Array<{ name: string; url: string }>>([])
  const [icalGen, setIcalGen] = useState(0)
  const IDS = idsFor(p.id)
  const ICAL = `https://my.hostaway.com/ical/${IDS.uuid}${icalGen ? `-${icalGen}` : ''}.ics`
  const dismissed: string[] = []
  const [copied, copy] = useCopy()

  const connected = useListingChannels() // this property's connected channels (QA B01)
  const photoLib = useStore((s) => s.photoLib)
  // the scenario property's photo state is its own: another property shows its own photo (audit, 4 Oct: Potsdam showed Neukölln's)
  const coverOf = (c: ListingChannel) => (isScenarioProperty(p.id) ? channelPhotos(c, photoLib, sl3).shown[0] : undefined) ?? PROPERTY_PHOTO[p.id] ?? 'living1'
  // the opportunities quote the scenario property's own inquiries and guests: other properties have none yet
  const opportunities: Opportunity[] = (!isScenarioProperty(p.id) ? [] : [
    // no "Write a description for Booking.com": Booking.com writes its own description from the facts (D-032 / D-086)
    { id: 'o-b-directions', channel: 'booking', title: 'Add walking directions',
      desc: '12 of 31 Booking.com guests asked how to find the flat. Directions from the U-Bahn answer it before they ask.',
      outcome: ['Fewer Questions', 'Better Reviews'], onSetUp: () => nav(`${base}/ch/booking/listing/arrival`) },
    { id: 'o-a-wifi', channel: 'airbnb', title: 'Say how fast the Wi-Fi is',
      desc: '5 of your last 12 Airbnb inquiries asked about the Wi-Fi speed.',
      outcome: ['Fewer Questions', 'Higher Performance'], onSetUp: () => nav(`${base}/ch/airbnb/listing/essentials`) },
  ] as Opportunity[]).filter((o) => !dismissed.includes(o.id) && connected.includes(o.channel as ListingChannel))

  // no opportunities accordion on this page and "Review opportunities" is a plain label (nothing on click)
  /* QA B16: on before any setup = go to Setup; it turns on when Setup finishes (Setup.tsx finish()). Off keeps the setup,
   * so turning it on again restores the same strategies; turning it off asks first and says so. */
  const [confirmOff, setConfirmOff] = useState(false)
  const toggleSmart = (v: boolean) => {
    if (v && !sl3.setupDone) { nav(`${base}/smart/wizard?entry=first&from=overview`); return }
    if (!v) { setConfirmOff(true); return }
    setSmart(true)
  }

  // Accounts (D-160…D-163): a first-timer finishes first-time setup before anything else; a portfolio sees where this
  // property sits among the others. Same Overview, same sections; only what's offered first differs.
  const acct = useAccount()
  const mobile = useIsMobile()
  const toDecide = useStore((s) => needsYou(s).open.length) // the same count Getting started shows ("8 to decide")
  const firstTimer = acct.setupPending
  const portfolio = acct.properties.length > 5 ? detailOf(p.id) : null

  return (
    <PageFrame head={<PageHead title="Overview" property={p} />}>
      <div className="h-ov">

        {firstTimer && <>
          <OvSection title="First-time setup"
            desc={toDecide ? `Check what we imported before anything else: ${toDecide} ${toDecide === 1 ? 'thing needs' : 'things need'} you. Nothing has changed on your listings yet.` : 'Everything is decided. Review the changes and go live.'}
            action={<Link className="h-btn h-btn--primary" to={toDecide ? `${base}/overview/needs-you` : '/import/go-live'}>{toDecide ? 'Continue setup' : 'Review & go live'}</Link>} />
          <hr className="h-ov-divider" />
        </>}

        {/* phones: Groups, Rules and Activity are out of this concept's reach */}
        {portfolio && !mobile && <>
          <OvSection title="Portfolio"
            desc={`One of your ${acct.properties.length} properties · ${groupById(portfolio.groupId).name} group · ${portfolio.owner === 'You' ? 'self-managed' : `owner ${portfolio.owner}`}`}
            action={<span className="p-row" style={{ gap: 16 }}>
              <Link className="h-textlink" to="/portfolio/groups">Groups</Link>
              <Link className="h-textlink" to="/portfolio/rules">Rules</Link>
              <Link className="h-textlink" to="/portfolio/activity">Activity</Link>
            </span>} />
          <hr className="h-ov-divider" />
        </>}

        <OvSection title="Connected channels" desc="Manage and sync listings across platforms."
          action={opportunities.length ? <span className="h-textlink h-textlink--static">Review opportunities</span> : undefined}>
          <div className="h-ov-listings">
            {connected.map((c) => {
              const conn = CONNECTION[c]
              return (
                <ListingRow key={c} channel={c} photo={photoUrl(coverOf(c))} title={listingName(c, sl3)}
                  meta={<>{conn.kind}<HostLine name={HOST} tone={currentUser().tone} /></>}
                  chips={conn.chips.map((x) => <Chip key={x.label} tone={x.tone} tip={x.tip}>{x.label}</Chip>)}
                  status={<StatusSelect label={`${chName(c)} listing status`} listed={listed(c)} onChange={(v) => (v ? setOv(p.id, { listed: { [c]: true } }) : setUnlist(c))} />} />
              )
            })}
          </div>
        </OvSection>

        <div className="h-ov-group">
          <OvSection title="Imported iCals" desc="Import bookings from OTAs without an official connection to Hostaway."
            action={<button type="button" className="h-textlink" onClick={() => setAddIcal(true)}>Add External iCal</button>}>
            {icals.length > 0 && <ul className="h-ov-icals">{icals.map((x) => <li key={x.url}><b>{x.name}</b>{x.url}</li>)}</ul>}
          </OvSection>
          <OvSection title="Export calendar" desc="Send your reservations to an external calendar or third party integrations via iCal."
            action={<>
              <CopyLink label="Copy iCal link" done={copied === 'ical'} onCopy={() => copy('ical', ICAL)} />
              <OvMenu label="More calendar export options" items={[{ label: 'Make a new link', onSelect: () => setIcalGen(icalGen + 1) }]} />
            </>} />
        </div>

        <hr className="h-ov-divider" />

        <OvSection field title="Property nickname" desc="Internal only, not visible to guests."
          action={<input className="h-input" value={nickname} onChange={(e) => setOv(p.id, { nickname: e.target.value })} aria-label="Property nickname" />} />
        <OvSection title="Sync"
          desc={<>Sync information between listings in this property to avoid double bookings, according to your <a className="h-textlink" href="#sync-settings" onClick={(e) => e.preventDefault()}>Sync settings</a></>}
          action={<Toggle checked={sync} onChange={(v) => setOv(p.id, { sync: v })} label="Sync" />} />

        <hr className="h-ov-divider" />

        {/* title, one line, the toggle. The strategies live under Smart Listings in the rail. */}
        <OvSection title="Smart Listings"
          desc={firstTimer ? 'A strategy for each channel, and tips to improve every part of the listing. Available once first-time setup is done.' : 'A strategy for each channel, and tips to improve every part of the listing.'}
          action={firstTimer ? <Link className="h-textlink" to={`${base}/overview/needs-you`}>Finish first-time setup</Link> : <>
            {on && !sl3.setupDone && <Link className="h-textlink" to={`${base}/smart/setup/channels`}>Finish setup</Link>}
            <Toggle checked={on} onChange={toggleSmart} label="Smart Listings" />
          </>} />

        {smartReady && <FieldVisibilitySection keys={sharedFieldKeys(p.id, connected)} value={fieldVis} onChange={setFieldVis} />}

        <hr className="h-ov-divider" />

        <div className="h-ov-foot">
          <Button onClick={() => setOv(p.id, { muted: !muted })} aria-pressed={muted}>{muted ? 'Unmute Property' : 'Mute Property'}</Button>
          <CopyLink label="Copy ID" done={copied === 'id'} onCopy={() => copy('id', IDS.id)} />
          <CopyLink label="Copy UUID" done={copied === 'uuid'} onCopy={() => copy('uuid', IDS.uuid)} />
        </div>
      </div>
      {unlist && (
        <OvDialog title={`Unlist on ${chName(unlist)}?`} onClose={() => setUnlist(null)}
          foot={<><Button onClick={() => setUnlist(null)}>Cancel</Button>
            <Button kind="primary" onClick={() => { setOv(p.id, { listed: { [unlist]: false } }); setUnlist(null) }}>Unlist listing</Button></>}>
          <p>Guests won’t find or book this listing on {chName(unlist)} until you publish it again. Reservations you already have stay as they are.</p>
        </OvDialog>
      )}
      {confirmOff && (
        <OvDialog title="Turn off Smart Listings?" onClose={() => setConfirmOff(false)}
          foot={<><Button onClick={() => setConfirmOff(false)}>Cancel</Button>
            <Button kind="primary" onClick={() => { setSmart(false); setConfirmOff(false) }}>Turn off</Button></>}>
          <p>Your strategies and your tips are kept. Nothing changes on your listings. Turn it back on any time to pick up where you left off.</p>
        </OvDialog>
      )}
      {addIcal && (
        <OvDialog title="Add External iCal" onClose={() => setAddIcal(false)}
          foot={<><Button onClick={() => setAddIcal(false)}>Cancel</Button>
            <Button kind="primary" disabled={!/^https?:\/\/\S+/.test(icalLink.trim())} onClick={() => { setIcals([...icals, { name: icalName.trim() || 'External calendar', url: icalLink.trim() }]); setIcalName(''); setIcalLink(''); setAddIcal(false) }}>Add iCal</Button></>}>
          <label className="h-ov-dialog__field"><span className="h-field-row__label">Calendar name</span>
            <input className="h-input" value={icalName} onChange={(e) => setIcalName(e.target.value)} placeholder="e.g. Vrbo" /></label>
          <label className="h-ov-dialog__field"><span className="h-field-row__label">iCal link</span>
            <input className="h-input" value={icalLink} onChange={(e) => setIcalLink(e.target.value)} placeholder="https://…/calendar.ics" inputMode="url" /></label>
        </OvDialog>
      )}
      <UnsavedBar />
    </PageFrame>
  )
}
