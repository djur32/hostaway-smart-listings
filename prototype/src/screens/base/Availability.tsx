/* Property › Shared › Listing base › Availability (Antonio, 1 Oct: "Under Listing base you will have the details,
 * then pricing and availability, the same way that we have it on the channels"). The property-wide stay rules — the
 * rows of Channels › Availability's General and Booking rules tabs (data/availability.ts AVAIL_FIELDS) — as the Base
 * only. Antonio, 3 Oct: "We have the base, and off of the base others can act dissimilarly, but I don't need to see
 * that here": each row is a plain SettingRow — the Base input, editable straight away, and the informational
 * "ⓘ N channels" caption (N = channels that use the Base; the tooltip names them) — with no action, no link and
 * nothing about a channel's own value. Saving writes the same `avail:<key>` Base keys the channel page reads (data/
 * property-listing.ts availabilityFor + sl3.base) through useSectionDraft (commitAndSend). Instant book has no Base
 * (each channel supports different options), so it isn't on this page at all. Owner: this session. */
import { useSearchParams } from 'react-router-dom'
import { NumberField, PageHead, QueryTabs, SectionHead, SelectBox, SettingRow, Split, TruthTitle, UnsavedBar, Weekdays, useUnsavedChanges } from '../../ds'
import {
  AVAIL_FIELDS, AVAIL_TABS, MAX_NIGHTS, nightsOf, nightsText, type AvailField, type AvailTab,
} from '../../data/availability'
import { availabilityFor } from '../../data/property-listing'
import { useListingChannels } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { DraftProvider, useSectionDraft, viewOf } from '../channel/common'
import { useStore } from '../../store/store'
import { PerDayStrip, PerDayToggle, perDayOn } from '../channel/Availability'

const keyOf = (f: AvailField) => `avail:${f.key}`
/** Instant book has no shared Base (each channel supports different options: Booking.com has no "low risk"), so it's
 *  a channel's own setting and isn't on the Base at all (Antonio, 3 Oct): Channels › {channel} › Availability has it. */
type BaseTab = Exclude<AvailTab, 'instant-book'>
const BASE_TABS = AVAIL_TABS.filter((t): t is (typeof AVAIL_TABS)[number] & { id: BaseTab } => t.id !== 'instant-book')

