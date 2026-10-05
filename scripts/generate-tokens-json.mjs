#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'colors_and_type.css');
const OUT = path.join(root, 'tokens.json');

const css = fs.readFileSync(SRC, 'utf8');

function splitBlocks(text) {
    const blocks = [];
    let i = 0;
    while (i < text.length) {
        const braceStart = text.indexOf('{', i);
        if (braceStart === -1) break;
        const selector = text.slice(i, braceStart).trim();
        let depth = 1;
        let j = braceStart + 1;
        while (j < text.length && depth > 0) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') depth--;
            j++;
        }
        const body = text.slice(braceStart + 1, j - 1);
        blocks.push({ selector, body, start: i, end: j });
        i = j;
    }
    return blocks;
}

function stripComments(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

const ROOT_GROUP_BY_ORDINAL = ['root', 'colors-type'];

function rootGroupFor(ordinal) {
    return ROOT_GROUP_BY_ORDINAL[Math.min(ordinal, ROOT_GROUP_BY_ORDINAL.length - 1)];
}

function slug(label) {
    return label
        .toLowerCase()
        .replace(/247420 design system\s*[-—]*\s*/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'root';
}

const noCommentCss = stripComments(css);
const blocks = splitBlocks(noCommentCss);

const DECL_RE = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;

const grouped = {};
const flat = {};

function recordToken(name, value, selectorLabel, rootOrdinal) {
    const groupKey = selectorLabel === ':root'
        ? rootGroupFor(rootOrdinal)
        : slug(`override:${selectorLabel}`);
    if (!grouped[groupKey]) grouped[groupKey] = {};
    if (!(name in grouped[groupKey])) grouped[groupKey][name] = value;
    if (selectorLabel === ':root' && !(name in flat)) flat[name] = value;
}

let rootOrdinal = -1;
for (const block of blocks) {
    const sel = block.selector.replace(/\s+/g, ' ').trim();
    if (sel.startsWith('@media')) continue;
    if (!block.body.includes('--')) continue;

    let selectorLabel = sel;
    if (sel === ':root' || sel.startsWith(':root:not(')) { selectorLabel = ':root'; rootOrdinal++; }

    let m;
    DECL_RE.lastIndex = 0;
    while ((m = DECL_RE.exec(block.body))) {
        const name = `--${m[1]}`;
        const value = m[2].trim();
        recordToken(name, value, selectorLabel, rootOrdinal);
    }
}

const output = {
    generatedFrom: 'colors_and_type.css',
    generatedAt: new Date().toISOString(),
    tokenCount: Object.keys(flat).length,
    tokens: flat,
    groups: grouped,
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n', 'utf8');

console.log(`tokens.json written: ${Object.keys(flat).length} root tokens, ${Object.keys(grouped).length} groups -> ${path.relative(root, OUT)}`);
