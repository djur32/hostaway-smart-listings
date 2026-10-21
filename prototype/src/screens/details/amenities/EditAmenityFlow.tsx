/* Listing details › Amenities › the pencil: an amenity's details.
 * Parking (Free / Paid parking on premises) replicates Hostaway's "Update Free parking on premise" (refs 09–11) as
 * three steps with progress: 1 Parking type (an Airbnb field: the mark beside each option), 2 Parking access and
 * Requires reservation, 3 Number of spaces, Max height and the options that apply. Back / Continue, Save on the last step.
 * Washer, Dryer, Hot tub, Pool: one question. Save writes the Base and sends it to every channel that lists the amenity.
 * Desktop: a centred dialog. Phones: a full-screen sheet. */
import { useEffect, useRef, useState } from 'react'
import { Button, CheckList, DetailsDialog, Mark, NumberStepper, RadioCards, StepProgress } from '../../../ds'
import { DETAIL_CHOICES, PARKING, PARKING_STEPS, parseParking, type ParkingDetails } from '../../../data/details'
import { useListingChannels } from '../../../store/selectors'
import { savedLabel } from '../../push/changes'
import { saveDetails, type AmenityView } from './model'

export function EditAmenityFlow({ amenity, onClose, onSaved }: { amenity: AmenityView | null; onClose: () => void; onSaved: (text: string) => void }) {
  const last = useRef<AmenityView | null>(amenity)
  if (amenity) last.current = amenity
  const a = amenity ?? last.current
  if (!a?.kind) return null
  return a.kind === 'parking'
    ? <ParkingFlow key={a.name} a={a} open={!!amenity} onClose={onClose} onSaved={onSaved} />
    : <ChoiceEdit key={a.name} a={a} open={!!amenity} onClose={onClose} onSaved={onSaved} />
}

function ChoiceEdit({ a, open, onClose, onSaved }: { a: AmenityView; open: boolean; onClose: () => void; onSaved: (text: string) => void }) {
  const q = DETAIL_CHOICES[a.kind as 'laundry' | 'shared']
  const [v, setV] = useState(a.details ?? q.fallback)
  const save = () => { onSaved(savedLabel(saveDetails(a, v))); onClose() }
  return (
    <DetailsDialog open={open} title={`Update ${a.name}`} onClose={onClose} size="sm"
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={v === a.details} onClick={save}>Save</Button></>}>
      <RadioCards legend={q.question} name={`ld-${a.name}`} options={q.options.map((o) => ({ value: o, label: o }))} value={v} onChange={setV} />
    </DetailsDialog>
  )
}

function ParkingFlow({ a, open, onClose, onSaved }: { a: AmenityView; open: boolean; onClose: () => void; onSaved: (text: string) => void }) {
  const chs = useListingChannels()
  const [step, setStep] = useState(1)
  const [p, setP] = useState<ParkingDetails>(() => parseParking(a.details))
  const body = useRef<HTMLDivElement>(null)
  const total = PARKING_STEPS.length
  // each step starts at the top of the dialog
  useEffect(() => { body.current?.closest('.h-ld-dialog__body, .h-m-sheet__body')?.scrollTo({ top: 0 }) }, [step])
  const patch = (x: Partial<ParkingDetails>) => setP((cur) => ({ ...cur, ...x }))
  const save = () => { onSaved(savedLabel(saveDetails(a, JSON.stringify(p)))); onClose() }
  const mark = chs.includes(PARKING.typeChannel) ? <Mark channel={PARKING.typeChannel} size={14} /> : undefined
  return (
    <DetailsDialog open={open} title={`Update ${a.name}`} onClose={onClose} phoneFull tall
      top={<StepProgress step={step} total={total} label={PARKING_STEPS[step - 1]} />}
      footer={<>
        {step === 1 ? <Button onClick={onClose}>Cancel</Button> : <Button onClick={() => setStep(step - 1)}>Back</Button>}
        {step < total ? <Button kind="primary" onClick={() => setStep(step + 1)}>Continue</Button> : <Button kind="primary" onClick={save}>Save</Button>}
      </>}>
      <div ref={body}>
        {step === 1 && (
          <RadioCards legend="Parking type" name="ld-parking-type" value={p.type} onChange={(type) => patch({ type })}
            options={PARKING.types.map((t) => ({ value: t, label: t, trail: mark }))} />
        )}
        {step === 2 && <>
          <RadioCards legend="Parking access" name="ld-parking-access" value={p.access} onChange={(access) => patch({ access })} options={PARKING.access.map((t) => ({ value: t, label: t }))} />
          <RadioCards legend="Requires reservation" name="ld-parking-res" value={p.reservation} onChange={(reservation) => patch({ reservation })} options={PARKING.reservation.map((t) => ({ value: t, label: t }))} />
        </>}
        {step === 3 && <>
          <NumberStepper label="Number of spaces" value={p.spaces} onChange={(spaces) => patch({ spaces })} min={0} max={99} />
          <NumberStepper label="Max height m" value={p.height} onChange={(height) => patch({ height })} step={0.1} min={0} max={10} />
          <CheckList legend="Are any of the following options applicable?" options={PARKING.options} value={p.options} onChange={(options) => patch({ options })} />
        </>}
      </div>
    </DetailsDialog>
  )
}
