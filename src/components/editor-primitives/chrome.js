
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { kids } from './shared.js';
const h = webjsx.createElement;

export function Toolbar({ leading = [], trailing = [], dense = false, children } = {}) {
    const cls = 'ds-ep-toolbar' + (dense ? ' dense' : '');
    return h('div', { class: cls, role: 'toolbar' },
        h('div', { class: 'ds-ep-toolbar-leading' }, ...kids(leading)),
        children != null ? h('div', { class: 'ds-ep-toolbar-center' }, ...kids(children)) : null,
        h('div', { class: 'ds-ep-toolbar-trailing' }, ...kids(trailing))
    );
}

export function ToolbarRow(...actions) {
    const flat = actions.length === 1 && Array.isArray(actions[0]) ? actions[0] : actions;
    return h('div', { class: 'ds-ep-toolbar-row', role: 'toolbar' }, ...kids(flat));
}

export function Tabs({ items = [], active, onChange, children, 'aria-label': ariaLabel, onClose, scroll = false } = {}) {
    const activeIdx = Math.max(0, items.findIndex(it => it.id === active));
    const onTabKeyDown = (e, idx) => {
        let next = null;
        if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
        else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = items.length - 1;
        if (next == null) return;
        e.preventDefault();
        const nextId = items[next]?.id;
        if (nextId && onChange) onChange(nextId);
        queueMicrotask(() => {
            const head = e.currentTarget?.parentElement;
            const btn = head?.querySelectorAll('[role="tab"]')[next];
            if (btn) btn.focus();
        });
    };
    const positionSlider = (root) => {
        if (!root) return;
        const head = root.querySelector('.ds-ep-tabs-head');
        const active = root.querySelector('.ds-ep-tab.active');
        const ind = root.querySelector('.ds-ep-tab-indicator');
        if (!head || !active || !ind) return;
        const rootW = root.offsetWidth;
        const l = active.offsetLeft, w = active.offsetWidth;
        ind.style.left = l + 'px';
        ind.style.right = Math.max(0, rootW - l - w) + 'px';
        ind.style.top = (head.offsetTop + head.offsetHeight - 2) + 'px';
        head.classList.add('has-slider');
    };
    const closable = typeof onClose === 'function';
    return h('div', { class: 'ds-ep-tabs', ref: positionSlider },
        h('div', { class: 'ds-ep-tabs-head' + (scroll ? ' scroll' : ''), role: 'tablist', 'aria-label': ariaLabel || 'tabs' },
            ...items.map((it, idx) => h('span', {
                key: it.id,
                class: 'ds-ep-tab-wrap' + (it.id === active ? ' active' : ''),
                onmousedown: closable ? (e) => { if (e.button === 1) e.preventDefault(); } : null,
                onauxclick: closable ? (e) => {
                    if (e.button !== 1) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onClose(it.id);
                } : null
            },
                h('button', {
                    type: 'button',
                    class: 'ds-ep-tab' + (it.id === active ? ' active' : ''),
                    role: 'tab',
                    id: 'tab-' + it.id,
                    title: typeof it.label === 'string' ? it.label : undefined,
                    'aria-selected': it.id === active ? 'true' : 'false',
                    'aria-controls': 'tabpanel-' + it.id,
                    'aria-label': typeof it.label === 'string' ? it.label : ('tab ' + (idx + 1)),
                    tabindex: idx === activeIdx ? '0' : '-1',
                    onclick: () => onChange && onChange(it.id),
                    onkeydown: (e) => onTabKeyDown(e, idx)
                }, it.label),
                closable ? h('button', {
                    type: 'button',
                    class: 'ds-ep-tab-close',
                    title: 'Close',
                    'aria-label': 'Close ' + (typeof it.label === 'string' ? it.label : 'tab'),
                    onclick: (e) => { e.stopPropagation(); onClose(it.id); }
                }, Icon('x', { size: 14 })) : null
            ))
        ),
        h('span', { key: '__ind', class: 'ds-ep-tab-indicator', 'aria-hidden': 'true' }),
        h('div', {
            class: 'ds-ep-tabs-body',
            role: 'tabpanel',
            id: active ? 'tabpanel-' + active : undefined,
            'aria-labelledby': active ? 'tab-' + active : undefined,
            tabindex: '0'
        }, ...kids(children))
    );
}

export function IconButtonGroup({ items = [], value, onChange, dense = false } = {}) {
    return h('div', { class: 'ds-ep-btngrp' + (dense ? ' dense' : ''), role: 'group' },
        ...items.map((it) => h('button', {
            key: it.id,
            type: 'button',
            class: 'ds-ep-btngrp-btn' + (it.id === value ? ' active' : ''),
            title: it.title || it.label || it.id,
            'aria-pressed': it.id === value ? 'true' : 'false',
            disabled: it.disabled ? 'disabled' : null,
            onclick: () => { if (!it.disabled && onChange) onChange(it.id); }
        }, it.glyph != null ? it.glyph : it.label))
    );
}
