/* F-A1 frame · owner S10. The connect flow keeps Hostaway's full-page takeover (HS-07…HS-15: logo ⇄ channel header,
 * progress rule, close), "keep Hostaway's existing connect screens; the redesign starts right after authorization".
 * Also: the demo-state catalogue for failure and edge states (S10 prompt §3; S14 owns the full matrix, ST-###).
 * D-130 D-137 · R-080 R-020 */
import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BottomSheet, HostawayMark, Icon, IconSprite, Mark, MobileActionBar, useIsMobile } from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ChannelId } from '../../data/types'
import { useStore } from '../../store/store'
import { isDemoSwitch, useDemoMode } from '../../shell/demoMode'

export const STEPS = ['connect', 'importing', 'second-channel', 'match', 'found', 'go-live', 'done'] as const
export type Step = (typeof STEPS)[number]
export const STEP_LABEL: Record<Step, string> = {
  connect: 'Before you connect', importing: 'Importing', 'second-channel': 'Another channel', match: 'Match listings',
  found: 'What we found', 'go-live': 'Review & go live', done: 'Done',
}

/** Failure and edge states designed in S10 (Gong themes, §3.4). `?demo=<id>` or the picker in the frame. */
export const DEMO_STATES: Array<{ id: string; label: string; gong: string; step: Step | 'needs-you' }> = [
  { id: 'auth-expired', label: 'Booking.com authorization expired mid-import', gong: 'Connection errors', step: 'importing' },
  { id: 'partial-photos', label: '3 Booking.com photos failed to import', gong: 'Sync failures', step: 'importing' },
  { id: 'room-types', label: 'One Airbnb listing ↔ two Booking.com room types', gong: 'Connection errors', step: 'match' },
  { id: 'snoozed', label: 'The Airbnb listing is snoozed on Airbnb', gong: 'Connection errors', step: 'found' },
  { id: 'drift', label: 'Host edited the Airbnb title during import', gong: 'Sync failures', step: 'found' },
  { id: 'pricing-tool', label: 'Prices come from a third-party tool', gong: 'Pricing not syncing', step: 'needs-you' },
  { id: 'bdc-not-writable', label: 'Booking.com property type not writable (multi-room)', gong: 'Sync failures', step: 'go-live' },
  { id: 'go-live-error', label: 'Airbnb rejects the first push (registration number)', gong: 'Connection errors blocking go-live', step: 'go-live' },
]

/** The active demo state: URL wins (?demo=), then the store. */
export function useDemo(): string | null {
  const [q] = useSearchParams()
  const stored = useStore((s) => s.setup.demo)
  const v = q.get('demo')
  return (v && !isDemoSwitch(v) ? v : null) ?? stored // ?demo=1 / ?demo=0 switch demo mode; they aren't states
}

/** Leave a demo state the way the host would (recovery buttons): clears both the URL param and the store. */
export function useClearDemo() {
  const [q, setQ] = useSearchParams()
  const setDemo = useStore((s) => s.setDemo)
  return () => {
    setDemo(null)
    if (q.has('demo') && !isDemoSwitch(q.get('demo'))) { const n = new URLSearchParams(q); n.delete('demo'); setQ(n, { replace: true }) }
  }
}

export function ConnectFrame({ channel, progress, children, wide }: { channel: ChannelId | 'both'; progress: number; children: ReactNode; wide?: boolean }) {
  const chans: ChannelId[] = channel === 'both' ? ['airbnb', 'booking'] : [channel]
  const demoMode = useDemoMode() // the picker is demo chrome: only in demo mode (?demo=1), QA B08
  return (
    <div className="p-flow">
      <IconSprite />
      <header className={`h-connect-head p-flow__head${chans.length > 1 ? ' p-flow__head--both' : ''}`}>
        <span className="h-logo p-flow__logo"><span className="p-flow__mark">{HostawayMark()}</span>hostaway</span>
        <Icon name="arrows-shuffle" size={16} className="p-faint" />
        {chans.map((c) => <span key={c} className="p-row p-flow__ch" style={{ gap: 6 }}><Mark channel={c} /><b className={`p-ch-${CHANNELS[c].letter}`}>{CHANNELS[c].name}</b></span>)}
        <span className="h-connect-head__rule" style={{ ['--value' as string]: `${Math.round(progress * 100)}%` }} />
        {demoMode && <DemoPicker />}
        <Link to="/" className="h-close h-close--lg p-flow__close" aria-label="Close"><Icon name="x" /></Link>
      </header>
      <main className={`p-flow__body${wide ? ' p-flow__body--wide' : ''}`}>{children}</main>
    </div>
  )
}

