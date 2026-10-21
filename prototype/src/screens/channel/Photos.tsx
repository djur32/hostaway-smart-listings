/* Photos · Hospitable's real photo management (REAL·PRODUCT screenshots 3, 8, 9, 10, 11), made per channel.
 * - ChannelPhotosRow: Essentials › Photos in the listing editor (this channel's photos, its order, cover first).
 * - PhotosPage (/property/:id/photos?channel=airbnb&back=airbnb): All photos, channel filter, select + bulk bar,
 *   demo URL states ?edit=<photo key> (Edit photo open) and ?reorder=1 (Re-order mode);
 *   drag a tile to re-order it right in the grid (ds/sortable.tsx, Hospitable's drag-to-reorder pattern, 3 Oct);
 *   Re-order mode (drag by the grip, or arrow keys on it), Edit photo modal.
 * State: store.photoLib (data/photos.ts). Every change is mirrored into sl3.custom, so Canvas shows the new order.
 * Like every other field (ds/unsaved.tsx), every action here drafts locally first — reordering, Hide/Show, Delete,
 * Edit photo and Use the Base/Customize all stage a change and wait for the shared Discard/Save bar, never sending on
 * their own (Antonio, 1 Oct: "if you make a change... you should open the unsaved changes dialog to make sure you do
 * that"). Save is the commit (QA A08): it sends every staged change to the channels it touches at once, with a
 * receipt (screens/push/changes.ts) and "Saved · sent to …". Discard reverts the draft to what's committed.
 * "Add" opens a small "Add photos" sheet (uploading isn't part of the prototype; QA A09).
 * Values SIMULATED; channel rules REAL·PUBLIC (research/market/channel-constraints.md).
 * Multi-property (QA B01/B02): the library is the active property's (store.photoLib) and every channel list here is its
 * connected channels only (useListingChannels). */
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BackLink, BottomSheet, Button, ChannelChip, CloseButton, CoverPill, Locked, Segmented, DragGhost, HiddenPill, Icon, Mark, MobileActionBar, OvDialog, PageHead, PhotoTile, PhotosFilter, PhotosRow, SheetModal, Split, TipDot, UnsavedBar, cx,
  useIsMobile, useSortable, useUnsavedChanges,
} from '../../ds'
import { PHOTOS_OPEN_PARAM, usePhotosNav } from './photosNav'
import { isListingChannel, type ListingChannel } from '../../data/sl3'
import { photoUrl } from '../../data/v3-cv'
import {
  PHOTO_CH_NAME, ROOM_TAGS, TAG_USE, channelPhotos, coverChannels, deleteLib, editLib, hideLib, reorderLib, roomTag,
  type PhotoEdit, type PhotoLib, type PhotoSl3, type RoomTag,
} from '../../data/photos'
import { useStore } from '../../store/store'
import { useListingChannels } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { ValueHover } from '../../ds/fieldscope'
import { commitPhotosAndSend, savedLabel } from '../push/changes'

type Scope = ListingChannel | 'all'

/** The photo library + the sl3 slice it reads (stable selectors, Zustand v5). */
export function usePhotoLib(): { lib: PhotoLib; sl3: PhotoSl3 } {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const sl3 = useMemo(() => ({ tips, custom }), [tips, custom])
  return { lib, sl3 }
}
const alt = (lib: PhotoLib, k: string) => lib.meta[k]?.description || 'Photo'

/* ---------------- Essentials › Photos (listing editor, one channel) ---------------- */
/** This row's only edit is Use the Base / Customize for {channel}; drafted exactly like CanvasView's CvDraft
 *  (screens/canvas/CanvasView.tsx) — a small local overlay on top of the committed lib, registered with the shared
 *  Discard/Save bar (ds/unsaved.tsx). `pending.c !== c` (switching channel/tab without saving) resets it, the same
 *  "stale draft" guard useSectionDraft uses (screens/channel/common.tsx). */
