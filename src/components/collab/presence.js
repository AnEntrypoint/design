
import * as webjsx from '../../../vendor/webjsx/index.js';
import { avatarInitial } from '../content.js';
const h = webjsx.createElement;

export function AgentPresenceChip({ userId, label, color, status = 'active', key } = {}) {
    const initial = avatarInitial(label || userId);
    return h('div', { key, class: 'ds-collab-chip', title: label || userId },
        h('div', { class: 'ds-collab-chip-avatar', style: color ? `--avatar-bg:${color}` : null },
            h('span', { class: 'ds-collab-chip-status ds-collab-chip-status-' + status }),
            initial),
        h('span', { class: 'ds-collab-chip-name' }, label || userId));
}

export function PresenceBar({ users = [] } = {}) {
    if (!users.length) return h('div', { class: 'ds-collab-bar ds-collab-bar-empty', role: 'status' }, 'no collaborators online');
    return h('div', { class: 'ds-collab-bar', role: 'group', 'aria-label': 'collaborators online' },
        ...users.map((u) => AgentPresenceChip({ ...u, key: u.userId })));
}
