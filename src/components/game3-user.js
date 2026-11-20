import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3UserPanel({ name = 'You', color = 'var(--accent)', statusLabel = '', statusColor = '#23a55a', muted = false, onProfile, onMute, onSettings } = {}) {
    const initial = String(name || '?').trim().slice(0, 1).toUpperCase();
    return h('div', { class: 'ds-g3-me' },
        h('div', { class: 'ds-g3-mebtn', role: 'button', tabindex: '0', onclick: onProfile || null },
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
