

export function createKeys(app, { closeOverlays, overlayOpen }) {
    const { root, get, A, st } = app;
    const render = () => app.render();

    const onGlobalKeys = (e) => {
        if (e.__g3) return;
        e.__g3 = true;
        const a = document.activeElement;
        const typing = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
        const k = e.key;
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyP' || k === 'p') && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            const now = Date.now();
            if (now - st.lastSwitcherKey > 250) {
                st.lastSwitcherKey = now;
                st.switcher = { open: !st.switcher.open, q: '' };
                render();
                if (st.switcher.open) setTimeout(() => { const i = root.querySelector('.ds-g3-swin'); if (i) i.focus(); }, 0);
            }
            return;
        }
        if (k === 'Escape' && st.stage && st.stageCancel && !overlayOpen() && (!typing || (a.closest && a.closest('.ds-g3-comp')))) { e.preventDefault(); st.stageCancel(); return; }
        if (k === 'Escape' && A.startReply && (get() || {}).replyTarget && !overlayOpen() && (!typing || (a.closest && a.closest('.ds-g3-comp')))) { A.startReply(null); return; }
        if (k === 'Escape' && A.toggleMembers && (get() || {}).memberListOpen && !overlayOpen() && window.matchMedia('(max-width: 900px)').matches) { e.preventDefault(); A.toggleMembers(); return; }
        if (k === 'Escape' && (!typing || (a.closest && a.closest('.ds-g3-scrim, .ds-g3-sw, .ds-g3-statusmenu, .ds-g3-rename, .ds-g3-set, .ds-g3-pop-wrap, .ds-g3-comp, [role=dialog]')))) { const wasOpen = overlayOpen(); if (wasOpen) e.preventDefault(); closeOverlays(); const cur = get() || {}; if (!wasOpen && !cur.homeMode && cur.currentChannel && A.markChannelRead) A.markChannelRead(); return; }
        if (typing || (a && a.closest && a.closest('.ds-g3-statusmenu, .ds-g3-scrim, .ds-g3-me, .ds-g3-shpanel'))) return;
        const thread = root.querySelector('.chat-thread');
        if (k === 'End' && thread) { e.preventDefault(); thread.scrollTop = thread.scrollHeight; return; }
        if ((k === 'PageUp' || k === 'PageDown') && thread) { e.preventDefault(); thread.scrollBy(0, (k === 'PageUp' ? -1 : 1) * thread.clientHeight * 0.85); return; }
        const input = root.querySelector('.ds-g3-comp textarea');
        if (!input) return;
        if (!e.ctrlKey && !e.metaKey && !e.altKey && k.length === 1) { input.focus(); const end = input.value.length; input.setSelectionRange(end, end); }
        else if ((e.ctrlKey || e.metaKey) && k === 'v') input.focus();
    };

    const within = (e, sel) => e.composedPath().some((n) => n.matches && n.matches(sel));
    const ACTIVATABLE = '[role=button],[role=menuitem],[role=radio],[role=tab],[role=option]';
    const NATIVE = /^(BUTTON|A|INPUT|TEXTAREA|SELECT|SUMMARY)$/;
    const onActivateKey = (e) => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || (e.key !== 'Enter' && e.key !== ' ')) return;
        const t = e.target;
        if (!t || !t.matches || NATIVE.test(t.tagName) || !t.matches(ACTIVATABLE)) return;
        e.preventDefault();
        t.click();
    };

    const rootProps = (s) => ({
        class: 'ca-app',
        onkeydown: onActivateKey,
        onpointerdown: (e) => { const a = e.target.closest && e.target.closest('button,[role=button],[role=menuitem],a[href],[tabindex]'); if (a) st.lastActivator = a; },
            ondragenter: (e) => {
                if (!A.attachFiles) return;
                e.preventDefault();
                st.dropAnywhere = { active: true, count: st.dropAnywhere.count + 1, fileCount: e.dataTransfer ? e.dataTransfer.items.length : 0 };
                render();
            },
            ondragover: (e) => { if (A.attachFiles) e.preventDefault(); },
            ondragleave: (e) => {
                if (!A.attachFiles || !st.dropAnywhere.active) return;
                const count = st.dropAnywhere.count - 1;
                st.dropAnywhere = count > 0 ? { ...st.dropAnywhere, count } : { active: false, count: 0, fileCount: 0 };
                render();
            },
            ondrop: (e) => {
                if (!A.attachFiles) return;
                e.preventDefault();
                st.dropAnywhere = { active: false, count: 0, fileCount: 0 };
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) (st.stageFiles || A.attachFiles)(e.dataTransfer.files);
                render();
            },
            onclick: (e) => {
                if (st.renaming && !(within(e, '.ds-g3-rename, .ds-g3-men'))) { st.renaming = null; render(); }
                if (st.moreFor && !(within(e, '.ds-g3-mmenu, .ds-g3-bar'))) { st.moreFor = null; render(); }
                if (st.serverMenuOpen && !(within(e, '.ds-g3-smenu, .shead'))) { st.serverMenuOpen = false; render(); }
                if (st.stickersOpen && !(within(e, '.ds-g3-stkpop, .ds-g3-compbtn'))) { st.stickersOpen = false; render(); }
                if (st.statusMenuOpen && !(within(e, '.ds-g3-statusmenu, .ds-g3-mebtn'))) { st.statusMenuOpen = false; render(); }
                if ((st.avatarMenuOpen || st.userMenu.open) && !(within(e, '.ds-g3-statusmenu, .ds-g3-me'))) { st.avatarMenuOpen = false; st.userMenu = { open: false, sub: '' }; render(); }
                if (st.emojisOpen && !(within(e, '.ds-g3-cpick, .ds-g3-compbtn'))) { st.emojisOpen = false; render(); }
                if (st.reactPickFor && !(within(e, '.ds-g3-rxpick, .ds-g3-bar, .ds-g3-mmenu'))) { st.reactPickFor = null; render(); }
                const pic = e.target.closest && e.target.closest('.ds-g3-pic');
                if (pic && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { st.imageLightbox = { open: true, src: pic.getAttribute('src'), alt: '' }; render(); return; }
                const a = e.target.closest && e.target.closest('.chat-image');
                if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                const img = a.querySelector('img');
                if (!img) return;
                e.preventDefault();
                st.imageLightbox = { open: true, src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
                render();
            },
    });

    return { onGlobalKeys, rootProps };
}
