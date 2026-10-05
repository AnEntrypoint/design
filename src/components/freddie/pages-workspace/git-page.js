import * as webjsx from '../../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState, refreshError } from '../runtime.js';
import { Table, PageHeader, TextField } from '../../content.js';
import { Btn } from '../../shell.js';
import { fmtAgo } from '../../sessions.js';
import { GitStatusPanel, GitDiffView } from '../../git-status.js';
import { WorktreeSwitcher } from '../../worktree-switcher.js';
import { section, noteAlert, truncSpan, TRUNC_SUB } from '../shared.js';

const h = webjsx.createElement;

export const git = makePage((ctx) => {
    Object.assign(ctx.state, { cwd: null, status: null, log: null, worktrees: null, diff: null, activeFile: null, diffLoading: false, note: null });
    async function load(explicitCwd) {
        try {
            const proj = await api('/api/projects').catch(() => null);
            const active = proj && proj.active;
            const list = (proj && proj.projects) || [];
            if (explicitCwd) {
                const qs = '?cwd=' + encodeURIComponent(explicitCwd);
                const [status, log, worktrees] = await Promise.all([
                    api('/api/git/status' + qs).catch((e) => ({ _err: e })),
                    api('/api/git/log' + qs + '&limit=20').catch((e) => ({ _err: e })),
                    api('/api/worktree' + qs).catch((e) => ({ _err: e })),
                ]);
                ctx.set({ loading: false, cwd: explicitCwd, status, log, worktrees, error: null });
                return;
            }
            const preferred = ctx.state.cwd || (active && typeof active === 'object' ? active.path : null) || '';
            const seen = new Set();
            const candidates = [];
            for (const c of [preferred, ...list.map(p => p.path)]) {
                if (c && !seen.has(c)) { seen.add(c); candidates.push(c); }
            }
            let cwd = preferred, status = { _err: new Error('no git cwd') }, log = status, worktrees = status;
            for (const c of candidates) {
                const qs = '?cwd=' + encodeURIComponent(c);
                const st = await api('/api/git/status' + qs).catch((e) => ({ _err: e }));
                if (!st || st._err) continue;
                cwd = c;
                status = st;
                log = await api('/api/git/log' + qs + '&limit=20').catch((e) => ({ _err: e }));
                worktrees = await api('/api/worktree' + qs).catch((e) => ({ _err: e }));
                break;
            }
            ctx.set({ loading: false, cwd, status, log, worktrees, error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function openDiff(file) {
        ctx.set({ activeFile: file.path, diffLoading: true, diff: null });
        try {
            const qs = '?cwd=' + encodeURIComponent(ctx.state.cwd || '') + '&file=' + encodeURIComponent(file.path);
            const res = await api('/api/git/diff' + qs);
            ctx.set({ diff: res, diffLoading: false });
        } catch (e) { ctx.failNote(e, { diffLoading: false }); }
    }
    async function createWorktree() {
        const path = (ctx.state.newWtPath || '').trim();
        const branch = (ctx.state.newWtBranch || '').trim();
        if (!path) { ctx.set({ note: { kind: 'warn', msg: 'path required' } }); return; }
        ctx.set({ busy: true, note: null });
        try {
            await api('/api/worktree', { method: 'POST', body: { cwd: ctx.state.cwd || '', path, branch: branch || undefined } });
            ctx.state.newWtPath = ''; ctx.state.newWtBranch = '';
            await load();
        } catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading git status…');
        if (s.error && !s.status) return errorState(s.error, load);
        const statusFailed = s.status && s.status._err;
        const logFailed = s.log && s.log._err;
        const wtFailed = s.worktrees && s.worktrees._err;
        const files = statusFailed ? [] : (() => {
            const st = s.status || {};
            const byPath = new Map();
            for (const f of st.staged || []) byPath.set(f.file, { path: f.file, status: f.status, staged: true });
            for (const f of st.unstaged || []) if (!byPath.has(f.file)) byPath.set(f.file, { path: f.file, status: f.status, staged: false });
            for (const p of st.untracked || []) if (!byPath.has(p)) byPath.set(p, { path: p, status: '?', staged: false });
            return [...byPath.values()];
        })();
        const commits = logFailed ? [] : (s.log && s.log.commits) || s.log || [];
        const rawWorktrees = wtFailed ? [] : (s.worktrees && s.worktrees.worktrees) || s.worktrees || [];
        const worktrees = (Array.isArray(rawWorktrees) ? rawWorktrees : []).map(w => ({ path: w.worktree, branch: w.branch, detached: w.detached }));
        const current = (worktrees.find(w => w.path === s.cwd) || {}).path;
        return [
            PageHeader({ title: 'git', lede: s.cwd || 'active project' }),
            noteAlert(s.note),
            statusFailed ? refreshError(statusFailed) : null,
            section('worktrees',
                WorktreeSwitcher({
                    worktrees: Array.isArray(worktrees) ? worktrees : [],
                    current,
                    onSwitch: (wt) => { if (wt && wt.path) { ctx.set({ activeFile: null, diff: null }); load(wt.path); } },
                    onCreate: () => ctx.set({ showWtForm: !s.showWtForm }),
                }),
                s.showWtForm ? h('div', { class: 'fd-row-actions' },
                    TextField({ label: 'path', value: s.newWtPath, onInput: (v) => { s.newWtPath = v; }, placeholder: '/path/to/worktree' }),
                    TextField({ label: 'branch (optional)', value: s.newWtBranch, onInput: (v) => { s.newWtBranch = v; }, placeholder: 'feature/x' }),
                    Btn({ variant: 'primary', disabled: s.busy, children: s.busy ? 'working…' : 'create', onClick: createWorktree })) : null),
            section('changed files',
                statusFailed ? errorState(statusFailed) : GitStatusPanel({ files, onFileClick: openDiff, active: s.activeFile })),
            section('diff' + (s.activeFile ? ' · ' + s.activeFile : ''),
                s.diffLoading ? loadingState('loading diff…')
                    : s.diff ? GitDiffView({ diff: s.diff.diff || s.diff, filename: s.activeFile })
                        : emptyState('select a file to view its diff')),
            section('log',
                logFailed ? errorState(logFailed)
                    : commits.length
                        ? Table({ headers: ['sha', 'message', 'author', 'date'], rows: commits.slice(0, 20).map(c => [String(c.sha || c.hash || '').slice(0, 8), truncSpan(c.message || c.subject, TRUNC_SUB), c.author || '', c.date ? fmtAgo(c.date) : ''])})
                        : emptyState('no commits')),
        ].filter(Boolean);
    };
});
