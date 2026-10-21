#!/usr/bin/env node
/* ============================================================================
   DIST · the light build to present from.

     node tools/dist.mjs      → dist/pages/hostaway.html, index.html

   The source pages load ~30 files (kit, themes, 11+ slide stylesheets and
   modules, 8 vendor scripts). The dist pages load four: one minified
   stylesheet, one minified bundle of the engine + every slide module, one
   vendor file (GSAP + plugins, already minified), and the page. Images,
   videos and fonts are shared with src/ through symlinks and still load only
   when their slide is near, so nothing is duplicated on disk.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const ESBUILD = process.env.ESBUILD || ['node_modules/.bin/esbuild']
  .map((p) => path.resolve(ROOT, p)).find((p) => fs.existsSync(p));
if (!ESBUILD) { console.error('esbuild not found: npm i -D esbuild, or set ESBUILD=/path/to/esbuild'); process.exit(1); }

const { warnings } = build({ quiet: true });
if (warnings.length) console.log(`lint (${warnings.length}):\n${warnings.join('\n')}\n`);

fs.rmSync(DIST, { recursive: true, force: true });
for (const d of ['pages', 'kit', 'vendor']) fs.mkdirSync(path.join(DIST, d), { recursive: true });
const link = (target, at) => fs.symlinkSync(path.relative(path.dirname(at), target), at);
link(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
link(path.join(SRC, 'data'), path.join(DIST, 'data'));
link(path.join(SRC, 'kit/fonts'), path.join(DIST, 'kit/fonts'));
link(path.join(SRC, 'kit/ds'), path.join(DIST, 'kit/ds'));            // the icon sprite (sync-ds)

const page = fs.readFileSync(path.join(SRC, 'pages/hostaway.html'), 'utf8');
const sheets = [...page.matchAll(/<link rel="stylesheet" href="\.\.\/([^"]+)">/g)].map((m) => m[1]);
const vendors = [...page.matchAll(/<script src="\.\.\/(vendor\/[^"]+)"><\/script>/g)].map((m) => m[1]);
const mods = JSON.parse(page.match(/const mods = (\[[^\]]*\]);/)[1]).map((m) => m.replace(/^\.\.\//, ''));

/* CSS: every sheet in cascade order, one file, minified */
/* tokens.css imports the design system's tokens into the lowest layer (@import … layer(ds)); an @import
   can't sit in the middle of one concatenated file, so it is inlined here as the same layer. */
const inlineDs = (css) => css.replace(/@import url\("ds\/([a-z]+\.css)"\) layer\(([a-z-]+)\);[^\n]*/g, (_, f, l) => `@layer ${l} {\n${fs.readFileSync(path.join(SRC, 'kit/ds', f), 'utf8')}\n}`);
const css = sheets.map((s) => `/* ${s} */\n` + inlineDs(fs.readFileSync(path.join(SRC, s), 'utf8'))).join('\n');
fs.writeFileSync(path.join(DIST, 'kit/deck.css'), css);
execFileSync(ESBUILD, [path.join(DIST, 'kit/deck.css'), '--minify', '--loader:.css=css', `--outfile=${path.join(DIST, 'kit/deck.min.css')}`, '--log-level=warning']);
fs.rmSync(path.join(DIST, 'kit/deck.css'));

/* JS: engine + atmospheres + every slide module, statically imported, one minified bundle */
const entry = `import { boot } from '../src/kit/engine.js';\n${mods.map((m) => `import '../src/${m}';`).join('\n')}\nboot();\n`;
fs.writeFileSync(path.join(DIST, 'entry.js'), entry);
execFileSync(ESBUILD, [path.join(DIST, 'entry.js'), '--bundle', '--minify', '--format=esm', '--target=es2022', `--outfile=${path.join(DIST, 'kit/deck.min.js')}`, '--log-level=warning']);
fs.rmSync(path.join(DIST, 'entry.js'));

/* vendor: GSAP and its plugins, already minified, one file in load order */
fs.writeFileSync(path.join(DIST, 'vendor/vendor.min.js'), vendors.map((v) => fs.readFileSync(path.join(SRC, v), 'utf8')).join(';\n'));

/* HTML: the same page, pointing at the four files, comments and indentation stripped */
const slim = (html) => html
  .replace(/<link rel="stylesheet" href="\.\.\/[^"]+">\n?/g, '')
  .replace(/<script src="\.\.\/vendor\/[^"]+"><\/script>\n?/g, '')
  .replace(/<script type="module">[\s\S]*?<\/script>/, '<script type="module" src="../kit/deck.min.js"></script>')
  .replace('</head>', '<link rel="stylesheet" href="../kit/deck.min.css">\n<script src="../vendor/vendor.min.js"></script>\n</head>')
  .replace(/<!--(?!\[)[\s\S]*?-->/g, '')
  .replace(/^[ \t]+/gm, '')
  .replace(/\n{2,}/g, '\n');
for (const t of ['hostaway']) fs.writeFileSync(path.join(DIST, `pages/${t}.html`), slim(fs.readFileSync(path.join(SRC, `pages/${t}.html`), 'utf8')));
fs.copyFileSync(path.join(SRC, 'pages/index.html'), path.join(DIST, 'pages/index.html'));

/* report: what a browser downloads to open the deck, before and after */
const gz = (b) => zlib.gzipSync(b).length;
const size = (files) => files.reduce((a, f) => { const b = fs.readFileSync(f); return [a[0] + b.length, a[1] + gz(b)]; }, [0, 0]);
const kb = ([r, z]) => `${(r / 1024).toFixed(0)} KB (${(z / 1024).toFixed(0)} KB gzipped)`;
const before = [path.join(SRC, 'pages/hostaway.html'), ...sheets.map((s) => path.join(SRC, s)), ...vendors.map((v) => path.join(SRC, v)),
  path.join(SRC, 'kit/engine.js'), path.join(SRC, 'kit/motion.js'), path.join(SRC, 'kit/gen.js'), path.join(SRC, 'kit/thread.js'), ...mods.map((m) => path.join(SRC, m))];
const after = ['pages/hostaway.html', 'kit/deck.min.css', 'kit/deck.min.js', 'vendor/vendor.min.js'].map((f) => path.join(DIST, f));
console.log(`source page: ${before.length} files, ${kb(size(before))}`);
console.log(`dist page:   ${after.length} files, ${kb(size(after))}`);
console.log(`→ dist/pages/hostaway.html · dist/pages/index.html`);