export function BaseAvailability() {
  const p = useProperty()
  const [params] = useSearchParams()
  const tab = (BASE_TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'general') as BaseTab
  const meta = BASE_TABS.find((t) => t.id === tab)!
  const channels = useListingChannels()
  const c0 = channels[0]
  // one shared draft per tab, keyed apart from any channel's own (channel/common's `${c}:${section}`); `c0` only
  // satisfies the hook's signature — every row below writes the Base (draft.setBase), so sl3.custom[c0] is never touched
  const draft = useSectionDraft(c0, `base:${tab}`)
  // concepts/smart-listing/UNSAVED-PATTERN.md: nothing shown until dirty, the shared top bar (ds/unsaved.tsx) in
  // place of this screen's own always-visible Discard/Save.
  useUnsavedChanges({ dirty: draft.dirty, onDiscard: draft.discard, onSave: draft.save, label: 'Availability' })
  const q = (id: string) => { const n = new URLSearchParams(params); n.set('tab', id); return `?${n}` }
  const rows = availabilityFor(p.id)
  const rowOf = (f: AvailField) => rows.find((r) => r.key === f.key) ?? f.row
  const effective = (f: AvailField) => draft.base[keyOf(f)] ?? rowOf(f).base
  // Antonio, 3 Oct ("We have the base, and off of the base others can act dissimilarly, but I don't need to see that
  // here"): each row is the Base input and the informational "ⓘ N channels" caption — N = the channels that use the
  // Base (a channel with its own value, e.g. Airbnb's minimum stay, isn't counted), named in the caption's tooltip.
  // Nothing about how another channel differs, no action, no link.
  const savedCustom = useStore((s) => s.sl3.custom)
  // "N channels" only where a channel can differ (Antonio, 3 Oct)
  const varies = (f: AvailField) => { const st = rowOf(f).state; return channels.some((c) => st[c] === 'inherit' || st[c] === 'override') }
  const users = (f: AvailField) => {
    const r = rowOf(f)
    return channels.filter((c) => {
      if (!r.state[c]) return false
      const v = viewOf({ key: keyOf(f), tab: 'essentials', label: f.label, kind: 'text', state: r.state, base: r.base, value: r.value }, c, savedCustom[c], draft.base)
      return v.state !== 'override' && !(f.perDay && savedCustom[c]?.['avail:min_stay@perday']) // the channel's own "Edit per day"
    })
  }

  const general = AVAIL_FIELDS.general
  const minN = Number(nightsOf(effective(general[0])))
  const maxN = Number(nightsOf(effective(general[1])))
  const maxTooShort = tab === 'general' && minN > 0 && maxN > 0 && maxN < minN

  const row = (f: AvailField) => {
    const r = rowOf(f)
    const k = keyOf(f)
    const v = effective(f)
    const write = (next: string) => draft.setBase(k, next, r.base)
    const below = f.key === 'max_stay' && maxTooShort ? <p className="h-error-text">The maximum stay can’t be shorter than the minimum stay ({minN} nights).</p> : undefined
    return (
      <SettingRow key={f.key} label={f.label} help={f.help} state="listing" scopeChannels={varies(f) ? users(f) : undefined} hint={varies(f)} below={below}
        hintAction={f.perDay ? <PerDayToggle fallback={nightsOf(v)} scope="base" /> : undefined}>
        {f.perDay && perDayOn(draft, 'base') ? <PerDayStrip label={f.label} fallback={nightsOf(v)} scope="base" />
          : f.control === 'days' ? <Weekdays value={v} label={f.label} onChange={write} />
          : f.control === 'select' ? <SelectBox value={v} options={r.options} label={f.label} onChange={write} />
          : (
            // NumberField (ds/v3-ch.tsx), the shared numeric control: same clamp and nightsText storage as before,
            // "nights" as Hospitable's plain unit word, plus the small arrows and Up/Down keys (Antonio, 3 Oct).
            <NumberField label={f.label} value={nightsOf(v)} unit="nights"
              invalid={f.key === 'max_stay' && maxTooShort} min={1} max={MAX_NIGHTS}
              onChange={(next) => { const d = next.replace(/\D/g, '').slice(0, 4); write(nightsText(d === '' ? '' : String(Math.min(MAX_NIGHTS, Math.max(1, Number(d)))))) }} />
          )}
      </SettingRow>
    )
  }

  return (
    <DraftProvider value={draft}>
      {/* The same frame as its siblings (base/Pricing.tsx, screens/channel/Availability.tsx, and the reference
       * composition in screens/channel/ListingEditor.tsx): the WHOLE head — title, property switcher and the tab row
       * below it — sticks as one `.ch-editor__head` block while only the fields scroll beneath. It used to be a plain
       * `PageBody` with the tabs inline in the scrolling column, so the head scrolled away and the page behaved
       * unlike every other tabbed listing screen (verification audit, 1 Oct). */}
      <div className="ch-editor">
        <div className="ch-editor__head">
          <div className="ch-page"><PageHead title={<TruthTitle>Availability</TruthTitle>} property={p} /></div>
          <div className="ch-tabrow">
            <QueryTabs active={tab} items={BASE_TABS.map((t) => ({ id: t.id, label: t.label, to: q(t.id) }))} />
          </div>
        </div>
        <Split main={
          <div className="ch-page">
            <SectionHead title={meta.label} desc={meta.desc} />
            {AVAIL_FIELDS[tab].map(row)}
            {/* PageBody used to render this; now it sits in the scrolling column itself, sticky to
                `.h-split__main`'s bottom and scoped to this `.ch-page`'s width (ds/unsaved.tsx). */}
            <UnsavedBar />
          </div>
        } />
      </div>
    </DraftProvider>
  )
}
