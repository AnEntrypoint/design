import * as webjsx from '../../../../vendor/webjsx/index.js';
import { Icon } from '../../shell.js';
import { avatarInitial } from '../../content.js';
import { avatarStyle } from '../avatar-style.js';
import { SettingsSection, SettingsRowToggle } from '../../voice/settings-row.js';

const h = webjsx.createElement;

const _pendingDelete = new Set();
function _confirmDelete(btn, key, normalChildren, fire) {
    if (_pendingDelete.has(key)) { _pendingDelete.delete(key); fire(); return; }
    _pendingDelete.add(key);
    webjsx.applyDiff(btn, [Icon('warn', { size: 16 }), ' Click again to confirm']);
    setTimeout(() => {
        if (!_pendingDelete.delete(key)) return;
        webjsx.applyDiff(btn, normalChildren);
    }, 5000);
}

const DEFAULT_ROLE_COLORS = [
    '#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#6ee7b7', '#67e8f9', '#93c5fd', '#c4b5fd', '#f0abfc', '#f9a8d4', '#cbd5e1',
    '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#64748b',
];

function ColorSwatchPicker({ colors = DEFAULT_ROLE_COLORS, value, onChange } = {}) {
    return h('div', { class: 'cm-role-color-picker' },
        h('div', { class: 'cm-role-color-grid', role: 'group', 'aria-label': 'role colour' },
            ...colors.map(c => h('button', {
                type: 'button', key: c,
                class: 'cm-role-color-swatch' + (value === c ? ' is-selected' : ''),
                style: `background:${c}`,
                'aria-label': 'set role colour to ' + c,
                'aria-pressed': value === c ? 'true' : 'false',
                onclick: () => onChange && onChange(c),
            }))
        ),
        h('div', { class: 'cm-role-color-actions' },
            h('label', { class: 'cm-role-color-custom' },
                h('input', {
                    type: 'color', value: value || '#ffffff',
                    oninput: (e) => onChange && onChange(e.target.value),
                }),
                'Custom colour'
            ),
            h('button', {
                type: 'button', class: 'cm-role-color-none' + (value == null ? ' is-selected' : ''),
                onclick: () => onChange && onChange(null),
            }, 'No colour')
        )
    );
}

export const PERMISSION_GROUPS = [
    { label: 'General', permissions: [
        { key: 'manageChannels', label: 'Manage channels' },
        { key: 'manageServer', label: 'Manage server' },
        { key: 'manageRoles', label: 'Manage roles' },
        { key: 'viewAuditLog', label: 'View audit log' },
        { key: 'createInvite', label: 'Create invite' },
    ]},
    { label: 'Membership', permissions: [
        { key: 'kickMembers', label: 'Kick members' },
        { key: 'banMembers', label: 'Ban members' },
        { key: 'timeoutMembers', label: 'Timeout members' },
        { key: 'changeNickname', label: 'Change own nickname' },
        { key: 'manageNicknames', label: "Manage others' nicknames" },
    ]},
    { label: 'Text', permissions: [
        { key: 'sendMessages', label: 'Send messages' },
        { key: 'manageMessages', label: 'Manage messages' },
        { key: 'embedLinks', label: 'Embed links' },
        { key: 'attachFiles', label: 'Attach files' },
        { key: 'mentionEveryone', label: 'Mention @everyone' },
        { key: 'useReactions', label: 'Use reactions' },
    ]},
    { label: 'Voice', permissions: [
        { key: 'voiceConnect', label: 'Connect' },
        { key: 'voiceSpeak', label: 'Speak' },
        { key: 'voiceMuteMembers', label: 'Mute members' },
        { key: 'voiceDeafenMembers', label: 'Deafen members' },
        { key: 'voiceMoveMembers', label: 'Move members' },
    ]},
];

function PermissionGrid({ permissions = {}, groups = PERMISSION_GROUPS, onChange } = {}) {
    return h('div', { class: 'cm-role-perm-grid' },
        ...groups.map(g => SettingsSection({
            title: g.label,
            children: g.permissions.map(p => SettingsRowToggle({
                icon: 'blank',
                label: p.label,
                checked: !!permissions[p.key],
                onToggle: (v) => onChange && onChange(p.key, v),
            })),
        }))
    );
}

export function RoleEditor({
    role = {}, permissions = {}, permissionGroups,
    onChangeName, onChangeColor, onChangeHoist, onChangeMentionable, onChangePermission,
    onCopyId, onDelete, onSave, onReset, dirty = false, saving = false,
} = {}) {
    const name = role.name || '';
    const color = role.color ?? role.colour ?? null;
    return h('div', { class: 'cm-role-editor' },
        h('div', { class: 'cm-role-editor-field' },
            h('label', { class: 'cm-role-editor-label', for: 'cm-role-name' }, 'Role name'),
            h('input', {
                id: 'cm-role-name', type: 'text', class: 'cm-role-editor-input',
                value: name, maxlength: '32',
                title: 'Role names are limited to 32 characters',
                'aria-description': 'Role names are limited to 32 characters',
                oninput: (e) => onChangeName && onChangeName(e.target.value),
            })
        ),
        h('div', { class: 'cm-role-editor-field' },
            h('span', { class: 'cm-role-editor-label' }, 'Role colour'),
            ColorSwatchPicker({ value: color, onChange: onChangeColor }),
            h('div', { class: 'cm-role-preview', style: avatarStyle(color) },
                h('span', { class: 'cm-role-preview-avatar' }, avatarInitial(name || '?')),
                h('span', { class: 'cm-role-preview-name', style: color ? `color:${color}` : null }, name || 'Role Name')
            )
        ),
        SettingsSection({ title: 'Display', children: [
            SettingsRowToggle({ icon: 'blank', label: 'Hoist role', description: 'Display members with this role separately in the member list', checked: !!role.hoist, onToggle: onChangeHoist }),
            SettingsRowToggle({ icon: 'blank', label: 'Mentionable', description: 'Allow anyone to @mention this role', checked: !!role.mentionable, onToggle: onChangeMentionable }),
        ]}),
        PermissionGrid({ permissions, groups: permissionGroups, onChange: onChangePermission }),
        h('div', { class: 'cm-role-editor-actions' },
            h('button', { type: 'button', class: 'cm-role-editor-btn', onclick: () => onCopyId && onCopyId(role.id) }, Icon('copy', { size: 16 }), ' Copy role ID'),
            h('button', {
                type: 'button', class: 'cm-role-editor-btn danger',
                onclick: (e) => _confirmDelete(e.currentTarget, 'role:' + role.id, [Icon('trash', { size: 16 }), ' Delete role'], () => onDelete && onDelete(role.id)),
            }, Icon('trash', { size: 16 }), ' Delete role')
        ),
        dirty ? h('div', { class: 'cm-role-editor-save-bar' },
            h('span', {}, saving ? 'saving…' : 'you have unsaved changes'),
            h('button', { type: 'button', class: 'cm-role-editor-btn', onclick: onReset }, 'Reset'),
            h('button', { type: 'button', class: 'cm-role-editor-btn cm-role-editor-btn-primary', disabled: saving ? 'true' : null, onclick: onSave }, 'Save changes')
        ) : null
    );
}
