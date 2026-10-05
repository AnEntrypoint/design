#!/usr/bin/env node
import { build } from 'esbuild';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { lintTokensOrThrow, lintRadiusOrThrow, lintSpacingOrThrow, lintFontSizeOrThrow, lintZIndexOrThrow, lintTransitionAllOrThrow, lintImportantOrThrow, lintTokensJsonInSyncOrThrow } from './lint-tokens.mjs';
import { lintGlyphsOrThrow } from './lint-glyphs.mjs';
import { lintNullChildrenOrThrow } from './lint-null-children.mjs';
import { lintClassesOrThrow } from './lint-classes.mjs';
import { lintInlineStylesOrThrow } from './lint-inline-styles.mjs';
import { lintDuplicateSelectorsOrThrow } from './lint-duplicate-selectors.mjs';
import { lintInlineCssOrThrow } from './lint-inline-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const SCOPE = '.ds-247420';
const FONT_BASE = 'https://raw.githack.com/AnEntrypoint/design/main/dist/fonts/';
const kb = (length) => (length / 1024).toFixed(1);

fs.mkdirSync(dist, { recursive: true });

const gatesRunUnconditionallyBecauseRunnersSkipLifecycleScripts = [
    lintTokensOrThrow,
    lintRadiusOrThrow,
    lintZIndexOrThrow,
    lintTransitionAllOrThrow,
    lintSpacingOrThrow,
    lintFontSizeOrThrow,
    lintImportantOrThrow,
    lintInlineCssOrThrow,
    lintTokensJsonInSyncOrThrow,
    lintGlyphsOrThrow,
    lintNullChildrenOrThrow,
    lintClassesOrThrow,
    lintInlineStylesOrThrow,
    lintDuplicateSelectorsOrThrow,
];
for (const gate of gatesRunUnconditionallyBecauseRunnersSkipLifecycleScripts) gate();

const appShellSplitDir = path.join(root, 'src/css/app-shell');
const appShellSplitFiles = [
    'base.css',
    'topbar.css',
    'primitives.css',
    'panel-row.css',
    'hero-content.css',
    'responsive.css',
    'chat-basic.css',
    'files.css',
    'catalog-theme.css',
    'chat-polish.css',
    'sidebar-misc.css',
    'states-interactions.css',
    'loading-alerts.css',
    'responsive2-workspace.css',
    'row-print.css',
    'data-density.css',
    'kits-appended.css',
    'git-status.css',
    'plugins-config.css',
    'models-config.css',
    'skills-config.css',
    'slider.css',
    'otp-input.css',
    'carousel.css',
    'calendar.css',
    'collab.css',
    'context-pane.css',
    'shared-blocks.css',
    'dashboard.css',
];

function concatenateAppShellSplitFilesWithoutHeaders() {
    let content = '';
    for (const name of appShellSplitFiles) {
        const file = path.join(appShellSplitDir, name);
        if (!fs.existsSync(file)) { console.warn('[247420] missing app-shell split part:', name); continue; }
        content += fs.readFileSync(file, 'utf8');
    }
    return content;
}

const APP_SHELL_LABEL = 'app-shell.css';
const cssParts = [
    ['colors_and_type.css', path.join(root, 'colors_and_type.css')],
    [APP_SHELL_LABEL, null],
    ['community.css', path.join(root, 'community.css')],
    ['chat.css', path.join(root, 'chat.css')],
    ['editor-primitives.css', path.join(root, 'editor-primitives.css')],
    ['community-app.css', path.join(root, 'community-app.css')],
    ['app-surfaces.css', path.join(root, 'app-surfaces.css')],
    ['gm-prose.css', path.join(root, 'gm-prose.css')],
    ['marketing.css', path.join(root, 'marketing.css')],
    ['spoint/loading-screen.css', path.join(root, 'src/kits/spoint/loading-screen.css')],
    ['spoint/game-hud.css', path.join(root, 'src/kits/spoint/game-hud.css')],
    ['spoint/host-join-lobby.css', path.join(root, 'src/kits/spoint/host-join-lobby.css')],
];

function concatenateCssParts() {
    let combined = '';
    for (const [label, file] of cssParts) {
        if (label === APP_SHELL_LABEL) {
            combined += `\n/* ${label} */\n${concatenateAppShellSplitFilesWithoutHeaders()}`;
            continue;
        }
        if (!fs.existsSync(file)) { console.warn('[247420] missing css:', label); continue; }
        combined += `\n/* ${label} */\n${fs.readFileSync(file, 'utf8')}`;
    }
    return combined.replace(/\r\n/g, '\n');
}

