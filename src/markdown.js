import { register } from './debug.js';

let _marked = null;
let _purify = null;
let _stats = { renders: 0, sanitizedTags: 0 };

async function loadMarked() {
    if (_marked) return _marked;
    const mod = await import('https://cdn.jsdelivr.net/npm/marked@15.0.7/lib/marked.esm.js');
    _marked = mod.marked;
    _marked.setOptions({ breaks: true, gfm: true });
    return _marked;
}

async function loadPurify() {
    if (_purify) return _purify;
    const mod = await import('https://cdn.jsdelivr.net/npm/dompurify@3.4.1/+esm');
    _purify = mod.default || mod;
    if (!_purify.sanitize) throw new Error('dompurify did not load a sanitize fn');
    _purify.addHook('uponSanitizeElement', (node, data) => {
        if (data.tagName && data.allowedTags && !data.allowedTags[data.tagName]) _stats.sanitizedTags += 1;
    });
    return _purify;
}

let _ready = null;
export function ensureReady() {
    if (_ready) return _ready;
    _ready = Promise.all([loadMarked(), loadPurify()]).then(() => true);
    return _ready;
}

export async function renderMarkdown(text) {
    const [marked, purify] = await Promise.all([loadMarked(), loadPurify()]);
    const dirty = marked.parse(String(text || ''));
    const clean = purify.sanitize(dirty, {
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
        ADD_ATTR: ['target', 'rel']
    });
    _stats.renders += 1;
    return clean;
}

export function renderMarkdownSync(text) {
    if (!_marked || !_purify) return null;
    const dirty = _marked.parse(String(text || ''));
    const clean = _purify.sanitize(dirty, {
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
        ADD_ATTR: ['target', 'rel']
    });
    _stats.renders += 1;
    return clean;
}

register('markdown', () => ({
    loaded: { marked: !!_marked, dompurify: !!_purify },
    renders: _stats.renders,
    sanitizedTags: _stats.sanitizedTags
}));
