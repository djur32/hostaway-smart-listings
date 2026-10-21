/* ============================================================================
   TOUCH · what a finger needs that a keyboard does not. Nothing here runs on a
   fine pointer, so the desk setup is untouched (Antonio presents from a laptop;
   this is for the same deck opened on a phone or a tablet).

     swipe          left and right move the deck, exactly like → and ←
     double tap     zooms the stage to 2× around the tap, for the dense slides
     drag           pans while zoomed; a second double tap puts it back
     the bar        light/dark, prev, next, at thumb size, on the right edge

   The zoom rides on the stage's own transform through --z and --tx/--ty, which
   default to 1 / 0 / 0: with no touch input the transform is what it always was.
   ========================================================================= */

const MAX_Z = 2.4;

/* The listeners go on whatever the device is: every one of them ignores a mouse, so a
   laptop behaves exactly as before, and a hybrid machine (or a window resized into a
   phone shape for a check) still answers a finger. */
export function wireTouch(Deck, stage, viewport) {
  const st = { z: 1, tx: 0, ty: 0 };
  const apply = () => {
    stage.style.setProperty('--z', st.z);
    stage.style.setProperty('--tx', st.tx + 'px');
    stage.style.setProperty('--ty', st.ty + 'px');
    viewport.classList.toggle('is-zoomed', st.z > 1.01);
    document.querySelector('.tbar')?.classList.toggle('is-zoomed', st.z > 1.01);
  };
  /* the stage is centred and scaled about its middle, so the pan it can take is
     half of whatever the zoom added, in each direction */
  const clamp = () => {
    const k = parseFloat(getComputedStyle(stage).getPropertyValue('--k')) || 1;
    const ex = Math.max(0, (1920 * k * st.z - viewport.clientWidth) / 2);
    const ey = Math.max(0, (1080 * k * st.z - viewport.clientHeight) / 2);
    st.tx = Math.max(-ex, Math.min(ex, st.tx));
    st.ty = Math.max(-ey, Math.min(ey, st.ty));
  };
  const zoomTo = (z, cx, cy) => {
    const prev = st.z;
    st.z = Math.max(1, Math.min(MAX_Z, z));
    if (st.z <= 1.01) { st.z = 1; st.tx = 0; st.ty = 0; }
    else {
      // keep the point under the finger where it is
      const dx = cx - viewport.clientWidth / 2, dy = cy - viewport.clientHeight / 2;
      const r = st.z / prev;
      st.tx = (st.tx - dx) * r + dx;
      st.ty = (st.ty - dy) * r + dy;
      clamp();
    }
    apply();
  };

  let p0 = null, moved = false, lastTap = 0, lastXY = [0, 0];
  const SWIPE = 64, SLOPE = 1.6;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    p0 = { x: e.clientX, y: e.clientY, t: performance.now(), tx: st.tx, ty: st.ty };
    moved = false;
  }, { passive: true });

  viewport.addEventListener('pointermove', (e) => {
    if (!p0 || e.pointerType === 'mouse') return;
    const dx = e.clientX - p0.x, dy = e.clientY - p0.y;
    if (Math.hypot(dx, dy) > 10) moved = true;
    if (st.z > 1.01 && moved) { st.tx = p0.tx + dx; st.ty = p0.ty + dy; clamp(); apply(); }
  }, { passive: true });

  viewport.addEventListener('pointerup', (e) => {
    if (!p0 || e.pointerType === 'mouse') { p0 = null; return; }
    const dx = e.clientX - p0.x, dy = e.clientY - p0.y;
    const quick = performance.now() - p0.t < 700;
    p0 = null;
    // a double tap, while nothing moved: the reading zoom
    if (!moved) {
      const now = performance.now();
      const near = Math.hypot(e.clientX - lastXY[0], e.clientY - lastXY[1]) < 40;
      if (now - lastTap < 320 && near) { zoomTo(st.z > 1.01 ? 1 : 2, e.clientX, e.clientY); lastTap = 0; return; }
      lastTap = now; lastXY = [e.clientX, e.clientY];
      return;
    }
    // a swipe, only while the stage sits at its own size: zoomed in, a drag pans
    if (st.z <= 1.01 && quick && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * SLOPE) {
      if (dx < 0) Deck.next(); else Deck.prev();
    }
  }, { passive: true });

  viewport.addEventListener('pointercancel', () => { p0 = null; }, { passive: true });

  /* the bar dims itself when nobody has touched anything for a while, and comes back
     on the next touch: on a phone in landscape it would otherwise sit on the slide */
  const bar = document.querySelector('.tbar');
  if (bar) {
    let idle = null;
    const wake = () => {
      bar.classList.remove('is-idle');
      clearTimeout(idle); idle = setTimeout(() => bar.classList.add('is-idle'), 3200);
    };
    for (const ev of ['pointerdown', 'pointermove']) viewport.addEventListener(ev, wake, { passive: true });
    bar.addEventListener('pointerdown', wake, { passive: true });
    addEventListener('deck:slide', wake);
    addEventListener('deck:beat', wake);
    wake();
  }
  addEventListener('deck:fit', () => { if (st.z > 1.01) { clamp(); apply(); } });
  // a new slide is read from the top: never arrive already zoomed into a corner
  addEventListener('deck:slide', () => { if (st.z > 1.01) { st.z = 1; st.tx = 0; st.ty = 0; apply(); } });

  return { reset: () => zoomTo(1, 0, 0), toggle: () => zoomTo(st.z > 1.01 ? 1 : 2, viewport.clientWidth / 2, viewport.clientHeight / 2) };
}

/** the thumb-sized controls, and the turn-your-phone card. Both live outside the stage. */
export function mountTouchChrome(Deck, viewport, brandMark) {
  const ico = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const bar = document.createElement('div');
  bar.className = 'tbar';
  /* Two controls, nothing else: the slide number is on the bar at the top, the palette is in
     the menu, the reading zoom is a double tap. The Hospitable deck has one theme, so the
     light/dark switch the InvestEngine deck carried here is gone (D-071). */
  bar.innerHTML = `
    <button type="button" class="tbar__b" data-touch="prev" aria-label="Previous">${ico('<path d="M15 5 8 12l7 7"/>')}</button>
    <button type="button" class="tbar__b" data-touch="next" aria-label="Next">${ico('<path d="m9 5 7 7-7 7"/>')}</button>`;
  document.body.appendChild(bar);

  const card = document.createElement('div');
  card.className = 'rotate';
  card.innerHTML = `
    <i class="rotate__mark">${brandMark}</i>
    <i class="rotate__ph" aria-hidden="true"></i>
    <p class="rotate__h">Turn your phone</p>
    <p class="rotate__p">The deck is built wide, the way it is presented. Landscape gives every slide its full width.</p>`;
  document.body.appendChild(card);
  return bar;
}
