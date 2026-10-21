/* Channels › {channel} › Availability (Hostaway replica of Property › Availability: HS-37 General, HS-38 Booking rules).
 * Same frame as Pricing: page head + property switcher, underline tabs, section head with Discard changes / Save, stacked
 * rows whose caption says "Uses the Base" / "Custom for {channel}" / "All channels" with the one text-link action
 * (common.tsx ScopedRow + useSectionDraft: edits wait for Save, "Use the Base" keeps the custom value in `@stash`).
 * Fields and scope: data/availability.ts (the five stay rules reuse data/v3-ch.ts AVAILABILITY keys).
 * Instant book (HS-39, moved here from Booking policies): the real per-channel matrix, saved under `policy:instant`.
 * URL states: ?tab=general|rules|instant-book · ?autopilot=1 (read-only demo). */
import { useCallback, useMemo } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Diff, HeadTips, Icon, Locked, NumberField, PageHead, QueryTabs, SaveActions, SectionHead, SelectBox, Split, UnsavedBar, Weekdays, WizardChoice, WizardChoices, cx } from '../../ds'
import type { ListingChannel } from '../../data/sl3'
import {
  AVAIL_FIELDS, AVAIL_TABS, INSTANT_COLUMNS, INSTANT_KEY, INSTANT_NOTE, INSTANT_QUESTION, INSTANT_UNAVAILABLE, MAX_NIGHTS, nightsOf, nightsText,
  type AvailField, type AvailTab,
} from '../../data/availability'
import { INSTANT_DEFAULT, type AvailRow } from '../../data/v3-ch'
import { availabilityFor } from '../../data/property-listing'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { CH_NAME, ChannelLead, DraftProvider, ScopedRow, useChannel, useChannelDemoParams, useChannelPlan, useDraft, useSectionDraft, viewOf } from './common'
import { SHARED_TIP_NOTE, screenTipId, tipEditable, useScreenTips, useTipsGate, visibilityOf, type ScreenTipDef } from './screenTips'

export function Availability() {
  const p = useProperty()
  const c = useChannel()
  useChannelDemoParams(c)
  if (!c) return <Navigate to={`/property/${p.id}/ch/airbnb/availability`} replace />
  return <AvailabilityPage key={c} c={c} />
}

const keyOf = (f: AvailField) => `avail:${f.key}`

