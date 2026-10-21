/* App mode on a desktop browser: the app inside a 390 × 844 iPhone (ds/mobile.md "App mode" §A2).
 * The phone is an iframe of this same URL, so inside it the viewport really is 390 wide: the ≤ 767px layer, the
 * View Transitions and the gestures all run exactly as on a phone. The frame draws the device: bezel, Dynamic Island,
 * a 9:41 status bar over the app's 47px top inset and the home indicator over its 34px bottom inset (the app pads
 * both through --m-safe-top / --m-safe-bottom, set by ds/v3/app.css when framed). The device scales down to fit short
 * windows. */
import { useEffect, useState } from 'react'

const W = 390, H = 844, BEZEL = 14

function StatusBar() {
  return (
    <div className="app-device__status" aria-hidden="true">
      <span className="app-device__time">9:41</span>
      <span className="app-device__glyphs">
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg viewBox="0 0 16 12"><path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.5 10.5 0 0 0 8 .4 10.5 10.5 0 0 0 .5 3.4l1.3 1.3A8.7 8.7 0 0 1 8 2.2Zm0 3.6c1.4 0 2.7.5 3.7 1.5L13 6a7 7 0 0 0-10 0l1.3 1.3c1-1 2.3-1.5 3.7-1.5Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.2l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z" /></svg>
        <svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="25" y="4" width="1.6" height="4" rx=".8" opacity=".4" /></svg>
      </span>
    </div>
  )
}

export function AppFrame() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 150) / (H + 2 * BEZEL), (window.innerWidth - 32) / (W + 2 * BEZEL)))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  const website = window.location.pathname.replace(/\/app(\/|$)/, '/')
  return (
    <div className="app-stage">
      <div className="app-stage__device" style={{ width: (W + 2 * BEZEL) * scale, height: (H + 2 * BEZEL) * scale }}>
        <div className="app-device" style={{ transform: `scale(${scale})` }}>
          <iframe className="app-device__screen" src={window.location.href} title="Hospitable app" width={W} height={H} />
          <StatusBar />
          <div className="app-device__island" aria-hidden="true" />
          <div className="app-device__home" aria-hidden="true" />
        </div>
      </div>
      <p className="app-stage__note">
        Hospitable · app mode. Drag from the left edge to go back; drag a sheet's handle down to close it.
        On an iPhone: open this page in Safari, Share › Add to Home Screen. {window.location.pathname.startsWith(`${import.meta.env.BASE_URL}app`) && <a href={website}>Open the website</a>}
      </p>
    </div>
  )
}
