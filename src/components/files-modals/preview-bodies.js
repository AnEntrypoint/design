
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { fileGlyph } from '../files.js';
import { highlightAllUnder } from '../../highlight.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

export function FilePreviewMedia({ src, type = 'other', name } = {}) {
    if (type === 'image') {
        const onToggle = (e) => {
            const wrap = e.currentTarget.closest('.ds-preview-media-wrap');
            const img = wrap && wrap.querySelector('.ds-preview-media');
            if (!img) return;
            const actual = img.classList.toggle('is-actual');
            e.currentTarget.textContent = actual ? 'fit to pane' : 'actual size';
        };
        const onLoad = (e) => {
            const img = e.currentTarget;
            const cap = img.closest('.ds-preview-media-wrap');
            const dim = cap && cap.querySelector('.ds-preview-media-dim');
            if (dim && img.naturalWidth) dim.textContent = img.naturalWidth + ' x ' + img.naturalHeight + ' px';
        };
        return h('div', { class: 'ds-preview-media-wrap' },
            h('img', { class: 'ds-preview-media ds-preview-media-alpha', src, alt: name || '', onload: onLoad }),
            h('div', { class: 'ds-preview-media-controls' },
                h('span', { class: 'ds-preview-media-dim', 'aria-live': 'polite' }, ''),
                h('button', { type: 'button', class: 'chat-code-copy', onclick: onToggle }, 'actual size')));
    }
    if (type === 'video') return h('video', { class: 'ds-preview-media', src, controls: true });
    if (type === 'audio') return h('audio', { class: 'ds-preview-audio', src, controls: true });
    return h('div', { class: 'ds-preview-fallback' },
        h('span', { class: 'ds-preview-glyph', 'aria-hidden': 'true' }, Icon(fileGlyph(type))),
        h('span', {}, 'no inline preview for ' + (type || 'this file'))
    );
}

export function FilePreviewCode({ content = '', lang, filename, wrap, onWrapToggle, previewHtml, previewLabel = 'preview', mode, onModeChange } = {}) {
    const onCopy = (e) => {
        const btn = e.currentTarget;
        const done = () => { btn.textContent = 'copied'; btn.classList.add('is-copied'); setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('is-copied'); }, 1600); };
        const fallback = () => { attempt(() => { const t = document.createElement('textarea'); t.value = content; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); done(); }); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(content).then(done, fallback);
        else fallback();
    };
    const hasPreview = previewHtml != null && onModeChange;
    const activeMode = hasPreview ? (mode || 'source') : 'source';
    const modeSwitch = hasPreview ? h('div', { class: 'ds-preview-mode-switch', role: 'group', 'aria-label': 'file view mode' },
        h('button', { type: 'button', class: 'ds-preview-mode-btn' + (activeMode === 'source' ? ' active' : ''),
            'aria-pressed': activeMode === 'source' ? 'true' : 'false', onclick: () => onModeChange('source') }, 'source'),
        h('button', { type: 'button', class: 'ds-preview-mode-btn' + (activeMode === 'preview' ? ' active' : ''),
            'aria-pressed': activeMode === 'preview' ? 'true' : 'false', onclick: () => onModeChange('preview') }, previewLabel)
    ) : null;
    const wrapCtl = (onWrapToggle && activeMode === 'source') ? h('button', {
        type: 'button', class: 'chat-code-copy ds-preview-wrap-toggle' + (wrap ? ' active' : ''),
        title: wrap ? 'disable word wrap' : 'enable word wrap',
        'aria-label': wrap ? 'disable word wrap' : 'enable word wrap',
        'aria-pressed': wrap ? 'true' : 'false',
        onclick: () => onWrapToggle(!wrap),
    }, 'wrap') : null;
    return h('div', { class: 'ds-preview-code-wrap' },
        h('div', { class: 'chat-code-head ds-preview-code-head' },
            h('span', { class: 'lang' }, lang || 'text'),
            filename ? h('span', { class: 'name' }, filename) : null,
            h('span', { class: 'spread' }),
            modeSwitch,
            wrapCtl,
            h('button', { type: 'button', class: 'chat-code-copy chat-code-copy-head', 'aria-label': 'copy code', onclick: onCopy }, 'copy')),
        activeMode === 'preview'
            ? h('div', { class: 'ds-preview-html', ref: (el) => { if (el) el.innerHTML = previewHtml; } })
            : codeBody({ content, lang, wrap })
    );
}

function codeBody({ content = '', lang, wrap = false } = {}) {
    const wantGutter = !!lang;
    const lineCount = content ? content.split('\n').length : 1;
    const gutter = wantGutter
        ? h('div', { class: 'ds-preview-gutter', 'aria-hidden': 'true' },
            Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n'))
        : null;
    const highlightRef = (el) => {
        if (!el) return;
        attempt(() => { highlightAllUnder(el); });
    };
    return h('pre', { class: 'ds-preview-code' + (lang ? ' lang-' + lang : '') + (wantGutter ? ' has-gutter' : '') + (wrap ? ' is-wrapped' : ''), ref: highlightRef },
        gutter,
        h('code', { class: lang ? 'language-' + lang : '' }, content));
}

export function FilePreviewText({ content = '', truncated } = {}) {
    return h('pre', { class: 'ds-preview-text' },
        h('code', {}, content),
        truncated ? h('div', { class: 'ds-preview-truncated' }, '… (truncated)') : null
    );
}