export function ChannelPhotosRow({ c, tips, activeTip, onTip, focus, readOnly }: { c: ListingChannel; tips?: string[]; activeTip?: string | null; onTip?: (id: string) => void; focus?: boolean; readOnly?: boolean }) {
  const p = useProperty()
  const { lib, sl3 } = usePhotoLib()
  // "Manage photos" (screens/channel/photosNav.tsx, Antonio 3 Oct): every channel opens its own photos in place —
  // Pattern A, the full-screen takeover, by default; B (drawer) / C (tab) only via ?photosNav=drawer|tab.
  const nav = usePhotosNav()
  const [params] = useSearchParams()
  // carries every other param forward (?photosNav included), so arriving via "Manage photos" keeps the pattern
  const keep = params.toString() ? `?${params}` : ''
  const openParams = new URLSearchParams(params); openParams.set(PHOTOS_OPEN_PARAM, '1')
  // the href still lands in the same place (open in a new tab / middle-click): this channel's Essentials with the
  // overlay open — never the cross-channel /photos library, which this channel's link no longer leads to
  const manageTo = nav.pattern === 'tab' ? `/property/${p.id}/ch/${c}/listing/photos${keep}` : `/property/${p.id}/ch/${c}/listing/essentials?${openParams}`
  const onManage = nav.pattern !== 'tab' ? (e: MouseEvent) => { e.preventDefault(); nav.openPhotos() } : undefined
  const useBase = useStore((s) => s.photoUseBase)
  // Uses the Base = the Base set in the Base order; Custom = this channel's own set/order. Switching keeps both (Antonio 30 Sep).
  const committedIsBase = lib.useBase?.[c] ?? c === 'direct'
  const [raw, setRaw] = useState<{ c: ListingChannel; isBase?: boolean }>(() => ({ c }))
  const pending = raw.c === c ? raw : { c }
  const isBase = pending.isBase ?? committedIsBase
  const dirty = pending.isBase !== undefined
  const draftLib = useMemo(() => (pending.isBase === undefined ? lib : { ...lib, useBase: { ...lib.useBase, [c]: pending.isBase } }), [lib, pending.isBase, c])
  const { shown } = channelPhotos(c, draftLib, sl3)
  const own = channelPhotos(c, { ...draftLib, useBase: { ...draftLib.useBase, [c]: false } }, sl3).shown
  const line = (ks: string[]) => `${ks.length} photos · cover: ${alt(lib, ks[0] ?? '')}`
  const name = PHOTO_CH_NAME[c] === 'Direct bookings' ? 'Direct' : PHOTO_CH_NAME[c]
  const setUseBase = (v: boolean) => setRaw({ c, isBase: v === committedIsBase ? undefined : v })
  useUnsavedChanges({
    dirty,
    onDiscard: () => setRaw({ c }),
    onSave: () => { commitPhotosAndSend(() => useBase(c, pending.isBase!), [c]); setRaw({ c }) },
    label: 'Photos',
  })
  return (
    <div className={cx('h-field-row', 'h-field-row--stacked', focus && 'is-tip-focus')}>
      {/* PhotosRow + the hint share one control wrapper (Antonio 1 Oct: the caption should sit as close to the photos
         as a normal field's caption sits under its input) — nested here, not a sibling flex item of the row above, so
         the gap down to it is just --field-hint-gap, not that plus h-field-row--stacked's own flex gap on top. */}
      <div className="h-field-row__control">
        <PhotosRow
          label={<>Photos{tips?.length ? <TipDot count={tips.length} active={!!activeTip && tips.includes(activeTip)} onClick={() => onTip?.(tips[0])} /> : null}</>}
          count={shown.length}
          manageTo={manageTo}
          onManage={onManage}
          photos={shown.map((k) => ({ key: k, src: photoUrl(k), alt: alt(lib, k) }))}
        />
        <div className="h-field-hint">
          <span className="h-field-hint__channels">
            <ValueHover title="Photos" values={[{ who: 'base', value: line(lib.base), used: isBase }, { who: c, value: line(own), used: !isBase }]}>
              <Icon name="info-circle" />{isBase ? 'Uses the Base' : `Custom for ${name}`}
            </ValueHover>
          </span>
          {!readOnly && <button type="button" className="h-field-hint__action" onClick={() => setUseBase(!isBase)}>{isBase ? `Customize for ${name}` : 'Use the Base'}</button>}
        </div>
      </div>
    </div>
  )
}

/* ---------- the page's draft: every pending action, replayed in order (CvDraft's approach, CanvasView.tsx) ----------
 * A flat, chronological queue rather than one slot per field: each entry is exactly the store action it will become
 * on Save (photoReorder/photoHide/photoDelete/photoEdit), so folding them with the same pure builders the store
 * itself uses (reorderLib/hideLib/deleteLib/editLib, data/photos.ts) previews the library precisely as sequential
 * immediate commits would have — e.g. a reorder that includes a photo deleted afterwards is already corrected,
 * because deleteLib strips a deleted key from base/order the same way it would mid-session. Save replays the queue
 * through the real store actions inside one commitPhotosAndSend, so every channel it touched gets one receipt. */
type PhotoOp =
  | { kind: 'reorder'; scope: ListingChannel | 'base'; keys: string[] }
  | { kind: 'useBase'; channel: ListingChannel; on: boolean }
  | { kind: 'hide'; keys: string[]; channel: ListingChannel; hide: boolean }
  | { kind: 'delete'; keys: string[] }
  | { kind: 'edit'; key: string; edit: PhotoEdit }
const applyOp = (lib: PhotoLib, sl3: PhotoSl3, op: PhotoOp): PhotoLib => {
  if (op.kind === 'reorder') return reorderLib(lib, sl3, op.scope, op.keys)
  if (op.kind === 'useBase') return { ...lib, useBase: { ...(lib.useBase ?? {}), [op.channel]: op.on } }
  if (op.kind === 'hide') return hideLib(lib, op.keys, op.channel, op.hide)
  if (op.kind === 'delete') return deleteLib(lib, op.keys)
  return editLib(lib, sl3, op.key, op.edit)
}
const runOp = (op: PhotoOp) => {
  const s = useStore.getState()
  if (op.kind === 'reorder') s.photoReorder(op.scope, op.keys)
  else if (op.kind === 'useBase') s.photoUseBase(op.channel, op.on)
  else if (op.kind === 'hide') s.photoHide(op.keys, op.channel, op.hide)
  else if (op.kind === 'delete') s.photoDelete(op.keys)
  else s.photoEdit(op.key, op.edit)
}

