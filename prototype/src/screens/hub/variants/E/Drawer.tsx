/* KH-E · the right drawer, two tabs (Paper KH-E3): Ask answers as a guest of one channel, from that channel's values,
 * citing the facts it used; Sources lists what the Hub was built from, with dates and how many facts each gave. */
import { useEffect, useState } from 'react'
import { AskBubble, AskInput, AskList, AskReply, Button, ChannelSelect, DrawerLead, KheDrawer, SourceCard, type DrawerTab } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import type { HubDraft } from '../../model'
import { GENERIC_QUESTIONS, matchGeneric, useHubPid, useIsScenario, useListingChannels } from '../../perProperty'
import { OFTEN, QUESTIONS, newSourcesFor, type ESource, type Lens } from './data'
import { answer, genericReply, type Answer } from './ask'

export function Drawer({ tab, onTab, onClose, lens, d, sources, setSources, onAddFact }: {
  tab: DrawerTab; onTab: (t: DrawerTab) => void; onClose: () => void; lens: Lens; d: HubDraft
  sources: ESource[]; setSources: (s: ESource[]) => void; onAddFact: () => void
}) {
  return (
    <KheDrawer tab={tab} onTab={onTab} onClose={onClose}>
      {tab === 'ask' ? <Ask lens={lens} d={d} onAddFact={onAddFact} /> : <Sources sources={sources} setSources={setSources} />}
    </KheDrawer>
  )
}

/** The questions Ask offers: Neukölln's scripted set, or the generic one (perProperty) for any other property.
 *  Generic: opens on the cleaning fee (it can differ by channel); "Guests often ask" check-in, Wi-Fi and pets. */
function questionSet(scenario: boolean, d: HubDraft): {
  first: { q: string; id: string }; often: string[]; all: Array<{ id: string; q: string }>
  answer: (id: string, c: ListingChannel) => Answer; match: (q: string) => string | null
} {
  if (scenario) return {
    first: { q: QUESTIONS[0].q, id: 'clean' }, often: OFTEN, all: QUESTIONS,
    answer: (id, c) => answer(id as (typeof QUESTIONS)[number]['id'], c, d), match: (q) => QUESTIONS.find((x) => x.match.test(q))?.id ?? null,
  }
  const clean = GENERIC_QUESTIONS.find((x) => x.id === 'cleaning')!
  return {
    first: { q: clean.q, id: clean.id }, often: ['checkin', 'wifi', 'pets'], all: GENERIC_QUESTIONS,
    answer: (id, c) => genericReply(id, c, d), match: (q) => matchGeneric(q)?.id ?? null,
  }
}

function Ask({ lens, d, onAddFact }: { lens: Lens; d: HubDraft; onAddFact: () => void }) {
  const channels = useListingChannels()
  const qs = questionSet(useIsScenario(), d)
  const [as, setAs] = useState<ListingChannel>(lens === 'base' ? channels[0] ?? 'airbnb' : lens)
  useEffect(() => { if (lens !== 'base') setAs(lens) }, [lens])
  const [asked, setAsked] = useState<{ q: string; id: string | null }>(qs.first)
  const a = asked.id ? qs.answer(asked.id, as) : null
  const pick = (id: string) => { const q = qs.all.find((x) => x.id === id)!; setAsked({ q: q.q, id: q.id }) }
  return (
    <>
      <DrawerLead>Test how your AI answers guests. Answers read the values of the channel you pick.</DrawerLead>
      <div className="khe-field__head khe-askas">
        <p className="khe-field__label">Answer as</p>
        <ChannelSelect label="Answer as" value={as} channels={channels} onChange={(c) => setAs(c as ListingChannel)} suffix="guest" />
      </div>
      <AskBubble>{asked.q}</AskBubble>
      {a ? (
        <AskReply channel={as} facts={a.facts}
          compare={a.compare ? <><span>{a.compare.text}</span><button type="button" className="h-textlink" onClick={() => setAs(a.compare!.c)}>Compare</button></> : undefined}>
          {a.text}
        </AskReply>
      ) : (
        <AskReply channel={as} facts={[]} compare={<><span>Add it once and every channel’s guests get the answer.</span><button type="button" className="h-textlink" onClick={onAddFact}>Add a custom fact</button></>}>
          I can’t find this in the Knowledge Hub yet, so I’d ask you before replying.
        </AskReply>
      )}
      <AskList title="Guests often ask" items={qs.often.map((id) => ({ id, q: qs.all.find((x) => x.id === id)!.q }))} onPick={pick} />
      <AskInput onAsk={(q) => setAsked({ q, id: qs.match(q) })} />
    </>
  )
}

function Sources({ sources, setSources }: { sources: ESource[]; setSources: (s: ESource[]) => void }) {
  const [adding, setAdding] = useState(false)
  const pid = useHubPid()
  return (
    <>
      <DrawerLead>What the Hub was built from. Guests never see these; your AI replies read the Hub.</DrawerLead>
      <div className="khe-sources">
        {sources.map((s) => (
          <SourceCard key={s.id} icon={s.icon} name={s.name} sub={s.sub} when={s.when} facts={s.facts}
            menu={[
              { label: 'Update now', onClick: () => setSources(sources.map((x) => (x.id === s.id ? { ...x, when: 'Updated just now' } : x))) },
              { label: 'Remove source', onClick: () => setSources(sources.filter((x) => x.id !== s.id)) },
            ]} />
        ))}
      </div>
      {adding ? (
        <div className="khe-newsource">
          {newSourcesFor(pid).map((n) => (
            <Button key={n.id} icon={n.icon} block onClick={() => { setSources([...sources, { id: `${n.id}-${sources.length}`, ...n.card }]); setAdding(false) }}>{n.label}</Button>
          ))}
          <button type="button" className="h-textlink" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      ) : <Button icon="plus" block onClick={() => setAdding(true)}>Add source</Button>}
      <p className="khe-drawer__foot">A PDF, a link or your TouchStay guidebook. New facts arrive as suggestions in their tab.</p>
    </>
  )
}
