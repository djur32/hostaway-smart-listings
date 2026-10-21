/* SCR-05 · Properties › Groups · owner S12 · R-114 R-115 · D-154
 * A group holds the portfolio-level pricing strategy. Every property inherits it unless it overrides a value; a change
 * to the group shows who follows and who keeps their own value BEFORE it applies (exceptions first, I-15). */
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AUTONOMY_NAME, Button, Dropdown, Guide, Mark, NumberField, Pill, Term, Toast } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId, PricingStrategy } from '../../data/types'
import { useStore } from '../../store/store'
import { buildRows } from './rows'

type Key = 'stance' | 'dynamic' | 'weekendPct' | 'min' | 'max' | 'weeklyDiscount' | 'monthlyDiscount' | 'cleaningFee' | 'minStay'
const ROWS: Array<{ k: Key; label: string; fmt: (v: PricingStrategy[Key]) => string; unit?: string }> = [
  { k: 'stance', label: 'Dynamic Pricing stance', fmt: (v) => ({ balanced: 'Balanced', fill: 'Fill the calendar', rate: 'Maximise the rate' } as Record<string, string>)[String(v)] },
  { k: 'dynamic', label: 'Dynamic Pricing', fmt: (v) => (v ? 'On' : 'Off') },
  { k: 'weekendPct', label: 'Weekend (Fri–Sat) over base', fmt: (v) => `+${v}%`, unit: '%' },
  { k: 'min', label: 'Minimum nightly price', fmt: (v) => `€${v}`, unit: '€' },
  { k: 'max', label: 'Maximum nightly price', fmt: (v) => `€${v}`, unit: '€' },
  { k: 'weeklyDiscount', label: 'Weekly discount', fmt: (v) => `${v}%`, unit: '%' },
  { k: 'monthlyDiscount', label: 'Monthly discount', fmt: (v) => `${v}%`, unit: '%' },
  { k: 'cleaningFee', label: 'Cleaning fee', fmt: (v) => `€${v}`, unit: '€' },
  { k: 'minStay', label: 'Minimum stay', fmt: (v) => `${v} nights`, unit: 'nights' },
]

