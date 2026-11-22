import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3NewBar({ count = 0, since = '', onJump, onRead, key } = {}) {
    return h('div', { key, class: 'ds-g3-newbar-wrap' },
        h('div', { class: 'ds-g3-newbar', role: 'button', tabindex: '0', onclick: () => onJump && onJump() },
            h('span', {}, count + ' new', h('i', { class: 'ds-g3-nbx' }, ' message' + (count === 1 ? '' : 's') + ' since ' + (since || 'you last looked'))),
            onRead ? h('span', {}, h('b', { role: 'button', tabindex: '0', onclick: (e) => { e.stopPropagation(); onRead(); } }, 'Mark As Read \u2713')) : null));
}
