import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3NewDivider({ key } = {}) {
    return h('div', { key, class: 'ds-g3-newdiv', id: 'newline' }, h('span', {}, 'NEW'));
}
