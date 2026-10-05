#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTokensDrift, findSiteYamlDrift } from './generate-tokens-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const COMPONENT_SHEETS = [
    'app-shell.css',
    'community.css',
    'chat.css',
    'editor-primitives.css',
    'community-app.css',
    'gm-prose.css',
    'src/kits/os/theme.css',
    'src/kits/os/freddie-dashboard.css',
    'src/kits/spoint/loading-screen.css',
    'app-surfaces.css',
    'marketing.css',
    'src/kits/spoint/game-hud.css',
    'src/kits/spoint/host-join-lobby.css',
    'src/css/app-shell/git-status.css',
    'src/css/app-shell/plugins-config.css',
    'src/css/app-shell/models-config.css',
    'src/css/app-shell/skills-config.css',
];

export function extraCssFiles() {
    const raw = process.env.DS_LINT_EXTRA_CSS_FILES;
    if (!raw) return [];
    return raw.split(',').map((s) => s.trim()).filter(Boolean).map((f) => path.resolve(process.cwd(), f));
}

const FULL_COVERAGE_DIRS = ['src/css/app-shell'];

const toPosix = (rel) => rel.split(path.sep).join('/');
const blankKeepingNewlines = (m) => m.replace(/[^\n]/g, ' ');
const IS_REMOTE_IMPORT = /^(?:[a-z]+:)?\/\//i;

function importTargets(rel, src) {
    const dir = path.posix.dirname(toPosix(rel));
    const out = [];
    const re = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        const spec = m[1];
        if (IS_REMOTE_IMPORT.test(spec)) continue;
        out.push(path.posix.normalize(path.posix.join(dir, spec)));
    }
    return out;
}

function findUncoveredSheets(seen) {
    const uncovered = [];
    for (const dir of FULL_COVERAGE_DIRS) {
        const abs = path.join(root, dir);
        if (!fs.existsSync(abs)) continue;
        for (const name of fs.readdirSync(abs)) {
            if (!name.endsWith('.css')) continue;
            const key = `${dir}/${name}`;
            if (!seen.has(key)) uncovered.push(key);
        }
    }
    return uncovered;
}

let _expandedCache = null;
export function expandSheets() {
    if (_expandedCache) return _expandedCache;
    const seen = new Set();
    const order = [];
    const visit = (rel) => {
        const key = toPosix(rel);
        if (seen.has(key)) return;
        seen.add(key);
        const file = path.join(root, key);
        if (!fs.existsSync(file)) { console.warn('[lint-tokens] missing:', key); return; }
        order.push(key);
        const src = fs.readFileSync(file, 'utf8');
        for (const t of importTargets(key, src)) visit(t);
    };
    for (const rel of COMPONENT_SHEETS) visit(rel);
    for (const abs of extraCssFiles()) {
        if (seen.has(abs)) continue;
        seen.add(abs);
        if (!fs.existsSync(abs)) { console.warn('[lint-tokens] missing extra sheet:', abs); continue; }
        order.push(abs);
    }

    const uncovered = findUncoveredSheets(seen);
    if (uncovered.length) {
        throw new Error('[lint-tokens] FAIL: stylesheet(s) in a full-coverage directory are not reachable from any COMPONENT_SHEETS entry, so they are unlinted:\n  '
            + uncovered.join('\n  ')
            + '\n[lint-tokens] Add an @import for each to the owning barrel sheet (e.g. app-shell.css), or add it directly to COMPONENT_SHEETS in scripts/lint-tokens.mjs.');
    }

    _expandedCache = order;
    return order;
}

export function resolveSheet(rel) {
    return path.isAbsolute(rel) ? rel : path.join(root, rel);
}

const TOKEN_SOURCE = 'colors_and_type.css';

