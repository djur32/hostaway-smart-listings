/* Account avatar + menu (ds/components.css §10f, D-160…D-163). The sidebar footer's avatar opens it: who you are, the
 * accounts you can act as, and the settings that shape your defaults. Pure: the shell passes the accounts and the switch. */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { UserDef, UserId } from '../data/users'
import { Icon } from './primitives'

export function AccountAvatar({ user, size }: { user: UserDef; size?: 24 | 40 }) {
  return <span className={`h-avatar h-avatar--account h-avatar--${user.tone}${size ? ` h-avatar--${size}` : ''}`} aria-hidden="true">{user.initials}</span>
}

export function AccountMenu({ user, users, summary, onSwitch, onReset }: {
  user: UserDef
  users: UserDef[]
  /** One line per account under its name, e.g. "5 properties" / "No properties yet". */
  summary: (u: UserDef) => string
  onSwitch: (id: UserId) => void
  onReset?: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // The sidebar scrolls (overflow: auto) and would clip a 320px menu: the menu floats in a portal, anchored above the avatar.
  const [pos, setPos] = useState<CSSProperties>({})
  const place = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ position: 'fixed', left: Math.max(8, r.left - 8), bottom: window.innerHeight - r.top + 12 })
  }
  useLayoutEffect(() => { if (open) place() }, [open]) // placed before paint: no frame at the wrong spot
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div className="h-account" ref={ref}>
      <button type="button" className="h-account__btn" aria-haspopup="menu" aria-expanded={open} aria-label={`Account: ${user.name}. Switch account`} onClick={() => setOpen(!open)}>
        <AccountAvatar user={user} />
      </button>
      {open && (
        createPortal(<div className="h-menu h-account__menu" role="menu" aria-label="Account" ref={menuRef} style={pos}>
          <div className="h-account__head">
            <AccountAvatar user={user} size={40} />
            <div><div className="h-account__name">{user.name}</div><div className="h-account__role">{user.role} · {summary(user)}</div></div>
          </div>
          <div className="h-account__label">Act as</div>
          {users.map((u) => (
            <button key={u.id} type="button" role="menuitemradio" aria-checked={u.id === user.id} className="h-menu__item" aria-selected={u.id === user.id}
              onClick={() => { setOpen(false); onSwitch(u.id) }}>
              <AccountAvatar user={u} />
              <span className="h-account__item-text"><b>{u.name}</b><span className="h-account__role">{u.role} · {summary(u)}</span></span>
              {u.id === user.id && <Icon name="check" className="h-account__check" />}
            </button>
          ))}
          <div className="h-account__foot">
            <Link className="h-menu__item" role="menuitem" to="/settings/guidance" onClick={() => setOpen(false)}><Icon name="settings" />How Hospitable helps you</Link>
            {onReset && <button type="button" className="h-menu__item" role="menuitem" onClick={() => { setOpen(false); onReset() }}><Icon name="refresh" />Start {user.name}’s account over</button>}
          </div>
        </div>, document.body)
      )}
    </div>
  )
}
