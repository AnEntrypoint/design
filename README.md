# 247420

The 247420 / AnEntrypoint design system, packaged as a single-file ESM SDK.

friendly rounded sans body, monospace only on real code, tonal surfaces over borders, indicator rails for color-coded separation, generous negative space, terminal-flavoured rhythm.

we fart in its general direction. ◰

## install (the only step)

You have two choices. Both are one line.

**npm** (when you already have a bundler):

```bash
npm install anentrypoint-design
```

**unpkg** (when you don't, and you don't want one):

```html
<link rel="stylesheet" href="https://unpkg.com/anentrypoint-design@latest/dist/247420.css">
<script type="importmap">
  { "imports": { "anentrypoint-design": "https://unpkg.com/anentrypoint-design@latest/dist/247420.js" } }
</script>
```

Add the scope class on a wrapping element and you are done:

```html
<html class="ds-247420" data-theme="light">
  <body><div id="app"></div></body>
</html>
```

## use it (3-line app)

```js
import { mount, components as C } from 'anentrypoint-design';

mount(document.getElementById('app'), () => C.AppShell({
  topbar: C.Topbar({ brand: '247420', leaf: 'gm', items: [['works','#/works']] }),
  main:   C.HomeView({ /* hero, features, examples — see ./site/content/pages/home.yaml */ }),
  status: C.Status({ left: ['main'], right: ['live'] })
}));
```

`mount` automatically adds `.ds-247420` to your root.

## use it from a buildless flatspace project

A canonical example lives at `c:\dev\flatspace-demo`. It has **no `package.json`**. It has a `flatspace.config.mjs`, YAML pages under `config/`, and a `src/theme.mjs` that turns each page into HTML at build-time. CI runs `npx --yes flatspace@latest build` and deploys `dist/`.

To plug 247420 into that shape, do exactly three things:

### 1. Reference the SDK from `<head>` in `src/theme.mjs`

```js
export default function render({ site, page }) {
  return `<!doctype html>
<html lang="en" class="ds-247420" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title} — ${site.title}</title>
  <link rel="stylesheet" href="https://unpkg.com/anentrypoint-design@latest/dist/247420.css">
  <script type="importmap">
    { "imports": { "anentrypoint-design": "https://unpkg.com/anentrypoint-design@latest/dist/247420.js" } }
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { mount, components as C } from 'anentrypoint-design';
    const data = ${JSON.stringify({ site, page })};
    mount(document.getElementById('app'), () => C.AppShell({
      topbar: C.Topbar({ brand: data.site.title, items: data.site.nav }),
      crumb:  C.Crumb({ leaf: data.page.title }),
      main:   data.page.template === 'home' ? C.HomeView(data.page) : C.Section(data.page),
      status: C.Status({ left: ['main'], right: ['live'] }),
    }));
  </script>
</body>
</html>`;
}
```

### 2. Author pages in YAML

```yaml
# config/pages/home.yaml
id: home
title: home
template: home
hero:
  heading: tigers
  subheading: large striped cats
  body: a flatspace site, styled by 247420.
  badges: [ { label: encyclopedic }, { label: lowercase }, { label: 100% YAML } ]
features:
  heading: why tigers
  items:
    - { name: stripes, desc: structurally redundant, semiotically loud. }
    - { name: silence, desc: we like ambush as a design pattern. }
examples:
  heading: pages
  items:
    - { name: about,   href: ./about.html,   cta: open }
    - { name: species, href: ./species.html, cta: open }
```

### 3. CI workflow (`.github/workflows/build.yml`)

```yaml
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npx --yes flatspace@latest build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

That is the whole integration. No `package.json`, no install, no bundler, no copy step. Push a YAML change to `main`, GH Actions builds, GH Pages serves.

## components

Primitives: `Brand`, `Chip`, `Btn`, `Glyph`, `Heading`, `Lede`, `Dot`, `Rail`.
Chrome: `Topbar`, `Crumb`, `Side`, `Status`, `AppShell`.
Surfaces: `Panel`, `Row`, `RowLink`, `Section`, `Install`, `Receipt`, `Changelog`.
Pages: `Hero`, `WorksList`, `WritingList`, `Manifesto`, `HomeView`, `ProjectView`.

All factories are pure: props in, WebJSX tree out.

## DeckStage

```js
import { registerDeckStage } from 'anentrypoint-design';
await registerDeckStage();
// <deck-stage width="1920" height="1080">…<section>…</section></deck-stage>
```

## tokens (override anywhere)

The system runs entirely on CSS custom properties under `.ds-247420`. To rebrand a single surface, declare overrides at any level:

```html
<div class="ds-247420" style="
  --panel-accent: #6FA9FF;
  --panel-select: #DCE8FF;
  --green: #6FA9FF;
">
  …same components, sky-blue accent…
</div>
```

The full token list lives in `colors_and_type.css`. The voice rules and the storytelling pass live in `SKILL.md`.

## why scope-prefixed

Every selector in the bundle is namespaced under `.ds-247420` via PostCSS. The bundle ships Nunito + Archivo + JetBrains Mono + the design tokens **without** colliding with whatever the host app already runs. Add the class to a root element to opt in.

## CSS only (no JS)

```html
<link rel="stylesheet" href="https://unpkg.com/anentrypoint-design@latest/dist/247420.css">
<div class="ds-247420">…</div>
```

You get the tokens, primitives, and utility classes. You write the markup.

## publishing

Every push to `main` runs `.github/workflows/publish.yml`:

1. Resolves max(local, remote) version, bumps **patch**.
2. Builds with `scripts/build.mjs` (esbuild + postcss-prefix-selector).
3. Publishes to npm with `NPM_TOKEN`.
4. Commits the bump back to `main` and pushes a `vX.Y.Z` tag.

Skip publish for any commit by including `[skip publish]` in the message; release commits use that automatically to prevent loops.

## links

- live: <https://anentrypoint.github.io/design/>
- npm: <https://www.npmjs.com/package/anentrypoint-design>
- skill: see `SKILL.md` for the full visual paradigm and storytelling rules.
