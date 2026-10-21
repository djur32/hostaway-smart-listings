/* WS-KH · Knowledge Hub, KH2 "Sections list" (review, 30 Sep: "centralize all of the information in here", pricing and
 * availability included; "anything that is editable on a per-channel basis should be editable in here as well").
 * One place for everything about the property: a left list of sections, one section at a time, every field with its
 * Base value as a stacked row (label + help, control, caption). The caption says where the value goes (hover shows the
 * Base and each channel's own value); "Edit per channel" splits a field inline into one control per channel (HS-L03).
 * Hostaway's section save (Discard changes / Save); one confirmation when a channel keeps its own value.
 * URL states: /hub/:tab · ?q= · ?hover=<key> · ?split=<key> · ?confirm=<key> · ?resolve=1 · ?ask=1 · ?add=1 · ?seed=tips */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button, ChannelBadge, Dropdown, Icon, KhAmenity, KhChannelCheck, KhChannelLine, KhConfirmItem, KhDialog, KhField, KhFlag, KhFromTip, KhHelp,
  KhNav, KhScopeText, KhSheet, KhSplit, KhSplitRow, KhTasks, KhToast, MapBox, Note, NumberField, OptionTile, PageHead, PhotosRow, PolicyCard, SaveActions,
  SectionHead, TagBox, Tiles, Toggle, ValueHover, cx, formatTasks, parseTasks, type ScopeValue,
} from '../../ds'
import { CHANNELS } from '../../data/channels'
import type { ListingChannel } from '../../data/sl3'
import { KH_GROUPS, KH_INSTANT, KH_SECTIONS, isKhSection, type KhItem, type KhSectionId } from '../../data/v3-kh'
import { photoUrl } from '../../data/v3-cv'
import { channelPhotos } from '../../data/photos'
import { PageBody, useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { useDemoSeed } from '../push/changes'
import { backToBase, display, scopeOf, useHubDraft, type HubDraft, type Scope } from './model'
import { useHubUi } from './state'
import {
  hubAsk, hubCustom, hubDiscrepancies, hubFromTips, useHubAmenities, useHubItems, useHubPid, useIsScenario, useListingChannels,
} from './perProperty'
import { HubVariantPicker, useHubVariant } from './switch'
import { useAllCancellationCards } from './policyCards'
import { HubA } from './variants/A'
import { HubB } from './variants/B'
import { HubC } from './variants/C'
import { HubD } from './variants/D'
import { HubE } from './variants/E'
import { VariantR } from './variants/R'
import { VariantQ } from './variants/Q'

/** The route: the chosen iteration (?v=a…e, s), or iteration R with no `?v=` at all (review's converged direction,
 *  concepts/knowledge-hub/R-BRIEF.md "Routing"): `/hub` and `?v=r` render R directly, tab/sub and all — R owns its own
 *  topic routes (`/hub/:category`) and isn't translated through the old iterations' query-string states below.
 *  `/hub/:tab` deep links for the older iterations (Canvas locks, "Open in Knowledge Hub") name a shared section id;
 *  iterations A–E keep their place in the query string, so the path param is translated once into that iteration's own
 *  state and dropped (QA A01). `rooms` is Canvas's name for The property. */
export function Hub() {
  const v = useHubVariant() // called unconditionally (rules of hooks); only read by the old-iteration branch below
  const { tab, sub } = useParams()
  const [q] = useSearchParams()
  const p = useProperty()
  const vParam = q.get('v')
  // Knowledge Hub, reframed (KH-REFRAME, 4 Oct): Questions · Insights · Facts · Sources. `?v=r` keeps the 3 Oct iteration.
  if (!vParam || vParam === 'q') return <VariantQ tab={tab} sub={sub} />
  if (vParam === 'r') return <VariantR tab={tab} sub={sub} />
  if (tab) {
    const sec = tab === 'rooms' ? 'property' : tab
    if (v === 's') { if (sec !== tab) return <Navigate replace to={`/property/${p.id}/hub/${sec}?${q}`} /> }
    else {
      const n = new URLSearchParams(q)
      if (isKhSection(sec)) {
        if (v === 'a') n.set('tab', sec === 'availability' ? 'pricing' : sec === 'custom' ? 'facts' : sec)
        else if (v === 'b') n.set('section', sec)
        else if (v === 'c') { n.set('tab', 'az'); n.set('group', sec) }
        else if (v === 'd') n.set('sheet', sec)
        else n.set('tab', sec)
      }
      return <Navigate replace to={`/property/${p.id}/hub?${n}`} />
    }
  }
  return v === 'a' ? <HubA /> : v === 'b' ? <HubB /> : v === 'c' ? <HubC /> : v === 'd' ? <HubD /> : v === 'e' ? <HubE /> : <HubSections />
}

const NAME = (c: ListingChannel) => CHANNELS[c].name
const names = (cs: ListingChannel[]) => { const n = cs.map(NAME); return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }
const CHECKOUT_TASKS = ['Gather used towels', 'Throw rubbish away', 'Turn things off', 'Lock up', 'Return keys', 'Additional requests']
/** Sample new values for the `?confirm=` demo state (the scenario property's; others get "(edited)"). . */
const DEMO_EDIT: Record<string, string> = { house_rules: 'No parties or events. Quiet hours 22:00–7:00. No smoking inside or on the balcony. Shoes off inside, please.', neighbourhood: 'North Neukölln: Weserstraße’s cafés and bakeries on the doorstep, the Landwehr canal a short walk away and Tempelhofer Feld five minutes on foot.', 'price:cleaning': '28' }

export function HubSections() {
  useDemoSeed()
  const p = useProperty()
  const nav = useNavigate()
  const { tab } = useParams()
  const [q, setQ] = useSearchParams()
  const section: KhSectionId = isKhSection(tab) ? tab : 'property'
  const base = `/property/${p.id}`
  const param = (k: string, v?: string | null) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); setQ(n, { replace: true }) }

  const pid = useHubPid()
  const scenario = useIsScenario()
  const chs = useListingChannels()
  const items = useHubItems()
  const amenities = useHubAmenities()
  const sl3 = useStore((s) => s.sl3)
  const lib = useStore((s) => s.photoLib)
  const smartOn = useStore((s) => s.smartListings)
  const hub = useHubUi()
  const [search, setSearch] = useState(q.get('q') ?? '')
  const draft = useHubDraft(search ? 'search' : section, q.get('split'))
  const [confirm, setConfirm] = useState<Array<{ c: ListingChannel; k: string }> | null>(null)
  const [nonce, setNonce] = useState(0)
  const [toast, setToast] = useState<{ text: string; push?: boolean } | null>(null)
  const closeToast = useCallback(() => setToast(null), [])

  /* custom facts: yours, from tips (Push to knowledge base), added here */
  const facts = useMemo(() => [
    ...hubCustom(pid).map((f) => ({ ...f, tip: false })),
    ...Object.entries(hubFromTips(pid)).filter(([id]) => sl3.tips[id] === 'accepted' && sl3.kb[id]).map(([id, f]) => ({ id: `tip.${id}`, label: f.label, value: f.value, source: 'From a tip', tip: true })),
    ...hub.added.map((f) => ({ id: f.id, label: f.label, value: f.value, source: f.source, tip: false })),
  ], [pid, sl3.tips, sl3.kb, hub.added])
  const amenityCount = amenities.reduce((n, g) => n + g.items.length, 0)
  const count = (s: KhSectionId) => s === 'photos' ? lib.base.length : s === 'amenities' ? amenityCount : s === 'policies' ? 2 : s === 'custom' ? facts.length : items.filter((i) => i.section === s).length

  /* search across everything (ignores case and punctuation: "wifi" finds "Wifi name") */
  const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  const needle = norm(search)
  const hit = (...t: Array<string | undefined>) => norm(t.filter(Boolean).join(' ')).includes(needle)

  /* demo URL states */
  useEffect(() => {
    const k = q.get('confirm')
    const it = k ? items.find((i) => i.key === k) : undefined
    if (it) { draft.setBase(it.key, (scenario ? DEMO_EDIT[it.key] : undefined) ?? `${it.base} (edited)`, it.base); setTimeout(() => setConfirm([]), 0) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const k = q.get('hover')
    if (!k) return
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-kh-key="${k}"] .h-valhover__trigger`)
      el?.scrollIntoView({ block: 'center' })
      el?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    }, 400)
    return () => clearTimeout(t)
  }, [q, section])

  /* save: one confirmation when a changed Base value has a channel that keeps its own */
  const conflicts = Object.keys(draft.baseEdits).map((k) => items.find((i) => i.key === k)).filter((i): i is KhItem => !!i && scopeOf(i, draft).own.some((o) => o.orig === 'override' || o.orig === 'inherit'))
  const doSave = (toBase: Array<{ c: ListingChannel; k: string }>) => {
    const reach = new Set<ListingChannel>()
    for (const k of Object.keys(draft.baseEdits)) { const it = items.find((i) => i.key === k); if (it) scopeOf(it, draft).uses.forEach((c) => reach.add(c)) }
    for (const e of draft.customEdits) reach.add(e.c)
    for (const t of toBase) reach.add(t.c)
    const upd = chs.filter((c) => reach.has(c))
    draft.commit(toBase)
    setConfirm(null)
    setToast(upd.length ? { text: `Saved. ${names(upd)} ${upd.length === 1 ? 'updates' : 'update'} when you push.`, push: true } : { text: 'Saved. Your AI replies use it right away.' })
  }
  const onSave = () => { if (conflicts.length) setConfirm([]); else doSave([]) }

  const sec = KH_SECTIONS.find((s) => s.id === section)!
  const ctx: RowCtx = { d: draft, base, onHover: q.get('hover') }
  const found = needle ? items.filter((i) => hit(i.label, i.help, draft.base(i.key, i.base), ...Object.values(i.value ?? {}))) : []
  const foundFacts = needle ? facts.filter((f) => hit(f.label, f.value)) : []
  const nFound = found.length + foundFacts.length
  const discrepancies = hubDiscrepancies(pid).filter((x) => !hub.resolved[x.id])

  const body = needle ? (
    nFound === 0 ? <p className="h-khempty">Nothing matches “{search}”. Try another word, or add it as a custom fact.</p> : (
      <>
        {KH_SECTIONS.filter((s) => found.some((i) => i.section === s.id)).map((s) => (
          <div key={s.id}>
            <h3 className="ch-subhead h-khresult">{s.label}<button type="button" className="h-textlink" onClick={() => { setSearch(''); nav(`${base}/hub/${s.id}`) }}>Open section</button></h3>
            {found.filter((i) => i.section === s.id).map((i) => <ItemRow key={i.key} item={i} ctx={ctx} />)}
          </div>
        ))}
        {foundFacts.length > 0 && <div><h3 className="ch-subhead">Custom facts</h3>{foundFacts.map((f) => <FactRow key={f.id} f={f} d={draft} />)}</div>}
      </>
    )
  ) : section === 'photos' ? <PhotosSection base={base} chs={chs} />
    : section === 'amenities' ? <AmenitiesSection d={draft} chs={chs} />
    : section === 'policies' ? <PoliciesSection d={draft} base={base} chs={chs} />
    : section === 'custom' ? (
      <>
        {facts.map((f) => <FactRow key={f.id} f={f} d={draft} />)}
        {facts.length === 0 && <p className="h-khempty">No custom facts yet. Add what guests ask about that no listing field holds, like parking or where the bins are.</p>}
        <p className="h-khadd"><button type="button" className="h-textlink" onClick={() => param('add', '1')}><Icon name="plus" />Add a fact</button></p>
      </>
    ) : <ItemsSection section={section} items={items.filter((i) => i.section === section)} ctx={ctx} smartOn={smartOn} />

  return (
    <PageBody>
      <PageHead title="Knowledge Hub" property={p} right={<HubVariantPicker />} />
      <p className="h-khub__lead">Everything about this property, in one place. Each value is the Base: every channel uses it unless it has its own, and your AI replies read it too.</p>
      {discrepancies.length > 0 && (
        <div className="h-khub__flag">
          <KhFlag title={`${discrepancies.length} ${discrepancies.length === 1 ? 'thing differs' : 'things differ'} between channels`} sub="Airbnb and Booking.com had different values when you connected them. Pick one, and every channel uses it."
            action={<Button onClick={() => param('resolve', '1')}>Resolve</Button>} />
        </div>
      )}
      <div className={cx('h-khub', q.get('hover') && 'is-still')}>
        <aside className="h-khub__side">
          <label className="h-input-wrap h-khsearch"><Icon name="search" /><input className="h-input" type="search" placeholder="Search everything…" aria-label="Search the Knowledge Hub" value={search} onChange={(e) => { setSearch(e.target.value); param('q', e.target.value || null) }} /></label>
          <KhNav active={needle ? '' : section} onSelect={(id) => { setSearch(''); nav(`${base}/hub/${id}`) }} items={KH_SECTIONS.map((s) => ({ id: s.id, label: s.label, count: count(s.id) }))} />
          <button type="button" className="h-khask-link" onClick={() => param('ask', '1')}><Icon name="sparkles" />Ask the AI</button>
        </aside>
        <div className="h-khub__main">
          <SectionHead title={needle ? `Results for “${search}”` : sec.label}
            desc={needle ? `${nFound} ${nFound === 1 ? 'field' : 'fields'} across every section` : sec.desc}
            actions={section === 'photos' && !needle ? undefined : <SaveActions key={nonce} dirty={draft.dirty} onDiscard={draft.discard} onSave={onSave} />} />
          {body}
        </div>
      </div>

      {confirm && (
        <KhDialog title="Save to the Base?" onClose={() => { setConfirm(null); setNonce((n) => n + 1) }}
          foot={<><Button onClick={() => { setConfirm(null); setNonce((n) => n + 1) }}>Cancel</Button><Button kind="primary" onClick={() => doSave(confirm)}>Save</Button></>}>
          <p>Channels that use the Base update. A channel with its own value keeps it, unless you choose otherwise.</p>
          {conflicts.map((it) => {
            const s = scopeOf(it, draft)
            const from = display(it, useStore.getState().sl3.base[it.key] ?? it.base)
            return (
              <KhConfirmItem key={it.key} label={it.label} from={from} to={display(it, s.base)} updates={s.uses}
                own={s.own.filter((o) => o.orig === 'override' || o.orig === 'inherit').map((o) => {
                  const on = confirm.some((t) => t.c === o.c && t.k === it.key)
                  return { channel: o.c, toBase: on, onToggle: () => setConfirm(on ? confirm.filter((t) => !(t.c === o.c && t.k === it.key)) : [...confirm, { c: o.c, k: it.key }]) }
                })} />
            )
          })}
        </KhDialog>
      )}
      {q.get('resolve') && <ResolveSheet onClose={() => param('resolve', null)} onDone={(n) => { param('resolve', null); setToast({ text: `${n} ${n === 1 ? 'value now matches' : 'values now match'} on every channel.`, push: true }) }} />}
      {q.get('ask') && <AskSheet onClose={() => param('ask', null)} />}
      {q.get('add') && <AddFact onClose={() => param('add', null)} onAdded={() => { param('add', null); nav(`${base}/hub/custom`); setToast({ text: 'Added. Your AI replies use it right away.' }) }} />}
      {toast && <KhToast onDone={closeToast}>{toast.text}{toast.push && <Link className="h-toast__action" to={`${base}/push`}>Send to channels</Link>}</KhToast>}
    </PageBody>
  )
}

/* ---------------- a section of items, with its sub-groups ---------------- */
interface RowCtx { d: HubDraft; base: string; onHover: string | null }
function ItemsSection({ section, items, ctx, smartOn }: { section: KhSectionId; items: KhItem[]; ctx: RowCtx; smartOn: boolean }) {
  const groups = KH_GROUPS[section]
  const note = section === 'pricing' && smartOn ? <div className="h-khnote"><Note>Smart Listings can suggest prices per channel. Nothing changes until you accept.</Note></div> : null
  if (!groups) return <>{note}{items.map((i) => <ItemRow key={i.key} item={i} ctx={ctx} />)}</>
  return (
    <>
      {note}
      {groups.map((g) => {
        const rows = items.filter((i) => i.group === g.id)
        if (!rows.length) return null
        return (
          <div key={g.id}>
            <h3 className="ch-subhead">{g.title}</h3>{g.desc && <p className="ch-subdesc">{g.desc}</p>}
            {rows.map((i) => <ItemRow key={i.key} item={i} ctx={ctx} />)}
          </div>
        )
      })}
    </>
  )
}

/* ---------------- one field: Base control, caption, Edit per channel ---------------- */
function openOf(item: KhItem, s: Scope, base: string): { to: string; label: string } | undefined {
  if (!item.open) return undefined
  const c = s.own[0]?.c ?? s.only ?? s.on[0]
  if (!c) return undefined
  const { area, tab } = item.open
  const to = area === 'listing' ? `${base}/ch/${c}/listing/${tab ?? ''}` : area === 'pricing' ? `${base}/ch/${c}/pricing?tab=${tab ?? 'base'}` : area === 'availability' ? `${base}/ch/${c}/availability${tab ? `?tab=${tab}` : ''}` : `${base}/ch/${c}/policies?tab=${tab ?? 'booking'}`
  return { to, label: `Open in ${NAME(c)} ${area}` }
}
function hoverValues(item: KhItem, s: Scope): ScopeValue[] {
  if (s.only) return s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `Only ${NAME(o.c)} has this field` }))
  return [
    { who: 'base', value: display(item, s.base), used: s.uses.length > 0, note: s.uses.length ? `Used by ${names(s.uses)}` : s.on.length ? 'No channel uses it right now' : 'Only your AI replies use it' },
    ...s.own.map((o) => ({ who: o.c, value: display(item, o.value), used: true, note: `${NAME(o.c)}’s own value` })),
    ...s.set.map((x) => ({ who: x.c, value: display(item, x.value), used: true, note: x.why })),
  ]
}
function ItemRow({ item, ctx }: { item: KhItem; ctx: RowCtx }) {
  const { d, base } = ctx
  const s = scopeOf(item, d)
  const split = s.perChannel && d.isSplit(item.key)
  const caption = (
    <ValueHover title={item.label} values={hoverValues(item, s)}>
      <KhScopeText uses={s.uses} own={s.own.map((o) => o.c)} setBy={s.set.map((x) => x.c)} only={s.only} on={s.on} aiOnly={s.on.length === 0} />
    </ValueHover>
  )
  const open = openOf(item, s, base)
  let action: ReactNode = open ? <Link className="h-field-hint__action" to={open.to}>{open.label}</Link> : undefined
  if (s.perChannel) action = split
    ? <button type="button" className="h-field-hint__action" onClick={() => { s.own.filter((o) => o.orig === 'override' || o.orig === 'inherit').forEach((o) => d.setCustom(o.c, item.key, backToBase(o))); d.setSplit(item.key, false) }}>Set one value</button>
    : <button type="button" className="h-field-hint__action" onClick={() => d.setSplit(item.key, true)}>Edit per channel</button>
  const help = item.kind === 'url' ? <KhHelp text={item.help} /> : item.kind === 'tasks' ? <>{item.help} Airbnb shows them as Checkout instructions; Booking.com and Direct have no such field.</> : item.help

  let control: ReactNode
  if (s.only) {
    const o = s.own[0]
    control = <Control item={item} value={o?.value ?? ''} write={(v) => d.setCustom(o.c, item.key, v)} />
  } else if (split) {
    control = (
      <KhSplit>
        <KhSplitRow base note={s.uses.length ? `Used by ${names(s.uses)}` : 'No channel uses it right now'}>
          <Control item={item} value={s.base} write={(v) => d.setBase(item.key, v, item.base)} />
        </KhSplitRow>
        {s.on.map((c) => {
          const o = s.own.find((x) => x.c === c)
          const st = s.set.find((x) => x.c === c)
          if (o) return (
            <KhSplitRow key={c} channel={c} action={<button type="button" className="h-textlink" onClick={() => d.setCustom(c, item.key, backToBase(o))}>Use the Base</button>}>
              <Control item={item} value={o.value} write={(v) => d.setCustom(c, item.key, v)} />
            </KhSplitRow>
          )
          if (st) return <KhSplitRow key={c} channel={c} note={`${st.why} · ${display(item, st.value)}`} />
          return <KhSplitRow key={c} channel={c} note="Uses the Base" action={<button type="button" className="h-textlink" onClick={() => d.setCustom(c, item.key, s.base)}>Customize</button>} />
        })}
      </KhSplit>
    )
  } else {
    control = <Control item={item} value={s.base} write={(v) => d.setBase(item.key, v, item.base)} />
  }
  return <KhField dataKey={item.key} label={item.label} help={help} caption={caption} action={action}>{control}</KhField>
}

/* ---------------- the control for a value (Hostaway's inputs, Dropdown, toggle, tags, tasks) ---------------- */
function Control({ item, value, write }: { item: KhItem; value: string; write: (v: string) => void }) {
  switch (item.kind) {
    case 'textarea':
      return <textarea className="h-textarea h-khtextarea" rows={Math.min(8, Math.max(3, Math.ceil(value.length / 72) + 1))} value={value} aria-label={item.label} onChange={(e) => write(e.target.value)} />
    case 'select': case 'time': case 'dropdown':
      return <Dropdown label={item.label} value={value} options={item.options ?? []} onChange={write} />
    case 'toggle': {
      const yes = value === 'Yes'
      return <div className="ch-toggle-line"><Toggle checked={yes} label={item.label} onChange={(x) => write(x ? 'Yes' : 'No')} /><span>{yes ? 'Allowed' : 'Not allowed'}</span></div>
    }
    case 'tags': return <Tags value={value} write={write} addLabel={item.key === 'languages' ? 'Add language' : 'Add tag'} />
    case 'map': return <MapBox label={value} />
    case 'tasks': return <KhTasks tasks={parseTasks(value)} catalog={CHECKOUT_TASKS} onChange={(t) => write(formatTasks(t))} />
    case 'money': case 'percent': case 'guests':
      // NumberField (ds/v3-ch.tsx): the product-wide numeric control — the ▲/▼ spinner plus Up/Down (PageUp/PageDown ×10)
      // on the input (review, 1 Oct: "make sure that this is available in all of the items that are numbers"). Same
      // sanitising and the same write() as before, so the draft/Save path is unchanged; the unit sits at the end, as on
      // the channel Pricing screen the same values come from.
      return (
        <div className="h-khnum"><NumberField label={item.label} value={value} onChange={(v) => write(v.replace(/[^0-9.]/g, ''))}
          unit={item.kind === 'money' ? '€' : item.kind === 'percent' ? '%' : 'guests'} inputMode={item.kind === 'money' ? 'decimal' : 'numeric'}
          decimals={item.kind === 'money' ? 2 : 0} max={item.kind === 'percent' ? 100 : 99999} /></div>
      )
    default:
      return (
        <div className={cx(!!item.limit && 'ch-counter')}>
          <input className="h-input" type={item.kind === 'url' ? 'url' : undefined} value={value} aria-label={item.label} placeholder={item.kind === 'url' ? `Your ${item.label.toLowerCase()} URL` : undefined} onChange={(e) => write(e.target.value)} maxLength={item.limit} />
          {item.limit && <span className="ch-counter__n">{value.length}/{item.limit}</span>}
        </div>
      )
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

/* ---------------- Photos: the library (the real Photos row) + what each channel shows ---------------- */
function PhotosSection({ base, chs }: { base: string; chs: ListingChannel[] }) {
  const lib = useStore((s) => s.photoLib)
  const tips = useStore((s) => s.sl3.tips)
  const custom = useStore((s) => s.sl3.custom)
  const sl3 = useMemo(() => ({ tips, custom }), [tips, custom])
  return (
    <>
      <div className="h-field-row h-field-row--stacked">
        <PhotosRow label="Photo library" count={lib.base.length} desc="Add photos, captions and room tags once. Each channel picks from here." manageTo={`${base}/photos`}
          photos={lib.base.map((k) => ({ key: k, src: photoUrl(k), alt: lib.meta[k]?.description || 'Photo' }))} />
      </div>
      <h3 className="ch-subhead">Per channel</h3>
      <p className="ch-subdesc">Each channel shows its own selection and order, with its own cover.</p>
      <div className="h-khchlist">
        {chs.map((c) => {
          const { shown, hidden } = channelPhotos(c, lib, sl3)
          return (
            <KhChannelLine key={c} channel={c} action={<Link className="h-textlink" to={`${base}/ch/${c}/listing/essentials`}>Open in {NAME(c)} listing</Link>}>
              {shown.length} photos · Cover: {lib.meta[shown[0]]?.description ?? '—'}{hidden.length ? ` · ${hidden.length} hidden` : ''}
            </KhChannelLine>
          )
        })}
      </div>
    </>
  )
}

/* ---------------- Amenities: one list; a channel can leave one out or add its own ---------------- */
function AmenitiesSection({ d, chs }: { d: HubDraft; chs: ListingChannel[] }) {
  const hub = useHubUi()
  const amenities = useHubAmenities()
  return (
    <>
      {amenities.map((g) => (
        <div key={g.group}>
          <h3 className="ch-subhead">{g.group}</h3>
          <div className="h-khamenities">
            {g.items.map((i) => {
              const key = `amenity:${i.name}`
              const orig = (c: ListingChannel) => (i.name === 'Balcony' && hub.resolved['d-balcony'] ? hub.resolved['d-balcony'].startsWith('Yes') : i.on.includes(c))
              const isOn = (c: ListingChannel) => { const v = d.cv(c, key); return v === 'on' ? true : v === 'off' ? false : orig(c) }
              const setOn = (c: ListingChannel, on: boolean) => d.setCustom(c, key, on === i.on.includes(c) ? undefined : on ? 'on' : 'off')
              const onList = chs.filter(isOn)
              const off = chs.filter((c) => !isOn(c))
              const state = onList.length === chs.length ? 'all' : onList.length ? 'some' : 'none'
              const split = d.isSplit(key)
              const scope = <KhScopeText uses={onList} on={chs} text={state === 'all' ? (chs.length > 1 ? 'Used by all channels' : `Used by ${names(chs)}`) : state === 'none' ? 'Not included' : <>{`On ${names(onList)}`}<span className="h-khscope__dot">·</span>not on {off.map((c) => <ChannelBadge key={c} channel={c} size="sm" />)}</>} />
              return (
                <KhAmenity key={i.name} name={i.name} state={state} scope={scope} note={i.note && i.note !== 'Channels disagree' ? i.note : undefined}
                  onToggle={() => chs.forEach((c) => setOn(c, state !== 'all'))}
                  action={chs.length > 1 ? <button type="button" className="h-textlink" onClick={() => { if (split) chs.forEach((c) => setOn(c, state !== 'none')); d.setSplit(key, !split) }}>{split ? 'Set one value' : 'Edit per channel'}</button> : undefined}
                  split={split ? <div className="h-khamenity__split">{chs.map((c) => <KhChannelCheck key={c} channel={c} on={isOn(c)} onChange={(v) => setOn(c, v)} />)}</div> : undefined} />
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

/* ---------------- Booking policies: cancellation per channel (no Base), instant book per channel ---------------- */
function PoliciesSection({ d, base, chs }: { d: HubDraft; base: string; chs: ListingChannel[] }) {
  const store = useStore((s) => s.sl3.custom)
  const { options, defaults } = KH_INSTANT
  const cancel = useAllCancellationCards() // live from the Booking policies flow
  return (
    <>
      <h3 className="ch-subhead">Cancellation policy</h3>
      <p className="ch-subdesc">{chs.length > 1 ? 'Each channel has its own terms, so there is no Base here.' : `${names(chs)} sets its own terms, so there is no Base here.`}{chs.includes('direct') ? ' Your site follows the Base policy.' : ''}</p>
      <div className="h-khchlist">
        {chs.map((c) => (
          <KhChannelLine key={c} channel={c} action={<Link className="h-textlink" to={`${base}/ch/${c}/policies`}>Open in {NAME(c)} policies</Link>}>
            {cancel[c].map((card) => <PolicyCard key={card.title} {...card} />)}
          </KhChannelLine>
        ))}
      </div>
      <h3 className="ch-subhead">Instant book</h3>
      <p className="ch-subdesc">How booking requests are handled. {chs.length > 1 ? 'Each channel has its own setting.' : `Set on ${names(chs)}.`}</p>
      <KhField dataKey="policy:instant" label="Booking requests" help="Accept every request, only low-risk guests, or review each one."
        caption={<KhScopeText uses={[]} on={chs} text={chs.length > 1 ? 'Each channel has its own setting' : `Set on ${names(chs)}`} />}>
        <KhSplit>
          {chs.map((c) => {
            const cur = d.cv(c, 'policy:instant') ?? defaults[c]
            return (
              <KhSplitRow key={c} channel={c}>
                <Dropdown label={`Instant book on ${NAME(c)}`} value={options.find((o) => o.id === cur)?.label} options={options.map((o) => o.label)}
                  onChange={(label) => { const id = options.find((o) => o.label === label)!.id; const saved = store[c]?.['policy:instant']; d.setCustom(c, 'policy:instant', id === defaults[c] ? (saved === undefined ? undefined : null) : id) }} />
              </KhSplitRow>
            )
          })}
        </KhSplit>
      </KhField>
    </>
  )
}

/* ---------------- a custom fact (AI replies only) ---------------- */
function FactRow({ f, d }: { f: { id: string; label: string; value: string; source: string; tip: boolean }; d: HubDraft }) {
  const key = `kh.${f.id}`
  const v = d.base(key, f.value)
  return (
    <KhField dataKey={key} label={f.label} marker={f.tip ? <KhFromTip /> : undefined} caption={<KhScopeText uses={[]} on={[]} aiOnly />}>
      <textarea className="h-textarea h-khtextarea" rows={Math.min(6, Math.max(2, Math.ceil(v.length / 72) + 1))} value={v} aria-label={f.label} onChange={(e) => d.setBase(key, e.target.value, f.value)} />
    </KhField>
  )
}

/* ---------------- sheets and dialogs ---------------- */
function ResolveSheet({ onClose, onDone }: { onClose: () => void; onDone: (n: number) => void }) {
  const hub = useHubUi()
  const pid = useHubPid()
  const chs = useListingChannels()
  const [pick, setPick] = useState<Record<string, number>>({})
  const open = hubDiscrepancies(pid).filter((x) => !hub.resolved[x.id])
  const n = Object.keys(pick).length
  const apply = () => {
    const st = useStore.getState()
    for (const x of open) {
      const i = pick[x.id]
      if (i === undefined) continue
      const v = x.options[i].value
      hub.resolve(x.id, v)
      if (x.key.startsWith('amenity:')) {
        const yes = v.startsWith('Yes')
        for (const c of chs) st.sl3Custom(c, x.key, yes ? 'on' : 'off')
      } else st.sl3Base(x.key, v)
    }
    onDone(n)
  }
  return (
    <KhSheet title="Resolve what differs" sub={open.length ? `${open.length} ${open.length === 1 ? 'value' : 'values'} · pick the right one, and every channel uses it` : 'No differences between channels'} onClose={onClose}
      foot={<><span className="h-small h-muted h-khresolve__count">{n} of {open.length} picked</span><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={n === 0} onClick={apply}>Use for every channel</Button></>}>
      {open.length === 0 && <p className="h-khempty">No differences between channels. Every channel had the same values when you connected it.</p>}
      {open.map((x) => (
        <div key={x.id} className="h-khresolve">
          <p className="h-khresolve__q">{x.question}</p>
          <Tiles>{x.options.map((o, i) => <OptionTile key={o.value} title={o.value} line={`From ${NAME(o.channel)}`} channel={o.channel} on={pick[x.id] === i} onClick={() => setPick({ ...pick, [x.id]: i })} />)}</Tiles>
        </div>
      ))}
    </KhSheet>
  )
}
function AskSheet({ onClose }: { onClose: () => void }) {
  const [openI, setOpenI] = useState(0)
  const pid = useHubPid()
  const items = useHubItems()
  const sbase = useStore((s) => s.sl3.base)
  const scustom = useStore((s) => s.sl3.custom)
  const asks = useMemo(() => {
    const view = { base: (k: string, fb: string) => sbase[k] ?? fb, cv: (c: ListingChannel, k: string) => scustom[c]?.[k] } as unknown as HubDraft
    const byKey = new Map(items.map((i) => [i.key, i]))
    /** The value a guest who booked on `c` gets: the channel's own, the one it sets, or the Base ('' when it lacks the field). */
    const get = (key: string, c: ListingChannel) => {
      const it = byKey.get(key)
      if (!it) return ''
      const s = scopeOf(it, view)
      return s.own.find((o) => o.c === c)?.value ?? s.set.find((x) => x.c === c)?.value ?? (s.on.includes(c) ? s.base : '')
    }
    return hubAsk(pid, get, (k) => byKey.get(k)?.label ?? k)
  }, [pid, items, sbase, scustom])
  return (
    <KhSheet phone="sheet" title="Ask the AI" sub="How your AI replies to guests with what’s in the Knowledge Hub." onClose={onClose}>
      <div className="h-khask">
        {asks.map((a, i) => (
          <div key={a.q}>
            <button className="h-khask__q" aria-expanded={openI === i} onClick={() => setOpenI(openI === i ? -1 : i)}><Icon name="message-circle" size={16} />{a.q}<Icon name={openI === i ? 'chevron-up' : 'chevron-down'} size={16} /></button>
            {openI === i && <p className="h-khask__a">{a.a}{'note' in a && a.note && <small>{a.note}</small>}<small>Answered from: {a.items.join(' · ')}</small></p>}
          </div>
        ))}
      </div>
    </KhSheet>
  )
}
function AddFact({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const add = useHubUi((s) => s.add)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const ok = label.trim() && value.trim()
  return (
    <KhDialog title="Add a fact" onClose={onClose}
      foot={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!ok} onClick={() => { add({ id: `added-${Date.now()}`, label: label.trim(), value: value.trim(), source: 'Added by you · just now' }); onAdded() }}>Add fact</Button></>}>
      <div className="h-khform">
        <label>What it’s about<input className="h-input" placeholder="e.g. Late checkout" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        <label>The fact<textarea className="h-textarea" placeholder="e.g. Late checkout until 1 PM for €15, if the next guest allows." value={value} onChange={(e) => setValue(e.target.value)} /></label>
        <p className="h-small">Your AI replies use it right away. To show it to guests, add it to a listing field too.</p>
      </div>
    </KhDialog>
  )
}
