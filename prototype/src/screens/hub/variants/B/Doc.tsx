/* KH-B · the document's sections: read mode (label + value, captions only where channels differ) and the section's
 * edit form (stacked fields, Discard changes / Save). Writes go through the Hub draft → sl3Base / sl3Custom on Save.
 * Every per-channel line, check and caption uses the active property's channels (ctx.chs / useListingChannels). */
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, CHECKOUT_PRESETS, Dropdown, Icon, KhChannelCheck, KhChannelLine, KhField, KhSplit, KhSplitRow, KhTasks, KhbAddLink, KhbCaption,
  KhbChannelHover, KhbChip, KhbChips, KhbDot, KhbFact, KhbGrid, KhbGroup, KhbSection, Mark, MapBox, PhotosRow, PolicyCard, TagBox, Toggle,
  MobileActionBar, NumberField, cx, formatTasks, parseTasks,
} from '../../../../ds'
import { channelPhotos } from '../../../../data/photos'
import type { ListingChannel } from '../../../../data/sl3'
import { KH_INSTANT, type KhSectionId } from '../../../../data/v3-kh'
import { photoUrl } from '../../../../data/v3-cv'
import { useStore } from '../../../../store/store'
import { backToBase, display, scopeOf, useHubDraft, type HubDraft, type Scope } from '../../model'
import { useAllCancellationCards } from '../../policyCards'
import { useHubPid, useListingChannels, usedByText } from '../../perProperty'
import {
  B_GROUPS, NAME, addedDests, sectionDesc, bAmenities, isShort, names, onText, readValue,
  type BAmenity, type BFact, type BSection,
} from './model'

export interface EditIntent { key?: string; c?: ListingChannel; toBase?: boolean }
export interface DocCtx {
  base: string
  /** The active property's listing channels. */
  chs: ListingChannel[]
  read: HubDraft
  cites: Map<string, number>
  flash: string | null
  hover: string | null
  editing: KhSectionId | null
  intent: EditIntent | null
  onEdit: (s: KhSectionId, intent?: EditIntent) => void
  onCloseEdit: (saved?: { section: KhSectionId; channels: ListingChannel[] }) => void
  onAdd: (s: KhSectionId) => void
  addCard: (s: KhSectionId) => ReactNode
}

/* ================= one section ================= */
export function DocSection({ sec, facts, ctx, descOverride }: { sec: BSection; facts: BFact[]; ctx: DocCtx; descOverride?: string }) {
  if (ctx.editing === sec.id) return <EditSection sec={sec} facts={facts} ctx={ctx} />
  const addLabel = sec.add ?? `Add a fact to ${sec.label}`
  const add = ctx.addCard(sec.id)
  const foot = sec.id === 'photos' ? undefined : add ?? <KhbAddLink onClick={() => ctx.onAdd(sec.id)}>{addLabel}</KhbAddLink>
  // Photos: the library row carries Hostaway's own "Manage photos" link, so the section has no Edit
  const action = sec.id === 'photos' ? undefined
    : <button type="button" className="h-textlink khb-sec__link" onClick={() => ctx.onEdit(sec.id)}>Edit</button>
  let body: ReactNode
  if (sec.id === 'photos') body = <PhotosRead base={ctx.base} chs={ctx.chs} />
  else if (sec.id === 'amenities') body = <AmenitiesRead ctx={ctx} />
  else if (sec.id === 'policies') body = <PoliciesRead ctx={ctx} />
  else body = <ReadFacts section={sec.id} facts={facts} ctx={ctx} />
  return <KhbSection id={sec.id} title={sec.label} desc={descOverride ?? sectionDesc(sec, ctx.chs)} action={action} foot={foot}>{body}</KhbSection>
}

