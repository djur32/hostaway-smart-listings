/* Channels › {channel} › Overview (V3-SPEC §1, NV-4a content area). Owner WS-CH.
 * The channel's status (last sync = the last change sent, since Save sends: QA A08, with a standing link to "Changes
 * sent"), a Status row (Online/Offline, not a "Listed" chip on the title: ), a strategy card, 1–2
 * meaningful tips (performance/gap-tied, each with its expected effect and one action — not a bare open-tips count:
 * ), a small performance strip, and one list of everything about the listing on this channel (merged
 * "specific to" + "set by": ). No "Recent changes" list (review 1
 * Oct — reachable from the last-sync line only). No channel selector: the channel is chosen in the menu.
 * URL states: ?smart=on|off
 * Multi-property (QA B01/B02): the meta, prices and amenities are the active property's (data/property-listing.ts); the
 * Autopilot log and the KPIs are the scenario property's only (other properties show a neutral "—"). */
import { useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  AutopilotBanner, KpiTile, Note, PageHead, Pill, SectionHead, SpecificList, SpecificRow, StatusStrip, SummaryCard, Icon,
} from '../../ds'
import { AUTOPILOT_LOG, LISTING_TABS, audienceLabel, goalLabel, type FieldDef, type ListingChannel } from '../../data/sl3'
import { channelPhotos } from '../../data/photos'
import { ago, receiptStatus, useNow, usePushUi } from '../push/changes'
import { classicFields, tabOfField } from '../../data/v3-ch'
import { availabilityFor, channelMetaFor, pricesFor } from '../../data/property-listing'
import { useIsScenario } from '../../store/selectors'
import { useStore } from '../../store/store'
import { useChannelTips } from '../../shell/ChannelTips'
import { PageBody, useProperty } from '../../shell/PropertyLayout'
import { CH_NAME, ChannelLead, useChannel, useChannelDemoParams, useChannelPlan, useFieldCustom, viewOf } from './common'

export function ChannelOverview() {
  const p = useProperty()
  const c = useChannel()
  useChannelDemoParams(c)
  if (!c) return <Navigate to={`/property/${p.id}/ch/airbnb`} replace />
  return <Overview c={c} />
}

/** A stored value as one readable line: checkout tasks by name, list lines ("- …") joined; CSS clamps it to two lines. */
function readable(f: FieldDef, v: string): string {
  if (!v) return 'Empty'
  if (f.kind === 'tasks') { const names = v.split('\n').filter(Boolean).map((l) => l.split(' | ')[0].trim()); return `${names.length} task${names.length === 1 ? '' : 's'}: ${names.join(', ')}` }
  return v.split('\n').map((l) => l.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean).join(' · ')
}

