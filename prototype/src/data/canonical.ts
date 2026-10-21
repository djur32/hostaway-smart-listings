/* The canonical field map, read at build time from ia/canonical-fields.csv (S06a, 100 rows), never copied.
 * If S06a/S03 update the CSV (e.g. channel-constraints §10 deltas), the prototype picks it up on the next build. */
import csv from '../../../ia/canonical-fields.csv?raw'
import { homeOf } from './ia'
import type { CanonicalField, ChannelId, ConflictPolicy, Reach, Visibility } from './types'

/** RFC-4180-ish parser: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((x) => x.trim() !== ''))
}

const REACH_KEYS: Record<string, ChannelId> = { ABNB: 'airbnb', BDC: 'booking', VRBO: 'vrbo', GVR: 'google', DIR: 'direct' }

function parseReach(s: string): Partial<Record<ChannelId, Reach>> {
  const out: Partial<Record<ChannelId, Reach>> = {}
  for (const part of s.split('·')) {
    const [k, v] = part.trim().split(/\s+/)
    const ch = REACH_KEYS[k]
    if (ch) out[ch] = (['Y', 'A', 'F', 'N'].includes(v) ? v : '-') as Reach
  }
  return out
}

function build(): CanonicalField[] {
  const [head, ...rows] = parseCsv(csv)
  const ix = (name: string) => head.indexOf(name)
  return rows.map((r) => {
    const g = (n: string) => r[ix(n)] ?? ''
    const [section, tab] = homeOf(g('canonical_id'), g('group'))
    return {
      id: g('canonical_id'),
      label: g('host_label'),
      group: g('group'),
      scope: g('scope') as CanonicalField['scope'],
      type: g('type'),
      unit: g('unit'),
      visibility: g('visibility') as Visibility,
      names: { airbnb: g('airbnb'), booking: g('booking_com'), vrbo: g('vrbo'), google: g('google_vr'), direct: g('direct') },
      overrideAllowed: g('override_allowed'),
      reach: parseReach(g('writable_to_channel')),
      conflictPolicy: g('conflict_policy') as ConflictPolicy,
      importPriority: g('import_source_priority'),
      notes: g('notes'),
      section,
      tab,
    }
  })
}

export const CANONICAL: CanonicalField[] = build()
export const FIELD: Record<string, CanonicalField> = Object.fromEntries(CANONICAL.map((f) => [f.id, f]))

/** Fields shown in a section/tab, in CSV order. */
export const fieldsIn = (section: string, tab?: string) =>
  CANONICAL.filter((f) => f.section === section && (!tab || f.tab === tab))

/** Needs-you classifier seed (DIRECTION.md "S10 must settle" #1, OQ-125): which policies interrupt the host. */
export const interruptsHost = (p: ConflictPolicy) => p === 'must agree' || p === 'unify by default'
