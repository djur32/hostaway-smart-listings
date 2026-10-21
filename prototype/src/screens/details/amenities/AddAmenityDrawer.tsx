/* Listing details › Add amenity: Hospitable's drawer as it works today (refs 07, 12, 13): "Search amenities", Filters,
 * every amenity by category as a bordered card row: the name, its scope caption beside it ("All channels", or the mark
 * of each channel that carries it), and at the right end "+" (not added, white row) or a check (added, grey row).
 * A tap toggles the row and saves it right away (adding = every channel that has a field for it; the check takes it off
 * again) and sends it. While a save is in flight the row's icon turns and the footer reads "Updating…" until every save
 * settles, then "Done". Closing (×, Done, Esc, backdrop) only closes: everything is already saved (Antonio, 1 Oct).
 * The save latency is simulated (600–900 ms). The tap target is the whole row (≥ 44px on phones).
 * Desktop: a right drawer that slides in subtly. Phones: a full-screen sheet. */
import { useEffect, useRef, useState } from 'react'
import { AmenityPick, Button, DetailsDrawer, FiltersButton, Icon, useIsMobile, type AmenityScope } from '../../../ds'
import { amenityChannels } from '../../../data/details'
import { AmenityFilters, FilterFields, NO_FILTER, filterCount, type AmenityFilter } from './AmenityFilters'
import { setAmenity, useAmenities } from './model'

export function AddAmenityDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { groups, defaultOn, chs } = useAmenities()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AmenityFilter>(NO_FILTER)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [busy, setBusy] = useState<string[]>([]) // rows whose save is in flight
  const timers = useRef<number[]>([])
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)) }, [])
  const mobile = useIsMobile()
  const [draft, setDraft] = useState<AmenityFilter>(NO_FILTER) // phones: the filters replace the list inside the sheet
  const openFilters = () => { setDraft(filter); setFiltersOpen(true) }
  const inSheet = mobile && filtersOpen
  // the row's scope caption: what adding it will cover. Every connected channel has a field for it → the words
  // "All channels"; otherwise the mark of each channel that does. It describes the amenity, not its current state,
  // so it doesn't change when the row is toggled (as in the real drawer, where an added "Shampoo" still reads
  // "All channels"). The *list* behind the drawer is the opposite: exceptions only, nothing when every channel has it.
  const scopeOf = (name: string): AmenityScope => {
    const on = amenityChannels(name, chs)
    return on.length === chs.length ? 'all' : on
  }
  const q = query.trim().toLowerCase()
  const shown = groups
    .filter((g) => !filter.cats.length || filter.cats.includes(g.category))
    .map((g) => ({ ...g, items: g.items.filter((i) => (!q || i.name.toLowerCase().includes(q)) && (!filter.chs.length || filter.chs.some((c) => amenityChannels(i.name, chs).includes(c)))) }))
    .filter((g) => g.items.length > 0)
  // a tap saves at once; the save "takes" 600–900 ms (SIMULATED), during which the row shows it is updating
  const toggle = (name: string, added: boolean) => {
    setBusy((b) => [...b, name])
    timers.current.push(window.setTimeout(() => {
      setAmenity(name, !added, chs, defaultOn) // commits and sends (screens/push/changes.ts)
      setBusy((b) => b.filter((x) => x !== name))
    }, 600 + Math.round(Math.random() * 300)))
  }
  const updating = busy.length > 0
  const done = () => { setQuery(''); setFiltersOpen(false); onClose() }
  return (
    <>
      <DetailsDrawer open={open} title={inSheet ? 'Filters' : 'Add amenity'} onClose={inSheet ? () => setFiltersOpen(false) : done} fullScreen
        footer={inSheet ? (
          <div className="h-ld-sheet-foot h-ld-sheet-foot--filters">
            <button type="button" className="h-textlink" onClick={() => { setFilter(NO_FILTER); setFiltersOpen(false) }}>Remove filters</button>
            <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
            <Button kind="primary" onClick={() => { setFilter(draft); setFiltersOpen(false) }}>Apply filters</Button>
          </div>
        ) : <Button kind="secondary" size="lg" block disabled={updating} onClick={done}>{updating ? 'Updating…' : 'Done'}</Button>}>
        {inSheet ? <FilterFields draft={draft} setDraft={setDraft} channels={chs} /> : <>
        <label className="h-ld-search-label" htmlFor="ld-amenity-search">Search amenities</label>
        <div className="h-input-wrap h-ld-search">
          <Icon name="search" />
          <input id="ld-amenity-search" className="h-input" type="search" autoFocus={!mobile} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        </div>
        <div className="h-ld-toolbar">
          <FiltersButton count={filterCount(filter)} onClick={openFilters} />
        </div>
        {shown.length === 0 && <p className="h-ld-empty">No amenities match{q ? ` “${query.trim()}”` : ''}{filterCount(filter) ? ' with these filters' : ''}.</p>}
        {shown.map((g) => (
          <section key={g.category} aria-label={g.category}>
            <h3 className="h-ld-group">{g.category}</h3>
            <div className="h-ld-picks">
              {g.items.map((i) => <AmenityPick key={i.name} name={i.name} scope={scopeOf(i.name)} added={i.added} busy={busy.includes(i.name)} onToggle={() => toggle(i.name, i.added)} />)}
            </div>
          </section>
        ))}
        </>}
      </DetailsDrawer>
      <AmenityFilters open={open && filtersOpen && !mobile} value={filter} channels={chs} onApply={setFilter} onClose={() => setFiltersOpen(false)} />
    </>
  )
}
