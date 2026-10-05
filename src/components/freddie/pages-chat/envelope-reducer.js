import { formatTime } from '../../../locale.js';

export function applyEnvelope(msgs, env, sendApprove, sendAnswer) {
    const { event, data } = env;
    const ts = new Date(env.ts).getTime();
    const lastAssistant = () => { for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === 'assistant') return msgs[i]; return null; };
    const isDupUser = (text) => {
        for (let i = msgs.length - 1; i >= 0 && i >= msgs.length - 3; i--) {
            if (msgs[i].role === 'user' && msgs[i].content === (text || '')) return true;
        }
        return false;
    };
    if (event === 'message.append') {
        if (data.role === 'user') { if (!isDupUser(data.content)) msgs.push({ id: 'u' + msgs.length + env.ts, role: 'user', content: data.content || '', time: formatTime(ts) }); }
        else if (data.role === 'assistant') {
            const last = lastAssistant();
            if (last && last._live) { if (data.content) last.content = data.content; }
            else msgs.push({ id: 'a' + msgs.length + env.ts, role: 'assistant', content: data.content || '', parts: [], time: formatTime(ts), _live: true });
        }
    } else if (event === 'steer.append') {
        if (!isDupUser(data.text)) msgs.push({ id: 'u' + msgs.length + env.ts, role: 'user', content: data.text || '', time: formatTime(ts) });
    } else if (event === 'queue.append') {
        if (!isDupUser(data.text)) msgs.push({ id: 'u' + msgs.length + env.ts, role: 'user', content: data.text || '', time: formatTime(ts) });
    } else if (event === 'assistant.delta') {
        const a = lastAssistant(); if (a && a._live) a.content = (a.content || '') + (data.text || '');
    } else if (event === 'tool.start') {
        const a = lastAssistant(); if (a) (a.parts || (a.parts = [])).push({ kind: 'tool', name: data.name || 'tool', args: data.args || {}, status: 'running', _tcid: data.toolCallId });
    } else if (event === 'tool.end') {
        const a = lastAssistant(); if (a) {
            const p = (a.parts || []).find(p => p.kind === 'tool' && p._tcid === data.toolCallId);
            if (p) {
                p.status = data.denied ? 'error' : 'done';
                p.result = data.denied ? 'denied by user' : (typeof data.result === 'string' ? data.result : JSON.stringify(data.result ?? '', null, 2));
                if (data.denied) p.error = true;
            }
        }
    } else if (event === 'approval.request') {
        const a = lastAssistant(); if (a) (a.parts || (a.parts = [])).push({ kind: 'approval', id: data.id, name: data.name, args: data.args || {}, status: 'pending', onResolve: sendApprove ? (d) => sendApprove(data.id, d) : null });
    } else if (event === 'approval.resolved') {
        const a = lastAssistant(); if (a) {
            const p = (a.parts || []).find(p => p.kind === 'approval' && p.id === data.id);
            if (p) { p.status = data.approved ? 'approved' : 'rejected'; p.always = !!data.always; p.onResolve = null; }
        }
    } else if (event === 'question.request') {
        const a = lastAssistant(); if (a) (a.parts || (a.parts = [])).push({ kind: 'question', id: data.id, questions: data.questions || [], status: 'pending', onResolve: sendAnswer ? (d) => sendAnswer(data.id, d) : null });
    } else if (event === 'question.resolved') {
        const a = lastAssistant(); if (a) {
            const p = (a.parts || []).find(p => p.kind === 'question' && p.id === data.id);
            if (p) { p.status = data.rejected ? 'rejected' : 'answered'; p.answers = data.answers || {}; p.onResolve = null; }
        }
    } else if (event === 'session.end') {
        const a = lastAssistant(); if (a) delete a._live;
    } else if (event === 'session.error') {
        const a = lastAssistant();
        const err = data.error || 'session error';
        if (a && a._live) { a.error = err; delete a._live; }
        else msgs.push({ id: 'e' + env.ts, role: 'assistant', content: '', error: err, time: formatTime(ts) });
    }
}

export function noteTty(st, env) {
    const event = env.event, data = env.data || {};
    if (event === 'tool.start') {
        const args = data.args != null ? ' ' + JSON.stringify(data.args).slice(0, 240) : '';
        st.tty = [...(st.tty || []), '$ ' + (data.name || 'tool') + args];
    } else if (event === 'tool.end') {
        const out = data.denied ? 'denied' : (typeof data.result === 'string' ? data.result : JSON.stringify(data.result ?? ''));
        st.tty = [...(st.tty || []), String(out).slice(0, 4000)];
    }
}
