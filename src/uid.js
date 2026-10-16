export function uid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function shortUid(len = 8) {
    return uid().replace(/-/g, '').slice(0, len);
}
