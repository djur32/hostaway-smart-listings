/* Listing details › Add amenity › Filters (rebuilt; the real dialog, ref 08, offered static pills with no visible
 * selection and a raspberry "Remove filters"). Two chip multi-selects: Categories (Hospitable's 14) and Channels (the
 * property's connected channels). Within a group a chip widens the match (any of); across groups they narrow it.
 * Footer: "Remove filters" (text link, left) · Cancel · Apply filters. Desktop: a centred dialog over the drawer. Phones:
 * the Add amenity sheet swaps its list for the same fields and footer (AddAmenityDrawer). */
import { useEffect, useState } from 'react'
import { Button, ChipGroup, DetailsDialog } from '../../../ds'
import { AMENITY_CATEGORIES, DETAILS_CH_NAME } from '../../../data/details'
import type { ListingChannel } from '../../../data/sl3'

export interface AmenityFilter { cats: string[]; chs: ListingChannel[] }
export const NO_FILTER: AmenityFilter = { cats: [], chs: [] }
export const filterCount = (f: AmenityFilter) => f.cats.length + f.chs.length

export function AmenityFilters({ open, value, channels, onApply, onClose }: {
  open: boolean; value: AmenityFilter; channels: ListingChannel[]; onApply: (f: AmenityFilter) => void; onClose: () => void
}) {
  const [draft, setDraft] = useState<AmenityFilter>(value)
  useEffect(() => { if (open) setDraft(value) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const any = filterCount(draft) > 0 || filterCount(value) > 0
  return (
    <DetailsDialog open={open} title="Filters" onClose={onClose}
      footStart={<button type="button" className="h-textlink" disabled={!any} onClick={() => { onApply(NO_FILTER); onClose() }}>Remove filters</button>}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { onApply(draft); onClose() }}>Apply filters</Button></>}>
      <FilterFields draft={draft} setDraft={setDraft} channels={channels} />
    </DetailsDialog>
  )
}
/** The two chip groups. Phones show them in place of the Add amenity sheet's list (never a sheet on a sheet). */
export function FilterFields({ draft, setDraft, channels }: { draft: AmenityFilter; setDraft: (f: AmenityFilter) => void; channels: ListingChannel[] }) {
  return (
    <>
      <ChipGroup label="Categories" items={AMENITY_CATEGORIES.map((c) => ({ id: c as string, label: c }))} value={draft.cats} onChange={(cats) => setDraft({ ...draft, cats })} />
      <ChipGroup label="Channels" items={channels.map((c) => ({ id: c, label: DETAILS_CH_NAME[c] }))} value={draft.chs} onChange={(chs) => setDraft({ ...draft, chs })} />
    </>
  )
}
