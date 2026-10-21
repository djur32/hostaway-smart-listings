/* Act as another account (S12 follow-up, 3 Oct · D-161). Each account has its own saved prototype: every store and draft
 * the app persists (sessionStorage, plus the Knowledge Hub's localStorage stores) is parked under the account when you
 * leave it and restored when you come back, so switching never loses anyone's work (Antonio: "make sure we don't lose
 * any information"). Dana's saved world is simply what this tab already had: today's prototype, untouched.
 *
 * A switch reloads the page into the next account's start page, the way a real account switch does: every store then
 * rehydrates from that account's own storage, with no store having to know about accounts.
 * `?as=dana|callum|marta|priya` switches from a link (for the Loom and reviewers). */
import { APP_MODE, ROUTER_BASENAME } from './mode'
import { USERS, USER_KEY, currentUserId, type UserId } from '../data/users'
import { PROPERTY_ID } from '../data/scenario'

const BUCKET = (u: UserId) => `hospitable-proto:account:${u}`
const JUST = 'hospitable-proto:just-switched'
/** Keys that belong to the tab, not to an account: the current account, the parked accounts, demo mode. */
const tabOnly = (k: string) => k.startsWith('hospitable-proto:')

interface Bucket { session: Record<string, string>; local: Record<string, string> }

function snapshot(): Bucket {
  const session: Record<string, string> = {}, local: Record<string, string> = {}
  for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i)!; if (!tabOnly(k)) session[k] = sessionStorage.getItem(k)! }
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith('hospitable') && !tabOnly(k)) local[k] = localStorage.getItem(k)! }
  return { session, local }
}

function clearAccountKeys() {
  for (const k of Object.keys(sessionStorage)) if (!tabOnly(k)) sessionStorage.removeItem(k)
  for (const k of Object.keys(localStorage)) if (k.startsWith('hospitable') && !tabOnly(k)) localStorage.removeItem(k)
}

/** Where an account starts: the property Overview, for every account (Antonio, 3 Oct; Priya has her listing, 4 Oct). */
export function landingFor(u: UserId, _hasProperties = true): string {
  return `/property/${USERS[u].properties[0] ?? PROPERTY_ID}/overview`
}

/** The page to land on after switching: the property page you're on when the next account has that property too
 *  (Antonio, 4 Oct: switching keeps you on the property, never on Properties' groups, rules or activity), else its start. */
function stayOrLand(next: UserId, hasProps: boolean): string {
  const base = ROUTER_BASENAME === '/' ? '' : ROUTER_BASENAME
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) || '/' : window.location.pathname
  const m = path.match(/^\/property\/([^/]+)(\/.*)?$/)
  const phone = APP_MODE || window.matchMedia('(max-width: 767px)').matches // the phone layer only; desktop keeps its landing
  if (phone && m && hasProps && USERS[next].properties.includes(m[1])) return path
  return landingFor(next, hasProps)
}

/** Leave the current account (its state parked) and open `next` (its state restored, or a fresh start). */
export function switchUser(next: UserId) {
  const cur = currentUserId()
  if (next === cur) return
  try {
    sessionStorage.setItem(BUCKET(cur), JSON.stringify(snapshot()))
    clearAccountKeys()
    const saved = sessionStorage.getItem(BUCKET(next))
    const hasProps = true // every account has its listing (Priya too, 4 Oct)
    if (saved) {
      const b = JSON.parse(saved) as Bucket
      for (const [k, v] of Object.entries(b.session)) sessionStorage.setItem(k, v)
      for (const [k, v] of Object.entries(b.local)) localStorage.setItem(k, v)
    }
    sessionStorage.setItem(USER_KEY, next)
    sessionStorage.setItem(JUST, next)
    const base = ROUTER_BASENAME === '/' ? '' : ROUTER_BASENAME
    window.location.assign(`${base}${stayOrLand(next, hasProps)}`)
  } catch {
    // storage blocked (private window): switch the label only; the state stays shared
    try { sessionStorage.setItem(USER_KEY, next) } catch { /* nothing to do */ }
    window.location.reload()
  }
}

/** True once, right after a switch landed (for the "You're now …" toast). */
export function takeJustSwitched(): UserId | null {
  try {
    const v = sessionStorage.getItem(JUST) as UserId | null
    sessionStorage.removeItem(JUST)
    return v && v in USERS ? v : null
  } catch { return null }
}

/** `?as=<user>` on any URL switches account (demo links). Runs before the stores load (entry.ts calls it first). */
export function applyAsParam() {
  const q = new URLSearchParams(window.location.search)
  const as = q.get('as') as UserId | null
  if (!as || !(as in USERS) || as === currentUserId()) return false
  q.delete('as')
  const rest = q.toString()
  // switchUser reloads into the account's landing page; a deep link keeps its own path instead
  const target = window.location.pathname + (rest ? `?${rest}` : '')
  const cur = currentUserId()
  try {
    sessionStorage.setItem(BUCKET(cur), JSON.stringify(snapshot()))
    clearAccountKeys()
    const saved = sessionStorage.getItem(BUCKET(as))
    if (saved) {
      const b = JSON.parse(saved) as Bucket
      for (const [k, v] of Object.entries(b.session)) sessionStorage.setItem(k, v)
      for (const [k, v] of Object.entries(b.local)) localStorage.setItem(k, v)
    }
    sessionStorage.setItem(USER_KEY, as)
    sessionStorage.setItem(JUST, as)
  } catch { /* private window */ }
  window.location.replace(target)
  return true
}

/** Has a parked account connected a channel yet? (Priya's line in the account menu while you're someone else.) */
export function parkedHasConnection(u: UserId): boolean {
  try { return /"connected":\["/.test((JSON.parse(sessionStorage.getItem(BUCKET(u)) ?? '{}') as Partial<Bucket>).session?.['hospitable-proto-v1'] ?? '') } catch { return false }
}