export const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\bokl(?:ch|ab)\(/;
export const SPACING_RE = /\b(?:margin|padding|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?\s*:\s*[^;}]*?\d[\d.]*(?:px|em|rem)\b/;
export const RADIUS_RE = /(?:-webkit-|-moz-)?border-radius\s*:\s*[^;}]*?\d[\d.]*(?:px|%|em|rem|vw|vh|vmin|vmax|ch)\b/;
export const FONTSIZE_RE = /\bfont-size\s*:\s*[^;}]*?\d[\d.]*(?:px|em|rem)\b/;
const ZINDEX_RE = /\bz-index\s*:\s*-?\d/;
const TRANSITION_ALL_RE = /\btransition(?:-property)?\s*:\s*[^;}]*\ball\b/;
const IMPORTANT_RE = /!\s*important/;

const CRT_CANVAS_BLACK = '#0b0d10';
const EMBEDDED_WEB_WHITE = '#ffffff';
const THEBIRD_PRESET_TOKENS = ['#F5F0E4', '#EFE9DB', '#E3DAC7'];
const BRAND_LEAD_FOR_UNSCOPED_CONSUMERS = '--accent-primary: #247420';
const LIGHTBOX_LETTERBOX_BLACK = 'background: #000';
const PRINT_PAPER_SIGNAL_PALETTE = ['--flame:#C53E00', '--amber:#7C570F', '--warn:#E0241A', '--sky:#404040'];

const ALLOW = {
    'src/kits/os/theme.css': [
        CRT_CANVAS_BLACK,
        EMBEDDED_WEB_WHITE,
        ...THEBIRD_PRESET_TOKENS,
        BRAND_LEAD_FOR_UNSCOPED_CONSUMERS,
    ],
    'editor-primitives.css': [LIGHTBOX_LETTERBOX_BLACK],
    'src/css/app-shell/plugins-config.css': ['border-radius: 11px'],
    'app-surfaces.css': PRINT_PAPER_SIGNAL_PALETTE,
};

const RADIUS_ALLOW = {
    'app-surfaces.css': ['border-radius: 999px'],
    'src/kits/spoint/game-hud.css': ['border-radius: 4px', 'border-radius: 6px'],
};

const lineMatchesAny = (table, rel, line) => (table[rel] || []).some((s) => line.includes(s));
const isAllowed = (rel, line) => lineMatchesAny(ALLOW, rel, line);
const isRadiusAllowed = (rel, line) => lineMatchesAny(RADIUS_ALLOW, rel, line);

export function stripComments(src) {
    return src.replace(/\/\*[^]*?\*\//g, blankKeepingNewlines);
}

export function stripThemableLiterals(code) {
    return code
        .replace(/var\(\s*--[\w-]+\s*,\s*([^()]*?)\s*\)/g, (whole, fallback) =>
            whole.replace(fallback, blankKeepingNewlines(fallback)))
        .replace(/(?:box|text)-shadow\s*:[^;}]*/g, blankKeepingNewlines);
}

const blankTokenAnchoredExpressions = (code, fnPattern, tokenPrefix) =>
    code.replace(new RegExp(`${fnPattern}\\([^()]*var\\(\\s*--${tokenPrefix}-[\\w-]+\\s*\\)[^()]*\\)`, 'g'), blankKeepingNewlines);

function scanSheets({ pattern, isExempt, prepare }) {
    const violations = [];
    for (const rel of expandSheets()) {
        const file = resolveSheet(rel);
        if (!fs.existsSync(file)) continue;
        const src = fs.readFileSync(file, 'utf8');
        const codeLines = prepare(src).split(/\r?\n/);
        const rawLines = src.split(/\r?\n/);
        codeLines.forEach((code, i) => {
            if (pattern.test(code) && !isExempt(rel, rawLines[i])) {
                violations.push(`${rel}:${i + 1}: ${rawLines[i].trim()}`);
            }
        });
    }
    return violations;
}

const prepareWithoutLiteralFallbacks = (anchoredFn, tokenPrefix) => (src) =>
    blankTokenAnchoredExpressions(stripThemableLiterals(stripComments(src)), anchoredFn, tokenPrefix);

