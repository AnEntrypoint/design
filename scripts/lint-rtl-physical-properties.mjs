#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandSheets, resolveSheet, stripComments, ratchetOrThrow } from './lint-tokens.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const BASELINE_FILE = path.join(root, 'scripts', 'lint-rtl.baseline.json');

const PHYSICAL_RE = /(^|[\s;{])(padding-left|padding-right|margin-left|margin-right|border-left|border-right|border-left-width|border-right-width|border-left-color|border-right-color|left|right)\s*:/g;
const TEXT_ALIGN_RE = /(^|[\s;{])text-align\s*:\s*(left|right)\b/g;

const LOGICAL_MAP = {
    'padding-left': 'padding-inline-start', 'padding-right': 'padding-inline-end',
    'margin-left': 'margin-inline-start', 'margin-right': 'margin-inline-end',
    'border-left': 'border-inline-start', 'border-right': 'border-inline-end',
    'border-left-width': 'border-inline-start-width', 'border-right-width': 'border-inline-end-width',
    'border-left-color': 'border-inline-start-color', 'border-right-color': 'border-inline-end-color',
    left: 'inset-inline-start', right: 'inset-inline-end',
};

const lineNumberAt = (src, index) => src.slice(0, index).split('\n').length;

function scanSheet(rel) {
    const file = resolveSheet(rel);
    if (!fs.existsSync(file)) return [];
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    const rawLines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    const found = [];
    for (const m of src.matchAll(PHYSICAL_RE)) {
        const line = lineNumberAt(src, m.index);
        found.push(`${rel}:${line}: ${m[2]} -> ${LOGICAL_MAP[m[2]]}  ${rawLines[line - 1].trim()}`);
    }
    for (const m of src.matchAll(TEXT_ALIGN_RE)) {
        const line = lineNumberAt(src, m.index);
        found.push(`${rel}:${line}: text-align: ${m[2]} -> ${m[2] === 'left' ? 'start' : 'end'}  ${rawLines[line - 1].trim()}`);
    }
    return found;
}

export function findPhysicalPropertyViolations() {
    return expandSheets().flatMap(scanSheet).sort();
}

export function lintRtlPhysicalPropertiesOrThrow() {
    ratchetOrThrow({
        label: 'lint-rtl',
        flag: '--write-rtl-baseline',
        baselineFile: BASELINE_FILE,
        violations: findPhysicalPropertyViolations(),
        noun: 'physical left/right declaration(s) that will not mirror under [dir="rtl"]',
        fix: 'Use the logical property (padding-inline-start, margin-inline-end, inset-inline-start, border-inline-start, text-align: start/end).',
    });
}

if (process.argv[1]?.endsWith('lint-rtl-physical-properties.mjs')) {
    try { lintRtlPhysicalPropertiesOrThrow(); }
    catch (e) { console.error(e.message); process.exit(1); }
}