/* ---------------- All photos ---------------- */
/** Imperative handle so a hosting shell (PhotosShells.tsx's full-screen takeover / PanelStack drawer) can ask this
 *  component to close itself instead of closing out from under it: `requestClose` runs the exact same dirty-check
 *  the internal back-chevron uses, so a shell's X / Escape / spine-click never silently drops an unsaved draft. */
export interface PhotosManagerHandle { requestClose: () => void }
/** The actual photo-management screen — grid, re-order, Add, Edit photo, bulk select, the Discard/Save bar — shared
 *  by every "Manage photos" destination (the standalone /photos route below, and the three navigation patterns in
 *  PhotosShells.tsx) so none of this logic is ever duplicated (Antonio's brief: "don't duplicate PhotosPage's logic
 *  three times"). Two things change per host, both optional:
 *  - `head`: the shared title line (PageHead: back-chevron, "All photos", the property switcher). On for the
 *    standalone route only; the full-screen takeover (its own top bar + `titled` H1, like the real product), the
 *    drawer and the tab all pass `head={false}`. `channel` locks the view to one channel (no scope switcher).
 *  - `onBack`: when given, the back-chevron calls it instead of rendering a route `<Link>` — an overlay's "back" is
 *    closing the overlay, not navigating. It's still routed through the same unsaved-changes guard as leaving the
 *    real route would be (useBlocker only catches a PATHNAME change, which an overlay's query-param toggle never
 *    is — see ds/unsaved.tsx's own docblock — so this component owns that check itself when `onBack` is in play). */
