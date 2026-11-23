import * as webjsx from '../../../vendor/webjsx/index.js';
import { registerModule } from '../registry.js';
import { Icon } from '../../components/shell.js';
import { Game3EventsPanel } from '../../components/game3-events.js';

const h = webjsx.createElement;

registerModule({
    id: 'surface-events', kind: 'surface',
    surface: {
        id: 'events', placement: 'modal',
        rail: { order: 1, row: ({ s, A }) => h('a', { key: 'events', href: '#', class: s.gameSurface === 'events' ? 'active' : '', onclick: (e) => { e.preventDefault(); if (A.openSurface) A.openSurface('events'); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('ref-events', { size: 20 })), h('span', {}, s.eventCount ? s.eventCount + (s.eventCount === 1 ? ' Event' : ' Events') : 'Events'), s.eventLive ? h('span', { class: 'ds-g3-live' }, 'LIVE') : null) },
        body: ({ s, A }) => { const now = Date.now(); return Game3EventsPanel({ onCreate: A.createEvent ? (f) => A.createEvent(f) : null, events: (s.channelEvents || []).filter(e => (e.end || e.start) > now - 3 * 3600e3).map(e => ({ id: e.id, title: e.title, about: e.about, location: e.location, at: e.start, name: e.name, mine: e.mine, count: e.going.length, interested: e.interested })), now, onRsvp: A.rsvpEvent ? (id) => A.rsvpEvent(id) : null, onDelete: A.deleteEvent ? (id) => A.deleteEvent(id) : null, onClose: () => A.closeSurface && A.closeSurface() }); },
    },
});
