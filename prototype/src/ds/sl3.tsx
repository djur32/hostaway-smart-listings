/* Smart Listing v3 components (concepts/smart-listing/V3-SPEC.md §2). CSS: ds/components.css "Smart Listing v3".
 * Screens compose these; no bespoke cards, rows or colours in screens. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Button, CloseButton, Icon, Mark, Segmented, cx } from './primitives'
import { MobileHead, PropertySwitcher } from './shell'
import { BottomSheet, useInSheet, useIsMobile } from './mobile'
import { ValueHover, type ScopeValue } from './fieldscope'
import { TipSheet } from './tooltipSheet'
import { CHANNELS } from '../data/channels'
import type { ChannelId, Property } from '../data/types'
import type { WhyPoint } from '../data/sl3'

/* ---------- property menu: Overview · Shared · Channels · Smart Listings ---------- */
/** `tips` = the channel's pending tips in total, shown on the channel row while it is collapsed; each item's `count` =
 *  that page's own pending tips, shown on the item once the channel is open (Antonio, 3 Oct: "once you open the
 *  channels, the number of open tips should not be at the channels level, but at the smaller elements"). */
export interface NavChannel { id: ChannelId; tips?: number; items: Array<{ key: string; label: string; to: string; trail?: ReactNode; count?: number }> }
export interface NavLinkItem { key: string; label: string; icon: string; to: string; external?: boolean; trail?: ReactNode
  /** Makes a Shared item expandable, like a channel (e.g. Knowledge Hub › Overview, categories, Workflows, Sources). */
  children?: Array<{ key: string; label: string; to: string; end?: boolean
    /** Extra paths that also mark this child active (e.g. Knowledge Hub › Overview on /hub/<topic>). */
    alsoActive?: (pathname: string) => boolean }> }
/** An expandable group's children, kept mounted so opening and closing can animate (grid rows 0fr → 1fr plus a fade,
 *  ds/components.css "h-chnav__drawer"); a closed group is `inert`, so its links are neither focusable nor announced. */
function NavDrawer({ open, children }: { open: boolean; children: ReactNode }) {
  return <div className={cx('h-chnav__drawer', open && 'is-open')} inert={!open}><div className="h-chnav__drawer-inner">{children}</div></div>
}
/** The purple tip count. On a channel row it steps out (down and away) while the channel is open, as its pages' own
 *  counts step in below it; the reverse on close. */
function NavCount({ n, out }: { n?: number; out?: boolean }) {
  if (!n) return null
  return <span className={cx('h-chnav__count', out && 'is-out')} title={`${n} ${n === 1 ? 'tip' : 'tips'}`} aria-hidden={out || undefined}>{n}</span>
}
export type ChannelNavProps = {
  overview: NavLinkItem; shared: NavLinkItem[]; channels: NavChannel[]; smart?: NavLinkItem[] | null; openChannel?: ChannelId | null
  /** The first row's label ("Back" in the desktop rail; the phone sheet says where it goes: "All properties"). */
  backLabel?: string
}
/** Where the route is in the property menu: the leaf the phones' section bar names ("Airbnb › Listing"), its group and
 *  its icon or channel mark. Same matching as ChannelNav's own active states (prefix match; Overview exact-ish). */
