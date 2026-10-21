/* Knowledge Hub, reframed · the page frame every Hub page shares: KhrFrame (title + Concept chip + property switcher,
 * an optional tab row, the Split body) plus the Hub's own actions — Test (the faithful "Ask the AI" preview) and Tips
 * (the docked right-hand panel, the one tips container). Desktop: at the right end of the tab row, or before the
 * property switcher on a page with no tabs. Phones: next to the title (`.ch-tips-m`, as on Listing).
 * URL states, the same as Listing's: ?tips=1 (panel open) · ?tip=<id> (open on that tip). */
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, KhrFrame, TipsToggle, useIsMobile } from '../../../../ds'
import { useExclusivePanel } from '../../../../ds/panelSlot'
import { useProperty } from '../../../../shell/PropertyLayout'
import type { KQ } from './model'
import { HubTips } from './Tips'
import { TestDrawer } from './Test'

/** `owner`: the one caller that claims the exclusive side-panel slot (HubFrame); every other caller only reads/writes the URL. */
export function useTipsParam(owner = false) {
  const [params, setParams] = useSearchParams()
  const open = params.has('tips') || params.has('tip')
  const focusId = params.get('tip')
  const edit = (fn: (n: URLSearchParams) => void) => setParams((prev) => { const n = new URLSearchParams(prev); fn(n); return n }, { replace: true })
  const openTip = (id: string) => edit((n) => { n.delete('tips'); n.set('tip', id) })
  const close = () => edit((n) => { n.delete('tips'); n.delete('tip') })
  const toggle = () => (open ? close() : edit((n) => n.set('tips', '1')))
  useExclusivePanel('tips', owner && open, close)
  /** "?tip=…" to carry the open panel along a link */
  const keep = () => { const n = new URLSearchParams(); if (params.get('tip')) n.set('tip', params.get('tip')!); else if (params.has('tips')) n.set('tips', '1'); const s = n.toString(); return s ? `?${s}` : '' }
  return { open, focusId, openTip, close, toggle, keep }
}

export function HubFrame({ kq, title, desc, lead, back, tabs, test, tips = true, add, children }: {
  kq: KQ; title: ReactNode; desc?: ReactNode; back?: { to: string; label: string }
  /** the page's count heading ("48 questions"); the actions sit at its right end (review, 4 Oct) */
  lead?: ReactNode
  /** the page's tabs (QueryTabs); the actions never sit in the tab row */
  tabs?: ReactNode
  /** show Test (the faithful "Ask the AI" preview) */
  test?: boolean
  /** show the Tips button */
  tips?: boolean
  /** the page's primary button: Add question, Add a fact */
  add?: ReactNode
  children: ReactNode
}) {
  const p = useProperty()
  const tp = useTipsParam(true)
  const [testing, setTesting] = useState(false)
  const pending = kq.tips.filter((t) => t.status === 'open').length
  const showTips = tips && (pending > 0 || tp.open)
  const testBtn = test ? <Button onClick={() => setTesting(true)}>Test</Button> : null
  const tipsBtn = showTips ? <TipsToggle count={pending} open={tp.open} onToggle={tp.toggle} /> : null
  const mobile = useIsMobile()
  const has = !!(testBtn || tipsBtn || add)
  // phones (review, 4 Oct): the actions on their own line under the title, never in the tab row
  const mActions = has ? <div className="h-kq-mactions">{testBtn}{tipsBtn}{add}</div> : undefined
  // desktop (review, 4 Oct): Test · Tips · the primary Add at the top level, one line: at the right of the count
  // heading when the page has one, else of the description, else before the property switcher. Never in the tab row.
  const actions = has ? <span className="h-kq-actions">{testBtn}{tipsBtn}{add}</span> : null
  const at = mobile || !has ? 'none' : lead ? 'lead' : desc ? 'desc' : 'head'
  const row = tabs ? <div className="ch-tabrow">{tabs}</div> : undefined
  return (
    <KhrFrame title={title} property={p} back={back} desc={desc} tabs={row} descAction={at === 'desc' ? actions : undefined}
      right={mobile ? mActions : at === 'head' ? actions : undefined}
      panel={tp.open ? <HubTips kq={kq} focusId={tp.focusId} onClose={tp.close} /> : undefined}>
      {lead && <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">{lead}</h2>{at === 'lead' && actions}</div>}
      {children}
      {test && <TestDrawer kq={kq} open={testing} onClose={() => setTesting(false)} />}
    </KhrFrame>
  )
}
