/* App mode: the document head of an installable web app (Add to Home Screen opens full screen on iOS and Android).
 * Injected at runtime so the website (same index.html) is untouched; the mobile build also gets the static tags from
 * vite.config.ts (transformIndexHtml) so iOS sees them even before any script runs. Idempotent. */
import { APP_PATH } from './mode'

const BASE = import.meta.env.BASE_URL

function meta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
  el.content = content
}
function link(rel: string, href: string, extra?: Record<string, string>) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el) }
  el.href = href
  Object.entries(extra ?? {}).forEach(([k, v]) => el!.setAttribute(k, v))
}

export function installAppHead() {
  // viewport-fit=cover: the app draws under the home indicator and pads with env(safe-area-inset-*) (--m-safe-*)
  meta('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
  meta('apple-mobile-web-app-capable', 'yes')
  meta('mobile-web-app-capable', 'yes')
  meta('apple-mobile-web-app-title', 'Hospitable')
  // "default": a white status bar with dark text, the app's own top (the real app is white under the clock)
  meta('apple-mobile-web-app-status-bar-style', 'default')
  meta('theme-color', getComputedStyle(document.documentElement).getPropertyValue('--color-surface-primary').trim() || 'white')
  meta('format-detection', 'telephone=no')
  // /app on any deployment installs with start_url /app/; the mobile build installs the root
  link('manifest', `${BASE}pwa/${APP_PATH ? 'app' : 'root'}.webmanifest`)
  link('apple-touch-icon', `${BASE}pwa/apple-touch-icon.png`, { sizes: '180x180' })
  document.title = 'Hospitable'
}
