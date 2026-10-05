#!/usr/bin/env node
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractComponentSurface, root } from './component-surface.mjs';
import { die, orDie } from './die.mjs';

const CHECK = process.argv.includes('--check');
const outPath = join(root, 'ui_kits', 'component_explorer', 'manifest.json');

const surface = orDie(extractComponentSurface);

const manifest = {
    generatedNote: 'Generated from src/components.js + src/components/*.js via node scripts/generate-component-manifest.mjs. Do not hand-edit.',
    components: surface.components.map((c) => ({
        name: c.name,
        file: c.file,
        kind: c.kind,
        props: c.props,
        description: c.jsdoc ? c.jsdoc.description : '',
    })),
};

const json = JSON.stringify(manifest, null, 2) + '\n';

if (CHECK) {
    if (!existsSync(outPath)) {
        die(`[component-manifest] FAIL -- ${outPath} does not exist. Run: node scripts/generate-component-manifest.mjs`);
    }
    const current = readFileSync(outPath, 'utf8');
    if (current !== json) {
        die(`[component-manifest] FAIL -- ${outPath} is stale. Run: node scripts/generate-component-manifest.mjs`);
    }
    console.log(`[component-manifest] ${outPath} is up to date (${manifest.components.length} components)`);
    process.exit(0);
}

writeFileSync(outPath, json);
console.log(`[component-manifest] wrote ${outPath} (${manifest.components.length} components)`);
