# 247420 / AnEntrypoint Design System

> we fart in its general direction.

A coherent visual paradigm for the 247420 collective — the "creative department of the internet." This is the system every AnEntrypoint project builds against so the work stops looking like the tools it was made with and starts looking like it came from here.

---

## Who this is for

**247420** is a collective of mercurials. Art, music, code experiments that think outside the box. Dadaism for the internet. Move fast, break things, humor and togetherness matter. The lore: 24/7 + 420 — the people towing the creative line of the internet, doing things first.

**AnEntrypoint** came out of 247420 in 2018 as a structured flag for builders — born from Schwepe, JB0GIE and b0gie (TechShaman) after a year of vibing in 247420 and deciding the Web3 scene needed fewer whitepapers and more PRs. The name came from a late-night conversation about how hard it was for new people to enter Web3: too many barriers, too much gatekeeping. "We need an entrypoint." They registered the GitHub org that night.

### The founding principles (from the 2018 manifesto)

These are the ethics the visual system has to carry. Every surface we ship should feel like one of these is true of it:

1. **Code is Communication.** Talk is cheap. PRs are truth. The conversation happens in the code review, not the marketing thread.
2. **Community > Capital.** We optimize for the people who show up, not the people who write checks.
3. **Learn in Public.** Ship broken code, iterate fast, improve in the open. The goal isn't perfection — it's movement.
4. **Fun is a Feature.** If your dApp isn't at least a little bit fun to use, you've failed. Web3 is the Wild West, not a spreadsheet with extra steps.

> "An entrypoint is just a beginning. What matters is what you build once you're through the door." — b0gie, TechShaman 🧞

### Still emerging
The collective is never "done." Never "established." Always in the liminal space of becoming. This phrase — **"probably emerging"** 🌀 — is the permanent status line. It belongs in footers, in metadata, in the dateline. Everything shipped under 247420 is labeled as a work-in-progress, on purpose, forever.

**AnEntrypoint** is the GitHub org. Projects that live under this system include:

| Project | What it is |
|---|---|
| `gm` / `mcp-gm` / `gm-cc` | State machine for coding agents; Claude Code plugin |
| `flatspace` | AnEntrypoint project |
| `thebird` | AnEntrypoint project |
| `spawnpoint` / `spoint` | AnEntrypoint project |
| `247420.xyz` | Group homepage / portfolio |
| `zellous` | Push-to-talk with Opus codec, rooms, replay |
| `techshaman` | Member site |
| `mcp-repl` | REPL for MCP |
| `mutagen` / `adaptogen` | Adaptogen server / dApp experiments |
| `playread` | Playwright MCP wrapper |

---

## The paradigm — one idea

> **Strict grid. Loud content.**

The chassis is rigid — monospace, hairline rules, fixed column widths, ASCII-receipt structure, zero decoration. That rigor is what makes the *content* inside it feel punk. Screenshots bleed to the paper edge. Project names are set in a bruising display face. Writing is lowercase, internet-native, cryptic-when-it-wants-to-be, earnest-when-it-matters.

This is the **jinba ittai** — horse and rider, one motion: the grid and the content aren't in tension, they're a single gesture. The grid doesn't politely contain the work; it *aims* the work.

Anti-patterns (hard rules, never break):
- No gradients. Ever. Especially no purple-to-blue webdev gradients.
- No emoji-in-cards, no colored-left-border cards, no trifecta hero layouts.
- No rounded corners (0px, full stop — one exception: the interactive "stamp" motif, documented below).
- No drop shadows. No glassmorphism. No neumorphism.
- No stock iconography slapped on for "visual interest."
- No AI-generated illustrations, no dreamy renders, no "vibe" fills.
- No Inter. No Roboto. No system-ui sans.
- Never lead with a logo. Lead with a thought.
- Never look like the default Ripple UI demo. Ripple gives us primitives; our layer gives us voice.

---

