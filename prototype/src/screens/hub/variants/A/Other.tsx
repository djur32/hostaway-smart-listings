/* KH-A · Photos (a thumbnail row per channel), Policies (per channel, no Base) and More facts (AI-only facts). */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Dropdown, KhaAddLink, KhaCell, KhaCellButton, KhaColHead, KhaHeadRow, KhaPopField, KhaPopover, KhaQuiet, KhaRow, KhaScope, KhaStrip,
  KhaTable, KhaTip, KhaToolbar, cx,
} from '../../../../ds'
import { channelPhotos } from '../../../../data/photos'
import { photoUrl } from '../../../../data/v3-cv'
import { KH_INSTANT } from '../../../../data/v3-kh'
import { useAllCancellationCards } from '../../policyCards'
import type { ListingChannel } from '../../../../data/sl3'
import { useStore } from '../../../../store/store'
import { useHubUi } from '../../state'
import { NAME, cellId, names } from './model'
import { hubCustom, useHubPid, useListingChannels } from '../../perProperty'
import type { Ctx } from './Matrix'

/* ---------------- Photos ---------------- */
function Thumbs({ keys, max }: { keys: string[]; max: number }) {
  const lib = useStore((s) => s.photoLib)
  const shown = keys.slice(0, max)
  return (
    <span className="kha-thumbs">
      {shown.map((k) => <img key={k} className="kha-thumb" src={photoUrl(k)} alt={lib.meta[k]?.description || 'Photo'} />)}
      {keys.length > max && <span className="kha-thumb kha-thumb--more">+{keys.length - max}</span>}
    </span>
  )
}
export function Photos({ base, narrow }: { base: string; narrow: boolean }) {
  const CHS = useListingChannels()
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const per = useMemo(() => Object.fromEntries(CHS.map((c) => [c, channelPhotos(c, lib, { tips, custom })])) as Record<ListingChannel, { shown: string[]; hidden: string[] }>, [lib, tips, custom])
  const max = narrow ? 2 : 3 // Base column
  const chMax = narrow ? 1 : 2 // channel columns: thumbnails keep their size, fewer show
  return (
    <>
      <KhaToolbar left={<span className="kha-hint">Photos, captions and room tags live in one library. Each channel shows its own selection and order.</span>}
        right={<Link className="h-textlink" to={`${base}/photos`}>Manage photos</Link>} />
      <KhaTable layout="text" label="Photos by channel" channels={CHS}>
        <KhaHeadRow first="Photos" cols={[<KhaColHead key="b" col="base" sub="The library" />, ...CHS.map((c) => <KhaColHead key={c} col={c} sub={`${per[c].shown.length} shown`} />)]} />
        <KhaRow>
          <KhaCell item><span className="kha-itemname">Cover photo</span></KhaCell>
          <KhaCell className="kha-cell--base"><span className="kha-cover"><Thumbs keys={lib.base.slice(0, 1)} max={1} /><span className="kha-text">{lib.meta[lib.base[0]]?.description ?? '—'}</span></span></KhaCell>
          {CHS.map((c) => {
            const k = per[c].shown[0]
            return <KhaCell key={c}>{k === lib.base[0] ? <KhaQuiet /> : <span className="kha-cover"><Thumbs keys={[k]} max={1} /><span className="kha-text">{lib.meta[k]?.description ?? '—'}</span></span>}</KhaCell>
          })}
        </KhaRow>
        <KhaRow>
          <KhaCell item><span className="kha-itemname">First photos</span></KhaCell>
          <KhaCell className="kha-cell--base"><Thumbs keys={lib.base} max={max} /></KhaCell>
          {CHS.map((c) => <KhaCell key={c}>{per[c].shown.slice(0, 5).join() === lib.base.slice(0, 5).join() ? <KhaQuiet /> : <Thumbs keys={per[c].shown} max={chMax} />}</KhaCell>)}
        </KhaRow>
        <KhaRow>
          <KhaCell item><span className="kha-itemname">Photos shown</span></KhaCell>
          <KhaCell className="kha-cell--base"><span className="kha-val">{lib.base.length} in the library</span></KhaCell>
          {CHS.map((c) => <KhaCell key={c}><span className="kha-val">{per[c].shown.length}{per[c].hidden.length ? <span className="kha-muted"> · {per[c].hidden.length} hidden</span> : null}</span></KhaCell>)}
        </KhaRow>
      </KhaTable>
    </>
  )
}

