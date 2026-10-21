/* KH-C · Everything A–Z: every fact, by the Hub's groups, so the question lens never hides one. Each row says how many
 * answers use it; editing works exactly as it does behind an answer. */
import { Link } from 'react-router-dom'
import { KhNav, KhcFacts, PhotosRow } from '../../../../ds'
import { channelPhotos } from '../../../../data/photos'
import { photoUrl } from '../../../../data/v3-cv'
import type { KhSectionId } from '../../../../data/v3-kh'
import { CHANNELS } from '../../../../data/channels'
import { useStore } from '../../../../store/store'
import { FactRow } from './Facts'
import { AZ_GROUPS, groupItems, type Hub } from './model'

const DESC: Partial<Record<KhSectionId, string>> = {
  custom: 'Things guests ask about that no listing field holds, including answers you added from a gap. Only your AI replies use them, unless you chose a channel.',
}
/** A property with no message history has no gaps to answer from yet. */
const DESC_GENERIC: Partial<Record<KhSectionId, string>> = {
  custom: 'Things guests ask about that no listing field holds. Only your AI replies use them.',
}
const EMPTY: Partial<Record<KhSectionId, string>> = {
  custom: 'No custom facts yet. Add what guests ask about that no listing field holds: open a question and use “Add a fact to this answer”.',
}

export function EverythingAZ({ hub, group, onGroup, base, edit, onEdit }: {
  hub: Hub; group: KhSectionId; onGroup: (g: KhSectionId) => void; base: string; edit: string | null; onEdit: (k: string | null) => void
}) {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const count = (id: KhSectionId) => (id === 'photos' ? lib.base.length : groupItems(hub, id).length)
  const g = AZ_GROUPS.find((x) => x.id === group)!
  const row = (key: string) => {
    const used = hub.usedIn(key).length
    const id = `az:${key}`
    return (
      <FactRow key={key} hub={hub} fact={{ keys: [key] }} base={base} editing={edit === id} onEdit={(v) => onEdit(v ? id : null)}
        sub={used ? `Used in ${used} ${used === 1 ? 'answer' : 'answers'}` : 'Not used in an answer yet'}
        note={used ? `Used in ${used} ${used === 1 ? 'answer' : 'answers'}; ${used === 1 ? 'it follows' : 'they all follow'}.` : undefined} />
    )
  }
  let body
  if (group === 'photos') {
    body = (
      <>
        <PhotosRow label="Photo library" count={lib.base.length} desc="Add photos, captions and room tags once. Each channel picks from here." manageTo={`${base}/photos`}
          photos={lib.base.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))} />
        <h3 className="h-khc-az__sub">Per channel</h3>
        <KhcFacts>
          {hub.chs.map((c) => {
            const { shown, hidden } = channelPhotos(c, lib, { tips, custom })
            return (
              <div key={c} className="h-khc-fact">
                <span className="h-khc-fact__label">{CHANNELS[c].name}</span>
                <span className="h-khc-fact__value">{shown.length} photos{hidden.length ? ` · ${hidden.length} hidden` : ''}<small>Cover: {lib.meta[shown[0]]?.description ?? '—'}</small></span>
                <span className="h-khc-fact__scope"><Link className="h-textlink" to={`${base}/ch/${c}/listing/essentials`}>Open</Link></span>
                <span />
              </div>
            )
          })}
        </KhcFacts>
      </>
    )
  } else if (group === 'amenities') {
    body = hub.amenities.map((ag) => (
      <div key={ag.group}>
        <h3 className="h-khc-az__sub">{ag.group}</h3>
        <KhcFacts>{ag.items.map((i) => row(`amenity:${i.name}`))}</KhcFacts>
      </div>
    ))
  } else {
    const keys = groupItems(hub, group)
    body = keys.length ? <KhcFacts>{keys.map(row)}</KhcFacts> : <p className="h-khc-empty">{EMPTY[group] ?? 'Nothing here yet.'}</p>
  }
  return (
    <div className="h-khc-az">
      <KhNav active={group} onSelect={(id) => onGroup(id as KhSectionId)} items={AZ_GROUPS.map((x) => ({ id: x.id, label: x.label, count: count(x.id) }))} />
      <div>
        <div className="h-khc-az__head"><h2>{g.label}</h2><p>{(hub.scenario ? DESC : DESC_GENERIC)[group] ?? g.desc}</p></div>
        {body}
      </div>
    </div>
  )
}
