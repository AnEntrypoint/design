import { Game3PollCard } from './game3-poll.js';
import { EMOJI } from '../game3-data.js';
import { renderMarkdown } from './game3-markdown.js';
import { Game3InviteCard } from './game3-invite.js';
import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;
const QUICK = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}'];

export function isJumbo(text) {
    const x = String(text || '').trim();
    if (!x || x.length > 120 || !/^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|\uFE0F|\u200D|\s)+$/u.test(x)) return false;
    return (x.match(/\p{Extended_Pictographic}|\p{Regional_Indicator}{2}/gu) || []).length <= 27;
}



const CARD_IMAGE_RE = /\.(?:png|jpe?g|gif|webp)(?:\?|$)/i;
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/;
const cardNodes = (value, on, unfurls = []) => on === false ? [] : [...new Set(String(value || '').match(/https?:\/\/[^\s<>"'|]+/gi) || [])].filter((u) => !CARD_IMAGE_RE.test(u)).slice(0, 3).map((u, i) => {
    const rich = unfurls.find((p) => p.url === u);
    if (rich) return h('a', { key: 'card' + i, class: 'ds-g3-lcard' + (rich.image && !YT_RE.test(u) ? ' ds-g3-side' : ''), href: u, target: '_blank', rel: 'noopener noreferrer' },
        h('span', { key: 'lb', class: 'ds-g3-lbody' },
            h('span', { key: 'ls', class: 'ds-g3-lsite' }, (() => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } })()),
            h('span', { key: 'lt', class: 'ds-g3-ltitle ds-g3-real' }, rich.title || u),
            rich.description ? h('span', { key: 'ld', class: 'ds-g3-ldesc' }, rich.description) : null),
        rich.image || YT_RE.test(u) ? h('img', { key: 'li', src: YT_RE.test(u) ? 'https://i.ytimg.com/vi/' + YT_RE.exec(u)[1] + '/hqdefault.jpg' : rich.image, loading: 'lazy', referrerpolicy: 'no-referrer', alt: '', onerror: (e) => e.currentTarget.remove() }) : null);
    let host = '', path = '';
    try { const x = new URL(u); host = x.hostname.replace(/^www\./, ''); path = decodeURIComponent(x.pathname + x.search).slice(0, 80); } catch (e) { return null; }
    const yt = YT_RE.exec(u);
    return h('a', { key: 'card' + i, class: 'ds-g3-lcard', href: u, target: '_blank', rel: 'noopener' },
        h('span', { key: 'lb', class: 'ds-g3-lbody' },
            h('span', { key: 'ls', class: 'ds-g3-lsite' }, host),
            h('span', { key: 'lt', class: 'ds-g3-ltitle' }, yt ? 'YouTube video' : (path.length > 1 ? path : host))),
        yt ? h('img', { key: 'li', src: 'https://i.ytimg.com/vi/' + yt[1] + '/hqdefault.jpg', loading: 'lazy' }) : null);
}).filter(Boolean);

