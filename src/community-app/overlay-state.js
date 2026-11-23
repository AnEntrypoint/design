

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
