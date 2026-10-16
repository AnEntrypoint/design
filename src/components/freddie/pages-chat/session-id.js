import { attempt } from '../../../best-effort.js';

export function newSessionId() {
    return (crypto.randomUUID ? crypto.randomUUID() : 's' + Date.now().toString(36) + Math.random().toString(16).slice(2));
}

const CHAT_SESSION_KEY = 'fd-chat-session-id';
export function readStoredSessionId() {
    try { return localStorage.getItem(CHAT_SESSION_KEY) || null; } catch { return null; }
}
export function storeSessionId(id) {
    attempt(() => { if (id) localStorage.setItem(CHAT_SESSION_KEY, id); });
}
