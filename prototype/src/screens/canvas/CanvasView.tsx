/* WS-CV · Canvas (V3-SPEC §1 "Listing editor", frames CV-01…CV-09). The channel's real guest page, fully readable, with
 * every part outlined in the colour of what it offers: purple = a tip waits, orange = editable here (Rewrite with AI),
 * no colour = owned elsewhere. WS-CH's ListingEditor renders this below its PageHead when ?view=canvas.
 * nothing is edited on the page itself ("inline editing doesn't work… the solution has to be in the
 * sidebar"). Tapping a part opens the field panel in the one right-hand slot (FieldPanel.tsx): a tip field shows only
 * its tip card; any other field shows Classic's FieldRow, with the Rewrite-with-AI card behind the orange trigger on the
 * panel's title row. Photos open the full-screen Manage photos takeover (no panel); the booking card's nightly line and
 * cleaning fee open Pricing's rows (PricePanel.tsx). ?editable=1 = "Show only editable sections" (layout kept). The page is never dimmed ("make sure the content is readable"). Edits are drafts with the one shared
 * Discard / Save bar (ds/unsaved.tsx); the panel's FieldRow reads that draft through Classic's DraftProvider.
 * URL states: ?tips=1 · &tip=<id> (the Tips panel for the whole page; stepping selects the tip's area) ·
 * &select=<area> (its panel) · &photosOpen=1 (the photos takeover) · &editable=1 · &compare=live (&keep=1).
 * Multi-property (QA B01/B02): the page is the active property's (data/property-listing.ts cvContentFor, channelPrice);
 * tips and the photos suggestion are the scenario property's only. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BottomSheet, CvBar, CvEditPanel, CvFrame, CvKeepDialog, CvLockPop, MobileSheetSaveButtons, SmartifyTrigger, Split, Toggle, UnsavedBar,
  useIsMobile, useUnsavedChanges, type CvCompare, type CvTone,
} from '../../ds'
import { CHANNELS } from '../../data/channels'
import { FIELDS, tipsFor, type ListingChannel, type ListingTab } from '../../data/sl3'
import { fieldByKey } from '../../data/v3-ch'
import {
  PHOTO_KEY, STAY, TAB_ANCHOR, areaForField, cvArea, fieldState, type CvArea as CvAreaDef,
} from '../../data/v3-cv'
import { ChannelTips } from '../../shell/ChannelTips'
import { discardCustom, stashKey, useChannelPlan, type SectionDraft } from '../channel/common'
import { commitAndSend, commitPhotosAndSend, pendingChanges, receiptStatus, usePushUi } from '../push/changes'
import { useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { useExclusivePanel } from '../../ds/panelSlot'
import { useIsScenario, useListingChannels } from '../../store/selectors'
import { cvContentFor, cvLockFor } from '../../data/property-listing'
import { AirbnbPage } from './AirbnbPage'
import { BookingPage } from './BookingPage'
import { DirectPage } from './DirectPage'
import { FieldPanel, useFieldPanel } from './FieldPanel'
import { PricePanel, canvasPrice, priceKeysFor } from './PricePanel'
import { cancelFacts, maxGuests } from './facts'
import { useChannelPolicy } from '../channel/policies/PolicyFlow'
import { PhotosFullTakeover } from '../channel/PhotosShells'
import { PHOTOS_OPEN_PARAM, usePhotosNav } from '../channel/photosNav'
import { useMarkerPlacement } from './markers'
import { CvProvider, fieldStateNow, liveValue, useCvModel, type LiveCtx } from './model'

/** The page is drawn at a real desktop width and scaled to fit; below ~720 px it switches to the channel's narrow layout. */
const WIDE = 1000
/** Split's --split-panel-width (340 at ≤1366px, ds/v3/ch.css). */
const tipsPanel = () => (typeof window !== 'undefined' && window.innerWidth <= 1366 ? 340 : 420)
function fit(avail: number) {
  if (avail <= 0) return { zoom: 1, width: WIDE, narrow: false }
  if (avail >= WIDE) return { zoom: 1, width: avail, narrow: false }
  if (avail >= WIDE * 0.72) return { zoom: avail / WIDE, width: WIDE, narrow: false }
  const zoom = Math.min(1, Math.max(0.8, avail / 620))
  return { zoom, width: avail / zoom, narrow: true }
}

