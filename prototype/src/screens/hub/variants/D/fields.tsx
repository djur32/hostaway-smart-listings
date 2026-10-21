/* KH-D · a field in a sheet: stacked label + control + plain-text scope caption; "Edit per channel" splits it inline. */
import { useState } from 'react'
import { Dropdown, KhdCaption, NumberField, KhdField, KhdSplit, KhdSplitRow, MapBox, TagBox, TaskList, Toggle, type ScopeValue } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import type { KhFact, KhItem } from '../../../../data/v3-kh'
import { backToBase, display, scopeOf, type HubDraft, type Scope } from '../../model'
import { NAME, names } from './model'
import { hubChannels, isScenarioActive } from '../../perProperty'

const PER_CHANNEL = new Set(['override', 'inherit'])
const clip = (v: string) => (v.length > 28 ? '' : ` · ${v}`)

/** The caption's words: plain text, no channel logo (review, 30 Sep). */
export function captionOf(item: KhItem, s: Scope): { text: string; lock?: boolean } {
  if (s.only) return { text: `${NAME[s.only]} only` }
  const own = s.own.filter((o) => o.orig !== 'only')
  if (own.length === 1) return { text: `${NAME[own[0].c]} has its own${clip(display(item, own[0].value))}` }
  if (own.length > 1) return { text: `${names(own.map((o) => o.c))} have their own` }
  if (s.set.length) {
    const why = [...new Set(s.set.map((x) => x.why.replace(/\s*\(.*\)$/, '')))]
    const text = why.every((w) => w.startsWith('Set by ')) ? `Set by ${names(s.set.map((x) => x.c))}` : why.join(' · ')
    return { text, lock: true }
  }
  // multi-property: a field none of the property's channels shows is the Hub's and the AI's; one channel reads "Used by Airbnb"
  if (!s.on.length) return { text: 'Not on your listings · your AI replies use it' }
  if (s.on.length === 1 && hubChannels().length === 1) return { text: s.uses.length ? `Used by ${NAME[s.on[0]]}` : 'No channel uses it right now' }
  return { text: s.uses.length === s.on.length ? `${s.on.length} channels` : `Used by ${names(s.uses)}` }
}
export function hoverOf(item: KhItem, s: Scope): ScopeValue[] {
  if (s.only) return s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `Only ${NAME[o.c]} has this field` }))
  return [
    { who: 'base', value: display(item, s.base), used: s.uses.length > 0, note: s.uses.length ? `Used by ${names(s.uses)}` : 'No channel uses it right now' },
    ...s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `${NAME[o.c]}’s own value` })),
    ...s.set.map((x) => ({ who: x.c, value: display(item, x.value), used: true, note: x.why })),
  ]
}

/** One field of the Hub, written through the sheet's draft (sl3Base / sl3Custom on Save). */
export function FieldRow({ item, d, help }: { item: KhItem; d: HubDraft; help?: string | false }) {
  const s = scopeOf(item, d)
  const split = s.perChannel && d.isSplit(item.key)
  const wide = item.kind === 'textarea' || item.kind === 'tasks' || item.kind === 'tags'
  const writeBase = (v: string) => d.setBase(item.key, v, item.base)
  let control
  if (s.only) {
    const o = s.own[0]
    control = <Control item={item} value={o?.value ?? ''} write={(v) => d.setCustom(o.c, item.key, v)} />
  } else if (split) {
    control = (
      <KhdSplit onSetOne={() => { s.own.filter((o) => PER_CHANNEL.has(o.orig)).forEach((o) => d.setCustom(o.c, item.key, backToBase(o))); d.setSplit(item.key, false) }}>
        {s.on.map((c: ListingChannel) => {
          const o = s.own.find((x) => x.c === c)
          const st = s.set.find((x) => x.c === c)
          const canOwn = PER_CHANNEL.has(item.state[c] ?? '')
          if (st) return <KhdSplitRow key={c} channel={c} stacked={wide} note={st.why}><Control item={item} value={st.value} disabled /></KhdSplitRow>
          return (
            <KhdSplitRow key={c} channel={c} stacked={wide} note={canOwn ? undefined : 'Same on every channel'}>
              <Control item={item} value={o ? o.value : s.base} disabled={!canOwn} write={(v) => d.setCustom(c, item.key, v)} />
            </KhdSplitRow>
          )
        })}
      </KhdSplit>
    )
  } else control = <Control item={item} value={s.base} write={writeBase} />
  const cap = captionOf(item, s)
  // one channel: nothing to split per channel
  const perChannel = s.perChannel && (isScenarioActive() || s.on.length > 1)
  const caption = split ? undefined : (
    <KhdCaption text={cap.text} lock={cap.lock} title={item.label} values={hoverOf(item, s)}
      action={perChannel ? <button type="button" className="h-field-hint__action" onClick={() => d.setSplit(item.key, true)}>Edit per channel</button> : undefined} />
  )
  return <KhdField dataKey={item.key} label={item.label} help={help === false ? undefined : help ?? helpOf(item)} caption={caption}>{control}</KhdField>
}

