import { parseSseEvents } from './chat-protocol.js';
import { attempt, attemptAsync } from '../../../best-effort.js';

export async function loadProviders() {
    let providers = await fetch('/api/providers').then(r => r.json()).catch(() => []);
    if (!Array.isArray(providers)) providers = [];
    if (!providers.some(p => p.configured)) {
        await attemptAsync(async () => {
            const cfg = (window.__debug?.instances?.i1?.host?.fs?.readJson?.('/etc/freddie/freddie.json', null)) || {};
            const baseUrl = (cfg?.providers?.openai?.baseUrl || 'http://localhost:4800').replace(/\/+$/, '');
            const ac = new AbortController();
            const t = setTimeout(() => ac.abort(), 4000);
            const r = await fetch(baseUrl + '/v1/models', { signal: ac.signal }).catch(() => null);
            clearTimeout(t);
            if (r && r.ok) {
                const j = await r.json().catch(() => null);
                const models = Array.isArray(j?.data) ? j.data.map(m => m.id) : [];
                providers = [{ id: 'acptoapi', name: 'acptoapi gateway (' + baseUrl + ')', configured: true, models: ['auto', ...models] }, ...providers];
            }
        });
    }
    return providers;
}

async function runInPageAgent(trimmed, chatState, renderPage) {
    const events = [];
    try {
        let stepN = 0;
        const onUpdate = (snap) => {
            attempt(() => { const msgs = (snap && snap.context && snap.context.messages) || []; const toolMsgs = msgs.filter(m => m.role === 'tool'); const lastAssist = [...msgs].reverse().find(m => m.role === 'assistant' && Array.isArray(m.tool_calls) && m.tool_calls.length); const running = lastAssist && lastAssist.tool_calls[0] && (lastAssist.tool_calls[0].function?.name || lastAssist.tool_calls[0].name); stepN = toolMsgs.length; chatState.progress = running ? ('agent: ' + running + ' (step ' + (stepN + 1) + ')…') : ('agent thinking' + (stepN ? ' (step ' + stepN + ')' : '') + '…'); renderPage(); });
        };
        const out = await window.__thebirdRunAgent({ prompt: trimmed, onUpdate });
        const turnMsgs = (out && Array.isArray(out.messages)) ? out.messages : [];
        for (const m of turnMsgs) {
            if (m.role === 'assistant' && Array.isArray(m.tool_calls) && m.tool_calls.length) {
                const parts = [];
                if (m.content) parts.push({ type: 'text', text: String(m.content) });
                for (const tc of m.tool_calls) {
                    const rawArgs = tc.function?.arguments ?? tc.arguments;
                    let input = {};
                    if (rawArgs && typeof rawArgs === 'object') input = rawArgs;
                    else if (typeof rawArgs === 'string') { try { input = JSON.parse(rawArgs || '{}'); } catch { input = {}; } }
                    parts.push({ type: 'tool_use', name: tc.function?.name || tc.name, input });
                }
                events.push({ event: 'message', data: { role: 'assistant', content: parts } });
            } else if (m.role === 'tool') {
                events.push({ event: 'message', data: { role: 'tool', content: [{ content: String(m.content ?? '') }] } });
            }
        }
        const finalText = (out && out.result) || (out && out.error ? 'error: ' + out.error : '');
        if (finalText) events.push({ event: 'message', data: { role: 'assistant', content: [{ type: 'text', text: String(finalText) }] } });
        if (!events.length) events.push({ event: 'message', data: { role: 'assistant', content: [{ type: 'text', text: '' }] } });
        return events;
    } catch (e) {
        return [{ event: 'error', data: { error: e?.message || String(e) } }];
    }
}

