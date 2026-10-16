import * as webjsx from '../vendor/webjsx/index.js';
import { Icon } from './components/shell.js';
import { register } from './debug.js';
import { Chat, ChatComposer, TypingIndicator } from './components/chat.js';
import {
    ServerRail, ChannelItem, MemberList, MobileHeader,
    UserPanel, VoiceStrip, VoiceUser, ThreadPanel, ForumView, PageView, Banner, UserCard, ReplyBar,
} from './components/community.js';
import { VoiceControls, VoiceSettingsModal, AudioQueue, PttButton, VadMeter, WebcamPreview } from './components/voice.js';
import { ContextMenu, Dialog } from './components/editor-primitives.js';
import { EmojiPicker, CommandPalette, AuthModal, BootOverlay, SettingsPopover, VideoLightbox, ImageLightbox } from './components/overlay-primitives.js';
import { attempt } from './best-effort.js';

const h = webjsx.createElement;

const CHANNEL_ICON = { voice: 'speaker', forum: 'forum', threaded: 'thread', announcement: 'send', page: 'page', text: 'hash' };

function UserCardOverlay({ member, onClose } = {}) {
    if (!member) return null;
    return Dialog({
        open: true, onClose, dismissible: true,
        ariaLabel: (member.name || member.identity || 'user') + ' profile',
        children: UserCard({
            identity: member.identity, name: member.name, color: member.color,
            bannerUrl: member.bannerUrl, status: member.status, statusLabel: member.statusLabel,
            bio: member.bio, roles: member.roles, joinedAt: member.joinedAt,
            joinedServerAt: member.joinedServerAt, serverName: member.serverName,
            actions: member.actions,
        }),
    });
}

function DropAnywhereOverlay({ active, fileCount } = {}) {
    if (!active) return null;
    return h('div', { class: 'ca-drop-overlay', role: 'status', 'aria-live': 'polite' },
        h('div', { class: 'ca-drop-overlay-inner' },
            Icon('arrow-up', { size: 32 }),
            h('span', { class: 'ca-drop-overlay-label' },
                fileCount > 1 ? `drop ${fileCount} files` : 'drop file')));
}

const brandContext = (s, ch) => {
    const server = (s.servers || []).find((sv) => sv.id === s.currentServerId);
    const slash = () => h('span', { class: 'slash' }, ' / ');
    return [
        ...(server && !s.homeMode ? [slash(), h('span', { class: 'ca-brand-server' }, server.name)] : []),
        h('span', { class: 'ca-brand-room' }, slash(), ch.name || 'general'),
    ];
};

const serverAbbr = (sv) => {
    if (sv.abbr) return sv.abbr;
    const words = String(sv.name || '?').trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2)).toUpperCase();
};

