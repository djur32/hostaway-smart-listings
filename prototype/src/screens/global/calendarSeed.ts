/* One "today" and one set of stays for both calendars (mobile audit H-08): the global /calendar (Calendar.tsx) and the
 * property's own Calendar page (PropertyCalendar.tsx) used to disagree (29 Sep vs the real date, stays vs none).
 * The scenario's grid starts Mon 28 Sep 2026; "today" is Tue 29 Sep 2026. */
import type { ChannelId } from '../../data/types'

/** Calendar arithmetic, not milliseconds: `START + i * 864e5` repeats 25 Oct when the clocks go back (DST). */
export const calDay = (i: number) => new Date(2026, 8, 28 + i)
/** Today, as an index from Mon 28 Sep 2026. */
export const TODAY = 1
/** Today as a date (midnight). */
export const TODAY_DATE = calDay(TODAY)

export interface Stay { from: number; to: number; guest: string; channel: ChannelId }
/** Seeded reservations for the scenario property: nights `from` … `to - 1`, as indices from 28 Sep 2026. */
export const STAYS: Stay[] = [
  { from: 3, to: 6, guest: 'Lena K.', channel: 'airbnb' }, { from: 10, to: 13, guest: 'Marco R.', channel: 'booking' },
  { from: 17, to: 19, guest: 'Aiko T.', channel: 'airbnb' }, { from: 23, to: 30, guest: 'Sam & Jo', channel: 'airbnb' },
]
/** The property whose stays are seeded. */
export const STAYS_PROPERTY = 'neukolln'

/** The stay covering a night (a date at midnight), if any. */
export function stayOn(date: Date): Stay | undefined {
  const i = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2026, 8, 28)) / 864e5)
  return STAYS.find((s) => i >= s.from && i < s.to)
}
/** The stay's first night as a date. */
export const stayStart = (s: Stay) => calDay(s.from)
/** The stay's last night as a date. */
export const stayEnd = (s: Stay) => calDay(s.to - 1)
