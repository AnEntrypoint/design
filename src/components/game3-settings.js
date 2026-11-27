import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

const GAME3_PANES = new Set(['account', 'profile', 'appearance', 'access', 'voice', 'notif', 'media', 'lang', 'keys', 'adv']);

const groupPanes = (panes) => panes.reduce((groups, p) => {
    const found = groups.find(([head]) => head === p.group);
    if (found) found[1].push(p); else groups.push([p.group, [p]]);
    return groups;
}, []);

export function Game3SettingsPanel({ tab = 'account', onTab, onClose, panes = [], ...ctx } = {}) {
    const groups = groupPanes(panes);
    const active = panes.find((p) => p.id === tab) || panes.find((p) => p.id === 'account');
    return h('div', { class: 'ds-g3-set', role: 'dialog', 'aria-label': 'settings' },
        h('div', { class: 'ds-g3-set-nav' },
            h('div', null,
                groups.map(([head, list]) => [
                    h('h5', { key: 'h' + head, class: list.every((p) => !GAME3_PANES.has(p.id)) ? 'ds-g3-zx' : '' }, head),
                    ...list.map((p) => h('p', { key: p.id, class: (p.id === tab ? 'on' : '') + (GAME3_PANES.has(p.id) ? '' : ' ds-g3-zx'), role: 'button', tabindex: '0', onclick: () => onTab && onTab(p.id) }, p.label)),
                ]))),
        h('div', { class: 'ds-g3-set-pane' },
            h('select', { key: 'setm', class: 'ds-g3-langsel ds-g3-setm', 'aria-label': 'settings section', onchange: (e) => onTab && onTab(e.target.value) }, panes.map((p) => h('option', { key: p.id, value: p.id, selected: p.id === tab }, p.label))),
            ...(active ? active.mount({ ...ctx, tab, onTab, onClose }) : [])),
        h('div', { class: 'ds-g3-set-close', role: 'button', tabindex: '0', 'aria-label': 'close settings', onclick: () => onClose && onClose() }, '✕'));
}
