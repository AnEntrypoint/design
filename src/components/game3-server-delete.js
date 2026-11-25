import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

let opener = null;

export function Game3ServerDelete({ name = '', onDelete, onClose } = {}) {
    if (!opener && typeof document !== 'undefined') opener = document.activeElement;
    const close = () => {
        const back = opener;
        opener = null;
        if (onClose) onClose();
        if (back && back.focus) setTimeout(() => { if (back.isConnected) back.focus(); }, 0);
    };
    const sync = (e) => {
        const root = e.currentTarget.closest('.ds-g3-evm');
        root.querySelector('.ds-g3-evb-danger').classList.toggle('ds-g3-evb-off', e.currentTarget.value.trim() !== name);
        root.querySelector('.ds-g3-evb-danger').setAttribute('aria-disabled', String(e.currentTarget.value.trim() !== name));
    };
    const submit = (e) => {
        const root = e.currentTarget.closest('.ds-g3-evm');
        const typed = root.querySelector('input').value.trim();
        if (typed !== name) return;
        opener = null;
        if (onDelete) onDelete(typed);
    };
    return h('div', {
        key: 'server-delete',
        class: 'ds-g3-scrim',
        role: 'presentation',
        'data-own-escape': '1',
        onclick: (e) => { if (e.target === e.currentTarget) close(); },
        onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } },
    },
        h('div', { class: 'ds-g3-evm', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Delete ' + name },
            h('div', { class: 'ds-g3-evh' },
                h('b', null, 'Delete ' + name),
                h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: close, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); close(); } } }, Icon('x', { size: 14 }))),
            h('div', { class: 'ds-g3-evl ds-g3-sform' },
                h('p', { class: 'ds-g3-sub' }, 'This deletes the server for everyone. Every member loses it on their next sync, it can no longer be posted to or joined, and its Discover listing and invites stop working. Your own messages and settings in it are retracted.'),
                h('p', { class: 'ds-g3-sub' }, 'Relays are independent servers. Some may keep old messages and this cannot be undone or forced.'),
                h('div', { class: 'ds-g3-lbl' }, 'Type the server name to confirm'),
                h('input', {
                    placeholder: name, maxlength: '32', autocomplete: 'off', 'aria-label': 'type ' + name + ' to confirm',
                    oninput: sync,
                    onkeydown: (e) => { if (e.key === 'Enter') submit(e); },
                    ref: (el) => { if (el && !el.dataset.focused) { el.dataset.focused = '1'; setTimeout(() => el.focus(), 0); } },
                }),
                h('div', { class: 'ds-g3-evb ds-g3-evb-danger ds-g3-evb-big ds-g3-evb-off', role: 'button', tabindex: '0', 'aria-disabled': 'true', onclick: submit, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); submit(e); } } }, 'Delete server for everyone'),
                h('div', { class: 'ds-g3-evb ds-g3-evb-big', role: 'button', tabindex: '0', onclick: close, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } } }, 'Cancel'))));
}
