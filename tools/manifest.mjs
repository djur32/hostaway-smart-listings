// Fingerprint a folder: one line per file, "sha1 size relative/path", sorted.
// Used by S00 (before/after copying process-deck) and by audit.mjs (proof the original never changed).
// Usage: node tools/manifest.mjs <dir> [--out file]
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const EXCLUDE = new Set(['qa', 'export', 'node_modules', '.DS_Store']);

export function manifest(root) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (EXCLUDE.has(name)) continue;
      const p = join(dir, name);
      const st = lstatSync(p);
      if (st.isSymbolicLink()) { out.push(`symlink - ${relative(root, p)}`); continue; }
      if (st.isDirectory()) { walk(p); continue; }
      const sha = createHash('sha1').update(readFileSync(p)).digest('hex');
      out.push(`${sha} ${st.size} ${relative(root, p)}`);
    }
  };
  walk(root);
  const key = (l) => l.split(' ').slice(2).join(' '); // the path (may contain spaces)
  return out.sort((a, b) => key(a).localeCompare(key(b)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  const i = process.argv.indexOf('--out');
  const lines = manifest(dir).join('\n') + '\n';
  if (i > -1) writeFileSync(process.argv[i + 1], lines); else process.stdout.write(lines);
}
