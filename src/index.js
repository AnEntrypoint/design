import * as webjsx from '../vendor/webjsx/index.js';
import { css, scope } from './styles.js';
import { registerDeckStage, getDeckStage } from './deck-stage.js';
import * as components from './components.js';

let _installed = false;
export function installStyles(target) {
    if (_installed && !target) return;
    const root = target || document.head;
    const tag = document.createElement('style');
    tag.setAttribute('data-247420', '');
    tag.textContent = css;
    root.appendChild(tag);
    if (!target) _installed = true;
}

export function mount(rootEl, viewFn, { autoScope = true } = {}) {
    if (autoScope && rootEl && rootEl.classList && !rootEl.classList.contains(scope.slice(1))) {
        rootEl.classList.add(scope.slice(1));
    }
    const render = () => webjsx.applyDiff(rootEl, viewFn(render));
    render();
    return render;
}

export { webjsx, css, scope, registerDeckStage, getDeckStage, components };
export const h = webjsx.createElement;
export const applyDiff = webjsx.applyDiff;
export default { webjsx, css, scope, installStyles, mount, h, applyDiff, registerDeckStage, getDeckStage, components };
