/* Property › Shared › Listing details: the property's source of truth (review, 1 Oct).
 * Hostaway's real Details editor (refs concepts/smart-listing/refs/listing-details/01–11): the same five tabs
 * (Essentials, Arrival, Location, Amenities, Rules), the same fields in the same order and each tab's Discard changes /
 * Save head. No "ⓘ N channels · Edit per channel" caption (review, 1 Oct: these facts are the same for everybody;
 * per-channel versions live on each channel's Listing page). What it edits is the Base: the value every channel's listing inherits. The channel-first Smart Listing
 * editor (Channels › {channel} › Listing) adapts and projects from it; a quiet banner under the page head says so.
 * Fields are stacked (label and help above a full-width control, then the caption row), review's rule for every
 * listing screen, rather than the reference's label-left / control-right rows.
 * Saving: shared.ts useBaseDraft (sl3Base + commitAndSend → "Saved · sent to Airbnb and Booking.com"). Amenities: amenities/.
 * Per property: field values come from the shared definitions, patched for the active property
 * (data/property-seeds.ts); channels from useListingChannels(). Route: /property/:id/details/:tab? */
import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Loading, PageHead, QueryTabs, SaveActions, SectionHead, Split, TruthTitle, UnsavedBar } from '../../ds'
import { ARRIVAL_GROUPS, type FieldDef, type ListingTab } from '../../data/sl3'
import { classicFields } from '../../data/v3-ch'
import { DETAILS_DESC, DETAILS_TABS } from '../../data/details'
import { useListingChannels } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { useBriefLoading } from '../channel/common'
import { Amenities } from './amenities/Amenities'
import { BasePhotosRow, DetailsField } from './fields'
import { useBaseDraft } from './shared'

const isTab = (t: string | undefined): t is ListingTab => !!t && DETAILS_TABS.some((x) => x.id === t)

export function ListingDetails() {
  const p = useProperty()
  const { tab } = useParams()
  if (!isTab(tab)) return <Navigate to={`/property/${p.id}/details/essentials`} replace />
  return <DetailsPage key={`${p.id}:${tab}`} tab={tab} />
}

function DetailsPage({ tab }: { tab: ListingTab }) {
  const p = useProperty()
  const loading = useBriefLoading(`details:${p.id}:${tab}`) // tab switch: a brief raspberry spinner (M-18)
  // a Knowledge Hub reference (#field-<key>, KH-REFRAME 4 Oct: facts are read from here, by reference) brings its
  // field into view and marks it for a moment
  const { hash } = useLocation()
  useEffect(() => {
    if (loading || !hash.startsWith('#field-')) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    el.scrollIntoView({ block: 'center' })
    el.classList.add('is-referenced')
    const t = setTimeout(() => el.classList.remove('is-referenced'), 2600)
    return () => clearTimeout(t)
  }, [loading, hash])
  return (
    // The channel editor's frame, so the two pages behave identically (review, 1 Oct, third round on this topic:
    // "everything on top of the tab row should be sticky too"). The WHOLE head — "Listing details" + the Source of
    // truth badge + the property switcher + the tab row — is one sticky `.ch-editor__head` block, with only the
    // fields scrolling beneath it in `.h-split__main`; see screens/channel/ListingEditor.tsx (Classic) and
    // ds/v3/ch.css. Before this, only `.ch-tabrow` stuck, the head scrolled away under it, and the old
    // `.h-content` padding-top left an 18px gap above the pinned row that content scrolled visibly through.
    <div className="ch-editor h-scroll-thin">
      <div className="ch-editor__head">
        <div className="ch-page">
          <PageHead title={<TruthTitle>Listing details</TruthTitle>} compactTitle="Listing details" property={p} />
        </div>
        <div className="ch-tabrow">
          <QueryTabs active={tab} items={DETAILS_TABS.map((t) => ({ id: t.id, label: t.label, to: `/property/${p.id}/details/${t.id}` }))} />
        </div>
      </div>
      <Split main={
        <div className="ch-page">
          {loading ? <Loading /> : tab === 'amenities' ? <Amenities /> : <FieldsTab tab={tab} />}
          {/* ds/unsaved.tsx, 1 Oct evening: sticky to this column's bottom, scoped to its width, not the viewport */}
          <UnsavedBar />
        </div>
      } />
    </div>
  )
}

/* ---------------- Essentials · Arrival · Location · Rules ---------------- */
function FieldsTab({ tab }: { tab: Exclude<ListingTab, 'amenities'> }) {
  const p = useProperty()
  const chs = useListingChannels()
  const draft = useBaseDraft(`${p.id}:${tab}`, chs)
  const fields = classicFields(tab) // every field of the tab, in Hostaway's order; rows hide the ones no channel has
  const row = (f: FieldDef) => f.kind === 'photos'
    ? <BasePhotosRow key={f.key} />
    : <DetailsField key={f.key} def={f} draft={draft} />
  return (
    <>
      <SectionHead title={DETAILS_TABS.find((t) => t.id === tab)!.label} desc={DETAILS_DESC[tab]}
        actions={<SaveActions dirty={draft.dirty} onDiscard={draft.discard} onSave={draft.save} />} />
      {tab === 'arrival'
        ? ARRIVAL_GROUPS.map((g) => {
          const fs = fields.filter((f) => (f.group ?? 'inside') === g.id)
          return fs.length ? (
            <div key={g.id}>
              <h3 className="ch-subhead">{g.title}</h3>{g.desc && <p className="ch-subdesc">{g.desc}</p>}
              {fs.map(row)}
            </div>
          ) : null
        })
        : fields.map(row)}
    </>
  )
}

/* ---------------- the banner's link ---------------- */
