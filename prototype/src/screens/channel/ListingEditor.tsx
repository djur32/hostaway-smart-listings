/* Channels › {channel} › Listing · Classic editor (V3-SPEC §1 "Listing editor", CL-01…CL-08, NV-4b). Owner WS-CH.
 * Hospitable's real Details editor (HS-22…HS-29), scoped to one channel: every row says where its value comes from
 * (Uses the Base · Custom for {channel} · All channels · Knowledge Hub · set by the channel) and offers one action.
 * Rows are stacked (label, control, caption); Base values show disabled until "Customize for {channel}". Edits wait for the
 * section's Save (Discard changes / Save, as in Hospitable; the only unsaved-edit signal). With Autopilot on, every row is
 * read-only until "Turn off Autopilot to edit". Classic view: the title row scrolls away with the page; the tab row
 * (Essentials/Arrival/…) stays pinned under it while the form scrolls beneath (Antonio, 1 Oct, third round).
 * `?view=canvas` hands over to WS-CV's CanvasView, which keeps its own fixed header unchanged.
 * URL states: ?tips=1 (panel open) · ?tip=<id> (panel open on that tip) · ?smart=on|off · ?autopilot=1|0 · ?accept=<id> · ?view=canvas */
import {
  useEffect, useMemo, useRef, useState, type ComponentType,
} from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AmenityRow, Button, ChAmenityPick, DetailsDialog, DetailsDrawer, HeadTips, Loading, Mark, PageHead, Pill, QueryTabs,
  RadioCards, SaveActions, SmartifyPanel,
  SectionHead, Split, TipsToggle, UnsavedBar, ViewSwitch, Icon, IconButton, useIsMobile,
} from '../../ds'
import { ARRIVAL_GROUPS, LISTING_TABS, type ListingChannel, type ListingTab } from '../../data/sl3'
import { amenitiesFor, chOptionKey, channelOnlyAmenities, type ChOnlyAmenity } from '../../data/property-listing'
import { useListingChannels } from '../../store/selectors'
import { RULES_GROUPS, TAB_DESC, classicFields, fieldByKey, tabOfField } from '../../data/v3-ch'
import { useStore } from '../../store/store'
import { ChannelTips, useChannelTips } from '../../shell/ChannelTips'
import { useProperty } from '../../shell/PropertyLayout'
import { useExclusivePanel } from '../../ds/panelSlot'
import { CanvasView, handDraftToCanvas } from '../canvas/CanvasView'
import { PhotosManager } from './Photos'
// FieldRow and the Rewrite-with-AI helpers live in ./FieldRow (shared with Canvas's field panel, 3 Oct)
import { FieldRow, simulateRefine, type RefineSession, type RefineVersion, type SmartifyCtl } from './FieldRow'
import { PhotosDrawerHost, PhotosFullTakeover } from './PhotosShells'
import { usePhotosNav } from './photosNav'
import {
  CH_NAME, ChannelLead, DraftProvider, useBriefLoading, useChannel, useChannelDemoParams, useChannelPlan, useDraft, useOptionalDraft,
  useSectionDraft,
} from './common'

/** WS-CV owns CanvasView and keeps this signature (V3-SPEC §7). */
const Canvas: ComponentType<{ channel: ListingChannel; tab?: ListingTab }> = CanvasView
const isTab = (t: string | undefined): t is ListingTab => !!t && LISTING_TABS.some((x) => x.id === t)

export function ListingEditor() {
  const p = useProperty()
  const c = useChannel()
  const { tab } = useParams()
  const [params] = useSearchParams()
  useChannelDemoParams(c)
  if (!c) return <Navigate to={`/property/${p.id}/ch/airbnb/listing/essentials`} replace />
  // Pattern C of the photos-navigation exploration (photosNav.tsx, ?photosNav=tab, URL only since 3 Oct): Photos as
  // its own tab, reusing QueryTabs' exact same mechanism as Essentials/Arrival/…, for any channel.
  if (tab === 'photos') return <ListingPhotosTab c={c} />
  if (!isTab(tab)) return <Navigate to={`/property/${p.id}/ch/${c}/listing/essentials${params.toString() ? `?${params}` : ''}`} replace />
  if (params.get('view') === 'canvas') return <CanvasFrame c={c} tab={tab} />
  return <Classic c={c} tab={tab} />
}

/** Pattern C's tab content: the same sticky head (ListingPageHead + ListingTabs) every other tab uses, with "Photos"
 *  appended to the row, and PhotosManager (head-less — the tab row is the only "back" this pattern needs) as the
 *  tab's body, inside the same Split every other tab's body renders in. */
