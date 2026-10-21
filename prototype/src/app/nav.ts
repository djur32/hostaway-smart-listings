/* App mode · native-feel navigation (ds/mobile.md "App mode" §A3).
 * Every router navigation runs through the View Transitions API (react-router's `viewTransition`), and the direction is
 * written to <html data-nav> so ds/v3/app.css picks the animation:
 *   push  a drill-down: the new page slides in from the right over the old one, which drifts left (parallax) and dims
 *   pop   back (browser / swipe / "‹" links / going up the path): the reverse
 *   fade  lateral moves: the tab bar, the property's Sections sheet
 *   none  same page, another tab or view (Essentials → Arrival, Classic ↔ Canvas): the page's own motion (M-12, M-18)
 * No View Transitions (older Safari / Firefox): the new page gets a CSS entrance in the same direction instead.
 * It also keeps a DOM snapshot of each page you leave, which the swipe-back gesture shows underneath (gesture.ts). */
import type { createBrowserRouter } from 'react-router-dom'
import { lastPopWasAnimated } from './mode'

export type AppRouter = ReturnType<typeof createBrowserRouter>
export type NavDir = 'push' | 'pop' | 'fade' | 'none'

const root = () => document.documentElement
/** The element that moves: the shell's page column (the tab bar stays put), or the whole app for full-page flows. */
export function pageEl(): HTMLElement | null {
  const takeover = openDrill() ? document.querySelector<HTMLElement>(TAKEOVER) : null
  return takeover ?? document.querySelector<HTMLElement>('.p-frame > .h-app') ?? document.getElementById('root')
}
const histIdx = () => (window.history.state as { idx?: number } | null)?.idx ?? 0

/** Full-screen takeovers opened in place by a URL param (Manage photos): they portal to <body>, so they move on their own. */
const TAKEOVER = '.h-photos-takeover'
export function setNav(dir: NavDir, drill = false) { root().dataset.nav = dir; root().dataset.drill = String(drill) }

/* ---------- snapshots of pages left behind (for the swipe-back underlay) ---------- */
type Snap = { node: HTMLElement; scroll: Array<[number, number]>; rect: DOMRect }
const snaps = new Map<number, Snap>()
let drillSnap: Snap | null = null // the page under a takeover opened in place (Manage photos)
function take(): Snap | null {
  const el = pageEl()
  if (!el) return null
  const all = el.querySelectorAll('*')
  const scroll: Array<[number, number]> = []
  all.forEach((n, i) => { if ((n as HTMLElement).scrollTop > 0) scroll.push([i, (n as HTMLElement).scrollTop]) })
  const node = el.cloneNode(true) as HTMLElement
  node.setAttribute('inert', '')
  node.setAttribute('aria-hidden', 'true')
  node.removeAttribute('id')
  return { node, scroll, rect: el.getBoundingClientRect() }
}
function snapshot() {
  const snap = take()
  if (!snap) return
  snaps.set(histIdx(), snap)
  // keep a handful: older entries are rarely swiped back to
  for (const k of [...snaps.keys()]) if (k < histIdx() - 8 || k > histIdx()) snaps.delete(k)
}
/** The page one step back in history, as it looked when you left it (null if we never saw it). */
export function previousSnapshot(): Snap | null { return (openDrill() && drillSnap) || (snaps.get(histIdx() - 1) ?? null) }
/** The takeover param open in the URL now, if any: swiping back closes it rather than leaving the page. */
export function openDrill(): string | null {
  const q = new URLSearchParams(location.search)
  return DRILL_PARAMS.find((p) => q.has(p)) ?? null
}

/* ---------- direction ---------- */
let lastClick: { el: Element; t: number } | null = null
const recentClick = () => (lastClick && performance.now() - lastClick.t < 800 ? lastClick.el : null)

/** Listing / Details tabs are one page with a tab in the path. */
const pageKey = (path: string) => path.replace(/\/(listing|details)\/[^/]+$/, '/$1').replace(/\/$/, '')
const DRILL_PARAMS = ['photosOpen', 'photosNav'] // search params that open a full-screen takeover (Manage photos)

function classify(from: { pathname: string; search: string }, to: URL, click: Element | null): NavDir {
  const fromKey = pageKey(from.pathname), toKey = pageKey(to.pathname)
  if (fromKey === toKey) {
    const before = new URLSearchParams(from.search)
    const opened = DRILL_PARAMS.some((p) => !before.has(p) && to.searchParams.has(p))
    const closed = DRILL_PARAMS.some((p) => before.has(p) && !to.searchParams.has(p))
    return opened ? 'push' : closed ? 'pop' : 'none'
  }
  if (click?.closest('.h-m-tabbar, .h-m-navsheet, .h-m-menu')) return 'fade'
  const link = click?.closest('a, button')
  if (link && (/^back\b|^‹/i.test((link.getAttribute('aria-label') ?? link.textContent ?? '').trim())
    || link.querySelector('use[href$="chevron-left"], use[href$="arrow-left"]'))) return 'pop'
  if (fromKey.startsWith(`${toKey}/`)) return 'pop' // up the path: /smart/strategy/airbnb → /smart/strategy
  return 'push'
}

