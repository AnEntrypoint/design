import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState, refreshError } from './runtime.js';
import { Table, PageHeader, TextField, Select } from '../content.js';
import { Btn, Icon } from '../shell.js';
import { ThemeToggle } from '../theme-toggle.js';
import { applyAccent, getAccent, applyDensity, getDensity, onThemeChange } from '../../theme.js';
import { FileGrid } from '../files.js';
import { BreadcrumbPath } from '../files/chrome.js';
import { FileViewer } from '../files-modals/preview-containers.js';
import { FilePreviewText, FilePreviewMedia } from '../files-modals/preview-bodies.js';
import { section, noteAlert, truncSpan, TRUNC_SUB } from './shared.js';

const h = webjsx.createElement;

export { env as auth, config as settings } from './pages-config.js';
export { sessions as sessionTree } from './pages-workspace.js';


export const terminal = makePage((ctx) => {
    Object.assign(ctx.state, { cwd: null, cmd: '', busy: false, history: [] });
    async function load() {
        try {
            const status = await api('/api/terminal/status');
            ctx.set({ loading: false, cwd: status.cwd || null, error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function run() {
        const command = (ctx.state.cmd || '').trim();
        if (!command || ctx.state.busy) return;
        ctx.set({ busy: true });
        try {
            const res = await api('/api/terminal/exec', { method: 'POST', body: { command, cwd: ctx.state.cwd } });
            ctx.state.history = [{ command, ...res }, ...ctx.state.history].slice(0, 50);
            ctx.set({ cmd: '' });
        } catch (e) {
            ctx.state.history = [{ command, stdout: '', stderr: String(e.message || e), exitCode: 1, cwd: ctx.state.cwd }, ...ctx.state.history].slice(0, 50);
            ctx.set({});
        }
        ctx.set({ busy: false });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading terminal…');
        if (s.error) return errorState(s.error, load);
        return [
            PageHeader({ title: 'terminal', lede: s.cwd || 'active project' }),
            section('run a command',
                h('div', { class: 'fd-row-actions' },
                    TextField({ label: 'command', value: s.cmd, placeholder: 'e.g. npm test', 'aria-label': 'shell command',
                        onInput: (v) => { s.cmd = v; } }),
                    Btn({ variant: 'primary', disabled: s.busy || !s.cmd.trim(), children: s.busy ? 'running…' : 'run', onClick: run }))),
            section('history',
                s.history.length ? s.history.map((h_, i) => h('div', { key: i, class: 'fd-terminal-run' },
                    h('div', { class: 'fd-terminal-cmd' },
                        h('code', {}, '$ ' + h_.command),
                        h('span', { class: h_.exitCode ? 'dim tone-error' : 'dim tone-ok' }, 'exit ' + (h_.exitCode ?? 0))),
                    h_.stdout ? h('pre', { class: 'fd-pre' }, h_.stdout) : null,
                    h_.stderr ? h('pre', { class: 'fd-pre fd-page-error' }, h_.stderr) : null,
                )) : emptyState('no commands run yet')),
        ].filter(Boolean);
    };
});


function splitPath(p) {
    const norm = String(p || '').replace(/\\/g, '/');
    const leadingSlash = norm.startsWith('/');
    const parts = norm.split('/').filter(Boolean);
    return { leadingSlash, parts };
}
function pathAt(info, count) {
    const kept = info.parts.slice(0, count);
    const body = kept.join('/');
    return info.leadingSlash ? '/' + body : body;
}

export const files = makePage((ctx) => {
    Object.assign(ctx.state, { dirPath: null, entries: [], openFile: null, fileBody: null, fileLoading: false, note: null });
    async function load(path) {
        ctx.set({ loading: true });
        try {
            const res = await api('/api/files/tree' + (path ? '?path=' + encodeURIComponent(path) : ''));
            ctx.set({ loading: false, dirPath: res.path, entries: Array.isArray(res.tree) ? res.tree : [], error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function openEntry(entry) {
        const info = splitPath(ctx.state.dirPath);
        const childPath = (ctx.state.dirPath ? ctx.state.dirPath.replace(/[\\/]+$/, '') : pathAt(info, info.parts.length)) + '/' + entry.name;
        if (entry.type === 'dir') { load(childPath); return; }
        ctx.set({ fileLoading: true, openFile: { name: entry.name, type: entry.type, size: entry.size, modified: entry.modified, path: childPath } });
        try {
            const res = await api('/api/files/read?path=' + encodeURIComponent(childPath));
            ctx.set({ fileLoading: false, fileBody: res });
        } catch (e) { ctx.set({ fileLoading: false, note: { kind: 'error', msg: String(e.message || e) }, openFile: null }); }
    }
    function goUp() {
        const info = splitPath(ctx.state.dirPath);
        if (info.parts.length <= 1) return;
        load(pathAt(info, info.parts.length - 1));
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading && !s.entries.length) return loadingState('loading files…');
        if (s.error && !s.dirPath) return errorState(s.error, () => load());
        const info = splitPath(s.dirPath);
        const segments = info.leadingSlash ? info.parts : info.parts.slice(1);
        const rootCount = info.leadingSlash ? 0 : 1;
        const rootLabel = info.leadingSlash ? '/' : (info.parts[0] || '/');
        const files_ = s.entries.map(e => ({ name: e.name, type: e.type, size: e.size, modified: e.modified }));
        const viewerBody = s.fileBody && s.fileBody.type === 'image'
            ? FilePreviewMedia({ src: s.fileBody.content, type: 'image', name: s.openFile && s.openFile.name })
            : s.fileBody && s.fileBody.type === 'text'
                ? FilePreviewText({ content: s.fileBody.content, truncated: s.fileBody.truncated })
                : s.fileBody && s.fileBody.type === 'binary'
                    ? h('div', { class: 'fd-empty' }, 'binary file: preview not available')
                    : null;
        return [
            PageHeader({ title: 'files', lede: s.dirPath || 'active project' }),
            noteAlert(s.note),
            s.error && s.dirPath ? refreshError(s.error) : null,
            BreadcrumbPath({ segments, root: rootLabel, onNav: (i) => load(pathAt(info, rootCount + i)) }),
            FileGrid({
                files: files_, loading: s.loading,
                onOpen: openEntry,
                onUp: goUp,
                emptyText: 'empty directory',
            }),
            (s.openFile || s.fileLoading) ? FileViewer({
                file: s.openFile,
                body: s.fileLoading ? loadingState('loading file…') : (viewerBody || emptyState('nothing to preview')),
                onClose: () => ctx.set({ openFile: null, fileBody: null }),
            }) : null,
        ].filter(Boolean);
    };
});


const ACCENTS = ['default', 'green', 'purple', 'mascot'];
const DENSITIES = ['compact', 'comfortable', 'spacious'];

export const themePage = makePage((ctx) => {
    const unsubscribe = onThemeChange(() => ctx.rerender());
    ctx.onCleanup(unsubscribe);
    return () => {
        const accent = getAccent() || 'default';
        const density = getDensity() || 'compact';
        return [
            PageHeader({ title: 'theme', lede: 'appearance preferences' }),
            section('theme', ThemeToggle()),
            section('accent', Select({
                label: 'accent', value: accent, options: ACCENTS,
                onChange: (v) => applyAccent(v === 'default' ? null : v),
            })),
            section('density', Select({
                label: 'density', value: density, options: DENSITIES,
                onChange: (v) => applyDensity(v),
            })),
        ];
    };
});


export const worktree = makePage((ctx) => {
    async function load() { try { ctx.set({ loading: false, data: await api('/api/worktree'), error: null }); } catch (e) { ctx.failLoad(e); } }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading worktrees…');
        if (s.error && !s.data) return errorState(s.error, load);
        const trees = (s.data && Array.isArray(s.data.worktrees)) ? s.data.worktrees : [];
        return [
            PageHeader({ title: 'worktrees', lede: (s.data && s.data.cwd) || 'git worktrees' }),
            trees.length
                ? section('worktrees', Table({ headers: ['path', 'branch', 'head'], rows: trees.map(t => [t.worktree || '-', t.branch || (t.detached ? '(detached)' : '-'), (t.head || '').slice(0, 8) || '-']) }))
                : emptyState('no worktrees'),
        ];
    };
});


export const notifications = makePage((ctx) => {
    Object.assign(ctx.state, { busy: null });
    async function load() {
        try { ctx.set({ loading: false, data: await api('/api/notifications'), error: null }); }
        catch (e) { ctx.failLoad(e); }
    }
    async function dismiss(id) {
        ctx.set({ busy: id });
        try { await api('/api/notifications/' + encodeURIComponent(id) + '/dismiss', { method: 'POST' }); await load(); }
        catch (e) { ctx.failError(e); }
        ctx.set({ busy: null });
    }
    async function dismissAll() {
        ctx.set({ busy: 'all' });
        try { await api('/api/notifications/dismiss-all', { method: 'POST' }); await load(); }
        catch (e) { ctx.failError(e); }
        ctx.set({ busy: null });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading notifications…');
        if (s.error && !s.data) return errorState(s.error, load);
        const items = Array.isArray(s.data) ? s.data : [];
        return [
            PageHeader({
                title: 'notifications', lede: items.length + ' notifications',
                right: items.length ? Btn({ disabled: s.busy === 'all', children: s.busy === 'all' ? 'dismissing…' : 'dismiss all', onClick: dismissAll }) : null,
            }),
            items.length
                ? section('notifications', ...items.map((n, i) => h('div', { key: i, class: 'fd-row-actions' },
                    h('span', {}, '[' + (n.type || '-') + '] '),
                    truncSpan(n.message || '', TRUNC_SUB),
                    h('span', { class: 'dim' }, n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : '-'),
                    Btn({ size: 'sm', disabled: s.busy === n.id, children: s.busy === n.id ? '…' : Icon('x'), 'aria-label': 'dismiss', onClick: () => dismiss(n.id) }))))
                : emptyState('no notifications'),
        ].filter(Boolean);
    };
});
