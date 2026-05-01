const registry = new Map();

export function register(name, snapshot) {
    if (typeof name !== 'string' || !name) throw new Error('debug.register: name required');
    if (typeof snapshot !== 'function') throw new Error('debug.register: snapshot fn required');
    registry.set(name, snapshot);
    expose();
}

export function unregister(name) { registry.delete(name); expose(); }

export function list() { return [...registry.keys()]; }

export function snapshot(name) {
    const fn = registry.get(name);
    if (!fn) return null;
    try { return fn(); } catch (e) { return { error: String(e && e.message || e) }; }
}

export function snapshotAll() {
    const out = {};
    for (const [k, fn] of registry) {
        try { out[k] = fn(); } catch (e) { out[k] = { error: String(e && e.message || e) }; }
    }
    return out;
}

function expose() {
    if (typeof window === 'undefined') return;
    const api = { list, snapshot, snapshotAll, register, unregister };
    Object.defineProperty(window, '__debug', { value: api, configurable: true, writable: false });
}

expose();
