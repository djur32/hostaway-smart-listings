/* Channels › {channel} › Booking policies › Configure: a full-page step flow (Hostaway replica, the reference screens 15–21).
 * Routes (outside the app shell, like the import flow):
 *   /property/:id/ch/:channel/policies/configure/:step   cancellation · Airbnb: policy → non-refundable → review · Direct: policy → review
 *   /property/:id/ch/:channel/policies/long-term/:step   Airbnb long-term stays (28+ nights): policy → review
 *   /property/:id/ch/:channel/policies/instant-book      old link: Instant book moved to ch/:channel/availability?tab=instant-book
 *   /property/:id/ch/:channel/policies/availability      old link: availability rules moved to their own page (ch/:channel/availability)
 * The draft lives in sessionStorage (keyed by property + channel + flow) until Confirm (store: setChannelPolicy), so a
 * reload on any step keeps it and Confirm saves what Review shows (QA B14). Confirm and Cancel clear it.
 * Chrome = the shared full-screen wizard (ds/wizard.tsx, the Strategy wizard's): back · centred title · ×, brand progress
 * line, 800px question column, compact choice cards, Back / Continue footer, every step fits 1440×900 and 1280×800
 * without scrolling ("homogenize the UI according to the other ones … no need to have things overflowing"). */
import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { NumberField, Pill, TopToast, useIsMobile, Wizard, WizardChoice, WizardChoices, WizardFoot, WizardQuestion, WizardSummary } from '../../../ds'
import { HelpLink, HelpNote, InfoBox } from '../../../ds/policy'
import { propertyById } from '../../../data/portfolio'
import { PROPERTY_ID } from '../../../data/scenario'
import { isListingChannel, type ListingChannel } from '../../../data/sl3'
import { AIRBNB_LONG_TERM, POLICY_DEFAULT, POLICY_MODEL, cancellationOptions, optionById, type ChannelPolicy } from '../../../data/policies'
import { useStore } from '../../../store/store'
import { CH_NAME } from '../common'

const AIRBNB_HELP = 'https://www.airbnb.com/help'

/** The channel's saved policies (store over the listing's defaults). */
export function useChannelPolicy(c: ListingChannel): ChannelPolicy {
  const saved = useStore((s) => s.policies?.[c])
  return saved ?? POLICY_DEFAULT[c]
}

type FlowId = 'configure' | 'long-term'
const FLOW_NAME: Record<FlowId, string> = { configure: 'Cancellation policy', 'long-term': 'Long-term stays' }
/** The wizard bar's title: "Airbnb cancellation policy", "Airbnb long-term stay policy". */
const FLOW_TITLE: Record<FlowId, string> = { configure: 'cancellation policy', 'long-term': 'long-term stay policy' }

function stepsFor(flow: FlowId, c: ListingChannel): string[] {
  if (flow === 'configure') return c === 'airbnb' ? ['policy', 'non-refundable', 'review'] : ['policy', 'review']
  return ['policy', 'review'] // long-term
}

export function PolicyFlow() {
  const { id, channel, flow, step } = useParams()
  const p = propertyById(id) ?? propertyById(PROPERTY_ID)!
  const ch = isListingChannel(channel) ? channel : 'airbnb'
  const page = `/property/${p.id}/ch/${ch}/policies`
  // Availability rules and Instant book have their own page now (Channels › {channel} › Availability): old Configure links land there
  if (flow === 'availability') return <Navigate to={`/property/${p.id}/ch/${ch}/availability`} replace />
  if (flow === 'instant-book') return <Navigate to={`/property/${p.id}/ch/${ch}/availability?tab=instant-book`} replace />
  const f = flow as FlowId
  if (!isListingChannel(channel) || !(f in FLOW_NAME)) return <Navigate to={page} replace />
  const c = channel
  // Booking.com cancellation lives in the Extranet; long-term stays are Airbnb's only.
  if ((f === 'configure' && POLICY_MODEL[c] === 'extranet') || (f === 'long-term' && c !== 'airbnb')) return <Navigate to={page} replace />
  const steps = stepsFor(f, c)
  if (steps.length > 1 && !steps.includes(step ?? '')) return <Navigate to={`${page}/${f}/${steps[0]}`} replace />
  return <Flow key={`${c}:${f}`} c={c} flow={f} steps={steps} step={steps.length > 1 ? step! : 'edit'} page={page} draftKey={`hostaway-proto:policy-draft:${p.id}:${c}:${f}`} />
}

