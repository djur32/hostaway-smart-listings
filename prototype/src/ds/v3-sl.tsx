/* Smart Listing v3 · WS-SL design-system additions (CSS: ds/v3/sl.css, tokens only).
 * Composes the shared Smart Listing v3 kit (sl3.tsx) and the primitives; screens in screens/smart/ import from '../../ds'. */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button, Icon, Mark, Pill, cx } from './primitives'
import { Toast } from './toast'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

/* ---------- Property overview: Hospitable's HS-21 section rows ---------- */
/** One overview section: title + description on the left, an action on the right (Hospitable › Property › Overview). */
export function SlOverviewSection({ title, desc, action, children, divider }: { title: ReactNode; desc?: ReactNode; action?: ReactNode; children?: ReactNode; divider?: boolean }) {
  return (
    <section className={cx('sl-ovsec', divider && 'sl-ovsec--divider')}>
      <div className="sl-ovsec__head">
        <div><h2 className="sl-ovsec__title">{title}</h2>{desc && <p className="sl-ovsec__desc">{desc}</p>}</div>
        {action && <div className="sl-ovsec__action">{action}</div>}
      </div>
      {children}
    </section>
  )
}
/** A connected listing (HS-21): photo, channel mark, title, meta + pills, and the status select on the right. */
export function SlListingRow({ channel, photo, title, meta, pills, status, statusIcon = 'eye' }: {
  channel: ChannelId; photo: string; title: string; meta: ReactNode; pills?: ReactNode; status: string; statusIcon?: string
}) {
  return (
    <div className="sl-lrow">
      <img className="sl-lrow__thumb" src={photo} alt="" />
      <div className="sl-lrow__main">
        <div className="sl-lrow__title"><Mark channel={channel} />{title}</div>
        <div className="sl-lrow__meta">{meta}{pills}</div>
      </div>
      <button type="button" className="h-input h-select sl-lrow__status"><Icon name={statusIcon} />{status}<Icon name="chevron-down" /></button>
    </div>
  )
}

/* ---------- Smart Listings card on the property overview (SW-01 style) ---------- */
export function SmartOffCard({ onStart, title = 'Let each listing work for the guests you want', line, cta = 'Turn on Smart Listings', foot = 'About 2 minutes · nothing changes until you say so' }: {
  onStart: () => void; title?: string; line: ReactNode; cta?: string; foot?: ReactNode
}) {
  return (
    <section className="sl-promo" aria-label="Smart Listings">
      <span className="sl-promo__icon"><Icon name="sparkles" size={24} /></span>
      <h2 className="sl-promo__title">{title}</h2>
      <p className="sl-promo__line">{line}</p>
      <Button kind="primary" size="lg" onClick={onStart}>{cta}</Button>
      {foot && <p className="sl-promo__foot">{foot}</p>}
    </section>
  )
}
export interface SmartStatusRow { channel: ChannelId; strategy: ReactNode; mode: 'suggest' | 'autopilot'; paused?: boolean; tips: number; tipsTo: string }
/** Smart Listings · On: one compact row per channel (strategy, how it runs, open tips) and links to the section. */
export function SmartStatusCard({ rows, links, note }: { rows: SmartStatusRow[]; links: Array<{ label: string; to: string }>; note?: ReactNode }) {
  return (
    <section className="sl-status" aria-label="Smart Listings">
      <header className="sl-status__head">
        <span className="sl-status__icon"><Icon name="sparkles" /></span>
        <h2 className="sl-status__title">Smart Listings</h2><Pill kind="recommended">On</Pill>
        <span className="sl-status__links">{links.map((l) => <Link key={l.to} className="h-link" to={l.to}>{l.label}</Link>)}</span>
      </header>
      {rows.map((r) => (
        <div key={r.channel} className="sl-status__row">
          <span className="sl-status__ch"><Mark channel={r.channel} />{CHANNELS[r.channel].name}</span>
          <span className="sl-status__strategy">{r.strategy}</span>
          <SlModePill mode={r.mode} paused={r.paused} />
          <Link className="sl-status__tips" to={r.tipsTo}>{r.tips ? <><Icon name="sparkles" size={16} />{r.tips} tip{r.tips > 1 ? 's' : ''}</> : 'No open tips'}</Link>
        </div>
      ))}
      {note && <p className="sl-status__note">{note}</p>}
    </section>
  )
}
/** Autopilot on (or paused) shows a pill; off shows nothing: tips are how every other change arrives (no "Suggest" mode in the UI). */
export function SlModePill({ mode, paused }: { mode: 'suggest' | 'autopilot'; paused?: boolean }) {
  if (mode !== 'autopilot') return null
  if (paused) return <Pill kind="neutral">Autopilot paused</Pill>
  return <span className="sl-mode sl-mode--auto"><Icon name="rocket" size={16} />Autopilot</span>
}

/* ---------- setup wizard parts ---------- */

/* ---------- setup: in-page horizontal stepper (Antonio, 1 Oct voice note) ----------
 * "I'd like the setup of the Smart Listings to be done through a stepper. But not through a dedicated page… you can
 * have a horizontal stepper, but don't make it the way that it is now, and adapt everything to the page that we have."
 * So: no bordered get-started card (.h-wizard) on this screen — the normal PageHead + content column, one compact row
 * of numbered steps under it, and the current step's content below. Completed steps are links back. */
export interface SlStep { id: string; label: string }

/* ---------- plan card: setup summary (Done) and Strategy ---------- */

/** Column-visibility menu (Strategy › Versions table, Antonio 1 Oct voice note): a trigger + checklist on the shared
 *  .h-menu popover pattern (ds/components.css, used by the property switcher and the persona menu). Generic by design
 *  so any table that wants show/hide columns can reuse it, per CONVENTIONS "new patterns go to the DS first". */
export interface ColumnDef { id: string; label: string }

/* ---------- performance ---------- */
/** The page's one quiet provenance line (V3-SPEC §5: label sample data once, in the page footer). */
export function SlPageNote({ children }: { children: ReactNode }) {
  return <p className="sl-pagenote">{children}</p>
}
/** Section heading inside a page (title + one line). `id` lets another section link straight to it ("Versions" jump). */
export function SlSection({ title, line, right, children, id }: { title: ReactNode; line?: ReactNode; right?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="sl-section" id={id}>
      <div className="sl-section__head"><div><h2 className="sl-section__title">{title}</h2>{line && <p className="sl-section__line">{line}</p>}</div>{right}</div>
      {children}
    </section>
  )
}

/* ---------- confirmations (WS-SL) ---------- */
/** The confirmation after an action (save, pause, remove…), with Undo: the shared Toast (./toast), keyed on its
 *  text so a new message restarts the timer. */
export function SlConfirm({ children, onUndo, onClose }: { children: ReactNode; onUndo?: () => void; onClose?: () => void }) {
  return <Toast key={typeof children === 'string' ? children : undefined} onUndo={onUndo} onClose={onClose}>{children}</Toast>
}
