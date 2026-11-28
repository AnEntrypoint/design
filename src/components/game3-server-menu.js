import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

export function Game3ServerMenu({ items = [], onPick, key } = {}) {
    const row = (it, i) => h('div', { key: 'it' + i, role: 'menuitem', tabindex: '0', 'data-surface': it.surface || null, style: it.color ? 'color:' + it.color : null, onclick: () => { if (onPick) onPick(); if (it.onClick) it.onClick(); } },
        h('span', { class: 'ds-g3-smenu-l' }, it.label),
        it.icon ? h('span', { class: 'ds-g3-smenu-i' }, Icon(it.icon, { size: 18 })) : (it.hint ? h('span', { class: 'ds-g3-smenu-h' }, it.hint) : null));
    const extra = items.filter((it) => it.surface);
    return h('div', { key, class: 'ds-g3-smenu', role: 'menu' },
        ...items.map((it, i) => it.surface ? null : (it.divider ? h('hr', { key: 'hr' + i }) : row(it, i))).filter(Boolean),
        extra.length ? h('div', { key: 'extra', class: 'ds-g3-smenu-z', 'data-surface': 'zellous' }, ...extra.map((it, i) => row(it, 'z' + i))) : null);
}
