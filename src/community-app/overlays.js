import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from '../components/shell.js';
import { ThreadPanel } from '../components/community.js';
import { channelType, popoverList, settingsPanes } from '../modules/index.js';
import { isModalSurface } from './surfaces.js';
import { Game3SetupPanel } from '../components/game3-usermenus.js';
import { Game3ServerCreate } from '../components/game3-server-create.js';
import { Game3SettingsPanel } from '../components/game3-settings.js';
import { Game3Switcher } from '../components/game3-switcher.js';
import { Game3Lightbox } from '../components/game3-lightbox.js';
import { Game3ProfileCard } from '../components/game3-profile.js';
import { VoiceSettingsModal } from '../components/voice.js';
import { ContextMenu } from '../components/editor-primitives.js';
import { EmojiPicker, CommandPalette, AuthModal, BootOverlay, SettingsPopover, VideoLightbox } from '../components/overlay-primitives.js';
import { attempt } from '../best-effort.js';

const h = webjsx.createElement;

export function DropAnywhereOverlay({ active, fileCount } = {}) {
    if (!active) return null;
    return h('div', { class: 'ca-drop-overlay', role: 'status', 'aria-live': 'polite' },
        h('div', { class: 'ca-drop-overlay-inner' },
            Icon('arrow-up', { size: 32 }),
            h('span', { class: 'ca-drop-overlay-label' },
                fileCount > 1 ? `drop ${fileCount} files` : 'drop file')));
}

