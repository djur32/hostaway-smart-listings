/* KH-E · "+ Add" (Paper KH-E2): one menu in the tab bar's corner, pre-scoped to the tab and the lens. Types for this tab
 * come first; other types say where they go. The footer states the scope ("Adds for Airbnb only") and offers
 * "Add to the Base instead". Picking a type opens the new item inline at the top of its tab; it joins the tab's draft,
 * so the section's Save commits it like any other edit. */
import { useState } from 'react'
import { AddComposer, AddMenu, Dropdown, Icon, type AddMenuItem } from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import type { HubDraft } from '../../model'
import { hubChannels, useListingChannels } from '../../perProperty'
import { ADD_TYPES, ELSEWHERE, TAB_LABEL, type AddType, type AddTypeId, type Lens } from './data'
import { NAME, addedPrefix, allItems, amenityKey, catalogLeft, resolve } from './lens'

export interface Adding { type: AddTypeId; scope: Lens }

function ScopeLine({ scope, lens, only, onScope }: { scope: Lens; lens: Lens; only?: ListingChannel; onScope: (s: Lens) => void }) {
  const chs = useListingChannels()
  const one = chs.length === 1 ? chs[0] : null // a single-channel property: no "other channels" to speak of
  if (only) return <span className="khe-scopeline"><span><Icon name="info-circle" />Adds for {NAME(only)} only{!one && <><span className="khe-scope__dot">·</span>other channels don’t have it</>}</span></span>
  return (
    <span className="khe-scopeline">
      <span><Icon name="info-circle" />{scope === 'base' ? `Adds to the Base · ${one ? `${NAME(one)} uses it` : 'every channel uses it'}` : `Adds for ${NAME(scope)} only`}</span>
      {scope !== 'base'
        ? <button type="button" className="h-textlink" onClick={() => onScope('base')}>Add to the Base instead</button>
        : lens !== 'base' ? <button type="button" className="h-textlink" onClick={() => onScope(lens)}>Add for {NAME(lens)} only instead</button> : null}
    </span>
  )
}

export function AddButton({ tab, lens, defaultOpen, onPick }: { tab: KhSectionId; lens: Lens; defaultOpen?: boolean; onPick: (a: Adding, t: AddType) => void }) {
  const [scope, setScope] = useState<Lens>(lens)
  const [forLens, setForLens] = useState(lens)
  if (forLens !== lens) { setForLens(lens); setScope(lens) }
  const item = (t: AddType, elsewhere: boolean): AddMenuItem => ({ id: t.id, icon: t.icon, label: t.label, sub: elsewhere ? t.goes : t.sub, channel: t.only })
  const chs = useListingChannels()
  const types = ADD_TYPES.filter((t) => !t.only || chs.includes(t.only)) // Checkout tasks: only where Airbnb is connected
  const here = types.filter((t) => t.tab === tab)
  const there = types.filter((t) => t.tab !== tab && ELSEWHERE.includes(t.id))
  return (
    <AddMenu defaultOpen={defaultOpen}
      groups={[{ title: `Add to ${TAB_LABEL[tab]}`, items: here.map((t) => item(t, false)) }, { title: here.length ? 'Elsewhere' : 'Add', items: there.map((t) => item(t, true)) }]}
      footer={<ScopeLine scope={scope} lens={lens} onScope={setScope} />}
      onPick={(id) => { const t = ADD_TYPES.find((x) => x.id === id)!; onPick({ type: t.id, scope: t.only ?? scope }, t) }} />
  )
}

