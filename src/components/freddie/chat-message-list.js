

export function renderChatMessages(messages = [], opts = {}) {
    return import('../chat.js').then(({ ChatMessage }) =>
        messages.map((m, i) => ChatMessage({ ...m, key: m.key != null ? m.key : i, ...opts }))
    );
}
