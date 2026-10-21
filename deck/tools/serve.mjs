#!/usr/bin/env node
/* Serve the deck for presenting: node tools/serve.mjs [port]  → http://127.0.0.1:8793/dist/pages/
   (run node tools/dist.mjs first; src/pages/ is the editing build, no bundle step)
   Works from any folder. If the deck is already being served on that port, it says so and
   prints the links; if something else holds the port, it moves to the next free one. */
import path from 'node:path';
import { serveSite } from './lib/cdp.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const links = (origin) => `deck    ${origin}/dist/pages/hospitable.html\n\nediting build (no bundle step): ${origin}/src/pages/hospitable.html\ncomponent gallery:              ${origin}/src/pages/kit-hospitable.html`;

// what is on this port? 'deck' (this deck, already served), 'other', or 'free'
async function probe(port) {
  try {
    // only recognise *this* deck: the marker file exists in hospitable-case/deck only, never in process-deck
    const r = await fetch(`http://127.0.0.1:${port}/.hospitable-deck`, { signal: AbortSignal.timeout(1500) });
    const t = r.ok ? await r.text() : '';
    return t.includes('hospitable-deck') ? 'deck' : 'other';
  } catch { return 'free'; }
}

let port = +(process.argv[2] || 8793);
for (let tries = 0; tries < 20; tries++, port++) {
  const on = await probe(port);
  if (on === 'deck') { console.log(`Already running on port ${port}, nothing to start. Open:\n\n${links(`http://127.0.0.1:${port}`)}`); process.exit(0); }
  if (on === 'free') break;
  console.log(`port ${port} is taken by something else, trying ${port + 1}`);
}
const s = await serveSite(ROOT, port);
console.log(`${links(s.origin)}\n\nCtrl+C to stop`);
