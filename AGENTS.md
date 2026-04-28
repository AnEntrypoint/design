## 247420.xyz Portfolio — Unified gh-pages Pattern

Every repo in the 247420.xyz portfolio (33 projects, source-of-truth: C:/dev/247420/lib/projects.js) MUST follow this pattern:
- No package.json in repo root (CI/CD-only build)
- GitHub Actions: `npx --yes flatspace@latest build` → deploys `./dist` via peaceiris/actions-gh-pages (or actions/deploy-pages)
- Site source: flatspace.config.mjs + config/globals/*.yaml + config/pages/*.yaml + src/theme.mjs
- theme.mjs MUST render via AnEntrypoint design system SDK (anentrypoint-design at unpkg.com/anentrypoint-design/dist/247420.js), importmap-loaded, `installStyles()` + `class="ds-247420"` on `<html>`, components from `window.ds`/webjsx `h()` factory
- Replace ANY other framework chrome (Tailwind, etc.) with SDK
- EXCEPTION: c:\dev\flatspace-demo stays as-is (Tailwind reference)
- Earlier hand-rolled docs/index.html sites (floosie, rs-exec) are NOT going-forward — migrate to flatspace+SDK as part of sweep

## Design System — Non-Obvious Caveats

For Design System policy (zero-border aesthetic, panel-shadow source-strip, pill radius scale, sidebar floating-pill margin, surface tokens, hermes-theme reference, list-row primitives, row/input rules) — query rs-learn (e.g. "list bg borders", "pill radius scale", "box-shadow stripped", "list primitives", "fab cta sidebar").

- Vocabulary ban: never write the words `gmail`, `mailbox`, `inbox`, or `compose` in source (CSS classes, HTML copy, JS identifiers, comments, or commit messages). The aesthetic is encouraged but the words are forbidden — use visual-function names: `.list`, `.list-row`, `.tabs`, `.list-toolbar`, `.btn-fab`, `.app-search`, `.label`; sidebar bins are `everything / starred / shipped / drafts`. This is non-obvious because the aesthetic itself channels that inspiration; only the lexicon is scrubbed.

## Learning audit

- 2026-04-26 (1): 5 items probed, 5 migrated to rs-learn (zero-border policy, row zebra, input focus, hermes-theme ref, surface tokens). 2 new non-obvious items added (box-shadow source-strip, pill radius scale).
- 2026-04-26 (2): 5 items probed (gmail bg borders, pill radius scale, box-shadow stripped, hermes theme tokens, zero border aesthetic), all 5 returned accurate top hits — both remaining AGENTS.md caveats migrated to rs-learn. AGENTS.md drained to pure pointer.
- 2026-04-26 (3): ingested 4 new project facts (no-serifs, dark-mode-neutral-grey, list-row-category-colors, density-tweaks). Re-probed 5 stable items (zero border, pill radius, hermes tokens, list-row primitives, fab/cta) — all returned accurate top hits. AGENTS.md held at pointer + vocabulary-ban only.