/* ================= read mode ================= */
function ReadFacts({ section, facts, ctx }: { section: KhSectionId; facts: BFact[]; ctx: DocCtx }) {
  const groups = B_GROUPS[section]
  const shown = facts.filter((f) => !f.hideRead)
  if (section === 'custom' && !shown.length) return <p className="khb-legend"><Icon name="info-circle" />No custom facts yet. Add what guests ask about that no listing field holds.</p>
  if (!groups) return <FactRuns facts={shown} ctx={ctx} />
  return (
    <>
      {groups.map((g) => {
        const rows = shown.filter((f) => f.group === g.id)
        return rows.length ? <KhbGroup key={g.id} title={g.title}><FactRuns facts={rows} ctx={ctx} /></KhbGroup> : null
      })}
      {shown.some((f) => !f.group) && <FactRuns facts={shown.filter((f) => !f.group)} ctx={ctx} />}
    </>
  )
}
/** Short facts two to a row, long ones full width, in document order. */
function FactRuns({ facts, ctx }: { facts: BFact[]; ctx: DocCtx }) {
  const out: ReactNode[] = []
  let run: BFact[] = []
  const flush = () => { if (run.length) out.push(<KhbGrid key={`g-${run[0].id}`}>{run.map((f) => <ReadFact key={f.id} f={f} ctx={ctx} />)}</KhbGrid>); run = [] }
  for (const f of facts) { if (f.wide) { flush(); out.push(<ReadFact key={f.id} f={f} ctx={ctx} />) } else run.push(f) }
  flush()
  return <>{out}</>
}
function ReadFact({ f, ctx }: { f: BFact; ctx: DocCtx }) {
  const s = scopeOf(f.item, ctx.read)
  const raw = s.only ? s.own[0]?.value ?? '' : s.base
  return <KhbFact id={f.id} label={f.label} value={readValue(f, raw, ctx.read) || <span className="khb-empty">Not set</span>} wide={f.wide}
    caption={captionFor(f, s, ctx)} cite={ctx.cites.get(f.id)} flash={ctx.flash === f.id} />
}

/** Where a value goes, in plain words; only when channels differ. Channel names open the Base-vs-channel card. */
function captionFor(f: BFact, s: Scope, ctx: DocCtx): ReactNode {
  if (f.section === 'custom') return <KhbCaption>Only your AI replies use this<KhbDot />{f.source}{f.updated ? ` · ${f.updated}` : ''}</KhbCaption>
  if (f.id.startsWith('kh.b.')) {
    const chs = addedDests(f.id).filter((x): x is ListingChannel => (ctx.chs as string[]).includes(x))
    return <KhbCaption>{chs.length ? `Used by your AI replies, ${names(chs)}` : 'Only your AI replies use this'}</KhbCaption>
  }
  if (f.id === 'price:nightly') return <KhbCaption>{usedByText(ctx.chs, ctx.chs)}<KhbDot />changes day by day in <Link className="h-textlink" to={`${ctx.base}/calendar`}>Calendar</Link></KhbCaption>
  const differs = !!s.only || s.own.length > 0 || s.set.length > 0 || (s.on.length > 0 && s.on.length < ctx.chs.length)
  if (!differs) return undefined
  if (s.only) return <KhbCaption>{NAME(s.only)} only</KhbCaption>
  const parts: ReactNode[] = []
  if (s.uses.length) parts.push(!s.own.length && !s.set.length && s.on.length < ctx.chs.length ? `Only on ${names(s.uses)}` : usedByText(s.uses, ctx.chs))
  for (const o of s.own) {
    const v = readValue(f, o.value)
    const hover = (
      <KhbChannelHover key={o.c} channel={o.c} label={NAME(o.c)} defaultOpen={ctx.hover === `${f.id}:${o.c}`}
        base={{ value: readValue(f, s.base), note: s.uses.length ? `used by ${names(s.uses)}` : 'no channel uses it' }}
        own={{ value: v, note: 'its own version' }}
        onUseBase={o.orig === 'override' || o.orig === 'inherit' ? () => ctx.onEdit(f.section, { key: f.id, c: o.c, toBase: true }) : undefined}
        onEdit={() => ctx.onEdit(f.section, { key: f.id, c: o.c })} />
    )
    parts.push(isShort(f, v) ? <span key={o.c} className="khb-cap__own">{hover}<b>{v}</b></span> : <span key={o.c} className="khb-cap__own">{hover} has its own</span>)
  }
  if (s.set.length) {
    const why = [...new Set(s.set.map((x) => f.item.setBy?.[x.c]))].filter(Boolean)[0]
    const chs = s.set.map((x) => x.c)
    const paren = why?.match(/\(([^)]+)\)/)?.[1]
    parts.push(<span key="set" className="khb-cap__set"><Icon name="lock" />{why ? `${names(chs)} sets its own${paren ? ` (${paren})` : ''}` : `Locked on ${names(chs)}`}</span>)
  }
  return <KhbCaption>{parts.flatMap((p, i) => (i ? [<KhbDot key={`d${i}`} />, p] : [p]))}</KhbCaption>
}

