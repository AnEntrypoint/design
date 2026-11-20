import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3RecapPanel({ items = [], emptyText = '' } = {}) {
    const count = items.length;
    return h('div', { class: 'ds-g3-aip' },
        h('div', { class: 'ds-g3-aih' },
            h('b', {}, '👋 While you were away' + (count ? ' · ' + count + ' new' : '')),
            h('span', { class: 'ds-g3-aiv' }, 'only you can see this')),
        count
            ? h('div', { class: 'ds-g3-aitx' }, items.map((r, i) => h('div', { key: r.id || i, class: 'ds-g3-airow' },
                h('b', {}, r.name || 'user'),
                h('span', {}, ': ' + (r.content || '')))))
            : h('div', { class: 'ds-g3-aitx ds-g3-aiempty' }, emptyText));
}
