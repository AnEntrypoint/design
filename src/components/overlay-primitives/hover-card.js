
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Popover } from './popover.js';
import { kids, cloneVNode } from './floating.js';
const h = webjsx.createElement;

const _timers = new WeakMap();

function _clear(el) {
    const t = _timers.get(el);
    if (t) { clearTimeout(t.open); clearTimeout(t.close); }
}

export function HoverCard({ trigger, content, open, onOpenChange, openDelay = 700, closeDelay = 300, placement = 'top', ariaLabel } = {}) {
    const child = kids(trigger)[0];
    if (!child) return null;
    const schedule = (el, kind, ms) => {
        _clear(el);
        const timers = _timers.get(el) || {};
        if (kind === 'open') timers.open = setTimeout(() => onOpenChange && onOpenChange(true), ms);
        else timers.close = setTimeout(() => onOpenChange && onOpenChange(false), ms);
        _timers.set(el, timers);
    };
    const runPopover = (el) => Popover({
        open: Boolean(open), anchorEl: el, onClose: () => onOpenChange && onOpenChange(false),
        placement, ariaLabel, children: content,
    });
    const anchorRef = (el) => {
        if (!el) return;
        queueMicrotask(() => runPopover(el));
        if (el._dsHoverCard) return;
        el._dsHoverCard = true;
        el.addEventListener('pointerenter', () => schedule(el, 'open', openDelay));
        el.addEventListener('pointerleave', () => schedule(el, 'close', closeDelay));
        el.addEventListener('focusin', () => schedule(el, 'open', openDelay));
        el.addEventListener('focusout', (e) => { if (!(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.ds-popover'))) schedule(el, 'close', closeDelay); });
    };
    return h('span', { class: 'ds-hovercard', ref: anchorRef },
        cloneVNode(child));
}
