/* /mobile · the mobile layer's viewer (ds/mobile.md §8). On a desktop: an iPhone-sized frame (390 × 844) that iframes
 * the app's real routes (same origin, so the ≤ 767px layout kicks in inside it) and a picker of key routes.
 * On a phone: the same routes as a list, opened full screen. */
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BottomSheet, Button, Icon, MobileActionBar, MobilePageHead, MobileSaveButtons, PageHeader, TopToast, useIsMobile, useMobileActions } from '../../ds'
import { PROPERTY_ID } from '../../data/scenario'

const P = `/property/${PROPERTY_ID}`
const ROUTES: Array<{ label: string; path: string; group?: string }> = [
  { label: 'Overview', path: `${P}/overview`, group: 'Property' },
  { label: 'Listing › Essentials', path: `${P}/ch/airbnb/listing/essentials` },
  { label: 'Listing › Arrival', path: `${P}/ch/airbnb/listing/arrival` },
  { label: 'Booking policies', path: `${P}/ch/airbnb/policies` },
  { label: 'Photos', path: `${P}/photos?channel=airbnb&back=airbnb` },
  { label: 'Knowledge Hub', path: `${P}/hub` },
  { label: 'Calendar', path: `${P}/calendar` },
  { label: 'Smart Listings setup', path: `${P}/smart/setup`, group: 'Flows' },
  { label: 'Import', path: '/import' },
  { label: 'Mobile kit', path: '/mobile/kit', group: 'Design system' },
]
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Home-indicator safe area, simulated inside the frame (an iframe reports env(safe-area-inset-bottom) = 0). */
function simulateSafeArea(e: React.SyntheticEvent<HTMLIFrameElement>) {
  try { e.currentTarget.contentDocument?.documentElement.style.setProperty('--m-safe-bottom', '20px') } catch { /* cross-origin: leave it */ }
}

/** /mobile/kit · the primitives working together, for the screens that adopt them (ds/mobile.md §9). */
function Kit() {
  const [dirty, setDirty] = useState(false)
  const [sheet, setSheet] = useState<'none' | 'sheet' | 'full'>('none')
  const [toast, setToast] = useState(false)
  const [portal, setPortal] = useState(false)
  useMobileActions(portal ? null : { dirty, onDiscard: () => setDirty(false), onSave: () => { setDirty(false); setToast(true) } })
  return (
    <main className="h-content" style={{ overflowY: 'auto' }}>
      <MobilePageHead title="Mobile kit" />
      <div className="p-col p-mt4">
        <Button onClick={() => setDirty(!dirty)}>{dirty ? 'Mark clean' : 'Make a change'}</Button>
        <Button onClick={() => setPortal(!portal)}>{portal ? 'Use useMobileActions' : 'Use MobileActionBar'}</Button>
        <Button onClick={() => setSheet('sheet')}>Open bottom sheet</Button>
        <Button onClick={() => setSheet('full')}>Open full-screen sheet</Button>
        <Button onClick={() => setToast(true)}>Show top toast</Button>
      </div>
      {portal && <MobileActionBar><MobileSaveButtons dirty={dirty} onDiscard={() => setDirty(false)} onSave={() => setDirty(false)} saveLabel="Save all" /></MobileActionBar>}
      <BottomSheet open={sheet !== 'none'} fullScreen={sheet === 'full'} title={sheet === 'full' ? 'Edit per channel' : 'Tips'} onClose={() => setSheet('none')}
        footer={<><Button onClick={() => setSheet('none')}>Cancel</Button><Button kind="primary" onClick={() => setSheet('none')}>Apply</Button></>}>
        {Array.from({ length: 12 }, (_, i) => <p key={i} className="h-body">Row {i + 1}: the body scrolls inside the sheet; the head and footer stay.</p>)}
      </BottomSheet>
      <TopToast open={toast} message="The cleaning fee must not exceed €627.73 for Airbnb." onDismiss={() => setToast(false)} />
    </main>
  )
}

export function Mobile() {
  const isMobile = useIsMobile()
  const { '*': sub } = useParams()
  const [path, setPath] = useState(ROUTES[1].path)
  const [n, setN] = useState(0) // reload key: picking the current route again resets it
  const full = `${window.location.origin}${BASE}${path}`
  if (sub === 'kit') return <Kit />

  if (isMobile) {
    return (
      <main className="h-content" style={{ overflowY: 'auto' }}>
        <PageHeader title="Mobile" />
        <ul className="h-m-menu p-mview__list">
          {ROUTES.map((r) => <li key={r.path}><Link className="h-m-menu__item" to={r.path}>{r.label}<Icon name="chevron-right" size={16} className="p-mview__chev" /></Link></li>)}
        </ul>
      </main>
    )
  }
  return (
    <main className="h-content" style={{ overflowY: 'auto' }}>
      <PageHeader title="Mobile" sub="The same prototype at phone width (390 × 844), with Hospitable's mobile shell: tab bar, “···” property drawer, sticky Save." />
      <div className="p-mview">
        <nav className="p-mview__picker" aria-label="Screens">
          {ROUTES.map((r) => (
            <div key={r.path}>
              {r.group && <div className="h-chnav__group">{r.group}</div>}
              <button type="button" className="h-chnav__item" aria-current={r.path === path ? 'page' : undefined} onClick={() => { setPath(r.path); setN(n + 1) }}>{r.label}</button>
            </div>
          ))}
          <div className="p-mview__open">
            <a className="h-textlink" href={full} target="_blank" rel="noreferrer">Open full screen</a>
            <p className="h-caption h-muted">On a phone, open <span className="p-mview__url">{full}</span></p>
          </div>
        </nav>
        <div className="p-mview__device" aria-label="Phone preview">
          <div className="p-mview__status" aria-hidden="true">
            <span>9:41</span><span className="p-mview__island" /><span className="p-mview__sys"><Icon name="wifi" size={16} /><span className="p-mview__battery" /></span>
          </div>
          <iframe key={`${path}-${n}`} className="p-mview__screen" title="Phone preview" src={`${BASE}${path}`} onLoad={simulateSafeArea} />
          <span className="p-mview__home" aria-hidden="true" />
        </div>
      </div>
    </main>
  )
}
