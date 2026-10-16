
import * as webjsx from '../../../vendor/webjsx/index.js';
import { kids } from './shared.js';
import { attempt } from '../../best-effort.js';
const h = webjsx.createElement;

const PERCENT = 100;

export function ResizeHandle({ axis = 'horizontal', onResize, ariaLabel, getValue } = {}) {
    const isH = axis === 'horizontal';
    let dragOrigin = null;
    let handleEl = null;
    const step = 8;
    const syncValue = () => {
        if (!handleEl || !getValue) return;
        const v = getValue();
        if (!v) return;
        handleEl.setAttribute('aria-valuenow', String(v.now));
        handleEl.setAttribute('aria-valuemin', String(v.min));
        handleEl.setAttribute('aria-valuemax', String(v.max));
    };
    const emit = (dx, dy) => {
        if (onResize) onResize(isH ? dx : dy);
        syncValue();
    };
    const onPointerDown = (e) => {
        e.preventDefault();
        dragOrigin = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!dragOrigin) return;
        const dx = e.clientX - dragOrigin.x;
        const dy = e.clientY - dragOrigin.y;
        dragOrigin = { x: e.clientX, y: e.clientY };
        emit(dx, dy);
    };
    const onPointerUp = (e) => {
        dragOrigin = null;
        attempt(() => { e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); });
    };
    const onKeyDown = (e) => {
        const k = e.key;
        if (isH) {
            if (k === 'ArrowLeft') { e.preventDefault(); emit(-step, 0); }
            else if (k === 'ArrowRight') { e.preventDefault(); emit(step, 0); }
            else if (k === 'Home') { e.preventDefault(); emit(-1e6, 0); }
            else if (k === 'End') { e.preventDefault(); emit(1e6, 0); }
        } else {
            if (k === 'ArrowUp') { e.preventDefault(); emit(0, -step); }
            else if (k === 'ArrowDown') { e.preventDefault(); emit(0, step); }
            else if (k === 'Home') { e.preventDefault(); emit(0, -1e6); }
            else if (k === 'End') { e.preventDefault(); emit(0, 1e6); }
        }
    };
    return h('div', {
        class: 'ds-ep-resize ' + (isH ? 'axis-h' : 'axis-v'),
        role: 'separator',
        tabindex: '0',
        'aria-orientation': isH ? 'vertical' : 'horizontal',
        'aria-label': ariaLabel || 'Resize',
        'aria-valuenow': String(PERCENT / 2),
        'aria-valuemin': '0',
        'aria-valuemax': String(PERCENT),
        ref: (el) => { handleEl = el; if (el) requestAnimationFrame(syncValue); },
        onpointerdown: onPointerDown,
        onpointermove: onPointerMove,
        onpointerup: onPointerUp,
        onpointercancel: onPointerUp,
        onkeydown: onKeyDown,
    });
}

export function SplitPanel({ orientation = 'horizontal', initial = '50%', min = 80, max = Infinity, children } = {}) {
    const isH = orientation === 'horizontal';
    const ks = kids(children);
    const first = ks[0] || null;
    const second = ks[1] || null;
    const sizeProp = isH ? 'width' : 'height';
    const initStyle = typeof initial === 'number' ? initial + 'px' : initial;
    let rootEl = null;
    let draggedSize = null;
    const applySize = (a) => {
        if (!a) return;
        if (draggedSize != null) { a.style[sizeProp] = draggedSize + 'px'; a.style.flex = '0 0 auto'; }
    };
    const onResize = (delta) => {
        if (!rootEl) return;
        const a = rootEl.firstChild;
        if (!a) return;
        const rect = a.getBoundingClientRect();
        const curr = isH ? rect.width : rect.height;
        const total = isH ? rootEl.getBoundingClientRect().width : rootEl.getBoundingClientRect().height;
        const next = Math.max(min, Math.min(max === Infinity ? total - min : max, curr + delta));
        draggedSize = next;
        a.style[sizeProp] = next + 'px';
        a.style.flex = '0 0 auto';
    };
    const getValue = () => {
        if (!rootEl || !rootEl.firstChild) return null;
        const paneRect = rootEl.firstChild.getBoundingClientRect();
        const rootRect = rootEl.getBoundingClientRect();
        const total = isH ? rootRect.width : rootRect.height;
        if (!total) return null;
        const toPercent = (px) => Math.round(px / total * PERCENT);
        const upper = max === Infinity ? total - min : max;
        return { now: toPercent(isH ? paneRect.width : paneRect.height), min: toPercent(min), max: toPercent(upper) };
    };
    return h('div', {
        class: 'ds-ep-split ' + (isH ? 'horiz' : 'vert'),
        ref: (el) => { rootEl = el; }
    },
        h('div', { class: 'ds-ep-split-pane', style: '--split-size:' + initStyle + ';flex:0 0 auto', ref: applySize }, first),
        ResizeHandle({ axis: isH ? 'horizontal' : 'vertical', onResize, getValue }),
        h('div', { class: 'ds-ep-split-pane grow', style: 'flex:1 1 0;min-' + sizeProp + ':0' }, second)
    );
}
