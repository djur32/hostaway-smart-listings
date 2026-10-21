/* PanelStack · drill-downs that slide, they don't replace (D-927, review 1 Oct; ds/motion.md M-19; DS.md "Panel stack").
 * The real product's Calendar/pricing drill-downs swap the whole panel behind "‹ Back" (HS-C02…C12), so the view you
 * came from is gone. Here the page's main content stays visible (narrowed), each level slides in from the right, and the
 * level you came from compresses to a narrow spine on the left that shows its title and takes you back to it.
 * Closing or going back plays the same motion in reverse. CSS: ds/components.css section "PANEL STACK".
 * Phones (≤ 767px, ds/mobile.md §7): a bottom sheet (scrim, grip, 90dvh) rises from the bottom; inside it each level
 * slides over the previous one from the right, with "‹ {previous title}" at the top from level 1 on. Built beside `Split` (ds/sl3.tsx) and reusing its drawer tokens. */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseButton, Icon, cx } from './primitives'
import { InSheetProvider, MobileSheetSaveButtons, useIsMobile } from './mobile'
import { useExclusivePanel } from './panelSlot'

export interface StackPanel {
  /** Stable per level: keeping the id while changing the content swaps the content in place (no slide). */
  id: string
  title: string
  content: ReactNode
  /** A sticky footer (e.g. Discard / Save), pinned under the scrolling body. */
  footer?: ReactNode
}

/** A level's exit lasts one drawer slide (--dur-drawer 240ms) plus a frame of slack, as in Split. */
const EXIT_MS = 280

type LevelState = 'active' | 'spine' | 'leaving' | 'covered'
interface Level { p: StackPanel; i: number; state: LevelState }

/**
 * `panels` is the open path, level 0 first; the last one is the active level. `onBack(i)` asks to show levels 0…i
 * (a spine, "‹ previous", or Esc); `onClose()` closes them all. `rootTitle` is what level 0's "‹" returns to on phones.
 */