function AvailabilityPage({ c }: { c: ListingChannel }) {
  const p = useProperty()
  const [params, setParams] = useSearchParams()
  const tab = (AVAIL_TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'general') as AvailTab
  const meta = AVAIL_TABS.find((t) => t.id === tab)!
  const { autopilot } = useChannelPlan(c)
  const setPlan = useStore((s) => s.sl3Plan)
  const draft = useSectionDraft(c, `availability:${tab}`, { readOnly: autopilot }) // Autopilot on: read-only until it is turned off
  const q = (id: string) => { const n = new URLSearchParams(params); n.set('tab', id); return `?${n}` }
  // the active property's own stay rules (data/property-listing.ts availabilityFor); the day restrictions keep their row
  const rows = availabilityFor(p.id)
  const rowOf = (f: AvailField): AvailRow => rows.find((r) => r.key === f.key) ?? f.row

  // effective value of a field in this draft (for the min ≤ max check)
  const valueOf = (f: AvailField) => {
    const r = rowOf(f)
    const st = r.state[c]
    if (!st) return ''
    return viewOf({ key: keyOf(f), tab: 'essentials', label: f.label, kind: 'text', state: { [c]: st }, base: r.base, value: r.value?.[c] !== undefined ? { [c]: r.value[c]! } : undefined }, c, draft.custom, draft.base).value
  }
  const general = AVAIL_FIELDS.general
  const minN = Number(nightsOf(valueOf(general[0])))
  const maxN = Number(nightsOf(valueOf(general[1])))
  const maxTooShort = tab === 'general' && minN > 0 && maxN > 0 && maxN < minN

  // Tips: useAvailabilityTips (below) builds the list. Accept hands the value to the row's real control: into this
  // section's unsaved draft, control focused, nothing changes or is sent until Save. On Autopilot the page is
  // read-only, so Accept only marks the tip.
  const propose = (t: AvailTab, f: AvailField, value: string) => {
    const st = rowOf(f).state[c]
    if (t !== tab || draft.readOnly || !st || st === 'hub' || st === 'set') return
    const k = keyOf(f)
    if (st === 'listing') { draft.setOpen(k, true); draft.setBase(k, value, rowOf(f).base) }
    else draft.setCustom(k, value)
    setTimeout(() => document.getElementById(`av-${f.key}`)?.querySelector<HTMLElement>('.h-field-row__control input, .h-field-row__control button')?.focus({ preventScroll: true }), 0)
  }
  const tipDefs = useAvailabilityTips(p.id, c, propose)
  const setTab = useCallback((id: string) => setParams((prev) => { const n = new URLSearchParams(prev); n.set('tab', id); return n }, { replace: true }), [setParams])
  const { chip: tipsChip, panel: tipsPanel, rowTip, tabCount, commitDrafted } = useScreenTips(c, tipDefs, { current: tab, onGoTo: setTab }, { key: `${c}:${tab}`, dirty: draft.dirty })
  const save = () => { commitDrafted(); return draft.save() } // a tip accepted into this draft is accepted on Save only (T-1)

  const row = (f: AvailField) => {
    const r = rowOf(f)
    const st = r.state[c]
    if (!st) return null
    const note = f.note?.[c]
    const after = (note || (f.key === 'max_stay' && maxTooShort)) ? (
      <>
        {f.key === 'max_stay' && maxTooShort && <p className="h-error-text">The maximum stay can’t be shorter than the minimum stay ({minN} nights).</p>}
        {note && <p className="h-field-note">{note}</p>}
      </>
    ) : undefined
    return (
      <div key={f.key} id={`av-${f.key}`}>
      <ScopedRow c={c} k={keyOf(f)} label={f.label} help={f.help} orig={st} baseValue={r.base} chValue={r.value?.[c]} after={after} {...rowTip(`av-${f.key}`)}
        hintAction={f.perDay && !draft.readOnly ? <PerDayToggle fallback={nightsOf(valueOf(f))} /> : undefined}
        control={(v, write, locked, disabled, refs) => {
          if (locked) return <Locked>{v}</Locked>
          if (f.control === 'days') return <Weekdays value={v} label={f.label} disabled={disabled} onChange={write} firstRef={refs.select} />
          if (f.control === 'select') return <SelectBox selectRef={refs.select} value={v} options={r.options} label={f.label} disabled={disabled} onChange={write} />
          if (f.perDay && perDayOn(draft, 'custom')) return <PerDayStrip label={f.label} fallback={nightsOf(v)} disabled={disabled} />
          // NumberField (ds/v3-ch.tsx): the same input + "nights" affix as before, plus the shared up/down spinner
          // and Up/Down keys. The clamp to 1…MAX_NIGHTS and the nightsText storage format are
          // unchanged, so the draft, the min ≤ max check and Discard/Save all behave exactly as they did.
          return (
            <NumberField label={f.label} value={nightsOf(v)} disabled={disabled} inputRef={refs.input} unit="nights"
              invalid={f.key === 'max_stay' && maxTooShort} min={1} max={MAX_NIGHTS}
              onChange={(next) => { const d = next.replace(/\D/g, '').slice(0, 4); write(nightsText(d === '' ? '' : String(Math.min(MAX_NIGHTS, Math.max(1, Number(d)))))) }} />
          )
        }}
      />
      </div>
    )
  }

  return (
    // same chrome as Listing/Policies/Pricing (third-round fix): the whole head, title, property switcher, Tips
    // chip and the tab row, stays pinned together in one .ch-editor__head block (sticky), while the section's rows
    // scroll beneath it as a sibling inside Split. Only this outer wrapper moved; the Tips/Split panel mechanism and
    // the Discard changes / Save bar below are unchanged.
    <div className="ch-editor">
      <div className="ch-editor__head">
        <div className="ch-page">
          <PageHead lead={<ChannelLead c={c} />} title="Availability" property={p}
            actions={<>
              {autopilot && <span className="ch-autoline" role="status"><Icon name="rocket" size={16} />Autopilot is on<button type="button" className="h-textlink" onClick={() => setPlan(c, { mode: 'suggest' })}>Turn off to edit</button></span>}
              {/* phones: the tab row hides its own Tips chip (ds/v3/ch.css), so it shows here instead, as in the Listing editor */}
              <HeadTips>{tipsChip}</HeadTips>
            </>} />
        </div>
        <div className="ch-tabrow">
          <QueryTabs active={tab} items={AVAIL_TABS.map((t) => ({ id: t.id, label: t.label, to: q(t.id), count: tabCount(t.id) || undefined }))} />
          {tipsChip}
        </div>
      </div>
      <Split main={
        <DraftProvider value={draft}>
          <div className="ch-page">
            <SectionHead title={meta.label} desc={meta.desc}
              actions={<SaveActions dirty={draft.dirty} onDiscard={draft.discard} onSave={save} />} /> {/* ≤ 767px: SaveActions moves the pair into the sticky bar itself */}

            {tab === 'instant-book' ? <InstantBook c={c} /> : AVAIL_FIELDS[tab].map(row)}
            <UnsavedBar />
          </div>
        </DraftProvider>
      } panel={tipsPanel} />
    </div>
  )
}

