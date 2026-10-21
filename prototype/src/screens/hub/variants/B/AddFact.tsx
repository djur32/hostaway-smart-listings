/* KH-B · "+ Add a fact to <Section>": inline at the end of the section. The section sets the type, the host fills in
 * two or three things, and "Where will this be used?" previews the text in each destination (AI replies, Airbnb,
 * Booking.com) before Add fact. Where a fact lands on each channel is unverified against the channels' APIs
 * (documented as in concepts/knowledge-hub/KH-B.md; no source labels on screen). */
import { useState, type ReactNode } from 'react'
import { Button, ChannelBadge, Dropdown, Icon, KhbAddCard, NumberField, KhbDest, KhbLabeled, KhbTypePicker } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import { useStore } from '../../../../store/store'
import { useHubPid, useListingChannels } from '../../perProperty'
import { useHubUi } from '../../state'
import { AMENITY_SUGGEST, amenityGroup, amenityGroupsFor, rememberAmenityGroup, sectionLabel } from './model'

type FieldKind = 'text' | 'money' | 'percent' | 'select' | 'textarea'
interface FieldDef { id: 'name' | 'amount' | 'per' | 'text'; label: string; kind: FieldKind; options?: string[]; width?: 'sm' | 'md'; placeholder?: string }
interface TypeDef { icon: string; fields: FieldDef[] }
const NAME_F = (label = 'Name', placeholder?: string): FieldDef => ({ id: 'name', label, kind: 'text', placeholder })
const TYPES: Record<string, TypeDef> = {
  Fee: { icon: 'coin', fields: [NAME_F('Name', 'e.g. Late checkout, until 1:00 PM'), { id: 'amount', label: 'Amount', kind: 'money', width: 'sm' }, { id: 'per', label: 'Charged', kind: 'select', options: ['Per stay', 'Per night', 'Per guest'], width: 'md' }] },
  Discount: { icon: 'tag', fields: [NAME_F('Name', 'e.g. Returning guests'), { id: 'amount', label: 'Discount', kind: 'percent', width: 'sm' }, { id: 'per', label: 'For', kind: 'select', options: ['Any stay', 'Stays of 7+ nights', 'Stays of 28+ nights', 'Last-minute bookings'], width: 'md' }] },
  Deposit: { icon: 'lock', fields: [NAME_F('Name', 'e.g. Security deposit'), { id: 'amount', label: 'Amount', kind: 'money', width: 'sm' }, { id: 'per', label: 'Returned', kind: 'select', options: ['After checkout', 'Within 7 days', 'Within 14 days'], width: 'md' }] },
  'Note for guests': { icon: 'message-circle', fields: [NAME_F('Topic', 'e.g. Noise from the courtyard'), { id: 'text', label: 'What guests should know', kind: 'textarea' }] },
  Instruction: { icon: 'list-details', fields: [NAME_F('Title', 'e.g. Heating'), { id: 'text', label: 'Instruction', kind: 'textarea', placeholder: 'e.g. The thermostat is by the bedroom door; 3 is comfortable.' }, { id: 'per', label: 'When', kind: 'select', options: ['Before arrival', 'At check-in', 'During the stay', 'At checkout'], width: 'md' }] },
  'Code or password': { icon: 'lock', fields: [NAME_F('What it opens', 'e.g. Bike storage'), { id: 'amount', label: 'Code', kind: 'text', width: 'sm' }, { id: 'per', label: 'Shared', kind: 'select', options: ['24 hours before arrival', 'At check-in', 'On request'], width: 'md' }] },
  Rule: { icon: 'shield-check', fields: [NAME_F('Rule', 'e.g. No shoes inside'), { id: 'text', label: 'Details', kind: 'textarea', placeholder: 'Why, and what guests should do instead.' }] },
  'Place nearby': { icon: 'map-pin', fields: [NAME_F('Place', 'e.g. Café Rix'), { id: 'text', label: 'Why guests go', kind: 'text' }, { id: 'per', label: 'How far', kind: 'select', options: ['2 min walk', '5 min walk', '10 min walk', '15 min by transit'], width: 'md' }] },
  Detail: { icon: 'home', fields: [NAME_F('Detail', 'e.g. Ceiling height'), { id: 'text', label: 'Value', kind: 'text' }] },
  Fact: { icon: 'info-circle', fields: [NAME_F('What it’s about', 'e.g. Late checkout'), { id: 'text', label: 'The fact', kind: 'textarea', placeholder: 'e.g. Late checkout until 1 PM for €15, if the next guest allows.' }] },
}
const SECTION_TYPES: Partial<Record<KhSectionId, string[]>> = {
  property: ['Detail', 'Note for guests'], descriptions: ['Detail', 'Note for guests'], arrival: ['Instruction', 'Code or password', 'Note for guests'],
  location: ['Place nearby', 'Note for guests'], rules: ['Rule', 'Note for guests'], pricing: ['Fee', 'Discount', 'Deposit', 'Note for guests'],
  availability: ['Rule', 'Note for guests'], policies: ['Rule', 'Note for guests'], custom: ['Fact'],
}
/** Where a channel shows a fact of this section (unverified mapping: in KH-B.md). */
const WHERE: Partial<Record<KhSectionId, { airbnb: string; booking: string }>> = {
  pricing: { airbnb: 'House rules › Additional rules', booking: 'Policies › Fees' },
  arrival: { airbnb: 'Arrival › House manual', booking: 'Property › Check-in instructions' },
  location: { airbnb: 'Location › Getting around', booking: 'Property › Area info' },
  rules: { airbnb: 'House rules › Additional rules', booking: 'Policies › House rules' },
  property: { airbnb: 'Essentials › Other details to note', booking: 'Description › Good to know' },
  descriptions: { airbnb: 'Essentials › Other details to note', booking: 'Description › Good to know' },
  availability: { airbnb: 'House rules › Additional rules', booking: 'Policies › Good to know' },
  policies: { airbnb: 'House rules › Additional rules', booking: 'Policies › Good to know' },
}
const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const trimDot = (t: string) => t.trim().replace(/[.\s]+$/, '')

