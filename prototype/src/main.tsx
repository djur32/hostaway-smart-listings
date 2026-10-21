import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
// The design system, straight from ../ds (one source of truth, CONVENTIONS §6 · D-128)
import '../../ds/fonts/fonts.css'
import '../../ds/tokens.css'
import '../../ds/components.css'
import '../../ds/v3/ch.css'
import '../../ds/v3/polcard.css'
import '../../ds/v3/smartify.css'
import '../../ds/v3/cv.css'
import '../../ds/v3/sl.css'
import '../../ds/v3/wizard.css'
import '../../ds/v3/strategy.css'
import '../../ds/v3/perf.css'
import '../../ds/v3/cal.css' // Property › Calendar: docked sidebar + month grid (3 Oct)
import '../../ds/v3/kh.css'
import '../../ds/v3/fieldscope.css'
import '../../ds/v3/kh-a.css'
import '../../ds/v3/kh-b.css'
import '../../ds/v3/kh-c.css'
import '../../ds/v3/kh-d.css'
import '../../ds/v3/kh-e.css'
import '../../ds/v3/kh-r.css'
import '../../ds/v3/kh-addfact.css' // KH Add-a-fact: voice + form-instead (3 Oct)
import '../../ds/v3/kh-q.css' // Knowledge Hub, reframed: Questions · Insights · Facts · Sources (KH-REFRAME, 4 Oct)
import '../../ds/v3/m-fields.css' // phones: compound number fields as one joined control
import '../../ds/v3/m-tips.css' // phones: every tooltip as one bottom sheet (TipSheet)
import '../../ds/v3/m-drawers.css' // phones: side drawers / panels as bottom sheets (Manage photos…)
import '../../ds/v3/m-qa.css' // phones: verification-sweep fixes
import './styles/app.css'
import './ds/mPolish' // phones: lone buttons full width + the last polish pass (ds/v3/m-polish.css)
import { router } from './routes'
import { applyDemoParams } from './shell/demoParams'
import { TooltipLayer } from './ds/tooltipLayer'
import { installScrollReveal } from './ds/scrollReveal'
import { APP_MODE } from './app/mode'
import { initAnalytics } from './analytics'
import './screens/push/saveUndo' // the save toast's snapshot + Undo (ds/unsaved.tsx, 4 Oct)

applyDemoParams()
initAnalytics()
installScrollReveal()

const rootEl = document.getElementById('root')!
const renderApp = () => createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
    <TooltipLayer />
  </StrictMode>,
)

// App mode (APP-MODE.md: VITE_APP_MODE=mobile, or /app): its code and CSS load only then, so the website is untouched.
// On a desktop browser the page draws an iPhone that iframes the app; on a phone (or inside that frame) the app runs.
if (APP_MODE) {
  import('./app').then((app) => {
    if (app.shouldFrame()) { app.bootFrame(); createRoot(rootEl).render(<app.AppFrame />) }
    else { app.bootApp(router); renderApp() }
  })
} else renderApp()