function ListingPhotosTab({ c }: { c: ListingChannel }) {
  const p = useProperty()
  const loading = useBriefLoading(`classic:${c}:photos`) // the same brief-loading beat every other tab switch gets (M-18)
  const s = useListingHeadState(c, 'essentials')
  const base$ = `/property/${p.id}/ch/${c}/listing`
  return (
    <div className="ch-editor">
      <div className="ch-editor__head">
        <div className="ch-page"><ListingPageHead c={c} tab="essentials" view="classic" s={s} /></div>
        {/* qs({}) carries every other param forward (?photosNav=tab included) — the same as every other tab link
           this row renders, so switching away and back never drops which pattern is being compared. */}
        <ListingTabs tab="photos" s={s} extraTabs={[{ id: 'photos', label: 'Photos', to: `${base$}/photos${s.qs({})}` }]} />
      </div>
      <Split main={loading ? <Loading /> : <div className="ch-page"><PhotosManager head={false} channel={c} /></div>} />
    </div>
  )
}

/** Canvas: the same fixed header (WS-CV, unchanged); a brief spinner while the channel's page loads (M-18). */
function CanvasFrame({ c, tab }: { c: ListingChannel; tab: ListingTab }) {
  const loading = useBriefLoading(`canvas:${c}`)
  return (
    <div className="ch-canvas">
      <div className="ch-canvas__head"><ListingHead c={c} tab={tab} view="canvas" /></div>
      {loading ? <Loading /> : <Canvas channel={c} tab={tab} />}
    </div>
  )
}

/** Shared state behind the title row and the tab row (useChannelPlan, Tips, Autopilot, tab counts, nav helpers). */
function useListingHeadState(c: ListingChannel, tab: ListingTab) {
  const p = useProperty()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const { on, autopilot } = useChannelPlan(c)
  const setPlan = useStore((s) => s.sl3Plan)
  const { pending } = useChannelTips(c)
  const tipsOpen = on && (params.has('tips') || params.has('tip'))
  const qs = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) { if (v === null) n.delete(k); else n.set(k, v) }
    const s = n.toString()
    return s ? `?${s}` : ''
  }
  const base$ = `/property/${p.id}/ch/${c}/listing`
  const togglePanel = () => setParams((prev) => {
    const n = new URLSearchParams(prev)
    if (tipsOpen) { n.delete('tips'); n.delete('tip'); return n }
    const first = pending.find((t) => tabOfField(t.field) === tab) ?? pending[0]
    if (first) { n.delete('tips'); n.set('tip', first.id) } else n.set('tips', '1')
    return n
  }, { replace: true })
  // Autopilot off: the editor unlocks, and the demo URL state goes too, so a reload or a shared link stays editable (QA A07)
  const turnOff = () => {
    setPlan(c, { mode: 'suggest' })
    if (params.has('autopilot')) setParams((prev) => { const n = new URLSearchParams(prev); n.delete('autopilot'); return n }, { replace: true })
  }
  const tabCounts = useMemo(() => {
    const m: Partial<Record<ListingTab, number>> = {}
    if (on) for (const t of pending) { const k = tabOfField(t.field); m[k] = (m[k] ?? 0) + 1 }
    return m
  }, [pending, on])
  return { p, nav, on, autopilot, pending, tipsOpen, togglePanel, turnOff, tabCounts, base$, qs }
}
type ListingHeadState = ReturnType<typeof useListingHeadState>

/** Row 1: title + property switcher + Classic | Canvas, next to the title (Antonio, 1 Oct, third round: back out of
 *  the tab row). Canvas keeps this fixed above the canvas (unchanged, WS-CV); Classic lets it scroll away with the
 *  page — only the tab row below it (ListingTabs) stays pinned. */
function ListingPageHead({ c, tab, view, s }: { c: ListingChannel; tab: ListingTab; view: 'classic' | 'canvas'; s: ListingHeadState }) {
  const { p, nav, on, autopilot, pending, tipsOpen, togglePanel, turnOff, base$, qs } = s
  const draft = useOptionalDraft()
  const switchView = (v: 'classic' | 'canvas') => {
    if (v === view) return
    // unsaved Classic edits come along into the Canvas (its "Your edits", the same shared Save) instead of being dropped
    if (v === 'canvas' && draft?.dirty && draft.pending) { const x = draft.pending(); handDraftToCanvas(p.id, c, x.custom, x.base) }
    // leaving the Canvas drops its own URL state (Your edits | Live now, Keep dialog, editable-only, selected part, Ask)
    const canvasOnly: Record<string, null> = v === 'classic' ? { compare: null, keep: null, editable: null, select: null, ask: null } : {}
    nav(`${base$}/${tab}${qs({ view: v === 'canvas' ? 'canvas' : null, ...canvasOnly })}`)
  }
  return (
    <PageHead
      lead={<ChannelLead c={c} />}
      title="Listing"
      property={p}
      // Antonio, 1 Oct (clarifying the third-round move): next to "Listing" itself, not grouped with the property
      // switcher at the row's far end.
      titleEnd={<ViewSwitch value={view} onChange={switchView} />}
      actions={<>
        {/* no strategy line here (Antonio: "overkill"); only the way out of Autopilot, and only while it runs */}
        {/* phones: Tips sits at the right end of the Classic | Canvas row, so the tab rail keeps the full width (ds/mobile.md §5) */}
        {on && <HeadTips><TipsToggle count={pending.length} open={tipsOpen} onToggle={togglePanel} /></HeadTips>}
        {autopilot && <span className="ch-autoline" role="status"><Icon name="rocket" size={16} />Autopilot is on<button type="button" className="h-textlink" onClick={turnOff}>Turn off to edit</button></span>}
      </>}
    />
  )
}

