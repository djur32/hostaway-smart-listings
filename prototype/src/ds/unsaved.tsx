/* Unsaved-changes bar + navigation guard (concepts/smart-listing/UNSAVED-PATTERN.md, "I don't want to
 * see Discard changes or Save unless there are changes for me to validate"). Replaces the always-visible, always-
 * disabled Discard/Save pair that section-editing screens used to render: nothing shows while every draft is clean;
 * the moment any draft goes dirty, a bar appears and in-app navigation is guarded.
 *
 * Reworked 1 Oct evening, live-review feedback: "I don't like the way that the unsaved changes are handled. I think
 * this should definitely be in a banner at the bottom, and make sure that all of the content is scrollable... I want
 * this to be at the bottom and only in the area where you're editing." The earlier build pinned a strip to the TOP
 * of the whole viewport, above the sidebar; it's now a plain `position: sticky; bottom` element rendered AS A CHILD
 * of the dirty screen's own scrolling content column, never a fixed/portal element measured against the viewport.
 * That gets both asks for free: it's exactly as wide as the content column (never the sidebar), and the page keeps
 * scrolling normally since the bar is just the last thing in that scroll container, not pulled out of flow.
 *
 * `<UnsavedBar/>` is still the one component, but it is no longer mounted once at the shell root, nothing in
 * AppShell is "the" content column, every screen builds its own, so the call moves to wherever each screen's
 * scrolling column ends: `shell/AppShell.tsx`'s `Page` and `shell/PropertyLayout.tsx`'s `PageBody` (the two shared
 * wrappers, covering most screens) render it as the last child of `.h-content__inner`; `ListingDetails.tsx` and
 * `ListingEditor.tsx`'s Classic view don't use those wrappers, so they render it as the last child of their own
 * `.ch-page`; Pricing/Calendar's PanelStack drafts only ever exist inside an open drill-down panel, so
 * `screens/pricing/PricingPanels.tsx` renders it in that panel's own `footer` slot (`.h-pstack__foot`, already a
 * "pinned under the scrolling body" slot built for exactly this) instead. Only one of these is ever mounted at a
 * time per route, so there's exactly one bar on screen regardless of how many places call it. Flagged open: a few
 * `SaveActions` consumers haven't been checked against this list screen-by-screen (SESSION-LOG has the detail).
 *
 * Same registry architecture as the mobile sticky-action-bar in ./mobile.tsx (a module-level subscribable store,
 * put/remove, useSyncExternalStore), but this one also renders on desktop, where there was no shared sticky
 * mechanism yet. On phones it doesn't build a second bar: it registers into the existing mobile action bar via
 * useMobileActions (ds/mobile.tsx), the same slot Tips/SaveActions already use.
 *
 * Multiple registrations can be dirty at once (e.g. the section's own draft + an open, un-actioned tip). The bar
 * shows ONE shared Discard/Save pair and calls EVERY registered onDiscard/onSave, not just the most recent, because
 * each registration owns a different draft and only it knows how to drop or commit its own changes; calling just one
 * would silently lose (or leave stranded) whatever the others were holding.
 *
 * CSS: ds/components.css, section "UNSAVED CHANGES". Tokens only. Motion: --dur-drawer/--ease-drawer (ds/motion.md
 * M-20), "quick, not gradual": the bar mostly just appears, no slide, no bounce. */
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useBlocker } from 'react-router-dom'
import { Icon } from './primitives'
import { useIsMobile, useMobileActions } from './mobile'
import { OvDialog } from './overview'
import { Toast } from './toast'

export interface UnsavedEntry {
  id: string
  dirty: boolean
  onDiscard: () => void
  /** May be async and/or return `false` to signal validation blocked the save (SaveActions' convention), the entry
   *  stays dirty and the bar/dialog don't treat it as saved. */
  onSave: () => unknown
  /** What this registration is ("Essentials", "a tip"): not surfaced in the bar's copy today (one shared pair, no
   *  per-draft list), kept for callers and future copy. */
  label?: string
}

/* ---------- registry (module-level, same shape as ./mobile's `bar`) ---------- */
let entries: Map<string, UnsavedEntry> = new Map()
// useSyncExternalStore requires a stable snapshot reference between emits, so the derived dirty list is cached and
// only recomputed when the registry itself mutates, not on every render's getSnapshot call (a fresh array each
// call looks like a change every time and loops React forever, "Maximum update depth exceeded").
let dirtyCache: UnsavedEntry[] = []
const recompute = () => { dirtyCache = [...entries.values()].filter((e) => e.dirty) }
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const registry = {
  subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f) } },
  put(e: UnsavedEntry) { entries = new Map(entries).set(e.id, e); recompute(); emit() },
  remove(id: string) { if (!entries.has(id)) return; entries = new Map(entries); entries.delete(id); recompute(); emit() },
  dirtyList: () => dirtyCache,
  anyDirty: () => dirtyCache.length > 0,
}

