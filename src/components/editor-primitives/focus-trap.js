
import * as webjsx from '../../../vendor/webjsx/index.js';
import { kids, FOCUSABLE_SEL, trapTabKey } from './shared.js';
const h = webjsx.createElement;

export function FocusTrap({ children } = {}) {
    return h('div', {
        class: 'ds-ep-focustrap',
        tabindex: '-1',
        ref: (el) => {
            if (!el || el._dsTrap) return;
            el._dsTrap = true;
            el.addEventListener('keydown', (e) => trapTabKey(el, e));
            setTimeout(() => {
                const first = el.querySelector(FOCUSABLE_SEL);
                if (first) first.focus();
                else el.focus();
            }, 0);
        }
    }, ...kids(children));
}
