## Design System — Non-Obvious Caveats

**Non-obvious**: `box-shadow: var(--panel-shadow)` declarations have been intentionally stripped from app-shell.css even though `--panel-shadow` resolves to `none`. Do not re-add the declaration "for safety" — its absence is the policy signal. Editorial/zine surfaces (`btn-stamp`, etc.) are a separate aesthetic mode and keep their stamp shadows; do not strip those.

**Non-obvious**: Pill radius (`border-radius: 999px`) is the canonical shape for ALL interactive chrome (topbar nav, sidebar items, .btn variants, .chip) — not the more conventional 6–8px. Containers use 16px, code/pre uses 12px. Sidebar items also need 8px horizontal margin so the active pill floats inside the rail (Gmail Compose pattern).

For the broader Gmail-like / zero-border aesthetic policy, surface tokens, hermes-theme reference, and row/input rules — query rs-learn (e.g. "gmail bg borders", "zero border aesthetic", "hermes theme tokens").

## Learning audit

- 2026-04-26: 5 items probed, 5 migrated to rs-learn (zero-border policy, row zebra, input focus, hermes-theme ref, surface tokens — all returned accurate top hits). 2 new non-obvious items added (box-shadow source-strip, pill radius scale). Net AGENTS.md size reduced.