## Content fundamentals

### Voice
Cryptic lowercase internet-native, laced with earnest warmth. Minimal — let the visuals carry it. Dry, not cute. The collective addresses itself in the first person plural ("we"). External copy can use "you" but sparingly.

### Casing
- **Body & most headings: lowercase.** Almost always.
- **ALL CAPS for labels, section markers, project codes** — terminal-flavored, e.g. `PROJECT // GM · v0.4.1 · live`.
- Sentence case for long-form writing (blog, docs, essays). Even then, leading-word-only — no title case ever.

### Tone examples (copy we ship)

> `gm. state machine for coding agents. it thinks, so you don't have to (as much).`

> `zellous is push-to-talk. hold the button. talk. someone on the other side hears you. that's it. that's the whole pitch.`

> `we make things. some of them work. a few of them become the future. we don't know which is which until later.`

> `247420. the creative department of the internet. always open. always a little bit high on possibility.`

> `new: gm v0.4.1 // shipped tuesday // breaks everything in a good way`

### Banned copy patterns
- "Supercharge your workflow" — any verb+workflow construction
- "Built for developers by developers"
- "The future of X is here"
- Any "X, but for Y" formulation ("Figma, but for burritos")
- em-dash-and-sparkle-emoji openers
- "In today's fast-paced world"

### Things we do say
- "ships tuesday" (specific, declarative, unsexy)
- "broken on purpose" (confidence)
- "not for you" (confidence, second type)
- "idk. try it." (warmth, deflation)
- "we were here first" (lore-accurate)
- "read the source" (direction, not marketing)
- **"probably emerging"** 🌀 (permanent status — use it in footers, metadata, loading states, "coming soon" placeholders — all of them)
- "PRs are truth" (when talking to contributors)
- "learn in public" (when writing about mistakes)
- "fun is a feature" (pitching anything)
- "an entrypoint is just a beginning"

### Numbers & units
Always abbreviated, always lowercase: `3k stars`, `61 repos`, `v0.4.1`, `2.1mb`, `24/7`. Never "3,000 stars."

### Dates
`2026.04.20` or `apr 20 2026` or `tue 04.20`. Never "April 20th, 2026."

---

## Visual foundations

### The grid
- **Base unit: 8px.** Everything spaces in multiples of 8.
- **Micro unit: 4px.** Only for type metrics and hairlines.
- **Max content column: 72ch** (roughly 640px at body size). Content wider than that is an image or a table.
- **Gutter: 24px** desktop, 16px mobile.
- **Page margins: 32px desktop, 16px mobile.** No centered-max-width-container hugs. Content sits flush-left under an ASCII header.

### Color — the lore palette
The palette is load-bearing lore, not aesthetics-first.

- **`#247420` — marijuana green.** The brand's namesake number, rendered as a hex color. Primary lore accent. Bottle-glass green, confident, not neon.
- **`#420247` — marijuana purple.** The lore pair — the complement to `#247420`, encoded in the same joke. This is the **one purple** the system permits. Secondary accent, inversion backgrounds.
- **`#E84B8A` — mascot pink/magenta/ambiguous-mauve.** Wild-card accent. Used randomly, irreverently, as a "the mascot did this" flourish. Never systematic — it shows up where it shouldn't.
- **`#EFE9DD` paper cream** — warm off-white, zine paper, not "light mode."
- **`#0B0B09` ink** — paper-ink black with a hint of warmth so it doesn't vibrate against the cream.
- **`#1F4DFF` link blue** for long-form prose links. **`#FF3B1F` warn red** for destructive/errors. **Live/success** uses `#247420` (because of course).

**Default theme: follows the user's OS** via `@media (prefers-color-scheme: dark)`. Cream is the paper; ink is the plate.

