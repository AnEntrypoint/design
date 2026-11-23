import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvatarFont, game3AvInitial } from './game3-hue.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;
const DOT = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };

export function Game3PeopleHere({ serverName = '', people = [], onMessage } = {}) {
    return h('div', { class: 'ds-g3-people' },
        h('div', { class: 'ds-g3-people-head' },
            h('span', { class: 'ds-g3-people-ic', 'aria-hidden': 'true' }, Icon('ref-members', { size: 20 })),
            h('span', { class: 'ds-g3-people-t' }, 'People here'),
            h('span', { class: 'ds-g3-people-tp' }, 'everyone in ' + serverName + ' right now')),
        h('div', { class: 'ds-g3-people-body' },
            h('h4', { key: 'h' }, 'Online — ' + people.length),
            ...(people.length
                ? people.map((p) => h('div', { key: p.id, class: 'ds-g3-prow' },
                    h('span', { class: 'ds-g3-pwrap' },
                        h('span', { class: 'ds-g3-pav', style: 'background:' + game3AvatarBg(p.name, p.id) + ';font-size:' + game3AvatarFont(32) }, game3AvInitial((p.name || '?').slice(0, 1).toUpperCase(), p.id)),
                        h('span', { class: 'ds-g3-pdot', style: '--ds-g3-dot-color:' + (DOT[p.status] || DOT.online), 'aria-label': p.status })),
                    h('div', { class: 'ds-g3-pinfo' },
                        h('div', { class: 'ds-g3-pname' }, p.name),
                        h('div', { class: 'ds-g3-psub' }, p.activity)),
                    h('button', { type: 'button', class: 'ds-g3-pmsg', 'aria-label': 'message ' + p.name, title: 'Message', onclick: () => onMessage && onMessage(p.id) }, Icon('forum', { size: 18 }))))
                : [h('p', { key: 'none', class: 'ds-g3-hint' }, 'Only you for now.')])));
}
