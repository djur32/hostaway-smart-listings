/* Knowledge Hub iteration R · Overview + a topic page (concepts/knowledge-hub/KH-NEXT-2.md, "Overview, rebuilt" / "A
 * topic page" — second revision, Agent R-overview2; punch list round 3, concepts/knowledge-hub/KH-NEXT-3.md, Agent R3).
 * Overview: coverage, the nine topics as clickable cards, then Gaps — demoted below the fold and collapsed by default
 * (round 3, "I want the gaps to be more hidden"; still cross-referenced to a live AI suggestion elsewhere
 * when one genuinely shares the gap's missing fact, that stays). No Sources summary here any more — Sources is its own
 * page. A topic page is question-first (brings back C's pattern, calmer): its own search bar
 * to ask a question directly (round 3, "bring back C's question-first UI, specifically its search bar"), then
 * one listing-wide answer per question, its source facts as compact chips, a gap's "Add the answer" inline, and —
 * below the questions — every fact this topic holds, including ones a question already cites (round 3: facts no
 * longer get pulled out of this list just because a question also cites them). A property with no knowledge base yet
 * renders Empty.tsx instead of all of this (R-BRIEF.md). */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button, DetailsDrawer, Icon, KhcStateIcon, OvMenu, QueryTabs, cx, type KhcState,
} from '../../../../ds'
import { CHANNELS } from '../../../../data/channels'
import { KhrFrame, RFactRow, ROverviewTopicCard, ROverviewTopicGrid } from '../../../../ds/kh-r'
import { useProperty } from '../../../../shell/PropertyLayout'
import { useKbState } from '../../../../store/selectors'
import { useStore } from '../../../../store/store'
import type { FactRef, Gap, Question } from '../C/data'
import { FactRow } from '../C/Facts'
import type { Hub } from '../C/model'
import {
  answerFor, displayRFactValue, kindOf, questionLabel, topicDesc, topicIcon, type RTopicId,
} from './data'
import {
  useR, resolveGapFact, rScopeLabel, tipsForQuestion, type RFact, type RFactInput, type RScope, type RTopicView, type R,
} from './model'
import { createPropertyStore } from '../../perProperty'
import { TestDrawer } from './Test'
import { AddFact, type AddFactPrefill } from './AddFact'
import { KbEmpty } from './Empty'

export function Overview({ tab }: { tab?: string | null }) {
  const p = useProperty()
  const kb = useKbState()
  {/* the real empty state names the property, not its internal nickname (S10 QA, 1 Oct) */}
  if (kb !== 'ready') return <KhrFrame title="Content" property={p}><KbEmpty propertyName={p.name} /></KhrFrame>
  return <OverviewReady tab={tab} />
}

/** Questions the host added on a topic page ("add a new question with a button"). Unanswered until a
 *  fact answers them; kept per property like the Workflows store. */
interface AddedQ { id: string; topic: string; q: string }
export const useAddedQuestions = createPropertyStore('hostaway-kh-r-questions', (): { items: AddedQ[] } => ({ items: [] }), (set) => ({
  add: (x: AddedQ) => set((s) => ({ items: [...s.items, x] })),
}))

function OverviewReady({ tab }: { tab?: string | null }) {
  const p = useProperty()
  const base = `/property/${p.id}`
  const nav = useNavigate()
  const r = useR()
  const [openAddFact, setOpenAddFact] = useState<AddFactPrefill | null>(null)
  const active = r.topics.find((t) => t.id === tab)
  const openFact = (prefill: AddFactPrefill) => setOpenAddFact(prefill)

  return (
    <>
      {active ? (
        <TopicPage key={active.id} topic={active} hub={r.hub} base={base}
          onAddFact={() => openFact({ topic: active.id, lockTopic: true })}
          onAddFactForGap={(g) => openFact({ topic: active.id, lockTopic: true, gap: g })}
          onEditAdded={(f) => openFact({ topic: active.id, lockTopic: true, editing: f })} />
      ) : (
        // Content: the page is titled by its section, not "Knowledge Hub"; the nine topics below
        <KhrFrame title="Content" property={p} desc="Everything about this property in one place. Your channels start from it and your AI replies read it.">
          <TopicCards r={r} onOpen={(id) => nav(`${base}/hub/${id}`)} />
        </KhrFrame>
      )}
      {openAddFact && (
        <AddFact prefill={openAddFact} onClose={() => setOpenAddFact(null)}
          onAdd={(f: RFactInput) => (openAddFact.editing ? r.updateFact(openAddFact.editing.id, f) : r.addFact(f))}
          onResolveGap={(text: string, scope: RScope) => { if (openAddFact.gap) resolveGapFact(openAddFact.gap, text, scope) }} />
      )}
    </>
  )
}

