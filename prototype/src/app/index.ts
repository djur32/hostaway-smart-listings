/* App mode entry (prototype/APP-MODE.md). main.tsx calls bootApp() before rendering when APP_MODE is on. */
import '../../../ds/v3/app.css'
import { installAppHead } from './head'
import { installAppNavigation, type AppRouter } from './nav'
import { installSwipeBack } from './gesture'
import { installAppChrome } from './chrome'
import { IN_FRAME } from './mode'

export { APP_MODE, shouldFrame } from './mode'
export { AppFrame } from './AppFrame'

/** The device frame's outer page: head tags only (the phone inside runs the app). */
export function bootFrame() {
  installAppHead()
  document.documentElement.classList.add('is-app-stage')
}

/** The app itself (full screen on a phone, or inside the frame). */
export function bootApp(router: AppRouter) {
  const root = document.documentElement
  root.classList.add('is-app')
  if (IN_FRAME) root.dataset.appFrame = 'true'
  if (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone) root.dataset.standalone = 'true'
  installAppHead()
  installAppNavigation(router)
  installSwipeBack(router)
  installAppChrome(router)
}
