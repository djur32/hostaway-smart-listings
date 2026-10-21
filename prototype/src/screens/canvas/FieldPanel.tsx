/* WS-CV · the Canvas's field panel ("the solution has to be in the sidebar… distinguish what is a tip
 * versus the field itself"). Tapping an area on the replica opens this in the one right-hand slot. 2nd pass (3 Oct):
 *   (b) a field with a tip shows ONLY the tip card — the same purple TipCard as the Tips panel, Accept / Dismiss doing
 *       what they do there; no field, no Uses the Base / Custom row;
 *   (a) otherwise the field exactly as Classic renders it — Classic's own FieldRow (screens/channel/FieldRow.tsx),
 *       reading the Canvas draft through the same DraftProvider (scope caption, Customize / Use the Base, visibility,
 *       the one Discard / Save bar);
 *   (c) the orange Rewrite-with-AI card (SmartifyPanel, embedded) under the field only once the trigger on the panel's
 *       title row is clicked (CanvasView renders it from useFieldPanel) — closed by default.
 * Photos never open a panel (the full-screen Manage photos takeover instead); price lines open ./PricePanel.tsx. */
import { useState } from 'react'
import { Diff, SmartifyPanel, TipCard } from '../../ds'
import { CHANNELS } from '../../data/channels'
import { tipsFor, type FieldDef, type ListingChannel, type TipDef } from '../../data/sl3'
import { fieldByKey } from '../../data/v3-ch'
import { PHOTO_CAPTION, PHOTO_TIP_ORDER, photoUrl, type PhotoKey } from '../../data/v3-cv'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { DraftProvider, viewOf, type SectionDraft } from '../channel/common'
import { FieldRow, simulateRefine, smartifiable, type RefineVersion } from '../channel/FieldRow'
import { commitAndSend, commitPhotosAndSend, unsend } from '../push/changes'

/* ---------- (b) the field's tips ---------- */
/** The tips this panel shows for one field: those still waiting, plus any accepted while it's open (so Undo stays in
 *  reach). Smart Listings off → none. */
export function useFieldTips(channel: ListingChannel, field: string | undefined, acceptedHere: Set<string>) {
  const on = useStore((s) => s.smartListings)
  const st = useStore((s) => s.sl3.tips)
  if (!on || !field) return []
  return tipsFor(channel).filter((t) => t.field === field && (!st[t.id] || (st[t.id] === 'accepted' && acceptedHere.has(t.id))))
}

/** One field's tip card(s), x of n when there is more than one. Accept / Dismiss / Undo / alternatives are the Tips
 *  panel's own (shell/ChannelTips.tsx): Accept commits and sends that one change. `onAccepted` lets the panel drop a
 *  local draft of the same field, so the accepted value is what the field shows. */
export function FieldTips({ channel, tips, photos, onAccepted }: {
  channel: ListingChannel; tips: TipDef[]; photos?: PhotoKey[]; onAccepted: (t: TipDef) => void
}) {
  const s = useStore((x) => x.sl3)
  const act = { tip: useStore((x) => x.sl3Tip), kb: useStore((x) => x.sl3Kb), more: useStore((x) => x.sl3MoreAlts), custom: useStore((x) => x.sl3Custom) }
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<Record<string, number>>({})
  const idx = Math.min(i, Math.max(tips.length - 1, 0))
  const t = tips[idx]
  if (!t) return null
  const alts = (t.alts ?? []).slice(0, s.altsShown[t.id] ?? 0)
  const picked = pick[t.id] !== undefined ? alts[pick[t.id]] : undefined
  const many = tips.length > 1
  return (
    <TipCard
      type="Tip" idx={idx + 1} total={tips.length}
      onPrev={many ? () => setI(Math.max(0, idx - 1)) : undefined} onNext={many ? () => setI(Math.min(tips.length - 1, idx + 1)) : undefined}
      title={t.title} main={t.photos ? <PhotoTipMain t={t} now={photos ?? []} /> : <TextTipMain t={t} picked={picked} channel={channel} />} why={t.why}
      accepted={s.tips[t.id] === 'accepted'} money={t.money}
      limit={t.field === 'name' ? CHANNELS[channel].titleLimit ?? undefined : undefined}
      alts={alts} picked={pick[t.id]} onPick={(k) => setPick({ ...pick, [t.id]: k })}
      onGenerate={t.alts ? () => act.more(t.id) : undefined}
      onAccept={() => {
        const apply = () => { act.tip(t.id, 'accepted'); if (t.kb) act.kb(t.id, true); if (t.to || picked) act.custom(channel, t.field, picked ?? t.to ?? '') }
        if (t.photos) commitPhotosAndSend(apply, [channel], `Tip · ${t.title}`)
        else commitAndSend(apply, [channel], [t.field], `Tip · ${t.title}`)
        onAccepted(t)
      }}
      onDismiss={() => act.tip(t.id, 'dismissed')}
      onUndo={() => { act.tip(t.id, null); act.custom(channel, t.field, undefined); unsend(channel, t.field) }}
    />
  )
}

