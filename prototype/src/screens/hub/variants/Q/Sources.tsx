/* Knowledge Hub, reframed · Sources (KH-REFRAME §6): where the Hub learns from. The Listing base (read, never copied),
 * Inbox conversations (the questions guests ask and your replies), you (the answers you confirmed) and documents such as
 * a guidebook. The same rows as before (KhrSourceItem / KhrSourceAddItem); adding a source is a UI preview here. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, DetailsDialog, KhrSourceAddItem, KhrSourceItem, Pill } from '../../../../ds'
import { conversationsOf } from './data'
import { useKQ } from './model'
import { HubFrame } from './frame'

const ADD = [
  { id: 'guidebook', icon: 'book-2', name: 'Import a guidebook', desc: 'A link or PDF your guests already use' },
  { id: 'upload', icon: 'cloud-upload', name: 'Upload a document', desc: 'House manual, appliance guides, building rules' },
] as const

export function SourcesPage() {
  const kq = useKQ()
  const [stub, setStub] = useState(false)
  const base = `/property/${kq.pid}`
  const conv = conversationsOf(kq.chs)
  const conversations = kq.chs.reduce((s, c) => s + conv[c], 0)
  const confirmed = kq.hub.items.filter((i) => i.key.startsWith('kh.') && i.section === 'custom').length
  const guide = kq.hub.sources.find((s) => s.id === 'guide')
  return (
    <HubFrame kq={kq} title="Sources" tips={false} desc="Where the Knowledge Hub learns from: the Listing base it reads, the questions guests ask, the answers you confirm and your documents.">
      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">Sources</h2>
        <span className="h-khr2-sechead__aside">{guide ? 4 : 3} sources</span>
      </div>
      <div className="h-khr2-table">
        {/* the whole row is the link: no "Open" text, the row itself goes to the Listing base */}
        <Link to={`${base}/details`} className="h-khr2-src-link" aria-label="Listing base">
          <KhrSourceItem icon="file-text" name="Listing base" desc="Details, Pricing and Availability · read, never copied" meta="always current"
            action={<Pill kind="recommended">Connected</Pill>} />
        </Link>
        <KhrSourceItem icon="message-circle" name="Inbox conversations"
          desc={kq.scenario ? `${conversations} conversations, last 12 months · the questions guests ask and your replies` : 'No conversations yet'}
          meta={kq.scenario ? 'updated today' : 'until guests message you'}
          action={kq.scenario ? <Pill kind="recommended">Enabled</Pill> : <Pill>Waiting</Pill>} />
        <KhrSourceItem icon="user" name="You" desc={confirmed ? `${confirmed} answers you confirmed, for questions no Listing base field covers` : 'Answers you confirm from a question'}
          meta={confirmed ? 'last on 29 Sep' : undefined} action={<Pill kind="recommended">Enabled</Pill>} />
        {guide && <KhrSourceItem icon="book-2" name={guide.name} desc={guide.desc} meta={guide.when} action={<Pill kind="recommended">Enabled</Pill>} />}
      </div>

      <div className="h-khr2-sechead"><h2 className="h-khr2-sechead__title">Add a source</h2></div>
      <div className="h-khr2-table">
        {ADD.map((c) => <KhrSourceAddItem key={c.id} icon={c.icon} name={c.name} desc={c.desc} onClick={() => setStub(true)} />)}
      </div>

      {stub && (
        <DetailsDialog open title="Coming soon" onClose={() => setStub(false)} footer={<Button kind="primary" onClick={() => setStub(false)}>Close</Button>}>
          <p className="h-khc-empty">This is a UI preview only: adding a source here doesn’t save anything in the prototype.</p>
        </DetailsDialog>
      )}
    </HubFrame>
  )
}
