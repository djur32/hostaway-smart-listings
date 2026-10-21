/* Smart Listings › Strategy › {channel} · WS-SL, 3 Oct (new internal screen per channel: "when you open one you see all
 * of the details of everything you checked, laid out well").
 * Current strategy: every wizard answer as a definition list, with Edit / Pause or Resume / ⋯ (Replace with a new
 * strategy, Remove). 3 Oct, later: no versions — the History section, version numbers
 * and "Use this strategy" are gone. A channel has one current strategy; the head says when it started (shared.ts
 * strategyStart, the same date Performance reads from). Numbers stay in Performance.
 * SCR: Strategy › channel · R-072 / R-075. URL: /property/:id/smart/strategy/:channel. */
import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  BackLink, Button, DefList, EmptyStrategy, Icon, Mark, OvMenu, PageFrame, PageHead, SlConfirm, SlSection, StrategyStatusPill,
} from '../../ds'
import { ASKS, AUDIENCES, GOALS, chName, isListingChannel, type ListingChannel } from '../../data/sl3'
import { AUDIENCE_LINES, AUTOPILOT_CHOICES, GOAL_LINES, MIX_ROWS, priceOf, useSlLocal, type Mix } from '../../data/v3-sl'
import { propertyChannels } from '../../data/portfolio'
import { useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { currentVersion, hasStrategy, mixOf, sharedWith, strategyStart, strategyState, strategyText, syncVersions, useSmartDemo } from './shared'
import { useStrategyActions } from './strategyActions'
import { dayText } from './Strategy'

const mixText = (m: Mix) => (['price', 'minStay', 'policy'] as const).map((k) => `${MIX_ROWS[k].label}: ${MIX_ROWS[k].items.find((i) => i.id === m[k])!.label.toLowerCase()}`).join(' · ')

export function StrategyChannel() {
  useSmartDemo()
  const p = useProperty()
  const nav = useNavigate()
  const loc = useLocation()
  const { channel } = useParams()
  const sl3 = useStore((s) => s.sl3)
  const on = useStore((s) => s.smartListings)
  const mixes = useSlLocal((s) => s.mix)
  const base = `/property/${p.id}`
  const saved = (loc.state as { saved?: string } | null)?.saved
  const act = useStrategyActions(saved ? { text: saved } : null)
  const c = isListingChannel(channel) && propertyChannels(p.id).includes(channel) ? channel as ListingChannel : null
  useEffect(() => { if (c && on && sl3.setupDone && hasStrategy(sl3, c)) syncVersions([c]) }, [c, on, sl3.setupDone, sl3.plans]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (saved) nav(loc.pathname + loc.search + loc.hash, { replace: true, state: null }) }, [saved]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!c) return <Navigate to={`${base}/smart/strategy`} replace />

  const wizard = (qs: string) => nav(`${base}/smart/wizard?${qs}`)
  const state = strategyState(sl3, c)
  const name = chName(c)
  const cur = hasStrategy(sl3, c) ? currentVersion(sl3, c) : undefined // only for the strategy's note (brief)
  const started = hasStrategy(sl3, c) ? strategyStart(sl3, c) : undefined
  const pl = sl3.plans[c]
  const mix = mixOf(sl3, c, mixes)
  const shared = sharedWith(sl3, c)
  const back = <BackLink to={`${base}/smart/strategy`} label="Back to Strategy"><Icon name="chevron-left" /></BackLink>

  const actions = state === 'none'
    ? <Button kind="primary" icon="plus" onClick={() => wizard(`entry=add&ch=${c}&from=detail`)}>Add a strategy</Button>
    : <>
        <Button icon="pencil" onClick={() => wizard(`entry=edit&ch=${c}&from=detail`)}>Edit</Button>
        {state === 'paused'
          ? <Button icon="player-play" onClick={() => act.resume(c)}>Resume</Button>
          : <Button onClick={() => act.askPause(c)}>Pause</Button>}
        <OvMenu label={`More actions for ${name}`} items={[
          { label: 'Replace with a new strategy', onSelect: () => wizard(`entry=replace&ch=${c}&from=detail`) },
          { label: 'Remove', onSelect: () => act.askRemove(c) },
        ]} />
      </>

  const goal = pl && GOALS.find((g) => g.id === pl.goal)
  const aud = pl && AUDIENCES.find((a) => a.id === pl.audience)
  const asks = pl ? ASKS.filter((a) => pl.asks.includes(a.id)) : []

  return (
    <PageFrame head={<PageHead lead={back} title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}><Mark channel={c} size={24} />{name} strategy</span>} property={p}
        actions={<>
          <span className="sl-detail__status"><StrategyStatusPill status={state} />{started && <span>Started {dayText(started)}</span>}</span>
          <span className="h-pagehead__spacer" />
          <span className="sl-detail__actions">{actions}</span>
        </>} />}>
      <div className="sl-page">
        {act.flash && <SlConfirm onUndo={act.flash.undo} onClose={() => act.setFlash(null)}>{act.flash.text}</SlConfirm>}

        <SlSection title="Current strategy" line={state === 'none' ? undefined : strategyText(pl!, mix)}
          right={state === 'none' ? undefined : <Link className="h-link sl-detail__perf" to={`${base}/smart/performance?ch=${c}`}>See how it’s doing</Link>}>
          {state === 'none' || !pl
            ? <EmptyStrategy title={`No strategy on ${name}`} line={`Smart Listings isn’t working on ${name}.`}
                action={<Button icon="plus" onClick={() => wizard(`entry=add&ch=${c}&from=detail`)}>Add a strategy</Button>} />
            : <DefList label={`${name} strategy`} rows={[
                ['Goal', <>{goal?.label}<small>{GOAL_LINES[c][pl.goal]}</small></>],
                ['Who it’s for', mix ? <>Your own mix<small>{mixText(mix)}</small></> : <>{aud?.label}<small>{AUDIENCE_LINES[c][pl.audience]}</small></>],
                ['Price range', <>{priceOf(pl)} a night<small>Smart Listings never suggests a price outside it.</small></>],
                ['Always asks you first', <ul className="sl-def__list">{asks.map((a) => <li key={a.id} className="sl-def__chip"><Icon name="lock" size={16} />{a.label}</li>)}</ul>],
                ['Autopilot', pl.mode === 'autopilot'
                  ? <>On{state === 'paused' ? ' · paused' : ''}<small>{AUTOPILOT_CHOICES.autopilot.line}</small></>
                  : <>Off<small>{AUTOPILOT_CHOICES.suggest.line}</small></>],
                ['Shared with', shared.length ? <>{shared.map(chName).join(' and ')}<small>Editing it here changes {shared.length > 1 ? 'all of them' : 'both'}, unless you choose only {name}.</small></> : <>Only {name}</>],
                ['What it should know', cur?.brief ? <p className="sl-def__quote">{cur.brief}</p> : <span style={{ color: 'var(--color-text-faint)' }}>Nothing added</span>],
              ]} />}
        </SlSection>
      </div>
      {act.dialog}
    </PageFrame>
  )
}
