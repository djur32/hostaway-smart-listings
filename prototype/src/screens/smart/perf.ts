/* Smart Listings › Performance: formatting for screens reading the simulated dataset (data/performance.ts).
 * 3 Oct (Antonio): versions, the comparison mode and their helpers (version rows, recommendations from comparing
 * versions, alternative-strategy estimates) were removed; what is left is plain formatting. */
import { SL_DAYS, slFmt } from '../../data/performance'

export const eur = (v: number) => `€${Math.round(v).toLocaleString('en-GB')}`
export const pct = (v: number) => `${Math.round(v * 100)}%`
export const relPct = (a: number, b: number) => (b ? a / b - 1 : 0)
/** A date range; `to` is exclusive. A range that runs to today reads "– today" unless `closed`. */
export const range = (from: number, to: number, closed = false) => `${slFmt(from)} – ${to >= SL_DAYS && !closed ? 'today' : slFmt(to - 1)}`
export const daysText = (n: number) => (n >= 14 ? `${Math.round(n / 7)} weeks` : `${n} day${n === 1 ? '' : 's'}`)
