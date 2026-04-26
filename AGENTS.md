## Design System — Non-Obvious Caveats

### Zero-Border Aesthetic (Gmail-like Surfaces)

The Design System uses a zero-border visual hierarchy that deviates from typical Material Design / Bootstrap expectations. This is NOT a default; it requires intentional CSS resets and token-driven separation.

**Caveat**: When editing design tokens, component styles, or layout CSS (slides/, ui_kits/, colors_and_type.css, app-shell.css, deck-stage.js), reaching for `border:`, `border-bottom:`, or divider lines on cards, sections, rows, or tables will violate the aesthetic. The canonical pattern is:
- **Surface separation**: Use tonal background tokens (surface, surface-2) + gap/spacing instead of borders.
- **Row emphasis**: Use nth-child(even) zebra + hover background, not grid lines.
- **Input focus**: Only hairline (`border-bottom: 2px`) on focus; no resting border.
- **Dividers**: Reserved for `<hr>` / separator slot only; transparent elsewhere.

Reference: c:\dev\hermes-theme clean.yaml implements this via `*, *::before, *::after { border-color: transparent; border-width: 0; }` + surface tokens.

**Why this matters**: Accidental borders or shadows on cards/panels will break the intended aesthetic. Code review should flag any `border:` or `box-shadow:` on layout chrome (non-input elements).

## Learning audit

(None yet — baseline established from user context.)
