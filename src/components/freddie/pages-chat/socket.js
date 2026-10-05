import { api } from '../runtime.js';
import { ignoreFailure } from '../../../best-effort.js';
import { newSessionId, storeSessionId } from './session-id.js';
import { applyEnvelope, noteTty } from './envelope-reducer.js';

export function createSocket(ctx, lifecycle) {
    const s = () => ctx.state;
    const cur = () => { const msgs = s().messages; for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === 'assistant') return msgs[i]; return null; };

    function sendFrame(obj) {
        const ws = s().ws;
        if (!ws) return false;
        if (ws.readyState === 1) { ws.send(JSON.stringify(obj)); return true; }
        if (ws.readyState === 0) { ws.addEventListener('open', () => ws.send(JSON.stringify(obj)), { once: true }); return true; }
        return false;
    }

    const sendApprove = (id, d) => { ensureWs(); return sendFrame({ type: 'approve', id, approved: d.approved, always: !!d.always }); };
    const sendAnswer = (id, d) => { ensureWs(); return sendFrame({ type: 'answer', id, answers: d.answers || {}, rejected: !!d.rejected }); };

    function ensureWs() {
        if (lifecycle.unmounted) return null;
        const st = s();
        if (!st.sessionId) st.sessionId = newSessionId();
        storeSessionId(st.sessionId);
        if (st.ws && (st.ws.readyState === 1 || st.ws.readyState === 0)) return st.ws;
        try {
            const proto = location.protocol === 'https:' ? 'wss' : 'ws';
            const ws = new WebSocket(proto + '://' + location.host + '/api/agent/stream?sessionId=' + encodeURIComponent(st.sessionId));
            st.ws = ws;
            const isCurrent = () => s().ws === ws;
            ws.onopen = () => { if (!isCurrent()) return; st.conn = 'open'; ctx.rerender(); };
            ws.onmessage = (e) => {
                if (!isCurrent()) return;
                let f; try { f = JSON.parse(e.data); } catch { return; }
                if (f.type === 'replay') {
                    if (!st.messages.length && f.events && f.events.length) {
                        const msgs = [];
                        st.tty = [];
                        for (const env of f.events) { applyEnvelope(msgs, env, sendApprove, sendAnswer); noteTty(st, env); }
                        st.messages = msgs;
                    }
                    ctx.rerender();
                } else if (f.type === 'event') {
                    applyEnvelope(st.messages, f, sendApprove, sendAnswer);
                    noteTty(st, f);
                    ctx.rerender();
                } else if (f.type === 'prompt.done') {
                    const c = cur();
                    if (c && c.role === 'assistant') {
                        delete c._live;
                        if (f.error && !c.error) c.error = f.error;
                    }
                    ctx.set({ busy: false });
                    api('/api/sessions').then(rows => { ctx.state.sessions = Array.isArray(rows) ? rows : []; ctx.rerender(); }).catch(ignoreFailure);
                } else if (f.type === 'error') {
                    const c = cur();
                    if (c && c.role === 'assistant') { c.error = f.error; delete c._live; }
                    ctx.set({ busy: false });
                }
            };
            ws.onclose = () => {
                if (!isCurrent()) return;
                st.conn = 'closed';
                if (st.busy) {
                    const c = cur();
                    if (c && c.role === 'assistant') { delete c._live; c.incomplete = true; }
                    ctx.set({ busy: false });
                }
                ctx.rerender();
            };
            ws.onerror = () => { if (!isCurrent()) return; st.conn = 'closed'; };
            return ws;
        } catch { return null; }
    }

    return { s, cur, sendFrame, sendApprove, sendAnswer, ensureWs };
}
