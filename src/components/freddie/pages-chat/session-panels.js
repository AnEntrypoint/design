import * as webjsx from '../../../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function createSessionPanels(ctx) {
    const s = () => ctx.state;

    function sessionFilesPanel() {
        const st = s();
        if (!st.sessionId) return h('div', { class: 'fd-session-files fd-session-files-empty' }, 'No session selected.');
        const staged = st.stagedFiles.length ? h('div', { key: 'staged', class: 'fd-session-files-section' },
            h('div', { class: 'fd-session-files-head' }, 'attached (' + st.stagedFiles.length + ')'),
            h('ul', { class: 'fd-session-files-list' },
                ...st.stagedFiles.map(f => h('li', { key: 'sf-' + f.name, class: 'fd-session-files-row' },
                    h('a', { href: '/api/sessions/' + encodeURIComponent(st.sessionId) + '/staged-files/' + encodeURIComponent(f.name), download: f.name, title: f.name }, f.name))))) : null;
        const workspace = st.workspaceFiles.length ? h('div', { key: 'ws', class: 'fd-session-files-section' },
            h('div', { class: 'fd-session-files-head' }, 'workspace (' + st.workspaceFiles.length + ')'),
            h('ul', { class: 'fd-session-files-list' },
                ...st.workspaceFiles.map(f => h('li', { key: 'wf-' + f, class: 'fd-session-files-row', title: f }, f)))) : null;
        if (!staged && !workspace) return h('div', { class: 'fd-session-files fd-session-files-empty' }, 'No files in this session\'s workspace.');
        return h('div', { class: 'fd-session-files' }, staged, workspace);
    }

    function sessionMuxPanel() {
        const st = s();
        const lines = st.tty || [];
        const sid = (st.sessionId || '').slice(0, 8);
        const tty = h('div', { key: 'mux', class: 'fd-tty' },
            h('div', { class: 'fd-tty-head' },
                h('span', { class: 'fd-tty-title' }, 'mux · ' + (sid || 'session')),
                h('span', { class: 'fd-tty-status' }, st.busy ? 'live' : 'idle')),
            h('pre', { class: 'fd-tty-slot fd-pre' },
                lines.length ? lines.join('\n') : 'waiting for tool I/O on this session…'));
        return h('div', { class: 'fd-session-mux' }, tty, sessionFilesPanel());
    }

    return { sessionMuxPanel };
}
