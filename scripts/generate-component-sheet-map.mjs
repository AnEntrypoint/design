#!/usr/bin/env node
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { root } from './component-surface.mjs';
import { die } from './die.mjs';

const CHECK = process.argv.includes('--check');
const JSON_OUT = process.argv.includes('--json');
const SHARED_AT = 4;

const APP_SHELL_SPLIT = [
    'base.css', 'topbar.css', 'primitives.css', 'panel-row.css', 'hero-content.css',
    'responsive.css', 'chat-basic.css', 'files.css', 'catalog-theme.css', 'chat-polish.css',
    'sidebar-misc.css', 'states-interactions.css', 'loading-alerts.css',
    'responsive2-workspace.css', 'row-print.css', 'data-density.css', 'kits-appended.css',
    'git-status.css', 'plugins-config.css', 'models-config.css', 'skills-config.css',
    'slider.css', 'otp-input.css', 'carousel.css', 'calendar.css', 'collab.css',
    'dashboard.css',
];
const SHEETS = [
    ['colors_and_type.css', 'colors_and_type.css'],
    ...APP_SHELL_SPLIT.map((n) => [`app-shell/${n}`, `src/css/app-shell/${n}`]),
    ['community.css', 'community.css'],
    ['chat.css', 'chat.css'],
    ['editor-primitives.css', 'editor-primitives.css'],
    ['community-app.css', 'community-app.css'],
    ['app-surfaces.css', 'app-surfaces.css'],
    ['gm-prose.css', 'gm-prose.css'],
    ['marketing.css', 'marketing.css'],
    ['spoint/loading-screen.css', 'src/kits/spoint/loading-screen.css'],
    ['spoint/game-hud.css', 'src/kits/spoint/game-hud.css'],
    ['spoint/host-join-lobby.css', 'src/kits/spoint/host-join-lobby.css'],
];

function classesInSelectorPosition(css) {
    const out = new Set();
    const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
    let seg = '';
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (c === '{') {
            const prelude = seg.trim();
            if (prelude && !prelude.startsWith('@')) {
                for (const m of prelude.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) out.add(m[1]);
            }
            seg = '';
        } else if (c === '}') seg = '';
        else seg += c;
    }
    return out;
}

function classPropValueExpressions(text) {
    const out = [];
    for (const m of text.matchAll(/\bclass(?:Name)?\s*:/g)) {
        let depth = 0, quote = null, buf = '';
        for (let i = m.index + m[0].length; i < text.length; i++) {
            const c = text[i];
            if (quote) { buf += c; if (c === quote && text[i - 1] !== '\\') quote = null; continue; }
            if (c === "'" || c === '"' || c === '`') { quote = c; buf += c; continue; }
            if ('([{'.includes(c)) depth++;
            else if (')]}'.includes(c)) { if (depth === 0) break; depth--; }
            else if (c === ',' && depth === 0) break;
            buf += c;
        }
        out.push(buf);
    }
    return out;
}

const sheetIndex = [];
for (const [label, rel] of SHEETS) {
    const abs = path.join(root, rel);
    if (!existsSync(abs)) { console.warn('[sheet-map] missing sheet:', label); continue; }
    sheetIndex.push({ label, classes: classesInSelectorPosition(readFileSync(abs, 'utf8')) });
}
const defCount = new Map();
for (const s of sheetIndex) for (const c of s.classes) defCount.set(c, (defCount.get(c) || 0) + 1);
const allClasses = new Set(defCount.keys());
const isShared = (c) => (defCount.get(c) || 0) >= SHARED_AT;

const modules = new Set();
function collectReachableModules(file) {
    if (modules.has(file) || !existsSync(file)) return;
    modules.add(file);
    const src = readFileSync(file, 'utf8');
    const re = /(?:export|import)\s*(?:\*|\{[^}]*\})\s*(?:as\s+\w+\s*)?from\s*['"]([^'"]+)['"]/g;
    for (const m of src.matchAll(re)) {
        if (!m[1].startsWith('.')) continue;
        collectReachableModules(path.resolve(path.dirname(file), m[1]));
    }
}
collectReachableModules(path.join(root, 'src', 'components.js'));

const defsByModule = new Map();
for (const f of modules) {
    const src = readFileSync(f, 'utf8');
    const found = [];
    for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
        found.push({ name: m[1], at: m.index });
    }
    found.sort((a, b) => a.at - b.at);
    defsByModule.set(f, { src, found });
}

function emittedClasses(text) {
    const out = new Set();
    const scope = classPropValueExpressions(text).join('\n');
    for (const m of scope.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`\n]*)`/g)) {
        const lit = m[1] ?? m[2] ?? m[3] ?? '';
        for (const tok of lit.split(/\s+/)) {
            if (!tok || !/^-?[A-Za-z_][\w-]*-?$/.test(tok)) continue;
            if (allClasses.has(tok)) { out.add(tok); continue; }
            if (tok.endsWith('-')) for (const c of allClasses) if (c.startsWith(tok)) { out.add(c); break; }
        }
    }
    return out;
}

