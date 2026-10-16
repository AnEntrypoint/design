import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPage } from './cdp.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const axePath = join(root, 'vendor', 'axe-core', 'axe.min.js');
const HOST_KIT = 'buttons';
const THEME_SETTLE_MS = 300;
const INPUT_BORDER_MIN = 3;

export const THEME_MODES = [
    { name: 'light', theme: 'paper', scheme: 'light' },
    { name: 'auto-dark', theme: 'auto', scheme: 'dark' },
    { name: 'dark', theme: 'dark', scheme: 'light' },
    { name: 'ink', theme: 'ink', scheme: 'light' },
    { name: 'thebird', theme: 'thebird', scheme: 'light' },
    { name: 'herd', theme: 'herd', scheme: 'light' },
    { name: 'herd-ink', theme: 'herd-ink', scheme: 'light' },
    { name: 'dark+brand', theme: 'dark', scheme: 'light', accent: 'brand' },
    { name: 'dark+purple', theme: 'dark', scheme: 'light', accent: 'purple' },
    { name: 'dark+green', theme: 'dark', scheme: 'light', accent: 'green' },
    { name: 'light+brand', theme: 'paper', scheme: 'light', accent: 'brand' },
    { name: 'light+green', theme: 'paper', scheme: 'light', accent: 'green' },
    { name: 'light+purple', theme: 'paper', scheme: 'light', accent: 'purple' },
    { name: 'light+alt', theme: 'paper', scheme: 'light', accent: 'alt' },
];

const SURFACES = ['--bg', '--bg-2', '--bg-3'];
const SURFACE_AGNOSTIC_FILL = /--fg|badge|chip|pill|btn-primary|btn-ghost|ds-icon|alert|class="btn"/;

const BUTTON_CLASSES = [
    'btn', 'btn-primary', 'btn-ghost', 'btn-link', 'btn-primary danger', 'btn-primary is-armed', 'btn is-armed',
    'btn-stamp', 'btn-stamp brand', 'btn-stamp purple', 'btn-stamp alt', 'btn-sm btn-primary', 'btn-lg btn-primary',
    'ds-icon-btn ds-icon-btn-primary', 'ds-icon-btn ds-icon-btn-danger', 'ds-icon-btn ds-icon-btn-ghost',
];
const STAMP_CLASSES = ['stamp', 'stamp ink', 'stamp brand', 'stamp purple', 'stamp alt'];
const BADGE_TONES = ['green', 'success', 'live', 'flame', 'error', 'wip', 'neutral', 'purple', 'alt', 'sun', 'yellow', 'blue', 'orange'];
const CHIP_TONES = ['green', 'success', 'ok', 'live', 'flame', 'error', 'miss', 'warn', 'wip', 'neutral', 'accent', 'dim', 'purple', 'alt', 'sun', 'yellow', 'blue', 'orange', 'warning', 'info', 'fail', 'skip', 'unknown'];
const ALERT_KINDS = ['info', 'success', 'warn', 'error'];
const TEXT_TOKENS = [
    '--fg', '--fg-2', '--fg-3', '--accent-ink', '--flame', '--warn', '--danger', '--success', '--amber', '--green', '--sky',
    '--code-string', '--code-keyword', '--code-fn', '--code-str-alt', '--code-num', '--alt-deep',
    '--category-green-ink', '--category-purple-ink', '--category-alt-ink',
];
const TEXT_TOKENS_FIT_FOR_BG_3 = ['--fg', '--fg-2', '--fg-3'];

function buildMatrixMarkup() {
    const sections = SURFACES.map((surface) => {
        const buttons = BUTTON_CLASSES.map((c) => `<button type="button" class="${c}">${c}</button>`);
        const stamps = STAMP_CLASSES.map((c) => `<span class="${c}">${c}</span>`);
        const badges = BADGE_TONES.map((t) => `<span class="ds-badge tone-${t}">badge ${t}</span>`);
        const chips = CHIP_TONES.map((t) => `<span class="chip tone-${t}">chip ${t}</span>`);
        const tokens = TEXT_TOKENS.map((t) => `<span style="color:var(${t})">${t}</span>`);
        const alerts = ALERT_KINDS.map((k) => `<div class="ds-alert ds-alert-${k}"><div class="ds-alert-content"><div class="ds-alert-title">${k}</div><div class="ds-alert-message">${k} message</div></div></div>`);
        const field = '<input placeholder="placeholder text" aria-label="matrix field" style="background:var(--bg)">';
        const pills = '<span class="ds-pill tone-accent">pill accent</span><span class="ds-pill tone-muted">pill muted</span>';
        return `<section data-surf="${surface}" style="background:var(${surface});color:var(--fg);padding:8px;margin:4px 0">${[...buttons, ...stamps, ...badges, ...chips, ...tokens, pills, ...alerts, field].join(' ')}</section>`;
    });
    return sections.join('');
}

