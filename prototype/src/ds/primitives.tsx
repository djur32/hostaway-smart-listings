/* DS primitives, ported to React (S09, D-128). Class names and structure are S02's (ds/components.css, ds/DS.md);
 * the CSS is imported from ../ds, never copied. New patterns go to ds/ first, then here (CONVENTIONS §6.3). */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import sprite from '../../../ds/icons/sprite.svg?raw'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

/** Mount once (in AppShell): the Tabler icon set + channel marks as <symbol>s, so <use href="#i-…"> works. */
export function IconSprite() {
  return <div aria-hidden="true" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: sprite }} />
}

export function Icon({ name, size, className, style }: { name: string; size?: 16 | 18 | 24; className?: string; style?: CSSProperties }) {
  return (
    <svg className={cx('h-icon', size && `h-icon--${size}`, className)} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}

/** Channel mark as a badge: rounded square in the channel's colour, glyph in white (ds/channels/glyph,
 *  sprite #chg-*). Sized by CSS like before (.h-mark 18px, --14/--24 and context rules); `inactive` = grey badge. */
export function Mark({ channel, size, inactive }: { channel: ChannelId; size?: 14 | 24; inactive?: boolean }) {
  const m = CHANNELS[channel].mark
  return (
    <svg className={cx('h-mark', 'h-mark--badge', `h-mark--${m}`, size && `h-mark--${size}`, inactive && 'is-inactive')} viewBox="0 0 24 24" aria-label={CHANNELS[channel].name} role="img">
      <rect className="h-mark__bg" width="24" height="24" rx="5.5" />
      <use className="h-mark__glyph" href={`#chg-${m}`} width="24" height="24" />
    </svg>
  )
}

export function Marks({ channels }: { channels: ChannelId[] }) {
  return <span className="h-marks">{channels.map((c) => <Mark key={c} channel={c} />)}</span>
}

export function ChannelChip({ channel, children }: { channel: ChannelId; children?: ReactNode }) {
  return <span className="h-channel-chip"><Mark channel={channel} />{children ?? CHANNELS[channel].name}</span>
}

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'legacy' | 'ai'
export function Button({ kind = 'secondary', size, icon, block, className, children, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind; size?: 'md' | 'lg'; icon?: string; block?: boolean }) {
  return (
    <button className={cx('h-btn', `h-btn--${kind}`, size && `h-btn--${size}`, block && 'h-btn--block', className)} {...rest}>
      {icon && <Icon name={icon} size={16} />}{children}
    </button>
  )
}

export function IconButton({ icon, label, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string }) {
  if (icon === 'x') return <CloseButton label={label} {...rest} />
  return <button className="h-btn-icon" aria-label={label} {...rest}><Icon name={icon} /></button>
}

/** The outlined × (ds/components.css "CLOSE", DS.md): every close / dismiss / remove × in the product.
 *  32px box by default; `size="lg"` (40) for full-screen takeovers' top bar, `size="sm"` (20) inside a chip, tag or toast;
 *  `onDark` on a dark surface. Phones: 44 × 44 (sm: 28 with a 44px hit area). */
export function CloseButton({ label = 'Close', size, onDark, className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string; size?: 'sm' | 'lg'; onDark?: boolean }) {
  return (
    <button type={type} className={cx('h-close', size && `h-close--${size}`, onDark && 'h-close--on-dark', className)} aria-label={label} {...rest}>
      <Icon name="x" />
    </button>
  )
}

export function Pill({ kind = 'neutral', children }: { kind?: 'neutral' | 'recommended' | 'warning' | 'error' | 'new' | 'ai' | 'lead' | 'managed' | 'unlisted'; children: ReactNode }) {
  return <span className={`h-pill h-pill--${kind}`}>{children}</span>
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className="h-toggle">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="h-toggle__track" /><span className="h-toggle__thumb" />
    </label>
  )
}

/** Segmented control, e.g. "Live now | After push", "List | One by one". */
export function Segmented<T extends string>({ items, value, onChange, label }: { items: Array<{ id: T; label: ReactNode }>; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <span className="h-lens" role="group" aria-label={label}>
      {items.map((i) => (
        <button key={i.id} className="h-lens__seg" aria-pressed={i.id === value} onClick={() => onChange(i.id)}>{i.label}</button>
      ))}
    </span>
  )
}

/** The channel lens (IA-R rule 3): one component on every kind section. `all` = the shared value.
 *  `all={false}` drops the All segment (a page where channels can't be read together, e.g. Performance);
 *  `size="lg"` matches a 44px field beside it (.h-lens--lg). */
export function Lens({ channels, value, onChange, counts, all = true, size, label = 'See as' }: {
  channels: ChannelId[]; value: ChannelId | 'all'; onChange: (v: ChannelId | 'all') => void; counts?: Partial<Record<ChannelId | 'all', number>>
  all?: boolean; size?: 'lg'; label?: string
}) {
  return (
    <span className={size === 'lg' ? 'h-lens h-lens--lg' : 'h-lens'} role="group" aria-label={label}>
      {all && <button className="h-lens__seg" aria-pressed={value === 'all'} onClick={() => onChange('all')}>
        All{counts?.all !== undefined && <span className="h-lens__count">{counts.all}</span>}
      </button>}
      {channels.map((c) => (
        <button key={c} className="h-lens__seg" aria-pressed={value === c} onClick={() => onChange(c)}>
          <Mark channel={c} />{CHANNELS[c].name}{counts?.[c] !== undefined && <span className="h-lens__count">{counts[c]}</span>}
        </button>
      ))}
    </span>
  )
}

export function Explainer({ title, children, icon = 'info-circle' }: { title?: string; children: ReactNode; icon?: string }) {
  return (
    <div className="h-explainer"><Icon name={icon} />
      <div>{title && <div className="h-explainer__title">{title}</div>}{children}</div>
    </div>
  )
}

export function Empty({ title, children, icon = 'sparkles' }: { title: string; children?: ReactNode; icon?: string }) {
  return (
    <div className="h-empty">
      <svg className="h-empty__icon" aria-hidden="true"><use href={`#i-${icon}`} /></svg>
      <p className="h-empty__title">{title}</p>
      {children && <div className="h-empty__body">{children}</div>}
    </div>
  )
}

export function Photo({ tone, label, style, badge, selected }: { tone: 1 | 2 | 3 | 4 | 5; label?: string; style?: CSSProperties; badge?: string; selected?: boolean }) {
  return (
    <div className={cx('h-photo', `h-photo--${tone}`, selected && 'is-selected')} style={style}>
      {badge && <span className="h-photo__badge">{badge}</span>}{label}
    </div>
  )
}

export { cx }
