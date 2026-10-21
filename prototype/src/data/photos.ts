/* Photos · Hostaway's "All photos" model, made per channel (replica of the real Photos row, All photos page,
 * Re-order mode and Edit photo modal; screenshots 3, 8, 9, 10, 11).
 * One library (the Base order) + per channel: which photos show, the order, the cover (= first shown photo),
 * a caption per platform, and one standardised "Room or area" tag that each channel uses its own way.
 * Values are ; channel rules are (research/market/channel-constraints.md: Booking.com shows no
 * captions and tags photos from its own list; Airbnb's photo tour groups by room; Direct groups by page section). */
import type { ListingChannel } from './sl3'
import { tipsFor } from './sl3'
import { PHOTO_CAPTION, PHOTO_KEY, PHOTO_ORDER, PHOTO_TIP_ORDER, type PhotoKey } from './v3-cv'
import { propertyChannels } from './portfolio'
import { PROPERTY_ID } from './scenario'
// property-seeds imports this module too; only its functions are used here (never at load), so the cycle is safe.
import { appliedProperty, seedPhotoLibFor } from './property-seeds'

/** Every channel a photo can show on. Screens list only the active property's: `photoChannels()`. */
export const PHOTO_CHANNELS: ListingChannel[] = ['airbnb', 'booking', 'direct']
/** Multi-property (QA B01/B02): the property the shared listing definitions describe (store.activeProperty). */
const activePid = () => appliedProperty() ?? PROPERTY_ID
/** The active property's photo channels (its connected listing channels, airbnb → booking → direct). */
export const photoChannels = (): ListingChannel[] => propertyChannels(activePid())
/** Names as the real Edit photo modal writes them ("Direct bookings", not "Direct"). */
export const PHOTO_CH_NAME: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct bookings' }
/** Channels that show a caption under a photo. Booking.com doesn't (channel-constraints.md). */
export const CAPTION_CHANNELS: ListingChannel[] = ['airbnb', 'direct']
export const NO_CAPTION_REASON = 'Booking.com doesn’t show photo captions. It uses the room tag below instead.'

/* ---------- the standardised room tag (replaces Direct's "Direct section tag") ---------- */
export type RoomTag = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'workspace' | 'balcony' | 'building' | 'neighbourhood' | 'other'
/** One tag, three uses: Airbnb's photo-tour room, Booking.com's photo tag, the Direct site's page section.
 * Direct sections are the real ones (screenshot 11). Airbnb/Booking.com names are (close to their public lists). */
export const ROOM_TAGS: Array<{ id: RoomTag; label: string; airbnb: string; booking: string; direct: string }> = [
  { id: 'living', label: 'Living room', airbnb: 'Living room', booking: 'Living room', direct: 'Our Property' },
  { id: 'bedroom', label: 'Bedroom', airbnb: 'Bedroom 1', booking: 'Bedroom', direct: 'Our Property' },
  { id: 'kitchen', label: 'Kitchen', airbnb: 'Full kitchen', booking: 'Kitchen or kitchenette', direct: 'What it Offers' },
  { id: 'bathroom', label: 'Bathroom', airbnb: 'Full bathroom', booking: 'Bathroom', direct: 'What it Offers' },
  { id: 'workspace', label: 'Workspace', airbnb: 'Workspace', booking: 'Seating area', direct: 'What it Offers' },
  { id: 'balcony', label: 'Balcony', airbnb: 'Patio or balcony', booking: 'Balcony/Terrace', direct: 'Our Property' },
  { id: 'building', label: 'Building & street', airbnb: 'Exterior', booking: 'Property building', direct: 'Overview' },
  { id: 'neighbourhood', label: 'Neighbourhood', airbnb: 'Additional photos', booking: 'Neighbourhood', direct: 'Neighborhood' },
  { id: 'other', label: 'Other', airbnb: 'Additional photos', booking: 'No tag', direct: 'Good to Know' },
]
export const roomTag = (id: RoomTag | null | undefined) => ROOM_TAGS.find((t) => t.id === id)
/** What each channel does with the tag (the hint under the select). */
export const TAG_USE: Record<ListingChannel, string> = { airbnb: 'Photo tour room', booking: 'Photo tag', direct: 'Page section' }