export function Groups() {
  const s = useStore()
  const [q, setQ] = useSearchParams()
  const gid = q.get('g') ?? 'berlin'
  const g = s.portfolio.groups.find((x) => x.id === gid) ?? s.portfolio.groups[0]
  const rows = useMemo(() => buildRows(s).filter((r) => r.group.id === g.id), [s, g.id])
  const [edit, setEdit] = useState<{ k: Key; v: number | string | boolean } | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const overriding = (k: Key) => rows.filter((r) => r.get(k).level === 'property')

  const apply = () => {
    if (!edit) return
    const row = ROWS.find((r) => r.k === edit.k)!
    const follow = rows.filter((r) => r.get(edit.k).level === 'group')
    const keep = overriding(edit.k)
    s.setGroupPricing(g.id, edit.k, edit.v as never)
    s.logOwner({ who: 'You', what: `${g.name} group · ${row.label}: ${row.fmt(g.pricing[edit.k])} → ${row.fmt(edit.v as never)}`, scope: `${g.name} · ${rows.length} properties`,
      applied: follow.length, skipped: keep.length,
      details: [...follow.map((r) => ({ property: r.p.name, result: 'applied' as const })), ...keep.map((r) => ({ property: r.p.name, result: 'skipped' as const, note: `Keeps its own value: ${row.fmt(r.get(edit.k).value as never)}` }))] })
    setDone(`${follow.length} properties follow the new ${row.label.toLowerCase()}; ${keep.length} keep their own value.`)
    setEdit(null)
  }

  return (
    <div className="p-grid-3 p-groups p-mt4">
      <div className="p-col">
        <div className="p-label">Groups</div>
        {s.portfolio.groups.map((x) => (
          <button key={x.id} className="p-card p-card--pick" aria-current={x.id === g.id} onClick={() => { setQ({ g: x.id }); setEdit(null); setDone(null) }}>
            <b>{x.name}</b> <span className="h-caption h-muted">· {buildRows(s).filter((r) => r.group.id === x.id).length} properties</span>
            <div className="h-caption h-muted">{x.note}</div>
          </button>
        ))}
        <p className="h-caption h-muted">A property belongs to one group. Groups are how a portfolio sets prices once and still lets a unit be different.</p>
      </div>

      <div>
        <Guide id="groups" title="Set it once for the group; change it for one home when it should differ"
          line={<>Every property inherits these values. An <Term k="override">override</Term> on a property wins, and stays when the group changes.</>}>
          The values here apply to every home in the group. When one home should be different, change it on that home’s Pricing page: it becomes an <Term k="override">override</Term> and stays when you change the group.
        </Guide>
        <div className="p-row p-sb p-mt4"><div className="h-h4">{g.name} · pricing strategy</div><span className="h-caption h-muted">Applies to {rows.length} properties</span></div>
        <table className="h-table p-stack p-mt2">
          <thead><tr><th>Setting</th><th>Group value</th><th>Properties that override it</th><th /></tr></thead>
          <tbody>
            {ROWS.map((row) => {
              const own = overriding(row.k)
              const editing = edit?.k === row.k
              return (
                <tr key={row.k}>
                  <td className="p-stack__head">{row.label}</td>
                  <td data-label="Group value">{editing ? (
                    row.k === 'stance' ? (
                      <Dropdown label={row.label} value={String(edit.v)} onChange={(v) => setEdit({ k: row.k, v })}
                        options={[{ value: 'balanced', label: 'Balanced' }, { value: 'fill', label: 'Fill the calendar' }, { value: 'rate', label: 'Maximise the rate' }]} />
                    ) : row.k === 'dynamic' ? (
                      <Dropdown label={row.label} value={String(edit.v)} onChange={(v) => setEdit({ k: row.k, v: v === 'true' })} options={[{ value: 'true', label: 'On' }, { value: 'false', label: 'Off' }]} />
                    ) : <span className="p-groups__num"><NumberField label={row.label} value={String(edit.v)} onChange={(v) => setEdit({ k: row.k, v: Number(v.replace(/[^0-9.]/g, '')) })}
                      currency={row.unit === '€' ? '€' : undefined} unit={row.unit === '%' ? '%' : undefined} max={row.unit === '%' ? 100 : 99999} /></span>
                  ) : <b>{row.fmt(g.pricing[row.k])}</b>}</td>
                  <td className="h-caption" data-label="Properties that override it">{own.length === 0 ? <span className="h-muted">None</span> : <span title={own.map((r) => `${r.p.name}: ${row.fmt(r.get(row.k).value as never)}`).join('\n')}>{own.length}: {own.slice(0, 2).map((r) => `${r.p.nickname} ${row.fmt(r.get(row.k).value as never)}`).join(', ')}{own.length > 2 ? '…' : ''}</span>}</td>
                  <td className="p-stack__full">{!editing && <button className="h-link" style={{ background: 'none', border: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => { setEdit({ k: row.k, v: g.pricing[row.k] as number }); setDone(null) }}>Change</button>}</td>
                </tr>
              )
            })}
            <tr>
              <td className="p-stack__head">Listing markups</td>
              <td colSpan={2} className="p-stack__full"><span className="p-row" style={{ gap: 12 }}>{(Object.entries(g.pricing.markups) as Array<[ChannelId, number]>).map(([c, v]) => <span key={c} className="h-small"><Mark channel={c} /> {v > 0 ? '+' : ''}{v}%</span>)}</span></td>
              <td className="h-caption h-muted p-stack__full">Per property in Pricing</td>
            </tr>
            <tr>
              <td className="p-stack__head">Channel discounts</td>
              <td colSpan={3} className="h-small p-stack__full">{Object.keys(g.pricing.channelDiscounts).length ? (Object.entries(g.pricing.channelDiscounts) as Array<[ChannelId, { weekly: number; monthly: number }]>).map(([c, d]) => <span key={c}><Mark channel={c} /> {CHANNELS[c].name}: weekly {d.weekly}%, monthly {d.monthly}%</span>) : <span className="h-muted">Same on every channel</span>}</td>
            </tr>
            <tr>
              <td className="p-stack__head">Smart Listings · what the AI may do</td>
              <td colSpan={3} className="h-small p-stack__full"><Pill kind="ai">{AUTONOMY_NAME[s.persona === 'P3' ? 'auto-review' : 'suggest']}</Pill> <span className="h-muted">inherited by every property unless it sets its own</span>{/* D-145 */}</td>
            </tr>
          </tbody>
        </table>
        {done && <Toast key={done} onClose={() => setDone(null)}>{done} Logged in Activity.</Toast>}
      </div>

      <div className="p-col">
        {edit ? (() => {
          const row = ROWS.find((r) => r.k === edit.k)!
          const follow = rows.filter((r) => r.get(edit.k).level === 'group')
          const keep = overriding(edit.k)
          return (
            <section className="p-card">
              <div className="p-label">Before it applies</div>
              <p className="h-small"><b>{row.label}</b>: {row.fmt(g.pricing[edit.k])} → <b>{row.fmt(edit.v as never)}</b></p>
              <div className="h-small"><b>{follow.length}</b> follow it</div>
              <ul className="h-caption" style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{follow.slice(0, 6).map((r) => <li key={r.p.id}>{r.p.name}</li>)}{follow.length > 6 && <li>and {follow.length - 6} more</li>}</ul>
              <div className="h-small"><b>{keep.length}</b> keep their own value</div>
              <ul className="h-caption" style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{keep.map((r) => <li key={r.p.id}>{r.p.name}: {row.fmt(r.get(edit.k).value as never)}</li>)}</ul>
              <div className="p-row"><Button onClick={() => setEdit(null)}>Cancel</Button><Button kind="primary" onClick={apply}>Apply to {follow.length}</Button></div>
            </section>
          )
        })() : (
          <section className="p-card">
            <div className="p-label">How inheritance reads</div>
            <p className="h-small"><span className="h-inherit"><span className="h-inherit__dot" /> Inherited from the group</span></p>
            <p className="h-small"><span className="h-inherit h-inherit--property"><span className="h-inherit__dot" /> This property’s own value</span></p>
            <p className="h-small"><span className="h-inherit h-inherit--channel"><span className="h-inherit__dot" /> Differs on one channel</span></p>
            <p className="h-caption h-muted">Group → property → channel. The most specific wins. A property’s Pricing page shows the chain and lets you override or reset.</p>
            <Link className="h-link h-small" to="/property/neukolln/pricing/rates">See it on Beautiful Artist Apt.</Link>
          </section>
        )}
      </div>
    </div>
  )
}
