/* A property (V3-SPEC §1, NV-4a channel-first): Overview · Shared · Channels · Smart Listings (when on).
 * Multi-property (QA B01/B02): the layout makes its property the store's active one before anything under it renders,
 * shows only that property's connected channels, and sends unknown ids and unconnected channels away. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useMatch, useParams } from 'react-router-dom'
import { BottomSheet, ChannelNav, PropertiesSheet, PropertySwitcher, CompactEndCtx, Icon, Mark, MobileSectionBar, MobileShellProvider, UnsavedBar, navCurrent, useIsMobile, useIsTablet, type NavChannel } from '../ds'
import { propertyById, propertyChannels } from '../data/portfolio'
import { PROPERTY_ID } from '../data/scenario'
import { tipsFor, type ListingChannel } from '../data/sl3'
import { useStore } from '../store/store'
import { useSmartDemo } from '../screens/smart/shared'
import { useAccountDefaults } from '../screens/smart/accountDefaults'
import { useAccount } from './useAccount'
import { usePendingCount, useTipsGate } from '../screens/channel/screenTips'
import { usePricingTips } from '../screens/channel/ChannelPricing'
import { useAvailabilityTips } from '../screens/channel/Availability'
import { usePolicyTips } from '../screens/channel/Policies'

/** The property in the URL. Screens render only under PropertyGate, so the fallback is never shown for a bad id. */
export function useProperty() {
  const { id } = useParams()
  return propertyById(id) ?? propertyById(PROPERTY_ID)!
}

/** Makes `id` the store's active property (its slices at the top level) before the children render: the swap runs in a
 *  layout effect and the children wait for it, so the first paint already shows this property. */
export function PropertyScope({ id, children }: { id: string; children: ReactNode }) {
  const ready = useStore((s) => s.activeProperty === id)
  const setActive = useStore((s) => s.setActiveProperty)
  useLayoutEffect(() => { if (!ready) setActive(id) }, [ready, id, setActive])
  return ready ? <>{children}</> : null
}

/** Route guard for /property/:id/…: an unknown id goes to the Properties list; a channel the property isn't connected
 *  to (/ch/:channel/…) goes to the property's Overview. Then the property becomes the active one. */
export function PropertyGate({ children }: { children: ReactNode }) {
  const { id } = useParams()
  const p = propertyById(id)
  const ch = useMatch('/property/:id/ch/:channel/*')?.params.channel
  const { owns, home } = useAccount()
  if (!p) return <Navigate to="/" replace />
  // another account's property (D-160): back to this account's start page
  if (!owns(p.id)) return <Navigate to={home} replace />
  if (ch && !propertyChannels(p.id).includes(ch as ListingChannel)) return <Navigate to={`/property/${p.id}/overview`} replace />
  return <PropertyScope id={p.id}>{children}</PropertyScope>
}

export function PropertyLayout() {
  return <PropertyGate><PropertyFrame /></PropertyGate>
}

type PageTips = { listing: number; pricing: number; availability: number; policies: number }
/** One channel's pending tips per page, from the same hooks the pages build their Tips lists with, so the rail's
 *  counts always equal each page's "Tips · N" chip. Listing: the channel's Listing editor tips (tipsFor, the active
 *  property's). Every count follows the one gate (screenTips useTipsGate): no tips before Setup finishes (QA B16) and
 *  only for channels in the Smart Listings plan. */
function usePageTips(pid: string, c: ListingChannel): PageTips {
  const gate = useTipsGate(c)
  const st = useStore((s) => s.sl3.tips)
  const listing = gate ? tipsFor(c).filter((t) => !st[t.id]).length : 0
  const pricing = usePendingCount(usePricingTips(pid, c))
  const availability = usePendingCount(useAvailabilityTips(pid, c))
  const policies = usePendingCount(usePolicyTips(c))
  return { listing, pricing, availability, policies }
}

