#!/usr/bin/env node
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withPage, cdpAvailable, CDP_BASE } from './cdp.mjs';
import { die } from './die.mjs';
import { auditComponentMatrix } from './a11y-component-matrix.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const kitsDir = join(root, 'ui_kits');
const axePath = join(root, 'vendor', 'axe-core', 'axe.min.js');
const baselinePath = join(root, 'scripts', 'a11y.baseline.json');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8899';

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const EMULATED_COLOR_SCHEMES = ['light', 'dark'];
const EMULATED_REDUCED_MOTION = 'reduce';
const SAMPLE_NODES_PER_RULE = 5;
const SAMPLE_HTML_CHARS = 200;

function listServableKits() {
    return readdirSync(kitsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((n) => existsSync(join(kitsDir, n, 'index.html')))
        .sort();
}

const axeRunProjectedToPlainData = `
    window.axe.run(document, { runOnly: { type: 'tag', values: ${JSON.stringify(WCAG_TAGS)} } })
        .then((r) => ({
            passes: r.passes.length,
            violations: r.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.length,
                sample: v.nodes.slice(0, ${SAMPLE_NODES_PER_RULE}).map((n) => ({
                    target: String(n.target),
                    why: String(n.failureSummary || '').replace(/\\s+/g, ' ').trim(),
                    html: String(n.html || '').slice(0, ${SAMPLE_HTML_CHARS}),
                })),
            })),
        }))
`;

async function auditKitUnderScheme(kit, colorScheme) {
    const directoryUrlWithTrailingSlash = `${BASE_URL}/ui_kits/${kit}/`;
    return withPage(directoryUrlWithTrailingSlash, async (page) => {
        await page.addScriptFile(axePath);
        return page.evaluate(axeRunProjectedToPlainData);
    }, { emulate: { colorScheme, reducedMotion: EMULATED_REDUCED_MOTION } });
}

async function auditKit(kit) {
    const merged = { kit, passes: 0, violations: [] };
    for (const scheme of EMULATED_COLOR_SCHEMES) {
        const raw = await auditKitUnderScheme(kit, scheme);
        merged.passes += raw.passes;
        merged.violations.push(...raw.violations.map((v) => ({ ...v, help: `[${scheme}] ${v.help}` })));
    }
    return merged;
}

function describeMatrixFailure(f) {
    return `${f.mode} on ${f.surface}: ${f.ratio}:1 ${f.fg} / ${f.bg} :: ${f.html}`;
}

function printBlockingDetail(results) {
    for (const r of results) {
        const blocking = r.violations.filter((v) => BLOCKING_IMPACTS.has(v.impact));
        if (!blocking.length) continue;
        console.error(`[a11y-audit] --- ${r.kit} ---`);
        for (const v of blocking) {
            console.error(`  rule=${v.id} impact=${v.impact} nodes=${v.nodes} :: ${v.help}`);
            for (const s of v.sample) {
                console.error(`    node: ${s.target}`);
                if (s.why) console.error(`      why: ${s.why}`);
                if (s.html) console.error(`      html: ${s.html}`);
            }
        }
    }
}

function blockingCount(result) {
    return result.violations
        .filter((v) => BLOCKING_IMPACTS.has(v.impact))
        .reduce((sum, v) => sum + v.nodes, 0);
}

function readBaseline() {
    if (!existsSync(baselinePath)) return null;
    return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

function writeReport(results) {
    const lines = ['# a11y audit report', ''];
    lines.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`node scripts/a11y-audit.mjs\` against the live rendered DOM via axe-core, WCAG-tagged rules only: \`${WCAG_TAGS.join(', ')}\`.`);
    lines.push('');
    lines.push('**This is not a WCAG AA conformance statement.** Automated rules cover a real but partial slice of WCAG success criteria, and this run explicitly excludes best-practice checks outside the WCAG tag set above: notably `bypass` (skip-link presence) and `page-has-heading-one` (a real `<h1>`), so a kit can score 0 here with no skip link and no `h1`. See `docs/accessibility.md` for what manual verification (screen readers, keyboard-only traversal, zoom/reflow, target size) has and has not been done.');
    lines.push('');
    const totalBlocking = results.reduce((s, r) => s + blockingCount(r), 0);
    lines.push(`${results.length} kit(s) scanned, ${totalBlocking} blocking (serious/critical) node-level violation(s).`);
    lines.push('');
    for (const r of results) {
        if (!r.violations.length) continue;
        lines.push(`## ${r.kit}`);
        for (const v of r.violations) {
            lines.push(`- **${v.id}** (${v.impact}): ${v.help}: ${v.nodes} node(s)`);
            lines.push(`  - ${v.helpUrl}`);
            for (const s of v.sample) {
                lines.push(`  - \`${s.target}\``);
                if (s.why) lines.push(`    - ${s.why}`);
            }
        }
        lines.push('');
    }
    mkdirSync(join(root, 'docs'), { recursive: true });
    writeFileSync(join(root, 'docs', 'a11y-report.md'), lines.join('\n'));
}

export async function auditAllKits({ onProgress } = {}) {
    const results = [];
    for (const kit of listServableKits()) {
        const r = await auditKit(kit);
        results.push(r);
        if (onProgress) onProgress(r);
    }
    return results;
}

function compareAgainstBaseline(counts, baseline) {
    const regressed = [];
    const improved = [];
    for (const [kit, count] of Object.entries(counts)) {
        const base = baseline.kits[kit];
        const isNewKitWithZeroTolerance = base === undefined;
        if (isNewKitWithZeroTolerance) {
            if (count > 0) regressed.push(`${kit}: ${count} blocking violation(s) (new kit, baseline 0)`);
            continue;
        }
        if (count > base) regressed.push(`${kit}: ${count} blocking violation(s), baseline ${base}`);
        else if (count < base) improved.push(`${kit}: ${count} < baseline ${base}`);
    }
    for (const kit of Object.keys(baseline.kits)) {
        if (!(kit in counts)) regressed.push(`${kit}: listed in the baseline but no such kit exists`);
    }
    return { regressed, improved };
}

async function main() {
    const write = process.argv.includes('--write-baseline');

    if (!(await cdpAvailable())) {
        console.error(`[a11y-audit] no CDP endpoint at ${CDP_BASE}.`);
        die('[a11y-audit] start Chrome with --headless --remote-debugging-port=9333 (a workflow step or your own browser; this script never launches one) and serve the repo at ' + BASE_URL);
    }

    const results = await auditAllKits({
        onProgress: (r) => console.log(`[a11y-audit] ${r.kit}: ${blockingCount(r)} blocking, ${r.violations.length} rule(s), ${r.passes} pass(es)`),
    });
    writeReport(results);

    const counts = Object.fromEntries(results.map((r) => [r.kit, blockingCount(r)]));
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    if (write) {
        writeFileSync(baselinePath, JSON.stringify({ total, kits: counts }, null, 2) + '\n');
        console.log(`[a11y-audit] baseline written: ${total} blocking violation(s) across ${results.length} kit(s).`);
        return;
    }

    const baseline = readBaseline();
    if (!baseline) die('[a11y-audit] no baseline. Run: node scripts/a11y-audit.mjs --write-baseline');

    const { regressed, improved } = compareAgainstBaseline(counts, baseline);

    console.log(`[a11y-audit] ${results.length} kit(s), ${total} blocking violation(s) (baseline ${baseline.total}). Report: docs/a11y-report.md`);

    if (regressed.length) {
        console.error('[a11y-audit] FAIL: a11y regression:');
        for (const r of regressed) console.error(`  - ${r}`);
        printBlockingDetail(results);
        die('[a11y-audit] Fix the violation. Never raise the baseline to make it pass.');
    }
    if (improved.length) {
        console.error('[a11y-audit] FAIL: violations dropped below baseline; re-freeze it DOWNWARD:');
        for (const i of improved) console.error(`  - ${i}`);
        die('[a11y-audit] Run: node scripts/a11y-audit.mjs --write-baseline');
    }
    const matrixFailures = await auditComponentMatrix(BASE_URL);
    if (matrixFailures.length) {
        console.error('[a11y-audit] FAIL: component matrix contrast:');
        for (const f of matrixFailures) console.error(`  - ${describeMatrixFailure(f)}`);
        die('[a11y-audit] Fix the token or the component pairing; the matrix has no baseline.');
    }
    console.log('[a11y-audit] OK: no regression against baseline; component matrix clean across all theme modes.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
}