/** Row 2: Essentials · Arrival · Location · Amenities · Rules. Antonio, 1 Oct, third round: this row stays pinned
 *  ("I like that it's sticky") while the title above it and the body below it both scroll normally.
 *  `extraTabs`/a widened `tab` type: Pattern C of the photos-navigation exploration (ListingPhotosTab, above)
 *  appends "Photos" to this exact row rather than building its own — every other caller leaves it unset, unaffected. */
function ListingTabs({ tab, s, extraTabs }: { tab: ListingTab | 'photos'; s: ListingHeadState; extraTabs?: Array<{ id: string; label: string; to: string }> }) {
  const { on, pending, tipsOpen, togglePanel, base$, qs, tabCounts } = s
  const items = [...LISTING_TABS.map((t) => ({ id: t.id as string, label: t.label, to: `${base$}/${t.id}${qs({})}`, count: tabCounts[t.id] as number | undefined })), ...(extraTabs ?? [])]
  return (
    <div className="ch-tabrow">
      <QueryTabs active={tab} items={items} />
      {on && <TipsToggle count={pending.length} open={tipsOpen} onToggle={togglePanel} />}
    </div>
  )
}

/* ---------------- header: row 1 title + property, row 2 Classic | Canvas · strategy line · Tips; then the tabs ----------------
 * Canvas only (WS-CV): both rows fixed above the canvas, unchanged. Classic composes ListingPageHead/ListingTabs
 * separately instead (see Classic() below) so the tab row alone can stay pinned. */
export function ListingHead({ c, tab, view }: { c: ListingChannel; tab: ListingTab; view: 'classic' | 'canvas' }) {
  const s = useListingHeadState(c, tab)
  return <><ListingPageHead c={c} tab={tab} view={view} s={s} /><ListingTabs tab={tab} s={s} /></>
}