/** The channel's field edits still waiting on the shared Save (one Discard/Save for
 *  everything). Shaped like sl3.custom[channel]/sl3.base so it overlays onto a copy of the real store (draftSl3/draftLib
 *  below) for every read; the store commit + channel send happens once, from the bar's Save (saveDraft). The field
 *  panel's FieldRow reads and writes it through `sectionDraft`, an adapter with Classic's SectionDraft shape.
 *  Switching channel drops it, same as switching a Pricing section does. */
interface CvDraft { channel: ListingChannel; base: Record<string, string>; custom: Record<string, string | null | undefined>; photoUseBase?: boolean }
const emptyCvDraft = (channel: ListingChannel): CvDraft => ({ channel, base: {}, custom: {} })

/* ---------- Classic → Canvas: the unsaved draft comes along ----------
 * Switching Classic | Canvas is a same-page search-param change, so the unsaved-changes guard (ds/unsaved.tsx) never
 * stops it. The view switch hands any pending Classic edits over here (same shape as CvDraft), and the Canvas starts
 * from them: they show in "Your edits", not in "Live now", and the one shared bar still Saves or Discards them.
 * Keyed to property + channel, read once. (Canvas → Classic doesn't carry yet: see SESSION-LOG, open item.) */
let handoff: { pid: string; draft: CvDraft } | null = null
export function handDraftToCanvas(pid: string, channel: ListingChannel, custom: CvDraft['custom'], base: CvDraft['base']) {
  handoff = Object.keys(custom).length || Object.keys(base).length ? { pid, draft: { channel, custom: { ...custom }, base: { ...base } } } : null
}
const takeHandoff = (pid: string, channel: ListingChannel): CvDraft => {
  const h = handoff
  return h && h.pid === pid && h.draft.channel === channel ? h.draft : emptyCvDraft(channel)
}

