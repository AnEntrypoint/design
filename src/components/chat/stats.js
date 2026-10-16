import { initializeCachesEagerly, getCacheStats } from '../../markdown-cache.js';
import { register } from '../../debug.js';
import { renderMessagePart as sharedRenderMessagePart } from '../chat-message-parts.js';

const _stats = { messages: 0, lastKindCounts: {} };
let _cacheInitialized = false;

export function ensureCachesInit() {
    if (_cacheInitialized) return;
    _cacheInitialized = true;
    initializeCachesEagerly().catch((err) => console.warn('[247420] cache init error:', err));
}

export function countMessage() { _stats.messages += 1; }

export function renderPart(p, key) {
    return sharedRenderMessagePart(p, key, (kind) => {
        _stats.lastKindCounts[kind] = (_stats.lastKindCounts[kind] || 0) + 1;
    });
}

register('chat', () => ({
    messages: _stats.messages,
    lastKindCounts: { ..._stats.lastKindCounts },
    cacheStats: getCacheStats(),
}));
