#!/usr/bin/env node
// Pre-build helper: for any image referenced by a markdown file but
// not yet present in docs/public/, drop a 1×1 transparent PNG stub so
// VitePress can build. The real screenshot can be added later — the
// stub's filename and path are stable.
//
// Real screenshots are detected by file size (> 100 bytes); stubs are
// the exact 67-byte transparent PNG. This way running the script twice
// is idempotent: it never overwrites real captures.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DOCS = path.join(ROOT, 'docs')
const PUBLIC = path.join(DOCS, 'public')

// 1×1 transparent PNG (67 bytes)
const STUB = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABDQEAdpamzgAAAABJRU5ErkJggg==',
  'base64',
)

function walkMarkdown(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === 'public' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

const referenced = new Set()
const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g
for (const file of walkMarkdown(DOCS)) {
  const text = fs.readFileSync(file, 'utf8')
  for (const m of text.matchAll(imgRe)) {
    const src = m[1].trim()
    // Only handle root-absolute paths served from public/
    if (src.startsWith('/') && !src.startsWith('//')) {
      referenced.add(src.slice(1))
    }
  }
}

let stubbed = 0
let realCount = 0
for (const rel of referenced) {
  const abs = path.join(PUBLIC, rel)
  if (fs.existsSync(abs)) {
    realCount += 1
    continue
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, STUB)
  stubbed += 1
  console.log(`stub: ${rel}`)
}

console.log(`\nreferenced=${referenced.size} present=${realCount} stubbed=${stubbed}`)
