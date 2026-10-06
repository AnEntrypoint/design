import * as webjsx from '../../../vendor/webjsx/index.js';
import { t } from '../../i18n.js';
import { ChatMessage } from './message.js';
import { makeThreadAutoScroll } from './thread-scroll.js';
import { ensureCachesInit } from './stats.js';

const h = webjsx.createElement;

export function ChatSuggestions({ heading = 'What can I help with?', subtext = '', suggestions = [] } = {}) {
    let picked = false;
    return h('div', { class: 'chat-suggestions', role: 'group', 'aria-label': heading },
        h('h2', { class: 'chat-suggestions-heading' }, heading),
        subtext ? h('p', { class: 'chat-suggestions-subtext' }, subtext) : null,
        h('div', { class: 'chat-suggestions-list' },
            ...suggestions.map((s, i) => h('button', {
                key: s.id || i, type: 'button', class: 'chat-suggestions-chip',
                onclick: () => { if (picked) return; picked = true; s.onPick ? s.onPick(s) : null; }
            }, s.label))
        )
    );
}

export function Chat({ title = 'chat', sub, messages = [], composer, header, suggestions, onSuggestionClick } = {}) {
    ensureCachesInit();
    const threadRef = makeThreadAutoScroll(() => messages.length);
    const msgCount = messages.length;
    return h('div', { class: 'chat' },
        header || h('div', { class: 'chat-head', role: 'banner' },
            h('h2', { class: 'ds-chat-title' }, title),
            sub ? h('span', { class: 'sub', 'aria-label': `subtitle: ${sub}` }, ' · ' + sub) : null,
            h('span', { class: 'spread' }),
            msgCount > 0
                ? h('span', { class: 'sub', 'aria-live': 'polite' }, msgCount + (msgCount === 1 ? ' message' : ' messages'))
                : null
        ),
        h('div', { class: 'chat-thread', ref: threadRef, role: 'log', 'aria-label': 'chat messages', 'aria-live': 'polite', 'aria-relevant': 'additions' },
            messages.length === 0
                ? h('div', { key: '_empty', class: 'chat-empty', role: 'status' },
                    h('p', { class: 'chat-empty-title' }, t('chat.startConversation', 'start a conversation')),
                    h('p', { class: 'chat-empty-sub' }, sub || t('chat.emptySub', 'Send a message to start the conversation')),
                    (suggestions && suggestions.length)
                        ? h('div', { class: 'chat-empty-suggestions' },
                            ...suggestions.map((s, i) => h('button', { key: 'sug' + i, type: 'button', class: 'chat-empty-suggestion',
                                onclick: () => { if (onSuggestionClick) onSuggestionClick(typeof s === 'string' ? s : (s.prompt || s.text || '')); } },
                                typeof s === 'string' ? s : (s.label || s.text || s.prompt))))
                        : null)
                : null,
            ...messages.map((m, i) => ChatMessage({ ...m, tail: m.tail != null ? m.tail : isConsecutive(messages, i), key: m.key != null ? m.key : i }))
        ),
        composer || null
    );
}

function isConsecutive(messages, i) {
    if (i === 0) return false;
    const prev = messages[i - 1];
    const cur = messages[i];
    if (!cur || !cur.flat) return false;
    if (!prev || !prev.flat) return false;
    const prevWho = prev.role ? (prev.role === 'user' ? 'you' : prev.role === 'assistant' ? 'them' : prev.role) : (prev.who || 'them');
    const curWho = cur.role ? (cur.role === 'user' ? 'you' : cur.role === 'assistant' ? 'them' : cur.role) : (cur.who || 'them');
    if (prevWho === 'system' || prevWho === 'tool' || prevWho === 'thinking') return false;
    if (curWho === 'system' || curWho === 'tool' || curWho === 'thinking') return false;
    if (prevWho !== curWho) return false;
    if (cur.authorId != null && prev.authorId != null && String(cur.authorId) !== String(prev.authorId)) return false;
    if (cur.variant === 'community' && cur.ts != null && prev.ts != null && Math.abs(cur.ts - prev.ts) > 300000) return false;
    if (curWho === 'them' && (prev.name || '') !== (cur.name || '')) return false;
    return true;
}

export const AICAT_FACE = ` /\\_/\\\n( o.o )\n > ^ <`;

export function AICatPortrait({ name = 'aicat', status, face } = {}) {
    return h('div', { class: 'aicat-portrait' },
        h('pre', { class: 'aicat-face', role: 'img', 'aria-label': `${name} portrait` }, face || AICAT_FACE),
        h('div', { class: 'aicat-meta' },
            h('span', { class: 'name' }, name),
            status != null
                ? h('span', { class: 'status', 'aria-label': `status: ${status}` }, h('span', { class: 'dot ds-dot ds-dot-on', 'aria-hidden': 'true' }), ' ', status)
                : null
        )
    );
}

export function AICat({ name = 'aicat', messages = [], thinking, composer, status = 'online · purring', header } = {}) {
    ensureCachesInit();
    const annotated = messages.map((m) =>
        m.who === 'them' ? { ...m, aicat: true, avatar: m.avatar || '=^.^=' } : m);
    const all = thinking
        ? [...annotated, { who: 'them', aicat: true, avatar: '=^.^=', typing: true, key: '_thinking' }]
        : annotated;
    const threadRef = makeThreadAutoScroll(() => all.length);
    return h('div', { class: 'chat' },
        header || h('div', { class: 'chat-head', role: 'banner' },
            h('span', { class: 'dot', 'aria-hidden': 'true' }),
            h('h2', { class: 'ds-chat-title' }, name),
            h('span', { class: 'sub', 'aria-label': `status: ${status}` }, ' · ' + status),
            h('span', { class: 'spread' }),
            messages.length > 0
                ? h('span', { class: 'sub', 'aria-live': 'polite' }, messages.length + (messages.length === 1 ? ' turn' : ' turns'))
                : null
        ),
        h('div', { class: 'chat-thread', ref: threadRef, role: 'log', 'aria-label': 'conversation turns', 'aria-live': 'polite', 'aria-relevant': 'additions' },
            ...all.map((m, i) => ChatMessage({ ...m, key: m.key != null ? m.key : i }))
        ),
        composer || null
    );
}
