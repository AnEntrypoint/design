import * as webjsx from '../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function Game3Lightbox({ src = '', onClose, key } = {}) {
    return h('div', { key, class: 'ds-g3-scrim ds-g3-lb', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image', onclick: () => onClose && onClose() },
        h('div', {},
            h('img', { src, alt: '' }),
            h('a', { href: src, target: '_blank', rel: 'noopener', onclick: (e) => e.stopPropagation() }, 'Open original')));
}
