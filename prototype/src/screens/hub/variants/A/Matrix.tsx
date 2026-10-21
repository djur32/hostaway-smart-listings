/* KH-A · the item matrix (Property, Descriptions, Arrival, Location, Rules, Pricing & availability) and its cell editor. */
import { useState, type ReactNode } from 'react'
import {
  Button, Dropdown, KhaCellButton, KhaCellStatic, KhaCell, KhaColHead, KhaGroup, KhaHeadRow, KhaNone, KhaPopField, KhaPopover, KhaQuiet,
  KhaRow, KhaScope, KhaSetBy, KhaTable, KhaTip, NumberField, TaskList, Toggle, cx,
} from '../../../../ds'
import type { KhItem } from '../../../../data/v3-kh'
import { useStore } from '../../../../store/store'
import { backToBase, display, scopeOf, type HubDraft, type Scope } from '../../model'
import { NAME, cellId, cellOf, guestsSee, names, type Col, type GroupDef, type TabId } from './model'
import { useListingChannels } from '../../perProperty'
import type { ListingChannel } from '../../../../data/sl3'

export interface Ctx {
  d: HubDraft
  items: KhItem[]
  open: string | null
  setOpen: (id: string | null) => void
  cited: Record<string, number>
  flash: string | null
  tip: string | null
}

const WHY_NA = (c: ListingChannel, what = 'field') => `${NAME(c)} has no ${what} for this.`

export function ItemMatrix({ tab, groups, ctx }: { tab: TabId; groups: GroupDef[]; ctx: Ctx }) {
  const { d, items } = ctx
  const CHS = useListingChannels()
  const rows = groups.flatMap((g) => g.rows).filter((r) => r.kind === 'item').map((r) => items.find((i) => i.key === r.key)).filter((i): i is KhItem => !!i)
  const scopes = new Map(rows.map((i) => [i.key, scopeOf(i, d)]))
  const own = (c: ListingChannel) => rows.filter((i) => cellOf(i, scopes.get(i.key)!, c).state === 'own').length
  const layout = tab === 'pricing' ? 'values' : 'text'
  return (
    <KhaTable layout={layout} label={`${tab} by channel`} channels={CHS}>
      <KhaHeadRow first={tab === 'pricing' ? 'Item' : tab === 'descriptions' ? 'Text' : 'Field'}
        cols={[<KhaColHead key="b" col="base" sub={`${rows.length} items`} />, ...CHS.map((c) => { const n = own(c); return <KhaColHead key={c} col={c} sub={n ? `${n} own` : 'All from the Base'} /> })]} />
      {groups.map((g) => (
        <div key={g.id} role="rowgroup" className="kha-rowgroup">
          {g.title && <KhaGroup title={g.title} />}
          {g.rows.map((r) => {
            if (r.kind === 'calc') return (
              <KhaRow key={r.key} tone="calc">
                <KhaCell item><span className="kha-itemname is-calc">{r.label}<small>{r.sub}</small></span></KhaCell>
                {(['base', ...CHS] as Col[]).map((c) => <KhaCell key={c}><span className={cx('kha-val', c !== 'base' && 'is-calc')}>{guestsSee(items, d, c)}</span></KhaCell>)}
              </KhaRow>
            )
            const item = items.find((i) => i.key === r.key)
            if (!item) return null
            return <ItemRow key={item.key} item={item} s={scopes.get(item.key)!} ctx={ctx} values={layout === 'values'} />
          })}
        </div>
      ))}
    </KhaTable>
  )
}

