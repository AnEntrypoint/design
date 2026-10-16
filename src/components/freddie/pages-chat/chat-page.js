import { makePage, api } from '../runtime.js';
import { watchReconnect } from '../../../idb-outbox.js';
import { formatTime } from '../../../locale.js';
import { ignoreFailure, attempt } from '../../../best-effort.js';
import { readStoredSessionId } from './session-id.js';
import { loadModelCatalog } from './model-catalog.js';
import { createSessionFiles } from './session-files.js';
import { createSocket } from './socket.js';
import { createSender } from './sender.js';
import { createSessionLifecycle, refreshSessions } from './session-lifecycle.js';
import { createSessionPanels } from './session-panels.js';
import { createMessageSearch } from './message-search.js';
import { createChatView } from './chat-view.js';

export const chat = makePage((ctx) => {
    Object.assign(ctx.state, { loading: false, messages: [], draft: '', busy: false, error: null, sessionId: readStoredSessionId(), ws: null, conn: 'closed', sessions: [], staged: [], workspaceFiles: [], stagedFiles: [], searchOpen: false, searchQuery: '', searchHit: 0, cwd: '', cwdEditing: false, cwdDraft: '', model: '', models: [], tty: [] });
    const lifecycleState = { unmounted: false };
    attempt(() => { const bootSid = sessionStorage.getItem('fd_open_session'); if (bootSid) { ctx.state.sessionId = bootSid; sessionStorage.removeItem('fd_open_session'); } });

    refreshSessions(ctx);
    loadModelCatalog(ctx);

    const files = createSessionFiles(ctx);
    const socket = createSocket(ctx, lifecycleState);
    const sender = createSender(ctx, socket);
    const lifecycle = createSessionLifecycle(ctx, socket, files);
    const panels = createSessionPanels(ctx);
    const search = createMessageSearch(ctx);

    async function sendQueuedToServer(body) {
        const r = await api('/api/chat', { method: 'POST', body });
        const reply = r.result || r.content || r.message || (r.messages && r.messages.at(-1)?.content) || JSON.stringify(r);
        ctx.state.messages.push({ id: 'a' + Date.now(), role: 'assistant', content: String(reply), time: formatTime(Date.now()) });
        ctx.rerender();
    }
    watchReconnect('chat', sendQueuedToServer);

    const onKeydown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
            e.preventDefault();
            ctx.state.searchOpen = true;
            ctx.rerender();
        }
    };
    document.addEventListener('keydown', onKeydown);

    ctx.onCleanup(() => {
        lifecycleState.unmounted = true;
        document.removeEventListener('keydown', onKeydown);
        attempt(() => { ctx.state.ws && ctx.state.ws.close(); });
    });

    socket.ensureWs();
    files.loadWorkspaceFiles(ctx.state.sessionId);
    files.loadStagedFiles(ctx.state.sessionId);
    api('/api/terminal/status').then(st => { if (st && st.cwd && !ctx.state.cwd) { ctx.state.cwd = st.cwd; ctx.rerender(); } }).catch(ignoreFailure);

    return createChatView(ctx, { files, lifecycle, sender, panels, search });
});
