#!/usr/bin/env node
/* ============================================================================
   BUILD · one content source, one theme (Hospitable).

     node tools/build.mjs            → src/pages/hospitable.html, index.html (a redirect)
     node tools/build.mjs --quiet    → same, warnings only
     Exit code 1 when the lint finds an ERROR (more than 50 slides, a raw colour).

   First it syncs the design system's tokens (ds/tokens.css, S02) into
   src/kit/ds/tokens.css (tools/sync-ds.mjs).

   Assembles src/pages/shell.html with every src/slides/NN-*.html in filename
   order, links every src/slides/*.css and every theme skin, and writes one
   entry module that statically imports the engine, every atmosphere and every
   slide module before calling boot(), so all registrations exist first.

   Then lints what a presenter would regret: missing attributes, a raw colour
   outside tokens, dashes the house style forbids, missing screenshots,
   duplicate ids, and slides that carry too many words to be read. Details
   (<template class="more">, CONTRACT §16.1) are linted panel by panel, never
   counted on their slide's wall, and every door must find its detail.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { GLYPH_NAMES } from '../src/kit/glyphs.js';
import { syncDs } from './sync-ds.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src');

/** build({ suffix, parts, quiet, kit }) → { files: {hospitable}, warnings, errors }
 *  suffix: write src/pages/<suffix>-<theme>.html instead of <theme>.html (private QA builds)
 *  parts:  array of filename prefixes to include (e.g. ['00','10']); default all
 *  kit:    build the _*.html component gallery instead of the deck            */
export function build({ suffix = '', parts: only = null, quiet = false, kit = false } = {}) {
const DS = syncDs();
const rel = (p) => path.relative(path.join(SRC, 'pages'), p).split(path.sep).join('/');

const slidesDir = path.join(SRC, 'slides');
const pick = (ext) => fs.readdirSync(slidesDir).filter((f) => (kit ? new RegExp(`^_.*\\.${ext}$`) : new RegExp(`^\\d\\d.*\\.${ext}$`)).test(f))
  .filter((f) => !only || only.some((p) => f.startsWith(p))).sort();
const parts = pick('html');
const cssParts = pick('css');
const jsParts = pick('js');
const themeCss = fs.readdirSync(path.join(SRC, 'kit/themes')).filter((f) => f.endsWith('.css')).sort();
const atmosJs = fs.readdirSync(path.join(SRC, 'kit/atmos')).filter((f) => f.endsWith('.js')).sort();

const warnings = [], errors = [];
const warn = (file, msg) => warnings.push(`  ${file}: ${msg}`);
const fail = (file, msg) => errors.push(`  ${file}: ${msg}`);
const SLIDE_LIMIT = 50;                          // R-185: the Everything path never runs past 50

/* ── assemble ───────────────────────────────────────────────────────────── */
let slidesHtml = '';
for (const f of parts) {
  const html = fs.readFileSync(path.join(slidesDir, f), 'utf8');
  slidesHtml += `\n<!-- ═════════════ ${f} ═════════════ -->\n${html.trim()}\n`;
}
const styles = [
  ...themeCss.map((f) => `<link rel="stylesheet" href="${rel(path.join(SRC, 'kit/themes', f))}">`),
  ...cssParts.map((f) => `<link rel="stylesheet" href="${rel(path.join(slidesDir, f))}">`),
].join('\n');
// Modules load independently: one broken slide module logs an error and the
// rest of the deck still boots. Registration order does not matter.
const mods = ['../kit/hc.js', ...atmosJs.map((f) => `../kit/atmos/${f}`), ...jsParts.map((f) => `../slides/${f}`)];
/* No cache-busting query here, and it must stay that way. A stamped '../kit/engine.js?v=x'
   is a different module URL from the plain '../kit/engine.js' every slide module imports,
   so the two resolve to two separate instances of the engine: the slides register their
   atmospheres and their motion into one, and boot() runs in the other. On 27 Sep that cost
   the deck its whole atmosphere layer. The server already sends no-store. */
const entry = `<script type="module">
import { boot } from '../kit/engine.js';
const mods = ${JSON.stringify(mods)};
const res = await Promise.allSettled(mods.map((m) => import(m)));
res.forEach((r, i) => { if (r.status === 'rejected') console.error('[deck] module failed to load', mods[i], String(r.reason)); });
boot();
</script>`;

const shell = fs.readFileSync(path.join(SRC, 'pages/shell.html'), 'utf8');
const files = {};
for (const [theme, scheme] of [['hospitable', 'light']]) {
  const out = shell.replace('{{THEME}}', theme).replace('{{SCHEME}}', scheme)
    .replace('<!-- @styles -->', styles).replace('<!-- @slides -->', slidesHtml).replace('<!-- @entry -->', entry);
  const name = `${suffix ? suffix + '-' : kit ? 'kit-' : ''}${theme}.html`;
  const dest = path.join(SRC, 'pages', name); const tmp = dest + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, out); fs.renameSync(tmp, dest);          // atomic: nobody reads half a file
  files[theme] = name;
}
if (suffix || kit) { const r = lint(); return { files, warnings: r, errors }; }

