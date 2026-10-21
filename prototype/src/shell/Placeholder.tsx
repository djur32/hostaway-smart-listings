/* A screen not built yet. `scr` / `owner` / `refs` say who owns it, what to build and where the spec is, so parallel
 * sessions don't collide. They stay in the code (data attributes), not in the visible copy (QA B09). */
import type { ReactNode } from 'react'
import { HostawayMark, PageHead } from '../ds'
import { PageBody, useProperty } from './PropertyLayout'

export function Placeholder({ scr, owner, title, children, refs }: {
  scr: string; owner: 'S10' | 'S11' | 'S12' | 'S13' | 'S14' | 'out of scope'; title: string; children?: ReactNode; refs?: string
}) {
  // review, 1 Oct: an out-of-scope page shouldn't read as a small card with dead space under it — the "unchanged"
  // message is the whole page, centred in the space the content would otherwise fill.
  return (
    // review, 3 Oct: it takes the whole available space under the head (not a small card), no decorative background
    // (not Hostaway's), the Hostaway mark instead of the rocket, everything centred both ways at every width.
    <div className="h-placeholder-fill" data-scr={scr} data-owner={owner} data-refs={refs}>
      <div className="h-placeholder">
        <span className="h-placeholder__mark" aria-hidden="true"><HostawayMark /></span>
        <h2 className="h-placeholder__title">{title}</h2>
        {children && <p className="h-placeholder__text">{children}</p>}
      </div>
    </div>
  )
}

/** A property page outside the case study's scope (Guest experience, Operations): the normal page frame and head,
 *  the property switcher, and the placeholder card under it (QA B24). */
export function PropertyPlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  const p = useProperty()
  return (
    <PageBody>
      <PageHead title={title} property={p} />
      <Placeholder scr="—" owner="out of scope" title={`${title} is unchanged`}>{children}</Placeholder>
    </PageBody>
  )
}
