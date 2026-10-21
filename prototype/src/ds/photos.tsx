/* Photos (Hostaway replica) · React ports of ds/components.css "PHOTOS (Hostaway replica)".
 * Photos row, All photos tile, "Cover for" pill, hidden label, channel filter, warning banner, checkbox cards and the
 * large Edit photo modal (screenshots 3, 8, 9, 10, 11). Presentational: state lives in the screen/store. */
import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { CloseButton, Icon, Mark, cx } from './primitives'
import type { ChannelId } from '../data/types'

/** Essentials › Photos: "Photos (n)", description, "Manage photos" link, five thumbnails and "+n more". */
export function PhotosRow({ label = 'Photos', count, desc = 'Manage photos and add details.', manageTo, photos, max = 5, extra, after, onManage }: {
  label?: ReactNode; count: number; desc?: ReactNode; manageTo: string; photos: Array<{ key: string; src: string; alt: string }>; max?: number; extra?: ReactNode
  /** After the count, e.g. the channel badge when this channel has its own order. */
  after?: ReactNode
  /** Intercepts "Manage photos" (and "+n more") instead of letting the Link navigate — e.g. opening an in-page
   *  overlay rather than a route change (screens/channel/photosNav.tsx's full-screen/drawer patterns, Airbnb only).
   *  `manageTo` still renders as the href (middle-click / open-in-new-tab / no-JS keep working); omit for today's
   *  plain route navigation (Booking.com, Direct, and the standalone /photos route — all unaffected). */
  onManage?: (e: MouseEvent) => void
}) {
  // Thumbnails keep one size (the closed-panel size); a narrower column fits fewer per row. At most two rows:
  // when the tiles don't fit, fewer photos show and the last tile is "+n more".
  const grid = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(max + 1)
  useLayoutEffect(() => {
    const el = grid.current
    if (!el) return
    const read = () => setCols(Math.max(1, getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length))
    const ro = new ResizeObserver(read)
    ro.observe(el); read()
    return () => ro.disconnect()
  }, [])
  // ONE row only: fewer tiles + "+n more" when the column narrows
  const tiles = Math.min(max + 1, cols)
  const fitsAll = Math.min(photos.length, count) <= tiles && count <= tiles
  const shown = photos.slice(0, fitsAll ? tiles : Math.min(max, tiles - 1))
  const more = count - shown.length
  return (
    <div className="h-photos-row">
      <div className="h-photos-row__head">
        <div>
          <p className="h-photos-row__title">{label}<span className="h-photos-count" aria-label={`${count} photos`}>{count}</span>{after}</p>
          <p className="h-photos-row__desc">{desc}</p>
          {extra}
        </div>
        <Link className="h-photos-row__manage" to={manageTo} onClick={onManage}>Manage</Link>
      </div>
      <div className="h-photos-row__grid" ref={grid}>
        {shown.map((p) => <figure key={p.key} className="h-photo-thumb"><img src={p.src} alt={p.alt} /></figure>)}
        {more > 0 && <Link className="h-photo-thumb h-photo-thumb--more" to={manageTo} onClick={onManage}>+{more} more</Link>}
      </div>
    </div>
  )
}

/** "Cover for [marks]": the channels where this photo is the cover (replaces the old "Cover" badge). */
export function CoverPill({ channels }: { channels: ChannelId[] }) {
  if (!channels.length) return null
  return <span className="h-photo-cover">Cover for {channels.map((c) => <Mark key={c} channel={c} />)}</span>
}
/** Neutral "Hidden on Booking.com" label on a dimmed tile. */
export function HiddenPill({ children, label }: { children: ReactNode; label?: string }) {
  return <span className="h-photo-hidden" title={label} aria-label={label}><Icon name="eye-off" />{children}</span>
}

/** A tile on All photos: select (top-left), edit or drag handle (top-right), labels (bottom-left).
 *  Drag to reorder (ds/sortable.tsx): spread `useSortable().itemProps(key)` onto it; the grip (re-order mode) is the
 *  Hostaway 6-dot `.h-drag-grip` and the touch drag handle (`data-drag-handle`). */
