/* Knowledge Hub, reframed (plan/notion-v2/deck-review/KH-REFRAME.md, Antonio 4 Oct) — the entry. The Hub has its own
 * job now: it learns from the questions guests ask. Questions · Insights · Facts (read from the Listing base) · Sources,
 * plus the tips a gap becomes. `/hub` (and `?v=q`) render this; iteration R stays reachable with `?v=r`.
 * Routes: /hub → /hub/questions · /hub/questions/:id · /hub/insights · /hub/facts · /hub/sources.
 * Old links land somewhere sensible: /hub/content and /hub/workflows → Questions; a topic or an old section id
 * (/hub/arrival, /hub/rooms, /hub/location… from Canvas and the field captions) → Facts with that topic in view. */
import { Navigate, useSearchParams } from 'react-router-dom'
import { useProperty } from '../../../shell/PropertyLayout'
import { isRTopic, type RTopicId } from './R/data'
import { QuestionsPage } from './Q/Questions'
import { QuestionPage } from './Q/Question'
import { InsightsPage } from './Q/Insights'
import { FactsPage } from './Q/Facts'
import { SourcesPage } from './Q/Sources'

/** An old section id (iterations A–E, S, Canvas locks) → the topic that holds those facts now. */
const OLD: Record<string, RTopicId> = {
  property: 'amenities', rooms: 'amenities', descriptions: 'amenities', photos: 'amenities', location: 'transport',
  pricing: 'rules', availability: 'rules', policies: 'rules', custom: 'arrival',
}

export function VariantQ({ tab, sub }: { tab?: string; sub?: string }) {
  const p = useProperty()
  const [q] = useSearchParams()
  const go = (path: string, extra?: Record<string, string>) => {
    const n = new URLSearchParams(q)
    n.delete('v')
    for (const [k, v] of Object.entries(extra ?? {})) n.set(k, v)
    const s = n.toString()
    return <Navigate replace to={`/property/${p.id}/hub/${path}${s ? `?${s}` : ''}`} />
  }
  if (!tab || tab === 'content' || tab === 'workflows' || tab === 'overview') return go('insights')
  if (tab === 'questions') return sub ? <QuestionPage key={sub} id={sub} /> : <QuestionsPage />
  if (tab === 'insights') return <InsightsPage />
  if (tab === 'facts') return <FactsPage />
  if (tab === 'sources') return <SourcesPage />
  const topic = isRTopic(tab) ? tab : OLD[tab]
  return go('facts', topic ? { topic } : undefined)
}
