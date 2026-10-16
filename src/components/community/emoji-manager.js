
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
const h = webjsx.createElement;

const _pendingDelete = new Set();
function _confirmDelete(btn, key, fire) {
    const disarm = () => {
        webjsx.applyDiff(btn, Icon('trash', { size: 14 }));
        btn.setAttribute('aria-label', key);
        btn.title = 'Delete';
    };
    if (_pendingDelete.has(key)) {
        _pendingDelete.delete(key);
        disarm();
        fire();
        return;
    }
    _pendingDelete.add(key);
    webjsx.applyDiff(btn, Icon('help', { size: 14 }));
    btn.setAttribute('aria-label', 'Click again to confirm ' + key);
    btn.title = 'Click again to confirm';
    setTimeout(() => {
        if (!_pendingDelete.delete(key)) return;
        disarm();
    }, 4000);
}

function EmojiCell({ id, name, imageUrl, onDelete }) {
    const label = `Delete :${name || id}:`;
    return h('div', { class: 'cm-emoji-mgr-cell', key: id },
        imageUrl
            ? h('img', { class: 'cm-emoji-mgr-img', src: imageUrl, alt: name || id })
            : h('span', { class: 'cm-emoji-mgr-img cm-emoji-mgr-img-fallback' }, Icon('smile')),
        h('span', { class: 'cm-emoji-mgr-name' }, name ? `:${name}:` : id),
        h('button', {
            type: 'button', class: 'cm-emoji-mgr-delete', 'aria-label': label, title: 'Delete',
            onclick: (e) => { e.stopPropagation(); _confirmDelete(e.currentTarget, label, () => onDelete && onDelete(id)); },
        }, Icon('trash', { size: 14 }))
    );
}

function UploadCell({ onUpload, dragOver, onDragOver, onDragLeave, onDrop }) {
    let fileInput = null;
    return h('div', {
        class: 'cm-emoji-mgr-cell cm-emoji-mgr-upload' + (dragOver ? ' is-dragover' : ''),
        role: 'button', tabindex: '0', 'aria-label': 'Upload new emoji',
        onclick: () => fileInput && fileInput.click(),
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput && fileInput.click(); } },
        ondragover: (e) => { e.preventDefault(); onDragOver && onDragOver(); },
        ondragleave: onDragLeave,
        ondrop: (e) => { e.preventDefault(); onDragLeave && onDragLeave(); onDrop && onDrop(e.dataTransfer && e.dataTransfer.files); },
    },
        Icon('plus', { size: 20 }),
        h('span', { class: 'cm-emoji-mgr-upload-label' }, 'Add emoji'),
        h('input', {
            type: 'file', accept: 'image/*', class: 'cm-emoji-mgr-upload-input', tabindex: '-1',
            ref: (el) => { fileInput = el; },
            onchange: (e) => { onUpload && onUpload(e.target.files); e.target.value = ''; },
        })
    );
}

export function EmojiManagerGrid({ emoji = [], onUpload, onDelete, dragOver = false, onDragOver, onDragLeave, onDrop, busy = false } = {}) {
    return h('div', { class: 'cm-emoji-mgr' },
        h('div', { class: 'cm-emoji-mgr-head' },
            h('span', { class: 'cm-emoji-mgr-title' }, 'Custom Emoji'),
            h('span', { class: 'cm-emoji-mgr-count' }, `${emoji.length} emoji`)
        ),
        busy
            ? h('div', { class: 'cm-emoji-mgr-empty' }, 'Loading emoji…')
            : h('div', { class: 'cm-emoji-mgr-grid' },
                UploadCell({ onUpload, dragOver, onDragOver, onDragLeave, onDrop }),
                ...emoji.map((e) => EmojiCell({ id: e.id, name: e.name, imageUrl: e.imageUrl, onDelete }))
            ),
        (!busy && emoji.length === 0) ? h('div', { class: 'cm-emoji-mgr-empty' }, 'No custom emoji yet. Drop an image or click "Add emoji".') : null
    );
}
