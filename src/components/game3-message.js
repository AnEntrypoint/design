import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;
const QUICK = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}'];

export function Game3Message({ key, id, name = '', initial = '?', avatarColor = 'var(--accent)', time = '', fullTime = '', continuation = false, text = '', reply = null, reactions = [], mine = false, onReact, onAddReaction, onReply, onDelete, onOpenProfile, devMode = false, messageId = '', userId = '' } = {}) {
    const copyText = (value) => { if (navigator.clipboard) navigator.clipboard.writeText(String(value || '')); };
    const reactionChips = reactions && reactions.length
        ? h('div', { class: 'ds-g3-rx', key: 'rx' },
            reactions.map((r, i) => h('span', { key: 'r' + i, class: r.you ? 'ds-g3-mine' : '', role: 'button', tabindex: '0', 'aria-pressed': r.you ? 'true' : 'false', onclick: () => onReact && onReact(r.emoji) }, r.emoji, ' ', String(r.count))))
        : null;
    const replyLine = reply
        ? h('div', { class: 'ds-g3-rep', key: 'rep' }, h('b', {}, '@' + (reply.name || 'someone')), h('span', {}, String(reply.text || '').slice(0, 90)))
        : null;
    const bar = h('div', { class: 'ds-g3-bar', key: 'bar', role: 'group', 'aria-label': 'message actions' },
        QUICK.map((e) => h('span', { key: 'q' + e, role: 'button', tabindex: '0', title: 'react ' + e, onclick: () => onReact && onReact(e) }, e)),
        h('span', { key: 'add', role: 'button', tabindex: '0', title: 'Add Reaction', onclick: (e) => onAddReaction && onAddReaction(e) }, Icon('smile', { size: 18 })),
        h('span', { key: 'reply', role: 'button', tabindex: '0', title: 'Reply', onclick: () => onReply && onReply() }, Icon('corner-up-left', { size: 18 })),
        mine ? h('span', { key: 'del', role: 'button', tabindex: '0', title: 'Delete', onclick: () => onDelete && onDelete() }, Icon('trash', { size: 18 })) : null,
        devMode ? h('span', { key: 'cid', role: 'button', tabindex: '0', title: 'Copy Message ID', onclick: () => copyText(messageId) }, Icon('copy', { size: 18 })) : null,
        devMode ? h('span', { key: 'cuid', role: 'button', tabindex: '0', title: 'Copy User ID', onclick: () => copyText(userId) }, Icon('clipboard', { size: 18 })) : null
    );
    const body = h('div', { key: 'body', class: 'ds-g3-col' },
        continuation
            ? h('span', { key: 'stamp', class: 'ds-g3-stamp', title: fullTime }, time)
            : h('div', { key: 'head', class: 'ds-g3-head' },
                h('span', { key: 'who', class: 'ds-g3-who', role: 'button', tabindex: '0', onclick: () => onOpenProfile && onOpenProfile() }, name),
                h('span', { key: 'when', class: 'ds-g3-when', title: fullTime }, time)),
        h('div', { key: 'tx', class: 'ds-g3-tx' }, text),
        reactionChips
    );
    const avatar = continuation ? null : h('div', { key: 'av', class: 'ds-g3-av', role: 'button', tabindex: '0', style: '--ds-g3-av-color:' + avatarColor, onclick: () => onOpenProfile && onOpenProfile() }, initial);
    return h('div', { key, id, class: 'ds-g3-msg ds-g3-ln' + (continuation ? ' ds-g3-cont' : '') },
        replyLine,
        avatar,
        body,
        bar
    );
}
