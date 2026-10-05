import { renderPageHtml } from '../src/page-html.js';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREVIEWS } from '../scripts/preview-catalog.mjs';

const TOTAL_KITS_TOKEN = '{{TOTAL_KITS}}';
const COUNT_SOURCE_BY_HREF = { '#all': 'all', '#kits': 'kits', '#decks': 'decks', '#previews': 'previews', '#docs': 'docs' };
const PAGE_RESET_STYLE = `<style>html,body{margin:0;padding:0}body{background:var(--bg,#FFFFFF);color:var(--fg,#1A1A1A);font-family:var(--ff-body,system-ui,sans-serif)}</style>`;

function countKitFoldersWithIndexHtml() {
  const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  const kitsDir = join(repoRoot, 'ui_kits');
  try {
    return readdirSync(kitsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => existsSync(join(kitsDir, d.name, 'index.html')))
      .length;
  } catch { return 0; }
}

const TOTAL_COMPONENTS_TOKEN = '{{TOTAL_COMPONENTS}}';

function countManifestComponents() {
  const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  try {
    const manifest = JSON.parse(readFileSync(join(repoRoot, 'ui_kits', 'component_explorer', 'manifest.json'), 'utf8'));
    return manifest.components.length;
  } catch { return 0; }
}

const isBareOrdinal = (code) => /^\d+$/.test(String(code).trim());

function toRows(items, categories) {
  const categoryLabel = new Map((categories || []).map((c) => [c.key, c.label]));
  return (items || []).map((it) => ({
    code: it.code && !isBareOrdinal(it.code) ? it.code : '',
    title: it.title || it.name,
    sub: it.sub || it.desc || '',
    meta: it.cta || it.meta || categoryLabel.get(it.category) || 'open',
    href: it.href || '#',
    category: it.category,
  }));
}

function toPanel(section, id, itemsKey = 'items') {
  if (!section || !section[itemsKey] || !section[itemsKey].length) return null;
  return {
    id: section.id || id,
    title: section.heading,
    count: section.count || section[itemsKey].length,
    items: toRows(section[itemsKey], section.categories),
    layout: section.layout || null,
    categories: section.categories || null,
  };
}

function itemCount(home, section) {
  return home[section]?.items?.length || 0;
}

function liveCountFor(home, key) {
  const sources = {
    all: () => itemCount(home, 'kits') + itemCount(home, 'decks') + PREVIEWS.length + itemCount(home, 'docs'),
    kits: () => itemCount(home, 'kits'),
    decks: () => itemCount(home, 'decks'),
    previews: () => PREVIEWS.length,
    docs: () => itemCount(home, 'docs'),
  };
  return sources[key] ? sources[key]() : null;
}

function withLiveCounts(home, items) {
  return items.map((it) => {
    const key = COUNT_SOURCE_BY_HREF[it.href];
    const count = key ? liveCountFor(home, key) : it.count;
    return { ...it, count };
  });
}

function buildSidebar(home) {
  const sb = home.sidebar || {};
  const sections = [];
  if (sb.fab) sections.push({ group: 'open', items: [{ glyph: sb.fab.glyph || '+', label: sb.fab.label || 'open', href: sb.fab.href || '#' }] });
  if (sb.bins && sb.bins.length) sections.push({ group: 'bins', items: withLiveCounts(home, sb.bins) });
  if (sb.labels && sb.labels.length) sections.push({ group: sb.labels_group || 'labels', items: withLiveCounts(home, sb.labels) });
  if (sb.more && sb.more.length) sections.push({ group: sb.more_group || 'more', items: sb.more });
  return sections.length ? { sections } : null;
}

function previewsPanel(previews) {
  const base = previews.base || './preview/';
  return {
    id: 'previews',
    title: previews.heading || 'previews',
    count: PREVIEWS.length,
    items: PREVIEWS.map((p) => ({
      code: '',
      title: p.title,
      sub: p.description,
      meta: p.group,
      href: base + p.name + '.html',
    })),
  };
}

