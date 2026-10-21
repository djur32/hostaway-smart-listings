/* Knowledge Hub iteration KH-C · Guest questions first (concepts/knowledge-hub/KH-C.md). CSS: ds/v3/kh-c.css (tokens only).
 * Journey tabs with gap counts, the ask box with "Answer as [channel]", coverage state (Answered · Partly answered ·
 * Not answered), question rows with the AI's answer and the facts behind it, provenance, coverage meters, and the side
 * panel (Sources, Gaps) that slides in beside the content like a drawer. Captions are plain text; the channel Mark only
 * appears where a channel is the subject (a guest message, "Answer as", where a fact will be used). */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CloseButton, Icon, Mark, cx } from './primitives'
import { BottomSheet, useIsMobile } from './mobile'
import { ChannelBadge, Dropdown } from './fieldscope'
import { CHANNELS } from '../data/channels'
import type { ChannelId } from '../data/types'

export type KhcState = 'a' | 'p' | 'n'
const STATE: Record<KhcState, { label: string; icon: string }> = {
  a: { label: 'Answered', icon: 'circle-check' },
  p: { label: 'Partly answered', icon: 'circle-half-2' },
  n: { label: 'Not answered', icon: 'circle-dashed' },
}
export const khcStateLabel = (s: KhcState) => STATE[s].label

/* ---------- the guest-journey tab bar (one line; scrolls sideways when narrow) ---------- */
export function KhcTabs({ items, active, onSelect }: { items: Array<{ id: string; label: string; count?: number }>; active: string; onSelect: (id: string) => void }) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => { bar.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }, [active])
  return (
    <div className="h-tabs h-khc-tabs h-scroll-thin" role="tablist" aria-label="Guest journey" ref={bar}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" className="h-tab h-khc-tab" aria-selected={t.id === active} onClick={() => onSelect(t.id)}>
          {t.label}{t.count ? <span className="h-khc-tab__count" aria-label={`${t.count} ${t.count === 1 ? 'gap' : 'gaps'}`}>{t.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

/* ---------- coverage state ---------- */
export function KhcStateIcon({ state }: { state: KhcState }) {
  return <Icon name={STATE[state].icon} size={18} className={cx('h-khc-state', `h-khc-state--${state}`)} />
}
export function KhcStatePill({ state }: { state: KhcState }) {
  return <span className={cx('h-pill', 'h-khc-pill', `h-khc-pill--${state}`)}><Icon name={STATE[state].icon} />{STATE[state].label}</span>
}

/* ---------- the ask box + the slim controls beside it ---------- */
export function KhcAsk({ value, onChange, onSubmit, channel, channels, onChannel }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; channel: ChannelId; channels: ChannelId[]; onChannel: (c: ChannelId) => void
}) {
  return (
    <form className="h-khc-ask" role="search" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <Icon name="sparkles" className="h-khc-ask__spark" />
      <input className="h-khc-ask__input" value={value} placeholder="Ask anything a guest might" aria-label="Ask anything a guest might" onChange={(e) => onChange(e.target.value)} />
      <span className="h-khc-ask__as">
        <span className="h-khc-ask__aslabel">Answer as</span>
        <Mark channel={channel} />
        <Dropdown label="Answer as" value={CHANNELS[channel].name} options={channels.map((c) => CHANNELS[c].name)}
          onChange={(n) => onChannel(channels.find((c) => CHANNELS[c].name === n) ?? channel)} />
      </span>
    </form>
  )
}
export function KhcControl({ icon, label, count, on, onClick }: { icon: string; label: string; count: number; on?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={cx('h-khc-ctl', on && 'is-on')} aria-pressed={!!on} onClick={onClick}>
      <Icon name={icon} size={16} /><span className="h-khc-ctl__label">{label}</span><span className="h-khc-ctl__count">· {count}</span>
    </button>
  )
}
/** What the ask box answers: the question it matched, the answer as the chosen channel, and where it came from. */
export function KhcAskResult({ title, meta, children, onClose, action }: { title: ReactNode; meta?: ReactNode; children: ReactNode; onClose: () => void; action?: ReactNode }) {
  return (
    <section className="h-khc-askres" aria-label="Answer">
      <div className="h-khc-askres__head">
        <Icon name="sparkles" className="h-khc-ask__spark" />
        <div className="h-khc-askres__title">{title}{meta && <span className="h-khc-askres__meta">{meta}</span>}</div>
        <CloseButton label="Close the answer" onClick={onClose} />
      </div>
      <div className="h-khc-askres__body">{children}{action && <div className="h-khc-askres__action">{action}</div>}</div>
    </section>
  )
}

/* ---------- small pieces ---------- */
export function KhcProv({ items }: { items: string[] }) {
  return <p className="h-khc-prov"><Icon name="stack-2" /><span>From:</span><b>{items.join(' · ')}</b></p>
}
export function KhcLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="h-khc-label"><h4>{children}</h4>{right && <span>{right}</span>}</div>
}
export function KhcCard({ title, aside, children, className }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('h-khc-card', className)}>
      {(title || aside) && <div className="h-khc-card__head">{title && <h3 className="h-khc-card__title">{title}</h3>}{aside && <span className="h-khc-card__aside">{aside}</span>}</div>}
      {children}
    </section>
  )
}
export function KhcMeter({ value, total }: { value: number; total: number }) {
  return <span className="h-khc-meter" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}><span style={{ width: `${total ? (value / total) * 100 : 0}%` }} /></span>
}
/** Answered · Partly answered · Not answered, as one bar with its legend. */
export function KhcCoverage({ a, p, n }: { a: number; p: number; n: number }) {
  const seg = (v: number, k: KhcState) => (v ? <span className={`h-khc-bar__seg h-khc-bar__seg--${k}`} style={{ flexGrow: v }} /> : null)
  return (
    <>
      <div className="h-khc-bar" aria-hidden="true">{seg(a, 'a')}{seg(p, 'p')}{seg(n, 'n')}</div>
      <p className="h-khc-legend">
        <span><i className="h-khc-dot h-khc-dot--a" />Answered · {a}</span>
        <span><i className="h-khc-dot h-khc-dot--p" />Partly answered · {p}</span>
        <span><i className="h-khc-dot h-khc-dot--n" />Not answered · {n}</span>
      </p>
    </>
  )
}
export function KhcStageRow({ label, answered, total, gaps, onClick }: { label: string; answered: number; total: number; gaps: number; onClick: () => void }) {
  return (
    <button type="button" className="h-khc-stage" onClick={onClick}>
      <span className="h-khc-stage__label">{label}</span>
      <KhcMeter value={answered} total={total} />
      <span className="h-khc-stage__n">{answered} of {total}</span>
      <span className={cx('h-khc-stage__gaps', gaps > 0 && 'is-gap')}>{gaps ? `${gaps} ${gaps === 1 ? 'gap' : 'gaps'}` : 'All answered'}</span>
      <Icon name="chevron-right" size={16} />
    </button>
  )
}
/** One gap in a list (Overview's Top gaps): state, question, how often it's asked, one text link. */
export function KhcGapRow({ state, question, meta, extra, action }: { state: KhcState; question: string; meta: ReactNode; extra?: ReactNode; action: ReactNode }) {
  return (
    <div className="h-khc-gaprow">
      <KhcStateIcon state={state} />
      <div className="h-khc-gaprow__text"><p className="h-khc-gaprow__q">{question}</p><p className="h-khc-gaprow__meta">{meta}</p>{extra && <p className="h-khc-gaprow__meta">{extra}</p>}</div>
      <span className="h-khc-gaprow__action">{action}</span>
    </div>
  )
}