/** Registers a draft as dirty/clean with the shared bar + navigation guard. Unregisters on unmount. Callbacks may
 *  change every render (kept in a ref, as useMobileActions does); pass `dirty: false` the moment there's nothing to
 *  lose (e.g. right after a save resolves), the bar/blocker clear themselves as soon as nothing registered is dirty. */
export function useUnsavedChanges({ dirty, onDiscard, onSave, label }: { dirty: boolean; onDiscard: () => void; onSave: () => unknown; label?: string }) {
  const id = useId()
  const cb = useRef({ onDiscard, onSave })
  cb.current = { onDiscard, onSave }
  useEffect(() => {
    registry.put({ id, dirty, label, onDiscard: () => cb.current.onDiscard(), onSave: () => cb.current.onSave() })
  }, [id, dirty, label])
  useEffect(() => () => registry.remove(id), [id])
}

const useDirtyEntries = () => useSyncExternalStore(registry.subscribe, registry.dirtyList, () => [] as UnsavedEntry[])

const discardAll = (list: UnsavedEntry[]) => { for (const e of list) e.onDiscard() }

/* ---------- the save toast ("When you click Save … I want to see a toast, on mobile and desktop, that
 * shows the progress was saved, that all of those changes were made. And give the option to undo.") ----------
 * Every Save from the bar, the phone's action bar or the leave-page dialog ends in the shared Toast (./toast): "Changes
 * saved" over what changed and where it went ("3 changes · sent to Airbnb, Booking.com and Direct"), with Undo, which
 * puts back exactly what that Save changed and turns the toast into a short "Changes undone". It replaces the quiet
 * inline "Saved · sent to …" note SaveActions used to show beside the section head. The ds stays store-agnostic: the
 * app registers how to snapshot and restore a save (`setSaveTransaction`, screens/push/saveUndo.ts). The toast lives in
 * a module-level slot rendered by the guard-owning UnsavedBar, so a save made on the way out of a page (the dialog's
 * Save changes) still shows on the next page. */
export interface SaveOutcome {
  /** The summary line: what changed and where it went. */
  summary?: string
  /** Puts back what the save changed; absent when the save changed nothing that can be restored. */
  undo?: () => void
}
export interface SaveTransaction { begin: () => { end: () => SaveOutcome } }
let transaction: SaveTransaction | null = null
/** How a save is snapshotted and undone (registered once by the app). */
export function setSaveTransaction(t: SaveTransaction | null) { transaction = t }

type SaveToastState = { id: number; summary?: string; undo?: () => void; undone: boolean } | null
let saveToast: SaveToastState = null
let saveToastSeq = 0
const toastSubs = new Set<() => void>()
const showSaveToast = (t: SaveToastState) => { saveToast = t; toastSubs.forEach((f) => f()) }
const useSaveToast = () => useSyncExternalStore((f) => { toastSubs.add(f); return () => { toastSubs.delete(f) } }, () => saveToast, () => null)
// "Saved · sent to Airbnb" (SaveActions' return) → "Sent to Airbnb": the summary when the transaction has none
const fromLabel = (r: unknown) => (typeof r === 'string' && r.startsWith('Saved · ') ? r.slice(8).replace(/^./, (c) => c.toUpperCase()) : undefined)

const saveAll = async (list: UnsavedEntry[]) => {
  const tx = transaction?.begin()
  let saved = false
  let label: string | undefined
  for (const e of list) {
    const r = await e.onSave()
    if (r === false) continue // validation blocked this draft: it stays dirty, nothing to confirm
    saved = true
    label ??= fromLabel(r)
  }
  const out = tx?.end() ?? {}
  if (saved) showSaveToast({ id: ++saveToastSeq, summary: out.summary ?? label, undo: out.undo, undone: false })
}

/** The save toast: bottom of the content column (desktop), full width over the dock (phones). */
function SaveToast() {
  const t = useSaveToast()
  if (!t) return null
  const close = () => { if (saveToast?.id === t.id) showSaveToast(null) }
  if (t.undone) return <Toast key={`undone-${t.id}`} dock icon="arrow-back-up" title="Changes undone" duration={3000} onClose={close}>Back to the previous values</Toast>
  const undo = t.undo
  return (
    <Toast key={t.id} dock title="Changes saved" onClose={close}
      onUndo={undo ? () => { undo(); showSaveToast({ ...t, undo: undefined, undone: true }) } : undefined}>
      {t.summary}
    </Toast>
  )
}

