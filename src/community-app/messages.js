import * as webjsx from '../../vendor/webjsx/index.js';
import { messageKindFor, messageProps } from '../modules/index.js';
import { Game3Message, isJumbo } from '../components/game3-message.js';
import { game3AvatarBg, game3AvInitial } from '../components/game3-hue.js';
import { Game3DayDivider } from '../components/game3-day.js';
import { Game3SystemLine } from '../components/game3-system.js';
import { Game3NewDivider } from '../components/game3-newdiv.js';
import { Game3NewBar } from '../components/game3-newbar.js';
import { Game3SearchBar } from '../components/game3-search.js';
import { EMOJI } from '../game3-data.js';
import { openProfileFor } from './profile-open.js';

const h = webjsx.createElement;

const replyLine = (reference, A, msgs) => {
    const rt = reference.content ? reference : { ...reference, ...(msgs.find((x) => x.id === reference.id) || {}) };
    const found = !!rt.content;
    const name = found ? (rt.username || (rt.userId && A.resolveProfile && A.resolveProfile(rt.userId)) || 'someone') : 'someone';
    return { name, userId: found ? rt.userId : null, found, id: rt.id || null, text: found ? String(rt.content).replace(/\n/g, ' ') : 'original message was deleted' };
};

export function createMessages(app) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();

    const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i;
    const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
    const AUDIO_EXT = /\.(mp3|wav|ogg|oga|m4a|flac|opus)(\?|#|$)/i;
    const mediaPartFor = (m) => {
        const trimmed = String(m.content || '').trim();
        const url = m.media && m.media.url ? m.media.url : (/^https?:\/\/\S+$/.test(trimmed) ? trimmed : null);
        if (!url) return null;
        const mime = (m.media && m.media.mime) || '';
        const name = decodeURIComponent((url.split('?')[0].split('/').pop()) || 'attachment');
        if (mime.startsWith('image/') || (!mime && IMAGE_EXT.test(url))) return { kind: 'image', src: url, alt: name };
        if (mime.startsWith('video/') || (!mime && VIDEO_EXT.test(url))) return { kind: 'video', src: url, name };
        if (mime.startsWith('audio/') || (!mime && AUDIO_EXT.test(url))) return { kind: 'audio', src: url, name };
        if (m.media) return { kind: 'file', src: url, name, size: m.media.size, kindLabel: mime.split('/').pop().toUpperCase() };
        return null;
    };
    const CODE_FENCE_RE = /^```([a-zA-Z0-9_+-]*)\n([\s\S]*?)\n?```\s*$/;
    const partsFromMessage = (m) => {
        const parts = [];
        const content = m.content || '';
        const mediaPart = mediaPartFor(m);
        if (mediaPart) { parts.push(mediaPart); return parts; }
        const fence = content.match(CODE_FENCE_RE);
        if (m.type === 'code' || fence) parts.push({ kind: 'code', code: fence ? fence[2] : content, lang: fence ? fence[1] : (m.lang || '') });
        else if (m.type === 'image') { const src = m.url || m.imageUrl || m.src; if (src) parts.push({ kind: 'image', src, alt: m.alt || '', caption: m.caption }); else if (content) parts.push({ kind: 'md', text: content }); }
        else if (m.type === 'file') parts.push({ kind: 'file', src: m.url || m.fileUrl || m.src, name: m.name || m.filename || 'attachment', size: m.size });
        else if (content) parts.push({ kind: 'md', text: content });
        if (Array.isArray(m.attachments)) for (const a of m.attachments) {
            if (!a) continue;
            if (a.type === 'image' && (a.src || a.url)) parts.push({ kind: 'image', src: a.src || a.url, alt: a.alt || '', caption: a.caption });
            else if ((a.src || a.url) && (a.name || a.filename)) parts.push({ kind: 'file', src: a.src || a.url, name: a.name || a.filename, size: a.size });
        }
        if (m.linkPreview && m.linkPreview.href) parts.push({ kind: 'link', ...m.linkPreview });
        return parts;
    };

    const mapMessages = (s) => {
        const chatMsgs = s.messages || [];
        const selfId = s.userId;
        return chatMsgs.map((m, i) => {
            if (m.type === 'system') return { key: m.id || ('sys' + i), who: 'them', name: '', parts: [{ kind: 'md', text: '_' + (m.text || '') + '_' }] };
            const username = (A.resolveProfile && A.resolveProfile(m.userId)) || m.username || 'User';
            const isYou = selfId && String(m.userId) === String(selfId);
            const reactions = Array.isArray(m.reactions) ? m.reactions.map(r => ({ emoji: r.emoji, count: r.count != null ? r.count : (r.users ? r.users.length : 1), you: !!(r.you || (r.users && selfId && r.users.includes(selfId))) })) : null;
            const msgActions = [
                {
                    label: 'react', title: 'react to ' + username + '\'s message', icon: 'smile',
                    onClick: (e) => {
                        if (!A.reactToMessage) return;
                        const rect = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
                        if (app.api.emojiPicker) {
                            app.api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.bottom + 4 : 200, (em) => A.reactToMessage(m.id, m.userId, em));
                        } else {
                            A.reactToMessage(m.id, m.userId);
                        }
                    },
                },
                { label: 'reply', title: 'reply to ' + username, icon: 'corner-up-left', onClick: () => A.startReply && A.startReply({ id: m.id, userId: m.userId, username, content: m.content }) },
                isYou ? { label: 'delete', title: 'request deletion (relays may not honor it; other clients may have already cached this message)', icon: 'trash', onClick: () => A.deleteMessage && A.deleteMessage(m.id) } : null,
            ].filter(Boolean);
            const openReactPicker = (e) => {
                if (!A.reactToMessage) return;
                const rect = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
                if (app.api.emojiPicker) app.api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.bottom + 4 : 200, (em) => A.reactToMessage(m.id, m.userId, em));
                else A.reactToMessage(m.id, m.userId);
            };
            return { key: m.id || ('m' + i), who: isYou ? 'you' : 'them', flat: true, variant: 'community', authorId: m.userId, ts: m.timestamp, name: username, avatar: game3AvInitial(initial(username), m.userId), avatarColor: game3AvatarBg(username, m.userId), time: formatTime(m.timestamp), parts: partsFromMessage(m), reactions, onToggleReaction: A.reactToMessage ? (emoji) => A.reactToMessage(m.id, m.userId, emoji) : null, onAddReaction: A.reactToMessage ? openReactPicker : null, actions: msgActions, receipt: isYou && m.read ? 'read' : (isYou && m.delivered ? 'delivered' : null) };
        });
    };

    const escapeRe = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mentionsMe = (text, name) => !!name && new RegExp('(^|\\s)@' + escapeRe(name) + '(?![\\w.-])', 'i').test(String(text || ''));
    const clockOf = (ts, h24) => new Date(ts).toLocaleTimeString([], h24 ? { hour: '2-digit', minute: '2-digit', hour12: false } : { hour: 'numeric', minute: '2-digit' });
    const fullStamp = (ts, h24) => new Date(ts).toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !h24 });
    const headStamp = (ts, h24) => {
        const d = new Date(ts);
        const t = clockOf(ts, h24);
        if (d.toDateString() === new Date().toDateString()) return 'Today at ' + t;
        if (d.toDateString() === new Date(Date.now() - 864e5).toDateString()) return 'Yesterday at ' + t;
        return d.toLocaleDateString() + ' ' + t;
    };
    const dayLabel = (ts) => (ts ? new Date(ts).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : '');
    const withDividers = (s, rows) => {
        const msgs = s.messages || [];
        let prev = '';
        return rows.flatMap((r, i) => {
            const d = dayLabel(msgs[i] && msgs[i].timestamp);
            const out = [];
            if (d && d !== prev) { out.push(Game3DayDivider({ key: 'day' + i, label: d })); prev = d; }
            out.push(r);
            return out;
        });
    };
    const moreItemsFor = (m, s, username, openPicker) => {
        const close = () => { st.moreFor = null; render(); };
        const saved = (s.savedIds || []).includes(m.id);
        const items = [
            A.reactToMessage ? { key: 'react', label: 'Add Reaction', glyph: '😀', onClick: (e) => { st.moreFor = null; openPicker(e); } } : null,
            { key: 'reply', label: 'Reply', glyph: '↩', onClick: () => { close(); if (A.startReply) A.startReply({ id: m.id, username, text: m.content }); } },
            { key: 'mention', label: 'Mention @' + username, glyph: '@', onClick: () => { close(); if (A.setInput) A.setInput((s.chatInputValue || '') + '@' + username + ' '); } },
            { key: 'copy', label: 'Copy Text', glyph: '📋', onClick: () => { close(); if (navigator.clipboard) navigator.clipboard.writeText(m.content || '').catch(() => {}); } },
            A.markUnread ? { key: 'unread', label: 'Mark Unread', glyph: '🔵', onClick: () => { st.moreFor = null; A.markUnread(m.id); render(); } } : null,
            A.toggleSave ? { key: 'save', label: saved ? 'Remove from Saved' : 'Save for Later', glyph: '🔖', onClick: () => { close(); A.toggleSave({ id: m.id, who: username, text: m.content || '' }); } } : null,
            s.devMode ? { key: 'cid', label: 'Copy Message ID', glyph: '🆔', onClick: () => { close(); if (navigator.clipboard) navigator.clipboard.writeText(String(m.id)).catch(() => {}); } } : null,
        ].filter(Boolean);
        return items;
    };
    const mentionNames = (s) => [...(s.memberCategories || []).flatMap((c) => (c.members || []).map((m) => m.name)), ...(s.memberApps || []).map((a) => a.name)].filter(Boolean);
    const game3NewBar = (s) => {
        const msgs = s.messages || [];
        const selfId = s.userId;
        const fresh = s.newAt ? msgs.filter((m) => m.type !== 'system' && String(m.userId) !== String(selfId) && m.timestamp / 1000 > s.newAt) : [];
        if (!fresh.length || s.chatSearch || s.homeMode) return null;
        return Game3NewBar({ key: 'newbar', count: fresh.length, since: clockOf(s.newAt * 1000, s.h24), onJump: () => { const el = root.querySelector('#newline'); if (el) el.scrollIntoView({ block: 'center' }); }, onRead: A.markChannelRead ? () => A.markChannelRead() : null });
    };
    const game3Rows = (s) => {
        const msgs = s.messages || [];
        const selfId = s.userId;
        const newIndex = s.newAt ? msgs.findIndex((m) => m.type !== 'system' && String(m.userId) !== String(selfId) && m.timestamp / 1000 > s.newAt) : -1;
        const quick = [...new Set([...(st.recentEmoji || []), '\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}'])].slice(0, 3);
        const myName = s.currentUser && (s.currentUser.displayName || s.currentUser.username || s.currentUser.name);
        const rows = msgs.map((m, i) => {
            if (m.type === 'system') {
                if (!m.sys) return null;
                const stamp = m.timestamp ? new Date(m.timestamp).toLocaleDateString('en-US') + ' ' + clockOf(m.timestamp, s.h24) : '';
                return Game3SystemLine({ key: m.id || ('m' + i), name: m.sys.name, text: m.sys.text, time: stamp, fullTime: m.timestamp ? fullStamp(m.timestamp, s.h24) : '', onWave: m.sys.canWave && A.wave ? () => A.wave(m.sys.userId) : null });
            }
            const kindModule = messageKindFor(m);
            if (kindModule) return kindModule.mount({ m, s, A, h, render, key: m.id || ('m' + i) });
            const username = (A.resolveProfile && A.resolveProfile(m.userId)) || m.username || 'User';
            const isYou = !!selfId && String(m.userId) === String(selfId);
            const prev = msgs[i - 1];
            const continuation = !!prev && prev.type !== 'system' && String(prev.userId) === String(m.userId) && !(m.timestamp && prev.timestamp && m.timestamp - prev.timestamp >= 7 * 60e3);
            const nameFor = (u) => (String(u) === String(selfId) ? 'You' : ((A.resolveProfile && A.resolveProfile(u)) || 'someone'));
            const reactions = Array.isArray(m.reactions) ? m.reactions.map(r => ({ emoji: r.emoji, count: r.count != null ? r.count : (r.users ? r.users.length : 1), you: !!(r.you || (r.users && selfId && r.users.includes(selfId))), who: r.users ? r.users.map(nameFor) : null })) : [];
            const remember = (emoji) => { if (EMOJI.includes(emoji)) st.recentEmoji = [emoji, ...(st.recentEmoji || []).filter((x) => x !== emoji)].slice(0, 3); };
            const react = (emoji) => { remember(emoji); if (A.reactToMessage) A.reactToMessage(m.id, m.userId, emoji); };
            const openPicker = () => {
                if (!A.reactToMessage) return;
                st.reactPickFor = st.reactPickFor === m.id ? null : m.id;
                st.moreFor = null;
                render();
            };
            return Game3Message({
                ...messageProps(m, { s, A }),
                key: m.id || ('m' + i), id: m.id ? 'm-' + m.id : null,
                name: username, initial: game3AvInitial(initial(username), m.userId), avatarColor: game3AvatarBg(username, m.userId),
                reply: m.replyTo ? replyLine(m.replyTo, A, msgs) : null,
                onJumpReply: (id) => { const el = id && root.querySelector('#m-' + id); if (el) el.scrollIntoView({ block: 'center' }); },
                headTime: m.timestamp ? headStamp(m.timestamp, s.h24) : formatTime(m.timestamp),
                quick, mention: !isYou && mentionsMe(m.content, myName),
                onOpenProfile: () => openProfileFor(app, s, m.userId, username),
                onMention: A.setInput ? () => A.setInput((s.chatInputValue || '') + '@' + username + ' ') : null,
                time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], s.h24 ? { hour: '2-digit', minute: '2-digit', hour12: false } : { hour: 'numeric', minute: '2-digit' }) : formatTime(m.timestamp), fullTime: m.timestamp ? fullStamp(m.timestamp, s.h24) : '',
                continuation: !s.gamePrefCompact && continuation, compact: !!s.gamePrefCompact, previews: s.previews !== false, embeds: s.embeds !== false, text: m.content || '', reactions, mine: isYou, devMode: !!s.devMode, messageId: m.id, userId: m.userId, jumbo: !!s.jumbo && isJumbo(m.content),
                onReact: A.reactToMessage ? react : null,
                onAddReaction: A.reactToMessage ? openPicker : null,
                onReply: () => A.startReply && A.startReply({ id: m.id, userId: m.userId, username, content: m.content }),
                onDelete: isYou && A.deleteMessage ? () => A.deleteMessage(m.id) : null,
                onPin: A.pinMessage ? () => A.pinMessage(m.id) : null,
                pinned: (s.pins || []).some((p) => p.id === m.id),
                saved: (s.savedIds || []).includes(m.id),
                onSave: A.toggleSave ? () => A.toggleSave({ id: m.id, who: username, text: m.content || '' }) : null,
                pickerOpen: st.reactPickFor === m.id,
                onPick: (em) => { st.reactPickFor = null; react(em); render(); },
                sendState: m.send || null, seen: !!m.seen, accountName: (s.accountNames || {})[m.userId] || '',
                onRetry: () => A.retrySend && A.retrySend(m.id),
                onJump: s.chatSearch ? () => { if (A.setChatSearch) A.setChatSearch(''); setTimeout(() => { const el = root.querySelector('#m-' + m.id); if (el) el.scrollIntoView({ block: 'center' }); }, 600); } : null,
                onMore: () => { st.moreFor = st.moreFor === m.id ? null : m.id; render(); },
                moreOpen: st.moreFor === m.id,
                moreItems: moreItemsFor(m, s, username, openPicker),
                remind: A.remindMe ? [[20, '20m'], [60, '1h'], [180, '3h'], [1440, '1d']] : [],
                onRemind: (mn) => { st.moreFor = null; if (A.remindMe) A.remindMe(mn, { who: username, text: m.content || '', messageId: m.id }); render(); },
            });
        });
        const all = rows.flatMap((row, i) => (i === newIndex ? [Game3NewDivider({ key: 'newdiv' }), row] : [row])).filter(Boolean);
        return s.chatSearch ? [Game3SearchBar({ key: 'sres', count: msgs.length, query: s.chatSearch, onClear: () => A.setChatSearch && A.setChatSearch('') }), ...all] : all;
    };

    return { mapMessages, withDividers, game3Rows, game3NewBar, mentionNames };
}
