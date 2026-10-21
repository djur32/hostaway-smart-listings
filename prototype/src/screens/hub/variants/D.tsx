/* Knowledge Hub iteration KH-D · "Overview cards → sheet" (concepts/knowledge-hub/KH-D.md; Paper "Hostaway v2" › KH, row 4).
 * The first tab is an Overview: Sources and Ask the AI as two slim cards, then one card per category (two key values,
 * per-channel coverage, what's missing, "+ Add …") and a dashed "Add anything" card. A card, or a category tab, opens
 * that category in a right side sheet over the dimmed Overview; Save writes through sl3Base / sl3Custom.
 * URL states: ?v=d · &sheet=<category>|amenities|pricing|ask|sources|add · &split=<key> · &row=<amenity> · &filter=some ·
 * &add=1 (focus the add box) · &text=<pre-typed> · &q=<question>&ch=<channel> (Ask the AI). */
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon, KhToast, KhdAddAnyCard, KhdCard, KhdCoverage, KhdLegend, KhdTabs, KhdTopCard, PageHead } from '../../../ds'
import { photoUrl } from '../../../data/v3-cv'
import { channelPhotos } from '../../../data/photos'
import { PageBody, useProperty } from '../../../shell/PropertyLayout'
import { useStore } from '../../../store/store'
import { useHubUi } from '../state'
import { useHubPid, useIsScenario, useListingChannels } from '../perProperty'
import { HubVariantPicker } from '../switch'
import { CATS, TAB_MAIN, TAB_MORE, catById, liveDraft, sourcesFor, suggestedFor, summarise, type CatId } from './D/model'
import {
  AddAnythingSheet, AmenitiesSheet, AskSheet, CategorySheet, CustomSheet, PhotosSheet, PoliciesSheet, PricingSheet, SourcesSheet, type SheetNav,
} from './D/sheets'

const SHEET_PARAMS = ['sheet', 'split', 'row', 'filter', 'add', 'text', 'q', 'ch']

