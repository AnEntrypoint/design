import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3VoiceBar({ channelName = '', serverName = '', onOpen, onLeave, key } = {}) {
    return h('div', { key, class: 'ds-g3-vbar' },
        h('div', { class: 'ds-g3-vbar-main', role: 'button', tabindex: '0', onclick: () => onOpen && onOpen() },
            h('div', { class: 'ds-g3-vbar-t' }, '📶 Voice Connected'),
            h('div', { class: 'ds-g3-vbar-s' }, channelName + ' / ' + serverName)),
        h('div', { class: 'ds-g3-ibtn', role: 'button', tabindex: '0', title: 'Disconnect', 'aria-label': 'disconnect from voice', onclick: () => onLeave && onLeave() }, Icon('ref-hangup', { size: 24 })));
}
