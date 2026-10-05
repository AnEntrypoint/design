
export function kids(c) { return c == null ? [] : (Array.isArray(c) ? c : [c]); }

export const FOCUSABLE_SEL = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function trapTabKey(rootEl, e) {
    if (e.key !== 'Tab') return;
    const nodes = rootEl.querySelectorAll(FOCUSABLE_SEL);
    if (!nodes.length) { e.preventDefault(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    const active = (rootEl.getRootNode && rootEl.getRootNode().activeElement) || document.activeElement;
    if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
}
