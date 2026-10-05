#!/usr/bin/env node
import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withPage, cdpAvailable, CDP_BASE } from './cdp.mjs';
import { diffPngBuffers } from './png-diff.mjs';
import { die } from './die.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const previewDir = join(root, 'preview');
const baselineDir = join(root, 'visual-baselines');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8899';

const THEMES = ['paper', 'ink', 'auto'];
const EMULATED_COLOR_SCHEME_MATCHING_COMMITTED_AUTO_BASELINES = 'light';
const VIEWPORT_THE_BASELINES_WERE_CAPTURED_AT = { width: 1280, height: 900 };
const DIFF_THRESHOLD_RATIO = 0.005;
const CHANNEL_TOLERANCE_0_TO_255 = 24;
const MAX_MISSING_LISTED = 10;

function listPreviewFiles() {
    return readdirSync(previewDir)
        .filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'theme-map.html')
        .sort();
}

const baselineName = (file, theme) => `${file.replace(/\.html$/, '')}--${theme}.png`;

async function captureAllThemesPerPageLoad(onShot) {
    const shots = [];
    for (const file of listPreviewFiles()) {
        const url = `${BASE_URL}/preview/${file}`;
        await withPage(url, async (page) => {
            await page.setColorScheme(EMULATED_COLOR_SCHEME_MATCHING_COMMITTED_AUTO_BASELINES);
            for (const theme of THEMES) {
                await page.setTheme(theme);
                const png = await page.screenshot();
                shots.push({ file, theme, name: baselineName(file, theme), png });
                if (onShot) onShot(file, theme);
            }
        }, VIEWPORT_THE_BASELINES_WERE_CAPTURED_AT);
    }
    return shots;
}

function compareShotsToBaselines(shots) {
    const failures = [];
    const missing = [];
    for (const s of shots) {
        const path = join(baselineDir, s.name);
        if (!existsSync(path)) {
            missing.push(s.name);
            continue;
        }
        const d = diffPngBuffers(readFileSync(path), s.png, { channelTolerance: CHANNEL_TOLERANCE_0_TO_255 });
        if (d.sizeMismatch) {
            failures.push(`${s.name}: size mismatch (${d.detail})`);
        } else if (d.diffRatio > DIFF_THRESHOLD_RATIO) {
            failures.push(`${s.name}: ${(d.diffRatio * 100).toFixed(3)}% of pixels differ (${d.diffCount}/${d.totalPixels}, max channel delta ${d.maxDelta}), threshold ${(DIFF_THRESHOLD_RATIO * 100).toFixed(1)}%`);
        }
    }
    return { failures, missing };
}

async function main() {
    const mode = process.argv[2] || 'check';
    if (!['check', 'update'].includes(mode)) die('[visual-baseline] usage: node scripts/visual-baseline.mjs check|update');

    if (!(await cdpAvailable())) {
        console.error(`[visual-baseline] no CDP endpoint at ${CDP_BASE}.`);
        die('[visual-baseline] start Chrome with --headless --remote-debugging-port=9333 (a workflow step or your own browser; this script never launches one) and serve the repo at ' + BASE_URL);
    }

    mkdirSync(baselineDir, { recursive: true });
    const shots = await captureAllThemesPerPageLoad();

    if (mode === 'update') {
        for (const s of shots) writeFileSync(join(baselineDir, s.name), s.png);
        console.log(`[visual-baseline] wrote ${shots.length} baseline PNG(s) to visual-baselines/.`);
        return;
    }

    const { failures, missing } = compareShotsToBaselines(shots);

    console.log(`[visual-baseline] ${shots.length} capture(s) compared against visual-baselines/.`);

    if (missing.length) {
        console.error(`[visual-baseline] FAIL: ${missing.length} capture(s) have no committed baseline:`);
        for (const m of missing.slice(0, MAX_MISSING_LISTED)) console.error(`  - ${m}`);
        console.error('[visual-baseline] Run: node scripts/visual-baseline.mjs update');
    }
    if (failures.length) {
        console.error(`[visual-baseline] FAIL: ${failures.length} page(s) drifted from baseline:`);
        for (const f of failures) console.error(`  - ${f}`);
        console.error('[visual-baseline] If the change is intended, re-capture: node scripts/visual-baseline.mjs update');
    }
    if (missing.length || failures.length) process.exit(1);
    console.log('[visual-baseline] OK: every page matches its baseline.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
}
