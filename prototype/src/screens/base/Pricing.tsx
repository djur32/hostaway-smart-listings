/* Property › Shared › Listing base › Pricing (review, 1 Oct: "Under Listing base you will have the details, then
 * pricing and availability, the same way that we have it on the channels"). A flat tabbed page — Listing's own frame
 * (one sticky `.ch-editor__head`: PageHead + the `.ch-tabrow` inside it, then the tab's fields scrolling below,
 * exactly ListingEditor.tsx's Classic composition) —
 * NOT the Calendar's "tap a night" PanelStack drill-down (screens/global/Calendar.tsx keeps that, unchanged, for its
 * own "which night" context; it's the right interaction there and the wrong one here, per review's real-product
 * screenshots, concepts/smart-listing/refs/base-pricing/README.md).
 * Real tabs, in order: Base price · Occupancy based · Fees · Security deposits · Direct Discounts · Taxes.
 * Field-level logic (Base/Customize-for-{channel}, the Amount input, Discard/Save-as-one-draft) is PricingPanels.tsx's
 * (built for Calendar, reused here via the shared usePriceEditor/BaseRow/RowsPanel/DepositPanel/Amount/Desc — no
 * pricing logic is re-derived). Saving is unchanged: it commits to the store (sl3Base / sl3Custom) and sends one
 * receipt per channel that changed (commitAndSend, inside usePriceEditor). Owner: this session. */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AiPromoCard, Button, PageHead, PanelStack, QueryTabs, SectionHead, SettingRow, TruthTitle, UnsavedBar,
  useUnsavedChanges, type StackPanel,
} from '../../ds'
import { useProperty } from '../../shell/PropertyLayout'
import { useStore } from '../../store/store'
import { buildRows } from '../portfolio/rows'
import {
  Amount, BaseRow, DepositPanel, Desc, DynamicPanel, RowsPanel, usePriceEditor, type Editor, type Night,
} from '../pricing/PricingPanels'

// Dynamic Pricing's side panel (DynamicPanel, PricingPanels.tsx) needs a night to anchor its "This night" breakdown
// to; this page has no calendar context (it's property-wide, flat tabs — not Calendar's "tap a night" drill-down),
// so it anchors to today, same as ChannelPricing.tsx's own Dynamic Pricing entry point (screens/channel/ChannelPricing.tsx).
const TODAY: Night = { i: 0, date: new Date(), daysAhead: 0 }

type BaseTab = 'base' | 'occupancy' | 'fees' | 'deposit' | 'discounts' | 'taxes'
const BASE_TABS: Array<{ id: BaseTab; label: string }> = [
  { id: 'base', label: 'Base price' },
  { id: 'occupancy', label: 'Occupancy based' },
  { id: 'fees', label: 'Fees' },
  { id: 'deposit', label: 'Security deposits' },
  { id: 'discounts', label: 'Direct Discounts' }, // the real label (not the shared TITLE.discounts = "Discounts")
  { id: 'taxes', label: 'Taxes' },
]
/** One heading + one line per tab, as on a channel's Pricing (review, 3 Oct: "use the channels template for
 *  everything") — the long product paragraphs the tabs carried before are hidden on this page (.ch-page--base-pricing). */
const BASE_DESC: Record<BaseTab, string> = {
  base: 'The default nightly rate for open dates that don’t have a price set by hand or by Dynamic Pricing.',
  occupancy: 'Set prices based on how many guests are staying. You can charge for extra guests beyond your included count and define a maximum occupancy.',
  fees: 'One-time charges that apply per stay.',
  deposit: 'Set up a deposit to protect your property from guest damage.',
  discounts: 'Offer lower prices for longer stays.',
  taxes: 'Taxes added to your bookings.',
}

