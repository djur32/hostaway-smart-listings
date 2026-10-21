/* The global frame: Hostaway sidebar + content + the one provenance line (CONVENTIONS §2: "the footer says so once"). */
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { AccountAvatar, AccountMenu, BottomSheet, ChatFab, HostawayMark, Icon, IconSprite, MobileActionSlot, MobileTabBar, Sidebar, Toast, UnsavedBar, scrollActiveTab, useIsMobile, useIsTablet, useMode, type MobileTab } from '../ds'
import { SIDEBAR } from '../data/ia'
import { MODES, PERSONAS } from '../data/personas'
import { PROPERTY_ID } from '../data/scenario'
import type { PersonaId } from '../data/types'
import { useStore } from '../store/store'
import { clearAccountDefaultsMark, applyAccountDefaults } from '../screens/smart/accountDefaults'
import { useSlLocal } from '../data/v3-sl'
import { useDemoMode } from './demoMode'
import { switchUser, takeJustSwitched } from '../app/account'
import { USERS, userForPersona, type UserDef, type UserId } from '../data/users'
import { useAccount } from './useAccount'

/** After switching account (D-161): say who you are now and what this account holds. Not demo chrome: a real account
 *  switch confirms itself the same way. Shown once, on the page the switch landed on. */
function SwitchedToast({ user, summary, onClose }: { user: UserDef; summary: string; onClose: () => void }) {
  // phones (review, 4 Oct): the DS toast, compact — two lines, gone after 3 s, a tap dismisses it — never a big dark
  // block over the property selector
  if (useIsMobile()) return <Toast dock icon={null} duration={3000} onClose={onClose} closable={false} title={<span className="p-row" style={{ gap: 8, flexWrap: 'nowrap' }}><AccountAvatar user={user} size={24} />You’re now {user.name}</span>}>{user.role}</Toast>
  return (
    <Toast tone="mode" icon={null} duration={7000} onClose={onClose} closable={false}>
      <span className="p-row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <AccountAvatar user={user} />
        <span><b>You’re now {user.name}</b> · {user.role.charAt(0).toLowerCase() + user.role.slice(1)} · {summary}<br />{user.context}</span>
      </span>
    </Toast>
  )
}

