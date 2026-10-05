import { makePage, api, loadingState, errorState, emptyState, refreshError } from '../runtime.js';
import { Table, PageHeader, SearchInput } from '../../content.js';
import { ChatMessage } from '../../chat.js';
import { fmtTime, fmtAgo } from '../../sessions.js';
import { section, refreshBtn, truncSpan, TRUNC_TITLE } from '../shared.js';

export const sessions = makePage((ctx) => {
    Object.assign(ctx.state, { q: '', selected: null, messages: [], msgLoading: false });
    async function load() {
        try { ctx.set({ loading: false, list: await api('/api/sessions'), error: null }); }
        catch (e) { ctx.failLoad(e); }
    }
    async function search(q) {
        if (!q) return load();
        try {
            const hits = await api('/api/search?q=' + encodeURIComponent(q));
            const list = (Array.isArray(hits) ? hits : []).map(x => ({ id: x.session_id, title: x.content, platform: null, updated_at: null }));
            ctx.set({ loading: false, list, error: null });
        } catch (e) { ctx.failLoad(e); }
    }
    async function refresh() { ctx.set({ refreshing: true }); try { ctx.set({ list: await api('/api/sessions'), error: null }); } catch (e) { ctx.failError(e); } ctx.set({ refreshing: false }); }
    async function open(id) {
        ctx.set({ selected: id, msgLoading: true });
        try { ctx.set({ messages: await api('/api/sessions/' + encodeURIComponent(id) + '/messages'), msgLoading: false }); }
        catch (e) { ctx.set({ messages: [], msgLoading: false, error: e }); }
    }
    load();
    return () => {
        const s = ctx.state;
        if (s.loading) return loadingState('loading sessions…');
        if (s.error && !s.list) return errorState(s.error, load);
        const list = Array.isArray(s.list) ? s.list : [];
        return [
            PageHeader({ title: 'sessions', lede: list.length + ' sessions', right: refreshBtn(refresh, s.refreshing) }),
            s.error && s.list ? refreshError(s.error) : null,
            SearchInput({ value: s.q, label: 'search sessions', placeholder: 'search messages…', onInput: (v) => { s.q = v; }, onSubmit: (v) => search(v) }),
            section('sessions',
                list.length
                    ? Table({ headers: ['session', 'platform', 'updated'], onRowClick: (i) => open(list[i].id),
                        rowLabels: list.map(x => x.title || x.id),
                        rows: list.map(x => [truncSpan(x.title || x.id, TRUNC_TITLE), x.platform || '-', fmtAgo(x.updated_at)]) })
                    : emptyState('no sessions match')),
            s.selected ? section('messages · ' + s.selected,
                s.msgLoading ? loadingState('loading messages…')
                    : (s.messages || []).length ? (s.messages).map((m, i) => ChatMessage({ role: m.role, text: m.content || m.text || '', time: m.ts ? fmtTime(m.ts) : '', key: i }))
                        : emptyState('no messages')) : null,
        ].filter(Boolean);
    };
});
