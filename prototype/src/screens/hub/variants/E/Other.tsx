/* KH-E · Photos and Booking policies under the lens. Photos: the library is the Base; each channel picks its own
 * selection and order (the real Photos row, thumbnails never rescale). Policies: cancellation terms each channel sets for
 * itself (Direct uses the Base policy); instant book per channel. */
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Dot, Dropdown, KheField, KheScope, Mark, NoDiff, PhotosRow, PolicyCard, SaveActions, SectionHead } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { KH_INSTANT } from '../../../../data/v3-kh'
import { useAllCancellationCards } from '../../policyCards'
import { photoUrl } from '../../../../data/v3-cv'
import { channelPhotos } from '../../../../data/photos'
import { useStore } from '../../../../store/store'
import { TAB_HEAD } from './data'
import { NAME, names } from './lens'
import type { LensCtx } from './ctx'

export function PhotosTab({ ctx }: { ctx: LensCtx }) {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const sl3 = useMemo(() => ({ tips, custom }), [tips, custom])
  const { lens, diff, base, channels } = ctx
  const own: ListingChannel[] = channels.filter((c) => c !== 'direct') // Airbnb and Booking.com keep their own order and cover (FIELDS.photos)
  const pics = (keys: string[]) => keys.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))
  if (lens === 'base') {
    return (
      <div className="khe-page">
        <SectionHead title="Photos" desc={TAB_HEAD.photos.desc} />
        <KheField caption={<KheScope>{scopeParts(channels.filter((c) => !own.includes(c)), own, own.length === 1 ? 'has its own selection and order' : 'have their own selection and order')}</KheScope>}>
          <PhotosRow label="Photo library" count={lib.base.length} desc="Add photos, captions and room tags once. Each channel picks from here." manageTo={`${base}/photos`} photos={pics(lib.base)} />
        </KheField>
        <div className="khe-chlines">
          {channels.map((c) => {
            const { shown, hidden } = channelPhotos(c, lib, sl3)
            return (
              <div key={c} className="khe-chline">
                <Mark channel={c} /><b>{NAME(c)}</b>
                <span>{shown.length} photos · cover: {lib.meta[shown[0]]?.description?.toLowerCase() ?? '-'}{hidden.length ? ` · ${hidden.length} hidden` : ''}</span>
                <button type="button" className="h-textlink" onClick={() => ctx.setLens(c)}>Open in the {NAME(c)} lens</button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  const c = lens
  const { shown, hidden } = channelPhotos(c, lib, sl3)
  if (diff && !own.includes(c)) {
    return <div className="khe-page"><NoDiff title={`${NAME(c)} uses the Base photo library`} summary={`All ${shown.length} photos, in the library’s order.`} action={<button type="button" className="h-textlink" onClick={() => ctx.setDiff(false)}>Show the photos</button>} /></div>
  }
  return (
    <div className="khe-page">
      <SectionHead title="Photos" desc={`What ${NAME(c)} guests see, in this order.`} />
      <KheField
        caption={own.includes(c) ? <KheScope>Custom for {NAME(c)}<Dot />its own selection and order{hidden.length ? <><Dot />{hidden.length} hidden</> : null}</KheScope> : <KheScope>Uses the Base<Dot />every photo, in the library’s order</KheScope>}>
        <PhotosRow label={`Photos on ${NAME(c)}`} count={shown.length} desc={`Cover: ${lib.meta[shown[0]]?.description ?? '-'}`} manageTo={`${base}/photos?channel=${c}`} photos={pics(shown)} />
      </KheField>
    </div>
  )
}

export function PoliciesTab({ ctx }: { ctx: LensCtx }) {
  const { lens, d, base, channels } = ctx
  const store = useStore((s) => s.sl3.custom)
  const { options, defaults } = KH_INSTANT
  const instant = (c: ListingChannel) => (d.cv(c, 'policy:instant') ?? defaults[c]) as string
  const label = (id: string) => options.find((o) => o.id === id)?.label ?? id
  const save = <SaveActions dirty={d.dirty} onDiscard={d.discard} onSave={() => d.commit()} />
  const cards = useAllCancellationCards()
  const ownTerms: ListingChannel[] = channels.filter((c) => c !== 'direct') // Direct follows the Base policy; the channels run their own terms
  if (lens === 'base') {
    const b = cards.direct[0]
    return (
      <div className="khe-page">
        <SectionHead title="Booking policies" desc={TAB_HEAD.policies.desc} actions={save} />
        <KheField label="Cancellation policy" help="What guests get back when they cancel."
          caption={<KheScope>{scopeParts(channels.filter((c) => !ownTerms.includes(c)), ownTerms, ownTerms.length === 1 ? 'sets its own terms' : 'set their own terms')}</KheScope>}>
          <PolicyCard title={b.title} body={b.body} />
        </KheField>
        <KheField label="Booking requests" help="Accept every request, only low-risk guests, or review each one." caption={<KheScope>Each channel has its own setting</KheScope>}>
          <div className="khe-chlines">
            {channels.map((c) => <div key={c} className="khe-chline"><Mark channel={c} /><b>{NAME(c)}</b><span>{label(instant(c))}</span><button type="button" className="h-textlink" onClick={() => ctx.setLens(c)}>Open in the {NAME(c)} lens</button></div>)}
          </div>
        </KheField>
      </div>
    )
  }
  const c = lens
  const own = ownTerms.includes(c)
  return (
    <div className="khe-page">
      <SectionHead title="Booking policies" desc={`What ${NAME(c)} guests agree to.`} actions={save} />
      <KheField label="Cancellation policy" help="What guests get back when they cancel."
        caption={!own ? <KheScope>Uses the Base</KheScope> : <KheScope lock>Set by {NAME(c)}<Dot />its own cancellation terms</KheScope>}
        action={<Link className="h-field-hint__action" to={`${base}/ch/${c}/policies`}>Open {NAME(c)} policies</Link>}>
        <div className="khe-policies">{cards[c].map((card) => <PolicyCard key={card.title} {...card} />)}</div>
      </KheField>
      <KheField label="Booking requests" help="Accept every request, only low-risk guests, or review each one." caption={<KheScope>Custom for {NAME(c)}</KheScope>}>
        <Dropdown label={`Booking requests on ${NAME(c)}`} value={label(instant(c))} options={options.map((o) => o.label)}
          onChange={(l) => { const id = options.find((o) => o.label === l)!.id; const saved = store[c]?.['policy:instant']; d.setCustom(c, 'policy:instant', id === defaults[c] ? (saved === undefined ? undefined : null) : id) }} />
      </KheField>
    </div>
  )
}

/** "Used by Direct · Airbnb and Booking.com set their own terms", with only the parts the property's channels need
 *  (Friedrichshain: "Airbnb sets its own terms"). */
function scopeParts(uses: ListingChannel[], own: ListingChannel[], ownText: string): ReactNode {
  const u = uses.length ? `Used by ${names(uses)}` : null
  const o = own.length ? `${names(own)} ${ownText}` : null
  return u && o ? <>{u}<Dot />{o}</> : u ?? o
}
