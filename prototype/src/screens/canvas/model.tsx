/* WS-CV · the Canvas model: resolved values per channel (Base → channel value → your edit), the live version,
 * what differs (edits), tips per field, and the Area component that wraps each part of a replica page.
 * Save = the commit (QA A08): a saved change is sent right away, so "Live now" is what the channel has: your saved
 * value, except for changes still waiting to be sent (e.g. a Knowledge Hub Base edit) or in review (a Booking.com
 * name). "Your edits" differ from "Live now" only there. Photos come from the photo library (data/photos.ts, QA B18).
 * Multi-property (QA B01/B02): the page content and prices are the active property's (data/property-listing.ts, in the
 * context as `content` / `price`); "as imported" photos are its own library; tips are the scenario property's only. */
import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react'
import { CvArea, type CvTone, type FieldState } from '../../ds'
import { FIELDS, tipsFor, type ListingChannel, type TipDef } from '../../data/sl3'
import { CV_AREAS, PHOTO_CAPTION, PHOTO_KEY, PHOTO_TIP_ORDER, cvArea, fieldState, type CvArea as CvAreaDef, type PhotoKey } from '../../data/v3-cv'
import { channelPhotos, importedPhotoLib, type PhotoLib } from '../../data/photos'
import { addedChannelAmenities, chAmenityLine, type AddedChAmenity, type CvContent, type PriceLine } from '../../data/property-listing'
import type { SL3State } from '../../store/store'
import type { CancelFacts } from './facts'

type Custom = Record<string, string | null> | undefined
const def = (key: string) => FIELDS.find((f) => f.key === key)

/** What the channels have now, as far as the Canvas cares: keys (`channel:field`) still waiting to be sent or in review. */
export interface LiveCtx { waiting: Set<string>; review: Set<string> }
export const NO_LIVE: LiveCtx = { waiting: new Set(), review: new Set() }
const notLive = (ctx: LiveCtx, ch: ListingChannel, key: string) => ctx.waiting.has(`${ch}:${key}`) || ctx.review.has(`${ch}:${key}`)

/** What guests saw before any edit (the imported listing). */
export function seedValue(ch: ListingChannel, key: string): string {
  const f = def(key)
  return f?.value?.[ch] ?? f?.base ?? ''
}
/** Your version: your edit for this channel › `null` = back to the Base › the channel's value › the Base. */
export function editValue(ch: ListingChannel, key: string, sl3: SL3State): string {
  const f = def(key)
  const c = (sl3.custom[ch] as Custom)?.[key]
  const base = sl3.base[key] ?? f?.base ?? ''
  if (typeof c === 'string') return c
  if (c === null) return base
  const st = f?.state[ch]
  return st === 'override' || st === 'only' || st === 'channel' ? f?.value?.[ch] ?? base : base
}
/** What guests see today: your saved value once it was sent; the imported one while it waits or is in review. */
export function liveValue(ch: ListingChannel, key: string, sl3: SL3State, ctx: LiveCtx): string {
  return notLive(ctx, ch, key) ? seedValue(ch, key) : editValue(ch, key, sl3)
}
/** The field's state now: a custom value makes it Custom; `null` puts an overridden field back on the Base. */
export function fieldStateNow(ch: ListingChannel, key: string, sl3: SL3State, lib?: PhotoLib): FieldState {
  if (key === 'photos') return lib ? ((lib.useBase?.[ch] ?? ch === 'direct') ? 'inherit' : 'override') : fieldState(ch, key)
  const st = fieldState(ch, key)
  const cv = (sl3.custom[ch] as Custom)?.[key]
  if (typeof cv === 'string') return st === 'only' || st === 'channel' || st === 'listing' ? st : 'override'
  if (cv === null) return st === 'override' ? 'inherit' : st
  return st
}
export function editPhotos(ch: ListingChannel, sl3: SL3State, lib: PhotoLib): PhotoKey[] {
  return channelPhotos(ch, lib, sl3).shown as PhotoKey[]
}
export function livePhotos(ch: ListingChannel, sl3: SL3State, lib: PhotoLib, ctx: LiveCtx): PhotoKey[] {
  return notLive(ctx, ch, 'photos') ? channelPhotos(ch, importedPhotoLib(), { tips: {}, custom: {} }).shown as PhotoKey[] : editPhotos(ch, sl3, lib)
}