/** HS-39: "How should booking requests be handled?" with the channel × option matrix, this channel's row. */
function InstantBook({ c }: { c: ListingChannel }) {
  const d = useDraft()
  const stored = d.custom?.[INSTANT_KEY]
  const value = typeof stored === 'string' ? stored : INSTANT_DEFAULT[c]
  // the channel's default is "no entry" (as Booking policies and the Hub store it), anything else is the chosen id
  const pick = (id: string) => d.setCustom(INSTANT_KEY, id === INSTANT_DEFAULT[c] ? undefined : id)
  const note = INSTANT_NOTE[c]
  return (
    <div className="ch-mt">
      <h3 className="h-matrix-q">{INSTANT_QUESTION}</h3>
      {/* the page is already this channel, so no one-row channel matrix: the strategy wizard's single-select
       *  cards at the form column's width; an option the channel doesn't support isn't offered */}
      <div className="ch-instant">
        <WizardChoices label={INSTANT_QUESTION}>
          {INSTANT_COLUMNS.filter((o) => !INSTANT_UNAVAILABLE[c]?.includes(o.id)).map((o) => (
            <WizardChoice key={o.id} name={`instant-${c}`} checked={value === o.id} disabled={d.readOnly}
              onChange={() => pick(o.id)} title={o.label} desc={o.sub} />
          ))}
        </WizardChoices>
      </div>
      {note && <p className="h-field-note">{note}</p>}
    </div>
  )
}

/* ---------------- Minimum stay per night of the week ---------------- */
/** rejecting the earlier seven stacked full-width rows ("I don't think it's optimal… create a
 *  different version that is a little more clear"): seven numbers is a *week*, so it reads as a week strip, the same
 *  Mon-first order the Calendar already uses, with each small input directly under its own day label. That removes
 *  the dead horizontal gap between a day name on the far left and its input on the far right, and lets you compare
 *  all seven values at a glance instead of scanning down seven rows.
 *
 *  Setting several days at once is the common case (a weekday number and a weekend number), so the "Apply Mon (2)
 *  to…" row does it in one click, with the number spelled out so there's nothing to infer. Nothing novel: a labelled
 *  grid, number inputs with the same stepper as every other numeric field (item 31), and plain buttons.
 *
 *  Draft behaviour is untouched: the value lives in the section draft under its own key, so it stages behind the
 *  same Discard changes / Save as every other row on this page. */
const PERDAY_KEY = 'avail:min_stay@perday'
const PERDAY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
/** Indices into PERDAY_DAYS. Fri/Sat/Sun is the weekend for a short-stay listing: those are the nights a weekend
 *  break actually starts on, which is what a per-night minimum keys off. */
const PERDAY_WEEKEND = [4, 5, 6]

/** Per-night minimum stay: "Edit per day" REPLACES the single nights field with the week itself, a value
 *  under each day name, in the field's own place, no box, no title or hint repeated, no "apply to…" shortcuts and no footer -
 *  and one plain link switches between the two: "Edit per day" / "Use one minimum for every night". The value still lives in
 *  the section draft under its own key. `scope`: 'custom' (a channel's own, default) or 'base' (Listing base). */
