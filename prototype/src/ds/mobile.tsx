/* Mobile (≤ 767px) primitives, replicating Hospitable's real mobile web app (Antonio's iPhone captures, 30 Sep).
 * Spec: ds/mobile.md (breakpoint, shell anatomy, when to use a sheet, a page or a drawer).
 * CSS: ds/components.css, section "MOBILE". Tokens: ds/tokens.css "MOBILE" (--m-*). One breakpoint, one query. */
import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CloseButton, Icon, cx } from './primitives'
import { APP_MODE } from '../app/mode'

/* ---------- breakpoint ---------- */
/** The only mobile breakpoint. CSS uses the same literal: @media (max-width: 767px). */
export const MOBILE_QUERY = '(max-width: 767px)'
/** The shell's tablet step (ds/mobile.md §3b): 768–1023px. Only the SHELL changes here (icon-only sidebar, the property
 *  rail as a slide-over behind the section bar); pages keep their desktop layout. CSS uses the same literals. */
export const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'
function mediaQuery(query: string) {
  const mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null
  return { subscribe: (cb: () => void) => { mql?.addEventListener('change', cb); return () => mql?.removeEventListener('change', cb) }, get: () => !!mql?.matches }
}
/** Narrow desktop (1024–1180, e.g. a 1024 × 768 landscape tablet): property pages fold the global sidebar to its icon
 *  rail, the way Canvas does, so the page keeps room beside both rails (web audit W-09). CSS uses the same literals. */
export const NARROW_DESKTOP_QUERY = '(min-width: 1024px) and (max-width: 1180px)'
const mobileMq = mediaQuery(MOBILE_QUERY)
const tabletMq = mediaQuery(TABLET_QUERY)
const narrowMq = mediaQuery(NARROW_DESKTOP_QUERY)
// App mode (APP-MODE.md) is always the phone: the layer is forced on whatever the viewport says
if (APP_MODE) { mobileMq.get = () => true; tabletMq.get = () => false; narrowMq.get = () => false }
/** True at phone width. Prefer CSS; use this only where JS must branch (portals, registering the action bar). */
export function useIsMobile(): boolean {
  return useSyncExternalStore(mobileMq.subscribe, mobileMq.get, () => false)
}
/** True at tablet width (768–1023). Shell only (AppShell, PropertyLayout); screens don't branch on it. */
export function useIsTablet(): boolean {
  return useSyncExternalStore(tabletMq.subscribe, tabletMq.get, () => false)
}

/** True at 1024–1180 (shell only: the Sidebar folds itself on property pages). */
export function useIsNarrowDesktop(): boolean {
  return useSyncExternalStore(narrowMq.subscribe, narrowMq.get, () => false)
}

/* ---------- inside a sheet? (a field row inside a sheet edits in place: never a sheet in a sheet, ds/mobile.md §7) ---------- */
const InSheetContext = createContext(false)
export const InSheetProvider = InSheetContext.Provider
export const useInSheet = () => useContext(InSheetContext)

/* ---------- shell context: what the page title opens (the property's Sections sheet) ---------- */
export interface MobileShell { openPropertyMenu?: () => void }
const MobileShellContext = createContext<MobileShell>({})
export const MobileShellProvider = MobileShellContext.Provider
export const useMobileShell = () => useContext(MobileShellContext)

/* ---------- presence + dialog behaviour (shared by drawer, sheet, toast) ---------- */
const EXIT_MS = 200 // --dur-2: exits are one step shorter than entrances (motion.md principle 3)
function usePresence(open: boolean) {
  const [shown, setShown] = useState(open)
  useEffect(() => {
    if (open) { setShown(true); return }
    const t = setTimeout(() => setShown(false), EXIT_MS)
    return () => clearTimeout(t)
  }, [open])
  return { mounted: open || shown, leaving: !open && shown }
}
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
/** Focus moves into the dialog, Tab stays inside it, Esc closes it, focus returns to the opener on close. */
function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      const el = ref.current
      if (!el) return
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); return }
      if (e.key !== 'Tab') return
      const f = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null)
      if (!f.length) { e.preventDefault(); return }
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('keydown', onKey, true); opener?.focus?.({ preventScroll: true }) }
  }, [open, ref])
}

