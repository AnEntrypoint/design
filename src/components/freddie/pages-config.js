import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState } from './runtime.js';
import { Row, Table, PageHeader, TextField, Select } from '../content.js';
import { Chip, Btn } from '../shell.js';
import { ConfirmDialog } from '../files-modals.js';
import { section, noteAlert, liveRegion } from './shared.js';

const h = webjsx.createElement;

function flattenConfig(obj, prefix = '') {
    const out = [];
    for (const [k, v] of Object.entries(obj || {})) {
        const path = prefix ? prefix + '.' + k : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenConfig(v, path));
        else out.push([path, v]);
    }
    return out;
}

function coerceLike(original, raw) {
    if (typeof original === 'number') { const n = Number(raw); return Number.isNaN(n) ? original : n; }
    if (typeof original === 'boolean') return raw === 'true' || raw === true;
    return raw;
}

export const config = makePage((ctx) => {
    Object.assign(ctx.state, { edited: {}, busy: false, note: null });
    async function load() {
        try {
            const [cfg, skins] = await Promise.all([api('/api/config'), api('/api/skins').catch(() => null)]);
            ctx.set({ loading: false, cfg, skins, error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function saveOne(key, value) {
        return api('/api/config', { method: 'POST', body: { key, value } });
    }
    async function save() {
        const entries = Object.entries(ctx.state.edited);
        if (!entries.length) return;
        ctx.set({ busy: true, note: null });
        try {
            for (const [key, value] of entries) await saveOne(key, value);
            ctx.state.edited = {};
            await load();
            ctx.set({ note: { kind: 'success', msg: 'saved' } });
        } catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false });
    }
    async function setSkin(name) {
        ctx.set({ busy: true, note: null });
        try { await saveOne('display.skin', name); await load(); ctx.set({ note: { kind: 'success', msg: 'skin -> ' + name } }); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: false });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading config…');
        if (s.error) return errorState(s.error, load);
        const cfg = s.cfg || {};
        const flat = flattenConfig(cfg).filter(([k, v]) => k !== '_config_version' && k !== 'display.skin' && (v === null || typeof v !== 'object'));
        const arrayKeys = flattenConfig(cfg).filter(([, v]) => Array.isArray(v)).map(([k]) => k);
        const skinList = Array.isArray(s.skins) ? s.skins : [];
        const activeSkin = (cfg.display && cfg.display.skin) || 'default';
        return [
            PageHeader({ title: 'config', lede: 'runtime configuration' }),
            noteAlert(s.note),
            liveRegion(s.busy ? 'saving configuration' : ''),
            arrayKeys.length ? h('div', { class: 'ds-alert ds-alert-info', role: 'note' },
                h('span', { class: 'ds-alert-icon' }, 'i'),
                h('div', { class: 'ds-alert-content' }, arrayKeys.length + ' array-valued config ' + (arrayKeys.length === 1 ? 'key is' : 'keys are') + ' read-only here (' + arrayKeys.join(', ') + ') — edit via the config file or raw view below.')) : null,
            skinList.length ? section('skin',
                Select({ label: 'active skin', value: activeSkin, options: skinList, onChange: (v) => setSkin(v) })
            ) : null,
            section('settings', flat.length ? flat.map(([k, v], i) =>
                TextField({ key: i, label: k, value: String(ctx.state.edited[k] ?? v ?? ''), onInput: (val) => { ctx.state.edited[k] = coerceLike(v, val); ctx.rerender(); } })
            ) : emptyState('no scalar config keys')),
            section('raw', h('pre', { class: 'fd-pre' }, JSON.stringify(cfg, null, 2))),
            section('actions',
                Btn({ variant: 'primary', disabled: s.busy || !Object.keys(s.edited).length, children: s.busy ? 'saving…' : 'save changes', onClick: save })),
        ].filter(Boolean);
    };
});

export const env = makePage((ctx) => {
    Object.assign(ctx.state, { auth: null, vars: null, draft: {}, busy: '', note: null, confirmRemove: null });
    async function load() {
        try {
            const results = await Promise.allSettled([api('/api/auth'), api('/api/env')]);
            const [auth, vars] = results.map(r => r.status === 'fulfilled' ? r.value : null);
            const allFailed = results.every(r => r.status === 'rejected');
            ctx.set({ loading: false, auth, vars, error: allFailed ? (results[0].reason || new Error('key/env endpoints unreachable')) : null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function setKey(provider) {
        const key = (ctx.state.draft[provider] || '').trim();
        if (!key) { ctx.set({ note: { kind: 'warn', msg: 'key required for ' + provider } }); return; }
        ctx.set({ busy: provider, note: null });
        try { await api('/api/auth', { method: 'POST', body: { provider, key } }); ctx.state.draft[provider] = ''; await load(); ctx.set({ note: { kind: 'success', msg: 'stored ' + provider } }); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: '' });
    }
    async function removeKey(provider) {
        ctx.set({ busy: provider, note: null });
        try { await api('/api/auth/' + encodeURIComponent(provider), { method: 'DELETE' }); await load(); ctx.set({ note: { kind: 'success', msg: 'removed ' + provider } }); }
        catch (e) { ctx.failNote(e); }
        ctx.set({ busy: '', confirmRemove: null });
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading keys…');
        if (s.error && !s.auth) return errorState(s.error, load);
        const auth = Array.isArray(s.auth) ? s.auth : [];
        const vars = Array.isArray(s.vars) ? s.vars : [];
        const providerEnvs = new Set(auth.map(a => a.env));
        const otherRows = vars.filter(v => !providerEnvs.has(v.key)).map(v => [v.key, v.set ? Chip({ tone: 'ok', children: v.source || 'set' }) : Chip({ tone: 'neutral', children: 'unset' })]);
        return [
            PageHeader({ title: 'keys', lede: 'provider api keys · stored locally, never displayed' }),
            noteAlert(s.note),
            section('provider keys',
                auth.length ? auth.map((a, i) => Row({
                    key: i, title: a.provider, sub: a.env + (a.set ? '  ·  ' + a.source + (a.fingerprint ? '  ·  ' + a.fingerprint : '') : ''),
                    trailing: h('span', { class: 'fd-row-actions' },
                        a.set ? Chip({ tone: 'ok', children: 'set' }) : Chip({ tone: 'neutral', children: 'unset' }),
                        TextField({ type: 'password', value: s.draft[a.provider] || '', onInput: (v) => { s.draft[a.provider] = v; }, placeholder: 'paste key', 'aria-label': 'key for ' + a.provider }),
                        Btn({ variant: 'primary', disabled: s.busy === a.provider, children: s.busy === a.provider ? '…' : 'save', onClick: () => setKey(a.provider) }),
                        (a.set && a.source === 'stored') ? Btn({ variant: 'danger', disabled: s.busy === a.provider, children: 'remove', onClick: () => ctx.set({ confirmRemove: a }) }) : null),
                })) : emptyState('no providers')),
            otherRows.length ? section('other environment', Table({ headers: ['key', 'status'], rows: otherRows })) : null,
            s.confirmRemove ? ConfirmDialog({
                title: 'Remove key?',
                message: 'This removes the stored ' + s.confirmRemove.provider + ' key (' + s.confirmRemove.env + '). The raw value is never retrievable once removed -- you would need to paste it in again from wherever you originally got it.',
                destructive: true, confirmLabel: 'remove', busy: s.busy === s.confirmRemove.provider, busyLabel: 'removing…',
                onConfirm: () => removeKey(s.confirmRemove.provider),
                onCancel: () => ctx.set({ confirmRemove: null }),
            }) : null,
        ].filter(Boolean);
    };
});
