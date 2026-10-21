/* KH-D · the side sheets: a category (stacked fields), Photos, Amenities, Pricing and availability, Policies, Custom facts,
 * Ask the AI, Sources and Add anything. Every edit waits in the sheet's draft until Save (Hospitable's Discard changes /
 * Save); Save writes through sl3Base / sl3Custom, so the channel screens and the Overview cards read the same values. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Dropdown, Icon, KhChannelLine, KhdAddBox, KhdAmenityRow, KhdCaption, KhdField, KhdFlag, KhdGroup, KhdSheet, KhdSplit, KhdSplitRow,
  Mark, PhotosRow, SaveActions, Segmented, cx,
} from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { INSTANT_BOOK, INSTANT_DEFAULT } from '../../../../data/v3-ch'
import { useAllCancellationCards } from '../../policyCards'
import { KH_GROUPS, type KhFact, type KhItem } from '../../../../data/v3-kh'
import { photoUrl } from '../../../../data/v3-cv'
import { channelPhotos } from '../../../../data/photos'
import { useStore } from '../../../../store/store'
import { useHubDraft, type HubDraft } from '../../model'
import { useHubUi } from '../../state'
import { hubDiscrepancies, names, useHubItems, useHubPid, useIsScenario, useListingChannels } from '../../perProperty'
import { FactRow, FieldRow, NewFactRow, type NewFact } from './fields'
import {
  AMENITY_SUGGESTIONS, NAME, amenityGroups, amenityKey, answer, catById, factCat, fileFact, instantLabel, listedOn, startFacts,
  type Amenity, type CatId, type Source,
} from './model'

export interface SheetNav {
  close: () => void
  open: (sheet: string, extra?: Record<string, string>) => void
  base: string
  q: URLSearchParams
}

/* ---------- shared: the sheet's commit (draft + new facts + flag answers) ---------- */
function useSheetDraft(id: string, split?: string | null) {
  const d = useHubDraft(`khd-${id}`, split)
  const [facts, setFacts] = useState<NewFact[]>([])
  const [flags, setFlags] = useState<Record<string, string>>({})
  const dirty = d.dirty || facts.some((f) => f.value.trim()) || Object.keys(flags).length > 0
  const save = (cat: CatId) => {
    d.commit()
    const ui = useHubUi.getState()
    for (const [id, v] of Object.entries(flags)) ui.resolve(id, v)
    facts.filter((f) => f.value.trim()).forEach((f, i) => ui.add({ id: `khd.${cat}.${Date.now()}${i}`, label: f.label, value: f.value.trim(), source: 'Added by you · today' }))
    setFacts([]); setFlags({})
  }
  const discard = () => { d.discard(); setFacts([]); setFlags({}) }
  return { d, facts, setFacts, flags, setFlags, dirty, save, discard }
}
const Foot = ({ dirty, onDiscard, onSave }: { dirty: boolean; onDiscard: () => void; onSave: () => void }) => <SaveActions dirty={dirty} onDiscard={onDiscard} onSave={onSave} />
const useAdded = () => useHubUi((s) => s.added)

