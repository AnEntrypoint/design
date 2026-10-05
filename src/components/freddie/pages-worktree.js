import { makePage, api, loadingState, errorState, emptyState } from './runtime.js';
import { Table, PageHeader } from '../content.js';
import { section } from './shared.js';

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
