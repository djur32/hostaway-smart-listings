/* Add a custom fact (F-B5): map it to a channel field, or keep it in the home only (the assistant and guidebook read it).
 * Channel limits enforced before commit: Booking.com has no free-text field for house rules (channel-constraints §1).
 * SCR-03 · owner S11 · R-083 · D-147 */
import { useState } from 'react'
import { Button, Dropdown, Icon } from '../../ds'
import type { ChannelId, SectionId } from '../../data/types'
import { useStore } from '../../store/store'

const TARGETS: Record<'airbnb' | 'booking', Array<{ field: string; ok: boolean; note?: string }>> = {
  airbnb: [
    { field: 'Additional house rules', ok: true }, { field: 'The space', ok: true }, { field: 'Other details to note', ok: true }, { field: 'Guest access', ok: true },
  ],
  booking: [
    { field: 'House rules (free text)', ok: false, note: 'Booking.com has no free-text field for rules. It shows only its own structured rules.' },
    { field: 'Description', ok: false, note: 'Booking.com writes its own description from your facts.' },
  ],
}

export function AddFact({ section, tab, onDone }: { section: SectionId; tab: string; onDone: (msg: string) => void }) {
  const add = useStore((s) => s.addCustomFact)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [where, setWhere] = useState<'hub-only' | 'airbnb' | 'booking'>('hub-only')
  const [field, setField] = useState(TARGETS.airbnb[0].field)
  const target = where === 'hub-only' ? null : TARGETS[where].find((t) => t.field === field) ?? TARGETS[where][0]
  const blocked = !!target && !target.ok
  const save = () => {
    if (!label.trim() || !value.trim() || blocked) return
    add({ label: label.trim(), value: value.trim(), section, tab, mapping: where === 'hub-only' ? { kind: 'hub-only' } : { kind: 'channel', channel: where as ChannelId, field: target!.field } })
    onDone(where === 'hub-only' ? `“${label.trim()}” is in your home. The assistant and guidebook read it; no listing shows it.` : `“${label.trim()}” is in your home and queued for Airbnb › ${target!.field}.`)
  }
  return (
    <section className="p-card" aria-label="Add a fact">
      <div className="p-label">Add a fact</div>
      <div className="p-row p-mt2" style={{ alignItems: 'flex-start' }}>
        <label className="p-col" style={{ gap: 4, flex: 1 }}><span className="h-caption">What is it?</span><input className="h-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Canal view from the bedroom" /></label>
        <label className="p-col" style={{ gap: 4, flex: 1 }}><span className="h-caption">Value</span><input className="h-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Yes, from the bed" /></label>
      </div>
      <div className="p-label p-mt4">Where does it go?</div>
      <div className="h-radio-cards p-mt2">
        {([['hub-only', 'Only in my home', 'The assistant and guidebook use it. No listing shows it.'], ['airbnb', 'Show it on Airbnb', 'In one of Airbnb’s text sections.'], ['booking', 'Show it on Booking.com', 'Only where Booking.com has a field for it.']] as const).map(([id, t, d]) => (
          <label key={id} className="h-radio-card" aria-checked={where === id}>
            <input className="h-radio" type="radio" name="where" aria-label={t} checked={where === id} onChange={() => { setWhere(id); if (id !== 'hub-only') setField(TARGETS[id][0].field) }} />
            <div><div className="h-radio-card__title">{t}</div><div className="h-radio-card__desc">{d}</div></div>
          </label>
        ))}
      </div>
      {where !== 'hub-only' && (
        <div className="p-mt3">
          <div className="p-col" style={{ gap: 4 }}><span className="h-caption">Channel field</span>
            <Dropdown label="Channel field" value={field} onChange={setField}
              options={TARGETS[where].map((t) => ({ value: t.field, label: `${t.field}${t.ok ? '' : ' (not available)'}` }))} />
          </div>
          {blocked && <p className="h-caption p-mt2" style={{ color: 'var(--color-error-600)' }}><Icon name="alert-circle" size={16} /> {target!.note} Keep it in your home instead: the assistant will still use it.</p>}
        </div>
      )}
      <div className="p-row p-mt4"><Button kind="primary" disabled={!label.trim() || !value.trim() || blocked} onClick={save}>Add to my home</Button><Button onClick={() => onDone('')}>Cancel</Button></div>
    </section>
  )
}
