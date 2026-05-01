#!/usr/bin/env node
// Bundle marked + DOMPurify for gh-pages showcase to remove jsDelivr CDN dependency.
// Outputs to dist/markdown-bundle.js with both packages as named exports.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const tmpDir = path.join(os.tmpdir(), 'markdown-bundle-' + Date.now());

fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

async function fetchUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  return await res.text();
}

console.log('[markdown-bundle] downloading marked...');
const marked = await fetchUrl('https://cdn.jsdelivr.net/npm/marked@15.0.7/lib/marked.esm.js');
const markedPath = path.join(tmpDir, 'marked.esm.js');
fs.writeFileSync(markedPath, marked, 'utf8');

console.log('[markdown-bundle] downloading DOMPurify...');
const dompurify = await fetchUrl('https://cdn.jsdelivr.net/npm/dompurify@3.4.1/+esm');
const dompurifyPath = path.join(tmpDir, 'dompurify.esm.js');
fs.writeFileSync(dompurifyPath, dompurify, 'utf8');

// Wrapper that re-exports from local files
const wrapperFile = path.join(tmpDir, 'wrapper.js');
fs.writeFileSync(wrapperFile, `
import marked from './marked.esm.js';
import DOMPurify from './dompurify.esm.js';
export { marked, DOMPurify };
`);

console.log('[markdown-bundle] bundling...');
await build({
  entryPoints: [wrapperFile],
  bundle: true,
  format: 'esm',
  outfile: path.join(dist, 'markdown-bundle.js'),
  external: [],
  logLevel: 'info'
});

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('[markdown-bundle] complete → dist/markdown-bundle.js');
