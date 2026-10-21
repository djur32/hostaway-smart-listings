/* F-P1 · Bulk sheet · SCR-05 · owner S12 · R-133 R-116 · D-151 D-152 D-153
 * scope → per-unit diff with exceptions (before) → sample review for AI output → apply → receipt (applied / skipped / in
 * review) → owner log → "make it a rule". Nothing reaches a channel except through push (D-129): content is queued, and
 * inside a portfolio rule's autonomy it pushes after a review window. Money edits save to the record at once. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet, Button, ChannelChip, CloseButton, Icon, Mark, NumberField, Pill, Segmented, useIsMobile } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { STRATEGIES } from '../../data/studio'
import { PROPERTY_ID } from '../../data/scenario'
import type { ChannelId } from '../../data/types'
import { useStore } from '../../store/store'
import { BULK_ACTIONS, DEFAULT_SETUP, TITLE, propose, sample, type BulkKind, type BulkSetup, type UnitLine } from './bulk'
import type { Row } from './rows'

type Step = 'setup' | 'preview' | 'review' | 'done'

export function BulkSheet({ kind, rows, onClose, preset }: { kind: BulkKind; rows: Row[]; onClose: () => void; preset?: Partial<BulkSetup> }) {
  const s = useStore()
  const nav = useNavigate()
  const mobile = useIsMobile()
  const ai = BULK_ACTIONS.find((a) => a.kind === kind)?.ai
  const [setup, setSetup] = useState<BulkSetup>({ ...DEFAULT_SETUP, ...(kind === 'strategy' || kind === 'accept' ? { channel: 'airbnb' } : {}), ...preset })
  const [step, setStep] = useState<Step>(kind === 'accept' || kind === 'conflict' ? 'preview' : 'setup')
  const lines = useMemo(() => propose(kind, rows, setup, s.portfolio.rules), [kind, rows, setup, s.portfolio.rules])
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const key = (l: UnitLine) => `${l.row.p.id}.${l.channel ?? ''}`
  const inc = (l: UnitLine) => !l.blocked && (picked[key(l)] ?? l.include)
  const going = lines.filter(inc)
  const skipped = lines.filter((l) => !inc(l))
  const [checks, setChecks] = useState<Record<string, 'ok' | 'reject' | 'skip'>>({})
  const [result, setResult] = useState<UnitLine[] | null>(null)
  const samples = useMemo(() => sample(lines.map((l) => ({ ...l, include: inc(l) }))), [lines, picked]) // eslint-disable-line react-hooks/exhaustive-deps
  const rejectedInSample = samples.filter((l) => checks[key(l)] === 'reject').length
  const sampleDone = samples.every((l) => checks[key(l)])
  const autonomy = s.persona === 'P3' ? 'auto-review' : 'suggest'

  const apply = (subset: UnitLine[]) => {
    const ids = subset.map((l) => l.row.p.id)
    // The scenario property is the real record: write through the same actions S10/S11 use.
    const deep = subset.filter((l) => l.row.p.id === PROPERTY_ID)
    for (const l of deep) {
      if (kind === 'fee' && l.channel) s.setOverride('fee.cleaning', l.channel, l.next)
      if (kind === 'conflict') {
        const d = s.decisions.find((x) => x.id === 'fee-cleaning')
        if (d) s.decide(d.id, setup.resolution === 'keep' ? 'keep' : setup.resolution === 'airbnb' ? 'a' : 'b', true) // group €30 = Booking.com's value here
      }
      if (kind === 'titles' && (l.channel === 'airbnb' || l.channel === 'booking')) s.setListingField(l.channel, 'title', l.next)
      if (kind === 'strategy' && l.channel) s.setStrategy(l.channel, setup.strategy)
      if (kind === 'accept') for (const g of s.suggestions.filter((x) => x.status === 'proposed')) s.acceptSuggestion(g.id)
      if (kind === 'push' && l.channel) s.push(l.channel)
    }
    for (const l of subset.filter((x) => x.row.p.id !== PROPERTY_ID)) {
      if (kind === 'fee' && l.channel) s.setChannelFee(l.row.p.id, l.channel, Number(l.next.replace(/\D/g, '')))
    }
    if (kind === 'conflict') s.clearPending(ids, 'conflicts')
    if (kind === 'accept') s.clearPending(ids, 'suggestions')
    if (kind === 'push') s.clearPending(ids, 'suggestions')
    const mark = kind === 'fee' ? `Fee ${CHANNELS[setup.channel].name} ${subset[0]?.next ?? ''}` : kind === 'titles' ? `New ${CHANNELS[setup.channel].name} title` : kind === 'strategy' ? `Strategy · ${STRATEGIES.find((x) => x.id === setup.strategy)?.label}` : kind === 'accept' ? 'Suggestions accepted' : kind === 'conflict' ? 'Conflict resolved' : 'Pushed'
    if (kind !== 'push') s.markProperties(ids, mark)
    const res = subset.map((l) => ({ ...l, outcome: kind === 'fee' || kind === 'conflict' ? ('live' as const) : l.outcome }))
    s.logOwner({
      who: s.persona === 'P3' ? 'You (ops manager)' : 'You', what: TITLE[kind](setup), scope: `${new Set(ids).size} of ${new Set(lines.map((l) => l.row.p.id)).size} selected properties`,
      applied: res.filter((l) => l.outcome === 'live' || l.outcome === 'queued').length, inReview: res.filter((l) => l.outcome === 'in review').length, skipped: skipped.length,
      details: [...res.map((l) => ({ property: l.row.p.name, result: (l.outcome === 'in review' ? 'in review' : l.outcome === 'rejected' ? 'rejected' : 'applied') as 'applied' | 'in review' | 'rejected', note: `${l.channel ? CHANNELS[l.channel].name + ': ' : ''}${l.now} → ${l.next}` })),
        ...skipped.map((l) => ({ property: l.row.p.name, result: 'skipped' as const, note: l.blocked ?? l.why ?? 'Unticked' }))],
    })
    setResult(res)
    setStep('done')
  }

  const note = step === 'setup' ? `${rows.length} properties selected` : step === 'preview' ? 'Nothing has changed yet.' : step === 'review' ? `${Object.keys(checks).length} of ${samples.length} checked` : 'Logged in Activity, for your owners.'
  const steps = (
          <div className="h-steps-inline">
            {(['setup', 'preview', ...(ai ? ['review'] : []), 'done'] as Step[]).map((x, i, all) => (
              <span key={x} className={all.indexOf(step) > i ? 'is-done' : ''}>{i > 0 && '→ '}{x === step ? <b>{STEP_LABEL[x]}</b> : STEP_LABEL[x]}</span>
            ))}
          </div>
  )
  const body = (
    <>
          {step === 'setup' && <Setup kind={kind} setup={setup} onChange={(p) => setSetup({ ...setup, ...p })} rows={rows} />}

          {step === 'preview' && (
            <>
              <p className="h-small" style={{ marginTop: 0 }}>
                <b>{going.length}</b> will change · <b>{skipped.length}</b> won’t{lines.some((l) => l.blocked?.startsWith('Rule')) && <> · <span className="p-warn">a rule stops {lines.filter((l) => l.blocked?.startsWith('Rule')).length}</span></>}.
                {' '}Exceptions are unticked with the reason. Tick one to include it anyway; rules and channels can’t be overridden here.
              </p>
              <Diff lines={lines} inc={inc} onToggle={(l, v) => setPicked({ ...picked, [key(l)]: v })} ai={!!ai} />
            </>
          )}

          {step === 'review' && (
            <>
              <p className="h-small" style={{ marginTop: 0 }}>
                Check <b>{samples.length}</b> of {going.length} first: the lowest-confidence drafts, and one at random. If they’re right, approve the rest.
                {' '}If you reject one, we’ll ask you to review all of them.
              </p>
              {samples.map((l) => {
                const c = checks[key(l)]
                return (
                  <div key={key(l)} className={`h-sample${l.blocked ? ' is-stop' : c === 'ok' ? ' is-ok' : ' is-check'}`}>
                    <Icon name={l.blocked ? 'alert-triangle' : c === 'ok' ? 'circle-check' : 'sparkles'} />
                    <div>
                      <div className="h-small"><b>{l.row.p.name}</b> {l.channel && <ChannelChip channel={l.channel} />} <Pill kind={l.confidence === 'High' ? 'recommended' : l.confidence === 'Medium' ? 'warning' : 'error'}>{l.confidence} confidence</Pill></div>
                      <div className="h-diff p-mt2"><del>{l.now}</del> <ins>{l.next}</ins></div>
                      <div className="h-sample__why">{l.blocked ? `Hard stop · ${l.blocked}. Can’t be approved in bulk: edit it in the property, or skip it.` : l.reason}</div>
                    </div>
                    <div className="p-row" style={{ gap: 6 }}>
                      {!l.blocked && <><Button size="md" onClick={() => setChecks((c) => ({ ...c, [key(l)]: 'ok' }))}>Looks right</Button>
                        <Button size="md" kind="ghost" onClick={() => setChecks((c) => ({ ...c, [key(l)]: 'reject' }))}>Reject</Button></>}
                      {l.blocked && (checks[key(l)] === 'skip' ? <span className="h-caption h-muted">Skipped · stays as it is</span> : <Button size="md" kind="ghost" onClick={() => setChecks((c) => ({ ...c, [key(l)]: 'skip' }))}>Skip it</Button>)}
                    </div>
                  </div>
                )
              })}
              {rejectedInSample > 0 && (
                <div className="h-explainer p-mt3"><Icon name="alert-triangle" /><div><div className="h-explainer__title">You rejected {rejectedInSample} of {samples.length}</div>
                  That’s a signal the rest may need a look too. Review all {going.length} one by one, or approve only the ones you checked.</div></div>
              )}
            </>
          )}

          {step === 'done' && result && <Done kind={kind} result={result} skipped={skipped} autonomy={autonomy} />}
    </>
  )
  const foot = (
    <>
          {step === 'setup' && <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => setStep('preview')}>Preview changes</Button></>}
          {step === 'preview' && <>
            {kind !== 'accept' && kind !== 'conflict' && <Button onClick={() => setStep('setup')}>Back</Button>}
            {ai ? <Button kind="primary" disabled={!going.length} onClick={() => setStep('review')}>Check a sample ({Math.min(3, going.length)})</Button>
              : <Button kind="primary" disabled={!going.length} onClick={() => apply(going)}>Apply to {going.length}</Button>}
          </>}
          {step === 'review' && <>
            <Button onClick={() => setStep('preview')}>Review all {going.length}</Button>
            {rejectedInSample > 0
              ? <Button kind="primary" onClick={() => apply(going.filter((l) => checks[key(l)] === 'ok'))}>Apply only the {going.filter((l) => checks[key(l)] === 'ok').length} I checked</Button>
              : <Button kind="primary" disabled={!sampleDone} onClick={() => apply(going.filter((l) => checks[key(l)] !== 'reject'))}>Approve the {going.filter((l) => checks[key(l)] !== 'reject').length}</Button>}
          </>}
          {step === 'done' && <>
            {(kind === 'fee' || kind === 'titles' || kind === 'strategy') && <Button icon="shield-check" onClick={() => { onClose(); nav(`/portfolio/rules?from=${kind}&channel=${setup.channel}`) }}>Make it a rule</Button>}
            {kind !== 'push' && kind !== 'fee' && kind !== 'conflict' && <Button onClick={() => { onClose(); nav('/portfolio/activity') }}>See the log</Button>}
            <Button kind="primary" onClick={onClose}>Done</Button>
          </>}
    </>
  )
  // phones: a full-screen bottom sheet over everything, the same pattern as every drawer (ds/mobile.md §7); the note rides at the end of the body
  if (mobile) return (
    <BottomSheet open fullScreen title={TITLE[kind](setup)} onClose={onClose} footer={foot} label={TITLE[kind](setup)}>
      <div className="p-bulksheet-m">{steps}{body}<p className="h-small h-muted">{note}</p></div>
    </BottomSheet>
  )
  return (
    <>
      <div className="h-sheet-scrim" onClick={onClose} />
      <aside className="h-sheet p-bulksheet" role="dialog" aria-label={TITLE[kind](setup)}>
        <header className="h-sheet__head">
          <div className="p-row p-sb p-bulksheet__top">
            <h2 className="h-sheet__title">{TITLE[kind](setup)}</h2>
            <CloseButton onClick={onClose} />
          </div>
          {steps}
        </header>

        <div className="h-sheet__body">{body}</div>

        <footer className="h-sheet__foot"><span className="h-small h-muted">{note}</span>{foot}</footer>
      </aside>
    </>
  )
}

const STEP_LABEL: Record<Step, string> = { setup: 'Choose', preview: 'Preview per property', review: 'Check a sample', done: 'Receipt' }

function Setup({ kind, setup, onChange, rows }: { kind: BulkKind; setup: BulkSetup; onChange: (p: Partial<BulkSetup>) => void; rows: Row[] }) {
  const chans = (['airbnb', 'booking', 'vrbo', 'direct'] as ChannelId[]).filter((c) => rows.some((r) => r.channels.includes(c)))
  const count = (c: ChannelId) => rows.filter((r) => r.channels.includes(c)).length
  return (
    <div className="p-col">
      {kind !== 'push' && kind !== 'conflict' && (
        <div><div className="p-label">On</div>
          <div className="p-mt2"><Segmented label="Channel" value={setup.channel} onChange={(c) => onChange({ channel: c })}
            items={chans.map((c) => ({ id: c, label: <><Mark channel={c} /> {CHANNELS[c].name} · {count(c)}</> }))} /></div>
        </div>
      )}
      {kind === 'strategy' && (
        <div><div className="p-label">Strategy</div>
          <div className="p-row p-mt2">{STRATEGIES.map((st) => (
            <button key={st.id} className="h-chip" aria-pressed={setup.strategy === st.id} onClick={() => onChange({ strategy: st.id })}><Icon name={st.icon} />{st.label}</button>
          ))}</div>
          <p className="h-caption h-muted">{STRATEGIES.find((x) => x.id === setup.strategy)?.effect} It proposes a title, an opening and the first photos per property, from each record. It never applies on its own.</p>
        </div>
      )}
      {kind === 'titles' && (
        <p className="h-small">One title per property, written from its own record, inside {CHANNELS[setup.channel].name}’s limit ({CHANNELS[setup.channel].titleLimit} characters){setup.channel === 'booking' ? '. Booking.com reviews name changes, so these go live after its review.' : '.'} Your rules apply: {useStore.getState().portfolio.rules.filter((r) => r.on && r.field === 'title').map((r) => r.id).join(', ') || 'none'}.</p>
      )}
      {kind === 'fee' && (
        <div><div className="p-label">Cleaning fee</div>
          <div className="p-row p-mt2">
            <Segmented label="Mode" value={setup.feeMode} onChange={(m) => onChange({ feeMode: m, feeValue: m === 'set' ? 32 : 5 })} items={[{ id: 'set', label: 'Set to' }, { id: 'add', label: 'Change by' }]} />
            <span className="p-bulk__num"><NumberField label="Cleaning fee" currency="€" value={String(setup.feeValue)} min={setup.feeMode === 'add' ? -999 : 0}
              onChange={(v) => onChange({ feeValue: Number(v.replace(/[^0-9.-]/g, '')) || 0 })} /></span>
            <span className="h-small h-muted">per stay, on {CHANNELS[setup.channel].name} only</span>
          </div>
          <p className="h-caption h-muted">Other channels keep their value. Properties with their own value are shown as exceptions, not overwritten.</p>
        </div>
      )}
      {kind === 'push' && (
        <p className="h-small">Everything waiting on the selected properties goes to each channel, with a receipt per property. A channel that rejected the last push is held back until it’s fixed.</p>
      )}
    </div>
  )
}

function Diff({ lines: all, inc, onToggle, ai }: { lines: UnitLine[]; inc: (l: UnitLine) => boolean; onToggle: (l: UnitLine, v: boolean) => void; ai: boolean }) {
  // Units the channel can't take are one summary line, not noise; the rest: included first, then exceptions.
  const off = all.filter((l) => l.blocked?.startsWith('Not on'))
  const lines = [...all.filter((l) => !off.includes(l) && inc(l)), ...all.filter((l) => !off.includes(l) && !inc(l))]
  return (
    <div className="h-grid-wrap" style={{ maxHeight: 'none' }}>
      <table className="h-grid">
        <thead><tr><th /><th>Property</th><th>Now</th><th>New</th>{ai && <th>Confidence</th>}<th>Note</th></tr></thead>
        <tbody>
          {lines.map((l) => (
            <tr key={`${l.row.p.id}.${l.channel}`} className={inc(l) ? '' : 'is-excluded'}>
              <td><input type="checkbox" className="h-checkbox" checked={inc(l)} disabled={!!l.blocked} onChange={(e) => onToggle(l, e.target.checked)} aria-label={`Include ${l.row.p.name}`} /></td>
              <td><span className="h-grid__prop" style={{ minWidth: 180 }}><b>{l.row.p.name}</b>{l.channel && <Mark channel={l.channel} />}</span></td>
              <td className="h-grid__num" style={{ whiteSpace: 'normal' }}>{l.now}</td>
              <td style={{ whiteSpace: 'normal' }}>{inc(l) ? <ins className="h-diff" style={{ textDecoration: 'none' }}>{l.next}</ins> : <span className="h-muted">{l.next}</span>}</td>
              {ai && <td>{l.confidence && <Pill kind={l.confidence === 'High' ? 'recommended' : l.confidence === 'Medium' ? 'warning' : 'error'}>{l.confidence}</Pill>}</td>}
              <td style={{ whiteSpace: 'normal', minWidth: 160 }} className="h-caption">{l.blocked ? <span className="p-warn"><Icon name="lock" size={16} /> {l.blocked}</span> : l.why ?? ''}</td>
            </tr>
          ))}
          {off.length > 0 && <tr className="is-excluded"><td /><td colSpan={ai ? 5 : 4} className="h-caption">{off[0].blocked}: {off.map((l) => l.row.p.name).join(', ')}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function Done({ kind, result, skipped, autonomy }: { kind: BulkKind; result: UnitLine[]; skipped: UnitLine[]; autonomy: string }) {
  const n = (o: UnitLine['outcome']) => result.filter((l) => l.outcome === o).length
  return (
    <>
      <div className="h-toast" style={{ position: 'static' }}><Icon name="circle-check" />
        {kind === 'fee' || kind === 'conflict' ? <>Saved on {result.length}. Prices and fees reach the channels with the next rate sync (minutes).</>
          : kind === 'push' ? <>{n('live')} live · {n('in review')} in review · {n('rejected')} rejected.</>
            : autonomy === 'auto-review' ? <>Queued on {result.length}. Inside your portfolio rules they push in 24 h unless you stop them (Autopilot, with review).</>
              : <>Queued on {result.length}. They wait for Review &amp; push on each property.</>}
      </div>
      <table className="h-grid p-mt4">
        <thead><tr><th>Property</th><th>Result</th><th>Change</th></tr></thead>
        <tbody>
          {result.map((l) => (
            <tr key={`${l.row.p.id}.${l.channel}`}>
              <td><b>{l.row.p.name}</b> {l.channel && <Mark channel={l.channel} />}</td>
              <td>{l.outcome === 'live' ? <span className="h-sync h-sync--ok"><span className="h-sync__dot" />{kind === 'fee' || kind === 'conflict' ? 'Saved' : 'Live'}</span>
                : l.outcome === 'in review' ? <span className="h-sync h-sync--pending"><Icon name="clock" />In review (Booking.com, ~48 h)</span>
                  : l.outcome === 'rejected' ? <span className="h-sync h-sync--failed"><Icon name="alert-triangle" />Rejected</span>
                    : <span className="h-sync h-sync--pending"><Icon name="clock" />Queued for push{kind === 'titles' && l.channel === 'booking' && ' · then Booking.com review (~48 h)'}</span>}</td>
              <td className="h-caption" style={{ whiteSpace: 'normal' }}>{l.now} → {l.next}</td>
            </tr>
          ))}
          {skipped.map((l) => (
            <tr key={`s-${l.row.p.id}.${l.channel}`} className="is-excluded">
              <td><b>{l.row.p.name}</b></td><td>Skipped</td><td className="h-caption" style={{ whiteSpace: 'normal' }}>{l.blocked ?? l.why ?? 'Unticked'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
