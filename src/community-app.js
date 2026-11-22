import * as webjsx from '../vendor/webjsx/index.js';
import { Icon } from './components/shell.js';
import { register } from './debug.js';
import { Chat, ChatComposer, TypingIndicator } from './components/chat.js';
import {
    ServerRail, ChannelItem, MemberList, MobileHeader,
    UserPanel, VoiceStrip, ThreadPanel, ForumView, PageView, Banner, UserCard, ReplyBar,
} from './components/community.js';
import { VoiceRoom, CatchUpButton, ToggleRow, GameSettingsSection, ServerCreateForm } from './components/game3-room.js';
import { ServerDiscover, SplitPane, DiscoverList, EventsList, LeaderboardList, RecapList, PinList, RulesList, AnnouncementList, RoleList } from './components/game3-social.js';
import { GameHeader } from './components/game3-header.js';
import { Game3Message, isJumbo } from './components/game3-message.js';
import { Game3MemberList } from './components/game3-members.js';
import { Game3VoiceView } from './components/game3-voice.js';
import { Game3UserPanel } from './components/game3-user.js';
import { Game3EventsPanel } from './components/game3-events.js';
import { Game3LeaderboardPanel } from './components/game3-leaderboard.js';
import { Game3InboxPanel } from './components/game3-inbox.js';
import { Game3ServerCreate } from './components/game3-server-create.js';
import { Game3RecapPanel } from './components/game3-recap.js';
import { Game3SettingsPanel } from './components/game3-settings.js';
import { Game3PeopleHere } from './components/game3-people.js';
import { game3AvatarBg } from './components/game3-hue.js';
import { Game3Welcome } from './components/game3-welcome.js';
import { Game3DayDivider } from './components/game3-day.js';
import { Game3VoiceBar } from './components/game3-voicebar.js';
import { Game3SystemLine } from './components/game3-system.js';
import { Game3Modal } from './components/game3-modal.js';
import { Game3ServerMenu } from './components/game3-server-menu.js';
import { Game3RolesPanel } from './components/game3-roles.js';
import { Game3RulesPanel } from './components/game3-rules.js';
import { Game3SplitColumn, Game3SplitSelect } from './components/game3-split.js';
import { Game3Composer } from './components/game3-composer.js';
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
    return words.map((w) => [...w][0]).join('').slice(0, 3).toUpperCase() || '?';
};