function usePerDay(fallback: string, scope: 'custom' | 'base') {
  const d = useDraft()
  const savedBase = useStore((s) => s.sl3.base[PERDAY_KEY]) // primitives only (Zustand v5)
  const savedCustom = useStore((s) => s.sl3.custom[d.c]?.[PERDAY_KEY])
  const saved = scope === 'base' ? savedBase : savedCustom
  const stored = scope === 'base' ? d.base?.[PERDAY_KEY] : d.custom?.[PERDAY_KEY]
  const on = perDayOn(d, scope)
  const clamp = (n: number) => Math.min(MAX_NIGHTS, Math.max(1, n))
  const seed = clamp(Number(fallback) || 1)
  const vals = typeof stored === 'string' && stored !== '' ? PERDAY_DAYS.map((_, i) => clamp(Number(stored.split(',')[i]) || seed)) : PERDAY_DAYS.map(() => seed)
  const hasSaved = typeof saved === 'string' && saved !== ''
  // Switching to "Edit per day" is only a view until a night differs (audit B-2): with nothing saved per day and every
  // night equal to the single minimum, the mode is remembered in the draft's `open` map (never dirty) and no value is
  // drafted, so no Unsaved bar. Any night that differs drafts the week as a real change; back to all-equal drops it.
  const put = (v: string | undefined) => {
    const neutral = v !== undefined && !hasSaved && v.split(',').every((x) => Number(x) === seed)
    if (v === undefined || neutral) {
      if (scope === 'base') { if (hasSaved && v === undefined) d.setBase(PERDAY_KEY, '', ''); else d.resetBase(PERDAY_KEY) }
      else d.setCustom(PERDAY_KEY, undefined) // saved per day: removed on Save; nothing saved: no entry at all
    } else if (scope === 'base') d.setBase(PERDAY_KEY, v, '')
    else d.setCustom(PERDAY_KEY, v)
    d.setOpen(PERDAY_KEY, v !== undefined) // after resetBase, which also closes it
  }
  return { on, vals, clamp, put }
}
export const perDayOn = (d: { custom?: Record<string, string | null>; base?: Record<string, string>; isOpen?: (k: string) => boolean }, scope: 'custom' | 'base') => {
  const v = scope === 'base' ? d.base?.[PERDAY_KEY] : d.custom?.[PERDAY_KEY]
  if (typeof v === 'string' && v !== '') return true
  // switched to per day in this draft with every night still equal (no value drafted): see usePerDay
  return v !== '' && !!d.isOpen?.(PERDAY_KEY)
}
export function PerDayStrip({ label, fallback, scope = 'custom', disabled }: { label: string; fallback: string; scope?: 'custom' | 'base'; disabled?: boolean }) {
  const { vals, clamp, put } = usePerDay(fallback, scope)
  const setDay = (i: number, v: number) => put(vals.map((x, j) => (j === i ? v : x)).map(clamp).join(','))
  return (
    <div className="h-perday__week">
      {PERDAY_DAYS.map((dn, i) => (
        <div key={dn} className={cx('h-perday__day', PERDAY_WEEKEND.includes(i) && 'is-weekend')}>
          <span className="h-perday__dayname" aria-hidden="true">{dn}</span>
          <NumberField label={`${label} for ${dn}`} value={String(vals[i])} min={1} max={MAX_NIGHTS} disabled={disabled}
            onChange={(next) => { const n = next.replace(/\D/g, '').slice(0, 4); setDay(i, n === '' ? 1 : clamp(Number(n))) }} />
        </div>
      ))}
    </div>
  )
}
/** The per-day switch sits on the right of the "N channels" caption row, not under it. */
export function PerDayToggle({ fallback, scope = 'custom' }: { fallback: string; scope?: 'custom' | 'base' }) {
  const { on, vals, put } = usePerDay(fallback, scope)
  return (
    <button type="button" className="h-textlink h-perday__switch" onClick={() => put(on ? undefined : vals.join(','))}>{on ? 'Use one minimum for every night' : 'Edit per day'}</button>
  )
}

/* ---------- Availability tips (shared by this screen and the property rail's per-page count) ----------
 * "…also in Pricing, sometimes in Availability… next to whatever it is that the tip is for":
 * "sometimes" = at most two here, each tied to the row it would change (`field` = that row's id) with the purple dot
 * after its label (SettingRow tips/onTip via screenTips rowTip) and a count on its tab. one step from what
 * is saved today, never a fixed target; the reasoning is strategy, not measured data. Gated like every channel tip
 * (screenTips useTipsGate); a hidden or read-only row (Field visibility) has no tip. `propose` is the screen's own
 * Accept (the rail passes none: it only counts). */
