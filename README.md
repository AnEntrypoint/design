# 247420

The 247420 / AnEntrypoint design system, packaged as a single-file ESM SDK.

Bundles **WebJSX** (vendored), a modified **Ripple UI**, **Tailwind v2** utility classes, the design tokens (`colors_and_type.css`), the app shell (`app-shell.css`), the brand fonts, the `<deck-stage>` web component, and an opinionated component library — into one optimized, scope-prefixed file.

## Install

```bash
npm install @anentrypoint/247420
```

## Use the SDK

```js
import { h, mount, installStyles, components as C } from '@anentrypoint/247420';

installStyles();
const root = document.getElementById('app');
mount(root, () => C.AppShell({
  topbar: C.Topbar({ brand: '247420', leaf: 'gm', items: [['works','#/works']] }),
  main:   C.HomeView({ /* … */ }),
  status: C.Status({ left: ['main'], right: ['live'] })
}));
```

`mount` automatically adds the `.ds-247420` scope class to your root.

## Use the unified app

The package also ships a complete WebJSX single-page app at `247420/app` that consolidates the homepage, project page, writing index, and manifesto under one hash-routed shell:

```html
<div id="root" class="ds-247420"></div>
<script type="module" src="https://unpkg.com/@anentrypoint/247420/dist/247420.app.js"></script>
```

`app.html` in this repo is the local consumer.

## Components

Primitives: `Brand`, `Chip`, `Btn`, `Glyph`, `Heading`, `Lede`.
Chrome: `Topbar`, `Crumb`, `Side`, `Status`, `AppShell`.
Surfaces: `Panel`, `Row`, `RowLink`, `Section`, `Install`, `Receipt`, `Changelog`.
Pages: `Hero`, `WorksList`, `WritingList`, `Manifesto`, `HomeView`, `ProjectView`.

All factories are pure: they take props, return a WebJSX tree.

## DeckStage

```js
import { registerDeckStage } from '@anentrypoint/247420';
await registerDeckStage();
// <deck-stage width="1920" height="1080">…<section>…</section></deck-stage>
```

## Why scope-prefixed

Every selector in the bundle is namespaced under `.ds-247420` via PostCSS. The bundle ships Tailwind, RippleUI, and the design tokens **without** colliding with whatever optimized bundle the host app already runs. Add the class to a root element to opt in.

## CSS only

```html
<link rel="stylesheet" href="https://unpkg.com/@anentrypoint/247420/dist/247420.css">
<div class="ds-247420">…</div>
```

## Publishing

Every push to `main` runs `.github/workflows/publish.yml`:

1. Resolves max(local, remote) version, bumps **patch**.
2. Builds with `scripts/build.mjs` (esbuild + postcss-prefix-selector).
3. Publishes to npm with `NPM_TOKEN`.
4. Commits the bump back to `main` and pushes a `vX.Y.Z` tag.

Skip publish for any commit by including `[skip publish]` in the message; release commits use that automatically to prevent loops.
