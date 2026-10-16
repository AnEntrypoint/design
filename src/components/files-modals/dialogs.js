
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn } from '../shell.js';
import { Modal, modalError } from './modal-shell.js';
const h = webjsx.createElement;

export function ConfirmDialog({ title = 'Are you sure?', message, confirmLabel = 'confirm', cancelLabel = 'cancel', destructive, onConfirm, onCancel, error, busy = false, busyLabel = 'working…' } = {}) {
    return Modal({
        onClose: onCancel,
        kind: 'small',
        busy,
        head: title,
        body: [message || '', modalError(error)].filter(Boolean),
        actions: [
            Btn({ onClick: onCancel, disabled: busy, children: cancelLabel }),
            Btn({ variant: destructive ? 'danger' : 'primary', disabled: busy, onClick: onConfirm, children: busy ? busyLabel : confirmLabel })
        ]
    });
}

export function PromptDialog({ title = 'Enter a name', value = '', placeholder = '', confirmLabel = 'ok', cancelLabel = 'cancel', onConfirm, onCancel, onInput, error, busy = false, busyLabel = 'working…', roots, onPickRoot } = {}) {
    const rootsRow = (roots && roots.length)
        ? h('div', { class: 'ds-prompt-roots', role: 'group', 'aria-label': 'accessible folders' },
            ...roots.map((r, i) => h('button', {
                key: 'pr' + i, type: 'button', class: 'ds-prompt-root-chip',
                onclick: () => { const p = r.path || r; if (onPickRoot) onPickRoot(p); else if (onInput) onInput(p); },
            }, r.label || r.path || r)))
        : null;
    return Modal({
        onClose: onCancel,
        kind: 'small',
        busy,
        head: title,
        body: [h('input', {
            class: 'input ds-modal-input',
            type: 'text',
            value,
            placeholder,
            autofocus: true,
            disabled: busy ? true : null,
            'aria-invalid': error ? 'true' : null,
            oninput: (e) => onInput && onInput(e.target.value),
            onkeydown: (e) => {
                if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); if (!busy) onConfirm && onConfirm(e.target.value); }
                if (e.key === 'Escape') { e.preventDefault(); if (!busy) onCancel && onCancel(); }
            }
        }), rootsRow, modalError(error)].filter(Boolean),
        actions: [
            Btn({ onClick: onCancel, disabled: busy, children: cancelLabel }),
            Btn({
                primary: true,
                disabled: busy,
                onClick: (e) => {
                    if (!onConfirm) return;
                    const inp = e.currentTarget.closest('.ds-modal')?.querySelector('.ds-modal-input');
                    onConfirm(inp ? inp.value : value);
                },
                children: busy ? busyLabel : confirmLabel
            })
        ]
    });
}

export function CountdownDialog({ title = 'Are you sure?', message, seconds = 10, onExpire, actions } = {}) {
    const startSeconds = Math.max(0, Math.floor(seconds));
    return Modal({
        onClose: undefined,
        kind: 'small',
        head: title,
        body: [
            message || '',
            h('p', {
                class: 'ds-countdown-status', role: 'status', 'aria-live': 'polite',
                ref: (el) => {
                    if (!el || el._dsCountdownTimer) return;
                    let remaining = startSeconds;
                    const render = () => { el.textContent = remaining + (remaining === 1 ? ' second' : ' seconds') + ' remaining'; };
                    render();
                    el._dsCountdownTimer = setInterval(() => {
                        remaining -= 1;
                        if (remaining <= 0) {
                            clearInterval(el._dsCountdownTimer);
                            el._dsCountdownTimer = null;
                            remaining = 0;
                            render();
                            if (onExpire) onExpire();
                            return;
                        }
                        render();
                    }, 1000);
                },
            }),
            modalError(null),
        ].filter(Boolean),
        actions: actions || [],
    });
}
