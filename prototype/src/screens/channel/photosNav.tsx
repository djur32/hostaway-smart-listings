/* Photos navigation (Antonio, 1 Oct voice note → decided 3 Oct): how "Manage photos" opens from a channel's
 * Listing › Essentials. Three patterns were compared — A full-screen takeover, B drawer, C tab — and Antonio chose A,
 * laid out like the real Hospitable "Manage photos" screen, for every channel (Airbnb, Booking.com, Direct), with the
 * photos locked to the channel you came from (no All photos / per-channel switcher).
 * A is the default (no param). B and C stay reachable by URL only (`?photosNav=drawer|tab`) so the comparison can
 * still be demoed; the visible A/B/C switcher that used to sit under the Photos row is gone (exploration concluded).
 * `?photosOpen=1` (A/B only) is the "overlay is open" demo-URL state — the same convention this codebase already uses
 * for `?reorder=1`/`?tips=1`/`?smart=on`. Pattern C doesn't use it: it navigates to its own route instead
 * (screens/channel/ListingEditor.tsx handles tab === 'photos').
 * Shells (the full-screen takeover, the PanelStack drawer) live in ./PhotosShells.tsx, which imports PhotosManager
 * from ./Photos; this file imports neither, so Photos.tsx and PhotosShells.tsx can both depend on it with no cycle. */
import { useSearchParams } from 'react-router-dom'

export type PhotosNavPattern = 'full' | 'drawer' | 'tab'
export const PHOTOS_NAV_PARAM = 'photosNav'
export const PHOTOS_OPEN_PARAM = 'photosOpen'
/** Pattern A, Antonio's pick (3 Oct): the full-screen takeover, like the real product. */
const DEFAULT_PATTERN: PhotosNavPattern = 'full'

/** `pattern`: which of the three is live. `open`: the overlay (full/drawer) is open right now — meaningless for
 *  'tab', which is a real route instead of an overlay. */
export function usePhotosNav() {
  const [params, setParams] = useSearchParams()
  const raw = params.get(PHOTOS_NAV_PARAM)
  const pattern: PhotosNavPattern = raw === 'drawer' || raw === 'tab' ? raw : DEFAULT_PATTERN
  const open = params.get(PHOTOS_OPEN_PARAM) === '1'
  // the channel isn't carried in the URL: the overlay is locked to the Listing's own channel (ListingEditor passes it)
  const openPhotos = () => setParams((prev) => {
    const n = new URLSearchParams(prev); n.set(PHOTOS_OPEN_PARAM, '1'); return n
  }, { replace: true })
  const closePhotos = () => setParams((prev) => {
    const n = new URLSearchParams(prev)
    n.delete(PHOTOS_OPEN_PARAM); n.delete('channel'); n.delete('edit'); n.delete('reorder')
    return n
  }, { replace: true })
  return { pattern, open, openPhotos, closePhotos }
}
