## Design System — Non-Obvious Caveats

For Design System policy (zero-border aesthetic, panel-shadow source-strip, pill radius scale, sidebar floating-pill margin, surface tokens, hermes-theme reference, list-row primitives, row/input rules) — query rs-learn (e.g. "list bg borders", "pill radius scale", "box-shadow stripped", "list primitives", "fab cta sidebar").

- Vocabulary ban: never write the words `gmail`, `mailbox`, `inbox`, or `compose` in source (CSS classes, HTML copy, JS identifiers, comments, or commit messages). The aesthetic is encouraged but the words are forbidden — use visual-function names: `.list`, `.list-row`, `.tabs`, `.list-toolbar`, `.btn-fab`, `.app-search`, `.label`; sidebar bins are `everything / starred / shipped / drafts`. This is non-obvious because the aesthetic itself channels that inspiration; only the lexicon is scrubbed.

## Learning audit

- 2026-04-26 (1): 5 items probed, 5 migrated to rs-learn (zero-border policy, row zebra, input focus, hermes-theme ref, surface tokens). 2 new non-obvious items added (box-shadow source-strip, pill radius scale).
- 2026-04-26 (2): 5 items probed (gmail bg borders, pill radius scale, box-shadow stripped, hermes theme tokens, zero border aesthetic), all 5 returned accurate top hits — both remaining AGENTS.md caveats migrated to rs-learn. AGENTS.md drained to pure pointer.