/** The nine topics as template-style cards (ref 04's family) — click one to open its page. */
function TopicCards({ r, onOpen }: { r: R; onOpen: (id: RTopicId) => void }) {
  return (
    <>
      <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">{r.topics.length} topics</h2></div>
      <ROverviewTopicGrid>
        {r.topics.map((t) => (
          <ROverviewTopicCard key={t.id} icon={topicIcon(t.id)} label={t.label} count={t.count} desc={topicDesc(t.id)} onClick={() => onOpen(t.id)} />
        ))}
      </ROverviewTopicGrid>
    </>
  )
}

/** A fact's chip label: its own label where one is given (a composite, like "Check-in from · until"), else the
 *  underlying item's — the same label FactRow would show, just without the row's controls. */
function factChipLabel(hub: Hub, f: FactRef): string {
  if (f.label) return f.label
  const k0 = f.keys[0]
  if (k0.startsWith('amenity:')) return `Amenity: ${k0.slice(8)}`
  if (k0 === 'policy:cancel') return 'Cancellation policy'
  if (k0 === 'policy:instant') return 'Instant book'
  return hub.item(k0)?.label ?? k0
}

/** A topic page: the Strategy channel page's back chevron before the title; a tab row — Questions ·
 *  Facts — and nothing else at its end. Each tab opens on its count and its primary add button, then a bordered table
 *  styled like Sources. A whole row is clickable (hover on the row) and opens a side DRAWER over the page — the same
 *  drawer as Add a fact — with the item's editor and Delete; its ··· menu has Edit · Delete. Add question opens the same
 *  drawer shape as Add a fact. */
type TopicDrawer = { kind: 'q'; id: string } | { kind: 'f'; key: string; ref: FactRef } | { kind: 'new-q' }
const STATE_TEXT: Record<KhcState, string> = { a: 'Answered', p: 'Partly answered', n: 'Not answered' }

/** Questions and facts the host deleted from a topic (per property; the prototype hides them, nothing upstream changes). */
const useRemoved = createPropertyStore('hostaway-kh-r-removed', (): { ids: string[] } => ({ ids: [] }), (set) => ({
  remove: (id: string) => set((s) => ({ ids: s.ids.includes(id) ? s.ids : [...s.ids, id] })),
}))