/** The flow's draft in sessionStorage (try/catch: private windows fall back to memory only). */
function readDraft(key: string): ChannelPolicy | null {
  try { const v = sessionStorage.getItem(key); return v ? (JSON.parse(v) as ChannelPolicy) : null } catch { return null }
}
function writeDraft(key: string, d: ChannelPolicy | null) {
  try { if (d) sessionStorage.setItem(key, JSON.stringify(d)); else sessionStorage.removeItem(key) } catch { /* memory only */ }
}

function Flow({ c, flow, steps, step, page, draftKey }: { c: ListingChannel; flow: FlowId; steps: string[]; step: string; page: string; draftKey: string }) {
  const nav = useNavigate()
  const saved = useChannelPolicy(c)
  const setPolicy = useStore((s) => s.setChannelPolicy)
  const [draft, setDraft] = useState<ChannelPolicy>(() => ({ ...saved, ...readDraft(draftKey) }))
  useEffect(() => { writeDraft(draftKey, draft) }, [draftKey, draft])
  const isMobile = useIsMobile()
  const [toast, setToast] = useState(false) // phones: an out-of-range discount is reported on Continue, in the top toast (ds/mobile.md §7)
  const name = CH_NAME[c]
  const i = steps.indexOf(step)
  const last = i === steps.length - 1
  const go = (s: string) => nav(`${page}/${flow}/${s}`)
  const cancel = () => { writeDraft(draftKey, null); nav(page) }
  const confirm = () => {
    // only the fields this flow edits, over what's saved now (a kept draft can't undo the other flow's change)
    setPolicy(c, flow === 'configure' ? { ...saved, cancellation: draft.cancellation, nonRefundable: draft.nonRefundable } : { ...saved, longTerm: draft.longTerm })
    writeDraft(draftKey, null)
    nav(page)
  }
  const pctBad = draft.nonRefundable.enabled && (draft.nonRefundable.pct < 1 || draft.nonRefundable.pct > 99)
  const next = () => {
    if (step === 'non-refundable' && pctBad) { setToast(true); return }
    setToast(false)
    return last ? confirm() : go(steps[i + 1])
  }
  // as in the Strategy wizard: Back on the first step leaves (it was Cancel); × and Escape leave from any step
  const back = () => { setToast(false); if (i > 0) go(steps[i - 1]); else cancel() }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  // desktop disables Continue while the step is invalid; phones keep it live and explain in the top toast instead
  const frame = (title: string, sub: ReactNode | undefined, body: ReactNode, nextDisabled?: boolean) => (<>
    <Wizard title={`${name} ${FLOW_TITLE[flow]}`} progress={(i + 1) / steps.length} onBack={back} onClose={cancel}
      foot={<WizardFoot onBack={back} onNext={next} nextLabel={last ? 'Confirm' : 'Continue'} nextDisabled={nextDisabled && !isMobile} />}>
      <WizardQuestion title={title} sub={sub}>{body}</WizardQuestion>
    </Wizard>
    <TopToast open={toast && pctBad} message={`The non-refundable discount must be from 1% to 99% for ${name}.`} onDismiss={() => setToast(false)} />
  </>)
  const current = (id: string) => (id === saved[flow === 'configure' ? 'cancellation' : 'longTerm'] ? <Pill kind="neutral">Current</Pill> : undefined)
  const choices = (field: 'cancellation' | 'longTerm', label: string, options: typeof AIRBNB_LONG_TERM) => (
    // many options (Airbnb 4, Direct 5) sit two to a row so the step fits one view; a short list stays one column
    <WizardChoices label={label} cols={options.length > 3 ? 2 : 1}>
      {options.map((o) => (
        <WizardChoice key={o.id} name={field} title={o.label} desc={o.body} tag={current(o.id)}
          checked={draft[field] === o.id} onChange={() => setDraft({ ...draft, [field]: o.id })} />
      ))}
    </WizardChoices>
  )
  const policyRow = (label: string, o: { label: string; body: string }, editTo: string) => ({
    label, value: <><strong>{o.label}</strong><br />{o.body}</>, onEdit: () => go(editTo), editLabel: `Edit ${label.toLowerCase()}`,
  })

  /* ---------- cancellation ---------- */
  if (flow === 'configure') {
    const options = cancellationOptions(c)
    const cur = optionById(options, draft.cancellation)
    if (step === 'policy') return frame('Select cancellation policy', 'This policy determines when guests can cancel and what refund they’ll receive.',
      choices('cancellation', 'Cancellation policy', options))
    if (step === 'non-refundable') {
      const nr = draft.nonRefundable
      return frame('Configure non-refundable option', 'Offer guests a discounted rate in exchange for a non-refundable booking.', <>
        <WizardChoices label="Non-refundable option">
          <WizardChoice type="checkbox" name="non-refundable" title="Enable non-refundable option" checked={nr.enabled}
            desc="Guests can choose between your standard policy or a non-refundable rate at a discount"
            onChange={(v) => setDraft({ ...draft, nonRefundable: { ...nr, enabled: v } })}
            more={<div className="h-wz-group">
              <p className="h-wz-label" id="nr-pct">Discount percentage</p>
              <div className="h-pct-field">
                {/* NumberField (ds/v3-ch.tsx): the shared stepper + Up/Down keys every numeric field now has
                   . Same 0–100 clamp and same `pctBad` error as before. */}
                <NumberField label="Discount percentage" value={String(nr.pct)} unit="%" min={1} max={99} invalid={pctBad} describedBy="nr-pct-hint"
                  onChange={(next) => setDraft({ ...draft, nonRefundable: { ...nr, pct: Math.max(0, Math.min(100, Math.round(Number(next.replace(/\D/g, '')) || 0))) } })} />
                off the standard rate
              </div>
              {pctBad ? <p className="h-wz__error" id="nr-pct-hint" role="alert">Enter a discount from 1% to 99%.</p>
                : <p className="h-wz-hint" id="nr-pct-hint">Guests who choose this rate cannot cancel for any refund.</p>}
            </div>} />
        </WizardChoices>
        <InfoBox><HelpLink plain href={AIRBNB_HELP}>Learn more about non-refundable rates</HelpLink></InfoBox>
      </>, pctBad)
    }
    // review
    const nr = draft.nonRefundable
    return frame('Review your settings', undefined, <>
      <WizardSummary channels={[c]} title={`${name} · ${FLOW_NAME[flow]}`} rows={[
        policyRow(c === 'airbnb' ? 'Standard policy' : 'Cancellation policy', cur, 'policy'),
        ...(c === 'airbnb' ? [{
          label: 'Non-refundable option', onEdit: () => go('non-refundable'), editLabel: 'Edit non-refundable option',
          value: nr.enabled ? <><strong>Enabled</strong><br />Guests can book at {nr.pct}% off the standard rate. Guests who choose this option cannot cancel for any refund.</>
            : <><strong>Not enabled</strong><br />Guests book with your standard cancellation policy only.</>,
        }] : []),
      ]} />
      {c === 'direct' && <InfoBox>This policy applies to every booking made on your direct booking site. Guests see it before they pay.</InfoBox>}
    </>)
  }

  /* ---------- long-term stays (Airbnb) ---------- */
  const cur = optionById(AIRBNB_LONG_TERM, draft.longTerm)
  if (step === 'policy') return frame('Select long-term stay policy',
    <>For bookings of 28 nights or more. To understand the full policies, go to the <HelpLink href={AIRBNB_HELP}>Help Center</HelpLink>.</>,
    choices('longTerm', 'Long-term stay policy', AIRBNB_LONG_TERM))
  return frame('Review your policy', undefined, <>
    <WizardSummary channels={[c]} title={`${name} · Long-term stays (28+ nights)`} rows={[policyRow('Long-term policy', cur, 'policy')]} />
    <InfoBox>This policy will apply to all Airbnb bookings of 28 nights or more. Guests will see this policy when booking your property for extended stays.</InfoBox>
    <HelpNote>For more details about long-term stay policies, visit the <HelpLink href={AIRBNB_HELP}>Airbnb Help Center</HelpLink>.</HelpNote>
  </>)
}