/* ---------- Photos ---------- */
function PhotosRead({ base, chs }: { base: string; chs: ListingChannel[] }) {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const sl3 = useMemo(() => ({ tips, custom }), [tips, custom])
  return (
    <>
      <div className="khb-photos">
        <PhotosRow label="Photo library" count={lib.base.length} desc={`Add photos, captions and room tags once. ${chs.length > 1 ? 'Each channel picks' : `${NAME(chs[0] ?? 'airbnb')} picks`} from here.`} manageTo={`${base}/photos`}
          photos={lib.base.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))} />
      </div>
      <KhbGrid>
        {chs.map((c) => {
          const { shown, hidden } = channelPhotos(c, lib, sl3)
          return <KhbFact key={c} id={`photos:${c}`} label={<span className="khb-chlabel"><Mark channel={c} size={14} />{NAME(c)}</span>}
            value={`${shown.length} photos · Cover: ${lib.meta[shown[0]]?.description ?? '—'}${hidden.length ? ` · ${hidden.length} hidden` : ''}`} />
        })}
      </KhbGrid>
    </>
  )
}

/* ---------- Amenities: chips by category; marks only when an amenity isn't on every channel ---------- */
function AmenitiesRead({ ctx }: { ctx: DocCtx }) {
  const custom = useStore((s) => s.sl3.custom)
  const pid = useHubPid()
  const groups = useMemo(() => bAmenities(custom, pid), [custom, pid])
  const all = ctx.chs.length
  return (
    <>
      {all > 1 && <p className="khb-legend"><Icon name="info-circle" />No logo: on every channel. Logos: only on those channels.</p>}
      {groups.map((g) => {
        const items = g.items.filter((i) => i.on.length > 0)
        if (!items.length) return null
        return (
          <KhbGroup key={g.group} title={g.group}>
            <KhbChips>
              {items.map((i) => <KhbChip key={i.name} id={i.key} name={i.name} on={i.on.length === all ? [] : i.on} note={i.note}
                cite={ctx.cites.get(i.key)} title={i.on.length === all ? onText(i.on, ctx.chs) : `Only on ${names(i.on)}`} />)}
            </KhbChips>
          </KhbGroup>
        )
      })}
    </>
  )
}
export function amenitySummary(custom: Partial<Record<ListingChannel, Record<string, string | null>>>, pid: string, chs: ListingChannel[], scenario: boolean) {
  const all = bAmenities(custom, pid).flatMap((g) => g.items).filter((i) => i.on.length > 0)
  const some = all.filter((i) => i.on.length < chs.length).length
  const n = `${all.length} ${all.length === 1 ? 'amenity' : 'amenities'}`
  if (scenario) return `${all.length} amenities · ${some} ${some === 1 ? 'is' : 'are'} only on some channels`
  if (chs.length === 1) return `${n} · on ${NAME(chs[0])}`
  return some ? `${n} · ${some} ${some === 1 ? 'is' : 'are'} only on some channels` : `${n} · all on every channel`
}

