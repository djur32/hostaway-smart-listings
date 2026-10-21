// Phone screenshot with CDP device emulation (headless --window-size can't go below ~500px).
// Usage: node tools/mshot.mjs "<route>" <out.png> [w=390] [h=844] ["js to run after load"]
import fs from 'node:fs'
import { launchChrome, sleep } from '../../deck/tools/lib/cdp.mjs'
const [route, out, w = '390', h = '844', js] = process.argv.slice(2)
const url = route.startsWith('http') ? route : `http://localhost:5174${route}`
const chrome = await launchChrome()
try {
  const p = await chrome.newPage()
  const errs = []
  p.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description?.split('\n')[0]))
  await p.send('Runtime.enable'); await p.send('Page.enable')
  await p.send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 2, mobile: +w < 768 })
  await p.send('Page.navigate', { url })
  await p.once('Page.loadEventFired', 15000)
  await sleep(2000)
  if (js) { await p.eval(js); await sleep(1000) }
  const r = await p.send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(out, Buffer.from(r.data, 'base64'))
  const info = await p.eval('JSON.stringify({w: innerWidth, scrollW: document.documentElement.scrollWidth})')
  console.log(out, info, errs.length ? errs : '')
} finally { await chrome.close() }
