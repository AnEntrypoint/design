
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { useRovingMenu } from './roving-menu.js';
import { cloneVNode } from './floating.js';
const h = webjsx.createElement;

export function Dropdown({ trigger, items = [], onSelect, placement = 'bottom-start', ariaLabel } = {}) {
    const menu = useRovingMenu({ itemSelector: '[role="menuitem"]:not([aria-disabled="true"])', items, typeahead: true, placement });
    const select = (it) => { if (it.disabled || it.separator) return; if (onSelect) onSelect(it.id, it); menu.close(); };
    const buildMenuEl = () => {
        const el = document.createElement('div');
        el.className = 'ds-popover ds-dropdown-menu';
        el.setAttribute('role', 'menu');
        if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
        const tree = h('div', { class: 'ds-dropdown-list' },
            ...items.map((it, i) => it.separator
                ? h('div', { key: 'sep' + i, class: 'ds-dropdown-separator', role: 'separator' })
                : h('button', {
                    key: it.id || i, type: 'button', role: 'menuitem',
                    class: 'ds-dropdown-item' + (it.danger ? ' is-danger' : ''),
                    'aria-disabled': it.disabled ? 'true' : 'false',
                    tabindex: '-1', onclick: () => select(it),
                },
                    it.glyph != null ? h('span', { class: 'ds-dropdown-glyph', 'aria-hidden': 'true' }, it.glyph) : null,
                    h('span', { class: 'ds-dropdown-label' }, it.label)
                )));
        webjsx.applyDiff(el, tree);
        return el;
    };
    const onTrigClick = () => menu.onTrigClick(buildMenuEl);
    const onTrigKey = (e) => menu.onTrigKey(e, buildMenuEl);
    const refFn = menu.refFn('_dsDropdown');
    const child = (typeof trigger === 'function') ? trigger() : trigger;
    const wireRef = (el) => { refFn(el); if (el) { el.addEventListener('click', onTrigClick); el.addEventListener('keydown', onTrigKey); } };
    return (child && child.type)
        ? cloneVNode(child, { ref: wireRef })
        : h('button', { type: 'button', class: 'ds-dropdown-trigger', ref: wireRef }, child || 'Menu');
}

export function PermissionMenu({ trigger, categories = [], approved = [], onToggle, onToggleAll, placement = 'bottom-start', ariaLabel = 'Permissions' } = {}) {
    const isApproved = (id) => approved.indexOf(id) !== -1;
    const menu = useRovingMenu({ itemSelector: '[role="menuitemcheckbox"]', items: categories, getLabel: (cat) => cat.label || cat.id, typeahead: true, placement });
    const toggle = (cat) => { if (onToggle) onToggle(cat.id, !isApproved(cat.id)); };
    const buildMenuEl = () => {
        const el = document.createElement('div');
        el.className = 'ds-popover ov-perm-menu';
        el.setAttribute('role', 'menu');
        el.setAttribute('aria-label', ariaLabel);
        const rows = categories.map((cat, i) => h('button', {
            key: cat.id || i, type: 'button', role: 'menuitemcheckbox',
            'aria-checked': isApproved(cat.id) ? 'true' : 'false',
            class: 'ov-perm-item' + (isApproved(cat.id) ? ' is-approved' : ''),
            tabindex: '-1',
            onclick: () => toggle(cat),
        }, h('span', { class: 'ov-perm-label' }, cat.label || cat.id)));
        const actionsRow = h('div', { class: 'ov-perm-actions' },
            h('button', { type: 'button', class: 'ov-perm-action', onclick: () => onToggleAll && onToggleAll(true) }, 'Approve all'),
            h('button', { type: 'button', class: 'ov-perm-action', onclick: () => onToggleAll && onToggleAll(false) }, 'Revoke all'));
        webjsx.applyDiff(el, h('div', { class: 'ov-perm-list' }, ...rows, actionsRow));
        return el;
    };
    const onTrigClick = () => menu.onTrigClick(buildMenuEl);
    const onTrigKey = (e) => menu.onTrigKey(e, buildMenuEl);
    const refFn = menu.refFn('_dsPermMenu');
    const child = (typeof trigger === 'function') ? trigger() : trigger;
    const wireRef = (el) => { refFn(el); if (el) { el.addEventListener('click', onTrigClick); el.addEventListener('keydown', onTrigKey); } };
    return (child && child.type)
        ? cloneVNode(child, { ref: wireRef })
        : h('button', { type: 'button', class: 'ov-perm-trigger', ref: wireRef }, child || 'Permissions');
}

export function MenuButton({ trigger, items = [], selected, onSelect, onRetry, placement = 'bottom-start', ariaLabel = 'Menu', emptyText = 'No options available' } = {}) {
    const menu = useRovingMenu({ itemSelector: '[role="menuitemradio"]:not([aria-disabled="true"])', items, typeahead: true, placement });
    const select = (it) => { if (it.disabled || it.unavailable) return; if (onSelect) onSelect(it.id, it); menu.close(); };
    const buildMenuEl = () => {
        const el = document.createElement('div');
        el.className = 'ds-popover ov-menubutton-menu';
        el.setAttribute('role', 'menu');
        el.setAttribute('aria-label', ariaLabel);
        const tree = items.length
            ? h('div', { class: 'ov-menubutton-list' },
                ...items.map((it, i) => it.unavailable
                    ? h('div', { key: it.id || i, class: 'ov-menubutton-item is-unavailable' },
                        h('span', { class: 'ov-menubutton-label' }, it.label || 'Unavailable'),
                        h('button', { type: 'button', class: 'ov-menubutton-retry', onclick: () => onRetry && onRetry(it.id, it) }, 'Retry')
                    )
                    : h('button', {
                        key: it.id || i, type: 'button', role: 'menuitemradio',
                        'aria-checked': it.id === selected ? 'true' : 'false',
                        class: 'ov-menubutton-item',
                        'aria-disabled': it.disabled ? 'true' : 'false',
                        tabindex: '-1', onclick: () => select(it),
                    },
                        h('span', { class: 'ov-menubutton-check', 'aria-hidden': 'true' }, it.id === selected ? Icon('check', { size: 14 }) : ''),
                        h('span', { class: 'ov-menubutton-label' }, it.label)
                    )))
            : h('div', { class: 'ov-menubutton-empty' }, emptyText);
        webjsx.applyDiff(el, tree);
        return el;
    };
    const onTrigClick = () => menu.onTrigClick(buildMenuEl);
    const onTrigKey = (e) => menu.onTrigKey(e, buildMenuEl);
    const refFn = menu.refFn('_ovMenuButton');
    const child = (typeof trigger === 'function') ? trigger() : trigger;
    const wireRef = (el) => { refFn(el); if (el) { el.addEventListener('click', onTrigClick); el.addEventListener('keydown', onTrigKey); } };
    return (child && child.type)
        ? cloneVNode(child, { ref: wireRef })
        : h('button', { type: 'button', class: 'ov-menubutton-trigger', ref: wireRef }, child || 'Select');
}