/* ---------- Policies: cancellation per channel (live from Booking policies), booking requests per channel ---------- */
const instantOf = (custom: Partial<Record<ListingChannel, Record<string, string | null>>>, c: ListingChannel) => {
  const v = custom[c]?.['policy:instant']
  return KH_INSTANT.options.find((o) => o.id === (typeof v === 'string' ? v : KH_INSTANT.defaults[c]))?.label ?? ''
}
function PoliciesRead({ ctx }: { ctx: DocCtx }) {
  const custom = useStore((s) => s.sl3.custom)
  const cards = useAllCancellationCards()
  const line = (c: ListingChannel) => cards[c].map((x) => (x.kicker ? `${x.kicker} for long stays` : x.title)).join(' · ')
  // the line on the page is Direct's terms (or the first channel's when there is no booking site); the others hang off it
  const lead: ListingChannel = ctx.chs.includes('direct') ? 'direct' : ctx.chs[0] ?? 'airbnb'
  const others = ctx.chs.filter((c) => c !== lead)
  const nonRef = ctx.chs.includes('booking') ? cards.booking[0]?.meta?.split(': ')[1] : undefined
  const hover = (c: ListingChannel) => (
    <KhbChannelHover channel={c} label={NAME(c)} defaultOpen={ctx.hover === `cancellation:${c}`}
      base={{ value: cards[lead].map((x) => `${x.title}: ${x.body}`).join('\n'), note: `used by ${NAME(lead)}` }}
      own={{ value: cards[c].map((x) => `${x.kicker ? `${x.title} · ${x.kicker}` : x.title}: ${x.body}`).join('\n'), note: `${NAME(c)}’s own terms` }}
      onEdit={() => ctx.onEdit('policies')} />
  )
  return (
    <>
      <KhbFact id="policy:cancellation" label="Cancellation policy" value={line(lead)} wide
        caption={<KhbCaption>Used by {NAME(lead)}{others.map((c) => <Fragment key={c}><KhbDot /><span className="khb-cap__own">{hover(c)}<b>{line(c)}</b></span></Fragment>)}</KhbCaption>} />
      <KhbGrid>
        <KhbFact id="policy:instant" label="Booking requests" value={<span className="khb-lines">{ctx.chs.map((c) => <span key={c}>{NAME(c)} · {instantOf(custom, c)}</span>)}</span>}
          caption={ctx.chs.length > 1 ? <KhbCaption>Each channel has its own setting</KhbCaption> : undefined} />
        {nonRef && <KhbFact id="policy:nonref" label="Non-refundable rate" value={nonRef} caption={ctx.chs.length > 1 ? <KhbCaption>Booking.com only</KhbCaption> : undefined} />}
      </KhbGrid>
    </>
  )
}

