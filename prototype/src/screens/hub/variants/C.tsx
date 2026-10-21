/* Knowledge Hub iteration KH-C · Guest questions first (concepts/knowledge-hub/KH-C.md, Paper page KH row 3).
 * The Hub organised by what guests ask: journey tabs (with open gaps counted), the ask box above every tab, each question
 * with the AI's answer, its coverage and the facts behind it. Sources and Gaps are slim controls that open a side panel;
 * adding knowledge starts from a gap. Everything A–Z keeps every fact reachable.
 * URL states: ?v=c · &tab=overview|before|pricing|arrival|stay|checkout|area|az · &q=<questionId> (expanded) ·
 * &gap=<gapId> (Gaps panel) · &sources=1 · &as=airbnb|booking|direct · &ask=<text> · &filter=answered|gaps ·
 * &group=<A–Z group> · &edit=<questionId>:<factKey> (a fact open for editing). */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { KhToast, KhcAnswer, KhcAsk, KhcAskResult, KhcControl, KhcDrawer, KhcProv, KhcTabs, PageHead, cx } from '../../../ds'
import { isListingChannel, type ListingChannel } from '../../../data/sl3'
import { isKhSection, type KhSectionId } from '../../../data/v3-kh'
import { useProperty } from '../../../shell/PropertyLayout'
import { HubVariantPicker } from '../switch'
import { EverythingAZ } from './C/AZ'
import { TABS, isTab, type Question, type StageId, type TabId } from './C/data'
import { answerOf, useHub, type Hub } from './C/model'
import { AzCard, Overview } from './C/Overview'
import { GapsPanel, SourcesPanel, firstGap } from './C/Panels'
import { StageQuestions, asGuest, type Filter } from './C/Questions'

/* ---------- the ask box: canned answers, matched on the words a guest might use ---------- */
const STOP = new Set('a an the is are there i we my our me you your can could do does to of in on for at it and or be any what where when how which who will would with from get have has this that please'.split(' '))
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).map((w) => w.replace(/s$/, '')).filter((w) => w.length > 1 && !STOP.has(w))
function match(text: string, hub: Hub): Question | undefined {
  const ask = words(text)
  if (!ask.length) return undefined
  let best: Question | undefined; let score = 0
  for (const q of hub.questions) {
    const bag = new Set(words(`${q.q} ${q.kw ?? ''}`))
    const s = ask.filter((w) => bag.has(w)).length / ask.length
    if (s > score || (s === score && best && (q.asked ?? 0) > (best.asked ?? 0))) { best = q; score = s }
  }
  return score >= 0.34 ? best : undefined
}

