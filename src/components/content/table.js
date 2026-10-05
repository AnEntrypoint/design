import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon, Chip } from '../shell.js';
const h = webjsx.createElement;

export function Table({ headers = [], rows = [], onRowClick, emptyText = 'nothing here yet', rowLabels, striped = false, compact = false, sortable = false, sortKey, sortDir = 'asc', onSort, caption }) {
    if (!rows || rows.length === 0) return h('div', { class: 'empty' }, emptyText);
    const labelFor = (row, i) => {
        if (Array.isArray(rowLabels) && rowLabels[i] != null) return String(rowLabels[i]);
        const c = row[0];
        return c == null ? 'row' : (typeof c === 'object' ? 'row' : String(c));
    };
    const wrapClass = 'ds-table-wrap' + (striped ? ' is-striped' : '') + (compact ? ' is-compact' : '');
    const thFor = (hd, i, isNum) => {
        if (!sortable || !onSort) return h('th', { key: i, scope: 'col', class: isNum ? 'is-num' : null }, hd);
        const isActive = sortKey === i;
        const ariaSort = isActive ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none';
        return h('th', { key: i, scope: 'col', 'aria-sort': ariaSort, class: isNum ? 'is-num' : null },
            h('button', { type: 'button', class: 'ds-table-sort-btn' + (isActive ? ' is-active' : ''), onclick: () => onSort(i) },
                h('span', { class: 'ds-table-sort-label' }, hd),
                isActive ? Icon(sortDir === 'desc' ? 'chevron-down' : 'chevron-up', { size: 12 }) : null));
    };
    const NUM_RE = /^-?\d+(\.\d+)?$/;
    const isNumericCol = (j) => rows.every((row) => {
        const c = row[j];
        return c != null && typeof c !== 'object' && NUM_RE.test(String(c).trim());
    });
    const numericCols = headers.map((_, j) => isNumericCol(j));
    return h('div', {
        class: wrapClass,
        tabindex: '0',
        role: 'group',
        'aria-label': 'table, scrollable',
    }, h('table', {},
        caption ? h('caption', {}, caption) : null,
        h('thead', {}, h('tr', {}, ...headers.map((hd, i) => thFor(hd, i, numericCols[i])))),
        h('tbody', {}, ...rows.map((row, i) => h('tr', {
            key: i,
            class: onRowClick ? 'clickable' : '',
            onclick: onRowClick ? () => onRowClick(i) : null,
            ...(onRowClick ? { tabindex: '0', role: 'button', 'aria-label': 'open ' + labelFor(row, i), onkeydown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onRowClick(i); } } } : {})
        }, ...row.map((c, j) => h('td', { key: j, class: numericCols[j] ? 'is-num' : null }, c == null ? '' : (typeof c === 'object' ? c : String(c)))))))));
}

export function HealthTable({ checks = {}, emptyText = 'no health data', okLabel = 'ok', missLabel = 'no', jsonTruncate = 60 } = {}) {
    const entries = Object.entries(checks);
    if (!entries.length) return h('div', { class: 'empty' }, emptyText);
    const rows = entries.map(([name, v]) => {
        let cell;
        if (typeof v === 'object' && v !== null) {
            const s = JSON.stringify(v);
            cell = h('span', { title: s.length > jsonTruncate ? s : null }, s.length > jsonTruncate ? s.slice(0, jsonTruncate) + '…' : s);
        } else if (v === true) cell = Chip({ tone: 'ok', children: okLabel });
        else if (v === false) cell = Chip({ tone: 'miss', children: missLabel });
        else cell = String(v);
        return [name, cell];
    });
    return Table({ headers: ['check', 'status'], rows });
}

export function ProcessRegistryTable({ processes = [], emptyText = 'no live processes', extraColumns = [] } = {}) {
    if (!processes.length) return h('div', { class: 'empty' }, emptyText);
    const headers = ['kind', 'key', 'state', ...extraColumns.map(c => c.header)];
    const rows = processes.map(p => [
        p.kind || '—', p.key || '—', p.state || '—',
        ...extraColumns.map(c => c.render(p))
    ]);
    return Table({ headers, rows });
}
