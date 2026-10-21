// App mode (APP-MODE.md): renders the Hostaway mark as PNG home-screen icons into public/pwa/.
// Usage: node tools/app-icons.mjs   (needs the deck's headless Chrome helper)
import fs from 'node:fs'
import { launchChrome, sleep } from '../../deck/tools/lib/cdp.mjs'
// Literals on purpose: icons are raster files that can't read CSS tokens (same as public/favicon.svg).
const RASPBERRY = '#ed3c6a', WHITE = '#ffffff'
const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${WHITE}"/>
<g transform="translate(${50 - 12 * pad} ${50 - 13 * pad}) scale(${pad})"><circle cx="12" cy="10" r="7.2" fill="none" stroke="${RASPBERRY}" stroke-width="4"/><rect x="5.6" y="21" width="12.8" height="4.2" rx="2.1" fill="${RASPBERRY}"/></g></svg>`
const out = [['icon-192.png', 192, 2.4], ['icon-512.png', 512, 2.4], ['icon-maskable-512.png', 512, 1.9], ['apple-touch-icon.png', 180, 2.4]]
const chrome = await launchChrome()
try {
  const p = await chrome.newPage()
  await p.send('Page.enable')
  for (const [name, size, pad] of out) {
    await p.send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false })
    const html = `<html><body style="margin:0">${svg(pad).replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`
    await p.send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') })
    await sleep(400)
    const r = await p.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } })
    fs.writeFileSync(`public/pwa/${name}`, Buffer.from(r.data, 'base64'))
    console.log('wrote', name)
  }
} finally { await chrome.close() }
