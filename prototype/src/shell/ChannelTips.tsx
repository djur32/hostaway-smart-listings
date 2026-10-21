/* The Tips panel for a channel (shared by Classic and Canvas, V3-SPEC §1 "Tips"). One tip at a time, x of n,
 * Accept / Dismiss, Also save to the Knowledge Hub, Generate alternatives (5 more each time), Accepted → Undo / Next.
 * Accept is the commit for that one change: it goes to the channel right away with a receipt (Save = commit, QA A08);
 * Undo withdraws it.
 * Controlled focus: `focusId` (e.g. from a TipDot on a field) opens that tip. */
import { useEffect, useState } from 'react'
import { Button, Diff, Icon, TipCard, TipsPanel } from '../ds'
import { tipsFor, type ListingChannel, type TipDef } from '../data/sl3'
import { useStore } from '../store/store'
import { CHANNELS } from '../data/channels'
import { commitAndSend, commitPhotosAndSend, unsend } from '../screens/push/changes'
import { PHOTO_CAPTION, PHOTO_ORDER, photoUrl, type PhotoKey } from '../data/v3-cv'
import { importedPhotoLib, roomTag, type PhotoLib } from '../data/photos'
import { fieldByKey } from '../data/v3-ch'
import { viewOf } from '../screens/channel/common'
import { SHARED_TIP_NOTE } from '../screens/channel/screenTips'

/* ---------- photo tips: real photos from the active property's library ----------
 * A photo tip names its photos by label, in one of two shapes (data/sl3.ts TipDef.photos, read the same way by Review
 * & push): "living room" = that photo as the cover; "desk #3" = that photo moved to position 3. Each label resolves to
 * a key in the active property's library — the tip's own nowKey/nextKey first, else by key, caption or room tag — so
 * every property's tips show its own photos (the old fixed map knew four Neukölln labels and fell back to one image). */