/* ---------------- the Classic view ---------------- */
function Classic({ c, tab }: { c: ListingChannel; tab: ListingTab }) {
  const p = useProperty()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const { on, autopilot } = useChannelPlan(c)
  const { pending, all } = useChannelTips(c)
  const draft = useSectionDraft(c, tab, { readOnly: autopilot }) // Autopilot on: read-only until it is turned off
  const loading = useBriefLoading(`classic:${c}:${tab}`) // tab / channel / view switch: a brief spinner (M-18)
  // "Manage photos" (photosNav.tsx): an overlay over this exact tab, every channel's Essentials (its "Manage photos"
  // link is the only thing that opens it — see ChannelPhotosRow, Photos.tsx). A (full screen) by default; B by URL.
  const photosNav = usePhotosNav()
  const photosOverlay = tab === 'essentials' && photosNav.open
  const tipsOpen = on && (params.has('tips') || params.has('tip'))
  const focusId = params.get('tip')
  const [localFocus, setLocalFocus] = useState<string | null>(null)
  /** Only a click inside the panel (prev / next / dismiss) may move the page; mount-time focus calls never do. */
  const userNav = useRef(false)
  useEffect(() => { if (!tipsOpen) setLocalFocus(null) }, [tipsOpen])

  const qs = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) { if (v === null) n.delete(k); else n.set(k, v) }
    const s = n.toString()
    return s ? `?${s}` : ''
  }
  const base$ = `/property/${p.id}/ch/${c}/listing`
  const openTip = (id: string) => setParams((prev) => { const n = new URLSearchParams(prev); n.delete('tips'); n.set('tip', id); return n }, { replace: true })
  const closePanel = () => setParams((prev) => { const n = new URLSearchParams(prev); n.delete('tips'); n.delete('tip'); return n }, { replace: true })
  // only one right-side panel at a time (D-927, Antonio 1 Oct item 3): Tips force-closes if a pricing/availability panel claims the slot
  useExclusivePanel('tips', tipsOpen, closePanel)
  // Smartify (ds/smartify.tsx, Antonio 3 Oct): a host's rewrite opens as a result card in this SAME one-panel slot —
  // opening it closes Tips and opening Tips closes it (panelSlot.ts). Nothing changes in the field until Accept, which
  // writes the chosen version as a normal draft (Discard/Save bar); Dismiss leaves the field untouched.
  const [refine, setRefine] = useState<RefineSession | null>(null)
  useExclusivePanel('smartify', !!refine, () => setRefine(null))
  useEffect(() => { setRefine(null) }, [c, tab])
  // Clicking the trigger opens the panel straight on the composer (no versions yet); clicking it again closes it.
  const smartify: SmartifyCtl = {
    field: refine?.field ?? null,
    open: (req) => setRefine((r) => (r?.field === req.field ? null : { ...req, versions: [], idx: 0, busy: false })),
  }
  /** The first request rewrites the field's text; a follow-up refines the version on show; "Try again" (null) re-runs
   *  its instruction on the same source. */
  const refineFollowUp = (instruction: string | null) => {
    if (!refine || refine.busy) return
    const cur = refine.versions[refine.idx] as RefineVersion | undefined
    if (!cur && instruction === null) return
    const ins = instruction ?? cur!.instruction
    const source = !cur ? refine.original : instruction === null ? cur.source : cur.text
    const attempt = cur && instruction === null ? refine.versions.filter((x) => x.source === cur.source && x.instruction === cur.instruction).length : 0
    const field = refine.field
    setRefine((r) => r && { ...r, busy: true })
    void simulateRefine(source, ins, refine.limit, attempt, field).then((text) => setRefine((r) => r && r.field === field
      ? { ...r, busy: false, versions: [...r.versions, { instruction: ins, text, source, attempt }], idx: r.versions.length } : r))
  }
  /** The panel walks the host through every tip: stepping to a tip on another tab switches the tab. */
  const onFocus = (id: string, field: string) => {
    if (focusId && id !== focusId && !userNav.current) return // StrictMode / mount order: keep the URL's tip
    setLocalFocus(field)
    if (!userNav.current) return
    userNav.current = false
    const t = tabOfField(field)
    if (t !== tab || focusId !== id) nav(`${base$}/${t}${qs({ tips: null, tip: id })}`, { replace: true })
  }
  // a tip in the URL always shows on the tab where its field lives
  const urlTipField = focusId ? all.find((t) => t.id === focusId)?.field : undefined
  useEffect(() => {
    if (tipsOpen && urlTipField && tabOfField(urlTipField) !== tab) nav(`${base$}/${tabOfField(urlTipField)}${qs({})}`, { replace: true })
  }, [urlTipField, tab, tipsOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  const focusField = localFocus ?? (focusId ? all.find((t) => t.id === focusId)?.field ?? null : null)
  const scrolled = useRef(false)
  const mobile = useIsMobile()
  // the field the open panel is about (a tip's, or a Smartify result's) comes into view the same way
  const panelField = refine ? refine.field : tipsOpen ? focusField : null
  useEffect(() => {
    if (!panelField) { scrolled.current = false; return }
    const el = document.getElementById(`field-${panelField}`)
    if (!el) return
    const behavior: ScrollBehavior = scrolled.current ? 'smooth' : 'auto' // jump on open, glide after
    scrolled.current = true
    // phones: to the top, above the Tips sheet that covers the lower part of the screen
    if (mobile) { el.scrollIntoView({ block: 'start', behavior }); return }
    // desktop: the field lands in the space below the (sticky) section head, never under it or under the tab bar (QA A05)
    const sc = el.closest<HTMLElement>('.h-split__main')
    if (!sc) { el.scrollIntoView({ block: 'center', behavior }); return }
    const headH = sc.querySelector<HTMLElement>('.ch-sechead')?.offsetHeight ?? 0
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop
    const room = sc.clientHeight - headH
    const gap = el.offsetHeight < room - 32 ? Math.min(96, (room - el.offsetHeight) / 2) : 16
    sc.scrollTo({ top: Math.max(0, top - headH - gap), behavior })
  }, [panelField, tab, loading, mobile])

  const tipsByField = useMemo(() => {
    const m: Record<string, string[]> = {}
    if (on) for (const t of pending) (m[t.field] ??= []).push(t.id)
    return m
  }, [pending, on])

  /** The tip icon is a toggle: the icon of the tip already open closes the panel. */
  const onTipIcon = (id: string) => {
    const field = all.find((t) => t.id === id)?.field
    if (tipsOpen && field && field === focusField) closePanel(); else openTip(id)
  }
  const fieldVis = useStore((s) => s.overview?.[p.id]?.fieldVisibility) // the store's own object: stable between renders
  const main = loading ? <Loading /> : (
    <div className="ch-page">
      {/* Amenities renders its own head: "Add {channel} amenities" sits on the title's line, as on the Listing base */}
      {tab !== 'amenities' && <SectionHead
        title={LISTING_TABS.find((t) => t.id === tab)!.label}
        desc={TAB_DESC[tab]}
        actions={autopilot ? undefined : <SaveActions dirty={draft.dirty} onDiscard={draft.discard} onSave={draft.save} />}
      />}
      {tab === 'amenities' ? <Amenities c={c} /> : tab === 'rules' ? (
        RULES_GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="ch-subhead">{g.title}</h3><p className="ch-subdesc">{g.desc}</p>
            {g.keys.map((k) => { const f = fieldByKey(k)!; return <FieldRow key={k} def={f} c={c} tips={tipsByField[k]} focus={tipsOpen && focusField === k} onTip={onTipIcon} activeTip={focusId} smartify={smartify} /> })}
          </div>
        ))
      ) : tab === 'arrival' ? (
        // a group whose every field is set to Don't show (Field visibility) drops its heading too, not just its rows
        [...ARRIVAL_GROUPS.map((g) => ({ ...g, fields: classicFields(tab, c).filter((f) => f.group === g.id && fieldVis?.[f.key] !== 'hidden') })),
          { id: 'other', title: '', desc: undefined, fields: classicFields(tab, c).filter((f) => !ARRIVAL_GROUPS.some((g) => g.id === f.group) && fieldVis?.[f.key] !== 'hidden') }]
          .filter((g) => g.fields.length > 0).map((g) => (
            <div key={g.id}>
              {g.title && <h3 className="ch-subhead">{g.title}</h3>}{g.desc && <p className="ch-subdesc">{g.desc}</p>}
              {g.fields.map((f) => <FieldRow key={f.key} def={f} c={c} tips={tipsByField[f.key]} focus={tipsOpen && focusField === f.key} onTip={onTipIcon} activeTip={focusId} smartify={smartify} />)}
            </div>
          ))
      ) : classicFields(tab, c).map((f) => (
        <FieldRow key={f.key} def={f} c={c} tips={tipsByField[f.key]} focus={tipsOpen && focusField === f.key} onTip={onTipIcon} activeTip={focusId} smartify={smartify} />
      ))}
      {/* ds/unsaved.tsx, 1 Oct evening: sticky to .h-split__main's bottom, scoped to this .ch-page's width */}
      <UnsavedBar />
    </div>
  )
  const headState = useListingHeadState(c, tab)
  const tipsPanel = tipsOpen ? (
    <div className="ch-contents" onClickCapture={() => { userNav.current = true }}>
      <ChannelTips channel={c} focusId={focusId} onFocus={onFocus} onClose={closePanel} />
    </div>
  ) : undefined
  const sidePanel = refine ? (
    <div className="ch-contents">
      <SmartifyPanel fieldLabel={refine.label} original={refine.original} versions={refine.versions} idx={refine.idx} busy={refine.busy} limit={refine.limit}
        onStep={(i) => setRefine((r) => r && { ...r, idx: i })} onFollowUp={refineFollowUp}
        onAccept={() => { refine.apply(refine.versions[refine.idx].text); setRefine(null) }}
        onDismiss={() => setRefine(null)} />
    </div>
  ) : tipsPanel
  return (
    <DraftProvider value={draft}>
      <div className="ch-editor">
        {/* task 2 (Antonio, round 4): the WHOLE head — title, Classic|Canvas switcher, property switcher and the tab
         * row — stays pinned together as one sticky block while only the form below scrolls. Both pieces share one
         * wrapper (.ch-editor__head, sticky) instead of the tab row sticking on its own, so there's one sticky
         * context, not two (ds/v3/ch.css). */}
        <div className="ch-editor__head">
          <div className="ch-page"><ListingPageHead c={c} tab={tab} view="classic" s={headState} /></div>
          <ListingTabs tab={tab} s={headState} extraTabs={photosNav.pattern === 'tab'
            ? [{ id: 'photos', label: 'Photos', to: `${base$}/photos${headState.qs({})}` }] : undefined} />
        </div>
        {tab === 'essentials' && photosNav.pattern === 'drawer' ? (
          // Pattern B: PanelStack's own drawer hosts both Tips and Photos (PanelStack claims the one shared
          // side-panel slot, ds/panelSlot.ts — opening Photos here force-closes Tips the same way a Pricing/Canvas
          // drill-down already would, no extra wiring needed).
          <PhotosDrawerHost channel={c} open={photosOverlay} onClose={photosNav.closePhotos} main={main} panel={sidePanel} />
        ) : (
          <Split main={main} panel={sidePanel} />
        )}
      </div>
      {/* Pattern A (the default, every channel): a true full-screen takeover, portaled above everything (including
         the sidebar) — never nested inside .ch-editor, since it must cover it. Locked to this channel's photos. */}
      {tab === 'essentials' && photosNav.pattern === 'full' && (
        <PhotosFullTakeover channel={c} open={photosOverlay} onClose={photosNav.closePhotos} />
      )}
    </DraftProvider>
  )
}

