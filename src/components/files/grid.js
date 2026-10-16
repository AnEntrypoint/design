
import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { FileRow, FileCell, FileSkeleton } from './entries.js';
import { FileSortHeader, DensityPicker } from './grid-controls.js';
import { EmptyState } from './chrome.js';
const h = webjsx.createElement;

const FILE_GRID_CAP = 200;

/**
 * The directory listing.
 *
 * `loading` and `busy` are NOT two spellings of one state: they are the two
 * halves of this SDK's standing distinction, and FileGrid is the component
 * that takes both because it is the one place both are in play at once:
 *
 *   loading: a DATA FETCH is in flight. Owns which SHAPE renders: with no
 *              rows yet it is a cold load and the whole grid is replaced by
 *              FileSkeleton; with rows already on screen it is a refresh and
 *              the existing rows stay mounted and dim (is-refreshing), because
 *              flashing a populated directory back to shimmer reads as data
 *              loss.
 *   busy:    a USER ACTION is in flight (a rename/move/delete round-trip).
 *              Owns INTERACTIVITY, not shape: it is forwarded to each FileRow
 *              as `busy`, which disables that row's open + mutation controls
 *              so a second click cannot fire the same mutation twice.
 *
 * A grid can be `busy` while not `loading` (a delete is posting, rows fully
 * rendered) and `loading` while not `busy` (a plain refresh). Passing one for
 * the other is a real bug, not a style choice, so they are deliberately not
 * merged and neither is an alias of the other.
 *
 * @param {Array} [files=[]] - the directory entries to render.
 * @param {boolean} [loading=false] - a data fetch is in flight (skeleton when cold, dim when refreshing).
 * @param {boolean} [busy] - a user-initiated mutation is in flight; disables every row's controls. Per-entry `f.busy` is used when this is not passed.
 * @param {string} [emptyText='No files here yet'] - copy for the empty/filtered-miss state.
 * @param {'list'|'compact'|'thumb'} [density='list'] - row density; 'thumb' switches to the multi-column cell grid.
 */
