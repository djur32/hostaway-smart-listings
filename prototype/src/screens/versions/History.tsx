/* Listings › [channel] › History · owner S12 · R-004 R-087 R-120 R-121 · D-155 · SCR-04 (window)
 * A version per push, per channel, from v0 (as imported). Who/what/when, what changed, a diff between any two, restore
 * (queued: it reaches the channel through Review & push, like any change, D-129). Performance while live is Angle C and
 * marked Early access; it only shows what the channel lets us measure. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Dropdown, Early, Empty, Guide, Icon, Mark, Photo, Pill, Term, useMode } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId, Version } from '../../data/types'
import { useStore } from '../../store/store'
import { amenityLabel } from '../home/parts'
import { versionPerf, wordDiff } from './util'

export function History({ ch, propertyId }: { ch: ChannelId; propertyId: string }) {
  const s = useStore()
  const m = useMode()
  const versions = s.versions.filter((v) => v.channel === ch).slice().sort((a, b) => b.n - a.n)
  const live = versions[0]
  const [a, setA] = useState<string>(versions[1]?.id ?? versions[0]?.id)
  const [b, setB] = useState<string>(live?.id)
  const [restored, setRestored] = useState<string | null>(null)
  const va = versions.find((v) => v.id === a) ?? versions[versions.length - 1]
  const vb = versions.find((v) => v.id === b) ?? live
  const queuedRestore = s.queue.find((q) => q.channel === ch && q.label.startsWith('Restore v'))
  // Restore the side that isn't live: comparing v2 → v3 (live) offers "Restore v2".
  const target = vb && vb.id !== live?.id ? vb : va && va.id !== live?.id ? va : undefined
  if (!live) return <Empty title="No versions yet" />

  return (
    <div className="p-mt4">
      <Guide id="history" title="Nothing you had is lost"
        line={<>v0 is {CHANNELS[ch].name} as we found it. Every push adds a <Term k="version">version</Term>; restore any of them.</>}>
        The first version, v0, is your {CHANNELS[ch].name} listing exactly as it was when you connected. Every time changes are sent, a new version is saved. You can compare any two and go back to any of them.
      </Guide>

      {versions.length === 1 && (
        <div className="p-strip p-mt4">
          <span className="h-small"><b>Only v0 so far.</b> History starts at import; every push adds a version, with performance once it has been live a while.</span>
          <span className="p-row"><span className="p-demo">Demo</span><Button size="md" icon="history" onClick={() => s.jumpAhead()}>Show this listing 90 days later</Button></span>
        </div>
      )}

      <div className="p-grid-2 p-mt4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px' }}>
        <div>
          <div className="p-row p-sb">
            <div className="p-row">
              <span className="h-small">Compare</span>
              <Dropdown style={{ width: 170 }} label="Older version" value={va.id} onChange={setA} options={versions.map((v) => ({ value: v.id, label: `v${v.n} · ${short(v)}` }))} />
              <Icon name="arrow-right" size={16} />
              <Dropdown style={{ width: 170 }} label="Newer version" value={vb.id} onChange={setB} options={versions.map((v) => ({ value: v.id, label: `v${v.n} · ${short(v)}` }))} />
            </div>
            {target && !restored && <Button icon="arrow-back-up" onClick={() => { s.restoreVersion(target.id); setRestored(`v${target.n}`) }}>Restore v{target.n}</Button>}
          </div>
          {(restored || queuedRestore) && (
            <div className="h-toast p-mt3" style={{ position: 'static' }}><Icon name="circle-check" />
              {queuedRestore?.label ?? `Restore ${restored}`} is waiting to be sent. {CHANNELS[ch].name} still shows v{live.n} until it's sent.
              <Link className="h-link" style={{ color: 'inherit' }} to={`/property/${propertyId}/push`}>Changes sent</Link></div>
          )}
          <VersionDiff a={va} b={vb} ch={ch} />
        </div>

        <div>
          <div className="p-row p-sb"><div className="p-label">Versions on {CHANNELS[ch].name}</div>{s.history && <Early>Performance</Early>}</div>
          <ol className="h-versions p-mt3">
            {versions.map((v) => {
              const perf = s.history ? versionPerf(ch, v.n) : null
              const kind = v.by === 'import' ? 'import' : v.strategy || v.author?.startsWith('AI') ? 'ai' : 'you'
              return (
                <li key={v.id} className="h-version">
                  <span className={`h-version__dot${kind === 'ai' ? ' h-version__dot--ai' : kind === 'you' ? ' h-version__dot--you' : ''}`}>
                    {kind === 'import' ? <Mark channel={ch} /> : <Icon name={kind === 'ai' ? 'sparkles' : 'pencil'} />}
                  </span>
                  <div>
                    <div className="h-version__title">v{v.n} · {v.by === 'import' ? 'As imported' : v.author ?? 'You'}{v.id === live.id && <Pill kind="recommended">Live now</Pill>}</div>
                    <div className="h-version__meta">{new Date(v.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{v.note && ` · ${v.note}`}{v.review && ` · ${v.review}`}</div>
                    {v.changed && <div className="p-row p-mt2" style={{ gap: 4 }}>{v.changed.map((c) => <span key={c} className="h-pill h-pill--neutral">{c}</span>)}</div>}
                    {perf && !m.plain && (
                      <div className="h-caption p-mt2" title="Only what the channel lets us measure. Views and conversion aren’t shared by Airbnb or Booking.com.">
                        {perf.weeks} wk live · {perf.bookings} bookings · pace <b>{perf.pace}</b> vs similar{perf.score !== null && ` · Page Score ${perf.score}`}
                      </div>
                    )}
                  </div>
                  <div className="h-version__actions">
                    <button className="h-link h-caption" style={{ background: 'none', border: 0, cursor: 'pointer' }} onClick={() => { setA(v.id === live.id ? versions[1]?.id ?? v.id : v.id); setB(v.id === live.id ? v.id : live.id) }}>Compare</button>
                  </div>
                </li>
              )
            })}
          </ol>
          {s.history && <p className="h-caption h-muted">Pace = your bookings over the median of 24 similar listings in the same weeks (100 = the same). <Link className="h-link" to={`/property/${propertyId}/listing/${ch}/stats`}>Stats</Link></p>}
        </div>
      </div>
    </div>
  )
}

const short = (v: Version) => (v.by === 'import' ? 'imported' : v.strategy ? `AI · ${v.strategy}` : 'you')

function Words({ a, b, na, nb }: { a: string; b: string; na?: number; nb?: number }) {
  const parts = wordDiff(a, b)
  const same = parts.filter((p) => p.k === 'same').reduce((t, p) => t + p.t.length, 0)
  // A rewrite reads better side by side than as a sea of strike-throughs.
  if (na !== undefined && same / Math.max(a.length, b.length) < 0.5)
    return (
      <span className="h-diff-split" style={{ display: 'grid', marginTop: 6 }}>
        <div><div className="h-diff-split__label">v{na} · rewritten</div><span className="h-diff"><del>{a}</del></span></div>
        <div><div className="h-diff-split__label">v{nb}</div><span className="h-diff"><ins>{b}</ins></span></div>
      </span>
    )
  return <span className="h-diff">{parts.map((p, i) => (p.k === 'same' ? <span key={i}>{p.t}</span> : p.k === 'add' ? <ins key={i}>{p.t}</ins> : <del key={i}>{p.t}</del>))}</span>
}

function VersionDiff({ a, b, ch }: { a: Version; b: Version; ch: ChannelId }) {
  const photos = useStore((s) => s.photos)
  const same = a.id === b.id
  const pa = (a.photoOrder ?? []).slice(0, 5), pb = (b.photoOrder ?? []).slice(0, 5)
  return (
    <div className="p-col p-mt3">
      {same && <p className="h-small h-muted">Pick two different versions to see what changed.</p>}
      <section className="p-card">
        <div className="p-label">{ch === 'booking' ? 'Property name' : 'Title'}</div>
        <p className="h-small" style={{ margin: '6px 0 0' }}>{same ? b.title : <Words a={a.title} b={b.title} />}</p>
      </section>
      <section className="p-card">
        <div className="p-label">Description</div>
        {ch === 'booking'
          ? <p className="h-small h-muted" style={{ margin: '6px 0 0' }}>Booking.com writes its own description from your facts. We version the facts we send, not its text (D-146).</p>
          : <div className="h-small" style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{same ? b.description : <Words a={a.description} b={b.description} na={a.n} nb={b.n} />}</div>}
      </section>
      <section className="p-card">
        <div className="p-label">First five photos</div>
        <div className="p-grid-2c p-mt2">
          {[a, b].map((v, k) => (
            <div key={v.id}>
              <div className="h-caption h-muted">v{v.n}</div>
              <div className="p-row p-mt2" style={{ gap: 4, flexWrap: 'nowrap' }}>
                {(k === 0 ? pa : pb).map((id, i) => {
                  const ph = photos.find((p) => p.id === id)
                  const moved = k === 1 && pa[i] !== id
                  return ph ? <Photo key={id} tone={ph.tone} badge={moved ? `${i + 1}` : undefined} style={{ width: 56, height: 42, outline: moved ? '2px solid var(--color-diff-added-text)' : undefined }} /> : null
                })}
              </div>
              <div className="h-caption p-mt2">{(k === 0 ? pa : pb).map((id) => photos.find((p) => p.id === id)?.room).join(' · ')}</div>
            </div>
          ))}
        </div>
      </section>
      {ch !== 'booking' && (
        <section className="p-card">
          <div className="p-label">Highlighted amenities (top 3)</div>
          <p className="h-small" style={{ margin: '6px 0 0' }}>
            {same ? (b.highlightedAmenities ?? []).slice(0, 3).map(amenityLabel).join(' · ')
              : <Words a={(a.highlightedAmenities ?? []).slice(0, 3).map(amenityLabel).join(' · ')} b={(b.highlightedAmenities ?? []).slice(0, 3).map(amenityLabel).join(' · ')} />}
          </p>
        </section>
      )}
    </div>
  )
}
