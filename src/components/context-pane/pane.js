
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Panel, Row } from '../content.js';
import { Btn } from '../shell.js';
import { fmtDuration } from '../sessions.js';

const h = webjsx.createElement;

function fmtTok(n) {
    if (n == null) return null;
    if (n < 1000) return String(n);
    if (n < 1000000) return (n / 1000).toFixed(n < 10000 ? 1 : 0) + 'k';
    return (n / 1000000).toFixed(1) + 'M';
}

export function ContextPane({ agent, model, cwd, toolCount = 0, usage, session, recentFiles, onSetCwd, onOpenFile } = {}) {
    const running = Number(toolCount) > 0;
    const hasUsage = usage && (usage.inputTokens != null || usage.outputTokens != null || usage.costUsd != null);
    const hasSession = session && (session.turns != null || session.cost != null);
    if (!agent && !hasUsage && !hasSession && !cwd) {
        return h('div', { class: 'ds-context' },
            h('div', { class: 'ds-context-empty', role: 'status' },
                'No active conversation — start a chat to see context here'),
            onSetCwd ? h('div', { class: 'ds-context-actions' }, Btn({ onClick: onSetCwd, children: 'set working dir' })) : null);
    }
    const panels = [
        Panel({
            title: 'context',
            children: [
                Row({ title: 'agent', meta: agent || 'none' }),
                Row({ title: 'model', meta: model || '—' }),
                h('div', { class: 'ds-context-cwd-row' }, Row({
                    title: 'working dir',
                    sub: cwd || 'server default',
                    rail: cwd ? 'green' : null,
                    onClick: onSetCwd || undefined,
                    meta: onSetCwd ? 'change' : undefined,
                })),
                Row({
                    title: 'running tools',
                    meta: running ? String(toolCount) : 'idle',
                    rail: running ? 'purple' : null,
                }),
            ],
        }),
    ];
    if (hasSession && (Number(session.turns) > 0 || Number(session.cost) > 0)) {
        const sesRows = [];
        if (session.turns != null) sesRows.push(Row({ title: 'turns', meta: String(session.turns) }));
        if (session.cost != null) sesRows.push(Row({ title: 'total cost', meta: '$' + Number(session.cost).toFixed(4) }));
        panels.push(h('div', { class: 'ds-context-group' },
            h('div', { class: 'ds-context-group-label' }, 'conversation'),
            ...sesRows));
    }
    if (hasUsage) {
        const tokRows = [];
        if (usage.inputTokens != null) tokRows.push(Row({ title: 'input', meta: fmtTok(usage.inputTokens) + ' tok' }));
        if (usage.outputTokens != null) tokRows.push(Row({ title: 'output', meta: fmtTok(usage.outputTokens) + ' tok' }));
        if (usage.costUsd != null) tokRows.push(Row({ title: 'cost', meta: '$' + usage.costUsd.toFixed(4) }));
        if (usage.turns != null) tokRows.push(Row({ title: 'turns', meta: String(usage.turns) }));
        if (usage.durationMs != null) tokRows.push(Row({ title: 'duration', meta: fmtDuration(usage.durationMs) }));
        panels.push(h('div', { class: 'ds-context-group' },
            h('div', { class: 'ds-context-group-label' }, 'last turn'),
            ...tokRows));
    }
    if (Array.isArray(recentFiles) && recentFiles.length) {
        const fileRows = recentFiles.slice(0, 5).map((f) => Row({
            title: f.path.split(/[/\\]/).filter(Boolean).pop() || f.path,
            sub: f.path,
            meta: f.time || undefined,
            onClick: onOpenFile ? () => onOpenFile(f.path) : undefined,
        }));
        panels.push(h('div', { class: 'ds-context-group' },
            h('div', { class: 'ds-context-group-label' }, 'recent files'),
            ...fileRows));
    }
    return h('div', { class: 'ds-context' }, ...panels);
}
