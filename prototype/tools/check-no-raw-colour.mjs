#!/usr/bin/env node
// Fails if prototype/src contains a raw colour (hex, rgb(), hsl()). Tokens only (CONVENTIONS §6.1, ds/DS.md).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
const root = new URL('../src', import.meta.url).pathname
const bad = []
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f)
  if (statSync(p).isDirectory()) return walk(p)
  if (!/\.(tsx?|css)$/.test(f)) return
  readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
    if (/#[0-9a-fA-F]{3,8}\b(?![-\w])/.test(line.replace(/href=\{?[`'"]#[^`'"]*[`'"]/g, '').replace(/#i-|#ch-/g, '')) && !/^\s*(\/\/|\/?\*)/.test(line)) bad.push(`${p}:${i + 1}: ${line.trim()}`)
    if (/\b(rgb|rgba|hsl|hsla)\(/.test(line)) bad.push(`${p}:${i + 1}: ${line.trim()}`)
  })
})
walk(root)
if (bad.length) { console.error('Raw colours found:\n' + bad.join('\n')); process.exit(1) }
console.log('No raw colours in prototype/src ✓')
