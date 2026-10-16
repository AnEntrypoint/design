#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = (process.env.LINT_EMPTY_CATCH_SCAN_DIRS || process.env.LINT_SWALLOW_SCAN_DIRS || 'src,ui_kits').split(',').map((d) => d.trim()).filter(Boolean);
const SCAN_EXT = /\.(js|mjs|cjs|ts|tsx)$/;
const SKIP_PATH_PARTS = ['node_modules', '/vendor/', '/dist/', '/.git/'];
const CATCH_OPEN = /catch\s*(?:\([^)]*\))?\s*\{/g;
const EMPTY_PROMISE_CATCH = /\.catch\(\s*(?:\([^)]*\)|\w+)?\s*=>\s*\{(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*)*\}\s*\)/g;
const REMEDY = 'wrap the call in attempt()/attemptAsync() or pass ignoreFailure to .catch() from src/best-effort.js';

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (SKIP_PATH_PARTS.some((part) => full.replace(/\\/g, '/').includes(part))) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && SCAN_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

function blockBody(text, openIndex) {
  let depth = 1;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(openIndex, i);
  }
  return null;
}

const withoutComments = (body) => body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim();
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

export function findViolations(file) {
  const text = readFileSync(file, 'utf8');
  const violations = [];
  for (const match of text.matchAll(CATCH_OPEN)) {
    const body = blockBody(text, match.index + match[0].length);
    if (body !== null && withoutComments(body) === '') violations.push({ file, line: lineOf(text, match.index) });
  }
  for (const match of text.matchAll(EMPTY_PROMISE_CATCH)) violations.push({ file, line: lineOf(text, match.index) });
  return violations;
}

export function lintEmptyCatchOrThrow() {
  const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir), []));
  const violations = files.flatMap(findViolations);
  if (violations.length === 0) return;
  const listing = violations.map((v) => `  ${v.file.replace(ROOT, '').replace(/\\/g, '/')}:${v.line}`).join('\n');
  throw new Error(`[lint-empty-catch] ${violations.length} empty catch block(s); ${REMEDY}:\n${listing}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    lintEmptyCatchOrThrow();
    console.log('[lint-empty-catch] PASS: no empty catch blocks');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