export function HubD() {
  const p = useProperty()
  const [q, setQ] = useSearchParams()
  const base = `/property/${p.id}`
  const sheet = q.get('sheet')

  const storeBase = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const tips = useStore((s) => s.sl3.tips)
  const lib = useStore((s) => s.photoLib)
  const added = useHubUi((s) => s.added)
  const resolved = useHubUi((s) => s.resolved)
  // multi-property: this property's channels, scripted content only on the scenario one (the Hub remounts on a switch)
  const pid = useHubPid()
  const scenario = useIsScenario()
  const chs = useListingChannels()
  const live = useMemo(() => liveDraft(storeBase, custom), [storeBase, custom])
  const summary = useMemo(() => {
    const desk = channelPhotos('airbnb', lib, { tips, custom }).shown.indexOf('desk')
    const perChannel = Object.fromEntries(chs.map((c) => { const shown = channelPhotos(c, lib, { tips, custom }).shown; return [c, { shown, cover: lib.meta[shown[0]]?.description ?? '' }] }))
    return summarise({ pid, live, custom, facts: added, resolved, photos: { keys: lib.base, urls: lib.base.map(photoUrl), deskOnAirbnb: desk, perChannel } })
  }, [pid, chs, live, custom, tips, lib, added, resolved])
  const needLook = summary.filter((s) => s.missing.length).length

  const [extras, setExtras] = useState<string[]>([])
  const [sources, setSources] = useState(() => sourcesFor(pid))
  const [ask, setAsk] = useState('')
  const [toast, setToast] = useState<{ text: string; cat?: CatId } | null>(null)
  const closeToast = useCallback(() => setToast(null), [])
  const latest = sources[sources.length - 1]

  const nav: SheetNav = {
    base, q,
    open: (s, extra = {}) => { const n = new URLSearchParams(q); SHEET_PARAMS.forEach((k) => n.delete(k)); n.set('sheet', s); Object.entries(extra).forEach(([k, v]) => v && n.set(k, v)); setQ(n, { replace: true }) },
    close: () => { const n = new URLSearchParams(q); SHEET_PARAMS.forEach((k) => n.delete(k)); setQ(n, { replace: true }) },
  }
  const activeTab = sheet && catById(sheet) ? sheet : 'overview'
  const tab = (id: CatId) => ({ id, label: catById(id)!.label })

  const renderSheet = () => {
    if (!sheet) return null
    if (sheet === 'ask') return <AskSheet key={`ask-${q.get('q')}`} nav={nav} live={live} />
    if (sheet === 'sources') return <SourcesSheet nav={nav} sources={sources} onAdd={(s) => setSources((xs) => [...xs, s])} />
    if (sheet === 'add') return <AddAnythingSheet nav={nav} onSaved={(cat, label) => { nav.close(); setToast({ text: `“${label}” saved to ${catById(cat)!.label}. Your AI replies use it right away.`, cat }) }} />
    const def = catById(sheet)
    if (!def) return null
    switch (def.sheet) {
      case 'photos': return <PhotosSheet nav={nav} />
      case 'amenities': return <AmenitiesSheet nav={nav} />
      case 'pa': return <PricingSheet key={def.id} nav={nav} focus={def.id === 'availability' ? 'availability' : undefined} extras={extras} setExtras={setExtras} />
      case 'policies': return <PoliciesSheet nav={nav} />
      case 'custom': return <CustomSheet nav={nav} />
      default: return <CategorySheet key={def.id} cat={def.id} nav={nav} />
    }
  }

  return (
    <PageBody>
      <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
      <p className="h-khd-lead">Everything about this property in one place. Your channels start from it and your AI replies read it.</p>
      <KhdTabs active={activeTab} items={[{ id: 'overview', label: 'Overview' }, ...TAB_MAIN.map(tab)]} more={TAB_MORE.map(tab)}
        onSelect={(id) => (id === 'overview' ? nav.close() : nav.open(id))} />

      <div className="h-khd-toprow">
        <KhdTopCard icon="stack-2" title="Sources" count={sources.length} onOpen={() => nav.open('sources')}>
          <p className="h-khd-top__line">{scenario ? 'Latest: message history, today' : latest?.when === 'Added today' ? `Latest: ${latest.name}, today` : 'Imported from your listings when you connected'}</p>
          <div className="h-khd-srcrow">
            {sources.slice(0, 5).map((s) => <span key={s.name} className="h-khd-srcdot" title={s.name}><Icon name={s.icon} /></span>)}
            <button type="button" className="h-textlink h-khd-add" onClick={() => nav.open('sources', { add: '1' })}><Icon name="plus" />Add source</button>
          </div>
        </KhdTopCard>
        <KhdTopCard icon="sparkles" ai title="Ask the AI" sub="Test what a guest would hear">
          <form className="h-khd-askinput" onSubmit={(e) => { e.preventDefault(); if (ask.trim()) nav.open('ask', { q: ask.trim() }) }}>
            <input className="h-input" value={ask} placeholder="Ask a question a guest might ask…" aria-label="Ask the AI a guest’s question" onChange={(e) => setAsk(e.target.value)} />
            <button type="submit" className="h-btn-icon" aria-label="Ask"><Icon name="send" /></button>
          </form>
          <div className="h-khd-chips">{suggestedFor(pid).map((s) => <button key={s} type="button" className="h-khd-chip" onClick={() => nav.open('ask', { q: s })}>{s}</button>)}</div>
        </KhdTopCard>
      </div>

      <div className="h-khd-countline">
        <b>{CATS.length} categories</b><span className="h-khd-countline__dot">·</span><span>{needLook ? `${needLook} need a look` : 'Nothing needs a look'}</span>
        <KhdLegend channel={chs[0]} />
      </div>
      <div className="h-khd-grid">
        {summary.map((s) => {
          const addText = s.cat.id === 'location' && s.missing.length ? 'Parking' : ''
          return (
            <KhdCard key={s.cat.id} icon={s.cat.icon} title={s.cat.label} count={`${s.count} ${s.count === 1 ? s.cat.unit[0] : s.cat.unit[1]}`}
              active={sheet === s.cat.id} onOpen={() => nav.open(s.cat.id)} addLabel={s.cat.add} onAdd={() => nav.open(s.cat.id, { add: '1', text: addText })}
              coverage={chs.map((c) => <KhdCoverage key={c} channel={c} count={s.own[c].length} title={s.hoverTitle} detail={s.own[c].join(' · ') || undefined} />)}
              caption={s.caption} missing={s.missing}>
              {s.photos ? (
                <div className="h-khd-thumbs">{s.photos.map((u) => <img key={u} src={u} alt="" />)}{!!s.morePhotos && <span className="h-khd-thumbs__more">+{s.morePhotos}</span>}</div>
              ) : <><span className="h-khd-card__v1">{s.v1}</span><span className="h-khd-card__v2">{s.v2}</span></>}
            </KhdCard>
          )
        })}
        <KhdAddAnyCard onClick={() => nav.open('add')} />
      </div>

      {renderSheet()}
      {toast && (
        <KhToast onDone={closeToast}>{toast.text}{toast.cat && <button type="button" className="h-toast__action" onClick={() => { const c = toast.cat!; setToast(null); nav.open(c) }}>Open {catById(toast.cat)!.label}</button>}</KhToast>
      )}
    </PageBody>
  )
}
