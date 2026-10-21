/* Routes (S09 session file §3 + IA-R). Screens are swappable per owner (README ownership map); the plumbing isn't.
 * `/property/:id/hub` is the Knowledge Hub, the property's record (named "The home" for a while, D-112 / D-125; the UI says
 * Knowledge Hub everywhere, QA B30). */
import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter, useLocation, useParams, useRouteError } from 'react-router-dom'
import { AppShell } from './shell/AppShell'
import { PropertyGate, PropertyLayout } from './shell/PropertyLayout'
import { Placeholder, PropertyPlaceholder } from './shell/Placeholder'
import { PropertyOverview } from './screens/smart/PropertyOverview'
import { SetupRedirect, StrategyWizard } from './screens/smart/StrategyWizard'
import { Strategy } from './screens/smart/Strategy'
import { StrategyChannel } from './screens/smart/StrategyChannel'
import { Performance } from './screens/smart/Performance'
import { Hub } from './screens/hub/Hub'
import { ListingDetails } from './screens/details/ListingDetails'
import { ListingEditor } from './screens/channel/ListingEditor'
import { Policies } from './screens/channel/Policies'
import { ChannelPricing } from './screens/channel/ChannelPricing'
import { Availability } from './screens/channel/Availability'
import { BasePricing } from './screens/base/Pricing'
import { BaseAvailability } from './screens/base/Availability'
import { ReviewPush as ReviewPushV3 } from './screens/push/ReviewPush'
import { PolicyFlow } from './screens/channel/policies/PolicyFlow'
import { Portfolio } from './screens/portfolio/Portfolio'
import { CalendarPage, Dashboard, OutOfScope } from './screens/global/Global'
import { Guidance } from './screens/global/Guidance'
import { Mobile } from './screens/mobile/Mobile'
import { ROUTER_BASENAME } from './app/mode'
import { useAccount } from './shell/useAccount'

/** The signed-in account's start page (D-160): its first property's Overview, or Getting started for an account with none yet. */
function AccountHome() {
  return <Navigate to={useAccount().home} replace />
}

function RouteError() {
  console.error(useRouteError())
  return <Placeholder scr="-" owner="out of scope" title="This page couldn’t load"><a className="h-textlink" href="/">Back to your property</a></Placeholder>
}

/** Portfolio pages are for portfolios: an account with 5 properties or fewer lands on its home (the Overview links them
 *  on the same rule; audit, 4 Oct: Priya saw "Berlin · 11 properties"). */
function PortfolioOnly({ children }: { children: ReactNode }) {
  const a = useAccount()
  return a.properties.length > 5 ? <>{children}</> : <Navigate to={a.home} replace />
}

/** v3: old IA-R paths go to their new homes (V3-SPEC §3). */
function Go({ to }: { to: string }) {
  const { id } = useParams()
  return <Navigate to={`/property/${id}/${to}`} replace />
}

/** Versions were removed: an old version-detail link (Strategy › Versions or Performance › versions)
 *  lands on that channel's current Performance, query string kept (?smart=on seeds the demo). */
function GoVersion() {
  const { id, channel } = useParams()
  const { search } = useLocation()
  const q = new URLSearchParams(search)
  if (channel) q.set('ch', channel)
  return <Navigate to={`/property/${id}/smart/performance?${q.toString()}`} replace />
}

