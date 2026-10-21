/* One policy on Channels › {channel} › Booking policies (Antonio, 3 Oct: "the content needs a better layout").
 * Hospitable's own card (REAL·PRODUCT HS-47, `Screenshot 2026-09-29 at 13.54.55.png`) carries the same content — an
 * optional "Long-term stays (28+ nights)" heading, the policy name, its text, the Non-refundable line, Configure — but
 * with two different title scales, a 28px leading on 14px text and Configure centred on the card. Here every card has
 * one structure: an optional eyebrow, then a title row (policy name + its TipDot on the left, the 32px Configure
 * top-right), the description at 14/20 and an optional meta line. CSS: ds/v3/ch.css "Booking policies". */
import type { ReactNode } from 'react'

export function PolicyCard({ id, eyebrow, title, dot, body, meta, action, readOnly }: {
  /** DOM id the page's Tips scroll to and the TipDot belongs to (screenTips.tsx `field`). */
  id: string
  eyebrow?: ReactNode
  title: ReactNode
  /** `dotFor(id)` from useScreenTips: the purple marker right after the title, or null. */
  dot?: ReactNode
  body?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  readOnly?: boolean
}) {
  return (
    // Antonio, 3 Oct ("fix, layout doesn't work as is"): two columns — the text stack on the left (eyebrow, title +
    // its dot, body, meta) and Configure, a secondary button, pinned to the card's top-right whatever sits above the title
    <section id={id} className={`ch-polcard${readOnly ? ' ch-polcard--readonly' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="ch-polcard__main">
        {eyebrow && <p className="ch-polcard__eyebrow">{eyebrow}</p>}
        <h3 className="ch-polcard__title" id={`${id}-title`}><span>{title}</span>{dot}</h3>
        {body && <p className="ch-polcard__body">{body}</p>}
        {meta && <p className="ch-polcard__meta">{meta}</p>}
      </div>
      {action && <div className="ch-polcard__action">{action}</div>}
    </section>
  )
}
