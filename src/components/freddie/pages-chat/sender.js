import { formatTime } from '../../../locale.js';
import { queueMessage, isOnline } from '../../../idb-outbox.js';

export function createSender(ctx, socket) {
    const { s, cur, sendFrame, ensureWs } = socket;

    async function send(text) {
        const t = (typeof text === 'string' ? text : s().draft || '').trim();
        if (!t) return;

        if (s().busy) {
            if (sendFrame({ type: 'queue', text: t })) {
                s().messages = [...s().messages, { id: 'u' + Date.now(), role: 'user', content: t, time: formatTime(Date.now()) }];
                ctx.set({ draft: '' });
            }
            return;
        }

        const userMsg = { id: 'u' + Date.now(), role: 'user', content: t, time: formatTime(Date.now()) };
        const curMsg = { id: 'a' + (Date.now() + 1), role: 'assistant', content: '', time: formatTime(Date.now()), parts: [], _live: true };
        s().messages = [...s().messages, userMsg, curMsg];
        ctx.set({ draft: '', busy: true, error: null });

        if (!isOnline()) {
            await queueMessage('chat', { prompt: t });
            s().messages = s().messages.slice(0, -1);
            s().messages.push({ id: curMsg.id, role: 'assistant', content: '(offline: queued, will send when connection returns)', time: formatTime(Date.now()) });
            ctx.set({ busy: false });
            return;
        }

        if (!ensureWs() || !sendFrame({ type: 'prompt', text: t, cwd: s().cwd || undefined, model: s().model || undefined, attachments: s().staged.map(f => ({ name: f.name, path: f.path })) })) {
            curMsg.error = 'agent workspace connection unavailable';
            delete curMsg._live;
            ctx.set({ busy: false });
            return;
        }
        ctx.set({ staged: [] });
    }

    function stop() {
        ensureWs();
        const sent = sendFrame({ type: 'cancel' });
        if (sent) {
            const c = cur();
            if (c && c.role === 'assistant') c.stopped = true;
        }
        ctx.rerender();
    }

    return { send, stop };
}
