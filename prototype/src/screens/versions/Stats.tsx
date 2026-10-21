/* Listings › [channel] › Stats · owner S12 · R-121 R-122 R-123 R-134 · D-156 D-157 D-159 · the Angle C bridge, "Early access"
 * Over time: one metric at a time (one axis), the similar listings' demand as the baseline, version markers.
 * What we can measure: per channel, what software can see and why not (rules; views are not shared).
 * Compare versions A/B/C: competitiveness vs 24 similar listings (a heuristic, labelled) + how each did while live.
 * Tests: channels have no native A/B for listing content, so tests are sequential (switchback) with controls, a bar set
 * before starting, and an honest "not enough data yet". A true split exists only on the Direct site. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AvailCell, Button, Confidence, Dropdown, Early, Explainer, Guide, Icon, LineChart, Mark, Pill, Segmented, useMode } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { METRICS, WEEKS, avail, competitiveness, minDetectable, series, switchbackRead, weekLabel, type MetricId } from '../../data/performance'
import type { ChannelId, ListingTest, Version } from '../../data/types'
import { useStore } from '../../store/store'
import { versionPerf } from './util'

type View = 'time' | 'compare' | 'tests'

export function Stats({ ch, propertyId }: { ch: ChannelId; propertyId: string }) {
  const s = useStore()
  const m = useMode()
  const [view, setView] = useState<View>('time')
  return (
    <div className="p-mt4">
      <div className="p-row p-sb">
        <div className="p-row"><Early /><span className="h-small h-muted">Versions → performance → testing is the next step after setup and listings.</span></div>
        <Segmented label="Stats view" value={view} onChange={setView} items={[{ id: 'time', label: 'Over time' }, { id: 'compare', label: 'Compare versions' }, { id: 'tests', label: 'Tests' }]} />
      </div>
      <div className="p-mt3"><Guide id="stats" title="How your listing is doing, honestly"
        line="Only what each channel lets software see. Airbnb and Booking.com don’t share views, so we measure bookings against similar listings.">
        We show what Airbnb and Booking.com let us see: bookings, prices, occupancy and messages. They don’t share how many people viewed your listing, so we compare your bookings with similar homes nearby in the same weeks.
      </Guide></div>
      {!s.history ? (
        <div className="p-strip p-mt4">
          <span className="h-small"><b>Stats need time.</b> This listing was connected today: there’s one version (v0) and no bookings since. Here’s what it looks like after 90 days and three versions.</span>
          <span className="p-row"><span className="p-demo">Demo</span><Button size="md" kind="primary" icon="history" onClick={() => s.jumpAhead()}>Show 90 days later</Button></span>
        </div>
      ) : view === 'time' ? <OverTime ch={ch} /> : view === 'compare' ? <Compare ch={ch} propertyId={propertyId} /> : <Tests ch={ch} />}
      {(!s.history || view === 'time') && <Availability ch={ch} expert={!m.plain} />}
    </div>
  )
}

/* ---------------- Over time ---------------- */