export function findTokenViolations() {
    const violations = [];
    for (const rel of expandSheets()) {
        const file = resolveSheet(rel);
        if (!fs.existsSync(file)) { console.warn('[lint-tokens] missing:', rel); continue; }
        const src = fs.readFileSync(file, 'utf8');
        const codeLines = stripThemableLiterals(stripComments(src)).split(/\r?\n/);
        const rawLines = src.split(/\r?\n/);
        codeLines.forEach((code, i) => {
            if (COLOR_RE.test(code) && !isAllowed(rel, rawLines[i])) {
                violations.push(`${rel}:${i + 1}: ${rawLines[i].trim()}`);
            }
        });
    }
    return violations;
}

export function findRadiusViolations() {
    return scanSheets({
        pattern: RADIUS_RE,
        isExempt: (rel, line) => isAllowed(rel, line) || isRadiusAllowed(rel, line),
        prepare: prepareWithoutLiteralFallbacks('calc', 'r'),
    });
}

export function findSpacingViolations() {
    return scanSheets({
        pattern: SPACING_RE,
        isExempt: isAllowed,
        prepare: prepareWithoutLiteralFallbacks('calc', 'space'),
    });
}

export function findFontSizeViolations() {
    return scanSheets({
        pattern: FONTSIZE_RE,
        isExempt: isAllowed,
        prepare: prepareWithoutLiteralFallbacks('(?:calc|max|min|clamp)', 'fs'),
    });
}

export function findZIndexViolations() {
    return scanSheets({
        pattern: ZINDEX_RE,
        isExempt: isAllowed,
        prepare: prepareWithoutLiteralFallbacks('calc', 'z'),
    });
}

export function findTransitionAllViolations() {
    return scanSheets({ pattern: TRANSITION_ALL_RE, isExempt: isAllowed, prepare: stripComments });
}

export function findImportantViolations() {
    return scanSheets({ pattern: IMPORTANT_RE, isExempt: isAllowed, prepare: stripComments });
}

const SPACING_BASELINE_FILE = path.join(root, 'scripts', 'lint-spacing.baseline.json');

export function lintSpacingReport() {
    const violations = findSpacingViolations();
    if (violations.length) {
        console.warn('[lint-spacing] REPORT: ' + violations.length + ' raw margin/padding/gap literal(s) bypassing the --space-* scale from '
            + TOKEN_SOURCE + ':\n  ' + violations.slice(0, 20).join('\n  ')
            + (violations.length > 20 ? `\n  ...and ${violations.length - 20} more` : ''));
        return;
    }
    console.log('[lint-spacing] OK: ' + expandSheets().length + ' component sheets use only the --space-* spacing scale.');
}

export function lintSpacingOrThrow() {
    ratchetOrThrow({
        label: 'lint-spacing',
        flag: '--write-spacing-baseline',
        baselineFile: SPACING_BASELINE_FILE,
        violations: findSpacingViolations(),
        extraPaths: extraCssFiles(),
        extraEnv: 'DS_LINT_EXTRA_SPACING_BASELINE',
        noun: `raw margin/padding/gap literal(s) bypassing the --space-* scale from ${TOKEN_SOURCE}`,
        fix: 'Use --space-N tokens for new declarations.',
    });
}

function splitCorpus(violations, extraPaths) {
    if (!extraPaths || !extraPaths.length) return { own: violations, extra: [] };
    const own = [], extra = [];
    for (const v of violations) {
        (extraPaths.some((p) => v.startsWith(p + ':')) ? extra : own).push(v);
    }
    return { own, extra };
}

const writeBaseline = (baselineFile, count) =>
    fs.writeFileSync(baselineFile, JSON.stringify({ count, updated: new Date().toISOString() }, null, 2) + '\n');

