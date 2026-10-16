# Architecture map

One page, high level. Detailed caveats live in AGENTS.md / component docs; this file is only the map.

## What this repo owns

`anentrypoint-design` (published as `247420.xyz`'s design system) is the **sole owner of all
visual/GUI code** shared by thebird and freddie: the OS window-manager chrome, the freddie
dashboard (`AppShell`, `Side`, `FREDDIE_PAGES`), `<freddie-chat>`, and every themed CSS surface
(`src/kits/os/theme.css`, brand tokens, window controls, chat config, files browser, todo app,
etc). It ships as a plain npm package (webjsx-based components + CSS), built with esbuild/postcss,
with no framework runtime dependency of its own.

It also owns this repo's own portfolio/marketing site (`site/`, `slides/`, community app) built
with `flatspace`.

## How it fits with thebird and freddie

```
design  --publish to npm (always-latest)-->  thebird  (docs/vendor/ via refresh-design.mjs)
   |                                             ^
   `--consumed as npm dep-------------------->  freddie (src/web/app.js thin-mounts the
                                                   same createFreddieDashboard/AppShell)
```

- design has **no dependency on thebird or freddie**: it is the leaf/upstream node. It knows
  nothing about IndexedDB filesystems, acptoapi, or LLM providers.
- **thebird** pulls design in via `scripts/refresh-design.mjs`, which fetches the published npm
  package and vendors its CSS/JS into `docs/vendor/`, stamping a `.version` file. thebird's own
  code only ever applies class names / calls the exported component functions; it writes zero
  CSS of its own for these surfaces.
- **freddie** depends on design directly as an npm package; its `src/web/app.js` is a thin mount
  point around `createFreddieDashboard`, so the SAME dashboard GUI renders both standalone
  (freddie's own web server) and embedded in a thebird WM window. Shell-size-aware responsive
  rules in the dashboard use CSS `@container`, not `@media`, because the embedded case has no
  useful viewport of its own.
- Any new visual rule for either downstream consumer is authored HERE, never as inline styles or
  ad hoc CSS in thebird/freddie.

## Relationship to webjsx-toolkit

`webjsx-toolkit` (a sibling project outside this repo) is a separate, independent
port of a shadcn/ui-style component set onto the `webjsx` runtime, Button/Dialog/Tabs/Select/etc.
with a Tailwind+`class-variance-authority` styling approach and Radix-derived behavior, reimplemented
by hand since webjsx has no React-hooks/component-tag model for Radix itself to run on. It is **not**
a dependency of this repo and this repo is not a dependency of it; no publish/consume relationship
in either direction, unlike the thebird/freddie chain above.

design predates it and has an independent, hand-authored, token-driven component/CSS architecture
(see "Design System" in AGENTS.md) that already covered most of the same ground (Dialog, Popover,
Tooltip, DropdownMenu, Accordion, Tabs, etc., see `src/components/editor-primitives/`,
`overlay-primitives/`) before webjsx-toolkit existed. A 2026 cross-project pass did two things: (1)
backfilled the handful of primitives design genuinely lacked (Calendar, DatePicker, Slider, InputOTP,
Carousel, HoverCard, Menubar, a standalone Progress bar, plus a new real-time-collaboration group)
using design's OWN conventions, not webjsx-toolkit's Tailwind/cva ones; (2) restyled design's token
system (`colors_and_type.css`, palette, radius scale, motion easing) to match webjsx-toolkit's
shadcn-neutral visual identity, replacing the prior "Acid Editorial" look (see CHANGELOG "Unreleased"
for the full token-by-token rationale and the WCAG re-verification that followed). The two projects
remain architecturally independent; the restyle only moved design's own token VALUES, not its
component API surface or its underlying webjsx-native (not Tailwind) implementation.

## Boot / build sequence

**Dev:** `npm install`, then edit `src/*`: components are plain JS/webjsx, no dev server required
for iteration (consumers hot-reload via their own dev flow after a `refresh-design.mjs` pull, or
via `link-local-design.mjs`-style local linking during active cross-repo work).

**Build** (`npm run build:ci`, `scripts/build.mjs`): runs the lint gate block (every gate in the `CHECKS` list in
`scripts/lint-css.mjs`, invoked through `scripts/lint.mjs`), then bundles with esbuild + postcss into `dist/`. The gates
scan the component sheets, expanded transitively from a smaller entry-point list through the
`@import` graph: the root `app-shell.css` is a barrel over `src/css/app-shell/*.css` and lints
nothing on its own, and every sheet in that directory must be reachable from it. `build.mjs`
keeps its own `appShellSplitFiles` bundling list, so barrel completeness is what keeps the
bundled `dist/` and a `<link>`ed `app-shell.css` from diverging.

**Deploy** (`.github/workflows/pages.yml`, the only workflow): installs, runs the lint gate and the
build, then the export, ui-kit, component-docs, component-types and component-manifest checks
(`npm run lint:exports`, `lint:ui-kits`, `lint:component-docs`, `lint:component-types`,
`lint:component-manifest`), builds the home page with flatspace and publishes the static tree to
GitHub Pages. The generated component prop reference is gated, so any component split or
signature change must be followed by `npm run docs:components`.

## Module shape

Components live under `src/components/`. `src/components.js` is the public re-export barrel; a
200-line cap applies per module. A group that outgrows the cap becomes a thin barrel of its own
over single-responsibility submodules in a sibling directory of the same name, e.g.
`src/components/editor-primitives.js` over `src/components/editor-primitives/*.js`, and likewise
for shell, content, chat, chat-message-parts, chat-minimap, agent-chat, sessions, files,
files-modals, community, interaction-primitives, voice, freddie and page-html. The public export
surface never moves across a split, so no consumer import changes. These group barrels must use
import-then-bare-export (`import { X } from './sub.js'` … `export { X }`), never a pure
`export { X } from './sub.js'`: `scripts/generate-component-docs.mjs` resolves each symbol by
regex against the barrel with a one-hop re-export fallback, and a pure `export … from` makes it
regenerate the docs with drift warnings.
