# SKILL: authoring rules for agents working in this repo

Referenced from `README.md`, the homepage's "skill" link and `CONTRIBUTING.md`. These rules are taken from the voice and content conventions the repo's kits, previews and copy already follow.

## Voice

- **Technical and plain in shipped UI copy.** Kit captions, empty states and error copy read like `preview/dropzone.html`: "dropzone is a tonal panel that swaps to `--panel-select` on dragover. **preventDefault must run on document as well as the zone** or the browser navigates to the dropped file." State the technical fact, and bold only the load-bearing constraint.
- **State the real number.** "5.84:1 against --paper", "22 kits", "39 tokens overridden in dark"; not "great contrast" or "a handful of tokens". If the number is not known, say what was verified.
- **Dateline labels are the one all-caps convention.** e.g. `247420 · FILE-BROWSER · DROPZONE` / `TONAL TARGET · NO DASHED BORDERS` in `.dateline` strips: short, mono, uppercase, `·`-separated. Everything else (headings, body copy, button labels) is lowercase or sentence case.
- **No mascot or in-joke language in product copy.** `--alt` is a neutral gray token like any other; refer to it by name.
- **Never present an example value as current.** A version, date or count shown in a specimen is either derived from its source or labelled "example".

## Content patterns

- **Capitalisation**: sentence case for headings and body text; Title Case only for proper nouns and component names (`Btn`, `WorkspaceShell`); UPPERCASE only inside a `.dateline` or mono label.
- **Numbers in claims are traceable** to a generator or a hand-verified measurement. `home.yaml`'s kit and component counts, the a11y report's violation count and every contrast ratio in `colors_and_type.css` follow this; a stale number left behind after a change is a bug.
- **Badges carry information.** A chip or badge that restates the default state (a "live" tag on every row, a "new" tag with no date) is removed.
- **Primitive selection, layout composition, form, error and empty-state patterns**: see `docs/usage-guidelines.md`.
- **Stamp vs badge vs rail**: see the "Stamp vs badge vs rail" section of `THEME.md`.

## What this file is not

Not a legal or brand style guide, not a replacement for the setup steps in `CONTRIBUTING.md`, and not a place for restyle history, which belongs in the "Design history" section of `TOKENS-CHANGELOG.md`.
