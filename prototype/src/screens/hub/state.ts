/* WS-KH · UI-only Knowledge Hub state: discrepancies the host resolved and facts the host added, kept per property
 * (localStorage, keyed by property id; the old un-keyed data is Neukölln's; "Reset demo" clears every property).
 * Base values themselves go through the store (`sl3Base`), so every channel screen sees them. */
import type { KhFact } from '../../data/v3-kh'
import { createPropertyStore } from './perProperty'

interface HubUiState { resolved: Record<string, string>; added: KhFact[] }
export const useHubUi = createPropertyStore('hospitable-v3-kh-hub', (): HubUiState => ({ resolved: {}, added: [] }), (set) => ({
  resolve: (id: string, value: string) => set((s) => ({ resolved: { ...s.resolved, [id]: value } })),
  add: (f: KhFact) => set((s) => ({ added: [...s.added, f] })),
}))