export function mountCommunityApp(root, adapter = {}) {
    if (!root) throw new Error('mountCommunityApp: root required');
    const get = typeof adapter.get === 'function' ? adapter.get : () => ({});
    const A = adapter.actions || {};
    const H = adapter.helpers || {};
    const brandName = adapter.brandName || 'app';
    const avatarColor = H.avatarColor || (() => 'var(--accent)');
    const initial = H.initial || ((n) => String(n || '?').slice(0, 1).toUpperCase());
    const formatTime = H.formatTime || ((t) => new Date(t || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));

    let ctx = { open: false, x: 0, y: 0, items: [] };
    let emoji = { open: false, x: 0, y: 0, onSelect: null };
    let palette = { open: false, items: [], onSelect: null };
    let card = { open: false, member: null };
    let dropAnywhere = { active: false, count: 0, fileCount: 0 };
    let imageLightbox = { open: false, src: null, alt: '' };

    const railServerAdd = (s) => (A.createOrJoinServer)
        ? h('a', { href: '#', class: 'ca-rail-server-add', title: 'Create or join a server', 'aria-label': 'create or join a server', onclick: (e) => { e.preventDefault(); A.createOrJoinServer(); } }, Icon('plus', { size: 15 }))
        : null;
    const railServerExplore = (s) => (A.explore)
        ? h('a', { href: '#', class: 'ca-rail-server-explore', title: 'Find new servers to join', 'aria-label': 'find new servers to join', onclick: (e) => { e.preventDefault(); A.explore(); } }, Icon('compass', { size: 15 }))
        : null;
    const railServersView = (s) => {
        const servers = s.servers || [];
        if (!servers.length && !A.createOrJoinServer) return null;
        return h('div', { class: 'ca-rail-servers' },
            railServerPill({ name: 'home', _home: true }, s),
            ...servers.map(sv => railServerPill(sv, s)),
            railServerAdd(s), railServerExplore(s));
    };

    const railChannelsView = (s) => {
        if (s.homeMode) return dmRailView(s);
        const out = [];
        const channels = [...(s.channels || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        const text = channels.filter(c => c.type !== 'voice' && c.type !== 'threaded');
        const voice = channels.filter(c => c.type === 'voice' || c.type === 'threaded');
        const cur = s.currentChannel || {};
        const servers = s.servers || [];
        if (text.length || !servers.length) {
            out.push(groupHeader('rooms', s, 'text'));
        }
        if (text.length) {
            for (const c of text) out.push(railPill(c, cur, false, s));
        } else if (!servers.length) {
            out.push(h('div', { class: 'rail-empty', role: 'status' }, 'no rooms yet'));
        }
        if (voice.length) {
            out.push(groupHeader('voice', s, 'voice'));
            for (const c of voice) out.push(railPill(c, cur, true, s));
        }
        return h('div', { class: 'ca-rail-channels' }, ...out);
    };

    const dmRailView = (s) => {
        const convos = s.dmConversations || [];
        const items = convos.map((c) => h('a', {
            href: '#', class: s.activeDmPeer === c.id ? 'active' : '', 'aria-label': 'conversation with ' + c.name,
            onclick: (e) => { e.preventDefault(); A.selectDm && A.selectDm(c.id); },
        }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('user', { size: 15 })), h('span', {}, c.name)));
        return h('div', { class: 'ca-rail-channels' },
            h('div', { class: 'group group-header' },
                h('span', {}, 'direct messages'),
                A.newDm ? h('button', { type: 'button', class: 'group-add-btn', 'aria-label': 'new message', title: 'New message', onclick: (e) => { e.preventDefault(); A.newDm(); } }, Icon('plus', { size: 13 })) : null),
            ...(items.length ? items : [h('div', { class: 'rail-empty', role: 'status' }, 'no conversations yet')]));
    };

    const groupHeader = (label, s, createType) => h('div', { class: 'group group-header' },
        h('span', {}, label),
        (s.canManage && A.createChannel)
            ? h('button', {
                type: 'button', class: 'group-add-btn', 'aria-label': 'create ' + label + ' channel', title: 'Create ' + label + ' channel',
                onclick: (e) => { e.preventDefault(); e.stopPropagation(); A.createChannel(createType || null); },
            }, Icon('plus', { size: 13 }))
            : null);

    let railDragId = null;
    const railPill = (c, cur, isVoice, s) => {
        const active = cur.id === c.id;
        const inVoice = isVoice && s.voiceConnected && s.voiceChannelName === c.name;
        const glyph = inVoice ? h('span', { class: 'glyph glyph-voice', 'aria-hidden': 'true' }, h('span', { class: 'ds-dot ds-dot-live' }))
            : (c.type === 'threaded' ? h('span', { class: 'glyph glyph-threaded', 'aria-hidden': 'true' }, Icon('circle-dot', { size: 15 }))
                : h('span', { class: 'glyph glyph-' + (c.type || 'text'), 'aria-hidden': 'true' }, Icon(CHANNEL_ICON[c.type] || 'hash', { size: 15 })));
        const canReorder = !!s.canManage && !!A.reorderChannel;
        const dropAllowed = () => !!railDragId && railDragId !== c.id;
        return h('a', {
            href: '#', class: active ? 'active' : '', 'aria-label': (c.name || c.id) + (inVoice ? ' (in voice)' : ''),
            title: canReorder ? ((c.name || c.id) + ': drag, or hold Alt and press the arrow keys, to reorder') : (c.name || c.id),
            'aria-keyshortcuts': canReorder ? 'Alt+ArrowUp Alt+ArrowDown' : null,
            onclick: (e) => { e.preventDefault(); A.switchChannel && A.switchChannel(c); },
            oncontextmenu: (e) => { e.preventDefault(); A.channelContext && A.channelContext(c.id, e.clientX, e.clientY); },
            draggable: canReorder ? 'true' : null,
            ondragstart: canReorder ? (e) => { railDragId = c.id; e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('rail-dragging'); } : null,
            ondragend: canReorder ? (e) => { railDragId = null; e.currentTarget.classList.remove('rail-dragging'); } : null,
            ondragover: canReorder ? (e) => { if (!dropAllowed()) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('rail-drop'); } : null,
            ondragleave: canReorder ? (e) => { e.currentTarget.classList.remove('rail-drop'); } : null,
            ondrop: canReorder ? (e) => {
                e.preventDefault();
                const src = railDragId;
                railDragId = null;
                e.currentTarget.classList.remove('rail-drop');
                if (src && src !== c.id) A.reorderChannel(src, c.id);
            } : null,
            onkeydown: canReorder ? (e) => {
                if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
                e.preventDefault();
                A.reorderChannel(c.id, e.key === 'ArrowUp' ? -1 : 1);
            } : null,
        }, glyph, h('span', {}, c.name || c.id),
            c.unreadCount ? h('span', { class: 'count' }, c.unreadCount > 99 ? '99+' : String(c.unreadCount)) : null);
    };

    const railServerPill = (sv, s) => {
        const active = sv._home ? s.homeMode : (!s.homeMode && s.currentServerId === sv.id);
        return h('a', {
            href: '#', class: active ? 'active' : '', 'aria-label': sv._home ? 'home' : (sv.name || sv.id),
            title: sv._home ? 'home' : (sv.name || sv.id),
            onclick: (e) => { e.preventDefault(); sv._home ? (A.goHome && A.goHome()) : (A.switchServer && A.switchServer(sv.id)); },
            oncontextmenu: sv._home ? null : (e) => { e.preventDefault(); A.serverContext && A.serverContext(sv.id, e.clientX, e.clientY); },
        }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, sv._home ? Icon('forum', { size: 15 }) : serverAbbr(sv)),
            h('span', {}, sv.name || sv.id),
            sv.unreadCount ? h('span', { class: 'count' }, sv.unreadCount > 99 ? '99+' : String(sv.unreadCount)) : null);
    };

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
        if (m.replyTo) {
            const who = m.replyTo.username || (m.replyTo.userId && A.resolveProfile && A.resolveProfile(m.replyTo.userId)) || 'User';
            const quoted = m.replyTo.content ? (m.replyTo.content || '').replace(/\n/g, ' ').slice(0, 120) : '(message unavailable)';
            parts.push({ kind: 'md', text: '> **@' + who + ':** ' + quoted });
        }
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
                        if (api.emojiPicker) {
                            api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.bottom + 4 : 200, (em) => A.reactToMessage(m.id, m.userId, em));
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
                if (api.emojiPicker) api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.bottom + 4 : 200, (em) => A.reactToMessage(m.id, m.userId, em));
                else A.reactToMessage(m.id, m.userId);
            };
            return { key: m.id || ('m' + i), who: isYou ? 'you' : 'them', flat: true, variant: 'community', authorId: m.userId, ts: m.timestamp, name: username, avatar: initial(username), avatarColor: avatarColor(m.userId), time: formatTime(m.timestamp), parts: partsFromMessage(m), reactions, onToggleReaction: A.reactToMessage ? (emoji) => A.reactToMessage(m.id, m.userId, emoji) : null, onAddReaction: A.reactToMessage ? openReactPicker : null, actions: msgActions, receipt: isYou && m.read ? 'read' : (isYou && m.delivered ? 'delivered' : null) };
        });
    };

    const chatView = (s) => {
        const ch = s.currentChannel || {};
        const sub = s.homeMode ? 'encrypted' : ch.type === 'voice' ? 'voice' : ch.type === 'forum' ? 'forum' : ch.type === 'page' ? 'page' : ch.type === 'announcement' ? 'announcement' : 'public';
        const rt = s.replyTarget;
        const replyPreview = rt ? ReplyBar({
            quotedAuthor: rt.username || 'User', quotedMessage: rt.content || '',
            onCancel: (e) => { e && e.preventDefault && e.preventDefault(); A.cancelReply && A.cancelReply(); },
        }) : null;
        const locked = !!s.composerLockedReason;
        const emptySub = s.homeMode
            ? 'Pick a conversation on the left, or start one with +.'
            : 'Be the first to post in #' + (ch.name || 'general') + '.';
        const typingBar = TypingIndicator({ users: s.typingUsers || [] });
        return Chat({
            title: ch.name || 'general', sub, locked, emptySub, messages: mapMessages(s), header: null,
            composer: h('div', { class: 'cm-composer-wrap' }, replyPreview, typingBar, ChatComposer({
                value: s.chatInputValue || '',
                placeholder: s.composerLockedReason ? s.composerLockedReason : rt ? 'reply to ' + (rt.username || 'User') + '…' : (s.homeMode ? 'message ' + (s.activeDmPeer ? (ch.name || '') : 'someone') : 'message #' + (ch.name || 'general')) + '…',
                onInput: (v) => A.setInput && A.setInput(v),
                onSend: (v) => { const t = (v || '').trim(); if (t) A.send && A.send(t, rt ? { replyTo: rt } : undefined); },
                onAttach: (!s.composerLockedReason && A.attachFiles) ? (files) => A.attachFiles(files) : null,
                disabled: !!s.composerLockedReason, disabledReason: s.composerLockedReason || undefined,
            })),
        });
    };

    const voiceEmpty = (s) => h('div', { class: 'vx-grid-empty', role: 'status' },
        Icon('speaker', { size: 28 }),
        h('p', { class: 'vx-grid-empty-title' }, 'quiet in here'),
        h('p', { class: 'vx-grid-empty-sub' }, 'no one else is connected to ' + (s.currentChannel && s.currentChannel.name || 'this channel') + ' right now.'));

    const audioQueueView = (s) => (s.audioQueueItems && s.audioQueueItems.length)
        ? AudioQueue({
            segments: s.audioQueueItems, currentSegmentId: s.audioQueueCurrentId, paused: !!s.audioQueuePaused,
            onReplay: (id) => A.replaySegment && A.replaySegment(id), onSkip: () => A.skipSegment && A.skipSegment(),
            onResume: () => A.resumeQueue && A.resumeQueue(), onPause: () => A.pauseQueue && A.pauseQueue(),
        })
        : null;

    const voiceView = (s) => {
        const participants = s.voiceParticipants || [];
        const transmitMode = s.pttUiMode === 'vad' ? 'vad' : 'ptt';
        return h('div', { class: 'vx-view' },
            participants.length
                ? h('div', { class: 'vx-grid' }, ...participants.map((p, i) => VoiceUser({ ...p, key: p.identity || p.id || i })))
                : voiceEmpty(s),
            audioQueueView(s),
            h('div', { class: 'vx-dock' },
                h('span', { class: 'vx-dock-mode', role: 'status', 'aria-label': 'transmit mode' }, transmitMode === 'vad' ? 'voice activity' : 'push to talk'),
                s.webcamEnabled ? WebcamPreview({ videoStream: s.webcamStream, resolution: s.webcamResolution, fps: s.webcamFps, enabled: true }) : null,
                transmitMode === 'vad' ? VadMeter({ level: s.micRawLevel || 0, threshold: s.vadThreshold, onThresholdChange: (t) => A.setVadThreshold && A.setVadThreshold(t) }) : null,
                transmitMode === 'ptt' ? PttButton({ state: s.isSpeaking ? 'live' : 'idle', mode: transmitMode, disabled: !!s.voiceListenOnly, disabledReason: 'No microphone: listening only', onHoldStart: () => A.pttStart && A.pttStart(), onHoldEnd: () => A.pttStop && A.pttStop() }) : null,
                VoiceControls({
                    muted: !!s.micMuted, deafened: !!s.voiceDeafened,
                    onMic: () => A.toggleMic && A.toggleMic(),
                    onDeafen: () => A.toggleDeafen && A.toggleDeafen(),
                    onSettings: () => A.openVoiceSettings && A.openVoiceSettings(),
                    onLeave: () => A.leaveVoice && A.leaveVoice(),
                }),
            ),
        );
    };

    const view = () => {
        const s = get();
        const ch = s.currentChannel || {};
        const inVoiceChannel = ch.type === 'voice';
        const bodyMain = inVoiceChannel ? voiceView(s)
            : ch.type === 'forum' ? ForumView({ posts: s.forumPosts || [], onSelect: (id) => A.openThread && A.openThread(id), onNewPost: () => A.newForumPost && A.newForumPost(), resolveAuthor: A.resolveAuthor })
            : ch.type === 'page' ? PageView({ title: ch.name, html: s.pageHtml || '', author: s.pageAuthor || '', updatedAt: s.pageUpdatedAt || 0, isAdmin: !!s.canManage, onEdit: () => A.editPage && A.editPage() })
            : chatView(s);
        const showVoiceBanner = s.voiceConnected && s.voiceChannelName && !(inVoiceChannel && s.voiceChannelName === ch.name);
        return h('div', {
            class: 'ca-app',
            ondragenter: (e) => {
                if (!A.attachFiles) return;
                e.preventDefault();
                dropAnywhere = { active: true, count: dropAnywhere.count + 1, fileCount: e.dataTransfer ? e.dataTransfer.items.length : 0 };
                render();
            },
            ondragover: (e) => { if (A.attachFiles) e.preventDefault(); },
            ondragleave: (e) => {
                if (!A.attachFiles || !dropAnywhere.active) return;
                const count = dropAnywhere.count - 1;
                dropAnywhere = count > 0 ? { ...dropAnywhere, count } : { active: false, count: 0, fileCount: 0 };
                render();
            },
            ondrop: (e) => {
                if (!A.attachFiles) return;
                e.preventDefault();
                dropAnywhere = { active: false, count: 0, fileCount: 0 };
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) A.attachFiles(e.dataTransfer.files);
                render();
            },
            onclick: (e) => {
                const a = e.target.closest && e.target.closest('.chat-image');
                if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                const img = a.querySelector('img');
                if (!img) return;
                e.preventDefault();
                imageLightbox = { open: true, src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
                render();
            },
        },
            DropAnywhereOverlay({ active: dropAnywhere.active, fileCount: dropAnywhere.fileCount }),
            h('a', { href: '#app-main', class: 'skip-link' }, 'skip to main content'),
            h('header', { class: 'app-topbar' },
                h('span', { class: 'brand' }, brandName, ...brandContext(s, ch)),
                h('span', {}),
                h('nav', {},
                    h('a', { href: '../', title: 'Home', onclick: (e) => { if (A.goHome) { e.preventDefault(); A.goHome(); } } }, 'home'),
                    h('a', { href: '#', title: 'Servers', onclick: (e) => { e.preventDefault(); A.openServers && A.openServers(); } }, 'servers'),
                    h('a', { href: 'https://github.com/AnEntrypoint/zellous', target: '_blank', rel: 'noopener' }, 'source ->'),
                ),
            ),
            MobileHeader({ channelType: s.homeMode ? 'dm' : (ch.type || 'text'), channelName: ch.name || '', serverName: s.homeMode ? '' : (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || ''), membersOpen: !!s.memberListOpen, menuOpen: !!s.mobileMenuOpen, onMenu: () => A.openMobileMenu && A.openMobileMenu(), onMembers: () => A.toggleMembers && A.toggleMembers() }),
            Banner({ tone: 'warning', message: 'Not connected to any relay. Messages won’t send or arrive.', visible: s.isConnected === false, actionLabel: A.retryConnection ? 'Retry now' : null, onAction: () => A.retryConnection && A.retryConnection() }),
            Banner({ tone: 'success', visible: !!showVoiceBanner, message: showVoiceBanner ? ('In voice: ' + (s.voiceChannelName || '') + ': click to return') : '', actionLabel: 'Leave', onAction: (e) => { if (e && e.stopPropagation) e.stopPropagation(); A.leaveVoice && A.leaveVoice(); }, onClick: () => A.returnToVoice && A.returnToVoice() }),
            h('div', { class: 'app-body' + (s.mobileMenuOpen ? ' ca-rail-open' : '') },
                h('aside', { class: 'app-side ca-rail' + (s.mobileMenuOpen ? ' open' : ''), inert: isNarrowViewport && !s.mobileMenuOpen ? true : null }, railServersView(s), railChannelsView(s)),
                h('main', { class: 'app-main ds-app-surface', id: 'app-main', tabindex: '-1', onclick: () => { if (s.mobileMenuOpen && A.closeMobileMenu) A.closeMobileMenu(); } },
                    h('h1', { class: 'sr-only' }, ch.name || 'general'),
                    !inVoiceChannel && s.voiceConnected ? VoiceStrip({ channelName: s.voiceChannelName, status: s.voiceConnectionState || 'connected', muted: !!s.micMuted, deafened: !!s.voiceDeafened, onMute: () => A.toggleMic && A.toggleMic(), onDeafen: () => A.toggleDeafen && A.toggleDeafen(), onLeave: () => A.leaveVoice && A.leaveVoice(), open: true }) : null,
                    UserPanel({ name: (s.currentUser && (s.currentUser.displayName || s.currentUser.username || s.currentUser.name)) || 'You', tag: s.currentUser && s.currentUser.tag, color: avatarColor(s.userId), muted: !!s.micMuted, deafened: !!s.voiceDeafened, onMute: () => A.toggleMic && A.toggleMic(), onDeafen: () => A.toggleDeafen && A.toggleDeafen(), onSettings: () => A.openSettings && A.openSettings(), onMembers: A.toggleMembers ? () => A.toggleMembers() : null, membersOpen: !!s.memberListOpen }),
                    bodyMain,
                ),
                MemberList({
                    categories: s.memberCategories || [], open: !!s.memberListOpen, userId: s.userId,
                    onSelectMember: (m) => { card = { open: true, member: m }; render(); },
                }),
            ),
            ctx.open ? ContextMenu({ items: ctx.items, anchor: { x: ctx.x, y: ctx.y }, onClose: () => { ctx = { ...ctx, open: false }; render(); } }) : null,
            card.open ? UserCardOverlay({ member: card.member, onClose: () => { card = { ...card, open: false }; render(); } }) : null,
            emoji.open ? EmojiPicker({ open: true, anchorX: emoji.x, anchorY: emoji.y, onSelect: (em) => { attempt(() => { emoji.onSelect && emoji.onSelect(em); }); emoji = { ...emoji, open: false }; render(); }, onClose: () => { emoji = { ...emoji, open: false }; render(); } }) : null,
            palette.open ? CommandPalette({ open: true, items: palette.items, onSelect: (it) => { attempt(() => { palette.onSelect && palette.onSelect(it); }); palette = { ...palette, open: false }; render(); }, onClose: () => { palette = { ...palette, open: false }; render(); } }) : null,
            s.showAuthModal ? AuthModal({ open: true, isLoggedIn: !!s.userId, mode: s.authMode || 'extension', error: s.authError || '', busy: !!s.authBusy, onModeChange: (m) => A.setAuthMode && A.setAuthMode(m), onConnectExtension: () => A.authExtension && A.authExtension(), onGenerate: () => A.authGenerate && A.authGenerate(), onImport: (k) => A.authImport && A.authImport(k), onClose: () => A.closeAuth && A.closeAuth() }) : null,
            BootOverlay({ progress: s.bootProgress || 0, phase: s.bootPhase || '', errored: !!s.bootErrored, visible: !!s.bootVisible }),
            s.settingsOpen ? SettingsPopover({ open: true, anchorX: (s.settingsAnchor && s.settingsAnchor.x) || 0, anchorY: (s.settingsAnchor && s.settingsAnchor.y) || 0, sections: s.settingsSections || [], onClose: () => A.openSettings && A.openSettings() }) : null,
            s.voiceSettingsOpen ? VoiceSettingsModal({ open: true, mode: s.voiceMode || 'ptt', inputId: s.inputDeviceId, outputId: s.outputDeviceId, inputDevices: s.inputDevices || [], outputDevices: s.outputDevices || [], vadThreshold: s.vadThreshold, rnnoise: !!s.rnnoiseEnabled, autoGain: !!s.autoGainEnabled, forceTurn: !!s.forceTurnEnabled, bitrate: s.voiceBitrate, volume: s.masterVolume, onChange: (p) => A.voiceSettingsChange && A.voiceSettingsChange(p), onSave: () => A.voiceSettingsSave && A.voiceSettingsSave(), onCancel: () => A.voiceSettingsClose && A.voiceSettingsClose(), onClose: () => A.voiceSettingsClose && A.voiceSettingsClose() }) : null,
            s.videoLightbox && s.videoLightbox.open ? VideoLightbox({ open: true, src: s.videoLightbox.src, label: s.videoLightbox.label, onClose: () => A.closeVideoLightbox && A.closeVideoLightbox() }) : null,
            imageLightbox.open ? ImageLightbox({ open: true, src: imageLightbox.src, alt: imageLightbox.alt, onClose: () => { imageLightbox = { open: false, src: null, alt: '' }; render(); } }) : null,
            s.threadPanelOpen ? ThreadPanel({ threads: s.threads || [], activeId: s.activeThreadId, onSelect: (id) => A.selectThread && A.selectThread(id), onCreate: () => A.createThread && A.createThread(), onClose: () => A.closeThreadPanel && A.closeThreadPanel(), onReply: A.replyToThread ? (text) => A.replyToThread(text) : undefined }) : null,
        );
    };

    const render = () => { webjsx.applyDiff(root, view()); };

    const NARROW_VIEWPORT_QUERY = '(max-width: 900px)';
    const narrowViewportQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(NARROW_VIEWPORT_QUERY) : null;
    let isNarrowViewport = !!(narrowViewportQuery && narrowViewportQuery.matches);
    if (narrowViewportQuery && narrowViewportQuery.addEventListener) narrowViewportQuery.addEventListener('change', (e) => {
        if (e.matches === isNarrowViewport) return;
        isNarrowViewport = e.matches;
        render();
    });

    const api = {
        contextMenu: { show: (items, x, y) => { ctx = { open: true, x: x | 0, y: y | 0, items: Array.isArray(items) ? items : [] }; render(); }, close: () => { ctx = { ...ctx, open: false }; render(); } },
        emojiPicker: { show: (x, y, onSelect) => { emoji = { open: true, x: x || 200, y: y || 200, onSelect }; render(); }, close: () => { emoji = { ...emoji, open: false }; render(); } },
        commandPalette: { show: (items, onSelect) => { palette = { open: true, items: items || [], onSelect }; render(); }, close: () => { palette = { ...palette, open: false }; render(); } },
        render,
    };

    let unsub = null;
    if (typeof adapter.subscribe === 'function') unsub = adapter.subscribe(render);

    register('community-app', () => {
        const s = get() || {};
        return {
            overlays: { context: ctx.open, emoji: emoji.open, palette: palette.open },
            channels: (s.channels || []).length,
            servers: (s.servers || []).length,
            messages: (s.messages || []).length,
            currentChannel: (s.currentChannel || {}).name || null,
            voiceConnected: !!s.voiceConnected,
            homeMode: !!s.homeMode,
        };
    });

    render();
    return { render, api, destroy: () => { if (unsub) attempt(() => { unsub(); }); } };
}
