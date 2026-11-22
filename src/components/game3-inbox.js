import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3InboxTabs({ tab = 'mentions', onTab, savedCount = 0 } = {}) {
    return [
        h('span', { key: 'tm', class: 'ds-g3-itab' + (tab === 'mentions' ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onTab && onTab('mentions') }, 'Mentions'),
        h('span', { key: 'ts', class: 'ds-g3-itab' + (tab === 'saved' ? ' on' : ''), role: 'button', tabindex: '0', onclick: () => onTab && onTab('saved') }, 'Saved' + (savedCount ? ' ' + savedCount : '')),
    ];
}

export function Game3InboxPanel({ tab = 'mentions', rows = [], saved = [] } = {}) {
    const list = tab === 'saved' ? saved : rows;
    return h('div', { class: 'ds-g3-inbox' },
        list.length
            ? list.map((r) => h('div', { key: r.id, class: 'ds-g3-pi' },
                h('div', { class: 'ds-g3-pi-chn' }, r.who),
                r.text))
            : h('p', { class: 'ds-g3-inbox-empty' }, tab === 'saved' ? 'Nothing saved yet.' : 'No mentions yet.'));
}
