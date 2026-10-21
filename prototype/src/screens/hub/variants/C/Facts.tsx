/* KH-C · a fact behind an answer, as a small editable row: label · value · where it's used · edit.
 * The caption is plain text ("All channels", "Airbnb only", "Airbnb 3%", "Set by Booking.com (Genius)"); hovering it shows
 * the Base and each channel's own value. Edit opens the row inline; Save writes through sl3Base / sl3Custom, so every
 * answer that uses the fact (and every channel screen) follows. */
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Dropdown, Icon, IconButton, KhChannelCheck, KhSplit, KhSplitRow, KhcFact, NumberField, TaskList, Toggle, ValueHover, cx, type ScopeValue,
} from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { KH_INSTANT, type KhItem } from '../../../../data/v3-kh'
import { useAllCancellationCards } from '../../policyCards'
import { useStore } from '../../../../store/store'
import { backToBase, display, type Scope } from '../../model'
import type { FactRef } from './data'
import type { Hub } from './model'
import { NAME, names, usedByText, useListingChannels } from '../../perProperty'
const MASK = '••••••••••'
type Val = string | null | undefined

/** How a Base or channel value reads, "Set by Booking.com (Genius)" for a value the channel owns. */
const setByText = (c: ListingChannel, why: string) => `Set by ${NAME(c)}${/genius/i.test(why) ? ' (Genius)' : ''}`

function hoverValues(item: KhItem, s: Scope): ScopeValue[] {
  if (s.only) return s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `Only ${NAME(o.c)} has this field` }))
  return [
    { who: 'base', value: display(item, s.base), used: s.uses.length > 0, note: s.uses.length ? `Used by ${names(s.uses)}` : 'No channel uses it right now' },
    ...s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `${NAME(o.c)}’s own value` })),
    ...s.set.map((x) => ({ who: x.c, value: display(item, x.value), used: true, note: x.why })),
  ]
}

/** The caption for one or more keys: plain text, one line per channel that differs. */
function Caption({ hub, keys }: { hub: Hub; keys: string[] }) {
  const pairs = keys.map((k) => ({ it: hub.item(k), s: hub.scope(k) })).filter((x): x is { it: KhItem; s: Scope } => !!x.it && !!x.s)
  if (!pairs.length) return null
  if (pairs.every((p) => p.s.on.length === 0)) return <span className="is-plain">AI replies only</span>
  const only = pairs.find((p) => p.s.only)
  const own = pairs.flatMap((p) => p.s.own.filter(() => !p.s.only).map((o) => ({ ...o, it: p.it })))
  const set = pairs.flatMap((p) => p.s.set.map((x) => ({ ...x, it: p.it })))
  const lines: ReactNode[] = []
  if (only) lines.push(<span key="only">{NAME(only.s.only!)} only</span>)
  for (const o of own) lines.push(<span key={`o${o.c}${o.it.key}`} className="h-khc-own">{NAME(o.c)}<b>{display(o.it, o.value)}</b></span>)
  for (const x of set) lines.push(<span key={`s${x.c}${x.it.key}`} className="h-khc-lock"><Icon name="lock" />{setByText(x.c, x.why)}</span>)
  if (!lines.length) {
    const s = pairs[0].s
    const chs = hub.chs
    // "All channels" only means something when the property has more than one (Neukölln: all three)
    const all = s.uses.length === s.on.length && s.on.length === chs.length && chs.length > 1
    if (all) return <span className="is-plain">All channels</span>
    lines.push(<span key="u">{chs.length === 1 ? usedByText(s.uses, chs) : names(s.uses)}</span>)
  }
  const hov = pairs.find((p) => p.s.only || p.s.own.length || p.s.set.length)
  const body = <span className="h-khc-scopelines">{lines}</span>
  return hov ? <ValueHover title={hov.it.label} values={hoverValues(hov.it, hov.s)}>{body}</ValueHover> : body
}

