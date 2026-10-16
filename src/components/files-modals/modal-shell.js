
import * as webjsx from '../../../vendor/webjsx/index.js';
import { shortUid } from '../../uid.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

const FOCUSABLE_SEL = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function Backdrop({ onClose, children, kind = '', labelledBy, busy = false } = {}) {
    const backdropRef = (el) => {
        if (!el) return;
        queueMicrotask(() => wireBackdrop(el));
    };

    function wireBackdrop(el) {
        if (!el.isConnected) return;
        const modal = el.querySelector('.ds-modal');
        if (!modal) return;

        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (el.dataset.busy === '1') return;
                if (onClose) onClose();
                return;
            }
            if (e.key === 'Tab') {
                const focusables = modal.querySelectorAll(FOCUSABLE_SEL);
                if (focusables.length === 0) {
                    e.preventDefault();
                    return;
                }
                const firstFocusable = focusables[0];
                const lastFocusable = focusables[focusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeydown, true);
        const invoker = el.contains(document.activeElement) ? (Backdrop._invoker || document.activeElement) : document.activeElement;
        if (!Backdrop._invoker) Backdrop._invoker = invoker;
        el._dsModalTeardown = (removed) => {
            document.removeEventListener('keydown', handleKeydown, true);
            if (removed && Backdrop._invoker && Backdrop._invoker.focus && Backdrop._invoker.isConnected) {
                attempt(() => { Backdrop._invoker.focus(); });
            }
            if (removed) Backdrop._invoker = null;
        };
        if (!el.contains(document.activeElement)) {
            const preferred = modal.querySelector('[autofocus]') || modal.querySelector(FOCUSABLE_SEL);
            if (preferred) preferred.focus();
        }
    };

    return h('div', {
        class: 'ds-modal-backdrop',
        'data-busy': busy ? '1' : '0',
        ref: (el) => {
            if (el) {
                Backdrop._pendingRemoval = false;
                backdropRef(el);
                Backdrop._last = el;
            } else if (Backdrop._last && Backdrop._last._dsModalTeardown) {
                const t = Backdrop._last._dsModalTeardown;
                Backdrop._last = null;
                Backdrop._pendingRemoval = true;
                t(false);
                queueMicrotask(() => {
                    if (Backdrop._pendingRemoval) { t(true); Backdrop._pendingRemoval = false; }
                });
            }
        },
        onclick: (e) => {
            if (e.target !== e.currentTarget) return;
            if (e.currentTarget.dataset.busy === '1') return;
            if (onClose) onClose();
        }
    },
        h('div', {
            class: 'ds-modal' + (kind ? ' ds-modal-' + kind : ''),
            role: 'dialog', 'aria-modal': 'true',
            ...(labelledBy ? { 'aria-labelledby': labelledBy } : {})
        }, ...(Array.isArray(children) ? children : [children]))
    );
}

export function Modal({ onClose, kind = '', head, headClass = '', headAttrs = {}, body, bodyClass = 'ds-modal-body', bodyAttrs = {}, actions, busy = false } = {}) {
    const headId = head != null ? ('ds-modal-head-' + shortUid(6)) : null;
    return Backdrop({
        onClose,
        kind,
        busy,
        labelledBy: headId,
        children: [
            head != null ? h('div', { id: headId, class: ('ds-modal-head' + (headClass ? ' ' + headClass : '')), ...headAttrs }, ...(Array.isArray(head) ? head : [head])) : null,
            body != null ? h('div', { class: bodyClass, ...bodyAttrs }, ...(Array.isArray(body) ? body : [body])) : null,
            actions != null ? h('div', { class: 'ds-modal-actions' }, ...(Array.isArray(actions) ? actions : [actions])) : null,
        ].filter(Boolean)
    });
}

export function modalError(error) {
    return error ? h('p', { class: 'ds-modal-error', role: 'alert' }, String(error)) : null;
}
