#!/usr/bin/env node
// audit.mjs · requirements coverage + guardrails for the Hospitable case study.
// Run from the repo root:  node tools/audit.mjs      (exit 1 when there are errors)
// Writes plan/audit/AUDIT-<date>.md. S18 runs it daily; S00, S07, S17, S19 run it after their work.
// No dependencies (Node >= 18).

import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { manifest } from './manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => join(ROOT, ...a);
const PROCESS_DECK = join(homedir(), 'Developer', 'process-deck');
const SLIDE_LIMIT = 50;
const SCOPE_MIN = 0.7; // share of Standard-path slides tagged A or B

const errors = [], warnings = [], notes = [];
const today = new Date().toISOString().slice(0, 10);

// ── helpers ────────────────────────────────────────────────────────────────
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const walk = (dir, filter, out = []) => {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n.startsWith('.')) continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, filter, out) : filter(p) && out.push(p);
  }
  return out;
};

// ── 1 · requirements ledger ────────────────────────────────────────────────
const reqRows = readFileSync(P('plan/REQUIREMENTS.md'), 'utf8')
  .split('\n').filter((l) => /^\|\s*R-\d{3}\s*\|/.test(l)).map(cells);
const reqs = reqRows.map(([id, text, source, owner, doneWhen, status, evidence]) => ({ id, text, source, owner, doneWhen, status, evidence: evidence ?? '' }));
const malformed = reqRows.filter((r) => r.length !== 7).map((r) => r[0]);
if (malformed.length) errors.push(`REQUIREMENTS.md rows without 7 cells: ${malformed.join(', ')}`);
const dupes = reqs.map((r) => r.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) errors.push(`Duplicate requirement IDs: ${[...new Set(dupes)].join(', ')}`);

const VALID = ['Open', 'In progress', 'Done', 'Partial', 'Dropped'];
for (const r of reqs) {
  if (!VALID.includes(r.status)) errors.push(`${r.id} has unknown status "${r.status}"`);
  if (r.status === 'Done' && !r.evidence) errors.push(`${r.id} is Done but has no evidence`);
  if (r.status === 'Dropped' && !/D-\d{3}/.test(r.evidence)) errors.push(`${r.id} is Dropped without a D-### in evidence`);
}
const byStatus = Object.fromEntries(VALID.map((s) => [s, reqs.filter((r) => r.status === s).length]));
const owners = {};
for (const r of reqs) for (const o of r.owner.match(/S-plan|S\d{2}[ab]?|all/g) ?? ['?']) {
  owners[o] ??= { total: 0, done: 0 };
  owners[o].total++; if (r.status === 'Done') owners[o].done++;
}

// sessions' own status (STATUS.md)
const sessionStatus = {};
for (const l of readFileSync(P('plan/STATUS.md'), 'utf8').split('\n')) {
  const m = l.match(/^\|\s*(S\d{2}[ab]?)\s*\|/);
  if (m) sessionStatus[m[1]] = cells(l)[4];
}
const sessionDone = (s) => s === 'S06'
  ? sessionStatus.S06a === 'Done' && sessionStatus.S06b === 'Done'
  : sessionStatus[s] === 'Done';
for (const r of reqs) {
  if (r.status !== 'Open') continue;
  const own = (r.owner.match(/S\d{2}[ab]?/g) ?? []);
  if (own.length && own.every(sessionDone)) warnings.push(`${r.id} still Open although its owner(s) ${own.join(', ')} are Done`);
}

// ── 2 · deck slides ────────────────────────────────────────────────────────
const slideDir = P('deck/src/slides');
const slides = [];
if (existsSync(slideDir)) {
  for (const f of readdirSync(slideDir).filter((n) => n.endsWith('.html') && !n.startsWith('_'))) {
    const html = readFileSync(join(slideDir, f), 'utf8');
    for (const m of html.matchAll(/<section\b[^>]*\bdata-id="([^"]+)"[^>]*>/g)) {
      const tag = m[0], attr = (a) => (tag.match(new RegExp(`\\b${a}="([^"]*)"`)) ?? [])[1] ?? '';
      slides.push({ file: f, id: m[1], req: attr('data-req'), notion: attr('data-notion'), angle: attr('data-angle'), path: attr('data-path'), bookend: /\bdata-bookend\b/.test(tag) });
    }
  }
}
// the bookends (data-bookend: the opening plate and the closing "Thanks.") frame the talk; R-185 counts the content slides
const counted = slides.filter((s) => !s.bookend);
if (counted.length > SLIDE_LIMIT) errors.push(`Deck has ${counted.length} slides — the limit is ${SLIDE_LIMIT}`);
const bare = slides.filter((s) => !s.req && !s.notion);
if (bare.length) warnings.push(`${bare.length} slide(s) with neither data-req nor data-notion: ${bare.map((s) => s.id).join(', ')}`);
const reqInDeck = new Set(slides.flatMap((s) => s.req.match(/R-\d{3}/g) ?? []));

// scope guard: Standard path = data-path S or St (slides without data-path are counted in)
const standard = counted.filter((s) => !s.path || /^(S|St)$/.test(s.path));
const tagged = standard.filter((s) => s.angle);
let scopeShare = null;
if (tagged.length >= 10) {
  scopeShare = standard.filter((s) => /\b(A|B|both)\b/.test(s.angle)).length / standard.length;
  if (scopeShare < SCOPE_MIN) warnings.push(`Scope guard: only ${(scopeShare * 100).toFixed(0)}% of Standard-path slides are A/B (target ≥ ${SCOPE_MIN * 100}%)`);
} else if (slides.length) notes.push(`Scope guard skipped: fewer than 10 Standard-path slides carry data-angle`);

