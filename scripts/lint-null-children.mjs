#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from './lint-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SCAN_DIRS = ['src', 'ui_kits', 'site', 'preview', 'slides'];
const SCAN_EXT = new Set(['.js', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', 'vendor']);

const ALLOW = {};

function blankLineCommentsOutsideStrings(src) {
  const out = src.split('');
  let inStr = null;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '/' && out[i + 1] === '/') {
      let j = i;
      while (j < out.length && out[j] !== '\n') out[j++] = ' ';
      i = j - 1;
    }
  }
  return out.join('');
}

const STARTS_VNODE_CALL = /(^|\s|\(|,)(h\(|[A-Z][A-Za-z0-9]*\()/;
const ENDS_IN_CONDITIONAL_NULL = /[?:]\s*null\s*$/;
const FILTER_CALL_AFTER_CLOSE = /^\s*\.filter\(/;

function splitElementLevelMembers(scan, openIndex) {
  let depth = 0, j = openIndex, inStr = null, elemStart = openIndex + 1;
  const elems = [];
  for (; j < scan.length; j++) {
    const c = scan[j];
    if (inStr) {
      if (c === '\\') j++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '[' || c === '(' || c === '{') depth++;
    else if (c === ']' || c === ')' || c === '}') {
      depth--;
      if (depth === 0 && c === ']') { elems.push(scan.slice(elemStart, j)); break; }
    } else if (c === ',' && depth === 1) { elems.push(scan.slice(elemStart, j)); elemStart = j + 1; }
  }
  return { elems, closeIndex: j };
}

function findViolations(src) {
  const scan = blankLineCommentsOutsideStrings(src);
  const out = [];
  for (let i = 0; i < scan.length; i++) {
    if (scan[i] !== '[') continue;
    const { elems, closeIndex } = splitElementLevelMembers(scan, i);
    if (closeIndex >= scan.length) continue;
    const after = scan.slice(closeIndex + 1, closeIndex + 24);
    if (FILTER_CALL_AFTER_CLOSE.test(after)) continue;
    const hasVnode = elems.some((e) => STARTS_VNODE_CALL.test(e.trim()));
    const hasCondNull = elems.some((e) => ENDS_IN_CONDITIONAL_NULL.test(e.trim()));
    if (hasVnode && hasCondNull) {
      out.push(src.slice(0, i).split('\n').length);
      i = closeIndex;
    }
  }
  return out;
}

export function lintNullChildrenOrThrow() {
  const failures = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walkFiles(abs, SCAN_EXT, { skipDirs: SKIP_DIRS })) {
      const rel = path.relative(root, file);
      const src = fs.readFileSync(file, 'utf8');
      const allow = ALLOW[rel] || [];
      for (const line of findViolations(src)) {
        if (allow.includes(line)) continue;
        failures.push(rel + ':' + line);
      }
    }
  }
  if (failures.length) {
    throw new Error('[lint-null-children] conditional null among vnode siblings without .filter(Boolean):\n  ' + failures.join('\n  '));
  }
  console.log('[lint-null-children] OK: every conditional-children array is filter(Boolean)\'d.');
}

if (import.meta.url === 'file://' + process.argv[1] || process.argv[1]?.endsWith('lint-null-children.mjs')) {
  lintNullChildrenOrThrow();
}
