/* KH-E · a tab of stacked fields under the lens (Paper KH-E1, E2, E3 Pricing / Availability).
 * Base lens: the master values, each captioned with who uses it; hovering "X has its own" shows the Base and X's value.
 * A channel lens: exactly what that channel receives. Own values are editable ("Use the Base"), inherited ones disabled
 * ("Customize for X"), listing-wide ones disabled ("Edit in the Base"), channel-owned ones locked ("Set by X"), and
 * fields the channel doesn't have fold into one line. "Show only differences" keeps what differs and folds the rest. */
import { useState, type ReactNode } from 'react'
import {
  Dot, Dropdown, Empty, FoldedLine, KheConfirm, KheField, KheScope, KhePair, KheTaskList, LensHover, MapBox, NoDiff, SaveActions,
  SecretInput, SectionHead, TagBox, Toggle, cx, CHECKOUT_PRESETS, withShortcodes, type KheTask,
} from '../../../../ds'
import type { ListingChannel } from '../../../../data/sl3'
import { KH_GROUPS, type KhItem } from '../../../../data/v3-kh'
import { backToBase, display } from '../../model'
import { CAPTION_NOTE, SET_BY, TAB_HEAD, TAB_LABEL } from './data'
import { NAME, addedItems, allItems, factItems, names, rowFor, type LensRow } from './lens'
import type { LensCtx } from './ctx'

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
export const parseTasks = (v: string): KheTask[] => v.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [n, ...r] = l.split('|'); return { name: n.trim(), details: r.join('|').trim() } })
export const formatTasks = (t: KheTask[]) => t.map((x) => (x.details ? `${x.name} | ${x.details}` : x.name)).join('\n')

export function tabItems(ctx: LensCtx): KhItem[] {
  const { tab, d, storeBase, storeCustom } = ctx
  return [...allItems().filter((i) => i.section === tab), ...(tab === 'custom' ? factItems() : []), ...addedItems(tab, d, storeBase, storeCustom)]
}