/* ---------- a guest question: collapsed row, expanded answer + facts ---------- */
export function KhcQuestion({ id, state, question, asked, line, open, onToggle, children }: {
  /** How many guests asked it; left out for a property's standard questions (no message history yet). */
  id: string; state: KhcState; question: string; asked?: number; line?: ReactNode; open?: boolean; onToggle: () => void; children?: ReactNode
}) {
  const askedText = asked === undefined ? null : `asked ${asked} ${asked === 1 ? 'time' : 'times'}`
  return (
    <article className={cx('h-khc-q', open && 'is-open')} data-q={id}>
      <button type="button" className="h-khc-q__head" aria-expanded={!!open} onClick={onToggle}>
        <KhcStateIcon state={state} />
        <span className="h-khc-q__text">
          <span className="h-khc-q__q">{question}</span>
          {askedText && <span className="h-khc-q__asked h-khc-q__asked--under">{askedText}</span>}
          {!open && line && <span className={cx('h-khc-q__line', state !== 'a' && 'is-muted')}>{line}</span>}
        </span>
        <span className="h-khc-q__meta">{askedText && <span className="h-khc-q__asked">{askedText}</span>}{(open || state !== 'a') && <KhcStatePill state={state} />}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} className="h-khc-q__chev" />
      </button>
      {open && <div className="h-khc-q__body">{children}</div>}
    </article>
  )
}
export function KhcQuestions({ children }: { children: ReactNode }) {
  return <div className="h-khc-qs">{children}</div>
}
/** The answer the AI gives now; a sentence only one channel gets carries that channel's name, in plain text. */
export function KhcAnswer({ text, only }: { text: string[]; only?: { channel: ChannelId; text: string } }) {
  return (
    <div className="h-khc-answer">
      {text.map((t) => <p key={t}>{t}</p>)}
      {only && <p className="h-khc-answer__only"><span>{only.text}</span><span className="h-khc-answer__scope">{CHANNELS[only.channel].name} only</span></p>}
    </div>
  )
}
/** A fact behind an answer: label · value · where it's used · edit. Stacks when the column is narrow. */
export function KhcFact({ label, value, sub, scope, action, editor, dataKey }: {
  label: ReactNode; value: ReactNode; sub?: ReactNode; scope?: ReactNode; action?: ReactNode; editor?: ReactNode; dataKey?: string
}) {
  return (
    <div className={cx('h-khc-fact', !!editor && 'is-editing')} data-fact={dataKey}>
      <span className="h-khc-fact__label">{label}</span>
      <span className="h-khc-fact__value">{value}{sub && <small>{sub}</small>}</span>
      <span className="h-khc-fact__scope">{scope}</span>
      <span className="h-khc-fact__action">{action}</span>
      {editor && <div className="h-khc-fact__editor">{editor}</div>}
    </div>
  )
}
export function KhcFacts({ children }: { children: ReactNode }) {
  return <div className="h-khc-facts">{children}</div>
}