/** A text tip, as the Tips panel shows it: on a field that uses the Base, accepting makes a version for this channel. */
function TextTipMain({ t, picked, channel }: { t: TipDef; picked?: string; channel: ListingChannel }) {
  const custom = useStore((s) => s.sl3.custom[channel])
  const base = useStore((s) => s.sl3.base)
  const def = fieldByKey(t.field)
  const inherits = !!def && viewOf(def, channel, custom, base).state === 'inherit'
  return <Diff from={t.from} to={picked ?? t.to ?? ''} note={inherits ? <>Creates a version for {CHANNELS[channel].name} only.</> : undefined} />
}
/** A photo tip: the order now and after, in the Canvas's own photo strip. */
function PhotoTipMain({ t, now }: { t: TipDef; now: PhotoKey[] }) {
  const after = PHOTO_TIP_ORDER[t.id] ?? now
  const strip = (o: PhotoKey[], hi?: PhotoKey[]) => (
    <div className="cv-strip">{o.slice(0, 5).map((k, i) => (
      <span key={k + i} className={hi && hi[i] !== k ? 'cv-strip__ph is-moved' : 'cv-strip__ph'} title={PHOTO_CAPTION[k]}>
        <img src={photoUrl(k)} alt={PHOTO_CAPTION[k]} /><span>{i + 1}</span>
      </span>))}
    </div>
  )
  return (
    <div className="cv-fp__photos">
      <div className="cv-strip__row"><span>Now</span>{strip(now)}</div>
      <div className="cv-strip__row"><span>After</span>{strip(after, now)}</div>
    </div>
  )
}

/* ---------- the text field panel: (a) or (b), (c) on request ----------
 * (2nd pass): a field with a tip shows ONLY the tip card ("don't show the actual content, the text area
 * should be gone 100%"). A field without one shows only the field (label help, control, Uses the Base / Custom); the
 * Rewrite-with-AI card stays closed until the orange trigger on the panel's title row is clicked (CanvasView puts it
 * there, reading this hook), exactly as the trigger beside a Classic field label opens it. */
interface Session { original: string; versions: RefineVersion[]; idx: number; busy: boolean }

export interface FieldPanelCtl {
  /** The tips the panel shows (waiting, plus any accepted while it is open). Non-empty = tip-only mode. */
  tips: TipDef[]
  accept: (id: string) => void
  /** The field can be typed into right now and has no tip: the title row offers the Rewrite trigger. */
  rewriteOn: boolean
  rewriteOpen: boolean
  setRewriteOpen: (v: boolean) => void
}

/** One panel's state, reset whenever another area opens. CanvasView calls it once (for the title row's trigger) and
 *  hands it to <FieldPanel>. */
