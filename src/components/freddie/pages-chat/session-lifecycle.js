import { api } from '../runtime.js';
import { ignoreFailure, attempt } from '../../../best-effort.js';
import { newSessionId, storeSessionId } from './session-id.js';

export function refreshSessions(ctx) {
    return api('/api/sessions').then(rows => { ctx.state.sessions = Array.isArray(rows) ? rows : []; ctx.rerender(); }).catch(ignoreFailure);
}

export function createSessionLifecycle(ctx, socket, files) {
    const { ensureWs } = socket;
    const { loadWorkspaceFiles, loadStagedFiles } = files;

    function switchSession(id) {
        const st = ctx.state;
        if (!id || id === st.sessionId) return;
        attempt(() => { st.ws && st.ws.close(); });
        ctx.set({ sessionId: id, messages: [], ws: null, conn: 'closed', busy: false, error: null });
        storeSessionId(id);
        ensureWs();
        loadWorkspaceFiles(id);
        loadStagedFiles(id);
    }

    function startNewSession(clearTty) {
        const st = ctx.state;
        attempt(() => { st.ws && st.ws.close(); });
        st.messages = []; st.draft = ''; st.error = null; st.busy = false;
        st.ws = null; st.conn = 'closed'; st.sessionId = newSessionId(); st.staged = [];
        if (clearTty) st.tty = [];
        ensureWs();
        loadWorkspaceFiles(st.sessionId);
        loadStagedFiles(st.sessionId);
        ctx.rerender();
    }

    return { switchSession, startNewSession };
}
