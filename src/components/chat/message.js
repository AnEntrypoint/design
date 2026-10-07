import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { t } from '../../i18n.js';
import { renderInline } from '../chat-message-parts.js';
import { avatarInitial } from '../content.js';
import { avatarStyle } from '../community/avatar-style.js';
import { countMessage, renderPart } from './stats.js';

const h = webjsx.createElement;

function gutterTime(v) {
    return String(v).replace(/^(today|yesterday|on)\s+(at\s+)?/i, '');
}

export function ChatMessage({ role, who = 'them', avatar, text, parts, time, ts, typing, key, id, aicat, reactions, receipt, name, streaming, actions, incomplete, stopped, flat, tail, variant, avatarColor, error, onRetry, onToggleReaction, onAddReaction }) {
    countMessage();
    const resolvedWho = role
        ? (role === 'user' ? 'you'
            : role === 'assistant' ? 'them'
            : (role === 'system' || role === 'tool' || role === 'thinking') ? role
            : role)
        : who;
    const isCentered = resolvedWho === 'system' || resolvedWho === 'tool' || resolvedWho === 'thinking';
    const isFlat = flat && !isCentered;
    const isTail = isFlat && !!tail;
    const cls = 'chat-msg ' + resolvedWho + (aicat && resolvedWho === 'them' ? ' aicat' : '') + (isCentered ? ' centered' : '') + (isFlat ? ' chat-msg-flat' : '') + (isTail ? ' chat-msg-tail' : '');
    const fallbackAvatar = avatar != null
        ? avatar
        : (resolvedWho === 'you' ? 'u' : avatarInitial(name));
    const av = h('span', { class: 'chat-avatar', style: avatarStyle(avatarColor) }, fallbackAvatar);
    let bodyNodes;
    if (typing) bodyNodes = [h('div', { class: 'chat-bubble chat-bubble-typing', key: 'typb' }, h('span', { class: 'chat-typing' }, h('span'), h('span'), h('span')))];
    else if (parts && parts.length) bodyNodes = parts.map((p, i) => renderPart(p, i));
    else bodyNodes = [h('div', { class: 'chat-bubble', key: 't' }, ...renderInline(text || ''))];
    const lastPartHasCaret = parts && parts.length && parts[parts.length - 1] && parts[parts.length - 1].streamingCaret;
    if (streaming && !typing && !lastPartHasCaret) bodyNodes = [...bodyNodes, h('span', { key: '_caret', class: 'chat-stream-caret', 'aria-hidden': 'true' })];
    if (stopped) bodyNodes = [...bodyNodes, h('div', { key: '_stopped', class: 'chat-msg-notice is-stopped', role: 'status' },
        typeof stopped === 'string' ? stopped : 'stopped: this turn was cancelled before it finished')];
    if (incomplete) bodyNodes = [...bodyNodes, h('div', { key: '_incomplete', class: 'chat-msg-notice is-incomplete', role: 'status' },
        typeof incomplete === 'string' ? incomplete : 'connection dropped mid-turn: the response may be incomplete')];
    if (error) bodyNodes = [...bodyNodes, h('div', { key: '_error', class: 'chat-msg-notice is-error', role: 'alert' },
        h('span', {}, typeof error === 'string' ? error : 'this turn failed'),
        onRetry ? h('button', {
            type: 'button', class: 'chat-msg-retry-btn',
            onclick: (e) => { e.preventDefault(); onRetry(e); },
        }, 'retry') : null)];
    const hasReactions = reactions && reactions.length;
    const addReactionBtn = onAddReaction
        ? h('button', {
            type: 'button', class: 'rxn chat-rxn-add', key: 'r-add',
            'aria-label': 'add reaction', title: 'add reaction',
            onclick: (e) => { e.preventDefault(); onAddReaction(e); },
        }, h('span', { class: 'e' }, '+'))
        : null;
    const reactionRow = (hasReactions || addReactionBtn)
        ? h('div', { class: 'chat-reactions' },
            ...(hasReactions ? reactions.map((r, i) => h('button', {
                type: 'button', class: 'rxn' + (r.you ? ' you' : ''), key: 'r' + i,
                'aria-pressed': String(!!r.you),
                title: (r.you ? 'remove your ' : 'add ') + r.emoji + ' reaction',
                onclick: onToggleReaction ? (e) => { e.preventDefault(); onToggleReaction(r.emoji); } : undefined,
            },
                h('span', { class: 'e' }, r.emoji),
                h('span', { class: 'n' }, String(r.count)),
                h('span', { class: 'sr-only' }, ` ${String(r.count) === '1' ? 'reaction' : 'reactions'}${r.you ? ', you reacted' : ''}`))) : []),
            addReactionBtn)
        : null;
    const tickNode = resolvedWho === 'you' && receipt
        ? h('span', { class: 'tick' + (receipt === 'read' ? ' read' : ''), role: 'img', 'aria-label': receipt === 'read' ? 'message read' : 'message sent' }, Icon(receipt === 'read' ? 'check-check' : 'check', { size: 14 }))
        : null;
    const metaItems = [];
    if (name && resolvedWho === 'them' && !isTail && !isFlat) metaItems.push(h('span', { class: 'who', key: 'w' }, name));
    if (time) metaItems.push(h('span', { class: 't', key: 'ti' }, time));
    if (tickNode) metaItems.push(tickNode);
    const meta = metaItems.length ? h('div', { class: 'chat-meta' }, ...metaItems) : null;
    const actionRow = (actions && actions.length)
        ? h('div', { class: 'chat-msg-actions' + (isFlat ? ' chat-msg-actions-float' : ''), role: 'group', 'aria-label': 'message actions' },
            ...actions.filter(Boolean).map((a, i) => h('button', {
                key: 'ma' + i, type: 'button', class: 'chat-msg-action',
                title: a.title || a.label, 'aria-label': a.label || a.title,
                onclick: (e) => {
                    e.preventDefault();
                    a.onClick && a.onClick(e);
                    if (a.label === 'copy') {
                        const btn = e.currentTarget;
                        const labelEl = btn.querySelector('.chat-msg-action-label');
                        clearTimeout(btn._dsCopyTimer);
                        btn.classList.add('is-copied');
                        if (labelEl) labelEl.textContent = 'copied';
                        btn._dsCopyTimer = setTimeout(() => {
                            btn.classList.remove('is-copied');
                            if (labelEl) labelEl.textContent = 'copy';
                        }, 1600);
                    }
                },
            }, a.icon ? Icon(a.icon, { size: 14 }) : null,
               a.label ? h('span', { class: 'chat-msg-action-label' }, a.label) : null)))
        : null;
    const roleLabel = isFlat && !isTail
        ? h('div', { class: 'chat-role', key: '_role' }, resolvedWho === 'you' ? t('chat.roleYou', 'You') : (name || t('chat.roleAssistant', 'Assistant')))
        : null;
    if (variant === 'community' && !isCentered) {
        const head = isTail ? null : h('div', { class: 'chat-community-head', key: '_head' },
            h('span', { class: 'who' }, name || ''),
            time ? h('span', { class: 't' }, time) : null);
        const lead = isTail
            ? (time
                ? h('time', { class: 'chat-avatar-spacer chat-msg-gutter-time', key: '_spacer', title: time, datetime: ts != null ? new Date(ts).toISOString() : null }, gutterTime(time))
                : h('span', { class: 'chat-avatar-spacer', 'aria-hidden': 'true', key: '_spacer' }))
            : av;
        const communityActions = actionRow;
        return h('div', { key, id, class: 'chat-msg ' + resolvedWho + ' chat-msg-community chat-msg-flat' + (isTail ? ' chat-msg-tail' : '') },
            lead,
            h('div', { class: 'chat-stack' }, head, ...bodyNodes, reactionRow, communityActions));
    }
    const stack = resolvedWho === 'them'
        ? h('div', { class: 'chat-stack' }, roleLabel, meta, ...bodyNodes, reactionRow, actionRow)
        : h('div', { class: 'chat-stack' }, roleLabel, ...bodyNodes, reactionRow, actionRow, meta);
    if (isCentered) return h('div', { key, id, class: cls }, stack);
    if (isFlat) return h('div', { key, id, class: cls }, stack);
    return h('div', { key, id, class: cls }, resolvedWho === 'you' ? stack : av, resolvedWho === 'you' ? av : stack);
}
