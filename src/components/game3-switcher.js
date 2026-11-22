import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3Switcher({ query = '', items = [], onQuery, onPick, onClose, key } = {}) {
    return h('div', { key, class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget && onClose) onClose(); } },
        h('div', { class: 'ds-g3-sw', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search for servers, channels or DMs' },
            h('div', { class: 'ds-g3-swt' }, 'Search for servers, channels or DMs'),
            h('input', {
                type: 'text', class: 'ds-g3-swin', placeholder: 'Where would you like to go?', value: query,
                oninput: (e) => onQuery && onQuery(e.target.value),
                onkeydown: (e) => {
                    if (e.key === 'Enter' && items[0] && onPick) onPick(items[0]);
                    else if (e.key === 'Escape' && onClose) onClose();
                },
            }),
            h('div', { class: 'ds-g3-swl' }, items.length
                ? items.map((x, i) => h('div', { key: 'i' + i + x.label, class: 'ds-g3-swi', role: 'button', tabindex: '0', onclick: () => onPick && onPick(x) }, x.label, h('small', {}, x.hint)))
                : h('div', { class: 'ds-g3-swempty' }, 'nothing matches')),
            h('div', { class: 'ds-g3-swtip' }, 'PROTIP: start with # for channels or @ for people \u00b7 Ctrl P opens this anywhere')));
}
