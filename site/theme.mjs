// AnEntrypoint design-system theme for flatspace.
// Renders site chrome via anentrypoint-design SDK on the client (importmap → unpkg),
// theme.mjs only emits the static HTML shell + bootstrap script that consumes the YAML
// content that flatspace baked into <script type="application/json" id="__site__">.

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const escapeJson = (obj) => JSON.stringify(obj)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const SDK_URL = 'https://unpkg.com/anentrypoint-design/dist/247420.js';

const clientScript = `
import { h, applyDiff, installStyles } from 'anentrypoint-design';
installStyles();

const data = JSON.parse(document.getElementById('__site__').textContent);
const { site, nav, home } = data;
const accent = \`linear-gradient(135deg, \${site.accent_from || '#58a6ff'}, \${site.accent_to || '#bc8cff'})\`;

function Hero() {
  return h('div', { class: 'hero' },
    h('div', { class: 'hero-inner' },
      h('h1', { class: 'hero-h1' }, home.hero.heading),
      home.hero.subheading ? h('p', { class: 'hero-sub' }, home.hero.subheading) : null,
      home.hero.body ? h('p', { class: 'hero-body' }, home.hero.body) : null,
      h('div', { class: 'badge-row' },
        ...(home.hero.badges || []).map((b, i) => h('span', { class: 'badge', key: i }, b.label))
      ),
      h('div', { class: 'cta-row' },
        ...(home.hero.ctas || []).map((c, i) => h('a', {
          href: c.href, key: i,
          class: 'btn btn-sm ' + (c.primary ? 'btn-primary' : 'btn-ghost'),
          style: 'text-decoration:none'
        }, c.label))
      )
    ),
  );
}

function Features() {
  if (!home.features || !home.features.items) return null;
  return h('section', { class: 'section' },
    h('h2', {}, home.features.heading || 'Features'),
    h('div', { class: 'grid-cards' },
      ...home.features.items.map((it, i) =>
        h('div', { class: 'card', key: i },
          h('h3', {}, it.name),
          h('p', {}, it.desc || '')
        )
      )
    )
  );
}

function Quickstart() {
  if (!home.quickstart || !home.quickstart.lines) return null;
  const cls = { cmt: 'cmt', cmd: '', str: 'str', kw: 'kw', fn: 'fn' };
  return h('section', { class: 'section' },
    h('h2', {}, home.quickstart.heading || 'Quick start'),
    h('div', { class: 'code-block' },
      h('pre', {},
        ...home.quickstart.lines.map((l, i) => {
          const c = cls[l.kind] || '';
          return h('span', { key: i, class: c }, l.text + '\\n');
        })
      )
    )
  );
}

function Examples() {
  if (!home.examples || !home.examples.items) return null;
  return h('section', { class: 'section' },
    h('h2', {}, home.examples.heading || 'Examples'),
    h('div', { class: 'grid-cards examples-grid' },
      ...home.examples.items.map((it, i) =>
        h('a', {
          key: i,
          class: 'card card-link',
          href: it.href || '#'
        },
          h('h3', {}, it.name),
          h('p', {}, it.desc || ''),
          h('span', { class: 'card-cta' }, (it.cta || 'open') + ' ↗')
        )
      )
    )
  );
}

function Footer() {
  return h('footer', { class: 'app-footer' },
    h('span', {}, 'styled with '),
    h('a', { href: 'https://github.com/AnEntrypoint/design' }, 'anentrypoint-design'),
    h('span', {}, ' · part of '),
    h('a', { href: 'https://247420.xyz' }, '247420.xyz'),
    h('span', {}, ' · '),
    h('a', { href: site.repo }, 'source')
  );
}

function App() {
  return h('div', {}, Hero(), Features(), Examples(), Quickstart(), Footer());
}

const root = document.getElementById('app');
applyDiff(root, [App()]);
requestAnimationFrame(() => {
  const nodes = Array.from(root.querySelectorAll('*'));
  let i = 0;
  nodes.forEach((el) => {
    if (!el || !el.classList) return;
    if (el.matches('script,style,link,meta,title')) return;
    if (el.dataset.motionApplied === '1') return;
    el.classList.add('animate__animated', 'animate__fadeIn');
    el.style.setProperty('--animate-duration', '420ms');
    el.style.setProperty('--animate-delay', \`\${i * 12}ms\`);
    el.dataset.motionApplied = '1';
    i += 1;
  });
});
`;

