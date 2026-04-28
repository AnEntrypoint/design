#!/usr/bin/env node
// Bundles the 247420 SDK into a single minified, scope-prefixed ESM file.
// CSS is namespaced under `.ds-247420` so it cannot leak into consumer
// styles or fight other optimized bundles (Tailwind, RippleUI, etc.).
import { build } from 'esbuild';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const SCOPE = '.ds-247420';
const TAILWIND_CDN = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';

const cssParts = [
    ['vendor/fonts.css', path.join(root, 'vendor/fonts.css')],
    ['vendor/rippleui-1.12.1.css', path.join(root, 'vendor/rippleui-1.12.1.css')],
    ['colors_and_type.css', path.join(root, 'colors_and_type.css')],
    ['app-shell.css', path.join(root, 'app-shell.css')],
];

async function fetchTailwind() {
    try {
        const res = await fetch(TAILWIND_CDN);
        if (!res.ok) throw new Error('tailwind cdn ' + res.status);
        return await res.text();
    } catch (err) {
        console.warn('[247420] tailwind fetch failed:', err.message);
        return '';
    }
}

const tailwindCss = await fetchTailwind();

let raw = '';
if (tailwindCss) raw += `/* tailwind */\n${tailwindCss}\n`;
for (const [label, file] of cssParts) {
    if (!fs.existsSync(file)) { console.warn('[247420] missing css:', label); continue; }
    raw += `\n/* ${label} */\n${fs.readFileSync(file, 'utf8')}`;
}

// Prefix every selector with .ds-247420 so consumers add the class on a root
// element to opt in. Skip @-rules and :root (which we rewrite to the scope).
const prefixed = (await postcss([
    prefixer({
        prefix: SCOPE,
        transform: (prefix, selector, prefixedSelector) => {
            if (!selector || /^@/.test(selector)) return selector;
            // Map :root and html/body to the scope itself so design tokens land
            // on the consumer's wrapping element.
            if (/^:root\b/.test(selector)) return prefix;
            if (/^html\b/.test(selector)) return selector.replace(/^html\b/, prefix);
            if (/^body\b/.test(selector)) return selector.replace(/^body\b/, prefix);
            // Keep @keyframes, @font-face, ::-pseudo selectors untouched
            if (/^(from|to|\d+%)$/.test(selector)) return selector;
            return prefixedSelector;
        },
    }),
]).process(raw, { from: undefined })).css;

fs.writeFileSync(path.join(dist, '247420.css'), prefixed);
console.log('[247420] css scoped+bundled:', (prefixed.length / 1024).toFixed(1) + 'kb under', SCOPE);

// Inject the scoped CSS into src/styles.js for the JS bundle, then restore.
const stylesPath = path.join(root, 'src/styles.js');
const stylesOriginal = fs.readFileSync(stylesPath, 'utf8');
fs.writeFileSync(stylesPath,
    `export const css = ${JSON.stringify(prefixed)};\nexport const scope = ${JSON.stringify(SCOPE)};\n`);

try {
    await build({
        entryPoints: [
            path.join(root, 'src/index.js'),
            path.join(root, 'src/app.js'),
        ],
        outdir: dist,
        entryNames: '247420.[name]',
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: ['es2020'],
        minify: true,
        sourcemap: false,
        legalComments: 'none',
        logLevel: 'info',
    });
    // Rename 247420.index.js -> 247420.js for the public entry.
    const idx = path.join(dist, '247420.index.js');
    if (fs.existsSync(idx)) fs.renameSync(idx, path.join(dist, '247420.js'));
} finally {
    fs.writeFileSync(stylesPath, stylesOriginal);
}

const sz = fs.statSync(path.join(dist, '247420.js')).size;
console.log('[247420] js minified bundle:', (sz / 1024).toFixed(1) + 'kb');
