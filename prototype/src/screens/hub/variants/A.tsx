/* Knowledge Hub iteration KH-A · Channel matrix (concepts/knowledge-hub/KH-A.md, Paper row 1 on page KH). Owned by the KH-A build.
 * Tabs are content types; each tab is a table of items × Base · Airbnb · Booking.com · Direct. Every edit goes through
 * the store (sl3Base / sl3Custom, the same keys the channel screens read). Sources and Ask the AI open one side panel.
 * URL states: ?v=a&tab=<id> · &cell=<key>:<base|airbnb|booking|direct> · &panel=ask|sources · &ask=<question id> ·
 * &ch=<channel> · &add=1 (Amenities add row, "Smart TV") · &tip=<key>:<channel> (a "-" or lock tip open). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, KhaLegend, KhaNone, KhaQuiet, KhaSplit, KhaTabs, KhaToolbar, Icon, PageHead, useIsMobile } from '../../../ds'
import type { ListingChannel } from '../../../data/sl3'
import { useProperty } from '../../../shell/PropertyLayout'
import { useStore } from '../../../store/store'
import { scopeOf, useHubDraft } from '../model'
import { useHubItems, useHubPid, useIsScenario, useListingChannels } from '../perProperty'
import { HubVariantPicker } from '../switch'
import { Amenities } from './A/Amenities'
import { ItemMatrix, type Ctx } from './A/Matrix'
import {
  TABS, TAB_GROUPS, amenityDefs, amenityKey, amenityView, answer, cellId, cellOf, firstQuestion, isTab, sourcesFor, tabOfKey, useKhaAdded,
  type Fact, type Lookup, type TabId,
} from './A/model'
import { Facts, Photos, Policies } from './A/Other'
import { HubAPanel, type PanelTab } from './A/Panel'

export function HubA() {
  const p = useProperty()
  const [q, setQ] = useSearchParams()
  const set = useCallback((patch: Record<string, string | null>) => setQ((prev) => {
    const n = new URLSearchParams(prev)
    for (const [k, v] of Object.entries(patch)) { if (v == null) n.delete(k); else n.set(k, v) }
    return n
  }, { replace: true }), [setQ])

  const tab: TabId = isTab(q.get('tab')) ? (q.get('tab') as TabId) : 'property'
  const panelQ = q.get('panel')
  const panel: PanelTab | null = panelQ === 'ask' || panelQ === 'sources' ? panelQ : null
  const lastPanel = useRef<PanelTab>(panel ?? 'ask')
  if (panel) lastPanel.current = panel
  const pid = useHubPid()
  const scenario = useIsScenario()
  const CHS = useListingChannels()
  const chQ = q.get('ch') as ListingChannel | null
  const ch: ListingChannel = chQ && CHS.includes(chQ) ? chQ : CHS[0] ?? 'airbnb'
  const askQ = q.get('ask')
  const qid = askQ === 'none' ? null : askQ ?? firstQuestion(pid)

  const mobile = useIsMobile()
  const d = useHubDraft('kh-a')
  const items = useHubItems()
  const base = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const added = useKhaAdded((s) => s.added)

  /* Ask the AI: live values as a guest on a channel sees them */
  const look: Lookup = useCallback((key, c) => {
    if (key.startsWith('amenity:')) {
      const def = [...amenityDefs(pid), ...added].find((x) => amenityKey(x) === key)
      if (!def) return { label: key.slice(8), text: 'Not listed', state: 'amenity', on: false }
      const v = amenityView(def, base, custom)
      return { label: def.label, text: v.on[c] === true ? 'Listed' : 'Not listed', state: 'amenity', on: v.on[c] === true, why: v.base }
    }
    const item = items.find((i) => i.key === key)
    if (!item) return { label: key, text: '-', state: 'na', raw: '' }
    const s = scopeOf(item, d)
    const cv = cellOf(item, s, c)
    const raw = s.own.find((o) => o.c === c)?.value ?? s.set.find((x) => x.c === c)?.value ?? (s.on.includes(c) ? s.base : '')
    return { label: item.label, text: cv.text, state: cv.state, raw }
  }, [pid, added, base, custom, items, d])
  const ans = useMemo(() => (qid ? answer(qid, ch, look) : null), [qid, ch, look])
  const nSources = sourcesFor(pid).length
  const cited = useMemo(() => {
    const m: Record<string, number> = {}
    if (panel === 'ask' && ans) for (const f of ans.facts) m[cellId(f.key, f.col)] = f.n
    return m
  }, [panel, ans])

  /* scroll to and pulse a cited cell */
  const [flash, setFlash] = useState<string | null>(null)
  useEffect(() => {
    if (!flash) return
    const r = requestAnimationFrame(() => document.querySelector(`[data-kha-cell="${CSS.escape(flash)}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
    const t = setTimeout(() => setFlash(null), 1600)
    return () => { cancelAnimationFrame(r); clearTimeout(t) }
  }, [flash, tab])
  /* phones: a cited fact closes the Ask sheet, so the value it points at is visible (ds/mobile.md §7: never nest sheets) */
  const goFact = (f: Fact) => { set({ tab: tabOfKey(f.key), cell: null, add: null, tip: null, ...(mobile ? { panel: null } : {}) }); setFlash(cellId(f.key, f.col)) }
  const fixFact = (f: Fact) => {
    if (f.state === 'amenity') return goFact(f)
    const col = f.state === 'inherit' || f.state === 'own' ? f.col : 'base'
    set({ tab: tabOfKey(f.key), cell: cellId(f.key, col), add: null, tip: null, ...(mobile ? { panel: null } : {}) })
    setTimeout(() => document.querySelector(`[data-kha-cell="${CSS.escape(cellId(f.key, col))}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60)
  }

  const ctx: Ctx = { d, items, open: q.get('cell'), setOpen: (id) => set({ cell: id }), cited, flash, tip: q.get('tip') }
  const narrow = !!panel && !mobile
  const groups = TAB_GROUPS[tab]
  const legend = narrow ? undefined : (
    <KhaLegend items={[
      { sample: <KhaQuiet>Aa</KhaQuiet>, label: 'Uses the Base' },
      { sample: <span className="kha-legend__own">Aa</span>, label: 'Own value' },
      { sample: <KhaNone />, label: 'Not on that channel' },
      { sample: <Icon name="lock" size={16} />, label: 'Set by the channel' },
    ]} />
  )
  const main = (
    <div className="kha-main" key={tab}>
      {tab === 'amenities' ? <Amenities cited={cited} flash={flash} tip={q.get('tip')} addOpen={q.get('add') === '1'} prefill={scenario ? 'Smart TV' : ''} narrow={narrow} />
        : tab === 'photos' ? <Photos base={`/property/${p.id}`} narrow={narrow} />
        : tab === 'policies' ? <Policies ctx={ctx} base={`/property/${p.id}`} />
        : tab === 'facts' ? <Facts ctx={ctx} />
        : groups ? <><KhaToolbar left={<span className="kha-hint">{mobile ? 'Tap a value to edit it.' : 'Select a cell to edit it.'}</span>} right={legend} /><ItemMatrix tab={tab} groups={groups} ctx={ctx} /></>
        : null}
    </div>
  )
  const togglePanel = (t: PanelTab) => set({ panel: panel === t ? null : t })

  return (
    <div className="kha">
      <div className="kha__head">
        <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
        <div className="kha-lead">
          <p>Everything about this property, in one place. Channels start from it; your AI reads it.</p>
          <span className="kha-lead__actions">
            <Button icon="stack-2" className="kha-headbtn" aria-pressed={panel === 'sources'} onClick={() => togglePanel('sources')}>Sources · {nSources}</Button>
            <Button icon="sparkles" className="kha-headbtn" aria-pressed={panel === 'ask'} onClick={() => togglePanel('ask')}>Ask the AI</Button>
          </span>
        </div>
        <KhaTabs items={TABS} active={tab} onSelect={(t) => set({ tab: t, cell: null, add: null, tip: null })} />
      </div>
      <KhaSplit open={!!panel} main={main} sheetTitle={(panel ?? lastPanel.current) === 'sources' ? 'Sources' : 'Ask the AI'} onClose={() => set({ panel: null })} panel={
        <HubAPanel tab={panel ?? lastPanel.current} setTab={(t) => set({ panel: t })} onClose={() => set({ panel: null })}
          ch={ch} setCh={(c) => set({ ch: c })} qid={qid} setQid={(id) => set({ ask: id ?? 'none' })} ans={ans} onFact={goFact} onFix={fixFact} />
      } />
    </div>
  )
}
