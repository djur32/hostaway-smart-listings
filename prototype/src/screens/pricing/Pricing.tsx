/* Pricing (property) · owner S12 · R-114 R-115 R-073 · D-154 D-158 · IA-R §3 Pricing (Rates · Fees & deposit · Taxes & discounts · Channel markups)
 * Two levels, one screen: every value shows where it comes from (group → property → channel) and how to change that.
 * Who sets the price, per channel, is the first thing on the page: "pricing not syncing as expected" (Gong) is mostly an
 * ownership question. A listing strategy can *suggest* a pricing stance here; it never applies one. Works for every
 * portfolio property (pricing is data), and the scenario property writes through the real record. */
import { useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Button, DecisionCard, Explainer, Guide, Icon, InheritChip, Lens, Mark, PageHeader, Pill, Tabs, Term, useMode } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { PROPERTY_RAIL, slug } from '../../data/ia'
import { PROPERTY_ID } from '../../data/scenario'
import { STRATEGIES } from '../../data/studio'
import type { ChannelId, PriceOwner, PricingStrategy } from '../../data/types'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { buildRows, type Row } from '../portfolio/rows'

const OWNER: Record<PriceOwner, { label: string; body: string }> = {
  'hostaway-dynamic': { label: 'Hostaway · Dynamic Pricing', body: 'Hostaway sets a price per night from demand, inside your min and max, and sends it.' },
  'hostaway-fixed': { label: 'Hostaway · your rates', body: 'Hostaway sends your base and weekend rates, plus the channel markup.' },
  channel: { label: 'Airbnb Smart Pricing', body: 'Airbnb sets the price. Hostaway reads it and sends nothing, so edits here won’t reach Airbnb.' },
  tool: { label: 'PriceLabs', body: 'A connected pricing tool sets the price. Hostaway passes it through; edit rates in PriceLabs.' },
  manual: { label: 'Set on the channel', body: 'Rates are managed in the channel’s extranet. Hostaway doesn’t send prices.' },
}

export function Pricing() {
  const p = useProperty()
  const { tab } = useParams()
  const [params, setParams] = useSearchParams()
  const loc = useLocation()
  const s = useStore()
  const rail = PROPERTY_RAIL.find((r) => r.key === 'pricing')!
  const tabs = rail.tabs ?? []
  const current = tabs.find((t) => slug(t) === tab)
  if (!current) return <Navigate to={`/property/${p.id}/pricing/${slug(tabs[0])}`} replace />
  const row = buildRows(s).find((r) => r.p.id === p.id)!
  const lens = (params.get('lens') as ChannelId | 'all' | null) ?? 'all'
  const setLens = (l: ChannelId | 'all') => { const n = new URLSearchParams(params); n.set('lens', l); setParams(n, { replace: true }) }
  const calendar = `/calendar?property=${p.id}&from=${encodeURIComponent(loc.pathname + loc.search)}`
  return (
    <>
      <PageHeader title="Pricing" property={p} right={<Lens channels={p.channels} value={lens} onChange={setLens} />} />
      <div className="p-mt4"><Tabs items={tabs.map((t) => ({ label: t, to: `/property/${p.id}/pricing/${slug(t)}` }))} /></div>
      <div className="p-mt4"><Guide id="pricing-levels" title="Most of these prices are shared by all your homes"
        line={<>Values marked <span className="h-inherit"><span className="h-inherit__dot" /></span> come from the {row.group.name} group; change them for this home with Override.</>}>
        Values with a hollow dot come from your {row.group.name} group, so changing the group changes them here too. To make this home different, press <b>Override</b>. You can always reset it.
      </Guide></div>
      {current === 'Rates' && <Rates row={row} lens={lens} calendar={calendar} />}
      {current === 'Fees & deposit' && <Fees row={row} lens={lens} />}
      {current === 'Taxes & discounts' && <Discounts row={row} lens={lens} />}
      {current === 'Channel markups' && <Markups row={row} />}
    </>
  )
}

/* ---------------- shared bits ---------------- */

function Field({ label, help, children, chip }: { label: ReactNode; help?: ReactNode; children: ReactNode; chip?: ReactNode }) {
  return (
    <div className="h-field-row">
      <div><p className="h-field-row__label">{label}</p>{help && <p className="h-field-row__help">{help}</p>}</div>
      <div className="h-field-row__control">{children}{chip && <div className="h-field-hint">{chip}</div>}</div>
    </div>
  )
}

