/* Listing details · one field: the control for each field kind, the stacked row (label, help, control; no channel
 * caption), the Photos row in its Base mode, and the saved confirmation. */
import { useState, type RefObject } from 'react'
import { CaptionTip, Icon, LinkField, Locked, MapBox, PhotosRow, SelectBox, SettingRow, TagBox, TaskList, Toggle, cx, useIsMobile, withShortcodes } from '../../ds'
import { setByWhy, type FieldDef } from '../../data/sl3'
import { FIELD_OPTIONS, FIXED_FIELDS, HELP } from '../../data/v3-ch'
import { photoUrl } from '../../data/v3-cv'
import { DETAILS_LABEL } from '../../data/details'
import { useListingChannels } from '../../store/selectors'
import { useProperty } from '../../shell/PropertyLayout'
import { usePhotoLib } from '../channel/Photos'
import { usePhotosNav } from '../channel/photosNav'
import { PhotosFullTakeover } from '../channel/PhotosShells'
import { CHANNELS, withOtas } from '../../data/channels'
import { baseChannels, fieldChannels, onlyChannel, type BaseDraft } from './shared'

type AnyInput = HTMLInputElement & HTMLTextAreaElement

/** The field's label and help on this screen (the real Details wording, channels named as this property's). */
export function useFieldText(def: FieldDef) {
  const chs = useListingChannels()
  const meta = DETAILS_LABEL[def.key]
  const label = meta?.label ?? def.label
  const help = meta && 'help' in meta ? meta.help : def.help ?? HELP[def.key]
  return { label, help: help ? withOtas(help, chs) : help }
}

/** The control for a field kind. `disabled` = the DS disabled state (a channel that uses the Base). */
export function FieldControl({ def, label, value, onChange, disabled, inputRef, selectRef }: {
  def: FieldDef; label: string; value: string; onChange: (v: string) => void; disabled?: boolean
  inputRef?: RefObject<AnyInput | null>; selectRef?: RefObject<HTMLButtonElement | null>
}) {
  switch (def.kind) {
    case 'tasks': return <TaskList value={value} disabled={disabled} onChange={onChange} />
    case 'textarea':
      return <textarea ref={inputRef} className="h-textarea" rows={Math.min(8, Math.max(3, Math.ceil(value.length / 72) + 1))} value={value} placeholder={label} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    case 'url':
      // Guest resources: the same link item as the channel pages (ds/fieldscope.tsx LinkField, ) -
      // here on the Base it's editable: Copy · Edit · Remove, the input while empty or being edited
      return <LinkField value={value} onChange={onChange} disabled={disabled} label={label} placeholder={`Your ${label.toLowerCase()} URL`} inputRef={inputRef as RefObject<HTMLInputElement | null> | undefined} />
    case 'text':
      return (
        <div className="ch-counter">
          <input ref={inputRef} className="h-input" value={value} placeholder={label} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={label} maxLength={def.limit} />
          {def.limit && <span className="ch-counter__n">{value.length}/{def.limit}</span>}
        </div>
      )
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className={cx('ch-toggle-line', disabled && 'is-disabled')}><Toggle checked={yes} label={label} disabled={disabled} onChange={(x) => onChange(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tags': return <Tags value={value} onChange={onChange} disabled={disabled} addLabel={def.key === 'languages' ? 'Add language' : 'Add tag'} />
    case 'map': return <MapBox label={value} disabled={disabled} />
    default:
      return <SelectBox selectRef={selectRef} value={value} options={FIELD_OPTIONS[def.key] ?? []} placeholder={label} label={label} disabled={disabled} onChange={onChange} />
  }
}

/** Tags as chips; "Add tag" opens a small input under them (Enter adds, Esc cancels). */
function Tags({ value, onChange, disabled, addLabel }: { value: string; onChange: (v: string) => void; disabled?: boolean; addLabel: string }) {
  const tags = value.split(' · ').filter(Boolean)
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const add = () => { const t = text.trim(); if (t && !tags.includes(t)) onChange([...tags, t].join(' · ')); setText(''); setAdding(false) }
  return (
    <>
      <TagBox tags={tags} disabled={disabled} addLabel={addLabel} onAdd={() => setAdding(true)} onRemove={(t) => onChange(tags.filter((x) => x !== t).join(' · '))} />
      {adding && (
        <input className="h-input" autoFocus value={text} placeholder={addLabel} aria-label={addLabel} style={{ marginTop: 8 }}
          onChange={(e) => setText(e.target.value)} onBlur={add}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } if (e.key === 'Escape') { setText(''); setAdding(false) } }} />
      )}
    </>
  )
}