export function navCurrent(nav: ChannelNavProps, pathname: string, search = ''): { group?: string; label: string; icon?: string; channel?: ChannelId } | null {
  const under = (to: string) => pathname === to || pathname.startsWith(`${to}/`)
  const photosOf = pathname.endsWith('/photos') ? new URLSearchParams(search).get('back') : null
  for (const c of nav.channels) {
    if (!pathname.includes(`/ch/${c.id}/`) && !pathname.endsWith(`/ch/${c.id}`) && photosOf !== c.id) continue
    const it = photosOf === c.id ? c.items.find((i) => i.key === 'listing') : c.items.find((i) => under(i.to))
    return { group: CHANNELS[c.id].name, label: it?.label ?? CHANNELS[c.id].name, channel: c.id }
  }
  for (const i of nav.smart ?? []) if (under(i.to)) return { group: 'Smart Listings', label: i.label, icon: 'sparkles' }
  for (const i of nav.shared) {
    const child = i.children?.find((c) => under(c.to) || c.alsoActive?.(pathname))
    if (child) return { group: i.label, label: child.label, icon: i.icon }
    if (under(i.to)) return { label: i.label, icon: i.icon }
  }
  if (under(nav.overview.to)) return { label: nav.overview.label, icon: nav.overview.icon }
  return null
}
export function ChannelNav({ overview, shared, channels, smart, openChannel, backLabel = 'Back' }: ChannelNavProps) {
  const loc = useLocation()
  // All photos (/photos?back=<channel>) belongs to that channel's Listing: keep the channel open and Listing marked
  const photosOf = loc.pathname.endsWith('/photos') ? new URLSearchParams(loc.search).get('back') : null
  // Accordion (Antonio, 30 Sep): one group open at a time. The route decides which, until the host picks another;
  // a new route hands control back to the route. null = the host closed everything.
  // a group is the route's when its own path OR any child's path is the page (Listing base › Pricing lives at /base/pricing,
  // not under /details — Antonio, 3 Oct: the group closed and lost its active item there)
  const under = (to: string) => loc.pathname === to || loc.pathname.startsWith(`${to}/`)
  const routeKey = shared.find((i) => i.children && (under(i.to) || i.children.some((c) => under(c.to) || c.alsoActive?.(loc.pathname))))?.key
    ?? (loc.pathname.includes('/smart/') ? 'smart'
    : channels.find((c) => loc.pathname.includes(`/ch/${c.id}`) || photosOf === c.id)?.id ?? openChannel ?? null)
  const [picked, setPicked] = useState<{ path: string; key: string | null } | null>(null)
  const openKey = picked && picked.path === loc.pathname ? picked.key : routeKey
  const toggle = (key: string) => setPicked({ path: loc.pathname, key: openKey === key ? null : key })
  const smartOpen = openKey === 'smart'
  const isOpen = (c: NavChannel) => openKey === c.id
  const item = (i: NavLinkItem) => i.children ? (
    <div key={i.key}>
      <button className="h-chnav__item" aria-expanded={openKey === i.key} onClick={() => toggle(i.key)}>
        <Icon name={i.icon} />{i.label}
        <span className="h-chnav__trail">{i.trail}<Icon name={openKey === i.key ? 'chevron-down' : 'chevron-right'} size={16} /></span>
      </button>
      <NavDrawer open={openKey === i.key}>
        <div className="h-chnav__children">
          {i.children.map((c) => <NavLink key={c.key} to={c.to} end={c.end} className={({ isActive }) => cx('h-chnav__child', !isActive && c.alsoActive?.(loc.pathname) && 'is-here')}>{c.label}</NavLink>)}
        </div>
      </NavDrawer>
    </div>
  ) : (
    // prefix match, so tabbed pages (/details/arrival, /hub/rooms) keep their rail item marked; Overview stays exact
    <NavLink key={i.key} to={i.to} end={i.key === 'overview'} className="h-chnav__item">
      <Icon name={i.icon} />{i.label}{(i.trail || i.external) && <span className="h-chnav__trail">{i.trail}{i.external && <Icon name="external-link" size={16} />}</span>}
    </NavLink>
  )
  return (
    <nav className="h-chnav" aria-label="Property">
      {/* Antonio, 4 Oct: Back does nothing (the case study has no properties list to return to) */}
      <span className="h-subnav__back is-inert" aria-disabled="true"><Icon name="chevron-left" size={16} />{backLabel}</span>
      {item(overview)}
      <div className="h-chnav__group">Shared</div>
      {shared.map(item)}
      {/* Smart Listings sits in Shared, before the channels: one expandable item, its pages nested like a channel's (30 Sep) */}
      {smart && smart.length > 0 && (
        <div>
          <button className="h-chnav__item" aria-expanded={smartOpen} onClick={() => toggle('smart')}>
            <Icon name="sparkles" />Smart Listings
            <span className="h-chnav__trail"><Icon name={smartOpen ? 'chevron-down' : 'chevron-right'} size={16} /></span>
          </button>
          <NavDrawer open={smartOpen}>
            <div className="h-chnav__children">
              {smart.map((i) => <NavLink key={i.key} to={i.to} className="h-chnav__child">{i.label}</NavLink>)}
            </div>
          </NavDrawer>
        </div>
      )}
      <div className="h-chnav__group">Channels</div>
      {channels.map((c) => (
        <div key={c.id}>
          <button className="h-chnav__item" aria-expanded={isOpen(c)} onClick={() => toggle(c.id)}>
            <Mark channel={c.id} />{CHANNELS[c.id].name}
            <span className="h-chnav__trail"><NavCount n={c.tips} out={isOpen(c)} /><Icon name={isOpen(c) ? 'chevron-down' : 'chevron-right'} size={16} /></span>
          </button>
          <NavDrawer open={isOpen(c)}>
            <div className="h-chnav__children">
              {c.items.map((i) => (
                <NavLink key={i.key} to={i.to} end={i.key === 'overview'} className={cx('h-chnav__child', photosOf === c.id && i.key === 'listing' && 'is-here')}>
                  {i.label}{(i.trail || !!i.count) && <span className="h-chnav__trail">{i.trail}<NavCount n={i.count} /></span>}
                </NavLink>
              ))}
            </div>
          </NavDrawer>
        </div>
      ))}
    </nav>
  )
}

/* ---------- page head: row 1 title + switcher, row 2 the page description, row 3 actions ----------
 * One head for every property page (Antonio, 4 Oct: "make sure they all follow the same structure… the description is
 * always integrated in the sticky header"): [title (+ chips) … property selector] · the page's description (+ its
 * action, e.g. Tips or Add strategy, at the right of that line) · any other page row. The page's tabs follow it inside
 * the same sticky block (`.ch-editor__head`, PageFrame). No separator line under any of it. */
export function PageHead({ title, lead, titleEnd, property, actions, right, compactTitle, desc, descAction }: {
  title: ReactNode; lead?: ReactNode
  /** Right next to the title itself, inside the same flex group (e.g. ViewSwitch — Antonio, 1 Oct, third round:
   *  "next to Listing, not next to the property"), as opposed to `right`, which sits at the row's far end by the switcher. */
  titleEnd?: ReactNode
  property?: Property; actions?: ReactNode; right?: ReactNode
  /** Phones: the compact top bar's label once the large title has scrolled away (when the title isn't plain text). */
  compactTitle?: string
  /** The page's description, directly under the title (32px from it), part of the sticky head. */
  desc?: ReactNode
  /** An action on the description's line, at its right end (Tips, Add strategy); its centre is the line's centre. */
  descAction?: ReactNode
}) {
  const mobile = useIsMobile()
  // phones (ds/mobile.md §4): the one phone head — selector, title as the section switcher + Tips, the description, then the page's rows
  if (mobile) return <MobileHead title={title} lead={lead} titleEnd={titleEnd} property={property} actions={actions} right={right} compactTitle={compactTitle}
    sub={desc || descAction ? <>{desc && <p className="h-pagehead__lead">{desc}</p>}{descAction}</> : undefined} />
  return (
    <header className="h-pagehead">
      <div className="h-pagehead__row">
        <div className="h-pagehead__title">{lead}<h1 className="h-h1" style={{ margin: 0 }}>{title}</h1>{titleEnd}</div>
        <span className="h-pagehead__spacer" />{right}{property && <PropertySwitcher property={property} />}
      </div>
      {desc && <div className="h-pagehead__desc"><p className="h-pagehead__lead">{desc}</p>{descAction && <div className="h-pagehead__descaction">{descAction}</div>}</div>}
      {actions && <div className="h-pagehead__row">{actions}</div>}
    </header>
  )
}

/** The property page frame (Antonio, 4 Oct): ONE sticky head — PageHead (title row, description) and, when the page
 *  has them, its tabs or toolbar — over a body that scrolls beneath it; the Tips panel, when open, beside the body.
 *  The channel editor's frame (`.ch-editor`, ds/v3/ch.css), for pages that have no editor of their own (Overview,
 *  Smart Listings). Phones: one scroller, the head scrolls away (ch.css). */
