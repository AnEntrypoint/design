import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PREVIEWS, PREVIEW_GROUPS, previewByName } from './preview-catalog.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const previewDir = join(root, 'preview')

const files = readdirSync(previewDir)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .map(f => f.replace(/\.html$/, ''))
  .sort()

const uncatalogued = files.filter(name => !previewByName.has(name))
const missing = PREVIEWS.map(p => p.name).filter(name => !files.includes(name))
if (uncatalogued.length || missing.length) {
  throw new Error(`preview catalog out of sync with preview/*.html: no catalog entry for [${uncatalogued.join(', ')}], no file for [${missing.join(', ')}]`)
}

const EXTRA_LINKS = [
  { href: '../slides/index.html', title: 'slide deck', description: 'a 16:9 deck built with the same tokens and chrome as the kits.' },
]

const row = ({ href, title, description }) => `      <li><a href="${href}">${title}</a><span class="idx-desc">${description}</span></li>`

const sections = PREVIEW_GROUPS.map(group => {
  const rows = PREVIEWS.filter(p => p.group === group).map(p => row({ href: `./${p.name}.html`, title: p.title, description: p.description })).join('\n')
  return `<h2>${group.toLowerCase()}</h2>\n<ul>\n${rows}\n</ul>`
}).join('\n')

const extraRows = EXTRA_LINKS.map(row).join('\n')

const html = `<!doctype html>
<html lang="en" data-theme="auto" class="ds-247420"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Component preview index</title>
<link rel="stylesheet" href="../colors_and_type.css">
<link rel="stylesheet" href="../app-shell.css">
<style>body{padding:var(--space-4);background:var(--panel-0);color:var(--panel-text);max-width:720px;margin:0 auto}
ul{list-style:none;padding:0;margin:0}
li{display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-2) 0;border-bottom:1px solid var(--panel-2)}
a{color:var(--accent-ink);text-decoration:underline;font-family:var(--ff-ui,var(--ff-body));font-weight:600}
a:hover{text-decoration-thickness:2px}
.idx-desc{color:var(--fg-2);font-size:var(--fs-sm)}
h1{font-size:var(--fs-h2);margin:var(--space-2) 0 var(--space-1)}
h2{font-size:var(--fs-h4);margin:var(--space-5) 0 var(--space-2);color:var(--fg-2)}
.idx-lede{color:var(--fg-2);margin:0 0 var(--space-4)}
.idx-kicker{font-family:var(--ff-mono);text-transform:uppercase;letter-spacing:var(--tr-label);color:var(--fg-3);font-size:var(--fs-tiny)}
</style>
</head><body>
<div class="ds-demo-label idx-kicker">247420 / preview index</div>
<h1>component previews</h1>
<p class="idx-lede">${files.length} specimen pages, each rendering one primitive or token set in isolation so you can see it, measure it and copy its markup.</p>
${sections}
<h2>other demo surfaces</h2>
<ul>
${extraRows}
</ul>
</body></html>
`

writeFileSync(join(previewDir, 'index.html'), html)
console.log(`[generate-preview-index] wrote preview/index.html listing ${files.length} previews`)