/** A strategy value with its inheritance chip, override and reset (R-115). */
function Inherited<K extends keyof PricingStrategy>({ row, k, label, help, fmt, unit }: {
  row: Row; k: K; label: string; help?: string; fmt: (v: PricingStrategy[K]) => string; unit: '€' | '%' | 'nights'
}) {
  const s = useStore()
  const r = row.get(k)
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(String(r.value))
  const deep = row.p.id === PROPERTY_ID
  const save = () => {
    s.setPropertyOverride(row.p.id, k, Number(v) as PricingStrategy[K])
    if (deep) for (const c of row.channels.filter((c) => row.d.priceOwner[c]?.startsWith('hostaway')))
      s.queueChange({ channel: c, fieldId: 'price.base_nightly', label, before: fmt(r.value), after: fmt(Number(v) as PricingStrategy[K]), origin: 'studio' })
    setEditing(false)
  }
  return (
    <Field label={label} help={help} chip={
      r.level === 'group'
        ? <InheritChip level="group" from={`${row.group.name} group`} onOverride={() => { setV(String(r.value)); setEditing(true) }} />
        : <InheritChip level="property" from={`${row.group.name} group`} fromValue={fmt(r.groupValue)} onReset={() => s.setPropertyOverride(row.p.id, k, null)} />
    }>
      {editing ? (
        <div className="p-row" style={{ flexWrap: 'nowrap' }}>
          <span className="h-input-group" style={{ flex: 1 }}>
            {unit === '€' && <span className="h-affix h-affix--start">€</span>}
            <input className="h-input" type="number" value={v} onChange={(e) => setV(e.target.value)} aria-label={label} autoFocus />
            {unit !== '€' && <span className="h-affix h-affix--end">{unit}</span>}
          </span>
          <Button size="md" kind="primary" onClick={save}>Save</Button><Button size="md" kind="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="h-input-group" style={{ background: r.level === 'group' ? 'var(--color-bg-subtle)' : undefined }}>
          <span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>{fmt(r.value)}</span>
        </div>
      )}
    </Field>
  )
}

/* ---------------- Rates ---------------- */

