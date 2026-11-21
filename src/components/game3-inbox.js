import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3InboxPanel({ tab = 'mentions', onTab, rows = [], saved = [], onClose } = {}) {
    const list = tab === 'saved' ? saved : rows;
    return h('div', { class: 'ds-g3-inbox' },
        h('div', { class: 'ds-g3-inbox-head' },
            h('h2', null, 'Inbox'),
            h('span', { class: 'ds-g3-inbox-tab' + (tab === 'mentions' ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onTab && onTab('mentions') }, 'Mentions'),
            h('span', { class: 'ds-g3-inbox-tab' + (tab === 'saved' ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onTab && onTab('saved') }, 'Saved'),
            h('span', { class: 'ds-g3-inbox-close', role: 'button', tabindex: '0', 'aria-label': 'close inbox', onclick: () => onClose && onClose() }, '✕')),
        list.length
            ? list.map((r) => h('div', { key: r.id, class: 'ds-g3-inbox-row' },
                h('div', { class: 'ds-g3-inbox-who' }, r.who),
                h('div', { class: 'ds-g3-inbox-txt' }, r.text)))
            : h('p', { class: 'ds-g3-inbox-empty' }, tab === 'saved' ? 'Nothing saved yet.' : 'No mentions yet.'));
}