export function PhotosManager({ head = true, onBack, ref, channel, titled = false, baseOnly = false }: {
  head?: boolean; onBack?: () => void; ref?: Ref<PhotosManagerHandle>
  /** Opened from a channel's Listing (Antonio, 3 Oct): the view is that channel's photos and nothing else — no
   *  All photos / per-channel switcher, and every action (re-order, hide, add, edit, bulk select, cover) stays on that
   *  channel. Unset = the standalone cross-channel library (/property/:id/photos), which keeps its scope tabs. */
  channel?: ListingChannel
  /** Render the page's own H1 + subtitle in the body (the full-screen takeover's layout, like the real product). */
  titled?: boolean
  /** Opened from Listing base › Photos (Antonio, 3 Oct: "should work the same way as in the channels"): the Base's
   *  own photos (All photos) and nothing else — no per-channel switcher, as a channel-locked view has none either. */
  baseOnly?: boolean
}) {
  const p = useProperty()
  const [params, setParams] = useSearchParams()
  const { lib, sl3 } = usePhotoLib()
  const PHOTO_CHANNELS = useListingChannels() // this property's channels only
  const q = params.get('channel')
  const locked = channel
  const scope: Scope = locked ?? (baseOnly ? 'all' : isListingChannel(q ?? undefined) && PHOTO_CHANNELS.includes(q as ListingChannel) ? (q as ListingChannel) : 'all')
  const backCh = params.get('back')
  const back: ListingChannel = locked ?? (isListingChannel(backCh ?? undefined) && PHOTO_CHANNELS.includes(backCh as ListingChannel) ? (backCh as ListingChannel) : scope === 'all' ? PHOTO_CHANNELS[0] ?? 'airbnb' : scope)
  const [sel, setSel] = useState<string[]>([])
  const [confirmBulk, setConfirmBulk] = useState(false)
  const [editing, setEditing] = useState<string | null>(() => (params.get('edit') && lib.meta[params.get('edit')!] ? params.get('edit') : null)) // ?edit=<photo> (demo URL state)
  const setScope = (s: Scope) => {
    setSel([]); setConfirmBulk(false)
    setParams((prev) => { const n = new URLSearchParams(prev); if (s === 'all') n.delete('channel'); else n.set('channel', s); return n }, { replace: true })
  }

  // every staged action (reorder, hide/show, delete, Edit photo's Apply/Delete — bulk included), in the order they were made
  const [ops, setOps] = useState<PhotoOp[]>([])
  const draftLib = useMemo(() => ops.reduce((l, op) => applyOp(l, sl3, op), lib), [lib, sl3, ops])
  const dirty = ops.length > 0

  const shown = scope === 'all' ? draftLib.base : channelPhotos(scope, draftLib, sl3).shown
  const hidden = scope === 'all' ? [] : channelPhotos(scope, draftLib, sl3).hidden
  const covers = (k: string) => coverChannels(k, draftLib, sl3)
  const name = scope === 'all' ? '' : PHOTO_CH_NAME[scope]
  const [reorderKeys, setReorderKeys] = useState<string[] | null>(() => (params.get('reorder') ? [...shown] : null)) // re-order mode · ?reorder=1

  const toggle = (k: string, on: boolean) => { setConfirmBulk(false); setSel((s) => (on ? [...s, k] : s.filter((x) => x !== k))) }
  const selHidden = scope !== 'all' && sel.length > 0 && sel.every((k) => hidden.includes(k))
  const mobile = useIsMobile()
  const [adding, setAdding] = useState(false)
  // Save sends every staged op at once, in one receipt per channel it touches (Save = commit, QA A08)
  const [sent, setSent] = useState<{ at: number; text: string } | null>(null)
  useEffect(() => { if (!sent) return; const t = setTimeout(() => setSent(null), 4000); return () => clearTimeout(t) }, [sent])
  const commit = (fn: () => void) => setSent({ at: Date.now(), text: savedLabel(commitPhotosAndSend(fn)) })
  const saveOps = () => { commit(() => { for (const op of ops) runOp(op) }); setOps([]) }
  const discardOps = () => setOps([])
  useUnsavedChanges({ dirty, onDiscard: discardOps, onSave: saveOps, label: 'Photos' })
  // onBack only (an overlay host): closing while dirty asks first, the same choice UnsavedBar's own dialog offers —
  // see this function's docblock for why the router's own guard can't do this for us here.
  const [confirmClose, setConfirmClose] = useState(false)
  const requestClose = () => { if (dirty) setConfirmClose(true); else onBack?.() }
  useImperativeHandle(ref, () => ({ requestClose }), [dirty, onBack])
  const stage = (op: PhotoOp) => setOps((o) => [...o, op])
  /** A locked channel that still follows the Base would silently ignore its own order/hidden list (channelPhotos,
   *  data/photos.ts), so the first channel-only change there also stages "Customize for {channel}" — the same switch
   *  the Essentials row offers — keeping the change on this channel instead of rewriting the Base for everyone. */
  const detach = (): PhotoOp[] => (locked && draftLib.useBase?.[locked] ? [{ kind: 'useBase', channel: locked, on: false }] : [])
  const stageScoped = (op: PhotoOp) => setOps((o) => [...o, ...detach(), op])
  /** One path for every order change — Re-order mode's "Save order" and a drop in the grid — so both stage the same
   *  draft op (replacing an earlier order for this scope) and wait for the shared Discard/Save bar. */
  const stageOrder = (keys: string[]) => {
    const target = scope === 'all' ? 'base' : scope
    setOps((o) => [...o.filter((op) => !(op.kind === 'reorder' && op.scope === target)), ...detach(), { kind: 'reorder', scope: target, keys }])
  }
  const saveOrder = () => { stageOrder(reorderKeys!); setReorderKeys(null) }
  // drag a shown photo straight in the grid (Antonio 3 Oct: "Right now there is no dragging behaviour"); hidden photos
  // aren't in the order, so they don't drag. The first shown photo is the cover — the preview moves the pill live.
  const sort = useSortable({ keys: shown, onReorder: (next) => stageOrder(next), disabled: !!reorderKeys })
  const bulk = {
    hide: scope === 'all' ? null : selHidden
      ? <Button kind="secondary" icon="eye" onClick={() => { stageScoped({ kind: 'hide', keys: sel, channel: scope, hide: false }); setSel([]) }}>Show on {name}</Button>
      : <Button kind="secondary" icon="eye-off" onClick={() => { stageScoped({ kind: 'hide', keys: sel, channel: scope, hide: true }); setSel([]) }}>Hide on {name}</Button>,
    // Delete removes a photo from the library and every channel, so a channel-locked view doesn't offer it:
    // "Hide on {channel}" is how a photo leaves this channel only.
    del: locked ? null : <Button kind="secondary" icon="trash" onClick={() => setConfirmBulk(true)}>Delete</Button>,
    keep: <Button kind="secondary" onClick={() => setConfirmBulk(false)}>Keep</Button>,
    confirm: <button type="button" className="h-btn h-btn--danger" onClick={() => { stage({ kind: 'delete', keys: sel }); setSel([]); setConfirmBulk(false) }}>Delete {sel.length}</button>,
  }

  return (
      <div className="ch-page">
        {/* the shared title line (logo, Back, title and switcher on one line): PageHead, the way back as its lead.
           An overlay host (onBack) gets a button that asks before closing a dirty draft; the standalone route keeps
           its plain Link, still protected by UnsavedBar's own pathname-change guard. */}
        {head && <PageHead property={p} title="All photos"
          lead={onBack
            ? <button type="button" className="h-btn-icon h-photos-back" aria-label={`Back to the ${PHOTO_CH_NAME[back]} listing`} title={`Back to the ${PHOTO_CH_NAME[back]} listing`} onClick={requestClose}><Icon name="chevron-left" /></button>
            : <BackLink className="h-btn-icon h-photos-back" to={`/property/${p.id}/ch/${back}/listing/essentials`} label={`Back to the ${PHOTO_CH_NAME[back]} listing`}><Icon name="chevron-left" /></BackLink>} />}
        <div className="h-photos-page__head">
          <div>
            {/* the count as the listing Photos row's outlined chip, right after the title (Antonio, 3 Oct, 2nd pass) */}
            {titled && <h1 className="h-photos-page__title">{scope === 'all' ? 'All photos' : `${name} photos`}<span className="h-photos-count" aria-label={`${shown.length} photos`}>{shown.length}</span>
              {/* Antonio, 4 Oct: a channel's takeover says plainly that only that channel's photos change here (the
                 channel's mark + "Airbnb only"); the Listing base's "All photos" gets no badge */}
              {locked && <span className="h-photos-chbadge"><ChannelChip channel={locked}>{name} only</ChannelChip></span>}</h1>}
            <p className="h-photos-page__desc">{titled && locked ? `Re-order and hide the photos guests see on ${name}. Your other channels don’t change.` : 'Manage photos and add details.'}</p>
          </div>
          {/* phones: Cancel / Save order move to the sticky bar above the tab bar */}
          {!(mobile && reorderKeys) && <div className="h-photos-page__actions">
            <span key={sent?.at} className={cx('h-saved', sent && 'h-saved--sent')} role="status">{sent ? <><Icon name="circle-check" />{sent.text}</> : null}</span>
            {reorderKeys ? <>
              <Button kind="secondary" onClick={() => setReorderKeys(null)}>Cancel</Button>
              <Button kind="primary" onClick={saveOrder}>Save order</Button>
            </> : <>
              <Button kind="secondary" onClick={() => { setSel([]); setReorderKeys([...shown]) }} disabled={shown.length < 2}>Re-order photos</Button>
              {/* a channel can only re-order and hide (Antonio, 3 Oct): new photos come in on the Listing base */}
              {!locked && <Button kind="primary" onClick={() => setAdding(true)}>Add</Button>}
            </>}
          </div>}
        </div>

        {reorderKeys ? (
          <>
            <ReorderGrid scope={scope} keys={reorderKeys} lib={draftLib} onChange={setReorderKeys} />
            <MobileActionBar>
              <Button kind="secondary" onClick={() => setReorderKeys(null)}>Cancel</Button>
              <Button kind="primary" onClick={saveOrder}>Save order</Button>
            </MobileActionBar>
          </>
        ) : (
          <>
            {/* titled (the takeover): the count is the title's chip, so the separate count line goes and the grid moves
               up; the bar stays only for what it still carries (the scope switcher, a hidden count) */}
            {(!titled || (!locked && !baseOnly) || hidden.length > 0) && <div className={cx('h-photos-page__bar', titled && 'h-photos-page__bar--tight')}>
              <p className="h-photos-page__count">
                {titled ? null : scope === 'all' ? `${shown.length} photos` : `${shown.length} photos on ${name}`}
                {hidden.length > 0 && <span>{hidden.length} hidden</span>}
              </p>
              {/* locked to a channel (opened from its Listing): no scope switcher at all */}
              {!locked && !baseOnly && <PhotosFilter<Scope> value={scope} onChange={setScope} items={[
                { id: 'all', label: 'All photos' },
                ...PHOTO_CHANNELS.map((ch) => ({ id: ch as Scope, label: PHOTO_CH_NAME[ch] })),
              ]} />}
            </div>}
            <div className="h-photos-grid" ref={sort.containerRef}>
              {/* All photos (Antonio 1 Oct): this is the Base grid — its job is the count, add and re-order, not a running
                 tally of every channel's covers and hidden photos. That per-channel detail belongs on that channel's tab,
                 where it's a single, scoped fact instead of a badge stack on every tile. */}
              {sort.order.map((k, i) => (
                <PhotoTile key={k} {...sort.itemProps(k)} className={cx(sort.dragKey === k && 'h-drop-placeholder')}
                  src={photoUrl(k)} alt={alt(draftLib, k)} selected={sel.includes(k)} onSelect={(on) => toggle(k, on)} onEdit={() => setEditing(k)}
                  foot={scope === 'all' ? undefined : <CoverPill channels={sort.dragKey ? (i === 0 ? [scope] : []) : covers(k).filter((c) => c === scope)} />} />
              ))}
              {hidden.length > 0 && <p className="h-photos-grid__sep">Hidden on {name} · guests there don’t see these</p>}
              {hidden.map((k) => (
                <PhotoTile key={k} hidden src={photoUrl(k)} alt={alt(draftLib, k)} selected={sel.includes(k)} onSelect={(on) => toggle(k, on)} onEdit={() => setEditing(k)}
                  foot={<HiddenPill label={`Hidden on ${name}`}>Hidden on <Mark channel={scope as ListingChannel} /></HiddenPill>} />
              ))}
            </div>
            <DragGhost ghost={sort.ghost}>{sort.ghost && <PhotoTile src={photoUrl(sort.ghost.key)} alt="" selected={sel.includes(sort.ghost.key)} />}</DragGhost>
            {/* phones (06/07): the selection's actions sit in the sticky bar above the tab bar */}
            {sel.length > 0 && mobile && (
              <MobileActionBar>
                <div className="h-photos-bulkbar" role="toolbar" aria-label="Selected photos">
                  <div className="h-photos-bulkbar__count">
                    <span>{confirmBulk ? `Delete ${sel.length} from every channel?` : `${sel.length} selected${locked ? ` on ${name}` : ''}`}</span>
                    {!confirmBulk && <button type="button" className="h-textlink" onClick={() => setSel([])}>Clear</button>}
                  </div>
                  <div className="h-photos-bulkbar__row">{confirmBulk ? <>{bulk.keep}{bulk.confirm}</> : <>{bulk.hide}{bulk.del}</>}</div>
                </div>
              </MobileActionBar>
            )}
            {sel.length > 0 && !mobile && (
              <div className="h-photos-bulk">
                <div className="h-selection-bar" role="toolbar" aria-label="Selected photos">
                  <span className="h-selection-bar__count">{sel.length} selected{locked ? ` on ${name}` : ''}</span>
                  {confirmBulk ? <>
                    <span>Delete from every channel?</span>
                    {bulk.keep}{bulk.confirm}
                  </> : <>
                    {bulk.hide}{bulk.del}
                    <CloseButton label="Clear selection" onClick={() => setSel([])} />
                  </>}
                </div>
              </div>
            )}
          </>
        )}
        {/* provenance lives in the file header and ds/DS.md, not on screen (Antonio: no demo chrome) */}
        {editing && (
          <EditPhoto k={editing} lib={draftLib} onClose={() => setEditing(null)} channel={locked}
            onApply={(edit) => {
              // a show/hide change on a locked channel that follows the Base needs that channel customized first (detach)
              const showChanged = locked && edit.show[locked] === draftLib.hidden[locked].includes(editing)
              if (showChanged) stageScoped({ kind: 'edit', key: editing, edit }); else stage({ kind: 'edit', key: editing, edit })
            }}
            onDelete={locked ? undefined : () => stage({ kind: 'delete', keys: [editing] })}
          />
        )}
        {adding && <AddPhotos channel={locked} onClose={() => setAdding(false)} />}
        {/* last child of this page's own scroll column (.ch-page doesn't go through Page/PageBody) — ds/unsaved.tsx */}
        <UnsavedBar />
        {/* an overlay host only (onBack): the same "Unsaved changes" choice as leaving the real route would trigger,
           reusing OvDialog (ds/overview.tsx) rather than duplicating ds/unsaved.tsx's own UnsavedDialog. */}
        {confirmClose && (
          <OvDialog title="Unsaved changes" onClose={() => setConfirmClose(false)} foot={<>
            <button type="button" className="h-btn h-btn--ghost h-btn--lg" onClick={() => setConfirmClose(false)}>Keep editing</button>
            <button type="button" className="h-btn h-btn--danger-outline h-btn--lg" onClick={() => { discardOps(); setConfirmClose(false); onBack?.() }}>Discard changes</button>
            <button type="button" className="h-btn h-btn--primary h-btn--lg" onClick={() => { saveOps(); setConfirmClose(false); onBack?.() }}>Save changes</button>
          </>}>
            <p>Your changes haven't been saved. If you leave now, they'll be discarded.</p>
          </OvDialog>
        )}
      </div>
  )
}

