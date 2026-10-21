/* Listing details › Amenities (ref 05): "Amenities" + "Add amenity", then the property's amenities by category. Each row is
 * a bordered card with separate square buttons: a trash for every amenity, a pencil for the ones with details (Washer,
 * parking…). No channel labels ("We have the base, and off of the base others can act dissimilarly,
 * but I don't need to see that here"): the 1 Oct "Not on Booking.com" exception flag is no longer shown on the Base. No Discard / Save here, as in
 * the real tab: adding, removing and editing details save (and send) right away, with the quiet confirmation. */
import { useState } from 'react'
import { AmenityLine, Button, SectionHead } from '../../../ds'
import { DETAILS_DESC } from '../../../data/details'
import { savedLabel } from '../../push/changes'
import { Flash } from '../fields'
import { useFlash } from '../shared'
import { AddAmenityDrawer } from './AddAmenityDrawer'
import { EditAmenityFlow } from './EditAmenityFlow'
import { setAmenity, useAmenities, type AmenityView } from './model'

export function Amenities() {
  const { groups, defaultOn, chs } = useAmenities()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<AmenityView | null>(null)
  const { flash, show } = useFlash()
  const added = groups.map((g) => ({ ...g, items: g.items.filter((i) => i.added) })).filter((g) => g.items.length > 0)
  const remove = (name: string) => {
    show(savedLabel(setAmenity(name, false, chs, defaultOn)))
  }
  return (
    <>
      <SectionHead title="Amenities" desc={DETAILS_DESC.amenities}
        actions={<span className="h-ld-amenity-actions"><Flash flash={flash} /><Button kind="primary" onClick={() => setAdding(true)}>Add amenity</Button></span>} />
      {added.length === 0 && <p className="h-ld-empty">No amenities yet. Add the ones guests can use during their stay.</p>}
      {added.map((g) => (
        <section key={g.category} aria-label={g.category}>
          <h3 className="h-ld-group">{g.category}</h3>
          <div className="h-ld-list">
            {g.items.map((i) => (
              <AmenityLine key={i.name} name={i.name} note={i.note} channels={i.where.length < chs.length ? i.where : undefined}
                onEdit={i.kind ? () => setEditing(i) : undefined} onRemove={() => remove(i.name)} />
            ))}
          </div>
        </section>
      ))}
      <AddAmenityDrawer open={adding} onClose={() => setAdding(false)} />
      <EditAmenityFlow amenity={editing} onClose={() => setEditing(null)} onSaved={show} />
    </>
  )
}