export function AddFact({ section, prefill, onClose, onAdded }: { section: KhSectionId; prefill?: string; onClose: () => void; onAdded: (msg: string) => void }) {
  if (section === 'amenities') return <AddAmenity prefill={prefill} onClose={onClose} onAdded={onAdded} />
  return <AddTyped section={section} prefill={prefill} onClose={onClose} onAdded={onAdded} />
}

function AddTyped({ section, prefill, onClose, onAdded }: { section: KhSectionId; prefill?: string; onClose: () => void; onAdded: (msg: string) => void }) {
  const add = useHubUi((s) => s.add)
  const chs = useListingChannels()
  const types = SECTION_TYPES[section] ?? ['Fact']
  const [type, setType] = useState(types[0])
  const [v, setV] = useState<Record<string, string>>(() => ({ name: prefill ?? '' }))
  const [dest, setDest] = useState({ ai: true, airbnb: true, booking: true, direct: true })
  const def = TYPES[type]
  const val = (k: string) => (v[k] ?? '').trim()
  const per = val('per') || def.fields.find((f) => f.id === 'per')?.options?.[0] || ''
  const name = val('name')
  const ok = def.fields.filter((f) => f.id !== 'per').every((f) => val(f.id))
  const where = WHERE[section]

  // the fact as each destination will read it
  const money = `€${val('amount') || '…'}`
  const until = name.match(/until (.+)$/i)?.[1]
  const text = (() => {
    switch (type) {
      case 'Fee': return `${name.replace(/,\s*/, ' ')}: ${money} ${lc(per)}, on request.`
      case 'Discount': return `${name}: ${val('amount') || '…'}% off, ${lc(per)}.`
      case 'Deposit': return `${name}: ${money}, returned ${lc(per)}.`
      case 'Code or password': return `${name}: code ${val('amount') || '…'}, shared ${lc(per)}.`
      case 'Instruction': return `${trimDot(val('text'))}.`
      case 'Place nearby': return `${name}, ${per}: ${trimDot(val('text'))}.`
      case 'Detail': return `${name}: ${val('text')}`
      default: return `${trimDot(val('text'))}.`
    }
  })()
  const ai = (() => {
    switch (type) {
      case 'Fee': return until ? `“You can stay until ${until} for ${money}. Shall I arrange it?”` : `“Yes: ${lc(name || 'it')} is ${money} ${lc(per)}. Shall I arrange it?”`
      case 'Discount': return `“Good news: you get ${val('amount') || '…'}% off ${lc(per) === 'any stay' ? 'your stay' : `for ${lc(per)}`}.”`
      case 'Deposit': return `“There’s a ${money} ${lc(name || 'deposit')}; it’s returned ${lc(per)}.”`
      case 'Code or password': return `“The code for ${lc(name || 'it')} is ${val('amount') || '…'}.”`
      default: return `“${trimDot(val('text')) || '…'}.”`
    }
  })()
  const ota = type === 'Fee' ? `${name.split(',')[0] || '…'} · ${money} ${lc(per)} · on request` : text
  const asks = name ? `If a guest asks about ${lc(name.split(',')[0])}:` : 'If a guest asks about it:'

  const submit = () => {
    const ds = (['ai', 'airbnb', 'booking', 'direct'] as const).filter((k) => dest[k] && (k === 'ai' || (where && chs.includes(k))))
    add({ id: `b.${section}.${Date.now()}.${ds.join('+')}`, label: name, value: text, source: 'Added by you · just now' })
    onAdded(`Added to ${sectionLabel(section)}. Your AI replies use it right away.`)
  }
  const field = (f: FieldDef): ReactNode => {
    const set = (x: string) => setV({ ...v, [f.id]: x })
    const control = f.kind === 'select' ? <Dropdown label={f.label} value={per} options={f.options ?? []} onChange={set} />
      : f.kind === 'textarea' ? <textarea className="h-textarea h-khtextarea" rows={3} value={v[f.id] ?? ''} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
      : f.kind === 'money' || f.kind === 'percent' ? (
        <NumberField label={f.label} value={v[f.id] ?? ''} onChange={(x) => set(x.replace(/[^0-9.]/g, ''))} inputMode="decimal"
          currency={f.kind === 'money' ? '€' : undefined} unit={f.kind === 'percent' ? '%' : undefined} decimals={f.kind === 'money' ? 2 : 0} max={f.kind === 'percent' ? 100 : 99999} />
      ) : <input className="h-input" value={v[f.id] ?? ''} placeholder={f.placeholder} autoFocus={f.id === 'name'} onChange={(e) => set(e.target.value)} />
    return <KhbLabeled key={f.id} label={f.label} width={f.width}>{control}</KhbLabeled>
  }
  const short = def.fields.filter((f) => f.kind !== 'textarea')
  const long = def.fields.filter((f) => f.kind === 'textarea')
  return (
    <KhbAddCard title={`New fact in ${sectionLabel(section)}`} onClose={onClose}
      foot={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!ok} onClick={submit}>Add fact</Button></>}>
      {types.length > 1 && (
        <div className="khb-add__block"><p className="khb-add__label">What kind of fact?</p>
          <KhbTypePicker types={types.map((t) => ({ id: t, icon: TYPES[t].icon }))} value={type} onChange={(t) => { setType(t); setV({ name: v.name ?? '' }) }} />
        </div>
      )}
      <div className="khb-add__fields">{short.map(field)}</div>
      {long.map(field)}
      <div className="khb-add__block">
        <p className="khb-add__label">Where will this be used?</p>
        <div className="khb-dests">
          <KhbDest checked={dest.ai} onChange={(x) => setDest({ ...dest, ai: x })} head={<span className="khb-dest__ai"><Icon name="sparkles" size={16} />AI replies</span>}
            lead={asks} preview={ai} />
          {where && (['airbnb', 'booking'] as const).filter((c) => chs.includes(c)).map((c) => (
            <KhbDest key={c} checked={dest[c]} onChange={(x) => setDest({ ...dest, [c]: x })} head={<ChannelBadge channel={c} size="sm" />}
              where={where[c]} preview={c === 'booking' ? ota : text} />
          ))}
        </div>
        {(!where || chs.includes('direct')) && <p className="khb-add__note">{where
          ? (dest.direct ? <>Direct uses it too: {section === 'pricing' ? 'your booking site offers it as an add-on at checkout.' : 'your booking site shows it with the listing.'} <button type="button" className="h-textlink" onClick={() => setDest({ ...dest, direct: false })}>Leave it off Direct</button></>
            : <>Not on Direct. <button type="button" className="h-textlink" onClick={() => setDest({ ...dest, direct: true })}>Add it to Direct</button></>)
          : 'Custom facts stay out of your listings. Only your AI replies use them.'}</p>}
      </div>
    </KhbAddCard>
  )
}