const manifestPath = path.join(root, 'ui_kits', 'component_explorer', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const rows = [];
for (const comp of manifest.components) {
    let hit = null;
    for (const [f, { src, found }] of defsByModule) {
        const i = found.findIndex((d) => d.name === comp.name);
        if (i < 0) continue;
        const end = i + 1 < found.length ? found[i + 1].at : src.length;
        hit = { file: path.relative(root, f).replace(/\\/g, '/'), text: src.slice(found[i].at, end) };
        break;
    }
    if (!hit) { rows.push({ name: comp.name, file: null, classes: [], owned: [], sheets: [], ownedSheets: [] }); continue; }
    const classes = [...emittedClasses(hit.text)].sort();
    const owned = classes.filter((c) => !isShared(c));
    rows.push({
        name: comp.name,
        file: hit.file,
        classes,
        owned,
        sheets: sheetIndex.filter((s) => classes.some((c) => s.classes.has(c))).map((s) => s.label),
        ownedSheets: sheetIndex.filter((s) => owned.some((c) => s.classes.has(c))).map((s) => s.label),
    });
}

const sharedBase = [...allClasses].filter(isShared).sort();
const withOwn = rows.filter((r) => r.ownedSheets.length);
const one = withOwn.filter((r) => r.ownedSheets.length === 1);
const two = withOwn.filter((r) => r.ownedSheets.length === 2);
const many = withOwn.filter((r) => r.ownedSheets.length >= 3);

if (JSON_OUT) {
    console.log(JSON.stringify({ sharedBase, components: rows }, null, 2));
    process.exit(0);
}

const lines = [];
lines.push('# Component -> source-sheet map');
lines.push('');
lines.push('Generated by `node scripts/generate-component-sheet-map.mjs`. Do not hand-edit.');
lines.push('');
lines.push('This answers the question that blocks a per-consumer CSS subset: for a given');
lines.push('component, which source sheets carry its rules? The build can only subset by');
lines.push('source sheet, and the sheets are named for app areas rather than components, so');
lines.push('without this map no consumer can declare what it needs.');
lines.push('');
lines.push('## How to read it');
lines.push('');
lines.push(`A class defined in ${SHARED_AT} or more sheets is treated as SHARED BASE -- a state or`);
lines.push('utility token (active, group, btn, icon) that any subset has to carry regardless of');
lines.push('which components it includes. "Owned" sheets are those carrying a component\'s');
lines.push('distinctive classes. This split matters: counted naively, one shared token drags a');
lines.push('whole sheet in and every component looks scattered across 20+ sheets.');
lines.push('');
lines.push('## Totals');
lines.push('');
lines.push(`- components in the manifest: ${rows.length}`);
lines.push(`- resolved to a defining module: ${rows.filter((r) => r.file).length}`);
lines.push(`- shared-base classes: ${sharedBase.length}`);
lines.push(`- components with distinctive rules: ${withOwn.length}`);
lines.push(`  - owned by exactly 1 sheet (cleanly extractable today): ${one.length}`);
lines.push(`  - owned by 2 sheets: ${two.length}`);
lines.push(`  - owned by 3 or more sheets (need reorganizing before a subset is safe): ${many.length}`);
lines.push('');
lines.push('## Shared base');
lines.push('');
lines.push('```');
lines.push(sharedBase.join(' '));
lines.push('```');
lines.push('');
lines.push('## Components whose rules span 3 or more sheets');
lines.push('');
lines.push('These are the ones that make a safe subset impossible to express today.');
lines.push('');
lines.push('| component | sheets | where |');
lines.push('| --- | --- | --- |');
for (const r of [...many].sort((a, b) => b.ownedSheets.length - a.ownedSheets.length)) {
    lines.push(`| ${r.name} | ${r.ownedSheets.length} | ${r.ownedSheets.join(', ')} |`);
}
lines.push('');
lines.push('## Full map');
lines.push('');
lines.push('| component | defined in | owned sheets |');
lines.push('| --- | --- | --- |');
for (const r of rows) {
    lines.push(`| ${r.name} | ${r.file || '(unresolved)'} | ${r.ownedSheets.join(', ') || '(no distinctive rules)'} |`);
}
lines.push('');
const out = lines.join('\n');

const outPath = path.join(root, 'docs', 'component-sheet-map.md');
if (CHECK) {
    const cur = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
    if (cur !== out) {
        die('[sheet-map] docs/component-sheet-map.md is out of date -- run node scripts/generate-component-sheet-map.mjs');
    }
    console.log('[sheet-map] up to date');
} else {
    writeFileSync(outPath, out);
    console.log(`[sheet-map] wrote docs/component-sheet-map.md -- ${rows.length} components, ${one.length} single-sheet, ${many.length} spanning 3+`);
}