export default {
  render: async (ctx) => {
    const site = ctx.readGlobal('site') || {};
    const nav = ctx.readGlobal('navigation') || { links: [] };
    const home = ctx.read('pages').docs.find(p => p.id === 'home');
    if (!home) throw new Error('site/content/pages/home.yaml missing or has no id: home');
    const hero = home.hero || null;
    const totalKits = countKitFoldersWithIndexHtml();
    const listedKits = itemCount(home, 'kits');
    if (listedKits !== totalKits) throw new Error(`home.yaml lists ${listedKits} kits but ui_kits/ has ${totalKits} folders with an index.html`);
    const totalComponents = countManifestComponents();
    const interpolate = (s) => typeof s === 'string'
      ? s.replaceAll(TOTAL_KITS_TOKEN, String(totalKits)).replaceAll(TOTAL_COMPONENTS_TOKEN, String(totalComponents))
      : s;
    const heroBody = hero && hero.body ? interpolate(hero.body) : (hero ? hero.body : null);

    const panels = [
      toPanel(home.kits, 'kits'),
      toPanel(home.file_browser, 'file_browser'),
      toPanel(home.desktop_os, 'desktop_os'),
      toPanel(home.web_components, 'web_components'),
      toPanel(home.api_exports, 'api_exports'),
      toPanel(home.decks, 'decks'),
      toPanel(home.docs, 'docs'),
      toPanel(home.features, 'features'),
    ].filter(Boolean);

    for (const p of panels) {
      if (!p || !Array.isArray(p.items)) continue;
      for (const row of p.items) {
        if (row.sub) row.sub = interpolate(row.sub);
        if (row.desc) row.desc = interpolate(row.desc);
      }
    }

    if (home.previews) panels.push(previewsPanel(home.previews));

    const html = renderPageHtml({
      cssHref: './dist/247420.css',
      sdkModuleHref: './dist/247420.js',
      title: site.title || home.title || '247420',
      slug: 'index',
      siteName: site.siteName || site.title || '247420',
      navItems: (nav.links || []).map(l => [String(l.label || ''), l.href]),
      hero: hero ? {
        eyebrow: hero.eyebrow,
        heading: hero.heading, subheading: hero.subheading || site.tagline,
        body: heroBody,
        badges: Array.isArray(hero.badges)
          ? hero.badges.map((b) => ({ ...b, label: interpolate(b.label), desc: interpolate(b.desc) }))
          : hero.badges,
        ctas: hero.ctas,
      } : null,
      showcase: home.showcase ? { heading: home.showcase.heading, lede: home.showcase.lede } : null,
      panels,
      examples: home.examples && home.examples.items ? home.examples.items.map((e) => ({
        label: e.name || e.title, desc: e.desc, href: e.href,
      })) : null,
      quickstart: home.quickstart && home.quickstart.lines ? { heading: home.quickstart.heading, lines: home.quickstart.lines } : null,
      sidebar: buildSidebar(home),
      statusLeft: home.status_left || ['main', '- utf-8', '- lf'],
      statusRight: [
        'anentrypoint-design@latest',
        totalKits + ' kits',
      ],
      seo: {
        description: interpolate(site.description || site.tagline || site.title),
        keywords: site.keywords || ['247420', 'anentrypoint', 'design system'],
        author: site.author || '247420 · a design system by AnEntrypoint',
        twitter: site.twitter || '@AnEntrypoint',
        locale: site.locale || 'en_US',
        lang: site.lang || 'en',
        image: site.image || '',
        url: site.url || '',
      },
      faviconGlyph: site.glyph || (site.title ? site.title.trim().charAt(0).toUpperCase() : '2'),
      headExtra: PAGE_RESET_STYLE,
    });

    return [{ path: 'index.html', html }];
  }
};
