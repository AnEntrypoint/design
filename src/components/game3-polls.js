import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;
const POLL_MARK = '📊';

export function Game3PollsPanel({ polls = [], emptyText = 'No polls in this channel yet.', onVote, key } = {}) {
    if (!polls.length) return h('div', { key, class: 'ds-g3-empty', role: 'status' }, emptyText);
    return h('div', { key, class: 'ds-g3-plist' },
        polls.map((p, i) => {
            const total = p.total || 0;
            return h('div', { key: p.id || ('p' + i), class: 'ds-g3-poll' },
                h('div', { key: 'q', class: 'ds-g3-pq' }, POLL_MARK + ' ' + p.question),
                ...p.options.map((o, j) => {
                    const n = (p.counts && p.counts[j]) || 0;
                    const pct = total ? Math.round(n * 100 / total) : 0;
                    const mine = p.mine === j;
                    return h('div', { key: 'o' + j, class: 'ds-g3-po' + (mine ? ' ds-g3-po-mine' : ''), role: 'button', tabindex: '0', onclick: () => onVote && onVote(p.id, j) },
                        h('div', { key: 'fill', class: 'ds-g3-pf', style: 'width:' + pct + '%' }),
                        h('span', { key: 'label' }, (mine ? '✓ ' : '') + o),
                        h('b', { key: 'count' }, n + ' · ' + pct + '%'));
                }),
                h('div', { key: 't', class: 'ds-g3-pt' }, total + ' vote' + (total === 1 ? '' : 's') + ' · press an answer to vote, again to take it back'));
        }));
}
