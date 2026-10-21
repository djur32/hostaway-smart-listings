/* WS-CV · where each area's marker sits (a marker at the area's top-right corner, "never overlapping
 * text or each other"). The replicas pack text right up to their column edges and their side margins differ (Airbnb
 * 40px, Booking.com 24px, 16–24px in the narrow layouts), so no single CSS offset is clear everywhere. This tries a
 * few spots around the top-right corner, nearest first, and keeps the first one that touches no text, no other marker
 * and stays on the page. It writes the result as the marker's --cv-mark-x/--cv-mark-y (ds/v3/cv.css), straight on the
 * element: no React state, so placing never re-renders the page. Re-runs whenever the page's size changes (content
 * reflow, images loading, the narrow layout) and on the caller's deps. */
import { useLayoutEffect, type RefObject } from 'react'

const GAP = 3

type Box = { left: number; top: number; right: number; bottom: number }
const hits = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

function textBoxes(page: HTMLElement): Box[] {
  const out: Box[] = []
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest('.cv-area__mark')) continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) if (r.width && r.height) out.push(r)
  }
  return out
}

export function placeMarkers(page: HTMLElement) {
  const marks = [...page.querySelectorAll<HTMLElement>('.cv-area__mark')]
  if (!marks.length) return
  const text = textBoxes(page)
  const bounds = page.getBoundingClientRect()
  const taken: Box[] = []
  for (const m of marks) {
    const area = m.parentElement!
    const a = area.getBoundingClientRect()
    const own = (m.firstElementChild ?? m).getBoundingClientRect()
    const W = own.width || 22, H = own.height || 22 // 22px (28 on phones), wider with a count, as in Classic
    const o = parseFloat(getComputedStyle(area).outlineOffset) * (a.width / (area.offsetWidth || a.width)) || 0 // the outline sits this far out
    const cx = a.right + o, cy = a.top - o // the outline's top-right corner, on screen
    // candidate top-left corners of the marker, nearest to the corner first
    const spots: Array<[number, number]> = [
      [cx - W / 2, cy - H / 2], // centred on the corner
      [cx + GAP, cy], // just right of it, top-aligned
      [cx - W / 2, cy - H - GAP], // just above it
      [cx - W - GAP, cy - H - GAP], // above, tucked left
      [cx + GAP, cy + H + GAP], // right, one step down
      [cx - W / 2, cy - 2 * H - GAP], // higher above
    ]
    const clear = (strict: boolean) => spots.find(([x, y]) => {
      const box = { left: x, top: y, right: x + W, bottom: y + H }
      if (box.left < bounds.left || box.right > bounds.right || taken.some((t) => hits(box, t))) return false
      return !strict || !text.some((t) => hits(box, t))
    })
    // clear of everything; else at least on the page and clear of other markers; else the corner
    const pick = clear(true) ?? clear(false) ?? spots[0]
    taken.push({ left: pick[0], top: pick[1], right: pick[0] + W, bottom: pick[1] + H })
    // relative to the area's own top-right corner (the marker is anchored there, ds/v3/cv.css)
    m.style.setProperty('--cv-mark-x', `${Math.round(pick[0] - a.right)}px`)
    m.style.setProperty('--cv-mark-y', `${Math.round(pick[1] - a.top)}px`)
  }
}

/** Places the markers inside `pageRef` now, whenever the page's box changes size, and when `deps` change. */
export function useMarkerPlacement(pageRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    // synchronous (no requestAnimationFrame: a background tab never runs it); moving a marker never resizes the page,
    // so the observer can't loop on its own writes
    const run = () => placeMarkers(page)
    run()
    const ro = new ResizeObserver(run)
    ro.observe(page)
    const late = window.setTimeout(run, 600) // fonts and photos settle
    return () => { ro.disconnect(); window.clearTimeout(late) }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
