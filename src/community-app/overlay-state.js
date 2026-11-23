import { popoverList } from '../modules/index.js';

export const OVERLAY_OPEN = '.ds-g3-scrim,.ds-g3-pop-wrap,[role=dialog],[role=menu],.ds-g3-sw,.ds-g3-cpick,.ds-g3-stkpop,.ds-g3-rxpick,.ds-ep-ctxmenu-backdrop,.ds-g3-rename';

export function closeOverlays(app) {
    const { A, get, st } = app;
    st.moreFor = null; st.reactPickFor = null; st.stickersOpen = false; st.emojisOpen = false; st.statusMenuOpen = false; st.avatarMenuOpen = false; st.userMenu = { open: false, sub: '' }; st.renaming = null;
    st.switcher = { open: false, q: '' }; st.imageLightbox = { open: false, src: null, alt: '' };
    st.serverMenuOpen = false; st.card = { ...st.card, open: false }; st.ctx = { ...st.ctx, open: false }; st.emoji = { ...st.emoji, open: false }; st.palette = { ...st.palette, open: false };
    const open = get() || {};
    if (open.gameSurface && A.closeSurface) A.closeSurface();
    if (open.account && open.account.setup && open.account.setup.open && A.setupClose) A.setupClose();
    if (open.gameServerCreateOpen && A.closeServerCreate) A.closeServerCreate();
    if (open.gamePrefOpen && A.closeGamePrefs) A.closeGamePrefs();
    if (open.voiceSettingsOpen && A.voiceSettingsClose) A.voiceSettingsClose();
    if (open.showAuthModal && A.closeAuth) A.closeAuth();
    if (open.settingsOpen && A.openSettings) A.openSettings();
    if (open.videoLightbox && open.videoLightbox.open && A.closeVideoLightbox) A.closeVideoLightbox();
    if (open.threadPanelOpen && A.closeThreadPanel) A.closeThreadPanel();
    popoverList().forEach((x) => { if (x.close) x.close({ s: open, A }); });
    app.render();
}

export function createOverlayApi(app) {
    const { st } = app;
    const render = () => app.render();
    return {
        contextMenu: { show: (items, x, y) => { st.ctx = { open: true, x: x | 0, y: y | 0, items: Array.isArray(items) ? items : [] }; render(); }, close: () => { st.ctx = { ...st.ctx, open: false }; render(); } },
        emojiPicker: { show: (x, y, onSelect) => { st.emoji = { open: true, x: x || 200, y: y || 200, onSelect }; render(); }, close: () => { st.emoji = { ...st.emoji, open: false }; render(); } },
        commandPalette: { show: (items, onSelect) => { st.palette = { open: true, items: items || [], onSelect }; render(); }, close: () => { st.palette = { ...st.palette, open: false }; render(); } },
        render,
    };
}