export function CanvasView({ channel, tab }: { channel: ListingChannel; tab?: ListingTab }) {
  const p = useProperty()
  const [params, setParams] = useSearchParams()
  const tipId = params.get('tip')
  const on = useStore((s) => s.smartListings)
  const tipsOpen = on && (params.get('tips') === '1' || !!tipId)
  const live = params.get('compare') === 'live'
  // the Tips panel and a part's panel share one slot: while Tips is open nothing is "selected" (stepping between tips
  // outlines each tip's part instead, via focusTip), and a leftover ?select= is cleared below
  const selected = live || tipsOpen ? null : params.get('select')
  const sl3 = useStore((s) => s.sl3)
  const { autopilot } = useChannelPlan(channel) // Autopilot on: every field reads only (FieldRow), no orange areas
  const act = { custom: useStore((s) => s.sl3Custom), base: useStore((s) => s.sl3Base), tip: useStore((s) => s.sl3Tip) }
  const [focusId, setFocusId] = useState<string | null>(tipId)
  const [keep, setKeep] = useState(params.get('keep') === '1')
  const lib = useStore((s) => s.photoLib)
  const photoUseBase = useStore((s) => s.photoUseBase)
  const fieldVis = useStore((s) => s.overview?.[p.id]?.fieldVisibility) // the store's own object: stable between renders
  const mobile = useIsMobile()
  const name = CHANNELS[channel].name
  const scenario = useIsScenario()
  const channels = useListingChannels()

  /* the shared draft: the panel's field and Accept only write here; the bar's Save commits + sends. draftSl3/draftLib
     overlay it onto the real store ("Your edits"); the real store alone is "Live now" and the edit-diff's "from". */
  const [rawDraft, setRawDraft] = useState<CvDraft>(() => takeHandoff(p.id, channel))
  // consumed after mount (not inside the initializer: StrictMode runs that twice, and the second run must see it too)
  useEffect(() => { handoff = null }, [])
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({}) // listing-wide rows opened with "Edit for all channels"
  const draft = rawDraft.channel === channel ? rawDraft : emptyCvDraft(channel)
  const dirty = Object.keys(draft.base).length > 0 || Object.keys(draft.custom).length > 0 || draft.photoUseBase !== undefined
  const draftSl3 = useMemo(() => (!dirty ? sl3 : {
    ...sl3,
    base: { ...sl3.base, ...draft.base },
    custom: { ...sl3.custom, [channel]: { ...(sl3.custom[channel] ?? {}), ...draft.custom } },
  }), [sl3, draft, dirty, channel])
  const draftLib = useMemo(() => (draft.photoUseBase === undefined ? lib : { ...lib, useBase: { ...lib.useBase, [channel]: draft.photoUseBase } }), [lib, draft.photoUseBase, channel])
  const patchDraft = useCallback((fn: (d: CvDraft) => CvDraft) => setRawDraft((prev) => fn(prev.channel === channel ? prev : emptyCvDraft(channel))), [channel])
  const setCustomDraft = useCallback((k: string, v: string | null | undefined) => patchDraft((d) => {
    const cur = { ...d.custom }
    if (v === sl3.custom[channel]?.[k]) delete cur[k]; else cur[k] = v // same as saved = not a change
    return { ...d, custom: cur }
  }), [patchDraft, channel, sl3])
  const setBaseDraft = useCallback((k: string, v: string, fallback?: string) => patchDraft((d) => {
    const b = { ...d.base }
    if (v === (sl3.base[k] ?? fallback ?? FIELD_BASE(k))) delete b[k]; else b[k] = v
    return { ...d, base: b }
  }), [patchDraft, sl3])
  /** A field's draft (and its kept "Use the Base" text) dropped — e.g. after accepting a tip on it, so the field shows
   *  the accepted value rather than an older unsaved edit. */
  const dropDraft = (k: string) => patchDraft((d) => {
    const c = { ...d.custom }, b = { ...d.base }
    delete c[k]; delete c[stashKey(k)]; delete b[k]
    return { ...d, custom: c, base: b }
  })
  const saveDraft = () => {
    const customEntries = Object.entries(draft.custom).filter(([k]) => k !== PHOTO_KEY)
    if (PHOTO_KEY in draft.custom || draft.photoUseBase !== undefined) {
      commitPhotosAndSend(() => {
        if (PHOTO_KEY in draft.custom) act.custom(channel, PHOTO_KEY, draft.custom[PHOTO_KEY])
        if (draft.photoUseBase !== undefined) photoUseBase(channel, draft.photoUseBase)
      }, [channel])
    }
    if (customEntries.length) commitAndSend(() => { for (const [k, v] of customEntries) act.custom(channel, k, v) }, [channel], customEntries.map(([k]) => k))
    if (Object.keys(draft.base).length) commitAndSend(() => { for (const [k, v] of Object.entries(draft.base)) act.base(k, v) }, channels, Object.keys(draft.base))
    setRawDraft(emptyCvDraft(channel)); setOpenKeys({})
  }
  const discardDraft = () => { setRawDraft(emptyCvDraft(channel)); setOpenKeys({}) }
  useUnsavedChanges({ dirty, onDiscard: discardDraft, onSave: saveDraft, label: `${name} edits` })

  /** The Canvas draft in Classic's SectionDraft shape, so the panel renders Classic's own FieldRow on top of it. */
  const sectionDraft: SectionDraft = {
    c: channel,
    custom: draftSl3.custom[channel] as SectionDraft['custom'],
    base: draftSl3.base,
    dirty,
    readOnly: autopilot,
    isOpen: (k) => !!openKeys[k],
    setOpen: (k, v) => setOpenKeys((o) => ({ ...o, [k]: v })),
    setCustom: setCustomDraft,
    setBase: setBaseDraft,
    resetBase: (k) => { patchDraft((d) => { const b = { ...d.base }; delete b[k]; return { ...d, base: b } }); setOpenKeys((o) => ({ ...o, [k]: false })) },
    hasBase: (k) => k in draft.base,
    save: () => { saveDraft(); return '' },
    discard: discardDraft,
    pending: () => ({ custom: { ...draft.custom }, base: { ...draft.base } }),
  }

  // what this channel has now: changes still waiting to be sent, or in review, aren't live yet
  const ui = usePushUi()
  const liveCtx: LiveCtx = useMemo(() => ({
    waiting: new Set(pendingChanges(sl3, ui.pushed, ui.sent).map((x) => x.key)),
    review: new Set(ui.receipts.filter((r) => receiptStatus(r) === 'review').map((r) => `${r.channel}:${r.field}`)),
  }), [sl3, ui.pushed, ui.sent, ui.receipts])
  const pendingTip = useRef<string | null>(tipId)
  const wasOpen = useRef(false)
  if (tipsOpen && !wasOpen.current) pendingTip.current = tipId // the panel opens on the tip the URL names (header toggle)
  wasOpen.current = tipsOpen
  const content = cvContentFor(p.id)
  // the booking card's nightly line and cleaning fee are editable here (PricePanel), so "Your edits" shows the draft
  const price = useMemo(() => canvasPrice(p.id, channel, live ? sl3 : draftSl3), [p.id, channel, sl3, draftSl3, live])
  // the facts the page states that have a setting elsewhere (facts.ts): Policies' cancellation, Pricing's max guests
  const policy = useChannelPolicy(channel)
  const cancel = useMemo(() => cancelFacts(channel, policy), [channel, policy])
  const guestsMax = maxGuests(p.id, channel, live ? sl3 : draftSl3)
  /* "Show only editable sections": off by default, kept in the URL (?editable=1) */
  const editableOnly = params.get('editable') === '1'
  const photosNav = usePhotosNav()

  /* demo URL state: &accept=<id>,<id> accepts tips (as if the host had), for the "after accepting" and "Live now" shots */
  const acceptList = params.get('accept')
  useEffect(() => {
    if (!acceptList) return
    const s = useStore.getState()
    acceptList.split(',').forEach((id) => {
      const t = tipsFor(channel).find((x) => x.id === id)
      if (!t || s.sl3.tips[t.id] === 'accepted') return
      s.sl3Tip(t.id, 'accepted')
      if (t.to) s.sl3Custom(channel, t.field, t.to)
    })
  }, [acceptList, channel])

  /** Patch the URL state. Reads the live URL (not this render's params), so patches from effects never undo each other. */
  const set = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search)
    Object.entries(patch).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)))
    setParams(next, { replace: true })
  }, [setParams])

  /* the one right-hand slot (D-927): the Tips panel (whole page) or this page's field panel, never both. Opening a
     part's panel clears Tips; opening Tips (header chip) force-closes the part's panel. */
  useExclusivePanel('tips', tipsOpen, () => set({ tips: null, tip: null }))
  const selectedArea = selected ? cvArea(channel, selected) : undefined
  const panelArea = selectedArea && !tipsOpen && selectedArea.field !== 'photos' ? selectedArea : undefined
  const docked = !mobile && !!panelArea
  // Photos never open a side panel: a tap on the photos opens the full-screen Manage photos takeover, the one Classic
  // opens (screens/channel/PhotosShells.tsx), locked to this channel
  const select = (id: string | null) => set(id && cvArea(channel, id)?.field === 'photos' ? { select: null, ask: null, tips: null, tip: null, [PHOTOS_OPEN_PARAM]: '1' }
    : id ? { select: id, ask: null, tips: null, tip: null } : { select: null, ask: null })
  // an old ?select=<photos> link opens the takeover too
  useEffect(() => { if (selectedArea?.field === 'photos') set({ select: null, ask: null, [PHOTOS_OPEN_PARAM]: '1' }) }, [selectedArea, set])
  useExclusivePanel('cv-edit', docked, () => select(null))
  useEffect(() => { if (tipsOpen && params.has('select')) set({ select: null, ask: null }) }, [tipsOpen, params, set])

  const m = useCvModel(channel, draftSl3, live, tipsOpen ? focusId : null, on, draftLib, liveCtx, sl3, lib, p.id)

  /** tip (purple) › editable here (orange) › read-only (no colour). A field the host can't change here — owned by the
   *  Knowledge Hub or the channel, Autopilot on, or set by Field visibility — has no colour unless a tip waits on it. */
  const toneOf = (a: CvAreaDef): CvTone => {
    // photos and price lines are edited outside the panel's AI (the photos takeover, Pricing's rows): orange, no tip
    if (a.field === 'photos' || priceKeysFor(channel, a.id)) return autopilot ? 'none' : 'refine'
    if (!a.field) return 'none'
    if (m.tipsByField[a.field]?.length) return 'tip'
    if (autopilot) return 'none'
    const st = fieldStateNow(channel, a.field, draftSl3)
    if (st === 'hub' || st === 'set' || st === 'linked') return 'none'
    // a field on the Base (or a listing-wide one not opened yet) isn't editable as it stands — Customize / Edit for all
    // channels comes first — so, like Classic's rule (no Rewrite icon on a Base field), it gets no orange; the panel
    // still opens on it with the Customize action
    if (st === 'inherit' || st === 'listing') return 'none'
    if (fieldVis?.[a.field] === 'show' || fieldVis?.[a.field] === 'hidden') return 'none'
    return 'refine'
  }

  /* fit the page to the available width */
  const stageRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const [avail, setAvail] = useState(0)
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setAvail(el.clientWidth))
    ro.observe(el); setAvail(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  // Opening a panel never rescales the page: keep the closed-panel zoom and let the page reflow to the narrower width
  // (the channel's narrow layout when the desktop one no longer fits).
  const closedZoom = useRef<number | null>(null)
  const fitted = fit(avail)
  const panelReflow = tipsOpen || docked
  if (!panelReflow && avail) closedZoom.current = fitted.zoom
  const keepZoom = closedZoom.current ?? fit(avail + tipsPanel()).zoom
  // phones: the channel's own mobile layout at the phone's width, never scaled (the panel is a bottom sheet, so no reflow)
  const L = mobile && avail ? { zoom: 1, width: avail, narrow: true }
    : panelReflow && avail ? { zoom: keepZoom, width: avail / keepZoom, narrow: avail / keepZoom < WIDE } : fitted

  /* scrolling: to the open tip's area, the selected area, or the Details tab */
  const scrollTo = useCallback((areaId: string | undefined, smooth = true, onlyIfHidden = false) => {
    if (!areaId) return
    const el = layerRef.current?.querySelector(`[data-cv-area="${areaId}"]`)
    if (!el) return
    // scrollIntoView mis-measures inside a CSS-zoomed page, so centre it by hand in the nearest scroller
    let sc: HTMLElement | null = el.parentElement
    while (sc && !(sc.scrollHeight > sc.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    if (!sc) { el.scrollIntoView({ block: 'center' }); return }
    const r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect()
    // the sticky canvas bar covers the scroller's first ~56px
    if (onlyIfHidden && r.top >= sr.top + 64 && r.top <= sr.bottom - 64) return
    sc.scrollTo({ top: sc.scrollTop + (r.top - sr.top) - Math.max(72, (sr.height - r.height) / 2), behavior: smooth ? 'smooth' : 'auto' })
  }, [])
  const first = useRef(true)
  useEffect(() => {
    if (!avail) return
    if (!first.current) return
    first.current = false
    const jump = () => {
      if (selected) scrollTo(selected, false)
      else if (tipId) { const tp = tipsFor(channel).find((t) => t.id === tipId); if (tp) scrollTo(areaForField(channel, tp.field)?.id, false) }
      else if (tab && tab !== 'essentials') scrollTo(TAB_ANCHOR[channel][tab], false)
    }
    // once now, once more after fonts and images settle the layout
    window.setTimeout(jump, 50); window.setTimeout(jump, 600) // not cleared when the width settles (that re-runs this effect)
  }, [avail]) // eslint-disable-line react-hooks/exhaustive-deps
  // the part just tapped stays in view while the panel opens and the page reflows narrower beside it
  useEffect(() => {
    if (!selected || first.current) return
    const t = window.setTimeout(() => scrollTo(selected, true, true), 120)
    return () => window.clearTimeout(t)
  }, [selected, L.width, L.zoom, L.narrow, scrollTo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && new URLSearchParams(window.location.search).has('select')) set({ select: null, ask: null }) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [set])

  /** A tip's own marker (Airbnb's "Show more" dot): opens the panel of the part the tip changes. */
  const openTip = (id: string) => {
    const f = tipsFor(channel).find((t) => t.id === id)?.field
    const a = f ? areaForField(channel, f) : undefined
    if (a) select(a.id)
  }

  /** Keep the live version: drop this channel's edits (and accepted tips, and any local unsent draft) so the page
   *  matches what guests see today. */
  const dismissAll = () => {
    const keys: string[] = []
    m.allEdits.forEach((e) => {
      if (e.key !== PHOTO_KEY && fieldState(channel, e.key) === 'listing') act.base(e.key, liveValue(channel, e.key, sl3, liveCtx))
      else keys.push(e.key)
    })
    // a channel-only amenity takes its sub-options (`amenity:<name>@opt:<legend>`) with it
    const opts = Object.keys(sl3.custom[channel] ?? {}).filter((k) => keys.some((x) => x.startsWith('amenity:') && k.startsWith(`${x}@opt:`)))
    discardCustom(channel, [...keys, ...opts])
    Object.entries(sl3.tips).forEach(([id, st]) => { if (st === 'accepted' && tipsFor(channel).some((t) => t.id === id)) act.tip(id, 'dismissed') })
    setRawDraft(emptyCvDraft(channel)); setOpenKeys({})
    setKeep(false); set({ compare: null, keep: null })
  }

  /** Can the host change this part here? A field the channel or the Knowledge Hub owns, or that Field visibility shows
   *  read-only / hides, can't; the photo order and the price lines can. (Autopilot only pauses editing, so it doesn't
   *  change what counts as editable.) */
  const editable = (id: string) => {
    const a = cvArea(channel, id)
    if (!a) return false
    if (a.field === 'photos' || priceKeysFor(channel, id)) return true
    if (!a.field) return false
    const st = fieldStateNow(channel, a.field, draftSl3)
    if (st === 'hub' || st === 'set' || st === 'linked') return false
    return fieldVis?.[a.field] !== 'show' && fieldVis?.[a.field] !== 'hidden'
  }

  const ctx = useMemo(() => ({
    channel, pid: p.id, live, zoom: L.zoom, selected, focusTip: m.focusTip, focusField: m.focusField, sl3: draftSl3, lib: draftLib, content, price,
    cancel, maxGuests: guestsMax, text: m.text, photos: m.photos, extras: m.extras, tipsByField: m.tipsByField, toneOf, select, openTip, editableOnly, editable,
  }), [channel, p.id, live, L.zoom, selected, m, draftSl3, draftLib, content, price, cancel, guestsMax, autopilot, fieldVis, editableOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // each marker at its area's top-right corner, clear of the text and of other markers (./markers.ts)
  const pageRef = useRef<HTMLDivElement>(null)
  useMarkerPlacement(pageRef, [ctx, L.width, L.zoom, L.narrow])

  const edits = m.allEdits.length
  const note = live ? `Live now · what ${name} guests see today` : `The page as ${name} guests see it`

  /** A read-only part's explanation: the property's facts and prices (cvLockFor), with the cancellation and price
   *  lines re-read from Policies and Pricing (facts.ts) so the panel never contradicts them. */
  const lockOf = (a: CvAreaDef) => {
    const lock = cvLockFor(p.id, channel, a, price)
    if (!lock) return lock
    if (a.id === 'cancellation' || a.id === 'policy') return { ...lock, text: cancel.lock }
    if (a.id === 'nightly') return { ...lock, text: `€${price.night} × ${STAY.nights} weeknights. Weekend nights are €${price.weekend}. Change rates, discounts and minimum stays in Pricing.` }
    if (a.id === 'price' && channel === 'booking') return { ...lock, text: `€${price.night} weeknights + €${price.cleaning} cleaning on Booking.com, from Pricing and the calendar.` }
    if (a.id === 'price' && channel === 'direct') return { ...lock, text: `€${price.night} weeknights · €${price.weekend} weekends on your site, no service fee.` }
    if (a.id === 'cleaning') return { ...lock, text: `€${price.cleaning} per stay on ${name === 'Direct' ? 'your site' : name}.` }
    return lock
  }

  /* ---------- the panel for the selected part ---------- */
  const panelDef = panelArea?.field ? fieldByKey(panelArea.field) : undefined
  const fp = useFieldPanel(channel, panelArea?.id, panelDef, sectionDraft)
  function panelTitle(a: CvAreaDef) {
    if (a.field) return fieldByKey(a.field)?.label ?? a.name
    if (priceKeysFor(channel, a.id)) return a.name
    return lockOf(a)?.title ?? a.name
  }
  /** The title row: the field's name, then the orange Rewrite-with-AI trigger Classic puts
   *  beside a field label, when the field can be typed into and has no tip. It reveals the Rewrite card under the
   *  field; nothing about it shows until then. */
  function panelHead(a: CvAreaDef) {
    const t = panelTitle(a)
    if (!a.field || !fp.rewriteOn) return t
    return (
      <span className="cv-panel__titlerow">
        <span>{t}</span>
        <SmartifyTrigger label={`Rewrite ${t.toLowerCase()} with AI`} active={fp.rewriteOpen} onOpen={() => fp.setRewriteOpen(!fp.rewriteOpen)} />
      </span>
    )
  }
  function panelBody(a: CvAreaDef) {
    const keys = priceKeysFor(channel, a.id)
    if (keys) return <PricePanel key={a.id} pid={p.id} channel={channel} keys={keys} draft={sectionDraft} />
    if (a.field) {
      if (!panelDef) return null
      return <FieldPanel key={a.id} channel={channel} def={panelDef} draft={sectionDraft} ctl={fp} onAcceptedTip={dropDraft} />
    }
    const lock = lockOf(a) // this property's facts, prices and policies in the explanation
    if (!lock) return null
    const link = lock.link ? { label: lock.link.label, to: lock.link.to(p.id, channel) } : undefined
    return (
      <CvLockPop title={lock.title} text={lock.text} link={link} note={scenario && a.id === 'price' && channel === 'airbnb' ? '1 pricing change waits for you there (weekly discount)' : undefined} />
    )
  }
  const panel = docked && panelArea ? (
    <CvEditPanel key={panelArea.id} title={panelHead(panelArea)} onClose={() => select(null)}>
      {panelBody(panelArea)}
    </CvEditPanel>
  ) : null
  // phones: the same panel body in a bottom sheet (its head shows the title and ×)
  const sheetArea = mobile ? panelArea : undefined

  const Page = channel === 'booking' ? BookingPage : channel === 'direct' ? DirectPage : AirbnbPage
  const main = (
    <div className="cv-canvas">
      <CvBar compare={live ? 'live' : 'edits'}
        onCompare={(v: CvCompare) => set({ compare: v === 'live' ? 'live' : null, select: null })}
        edits={edits} onKeep={() => setKeep(true)}
        left={<label className="cv-bar__toggle"><Toggle checked={editableOnly} label="Show only editable sections" onChange={(v) => set({ editable: v ? '1' : null })} />Show only editable sections</label>} />
      <CvFrame url={content.url[channel]} note={note} live={live}>
        {/* no dimming, ever ("make sure the content is readable") — outlines and markers only */}
        <div className="cv-layer" ref={layerRef} onClick={() => selected && select(null)}>
          <div className="cv-stage" ref={stageRef}>
            <div className="cv-page" ref={pageRef} style={{ width: L.width, zoom: L.zoom }}>
              <CvProvider value={ctx}><Page narrow={L.narrow} /></CvProvider>
            </div>
          </div>
        </div>
      </CvFrame>
      <BottomSheet open={!!sheetArea} title={sheetArea ? panelHead(sheetArea) : ''} label={sheetArea ? panelTitle(sheetArea) : undefined} onClose={() => select(null)}>
        <div className="cv-sheet">{sheetArea ? panelBody(sheetArea) : null}</div>
        {/* the sheet covers the shell's Discard / Save bar, so the page's pair comes into the sheet (only while dirty) */}
        <MobileSheetSaveButtons className="cv-sheet__save" />
      </BottomSheet>
      {keep && <CvKeepDialog channelName={name} changes={m.allEdits.map((e) => ({ section: e.area.tab === 'essentials' ? 'Details' : e.area.tab[0].toUpperCase() + e.area.tab.slice(1), what: e.area.name, from: short(e.from), to: short(e.to) }))}
        onCancel={() => { setKeep(false); set({ keep: null }) }} onDismiss={dismissAll} />}
      {/* the one shared Discard/Save for every drafted field/photo order on this channel (ds/unsaved.tsx) */}
      <UnsavedBar />
      {/* Photos: the same full-screen Manage photos takeover Classic opens, locked to this channel */}
      <PhotosFullTakeover channel={channel} open={photosNav.open} onClose={photosNav.closePhotos} />
    </div>
  )
  return (
    <Split main={main} panel={tipsOpen ? (
      <ChannelTips channel={channel} focusId={tipId}
        onFocus={(id, field) => {
          // The panel reports its first tip on mount (twice under StrictMode); a tip named in the URL wins until it's reached.
          const want = pendingTip.current
          if (want && want !== id && tipsFor(channel).some((t) => t.id === want && sl3.tips[t.id] !== 'dismissed')) return
          const arriving = want === id
          pendingTip.current = null
          // stepping between tips selects (outlines) the part each one changes, and brings it into view
          setFocusId(id); if (tipId !== id) set({ tip: id }); scrollTo(areaForField(channel, field)?.id, !arriving)
        }}
        onClose={() => { setFocusId(null); set({ tips: null, tip: null }) }} />
    ) : panel ?? undefined} />
  )
}

const FIELD_BASE = (k: string) => FIELDS.find((f) => f.key === k)?.base ?? ''
const short = (s: string) => (s.length > 34 ? `${s.slice(0, 32)}…` : s)
