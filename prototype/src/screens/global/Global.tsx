/* Global pages · owner S12. Home › Needs you (all properties) = SCR-05's entry to bulk (F-P1, D-151): grouped by kind,
 * each item names what, where and how many, and opens the same bulk sheet as the Grid (exceptions before apply).
 * The Calendar with the return chip lives in ./Calendar (R-073, D-158). Everything else is out of scope.
 * R-133 R-135 · D-123 (Needs you is a layer, IA-R rule 6) · D-150 D-151 */
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button, Guide, Icon, Mark, PageHeader, Pill, Tabs, useMode } from '../../ds'
import { MARKET } from '../../data/comps'
import { PROPERTY_ID } from '../../data/scenario'
import { useStore } from '../../store/store'
import { Page } from '../../shell/AppShell'
import { Placeholder } from '../../shell/Placeholder'
import type { BulkKind, BulkSetup } from '../portfolio/bulk'
import { BulkSheet } from '../portfolio/BulkSheet'
import { buildRows, type Row } from '../portfolio/rows'

export { CalendarPage } from './Calendar' // S12 · R-073 · D-158

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

interface Item { id: string; kind: 'Money' | 'Sync' | 'Content' | 'Suggestions' | 'Gaps' | 'Setup'; title: string; rows: Row[]; why: string; action: { label: string; bulk?: BulkKind; preset?: Partial<BulkSetup>; to?: string; team?: boolean } }