function OverTime({ ch }: { ch: ChannelId }) {
  const s = useStore()
  const pts = useMemo(() => series(ch), [ch])
  const [metric, setMetric] = useState<MetricId>('pace')
  const versions = s.versions.filter((v) => v.channel === ch)
  const markers = pts.filter((p, i) => i > 0 && p.version !== pts[i - 1].version && !(p.w > 9 && ch === 'airbnb')).map((p) => ({ i: p.w, label: `v${p.version}` }))
  const test = s.tests.find((t) => t.channel === ch && t.status === 'running')
  const bands = test ? pts.filter((p) => p.w >= test.startedWeek).map((p) => ({ from: p.w, to: p.w, tone: (p.version === 3 ? 2 : 1) as 1 | 2 })) : []
  const a = avail(metric, ch)
  const last4 = pts.slice(-4), prev4 = pts.slice(-8, -4)
  const sum = (xs: typeof pts, k: 'bookings' | 'enquiries') => xs.reduce((t, p) => t + p[k], 0)
  const avg = (xs: typeof pts, k: 'adr' | 'occupancy' | 'pace') => Math.round(xs.reduce((t, p) => t + p[k], 0) / xs.length)
  const tiles = [
    { label: 'Bookings made', v: sum(last4, 'bookings'), was: sum(prev4, 'bookings'), fmt: (x: number) => String(x) },
    { label: 'Pace vs similar', v: avg(last4, 'pace'), was: avg(prev4, 'pace'), fmt: (x: number) => String(x) },
    { label: 'ADR', v: avg(last4, 'adr'), was: avg(prev4, 'adr'), fmt: (x: number) => `€${x}` },
    { label: 'Occupancy', v: avg(last4, 'occupancy'), was: avg(prev4, 'occupancy'), fmt: (x: number) => `${x}%` },
  ]
  const labels = pts.map((p) => p.label)
  const def = METRICS.find((x) => x.id === metric)!
  return (
    <>
      <div className="p-grid-5 p-mt4" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {tiles.map((t) => (
          <section key={t.label} className="p-card">
            <div className="h-caption h-muted">{t.label} · last 4 weeks</div>
            <div className="h-h4 p-num" style={{ marginTop: 4 }}>{t.fmt(t.v)}</div>
            <div className="h-caption h-muted">{t.v >= t.was ? '▲' : '▼'} from {t.fmt(t.was)} the 4 weeks before</div>
          </section>
        ))}
      </div>
      <section className="p-card p-mt4">
        <div className="p-row p-sb">
          <div><b>{def.label}</b> <span className="h-caption h-muted">· {def.unit} · {CHANNELS[ch].name} · {weekLabel(0)} – {weekLabel(WEEKS - 1)}</span></div>
          <Dropdown style={{ width: 260 }} label="Metric" value={metric} onChange={(v) => setMetric(v as MetricId)}
            options={METRICS.filter((x) => ['pace', 'bookings', 'adr', 'occupancy', 'enquiries', 'views', 'score'].includes(x.id)).map((x) => ({ value: x.id, label: `${x.label}${avail(x.id, ch).a === 'no' ? ' · not shared' : ''}` }))} />
        </div>
        <p className="h-caption h-muted" style={{ margin: '4px 0 12px' }}>{def.help}</p>
        {a.a === 'no' ? (
          <div className="h-unavail"><div><b>{CHANNELS[ch].name} doesn’t share this with software.</b><div className="h-caption">{a.why}. On your Direct site we’d see every visit. Closest signal here: enquiries and booking pace.</div></div></div>
        ) : (
          <LineChart labels={labels} markers={markers} bands={bands}
            series={[{ key: 'you', label: `You · ${CHANNELS[ch].name}`, tone: 1, values: pts.map((p) => (metric === 'score' ? p.score : metric === 'views' ? p.views : p[metric as 'pace' | 'bookings' | 'adr' | 'occupancy' | 'enquiries'])) }]}
            comps={metric === 'bookings' ? { label: 'Similar listings (median)', values: pts.map((p) => p.comps) } : metric === 'pace' ? { label: 'Similar listings = 100', values: pts.map(() => 100) } : undefined}
            fmt={(v) => (metric === 'adr' ? `€${v}` : metric === 'occupancy' ? `${v}%` : String(v))} yMax={metric === 'occupancy' ? 100 : metric === 'pace' ? 160 : undefined} />
        )}
        {test && <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Shaded weeks: the running test alternates v2 (blue) and v3 (orange) week by week.</p>}
        <div className="h-caption h-muted" style={{ marginTop: 8 }}>{versions.length} versions · markers show when each went live.</div>
      </section>
    </>
  )
}

/* ---------------- Availability ---------------- */