// ── 3 · prototype references ───────────────────────────────────────────────
const protoFiles = walk(P('prototype/src'), (p) => /\.(tsx?|jsx?|css|md)$/.test(p));
const protoText = protoFiles.map((p) => readFileSync(p, 'utf8')).join('\n');
const reqInProto = new Set(protoText.match(/R-\d{3}/g) ?? []);
const scrInProto = new Set(protoText.match(/SCR-\d{2}/g) ?? []);

// ── 4 · the original process-deck must be untouched ─────────────────────────
const manifests = existsSync(P('plan/audit')) ? readdirSync(P('plan/audit')).filter((n) => /^process-deck-manifest-.*\.txt$/.test(n)).sort() : [];
let deckCheck = 'no manifest found';
if (!manifests.length) errors.push('No process-deck manifest in plan/audit/ — S00 must create one');
else if (!existsSync(PROCESS_DECK)) errors.push(`${PROCESS_DECK} is missing`);
else {
  const base = readFileSync(P('plan/audit', manifests.at(-1)), 'utf8').trim().split('\n');
  const now = manifest(PROCESS_DECK);
  const a = new Set(base), b = new Set(now);
  const removed = base.filter((l) => !b.has(l)), added = now.filter((l) => !a.has(l));
  if (removed.length || added.length) {
    errors.push(`process-deck CHANGED since ${manifests.at(-1)}: ${removed.length} entries gone/modified, ${added.length} new/modified`);
    deckCheck = `CHANGED (${removed.length} −, ${added.length} +)\n\n` + [...removed.slice(0, 10).map((l) => `- ${l}`), ...added.slice(0, 10).map((l) => `+ ${l}`)].join('\n');
  } else deckCheck = `unchanged (${now.length} entries, vs ${manifests.at(-1)})`;
}
// and nothing in deck/ may point back at it or at the website
const outbound = walk(P('deck'), (p) => /\.(mjs|js|json|html|py|sh)$/.test(p) && !p.includes('/_origin/'))
  .filter((p) => /\/Users\/[^/]+\/Developer\/(process-deck|portfolio-case-studies|pcs-)|\.\.\/portfolio-case-studies|gate-key|web-bundle\.mjs|pd-process\.mjs|ship\.mjs/.test(readFileSync(p, 'utf8')))
  .map((p) => p.slice(ROOT.length + 1));
if (outbound.length) errors.push(`deck/ references process-deck or the website: ${outbound.join(', ')}`);

// ── 5 · report ─────────────────────────────────────────────────────────────
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—');
const ownerRows = Object.entries(owners).sort(([a], [b]) => a.localeCompare(b))
  .map(([o, v]) => `| ${o} | ${sessionStatus[o] ?? (o === 'S06' ? `${sessionStatus.S06a ?? '?'} / ${sessionStatus.S06b ?? '?'}` : '—')} | ${v.done}/${v.total} |`);
const md = `# Audit · ${today}

Generated by \`node tools/audit.mjs\`. **${errors.length} error(s) · ${warnings.length} warning(s)**

## Requirements (${reqs.length})

| Status | Count |
|---|---|
${VALID.map((s) => `| ${s} | ${byStatus[s]} |`).join('\n')}

Done: **${pct(byStatus.Done, reqs.length)}**

| Owner | Session status | Done |
|---|---|---|
${ownerRows.join('\n')}

## Deck

- Slides: **${counted.length}** / ${SLIDE_LIMIT} (+ ${slides.length - counted.length} bookends)
- Requirements referenced by slides: ${reqInDeck.size}
- Standard-path A/B share: ${scopeShare === null ? 'n/a' : pct(Math.round(scopeShare * 100), 100)}

## Prototype

- Files scanned: ${protoFiles.length} · requirements referenced: ${reqInProto.size} · screens referenced: ${[...scrInProto].sort().join(', ') || '—'}

## Guardrails

- \`~/Developer/process-deck\`: ${deckCheck}
- Outbound references from \`deck/\`: ${outbound.length ? outbound.join(', ') : 'none'}

## Errors
${errors.length ? errors.map((e) => `- ❌ ${e}`).join('\n') : '- none'}

## Warnings
${warnings.length ? warnings.map((w) => `- ⚠️ ${w}`).join('\n') : '- none'}
${notes.length ? `\n## Notes\n${notes.map((n) => `- ${n}`).join('\n')}\n` : ''}`;

writeFileSync(P('plan/audit', `AUDIT-${today}.md`), md);
console.log(`Audit ${today}: ${reqs.length} requirements (${byStatus.Done} done, ${byStatus.Open} open) · ${counted.length}/${SLIDE_LIMIT} slides (+${slides.length - counted.length} bookends) · process-deck ${deckCheck.split('\n')[0]}`);
for (const e of errors) console.log(`  ERROR  ${e}`);
for (const w of warnings) console.log(`  warn   ${w}`);
console.log(`→ plan/audit/AUDIT-${today}.md`);
process.exit(errors.length ? 1 : 0);
