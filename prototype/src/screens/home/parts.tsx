/* Shared pieces of S11's screens: fact citations (D-141), the Airbnb guest-page render used by the preview toggle and
 * the Listings window (D-124), and small lookups. SCR-03/SCR-04 · owner S11 · R-101 R-102 R-103 · D-124 D-141 */
import type { CSSProperties, ReactNode } from 'react'
import { Mark, Photo, SourceChip } from '../../ds'
import { FIELD } from '../../data/canonical'
import type { CanonicalField, Listing, Photo as PhotoT } from '../../data/types'
import { useStore } from '../../store/store'

/** Canonical field or a host-added one (R-083). */
export function useField() {
  const custom = useStore((s) => s.customFields)
  return (id: string): CanonicalField | undefined => FIELD[id] ?? custom.find((f) => f.id === id)
}

/** Rows for a Cite popover: the facts a sentence or title uses, with their source. */
export function useCiteRows() {
  const facts = useStore((s) => s.facts)
  const field = useField()
  return (ids: string[]) => ids.filter((id) => facts[id]).map((id) => {
    const label = field(id)?.label ?? id
    const value = facts[id].value ?? (facts[id].overrides.airbnb?.value ?? '-')
    // Custom facts are statements ("Bike storage in the courtyard"): show them once, as "Your fact".
    return value === label || label.includes(value) ? { id, label: 'Your fact', value: label, source: <SourceChip source={facts[id].source} /> }
      : { id, label, value, source: <SourceChip source={facts[id].source} /> }
  })
}

export const amenityLabel = (id: string) => FIELD[id]?.label ?? id.replace(/^amenity\./, '').replace(/_/g, ' ')

export function photoById(photos: PhotoT[], id: string) { return photos.find((p) => p.id === id) }

export type PreviewSection = 'title' | 'photos' | 'highlights' | 'description' | 'amenities'
export const PREVIEW_SECTIONS: Array<{ id: PreviewSection; label: string }> = [
  { id: 'title', label: 'Title' }, { id: 'photos', label: 'Photos' }, { id: 'highlights', label: 'Highlights' },
  { id: 'description', label: 'Description' }, { id: 'amenities', label: 'Amenities' },
]

const AMENITY_ICON: Record<string, string> = {
  'amenity.wifi': 'wifi', 'amenity.workspace': 'device-laptop', 'amenity.kitchen': 'tools-kitchen-2', 'amenity.dishwasher': 'tools-kitchen-2',
  'amenity.washer': 'home', 'amenity.heating': 'home-heart', 'amenity.self_checkin': 'lock',
}
export const amenityIcon = (id: string) => AMENITY_ICON[id] ?? 'circle-check'

/** A simplified, "faithful-enough" Airbnb listing page (labelled Preview). Every element is a click target (R-102). */
export function AirbnbPage({ listing, photos, show, changed, selected, onPick, badge }: {
  listing: Listing; photos: PhotoT[]
  show: Record<PreviewSection, boolean>
  /** Sections that differ from what's live, with a label ("Suggested", "2 changes"). */
  changed?: Partial<Record<PreviewSection, string>>
  selected?: PreviewSection | null
  onPick?: (s: PreviewSection) => void
  badge?: ReactNode
}) {
  const target = (s: PreviewSection, children: ReactNode, style?: CSSProperties) => (
    <span className={`h-guest__target${selected === s ? ' is-selected' : ''}${changed?.[s] ? ' is-changed' : ''}`}
      data-change={changed?.[s]} role="button" tabIndex={0} style={{ display: 'block', ...style }}
      onClick={() => onPick?.(s)} onKeyDown={(e) => { if (e.key === 'Enter') onPick?.(s) }} aria-label={`Edit ${s}`}>
      {children}
    </span>
  )
  const ph = listing.photoOrder.map((id) => photoById(photos, id)).filter(Boolean) as PhotoT[]
  return (
    <div className="h-guest">
      <div className="h-guest__chrome"><Mark channel="airbnb" />airbnb.com/rooms/{listing.externalId}<span className="h-guest__label">{badge ?? 'Preview · as guests see it'}</span></div>
      <div className="h-guest__body">
        {show.photos && target('photos', (
          <div className="h-mosaic">
            {ph.slice(0, 5).map((p, i) => <Photo key={p.id} tone={p.tone} label={i === 0 ? p.caption : undefined} />)}
          </div>
        ))}
        {show.title && target('title', <div className="h-h4" style={{ marginTop: 14 }}>{listing.title}</div>, { marginTop: 4 })}
        <p className="h-small h-muted" style={{ margin: '4px 0 0' }}>Entire rental unit · 2 guests · 1 bedroom · 1 bed · 1 bath</p>
        {show.highlights && target('highlights', (
          <div className="p-col" style={{ gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-divider)' }}>
            {listing.highlightedAmenities.slice(0, 3).map((id) => (
              <div key={id} className="h-small"><b>{amenityLabel(id)}</b></div>
            ))}
          </div>
        ))}
        {show.description && target('description', (
          <p className="h-small" style={{ margin: '12px 0 0', paddingTop: 12, borderTop: '1px solid var(--color-border-divider)' }}>{listing.description}</p>
        ))}
        {show.amenities && target('amenities', (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-divider)' }}>
            <div className="h-small"><b>What this place offers</b></div>
            <div className="p-row" style={{ gap: '4px 16px', marginTop: 6 }}>
              {listing.highlightedAmenities.map((id) => <span key={id} className="h-caption">{amenityLabel(id)}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
