
import * as webjsx from '../../vendor/webjsx/index.js';
import { Pill } from './shell.js';
import { Progress } from './data-density/progress.js';
const h = webjsx.createElement;

export { Progress };

export const DEFAULT_PHASES = ['PLAN', 'EXECUTE', 'EMIT', 'VERIFY', 'CONSOLIDATE', 'COMPLETE'];

export function PhaseWalk({ phases = DEFAULT_PHASES, reached = [], gapKinds = [] } = {}) {
    const gaps = new Set(gapKinds || []);
    return h('div', { class: 'ds-phasewalk', role: 'group', 'aria-label': 'phase progress' },
        ...phases.map((p, i) => {
            const isGap = gaps.has(p);
            const isReached = Boolean(reached[i]);
            const cls = 'ds-phasewalk-seg' + (isGap ? ' is-gap' : (isReached ? ' is-reached' : ''));
            const title = p + (isGap ? ' (gap)' : (isReached ? ' (reached)' : ' (not reached)'));
            return h('span', { key: p, class: cls, title },
                h('span', { class: 'ds-phasewalk-lbl', 'aria-hidden': 'true' }, p.charAt(0)));
        }));
}

export function TreeNode({ ts, kind, variant = '', phase, id, keyLabel, reason, deviationLabel, residuals } = {}) {
    const cls = 'ds-tree-node' + (variant ? ' is-' + variant : '');
    const pills = [
        phase ? Pill({ key: 'phase', children: phase }) : null,
        id ? Pill({ key: 'id', children: id }) : null,
        keyLabel ? Pill({ key: 'key', children: keyLabel }) : null,
    ].filter(Boolean);
    return h('div', { class: cls },
        ts != null ? h('span', { class: 'ds-tree-node-ts' }, ts) : null,
        h('strong', {}, kind),
        pills.length ? h('span', { class: 'ds-tree-node-pills' }, ...pills) : null,
        reason ? h('div', { class: 'ds-tree-node-reason' }, reason) : null,
        deviationLabel ? h('div', { class: 'ds-tree-node-deviation' }, h('strong', {}, deviationLabel)) : null,
        (residuals && residuals.length) ? h('div', { class: 'ds-tree-node-residuals' }, residuals.join(', ')) : null);
}

export function BarRow({ label, value, pct = 0, tone } = {}) {
    const clamped = Math.max(0, Math.min(100, pct));
    return h('div', {
        class: 'ds-bar-row', role: 'meter', 'aria-label': label != null ? String(label) : 'value',
        'aria-valuenow': String(clamped), 'aria-valuemin': '0', 'aria-valuemax': '100',
    },
        h('span', { class: 'ds-bar-row-label', style: tone ? `color:${tone}` : null }, label),
        h('div', { class: 'ds-bar-bg', 'aria-hidden': 'true' },
            h('div', { class: 'ds-bar-fill', style: `width:${clamped}%` + (tone ? `;background:${tone}` : '') })),
        h('span', { class: 'ds-bar-row-value', 'aria-hidden': 'true' }, value));
}

export function RateCell({ value, tone = 'neutral' } = {}) {
    const cls = 'ds-rate-cell ds-rate-cell-' + tone;
    return h('span', { class: cls }, value == null ? '-' : String(value));
}