/** The account rows in the phone Menu (the avatar menu's mobile form, D-160). */
function MobileAccounts({ user, users, summary }: { user: UserDef; users: UserDef[]; summary: (u: UserDef) => string }) {
  return (
    <>
      <div className="h-m-menu__group">Act as</div>
      <ul className="h-m-menu" role="radiogroup" aria-label="Act as">
        {users.map((u) => (
          <li key={u.id}>
            <button type="button" role="radio" aria-checked={u.id === user.id} className="h-m-menu__item h-m-menu__item--stack" onClick={() => switchUser(u.id as UserId)}>
              <span className="p-row" style={{ gap: 10, flexWrap: 'nowrap' }}><AccountAvatar user={u} size={24} /><b>{u.name}</b></span>
              <span className="h-m-menu__sub">{u.role} · {summary(u)}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

/** S12 (D-150, motion M-10): after a demo persona switch, say what changed on this surface, and offer their start page. */
function ModeToast({ persona, onClose }: { persona: PersonaId; onClose: () => void }) {
  const m = MODES[persona]
  const { id } = useParams()
  const landing = PERSONAS[persona].landing.replace(':id', id ?? PROPERTY_ID)
  // the shared Toast (ds/toast.tsx): bottom of the content column, fades after 9 s (more to read than a confirmation)
  return (
    <Toast tone="mode" icon={null} duration={9000} onClose={onClose} closable={false}>
      <b>Viewing as {persona} · {PERSONAS[persona].label}</b>
      <ul>
        <li>Guidance: {m.hints === 'more' ? 'more (coach marks, “why”)' : m.hints === 'fewer' ? 'one line where it helps' : 'none'}</li>
        <li>AI: {m.autonomy}</li>
        <li>Open by default: {m.open.slice(0, 3).join(', ')}</li>
      </ul>
      <div className="p-row p-mt2" style={{ gap: 16 }}>
        <Link to={landing} onClick={onClose}>Go to their start page</Link>
        <button onClick={onClose} style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer', padding: 0 }}>Stay here</button>
      </div>
    </Toast>
  )
}

function activeSidebar(path: string) {
  if (path === '/' || path.startsWith('/property') || path.startsWith('/import') || path.startsWith('/portfolio')) return 'properties'
  return path.split('/')[1] || 'properties'
}

/* ≤ 767px (ds/mobile.md §3): the bottom tab bar replaces the sidebar; Menu opens the rest of the global nav. */
const TAB_KEYS = ['home', 'inbox', 'calendar', 'properties'] as const
function mobileTab(path: string): string | null {
  const first = path.split('/')[1]
  if (first === 'property' || first === 'portfolio' || path === '/') return 'properties'
  return (TAB_KEYS as readonly string[]).includes(first) ? first : null
}

/** Menu drawer: the global items the tab bar doesn't carry, Settings, and the persona switch (from the sidebar footer). */
function MobileMenu({ persona, onPersona, onReset, demo, accounts, gettingStartedHidden }: { persona: PersonaId; onPersona: (p: PersonaId) => void; onReset: () => void; demo: boolean
  /** S12 follow-up (D-160): the "Act as" account rows. */
  accounts?: React.ReactNode; gettingStartedHidden?: boolean }) {
  const items = SIDEBAR.filter((i) => !(TAB_KEYS as readonly string[]).includes(i.key))
  return (
    <nav aria-label="Menu">
      <ul className="h-m-menu">
        {!gettingStartedHidden && <li><span className="h-m-menu__item is-inert" aria-disabled="true"><Icon name="trending-up" />Getting started<span className="h-m-menu__badge">4</span></span></li>}
        {/* only Properties navigates (review, 3 Oct); the rest is shown, inert */}
        {items.map((i) => (
          <li key={i.key}><span className="h-m-menu__item is-inert" aria-disabled="true"><Icon name={i.icon} />{i.label}</span></li>
        ))}
        <li><span className="h-m-menu__item is-inert" aria-disabled="true"><Icon name="search" />Search</span></li>
        <li><span className="h-m-menu__item is-inert" aria-disabled="true"><Icon name="settings" />Settings</span></li>
      </ul>
      {accounts}
      {demo && <><div className="h-m-menu__group">Demo · viewing as</div>
      <ul className="h-m-menu" role="radiogroup" aria-label="View as persona">
        {(Object.keys(PERSONAS) as PersonaId[]).map((p) => (
          <li key={p}>
            <button type="button" role="radio" aria-checked={p === persona} className="h-m-menu__item h-m-menu__item--stack" onClick={() => onPersona(p)}>
              <span><b>{p}</b> {PERSONAS[p].label}</span>
              <span className="h-m-menu__sub">{MODES[p].preset} · lands on {MODES[p].landing}</span>
            </button>
          </li>
        ))}
        <li><button type="button" className="h-m-menu__item" onClick={onReset}><Icon name="refresh" />Reset demo</button></li>
      </ul></>}
    </nav>
  )
}

export function AppShell() {
  const { pathname, search } = useLocation()
  const persona = useStore((s) => s.persona)
  const setPersona = useStore((s) => s.setPersona)
  const reset = useStore((s) => s.reset)
  // Canvas (CV-00) starts with the global sidebar collapsed, for room; the host's own toggle wins.
  const [userCollapsed, setCollapsed] = useState<boolean | null>(null)
  const canvas = new URLSearchParams(search).get('view') === 'canvas'
  // 768–1023 (ds/mobile.md §3b): the sidebar is icon-only; expanding it lays it OVER the page (scrim, Esc, any
  // navigation closes it) instead of taking 256px from main. The host's desktop choice is kept for ≥ 1024.
  const isTablet = useIsTablet()
  const [tabletOpen, setTabletOpen] = useState(false)
  const collapsed = isTablet ? !tabletOpen : userCollapsed ?? canvas
  const toggleSidebar = () => (isTablet ? setTabletOpen(!tabletOpen) : setCollapsed(!collapsed))
  useEffect(() => { setTabletOpen(false) }, [pathname, isTablet])
  useEffect(() => {
    if (!tabletOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTabletOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [tabletOpen])
  const mode = useMode()
  const [toast, setToast] = useState(false)
  const isMobile = useIsMobile()
  const [menu, setMenu] = useState(false)
  const demo = useDemoMode() // persona box, Reset and the persona toast are demo chrome: ?demo=1 only (QA B08)
  // S12 follow-up (D-160/161): a persona IS an account now; the demo persona box switches account like the avatar does
  const acct = useAccount()
  const onPersona = (p: PersonaId) => { const u = userForPersona(p); if (u !== acct.user.id) switchUser(u); else { setPersona(p); setToast(true) } }
  const [switched, setSwitched] = useState<UserId | null>(() => takeJustSwitched())
  const onReset = () => { reset(); useSlLocal.setState({ mix: {}, undone: {} }); clearAccountDefaultsMark(); applyAccountDefaults() }
  // Phones: bring the active underline tab into view after each navigation (every .h-tabs, whoever renders it)
  useEffect(() => {
    if (!isMobile) return
    const run = () => document.querySelectorAll<HTMLElement>('.h-tabs').forEach(scrollActiveTab)
    const ts = [0, 200, 600].map((ms) => setTimeout(run, ms)) // after the tab-loading beat (M-18) and web fonts
    return () => ts.forEach(clearTimeout)
  }, [isMobile, pathname, search])
  const tabs: MobileTab[] = [
    // review, 3 Oct: Properties replaces Metrics and is the only tab that navigates (straight to the property);
    // Home, Inbox and Calendar are shown but inert — those parts aren't rebuilt in the case study
    { key: 'home', label: 'Home', icon: <HostawayMark />, inert: true },
    { key: 'inbox', label: 'Inbox', icon: 'mail', inert: true },
    { key: 'calendar', label: 'Calendar', icon: 'calendar', inert: true },
    { key: 'properties', label: 'Properties', icon: 'building', to: acct.properties.length ? `/property/${acct.properties[0]}/overview` : acct.home },
    { key: 'menu', label: 'Menu', icon: 'menu-2', onClick: () => setMenu(!menu), expanded: menu },
  ]
  return (
    <div className="p-frame">
      <IconSprite />
      <div className={`h-app h-app--viewport h-app--no-subnav${collapsed ? ' is-collapsed' : ''}${isTablet && tabletOpen ? ' is-overlay-open' : ''}`} style={{ minHeight: 0 }}>
        {isTablet && tabletOpen && <button type="button" className="h-app__scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setTabletOpen(false)} />}
        <Sidebar active={activeSidebar(pathname)} collapsed={collapsed} onToggle={toggleSidebar} persona={persona} onPersona={onPersona} onReset={onReset} demo={demo} gettingStartedHidden={acct.gettingStartedHidden}
          home={acct.properties.length ? `/property/${acct.properties[0]}` : acct.home}
          account={<AccountMenu user={acct.user} users={acct.users} summary={acct.summary} onSwitch={switchUser} onReset={demo ? onReset : undefined} />} />
        {/* S12: keyed by persona so the column cross-fades on a switch (M-10); density follows the mode (D-150). */}
        <div key={persona} className="h-mode-enter" data-density={mode.density} data-hints={mode.hints} style={{ minHeight: 0, overflow: 'hidden', display: 'grid' }}><Outlet /></div>
      </div>
      {/* ≤ 767px only (CSS hides it above): sticky action slot + bottom tab bar (ds/mobile.md §3) */}
      <div className="h-m-dock">
        {/* not over the Canvas guest previews (their booking cards sit on the right edge) */}
        {isMobile && !canvas && <ChatFab docked />}
        <MobileActionSlot />
        <MobileTabBar items={tabs} active={menu ? 'menu' : mobileTab(pathname)} />
      </div>
      {isMobile && (
        // the Menu opens from the bottom, like every other mobile panel (review, 3 Oct)
        <BottomSheet open={menu} onClose={() => setMenu(false)} title="Menu">
          <MobileMenu persona={persona} onPersona={(p) => { onPersona(p); setMenu(false) }} onReset={() => { onReset(); setMenu(false) }} demo={demo} gettingStartedHidden={acct.gettingStartedHidden}
            accounts={<MobileAccounts user={acct.user} users={acct.users} summary={acct.summary} />} />
        </BottomSheet>
      )}
      {!isMobile && <ChatFab />}
      {switched && <SwitchedToast user={USERS[switched]} summary={acct.summary(USERS[switched])} onClose={() => setSwitched(null)} />}
      {toast && demo && <ModeToast key={persona} persona={persona} onClose={() => setToast(false)} />}
    </div>
  )
}

/** A page without the property rail (Properties, Home, Portfolio…). `<UnsavedBar/>` as the last child of
 *  `.h-content__inner` (not mounted at the shell root any more, ds/unsaved.tsx): a `position: sticky; bottom`
 *  child of this scrolling column is automatically scoped to its width and never blocks the content above it. */
export function Page({ children, wide }: { children: React.ReactNode; /** S12: full width for the Grid and the Calendar. */ wide?: boolean }) {
  return <main className="h-content" style={{ overflowY: 'auto' }}><div className="h-content__inner" style={wide ? { maxWidth: 'none' } : undefined}>{children}<UnsavedBar /></div></main>
}