export function useFieldPanel(channel: ListingChannel, areaId: string | undefined, def: FieldDef | undefined, draft: SectionDraft): FieldPanelCtl {
  const p = useProperty()
  const [st, setSt] = useState<{ id?: string; accepted: Set<string>; rewrite: boolean }>({ id: areaId, accepted: new Set(), rewrite: false })
  const cur = st.id === areaId ? st : { id: areaId, accepted: new Set<string>(), rewrite: false }
  const tips = useFieldTips(channel, def?.kind === 'photos' ? undefined : def?.key, cur.accepted)
  const fieldVis = useStore((s) => (def ? s.overview?.[p.id]?.fieldVisibility?.[def.key] : undefined))
  let rewriteOn = false
  if (def) {
    const v = viewOf(def, channel, draft.custom, draft.base)
    const locked = v.state === 'hub' || v.state === 'set'
    const disabled = draft.readOnly || v.state === 'inherit' || v.state === 'linked' || (v.state === 'listing' && !draft.isOpen(def.key)) || fieldVis === 'show'
    rewriteOn = smartifiable(def) && tips.length === 0 && !locked && !disabled && fieldVis !== 'hidden'
  }
  return {
    tips, rewriteOn,
    rewriteOpen: rewriteOn && cur.rewrite,
    accept: (id) => setSt({ ...cur, accepted: new Set(cur.accepted).add(id) }),
    setRewriteOpen: (v) => setSt({ ...cur, rewrite: v }),
  }
}

export function FieldPanel({ channel, def, draft, ctl, onAcceptedTip }: {
  channel: ListingChannel
  def: FieldDef
  /** The Canvas draft, shaped as Classic's SectionDraft (CanvasView's adapter). */
  draft: SectionDraft
  ctl: FieldPanelCtl
  /** A tip on this field was accepted: drop the field's local draft so the accepted value shows. */
  onAcceptedTip: (field: string) => void
}) {
  const [session, setSession] = useState<Session | null>(null)
  const v = viewOf(def, channel, draft.custom, draft.base)
  const limit = def.key === 'name' ? CHANNELS[channel].titleLimit : def.limit
  const write = (text: string) => { if (v.state === 'listing') draft.setBase(def.key, text, def.base ?? ''); else draft.setCustom(def.key, text) }

  /** Classic's refine flow (ListingEditor.tsx refineFollowUp): the first request rewrites the field's text, a follow-up
   *  refines the version on show, "Try again" (null) re-runs its instruction on the same source. */
  const followUp = (instruction: string | null) => {
    const s = session ?? { original: v.value, versions: [], idx: 0, busy: false }
    if (s.busy) return
    const cur = s.versions[s.idx] as RefineVersion | undefined
    if (!cur && instruction === null) return
    const ins = instruction ?? cur!.instruction
    const source = !cur ? s.original : instruction === null ? cur.source : cur.text
    const attempt = cur && instruction === null ? s.versions.filter((x) => x.source === cur.source && x.instruction === cur.instruction).length : 0
    setSession({ ...s, busy: true })
    void simulateRefine(source, ins, limit, attempt, def.key).then((text) => setSession((r) => r && { ...r, busy: false, versions: [...r.versions, { instruction: ins, text, source, attempt }], idx: r.versions.length }))
  }
  const close = () => { setSession(null); ctl.setRewriteOpen(false) }

  // (b) a tip waits: the tip card and nothing else
  if (ctl.tips.length > 0) return (
    <div className="cv-fp">
      <FieldTips channel={channel} tips={ctl.tips}
        onAccepted={(t) => { ctl.accept(t.id); onAcceptedTip(t.field) }} />
    </div>
  )
  return (
    <div className="cv-fp">
      <div className="cv-fp__field">
        <DraftProvider value={draft}>
          <FieldRow def={def} c={channel} focus={false} onTip={() => {}} activeTip={null} />
        </DraftProvider>
      </div>
      {ctl.rewriteOpen && (
        <SmartifyPanel embedded fieldLabel="Rewrite with AI" original={session?.original ?? v.value} versions={session?.versions ?? []} idx={session?.idx ?? 0}
          busy={session?.busy} limit={limit}
          onStep={(i) => setSession((r) => r && { ...r, idx: i })} onFollowUp={followUp}
          onAccept={() => { if (session) write(session.versions[session.idx].text); close() }}
          onDismiss={close} />
      )}
    </div>
  )
}
