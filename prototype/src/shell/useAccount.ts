/* The signed-in account, what it holds right now, and where it starts (D-160…D-163). */
import { landingFor } from '../app/account'
import { USERS, USER_ORDER, currentUser, propertiesOf, type UserDef } from '../data/users'
import { useStore } from '../store/store'

export function useAccount() {
  const connected = useStore((s) => s.setup.connected)
  const user = currentUser()
  const properties = propertiesOf(user, connected)
  // Priya has her listing and no setup: her home is the property Overview like everyone else's.
  const home = landingFor(user.id, properties.length > 0)
  const summary = (u: UserDef) => {
    const n = u.id === user.id ? properties.length : propertiesOf(u, []).length
    return n === 0 ? 'No properties yet' : `${n} ${n === 1 ? 'property' : 'properties'}`
  }
  return {
    user, properties, home, summary,
    /** Priya has no first-time setup: Getting started is hidden for her */
    gettingStartedHidden: user.id === 'priya',
    users: USER_ORDER.map((id) => USERS[id]),
    owns: (id: string) => properties.includes(id),
    /** Priya has no setup pending. */
    setupPending: false,
  }
}