/** This channel's own added amenities (data/property-listing.ts addedChannelAmenities) as the page shows them: the
 *  edit view reads the store + draft; the live side the store alone, minus any still waiting to be sent or in review -
 *  the same rule every field follows (liveValue). */
export function extrasNow(pid: string, ch: ListingChannel, sl3: SL3State, ctx: LiveCtx, live: boolean): AddedChAmenity[] {
  const all = addedChannelAmenities(pid, ch, sl3.custom[ch] as Custom)
  return live ? all.filter((a) => !notLive(ctx, ch, `amenity:${a.name}`)) : all
}
/** The page part a channel's amenities render in (Airbnb / Direct "amenities", Booking.com "facilities"). */
export const amenityAreaOf = (ch: ListingChannel) => cvArea(ch, ch === 'booking' ? 'facilities' : 'amenities')

export interface CvEdit { area: CvAreaDef; key: string; from: string; to: string }
/** Every part of this channel's page that differs from what's live now (not sent yet, or in review, including a
 *  local draft that hasn't even reached the store yet, one shared Save, not a commit per popover).
 *  `sl3`/`lib` are the edit view (the real store, with any local draft overlaid); `liveSl3`/`liveLib` (default: the
 *  same) are the real store alone, so "from" always reads the true live side even while editing a draft. */
export function editsFor(ch: ListingChannel, sl3: SL3State, lib: PhotoLib, ctx: LiveCtx, liveSl3: SL3State = sl3, liveLib: PhotoLib = lib, pid?: string): CvEdit[] {
  const out: CvEdit[] = []
  // a channel-only amenity added, removed or re-detailed (its sub-options) on this channel, one edit per amenity, on
  // the page part the amenities render in, so it counts, highlights and reverts ("Keep the live version") like a field
  const area = pid ? amenityAreaOf(ch) : undefined
  if (pid && area) {
    const now = new Map(extrasNow(pid, ch, liveSl3, ctx, true).map((a) => [a.name, chAmenityLine(ch, a)]))
    const next = new Map(extrasNow(pid, ch, sl3, ctx, false).map((a) => [a.name, chAmenityLine(ch, a)]))
    for (const name of new Set([...now.keys(), ...next.keys()])) {
      const from = now.get(name), to = next.get(name)
      if (from !== to) out.push({ area, key: `amenity:${name}`, from: from ?? 'Not shown', to: to ?? 'Removed' })
    }
  }
  for (const a of CV_AREAS[ch]) {
    if (!a.field) continue
    if (a.field === 'photos') {
      const now = livePhotos(ch, liveSl3, liveLib, ctx), next = editPhotos(ch, sl3, lib)
      if (now.join() !== next.join()) {
        const moved = next.slice(0, 5).find((k, i) => now[i] !== k) ?? next[0]
        out.push({ area: a, key: PHOTO_KEY, from: `${PHOTO_CAPTION[moved]} at ${now.indexOf(moved) + 1}`, to: `${PHOTO_CAPTION[moved]} at ${next.indexOf(moved) + 1}` })
      }
      continue
    }
    const from = liveValue(ch, a.field, liveSl3, ctx), to = editValue(ch, a.field, sl3)
    if (from !== to) out.push({ area: a, key: a.field, from, to })
  }
  return out
}

