/* KH-A · Amenities as a tick matrix (Paper KH-A1). Base = what the home has; each channel column = what it lists.
 * Ticks write `amenity:<name>` per channel, the ListingEditor's keys; the Base writes sl3Base(`amenity:<name>`). */
import { Fragment, useEffect, useRef, useState } from 'react'
import {
  Button, Icon, KhaAddLink, KhaAlias, KhaCell, KhaCellStatic, KhaCheck, KhaColHead, KhaGroup, KhaHeadRow, KhaLegend, KhaNone, KhaRow, KhaStrip,
  KhaTable, KhaTip, KhaToolbar, Pill,
} from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { useStore } from '../../../../store/store'
import { useHubUi } from '../../state'
import {
  NAME, amenityDefs, amenityGroups, amenityKey, amenityView, cellId, matchAmenity, names, setAmenity, useKhaAdded,
  type AmenityDef, type AmenityView,
} from './model'
import { useHubPid, useListingChannels } from '../../perProperty'

interface Props { cited: Record<string, number>; flash: string | null; tip: string | null; addOpen: boolean; prefill: string; narrow: boolean }

export function Amenities({ cited, flash, tip, addOpen, prefill, narrow }: Props) {
  const pid = useHubPid()
  const CHS = useListingChannels()
  const AMENITY_GROUPS = amenityGroups(pid)
  const base = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const added = useKhaAdded((s) => s.added)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<string | null>(addOpen ? AMENITY_GROUPS[0] : null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const defs = [...amenityDefs(pid), ...added]
  const views = defs.map((d) => amenityView(d, base, custom))
  const needle = search.trim().toLowerCase()
  const shown = needle ? views.filter((v) => v.def.label.toLowerCase().includes(needle) || Object.values(v.def.alias ?? {}).some((a) => a?.toLowerCase().includes(needle))) : views
  const listed = (c: ListingChannel) => views.filter((v) => v.on[c] === true).length
  const inHome = views.filter((v) => v.base === 'yes').length

  return (
    <>
      <KhaToolbar
        left={<label className="h-input-wrap kha-search"><Icon name="search" /><input className="h-input" type="search" placeholder="Search amenities" aria-label="Search amenities" value={search} onChange={(e) => setSearch(e.target.value)} /></label>}
        right={narrow ? undefined : <KhaLegend items={[
          { sample: <KhaCheck checked label="Listed" disabled />, label: 'Listed' },
          { sample: <KhaCheck checked={false} label="Not listed" disabled />, label: 'Not listed' },
          { sample: <KhaNone />, label: 'The channel doesn’t offer it' },
        ]} />} />
      <KhaTable layout="amenities" label="Amenities by channel" channels={CHS}>
        <KhaHeadRow first="Amenity" cols={[<KhaColHead key="b" col="base" sub={`${inHome} in the home`} />, ...CHS.map((c) => <KhaColHead key={c} col={c} sub={`${listed(c)} listed`} />)]} />
        {[...AMENITY_GROUPS, ...new Set(added.map((a) => a.group).filter((g) => !AMENITY_GROUPS.includes(g)))].map((g) => {
          const rows = shown.filter((v) => v.def.group === g)
          if (needle && !rows.length) return null
          return (
            <div key={g} role="rowgroup" className="kha-rowgroup">
              <KhaGroup title={g} sub={`${rows.length} ${rows.length === 1 ? 'amenity' : 'amenities'}`} />
              {rows.map((v) => (
                <Fragment key={v.def.key}>
                  <AmenityRow v={v} cited={cited} flash={flash} tip={tip} onBaseOff={() => setConfirm(v.def.key)} />
                  {v.base === 'unsure' && <Disagree v={v} />}
                  {confirm === v.def.key && v.base === 'no' && <RemoveEverywhere v={v} onDone={() => setConfirm(null)} />}
                </Fragment>
              ))}
              {!needle && (adding === g
                ? <AddRow group={g} prefill={addOpen && g === AMENITY_GROUPS[0] ? prefill : ''} onDone={() => setAdding(null)} />
                : <KhaAddLink label="Add amenity" onClick={() => setAdding(g)} />)}
            </div>
          )
        })}
      </KhaTable>
    </>
  )
}

function AmenityRow({ v, cited, flash, tip, onBaseOff }: { v: AmenityView; cited: Record<string, number>; flash: string | null; tip: string | null; onBaseOff: () => void }) {
  const CHS = useListingChannels()
  const key = amenityKey(v.def)
  const unsure = v.base === 'unsure'
  const setBase = (on: boolean) => { useStore.getState().sl3Base(key, on ? 'yes' : 'no'); if (!on && CHS.some((c) => v.on[c] === true)) onBaseOff() }
  return (
    <KhaRow tone={unsure ? 'warn' : undefined} dataKey={key}>
      <KhaCell item><span className="kha-itemname">{v.def.label}</span>{unsure && <Pill kind="warning"><Icon name="alert-triangle" size={16} />Channels disagree</Pill>}</KhaCell>
      <KhaCell className="kha-cell--base">
        {unsure ? <Pill kind="warning"><Icon name="help-circle" size={16} />Not sure</Pill>
          : <KhaCheck checked={v.base === 'yes'} label={`${v.def.label} in the home`} onChange={setBase} />}
      </KhaCell>
      {CHS.map((c) => {
        const id = cellId(key, c)
        const on = v.on[c]
        if (on === 'na') return (
          <KhaCell key={c}>
            <KhaTip title={`Not on ${NAME(c)}`} text={`${NAME(c)} has no amenity for this. Mention it in the description instead.`} defaultOpen={tip === id}>
              <KhaCellStatic cellId={id} cited={cited[id]} flash={flash === id}><KhaNone /></KhaCellStatic>
            </KhaTip>
          </KhaCell>
        )
        const alias = v.def.alias?.[c]
        return (
          <KhaCell key={c}>
            <KhaCellStatic cellId={id} cited={cited[id]} flash={flash === id}>
              <span className="kha-tick">
                <KhaCheck checked={on} label={`${v.def.label} on ${NAME(c)}`} onChange={(x) => setAmenity(v.def, c, x)} />
                {alias && <KhaAlias>{alias}</KhaAlias>}
              </span>
            </KhaCellStatic>
          </KhaCell>
        )
      })}
    </KhaRow>
  )
}

/** "Channels disagree": one yes/no question about the home, which writes the Base and the channels. */
function Disagree({ v }: { v: AmenityView }) {
  const CHS = useListingChannels()
  const on = CHS.filter((c) => v.on[c] === true)
  const off = CHS.filter((c) => v.on[c] === false)
  const name = v.def.label.toLowerCase()
  const resolve = (yes: boolean) => {
    useStore.getState().sl3Base(amenityKey(v.def), yes ? 'yes' : 'no')
    for (const c of yes ? off : on) setAmenity(v.def, c, yes)
    if (v.def.key === 'Balcony') useHubUi.getState().resolve('d-balcony', yes ? 'Yes, a balcony' : 'No balcony')
  }
  return (
    <KhaStrip tone="warn" icon="alert-triangle"
      actions={<><Button onClick={() => resolve(true)}>Yes, it has one</Button><Button onClick={() => resolve(false)}>No, remove it from {names(on)}</Button></>}>
      {names(on)} {on.length === 1 ? 'lists' : 'list'} a {name}; {names(off)} {off.length === 1 ? 'doesn’t' : 'don’t'}. Does the home have one?
    </KhaStrip>
  )
}

/** Unticking the Base while channels still list it: one question, not a silent mismatch. */
function RemoveEverywhere({ v, onDone }: { v: AmenityView; onDone: () => void }) {
  const CHS = useListingChannels()
  const on = CHS.filter((c) => v.on[c] === true)
  if (!on.length) return null
  return (
    <KhaStrip tone="warn" icon="info-circle"
      actions={<><button type="button" className="h-textlink" onClick={onDone}>Keep the listings</button><Button onClick={() => { on.forEach((c) => setAmenity(v.def, c, false)); onDone() }}>Remove it everywhere</Button></>}>
      {v.def.label} is still listed on {names(on)}. Remove it there too?
    </KhaStrip>
  )
}

/** The in-place add row: type once; each channel's own name is matched and pre-ticked. */
function AddRow({ group, prefill, onDone }: { group: string; prefill: string; onDone: () => void }) {
  const CHS = useListingChannels()
  const [name, setName] = useState(prefill)
  const [off, setOff] = useState<ListingChannel[]>([])
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { input.current?.focus() }, [])
  const typed = name.trim()
  const match = matchAmenity(typed)
  const can = (c: ListingChannel) => match[c] !== null
  const add = () => {
    if (!typed) return
    const def: AmenityDef = {
      key: typed, label: typed, group, base: 'yes',
      on: { airbnb: can('airbnb') ? false : 'na', booking: can('booking') ? false : 'na', direct: false },
      alias: Object.fromEntries(CHS.filter((c) => match[c] && match[c]!.toLowerCase() !== typed.toLowerCase()).map((c) => [c, match[c]!])),
    }
    useKhaAdded.getState().add(def)
    const st = useStore.getState()
    st.sl3Base(amenityKey(def), 'yes')
    for (const c of CHS) if (can(c) && !off.includes(c)) st.sl3Custom(c, amenityKey(def), 'on')
    onDone()
  }
  return (
    <>
      <KhaRow tone="add">
        <KhaCell item><input ref={input} className="h-input kha-addinput" value={name} placeholder="Amenity name" aria-label={`New amenity in ${group}`} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') onDone() }} /></KhaCell>
        <KhaCell className="kha-cell--base"><KhaCheck checked={!!typed} disabled label="In the home" /></KhaCell>
        {CHS.map((c) => (
          <KhaCell key={c}>
            {!typed ? null : !can(c) ? <KhaTip title={`Not on ${NAME(c)}`} text={`${NAME(c)} has no amenity for this.`}><KhaNone /></KhaTip> : (
              <span className="kha-tick">
                <KhaCheck checked={!off.includes(c)} label={`${typed} on ${NAME(c)}`} onChange={(x) => setOff(x ? off.filter((o) => o !== c) : [...off, c])} />
                {match[c]!.toLowerCase() !== typed.toLowerCase() && <KhaAlias>{match[c]}</KhaAlias>}
              </span>
            )}
          </KhaCell>
        ))}
      </KhaRow>
      <KhaStrip tone="add" actions={<><button type="button" className="h-textlink" onClick={onDone}>Cancel</button><Button kind="primary" disabled={!typed} onClick={add}>Add amenity</Button></>}>
        {typed ? 'Matched to each channel’s own list. Untick a channel to leave it off there.' : 'Type it once. We match it to each channel’s own list.'}
      </KhaStrip>
    </>
  )
}
