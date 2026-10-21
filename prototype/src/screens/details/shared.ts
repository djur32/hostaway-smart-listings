/* Listing details · shared helpers: which channels a field reaches, the Base draft (Discard changes / Save) and the
 * quiet "Saved · sent to …" confirmation.
 *
 * How saving works (the Base layer). This screen edits the Base, the value every channel inherits. The channel editor's
 * draft (screens/channel/common.tsx useSectionDraft) is scoped to one channel, so this is the thin Base-only draft it
 * points to: edits stay local until Save; Save writes each edited field with the store's `sl3Base` and sends it through
 * the same commit path as the channel editors (screens/push/changes.ts commitAndSend), to every connected channel that
 * takes the Base for that field. commitAndSend diffs what each channel shows before and after, so a channel customised
 * away from the Base gets no receipt. A field that exists on one channel only (Guest checkout tasks: Airbnb) has no Base:
 * it saves that channel's value with `sl3Custom`. The receipts become the confirmation ("Saved · sent to Airbnb and
 * Booking.com"). */
import { useState } from 'react'
import { fieldOn, type FieldDef, type ListingChannel } from '../../data/sl3'
import { useStore } from '../../store/store'
import { viewOf } from '../channel/common'
import { commitAndSend, savedLabel, type Receipt } from '../push/changes'

/** The property's channels that have this field at all. */
export const fieldChannels = (def: FieldDef, chs: ListingChannel[]) => chs.filter((c) => fieldOn(def, c))
/** A field whose value lives on one channel only (state 'only' / 'channel' on every channel that has it). */
export function onlyChannel(def: FieldDef, chs: ListingChannel[]): ListingChannel | undefined {
  const on = fieldChannels(def, chs)
  return on.length > 0 && on.every((c) => def.state[c] === 'only' || def.state[c] === 'channel') ? on[0] : undefined
}
/** Channels that take the Base for this field (a channel that sets it itself, e.g. a locked city, doesn't). */
export const baseChannels = (def: FieldDef, chs: ListingChannel[]) =>
  chs.filter((c) => { const s = def.state[c]; return !!s && s !== 'set' && s !== 'only' && s !== 'channel' && s !== 'override' }) // a channel with its own value doesn't use the Base
/* ---------- the Base draft ---------- */
export interface BaseDraft {
  value: (def: FieldDef) => string
  set: (def: FieldDef, v: string) => void
  dirty: boolean
  /** Commits, sends, and returns the confirmation for SaveActions. */
  save: () => string
  discard: () => void
}
export function useBaseDraft(section: string, chs: ListingChannel[]): BaseDraft {
  const base = useStore((s) => s.sl3.base)
  const custom = useStore((s) => s.sl3.custom)
  const [d, setD] = useState<{ key: string; edits: Record<string, { def: FieldDef; v: string }> }>({ key: section, edits: {} })
  const edits = d.key === section ? d.edits : {}
  const stored = (def: FieldDef) => {
    const only = onlyChannel(def, chs)
    return only ? viewOf(def, only, custom[only], base).value : base[def.key] ?? def.base ?? ''
  }
  return {
    value: (def) => edits[def.key]?.v ?? stored(def),
    set: (def, v) => setD((prev) => {
      const e = { ...(prev.key === section ? prev.edits : {}) }
      if (v === stored(def)) delete e[def.key]; else e[def.key] = { def, v } // back to what is saved = not a change
      return { key: section, edits: e }
    }),
    dirty: Object.keys(edits).length > 0,
    save: () => {
      const sent: Receipt[] = []
      for (const { def, v } of Object.values(edits)) {
        const only = onlyChannel(def, chs)
        if (only) sent.push(...commitAndSend(() => useStore.getState().sl3Custom(only, def.key, v), [only], [def.key]))
        else sent.push(...commitAndSend(() => useStore.getState().sl3Base(def.key, v), baseChannels(def, chs), [def.key]))
      }
      setD({ key: section, edits: {} })
      return savedLabel(sent)
    },
    discard: () => setD({ key: section, edits: {} }),
  }
}

/** The quiet confirmation beside a section's actions, for saves that don't go through SaveActions (amenities).
 *  Same look as SaveActions' (h-saved, fades). */
export function useFlash() {
  const [flash, setFlash] = useState<{ at: number; text: string } | null>(null)
  return { flash, show: (text: string) => setFlash({ at: Date.now(), text }) }
}
