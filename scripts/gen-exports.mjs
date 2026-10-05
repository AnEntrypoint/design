#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const exists = (rel) => fs.existsSync(path.join(root, rel));

const PUBLIC_ROOT_ENTRIES = {
    '.': { types: './types/index.d.ts', import: './dist/247420.js', default: './dist/247420.js' },
    './css': './dist/247420.css',
    './colors_and_type.css': './colors_and_type.css',
    './app-shell.css': './app-shell.css',
    './community.css': './community.css',
    './page-html': { import: './src/page-html.js', default: './src/page-html.js' },
    './src/page-html.js': './src/page-html.js',
    './html-escape.js': './src/html-escape.js',
    './components/shell.js': './src/components/shell.js',
    './components/files.js': './src/components/files.js',
    './components/files-modals.js': './src/components/files-modals.js',
    './components/overlay-primitives.js': './src/components/overlay-primitives.js',
    './components/git-status.js': './src/components/git-status.js',
    './components/worktree-switcher.js': './src/components/worktree-switcher.js',
    './components/game-editor-kit': { import: './src/components/game-editor-kit/index.js', default: './src/components/game-editor-kit/index.js' },
    './components/game-editor-kit/*': './src/components/game-editor-kit/*',
    './web-components/ds-chat.js': './src/web-components/ds-chat.js',
    './web-components/freddie-chat.js': './src/web-components/freddie-chat.js',
    './lint': { import: './src/lint.js', default: './src/lint.js' },
    './package.json': './package.json',
};

const KIT_FILES_IMPORTED_ONLY_BY_THEIR_SIBLING = new Set([
    'slides/deck-stage-overlay.js',
    'slides/deck-stage-state.js',
    'slides/deck-stage-style.js',
]);

const KITS_EXPOSED_AS_ONE_WILDCARD_SUBPATH = new Set(['spoint']);

const kitsDir = path.join(root, 'src/kits');

function walkKit(kitName) {
    const kitPath = path.join(kitsDir, kitName);
    const entries = {};
    const files = fs.readdirSync(kitPath, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => d.name)
        .sort();

    if (files.includes('index.js')) {
        const p = `./src/kits/${kitName}/index.js`;
        entries[`./kits/${kitName}`] = { import: p, default: p };
    }

    if (KITS_EXPOSED_AS_ONE_WILDCARD_SUBPATH.has(kitName)) {
        entries[`./kits/${kitName}/*`] = `./src/kits/${kitName}/*`;
        return entries;
    }

    for (const file of files) {
        if (file === 'index.js') continue;
        if (KIT_FILES_IMPORTED_ONLY_BY_THEIR_SIBLING.has(`${kitName}/${file}`)) continue;
        entries[`./kits/${kitName}/${file}`] = `./src/kits/${kitName}/${file}`;
    }
    return entries;
}

function isWildcardDirectoryEntry(key, value) {
    return key.endsWith('/*') && typeof value === 'string' && value.endsWith('/*');
}

function genExports() {
    const out = {};

    for (const [key, value] of Object.entries(PUBLIC_ROOT_ENTRIES)) {
        if (isWildcardDirectoryEntry(key, value)) {
            const dir = value.slice(0, -2);
            if (!exists(dir)) {
                throw new Error(`[gen-exports] ROOT_EXTRAS wildcard entry "${key}" -> "${dir}" directory does not exist on disk`);
            }
            out[key] = value;
            continue;
        }
        const targets = typeof value === 'string' ? [value] : Object.values(value);
        for (const t of targets) {
            if (!exists(t)) {
                throw new Error(`[gen-exports] ROOT_EXTRAS entry "${key}" -> "${t}" does not exist on disk`);
            }
        }
        out[key] = value;
    }

    const kitNames = fs.readdirSync(kitsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

    for (const kitName of kitNames) {
        Object.assign(out, walkKit(kitName));
    }

    return out;
}

function main() {
    const check = process.argv.includes('--check');
    const generated = genExports();

    const pkgPath = path.join(root, 'package.json');
    const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);

    if (check) {
        const current = JSON.stringify(pkg.exports ?? {}, null, 2);
        const next = JSON.stringify(generated, null, 2);
        if (current !== next) {
            console.error('[gen-exports] FAIL: package.json "exports" is out of date with the file tree.');
            console.error('[gen-exports] Run `node scripts/gen-exports.mjs` to regenerate it.');
            console.error('--- current ---');
            console.error(current);
            console.error('--- generated ---');
            console.error(next);
            process.exit(1);
        }
        console.log('[gen-exports] OK: package.json "exports" matches the generated map (' + Object.keys(generated).length + ' entries).');
        return;
    }

    pkg.exports = generated;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('[gen-exports] wrote ' + Object.keys(generated).length + ' export entries to package.json.');
}

main();