export function PageFrame({ head, tabs, panel, children, className }: { head: ReactNode; tabs?: ReactNode; panel?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx('ch-editor', className)}>
      <div className="ch-editor__head"><div className="ch-page">{head}</div>{tabs}</div>
      <Split main={<div className="ch-page">{children}</div>} panel={panel} />
    </div>
  )
}

export type EditorView = 'classic' | 'canvas'
/** Antonio, 1 Oct, third round: back next to the page title (PageHead's `right`), not inline in the tab row — reverts
 *  the same-day move into `.ch-tabrow` and its "icons off, as an experiment" text-only look. */
export function ViewSwitch({ value, onChange }: { value: EditorView; onChange: (v: EditorView) => void }) {
  // phones (Coordinator, 4 Oct): text only, the segmented look at 44px (.h-m-head__end); desktop keeps its icons
  const mobile = useIsMobile()
  return <Segmented label="View" value={value} onChange={onChange} items={[
    { id: 'classic', label: mobile ? 'Classic' : <><Icon name="list-details" size={16} />Classic</> },
    { id: 'canvas', label: mobile ? 'Canvas' : <><Icon name="eye" size={16} />Canvas</> },
  ]} />
}
/** Opens and closes the Tips side panel; pressed while the panel is open. The count shows only while the panel is
 *  closed (the open panel has its own x of n and ×). */
export function TipsToggle({ count, open, onToggle }: { count: number; open?: boolean; onToggle: () => void }) {
  // Antonio, 3 Oct: once every tip is used up the chip goes — but never under the host's hands: while the panel is open
  // it stays (the panel shows its "all done" state), and it disappears when they close the panel
  // phones (ds/mobile.md §4): a purple text button "Tips" at the right of the title row, no count (Antonio, 4 Oct)
  const mobile = useIsMobile()
  // phones (Antonio, 4 Oct): no Tips button on any screen; a tip is opened from its own dot on the field
  if (mobile || (!count && !open)) return null
  return <Button kind="ai" icon="sparkles" className={mobile ? 'h-m-tipsbtn' : undefined} aria-pressed={!!open} aria-label={open ? 'Close tips' : `Open tips${count ? `, ${count} open` : ''}`} onClick={onToggle}>{count && !open && !mobile ? `Tips · ${count}` : 'Tips'}</Button>
}
/** The editor's strategy line: the strategy this channel follows, or "Autopilot is on" with the way out.
 *  One line, never a card; the link is a text link (DS.md "Strategy line"). */
export function PlanLine({ strategy, autopilot, paused, onChange, onTurnOff }: {
  strategy: string; autopilot?: boolean; paused?: boolean; onChange?: () => void; onTurnOff?: () => void
}) {
  return (
    <span className="h-planline" role="status">
      <Icon name={autopilot ? 'rocket' : 'target'} />
      <span className="h-planline__text" title={strategy}>
        {autopilot ? <><b>Autopilot is on</b> · {strategy}</> : paused ? <><b>Autopilot is paused</b> · {strategy}</> : <>Strategy: <b>{strategy}</b></>}
      </span>
      {autopilot && onTurnOff ? <button type="button" className="h-textlink" onClick={onTurnOff}>Turn off Autopilot to edit</button>
        : onChange ? <button type="button" className="h-textlink" onClick={onChange}>Change</button> : null}
    </span>
  )
}

/* ---------- editability ---------- */
export type FieldState = 'channel' | 'inherit' | 'override' | 'listing' | 'hub' | 'set' | 'linked' | 'only'
const STATE: Record<FieldState, [string, (ch?: ChannelId) => string]> = {
  channel: ['pencil', (c) => `Editable for ${c ? CHANNELS[c].name : 'this channel'}`],
  inherit: ['arrow-back-up', () => 'Uses the Base'],
  override: ['git-compare', (c) => `Custom for ${c ? CHANNELS[c].name : 'this channel'}`],
  listing: ['layers-intersect', () => 'Shared by all channels'],
  hub: ['lock', () => 'From the Knowledge Hub'],
  set: ['lock', (c) => `Set by ${c ? CHANNELS[c].name : 'the channel'}`],
  linked: ['link', () => 'Comes from another section'],
  only: ['pencil', (c) => `${c ? CHANNELS[c].name : 'This channel'} only`],
}
export function StateTag({ state, channel, text }: { state: FieldState; channel?: ChannelId; text?: string }) {
  return <span className={cx('h-state', `h-state--${state}`)}><Icon name={STATE[state][0]} />{text ?? STATE[state][1](channel)}</span>
}
/** The purple tip indicator. `hint`: a one-line definition in the shared hover/focus tooltip (.h-tooltip), so the dot
 *  explains itself (Antonio, 3 Oct: "when you hover on the tip… a brief definition of what it means"). Opt-in: Canvas
 *  also uses the dot for counts that aren't field tips, where the field definition would be wrong. */
export function TipDot({ count = 1, active, onClick, hint }: { count?: number; active?: boolean; onClick?: () => void; hint?: string }) {
  const tipId = useId()
  const dot = <button type="button" className={cx('h-tipdot', active && 'is-active')} onClick={onClick} aria-label={`${count} tip${count > 1 ? 's' : ''}`} aria-describedby={hint ? tipId : undefined}><Icon name="sparkles" />{count > 1 ? count : null}</button>
  if (!hint) return dot
  return <span className="h-tooltip-anchor h-tipdot-anchor">{dot}<span role="tooltip" id={tipId} className="h-tooltip">{hint}</span></span>
}
/** The two field-label AI indicators define themselves in one parallel line each (Tips purple, Smartify yellow). */
export const TIP_DOT_HINT = 'Tip: a suggested improvement for this field'

