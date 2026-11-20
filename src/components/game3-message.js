import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from './shell.js';

const h = webjsx.createElement;
const QUICK = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}'];

export function isJumbo(text) {
    const x = String(text || '').trim();
    if (!x || x.length > 120 || !/^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|\uFE0F|\u200D|\s)+$/u.test(x)) return false;
    return (x.match(/\p{Extended_Pictographic}|\p{Regional_Indicator}{2}/gu) || []).length <= 27;
}


const URL_RE = /(https?:\/\/[^\s<]+)/g;
const linkify = (value) => String(value || '').split(URL_RE).map((part, i) => (i % 2 === 1 ? h('a', { key: 'l' + i, href: part, target: '_blank', rel: 'noopener' }, part) : part));

const CARD_IMAGE_RE = /\.(?:png|jpe?g|gif|webp)(?:\?|$)/i;
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/;
const cardNodes = (value, on) => on === false ? [] : [...new Set(String(value || '').match(/https?:\/\/[^\s<>"'|]+/gi) || [])].filter((u) => !CARD_IMAGE_RE.test(u)).slice(0, 3).map((u, i) => {
    let host = '', path = '';
    try { const x = new URL(u); host = x.hostname.replace(/^www\./, ''); path = decodeURIComponent(x.pathname + x.search).slice(0, 80); } catch (e) { return null; }
    const yt = YT_RE.exec(u);
    return h('a', { key: 'card' + i, class: 'ds-g3-lcard', href: u, target: '_blank', rel: 'noopener' },
        h('span', { key: 'lb', class: 'ds-g3-lbody' },
            h('span', { key: 'ls', class: 'ds-g3-lsite' }, host),
            h('span', { key: 'lt', class: 'ds-g3-ltitle' }, yt ? 'YouTube video' : (path.length > 1 ? path : host))),
        yt ? h('img', { key: 'li', src: 'https://i.ytimg.com/vi/' + yt[1] + '/hqdefault.jpg', loading: 'lazy' }) : null);
}).filter(Boolean);

export function Game3Message({ key, id, name = '', initial = '?', avatarColor = 'var(--accent)', time = '', fullTime = '', continuation = false, text = '', reply = null, reactions = [], mine = false, onReact, onAddReaction, onReply, onDelete, onOpenProfile, devMode = false, messageId = '', userId = '', jumbo = false, compact = false, previews = true } = {}) {
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
        h('div', { key: 'tx', class: 'ds-g3-tx' + (jumbo ? ' ds-g3-jumbo' : '') }, linkify(text)),
        ...cardNodes(text, previews),
        reactionChips
    );
    const avatar = continuation ? null : h('div', { key: 'av', class: 'ds-g3-av', role: 'button', tabindex: '0', style: '--ds-g3-av-color:' + avatarColor, onclick: () => onOpenProfile && onOpenProfile() }, initial);
    if (compact) return h('div', { key, id, class: 'ds-g3-msg ds-g3-ln ds-g3-crow' },
        replyLine,
        h('span', { key: 'ct', class: 'ds-g3-ctime', title: fullTime }, time),
        h('div', { key: 'cb', class: 'ds-g3-col' },
            h('span', { key: 'cw', class: 'ds-g3-who' }, name + ' '),
            h('span', { key: 'ctx', class: 'ds-g3-tx' + (jumbo ? ' ds-g3-jumbo' : '') }, linkify(text)),
            ...cardNodes(text, previews)),
        bar);
    return h('div', { key, id, class: 'ds-g3-msg ds-g3-ln' + (continuation ? ' ds-g3-cont' : '') },
        replyLine,
        avatar,
        body,
        bar
    );
}