/* Hospitable's "···": three small hollow circles in raspberry (images/33). Drawn here: Tabler's `dots` is filled. */
const Dots = () => (
  <svg className="h-m-more__dots" viewBox="0 0 24 8" aria-hidden="true">
    <circle cx="4" cy="4" r="2.6" /><circle cx="12" cy="4" r="2.6" /><circle cx="20" cy="4" r="2.6" />
  </svg>
)
/** The page head's "···" (hidden above 767px). */
export function MobileMoreButton({ onClick, label = 'Property menu', expanded }: { onClick: () => void; label?: string; expanded?: boolean }) {
  return <button type="button" className="h-m-more" aria-label={label} aria-haspopup="dialog" aria-expanded={expanded} onClick={onClick}><Dots /></button>
}
/** "···" wired to the shell: opens the property drawer. Renders nothing outside a property (no provider). */
export function PropertyMenuButton() {
  const { openPropertyMenu } = useMobileShell()
  return openPropertyMenu ? <MobileMoreButton onClick={openPropertyMenu} /> : null
}

/* ---------- MobilePageHead ---------- */
/** Title row for screens that don't use PageHead / PageHeader: large title left, "···" right, switcher underneath.
 *  (PageHead and PageHeader already become this at ≤ 767px through CSS; see ds/mobile.md §4.) */
export function MobilePageHead({ title, switcher, onMore, moreLabel }: { title: ReactNode; switcher?: ReactNode; onMore?: () => void; moreLabel?: string }) {
  const shell = useMobileShell()
  const more = onMore ?? shell.openPropertyMenu
  return (
    <header className="h-m-pagehead">
      <div className="h-m-pagehead__row">
        <h1 className="h-m-pagehead__title">{title}</h1>
        {more && <MobileMoreButton onClick={more} label={moreLabel} />}
      </div>
      {switcher && <div className="h-m-pagehead__switcher">{switcher}</div>}
    </header>
  )
}

/* ---------- MobileSectionBar ---------- */
/** Phones only (ds/mobile.md §3a): the bar under the shell's top edge that names where you are in the property
 *  ("Airbnb › Listing") and opens every section of it in a bottom sheet. The whole bar is the button (52 tall, full
 *  width, thumb-sized); `icon` = the section's icon or the channel's mark. */
export function MobileSectionBar({ icon, group, label, onOpen, expanded }: { icon?: ReactNode; group?: string; label: string; onOpen: () => void; expanded?: boolean }) {
  return (
    <div className="h-m-sectionbar">
      <button type="button" className="h-m-sectionbar__btn" aria-haspopup="dialog" aria-expanded={expanded} onClick={onOpen}
        aria-label={`Section: ${group ? `${group}, ` : ''}${label}. Show all sections`}>
        {icon && <span className="h-m-sectionbar__icon" aria-hidden="true">{icon}</span>}
        <span className="h-m-sectionbar__path" aria-hidden="true">
          {group && <><span className="h-m-sectionbar__group">{group}</span><Icon name="chevron-right" size={16} className="h-m-sectionbar__sep" /></>}
          <span className="h-m-sectionbar__label">{label}</span>
        </span>
        <span className="h-m-sectionbar__cue" aria-hidden="true">Sections<Icon name="chevron-down" size={16} /></span>
      </button>
    </div>
  )
}

/* ---------- MobileTabBar ---------- */
export interface MobileTab { key: string; label: string; icon: string | ReactNode; to?: string; onClick?: () => void; expanded?: boolean
  /** shown but does nothing (a part the case study doesn't rebuild) */
  inert?: boolean }