async function runDirectCompletion(trimmed, chatState) {
    const cfg = (window.__debug?.instances?.i1?.host?.fs?.readJson?.('/etc/freddie/freddie.json', null)) || {};
    const baseUrl = cfg?.providers?.openai?.baseUrl || 'http://localhost:4800';
    try {
        const url = baseUrl.replace(/\/+$/, '') + '/v1/chat/completions';
        const reqBody = { model: chatState.model || cfg?.providers?.openai?.model || 'auto', messages: [{ role: 'user', content: trimmed }] };
        const r2 = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(reqBody), signal: chatState.abort.signal });
        if (!r2.ok) {
            const errText = await r2.text().catch(() => '');
            return [{ event: 'error', data: { error: 'acptoapi ' + r2.status + ': ' + errText.slice(0, 200) } }];
        }
        const j = await r2.json();
        const content = j?.choices?.[0]?.message?.content || '';
        const tool_calls = j?.choices?.[0]?.message?.tool_calls;
        const parts = [];
        if (content) parts.push({ type: 'text', text: content });
        if (Array.isArray(tool_calls)) {
            for (const tc of tool_calls) parts.push({ type: 'tool_use', name: tc.function?.name, input: (() => { try { return JSON.parse(tc.function?.arguments || '{}'); } catch { return {}; } })() });
        }
        return [{ event: 'message', data: { role: 'assistant', content: parts.length ? parts : [{ type: 'text', text: '' }] } }];
    } catch (e) {
        return [{ event: 'error', data: { error: e?.message || String(e) } }];
    }
}

export async function fetchChatEvents(trimmed, chatState, renderPage) {
    const body = { prompt: trimmed, cwd: chatState.cwd || undefined, skill: chatState.skill || undefined, provider: chatState.provider || undefined, model: chatState.model || undefined, sessionId: chatState.sessionId || undefined };
    let resp;
    try {
        resp = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: chatState.abort.signal });
    } catch (fetchErr) {
        resp = null;
    }
    if (resp && resp.ok) {
        const text = await resp.text();
        return parseSseEvents(text);
    }
    if (typeof window !== 'undefined' && typeof window.__thebirdRunAgent === 'function') {
        return runInPageAgent(trimmed, chatState, renderPage);
    }
    return runDirectCompletion(trimmed, chatState);
}

export function applyChatEvents(events, chatState, syncMessages) {
    let assistantContent = '';
    for (const { event, data } of events) {
        if (event === 'start' && data.sessionId) chatState.sessionId = data.sessionId;
        if (event === 'done' && data.sessionId) chatState.sessionId = data.sessionId;
        if (event === 'message') {
            const role = data.role;
            if (role === 'assistant') {
                const content = Array.isArray(data.content) ? data.content : [{ type: 'text', text: String(data.content || '') }];
                for (const block of content) {
                    if (block.type === 'text') assistantContent += block.text;
                    if (block.type === 'tool_use') {
                        if (assistantContent) { chatState.messages.push({ role: 'assistant', content: assistantContent }); assistantContent = ''; }
                        const argsSummary = JSON.stringify(block.input || {}).slice(0, 60);
                        chatState.messages.push({ role: 'tool', name: block.name, argsSummary, content: JSON.stringify(block.input || {}, null, 2), status: 'running' });
                        syncMessages();
                    }
                }
            } else if (role === 'tool') {
                const tc = Array.isArray(data.content) ? data.content[0] : data;
                for (let i = chatState.messages.length - 1; i >= 0; i--) {
                    const m = chatState.messages[i];
                    if (m.role === 'tool' && m.status === 'running') {
                        m.content = String(tc?.content || tc?.text || JSON.stringify(tc));
                        m.status = 'done';
                        break;
                    }
                }
                syncMessages();
            }
        }
        if (event === 'done' && data.result) { if (!assistantContent) assistantContent = data.result; }
        if (event === 'error') {
            const msg = 'error: ' + (data.error || 'unknown');
            for (let i = chatState.messages.length - 1; i >= 0; i--) {
                const m = chatState.messages[i];
                if (m.role === 'tool' && m.status === 'running') { m.status = 'error'; m.error = true; m.content = msg; break; }
            }
            if (!assistantContent) assistantContent = msg;
        }
    }
    return assistantContent;
}
