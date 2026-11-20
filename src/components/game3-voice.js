import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3VoiceView({ participants = [], micMuted = false, textName = 'general', onText, onMic, onLeave, sounds = [], onSound } = {}) {
    const tiles = participants.map((p, i) => {
        const initial = String(p.name || '?').trim().slice(0, 1).toUpperCase();
        return h('div', {
            key: p.id || ('p' + i),
            class: 'ds-g3-vtile' + (p.speaking ? ' talk' : ''),
            style: '--ds-g3-tile-color:' + (p.color || 'var(--accent)'),
        },
            h('div', { class: 'ds-g3-vav' }, initial),
            h('span', { class: 'ds-g3-vnm' }, p.name || p.id),
            p.muted ? h('span', { class: 'ds-g3-vmo', 'aria-label': 'muted' }, Icon('g3-micoff', { size: 16 })) : null);
    });
    return h('div', { class: 'ds-g3-voice' },
        h('div', { class: 'ds-g3-tiles' }, tiles),
        h('div', { class: 'ds-g3-sboard' }, sounds.map((s) => h('span', { key: s.id, role: 'button', tabindex: '0', onclick: () => onSound && onSound(s.id) }, s.e + ' ' + s.name))),
        h('div', { class: 'ds-g3-vctl' },
            h('div', { class: 'ds-g3-vchat is-disabled', title: 'No radio stream is available yet', 'aria-disabled': 'true' }, '📻 Lofi radio'),
            h('div', { class: 'ds-g3-vchat', role: 'button', tabindex: '0', onclick: onText }, '💬 #' + textName),
            h('button', { type: 'button', class: 'ds-g3-vcbtn' + (micMuted ? ' off' : ''), title: micMuted ? 'Unmute' : 'Mute', 'aria-label': micMuted ? 'unmute microphone' : 'mute microphone', 'aria-pressed': micMuted ? 'true' : 'false', onclick: onMic },
                Icon(micMuted ? 'g3-micoff' : 'g3-mic', { size: 26 })),
            h('button', { type: 'button', class: 'ds-g3-vcbtn ds-g3-vhang', title: 'Disconnect', 'aria-label': 'disconnect from voice', onclick: onLeave },
                Icon('g3-hangup', { size: 26 }))));
}
