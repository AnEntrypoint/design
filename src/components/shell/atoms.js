import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from './icons.js';
const h = webjsx.createElement;

/**
 * The wordmark used in Topbar/AppShell headers.
 *
 * @param {Object} [props]
 * @param {string} [props.name='247420'] - the brand text.
 * @param {*} [props.leaf] - optional trailing breadcrumb-style leaf, rendered after a " / " separator.
 * @returns {*} webjsx vnode
 */
export function Brand({ name = '247420', leaf } = {}) {
    return h('span', { class: 'brand' }, name,
        leaf ? h('span', { class: 'slash' }, ' / ') : null,
        leaf || null);
}

/**
 * A small pill/tag label.
 *
 * @param {Object} props
 * @param {string} [props.tone=''] - semantic color tone (empty = neutral).
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.tag=false] - true renders a rectangular sentence-case variant for dense data (drops the all-caps pill styling). Orthogonal to tone.
 * @param {Function} [props.onRemove] - if given, renders a trailing dismiss (x) button that calls onRemove() on click. Omitted entirely (no button) when not supplied.
 * @param {*} props.children
 * @returns {*} webjsx vnode
 */
export function Chip({ tone = '', size = 'md', tag = false, onRemove, children }) {
    const sizeCls = size === 'sm' ? ' chip--sm' : (size === 'lg' ? ' chip--lg' : '');
    return h('span', { class: 'chip' + sizeCls + (tag ? ' chip--tag' : '') + (tone ? ' tone-' + tone : '') + (onRemove ? ' ds-chip-removable' : '') },
        children,
        onRemove ? h('button', { type: 'button', class: 'ds-chip-remove-btn', 'aria-label': 'Remove', onclick: (e) => { e.stopPropagation(); onRemove(); } }, Icon('x')) : null);
}

/**
 * The standard button/link factory. Renders an `<a>` when `href` is given,
 * otherwise a `<button>`.
 *
 * @param {Object} props
 * @param {string} [props.href] - if present, renders as a link instead of a button.
 * @param {'default'|'primary'|'ghost'|'danger'|'link'} [props.variant='default']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {*} props.children
 * @param {Function} [props.onClick]
 * @param {string} [props['aria-label']]
 * @param {string} [props.title] - native tooltip text; also serves as the accessible name when no aria-label and no text child is given (the icon-only case).
 * @param {boolean} [props.primary] - legacy alias for variant:'primary', kept for backward compatibility.
 * @param {boolean} [props.ghost] - legacy alias for variant:'ghost'.
 * @param {boolean} [props.danger] - legacy alias for variant:'danger'.
 * @param {boolean} [props.disabled]
 * @param {string} [props.class] - extra class name(s) appended to the generated class list.
 * @param {*} [props.key]
 * @returns {*} webjsx vnode
 */
export function Btn({ href, variant = 'default', size = 'md', children, onClick, 'aria-label': ariaLabel, title, primary, ghost, danger, disabled, class: className, key }) {
    if (primary || ghost || danger) {
        const used = primary ? 'primary' : (ghost ? 'ghost' : 'danger');
        console.warn(`[247420] Btn's "${used}" boolean prop is deprecated: use variant="${used}" instead. No removal version set yet (tracked in MIGRATION_GUIDE.md); both still work.`);
    }
    const resolvedVariant = variant !== 'default' ? variant : (primary ? 'primary' : (ghost ? 'ghost' : (danger ? 'danger' : 'default')));
    const sizeCls = size === 'sm' ? ' btn-sm' : (size === 'lg' ? ' btn-lg' : '');
    const cls = (resolvedVariant === 'primary' ? 'btn-primary' : (resolvedVariant === 'ghost' ? 'btn-ghost' : (resolvedVariant === 'danger' ? 'btn-primary danger' : (resolvedVariant === 'link' ? 'btn-link' : 'btn'))))
        + sizeCls
        + (disabled ? ' is-disabled' : '')
        + (className ? ' ' + className : '');
    const onclick = (e) => {
        if (disabled) { e.preventDefault(); return; }
        if (onClick) onClick(e);
    };
    const ariaName = ariaLabel || title || (typeof children === 'string' ? children : undefined);

    const kids = Array.isArray(children) ? children : [children];
    const isLink = href != null && href !== '' && href !== '#';
    if (isLink) {
        return h('a', {
            key,
            class: cls, href,
            title,
            'aria-label': ariaName,
            'aria-disabled': disabled ? 'true' : null,
            tabindex: disabled ? '-1' : null,
            onclick
        }, ...kids);
    }
    return h('button', {
        key,
        type: 'button', class: cls,
        disabled: disabled ? true : null,
        title,
        'aria-label': ariaName,
        onclick
    }, ...kids);
}

