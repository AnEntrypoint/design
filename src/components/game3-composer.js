import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3Composer({ typing = null, value = '', placeholder = '', maxLength = 190, disabled = false, disabledReason, replyTo = null, onCancelReply, onInput, onSend, onKeyDown, onAttach, onEmoji, onStickers, stickersAvailable = false, key } = {}) {
    const count = maxLength && value && value.length > 150 ? String(maxLength - value.length) : null;
    const submit = (ta) => {
        const v = ta.value;
        if (!v.trim()) return;
        if (onSend) onSend(v);
        ta.value = '';
        if (onInput) onInput('');
    };
    return h('div', { key, class: 'ds-g3-comp' },
        replyTo
            ? h('div', { key: 'rb', class: 'ds-g3-replybar' },
                h('span', {}, 'Replying to ', h('b', {}, replyTo.username || 'someone')),
                h('span', { class: 'ds-g3-replyx', role: 'button', tabindex: '0', 'aria-label': 'cancel reply', onclick: () => onCancelReply && onCancelReply() }, Icon('x', { size: 14 })))
            : null,
        h('div', { key: 'box', class: 'ds-g3-box' + (replyTo ? ' ds-g3-box-reply' : '') + (disabled ? ' is-disabled' : '') },
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
                    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
                        e.preventDefault();
                        submit(e.target);
                    }
                },
            }),
            count ? h('span', { key: 'cc', class: 'ds-g3-cc', 'aria-live': 'off' }, count) : null,
            h('span', { key: 'st', class: 'ds-g3-compbtn' + (stickersAvailable ? '' : ' is-unavailable'), role: 'button', tabindex: stickersAvailable ? '0' : null, 'aria-disabled': stickersAvailable ? null : 'true', title: stickersAvailable ? 'Stickers' : 'No sticker catalogue is available yet', onclick: stickersAvailable && onStickers ? (e) => onStickers(e) : null }, Icon('image', { size: 22 })),
            h('span', { key: 'em', class: 'ds-g3-compbtn', role: 'button', tabindex: '0', title: 'Emoji', onclick: (e) => onEmoji && onEmoji(e) }, Icon('smile', { size: 22 }))
        ),
        h('div', { key: 'typ', class: 'ds-g3-typ' }, typing)
    );
}
