
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn, Icon } from '../shell.js';
const h = webjsx.createElement;

export function BulkBar({ count = 0, noun = 'file', nounPlural, actions = [], onClear, busy = false } = {}) {
    if (!count) return null;
    const plural = nounPlural || (/[^aeiou]y$/.test(noun) ? noun.slice(0, -1) + 'ies' : noun + 's');
    const kids = [
        h('span', { key: 'count', class: 'ds-bulkbar-count', role: 'status', 'aria-live': 'polite' },
            count + ' ' + (count === 1 ? noun : plural) + ' selected'),
        ...actions.map((a, i) => Btn({
            key: 'bba' + i, danger: !!a.danger, disabled: busy || a.disabled,
            onClick: a.onClick, children: a.label,
        })),
        onClear ? Btn({ key: 'bbclear', disabled: busy, onClick: onClear, children: 'clear selection' }) : null,
    ].filter(Boolean);
    return h('div', { class: 'ds-bulkbar', role: 'toolbar', 'aria-label': 'bulk file actions', 'aria-busy': busy ? 'true' : null }, ...kids);
}

export function FileToolbar({ left = [], right = [] } = {}) {
    return h('div', { class: 'ds-file-toolbar' },
        h('div', { class: 'ds-file-toolbar-left' }, ...left),
        h('div', { class: 'ds-file-toolbar-right' }, ...right)
    );
}

export function RootsPicker({ roots = [], selected, onSelect, label = 'roots' } = {}) {
    if (!roots.length) return null;
    return h('div', { class: 'ds-roots-picker', role: 'tablist', 'aria-label': label },
        ...roots.map((r) => h('button', {
            key: 'root-' + (r.id != null ? r.id : r.label),
            type: 'button', role: 'tab',
            class: 'ds-roots-tab' + ((r.id != null ? r.id : r.label) === selected ? ' active' : ''),
            'aria-selected': (r.id != null ? r.id : r.label) === selected ? 'true' : 'false',
            onclick: () => onSelect && onSelect(r.id != null ? r.id : r.label),
        }, r.label || r.id)));
}

export function DropZone({ children, dragover, rejected, onDrop, onDragOver, onDragLeave, label = 'drop files here', onPick } = {}) {
    const kids = Array.isArray(children) ? children : children ? [children] : [];
    return h('div', {
        class: 'ds-dropzone' + (kids.length ? ' ds-dropzone--wrap' : '') + (dragover ? ' dragover' : '') + (rejected ? ' rejected' : ''),
        ondragover: (e) => { e.preventDefault(); onDragOver && onDragOver(e); },
        ondragleave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) { onDragLeave && onDragLeave(e); } },
        ondrop: (e) => { e.preventDefault(); onDrop && onDrop(e.dataTransfer.files); }
    },
        h('div', { class: 'ds-dropzone-inner' },
            h('span', { class: 'ds-dropzone-glyph', role: 'img', 'aria-label': 'upload' }, Icon('arrow-up')),
            h('span', { class: 'ds-dropzone-label' }, label),
            onPick ? Btn({ onClick: onPick, children: 'pick files' }) : null
        ),
        ...kids
    );
}

export function UploadProgress({ items = [], onDismiss } = {}) {
    if (!items.length) return null;
    return h('div', { class: 'ds-upload-progress' },
        ...items.map((it, i) => {
            const indeterminate = !it.error && !it.done && !it.pct && it.indeterminate;
            const status = it.error ? 'error' : (it.done ? 'complete' : (indeterminate ? 'uploading' : `uploading ${it.pct || 0}%`));
            const rowActions = [
                ...((it.actions || []).map((a, ai) => h('button', {
                    key: 'ua' + ai, type: 'button', class: 'ds-upload-act',
                    'aria-label': `${a.label} ${it.name}`,
                    onclick: () => a.onClick && a.onClick(it, i),
                }, a.label))),
                (it.error && onDismiss) ? h('button', {
                    key: 'ud', type: 'button', class: 'ds-upload-act',
                    'aria-label': `dismiss ${it.name}`,
                    onclick: () => onDismiss(it, i),
                }, 'dismiss') : null,
            ].filter(Boolean);
            return h('div', {
                key: it.name + i,
                class: 'ds-upload-item' + (it.done ? ' done' : '') + (it.error ? ' error' : ''),
                role: 'status',
                'aria-label': `${it.name}: ${status}`,
                'aria-live': 'polite'
            },
                h('span', { class: 'ds-upload-name' }, it.name),
                h('span', { class: 'ds-upload-bar' + (indeterminate ? ' indeterminate' : '') },
                    h('span', { class: 'ds-upload-fill', 'data-pct': String(Math.max(0, Math.min(100, it.pct || 0))), 'aria-hidden': 'true' })
                ),
                h('span', { class: 'ds-upload-pct', 'aria-hidden': 'true' }, (it.error ? 'err' : (it.done ? 'ok' : (indeterminate ? '...' : (it.pct || 0) + '%')))),
                rowActions.length ? h('span', { class: 'ds-upload-actions', role: 'group', 'aria-label': `actions for ${it.name}` }, ...rowActions) : null
            );
        })
    );
}

export function EmptyState({ text = 'nothing here', glyph = Icon('circle'), action } = {}) {
    return h('div', { class: 'ds-file-empty', role: 'status' },
        ...[
            h('span', { key: 'glyph', class: 'ds-file-empty-glyph', 'aria-hidden': 'true' }, glyph),
            h('span', { key: 'text', class: 'ds-file-empty-text' }, text),
            (action && action.onClick)
                ? Btn({ key: 'ea', onClick: action.onClick, children: action.label || 'go up' })
                : null,
        ].filter(Boolean)
    );
}

export function BreadcrumbPath({ segments = [], onNav, root = 'root' } = {}) {
    const parts = [h('button', { key: 'root', class: 'ds-crumb-seg', onclick: () => onNav && onNav(0) }, root)];
    segments.forEach((seg, i) => {
        parts.push(h('span', { key: 'sep' + i, class: 'ds-crumb-sep', 'aria-hidden': 'true' }, Icon('chevron-right', { size: 13 })));
        parts.push(h('button', {
            key: 'seg' + i,
            class: 'ds-crumb-seg' + (i === segments.length - 1 ? ' leaf' : ''),
            onclick: () => onNav && onNav(i + 1)
        }, seg));
    });
    return h('div', { class: 'ds-crumb-path' }, ...parts);
}
