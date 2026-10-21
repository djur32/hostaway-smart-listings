/* KH-E · Amenities under the lens (Paper KH-E3 a). Base: every amenity and which channels list it. A channel: what it
 * lists (tick), what it's missing (struck out, "Add for X"), what it calls something else ("Add as 'Desk'"), what it has
 * no field for, and what only it lists. Ticking writes `amenity:<key>` for that channel only (the channel editor's key). */
import type { ReactNode } from 'react'
import { FoldedLine, KheAmenityRow, KheSummary, NoDiff, SaveActions, SectionHead } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { TAB_HEAD, type EAmenity } from './data'
import { NAME, amenityChannels, amenityDiffers, amenityGroups, amenityOn, names, setAmenity } from './lens'
import type { LensCtx } from './ctx'

export function AmenitiesTab({ ctx, composer }: { ctx: LensCtx; composer?: ReactNode }) {
  const { d, lens, diff, channels } = ctx
  const groups = amenityGroups(d)
  const all = groups.flatMap((g) => g.items)
  const onList = (a: EAmenity) => amenityChannels(a, d, channels)
  const one = channels.length === 1 ? channels[0] : null // a single-channel property (Friedrichshain: Airbnb)
  const c = lens === 'base' ? null : lens
  const save = <SaveActions dirty={d.dirty} onDiscard={d.discard} onSave={() => d.commit()} />

  /* what differs: Base = not on every channel; a channel = missing there, or only there (lens.ts amenityDiffers) */
  const differs = (a: EAmenity) => amenityDiffers(a, lens, d, channels)
  const shownOf = (items: EAmenity[]) => (diff ? items.filter(differs) : items)
  const same = diff ? all.filter((a) => !differs(a)) : []

  let summary: ReactNode
  if (c) {
    const has = all.filter((a) => amenityOn(a, c, d))
    const only = has.filter((a) => onList(a).length === 1)
    summary = <>{NAME(c)} lists {has.length} of your {all.length} amenities · {all.length - has.length} missing{!one && <> · {only.length} only on {NAME(c)}</>}</>
  } else {
    const every = all.filter((a) => onList(a).length === channels.length)
    summary = one
      ? <>{all.length} amenities · {every.length} listed on {NAME(one)}{all.length > every.length && <> · {all.length - every.length} not listed</>}</>
      : <>{all.length} amenities · {every.length} on every channel · {all.length - every.length} differ by channel</>
  }

  const row = (a: EAmenity) => {
    const on = onList(a)
    if (!c) {
      const right = on.length === channels.length ? (one ? `On ${NAME(one)}` : 'All channels') : on.length === 1 ? `Only on ${NAME(on[0])}` : on.length ? `On ${names(on)}` : 'Not listed anywhere'
      const renamed = a.renamedAs && Object.entries(a.renamedAs).map(([ch, n]) => `Called “${n}” on ${NAME(ch as ListingChannel)}`)[0]
      return <KheAmenityRow key={a.key} name={a.name} has={on.length > 0} sub={renamed} right={<span className="khe-amenity__scope">{right}</span>} />
    }
    const has = on.includes(c)
    const added = d.cv(c, `amenity:${a.key}`) === 'on' && !a.on.includes(c)
    const rename = a.renamedAs?.[c]
    const sub = !has && rename ? `Called “${rename}” on ${NAME(c)}` : a.note?.[c]
    let right: ReactNode
    if (!has) {
      right = a.noEquivalent?.includes(c) ? <span className="khe-amenity__scope">{NAME(c)} has no such amenity</span>
        : <button type="button" className="h-textlink" onClick={() => setAmenity(a, c, true, d)}>{rename ? `Add as “${rename}”` : `Add for ${NAME(c)}`}</button>
    } else if (added) {
      right = <button type="button" className="h-textlink" onClick={() => setAmenity(a, c, false, d)}>Remove</button>
    } else if (on.length === 1 && !one) {
      right = <span className="khe-amenity__scope">Only on {NAME(c)}</span>
    }
    return <KheAmenityRow key={a.key} name={a.name} has={has} sub={sub} right={right} />
  }

  const visible = groups.map((g) => ({ ...g, items: shownOf(g.items) })).filter((g) => g.items.length)
  if (diff && !visible.length && !composer) {
    return (
      <div className="khe-page">
        <NoDiff title={c ? `${NAME(c)} lists every amenity in the Base` : one ? `${NAME(one)} lists every amenity` : 'Every channel lists every amenity'}
          action={<button type="button" className="h-textlink" onClick={() => ctx.setDiff(false)}>Show all {all.length} amenities</button>} />
      </div>
    )
  }
  return (
    <div className="khe-page">
      <SectionHead title="Amenities" desc={c ? `What ${NAME(c)} guests see listed.` : TAB_HEAD.amenities.desc} actions={save} />
      {composer}
      <KheSummary>{summary}</KheSummary>
      {visible.map((g) => (
        <div key={g.group} className="khe-amenities">
          <h3 className="khe-amenities__group">{g.group}</h3>
          {g.items.map(row)}
        </div>
      ))}
      {same.length > 0 && (
        <div className="khe-folds">
          <FoldedLine action={<button type="button" className="h-textlink" onClick={() => ctx.setDiff(false)}>Show them</button>}>
            {c ? `${same.length} more amenities are listed on ${NAME(c)}${one ? '' : ' and other channels'}.` : one ? `${same.length} amenities are listed on ${NAME(one)}.` : `${same.length} amenities are listed on every channel.`}
          </FoldedLine>
        </div>
      )}
    </div>
  )
}
