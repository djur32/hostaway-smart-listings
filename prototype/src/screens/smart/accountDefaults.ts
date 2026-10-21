/* Account defaults (Antonio, 4 Oct: "have the platform default to Dana, set up already for her and Callum, activated,
 * with a different field-visibility setting for each; for Callum don't show any non-channel-specific field").
 * Dana and Callum open the demo listing with Smart Listings on and past setup, strategies and tips in place, and
 * Property › Overview's Field visibility already set: Dana Edit (every shared field editable on every channel),
 * Callum Don't show (only channel-specific fields appear). Marta and Priya start as before: off. Applied once per
 * account; "Reset demo" clears the mark and applies it again. SIMULATED accounts (data/users.ts). */
import { useEffect } from 'react'
import { currentUser, type UserId } from '../../data/users'
import { isScenarioProperty, propertyChannels } from '../../data/portfolio'
import { useStore, type FieldVisibility, type OvFieldKey } from '../../store/store'
import { seedSmartOn } from './shared'
import { sharedFieldKeys } from './sharedFields'

const FIELD_VIS: Partial<Record<UserId, FieldVisibility>> = { dana: 'edit', callum: 'hidden' }
const MARK = 'hospitable-acct-defaults' // not "hospitable-proto:…", so it is parked with the account (app/account.ts)

const marked = () => { try { return sessionStorage.getItem(MARK) === '1' } catch { return true } }
export const clearAccountDefaultsMark = () => { try { sessionStorage.removeItem(MARK) } catch { /* nothing to do */ } }

/** Apply the current account's defaults to the active (scenario) property, once. */
export function applyAccountDefaults() {
  const u = currentUser()
  const vis = FIELD_VIS[u.id]
  const s = useStore.getState()
  if (!vis || marked() || !isScenarioProperty(s.activeProperty)) return
  try { sessionStorage.setItem(MARK, '1') } catch { /* nothing to do */ }
  if (!(s.smartListings && s.sl3.setupDone)) seedSmartOn()
  const pid = s.activeProperty
  const patch: Partial<Record<OvFieldKey, FieldVisibility>> = {}
  for (const k of sharedFieldKeys(pid, propertyChannels(pid))) patch[k] = vis
  useStore.getState().setOverview(pid, { fieldVisibility: patch })
}

export function useAccountDefaults() {
  const pid = useStore((s) => s.activeProperty)
  useEffect(() => { applyAccountDefaults() }, [pid])
}
