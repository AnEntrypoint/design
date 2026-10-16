
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
const h = webjsx.createElement;

export function LiveCursorOverlay({ cursors = [] } = {}) {
    return h('div', { class: 'ds-collab-cursor-overlay', 'aria-hidden': 'true' },
        ...cursors.map((c) => h('div', {
            key: c.userId, class: 'ds-collab-cursor', style: `left:${c.x}px;top:${c.y}px;color:${c.color}`,
        },
            Icon('cursor', { size: 18 }),
            c.label ? h('span', { class: 'ds-collab-cursor-label', style: `background:${c.color}` }, c.label) : null)));
}

function rectOf(entry, component) {
    const r = entry.rect || entry;
    const has = (v) => typeof v === 'number' && Number.isFinite(v);
    const left = has(r.left) ? r.left : r.x;
    const top = has(r.top) ? r.top : r.y;
    if (!has(left) || !has(top) || !has(r.width) || !has(r.height)) {
        throw new Error(`${component}: entry needs {rect:{top,left,width,height}} or flat {x,y,width,height}; got ${JSON.stringify(entry)}`);
    }
    return { left, top, width: r.width, height: r.height };
}

export function RemoteSelectionRings({ selections = [] } = {}) {
    return h('div', { class: 'ds-collab-selection-overlay', 'aria-hidden': 'true' },
        ...selections.map((s) => {
            const r = rectOf(s, 'RemoteSelectionRings');
            return h('div', {
                key: s.userId,
                class: 'ds-collab-selection-ring',
                style: `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--ring-color:${s.color}`,
            });
        }));
}

export function RecentEditHighlightFlash({ edits = [] } = {}) {
    return h('div', { class: 'ds-collab-flash-overlay', 'aria-hidden': 'true' },
        ...edits.map((e, i) => {
            const r = rectOf(e, 'RecentEditHighlightFlash');
            return h('div', {
                key: e.timestamp != null ? String(e.timestamp) + i : i,
                class: 'ds-collab-flash',
                style: `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--flash-color:${e.color}`,
            });
        }));
}
