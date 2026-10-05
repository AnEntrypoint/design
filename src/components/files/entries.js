
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { TYPE_LABELS, FileIcon, fmtFileSize } from './types.js';
const h = webjsx.createElement;

const FILE_ROW_ACTIONS = ['download', 'rename', 'move', 'delete'];

export function FileRow({ name, type = 'other', size, modified, code, onOpen, onAction, active, key, permissions, locked,
                          actions = FILE_ROW_ACTIONS, busy = false, selectable = false, selected = false, onToggleSelect } = {}) {
    const noAccess = locked || permissions === 'EACCES' || (Array.isArray(permissions) && permissions.length === 0);
    const readOnly = !noAccess && Array.isArray(permissions) && permissions.indexOf('write') === -1 && permissions.indexOf('read') !== -1;
    const permTag = noAccess ? 'no access' : (readOnly ? 'read-only' : null);
    const meta = [type === 'dir' ? null : fmtFileSize(size), modified || null].filter(Boolean).join(' · ');
    const typeLabel = TYPE_LABELS[type] || 'file';
    const accessibleLabel = `${typeLabel}: ${name}${meta ? ` (${meta})` : ''}${permTag ? ', ' + permTag : ''}`;
    const canOpen = onOpen && !noAccess && !busy;
    const mutateDisabled = busy || readOnly || noAccess;
    const actBtn = (act, title, ariaLabel, icon, warn) => h('button', {
        key: 'act-' + act,
        type: 'button',
        class: 'ds-file-act' + (warn ? ' ds-file-act-warn' : ''),
        title: mutateDisabled && act !== 'download' ? 'read-only' : title,
        'aria-label': ariaLabel,
        disabled: (act === 'download' ? busy : mutateDisabled) ? true : null,
        'aria-disabled': (act === 'download' ? busy : mutateDisabled) ? 'true' : null,
        onclick: () => onAction(act),
    }, Icon(icon));
    const actionBtns = onAction ? [
        actions.indexOf('download') !== -1 && type !== 'dir'
            ? actBtn('download', 'download', `download ${name}`, 'arrow-down', false) : null,
        actions.indexOf('rename') !== -1
            ? actBtn('rename', 'rename', `rename ${name}`, 'pencil', false) : null,
        actions.indexOf('move') !== -1
            ? actBtn('move', 'move', `move ${name}`, 'arrow-right', false) : null,
        actions.indexOf('delete') !== -1
            ? actBtn('delete', 'delete', `delete ${name}`, 'x', true) : null,
    ].filter(Boolean) : [];
    const checkCtl = selectable ? h('button', {
        key: 'mark',
        type: 'button',
        class: 'ds-file-check' + (selected ? ' is-marked' : ''),
        role: 'checkbox',
        'aria-checked': selected ? 'true' : 'false',
        'aria-label': (selected ? 'unselect ' : 'select ') + name,
        disabled: (noAccess || busy) ? true : null,
        onclick: onToggleSelect ? (e) => onToggleSelect({ range: !!e.shiftKey }) : null,
    }, h('span', { class: 'ds-check-box', 'aria-hidden': 'true' })) : null;
    const rowKids = [
        checkCtl,
        h('button', {
            key: 'open',
            type: 'button',
            class: 'ds-file-open',
            onclick: canOpen ? onOpen : null,
            'aria-label': accessibleLabel + (noAccess ? ' (no access)' : ''),
            'aria-pressed': active ? 'true' : 'false',
            disabled: canOpen ? null : true,
        },
            ...[
                code != null ? h('span', { class: 'code', 'aria-label': `code: ${code}` }, code) : null,
                FileIcon({ type }),
                h('span', { class: 'title' }, name),
                h('span', { class: 'ds-file-meta meta', 'aria-label': meta ? `metadata: ${meta}` : null }, meta || '—'),
                permTag ? h('span', { class: 'ds-file-perm-tag' + (noAccess ? ' is-noaccess' : ''), 'aria-hidden': 'true' }, permTag) : null,
            ].filter(Boolean)
        ),
        actionBtns.length ? h('span', { key: 'acts', class: 'ds-file-actions', role: 'group', 'aria-label': `actions for ${name}` },
            ...actionBtns
        ) : null,
    ].filter(Boolean);
    return h('div', {
        key,
        class: 'ds-file-row row' + (active ? ' active' : '') + (noAccess ? ' is-locked' : '')
            + (readOnly ? ' is-restricted' : '')
            + (selected ? ' is-marked' : '') + (selectable ? ' is-selectable' : ''),
        'data-file-type': type,
        'aria-busy': busy ? 'true' : null,
    }, ...rowKids);
}

export function FileCell({ key, f = {}, selectable = false, selected = false, onToggleSelect, onOpen, thumb } = {}) {
    const noAccess = f.locked || f.permissions === 'EACCES'
        || (Array.isArray(f.permissions) && f.permissions.length === 0);
    const canOpen = onOpen && !noAccess;
    const typeLabel = TYPE_LABELS[f.type] || 'file';
    const kids = [
        selectable ? h('button', {
            key: 'mark', type: 'button',
            class: 'ds-file-check ds-file-cell-check' + (selected ? ' is-marked' : ''),
            role: 'checkbox', 'aria-checked': selected ? 'true' : 'false',
            'aria-label': (selected ? 'unselect ' : 'select ') + f.name,
            disabled: noAccess ? true : null,
            onclick: onToggleSelect ? (e) => onToggleSelect({ range: !!e.shiftKey }) : null,
        }, h('span', { class: 'ds-check-box', 'aria-hidden': 'true' })) : null,
        h('button', {
            key: 'open', type: 'button', class: 'ds-file-cell-open',
            onclick: canOpen ? () => onOpen(f) : null,
            disabled: canOpen ? null : true,
            'aria-label': typeLabel + ': ' + f.name + (noAccess ? ' (no access)' : ''),
        },
            h('span', { class: 'ds-file-cell-media' },
                thumb
                    ? h('img', { class: 'ds-file-cell-thumb', src: thumb, alt: '', loading: 'lazy' })
                    : FileIcon({ type: f.type })),
            h('span', { class: 'ds-file-cell-name', title: f.name }, f.name),
            h('span', { class: 'ds-file-cell-meta' }, f.type === 'dir' ? 'folder' : fmtFileSize(f.size))),
    ].filter(Boolean);
    return h('div', {
        key,
        class: 'ds-file-cell' + (selected ? ' is-marked' : '') + (f.active ? ' active' : '') + (noAccess ? ' is-locked' : ''),
        'data-file-type': f.type,
    }, ...kids);
}

export function FileSkeleton({ rows = 12 } = {}) {
    return h('div', { class: 'ds-file-grid ds-file-skeleton', role: 'status', 'aria-busy': 'true', 'aria-label': 'loading files' },
        ...Array.from({ length: Math.max(1, rows) }, (_, i) => h('div', { key: 'sk' + i, class: 'ds-file-row ds-file-row-skeleton', 'aria-hidden': 'true' },
            h('span', { class: 'ds-skel ds-skel-icon' }),
            h('span', { class: 'ds-skel ds-skel-title' }),
            h('span', { class: 'ds-skel ds-skel-meta' })))
    );
}
