import { makePage, api } from './runtime.js';
import { PageHeader } from '../content.js';
import { ModelsConfig } from '../models-config.js';
import { SkillsConfig } from '../skills-config.js';
import { PluginsConfig } from '../plugins-config.js';

export const models = makePage((ctx) => {
    Object.assign(ctx.state, { rebuilding: false, selectedProviderId: null, selectedModel: null });
    let unmounted = false;
    ctx.onCleanup(() => { unmounted = true; });
    async function load() {
        try { ctx.set({ loading: false, data: await api('/api/models/availability'), error: null }); }
        catch (e) { ctx.set({ loading: false, data: null, error: (e && e.body) || e }); }
    }
    async function rebuild() {
        if (ctx.state.rebuilding) return;
        const startedAt = ctx.state.data?.timestamp || null;
        ctx.set({ rebuilding: true, rebuildError: null });
        try {
            await api('/api/models/availability/rebuild', { method: 'POST', body: {} });
            const POLL_MS = 3000, MAX_POLLS = 60;
            let landed = false;
            for (let i = 0; i < MAX_POLLS; i++) {
                await new Promise(r => setTimeout(r, POLL_MS));
                if (unmounted) return;
                let fresh;
                try { fresh = await api('/api/models/availability'); } catch { continue; }
                if (fresh && fresh.timestamp && fresh.timestamp !== startedAt) { ctx.set({ data: fresh, error: null }); landed = true; break; }
            }
            if (!landed) ctx.set({ rebuildError: new Error('still running after 3 min of polling: the rebuild continues in the background; refresh this page in a bit to check for a newer result') });
        } catch (e) { ctx.set({ rebuildError: e }); }
        if (!unmounted) ctx.set({ rebuilding: false });
    }
    load();
    return () => {
        const s = ctx.state;
        return [
            PageHeader({ title: 'models', lede: s.data ? (s.data.summary?.total_models ?? 0) + ' models across ' + (s.data.summary?.total_providers ?? 0) + ' providers' : 'model availability matrix' }),
            ModelsConfig({
                data: s.data, loading: s.loading, error: s.error,
                selectedProviderId: s.selectedProviderId, onSelectProvider: (id) => ctx.set({ selectedProviderId: id, selectedModel: null }),
                selectedModel: s.selectedModel, onSelectModel: (m) => ctx.set({ selectedModel: m }),
                onRefresh: load, onRebuild: rebuild, rebuilding: s.rebuilding, rebuildError: s.rebuildError,
            }),
        ];
    };
});

export const skills = makePage((ctx) => {
    Object.assign(ctx.state, { selected: null, query: '', busyName: null });
    async function load() { try { ctx.set({ loading: false, list: await api('/api/skills'), error: null }); } catch (e) { ctx.failLoad(e); } }
    async function toggle(skill) {
        ctx.set({ busyName: skill.name });
        try { await api('/api/skills/' + encodeURIComponent(skill.name), { method: 'POST', body: { enabled: skill.enabled === false } }); await load(); }
        catch (e) { ctx.failError(e); }
        ctx.set({ busyName: null });
    }
    load();
    return () => {
        const s = ctx.state;
        const raw = s.list && typeof s.list === 'object' ? s.list : {};
        const rawList = Array.isArray(raw) ? raw : [...(raw.bundled || []), ...(raw.home || [])];
        const skillState = raw.skillState || {};
        const mapped = rawList.map((sk) => ({
            file: sk.file || sk.path || sk.name,
            name: sk.name,
            description: sk.description || (sk.frontmatter && sk.frontmatter.description) || '',
            platforms: sk.platforms || (sk.frontmatter && sk.frontmatter.platforms),
            enabled: (skillState[sk.name] && skillState[sk.name].enabled) !== false,
        }));
        return [
            PageHeader({ title: 'skills', lede: mapped.length + ' skills' }),
            SkillsConfig({
                skills: mapped, selected: s.selected, loading: s.loading, error: s.error,
                busyName: s.busyName, query: s.query, onQuery: (q) => ctx.set({ query: q }),
                onSelect: (name) => ctx.set({ selected: s.selected === name ? null : name }),
                onToggle: toggle,
            }),
        ];
    };
});

export const plugins = makePage((ctx) => {
    Object.assign(ctx.state, { selected: null, busyName: null });
    async function load() { try { ctx.set({ loading: false, list: await api('/api/plugins'), error: null }); } catch (e) { ctx.failLoad(e); } }
    async function toggle(plugin) {
        ctx.set({ busyName: plugin.name });
        try { await api('/api/plugins/' + encodeURIComponent(plugin.name), { method: 'POST', body: { enabled: !plugin.enabled } }); await load(); }
        catch (e) { ctx.failError(e); }
        ctx.set({ busyName: null });
    }
    load();
    return () => {
        const s = ctx.state;
        const list = Array.isArray(s.list) ? s.list : (s.list?.plugins || []);
        const enabledCount = list.filter((p) => p.enabled).length;
        const lede = enabledCount === list.length ? list.length + ' plugins loaded' : enabledCount + ' of ' + list.length + ' plugins enabled';
        return [
            PageHeader({ title: 'plugins', lede }),
            PluginsConfig({
                plugins: list, selected: s.selected, loading: s.loading, error: s.error,
                busyName: s.busyName,
                onSelect: (name) => ctx.set({ selected: s.selected === name ? null : name }),
                onToggle: toggle,
                onReload: load,
            }),
        ];
    };
});