export function FileGrid({ files = [], onOpen, onAction, onUp, emptyText = 'No files here yet', emptyAction,
                          sort, filter, loading = false,
                          shown, onShowMore, actions, busy,
                          selectable = false, selected, onToggleSelect,
                          marked = selected, onMark = onToggleSelect,
                          onSelectAll, onClearSelection,
                          density = 'list', onDensity, thumbUrl } = {}) {
    if (loading && !files.length) return FileSkeleton({ rows: 12 });
    const hasFilter = !!(filter && (filter.value || '').length > 0);
    if (!files.length && !hasFilter) return EmptyState({ text: emptyText, glyph: Icon('folder-open', { size: 28 }), action: emptyAction });
    const refreshing = loading && files.length > 0;
    const limit = shown != null ? shown : FILE_GRID_CAP;
    const capped = files.length > limit;
    const visible = capped ? files.slice(0, limit) : files;
    const isThumb = density === 'thumb';
    const gridAttrs = {};
    const entryKeyOf = (f) => f.path || f.name;
    const isLockedEntry = (f) => f.locked || f.permissions === 'EACCES'
        || (Array.isArray(f.permissions) && f.permissions.length === 0);
    const selSet = marked instanceof Set ? marked : new Set(marked || []);
    const selectableKeys = selectable ? visible.filter((f) => !isLockedEntry(f)).map(entryKeyOf) : [];
    const onKeyDown = (e) => {
        const grid = e.currentTarget;
        const opens = Array.from(grid.querySelectorAll('.ds-file-open:not([disabled]), .ds-file-cell-open:not([disabled])'));
        const cur = opens.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); opens[Math.min(opens.length - 1, cur + 1)]?.focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (cur <= 0 ? opens[0] : opens[cur - 1])?.focus(); }
        else if (e.key === 'Home') { e.preventDefault(); opens[0]?.focus(); }
        else if (e.key === 'End') { e.preventDefault(); opens[opens.length - 1]?.focus(); }
        else if (e.key === 'Backspace') { e.preventDefault(); onUp && onUp(); }
        else if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)
                 && selectable && onSelectAll && selectableKeys.length) {
            e.preventDefault(); onSelectAll(selectableKeys);
        }
    };
    const head = sort ? FileSortHeader(sort) : null;
    const selOfVisible = selectableKeys.filter((k) => selSet.has(k)).length;
    const allState = selOfVisible === 0 ? 'false' : (selOfVisible === selectableKeys.length ? 'true' : 'mixed');
    const selectAllCtl = (selectable && onSelectAll && selectableKeys.length)
        ? h('button', { key: 'selall', type: 'button', class: 'ds-file-selectall', role: 'checkbox',
            'aria-checked': allState,
            'aria-label': allState === 'true' ? 'clear selection' : 'select all ' + selectableKeys.length + ' shown files',
            onclick: () => (allState === 'true' && onClearSelection) ? onClearSelection() : onSelectAll(selectableKeys) },
            h('span', { class: 'ds-check-box', 'aria-hidden': 'true' }),
            h('span', {}, 'all'))
        : null;
    const densityCtl = DensityPicker({ density, onDensity });
    const filterCtl = filter ? h('span', { key: 'filterwrap', class: 'ds-file-filter-wrap' },
        h('input', {
            key: 'filter',
            class: 'ds-file-filter-input', type: 'search',
            value: filter.value || '', placeholder: filter.placeholder || 'Filter files',
            'aria-label': filter.placeholder || 'Filter files in this directory',
            oninput: (e) => filter.onInput && filter.onInput(e.target.value),
            onkeydown: (e) => {
                if (e.key === 'Escape' && filter.value) { e.preventDefault(); e.stopPropagation(); filter.onInput && filter.onInput(''); }
            },
        }),
        h('span', { key: 'filtercount', class: 'sr-only', role: 'status', 'aria-live': 'polite' },
            hasFilter ? files.length + (files.length === 1 ? ' file' : ' files') + ' shown' : '')
    ) : null;
    const leftKids = [filterCtl, selectAllCtl, head].filter(Boolean);
    const controlsKids = [
        ...leftKids,
        (leftKids.length && densityCtl) ? h('span', { key: 'spread', class: 'spread' }) : null,
        densityCtl].filter(Boolean);
    const controls = controlsKids.length
        ? h('div', { class: 'ds-file-controls' }, ...controlsKids)
        : null;
    const filteredEmpty = !files.length && hasFilter;
    const grid = filteredEmpty ? EmptyState({ text: emptyText, glyph: Icon('folder-open', { size: 28 }) }) : h('div', {
        class: 'ds-file-grid' + (isThumb ? ' ds-file-grid-thumb' : '') + (refreshing ? ' is-refreshing' : ''),
        role: 'group', 'aria-label': 'files', tabindex: '0',
        'aria-busy': refreshing ? 'true' : 'false',
        'data-density': density || 'list',
        onkeydown: onKeyDown, ...gridAttrs },
        ...visible.map((f, i) => isThumb
            ? FileCell({
                key: f.path || f.name + i, f,
                selectable, selected: selSet.has(entryKeyOf(f)),
                onToggleSelect: onMark ? (opts) => onMark(f, opts) : null,
                onOpen,
                thumb: (thumbUrl && f.type === 'image') ? thumbUrl(f) : null,
            })
            : FileRow({
                key: f.path || f.name + i,
                name: f.name, type: f.type, size: f.size, modified: f.modified, code: f.code, active: f.active,
                permissions: f.permissions, locked: f.locked,
                actions: actions != null ? actions : undefined,
                busy: busy != null ? !!busy : !!f.busy,
                selectable, selected: selSet.has(entryKeyOf(f)),
                onToggleSelect: onMark ? (opts) => onMark(f, opts) : null,
                onOpen: onOpen ? () => onOpen(f) : null,
                onAction: onAction ? (act) => onAction(act, f) : null
            }))
    );
    const more = capped
        ? h('div', { class: 'ds-file-more' },
            h('span', { class: 'ds-file-more-count', role: 'status', 'aria-live': 'polite' },
                'showing ' + visible.length + ' of ' + files.length),
            onShowMore ? h('button', { type: 'button', class: 'ds-file-more-btn',
                onclick: () => onShowMore(Math.min(files.length, limit + FILE_GRID_CAP)) },
                'show ' + Math.min(FILE_GRID_CAP, files.length - limit) + ' more') : null)
        : null;
    return (controls || more)
        ? h('div', { class: 'ds-file-listing' }, controls, grid, more)
        : grid;
}
