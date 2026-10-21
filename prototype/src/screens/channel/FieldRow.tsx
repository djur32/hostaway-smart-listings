/* One Listing field row, shared by Classic (ListingEditor.tsx) and Canvas's field panel (screens/canvas/FieldPanel.tsx):
 * label, help, the control, the scope caption (Uses the Base · Customize for {channel} / Custom for {channel} · Use the
 * Base / N channels · Edit for all channels), field visibility, the purple tip dot and the orange Rewrite-with-AI
 * trigger. Moved here verbatim from ListingEditor.tsx (3 Oct) so the Canvas can render the exact same field in its side
 * panel instead of re-implementing it (Antonio, 3 Oct: "the solution has to be in the sidebar… the same field").
 * It reads the section draft from context (common.tsx DraftProvider/useDraft): Classic passes its useSectionDraft,
 * Canvas an adapter over its own draft — same Discard / Save bar either way. */
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Icon, LinkField, Locked, MapBox, SelectBox, SettingRow, SmartifyTrigger, TagBox, TaskList, Toggle, cx, withShortcodes, type ScopeValue,
} from '../../ds'
import { fieldOn, setByWhy, type FieldDef, type ListingChannel } from '../../data/sl3'
import { FIELD_OPTIONS, FIXED_FIELDS, HELP } from '../../data/v3-ch'
import { CHANNELS, withOtas } from '../../data/channels'
import { useListingChannels } from '../../store/selectors'
import { useStore } from '../../store/store'
import { useProperty } from '../../shell/PropertyLayout'
import { ChannelPhotosRow } from './Photos'
import { EverywhereNote, useDraft, useScopedField, viewOf } from './common'

/* ---------------- Smartify (yellow, user-initiated refine — ds/smartify.tsx) ---------------- */
/** Which fields Smartify can rewrite: EVERY long free-text field (kind 'textarea', on any Listing tab — Summary,
 *  Description, Check-in method details, House manual, Guest access, Neighbourhood, House rules…), derived from the
 *  field kind so a new long-text field picks it up automatically (Antonio, 3 Oct: "these are all fields that require
 *  you to write more text"), plus the one short single-line field where a rewrite makes sense, Property name.
 *  Tags/Languages are chip lists, not free text, so a typed instruction has no single string to rewrite. */
const SMARTIFY_SHORT_FIELDS = new Set(['name'])
export const smartifiable = (def: FieldDef) => def.kind === 'textarea' || SMARTIFY_SHORT_FIELDS.has(def.key)

/** What a field hands Classic when the host asks Smartify for a rewrite. `apply` is the field's own draft write
 *  (useScopedField's write: a channel custom value, or a listing-wide one) — called only on Accept. */
export interface RefineRequest { field: string; label: string; original: string; limit?: number | null; apply: (text: string) => void }
export interface RefineVersion { instruction: string; text: string; source: string; attempt: number }
export interface RefineSession extends RefineRequest { versions: RefineVersion[]; idx: number; busy: boolean }
export interface SmartifyCtl { field: string | null; open: (req: RefineRequest) => void }

/* SIMULATED copy for the canned rewrites below (CONVENTIONS §2: every listing value in this prototype is simulated,
 * under the prototype's one footer disclosure). Variants let "Try again" produce a genuinely different version. */
const WARM = ["You'll feel right at home here.", "We can't wait to welcome you.", 'Settle in and make yourself at home.']
const DETAIL = ['Everything you need for a comfortable stay is ready when you arrive.', 'We share check-in details and a few favourite local spots before you arrive.', "Ask us anything before or during your stay and we'll help."]
const CASUAL = ['Come relax and make yourself at home.', 'Kick back and enjoy the neighbourhood.', 'Drop your bags and settle right in.']
const TITLE_WARM = ['Cosy', 'Welcoming', 'Charming']
const TITLE_DETAIL = [' · ideal for longer stays', ' · a calm city base', ' · great for remote work']

const sentencesOf = (t: string) => t.split(/(?<=[.!?])\s+/).filter(Boolean)
/** The attempt-th variant not already in the text (so a second "Warmer" never repeats the first one's line). */
const variant = (pool: string[], attempt: number, avoid: string) => {
  for (let i = 0; i < pool.length; i++) { const x = pool[(attempt + i) % pool.length]; if (!avoid.includes(x.trim())) return x }
  return pool[attempt % pool.length]
}
/** Cut to `max` characters at a word boundary — never mid-word — dropping a dangling separator. */
const fitTo = (t: string, max: number) => {
  if (t.length <= max) return t
  const cut = t.slice(0, max + 1)
  const sp = cut.lastIndexOf(' ')
  return (sp > max * 0.5 ? cut.slice(0, sp) : t.slice(0, max)).replace(/[\s,;:·–-]+$/, '')
}
/** Cut a single sentence/title back at a clause boundary (a separator past ~35% of its length; "Try again" picks the
 *  next boundary), else at ~65% of it. */
