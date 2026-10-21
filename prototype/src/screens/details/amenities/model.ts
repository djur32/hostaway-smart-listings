/* Listing details › Amenities: the property's amenity list as the Base (every channel), and its writes.
 * The list is data/property-listing.ts amenitiesFor(pid) (Neukölln's real AMENITIES unchanged; computed per property
 * otherwise); each channel's own add / remove lives in sl3.custom as `amenity:<name>` 'on' | 'off', the same keys the
 * channel editor and Review & push read. An amenity is "added" when at least one connected channel lists it.
 * Base actions write every channel at once and send through the commit path (screens/push/changes.ts): adding lists it on
 * every channel that has a field for it; the trash removes it everywhere. sl3.base `amenity:<name>` keeps "the home has
 * it" ('yes' / 'no'), as the Knowledge Hub does. Details (the pencil) live in sl3.base `amenity-details:<name>`. */
import { useMemo } from 'react'
import { amenitiesFor } from '../../../data/property-listing'
import {
  AMENITY_CATALOG, AMENITY_CATEGORIES, amenityChannels, catalogAmenity, detailsDefault, detailsKey, detailsKind, detailsSummary, orList,
  type DetailKind,
} from '../../../data/details'
import type { ListingChannel } from '../../../data/sl3'
import { useStore } from '../../../store/store'
import { useListingChannels } from '../../../store/selectors'
import { useProperty } from '../../../shell/PropertyLayout'
import { commitAndSend, sendReceipts, type Receipt } from '../../push/changes'

export const amenityKey = (name: string) => `amenity:${name}`

export interface AmenityView {
  name: string; category: string
  /** Connected channels that list it now. */
  where: ListingChannel[]
  added: boolean
  /** Only when it isn't on every channel: "Not on Booking.com". Nothing when it applies everywhere. */
  flag?: string
  note?: string
  kind?: DetailKind
  details?: string
}

export function useAmenities() {
  const p = useProperty()
  const chs = useListingChannels()
  const custom = useStore((s) => s.sl3.custom)
  const base = useStore((s) => s.sl3.base)
  return useMemo(() => {
    const list = amenitiesFor(p.id)
    const known = new Map(list.flatMap((g) => g.items.map((i) => [i.name, { ...i, group: g.group }] as const)))
    const defaultOn = (ch: ListingChannel, name: string) => !!known.get(name)?.on.includes(ch)
    const onFor = (ch: ListingChannel, name: string) => {
      const v = custom[ch]?.[amenityKey(name)]
      return v === 'on' ? true : v === 'off' ? false : defaultOn(ch, name)
    }
    const categoryOf = (name: string) => known.get(name)?.group ?? AMENITY_CATEGORIES.find((c) => AMENITY_CATALOG[c].some((a) => a.name === name)) ?? 'Services'
    const view = (name: string): AmenityView => {
      const where = chs.filter((c) => onFor(c, name))
      const added = where.length > 0
      // added: the channels missing it; not added: the channels that have no field for it
      const off = added ? chs.filter((c) => !where.includes(c)) : chs.filter((c) => !amenityChannels(name, chs).includes(c))
      const kind = detailsKind(name)
      const details = kind ? base[detailsKey(name)] ?? detailsDefault(name) : undefined
      const dataNote = known.get(name)?.note
      return {
        name, category: categoryOf(name), where, added, kind, details,
        flag: off.length && off.length < chs.length ? `Not on ${orList(off)}` : undefined,
        note: (kind && detailsSummary(kind, details)) ?? (dataNote && dataNote !== 'Channels disagree' ? dataNote : catalogAmenity(name)?.desc),
      }
    }
    // every amenity a host can pick, by category: the property's own list first, then the catalog (one entry per name)
    const seen = new Set<string>()
    const groups = AMENITY_CATEGORIES.map((cat) => {
      const names = [...(list.find((g) => g.group === cat)?.items.map((i) => i.name) ?? []), ...AMENITY_CATALOG[cat].map((a) => a.name)]
        .filter((n) => categoryOf(n) === cat && !seen.has(n) && (seen.add(n), true))
      return { category: cat as string, items: names.map(view) }
    })
    // a group in the property's data that isn't one of the 14 categories
    for (const g of list) if (!AMENITY_CATEGORIES.includes(g.group as never)) groups.push({ category: g.group, items: g.items.filter((i) => !seen.has(i.name)).map((i) => view(i.name)) })
    return { groups, defaultOn, chs }
  }, [p.id, chs, custom, base])
}

/** Adds (on every channel that has a field for it) or removes (everywhere) an amenity, and sends it. */
export function setAmenity(name: string, on: boolean, chs: ListingChannel[], defaultOn: (ch: ListingChannel, name: string) => boolean): Receipt[] {
  const key = amenityKey(name)
  const targets = on ? amenityChannels(name, chs) : []
  return commitAndSend(() => {
    const st = useStore.getState()
    for (const ch of chs) {
      const want = targets.includes(ch)
      st.sl3Custom(ch, key, want === defaultOn(ch, name) ? undefined : want ? 'on' : 'off') // back to the imported list = no entry
    }
    st.sl3Base(key, on ? 'yes' : 'no')
  }, chs, [key])
}

/** Saves an amenity's details and sends them to every channel that lists it. */
export function saveDetails(v: AmenityView, value: string): Receipt[] {
  const prev = v.details
  useStore.getState().sl3Base(detailsKey(v.name), value)
  if (!v.kind) return []
  const to = detailsSummary(v.kind, value) ?? 'Not set'
  const from = detailsSummary(v.kind, prev)
  if (from === to) return []
  return sendReceipts(v.where.map((ch) => ({ channel: ch, field: detailsKey(v.name), what: `${v.name} details`, section: 'Amenities', origin: 'Your edit', from, to, raw: value })))
}
