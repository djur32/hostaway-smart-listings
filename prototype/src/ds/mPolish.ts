/* Phones: a button that sits alone on its row is full width and 48 px (ds/v3/m-polish.css). CSS cannot see "alone on its row",
 * so this marks such buttons (data-solo) after layout. It only measures and sets an attribute, never changes the DOM tree. */
import '../../../ds/v3/m-polish.css'

const PHONE = '(max-width: 767px)'
const SKIP = '.h-m-tabbar, [role="tab"], .h-dropdown__trigger, [data-no-solo], .h-sheet__close'

const visible = (el: Element) => {
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return false
  const cs = getComputedStyle(el)
  return cs.visibility !== 'hidden' && cs.position !== 'absolute' && cs.position !== 'fixed'
}

function mark() {
  document.querySelectorAll('[data-solo]').forEach((b) => b.removeAttribute('data-solo'))
  document.querySelectorAll('.h-solo-wrap').forEach((w) => w.classList.remove('h-solo-wrap'))
  if (!window.matchMedia(PHONE).matches) return
  const hits: [Element, Element[]][] = []
  document.querySelectorAll<HTMLElement>('.h-btn').forEach((b) => {
    if (b.matches(SKIP) || b.closest(SKIP) || !b.textContent?.trim() || b.classList.contains('h-btn--icon')) return
    const r = b.getBoundingClientRect()
    if (!r.width || !r.height || getComputedStyle(b).position === 'fixed') return
    let node: Element = b
    const wraps: Element[] = []
    for (let i = 0; i < 3; i++) {
      const par = node.parentElement
      if (!par || par === document.body || par.id === 'root') break
      if ([...par.children].some((c) => c !== node && visible(c))) break
      wraps.push(par); node = par
    }
    const par = node.parentElement
    if (!par) return
    for (const s of par.children) {
      if (s === node || !visible(s)) continue
      const sr = s.getBoundingClientRect()
      if (sr.top < r.bottom - 2 && sr.bottom > r.top + 2) return
    }
    hits.push([b, wraps])
  })
  hits.forEach(([b, wraps]) => { b.setAttribute('data-solo', ''); wraps.forEach((w) => w.classList.add('h-solo-wrap')) })
}

let timer = 0
const queue = () => { clearTimeout(timer); timer = window.setTimeout(mark, 60) }

if (typeof window !== 'undefined') {
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('resize', queue)
  queue()
}