function copyFontsIntoDist() {
    const fontsSrc = path.join(root, 'vendor/fonts');
    const fontsDst = path.join(dist, 'fonts');
    if (!fs.existsSync(fontsSrc)) return;
    fs.mkdirSync(fontsDst, { recursive: true });
    for (const name of fs.readdirSync(fontsSrc)) {
        fs.copyFileSync(path.join(fontsSrc, name), path.join(fontsDst, name));
    }
    console.log('[247420] copied fonts:', fs.readdirSync(fontsDst).length, 'files');
}

function scopeSelector(prefix, selector, prefixedSelector) {
    const isAtRuleOrEmpty = !selector || /^@/.test(selector);
    if (isAtRuleOrEmpty) return selector;
    if (/^:root\b/.test(selector)) return selector.replace(/^:root\b/, prefix);
    const isBodyMountedOrHtmlBody = /^(?:html\s+)?body\b/.test(selector);
    if (isBodyMountedOrHtmlBody) {
        return selector.replace(/^(?:html\s+)?body\b/, `:is(${prefix}, ${prefix} body)`);
    }
    if (/^html\b/.test(selector)) return selector.replace(/^html\b/, prefix);
    const isKeyframeStop = /^(from|to|\d+%)$/.test(selector);
    if (isKeyframeStop) return selector;
    const sameElementAsScope = /^\[/.test(selector);
    if (sameElementAsScope) return prefix + selector;
    const alreadyScoped = selector.startsWith(prefix + ' ') || selector === prefix;
    if (alreadyScoped) return selector;
    return prefixedSelector;
}

async function scopeCss(css) {
    const result = await postcss([prefixer({ prefix: SCOPE, transform: scopeSelector })]).process(css, { from: undefined });
    return result.css;
}

function buildStylesRuntimeSource(gzippedCssBase64) {
    return `
export const scope = ${JSON.stringify(SCOPE)};
const cssGzB64 = ${JSON.stringify(gzippedCssBase64)};

function b64ToBytes(b64) {
    if (typeof atob === 'function') {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }
    return Uint8Array.from(Buffer.from(b64, 'base64'));
}

let _cssPromise = null;
export function loadCss() {
    if (_cssPromise) return _cssPromise;
    _cssPromise = (async () => {
        const bytes = b64ToBytes(cssGzB64);
        const stream = new Response(
            new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
        );
        return await stream.text();
    })();
    return _cssPromise;
}

export let css = '';
loadCss().then(s => { css = s; });
`;
}

async function bundleJsWithEmbeddedCss(gzippedCssBase64) {
    const stylesPath = path.join(root, 'src/styles.js');
    const stylesOriginal = fs.readFileSync(stylesPath, 'utf8');
    fs.writeFileSync(stylesPath, buildStylesRuntimeSource(gzippedCssBase64));
    try {
        await build({
            entryPoints: [path.join(root, 'src/index.js')],
            outdir: dist,
            entryNames: '247420.[name]',
            bundle: true,
            alias: { 'anentrypoint-design': path.join(root, 'src/index.js') },
            format: 'esm',
            platform: 'browser',
            target: ['es2022'],
            minify: true,
            sourcemap: false,
            legalComments: 'none',
            logLevel: 'info',
        });
        const builtEntry = path.join(dist, '247420.index.js');
        if (fs.existsSync(builtEntry)) fs.renameSync(builtEntry, path.join(dist, '247420.js'));
    } finally {
        fs.writeFileSync(stylesPath, stylesOriginal);
    }
}

function regenerateComponentTypes() {
    const typesGen = spawnSync(process.execPath, [path.join(__dirname, 'generate-component-types.mjs')], {
        cwd: root, encoding: 'utf8',
    });
    if (typesGen.status !== 0) {
        console.error(typesGen.stdout || '', typesGen.stderr || '');
        throw new Error('[247420] component type generation failed');
    }
    process.stdout.write(typesGen.stdout || '');
}

const combinedCss = concatenateCssParts();
copyFontsIntoDist();
const scopedCss = await scopeCss(combinedCss.replace(/url\(\.?\/?fonts\//g, `url(${FONT_BASE}`));
fs.writeFileSync(path.join(dist, '247420.css'), scopedCss);
console.log('[247420] css scoped+bundled:', kb(scopedCss.length) + 'kb under', SCOPE);

const gzippedCssBase64 = zlib.gzipSync(Buffer.from(scopedCss, 'utf8'), { level: 9 }).toString('base64');
console.log('[247420] css gzip+base64:', kb(gzippedCssBase64.length) + 'kb (raw',
    kb(scopedCss.length) + 'kb, ratio',
    (gzippedCssBase64.length / scopedCss.length * 100).toFixed(1) + '%)');

await bundleJsWithEmbeddedCss(gzippedCssBase64);
console.log('[247420] js minified bundle:', kb(fs.statSync(path.join(dist, '247420.js')).size) + 'kb');

regenerateComponentTypes();
