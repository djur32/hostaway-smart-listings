/* Knowledge Hub iteration KH-E · Base and channel lens (concepts/knowledge-hub/KH-E.md, Paper row 5 on page KH).
 * One form per content type. A lens under the tab bar (Base · Airbnb · Booking.com · Direct) shows the master values or
 * exactly what one channel receives; "Show only differences" reduces the tab to what differs. The lens is a comparison
 * over one shared Base, never navigation: every lens edits the same record (Base values or per-channel overrides), Base
 * is the default on every visit and the lens is never persisted. Ask · Sources share one right drawer. "+ Add" sits in
 * the tab bar's corner, pre-scoped to the tab and the lens. Edits wait for the tab's Save (sl3Base / sl3Custom).
 * URL states: ?v=e&tab=<id>&lens=airbnb|booking|direct&diff=1 · &hover=<key> · &drawer=ask|sources · &add=1 */
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, DiffToggle, KheBody, KheTabBar, LensControl, PageHead, type DrawerTab } from '../../../ds'
import type { KhSectionId } from '../../../data/v3-kh'
import { useProperty } from '../../../shell/PropertyLayout'
import { useStore } from '../../../store/store'
import { useHubDraft } from '../model'
import { HubVariantPicker } from '../switch'
import { useListingChannels } from '../perProperty'
import { AddButton, Composer, type Adding } from './E/Add'
import { AmenitiesTab } from './E/Amenities'
import { Drawer } from './E/Drawer'
import { FieldsTab, tabItems } from './E/Fields'
import { PhotosTab, PoliciesTab } from './E/Other'
import { MAIN_TABS, MORE_TABS, TAB_LABEL, isLens, isTab, sourcesFor, type ESource, type Lens } from './E/data'
import { NAME, amenityDiffers, amenityGroups, rowFor } from './E/lens'
import type { LensCtx } from './E/ctx'