export function BasePricing() {
  const p = useProperty()
  const [params] = useSearchParams()
  const tab = (BASE_TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'base') as BaseTab
  const q = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) { if (v === null) n.delete(k); else n.set(k, v) }
    const s = n.toString()
    return s ? `?${s}` : ''
  }
  // Each tab is its own Discard/Save draft (usePriceEditor keys it by `tab`, same as a Calendar section): switching
  // tabs with unsaved edits drops them, same convention Calendar/ChannelPricing already use per section.
  const { ed, dirty, save, discard } = usePriceEditor({ pid: p.id, section: tab })
  useUnsavedChanges({ dirty, onDiscard: discard, onSave: save })

  // Dynamic Pricing (review, 1 Oct: "it opens up in the side view, just the same way that a tip opens in the side
  // view of the listing"): a single-level PanelStack — the same slide-in-beside-the-content container Calendar's
  // night drill-down and ChannelPricing's own Dynamic Pricing card already use (ds/panels.tsx), but opened directly
  // with one panel instead of going through usePricingPanels' night/section/field stack, which this flat tabbed page
  // was deliberately rebuilt out of. PanelStack wires itself into the single shared side-panel slot
  // (useExclusivePanel('pstack', …), ds/panelSlot.ts), so opening it force-closes Tips (or any other panel) and
  // vice versa — no extra wiring needed here. DynamicPanel is read-only (no Discard/Save of its own, OpenInPricing
  // instead), so it reuses this tab's own `ed`/pv rather than a second draft.
  const [dynOpen, setDynOpen] = useState(false)
  const s = useStore()
  const row = buildRows(s).find((r) => r.p.id === p.id)
  const panels: StackPanel[] = dynOpen && row
    ? [{ id: 'dynamic', title: 'Dynamic Pricing', content: <DynamicPanel ed={ed} row={row} night={TODAY} /> }]
    : []

  return (
    <div className="ch-editor">
      {/* The WHOLE head sticks as one unit — title, property switcher and the tab row below it — exactly as the
       * channel editor composes it (screens/channel/ListingEditor.tsx Classic, ds/v3/ch.css .ch-editor__head).
       * The tab row must be INSIDE .ch-editor__head: as a sibling it stuck on its own at the same top/z-index and
       * painted over the title + property switcher, and it also missed the head's --content-padding-x gutter, so it
       * sat 40px left of the fields it labels (verification audit, 1 Oct). */}
      <div className="ch-editor__head">
        <div className="ch-page"><PageHead title={<TruthTitle>Pricing</TruthTitle>} property={p} /></div>
        <div className="ch-tabrow">
          <QueryTabs active={tab} items={BASE_TABS.map((t) => ({ id: t.id, label: t.label, to: q({ tab: t.id }) }))} />
        </div>
      </div>
      <PanelStack
        label="Pricing details" rootTitle="Pricing"
        panels={panels}
        onBack={() => setDynOpen(false)}
        onClose={() => setDynOpen(false)}
        main={
          <div className="ch-page ch-page--base-pricing">
            {tab !== 'taxes' && <SectionHead title={tab === 'deposit' ? 'Security deposit' : BASE_TABS.find((t) => t.id === tab)!.label} desc={BASE_DESC[tab]} />}
            {tab === 'deposit' && (
              <p className="ch-learn">Learn more:{['Security deposit overview', 'What guests see', 'Submitting charge request'].map((t) => <a key={t} href="#" onClick={(e) => e.preventDefault()}>{t}</a>)}</p>
            )}
            {tab === 'base' && <BaseTabContent ed={ed} onOpenDynamic={() => setDynOpen(true)} />}
            {tab === 'occupancy' && (
              <RowsPanel ed={ed} tab="occupancy" baseOnly desc="Set prices based on how many guests are staying. You can charge for extra guests beyond your included count and define a maximum occupancy." />
            )}
            {tab === 'fees' && <FeesTab ed={ed} />}
            {tab === 'deposit' && <DepositPanel ed={ed} />}
            {tab === 'discounts' && <DiscountsTab ed={ed} />}
            {tab === 'taxes' && <TaxesTab />}
            {/* ds/unsaved.tsx, 1 Oct evening: sticky to .ch-editor's scroll area, scoped to this .ch-page's width */}
            <UnsavedBar />
          </div>
        }
      />
    </div>
  )
}

