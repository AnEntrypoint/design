import { api } from '../runtime.js';

export function loadModelCatalog(ctx) {
    Promise.all([api('/api/models/cached').catch(() => ({})), api('/api/config').catch(() => ({}))]).then(([cached, cfg]) => {
        const models = []; const seen = new Set();
        for (const p of (cfg.agent && cfg.agent.model_preference) || []) {
            const id = [p.provider, p.model].filter(Boolean).join('/');
            if (id && !seen.has(id)) { seen.add(id); models.push({ id, name: id }); }
        }
        for (const [prov, rec] of Object.entries(cached || {})) {
            for (const m of rec.models || []) {
                const id = prov + '/' + m;
                if (!seen.has(id)) { seen.add(id); models.push({ id, name: id }); }
            }
        }
        ctx.state.models = models.slice(0, 40);
        if (!ctx.state.model && models[0]) ctx.state.model = models[0].id;
        ctx.rerender();
    });
}
