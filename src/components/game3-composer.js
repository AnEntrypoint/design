import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
import { CMDS, EMOJI_NAMES, EMOJI, STICKERS } from '../game3-data.js';

const h = webjsx.createElement;

const AC_RE = /(@[^@]*|^\/\w*|:\w*)$/;

const acOptions = (value, mentions) => {
    const m = AC_RE.exec(value || '');
    if (!m) return null;
    const q = m[1], rest = q.slice(1).toLowerCase();
    if (q[0] === '/') {
        const f = CMDS.filter(([c]) => c.startsWith(rest));
        return f.length ? { head: 'Commands', items: f.map(([c, d]) => ({ key: c, label: h('b', {}, '/' + c), small: d, insert: '/' + c })) } : null;
    }
    if (q[0] === ':') {
        const f = Object.entries(EMOJI_NAMES).filter(([n]) => n.includes(rest)).slice(0, 8);
        return f.length ? { head: 'Emoji matching :' + rest, items: f.map(([n, e]) => ({ key: n, glyph: e, label: ':' + n + ':', insert: e })) } : null;
    }
    const f = mentions.filter((n) => n.toLowerCase().includes(rest)).slice(0, 8);
    return f.length ? { head: 'Members', items: f.map((n) => ({ key: n, label: n, insert: '@' + n })) } : null;
};

export function Game3Composer({ mentions = [], typing = null, value = '', placeholder = '', maxLength = 190, disabled = false, disabledReason, replyTo = null, onCancelReply, onInput, onSend, onKeyDown, onAttach, onEmoji, onStickers, stickersAvailable = false, nope = '', emojiPop = false, onEmojiPick, stickerPop = false, stickerBase = '', stickerTitle = '', onStickerPick, key } = {}) {
    const count = maxLength && value && value.length > 150 ? String(maxLength - value.length) : null;
    const submit = (ta) => {
        const v = ta.value;
        if (!v.trim()) return;
        if (onSend) onSend(v);
        ta.value = '';
        if (onInput) onInput('');
    };
    const ac = acOptions(value, mentions);
    const apply = (insert, root) => {
        if (onInput) onInput(String(value || '').replace(AC_RE, insert + ' '));
        setTimeout(() => { const ta = root && root.querySelector('textarea'); if (ta) ta.focus(); }, 0);
    };
    return h('div', { key, class: 'ds-g3-comp' },
        ac ? h('div', { key: 'ac', class: 'ds-g3-acpop', role: 'listbox' },
            h('div', { class: 'ds-g3-ac-h' }, ac.head),
            ac.items.map((it) => h('div', { key: it.key, class: 'ds-g3-ac-it', role: 'option', onclick: (e) => apply(it.insert, e.currentTarget.closest('.ds-g3-comp')) },
                it.glyph ? h('span', { class: 'ds-g3-ac-glyph' }, it.glyph) : null, it.label, it.small ? h('small', {}, it.small) : null))) : null,
        emojiPop ? h('div', { key: 'cpick', class: 'ds-g3-cpick ds-g3-epick' }, EMOJI.map((e) => h('span', { key: e, role: 'button', tabindex: '0', onclick: (ev) => { if (onEmojiPick) onEmojiPick(e); const ta = ev.currentTarget.closest('.ds-g3-comp').querySelector('textarea'); setTimeout(() => ta && ta.focus(), 0); } }, e))) : null,
        stickerPop ? h('div', { key: 'stkpop', class: 'ds-g3-stkpop' },
            h('div', { class: 'ds-g3-stk-h' }, 'Stickers · ' + stickerTitle),
            h('div', { class: 'ds-g3-stkgrid' }, STICKERS.map((x) => h('img', { key: x.id, src: stickerBase + x.id + '.webp', title: x.name, alt: x.name, loading: 'lazy', onclick: () => onStickerPick && onStickerPick(x.id) })))) : null,
        replyTo
            ? h('div', { key: 'rb', class: 'ds-g3-replybar' },
                h('span', {}, 'Replying to ', h('b', {}, replyTo.username || 'someone')),
                h('span', { class: 'ds-g3-replyx', role: 'button', tabindex: '0', 'aria-label': 'cancel reply', onclick: () => onCancelReply && onCancelReply() }, Icon('x', { size: 14 })))
            : null,
        nope ? h('div', { key: 'box', class: 'ds-g3-box ds-g3-nope' }, nope) : h('div', { key: 'box', class: 'ds-g3-box' + (replyTo ? ' ds-g3-box-reply' : '') + (disabled ? ' is-disabled' : '') },
            onAttach
                ? h('label', { key: 'plus', class: 'ds-g3-plus', title: 'Upload a picture' },
                    '+',
                    h('input', { type: 'file', accept: 'image/*', class: 'ds-g3-file', tabindex: '-1', onchange: (e) => { const f = e.target.files; if (f && f.length) onAttach(f); e.target.value = ''; } }))
                : null,
            h('textarea', {
                key: 'ta', rows: 1, maxLength, placeholder, value, disabled: !!disabled, autocomplete: 'off',
                'aria-label': disabled && disabledReason ? 'message input: ' + disabledReason : 'message input',
                oninput: (e) => { if (onInput) onInput(e.target.value); },
                onkeydown: (e) => {
                    if (onKeyDown) onKeyDown(e, e.target);
                    if (e.defaultPrevented) return;
                    if (e.key === 'Tab' && ac && !e.shiftKey) { e.preventDefault(); apply(ac.items[0].insert, e.target.closest('.ds-g3-comp')); return; }
                    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
                        e.preventDefault();
                        submit(e.target);
                    }
                },
            }),
            count ? h('span', { key: 'cc', class: 'ds-g3-cc', 'aria-live': 'off' }, count) : null,
            h('span', { key: 'st', class: 'ds-g3-compbtn' + (stickersAvailable ? '' : ' is-unavailable'), role: 'button', tabindex: stickersAvailable ? '0' : '-1', 'aria-disabled': stickersAvailable ? 'false' : 'true', title: stickersAvailable ? 'Stickers' : 'No sticker catalogue is available yet', onclick: stickersAvailable && onStickers ? (e) => onStickers(e) : null }, Icon('ref-sticker', { size: 22 })),
            h('span', { key: 'em', class: 'ds-g3-compbtn', role: 'button', tabindex: '0', title: 'Emoji', onclick: (e) => onEmoji && onEmoji(e) }, Icon('ref-emoji', { size: 24 }))
        ),
        h('div', { key: 'typ', class: 'ds-g3-typ' }, typing)
    );
}