function ItemRow({ item, s, ctx, values }: { item: KhItem; s: Scope; ctx: Ctx; values: boolean }) {
  const { open, setOpen, cited, flash, tip } = ctx
  const CHS = useListingChannels()
  const id = (col: Col) => cellId(item.key, col)
  const toggle = (col: Col) => setOpen(open === id(col) ? null : id(col))
  const baseText = display(item, s.base)
  const editor = (col: Col) => open === id(col) ? <CellEditor item={item} col={col} s={s} ctx={ctx} /> : null
  return (
    <KhaRow dataKey={item.key}>
      <KhaCell item><span className="kha-itemname">{item.label}</span></KhaCell>
      <KhaCell className="kha-cell--base">
        {s.only ? <KhaQuiet>{NAME(s.only)} only</KhaQuiet> : (
          <KhaCellButton cellId={id('base')} label={`${item.label}, Base`} selected={open === id('base')} cited={cited[id('base')]} flash={flash === id('base')} onClick={() => toggle('base')}>
            {baseText ? <span className={cx(values ? 'kha-val' : 'kha-text')}>{baseText}</span> : <KhaQuiet>Empty</KhaQuiet>}
          </KhaCellButton>
        )}
        {editor('base')}
      </KhaCell>
      {CHS.map((c) => {
        const v = cellOf(item, s, c)
        const cid = id(c)
        let body: ReactNode
        if (v.state === 'na') body = <KhaTip title={`Not on ${NAME(c)}`} text={WHY_NA(c)} defaultOpen={tip === cid}><KhaNone /></KhaTip>
        else if (v.state === 'set') body = <KhaTip title={`Set by ${NAME(c)}`} text={`${v.why ?? ''}. Change it in ${NAME(c)}.`} defaultOpen={tip === cid}><KhaCellStatic cellId={cid} cited={cited[cid]} flash={flash === cid}><KhaSetBy channel={c} /></KhaCellStatic></KhaTip>
        else if (v.state === 'fixed') body = <KhaTip title="Same on every channel" text="Change the Base and every channel follows." defaultOpen={tip === cid}><KhaCellStatic cellId={cid} cited={cited[cid]} flash={flash === cid}><KhaQuiet /></KhaCellStatic></KhaTip>
        else if (!v.editable) body = <KhaCellStatic cellId={cid} cited={cited[cid]} flash={flash === cid}><span className={values ? 'kha-val' : 'kha-text'}>{v.text}</span></KhaCellStatic>
        else body = (
          <KhaCellButton cellId={cid} label={`${item.label}, ${NAME(c)}`} selected={open === cid} cited={cited[cid]} flash={flash === cid} onClick={() => toggle(c)}>
            {v.state === 'inherit' ? <KhaQuiet /> : <span className={values ? 'kha-val' : 'kha-text'}>{v.text}</span>}
          </KhaCellButton>
        )
        return <KhaCell key={c}>{body}{editor(c)}</KhaCell>
      })}
    </KhaRow>
  )
}

/* ---------------- the cell edit popover ---------------- */
function CellEditor({ item, col, s, ctx }: { item: KhItem; col: Col; s: Scope; ctx: Ctx }) {
  const close = () => ctx.setOpen(null)
  const st = useStore.getState()
  if (col === 'base') return <BaseEditor item={item} s={s} close={close} save={(v) => { st.sl3Base(item.key, v); close() }} />
  const c = col
  const own = s.own.find((o) => o.c === c)
  return <ChannelEditor key={c} item={item} c={c} s={s} own={own?.value} close={close}
    save={(v) => {
      if (v !== null) st.sl3Custom(c, item.key, v)
      else if (own) st.sl3Custom(c, item.key, backToBase(own) ?? undefined)
      close()
    }} />
}

function BaseEditor({ item, s, close, save }: { item: KhItem; s: Scope; close: () => void; save: (v: string) => void }) {
  const [v, setV] = useState(s.base)
  const ownNames = s.own.map((o) => o.c)
  const note = s.uses.length ? `Used by ${names(s.uses)}` : s.on.length ? 'No channel uses it right now' : 'Only your AI replies use it'
  return (
    <KhaPopover title={item.label} onClose={close}
      foot={<><Button onClick={close}>Cancel</Button><Button kind="primary" disabled={v === s.base} onClick={() => save(v)}>Save</Button></>}>
      <KhaPopField label="Base" note={note}
        caption={<KhaScope text={ownNames.length ? `${names(ownNames)} ${ownNames.length === 1 ? 'keeps its' : 'keep their'} own` : s.set.length ? `${names(s.set.map((x) => x.c))} ${s.set.length === 1 ? 'sets' : 'set'} its own` : s.on.length === 1 ? `${NAME(s.on[0])} follows the Base` : 'Every channel follows the Base'}
          count={item.limit ? `${v.length} / ${item.limit}` : undefined} />}>
        <Control item={item} value={v} onChange={setV} autoFocus />
      </KhaPopField>
    </KhaPopover>
  )
}

