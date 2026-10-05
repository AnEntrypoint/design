import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const BASE = 'https://anentrypoint.github.io/design'
const OUT = join(root, 'sitemap.xml')

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}
function hasFile(p) {
  try { return statSync(p).isFile() } catch { return false }
}

const urls = []

urls.push({ loc: `${BASE}/`, changefreq: 'weekly', priority: '1.0' })

const FLAGSHIP_KITS = ['homepage', 'project_page']
const uiKitsDir = join(root, 'ui_kits')
const uiKits = readdirSync(uiKitsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && hasFile(join(uiKitsDir, e.name, 'index.html')))
  .map((e) => e.name)
  .sort()
for (const kit of uiKits) {
  const priority = FLAGSHIP_KITS.includes(kit) ? '0.9' : '0.8'
  urls.push({ loc: `${BASE}/ui_kits/${kit}/`, changefreq: 'weekly', priority })
}

const hasSlidesDeck = hasFile(join(root, 'slides', 'index.html'))
if (hasSlidesDeck) {
  urls.push({ loc: `${BASE}/slides/`, changefreq: 'monthly', priority: '0.6' })
}

const previewDir = join(root, 'preview')
const previews = readdirSync(previewDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .sort()
for (const f of previews) {
  urls.push({ loc: `${BASE}/preview/${f}`, priority: '0.5' })
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`

writeFileSync(OUT, xml)
console.log(`[generate-sitemap] wrote sitemap.xml with ${urls.length} urls (1 root, ${uiKits.length} ui_kits, ${hasSlidesDeck ? 1 : 0} slides, ${previews.length} previews)`)
