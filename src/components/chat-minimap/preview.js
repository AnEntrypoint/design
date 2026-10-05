export const PREVIEW_CHARS = 200;

export function messagePreview(m) {
    if (!m) return '';
    if (typeof m.text === 'string' && m.text) return m.text.slice(0, PREVIEW_CHARS);
    if (typeof m.content === 'string' && m.content) return m.content.slice(0, PREVIEW_CHARS);
    const partsSrc = Array.isArray(m.content) ? m.content : (Array.isArray(m.parts) ? m.parts : null);
    if (partsSrc) {
        const joined = partsSrc
            .map((p) => (typeof p === 'string' ? p : (p && (p.text || (p.type === 'text' && p.text)) || '')))
            .filter(Boolean)
            .join(' ');
        if (joined) return joined.slice(0, PREVIEW_CHARS);
    }
    return '';
}

export function hasTextContent(m) {
    return !!messagePreview(m);
}

export function isMappedRole(role) {
    return role === 'user' || role === 'assistant';
}

export function resolveMessageEl(threadEl, getMessageEl, i) {
    if (typeof getMessageEl === 'function') return getMessageEl(i) || null;
    return threadEl.querySelector('[data-msg-index="' + i + '"]') || null;
}
