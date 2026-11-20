import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

function EventCard({ key, event, now }) {
    const live = event.at <= now;
    return h('div', { key, class: 'ds-g3-ev' },
        live
            ? h('span', { key: 'live', class: 'ds-g3-evlive' }, 'LIVE NOW')
            : h('div', { key: 'when', class: 'ds-g3-evt' }, new Date(event.at).toLocaleString()),
        h('h3', { key: 't', class: 'ds-g3-evtitle' }, event.title || 'Untitled event'),
        event.location ? h('p', { key: 'l', class: 'ds-g3-evabout' }, event.location) : null);
}

export function Game3EventsPanel({ events = [], now = Date.now(), emptyText = 'no events yet.', onClose } = {}) {
    const sorted = [...events].sort((a, b) => a.at - b.at);
    return h('div', { class: 'ds-g3-evm' },
        h('div', { class: 'ds-g3-evh' },
            h('b', { class: 'ds-g3-evt2' }, Icon('calendar', { size: 18 }), 'Events'),
            onClose ? h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close events', onclick: onClose }, Icon('x', { size: 14 })) : null),
        h('div', { class: 'ds-g3-evl' },
            sorted.length
                ? sorted.map((e, i) => EventCard({ key: e.id || ('e' + i), event: e, now }))
                : h('div', { class: 'ds-g3-empty' }, emptyText)));
}