/* ---------- state ---------- */
export interface PhotoMeta {
  description: string
  /** Per-platform captions ("Edit per platform"). Absent = every platform uses `description`. */
  perChannel?: Partial<Record<ListingChannel, string>>
  tag: RoomTag | null
}
export interface PhotoLib {
  /** The Base order (All photos tab). Deleted photos are removed from it. */
  base: string[]
  meta: Record<string, PhotoMeta>
  /** Photos hidden from a channel (unticked in "What channels should this photo display on?"). */
  hidden: Record<ListingChannel, string[]>
  /** A channel's own order (shown + hidden). Absent = the channel follows the Base order (or its imported order). */
  order: Partial<Record<ListingChannel, string[]>>
  deleted: string[]
  /** The visible order last mirrored into sl3.custom[ch]['photos.order'] (what Canvas reads). */
  mirror: Partial<Record<ListingChannel, string>>
  /** "Use the Base" per channel: the channel shows the Base set in the Base order. Its own order and hidden photos are
   *  kept, so "Customize" brings them back. */
  useBase?: Partial<Record<ListingChannel, boolean>>
}

const SEED_TAG: Record<PhotoKey, RoomTag> = {
  living1: 'living', living2: 'living', bedroom: 'bedroom', desk: 'workspace', kitchen: 'kitchen', bathroom: 'bathroom',
  balcony: 'balcony', building: 'building', street: 'neighbourhood', extra1: 'living', extra2: 'other',
}
/* Neukölln's imported order and captions, captured at load: data/property-seeds.ts repoints PHOTO_ORDER / PHOTO_CAPTION
 * at the active property later, and the scenario library must not pick that up (e.g. a Reset while on another property). */
const NK_ORDER = [...PHOTO_ORDER.direct]
const NK_CAPTION = { ...PHOTO_CAPTION }
/** The scenario property's (Neukölln) library. the Base order is the Direct site's; Booking.com never got the
 *  paintings close-up or the hallway. Other properties: data/property-seeds.ts seedPhotoLibFor(pid). */
export function seedPhotoLib(): PhotoLib {
  const base = [...NK_ORDER]
  const meta: Record<string, PhotoMeta> = {}
  for (const k of base) meta[k] = { description: NK_CAPTION[k as PhotoKey], tag: SEED_TAG[k as PhotoKey] }
  return { base, meta, hidden: { airbnb: [], booking: ['extra1', 'extra2'], direct: [] }, order: {}, deleted: [], mirror: {} }
}
const importedCache = new Map<string, PhotoLib>()
/** The active property's library as imported: the baseline every "what changed" diff compares with. */
export function importedPhotoLib(): PhotoLib {
  const pid = activePid()
  if (!importedCache.has(pid)) importedCache.set(pid, seedPhotoLibFor(pid))
  return importedCache.get(pid)!
}

/** The slice of sl3 this model reads and writes (kept structural to avoid a store ↔ data import cycle). */
export interface PhotoSl3 {
  tips: Record<string, 'accepted' | 'dismissed'>
  custom: Partial<Record<ListingChannel, Record<string, string | null>>>
}

const acceptedTipOrder = (ch: ListingChannel, sl3: PhotoSl3) => {
  const t = tipsFor(ch).find((x) => x.field === 'photos' && sl3.tips[x.id] === 'accepted')
  return t ? PHOTO_TIP_ORDER[t.id] : undefined
}
/** Where a channel's order comes from, in priority: your order here › an order set in Canvas › an accepted photo tip ›
 * the imported order (Airbnb, Booking.com) or the Base (Direct). */