/** Bottom tab bar (images/43): icon + label; active = raspberry icon on a light-pink pill + raspberry label. */
export function MobileTabBar({ items, active }: { items: MobileTab[]; active?: string | null }) {
  return (
    <nav className="h-m-tabbar" aria-label="Main">
      {items.map((t) => {
        const inner = <><span className="h-m-tabbar__icon">{typeof t.icon === 'string' ? <Icon name={t.icon} size={24} /> : t.icon}</span><span className="h-m-tabbar__label">{t.label}</span></>
        const current = t.key === active ? 'page' : undefined
        if (t.inert) return <span key={t.key} className="h-m-tabbar__item is-inert" aria-disabled="true">{inner}</span>
        return t.to
          ? <Link key={t.key} to={t.to} className="h-m-tabbar__item" aria-current={current}>{inner}</Link>
          : <button key={t.key} type="button" className="h-m-tabbar__item" aria-current={current} aria-haspopup="dialog" aria-expanded={t.expanded} onClick={t.onClick}>{inner}</button>
      })}
    </nav>
  )
}

/* ---------- MobileDrawer ---------- */
/** Right-side drawer over a dimmed page, stopping at the tab bar (images/36). Esc, the backdrop and the × close it;
 *  following any link inside closes it too. `overTabBar={false}` covers the full height (flows outside the shell). */
