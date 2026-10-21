/* KH-C · the two side panels. Sources: where answers come from (was a stacked accordion, HS-L07). Gaps: adding knowledge
 * starts from a question guests ask that the AI can't fully answer (was "Add new item"). One panel open at a time; the
 * Gaps panel is the Smart Listing tip container: x of n, one primary action, Dismiss. */
import { useState } from 'react'
import {
  Button, ChannelBadge, Dropdown, Icon, IconButton, KhcAiWho, KhcLabel, KhcNote, KhcPager, KhcPanel, KhcQuote, KhcSec, KhcSource, KhcStatePill, KhcUse,
} from '../../../../ds'
import { KH_SECTIONS, type KhSectionId } from '../../../../data/v3-kh'
import type { ListingChannel } from '../../../../data/sl3'
import { useStore } from '../../../../store/store'
import { GAPS, TABS, factKeyOf, type Gap, type UseWho } from './data'
import { useKhc, type Hub } from './model'

/** Neukölln: its four sources (message history and guidebook included). Any other property: Property details · House
 *  rules, imported from its listings; no message history until guests write. */
export function SourcesPanel({ hub, onClose }: { hub: Hub; onClose: () => void }) {
  return (
    <KhcPanel title={`Sources · ${hub.sources.length}`} onClose={onClose}>
      <p className="h-khc-panel__intro">Where the answers come from. Each answer names the sources it used.</p>
      <div className="h-khc-sources">
        {hub.sources.map((s) => {
          const n = hub.sourceCount(s.id)
          return <KhcSource key={s.id} icon={s.icon} name={s.name} desc={s.desc} meta={`${n} ${n === 1 ? 'answer' : 'answers'} · ${s.when}`} action={<IconButton icon="dots" label={`More for ${s.name}`} />} />
        })}
      </div>
      <p className="h-khc-addlink"><Icon name="plus" /><button type="button" className="h-textlink">Add a source</button></p>
    </KhcPanel>
  )
}

const GROUPS = KH_SECTIONS.filter((s) => s.id !== 'photos' && s.id !== 'policies')
const groupLabel = (id: KhSectionId) => KH_SECTIONS.find((s) => s.id === id)!.label

export function GapsPanel({ hub, gapId, onGo, onClose, onAdded }: { hub: Hub; gapId: string | null; onGo: (id: string | null) => void; onClose: () => void; onAdded: (text: string) => void }) {
  const list = hub.gaps
  const idx = Math.max(0, list.findIndex((g) => g.id === gapId))
  const g = list[idx]
  const nextOf = () => list[idx + 1]?.id ?? list[idx - 1]?.id ?? null
  if (!g) return (
    <KhcPanel title="Gaps" onClose={onClose}>
      {hub.scenario
        ? <div className="h-khc-done"><Icon name="circle-check" /><b>No gaps left</b><p>Every question guests ask has an answer. New gaps show up here as guests ask new things.</p></div>
        : <div className="h-khc-done"><Icon name="circle-check" /><b>No gaps yet</b><p>Gaps appear here as guests ask questions the Hub can’t fully answer.</p></div>}
    </KhcPanel>
  )
  return <GapCard key={g.id} hub={hub} g={g} idx={idx + 1} total={list.length} onPrev={() => onGo(list[idx - 1]?.id ?? g.id)} onNext={() => onGo(list[idx + 1]?.id ?? g.id)}
    onClose={onClose} onResolved={(text) => { const n = nextOf(); if (text) onAdded(text); onGo(n) }} />
}

function GapCard({ hub, g, idx, total, onPrev, onNext, onClose, onResolved }: {
  hub: Hub; g: Gap; idx: number; total: number; onPrev: () => void; onNext: () => void; onClose: () => void; onResolved: (text: string | null) => void
}) {
  const q = hub.question(g.question)!
  const state = hub.cov(q)
  const [text, setText] = useState(g.draft)
  const [group, setGroup] = useState<KhSectionId>(g.group as KhSectionId)
  const [fact, setFact] = useState(g.fact)
  const [uses, setUses] = useState<Record<string, boolean>>(() => Object.fromEntries(g.uses.map((u) => [u.who, true])))
  const facts = [g.fact, ...hub.items.filter((i) => i.section === group && i.label !== g.fact).map((i) => i.label)]
  const stage = TABS.find((t) => t.id === q.stage)!.label
  const add = () => {
    const st = useStore.getState()
    const on = g.uses.filter((u) => uses[u.who] && !u.fixed).map((u) => u.who)
    if (g.amenity) for (const c of on) if (c !== 'ai') st.sl3Custom(c, `amenity:${g.amenity}`, 'on')
    st.sl3Base(factKeyOf(g), text.trim())
    useKhc.getState().fill(g.id, { text: text.trim(), group, fact, uses: g.uses.filter((u) => uses[u.who]).map((u) => u.who) as UseWho[] })
    onResolved(`Added to ${groupLabel(group)} › ${fact}. Your AI replies use it right away.`)
  }
  return (
    <KhcPanel title="Gaps" wide onClose={onClose} nav={<KhcPager idx={idx} total={total} onPrev={onPrev} onNext={onNext} />}
      foot={<><Button kind="ghost" onClick={() => { useKhc.getState().dismiss(g.id); onResolved(null) }}>Dismiss</Button><Button kind="primary" disabled={!text.trim()} onClick={add}>{state === 'n' ? 'Add the answer' : 'Complete the answer'}</Button></>}>
      <div className="h-khc-gaphead"><KhcStatePill state={state} />{stage}</div>
      <div><h3 className="h-khc-gapq">{q.q}</h3><p>Asked {q.asked} times in the last 12 months</p></div>
      <div className="h-khc-quotes">{g.messages.map((m) => <KhcQuote key={m.text} text={m.text} channel={m.c} when={m.when} />)}</div>
      <div className="h-khc-now"><KhcLabel>The AI answers now</KhcLabel><p>“{g.aiNow}”</p></div>
      <KhcSec title="Your answer">
        <textarea className="h-textarea" rows={4} value={text} aria-label="Your answer" onChange={(e) => setText(e.target.value)} />
        <KhcNote>{g.draftNote}</KhcNote>
      </KhcSec>
      <KhcSec title="Where it goes" sub={g.why}>
        <div className="h-khc-where">
          <label>Group<Dropdown label="Group" value={groupLabel(group)} options={GROUPS.map((s) => s.label)} onChange={(l) => { setGroup(GROUPS.find((s) => s.label === l)!.id); setFact(g.fact) }} /></label>
          <label>Fact<Dropdown label="Fact" value={fact} options={facts} onChange={setFact} /></label>
        </div>
      </KhcSec>
      <KhcSec title="Where it will be used">
        <div className="h-khc-uses">
          {g.uses.map((u) => (
            <KhcUse key={u.who} checked={!!uses[u.who]} disabled={u.fixed} onChange={(v) => setUses({ ...uses, [u.who]: v })}
              who={u.who === 'ai' ? <KhcAiWho /> : <ChannelBadge channel={u.who as ListingChannel} />} what={u.what} />
          ))}
        </div>
      </KhcSec>
    </KhcPanel>
  )
}
export const firstGap = (hub: Hub) => hub.gaps[0]?.id ?? (hub.scenario ? GAPS[0].id : 'none')
