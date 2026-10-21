/* Channels as Hospitable shows them (ds/channels/README.md). Marks come from the DS sprite (#ch-*).
 * Limits and write reach: research/market/channel-constraints.md (REAL·PUBLIC) — the numbers the UI enforces before commit. */
import type { ChannelId } from './types'

export interface ChannelInfo {
  id: ChannelId
  name: string
  /** Sprite id of the mark, e.g. #ch-airbnb. Direct uses Hospitable's mark. */
  mark: 'airbnb' | 'booking' | 'vrbo' | 'hospitable' | 'google'
  /** Letter chip modifier (h-ch--*). */
  letter: 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'google'
  titleLimit: number | null
  /** Can Hospitable write the free-text description here today? (D-032) */
  writesDescription: boolean
  /** One-line honesty about what the channel owns (I-06, channel-constraints §5). */
  note: string
}

export const CHANNELS: Record<ChannelId, ChannelInfo> = {
  airbnb: {
    id: 'airbnb', name: 'Airbnb', mark: 'airbnb', letter: 'airbnb', titleLimit: 50, writesDescription: true,
    note: 'An edit made on Airbnb stops that field syncing from Hospitable until you choose which one wins.',
  },
  booking: {
    id: 'booking', name: 'Booking.com', mark: 'booking', letter: 'booking', titleLimit: 255, writesDescription: false,
    note: 'Booking.com writes its own description from your facts, in 25+ languages. Name changes are reviewed.',
  },
  vrbo: {
    id: 'vrbo', name: 'Vrbo', mark: 'vrbo', letter: 'vrbo', titleLimit: 40, writesDescription: true,
    note: 'Vrbo reorders photos itself and overwrites edits made on Vrbo.',
  },
  direct: {
    id: 'direct', name: 'Direct', mark: 'hospitable', letter: 'direct', titleLimit: 300, writesDescription: true,
    note: 'Your own site: the only channel Hospitable fully owns.',
  },
  google: {
    id: 'google', name: 'Google', mark: 'google', letter: 'google', titleLimit: 300, writesDescription: true,
    note: 'A feed from your Direct site. Vacation rentals need at least 8 photos, one per room.',
  },
}

export const channelName = (c: ChannelId) => CHANNELS[c].name

/** "Airbnb", "Airbnb and Booking.com", "Airbnb, Booking.com and Direct" — for a property's own channels, so copy never
 *  names a channel it doesn't have. */
export const channelList = (cs: ChannelId[]) => {
  const n = cs.map(channelName)
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
}
/** Replaces the `{otas}` token in help/copy with the property's OTAs (every channel but Direct), capitalising the
 *  following word if the sentence now starts with it. Falls back to the raw text if there are no OTAs to name. */
export function withOtas(text: string, channels: ChannelId[]): string {
  const otas = channels.filter((c) => c !== 'direct')
  // {otas|lock|locks}: the verb that agrees with one OTA vs several (write the plural form first)
  let out = text.replace(/\{otas\|([^|}]+)\|([^}]+)\}/g, (_, plural: string, singular: string) => (otas.length === 1 ? singular : plural))
  if (!out.includes('{otas}')) return out
  if (!otas.length) return out.replace('{otas} ', '').replace(/^[a-z]/, (m) => m.toUpperCase())
  return out.replace('{otas}', channelList(otas))
}