export function MobileDrawer({ open, onClose, title, label, children, overTabBar = true }: {
  open: boolean; onClose: () => void; title: ReactNode; label?: string; children: ReactNode; overTabBar?: boolean
}) {
  const { mounted, leaving } = usePresence(open)
  const ref = useRef<HTMLDivElement>(null)
  useDialog(ref, open, onClose)
  if (!mounted) return null
  return createPortal(
    <div className={cx('h-m-layer', overTabBar && 'h-m-layer--above-tabbar', leaving && 'is-leaving')}>
      <div className="h-m-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="h-m-drawer" role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)} tabIndex={-1}>
        <div className="h-m-drawer__head">
          <h2 className="h-m-drawer__title">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        <div className="h-m-drawer__body" onClick={(e) => { if ((e.target as Element).closest('a[href]')) onClose() }}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/* ---------- BottomSheet ---------- */
/** Bottom sheet: drag handle (drag down to close), max-height 90dvh, the body scrolls inside, backdrop.
 *  `fullScreen` = a full-height page with title and × for complex edits (ds/mobile.md §6). Above 767px it sits
 *  centred at the bottom, 560px wide, so a screen can use one component at every width. */
export function BottomSheet({ open, title, onClose, fullScreen, footer, children, label, className, navigation, pageSave }: {
  open: boolean; title: ReactNode; onClose: () => void; fullScreen?: boolean; footer?: ReactNode; children: ReactNode; label?: string
  className?: string
  /** No `footer`: the page's registered Discard / Save (useMobileActions) as the footer, while there are unsaved
   *  changes; either button also closes the sheet (the field sheet, ds/mobile.md §7). */
  pageSave?: boolean
  /** A navigation sheet (the property's sections): following any link inside closes it, like the drawer. */
  navigation?: boolean
}) {
  const { mounted, leaving } = usePresence(open)
  const ref = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ y0: number; dy: number } | null>(null)
  useDialog(ref, open, onClose)
  // App mode (APP-MODE.md): a physical drag. Up resists (rubber band), a release past 30% of the sheet or a downward
  // flick (> 0.5 px/ms) dismisses it from where the finger left it, anything else springs back; the body drags the
  // sheet too once it's scrolled to the top. Outside app mode the drag is unchanged (grip / head, 96px threshold).
  const physical = APP_MODE && !fullScreen
  const [released, setReleased] = useState<number | null>(null)
  const samples = useRef<Array<{ y: number; t: number }>>([])
  const dragRef = useRef(drag)
  dragRef.current = drag
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => { if (open) setReleased(null) }, [open])
  const follow = (y0: number, y: number, t: number) => {
    const raw = y - y0
    const dy = !physical ? Math.max(0, raw) : raw >= 0 ? raw : -(1 - 1 / (1 + -raw / 160)) * 48
    samples.current = [...samples.current.slice(-5), { y, t }]
    setDrag({ y0, dy })
  }
  const release = () => {
    const d = dragRef.current
    setDrag(null)
    if (!d) return
    if (!physical) { if (d.dy > 96) closeRef.current(); return }
    const h = ref.current?.offsetHeight ?? 600
    const a = samples.current[0], b = samples.current[samples.current.length - 1]
    const v = a && b && b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0
    if (d.dy > h * 0.3 || (v > 0.5 && d.dy > 16)) { setReleased(d.dy); closeRef.current() }
  }
  // the body: touch only (a mouse scrolls with its wheel), and only from the top of its scroll
  useEffect(() => {
    if (!physical || !mounted) return
    const body = ref.current?.querySelector<HTMLElement>('.h-m-sheet__body')
    if (!body) return
    let y0: number | null = null
    const start = (e: TouchEvent) => { y0 = body.scrollTop <= 0 ? e.touches[0].clientY : null; samples.current = [] }
    const move = (e: TouchEvent) => {
      if (y0 == null) return
      const y = e.touches[0].clientY
      if (y - y0 > 0 && body.scrollTop <= 0) { e.preventDefault(); follow(y0, y, e.timeStamp) }
      else if (!dragRef.current) y0 = null // scrolling the content instead
    }
    const end = () => { if (y0 != null) release(); y0 = null }
    body.addEventListener('touchstart', start, { passive: true })
    body.addEventListener('touchmove', move, { passive: false })
    body.addEventListener('touchend', end)
    body.addEventListener('touchcancel', end)
    return () => { body.removeEventListener('touchstart', start); body.removeEventListener('touchmove', move); body.removeEventListener('touchend', end); body.removeEventListener('touchcancel', end) }
  }, [physical, mounted]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!mounted) return null
  const grab = fullScreen ? {} : {
    onPointerDown: (e: RPointerEvent) => { if ((e.target as Element).closest('button')) return; (e.currentTarget as Element).setPointerCapture(e.pointerId); samples.current = [{ y: e.clientY, t: e.timeStamp }]; setDrag({ y0: e.clientY, dy: 0 }) },
    onPointerMove: (e: RPointerEvent) => { if (drag) follow(drag.y0, e.clientY, e.timeStamp) },
    onPointerUp: release,
    onPointerCancel: () => setDrag(null),
  }
  const offset = drag?.dy || (leaving && released) || 0
  const h = ref.current?.offsetHeight || 1
  return createPortal(
    <div className={cx('h-m-layer', leaving && 'is-leaving')} style={physical && offset > 0 ? { ['--app-sheet-p' as string]: Math.min(1, offset / h) } : undefined}>
      <div className="h-m-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={cx('h-m-sheet', fullScreen && 'h-m-sheet--full', drag && 'is-dragging', className)} role="dialog" aria-modal="true"
        aria-label={label ?? (typeof title === 'string' ? title : undefined)} tabIndex={-1}
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}>
        {!fullScreen && <div className="h-m-sheet__grip" {...grab}><span /></div>}
        <div className="h-m-sheet__head" {...grab}>
          <h2 className="h-m-sheet__title">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        <div className="h-m-sheet__body" onClick={navigation ? (e) => { if ((e.target as Element).closest('a[href]')) onClose() } : undefined}><InSheetProvider value>{children}</InSheetProvider></div>
        {footer ? <div className="h-m-sheet__foot">{footer}</div> : pageSave ? <MobileSheetSaveButtons onDone={onClose} /> : null}
      </div>
    </div>,
    document.body,
  )
}

/* ---------- TopToast ---------- */
/** Yellow toast pinned to the top with a raspberry Dismiss (images/45): validation the host must read. */
export function TopToast({ open, message, onDismiss, dismissLabel = 'Dismiss' }: { open: boolean; message: ReactNode; onDismiss: () => void; dismissLabel?: string }) {
  const { mounted, leaving } = usePresence(open)
  if (!mounted) return null
  return createPortal(
    <div className={cx('h-m-toast', leaving && 'is-leaving')} role="alert">
      <div className="h-m-toast__msg">{message}</div>
      <button type="button" className="h-m-toast__dismiss" onClick={onDismiss}>{dismissLabel}</button>
    </div>,
    document.body,
  )
}

