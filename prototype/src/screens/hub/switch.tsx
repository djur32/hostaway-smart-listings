/* Knowledge Hub iterations (Antonio, 30 Sep: "four or five different iterations, and a dropdown to select which one to open").
 * ?v=a…e picks one; the choice is remembered for the session. Paper: "Hospitable v2" › KH · Knowledge Hub directions. */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Dropdown } from '../../ds'

export const HUB_VARIANTS = [
  { id: 'r', label: 'R · Topics, facts and workflows (current)' },
  { id: 'a', label: 'A · Channel matrix' },
  { id: 'b', label: 'B · One document + AI tester' },
  { id: 'c', label: 'C · Guest questions first' },
  { id: 'd', label: 'D · Overview cards' },
  { id: 'e', label: 'E · Base and channel lens' },
  { id: 's', label: 'S · Sections list (first build)' },
] as const
export type HubVariant = (typeof HUB_VARIANTS)[number]['id']
const KEY = 'hospitable-hub-variant'
const read = (): HubVariant | null => { try { return sessionStorage.getItem(KEY) as HubVariant | null } catch { return null } }

export function useHubVariant(): HubVariant {
  const [q] = useSearchParams()
  const fromUrl = q.get('v') as HubVariant | null
  const v = HUB_VARIANTS.some((x) => x.id === fromUrl) ? fromUrl! : read() ?? 'a'
  useEffect(() => { try { sessionStorage.setItem(KEY, v) } catch { /* private mode */ } }, [v])
  return v
}

/** The iteration picker, placed in each variant's page head (right, before the property switcher). */
export function HubVariantPicker() {
  const [q, setQ] = useSearchParams()
  const v = useHubVariant()
  const cur = HUB_VARIANTS.find((x) => x.id === v)!
  return (
    <div className="kh-variant-picker">
      <Dropdown label="Knowledge Hub iteration" value={cur.label} options={HUB_VARIANTS.map((x) => x.label)}
        onChange={(l) => { const id = HUB_VARIANTS.find((x) => x.label === l)!.id; const n = new URLSearchParams(q); n.set('v', id); setQ(n, { replace: true }) }} />
    </div>
  )
}
