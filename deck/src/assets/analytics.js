/* Visit analytics for the deck.
 * prototype). Anonymous, no cookies, Do Not Track respected, no recording. Records page views, page leaves (time on the
 * deck) and one `slide_view` per slide (slide id, index, ms since the previous slide) so time per slide can be read.
 * Off on unknown hosts, and for a browser opened once with ?internal=1 (?internal=0 turns it back on). The token is a
 * write-only public project token. Same property names as the prototype: site, app. */
(function () {
  var TOKEN = 'phc_zKDtHsfUdsz3u2YTrZeQrBwRcPkZWEGtBZpMiYvawwj9';
  var OFF = 'hostaway-no-analytics';
  try {
    var q = new URLSearchParams(location.search).get('internal');
    if (q === '1') localStorage.setItem(OFF, '1');
    if (q === '0') localStorage.removeItem(OFF);
    if (localStorage.getItem(OFF)) return;
    if (!/\.vercel\.app$/.test(location.hostname)) return;
    if (navigator.doNotTrack === '1') return;
  } catch (e) { return; }

  /* PostHog's own loader snippet */
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(TOKEN, {
    api_host: 'https://eu.i.posthog.com',
    ui_host: 'https://eu.posthog.com',
    persistence: 'localStorage',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    person_profiles: 'identified_only',
    respect_dnt: true,
    loaded: function (ph) { ph.register({ site: 'hostaway-case', app: 'deck' }); }
  });

  /* one event per slide: the engine moves between slides with history.replaceState(…, '#<id>') */
  var last = location.hash, lastAt = Date.now(), index = 0;
  var replace = history.replaceState;
  history.replaceState = function () {
    var out = replace.apply(this, arguments);
    try {
      if (location.hash !== last) {
        var now = Date.now();
        posthog.capture('slide_view', { slide: location.hash.slice(1), index: ++index, previous_slide: last.slice(1), ms_on_previous: now - lastAt });
        last = location.hash; lastAt = now;
      }
    } catch (e) {}
    return out;
  };
})();
