import * as webjsx from '../../vendor/webjsx/index.js';
import { game3AvatarBg, game3AvatarFont } from './game3-hue.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;
const MEDALS = ['🥇', '🥈', '🥉'];

function LeaderboardRow({ key, row, rank }) {
    const name = row.name || row.id || 'user';
    const level = row.level || 0;
    const xp = row.xp || 0;
    const nextXp = 40 * (level + 1) * (level + 1);
    const pct = Math.max(0, Math.min(100, Math.round(row.xpPct || 0)));
    const initial = String(name).trim().slice(0, 1).toUpperCase();
    return h('div', { key, class: 'ds-g3-lbr' + (row.me ? ' me' : '') },
        h('span', { key: 'rk', class: 'ds-g3-rk' }, rank < 3 ? MEDALS[rank] : '#' + (rank + 1)),
        h('div', { key: 'av', class: 'ds-g3-lbav', style: 'background:' + game3AvatarBg(name) + ';font-size:' + game3AvatarFont(36) }, initial),
        h('div', { key: 'mid', class: 'ds-g3-lbmid' },
            h('div', { key: 'top', class: 'ds-g3-lbtop' },
                h('b', {}, name),
                h('span', {}, 'level ' + level)),
            h('div', { key: 'bar', class: 'ds-g3-xpb' }, h('i', { style: '--ds-g3-xp:' + pct + '%' })),
            h('small', { key: 'sm' }, xp + ' XP · ' + Math.max(0, nextXp - xp) + ' to level ' + (level + 1))));
}

export function Game3LeaderboardPanel({ rows = [], emptyText = '', onClose } = {}) {
    return h('div', { class: 'ds-g3-evm' },
        h('div', { class: 'ds-g3-evh' },
            h('b', { class: 'ds-g3-evt2' }, Icon('ref-leaderboard', { size: 18 }), 'Leaderboard'),
            onClose ? h('span', { class: 'ds-g3-evx', role: 'button', tabindex: '0', 'aria-label': 'close leaderboard', onclick: onClose }, Icon('x', { size: 14 })) : null),
        h('div', { class: 'ds-g3-evl' },
            rows.length
                ? rows.map((r, i) => LeaderboardRow({ key: String(r.id || i), row: r, rank: i }))
                : h('div', { class: 'ds-g3-empty' }, emptyText)));
}
