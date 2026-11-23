import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3VoiceView({ participants = [], micMuted = false, camera = false, textName = 'general', onText, onMic, onCamera, onOpenProfile, onLeave, sounds = [], onSound, soundToast = null, voiceName = '', radioOn = false, onRadio } = {}) {
    const tiles = participants.map((p, i) => {
        const initial = String(p.name || '?').trim().slice(0, 1).toUpperCase();
        return h('div', {
            key: p.id || ('p' + i),
            class: 'ds-g3-vtile' + (p.speaking ? ' talk' : ''),
            role: onOpenProfile ? 'button' : null,
            tabindex: onOpenProfile ? '0' : null,
            onclick: onOpenProfile ? () => onOpenProfile(p) : null,
            style: '--ds-g3-tile-color:' + (p.color || 'var(--accent)'),
        },
            p.videoKey ? h('video', { class: 'ds-g3-vvideo', 'data-video-peer': p.videoKey, autoplay: true, playsinline: true, muted: !!p.isLocal }) : h('div', { class: 'ds-g3-vav' }, initial),
            h('span', { class: 'ds-g3-vnm' }, p.name || p.id),
            p.muted ? h('span', { class: 'ds-g3-vmo', 'aria-label': 'muted' }, Icon('g3-micoff', { size: 16 })) : null);
    });
    return h('div', { class: 'ds-g3-voice' },
        soundToast ? h('div', { key: 'vt', class: 'ds-g3-vtoast', role: 'status' }, soundToast.e + ' ' + soundToast.who + ' played ', h('b', {}, soundToast.name)) : null,
        h('div', { class: 'ds-g3-tiles' }, tiles),
        h('div', { class: 'ds-g3-sboard' }, sounds.map((s) => h('span', { key: s.id, role: 'button', tabindex: '0', onclick: () => onSound && onSound(s.id) }, s.e + ' ' + s.name))),
        radioOn ? h('div', { key: 'radio-on', class: 'ds-g3-radio-on', role: 'status' }, '📻 lofi radio is playing in ' + voiceName + ' ', h('span', { class: 'ds-g3-eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'))) : null,
        h('div', { class: 'ds-g3-vctl' },
            h('div', { class: 'ds-g3-vchat' + (radioOn ? ' lit' : ''), role: 'button', tabindex: '0', 'aria-pressed': radioOn ? 'true' : 'false', onclick: onRadio, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRadio && onRadio(); } } }, '📻 ' + (radioOn ? 'Stop radio' : 'Lofi radio')),
            h('div', { class: 'ds-g3-vchat', role: 'button', tabindex: '0', onclick: onText }, '💬 #' + textName),
            h('button', { type: 'button', class: 'ds-g3-vcbtn' + (camera ? ' on' : ''), title: camera ? 'Turn camera off' : 'Turn camera on', 'aria-label': camera ? 'turn camera off' : 'turn camera on', 'aria-pressed': camera ? 'true' : 'false', onclick: onCamera },
                Icon('g3-camera', { size: 26 })),
            h('button', { type: 'button', class: 'ds-g3-vcbtn' + (micMuted ? ' off' : ''), title: micMuted ? 'Unmute' : 'Mute', 'aria-label': micMuted ? 'unmute microphone' : 'mute microphone', 'aria-pressed': micMuted ? 'true' : 'false', onclick: onMic },
                Icon(micMuted ? 'ref-micoff' : 'ref-mic', { size: 26 })),
            h('button', { type: 'button', class: 'ds-g3-vcbtn ds-g3-vhang', title: 'Disconnect', 'aria-label': 'disconnect from voice', onclick: onLeave },
                Icon('ref-hangup', { size: 26 }))),
        h('div', { key: 'vtip', class: 'ds-g3-vtip' }, 'your mic is in the controls below · only people in ' + voiceName + ' hear you · the soundboard plays for everyone in here'));
}
