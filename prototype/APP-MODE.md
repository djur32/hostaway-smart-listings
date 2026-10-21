# App mode · the prototype as an installable mobile app

Two environments from one codebase:

| | Website | App |
|---|---|---|
| What | the prototype as it was: desktop, tablet, and the responsive phone layer | the phone layer as an installable app: native-feel navigation, gestures, device chrome |
| Turn on | default | build env `VITE_APP_MODE=mobile`, **or** visit `/app` on any build |
| Start screen | Properties | the property's Overview (`/property/neukolln/overview`) |

Spec: `ds/mobile.md` § "App mode". Code: `src/app/` (mode, head, nav, gesture, chrome, AppFrame). CSS: `../ds/v3/app.css`, loaded only in app mode (a dynamic import in `src/main.tsx`), so the website bundle doesn't change.

## Run

```sh
export PATH=/opt/homebrew/bin:$PATH
npm run dev                          # website at http://localhost:5174, app at http://localhost:5174/app
VITE_APP_MODE=mobile npm run dev     # the app at http://localhost:5174/ (what the mobile Vercel project serves)
VITE_APP_MODE=mobile npm run build   # the mobile project's build (tsc + vite); plain `npm run build` is the website
```

On a desktop browser the app is drawn inside a 390 × 844 iPhone (it iframes the same URL, so the phone layout runs exactly as on a device). On a phone it runs full screen. To test with a mouse: drag from the phone's left edge to go back; drag a sheet's handle down to close it.

## Install on an iPhone

1. Open the app URL in **Safari** (`https://<website>/app`, or the mobile project's URL).
2. Share › **Add to Home Screen** › Add. The icon is the Hostaway mark; the name is "Hostaway".
3. Open it from the Home Screen: it runs full screen (no Safari bars), white status bar, safe areas respected, back by swiping from the left edge.

Android (Chrome): menu › Install app / Add to Home screen.

## Deploy (Vercel)

Same repo, root `prototype/`, two projects. The website builds with no env; the app project sets `VITE_APP_MODE=mobile`. `vercel.json`'s SPA rewrite already serves `/app/*`; `public/pwa/` (manifests, icons) is served as files. Icons are regenerated with `node tools/app-icons.mjs` (headless Chrome).

## Limitations

- **Landscape on a phone** shows the desktop-width layout (the phone CSS is a `max-width: 767px` media query); the manifest asks for portrait, which installed Android apps honour and iOS ignores.
- **Safari's own edge swipe** (in the browser, not installed) takes over from ours; the app detects `hasUAVisualTransition` and doesn't animate that back a second time. Installed, ours is the only one.
- The swipe-back underlay is a **DOM snapshot** of the page you left: inputs show their original values, and pages never seen in this session (opened from a link) show a blank page underneath.
- Sheets have no half-height detent: they open at their content height (max 90%) and dismiss; the full-screen variant (`fullScreen`) stays non-draggable.
- No offline mode (no service worker): it's a prototype that needs the network.