export function mountCommunityApp(root, adapter = {}) {
    if (!root) throw new Error('mountCommunityApp: root required');
    const get = typeof adapter.get === 'function' ? adapter.get : () => ({});
    const A = adapter.actions || {};
    const H = adapter.helpers || {};
    const brandName = adapter.brandName || 'app';
    const initial = H.initial || ((n) => String(n || '?').slice(0, 1).toUpperCase());
    const formatTime = H.formatTime || ((t) => new Date(t || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));

    let ctx = { open: false, x: 0, y: 0, items: [] };
    let emoji = { open: false, x: 0, y: 0, onSelect: null };
    let palette = { open: false, items: [], onSelect: null };
    let card = { open: false, member: null };
    let serverMenuOpen = false;
    let dropAnywhere = { active: false, count: 0, fileCount: 0 };
    let imageLightbox = { open: false, src: null, alt: '' };

    const railServerAdd = (s) => (A.openServerCreate)
        ? h('a', { href: '#', class: 'ca-rail-server-add', title: 'Create a server', 'aria-label': 'create a server', onclick: (e) => { e.preventDefault(); A.openServerCreate(); } }, Icon('plus', { size: 15 }))
        : null;
    const railServerExplore = (s) => (A.explore)
        ? h('a', { href: '#', class: 'ca-rail-server-explore', title: 'Find new servers to join', 'aria-label': 'find new servers to join', onclick: (e) => { e.preventDefault(); A.explore(); } }, Icon('compass', { size: 15 }))
        : null;
    const railServersView = (s) => {
        const servers = s.servers || [];
        if (!servers.length && !A.createOrJoinServer) return null;
        return h('div', { class: 'ca-rail-servers' },
            railServerPill({ name: 'home', _home: true }, s),
            h('div', { class: 'ca-rail-sep', 'aria-hidden': 'true' }),
            ...servers.map(sv => railServerPill(sv, s)),
            railServerAdd(s), railServerExplore(s));
    };

    const railServerHead = (s) => {
        const sv = (s.servers || []).find((x) => x.id === s.currentServerId);
        return h('div', { class: 'shead', role: 'button', tabindex: '0', 'aria-haspopup': 'menu', 'aria-expanded': serverMenuOpen ? 'true' : 'false', onclick: () => { serverMenuOpen = !serverMenuOpen; render(); } }, h('span', {}, sv ? sv.name : 'home'), Icon('chevron-down-fill', { size: 18 }));
    };
    const serverMenuItems = (s) => {
        const owner = !!s.canManage;
        const out = [];
        if (owner && A.createChannel) out.push({ label: 'Create Channel', icon: 'plus', onClick: () => A.createChannel('text') }, { divider: true });
        if (A.inviteToServer && s.currentServerId) out.push({ label: 'Invite People', icon: 'members', color: '#949cf7', onClick: () => A.inviteToServer() });
        if (A.toggleMuteChannel) out.push({ label: (s.mutedChannel ? 'Unmute' : 'Mute') + ' #' + (((s.currentChannel || {}).name) || 'general'), onClick: () => A.toggleMuteChannel() });
        if (A.explore) out.push({ label: 'Discover Servers', icon: 'compass', onClick: () => A.explore() });
        out.push({ divider: true });
        if (A.openGamePrefs) out.push({ label: 'User Settings', icon: 'settings', onClick: () => A.openGamePrefs() });
        if (!owner && A.leaveServer && s.currentServerId) out.push({ divider: true }, { label: 'Leave Server', color: '#f23f43', onClick: () => A.leaveServer() });
        return out;
    };
    const railGroup = (label, s, list, cur, isVoice, createType) => {
        const head = h('div', { class: 'group group-header' },
            h('span', {}, Icon('chevron-down-fill', { size: 12 }), label),
            (s.canManage && A.createChannel && createType)
                ? h('button', { type: 'button', class: 'group-add-btn', 'aria-label': 'create ' + label, title: 'Create ' + label, onclick: (e) => { e.preventDefault(); e.stopPropagation(); A.createChannel(createType); } }, Icon('plus', { size: 13 }))
                : null);
        const vuRows = (c) => (isVoice && s.voiceConnected && s.voiceChannelName === c.name ? (s.voiceParticipants || []) : []).map((p, i) => h('div', { key: 'vu' + c.id + i, class: 'vu' + (p.speaking ? ' talk' : '') }, h('span', { class: 'ds-g3-vu-av', 'aria-hidden': 'true' }, String(p.name || p.identity || '?').trim().slice(0, 1).toUpperCase()), p.name || p.identity || ''));
        return [head, ...(list.length ? list.flatMap(c => [railPill(c, cur, isVoice, s), ...vuRows(c)]) : [h('div', { class: 'rail-empty', role: 'status' }, 'no ' + label + ' yet')])];
    };
    const railSurfaceRows = (s) => [
        h('a', { key: 'events', href: '#', class: s.gameSurface === 'events' ? 'active' : '', onclick: (e) => { e.preventDefault(); if (A.openSurface) A.openSurface('events'); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('ref-events', { size: 20 })), h('span', {}, s.eventCount ? s.eventCount + (s.eventCount === 1 ? ' Event' : ' Events') : 'Events'), s.eventLive ? h('span', { class: 'ds-g3-live' }, 'LIVE') : null),
        h('a', { key: 'leaderboard', href: '#', class: s.gameSurface === 'leaderboard' ? 'active' : '', onclick: (e) => { e.preventDefault(); if (A.openSurface) A.openSurface('leaderboard'); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('ref-leaderboard', { size: 20 })), h('span', {}, 'Leaderboard'), s.myLevel != null ? h('span', { class: 'ds-g3-rail-lv' }, 'lv ' + s.myLevel) : null),
    ];
    const railChannelsView = (s, bottom = []) => {
        if (s.homeMode) return dmRailView(s);
        const channels = [...(s.channels || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        const cur = s.currentChannel || {};
        const info = channels.filter(c => c.type === 'announcement' || c.type === 'page');
        const voice = channels.filter(c => c.type === 'voice' || c.type === 'threaded');
        const text = channels.filter(c => !info.includes(c) && !voice.includes(c));
        return h('div', { class: 'ca-rail-channels' },
            railServerHead(s),
            serverMenuOpen ? Game3ServerMenu({ items: serverMenuItems(s), onPick: () => { serverMenuOpen = false; } }) : null,
            h('div', { class: 'chans' },
                ...railSurfaceRows(s),
                h('div', { class: 'ds-g3-sep2', 'aria-hidden': 'true' }),
                ...railGroup('Information', s, info, cur, false, null),
                ...railGroup('Text Channels', s, text, cur, false, 'text'),
                ...railGroup('Voice Channels', s, voice, cur, true, 'voice')),
            ...bottom.filter(Boolean));
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
            : (c.type === 'threaded' ? h('span', { class: 'glyph glyph-threaded', 'aria-hidden': 'true' }, Icon('circle-dot', { size: 20 }))
                : h('span', { class: 'glyph glyph-' + (c.type || 'text'), 'aria-hidden': 'true' }, Icon(CHANNEL_ICON[c.type] || 'hash', { size: 20 })));
        const canReorder = !!s.canManage && !!A.reorderChannel;
        const dropAllowed = () => !!railDragId && railDragId !== c.id;
        return h('a', {
            href: '#', class: [active ? 'active' : '', c.unreadCount ? 'unread' : ''].filter(Boolean).join(' '), 'aria-label': (c.name || c.id) + (inVoice ? ' (in voice)' : ''),
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
        }, glyph, h('span', {}, c.name || c.id));
    };

    const railServerPill = (sv, s) => {
        const active = sv._home ? s.homeMode : (!s.homeMode && s.currentServerId === sv.id);
        return h('a', {
            href: '#', class: (sv._home ? 'ca-rail-home ' : '') + (active ? 'active' : ''), 'aria-label': sv._home ? 'direct messages' : (sv.name || sv.id),
            title: sv._home ? 'Direct Messages' : (sv.name || sv.id),
            style: sv._home ? null : '--sv-color:' + (sv.iconColor || sv.color || 'var(--accent)'),
            onclick: (e) => { e.preventDefault(); sv._home ? (A.goHome && A.goHome()) : (A.switchServer && A.switchServer(sv.id)); },
            oncontextmenu: sv._home ? null : (e) => { e.preventDefault(); A.serverContext && A.serverContext(sv.id, e.clientX, e.clientY); },
        }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, sv._home ? Icon('game3-home', { size: 24 }) : serverAbbr(sv)),
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
            return { key: m.id || ('m' + i), who: isYou ? 'you' : 'them', flat: true, variant: 'community', authorId: m.userId, ts: m.timestamp, name: username, avatar: initial(username), avatarColor: game3AvatarBg(username), time: formatTime(m.timestamp), parts: partsFromMessage(m), reactions, onToggleReaction: A.reactToMessage ? (emoji) => A.reactToMessage(m.id, m.userId, emoji) : null, onAddReaction: A.reactToMessage ? openReactPicker : null, actions: msgActions, receipt: isYou && m.read ? 'read' : (isYou && m.delivered ? 'delivered' : null) };
        });
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
    const game3Rows = (s) => {
        const msgs = s.messages || [];
        const selfId = s.userId;
        return msgs.map((m, i) => {
            if (m.type === 'system') {
                if (!m.sys) return null;
                const stamp = m.timestamp ? new Date(m.timestamp).toLocaleDateString('en-US') + ' ' + new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
                return Game3SystemLine({ key: m.id || ('m' + i), name: m.sys.name, text: m.sys.text, time: stamp, fullTime: m.timestamp ? new Date(m.timestamp).toLocaleString() : '', onWave: m.sys.canWave && A.wave ? () => A.wave(m.sys.userId) : null });
            }
            const username = (A.resolveProfile && A.resolveProfile(m.userId)) || m.username || 'User';
            const isYou = !!selfId && String(m.userId) === String(selfId);
            const prev = msgs[i - 1];
            const continuation = !!prev && prev.type !== 'system' && String(prev.userId) === String(m.userId);
            const reactions = Array.isArray(m.reactions) ? m.reactions.map(r => ({ emoji: r.emoji, count: r.count != null ? r.count : (r.users ? r.users.length : 1), you: !!(r.you || (r.users && selfId && r.users.includes(selfId))) })) : [];
            const react = (emoji) => A.reactToMessage && A.reactToMessage(m.id, m.userId, emoji);
            const openPicker = (e) => {
                if (!A.reactToMessage) return;
                const rect = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
                if (api.emojiPicker) api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.bottom + 4 : 200, (em) => A.reactToMessage(m.id, m.userId, em));
                else A.reactToMessage(m.id, m.userId);
            };
            return Game3Message({
                poll: m.poll ? { ...m.poll, onVote: (i) => A.votePoll && A.votePoll(m.poll.id, i) } : null,
                invite: m.invite ? { ...m.invite, onJoin: () => A.joinInvite && A.joinInvite(m.invite.serverId, m.invite.name, m.invite.color) } : null,
                key: m.id || ('m' + i), id: m.id ? 'm-' + m.id : null,
                name: username, initial: initial(username), avatarColor: game3AvatarBg(username),
                headTime: m.timestamp ? new Date(m.timestamp).toLocaleDateString('en-US') + ' ' + new Date(m.timestamp).toLocaleTimeString([], s.h24 ? { hour: '2-digit', minute: '2-digit', hour12: false } : { hour: 'numeric', minute: '2-digit' }) : formatTime(m.timestamp),
                time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], s.h24 ? { hour: '2-digit', minute: '2-digit', hour12: false } : { hour: 'numeric', minute: '2-digit' }) : formatTime(m.timestamp), fullTime: m.timestamp ? new Date(m.timestamp).toLocaleString() : '',
                continuation: !s.gamePrefCompact && continuation, compact: !!s.gamePrefCompact, previews: s.previews !== false, embeds: s.embeds !== false, text: m.content || '', reactions, mine: isYou, devMode: !!s.devMode, messageId: m.id, userId: m.userId, jumbo: !!s.jumbo && isJumbo(m.content),
                onReact: A.reactToMessage ? react : null,
                onAddReaction: A.reactToMessage ? openPicker : null,
                onReply: () => A.startReply && A.startReply({ id: m.id, userId: m.userId, username, content: m.content }),
                onDelete: isYou && A.deleteMessage ? () => A.deleteMessage(m.id) : null,
                onPin: A.pinMessage ? () => A.pinMessage(m.id) : null,
            });
        }).filter(Boolean);
    };

    const railOrder = (s) => {
        const channels = [...(s.channels || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        const info = channels.filter(c => c.type === 'announcement' || c.type === 'page');
        const voice = channels.filter(c => c.type === 'voice' || c.type === 'threaded');
        return [...info, ...channels.filter(c => !info.includes(c) && !voice.includes(c)), ...voice];
    };

    const composerKey = (e, ta, s, ch) => {
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const order = railOrder(s);
            const idx = order.findIndex(c => c.id === ch.id);
            const next = order[(idx + (e.key === 'ArrowUp' ? -1 : 1) + order.length) % order.length];
            if (next && A.switchChannel) { e.preventDefault(); A.switchChannel(next); }
            return;
        }
        if (e.key === 'ArrowUp' && !ta.value && A.setInput) {
            const mine = (s.messages || []).filter(m => String(m.userId) === String(s.userId));
            const last = mine[mine.length - 1];
            if (last) { e.preventDefault(); A.setInput(last.content || ''); }
        }
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
            title: ch.name || 'general', sub, locked, emptySub, messages: mapMessages(s), rows: (s.homeMode || s.chatSearch ? [] : [Game3Welcome({ key: 'welcome', name: ch.name || 'general', glyph: ch.type === 'announcement' ? 'megaphone' : 'hash', hint: ch.name === 'general' })]).concat(withDividers(s, game3Rows(s))), header: null,
            composer: h('div', { class: 'cm-composer-wrap' }, Game3Composer({ typing: typingBar,
                value: s.chatInputValue || '',
                placeholder: s.composerLockedReason ? s.composerLockedReason : (s.homeMode ? 'Message @' + (ch.name || 'someone') : 'Message #' + (ch.name || 'general')),
                replyTo: rt ? { username: rt.username || 'User' } : null,
                onCancelReply: () => A.startReply && A.startReply(null),
                onInput: (v) => A.setInput && A.setInput(v),
                onSend: (v) => { const t = (v || '').trim(); if (t) A.send && A.send(t, rt ? { replyTo: rt } : undefined); },
                maxLength: 190,
                onKeyDown: (e, ta) => composerKey(e, ta, s, ch),
                onAttach: (!s.composerLockedReason && A.attachFiles) ? (files) => A.attachFiles(files) : null,
                onEmoji: (e) => {
                    if (!api.emojiPicker) return;
                    const rect = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
                    api.emojiPicker.show(rect ? rect.left : 200, rect ? rect.top - 8 : 200, (em) => A.setInput && A.setInput((s.chatInputValue || '') + em));
                },
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
        const textChannel = railOrder(s).find(c => c.type !== 'voice' && c.type !== 'threaded' && c.type !== 'announcement' && c.type !== 'page');
        return h('div', { class: 'vx-view' },
            Game3VoiceView({
                participants: participants.map((p, i) => ({ id: p.identity || p.id || String(i), name: p.name || p.identity || 'user', speaking: !!p.speaking, muted: !!p.muted, videoKey: p.videoKey || null, isLocal: !!p.isLocal })),
                micMuted: !!s.micMuted,
                camera: !!s.cameraOn,
                onCamera: () => A.toggleCamera && A.toggleCamera(),
                textName: textChannel ? textChannel.name : 'general',
                onText: () => { if (textChannel && A.switchChannel) A.switchChannel(textChannel); },
                onMic: () => A.toggleMic && A.toggleMic(),
                onLeave: () => A.leaveVoice && A.leaveVoice(),
                sounds: s.soundboard || [],
                onSound: (id) => A.playSound && A.playSound(id),
            }),
        );
    };

    const view = () => {
        const s = get();
        const ch = s.currentChannel || {};
        const inVoiceChannel = ch.type === 'voice';
        const bodyMain = s.homeMode && !s.activeDmPeer ? Game3PeopleHere({ serverName: s.homeServerName || 'Zellous Public', people: s.peopleHere || [], onMessage: (id) => A.selectDm && A.selectDm(id) })
            : inVoiceChannel ? voiceView(s)
            : ch.type === 'forum' ? ForumView({ posts: s.forumPosts || [], onSelect: (id) => A.openThread && A.openThread(id), onNewPost: () => A.newForumPost && A.newForumPost(), resolveAuthor: A.resolveAuthor })
            : ch.type === 'page' && (ch.name === 'rules' || ch.name === 'pick-roles') ? surfaceBody(ch.name, s)
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
            MobileHeader({ channelType: s.homeMode ? 'dm' : (ch.type || 'text'), channelName: ch.name || '', serverName: s.homeMode ? '' : (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || ''), membersOpen: !!s.memberListOpen, menuOpen: !!s.mobileMenuOpen, onMenu: () => A.openMobileMenu && A.openMobileMenu(), onMembers: () => A.toggleMembers && A.toggleMembers() }),
            Banner({ tone: 'warning', message: 'Not connected to any relay. Messages won’t send or arrive.', visible: s.isConnected === false, actionLabel: A.retryConnection ? 'Retry now' : null, onAction: () => A.retryConnection && A.retryConnection() }),
            Banner({ tone: 'success', visible: !!showVoiceBanner, message: showVoiceBanner ? ('In voice: ' + (s.voiceChannelName || '') + ': click to return') : '', actionLabel: 'Leave', onAction: (e) => { if (e && e.stopPropagation) e.stopPropagation(); A.leaveVoice && A.leaveVoice(); }, onClick: () => A.returnToVoice && A.returnToVoice() }),
            h('div', { class: 'app-body' + (s.mobileMenuOpen ? ' ca-rail-open' : '') },
                h('aside', { class: 'app-side ca-rail' + (s.mobileMenuOpen ? ' open' : ''), inert: isNarrowViewport && !s.mobileMenuOpen ? true : null }, railServersView(s), railChannelsView(s, [ s.voiceConnected ? Game3VoiceBar({ key: 'vbar', channelName: s.voiceChannelName, serverName: (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || ''), onOpen: () => A.returnToVoice && A.returnToVoice(), onLeave: () => A.leaveVoice && A.leaveVoice() }) : null, Game3UserPanel({ statusLabel: 'Online', name: (s.currentUser && (s.currentUser.displayName || s.currentUser.username || s.currentUser.name)) || 'You', color: game3AvatarBg(s.gamePrefName || (s.currentUser && (s.currentUser.username || s.currentUser.name)) || 'You'), muted: !!s.micMuted, onMute: () => A.toggleMic && A.toggleMic(), onSettings: () => A.openGamePrefs && A.openGamePrefs() }) ].filter(Boolean))),
                h('div', { class: 'ca-right' },
            GameHeader({
                channelName: ch.name || 'general',
                channelType: ch.type || 'text',
                topic: ch.topic || '',
                memberListOpen: !!s.memberListOpen,
                onMembers: A.toggleMembers ? () => A.toggleMembers() : null,
                pinsOpen: s.gameSurface === 'pins',
                onPins: A.openSurface ? () => A.openSurface('pins') : null,
                trailing: [
                    h('label', { key: 'srch', class: 'ds-g3-srch' }, h('input', { type: 'text', placeholder: 'Search', value: s.chatSearch || '', onkeydown: (e) => { if (e.key === 'Enter' && A.setChatSearch) A.setChatSearch(e.currentTarget.value); } }), Icon('ref-search', { size: 16 })),
                    h('button', { key: 'inbox', type: 'button', class: 'ds-g3-ibtn' + (s.gameSurface === 'inbox' ? ' on' : ''), title: 'Inbox', 'aria-label': 'Inbox', onclick: () => A.openSurface && A.openSurface('inbox') }, Icon('ref-inbox', { size: 24 })),
                ],
                buttons: [
                    s.splitOptions && s.splitOptions.length ? Game3SplitSelect({ key: 'split', options: s.splitOptions, current: s.splitChannel ? s.splitChannel.id : null, onChange: (id) => A.splitTo && A.splitTo(id) }) : null,
                    h('button', { key: 'mute', type: 'button', class: 'ds-g3-ibtn' + (s.mutedChannel ? ' on' : ''), title: 'Mute Channel', 'aria-label': 'Mute Channel', 'aria-pressed': s.mutedChannel ? 'true' : 'false', onclick: () => A.toggleMuteChannel && A.toggleMuteChannel() }, Icon('ref-bell', { size: 24 })),
                ].filter(Boolean),
            }),
                    h('div', { class: 'ca-right-body' },
                h('main', { class: 'app-main ds-app-surface', id: 'app-main', tabindex: '-1', onclick: () => { if (s.mobileMenuOpen && A.closeMobileMenu) A.closeMobileMenu(); } },
                    h('h1', { class: 'sr-only' }, ch.name || 'general'),
                    bodyMain,
                                s.gameSurface === 'pins' || s.gameSurface === 'inbox' ? h('div', { class: 'ds-g3-pop-wrap' }, h('div', { class: 'ds-g3-pop' }, h('h3', { class: 'ds-g3-pop-h' }, h('span', {}, s.gameSurface === 'pins' ? 'Pinned Messages' : 'Inbox'), h('span', { class: 'ds-g3-pop-x', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: () => A.closeSurface && A.closeSurface() }, Icon('x', { size: 14 }))), h('div', { class: 'ds-g3-pop-body' }, surfaceBody(s.gameSurface, s)))) : null,
                ),
                s.splitChannel && (!ch || s.splitChannel.id !== ch.id) ? Game3SplitColumn({ name: s.splitChannel.name, messages: s.splitMessages || [], onMain: () => A.splitMain && A.splitMain(), onClose: () => A.splitTo && A.splitTo(null) }) : null,
                Game3MemberList({
                    categories: s.memberCategories || [], apps: s.memberApps || [], open: !!s.memberListOpen, userId: s.userId,
                    onSelectMember: (m) => { card = { open: true, member: m }; render(); },
                }),
                    ),
                ),
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
            s.gameServerCreateOpen ? Game3ServerCreate({ homeName: s.homeServerName || 'Zellous Public', userName: s.gamePrefName || 'You', onCreate: (v) => A.createServer && A.createServer(v.name, v.color), onClose: () => A.closeServerCreate && A.closeServerCreate(), onDiscover: A.explore ? () => { A.closeServerCreate && A.closeServerCreate(); A.explore(); } : null }) : null,
            s.gameSurface ? Dialog({ open: true, dismissible: true, onClose: () => A.closeSurface && A.closeSurface(), ariaLabel: s.gameSurface, children: h('div', { class: 'ds-g3-surface ds-g3-prefs' }, surfaceBody(s.gameSurface, s), h('button', { type: 'button', class: 'ds-g3-btn', onclick: () => A.closeSurface && A.closeSurface() }, 'Done')) }) : null,
            s.gamePrefOpen ? Game3SettingsPanel({ tab: s.gamePrefTab || 'account', onTab: (t) => A.setGamePrefTab && A.setGamePrefTab(t), name: s.gamePrefName || 'You', color: s.gamePrefColor || '', devInfo: s.devInfo || null, onDevReset: () => A.resetLocalState && A.resetLocalState(), onDevFilter: (q) => A.setDevFilter && A.setDevFilter(q), onDevRefresh: () => A.refreshDev && A.refreshDev(), presenceStatus: s.presenceStatus || 'online', presenceCustom: s.presenceCustom || '', onPresence: (k) => A.setPresence && A.setPresence(k, s.presenceCustom || ''), onCustom: (t) => A.setPresence && A.setPresence(s.presenceStatus || 'online', t), initial: String(s.gamePrefName || 'Y').slice(0, 1).toUpperCase(), level: s.myLevel || 0, xp: s.myXp || 0, servers: s.gamePrefServers || 0, toggles: Object.fromEntries((s.gamePrefToggles || []).map((t) => [t.key, !!t.checked])), micOn: !s.micMuted, onMic: () => A.toggleMic && A.toggleMic(), keywords: s.gamePrefKeywords || '', mutedChannels: s.gamePrefMuted || [], onUnmute: (id) => A.toggleMuteId && A.toggleMuteId(id), compact: !!s.gamePrefCompact, banner: s.gamePrefBanner || '', theme: s.themePref || 'ink', onTheme: (t) => A.setTheme && A.setTheme(t), onCompact: (val) => A.setGamePref && A.setGamePref('compact', val), onKeywords: (val) => A.setGamePref && A.setGamePref('kw', val), onBanner: (c) => A.setGamePref && A.setGamePref('banner', c), onToggle: (key, val) => A.setGamePref && A.setGamePref(key, val), onReset: () => A.setGamePref && A.setGamePref('reset', true), onClose: () => A.closeGamePrefs && A.closeGamePrefs() }) : null,
            s.threadPanelOpen ? ThreadPanel({ threads: s.threads || [], activeId: s.activeThreadId, onSelect: (id) => A.selectThread && A.selectThread(id), onCreate: () => A.createThread && A.createThread(), onClose: () => A.closeThreadPanel && A.closeThreadPanel(), onReply: A.replyToThread ? (text) => A.replyToThread(text) : undefined }) : null,
        );
    };

    const surfaceBody = (name, s) => {
        if (name === 'roles') return RoleList({ roles: s.roles || [], emptyText: 'No roles in this server.' });
        if (name === 'pick-roles') return Game3RolesPanel({ roles: s.selfRoles || [], onToggle: (id) => A.toggleSelfRole && A.toggleSelfRole(id), onDone: () => A.goToGeneral && A.goToGeneral() });
        if (name === 'rules') return Game3RulesPanel({ serverName: (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || ''), online: (s.rulesStats || {}).online || 0, members: (s.rulesStats || {}).members || 0, onDone: () => A.goToGeneral && A.goToGeneral() });
        if (name === 'announcements') return AnnouncementList({ items: s.announcements || [], emptyText: 'No announcements in this channel yet.' });
        if (name === 'pins') return PinList({ pins: s.pins || [], emptyText: "This channel doesn't have any pinned messages... yet.", onJump: (id) => A.jumpToMessage && A.jumpToMessage(id) });
        if (name === 'recap') return Game3RecapPanel({ items: s.recap || [], emptyText: "nothing new from anyone since you got here. you're all caught up." });
        if (name === 'inbox') return Game3InboxPanel({ tab: s.inboxTab || 'mentions', onTab: (t) => A.setInboxTab && A.setInboxTab(t), rows: s.mentions || [], saved: s.savedMessages || [], onClose: () => A.closeSurface && A.closeSurface() });
        if (name === 'leaderboard') return Game3LeaderboardPanel({ rows: (s.leaderboard || []).map(r => ({ ...r, me: String(r.id) === String(s.userId) })), emptyText: 'nobody has XP yet. every message earns some, once every 30 seconds.', onClose: () => A.closeSurface && A.closeSurface() });
        if (name === 'events') { const now = Date.now(); return Game3EventsPanel({ onCreate: A.createEvent ? (f) => A.createEvent(f) : null, events: (s.channelEvents || []).filter(e => (e.end || e.start) > now - 3 * 3600e3).map(e => ({ id: e.id, title: e.title, about: e.about, location: e.location, at: e.start, name: e.name, mine: e.mine, count: e.going.length, interested: e.interested })), now, onRsvp: A.rsvpEvent ? (id) => A.rsvpEvent(id) : null, onDelete: A.deleteEvent ? (id) => A.deleteEvent(id) : null, onClose: () => A.closeSurface && A.closeSurface() }); }
        if (name === 'discover') return Game3Modal({ title: 'Discover servers', onClose: () => A.closeSurface && A.closeSurface() }, DiscoverList({ servers: s.discoverServers || [], emptyText: 'No servers joined yet.', onOpen: (id) => A.switchServer && A.switchServer(id) }));
        return null;
    };
    let gamePrefWasOpen = false;
    let surfaceWasOpen = false;
    const render = () => {
        const active = document.activeElement;
        const focusedSwitch = active && active.getAttribute && active.getAttribute('role') === 'switch' && root.contains(active) ? active.getAttribute('aria-label') : null;
        webjsx.applyDiff(root, view());
        if (focusedSwitch) {
            const again = root.querySelector('.ds-g3-prefs [role=switch][aria-label="' + focusedSwitch + '"]');
            if (again && again !== document.activeElement) again.focus();
        }
        const open = !!get().gamePrefOpen;
        if (open && !gamePrefWasOpen) setTimeout(() => { const sw = root.querySelector('.ds-g3-prefs [role=switch]'); if (sw) sw.focus(); }, 0);
        gamePrefWasOpen = open;
        const surf = !!get().gameSurface;
        if (surf && !surfaceWasOpen) setTimeout(() => { const b = root.querySelector('.ds-g3-surface .ds-g3-btn'); if (b) b.focus(); }, 0);
        surfaceWasOpen = surf;
    };

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
