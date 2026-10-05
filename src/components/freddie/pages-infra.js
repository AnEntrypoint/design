import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState, refreshError } from './runtime.js';
import { Row, Table, PageHeader, TextField } from '../content.js';
import { Chip, Btn } from '../shell.js';
import { ConfirmDialog } from '../files-modals.js';
import { renderMermaid } from '../../mermaid.js';
import { section, noteAlert, truncJson } from './shared.js';

const h = webjsx.createElement;

export const gateway = makePage((ctx) => {
    async function load() { try { ctx.set({ loading: false, data: await api('/api/gateway'), error: null }); } catch (e) { ctx.failLoad(e); } }
    load(); ctx.interval(load, 10000);
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading gateway…');
        if (s.error && !s.data) return errorState(s.error, load);
        const d = s.data || {};
        const platforms = Array.isArray(d.platforms) ? d.platforms : [];
        const rows = platforms.map(p => [p.name, p.note || (p.enabled ? Chip({ tone: 'ok', children: 'up' }) : Chip({ tone: 'neutral', children: 'not running here' }))]);
        return [
            PageHeader({ title: 'gateway', lede: 'messaging platform status' }),
            s.error && s.data ? refreshError(s.error) : null,
            section('platforms', rows.length ? Table({ headers: ['platform', 'status'], rows }) : emptyState('no platforms configured')),
        ].filter(Boolean);
    };
});