/* ---------- side panel (Sources, Gaps): beside the content below the tabs, slides in like a drawer ---------- */
/** Side panel. Phones (≤ 767px): a bottom sheet, full-screen when `wide` (Gaps: a form with its actions in the sheet's footer). */
export function KhcPanel({ title, nav, onClose, foot, children, wide }: { title: ReactNode; nav?: ReactNode; onClose: () => void; foot?: ReactNode; children: ReactNode; wide?: boolean }) {
  const mobile = useIsMobile()
  useEffect(() => {
    if (mobile) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !(e.target as HTMLElement).closest?.('.h-dropdown')) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, mobile])
  if (mobile) return (
    <BottomSheet open title={title} onClose={onClose} footer={foot} fullScreen={wide} label={typeof title === 'string' ? title : undefined}>
      <div className="h-khc-panel__body h-khc-panel__body--sheet">{nav && <div className="h-khc-panel__nav">{nav}</div>}{children}</div>
    </BottomSheet>
  )
  return (
    <aside className={cx('h-khc-panel', wide && 'h-khc-panel--wide')} aria-label={typeof title === 'string' ? title : undefined}>
      <div className="h-khc-panel__head"><h2 className="h-khc-panel__title">{title}</h2>{nav}<CloseButton onClick={onClose} /></div>
      <div className="h-khc-panel__body">{children}</div>
      {foot && <div className="h-khc-panel__foot">{foot}</div>}
    </aside>
  )
}
/** Keeps the last panel mounted while it slides out, so opening and closing both move (~240 ms). */
export function KhcDrawer({ open, children }: { open: boolean; children?: ReactNode }) {
  const last = useRef<ReactNode>(children)
  if (open) last.current = children
  const [prevOpen, setPrevOpen] = useState(open)
  const [leaving, setLeaving] = useState(false)
  if (prevOpen !== open) { setPrevOpen(open); setLeaving(!open) }
  useEffect(() => { if (!leaving) return; const t = setTimeout(() => setLeaving(false), 240); return () => clearTimeout(t) }, [leaving])
  const mobile = useIsMobile()
  const node = open ? children : leaving ? last.current : null
  if (mobile) return open ? <>{children}</> : null // the panel is a bottom sheet (KhcPanel), which animates itself
  return node ? <div className={cx('h-khc-drawer', !open && 'is-leaving')}>{node}</div> : null
}
export function KhcPager({ idx, total, onPrev, onNext }: { idx: number; total: number; onPrev: () => void; onNext: () => void }) {
  return (
    <span className="h-khc-pager">
      {idx} of {total}
      <button type="button" aria-label="Previous gap" onClick={onPrev} disabled={idx <= 1}><Icon name="chevron-left" size={18} /></button>
      <button type="button" aria-label="Next gap" onClick={onNext} disabled={idx >= total}><Icon name="chevron-right" size={18} /></button>
    </span>
  )
}
export function KhcSec({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return <section className="h-khc-sec"><h3 className="h-khc-sec__title">{title}</h3>{sub && <p className="h-khc-sec__sub">{sub}</p>}{children}</section>
}
/** A guest's own words, with the channel it came from. */
export function KhcQuote({ text, channel, when }: { text: string; channel: ChannelId; when: string }) {
  return <figure className="h-khc-quote"><blockquote>“{text}”</blockquote><figcaption><ChannelBadge channel={channel} size="sm" /><span>· {when}</span></figcaption></figure>
}
/** "Where it will be used": one line per reader of the fact, each can be unticked. */
export function KhcUse({ checked, onChange, who, what, disabled }: { checked: boolean; onChange: (v: boolean) => void; who: ReactNode; what: ReactNode; disabled?: boolean }) {
  return (
    <label className={cx('h-khc-use', disabled && 'is-disabled')}>
      <input type="checkbox" className="h-checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="h-khc-use__who">{who}</span><span className="h-khc-use__what">{what}</span>
    </label>
  )
}
export function KhcAiWho() {
  return <span className="h-khc-aiwho"><Icon name="sparkles" size={16} />AI replies</span>
}
export function KhcSource({ icon, name, desc, meta, action }: { icon: string; name: string; desc: string; meta: string; action?: ReactNode }) {
  return (
    <div className="h-khc-source">
      <Icon name={icon} size={18} />
      <div className="h-khc-source__text"><p className="h-khc-source__name">{name}</p><p>{desc}</p><p className="h-khc-source__meta">{meta}</p></div>
      {action}
    </div>
  )
}
export function KhcNote({ children }: { children: ReactNode }) {
  return <p className="h-khc-ainote"><Icon name="sparkles" size={16} />{children}</p>
}
