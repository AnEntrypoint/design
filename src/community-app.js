import * as webjsx from '../vendor/webjsx/index.js';
import { register } from './debug.js';
import { Banner } from './components/community.js';
import { channelType, surfaceForChannel } from './modules/index.js';
import { Game3MemberList } from './components/game3-members.js';
import { Game3PeopleHere } from './components/game3-people.js';
import { game3SetAvatars } from './components/game3-hue.js';
import { Game3VoiceBar } from './components/game3-voicebar.js';
import { Game3SplitColumn } from './components/game3-split.js';
import { attempt } from './best-effort.js';
import { createApp, watchNarrowViewport } from './community-app/state.js';
import { createRail, channelIcon } from './community-app/rail.js';
import { createMessages } from './community-app/messages.js';
import { createChatView } from './community-app/chat-view.js';
import { createVoiceView } from './community-app/voice-view.js';
import { createHeader } from './community-app/header.js';
import { createUserPanel } from './community-app/user-panel.js';
import { createSurfaces } from './community-app/surfaces.js';
import { createOverlays, DropAnywhereOverlay } from './community-app/overlays.js';
import { closeOverlays, createOverlayApi } from './community-app/overlay-state.js';
import { createKeys } from './community-app/keys.js';

const h = webjsx.createElement;

