import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';
import { STATUS } from '../game3-data.js';

const h = webjsx.createElement;

export function Game3UserPanel({ name = 'You', color = 'var(--accent)', statusLabel = '', statusColor = '#23a55a', muted = false, onProfile, onMute, onSettings, menu = null } = {}) {
    const initial = String(name || '?').trim().slice(0, 1).toUpperCase();
    return h('div', { class: 'ds-g3-me' },
        ...(menu ? [menu] : []),
        h('div', { class: 'ds-g3-mebtn', role: 'button', tabindex: '0', 'aria-haspopup': 'menu', onclick: onProfile || null },
            h('div', { class: 'ds-g3-meav', style: '--ds-g3-av-color:' + color },
                initial,
                h('span', { class: 'ds-g3-medot', style: '--ds-g3-dot-color:' + statusColor, 'aria-hidden': 'true' })),
            h('div', { class: 'ds-g3-mentext' },
                h('div', { class: 'ds-g3-men' }, name),
                statusLabel ? h('div', { class: 'ds-g3-mes' }, statusLabel) : null)),
        h('button', { type: 'button', class: 'ds-g3-ibtn' + (muted ? ' red' : ''), title: muted ? 'Unmute' : 'Mute', 'aria-label': muted ? 'unmute microphone' : 'mute microphone', 'aria-pressed': muted ? 'true' : 'false', onclick: onMute },
            Icon(muted ? 'g3-micoff' : 'g3-mic', { size: 20 })),
        h('button', { type: 'button', class: 'ds-g3-ibtn', title: 'User Settings', 'aria-label': 'user settings', onclick: onSettings },
            Icon('g3-gear', { size: 20 })));
}

export function Game3StatusMenu({ status = 'online', custom = '', onStatus, onCustom } = {}) {
    return h('div', { key: 'smenu', class: 'ds-g3-statusmenu', role: 'menu' },
        h('input', { key: 'cst', class: 'ds-g3-cst', maxlength: '60', placeholder: '😀 Set a custom status, Enter saves', value: custom, onkeydown: (e) => { if (e.key === 'Enter' && onCustom) onCustom(e.target.value); } }),
        ...(custom ? [h('div', { key: 'clr', role: 'menuitem', tabindex: '0', onclick: () => onCustom && onCustom('') }, '✕ Clear custom status')] : []),
        ...Object.entries(STATUS).map(([k, [n, c]]) => h('div', { key: k, role: 'menuitem', tabindex: '0', class: k === status ? 'ds-g3-on' : '', onclick: () => onStatus && onStatus(k) }, h('i', { style: 'background:' + c }), n)));
}