/* ---------- a category of stacked fields (Property, Descriptions, Arrival, Location, House rules) ---------- */
const ADD_PH: Partial<Record<CatId, string>> = {
  property: 'Add fact, e.g. Year renovated', descriptions: 'Add text, e.g. A note for long stays', arrival: 'Add fact, e.g. Where to leave luggage',
  location: 'Add fact, e.g. Parking', rules: 'Add rule, e.g. Quiet hours', custom: 'Add fact, e.g. Nearest pharmacy',
}
const ADD_SUGGEST: Partial<Record<CatId, string[]>> = {
  location: ['Parking', 'Nearest supermarket', 'Late-night food'], rules: ['Quiet hours', 'Visitors', 'Shoes off inside'],
  arrival: ['Where to leave luggage', 'Early check-in'], property: ['Year renovated', 'Floor and lift'], custom: ['Nearest pharmacy', 'Bikes'],
}
export function CategorySheet({ cat, nav }: { cat: CatId; nav: SheetNav }) {
  const def = catById(cat)!
  const { d, facts, setFacts, flags, setFlags, dirty, save, discard } = useSheetDraft(cat, nav.q.get('split'))
  const pid = useHubPid()
  const chs = useListingChannels()
  const all = useHubItems()
  const items = useMemo(() => all.filter((i) => i.section === cat), [all, cat])
  const added = useAdded().filter((f) => factCat(f) === cat)
  const [text, setText] = useState(nav.q.get('text') ?? '')
  const groups = KH_GROUPS[cat]
  const resolved = useHubUi((s) => s.resolved)
  // the scenario's scripted "Channels disagree" (none on any other property: its channels came in agreeing)
  const flag = cat === 'rules' ? hubDiscrepancies(pid).find((x) => x.id === 'd-checkin' && !resolved[x.id]) : undefined
  const addFact = (label: string) => setFacts((fs) => [{ label, value: '' }, ...fs])
  const rows = (list: KhItem[]) => list.map((i) => <FieldRow key={i.key} item={i} d={d} />)
  return (
    <KhdSheet icon={def.icon} title={def.label} sub={`${items.length + added.length} ${items.length + added.length === 1 ? def.unit[0] : def.unit[1]} · ${chs.length > 1 ? def.sub : def.sub.replace('Every channel reads', 'Your listing reads')}`} onClose={nav.close}
      foot={<Foot dirty={dirty} onDiscard={discard} onSave={() => save(cat)} />}>
      {flag && (
        <KhdFlag title={`Channels disagree: ${flag.label}`}
          chosen={flags[flag.id] ? `Every channel will use ${flags[flag.id]} when you save.` : undefined}
          onUndo={() => { d.setBase(flag.key, useStore.getState().sl3.base[flag.key] ?? '3:00 PM', '3:00 PM'); setFlags({}) }}
          options={flag.options.map((o) => ({ label: `${o.value} · as on ${NAME[o.channel as ListingChannel]}`, onPick: () => { d.setBase(flag.key, o.value, '3:00 PM'); setFlags({ [flag.id]: o.value }) } }))}>
          {`${flag.options.map((o) => `${NAME[o.channel as ListingChannel]} says ${o.value}`).join(' and ')}. Guests plan around it, so pick one and every channel uses it.`}
        </KhdFlag>
      )}
      <KhdAddBox placeholder={ADD_PH[cat] ?? 'Add fact'} hint="Your AI replies use it" value={text} onChange={setText} onAdd={addFact}
        suggestions={ADD_SUGGEST[cat]} autoFocus={nav.q.get('add') === '1'} />
      {(facts.length > 0 || added.length > 0) && (
        <KhdGroup title="Facts you added">
          {facts.map((f, i) => <NewFactRow key={i} f={f} autoFocus={i === 0} onChange={(n) => setFacts((fs) => fs.map((x, j) => (j === i ? n : x)))} onRemove={() => setFacts((fs) => fs.filter((_, j) => j !== i))} />)}
          {added.map((f) => <FactRow key={f.id} f={f} d={d} />)}
        </KhdGroup>
      )}
      {groups ? groups.map((g) => {
        const list = items.filter((i) => i.group === g.id)
        return list.length ? <KhdGroup key={g.id} title={g.title}>{rows(list)}</KhdGroup> : null
      }) : <KhdGroup title={def.label === 'Descriptions' ? 'Texts' : 'Facts'}>{rows(items)}</KhdGroup>}
    </KhdSheet>
  )
}