export function HubC() {
  const p = useProperty()
  const base = `/property/${p.id}`
  const [q, setQ] = useSearchParams()
  const hub = useHub()
  const set = useCallback((patch: Record<string, string | null>) => {
    setQ((cur) => { const n = new URLSearchParams(cur); for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k) } return n }, { replace: true })
  }, [setQ])

  const tabParam = q.get('tab')
  const tab: TabId = isTab(tabParam) ? tabParam : 'overview'
  const asParam = q.get('as') ?? ''
  // the property's channels only: "Answer as" never offers one it isn't listed on (Charlottenburg: Booking.com only)
  const chs = hub.chs
  const first: ListingChannel = chs[0] ?? 'airbnb'
  const channel: ListingChannel = isListingChannel(asParam) && chs.includes(asParam) ? asParam : first
  const groupParam = q.get('group') ?? ''
  const group: KhSectionId = isKhSection(groupParam) ? groupParam : 'property'
  const filterParam = q.get('filter')
  const filter: Filter = filterParam === 'answered' || filterParam === 'gaps' ? filterParam : 'all'
  const gapParam = q.get('gap')
  const panel = gapParam ? 'gaps' : q.get('sources') === '1' ? 'sources' : null
  const asked = q.get('ask') ?? ''
  const [draft, setDraft] = useState(asked)
  const [toast, setToast] = useState<string | null>(null)
  const closeToast = useCallback(() => setToast(null), [])
  const main = useRef<HTMLDivElement>(null)

  const counts = Object.fromEntries(TABS.map((t) => [t.id, hub.gaps.filter((g) => hub.question(g.question)!.stage === t.id).length]))
  const goTab = (t: TabId, extra: Record<string, string | null> = {}) => { set({ tab: t === 'overview' ? null : t, q: null, edit: null, filter: null, ...extra }); main.current?.scrollTo({ top: 0 }) }
  const openGap = (id: string | null) => set({ gap: id, sources: null })
  const toggleGaps = () => (panel === 'gaps' ? openGap(null) : openGap(firstGap(hub)))
  const toggleSources = () => set({ sources: panel === 'sources' ? null : '1', gap: null })

  /* a question opened from the URL, the ask box or the Overview scrolls into view */
  const openQ = q.get('q')
  useEffect(() => {
    if (!openQ) return
    const t = setTimeout(() => {
      const m = main.current; const el = m?.querySelector(`[data-q="${openQ}"]`)
      if (!m || !el) return
      const top = el.getBoundingClientRect().top - m.getBoundingClientRect().top
      if (top > m.clientHeight * 0.5 || top < 0) m.scrollTo({ top: m.scrollTop + top - 12, behavior: 'smooth' })
    }, 60)
    return () => clearTimeout(t)
  }, [openQ, tab])

  const matched = asked ? match(asked, hub) : undefined
  const askResult = asked ? (
    <KhcAskResult onClose={() => { set({ ask: null }); setDraft('') }}
      title={matched ? matched.q : 'Nothing in the Hub answers this yet'}
      meta={matched ? `${matched.asked !== undefined ? `asked ${matched.asked} times` : 'Standard guest question'} · ${TABS.find((t) => t.id === matched.stage)!.label}` : asGuest(channel)}
      action={matched
        ? <button type="button" className="h-textlink" onClick={() => { goTab(matched.stage, { q: matched.id, ask: null }); setDraft('') }}>Open this question</button>
        : <button type="button" className="h-textlink" onClick={() => { goTab('az', { group: 'custom', ask: null }); setDraft('') }}>Add it to Custom facts</button>}>
      {matched ? (() => { const a = answerOf(matched, hub, channel); return <><KhcAnswer text={a.text} only={a.only ? { channel: a.only.c, text: a.only.text } : undefined} /><KhcProv items={matched.from} /></> })()
        : <KhcAnswer text={[hub.scenario ? 'I’m not sure, so I’ll check with your host and get back to you.' : 'I’m not sure, so I’ll check and get back to you.']} />}
    </KhcAskResult>
  ) : null

  const stage = tab !== 'overview' && tab !== 'az' ? (tab as StageId) : null
  const content = tab === 'overview'
    ? <Overview hub={hub} onStage={(s) => goTab(s)} onGap={openGap} onAllGaps={() => openGap(firstGap(hub))} />
    : tab === 'az'
      ? <EverythingAZ hub={hub} group={group} onGroup={(g) => set({ group: g, edit: null })} base={base} edit={q.get('edit')} onEdit={(k) => set({ edit: k })} />
      : <StageQuestions hub={hub} stage={stage!} open={openQ} onOpen={(id) => set({ q: id, edit: null })} channel={channel} filter={filter}
          onFilter={(f) => set({ filter: f === 'all' ? null : f })} onGap={openGap} base={base} edit={q.get('edit')} onEdit={(k) => set({ edit: k })} />

  const panelNode = panel === 'gaps'
    ? <GapsPanel hub={hub} gapId={gapParam} onGo={(id) => openGap(id ?? firstGap(hub))} onClose={() => openGap(null)} onAdded={setToast} />
    : panel === 'sources' ? <SourcesPanel hub={hub} onClose={() => set({ sources: null })} /> : null

  return (
    <div className="h-khc">
      <div className="h-khc__head">
        <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
        <p className="h-khc__lead">Everything about this property in one place. Your channels start from it and your AI replies read it.</p>
        <KhcTabs active={tab} onSelect={(id) => goTab(id as TabId)} items={TABS.map((t) => ({ id: t.id, label: t.label, count: counts[t.id] || undefined }))} />
        <div className="h-khc-askrow">
          <KhcAsk value={draft} onChange={setDraft} onSubmit={() => set({ ask: draft.trim() || null })} channel={channel} channels={chs}
            onChannel={(c) => set({ as: c === first ? null : c })} />
          <KhcControl icon="alert-circle" label="Gaps" count={hub.gaps.length} on={panel === 'gaps'} onClick={toggleGaps} />
          <KhcControl icon="stack-2" label="Sources" count={hub.sources.length} on={panel === 'sources'} onClick={toggleSources} />
        </div>
        {askResult}
      </div>
      <div className="h-khc__body">
        <div className="h-khc__main h-scroll-thin" ref={main}>{content}</div>
        <div className={cx('h-khc__aside', panel === 'gaps' && 'is-wide')}>
          <KhcDrawer open={!!panelNode}>{panelNode}</KhcDrawer>
          {tab === 'overview' && <AzCard hub={hub} onOpen={(g) => goTab('az', { group: g ?? null })} />}
        </div>
      </div>
      {toast && <KhToast onDone={closeToast}>{toast}</KhToast>}
    </div>
  )
}