export function FieldsTab({ ctx, composer }: { ctx: LensCtx; composer?: ReactNode }) {
  const { tab, lens, diff, d, channels } = ctx
  const rows = tabItems(ctx).map((i) => rowFor(i, lens, d))
  const present = rows.filter((r) => r.kind !== 'absent')
  const absent = rows.filter((r) => r.kind === 'absent')
  const differ = present.filter((r) => r.differs)
  const visible = diff ? differ : present
  const same = diff ? present.filter((r) => !r.differs) : []
  const c = lens === 'base' ? null : lens
  const head = TAB_HEAD[tab]
  const groups = KH_GROUPS[tab]
  const arrivalHead = tab === 'arrival' && groups
  const desc = c
    ? `What ${NAME(c)} guests get. ${differ.length ? `${differ.length} of ${present.length} ${present.length === 1 ? 'field differs' : 'fields differ'} from the Base.` : 'Every field uses the Base.'}`
    : head.desc
  const save = <SaveActions dirty={d.dirty} onDiscard={d.discard} onSave={() => d.commit()} />

  // A property with no custom facts yet (every property but the scenario one, until the host adds some)
  if (tab === 'custom' && !rows.length && !composer) {
    return (
      <div className="khe-page">
        <SectionHead title={head.title} desc={head.desc} />
        <Empty title="No custom facts yet" icon="message-circle">
          <p>Add what guests ask about that no listing field holds. Your AI replies use them on every channel.</p>
          <button type="button" className="h-textlink" onClick={ctx.addFact}>Add a custom fact</button>
        </Empty>
      </div>
    )
  }

  // "Show only differences" and nothing differs: say so (Paper KH-E3 Availability)
  if (diff && !visible.length && !composer) {
    const elsewhere = channels.filter((x) => x !== c).flatMap((x) => {
      const r = rows.map((row) => rowFor(row.item, x, d)).find((row) => row.kind === 'own' || row.kind === 'set')
      return r ? [`${NAME(x)} has its own ${lc(r.item.label)}`] : []
    })
    return (
      <div className="khe-page">
        <NoDiff
          title={`${c ? NAME(c) : channels.length === 1 ? NAME(channels[0]) : 'Every channel'} uses the Base for all ${present.length} ${lc(TAB_LABEL[tab])} fields`}
          summary={present.slice(0, 6).map((r) => `${r.item.label} ${lc(display(r.item, r.value))}`).join(' · ') + '.'}
          elsewhere={c && elsewhere.length ? <>Elsewhere: {elsewhere.join(' · ')}.</> : undefined}
          action={<button type="button" className="h-textlink" onClick={() => ctx.setDiff(false)}>Show all {present.length} fields</button>} />
        {absent.length > 0 && c && <AbsentLine rows={absent} c={c} />}
      </div>
    )
  }

  const renderRows = (rs: LensRow[]) => {
    const out: ReactNode[] = []
    for (let i = 0; i < rs.length; i++) {
      const r = rs[i], n = rs[i + 1]
      if (r.item.key === 'wifi_name' && n?.item.key === 'wifi_password') { out.push(<KhePair key="wifi"><LensField row={r} ctx={ctx} /><LensField row={n} ctx={ctx} /></KhePair>); i++; continue }
      out.push(<LensField key={r.item.key} row={r} ctx={ctx} />)
    }
    return out
  }
  const byGroup = groups
    ? groups.map((g, gi) => ({ g, gi, rs: visible.filter((r) => r.item.group === g.id || (!r.item.group && gi === 0)) })).filter((x) => x.rs.length)
    : [{ g: null, gi: 0, rs: visible }]
  return (
    <div className="khe-page">
      <SectionHead title={arrivalHead ? groups[0].title : head.title} desc={desc} actions={save} />
      {composer}
      {byGroup.map(({ g, gi, rs }) => (
        <div key={g?.id ?? 'all'} className="khe-group">
          {g && !(arrivalHead && gi === 0) && <><h3 className="khe-subhead">{g.title}</h3>{g.desc && <p className="khe-subdesc">{g.desc}</p>}</>}
          {renderRows(rs)}
        </div>
      ))}
      {(same.length > 0 || (absent.length > 0 && c)) && (
        <div className="khe-folds">
          {same.length > 0 && (
            <FoldedLine action={<button type="button" className="h-textlink" onClick={() => ctx.setDiff(false)}>Show them</button>}>
              {c || channels.length === 1 ? `${same.length} ${same.length === 1 ? 'field uses' : 'fields use'} the Base on ${NAME(c ?? channels[0])}: ` : `${same.length} ${same.length === 1 ? 'field is' : 'fields are'} the same on every channel: `}
              {same.map((r) => r.item.label).join(', ')}.
            </FoldedLine>
          )}
          {absent.length > 0 && c && <AbsentLine rows={absent} c={c} />}
        </div>
      )}
    </div>
  )
}

function AbsentLine({ rows, c }: { rows: LensRow[]; c: ListingChannel }) {
  return (
    <FoldedLine>
      {rows.length} {rows.length === 1 ? 'field doesn’t' : 'fields don’t'} exist on {NAME(c)}: {rows.map((r) => `${r.item.label} (${names(r.s.on)} only)`).join(', ')}.
    </FoldedLine>
  )
}

