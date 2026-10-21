/* Strategy actions with their confirmations · WS-SL, 3 Oct. Used by Strategy (the channel rows) and the channel detail.
 * Pause and Remove each confirm in a dialog that says plainly what happens; Resume doesn't need one. (Putting back an
 * earlier strategy is gone with versions, edit or replace through the wizard instead.)
 * Every action can be undone from the confirmation line: undo restores the strategy slice as it was (plans, channels,
 * pauses, sharing, the internal save record, mixes), so nothing is lost. */
import { useState, type ReactNode } from 'react'
import { Button, OvDialog } from '../../ds'
import { chName, type ListingChannel } from '../../data/sl3'
import { useSlLocal } from '../../data/v3-sl'
import { useStore } from '../../store/store'
import { pauseStrategy, removeStrategy, sharedWith } from './shared'

const names = (cs: ListingChannel[]) => cs.length <= 1 ? cs.map(chName).join('') : `${cs.slice(0, -1).map(chName).join(', ')} and ${chName(cs[cs.length - 1])}`

function snapshot() {
  const s = useStore.getState().sl3
  const mix = useSlLocal.getState().mix
  return () => {
    useStore.setState((st) => ({ sl3: { ...st.sl3, plans: s.plans, channels: s.channels, paused: s.paused, groups: s.groups, versions: s.versions, setupDone: s.setupDone } }))
    useSlLocal.setState({ mix })
  }
}

export interface Flash { text: string; undo?: () => void }
type Ask = { kind: 'pause' | 'remove'; c: ListingChannel }

export function useStrategyActions(initial: Flash | null = null) {
  const [flash, setFlash] = useState<Flash | null>(initial)
  const [ask, setAsk] = useState<Ask | null>(null)
  const done = (text: string, undo: () => void) => setFlash({ text, undo: () => { undo(); setFlash(null) } })

  const resume = (c: ListingChannel) => {
    const undo = snapshot()
    pauseStrategy(c, false)
    done(`${chName(c)} strategy resumed.`, undo)
  }
  const confirm = () => {
    if (!ask) return
    const undo = snapshot()
    const { c } = ask
    if (ask.kind === 'pause') { pauseStrategy(c, true); done(`${chName(c)} strategy paused. Nothing else changed.`, undo) }
    if (ask.kind === 'remove') { removeStrategy(c); done(`${chName(c)} strategy removed.`, undo) }
    setAsk(null)
  }

  let dialog: ReactNode = null
  if (ask) {
    const sl3 = useStore.getState().sl3
    const others = sharedWith(sl3, ask.c)
    const name = chName(ask.c)
    const content: Record<Ask['kind'], { title: string; cta: string; lines: ReactNode[] }> = {
      pause: {
        title: `Pause the ${name} strategy?`, cta: 'Pause strategy',
        lines: [
          <>Autopilot stops and the strategy stops shaping new tips for {name}. Your listing stays as it is.</>,
          <>The strategy is kept exactly as it is. Resume it any time.</>,
          ...(others.length ? [<>{names(others)} {others.length > 1 ? 'keep' : 'keeps'} running it.</>] : []),
        ],
      },
      remove: {
        title: `Remove the ${name} strategy?`, cta: 'Remove strategy',
        lines: [
          <>Smart Listings stops working on {name}: no tips and no Autopilot. Your listing stays exactly as it is.</>,
          <>You can add a strategy to {name} again any time.</>,
          ...(others.length ? [<>{names(others)} {others.length > 1 ? 'keep' : 'keeps'} it.</>] : []),
        ],
      },
    }
    const d = content[ask.kind]
    dialog = (
      <OvDialog title={d.title} onClose={() => setAsk(null)}
        foot={<><Button onClick={() => setAsk(null)}>Cancel</Button><Button kind="primary" onClick={confirm}>{d.cta}</Button></>}>
        <div className="sl-dialog-lines">{d.lines.map((l, i) => <p key={i}>{l}</p>)}</div>
      </OvDialog>
    )
  }

  return {
    flash, setFlash, dialog, resume,
    askPause: (c: ListingChannel) => setAsk({ kind: 'pause', c }),
    askRemove: (c: ListingChannel) => setAsk({ kind: 'remove', c }),
  }
}
