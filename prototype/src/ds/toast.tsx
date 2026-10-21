/* Toast (review, 3 Oct: "They should appear below, centred to the area where that reference is (the content section,
 * e.g. the Strategy section), and fade away after a few seconds."). The one toast every screen uses: SlConfirm, KhToast
 * and the demo persona toast are thin wrappers over it.
 *
 * - Position: fixed at the bottom of the content column the toast is rendered in (`.h-split__main` / `.h-content`, never
 *   the viewport with the sidebar), centred on that column, 24px up. When the column's sticky Discard / Save bar is
 *   showing, it stacks 12px above the bar. Phones: full width minus the gutters, above the bottom dock (tab bar plus the
 *   sticky action bar when there is one). Measured, not guessed: the toast drops a hidden anchor where it's rendered,
 *   finds that anchor's column and keeps the layer on it while it's up (resizes, panels opening, the bar appearing).
 * - Motion: rises and fades in (--dur-3 / --ease-emphasized), leaves with a fade (--ease-exit) after `duration`
 *   (5 s default). Hover or focus pauses the timer. Reduced motion: the tokens drop the distance and shorten the durations.
 * - Undo and × keep working; `role="status"` + `aria-live="polite"`.
 * - `title` makes it two lines (4 Oct, the save toast): "Changes saved" over "3 changes · sent to Airbnb and Booking.com".
 * CSS: ds/components.css "TOAST". Tokens only. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseButton, Icon, cx } from './primitives'

const COLUMN = '.h-split__main, .h-content'
const GAP = 24 // from the column's bottom edge
const GAP_BAR = 12 // above the sticky Discard / Save bar or the phone dock
const PHONE = '(max-width: 767px)'

interface Place { left: number; width: number; bottom: number; phone: boolean }
const same = (a: Place | null, b: Place) => !!a && a.left === b.left && a.width === b.width && a.bottom === b.bottom && a.phone === b.phone

function measure(anchor: HTMLElement | null): Place {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (window.matchMedia(PHONE).matches) {
    const dock = document.querySelector<HTMLElement>('.h-m-dock')
    const r = dock?.getBoundingClientRect()
    const top = r && r.height > 0 ? r.top : vh
    return { left: 0, width: vw, bottom: Math.round(vh - top + GAP_BAR), phone: true }
  }
  const col = (anchor?.closest(COLUMN) ?? document.querySelector(COLUMN)) as HTMLElement | null
  if (!col) return { left: 0, width: vw, bottom: GAP, phone: false }
  const r = col.getBoundingClientRect()
  const left = Math.max(0, r.left)
  const right = Math.min(vw, r.right)
  const edge = Math.min(vh, r.bottom)
  let bottom = vh - edge + GAP
  // the sticky Discard / Save bar: stack above it when it sits where the toast would be (on a short page it sits
  // under the content, higher up, and the toast stays at the column's bottom)
  const bar = col.querySelector<HTMLElement>('.h-unsaved-bar')
  if (bar) {
    const b = bar.getBoundingClientRect()
    if (b.height > 0 && b.top < edge && b.bottom > edge - GAP - 72) bottom = Math.max(bottom, vh - b.top + GAP_BAR)
  }
  return { left: Math.round(left), width: Math.round(right - left), bottom: Math.round(bottom), phone: false }
}

export interface ToastProps {
  children?: ReactNode
  /** Called when the toast is done: after its timer and fade, or on ×. Without it the toast hides itself. */
  onClose?: () => void
  /** Adds an "Undo" action. */
  onUndo?: () => void
  /** Show the × button (default: when `onClose` is given). */
  closable?: boolean
  /** Leading icon; `null` for none. */
  icon?: string | null
  /** ms before it fades away. */
  duration?: number
  /** `mode`: the demo persona toast (grape surface, room for a list). */
  tone?: 'default' | 'mode'
  /** Two lines: a bold confirmation ("Changes saved") over `children` as the quieter summary line. */
  title?: ReactNode
  /** Phones in app mode: stay at the bottom, over the dock, instead of the app's top toasts (a save with Undo sits where
   *  the Save button just was, in thumb reach). */
  dock?: boolean
}

export function Toast({ children, onClose, onUndo, closable, icon = 'circle-check', duration = 5000, tone = 'default', title, dock }: ToastProps) {
  const anchor = useRef<HTMLSpanElement>(null)
  const [place, setPlace] = useState<Place | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const done = useRef(onClose)
  done.current = onClose
  const close = () => { if (done.current) done.current(); else setGone(true) }

  // keep the layer on its column while it's up
  useLayoutEffect(() => {
    let raf = 0
    let last: Place | null = null
    const tick = () => {
      const p = measure(anchor.current)
      if (!same(last, p)) { last = p; setPlace(p) }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  // auto-dismiss; hover / focus pauses it
  const paused = useRef(false)
  const left = useRef(duration)
  const started = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const run = () => {
    window.clearTimeout(timer.current)
    started.current = Date.now()
    timer.current = window.setTimeout(() => setLeaving(true), left.current)
  }
  const pause = () => {
    if (paused.current) return
    paused.current = true
    window.clearTimeout(timer.current)
    left.current = Math.max(800, left.current - (Date.now() - started.current))
  }
  const resume = () => { if (!paused.current) return; paused.current = false; run() }
  useEffect(() => { run(); return () => window.clearTimeout(timer.current) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // the fade-out ends the toast; a fallback in case the animation never runs (hidden tab)
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(close, 700)
    return () => window.clearTimeout(t)
  }, [leaving]) // eslint-disable-line react-hooks/exhaustive-deps

  const showClose = closable ?? !!onClose
  return (
    <>
      <span ref={anchor} hidden />
      {!gone && place && createPortal(
        <div className={cx('h-toast-layer', place.phone && 'is-phone', dock && 'is-dock', leaving && 'is-leaving')}
          style={{ left: place.left, width: place.width, bottom: place.bottom }}
          // phones: no hover to pause on (a tap would pause it for good); a tap anywhere but its buttons dismisses it
          onMouseEnter={place.phone ? undefined : pause} onMouseLeave={place.phone ? undefined : resume} onFocus={pause} onBlur={resume}
          onClick={place.phone ? (e) => { if (!(e.target as Element).closest('button, a')) setLeaving(true) } : undefined}>
          <div className={cx('h-toast', tone === 'mode' && 'h-toast--mode', title != null && 'h-toast--two')} role="status" aria-live="polite"
            onAnimationEnd={(e) => { if (leaving && e.target === e.currentTarget) close() }}>
            {icon && <Icon name={icon} />}
            {title != null
              ? <span className="h-toast__body"><span className="h-toast__title">{title}</span>{children != null && children !== '' && <span className="h-toast__meta">{children}</span>}</span>
              : children}
            {onUndo && <button type="button" className="h-toast__action" onClick={onUndo}>Undo</button>}
            {showClose && <CloseButton size="sm" onDark className="h-toast__close" onClick={close} />}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
