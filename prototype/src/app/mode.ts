/* App mode (ds/mobile.md "App mode", prototype/APP-MODE.md): the prototype as Hospitable's mobile app.
 * On with the build env VITE_APP_MODE=mobile (the mobile Vercel project), or on any build by visiting /app (the router
 * then runs under the /app basename, so every link stays inside app mode). No dependencies: ds/mobile.tsx reads it. */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const path = typeof location !== 'undefined' ? location.pathname : '/'

/** True when the page was opened under /app (works on the website deployment and locally). */
export const APP_PATH = path === `${BASE}/app` || path.startsWith(`${BASE}/app/`)
/** True on the mobile build (VITE_APP_MODE=mobile). */
export const APP_BUILD = import.meta.env.VITE_APP_MODE === 'mobile'
/** App mode is on: force the phone layer, native-feel navigation, PWA chrome. */
export const APP_MODE = APP_BUILD || APP_PATH
/** The router's basename: /app when opened under it, else the deploy base. */
export const ROUTER_BASENAME = (APP_PATH ? `${BASE}/app` : BASE) || '/'
/** Inside the desktop device frame (an iframe of this same app, see AppFrame). */
export const IN_FRAME = typeof window !== 'undefined' && window.top !== window.self

/** A wide, non-phone screen gets the 390 × 844 device frame; a real phone (coarse pointer, small screen) runs full screen. */
export function shouldFrame(): boolean {
  if (!APP_MODE || IN_FRAME || typeof window === 'undefined') return false
  const phone = window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 768
  return !phone && window.innerWidth > 767
}

/* Safari's own edge swipe (browser mode) already animates a back navigation: remember it so the app doesn't animate it
 * again. Registered here because this module loads before the router starts listening to popstate. */
let uaPop = false
if (APP_MODE && typeof window !== 'undefined') {
  window.addEventListener('popstate', (e) => { uaPop = !!(e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition })
}
export const lastPopWasAnimated = () => { const v = uaPop; uaPop = false; return v }