/* ---------- Custom facts ---------- */
export function CustomSheet({ nav }: { nav: SheetNav }) {
  const def = catById('custom')!
  const { d, facts, setFacts, dirty, save, discard } = useSheetDraft('custom')
  const added = useAdded().filter((f) => factCat(f) === 'custom')
  const [text, setText] = useState(nav.q.get('text') ?? '')
  const all: KhFact[] = [...startFacts(useHubPid()), ...added]
  return (
    <KhdSheet icon={def.icon} title={def.label} sub={`${all.length} ${all.length === 1 ? 'fact' : 'facts'} · ${def.sub}`} onClose={nav.close} foot={<Foot dirty={dirty} onDiscard={discard} onSave={() => save('custom')} />}>
      <KhdAddBox placeholder={ADD_PH.custom!} hint="Your AI replies use it" value={text} onChange={setText} onAdd={(l) => setFacts((fs) => [{ label: l, value: '' }, ...fs])} suggestions={ADD_SUGGEST.custom} autoFocus={nav.q.get('add') === '1'} />
      {!all.length && !facts.length && <p className="h-khd-note"><Icon name="info-circle" /><span>No custom facts yet. Add what guests ask about that no listing field holds.</span></p>}
      {facts.map((f, i) => <NewFactRow key={i} f={f} autoFocus={i === 0} onChange={(n) => setFacts((fs) => fs.map((x, j) => (j === i ? n : x)))} onRemove={() => setFacts((fs) => fs.filter((_, j) => j !== i))} />)}
      {all.map((f) => <FactRow key={f.id} f={f} d={d} />)}
    </KhdSheet>
  )
}

/* ---------- Photos ---------- */
export function PhotosSheet({ nav }: { nav: SheetNav }) {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const sl3 = useMemo(() => ({ tips, custom }), [tips, custom])
  const desk = channelPhotos('airbnb', lib, sl3).shown.indexOf('desk')
  const scenario = useIsScenario()
  const chs = useListingChannels()
  return (
    <KhdSheet icon="photo" title="Photos" sub={`${lib.base.length} photos · your library, and what each channel shows`} onClose={nav.close}
      foot={<Button kind="primary" onClick={nav.close}>Done</Button>}>
      <PhotosRow label="Photo library" count={lib.base.length} desc="Add photos, captions and room tags once. Each channel picks from here." manageTo={`${nav.base}/photos`} max={4}
        photos={lib.base.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))} />
      {scenario && desk > 4 && (
        <p className="h-khd-card__missing"><Icon name="alert-circle" size={16} /><span>Airbnb shows the desk {desk + 1}th. Guests staying for work look for it first. <Link className="h-textlink" to={`${nav.base}/photos?ch=airbnb`}>Reorder Airbnb photos</Link></span></p>
      )}
      <KhdGroup title="What each channel shows">
        {chs.map((c) => {
          const { shown, hidden } = channelPhotos(c, lib, sl3)
          return (
            <KhChannelLine key={c} channel={c} action={<Link className="h-textlink" to={`${nav.base}/photos?ch=${c}`}>Order and cover</Link>}>
              {shown.length} photos · Cover: {lib.meta[shown[0]]?.description ?? '—'}{hidden.length ? ` · ${hidden.length} hidden` : ''}
            </KhChannelLine>
          )
        })}
      </KhdGroup>
    </KhdSheet>
  )
}