function Rates({ row, lens, calendar }: { row: Row; lens: ChannelId | 'all'; calendar: string }) {
  const s = useStore()
  const m = useMode()
  const deep = row.p.id === PROPERTY_ID
  const sp = deep ? s.decisions.find((d) => d.id === 'smart-pricing') : undefined
  const owners: Partial<Record<ChannelId, PriceOwner>> = { ...row.d.priceOwner }
  if (deep && sp?.status === 'decided') owners.airbnb = sp.choice === 'hostaway' ? 'hostaway-fixed' : 'channel'
  const w = row.get('weekendPct')
  const dyn = row.get('dynamic')
  const strategies = deep ? (Object.entries(s.studio.strategy) as Array<[ChannelId, string | null]>).filter(([, id]) => id) : []
  const shown = row.channels.filter((c) => lens === 'all' || c === lens)
  return (
    <div className="p-mt4">
      <div className="p-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
        <div>
        <section className="p-card">
          <div className="p-row p-sb"><div className="p-label">Who sets the price</div><span className="h-caption h-muted">per <Term k="channel">channel</Term></span></div>
          <table className="h-table p-mt2">
            <tbody>
              {shown.map((c) => {
                const o = owners[c] ?? 'hostaway-fixed'
                return (
                  <tr key={c}>
                    <td style={{ width: 150 }}><Mark channel={c} /> {CHANNELS[c].name}</td>
                    <td><b>{OWNER[o].label}</b><div className="h-caption h-muted" style={{ whiteSpace: 'normal' }}>{OWNER[o].body}</div></td>
                    <td style={{ width: 150 }}>{o === 'channel' && sp && sp.status !== 'decided'
                      ? <Link className="h-link h-small" to={`/property/${row.p.id}/overview/needs-you?item=smart-pricing`}>Decide who sets it</Link>
                      : o === 'channel' ? <span className="h-caption h-muted">Your choice at import</span>
                        : (deep && !s.setup.live ? <span className="h-caption h-muted">Not sent yet: waits for go-live</span> : <span className="h-sync h-sync--ok"><span className="h-sync__dot" />Last sent {deep ? 'at go-live' : 'today'}</span>)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {new Set(shown.map((c) => owners[c] ?? 'hostaway-fixed')).size > 1 && (
            <p className="h-caption" style={{ margin: '8px 0 0' }}><Icon name="info-circle" size={16} /> Different owners on different channels. Changes below reach only the channels Hostaway prices.</p>
          )}
        </section>

        </div>
      <div className="p-col">
        <a className="h-ai-card" href="#dynamic" onClick={(e) => e.preventDefault()}>
          <Icon name="sparkles" />
          <div className="h-ai-card__main"><div className="h-ai-card__title">Dynamic Pricing <Pill kind="new">New</Pill></div>
            <div className="h-ai-card__body h-ai-card__body--aa">Opens here, in a side panel, not in the calendar (IA-R §4). Stance and limits come from the {row.group.name} group.</div></div>
          <Icon name="chevron-right" />
        </a>
        <section className="p-card">
          <div className="p-label">From your listing strategy</div>
          {strategies.length === 0 ? (
            <p className="h-small" style={{ margin: '6px 0 0' }}>No strategy chosen. In <Link className="h-link" to={`/property/${row.p.id}/home/listing-text`}>Listing text</Link>, a strategy like “Remote work” can suggest a pricing stance here. It never changes a price on its own.</p>
          ) : strategies.map(([c, id]) => {
            const st = STRATEGIES.find((x) => x.id === id)!
            return (
              <div key={c} className="p-mt2">
                <div className="h-small"><Mark channel={c} /> <b>{st.label}</b> on {CHANNELS[c].name}</div>
                <p className="h-small" style={{ margin: '4px 0' }}>{st.pricing.text}</p>
                <div className="h-caption h-muted">Where it lands: Pricing › {st.pricing.tab === 'rates' ? 'Rates' : 'Taxes & discounts'} · a suggestion, not a change</div>
                <Link className="h-link h-small" to={`/property/${row.p.id}/pricing/${st.pricing.tab}?suggest=${id}`}>Review the suggestion</Link>
              </div>
            )
          })}
        </section>
        {m.persona === 'P3' && <section className="p-card"><div className="p-label">For the whole group</div><p className="h-small" style={{ margin: '6px 0 0' }}>Change the {row.group.name} strategy once for {buildRows(s).filter((r) => r.group.id === row.group.id).length} homes.</p><Link className="h-link h-small" to={`/portfolio/groups?g=${row.group.id}`}>Open the group</Link></section>}
      </div>
      </div>
      <div style={{ maxWidth: 820 }}>
        <div className="h-section" style={{ paddingTop: 'var(--space-6)' }}>
          <div className="h-section__head"><div><div className="h-h4">Rates</div><p className="h-section__desc h-small">Strategy from the {row.group.name} group; the base rate is this home’s own.</p></div>
            <Link className="h-link h-small" to={calendar}><Icon name="calendar" size={16} /> See in calendar</Link></div>
          <Field label="Nightly base rate" help="This home’s own. Everything else starts from it." chip={<InheritChip level="property" from="this home" />}>
            <div className="h-input-group"><span className="h-affix h-affix--start">€</span><span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>{row.base}</span></div>
          </Field>
          <Inherited row={row} k="weekendPct" label="Weekend (Fri–Sat)" help={`= €${Math.round(row.base * (1 + w.value / 100))} a night`} fmt={(v) => `+${v}%`} unit="%" />
          <Inherited row={row} k="min" label="Minimum price" help="Dynamic Pricing never goes below this." fmt={(v) => `€${v}`} unit="€" />
          <Inherited row={row} k="max" label="Maximum price" fmt={(v) => `€${v}`} unit="€" />
          <Field label="Dynamic Pricing" help={dyn.value ? 'Adjusts each night from demand, inside your min and max.' : 'Off for this home: your base and weekend rates are sent as they are.'}
            chip={dyn.level === 'group' ? <InheritChip level="group" from={`${row.group.name} group`} onOverride={() => s.setPropertyOverride(row.p.id, 'dynamic', !dyn.value)} />
              : <InheritChip level="property" from={`${row.group.name} group`} fromValue={dyn.groupValue ? 'On' : 'Off'} onReset={() => s.setPropertyOverride(row.p.id, 'dynamic', null)} />}>
            <Pill kind={dyn.value ? 'recommended' : 'neutral'}>{dyn.value ? `On · ${row.get('stance').value === 'balanced' ? 'Balanced' : row.get('stance').value === 'fill' ? 'Fill the calendar' : 'Maximise the rate'}` : 'Off'}</Pill>
          </Field>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Fees & deposit ---------------- */

function Fees({ row, lens }: { row: Row; lens: ChannelId | 'all' }) {
  const s = useStore()
  const deep = row.p.id === PROPERTY_ID
  const dec = deep ? s.decisions.find((d) => d.id === 'fee-cleaning' && d.status !== 'decided') : undefined
  const chans = row.channels.filter((c) => c !== 'direct' && (lens === 'all' || c === lens))
  const [edit, setEdit] = useState<{ c: ChannelId; v: string } | null>(null)
  const f = (id: string) => (deep ? s.facts[id]?.value : null)
  const setFee = (c: ChannelId, v: number | null) => {
    if (deep) s.setOverride('fee.cleaning', c, v === null ? null : `€${v}`)
    else s.setChannelFee(row.p.id, c, v)
  }
  return (
    <div className="p-mt4" style={{ maxWidth: 820 }}>
      <div>
        {dec && <div style={{ marginBottom: 16 }}><DecisionCard d={dec} onDecide={(o, rule) => s.decide(dec.id, o, rule)} onLater={() => s.deferDecision(dec.id)} /></div>}
        <Field label="Cleaning fee" help={`Per stay. ${row.group.name} group default: €${row.group.pricing.cleaningFee}.`}>
          <div className="p-col" style={{ gap: 8 }}>
            {chans.map((c) => {
              const r = row.fee(c)
              return (
                <div key={c}>
                  {edit?.c === c ? (
                    <div className="p-row" style={{ flexWrap: 'nowrap' }}>
                      <span className="h-input-group" style={{ flex: 1 }}><span className="h-affix h-affix--start"><Mark channel={c} /></span><input className="h-input" type="number" value={edit.v} onChange={(e) => setEdit({ c, v: e.target.value })} aria-label={`Cleaning fee on ${CHANNELS[c].name}`} autoFocus /></span>
                      <Button size="md" kind="primary" onClick={() => { setFee(c, Number(edit.v)); setEdit(null) }}>Save</Button>
                    </div>
                  ) : (
                    <div className="h-input-group"><span className="h-affix h-affix--start"><Mark channel={c} /></span><span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>€{r.value}</span></div>
                  )}
                  <div className="h-field-hint">
                    {r.level === 'group' ? <InheritChip level="group" from={`${row.group.name} group`} onOverride={() => setEdit({ c, v: String(r.value) })} />
                      : r.level === 'channel' ? <InheritChip level="channel" channel={c} onReset={() => setFee(c, null)} />
                        : <InheritChip level="property" from={`${row.group.name} group`} fromValue={`€${r.groupValue}`} onReset={() => s.setPropertyOverride(row.p.id, 'cleaningFee', null)} />}
                    {edit?.c !== c && <button className="h-inherit__act h-caption" onClick={() => setEdit({ c, v: String(r.value) })}>Edit</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </Field>
        {deep && <>
          <Field label="Short-stay cleaning fee" help="Stays of 1–2 nights. Airbnb only: the other channels have no field for it." chip={<InheritChip level="channel" channel="airbnb" />}>
            <div className="h-input-group"><span className="h-affix h-affix--start"><Mark channel="airbnb" /></span><span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>{f('fee.cleaning_short_stay') ?? '—'}</span></div>
          </Field>
          <Field label="Extra guest fee" chip={<InheritChip level="property" from="this home" />}><div className="h-input-group"><span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>{f('fee.extra_guest') ?? '—'}</span></div></Field>
          <Field label="Pet fee" chip={<InheritChip level="property" from="this home" />}><div className="h-input-group"><span className="h-input" style={{ display: 'flex', alignItems: 'center', border: 0 }}>{f('fee.pet') ?? '—'}</span></div></Field>
        </>}
      </div>
      <div className="p-col p-mt4">
        <Explainer title="One fee, a value per channel">Fees that differ per channel are one fee with each channel’s value, never two fields (IA-R rule 3). A value set for one channel stays when the group default changes.</Explainer>
        {deep && s.queue.some((q) => q.fieldId === 'fee.cleaning') && <p className="h-small">Fee changes wait in <Link className="h-link" to={`/property/${row.p.id}/push`}>Review &amp; push</Link> like every other change.</p>}
      </div>
    </div>
  )
}

/* ---------------- Taxes & discounts ---------------- */

function Discounts({ row, lens }: { row: Row; lens: ChannelId | 'all' }) {
  const s = useStore()
  const [q] = useSearchParams()
  const suggest = q.get('suggest')
  const st = STRATEGIES.find((x) => x.id === suggest)
  const wk = row.get('weeklyDiscount')
  const [done, setDone] = useState(false)
  const chanDisc = row.get('channelDiscounts').value
  const chans = row.channels.filter((c) => lens === 'all' || c === lens)
  return (
    <div className="p-mt4" style={{ maxWidth: 820 }}>
      <div>
        {st && st.id === 'remote' && !done && (
          <div className="h-ai-suggest" style={{ marginBottom: 16 }}>
            <div className="h-ai-suggest__why"><Icon name="sparkles" size={16} />From your “{st.label}” listing strategy · {st.pricing.text}</div>
            <div className="p-pad">
              <div className="h-small">Weekly discount <span className="h-diff"><del>{wk.value}%</del> <ins>15%</ins></span> on every channel this home is on</div>
              <div className="h-caption h-muted p-mt2">6 similar remote-work listings nearby book 83% of nights. They give 15% for a week. A suggestion: nothing changes until you accept. Sample data</div>
              <div className="p-row p-mt3"><Button kind="primary" size="md" onClick={() => { s.setPropertyOverride(row.p.id, 'weeklyDiscount', 15); setDone(true) }}>Accept 15%</Button><Button size="md" kind="ghost" onClick={() => setDone(true)}>Not now</Button></div>
            </div>
          </div>
        )}
        <Inherited row={row} k="weeklyDiscount" label="Weekly discount" help="7 nights or more." fmt={(v) => `${v}%`} unit="%" />
        <Inherited row={row} k="monthlyDiscount" label="Monthly discount" help="28 nights or more." fmt={(v) => `${v}%`} unit="%" />
        {chans.map((c) => chanDisc[c] ? (
          <Field key={c} label={<><Mark channel={c} /> {CHANNELS[c].name} discounts</>} help="The live product shows these as “Direct Discounts”. Here they’re one discount with a value for this channel." chip={<InheritChip level="channel" channel={c} />}>
            <div className="h-small">Weekly {chanDisc[c]!.weekly}% · monthly {chanDisc[c]!.monthly}%</div>
          </Field>
        ) : null)}
        <Field label="Local taxes" help="City tax, collected per channel rules." chip={<InheritChip level="property" from="this home" />}><div className="h-small">Berlin City Tax 7.5% · Airbnb collects it; Booking.com: you collect</div></Field>
      </div>
      <div className="p-col p-mt4">
        {!row.channels.includes('direct') && <Explainer title="Direct discounts">This home has no Direct site yet. When it does, its discounts start from the group’s Direct values (weekly 5%, monthly 9%).</Explainer>}
      </div>
    </div>
  )
}

/* ---------------- Channel markups ---------------- */

function Markups({ row }: { row: Row }) {
  const s = useStore()
  const mk = row.get('markups')
  const [edit, setEdit] = useState<{ c: ChannelId; v: string } | null>(null)
  const save = () => { if (!edit) return; s.setPropertyOverride(row.p.id, 'markups', { ...mk.value, [edit.c]: Number(edit.v) }); setEdit(null) }
  return (
    <div className="p-mt4" style={{ maxWidth: 820 }}>
      <div>
        <table className="h-table">
          <thead><tr><th>Channel</th><th><Term k="markup">Markup</Term></th><th>€{row.base} base becomes</th><th>Comes from</th></tr></thead>
          <tbody>
            {row.channels.map((c) => {
              const v = mk.value[c] ?? 0
              return (
                <tr key={c}>
                  <td><Mark channel={c} /> {CHANNELS[c].name}</td>
                  <td>{edit?.c === c ? <span className="p-row" style={{ flexWrap: 'nowrap' }}><input className="h-input" style={{ width: 70 }} type="number" value={edit.v} onChange={(e) => setEdit({ c, v: e.target.value })} autoFocus aria-label={`Markup ${CHANNELS[c].name}`} /><Button size="md" kind="primary" onClick={save}>Save</Button></span> : <b>{v > 0 ? '+' : ''}{v}%</b>}</td>
                  <td className="p-num">€{(row.base * (1 + v / 100)).toFixed(2)}</td>
                  <td>{mk.level === 'group'
                    ? <InheritChip level="group" from={`${row.group.name} group`} onOverride={() => setEdit({ c, v: String(v) })} />
                    : <InheritChip level="property" from={`${row.group.name} group`} fromValue={`${mk.groupValue[c] ?? 0}%`} onReset={() => s.setPropertyOverride(row.p.id, 'markups', null)} />}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="h-caption h-muted">Markups apply before a price is sent, on top of Dynamic Pricing. Booking.com’s is usually its commission (contract-specific); Airbnb’s host-only fee is ~15.5% (channel-constraints §1).</p>
      </div>
      <div className="p-col p-mt4"><Explainer title="Why markups live per channel">It’s the one pricing setting that is per channel by nature, so it has its own tab. Everything else is one value with channel exceptions.</Explainer></div>
    </div>
  )
}