function ChannelEditor({ item, c, s, own, close, save }: { item: KhItem; c: ListingChannel; s: Scope; own?: string; close: () => void; save: (v: string | null) => void }) {
  const [mode, setMode] = useState<'own' | 'base'>(own !== undefined ? 'own' : 'base')
  const [v, setV] = useState(own ?? s.base)
  const others = s.uses.filter((x) => x !== c)
  const only = s.only === c
  const changed = mode === 'own' ? own === undefined || v !== own : own !== undefined
  return (
    <KhaPopover title={item.label} onClose={close}
      foot={<><Button onClick={close}>Cancel</Button><Button kind="primary" disabled={!changed} onClick={() => save(mode === 'own' ? v : null)}>Save</Button></>}>
      {!only && (
        <KhaPopField label="Base" note={others.length ? `Used by ${names(others)}` : undefined}>
          <Control item={item} value={s.base} disabled />
        </KhaPopField>
      )}
      <KhaPopField label={`${item.label} on ${NAME(c)}`}
        caption={only ? <KhaScope text={`${NAME(c)} only: the other channels have no such field`} /> : mode === 'own'
          ? <KhaScope text={`Custom for ${NAME(c)}`} count={item.limit ? `${v.length} / ${item.limit}` : undefined} action={<button type="button" className="h-textlink" onClick={() => setMode('base')}>Use the Base</button>} />
          : <KhaScope text="Uses the Base" action={<button type="button" className="h-textlink" onClick={() => { setV(own ?? s.base); setMode('own') }}>Customize for {NAME(c)}</button>} />}>
        <Control item={item} value={mode === 'own' ? v : s.base} onChange={setV} disabled={mode === 'base'} autoFocus={mode === 'own'} />
      </KhaPopField>
    </KhaPopover>
  )
}

/** Hostaway's controls for a value: input, textarea, dropdown, toggle, affix group, checkout tasks. */
function Control({ item, value, onChange, disabled, autoFocus }: { item: KhItem; value: string; onChange?: (v: string) => void; disabled?: boolean; autoFocus?: boolean }) {
  const set = (v: string) => onChange?.(v)
  switch (item.kind) {
    case 'textarea':
      return <textarea className="h-textarea kha-textarea" rows={Math.min(7, Math.max(3, Math.ceil(value.length / 52)))} value={value} disabled={disabled} autoFocus={autoFocus}
        aria-label={item.label} maxLength={item.limit} onChange={(e) => set(e.target.value)} onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)} />
    case 'select': case 'time': case 'dropdown':
      return <Dropdown label={item.label} value={value} options={item.options ?? []} disabled={disabled} onChange={set} />
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className="kha-toggle"><Toggle checked={yes} label={item.label} disabled={disabled} onChange={(x) => set(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tasks': return <TaskList value={value} onChange={set} disabled={disabled} />
    case 'money': case 'percent': case 'guests':
      return (
        // NumberField (ds/v3-ch.tsx), review 3 Oct: € before the value, the unit as a plain word, the shared small arrows
        <div className="kha-num"><NumberField label={item.label} value={value} disabled={disabled} autoFocus={autoFocus}
          onChange={(v) => set(v.replace(/[^0-9.]/g, ''))} currency={item.kind === 'money' ? '€' : undefined}
          unit={item.kind === 'percent' ? '%' : item.kind === 'guests' ? 'guests' : undefined} decimals={item.kind === 'money' ? 2 : 0}
          max={item.kind === 'percent' ? 100 : 99999} /></div>
      )
    default:
      return <input className="h-input" value={value} disabled={disabled} autoFocus={autoFocus} aria-label={item.label} maxLength={item.limit} onChange={(e) => set(e.target.value)} />
  }
}
export { Control as KhaAControl }
