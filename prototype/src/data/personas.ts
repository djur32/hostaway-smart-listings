/* Persona modes (R-130…R-135). S09 ships the switcher and the defaults table (D-126); S12 implements the differences.
 * Rule (S12 prompt): modes change DEFAULTS and GUIDANCE, never capability. */
import type { Autonomy, ChannelId, PersonaId } from './types'

export interface PersonaDefaults {
  id: PersonaId
  label: string
  short: string
  /** Copy autonomy per channel (D-126). Facts, money and rules are never AI-applied, for anyone. */
  copyAutonomy: Partial<Record<ChannelId, Autonomy>>
  voiceMode: boolean
  previewOn: boolean
  compsOpen: boolean
  needsYouMode: 'list' | 'one-by-one'
  /** Where this host lands (D-126). `:id` = the property. */
  landing: string
  hints: 'more' | 'fewer'
  smartListingsDefault: boolean
}

export const PERSONAS: Record<PersonaId, PersonaDefaults> = {
  P1: { id: 'P1', label: 'Family host', short: 'Family', copyAutonomy: { airbnb: 'suggest', booking: 'suggest' }, voiceMode: false, previewOn: false,
    compsOpen: false, needsYouMode: 'one-by-one', landing: '/property/:id/overview', hints: 'fewer', smartListingsDefault: false },
  P2: { id: 'P2', label: 'SEO optimizer', short: 'SEO', copyAutonomy: { airbnb: 'suggest', booking: 'suggest', vrbo: 'auto-review' }, voiceMode: true,
    previewOn: true, compsOpen: true, needsYouMode: 'list', landing: '/property/:id/listing/airbnb/stats', hints: 'fewer', smartListingsDefault: true }, // S12: P2 lands on Stats (D-150)
  P3: { id: 'P3', label: 'Portfolio manager', short: 'Portfolio', copyAutonomy: { airbnb: 'auto-review', booking: 'auto-review', vrbo: 'auto-review' },
    voiceMode: false, previewOn: false, compsOpen: false, needsYouMode: 'list', landing: '/', hints: 'fewer', smartListingsDefault: true },
  P4: { id: 'P4', label: 'New to PMS', short: 'New', copyAutonomy: { airbnb: 'suggest' }, voiceMode: false, previewOn: false, compsOpen: false,
    needsYouMode: 'one-by-one', landing: '/property/:id/overview', hints: 'more', smartListingsDefault: false },
}

/* ---------------- S12 · what each mode changes (D-150) ----------------
 * The table the Notion page and prototype/README print. Modes set DEFAULTS and GUIDANCE. Every host can reach every
 * capability; what differs is what is open, what is explained, and where you land. */
export interface ModeSpec {
  id: PersonaId
  /** How the host sees the preset in Settings (never "Family host": we don't label people). */
  preset: string
  autonomy: string
  voice: 'One text, adapted per channel' | 'Per-channel voice on'
  density: 'comfortable' | 'compact'
  open: string[]
  collapsed: string[]
  hints: 'more' | 'fewer' | 'none'
  vocabulary: string
  landing: string
  deeper: string[]
  signals: string
}

export const MODES: Record<PersonaId, ModeSpec> = {
  P1: { id: 'P1', preset: 'One home · Standard guidance', autonomy: 'Tips to review on every channel; money, facts and rules never change without asking',
    voice: 'One text, adapted per channel', density: 'comfortable',
    open: ['Property Overview', 'Knowledge Hub'], collapsed: ['Similar listings', 'Autopilot', 'Smart Listings › Performance'],
    hints: 'fewer', vocabulary: 'Channel names as they are (Airbnb, Booking.com). Consequences in one sentence, in euros',
    landing: 'Property › Overview', deeper: ['Channel listing editor', 'Smart Listings › Performance', 'Properties list'],
    signals: 'Sign-up “How many properties?” = 1–2, and a second channel connected' },
  P2: { id: 'P2', preset: 'Few homes · Expert detail', autonomy: 'Tips on Booking.com; Autopilot on Airbnb, inside your limits',
    voice: 'Per-channel voice on', density: 'comfortable',
    open: ['Channel listing editor', 'Tips panel', 'Canvas preview', 'Smart Listings › Performance'], collapsed: [],
    hints: 'none', vocabulary: 'Full: Page Score, conversion, switchback, confidence',
    landing: 'Channels › Airbnb', deeper: ['Properties list', 'Portfolio rules'],
    signals: '3–10 properties, ≥ 3 channels, edits copy weekly (behaviour → a suggestion to switch, never a silent switch)' },
  P3: { id: 'P3', preset: 'Portfolio · Standard guidance', autonomy: 'Autopilot with review, inside portfolio rules',
    voice: 'One text, adapted per channel', density: 'compact',
    open: ['Properties list', 'Bulk bar', 'Rules', 'Activity (owner log)', 'Needs you · all properties'], collapsed: ['Channel listing editor', 'Canvas preview'],
    hints: 'fewer', vocabulary: 'Operational: units, groups, batches, exceptions',
    landing: 'Properties', deeper: ['Any property’s Knowledge Hub', 'Channel listing editor', 'Smart Listings › Performance'],
    signals: 'Sign-up = 11–24 with a team, or 25+; or ≥ 10 listings imported' },
  P4: { id: 'P4', preset: 'One home · Guided', autonomy: 'Tips to review, fewer and safer; facts never AI-edited',
    voice: 'One text, adapted per channel', density: 'comfortable',
    open: ['Property Overview', 'Coach marks', '“Why Hostaway manages this”'], collapsed: ['Similar listings', 'Autopilot', 'Smart Listings › Performance'],
    hints: 'more', vocabulary: 'Plain: “booking site” for channel, “send” for push, every term explained once',
    landing: 'Property › Overview (with the welcome)', deeper: ['Channel listing editor', 'Smart Listings › Performance', 'Properties list'],
    signals: 'First channel connected < 30 days ago; previously managed directly on Airbnb (sign-up answer)' },
}
