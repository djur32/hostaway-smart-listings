/* One floating layer for every shared tooltip (.h-tooltip-anchor > .h-tooltip). tooltips always sit
 * ABOVE the thing they explain, centred on it, separated from the content, and may wrap to two lines.
 * A CSS-only tooltip can't do that reliably here: the form column and the Tips panel are scrollers, so a tooltip
 * centred on an icon near their edge was clipped (the reason several callers had been pushed to open rightwards).
 * This layer keeps every caller's markup as it is — the inline .h-tooltip stays in the DOM (hidden) so
 * aria-describedby still names it — and shows a fixed-position copy above the anchor, clamped to the viewport,
 * flipping below only when there is no room above. Hover shows after the product's 250ms delay; keyboard focus
 * (:focus-visible) shows it too; a click, Escape or a scroll hides it;
 * on touch, a tap on the anchor shows it. Mounted once in main.tsx. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useIsMobile } from './mobile'
import { TipSheet } from './tooltipSheet'

const GAP = 8 // between the anchor and the tooltip
const EDGE = 8 // closest the tooltip comes to the window edge
const DELAY = 250
const START_INSET = 14 // .h-locked's own text inset
const WIDE = 280

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// phones: a read-only element that explains itself with a native title="" (source chips, glossary terms, strength and
// availability marks) has no hover on touch, so a tap opens the same sheet. Anything with its own action is left alone.
const TITLE_HINTS = '.h-source[title], .h-term[title], [class*="h-strength"][title], .h-avail[title], .h-fromtip[title], .khb-chip__note[title], .h-photo-hidden[title]'
const titleOf = (n: EventTarget | null) => (n instanceof Element ? n.closest<HTMLElement>(TITLE_HINTS) : null)
const contentOf = (a: HTMLElement) => a.querySelector<HTMLElement>(':scope > .h-tooltip') ?? (a.title ? ({ innerHTML: esc(a.title) } as HTMLElement) : null)
const anchorOf = (n: EventTarget | null) => (n instanceof Element ? n.closest<HTMLElement>('.h-tooltip-anchor') : null)

function sheetTitle(a: HTMLElement) {
  if (a.closest('.h-locked')) return 'Why it is locked'
  if (a.classList.contains('h-tipdot-anchor')) return 'Tips'
  if (a.matches('.h-chip, .h-tooltip-anchor:has(> .h-chip)') || a.querySelector(':scope > .h-chip')) return 'What this means'
  return 'About this'
}

export function TooltipLayer() {
  const mobile = useIsMobile()
  const [shown, setShown] = useState<{ anchor: HTMLElement; html: string; start: boolean } | null>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const tip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer = 0
    let current: HTMLElement | null = null
    const hide = () => { current = null; window.clearTimeout(timer); setShown(null) }
    const show = (a: HTMLElement, delay: number) => {
      if (a === current) return
      current = a
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const c = contentOf(a)
        if (c && a.isConnected && current === a) setShown({ anchor: a, html: c.innerHTML, start: a.classList.contains('h-tooltip-anchor--start') })
      }, delay)
    }
    const phone = () => window.matchMedia('(max-width: 767px)').matches
    const over = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || phone()) return // phones: tap only, a mouse in a phone-width window too
      const a = anchorOf(e.target)
      if (a && contentOf(a)) show(a, DELAY)
      else if (current) hide()
    }
    const out = (e: PointerEvent) => { if (!e.relatedTarget && current) hide() } // left the window
    const focusIn = (e: FocusEvent) => {
      const el = e.target as Element
      const a = anchorOf(el)
      if (a && contentOf(a) && el.matches(':focus-visible') && !phone()) show(a, 0)
    }
    // phones: the tooltip is a bottom sheet that takes focus and owns its own close (×, scrim, drag). Focus moving into
    // it, a tap inside it or a scroll in it must not hide it (audit, 4 Oct: it unmounted in the frame it mounted).
    const inSheet = (n: EventTarget | null) => n instanceof Element && !!n.closest('.h-m-tipsheet')
    const focusOut = (e: FocusEvent) => { if (phone()) return; if (current && !current.contains(e.relatedTarget as Node | null)) hide() }
    const downHide = (e: PointerEvent) => { if (!inSheet(e.target)) hide() }
    const scrollHide = () => { if (!phone()) hide() }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && current) hide() }
    // Touch (phones, tablets): no hover, and a tap's focus isn't :focus-visible, so a locked field's "why" was
    // unreachable. A tap on an anchor shows its tooltip at once; the next tap anywhere (pointerdown) or a scroll hides it.
    let lastPointer = ''
    const down = (e: PointerEvent) => { lastPointer = e.pointerType }
    const tap = (e: MouseEvent) => {
      if (lastPointer !== 'touch' && lastPointer !== 'pen' && !phone()) return
      const a = anchorOf(e.target) ?? (phone() ? titleOf(e.target) : null)
      // a button or link with its own action (Rewrite with AI, Tips…) does that action on a tap; its tooltip only names
      // it, so on touch it doesn't open a second sheet on top. Info-only anchors still open.
      const own = e.target instanceof Element ? e.target.closest('button, a, input, select, textarea') : null
      if (own && a && a.contains(own) && own !== a) return
      if (own && a && !a.classList.contains('h-tooltip-anchor') && own.contains(a)) return // a title hint inside a button/link: that tap acts
      if (a && contentOf(a)) { current = null; show(a, 0) }
    }
    window.addEventListener('pointermove', over) // move, not over: after a scroll hides it, the next nudge brings it back
    window.addEventListener('pointerout', out)
    window.addEventListener('pointerdown', downHide, true)
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('click', tap)
    window.addEventListener('focusin', focusIn)
    window.addEventListener('focusout', focusOut)
    window.addEventListener('keydown', key)
    window.addEventListener('scroll', scrollHide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', over)
      window.removeEventListener('pointerout', out)
      window.removeEventListener('pointerdown', downHide, true)
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('click', tap)
      window.removeEventListener('focusin', focusIn)
      window.removeEventListener('focusout', focusOut)
      window.removeEventListener('keydown', key)
      window.removeEventListener('scroll', scrollHide, true)
      window.removeEventListener('resize', hide)
    }
  }, [])

  useLayoutEffect(() => {
    if (!shown || !tip.current) { setPos(null); return }
    const r = shown.anchor.getBoundingClientRect()
    const { width: w, height: h } = tip.current.getBoundingClientRect()
    // `.h-tooltip-anchor--start` (a wide anchor, e.g. a locked field): left-aligned with the field's own text, not
    // centred on a 600px box
    const start = shown.start || r.width > WIDE // any wide anchor reads from its left edge, never centred on it
    const want = start ? r.left + START_INSET : r.left + r.width / 2 - w / 2
    const left = Math.min(Math.max(want, EDGE), window.innerWidth - w - EDGE)
    const above = r.top - GAP - h
    setPos({ left, top: above >= EDGE ? above : r.bottom + GAP })
  }, [shown])

  // phones: a tooltip is a bottom sheet with a title, its text and × — never a floating bubble.
  // Desktop keeps the floating layer above (hover and focus are unchanged there).
  if (mobile && shown) return (
    <TipSheet open title={sheetTitle(shown.anchor)} onClose={() => setShown(null)} host={{ current: shown.anchor }}>
      <span dangerouslySetInnerHTML={{ __html: shown.html }} />
    </TipSheet>
  )
  if (!shown) return null
  return createPortal(
    <div ref={tip} aria-hidden className={shown.start || shown.anchor.getBoundingClientRect().width > WIDE ? 'h-tooltip h-tooltip--float h-tooltip--start' : 'h-tooltip h-tooltip--float'}
      style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: shown.html }} />,
    document.body,
  )
}
