/* KH-C · Overview: how many guest questions the Hub answers, per stage, and the top gaps ranked by how often guests ask.
 * Plus the "Every fact is one tab away" card that leads to Everything A–Z. All computed from the property's questions (hub.questions) and the store. */
import { Icon, KhcCard, KhcCoverage, KhcGapRow, KhcStageRow } from '../../../../ds'
import { useStore } from '../../../../store/store'
import { STAGES, TABS, type StageId } from './data'
import { AZ_GROUPS, groupItems, stageStats, type Hub } from './model'
import type { KhSectionId } from '../../../../data/v3-kh'
import { CHANNELS } from '../../../../data/channels'

export function Overview({ hub, onStage, onGap, onAllGaps }: { hub: Hub; onStage: (s: StageId) => void; onGap: (id: string) => void; onAllGaps: () => void }) {
  const cov = hub.questions.map((q) => hub.cov(q))
  const a = cov.filter((x) => x === 'a').length
  const p = cov.filter((x) => x === 'p').length
  const n = cov.filter((x) => x === 'n').length
  const top = hub.gaps.slice(0, 5)
  return (
    <div className="h-khc-stack">
      <KhcCard>
        <p className="h-khc-big"><b>{a} of {hub.questions.length}</b>guest questions have a full answer</p>
        <p className="h-khc-sub">{hub.scenario
          ? 'Questions come from 312 guest conversations in the last 12 months.'
          : 'These are the standard questions guests ask. Once guests message you, questions come from their conversations.'}</p>
        <KhcCoverage a={a} p={p} n={n} />
        <div className="h-khc-stages">
          {STAGES.map((s) => { const st = stageStats(hub, s.id); return <KhcStageRow key={s.id} label={s.label} answered={st.answered} total={st.total} gaps={st.gaps} onClick={() => onStage(s.id)} /> })}
        </div>
      </KhcCard>
      <KhcCard title="Top gaps" aside="What guests ask that the AI can’t fully answer">
        {top.length === 0 ? <p className="h-khc-empty">{hub.scenario ? 'No gaps left: every question guests ask has a full answer.' : 'No gaps yet: they appear as guests ask questions.'}</p> : (
          <div className="h-khc-gaps">
            {top.map((g) => {
              const q = hub.question(g.question)!
              const st = hub.cov(q)
              const on = g.amenity ? hub.chs.filter((c) => hub.amenityOn(g.amenity!, c)) : []
              return (
                <KhcGapRow key={g.id} state={st} question={q.q} meta={`asked ${q.asked} times · ${TABS.find((t) => t.id === q.stage)!.label}`}
                  extra={g.amenity && on.length ? `Listed on ${on.map((c) => CHANNELS[c].name).join(' and ')} only` : undefined}
                  action={<button type="button" className="h-textlink" onClick={() => onGap(g.id)}>{st === 'n' ? 'Add the answer' : 'Complete the answer'}</button>} />
              )
            })}
          </div>
        )}
        {hub.gaps.length > 0 && <button type="button" className="h-textlink" onClick={onAllGaps}>See all {hub.gaps.length} gaps</button>}
      </KhcCard>
    </div>
  )
}

/** "Every fact is one tab away": the Everything A–Z groups with their counts. */
export function AzCard({ hub, onOpen }: { hub: Hub; onOpen: (g?: KhSectionId) => void }) {
  const photos = useStore((s) => s.photoLib.base.length)
  const count = (id: KhSectionId) => (id === 'photos' ? photos : groupItems(hub, id).length)
  const total = AZ_GROUPS.reduce((t, g) => t + count(g.id), 0)
  return (
    <section className="h-khc-azcard">
      <h3 className="h-khc-azcard__title"><Icon name="book" />Every fact is one tab away</h3>
      <p>Everything A–Z lists all {total} facts by group, with where each one is used.</p>
      <div className="h-khc-chips">{AZ_GROUPS.map((g) => <button key={g.id} type="button" className="h-khc-chip" onClick={() => onOpen(g.id)}>{g.label} · {count(g.id)}</button>)}</div>
      <button type="button" className="h-textlink" onClick={() => onOpen()}>Open Everything A–Z</button>
    </section>
  )
}
