#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kits } from '../ui_kits/kits.config.mjs';
import { die } from './die.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'ui_kits/_template/index.html.tmpl');

function readWithLfNewlines(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

const template = readWithLfNewlines(templatePath);

const CHECK = process.argv.includes('--check');

function authorAndKeywordMetas(kit) {
  const seo = kit.seo;
  if (!seo) return '';
  const lines = [];
  if (seo.author) lines.push(`  <meta name="author" content="${seo.author}">`);
  if (seo.keywords) lines.push(`  <meta name="keywords" content="${seo.keywords}">`);
  return lines.length ? lines.join('\n') + '\n' : '';
}

function socialAndRobotsMetas(kit) {
  const seo = kit.seo;
  if (!seo) return '';
  const title = titleFor(kit);
  const canonical = `https://anentrypoint.github.io/design/ui_kits/${kit.id}/`;
  const lines = [];
  lines.push(`  <meta property="og:type" content="website">`);
  lines.push(`  <meta property="og:title" content="${title}">`);
  lines.push(`  <meta property="og:description" content="${kit.description}">`);
  lines.push(`  <meta property="og:url" content="${canonical}">`);
  lines.push(`  <meta property="og:site_name" content="247420 / design">`);
  lines.push(`  <meta property="og:locale" content="en_US">`);
  if (seo.twitter) {
    lines.push(`  <meta name="twitter:card" content="summary">`);
    lines.push(`  <meta name="twitter:title" content="${title}">`);
    lines.push(`  <meta name="twitter:description" content="${kit.description}">`);
    lines.push(`  <meta name="twitter:site" content="@AnEntrypoint">`);
  }
  lines.push(`  <meta name="robots" content="index, follow">`);
  return lines.join('\n') + '\n';
}

function titleFor(kit) {
  return kit.titleSuffixed ? `${kit.title} 247420` : `${kit.title} / 247420`;
}

function render(kit) {
  const title = titleFor(kit);
  const htmlThemeAttr = kit.htmlTheme ? ' data-theme="auto"' : '';
  const themeColorMetas = kit.themeColorMetas
    ? '  <meta name="theme-color" content="#247420" media="(prefers-color-scheme: light)">\n  <meta name="theme-color" content="#3A9A34" media="(prefers-color-scheme: dark)">\n'
    : '';

  const stylesheetLines = [
    '  <link rel="stylesheet" href="../../colors_and_type.css">',
    '  <link rel="stylesheet" href="../../app-shell.css">',
    ...kit.stylesheets.map(s => `  <link rel="stylesheet" href="../../${s}">`),
  ];
  const blankLineBeforeImportmap = kit.seo ? '\n' : '';
  const stylesheets = stylesheetLines.join('\n') + blankLineBeforeImportmap;

  const importExtra = kit.importExtra.length
    ? ',\n' + kit.importExtra.map(s => `  "${s}": "${s === 'ds/' ? '../../src/' : '../../vendor/webjsx-router.js'}"`).join(',\n')
    : '';

  const authorAndKeywords = authorAndKeywordMetas(kit);

  let html = template
    .replaceAll('{{KIT_ID}}', kit.id)
    .replaceAll('{{TITLE}}', kit.titleSuffixed ? kit.title.replace(/ \·?$/, '') : kit.title)
    .replaceAll('{{DESCRIPTION}}', kit.description)
    .replaceAll('{{SCREEN_LABEL}}', kit.screenLabel)
    .replace('{{HTML_THEME_ATTR}}', htmlThemeAttr)
    .replace('{{THEME_COLOR_METAS}}', themeColorMetas)
    .replace('{{SEO_METAS}}', authorAndKeywords)
    .replace('{{STYLESHEETS}}', stylesheets)
    .replace('{{IMPORTMAP_EXTRA}}', importExtra);

  if (kit.titleSuffixed) {
    html = html.replace(`<title>${kit.title.replace(/ \·?$/, '')} / 247420</title>`, `<title>${kit.title} 247420</title>`);
  }

  const socialMetas = socialAndRobotsMetas(kit);
  if (socialMetas) {
    html = html.replace(
      '  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">\n',
      `  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">\n${socialMetas}`
    );
  }

  return html;
}

let drift = 0;
for (const kit of kits) {
  const outPath = join(root, 'ui_kits', kit.id, 'index.html');
  const rendered = render(kit);
  if (CHECK) {
    const current = readWithLfNewlines(outPath);
    if (current !== rendered) {
      console.error(`[generate-ui-kit-scaffolds] DRIFT: ui_kits/${kit.id}/index.html does not match generated output`);
      drift++;
    }
    continue;
  }
  writeFileSync(outPath, rendered);
  console.log(`[generate-ui-kit-scaffolds] wrote ui_kits/${kit.id}/index.html`);
}

if (CHECK) {
  if (drift) {
    die(`[generate-ui-kit-scaffolds] ${drift} kit(s) drifted from template -- run 'node scripts/generate-ui-kit-scaffolds.mjs' to regenerate`);
  }
  console.log(`[generate-ui-kit-scaffolds] all ${kits.length} thin kits match generated output`);
} else {
  console.log(`[generate-ui-kit-scaffolds] regenerated ${kits.length} thin kit shells`);
}
