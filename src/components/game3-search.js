import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3SearchBar({ count = 0, query = '', onClear, key } = {}) {
    return h('div', { key, class: 'ds-g3-sres' },
        h('span', {}, count + ' result' + (count === 1 ? '' : 's') + ' for “' + query + '”'),
        h('span', { class: 'ds-g3-sres-clear', role: 'button', tabindex: '0', onclick: () => onClear && onClear() }, '✕ clear'));
}
