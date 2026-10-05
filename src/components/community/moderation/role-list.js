import * as webjsx from '../../../../vendor/webjsx/index.js';
import { Icon } from '../../shell.js';

const h = webjsx.createElement;

export function RoleRow({ id, name, color, memberCount, draggable = true, onClick, onDragStart, onDragOver, onDrop } = {}) {
    return h('div', {
        class: 'cm-role-row',
        draggable: draggable ? 'true' : null,
        ondragstart: draggable ? (e) => onDragStart && onDragStart(id, e) : null,
        ondragover: draggable ? (e) => { e.preventDefault(); onDragOver && onDragOver(id, e); } : null,
        ondrop: draggable ? (e) => { e.preventDefault(); onDrop && onDrop(id, e); } : null,
    },
        draggable ? h('span', { class: 'cm-role-drag', 'aria-hidden': 'true', title: 'drag to reorder' }, Icon('rows-tight', { size: 16 })) : null,
        h('button', {
            type: 'button', class: 'cm-role-btn', onclick: onClick,
        },
            h('span', { class: 'cm-role-swatch', style: color ? `background:${color}` : null, 'data-empty': color ? null : 'true' }),
            h('span', { class: 'cm-role-name' }, name),
            memberCount != null ? h('span', { class: 'cm-role-count' }, String(memberCount)) : null,
            Icon('chevron-right', { size: 16 })
        )
    );
}

export function RoleList({ roles = [], onSelectRole, onReorder, onAddRole, saving = false } = {}) {
    let dragId = null;
    const handleDrop = (targetId) => {
        if (dragId == null || dragId === targetId || !onReorder) { dragId = null; return; }
        const ids = roles.map(r => r.id);
        const from = ids.indexOf(dragId), to = ids.indexOf(targetId);
        if (from === -1 || to === -1) { dragId = null; return; }
        ids.splice(to, 0, ids.splice(from, 1)[0]);
        onReorder(ids);
        dragId = null;
    };
    return h('div', { class: 'cm-role-list' },
        h('div', { class: 'cm-role-list-head' },
            h('span', { class: 'cm-role-list-title' }, 'Server roles' + (saving ? ': saving…' : '')),
            onAddRole ? h('button', { type: 'button', class: 'cm-role-add', 'aria-label': 'add role', title: 'Add role', onclick: onAddRole }, Icon('plus', { size: 18 })) : null
        ),
        h('div', { class: 'cm-role-rows' },
            ...roles.map(r => RoleRow({
                ...r,
                onClick: () => onSelectRole && onSelectRole(r.id),
                onDragStart: (id) => { dragId = id; },
                onDrop: handleDrop,
            })),
            RoleRow({ id: 'default', name: 'Everyone', color: null, memberCount: null, draggable: false, onClick: () => onSelectRole && onSelectRole('default') })
        )
    );
}
