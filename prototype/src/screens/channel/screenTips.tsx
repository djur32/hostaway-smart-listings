/* Shared "Tips" treatment for the channel-level screens outside the Listing editor — Pricing, Availability, Booking
 * policies (Antonio, relayed: "reasonable recommendations" at the pricing, availability and booking-policy level,
 * like the ones already on the Listing editor — only at the per-channel listing level, never on the property-wide
 * Base Pricing/Availability screens, which keep no Tips by design).
 * Reuses the exact Tips chrome the Listing editor already has (ds/sl3.tsx: TipsToggle · Split · TipsPanel · TipCard,
 * ds/panelSlot.ts: useExclusivePanel) instead of inventing a new card or panel shape. The one difference from
 * shell/ChannelTips.tsx is the data behind it: that file drives the real `data/sl3.ts` TIPS dataset, which is
 * field-level and scoped to the Listing editor's own FieldDef model. These three screens have no such field model
 * (Pricing's PriceRow, Availability's AvailField and Policies' PolicyModel are all shaped differently and owned by
 * other sessions) and Antonio's ask here is specifically a *new*, screen-scoped set of suggestions — so this hook
 * owns its own small, local, SIMULATED suggestion list per screen instead of extending the Listing editor's.
 * Accept/Dismiss/Undo write the tip's status to the store (`sl3.tips` through `sl3Tip`, the same map the Listing
 * editor's Tips use), so the property rail's per-page counts (shell/PropertyLayout.tsx) and these screens agree and the
 * status survives navigation (Antonio, 3 Oct: the counts sit on Listing / Pricing / Availability / Booking policies once
 * a channel is open). Accept is still never a silent background write — the only other effect is an optional
 * `onAccept` (e.g. putting the number into the row's unsaved draft so Antonio's "prices always ask you first" rule
 * still holds: Accept hands the number to the real control, it never writes one on its own).
 * Each screen's list is built by an exported hook (ChannelPricing.tsx usePricingTips, Availability.tsx
 * useAvailabilityTips, Policies.tsx usePolicyTips) that the screen and the rail both call; ids carry the channel
 * (`airbnb:pt-weekend`, screenTipId) so the same suggestion on two channels never shares a status. */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon, TIP_DOT_HINT, TipCard, TipDot, TipsPanel, TipsToggle, type FieldState } from '../../ds'
import { useExclusivePanel } from '../../ds/panelSlot'
import type { ListingChannel, WhyPoint } from '../../data/sl3'
import { useStore, type FieldVisibility } from '../../store/store'

/** A screen tip's store id: the channel first, so `pt-weekend` on Airbnb and on Booking.com are two tips, and none can
 *  collide with the Listing editor's own `t-…` ids. */
/** The line on a tip card whose field is shared by every channel (listing-wide, "Edit for all channels"): the tip is
 *  offered on one channel, but accepting changes the shared value, so every channel gets it (D-948, audit T-2). */
export const SHARED_TIP_NOTE = 'Applies to every channel. This field is shared, so saving changes it everywhere.'

export const screenTipId = (c: ListingChannel, id: string) => `${c}:${id}`

/** The one gate for every channel tip, the same the rail has always applied to Listing tips (QA B16): Smart Listings on,
 *  Setup finished, and the channel in the Smart Listings plan. Before that a screen has no tips and the rail no count. */
export function useTipsGate(c: ListingChannel): boolean {
  const on = useStore((s) => s.smartListings)
  const done = useStore((s) => s.sl3.setupDone)
  const inPlan = useStore((s) => s.sl3.channels.includes(c))
  return on && done && inPlan
}

/** How many of `defs` still wait for the host (neither accepted nor dismissed) — the number on the Tips chip and the rail. */
export function usePendingCount(defs: Array<{ id: string }>): number {
  const st = useStore((s) => s.sl3.tips)
  return useMemo(() => defs.filter((d) => !st[d.id]).length, [defs, st])
}

/* Field visibility for the tip hooks: the same read as common.tsx useSharedVisibility (Property › Overview's Show / Edit /
 * Don't show on a shared row), for a channel named by argument rather than by the URL — the rail computes every
 * channel's tips from any page. Pass `s.overview?.[pid]?.fieldVisibility` (a stable store reference). */
