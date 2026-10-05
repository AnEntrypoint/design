import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
const h = webjsx.createElement;

export function Spinner({ size = 'base', tone = 'accent', label = 'loading', key } = {}) {
    const SIZE_CLASS = { xs: 'ds-spinner-xs', sm: 'ds-spinner-sm', base: '', lg: 'ds-spinner-lg', xl: 'ds-spinner-xl' };
    const sizeClass = SIZE_CLASS[size] != null ? SIZE_CLASS[size] : '';
    return h('div', {
        key, class: 'ds-spinner ' + sizeClass + ' tone-' + tone,
        role: 'status', 'aria-live': 'polite', 'aria-label': label
    },
        h('span', { key: '1', 'aria-hidden': 'true' }),
        h('span', { key: '2', 'aria-hidden': 'true' }),
        h('span', { key: '3', 'aria-hidden': 'true' })
    );
}

function clampLen(v, fallback) {
    if (v == null) return fallback;
    const s = String(v).trim();
    const m = /^(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw)?$/.exec(s);
    if (!m) return fallback;
    const unit = m[2] || 'px';
    let n = parseFloat(m[1]);
    if (unit === '%' || unit === 'vh' || unit === 'vw') n = Math.min(100, Math.max(0, n));
    else n = Math.min(600, Math.max(2, n));
    return n + unit;
}

export function Skeleton({ height = '1em', width = '100%', count = 1, label = 'loading content', key } = {}) {
    const h_ = clampLen(height, '1em');
    const w_ = clampLen(width, '100%');
    return h('div', {
        key, class: 'ds-skeleton-group',
        role: 'status', 'aria-busy': 'true', 'aria-label': label
    },
        ...Array(count).fill(0).map((_, i) =>
            h('div', { key: String(i), class: 'ds-skeleton', style: `height:${h_};width:${w_};`, 'aria-hidden': 'true' })
        )
    );
}

export function FilterPills({ options = [], selected, onSelect, label = 'filters' } = {}) {
    if (!options.length) return null;
    return h('div', { class: 'ds-filter-pills', role: 'group', 'aria-label': label },
        ...options.map((o) => h('button', {
            key: 'fp-' + o.id,
            type: 'button',
            class: 'ds-filter-pill' + (o.tone ? ' tone-' + o.tone : '') + (o.id === selected ? ' active' : ''),
            'aria-pressed': o.id === selected ? 'true' : 'false',
            onclick: () => onSelect && onSelect(o.id),
        }, o.label != null ? o.label : o.id)));
}

export function Alert({ kind = 'info', children, onDismiss, title, key } = {}) {
    const icons = { info: 'info', success: 'check', warn: 'warn', error: 'x' };
    const cls = 'ds-alert ds-alert-' + kind;
    return h('div', { key, class: cls, role: 'alert' },
        h('span', { key: 'icon', class: 'ds-alert-icon' }, Icon(icons[kind] || 'info')),
        h('div', { key: 'content', class: 'ds-alert-content' },
            title ? h('div', { key: 'title', class: 'ds-alert-title' }, title) : null,
            h('div', { key: 'msg', class: 'ds-alert-message' }, ...(Array.isArray(children) ? children : [children]))
        ),
        onDismiss ? h('button', { key: 'dismiss', class: 'ds-alert-dismiss', 'aria-label': 'dismiss', onclick: onDismiss }, Icon('x')) : null
    );
}
