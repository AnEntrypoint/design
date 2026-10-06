#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkManyDirs } from './lint-shared.mjs';
import { ratchetOrThrow } from './lint-tokens.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SCAN_DIRS = ['ui_kits', 'site', 'preview', 'slides', 'src'];
const SCAN_EXT = new Set(['.js', '.mjs', '.html']);
const SKIP_DIRS = new Set(['node_modules', 'vendor', 'dist']);
const SELF_CONTAINED_CDN_COMPONENTS_RE = /^src\/components\/game-editor-kit\//;

const LAYOUT_RE = /grid-template|display:\s*(?:grid|flex)|(?:min-|max-)?(?:width|height):|(?:padding|margin)(?:-[a-z]+)*:|font-size:|letter-spacing:|text-transform:|font-family:/;

const DYNAMIC_NON_LAYOUT_DECLARATIONS = [
    /^--[\w-]+:/,
    /^background:\s*var\(/,
    /^background-color:\s*var\(/,
    /^transform:/,
    /^color:\s*var\(/,
];

const STYLE_ATTR_RE = /style\s*[=:]\s*("([^"]*)"|'([^']*)')/g;

function declarationsAllowed(value) {
    return value.split(';').map((d) => d.trim()).filter(Boolean)
        .every((d) => DYNAMIC_NON_LAYOUT_DECLARATIONS.some((re) => re.test(d)));
}

const scannedFiles = () => walkManyDirs(SCAN_DIRS.map((d) => path.join(root, d)), SCAN_EXT, { skipDirs: SKIP_DIRS });

export function findInlineStyleViolations() {
    const violations = [];
    for (const file of scannedFiles()) {
        const rel = path.relative(root, file).split(path.sep).join('/');
        if (SELF_CONTAINED_CDN_COMPONENTS_RE.test(rel)) continue;
        const src = fs.readFileSync(file, 'utf8');
        src.split(/\r?\n/).forEach((line, i) => {
            for (const m of line.matchAll(STYLE_ATTR_RE)) {
                const value = m[2] ?? m[3] ?? '';
                if (LAYOUT_RE.test(value) && !declarationsAllowed(value)) {
                    violations.push(`${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
                }
            }
        });
    }
    return violations.sort();
}

const BASELINE_FILE = path.join(root, 'scripts', 'lint-inline-styles.baseline.json');

export function lintInlineStylesOrThrow() {
    ratchetOrThrow({
        label: 'lint-inline-styles',
        flag: '--write-inline-styles-baseline',
        baselineFile: BASELINE_FILE,
        violations: findInlineStyleViolations(),
        scope: `${SCAN_DIRS.join('/')} (${scannedFiles().length} source files)`,
        noun: 'layout propert(ies) hard-coded in an inline style= attribute',
        fix: 'Add a .ds-<thing> class to the relevant sheet and use it instead. An inline layout string escapes every media query, every [data-density] rule and every touch-target floor, none of which can reach a style= attribute. If the value is genuinely DYNAMIC and non-layout (a custom-property write, a var() swatch fill, a transform), express it that way so DYNAMIC_NON_LAYOUT_DECLARATIONS covers it.',
    });
}

if (process.argv[1] && process.argv[1].endsWith('lint-inline-styles.mjs')) {
    try { lintInlineStylesOrThrow(); }
    catch (e) { console.error(e.message); process.exit(1); }
}