/* ---------- Amenities: where each one is listed ---------- */
export function AmenitiesSheet({ nav }: { nav: SheetNav }) {
  const { d, flags, setFlags, dirty, save, discard } = useSheetDraft('amenities')
  const storeCustom = useStore((s) => s.sl3.custom)
  const resolved = useHubUi((s) => s.resolved)
  const [text, setText] = useState(nav.q.get('text') ?? '')
  const [filter, setFilter] = useState<'all' | 'some'>(nav.q.get('filter') === 'some' ? 'some' : 'all')
  const [openRow, setOpenRow] = useState<string | null>(nav.q.get('row'))
  const pid = useHubPid()
  const scenario = useIsScenario()
  const ALL = useListingChannels()
  const keys = [...ALL.flatMap((c) => Object.keys(storeCustom[c] ?? {})), ...d.customEdits.map((e) => e.k)]
  const groups = amenityGroups(keys, pid)
  const list = groups.flatMap((g) => g.items)
  const on = (a: Amenity, c: ListingChannel) => listedOn(a, c, d.cv)
  const chsOf = (a: Amenity) => ALL.filter((c) => on(a, c))
  const notAll = list.filter((a) => chsOf(a).length < ALL.length)
  const set = (a: Amenity, c: ListingChannel, v: boolean) => d.setCustom(c, amenityKey(a.name), v === a.on.includes(c) ? undefined : v ? 'on' : 'off')
  // the scenario's scripted Balcony disagreement; no other property has one
  const balcony = list.find((a) => a.name === 'Balcony')
  const flagOpen = scenario && !!balcony && !resolved['d-balcony']
  const pickFlag = (yes: boolean) => {
    if (!balcony) return
    if (yes) ALL.forEach((c) => set(balcony, c, true)); else ALL.forEach((c) => set(balcony, c, false))
    setFlags({ 'd-balcony': yes ? 'Yes, a balcony' : 'No balcony' })
  }
  const q = text.trim().toLowerCase()
  const present = new Set(list.map((a) => a.name))
  const add = (name: string) => {
    const hit = list.find((a) => a.name.toLowerCase() === name.toLowerCase())
    if (hit) { setOpenRow(hit.name); setText(''); return }
    ALL.forEach((c) => d.setCustom(c, amenityKey(name), 'on'))
    setOpenRow(name)
  }
  const shownGroups = groups.map((g) => ({ ...g, items: g.items.filter((a) => (filter === 'all' || chsOf(a).length < ALL.length) && (!q || a.name.toLowerCase().includes(q))) })).filter((g) => g.items.length)
  return (
    <KhdSheet icon="tools-kitchen-2" title="Amenities" sub={`${list.length} amenities · where each one is listed`} onClose={nav.close}
      foot={<Foot dirty={dirty} onDiscard={() => { discard(); setOpenRow(null) }} onSave={() => save('amenities')} />}>
      <div className="h-khd-filter">
        {ALL.length > 1 && <Segmented label="Show" value={filter} onChange={setFilter} items={[{ id: 'all', label: `All ${list.length}` }, { id: 'some', label: `Not on every channel ${notAll.length}` }]} />}
        <span className="h-khd-totals" aria-label="Listed per channel">
          {ALL.map((c) => <span key={c} title={`Listed on ${NAME[c]}`}><ChannelMark c={c} />{list.filter((a) => on(a, c)).length}</span>)}
        </span>
      </div>
      {flagOpen && (
        <KhdFlag title="Channels disagree: Balcony"
          chosen={flags['d-balcony'] ? (flags['d-balcony'].startsWith('Yes') ? 'Balcony will be listed on every channel when you save.' : 'Balcony will come off Booking.com when you save.') : undefined}
          onUndo={() => { ALL.forEach((c) => d.setCustom(c, amenityKey('Balcony'), storeCustom[c]?.[amenityKey('Balcony')])); setFlags({}) }}
          options={[{ label: 'It has a balcony · list it everywhere', onPick: () => pickFlag(true) }, { label: 'No balcony · remove from Booking.com', onPick: () => pickFlag(false) }]}>
          Booking.com lists a balcony. Airbnb and your Direct site don’t. Guests trust the listing, so it should match the flat.
        </KhdFlag>
      )}
      <KhdAddBox placeholder="Add amenity, e.g. Air conditioning" hint={ALL.length > 1 ? 'Adds to all channels' : `Adds to ${NAME[ALL[0]]}`} value={text} onChange={setText} onAdd={add}
        suggestions={AMENITY_SUGGESTIONS.filter((s) => !present.has(s))} autoFocus={nav.q.get('add') === '1'} />
      {shownGroups.length === 0 && <p className="h-khd-note"><span>No amenity matches “{text}”. Press Enter to add it to {ALL.length > 1 ? 'every channel' : NAME[ALL[0]]}.</span></p>}
      {shownGroups.map((g) => (
        <div key={g.group} className="h-khd-amengroup">
          <h3 className="h-khd-amengroup__title">{g.group}<small>{g.items.length}</small></h3>
          {g.items.map((a) => (
            <KhdAmenityRow key={a.name} name={a.label ?? a.name} note={a.note} warn={a.disagree && flagOpen && !flags['d-balcony']} on={chsOf(a)} all={ALL}
              open={openRow === a.name} onToggle={() => setOpenRow(openRow === a.name ? null : a.name)}
              listed={(c) => on(a, c as ListingChannel)} onListed={(c, v) => set(a, c as ListingChannel, v)} onRemove={() => ALL.forEach((c) => set(a, c, false))} />
          ))}
        </div>
      ))}
    </KhdSheet>
  )
}
const ChannelMark = ({ c }: { c: ListingChannel }) => <Mark channel={c} size={14} />