function sourceOrder(ch: ListingChannel, lib: PhotoLib, sl3: PhotoSl3): string[] {
  if (lib.order[ch]) return lib.order[ch]!
  const saved = sl3.custom[ch]?.[PHOTO_KEY]
  if (typeof saved === 'string' && saved && saved !== lib.mirror[ch]) return saved.split(',')
  return acceptedTipOrder(ch, sl3) ?? (ch === 'direct' ? lib.base : PHOTO_ORDER[ch])
}
/** A channel's photos: shown (cover first) and hidden (kept, so the host can bring them back). */
export function channelPhotos(ch: ListingChannel, lib: PhotoLib, sl3: PhotoSl3): { shown: string[]; hidden: string[] } {
  if (lib.useBase?.[ch]) return { shown: [...lib.base], hidden: [] }
  const alive = new Set(lib.base)
  const src = sourceOrder(ch, lib, sl3)
  const seq = [...new Set([...src.filter((k) => alive.has(k)), ...lib.base])]
  const off = new Set(lib.hidden[ch])
  return { shown: seq.filter((k) => !off.has(k)), hidden: seq.filter((k) => off.has(k)) }
}
/** Channels where this photo is the cover (the first shown photo). */
export function coverChannels(key: string, lib: PhotoLib, sl3: PhotoSl3): ListingChannel[] {
  return photoChannels().filter((ch) => channelPhotos(ch, lib, sl3).shown[0] === key)
}
/** The caption a channel shows ('' for Booking.com: no captions there). */
export function captionFor(key: string, ch: ListingChannel, lib: PhotoLib): string {
  if (!CAPTION_CHANNELS.includes(ch)) return ''
  const m = lib.meta[key]
  return m?.perChannel?.[ch] ?? m?.description ?? ''
}

/* ---------- the change, as the rest of the prototype sees it ----------
 * Diffs compare with the active property's imported library (importedPhotoLib), never Neukölln's. */
/** One line for Review & push (sl3.custom[ch].photos), or undefined when the channel is as imported. */
export function photoSummary(ch: ListingChannel, lib: PhotoLib, sl3: PhotoSl3): string | undefined {
  const SEED = importedPhotoLib()
  const cap = (k: string) => SEED.meta[k]?.description ?? k
  const before = channelPhotos(ch, SEED, { tips: sl3.tips, custom: {} })
  const now = channelPhotos(ch, lib, sl3)
  const parts: string[] = []
  if (now.shown[0] !== before.shown[0] && now.shown[0]) parts.push(`Cover: ${lib.meta[now.shown[0]]?.description ?? cap(now.shown[0])}`)
  const gone = lib.deleted.filter((k) => before.shown.includes(k) || before.hidden.includes(k))
  const hid = now.hidden.filter((k) => !before.hidden.includes(k))
  const back = now.shown.filter((k) => before.hidden.includes(k))
  if (hid.length) parts.push(`${hid.length === 1 ? cap(hid[0]) : `${hid.length} photos`} hidden`)
  if (back.length) parts.push(`${back.length === 1 ? cap(back[0]) : `${back.length} photos`} added`)
  if (gone.length) parts.push(`${gone.length} deleted`)
  const both = (a: string[]) => a.filter((k) => k !== now.shown[0] && before.shown.includes(k) && now.shown.includes(k))
  if (both(before.shown).join() !== both(now.shown).join()) parts.push('New order')
  const caps = now.shown.filter((k) => captionFor(k, ch, lib) !== captionFor(k, ch, SEED)).length
  if (caps) parts.push(`${caps} caption${caps > 1 ? 's' : ''}`)
  const tags = lib.base.filter((k) => (lib.meta[k]?.tag ?? null) !== (SEED.meta[k]?.tag ?? null)).length
  if (tags) parts.push(`${tags} room tag${tags > 1 ? 's' : ''}`)
  return parts.length ? parts.join(' · ') : undefined
}

