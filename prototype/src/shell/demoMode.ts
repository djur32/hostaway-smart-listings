/* Demo mode (QA B08, Antonio's rule "no demo chrome on screens"). Demo-only controls (the import "Demo state" picker,
 * "Show at 200 properties", the sidebar / Menu persona box, Reset, the persona toast) render only in demo mode.
 *   ?demo=1          turns demo mode on for this tab (sessionStorage), until
 *   ?demo=0          turns it off.
 *   ?demo=<state>    (an import failure / edge state, screens/import/frame.tsx) also turns it on.
 * Other demo params (?persona=, ?smart=on, ?seed=, ?history=1, ?scale=200) keep working without showing any controls.
 * The persona itself stays a product setting in Settings › Guidance (/settings/guidance), which is not demo chrome. */
import { useLocation } from 'react-router-dom'

const KEY = 'hospitable-proto:demo-mode'

/** `?demo=1` / `?demo=0` are the switch; any other `?demo=` value is a demo state id. */
export const isDemoSwitch = (v: string | null) => v === '1' || v === '0'

/** Reads `?demo=` and remembers the answer for the tab. Safe to call on every navigation. */
export function syncDemoMode(search: string = window.location.search): boolean {
  const v = new URLSearchParams(search).get('demo')
  try {
    if (v === '0') sessionStorage.removeItem(KEY)
    else if (v) sessionStorage.setItem(KEY, '1')
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return !!v && v !== '0' // private windows: the URL alone decides
  }
}

/** True while the session is in demo mode. Re-reads on every navigation, so `?demo=1` works on any link. */
export function useDemoMode(): boolean {
  const { search } = useLocation()
  return syncDemoMode(search)
}
