/* Channels › {channel} › Availability: the weekday picker (HS-38 "Restricted check-in / checkout") and the per-channel
 * matrix (HS-39 Instant book). CSS: ds/components.css "Weekday picker" (.h-days, .h-day) and .h-matrix (+ --stack, disabled). */
import type { Ref } from 'react'
import { Mark } from './primitives'
import type { ChannelId } from '../data/types'

export const WEEKDAYS = [
  { id: 'Sun', short: 'S', name: 'Sunday' }, { id: 'Mon', short: 'M', name: 'Monday' }, { id: 'Tue', short: 'T', name: 'Tuesday' },
  { id: 'Wed', short: 'W', name: 'Wednesday' }, { id: 'Thu', short: 'T', name: 'Thursday' }, { id: 'Fri', short: 'F', name: 'Friday' },
  { id: 'Sat', short: 'S', name: 'Saturday' },
] as const

/** A set of days as stored text ("None" or "Fri, Sat", always Sunday-first) and back. */
export const parseDays = (v: string): string[] => (!v || v === 'None' ? [] : v.split(',').map((x) => x.trim()).filter(Boolean))
export const formatDays = (days: string[]): string => {
  const on = WEEKDAYS.filter((d) => days.includes(d.id)).map((d) => d.id)
  return on.length ? on.join(', ') : 'None'
}

/** Seven square toggle buttons, Sunday first (Hospitable's order). Pressed = guests can't arrive / leave that day. */
export function Weekdays({ value, onChange, label, disabled, firstRef }: {
  value: string; onChange?: (v: string) => void; label: string; disabled?: boolean
  /** The first day, so "Customize for {channel}" / "Edit for all channels" can move focus into the picker. */
  firstRef?: Ref<HTMLButtonElement>
}) {
  const days = parseDays(value)
  const toggle = (id: string) => onChange?.(formatDays(days.includes(id) ? days.filter((d) => d !== id) : [...days, id]))
  return (
    <div className="h-days" role="group" aria-label={label}>
      {WEEKDAYS.map((d, i) => (
        <button key={d.id} ref={i === 0 ? firstRef : undefined} type="button" className="h-day" aria-label={d.name}
          aria-pressed={days.includes(d.id)} disabled={disabled} onClick={() => toggle(d.id)}>{d.short}</button>
      ))}
    </div>
  )
}

/** Hospitable's per-channel matrix (HS-39 Instant book): one row per channel, one radio column per option.
 *  ≤ 767px it stacks (.h-matrix--stack): each channel, then its options as radio rows with title + sub-line. */
export function ChannelMatrix({ name, label, columns, rows }: {
  name: string; label: string
  columns: Array<{ id: string; label: string; sub: string }>
  rows: Array<{ channel: ChannelId; title: string; value: string; onChange: (id: string) => void; disabled?: boolean; unavailable?: string[] }>
}) {
  return (
    <div className="h-matrix h-matrix--stack">
      <table aria-label={label}>
        <thead><tr><th>Channel</th>{columns.map((o) => <th key={o.id}>{o.label}<small>{o.sub}</small></th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.channel} role="radiogroup" aria-label={`${label}: ${r.title}`}>
              <td><span><Mark channel={r.channel} size={14} />{r.title}</span></td>
              {columns.map((o) => {
                const na = r.unavailable?.includes(o.id)
                return (
                  <td key={o.id}>
                    <label className="h-matrix__cell" title={na ? `Not available on ${r.title}` : undefined}>
                      <input className="h-radio" type="radio" name={`${name}-${r.channel}`} checked={r.value === o.id} disabled={r.disabled || na}
                        aria-label={`${o.label}${na ? ` (not available on ${r.title})` : ''}`} onChange={() => r.onChange(o.id)} />
                      <span className="h-matrix__opt" aria-hidden="true">{o.label}<small>{na ? `Not available on ${r.title}` : o.sub}</small></span>
                    </label>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
