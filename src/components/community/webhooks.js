
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { avatarInitial } from '../content.js';
import { avatarStyle } from './avatar-style.js';
import { SettingsRow, SettingsRowGroup, SettingsSection } from '../voice/settings-row.js';
const h = webjsx.createElement;

function _shortId(id) {
    const s = String(id || '');
    return s.length > 16 ? s.slice(0, 8) + '…' + s.slice(-4) : s;
}

const _pendingConfirm = new Set();
function _confirmToggle(btn, key, normal, armed, fire, label) {
    const disarm = () => {
        webjsx.applyDiff(btn, normal);
        if (label) { btn.setAttribute('aria-label', label); btn.title = label; }
    };
    if (_pendingConfirm.has(key)) {
        _pendingConfirm.delete(key);
        disarm();
        fire();
        return;
    }
    _pendingConfirm.add(key);
    webjsx.applyDiff(btn, armed);
    if (label) {
        const armedLabel = 'Click again to confirm ' + label;
        btn.setAttribute('aria-label', armedLabel);
        btn.title = armedLabel;
    }
    setTimeout(() => {
        if (!_pendingConfirm.delete(key)) return;
        disarm();
    }, 4000);
}

function WebhookAvatar({ name, avatarUrl, color }) {
    if (avatarUrl) return h('img', { class: 'cm-webhook-avatar', src: avatarUrl, alt: '' });
    return h('div', { class: 'cm-webhook-avatar cm-webhook-avatar-fallback', style: avatarStyle(color) }, avatarInitial(name));
}

export function WebhookListItem({ id, name, avatarUrl, color, description, onEdit, onDelete } = {}) {
    return h('div', { class: 'cm-webhook-item' },
        WebhookAvatar({ name, avatarUrl, color }),
        h('div', { class: 'cm-webhook-item-body' },
            h('div', { class: 'cm-webhook-item-name' }, name || 'Webhook'),
            description != null ? h('div', { class: 'cm-webhook-item-desc' }, description) : null
        ),
        h('div', { class: 'cm-webhook-item-actions' },
            h('button', { type: 'button', class: 'cm-webhook-action', 'aria-label': 'Edit webhook', title: 'Edit', onclick: onEdit }, Icon('edit')),
            h('button', {
                type: 'button', class: 'cm-webhook-action cm-webhook-action-danger', 'aria-label': 'Delete webhook', title: 'Delete',
                onclick: (e) => _confirmToggle(e.currentTarget, 'wh:' + id, Icon('trash'), Icon('help', { size: 16 }), () => onDelete && onDelete(id), 'delete webhook'),
            }, Icon('trash'))
        )
    );
}

export function WebhookList({ webhooks = [], onCreate, onEdit, onDelete, busy = false } = {}) {
    return h('div', { class: 'cm-webhook-list' },
        h('button', { type: 'button', class: 'cm-webhook-create', onclick: onCreate },
            h('span', { class: 'cm-webhook-create-icon' }, Icon('cloud')),
            h('span', null, 'Create Webhook')
        ),
        busy
            ? h('div', { class: 'cm-webhook-empty' }, 'Loading webhooks…')
            : (webhooks.length
                ? h('div', { class: 'cm-webhook-items' },
                    ...webhooks.map((w) => h('div', { key: w.id }, WebhookListItem({
                        id: w.id, name: w.name, avatarUrl: w.avatarUrl, color: w.color,
                        description: w.channelName ? '#' + w.channelName : _shortId(w.id),
                        onEdit: () => onEdit && onEdit(w.id),
                        onDelete: () => onDelete && onDelete(w.id),
                    }))))
                : h('div', { class: 'cm-webhook-empty' }, 'No webhooks yet.'))
    );
}

export function WebhookEditor({ name = '', avatarUrl = '', url = '', onNameChange, onAvatarChange, onCopyUrl, onSave, onDelete, saving = false } = {}) {
    return h('div', { class: 'cm-webhook-editor' },
        h('div', { class: 'cm-webhook-editor-head' },
            WebhookAvatar({ name }),
            h('div', { class: 'cm-webhook-editor-title' }, name || 'Webhook')
        ),
        SettingsSection({
            title: 'General',
            children: [
                SettingsRow({
                    icon: 'edit', label: 'Name', description: 'Shown as the message author',
                    action: h('input', {
                        type: 'text', class: 'cm-webhook-input', value: name, placeholder: 'Webhook name',
                        onclick: (e) => e.stopPropagation(),
                        oninput: (e) => onNameChange && onNameChange(e.target.value),
                    }),
                }),
                SettingsRow({
                    icon: 'image', label: 'Avatar URL', description: 'Custom avatar for this webhook',
                    action: h('input', {
                        type: 'text', class: 'cm-webhook-input', value: avatarUrl, placeholder: 'https://…',
                        onclick: (e) => e.stopPropagation(),
                        oninput: (e) => onAvatarChange && onAvatarChange(e.target.value),
                    }),
                }),
            ],
        }),
        SettingsSection({
            title: 'Webhook URL',
            children: [
                SettingsRow({
                    icon: 'link', label: 'URL', description: url || '-',
                    action: h('button', { type: 'button', class: 'cm-webhook-copy', onclick: onCopyUrl }, Icon('copy'), h('span', null, 'Copy')),
                }),
            ],
        }),
        h('div', { class: 'cm-webhook-editor-actions' },
            h('button', { type: 'button', class: 'cm-webhook-save', disabled: saving, onclick: onSave }, saving ? 'Saving…' : 'Save Changes'),
            h('button', {
                type: 'button', class: 'cm-webhook-delete',
                onclick: (e) => _confirmToggle(e.currentTarget, 'whe:' + (url || name), 'Delete Webhook', 'Click again to confirm', () => onDelete && onDelete()),
            }, 'Delete Webhook')
        )
    );
}
