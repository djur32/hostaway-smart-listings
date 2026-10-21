/* Smart Listings › Strategy list + channel detail · WS-SL, 3 Oct. CSS: ds/v3/strategy.css (tokens only).
 * One horizontal row per connected channel (Antonio: the three-column cards "don't look good"), the detail's
 * definition list. (History, the list of earlier strategies, was removed with versions, 3 Oct.) */
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from './mobile'
import type { ChannelId } from '../data/types'
import { Mark } from './primitives'
import { Chip } from './overview'

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export type StrategyStatus = 'live' | 'paused' | 'none'
/** Antonio, 3 Oct: the product's own status chips (Overview's Lead listing / Calendar restricted / grey, screenshots 22, 24),
 *  not a dotted pill. Live green, Paused amber, No strategy grey. Shared by the list rows and the channel detail head. */
export function StrategyStatusPill({ status }: { status: StrategyStatus }) {
  if (status === 'live') return <Chip tone="lead">Live</Chip>
  if (status === 'paused') return <Chip tone="restricted">Paused</Chip>
  return <Chip tone="grey">No strategy</Chip>
}

/** The page's description with its page-level action on the same line (PageHead's second row, as the channel detail
 *  puts its status · actions): the action's centre sits on the description's centre. Wraps under it on phones. */
export function StrategyLead({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="sl-leadrow">
      <p className="sl-lead">{children}</p>
      {action && <div className="sl-leadrow__action">{action}</div>}
    </div>
  )
}

export function StrategyRows({ label, children }: { label: string; children: ReactNode }) {
  return <ul className="sl-strats" aria-label={label}>{children}</ul>
}
/** Three fixed tracks, so every row lines up and every row is the same height (Antonio, 3 Oct): channel with its status
 *  chip right after the name · strategy (two lines only: the name, then price · Autopilot), set well clear of the chip ·
 *  actions. When it started lives on the channel's own page (Open), not in the list. ≤ 767px: channel + status on
 *  one line, then the strategy, then the actions. */
export function StrategyRow({ channel, name, status, title, to, line, actions }: {
  channel: ChannelId; name: string; status: StrategyStatus; title: ReactNode; to?: string; line?: ReactNode; actions: ReactNode
}) {
  // phones: the whole card opens the strategy (it is already tappable; no separate Open button), buttons keep their own taps
  const nav = useNavigate()
  const mobile = useIsMobile()
  const tap = mobile && to ? (e: React.MouseEvent) => { if (!(e.target as HTMLElement).closest('button, a, [role="menu"], [role="dialog"]')) nav(to) } : undefined
  return (
    <li className={cx('sl-strat', status === 'none' && 'is-empty', status === 'paused' && 'is-paused', tap && 'is-tappable')} onClick={tap}>
      <div className="sl-strat__channel"><Mark channel={channel} /><span className="sl-strat__name">{name}</span><StrategyStatusPill status={status} /></div>
      <div className="sl-strat__body">
        <p className="sl-strat__title">{to ? <Link to={to}>{title}</Link> : title}</p>
        {line && <p className="sl-strat__line">{line}</p>}
      </div>
      <div className="sl-strat__actions">{actions}</div>
    </li>
  )
}

/** Label / value rows; a value can carry a muted second line (`<small>`). */
export function DefList({ rows, label }: { rows: Array<[string, ReactNode]>; label?: string }) {
  return (
    <dl className="sl-def" aria-label={label}>
      {rows.map(([k, v]) => <div key={k} className="sl-def__row"><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}

export function EmptyStrategy({ title, line, action }: { title: ReactNode; line?: ReactNode; action?: ReactNode }) {
  return (
    <div className="sl-empty-card">
      <div><p className="sl-empty-card__title">{title}</p>{line && <p className="sl-empty-card__line">{line}</p>}</div>
      {action}
    </div>
  )
}
