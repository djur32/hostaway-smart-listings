/* The one open-at-a-time right-side-panel slot (D-927, "you can have tips or this sidebar, you
 * cannot have both"). Today there are two independent panel systems, Split/TipsPanel (ds/sl3.tsx, the Listing editor's
 * Tips) and PanelStack (ds/panels.tsx, Calendar/Pricing/Availability drill-downs), and neither knows about the other.
 * This is the shared primitive that lets any panel system claim a single slot: claiming it tells whoever held it
 * before (a different panel) to close itself, via the exact onForceClose it registered. Same lightweight idea as
 * ds/mobile.tsx's sticky-action-bar registry (a module-level store outside React, read with useSyncExternalStore) -
 * but this isn't a stack of "whoever's on top wins the render": there's at most one holder, and taking the slot from
 * someone else closes them immediately rather than just covering them. PanelStack (ds/panels.tsx) wires itself into
 * this; Split/TipsPanel (ds/sl3.tsx, the other session's file) wires in on their end, see useExclusivePanel's doc. */
import { useEffect, useId, useRef, useSyncExternalStore } from 'react'

interface Holder { id: string; forceClose: () => void }
let holder: Holder | null = null
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const getHolder = () => holder

/** `id` claims the slot. If a different id held it, that holder's own `forceClose` runs once, synchronously, before
 *  the new holder takes over, so the panel that just lost the slot closes itself the same way its own "×" would. */
function claim(id: string, forceClose: () => void) {
  if (holder && holder.id !== id) holder.forceClose()
  holder = { id, forceClose }
  emit()
}
/** Releases the slot, but only if `id` is still the one holding it (it may already have lost it to someone else,
 *  in which case there is nothing to release). */
function release(id: string) {
  if (holder?.id === id) { holder = null; emit() }
}

/**
 * Claims the single shared side-panel slot while `isOpen` is true; releases it when `isOpen` goes false or the
 * component unmounts. If another panel claims the slot first, `onForceClose` fires once so this one can close itself
 * (set its own `isOpen` to false), the two panels can never both be open.
 *
 * Usage (PanelStack, ds/panels.tsx): `useExclusivePanel('pstack', panels.length > 0, onClose)`.
 * Usage (Tips/Split, ds/sl3.tsx, wire this in on that side): `useExclusivePanel('tips', open, () => setTipsOpen(false))`.
 *
 * `id` only needs to be stable and distinct per *kind* of panel (not per instance): pass a plain string like 'tips'
 * or 'pstack'. Several PanelStacks never open on the same page at once, so one id per panel system is enough.
 */
export function useExclusivePanel(id: string, isOpen: boolean, onForceClose: () => void) {
  useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f) },
    getHolder, () => null,
  )
  const reactId = useId()
  const key = `${id}:${reactId}`
  const cb = useRef(onForceClose)
  cb.current = onForceClose
  const held = useRef(false)
  useEffect(() => {
    if (isOpen) { claim(key, () => cb.current()); held.current = true }
    else if (held.current) { release(key); held.current = false }
    return () => { if (held.current) { release(key); held.current = false } }
  }, [isOpen, key])
}
