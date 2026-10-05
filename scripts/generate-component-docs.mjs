#!/usr/bin/env node
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractComponentSurface, root, readNormalized } from './component-surface.mjs';
import { die, orDie } from './die.mjs';

const CHECK = process.argv.includes('--check');

const { components, driftWarnings, fileOrder } = orDie(extractComponentSurface);

function esc(s) { return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' '); }

function renderProps(props) {
    if (!props.length) return '_(no props)_';
    if (props.length === 1 && props[0].name === '(value)') {
        return '`' + esc(props[0].default) + '`';
    }
    return props
        .map((p) => {
            let s = '`' + p.name + '`';
            if (p.alias) s += ` _(local: ${p.alias})_`;
            if (p.default != null) s += ` = \`${esc(p.default)}\``;
            if (p.positional) s += ' _(positional arg)_';
            return s;
        })
        .join(', ');
}

let md = `# Component props reference\n\n`;
md += `Generated from \`src/components.js\`'s real export barrel + each symbol's real definition in \`src/components/*.js\`, via \`node scripts/generate-component-docs.mjs\`. Do not hand-edit: re-run after any component signature or JSDoc change.\n\n`;
md += `${components.length} exported symbols across ${fileOrder.length} source files.`;
if (driftWarnings.length) md += ` **${driftWarnings.length} drift warning(s) found: see bottom of file.**`;
md += `\n\n---\n\n`;

for (const file of fileOrder) {
    const inFile = components.filter((c) => c.file === file);
    if (!inFile.length) continue;
    md += `## \`src/${file}\`\n\n`;
    for (const c of inFile) {
        md += `### ${c.name}\n\n`;
        if (c.jsdoc && c.jsdoc.description) md += `${c.jsdoc.description}\n\n`;
        md += `**Kind:** ${c.kind}\n\n`;
        md += `**Signature:** ${renderProps(c.props)}\n\n`;
        if (c.jsdoc && c.jsdoc.params.length) {
            md += `**Documented params:**\n\n`;
            for (const p of c.jsdoc.params) {
                md += `- \`${p.name}\`${p.type ? ` _(${p.type})_` : ''}${p.desc ? `: ${p.desc}` : ''}\n`;
            }
            md += `\n`;
        }
        if (c.jsdoc && c.jsdoc.returns) md += `**Returns:** ${c.jsdoc.returns}\n\n`;
        if (c.jsdoc && c.jsdoc.example) md += `**Example:**\n\n\`\`\`js\n${c.jsdoc.example}\n\`\`\`\n\n`;
    }
}

if (driftWarnings.length) {
    md += `---\n\n## Drift warnings\n\n`;
    md += `Found by the generator while cross-checking components.js's export list against real source definitions and (where present) JSDoc @param names against the real destructured signature. These indicate the barrel, the source file, or a JSDoc comment disagree with each other and should be reconciled by hand.\n\n`;
    for (const w of driftWarnings) md += `- ${w}\n`;
    md += `\n`;
}

const outPath = join(root, 'docs', 'component-props.md');

if (CHECK) {
    const existing = existsSync(outPath) ? readNormalized(outPath) : null;
    if (existing !== md) {
        die(`[component-docs] docs/component-props.md is stale: run \`node scripts/generate-component-docs.mjs\` and commit the result`);
    }
    console.log(`[component-docs] docs/component-props.md is up to date (${components.length} symbols, 0 drift)`);
    process.exit(0);
}

writeFileSync(outPath, md);
console.log(`[component-docs] wrote docs/component-props.md (${components.length} symbols across ${fileOrder.length} files, ${driftWarnings.length} drift warning(s))`);
if (driftWarnings.length) {
    for (const w of driftWarnings) console.log(`  ! ${w}`);
}
