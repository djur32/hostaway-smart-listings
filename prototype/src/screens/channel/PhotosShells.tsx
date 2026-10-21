/* The two overlay shells for the photos-navigation exploration (screens/channel/photosNav.tsx) — Pattern A (a true
 * full-screen takeover, portaled over everything including the sidebar) and Pattern B (PanelStack's own slide-in
 * drawer, widened to fit a photo grid). Both host the exact same <PhotosManager/> (./Photos.tsx) — only the frame
 * around it differs — and both route every close trigger (X, Escape, PanelStack's own back/spine) through
 * PhotosManager's `requestClose`, so a dirty draft is never silently dropped (see Photos.tsx's own docblock).
 * Pattern C (the tab) needs no shell: it's a real route, handled directly in ListingEditor.tsx. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BottomSheet, CloseButton, Icon, PanelStack, Split, cx, useIsMobile, type StackPanel } from '../../ds'
import { PhotosManager, type PhotosManagerHandle } from './Photos'
import { PHOTO_CH_NAME } from '../../data/photos'
import type { ListingChannel } from '../../data/sl3'

/** How long the takeover's exit fade+scale runs before it unmounts: `--dur-drawer` (160ms, the same token Split and
 *  PanelStack slide with) plus a frame of slack — the exact idiom Split's SPLIT_EXIT_MS / PanelStack's EXIT_MS
 *  already use (ds/sl3.tsx, ds/panels.tsx), so the overlay stays mounted for its own exit instead of cutting. */
const TAKEOVER_EXIT_MS = 200

/** Pattern A — full-screen takeover, Antonio's pick for every channel (3 Oct), laid out like the real Hospitable
 *  "Manage photos" screen (REAL·PRODUCT HS-L04): a full-width top bar — bordered square back-chevron on the left,
 *  "Manage photos" centred, bordered square × on the right, a divider under it — then a centred container (about
 *  two-thirds of a desktop viewport) holding the H1 + subtitle with Re-order photos / Add, the count row and the
 *  5-column grid. Unlike the real screen, there is no All photos / per-channel switcher: it's locked to `channel`.
 *  Animates in/out with a fade + slight scale (CSS `h-photos-takeover-in`/`-out`, ds/v3/ch.css) using the drawer
 *  tokens — never an instant swap. Stays mounted through its own exit (the same "leaving" idiom Split/PanelStack use)
 *  so the fade is visible. */
/** `channel` unset = Listing base: the Base's photos, no switcher (PhotosManager baseOnly). */
export function PhotosFullTakeover(p: { open: boolean; onClose: () => void; channel?: ListingChannel }) {
  return useIsMobile() ? <PhotosSheet {...p} /> : <PhotosTakeover {...p} />
}

/** Phones: Manage photos is a full-screen bottom sheet (ds/mobile.md §7, Antonio 5 Oct: every side panel is a sheet),
 *  not a takeover with its own bar. Its close × goes through PhotosManager's dirty check like the desktop back / ×.
 *  The shell's dock (Discard / Save, Cancel / Save order, the selection bar) is lifted above the sheet and the sheet
 *  stops at its top edge (ds/v3/m-drawers.css); sheets opened from inside (Edit photo, Add photos, the unsaved
 *  confirm) replace it while they are open, so there is never a sheet on a sheet. */
function PhotosSheet({ open, onClose, channel }: { open: boolean; onClose: () => void; channel?: ListingChannel }) {
  const photosRef = useRef<PhotosManagerHandle>(null)
  const guardedClose = () => { if (photosRef.current) photosRef.current.requestClose(); else onClose() }
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    let ro: ResizeObserver | null = null
    // the dock mounts with the shell, but its height changes as the action bar appears: track it
    const dock = document.querySelector<HTMLElement>('.h-m-dock')
    if (dock) {
      ro = new ResizeObserver(() => root.style.setProperty('--photos-dock-h', `${dock.offsetHeight}px`))
      ro.observe(dock)
      root.style.setProperty('--photos-dock-h', `${dock.offsetHeight}px`)
    }
    return () => { ro?.disconnect(); root.style.removeProperty('--photos-dock-h') }
  }, [open])
  return (
    <BottomSheet open={open} fullScreen className="h-m-sheet--photos" title="Manage photos" onClose={guardedClose}>
      <PhotosManager head={false} titled channel={channel} baseOnly={!channel} onBack={onClose} ref={photosRef} />
    </BottomSheet>
  )
}

