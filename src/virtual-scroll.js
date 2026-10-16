
import { register as registerDebug } from './debug.js';

const DEFAULT_ESTIMATE_PX = 72;
const DEFAULT_OVERSCAN = 6;
let _instanceCounter = 0;

export function createVirtualizer({ estimateHeight = DEFAULT_ESTIMATE_PX, overscan = DEFAULT_OVERSCAN } = {}) {
    const heights = new Map();
    let itemCount = 0;

    function heightOf(i) {
        return heights.has(i) ? heights.get(i) : estimateHeight;
    }

    function offsetOf(i) {
        let sum = 0;
        for (let k = 0; k < i; k++) sum += heightOf(k);
        return sum;
    }

    function totalHeight() {
        return offsetOf(itemCount);
    }

    function setCount(n) {
        itemCount = n;
        for (const k of heights.keys()) if (k >= n) heights.delete(k);
    }

    function reportHeight(i, px) {
        const prev = heights.get(i);
        if (prev != null && Math.abs(prev - px) < 1) return false;
        heights.set(i, px);
        return true;
    }

    function computeRange(scrollTop, viewportHeight) {
        if (itemCount === 0) return { startIndex: 0, endIndex: 0, topSpacerPx: 0, bottomSpacerPx: 0 };
        let acc = 0;
        let startIndex = 0;
        for (; startIndex < itemCount; startIndex++) {
            const h = heightOf(startIndex);
            if (acc + h > scrollTop) break;
            acc += h;
        }
        const topSpacerPx = acc;
        let endIndex = startIndex;
        let visibleAcc = 0;
        for (; endIndex < itemCount; endIndex++) {
            if (visibleAcc > viewportHeight) break;
            visibleAcc += heightOf(endIndex);
        }
        startIndex = Math.max(0, startIndex - overscan);
        endIndex = Math.min(itemCount, endIndex + overscan);
        const topSpacer = offsetOf(startIndex);
        const bottomSpacer = totalHeight() - offsetOf(endIndex);
        return { startIndex, endIndex, topSpacerPx: topSpacer, bottomSpacerPx: Math.max(0, bottomSpacer) };
    }

    function preserveScrollOnPrepend(prevScrollTop, prevScrollHeight, newScrollHeight) {
        return prevScrollTop + (newScrollHeight - prevScrollHeight);
    }

    const instanceId = 'virtualizer-' + (_instanceCounter++);
    registerDebug(instanceId, () => ({ itemCount, measuredCount: heights.size, totalHeightPx: totalHeight() }));

    return { setCount, reportHeight, computeRange, totalHeight, heightOf, preserveScrollOnPrepend };
}

export function measureRef(virtualizer, index) {
    return (el) => {
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect?.height;
            if (h != null) virtualizer.reportHeight(index, h);
        });
        ro.observe(el);
        el.__vsResizeObserver = ro;
    };
}
