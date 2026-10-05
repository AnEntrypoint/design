#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const APP_SHELL_SPLIT = [
  'base.css', 'topbar.css', 'primitives.css', 'panel-row.css', 'hero-content.css',
  'responsive.css', 'chat-basic.css', 'files.css', 'catalog-theme.css',
  'chat-polish.css', 'sidebar-misc.css', 'states-interactions.css',
  'loading-alerts.css', 'responsive2-workspace.css', 'row-print.css',
  'data-density.css', 'kits-appended.css', 'git-status.css', 'plugins-config.css',
  'models-config.css', 'skills-config.css', 'slider.css', 'otp-input.css',
  'carousel.css', 'calendar.css', 'collab.css', 'context-pane.css',
  'dashboard.css',
];

export const CSS_PARTS = [
  ['colors_and_type.css', path.join(root, 'colors_and_type.css')],
  ...APP_SHELL_SPLIT.map((n) => [`app-shell/${n}`, path.join(root, 'src/css/app-shell', n)]),
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

const MIN_SHARED_PROPERTIES = 3;
const MIN_PROPERTY_OVERLAP_RATIO = 0.7;
const KEYFRAME_STEP_SELECTOR = /^(from|to|\d+%)$/;

function declarationsByProperty(rule) {
  const map = new Map();
  for (const d of rule.nodes) {
    if (d.type !== 'decl') continue;
    const prop = d.prop.trim().toLowerCase();
    const val = d.value.trim().replace(/\s+/g, ' ') + (d.important ? ' !important' : '');
    map.set(prop, val);
  }
  return map;
}

function atRuleContext(node) {
  const chain = [];
  let p = node.parent;
  while (p && p.type !== 'root') {
    if (p.type === 'atrule') chain.unshift(`@${p.name} ${p.params}`.trim());
    p = p.parent;
  }
  return chain.join(' > ');
}

function describeDuplicate({ sel, ctx, shared, union, prior, label, line, decls, conflicts }) {
  return `'${sel}'${ctx ? ` (under ${ctx})` : ''} looks like a duplicated block (${shared.length}/${union} properties shared) ` +
    `between ${prior.label}:${prior.line} and ${label}:${line}; conflicting: ${conflicts.map((p) => `${p} ('${prior.decls.get(p)}' vs '${decls.get(p)}')`).join(', ')}`;
}

function findConflictingDuplicate(prior, decls) {
  if (prior.grouped) return null;
  const shared = [...decls.keys()].filter((p) => prior.decls.has(p));
  if (shared.length < MIN_SHARED_PROPERTIES) return null;
  const union = new Set([...decls.keys(), ...prior.decls.keys()]).size;
  if (shared.length / union < MIN_PROPERTY_OVERLAP_RATIO) return null;
  const conflicts = shared.filter((p) => prior.decls.get(p) !== decls.get(p));
  if (!conflicts.length) return null;
  return { shared, union, conflicts };
}

export function lintDuplicateSelectorsOrThrow() {
  const seen = new Map();
  const failures = [];

  for (const [label, file] of CSS_PARTS) {
    if (!fs.existsSync(file)) continue;
    const css = fs.readFileSync(file, 'utf8');
    let parsed;
    try {
      parsed = postcss.parse(css, { from: file });
    } catch (err) {
      failures.push(`${label}: parse error - ${err.message}`);
      continue;
    }
    parsed.walkRules((rule) => {
      if (KEYFRAME_STEP_SELECTOR.test(rule.selector.trim())) return;
      const decls = declarationsByProperty(rule);
      if (!decls.size) return;
      const ctx = atRuleContext(rule);
      const line = rule.source?.start?.line;
      const parts = rule.selector.split(',').map((s) => s.trim()).filter(Boolean);
      const grouped = parts.length > 1;
      for (const sel of parts) {
        const key = `${ctx}||${sel}`;
        let entries = seen.get(key);
        if (!entries) { entries = []; seen.set(key, entries); }
        if (!grouped) {
          for (const prior of entries) {
            const found = findConflictingDuplicate(prior, decls);
            if (found) failures.push(describeDuplicate({ sel, ctx, prior, label, line, decls, ...found }));
          }
        }
        entries.push({ label, line, decls, grouped });
      }
    });
  }

  if (failures.length) {
    throw new Error('[lint-duplicate-selectors] selector(s) look like a duplicated CSS block with a conflicting value:\n  ' + failures.join('\n  '));
  }
  console.log('[lint-duplicate-selectors] OK: no selector looks like a stale duplicated block with a conflicting value.');
}

if (process.argv[1]?.endsWith('lint-duplicate-selectors.mjs')) {
  lintDuplicateSelectorsOrThrow();
}
