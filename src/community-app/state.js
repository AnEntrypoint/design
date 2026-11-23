

export function createApp(root, adapter) {
    const H = adapter.helpers || {};
    return {
        root,
        get: typeof adapter.get === 'function' ? adapter.get : () => ({}),
        A: adapter.actions || {},
        initial: H.initial || ((n) => String(n || '?').slice(0, 1).toUpperCase()),
        formatTime: H.formatTime || ((t) => new Date(t || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })),
        render: () => {},
        api: null,
        st: {
            ctx: { open: false, x: 0, y: 0, items: [] },
            emoji: { open: false, x: 0, y: 0, onSelect: null },
            palette: { open: false, items: [], onSelect: null },
            card: { open: false, member: null },
            serverMenuOpen: false,
            dropAnywhere: { active: false, count: 0, fileCount: 0 },
            imageLightbox: { open: false, src: null, alt: '' },
            switcher: { open: false, q: '' },
            moreFor: null,
            stickersOpen: false,
            emojisOpen: false,
            statusMenuOpen: false,
            avatarMenuOpen: false,
            userMenu: { open: false, sub: '' },
            renaming: null,
            statusPreset: 'never',
            reactPickFor: null,
            soundToast: null,
            railDragId: null,
            lastSwitcherKey: 0,
            isNarrowViewport: false,
            gamePrefWasOpen: false,
            surfaceWasOpen: false,
        },
    };
}

const NARROW_VIEWPORT_QUERY = '(max-width: 640px)';

export function watchNarrowViewport(app) {
    const query = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(NARROW_VIEWPORT_QUERY) : null;
    app.st.isNarrowViewport = !!(query && query.matches);
    if (query && query.addEventListener) query.addEventListener('change', (e) => {
        if (e.matches === app.st.isNarrowViewport) return;
        app.st.isNarrowViewport = e.matches;
        app.render();
    });
}
