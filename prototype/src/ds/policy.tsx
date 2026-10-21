/* Booking policies (Hospitable replica of the Airbnb "Booking policies" page and its Configure flow, Antonio's screens 14–21).
 * CSS: ds/components.css section "BOOKING POLICIES" · DS.md row "Booking policies". */
import type { ReactNode } from 'react'

export function InfoBox({ children }: { children: ReactNode }) {
  return <div className="h-info-box"><p>{children}</p></div>
}

export function HelpNote({ children }: { children: ReactNode }) {
  return <p className="h-help-note">{children}</p>
}

export function HelpLink({ href, plain, children }: { href: string; plain?: boolean; children: ReactNode }) {
  return <a className={`h-helplink${plain ? ' h-helplink--plain' : ''}`} href={href} target="_blank" rel="noreferrer">{children}</a>
}