const html = ({ site, nav, home }) => `<!DOCTYPE html>
<html lang="en" class="ds-247420">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(site.title)}${site.tagline ? ' — ' + escapeHtml(site.tagline) : ''}</title>
  <meta name="description" content="${escapeHtml(site.description || site.tagline || site.title)}" />
  <meta property="og:title" content="${escapeHtml(site.title)}" />
  <meta property="og:description" content="${escapeHtml(site.description || site.tagline || '')}" />
  <meta property="og:url" content="${escapeHtml(site.url || '')}" />
  <link rel="canonical" href="${escapeHtml(site.url || '')}" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='26'%3E${encodeURIComponent(site.glyph || '◆')}%3C/text%3E%3C/svg%3E" />
  <script type="importmap">{"imports":{"anentrypoint-design":"${SDK_URL}"}}</script>
  <style>
    body { margin: 0; }
    .hero { padding: 5rem 2rem 3rem; text-align: center; background: linear-gradient(135deg, var(--panel-bg, #0d1117) 0%, var(--panel-bg-2, #161b22) 100%); border-bottom: 1px solid var(--panel-border, #30363d); }
    .hero-inner { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
    .hero-h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; margin: 0 0 1rem; letter-spacing: -0.02em; background: ${'linear-gradient(135deg, ' + (site.accent_from || '#58a6ff') + ', ' + (site.accent_to || '#bc8cff') + ')'}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-sub { font-size: clamp(1.125rem, 2.4vw, 1.5rem); color: var(--panel-muted, #8b949e); width: 100%; max-width: 640px; margin: 0 0 0.75rem; line-height: 1.6; text-align: center; }
    .hero-body { font-size: clamp(1rem, 2vw, 1.25rem); color: var(--panel-muted, #8b949e); width: 100%; max-width: 640px; margin: 0 0 2rem; line-height: 1.6; text-align: center; }
    .badge-row { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
    .badge { background: var(--panel-bg-2, #21262d); border: 1px solid var(--panel-border, #30363d); border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.8125rem; color: var(--panel-muted, #8b949e); transition: all 0.3s ease; }
    .badge:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .cta-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .section { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
    .section h2 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 700; color: var(--panel-text, #e6edf3); margin-bottom: 1.5rem; border-bottom: 1px solid var(--panel-border, #21262d); padding-bottom: 0.75rem; }
    .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .card { background: var(--panel-bg-2, #161b22); border: 1px solid var(--panel-border, #30363d); border-radius: 12px; padding: 1.25rem; transition: all 0.3s ease; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    .card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: ${site.accent_to || '#bc8cff'}; font-family: var(--ff-mono, ui-monospace, monospace); }
    .card p { margin: 0; color: var(--panel-muted, #8b949e); font-size: 0.9375rem; line-height: 1.6; }
    .card-link { text-decoration: none; display: block; }
    .card-link .card-cta { display: inline-block; margin-top: 0.8rem; color: #58a6ff; font-size: 0.8125rem; font-family: var(--ff-mono, ui-monospace, monospace); }
    .code-block { background: var(--panel-bg-2, #161b22); border: 1px solid var(--panel-border, #30363d); border-radius: 12px; padding: 1.5rem; overflow-x: auto; }
    .code-block pre { margin: 0; font-family: var(--ff-mono, ui-monospace, monospace); font-size: 0.875rem; color: var(--panel-text, #e6edf3); line-height: 1.6; }
    .cmt { color: var(--panel-muted, #8b949e); }
    .str { color: #a5d6ff; } .kw { color: #ff7b72; } .fn { color: #d2a8ff; }
    .app-footer { border-top: 1px solid var(--panel-border, #21262d); padding: 2rem; text-align: center; color: var(--panel-muted, #8b949e); font-size: 0.875rem; }
    .app-footer a { color: #58a6ff; text-decoration: none; }
    /* Button hover effects */
    .btn, .btn-primary, .btn-ghost { transition: all 0.3s ease; }
    .btn:hover, .btn-primary:hover, .btn-ghost:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="application/json" id="__site__">${escapeJson({ site, nav, home })}</script>
  <script type="module">${clientScript}</script>
</body>
</html>
`;

export default {
  render: async (ctx) => {
    const site = ctx.readGlobal('site') || {};
    const nav = ctx.readGlobal('navigation') || { links: [] };
    const homeDoc = ctx.read('pages').docs.find(p => p.id === 'home');
    if (!homeDoc) throw new Error('config/pages/home.yaml missing or has no id: home');

    return [{
      path: 'index.html',
      html: html({ site, nav, home: homeDoc })
    }];
  }
};