/* ---------------- Policies: cancellation (each channel's own terms) and instant book (per channel) ---------------- */
const INSTANT = KH_INSTANT.options
export function Policies({ ctx, base }: { ctx: Ctx; base: string }) {
  const CHS = useListingChannels()
  const custom = useStore((s) => s.sl3.custom)
  const { open, setOpen, flash, cited } = ctx
  const instantOf = (c: ListingChannel) => (custom[c]?.['policy:instant'] as string | undefined) ?? KH_INSTANT.defaults[c]
  const cards = useAllCancellationCards()
  return (
    <>
      <KhaToolbar left={<span className="kha-hint">{CHS.length > 1 ? 'Each channel has its own cancellation terms, set in its Booking policies.' : `${names(CHS)} has its own cancellation terms, set in its Booking policies.`}</span>} />
      <KhaTable layout="text" label="Policies by channel" channels={CHS}>
        <KhaHeadRow first="Policy" cols={[<KhaColHead key="b" col="base" />, ...CHS.map((c) => <KhaColHead key={c} col={c} />)]} />
        <KhaRow>
          <KhaCell item><span className="kha-itemname">Cancellation policy</span></KhaCell>
          <KhaCell className="kha-cell--base"><KhaQuiet>{CHS.length > 1 ? 'Each channel sets its own' : `${names(CHS)} sets its own`}</KhaQuiet></KhaCell>
          {CHS.map((c) => {
            const cs = cards[c]
            return (
              <KhaCell key={c}>
                <KhaTip title={`${NAME(c)}’s own terms`} text={<>{cs.map((x) => `${x.title}${x.kicker ? ` (${x.kicker})` : ''}: ${x.body}`).join(' ')} <Link className="kha-tiplink" to={`${base}/ch/${c}/policies`}>Open in {NAME(c)} policies</Link></>}>
                  <span className="kha-text">{cs.map((x) => x.kicker ? `${x.title.split(' (')[0]} ${x.kicker}` : x.title).join(' · ')}</span>
                </KhaTip>
              </KhaCell>
            )
          })}
        </KhaRow>
        <KhaRow>
          <KhaCell item><span className="kha-itemname">Booking requests</span></KhaCell>
          <KhaCell className="kha-cell--base"><KhaQuiet>{CHS.length > 1 ? 'Each channel sets its own' : `${names(CHS)} sets its own`}</KhaQuiet></KhaCell>
          {CHS.map((c) => {
            const id = cellId('policy:instant', c)
            const cur = INSTANT.find((o) => o.id === instantOf(c))!
            return (
              <KhaCell key={c}>
                <KhaCellButton cellId={id} label={`Booking requests, ${NAME(c)}`} selected={open === id} cited={cited[id]} flash={flash === id} onClick={() => setOpen(open === id ? null : id)}>
                  <span className="kha-text">{cur.label}</span>
                </KhaCellButton>
                {open === id && <InstantEditor c={c} cur={cur.id} onClose={() => setOpen(null)} />}
              </KhaCell>
            )
          })}
        </KhaRow>
      </KhaTable>
    </>
  )
}
function InstantEditor({ c, cur, onClose }: { c: ListingChannel; cur: string; onClose: () => void }) {
  const [v, setV] = useState(cur)
  const line = INSTANT.find((o) => o.id === v)?.line
  return (
    <KhaPopover title="Booking requests" onClose={onClose}
      foot={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={v === cur} onClick={() => { useStore.getState().sl3Custom(c, 'policy:instant', v === KH_INSTANT.defaults[c] ? undefined : v); onClose() }}>Save</Button></>}>
      <KhaPopField label={`Instant book on ${NAME(c)}`} caption={<KhaScope text={line ?? ''} />}>
        <Dropdown label={`Instant book on ${NAME(c)}`} value={INSTANT.find((o) => o.id === v)?.label} options={INSTANT.map((o) => o.label)} onChange={(l) => setV(INSTANT.find((o) => o.label === l)!.id)} />
      </KhaPopField>
    </KhaPopover>
  )
}

