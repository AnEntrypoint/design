
import { useFloating, FLOAT_OFFSET_DROPDOWN } from './floating.js';

export function useRovingMenu({ itemSelector, items = [], getLabel = (it) => it.label, typeahead = false, placement = 'bottom-start', onOpenChange } = {}) {
    let triggerEl = null, open = false, menuEl = null, floating = null, typeBuf = '', typeTimer = null;
    const liveItems = () => menuEl ? [...menuEl.querySelectorAll(itemSelector)] : [];
    const focusItem = (idx) => { const b = liveItems(); if (!b.length) return; b[((idx % b.length) + b.length) % b.length].focus(); };
    const onDown = (e) => { if (menuEl && menuEl.contains(e.target)) return; if (triggerEl && triggerEl.contains(e.target)) return; close(false); };
    const close = (restore = true) => {
        if (!open) return; open = false;
        if (floating) { floating.dispose(); floating = null; }
        if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
        menuEl = null;
        document.removeEventListener('mousedown', onDown, true);
        if (triggerEl) triggerEl.setAttribute('aria-expanded', 'false');
        if (restore && triggerEl) triggerEl.focus();
        if (onOpenChange) onOpenChange(false);
    };
    const onMenuKey = (e) => {
        const b = liveItems(), idx = b.indexOf(document.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(idx + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(idx - 1); }
        else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
        else if (e.key === 'End') { e.preventDefault(); focusItem(b.length - 1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (idx >= 0) b[idx].click(); }
        else if (typeahead && e.key.length === 1 && /\S/.test(e.key)) {
            typeBuf += e.key.toLowerCase();
            if (typeTimer) clearTimeout(typeTimer);
            typeTimer = setTimeout(() => { typeBuf = ''; }, 600);
            const selectable = items.filter(it => !it.separator && !it.disabled && !it.unavailable);
            const m = selectable.findIndex(it => (getLabel(it) || '').toLowerCase().startsWith(typeBuf));
            if (m >= 0) focusItem(m);
        }
    };
    const openMenu = (buildMenuEl, focusFirst = true) => {
        if (open || !triggerEl) return;
        open = true;
        menuEl = buildMenuEl();
        menuEl.tabIndex = -1;
        document.body.appendChild(menuEl);
        menuEl.addEventListener('keydown', onMenuKey);
        floating = useFloating(triggerEl, menuEl, { placement, offset: FLOAT_OFFSET_DROPDOWN });
        document.addEventListener('mousedown', onDown, true);
        triggerEl.setAttribute('aria-expanded', 'true');
        if (focusFirst && liveItems().length) setTimeout(() => focusItem(0), 0);
        if (onOpenChange) onOpenChange(true);
    };
    const onTrigClick = (buildMenuEl) => { if (open) close(false); else openMenu(buildMenuEl, true); };
    const onTrigKey = (e, buildMenuEl) => { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!open) openMenu(buildMenuEl, true); else focusItem(0); } };
    const refFn = (dsFlag) => (el) => {
        if (!el || el[dsFlag]) return;
        el[dsFlag] = true; triggerEl = el;
        el.setAttribute('aria-haspopup', 'menu');
        el.setAttribute('aria-expanded', 'false');
    };
    return { refFn, onTrigClick, onTrigKey, openMenu, close, focusItem, isOpen: () => open };
}
