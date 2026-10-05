
import { escapeHtml } from './html-escape.js';

let _ready = null;
let _marked = null;
let _purify = null;
let _failedAt = 0;
const RETRY_BACKOFF_MS = 30000;

const DEFAULT_MARKED_URL = 'https://cdn.jsdelivr.net/npm/marked@15.0.12/+esm';
const DEFAULT_PURIFY_URL = 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm';

let _markedUrl = DEFAULT_MARKED_URL;
let _purifyUrl = DEFAULT_PURIFY_URL;

export function configureMarkdownCdn({ markedUrl, purifyUrl } = {}) {
    if (markedUrl !== undefined) _markedUrl = markedUrl || DEFAULT_MARKED_URL;
    if (purifyUrl !== undefined) _purifyUrl = purifyUrl || DEFAULT_PURIFY_URL;
    _ready = null;
    _failedAt = 0;
}

export function getMarkdownCdnConfig() {
    return { markedUrl: _markedUrl, purifyUrl: _purifyUrl };
}

export function isDegraded() {
    return !_marked || !_purify || typeof _purify.sanitize !== 'function';
}

export async function ensureReady() {
    if (_ready) return _ready;
    if (_failedAt && Date.now() - _failedAt < RETRY_BACKOFF_MS) return false;
    _ready = (async () => {
        try {
            const [{ marked }, DOMPurifyMod] = await Promise.all([import(_markedUrl), import(_purifyUrl)]);
            const purify = DOMPurifyMod.default || DOMPurifyMod;
            if (!marked || typeof marked.parse !== 'function') throw new Error('marked module missing parse()');
            if (!purify || typeof purify.sanitize !== 'function') throw new Error('DOMPurify module missing sanitize()');
            marked.use({
                extensions: [{
                    name: 'spoiler',
                    level: 'inline',
                    start(src) { return src.match(/\|\|/)?.index; },
                    tokenizer(src) {
                        const match = /^\|\|([^|]+)\|\|/.exec(src);
                        if (!match) return undefined;
                        return { type: 'spoiler', raw: match[0], text: match[1].trim(), tokens: this.lexer.inlineTokens(match[1].trim()) };
                    },
                    renderer(token) { return `<span class="chat-spoiler" tabindex="0" role="button" aria-label="spoiler, click to reveal">${this.parser.parseInline(token.tokens)}</span>`; },
                }],
            });
            _marked = marked;
            _purify = purify;
            _failedAt = 0;
            return true;
        } catch (err) {
            console.warn('[247420] markdown loader failed:', err);
            _marked = null;
            _purify = null;
            _ready = null;
            _failedAt = Date.now();
            return false;
        }
    })();
    return _ready;
}

function escapedFallback(src) {
    return escapeHtml(src).replace(/\n/g, '<br>');
}

export { escapeHtml };

export async function renderMarkdown(src) {
    const ok = await ensureReady();
    if (!ok) return escapedFallback(src);
    try {
        const raw = _marked.parse(String(src));
        if (typeof _purify.sanitize !== 'function') throw new Error('purifier unavailable mid-render');
        return _purify.sanitize(raw, { FORCE_BODY: true });
    } catch (err) {
        console.warn('[247420] markdown render failed, falling back to escaped text:', err);
        _marked = null;
        _purify = null;
        _ready = null;
        _failedAt = Date.now();
        return escapedFallback(src);
    }
}

export async function sanitizeHtml(html) {
    const ok = await ensureReady();
    if (!ok) return escapeHtml(html);
    try {
        if (typeof _purify.sanitize !== 'function') throw new Error('purifier unavailable mid-sanitize');
        return _purify.sanitize(String(html), { FORCE_BODY: true });
    } catch (err) {
        console.warn('[247420] sanitizeHtml failed, falling back to escaped text:', err);
        _marked = null;
        _purify = null;
        _ready = null;
        _failedAt = Date.now();
        return escapeHtml(html);
    }
}