/* ---------------- More facts: only the Hub and your AI replies use them ---------------- */
export function Facts({ ctx }: { ctx: Ctx }) {
  const CHS = useListingChannels()
  const pid = useHubPid()
  const base = useStore((s) => s.sl3.base)
  const added = useHubUi((s) => s.added)
  const { open, setOpen, flash, cited } = ctx
  const [adding, setAdding] = useState(false)
  const facts = [...hubCustom(pid), ...added]
  return (
    <>
      <KhaToolbar left={<span className="kha-hint">Things guests ask about that no listing field holds. No channel shows them; only your AI replies use them.</span>} />
      <KhaTable layout="text" label="More facts" channels={CHS}>
        <KhaHeadRow first="Fact" cols={[<KhaColHead key="b" col="base" sub={`${facts.length} facts`} />, ...CHS.map((c) => <KhaColHead key={c} col={c} />)]} />
        {facts.map((f) => {
          const key = `kh.${f.id}`
          const id = cellId(key, 'base')
          const v = base[key] ?? f.value
          return (
            <KhaRow key={f.id} dataKey={key}>
              <KhaCell item><span className="kha-itemname">{f.label}<small>{f.source}</small></span></KhaCell>
              <KhaCell className="kha-cell--base">
                <KhaCellButton cellId={id} label={`${f.label}, Base`} selected={open === id} cited={cited[id]} flash={flash === id} onClick={() => setOpen(open === id ? null : id)}>
                  <span className="kha-text">{v}</span>
                </KhaCellButton>
                {open === id && <FactEditor label={f.label} k={key} value={v} onClose={() => setOpen(null)} />}
              </KhaCell>
              <KhaCell span><KhaQuiet>Only your AI replies use it</KhaQuiet></KhaCell>
            </KhaRow>
          )
        })}
        {facts.length === 0 && !adding && <KhaRow><KhaCell item><span className="kha-muted">No facts yet</span></KhaCell><KhaCell span={false} className="kha-cell--wide"><KhaQuiet>Add what guests ask about that no listing field holds, like parking or where the bins are.</KhaQuiet></KhaCell></KhaRow>}
        {adding ? <AddFact onDone={() => setAdding(false)} /> : <KhaAddLink label="Add a fact" onClick={() => setAdding(true)} />}
      </KhaTable>
    </>
  )
}
function FactEditor({ label, k, value, onClose }: { label: string; k: string; value: string; onClose: () => void }) {
  const [v, setV] = useState(value)
  return (
    <KhaPopover title={label} onClose={onClose}
      foot={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={v === value} onClick={() => { useStore.getState().sl3Base(k, v); onClose() }}>Save</Button></>}>
      <KhaPopField label="Base" note="Only your AI replies use it">
        <textarea className="h-textarea kha-textarea" rows={4} value={v} aria-label={label} autoFocus onChange={(e) => setV(e.target.value)} />
      </KhaPopField>
    </KhaPopover>
  )
}
function AddFact({ onDone }: { onDone: () => void }) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const ok = !!(label.trim() && value.trim())
  return (
    <>
      <KhaRow tone="add">
        <KhaCell item><input className="h-input kha-addinput" autoFocus placeholder="e.g. Late checkout" aria-label="What it’s about" value={label} onChange={(e) => setLabel(e.target.value)} /></KhaCell>
        <KhaCell className={cx('kha-cell--base', 'kha-cell--wide')}><input className="h-input" placeholder="e.g. Until 1 PM for €15, if the next guest allows." aria-label="The fact" value={value} onChange={(e) => setValue(e.target.value)} /></KhaCell>
      </KhaRow>
      <KhaStrip tone="add" actions={<><button type="button" className="h-textlink" onClick={onDone}>Cancel</button><Button kind="primary" disabled={!ok} onClick={() => { useHubUi.getState().add({ id: `added-${Date.now()}`, label: label.trim(), value: value.trim(), source: 'Added by you · just now' }); onDone() }}>Add fact</Button></>}>
        Your AI replies use it right away. To show it to guests, add it to a listing field too.
      </KhaStrip>
    </>
  )
}
