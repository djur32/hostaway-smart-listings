/* Scrollbars show only while scrolling (Antonio, 3 Oct: "the scroll bar should only be seen when you scroll;
 * otherwise it should disappear"). Every scrollbar keeps its fixed --scrollbar-size gutter (so layouts never shift and
 * the form/Tips gap stays centred) but its thumb is transparent at rest; a scroll marks the scrolling element
 * `is-scrolling` for a moment, which paints the thumb (ds/components.css "Scrollbars"). Installed once in main.tsx. */
const HIDE_AFTER = 900
export function installScrollReveal() {
  const timers = new WeakMap<Element, number>()
  const onScroll = (e: Event) => {
    const el = e.target === document ? document.documentElement : e.target
    if (!(el instanceof Element)) return
    el.classList.add('is-scrolling')
    window.clearTimeout(timers.get(el))
    timers.set(el, window.setTimeout(() => el.classList.remove('is-scrolling'), HIDE_AFTER))
  }
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
}