const stepTo = (options: string[], cur: string, dir: 1 | -1) => {
  if (!options.length) return cur
  const i = options.indexOf(cur)
  const j = i < 0 ? (dir > 0 ? options.length - 1 : 0) : Math.min(options.length - 1, Math.max(0, i + dir))
  return options[j]
}
const fieldOf = (t: Exclude<AvailTab, 'instant-book'>, k: string) => AVAIL_FIELDS[t].find((f) => f.key === k)!
export function useAvailabilityTips(pid: string, c: ListingChannel, propose?: (t: AvailTab, f: AvailField, value: string) => void): ScreenTipDef[] {
  const gate = useTipsGate(c)
  const rows = availabilityFor(pid)
  const custom = useStore((s) => s.sl3.custom[c]) // stable references (Zustand v5); derived below
  const base = useStore((s) => s.sl3.base)
  const fv = useStore((s) => s.overview?.[pid]?.fieldVisibility)
  return useMemo(() => {
    if (!gate) return []
    const name = CH_NAME[c]
    const rowOf = (f: AvailField): AvailRow => rows.find((r) => r.key === f.key) ?? f.row
    // what is saved (never the live draft): Accept only fills the draft, so the card doesn't move under you
    const at = (f: AvailField) => {
      const r = rowOf(f)
      return r.state[c] ? viewOf({ key: keyOf(f), tab: 'essentials', label: f.label, kind: 'text', state: { [c]: r.state[c] }, base: r.base, value: r.value?.[c] !== undefined ? { [c]: r.value[c]! } : undefined }, c, custom, base).value : ''
    }
    const editable = (f: AvailField) => tipEditable(visibilityOf(fv, keyOf(f), rowOf(f).state[c] ?? 'inherit'))
    const minField = fieldOf('general', 'min_stay')
    const prepField = fieldOf('rules', 'prep')
    const min = Number(nightsOf(at(minField)))
    const prep = at(prepField)
    const prepTarget = stepTo(rowOf(prepField).options ?? [], prep, 1)
    const accept = (t: AvailTab, f: AvailField, v: string) => (propose ? () => propose(t, f, v) : undefined)
    // a listing-wide row ("Edit for all channels"): the tip changes every channel, and the card says so (T-2)
    const shared = (f: AvailField) => rowOf(f).state[c] === 'listing' && typeof custom?.[keyOf(f)] !== 'string' ? SHARED_TIP_NOTE : undefined
    return [
      // General · Minimum stay length
      ...(rowOf(minField).state[c] && editable(minField) && min > 1 ? [{
        id: screenTipId(c, 'at-minstay'), type: 'Minimum stay length', section: 'General', title: 'Shorten your minimum stay', field: `av-${minField.key}`, tab: 'general',
        main: <Diff from={nightsText(String(min))} to={nightsText(String(min - 1))} note={shared(minField)} />,
        why: [
          { text: 'A shorter minimum stay lets you fill single-night gaps between longer bookings instead of leaving them empty.', source: 'strategy' },
          { text: `Right now guests need at least ${nightsText(String(min))} to book on ${name}.`, source: 'strategy' },
        ],
        onAccept: accept('general', minField, nightsText(String(min - 1))), drafted: true,
      } satisfies ScreenTipDef] : []),
      // Booking rules · Preparation time
      ...(rowOf(prepField).state[c] && editable(prepField) && prepTarget !== prep ? [{
        id: screenTipId(c, 'at-prep'), type: 'Preparation time', section: 'Booking rules', title: 'Add a cleaning buffer between stays', field: `av-${prepField.key}`, tab: 'rules',
        main: <Diff from={prep || 'None'} to={prepTarget} note={shared(prepField)} />,
        why: [
          { text: 'Back-to-back same-day turnovers leave little room for a late check-out or a thorough clean.', source: 'strategy' },
          { text: 'A short buffer protects your rating more than it costs you in bookable nights.', source: 'strategy' },
        ],
        onAccept: accept('rules', prepField, prepTarget), drafted: true,
      } satisfies ScreenTipDef] : []),
    ]
  }, [gate, rows, custom, base, fv, c, propose])
}
