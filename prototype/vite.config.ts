// Hostaway Smart Listings: prototype build config.
// The design system is imported from ../ds (one source of truth, CONVENTIONS §6); never copied here.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// App mode (APP-MODE.md): the mobile project builds with VITE_APP_MODE=mobile. Its index.html carries the installable-app
// head statically (iOS reads these when you Add to Home Screen); src/app/head.ts sets the same at runtime for /app.
const appBuild = process.env.VITE_APP_MODE === 'mobile'
const appHead = {
  name: 'app-mode-head',
  transformIndexHtml(html: string) {
    if (!appBuild) return html
    const base = process.env.PROTO_BASE ?? '/'
    return html
      .replace('content="width=device-width, initial-scale=1"', 'content="width=device-width, initial-scale=1, viewport-fit=cover"')
      .replace(/<title>[^<]*<\/title>/, '<title>Hostaway</title>')
      .replace('</head>', [
        `<link rel="manifest" href="${base}pwa/root.webmanifest" />`,
        `<link rel="apple-touch-icon" sizes="180x180" href="${base}pwa/apple-touch-icon.png" />`,
        '<meta name="apple-mobile-web-app-capable" content="yes" />',
        '<meta name="mobile-web-app-capable" content="yes" />',
        '<meta name="apple-mobile-web-app-title" content="Hostaway" />',
        '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
        '</head>',
      ].join('\n    '))
  },
}

export default defineConfig({
  plugins: [react(), appHead],
  // S19 deploys under /prototype on the same Vercel project as the deck (D-005): PROTO_BASE=/prototype/ npm run build
  base: process.env.PROTO_BASE ?? '/',
  server: {
    port: 5174,
    strictPort: true,
    fs: { allow: ['..'] }, // ../ds and ../ia live outside the Vite root
  },
})