export function PanelStack({ main, panels, onBack, onClose, label = 'Details', rootTitle = 'Back', className }: {
  main: ReactNode; panels: StackPanel[]; onBack: (toIndex: number) => void; onClose: () => void
  label?: string; rootTitle?: string; className?: string
}) {
  const mobile = useIsMobile()
  const root = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)

  /* levels that just left stay mounted for their exit (decided during render, so no frame goes without them) */
  const sig = panels.map((p) => p.id).join('|')
  const last = useRef(new Map<string, { p: StackPanel; i: number }>())
  const [prevSig, setPrevSig] = useState(sig)
  const [leaving, setLeaving] = useState<Array<{ p: StackPanel; i: number }>>([])
  if (prevSig !== sig) {
    const gone = [...last.current.values()].filter((x) => !panels.some((q) => q.id === x.p.id))
    setPrevSig(sig)
    setLeaving((l) => [...l.filter((x) => !panels.some((q) => q.id === x.p.id) && !gone.some((g) => g.p.id === x.p.id)), ...gone].sort((a, b) => a.i - b.i))
  }
  useLayoutEffect(() => { last.current = new Map(panels.map((p, i) => [p.id, { p, i }])) })
  useEffect(() => {
    if (!leaving.length) return
    const t = setTimeout(() => setLeaving([]), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving])

  const n = panels.length
  const [drag, setDrag] = useState<{ y0: number; dy: number } | null>(null)
  // the single right-side-panel slot (review 1 Oct, item 3): open claims it; losing it to Tips/Split closes this stack
  // the same way its own "×" does (ds/panelSlot.ts).
  useExclusivePanel('pstack', n > 0, onClose)
  const levels: Level[] = [
    ...panels.map((p, i) => ({ p, i, state: (i === n - 1 ? 'active' : mobile ? 'covered' : 'spine') as LevelState })),
    ...leaving.filter((x) => !panels.some((q) => q.id === x.p.id)).map((x) => ({ ...x, i: Math.max(x.i, n), state: 'leaving' as LevelState })),
  ]

  /* focus: into a new level; back to its opener when it closes. Esc goes back one level. */
  const openers = useRef<Array<HTMLElement | null>>([])
  const depth = useRef(0)
  const [announce, setAnnounce] = useState('')
  useLayoutEffect(() => {
    const before = depth.current
    depth.current = n
    if (n > before) {
      for (let i = before; i < n; i++) openers.current[i] = (i === before ? (document.activeElement as HTMLElement | null) : null)
      const box = mobile ? layer.current : root.current
      box?.querySelector<HTMLElement>(`[data-level="${n - 1}"] .h-pstack__title`)?.focus({ preventScroll: true })
    } else if (n < before) {
      const opener = openers.current[n]
      openers.current.length = n
      // only when focus was in the stack (a spine, "‹", ×, Esc); a reset from the page (another night) keeps focus there
      const a = document.activeElement
      const inStack = !a || a === document.body || !!root.current?.querySelector('.h-pstack__rail')?.contains(a) || !!layer.current?.contains(a)
      if (!inStack) { /* keep the page's focus */ }
      else if (opener?.isConnected) opener.focus({ preventScroll: true })
      else if (n) (mobile ? layer.current : root.current)?.querySelector<HTMLElement>(`[data-level="${n - 1}"] .h-pstack__title`)?.focus({ preventScroll: true })
    }
    if (n !== before) setAnnounce(n ? `${panels[n - 1].title}, level ${n}` : `${label} closed`)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps

  const back = () => (n > 1 ? onBack(n - 2) : onClose())
  useEffect(() => {
    if (!n) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const t = e.target instanceof Element ? e.target : null
      // an open menu or dialog inside a panel closes first (it prevents default); anything else on the page is fine
      if (t?.closest('[role="dialog"]:not(.h-pstack-m__sheet), [role="listbox"], [role="menu"]')) return
      e.preventDefault(); back()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const head = (p: StackPanel, i: number, prev?: string) => (
    <header className="h-pstack__head">
      {prev !== undefined && <button type="button" className="h-pstack__back" onClick={() => (i > 0 ? onBack(i - 1) : onClose())}><Icon name="chevron-left" size={16} />{prev}</button>}
      <div className="h-pstack__titlerow">
        <h2 className="h-pstack__title" tabIndex={-1}>{p.title}</h2>
        <CloseButton className="h-pstack__close" label={`Close ${label.toLowerCase()}`} onClick={onClose} />
      </div>
    </header>
  )
  const live = <div className="h-sr-only" aria-live="polite" role="status">{announce}</div>
  // phones: drag the sheet's grip down past 96px to close (the same threshold as BottomSheet, ds/mobile.tsx)
  const grab = {
    onPointerDown: (e: RPointerEvent) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); setDrag({ y0: e.clientY, dy: 0 }) },
    onPointerMove: (e: RPointerEvent) => { if (drag) setDrag({ ...drag, dy: Math.max(0, e.clientY - drag.y0) }) },
    onPointerUp: () => { if (drag && drag.dy > 96) onClose(); setDrag(null) },
    onPointerCancel: () => setDrag(null),
  }

  if (mobile) {
    return (
      <div className={cx('h-pstack h-pstack--phone', className)} ref={root}>
        <div className="h-pstack__main">{main}</div>
        {live}
        {levels.length > 0 && createPortal(
          // a bottom sheet (ds/mobile.md §7; review, 3 Oct: every sidebar interaction is a bottom sheet on phones):
          // scrim + one sheet frame that rises from the bottom; drill-downs slide inside it from the right, with
          // "‹ {previous title}" from level 1 on. The grip drags the whole sheet down to close.
          <div className={cx('h-pstack-m', n === 0 && 'is-closing')} ref={layer}>
            <div className="h-m-scrim" onClick={onClose} aria-hidden="true" />
            <div className={cx('h-pstack-m__frame', drag && 'is-dragging')} style={drag?.dy ? { transform: `translateY(${drag.dy}px)` } : undefined}>
              <div className="h-m-sheet__grip" {...grab}><span /></div>
              <div className="h-pstack-m__levels">
                {levels.map(({ p, i, state }) => (
                  <section key={p.id} data-level={i} data-state={state} className="h-pstack-m__sheet" role="dialog" aria-modal={state === 'active'} aria-label={p.title}
                    inert={state !== 'active' ? true : undefined}>
                    {head(p, i, i > 0 ? panels[i - 1]?.title ?? rootTitle : undefined)}
                    <div className="h-pstack__body"><InSheetProvider value>{p.content}</InSheetProvider></div>
                    {p.footer && <div className="h-pstack__foot">{p.footer}</div>}
                  </section>
                ))}
              </div>
              {/* the page's Discard / Save (useMobileActions) — the sheet covers the shell's bar, so it moves here */}
              <MobileSheetSaveButtons className="h-pstack-m__foot" />
            </div>
          </div>,
          document.body,
        )}
      </div>
    )
  }

  return (
    <div className={cx('h-pstack', n > 0 && 'is-open', className)} ref={root}>
      <div className="h-pstack__main h-scroll-thin">{main}</div>
      <div className="h-pstack__rail" role="region" aria-label={label}>
        {levels.map(({ p, i, state }) => (
          <section key={p.id} data-level={i} data-state={state} className="h-pstack__level" aria-label={p.title}>
            <button type="button" className="h-pstack__spine" onClick={() => onBack(i)} aria-label={`Back to ${p.title}`}
              tabIndex={state === 'spine' ? 0 : -1} aria-hidden={state !== 'spine' || undefined}>
              <Icon name="chevron-left" size={16} /><span className="h-pstack__spine-label">{p.title}</span>
            </button>
            <div className="h-pstack__sheet" inert={state !== 'active' ? true : undefined}>
              {head(p, i, i > 0 ? panels[i - 1]?.title : undefined)}
              <div className="h-pstack__body h-scroll-thin">{p.content}</div>
              {p.footer && <div className="h-pstack__foot">{p.footer}</div>}
            </div>
          </section>
        ))}
      </div>
      {live}
    </div>
  )
}

/** A row in a panel that opens the next level: label, a one-line summary, chevron (HS-C01's "Listing markups ›"). */
/** `ai`: the purple Dynamic Pricing card (HS-C01: tinted surface, the summary in AI text) — the docked Calendar sidebar. */
export function PanelLink({ title, summary, onClick, current, ai }: { title: ReactNode; summary?: ReactNode; onClick?: () => void; current?: boolean; ai?: boolean }) {
  return (
    <button type="button" className={cx('h-pstack-link', ai && 'h-pstack-link--ai', current && 'is-current')} onClick={onClick} aria-current={current || undefined}>
      <span className="h-pstack-link__main"><span className="h-pstack-link__title">{title}</span>{summary && <span className="h-pstack-link__summary">{summary}</span>}</span>
      <Icon name="chevron-right" />
    </button>
  )
}
