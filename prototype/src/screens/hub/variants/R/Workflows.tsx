/* KH-R · Workflows — a CONCEPT (Antonio, 3 Oct: "simplify… this is just a concept… make sure that you don't allow
 * anything to happen, any interaction happen in the workflow section"). What the AI could do when a guest needs a
 * process, not just a fact lookup, shown as a static gallery of example workflows: no editor, no test drawer, no
 * create/template buttons, no links. Cards are the Content page's topic card exactly (".h-khr-tplcard
 * .h-khr-ov2-topiccard" in ".h-khr-tplgrid"), rendered as static <article>s. `/hub/workflows/:id` renders this same
 * gallery. Content: WORKFLOW_TEMPLATES (workflows-data.ts, SIMULATED). */
import { KhrFrame, KhrWorkflowConceptCard } from '../../../../ds'
import { useProperty } from '../../../../shell/PropertyLayout'
import { WORKFLOW_TEMPLATES } from './workflows-data'

export function Workflows() {
  const p = useProperty()
  return (
    <KhrFrame title="Workflows" property={p} desc="What the AI could do when a guest needs a process, not just a fact: early check-in, a lost key, something broken.">
      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">{WORKFLOW_TEMPLATES.length} workflows</h2>
      </div>
      <div className="h-khr-tplgrid h-khr-ov2-topicgrid">
        {WORKFLOW_TEMPLATES.map((t) => <KhrWorkflowConceptCard key={t.id} icon={t.icon} meta={t.category} title={t.title} desc={t.desc} />)}
      </div>
    </KhrFrame>
  )
}