/* ---------- fallback entrance (no View Transitions) ---------- */
const HAS_VT = typeof document !== 'undefined' && 'startViewTransition' in document
function fallbackEnter(dir: NavDir) {
  if (HAS_VT || dir === 'none') return
  requestAnimationFrame(() => {
    const el = pageEl()
    if (!el) return
    el.classList.remove('app-enter-push', 'app-enter-pop', 'app-enter-fade')
    void el.offsetWidth
    el.classList.add(`app-enter-${dir}`)
    el.addEventListener('animationend', () => el.classList.remove(`app-enter-${dir}`), { once: true })
  })
}

/** A router location's pathname without the basename (/app/property/… → /property/…): the router keeps it in. */
let basename = ''
export function appPath(pathname: string) {
  return basename && (pathname === basename || pathname.startsWith(`${basename}/`)) ? pathname.slice(basename.length) || '/' : pathname
}

let skipNextPop = false
/** The swipe-back gesture already moved the page: the following back navigation shows no transition. */
export function skipNextTransition() { skipNextPop = true }

export function installAppNavigation(router: AppRouter) {
  document.addEventListener('click', (e) => { lastClick = { el: e.target as Element, t: performance.now() } }, true)
  let lastIdx = histIdx()
  let pending: NavDir = 'none'

  basename = router.basename && router.basename !== '/' ? router.basename : ''
  const navigate = router.navigate.bind(router)
  router.navigate = ((to: Parameters<AppRouter['navigate']>[0], opts?: Parameters<AppRouter['navigate']>[1]) => {
    if (typeof to === 'number' || to === null) return navigate(to as unknown as number) // history.go: the popstate handler decides
    const from = { pathname: appPath(router.state.location.pathname), search: router.state.location.search }
    const path = typeof to === 'string' ? to : `${to.pathname ?? from.pathname}${to.search ?? ''}${to.hash ?? ''}`
    const p = path ?? ''
    const here = `${location.origin}${basename}${from.pathname}`
    const url = /^[?#]/.test(p) || p === '' // a search-only change (setSearchParams) stays on this path
      ? new URL(`${here}${p}`)
      : new URL(p, `${here}${from.pathname.endsWith('/') ? '' : '/'}`)
    url.pathname = appPath(url.pathname)
    const o = opts ?? {}
    pending = classify(from, url, recentClick())
    if (skipNextPop) { pending = 'none'; skipNextPop = false } // the swipe already moved the page
    // a replace is a redirect (swaps in place), unless it opens / closes a full-screen takeover in the URL (Manage
    // photos is ?photosOpen=1 with replace): that one still slides like a push / pop
    if (o.replace) {
      // a "‹" back that had no entry to pop (ds/backlink.tsx: a deep link) replaces this entry, and still slides as a pop
      if ((o.state as { back?: boolean } | undefined)?.back) { lastClick = null; setNav('pop'); return navigate(to, { ...o, viewTransition: true }) }
      const drill = from.pathname === url.pathname && pending !== 'none'
      if (!drill) { pending = 'none'; setNav('none'); return navigate(to, o) }
      if (pending === 'push') drillSnap = take()
      setNav(pending, true)
      return navigate(to, { ...o, viewTransition: true })
    }
    lastClick = null
    setNav(pending)
    snapshot()
    return navigate(to, { ...o, viewTransition: true })
  }) as AppRouter['navigate']

  // Back / forward (browser, swipe, navigate(-1)): the direction comes from react-router's history index. Decided in
  // our router subscription, which runs before <RouterProvider>'s (it subscribes on render, after this) and so before
  // the transition starts. A browser that already animated the swipe itself (Safari's own edge swipe:
  // `hasUAVisualTransition`, caught in app/mode.ts before the router listens) gets no second animation.
  let lastKey = router.state.location.key
  router.subscribe((state) => {
    if (state.location.key !== lastKey) {
      lastKey = state.location.key
      if (state.historyAction === 'POP') {
        const idx = histIdx()
        pending = skipNextPop || lastPopWasAnimated() ? 'none' : idx < lastIdx ? 'pop' : 'push'
        skipNextPop = false
        setNav(pending)
      }
    }
    if (state.navigation.state !== 'idle') return
    lastIdx = histIdx()
    fallbackEnter(pending)
    pending = 'none'
  })
}
