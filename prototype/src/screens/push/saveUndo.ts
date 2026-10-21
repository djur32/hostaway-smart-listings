/* The save toast's transaction (ds/unsaved.tsx `setSaveTransaction`, review 4 Oct: a toast on Save, with Undo).
 * Before a Save: snapshot the record (useStore) and the push log (usePushUi). After it: the receipts that Save sent
 * make the summary ("Listing title · sent to Airbnb and Booking.com", "3 changes · sent to Airbnb, Booking.com and
 * Direct"), and Undo puts back exactly the top-level slices that Save changed, receipts included (the same "withdraw
 * the receipt" model as a tip's Undo, changes.ts `unsend`). Imported once, for its side effect, by main.tsx. */
import { setSaveTransaction } from '../../ds/unsaved'
import { useStore } from '../../store/store'
import { channelList, usePushUi, type Receipt } from './changes'

type Slice = Record<string, unknown>
const changed = (a: Slice, b: Slice) => Object.keys(b).filter((k) => typeof b[k] !== 'function' && a[k] !== b[k])
const pick = (o: Slice, keys: string[]) => Object.fromEntries(keys.map((k) => [k, o[k]]))

setSaveTransaction({
  begin() {
    const store0 = useStore.getState() as unknown as Slice
    const push0 = usePushUi.getState() as unknown as Slice
    const had = new Set(usePushUi.getState().receipts.map((r) => r.id))
    return {
      end() {
        const storeKeys = changed(store0, useStore.getState() as unknown as Slice)
        const pushKeys = changed(push0, usePushUi.getState() as unknown as Slice)
        const sent: Receipt[] = usePushUi.getState().receipts.filter((r) => !had.has(r.id))
        const fields = [...new Map(sent.map((r) => [r.field, r.what])).values()]
        const what = fields.length === 1 ? fields[0] : `${fields.length} changes`
        return {
          summary: sent.length ? `${what} · sent to ${channelList(sent.map((r) => r.channel))}` : undefined,
          undo: storeKeys.length || pushKeys.length
            ? () => {
                if (storeKeys.length) useStore.setState(pick(store0, storeKeys))
                if (pushKeys.length) usePushUi.setState(pick(push0, pushKeys))
              }
            : undefined,
        }
      },
    }
  },
})