/* ---------- ScrollTabs ---------- */
/** Scrolls a tab rail so its active tab ([aria-selected="true"]) is fully visible. No-op when nothing overflows. */
export function scrollActiveTab(rail: HTMLElement | null) {
  if (!rail || rail.scrollWidth <= rail.clientWidth) return
  const tab = rail.querySelector<HTMLElement>('[aria-selected="true"]')
  if (!tab) return
  const r = rail.getBoundingClientRect(), t = tab.getBoundingClientRect(), pad = 16
  if (t.left < r.left) rail.scrollLeft += t.left - r.left - pad
  else if (t.right > r.right) rail.scrollLeft += t.right - r.right + pad
}
/** Keeps the active tab of `ref`'s rail in view after every render. */
export function useActiveTabIntoView(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => scrollActiveTab(ref.current))
}
/** Underline tabs that scroll horizontally on phones (the last tab is cut at the edge, like "Security d…"; no
 *  scrollbar), with the active tab scrolled into view. Every `.h-tabs` scrolls at ≤ 767px through CSS alone. */
export function ScrollTabs({ children, label }: { children: ReactNode; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useActiveTabIntoView(ref)
  return <div ref={ref} className="h-tabs h-m-scrolltabs" role="tablist" aria-label={label}>{children}</div>
}

/* ---------- sticky action bar ---------- */
type SaveEntry = { id: string; kind: 'save'; dirty: boolean; discardLabel: string; saveLabel: string; onDiscard: () => void; onSave: () => unknown }
type Entry = { id: string; kind: 'portal' } | SaveEntry
let stack: Entry[] = []
let target: HTMLElement | null = null
let slots = 0
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const bar = {
  subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f) } },
  put(e: Entry) { const i = stack.findIndex((x) => x.id === e.id); stack = i < 0 ? [...stack, e] : stack.map((x) => (x.id === e.id ? e : x)); emit() },
  remove(id: string) { stack = stack.filter((x) => x.id !== id); emit() },
  top: () => stack[stack.length - 1] ?? null,
  target: () => target,
  slots: () => slots,
}

/** The standard pair: Discard + Save, 50/50, 48 tall. Clean = both disabled (Discard grey fill, Save grey outline);
 *  dirty = Discard white with border, Save raspberry (images/32, 45). */
export function MobileSaveButtons({ dirty, onDiscard, onSave, discardLabel = 'Discard', saveLabel = 'Save' }: {
  dirty: boolean; onDiscard: () => void; onSave: () => unknown; discardLabel?: string; saveLabel?: string
}) {
  return (
    <>
      <button type="button" className="h-btn h-btn--secondary h-m-actionbar__btn" disabled={!dirty} onClick={onDiscard}>{discardLabel}</button>
      <button type="button" className="h-btn h-btn--primary h-m-actionbar__btn" disabled={!dirty} onClick={onSave}>{saveLabel}</button>
    </>
  )
}

/** The shell's slot, above the tab bar. AppShell mounts one; a full-page flow outside the shell may mount its own
 *  at the bottom of its layout. Hidden while nothing is registered. */
export function MobileActionSlot() {
  const top = useSyncExternalStore(bar.subscribe, bar.top, () => null)
  useLayoutEffect(() => { slots++; emit(); return () => { slots--; emit() } }, [])
  const ref = (el: HTMLDivElement | null) => { if (target !== el) { target = el; emit() } }
  // onSave may return a confirmation ("Saved · sent to Airbnb"): show it briefly above the bar, like desktop's quiet
  // "Saved". onDiscard flashes the same way (Antonio, 1 Oct evening: discarding needs to read as clearly as saving
  // does) when it returns a string ('Discarded', the shared bar's own convention — ds/unsaved.tsx's useMobileActions call).
  const [flash, setFlash] = useState<string | null>(null)
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 2400); return () => clearTimeout(t) }, [flash])
  const save = (e: SaveEntry) => () => { const r = e.onSave(); if (typeof r === 'string' && r) setFlash(r) }
  const discard = (e: SaveEntry) => () => { const r = e.onDiscard(); if (typeof r === 'string' && r) setFlash(r) }
  // Antonio, 4 Oct: the bar shows only while there is something to act on — unsaved changes (a dirty Discard / Save)
  // or a page's own content (photo selection, Re-order) — and then it REPLACES the tab bar (ds/components.css: the dock
  // hides the tab bar while the bar is shown; the bar carries the safe area). A clean pair shows nothing.
  const shown = !!top && (top.kind === 'portal' || top.dirty)
  return (
    <>
      <div className={cx('h-m-actionbar__flash', flash && 'is-on')} role="status" aria-live="polite">{flash && <><Icon name="circle-check" size={16} />{flash}</>}</div>
      <div className={cx('h-m-actionbar', !shown && 'is-empty')} role={shown ? 'region' : undefined} aria-label={shown ? 'Page actions' : undefined}>
        {top?.kind === 'save' && top.dirty && <MobileSaveButtons {...top} onDiscard={discard(top)} onSave={save(top)} />}
        <div ref={ref} className="h-m-actionbar__target" />
      </div>
    </>
  )
}

