import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3DayDivider({ label = '', key } = {}) {
    return h('div', { key, class: 'ds-g3-day', role: 'separator' }, h('span', {}, label));
}