function Overview({ c }: { c: ListingChannel }) {
  const p = useProperty()
  const listedHere = useStore((s) => s.overview?.[p.id]?.listed?.[c] ?? true)
  const nav = useNavigate()
  const meta = channelMetaFor(p.id, c)
  const scenario = useIsScenario()
  const name = CH_NAME[c]
  const { on, active, plan, paused, autopilot } = useChannelPlan(c)
  const pause = useStore((s) => s.sl3Pause)
  const { pending } = useChannelTips(c)
  const { custom, base } = useFieldCustom(c)
  const lib = useStore((s) => s.photoLib)
  const sl3 = useStore((s) => s.sl3)
  const ui = usePushUi()
  const now = useNow()
  const base$ = `/property/${p.id}/ch/${c}`
  // photos: this channel's real set and cover, from the library (QA B18)
  const photos = useMemo(() => {
    const shown = channelPhotos(c, lib, { tips: sl3.tips, custom: sl3.custom }).shown
    return { own: !(lib.useBase?.[c] ?? c === 'direct'), line: `${shown.length} photos · cover: ${lib.meta[shown[0] ?? '']?.description ?? '—'}` }
  }, [c, lib, sl3.tips, sl3.custom])
  // what was sent to this channel, and what still waits (Knowledge Hub edits)
  const sent = ui.receipts.filter((r) => r.channel === c)
  const states = sent.map((r) => receiptStatus(r, now))
  const sync = sent.length
    ? { value: ago(sent[0].sentAt, now) === 'just now' ? 'Just now' : ago(sent[0].sentAt, now),
        sub: `${sent.length} change${sent.length === 1 ? '' : 's'} sent · ${states.includes('sent') ? 'Sending' : states.includes('review') ? `${states.filter((x) => x === 'review').length} in review` : 'Live'}` }
    : { value: meta.synced, sub: 'Everything you saved is live' }
  const applied = scenario ? AUTOPILOT_LOG.filter((x) => x.channel === c && x.state === 'applied').length : 0

  // Meaningful tips only: up to 2, money/performance-tied ones first, each with its own expected
  // effect (why[0]) and one action — not a bare "N open" count. Nothing shown when there's nothing worth surfacing.
  const meaningfulTips = useMemo(() => [...pending].sort((a, b) => Number(!!b.money) - Number(!!a.money)).slice(0, 2), [pending])

  // what differs from the Base on this channel: listing fields, prices, channel-only terms
  const specific = useMemo(() => {
    const rows: Array<{ key: string; label: string; sub: string; value: string; state: 'override' | 'only' | 'inherit' | 'channel' | 'set'; to: string; toLabel: string }> = []
    for (const t of LISTING_TABS) for (const f of classicFields(t.id, c)) {
      const sub = `Listing · ${LISTING_TABS.find((x) => x.id === tabOfField(f.key))!.label}`
      if (f.kind === 'photos') { if (photos.own) rows.push({ key: f.key, label: f.label, sub, value: photos.line, state: 'override', to: `${base$}/listing/${tabOfField(f.key)}`, toLabel: 'Edit' }); continue }
      const v = viewOf(f, c, custom, base)
      if (v.state === 'override' && v.value === v.base) continue // custom in name only: the same text as the Base
      if (v.state === 'override' || v.state === 'only') rows.push({ key: f.key, label: f.label, sub, value: readable(f, v.value), state: v.state, to: `${base$}/listing/${tabOfField(f.key)}`, toLabel: 'Edit' })
    }
    if (c === 'booking' && !rows.some((r) => r.key === 'description')) {
      const t = pending.find((x) => x.field === 'description')
      rows.push({ key: 'description', label: 'Description', sub: 'Booking.com shows its own text', value: 'Uses the Base description', state: 'inherit', to: `${base$}/listing/essentials${on && t ? `?tip=${t.id}` : ''}`, toLabel: 'Write one for Booking.com' })
    }
    for (const r of Object.values(pricesFor(p.id)).flat()) {
      const st = r.state[c]
      if (st === 'override' || st === 'only') rows.push({ key: r.key, label: r.label, sub: 'Pricing', value: r.unit === '€' ? `€${r.value?.[c]}` : `${r.value?.[c]}%`, state: st, to: `${base$}/pricing`, toLabel: 'Edit' })
    }
    for (const r of availabilityFor(p.id)) {
      const cv = custom?.[`avail:${r.key}`]
      const st = typeof cv === 'string' ? 'override' : cv === null ? 'inherit' : r.state[c]
      if (st === 'override') rows.push({ key: r.key, label: r.label, sub: 'Availability', value: typeof cv === 'string' ? cv : r.value?.[c] ?? r.base, state: 'override', to: `${base$}/availability`, toLabel: 'Edit' })
    }
    for (const o of meta.only) rows.push({ key: o.label, label: o.label, sub: o.sub, value: o.value, state: 'channel', to: `${base$}/${o.to}`, toLabel: 'Edit' })
    // "Set by {channel}" folded in here too: one list for everything about this listing on this
    // channel, not two sections split by where a value comes from.
    for (const [k, v] of meta.owned) rows.push({ key: k, label: k, sub: `${name} decides this`, value: v, state: 'set' as const, to: '', toLabel: '' })
    return rows
  }, [c, custom, base, pending, on, base$, meta.only, meta.owned, photos, p.id, name])
  const customCount = specific.filter((r) => r.state !== 'inherit').length

  return (
    <PageBody>
      <div className="ch-page">
        <PageHead lead={<ChannelLead c={c} />} title={name} property={p} />

        <div className="ch-stack ch-mt">
          {active && (autopilot || paused) && plan.mode === 'autopilot' && (
            <AutopilotBanner channel={c} strategy={`${goalLabel(plan.goal)} · ${audienceLabel(plan.audience)}`} paused={paused}
              sub={paused ? `Nothing changes on ${name} until you resume. Tips still arrive.` : `${applied} change${applied === 1 ? '' : 's'} applied this week inside your guardrails · money and rules still ask you`}
              onPause={() => pause(c, !paused)} onSee={() => nav(`/property/${p.id}/smart/strategy`)} />
          )}

          <StatusStrip items={[
            { label: 'Connection', value: meta.connection, sub: meta.account, ok: true },
            // the last-sync line is the one standing way to "Changes sent" now that Recent changes is gone
            { label: 'Last sync', value: sync.value, sub: sync.sub }, // no "See all changes" link (remove it everywhere)
            // Status, not a "Listed" chip on the title: Online/Offline, from the property Overview's listed toggle (QA B15)
            listedHere ? { label: 'Status', value: 'Online', sub: meta.liveSub, ok: true } : { label: 'Status', value: 'Offline', sub: 'Guests can’t search or book', ok: false },
          ]} />

          <div className="ch-cards">
            {on ? (
              // 1–2 meaningful tips, each with its own expected effect and one action; nothing shown when none qualify
              meaningfulTips.map((t) => (
                <SummaryCard key={t.id} eyebrow={<><Icon name="sparkles" size={16} />Tip</>} title={t.title}
                  foot={<Link className="h-link" to={`${base$}/listing/${tabOfField(t.field)}?tip=${t.id}`}>Review</Link>}>
                  {t.why[0].text}
                </SummaryCard>
              ))
            ) : (
              <SummaryCard eyebrow={<><Icon name="sparkles" size={16} />Tips</>} title="Off"
                foot={<Link className="h-link" to={`/property/${p.id}/overview`}>Turn on Smart Listings</Link>}>
                Tips for {name} come with Smart Listings: small, checked changes to your listing, one at a time.
              </SummaryCard>
            )}
            {active ? (
              <SummaryCard eyebrow={<><Icon name="target" size={16} />Strategy</>}
                foot={<Link className="h-link" to={`/property/${p.id}/smart/strategy`}>Edit strategy</Link>}>
                <span className="ch-strategy"><Icon name="target" />{goalLabel(plan.goal)} · {audienceLabel(plan.audience)}<Pill kind="ai">{plan.mode === 'autopilot' ? (paused ? 'Autopilot paused' : 'Autopilot') : 'Suggest'}</Pill></span>
                <p>Guardrails: €{plan.priceMin}–{plan.priceMax} a night. Prices, rules and cancellation always ask you.</p>
              </SummaryCard>
            ) : on ? (
              <SummaryCard eyebrow={<><Icon name="target" size={16} />Strategy</>} title={<span className="ch-card__title--md">Not used on {name}</span>}
                foot={<Link className="h-link" to={`/property/${p.id}/smart/setup`}>Open setup</Link>}>
                {name} keeps your listing as it is. Add it in Smart Listings setup to get a strategy here.
              </SummaryCard>
            ) : null}
          </div>

          <div>
            <SectionHead title="Performance" desc="Last 30 days on this channel." actions={active ? <Link className="h-link h-small" to={`/property/${p.id}/smart/performance`}>See performance</Link> : undefined} />
            <div className="h-kpis ch-mt">
              <KpiTile label="Occupancy" value={meta.kpis ? `${meta.kpis.occ}%` : '—'} delta={meta.kpis?.occDelta} vs="vs last month" />
              <KpiTile label="Average nightly rate" value={meta.kpis ? `€${meta.kpis.adr}` : '—'} delta={meta.kpis?.adrDelta} down={meta.kpis?.down?.includes('adr')} vs="vs last month" />
              <KpiTile label="Average stay" value={meta.kpis ? `${meta.kpis.stay} nights` : '—'} delta={meta.kpis?.stayDelta} vs="vs last month" />
              <KpiTile label="RevPAR" value={meta.kpis ? `€${meta.kpis.revpar}` : '—'} delta={meta.kpis?.revparDelta} vs="vs last month" />
            </div>
          </div>

          <div>
            {/* one list for everything about this listing on this channel, with a neutral heading (drop
               the "specific to / set by" framing entirely, not just merge the two sections under one of those names).
               Per-row scope captions ("Set by Airbnb" etc.) stay — they're what tells the host what they can't edit. */}
            <SectionHead title={`On ${name}`}
              desc={specific.length ? `${customCount} value${customCount === 1 ? ' differs from the Base, is set by the channel, or exists' : 's differ from the Base, are set by the channel, or exist'} only here. Everything else uses the Base.` : `Everything on ${name} uses the Base.`} />
            {specific.length > 0 ? (
              <div className="ch-mt"><SpecificList>
                {specific.map((r) => <SpecificRow key={r.key} label={r.label} sub={r.sub} value={r.value} state={r.state} channel={c} to={r.to} toLabel={r.toLabel} />)}
              </SpecificList></div>
            ) : (
              <div className="ch-mt"><Note icon="layers-intersect">Your site shows the Base listing, prices and policies. Customize any value from Listing, Pricing or Policies.</Note></div>
            )}
          </div>
        </div>
      </div>
    </PageBody>
  )
}
