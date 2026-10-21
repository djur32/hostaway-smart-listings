/* The Hostaway shell, ported from ds/components/shell.js (S02): sidebar, property rail (IA-R), page header with the
 * property switcher, underline tabs. "Shell is sacred" (CONVENTIONS §6.2): same markup and classes as the gallery. */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { PROPERTY_RAIL, SIDEBAR } from '../data/ia'
import { MODES, PERSONAS } from '../data/personas'
import { MY_PORTFOLIO as PORTFOLIO, PROPERTY_PHOTO, propertyChannels } from '../data/portfolio' // the account's own (D-160)
import { PROPERTY_ID } from '../data/scenario'
import { photoUrl } from '../data/v3-cv'
import type { PersonaId, Property } from '../data/types'
import { Icon, cx } from './primitives'
import { BottomSheet, ScrollTabs, useIsMobile, useIsNarrowDesktop, useMobileShell } from './mobile'

const LOGO = (
  <svg viewBox="0 0 24 26" aria-hidden="true">
    <circle cx="12" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="5.6" y="21" width="12.8" height="4.2" rx="2.1" fill="currentColor" />
  </svg>
)
export const HostawayMark = () => LOGO

/** Hostaway's chat bubble, always at the bottom right of the app shell ("present at all times except in
 *  full-screen flows", and no behaviour, it opens nothing). Full-screen flows (the strategy wizard, the policy flow) are
 *  routes outside the shell, and the photos takeover covers it, so mounting it in AppShell is exactly that. */
export function ChatFab({ docked }: { /** phones: rendered inside .h-m-dock, so it rides 16 above the tab bar or the Discard / Save bar, whichever is on top */ docked?: boolean } = {}) {
  return <button type="button" className={`h-chat-fab ${docked ? 'h-chat-fab--docked' : 'h-chat-fab--app'}`} aria-label="Chat with Hostaway">{LOGO}</button>
}