/** The standalone route (/property/:id/photos?channel=…&back=…) — the cross-channel photo library, reached from
 *  Listing base › Details › Essentials (screens/details/fields.tsx, ?channel=all) and the mobile demo index; no
 *  channel's "Manage photos" leads here any more (Antonio, 3 Oct: those open the channel-locked takeover). Keeps its
 *  All photos / per-channel scope tabs: PhotosManager with its default head and no onBack, inside the usual Split. */
export function PhotosPage() {
  return <Split main={<PhotosManager />} />
}

/* ---------------- Re-order mode: drag (ds/sortable.tsx), or focus a grip and use the arrow keys ---------------- */
function ReorderGrid({ scope, keys, lib, onChange }: { scope: Scope; keys: string[]; lib: PhotoLib; onChange: (k: string[]) => void }) {
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [said, setSaid] = useState('')
  const grips = useRef<Record<string, HTMLButtonElement | null>>({})
  useEffect(() => { if (grabbed) grips.current[grabbed]?.focus() }, [keys, grabbed])
  const announce = (k: string, t: number) => setSaid(`${alt(lib, k)} moved to position ${t + 1} of ${keys.length}${t === 0 ? ', the cover' : ''}.`)
  const move = (k: string, to: number) => {
    const from = keys.indexOf(k)
    const t = Math.max(0, Math.min(keys.length - 1, to))
    if (from === t) return
    const n = keys.filter((x) => x !== k)
    n.splice(t, 0, k)
    onChange(n)
    announce(k, t)
  }
  const onKey = (k: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = keys.indexOf(k)
    const step: Record<string, number> = { ArrowLeft: -1, ArrowUp: -5, ArrowRight: 1, ArrowDown: 5 }
    if (e.key in step) { e.preventDefault(); setGrabbed(k); move(k, i + step[e.key]) }
    else if (e.key === 'Home') { e.preventDefault(); setGrabbed(k); move(k, 0) }
    else if (e.key === 'End') { e.preventDefault(); setGrabbed(k); move(k, keys.length - 1) }
  }
  // mouse/pen: drag the tile or its grip; touch: the grip (pointer events — the old HTML5 drag-and-drop never fired here)
  const sort = useSortable({ keys, onReorder: (next, m) => { onChange(next); announce(m.key, m.to) } })
  const where = scope === 'all'
    ? 'the Base order. Channels that follow the Base get it; a channel with its own order keeps it.'
    : `${PHOTO_CH_NAME[scope]} only. The first photo is the cover there.${scope === 'airbnb' ? ' Airbnb may still group photos by room in its photo tour.' : scope === 'booking' ? ' Booking.com’s smart ordering must be off for this order to hold.' : ''}`
  const coverFoot = scope !== 'all' ? <span className="h-photo-cover">Cover for <Mark channel={scope} /></span> : undefined
  return (
    <>
      <p className="h-photos-kbd">You’re re-ordering {where}</p>
      <div className="h-photos-grid ch-mt" role="list" aria-label="Photos in order" ref={sort.containerRef}>
        {sort.order.map((k, i) => (
          <PhotoTile key={k} role="listitem" reorder src={photoUrl(k)} alt={alt(lib, k)} {...sort.itemProps(k)}
            className={cx(sort.dragKey === k && 'h-drop-placeholder', grabbed === k && !sort.dragKey && 'is-grabbed')}
            foot={i === 0 ? coverFoot : undefined}
            grip={{
              'aria-label': `Move ${alt(lib, k)}, position ${i + 1} of ${keys.length}. Use the arrow keys.`,
              ref: (el: HTMLButtonElement | null) => { grips.current[k] = el },
              onKeyDown: onKey(k), onBlur: () => setGrabbed((g) => (g === k ? null : g)),
            }} />
        ))}
      </div>
      <DragGhost ghost={sort.ghost}>{sort.ghost && <PhotoTile reorder src={photoUrl(sort.ghost.key)} alt="" foot={sort.dropIndex === 0 ? coverFoot : undefined} grip={{ 'aria-label': '', tabIndex: -1 }} />}</DragGhost>
      <p className="h-photos-kbd">Drag a photo to move it, or focus its handle and use the arrow keys (Home / End for first / last).</p>
      <p className="h-sr-only" aria-live="polite">{said}</p>
    </>
  )
}