/* ---------- the dialog (OvDialog: the DS's existing centred-modal/bottom-sheet shell, ds/overview.tsx) ---------- */
/** Button hierarchy: Keep editing is the quiet way out -
 *  ghost, no border, Discard changes is the destructive-but-reversible-by-not-clicking-it one, outlined danger,
 *  not a solid fill, which read as too final for a confirm dialog, and Save changes stays primary. All three
 *  h-btn--lg (taller, easier to hit correctly on a decision this consequential). */
function UnsavedDialog({ busy, onKeepEditing, onDiscard, onSave }: { busy: boolean; onKeepEditing: () => void; onDiscard: () => void; onSave: () => void }) {
  // phones: the same footer as every other sheet, the Discard changes | Save changes pair, 50/50;
  // "Keep editing" is the sheet's own way out (×, scrim, drag down, Esc), so it isn't a third button
  if (useIsMobile()) return (
    <OvDialog title="Unsaved changes" onClose={onKeepEditing}
      foot={<>
        <button type="button" className="h-btn h-btn--secondary" disabled={busy} onClick={onDiscard}>Discard changes</button>
        <button type="button" className="h-btn h-btn--primary" disabled={busy} onClick={onSave}>Save changes</button>
      </>}
    >
      <p>Your changes haven't been saved. If you leave now, they'll be discarded.</p>
    </OvDialog>
  )
  return (
    <OvDialog title="Unsaved changes" onClose={onKeepEditing}
      foot={<>
        <button type="button" className="h-btn h-btn--ghost h-btn--lg" disabled={busy} onClick={onKeepEditing}>Keep editing</button>
        <button type="button" className="h-btn h-btn--danger-outline h-btn--lg" disabled={busy} onClick={onDiscard}>Discard changes</button>
        <button type="button" className="h-btn h-btn--primary h-btn--lg" disabled={busy} onClick={onSave}>Save changes</button>
      </>}
    >
      <p>Your changes haven't been saved. If you leave now, they'll be discarded.</p>
    </OvDialog>
  )
}

/** How long the bar keeps showing "Discarded" (discarding needs to read as clearly as
 *  saving does) before it disappears, long enough to register, short enough not to block the next edit. */
const DISCARDED_MS = 1400

/** The sticky-bottom bar (desktop) + the mobile hand-off + the route-change guard + its dialog, all in one.
 *  NOT mounted once globally any more (reworked 1 Oct evening, see this file's docblock): call it as the last child
 *  of whichever scrolling content column the dirty screen owns, `shell/AppShell.tsx`'s `Page`, `shell/
 *  PropertyLayout.tsx`'s `PageBody`, a screen's own `.ch-page`, or a PanelStack panel's `footer`, never inside a
 *  fixed-position wrapper. Screens otherwise only ever call useUnsavedChanges; this call is what makes the
 *  registered draft actually visible in THAT screen's column. */
