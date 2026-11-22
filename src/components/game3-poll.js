import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3PollCard({ question = '', options = [], counts = [], total = 0, mine = -1, onVote } = {}) {
    return h('div', { class: 'ds-g3-pollcard' },
        h('div', { key: 'q', class: 'ds-g3-pollq' }, '📊 ' + question),
        ...options.map((o, i) => {
            const n = counts[i] || 0;
            const pct = total ? Math.round(n * 100 / total) : 0;
            const isMine = mine === i;
            return h('div', {
                key: 'o' + i, class: 'ds-g3-pollo' + (isMine ? ' mine' : ''), role: 'button', tabindex: '0',
                onclick: () => onVote && onVote(i),
            },
                h('div', { class: 'ds-g3-pollf', style: 'width:' + pct + '%' }),
                h('span', {}, (isMine ? '✓ ' : '') + o),
                h('b', {}, n + ' · ' + pct + '%'));
        }),
        h('div', { key: 't', class: 'ds-g3-pollt' }, total + ' vote' + (total === 1 ? '' : 's') + ' · press an answer to vote, again to take it back'));
}