/* ================= edit mode: the section as a stacked form ================= */
function EditSection({ sec, facts, ctx }: { sec: BSection; facts: BFact[]; ctx: DocCtx }) {
  const intent = ctx.intent
  const d = useHubDraft(`b-edit-${sec.id}`, intent?.key && !intent.toBase ? intent.key : null)
  // "Use the Base on Airbnb" from the hover card: the change waits in the form for Save
  useEffect(() => {
    const f = intent?.key ? facts.find((x) => x.id === intent.key) : undefined
    if (f && intent?.c && intent.toBase) { const o = scopeOf(f.item, d).own.find((x) => x.c === intent.c); if (o) d.setCustom(o.c, f.id, backToBase(o)) }
    const t = setTimeout(() => {
      const el = intent?.key ? document.querySelector<HTMLElement>(`[data-kh-key="${intent.key}"]`) : null
      const target = (intent?.c && el?.querySelector<HTMLElement>(`[data-khb-ch="${intent.c}"] textarea, [data-khb-ch="${intent.c}"] input, [data-khb-ch="${intent.c}"] button`)) || el?.querySelector<HTMLElement>('textarea, input, button')
      target?.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const reach = () => {
    const r = new Set<ListingChannel>()
    for (const k of Object.keys(d.baseEdits)) { const f = facts.find((x) => x.id === k); if (f) scopeOf(f.item, d).uses.forEach((c) => r.add(c)) }
    for (const e of d.customEdits) r.add(e.c)
    return ctx.chs.filter((c) => r.has(c))
  }
  const save = () => { const chs = reach(); d.commit(); ctx.onCloseEdit({ section: sec.id, channels: chs }) }
  const cancel = () => { d.discard(); ctx.onCloseEdit() }
  const action = (
    <div className="khb-sec__buttons">
      <Button onClick={cancel}>{d.dirty ? 'Discard changes' : 'Cancel'}</Button>
      <Button kind="primary" disabled={!d.dirty} onClick={save}>Save</Button>
    </div>
  )
  let body: ReactNode
  if (sec.id === 'amenities') body = <AmenitiesEdit d={d} />
  else if (sec.id === 'policies') body = <PoliciesEdit d={d} base={ctx.base} />
  else {
    const groups = B_GROUPS[sec.id]
    const rows = (fs: BFact[]) => fs.map((f) => <EditRow key={f.id} f={f} d={d} chs={ctx.chs} />)
    body = groups ? groups.map((g) => { const fs = facts.filter((f) => f.group === g.id); return fs.length ? <KhbGroup key={g.id} title={g.title}>{rows(fs)}</KhbGroup> : null })
      .concat(facts.some((f) => !f.group) ? [<div key="rest">{rows(facts.filter((f) => !f.group))}</div>] : [])
      : rows(facts)
  }
  return (
    <KhbSection id={sec.id} title={sec.label} desc={sec.id === 'amenities' ? (ctx.chs.length > 1 ? 'Tick the channels that list each amenity.' : `Tick the amenities ${NAME(ctx.chs[0] ?? 'airbnb')} lists.`) : sectionDesc(sec, ctx.chs)} action={action} editing>
      {body}
      {/* phones: the pair moves to the sticky bar above the tab bar; the inline one hides (kh-b.css) */}
      <MobileActionBar>
        <Button onClick={cancel}>{d.dirty ? 'Discard' : 'Cancel'}</Button>
        <Button kind="primary" disabled={!d.dirty} onClick={save}>Save</Button>
      </MobileActionBar>
    </KhbSection>
  )
}

function plainScope(f: BFact, s: Scope, chs: ListingChannel[]): string {
  if (f.section === 'custom' || f.id.startsWith('kh.b.')) return 'Only your AI replies use this'
  if (s.only) return `${NAME(s.only)} only`
  const parts: string[] = []
  if (s.uses.length) parts.push(usedByText(s.uses, chs))
  else if (s.on.length) parts.push('No channel uses the Base')
  if (s.own.length) parts.push(`Custom for ${names(s.own.map((o) => o.c))}`)
  if (s.set.length) parts.push(`${names(s.set.map((x) => x.c))} sets its own`)
  return parts.join(' · ')
}
function EditRow({ f, d, chs }: { f: BFact; d: HubDraft; chs: ListingChannel[] }) {
  const s = scopeOf(f.item, d)
  const editable = s.own.filter((o) => o.orig === 'override' || o.orig === 'inherit')
  const split = s.perChannel && (d.isSplit(f.id) || editable.length > 0)
  const label = f.id === 'checkin' ? 'Check-in from' : f.item.label
  let action: ReactNode
  if (s.perChannel) action = split
    ? <button type="button" className="h-field-hint__action" onClick={() => { editable.forEach((o) => d.setCustom(o.c, f.id, backToBase(o))); d.setSplit(f.id, false) }}>Use the Base everywhere</button>
    : <button type="button" className="h-field-hint__action" onClick={() => d.setSplit(f.id, true)}>Edit per channel</button>
  let control: ReactNode
  if (s.only) {
    const o = s.own[0]
    control = <div data-khb-ch={o?.c}><Control f={f} value={o?.value ?? ''} write={(v) => d.setCustom(o.c, f.id, v)} /></div>
  } else if (split) {
    control = (
      <KhSplit>
        <KhSplitRow base note={s.uses.length ? `Used by ${names(s.uses)}` : 'No channel uses it right now'}>
          <Control f={f} value={s.base} write={(v) => d.setBase(f.id, v, f.item.base)} />
        </KhSplitRow>
        {s.on.map((c) => {
          const o = s.own.find((x) => x.c === c)
          const st = s.set.find((x) => x.c === c)
          if (o) return (
            <KhSplitRow key={c} channel={c} action={<button type="button" className="h-textlink" onClick={() => d.setCustom(c, f.id, backToBase(o))}>Use the Base</button>}>
              <div data-khb-ch={c}><Control f={f} value={o.value} write={(v) => d.setCustom(c, f.id, v)} /></div>
            </KhSplitRow>
          )
          if (st) return <KhSplitRow key={c} channel={c} note={`${st.why} · ${display(f.item, st.value)}`} />
          return <KhSplitRow key={c} channel={c} note="Uses the Base" action={<button type="button" className="h-textlink" onClick={() => d.setCustom(c, f.id, s.base)}>Customize for {NAME(c)}</button>} />
        })}
      </KhSplit>
    )
  } else control = <Control f={f} value={s.base} write={(v) => d.setBase(f.id, v, f.item.base)} />
  return <KhField dataKey={f.id} label={label} help={f.item.help} caption={<><Icon name="info-circle" />{plainScope(f, s, chs)}</>} action={action}>{control}</KhField>
}

/** Hostaway's controls for a value: input, textarea, Dropdown, toggle, tags, map, checkout tasks, number with affix. */
function Control({ f, value, write }: { f: BFact; value: string; write: (v: string) => void }) {
  const it = f.item
  switch (it.kind) {
    case 'textarea':
      return <textarea className="h-textarea h-khtextarea" rows={Math.min(8, Math.max(3, Math.ceil(value.length / 72) + 1))} value={value} aria-label={it.label} onChange={(e) => write(e.target.value)} />
    case 'select': case 'time': case 'dropdown':
      return <Dropdown label={it.label} value={value} options={it.options ?? []} onChange={write} />
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className="ch-toggle-line"><Toggle checked={yes} label={it.label} onChange={(x) => write(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tags': return <Tags value={value} write={write} addLabel={it.key === 'languages' ? 'Add language' : 'Add tag'} />
    case 'map': return <MapBox label={value} />
    case 'tasks': return <KhTasks tasks={parseTasks(value)} catalog={[...CHECKOUT_PRESETS, 'Additional requests']} onChange={(t) => write(formatTasks(t))} />
    case 'money': case 'percent': case 'guests':
      return (
        // NumberField (ds/v3-ch.tsx), € before the value, the unit as a plain word, the shared small arrows
        <div className="h-khnum"><NumberField label={it.label} value={value} onChange={(v) => write(v.replace(/[^0-9.]/g, ''))}
          currency={it.kind === 'money' ? '€' : undefined} unit={it.kind === 'percent' ? '%' : it.kind === 'guests' ? 'guests' : undefined}
          decimals={it.kind === 'money' ? 2 : 0} max={it.kind === 'percent' ? 100 : 99999} /></div>
      )
    default:
      return <input className="h-input" type={it.kind === 'url' ? 'url' : undefined} value={value} aria-label={it.label} maxLength={it.limit} onChange={(e) => write(e.target.value)} />
  }
}
function Tags({ value, write, addLabel }: { value: string; write: (v: string) => void; addLabel: string }) {
  const [adding, setAdding] = useState(false)
  const [t, setT] = useState('')
  const tags = value.split(' · ').filter(Boolean)
  const add = () => { const v = t.trim(); if (v && !tags.includes(v)) write([...tags, v].join(' · ')); setT(''); setAdding(false) }
  return (
    <div className="h-khtags">
      <TagBox tags={tags} addLabel={addLabel} onAdd={() => setAdding(true)} onRemove={(x) => write(tags.filter((y) => y !== x).join(' · '))} />
      {adding && <input className="h-input" autoFocus value={t} placeholder={addLabel} aria-label={addLabel} onChange={(e) => setT(e.target.value)} onBlur={add} onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false) }} />}
    </div>
  )
}

/* ---------- Amenities in edit: tick where each amenity shows ---------- */
function AmenitiesEdit({ d }: { d: HubDraft }) {
  const custom = useStore((s) => s.sl3.custom)
  const pid = useHubPid()
  const chs = useListingChannels()
  const groups = useMemo(() => bAmenities(custom, pid), [custom, pid])
  const isOn = (a: BAmenity, c: ListingChannel) => { const v = d.cv(c, a.key); return v === 'on' ? true : v === 'off' ? false : a.orig.includes(c) }
  const setOn = (a: BAmenity, c: ListingChannel, on: boolean) => d.setCustom(c, a.key, on === a.orig.includes(c) ? undefined : on ? 'on' : 'off')
  return (
    <>
      <p className="khb-legend"><Icon name="info-circle" />Your AI replies know about every amenity that is on at least one channel.</p>
      {groups.map((g) => (
        <KhbGroup key={g.group} title={g.group}>
          <div className="khb-amedit">
            {g.items.map((a) => (
              <div key={a.name} className={cx('khb-amedit__row', !chs.some((c) => isOn(a, c)) && 'is-off')}>
                <span className="khb-amedit__name">{a.name}{a.note && <small>{a.note}</small>}</span>
                <span className="khb-amedit__checks">{chs.map((c) => <KhChannelCheck key={c} channel={c} on={isOn(a, c)} onChange={(v) => setOn(a, c, v)} />)}</span>
              </div>
            ))}
          </div>
        </KhbGroup>
      ))}
    </>
  )
}

/* ---------- Policies in edit: booking requests per channel; cancellation terms live on each channel ---------- */
function PoliciesEdit({ d, base }: { d: HubDraft; base: string }) {
  const store = useStore((s) => s.sl3.custom)
  const cards = useAllCancellationCards()
  const { options, defaults } = KH_INSTANT
  const chs = useListingChannels()
  return (
    <>
      <KhField dataKey="policy:instant" label="Booking requests" help="Accept every request, only low-risk guests, or review each one." caption={<><Icon name="info-circle" />{chs.length > 1 ? 'Each channel has its own setting' : `Set for ${NAME(chs[0] ?? 'airbnb')}`}</>}>
        <KhSplit>
          {chs.map((c) => {
            const cur = d.cv(c, 'policy:instant') ?? defaults[c]
            return (
              <KhSplitRow key={c} channel={c}>
                <Dropdown label={`Booking requests on ${NAME(c)}`} value={options.find((o) => o.id === cur)?.label} options={options.map((o) => o.label)}
                  onChange={(label) => { const id = options.find((o) => o.label === label)!.id; const saved = store[c]?.['policy:instant']; d.setCustom(c, 'policy:instant', id === defaults[c] ? (saved === undefined ? undefined : null) : id) }} />
              </KhSplitRow>
            )
          })}
        </KhSplit>
      </KhField>
      <KhbGroup title="Cancellation policy">
        <p className="khb-legend"><Icon name="info-circle" />{chs.length > 1 ? 'Each channel has its own terms. Change them in that channel’s Booking policies.' : `Change them in ${NAME(chs[0] ?? 'airbnb')}’s Booking policies.`}</p>
        <div className="khb-chlines">
          {chs.map((c) => (
            <KhChannelLine key={c} channel={c} action={<Link className="h-textlink" to={`${base}/ch/${c}/policies`}>Open in {NAME(c)} policies</Link>}>
              {cards[c].map((card) => <PolicyCard key={card.title} {...card} />)}
            </KhChannelLine>
          ))}
        </div>
      </KhbGroup>
    </>
  )
}