const uniformVisibility = (m: Partial<Record<string, FieldVisibility>> | undefined): FieldVisibility | undefined => {
  if (!m) return undefined
  let out: FieldVisibility | undefined
  for (const v of Object.values(m)) { if (!v) continue; if (out && v !== out) return undefined; out = v }
  return out
}
export function visibilityOf(fv: Partial<Record<string, FieldVisibility>> | undefined, k: string, orig: FieldState): FieldVisibility | undefined {
  if (orig !== 'listing' && orig !== 'hub') return undefined
  return fv?.[k] ?? uniformVisibility(fv)
}
/** A row a tip can change: on the page ('hidden' = not rendered) and editable ('show' = read-only, no tip either). */
export const tipEditable = (v: FieldVisibility | undefined) => v !== 'hidden' && v !== 'show'

export interface ScreenTipDef {
  id: string
  /** TipCard's small header label (e.g. "Pricing", "Availability", "Cancellation policy"). */
  type: string
  section?: string
  title: string
  main: ReactNode
  /** Each bullet's source (strategy/market reasoning vs. an actual guest inbox reference — ds/sl3.tsx TipCard renders
   *  the icon + "Strategy"/"Inbox" tag), same shape as the Listing editor's own TipDef.why (data/sl3.ts). */
  why: WhyPoint[]
  /** A real action to pair with Accept (e.g. opening the screen's own Dynamic Pricing / Security deposit panel),
   *  so accepting a money or policy suggestion still hands the actual number to the real control rather than
   *  writing one silently. Optional — most suggestions here are illustrative only. */
  onAccept?: () => void
  /** The screen tab this tip's field lives on, when the screen has tabs. Stepping onto a tip whose field is on
   *  another tab switches there first, then scrolls — otherwise the field isn't mounted and nothing would happen. */
  tab?: string
  /** The id of the element this tip is about, so opening or stepping through tips scrolls the form to the row the
   *  suggestion would change (Antonio, 1 Oct: "make sure that the tips always makes the content area travel to
   *  where the content of the tip is related"). The Listing editor already does this; this brings the three
   *  channel screens in line. Optional: a tip about the whole screen can leave it out and nothing scrolls. */
  field?: string
  /** Accept only fills the screen's unsaved draft (the `propose` tips on Pricing and Availability). The card reads
   *  "Accepted" while that draft holds the value, but the tip is only marked accepted in the store on Save; Discard
   *  (or leaving the section) returns it to pending, so a discarded edit never uses the tip up (audit T-1). */
  drafted?: boolean
}

/** One Tips chip + exclusive side panel for a screen's own SIMULATED suggestion list (from its usePricingTips /
 *  useAvailabilityTips / usePolicyTips hook). Status lives in the store, keyed by each def's id. */
