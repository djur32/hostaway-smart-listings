/* F-A1 · Connect & import (SCR-01) · owner S10. Full-page takeover like Hostaway's connect flow (HS-07…15).
 * Steps: connect → importing → second-channel → connect-booking → importing?second=1 → match → found → [Overview › Needs you]
 *        → go-live → done.   Persona variants: P1/P4 plain + one by one, P2 every difference, P3 migration mode (D-136).
 * Demo failure/edge states: ?demo=<id> or the picker in the header (DEMO_STATES, D-137).
 * R-002 R-003 R-004 R-080 R-085 R-090 R-091 · D-104 D-123 D-130…D-139 */
import { useSearchParams, useParams } from 'react-router-dom'
import { Connect, Importing, Match, SecondChannel } from './steps'
import { Found } from './found'
import { Done, GoLive } from './golive'

export function ImportFlow() {
  const { step = 'connect' } = useParams()
  const [q] = useSearchParams()
  switch (step) {
    case 'connect': return <Connect channel="airbnb" />
    case 'importing': return <Importing second={q.get('second') === '1'} />
    case 'second-channel': return <SecondChannel />
    case 'connect-booking': return <Connect channel="booking" />
    case 'match': return <Match />
    case 'found': return <Found />
    case 'go-live': return <GoLive />
    case 'done': return <Done />
    default: return <Connect channel="airbnb" />
  }
}