/* ---------------- Amenities: the inherited list, read-only, plus what this channel adds (HS-26/27, CL-07) ----------------
 * Antonio, 1 Oct (round 4): the amenities in a channel are inherited from the Listing base, so the inherited rows carry
 * no Remove, no Hide and no edit here; the one list is managed in Listing base › Details › Amenities.
 * Antonio, 4 Oct: "you cannot change it at this level" — inherited rows stay read-only — but a channel can ADD:
 *  - an amenity on the Base list that isn't on this channel ("Not on Airbnb") gets "Add to Airbnb" on its row;
 *  - an amenity only this channel's catalogue has (data/property-listing.ts channelOnlyAmenities), from
 *    "Add {channel} amenities", which now sits on the section title's line, as "Add amenity" does on the Base page.
 * Both write a per-channel exception into the section draft and wait for the shared Discard / Save bar (UnsavedBar);
 * leaving the page with them unsaved asks first, like every other edit here. A row staged in this draft keeps its place
 * (the list sorts by what is saved) and says so, with Undo. */
function Amenities({ c }: { c: ListingChannel }) {
  const d = useDraft()
  const { custom, readOnly } = d
  const saved = useStore((s) => s.sl3.custom) // what is saved, per channel (this channel's draft sits on top of it)
  const p = useProperty()
  const channels = useListingChannels() // this property's channels; its own amenity list (data/property-listing.ts)
  const name = CH_NAME[c]
  const [adding, setAdding] = useState(false)
  type Item = { name: string; note?: string; on: ListingChannel[] }
  /** Where the amenity really shows: a channel's own exceptions win over the list (QA A10). */
  const onIn = (src: Record<string, string | null> | undefined, ch: ListingChannel, i: Item) => {
    const cv = src?.[`amenity:${i.name}`]
    return cv === 'on' ? true : cv === 'off' ? false : i.on.includes(ch)
  }
  const onFor = (ch: ListingChannel, i: Item) => onIn(ch === c ? custom : saved[ch], ch, i)
  const extras = channelOnlyAmenities(p.id, c)
  const extraOn = (a: ChOnlyAmenity) => custom?.[`amenity:${a.name}`] === 'on'
  const extraSaved = (a: ChOnlyAmenity) => saved[c]?.[`amenity:${a.name}`] === 'on'
  const key = (n: string) => `amenity:${n}`
  /** "Add to {channel}": on for this channel only. An amenity the list already gives this channel (turned off by an
   *  exception) just drops the exception. */
  const addTo = (i: Item) => d.setCustom(key(i.name), i.on.includes(c) ? undefined : 'on')
  /** Undo a staged add: back to what is saved (setCustom treats "same as saved" as no change). */
  const undo = (n: string) => d.setCustom(key(n), saved[c]?.[key(n)] ?? undefined)
  /** The Base groups, with this channel's own extras appended to theirs (a group of their own if it's new). */
  const groups: Array<{ group: string; base: Array<{ item: Item; name: string; note?: string; isOn: boolean; staged: boolean; where: ListingChannel[] }>; own: ChOnlyAmenity[] }> = []
  const groupOf = (g: string) => {
    let x = groups.find((y) => y.group === g)
    if (!x) { x = { group: g, base: [], own: [] }; groups.push(x) }
    return x
  }
  for (const g of amenitiesFor(p.id)) {
    // not-on-this-channel first within the group (Antonio, 1 Oct: "whatever has not been added, put it at the top of
    // the list"), the rest keep the Base order. Sorted by what is SAVED, so "Add to Airbnb" never makes a row jump.
    groupOf(g.group).base = g.items.map((i) => {
      const where = channels.filter((ch) => onFor(ch, i))
      const isOn = where.includes(c)
      const wasOn = onIn(saved[c], c, i)
      return { row: { item: i, name: i.name, note: i.note, isOn, staged: isOn !== wasOn, where }, wasOn }
    }).sort((a, b) => Number(a.wasOn) - Number(b.wasOn)).map((x) => x.row)
  }
  // an own amenity stays listed while it is saved, even when Remove is staged (it then reads "Removed… not saved yet", with Undo)
  for (const a of extras) if (extraOn(a) || extraSaved(a)) groupOf(a.group).own.push(a)
  return (
    <>
      <SectionHead
        title={LISTING_TABS.find((t) => t.id === 'amenities')!.label}
        desc={TAB_DESC.amenities}
        actions={readOnly ? undefined : <>
          <SaveActions dirty={d.dirty} onDiscard={d.discard} onSave={d.save} />
          {extras.length > 0 && <span className="h-ld-amenity-actions"><Button kind="primary" onClick={() => setAdding(true)}>Add {name} amenities</Button></span>}
        </>}
      />
      <div className="ch-sameall">
        <Icon name="layers-intersect" />
        <div className="ch-sameall__text">
          <b>Inherited from your listing</b>
          <span>Your amenity list is shared by every channel, so it can't be changed here. Manage it in <Link className="h-textlink" to={`/property/${p.id}/details/amenities`}>Listing base › Details › Amenities</Link>. Here you can add one that isn't on {name} yet, or an amenity only {name} has.</span>
        </div>
      </div>
      {groups.map((g) => (
        <div key={g.group}>
          <h3 className="ch-amenity-group">{g.group}</h3>
          <div className="ch-amenities">
            {g.base.map((i) => {
              // exception-only (Antonio, 1 Oct): no caption when every connected channel has it, and never name the
              // OTHER channels from inside one; the only captions left are the facts about THIS channel.
              const scope = i.staged && i.isOn ? `Added to ${name}, not saved yet`
                : !i.isOn ? `Not on ${name}` : i.where.length === 1 ? `Only on ${name}` : undefined
              const exc = !i.isOn || i.staged || (channels.length > 1 && i.where.length === 1 && i.where[0] === c)
              const disagree = i.note === 'Channels disagree'
              const action = readOnly ? undefined
                : !i.isOn ? <Button className="ch-addto" icon="plus" onClick={() => addTo(i.item)}>Add to {name}</Button>
                : i.staged ? <button type="button" className="h-textlink ch-addto-undo" onClick={() => undo(i.name)}>Undo</button>
                : undefined
              return (
                <AmenityRow key={i.name} name={i.name} scope={scope} tone={!i.isOn ? 'off' : exc ? 'custom' : 'base'}
                  info={disagree ? undefined : i.note}
                  tag={disagree ? <Pill kind="neutral">Channels disagree</Pill> : undefined}
                  action={action}
                />
              )
            })}
            {g.own.map((a) => {
              const on = extraOn(a)
              const staged = on && !extraSaved(a) // added in this draft
              const removed = !on && extraSaved(a) // saved, and Remove is staged
              const optKeys = (a.options ?? []).map((o) => chOptionKey(a.name, o.legend))
              /** Remove from this channel only: a saved row is marked off (`null` = removed on Save), its sub-options too. */
              const remove = () => {
                d.setCustom(key(a.name), null)
                for (const k of optKeys) d.setCustom(k, typeof saved[c]?.[k] === 'string' ? null : undefined)
              }
              const restore = () => {
                d.setCustom(key(a.name), saved[c]?.[key(a.name)] ?? undefined)
                for (const k of optKeys) d.setCustom(k, saved[c]?.[k] ?? undefined)
              }
              const action = readOnly ? undefined
                : staged ? <button type="button" className="h-textlink ch-addto-undo" onClick={() => {
                    d.setCustom(key(a.name), undefined)
                    for (const k of optKeys) d.setCustom(k, saved[c]?.[k] ?? undefined)
                  }}>Undo</button>
                : removed ? <button type="button" className="h-textlink ch-addto-undo" onClick={restore}>Undo</button>
                : <IconButton icon="trash" label={`Remove ${a.name} from ${name}`} className="h-btn-icon ch-amenity-remove" onClick={remove} />
              return (
                <AmenityRow key={a.name} name={a.name} tone={removed ? 'off' : 'custom'}
                  scope={removed ? `Removed from ${name}, not saved yet` : staged ? `Added to ${name}, not saved yet` : `Only on ${name}`}
                  note={removed ? undefined : (a.options ?? []).map((o) => custom?.[chOptionKey(a.name, o.legend)]).filter(Boolean).join(' · ') || undefined}
                  info={`Not on your listing's amenity list. It shows on ${name} only. Added from "Add ${name} amenities".`}
                  action={action}
                />
              )
            })}
          </div>
        </div>
      ))}
      {!readOnly && extras.length === 0 && (
        <p className="ch-addam-none">{name} has no amenity fields of its own left to add. Everything it can take is on your listing's amenity list already.</p>
      )}
      <AddChannelAmenities c={c} open={adding} onClose={() => setAdding(false)} extras={extras} />
    </>
  )
}

