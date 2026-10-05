#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN_SOURCE = 'colors_and_type.css';

const TEXT_MIN = 4.5;
const UI_MIN = 3;

const ROOT_SELECTOR = ':root:not(:where(.ds-247420 .ds-247420))';
const DARK_SELECTORS = '[data-theme="ink"],[data-theme="dark"],[data-theme="github-dark"]';
const DARK_AUTO_SELECTOR = '[data-theme="auto"]';

const MODES = [
    { name: 'light', selectors: [ROOT_SELECTOR] },
    { name: 'paper', selectors: [ROOT_SELECTOR, '[data-theme="paper"]'] },
    { name: 'thebird', selectors: [ROOT_SELECTOR, '[data-theme="thebird"]'] },
    { name: 'herd', selectors: [ROOT_SELECTOR, '[data-theme="herd"]'] },
    { name: 'dark', selectors: [ROOT_SELECTOR, DARK_SELECTORS] },
    { name: 'auto-dark', selectors: [ROOT_SELECTOR, DARK_AUTO_SELECTOR] },
    { name: 'herd-ink', selectors: [ROOT_SELECTOR, '[data-theme="herd-ink"]'] },
    { name: 'dark+acid', selectors: [ROOT_SELECTOR, DARK_SELECTORS, '[data-theme="ink"][data-accent="acid"],[data-theme="dark"][data-accent="acid"]'] },
    { name: 'dark+purple', selectors: [ROOT_SELECTOR, DARK_SELECTORS, '[data-theme="ink"][data-accent="purple"],[data-theme="dark"][data-accent="purple"]'] },
    { name: 'dark+green', selectors: [ROOT_SELECTOR, DARK_SELECTORS, '[data-theme="ink"][data-accent="green"],[data-theme="dark"][data-accent="green"]'] },
    { name: 'light+acid', selectors: [ROOT_SELECTOR, '[data-accent="acid"]'] },
    { name: 'light+green', selectors: [ROOT_SELECTOR, '[data-accent="green"]'] },
    { name: 'light+purple', selectors: [ROOT_SELECTOR, '[data-accent="purple"]'] },
    { name: 'light+mascot', selectors: [ROOT_SELECTOR, '[data-accent="mascot"]'] },
];

const TEXT_TOKENS_ON_PANEL_SURFACES = [
    '--fg', '--fg-2', '--fg-3', '--accent-ink', '--flame', '--warn', '--danger', '--success',
    '--amber', '--green', '--sky', '--mascot-deep', '--cat-green-ink', '--cat-purple-ink', '--cat-mascot-ink',
    '--code-string', '--code-keyword', '--code-fn', '--code-str-alt', '--code-num',
];
const PANEL_SURFACES = ['--bg', '--bg-2'];
const NEUTRAL_TEXT_TOKENS = ['--fg', '--fg-2', '--fg-3'];

const FILL_PAIRS = [
    ['--accent-fg', '--accent'],
    ['--warn-fg', '--warn'],
    ['--warn-fg', '--flame'],
    ['--danger-fg', '--danger'],
    ['--ink', '--sun'],
    ['--green-deep', '--green-tint'],
    ['--purple-deep', '--purple-tint'],
    ['--ink', '--mascot-tint'],
];

const UI_PAIRS = [
    ['--focus-color', '--bg'],
    ['--focus-color', '--bg-2'],
];

export const CONTRAST_PAIRS = [
    ...TEXT_TOKENS_ON_PANEL_SURFACES.flatMap((fg) => PANEL_SURFACES.map((bg) => ({ fg, bg, min: TEXT_MIN, kind: 'text' }))),
    ...NEUTRAL_TEXT_TOKENS.map((fg) => ({ fg, bg: '--bg-3', min: TEXT_MIN, kind: 'text' })),
    ...FILL_PAIRS.map(([fg, bg]) => ({ fg, bg, min: TEXT_MIN, kind: 'fill' })),
    ...UI_PAIRS.map(([fg, bg]) => ({ fg, bg, min: UI_MIN, kind: 'ui' })),
];

function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

function matchingBrace(src, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}' && --depth === 0) return i;
    }
    return src.length - 1;
}

function parseRules(src, out = []) {
    let i = 0;
    while (i < src.length) {
        const open = src.indexOf('{', i);
        if (open < 0) break;
        const prelude = src.slice(i, open).trim();
        const close = matchingBrace(src, open);
        const body = src.slice(open + 1, close);
        if (prelude.startsWith('@media')) parseRules(body, out);
        else if (!prelude.startsWith('@')) out.push({ selector: prelude.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ','), body });
        i = close + 1;
    }
    return out;
}

