import * as webjsx from '../../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState } from '../runtime.js';
import { Row, PageHeader, TextField } from '../../content.js';
import { Chip, Btn } from '../../shell.js';
import { ConfirmDialog } from '../../files-modals.js';
import { section, noteAlert } from '../shared.js';

const h = webjsx.createElement;

export const projects = makePage((ctx) => {
    Object.assign(ctx.state, { newName: '', newPath: '', busy: false, note: null, confirmDelete: null });
    async function load() {
        try { ctx.set({ loading: false, data: await api('/api/projects'), error: null }); }
        catch (e) { ctx.failLoad(e); }
    }
    async function create() {
        const name = (ctx.state.newName || '').trim();
        const path = (ctx.state.newPath || '').trim();
        if (!name) { ctx.set({ note: { kind: 'warn', msg: 'name required' } }); return; }
        if (!path) { ctx.set({ note: { kind: 'warn', msg: 'path required (must be an absolute path)' } }); return; }
        ctx.set({ busy: true, note: null });
        try { await api('/api/projects', { method: 'POST', body: { name, path } }); ctx.state.newName = ''; ctx.state.newPath = ''; await load(); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false });
    }
    async function activate(name) { ctx.set({ busy: true }); try { await api('/api/projects/active', { method: 'POST', body: { name } }); await load(); } catch (e) { ctx.failNote(e); } ctx.set({ busy: false }); }
    async function del(name) {
        ctx.set({ busy: true });
        try { await api('/api/projects/' + encodeURIComponent(name), { method: 'DELETE' }); await load(); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false, confirmDelete: null });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading projects…');
        if (s.error && !s.data) return errorState(s.error, load);
        const d = s.data || {}; const list = d.projects || [];
        const activeName = (d.active && d.active.name) || d.active || 'default';
        return [
            PageHeader({ title: 'projects', lede: 'isolated workspaces · active: ' + activeName }),
            noteAlert(s.note),
            section('projects',
                list.length ? list.map((p, i) => Row({
                    key: i, code: h('span', { class: 'ds-dot ' + (p.name === activeName ? 'ds-dot-on' : 'ds-dot-off'), 'aria-hidden': 'true' }), title: p.name, sub: p.path || '',
                    active: p.name === activeName,
                    trailing: h('span', { class: 'fd-row-actions' },
                        p.name !== activeName ? Btn({ children: 'activate', onClick: () => activate(p.name) }) : Chip({ tone: 'ok', children: 'active' }),
                        p.name !== 'default' ? Btn({ variant: 'danger', children: 'delete', onClick: () => ctx.set({ confirmDelete: p }) }) : null),
                })) : emptyState('no projects')),
            section('new project',
                TextField({ label: 'name', value: s.newName, onInput: (v) => { s.newName = v; }, placeholder: 'my-project' }),
                TextField({ label: 'path (absolute)', value: s.newPath, onInput: (v) => { s.newPath = v; }, placeholder: 'C:/path/to/dir' }),
                Btn({ variant: 'primary', disabled: s.busy, children: s.busy ? 'working…' : 'create', onClick: create })),
            s.confirmDelete ? ConfirmDialog({
                title: 'Remove project?',
                message: 'This removes "' + s.confirmDelete.name + '" from the project list (does not delete its files on disk at ' + (s.confirmDelete.path || '?') + ').',
                destructive: true, confirmLabel: 'remove', busy: s.busy, busyLabel: 'removing…',
                onConfirm: () => del(s.confirmDelete.name),
                onCancel: () => ctx.set({ confirmDelete: null }),
            }) : null,
        ].filter(Boolean);
    };
});