function clauseCut(t: string, title: boolean, attempt = 0): string {
  const from = Math.floor(t.length * 0.35)
  const at = [...new Set([' · ', ', ', ' – ', ' - ', ' with ', ' near ', ' in '].flatMap((sep) => {
    const xs: number[] = []
    for (let i = t.indexOf(sep, from); i > 0 && i < t.length * 0.9; i = t.indexOf(sep, i + 1)) xs.push(i)
    return xs
  }))].sort((a, b) => a - b)
  let out = at.length ? t.slice(0, at[attempt % at.length]) : fitTo(t, Math.floor(t.length * (attempt % 2 ? 0.55 : 0.65)))
  if (!title && /[.!?]$/.test(t) && !/[.!?]$/.test(out)) out = out.replace(/[:;]$/, '') + '.'
  return out
}
/** Genuinely shorter: aims for ~70% of the length or less — drops sentences (prose), then trailing clauses/words —
 *  and is always strictly fewer characters than what it was given. */
function shorten(base: string, attempt: number, title: boolean): string {
  const s = sentencesOf(base)
  let out = base
  if (!title && s.length > 1) {
    out = attempt % 3 === 0 ? s.slice(0, Math.ceil(s.length / 2)).join(' ')
      : attempt % 3 === 1 && s.length > 2 ? [s[0], s[s.length - 1]].join(' ')
      : s[0]
  }
  if (out.length > base.length * 0.7) {
    const kept = sentencesOf(out)
    out = kept.length > 1 ? kept.slice(0, -1).join(' ') : clauseCut(out, title, attempt)
  }
  return out.length < base.length && out.length > 0 ? out : fitTo(base, Math.max(1, Math.floor(base.length * 0.7)))
}

/** A (SIMULATED) rewrite: reacts to a few common instructions so a demo reads as plausible without a real model.
 *  `attempt` > 0 (Try again) picks a different canned variant; `field` 'name' is treated as a title (no sentences
 *  appended). The channel's character limit is always respected, cutting at a word boundary. */
export function simulateRefine(current: string, instruction: string, limit?: number | null, attempt = 0, field?: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const base = current.trim()
      const title = field === 'name'
      const instr = instruction.toLowerCase()
      const mention = instr.match(/mention(?:ing)?\s+(?:the|a|an|my)?\s*([a-z0-9 '-]{2,28})/)
      const join = (extra: string) => (base ? `${base} ${extra}` : extra)
      let out: string
      if (mention) {
        const thing = mention[1].trim().replace(/[.!?]+$/, '')
        out = !thing || base.toLowerCase().includes(thing.toLowerCase()) ? base
          : title ? `${base} with ${thing}`
          : join(`There's also ${/^[aeiou]/i.test(thing) ? 'an' : 'a'} ${thing} for your stay.`)
      } else if (/short|concise|tighten|trim|brief|cut|summar/.test(instr)) {
        out = shorten(base, attempt, title)
      } else if (/detail|longer|expand|elaborat|more about/.test(instr)) {
        out = title ? `${base.replace(/ · .*$/, '')}${variant(TITLE_DETAIL, attempt, base)}` : join(variant(DETAIL, attempt, base))
      } else if (/warm|friendly|welcom|cos(y|ier)/.test(instr)) {
        out = title ? `${variant(TITLE_WARM, attempt, base)} ${base.replace(new RegExp(`^(${TITLE_WARM.join('|')})\\s+`), '')}` : join(variant(WARM, attempt, base))
      } else if (/professional|formal|polish/.test(instr)) {
        out = base.replace(/!+/g, '.').replace(/\bawesome\b/gi, 'excellent').replace(/\bsuper\b/gi, 'very').replace(/\bcool\b/gi, 'lovely')
      } else if (/casual|relax|fun|playful/.test(instr)) {
        out = title ? base : join(variant(CASUAL, attempt, base))
      } else {
        out = base ? `${base} (Refined: ${instruction}.)` : instruction.charAt(0).toUpperCase() + instruction.slice(1)
      }
      resolve(limit ? fitTo(out, limit) : out)
    }, 550)
  })
}

/* ---------------- one field row ---------------- */
/** Uses the Base → the control is disabled and shows the Base value; Customize for {channel} enables it.
 *  Custom for {channel} → a normal control; Use the Base drops the custom value. Edits wait for the section's Save. */