/** True scope footer + homogenised actions ("Use the Base" / "Customize for {channel}"). */
export function scopeOf(state: FieldState, channel?: ChannelId): { scope: string; action?: string } {
  const name = channel ? CHANNELS[channel].name : 'this channel'
  switch (state) {
    case 'inherit': return { scope: 'Uses the Base', action: `Customize for ${name}` }
    case 'override': return { scope: `Custom for ${name}`, action: 'Use the Base' }
    case 'listing': return { scope: 'All channels', action: 'Edit for all channels' }
    case 'hub': return { scope: 'All channels', action: 'Edit in Knowledge Hub' }
    case 'linked': return { scope: 'All channels', action: 'Open' }
    case 'set': return { scope: `${name} only` } // beside a lock whose tooltip says why (Antonio, 4 Oct)
    case 'only': return { scope: `${name} only` }
    default: return { scope: `${name}`, action: undefined }
  }
}
/** Hospitable's setting row, always stacked: label + help, the control full width, then the caption row
 *  ("ⓘ Uses the Base ········ Customize for Airbnb", mirroring the real "ⓘ 2 channels ···· Edit per channel").
 *  The control itself carries the editability: Base values render in the DS disabled state (DS.md "Field row"). */
export function SettingRow({ label, help, state, channel, children, below, hintAction, tips, tipActive, onTip, onAction, actionLabel, scope, focus, values, hoverOpen, layout, scopeChannels, hubTo, hint = true, labelAddon, lockTip, sheet = true }: {
  label: ReactNode; help?: ReactNode; state: FieldState; channel?: ChannelId; children: ReactNode
  /** Phones (ds/mobile.md §7, Antonio 4 Oct): the row is a read-only summary and the field opens in a bottom sheet
   *  (tap the field or its caption action). false: the row has nothing to edit (read-only, Autopilot, field visibility
   *  "Show"), so it stays a plain row. Rows inside a sheet, toggles and locked / Hub / linked rows never use a sheet. */
  sheet?: boolean
  /** 'set' rows (the channel sets the value itself): why it can't be changed here, in the shared tooltip on the
   *  caption's lock ("🔒 Booking.com only"). Omitted: a plain "{channel} sets this itself" line. */
  lockTip?: string
  /** Sits right after the label (and its tip dot), e.g. the yellow Smartify trigger (ds/smartify.tsx) — the two AI
   *  indicators read as a pair beside the field's name. */
  labelAddon?: ReactNode
  /** 'toggle': on phones the switch sits right of the label, its caption under it right-aligned (ds/mobile.md §8, images/40).
   *  Desktop keeps the stacked row. */
  layout?: 'toggle'
  /** false: drop the whole caption row ("ⓘ N channels · Edit per channel"), not just its text — Listing base › Pricing's
   *  Nightly/Weekend rate rows are the one real-product exception that shows no scope caption at all (base/Pricing.tsx,
   *  concepts/smart-listing/refs/base-pricing/README.md). Every other caller keeps the default. */
  hint?: boolean
  /** Under the caption row (e.g. the "Saving changes every channel" note), so the caption stays attached to the control. */
  below?: ReactNode
  /** an action at the right of the caption line (e.g. the per-day switch) */
  hintAction?: ReactNode
  tips?: number; tipActive?: boolean; onTip?: () => void; onAction?: () => void; actionLabel?: string; scope?: string; focus?: boolean
  /** The values behind the field (Base and channel), shown when hovering the scope caption (Antonio, 30 Sep). */
  values?: ScopeValue[]
  /** Demo URL state (?hover=<field>): the hover starts open for screenshots. */
  hoverOpen?: boolean
  /** The channels a 'listing'/'hub' value actually applies to (the property's own, not a fixed "all"): turns the
   *  caption into a short "N channels" that names them on hover/tap (Antonio, 1 Oct, second round; ref 15) instead of
   *  spelling "All channels" out. Omit to keep the plain-text caption (e.g. states the pattern doesn't apply to). */
  scopeChannels?: ChannelId[]
  /** 'hub' rows only: where "Edit in Knowledge Hub" inside the tooltip goes. With this, the row drops its own
   *  always-visible action link — the tooltip already offers it, and repeating it was the extra text Antonio wants gone. */
  hubTo?: string
}) {
  const s = scopeOf(state, channel)
  // Plain text ("Custom for Airbnb", "Airbnb only"): Antonio tried the logo-in-a-circle badge and dropped it (30 Sep)
  const caption = scope ?? s.scope
  const tipNames = (state === 'listing' || state === 'hub') && scopeChannels?.length ? scopeChannels.map((ch) => CHANNELS[ch].name) : undefined
  const hubLink = state === 'hub' && hubTo ? { label: 'Edit in Knowledge Hub', to: hubTo } : undefined
  // the tooltip's own link replaces the row's separate "Edit in Knowledge Hub" action (less text on screen at once)
  const action = tipNames && hubLink ? undefined : (actionLabel ?? s.action)
  const mobile = useIsMobile()
  // set by the channel (Antonio, 4 Oct): "🔒 Booking.com only", the lock in place of ⓘ, and the reason in the shared
  // tooltip (.h-tooltip-anchor → ds/tooltipLayer.tsx: above it on hover, on keyboard focus, on a tap). The caption is the
  // trigger, as the "ⓘ N channels" caption is (CaptionTip); on phones it takes the same 44px tap area (--tap).
  const why = state === 'set' ? lockTip ?? `${channel ? CHANNELS[channel].name : 'The channel'} sets this itself, so it can’t be edited here.` : undefined
  // phones: the field sheet (summary row → bottom sheet with the live field, its caption and the page's Discard / Save)
  const inSheet = useInSheet()
  const sheetable = mobile && !inSheet && sheet && layout !== 'toggle' && state !== 'hub' && state !== 'set' && state !== 'linked'
  const [open, setOpen] = useState(false)
  const [holdH, setHoldH] = useState(0)
  const ctl = useRef<HTMLDivElement>(null)
  const openSheet = () => { setHoldH(ctl.current?.offsetHeight ?? 0); setOpen(true) }
  useEffect(() => { if (!sheetable) setOpen(false) }, [sheetable])
  // opened by a tap on the field: the cursor goes straight into it (a caption action focuses its own field)
  const sheetCtl = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      const box = sheetCtl.current
      if (!box || box.contains(document.activeElement)) return
      box.querySelector<HTMLElement>('input:not([disabled]):not([type="checkbox"]), textarea:not([disabled])')?.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(t)
  }, [open])
  const name = typeof label === 'string' ? label : 'this field'
  // no caption: a per-row switch (hintAction) still gets the caption line to itself, at its right
  const captionRow = (where: 'row' | 'sheet') => !hint ? (hintAction ? <div className="h-field-hint">{hintAction}</div> : null) : (
          <div className="h-field-hint">
            <span className="h-field-hint__channels">
              {where === 'sheet' ? (
                <><Icon name="info-circle" />{tipNames ? `${tipNames.length} channel${tipNames.length === 1 ? '' : 's'}` : caption}</>
              ) : tipNames ? (
                <CaptionTip names={tipNames} hubLink={hubLink}><Icon name="info-circle" />{tipNames.length} channel{tipNames.length === 1 ? '' : 's'}</CaptionTip>
              ) : values?.length ? (
                <ValueHover values={values} title={typeof label === 'string' ? label : undefined} defaultOpen={hoverOpen}><Icon name="info-circle" />{caption}</ValueHover>
              ) : why ? (
                <span className={cx('h-tooltip-anchor h-captip__trigger', mobile && 'h-captip__trigger--tap')} tabIndex={0} aria-label={`${caption}. ${why}`}>
                  <Icon name="lock" />{caption}<span role="tooltip" className="h-tooltip">{why}</span>
                </span>
              ) : (
                <><Icon name="info-circle" />{caption}</>
              )}
            </span>
            {action && onAction && <button type="button" className="h-field-hint__action"
              onClick={where === 'row' && sheetable ? () => { onAction(); openSheet() } : onAction}>{action}</button>}
            {/* a per-row switch (e.g. "Edit per day") sits at the right of the caption line, not below it (Antonio, 4 Oct) */}
            {hintAction}
          </div>
  )
  return (
    <div className={cx('h-field-row', 'h-field-row--stacked', layout === 'toggle' && 'h-field-row--toggle', focus && 'is-tip-focus', sheetable && 'is-summary')} data-state={state}>
      <div className="h-field-row__head">
        <p className="h-field-row__label">{label} {tips ? <TipDot count={tips} active={tipActive} onClick={onTip} hint={TIP_DOT_HINT} /> : null}{labelAddon}</p>
        {help && <p className="h-field-row__help">{help}</p>}
      </div>
      <div className="h-field-row__control">
        {!sheetable ? children : open ? <div className="h-field-row__hold" style={{ height: holdH }} aria-hidden="true" /> : (
          <div className="h-field-row__summary" ref={ctl}>
            <div className="h-field-row__summary-value" inert>{children}</div>
            <button type="button" className="h-field-row__open" aria-haspopup="dialog" aria-label={`Edit ${name}`} onClick={openSheet} />
          </div>
        )}
        {captionRow('row')}
        {/* phones: a link under the field (e.g. "Edit per day") does its thing, then the field opens in the sheet */}
        {sheetable && below ? <div className="h-field-row__below" onClick={(e) => { if ((e.target as Element).closest('button, a')) openSheet() }}>{below}</div> : below}
      </div>
      {sheetable && (
        <BottomSheet open={open} onClose={() => setOpen(false)} label={name} pageSave className="h-m-fieldsheet"
          title={<span className="h-m-fieldsheet__title">{label}{tips ? <TipDot count={tips} active={tipActive} onClick={onTip} hint={TIP_DOT_HINT} /> : null}{labelAddon}</span>}>
          {help && <p className="h-m-fieldsheet__help">{help}</p>}
          <div className="h-m-fieldsheet__control" ref={sheetCtl}>{open ? children : null}</div>
          {captionRow('sheet')}
          {below}
        </BottomSheet>
      )}
    </div>
  )
}
/** The short "N channels" caption's tooltip (Antonio, 1 Oct, second clarification round, ref 15-channels-tooltip.png):
 *  names the actual channels in a small dark tooltip, replacing a caption that used to spell them out ("All channels").
 *  A Knowledge-Hub-only field adds a link inside the tooltip to edit there (SettingRow then drops its own separate
 *  action link for the same destination — Antonio: "reducing text will simplify it").
 *  Not ds/fieldscope.tsx's ValueHover: that compares the Base and every channel's value in a bigger popover on open;
 *  this only names the channels. Light and simple, matching the reference — it names, it doesn't editorialize.
 *  Phones: no hover, so tap toggles it, the same convention ValueHover already uses. */
