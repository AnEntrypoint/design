#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkManyDirs } from './lint-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SCAN_DIRS = ['src', 'ui_kits', 'slides', 'site', 'preview'];
const SCAN_EXT = new Set(['.js', '.mjs', '.css', '.html']);
const SHIPPED_ROOT_SHEETS = [
    'app-shell.css', 'chat.css', 'colors_and_type.css', 'community.css',
    'community-app.css', 'editor-primitives.css', 'app-surfaces.css',
    'marketing.css', 'gm-prose.css',
];

const DELIBERATE_GLYPH_CATALOGS = new Set([
    'preview/icons-unicode.html',
    'src/components/overlay-primitives/emoji-picker.js',
]);

const GLYPH_RE = /[●○◆◉◈▸▾▴◀▶★☆✓✗✕✖✔⟶⇒•◦‣◔↓↑→←⏸⏭ℹ⚠⚒◈▷▭▰◎◐▢↗◌▤▦♪§◫⊞❖✷✢⟳↻↺⥁⟲⌛⏳♻\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const ALLOW = {};

function isAllowed(rel, line) {
    const list = ALLOW[rel] || [];
    return list.some((s) => line.includes(s));
}

export function findGlyphViolations() {
    const violations = [];
    const files = walkManyDirs(SCAN_DIRS.map((d) => path.join(root, d)), SCAN_EXT);
    for (const f of SHIPPED_ROOT_SHEETS) { const p = path.join(root, f); if (fs.existsSync(p)) files.push(p); }
    for (const file of files) {
        const rel = path.relative(root, file).split(path.sep).join('/');
        if (DELIBERATE_GLYPH_CATALOGS.has(rel)) continue;
        const src = fs.readFileSync(file, 'utf8');
        src.split(/\r?\n/).forEach((line, i) => {
            if (GLYPH_RE.test(line) && !isAllowed(rel, line)) {
                violations.push(`${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
            }
        });
    }
    return violations;
}

export function lintGlyphsOrThrow() {
    const violations = findGlyphViolations();
    if (violations.length) {
        const msg = '[lint-glyphs] FAIL: decorative unicode glyphs in source '
            + '(use the Icon() SVG component or industry-standard ASCII like -> [x] *):\n  '
            + violations.join('\n  ')
            + `\n[lint-glyphs] ${violations.length} violation(s). If a glyph is a genuine product-design icon, route it through Icon() or add the file to DELIBERATE_GLYPH_CATALOGS / the audited ALLOW list in scripts/lint-glyphs.mjs.`;
        throw new Error(msg);
    }
    console.log('[lint-glyphs] OK: no decorative glyphs in ' + SCAN_DIRS.join('/') + ' (all icons via Icon()/ASCII).');
}

if (process.argv[1] && process.argv[1].endsWith('lint-glyphs.mjs')) {
    try { lintGlyphsOrThrow(); }
    catch (e) { console.error(e.message); process.exit(1); }
}
