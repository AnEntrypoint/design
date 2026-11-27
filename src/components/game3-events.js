import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;

const localValue = (ms) => {
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
};

function EventCard({ key, event, now, onRsvp, onDelete }) {
    const live = event.at <= now;
    return h('div', { key, class: 'ds-g3-ev' },
        live
            ? h('span', { key: 'live', class: 'ds-g3-evlive' }, 'LIVE NOW')
            : h('div', { key: 'when', class: 'ds-g3-evt' }, new Date(event.at).toLocaleString()),
        h('h3', { key: 't', class: 'ds-g3-evtitle' }, event.title || 'Untitled event'),
        event.about ? h('p', { key: 'about', class: 'ds-g3-evabout' }, event.about) : null,
        event.location ? h('p', { key: 'loc', class: 'ds-g3-evabout' }, event.location) : null,
        h('div', { key: 'foot', class: 'ds-g3-evf' },
            h('span', { key: 'by' }, 'by ' + (event.name || 'someone') + ' · ⭐ ' + (event.count || 0) + ' interested'),
            h('span', { key: 'acts' },
                event.mine && onDelete ? h('span', { key: 'cancel', class: 'ds-g3-evb ds-g3-evb-ghost', role: 'button', tabindex: '0', onclick: () => onDelete(event.id) }, 'Cancel') : null,
                onRsvp ? h('span', { key: 'rsvp', class: 'ds-g3-evb' + (event.interested ? ' ds-g3-evb-on' : ''), role: 'button', tabindex: '0', onclick: () => onRsvp(event.id) }, event.interested ? '✓ Interested' : '⭐ Interested') : null)));
}

function EventCreate({ onCreate }) {
    const submit = (e) => {
        const box = e.currentTarget.closest('.ds-g3-evc');
        const title = box.querySelector('input[data-evt="title"]').value.trim();
        const about = box.querySelector('input[data-evt="about"]').value;
        const at = Date.parse(box.querySelector('input[data-evt="when"]').value);
        if (title && Number.isFinite(at) && onCreate) onCreate({ title, about, at });
    };
    return h('div', { key: 'create', class: 'ds-g3-evc' },
        h('div', { key: 'lbl', class: 'ds-g3-evlbl' }, 'Create Event'),
        h('input', { key: 'title', maxlength: '60', placeholder: 'what\'s happening? (movie night, tournament…)', 'data-evt': 'title' }),
        h('input', { key: 'about', maxlength: '120', placeholder: 'details (optional)', 'data-evt': 'about' }),
        h('div', { key: 'row', class: 'ds-g3-evrow' },
            h('input', { key: 'when', type: 'datetime-local', value: localValue(Date.now() + 3600e3), 'data-evt': 'when' }),
            h('span', { key: 'go', class: 'ds-g3-evb ds-g3-evb-on', role: 'button', tabindex: '0', onclick: submit }, 'Schedule')));
}

export function Game3EventsPanel({ events = [], now = Date.now(), emptyText = 'no events yet. make the first one below.', onClose, onCreate, onRsvp, onDelete } = {}) {
    const sorted = [...events].sort((a, b) => a.at - b.at);
    return h('div', { class: 'ds-g3-evm' },
        h('div', { class: 'ds-g3-evh' },
            h('b', { class: 'ds-g3-evt2' }, Icon('ref-events', { size: 18 }), 'Events'),
            onClose ? h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close events', onclick: onClose }, '✕') : null),
        h('div', { class: 'ds-g3-evl' },
            sorted.length
                ? sorted.map((e, i) => EventCard({ key: e.id || ('e' + i), event: e, now, onRsvp, onDelete }))
                : h('div', { class: 'ds-g3-empty' }, emptyText)),
        onCreate ? EventCreate({ onCreate }) : null);
}
