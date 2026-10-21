/* Persona variants of F-A1 (S10 §2, D-136). Modes change defaults and words, never capability (S12 rule).
 * P4 vocabulary: "booking site" for "channel" until S14 decides the glossary (ASSUMPTION, OQ-133). */
import { PERSONAS } from '../../data/personas'
import { useStore } from '../../store/store'

export function usePersona() {
  const id = useStore((s) => s.persona)
  return PERSONAS[id]
}

const P4_WORDS: Record<string, string> = { channel: 'booking site', channels: 'booking sites', sync: 'keep up to date', push: 'send' }

/** The word to use for this host (P4 gets plain words). */
export function plain(p: { id: string }, word: string) {
  return p.id === 'P4' ? P4_WORDS[word] ?? word : word
}