/* ---------- context shared by the replica pages ---------- */
export interface CvCtxValue {
  channel: ListingChannel
  pid: string
  live: boolean
  zoom: number
  /** The area open in the field panel (?select=). */
  selected: string | null
  /** The tip open in the Tips panel, while it still waits (its suggested value previews in place). */
  focusTip: TipDef | null
  /** The field of the tip open in the Tips panel, waiting or accepted: its part is outlined as the panel steps. */
  focusField: string | null
  sl3: SL3State
  lib: PhotoLib
  /** The property's page content (Neukölln's scripted one, or a plain one from its data) and this channel's prices. */
  content: CvContent
  price: PriceLine
  /** This channel's cancellation policy as Policies has it (facts.ts), and its maximum guests from Pricing. */
  cancel: CancelFacts
  maxGuests: number
  /** This channel's own added amenities as the page shows them now (live, or your edit), appended to the inherited
   *  list by each replica page in that page's own wording (chAmenityLine). */
  extras: AddedChAmenity[]
  /** Text for a field as the page should show it now (live, your edit, or the open tip's preview). */
  text: (key: string) => string
  photos: PhotoKey[]
  tipsByField: Record<string, TipDef[]>
  /** The marker colour of an area (CanvasView decides: tip › editable › read-only). */
  toneOf: (a: CvAreaDef) => CvTone
  /** Opens (or, for the open one, closes) the area's field panel. */
  select: (id: string | null) => void
  /** Opens the field panel of the area a tip belongs to (Airbnb's "Show more" tip dot). */
  openTip: (id: string) => void
  /** "Show only editable sections": every part the host can't change here is left out of the page,
   *  and so is the page's own chrome around it (buttons, dates, captions), the columns and the order stay. */
  editableOnly: boolean
  /** Can the host change this part here (a field, the photo order, a price line)? Read by Area and the pages. */
  editable: (id: string) => boolean
}
const Ctx = createContext<CvCtxValue | null>(null)
export const CvProvider = ({ value, children }: { value: CvCtxValue; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>
export function useCv() { const c = useContext(Ctx); if (!c) throw new Error('useCv outside CvProvider'); return c }

/** `sl3`/`lib`: the edit view (store + any local unsaved draft overlaid), what "Your edits" and the popovers read.
 *  `liveSl3`/`liveLib` (default: the same): the real store alone, for what "Live now" and the edit-diff's "from"
 *  side show, so a local draft never leaks into either before it's actually sent (one shared Save). */
export function useCvModel(ch: ListingChannel, sl3: SL3State, live: boolean, focusId: string | null, on: boolean, lib: PhotoLib, ctx: LiveCtx, liveSl3: SL3State = sl3, liveLib: PhotoLib = lib, pid?: string) {
  return useMemo(() => {
    const tips = on ? tipsFor(ch).filter((t) => !sl3.tips[t.id]) : []
    const tipsByField: Record<string, TipDef[]> = {}
    tips.forEach((t) => { (tipsByField[t.field] ??= []).push(t) })
    const focusTip = tips.find((t) => t.id === focusId) ?? null
    const focusField = focusId ? tipsFor(ch).find((t) => t.id === focusId)?.field ?? null : null
    const allEdits = editsFor(ch, sl3, lib, ctx, liveSl3, liveLib, pid)
    const edits = live ? [] : allEdits
    const edited = new Set(edits.map((e) => e.area.id))
    const text = (key: string) => {
      if (live) return liveValue(ch, key, liveSl3, ctx)
      if (focusTip && focusTip.field === key && focusTip.to) return focusTip.to
      return editValue(ch, key, sl3)
    }
    const photos = live ? livePhotos(ch, liveSl3, liveLib, ctx) : focusTip && PHOTO_TIP_ORDER[focusTip.id] ? PHOTO_TIP_ORDER[focusTip.id] : editPhotos(ch, sl3, lib)
    const extras = pid ? (live ? extrasNow(pid, ch, liveSl3, ctx, true) : extrasNow(pid, ch, sl3, ctx, false)) : []
    return { tipsByField, focusTip, focusField, edits, edited, text, photos, allEdits, extras }
  }, [ch, sl3, live, focusId, on, lib, ctx, liveSl3, liveLib, pid])
}

/** Wraps one part of a replica page: an outline and a marker in its tone, and a tap opens its panel. Nothing on the
 *  page itself is ever swapped for an input: the page stays exactly as guests see it. */
export function Area({ id, children, inline, className, style }: { id: string; children: ReactNode; inline?: boolean; className?: string; style?: CSSProperties }) {
  const c = useCv()
  const a = cvArea(c.channel, id)
  if (!a) return <>{children}</>
  if (c.editableOnly && !c.editable(id)) return null
  const tone = c.toneOf(a)
  const tips = a.field && tone === 'tip' ? c.tipsByField[a.field]?.length ?? 0 : 0
  const focus = !!a.field && c.focusField === a.field
  const preview = focus && !!c.focusTip && c.focusTip.field === a.field && (!!c.focusTip.to || !!c.focusTip.photos)
  const label = tone === 'tip' ? `${a.name} · ${tips} tip${tips === 1 ? '' : 's'}` : tone === 'refine' ? `${a.name} · edit` : `${a.name} · read-only`
  return (
    <CvArea
      id={id} tone={tone} label={label} inline={inline} className={className} style={style}
      selected={c.selected === id} focus={focus} preview={preview} tips={tips}
      onSelect={() => c.select(c.selected === id ? null : id)}
      unzoom={1 / c.zoom} disabled={c.live}
    >{children}</CvArea>
  )
}
