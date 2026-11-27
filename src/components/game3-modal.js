import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3Modal({ title = '', onClose, key } = {}, ...children) {
    return h('div', { key, class: 'ds-g3-evm' },
        h('div', { class: 'ds-g3-evh' },
            h('b', { class: 'ds-g3-evt2' }, title),
            onClose ? h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: onClose }, '✕') : null),
        h('div', { class: 'ds-g3-evl' }, ...children));
}
