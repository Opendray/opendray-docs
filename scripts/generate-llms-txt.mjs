#!/usr/bin/env node
// Generate /llms.txt (index) and /llms-full.txt (concatenated full text)
// from the docs/ corpus, following the llmstxt.org convention.
//
// Output:
//   docs/public/llms.txt        — index, one line per page with title + tldr
//   docs/public/llms-full.txt   — all docs concatenated as plain markdown
//
// Convention: https://llmstxt.org/
// Each entry has the page URL + short description (tldr from frontmatter).
//
// Run: node scripts/generate-llms-txt.mjs
// Or:  pnpm run llms (wired in package.json)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DOCS = path.join(ROOT, 'docs')
const PUBLIC = path.join(DOCS, 'public')

const SITE = 'https://docs.opendray.dev'

/**
 * Parse YAML frontmatter (very small subset — enough for our schema).
 * Returns { frontmatter: object, body: string }.
 * Doesn't try to be a real YAML parser; handles strings, arrays of strings,
 * and scalar values on one line.
 */
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!m) return { frontmatter: {}, body: src }
  const yaml = m[1]
  const body = m[2]
  const fm = {}
  let key = null
  for (const raw of yaml.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    const indent = raw.match(/^(\s*)/)[1].length
    const line = raw.trim()
    // list item under last key
    if (line.startsWith('- ') && key !== null && indent > 0) {
      if (!Array.isArray(fm[key])) fm[key] = []
      fm[key].push(line.slice(2).replace(/^["']|["']$/g, ''))
      continue
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    const k = kv[1]
    const v = kv[2]
    if (v === '' || v === '|' || v === '>') {
      // multiline or nested — start a list/object
      fm[k] = v === '' ? null : ''
      key = k
    } else {
      fm[k] = v.replace(/^["']|["']$/g, '')
      key = k
    }
  }
  return { frontmatter: fm, body }
}

/**
 * Walk docs/ for .md files, skipping .vitepress + public + zh.
 * For zh we'll produce a separate llms.txt section below.
 */
function walk(dir, out = [], filter = (n) => true) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.name === 'public' || entry.name === '.vitepress') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out, filter)
    } else if (entry.name.endsWith('.md') && filter(full)) {
      out.push(full)
    }
  }
  return out
}

function relUrl(abs) {
  const rel = path.relative(DOCS, abs).replace(/\\/g, '/')
  // Drop .md, drop /index, ensure leading slash
  let url = rel.replace(/\.md$/, '')
  if (url.endsWith('/index')) url = url.slice(0, -'/index'.length)
  if (url === 'index') url = ''
  return '/' + url
}

function readH1(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m)
  return m ? m[1].trim() : null
}