export function IconButton({ icon, onClick, title, size = 'base', variant = 'ghost', disabled = false }) {
    const cls = 'ds-icon-btn ds-icon-btn-' + variant + ' ds-icon-btn-' + size + (disabled ? ' is-disabled' : '');
    return h('button', {
        type: 'button',
        class: cls,
        title,
        'aria-label': title,
        disabled: disabled ? true : null,
        onclick: (e) => { if (disabled) { e.preventDefault(); return; } if (onClick) onClick(e); }
    }, Glyph({ children: icon, size }));
}

/**
 * A small count/variant/status marker (unread count, label chip inline with
 * text). Distinct from Chip (a status-tone indicator element in its own
 * right) and Pill (a plain non-interactive tag label): see the comments at
 * each below for the three-way split.
 * @param {Object} props
 * @param {*} props.children
 * @param {string} [props.variant='default']
 * @param {string} [props.tone='neutral'] - semantic tone keyword, applies a `tone-{tone}` class.
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @returns {*} webjsx vnode
 * @example Badge({ children: '3', tone: 'accent', size: 'sm' })
 */
export function Badge({ children, variant = 'default', tone = 'neutral', size = 'md' }) {
    const sizeCls = size === 'sm' ? ' ds-badge--sm' : (size === 'lg' ? ' ds-badge--lg' : '');
    return h('span', { class: 'ds-badge ds-badge-' + variant + sizeCls + ' tone-' + tone }, children);
}

export function Pill({ tone = '', children, key } = {}) {
    return h('span', { key, class: 'ds-pill' + (tone ? ' tone-' + tone : '') }, children);
}

/**
 * A themeable inline text/character glyph (font-size + optional color from
 * tokens): for a real icon shape, use Icon()/iconMarkup() from
 * shell/icons.js instead; Glyph is for short text/character content only.
 * Decorative (aria-hidden) by default; pass `label` to expose it as a real
 * accessible image instead.
 * @param {Object} props
 * @param {*} props.children - the glyph content (a character/short string).
 * @param {string} [props.color] - CSS color value; omit to inherit currentColor.
 * @param {'sm'|'base'|'lg'} [props.size='base']
 * @param {string} [props.label] - accessible name; when set, renders role="img" instead of aria-hidden.
 * @returns {*} webjsx vnode
 * @example Glyph({ children: '#', size: 'sm' })
 * @example Glyph({ children: '*', label: 'Complete', color: 'var(--success)' })
 */
export function Glyph({ children, color, size = 'base', label } = {}) {
    const fallback = size === 'sm' ? '11px' : (size === 'lg' ? '16px' : '13px');
    const cls = 'glyph glyph-' + size;
    const style = `font-size:var(--glyph-size-${size}, ${fallback})` + (color ? `;color:${color}` : '');
    return h('span', label
        ? { class: cls, style, role: 'img', 'aria-label': label }
        : { class: cls, style, 'aria-hidden': 'true' }, children);
}

export function Heading({ level = 1, children, style = '', class: className = '', 'aria-level': ariaLevel }) {
    return h('h' + level, { class: className || null, style: style || null, 'aria-level': ariaLevel != null ? String(ariaLevel) : null }, children);
}

export function Lede({ children }) {
    return h('p', { class: 'lede' }, children);
}

export function Dot({ tone = 'on' }) {
    const isOn = tone === 'on' || tone === 'live';
    const modifierCls = tone === 'live' ? ' ds-dot-live' : (tone === 'warn' ? ' ds-dot-warn' : '');
    const cls = 'ds-dot ' + (isOn ? 'ds-dot-on' : 'ds-dot-off') + modifierCls;
    const statusLabel = tone === 'live' ? 'live status indicator' : (tone === 'warn' ? 'warning status indicator' : (isOn ? 'on status indicator' : 'off status indicator'));
    return h('span', { class: cls, role: 'img', 'aria-label': statusLabel });
}

export function Rail({ tone = 'green' }) {
    return h('span', { class: 'ds-rail tone-' + tone, 'aria-hidden': 'true' });
}
