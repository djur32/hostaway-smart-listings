/* SCR-05 · Properties › Groups · Rules · Activity · owner S12 (the Grid view was retired 3 Oct: /portfolio → the Properties list)
 * R-115 R-116 R-133 R-134 · D-110 rule 10 · D-150 D-151 D-152 D-153 D-154 · F-P1
 * Bulk lives on Properties (IA-R rule 10): groups that hold
 * inheritable defaults, rules, and an owner log. Built for 200 rows: sticky header and first column, one line per
 * property, compact density for P3. */
import { PageHeader, Tabs } from '../../ds'
import { Page } from '../../shell/AppShell'
import { Activity } from './Activity'
import { Groups } from './Groups'
import { Rules } from './Rules'

export const PROPERTIES_TABS = [
  { label: 'List', to: '/', end: true },
  { label: 'Groups', to: '/portfolio/groups' }, { label: 'Rules', to: '/portfolio/rules' }, { label: 'Activity', to: '/portfolio/activity' },
]

export function Portfolio({ view }: { view: 'groups' | 'rules' | 'activity' }) {
  return (
    <Page wide>
      <PageHeader title="Properties" />
      <div className="p-mt4"><Tabs items={PROPERTIES_TABS} /></div>
      <div className="p-pf">{view === 'groups' ? <Groups /> : view === 'rules' ? <Rules /> : <Activity />}</div>
    </Page>
  )
}

