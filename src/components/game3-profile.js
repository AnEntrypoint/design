import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg } from './game3-hue.js';
import { STATUS } from '../game3-data.js';

const h = webjsx.createElement;

export function Game3ProfileCard({ member, isSelf = false, devMode = false, onClose, onMessage, onSettings, key } = {}) {
    if (!member) return null;
    const name = member.name || member.identity || 'user';
    const status = member.status || 'online';
    const [statusName, dot] = STATUS[status] || STATUS.online;
    const roles = (member.roles || []).map((r) => (typeof r === 'string' ? { name: r, color: '#949ba4' } : r));
    const lbl = (text, value, k) => [h('div', { key: 'l' + k, class: 'ds-g3-pc-lbl' }, text), h('div', { key: 'v' + k, class: 'ds-g3-pc-val' }, value)];
    return h('div', { key, class: 'ds-g3-scrim', role: 'dialog', 'aria-modal': 'true', 'aria-label': name + ' profile', onclick: (e) => { if (e.target === e.currentTarget && onClose) onClose(); } },
        h('div', { class: 'ds-g3-pcard' },
            h('div', { class: 'ds-g3-pc-ban', style: 'background:' + game3AvatarBg(name) }),
            h('div', { class: 'ds-g3-pc-cb' },
                h('div', { class: 'ds-g3-dmav ds-g3-dmav-big ds-g3-pc-av', style: '--ds-g3-av-color:' + game3AvatarBg(name) },
                    String(name).trim().slice(0, 1).toUpperCase(),
                    h('span', { class: 'ds-g3-mdot', style: '--ds-g3-dot-color:' + dot, 'aria-label': status })),
                h('div', { class: 'ds-g3-pc-inner' },
                    h('h2', {}, name),
                    h('div', { class: 'ds-g3-pc-status' }, statusName + (member.activity ? ' · ' + member.activity : '')),
                    ...(member.bio ? lbl('About Me', member.bio, 'a') : []),
                    ...(member.joinedAt ? lbl('Member Since', new Date(member.joinedAt).toLocaleDateString(), 'm') : []),
                    h('div', { key: 'lr', class: 'ds-g3-pc-lbl' }, 'Roles'),
                    h('div', { key: 'rr' }, ...roles.map((r, i) => h('span', { key: 'r' + i, class: 'ds-g3-role' }, h('i', { style: 'background:' + (r.color || '#949ba4') }), r.name)), h('span', { class: 'ds-g3-role' }, h('i', { style: 'background:#949ba4' }), 'member')),
                    isSelf
                        ? h('div', { class: 'ds-g3-btnp', role: 'button', tabindex: '0', onclick: () => onSettings && onSettings() }, 'Edit settings')
                        : h('div', { class: 'ds-g3-btnp', role: 'button', tabindex: '0', onclick: () => onMessage && onMessage(member) }, 'Message @' + name),
                    ...(devMode && member.identity ? [h('div', { class: 'ds-g3-btnp ds-g3-btnp-alt', role: 'button', tabindex: '0', onclick: () => navigator.clipboard && navigator.clipboard.writeText(member.identity) }, 'Copy User ID')] : [])))));
}
