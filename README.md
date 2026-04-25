# 247420 / AnEntrypoint Design System

> we fart in its general direction.

A coherent visual paradigm for the 247420 collective — the "creative department of the internet."

## Where the docs live

All instructional content (paradigm, voice, palette, type, components, contrast rules, stack, file layout, hard rules) lives in **`SKILL.md`**. That's the single source of truth — the agent skill reads it, humans read it, future authors update it.

## Files in this repo

- `SKILL.md` — the full design system: paradigm, content fundamentals, visual fundamentals, components, dark/light contract, stack, hard rules.
- `colors_and_type.css` — tokens + semantic classes + primitives.
- `app-shell.css` — app-shell primitives (topbar, status, chips, buttons).
- `index.html` — homepage template.
- `preview/` — system cards (one concept per card).
- `build.template.js` — flatspace build helper.
- `favicon.svg`, `robots.txt` — site assets.

## Quick start

Drop `colors_and_type.css` and `app-shell.css` into a new project, vendor your fonts, and read `SKILL.md` for the rules. The design system is opinionated — follow the hard rules or you'll diverge fast.