export function useScreenTips(
  channel: ListingChannel,
  defs: ScreenTipDef[],
  /** For tabbed screens: the tab showing now, and how to switch. Omit on screens without tabs. */
  tabs?: { current: string; onGoTo: (tab: string) => void },
  /** The screen's section draft (its key and whether it has unsaved changes): `drafted` tips wait on it. The screen calls
   *  the returned `commitDrafted()` from its own Save, before the draft is committed. */
  draft?: { key: string; dirty: boolean },
) {
  const saved = useStore((s) => s.sl3.tips)
  // `drafted` tips accepted into the current, still-unsaved draft: accepted on screen, pending in the store
  const [staged, setStaged] = useState<{ key: string; ids: string[] }>({ key: '', ids: [] })
  const draftKey = draft?.key ?? ''
  const draftDirty = !!draft?.dirty
  const stagedIds = useMemo(() => (draftDirty && staged.key === draftKey ? staged.ids : []), [draftDirty, draftKey, staged])
  // Discard, Save or a new section: anything staged is gone (Save marks it accepted first, through commitDrafted)
  useEffect(() => { if (!draftDirty) setStaged((x) => (x.ids.length ? { key: '', ids: [] } : x)) }, [draftDirty, draftKey])
  const status = useMemo(() => {
    if (!stagedIds.length) return saved
    const n: Record<string, 'accepted' | 'dismissed'> = { ...saved }
    for (const id of stagedIds) if (!n[id]) n[id] = 'accepted'
    return n
  }, [saved, stagedIds])
  const commitDrafted = useCallback(() => {
    for (const id of stagedIds) setTipStore(id, 'accepted')
    setStaged({ key: '', ids: [] })
  }, [stagedIds]) // eslint-disable-line react-hooks/exhaustive-deps
  const setTipStore = useStore((s) => s.sl3Tip)
  const setTip = (id: string, st: 'accepted' | 'dismissed' | null) => {
    if (stagedIds.includes(id)) setStaged((x) => ({ ...x, ids: x.ids.filter((y) => y !== id) }))
    setTipStore(id, st)
  }
  // Open/closed lives in the URL (`?tips=1`), as on the Listing editor (ListingEditor.tsx reads `params.has('tips')`):
  // a link or a reload lands with the panel already open, and the browser's own state matches what's on screen.
  // Patches read the live URL, not this render's params, so a close fired from another panel's claim (below) never
  // undoes a param that panel just wrote (same reason as CanvasView's `set`).
  const [params, setParams] = useSearchParams()
  const tipsOpen = params.has('tips')
  const setTipsOpen = useCallback((next: boolean | ((open: boolean) => boolean)) => {
    const cur = new URLSearchParams(window.location.search)
    const want = typeof next === 'function' ? next(cur.has('tips')) : next
    if (want === cur.has('tips')) return
    if (want) cur.set('tips', '1'); else cur.delete('tips')
    setParams(cur, { replace: true })
  }, [setParams])
  const [i, setI] = useState(0)
  // An accepted card keeps what it said when it was accepted, for as long as this screen is open: the hooks derive their
  // numbers from what is saved, so a Save after Accept would otherwise rewrite the card under you (or drop it, once
  // its condition no longer holds). Order is first-seen, so a kept card stays where it was. Per channel (Pricing
  // doesn't remount when the channel changes).
  const kept = useRef<{ channel: ListingChannel; order: string[]; defs: Record<string, ScreenTipDef> }>({ channel, order: [], defs: {} })
  if (kept.current.channel !== channel) kept.current = { channel, order: [], defs: {} }
  const listed = useMemo(() => {
    const k = kept.current
    for (const d of defs) if (!k.order.includes(d.id)) k.order.push(d.id)
    const live = new Map(defs.map((d) => [d.id, d]))
    return k.order.flatMap((id) => {
      const d = (status[id] === 'accepted' ? k.defs[id] : undefined) ?? live.get(id)
      return d ? [d] : []
    })
  }, [defs, status])
  const open = useMemo(() => listed.filter((t) => status[t.id] !== 'dismissed'), [listed, status])
  const pending = useMemo(() => open.filter((t) => status[t.id] !== 'accepted'), [open, status])
  // the one right-side-panel slot (D-927): opening these Tips force-closes a PanelStack drill-down already open on
  // this screen (ChannelPricing's Dynamic Pricing / Security deposit / field panels), and vice versa.
  useExclusivePanel('tips', tipsOpen, () => setTipsOpen(false))
  const toggle = () => setTipsOpen((o) => !o)
  const idx = Math.min(i, Math.max(open.length - 1, 0))
  const t = open[idx]
  // Travel the content column to the row this tip is about: jump on open, glide when stepping between tips. Mirrors
  // ListingEditor's own behaviour (it lands the field below the sticky section head rather than under it).
  const scrolled = useRef(false)
  const goTo = tabs?.onGoTo
  const curTab = tabs?.current
  // The host can still change tab with the panel open: the panel follows them to that tab's first tip (or stays on the
  // current card when that tab has none) instead of bouncing them back to the card's tab. Only opening or stepping
  // onto a tip (a new tip id) switches the tab for them.
  const shownTip = useRef<string | undefined>(undefined)
  const landed = useRef<string | undefined>(undefined) // the tip the form last travelled to: re-renders (typing) don't pull it back
  const firstOnTab = curTab ? open.findIndex((d) => d.tab === curTab) : -1
  useEffect(() => {
    if (!tipsOpen || !t?.field) { scrolled.current = false; shownTip.current = undefined; landed.current = undefined; return }
    const stepped = shownTip.current !== t.id
    shownTip.current = t.id
    // the field lives on another tab: switch first; this effect runs again once that tab has rendered
    if (t.tab && curTab && t.tab !== curTab) {
      if (stepped) goTo?.(t.tab)
      else if (firstOnTab >= 0) setI(firstOnTab)
      return
    }
    if (landed.current === t.id) return
    const id = t.id
    const field = t.field
    const land = () => {
      const el = document.getElementById(field)
      if (!el) return false
      const behavior: ScrollBehavior = scrolled.current ? 'smooth' : 'auto'
      scrolled.current = true
      landed.current = id
      // the column that actually scrolls: on Pricing the PanelStack's own main sits inside Split's main and grows with
      // its content, so the nearest match isn't always the scroller — walk out to the first one that overflows
      const SC = '.h-split__main, .h-pstack__main'
      let sc = el.closest<HTMLElement>(SC)
      if (!sc) { el.scrollIntoView({ block: 'center', behavior }); return true }
      while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement?.closest<HTMLElement>(SC) ?? null
      if (!sc) return true // nothing overflows: the row is already on screen
      const headH = sc.querySelector<HTMLElement>('.ch-sechead')?.offsetHeight ?? 0
      const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop
      const room = sc.clientHeight - headH
      const gap = el.offsetHeight < room - 32 ? Math.min(96, (room - el.offsetHeight) / 2) : 16
      sc.scrollTo({ top: Math.max(0, top - headH - gap), behavior })
      return true
    }
    if (land()) return
    // arriving with ?tips=1 (or switching tab), the row may not be mounted yet — the screen's brief loading beat
    // (useBriefLoading) is still up. Try again for a moment rather than silently not travelling.
    let tries = 0
    const timer = window.setInterval(() => { if (land() || ++tries > 20) window.clearInterval(timer) }, 100)
    return () => window.clearInterval(timer)
  }, [tipsOpen, t?.id, t?.field, t?.tab, curTab, goTo, firstOnTab])
  const chip = <TipsToggle count={pending.length} open={tipsOpen} onToggle={toggle} />
  /** The purple marker beside the thing a tip is about (Antonio, 3 Oct: "you should always have the icon that there's
   *  a tip available next to the thing that there is a tip for") — same rule as the Listing editor's field rows.
   *  Clicking opens the panel on that field's first tip. Returns null when no open tip names this field. */
  const dotFor = (field: string): ReactNode => {
    const mine = pending.filter((d) => d.field === field)
    if (!mine.length) return null
    const active = tipsOpen && !!t && t.field === field
    return <TipDot count={mine.length} active={active} hint={TIP_DOT_HINT} onClick={() => { setI(open.indexOf(mine[0])); setTipsOpen(true) }} />
  }
  /** The same marker as `dotFor`, as SettingRow's own `tips` / `tipActive` / `onTip` props — for rows whose label must
   *  stay a plain string (common.tsx ScopedRow, used by Pricing and Availability), so SettingRow draws the dot right
   *  after the label exactly as it does on the Listing editor. Empty when no pending tip names this field. */
  const rowTip = (field: string): { tips?: number; tipActive?: boolean; onTip?: () => void } => {
    const mine = pending.filter((d) => d.field === field)
    if (!mine.length) return {}
    return { tips: mine.length, tipActive: tipsOpen && !!t && t.field === field, onTip: () => { setI(open.indexOf(mine[0])); setTipsOpen(true) } }
  }
  /** Pending tips per screen tab, for the tab bar's count badges (as on the Listing editor's tabs). */
  const tabCount = (tab: string) => pending.filter((d) => d.tab === tab).length
  const panel = tipsOpen ? (
    <TipsPanel onClose={() => setTipsOpen(false)} empty={<><Icon name="circle-check" /><b>No tips right now</b><span className="h-small h-muted">You’re all set here for now.</span></>}>
      {t && (
        <TipCard
          type={t.type} section={t.section} channel={channel} idx={idx + 1} total={open.length}
          onPrev={() => setI(Math.max(0, idx - 1))} onNext={() => setI(Math.min(open.length - 1, idx + 1))}
          title={t.title} main={t.main} why={t.why}
          accepted={status[t.id] === 'accepted'}
          onAccept={() => {
            kept.current.defs[t.id] = t
            if (t.drafted && draft) setStaged((x) => ({ key: draftKey, ids: [...(x.key === draftKey ? x.ids : []).filter((y) => y !== t.id), t.id] }))
            else setTip(t.id, 'accepted')
            t.onAccept?.()
          }}
          onDismiss={() => setTip(t.id, 'dismissed')}
          onUndo={() => { delete kept.current.defs[t.id]; setTip(t.id, null) }}
        />
      )}
    </TipsPanel>
  ) : undefined
  return { chip, panel, tipsOpen, pending: pending.length, dotFor, rowTip, tabCount, commitDrafted }
}
