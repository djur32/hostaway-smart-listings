/* Knowledge Hub iteration KH-B · One document + AI tester (concepts/knowledge-hub/KH-B.md, Paper row 2 on page KH).
 * One calm, long page with every section; a sticky anchor bar with scroll-spy; one Edit per section (Discard changes /
 * Save through the Hub draft → sl3Base / sl3Custom); "+ Add a fact" inline at the end of each section; a "Test your AI"
 * drawer whose answers cite the facts they used, tinted on the page and numbered in the bar.
 * URL states: ?v=b · &section=<id> (scroll there) · &ask=<questionId|text> (drawer open, answered) · &ch=booking|direct ·
 * &rail=1 (drawer open, no question) · &edit=<section> · &add=<section> · &hover=<factKey>:<channel> (Base vs channel card).
 * Property-aware (perProperty.ts): the active property's facts, amenities, channels and sources. Neukölln keeps its
 * scripted questions, answers, extra facts and sources; any other property gets the generic ones built from its values. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Button, Icon, KhDialog, KhToast, KhbAddSource, KhbAnchorBar, KhbLayout, KhbSearch, KhbSourceCard, KhbSources, PageHead, Segmented, useIsMobile,
} from '../../../ds'
import { isListingChannel, type ListingChannel } from '../../../data/sl3'
import type { KhSectionId } from '../../../data/v3-kh'
import { useProperty } from '../../../shell/PropertyLayout'
import { useStore } from '../../../store/store'
import { scopeOf, useHubDraft } from '../model'
import { useHubPid, useIsScenario, useListingChannels } from '../perProperty'
import { useHubUi } from '../state'
import { HubVariantPicker } from '../switch'
import { AddFact } from './B/AddFact'
import { answer as answerFor, citeNumbers, questionsFor } from './B/answers'
import { DocSection, amenitySummary, type EditIntent } from './B/Doc'
import { B_SECTIONS, bAmenities, bFacts, bSources, isBSection, names, onText, readValue, sectionLabel, valueFor, type BSource } from './B/model'
import { TestAIRail, type UsedFact } from './B/Rail'

const DESC = 'Everything about this property in one place. Your channels start from it and your AI replies read it.'
const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

export function HubB() {
  const p = useProperty()
  const base = `/property/${p.id}`
  const [q, setQ] = useSearchParams()
  const setParams = useCallback((patch: Record<string, string | null>) => setQ((prev) => {
    const n = new URLSearchParams(prev)
    for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k) }
    return n
  }, { replace: true }), [setQ])

  /* ---------- data (the active property's) ---------- */
  const pid = useHubPid()
  const scenario = useIsScenario()
  const chs = useListingChannels()
  const added = useHubUi((s) => s.added)
  const custom = useStore((s) => s.sl3.custom)
  const facts = useMemo(() => bFacts(added, pid), [added, pid])
  const byKey = useMemo(() => new Map(facts.map((f) => [f.id, f])), [facts])
  const read = useHubDraft('b-read')

  /* ---------- URL state ---------- */
  const ask = q.get('ask')
  const chParam = q.get('ch')
  const firstCh: ListingChannel = chs[0] ?? 'airbnb'
  const ch: ListingChannel = isListingChannel(chParam ?? undefined) && chs.includes(chParam as ListingChannel) ? chParam as ListingChannel : firstCh
  const railOpen = !!ask || q.get('rail') === '1'
  const editParam = q.get('edit')
  const editing = isBSection(editParam) && editParam !== 'photos' ? editParam : null
  const addParam = q.get('add')
  const adding = isBSection(addParam) && addParam !== 'photos' ? addParam : null
  const hover = q.get('hover')
  const mobile = useIsMobile()
  /* phones: tapping a citation minimises the Test your AI sheet so the fact shows on the page; a pill brings it back */
  const [peek, setPeek] = useState(false)
  useEffect(() => { setPeek(false) }, [ask, railOpen])
  const [intent, setIntent] = useState<EditIntent | null>(null)
  const [prefill, setPrefill] = useState<string | undefined>(undefined)
  const [flash, setFlash] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; push?: boolean } | null>(null)
  const closeToast = useCallback(() => setToast(null), [])

  /* ---------- the answer (canned per question and channel, built from live fact values) ---------- */
  const [thinking, setThinking] = useState(false)
  const lastAsk = useRef(`${ask}|${ch}`)
  useEffect(() => {
    const k = `${ask}|${ch}`
    if (lastAsk.current === k) return
    lastAsk.current = k
    if (!ask) return
    setThinking(true)
    const t = setTimeout(() => setThinking(false), 650)
    return () => clearTimeout(t)
  }, [ask, ch])
  const amenities = useMemo(() => bAmenities(custom, pid).flatMap((g) => g.items), [custom, pid])
  const ans = useMemo(() => {
    if (!ask) return null
    const get = (k: string) => { const f = byKey.get(k); return f ? valueFor(f, scopeOf(f.item, read), ch) : '' }
    const amenityOn = (re: RegExp) => amenities.find((a) => re.test(a.name) && a.on.includes(ch))?.key ?? null
    const ownFacts = facts.filter((f) => f.id.startsWith('kh.') && (f.section === 'custom' || f.id.startsWith('kh.b.'))).map((f) => ({ key: f.id, label: f.label, value: read.base(f.id, f.item.base) }))
    return answerFor(ask, { scenario, get, ch, amenityOn, added: ownFacts })
  }, [ask, ch, byKey, facts, read, amenities, scenario])
  const numbers = useMemo(() => (ans && !thinking ? citeNumbers(ans) : []), [ans, thinking])
  const cites = useMemo(() => new Map(numbers), [numbers])
  const used: UsedFact[] = numbers.map(([key, n]) => {
    const f = byKey.get(key)
    if (f) return { key, n, where: `${sectionLabel(f.section)} · ${f.label}`, what: readValue(f, valueFor(f, scopeOf(f.item, read), ch), read), source: `From ${f.source}` }
    const a = amenities.find((x) => x.key === key)
    return { key, n, where: `Amenities · ${a?.name ?? key.slice(8)}`, what: a ? onText(a.on, chs) : '' }
  })
  const sectionOfKey = (k: string): KhSectionId | undefined => byKey.get(k)?.section ?? (k.startsWith('amenity:') ? 'amenities' : undefined)
  const anchorCites = (id: KhSectionId) => numbers.filter(([k]) => sectionOfKey(k) === id).map(([, n]) => n)

  /* ---------- scrolling: anchors, scroll-spy, jump to a fact ---------- */
  const mainRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const lock = useRef(false)
  const [active, setActive] = useState<KhSectionId>('property')
  const [stuck, setStuck] = useState(false)
  const scrollToEl = useCallback((el: Element | null, smooth = true, gap = 16) => {
    const m = mainRef.current
    if (!m || !el) return
    const barH = barRef.current?.offsetHeight ?? 0
    const top = m.scrollTop + el.getBoundingClientRect().top - m.getBoundingClientRect().top - barH - gap
    m.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' })
  }, [])
  const goTo = useCallback((id: KhSectionId, smooth = true) => {
    lock.current = true
    setActive(id)
    scrollToEl(mainRef.current?.querySelector(`[data-khb-section="${id}"]`) ?? null, smooth, 0)
    window.setTimeout(() => { lock.current = false }, smooth ? 700 : 60)
  }, [scrollToEl])
  const showFact = useCallback((key: string) => {
    const el = mainRef.current?.querySelector(`[data-khb-fact="${CSS.escape(key)}"]`) ?? null
    const sec = sectionOfKey(key)
    if (sec) { lock.current = true; setActive(sec); window.setTimeout(() => { lock.current = false }, 700) }
    scrollToEl(el, true, 48)
    setFlash(key)
    window.setTimeout(() => setFlash((f) => (f === key ? null : f)), 1600)
  }, [scrollToEl]) // eslint-disable-line react-hooks/exhaustive-deps
  // scroll-spy: sections crossing a band under the bar; the last one when the page bottoms out
  useEffect(() => {
    const m = mainRef.current
    if (!m) return
    const barH = barRef.current?.offsetHeight ?? 56
    const visible = new Set<string>()
    const atBottom = () => m.scrollTop + m.clientHeight >= m.scrollHeight - 4
    const pick = () => {
      if (lock.current) return
      if (atBottom() && m.scrollTop > 0) { setActive(B_SECTIONS[B_SECTIONS.length - 1].id); return }
      const first = B_SECTIONS.find((s) => visible.has(s.id))
      if (first) setActive(first.id)
      else if (m.scrollTop < 8) setActive(B_SECTIONS[0].id)
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) { const id = (e.target as HTMLElement).dataset.khbSection!; if (e.isIntersecting) visible.add(id); else visible.delete(id) }
      pick()
    }, { root: m, rootMargin: `-${barH + 24}px 0px -60% 0px`, threshold: 0 })
    m.querySelectorAll('[data-khb-section]').forEach((el) => io.observe(el))
    const stick = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { root: m, threshold: 0 })
    if (sentinel.current) stick.observe(sentinel.current)
    const onScroll = () => { if (atBottom()) pick() }
    m.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); stick.disconnect(); m.removeEventListener('scroll', onScroll) }
  }, [editing, adding, facts.length, railOpen])
  // first load: jump to ?section / ?edit / ?add
  useEffect(() => {
    const target = q.get('section') ?? editParam ?? addParam
    if (!isBSection(target)) return
    const a = setTimeout(() => goTo(target, false), 50)
    const b = setTimeout(() => goTo(target, false), 450)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // after a click opens a form, bring it into view once it has rendered
  const whenReady = useCallback(function ready(sel: string, fn: (el: Element) => void, tries = 25) {
    const el = mainRef.current?.querySelector(sel)
    if (el) fn(el)
    else if (tries > 0) window.setTimeout(() => ready(sel, fn, tries - 1), 40)
  }, [])

  /* ---------- actions ---------- */
  const onEdit = (s: KhSectionId, i?: EditIntent) => {
    if (s === 'photos') return
    setIntent(i ?? null)
    setParams({ edit: s, add: null, hover: null })
    lock.current = true; setActive(s); window.setTimeout(() => { lock.current = false }, 900)
    whenReady(i?.key ? `.is-editing [data-kh-key="${CSS.escape(i.key)}"]` : `.khb-sec.is-editing[data-khb-section="${s}"]`, (el) => scrollToEl(el, true, i?.key ? 88 : 0))
  }
  const onCloseEdit = (saved?: { section: KhSectionId; channels: ListingChannel[] }) => {
    const s = editing
    setIntent(null)
    setParams({ edit: null })
    // the form closes into the shorter read view: keep the section in view if its top went above the bar
    if (s) whenReady(`.khb-sec:not(.is-editing)[data-khb-section="${s}"]`, (el) => { if (el.getBoundingClientRect().top < (barRef.current?.getBoundingClientRect().bottom ?? 0)) scrollToEl(el, false, 0) })
    if (saved) setToast(saved.channels.length ? { text: `Saved. ${names(saved.channels)} ${saved.channels.length === 1 ? 'updates' : 'update'} when you push.`, push: true } : { text: 'Saved. Your AI replies use it right away.' })
  }
  const onAdd = (s: KhSectionId, fill?: string) => {
    setPrefill(fill)
    setParams({ add: s, edit: null })
    whenReady('[data-khb-add]', (el) => scrollToEl(el, true, 120))
  }
  const onAsk = (text: string) => {
    const id = questionsFor(scenario).find((x) => x.id === text || x.q.toLowerCase() === text.toLowerCase())?.id ?? text
    setParams({ ask: id, rail: '1' })
  }
  const onFix = () => {
    const k = numbers[0]?.[0]
    const s = k ? sectionOfKey(k) : undefined
    if (s) onEdit(s, s === 'amenities' || s === 'policies' ? undefined : { key: k })
  }

  /* ---------- sources ---------- */
  // Neukölln's scripted strip or the property's generic one; kept per property (the Hub remounts on a switch, the pid guard
  // makes sure a stale list never shows)
  const [src, setSrc] = useState<{ pid: string; list: BSource[] }>(() => ({ pid, list: bSources(pid) }))
  const sources = src.pid === pid ? src.list : bSources(pid)
  const setSources = (list: BSource[]) => setSrc({ pid, list })
  const [adder, setAdder] = useState<{ kind: 'pdf' | 'link' | 'text'; value: string } | null>(null)
  const addSource = () => {
    if (!adder?.value.trim()) return
    const v = adder.value.trim()
    const src: BSource = adder.kind === 'link'
      ? { id: `s-${Date.now()}`, name: v.replace(/^https?:\/\//, '').split('/')[0], meta: 'Link', icon: 'link', updated: 'Added just now' }
      : adder.kind === 'pdf' ? { id: `s-${Date.now()}`, name: v, meta: 'PDF', icon: 'book-2', updated: 'Added just now' }
      : { id: `s-${Date.now()}`, name: v.split(/[.\n]/)[0].slice(0, 32), meta: 'Text', icon: 'file-text', updated: 'Added just now' }
    setSources([...sources, src]); setAdder(null)
    setToast({ text: `${src.name} added. The AI reads it from now on.` })
  }

  /* ---------- search ---------- */
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const results = useMemo(() => {
    const n = norm(search)
    if (!n) return []
    const out: Array<{ id: string; where: string; label: string; value: string }> = []
    for (const f of facts) {
      const s = scopeOf(f.item, read)
      const text = [f.label, s.base, ...s.own.map((o) => o.value)].join(' ')
      if (norm(text).includes(n)) out.push({ id: f.id, where: sectionLabel(f.section), label: f.label, value: readValue(f, s.only ? s.own[0]?.value ?? '' : s.base, read) })
    }
    for (const a of amenities) if (a.on.length && norm(a.name).includes(n)) out.push({ id: a.key, where: 'Amenities', label: a.name, value: onText(a.on, chs) })
    return out.slice(0, 8)
  }, [search, facts, read, amenities, chs])
  const toggleSearch = useCallback((v: boolean) => setSearchOpen(v), [])

  /* ---------- render ---------- */
  const ctx = {
    base, chs, read, cites, flash, hover, editing, intent, onEdit, onCloseEdit, onAdd: (s: KhSectionId) => onAdd(s),
    addCard: (s: KhSectionId) => adding === s ? <div data-khb-add><AddFact key={s} section={s} prefill={prefill} onClose={() => { setParams({ add: null }); setPrefill(undefined) }} onAdded={(msg) => { setParams({ add: null }); setPrefill(undefined); setToast({ text: msg }) }} /></div> : null,
  }
  const main = (
    <div className="khb-page">
      <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
      <p className="khb-lead">{DESC}</p>
      <KhbSources count={sources.length} note="The AI and your channels read from these. Each fact links back to its source.">
        {sources.map((s) => (
          <KhbSourceCard key={s.id} name={s.name} meta={s.meta} icon={s.icon} updated={s.updated}
            menu={[
              { label: 'Refresh now', onClick: () => setSources(sources.map((x) => (x.id === s.id ? { ...x, updated: 'Updated just now' } : x))) },
              { label: 'Remove source', onClick: () => setSources(sources.filter((x) => x.id !== s.id)) },
            ]} />
        ))}
        <KhbAddSource onClick={() => setAdder({ kind: 'pdf', value: '' })} />
      </KhbSources>
      <div ref={sentinel} className="khb-sentinel" aria-hidden="true" />
      <KhbAnchorBar barRef={barRef} stuck={stuck} active={active} onSelect={(id) => goTo(id as KhSectionId)}
        items={B_SECTIONS.map((s) => ({ id: s.id, label: s.label, cites: anchorCites(s.id) }))}
        tools={railOpen ? undefined : <>
          <KhbSearch open={searchOpen} onToggle={toggleSearch} value={search} onChange={setSearch} results={results} onPick={(id) => { setSearchOpen(false); showFact(id) }} />
          <Button icon="sparkles" onClick={() => setParams({ rail: '1' })}>Test your AI</Button>
        </>} />
      <div className="khb-doc">
        {B_SECTIONS.map((s) => <DocSection key={s.id} sec={s} facts={facts.filter((f) => f.section === s.id)} ctx={ctx} descOverride={s.id === 'amenities' ? amenitySummary(custom, pid, chs, scenario) : undefined} />)}
      </div>
    </div>
  )
  const rail = railOpen ? (
    <TestAIRail ask={ask} ch={ch} answer={ans} used={used} thinking={thinking} onAsk={onAsk}
      onChannel={(c) => setParams({ ch: c === firstCh ? null : c })} onClose={() => setParams({ rail: null, ask: null })}
      onCite={(k) => { if (mobile) setPeek(true); showFact(k) }} onFix={() => { if (mobile) setParams({ rail: null, ask: null }); onFix() }} onAddFact={(s, fill) => { if (mobile) setParams({ rail: null, ask: null }); onAdd(s, fill) }} />
  ) : null

  return (
    <>
      <KhbLayout mainRef={mainRef} main={main} drawer={rail} onClose={() => setParams({ rail: null, ask: null })} minimized={peek} onRestore={() => setPeek(false)} />
      {adder && (
        <KhDialog title="Add a source" onClose={() => setAdder(null)}
          foot={<><Button onClick={() => setAdder(null)}>Cancel</Button><Button kind="primary" disabled={!adder.value.trim()} onClick={addSource}>Add source</Button></>}>
          <div className="khb-srcform">
            <Segmented label="Kind of source" value={adder.kind} onChange={(k) => setAdder({ kind: k, value: '' })}
              items={[{ id: 'pdf', label: <><Icon name="book-2" size={16} />PDF</> }, { id: 'link', label: <><Icon name="link" size={16} />Link</> }, { id: 'text', label: <><Icon name="file-text" size={16} />Text</> }]} />
            {adder.kind === 'text'
              ? <textarea className="h-textarea h-khtextarea" rows={5} autoFocus value={adder.value} placeholder="Paste anything guests might ask about: a welcome letter, building rules, a neighbourhood guide…" onChange={(e) => setAdder({ ...adder, value: e.target.value })} />
              : <input className="h-input" autoFocus value={adder.value} placeholder={adder.kind === 'link' ? 'https://…' : 'File name, e.g. Welcome book.pdf'} onChange={(e) => setAdder({ ...adder, value: e.target.value })} />}
            <p className="khb-srcform__note">The AI reads it for replies. Facts it finds show up in the right section, with this source.</p>
          </div>
        </KhDialog>
      )}
      {toast && <KhToast onDone={closeToast}>{toast.text}{toast.push && <Link className="h-toast__action" to={`${base}/push`}>Send to channels</Link>}</KhToast>}
    </>
  )
}
