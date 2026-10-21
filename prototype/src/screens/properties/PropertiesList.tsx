/* SCR-05 (entry) · Properties › List · owner S12 (Grid view, Groups, bulk) · S09 ships the list only.
 * Reached from the property rail's "‹ Back" (the global Properties item lands on the property itself). Every cell reads
 * the same per-property data the property pages use (audit PL-1, 3 Oct): channels = propertyChannels (the rail),
 * cleaning fee = pricesFor + the host's saved `price:*` edits (Pricing), min stay = availabilityFor + saved `avail:*`
 * edits (Availability), status = the Overview's Listed / Sync settings and the Smart Listings switch.
 * R-133 · D-110 rule 10 · D-123 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Marks, PageHeader, Tabs, useIsMobile } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { PORTFOLIO, propertyChannels, smartListingsDefaultOn } from '../../data/portfolio'
import { availabilityFor, pricesFor } from '../../data/property-listing'
import type { FieldDef, ListingChannel } from '../../data/sl3'
import { propertySlices } from '../../store/selectors'
import { useStore, type State } from '../../store/store'
import { Page } from '../../shell/AppShell'
import { useAccount } from '../../shell/useAccount'
import { viewOf } from '../channel/common'
import { PROPERTIES_TABS } from '../portfolio/Portfolio'

type Row = { key: string; label: string; base: string; state: FieldDef['state']; value?: Partial<Record<ListingChannel, string>> }

/** One value per connected channel (same resolution as the channel pages: Base → channel, with saved edits). */
function perChannel(r: Row | undefined, prefix: string, chs: ListingChannel[], sl3: State['sl3'] | undefined) {
  if (!r) return { base: '', diff: [] as Array<{ c: ListingChannel; v: string }> }
  const baseEdits = sl3?.base ?? {}
  const def = { key: `${prefix}:${r.key}`, tab: 'essentials', label: r.label, kind: 'text', state: r.state, base: r.base, value: r.value } as FieldDef
  const base = baseEdits[def.key] ?? r.base
  const diff = chs.filter((c) => r.state[c]).map((c) => ({ c, v: viewOf(def, c, sl3?.custom[c], baseEdits).value })).filter((x) => x.v !== base)
  return { base, diff }
}

function Cell({ base, diff, fmt }: { base: string; diff: Array<{ c: ListingChannel; v: string }>; fmt: (v: string) => string }) {
  return <>{fmt(base)}{diff.map((d) => <div key={d.c} className="h-caption h-muted">{CHANNELS[d.c].name} {fmt(d.v)}</div>)}</>
}

const euro = (v: string) => `€${v.replace(/^€/, '')}`
const nights = (v: string) => (/night/.test(v) ? v : `${v} ${v === '1' ? 'night' : 'nights'}`)

export function PropertiesList() {
  const s = useStore()
  const { properties } = useAccount() // the signed-in account's properties (D-160)
  const mobile = useIsMobile()
  const rows = useMemo(() => PORTFOLIO.filter((p) => properties.includes(p.id)).map((p) => {
    const snap = propertySlices(s, p.id)
    const chs = propertyChannels(p.id)
    const sl3 = snap?.sl3
    const fees = pricesFor(p.id).fees.find((r) => r.key === 'cleaning')
    const cleaning = perChannel(fees && { ...fees, base: String(fees.base), value: fees.value && Object.fromEntries(Object.entries(fees.value).map(([c, v]) => [c, String(v)])) }, 'price', chs, sl3)
    const minStay = perChannel(availabilityFor(p.id).find((r) => r.key === 'min_stay'), 'avail', chs, sl3)
    const ov = snap?.overview?.[p.id]
    const unlisted = chs.filter((c) => ov?.listed?.[c] === false)
    const smart = snap ? snap.smartListings : smartListingsDefaultOn(p.id)
    return { p, chs, cleaning, minStay, unlisted, sync: ov?.sync ?? true, smart }
  }), [s, properties])
  return (
    <Page wide>
      <PageHeader title="Properties" right={<Link className="h-btn h-btn--primary h-props__connect" to="/import">Connect a channel</Link>} />
      {/* Groups, Rules and Activity are about many properties: they appear once an account has more than one (D-162) */}
      {/* phones (Antonio, 4 Oct): out of the case study's reach — the property is the feature */}
      {rows.length > 1 && !mobile && <div className="p-mt4"><Tabs items={PROPERTIES_TABS} /></div>}
      {rows.length === 0 ? (
        <div className="p-mt6">
          <Empty title="No properties yet" icon="building">
            <p style={{ margin: 0 }}>Connect Airbnb or Booking.com and your listings arrive here. Nothing changes on them until you’ve seen what we found.</p>
            <Link className="h-btn h-btn--primary p-mt3" to="/import">Connect a channel</Link>
          </Empty>
        </div>
      ) : <table className="h-table p-stack p-stack--3 p-stack--link p-mt4">
        <thead><tr><th>Property</th><th>Channels</th><th>Cleaning fee</th><th>Min stay</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map(({ p, chs, cleaning, minStay, unlisted, sync, smart }) => (
            <tr key={p.id}>
              <td className="h-table__name"><Link to={`/property/${p.id}/overview`} className="h-link h-link--neutral">{p.name}</Link></td>
              <td data-label="Channels"><Marks channels={chs} /></td>
              <td data-label="Cleaning fee"><Cell {...cleaning} fmt={euro} /></td>
              <td data-label="Min stay"><Cell {...minStay} fmt={nights} /></td>
              <td className="p-stack__full">
                {!sync ? <span className="h-sync h-sync--pending"><span className="h-sync__dot" />Sync off</span>
                  : unlisted.length === chs.length ? <span className="h-sync h-sync--failed"><span className="h-sync__dot" />Unlisted</span>
                  : unlisted.length ? <span className="h-sync h-sync--pending"><span className="h-sync__dot" />Unlisted on {unlisted.map((c) => CHANNELS[c].name).join(', ')}</span>
                  : <span className="h-sync h-sync--ok"><span className="h-sync__dot" />Listed</span>}
                <div className="h-caption h-muted">Smart Listings {smart ? 'on' : 'off'}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
    </Page>
  )
}