/** The item's help. Size's help names Neukölln's channels; elsewhere it names the property's own. */
function helpOf(item: KhItem): string | undefined {
  if (isScenarioActive()) return item.help
  const chs = hubChannels()
  // "Airbnb and Booking.com lock it…": name the property's own channels
  const otas = chs.filter((c) => c !== 'direct')
  if (item.key !== 'kh.size') return otas.length ? item.help?.replace(/Airbnb and Booking\.com (\w+)/, (_, verb: string) => `${names(otas)} ${otas.length === 1 ? `${verb}s` : verb}`) : item.help
  const shows = chs.filter((c) => c !== 'airbnb')
  if (!shows.length) return 'Airbnb doesn’t ask for it, so only your AI replies use it.'
  const who = names(shows).replace('Direct', 'your site')
  return `${who[0].toUpperCase()}${who.slice(1)} show${shows.length === 1 ? 's' : ''} it${chs.includes('airbnb') ? '; Airbnb doesn’t ask for it' : ''}.`
}

/** The control for a value: Hostaway's inputs, dropdown, toggle, tags, tasks, map. */
export function Control({ item, value, write, disabled }: { item: KhItem; value: string; write?: (v: string) => void; disabled?: boolean }) {
  const w = (v: string) => write?.(v)
  switch (item.kind) {
    case 'textarea':
      return <textarea className="h-textarea" disabled={disabled} rows={Math.min(7, Math.max(3, Math.ceil(value.length / 64) + 1))} value={value} aria-label={item.label} onChange={(e) => w(e.target.value)} />
    case 'select': case 'time': case 'dropdown':
      return <Dropdown label={item.label} value={value} options={item.options ?? []} disabled={disabled} onChange={w} />
    case 'toggle':
      return <div className="h-khd-toggle-line"><Toggle checked={value === 'Yes'} disabled={disabled} label={item.label} onChange={(x) => w(x ? 'Yes' : 'No')} /><span>{value === 'Yes' ? 'Allowed' : 'Not allowed'}</span></div>
    case 'tags': return <Tags value={value} write={w} disabled={disabled} addLabel={item.key === 'languages' ? 'Add language' : 'Add tag'} />
    case 'map': return <MapBox label={value} disabled={disabled} />
    case 'tasks': return <TaskList value={value} onChange={w} disabled={disabled} />
    case 'money': case 'percent': case 'guests':
      return (
        // NumberField (ds/v3-ch.tsx), review 3 Oct: € before the value, the unit as a plain word, the shared small arrows
        <NumberField label={item.label} value={value} disabled={disabled} onChange={(v) => w(v.replace(/[^0-9.]/g, ''))}
          currency={item.kind === 'money' ? '€' : undefined} decimals={item.kind === 'money' ? 2 : 0} max={item.kind === 'percent' ? 100 : 99999}
          unit={item.kind === 'percent' ? '%' : item.kind === 'guests' ? (value === '1' ? 'guest' : 'guests') : undefined} />
      )
    default:
      return <input className="h-input" disabled={disabled} type={item.kind === 'url' ? 'url' : undefined} value={value} aria-label={item.label} maxLength={item.limit} onChange={(e) => w(e.target.value)} />
  }
}
function Tags({ value, write, addLabel, disabled }: { value: string; write: (v: string) => void; addLabel: string; disabled?: boolean }) {
  const [adding, setAdding] = useState(false)
  const [t, setT] = useState('')
  const tags = value.split(' · ').filter(Boolean)
  const add = () => { const v = t.trim(); if (v && !tags.includes(v)) write([...tags, v].join(' · ')); setT(''); setAdding(false) }
  return (
    <div className="h-khd-field">
      <TagBox tags={tags} addLabel={addLabel} disabled={disabled} onAdd={() => setAdding(true)} onRemove={(x) => write(tags.filter((y) => y !== x).join(' · '))} />
      {adding && <input className="h-input" autoFocus value={t} placeholder={addLabel} aria-label={addLabel} onChange={(e) => setT(e.target.value)} onBlur={add} onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false) }} />}
    </div>
  )
}

/** A fact only the Hub and the AI replies use (custom facts, facts filed into a category). Its value is `kh.<id>` in the Base. */
export function FactRow({ f, d, source }: { f: KhFact; d: HubDraft; source?: string }) {
  const key = `kh.${f.id}`
  return (
    <KhdField dataKey={key} label={f.label}
      caption={<KhdCaption text={`Only your AI replies use this · ${source ?? f.source}`} />}>
      <textarea className="h-textarea" rows={Math.min(5, Math.max(2, Math.ceil(d.base(key, f.value).length / 64) + 1))} value={d.base(key, f.value)} aria-label={f.label} onChange={(e) => d.setBase(key, e.target.value, f.value)} />
    </KhdField>
  )
}
/** A fact typed into the sheet's add box, waiting for Save. */
export interface NewFact { label: string; value: string }
export function NewFactRow({ f, onChange, onRemove, autoFocus }: { f: NewFact; onChange: (f: NewFact) => void; onRemove: () => void; autoFocus?: boolean }) {
  return (
    <KhdField label={f.label}
      caption={<KhdCaption text="Only your AI replies use this · Added now" action={<button type="button" className="h-field-hint__action" onClick={onRemove}>Remove</button>} />}>
      <textarea className="h-textarea" rows={2} autoFocus={autoFocus} value={f.value} placeholder={`What should guests know about ${f.label.toLowerCase()}?`} aria-label={f.label} onChange={(e) => onChange({ ...f, value: e.target.value })} />
    </KhdField>
  )
}