function Availability({ ch, expert }: { ch: ChannelId; expert: boolean }) {
  const chans: ChannelId[] = ['airbnb', 'booking', 'vrbo', 'direct']
  return (
    <section className="p-card p-mt4">
      <div className="p-row p-sb"><b>What we can measure, per channel</b><span className="h-caption h-muted">From each channel’s own documentation</span></div>
      <table className="h-table p-mt2">
        <thead><tr><th>Metric</th>{chans.map((c) => <th key={c} style={{ fontWeight: c === ch ? 600 : undefined }}><Mark channel={c} /> {CHANNELS[c].name}</th>)}</tr></thead>
        <tbody>
          {METRICS.filter((x) => expert || ['bookings', 'adr', 'views'].includes(x.id)).map((x) => (
            <tr key={x.id}><td>{x.label}</td>{chans.map((c) => { const a = avail(x.id, c); return <td key={c}><AvailCell a={a.a} why={a.why} /></td> })}</tr>
          ))}
        </tbody>
      </table>
      <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Hover a cell for the reason. We don’t scrape channels. “Estimated” = from market data about similar listings, the same source Dynamic Pricing uses.</p>
    </section>
  )
}

/* ---------------- Compare versions A/B/C ---------------- */

function Compare({ ch, propertyId }: { ch: ChannelId; propertyId: string }) {
  const s = useStore()
  const versions = s.versions.filter((v) => v.channel === ch).sort((a, b) => b.n - a.n)
  const [picked, setPicked] = useState<string[]>(versions.slice(0, 3).map((v) => v.id))
  const cols = picked.map((id) => versions.find((v) => v.id === id)!).filter(Boolean)
  const limit = CHANNELS[ch].titleLimit ?? 50
  const reads = cols.map((v) => ({ v, c: competitiveness(v, ch, s.photos, limit), perf: versionPerf(ch, v.n) }))
  const best = Math.max(...reads.map((r) => r.c.score))
  const letter = ['A', 'B', 'C']
  return (
    <div className="p-mt4">
      <div className="p-row">
        <span className="h-small">Compare up to three:</span>
        {versions.map((v) => (
          <button key={v.id} className="h-chip" aria-pressed={picked.includes(v.id)} disabled={!picked.includes(v.id) && picked.length >= 3}
            onClick={() => setPicked(picked.includes(v.id) ? picked.filter((x) => x !== v.id) : [...picked, v.id].sort((a, b) => (versions.find((x) => x.id === b)!.n - versions.find((x) => x.id === a)!.n)))}>v{v.n}</button>
        ))}
      </div>
      <div className="p-mt3" style={{ display: 'grid', gridTemplateColumns: `repeat(${reads.length}, minmax(0, 1fr))`, gap: 'var(--space-4)' }}>
        {reads.map(({ v, c, perf }, i) => (
          <section key={v.id} className="p-card" style={{ borderTop: `3px solid var(--color-chart-${i + 1})` }}>
            <div className="p-row p-sb"><b>{letter[i]} · v{v.n}</b>{c.score === best && reads.length > 1 && <Pill kind="recommended">Most competitive</Pill>}</div>
            <div className="h-caption h-muted">{v.by === 'import' ? 'As imported' : v.author}</div>
            <p className="h-small" style={{ margin: '10px 0 0', minHeight: 40 }}><b>{v.title}</b></p>
            {ch !== 'booking' && <p className="h-caption" style={{ margin: '4px 0 0', minHeight: 48 }}>{v.description.slice(0, 120)}…</p>}
            <div className="p-mt3"><span className="h-h4 p-num">{c.score}</span> <span className="h-caption h-muted">competitiveness · ahead of {c.ahead} of {c.of} similar listings</span></div>
            <div className="p-mt2">
              {c.levers.map((l) => (
                <div key={l.id} className="h-health" style={{ gridTemplateColumns: '110px minmax(0, 1fr) 32px', padding: '4px 0' }} title={l.note}>
                  <span className="h-caption">{l.label}</span>
                  {l.editable ? <span className={`h-health__bar${l.score < 50 ? ' is-low' : l.score < 75 ? ' is-mid' : ''}`}><i style={{ ['--value' as string]: `${l.score}%` }} /></span> : <span className="h-caption h-muted">not scored</span>}
                  <span className="h-caption p-num" style={{ textAlign: 'right' }}>{l.editable ? l.score : '-'}</span>
                </div>
              ))}
            </div>
            <div className="p-mt3 h-caption" style={{ borderTop: '1px solid var(--color-border-divider)', paddingTop: 8 }}>
              <div className="p-label">While live</div>
              {perf ? <>{perf.weeks} weeks · {perf.bookings} bookings · pace <b>{perf.pace}</b> vs similar · ADR €{perf.adr}{perf.score !== null && ` · Page Score ${perf.score}`}</> : 'Not live yet'}
              {perf && perf.weeks < 4 && <div className="p-warn">Too few weeks to judge on its own.</div>}
            </div>
          </section>
        ))}
      </div>
      <Explainer title="How to read this">
        <b>Competitiveness</b> compares each version with 24 similar listings on the levers copy can move: title, first photos, highlights, description. Price and reviews are shown but not scored. It’s our heuristic, not the channel’s ranking. <b>While live</b> is what actually happened, but versions ran in different weeks, so seasonality leaks in. That’s why tests take turns between versions instead (Tests, above).
        <div className="p-mt2"><Link className="h-link h-small" to={`/property/${propertyId}/listing/${ch}/history`}>Open the diff between any two in History</Link></div>
      </Explainer>
    </div>
  )
}

