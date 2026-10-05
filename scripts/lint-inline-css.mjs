#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    COLOR_RE,
    SPACING_RE,
    RADIUS_RE,
    FONTSIZE_RE,
    stripComments,
    stripThemableLiterals,
    ratchetOrThrow,
} from './lint-tokens.mjs';
import { walkManyDirs } from './lint-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SCAN_DIRS = ['preview', 'ui_kits'].map((d) => path.join(root, d));
const SKIPPED_DIRS = new Set(['node_modules', 'vendor', 'dist']);

function extraJsScanDirs() {
    const raw = process.env.DS_LINT_EXTRA_JS_DIRS;
    if (!raw) return [];
    return raw.split(',').map((s) => s.trim()).filter(Boolean).map((d) => path.resolve(process.cwd(), d));
}

const blankKeepingNewlines = (s) => s.replace(/[^\n]/g, ' ');

const maskHtmlCommentsAndStyleAttributes = (html) => html
    .replace(/<!--[^]*?-->/g, blankKeepingNewlines)
    .replace(/\bstyle\s*=\s*"[^"]*"/g, blankKeepingNewlines)
    .replace(/\bstyle\s*=\s*'[^']*'/g, blankKeepingNewlines);

export function extractStyleBlocks(html) {
    const masked = maskHtmlCommentsAndStyleAttributes(html);
    let out = blankKeepingNewlines(masked);
    const re = /<style\b[^>]*>([^]*?)<\/style\s*>/gi;
    let m;
    while ((m = re.exec(masked)) !== null) {
        const bodyStart = m.index + m[0].indexOf('>', m[0].indexOf('<style')) + 1;
        out = out.slice(0, bodyStart) + m[1] + out.slice(bodyStart + m[1].length);
    }
    return out;
}

const ALLOW = {};

function isAllowed(rel, line) {
    return (ALLOW[rel] || []).some((s) => line.includes(s));
}

export function inlineStyleFiles() {
    return walkManyDirs(SCAN_DIRS, new Set(['.html']), { skipDirs: SKIPPED_DIRS })
        .map((f) => path.relative(root, f).split(path.sep).join('/'))
        .sort();
}

export function inlineStyleJsFiles() {
    const dirs = extraJsScanDirs();
    if (!dirs.length) return [];
    return walkManyDirs(dirs, new Set(['.js', '.mjs']), { skipDirs: SKIPPED_DIRS })
        .sort();
}

export function extractCssTextAssignments(js) {
    let out = blankKeepingNewlines(js);
    const re = /\.style\.cssText\s*=\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
    let m;
    while ((m = re.exec(js)) !== null) {
        const bodyStart = m.index + m[0].indexOf(m[1]) + 1;
        out = out.slice(0, bodyStart) + m[2] + out.slice(bodyStart + m[2].length);
    }
    return out;
}

const blankTokenAnchoredCalc = (fnPattern, tokenPrefix) => (code) =>
    code.replace(new RegExp(`${fnPattern}\\([^()]*var\\(\\s*--${tokenPrefix}-[\\w-]+\\s*\\)[^()]*\\)`, 'g'), blankKeepingNewlines);

const SCANNERS = [
    { key: 'color', re: COLOR_RE, pre: (code) => code },
    { key: 'radius', re: RADIUS_RE, pre: blankTokenAnchoredCalc('calc', 'r') },
    { key: 'spacing', re: SPACING_RE, pre: blankTokenAnchoredCalc('calc', 'space') },
    { key: 'fontsize', re: FONTSIZE_RE, pre: blankTokenAnchoredCalc('(?:calc|max|min|clamp)', 'fs') },
];

function scanExtractedCss({ id, src, extract, violations }) {
    const rawLines = src.split(/\r?\n/);
    const css = stripThemableLiterals(stripComments(extract(src)));
    for (const { key, re, pre } of SCANNERS) {
        pre(css).split(/\r?\n/).forEach((code, i) => {
            if (re.test(code) && !isAllowed(id, rawLines[i])) {
                violations.push(`${id}:${i + 1}: [${key}] ${rawLines[i].trim()}`);
            }
        });
    }
}

export function findInlineCssViolations() {
    const violations = [];
    for (const rel of inlineStyleFiles()) {
        scanExtractedCss({ id: rel, src: fs.readFileSync(path.join(root, rel), 'utf8'), extract: extractStyleBlocks, violations });
    }
    for (const abs of inlineStyleJsFiles()) {
        scanExtractedCss({ id: abs, src: fs.readFileSync(abs, 'utf8'), extract: extractCssTextAssignments, violations });
    }
    return violations.sort();
}

const BASELINE_FILE = path.join(root, 'scripts', 'lint-inline-css.baseline.json');

export function lintInlineCssOrThrow() {
    const files = inlineStyleFiles();
    const jsFiles = inlineStyleJsFiles();
    ratchetOrThrow({
        label: 'lint-inline-css',
        flag: '--write-inline-css-baseline',
        baselineFile: BASELINE_FILE,
        violations: findInlineCssViolations(),
        extraPaths: jsFiles,
        extraEnv: 'DS_LINT_EXTRA_INLINE_CSS_BASELINE',
        scope: jsFiles.length
            ? `${files.length} HTML files with inline <style>, ${jsFiles.length} JS files with style.cssText`
            : `${files.length} HTML files with inline <style>`,
        noun: 'raw color/radius/spacing/font-size literal(s) inside inline <style> blocks bypassing the token scales in colors_and_type.css',
        fix: 'Use the token (var(--space-N) / var(--fs-N) / var(--r-N) / a color token). An inline <style> block is ordinary CSS and gets no exemption for living in an HTML file. If the value is genuinely off-scale because the page is a SPECIMEN demonstrating that exact value (a swatch box dimension, a deliberately off-ladder type size), leave the literal and add a comment at the site saying so, and re-freeze the baseline DOWNWARD to whatever you reached.',
    });
}

if (process.argv[1]?.endsWith('lint-inline-css.mjs')) {
    try { lintInlineCssOrThrow(); }
    catch (e) { console.error(e.message); process.exit(1); }
}