/** Writes the model into sl3.custom: the visible order Canvas reads (`photos.order`) and the Review line (`photos`). */
export function syncPhotos(lib: PhotoLib, sl3: PhotoSl3): { lib: PhotoLib; custom: PhotoSl3['custom'] } {
  const custom = { ...sl3.custom }
  const mirror = { ...lib.mirror }
  const SEED = importedPhotoLib()
  for (const ch of photoChannels()) {
    const next = { ...(custom[ch] ?? {}) }
    const shown = channelPhotos(ch, lib, sl3).shown.join(',')
    const asImported = channelPhotos(ch, SEED, { tips: sl3.tips, custom: {} }).shown.join(',')
    const saved = next[PHOTO_KEY]
    const external = typeof saved === 'string' && saved !== lib.mirror[ch] // set in Canvas: leave it alone
    if (!external) {
      if (shown !== asImported) { next[PHOTO_KEY] = shown; mirror[ch] = shown }
      else { delete next[PHOTO_KEY]; delete mirror[ch] }
    }
    const summary = photoSummary(ch, lib, sl3)
    if (summary) next.photos = summary
    else if (typeof next.photos === 'string') delete next.photos // back to as imported: nothing to review
    custom[ch] = next
  }
  return { lib: { ...lib, mirror }, custom }
}

/* ---------- edits (pure; the store commits them through syncPhotos) ---------- */
export interface PhotoEdit {
  /** "What channels should this photo display on?" The property's channels only (others are left as they are). */
  show: Partial<Record<ListingChannel, boolean>>
  description: string
  perChannel?: Partial<Record<ListingChannel, string>>
  tag: RoomTag | null
}
const without = (a: string[], keys: string[]) => a.filter((k) => !keys.includes(k))

/** Re-order: the Base order (All photos) or one channel's order (its shown photos; hidden ones keep their place at the end). */
export function reorderLib(lib: PhotoLib, sl3: PhotoSl3, scope: ListingChannel | 'base', keys: string[]): PhotoLib {
  if (scope === 'base') return { ...lib, base: [...keys, ...without(lib.base, keys)] }
  const { hidden } = channelPhotos(scope, lib, sl3)
  return { ...lib, order: { ...lib.order, [scope]: [...keys, ...without(hidden, keys)] } }
}
/** Cover comes purely from order (the first shown photo), never from this edit — so a plain field update never moves
 * a photo's position; re-order it instead (ReorderGrid, Photos.tsx) to change a channel's cover. */
export function editLib(lib: PhotoLib, _sl3: PhotoSl3, key: string, e: PhotoEdit): PhotoLib {
  const perChannel = e.perChannel && Object.keys(e.perChannel).length ? e.perChannel : undefined
  return {
    ...lib,
    meta: { ...lib.meta, [key]: { description: e.description, perChannel, tag: e.tag } },
    // only the property's channels change; an unconnected channel keeps what it had
    hidden: Object.fromEntries(PHOTO_CHANNELS.map((ch) => [ch, e.show[ch] === undefined ? lib.hidden[ch] : e.show[ch] ? without(lib.hidden[ch], [key]) : [...without(lib.hidden[ch], [key]), key]])) as PhotoLib['hidden'],
  }
}
export function hideLib(lib: PhotoLib, keys: string[], ch: ListingChannel, hide: boolean): PhotoLib {
  return { ...lib, hidden: { ...lib.hidden, [ch]: hide ? [...without(lib.hidden[ch], keys), ...keys] : without(lib.hidden[ch], keys) } }
}
/** Delete removes the photo from the library and every channel. */
export function deleteLib(lib: PhotoLib, keys: string[]): PhotoLib {
  const order: PhotoLib['order'] = {}
  for (const ch of PHOTO_CHANNELS) if (lib.order[ch]) order[ch] = without(lib.order[ch]!, keys)
  return {
    ...lib, base: without(lib.base, keys), deleted: [...lib.deleted, ...keys], order,
    hidden: Object.fromEntries(PHOTO_CHANNELS.map((ch) => [ch, without(lib.hidden[ch], keys)])) as PhotoLib['hidden'],
  }
}
