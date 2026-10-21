/* The one phone presentation of every tooltip (review, 4 Oct): a bottom sheet fitted to its content (title, body 16/24,
 * ×, scrim and grip close it). Never a sheet on a sheet (ds/mobile.md §7): when the trigger already sits inside an open
 * sheet, the same content expands inline at the end of that sheet's body instead, closed by a tap anywhere else.
 * Used by TooltipLayer (every .h-tooltip-anchor and title hint), CaptionTip, KhaTip and Cite. Desktop never mounts it. */
import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { BottomSheet } from './mobile'

export function TipSheet({ open, title, onClose, host, children }: {
  open: boolean; title: string; onClose: () => void
  /** The trigger's element: tells whether it lives in a sheet already, and is excluded from "tap outside". */
  host?: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  // read while rendering: the trigger is already in the DOM when this opens, so no sheet ever mounts first
  const body = open ? host?.current?.closest<HTMLElement>('.h-m-sheet')?.querySelector<HTMLElement>('.h-m-sheet__body') ?? null : null
  const block = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !body) return
    const down = (e: PointerEvent) => {
      const t = e.target as Node
      if (block.current?.contains(t) || host?.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('pointerdown', down, true)
    block.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    return () => document.removeEventListener('pointerdown', down, true)
  }, [open, body, host, onClose])
  if (body) return createPortal(
    <div ref={block} className="h-m-tipsheet h-m-tipinline" role="note"><b className="h-m-tipinline__title">{title}</b><div className="h-m-tipsheet__text">{children}</div></div>,
    body,
  )
  return (
    <BottomSheet open={open} title={title} onClose={onClose} className="h-m-tipsheet">
      <div className="h-m-tipsheet__text">{children}</div>
    </BottomSheet>
  )
}