export function Sidebar({ active, collapsed: hostCollapsed, onToggle, persona, onPersona, onReset, demo = false, account, home = `/property/${PROPERTY_ID}`, gettingStarted = 4, gettingStartedHidden = false }: {
  active: string; collapsed: boolean; onToggle: () => void; persona: PersonaId; onPersona: (p: PersonaId) => void; onReset?: () => void
  /** Demo mode (?demo=1, shell/demoMode.ts): only then the persona box and Reset show (QA B08: no demo chrome). */
  demo?: boolean
  /** S12 follow-up (D-160): the footer avatar, an AccountMenu (who you are, act as someone else). */
  account?: ReactNode
  /** Where the logo and Properties go for the signed-in account (its start page). */
  home?: string
  /** Getting started's badge: the steps left in this account's setup. */
  gettingStarted?: number
  /** Priya's account has no first-time setup */
  gettingStartedHidden?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // 1024–1180 on a property page (web audit W-09): fold to the icon rail, as Canvas does, so the page head, the tabs and
  // a docked Tips panel fit beside the property rail. The expand button still opens it (and folds it again) here; the
  // host's own choice (AppShell) is untouched elsewhere. The grid follows the class (.h-app--no-subnav:has(…)).
  const onProperty = !!useMatch('/property/*')
  const narrow = useIsNarrowDesktop()
  const [narrowOpen, setNarrowOpen] = useState(false)
  const autoFold = narrow && onProperty && !hostCollapsed
  const collapsed = hostCollapsed || (autoFold && !narrowOpen)
  const toggle = autoFold ? () => setNarrowOpen(!narrowOpen) : onToggle
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <aside className={`h-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="h-sidebar__brand">
        <Link to={home} className="h-logo" style={{ color: 'inherit', textDecoration: 'none' }}>{LOGO}<span className="h-logo__word">hostaway</span></Link>
        <button className="h-sidebar__collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={toggle}>
          <Icon name={collapsed ? 'arrow-bar-to-right' : 'arrow-bar-to-left'} size={24} />
        </button>
      </div>
      <ul className="h-nav">
        {/* QA B25: Search opens the properties search; Getting started opens the connect flow (first-time setup starts there) */}
        {/* only Properties navigates (straight to the property); every other global item is shown but
         * inert, this concept doesn't rebuild those parts. Getting started is inert too and loses its highlight ("we don't want to do anything with that"). */}
        <li><span className="h-nav__item is-inert" aria-disabled="true"><Icon name="search" /><span className="h-label">Search<span className="h-nav__kbd">⌘K</span></span></span></li>
        {/* Priya has no first-time setup, so Getting started is hidden for her account */}
        {!gettingStartedHidden && <li><span className="h-nav__item is-inert" aria-disabled="true"><Icon name="trending-up" />{gettingStarted > 0 && <span className="h-nav__badge">{gettingStarted}</span>}<span className="h-label">Getting started</span></span></li>}
        <li className="h-nav__sep" aria-hidden="true" />
        {SIDEBAR.map((i) => (
          <li key={i.key}>
            {i.key === 'properties' ? (
              <Link className="h-nav__item" to={home} aria-current={i.key === active ? 'page' : undefined}>
                <Icon name={i.icon} /><span className="h-label">{i.label}</span>
              </Link>
            ) : (
              <span className="h-nav__item is-inert" aria-disabled="true">
                <Icon name={i.icon} /><span className="h-label">{i.label}</span>
                {'chevron' in i && i.chevron && <Icon name="chevron-right" className="h-nav__chev" />}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="h-sidebar__spacer" />
      {/* Demo control (R-130): clearly labelled; S12 implements what each mode changes (D-126). */}
      {demo && <div className="h-persona" ref={ref} style={{ position: 'relative' }}>
        {!collapsed && <div className="h-persona__label">Demo · viewing as</div>}{/* S12: "Viewing as: Family host ▾", a demo control, never a product label */}
        <button className="h-persona__btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="h-persona__tag">{persona}</span><span className="h-label">{PERSONAS[persona].label}</span><Icon name="selector" />
        </button>
        {open && (
          <ul className="h-menu" role="listbox" aria-label="View as persona" style={{ position: 'absolute', bottom: '100%', left: 0, minWidth: 240, zIndex: 20 }}>
            {(Object.keys(PERSONAS) as PersonaId[]).map((p) => (
              <li key={p} className="h-menu__item" role="option" aria-selected={p === persona} onClick={() => { onPersona(p); setOpen(false) }}
                style={{ display: 'block', height: 'auto', padding: '8px 12px' }}>
                <b>{p}</b> {PERSONAS[p].label}
                <div className="h-caption h-muted">{MODES[p].preset} · lands on {MODES[p].landing}</div>
              </li>
            ))}
            {onReset && <li className="h-menu__item" role="option" aria-selected={false} onClick={() => { onReset(); setOpen(false) }} style={{ display: 'block', height: 'auto', padding: '8px 12px', borderTop: '1px solid var(--color-border-secondary)' }}>Reset demo</li>}
          </ul>
        )}
      </div>}
      <div className="h-sidebar__footer">
        {account ?? <span className="h-avatar">AS</span>}
        <Icon name="sparkles" /><Icon name="heart-handshake" /><Icon name="help-circle" /><Icon name="sitemap" />
        {/* Settings is inert like the rest of the global chrome */}
        <Icon name="settings" />
      </div>
    </aside>
  )
}

/** IA-R property rail (ia/recommendation.md §3), from data/ia.ts. `badges` e.g. { overview: 6 } for Needs you. */
export function PropertySubnav({ propertyId, badges }: { propertyId: string; badges?: Record<string, number> }) {
  // S12 (R-073, D-158): a global item (Calendar) carries where you are, so the Calendar can offer the way back.
  const loc = useLocation()
  const from = encodeURIComponent(loc.pathname + loc.search)
  return (
    <nav className="h-subnav" aria-label="Property">
      <span className="h-subnav__back is-inert" aria-disabled="true"><Icon name="chevron-left" size={16} />Back</span>
      {PROPERTY_RAIL.map((i) => (
        <NavLink key={i.key} className="h-subnav__item"
          to={i.global ? `${i.path}?property=${propertyId}&from=${from}` : `/property/${propertyId}/${i.path}`}>
          <Icon name={i.icon} />{i.label}{i.global && ' ↗'}
          {badges?.[i.key] ? <span className="h-pill h-pill--warning" style={{ marginLeft: 'auto' }}>{badges[i.key]}</span> : null}
        </NavLink>
      ))}
    </nav>
  )
}

/** The property's cover photo (sample photos, data/portfolio PROPERTY_PHOTO); the gradient placeholder only if one is missing. */
function coverPhoto(p: Property): string | null {
  const k = PROPERTY_PHOTO[p.id] ?? (p.id === PROPERTY_ID ? 'living1' : undefined)
  return k ? photoUrl(k) : null
}
const Thumb = ({ p }: { p: Property }) => {
  const src = coverPhoto(p)
  return <span className="h-switcher__thumb">{src && <img src={src} alt="" />}</span>
}

/** Property switcher (page head, top right): bordered trigger, no shadow; the menu opens under it at exactly its width,
 *  one 48px row per property with its photo. */
const STATUS_TEXT: Record<Property['status'], string> = { 'in-sync': 'In sync', 'needs-you': 'Needs you', 'sync-failed': 'Sync failed' }
/** Property switcher (page head, top right): bordered trigger, no shadow; the menu opens under it at exactly its width,
 *  one 48px row per property with its photo.
 *  Phones (ds/mobile.md §4): the first thing on every property page, full width; tapping it opens a bottom sheet of the
 *  account's properties (photo, name, area · status, a check on the current one). `withMore` is kept for callers and
 *  ignored: the phones' "···" is gone (the page title opens the Sections sheet now). */
/** Phones: the account's properties as a bottom sheet (photo, name, "area · status", a check on the current one). Picking
 *  one keeps the section you're on. Rendered by PropertySwitcher, or by a host that must close its own sheet first
 *  (PropertyLayout's Sections sheet: never a sheet on a sheet, ds/mobile.md §7, mobile audit H-12). */
export function PropertiesSheet({ property, open, onClose, onPick }: { property: Property; open: boolean; onClose: () => void; onPick?: () => void }) {
  const go = useSameSection()
  return (
    <BottomSheet open={open} onClose={onClose} title="Properties" className="h-m-propsheet">
      <ul className="h-m-propsheet__list" role="listbox" aria-label="Properties">
        {PORTFOLIO.map((p) => (
          <li key={p.id} role="option" aria-selected={p.id === property.id}>
            <button type="button" className="h-m-propsheet__row" onClick={() => { onPick?.(); onClose(); go(p.id) }}>
              <Thumb p={p} />
              <span className="h-m-propsheet__text"><span className="h-m-propsheet__name">{p.name}</span><span className="h-m-propsheet__sub">{p.area} · {STATUS_TEXT[p.status]}</span></span>
              {p.id === property.id && <Icon name="check" className="h-m-propsheet__check" />}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}

/** QA B23: switching property keeps the section you're on (Listing, a Hub tab, Photos, Pricing?tab=…), not just Overview -
 *  except a channel section (/ch/<channel>/…) the target property doesn't have connected (switching away
 *  from Booking.com to a property with no Booking.com shouldn't land on a dead Booking.com route, go to its Overview). */
function useSameSection() {
  const nav = useNavigate()
  const loc = useLocation()
  return (id: string) => {
    const m = loc.pathname.match(/^\/property\/[^/]+(\/.*)?$/)
    const rest = m?.[1] && m[1] !== '/' ? m[1] : '/overview'
    const ch = rest.match(/^\/ch\/([^/]+)/)
    nav(ch && !(propertyChannels(id) as string[]).includes(ch[1]) ? `/property/${id}/overview` : `/property/${id}${rest}${loc.search}`)
  }
}

export function PropertySwitcher({ property, onOpenSheet }: { property: Property; withMore?: boolean
  /** Phones: open the Properties sheet somewhere else (the host closes its own sheet first; H-12). */
  onOpenSheet?: () => void }) {
  const [open, setOpen] = useState(false)
  const mobile = useIsMobile()
  const goSection = useSameSection()
  const ref = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [hi, setHi] = useState(-1)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  useEffect(() => { if (open && hi >= 0) (list.current?.children[hi] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' }) }, [open, hi])
  const go = (id: string) => { setOpen(false); goSection(id) }
  const openMenu = () => { setHi(Math.max(0, PORTFOLIO.findIndex((p) => p.id === property.id))); setOpen(true) }
  if (mobile) return (
    <div className="h-switcher-wrap h-m-propswitch">
      <button className="h-switcher" aria-haspopup="dialog" aria-expanded={onOpenSheet ? undefined : open} onClick={() => (onOpenSheet ? onOpenSheet() : setOpen(true))} aria-label={`Property: ${property.name}. Switch property`}>
        <Thumb p={property} />
        <span className="h-switcher__label">{property.name}</span><Icon name="chevron-down" />
      </button>
      {!onOpenSheet && <PropertiesSheet property={property} open={open} onClose={() => setOpen(false)} />}
    </div>
  )
  // the Dropdown's keys: ↑ ↓ Home End move, a letter jumps to the next property starting with it, Enter picks, Esc closes
  const onKey = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu() } return }
    const n = PORTFOLIO.length
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(n - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setHi(0) }
    else if (e.key === 'End') { e.preventDefault(); setHi(n - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { if (hi >= 0) { e.preventDefault(); go(PORTFOLIO[hi].id) } }
    else if (e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      const order = [...PORTFOLIO.slice(hi + 1), ...PORTFOLIO.slice(0, hi + 1)]
      const hit = order.find((p) => p.name.toLowerCase().startsWith(e.key.toLowerCase()))
      if (hit) setHi(PORTFOLIO.indexOf(hit))
    }
  }
  return (
    <div className="h-switcher-wrap" ref={ref}>
      <button className="h-switcher" aria-haspopup="listbox" aria-expanded={open} onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={onKey}>
        <Thumb p={property} />
        <span className="h-switcher__label" title={property.name}>{property.name}</span><Icon name="chevron-down" />
      </button>
      {open && (
        <ul className="h-menu h-switcher__menu" role="listbox" aria-label="Properties" ref={list}>
          {PORTFOLIO.map((p, i) => (
            <li key={p.id} role="option" aria-selected={p.id === property.id} className={cx('h-menu__item', i === hi && 'is-hi')}
              onMouseEnter={() => setHi(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => go(p.id)}>
              <Thumb p={p} /><span className="h-switcher__label" title={p.name}>{p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- the phones' page head (ds/mobile.md §4, one pattern for every property page) ----------
 * Top to bottom: the property selector (full width) · the title, which IS the section switcher (title + ⌄ opens the
 * Sections sheet; the separate section bar and the "···" are gone) with Tips at the right of the same row · the page's
 * own rows (Classic | Canvas, then anything else) · the page's tabs follow it. PageHead and PageHeader render this at
 * ≤ 767px; desktop and tablet keep their own heads untouched. Tips reaches the title row through <HeadTips>. */
const HeadTipsSlot = createContext<HTMLElement | null>(null)
/** PropertyLayout provides it: the page head's titleEnd (Classic | Canvas) is mirrored into the compact top bar, right side */
export const CompactEndCtx = createContext<((n: ReactNode) => void) | null>(null)
export function MobileHead({ title, lead, titleEnd, property, actions, right, sub, compactTitle }: {
  title: ReactNode; lead?: ReactNode; titleEnd?: ReactNode; property?: Property; actions?: ReactNode; right?: ReactNode; sub?: ReactNode
  /** The compact top bar's label once the large title has scrolled away (defaults to the title when it's a string). */
  compactTitle?: string
}) {
  const { openPropertyMenu } = useMobileShell()
  const [slot, setSlot] = useState<HTMLSpanElement | null>(null)
  const label = compactTitle ?? (typeof title === 'string' ? title : undefined)
  const setCompactEnd = useContext(CompactEndCtx)
  useEffect(() => { setCompactEnd?.(titleEnd ?? null); return () => setCompactEnd?.(null) }, [titleEnd, setCompactEnd])
  return (
    <HeadTipsSlot.Provider value={slot}>
      <header className="h-m-head">
        {/* the property is picked in the Sections sheet, not on the page; a page with no sheet keeps the selector */}
        {property && !openPropertyMenu && <PropertySwitcher property={property} />}
        <div className="h-m-head__titlerow">
          {lead && <span className="h-m-head__lead">{lead}</span>}
          {/* the whole title is the tap target (an overlay button, so a chip inside the title, "Source of truth", stays
              its own button instead of being nested in this one) */}
          <h1 className={cx('h-m-head__title', openPropertyMenu && 'is-switch')} data-compact-title={label}>
            {/* a plain-text title keeps its last word and the ⌄ together, so a wrapped title never leaves the ⌄ alone */}
            <span className="h-m-head__text">{openPropertyMenu && typeof title === 'string' && title.includes(' ')
              ? <>{title.slice(0, title.lastIndexOf(' ') + 1)}<span className="h-m-head__last">{title.slice(title.lastIndexOf(' ') + 1)}<Icon name="chevron-down" className="h-m-head__chev" /></span></>
              : title}</span>
            {openPropertyMenu && <>
              {!(typeof title === 'string' && title.includes(' ')) && <Icon name="chevron-down" className="h-m-head__chev" />}
              <button type="button" className="h-m-head__titlebtn" aria-haspopup="dialog" onClick={openPropertyMenu} aria-label={`${label ?? 'This page'}: show all sections`} />
            </>}
          </h1>
          {titleEnd && <span className="h-m-head__end">{titleEnd}</span>}
          <span className="h-m-head__tips" ref={setSlot} />
        </div>
        {sub && <div className="h-m-head__sub">{sub}</div>}
        {actions && <div className="h-m-head__row h-m-head__actions">{actions}</div>}
        {right && <div className="h-m-head__row">{right}</div>}
      </header>
    </HeadTipsSlot.Provider>
  )
}
/** The page's Tips button, placed at the right of the phones' title row (MobileHead). Desktop: nothing here, the
 *  page shows its own Tips in the tab row / head as before (`.ch-tips-m` stays hidden above 767px). */
export function HeadTips({ children, className }: { children: ReactNode; className?: string }) {
  const slot = useContext(HeadTipsSlot)
  const mobile = useIsMobile()
  if (mobile && slot) return createPortal(children, slot)
  return <span className={cx('ch-tips-m', className)}>{children}</span>
}

export function PageHeader({ title, sub, right, property }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; property?: Property }) {
  const mobile = useIsMobile()
  if (mobile) return <MobileHead title={title} property={property} right={right} sub={sub ? <p className="h-small h-muted" style={{ margin: 0 }}>{sub}</p> : undefined} />
  return (
    <>
      <header className="h-page-header">
        <h1 className="h-h1">{title}</h1>
        <div className="h-page-header__side">{right}{property && <PropertySwitcher property={property} withMore={false} />}</div>
      </header>
      {sub && <p className="h-small h-muted" style={{ margin: '4px 0 0' }}>{sub}</p>}
    </>
  )
}

/** Underline tabs; route-aware (aria-selected on the link, as the DS CSS expects). */
function TabLink({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  const match = useMatch({ path: to, end: end ?? false })
  return <Link to={to} className="h-tab" role="tab" aria-selected={!!match} style={{ textDecoration: 'none' }}>{children}</Link>
}

export function Tabs({ items }: { items: Array<{ label: ReactNode; to: string; end?: boolean }> }) {
  return <ScrollTabs>{items.map((t) => <TabLink key={t.to} {...t}>{t.label}</TabLink>)}</ScrollTabs>
}
