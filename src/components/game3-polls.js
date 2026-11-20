import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;
const POLL_MARK = '📊';

export function Game3PollsPanel({ polls = [], emptyText = 'No polls in this channel yet.', key } = {}) {
    if (!polls.length) return h('div', { key, class: 'ds-g3-empty', role: 'status' }, emptyText);
    return h('div', { key, class: 'ds-g3-plist' },
        polls.map((p, i) => h('div', { key: p.id || ('p' + i), class: 'ds-g3-poll' },
            h('div', { key: 'q', class: 'ds-g3-pq' }, POLL_MARK + ' ' + p.question),
            ...p.options.map((o, j) => h('div', { key: 'o' + j, class: 'ds-g3-po' }, h('span', {}, o))),
            h('div', { key: 't', class: 'ds-g3-pt' }, 'Votes are not counted by this client yet.'))));
}
