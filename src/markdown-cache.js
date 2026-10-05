
import { renderMarkdown, ensureReady as ensureMarkdownReady, isDegraded as isMarkdownDegraded } from './markdown.js';
import { highlightAllUnder, ensurePrism } from './highlight.js';
import { register } from './debug.js';

function simpleHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h).toString(36);
}

let _markdownInitialized = false;
let _prismInitialized = false;
let _initPromise = null;
let _renderCache = new Map();
let _stats = {
    markdownInitMs: 0,
    totalInitMs: 0,
    prismInitMs: 0,
    renderCount: 0,
    renderTimes: [],
    cacheHits: 0,
    cacheMisses: 0,
};

export async function initializeCachesEagerly() {
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        const startTime = performance.now();

        const [mdOk, prismOk] = await Promise.all([
            (async () => {
                const t0 = performance.now();
                const ok = await ensureMarkdownReady();
                _stats.markdownInitMs = performance.now() - t0;
                _markdownInitialized = true;
                return ok;
            })(),
            (async () => {
                const t0 = performance.now();
                const ok = await ensurePrism();
                _stats.prismInitMs = performance.now() - t0;
                _prismInitialized = true;
                return ok;
            })(),
        ]);

        _stats.totalInitMs = performance.now() - startTime;

        return { markdown: mdOk, prism: prismOk };
    })();

    return _initPromise;
}

export async function renderMarkdownCached(text) {
    const t0 = performance.now();
    const hash = simpleHash(text || '');

    if (_renderCache.has(hash)) {
        _stats.cacheHits += 1;
        return _renderCache.get(hash);
    }

    await ensureMarkdownReady();
    _markdownInitialized = !isMarkdownDegraded();

    const html = await renderMarkdown(text);

    if (!isMarkdownDegraded()) {
        _renderCache.set(hash, html);
        if (_renderCache.size > 500) {
            const first = _renderCache.keys().next().value;
            _renderCache.delete(first);
        }
    }

    const renderMs = performance.now() - t0;
    _stats.renderCount += 1;
    _stats.cacheMisses += 1;
    _stats.renderTimes.push(renderMs);
    if (_stats.renderTimes.length > 100) _stats.renderTimes.shift();

    return html;
}

export async function highlightCodeBlockCached(el) {
    if (!_prismInitialized) {
        await ensurePrism();
        _prismInitialized = true;
    }

    await highlightAllUnder(el);
}

export function getCacheStats() {
    const total = _stats.cacheHits + _stats.cacheMisses;
    return {
        markdownInitialized: _markdownInitialized,
        prismInitialized: _prismInitialized,
        initMs: {
            markdown: _stats.markdownInitMs,
            prism: _stats.prismInitMs,
            total: _stats.totalInitMs,
        },
        renderStats: {
            count: _stats.renderCount,
            avgTimeMs: _stats.renderTimes.length
                ? (_stats.renderTimes.reduce((a, b) => a + b, 0) / _stats.renderTimes.length).toFixed(2)
                : 0,
            minTimeMs: _stats.renderTimes.length ? Math.min(..._stats.renderTimes).toFixed(2) : 0,
            maxTimeMs: _stats.renderTimes.length ? Math.max(..._stats.renderTimes).toFixed(2) : 0,
        },
        cacheStats: {
            hits: _stats.cacheHits,
            misses: _stats.cacheMisses,
            hitRate: total > 0 ? (_stats.cacheHits / total * 100).toFixed(1) + '%' : 'N/A',
            cacheSize: _renderCache.size,
        },
    };
}

register('markdown-cache', () => getCacheStats());
