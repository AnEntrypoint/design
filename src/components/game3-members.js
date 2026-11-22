import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvatarFont } from './game3-hue.js';

const h = webjsx.createElement;
const DOT = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };

export function Game3MemberRow({ identity, name, color, nameColor, status = 'online', suffix, activity, offline = false, onClick, key } = {}) {
    const initial = String(name || identity || '?').trim().slice(0, 1).toUpperCase();
    const dot = DOT[status] || DOT.online;
    return h('div', {
        key, class: 'ds-g3-mrow' + (offline ? ' ds-g3-off' : ''),
        role: onClick ? 'button' : null, tabindex: onClick ? '0' : null,
        onclick: onClick || null,
        onkeydown: onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : null,
    },
        h('div', { class: 'ds-g3-mav', style: '--ds-g3-av-color:' + game3AvatarBg(name || identity) + ';font-size:' + game3AvatarFont(32) },
            initial,
            h('span', { class: 'ds-g3-mdot', style: '--ds-g3-dot-color:' + dot, 'aria-label': status })),
        h('div', { class: 'ds-g3-mbody' },
            h('div', { class: 'ds-g3-nm', style: nameColor ? '--ds-g3-nm-color:' + nameColor : null },
                h('span', { class: 'ds-g3-nmtxt' }, name || identity),
                suffix ? h('span', { class: 'ds-g3-msuffix' }, suffix) : null),
            h('div', { class: 'ds-g3-msub' }, activity || '')));
}

export function Game3MemberList({ categories = [], apps = [], open, loading = false, onSelectMember, userId } = {}) {
    const total = categories.reduce((n, cat) => n + (cat.members ? cat.members.length : 0), 0) + apps.length;
    return h('div', { class: 'ds-g3-mem' + (open ? ' open' : '') },
        total === 0
            ? h('div', { key: '_empty', class: 'ds-g3-mempty', role: 'status' }, userId ? 'Only you for now.' : 'no members in this channel yet')
            : null,
        ...categories.filter((cat) => cat.members && cat.members.length && cat.label !== 'Offline').flatMap((cat) => [
            h('div', { key: 'c' + cat.label, class: 'ds-g3-mcat' }, cat.label + ' — ' + cat.members.length),
            ...cat.members.map((m, i) => Game3MemberRow({
                ...m, key: m.identity || ('m' + i),
                offline: cat.label === 'Offline',
                onClick: onSelectMember ? (e) => onSelectMember(m, e) : undefined,
            })),
        ]),
        ...(apps.length ? [
            h('div', { key: 'capps', class: 'ds-g3-mcat' }, 'Apps — ' + apps.length),
            ...apps.map((a) => Game3MemberRow({ key: 'app-' + a.identity, identity: a.identity, name: a.name, color: a.color, nameColor: a.color, suffix: '✓ APP', activity: a.activity, status: 'online' })),
        ] : []),
        ...categories.filter((cat) => cat.members && cat.members.length && cat.label === 'Offline').flatMap((cat) => [
            h('div', { key: 'c' + cat.label, class: 'ds-g3-mcat' }, cat.label + ' — ' + cat.members.length),
            ...cat.members.map((m, i) => Game3MemberRow({ ...m, key: m.identity || ('m' + i), offline: true, onClick: onSelectMember ? (e) => onSelectMember(m, e) : undefined })),
        ]));
}