export function Dashboard() {
  const { pathname } = useLocation()
  const s = useStore()
  const m = useMode()
  const all = useMemo(() => buildRows(s), [s])
  const [sheet, setSheet] = useState<{ kind: BulkKind; rows: Row[]; preset?: Partial<BulkSetup> } | null>(null)
  const [asked, setAsked] = useState<string[]>([])
  const raw: Item[] = [
    // Audit, 4 Oct: no first-time setup item. Import is out of scope and Priya has no setup.
    { id: 'fee-low', kind: 'Money', title: `Cleaning fee below similar listings on ${plural(all.filter((r) => r.channels.includes('airbnb') && r.fee('airbnb').value < MARKET.medianCleaningFee).length, 'property', 'properties')}`,
      rows: all.filter((r) => r.channels.includes('airbnb') && r.fee('airbnb').value < MARKET.medianCleaningFee),
      why: `Similar listings on Airbnb charge a median €${MARKET.medianCleaningFee}. Each property is shown with its own value before anything changes.`, action: { label: 'Review per property', bulk: 'fee', preset: { channel: 'airbnb', feeMode: 'set', feeValue: MARKET.medianCleaningFee } } },
    { id: 'fee-differs', kind: 'Money', title: `Cleaning fee differs between Airbnb and Booking.com on ${plural(all.filter((r) => r.channels.includes('airbnb') && r.channels.includes('booking') && r.fee('airbnb').value !== r.fee('booking').value && !s.portfolio.cleared[r.p.id]?.conflicts).length, 'property', 'properties')}`,
      rows: all.filter((r) => r.channels.includes('airbnb') && r.channels.includes('booking') && r.fee('airbnb').value !== r.fee('booking').value && !s.portfolio.cleared[r.p.id]?.conflicts),
      why: 'Often on purpose (Booking.com’s commission). Decide once for all of them, or one by one.', action: { label: 'Decide for all', bulk: 'conflict' } },
    ...all.filter((r) => r.alert).map((r) => ({ id: `sync-${r.p.id}`, kind: 'Sync' as const, title: `${r.p.name} · ${r.alert!.text}`, rows: [r],
      why: r.alert!.kind === 'failed' ? 'The channel refused the last push. Everything else on the listing is live.' : 'Someone edited the listing on the channel. Hostaway hasn’t overwritten it: which one wins?',
      action: { label: r.alert!.kind === 'failed' ? 'Fix it' : 'Review the change', to: `/property/${r.p.id}/overview/channels` } })),
    { id: 'stale', kind: 'Content', title: `${all.filter((r) => r.d.descriptionAgeMonths >= 12).length} descriptions untouched for 12+ months`, rows: all.filter((r) => r.d.descriptionAgeMonths >= 12),
      why: 'Older text often misses what changed (a new desk, faster Wi-Fi). A strategy drafts a refresh per property. You check a sample first.', action: { label: 'Refresh with a strategy', bulk: 'strategy' } },
    { id: 'suggestions', kind: 'Suggestions', title: `${all.reduce((t, r) => t + (r.p.id === PROPERTY_ID ? 0 : r.pending.suggestions), 0)} suggestions waiting on ${plural(all.filter((r) => r.p.id !== PROPERTY_ID && r.pending.suggestions > 0).length, 'property', 'properties')}`,
      rows: all.filter((r) => r.p.id !== PROPERTY_ID && r.pending.suggestions > 0), why: 'Titles, highlights and photo order, from each record and similar listings.', action: { label: 'Review in bulk', bulk: 'accept' } },
    { id: 'wifi', kind: 'Gaps', title: `Wi-Fi speed missing on ${plural(all.filter((r) => !r.d.wifiSpeedKnown).length, 'property', 'properties')}`, rows: all.filter((r) => !r.d.wifiSpeedKnown),
      why: '6 of 10 top listings state a speed. The AI won’t invent one: someone has to run a speed test.', action: { label: 'Ask your team', team: true } },
  ]
  const items = raw.filter((i) => i.rows.length > 0)
  const groups = ['Money', 'Sync', 'Content', 'Suggestions', 'Gaps'] as const
  const total = items.reduce((t, i) => t + i.rows.length, 0)

  return (
    <Page>
      <PageHeader title="Home" />
      <div className="p-mt4"><Tabs items={[{ label: 'Today', to: '/home', end: true }, { label: `Needs you · all properties`, to: '/home/needs-you' }]} /></div>
      {pathname === '/home' || pathname === '/home/' ? (
        <div className="p-mt4">
          <section className="p-card">
            <div className="p-row p-sb p-hny"><div><b>Needs you</b> <span className="h-caption h-muted">· {items.length} {items.length === 1 ? 'item' : 'items'}, covering {plural(new Set(items.flatMap((i) => i.rows.map((r) => r.p.id))).size, 'property', 'properties')}</span></div><Link className="h-btn h-btn--primary" to="/home/needs-you" style={{ textDecoration: 'none' }}>Open</Link></div>
          </section>
          <Placeholder scr="—" owner="out of scope" title="Today: arrivals, departures, messages" />
        </div>
      ) : (
        <div className="p-mt4">
          <Guide id="home-ny" title="Everything that needs a person, across your homes"
            line={m.persona === 'P3' ? 'One item can cover many properties. Each opens a per-property preview with exceptions unticked.' : undefined}>
            Grouped by kind: money first. Each item says how many homes it covers and opens a preview of every change before anything happens.
          </Guide>
          <p className="h-small h-muted">{items.length} items · {total} property-level changes · sorted money → sync → content → gaps</p>
          {groups.map((g) => {
            const list = items.filter((i) => i.kind === g)
            if (!list.length) return null
            return (
              <div key={g} className="p-mt4">
                <div className="p-label">{g}</div>
                {list.map((i) => (
                  <section key={i.id} className="p-card p-mt2">
                    <div className="p-row p-sb p-hny" style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b>{i.title}</b>
                        <div className="h-small h-muted" style={{ marginTop: 2 }}>{i.why}</div>
                        <div className="p-row p-mt2" style={{ gap: 6 }}>
                          {i.rows.slice(0, 5).map((r) => <span key={r.p.id} className="h-pill h-pill--neutral">{r.p.nickname}</span>)}
                          {i.rows.length > 5 && <span className="h-caption h-muted">+{i.rows.length - 5} more</span>}
                          {i.kind === 'Sync' && i.rows[0].alert && <Mark channel={i.rows[0].alert.channel} />}
                        </div>
                      </div>
                      {i.action.to ? <Link className="h-btn h-btn--secondary" to={i.action.to} style={{ textDecoration: 'none' }}>{i.action.label}</Link>
                        : i.action.team ? (asked.includes(i.id) ? <Pill kind="recommended">Asked Jonas · due Fri</Pill> : <Button icon="users" onClick={() => { setAsked([...asked, i.id]); s.logOwner({ who: 'You', what: 'Asked the team: run a Wi-Fi speed test', scope: `${i.rows.length} properties`, applied: i.rows.length, skipped: 0, details: i.rows.map((r) => ({ property: r.p.name, result: 'applied' as const, note: 'Task for Jonas (listing coordinator)' })) }) }}>{i.action.label}</Button>)
                          : <Button kind={i.kind === 'Content' || i.kind === 'Suggestions' ? 'ai' : 'secondary'} icon={i.kind === 'Money' ? 'coin' : 'sparkles'} onClick={() => setSheet({ kind: i.action.bulk!, rows: i.rows, preset: i.action.preset })}>{i.action.label} · {i.rows.length}</Button>}
                    </div>
                  </section>
                ))}
              </div>
            )
          })}
          <p className="h-caption h-muted p-mt4"><Icon name="info-circle" size={16} /> Nothing here changes a channel on its own. Money edits save and sync with rates. Content waits for push, or for a rule you set.</p>
        </div>
      )}
      {sheet && <BulkSheet kind={sheet.kind} rows={sheet.rows} preset={sheet.preset} onClose={() => setSheet(null)} />}
    </Page>
  )
}

export function OutOfScope({ title }: { title: string }) {
  return (
    <Page>
      <PageHeader title={title} />
      <Placeholder scr="—" owner="out of scope" title={`${title} is unchanged`}>It works as it does today, and reads the same property record where it uses property facts.</Placeholder>{/* outside Angles A and B (MASTER-PLAN §4) */}
    </Page>
  )
}
