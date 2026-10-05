import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function avatarInitial(name, count = 1) {
    return name ? String(name).trim().slice(0, count).toUpperCase() || '?' : '?';
}

export function avatarContrastFg(color) {
    if (!color) return null;
    let resolved = String(color).trim();
    const varRef = /^var\(\s*(--[\w-]+)\s*(?:,.*)?\)$/i.exec(resolved);
    if (varRef && typeof document !== 'undefined' && document.documentElement) {
        const cssValue = getComputedStyle(document.documentElement).getPropertyValue(varRef[1]).trim();
        if (cssValue) resolved = cssValue;
    }
    let r, g, b;
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(resolved);
    if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
    } else {
        const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(resolved);
        if (!rgb) return null;
        r = +rgb[1]; g = +rgb[2]; b = +rgb[3];
    }
    const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const contrastWhite = 1.05 / (L + 0.05);
    const contrastBlack = (L + 0.05) / 0.05;
    return contrastWhite >= contrastBlack ? '#fff' : '#000';
}

export function Avatar({ name, src, fallback, size = 'md', shape = 'circle', initialsCount = 1, key } = {}) {
    const letter = fallback != null ? fallback : avatarInitial(name, initialsCount);
    const cls = 'ds-avatar ds-avatar-' + size + (shape === 'square' ? ' ds-avatar-square' : '');
    if (src) return h('img', { key, class: cls, src, alt: name || '', loading: 'lazy' });
    return h('span', { key, class: cls, 'aria-hidden': !!name, role: name ? 'img' : undefined, 'aria-label': name || undefined }, letter);
}
