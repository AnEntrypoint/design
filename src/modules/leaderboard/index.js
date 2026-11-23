import * as webjsx from '../../../vendor/webjsx/index.js';
import { registerModule } from '../registry.js';
import { Icon } from '../../components/shell.js';
import { Game3LeaderboardPanel } from '../../components/game3-leaderboard.js';

const h = webjsx.createElement;

registerModule({
    id: 'surface-leaderboard', kind: 'surface',
    surface: {
        id: 'leaderboard', placement: 'modal',
        rail: { order: 2, row: ({ s, A }) => h('a', { key: 'leaderboard', href: '#', class: s.gameSurface === 'leaderboard' ? 'active' : '', onclick: (e) => { e.preventDefault(); if (A.openSurface) A.openSurface('leaderboard'); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('ref-leaderboard', { size: 20 })), h('span', {}, 'Leaderboard'), s.myLevel != null ? h('span', { class: 'ds-g3-rail-lv' }, 'lv ' + s.myLevel) : null) },
        body: ({ s, A }) => Game3LeaderboardPanel({ rows: (s.leaderboard || []).map(r => ({ ...r, me: String(r.id) === String(s.userId) })), emptyText: 'nobody has XP yet. every message earns some, once every 30 seconds.', onClose: () => A.closeSurface && A.closeSurface() }),
    },
});