function summarize(fm, body) {
  // Priority: explicit tldr > description > first sentence of body
  if (fm.tldr) return fm.tldr
  if (fm.description) return fm.description
  // Strip frontmatter-free body to first sentence
  const stripped = body
    .replace(/^>?\s*\*\*tldr:\*\*\s*([^\n]+)/im, '')  // remove existing tldr line
    .replace(/^#.+$/gm, '')                          // headings
    .replace(/```[\s\S]*?```/g, '')                  // code blocks
    .replace(/<[^>]+>/g, '')                         // html tags
    .trim()
  const m = stripped.match(/[^.!?]+[.!?]/)
  return m ? m[0].trim() : ''
}

function buildEntry(file) {
  const src = fs.readFileSync(file, 'utf8')
  const { frontmatter, body } = parseFrontmatter(src)
  const url = relUrl(file)
  const title = frontmatter.title || readH1(body) || url
  const tldr = summarize(frontmatter, body) || ''
  return {
    file,               // keep abs path; URL is for display, file is for reading
    url,
    title,
    tldr,
    kind: frontmatter.kind || '',
    status: frontmatter.status || '',
  }
}

function groupByTopLevel(entries) {
  const groups = {}
  for (const e of entries) {
    // /channels/telegram → channels;  / → root
    const seg = e.url.split('/').filter(Boolean)[0] || 'home'
    if (!groups[seg]) groups[seg] = []
    groups[seg].push(e)
  }
  return groups
}

const GROUP_TITLES = {
  home: 'Home',
  'getting-started': 'Getting started',
  sessions: 'Sessions — long-running CLI workspaces',
  channels: 'Channels — 8 messaging-platform bridges',
  providers: 'Providers — CLI manifests (Claude / Codex / Gemini / shell)',
  plugins: 'Plugins — Skills, MCP servers, git host adapters',
  notes: 'Notes — Obsidian-compatible vault',
  memory: 'Memory — cross-CLI project memory',
  'ambient-memory': 'Ambient memory — auto-capture',
  'project-memory': 'Project memory — per-cwd scope',
  'memory-workers': 'Memory workers — summarization + cleanup',
  integrations: 'Integrations — internal reverse proxy + events WS',
  consuming: 'Consuming opendray — building apps on top',
  activity: 'Activity — audit log of all API calls',
  backup: 'Backup — encrypted dumps + exports',
  settings: 'Settings — admin configuration',
  reference: 'API reference — REST + WebSocket',
  releases: 'Releases — changelog, roadmap, showcase',
}

function buildIndex(entries) {
  const groups = groupByTopLevel(entries)
  let out = ''
  out += `# opendray\n\n`
  out += `> opendray is a self-hosted control gateway for AI coding CLIs (Claude Code, Codex, Gemini CLI). It wraps local CLIs and exposes them via REST + WebSocket so web admin, mobile apps, messaging platforms, and your own apps can all drive the same session. One Claude Pro subscription serves your entire personal-app stack instead of per-token billing.\n\n`
  out += `Status: v1.0 stable. Single Go binary. Self-hosted. MIT licensed.\n\n`
  out += `For AI agents: this site exposes machine-readable artifacts at:\n`
  out += `- ${SITE}/llms.txt — this file\n`
  out += `- ${SITE}/llms-full.txt — concatenated full text of every page\n`
  out += `- ${SITE}/openapi.yaml — REST API spec\n`
  out += `- ${SITE}/manifest.json — capability listing\n`
  out += `- ${SITE}/capabilities/{channels,providers,memory,sessions,integrations}.json\n`
  out += `- ${SITE}/mcp-manifest.json — connect via Model Context Protocol\n\n`

  // Stable group order: prefer the known order, then alphabetical for rest
  const known = Object.keys(GROUP_TITLES)
  const ordered = [
    ...known.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !known.includes(k)).sort(),
  ]
  for (const g of ordered) {
    out += `## ${GROUP_TITLES[g] || g}\n\n`
    for (const e of groups[g]) {
      const status = e.status ? ` [${e.status}]` : ''
      out += `- [${e.title}](${SITE}${e.url})${status}: ${e.tldr}\n`
    }
    out += '\n'
  }
  return out
}

function buildFull(entries) {
  let out = ''
  out += `# opendray — full documentation\n\n`
  out += `Generated ${new Date().toISOString()} from ${entries.length} pages.\n\n`
  out += `For the structured index see ${SITE}/llms.txt.\n\n`
  out += `---\n\n`
  for (const e of entries) {
    const src = fs.readFileSync(e.file, 'utf8')
    const { body } = parseFrontmatter(src)
    out += `\n\n# ${e.title}\n\n`
    out += `URL: ${SITE}${e.url}\n`
    if (e.status) out += `Status: ${e.status}\n`
    if (e.tldr)  out += `Summary: ${e.tldr}\n`
    out += `\n`
    out += body.trim() + '\n\n---\n'
  }
  return out
}

// Main
const enFiles = walk(DOCS, [], (f) => !f.includes(`${path.sep}zh${path.sep}`))
const enEntries = enFiles.map(buildEntry)
const zhFiles = walk(path.join(DOCS, 'zh'), [], () => true)
const zhEntries = zhFiles.map(buildEntry)

const enIndex = buildIndex(enEntries)
const enFull  = buildFull(enEntries)

fs.mkdirSync(PUBLIC, { recursive: true })
fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), enIndex)
fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), enFull)
fs.writeFileSync(path.join(PUBLIC, 'llms-zh.txt'), buildIndex(zhEntries))
fs.writeFileSync(path.join(PUBLIC, 'llms-zh-full.txt'), buildFull(zhEntries))

console.log(
  `llms.txt:       ${enEntries.length} EN pages, ${(enIndex.length / 1024).toFixed(1)} KB`
)
console.log(
  `llms-full.txt:  ${enEntries.length} EN pages, ${(enFull.length / 1024).toFixed(1)} KB`
)
console.log(
  `llms-zh.txt:    ${zhEntries.length} ZH pages`
)