export function createOverlays(app, { surfaces }) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();
    const { surfaceBody } = surfaces;

    const switcherItems = (s) => {
        const q = (st.switcher.q || '').toLowerCase().replace(/^[#@!]/, '');
        const server = ((s.servers || []).find((sv) => sv.id === s.currentServerId) || {}).name || '';
        const channels = s.knownChannels || s.channels || [];
        const serverName = (c) => ((s.servers || []).find((sv) => sv.id === c.serverId) || {}).name || server;
        const openChannel = (c) => () => {
            if (c.serverId && c.serverId !== s.currentServerId && A.switchServer) { A.switchServer(c.serverId); setTimeout(() => A.switchChannel && A.switchChannel(c), 900); } else if (A.switchChannel) A.switchChannel(c);
        };
        const items = [
            ...channels.filter((c) => !channelType(c.type).traits.voice).map((c) => ({ label: '#' + c.name, hint: serverName(c), key: c.name + ' ' + serverName(c), go: openChannel(c) })),
            ...channels.filter((c) => channelType(c.type).traits.voice).map((c) => ({ label: '\u{1F50A} ' + c.name, hint: 'voice \u00b7 ' + serverName(c), key: c.name + ' ' + serverName(c), go: openChannel(c) })),
            ...(s.servers || []).filter((sv) => !sv._home).map((sv) => ({ label: sv.name, hint: 'server', key: sv.name, go: () => A.switchServer && A.switchServer(sv.id) })),
            ...(s.memberCategories || []).flatMap((c) => c.members || []).filter((m) => String(m.identity) !== String(s.userId)).map((m) => ({ label: '@ ' + m.name, hint: 'dm', key: m.name, go: () => { if (A.goHome) A.goHome(); if (A.selectDm) A.selectDm(m.identity); } })),
        ];
        return items.filter((x) => !q || x.key.toLowerCase().includes(q)).slice(0, 12);
    };

    const views = (s) => [
            st.ctx.open ? ContextMenu({ items: st.ctx.items, anchor: { x: st.ctx.x, y: st.ctx.y }, onClose: () => { st.ctx = { ...st.ctx, open: false }; render(); } }) : null,
            st.card.open ? Game3ProfileCard({ member: { ...st.card.member, ...((s.profileMeta || {})[st.card.member && st.card.member.identity] || {}), accountName: (s.accountNames || {})[st.card.member && st.card.member.identity] || '', nip05Verified: !!(s.account && s.account.pubkey === (st.card.member && st.card.member.identity) && s.account.nip05 && s.account.nip05.ok) }, isSelf: !!(st.card.member && s.userId && String(st.card.member.identity) === String(s.userId)), devMode: !!s.devMode, onClose: () => { st.card = { ...st.card, open: false }; render(); }, onMessage: (m) => { st.card = { ...st.card, open: false }; if (A.goHome) A.goHome(); if (A.selectDm) A.selectDm(m.identity); render(); }, onSettings: () => { st.card = { ...st.card, open: false }; if (A.openGamePrefs) A.openGamePrefs(); render(); } }) : null,
            st.emoji.open ? EmojiPicker({ open: true, anchorX: st.emoji.x, anchorY: st.emoji.y, onSelect: (em) => { attempt(() => { st.emoji.onSelect && st.emoji.onSelect(em); }); st.emoji = { ...st.emoji, open: false }; render(); }, onClose: () => { st.emoji = { ...st.emoji, open: false }; render(); } }) : null,
            st.palette.open ? CommandPalette({ open: true, items: st.palette.items, onSelect: (it) => { attempt(() => { st.palette.onSelect && st.palette.onSelect(it); }); st.palette = { ...st.palette, open: false }; render(); }, onClose: () => { st.palette = { ...st.palette, open: false }; render(); } }) : null,
            s.showAuthModal ? AuthModal({ open: true, isLoggedIn: !!s.userId, mode: s.authMode || 'extension', error: s.authError || '', busy: !!s.authBusy, onModeChange: (m) => A.setAuthMode && A.setAuthMode(m), onConnectExtension: () => A.authExtension && A.authExtension(), onGenerate: () => A.authGenerate && A.authGenerate(), onImport: (k) => A.authImport && A.authImport(k), onClose: () => A.closeAuth && A.closeAuth() }) : null,
            BootOverlay({ progress: s.bootProgress || 0, phase: s.bootPhase || '', errored: !!s.bootErrored, visible: !!s.bootVisible }),
            s.settingsOpen ? SettingsPopover({ open: true, anchorX: (s.settingsAnchor && s.settingsAnchor.x) || 0, anchorY: (s.settingsAnchor && s.settingsAnchor.y) || 0, sections: s.settingsSections || [], onClose: () => A.openSettings && A.openSettings() }) : null,
            s.voiceSettingsOpen ? VoiceSettingsModal({ open: true, mode: s.voiceMode || 'ptt', inputId: s.inputDeviceId, outputId: s.outputDeviceId, inputDevices: s.inputDevices || [], outputDevices: s.outputDevices || [], vadThreshold: s.vadThreshold, rnnoise: !!s.rnnoiseEnabled, autoGain: !!s.autoGainEnabled, forceTurn: !!s.forceTurnEnabled, bitrate: s.voiceBitrate, volume: s.masterVolume, onChange: (p) => A.voiceSettingsChange && A.voiceSettingsChange(p), onSave: () => A.voiceSettingsSave && A.voiceSettingsSave(), onCancel: () => A.voiceSettingsClose && A.voiceSettingsClose(), onClose: () => A.voiceSettingsClose && A.voiceSettingsClose() }) : null,
            s.videoLightbox && s.videoLightbox.open ? VideoLightbox({ open: true, src: s.videoLightbox.src, label: s.videoLightbox.label, onClose: () => A.closeVideoLightbox && A.closeVideoLightbox() }) : null,
            st.imageLightbox.open ? Game3Lightbox({ src: st.imageLightbox.src, onClose: () => { st.imageLightbox = { open: false, src: null, alt: '' }; render(); } }) : null,
            st.switcher.open ? Game3Switcher({ query: st.switcher.q, items: switcherItems(s), onQuery: (q) => { st.switcher = { open: true, q }; render(); }, onPick: (it) => { st.switcher = { open: false, q: '' }; it.go(); render(); }, onClose: () => { st.switcher = { open: false, q: '' }; render(); } }) : null,
            s.gameServerCreateOpen ? Game3ServerCreate({ homeName: s.homeServerName || 'Zellous Public', userName: s.gamePrefName || 'You', onCreate: (v) => A.createServer && A.createServer(v.name, v.color), onClose: () => A.closeServerCreate && A.closeServerCreate(), onDiscover: A.explore ? () => { A.closeServerCreate && A.closeServerCreate(); A.explore(); } : null }) : null,
            s.account && s.account.signedIn && s.account.setup && s.account.setup.open ? h('div', { key: 'setup', class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget && A.setupClose) A.setupClose(); } }, Game3SetupPanel({ account: s.account, setup: s.account.setup, acts: A, onRender: render, onClose: () => A.setupClose && A.setupClose() })) : null,
            ...popoverList().map((o) => o.mount({ s, A, render, h })).filter(Boolean),
            isModalSurface(s.gameSurface) ? h('div', { key: 'surface', class: 'ds-g3-scrim', role: 'presentation', onclick: (e) => { if (e.target === e.currentTarget && A.closeSurface) A.closeSurface(); } }, surfaceBody(s.gameSurface, s)) : null,
            s.gamePrefOpen ? Game3SettingsPanel({ panes: settingsPanes(), tab: s.gamePrefTab || 'account', onTab: (t) => A.setGamePrefTab && A.setGamePrefTab(t), account: s.account, acts: A, onRender: render, devInfo: s.devInfo || null, onDevReset: () => A.resetLocalState && A.resetLocalState(), onDevFilter: (q) => A.setDevFilter && A.setDevFilter(q), onDevRefresh: () => A.refreshDev && A.refreshDev(), level: s.myLevel || 0, xp: s.myXp || 0, servers: s.gamePrefServers || 0, toggles: Object.fromEntries((s.gamePrefToggles || []).map((t) => [t.key, !!t.checked])), micOn: !s.micMuted, onMic: () => A.toggleMic && A.toggleMic(), keywords: s.gamePrefKeywords || '', mutedChannels: s.gamePrefMuted || [], onUnmute: (id) => A.toggleMuteId && A.toggleMuteId(id), compact: !!s.gamePrefCompact, theme: s.themePref || 'ink', onTheme: (t) => A.setTheme && A.setTheme(t), onCompact: (val) => A.setGamePref && A.setGamePref('compact', val), onKeywords: (val) => A.setGamePref && A.setGamePref('kw', val), onToggle: (key, val) => A.setGamePref && A.setGamePref(key, val), onReset: () => A.setGamePref && A.setGamePref('reset', true), onClose: () => A.closeGamePrefs && A.closeGamePrefs() }) : null,
            s.threadPanelOpen ? ThreadPanel({ threads: s.threads || [], activeId: s.activeThreadId, onSelect: (id) => A.selectThread && A.selectThread(id), onCreate: () => A.createThread && A.createThread(), onClose: () => A.closeThreadPanel && A.closeThreadPanel(), onReply: A.replyToThread ? (text) => A.replyToThread(text) : undefined }) : null,
    ].filter(Boolean);

    return { views, switcherItems };
}