function throwIfConsumerSheetsOverBudget({ label, noun, fix, extraEnv, extra }) {
    if (!extraEnv || !extra.length) return;
    const budget = Number(process.env[extraEnv] || 0);
    if (extra.length <= budget) return;
    throw new Error(`[${label}] FAIL: ${extra.length} ${noun} in CONSUMER sheets registered via DS_LINT_EXTRA_CSS_FILES/DS_LINT_EXTRA_JS_DIRS, over this project's budget of ${budget}:\n  `
        + extra.join('\n  ')
        + `\n[${label}] ${fix}`
        + `\n[${label}] These files are not part of the kit, so the kit's own frozen baseline does not cover them. If every one above is genuinely load-bearing, set ${extraEnv}=${extra.length} in YOUR lint invocation, with a comment saying why. Do not re-freeze the kit's baseline, which would leave the KIT a slot of slack it did not earn.`);
}

export function ratchetOrThrow({ label, flag, baselineFile, violations, noun, fix, scope, extraPaths, extraEnv }) {
    const { own, extra } = splitCorpus(violations, extraPaths);
    const count = own.length;

    throwIfConsumerSheetsOverBudget({ label, noun, fix, extraEnv, extra });

    if (process.argv.includes(flag)) {
        writeBaseline(baselineFile, count);
        console.log(`[${label}] wrote baseline count=${count} to ${path.relative(root, baselineFile)}`);
        return;
    }

    if (!fs.existsSync(baselineFile)) {
        writeBaseline(baselineFile, count);
        console.log(`[${label}] no baseline found, wrote initial baseline count=${count}`);
        return;
    }

    const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    if (count > baseline.count) {
        throw new Error(`[${label}] FAIL: ${count} ${noun} exceeds frozen baseline ${baseline.count}:\n  `
            + own.join('\n  ')
            + `\n[${label}] ${fix} Re-run with ${flag} ONLY if this growth is reviewed and intentional. The baseline is debt to drive down, not a budget to raise.`);
    }
    console.log(`[${label}] PASS: ${count} <= baseline ${baseline.count} (${scope || `${expandSheets().length} component sheets`})`
        + (extra.length ? ` + ${extra.length} in consumer sheets (budget ${Number(process.env[extraEnv] || 0)})` : '') + '.');
}

const FONTSIZE_BASELINE_FILE = path.join(root, 'scripts', 'lint-fontsize.baseline.json');

export function lintFontSizeOrThrow() {
    ratchetOrThrow({
        label: 'lint-fontsize',
        flag: '--write-fontsize-baseline',
        baselineFile: FONTSIZE_BASELINE_FILE,
        violations: findFontSizeViolations(),
        extraPaths: extraCssFiles(),
        extraEnv: 'DS_LINT_EXTRA_FONTSIZE_BASELINE',
        noun: `raw font-size literal(s) bypassing the --fs-* type scale from ${TOKEN_SOURCE}`,
        fix: 'Use a --fs-pico/--fs-nano/--fs-micro/--fs-tiny/--fs-xs/--fs-sm/--fs-body/--fs-lg/--fs-xl (or --fs-h*/--fs-hero/--fs-mega) token. If the value is genuinely off-scale (an ICON size matched to its chip box, or an em-relative inline size that must track its parent), leave the literal and add a comment in the sheet saying which, so the next reader does not "fix" it.',
    });
}

const IMPORTANT_BASELINE_FILE = path.join(root, 'scripts', 'lint-important.baseline.json');

export function lintImportantOrThrow() {
    ratchetOrThrow({
        label: 'lint-important',
        flag: '--write-important-baseline',
        baselineFile: IMPORTANT_BASELINE_FILE,
        violations: findImportantViolations(),
        extraPaths: extraCssFiles(),
        extraEnv: 'DS_LINT_EXTRA_IMPORTANT_BASELINE',
        noun: '`!important` declaration(s)',
        fix: 'Beat the losing rule on specificity or source order instead. An `!important` cannot be overridden by a consumer theming the SDK without another `!important`, so each one is a permanent hole in the themability this lint file exists to protect. If it is genuinely load-bearing (a utility reset, a print/forced-colors/reduced-motion override that must win), say so in a comment on the line.',
    });
}