/** Demo control, clearly labelled, not product UI. Phones: an icon button opening a sheet of the states. */
function DemoPicker() {
  const demo = useDemo()
  const setDemo = useStore((s) => s.setDemo)
  const mobile = useIsMobile()
  const [open, setOpen] = useState(false)
  if (mobile) {
    const pick = (id: string | null) => { setDemo(id); setOpen(false) }
    return (
      <>
        <button type="button" className="h-btn-icon p-flow__demo" aria-label="Demo state" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          <Icon name="adjustments-horizontal" />{demo && <span className="p-flow__demo-dot" aria-hidden="true" />}
        </button>
        <BottomSheet open={open} title="Demo state" onClose={() => setOpen(false)}>
          <p className="h-small h-muted" style={{ margin: '0 0 8px' }}>Show a failure or edge state. Not part of the product.</p>
          <ul className="h-m-menu" role="radiogroup" aria-label="Demo state">
            {[{ id: '', label: 'Happy path', gong: 'Everything works' }, ...DEMO_STATES].map((d) => (
              <li key={d.id}><button type="button" role="radio" aria-checked={(demo ?? '') === d.id} className="h-m-menu__item h-m-menu__item--stack p-flow__demo-item" onClick={() => pick(d.id || null)}>
                <b>{d.label}</b><span className="h-m-menu__sub">{d.gong}</span>
              </button></li>
            ))}
          </ul>
        </BottomSheet>
      </>
    )
  }
  return (
    <label className="p-demo" title="Demo control: show a failure or edge state">
      <span>Demo state</span>
      <select className="h-select" value={demo ?? ''} onChange={(e) => setDemo(e.target.value || null)} aria-label="Demo state">
        <option value="">Happy path</option>
        {DEMO_STATES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
      </select>
    </label>
  )
}

/** Step dots under the header (where you are in F-A1). */
export function StepTrail({ current }: { current: Step }) {
  const i = STEPS.indexOf(current)
  return (
    <>
      <ol className="p-trail" aria-label="Setup steps">
        {STEPS.map((s, j) => (
          <li key={s} className={j < i ? 'is-done' : j === i ? 'is-current' : ''} aria-current={j === i ? 'step' : undefined}>{STEP_LABEL[s]}</li>
        ))}
      </ol>
      {/* phones: one line instead of the 7-item row (the head's rule already shows progress) */}
      <p className="p-trail-m">Step {i + 1} of {STEPS.length} · <b>{STEP_LABEL[current]}</b></p>
    </>
  )
}

/** The step's actions. Desktop: a row under the content. Phones: `note` stays in the content and the buttons move
 *  into a sticky bottom bar sized for thumbs (ds/mobile.md §6); `mobile` replaces the buttons there when given. */
export function FlowActions({ children, note, mobile }: { children: ReactNode; note?: ReactNode; mobile?: ReactNode }) {
  const isMobile = useIsMobile()
  if (isMobile) return (
    <>
      {note && <p className="h-small h-muted p-flow__note">{note}</p>}
      <MobileActionBar>{mobile ?? children}</MobileActionBar>
    </>
  )
  return <div className="p-row p-mt6">{children}{note && <span className="h-small h-muted">{note}</span>}</div>
}
