export function hasSelectionInside(el) {
    const sel = typeof document !== 'undefined' && document.getSelection ? document.getSelection() : null;
    return !!(sel && !sel.isCollapsed && sel.anchorNode && el && el.contains(sel.anchorNode));
}

const STICK_THRESHOLD_PX = 80;

export function makeThreadAutoScroll(getCount, onUpdate) {
    return (el) => {
        if (!el) return;
        if (el._dsAutoScroll) {
            el._dsAutoScroll.getCount = getCount;
            el._dsAutoScroll.onUpdate = onUpdate || null;
            return;
        }
        const state = { getCount, onUpdate: onUpdate || null, stick: true, pending: 0, last: Number(getCount()) || 0 };
        el._dsAutoScroll = state;
        const notify = () => { if (state.onUpdate) state.onUpdate(state); };
        const toBottom = () => { el.scrollTop = el.scrollHeight; };
        state.toBottom = toBottom;
        const onScroll = () => {
            const stick = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX;
            const changed = stick !== state.stick;
            state.stick = stick;
            if (stick) state.pending = 0;
            if (changed || !stick) notify();
        };
        const onMutate = () => {
            const count = Number(state.getCount()) || 0;
            if (count < state.last) { state.stick = true; state.pending = 0; }
            else if (count > state.last && !state.stick) state.pending += count - state.last;
            state.last = count;
            notify();
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
