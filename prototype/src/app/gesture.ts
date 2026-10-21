/* App mode · iOS edge swipe back (ds/mobile.md "App mode" §A4).
 * A 16px strip on the left edge (the content gutter, so it covers nothing tappable) catches the drag. The page follows
 * the finger; underneath, the previous page (its DOM snapshot from nav.ts) drifts in from −30% and brightens. Release
 * past a third of the width, or flick faster than 0.5 px/ms, and it completes and goes back; otherwise it springs back.
 * A tap on the strip passes through to whatever is under it. Disabled while a sheet is open, and when there's no back. */
import { appPath, openDrill, pageEl, previousSnapshot, setNav, skipNextTransition, type AppRouter } from './nav'

const PARALLAX = 0.3
/** After the next paint (two frames), or 120ms when frames are throttled (a hidden tab). Runs once. */
function afterPaint(fn: () => void) {
  let done = false
  const run = () => { if (!done) { done = true; fn() } }
  requestAnimationFrame(() => requestAnimationFrame(run))
  setTimeout(run, 120)
}

export function installSwipeBack(router: AppRouter) {
  const strip = document.createElement('div')
  strip.className = 'app-edge'
  strip.setAttribute('aria-hidden', 'true')
  document.body.appendChild(strip)

  let start: { x: number; y: number; id: number } | null = null
  let engaged = false
  let page: HTMLElement | null = null
  let under: HTMLElement | null = null
  let width = 1
  let samples: Array<{ x: number; t: number }> = []

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canGoBack = () => !!openDrill() || ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0

  function engage() {
    page = pageEl()
    if (!page) return false
    width = page.offsetWidth
    const r = page.getBoundingClientRect()
    under = document.createElement('div')
    under.className = 'app-underlay'
    // right under the moving page: z 1 under the shell's column (which goes to 2), one below a fixed takeover's own z
    const fixed = getComputedStyle(page).position === 'fixed'
    const z = fixed ? (parseInt(getComputedStyle(page).zIndex, 10) || 2) - 1 : 1
    Object.assign(under.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: String(z) })
    const snap = previousSnapshot()
    if (snap) {
      under.appendChild(snap.node)
      const all = snap.node.querySelectorAll('*')
      snap.scroll.forEach(([i, top]) => { const n = all[i] as HTMLElement | undefined; if (n) n.scrollTop = top })
    }
    page.parentElement?.insertBefore(under, page)
    page.classList.add('is-swiping')
    document.documentElement.classList.add('is-swiping-back')
    return true
  }
  function render(dx: number) {
    const p = Math.min(1, Math.max(0, dx / width))
    if (page) page.style.transform = `translate3d(${dx}px,0,0)`
    if (under) { under.style.transform = `translate3d(${-PARALLAX * width * (1 - p)}px,0,0)`; under.style.setProperty('--app-swipe-p', String(p)) }
  }
  function cleanup() {
    if (page) { page.classList.remove('is-swiping', 'is-settling'); page.style.transform = '' }
    under?.remove()
    document.documentElement.classList.remove('is-swiping-back')
    page = under = null
    engaged = false
  }
  function settle(commit: boolean) {
    if (!page) return cleanup()
    page.classList.add('is-settling')
    under?.classList.add('is-settling')
    if (reduced()) { if (commit) finish(); else cleanup(); return }
    render(commit ? width : 0)
    const done = () => (commit ? finish() : cleanup())
    let fired = false
    const once = () => { if (!fired) { fired = true; done() } }
    page.addEventListener('transitionend', once, { once: true })
    setTimeout(once, 400)
  }
  function finish() {
    const drill = openDrill()
    if (drill) {
      // a takeover opened in place (Manage photos): the swipe closes it, like its own back button
      const q = new URLSearchParams(location.search)
      q.delete(drill)
      const unsub = router.subscribe((s) => { if (s.navigation.state === 'idle') { unsub(); afterPaint(cleanup) } })
      setNav('none')
      skipNextTransition()
      const qs = q.toString()
      router.navigate(`${appPath(router.state.location.pathname)}${qs ? `?${qs}` : ''}`, { replace: true })
      return
    }
    skipNextTransition()
    const unsub = router.subscribe((s) => {
      if (s.navigation.state !== 'idle') return
      unsub()
      // the new page is in the DOM; the underlay showed it until now
      afterPaint(cleanup)
    })
    router.navigate(-1)
  }

  strip.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    samples = [{ x: e.clientX, t: e.timeStamp }]
    try { strip.setPointerCapture(e.pointerId) } catch { /* synthetic events (tests) have no active pointer */ }
  })
  strip.addEventListener('pointermove', (e) => {
    if (!start || e.pointerId !== start.id) return
    const dx = e.clientX - start.x, dy = e.clientY - start.y
    if (!engaged) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      // a vertical or leftward drag isn't a back swipe; nothing to go back to, or a sheet open: no swipe either
      if (dx <= 0 || Math.abs(dy) > Math.abs(dx) || !canGoBack() || document.querySelector('.h-m-layer')) { start = null; return }
      engaged = engage()
      if (!engaged) { start = null; return }
    }
    samples.push({ x: e.clientX, t: e.timeStamp })
    if (samples.length > 6) samples.shift()
    render(Math.max(0, dx))
  })
  const end = (e: PointerEvent, cancelled = false) => {
    if (!start || e.pointerId !== start.id) return
    const s0 = start
    start = null
    if (!engaged) { if (!cancelled) passThrough(e, s0); return }
    const dx = e.clientX - s0.x
    const a = samples[0], b = samples[samples.length - 1]
    const v = b && a && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0
    settle(!cancelled && (dx > width / 3 || (v > 0.5 && dx > 24)))
  }
  strip.addEventListener('pointerup', (e) => end(e))
  strip.addEventListener('pointercancel', (e) => end(e, true))

  /** A tap (no drag) on the strip goes to the element underneath. */
  function passThrough(e: PointerEvent, s?: { x: number; y: number }) {
    const x = s?.x ?? e.clientX, y = s?.y ?? e.clientY
    const below = document.elementsFromPoint(x, y).find((n) => n !== strip) as HTMLElement | undefined
    below?.focus?.({ preventScroll: true })
    below?.click()
  }
}
