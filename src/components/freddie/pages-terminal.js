import * as webjsx from '../../../vendor/webjsx/index.js';
import { makePage, api, loadingState, errorState, emptyState } from './runtime.js';
import { PageHeader, TextField } from '../content.js';
import { Btn } from '../shell.js';
import { section } from './shared.js';

const h = webjsx.createElement;

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
