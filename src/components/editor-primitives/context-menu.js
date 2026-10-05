
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function ContextMenu({ items = [], anchor = { x: 0, y: 0 }, onClose } = {}) {
    let rootEl = null;
    const close = () => { if (onClose) onClose(); };
    const select = (it) => {
        if (it.disabled || it.separator) return;
        if (it.onSelect) it.onSelect();
        close();
    };
    const onKey = (e) => {
        const btns = rootEl ? [...rootEl.querySelectorAll('button[data-ix]')] : [];
        const active = document.activeElement;
        const idx = btns.indexOf(active);
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); (btns[(idx + 1) % btns.length] || btns[0])?.focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (btns[(idx - 1 + btns.length) % btns.length] || btns[0])?.focus(); }
        else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); btns[idx].click(); }
    };
    return h('div', {
        class: 'ds-ep-ctxmenu-backdrop',
        onmousedown: (e) => { if (e.target === e.currentTarget) close(); },
        oncontextmenu: (e) => { e.preventDefault(); close(); },
    },
        h('div', {
            class: 'ds-ep-ctxmenu',
            role: 'menu',
            tabindex: '-1',
            onkeydown: onKey,
            ref: (el) => {
                if (!el) {
                    if (rootEl && rootEl._dsCtxClampOff) { rootEl._dsCtxClampOff(); }
                    rootEl = null;
                    return;
                }
                rootEl = el;
                const ax = anchor.x || 0, ay = anchor.y || 0;
                el.style.left = ax + 'px';
                el.style.top = ay + 'px';
                const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
                const clamp = () => {
                    const vw = window.innerWidth, vh = window.innerHeight;
                    const r = el.getBoundingClientRect();
                    let x = ax, y = ay;
                    if (coarse) {
                        y = ay + 10;
                        if (ay > vh / 2 && ay - r.height >= 4) y = ay - r.height;
                    }
                    if (x + r.width > vw) x = Math.max(4, vw - r.width - 4);
                    if (y + r.height > vh) y = Math.max(4, vh - r.height - 4);
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                };
                requestAnimationFrame(clamp);
                window.addEventListener('resize', clamp);
                el._dsCtxClampOff = () => { window.removeEventListener('resize', clamp); el._dsCtxClampOff = null; };
                setTimeout(() => { el.querySelector('button[data-ix]')?.focus(); }, 0);
            }
        },
            ...items.map((it, i) => it.separator
                ? h('div', { key: 'sep' + i, class: 'ds-ep-ctxmenu-sep', role: 'separator' })
                : h('button', {
                    key: i, type: 'button', role: 'menuitem',
                    'data-ix': String(i),
                    class: 'ds-ep-ctxmenu-item' + (it.danger ? ' danger' : '') + (it.disabled ? ' disabled' : ''),
                    disabled: it.disabled ? 'disabled' : null,
                    onclick: () => select(it),
                },
                    it.icon != null ? h('span', { class: 'ds-ep-ctxmenu-icon' }, it.icon) : null,
                    h('span', { class: 'ds-ep-ctxmenu-label' }, it.label)
                ))
        )
    );
}

export function useContextMenu(targetEl, items, openCb) {
    if (!targetEl) return () => {};
    let touchTimer = null, lastOpen = 0;
    const open = (x, y) => {
        if (Date.now() - lastOpen < 700) return;
        lastOpen = Date.now();
        if (openCb) openCb({ x, y, items });
    };
    const onCtx = (e) => { e.preventDefault(); open(e.clientX, e.clientY); };
    const onTouchStart = (e) => {
        const t = e.touches && e.touches[0]; if (!t) return;
        touchTimer = setTimeout(() => { touchTimer = null; open(t.clientX, t.clientY); }, 500);
    };
    const cancel = () => { if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; } };
    targetEl.addEventListener('contextmenu', onCtx);
    targetEl.addEventListener('touchstart', onTouchStart, { passive: true });
    targetEl.addEventListener('touchmove', cancel, { passive: true });
    targetEl.addEventListener('touchend', cancel);
    targetEl.addEventListener('touchcancel', cancel);
    return () => {
        targetEl.removeEventListener('contextmenu', onCtx);
        targetEl.removeEventListener('touchstart', onTouchStart);
        targetEl.removeEventListener('touchmove', cancel);
        targetEl.removeEventListener('touchend', cancel);
        targetEl.removeEventListener('touchcancel', cancel);
        cancel();
    };
}
