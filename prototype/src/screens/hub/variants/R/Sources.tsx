/* Knowledge Hub iteration R · Sources (ref 03-intercom-fin-content-sources.png): what the AI reads, each with a status
 * and a ··· menu, plus a separate "Add a source" list. Reuses the real per-property sources already built for C
 * (`hub.sources`): Property details → "Listing details", Message history → "Past guest conversations" (scenario only;
 * other properties have none yet); Reviews is a stub row, "Not enabled", with no live data. The add options and the
 * ··· menu are UI only. "N sources" counts every row shown.
 * Rewired (review, 3 Oct): the page renders its own KhrFrame; both section titles sit OUTSIDE their tables
 * (`.h-khr2-sechead`); every row — source or add option — is the same KhrSourceItem shape: name, then one
 * "{desc} · {meta}" line, equal top/bottom padding, status and ··· centred; an add option is that row as a whole-row
 * button with a trailing "Add". */
import { useState } from 'react'
import { Button, DetailsDialog, IconButton, KhrFrame, KhrSourceAddItem, KhrSourceItem, Pill } from '../../../../ds'
import { useProperty } from '../../../../shell/PropertyLayout'
import { useR } from './model'

const ADD_SOURCES = [
  { id: 'guidebook', icon: 'book-2', name: 'Import a guidebook', desc: 'A URL or PDF your guests already use' },
  { id: 'upload', icon: 'cloud-upload', name: 'Upload a document', desc: 'House manual, appliance guides, building rules' },
  { id: 'snippet', icon: 'file-text', name: 'Write a snippet', desc: 'A short answer the AI should know, in your words' },
  { id: 'pms', icon: 'refresh', name: 'Sync a channel manager or PMS', desc: 'Keep property facts in step with your other tools' },
  { id: 'crm', icon: 'database', name: 'Sync a CRM', desc: 'HubSpot, Salesforce… for returning-guest context' },
] as const

export function Sources() {
  const p = useProperty()
  const r = useR()
  const [menu, setMenu] = useState<string | null>(null)
  const [stub, setStub] = useState<string | null>(null)
  const hasMessages = r.hub.sources.some((s) => s.id === 'messages')
  const count = r.hub.sources.length + (hasMessages ? 0 : 1) + 1 // + the stub rows below (messages-not-yet, Reviews)

  return (
    <KhrFrame title="Sources" property={p} desc="What the AI reads to answer your guests’ questions about this property, and where you could add more.">
      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">Sources</h2>
        <span className="h-khr2-sechead__aside">{count} sources</span>
      </div>
      <div className="h-khr2-table">
        {r.hub.sources.map((s) => (
          <KhrSourceItem key={s.id} icon={s.icon}
            name={s.id === 'details' ? 'Listing details' : s.id === 'messages' ? 'Past guest conversations' : s.name}
            desc={s.id === 'details' ? `${s.desc} · the source of truth` : s.desc} meta={s.when}
            action={<><Pill kind="recommended">Enabled</Pill><IconButton icon="dots" label={`More for ${s.name}`} onClick={() => setMenu(s.id)} /></>} />
        ))}
        {!hasMessages && (
          <KhrSourceItem icon="message-circle" name="Past guest conversations" desc="No conversations yet" meta="none, until guests message you"
            action={<Pill>Not enabled</Pill>} />
        )}
        <KhrSourceItem icon="thumb-up" name="Reviews" desc="What guests say after they stay" meta="not connected"
          action={<><Pill>Not enabled</Pill><IconButton icon="dots" label="More for Reviews" onClick={() => setStub('reviews')} /></>} />
      </div>

      <div className="h-khr2-sechead">
        <h2 className="h-khr2-sechead__title">Add a source</h2>
      </div>
      <div className="h-khr2-table">
        {ADD_SOURCES.map((c) => <KhrSourceAddItem key={c.id} icon={c.icon} name={c.name} desc={c.desc} onClick={() => setStub(c.id)} />)}
      </div>

      {menu && (
        <DetailsDialog open title="More" onClose={() => setMenu(null)} footer={<Button onClick={() => setMenu(null)}>Close</Button>}>
          <p className="h-khc-empty">Sync now · Disable · Remove. A UI preview for this prototype, not wired to real sync.</p>
        </DetailsDialog>
      )}
      {stub && (
        <DetailsDialog open title="Coming soon" onClose={() => setStub(null)} footer={<Button kind="primary" onClick={() => setStub(null)}>Close</Button>}>
          <p className="h-khc-empty">This is a UI preview only: adding content here doesn’t persist anything in the prototype.</p>
        </DetailsDialog>
      )}
    </KhrFrame>
  )
}
