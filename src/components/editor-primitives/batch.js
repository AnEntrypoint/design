
import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export function BatchProgressLabel({ label = 'Processing', done = 0, total = 0, key } = {}) {
    const inFlight = total > 0 && done < total;
    const suffix = total > 0 ? ` (${done}/${total})` : '';
    return h('span', { key, class: 'ds-ep-batchprogress', role: 'status', 'aria-live': inFlight ? 'polite' : 'off' },
        label + suffix);
}

export function formatBatchOutcome({ succeeded = 0, total = 0, failedNames = [], maxNames = 3 } = {}) {
    if (total === 0) return '';
    if (failedNames.length === 0) return `${succeeded}/${total} succeeded`;
    const shown = failedNames.slice(0, maxNames).join(', ');
    const more = failedNames.length > maxNames ? ` and ${failedNames.length - maxNames} more` : '';
    return `${succeeded}/${total} succeeded; failed: ${shown}${more}`;
}

export async function runBatchSequential(items = [], fn, onProgress) {
    const total = items.length;
    let succeeded = 0;
    const failedNames = [];
    for (let i = 0; i < total; i += 1) {
        const item = items[i];
        try {
            await fn(item, i);
            succeeded += 1;
        } catch (err) {
            failedNames.push(item && item.name != null ? item.name : String(item));
        }
        if (onProgress) onProgress({ done: i + 1, total });
    }
    return { succeeded, total, failedNames };
}
