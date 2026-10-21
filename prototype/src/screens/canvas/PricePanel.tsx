/* WS-CV · the Canvas's price panel (Antonio, 3 Oct, 2nd pass: "the cleaning fee, if you can change it directly from
 * here, that would be great; the pricing per night, this is something you might be able to change"). The booking
 * card's nightly line and cleaning fee open this in the one right-hand slot: Pricing's own rows (screens/channel/
 * common.tsx ScopedRow + ds NumberField), with the same Uses the Base / Custom / Edit for all channels actions and
 * the same `price:<key>` draft keys Pricing writes, so the one Discard / Save bar commits them and Pricing shows them.
 * Everything else about price (weekend rate, markup, discounts) stays in Pricing, one link away. */
import { Link } from 'react-router-dom'
import { Icon, Locked, NumberField } from '../../ds'
import { pricesFor, type PriceLine } from '../../data/property-listing'
import { canvasPriceLine } from './facts'
import type { ListingChannel } from '../../data/sl3'
import type { PriceTab } from '../../data/v3-ch'
import type { SL3State } from '../../store/store'
import { DraftProvider, ScopedRow, type SectionDraft } from '../channel/common'

export type PriceKey = 'nightly' | 'cleaning'
const TAB: Record<PriceKey, PriceTab> = { nightly: 'base', cleaning: 'fees' }

/** The page parts that open this panel, per channel, and the Pricing rows each one edits. Airbnb itemises the
 *  nightly line and the cleaning fee; Booking.com shows one total (both rows); Direct shows the nightly price at the
 *  top of its card and the cleaning line below. The Airbnb service fee and the totals are not editable. */
export const PRICE_AREAS: Record<ListingChannel, Record<string, PriceKey[]>> = {
  airbnb: { nightly: ['nightly'], cleaning: ['cleaning'] },
  booking: { price: ['nightly', 'cleaning'] },
  direct: { price: ['nightly'], cleaning: ['cleaning'] },
}
export const priceKeysFor = (ch: ListingChannel, areaId: string): PriceKey[] | undefined => PRICE_AREAS[ch][areaId]

/** What the page shows: Pricing's rows with this channel's markup (facts.ts canvasPriceLine), read from the store +
 *  draft for every property — the scenario one included — so the page matches the Pricing screen (audit C-3). */
export const canvasPrice = (pid: string, ch: ListingChannel, s: SL3State): PriceLine => canvasPriceLine(pid, ch, s)

export function PricePanel({ pid, channel, keys, draft }: { pid: string; channel: ListingChannel; keys: PriceKey[]; draft: SectionDraft }) {
  const rows = pricesFor(pid)
  return (
    <div className="cv-fp">
      <DraftProvider value={draft}>
        {keys.map((key) => {
          const r = rows[TAB[key]].find((x) => x.key === key)
          const st = r?.state[channel]
          if (!r || !st) return null
          return (
            <div key={key} className={keys.length > 1 ? 'cv-fp__field cv-fp__field--labelled' : 'cv-fp__field'}>
              <ScopedRow c={channel} k={`price:${key}`} label={r.label} help={r.help} orig={st} baseValue={String(r.base)}
                chValue={r.value?.[channel] !== undefined ? String(r.value[channel]) : undefined} setBy={r.setBy?.[channel]} hubTo={`/property/${pid}/hub`}
                control={(v, write, locked, disabled, refs) => locked ? <Locked fixed={!!r.setBy?.[channel]}>€{v}</Locked> : (
                  <NumberField label={r.label} value={v} disabled={disabled} inputRef={refs.input} inputMode="decimal" decimals={2} max={99999}
                    currency="€" per={key === 'cleaning' ? 'per stay' : undefined}
                    onChange={(next) => write(next.replace(/[^0-9.]/g, ''))} />
                )} />
            </div>
          )
        })}
      </DraftProvider>
      <Link className="cv-lockpop__link" to={`/property/${pid}/ch/${channel}/pricing`}>Weekend rate, markup and discounts in Pricing<Icon name="arrow-right" size={16} /></Link>
    </div>
  )
}
