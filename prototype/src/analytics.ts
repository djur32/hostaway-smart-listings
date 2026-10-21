/* Visit analytics: PostHog, EU cloud, project 278593.
 * What it records: page views (the router changes the URL, so history_change), page leaves (time on each page), session
 * length, device, country, referrer. Anonymous: a random id kept in localStorage, no cookies, Do Not Track respected, no
 * session recording with inputs masked (inert until Project settings > Replay is on), click autocapture. `site` / `app` / `account` separate this prototype from the portfolio's traffic and
 * the website from the app.
 * Off in local development, on unknown hosts, in the desktop phone frame's outer page (its inner iframe is the real app,
 * so a visit is counted once), and for the author: open any page once with ?internal=1 to stop counting that browser
 * (?internal=0 turns it back on). The token is a write-only public project token (PostHog: "safe to use in public apps"). */
import { APP_MODE, shouldFrame } from './app/mode'
import { currentUserId } from './data/users'

const TOKEN = 'phc_zKDtHsfUdsz3u2YTrZeQrBwRcPkZWEGtBZpMiYvawwj9'
const HOSTS = [/\.vercel\.app$/]
const OFF = 'hostaway-no-analytics'

export function initAnalytics() {
  try {
    const q = new URLSearchParams(location.search).get('internal')
    if (q === '1') localStorage.setItem(OFF, '1')
    if (q === '0') localStorage.removeItem(OFF)
    if (localStorage.getItem(OFF)) return
    if (!HOSTS.some((h) => h.test(location.hostname))) return
    if (shouldFrame()) return
    if (navigator.doNotTrack === '1') return
  } catch { return }
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(TOKEN, {
      api_host: 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      persistence: 'localStorage',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      autocapture: { capture_copied_text: false }, // clicks, so the tour through the prototype can be read
      // recording is on in code with every input masked; PostHog only records once Project settings > Replay is switched
      // on (a project setting, not code)
      disable_session_recording: false,
      session_recording: { maskAllInputs: true },
      person_profiles: 'identified_only',
      respect_dnt: true,
      // history_change counts route changes only; the page the visit starts on is counted here
      loaded: (ph) => { ph.register({ site: 'hostaway-case', app: APP_MODE ? 'mobile' : 'web', account: currentUserId() }); ph.capture('$pageview') },
    })
  }).catch(() => { /* analytics must never break the prototype */ })
}