export function HubE() {
  const p = useProperty()
  const [q, setQ] = useSearchParams()
  const set = (patch: Record<string, string | null>) => setQ((prev) => {
    const n = new URLSearchParams(prev)
    for (const [k, v] of Object.entries(patch)) { if (v === null) n.delete(k); else n.set(k, v) }
    return n
  }, { replace: true })

  const tab: KhSectionId = isTab(q.get('tab')) ? (q.get('tab') as KhSectionId) : 'property'
  const channels = useListingChannels()
  const lensQ = q.get('lens')
  // Base is always the default; the lens is never stored. A channel the property doesn't have falls back to Base.
  const lens: Lens = isLens(lensQ) && (lensQ === 'base' || channels.includes(lensQ)) ? lensQ : 'base'
  const diff = q.get('diff') === '1'
  const drawerQ = q.get('drawer')
  const drawer: DrawerTab | null = drawerQ === 'ask' || drawerQ === 'sources' ? drawerQ : null

  const d = useHubDraft(`e:${tab}`)
  const storeBase = useStore((s) => s.sl3.base)
  const storeCustom = useStore((s) => s.sl3.custom)
  const [sources, setSources] = useState<ESource[]>(() => sourcesFor(p.id))
  const [adding, setAdding] = useState<Adding | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)

  // the lens and "only differences" start fresh for each property
  const [pid, setPid] = useState(p.id)
  if (pid !== p.id) { setPid(p.id); setAdding(null); setSources(sourcesFor(p.id)) }
  useEffect(() => { if (pid !== p.id) set({ lens: null, diff: null }) }, [p.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const ctx: LensCtx = {
    d, tab, lens, diff, hover: q.get('hover'), base: `/property/${p.id}`, storeBase, storeCustom, channels,
    addFact: () => { setAdding({ type: 'fact', scope: 'base' }); set({ tab: 'custom' }) },
    setLens: (l, key) => { set({ lens: l === 'base' ? null : l, hover: null }); if (key) setFocusKey(key) },
    setDiff: (on) => set({ diff: on ? '1' : null }),
  }

  // "Edit in the Base" / "Open in the Airbnb lens": bring that field into view under the new lens
  useEffect(() => {
    if (!focusKey) return
    const t = setTimeout(() => { document.querySelector(`[data-khe-key="${CSS.escape(focusKey)}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); setFocusKey(null) }, 60)
    return () => clearTimeout(t)
  }, [focusKey, lens])
  // ?hover=<key>: the field with its hover card open, in view
  const hoverKey = q.get('hover')
  useEffect(() => {
    if (!hoverKey) return
    const t = setTimeout(() => document.querySelector(`[data-khe-key="${CSS.escape(hoverKey)}"]`)?.scrollIntoView({ block: 'start' }), 200)
    return () => clearTimeout(t)
  }, [hoverKey, tab])

  /* "N of M differ on Airbnb" beside the toggle */
  const count = useMemo(() => {
    if (tab === 'amenities') {
      const all = amenityGroups(d).flatMap((g) => g.items)
      const n = all.filter((a) => amenityDiffers(a, lens, d, channels)).length
      return `${n} of ${all.length} differ${lens === 'base' ? ' by channel' : ` on ${NAME(lens)}`}`
    }
    if (tab === 'photos' || tab === 'policies') return undefined
    const rows = tabItems(ctx).map((i) => rowFor(i, lens, d)).filter((r) => r.kind !== 'absent')
    return `${rows.filter((r) => r.differs).length} of ${rows.length} differ${lens === 'base' ? ' by channel' : ` on ${NAME(lens)}`}`
  }, [tab, lens, d, storeBase, storeCustom, channels]) // eslint-disable-line react-hooks/exhaustive-deps

  const pickTab = (id: string) => { setAdding(null); set({ tab: id, hover: null, add: null }) }
  const toggleDrawer = (t: DrawerTab) => set({ drawer: drawer === t ? null : t })
  const composer = adding && (tab === ADD_TAB[adding.type])
    ? <Composer key={`${adding.type}:${adding.scope}`} adding={adding} lens={lens} d={d} onDone={() => setAdding(null)} onScope={(s) => setAdding({ ...adding, scope: s })} />
    : undefined

  const main = tab === 'amenities' ? <AmenitiesTab ctx={ctx} composer={composer} />
    : tab === 'photos' ? <PhotosTab ctx={ctx} />
    : tab === 'policies' ? <PoliciesTab ctx={ctx} />
    : <FieldsTab ctx={ctx} composer={composer} />

  return (
    <div className="khe">
      <div className="khe-head">
        <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
        <div className="khe-lead">
          <p className="khe-lead__text">Everything about this property in one place. Your channels start from it and your AI replies read it.</p>
          <span className="khe-lead__actions">
            <Button icon="sparkles" aria-pressed={drawer === 'ask'} onClick={() => toggleDrawer('ask')}>Ask the AI</Button>
            <Button icon="file-text" aria-pressed={drawer === 'sources'} onClick={() => toggleDrawer('sources')}>Sources · {sources.length}</Button>
          </span>
        </div>
        <KheTabBar active={tab} onSelect={pickTab}
          tabs={MAIN_TABS.map((id) => ({ id, label: TAB_LABEL[id] }))} more={MORE_TABS.map((id) => ({ id, label: TAB_LABEL[id] }))}
          right={<AddButton key={`${tab}:${lens}`} tab={tab} lens={lens} defaultOpen={q.get('add') === '1'}
            onPick={(a, t) => { set({ add: null, ...(t.tab !== tab ? { tab: t.tab, hover: null } : {}) }); setAdding(a) }} />} />
        <div className="khe-lensrow">
          <LensControl value={lens} channels={channels} onChange={(l) => ctx.setLens(l as Lens)} />
          <span className="khe-lensrow__rule" aria-hidden="true" />
          <DiffToggle on={diff} onChange={ctx.setDiff} count={count} />
        </div>
      </div>
      <KheBody main={main} sheetTitle={drawer === 'sources' ? 'Sources' : 'Ask the AI'} onClose={() => set({ drawer: null })} drawer={drawer ? (
        <Drawer tab={drawer} onTab={(t) => set({ drawer: t })} onClose={() => set({ drawer: null })} lens={lens} d={d}
          sources={sources} setSources={setSources} onAddFact={ctx.addFact} />
      ) : undefined} />
    </div>
  )
}

const ADD_TAB: Record<Adding['type'], KhSectionId> = { task: 'arrival', arrival: 'arrival', resource: 'arrival', property: 'property', place: 'location', amenity: 'amenities', rule: 'rules', fee: 'pricing', fact: 'custom' }
