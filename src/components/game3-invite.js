import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

const ini = (nm) => String(nm || '').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();

export function Game3InviteCard({ name = '', color = '#5865f2', valid = true, online = null, members = null, joined = false, onJoin, key } = {}) {
    if (!valid) {
        return h('div', { key, class: 'ds-g3-inv ds-g3-inv-dead' },
            h('div', { class: 'ds-g3-inv-ih' }, 'An invite to a server'),
            h('div', { class: 'ds-g3-inv-ib' },
                h('div', { class: 'ds-g3-inv-dico', style: 'background:#4e5058' }, '✕'),
                h('div', {}, h('h3', {}, 'Invite expired'), h('p', {}, "this server isn't here anymore"))));
    }
    const counts = members == null ? null : [
        h('i', { key: 'd1', class: 'ds-g3-inv-dot ds-g3-inv-dot-g' }), (online || 0) + ' Online ',
        h('i', { key: 'd2', class: 'ds-g3-inv-dot' }), members + ' Member' + (members === 1 ? '' : 's'),
    ];
    return h('div', { key, class: 'ds-g3-inv' },
        h('div', { class: 'ds-g3-inv-ih' }, "You've been invited to join a server"),
        h('div', { class: 'ds-g3-inv-ib' },
            h('div', { class: 'ds-g3-inv-dico', style: 'background:' + color }, ini(name)),
            h('div', {}, h('h3', {}, name), counts ? h('p', {}, ...counts) : null),
            h('span', { class: 'ds-g3-evb' + (joined ? '' : ' ds-g3-evb-on'), role: 'button', tabindex: '0', onclick: () => onJoin && onJoin() }, joined ? 'Joined' : 'Join')));
}