export function CaptionTip({ children, names, hubLink }: { children: ReactNode; names: string[]; hubLink?: { label: string; to: string } }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const t = useRef<number | undefined>(undefined)
  const mobile = useIsMobile()
  const show = () => { if (mobile) return; window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(true), 150) }
  const hide = () => { if (mobile) return; window.clearTimeout(t.current); t.current = window.setTimeout(() => setOpen(false), 100) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  const root = useRef<HTMLSpanElement>(null)
  // phones: the shared bottom sheet (tooltipSheet.tsx), never a floating bubble
  if (mobile) return (
    <span className="h-captip" ref={root}>
      <button type="button" className="h-captip__trigger h-captip__trigger--tap" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{children}</button>
      <TipSheet open={open} title={names.length > 1 ? 'Channels' : 'Channel'} onClose={() => setOpen(false)} host={root}>
        <span>{names.join(', ')}</span>
        {hubLink && <Link className="h-captip__link" to={hubLink.to} onClick={() => setOpen(false)}>{hubLink.label}</Link>}
      </TipSheet>
    </span>
  )
  return (
    <span className="h-captip" ref={root} onMouseEnter={show} onMouseLeave={hide}>
      <span className="h-captip__trigger" tabIndex={0} aria-describedby={open ? id : undefined} onFocus={show} onBlur={hide}>{children}</span>
      {open && (
        <span className="h-tooltip h-captip__pop" role="tooltip" id={id} onMouseEnter={show} onMouseLeave={hide}>
          {names.join(', ')}
          {hubLink && <Link className="h-captip__link" to={hubLink.to} onClick={() => setOpen(false)}>{hubLink.label}</Link>}
        </span>
      )}
    </span>
  )
}
/** `tip`: why it's locked — the shared tooltip, anchored on the lock icon itself and centred on it (Antonio, 3 Oct). */
/** A value the host can't edit here. The padlock shows only when it can't be changed at all (set by the channel, fixed
 *  when the listing is created: `tip` says why, or `fixed`). A value edited somewhere else (the Listing base, the Knowledge
 *  Hub, another channel's page) reads as non-interactive with no padlock (Antonio, 4 Oct). */
