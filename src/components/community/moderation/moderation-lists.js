import * as webjsx from '../../../../vendor/webjsx/index.js';
import { Icon } from '../../shell.js';
import { avatarInitial } from '../../content.js';
import { avatarStyle } from '../avatar-style.js';

const h = webjsx.createElement;

const _pendingConfirm = new Set();
function _confirmToggle(btn, key, label, fire) {
    if (_pendingConfirm.has(key)) {
        _pendingConfirm.delete(key);
        fire();
        return;
    }
    _pendingConfirm.add(key);
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Click again to confirm ' + label);
    btn.title = 'Click again to confirm ' + label;
    webjsx.applyDiff(btn, Icon('help', { size: 16 }));
    setTimeout(() => {
        if (!_pendingConfirm.delete(key)) return;
        btn.removeAttribute('aria-pressed');
        btn.setAttribute('aria-label', label);
        btn.title = label;
        webjsx.applyDiff(btn, Icon('trash', { size: 16 }));
    }, 4000);
}

function _shortId(id) {
    const s = String(id || '');
    return s.length > 16 ? s.slice(0, 8) + '…' + s.slice(-4) : s;
}

function ModListRow({ identity, name, color, primary, secondary, primaryTitle, actionIcon, actionLabel, danger, onAction } = {}) {
    const initial = avatarInitial(name || identity);
    return h('div', { class: 'cm-modlist-row' },
        h('div', { class: 'cm-modlist-avatar', style: avatarStyle(color) }, initial),
        h('div', { class: 'cm-modlist-text' },
            h('div', { class: 'cm-modlist-primary', title: primaryTitle || null }, primary),
            secondary ? h('div', { class: 'cm-modlist-secondary' }, secondary) : null
        ),
        onAction ? h('button', {
            type: 'button', class: 'cm-modlist-action' + (danger ? ' danger' : ''),
            'aria-label': actionLabel, title: actionLabel, onclick: onAction,
        }, Icon(actionIcon, { size: 16 })) : null
    );
}

export function BanList({ bans = [], filterName = '', filterReason = '', onFilterName, onFilterReason, onUnban, loading = false } = {}) {
    const q = filterName.trim().toLowerCase(), qr = filterReason.trim().toLowerCase();
    const visible = bans.filter(b =>
        (!q || (b.name || '').toLowerCase().includes(q)) &&
        (!qr || (b.reason || '').toLowerCase().includes(qr))
    );
    return h('div', { class: 'cm-modlist' },
        h('div', { class: 'cm-modlist-head' },
            h('span', { class: 'cm-modlist-title' }, 'Banned users'),
            h('div', { class: 'cm-modlist-filters' },
                h('input', { type: 'text', class: 'cm-modlist-filter', 'aria-label': 'Filter banned users by name', placeholder: 'Filter by user', value: filterName, oninput: (e) => onFilterName && onFilterName(e.target.value) }),
                h('input', { type: 'text', class: 'cm-modlist-filter', 'aria-label': 'Filter banned users by reason', placeholder: 'Filter by reason', value: filterReason, oninput: (e) => onFilterReason && onFilterReason(e.target.value) })
            )
        ),
        loading ? h('div', { class: 'cm-modlist-empty', role: 'status' }, 'loading bans…')
            : visible.length === 0
                ? h('div', { class: 'cm-modlist-empty', role: 'status' }, Icon('user', { size: 20 }), h('span', {}, bans.length === 0 ? 'no banned users' : 'no bans match this filter'))
                : h('div', { class: 'cm-modlist-rows' },
                    ...visible.map(b => ModListRow({
                        identity: b.id, name: b.name, color: b.color,
                        primary: b.name || _shortId(b.id), secondary: b.reason || 'no reason given',
                        primaryTitle: b.name ? null : b.id,
                        actionIcon: 'x', actionLabel: 'unban ' + (b.name || _shortId(b.id)), danger: true,
                        onAction: () => onUnban && onUnban(b.id),
                    }))
                )
    );
}

export function InviteList({ invites = [], onCreate, canCreate = true, onCopy, onRevoke, loading = false } = {}) {
    const fmtExpiry = (exp) => {
        if (!exp) return 'never expires';
        const d = exp instanceof Date ? exp : new Date(exp);
        if (isNaN(d.getTime())) return 'never expires';
        return d.getTime() < Date.now() ? 'expired' : 'expires ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };
    return h('div', { class: 'cm-modlist' },
        h('div', { class: 'cm-modlist-head' },
            h('span', { class: 'cm-modlist-title' }, 'Server invites'),
            h('button', {
                type: 'button', class: 'cm-role-editor-btn cm-role-editor-btn-primary', disabled: !canCreate ? 'true' : null,
                'aria-disabled': !canCreate ? 'true' : null,
                'aria-describedby': !canCreate ? 'cm-invite-create-hint' : null,
                onclick: onCreate,
            }, Icon('plus', { size: 16 }), ' Create invite'),
            !canCreate ? h('span', { class: 'cm-modlist-secondary', id: 'cm-invite-create-hint' }, 'Create a channel before inviting others') : null
        ),
        loading ? h('div', { class: 'cm-modlist-empty', role: 'status' }, 'loading invites…')
            : invites.length === 0
                ? h('div', { class: 'cm-modlist-empty', role: 'status' }, Icon('link', { size: 20 }), h('span', {}, 'no active invites'))
                : h('div', { class: 'cm-modlist-rows' },
                    ...invites.map(i => h('div', { class: 'cm-modlist-row', key: i.code || i.id },
                        h('div', { class: 'cm-modlist-avatar', style: avatarStyle(i.creatorColor) }, avatarInitial(i.creatorName || '?')),
                        h('div', { class: 'cm-modlist-text' },
                            h('div', { class: 'cm-modlist-primary' }, i.creatorName || 'Unknown user'),
                            h('div', { class: 'cm-modlist-secondary' }, '#' + (i.channelName || 'unknown') + ' · ' + fmtExpiry(i.expiresAt))
                        ),
                        h('code', { class: 'cm-modlist-code' }, i.code || i.id),
                        h('button', { type: 'button', class: 'cm-modlist-action', 'aria-label': 'copy invite link', title: 'Copy invite link', onclick: () => onCopy && onCopy(i.code || i.id) }, Icon('copy', { size: 16 })),
                        h('button', {
                            type: 'button', class: 'cm-modlist-action danger', 'aria-label': 'revoke invite', title: 'Revoke invite',
                            onclick: (e) => _confirmToggle(e.currentTarget, 'invite:' + (i.code || i.id), 'revoke invite', () => onRevoke && onRevoke(i.code || i.id)),
                        }, Icon('trash', { size: 16 }))
                    ))
                )
    );
}