/* ---------------- one field under the lens ---------------- */
function LensField({ row, ctx }: { row: LensRow; ctx: LensCtx }) {
  const { item, s, kind, value, channel } = row
  const { d, lens, channels } = ctx
  const [raised, setRaised] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const focus = () => setTimeout(() => document.querySelector<HTMLElement>(`[data-khe-key="${CSS.escape(item.key)}"] :is(textarea, input:not([type=checkbox]), .h-dropdown__trigger)`)?.focus(), 30)

  const write = kind === 'base' ? (v: string) => d.setBase(item.key, v, item.base)
    : kind === 'own' || kind === 'only' ? (v: string) => d.setCustom(channel!, item.key, v) : undefined
  const help = item.kind === 'url' ? withShortcodes(item.help) : item.help

  /* the caption: who uses this value, and the one action */
  let caption: ReactNode
  let action: ReactNode
  const hoverOpen = ctx.hover === item.key
  const hoverFor = (c: ListingChannel, text: string, own: string, first: boolean, owned?: boolean) => (
    <LensHover key={c} title={item.label} meta="2 versions" defaultOpen={hoverOpen && first} onOpenChange={setRaised}
      blocks={[{ who: 'base', sub: s.uses.length ? names(s.uses) : 'no channel uses it now', value: display(item, s.base) || 'Empty' }, { who: c, sub: owned ? 'set by the channel' : lens === 'base' ? 'its own' : 'in use', value: display(item, own) }]}
      actions={lens === 'base' ? <>
        <button type="button" className="h-textlink" onClick={() => ctx.setLens(c, item.key)}>Open in the {NAME(c)} lens</button>
        {!owned && <button type="button" className="h-textlink" onClick={() => { const o = s.own.find((x) => x.c === c); if (o) d.setCustom(c, item.key, backToBase(o)) }}>Use the Base on {NAME(c)}</button>}
      </> : undefined}>{text}</LensHover>
  )
  const note = CAPTION_NOTE[item.key]
  if (kind === 'base') {
    const missing = channels.filter((c) => !s.on.includes(c))
    // "Used by all channels" only when there is more than one channel (Friedrichshain: "Used by Airbnb")
    const parts: ReactNode[] = [<span key="u">{s.uses.length === channels.length && channels.length > 1 ? 'Used by all channels' : s.uses.length ? `Used by ${names(s.uses)}` : s.on.length ? 'No channel uses the Base' : 'Only your AI replies use it'}</span>]
    s.own.forEach((o, i) => parts.push(<Dot key={`d${o.c}`} />, hoverFor(o.c, `${NAME(o.c)} has its own`, o.value, i === 0)))
    s.set.forEach((x, i) => parts.push(<Dot key={`s${x.c}`} />, hoverFor(x.c, `${NAME(x.c)} sets its own`, SET_BY[item.key]?.shows ?? x.value, !s.own.length && i === 0, true)))
    if (missing.length) parts.push(<Dot key="m" />, <span key="mm">{names(missing)} {missing.length === 1 ? 'has' : 'have'} no such field</span>)
    if (note) parts.push(<Dot key="n" />, <span key="nn">{note}</span>)
    caption = <KheScope>{parts}</KheScope>
  } else if (kind === 'only') {
    const others = channels.filter((c) => c !== channel)
    caption = lens === 'base' && others.length
      ? <KheScope>{NAME(channel!)} only<Dot />other channels don’t have {lc(item.label)}</KheScope>
      : <KheScope>Only on {NAME(channel!)}{note && <><Dot />{note}</>}{!note && others.length ? <><Dot />{names(others)} don’t have it</> : null}</KheScope>
  } else if (kind === 'own') {
    caption = <KheScope>{hoverFor(channel!, `Custom for ${NAME(channel!)}`, value, true)}</KheScope>
    action = <button type="button" className="h-field-hint__action" onClick={() => (value !== s.base ? setConfirm(true) : d.setCustom(channel!, item.key, backToBase(s.own.find((o) => o.c === channel)!)))}>Use the Base</button>
  } else if (kind === 'inherit') {
    caption = <KheScope>Uses the Base{note && <><Dot />{note}</>}</KheScope>
    action = <button type="button" className="h-field-hint__action" onClick={() => { d.setCustom(channel!, item.key, s.base); focus() }}>Customize for {NAME(channel!)}</button>
  } else if (kind === 'shared') {
    caption = <KheScope>Uses the Base{channels.length > 1 && <><Dot />same on every channel</>}{note && <><Dot />{note}</>}</KheScope>
    action = <button type="button" className="h-field-hint__action" onClick={() => ctx.setLens('base', item.key)}>Edit in the Base</button>
  } else if (kind === 'set') {
    const why = SET_BY[item.key]?.why ?? s.set.find((x) => x.c === channel)?.why
    caption = <KheScope lock>Set by {NAME(channel!)}{why && <><Dot />{why}</>}</KheScope>
  }

  const shown = kind === 'set' ? SET_BY[item.key]?.shows ?? display(item, value) : value
  const control = kind === 'set' && SET_BY[item.key]?.shows
    ? <input className="h-input khe-short" value={shown} disabled aria-label={item.label} />
    : <Control item={item} value={shown} write={write} />

  return (
    <KheField dataKey={item.key} label={item.label} help={help} caption={caption} action={action} raised={raised || (hoverOpen && (s.own.length > 0 || s.set.length > 0))}
      below={confirm ? <KheConfirm text={`${NAME(channel!)}’s own ${item.kind === 'textarea' ? 'text' : 'value'} goes back to the Base.`} confirmLabel="Use the Base"
        onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); d.setCustom(channel!, item.key, backToBase(s.own.find((o) => o.c === channel) ?? { c: channel!, value, orig: 'inherit' })) }} /> : undefined}>
      {control}
    </KheField>
  )
}