/** Base price: Nightly/weekend rate carry no "N channels" caption at all (real screenshots) — SettingRow's
 *  `hint={false}` drops the whole caption row. Then the Dynamic Pricing card — clickable, opens DynamicPanel in the
 *  page's PanelStack (review, 1 Oct: "it opens up in the side view"). Listing markups are each channel's own value,
 *  so they aren't on the Base (review, 3 Oct): each channel's Pricing › Base price has its markup row. */
function BaseTabContent({ ed, onOpenDynamic }: { ed: Editor; onOpenDynamic: () => void }) {
  const { pv } = ed
  return (
    <>
      <Desc>The default nightly rate we’ll apply to open calendar dates that don’t already have a price set manually or through dynamic pricing. Updating the nightly rate will overwrite the price on Airbnb and stop pulling prices from Airbnb moving forward.</Desc>
      {(['nightly', 'weekend'] as const).map((k) => {
        const r = pv.row('base', k)!
        return (
          <SettingRow key={k} label={r.label} help={r.help} state="listing" hint={false}>
            <Amount r={r} label={r.label} value={pv.baseStr('base', k)} onChange={(v) => ed.setBase(`price:${k}`, v)} />
          </SettingRow>
        )
      })}
      <AiPromoCard title="Dynamic Pricing" body="Included with Host, Pro and Mogul plans. Smarter pricing that adapts to market demand, inside your guardrails." onClick={onOpenDynamic} />
    </>
  )
}

/** Fees: Cleaning, Linens, Resort and Management fee as Base-only rows (BaseRow baseOnly: the Base input and the
 *  informational "ⓘ N channels" caption, N = the channels that use the Base). review, 3 Oct: the Base shows only
 *  shared values, nothing about how a channel differs — so Airbnb's short-term cleaning fee (Airbnb only) isn't here;
 *  it lives on Channels › Airbnb › Pricing › Fees. Linens/Resort/Management: €0 defaults (data/v3-ch.ts
 *  PRICES.fees). Pet fee isn't in the real screenshots for this tab, so it's left out. */
function FeesTab({ ed }: { ed: Editor }) {
  const { pv } = ed
  const row = (key: string) => pv.row('fees', key)!
  return (
    <>
      <Desc>Add one-time charges that apply per stay, like cleaning, resort or pet fees. These are added on top of your nightly rate.</Desc>
      <BaseRow ed={ed} tab="fees" r={row('cleaning')} per="per stay" baseOnly />
      <BaseRow ed={ed} tab="fees" r={row('linens')} baseOnly />
      <BaseRow ed={ed} tab="fees" r={row('resort')} baseOnly />
      <BaseRow ed={ed} tab="fees" r={row('management')} baseOnly />
      <BaseRow ed={ed} tab="fees" r={row('community')} baseOnly />
      <BaseRow ed={ed} tab="fees" r={row('pet')} baseOnly />
    </>
  )
}

/** Direct Discounts (review, 3 Oct): Weekly and Monthly, each a Base value with its "N channels" note (Airbnb and Direct
 *  use it); Booking.com sets its own on its page, and nothing about it (Genius, marks) is shown here. */
function DiscountsTab({ ed }: { ed: Editor }) {
  const { pv } = ed
  return (
    <>
      {pv.rows.discounts.map((r) => <BaseRow key={r.key} ed={ed} tab="discounts" r={r} baseOnly />)}
    </>
  )
}

/** Taxes: brand new, no shared Section/TITLE/usePricingPanels entry (Calendar's night drill-down has no tax concept
 *  and shouldn't gain one). No seeded tax data anywhere in the prototype, so this is always the empty state; "Add
 *  tax" is visually a normal top-right section action (SectionHead, same composition as a channel's Save actions)
 *  but inert — no tax-creation flow was asked for. */
function TaxesTab() {
  return (
    <>
      {/* "Add tax" is shown but opens nothing: the add-a-tax flow isn't built (review, 3 Oct: "don't include the flow") */}
      <SectionHead title="Taxes" desc="Manage the applicable taxes for your property." actions={<Button kind="primary" onClick={() => {}}>Add tax</Button>} />
      <div className="h-pstack-box h-pstack-box--empty">No taxes configured for this property.</div>
    </>
  )
}