function PropertyFrame() {
  const p = useProperty()
  const loc = useLocation()
  useSmartDemo() // ?smart=on|off works on every property page
  useAccountDefaults() // Dana and Callum start set up, with their own field visibility
  const on = useStore((s) => s.smartListings)
  const inSetup = loc.pathname.includes('/smart/')
  const base = `/property/${p.id}`
  // Per-page tip counts for every listing channel, a fixed set of hook calls (hooks can't run in a loop of varying
  // length); the property's connected channels pick theirs below. tipsFor(c) follows the active property — the
  // scenario's own scripted tips, this property's generated ones (data/property-listing.ts propertyTipsFor), or none
  // for the three properties that keep Smart Listings off (data/portfolio.ts SMART_LISTINGS_OFF).
  const pageTips: Record<ListingChannel, PageTips> = {
    airbnb: usePageTips(p.id, 'airbnb'),
    booking: usePageTips(p.id, 'booking'),
    direct: usePageTips(p.id, 'direct'),
  }
  const channels: NavChannel[] = propertyChannels(p.id).map((c) => {
    const t = pageTips[c]
    return {
      id: c,
      // the channel row carries the total while collapsed; open, each page carries its own (ds/sl3.tsx ChannelNav)
      tips: t.listing + t.pricing + t.availability + t.policies,
      // Antonio, 1 Oct: drop each channel's Overview — Smart Listings › Performance covers that ground now and matters more
      items: [
        { key: 'listing', label: 'Listing', to: `${base}/ch/${c}/listing`, count: t.listing },
        { key: 'pricing', label: 'Pricing', to: `${base}/ch/${c}/pricing`, count: t.pricing },
        { key: 'availability', label: 'Availability', to: `${base}/ch/${c}/availability`, count: t.availability },
        { key: 'policies', label: 'Booking policies', to: `${base}/ch/${c}/policies`, count: t.policies },
      ],
    }
  })
  // Listing children match /listing/:tab too: NavLink `end` would miss them, so mark the Listing link by prefix.
  const nav: ComponentProps<typeof ChannelNav> = {
    overview: { key: 'overview', label: 'Overview', icon: 'layout-sidebar-left-expand', to: `${base}/overview` },
    shared: [
      // "Listing base" (Antonio, 1 Oct): Details, Pricing and Availability as property-wide pages, grouped like a channel's own
      { key: 'base', label: 'Listing base', icon: 'file-text', to: `${base}/details`, children: [
        { key: 'details', label: 'Details', to: `${base}/details`, end: true, alsoActive: (path) => path.startsWith(`${base}/details/`) },
        { key: 'base-pricing', label: 'Pricing', to: `${base}/base/pricing` },
        { key: 'base-availability', label: 'Availability', to: `${base}/base/availability` },
      ] },
      // Every Hub page is labelled a Concept (ds/kh-r.tsx KhrFrame). Clean paths open the reframed Hub; iteration R (3 Oct,
      // Content · Workflows · Sources) stays reachable with ?v=r, the older ones with ?v=a…e|s.
      // Knowledge Hub, reframed (Antonio, 4 Oct · plan/notion-v2/deck-review/KH-REFRAME.md): its own job — the questions
      // guests ask. Insights (first, Antonio 4 Oct) · Questions (a question page keeps it marked) · Facts (read from the Listing base) · Sources.
      { key: 'hub', label: 'Knowledge Hub', icon: 'book', to: `${base}/hub/insights`, children: [
        { key: 'insights', label: 'Insights', to: `${base}/hub/insights` },
        { key: 'questions', label: 'Questions', to: `${base}/hub/questions`, alsoActive: (path) => path === `${base}/hub` || path.startsWith(`${base}/hub/questions/`) },
        { key: 'facts', label: 'Facts', to: `${base}/hub/facts` },
        { key: 'sources', label: 'Sources', to: `${base}/hub/sources` },
      ] },
      { key: 'calendar', label: 'Calendar', icon: 'calendar', to: `${base}/calendar` },
      { key: 'guest', label: 'Guest experience', icon: 'heart', to: `${base}/guest` },
      { key: 'operations', label: 'Operations', icon: 'square-check', to: `${base}/operations` },
    ],
    channels,
    smart: on || inSetup ? [
      { key: 'strategy', label: 'Strategy', icon: 'target', to: `${base}/smart/strategy` },
      { key: 'performance', label: 'Performance', icon: 'chart-line', to: `${base}/smart/performance` },
    ] : null,
  }
  // ≤ 767px (ds/mobile.md §3a): the rail hides. In its place, a section bar above the page names where you are
  // ("Airbnb › Listing ⌄") and opens the whole rail in a bottom sheet — grouped, scrollable, the current page marked,
  // the same tip counts. The page head's "···" opens the same sheet (it used to open a right drawer, images/36, which
  // nobody found: Antonio, 3 Oct). Any link inside closes it.
  const isMobile = useIsMobile()
  // 768–1023 (ds/mobile.md §3b): the same section bar; it opens the desktop rail itself as a slide-over from the left
  // (scrim behind it), so main keeps the full width beside the icon-only global sidebar.
  const isTablet = useIsTablet()
  // a property picked inside the open Sections sheet may remount this layout: the flag reopens Sections underneath
  const [menu, setMenu] = useState(() => { try { return sessionStorage.getItem('hospitable-proto:reopen-sections') === '1' } catch { return false } })
  const shell = useMemo(() => ({ openPropertyMenu: () => setMenu(true) }), [])
  const railRef = useRef<HTMLDivElement>(null)
  const railOpen = isTablet && menu
  // any navigation closes the slide-over (the bottom sheet closes itself through `navigation`)
  // (picking another property inside the open Sections sheet keeps that sheet: `keepSections`)
  const keepSections = useRef(false)
  // (a remount caused by that switch reopens Sections from the flag: the effect below must not undo it on mount)
  const reopened = useRef({ at: Date.now(), on: menu })
  useEffect(() => {
    if (keepSections.current) { keepSections.current = false; return }
    if (reopened.current.on && Date.now() - reopened.current.at < 1500) return
    setMenu(false)
  }, [loc.pathname])
  // leaving the tablet width with the slide-over open: drop the open state so the sheet doesn't pop up on a phone
  useEffect(() => { if (!isTablet && !isMobile) setMenu(false) }, [isTablet, isMobile])
  // slide-over behaviour: focus moves into the rail, Esc closes, focus returns to the section bar
  useEffect(() => {
    if (!railOpen) return
    const opener = document.activeElement as HTMLElement | null
    const t = setTimeout(() => { const el = railRef.current; (el?.querySelector<HTMLElement>('[aria-current="page"]') ?? el?.querySelector<HTMLElement>('a[href]'))?.focus() }, 50)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(false) } }
    document.addEventListener('keydown', onKey, true)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey, true); opener?.focus?.({ preventScroll: true }) }
  }, [railOpen])
  const here = navCurrent(nav, loc.pathname, loc.search)
  // Large title → compact bar (iOS): watch every scroller inside main; once the page head's title (.h-m-head__title)
  // has scrolled under the top edge, show the compact bar with the title's own name. A new page starts expanded.
  const mainRef = useRef<HTMLElement>(null)
  const [compact, setCompact] = useState<string | false>(false)
  const [compactEnd, setCompactEnd] = useState<ReactNode>(null)
  // a page with a back button in its head (a Hub topic, a question, a channel's strategy…): the collapsed bar keeps it
  const [backEl, setBackEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setCompact(false)
    const main = mainRef.current
    if (!isMobile || !main) return
    const check = () => {
      const t = main.querySelector<HTMLElement>('.h-m-head__title')
      setBackEl(main.querySelector<HTMLElement>('.h-m-head__lead button, .h-m-head__lead a'))
      if (!t) { setCompact(false); return }
      const gone = t.getBoundingClientRect().bottom < main.getBoundingClientRect().top + 8
      setCompact(gone ? (t.dataset.compactTitle || here?.label || t.textContent?.trim() || '') : false)
    }
    main.addEventListener('scroll', check, { capture: true, passive: true })
    return () => main.removeEventListener('scroll', check, { capture: true })
  }, [isMobile, loc.pathname, loc.search, here?.label])
  // Properties from inside Sections: close Sections, then open Properties once it has left (--dur-2), so two sheets are
  // never on screen together (ds/mobile.md §7: never nest a sheet in a sheet; mobile audit H-12)
  const [props, setProps] = useState(false)
  const propsTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Antonio, 4 Oct: Properties opens ON TOP of Sections (own scrim above the first); choosing a property closes only the
  // top sheet and leaves Sections open underneath, now showing the new property
  const openProperties = () => setProps(true)
  useEffect(() => () => clearTimeout(propsTimer.current), [])
  useEffect(() => { setProps(false) }, [loc.pathname])
  // opening the sheet brings the current page's row into view (after the group's open animation has a height)
  useEffect(() => {
    if (!menu) return
    const t = setTimeout(() => document.querySelector('.h-m-navsheet [aria-current="page"], .h-m-navsheet .is-here')?.scrollIntoView({ block: 'nearest' }), 260)
    return () => clearTimeout(t)
  }, [menu])
  return (
    <MobileShellProvider value={shell}><CompactEndCtx.Provider value={setCompactEnd}>
      <div className={`h-proplayout${railOpen ? ' is-rail-open' : ''}`}>
        <div className="h-proplayout__rail" ref={railRef} id="h-proplayout-rail" role={isTablet ? 'dialog' : undefined}
          aria-label={isTablet ? `${p.name} · sections` : undefined} aria-modal={railOpen || undefined} inert={isTablet && !railOpen ? true : undefined}><ChannelNav {...nav} /></div>
        {railOpen && <button type="button" className="h-proplayout__scrim" aria-label="Close sections" tabIndex={-1} onClick={() => setMenu(false)} />}
        {isTablet && (
          <MobileSectionBar onOpen={() => setMenu(true)} expanded={menu} group={here?.group} label={here?.label ?? 'All sections'}
            icon={here?.channel ? <Mark channel={here.channel} /> : here?.icon ? <Icon name={here.icon} /> : undefined} />
        )}
        <main className={`h-proplayout__main${compact ? ' is-condensed' : ''}`} ref={mainRef}>
          {/* phones (ds/mobile.md §4): the large title is the section switcher; once it scrolls away, this compact bar
              (44px, over the top of the page's scroller) names the page and still opens Sections */}
          {isMobile && (
            <div className={`h-m-compactbar${compact ? ' is-on' : ''}`} aria-hidden={!compact} inert={!compact ? true : undefined}>
              {backEl && <button type="button" className="h-m-compactbar__back" aria-label="Back" onClick={() => backEl.click()}><Icon name="chevron-left" size={24} /></button>}
              <button type="button" className="h-m-compactbar__btn" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}>
                {here?.channel && <Mark channel={here.channel} />}
                <span className="h-m-compactbar__label">{compact || here?.label || ''}</span>
                <Icon name="chevron-down" size={16} />
                <span className="h-sr-only">, show all sections</span>
              </button>
              {compactEnd && <div className="h-m-compactbar__end">{compactEnd}</div>}
            </div>
          )}
          <Outlet />
        </main>
      </div>
      {isMobile && (
        <>
        {/* titled "Sections": the selector right under the title names the property (mobile audit H-16) */}
        <BottomSheet open={menu} onClose={() => setMenu(false)} title="Sections" label={`${p.name} · sections`} className="h-m-navsheet" navigation>
          {/* the property selector leads the sheet (Antonio, 4 Oct): full width, same control as the page head. It never
              opens a sheet on this sheet (ds/mobile.md §7, H-12): Sections closes first, then Properties opens. */}
          <div className="h-m-navsheet__prop"><span className="h-m-navsheet__label">Property</span><PropertySwitcher property={p} onOpenSheet={openProperties} /></div>
          <ChannelNav {...nav} backLabel="All properties" />
        </BottomSheet>
        <PropertiesSheet property={p} open={props} onClose={() => setProps(false)} onPick={() => { keepSections.current = menu; try { if (menu) sessionStorage.setItem('hospitable-proto:reopen-sections', '1') } catch { /* nothing to do */ } setTimeout(() => { keepSections.current = false; try { sessionStorage.removeItem('hospitable-proto:reopen-sections') } catch { /* nothing to do */ } }, 1500) }} />
        </>
      )}
    </CompactEndCtx.Provider></MobileShellProvider>
  )
}

/** Standard page body for screens without the Tips split (padding and max width). `<UnsavedBar/>` as the last child
 *  of `.h-content__inner` (ds/unsaved.tsx, 1 Oct evening rework): sticky to the bottom of THIS column, not the
 *  viewport, so it never covers the rail and the content stays scrollable around it. Screens whose own draft lives
 *  inside something narrower than this column (a `.ch-page`, a PanelStack panel) render their own instead — see
 *  ListingDetails.tsx, ListingEditor.tsx, screens/pricing/PricingPanels.tsx. */
export function PageBody({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <div className="h-content" style={{ overflowY: 'auto' }}><div className="h-content__inner" style={wide ? { maxWidth: 'none' } : undefined}>{children}<UnsavedBar /></div></div>
}
