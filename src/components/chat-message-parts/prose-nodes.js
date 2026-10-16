import * as webjsx from '../../../vendor/webjsx/index.js';
import { renderMarkdownCached, highlightCodeBlockCached } from '../../markdown-cache.js';
import { isDegraded as isMarkdownDegraded } from '../../markdown.js';
import { renderMermaidBlocksUnder } from '../../mermaid.js';
import { renderMathBlocksUnder } from '../../math.js';
import { injectCodeCopy, copyToClipboardWithFeedback } from './inline.js';
import { ignoreFailure } from '../../best-effort.js';

const h = webjsx.createElement;

const MD_STREAM_THROTTLE_MS = 120;
const MD_STREAM_MIN_DELTA_CHARS = 40;

const scheduleIdle = typeof requestIdleCallback === 'function'
    ? (fn) => requestIdleCallback(fn, { timeout: 500 })
    : (fn) => setTimeout(fn, 0);

function wireSpoilerReveal(el) {
    if (!el || el.dataset.spoilerWired === '1') return;
    el.dataset.spoilerWired = '1';
    el.addEventListener('click', (e) => {
        const target = e.target.closest('.chat-spoiler');
        if (target && el.contains(target)) target.classList.add('is-revealed');
    });
    el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = e.target.closest('.chat-spoiler');
        if (target && el.contains(target)) { e.preventDefault(); target.classList.add('is-revealed'); }
    });
}

export function MdNode(p) {
    const refSink = (el) => {
        if (!el) return;
        wireSpoilerReveal(el);
        const srcKey = (isMarkdownDegraded() ? '~degraded~' : '') + (p.text || '');
        if (el.dataset.mdSrc === srcKey) return;
        const parsedLen = el.dataset.mdParsedLen ? Number(el.dataset.mdParsedLen) : 0;
        const lastParseAt = el.dataset.mdLastParseAt ? Number(el.dataset.mdLastParseAt) : 0;
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (p.streamingCaret && parsedLen > 0 &&
            (now - lastParseAt) < MD_STREAM_THROTTLE_MS &&
            (srcKey.length - parsedLen) < MD_STREAM_MIN_DELTA_CHARS) {
            el.textContent = p.text || '';
            return;
        }
        el.dataset.mdSrc = srcKey;
        el.dataset.mdParsedLen = String(srcKey.length);
        el.dataset.mdLastParseAt = String(now);
        if (isMarkdownDegraded()) el.textContent = p.text || '';
        function doParse() {
            renderMarkdownCached(p.text || '').then((html) => {
                if (el.dataset.mdSrc !== srcKey) return;
                const swap = () => {
                    el.innerHTML = html;
                    delete el.dataset.mathWired;
                    injectCodeCopy(el);
                    renderMermaidBlocksUnder(el).catch(ignoreFailure);
                    renderMathBlocksUnder(el).catch(ignoreFailure);
                };
                const sel = typeof window !== 'undefined' ? window.getSelection() : null;
                if (sel && sel.anchorNode && el.contains(sel.anchorNode)) {
                    const onSelChange = () => { document.removeEventListener('selectionchange', onSelChange); swap(); };
                    document.addEventListener('selectionchange', onSelChange, { once: true });
                    return;
                }
                swap();
            }).catch((e) => {
                console.error('renderMarkdownCached failed:', e);
                if (el.dataset.mdSrc === srcKey) el.textContent = p.text || '';
            });
        }
        if (p.streamingCaret) doParse();
        else scheduleIdle(doParse);
    };
    return h('div', { class: 'chat-bubble chat-md', ref: refSink });
}

export function CodeNode(p) {
    const refSink = (el) => {
        if (!el) return;
        const codeKey = (p.lang || '') + '|' + (p.code || '');
        if (el.dataset.codeKey === codeKey) return;
        el.dataset.codeKey = codeKey;
        const sel = typeof window !== 'undefined' ? window.getSelection() : null;
        if (sel && sel.anchorNode && el.contains(sel.anchorNode)) {
            const onSelChange = () => { document.removeEventListener('selectionchange', onSelChange); highlightCodeBlockCached(el); };
            document.addEventListener('selectionchange', onSelChange, { once: true });
            return;
        }
        highlightCodeBlockCached(el);
    };
    const onCopy = (e) => copyToClipboardWithFeedback(p.code || '', e.currentTarget);
    return h('div', { class: 'chat-bubble chat-code', ref: refSink },
        h('div', { class: 'chat-code-head' },
            h('span', { class: 'lang' }, p.lang || 'code'),
            p.filename ? h('span', { class: 'name' }, p.filename) : null,
            h('span', { class: 'spread' }),
            h('button', { type: 'button', class: 'chat-code-copy chat-code-copy-head', 'aria-label': 'copy code', onclick: onCopy }, 'copy')
        ),
        h('pre', {}, h('code', { class: p.lang ? 'lang-' + p.lang + ' language-' + p.lang : '' }, p.code || ''))
    );
}
