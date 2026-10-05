import { attempt } from '../../best-effort.js';

const DRAG_THRESHOLD = 5;

function dispatchDrag(el, detail) {
    el.dispatchEvent(new CustomEvent('ds-drag', { detail, bubbles: true, composed: true }));
}

export function useDraggable(el, { data, kind, onDragStart, onDragEnd } = {}) {
    if (!el) return { destroy() {} };
    let startX = 0, startY = 0, active = false, started = false, pid = null;
    let kbMode = false, kbTargets = [], kbIdx = 0;

    const onMove = (e) => {
        if (!active) return;
        if (!started) {
            const dx = e.clientX - startX, dy = e.clientY - startY;
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            started = true;
            el.setAttribute('data-dragging', 'true');
            if (onDragStart) onDragStart({ data, kind, pointerEvent: e });
        }
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const target = hit && hit.closest('[data-drop-target]');
        dispatchDrag(el, { phase: 'move', data, kind, pointerEvent: e, target });
    };
    const onUp = (e) => {
        if (!active) return;
        const wasStarted = started;
        active = false; started = false;
        attempt(() => { if (pid != null) el.releasePointerCapture(pid); });
        pid = null;
        el.removeAttribute('data-dragging');
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const target = hit && hit.closest('[data-drop-target]');
        dispatchDrag(el, { phase: 'end', data, kind, pointerEvent: e, target });
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (wasStarted && onDragEnd) onDragEnd({ drop: target, data, kind });
    };
    const onDown = (e) => {
        if (e.button != null && e.button !== 0) return;
        active = true; started = false;
        startX = e.clientX; startY = e.clientY; pid = e.pointerId;
        attempt(() => { el.setPointerCapture(e.pointerId); });
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    };
    const clearActive = () => kbTargets.forEach(n => n.removeAttribute('data-drop-target-active'));
    const onKey = (e) => {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (!kbMode) {
                kbMode = true; kbIdx = 0;
                kbTargets = Array.from(document.querySelectorAll('[data-drop-target]'));
                el.setAttribute('data-dragging', 'true');
                if (onDragStart) onDragStart({ data, kind, pointerEvent: null });
                if (kbTargets[0]) kbTargets[0].setAttribute('data-drop-target-active', 'true');
            } else {
                const t = kbTargets[kbIdx];
                kbMode = false; el.removeAttribute('data-dragging'); clearActive();
                if (t) dispatchDrag(el, { phase: 'end', data, kind, pointerEvent: null, target: t });
                if (onDragEnd) onDragEnd({ drop: t, data, kind });
            }
        } else if (kbMode && /^Arrow/.test(e.key)) {
            e.preventDefault();
            const dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
            clearActive();
            kbIdx = (kbIdx + dir + kbTargets.length) % kbTargets.length;
            if (kbTargets[kbIdx]) kbTargets[kbIdx].setAttribute('data-drop-target-active', 'true');
        } else if (kbMode && e.key === 'Escape') {
            e.preventDefault(); kbMode = false; el.removeAttribute('data-dragging'); clearActive();
        }
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('keydown', onKey);
    return { destroy() {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('keydown', onKey);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
    }};
}

export function useNumberScrub(el, { getValue, onChange, step = 0.01, threshold = 3 } = {}) {
    if (!el) return { destroy() {} };
    el.style.touchAction = 'none';
    let pid = null, startX = 0, startV = 0, moved = false;
    const onMove = (e) => {
        if (pid == null) return;
        const dx = e.clientX - startX;
        if (!moved) {
            if (Math.abs(dx) < threshold) return;
            moved = true;
            el.setAttribute('data-scrubbing', 'true');
            if (document.activeElement === el) el.blur();
        }
        const v = startV + dx * step;
        if (onChange) onChange(v);
    };
    const onUp = () => {
        if (pid == null) return;
        attempt(() => { el.releasePointerCapture(pid); });
        pid = null;
        el.removeAttribute('data-scrubbing');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
    };
    const onDown = (e) => {
        if (e.button != null && e.button !== 0) return;
        if (document.activeElement === el) return;
        pid = e.pointerId; startX = e.clientX; moved = false;
        const cur = getValue ? getValue() : parseFloat(el.value);
        startV = Number.isFinite(cur) ? cur : 0;
        attempt(() => { el.setPointerCapture(pid); });
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    };
    el.addEventListener('pointerdown', onDown);
    return { destroy() {
        el.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
    }};
}

export function usePointerDrag(el, { onStart, onMove, onEnd, button = 0 } = {}) {
    if (!el) return { destroy() {} };
    let pid = null;
    const onMoveEv = (e) => {
        if (pid == null || e.pointerId !== pid) return;
        if (onMove) onMove(e);
    };
    const finish = (e, cancelled) => {
        if (pid == null) return;
        attempt(() => { el.releasePointerCapture(pid); });
        pid = null;
        el.removeAttribute('data-pointer-dragging');
        window.removeEventListener('pointermove', onMoveEv);
        window.removeEventListener('pointerup', onUpEv);
        window.removeEventListener('pointercancel', onCancelEv);
        if (onEnd) onEnd(e, cancelled);
    };
    const onUpEv = (e) => { if (e.pointerId === pid) finish(e, false); };
    const onCancelEv = (e) => { if (e.pointerId === pid) finish(e, true); };
    const onDown = (e) => {
        if (button != null && e.button != null && e.button !== button) return;
        if (pid != null) return;
        if (onStart && onStart(e) === false) return;
        pid = e.pointerId;
        el.setAttribute('data-pointer-dragging', 'true');
        attempt(() => { el.setPointerCapture(pid); });
        window.addEventListener('pointermove', onMoveEv);
        window.addEventListener('pointerup', onUpEv);
        window.addEventListener('pointercancel', onCancelEv);
    };
    el.addEventListener('pointerdown', onDown);
    return { destroy() {
        el.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMoveEv);
        window.removeEventListener('pointerup', onUpEv);
        window.removeEventListener('pointercancel', onCancelEv);
    }, get dragging() { return pid != null; } };
}

export function useDropTarget(el, { accepts = [], onDrop, onDragOver } = {}) {
    if (!el) return { destroy() {} };
    el.setAttribute('data-drop-target', '');
    const handler = (e) => {
        const d = e.detail; if (!d) return;
        if (accepts.length && !accepts.includes(d.kind)) return;
        if (d.target !== el) {
            el.removeAttribute('data-drop-target-active');
            return;
        }
        if (d.phase === 'move') {
            el.setAttribute('data-drop-target-active', 'true');
            if (onDragOver) onDragOver({ data: d.data, kind: d.kind, pointerEvent: d.pointerEvent });
        } else if (d.phase === 'end') {
            el.removeAttribute('data-drop-target-active');
            if (onDrop) onDrop({ data: d.data, kind: d.kind, pointerEvent: d.pointerEvent });
        }
    };
    document.addEventListener('ds-drag', handler, true);
    return { destroy() {
        document.removeEventListener('ds-drag', handler, true);
        el.removeAttribute('data-drop-target');
        el.removeAttribute('data-drop-target-active');
    }};
}
