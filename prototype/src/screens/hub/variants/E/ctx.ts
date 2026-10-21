/* KH-E · what every tab of the lens needs. */
import type { ListingChannel } from '../../../../data/sl3'
import type { KhSectionId } from '../../../../data/v3-kh'
import type { HubDraft } from '../../model'
import type { Lens } from './data'

export interface LensCtx {
  d: HubDraft
  tab: KhSectionId
  lens: Lens
  diff: boolean
  /** Demo URL state (?hover=<key>): that field's hover card starts open. */
  hover: string | null
  /** `/property/:id` */
  base: string
  setLens: (l: Lens, focusKey?: string) => void
  setDiff: (on: boolean) => void
  storeBase: Record<string, string>
  storeCustom: Partial<Record<ListingChannel, Record<string, string | null>>>
  /** The property's listing channels (Friedrichshain: Airbnb only), in airbnb → booking → direct order. */
  channels: ListingChannel[]
  /** Open "+ Add" › Custom fact in the Custom facts tab (the empty state's action). */
  addFact: () => void
}
