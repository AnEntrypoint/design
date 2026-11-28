import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from '../components/shell.js';
import { channelType, railGroups, groupOf, surfaceForChannel, railSections, railSurfaces, menuSurfaces } from '../modules/index.js';
import { game3AvatarBg, game3AvInitial } from '../components/game3-hue.js';
import { Game3ServerMenu } from '../components/game3-server-menu.js';

const h = webjsx.createElement;

export const channelIcon = (c) => ((surfaceForChannel(c) || {}).icon) || channelType(c.type).icon;

const serverAbbr = (sv) => {
    if (sv.abbr) return sv.abbr;
    const words = String(sv.name || '?').trim().split(/\s+/).filter(Boolean);
    return words.map((w) => [...w][0]).join('').slice(0, 3).toUpperCase() || '?';
};

export function createRail(app) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();

    const railServerAdd = (s) => (A.openServerCreate)
        ? h('a', { href: '#', class: 'ca-rail-server-add', title: 'Create a server', 'aria-label': 'create a server', onclick: (e) => { e.preventDefault(); A.openServerCreate(); } }, Icon('ref-plus', { size: 24 }))
        : null;
    const railServerExplore = (s) => (A.explore)
        ? h('a', { href: '#', class: 'ca-rail-server-explore', title: 'Find new servers to join', 'aria-label': 'find new servers to join', onclick: (e) => { e.preventDefault(); A.explore(); } }, Icon('ref-compass', { size: 24 }))
        : null;
    const railServersView = (s) => {
        const servers = s.servers || [];
        if (!servers.length && !A.createOrJoinServer) return null;
        return h('div', { key: 'servers', class: 'ca-rail-servers' },
            railServerPill({ name: 'home', _home: true }, s),
            h('div', { class: 'ca-rail-sep', 'aria-hidden': 'true' }),
            ...servers.map(sv => railServerPill(sv, s)),
            railServerAdd(s), railServerExplore(s));
    };

    const railServerHead = (s) => {
        const sv = (s.servers || []).find((x) => x.id === s.currentServerId);
        return h('div', { class: 'shead', role: 'button', tabindex: '0', 'aria-haspopup': 'menu', 'aria-expanded': st.serverMenuOpen ? 'true' : 'false', onclick: () => { st.serverMenuOpen = !st.serverMenuOpen; render(); } }, h('span', {}, sv ? sv.name : 'home'), Icon('ref-chevron', { size: 18 }));
    };
    const serverMenuItems = (s) => {
        const owner = !!s.canManage;
        const out = [];
        if (s.serverSettings && A.openServerSettings) out.push({ label: 'Server Settings', icon: 'ref-gear', onClick: () => A.openServerSettings() });
        else if (s.discovery && s.canManage && s.currentServerId && A.openGamePrefs) out.push({ label: 'Server Settings', icon: 'ref-gear', onClick: () => { if (A.setGamePrefTab) A.setGamePrefTab('discovery'); A.openGamePrefs(); } });
        if (owner && A.createChannel) out.push({ label: 'Create Channel', icon: 'ref-plus', onClick: () => A.createChannel('text') });
        if (out.length) out.push({ divider: true });
        const curServer = (s.servers || []).find((x) => x.id === s.currentServerId) || {};
        const inviteItem = A.inviteToServer && s.currentServerId ? { label: 'Invite People', icon: 'ref-invite', color: '#949cf7', onClick: () => A.inviteToServer() } : null;
        if (inviteItem && !curServer.isPublic) out.push(inviteItem);
        if (A.openSurface && s.currentServerId) out.push({ label: 'Recap What I Missed', hint: '👋', onClick: () => A.openSurface('recap') });
        if (A.markAllRead && s.currentServerId) out.push({ label: 'Mark As Read', hint: '✓', onClick: () => A.markAllRead() });
        out.push({ label: 'Quick Switcher', hint: 'Ctrl P', onClick: () => { st.switcher = { open: true, q: '' }; render(); setTimeout(() => { const i = root.querySelector('.ds-g3-swin'); if (i) i.focus(); }, 0); } });
        if (A.toggleMuteChannel) out.push({ label: (s.mutedChannel ? 'Unmute' : 'Mute') + ' #' + (((s.currentChannel || {}).name) || 'general'), icon: 'ref-belloff', onClick: () => A.toggleMuteChannel() });
        if (A.explore) out.push({ label: 'Discover Servers', icon: 'ref-compass', onClick: () => A.explore() });
        out.push({ divider: true });
        if (A.openGamePrefs) out.push({ label: 'User Settings', icon: 'ref-gear', onClick: () => A.openGamePrefs() });
        const zellousItems = [];
        if (inviteItem && curServer.isPublic) zellousItems.push({ ...inviteItem, surface: 'invite' });
        if (A.openSurface && s.currentServerId) menuSurfaces().forEach((x) => zellousItems.push({ label: x.menu.label, icon: x.menu.icon, surface: x.id, onClick: () => A.openSurface(x.id) }));
        railSections().forEach((r) => { const it = r.menuItem && s.currentServerId ? r.menuItem({ s, A }) : null; if (it) zellousItems.push({ ...it, surface: r.id }); });
        if (zellousItems.length) out.push(...zellousItems);
        if (!owner && A.leaveServer && s.currentServerId && !curServer.isPublic) out.push({ divider: true }, { label: 'Leave Server', color: '#f23f43', icon: 'ref-door', onClick: () => A.leaveServer() });
        return out;
    };
    const railGroup = (label, s, list, cur, isVoice, createType) => {
        const head = h('div', { class: 'group group-header' },
            h('span', {}, Icon('chevron-down-fill', { size: 12 }), label),
            (s.canManage && A.createChannel && createType)
                ? h('button', { type: 'button', class: 'group-add-btn', 'aria-label': 'create ' + label, title: 'Create ' + label, onclick: (e) => { e.preventDefault(); e.stopPropagation(); A.createChannel(createType); } }, Icon('ref-plus', { size: 13 }))
                : null);
        const occupantsOf = (c) => {
            if (!isVoice) return [];
            if (s.voiceConnected && s.voiceChannelName === c.name) return (s.voiceParticipants || []).map((p) => ({ name: p.name || p.identity || '', speaking: !!p.speaking, muted: !!p.muted }));
            return ((s.voiceOccupants || {})[c.id] || []).map((p) => ({ name: p.name, speaking: false, muted: !!p.muted }));
        };
        const vuRows = (c) => occupantsOf(c).map((p, i) => h('div', { key: 'vu' + c.id + i, class: 'vu' + (p.speaking ? ' talk' : '') }, h('span', { class: 'ds-g3-vu-av', 'aria-hidden': 'true' }, String(p.name || '?').trim().slice(0, 1).toUpperCase()), p.name, h('span', { class: 'mo', 'aria-label': 'muted', style: p.muted ? null : 'display:none' }, Icon('g3-micoff', { size: 14 }))));
        return [head, ...(list.length ? list.flatMap(c => [railPill(c, cur, isVoice, s), ...vuRows(c)]) : [h('div', { class: 'rail-empty', role: 'status' }, 'no ' + label + ' yet')])];
    };
    const railSurfaceRows = (s) => railSurfaces().map((x) => x.rail.row({ s, A, h }));
    const railChannelsView = (s, bottom = [], top = []) => {
        if (s.homeMode) return dmRailView(s, bottom, top);
        const channels = [...(s.channels || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        const cur = s.currentChannel || {};
        const groupRows = railGroups().flatMap((g) => { const list = channels.filter((c) => groupOf(c) === g.id); return list.length || g.always ? railGroup(g.label, s, list, cur, g.voice, g.createType) : []; });
        return h('div', { key: 'channels', class: 'ca-rail-channels' },
            ...top,
            railServerHead(s),
            st.serverMenuOpen ? Game3ServerMenu({ items: serverMenuItems(s), onPick: () => { st.serverMenuOpen = false; render(); const head = root.querySelector('.shead'); if (head) head.focus(); } }) : null,
            h('div', { class: 'chans' },
                ...railSurfaceRows(s),
                h('div', { class: 'ds-g3-sep2', 'aria-hidden': 'true' }),
                ...groupRows,
                ...railSections().map((r) => r.mount({ s, A, render, h })).flat().filter(Boolean)),
            ...bottom.filter(Boolean));
    };

    const dmRailView = (s, bottom = [], top = []) => {
        const convos = s.dmConversations || [];
        const items = convos.map((c) => h('a', {
            key: 'dm' + c.id, href: '#', class: 'ds-g3-dmrow' + (s.activeDmPeer === c.id ? ' active' : '') + (c.unread ? ' unread' : ''), 'aria-label': 'conversation with ' + c.name,
            onclick: (e) => { e.preventDefault(); A.selectDm && A.selectDm(c.id); if (A.closeMobileMenu) A.closeMobileMenu(); },
        }, h('span', { class: 'ds-g3-dmav', style: '--ds-g3-av-color:' + game3AvatarBg(c.name, c.id) }, game3AvInitial(initial(c.name), c.id), h('span', { class: 'ds-g3-mdot', style: '--ds-g3-dot-color:' + ({ online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' }[c.status] || '#23a55a'), 'aria-label': c.status || 'online' })), h('span', { class: 'ds-g3-dmname' }, c.name), ...(c.unread ? [h('span', { class: 'ds-g3-badge' }, String(c.unread))] : [])));
        return h('div', { key: 'channels', class: 'ca-rail-channels' },
            ...top,
            h('div', { class: 'shead ds-g3-findbtn', role: 'button', tabindex: '0', onclick: () => { st.switcher = { open: true, q: '' }; render(); setTimeout(() => { const i = root.querySelector('.ds-g3-swin'); if (i) i.focus(); }, 0); } }, h('span', {}, 'Find or start a conversation')),
            h('div', { class: 'chans' },
                h('a', { href: '#', class: s.activeDmPeer ? '' : 'active', onclick: (e) => { e.preventDefault(); A.selectDm && A.selectDm(null); if (A.closeMobileMenu) A.closeMobileMenu(); } }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, Icon('ref-members', { size: 20 })), h('span', {}, 'People here')),
                h('div', { class: 'ds-g3-dmcat' }, 'Direct Messages'),
                ...(items.length ? items : [h('div', { class: 'ds-g3-dmempty', role: 'status' }, 'no DMs yet. Use Find or start a conversation.')])),
            ...bottom.filter(Boolean));
    };

    const railPill = (c, cur, isVoice, s) => {
        const active = cur.id === c.id;
        const inVoice = isVoice && s.voiceConnected && s.voiceChannelName === c.name;
        const ct = channelType(c.type);
        const glyph = ct.railIcon ? h('span', { class: 'glyph glyph-' + (c.type || 'text'), 'aria-hidden': 'true' }, Icon(ct.railIcon, { size: 20 }))
            : h('span', { class: 'glyph glyph-' + (c.type || 'text'), 'aria-hidden': 'true' }, Icon(channelIcon(c), { size: 20 }));
        const canReorder = !!s.canManage && !!A.reorderChannel;
        const dropAllowed = () => !!st.railDragId && st.railDragId !== c.id;
        const muted = !!c.muted && !inVoice;
        const pings = muted ? 0 : (c.pingCount || 0);
        return h('a', {
            href: '#', class: [active ? 'active' : '', c.unreadCount && !muted ? 'unread' : '', c.muted ? 'muted' : ''].filter(Boolean).join(' '), 'aria-label': (c.name || c.id) + (inVoice ? ' (in voice)' : ''),
            title: canReorder ? ((c.name || c.id) + ': drag, or hold Alt and press the arrow keys, to reorder') : (c.name || c.id),
            'aria-keyshortcuts': canReorder ? 'Alt+ArrowUp Alt+ArrowDown' : null,
            onclick: (e) => { e.preventDefault(); A.switchChannel && A.switchChannel(c); },
            oncontextmenu: (e) => { e.preventDefault(); A.channelContext && A.channelContext(c.id, e.clientX, e.clientY); },
            draggable: canReorder ? 'true' : null,
            ondragstart: canReorder ? (e) => { st.railDragId = c.id; e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('rail-dragging'); } : null,
            ondragend: canReorder ? (e) => { st.railDragId = null; e.currentTarget.classList.remove('rail-dragging'); } : null,
            ondragover: canReorder ? (e) => { if (!dropAllowed()) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('rail-drop'); } : null,
            ondragleave: canReorder ? (e) => { e.currentTarget.classList.remove('rail-drop'); } : null,
            ondrop: canReorder ? (e) => {
                e.preventDefault();
                const src = st.railDragId;
                st.railDragId = null;
                e.currentTarget.classList.remove('rail-drop');
                if (src && src !== c.id) A.reorderChannel(src, c.id);
            } : null,
            onkeydown: canReorder ? (e) => {
                if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
                e.preventDefault();
                A.reorderChannel(c.id, e.key === 'ArrowUp' ? -1 : 1);
            } : null,
        }, glyph, h('span', {}, c.name || c.id),
            c.pingCount && !c.muted ? h('span', { class: 'ds-g3-ping', 'aria-label': c.pingCount + ' mentions' }, String(c.pingCount)) : (c.muted ? h('span', { class: 'ds-g3-mi', 'aria-label': 'muted' }, '\u{1F515}') : null));
    };

    const railServerPill = (sv, s) => {
        const active = sv._home ? s.homeMode : (!s.homeMode && s.currentServerId === sv.id);
        return h('a', {
            href: '#', class: (sv._home ? 'ca-rail-home ' : '') + (sv.isPublic ? 'ca-rail-public ' : '') + (active ? 'active' : ''), 'aria-label': sv._home ? 'direct messages' : (sv.name || sv.id),
            title: sv._home ? 'Direct Messages' : (sv.name || sv.id),
            style: sv._home ? null : '--sv-color:' + (sv.iconColor || sv.color || 'var(--accent)'),
            onclick: (e) => { e.preventDefault(); sv._home ? (A.goHome && A.goHome()) : (A.switchServer && A.switchServer(sv.id)); },
            oncontextmenu: sv._home ? null : (e) => { e.preventDefault(); A.serverContext && A.serverContext(sv.id, e.clientX, e.clientY); },
        }, h('span', { class: 'glyph', 'aria-hidden': 'true' }, sv._home ? Icon('ref-home', { size: 24 }) : serverAbbr(sv)),
            h('span', {}, sv.name || sv.id),
            sv.unreadCount ? h('span', { class: 'count' }, sv.unreadCount > 99 ? '99+' : String(sv.unreadCount)) : null);
    };

    const railOrder = (s) => {
        const channels = [...(s.channels || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        return railGroups().flatMap((g) => channels.filter((c) => groupOf(c) === g.id));
    };

    return { railServersView, railChannelsView, railOrder };
}
