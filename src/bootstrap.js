import * as webjsx from '../vendor/webjsx/index.js';
import * as motion from './motion.js';
import { register } from './debug.js';

const ANIMATE_HREF = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
const PRISM_CSS = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css';

export function ensureCdnLink(id, href) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

export function ensureMotionCss() { ensureCdnLink('animate-style-cdn', ANIMATE_HREF); }
export function ensurePrismCss()  { ensureCdnLink('prism-style-cdn', PRISM_CSS); }

export function mountKit({ root, view, screen, animateOnMount = true } = {}) {
    if (!root) throw new Error('mountKit: root required');
    if (typeof view !== 'function') throw new Error('mountKit: view fn required');
    if (screen) document.body.dataset.screenLabel = screen;
    ensureMotionCss();
    ensurePrismCss();
    let scheduled = false;
    const render = () => {
        scheduled = false;
        webjsx.applyDiff(root, view());
        if (animateOnMount) requestAnimationFrame(() => motion.animateTree(root));
    };
    const schedule = () => { if (scheduled) return; scheduled = true; queueMicrotask(render); };
    register('bootstrap', () => ({ screen: screen || null, mounted: !!root.firstChild, root: root.id || root.tagName }));
    render();
    return { render, schedule };
}

export { webjsx };