/** The new item, inline. Writes into the tab's draft: Base → sl3Base, a channel → sl3Custom (on Save). */
export function Composer({ adding, lens, d, onDone, onScope }: { adding: Adding; lens: Lens; d: HubDraft; onDone: () => void; onScope: (s: Lens) => void }) {
  const t = ADD_TYPES.find((x) => x.id === adding.type)!
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const left = catalogLeft(d)
  const scope = t.only ?? adding.scope
  const chs: ListingChannel[] = scope === 'base' ? hubChannels() : [scope]
  const ok = t.id === 'amenity' ? !!name : t.id === 'task' ? !!name.trim() : t.id === 'rule' ? !!value.trim() : !!name.trim() && !!value.trim()

  const add = () => {
    switch (t.id) {
      case 'task': {
        const cur = resolve('checkout_tasks', 'airbnb', d)?.value ?? ''
        d.setCustom('airbnb', 'checkout_tasks', [cur, value.trim() ? `${name.trim()} | ${value.trim()}` : name.trim()].filter(Boolean).join('\n'))
        break
      }
      case 'amenity':
        for (const c of chs) d.setCustom(c, amenityKey({ key: name, name, on: [] }), 'on')
        break
      case 'rule': {
        const fallback = allItems().find((i) => i.key === 'house_rules')?.base ?? ''
        if (scope === 'base') d.setBase('house_rules', `${d.base('house_rules', fallback)} ${value.trim()}`.trim(), fallback)
        else d.setCustom(scope, 'house_rules', `${resolve('house_rules', scope, d)?.value ?? ''} ${value.trim()}`.trim())
        break
      }
      default: {
        const key = `${addedPrefix(t.tab)}${name.trim()}`
        const v = t.id === 'fee' ? `€${value.replace(/[^0-9.]/g, '')}` : value.trim()
        if (scope === 'base') d.setBase(key, v, ''); else d.setCustom(scope, key, v)
      }
    }
    onDone()
  }

  const title = t.id === 'task' ? 'New checkout task' : t.id === 'amenity' ? 'New amenity' : t.id === 'rule' ? 'New house rule' : `New ${t.label.toLowerCase()}`
  return (
    <AddComposer title={title} addDisabled={!ok} onCancel={onDone} onAdd={add} scope={<ScopeLine scope={scope} lens={lens} only={t.only} onScope={onScope} />}>
      {t.id === 'amenity' ? (
        <label className="khe-composer__field"><span>Amenity</span>
          <Dropdown label="Amenity" placeholder="Pick from the channels’ lists" value={name || undefined} options={left.map((x) => x.name)} onChange={setName} />
        </label>
      ) : t.id === 'rule' ? (
        <label className="khe-composer__field"><span>Rule</span><input className="h-input" value={value} placeholder="e.g. Please keep the courtyard quiet after 22:00." onChange={(e) => setValue(e.target.value)} /></label>
      ) : (
        <>
          <label className="khe-composer__field"><span>{t.id === 'task' ? 'Task' : t.id === 'fee' ? 'Name' : t.id === 'resource' ? 'Link name' : 'Topic'}</span>
            <input className="h-input" value={name} placeholder={t.id === 'task' ? 'e.g. Return keys' : t.id === 'fee' ? 'e.g. Late checkout' : t.id === 'resource' ? 'e.g. Neighbourhood map' : 'e.g. Door code for the courtyard'} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="khe-composer__field"><span>{t.id === 'task' ? 'Details (optional)' : t.id === 'fee' ? 'Amount' : t.id === 'resource' ? 'URL' : 'What guests should know'}</span>
            {t.id === 'fee'
              ? <span className="khe-num"><span className="khe-num__affix">€</span><input className="khe-num__input" inputMode="decimal" value={value} aria-label="Amount" onChange={(e) => setValue(e.target.value)} /></span>
              : t.id === 'task' || t.id === 'resource'
                ? <input className="h-input" type={t.id === 'resource' ? 'url' : 'text'} value={value} placeholder={t.id === 'resource' ? 'https://' : 'e.g. Leave them on the kitchen table'} onChange={(e) => setValue(e.target.value)} />
                : <textarea className="h-textarea khe-textarea" rows={2} value={value} onChange={(e) => setValue(e.target.value)} />}
          </label>
        </>
      )}
    </AddComposer>
  )
}