### Type
Three families, no more:
- **Display — `Redaction` / `Redaction 50`** (or closest available). Editorial, decaying-ink feel. For headlines, project titles, quotes. Fallback: `Times New Roman` (not a joke; the default Times is better than most web serifs).
- **Mono — `JetBrains Mono`** for labels, metadata, nav, code, receipts. Fallback: `ui-monospace, Menlo, Consolas`.
- **Body — `Instrument Serif`** for long-form reading (blog, docs). Fallback: `Georgia`.

### Backgrounds
- No images behind text. Ever.
- Backgrounds are one of three things: **cream paper**, **ink black**, or **a full-bleed screenshot of a project** (always with a hairline border around it).
- Optional: **paper grain texture at 4% opacity** on cream backgrounds.
- No repeating patterns. No SVG blobs. No "subtle gradient backgrounds."

### Borders & rules
- **Everything is separated by 1px hairlines**, not by spacing or cards.
- Hairline color on cream: `#0B0B09` at 100%. On black: `#EFE9DD` at 100%. Assertive, not shy.
- Double-hairline (1px + 3px gap + 1px) for major section breaks — "printed newspaper" motif.
- Dotted hairlines (`border-style: dotted`) for "optional / skippable" boundaries.
- No card containers. Structure comes from rules, not from boxes.

### Shadows
- None. The system is flat. Depth comes from scale and typographic weight, not shadow.
- One exception: the **"stamp"** motif — a 4px offset solid-ink box-shadow (`4px 4px 0 var(--ink)`) on the one interactive element per page that should feel like a rubber stamp. Hover: shadow snaps to `2px 2px 0`; press: `0 0 0` and translate to match.

### Corner radii
- `0px` everywhere. The stamp gets personality from offset-shadow, not rounding.

### Spacing tokens
```
--space-0: 0
--space-1: 4px     // hairlines, type adjustments
--space-2: 8px     // tight grouping
--space-3: 16px    // list items
--space-4: 24px    // paragraph spacing, gutter
--space-5: 32px    // page margin
--space-6: 48px    // section break
--space-7: 64px    // major section
--space-8: 96px    // hero padding
--space-9: 128px   // page-to-page rhythm
```

### Animation
Very little. The system doesn't "move to delight" — it moves to acknowledge.
- **Duration:** `80ms` (snap) and `160ms` (ease). Nothing slower than 240ms except one-offs.
- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` (sharp out) for 95% of things. Linear for progress/scroll. No bounces, no springs, no elastic.
- **Hover states:** text switches to inverse-bg color. Links get a 1px underline that was always there (no appearing-on-hover underline).
- **Press states:** translate `(1px, 1px)` with matching shadow snap. Solid buttons invert.
- **Page transitions:** none. Hard cuts.

### Hover & press philosophy
The design doesn't coddle. Hover means "something will happen if you click." Binary. No gradual reveal, no halo, no glow. Invert or underline, that's it.

### Transparency & blur
- Transparency appears in **one** place: the **sticky header strip** uses `background: rgba(239, 233, 221, 0.88); backdrop-filter: blur(8px)` on cream pages (inverse on black).
- No semi-transparent cards, no frosted modals, no fade-out-to-bg tricks.

### Imagery
- Black and white, or **full color, no filter**. Nothing in between. No duotones, no "mood" filters, no grain overlays on photos.
- Project screenshots: raw, native aspect, 1px `--ink` hairline border.
- Never stock photography. Prefer: actual screenshots, scanner-flat object photos, handwritten sketches photographed from above, ASCII art, emoji-free unicode glyphs.

### Layout rules
- **Flush-left default.** Centering is reserved for single-element hero moments (one per page max).
- **Index cards.** Lists of projects render as horizontal strips: 1px top rule, project code in mono (left), title in display (center-left, 2× size), metadata in mono (right). No dots. No colons. The rule IS the divider.
- **ASCII header bar** sits at top of every page: `247420 // an entrypoint // ${page} // ${date}` in mono caps. It's the "dateline."
- **No fixed sidebars.** Nav is a top strip or — on internal tools — a slim left rail with mono labels.
- **Tables are first-class.** Use `<table>` for tabular data, styled with hairlines.