const MOUNT_SCRIPT = (markup) => `(() => {
    const previous = document.getElementById('ds-a11y-matrix');
    if (previous) previous.remove();
    const host = document.createElement('div');
    host.id = 'ds-a11y-matrix';
    host.className = 'ds-247420';
    host.style.cssText = 'position:relative;z-index:9999;background:var(--bg);color:var(--fg);padding:8px';
    host.innerHTML = ${JSON.stringify(markup)};
    document.body.prepend(host);
})()`;

const applyModeScript = ({ theme, accent }) => `(() => {
    document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)});
    ${accent ? `document.documentElement.setAttribute('data-accent', ${JSON.stringify(accent)});` : "document.documentElement.removeAttribute('data-accent');"}
})()`;

const axeOnSurfaceScript = (surface) => `
    axe.run(document.querySelector('[data-surf="${surface}"]'), { runOnly: { type: 'rule', values: ['color-contrast'] } })
        .then((r) => r.violations.flatMap((v) => v.nodes.map((n) => ({
            ratio: n.any[0] && n.any[0].data ? n.any[0].data.contrastRatio : null,
            fg: n.any[0] && n.any[0].data ? n.any[0].data.fgColor : null,
            bg: n.any[0] && n.any[0].data ? n.any[0].data.bgColor : null,
            html: n.html.slice(0, 80),
        }))))
`;

const INPUT_BORDER_SCRIPT = `(() => {
    const canvas = document.createElement('canvas').getContext('2d');
    const rgba = (css) => { canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = css; canvas.fillRect(0, 0, 1, 1); return [...canvas.getImageData(0, 0, 1, 1).data]; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const section = document.querySelector('[data-surf="--bg"]');
    const surface = rgba(getComputedStyle(section).backgroundColor);
    const border = rgba(getComputedStyle(section.querySelector('input')).borderTopColor);
    const alpha = border[3] / 255;
    const flat = [0, 1, 2].map((i) => border[i] * alpha + surface[i] * (1 - alpha));
    const [hi, lo] = [lum(flat), lum(surface)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
})()`;

export async function auditComponentMatrix(baseUrl) {
    const failures = [];
    await withPage(`${baseUrl}/ui_kits/${HOST_KIT}/`, async (page) => {
        await page.addScriptFile(axePath);
        await page.evaluate(MOUNT_SCRIPT(buildMatrixMarkup()));
        for (const mode of THEME_MODES) {
            await page.setEmulatedPrefs({ colorScheme: mode.scheme });
            await page.evaluate(applyModeScript(mode));
            await new Promise((resolve) => setTimeout(resolve, THEME_SETTLE_MS));
            for (const surface of SURFACES) {
                const found = await page.evaluate(axeOnSurfaceScript(surface));
                for (const f of found) {
                    const surfaceAgnostic = SURFACE_AGNOSTIC_FILL.test(f.html);
                    const tokenSpan = /style="color:var\((--[\w-]+)\)/.exec(f.html);
                    const exempt = surface === '--bg-3' && !surfaceAgnostic && !(tokenSpan && TEXT_TOKENS_FIT_FOR_BG_3.includes(tokenSpan[1]));
                    if (!exempt) failures.push({ mode: mode.name, surface, ...f });
                }
            }
            const border = await page.evaluate(INPUT_BORDER_SCRIPT);
            if (border < INPUT_BORDER_MIN) failures.push({ mode: mode.name, surface: '--bg', ratio: border, fg: 'input border', bg: '--bg', html: '<input> border' });
        }
    }, { emulate: { colorScheme: 'light' }, settleMs: 400 });
    return failures;
}
