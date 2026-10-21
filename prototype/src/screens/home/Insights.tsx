/* Insights below the page (R-111…R-114) and Listings › Performance & similar. SCR-04 · owner S11 · D-144
 * Comps per channel with similarity % and *why similar*, structure patterns, market snapshot per channel, linked to
 * Pricing. Everything here is SIMULATED and labelled "Sample market data"; your own units are excluded (OQ-108). */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Band, Icon } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { MARKET } from '../../data/comps'
import {
  COMP_STRATEGY, MARKET_SNAPSHOT, PATTERNS, SIMILARITY_WEIGHTS, STRATEGIES, breakdownOf, compsFor, type Breakdown,
} from '../../data/studio'
import type { ChannelId, Comp, StrategyId } from '../../data/types'

export const similarityOf = (c: Comp) => {
  const b = breakdownOf(c)
  return SIMILARITY_WEIGHTS.reduce((n, w) => n + w.weight * b[w.id], 0)
}
const pct = (n: number) => `${Math.round(n * 100)}%`

function Why({ b }: { b: Breakdown }) {
  return (
    <div className="p-col" style={{ gap: 4, marginTop: 8 }}>
      {SIMILARITY_WEIGHTS.map((w) => (
        <div key={w.id} className="h-caption" style={{ display: 'grid', gridTemplateColumns: '150px 1fr 34px', gap: 8, alignItems: 'center' }}>
          <span className="h-muted">{w.label}</span>
          <span className="h-health__bar"><i style={{ ['--value' as string]: pct(b[w.id]) }} /></span>
          <span style={{ textAlign: 'right' }}>{pct(b[w.id])}</span>
        </div>
      ))}
    </div>
  )
}

export function CompCard({ c, open }: { c: Comp; open?: boolean }) {
  const [more, setMore] = useState(!!open)
  const rating = c.channel === 'booking' ? `${c.rating.toFixed(1)}/10` : `★${c.rating.toFixed(2)}`
  return (
    <div className="h-comp">
      <div className="h-comp__img"><Icon name="photo" /></div>
      <div>
        <div className="h-comp__title">{c.title}<span className="h-comp__sim">{pct(similarityOf(c))} similar</span></div>
        <div className="h-comp__why">{c.reasons.map((r) => <span key={r}>{r}</span>)}</div>
        <div className="h-comp__stats"><span>Occupancy <b>{pct(c.occupancy)}</b></span><span>ADR <b>€{c.adr}</b></span><span>Rating <b>{rating}</b></span><span>{c.distanceKm} km</span></div>
        <button className="h-link h-caption" style={{ background: 'none', border: 0, padding: 0, marginTop: 6, cursor: 'pointer', font: 'inherit' }} onClick={() => setMore(!more)} aria-expanded={more}>
          {more ? 'Hide' : 'Why similar'}
        </button>
        {more && <Why b={breakdownOf(c)} />}
      </div>
    </div>
  )
}

export function Insights({ channel, strategy, propertyId, defaultOpen }: { channel: ChannelId; strategy?: StrategyId | null; propertyId: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [onlyStrategy, setOnlyStrategy] = useState(false)
  const comps = compsFor(channel, onlyStrategy ? strategy : null)
  const snap = MARKET_SNAPSHOT[channel]
  const pats = PATTERNS[channel] ?? []
  const st = STRATEGIES.find((x) => x.id === strategy)
  return (
    <section className="p-card p-mt6" aria-labelledby="insights-h">
      <div className="p-row p-sb">
        <div className="p-row" style={{ gap: 8 }}>
          <Icon name="chart-line" /><b id="insights-h">How similar places on {CHANNELS[channel].name} do it</b>
        </div>
        <button className="h-btn h-btn--secondary h-btn--md" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide' : `Show ${comps.length} similar listings`}</button>
      </div>
      <p className="h-caption h-muted" style={{ margin: '6px 0 0' }}>{MARKET.compsCount} listings within {MARKET.radiusKm} km with 2 guests and 1 bedroom, your own units excluded. Recommendations in this page are grounded in them.</p>
      {open && (
        <>
          {pats.length > 0 && (
            <>
              <div className="p-label p-mt4">What the best of them do</div>
              <div className="p-col p-mt2" style={{ gap: 6 }}>
                {pats.map((p) => (
                  <div key={p.text} className="h-insight"><Icon name="bulb" /><div><div className="h-insight__text">{p.text}</div><div className="h-caption h-muted">{p.you}</div></div></div>
                ))}
              </div>
            </>
          )}
          {snap && (
            <>
              <div className="p-label p-mt6">Where you sit</div>
              <div className="p-grid-2 p-mt2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="p-card">
                  <div className="h-small"><b>Average nightly rate</b></div>
                  <Band label="Average nightly rate" min={snap.adr.min} max={snap.adr.max} median={snap.adr.median} you={snap.adr.you} from={snap.adr.min + 6} to={snap.adr.max - 8} format={(n) => `€${Math.round(n)}`} />
                  <p className="h-caption" style={{ margin: '8px 0 0' }}>You’re below every similar listing. <Link to={`/property/${propertyId}/pricing/rates`} className="h-link">See Dynamic Pricing in Pricing</Link></p>
                </div>
                <div className="p-card">
                  <div className="h-small"><b>Occupancy, last 90 days</b></div>
                  <Band label="Occupancy" min={snap.occupancy.min} max={snap.occupancy.max} median={snap.occupancy.median} you={snap.occupancy.you} from={snap.occupancy.min + 5} to={snap.occupancy.max - 4} format={(n) => `${Math.round(n)}%`} />
                  <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>{snap.demand}</p>
                </div>
              </div>
            </>
          )}
          <div className="p-row p-sb p-mt6">
            <div className="p-label">Similar listings, most similar first</div>
            {st && <label className="h-caption p-row" style={{ gap: 6 }}><input className="h-checkbox" type="checkbox" checked={onlyStrategy} onChange={(e) => setOnlyStrategy(e.target.checked)} />Only those leading with “{st.label}”</label>}
          </div>
          <div className="p-grid-2 p-mt2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {comps.map((c) => <CompCard key={c.id} c={c} />)}
            {comps.length === 0 && <p className="h-small h-muted">No similar listing leads with this strategy on {CHANNELS[channel].name}.</p>}
          </div>
          <details className="p-mt4">
            <summary className="h-small" style={{ cursor: 'pointer' }}>How “similar” is worked out</summary>
            <p className="h-small" style={{ margin: '8px 0 4px' }}>Each listing is compared on five things, weighted. Photos are compared by what they show (rooms, light, style), not by pixels.</p>
            <div className="p-row" style={{ gap: 8 }}>
              {SIMILARITY_WEIGHTS.map((w) => <span key={w.id} className="h-chip" aria-pressed="false" style={{ cursor: 'default' }}>{w.label} · {Math.round(w.weight * 100)}%</span>)}
            </div>
            <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Your own units are never used as comparisons. Strategy tags per listing: {Object.keys(COMP_STRATEGY).length} tagged.</p>
          </details>
        </>
      )}
    </section>
  )
}
