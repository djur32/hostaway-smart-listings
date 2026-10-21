/* SCR-05 · Properties › Activity (owner audit log) · owner S12 · R-133 · J-12 · D-151
 * Every bulk change, group change and rule-driven autopilot change: who, what, where, applied / skipped / in review, and
 * per property why. Filterable by owner and exportable, because P3 answers to 27 owners (INT-3). */
import { useState } from 'react'
import { Button, Dropdown, Icon, Pill } from '../../ds'
import { useStore } from '../../store/store'

export function Activity() {
  const log = useStore((s) => s.portfolio.log)
  const [owner, setOwner] = useState('All owners')
  const [open, setOpen] = useState<string | null>(log[0]?.id ?? null)
  const owners = ['All owners', 'Owner: Weber', 'Owner: Lindqvist', 'Owner: Okafor']
  const list = owner === 'All owners' ? log : log.filter((e) => e.scope.includes(owner) || e.details.some((d) => d.note?.includes(owner)))
  const exportCsv = () => {
    const rows = [['When', 'Who', 'What', 'Property', 'Result', 'Note'], ...list.flatMap((e) => e.details.map((d) => [e.at, e.who, e.what, d.property, d.result, d.note ?? '']))]
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hospitable-activity.csv'; a.click()
  }
  return (
    <div className="p-mt4">
      <div className="p-row p-sb">
        <span className="h-small h-muted">Every change made to more than one property, by a person or by a rule. Kept for 24 months.</span>
        <span className="p-row">
          <Dropdown style={{ width: 220 }} label="Filter by owner" value={owner} onChange={setOwner} options={owners} />
          <Button icon="file-text" onClick={exportCsv}>Export for owners (CSV)</Button>
        </span>
      </div>
      <div className="p-mt3">
        {list.map((e) => (
          <section key={e.id} className="p-card" style={{ marginBottom: 8 }}>
            <button onClick={() => setOpen(open === e.id ? null : e.id)} style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, width: '100%' }} aria-expanded={open === e.id}>
              <span>
                <b>{e.what}</b>
                <div className="h-caption h-muted">{new Date(e.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {e.who} · {e.scope}{e.rule && <> · under rule {e.rule}</>}</div>
              </span>
              <span className="p-row" style={{ gap: 6 }}>
                <Pill kind="recommended">{e.applied} applied</Pill>
                {!!e.inReview && <Pill kind="new">{e.inReview} in review</Pill>}
                {e.skipped > 0 && <Pill kind="warning">{e.skipped} skipped</Pill>}
                <Icon name={open === e.id ? 'chevron-up' : 'chevron-down'} />
              </span>
            </button>
            {open === e.id && (
              <table className="h-grid p-mt3">
                <tbody>{e.details.map((d, i) => (
                  <tr key={i} className={d.result === 'skipped' ? 'is-excluded' : ''}>
                    <td style={{ width: 260 }}>{d.property}</td>
                    <td style={{ width: 110 }}>{d.result === 'applied' ? <span className="p-ok">Applied</span> : d.result === 'in review' ? 'In review' : d.result === 'rejected' ? <span className="p-warn">Rejected</span> : 'Skipped'}</td>
                    <td className="h-caption" style={{ whiteSpace: 'normal' }}>{d.note}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