/* ---------------- Edit photo ---------------- */
/* ---------------- Add photos: the sheet opens, the upload itself isn't part of the prototype (QA A09) ---------------- */
function AddPhotos({ onClose, channel }: { onClose: () => void; channel?: ListingChannel }) {
  const mobile = useIsMobile()
  const listed = useListingChannels().filter((ch) => ch !== 'direct').map((ch) => PHOTO_CH_NAME[ch])
  const same = listed.length > 1 ? `${listed.slice(0, -1).join(', ')} and ${listed[listed.length - 1]} use the same files.` : listed.length ? `${listed[0]} uses the same files.` : ''
  const body = (
    <div className="h-photo-add">
      <div className="h-photo-add__drop" aria-disabled="true">
        <Icon name="cloud-upload" size={24} />
        <b>Drag photos here</b>
        <span>JPG or PNG, at least 1024 × 683 px.{same && !channel ? ` ${same}` : ''}</span>
        <Button kind="secondary" disabled>Browse files</Button>
      </div>
      <p className="h-photo-add__note"><Icon name="info-circle" size={16} />{channel
        ? `Uploading isn’t part of this prototype. Photos added here go to ${PHOTO_CH_NAME[channel]}; they also join your photo library, so you can show them on other channels from there.`
        : 'Uploading isn’t part of this prototype. In Hospitable, new photos join the library and show on every channel that uses the Base; you can hide them per channel afterwards.'}</p>
    </div>
  )
  const foot = <Button kind="secondary" onClick={onClose}>Close</Button>
  return mobile
    ? <BottomSheet open title="Add photos" onClose={onClose} footer={foot}>{body}</BottomSheet>
    : <SheetModal title="Add photos" onClose={onClose} foot={foot}>{body}</SheetModal>
}

