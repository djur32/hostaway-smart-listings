/* Smart Listings › Strategy (V3-SPEC §1 "Strategy management") · WS-SL. Reworked 3 Oct (Antonio): Setup is gone as a
 * page and everything lives here — "When you go to Strategy you see the strategies in place. You can edit them one by
 * one; editing takes you to the full-screen wizard. You can remove it, pause it, or change it for a different strategy
 * you've used before … You can add a new strategy." The three side-by-side cards ("doesn't look good when we have three
 * columns") became one full-width row per connected channel, stacked: channel + status · the strategy and a one-line
 * summary · Open / Edit / ⋯ (Pause or Resume, Replace with a new strategy, Remove).
 * A channel without one says so, with Add a strategy. Open goes to the channel's detail (StrategyChannel.tsx): every
 * answer of its current strategy. Numbers stay in Performance.
 * 3 Oct, later (Antonio, overriding the above where they differ): no versions anywhere — no version numbers, no History,
 * no "Replace with a previous strategy". A channel has one current strategy; edit it or replace it in the wizard.
 * SCR: Strategy · R-072 / R-075. URL: ?smart=on seeds the demo strategies. */
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, OvMenu, PageFrame, PageHead, SlConfirm, SmartOffCard, StrategyRow, StrategyRows } from '../../ds'
import { chName, type ListingChannel } from '../../data/sl3'
import { useListingChannels } from '../../store/selectors'
import { priceOf, useSlLocal } from '../../data/v3-sl'
import { useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { hasStrategy, mixOf, sharedWith, strategyState, strategyText, syncVersions, useSmartDemo } from './shared'
import { useStrategyActions } from './strategyActions'

/** "12 Aug", or "12 Aug 2025" outside this year. */
export function dayText(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(y !== new Date().getFullYear() ? { year: 'numeric' } : {}) })
}

export function Strategy() {
  useSmartDemo()
  const p = useProperty()
  const nav = useNavigate()
  const loc = useLocation()
  const on = useStore((s) => s.smartListings)
  const setSmart = useStore((s) => s.setSmartListings)
  const sl3 = useStore((s) => s.sl3)
  const mixes = useSlLocal((s) => s.mix)
  const CHANNELS = useListingChannels() // this property's connected channels (QA B01)
  const base = `/property/${p.id}`
  const saved = (loc.state as { saved?: string } | null)?.saved
  const act = useStrategyActions(saved ? { text: saved } : null)
  const live = CHANNELS.filter((c) => hasStrategy(sl3, c))
  // the live plan is always what's recorded (an edit left half-way is still what runs)
  useEffect(() => { if (on && sl3.setupDone) syncVersions(live) }, [on, sl3.setupDone, live.join(), sl3.plans]) // eslint-disable-line react-hooks/exhaustive-deps
  // the confirmation is shown once: a reload or Back doesn't bring it back
  useEffect(() => { if (saved) nav(loc.pathname + loc.search, { replace: true, state: null }) }, [saved]) // eslint-disable-line react-hooks/exhaustive-deps

  const wizard = (qs: string) => nav(`${base}/smart/wizard?${qs}`)
  const desc = 'A strategy sets each channel’s goal, guests, price range and what always asks you first.'
  const add = <Button kind="primary" icon="plus" onClick={() => wizard(sl3.setupDone ? 'entry=add&from=strategy' : 'entry=first&from=strategy')}>Add strategy</Button>

  if (!sl3.setupDone && !live.length) return (
    <PageFrame head={<PageHead title="Strategy" property={p} desc={desc} />}>
      <div><SmartOffCard title="No strategy yet" cta="Set up a strategy" onStart={() => wizard('entry=first&from=strategy')}
        line="Pick a goal and the guests you want for each channel. Smart Listings tips follow it." /></div>
    </PageFrame>
  )
  if (!on) return (
    <PageFrame head={<PageHead title="Strategy" property={p} desc={desc} />}>
      {/* QA B16: off keeps the strategies, so turning it back on restores them */}
      <div><SmartOffCard title="Smart Listings is off" cta="Turn on Smart Listings" onStart={() => setSmart(true)} foot="Your strategies are kept as you left them"
        line="No tips or Autopilot changes while it’s off. Turn it on to pick up where you left off." /></div>
    </PageFrame>
  )

  return (
    // Antonio, 3 Oct: Add strategy sits on the description's line, not the title's; the line says what a strategy does,
    // and stays one line at 1440. The head (title, description, Add strategy) stays while the rows scroll (4 Oct).
    <PageFrame head={<PageHead title="Strategy" property={p} desc={desc} descAction={add} />}>
      <div className="sl-page">
        {act.flash && <SlConfirm onUndo={act.flash.undo} onClose={() => act.setFlash(null)}>{act.flash.text}</SlConfirm>}
        <StrategyRows label="Strategies by channel">
          {CHANNELS.map((c) => row(c))}
        </StrategyRows>
      </div>
      {act.dialog}
    </PageFrame>
  )

  /** a plain function, not a component: an inner component would remount (and close its menu) on every render */
  function row(c: ListingChannel) {
    const state = strategyState(sl3, c)
    const open = `${base}/smart/strategy/${c}`
    if (state === 'none') {
      // the status column already says "No strategy": the strategy column says what that means
      return <StrategyRow key={c} channel={c} name={chName(c)} status="none" title={`Smart Listings isn’t working on ${chName(c)}`}
        actions={<Button icon="plus" onClick={() => wizard(`entry=add&ch=${c}&from=strategy`)}>Add strategy</Button>} />
    }
    const pl = sl3.plans[c]!
    const shared = sharedWith(sl3, c)
    const line = [
      `${priceOf(pl)} a night`,
      `Autopilot ${pl.mode === 'autopilot' ? 'on' : 'off'}`,
      shared.length ? `Shared with ${shared.map(chName).join(' and ')}` : null,
    ].filter(Boolean).join(' · ')
    return <StrategyRow key={c} channel={c} name={chName(c)} status={state} to={open}
      title={strategyText(pl, mixOf(sl3, c, mixes))} line={line}
      actions={<>
        <Button className="sl-strat__open" onClick={() => nav(open)}>Open</Button>
        <Button icon="pencil" onClick={() => wizard(`entry=edit&ch=${c}&from=strategy`)} aria-label={`Edit the ${chName(c)} strategy`}>Edit</Button>
        <OvMenu label={`More actions for ${chName(c)}`} items={[
          state === 'paused' ? { label: 'Resume', onSelect: () => act.resume(c) } : { label: 'Pause', onSelect: () => act.askPause(c) },
          { label: 'Replace with a new strategy', onSelect: () => wizard(`entry=replace&ch=${c}&from=strategy`) },
          { label: 'Remove', onSelect: () => act.askRemove(c) },
        ]} />
      </>} />
  }
}