/** Renders its children in the sticky bar above the tab bar (a portal into the shell slot), on phones only.
 *  Several mounted at once: the last one mounted wins. Outside the shell (no slot) it renders in place, sticky. */
export function MobileActionBar({ children }: { children: ReactNode }) {
  const id = useId()
  const isMobile = useIsMobile()
  const top = useSyncExternalStore(bar.subscribe, bar.top, () => null)
  const tgt = useSyncExternalStore(bar.subscribe, bar.target, () => null)
  const hasSlot = useSyncExternalStore(bar.subscribe, bar.slots, () => 0) > 0
  useLayoutEffect(() => {
    if (!isMobile) return
    bar.put({ id, kind: 'portal' })
    return () => bar.remove(id)
  }, [isMobile, id])
  if (!isMobile) return null
  if (!hasSlot) return <div className="h-m-actionbar h-m-actionbar--inline">{children}</div>
  return top?.id === id && tgt ? createPortal(children, tgt) : null
}
/** The page's registered Discard / Save pair (useMobileActions), for a sheet that covers the shell's bar: PanelStack's
 *  phone sheet renders it in its own footer so the actions stay in reach (ds/mobile.md §7). Null when nothing is
 *  registered or the top entry is custom content (MobileActionBar), which stays in the shell's bar. */
export function MobileSheetSaveButtons({ className, onDone }: { className?: string; /** after Discard or Save (e.g. close the sheet) */ onDone?: () => void }) {
  const top = useSyncExternalStore(bar.subscribe, bar.top, () => null)
  if (top?.kind !== 'save' || !top.dirty) return null
  return <div className={cx('h-m-sheet__foot', className)}><MobileSaveButtons dirty={top.dirty} discardLabel={top.discardLabel} saveLabel={top.saveLabel}
    onDiscard={() => { top.onDiscard(); onDone?.() }} onSave={async () => { const r = await top.onSave(); if (r !== false) onDone?.() }} /></div>
}
/** Alias: the brief's name for MobileActionBar. */
export const StickyActionBar = MobileActionBar

/** Registers the standard Discard / Save pair into the shell's sticky bar while ≤ 767px matches; unregisters on
 *  unmount. Pass null to register nothing (e.g. a read-only section). Callbacks may change every render. */
export function useMobileActions(o: { dirty: boolean; onDiscard: () => void; onSave: () => unknown; discardLabel?: string; saveLabel?: string } | null) {
  const id = useId()
  const isMobile = useIsMobile()
  const cb = useRef(o)
  cb.current = o
  const on = isMobile && !!o
  const dirty = !!o?.dirty, dl = o?.discardLabel ?? 'Discard', sl = o?.saveLabel ?? 'Save'
  useLayoutEffect(() => {
    if (!on) return
    bar.put({ id, kind: 'save', dirty, discardLabel: dl, saveLabel: sl, onDiscard: () => cb.current?.onDiscard(), onSave: () => cb.current?.onSave() })
  }, [on, id, dirty, dl, sl])
  useLayoutEffect(() => (on ? () => bar.remove(id) : undefined), [on, id])
}
