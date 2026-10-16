#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const CSS_FILE = path.join(root, 'colors_and_type.css');
const TOKENS_FILE = path.join(root, 'tokens.json');
const SITE_YAML = path.join(root, 'site', 'content', 'globals', 'site.yaml');

function blankCommentsKeepingOffsets(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function splitBlocksPreservingOffsets(text) {
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
        blocks.push({ selector, bodyStart: braceStart + 1, bodyEnd: j - 1 });
        i = j;
    }
    return blocks;
}

const DECL_RE = /(--[a-zA-Z0-9-]+)(\s*:\s*)([^;]+)(;)/g;

function sameCssValue(a, b) {
    const norm = (v) => String(v).replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim();
    return norm(a) === norm(b);
}

export function findTokensDrift() {
    const raw = fs.readFileSync(CSS_FILE, 'utf8');
    const tokensDoc = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    const flat = tokensDoc.tokens || {};

    const blanked = blankCommentsKeepingOffsets(raw);
    const isRootSelector = (sel) => sel === ':root' || sel.startsWith(':root:not(');
    const blocks = splitBlocksPreservingOffsets(blanked).filter(
        (b) => isRootSelector(b.selector) && blanked.slice(b.bodyStart, b.bodyEnd).includes('--')
    );

    const cssEdits = [];
    for (const block of blocks) {
        const bodyRaw = raw.slice(block.bodyStart, block.bodyEnd);
        let m;
        DECL_RE.lastIndex = 0;
        while ((m = DECL_RE.exec(bodyRaw))) {
            const name = m[1];
            const oldValue = m[3].trim();
            const tokenAbsentFromJson = !(name in flat);
            if (tokenAbsentFromJson) continue;
            const newValue = flat[name];
            if (sameCssValue(newValue, oldValue)) continue;
            const absStart = block.bodyStart + m.index + m[1].length + m[2].length;
            const absEnd = absStart + m[3].length;
            cssEdits.push({ start: absStart, end: absEnd, name, oldValue, newValue });
        }
    }

    return { cssEdits, raw, tokensDoc };
}


export function findSiteYamlDrift() {
    if (!fs.existsSync(SITE_YAML)) return [];
    const yaml = fs.readFileSync(SITE_YAML, 'utf8');
    const tokensDoc = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    const flat = tokensDoc.tokens || {};
    const edits = [];
    const map = { accent_from: '--green', accent_to: '--green-2' };
    for (const [key, tokenName] of Object.entries(map)) {
        const wanted = flat[tokenName];
        if (!wanted) continue;
        const re = new RegExp(`^(${key}:\\s*")([^"]*)(")`, 'm');
        const m = yaml.match(re);
        if (!m) continue;
        const current = m[2];
        if (current.toLowerCase() !== wanted.toLowerCase()) {
            edits.push({ key, tokenName, current, wanted, re });
        }
    }
    return { yaml, edits };
}

function applyCssEdits(raw, edits) {
    const sorted = [...edits].sort((a, b) => b.start - a.start);
    let out = raw;
    for (const e of sorted) out = out.slice(0, e.start) + e.newValue + out.slice(e.end);
    return out;
}

function main() {
    const checkOnly = process.argv.includes('--check');
    const { cssEdits, raw } = findTokensDrift();
    const { yaml, edits: yamlEdits } = findSiteYamlDrift();

    console.log(`[generate-tokens-css] scanned :root declarations against tokens.json.`);
    if (!cssEdits.length) {
        console.log('[generate-tokens-css] colors_and_type.css :root values already match tokens.json.');
    } else {
        console.log(`[generate-tokens-css] ${cssEdits.length} value(s) differ from tokens.json:`);
        for (const e of cssEdits) console.log(`  ${e.name}: "${e.oldValue}" -> "${e.newValue}"`);
    }

    if (!yamlEdits.length) {
        console.log('[generate-tokens-css] site.yaml accent_from/accent_to already match tokens.json.');
    } else {
        console.log(`[generate-tokens-css] ${yamlEdits.length} site.yaml value(s) differ from tokens.json:`);
        for (const e of yamlEdits) console.log(`  ${e.key}: "${e.current}" -> "${e.wanted}"`);
    }

    if (!cssEdits.length && !yamlEdits.length) {
        process.exit(0);
    }

    if (checkOnly) {
        console.error(`[generate-tokens-css] FAIL (--check): drift found between tokens.json and its generated targets.`);
        process.exit(1);
    }

    if (cssEdits.length) {
        fs.writeFileSync(CSS_FILE, applyCssEdits(raw, cssEdits), 'utf8');
        console.log(`[generate-tokens-css] wrote ${cssEdits.length} corrected value(s) to colors_and_type.css`);
    }
    if (yamlEdits.length) {
        let out = yaml;
        for (const e of yamlEdits) {
            out = out.replace(e.re, `$1${e.wanted}$3`);
        }
        fs.writeFileSync(SITE_YAML, out, 'utf8');
        console.log(`[generate-tokens-css] wrote ${yamlEdits.length} corrected value(s) to site.yaml`);
    }
}

if (process.argv[1] && process.argv[1].endsWith('generate-tokens-css.mjs')) {
    main();
}
