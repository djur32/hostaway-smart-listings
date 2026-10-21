/* Record patterns (S02 §10, D-023/D-024): source chip, sync state, override pin, fact row, provenance line.
 * Used by every kind section (The home, Arrival & stay, Rules & booking, Pricing) — one fact-row pattern, one lens. */
import type { ReactNode } from 'react'
import { CHANNELS } from '../data/channels'
import type { CanonicalField, ChannelId, Fact, Source, SyncState } from '../data/types'
import { projection } from '../store/selectors'
import { Icon, Mark } from './primitives'

const SOURCE_TEXT: Record<Source['kind'], string> = {
  airbnb: 'From Airbnb', booking: 'From Booking.com', vrbo: 'From Vrbo', host: 'Added by you', ai: 'Suggested by AI',
  portfolio: 'From your group', guidebook: 'From your guidebook', team: 'From your team', device: 'From your device',
}

export function SourceChip({ source }: { source: Source }) {
  const channel = (['airbnb', 'booking', 'vrbo'] as const).find((c) => c === source.kind)
  const mod = source.kind === 'host' ? 'h-source--you' : source.kind === 'ai' ? 'h-source--ai' : ''
  return (
    <span className={`h-source ${mod}`} title={source.detail}>
      {channel ? <Mark channel={channel} /> : <Icon name={source.kind === 'ai' ? 'sparkles' : 'user'} />}
      {source.detail?.startsWith('Decided') ? 'Decided by you' : SOURCE_TEXT[source.kind]}
    </span>
  )
}

const SYNC: Record<SyncState, { cls: string; icon: ReactNode; text: (c: string) => string }> = {
  'in-sync': { cls: 'ok', icon: <span className="h-sync__dot" />, text: (c) => `Up to date on ${c}` },
  pending: { cls: 'pending', icon: <Icon name="loader-2" />, text: (c) => `Sending to ${c}…` },
  'in-review': { cls: 'pending', icon: <Icon name="clock" />, text: (c) => `In ${c} review` },
  failed: { cls: 'failed', icon: <Icon name="cloud-x" />, text: (c) => `Couldn’t update ${c}` },
  drifted: { cls: 'drifted', icon: <Icon name="alert-triangle" />, text: (c) => `Changed on ${c}` },
  'channel-managed': { cls: 'ok', icon: <Icon name="lock" />, text: (c) => `Managed on ${c}` },
  'not-published': { cls: 'ok', icon: <Icon name="eye-off" />, text: (c) => `Not shown on ${c}` },
}

export function SyncBadge({ state, channel }: { state: SyncState; channel: ChannelId }) {
  const s = SYNC[state]
  return <span className={`h-sync h-sync--${s.cls}`}>{s.icon}{s.text(CHANNELS[channel].name)}</span>
}

export function OverridePin({ channel, value, onReset, resetLabel }: { channel: ChannelId; value: string; onReset?: () => void; resetLabel?: string }) {
  return (
    <span className="h-override">
      <Icon name="map-pin" className="h-override__pin" /><Mark channel={channel} />
      {CHANNELS[channel].name} uses <b>{value}</b>
      {onReset && <button className="h-override__reset" onClick={onReset}>{resetLabel ?? 'Use the shared value'}</button>}
    </span>
  )
}

export function ProvLine({ children, icon = 'clock', channel, ai }: { children: ReactNode; icon?: string; channel?: ChannelId; ai?: boolean }) {
  return <div className={`h-provline${ai ? ' h-provline--ai' : ''}`}>{channel ? <Mark channel={channel} /> : <Icon name={icon} />}{children}</div>
}

/** One fact, one row: label · value · source · (lens on) how it reads on each channel. Never two fields for one fact. */
export function FactRow({ field, fact, lens, channels, side, onEdit, names, children }: {
  field: CanonicalField; fact: Fact; lens: ChannelId | 'all'; channels: ChannelId[]; side?: ReactNode; onEdit?: () => void
  /** S11 (additive): with the lens on All, show what each channel calls the fact ("one bathtub, four names", C7). */
  names?: boolean
  /** S11 (additive): extra content under the row (an inline override editor, a question). */
  children?: ReactNode
}) {
  const shown = lens === 'all' ? null : projection(fact, lens)
  const overrides = Object.entries(fact.overrides) as Array<[ChannelId, NonNullable<Fact['overrides'][ChannelId]>]>
  const value = shown ? shown.text : fact.value ?? (fact.status === 'conflict' ? 'Channels disagree' : '—')
  const dim = shown?.kind === 'unsupported'
  return (
    <div className="h-fact" style={dim ? { opacity: 0.55 } : undefined} data-field={field.id}>
      <div className="h-fact__label">{field.label}<small>{field.visibility !== 'public' ? `${field.visibility} · ` : ''}{field.type}</small></div>
      <div className="h-fact__value">
        {fact.status === 'conflict' && lens === 'all' ? <span className="h-hatch">{value}</span> : value}
      </div>
      <div className="h-fact__side">
        {side ?? (lens === 'all' ? <SourceChip source={fact.source} /> : fact.sync[lens] && <SyncBadge state={fact.sync[lens]!} channel={lens} />)}
        {onEdit && <button className="h-btn-icon" aria-label={`Edit ${field.label}`} onClick={onEdit}><Icon name="pencil" /></button>}
      </div>
      {lens === 'all' && (overrides.length > 0 || fact.status === 'conflict') && (
        <div className="h-fact__proj">
          {(overrides.length ? overrides.map(([c, o]) => [c, o.value] as const) : fact.observations.map((o) => [o.source.kind as ChannelId, o.value] as const))
            .filter(([c]) => channels.includes(c))
            .map(([c, v]) => (
              <span key={c} className={fact.status === 'conflict' ? 'is-differs' : ''}><Mark channel={c} />{CHANNELS[c].name}: <b>{v}</b></span>
            ))}
        </div>
      )}
      {lens !== 'all' && field.names[lens] && shown?.kind !== 'unsupported' && (
        <div className="h-fact__proj"><span><Mark channel={lens} />On {CHANNELS[lens].name}: <b>{field.names[lens]}</b></span></div>
      )}
      {lens !== 'all' && shown?.kind === 'unsupported' && (
        <div className="h-fact__proj"><span><Mark channel={lens} />{CHANNELS[lens].name} has no field for this. It stays in your home{field.visibility === 'public' ? ' and the assistant uses it' : ''}.</span></div>
      )}
      {names && lens === 'all' && !overrides.length && fact.status !== 'conflict' && channels.some((c) => field.names[c]) && (
        <div className="h-fact__proj">
          {channels.map((c) => (
            <span key={c}><Mark channel={c} />{CHANNELS[c].name}: <b>{field.names[c] || 'not on this channel'}</b></span>
          ))}
        </div>
      )}
      {children && <div style={{ gridColumn: '1 / -1' }}>{children}</div>}
    </div>
  )
}
