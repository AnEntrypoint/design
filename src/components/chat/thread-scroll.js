export function hasSelectionInside(el) {
    const sel = typeof document !== 'undefined' && document.getSelection ? document.getSelection() : null;
    return !!(sel && !sel.isCollapsed && sel.anchorNode && el && el.contains(sel.anchorNode));
}

const STICK_THRESHOLD_PX = 80;

export function makeThreadAutoScroll(getCount) {
    return (el) => {
        if (!el) return;
        if (el._dsAutoScroll) { el._dsAutoScroll.getCount = getCount; return; }
        const state = { getCount, stick: true, last: Number(getCount()) || 0 };
        el._dsAutoScroll = state;
        const toBottom = () => { el.scrollTop = el.scrollHeight; };
        const onScroll = () => { state.stick = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX; };
        const onMutate = () => {
            const count = Number(state.getCount()) || 0;
            if (count < state.last) state.stick = true;
            state.last = count;
            if (!state.stick || hasSelectionInside(el)) return;
            toBottom();
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        el.addEventListener('load', onMutate, true);
        el.addEventListener('loadedmetadata', onMutate, true);
        const mo = new MutationObserver(onMutate);
        mo.observe(el, { childList: true, subtree: true });
        toBottom();
        return () => { mo.disconnect(); el.removeEventListener('scroll', onScroll); el.removeEventListener('load', onMutate, true); el.removeEventListener('loadedmetadata', onMutate, true); el._dsAutoScroll = null; };
    };
}