/* ---------- controls (Hostaway's inputs and dropdown) ---------- */
function Control({ item, value, write }: { item: KhItem; value: string; write: (v: string) => void }) {
  switch (item.kind) {
    case 'textarea':
      return <textarea className="h-textarea" rows={Math.min(7, Math.max(3, Math.ceil(value.length / 70) + 1))} value={value} aria-label={item.label} onChange={(e) => write(e.target.value)} />
    case 'select': case 'time': case 'dropdown':
      return item.options?.length ? <Dropdown label={item.label} value={value} options={item.options} onChange={write} /> : <input className="h-input" value={value} aria-label={item.label} onChange={(e) => write(e.target.value)} />
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className="ch-toggle-line"><Toggle checked={yes} label={item.label} onChange={(x) => write(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tasks': return <TaskList value={value} onChange={write} />
    case 'money': case 'percent': case 'guests':
      // Knowledge Hub R renders its fact rows through this Control (R/Overview.tsx imports FactRow from here), so this
      // is R's live numeric input, changed for R; C itself is a frozen exploration.
      // NumberField (ds/v3-ch.tsx): the product-wide numeric control, the ▲/▼ spinner plus Up/Down (PageUp/PageDown ×10)
      // on the input ("make sure that this is available in all of the items that are numbers"). Same
      // sanitising and the same write() as before, so the draft/Save path is unchanged; the unit sits at the end, as on
      // the channel Pricing screen the same values come from.
      return (
        <NumberField label={item.label} value={value} onChange={(v) => write(v.replace(/[^0-9.]/g, ''))}
          unit={item.kind === 'money' ? '€' : item.kind === 'percent' ? '%' : 'guests'} inputMode={item.kind === 'money' ? 'decimal' : 'numeric'}
          decimals={item.kind === 'money' ? 2 : 0} max={item.kind === 'percent' ? 100 : 99999} />
      )
    default:
      return <input className="h-input" value={value} aria-label={item.label} maxLength={item.limit} onChange={(e) => write(e.target.value)} />
  }
}

/* ---------- the inline editor: Base, and each channel's own value where a channel can differ ---------- */
function Editor({ hub, keys, note, onDone }: { hub: Hub; keys: string[]; note?: ReactNode; onDone: () => void }) {
  const [base, setBase] = useState<Record<string, string>>({})
  const [own, setOwn] = useState<Record<string, { c: ListingChannel; k: string; v: Val }>>({})
  const pairs = keys.map((k) => ({ it: hub.item(k)!, s: hub.scope(k)! })).filter((p) => p.it && p.s)
  const dirty = Object.keys(base).length + Object.keys(own).length > 0
  const bv = (k: string, s: Scope) => base[k] ?? s.base
  const cv = (c: ListingChannel, k: string, fallback: string) => { const e = own[`${c}|${k}`]; return e && typeof e.v === 'string' ? e.v : fallback }
  const writeOwn = (c: ListingChannel, k: string, v: Val) => setOwn((o) => ({ ...o, [`${c}|${k}`]: { c, k, v } }))
  const save = () => {
    const st = useStore.getState()
    for (const [k, v] of Object.entries(base)) st.sl3Base(k, v)
    for (const e of Object.values(own)) st.sl3Custom(e.c, e.k, e.v)
    onDone()
  }
  // a one-channel property has nothing to split: its one channel's value is edited directly (its own value if it has one)
  const one = hub.chs.length === 1
  const split = pairs.length === 1 && ((pairs[0].s.perChannel && !one) || pairs[0].s.set.length > 0)
  let body: ReactNode
  if (split) {
    const { it, s } = pairs[0]
    const dropped = (c: ListingChannel) => { const e = own[`${c}|${it.key}`]; return e !== undefined && typeof e.v !== 'string' }
    body = (
      <KhSplit>
        <KhSplitRow base note={s.uses.length ? `Used by ${names(s.uses)}` : 'No channel uses it right now'}>
          <Control item={it} value={bv(it.key, s)} write={(v) => setBase({ ...base, [it.key]: v })} />
        </KhSplitRow>
        {s.on.map((c) => {
          const o = s.own.find((x) => x.c === c)
          const st = s.set.find((x) => x.c === c)
          const added = own[`${c}|${it.key}`]
          if (st) return <KhSplitRow key={c} channel={c} note={`${setByText(c, st.why)} · ${display(it, st.value)}`} />
          if ((o && !dropped(c)) || (added && typeof added.v === 'string')) return (
            <KhSplitRow key={c} channel={c} action={<button type="button" className="h-textlink" onClick={() => writeOwn(c, it.key, o ? backToBase(o) : undefined)}>Use the Base</button>}>
              <Control item={it} value={cv(c, it.key, o?.value ?? bv(it.key, s))} write={(v) => writeOwn(c, it.key, v)} />
            </KhSplitRow>
          )
          return <KhSplitRow key={c} channel={c} note="Uses the Base" action={<button type="button" className="h-textlink" onClick={() => writeOwn(c, it.key, bv(it.key, s))}>Customize</button>} />
        })}
      </KhSplit>
    )
  } else {
    body = (
      <div className={cx(pairs.length > 1 && 'h-khc-edit__pair')}>
        {pairs.map(({ it, s }) => {
          const c = s.only ?? (one && s.own.length ? s.own[0].c : undefined)
          const o = c ? s.own[0] : undefined
          const control = c
            ? <Control item={it} value={cv(c, it.key, o?.value ?? '')} write={(v) => writeOwn(c, it.key, v)} />
            : <Control item={it} value={bv(it.key, s)} write={(v) => setBase({ ...base, [it.key]: v })} />
          return pairs.length > 1 ? <label key={it.key} className="h-khc-edit__field"><span>{it.label}</span>{control}</label> : <div key={it.key}>{control}</div>
        })}
      </div>
    )
  }
  return (
    <div className="h-khc-edit">
      {body}
      <div className="h-khc-edit__foot">
        <span className="h-khc-edit__note">{note}</span>
        <Button onClick={onDone}>Cancel</Button>
        <Button kind="primary" disabled={!dirty} onClick={save}>Save</Button>
      </div>
    </div>
  )
}

/* ---------- amenity: which channels list it ---------- */
function AmenityFact({ hub, name, editing, onEdit, note, sub, actionOverride }: { hub: Hub; name: string; editing: boolean; onEdit: (v: boolean) => void; note?: ReactNode; sub?: ReactNode; actionOverride?: ReactNode }) {
  const [draft, setDraft] = useState<Partial<Record<ListingChannel, boolean>>>({})
  const chs = hub.chs
  const on = chs.filter((c) => hub.amenityOn(name, c))
  const off = chs.filter((c) => !on.includes(c))
  const every = on.length === chs.length && chs.length > 0
  // exception-only (S10 QA, 1 Oct): the value column already says Listed/Not listed, so the scope column stays blank
  // unless some channels disagree, no "All channels"/"No channel lists it" restating what the value just said.
  const scope = on.length === 0 || every ? undefined : `Not on ${names(off)}`
  const isOn = (c: ListingChannel) => draft[c] ?? hub.amenityOn(name, c)
  const save = () => {
    const st = useStore.getState()
    for (const [c, v] of Object.entries(draft) as Array<[ListingChannel, boolean]>) st.sl3Custom(c, `amenity:${name}`, v ? 'on' : 'off')
    setDraft({}); onEdit(false)
  }
  return (
    <KhcFact dataKey={`amenity:${name}`} label={name} value={on.length ? 'Listed' : 'Not listed'} sub={sub} scope={scope}
      action={!editing && (actionOverride ?? <IconButton icon="pencil" label={`Edit ${name}`} onClick={() => onEdit(true)} />)}
      editor={editing && (
        <div className="h-khc-edit">
          <div className="h-khc-edit__amen">{chs.map((c) => <KhChannelCheck key={c} channel={c} on={isOn(c)} onChange={(v) => setDraft({ ...draft, [c]: v })} />)}</div>
          <div className="h-khc-edit__foot"><span className="h-khc-edit__note">{note}</span><Button onClick={() => { setDraft({}); onEdit(false) }}>Cancel</Button><Button kind="primary" disabled={!Object.keys(draft).length} onClick={save}>Save</Button></div>
        </div>
      )} />
  )
}

/* ---------- booking policies: each channel has its own ---------- */
function PolicyFact({ kind, base, editing, onEdit, actionOverride }: { kind: 'cancel' | 'instant'; base: string; editing: boolean; onEdit: (v: boolean) => void; actionOverride?: ReactNode }) {
  const custom = useStore((s) => s.sl3.custom)
  const cards = useAllCancellationCards()
  const chs = useListingChannels()
  const [draft, setDraft] = useState<Partial<Record<ListingChannel, string>>>({})
  const { options, defaults } = KH_INSTANT
  const instant = (c: ListingChannel) => draft[c] ?? custom[c]?.['policy:instant'] ?? defaults[c]
  const label = kind === 'cancel' ? 'Cancellation policy' : 'Instant book'
  const lines = chs.map((c) => (
    <span key={c} className="h-khc-own">{NAME(c)}<b>{kind === 'cancel' ? cards[c][0].title : options.find((o) => o.id === instant(c))?.label.replace('Automatically accept', 'Accept')}</b></span>
  ))
  const editor = kind === 'cancel' ? (
    <div className="h-khc-edit">
      <KhSplit>{chs.map((c) => <KhSplitRow key={c} channel={c} note={cards[c].map((x) => x.kicker ?? x.title).join(' · ')} action={<Link className="h-textlink" to={`${base}/ch/${c}/policies`}>Open in {NAME(c)} Booking policies</Link>} />)}</KhSplit>
      <div className="h-khc-edit__foot"><span className="h-khc-edit__note">{chs.length > 1 ? 'Each channel has its own terms, so they’re changed in the channel’s Booking policies.' : `They’re changed in ${NAME(chs[0] ?? 'airbnb')}’s Booking policies.`}</span><Button onClick={() => onEdit(false)}>Close</Button></div>
    </div>
  ) : (
    <div className="h-khc-edit">
      <KhSplit>{chs.map((c) => (
        <KhSplitRow key={c} channel={c}>
          <Dropdown label={`Instant book on ${NAME(c)}`} value={options.find((o) => o.id === instant(c))?.label} options={options.map((o) => o.label)} onChange={(l) => setDraft({ ...draft, [c]: options.find((o) => o.label === l)!.id })} />
        </KhSplitRow>
      ))}</KhSplit>
      <div className="h-khc-edit__foot"><span className="h-khc-edit__note" /><Button onClick={() => { setDraft({}); onEdit(false) }}>Cancel</Button>
        <Button kind="primary" disabled={!Object.keys(draft).length} onClick={() => { const st = useStore.getState(); for (const [c, v] of Object.entries(draft) as Array<[ListingChannel, string]>) st.sl3Custom(c, 'policy:instant', v === defaults[c] ? undefined : v); setDraft({}); onEdit(false) }}>Save</Button></div>
    </div>
  )
  return (
    <KhcFact dataKey={`policy:${kind}`} label={label} value={chs.length > 1 ? 'Each channel has its own' : `Set on ${NAME(chs[0] ?? 'airbnb')}`} scope={<>{lines}</>}
      action={!editing && (actionOverride ?? <IconButton icon="pencil" label={`Edit ${label}`} onClick={() => onEdit(true)} />)} editor={editing && editor} />
  )
}

/** One fact row. `note` is shown while editing ("Also used in 3 other answers"). */
export function FactRow({ hub, fact, editing, onEdit, note, sub, base, actionOverride }: {
  hub: Hub; fact: FactRef; editing: boolean; onEdit: (v: boolean) => void; note?: ReactNode; sub?: ReactNode; base: string
  /** replaces the pencil (the Knowledge Hub topic table's ··· menu, ) */
  actionOverride?: ReactNode
}) {
  const [shown, setShown] = useState(false)
  const k0 = fact.keys[0]
  if (k0.startsWith('amenity:')) return <AmenityFact hub={hub} name={k0.slice(8)} editing={editing} onEdit={onEdit} note={note} sub={sub} actionOverride={actionOverride} />
  if (k0 === 'policy:cancel' || k0 === 'policy:instant') return <PolicyFact kind={k0 === 'policy:cancel' ? 'cancel' : 'instant'} base={base} editing={editing} onEdit={onEdit} actionOverride={actionOverride} />
  const pairs = fact.keys.map((k) => ({ k, it: hub.item(k), s: hub.scope(k) })).filter((p) => p.it && p.s)
  if (!pairs.length) return null
  const vals = pairs.map(({ k, it, s }) => {
    const own = s!.only || (hub.chs.length === 1 && s!.own.length) ? s!.own[0]?.value ?? '' : s!.base
    const v = display(it!, own)
    return fact.mask?.includes(k) && !shown ? MASK : v
  })
  const text = fact.fmt ? fact.fmt(vals) : vals.join(' · ')
  const masked = !!fact.mask?.length
  const label = fact.label ?? pairs[0].it!.label
  return (
    <KhcFact dataKey={k0} label={label}
      value={masked ? <span className="h-khc-mask">{text}<button type="button" className="h-khc-eye" aria-label={shown ? 'Hide the password' : 'Show the password'} onClick={() => setShown(!shown)}><Icon name={shown ? 'eye-off' : 'eye'} /></button></span> : text || '-'}
      sub={sub} scope={<Caption hub={hub} keys={fact.keys} />}
      action={!editing && (actionOverride ?? <IconButton icon="pencil" label={`Edit ${label}`} onClick={() => onEdit(true)} />)}
      editor={editing && <Editor hub={hub} keys={fact.keys} note={note} onDone={() => onEdit(false)} />} />
  )
}