export function mountCommunityApp(root, adapter = {}) {
    if (!root) throw new Error('mountCommunityApp: root required');
    const app = createApp(root, adapter);
    const { get, A, st } = app;
    const render = () => app.render();

    const rail = createRail(app);
    const messages = createMessages(app);
    const chat = createChatView(app, { messages, rail });
    const voice = createVoiceView(app, { rail });
    const header = createHeader(app);
    const userPanel = createUserPanel(app);
    const surfaces = createSurfaces(app);
    const overlays = createOverlays(app, { surfaces });
    const keys = createKeys(app, { closeOverlays: () => closeOverlays(app) });
    const { chatView } = chat;
    const { voiceView } = voice;
    const { railServersView, railChannelsView } = rail;

    const view = () => {
        const s = get();
        game3SetAvatars(s.avatars, Object.fromEntries(Object.entries(s.profileMeta || {}).filter(([, m]) => m.accent).map(([k, m]) => [k, m.accent])));
        const ch = s.currentChannel || {};
        const chType = channelType(ch.type);
        const chSurface = surfaceForChannel(ch);
        const bodyCtx = { s, A, ch, views: { voice: voiceView, chat: chatView } };
        const bodyMain = s.homeMode && !s.activeDmPeer ? Game3PeopleHere({ serverName: s.homeServerName || 'Zellous Public', people: s.peopleHere || [], onMessage: (id) => A.selectDm && A.selectDm(id) })
            : chSurface && chSurface.body ? chSurface.body(bodyCtx)
            : chType.body ? chType.body(bodyCtx)
            : chatView(s);
        return h('div', keys.rootProps(s),
            DropAnywhereOverlay({ active: st.dropAnywhere.active, fileCount: st.dropAnywhere.fileCount }),
            h('a', { href: '#app-main', class: 'skip-link' }, 'skip to main content'),
            Banner({ tone: 'warning', message: 'Not connected to any relay. Messages won’t send or arrive.', visible: s.isConnected === false, actionLabel: A.retryConnection ? 'Retry now' : null, onAction: () => A.retryConnection && A.retryConnection() }),
            h('div', { class: 'app-body' + (s.mobileMenuOpen ? ' ca-rail-open' : '') },
                h('aside', { class: 'app-side ca-rail' + (s.mobileMenuOpen ? ' open' : ''), inert: st.isNarrowViewport && !s.mobileMenuOpen ? true : null }, h('div', { key: 'srvstrip', class: 'ds-g3-srvstrip' }, railServersView(s)), railServersView(s), railChannelsView(s, [ s.voiceConnected ? Game3VoiceBar({ key: 'vbar', channelName: s.voiceChannelName, serverName: (((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || ''), onOpen: () => A.returnToVoice && A.returnToVoice(), onLeave: () => A.leaveVoice && A.leaveVoice() }) : null, userPanel.userPanel(s) ].filter(Boolean))),
                h('div', { class: 'ca-right' },
                    header.headerView(s, ch),
                    h('div', { class: 'ca-right-body' },
                h('main', { class: 'app-main ds-app-surface', id: 'app-main', tabindex: '-1', onclick: () => { if (s.mobileMenuOpen && A.closeMobileMenu) A.closeMobileMenu(); } },
                    h('h1', { class: 'sr-only' }, ch.name || 'general'),
                    bodyMain,
                            surfaces.popoverView(s),
                        ),
                s.splitChannel && (!ch || s.splitChannel.id !== ch.id) ? Game3SplitColumn({ name: s.splitChannel.name, messages: s.splitMessages || [], onMain: () => A.splitMain && A.splitMain(), onClose: () => A.splitTo && A.splitTo(null) }) : null,
                ...(s.homeMode ? [] : [Game3MemberList({
                    categories: (s.memberCategories || []).map((c) => ({ ...c, members: (c.members || []).map((m) => ({ ...m, accountName: (s.accountNames || {})[m.identity] || '' })) })), apps: s.memberApps || [], open: !!s.memberListOpen, userId: s.userId,
                    onSelectMember: (m) => { st.card = { open: true, member: m }; render(); },
                })]),
                    ),
                ),
            ),
            ...overlays.views(s),
        );
    };

    const renderNow = () => {
        const active = document.activeElement;
        const focusedSwitch = active && active.getAttribute && active.getAttribute('role') === 'switch' && root.contains(active) ? active.getAttribute('aria-label') : null;
        webjsx.applyDiff(root, view());
        if (st.renaming && !st.renaming.focused) { const inp = root.querySelector('.ds-g3-rename'); if (inp) { st.renaming.focused = true; inp.focus(); inp.select(); } }
        const pop = root.querySelector('.ds-g3-statusmenu');
        if (pop && !pop.contains(document.activeElement)) { const first = pop.querySelector('[role=menuitem], input'); if (first) setTimeout(() => first.focus(), 0); }
        const link = (get().account || {}).profileLink;
        if (link && !st.card.open) { st.card = { open: true, member: link }; if (A.clearProfileLink) A.clearProfileLink(); render(); }
        if (focusedSwitch) {
            const again = root.querySelector('.ds-g3-prefs [role=switch][aria-label="' + focusedSwitch + '"]');
            if (again && again !== document.activeElement) again.focus();
        }
        const open = !!get().gamePrefOpen;
        if (open && !st.gamePrefWasOpen) setTimeout(() => { const sw = root.querySelector('.ds-g3-prefs [role=switch]'); if (sw) sw.focus(); }, 0);
        st.gamePrefWasOpen = open;
        const surf = !!get().gameSurface;
        if (surf && !st.surfaceWasOpen) setTimeout(() => { const b = root.querySelector('.ds-g3-surface .ds-g3-btn'); if (b) b.focus(); }, 0);
        st.surfaceWasOpen = surf;
    };

    app.render = renderNow;
    watchNarrowViewport(app);
    app.api = createOverlayApi(app);

    const unsub = typeof adapter.subscribe === 'function' ? adapter.subscribe(app.render) : null;

    register('community-app', () => {
        const s = get() || {};
        return {
            overlays: { context: st.ctx.open, emoji: st.emoji.open, palette: st.palette.open },
            channels: (s.channels || []).length,
            servers: (s.servers || []).length,
            messages: (s.messages || []).length,
            currentChannel: (s.currentChannel || {}).name || null,
            voiceConnected: !!s.voiceConnected,
            homeMode: !!s.homeMode,
        };
    });

    document.addEventListener('keydown', keys.onGlobalKeys, true);
    app.render();
    return { render: app.render, api: app.api, destroy: () => { document.removeEventListener('keydown', keys.onGlobalKeys, true); if (unsub) attempt(() => { unsub(); }); } };
}