export function Locked({ children, tip, label, fixed = false }: { children: ReactNode; tip?: string; label?: string; fixed?: boolean }) {
  return (
    <div className="h-locked">{children}
      {tip ? (
        // flexShrink 0: beside a long value (a channel's Summary) the 24px target kept shrinking to the icon, nudging the lock 5px right
        <span className="h-tooltip-anchor h-locked__tip" style={{ flexShrink: 0 }} tabIndex={0} aria-label={label ? `${label}: ${tip}` : tip}>
          <Icon name="lock" /><span role="tooltip" className="h-tooltip">{tip}</span>
        </span>
      ) : fixed ? <Icon name="lock" /> : null}
    </div>
  )
}

/* ---------- Tips ---------- */
/** Main column + side panel. Only the main column scrolls (thin scrollbar). The column snaps to its width and the
 *  sheet fades in from 6px; on close the sheet (and its column) stay for the fade-out (M-17, ds/motion.md). */
const SPLIT_EXIT_MS = 260 // the drawer's slide (--dur-drawer) + one frame of slack
export function Split({ main, panel }: { main: ReactNode; panel?: ReactNode }) {
  const open = !!panel
  const last = useRef<ReactNode>(panel)
  if (panel) last.current = panel
  // closing keeps the last panel mounted for the exit; decided during render so no frame goes without it
  const [prevOpen, setPrevOpen] = useState(open)
  const [leaving, setLeaving] = useState(false)
  if (prevOpen !== open) { setPrevOpen(open); setLeaving(!open) }
  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setLeaving(false), SPLIT_EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving])
  const sheet = open ? panel : leaving ? last.current : null
  return (
    <div className={cx('h-split', open && 'has-panel')}>
      <div className="h-split__main h-scroll-thin">{main}</div>
      {sheet ? <div className={cx('h-split__panel', !open && 'is-leaving')}><div className="h-split__sheet">{sheet}</div></div> : null}
    </div>
  )
}
/** The docked right-hand panel. `tone="refine"` is the same panel titled for a Smartify result (yellow accent,
 *  ds/v3/smartify.css) — one panel shape for both AI systems, only the accent differs. */
export function TipsPanel({ onClose, children, empty, title = 'Tips', tone = 'tip', icon = 'sparkles', footer }: { onClose: () => void; children?: ReactNode; empty?: ReactNode; title?: string; tone?: TipTone
  /** null: no icon before the title (a plain side panel, e.g. editing a Knowledge Hub fact — not a recommendation) */
  icon?: string | null; footer?: ReactNode }) {
  const mobile = useIsMobile()
  // phones: the side panel becomes a bottom sheet over the page (ds/mobile.md §7); same card inside
  if (mobile) return <BottomSheet open title={title} onClose={onClose} footer={footer}><div className="h-tips__body h-tips__body--sheet">{children ?? <div className="h-tips__empty">{empty}</div>}</div></BottomSheet>
  return (
    <aside className={cx('h-tips h-scroll-thin', tone === 'refine' && 'h-tips--refine')} aria-label={title}>
      <div className="h-tips__head"><h2 className="h-tips__title">{icon && <Icon name={icon} />}{title}</h2><CloseButton label={`Close ${title.toLowerCase()}`} onClick={onClose} /></div>
      <div className="h-tips__body">{children ?? <div className="h-tips__empty">{empty}</div>}</div>
      {footer && <div className="h-tips__foot">{footer}</div>}
    </aside>
  )
}
export interface TipCardProps {
  type: string; section?: string; channel?: ChannelId; idx: number; total: number; onPrev?: () => void; onNext?: () => void
  title: string; main: ReactNode; why: WhyPoint[]; accepted?: boolean; money?: boolean
  alts?: string[]; picked?: number; onPick?: (i: number) => void; onGenerate?: () => void
  onAccept: () => void; onDismiss: () => void; onUndo?: () => void
  /** Character limit shown on alternatives (the channel's own limit). */
  limit?: number
  /** Optional third action, e.g. "Save as draft" on a price tip (CV-07). */
  onDraft?: () => void; draftLabel?: string
  /** 'refine': the same card as a Smartify result (host-initiated rewrite) — yellow accent instead of purple, nothing
   *  else changes (Antonio, 3 Oct: "the same style for the recommendations for the tips as… for the change"). */
  tone?: TipTone
  /** What the x-of-n steps through, for the arrows' names ("tip" by default; "version" for Smartify attempts). The
   *  stepper hides when there are no onPrev/onNext handlers (a Smartify result with a single version). */
  navNoun?: string
  /** Extra controls under the main content and alternatives, above Why (Smartify: the follow-up refinements). */
  extra?: ReactNode
  /** Disables Accept while a new version is being written. */
  busy?: boolean
}
export type TipTone = 'tip' | 'refine'