export function lintZIndexOrThrow() {
    const violations = findZIndexViolations();
    if (violations.length) {
        throw new Error('[lint-zindex] FAIL: raw z-index literals in component sheets (use var(--z-below/--z-base/--z-raised/--z-sticky/--z-header/--z-drawer/--z-window/--z-dock/--z-dropdown/--z-modal/--z-toast/--z-tooltip/--z-top) from '
            + TOKEN_SOURCE + '):\n  ' + violations.join('\n  ')
            + `\n[lint-zindex] ${violations.length} violation(s). Pick the rung that names what the element IS (a dropdown is --z-dropdown, not "800-ish"); a bare number races on source order against every other bare number in the SDK. If a layer genuinely has no rung, add one to ${TOKEN_SOURCE} rather than a literal here.`);
    }
    console.log('[lint-zindex] OK: ' + expandSheets().length + ' component sheets use only the --z-* stacking scale.');
}

export function lintTransitionAllOrThrow() {
    const violations = findTransitionAllViolations();
    if (violations.length) {
        throw new Error('[lint-transition-all] FAIL: `transition: all` in component sheets:\n  '
            + violations.join('\n  ')
            + `\n[lint-transition-all] ${violations.length} violation(s). Name the properties you are actually animating (e.g. \`transition: background var(--dur-base) var(--ease), color var(--dur-base) var(--ease)\`). \`all\` animates every changed property including layout ones (width/height/padding/top), forcing layout+paint per frame instead of a compositor-only transform/opacity animation, and it silently starts animating whatever property the NEXT edit adds to the same rule.`);
    }
    console.log('[lint-transition-all] OK: ' + expandSheets().length + ' component sheets animate named properties, never `all`.');
}

const EXPLICIT_DARK_SELECTOR = '[data-theme="ink"],';
const AUTO_DARK_MEDIA_QUERY = '@media (prefers-color-scheme: dark)';

function braceBodyAfter(src, idx) {
    if (idx < 0) return null;
    const open = src.indexOf('{', idx);
    if (open < 0) return null;
    let i = open + 1, depth = 1;
    while (i < src.length && depth > 0) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') depth--;
        i++;
    }
    return src.slice(open + 1, i - 1);
}