export const router = createBrowserRouter(
  [
    { path: '/import/:step?', element: <Navigate to="/" replace /> },  // import is planned, not built (KD-01; audit, 4 Oct): the old flow (screens/import) is kept in code, unrouted
    { path: '/property/:id/ch/:channel/policies/:flow/:step?', element: <PropertyGate><PolicyFlow /></PropertyGate> },  // Booking policies › Configure: full-page step flow, outside the shell
    { path: '/property/:id/smart/wizard', element: <PropertyGate><StrategyWizard /></PropertyGate> },  // Smart Listings strategy wizard (3 Oct): full-screen, outside the shell, Hostaway's Add-property layout
    {
      element: <AppShell />,
      errorElement: <RouteError />, // a screen error never blanks the app with the router's default page
      children: [
        // app mode (APP-MODE.md): the property is the app's home
        { path: '/', element: <AccountHome /> }, // the property Overview is the landing page (website and app); AccountHome = the signed-in account's (D-160)                                  // Properties (S12 extends)
        { path: '/home/*', element: <Dashboard /> },                                 // global Home › Needs you (S12)
        { path: '/portfolio', element: <Navigate to="/" replace /> },            // Grid view retired (3 Oct): the Properties list reads live per-property data
        { path: '/portfolio/groups', element: <PortfolioOnly><Portfolio view="groups" /></PortfolioOnly> },
        { path: '/portfolio/rules', element: <PortfolioOnly><Portfolio view="rules" /></PortfolioOnly> },                 // S12 · D-153
        { path: '/portfolio/activity', element: <PortfolioOnly><Portfolio view="activity" /></PortfolioOnly> },           // S12 · owner log
        { path: '/calendar', element: <CalendarPage /> },                            // return chip (S12, R-073)
        { path: '/settings/guidance', element: <Guidance /> },                         // S12 · D-150 (persona modes as a setting)
        { path: '/mobile/*', element: <Mobile /> },                                  // S13
        { path: '/inbox', element: <OutOfScope title="Inbox" /> },
        { path: '/guest-experience', element: <OutOfScope title="Guest experience" /> },
        { path: '/metrics', element: <OutOfScope title="Metrics" /> },
        { path: '/direct', element: <OutOfScope title="Direct bookings" /> },
        { path: '/devices', element: <OutOfScope title="Devices" /> },
        { path: '/operations', element: <OutOfScope title="Operations" /> },
        {
          path: '/property/:id',
          element: <PropertyLayout />,
          children: [
            { index: true, element: <Navigate to="overview" replace /> },
            // Smart Listing v3 (concepts/smart-listing/V3-SPEC.md §3)
            { path: 'overview', element: <PropertyOverview /> },                              // WS-SL
            { path: 'details/:tab?', element: <ListingDetails /> },                         // Shared › Listing details: the source of truth (Base)
            { path: 'hub/:tab?', element: <Hub /> },
            { path: 'hub/:tab/:sub', element: <Hub /> },                                         // KH-R: /hub/workflows/:id
            { path: 'calendar', element: <CalendarPage inProperty /> },                        // rail › Calendar (30 Sep: internal, not external)                                          // WS-KH
            { path: 'ch/:channel', element: <Navigate to="listing" replace /> },             // no per-channel Overview; land on Listing (ChannelOverview.tsx kept, just unrouted)
            { path: 'ch/:channel/listing/:tab?', element: <ListingEditor /> },                // WS-CH (Classic) + WS-CV (Canvas)
            { path: 'ch/:channel/pricing', element: <ChannelPricing /> },                     // WS-CH
            { path: 'ch/:channel/availability', element: <Availability /> },                  // Channels › Availability (HS-37/38)
            { path: 'base/pricing', element: <BasePricing /> }, // Listing base › Pricing: the Calendar's property-wide pricing sections, as a page
            { path: 'base/availability', element: <BaseAvailability /> }, // Listing base › Availability: the same stay rules as Channels › Availability, Base only
            { path: 'ch/:channel/policies', element: <Policies /> },                          // WS-CH
            // the standalone All photos page is gone ("not a layout that should exist"): every old link opens
            // the Listing base's own Manage photos takeover instead
            { path: 'photos', element: <Go to="details/essentials?photosOpen=1" /> },
            { path: 'smart/setup/:step?', element: <SetupRedirect /> },                       // Setup removed (3 Oct): old links land in the strategy wizard
            { path: 'smart/strategy', element: <Strategy /> },                                // WS-SL
            { path: 'smart/strategy/:channel', element: <StrategyChannel /> },                 // a channel's current strategy: every answer (3 Oct)
            { path: 'smart/strategy/versions/:channel/:version', element: <GoVersion /> },     // versions removed (3 Oct): redirects to the channel's Performance
            { path: 'smart/performance', element: <Performance /> },                          // WS-SL
            { path: 'smart/performance/versions/:channel/:version?', element: <GoVersion /> }, // versions removed (3 Oct): redirects to the channel's Performance
            { path: 'push', element: <ReviewPushV3 /> },                                      // WS-KH
            // old IA-R paths → new homes
            { path: 'overview/needs-you', element: <Go to="overview" /> },                    // first-time setup is out of scope: the old path lands on Overview
            { path: 'overview/:tab', element: <Go to="overview" /> },
            { path: 'home/*', element: <Go to="hub" /> },
            { path: 'arrival/*', element: <Go to="ch/airbnb/listing/arrival" /> },
            { path: 'rules/*', element: <Go to="ch/airbnb/listing/rules" /> },
            { path: 'pricing/*', element: <Go to="ch/airbnb/pricing" /> },
            { path: 'listing/*', element: <Go to="ch/airbnb" /> },
            { path: 'guest', element: <PropertyPlaceholder title="Guest experience">Messaging and review rules, shared by every channel.</PropertyPlaceholder> },   // out of scope
            { path: 'operations', element: <PropertyPlaceholder title="Operations">Tasks, team and notifications, shared by every channel.</PropertyPlaceholder> },    // out of scope
          ],
        },
        { path: '*', element: <AccountHome /> },
      ],
    },
  ],
  { basename: ROUTER_BASENAME }, // the deploy base, plus /app in app mode opened under /app (app/mode.ts)
)
