#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from './lint-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SCAN_DIR = path.join(root, 'src', 'components');

const PREFIXES = ['ds-', 'app-', 'ws-', 'chat-', 'agentchat-', 'aicat-', 'cm-', 'ov-', 'vx-', 'fd-',
  'btn', 'row', 'panel', 'seg', 'crumb', 'status-dot', 'is-', 'rail-', 'tone-', 'glyph',
  'event-', 'side', 'brand', 'kpi', 'kind-', 'tool-'];

const FROZEN_LEGACY_BARE_NAMES = new Set(['agentchat', 'app', 'cancel', 'cap', 'chat', 'chip', 'cli', 'cmd', 'code',
  'composer-btn', 'copy', 'count', 'danger', 'desc', 'dot', 'e', 'empty', 'eyebrow', 'field-error',
  'go', 'group', 'grow', 'host', 'icon', 'input', 'item', 'kv', 'lang', 'lbl', 'leaf', 'lede',
  'meta', 'n', 'name', 'num', 'open', 'prompt', 'rxn', 'send', 'sep', 'size', 'skip-link', 'slash',
  'spread', 'sr-only', 'status', 'sub', 't', 'thumb', 'tick', 'title', 'who', 'work-detail',
  'kpi-card', 'active', 'show',
  'dim']);

export function lintClassesOrThrow() {
  const failures = [];
  for (const file of walkFiles(SCAN_DIR, new Set(['.js']))) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    lines.forEach((line, idx) => {
      for (const m of line.matchAll(/class:\s*'([^']*)'/g)) {
        for (const tok of m[1].split(/\s+/)) {
          if (!tok) continue;
          if (PREFIXES.some((p) => tok.startsWith(p))) continue;
          if (FROZEN_LEGACY_BARE_NAMES.has(tok)) continue;
          failures.push(`${rel}:${idx + 1} '${tok}'`);
        }
      }
    });
  }
  failures.sort();
  if (failures.length) {
    throw new Error('[lint-classes] unprefixed class token(s) - new classes need a family prefix:\n  ' + failures.join('\n  '));
  }
  console.log('[lint-classes] OK: every emitted class token is prefixed, public, or frozen-legacy.');
}

if (process.argv[1]?.endsWith('lint-classes.mjs')) {
  try { lintClassesOrThrow(); }
  catch (e) { console.error(e.message); process.exit(1); }
}