### Fixed elements
- Header: **fixed** at top, 56px tall desktop / 48px mobile, hairline bottom border, backdrop blur as above.
- Footer: **static**, flush at bottom, contains a tombstone line plus the permanent status: `247420 / mmxxvi / probably emerging 🌀 / built in public / source`.
- Nothing else is fixed. No floating CTAs. No cookie banners.

---

## Tech stack (mandatory, not a suggestion)

247420 projects are **buildless**. No webpack, no vite, no npm run dev. You open `index.html`, it works. Every component in this system is designed for that reality.

### The two libraries

**[Ripple UI](https://ripple-ui.com)** (`rippleui@1.12.1`) — Tailwind-based component CSS. We use it for the primitives (buttons, inputs, switches, menus, modals, tables) so we don't rebuild what's already solved. We then **override** the visual identity on top of it using `colors_and_type.css`. Ripple gives us the behavior; our layer gives us the voice. A 247420 site must **never look like** the stock Ripple UI demo.

**[WebJSX](https://webjsx.org)** (`webjsx@0.0.73`) — tiny JSX → DOM library designed for Web Components. Two functions: `createElement` and `applyDiff`. No virtual DOM framework, no hooks, no state manager. We write Custom Elements (`class X extends HTMLElement`) and use `applyDiff` inside their `render()` method.

- **Routing:** `webjsx-router` (`match`, `goto`, `initRouter`).
- **State:** plain properties + observed attributes. Plain `EventTarget` pub-sub or `localStorage` for anything more. No Redux/Zustand/signals.

### The iron rule: localize imports

> **Never link a CDN from production HTML. Ever.**

Every external dependency is downloaded once, committed under `vendor/`, and referenced via relative path. Non-negotiable. Reasons:

1. **Offline-first / air-gapped dev.** Projects must load without the internet.
2. **Supply-chain paranoia.** A compromised CDN is a compromised site. Pin and vendor.
3. **Link-rot immunity.** Our sites must be legible in 10 years.
4. **Reproducibility.** The repo is the source of truth.

### The canonical HTML head

Every 247420 page starts with this:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>…</title>

  <link rel="stylesheet" href="/vendor/rippleui-1.12.1.css">
  <link rel="stylesheet" href="/colors_and_type.css">

  <script type="importmap">
  {
    "imports": {
      "webjsx":             "/vendor/webjsx/index.js",
      "webjsx/":            "/vendor/webjsx/",
      "webjsx/jsx-runtime": "/vendor/webjsx/jsx-runtime.js",
      "webjsx-router":      "/vendor/webjsx-router.js"
    }
  }
  </script>
  <script type="module" src="/app.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

### Vendor layout

```
vendor/
├── rippleui-1.12.1.css     ← Ripple UI compiled CSS (CSS-only usage)
├── webjsx/                  ← WebJSX package, internal imports preserved
│   ├── index.js
│   ├── createElement.js
│   ├── applyDiff.js
│   ├── createDOMElement.js
│   ├── types.js
│   ├── jsx-runtime.js
│   ├── jsx.js
│   └── package.json         ← lock the version
└── webjsx-router.js         ← single-file router
```

**CSS-only Ripple.** We use the compiled stylesheet directly — no Tailwind install needed. `.btn`, `.btn-primary`, `.input`, `.switch`, `.menu`, `.modal` etc. all work out of the box.

### Writing a component (the pattern)

Custom Element + WebJSX. **We ship pure `.js`** — browsers don't parse `.jsx` natively and a build step violates the buildless rule. JSX is fine for scratch work on a dev's machine; the repo contains `.js`.

```js
// ui_kits/homepage/Header.js
import * as webjsx from "webjsx";
const h = webjsx.createElement;

class SevenHeader extends HTMLElement {
  connectedCallback() { this.render(); }
  render() {
    webjsx.applyDiff(this,
      h("header", { class: "grid-12 py-6 border-b border-ink" },
        h("a", { class: "col-span-3 t-wordmark", href: "/" }, "247420"),
        h("nav", { class: "col-span-9 flex gap-6 justify-end t-nav" },
          h("a", { href: "/work" },    "work"),
          h("a", { href: "/writing" }, "writing"),
          h("a", { href: "/gm" },      "gm"),
        ),
      ),
    );
  }
}
customElements.define("seven-header", SevenHeader);
```

Verbose, yes. Zero toolchain, yes. That's the trade.

### What's allowed / what's banned

| Allowed | Banned |
|---|---|
| Ripple UI classes (`.btn`, `.input`, `.menu`, `.modal`, `.switch`, etc.) | React, Vue, Svelte, Solid, Preact |
| WebJSX + Custom Elements | Next.js, Nuxt, SvelteKit, Remix |
| Plain CSS / our override CSS | `<script src="https://cdn...">` anywhere |
| Import maps pointing at `/vendor/` | `<script src="https://unpkg.com/...">` |
| Native `fetch`, `EventTarget`, `localStorage` | Redux / Zustand / Jotai / Recoil |
| Hand-written `createElement` calls | Webpack / Vite / Parcel / Turbopack |
| Dropping in a single-file vendored lib (e.g. `htm`) | Anything requiring a dev server |

---

## Iconography

- **Primary set: Lucide**, **vendored** under `assets/icons/lucide/` as SVG files. Never loaded from a CDN.
- **Stroke width is always 1.5px** at default 24px. Scale proportionally. Never use filled icons.
- **Color:** always `currentColor`. No branded icon color.
- **SVGs only.** No icon fonts (those were fine in 2014). No PNG icons.
- **Emoji:** avoided in UI. In prose — fine, once in a while, as punctuation — but consider a unicode glyph first.
- **Unicode glyphs as icons** are encouraged: `→`, `·`, `※`, `¶`, `§`, `*`, `†`, `‡`, `↗`, `↳`, `■`, `▲`, `●`, `○`, `—`, `…`, `/`, `//`, `##`. Free icon set.
- **Project marks** are **mono wordmarks**, not pictorial logos: `gm`, `flatspace`, `thebird`, `spoint`, `zellous`. Mono caps or mono lowercase, no decoration. If a mark needs embellishment, it gets **one** mono character as a prefix: `// gm`, `§ flatspace`, `→ thebird`.
- **The only graphic mark:** the **247420 stamp** — a black square, rotated 2°, containing `247420` in mono caps with a hairline border. The rubber-stamp approval. Used once per page, max.

---

## Index

### Root
- `README.md` — this file
- `colors_and_type.css` — all CSS variables + semantic type classes
- `SKILL.md` — Claude Code / Agent Skills manifest

### Folders
- `fonts/` — webfonts (JetBrains Mono, Instrument Serif, Redaction when available)
- `assets/` — logos, wordmarks, textures, icons
- `vendor/` — Ripple UI + WebJSX, localized (see Tech stack)
- `preview/` — design system cards (one per concept) shown in the Design System tab
- `ui_kits/` — full UI recreations per product surface
  - `homepage/` — 247420.xyz
  - `project_page/` — generic project landing (gm, flatspace, spoint, zellous)
  - `docs/` — docs template
  - `blog/` — writing surface
- `slides/` — deck template (title, content, quote, comparison, end)

### Quick links
- Color + type tokens → `colors_and_type.css`
- Homepage → `ui_kits/homepage/index.html`
- Project page → `ui_kits/project_page/index.html`
- Docs → `ui_kits/docs/index.html`
- Blog → `ui_kits/blog/index.html`
- Slide deck → `slides/index.html`
- Agent skill manifest → `SKILL.md`
