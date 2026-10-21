/* Settings › How Hostaway helps you · owner S12 · R-130 R-131 R-132 R-135 · D-150
 * Where persona modes stop being a demo control and become a product setting. We never tell a host "you are a Family
 * host": we show a preset, the signals that chose it, and every default it sets, each one changeable. Behaviour can
 * *suggest* a change; it never switches the mode silently. Capability is identical in every preset. */
import { Link } from 'react-router-dom'
import { Dropdown, Explainer, Icon, PageHeader, Segmented, useMode } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { MODES, PERSONAS } from '../../data/personas'
import type { Autonomy, ChannelId, PersonaId } from '../../data/types'
import { useStore } from '../../store/store'
import { Page } from '../../shell/AppShell'

const SIGNAL: Record<PersonaId, Array<[string, string]>> = {
  P1: [['At sign-up you said', '1–2 properties'], ['Channels connected', 'Airbnb, Booking.com'], ['Before Hostaway', 'Managed on Airbnb, Booking.com copied from it']],
  P2: [['At sign-up you said', '3–10 properties'], ['Channels connected', 'Airbnb, Booking.com, Direct'], ['What you do here', 'You edit listing text most weeks']],
  P3: [['At sign-up you said', '11–24 properties, with a team'], ['Properties in Hostaway', '12, imported in batches'], ['Team', '4 people: ops manager, listing coordinator, 2 VAs']],
  P4: [['At sign-up you said', '1–2 properties'], ['Before Hostaway', 'Hostaway, one listing on Airbnb'], ['Joined', 'Recently. Your listing is already here']],
}

/** Smart Listings' words for what the AI may do (v3: tips you review, or Autopilot). */
const AI_MODE: Record<Autonomy, string> = { suggest: 'Tips you review', 'auto-review': 'Autopilot, with review', autopilot: 'Autopilot' }
/** Start pages a host can pick (one entry per page, not per preset). */
const START_PAGES = [
  { value: PERSONAS.P1.landing, label: 'Property › Overview' },
  { value: PERSONAS.P2.landing, label: 'Channels › Airbnb' },
  { value: PERSONAS.P3.landing, label: 'Properties' },
]

export function Guidance() {
  const s = useStore()
  const m = useMode()
  const spec = MODES[m.persona]
  const d = PERSONAS[m.persona]
  return (
    <Page>
      <PageHeader title="How Hostaway helps you" sub="Settings · for you only. Your team keeps their own" />
      <div className="p-grid-2 p-mt6">
        <div>
          <section className="p-card">
            <div className="p-label">Your preset</div>
            {/* the persona as a product setting (D-150): the demo's persona box is only shown in demo mode (QA B08) */}
            <Dropdown className="p-mt2" label="Your preset" value={m.persona} onChange={(v) => s.setPersona(v as PersonaId)}
              options={(Object.keys(MODES) as PersonaId[]).map((id) => ({ value: id, label: MODES[id].preset }))} />
            <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>Chosen from your sign-up answers:</p>
            <table className="h-table p-mt3"><tbody>{SIGNAL[m.persona].map(([k, v]) => <tr key={k}><td className="h-muted" style={{ width: 200 }}>{k}</td><td>{v}</td></tr>)}</tbody></table>
            <p className="h-caption h-muted" style={{ margin: '8px 0 0' }}>A preset only sets defaults. Every feature is available in every preset.</p>
          </section>

          <div className="h-section" style={{ paddingTop: 'var(--space-6)' }}>
            <div className="h-h4">What it sets, and how to change it</div>
            {/* QA B21: stacked fields (label, help, then the control), as everywhere else */}
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">Explanations</p><p className="h-field-row__help">Coach marks and “why” notes where a step might be new to you.</p></div>
              <div className="h-field-row__control"><Segmented label="Explanations" value={m.hints} onChange={(v) => s.setModeOverride({ hints: v })} items={[{ id: 'more', label: 'More' }, { id: 'fewer', label: 'Fewer' }, { id: 'none', label: 'None' }]} /></div></div>
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">Density</p><p className="h-field-row__help">Compact fits more rows in tables.</p></div>
              <div className="h-field-row__control"><Segmented label="Density" value={m.density} onChange={(v) => s.setModeOverride({ density: v })} items={[{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }]} /></div></div>
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">Start page</p><p className="h-field-row__help">Where you land after signing in.</p></div>
              <div className="h-field-row__control"><Dropdown label="Start page" value={m.landing} onChange={(v) => s.setModeOverride({ landing: v })} options={START_PAGES} /></div></div>
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">Smart Listings</p><p className="h-field-row__help">{spec.voice}. Each channel’s listing uses the Base text or its own, in any preset.</p></div>
              <div className="h-field-row__control"><Link className="h-link h-small" to="/property/neukolln/smart/strategy">Open Smart Listings</Link></div></div>
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">What the AI may do</p><p className="h-field-row__help">Per channel, in Smart Listings › Strategy. Inside portfolio rules for groups. Facts, prices and stay rules are never AI-applied.</p></div>
              <div className="h-field-row__control"><div className="p-col" style={{ gap: 4 }}>{(Object.entries(d.copyAutonomy) as Array<[ChannelId, Autonomy]>).map(([c, a]) => <span key={c} className="h-small">{CHANNELS[c].name}: <b>{AI_MODE[a]}</b></span>)}</div></div></div>
            <div className="h-field-row h-field-row--stacked"><div><p className="h-field-row__label">Words</p><p className="h-field-row__help">{spec.vocabulary}.</p></div></div>
          </div>
        </div>

        <div className="p-col">
          <Explainer title="Why presets, not personas" icon="shield-check">
            Hostaway adapts defaults and explanations, never what you can do. It doesn’t label you, doesn’t hide features, and won’t switch your preset because of how you behave. If your use changes (say you start editing listing text every week), it suggests a different preset once, and you decide.
          </Explainer>
          <section className="p-card">
            <div className="p-label">Opened by default</div>
            <p className="h-small" style={{ margin: '6px 0 0' }}>{spec.open.join(' · ')}</p>
            {spec.collapsed.length > 0 && <><div className="p-label p-mt3">One click away</div><p className="h-small" style={{ margin: '6px 0 0' }}>{spec.collapsed.join(' · ')}</p></>}
          </section>
          {Object.keys(s.modeOverrides).length > 0 && <p className="h-caption"><Icon name="circle-check" size={16} /> You changed {Object.keys(s.modeOverrides).length} default{Object.keys(s.modeOverrides).length === 1 ? '' : 's'}. <button className="h-inherit__act" onClick={() => s.setPersona(m.persona)}>Back to the preset</button></p>}
        </div>
      </div>
    </Page>
  )
}
