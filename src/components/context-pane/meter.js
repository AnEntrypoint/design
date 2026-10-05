
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function ContextMeter({ used = 0, total = 0, segments = [] } = {}) {
    const safeTotal = total > 0 ? total : 1;
    let acc = 0;
    const bars = segments.map((seg, i) => {
        const val = Math.max(0, Number(seg.value) || 0);
        const pct = Math.max(0, Math.min(100, (val / safeTotal) * 100));
        acc += val;
        return h('span', {
            key: seg.id || i,
            class: 'ds-context-meter-seg ds-context-meter-seg-' + (seg.tone || 'other'),
            style: `width:${pct}%`,
            title: `${seg.label || 'segment'}: ${val}`,
        });
    });
    const usedPct = Math.max(0, Math.min(100, (used / safeTotal) * 100));
    return h('div', { class: 'ds-context-meter' },
        h('div', {
            class: 'ds-context-meter-track', role: 'meter',
            'aria-label': 'context usage', 'aria-valuenow': String(used),
            'aria-valuemin': '0', 'aria-valuemax': String(total),
        }, ...bars),
        h('div', { class: 'ds-context-meter-foot' },
            h('span', {}, `${used.toLocaleString()} / ${total.toLocaleString()} tokens`),
            h('span', {}, `${Math.round(usedPct)}%`)));
}
