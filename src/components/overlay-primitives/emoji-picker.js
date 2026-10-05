
import * as webjsx from '../../../vendor/webjsx/index.js';
import { trapTab, _anchoredOverlayLifecycle } from './floating.js';
const h = webjsx.createElement;

const EMOJI_CATEGORIES = [
    { id: 'smileys', label: '😀', emoji: [
        ['😀', 'grinning smile'], ['😁', 'grinning smile happy'], ['😂', 'joy tears laugh'], ['🤣', 'rofl laugh'],
        ['😊', 'smile blush happy'], ['😍', 'heart eyes love'], ['😘', 'kiss'], ['😎', 'cool sunglasses'],
        ['🤔', 'thinking'], ['😅', 'sweat smile'], ['😉', 'wink'], ['🙂', 'smile slight'],
        ['😇', 'angel innocent'], ['🥳', 'party'], ['😴', 'sleep'], ['🤩', 'starstruck'],
        ['😜', 'wink tongue'], ['😢', 'cry sad'], ['😭', 'sob cry'], ['😡', 'angry mad'],
        ['😱', 'scream shock'], ['🥺', 'pleading'], ['😤', 'huff'], ['😬', 'grimace'],
    ] },
    { id: 'gestures', label: '👍', emoji: [
        ['👍', 'thumbsup yes good'], ['👎', 'thumbsdown no bad'], ['👌', 'ok'], ['✌️', 'peace'],
        ['🤞', 'fingers crossed'], ['🙏', 'pray thanks'], ['👏', 'clap'], ['🙌', 'raised hands'],
        ['💪', 'muscle strong'], ['👀', 'eyes look'], ['🤝', 'handshake'], ['✋', 'hand stop'],
        ['🤙', 'call'], ['👋', 'wave hi bye'], ['🤟', 'love you'], ['☝️', 'point up'],
    ] },
    { id: 'hearts', label: '❤️', emoji: [
        ['❤️', 'heart love red'], ['🧡', 'heart orange'], ['💛', 'heart yellow'], ['💚', 'heart green'],
        ['💙', 'heart blue'], ['💜', 'heart purple'], ['🖤', 'heart black'], ['🤍', 'heart white'],
        ['💔', 'broken heart'], ['💕', 'hearts'], ['💖', 'sparkling heart'], ['💗', 'growing heart'],
    ] },
    { id: 'symbols', label: '✅', emoji: [
        ['🔥', 'fire lit'], ['💯', 'hundred'], ['✅', 'check yes done'], ['❌', 'cross no'],
        ['⭐', 'star'], ['🎉', 'party tada'], ['🎊', 'confetti'], ['✨', 'sparkles'],
        ['💡', 'idea lightbulb'], ['⚡', 'zap lightning'], ['💢', 'anger'], ['💀', 'skull dead'],
        ['🚀', 'rocket launch'], ['🏆', 'trophy win'],
    ] },
];
const ALL_EMOJI = EMOJI_CATEGORIES.flatMap((c) => c.emoji);

export function EmojiPicker({ open, anchorX = 0, anchorY = 0, onSelect, onClose, query = '' } = {}) {
    if (!open) return null;
    let cat = EMOJI_CATEGORIES[0].id;
    let rootEl = null, gridEl = null, searchEl = null, previewEl = null;
    let search = query || '';
    const close = () => onClose && onClose();

    const showPreview = (ch, name) => {
        if (!previewEl) return;
        webjsx.applyDiff(previewEl, h('div', { class: 'ov-emoji-preview' },
            h('span', { class: 'ov-emoji-preview-glyph' }, ch || ''),
            h('span', { class: 'ov-emoji-preview-name' }, name || '')));
    };

    const renderGrid = () => {
        if (!gridEl) return;
        const q = (search || '').trim().toLowerCase();
        const cells = q
            ? ALL_EMOJI.filter(([, name]) => name.toLowerCase().includes(q))
            : (EMOJI_CATEGORIES.find(x => x.id === cat) || EMOJI_CATEGORIES[0]).emoji;
        webjsx.applyDiff(gridEl, h('div', { class: 'ov-emoji-grid-inner' },
            cells.length ? cells.map(([ch, name]) => h('button', {
                type: 'button', class: 'ov-emoji-cell', 'aria-label': name || ch, title: name || ch,
                onclick: () => { if (onSelect) onSelect(ch); },
                onmouseenter: () => showPreview(ch, name),
                onfocus: () => showPreview(ch, name),
            }, ch)) : h('div', { class: 'ov-emoji-empty' }, 'no emoji found')));
    };

    const tabNavKey = (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const tabs = rootEl ? [...rootEl.querySelectorAll('.ov-emoji-tab')] : [];
        if (!tabs.length) return;
        const idx = tabs.indexOf(document.activeElement);
        if (idx < 0) return;
        e.preventDefault();
        const next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        tabs[next].click();
    };

    return h('div', {
        class: 'ov-emoji-root', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Emoji picker',
        tabindex: '-1',
        onkeydown: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); return; } tabNavKey(e); if (rootEl) trapTab(rootEl, e); },
        ref: (el) => {
            if (!el) { if (rootEl && rootEl._ovEmojiCleanup) rootEl._ovEmojiCleanup(); return; }
            if (el._ovEmoji) return; el._ovEmoji = true; rootEl = el;
            el._ovEmojiCleanup = _anchoredOverlayLifecycle(el, { anchorX, anchorY, fallbackW: 260, fallbackH: 240, close });
        },
    },
        h('input', {
            type: 'search', class: 'ov-emoji-search', placeholder: 'Search emoji…',
            'aria-label': 'search emoji', value: search,
            ref: (el) => { searchEl = el; },
            oninput: (e) => { search = e.target.value; renderGrid(); },
        }),
        (search || '').trim() ? null : h('div', { class: 'ov-emoji-tabs', role: 'tablist' },
            ...EMOJI_CATEGORIES.map((c) => h('button', {
                type: 'button', class: 'ov-emoji-tab', role: 'tab',
                'aria-selected': c.id === cat ? 'true' : 'false',
                'aria-controls': 'ov-emoji-panel',
                onclick: (e) => {
                    cat = c.id;
                    const tabs = rootEl.querySelectorAll('.ov-emoji-tab');
                    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                    e.currentTarget.setAttribute('aria-selected', 'true');
                    renderGrid();
                },
            }, c.label))),
        h('div', {
            class: 'ov-emoji-grid', id: 'ov-emoji-panel', role: 'tabpanel',
            'aria-label': EMOJI_CATEGORIES.find(c => c.id === cat)?.label || EMOJI_CATEGORIES[0].label,
            ref: (el) => { if (!el) return; gridEl = el; queueMicrotask(renderGrid); } }),
        h('div', { class: 'ov-emoji-preview', ref: (el) => { previewEl = el; } })
    );
}