/* ---------------- Tests ---------------- */

function Tests({ ch }: { ch: ChannelId }) {
  const s = useStore()
  const pts = useMemo(() => series(ch), [ch])
  const running = s.tests.find((t) => t.channel === ch && t.status === 'running')
  const versions = s.versions.filter((v) => v.channel === ch).sort((a, b) => b.n - a.n)
  return (
    <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
      <div className="p-col">
        {running ? <RunningTest t={running} pts={pts} versions={versions} /> : <p className="h-small h-muted">No test running on {CHANNELS[ch].name}.</p>}
        {s.tests.filter((t) => t.channel === ch && t.status !== 'running').map((t) => <p key={t.id} className="h-small h-muted">{t.id} · stopped. The data stays in Over time.</p>)}
        <NewTest ch={ch} versions={versions} busy={!!running} />
      </div>
      <div className="p-col">
        <Explainer title="Why tests take turns" icon="info-circle">
          Airbnb and Booking.com show one version of a listing to everyone; there’s no built-in A/B split. So a test <b>takes turns</b>: v2 for a week, then v3, then v2, over matched weeks. We compare each version’s bookings with similar listings in the <i>same</i> weeks, so a slow November doesn’t count against whoever was live.
        </Explainer>
        <Explainer title="What a test can’t tell you" icon="alert-triangle">
          With one home, a clear answer usually needs 6–10 weeks. Guests who booked from an earlier version still arrive later, and a channel’s search may take days to react to a new title. We set the bar before starting (90%) and say “not enough data yet” until it’s met. We never call a winner early.
        </Explainer>
        <Explainer title="Faster with more homes">
          Across several similar homes you can split instead: half get v3, half keep v2, same weeks. That’s a real A/B at portfolio level (P3). On your Direct site, every visit can be split: true A/B, with views and conversion.
        </Explainer>
      </div>
    </div>
  )
}