const parseLabel = (s: string) => { const m = s.match(/^(.*?)\s*#(\d+)$/); return m ? { what: m[1], pos: Number(m[2]) } : { what: s, pos: 0 } }
const captionOf = (k: string, lib: PhotoLib) => lib.meta[k]?.description || PHOTO_CAPTION[k as PhotoKey] || k
function resolvePhoto(what: string, lib: PhotoLib, key?: string): string {
  if (key) return key
  const w = what.toLowerCase()
  const ks = lib.base
  return ks.find((k) => k === w) ?? ks.find((k) => captionOf(k, lib).toLowerCase() === w)
    ?? ks.find((k) => roomTag(lib.meta[k]?.tag)?.label.toLowerCase() === w)
    ?? ks.find((k) => captionOf(k, lib).toLowerCase().startsWith(w)) ?? ks[0] ?? 'living1'
}
/** The channel's order as imported (what a tip's "now" describes), hidden photos left out. */
const importedOrder = (ch: ListingChannel) => { const hid = importedPhotoLib().hidden[ch] ?? []; return PHOTO_ORDER[ch].filter((k) => !hid.includes(k)) }

function PhotoMain({ t, channel }: { t: TipDef; channel: ListingChannel }) {
  const lib = useStore((s) => s.photoLib)
  const ph = t.photos!
  const now = parseLabel(ph.now)
  const next = parseLabel(ph.next)
  const moved = resolvePhoto(next.what, lib, ph.nextKey)
  // a move ("desk #9" → "desk #3"): show the photo that holds that position today next to the one the tip puts there,
  // rather than the same photo twice; a new cover: today's cover next to the suggested one
  const left = next.pos ? importedOrder(channel)[next.pos - 1] ?? resolvePhoto(now.what, lib, ph.nowKey) : resolvePhoto(now.what, lib, ph.nowKey)
  const where = next.pos ? ` at #${next.pos}` : ' as cover'
  return (
    <div className="h-tip__photos">
      <figure><img src={photoUrl(left)} alt={captionOf(left, lib)} />Now: {captionOf(left, lib)}{where}{next.pos && now.pos ? ` (${captionOf(moved, lib).toLowerCase()} is #${now.pos})` : ''}</figure>
      <Icon name="arrow-right" />
      <figure><img src={photoUrl(moved)} alt={captionOf(moved, lib)} /><b style={{ color: 'var(--color-success-700)' }}>Suggested: {captionOf(moved, lib)}{where}</b></figure>
    </div>
  )
}

function Main({ t, picked, channel }: { t: TipDef; picked?: string; channel: ListingChannel }) {
  if (t.photos) return <PhotoMain t={t} channel={channel} />
  // an amenity tip (field "amenity:<name>") writes "on" for this channel; it reads as the amenity being added
  if (t.field.startsWith('amenity:')) return <Diff from={t.from} to={`${t.field.slice(8)} · listed on ${CHANNELS[channel].name}`} />
  return <TextMain t={t} picked={picked} channel={channel} />
}

/** A text tip. On a field that uses the Base, accepting writes this channel's own value, so the card says so
 *  and shows the channel's text — not a struck-through Base (review, 3 Oct: "sometimes the tip is just replacing the
 *  text with a customized one"). Diff itself decides between a before/after pair, one text with the changes marked, or
 *  just the new text. */
function TextMain({ t, picked, channel }: { t: TipDef; picked?: string; channel: ListingChannel }) {
  const custom = useStore((s) => s.sl3.custom[channel])
  const base = useStore((s) => s.sl3.base)
  const def = fieldByKey(t.field)
  const state = def ? viewOf(def, channel, custom, base).state : undefined
  const name = CHANNELS[channel].name
  // Uses the Base: accepting gives this channel its own value. Listing-wide: there is no per-channel value to give, so
  // accepting changes every channel (D-948) — the card says so instead of implying an Airbnb-only change.
  const note = state === 'inherit' ? <>Creates {name}’s own value. The Base stays as it is.</> : state === 'listing' ? <>{SHARED_TIP_NOTE}</> : undefined
  return <Diff from={t.from} to={picked ?? t.to ?? ''} note={note} />
}

export function useChannelTips(channel: ListingChannel) {
  const tips = tipsFor(channel) // the active property's tips: the scenario's scripted ones, another property's generated ones (data/property-listing.ts), or [] for the three "off" properties — the panel shows its empty state then
  const st = useStore((s) => s.sl3.tips)
  const open = tips.filter((t) => st[t.id] !== 'dismissed')
  return { all: tips, open, pending: open.filter((t) => st[t.id] !== 'accepted') }
}

export function ChannelTips({ channel, focusId, onFocus, onClose }: { channel: ListingChannel; focusId?: string | null; onFocus?: (id: string, field: string) => void; onClose: () => void }) {
  const { open } = useChannelTips(channel)
  const s = useStore((x) => x.sl3)
  const act = { tip: useStore((x) => x.sl3Tip), kb: useStore((x) => x.sl3Kb), more: useStore((x) => x.sl3MoreAlts), custom: useStore((x) => x.sl3Custom) }
  const [i, setI] = useState(() => Math.max(0, open.findIndex((t) => t.id === focusId)))
  const [pick, setPick] = useState<Record<string, number>>({})
  useEffect(() => { if (focusId) { const k = open.findIndex((t) => t.id === focusId); if (k >= 0) setI(k) } }, [focusId]) // eslint-disable-line react-hooks/exhaustive-deps
  const idx = Math.min(i, Math.max(open.length - 1, 0))
  const t = open[idx]
  useEffect(() => { if (t) onFocus?.(t.id, t.field) }, [t?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!t) return (
    <TipsPanel onClose={onClose} empty={<><Icon name="circle-check" /><b>No tips right now</b><span className="h-small h-muted">Your listing follows your strategy. New tips appear when the market, your inbox or your reviews change.</span><Button icon="sparkles" kind="ai">Generate tips</Button></>} />
  )
  const shown = s.altsShown[t.id] ?? 0
  const alts = (t.alts ?? []).slice(0, shown)
  const picked = pick[t.id] !== undefined ? alts[pick[t.id]] : undefined
  return (
    <TipsPanel onClose={onClose}>
      <TipCard
        type={t.type} section={t.section} idx={idx + 1} total={open.length}
        onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(open.length - 1, idx + 1))}
        title={t.title} main={<Main t={t} picked={picked} channel={channel} />} why={t.why}
        accepted={s.tips[t.id] === 'accepted'} money={t.money}
        limit={t.field === 'name' ? CHANNELS[channel].titleLimit ?? undefined : undefined}
        alts={alts} picked={pick[t.id]} onPick={(k) => setPick({ ...pick, [t.id]: k })}
        onGenerate={t.alts ? () => act.more(t.id) : undefined}
        onAccept={() => {
          // a kb-grounded tip (TipDef.kb) saves to the Knowledge Hub automatically on Accept (review, 1 Oct: no
          // separate "Also save to the Knowledge Hub" checkbox to remember to tick)
          const apply = () => { act.tip(t.id, 'accepted'); if (t.kb) act.kb(t.id, true); if (t.to || picked) act.custom(channel, t.field, picked ?? t.to ?? '') }
          if (t.photos) commitPhotosAndSend(apply, [channel], `Tip · ${t.title}`)
          else commitAndSend(apply, [channel], [t.field], `Tip · ${t.title}`)
        }}
        onDismiss={() => act.tip(t.id, 'dismissed')}
        onUndo={() => { act.tip(t.id, null); act.custom(channel, t.field, undefined); unsend(channel, t.field) }}
      />
    </TipsPanel>
  )
}