export const chains = makePage((ctx) => {
    Object.assign(ctx.state, { name: '', links: '', busy: false, note: null, confirmDelete: null });
    async function load() {
        try {
            const results = await Promise.allSettled([
                api('/api/acptoapi/health'),
                api('/api/acptoapi/chains'),
                api('/api/acptoapi/config'),
            ]);
            const [health, list, cfg] = results.map(r => r.status === 'fulfilled' ? r.value : null);
            const allFailed = results.every(r => r.status === 'rejected');
            ctx.set({ loading: false, health, list, cfg, error: allFailed ? (results[0].reason || new Error('acptoapi unreachable')) : null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function create() {
        const name = (ctx.state.name || '').trim();
        const links = (ctx.state.links || '').split(',').map(x => x.trim()).filter(Boolean);
        if (!name || !links.length) { ctx.set({ note: { kind: 'warn', msg: 'name and comma-separated links required' } }); return; }
        ctx.set({ busy: true, note: null });
        try { await api('/api/acptoapi/chains', { method: 'POST', body: { name, links } }); ctx.state.name = ''; ctx.state.links = ''; await load(); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false });
    }
    async function del(name) {
        ctx.set({ busy: true });
        try { await api('/api/acptoapi/chains/' + encodeURIComponent(name), { method: 'DELETE' }); await load(); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false, confirmDelete: null });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading chains…');
        if (s.error && !s.cfg && !s.health) return errorState(s.error, load);
        const chainsMap = (s.list && s.list.chains && typeof s.list.chains === 'object' && !Array.isArray(s.list.chains)) ? s.list.chains : {};
        const chainsList = Object.entries(chainsMap).map(([name, links]) => ({ name, links: Array.isArray(links) ? links : [] }));
        const up = s.health && (s.health.ok || s.health.status === 'ok' || s.health.healthy);
        return [
            PageHeader({ title: 'chains', lede: 'acptoapi fallback chains', right: up ? Chip({ tone: 'ok', children: 'acptoapi up' }) : Chip({ tone: 'miss', children: 'acptoapi down' }) }),
            noteAlert(s.note),
            section('chains', chainsList.length ? chainsList.map((c, i) => Row({
                key: i, title: c.name, sub: c.links.join(' -> '),
                trailing: Btn({ variant: 'danger', children: 'delete', onClick: () => ctx.set({ confirmDelete: c }) }),
            })) : emptyState('no chains defined')),
            section('new chain',
                TextField({ label: 'name', value: s.name, onInput: (v) => { s.name = v; } }),
                TextField({ label: 'links (comma-separated models)', value: s.links, onInput: (v) => { s.links = v; }, placeholder: 'mistral/large, openrouter/auto' }),
                Btn({ variant: 'primary', disabled: s.busy, children: s.busy ? 'working…' : 'create chain', onClick: create })),
            s.cfg ? section('config', h('pre', { class: 'fd-pre' }, JSON.stringify(s.cfg, null, 2))) : null,
            s.confirmDelete ? ConfirmDialog({
                title: 'Delete chain?',
                message: 'This permanently removes "' + s.confirmDelete.name + '" (' + s.confirmDelete.links.join(' -> ') + '). This cannot be undone.',
                destructive: true, confirmLabel: 'delete', busy: s.busy, busyLabel: 'deleting…',
                onConfirm: () => del(s.confirmDelete.name),
                onCancel: () => ctx.set({ confirmDelete: null }),
            }) : null,
        ].filter(Boolean);
    };
});

export const machines = makePage((ctx) => {
    Object.assign(ctx.state, { diagrams: null, diagramSvgs: {}, showDiagrams: false });
    let unmounted = false;
    ctx.onCleanup(() => { unmounted = true; });
    async function load() { try { ctx.set({ loading: false, data: await api('/api/machines'), error: null }); } catch (e) { ctx.failLoad(e); } }
    load(); ctx.interval(load, 8000);
    async function loadDiagrams() {
        if (ctx.state.diagrams) return;
        try {
            const r = await api('/api/machines/diagrams');
            if (unmounted) return;
            ctx.set({ diagrams: r.diagrams || {} });
            for (const [kind, d] of Object.entries(r.diagrams || {})) {
                if (!d || !d.mermaid) continue;
                const svg = await renderMermaid(d.mermaid);
                if (unmounted) return;
                if (svg) ctx.set({ diagramSvgs: { ...ctx.state.diagramSvgs, [kind]: svg } });
            }
        } catch (e) { if (!unmounted) ctx.set({ diagramsError: e }); }
    }
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading machines…');
        if (s.error && !s.data) return errorState(s.error, load);
        const d = s.data || {};
        const list = Array.isArray(d) ? d : (d.machines || Object.entries(d).map(([kind, v]) => ({ kind, ...(typeof v === 'object' ? v : { value: v }) })));
        return [
            PageHeader({ title: 'machines', lede: 'persisted xstate machine census' }),
            s.error && s.data ? refreshError(s.error) : null,
            section('machines', list.length ? Table({
                headers: ['kind', 'key', 'state'],
                rows: list.map(m => [m.kind || '—', m.key || m.machine_id || '—', m.state || m.value || truncJson(m)]),
            }) : emptyState('no live machines')),
            section('diagrams',
                !s.showDiagrams
                    ? Btn({ onClick: () => { ctx.set({ showDiagrams: true }); loadDiagrams(); }, children: 'show machine diagrams' })
                    : [
                        s.diagramsError ? refreshError(s.diagramsError) : null,
                        !s.diagrams
                            ? loadingState('loading diagrams…')
                            : Object.entries(s.diagrams).map(([kind, dgm]) => h('div', { key: kind, class: 'fd-page' },
                                h('div', { class: 'ds-skills-group-label' }, kind + ' (initial: ' + ((dgm && dgm.initial) || '—') + ')'),
                                dgm && dgm.error
                                    ? h('div', { class: 'dim' }, dgm.error)
                                    : s.diagramSvgs[kind]
                                        ? h('div', { dangerouslySetInnerHTML: { __html: s.diagramSvgs[kind] } })
                                        : h('pre', { class: 'fd-pre' }, (dgm && dgm.mermaid) || ''))),
                    ].filter(Boolean)),
        ].filter(Boolean);
    };
});

export const health = makePage((ctx) => {
    async function load() {
        try {
            const results = await Promise.allSettled([api('/api/health'), api('/api/providers')]);
            const [health, providers] = results.map(r => r.status === 'fulfilled' ? r.value : null);
            const allFailed = results.every(r => r.status === 'rejected');
            ctx.set({ loading: false, health, providers, error: allFailed ? (results[0].reason || new Error('health checks unreachable')) : null });
        } catch (e) { ctx.failLoad(e); }
    }
    load(); ctx.interval(load, 15000);
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading health…');
        if (s.error && !s.health && !s.providers) return errorState(s.error, load);
        const hd = s.health || {};
        const provs = Array.isArray(s.providers) ? s.providers : (s.providers?.providers || []);
        return [
            PageHeader({ title: 'health', lede: 'system & provider health', right: hd.ok ? Chip({ tone: 'ok', children: 'healthy' }) : Chip({ tone: 'miss', children: 'degraded' }) }),
            s.error && (s.health || s.providers) ? refreshError(s.error) : null,
            section('checks', Object.keys(hd).length ? Table({ headers: ['check', 'status'], rows: Object.entries(hd).map(([k, v]) => [k, typeof v === 'object' ? truncJson(v) : (v === true ? Chip({ tone: 'ok', children: 'ok' }) : v === false ? Chip({ tone: 'miss', children: 'no' }) : String(v))]) }) : emptyState('no health data')),
            provs.length ? section('providers', Table({ headers: ['provider', 'status'], rows: provs.map(p => { const n = typeof p === 'string' ? p : p.name || p.id; const ok = typeof p === 'object' ? (p.ok ?? p.available) : null; return [n, ok == null ? '—' : (ok ? Chip({ tone: 'ok', children: 'up' }) : Chip({ tone: 'miss', children: 'down' }))]; }) })) : null,
        ].filter(Boolean);
    };
});