function TopicPage({ topic, hub, base, onAddFact, onAddFactForGap, onEditAdded }: {
  topic: RTopicView; hub: Hub; base: string
  onAddFact: () => void; onAddFactForGap: (g: Gap) => void; onEditAdded: (f: RFact) => void
}) {
  const p = useProperty()
  const [params] = useSearchParams()
  const tab = params.get('tab') === 'facts' ? 'facts' : 'questions'
  const [drawer, setDrawer] = useState<TopicDrawer | null>(null)
  const [testing, setTesting] = useState(false)
  const allAdded = useAddedQuestions((s) => s.items)
  const edits = useQuestionEdits((s) => s.items)
  const removedIds = useRemoved((s) => s.ids)
  const removed = useMemo(() => new Set(removedIds), [removedIds])
  const remove = (id: string) => { useRemoved.getState().remove(id); setDrawer(null) }
  const questions = topic.questions.filter((q) => !removed.has(q.id))
  const added = useMemo(() => allAdded.filter((x) => x.topic === topic.id && !removed.has(x.id)), [allAdded, topic.id, removed])
  const factRefs = topic.factRefs.filter(({ key }) => !removed.has(`fact:${key}`))
  const addedFacts = topic.addedFacts.filter((f) => !removed.has(`rf:${f.id}`))
  const chs = hub.chs
  const totalFacts = factRefs.length + addedFacts.length
  const total = questions.length + added.length
  const q$ = (t: string) => { const x = new URLSearchParams(params); x.set('tab', t); return `?${x}` }
  const close = () => setDrawer(null)

  const tabs = (
    <div className="ch-tabrow">
      <QueryTabs active={tab} items={[
        { id: 'questions', label: 'Questions', to: q$('questions'), count: total },
        { id: 'facts', label: 'Facts', to: q$('facts'), count: totalFacts },
      ]} />
      <Button onClick={() => setTesting(true)}>Test</Button>
    </div>
  )
  const menu = (label: string, onEdit: () => void, onDelete: () => void) => (
    <span className="h-khr2-rowmenu" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <OvMenu label={`More for ${label}`} items={[{ label: 'Edit', onSelect: onEdit }, { label: 'Delete', onSelect: onDelete }]} />
    </span>
  )

  const dq = drawer?.kind === 'q' ? drawer : null
  const qOpen = dq ? topic.questions.find((x) => x.id === dq.id) : undefined
  const aOpen = dq ? added.find((x) => x.id === dq.id) : undefined

  return (
    <KhrFrame title={topic.label} property={p} back={{ to: `${base}/hub/content`, label: 'Back to Content' }} tabs={tabs}>
      {tab === 'questions' ? (
        <>
          <div className="h-khr2-sechead">
            <h2 className="h-khr2-sechead__title">{total} {total === 1 ? 'question' : 'questions'} guests ask about this property</h2>
            <Button kind="primary" icon="plus" onClick={() => setDrawer({ kind: 'new-q' })}>Add question</Button>
          </div>
          {total === 0 ? <p className="h-khc-empty">No guest questions in this topic yet.</p> : (
            <div className="h-khr2-table">
              {questions.map((q) => {
                const st: KhcState = hub.cov(q)
                const label = edits[q.id]?.q || questionLabel(q)
                const meta = [q.asked !== undefined ? `asked ${q.asked} ${q.asked === 1 ? 'time' : 'times'}` : null, STATE_TEXT[st]].filter(Boolean).join(' · ')
                return (
                  <QuestionRow key={q.id} state={st} label={label} meta={meta} active={dq?.id === q.id} onOpen={() => setDrawer({ kind: 'q', id: q.id })}
                    menu={menu(label, () => setDrawer({ kind: 'q', id: q.id }), () => remove(q.id))} />
                )
              })}
              {added.map((x) => {
                const label = edits[x.id]?.q || x.q
                return (
                  <QuestionRow key={x.id} state="n" label={label} meta="Added by you · Not answered" active={dq?.id === x.id} onOpen={() => setDrawer({ kind: 'q', id: x.id })}
                    menu={menu(label, () => setDrawer({ kind: 'q', id: x.id }), () => remove(x.id))} />
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="h-khr2-sechead">
            <h2 className="h-khr2-sechead__title">{totalFacts} {totalFacts === 1 ? 'fact' : 'facts'} about this property</h2>
            <Button kind="primary" icon="plus" onClick={onAddFact}>Add fact</Button>
          </div>
          {totalFacts === 0 ? <p className="h-khc-empty">No facts here yet.</p> : (
            <div className="h-khr2-table h-khr2-facttable">
              {factRefs.map(({ key, ref }) => {
                const open = () => setDrawer({ kind: 'f', key, ref })
                return (
                  <div key={key} className="h-khr2-rowclick" role="button" tabIndex={0} onClick={open} onKeyDown={(e) => { if (e.key === 'Enter') open() }}>
                    <FactRow hub={hub} fact={ref} base={base} editing={false} onEdit={(v) => { if (v) open() }}
                      actionOverride={menu(factChipLabel(hub, ref), open, () => remove(`fact:${key}`))} />
                  </div>
                )
              })}
              {addedFacts.map((f) => {
                const open = () => onEditAdded(f)
                return (
                  <div key={f.id} className="h-khr2-rowclick" role="button" tabIndex={0} onClick={open} onKeyDown={(e) => { if (e.key === 'Enter') open() }}>
                    <RFactRow icon={f.icon ?? kindOf(f.kind).icon} label={f.label} value={displayRFactValue(f.kind, f.value)}
                      scope={rScopeLabel(f.scope, chs)} source={f.source} action={menu(f.label, open, () => remove(`rf:${f.id}`))} />
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <TestDrawer open={testing} onClose={() => setTesting(false)} />
      {/* the drawers: Edit fact · Edit question · Add question — over the page, like Add a fact (DetailsDrawer) */}
      <DetailsDrawer open={drawer?.kind === 'f'} title="Edit fact" onClose={close}
        footer={drawer?.kind === 'f' ? <Button className="h-khr2-delete" onClick={() => remove(`fact:${drawer.key}`)}>Delete fact</Button> : undefined}>
        {drawer?.kind === 'f' && <div className="h-khr2-drawer"><FactRow hub={hub} fact={drawer.ref} base={base} editing onEdit={(v) => { if (!v) close() }} /></div>}
      </DetailsDrawer>
      {(qOpen || aOpen) && (
        <QuestionDrawer key={dq!.id} hub={hub} base={base} q={qOpen} added={aOpen} edit={edits[dq!.id]} gap={qOpen?.gap ? topic.gaps.find((g) => g.id === qOpen.gap) : undefined}
          onClose={close} onDelete={() => remove(dq!.id)}
          onEditFact={(ref) => setDrawer({ kind: 'f', key: ref.keys[0], ref })} onAddFact={() => { close(); onAddFact() }} onAddFactForGap={(g) => { close(); onAddFactForGap(g) }} />
      )}
      {drawer?.kind === 'new-q' && <AddQuestionDrawer topic={topic.label} onClose={close}
        onAdd={(q, answer) => {
          const id = `added-${Date.now()}`
          useAddedQuestions.getState().add({ id, topic: topic.id, q })
          if (answer) useQuestionEdits.getState().save(id, { q, answer })
          close()
        }} />}
    </KhrFrame>
  )
}

/** One question in the table: its state icon, the question, "asked N times · Answered", and its ··· menu. The whole row
 *  opens the question's drawer (hover on the row says so). */
function QuestionRow({ state, label, meta, active, onOpen, menu }: { state: KhcState; label: string; meta: string; active?: boolean; onOpen: () => void; menu: ReactNode }) {
  return (
    <div className={cx('h-khr2-src-row h-khr2-qrow h-khr2-rowclick', active && 'is-active')} role="button" tabIndex={0} aria-label={`Open question: ${label}`}
      onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <span className="h-khr2-src-row__icon"><KhcStateIcon state={state} /></span>
      <span className="h-khr2-src-row__text">
        <span className="h-khr2-src-row__name">{label}</span>
        <span className="h-khr2-src-row__line">{meta}</span>
      </span>
      <span className="h-khr2-src-row__action">{menu}</span>
    </div>
  )
}

/** Host edits to a question: its wording and the answer the AI gives (kept per property; — the real answer
 *  is generated from the facts, so this stands for "the answer you've reviewed"). */
export const useQuestionEdits = createPropertyStore('hostaway-kh-r-question-edits', (): { items: Record<string, { q?: string; answer?: string }> } => ({ items: {} }), (set) => ({
  save: (id: string, v: { q?: string; answer?: string }) => set((s) => ({ items: { ...s.items, [id]: v } })),
}))

/** The question's drawer: edit the question and its answer, see and edit the facts it uses, the Smart
 *  Listing tips that touch those facts ("how that is related"), and Delete. */
function QuestionDrawer({ hub, base, q, added, edit, gap, onClose, onDelete, onEditFact, onAddFact, onAddFactForGap }: {
  hub: Hub; base: string; q?: Question; added?: { id: string; q: string }; edit?: { q?: string; answer?: string }; gap?: Gap
  onClose: () => void; onDelete: () => void; onEditFact: (ref: FactRef) => void; onAddFact: () => void; onAddFactForGap: (g: Gap) => void
}) {
  const id = q?.id ?? added!.id
  const ans = q ? answerFor(q, hub.r, hub.chs[0] ?? 'airbnb') : undefined
  const original = { q: q ? questionLabel(q) : added!.q, answer: ans ? [...ans.text, ...(ans.only ? [ans.only.text] : [])].join('\n') : '' }
  const [text, setText] = useState(edit?.q ?? original.q)
  const [answer, setAnswer] = useState(edit?.answer ?? original.answer)
  const facts = q ? hub.facts(q) : []
  const tipState = useStore((st) => st.sl3.tips)
  const smartOn = useStore((st) => st.smartListings && st.sl3.setupDone)
  const planChs = useStore((st) => st.sl3.channels)
  const tips = q ? tipsForQuestion(hub, q, { tips: tipState, open: (c) => smartOn && planChs.includes(c) }) : []
  const state: KhcState = q ? hub.cov(q) : 'n'
  const dirty = text !== (edit?.q ?? original.q) || answer !== (edit?.answer ?? original.answer)
  const save = () => { useQuestionEdits.getState().save(id, { q: text.trim() || original.q, answer }); onClose() }
  return (
    <DetailsDrawer open title="Edit question" onClose={onClose}
      footer={<><Button className="h-khr2-delete" onClick={onDelete}>Delete question</Button><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!dirty} onClick={save}>Save</Button></>}>
      <div className="h-khr2-drawer">
        <label className="h-khr2-pfield">
          <span className="h-khr2-pfield__label">Question</span>
          <input className="h-input" value={text} aria-label="Question" onChange={(e) => setText(e.target.value)} />
        </label>
        <label className="h-khr2-pfield">
          <span className="h-khr2-pfield__label">Answer</span>
          <textarea className="h-textarea" rows={Math.min(8, Math.max(3, Math.ceil(answer.length / 48) + 1))} value={answer} placeholder="Not answered yet"
            aria-label="Answer" onChange={(e) => setAnswer(e.target.value)} />
          {ans?.only && <span className="h-khr2-pfield__help">“{ans.only.text}” only goes to {CHANNELS[ans.only.c].name} guests.</span>}
        </label>
        {state !== 'a' && (
          <p className="h-khr-gapnote">
            <Icon name="alert-circle" size={16} />
            <span>{state === 'n' ? 'Not answered yet.' : 'The answer misses part of what guests ask.'}</span>
            <button type="button" className="h-textlink" onClick={() => (gap ? onAddFactForGap(gap) : onAddFact())}>{state === 'n' ? 'Add the answer' : 'Complete the answer'}</button>
          </p>
        )}
        <div className="h-khr2-pfield">
          <span className="h-khr2-pfield__label">Facts this answer uses</span>
          {facts.length === 0 ? <span className="h-khr2-pfield__help">None yet.</span> : (
            <div className="h-khr2-plist">
              {facts.map((f, i) => (
                <div key={f.keys.join('+') + i} className="h-khr2-plist__row">
                  <span>{factChipLabel(hub, f)}</span>
                  <button type="button" className="h-textlink" onClick={() => onEditFact(f)}>Edit</button>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="h-textlink h-khr2-pfield__link" onClick={onAddFact}>Add a fact</button>
        </div>
        <div className="h-khr2-pfield">
          <span className="h-khr2-pfield__label">Related Smart Listing tips</span>
          {tips.length === 0 ? <span className="h-khr2-pfield__help">No open tip uses these facts right now.</span> : (
            <div className="h-khr2-plist">
              {tips.map((t) => (
                <div key={t.hrefSuffix} className="h-khr2-plist__row h-khr2-plist__row--tip">
                  <span><b>{t.title}</b><small>{t.where}</small></span>
                  <Link className="h-textlink" to={`${base}${t.hrefSuffix}`}>Open</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailsDrawer>
  )
}

/** Add a question — the same drawer as Add a fact: type it or "Use voice" (canned: a short
 *  "Listening…", then a sample guest question), and an optional answer. */
const VOICE_QUESTION = 'Can we check in before 3 pm if the flat is ready?' // sample
/** `pick`: opened above the topics (the Knowledge Hub's Questions page), the topic is a dropdown first */
export function AddQuestionDrawer({ topic, pick, onClose, onAdd }: { topic: string; pick?: ReactNode; onClose: () => void; onAdd: (q: string, answer: string) => void }) {
  const [text, setText] = useState('')
  const [answer, setAnswer] = useState('')
  const [listening, setListening] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const voice = () => {
    if (listening) { window.clearTimeout(timer.current); setListening(false); return }
    setListening(true)
    timer.current = window.setTimeout(() => { setText(VOICE_QUESTION); setListening(false) }, 1500)
  }
  const ok = text.trim().length > 2 && !listening
  return (
    <DetailsDrawer open title="Add a question" onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!ok} onClick={() => onAdd(text.trim(), answer.trim())}>Add question</Button></>}>
      <div className="h-khr2-drawer">
        {pick}
        <div className="h-khr2-pfield">
          <div className="h-khr2-pfield__head">
            <span className="h-khr2-pfield__label">A question guests ask about {topic.toLowerCase()}</span>
            <Button icon="microphone" aria-pressed={listening} onClick={voice}>{listening ? 'Stop' : 'Use voice'}</Button>
          </div>
          <textarea className="h-textarea" rows={3} autoFocus value={listening ? '' : text} readOnly={listening}
            placeholder={listening ? 'Listening…' : 'e.g. Is there a hair dryer?'} aria-label="Question" onChange={(e) => setText(e.target.value)} />
        </div>
        <label className="h-khr2-pfield">
          <span className="h-khr2-pfield__label">Answer <span className="h-khr2-pfield__opt">(optional)</span></span>
          <textarea className="h-textarea" rows={4} value={answer} placeholder="Leave it empty and it shows as not answered." aria-label="Answer" onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </div>
    </DetailsDrawer>
  )
}