/* ---------------- "Add {channel} amenities": only this channel's own catalogue ----------------
 * Antonio, 1 Oct (round 4): "add only Airbnb-specific amenities… add only the ones that are specific to Airbnb here".
 * Rows: name, the channel's mark, grey + ✓ once picked, white + when not; a tap toggles. An amenity the channel wants
 * structured detail for opens a small form of grouped single choices with Cancel / Add amenity.
 * Antonio, 4 Oct: the drawer never saves. Picks are held here while it is open; Done (or closing it any other way, so a
 * pick is never silently lost) hands them to the page's section draft and closes, and the page's own Discard / Save
 * bar takes over from there. */
function AddChannelAmenities({ c, open, onClose, extras }: { c: ListingChannel; open: boolean; onClose: () => void; extras: ChOnlyAmenity[] }) {
  const { custom, setCustom } = useDraft()
  const name = CH_NAME[c]
  const [form, setForm] = useState<{ a: ChOnlyAmenity; pick: Record<string, string> } | null>(null)
  const [staged, setStaged] = useState<Record<string, string | undefined>>({})
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) { setPrevOpen(open); if (open) setStaged({}) } // a fresh set of picks each time it opens
  const val = (k: string) => (k in staged ? staged[k] : custom?.[k] ?? undefined)
  const put = (k: string, v: string | undefined) => setStaged((s) => ({ ...s, [k]: v }))
  const isOn = (a: ChOnlyAmenity) => val(`amenity:${a.name}`) === 'on'
  const groups: Array<{ group: string; items: ChOnlyAmenity[] }> = []
  for (const a of extras) {
    const g = groups.find((x) => x.group === a.group) ?? (groups.push({ group: a.group, items: [] }), groups[groups.length - 1])
    g.items.push(a)
  }
  /** Off: the amenity and whatever sub-options it carried go back to how the channel was. */
  const turnOff = (a: ChOnlyAmenity) => {
    put(`amenity:${a.name}`, undefined)
    for (const o of a.options ?? []) put(chOptionKey(a.name, o.legend), undefined)
  }
  const toggle = (a: ChOnlyAmenity) => {
    if (isOn(a)) { turnOff(a); return }
    if (a.options?.length) { setForm({ a, pick: {} }); return }
    put(`amenity:${a.name}`, 'on')
  }
  const commit = () => {
    if (!form) return
    put(`amenity:${form.a.name}`, 'on')
    for (const o of form.a.options ?? []) put(chOptionKey(form.a.name, o.legend), form.pick[o.legend])
    setForm(null)
  }
  /** Done: the picks go into the page's draft (unsaved until the page's Save), then the drawer closes. */
  const done = () => {
    for (const [k, v] of Object.entries(staged)) if (v !== (custom?.[k] ?? undefined)) setCustom(k, v)
    setStaged({})
    onClose()
  }
  const complete = !!form && (form.a.options ?? []).every((o) => form.pick[o.legend])
  return (
    <>
      <DetailsDrawer open={open} title={`Add ${name} amenities`} onClose={done} label={`Add ${name} amenities`} fullScreen
        footer={<Button kind="primary" size="lg" block onClick={done}>Done</Button>}>
        <div className="ch-addam">
          <p className="ch-addam__note">
            {c === 'direct'
              ? 'Your own booking site has no outside catalogue to satisfy, so nothing here is required of you. These are simply extras you can choose to show on it. Everything your channels share stays on your listing’s amenity list, in Listing base › Details › Amenities.'
              : `Only the amenities ${name} has a field for and your listing’s amenity list doesn’t. Everything your channels share is on that list, in Listing base › Details › Amenities, and reaches ${name} from there.`}
            {' '}Nothing is saved until you save the page.
          </p>
          {groups.map((g) => (
            <div key={g.group}>
              <h3 className="ch-addam__group">{g.group}</h3>
              <div className="ch-addam__picks">
                {g.items.map((a) => (
                  <ChAmenityPick key={a.name} name={a.name} scope={<Mark channel={c} size={14} />} added={isOn(a)}
                    opens={!!a.options?.length} onToggle={() => toggle(a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DetailsDrawer>
      <DetailsDialog open={!!form} title={form ? `Add ${form.a.name}` : ''} onClose={() => setForm(null)} label={form ? `Add ${form.a.name}` : undefined}
        footer={<><Button onClick={() => setForm(null)}>Cancel</Button><Button kind="primary" disabled={!complete} onClick={commit}>Add amenity</Button></>}>
        {(form?.a.options ?? []).map((o) => (
          <div key={o.legend} className="ch-addam-opt">
            <RadioCards legend={o.legend} name={`opt-${o.legend}`} value={form?.pick[o.legend]}
              onChange={(v) => setForm((prev) => (prev ? { ...prev, pick: { ...prev.pick, [o.legend]: v } } : prev))}
              options={o.options.map((x) => ({
                value: x.value,
                label: x.value,
                // the mark means "this wording is the channel's own enum"; the generic fallback every channel
                // understands says so instead. Direct bookings has no outside catalogue, so its wording is the
                // host's own and there is nothing to mark either way.
                trail: x.own ? <Mark channel={c} size={14} /> : c === 'direct' ? undefined : <span className="ch-addam-opt__all">All channels</span>,
              }))} />
          </div>
        ))}
      </DetailsDialog>
    </>
  )
}
