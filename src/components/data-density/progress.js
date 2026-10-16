
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function Progress({ value = 0, max = 100, label } = {}) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return h('div', {
        class: 'ds-progress', role: 'progressbar',
        'aria-valuenow': String(value), 'aria-valuemin': '0', 'aria-valuemax': String(max),
        'aria-label': label != null ? String(label) : 'progress',
    },
        label ? h('span', { class: 'ds-progress-label' }, label) : null,
        h('div', { class: 'ds-progress-track' },
            h('div', { class: 'ds-progress-fill', style: `width:${pct}%` })));
}
