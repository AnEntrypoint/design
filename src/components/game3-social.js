import * as webjsx from '../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function PinList({ pins = [], emptyText = '', onJump, key } = {}) {
    if (!pins.length) return h('div', { key, class: 'ds-g3-empty' }, emptyText, h('br', null), 'hover a message and press the pin');
    return h('div', { key, class: 'ds-g3-pins' },
        h('h2', null, 'Pinned Messages'),
        h('ul', null, ...pins.map((p) => h('li', { key: p.id, class: 'ds-g3-pin', onclick: () => onJump && onJump(p.id) },
            h('b', { key: 'n', class: 'ds-g3-pin-name' }, p.name),
            h('span', { key: 'c', class: 'ds-g3-pin-text' }, p.content)))));
}

export function AnnouncementList({ items = [], emptyText = '', key } = {}) {
    if (!items.length) return h('p', { key, class: 'ds-g3-empty' }, emptyText);
    return h('ul', { key, class: 'ds-g3-announcements' }, ...items.map((a) => h('li', { key: a.id, class: 'ds-g3-announcement' },
        h('span', { key: 'n', class: 'ds-g3-announcement-name' }, a.name),
        h('span', { key: 'c', class: 'ds-g3-announcement-text' }, a.content)
    )));
}

export function RoleList({ roles = [], emptyText = '', key } = {}) {
    if (!roles.length) return h('p', { key, class: 'ds-g3-empty' }, emptyText);
    return h('ul', { key, class: 'ds-g3-roles' }, ...roles.map((r) => h('li', { key: r.id, class: 'ds-g3-role' },
        h('span', { key: 'l', class: 'ds-g3-role-label' }, r.label),
        h('span', { key: 'c', class: 'ds-g3-role-count' }, String(r.count))
    )));
}

export function DiscoverList({ servers = [], emptyText = '', onOpen, key } = {}) {
    if (!servers.length) return h('p', { key, class: 'ds-g3-empty' }, emptyText);
    return h('div', { key, class: 'ds-g3-discover' }, ...servers.map((sv) => h('div', { key: sv.id, class: 'ds-g3-ev ds-g3-disc' },
        h('div', { key: 'i', class: 'ds-g3-dico', style: 'background:' + (sv.color || '#5865f2'), 'aria-hidden': 'true' }, (sv.name || '?').slice(0, 1).toUpperCase()),
        h('div', { key: 't', class: 'ds-g3-discover-txt' },
            h('h3', { key: 'n' }, sv.name),
            h('p', { key: 'm' }, sv.members != null ? sv.members + ' member' + (sv.members === 1 ? '' : 's') + ' \u00b7 ' + (sv.online || 0) + ' online \u00b7 by ' + (sv.owner || 'nobody') : 'details load when you open this server'),
            sv.channels ? h('p', { key: 'c', class: 'ds-g3-discover-ch' }, sv.channels.map((c) => '#' + c).join(' ')) : null),
        h('span', { key: 'b', class: 'ds-g3-evb', role: 'button', tabindex: '0', onclick: () => onOpen && onOpen(sv.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen && onOpen(sv.id); } } }, 'Open'))));
}
