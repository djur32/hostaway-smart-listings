#!/usr/bin/env node
/* ============================================================================
   REPORT · the talk as a table: slides, minutes, lenses, words, notes.
     node tools/report.mjs          → per-stage timing against the 30–35 min budget
     node tools/report.mjs --list   → every slide
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dir = path.join(ROOT, 'src/slides');
const files = fs.readdirSync(dir).filter((f) => /^\d\d.*\.html$/.test(f)).sort();
const STAGE = ['Open', 'Discovery', 'Research', 'Concept', 'Design', 'Test', 'Measure', 'Close', 'Appendix'];
const rows = [];
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const m of html.matchAll(/<section\b([^>]*\bclass="[^"]*\bs\b[^"]*"[^>]*)>([\s\S]*?)<\/section>/g)) {
    const a = (k) => (m[1].match(new RegExp(`${k}="([^"]*)"`)) || [])[1] ?? '';
    const body = m[2];
    const visible = body.replace(/<aside class="notes"[\s\S]*?<\/aside>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ');
    const words = visible.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
    const beats = new Set([...body.matchAll(/data-beat="(\d+)"/g)].map((x) => x[1])).size;
    rows.push({ file: f, id: a('data-id'), title: a('data-title'), stage: +a('data-stage') || 0, lens: a('data-lens'), min: +a('data-min') || 0, words, beats, notes: /class="notes"/.test(body) });
  }
}
if (process.argv.includes('--list')) {
  for (const r of rows) console.log(`${String(rows.indexOf(r) + 1).padStart(2)} ${STAGE[r.stage].padEnd(9)} ${(r.lens || '·').padEnd(4)} ${String(r.min).padStart(4)}m ${String(r.words).padStart(3)}w ${r.beats ? r.beats + 'b' : '  '} ${r.notes ? ' ' : '!'} ${r.id.padEnd(30)} ${r.title}`);
  console.log('');
}
let total = 0;
console.log('stage      slides  minutes  ①  ②  ③  max-words');
for (let s = 0; s < STAGE.length; s++) {
  const rs = rows.filter((r) => r.stage === s); if (!rs.length) continue;
  const min = rs.reduce((x, r) => x + r.min, 0); if (s < 8) total += min;
  const c = (l) => rs.filter((r) => r.lens === l).length;
  console.log(`${STAGE[s].padEnd(10)} ${String(rs.length).padStart(6)}  ${min.toFixed(2).padStart(7)}  ${c('did')}  ${c('hold')}  ${c('now')}  ${Math.max(...rs.map((r) => r.words))}`);
}
console.log(`\n${rows.length} slides · ${total.toFixed(1)} minutes of material (target 30–35, appendix excluded)`);
const noNotes = rows.filter((r) => !r.notes); if (noNotes.length) console.log(`no notes: ${noNotes.map((r) => r.id).join(', ')}`);
const heavy = rows.filter((r) => r.words > 45); if (heavy.length) console.log(`over 45 words: ${heavy.map((r) => `${r.id} (${r.words})`).join(', ')}`);