function PhotosTakeover({ open, onClose, channel }: { open: boolean; onClose: () => void; channel?: ListingChannel }) {
  const photosRef = useRef<PhotosManagerHandle>(null)
  const [mounted, setMounted] = useState(open)
  const [leaving, setLeaving] = useState(false)
  // "adjusting state during render" (React's own sanctioned pattern — the exact idiom Split/PanelStack already use,
  // ds/sl3.tsx's Split and ds/panels.tsx's PanelStack): a plain ref mutated in the render body looks equivalent but
  // is impure, and silently breaks under StrictMode's dev-only double-render (the throwaway first pass mutates the
  // ref, so the real committed pass sees no change and never calls setMounted) — confirmed live, that's why this
  // uses useState for `prevOpen` instead.
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) { setMounted(true); setLeaving(false) } else setLeaving(true)
  }
  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => { setMounted(false); setLeaving(false) }, TAKEOVER_EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving])
  // every close trigger (back, ×, Escape) asks PhotosManager first — it already knows whether the draft is dirty
  const guardedClose = () => { if (photosRef.current) photosRef.current.requestClose(); else onClose() }
  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') guardedClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }) // no dep array: always closes over the latest guardedClose, same convention as PanelStack's own Escape handler
  // Phones: the page's Discard / Save (and Re-order's Cancel / Save order) live in the shell's sticky action bar
  // (.h-m-dock, ds/mobile.md §6), which this full-viewport overlay would cover. While it is open the dock is lifted
  // above it (tab bar hidden, ds/v3/ch.css) and the overlay stops at the dock's top edge, tracked as the bar appears.
  const mobile = useIsMobile()
  const [dockH, setDockH] = useState(0)
  useEffect(() => {
    if (!mounted || !mobile) { setDockH(0); return }
    const dock = document.querySelector<HTMLElement>('.h-m-dock')
    if (!dock) return
    const ro = new ResizeObserver(() => setDockH(dock.offsetHeight))
    ro.observe(dock)
    setDockH(dock.offsetHeight)
    return () => ro.disconnect()
  }, [mounted, mobile])
  if (!mounted) return null
  return createPortal(
    <div className={cx('h-photos-takeover', leaving && 'is-leaving')} role="dialog" aria-modal="true" aria-label="Manage photos"
      style={mobile ? { bottom: dockH } : undefined}>
      <header className="h-photos-takeover__bar">
        <button type="button" className="h-photos-takeover__btn" aria-label={channel ? `Back to the ${PHOTO_CH_NAME[channel]} listing` : 'Back to Listing details'} title={channel ? `Back to the ${PHOTO_CH_NAME[channel]} listing` : 'Back to Listing details'} onClick={guardedClose}><Icon name="chevron-left" /></button>
        <p className="h-photos-takeover__title">Manage photos</p>
        <CloseButton size="lg" title="Close" onClick={guardedClose} />
      </header>
      <div className="h-photos-takeover__body h-split__main h-scroll-thin">
        <div className="h-photos-takeover__inner">
          <PhotosManager head={false} titled channel={channel} baseOnly={!channel} onBack={onClose} ref={photosRef} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Pattern B — a PanelStack drawer (D-927's existing drill-down slide, ds/panels.tsx), reused as-is rather than
 *  rebuilt: one level, "Manage photos", widened past its usual narrow rail (`.ch-photos-pstack`, ds/v3/ch.css) so a
 *  photo grid has room, sliding in over the Essentials column — which stays mounted and visible (narrowed), not
 *  dimmed away — and sliding back out to restore it exactly. PanelStack already claims the single shared side-panel
 *  slot (useExclusivePanel('pstack', …) inside panels.tsx itself), so opening this automatically force-closes Tips
 *  the same way Pricing/Canvas's own drill-downs already do — no new conflict logic needed here. */
export function PhotosDrawerHost({ open, onClose, main, panel, channel }: { open: boolean; onClose: () => void; main: ReactNode; panel?: ReactNode; channel: ListingChannel }) {
  const photosRef = useRef<PhotosManagerHandle>(null)
  const guardedClose = () => { if (photosRef.current) photosRef.current.requestClose(); else onClose() }
  const panels: StackPanel[] = open
    ? [{ id: 'manage-photos', title: 'Manage photos', content: <PhotosManager head={false} channel={channel} onBack={onClose} ref={photosRef} /> }]
    : []
  return (
    <Split main={
      <PanelStack className="ch-photos-pstack" label="Photos" rootTitle="Essentials" panels={panels} onBack={guardedClose} onClose={guardedClose} main={main} />
    } panel={panel} />
  )
}
