/* Versions helpers · owner S12 · D-155 · word-level diff and per-version performance (from data/performance.ts). */
import { series } from '../../data/performance'
import type { ChannelId } from '../../data/types'

export type Part = { t: string; k: 'same' | 'add' | 'del' }

/** Word-level LCS diff: small inputs (titles, descriptions), so O(n·m) is fine. */
export function wordDiff(a: string, b: string): Part[] {
  const A = a.split(/(\s+)/), B = b.split(/(\s+)/)
  const n = A.length, m = B.length
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out: Part[] = []
  let i = 0, j = 0
  const push = (t: string, k: Part['k']) => { const last = out[out.length - 1]; if (last && last.k === k) last.t += t; else out.push({ t, k }) }
  while (i < n && j < m) {
    if (A[i] === B[j]) { push(A[i], 'same'); i++; j++ }
    else if (L[i + 1][j] >= L[i][j + 1]) { push(A[i], 'del'); i++ }
    else { push(B[j], 'add'); j++ }
  }
  while (i < n) push(A[i++], 'del')
  while (j < m) push(B[j++], 'add')
  return out
}

/** How a version did while it was live (Early access · ). */
export function versionPerf(channel: ChannelId, n: number) {
  const pts = series(channel).filter((p) => p.version === n)
  if (!pts.length) return null
  const b = pts.reduce((s, p) => s + p.bookings, 0), c = pts.reduce((s, p) => s + p.comps, 0)
  return {
    weeks: pts.length, bookings: b, perWeek: b / pts.length, pace: Math.round((b / c) * 100),
    adr: Math.round(pts.reduce((s, p) => s + p.adr, 0) / pts.length), occupancy: Math.round(pts.reduce((s, p) => s + p.occupancy, 0) / pts.length),
    enquiries: pts.reduce((s, p) => s + p.enquiries, 0), score: pts[pts.length - 1].score,
  }
}
