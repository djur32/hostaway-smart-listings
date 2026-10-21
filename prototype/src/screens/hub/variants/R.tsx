/* Knowledge Hub iteration R — the entry (concepts/knowledge-hub/KH-NEXT.md, concepts/knowledge-hub/R-BRIEF.md).
 * review, 3 Oct: no Overview any more — `/hub` opens Content (the nine topics); a topic is its own page with
 * Questions · Facts tabs and the Test panel docked beside them; Workflows and Sources render their own page frame.
 * Every page is a Concept (ds/kh-r.tsx KhrFrame). No `?v=` needed — `/hub` (and `?v=r`) render this. */
import { Navigate, useSearchParams } from 'react-router-dom'
import { useProperty } from '../../../shell/PropertyLayout'
import { Overview } from './R/Overview'
import { Sources } from './R/Sources'
import { Workflows } from './R/Workflows'

export function VariantR(props: { tab?: string; sub?: string }) {
  const { tab } = props
  const p = useProperty()
  const [q] = useSearchParams()
  if (!tab) return <Navigate replace to={`/property/${p.id}/hub/content${q.toString() ? `?${q}` : ''}`} />
  if (tab === 'workflows') return <Workflows />
  if (tab === 'sources') return <Sources />
  return <Overview tab={tab} />
}
