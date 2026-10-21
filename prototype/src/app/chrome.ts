/* App mode · document-level chrome behaviour (ds/mobile.md "App mode").
 * - Large title → compact bar: now the phone layer's own (shell/PropertyLayout.tsx `.h-m-compactbar`, website and app
 *   alike, 4 Oct). <html data-condensed> is still written here for any app-only styling that wants it.
 * - In the desktop device frame: the outer address bar follows the app's route, so a reload reopens the same screen. */
import type { AppRouter } from './nav'
import { IN_FRAME } from './mode'

const TITLE = '.h-pagehead h1, .h-page-header h1, .h-m-pagehead__title, h1'

function updateCondensed(scroller: Element) {
  const root = document.documentElement
  if (!scroller.closest('.h-proplayout__main')) return
  const title = scroller.querySelector(TITLE)
  const top = scroller.getBoundingClientRect().top
  const condensed = title ? title.getBoundingClientRect().bottom < top + 4 : (scroller as HTMLElement).scrollTop > 48
  if (condensed !== (root.dataset.condensed === 'true')) root.dataset.condensed = String(condensed)
}

export function installAppChrome(router: AppRouter) {
  document.addEventListener('scroll', (e) => { if (e.target instanceof Element) updateCondensed(e.target) }, { capture: true, passive: true })
  router.subscribe((s) => {
    if (s.navigation.state !== 'idle') return
    document.documentElement.dataset.condensed = 'false' // a new page starts expanded
    if (IN_FRAME) {
      try { window.parent.history.replaceState(null, '', window.location.href) } catch { /* not our frame */ }
    }
  })
}