export function StatTile({ val, lbl, cls = '' } = {}) {
    return h('div', { class: 'ds-stat', role: 'group', 'aria-label': `${lbl || 'stat'}: ${val}` },
        h('div', { class: 'ds-stat-val' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' }, val),
        h('div', { class: 'ds-stat-lbl', 'aria-hidden': 'true' }, lbl));
}

export function StatsGrid({ items = [] } = {}) {
    if (!items.length) return h('div', { class: 'ds-stats-grid ds-stats-grid-empty' },
        h('span', { class: 'ds-stat-lbl' }, 'no stats'));
    return h('div', { class: 'ds-stats-grid', role: 'group', 'aria-label': 'stats' },
        ...items.map((it, i) => h('div', { key: it.key || i }, StatTile(it))));
}

export function SubGrid({ items = [] } = {}) {
    if (!items.length) return h('div', { class: 'ds-sub-grid ds-sub-grid-empty' },
        h('span', { class: 'ds-stat-lbl' }, 'no items'));
    return h('div', { class: 'ds-sub-grid', role: 'group', 'aria-label': 'categories' },
        ...items.map((it, i) => h('button', {
            key: it.key || i, type: 'button', class: 'ds-sub-btn',
            onclick: it.onClick || null,
            'aria-label': `${it.label}: ${String(it.count)}`,
        }, h('span', { 'aria-hidden': 'true' }, String(it.count)), it.label)));
}

export function SessionRow({ sessId, phaseWalkProps, events, verbs, prd, muts, resid, deviations, firstTs, lastTs, onClick } = {}) {
    const counts = [
        events != null ? events + ' ev' : null,
        verbs != null ? verbs + ' verb' : null,
        prd != null ? prd + ' prd' : null,
        muts != null ? muts + ' mut' : null,
        resid != null ? resid + ' resid' : null,
    ].filter(Boolean).join(' · ');
    return h('div', {
        class: 'ds-session-row', onclick: onClick || null,
        role: onClick ? 'button' : null, tabindex: onClick ? '0' : null,
        onkeydown: onClick ? (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onClick(e); } } : null,
        'aria-label': onClick ? `session ${sessId}: ${counts}` : null,
    },
        h('span', { class: 'ds-session-row-id' }, sessId),
        h('span', { class: 'ds-session-row-counts' }, counts),
        (deviations != null && deviations !== 0) ? h('span', { class: 'ds-session-row-devcnt' }, String(deviations) + ' dev') : null,
        phaseWalkProps ? PhaseWalk(phaseWalkProps) : null,
        (firstTs || lastTs) ? h('span', { class: 'ds-session-row-span' }, [firstTs, lastTs].filter(Boolean).join(' -> ')) : null);
}

export function DevRow({ ts, event, sess, operation, residuals } = {}) {
    const pills = [
        sess ? Pill({ key: 'sess', children: sess }) : null,
        operation ? Pill({ key: 'op', children: operation }) : null,
    ].filter(Boolean);
    return h('div', { class: 'ds-dev-row' },
        ts != null ? h('span', { class: 'ds-tree-node-ts' }, ts) : null,
        h('strong', {}, event),
        pills.length ? h('span', { class: 'ds-tree-node-pills' }, ...pills) : null,
        (residuals && residuals.length) ? h('div', { class: 'ds-tree-node-residuals' }, residuals.join(', ')) : null);
}

export function LiveLogEntry({ ts, sub, tone, event, preview } = {}) {
    const tagStyle = tone
        ? `background:color-mix(in oklab, ${tone} 18%, transparent);color:${tone}`
        : null;
    return h('div', { class: 'ds-live-log-entry' },
        h('span', { class: 'ds-live-log-ts' }, ts),
        sub ? h('span', { class: 'ds-live-log-subtag', style: tagStyle }, sub) : null,
        h('strong', {}, event),
        preview ? h('span', { class: 'ds-live-log-preview' }, preview) : null);
}

export function LiveLog({ entries = [], autoScroll = true } = {}) {
    const seedScroll = (el) => {
        if (!el || !autoScroll) return;
        el.scrollTop = el.scrollHeight;
    };
    if (!entries.length) return h('div', { class: 'ds-live-log ds-live-log-empty' },
        h('span', { class: 'ds-stat-lbl' }, 'no log entries'));
    return h('div', { class: 'ds-live-log', ref: seedScroll, role: 'log', 'aria-label': 'live log' },
        ...entries.map((e, i) => h('div', { key: e.key || i }, LiveLogEntry(e))));
}