/** THE tip container: head · main · Generate alternatives (below) · why (sentences) · footer. */
export function TipCard(p: TipCardProps) {
  return (
    <article className={cx('h-tip', p.tone === 'refine' && 'h-tip--refine', p.accepted && 'is-accepted')} aria-busy={p.busy || undefined} aria-label={p.type}>
      {/* The head names the field the tip is about — its category, the same name the field carries on the page
       *  ("CHECK-IN METHOD DETAILS", "HOUSE MANUAL"), purple caps — and nothing else: no sparkle, no "· Arrival"
       *  (Antonio, 3 Oct: it truncated). The tip's own title leads the body. */}
      <div className="h-tip__head">
        <span className="h-tip__type">{p.type}</span>
        {(p.onPrev || p.onNext) && <span className="h-tip__nav">
          <button aria-label={`Previous ${p.navNoun ?? 'tip'}`} onClick={p.onPrev} disabled={p.idx <= 1}><Icon name="chevron-left" size={16} /></button>
          {p.idx} of {p.total}
          <button aria-label={`Next ${p.navNoun ?? 'tip'}`} onClick={p.onNext} disabled={p.idx >= p.total}><Icon name="chevron-right" size={16} /></button>
        </span>}
      </div>
      <div className="h-tip__body">
        <div className="h-tip__main"><h3 className="h-tip__title">{p.title}</h3>{p.main}</div>
        {!p.accepted && p.onGenerate && <button className="h-tip__gen" onClick={p.onGenerate}><Icon name="refresh" />{p.alts?.length ? 'Generate 5 more' : 'Generate alternatives'}</button>}
        {!p.accepted && p.alts && p.alts.length > 0 && (
          <div className="h-tip__alts">{p.alts.map((a, i) => (
            <button key={a + i} className={cx('h-tip__alt', p.picked === i && 'is-picked')} onClick={() => p.onPick?.(i)}>
              <span className={cx('h-tile__box', 'h-tile__box--radio')} />{a}{p.limit ? <small>{a.length}/{p.limit}</small> : null}
            </button>))}
          </div>
        )}
        {!p.accepted && p.extra}
        {p.why.length > 0 && (
          <div className="h-tip__why">
            <h4>Why</h4>
            <ul>
              {/* The source is the icon plus its tooltip, not a trailing pill (Antonio, 1 Oct: "remove the chip from
               *  the type and use a tooltip on the icon instead") — the pill repeated on every bullet was heavier
               *  than the hint it carried. Uses the product's shared .h-tooltip anchor, like every other tooltip. */}
              {p.why.map((w, i) => {
                const src = w.source === 'strategy' ? 'Strategy' : w.source === 'hub' ? 'Knowledge Hub' : w.source === 'listing' ? 'Listing base' : 'Inbox'
                return (
                  <li key={`${i}-${w.text}`}>
                    <span className="h-tooltip-anchor h-tip__why-src" tabIndex={0} aria-label={`Source: ${src}`}>
                      <Icon name={w.source === 'strategy' ? 'target' : w.source === 'hub' ? 'book' : w.source === 'listing' ? 'list-details' : 'message-circle'} />
                      <span role="tooltip" className="h-tooltip">{src}</span>
                    </span>
                    <span className="h-tip__why-text">{w.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="h-tip__foot">
        {p.accepted ? (
          <><span className="h-tip__done"><Icon name="circle-check" />Accepted</span>
            <span className="h-tip__actions">{p.onUndo && <Button kind="ghost" icon="arrow-back-up" onClick={p.onUndo}>Undo</Button>}<Button kind="primary" onClick={p.onNext} disabled={p.idx >= p.total}>Next</Button></span></>
        ) : (
          // Antonio, 1 Oct: drop the "Also save to the Knowledge Hub" checkbox — a kb-grounded tip (TipDef.kb) now
          // saves to the Hub automatically on Accept (ChannelTips.tsx), no separate control to remember to tick.
          <span className="h-tip__actions"><Button onClick={p.onDismiss}>Dismiss</Button>{p.onDraft && <Button onClick={p.onDraft}>{p.draftLabel ?? 'Save as draft'}</Button>}<Button kind="primary" onClick={p.onAccept} disabled={p.busy}>Accept</Button></span>
        )}
      </div>
    </article>
  )
}
/* Word diff (LCS over words, whitespace kept with the word before it). Texts here are a few sentences, so O(n·m) is fine. */
type DiffPart = { t: 'same' | 'add' | 'del'; s: string }
function wordDiff(a: string, b: string): DiffPart[] {
  const A = a.match(/\S+\s*/g) ?? [], B = b.match(/\S+\s*/g) ?? []
  const key = (w: string) => w.trim()
  const L = Array.from({ length: A.length + 1 }, () => new Array<number>(B.length + 1).fill(0))
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) L[i][j] = key(A[i]) === key(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out: DiffPart[] = []
  const push = (t: DiffPart['t'], w: string) => { const last = out[out.length - 1]; if (last?.t === t) last.s += w; else out.push({ t, s: w }) }
  let i = 0, j = 0
  while (i < A.length && j < B.length) {
    if (key(A[i]) === key(B[j])) { push('same', B[j]); i++; j++ }
    else if (L[i + 1][j] >= L[i][j + 1]) push('del', A[i++])
    else push('add', B[j++])
  }
  while (i < A.length) push('del', A[i++])
  while (j < B.length) push('add', B[j++])
  return out
}
const SHORT = 80
const CONTEXT_WORDS = 6
/** Unchanged text around an edit, trimmed to just enough context (Antonio, 3 Oct: "you don't have to add the entire
 *  thing… an ellipsis, and simply say what you're adding"). Multi-line text (a bulleted house manual) keeps whole
 *  lines — the one next to the change; prose keeps a few words either side. `at`: where this run sits. */
function trimContext(text: string, at: 'start' | 'middle' | 'end'): string {
  if (text.includes('\n')) {
    const lines = text.split('\n')
    if (at === 'start') return lines.length > 2 ? `…\n${lines.slice(-2).join('\n')}` : text // the line before the change (and its line break)
    if (at === 'end') return lines.length > 2 ? `${lines.slice(0, 2).join('\n')}\n…` : text
    return lines.length > 4 ? `${lines.slice(0, 2).join('\n')}\n…\n${lines.slice(-2).join('\n')}` : text
  }
  const words = text.match(/\S+\s*/g) ?? []
  const lead = text.match(/^\s*/)?.[0] ?? ''
  if (at === 'start') return words.length > CONTEXT_WORDS ? `…${words.slice(-CONTEXT_WORDS).join('')}` : text
  if (at === 'end') return words.length > CONTEXT_WORDS ? `${lead}${words.slice(0, CONTEXT_WORDS).join('').trimEnd()}…` : text
  return words.length > CONTEXT_WORDS * 2 ? `${lead}${words.slice(0, CONTEXT_WORDS).join('')}… ${words.slice(-CONTEXT_WORDS).join('')}` : text
}
/** A suggested change. Antonio, 3 Oct: "you don't have to repeat the original text all the time." So:
 *  - short values (a title, a price, a policy name): before and after, stacked — the pair is the clearest read;
 *  - an edit that keeps most of the text: the new text ONCE, the added words in green, any removed words struck inline;
 *  - a rewrite or a brand-new text: just the new text, no struck-through copy of the old one.
 *  `note`: one line above it, e.g. that accepting customises the field for this channel only (the Base stays). */
export function Diff({ from, to, note }: { from?: string; to: string; note?: ReactNode }) {
  const f = from?.trim() ?? ''
  let body: ReactNode
  if (!f) body = <ins>{to}</ins>
  else if (f.length <= SHORT && to.length <= SHORT) body = <><del>{from}</del><ins>{to}</ins></>
  else {
    const parts = wordDiff(f, to)
    const kept = parts.filter((x) => x.t === 'same').reduce((n, x) => n + x.s.length, 0)
    body = kept / f.length >= 0.5
      ? <p className="h-diff__text">{parts.map((x, k) => (x.t === 'same' ? trimContext(x.s, k === 0 ? 'start' : k === parts.length - 1 ? 'end' : 'middle') : x.t === 'add' ? <ins key={k}>{x.s}</ins> : <del key={k}>{x.s}</del>))}</p>
      : <ins>{to}</ins>
  }
  return <div className="h-diff">{note && <p className="h-diff__note"><Icon name="info-circle" size={16} />{note}</p>}{body}</div>
}

/* ---------- embedded get-started wizard ---------- */
export function WizardStep({ eyebrow, title, sub, children, progress, onBack, onNext, nextLabel = 'Continue', nextDisabled, extra }: {
  eyebrow?: ReactNode; title: string; sub?: string; children: ReactNode; progress: number
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; extra?: ReactNode
}) {
  return (
    <section className="h-wizard">
      <div className="h-wizard__body">
        {eyebrow && <div className="h-wizard__eyebrow">{eyebrow}</div>}
        <h2 className="h-wizard__title">{title}</h2>
        {sub && <p className="h-wizard__sub">{sub}</p>}
        <div className="h-wizard__content">{children}</div>
      </div>
      <div className="h-wizard__progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      <div className="h-wizard__foot">
        {onBack && <Button size="lg" onClick={onBack}>Back</Button>}{extra}
        <Button kind="primary" size="lg" onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
      </div>
    </section>
  )
}
export function Tiles({ cols = 1, children }: { cols?: 1 | 2 | 3; children: ReactNode }) {
  return <div className="h-tiles" style={{ ['--tile-cols' as string]: cols }}>{children}</div>
}
export function OptionTile({ title, line, on, onClick, mode = 'radio', channel, icon, disabled, tag, center }: {
  title: string; line?: ReactNode; on?: boolean; onClick?: () => void; mode?: 'radio' | 'check' | 'plain'; channel?: ChannelId; icon?: string; disabled?: boolean; tag?: ReactNode; center?: boolean
}) {
  return (
    <button type="button" className={cx('h-tile', on && 'is-on', disabled && 'is-disabled', center && 'h-tile--center')} aria-pressed={!!on} disabled={disabled} onClick={onClick}>
      <span className="h-tile__row">
        {mode !== 'plain' && <span className={cx('h-tile__box', mode === 'radio' && 'h-tile__box--radio')}>{mode === 'check' && on && <Icon name="check" size={16} />}</span>}
        {channel ? <Mark channel={channel} /> : icon ? <Icon name={icon} size={18} /> : null}{title}{tag}
      </span>
      {line && <span className="h-tile__line">{line}</span>}
    </button>
  )
}
export function Note({ children, icon = 'sparkles' }: { children: ReactNode; icon?: string }) {
  return <div className="h-note"><Icon name={icon} /><span>{children}</span></div>
}

/* ---------- autopilot, KPIs, lists, changes ---------- */
export function AutopilotBanner({ channel, strategy, sub, paused, onPause, onSee }: { channel: ChannelId; strategy: string; sub?: string; paused?: boolean; onPause?: () => void; onSee?: () => void }) {
  return (
    <div className={cx('h-autopilot', paused && 'is-paused')} role="status">
      <Icon name="rocket" />
      <div className="h-autopilot__text"><b>{paused ? 'Autopilot is paused' : 'Autopilot is on'} for {CHANNELS[channel].name} · {strategy}</b><span>{sub ?? 'Copy and photo order apply inside your guardrails · prices and rules still ask you'}</span></div>
      {onSee && <a href="#changes" onClick={(e) => { e.preventDefault(); onSee() }}>See changes</a>}
      {onPause && <Button onClick={onPause}>{paused ? 'Resume' : 'Pause'}</Button>}
    </div>
  )
}
export function KpiTile({ label, value, delta, down, vs }: { label: string; value: ReactNode; delta?: string; down?: boolean; vs?: string }) {
  return <div className="h-kpi"><span className="h-kpi__label">{label}</span><span className="h-kpi__value">{value}</span>{delta && <span className={cx('h-kpi__delta', down && 'is-down')}>{delta} {vs && <small>{vs}</small>}</span>}</div>
}
export function ListCard({ title, more, children }: { title: ReactNode; more?: ReactNode; children: ReactNode }) {
  return <section className="h-listcard"><h3 className="h-listcard__title">{title}{more && <span className="h-listcard__more">{more}</span>}</h3>{children}</section>
}
export function ListItem({ icon, title, meta, channel, when, action }: { icon: string; title: ReactNode; meta?: ReactNode; channel?: ChannelId; when?: ReactNode; action?: ReactNode }) {
  return (
    <div className="h-listitem">
      <span className="h-listitem__icon"><Icon name={icon} /></span>
      <span className="h-listitem__text"><b>{title}</b>{(meta || channel) && <span>{channel && <Mark channel={channel} />}{meta}</span>}</span>
      {when && <span className="h-listitem__when">{when}</span>}{action}
    </div>
  )
}
export function ChangeRow({ section, what, origin, from, to, action }: { section: string; what: string; origin?: ReactNode; from?: string; to: string; action: ReactNode }) {
  return (
    <div className="h-changerow">
      <span className="h-pill h-pill--neutral">{section}</span>
      <span className="h-changerow__what"><b>{what}</b>{origin && <span>{origin}</span>}</span>
      <Diff from={from} to={to} />{action}
    </div>
  )
}