function RunningTest({ t, pts, versions }: { t: ListingTest; pts: ReturnType<typeof series>; versions: Version[] }) {
  const s = useStore()
  const [a, b] = t.variants.map((id) => versions.find((v) => v.id === id)!)
  const read = switchbackRead(pts, a.n, b.n, t.startedWeek, 0.9, t.minBookingsPerVariant)
  const weeksRun = WEEKS - t.startedWeek
  const toGo = Math.max(read.moreWeeks, t.minWeeks - weeksRun)
  const hopeless = toGo > 26
  const cells = Math.min(10, Math.max(t.minWeeks, weeksRun + 2))
  const leader = read.leader === a.n ? a : b
  const other = leader === a ? b : a
  return (
    <section className="p-card">
      <div className="p-row p-sb">
        <div><b>{t.id} · v{a.n} vs v{b.n}</b> <span className="h-caption h-muted">· takes turns weekly · since {weekLabel(t.startedWeek)}</span></div>
        <Pill kind={read.met ? 'recommended' : 'new'}>{read.met ? 'Decided' : 'Running'}</Pill>
      </div>
      <div className="h-caption h-muted p-mt2">Week by week (blue v{a.n}, orange v{b.n}; faded = planned)</div>
      <div className="p-row p-mt2" style={{ flexWrap: 'nowrap', gap: 8 }}>
        <div className="h-switchback" style={{ flex: 1 }}>
          {Array.from({ length: cells }, (_, i) => {
            const w = t.startedWeek + i
            const isB = i % 2 === 0
            return <span key={i} className={`${isB ? 'is-b' : 'is-a'}${w >= WEEKS ? ' is-future' : ''}`} title={`Week of ${weekLabel(w)} · v${isB ? b.n : a.n}`}>v{isB ? b.n : a.n}</span>
          })}
        </div>
        {!hopeless && weeksRun + toGo > cells && <span className="h-caption h-muted">+{weeksRun + toGo - cells} weeks</span>}{hopeless && <span className="h-caption h-muted">…</span>}
      </div>
      <div className="p-grid-2c p-mt3">
        <div className="h-small"><span className="p-dot" style={{ background: 'var(--color-chart-1)' }} />v{a.n}: <b>{read.na}</b> bookings in {read.weeksA} weeks</div>
        <div className="h-small"><span className="p-dot" style={{ background: 'var(--color-chart-2)' }} />v{b.n}: <b>{read.nb}</b> bookings in {read.weeksB} weeks</div>
      </div>
      <Confidence p={read.p} met={read.met} />
      <p className="h-small" style={{ margin: '8px 0 0' }}>
        {read.met ? <>v{leader.n} books <b>{Math.round(read.lift * 100)}%</b> more than v{other.n} against similar listings, {Math.round(read.p * 100)}% sure.</>
          : <><b>Not enough data yet.</b> v{leader.n} is ahead: {Math.round(read.lift * 100)}% more bookings than v{other.n}, against similar listings in the same weeks. We’re {Math.round(read.p * 100)}% sure; the bar is 90%{!read.enoughBookings && ` and ${t.minBookingsPerVariant} bookings each`}.
            {hopeless ? <> At this home’s pace that would take <b>more than six months</b>, and a season would change underneath it.</> : <> About <b>{toGo}</b> more weeks at this pace.</>}</>}
      </p>
      {hopeless && !read.met && (
        <div className="h-explainer p-mt3"><Icon name="alert-triangle" /><div>
          <div className="h-explainer__title">One home rarely has the bookings to prove a difference this size</div>
          Three honest ways forward:
          <ul className="h-small" style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            <li><b>Keep v{leader.n} as a directional call.</b> History marks it “directional, not proven”.</li>
            <li><b>Test it across similar homes</b>: half on v{leader.n}’s pattern, half on v{other.n}’s, same weeks. 11 Berlin homes get there in about {Math.ceil(weeksFor(0.25, 22))} weeks.</li>
            <li><b>Keep running</b> if you’d rather wait; we’ll say when it’s decided.</li>
          </ul>
        </div></div>
      )}
      <div className="h-caption h-muted p-mt2">Controls: {t.controls.join(' · ')}. Metric: bookings made per week, over similar listings’ bookings in the same week.</div>
      <div className="p-row p-mt3">
        <Button size="md" onClick={() => s.stopTest(t.id)}>Stop the test</Button>
        <Button size="md" kind={hopeless ? 'secondary' : 'ghost'} disabled={!read.met && !hopeless} onClick={() => s.stopTest(t.id)}>{read.met ? `Keep v${leader.n} and end` : `Keep v${leader.n} (directional) and end`}</Button>
      </div>
    </section>
  )
}

