import * as webjsx from '../../vendor/webjsx/index.js';
import { Icon } from '../components/shell.js';
import { surfaceFor } from '../modules/index.js';

const h = webjsx.createElement;

export const isModalSurface = (name) => { const x = surfaceFor(name); return !!x && x.placement === 'modal'; };

export function createSurfaces(app) {
    const { A } = app;

    const surfaceBody = (name, s) => {
        const x = surfaceFor(name);
        return x && x.body ? x.body({ s, A, h }) : null;
    };

    const popoverView = (s) => {
        const x = surfaceFor(s.gameSurface);
        if (!x || x.placement !== 'popover') return null;
        return h('div', { class: 'ds-g3-pop-wrap' }, h('div', { class: 'ds-g3-pop' },
            h('h3', { class: 'ds-g3-pop-h' }, h('span', {}, x.title), ...(x.head ? x.head({ s, A }) : []), h('span', { class: 'ds-g3-pop-x', role: 'button', tabindex: '0', 'aria-label': 'close', onclick: () => A.closeSurface && A.closeSurface() }, Icon('x', { size: 14 }))),
            h('div', { class: 'ds-g3-pop-body' }, surfaceBody(s.gameSurface, s))));
    };

    return { surfaceBody, popoverView };
}