/* ── the landing page: one theme, so it only forwards (keeping any #slide) ── */
fs.writeFileSync(path.join(SRC, 'pages/index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Smart Listings · Head of Design Case Study</title><link rel="icon" href="data:,"><script>location.replace('hospitable.html' + location.search + location.hash)</script><meta http-equiv="refresh" content="0; url=hospitable.html"></head><body></body></html>\n`);
{ const w = lint(); return { files, warnings: w, errors }; }

/* ── lint ───────────────────────────────────────────────────────────────── */
function lint() {
const ids = new Map();
/* the details of every slide in the deck (and the kit), so a door may open a detail that
   another part holds ("slide-id/ID") and a part QA'd alone still resolves its doors */
const TPL_RE = /<template\b([^>]*)>([\s\S]*?)<\/template>/g;
const isMore = (attrs) => /\bclass="[^"]*\bmore\b[^"]*"/.test(attrs);
const attr = (a, k) => (a.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
const allMore = new Map();                    // slide id → Set(detail ids)
const allDoors = [];                          // { slide, ref }
for (const x of fs.readdirSync(slidesDir).filter((f) => /^(\d\d|_kit).*\.html$/.test(f))) {
  const h = fs.readFileSync(path.join(slidesDir, x), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const [, a, b] of h.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>\s*(?=<section\b|$)/g)) {
    const sid = attr(a, 'data-id'); if (!sid) continue;
    const set = new Set();
    for (const [, ta] of b.matchAll(TPL_RE)) if (isMore(ta) && attr(ta, 'data-more')) set.add(attr(ta, 'data-more'));
    allMore.set(sid, set);
    for (const [, ref] of b.replace(TPL_RE, '').matchAll(/\bdata-more="([^"]+)"/g)) allDoors.push({ slide: sid, ref });
  }
}
const resolve = (from, ref) => { const k = ref.indexOf('/'); return k > 0 ? allMore.get(ref.slice(0, k))?.has(ref.slice(k + 1)) : allMore.get(from)?.has(ref); };
// a tag, read with its quotes: an attribute value may hold a ">" (data-wires="me>pm")
const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
/* a part's cover (.hc-cover) is its own page on the wall (the slide's first beat lifts it), so its
   words are counted on their own, never added to the slide's */
const wallText = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<header class="hc-cover"[\s\S]*?<\/header>/g, ' ').replace(/<p class="hc-src"[\s\S]*?<\/p>/g, ' ').replace(/<figcaption[\s\S]*?<\/figcaption>/g, ' ').replace(/<aside class="notes"[\s\S]*?<\/aside>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(TAG, ' ');
const countWords = (t) => t.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
/* The orchestration graph (CONTRACT §16.5) shows one composition at a time, and only the pieces
   that composition places; the tray's names are for screen readers. So its words on the wall are
   the largest single composition plus the labels of the pieces it uses, not the sum of them all.
   Returns the html without the graph's text, and that largest count. */
function orchWords(html) {
  let extra = 0;
  const OPEN = /<div\b(?:[^>"']|"[^"]*")*\bclass="orch\b[^"]*"(?:[^>"']|"[^"]*")*>/g;
  const starts = [...html.matchAll(OPEN)].map((m) => [m.index, /orch--compact/.test(m[0])]);
  starts.forEach(([a, compact], k) => {
    const seg = html.slice(a, starts[k + 1]?.[0] ?? html.length);
    const labels = new Map();
    for (const [, ul] of seg.matchAll(/<ul\b[^>]*class="[^"]*\borch__tray\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/g))
      for (const [, la, lt] of ul.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) { const id = attr(la, 'data-piece'); if (id) labels.set(id, attr(la, 'data-kind') === 'me' || compact ? '' : lt); }
    for (const [, ca, cb] of seg.matchAll(/<div\b((?:[^>"']|"[^"]*")*class="[^"]*\borch__comp\b[^"]*"(?:[^>"']|"[^"]*")*)>([\s\S]*?)<\/div>/g)) {
      const used = (attr(ca, 'data-place') || '').split(/[,\n]/).map((x) => x.trim().split(/\s+/)[0]).filter(Boolean);
      const own = compact ? 0 : countWords(wallText(cb));       // compact graphs show marks only
      extra = Math.max(extra, own + used.reduce((n, id) => n + countWords(wallText(labels.get(id) || '')), 0));
    }
  });
  const stripped = html.replace(/<ul\b[^>]*class="[^"]*\borch__tray\b[^"]*"[^>]*>[\s\S]*?<\/ul>/g, ' ').replace(/<div\b(?:[^>"']|"[^"]*")*class="[^"]*\borch__comp\b[^"]*"(?:[^>"']|"[^"]*")*>[\s\S]*?<\/div>/g, ' ');
  return { stripped, extra };
}
const wallWords = (html) => { const o = orchWords(html); return { text: wallText(html), n: countWords(wallText(o.stripped)) + o.extra }; };
const notesOf = (html) => (html.match(/<aside class="notes"[\s\S]*?<\/aside>/g) || []).join(' ').replace(TAG, ' ');
const shotsDir = path.join(SRC, 'assets/shots');
const REQUIRED = ['data-id', 'data-title', 'data-stage', 'data-min'];
/* The Hospitable contract (CONTRACT.md §2): every slide says which part of the story it is,
   which path keeps it (S Short · St Standard · E Everything), which angle it serves (A, B,
   both, none), which requirements it answers and where it lives in Notion. */
const CASE_ATTRS = ['data-part', 'data-path', 'data-angle', 'data-req'];
const PARTS = ['open', 'discovery', 'research', 'ia', 'concept', 'design', 'test', 'next', 'close', 'appendix'];
let slideCount = 0, bookends = 0;
for (const f of parts) {
  const html = fs.readFileSync(path.join(slidesDir, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const sections = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>\s*(?=<section\b|$)/g)];
  for (const [, attrs, body] of sections) {
    if (!/\bclass="[^"]*\bs\b/.test(attrs)) continue;
    const id = (attrs.match(/data-id="([^"]+)"/) || [])[1] || '(no id)';
    for (const r of REQUIRED) if (!attrs.includes(r + '=')) warn(f, `${id} missing ${r}`);
    if (!kit) {
      // the bookends (the opening plate and the closing "Thanks.", data-bookend) frame the talk; R-185 counts the content slides
      if (!/\bdata-bookend\b/.test(attrs)) slideCount++; else bookends++;
      for (const r of CASE_ATTRS) if (!attrs.includes(r + '=')) warn(f, `${id} missing ${r}`);
      if (!/\bdata-notion="[^"]+"/.test(attrs)) warn(f, `${id} has no data-notion: every slide is backed by a Notion page (R-186)`);
      const part = attr(attrs, 'data-part'), pth = attr(attrs, 'data-path'), ang = attr(attrs, 'data-angle');
      if (part && !PARTS.includes(part)) warn(f, `${id} data-part="${part}" is not one of ${PARTS.join(', ')}`);
      if (pth && !/^(S|St|E)$/.test(pth)) warn(f, `${id} data-path="${pth}" must be S, St or E`);
      if (ang && !/^(A|B|both|none)$/.test(ang)) warn(f, `${id} data-angle="${ang}" must be A, B, both or none`);
    }
    if (ids.has(id)) warn(f, `duplicate data-id ${id} (also in ${ids.get(id)})`); ids.set(id, f);
    // a detail is a layer below the slide: its words are not on the slide's wall
    const own = body.replace(TPL_RE, '');
    if (!/class="notes"/.test(own)) warn(f, `${id} has no speaker notes`);
    // the stage label is hidden everywhere but the appendix (kit rule), so it isn't "on the wall"
    const shown = (attrs.match(/data-stage="(\d)"/) || [])[1] === '8' ? own : own.replace(/<span class="eyebrow__stage">[\s\S]*?<\/span>/g, '');
    const { text: visible, n: words } = wallWords(shown);
    if (words > 110) warn(f, `${id} carries ${words} words on the wall (aim ≤ 80, footnotes and captions excluded; split it or move detail into a <template class="more">)`);
    if (/[—–]/.test(visible)) warn(f, `${id} uses an em or en dash in visible text`);
    // Antonio, 3 Oct: source lines say what the evidence is, in plain words. No file paths, no IDs, no timestamps.
    for (const m of own.matchAll(/<p class="hc-src"[\s\S]*?<\/p>/g)) {
      const t = m[0].replace(/<span class="more-link"[\s\S]*?<\/span>/g, '').replace(TAG, ' ');
      const bad = t.match(/[\w-]+\/[\w./-]+|\b[\w-]+\.(md|csv|json|py|tsx?|svg|png|webp)\b|\b(E|HE|HS|HS-L|HS-A|INT|D|R|I|H|K|T|OQ|RC|J|P|Q|CMP|SCR)-\d+|\[\d+:\d+\]/);
      if (bad) warn(f, `${id} source line names "${bad[0]}": say what the evidence is in plain words (no paths, IDs or timestamps)`);
    }
    // Antonio, 2026-09-26: "don't use em dashes anywhere, really important". The notes are
    // what he reads from on the day, so they are held to the same rule as the wall.
    if (/—/.test(notesOf(own))) warn(f, `${id} uses an em dash in its speaker notes`);
    // ── details: one layer, at most two short panels, every door finds its detail ──
    const seen = new Set();
    for (const [, ta, tb] of body.matchAll(TPL_RE)) {
      if (!isMore(ta)) continue;
      const mid = attr(ta, 'data-more');
      if (!mid) { warn(f, `${id} has a <template class="more"> with no data-more id`); continue; }
      const where = `${id} › detail "${mid}"`;
      if (seen.has(mid)) warn(f, `${where} is defined twice on this slide`); seen.add(mid);
      if (!attr(ta, 'data-title')) warn(f, `${where} has no data-title (the sheet's heading)`);
      if (/\bdata-more="/.test(tb)) warn(f, `${where} has a door inside it: details are one layer deep, nothing opens from inside one`);
      if (/<section\b/.test(tb)) warn(f, `${where} contains a <section>: use divs inside a detail`);
      const starts = [...tb.matchAll(/<[a-z][\w-]*\b[^>]*\bclass="[^"]*\bmore__panel\b[^"]*"[^>]*>/g)].map((m) => m.index);
      if (!starts.length) warn(f, `${where} has no .more__panel (wrap its content in one)`);
      if (starts.length > 2) warn(f, `${where} has ${starts.length} panels: at most two short panels`);
      const panels = starts.length ? starts.map((a, k) => tb.slice(a, starts[k + 1] ?? tb.length)) : [tb];
      panels.forEach((pn, k) => {
        const { text: pw, n } = wallWords(pn);
        const label = panels.length > 1 ? `${where}, panel ${k + 1}` : where;
        if (n > 90) warn(f, `${label} carries ${n} words (aim ≤ 45, warn above 90: split it or cut it)`);
        if (/[—–]/.test(pw)) warn(f, `${label} uses an em or en dash in visible text`);
        if (/—/.test(notesOf(pn))) warn(f, `${label} uses an em dash in its notes`);
      });
      const opened = allDoors.some((d) => { const k = d.ref.indexOf('/'); return k > 0 ? d.ref.slice(0, k) === id && d.ref.slice(k + 1) === mid : d.slide === id && d.ref === mid; });
      if (!opened) warn(f, `${where} has no door: give an element on this slide data-more="${mid}" (or open it from another slide with data-more="${id}/${mid}")`);
    }
    for (const [, ref] of own.matchAll(/\bdata-more="([^"]+)"/g)) if (!resolve(id, ref)) warn(f, `${id} has a door to "${ref}", but no <template class="more" data-more="${ref.includes('/') ? ref.split('/')[1] : ref}"> ${ref.includes('/') ? 'on ' + ref.split('/')[0] : 'on this slide'}`);
    for (const [, gname] of body.matchAll(/\bdata-glyph="([^"]+)"/g)) if (!GLYPH_NAMES.includes(gname)) warn(f, `${id} uses glyph "${gname}", which kit/glyphs.js does not draw (${GLYPH_NAMES.join(', ')})`);
    for (const m of body.matchAll(/data-shot="([^"]+)"([^>]*)/g)) {
      const pair = /data-pair/.test(m[2]);
      const files = pair ? [`${m[1]}-light.webp`, `${m[1]}-dark.webp`] : [`${m[1]}.webp`];
      for (const x of files) if (!fs.existsSync(path.join(shotsDir, x))) warn(f, `${id} missing shot ${x}`);
    }
    if (/<img\b[^>]*\ssrc="/.test(body)) warn(f, `${id} has an <img src>: use data-shot (or data-src) so it loads only when its slide is near`);
    for (const m of body.matchAll(/data-logo="([^"]+)"/g)) if (!fs.existsSync(path.join(SRC, 'assets/logos', m[1] + '.svg'))) warn(f, `${id} missing logo ${m[1]}`);
  }
}
if (!kit && !only && slideCount > SLIDE_LIMIT) fail('deck', `${slideCount} slides: the limit is ${SLIDE_LIMIT} (R-185). Cut, or move one into a detail (<template class="more">)`);
/* Every custom property the kit, the themes and the slide parts define between them. A var() on
   anything outside this set is a typo that fails silently at runtime. Properties a rule sets on
   itself count too, which is why the slide parts are read here as well as the kit. */
const TOKENS = new Set();
for (const p of [
  ...['kit/tokens.css', 'kit/base.css', 'kit/deck.css', 'kit/components.css', 'kit/plan.css', 'kit/hc.css', 'kit/ds/tokens.css'].map((x) => path.join(SRC, x)),
  ...fs.readdirSync(path.join(SRC, 'kit/themes')).filter((x) => x.endsWith('.css')).map((x) => path.join(SRC, 'kit/themes', x)),
  ...cssParts.map((x) => path.join(slidesDir, x)),
]) {
  if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/(--[a-z0-9-]+)\s*:/g)) TOKENS.add(m[1]);
}
/* A slide may also set a property from its markup, style="--at: .4", or from its module, with
   setProperty or a gsap tween. Those are definitions too, so read them before judging a var(). */
for (const f of [...parts, ...fs.readdirSync(slidesDir).filter((x) => /^(\d\d|_kit).*\.js$/.test(x))]) {
  const s = fs.readFileSync(path.join(slidesDir, f), 'utf8');
  // every property in a style attribute, not just the first: style="--n: 3; --on: 2" sets both
  for (const m of s.matchAll(/style="([^"]*)"/g)) for (const d of m[1].matchAll(/(--[a-z0-9-]+)\s*:/g)) TOKENS.add(d[1]);
  for (const m of s.matchAll(/(?:setProperty\(|['"`])(--[a-z0-9-]+)['"`]?\s*[,:]/g)) TOKENS.add(m[1]);
}
for (const f of ['kit/gen.js', 'kit/engine.js', 'kit/motion.js', 'kit/orch.js', 'kit/thread.js', 'kit/plan.js', 'kit/hc.js']) {
  const p = path.join(SRC, f); if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/(--[a-z0-9-]+)/g)) TOKENS.add(m[1]);
}

for (const f of [...cssParts, ...parts]) {
  const s = fs.readFileSync(path.join(slidesDir, f), 'utf8').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hex = s.match(/#[0-9a-fA-F]{3,8}\b(?![^<]*>)/g)?.filter((h) => !/^#[0-9a-f]{3,8}$/i.test(h) || true) || [];
  // CSS: a hex inside a declaration value. HTML: a hex inside a style="" or a fill/stroke attribute.
  const rawHex = f.endsWith('.css')
    ? [...s.matchAll(/:[^;{}]*?(#[0-9a-fA-F]{3,8})\b/g)].map((m) => m[1])
    : [...s.matchAll(/(?:style="[^"]*?|\b(?:fill|stroke|stop-color|color)=")(#[0-9a-fA-F]{3,8})\b/g)].map((m) => m[1]);
  if (rawHex.length) fail(f, `raw colour ${[...new Set(rawHex)].join(' ')}: use a token (colours come from ds/tokens.css through src/kit/tokens.css)`);
  const rawFn = [...s.matchAll(/(?:^|[\s:(,])((?:rgba?|hsla?|oklch|oklab)\(\s*[\d.]+[^)]*\))/g)].map((m) => m[1]);
  if (rawFn.length) fail(f, `raw colour ${[...new Set(rawFn)].slice(0, 3).join(' ')}: use a token`);
  const tiny = [...s.matchAll(/font-size:\s*(\d+)px/g)].map((m) => +m[1]).filter((n) => n < 15);
  if (tiny.length) warn(f, `font-size below 15px (${[...new Set(tiny)].join(', ')}): the wall has to be read from across a room`);
  /* A var() on a token that was never defined resolves to nothing, and for a gap that means the
     two things touch. It cost us a collapsed row-gap on concept-inbox-context before anyone
     noticed, because --s-7 is not on the scale, so the build says so now. */
  const undef = [...new Set([...s.matchAll(/var\((--[a-z0-9-]+)[,)]/g)].map((m) => m[1]))].filter((t) => !TOKENS.has(t));
  if (undef.length) warn(f, `var() on an undefined token: ${undef.join(' ')}`);
}

/* No raw colour in the kit either: every value is a var() into the design system. The only
   files allowed a hex are the design system's own (src/kit/ds/*). Canvas code in JS reads
   tokens through G.color(), so only stylesheets are checked here. */
for (const x of ['kit/tokens.css', 'kit/base.css', 'kit/deck.css', 'kit/components.css', 'kit/plan.css', 'kit/responsive.css', 'kit/hc.css',
  ...fs.readdirSync(path.join(SRC, 'kit/themes')).filter((y) => y.endsWith('.css')).map((y) => 'kit/themes/' + y)]) {
  const p = path.join(SRC, x); if (!fs.existsSync(p)) continue;
  const css = fs.readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)/g, 'url()');
  const hex = [...css.matchAll(/:[^;{}]*?(#[0-9a-fA-F]{3,8})\b/g)].map((m) => m[1]);
  if (hex.length) fail(x, `raw colour ${[...new Set(hex)].join(' ')}: the kit takes its colours from the design system`);
}
/* The deck asks the design system for these names. When S02's ds/tokens.css replaces the
   provisional file, any name it does not define shows up here instead of failing silently. */
{
  const asked = new Set();
  for (const x of ['kit/tokens.css', 'kit/hc.css', 'kit/deck.css', 'kit/components.css', 'kit/base.css', ...fs.readdirSync(path.join(SRC, 'kit/themes')).filter((y) => y.endsWith('.css')).map((y) => 'kit/themes/' + y)]) {
    const p = path.join(SRC, x); if (!fs.existsSync(p)) continue;
    for (const m of fs.readFileSync(p, 'utf8').matchAll(/var\((--(?:color|font-family|font-weight|radius)-[a-z0-9-]+)/g)) asked.add(m[1]);
  }
  const missing = [...asked].filter((t) => !DS.tokens.has(t));
  if (missing.length) warn(`ds/tokens.css (${DS.source})`, `does not define ${missing.join(' ')}: map them in src/kit/tokens.css`);
}

// every in-slide jump must land on a slide that exists (checked against all parts,
// so a part QA'd alone can still link to another part)
{
  const all = new Set();
  const src = fs.readdirSync(slidesDir).filter((x) => /^(\d\d|_kit).*\.html$/.test(x)).map((x) => fs.readFileSync(path.join(slidesDir, x), 'utf8'));
  for (const h of src) for (const m of h.matchAll(/<section\b[^>]*data-id="([^"]+)"/g)) all.add(m[1]);
  for (const f of parts) {
    const h = fs.readFileSync(path.join(slidesDir, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    for (const m of h.matchAll(/data-goto="([^"]+)"/g)) if (!all.has(m[1]) && !/^\d+$/.test(m[1])) warn(f, `jump to "${m[1]}", which is not a slide`);
  }
}

// Lumen is flat light (CONTRACT §11): no glow that bleeds outside a shape, in any slide or skin
{
  const files = [...fs.readdirSync(slidesDir).filter((x) => /^\d\d.*\.(css|js|html)$/.test(x)).map((x) => [x, path.join(slidesDir, x)]),
    ...['kit/themes/hospitable.css', 'kit/hc.css', 'kit/components.css', 'kit/deck.css', 'kit/gen.js', 'kit/thread.js'].map((x) => [x, path.join(SRC, x)])];
  for (const [name, file] of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
    const hits = [];
    if (/drop-shadow\(/.test(src)) hits.push('drop-shadow');
    if (/shadowBlur\s*=\s*(?!0\b)[^;\n]+/.test(src)) hits.push('canvas shadowBlur');
    if (/text-shadow:\s*(?!none)[^;]*\d+px/.test(src)) hits.push('text-shadow');
    if (hits.length) warn(name, `glow (${hits.join(', ')}): flat light only, a gradient inside the shape is fine (CONTRACT §11)`);
  }
}

// parts must not define the same class: all slide CSS is global, and a part QA'd alone
// never sees the other part's rule (this is how .mx broke the research matrix)
{
  const kitCls = new Set();
  for (const d of ['kit', 'kit/themes']) for (const f of fs.readdirSync(path.join(SRC, d)).filter((x) => x.endsWith('.css')))
    for (const m of fs.readFileSync(path.join(SRC, d, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z][\w-]*)/g)) kitCls.add(m[1]);
  const owner = new Map();
  for (const f of fs.readdirSync(slidesDir).filter((x) => /^\d\d.*\.css$/.test(x))) {
    const css = fs.readFileSync(path.join(slidesDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, sel] of css.matchAll(/([^{}]+)\{/g)) {
      if (sel.trim().startsWith('@')) continue;
      for (const [, c] of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
        if (kitCls.has(c) || /^is-|^has-/.test(c)) continue;
        const p = f.slice(0, 2); const prev = owner.get(c);
        if (prev && prev !== p) warn(f, `class .${c} is also defined by part ${prev}: rename one (prefix it with the part)`);
        else owner.set(c, p);
      }
    }
  }
}
if (!quiet) {
  console.log(`built ${Object.values(files).join(' + ')} · tokens from ${DS.source === 'ds' ? 'ds/tokens.css' : 'the last synced copy'} · ${ids.size} slides (${slideCount} counted, ${bookends} bookends) from ${parts.length} parts, ${cssParts.length} css, ${jsParts.length} js, ${themeCss.length} skins, ${atmosJs.length} atmospheres`);
  if (warnings.length) { console.log(`${warnings.length} warning(s):`); console.log(warnings.join('\n')); } else console.log('0 warnings');
  if (errors.length) { console.log(`${errors.length} ERROR(s):`); console.log(errors.join('\n')); }
}
return warnings;
}
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--parts');
  // --parts never overwrites the shared pages: it writes src/pages/_parts-<theme>.html
  const r = build({ quiet: a.includes('--quiet'), kit: a.includes('--kit'), parts: i >= 0 ? a[i + 1].split(',') : null, suffix: i >= 0 ? '_parts' : '' });
  if (r.errors?.length) { if (a.includes('--quiet')) console.log(r.errors.join('\n')); process.exit(1); }
}
