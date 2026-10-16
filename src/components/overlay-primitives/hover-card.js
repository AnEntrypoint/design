
import * as webjsx from '../../../vendor/webjsx/index.js';
import { useFloating, FLOAT_OFFSET_POPOVER, FOCUSABLE_SEL, kids, cloneVNode } from './floating.js';
const h = webjsx.createElement;

const _timers = new WeakMap();
const _cards = new WeakMap();

function _clear(el) {
    const t = _timers.get(el);
    if (t) { clearTimeout(t.open); clearTimeout(t.close); }
}

export function HoverCard({ trigger, content, open, onOpenChange, openDelay = 700, closeDelay = 300, placement = 'top', ariaLabel } = {}) {
    const child = kids(trigger)[0];
    if (!child) return null;

    const dispose = (el) => {
        const card = _cards.get(el);
        if (!card) return;
        if (card.floating) card.floating.dispose();
        if (card.el && card.el.parentNode) card.el.parentNode.removeChild(card.el);
        _cards.delete(el);
    };

    const mount = (el) => {
        dispose(el);
        const node = document.createElement('div');
        node.className = 'ds-popover';
        node.setAttribute('role', 'dialog');
        if (ariaLabel) node.setAttribute('aria-label', ariaLabel);
        node.tabIndex = -1;
        document.body.appendChild(node);
        webjsx.applyDiff(node, h('div', { class: 'ds-popover-inner' }, ...kids(content)));
        const entry = { el: node, floating: useFloating(el, node, { placement, offset: FLOAT_OFFSET_POPOVER }) };
        node.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            _clear(el);
            dispose(el);
            onOpenChange && onOpenChange(false);
            setTimeout(() => {
                if (!document.contains(el)) return;
                const target = el.querySelector(FOCUSABLE_SEL) || el;
                if (target.focus) target.focus();
            }, 0);
        });
        node.addEventListener('pointerenter', () => { _clear(el); el._dsHcOnCard = true; });
        node.addEventListener('pointerleave', () => { el._dsHcOnCard = false; schedule(el, 'close', closeDelay); });
        _cards.set(el, entry);
        if (el._dsHcViaKeyboard) {
            setTimeout(() => {
                const f = node.querySelector(FOCUSABLE_SEL);
                (f || node).focus();
            }, 0);
        }
    };

    const schedule = (el, kind, ms) => {
        _clear(el);
        const timers = _timers.get(el) || {};
        if (kind === 'open') timers.open = setTimeout(() => onOpenChange && onOpenChange(true), ms);
        else timers.close = setTimeout(() => { dispose(el); onOpenChange && onOpenChange(false); }, ms);
        _timers.set(el, timers);
    };

    const anchorRef = (el) => {
        if (!el) return;
        if (open) { if (!_cards.has(el)) mount(el); } else dispose(el);
        if (el._dsHoverCard) return;
        el._dsHoverCard = true;
        el.addEventListener('pointerenter', () => { el._dsHcViaKeyboard = false; schedule(el, 'open', openDelay); });
        el.addEventListener('pointerleave', () => { if (el._dsHcOnCard) return; schedule(el, 'close', closeDelay); });
        el.addEventListener('focusin', () => { el._dsHcViaKeyboard = true; schedule(el, 'open', openDelay); });
        el.addEventListener('focusout', (e) => {
            if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.ds-popover')) return;
            schedule(el, 'close', closeDelay);
        });
    };

    return h('span', { class: 'ds-hovercard', tabindex: '-1', ref: anchorRef },
        cloneVNode(child));
}
