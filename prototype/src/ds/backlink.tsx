/* BackLink · the one "‹" back for every page-head lead (Strategy › a channel, a Hub topic, All photos) · mobile audit H-09.
 * A plain <Link> pushed a NEW entry when you went back, so the next browser Back or App-mode edge swipe returned you to
 * the page you had just left. Now:
 *   · the entry before this one IS the target → history back (navigate(-1)): the same entry, its scroll and its query
 *   · otherwise (a deep link, a reload) → replace this entry with the target, so Back never lands on the page you left.
 * Each entry's URL is recorded by its react-router history index (history.state.idx), so "the entry before" is known
 * without the router having to keep it. The App-mode transition still plays as a pop (app/nav.ts reads state.back). */
import type { MouseEvent, ReactNode } from 'react'
import { Link, useHref, useNavigate, type To } from 'react-router-dom'

const entries = new Map<number, string>()
const idxOf = (state: unknown) => (state as { idx?: number } | null)?.idx
const pathOf = (url: string | URL | null | undefined) => (url == null ? location.pathname : new URL(String(url), location.href).pathname)
function record(state: unknown, url?: string | URL | null) {
  const i = idxOf(state)
  if (typeof i === 'number') entries.set(i, pathOf(url))
}
if (typeof window !== 'undefined' && !(window.history as { __backlink?: boolean }).__backlink) {
  ;(window.history as { __backlink?: boolean }).__backlink = true
  const { pushState, replaceState } = window.history
  window.history.pushState = function (state, unused, url) { pushState.call(this, state, unused, url); record(state, url) }
  window.history.replaceState = function (state, unused, url) { replaceState.call(this, state, unused, url); record(state, url) }
  window.addEventListener('popstate', () => record(window.history.state))
  record(window.history.state)
}
/** The pathname of the history entry before this one, if this session saw it. */
export function previousPath(): string | undefined {
  const i = idxOf(window.history.state)
  return typeof i === 'number' && i > 0 ? entries.get(i - 1) : undefined
}

export function BackLink({ to, label, className = 'h-btn-icon', children }: { to: To; label: string; className?: string; children: ReactNode }) {
  const nav = useNavigate()
  const href = useHref(to)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // new tab etc.: the link's own
    e.preventDefault()
    if (previousPath() === new URL(href, location.href).pathname) nav(-1)
    else nav(to, { replace: true, state: { back: true } })
  }
  return <Link className={className} to={to} aria-label={label} title={label} onClick={onClick}>{children}</Link>
}