function EditPhoto({ k, lib, onClose, onApply, onDelete, channel }: {
  k: string; lib: PhotoLib; onClose: () => void; onApply: (edit: PhotoEdit) => void
  /** Omitted in a channel-locked view: deleting removes the photo from every channel, so it isn't offered there. */
  onDelete?: () => void
  /** Channel-locked (opened from that channel's Listing): only this channel's show/tag rows. */
  channel?: ListingChannel
}) {
  const connected = useListingChannels() // this property's channels only
  const PHOTO_CHANNELS = channel ? [channel] : connected
  const m = lib.meta[k]
  const all = <T,>(f: (ch: ListingChannel) => T) => Object.fromEntries(PHOTO_CHANNELS.map((ch) => [ch, f(ch)])) as Record<ListingChannel, T>
  const [show, setShow] = useState(all((ch) => !lib.hidden[ch].includes(k)))
  const [desc, setDesc] = useState(m?.description ?? '')
  // a channel's own caption, or null = it uses the Base's (the channel-locked Edit photo, Antonio 3 Oct)
  const [own, setOwn] = useState<string | null>(channel ? m?.perChannel?.[channel] ?? null : null)
  const p = useProperty()
  const [tag, setTag] = useState<RoomTag | null>(m?.tag ?? null)
  const [confirm, setConfirm] = useState(false)
  const [big, setBig] = useState(false)
  const t = roomTag(tag)

  const apply = () => {
    const perChannel = channel ? { ...(m?.perChannel ?? {}), ...(own !== null ? { [channel]: own } : {}) } : m?.perChannel
    if (channel && own === null && perChannel) delete perChannel[channel]
    const edit: PhotoEdit = { show, description: desc, perChannel, tag }
    onApply(edit)
    onClose()
  }
  const del = () => { onDelete?.(); onClose() }
  const mobile = useIsMobile()
  // Base level: Delete sits LEFT in the footer, the secondary button look in red with a bin (Antonio, 4 Oct)
  const deleter = !onDelete ? null : confirm
    ? <span className="h-photo-confirm">Delete this photo from every channel?
        <Button kind="secondary" onClick={() => setConfirm(false)}>Keep it</Button>
        <button type="button" className="h-btn h-btn--danger" onClick={del}>Delete photo</button>
      </span>
    : <button type="button" className="h-btn h-btn--secondary h-btn--danger-outline" onClick={() => setConfirm(true)}><Icon name="trash" size={16} />Delete photo</button>
  const foot = <><Button kind="secondary" onClick={onClose}>Cancel</Button><Button kind="primary" onClick={apply}>Apply changes</Button></>
  // phones: a full-screen sheet (ds/mobile.md §7) with Cancel / Apply changes in its footer; Delete sits at the end of the form
  // (a plain function, not a component: an inline component would remount the form on every keystroke)
  const frame = (children: ReactNode) => mobile
    ? <BottomSheet open fullScreen title="Edit photo" onClose={onClose} footer={foot}>{children}{deleter && <div className="h-photo-edit__delete">{deleter}</div>}</BottomSheet>
    : <SheetModal title="Edit photo" onClose={onClose} footStart={deleter} foot={foot}>{children}</SheetModal>

  return frame(
      <div className="h-photo-edit">
        <div className={cx('h-photo-edit__photo', big && 'is-expanded')}>
          <img src={photoUrl(k)} alt={desc || 'Photo'} />
          {big
            ? <CloseButton className="h-photo-edit__close" label="Shrink photo" onClick={() => setBig(false)} autoFocus />
            : <button type="button" className="h-photo-tile__tool" aria-label="Expand photo" onClick={() => setBig(true)}><Icon name="arrows-diagonal" /></button>}
        </div>
        {channel ? (
          /* Channel-locked (Antonio, 3 Oct): a channel only decides whether it shows the photo (Yes / No) and, if it
           * wants, its own caption — "Uses the Base" until customised, like any other field. The room or area comes
           * from the Listing base and is read-only here; the photo itself is changed on the Listing base. */
          <div className="h-photo-edit__form h-photo-edit__form--channel">
            <section>
              <p className="h-photo-edit__q">Show this photo on {PHOTO_CH_NAME[channel]}?</p>
              <Segmented label={`Show this photo on ${PHOTO_CH_NAME[channel]}`} value={show[channel] ? 'yes' : 'no'}
                onChange={(v) => setShow({ ...show, [channel]: v === 'yes' })} items={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} />
            </section>
            <section>
              <p className="h-photo-edit__q">Photo description</p>
              {own === null ? (
                <>
                  <input className="h-input" value={m?.description ?? ''} disabled aria-label="Photo description (uses the Base)" />
                  <p className="h-photo-edit__inherit"><span><Icon name="info-circle" size={16} />Uses the Base</span>
                    <button type="button" className="h-textlink" onClick={() => setOwn(m?.description ?? '')}>Customize for {PHOTO_CH_NAME[channel]}</button></p>
                </>
              ) : (
                <>
                  <input className="h-input" value={own} autoFocus onChange={(e) => setOwn(e.target.value)} aria-label={`Photo description on ${PHOTO_CH_NAME[channel]}`} placeholder="Describe the photo" />
                  <p className="h-photo-edit__inherit"><span><Icon name="info-circle" size={16} />Custom for {PHOTO_CH_NAME[channel]}</span>
                    <button type="button" className="h-textlink" onClick={() => setOwn(null)}>Use the Base</button></p>
                </>
              )}
            </section>
            <section>
              <p className="h-photo-edit__q">Room or area</p>
              <Locked>{t ? t.label : 'Not tagged'}</Locked>
              <p className="h-photo-edit__inherit"><span>{TAG_USE[channel]}: {t ? t[channel] : '—'}</span></p>
            </section>
            <p className="h-photo-edit__note"><Icon name="info-circle" size={16} />To change the photo itself or its room, go to <Link className="h-textlink" to={`/property/${p.id}/details/essentials?photosOpen=1`} onClick={onClose}>the Listing base photos</Link>.</p>
          </div>
        ) : (
        <div className="h-photo-edit__form">
          <section>
            <p className="h-photo-edit__q">Photo description</p>
            <input className="h-input" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Photo description" placeholder="Describe the photo" />
          </section>

          <section>
            <p className="h-photo-edit__q"><Icon name="tag" size={18} />Room or area</p>
            <p className="h-photo-edit__sub">One tag, used the way each channel works.</p>
            <div className="h-select-wrap">
              <select className={cx('h-select', !tag && 'is-placeholder')} value={tag ?? ''} aria-label="Room or area" onChange={(e) => setTag((e.target.value || null) as RoomTag | null)}>
                <option value="">Select a room or area</option>
                {ROOM_TAGS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <Icon name="chevron-down" />
            </div>
          </section>
        </div>
        )}
      </div>
  )
}
