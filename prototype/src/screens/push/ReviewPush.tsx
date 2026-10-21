/* `/property/:id/push` · "Changes sent": the property's channel changes (V3-SPEC §3, reworked for Save = commit, QA A08).
 * - Sent: every change a channel editor sent when the host saved it (Listing, Pricing, Availability, Photos, Canvas,
 *   an accepted tip), one receipt per change: Sent → Live, or In review (Booking.com names and descriptions).
 * - Not sent yet: changes committed somewhere that doesn't send by itself, mainly Knowledge Hub edits to the Base,
 *   which reach every channel that uses the Base. Keep / Dismiss per channel, then Send. No drafts, no version names.
 * `?channel=<id>` filters to one channel. Demo: `?seed=tips` fills a realistic waiting list. data.
 * Multi-property (QA B01/B02): the active property's changes and connected channels only. */
import { useMemo, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ChangeReceipt, ChangeRow, Empty, Icon, KhKeep, KhPushBar, KhPushGroup, MobileActionBar, PageHead, PhotosFilter, SectionHead, cx, useIsMobile } from '../../ds'
import { isListingChannel, type ListingChannel } from '../../data/sl3'
import { useListingChannels } from '../../store/selectors'
import { paceFor } from '../../data/v3-kh'
import { PageBody, useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { ago, byChannel, channelList, clockTime, pendingChanges, receiptStatus, revert, sendReceipts, useDemoSeed, useNow, usePushUi, type PendingChange } from './changes'

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const CH: Record<ListingChannel, string> = { airbnb: 'Airbnb', booking: 'Booking.com', direct: 'Direct' }

export function ReviewPush() {
  useDemoSeed()
  const p = useProperty()
  return (
    <PageBody>
      <div className="ch-page">
        <PageHead title="Changes sent" property={p} />
        <Changes />
      </div>
    </PageBody>
  )
}

function Changes() {
  const p = useProperty()
  const [q, setQ] = useSearchParams()
  const channels = useListingChannels()
  const scope: ListingChannel | 'all' = isListingChannel(q.get('channel') ?? undefined) && channels.includes(q.get('channel') as ListingChannel) ? (q.get('channel') as ListingChannel) : 'all'
  const setScope = (s: ListingChannel | 'all') => setQ((prev) => { const n = new URLSearchParams(prev); if (s === 'all') n.delete('channel'); else n.set('channel', s); return n }, { replace: true })
  const sl3 = useStore((s) => s.sl3)
  const ui = usePushUi()
  const now = useNow()
  const mobile = useIsMobile()
  const nav = useNavigate()
  const inScope = <T extends { channel: ListingChannel }>(l: T[]) => (scope === 'all' ? l : l.filter((x) => x.channel === scope))
  const pending = inScope(useMemo(() => pendingChanges(sl3, ui.pushed, ui.sent), [sl3, ui.pushed, ui.sent]))
  const receipts = inScope(ui.receipts)
  const dec = (c: PendingChange) => ui.decisions[c.key] ?? 'keep'
  const kept = pending.filter((c) => dec(c) === 'keep')
  const dismissed = pending.length - kept.length
  const base = `/property/${p.id}`
  const first = channels[0] ?? 'airbnb'

  const send = () => {
    for (const c of pending.filter((x) => dec(x) === 'dismiss')) revert(c)
    sendReceipts(kept.map((c) => ({ channel: c.channel, field: c.field, section: c.section, what: c.what, origin: c.origin, from: c.from, to: c.to, raw: c.raw })))
    usePushUi.setState({ decisions: {} })
  }
  const sendLabel = `Send to ${channelList(kept.map((c) => c.channel))}`

  return (
    <div className="h-push ch-push ch-changes">
      <p className="h-push__lead">Saving a change in a channel’s Listing, Pricing, Availability or Photos sends it right away. This is everything that was sent, and what each channel has confirmed.</p>
      <PhotosFilter<ListingChannel | 'all'> value={scope} onChange={setScope}
        items={[{ id: 'all', label: 'All channels' }, ...channels.map((c) => ({ id: c as ListingChannel | 'all', label: CH[c] }))]} />

      {pending.length > 0 && (
        <section className="ch-changes__sec">
          <SectionHead title="Not sent yet" desc="Saved in Hostaway, not on the channels yet. Most come from the Knowledge Hub, where one edit to the Base reaches every channel that uses it. Send them, or dismiss one for a channel." />
          {byChannel(pending).map((g) => (
            <KhPushGroup key={g.channel} channel={g.channel} meta={plural(g.items.length, 'change')}
              right={<Link className="h-textlink" to={`${base}/ch/${g.channel}/listing`}>Open listing</Link>}
              note={paceFor(g.channel, g.items.map((i) => i.field))}>
              {g.items.map((c) => (
                <div key={c.key} className={cx('h-pushrow', dec(c) === 'dismiss' && 'is-dismissed')}>
                  <ChangeRow section={c.section} what={c.what} origin={c.origin} from={c.from} to={c.to}
                    action={<KhKeep value={dec(c)} onChange={(v) => ui.decide(c.key, v)} />} />
                </div>
              ))}
            </KhPushGroup>
          ))}
          {(() => {
            const note = dismissed > 0 ? `${plural(dismissed, 'dismissed change')} will go back to how ${dismissed === 1 ? 'it was' : 'they were'}.` : `${plural(kept.length, 'change')} ready to send.`
            const action = <Button kind="primary" icon={mobile ? undefined : 'send'} disabled={kept.length === 0} onClick={send}>{kept.length ? sendLabel : 'Send'}</Button>
            return mobile ? <><p className="ch-push__note">{note}</p><MobileActionBar>{action}</MobileActionBar></> : <KhPushBar text={note}>{action}</KhPushBar>
          })()}
        </section>
      )}

      <section className="ch-changes__sec">
        <SectionHead title="Sent" desc={receipts.length ? `${plural(receipts.length, 'change')}, newest first.` : undefined} />
        {receipts.length === 0 ? (
          <Empty title="Nothing sent yet" icon="send">
            <p>When you save a change in a channel’s Listing, Pricing or Availability, it goes to that channel right away and shows here.</p>
            <div className="h-push__next h-push__next--center">
              <Button onClick={() => nav(`${base}/ch/${scope === 'all' ? first : scope}/listing`)}>Open {CH[scope === 'all' ? first : scope]} listing</Button>
            </div>
          </Empty>
        ) : byChannel(receipts).map((g) => (
          <KhPushGroup key={g.channel} channel={g.channel} meta={summary(g.items.map((r) => receiptStatus(r, now)))}
            right={<Link className="h-textlink" to={`${base}/ch/${g.channel}`}>Channel overview</Link>}>
            <ReceiptList>{g.items.map((r) => (
              <ChangeReceipt key={r.id} what={r.what} section={r.section} origin={r.origin} from={r.from} to={r.to}
                status={receiptStatus(r, now)} note={r.note} time={ago(r.sentAt, now) === 'just now' ? 'Just now' : clockTime(r.sentAt)} />
            ))}</ReceiptList>
          </KhPushGroup>
        ))}
      </section>

      <div className="h-disclaimer"><Icon name="info-circle" />
        <span>Channels apply changes at their own pace, usually within minutes. {channels.includes('booking') ? 'Booking.com reviews names and descriptions (up to 48 h), and any' : 'Any'} channel may moderate a change again later.</span>
      </div>
    </div>
  )
}

const ReceiptList = ({ children }: { children: ReactNode }) => <div className="ch-rcpts">{children}</div>
/** "3 changes · 1 in review" / "2 changes · Live". */
function summary(states: string[]) {
  const review = states.filter((s) => s === 'review').length, sending = states.filter((s) => s === 'sent').length
  return `${plural(states.length, 'change')} · ${sending ? 'Sending' : review ? `${review} in review` : 'Live'}`
}
