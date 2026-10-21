/* Drag to reorder (Hostaway replica, "Right now there is no dragging behaviour… It just isn't working").
 * Hostaway's own drag-to-reorder list (two screenshots review shared 3 Oct): a 6-dot grip on each
 * item, a light grey rounded square under it on hover with a grab hand; while dragging, the item follows the pointer
 * and the slot it will land in is a same-size placeholder with a light brand-tint fill and a 1px dashed brand-tint
 * border; the other items shift to make room as you move. CSS: ds/components.css "DRAG TO REORDER"
 * (.h-drag-grip, .h-drop-placeholder, .h-drag-ghost, body.is-sorting).
 *
 * Pointer events, not HTML5 drag-and-drop: one code path for mouse, pen and touch, and the placeholder, the live
 * reflow and the lifted copy are ours to style. Mouse/pen drag from anywhere on an item (past a 4px threshold, so a
 * click on the item, its checkbox or its buttons still works); touch drags only from an element marked
 * `data-drag-handle` (the grip, `touch-action: none`), so a finger on a photo still scrolls the page.
 * Items are measured once when a drag starts (grid cells keep their place while their content moves), so the target
 * slot is the cell nearest the pointer — stable while the others animate (FLIP, --dur-2 / --ease-standard) and while
 * the scroll parent auto-scrolls near its edges. Escape cancels. Keyboard reorder stays the screen's own job. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const THRESHOLD = 4
const EDGE = 48 // px from a scroll parent's edge where auto-scroll starts
const INTERACTIVE = 'input, select, textarea, a, label, button:not([data-drag-handle]), [contenteditable="true"]'

export const arrayMove = <T,>(a: T[], from: number, to: number): T[] => {
  const n = a.slice(); const [x] = n.splice(from, 1); n.splice(to, 0, x); return n
}
const cssMs = (name: string, fallback: number) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = parseFloat(v); return Number.isFinite(n) ? (v.endsWith('ms') ? n : n * 1000) : fallback
}
const scrollParent = (el: HTMLElement | null): HTMLElement | null => {
  for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY
    if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p
  }
  return null
}

type Box = { x: number; y: number; w: number; h: number }
export interface SortGhost { key: string; x: number; y: number; w: number; h: number }

export function useSortable({ keys, onReorder, disabled }: {
  keys: string[]
  /** Called once, on drop, with the new order (only when it changed). */
  onReorder: (next: string[], moved: { key: string; from: number; to: number }) => void
  disabled?: boolean
}) {
  const [drag, setDrag] = useState<{ key: string; from: number; to: number } | null>(null)
  const [ghost, setGhost] = useState<SortGhost | null>(null)
  const container = useRef<HTMLElement | null>(null)
  const els = useRef(new Map<string, HTMLElement>())
  const latest = useRef({ keys, onReorder }); latest.current = { keys, onReorder }
  const order = drag ? arrayMove(keys, drag.from, drag.to) : keys

  /* FLIP: whenever the rendered order changes, items glide from where they were (container-relative, so a scroll in
   * between doesn't read as movement). */
  const prev = useRef(new Map<string, { x: number; y: number }>())
  useLayoutEffect(() => {
    const c = container.current?.getBoundingClientRect()
    if (!c) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = cssMs('--dur-2', 200)
    const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease-standard').trim() || 'ease'
    const next = new Map<string, { x: number; y: number }>()
    els.current.forEach((el, k) => {
      // where it is on screen right now = its previous layout spot + whatever glide is still running
      const was = prev.current.get(k)
      const m = el.getAnimations().length ? new DOMMatrix(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform) : null
      el.getAnimations().forEach((a) => a.cancel())
      const r = el.getBoundingClientRect()
      const p = { x: r.left - c.left, y: r.top - c.top }
      next.set(k, p)
      if (!was || !drag || reduce) return
      const fx = was.x + (m?.m41 ?? 0) - p.x, fy = was.y + (m?.m42 ?? 0) - p.y
      if (Math.abs(fx) > .5 || Math.abs(fy) > .5) {
        el.animate([{ transform: `translate(${fx}px, ${fy}px)` }, { transform: 'none' }], { duration: dur, easing: ease })
      }
    })
    prev.current = next
  }, [order.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const session = useRef<{
    key: string; id: number; x0: number; y0: number; dx: number; dy: number; box: Box
    active: boolean; from: number; to: number; slots: Box[]; scroller: HTMLElement | null; px: number; py: number; raf: number
  } | null>(null)

  const end = useCallback((commit: boolean) => {
    const s = session.current
    session.current = null
    if (!s) return
    cancelAnimationFrame(s.raf)
    document.body.classList.remove('is-sorting')
    if (s.active) {
      // swallow the click that follows a drag (a drag that ends on the grip button isn't a click)
      const stop = (e: Event) => { e.stopPropagation(); e.preventDefault() }
      window.addEventListener('click', stop, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0)
      if (commit && s.to !== s.from) latest.current.onReorder(arrayMove(latest.current.keys, s.from, s.to), { key: s.key, from: s.from, to: s.to })
    }
    setDrag(null); setGhost(null)
  }, [])

  // container-relative slot boxes, measured at drag start (no animation running then)
  const measure = () => {
    const c = container.current!.getBoundingClientRect()
    return latest.current.keys.map((k) => {
      const r = els.current.get(k)?.getBoundingClientRect()
      return r ? { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height } : { x: 0, y: 0, w: 0, h: 0 }
    })
  }
  const target = (s: NonNullable<typeof session.current>) => {
    const c = container.current?.getBoundingClientRect()
    if (!c) return s.to
    const x = s.px - c.left, y = s.py - c.top
    let best = s.to, d = Infinity
    s.slots.forEach((b, i) => {
      const dd = (x - (b.x + b.w / 2)) ** 2 + (y - (b.y + b.h / 2)) ** 2
      if (dd < d) { d = dd; best = i }
    })
    return best
  }
  const update = () => {
    const s = session.current
    if (!s?.active) return
    setGhost({ key: s.key, x: s.px - s.dx, y: s.py - s.dy, w: s.box.w, h: s.box.h })
    const to = target(s)
    if (to !== s.to) { s.to = to; setDrag({ key: s.key, from: s.from, to }) }
  }
  // auto-scroll the nearest scroll parent while the pointer sits near its top/bottom edge
  const tick = () => {
    const s = session.current
    if (!s?.active) return
    if (s.scroller) {
      const r = s.scroller.getBoundingClientRect()
      const v = s.py < r.top + EDGE ? -Math.ceil((r.top + EDGE - s.py) / 4) : s.py > r.bottom - EDGE ? Math.ceil((s.py - (r.bottom - EDGE)) / 4) : 0
      if (v) { s.scroller.scrollTop += v; update() }
    }
    s.raf = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = session.current
      if (!s || e.pointerId !== s.id) return
      s.px = e.clientX; s.py = e.clientY
      if (!s.active) {
        if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < THRESHOLD) return
        s.active = true
        s.from = s.to = latest.current.keys.indexOf(s.key)
        if (s.from < 0) { session.current = null; return }
        s.slots = measure()
        prev.current = new Map(latest.current.keys.map((k, i) => [k, { x: s.slots[i].x, y: s.slots[i].y }]))
        s.scroller = scrollParent(container.current)
        document.body.classList.add('is-sorting')
        window.getSelection()?.removeAllRanges()
        setDrag({ key: s.key, from: s.from, to: s.to })
        s.raf = requestAnimationFrame(tick)
      }
      e.preventDefault()
      update()
    }
    const up = (e: PointerEvent) => { if (session.current && e.pointerId === session.current.id) end(e.type === 'pointerup') }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && session.current?.active) { e.stopPropagation(); end(false) } }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('keydown', key, true)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('keydown', key, true)
    }
  }, [end]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (session.current) end(false) }, [end])

  const onPointerDown = (k: string) => (e: RPointerEvent<HTMLElement>) => {
    if (disabled || e.button !== 0 || session.current) return
    const t = e.target as HTMLElement
    const onHandle = !!t.closest('[data-drag-handle]')
    if (!onHandle && t.closest(INTERACTIVE)) return
    if (e.pointerType === 'touch' && !onHandle) return
    const el = els.current.get(k)
    if (!el) return
    const r = el.getBoundingClientRect()
    if (e.pointerType !== 'mouse' || !onHandle) e.preventDefault() // no text selection / image drag; keep focus on a clicked grip
    session.current = {
      key: k, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top,
      box: { x: r.left, y: r.top, w: r.width, h: r.height }, active: false, from: -1, to: -1, slots: [], scroller: null,
      px: e.clientX, py: e.clientY, raf: 0,
    }
  }

  return {
    /** The order to render: `keys` at rest, the live preview while dragging. */
    order,
    /** The key being dragged (render its slot as the placeholder: `.h-drop-placeholder`). */
    dragKey: drag?.key ?? null,
    /** The preview index the dragged item would drop at. */
    dropIndex: drag?.to ?? null,
    ghost,
    containerRef: (el: HTMLElement | null) => { container.current = el },
    itemProps: (k: string) => ({
      ref: (el: HTMLElement | null) => { if (el) els.current.set(k, el); else els.current.delete(k) },
      onPointerDown: onPointerDown(k),
      'data-sort-key': k,
    }),
  }
}

/** The dragged item's lifted copy, following the pointer (portaled to <body>, above every overlay). */
export function DragGhost({ ghost, children }: { ghost: SortGhost | null; children: ReactNode }) {
  if (!ghost) return null
  const style = { width: ghost.w, height: ghost.h, transform: `translate(${ghost.x}px, ${ghost.y}px)` } as CSSProperties
  return createPortal(<div className="h-drag-ghost" style={style} aria-hidden="true"><div className="h-drag-ghost__lift">{children}</div></div>, document.body)
}
