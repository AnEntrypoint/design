---
name: 247420-design
description: Use this skill to generate well-branded interfaces and assets for 247420 / AnEntrypoint (the "creative department of the internet"), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Paradigm:** strict grid, loud content. Monospace chassis + display headlines + hairline rules. No gradients. No rounded corners. No emoji-in-UI.
- **Voice:** lowercase internet-native, cryptic-when-it-wants, earnest-when-it-matters. `we` in first person.
- **Palette (entire):** `#EFE9DD` paper, `#0B0B09` ink, `#B8FF00` acid (the one accent). Plus `#1F4DFF` link, `#FF3B1F` warn, `#00A86B` live.
- **Type:** Redaction 50 (display), JetBrains Mono (UI/labels/code), Instrument Serif (long-form).
- **Primitives:** the dateline bar, the index-card row, the stamp, the hairline rule (single/double/dotted), hairline-bottom inputs.
- **Motion:** 80ms snap, 160ms base, `cubic-bezier(0.2, 0, 0, 1)`. No bounces.

## Files
- `README.md` — full paradigm, content + visual foundations, caveats, ask.
- `colors_and_type.css` — all tokens + semantic classes + primitives.
- `preview/` — design system cards (one concept per card).
- `ui_kits/` — homepage, project_page, docs, blog.
- `slides/` — deck template with 6 slide types.
- `assets/` — (placeholder for logos once provided).
- `fonts/` — (placeholder; v1 uses Google Fonts).

## Hard rules (violate at your peril)
- No gradients. Ever.
- No purple.
- No rounded corners (0px).
- No drop shadows (except the stamp-button offset shadow).
- No emoji in UI elements. In prose: rare, intentional.
- No system-ui / Inter / Roboto.
- Lowercase by default. `ALL CAPS` for labels & project codes only.
- One acid accent per page, max. One stamp per page, max.