/* ---------- Amenities: the amenity, its category, and the channels that list it ---------- */
function AddAmenity({ prefill, onClose, onAdded }: { prefill?: string; onClose: () => void; onAdded: (msg: string) => void }) {
  const [name, setName] = useState(prefill ?? '')
  const [group, setGroup] = useState(prefill ? amenityGroup(prefill) === 'Other' ? 'Bedroom and laundry' : amenityGroup(prefill) : '')
  const [dest, setDest] = useState<Record<'ai' | ListingChannel, boolean>>({ ai: true, airbnb: true, booking: true, direct: true })
  const pid = useHubPid()
  const chs = useListingChannels()
  const n = name.trim()
  const g = group || amenityGroup(n)
  const submit = () => {
    const st = useStore.getState()
    rememberAmenityGroup(n, g)
    for (const c of chs) if (dest[c]) st.sl3Custom(c, `amenity:${n}`, 'on')
    onAdded(`Added ${n} to Amenities.`)
  }
  const suggest = AMENITY_SUGGEST.filter((x) => !n || x.toLowerCase().includes(n.toLowerCase())).slice(0, 6)
  return (
    <KhbAddCard title="New amenity" onClose={onClose}
      foot={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!n || !chs.some((c) => dest[c])} onClick={submit}>Add amenity</Button></>}>
      <div className="khb-add__fields">
        <KhbLabeled label="Amenity"><input className="h-input" value={name} autoFocus placeholder="e.g. Coffee maker" onChange={(e) => setName(e.target.value)} /></KhbLabeled>
        <KhbLabeled label="Category" width="md"><Dropdown label="Category" value={g} options={amenityGroupsFor(pid)} onChange={setGroup} /></KhbLabeled>
      </div>
      {suggest.length > 0 && n !== suggest[0] && <p className="khb-add__suggest">Suggestions: {suggest.map((x, i) => <span key={x}>{i ? ', ' : ''}<button type="button" className="h-textlink" onClick={() => { setName(x); setGroup(amenityGroup(x)) }}>{x}</button></span>)}</p>}
      <div className="khb-add__block">
        <p className="khb-add__label">Where will this be used?</p>
        <div className={chs.length >= 3 ? 'khb-dests khb-dests--4' : 'khb-dests'}>
          <KhbDest checked={dest.ai} onChange={(x) => setDest({ ...dest, ai: x })} head={<span className="khb-dest__ai"><Icon name="sparkles" size={16} />AI replies</span>}
            lead={`If a guest asks for ${n ? lc(n) : 'it'}:`} preview={`“Yes, there’s ${n ? `a ${lc(n)}` : '…'} in the flat.”`} />
          {chs.map((c) => (
            <KhbDest key={c} checked={dest[c]} onChange={(x) => setDest({ ...dest, [c]: x })} head={<ChannelBadge channel={c} size="sm" />}
              where={c === 'booking' ? `Facilities › ${g || '…'}` : `Amenities › ${g || '…'}`} preview={n || '…'} />
          ))}
        </div>
      </div>
    </KhbAddCard>
  )
}
