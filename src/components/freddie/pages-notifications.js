import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState } from './runtime.js';
import { PageHeader } from '../content.js';
import { Btn, Icon } from '../shell.js';
import { section, truncSpan, TRUNC_SUB } from './shared.js';

const h = webjsx.createElement;

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