const declaredCustomProperties = (body) => new Set([...body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

function findDarkBlockParityViolations() {
    const src = fs.readFileSync(path.join(root, TOKEN_SOURCE), 'utf8');
    const explicit = braceBodyAfter(src, src.indexOf(EXPLICIT_DARK_SELECTOR));
    const auto = braceBodyAfter(src, src.indexOf(AUTO_DARK_MEDIA_QUERY));
    if (explicit == null || auto == null) {
        return ['could not locate both dark blocks in ' + TOKEN_SOURCE + ': the parity gate needs the [data-theme="ink"], selector and the @media (prefers-color-scheme: dark) block'];
    }
    const a = declaredCustomProperties(explicit), b = declaredCustomProperties(auto);
    const onlyExplicit = [...a].filter((t) => !b.has(t));
    const onlyAuto = [...b].filter((t) => !a.has(t));
    const out = [];
    for (const t of onlyExplicit) out.push(t + ': in [data-theme=ink|dark] but NOT in @media (prefers-color-scheme: dark), so it renders its paper value under data-theme="auto" on a dark OS');
    for (const t of onlyAuto) out.push(t + ': in @media (prefers-color-scheme: dark) but NOT in [data-theme=ink|dark], so it renders its paper value when the theme is set explicitly');
    return out;
}

function explicitDarkTokenCount() {
    const src = fs.readFileSync(path.join(root, TOKEN_SOURCE), 'utf8');
    return declaredCustomProperties(braceBodyAfter(src, src.indexOf(EXPLICIT_DARK_SELECTOR))).size;
}

export function lintDarkParityOrThrow() {
    const violations = findDarkBlockParityViolations();
    if (violations.length) {
        throw new Error('[lint-dark-parity] FAIL: the two dark palette blocks in ' + TOKEN_SOURCE + ' declare different token sets:\n  '
            + violations.join('\n  ')
            + `\n[lint-dark-parity] ${violations.length} token(s) out of parity. Add the missing declaration to the other block. Both blocks must stay token-for-token identical: one serves the explicit ink/dark opt-in and one serves data-theme="auto" on a dark OS, and a token present in only one renders its paper-tuned value in the other mode, which is invisible until someone opens that specific combination.`);
    }
    console.log('[lint-dark-parity] OK: both dark palette blocks declare the same ' + explicitDarkTokenCount() + ' tokens.');
}

export function lintRadiusOrThrow() {
    const violations = findRadiusViolations();
    if (violations.length) {
        throw new Error('[lint-radius] FAIL: raw border-radius literals in component sheets (use var(--r-hair/--r-0/--r-1/--r-2/--r-3/--r-4/--r-pill) from '
            + TOKEN_SOURCE + '):\n  ' + violations.join('\n  ')
            + `\n[lint-radius] ${violations.length} violation(s). If a literal is genuinely non-scale (e.g. a one-off outside every rung), add it to the audited ALLOW list in scripts/lint-tokens.mjs.`);
    }
    console.log('[lint-radius] OK: ' + expandSheets().length + ' component sheets use only the --r-* radius scale.');
}

export function lintTokensOrThrow() {
    const violations = findTokenViolations();
    if (violations.length) {
        throw new Error('[lint-tokens] FAIL: raw color literals in component sheets (use var(--token) from '
            + TOKEN_SOURCE + '):\n  ' + violations.join('\n  ')
            + `\n[lint-tokens] ${violations.length} violation(s). If a literal is genuinely non-themable, add it to the audited ALLOW list in scripts/lint-tokens.mjs.`);
    }
    console.log('[lint-tokens] OK: ' + expandSheets().length + ' component sheets are literal-free (all color from tokens).');
}

export function lintTokensJsonInSyncOrThrow() {
    const { cssEdits } = findTokensDrift();
    const { edits: yamlEdits } = findSiteYamlDrift();
    if (cssEdits.length || yamlEdits.length) {
        const lines = [
            ...cssEdits.map((e) => `colors_and_type.css: ${e.name}: "${e.oldValue}" (committed) != "${e.newValue}" (tokens.json)`),
            ...yamlEdits.map((e) => `site.yaml: ${e.key}: "${e.current}" (committed) != "${e.wanted}" (tokens.json)`),
        ];
        throw new Error(`[lint-tokens-json] FAIL: colors_and_type.css / site.yaml out of sync with tokens.json:\n  ${lines.join('\n  ')}\n[lint-tokens-json] Run \`node scripts/generate-tokens-css.mjs\` to re-sync (or \`npm run tokens\` first if the CSS was the one intentionally retuned).`);
    }
    console.log('[lint-tokens-json] OK: colors_and_type.css and site.yaml match tokens.json.');
}

const STANDALONE_GATES = [
    lintTokensOrThrow,
    lintRadiusOrThrow,
    lintZIndexOrThrow,
    lintDarkParityOrThrow,
    lintTransitionAllOrThrow,
    lintSpacingOrThrow,
    lintFontSizeOrThrow,
    lintImportantOrThrow,
    lintTokensJsonInSyncOrThrow,
];

if (process.argv[1] && process.argv[1].endsWith('lint-tokens.mjs')) {
    for (const gate of STANDALONE_GATES) {
        try { gate(); }
        catch (e) { console.error(e.message); process.exit(1); }
    }
}