function declarations(body) {
    const map = new Map();
    for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
    return map;
}

function tokenMapFor(rules, mode) {
    const wanted = new Set(mode.selectors);
    const merged = new Map();
    for (const rule of rules) {
        if (!wanted.has(rule.selector)) continue;
        for (const [k, v] of declarations(rule.body)) merged.set(k, v);
    }
    return merged;
}

const MAX_VAR_CHAIN = 16;

function resolveValue(value, map) {
    let out = value;
    for (let depth = 0; depth < MAX_VAR_CHAIN && /var\(/.test(out); depth++) {
        out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g, (_, name, fallback) => (map.has(name) ? map.get(name) : (fallback ?? 'unresolved')));
    }
    return out.trim();
}

function srgbFromOklch(l, c, h) {
    const a = c * Math.cos(h * Math.PI / 180);
    const b = c * Math.sin(h * Math.PI / 180);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;
    const [l3, m3, s3] = [l_ ** 3, m_ ** 3, s_ ** 3];
    const linear = [
        4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
        -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
        -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
    ];
    const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
    return linear.map((v) => Math.min(1, Math.max(0, gamma(v))));
}

function parseColor(value) {
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (hex) {
        const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
        return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    }
    const rgb = /^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i.exec(value);
    if (rgb) return [rgb[1], rgb[2], rgb[3]].map((v) => Number(v) / 255);
    const lch = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/i.exec(value);
    if (lch) return srgbFromOklch(Number(lch[1]) / (lch[2] ? 100 : 1), Number(lch[3]), Number(lch[4]));
    return null;
}

function luminance(rgb) {
    const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');

export function computeContrastTable(source = fs.readFileSync(path.join(root, TOKEN_SOURCE), 'utf8')) {
    const rules = parseRules(stripComments(source));
    const rows = [];
    const derived = [];
    for (const mode of MODES) {
        const map = tokenMapFor(rules, mode);
        for (const pair of CONTRAST_PAIRS) {
            const fgRaw = map.has(pair.fg) ? resolveValue(map.get(pair.fg), map) : null;
            const bgRaw = map.has(pair.bg) ? resolveValue(map.get(pair.bg), map) : null;
            const fg = fgRaw && parseColor(fgRaw);
            const bg = bgRaw && parseColor(bgRaw);
            if (!fg || !bg) {
                derived.push({ mode: mode.name, fg: pair.fg, bg: pair.bg });
                continue;
            }
            rows.push({ mode: mode.name, ...pair, fgHex: toHex(fg), bgHex: toHex(bg), ratio: contrastRatio(fg, bg) });
        }
    }
    return { rows, derived };
}

export function findContrastViolations(source) {
    const { rows } = computeContrastTable(source);
    return rows
        .filter((r) => r.ratio < r.min)
        .map((r) => `${r.mode}: ${r.fg} ${r.fgHex} on ${r.bg} ${r.bgHex} = ${r.ratio.toFixed(2)}:1 (need ${r.min}:1, ${r.kind})`);
}

export function lintContrastOrThrow() {
    const violations = findContrastViolations();
    if (violations.length) {
        throw new Error('[lint-contrast] FAIL: token pairs below WCAG contrast in ' + TOKEN_SOURCE + ':\n  ' + violations.join('\n  ')
            + `\n[lint-contrast] ${violations.length} pair(s). Fix the token, not the call site: a fill that fails with its paired -fg token needs a different fill or a different -fg, and a text token that fails on --bg-2 needs a lighter (dark) or darker (light) value. CONTRAST_PAIRS in scripts/lint-contrast.mjs names every pair checked.`);
    }
    const { rows, derived } = computeContrastTable();
    console.log(`[lint-contrast] OK: ${rows.length} token pairs across ${MODES.length} theme modes meet WCAG (${derived.length} pairs resolve through color-mix and stay with the browser audit in a11y-audit).`);
}

function printTable() {
    const { rows } = computeContrastTable();
    for (const r of rows) {
        console.log([r.mode, r.kind, r.fg, r.fgHex, r.bg, r.bgHex, r.ratio.toFixed(2), r.ratio >= r.min ? 'ok' : 'FAIL'].join('\t'));
    }
}

if (process.argv[1] && process.argv[1].endsWith('lint-contrast.mjs')) {
    if (process.argv.includes('--table')) printTable();
    else {
        try { lintContrastOrThrow(); }
        catch (e) { console.error(e.message); process.exit(1); }
    }
}
