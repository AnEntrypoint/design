import * as webjsx from '../vendor/webjsx/index.js';
import { loadCss, scope } from './styles.js';
import { registerDeckStage, getDeckStage } from './deck-stage.js';
import * as components from './components.js';
import * as motion from './motion.js';

let _installed = false;
export async function installStyles(target) {
    if (_installed && !target) return;
    const css = await loadCss();
    const root = target || document.head;
    const tag = document.createElement('style');
    tag.setAttribute('data-247420', '');
    tag.textContent = css;
    root.appendChild(tag);
    if (!target) motion.installMotion();
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

export { webjsx, loadCss, scope, registerDeckStage, getDeckStage, components, motion };
export const h = webjsx.createElement;
export const applyDiff = webjsx.applyDiff;
export default { webjsx, loadCss, scope, installStyles, mount, h, applyDiff, registerDeckStage, getDeckStage, components, motion };
