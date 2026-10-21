/* Hostaway DS replica · shell renderer (sidebar + property sub-nav).
   Shared by the gallery and the fidelity frames so the shell is written once.
   Usage: <aside data-shell="sidebar" data-active="properties" [data-collapsed]></aside>
          <nav data-shell="subnav" data-active="details"></nav>
   The prototype (S09) ports this to <Sidebar/> and <PropertySubnav/>. */
(function () {
  const ic = (id, cls = 'h-icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const mark = `<svg viewBox="0 0 24 26" aria-hidden="true"><circle cx="12" cy="10" r="7.2" fill="none" stroke="currentColor" stroke-width="4"/><rect x="5.6" y="21" width="12.8" height="4.2" rx="2.1" fill="currentColor"/></svg>`;
  window.HMark = mark;
  const NAV = [
    ['home', 'home', 'Home'], ['inbox', 'mail', 'Inbox'], ['properties', 'building', 'Properties'],
    ['calendar', 'calendar', 'Calendar'], ['guest', 'heart', 'Guest experience', true], ['metrics', 'chart-line', 'Metrics'],
    ['direct', 'send', 'Direct bookings'], ['devices', 'wifi', 'Devices', true], ['operations', 'square-check', 'Operations', true],
  ];
  const SUB = [
    ['overview', 'home', 'Overview'], ['details', 'file-text', 'Details'], ['pricing', 'coin', 'Pricing'],
    ['availability', 'calendar', 'Availability'], ['calendar', 'calendar', 'Calendar'], ['knowledge', 'book', 'Knowledge Hub'],
    ['policies', 'shield-check', 'Booking policies'], ['guest', 'heart', 'Guest experience'],
    ['operations', 'square-check', 'Operations'], ['direct', 'send', 'Direct'],
  ];
  function sidebar(el) {
    const a = el.dataset.active || 'properties';
    const persona = el.hasAttribute('data-persona');
    el.classList.add('h-sidebar');
    if (el.hasAttribute('data-collapsed')) el.classList.add('is-collapsed');
    el.innerHTML = `
      <div class="h-sidebar__brand">
        <span class="h-logo">${mark}<span class="h-logo__word">hostaway</span></span>
        <button class="h-sidebar__collapse" aria-label="Collapse sidebar">${ic('arrow-bar-to-left', 'h-icon h-icon--24')}</button>
      </div>
      <ul class="h-nav">
        <li><a class="h-nav__item" href="#">${ic('search')}<span class="h-label">Search<span class="h-nav__kbd">⌘K</span></span></a></li>
        <li><a class="h-nav__item h-nav__item--highlight" href="#">${ic('trending-up')}<span class="h-nav__badge">4</span><span class="h-label">Getting started</span></a></li>
        <li class="h-nav__sep" aria-hidden="true"></li>
        ${NAV.map(([k, i, l, chev]) => `<li><a class="h-nav__item" href="#"${k === a ? ' aria-current="page"' : ''}>${ic(i)}<span class="h-label">${l}</span>${chev ? ic('chevron-right', 'h-icon h-nav__chev') : ''}</a></li>`).join('')}
      </ul>
      <div class="h-sidebar__spacer"></div>
      ${persona ? `<div class="h-persona"><div class="h-persona__label">Demo · viewing as</div><button class="h-persona__btn"><span class="h-persona__tag">P1</span><span class="h-label">Family host</span>${ic('selector')}</button></div>` : ''}
      <div class="h-trial">
        <p class="h-trial__title">Mogul trial ends in 14 days</p>
        <p class="h-trial__sub">Activate your subscription today.</p>
        <button class="h-trial__cta">Subscribe to a plan</button>
      </div>
      <div class="h-sidebar__footer">
        <span class="h-avatar">AS</span>
        ${ic('sparkles')}${ic('heart-handshake')}${ic('help-circle')}${ic('sitemap')}${ic('settings')}
      </div>`;
  }
  function subnav(el) {
    const a = el.dataset.active || 'details';
    el.classList.add('h-subnav');
    el.setAttribute('aria-label', 'Property');
    el.innerHTML = `<a class="h-subnav__back" href="#">${ic('chevron-left', 'h-icon h-icon--16')}Back</a>` +
      SUB.map(([k, i, l]) => `<a class="h-subnav__item" href="#"${k === a ? ' aria-current="page"' : ''}>${ic(i)}${l}</a>`).join('');
  }
  function run() {
    document.querySelectorAll('[data-shell="sidebar"]').forEach(sidebar);
    document.querySelectorAll('[data-shell="subnav"]').forEach(subnav);
    document.querySelectorAll('[data-hmark]').forEach(e => { e.innerHTML = mark; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
