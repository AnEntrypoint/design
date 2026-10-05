
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function Collapse({ title, expanded = false, onToggle, children, key } = {}) {
    return h('div', { key, class: 'ds-ep-collapse' + (expanded ? ' is-expanded' : '') },
        h('button', {
            type: 'button', class: 'ds-ep-collapse-head',
            'aria-expanded': expanded ? 'true' : 'false',
            onclick: () => { if (onToggle) onToggle(!expanded); },
        },
            h('span', { class: 'ds-ep-collapse-chevron' }, expanded ? 'v' : '>'),
            h('span', { class: 'ds-ep-collapse-title' }, title)),
        expanded ? h('div', { class: 'ds-ep-collapse-body' }, children) : null);
}

export function CollapseGroup({ items = [], openId, onOpenChange, accordion = false, key } = {}) {
    return h('div', { key, class: 'ds-ep-collapse-group' },
        ...items.map((it) => Collapse({
            key: it.id,
            title: it.title,
            expanded: accordion ? it.id === openId : Boolean(it.expanded),
            onToggle: (next) => {
                if (!onOpenChange) return;
                if (accordion) onOpenChange(next ? it.id : null);
                else onOpenChange(it.id, next);
            },
            children: it.children,
        })));
}