export function FieldRow({ def, c, tips, focus, onTip, activeTip, smartify }: {
  def: FieldDef; c: ListingChannel; tips?: string[]; focus: boolean; onTip: (id: string) => void; activeTip: string | null
  smartify?: SmartifyCtl
}) {
  const p = useProperty()
  const nav = useNavigate()
  const bookingDesc = def.key === 'description' && c === 'booking'
  const f = useScopedField(def, c, {
    customizeLabel: bookingDesc ? 'Write one for Booking.com' : undefined,
    customizeFrom: bookingDesc ? '' : undefined,
    onHub: () => nav(`/property/${p.id}/hub`),
  })
  const { v, shown, locked, disabled, write } = f
  const values = useScopeValues(def, c, { value: shown, state: v.state })
  const channels = useListingChannels() // 'listing'/'hub' captions name only the channels this property actually has
  const { readOnly } = useDraft() // Autopilot on: no caption actions, the photos row included
  const [q] = useSearchParams()
  // S10's per-property field-visibility setting (store.overview[pid].fieldVisibility, screens/smart/PropertyOverview.tsx
  // FieldVisibilitySection): today only ever set for 'languages'/'tags' (an open string key, so read generically by
  // def.key, not hardcoded to those two). Primitive read, no object built in the selector (selector discipline).
  // No `?? 'show'` fallback: an unset key means this field is not managed by that control at all, and must keep its
  // normal Base/Customize-for-channel behaviour. Defaulting unset → 'show' locked EVERY field in the editor that
  // nobody had explicitly configured (Antonio, 1 Oct: "nothing is editable… these will always be editable, even if
  // you decide not to show the ones that are shared"). Only an explicit 'show'/'hidden' changes how a field renders.
  const fieldVis = useStore((s) => s.overview?.[p.id]?.fieldVisibility?.[def.key])

  // photos: Hospitable's Photos row (header over grid) for this channel; managed on All photos (./Photos.tsx)
  if (def.kind === 'photos') return <div id={`field-${def.key}`}><ChannelPhotosRow c={c} tips={tips} activeTip={activeTip} onTip={onTip} focus={focus} readOnly={readOnly} /></div>
  // 'hidden': the field doesn't render on this channel's page at all (a different axis from show/edit). Applies to
  // every field kind S10's Overview control now covers (19 fields, not just Tags/Languages) — not gated to one kind.
  if (fieldVis === 'hidden') return null
  // Anything that can't be changed (FIXED_FIELDS: property / room type, the address) isn't on a channel's listing
  // template at all (Antonio, 3 Oct: "don't show it at the listing template level") — the Base shows it, locked
  if (FIXED_FIELDS[def.key]) return null

  const limit = def.key === 'name' ? CHANNELS[c].titleLimit : def.limit
  const over = limit != null && shown.length > limit
  const overBy = over ? shown.length - limit! : 0
  // Autopilot read-only, Base-not-customized, or 'show' (read-only, no per-channel override at all) all mean there's
  // nothing to refine here yet — Smartify only ever touches a field the host can actually type into right now.
  // 'show' (default): plain, read-only, no per-channel override offered, for ANY field kind the Overview control
  // names — not just Tags/Languages. effDisabled forces every control branch into its disabled/read-only rendering.
  const plainShow = fieldVis === 'show'
  const effDisabled = disabled || plainShow
  // One AI affordance per field (Antonio, 3 Oct): a tip → the purple dot only (the system's suggestion wins, and a tip
  // shows even on a Base field); else editable → the yellow Smartify trigger; else (Uses the Base, Autopilot
  // read-only, field visibility "Show" = read-only, locked) → nothing.
  const smartifyOn = smartifiable(def) && !tips?.length && !locked && !effDisabled
  // Smartify asks for a rewrite of what's in the field now; the result opens in the panel and only Accept writes it
  const openRefine = () => smartify?.open({ field: def.key, label: def.label, original: shown, limit, apply: write })
  const fieldError = over ? (
    <p className="ch-field-error" role="alert"><Icon name="alert-triangle" size={16} />{def.label} is {overBy} character{overBy === 1 ? '' : 's'} over {CHANNELS[c].name}’s limit.</p>
  ) : null

  // set by the channel: why it can't be changed here, on both locks — the field's and the caption's (Antonio, 4 Oct)
  const lockTip = v.state === 'set' ? setByWhy(def, c, CHANNELS[c].name) : undefined
  let control
  if (locked) {
    control = <Locked tip={lockTip} label={def.label}>{v.value || '—'}</Locked>
  } else if (def.kind === 'tasks') {
    control = <TaskList value={shown} disabled={effDisabled} onChange={write} />
  } else if (def.kind === 'textarea') {
    control = (
      <div className="ch-field">
        <div className="sy-field">
          <textarea ref={f.inputRef} className={cx('h-textarea', over && 'is-error')} rows={Math.min(8, Math.max(3, Math.ceil(shown.length / 72) + 1))} value={shown} placeholder={def.label} disabled={effDisabled} onChange={(e) => write(e.target.value)} aria-label={def.label} aria-invalid={over || undefined} />
        </div>
        {fieldError}
      </div>
    )
  } else if (def.kind === 'url') {
    // Guest resources: the link as an item once it's set (Copy · Edit · Remove), the input only while empty or editing
    control = <LinkField value={shown} onChange={write} disabled={effDisabled} label={def.label} placeholder={`Your ${def.label.toLowerCase()} URL`} inputRef={f.inputRef} />
  } else if (def.kind === 'text') {
    control = (
      <div className="ch-field">
        <div className="sy-field">
          <input ref={f.inputRef} className={cx('h-input', over && 'is-error')} value={shown} placeholder={def.label} disabled={effDisabled} onChange={(e) => write(e.target.value)} aria-label={def.label} aria-invalid={over || undefined} />
        </div>
        {fieldError}
      </div>
    )
  } else if (def.kind === 'toggle') {
    const yes = shown === 'Yes'
    control = <div className={cx('ch-toggle-line', effDisabled && 'is-disabled')}><Toggle checked={yes} label={def.label} disabled={effDisabled} onChange={(x) => write(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
  } else if (def.kind === 'tags') {
    const tags = shown.split(' · ').filter(Boolean)
    // 'show' (default): all channels, read-only, no per-channel override offered — plain and silent, no lock icon or
    // tooltip (Antonio, dropping an earlier padlock treatment for this case). 'edit' (or any other value): unchanged,
    // today's existing Customize-for-channel flow already covers it (useScopedField/TagBox, same as every other field).
    control = plainShow
      ? <TagBox tags={tags} disabled addLabel={def.key === 'languages' ? 'Add language' : 'Add tag'} />
      : <TagBox tags={tags} disabled={effDisabled} addLabel={def.key === 'languages' ? 'Add language' : 'Add tag'} onRemove={(t) => write(tags.filter((x) => x !== t).join(' · '))} />
  } else if (def.kind === 'map') {
    control = <MapBox label={shown} disabled={effDisabled} />
  } else {
    control = <SelectBox selectRef={f.selectRef} value={shown} options={FIELD_OPTIONS[def.key] ?? []} placeholder={def.label} label={def.label} disabled={effDisabled} onChange={write} />
  }

  return (
    <div id={`field-${def.key}`} className={smartify?.field === def.key ? 'sy-row-focus' : undefined}>
      <SettingRow
        label={def.label}
        help={withShortcodes(withOtas(def.help ?? HELP[def.key] ?? '', channels))} state={v.state} channel={c} values={values} hoverOpen={q.get('hover') === def.key}
        tips={tips?.length} tipActive={!!tips && !!activeTip && tips.includes(activeTip)} onTip={tips ? () => onTip(tips[0]) : undefined}
        labelAddon={smartifyOn && smartify ? <SmartifyTrigger label={`Rewrite ${def.label.toLowerCase()} with AI`} active={smartify.field === def.key} onOpen={openRefine} /> : undefined}
        focus={focus} actionLabel={plainShow ? undefined : f.actionLabel} onAction={plainShow ? undefined : f.onAction}
        layout={def.kind === 'toggle' && !locked ? 'toggle' : undefined}
        below={f.everywhere ? <EverywhereNote c={c} /> : undefined}
        hint={!plainShow} scopeChannels={channels} hubTo={`/property/${p.id}/hub`} lockTip={lockTip}
        sheet={!plainShow && !(effDisabled && !f.onAction)} /* phones: nothing to edit → a plain row, no sheet */
      >
        {control}
      </SettingRow>
    </div>
  )
}

/** Hover on the scope caption: the Base and what each channel has, this channel marked in use (Antonio, 30 Sep). */
function useScopeValues(def: FieldDef, c: ListingChannel, cur: { value: string; state: string }): ScopeValue[] | undefined {
  const custom = useStore((s) => s.sl3.custom)
  const base = useStore((s) => s.sl3.base)
  const channels = useListingChannels() // only the property's connected channels
  const st = def.state[c]
  if (st !== 'inherit' && st !== 'override' && st !== 'only') return undefined
  const rows: ScopeValue[] = st === 'only' ? [] : [{ who: 'base', value: base[def.key] ?? def.base ?? '' }]
  for (const ch of channels) {
    if (!fieldOn(def, ch)) continue
    const x = ch === c ? cur : viewOf(def, ch, custom[ch], base)
    rows.push({ who: ch, value: x.value, used: ch === c, note: x.state === 'inherit' ? 'Uses the Base' : undefined })
  }
  return rows
}