function NewTest({ ch, versions, busy }: { ch: ChannelId; versions: Version[]; busy: boolean }) {
  const s = useStore()
  const [vars, setVars] = useState<string[]>(versions.slice(0, 2).map((v) => v.id))
  const [design, setDesign] = useState<ListingTest['design']>('switchback')
  const [block, setBlock] = useState(7)
  const [done, setDone] = useState(false)
  return (
    <section className="p-card">
      <div className="p-label">New test</div>
      <div className="p-row p-mt2"><span className="h-small">Versions</span>{versions.map((v) => (
        <button key={v.id} className="h-chip" aria-pressed={vars.includes(v.id)} disabled={!vars.includes(v.id) && vars.length >= 3} onClick={() => setVars(vars.includes(v.id) ? vars.filter((x) => x !== v.id) : [...vars, v.id])}>v{v.n}</button>
      ))}</div>
      <div className="p-row p-mt3"><span className="h-small">How</span>
        <Segmented label="Design" value={design} onChange={setDesign} items={[{ id: 'switchback', label: 'Take turns (this home)' }, { id: 'across-properties', label: 'Split across similar homes' }, { id: 'split', label: 'Split visitors (Direct only)' }]} />
      </div>
      {design === 'split' && <p className="h-caption p-warn" style={{ margin: '6px 0 0' }}>{CHANNELS[ch].name} shows one version to everyone. Visitor splits are possible only on your Direct site.</p>}
      {design === 'across-properties' && <p className="h-caption h-muted" style={{ margin: '6px 0 0' }}>Needs at least 6 similar homes (same group, same channel). You have 1 on {CHANNELS[ch].name} in this group with this strategy. Available from the Grid.</p>}
      <PlanLine ch={ch} design={design} />
      {design === 'switchback' && (
        <div className="p-row p-mt3"><span className="h-small">Each turn</span>
          <Dropdown style={{ width: 140, flex: 'none' }} label="Turn length" value={String(block)} onChange={(v) => setBlock(Number(v))} options={[{ value: '7', label: '1 week' }, { value: '14', label: '2 weeks' }]} />
          <span className="h-caption h-muted">Whole weeks only, so weekdays match. At least 6 weeks and 20 bookings per version. Price rules are held for the test.</span>
        </div>
      )}
      <div className="p-row p-mt3">
        <Button kind="primary" size="md" icon="player-play" disabled={busy || vars.length < 2 || design !== 'switchback' || done}
          onClick={() => { s.startTest({ channel: ch, variants: vars, design, blockDays: block, minWeeks: 6, minBookingsPerVariant: 20, controls: ['Price rules held', 'Similar listings’ demand as the baseline', 'Whole weeks only (same weekdays)'], startedWeek: WEEKS - 1, status: 'running', metric: 'booking-pace' }); setDone(true) }}>
          {busy ? 'One test at a time per channel' : done ? 'Started' : 'Start the test'}</Button>
        <span className="h-caption h-muted">Each switch is a push, with a receipt, like any other.</span>
      </div>
    </section>
  )
}


/** Weeks needed to detect `effect` at 90% with `perWeek` bookings across variants. */
function weeksFor(effect: number, perWeek: number) { const z = 1.2816, l = Math.log(1 + effect); return (2 * 2 * (z / l) ** 2) / perWeek }

function PlanLine({ ch, design }: { ch: ChannelId; design: ListingTest['design'] }) {
  const pts = series(ch)
  const perWeek = pts.slice(-8).reduce((t, p) => t + p.bookings, 0) / 8
  const one = minDetectable(perWeek, 8), many = minDetectable(perWeek * 11, 8)
  return (
    <p className="h-caption" style={{ margin: '8px 0 0' }}>
      <b>Before you start:</b> this home books about {perWeek.toFixed(1)} a week on {CHANNELS[ch].name}. In 8 weeks, {design === 'across-properties' ? <>across 11 similar homes a test can prove a difference of about <b>{Math.round(many * 100)}%</b>.</> : <>taking turns can only prove a difference of about <b>{Math.round(one * 100)}%</b> or more. Across 11 similar homes: about {Math.round(many * 100)}%.</>}
    </p>
  )
}