/* ---------------- the control for a value (Hostaway's inputs and dropdown); no `write` = the DS disabled state ---------------- */
function Control({ item, value, write }: { item: KhItem; value: string; write?: (v: string) => void }) {
  const disabled = !write
  const w = write ?? (() => {})
  switch (item.kind) {
    case 'textarea': {
      const rows = Math.min(10, Math.max(2, value.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / 110)), 0)))
      return <textarea className="h-textarea khe-textarea" rows={rows} value={value} disabled={disabled} aria-label={item.label} onChange={(e) => w(e.target.value)} />
    }
    case 'select': case 'time': case 'dropdown':
      return <Dropdown label={item.label} value={value} options={item.options ?? []} disabled={disabled} onChange={w} />
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className={cx('ch-toggle-line', disabled && 'is-disabled')}><Toggle checked={yes} disabled={disabled} label={item.label} onChange={(x) => w(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tags': {
      const tags = value.split(' · ').filter(Boolean)
      return <TagBox tags={tags} disabled={disabled} addLabel={item.key === 'languages' ? 'Add language' : 'Add tag'} onRemove={(t) => w(tags.filter((x) => x !== t).join(' · '))} />
    }
    case 'map': return <MapBox label={value} disabled={disabled} />
    case 'tasks': return <KheTaskList tasks={parseTasks(value)} disabled={disabled} presets={CHECKOUT_PRESETS} onChange={(t) => w(formatTasks(t))} />
    case 'money': case 'percent': case 'guests':
      return (
        <span className={cx('khe-num', disabled && 'is-disabled')}>
          {item.kind === 'money' && <span className="khe-num__affix">€</span>}
          <input className="khe-num__input" inputMode="decimal" value={value} disabled={disabled} aria-label={item.label} onChange={(e) => w(e.target.value.replace(/[^0-9.]/g, ''))} />
          {item.kind !== 'money' && <span className="khe-num__affix">{item.kind === 'percent' ? '%' : 'guests'}</span>}
        </span>
      )
    default:
      if (item.key === 'wifi_password') return <SecretInput value={value} disabled={disabled} label={item.label} onChange={w} />
      return <input className="h-input" type={item.kind === 'url' ? 'url' : 'text'} value={value} disabled={disabled} aria-label={item.label} maxLength={item.limit} onChange={(e) => w(e.target.value)} />
  }
}