/* ---------- Pricing and availability ---------- */
const PA_EXTRAS: Array<{ key: string; label: string; after: string }> = [
  { key: 'price:pet', label: 'Pet fee', after: 'fees' },
  { key: 'price:monthly', label: 'Monthly discount', after: 'fees' },
  { key: 'avail:window', label: 'Availability window', after: 'stay' },
]
export function PricingSheet({ nav, focus, extras, setExtras }: { nav: SheetNav; focus?: 'availability'; extras: string[]; setExtras: (x: string[]) => void }) {
  const { d, facts, setFacts, dirty, save, discard } = useSheetDraft('pa', nav.q.get('split'))
  const items = useHubItems()
  // a field the property's channels don't have (Neukölln's Airbnb short-stay fee elsewhere) is left out
  const it = (k: string) => items.find((i) => i.key === k)
  const [text, setText] = useState(nav.q.get('text') ?? '')
  const body = useRef<HTMLDivElement>(null)
  const added = useAdded().filter((f) => factCat(f) === 'pricing' || factCat(f) === 'availability')
  const chs = useListingChannels()
  useEffect(() => { if (chs.length > 1) d.setSplit('price:markup', true) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (focus !== 'availability') return
    const t = setTimeout(() => body.current?.querySelector('#khd-stay')?.scrollIntoView({ block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [focus])
  const row = (k: string, help?: string | false) => { const i = it(k); return i ? <FieldRow item={i} d={d} help={help ?? false} /> : null }
  const pair = (a: string, b: string) => (it(a) && it(b) ? <div className="h-khd-pair">{row(a)}{row(b)}</div> : <>{row(a)}{row(b)}</>)
  const extra = (after: string) => PA_EXTRAS.filter((x) => x.after === after && extras.includes(x.key) && it(x.key)).map((x) => <div key={x.key}>{row(x.key, it(x.key)?.help)}</div>)
  const add = (label: string) => {
    const x = PA_EXTRAS.find((e) => e.label.toLowerCase() === label.toLowerCase())
    if (x && it(x.key)) { if (!extras.includes(x.key)) setExtras([...extras, x.key]); setTimeout(() => body.current?.querySelector(`[data-kh-key="${x.key}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60) }
    else setFacts((fs) => [{ label, value: '' }, ...fs])
  }
  return (
    <KhdSheet icon="coin" title="Pricing and availability" sub="Rates, fees, discounts and stay rules your channels start from" onClose={nav.close} bodyRef={body}
      foot={<Foot dirty={dirty} onDiscard={discard} onSave={() => save('pricing')} />}>
      <KhdGroup title="Rates">
        {pair('price:nightly', 'price:weekend')}
        <p className="h-khd-note"><Icon name="calendar" /><span>Nights you set in the Calendar or with Dynamic pricing override these.</span><Link className="h-textlink" to={`${nav.base}/calendar`}>Open Calendar</Link></p>
        {it('price:markup') && <FieldRow item={it('price:markup')!} d={d} help="Added on each channel, so you earn the same after its fees." />}
        {pair('price:included', 'price:extra')}
      </KhdGroup>
      <KhdGroup title="Fees and discounts">
        {row('price:cleaning')}
        {pair('price:short_clean', 'price:weekly')}
        {extra('fees')}
      </KhdGroup>
      <KhdGroup title="Stay rules" id="khd-stay">
        {row('avail:min_stay')}
        {row('avail:advance', 'How soon before check-in guests can book.')}
        {pair('avail:max_stay', 'avail:prep')}
        {extra('stay')}
      </KhdGroup>
      {(facts.length > 0 || added.length > 0) && (
        <KhdGroup title="Other fees and rules you added">
          {facts.map((f, i) => <NewFactRow key={i} f={f} autoFocus={i === 0} onChange={(n) => setFacts((fs) => fs.map((x, j) => (j === i ? n : x)))} onRemove={() => setFacts((fs) => fs.filter((_, j) => j !== i))} />)}
          {added.map((f) => <FactRow key={f.id} f={f} d={d} />)}
        </KhdGroup>
      )}
      <KhdAddBox placeholder="Add fee or stay rule, e.g. Pet fee" hint={chs.length > 1 ? 'Adds to all channels' : `Adds to ${NAME[chs[0]]}`} value={text} onChange={setText} onAdd={add}
        suggestions={PA_EXTRAS.filter((x) => !extras.includes(x.key) && it(x.key)).map((x) => x.label)} autoFocus={nav.q.get('add') === '1'} />
    </KhdSheet>
  )
}

/* ---------- Policies: cancellation is set on each channel; booking requests per channel ---------- */
export function PoliciesSheet({ nav }: { nav: SheetNav }) {
  const { d, dirty, save, discard } = useSheetDraft('policies')
  const inst = (c: ListingChannel) => (d.cv(c, 'policy:instant') ?? INSTANT_DEFAULT[c]) as string
  const cancel = useAllCancellationCards() // live from the Booking policies flow
  const ALL = useListingChannels()
  const scenario = useIsScenario()
  const otas = ALL.filter((c) => c !== 'direct')
  const policyNote = scenario ? 'Airbnb and Booking.com set these on their side. Your site uses the Base policy.'
    : `${otas.length ? `${names(otas)} set${otas.length === 1 ? 's it on its' : ' these on their'} side.` : ''}${ALL.includes('direct') ? `${otas.length ? ' ' : ''}Your site uses the Base policy.` : ''}`
  return (
    <KhdSheet icon="shield-check" title="Policies" sub="Cancellation and booking requests, per channel" onClose={nav.close}
      foot={<Foot dirty={dirty} onDiscard={discard} onSave={() => save('policies')} />}>
      <KhdGroup title="Cancellation">
        <div className="h-khd-policy">
          {ALL.map((c) => {
            const card = cancel[c][0]
            return (
              <div key={c} className="h-khd-policy__row">
                <KhdSplitRowHead c={c} />
                <div className="h-khd-policy__body"><b>{card.title}</b><p>{card.body}</p>{card.meta && <small>{card.meta}</small>}</div>
              </div>
            )
          })}
        </div>
        <KhdCaption text={policyNote} action={ALL.includes('booking') ? <Link className="h-field-hint__action" to={`${nav.base}/ch/booking/policies`}>Open Booking.com policies</Link> : undefined} />
      </KhdGroup>
      <KhdGroup title="Booking requests">
        <KhdField label="How requests are handled" help="Accept every request, only low-risk guests, or review each one.">
          <KhdSplit>
            {ALL.map((c) => (
              <KhdSplitRow key={c} channel={c}>
                <Dropdown label={`Booking requests on ${NAME[c]}`} value={instantLabel(inst(c))} options={INSTANT_BOOK.map((o) => o.label)}
                  onChange={(l) => { const id = INSTANT_BOOK.find((o) => o.label === l)!.id; d.setCustom(c, 'policy:instant', id === INSTANT_DEFAULT[c] ? null : id) }} />
              </KhdSplitRow>
            ))}
          </KhdSplit>
        </KhdField>
      </KhdGroup>
    </KhdSheet>
  )
}
const KhdSplitRowHead = ({ c }: { c: ListingChannel }) => <span className="h-khd-split__ch"><ChannelMark c={c} />{NAME[c]}</span>

/* ---------- Ask the AI: answer as a guest on a chosen channel, with the facts it used ---------- */
export function AskSheet({ nav, live }: { nav: SheetNav; live: HubDraft }) {
  const pid = useHubPid()
  const ALL = useListingChannels()
  const facts = [...startFacts(pid), ...useAdded()]
  const asked0 = nav.q.get('ch') as ListingChannel | null
  const [c, setC] = useState<ListingChannel>(asked0 && ALL.includes(asked0) ? asked0 : ALL.includes('booking') ? 'booking' : ALL[0])
  const [q, setQ] = useState(nav.q.get('q') ?? 'Can I book just 2 nights?')
  const [asked, setAsked] = useState(q)
  const input = useRef<HTMLInputElement>(null)
  const a = asked ? answer(asked, c, live, facts, pid) : null
  const edit = a?.edit ? catById(a.edit) : undefined
  return (
    <KhdSheet icon="sparkles" ai phone="sheet" title="Ask the AI" sub="Answers read the Knowledge Hub, as each channel’s guest sees it" onClose={nav.close}>
      <div className="h-khd-askbar">
        <span>Answer as a guest on</span>
        {ALL.length > 1
          ? <Dropdown label="Channel" value={NAME[c]} options={ALL.map((x) => NAME[x])} onChange={(l) => setC(ALL.find((x) => NAME[x] === l)!)} />
          : <span className="h-khd-split__ch"><ChannelMark c={c} />{NAME[c]}</span>}
      </div>
      <form className="h-khd-askinput" onSubmit={(e) => { e.preventDefault(); setAsked(q.trim()) }}>
        <input ref={input} className="h-input" value={q} placeholder="Ask a question a guest might ask…" aria-label="Question" onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="h-btn-icon" aria-label="Ask"><Icon name="send" /></button>
      </form>
      {a && (
        <>
          <div className="h-khd-answer"><span className="h-khd-answer__label"><Icon name="sparkles" />Answer</span><p>{a.text}</p></div>
          {a.facts.length > 0 && (
            <div className="h-khd-facts">
              <p className="h-khd-facts__title">Facts it used · {a.facts.length}</p>
              {a.facts.map((f) => (
                <div key={f.label} className="h-khd-factrow">
                  <button type="button" className="h-khd-factrow__main" onClick={() => nav.open(f.cat)}>
                    <span className="h-khd-factrow__cat">{catById(f.cat)?.label}</span>
                    <span className="h-khd-factrow__label">{f.label}</span>
                    <span className="h-khd-factrow__value">{f.value}</span>
                  </button>
                  <span className="h-khd-factrow__scope">{f.scope}</span>
                </div>
              ))}
            </div>
          )}
          {a.differs && <p className="h-khd-note"><Icon name="info-circle" /><span>{NAME[a.differs.c]} {a.differs.text}</span></p>}
          {a.gap && <p className="h-khd-card__missing"><Icon name="alert-circle" size={16} /><span>A gap in the Hub. Add the answer once and {ALL.length > 1 ? 'every channel’s guests get it' : 'your guests get it'}.</span></p>}
          <div className="h-khd-links">
            {a.gap
              ? <button type="button" className="h-textlink" onClick={() => nav.open(a.edit ?? 'add', a.edit === 'location' ? { add: '1', text: 'Parking' } : { text: asked })}><Icon name="plus" />Add the answer</button>
              : edit && <button type="button" className="h-textlink" onClick={() => nav.open(edit.id)}><Icon name="pencil" />Wrong? Edit {edit.label}</button>}
            <button type="button" className="h-textlink" onClick={() => { setQ(''); setAsked(''); input.current?.focus() }}>Try another question</button>
          </div>
        </>
      )}
    </KhdSheet>
  )
}

/* ---------- Sources ---------- */
export function SourcesSheet({ nav, sources, onAdd }: { nav: SheetNav; sources: Source[]; onAdd: (s: Source) => void }) {
  const [adding, setAdding] = useState(nav.q.get('add') === '1')
  const [v, setV] = useState('')
  const submit = () => {
    const t = v.trim(); if (!t) return
    const pdf = /\.pdf$/i.test(t)
    onAdd({ icon: pdf ? 'book-2' : 'link', name: pdf ? t.split('/').pop()! : t.replace(/^https?:\/\//, '').split('/')[0], detail: pdf ? 'PDF' : t, when: 'Added today' })
    setV(''); setAdding(false)
  }
  return (
    <KhdSheet icon="stack-2" phone="sheet" title="Sources" sub="What the Knowledge Hub learns from. Facts it finds are filed in their category." onClose={nav.close}>
      <div className="h-khd-srclist">
        {sources.map((s) => (
          <div key={s.name} className="h-khd-src">
            <span className="h-khd-srcdot"><Icon name={s.icon} /></span>
            <span className="h-khd-src__main"><span className="h-khd-src__name">{s.name}</span><span className="h-khd-src__detail">{s.detail}</span></span>
            <span className="h-khd-src__when">{s.when}</span>
            <button type="button" className="h-btn-icon" aria-label={`More for ${s.name}`}><Icon name="dots" /></button>
          </div>
        ))}
      </div>
      {adding ? (
        <form className="h-khd-srcform" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <input className="h-input" autoFocus value={v} placeholder="Paste a link or a PDF’s name" aria-label="Source" onChange={(e) => setV(e.target.value)} />
          <Button kind="primary" type="submit" disabled={!v.trim()}>Add</Button>
          <Button type="button" onClick={() => setAdding(false)}>Cancel</Button>
        </form>
      ) : (
        <div className="h-khd-srcadd"><Button icon="plus" onClick={() => setAdding(true)}>Add source</Button><span>PDF, link, or a Hospitable guidebook</span></div>
      )}
    </KhdSheet>
  )
}

/* ---------- Add anything: type or paste a fact; it's filed in a category; you confirm where ---------- */
export function AddAnythingSheet({ nav, onSaved }: { nav: SheetNav; onSaved: (cat: CatId, label: string) => void }) {
  const [text, setText] = useState(nav.q.get('text') ?? '')
  const guess = fileFact(text)
  const [cat, setCat] = useState<CatId | null>(null)
  const [label, setLabel] = useState<string | null>(null)
  const c = cat ?? guess.cat
  const l = label ?? guess.label
  const target = catById(c)!
  const OPTIONS: CatId[] = ['property', 'arrival', 'location', 'amenities', 'rules', 'pricing', 'availability', 'policies', 'custom']
  const ALL = useListingChannels()
  const saveIt = () => {
    if (c === 'amenities') { const s = useStore.getState(); ALL.forEach((ch) => s.sl3Custom(ch, amenityKey(l), 'on')) }
    else useHubUi.getState().add({ id: `khd.${c}.${Date.now()}`, label: l, value: text.trim(), source: 'Added by you · today' })
    onSaved(c, l)
  }
  const ready = text.trim().length > 2
  return (
    <KhdSheet icon="plus" title="Add anything" sub="Type or paste a fact. It’s filed in the right category, and you confirm where before it’s saved." onClose={nav.close}
      foot={<><Button onClick={nav.close}>Cancel</Button><Button kind="primary" disabled={!ready} onClick={saveIt}>Save to {target.label}</Button></>}>
      <KhdField label="The fact" help="A sentence is enough, the way you’d tell a guest.">
        <textarea className="h-textarea" rows={4} autoFocus value={text} placeholder="e.g. Street parking is free after 20:00 and on Sundays." aria-label="The fact" onChange={(e) => setText(e.target.value)} />
      </KhdField>
      {ready && (
        <div className={cx('h-khd-filed')}>
          <p className="h-khd-filed__line"><Icon name="sparkles" />Filed under {target.label}{c === 'amenities' ? (ALL.length > 1 ? ' as an amenity on every channel' : ` as an amenity on ${NAME[ALL[0]]}`) : ''}. Change it if it belongs somewhere else.</p>
          <KhdField label="Category"><Dropdown label="Category" value={target.label} options={OPTIONS.map((o) => catById(o)!.label)} onChange={(v) => setCat(OPTIONS.find((o) => catById(o)!.label === v)!)} /></KhdField>
          <KhdField label={c === 'amenities' ? 'Amenity' : 'Label'}><input className="h-input" value={l} aria-label="Label" onChange={(e) => setLabel(e.target.value)} /></KhdField>
        </div>
      )}
    </KhdSheet>
  )
}

