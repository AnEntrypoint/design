import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvatarFont, game3AvInitial } from './game3-hue.js';

const h = webjsx.createElement;
const CROWN = '<svg width="14" height="14" viewBox="0 0 24 24"><path fill="#f0b232" d="M5 18a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H5ZM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42-4.41-3.07Z"/></svg>';
const DOT = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };

export function Game3MemberRow({ identity, name, accountName, color, nameColor, status = 'online', suffix, activity, offline = false, onClick, key } = {}) {
    const initial = String(name || identity || '?').trim().slice(0, 1).toUpperCase();
    const dot = DOT[status] || DOT.online;
    return h('div', {
        key, class: 'ds-g3-mrow' + (offline ? ' ds-g3-off' : ''), title: accountName ? 'Account name: ' + accountName : null,
        role: onClick ? 'button' : null, tabindex: onClick ? '0' : null,
        onclick: onClick || null,
        onkeydown: onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : null,
    },
        h('div', { class: 'ds-g3-mav', style: '--ds-g3-av-color:' + game3AvatarBg(name || identity, identity) + ';font-size:' + game3AvatarFont(32) },
            game3AvInitial(initial, identity),
            h('span', { class: 'ds-g3-mdot', style: '--ds-g3-dot-color:' + dot, 'aria-label': status })),
        h('div', { class: 'ds-g3-mbody' },
            h('div', { class: 'ds-g3-nm', style: nameColor ? '--ds-g3-nm-color:' + nameColor : null },
                h('span', { class: 'ds-g3-nmtxt' }, name || identity),
                suffix === 'owner' ? h('span', { class: 'ds-g3-crown', title: 'Server owner', innerHTML: CROWN }) : suffix ? h('span', { class: 'ds-g3-msuffix' + (String(suffix).indexOf('APP') >= 0 ? ' ds-g3-msuffix-app' : '') }, suffix) : null),
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
