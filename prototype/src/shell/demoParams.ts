/* Demo URL params (S10), for screenshots and demos. Not product behaviour.
 *   ?persona=P1…P4      view as a persona (same as the sidebar switcher)
 *   ?seed=decided       resolve every Needs-you decision with its recommendation (or first option)
 *   ?seed=live          …and push, so receipts exist
 *   ?demo=<id>          a failure/edge state (screens/import/frame.tsx DEMO_STATES); also turns demo mode on
 *   ?demo=1 | ?demo=0   demo mode on / off: shows the demo-only controls (./demoMode.ts)
 *   ?history=1          S12: jump 90 days ahead (versions v1…v3, series, a running test)
 *   ?scale=200          S12: the Grid with 200 properties                                       */
import type { PersonaId } from '../data/types'
import { useStore } from '../store/store'
import { isDemoSwitch, syncDemoMode } from './demoMode'

export function applyDemoParams() {
  const q = new URLSearchParams(window.location.search)
  const s = useStore.getState()
  const persona = q.get('persona') as PersonaId | null
  if (persona && ['P1', 'P2', 'P3', 'P4'].includes(persona)) s.setPersona(persona)
  const seed = q.get('seed')
  if (seed === 'decided' || seed === 'live') {
    s.reset()
    if (persona) useStore.getState().setPersona(persona)
    for (const d of useStore.getState().decisions) useStore.getState().decide(d.id, d.recommended ?? d.options[0].id, true)
    if (seed === 'live') { useStore.getState().push('airbnb'); useStore.getState().push('booking'); useStore.getState().markLive() }
  }
  syncDemoMode() // ?demo=1 / ?demo=0 switch demo mode (the demo-only controls); ?demo=<state> turns it on too
  const demo = q.get('demo')
  if (demo && !isDemoSwitch(demo)) s.setDemo(demo)
  if (q.get('history') === '1') useStore.getState().jumpAhead() // S12
  if (q.get('scale') === '200') useStore.getState().setScale200(true) // S12
}
