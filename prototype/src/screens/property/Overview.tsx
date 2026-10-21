/* Overview · owner S10 · SCR-01/02 landing (Needs you), Channels (status + receipts), Nickname & IDs.
 * Spec: concepts/convergence/DIRECTION.md §SCR-01/02 · frames C4r-SCR-01, C4r-SCR-02.
 * R-002 R-003 R-020 R-086 · D-123 D-129 D-130 D-137 */
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ChannelChip, Explainer, Icon, PageHeader, Pill, SyncBadge, Tabs } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId } from '../../data/types'
import { useStore } from '../../store/store'
import { Placeholder } from '../../shell/Placeholder'
import { PageBody, useProperty } from '../../shell/PropertyLayout'
import { NeedsYou } from './needsyou'

/** First-time setup (SCR-02 reconcile) at /property/:id/overview/needs-you. Since the v3 Overview replaced the tabs
 *  (Channels and IDs now live in its Connected channels rows), this page carries only Needs you. Old links keep working. */
export function SetupPage() {
  const p = useProperty()
  const live = useStore((s) => s.setup.live)
  return (
    <PageBody>
      <PageHeader title="First-time setup" property={p}
        sub={p.deep ? (live ? <>Imported from Airbnb and Booking.com · 29 Sep · live, with receipts</> : <>Imported from Airbnb and Booking.com · 29 Sep 13:46 · <b>nothing written to either channel yet</b></>) : undefined} />
      {p.deep ? <NeedsYou /> : <Placeholder scr="SCR-02" owner="S10" title="First-time setup">Only the scenario property is modelled in depth.</Placeholder>}
    </PageBody>
  )
}

export function Overview() {
  const p = useProperty()
  const { tab = 'needs-you' } = useParams()
  const live = useStore((s) => s.setup.live)
  const base = `/property/${p.id}/overview`
  return (
    <>
      <PageHeader title="Overview" property={p}
        sub={p.deep ? (live ? <>Imported from Airbnb and Booking.com · 29 Sep · live, with receipts</> : <>Imported from Airbnb and Booking.com · 29 Sep 13:46 · <b>nothing written to either channel yet</b></>) : undefined} />
      <div className="p-mt4"><Tabs items={[{ label: 'Needs you', to: `${base}/needs-you` }, { label: 'Channels', to: `${base}/channels` }, { label: 'Nickname & IDs', to: `${base}/ids` }]} /></div>
      {!p.deep ? <Placeholder scr="SCR-05" owner="S12" title="Portfolio property">Only the scenario property is modelled in depth. S12 adds portfolio rows here.</Placeholder>
        : tab === 'needs-you' ? <NeedsYou />
        : tab === 'channels' ? <Channels />
        : <Ids />}
    </>
  )
}

/** Status per channel: connection, listing status, calendar, last push receipts (ia/recommendation.md §3). */
function Channels() {
  const s = useStore()
  const nav = useNavigate()
  const p = useProperty()
  const chans: ChannelId[] = ['airbnb', 'booking']
  return (
    <div className="p-grid-2c p-mt4 p-ovgrid">
      {chans.map((c) => {
        const rs = s.receipts.filter((r) => r.channel === c).slice(-5).reverse()
        const l = s.listings[c as 'airbnb' | 'booking']
        return (
          <div key={c} className="p-card">
            <div className="p-row p-sb"><ChannelChip channel={c} /><Pill kind="managed">{l.status === 'listed' ? 'Listed' : l.status}</Pill></div>
            <div className="p-col p-mt3" style={{ gap: 8 }}>
              <div className="p-row p-sb h-small"><span>Connection</span><SyncBadge state="in-sync" channel={c} /></div>
              <div className="p-row p-sb h-small"><span>Calendar &amp; reservations</span><span className="h-sync h-sync--ok"><span className="h-sync__dot" />Live since connect</span></div>
              <div className="p-row p-sb h-small"><span>Listing content</span>{s.setup.live ? <span className="h-sync h-sync--ok"><span className="h-sync__dot" />Managed by Hostaway</span> : <span className="h-caption h-muted">Read only until you go live</span>}</div>
              <div className="p-row p-sb h-small"><span>{c === 'booking' ? 'Description' : 'Rooms & beds'}</span><span className="h-caption h-muted">{c === 'booking' ? 'Written by Booking.com' : 'Owned by Airbnb'}</span></div>
            </div>
            <div className="p-label p-mt4">Last receipts</div>
            {rs.length === 0 ? <p className="h-small h-muted" style={{ margin: '4px 0 0' }}>Nothing sent yet.</p>
              : rs.map((r) => <div key={r.id} className="p-row p-sb h-small p-mt2"><span>{r.label}</span><span className="h-caption">{r.state === 'live' ? `Live on ${CHANNELS[c].name}` : r.state === 'in-review' ? 'In review' : r.reason}</span></div>)}
            <div className="p-row p-mt4"><Button size="md" onClick={() => nav(`/property/${p.id}/listing/${c}/status-and-receipts`)}>Open Listings › {CHANNELS[c].name}</Button></div>
          </div>
        )
      })}
      <div style={{ gridColumn: '1 / -1' }}>
        <Explainer title="Connect another channel" icon="plus">Vrbo and Direct read the same record. <button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => nav('/import/second-channel')}>Connect <Icon name="arrow-right" size={16} /></button></Explainer>
      </div>
    </div>
  )
}

function Ids() {
  const s = useStore()
  return (
    <div className="p-card p-mt4" style={{ maxWidth: 640 }}>
      <div className="p-row p-sb h-small"><span>Nickname (only your team sees it)</span><b>{s.facts['identity.nickname']?.value}</b></div>
      <div className="p-row p-sb h-small p-mt3"><span>Airbnb listing ID</span><code>{s.listings.airbnb.externalId}</code></div>
      <div className="p-row p-sb h-small p-mt3"><span>Booking.com property ID</span><code>{s.listings.booking.externalId}</code></div>
    </div>
  )
}