const embedNodes = (value, on) => on === false ? [] : [...new Set(String(value || '').match(/https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp)(?:\?[^\s<>"']*)?/gi) || [])].slice(0, 4).map((u, i) => h('img', { key: 'pic' + i, class: 'ds-g3-pic', src: u, loading: 'lazy', onerror: (e) => e.currentTarget.remove() }));

const spoilerNodes = (text) => renderMarkdown(text);

export function Game3Message({ pickerOpen = false, onPick, unfurls = [], sticker = null, sendState = null, seen = false, accountName = '', onRetry, onJump, onMore, pinned = false, saved = false, onSave, moreOpen = false, moreItems = [], remind = [], onRemind, poll = null, invite = null, key, id, name = '', initial = '?', avatarColor = 'var(--accent)', time = '', headTime = '', fullTime = '', continuation = false, text = '', reply = null, reactions = [], mine = false, onReact, onAddReaction, onReply, onDelete, onPin, onOpenProfile, devMode = false, messageId = '', userId = '', jumbo = false, compact = false, previews = true, embeds = true } = {}) {
    const bodyNodes = poll ? [Game3PollCard(poll)] : invite ? [Game3InviteCard(invite)] : sticker ? [h('img', { key: 'stk', class: 'ds-g3-stk', src: sticker.url, title: sticker.name, alt: sticker.name })] : null;
    const copyText = (value) => { if (navigator.clipboard) navigator.clipboard.writeText(String(value || '')); };
    const sendLine = sendState && sendState.state === 'pending'
        ? h('div', { key: 'sendst', class: 'ds-g3-sendst' }, 'Sending…')
        : sendState && sendState.state === 'failed'
            ? h('div', { key: 'sendst', class: 'ds-g3-sendst ds-g3-failed' }, 'Not sent. ', h('span', { class: 'ds-g3-retry', role: 'button', tabindex: '0', onclick: () => onRetry && onRetry() }, 'Retry'))
            : seen ? h('div', { key: 'sendst', class: 'ds-g3-sendst ds-g3-seen' }, 'Seen')
            : null;
    const reactionChips = reactions && reactions.length
        ? h('div', { class: 'ds-g3-rx', key: 'rx' },
            reactions.map((r, i) => h('span', { key: 'r' + i, class: r.you ? 'ds-g3-mine' : '', role: 'button', tabindex: '0', 'aria-pressed': r.you ? 'true' : 'false', onclick: () => onReact && onReact(r.emoji) }, r.emoji, ' ', String(r.count))))
        : null;
    const replyLine = reply
        ? h('div', { class: 'ds-g3-rep', key: 'rep' }, h('b', {}, '@' + (reply.name || 'someone')), h('span', {}, String(reply.text || '').slice(0, 90)))
        : null;
    const bar = h('div', { class: 'ds-g3-bar', key: 'bar', role: 'group', 'aria-label': 'message actions' },
        QUICK.map((e) => h('span', { key: 'q' + e, role: 'button', tabindex: '0', title: 'react ' + e, onclick: () => onReact && onReact(e) }, e)),
        h('span', { key: 'add', role: 'button', tabindex: '0', title: 'Add Reaction', onclick: (e) => onAddReaction && onAddReaction(e) }, Icon('ref-smile', { size: 20 })),
        h('span', { key: 'reply', role: 'button', tabindex: '0', title: 'Reply', onclick: () => onReply && onReply() }, Icon('ref-reply', { size: 20 })),
        onPin ? h('span', { key: 'pin', role: 'button', tabindex: '0', title: pinned ? 'Unpin Message' : 'Pin Message', style: pinned ? 'color:#f0b232' : null, onclick: () => onPin() }, Icon('ref-pins', { size: 24 })) : null,
        onSave ? h('span', { key: 'save', role: 'button', tabindex: '0', title: saved ? 'Remove from Saved' : 'Save for Later', style: saved ? 'color:#5865f2' : null, onclick: () => onSave() }, '🔖') : null,
        mine ? h('span', { key: 'del', role: 'button', tabindex: '0', title: 'Delete', onclick: () => onDelete && onDelete() }, Icon('ref-trash', { size: 18 })) : null,
        devMode ? h('span', { key: 'cid', role: 'button', tabindex: '0', title: 'Copy Message ID', onclick: () => copyText(messageId) }, Icon('ref-copy', { size: 18 })) : null,
        devMode ? h('span', { key: 'cuid', role: 'button', tabindex: '0', title: 'Copy User ID', onclick: () => copyText(userId) }, Icon('clipboard', { size: 18 })) : null,
        onJump ? h('span', { key: 'jump', role: 'button', tabindex: '0', title: 'Jump', onclick: () => onJump() }, '↪') : null,
        onMore ? h('span', { key: 'more', role: 'button', tabindex: '0', title: 'More', onclick: () => onMore() }, '⋯') : null
    );
    const menu = moreOpen ? h('div', { key: 'mm', class: 'ds-g3-mmenu', role: 'menu' },
        moreItems.map((it) => h('div', { key: it.key, role: 'menuitem', tabindex: '0', onclick: (e) => it.onClick(e) }, it.label, h('span', {}, it.glyph))),
        remind.length ? h('div', { key: 'sep', class: 'ds-g3-msep' }, 'Remind me about this') : null,
        remind.length ? h('div', { key: 'rm', class: 'ds-g3-rmrow' }, remind.map(([mn, lab]) => h('b', { key: 'r' + mn, role: 'button', tabindex: '0', onclick: () => onRemind && onRemind(mn) }, lab))) : null) : null;
    const picker = pickerOpen ? h('div', { key: 'rxpick', class: 'ds-g3-epick ds-g3-rxpick' }, EMOJI.map((e) => h('span', { key: e, role: 'button', tabindex: '0', onclick: () => onPick && onPick(e) }, e))) : null;
    const onDouble = onReply ? (e) => {
        if (e.target.closest && e.target.closest('a,button,.ds-g3-rx,.ds-g3-bar,.ds-g3-pollo,.ds-g3-who,img')) return;
        const sel = window.getSelection && window.getSelection();
        if (sel) sel.removeAllRanges();
        onReply();
        setTimeout(() => { const box = document.querySelector('.ds-g3-comp textarea'); if (box) box.focus(); }, 0);
    } : null;
    const stamp = continuation ? h('span', { key: 'stamp', class: 'ds-g3-stamp', style: 'left:8px', title: fullTime }, time) : null;
    const body = continuation ? h('div', { key: 'body', class: 'ds-g3-tx-wrap' },
        h('div', { key: 'tx', class: 'ds-g3-tx' + (jumbo ? ' ds-g3-jumbo' : '') }, ...(bodyNodes || spoilerNodes(text))),
        ...cardNodes(text, previews, unfurls),
        ...embedNodes(text, embeds),
        reactionChips, sendLine) : h('div', { key: 'body', class: 'ds-g3-col' },
            h('div', { key: 'head', class: 'ds-g3-head' },
                h('span', { key: 'who', class: 'ds-g3-who', title: accountName ? 'Account name: ' + accountName : null, role: 'button', tabindex: '0', onclick: () => onOpenProfile && onOpenProfile() }, name),
                h('span', { key: 'when', class: 'ds-g3-when', title: fullTime }, headTime || time)),
        h('div', { key: 'tx', class: 'ds-g3-tx' + (jumbo ? ' ds-g3-jumbo' : '') }, ...(bodyNodes || spoilerNodes(text))),
        ...cardNodes(text, previews, unfurls),
        ...embedNodes(text, embeds),
        reactionChips, sendLine
    );
    const avatar = continuation ? null : h('div', { key: 'av', class: 'ds-g3-av', role: 'button', tabindex: '0', style: '--ds-g3-av-color:' + avatarColor, onclick: () => onOpenProfile && onOpenProfile() }, initial);
    if (compact) return h('div', { key, id, class: 'ds-g3-msg ds-g3-ln ds-g3-crow' + (mine ? ' ds-g3-selfmsg' : ''), ondblclick: onDouble },
        replyLine,
        h('span', { key: 'ct', class: 'ds-g3-ctime', title: fullTime }, time),
        h('div', { key: 'cb', class: 'ds-g3-col' },
            h('span', { key: 'cw', class: 'ds-g3-who' }, name + ' '),
            h('span', { key: 'ctx', class: 'ds-g3-tx' + (jumbo ? ' ds-g3-jumbo' : '') }, ...(bodyNodes || spoilerNodes(text))),
            ...cardNodes(text, previews, unfurls),
            ...embedNodes(text, embeds)),
        bar, menu, picker);
    return h('div', { key, id, class: 'ds-g3-msg ds-g3-ln' + (continuation ? ' ds-g3-cont' : '') + (mine ? ' ds-g3-selfmsg' : ''), ondblclick: onDouble },
        replyLine,
        stamp,
        avatar,
        body,
        bar,
        menu,
        picker
    );
}