/** One Base field: label + help, then the control full width. No channel caption: these are the property's facts,
 *  the same for every channel. Fields no connected channel has are hidden.
 *  ("We have the base, and off of the base others can act dissimilarly, but I don't need to see that
 *  here"): the Base shows only shared values and nothing about how a channel differs, a field only one channel has
 *  (Airbnb's checkout tasks) isn't on the Base at all; it lives on that channel's Listing page. */
export function DetailsField({ def, draft }: { def: FieldDef; draft: BaseDraft }) {
  const chs = useListingChannels()
  const mobile = useIsMobile()
  const { label, help } = useFieldText(def)
  const on = fieldChannels(def, chs)
  if (!on.length || onlyChannel(def, chs)) return null
  const locked = on.every((c) => def.state[c] === 'set') // every channel sets it itself: shown, never an input
  // Property type and Room type can't be changed even on the Base: the disabled field, a lock where
  // the chevron was, and the reason in the shared tooltip (fixed once the listing is created)
  const fixed = FIXED_FIELDS[def.key]
  // the "N channels" note only where a channel CAN differ: a value that's the same on every channel
  // by nature (listing-wide, Knowledge Hub, fixed, Property type, Tags, the address, the guest links…) says nothing new
  const varies = chs.some((c) => def.state[c] === 'inherit' || def.state[c] === 'override')
  const users = varies && !FIXED_FIELDS[def.key] ? baseChannels(def, chs) : []
  // how many channels use this Base value, information only, the names on hover/focus, no per-channel action
  const caption = (
    <div className="h-field-hint">
      <span className="h-field-hint__channels">
        <CaptionTip names={users.map((c) => CHANNELS[c].name)}><Icon name="info-circle" />{users.length} channel{users.length === 1 ? '' : 's'}</CaptionTip>
      </span>
    </div>
  )
  // phones (ds/mobile.md §7, ): the same field sheet as every other row, a read-only summary here, the
  // field itself in a bottom sheet with the page's Discard / Save. Toggles and locked values stay as they are.
  if (mobile && !fixed && !locked && def.kind !== 'toggle') {
    return (
      <div id={`field-${def.key}`} className="h-ld-field">
        <SettingRow label={label} help={help ? withShortcodes(help) : undefined} state="listing" scopeChannels={users.length ? users : undefined} hint={users.length > 0}>
          <FieldControl def={def} label={label} value={draft.value(def)} onChange={(v) => draft.set(def, v)} />
        </SettingRow>
      </div>
    )
  }
  return (
    <div id={`field-${def.key}`} className={cx('h-field-row', 'h-field-row--stacked', 'h-ld-field', def.kind === 'toggle' && 'h-field-row--toggle')}>
      <div className="h-field-row__head">
        <p className="h-field-row__label">{label}</p>
        {help && <p className="h-field-row__help">{withShortcodes(help)}</p>}
        {/* a toggle row keeps its caption under the supporting text, on the left */}
        {users.length > 0 && def.kind === 'toggle' && caption}
      </div>
      <div className="h-field-row__control">
        {fixed ? (
          <Locked tip={fixed} label={label}>{draft.value(def) || '-'}</Locked>
        ) : locked ? <Locked tip={setByWhy(def, on[0], CHANNELS[on[0]].name)} label={label}>{draft.value(def) || '-'}</Locked> : <FieldControl def={def} label={label} value={draft.value(def)} onChange={(v) => draft.set(def, v)} />}
        {/* how many channels use this Base value, information only, the names on hover/focus, no per-channel action
         *  */}
        {users.length > 0 && def.kind !== 'toggle' && caption}
      </div>
    </div>
  )
}

/** Essentials › Photos in its Base mode: the Base set and order (store.photoLib.base). Manage photos opens All photos,
 *  where a channel's own set, order and cover live. */
export function BasePhotosRow() {
  const p = useProperty()
  const { lib } = usePhotoLib()
  const nav = usePhotosNav()
  const ks = lib.base
  return (
    <div id="field-photos" className="h-field-row h-field-row--stacked h-ld-field">
      {/* "Manage photos" opens the same full-screen takeover as a channel's Listing, on the Base's photos */}
      <PhotosRow count={ks.length} manageTo={`/property/${p.id}/details/essentials?photosOpen=1`} onManage={(e) => { e.preventDefault(); nav.openPhotos() }}
        photos={ks.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))} />
      <PhotosFullTakeover open={nav.open} onClose={nav.closePhotos} />
    </div>
  )
}

/** The quiet confirmation ("Saved · sent to Airbnb"), fading like SaveActions'. */
export function Flash({ flash }: { flash: { at: number; text: string } | null }) {
  if (!flash) return null
  return <span key={flash.at} className={cx('h-saved', flash.text !== 'Saved' && 'h-saved--sent', 'h-ld-saved')} role="status"><Icon name="circle-check" />{flash.text}</span>
}