export function UnsavedBar() {
  const list = useDirtyEntries()
  const dirty = list.length > 0
  const isMobile = useIsMobile()
  const [busy, setBusy] = useState(false)
  // "Discarded": kept visible in the bar's own slot for a beat after the list goes clean from a discard, so
  // Discard reads as clearly as Save's own quiet "Saved" note does instead of the bar
  // just silently vanishing the instant it's clicked.
  const [discarded, setDiscarded] = useState(false)
  const discardedTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(discardedTimer.current), [])

  const discard = () => {
    discardAll(list)
    setDiscarded(true)
    window.clearTimeout(discardedTimer.current)
    discardedTimer.current = window.setTimeout(() => setDiscarded(false), DISCARDED_MS)
  }
  const save = async () => { setBusy(true); try { await saveAll(list) } finally { setBusy(false) } }

  // Phones (ds/mobile.md §6): the shell already has one sticky action bar above the tab bar, register into it
  // instead of stacking a second bar. useMobileActions no-ops above 767px, so this is a no-op on desktop. Returning
  // 'Discarded' makes the mobile bar flash it the same way it already flashes a string Save returns (ds/mobile.tsx).
  useMobileActions(dirty ? { dirty: true, onDiscard: () => { discardAll(list); return 'Discarded' }, onSave: save, discardLabel: 'Discard changes', saveLabel: 'Save changes' } : null)

  // In-app navigation (an actual route/page change) while dirty is blocked; the dialog takes over instead of
  // navigating. Scoped to the PATHNAME so a same-page search-param update, a tab switch, a filter, Canvas's own
  // ?select=/?compare=/?tips= (screens/canvas/CanvasView.tsx selects a different field, toggles Live now, opens
  // Tips, all while a draft may already be dirty), is never caught by this guard; only actually leaving the page
  // is. A boolean `useBlocker(dirty)` blocks every transition regardless of destination, which silently broke any
  // same-page interaction once a draft went dirty (confirmed live: Canvas's second field could no longer be
  // selected after the first was accepted) and contradicted Pricing's own documented intent (PricingPanels.tsx:
  // "switching tabs with unsaved edits drops them", a tab Link is a transition too, so it needs to go through).
  // React Router allows ONE blocker at a time, and a page can mount more than one UnsavedBar (the Listing editor and its
  // Manage photos takeover, a screen and a PanelStack footer). Only the first one mounted owns the guard (RouteGuard,
  // below); the others are bars only. The guard reads the shared registry, so whichever bar owns it covers every draft.
  const ownsGuard = useGuardOwner()

  // Closing the tab / reloading: best-effort, gated on the same registry (nice-to-have).
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!registry.anyDirty()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  // Pinned to the bottom of the window, across the whole working area ("always at the bottom, not
  // just under the content… it should span the entire thing", Tips panel included). The bar stays where it is in the
  // tree (so the draft context still finds it), but the pinned bar is portalled to <body>, a transformed ancestor (the
  // page's entry animation) would otherwise capture `position: fixed` but is drawn `position: fixed`,
  // its left/right taken from the area it belongs to: the editor's split (form + panel), else the whole editor
  // (a PanelStack page such as Pricing), else the page's content column, never the padded form column. Inside a PanelStack footer (Calendar's night drill-down) it stays inline, as before.
  const anchor = useRef<HTMLSpanElement>(null)
  const [box, setBox] = useState<{ left: number; right: number } | null>(null)
  const shown = !isMobile && (dirty || discarded)
  useLayoutEffect(() => {
    const el = anchor.current
    if (!shown || !el || el.closest('.h-pstack__foot')) { setBox(null); return }
    const host = el.closest<HTMLElement>('.h-split') ?? el.closest<HTMLElement>('.ch-editor') ?? el.closest<HTMLElement>('.h-content') ?? el.parentElement
    if (!host) return
    const measure = () => { const r = host.getBoundingClientRect(); setBox({ left: Math.round(r.left), right: Math.round(document.documentElement.clientWidth - r.right) }) }
    measure()
    // the scrollers behind the bar keep room at their end (components.css `.has-unsaved-bar`)
    host.classList.add('has-unsaved-bar')
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); host.classList.remove('has-unsaved-bar') }
  }, [shown])

  const bar = (
    <div className={box ? 'h-unsaved-bar is-pinned' : 'h-unsaved-bar'} style={box ? { left: box.left, right: box.right } : undefined} role="region" aria-label="Unsaved changes">
      {dirty ? (
        <>
          <span className="h-unsaved-bar__text">Unsaved changes</span>
          <span className="h-unsaved-bar__actions">
            <button type="button" className="h-btn h-btn--secondary" disabled={busy} onClick={discard}>Discard changes</button>
            <button type="button" className="h-btn h-btn--primary" disabled={busy} onClick={save}>Save changes</button>
          </span>
        </>
      ) : (
        <span className="h-unsaved-bar__done" role="status"><Icon name="circle-check" size={16} />Discarded</span>
      )}
    </div>
  )

  return (
    <>
      <span ref={anchor} hidden />
      {shown && (box ? createPortal(bar, document.body) : bar)}
      {ownsGuard && <RouteGuard list={list} busy={busy} setBusy={setBusy} />}
      {ownsGuard && <SaveToast />}
    </>
  )
}

/* ---------- the one route guard ---------- */
let guardOwner: symbol | null = null
const guardSubs = new Set<() => void>()
const guardEmit = () => guardSubs.forEach((f) => f())
const guardSubscribe = (f: () => void) => { guardSubs.add(f); return () => { guardSubs.delete(f) } }
/** True for exactly one mounted UnsavedBar: the first to mount, then the next one when it unmounts. */
function useGuardOwner(): boolean {
  const [me] = useState(() => Symbol('unsaved-guard'))
  const owner = useSyncExternalStore(guardSubscribe, () => guardOwner, () => null)
  useEffect(() => {
    if (guardOwner === null) { guardOwner = me; guardEmit() }
  }, [owner, me])
  useEffect(() => () => { if (guardOwner === me) { guardOwner = null; guardEmit() } }, [me])
  return owner === me
}
function RouteGuard({ list, busy, setBusy }: { list: UnsavedEntry[]; busy: boolean; setBusy: (b: boolean) => void }) {
  const dirty = list.length > 0
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  if (blocker.state !== 'blocked') return null
  return (
    <UnsavedDialog
      busy={busy}
      onKeepEditing={() => blocker.reset()}
      onDiscard={() => { discardAll(list); blocker.proceed() }}
      onSave={async () => { setBusy(true); try { await saveAll(list) } finally { setBusy(false) }; blocker.proceed() }}
    />
  )
}