export function PhotoTile({ src, alt, selected, onSelect, onEdit, foot, hidden, reorder, grip, className, ref, ...rest }: {
  src: string; alt: string; selected?: boolean; onSelect?: (on: boolean) => void; onEdit?: () => void; foot?: ReactNode; hidden?: boolean
  reorder?: boolean; grip?: HTMLAttributes<HTMLButtonElement> & { 'aria-label': string; ref?: Ref<HTMLButtonElement> }; className?: string
  ref?: Ref<HTMLDivElement>
} & Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  return (
    <div ref={ref} className={cx('h-photo-tile', selected && 'is-selected', hidden && 'is-hidden', reorder && 'h-photo-tile--reorder', className)} {...rest}>
      <img src={src} alt={alt} draggable={false} />
      {!reorder && onSelect && (
        <input type="checkbox" className="h-checkbox h-photo-tile__select" checked={!!selected} onChange={(e) => onSelect(e.target.checked)} aria-label={`Select ${alt}`} />
      )}
      {reorder
        ? <button type="button" className="h-photo-tile__tool h-photo-tile__tool--grip h-drag-grip" data-drag-handle {...grip}><Icon name="grip-vertical" /></button>
        : onEdit && <button type="button" className="h-photo-tile__tool" onClick={onEdit} aria-label={`Edit ${alt}`}><Icon name="pencil" /></button>}
      {foot && <div className="h-photo-tile__foot">{foot}</div>}
    </div>
  )
}

/** "All photos | Airbnb | Booking.com | Direct bookings" (the real page's segmented filter). */
export function PhotosFilter<T extends string>({ items, value, onChange, label = 'Show photos for' }: {
  items: Array<{ id: T; label: ReactNode; channel?: ChannelId; count?: number }>; value: T; onChange: (v: T) => void; label?: string
}) {
  return (
    <span className="h-photos-filter" role="group" aria-label={label}>
      {items.map((i) => (
        <button key={i.id} type="button" className="h-photos-filter__seg" aria-pressed={i.id === value} onClick={() => onChange(i.id)}>
          {i.channel && <Mark channel={i.channel} />}{i.label}{i.count !== undefined && <span className="h-photos-filter__n">{i.count}</span>}
        </button>
      ))}
    </span>
  )
}

/** Amber banner: "Manage your photos in Hostaway". */
export function Banner({ title, children, icon = 'alert-triangle' }: { title: ReactNode; children?: ReactNode; icon?: string }) {
  return (
    <div className="h-banner" role="note">
      <Icon name={icon} />
      <div><p className="h-banner__title">{title}</p>{children && <p className="h-banner__body">{children}</p>}</div>
    </div>
  )
}

/** Checkbox card: [✓][mark] Channel. */
export function CheckCard({ channel, label, checked, disabled, onChange, title }: {
  channel?: ChannelId; label: ReactNode; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; title?: string
}) {
  return (
    <label className={cx('h-check-card', disabled && 'is-disabled')} title={title}>
      <input type="checkbox" className="h-checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {channel && <Mark channel={channel} />}<span>{label}</span>
    </label>
  )
}

/** The large modal (Edit photo): centred title over a divider, scrolling body, footer with a start slot. */
export function SheetModal({ title, onClose, children, foot, footStart }: { title: string; onClose: () => void; children: ReactNode; foot: ReactNode; footStart?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    return () => prev?.focus?.()
  }, [])
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
  return (
    <div className="h-scrim h-scrim--fixed" onMouseDown={onClose}>
      <div ref={ref} tabIndex={-1} className="h-modal h-modal--sheet" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="h-modal__head">
          <h2 className="h-modal__title">{title}</h2>
          <CloseButton className="h-modal__close" onClick={onClose} />
        </div>
        <div className="h-modal__body">{children}</div>
        <div className="h-modal__foot">{footStart && <div className="h-modal__foot-start">{footStart}</div>}{foot}</div>
      </div>
    </div>
  )
}
